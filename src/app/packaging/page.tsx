import { Package } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { Badge } from "@/components/ui/badge"
import { CreatePackagingDialog } from "@/components/packaging/create-packaging-dialog"

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
    const image_url = formData.get('image_url') as string

    const { error } = await supabaseServer.from('packaging_items').insert({
      name,
      sku_internal,
      unit,
      current_stock,
      minimum_stock,
      image_url: image_url || null
    })

    if (!error) {
      revalidatePath('/packaging')
    } else {
      throw new Error(error.message)
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">Packaging Inventory</h1>
          <p className="text-muted-foreground">
            Manage your boxes, bags, and other packaging materials.
          </p>
        </div>

        <CreatePackagingDialog addAction={addPackaging} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {packagingItems && packagingItems.length > 0 ? (
          packagingItems.map((item) => (
            <div key={item.id} className="group overflow-hidden rounded-2xl border bg-card/50 backdrop-blur-sm p-0 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-border/80 transition-all">
              
              <div className="flex items-center p-5 border-b bg-muted/10 gap-4">
                <div className="w-16 h-16 rounded-xl bg-muted overflow-hidden flex-shrink-0 border flex items-center justify-center relative">
                   {item.image_url ? (
                     <img src={item.image_url} alt={item.name} className="object-cover w-full h-full" />
                   ) : (
                     <Package className="w-6 h-6 text-muted-foreground/40" />
                   )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-lg tracking-tight truncate">{item.name}</h3>
                  </div>
                  <p className="text-sm border bg-background/50 inline-block px-1.5 py-0.5 rounded text-muted-foreground mt-1 font-mono tracking-tight">
                    {item.sku_internal}
                  </p>
                </div>
              </div>

              <div className="p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border/50">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">Current Stock</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold tracking-tight">{item.current_stock}</span>
                      <span className="text-sm font-medium text-muted-foreground">{item.unit}</span>
                    </div>
                  </div>
                  
                  <div className="h-10 w-[1px] bg-border/80"></div>
                  
                  <div className="flex flex-col text-right">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">Target Min</span>
                    <div className="flex items-baseline justify-end gap-1">
                      <span className="text-lg font-semibold tracking-tight text-foreground/80">{item.minimum_stock}</span>
                    </div>
                  </div>
                </div>

                {item.current_stock <= item.minimum_stock ? (
                  <Badge variant="destructive" className="justify-center py-1.5 shadow-sm font-medium tracking-wide">
                    ⚠️ Low Stock Alert
                  </Badge>
                ) : (
                  <Badge variant="outline" className="justify-center py-1.5 border-emerald-200 bg-emerald-50 text-emerald-600 font-medium tracking-wide">
                    Stock Healthy
                  </Badge>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full rounded-2xl border border-dashed bg-card/30 p-12 flex flex-col items-center justify-center shadow-sm">
            <Package className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h2 className="text-xl font-semibold tracking-tight">No packaging items found</h2>
            <p className="text-muted-foreground mt-1 mb-6 max-w-sm text-center">
              Get started by adding your first packaging material to the inventory system.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

