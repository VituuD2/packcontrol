import { Package, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

export const dynamic = "force-dynamic"

export default async function PackagingPage() {
  const supabase = await createClient()

  const { data: packagingItems, error } = await supabase
    .from('packaging_items')
    .select('*')
    .order('created_at', { ascending: false })

  async function addPackaging(formData: FormData) {
    "use server"
    const supabaseServer = await createClient()
    const name = formData.get('name') as string
    const sku_internal = formData.get('sku_internal') as string
    const unit = formData.get('unit') as string
    const current_stock = Number(formData.get('current_stock'))
    const minimum_stock = Number(formData.get('minimum_stock'))

    const { error } = await supabaseServer.from('packaging_items').insert({
      name,
      sku_internal,
      unit,
      current_stock,
      minimum_stock
    })

    if (!error) {
      revalidatePath('/packaging')
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">Packaging Inventory</h1>
          <p className="text-muted-foreground">
            Manage your boxes, bags, and other packaging materials.
          </p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 w-4 h-4" /> Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form action={addPackaging}>
              <DialogHeader>
                <DialogTitle>Add Packaging</DialogTitle>
                <DialogDescription>
                  Enter the details of the new packaging material below.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Name</Label>
                  <Input id="name" name="name" placeholder="E.g. Box L" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="sku" className="text-right">Internal SKU</Label>
                  <Input id="sku" name="sku_internal" placeholder="BOX-L-01" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="unit" className="text-right">Unit</Label>
                  <Input id="unit" name="unit" defaultValue="un" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="stock" className="text-right">Stock</Label>
                  <Input id="stock" name="current_stock" type="number" defaultValue="0" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="min_stock" className="text-right">Min. Stock</Label>
                  <Input id="min_stock" name="minimum_stock" type="number" defaultValue="10" className="col-span-3" required />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit">Save Settings</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {packagingItems && packagingItems.length > 0 ? (
          packagingItems.map((item) => (
            <div key={item.id} className="rounded-xl border bg-card p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{item.name}</h3>
                  {item.current_stock <= item.minimum_stock && (
                    <Badge variant="destructive">Low Stock</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-4">SKU: {item.sku_internal}</p>
              </div>
              <div className="flex items-center justify-between mt-4 pb-2 border-b">
                <span className="text-muted-foreground text-sm">Target Min</span>
                <span className="font-medium text-sm">{item.minimum_stock} {item.unit}</span>
              </div>
              <div className="flex items-center justify-between mt-2 pt-1">
                <span className="text-muted-foreground">Current Stock</span>
                <span className="text-2xl font-bold">{item.current_stock} <span className="text-sm font-normal text-muted-foreground">{item.unit}</span></span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full rounded-xl border bg-card p-6 min-h-[300px] flex items-center justify-center shadow-sm">
            <div className="text-center">
              <Package className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <h2 className="text-xl font-semibold">No packaging items found</h2>
              <p className="text-muted-foreground mt-1 mb-4">
                Get started by adding your first packaging material.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
