import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { createClient } from "@supabase/supabase-js"

// Avoid caching webhooks
export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("x-wc-webhook-signature")
    const eventTopic = req.headers.get("x-wc-webhook-topic") || req.headers.get("x-wc-webhook-event") || "order.created"
    
    const body = await req.text()
    
    // Validate WooCommerce HMAC-SHA256 signature if a secret is provided in ENV
    const secret = process.env.WC_WEBHOOK_SECRET
    if (secret && signature) {
      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(body, "utf8")
        .digest("base64")
      
      if (signature !== expectedSignature) {
        console.error("Webhook unauthorized: invalid signature")
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
      }
    }

    const payload = JSON.parse(body)
    
    // Webhook ping validation (Woocommerce sends a ping to test the url)
    if (payload.webhook_id) {
       return NextResponse.json({ success: true, message: "Webhook ping received" }, { status: 200 })
    }

    // Initialize Supabase (with Service Role key or standard client if configured for RLS bypass)
    // Note: It's recommended to use the `supabase_service_role_key` for webhook handlers.
    const supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1. Audit Log: Insert raw webhook payload
    const { data: event, error: insertError } = await supabaseClient
      .from("webhook_events")
      .insert({
        source: "woocommerce",
        event_type: eventTopic,
        external_id: payload.id ? String(payload.id) : null,
        payload: payload,
        processed: false,
      })
      .select("id")
      .single()

    if (insertError) {
      console.error("Failed to save webhook audit log:", insertError)
      return NextResponse.json({ error: "Storage error" }, { status: 500 })
    }

    // 2. We acknowledge receipt so WooCommerce does not timeout.
    // In a production environment, order consumption processing could be decoupled 
    // to a Supabase Function, Edge Function or Chron Jobs. For this MVP, we 
    // could process it inline.
    
    // Example: Process Items here if you wish, or depend on a separate job.
    // processOrderItems(payload) -> deduct stock -> update webhook_events processed = true ...

    return NextResponse.json({ success: true, eventId: event?.id }, { status: 200 })
  } catch (error) {
    console.error("Webhook processing error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
