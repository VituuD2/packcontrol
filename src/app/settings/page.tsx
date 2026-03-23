import { Settings, Save, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto py-2">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Configuration</h1>
        <p className="text-muted-foreground">
          Manage system preferences and integration keys.
        </p>
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
                  <Label htmlFor="consumerKey">WooCommerce API Key</Label>
                  <Input id="consumerKey" type="password" placeholder="ck_..." />
               </div>
               <div className="space-y-2">
                  <Label htmlFor="consumerSecret">WooCommerce API Secret</Label>
                  <Input id="consumerSecret" type="password" placeholder="cs_..." />
               </div>
             </div>
             <div className="space-y-2">
                  <Label htmlFor="webhookSecret">Webhook Verification Secret</Label>
                  <Input id="webhookSecret" type="password" placeholder="Secret configured in WooCommerce" />
             </div>
          </CardContent>
          <CardFooter className="border-t bg-muted/20 px-6 py-4 flex justify-end">
             <Button><Save className="w-4 h-4 mr-2" /> Save Integration Settings</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
