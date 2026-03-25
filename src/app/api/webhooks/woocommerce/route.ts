import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { createClient } from "@supabase/supabase-js"
import { z } from "zod"

// Avoid caching webhooks
export const dynamic = "force-dynamic"

// Light validation for the ingest stage
const WebhookPayloadSchema = z.object({
  id: z.number().optional(),
  number: z.string().optional(),
}).passthrough()

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
    
    // 1. Signature Validation (Critical Sec)
    const secret = process.env.WC_WEBHOOK_SECRET
    if (secret && signature) {
      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(body, "utf8")
        .digest("base64")
      
      if (signature !== expectedSignature) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
      }
    }

    let payload: any = {}
    if (body) {
      try {
        payload = JSON.parse(body)
      } catch (e) {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
      }
    }
    
    // Ping check
    if (payload.webhook_id) {
       return NextResponse.json({ success: true, message: "Webhook ping received" }, { status: 200 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabase = createClient(supabaseUrl!, supabaseKey!)

    // 2. Validate basic structure
    const parsed = WebhookPayloadSchema.safeParse(payload)
    if (!parsed.success) {
       return NextResponse.json({ error: "Malformed payload" }, { status: 400 })
    }

    const externalId = payload.id ? String(payload.id) : null
    
    // 3. Generate Idempotency Key
    // Pattern: source_event_id
    const idempotencyKey = `wc_${eventTopic}_${externalId || crypto.randomUUID()}`

    // 4. Ingest Event (Status: pending)
    // We use upsert on idempotency_key to allow retries from WooCommerce without duplicate rows
    const { data: event, error: insertError } = await supabase
      .from("webhook_events")
      .upsert({
        source: "woocommerce",
        event_type: eventTopic,
        external_id: externalId,
        payload: payload,
        status: 'pending',
        idempotency_key: idempotencyKey,
        next_retry_at: new Date().toISOString()
      }, { onConflict: 'idempotency_key', ignoreDuplicates: true })
      .select("id, status")
      .single()

    // If ignoreDuplicates triggered, event will be null. That's fine, we still return 202.
    
    return NextResponse.json({ 
      success: true, 
      status: 'queued',
      eventId: event?.id 
    }, { status: 202 })

  } catch (error: any) {
    console.error("Webhook ingestion error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
