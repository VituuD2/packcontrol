import { NextRequest, NextResponse } from "next/server"

// Avoid caching
export const dynamic = "force-dynamic"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: NextRequest) {
  try {
    const { consumerKey, consumerSecret } = await req.json()
    // We don't strictly enforce WooCommerce API keys here since we are just reprocessing our native Supabase queue.
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !supabaseKey) {
       return NextResponse.json({ error: "Supabase not configured" }, { status: 500 })
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey)

    // 1. Fetch unprocessed events
    const { data: pendingEvents, error: fetchError } = await supabaseClient
      .from("webhook_events")
      .select("*")
      .in("status", ["pending", "failed"])

    if (fetchError) {
      return NextResponse.json({ error: "Database error", details: fetchError }, { status: 500 })
    }

    let newlyProcessedCount = 0;

    // 2. Reprocess logic (same as webhook route)
    for (const event of pendingEvents || []) {
      const payload = event.payload;
      const orderExternalId = payload?.id ? String(payload.id) : event.external_id;
      
      if (!payload?.line_items || !Array.isArray(payload.line_items)) {
         continue; 
      }

      let isDuplicate = false;
      if (orderExternalId) {
        const { data: existingMovements } = await supabaseClient
          .from("packaging_movements")
          .select("id")
          .eq("source_type", "order")
          .eq("source_id", String(orderExternalId))
          .limit(1);
          
        if (existingMovements && existingMovements.length > 0) {
          isDuplicate = true;
        }
      }

      if (isDuplicate) {
        await supabaseClient.from("webhook_events").update({ status: "processed", processed_at: new Date().toISOString() }).eq("id", event.id);
        continue;
      }

      let successfullyProcessed = true;

      for (const line_item of payload.line_items) {
        const itemSku = line_item.sku;
        const purchaseQty = Number(line_item.quantity) || 1;

        if (!itemSku) continue;

        const { data: productData, error: productError } = await supabaseClient
          .from("products")
          .select(`id, sku, product_packaging_rules (packaging_item_id, quantity_used)`)
          .eq("sku", itemSku)
          .single();

        if (productError || !productData) {
          // Auto-registration
          await supabaseClient.from("products").insert({
            sku: itemSku,
            name: line_item.name || "Auto-imported Product",
            active: false
          });
          successfullyProcessed = false;
          continue;
        }

        if (productData.product_packaging_rules && Array.isArray(productData.product_packaging_rules) && productData.product_packaging_rules.length > 0) {
          for (const rule of productData.product_packaging_rules) {
            const deductionAmount = purchaseQty * Number(rule.quantity_used);

            const { data: packagingItemData } = await supabaseClient
              .from("packaging_items")
              .select("current_stock")
              .eq("id", rule.packaging_item_id)
              .single();

            if (!packagingItemData) continue;
            
            const newStock = (Number(packagingItemData.current_stock) || 0) - deductionAmount;

            const { error: updateError } = await supabaseClient
              .from("packaging_items")
              .update({ current_stock: newStock })
              .eq("id", rule.packaging_item_id);

            if (updateError) {
              successfullyProcessed = false;
              continue;
            }

            await supabaseClient
              .from("packaging_movements")
              .insert({
                packaging_item_id: rule.packaging_item_id,
                movement_type: "out",
                quantity: deductionAmount,
                source_type: "order",
                source_id: String(payload.id || payload.number || itemSku)
              });
          }
        } else {
          successfullyProcessed = false;
        }
      }

      if (successfullyProcessed) {
        await supabaseClient
          .from("webhook_events")
          .update({ status: "processed", processed_at: new Date().toISOString() })
          .eq("id", event.id);
        newlyProcessedCount++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: "Sync complete",
      synced_orders: newlyProcessedCount 
    }, { status: 200 })
  } catch (error: any) {
    console.error("Sync error:", error)
    return NextResponse.json({ 
      error: "Internal server error", 
      message: error?.message || String(error) 
    }, { status: 500 })
  }
}
