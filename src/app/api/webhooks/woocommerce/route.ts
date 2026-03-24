import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { createClient } from "@supabase/supabase-js"

// Avoid caching webhooks
export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  return NextResponse.json({ success: true, message: "Webhook endpoint is active" }, { status: 200 })
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Allow": "POST, GET, OPTIONS",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, x-wc-webhook-signature, x-wc-webhook-topic, x-wc-webhook-event",
    },
  })
}

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("x-wc-webhook-signature")
    const eventTopic = req.headers.get("x-wc-webhook-topic") || req.headers.get("x-wc-webhook-event") || "unknown"
    
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

    let payload: any = {}
    if (body) {
      try {
        payload = JSON.parse(body)
      } catch (e) {
        console.warn("Could not parse JSON body")
      }
    }
    
    // Webhook ping validation (Woocommerce sends a ping to test the url)
    if (payload.webhook_id) {
       return NextResponse.json({ success: true, message: "Webhook ping received" }, { status: 200 })
    }

    // Initialize Supabase (with Service Role key or standard client if configured for RLS bypass)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    // Allow the webhook to return 200 even if Supabase is not configured yet (for testing webhooks)
    if (!supabaseUrl || !supabaseKey) {
       console.warn("Supabase not configured, skipping DB insert for webhook.", { payload })
       return NextResponse.json({ success: true, warning: "Supabase not configured" }, { status: 200 })
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey)

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
      return NextResponse.json({ error: "Storage error", details: insertError }, { status: 500 })
    }

    return NextResponse.json({ success: true, eventId: event?.id }, { status: 200 })
  } catch (error: any) {
    console.error("Webhook processing error:", error)
    return NextResponse.json({ error: "Internal server error", message: error?.message || String(error) }, { status: 500 })
  }
}
