import { Box, Plus } from "lucide-react"
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

export default async function ProductsPage() {
  const supabase = await createClient()

  // Fetch products and their packaging rules
  const { data: products, error } = await supabase
    .from('products')
    .select(`
      *,
      product_packaging_rules(
        quantity_used,
        packaging_items(name, sku_internal, unit)
      )
    `)
    .order('created_at', { ascending: false })

  async function addProduct(formData: FormData) {
    "use server"
    const supabaseServer = await createClient()
    const name = formData.get('name') as string
    const sku = formData.get('sku') as string
    const image_url = formData.get('image_url') as string

    // Insert new product. (Make sure image_url column is created in Supabase 'products' table if used frequently)
    const { error } = await supabaseServer.from('products').insert({
      name,
      sku,
      // image_url // Unleash this line after adding `image_url` column to products table 
    })

    if (!error) {
      revalidatePath('/products')
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">Products Catalog</h1>
          <p className="text-muted-foreground">
            Manage WooCommerce SKUs, metadata, and packaging composition rules.
          </p>
        </div>
        
        <Dialog>
          <DialogTrigger render={<Button />}>
            <Plus className="mr-2 w-4 h-4" /> Add Product
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form action={addProduct}>
              <DialogHeader>
                <DialogTitle>Add Product</DialogTitle>
                <DialogDescription>
                  Enter the details mapping to your WooCommerce product.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Name</Label>
                  <Input id="name" name="name" placeholder="Minimalist T-Shirt" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="sku" className="text-right">WooCommerce SKU</Label>
                  <Input id="sku" name="sku" placeholder="TSHIRT-MIN-01" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="image_url" className="text-right">Photo URL (Optional)</Label>
                  <Input id="image_url" name="image_url" placeholder="https://..." className="col-span-3" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit">Save Product</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products && products.length > 0 ? (
          products.map((product) => (
            <div key={product.id} className="rounded-xl border bg-card p-6 shadow-sm flex flex-col hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                 <div className="flex flex-col">
                   <h3 className="font-semibold text-lg">{product.name}</h3>
                   <span className="text-sm font-mono text-muted-foreground">SKU: {product.sku}</span>
                 </div>
                 {product.active ? (
                   <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Active</Badge>
                 ) : (
                   <Badge variant="outline">Inactive</Badge>
                 )}
              </div>
              
              <div className="mt-auto pt-4 border-t">
                <h4 className="text-sm font-medium mb-3 text-muted-foreground">Packaging Recipe</h4>
                {product.product_packaging_rules && product.product_packaging_rules.length > 0 ? (
                  <ul className="space-y-2">
                    {product.product_packaging_rules.map((rule: any, idx: number) => (
                      <li key={idx} className="flex justify-between items-center text-sm bg-muted/50 p-2 rounded-md">
                        <span>{rule.packaging_items?.name}</span>
                        <span className="font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
                          {rule.quantity_used}x {rule.packaging_items?.unit}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm text-muted-foreground italic bg-muted/30 p-3 rounded-md border border-dashed">
                    No packaging items assigned yet.
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full rounded-xl border bg-card p-6 min-h-[300px] flex items-center justify-center shadow-sm">
            <div className="text-center">
              <Box className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <h2 className="text-xl font-semibold">No products found</h2>
              <p className="text-muted-foreground mb-4">
                Define your products to associate them with packaging rules.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
