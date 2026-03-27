import { NextRequest, NextResponse } from "next/server"

// Avoid caching
export const dynamic = "force-dynamic"
import { createClient } from "@supabase/supabase-js"
import { processWebhookEvent } from "@/lib/services/webhook-processor"

export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !supabaseKey) {
       return NextResponse.json({ error: "Supabase not configured" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Fetch all pending/failed events
    const { data: pendingEvents, error: fetchError } = await supabase
      .from("webhook_events")
      .select("id, status")
      .in("status", ["pending", "failed"])
      .order("created_at", { ascending: true })

    if (fetchError) {
      return NextResponse.json({ error: "Database error", details: fetchError }, { status: 500 })
    }

    const results = {
      total: pendingEvents?.length || 0,
      success: 0,
      failed: 0,
      details: [] as any[]
    }

    for (const event of pendingEvents || []) {
      try {
        await processWebhookEvent(supabase, event.id)
        results.success++
      } catch (err: any) {
        results.failed++
        results.details.push({ id: event.id, error: err.message })
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: "Sync complete",
      synced_orders: results.success,
      total: results.total,
      failed: results.failed,
      details: results.details
    }, { status: 200 })
  } catch (error: any) {
    console.error("Sync error:", error)
    return NextResponse.json({ 
      error: "Internal server error", 
      message: error?.message || String(error) 
    }, { status: 500 })
  }
}
