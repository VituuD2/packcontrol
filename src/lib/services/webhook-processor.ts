import { SupabaseClient } from "@supabase/supabase-js"
import { z } from "zod"

// Zod schema for WooCommerce line items
const LineItemSchema = z.object({
  id: z.union([z.number(), z.string()]).optional(),
  name: z.string().optional(),
  product_id: z.union([z.number(), z.string()]).optional(),
  variation_id: z.union([z.number(), z.string()]).optional(),
  quantity: z.coerce.number(),
  sku: z.string().nullable().optional(),
})

const OrderPayloadSchema = z.object({
  id: z.coerce.number(),
  number: z.union([z.number(), z.string()]).optional(),
  status: z.string().optional(),
  line_items: z.array(LineItemSchema).optional().default([]),
})

export type WebhookEventStatus = 'pending' | 'processing' | 'processed' | 'failed'

export async function processWebhookEvent(supabase: SupabaseClient, eventId: string) {
  // 1. Fetch event and lock it for processing
  const { data: event, error: fetchError } = await supabase
    .from('webhook_events')
    .select('*')
    .eq('id', eventId)
    .single()

  if (fetchError || !event) {
    throw new Error(`Event ${eventId} not found`)
  }

  if (event.status === 'processed') {
    return { success: true, message: 'Already processed' }
  }

  try {
    const payload = event.payload as any
    const eventType = event.event_type

    // We only process order transitions to 'processing' or 'created'
    if (eventType === 'order.created' || eventType === 'order.updated' || eventType.includes('order')) {
      // Defensive check: Ensure we have a payload that looks like an order
      if (!payload || typeof payload !== 'object' || (!payload.id && !payload.number)) {
         await supabase.from('webhook_events').update({
            status: 'processed', // Skip if it's not processable as an order
            last_error: `Skipped: Payload missing typical order fields (ID/Number). Event type: ${eventType}`
         }).eq('id', eventId)
         return { success: true, message: 'Skipped malformed or non-order payload' }
      }

      const parsedOrder = OrderPayloadSchema.parse(payload)
      const orderExternalId = String(parsedOrder.id)

      // 2. Idempotency Check: Verify if we already have movements for this order id
      // This is our secondary safety net
      const { data: existingMovements, error: movementError } = await supabase
        .from('packaging_movements')
        .select('id')
        .eq('source_type', 'order')
        .eq('source_id', orderExternalId)
        .limit(1)

      if (existingMovements && existingMovements.length > 0) {
        await supabase.from('webhook_events').update({ 
          status: 'processed', 
          processed_at: new Date().toISOString() 
        }).eq('id', eventId)
        return { success: true, message: 'Duplicate order detected via movements' }
      }

      // 3. Process Line Items
      let allItemsProcessed = true
      let errorMessages: string[] = []

      for (const line_item of parsedOrder.line_items) {
        const itemSku = line_item.sku
        const purchaseQty = line_item.quantity

        if (!itemSku) continue

        // Fetch product and rules
        const { data: productData, error: productError } = await supabase
          .from("products")
          .select(`
            id, 
            sku,
            product_packaging_rules (
              packaging_item_id,
              quantity_used
            )
          `)
          .eq("sku", itemSku)
          .single()

        if (productError || !productData) {
          // Auto-registration if missing (behavior preserved from original)
          await supabase.from("products").upsert({
            sku: itemSku,
            name: line_item.name || "Auto-imported Product",
            active: false
          }, { onConflict: 'sku' })
          
          allItemsProcessed = false
          errorMessages.push(`Sku ${itemSku} not configured or missing rules`)
          continue
        }

        const rules = productData.product_packaging_rules
        if (!rules || !Array.isArray(rules) || rules.length === 0) {
          allItemsProcessed = false
          errorMessages.push(`Sku ${itemSku} has no packaging rules`)
          continue
        }

        // 4. Update stocks and log movements
        for (const rule of rules) {
          const deductionAmount = purchaseQty * Number(rule.quantity_used)

          // We use a simple update with calculated value here.
          // In a high-concurrency environment, a Postgres function (RPC) 
          // with "UPDATE ... SET stock = stock - delta" would be safer.
          const { data: item, error: itemError } = await supabase
             .from('packaging_items')
             .select('current_stock')
             .eq('id', rule.packaging_item_id)
             .single()
          
          if (itemError || !item) continue

          const newStock = (Number(item.current_stock) || 0) - deductionAmount

          // Update stock
          const { error: updateError } = await supabase
            .from("packaging_items")
            .update({ current_stock: newStock })
            .eq("id", rule.packaging_item_id)

          if (updateError) {
            allItemsProcessed = false
            errorMessages.push(`Failed to update stock for rule ${rule.packaging_item_id}`)
            continue
          }

          // Ledger entry
          await supabase
            .from("packaging_movements")
            .insert({
              packaging_item_id: rule.packaging_item_id,
              movement_type: "out",
              quantity: deductionAmount,
              source_type: "order",
              source_id: orderExternalId,
              notes: `Order ${parsedOrder.number || orderExternalId}`
            })
        }
      }

      if (!allItemsProcessed) {
        throw new Error(errorMessages.join('; '))
      }
    }

    // 5. Finalize Event
    await supabase.from('webhook_events').update({
      status: 'processed',
      processed_at: new Date().toISOString(),
      last_error: null
    }).eq('id', eventId)

    return { success: true }
  } catch (error: any) {
    console.error(`Error processing event ${eventId}:`, error)
    
    // Update event with error info for retry
    const nextRetry = new Date()
    // Exponential backoff approx: minutes = 2 ^ attempts
    const minutesToWait = Math.pow(2, (event.attempts || 0) + 1)
    nextRetry.setMinutes(nextRetry.getMinutes() + minutesToWait)

    await supabase.from('webhook_events').update({
      status: 'failed',
      attempts: (event.attempts || 0) + 1,
      last_error: error.message || String(error),
      next_retry_at: nextRetry.toISOString()
    }).eq('id', eventId)

    throw error
  }
}
