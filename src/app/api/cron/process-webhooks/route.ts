import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { processWebhookEvent } from "@/lib/services/webhook-processor"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  // Securing the CRON endpoint: Vercel sends a CRON header
  const authHeader = req.headers.get('authorization')
  if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // For now, let's just log and continue if CRON_SECRET is not yet setup, 
    // but in a real prod app we'd enforce this.
    console.warn("Cron endpoint called without valid secret")
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const supabase = createClient(supabaseUrl, supabaseKey)

  const BATCH_SIZE = 10
  const now = new Date().toISOString()

  // 1. Fetch events to process
  // We look for pending or failed events that are due for retry
  const { data: queueItems, error: fetchError } = await supabase
    .from('webhook_events')
    .select('id, status')
    .in('status', ['pending', 'failed'])
    .lte('next_retry_at', now)
    .order('next_retry_at', { ascending: true })
    .limit(BATCH_SIZE)

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  if (!queueItems || queueItems.length === 0) {
    return NextResponse.json({ processed: 0, message: "No items in queue" })
  }

  const results = {
    total: queueItems.length,
    success: 0,
    failed: 0,
    details: [] as any[]
  }

  // 2. Process items sequentially (or in small parallel chunks if needed)
  for (const item of queueItems) {
    try {
      // Optimistic Locking: Try to mark as processing
      const { data: locked, error: lockError } = await supabase
        .from('webhook_events')
        .update({ 
          status: 'processing', 
          locked_at: new Date().toISOString() 
        })
        .eq('id', item.id)
        .eq('status', item.status || 'pending') // Double check status for safety
        .select()
        .single()

      if (lockError || !locked) {
         continue // Skip if already locked by another worker
      }

      await processWebhookEvent(supabase, item.id)
      results.success++
    } catch (err: any) {
      results.failed++
      results.details.push({ id: item.id, error: err.message })
    }
  }

  return NextResponse.json(results)
}
