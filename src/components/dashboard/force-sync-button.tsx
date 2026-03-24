"use client"

import { useState } from "react"
import { RefreshCw, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function ForceSyncButton() {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const router = useRouter()

  async function handleSync() {
    setLoading(true)
    setStatus("idle")

    try {
      // Read credentials stored previously in Settings
      const ck = localStorage.getItem("woocommerce_ck")
      const cs = localStorage.getItem("woocommerce_cs")

      const response = await fetch('/api/webhooks/woocommerce/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          consumerKey: ck || "", 
          consumerSecret: cs || "" 
        })
      })

      if (!response.ok) throw new Error("Sync failed")
      
      setStatus("success")
      router.refresh()
      
      setTimeout(() => setStatus("idle"), 4000)
    } catch (err) {
      console.error(err)
      setStatus("error")
      setTimeout(() => setStatus("idle"), 4000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button 
      variant={status === "success" ? "outline" : "default"}
      className="cursor-pointer gap-2 transition-all"
      onClick={handleSync}
      disabled={loading}
    >
      {loading ? (
        <RefreshCw className="h-4 w-4 animate-spin" />
      ) : status === "success" ? (
        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
      ) : status === "error" ? (
        <AlertCircle className="h-4 w-4 text-red-500" />
      ) : (
        <RefreshCw className="h-4 w-4" />
      )}
      {loading ? "Syncing..." : status === "success" ? "Synced" : status === "error" ? "Failed" : "Force Sync"}
    </Button>
  )
}
