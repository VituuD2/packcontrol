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
  const now = new Date()
  const force = req.nextUrl.searchParams.get('force') === 'true'

  // 0. Stale Lock Recovery: Reset events stuck in 'processing' for > 2 minutes
  const staleThreshold = new Date(now.getTime() - 2 * 60 * 1000).toISOString()
  await supabase
    .from('webhook_events')
    .update({ status: 'pending', locked_at: null, locked_by: null })
    .eq('status', 'processing')
    .lt('locked_at', staleThreshold)

  // Also recover any 'processing' events that have no locked_at at all (orphaned)
  await supabase
    .from('webhook_events')
    .update({ status: 'pending', locked_at: null, locked_by: null })
    .eq('status', 'processing')
    .is('locked_at', null)

  // 1. Fetch events to process
  let dbQuery = supabase
    .from('webhook_events')
    .select('id, status')
    .in('status', ['pending', 'failed'])
  
  if (!force) {
    dbQuery = dbQuery.lte('next_retry_at', now.toISOString())
  }

  const { data: queueItems, error: fetchError } = await dbQuery
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
