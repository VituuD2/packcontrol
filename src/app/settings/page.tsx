"use client"

import { useState, useEffect } from "react"
import { Settings, Save, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"

export default function SettingsPage() {
  const [consumerKey, setConsumerKey] = useState("")
  const [consumerSecret, setConsumerSecret] = useState("")
  const [webhookSecret, setWebhookSecret] = useState("")
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    // Load from local storage on mount
    const ck = localStorage.getItem("woocommerce_ck")
    const cs = localStorage.getItem("woocommerce_cs")
    const ws = localStorage.getItem("woocommerce_ws")
    if (ck) setConsumerKey(ck)
    if (cs) setConsumerSecret(cs)
    if (ws) setWebhookSecret(ws)
  }, [])

  const handleSave = () => {
    localStorage.setItem("woocommerce_ck", consumerKey)
    localStorage.setItem("woocommerce_cs", consumerSecret)
    localStorage.setItem("woocommerce_ws", webhookSecret)
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 3000)
    
    // Check if we can hit an API to sync these settings to the server
    fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ consumerKey, consumerSecret, webhookSecret })
    }).catch(e => console.log('Optional API error', e))
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto py-2">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Configuration</h1>
      </div>

      <div className="flex flex-col gap-8">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>WooCommerce Integration</CardTitle>
            <CardDescription>
               Connect your WooCommerce store to receive orders dynamically via Webhooks.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
             <div className="rounded-lg bg-blue-50/50 p-4 border border-blue-100 flex items-start gap-3">
                 <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                 <div className="text-sm text-blue-900">
                   <strong>Webhook Setup Info</strong>
                   <p className="mt-1">
                     Configure a new webhook in WooCommerce &gt; Settings &gt; Advanced &gt; Webhooks.<br/>
                     Topic: <strong>Order created</strong><br/>
                     Delivery URL: <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">https://YOUR_DOMAIN/api/webhooks/woocommerce</code><br/>
                     Secret: Generate a unique phrase and paste it below.
                   </p>
                 </div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                  <Label htmlFor="consumerKey">WooCommerce API Key (ck_...)</Label>
                  <Input 
                    id="consumerKey" 
                    type="password" 
                    placeholder="ck_..." 
                    value={consumerKey}
                    onChange={(e) => setConsumerKey(e.target.value)}
                  />
               </div>
               <div className="space-y-2">
                  <Label htmlFor="consumerSecret">WooCommerce API Secret (cs_...)</Label>
                  <Input 
                    id="consumerSecret" 
                    type="password" 
                    placeholder="cs_..." 
                    value={consumerSecret}
                    onChange={(e) => setConsumerSecret(e.target.value)}
                  />
               </div>
             </div>
             <div className="space-y-2">
                  <Label htmlFor="webhookSecret">Webhook Verification Secret</Label>
                  <Input 
                    id="webhookSecret" 
                    type="password" 
                    placeholder="Secret configured in WooCommerce" 
                    value={webhookSecret}
                    onChange={(e) => setWebhookSecret(e.target.value)}
                  />
             </div>
          </CardContent>
          <CardFooter className="border-t bg-muted/20 px-6 py-4 flex justify-between items-center">
             <div className="text-sm font-medium text-emerald-600 h-5">
               {isSaved && "Settings saved successfully!"}
             </div>
             <Button onClick={handleSave} className="cursor-pointer">
               <Save className="w-4 h-4 mr-2" /> 
               Save Integration Settings
             </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
