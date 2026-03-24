import { Box, PackagePlus } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { Badge } from "@/components/ui/badge"
import { CreateProductDialog } from "@/components/products/create-product-dialog"
import { EditProductDialog } from "@/components/products/edit-product-dialog"
import { ManageRecipeDialog } from "@/components/products/manage-recipe-dialog"

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

  // Fetch packaging items to select from inside the Manage Recipe dialog
  const { data: packagingItems } = await supabase
    .from('packaging_items')
    .select('id, name, sku_internal')
    .order('name', { ascending: true })

  async function addProduct(formData: FormData) {
    "use server"
    const supabaseServer = await createClient()
    const name = formData.get('name') as string
    const sku = formData.get('sku') as string
    const image_url = formData.get('image_url') as string

    const { error } = await supabaseServer.from('products').insert({
      name,
      sku,
      image_url: image_url || null
    })

    if (!error) {
      revalidatePath('/products')
    } else {
      throw new Error(error.message)
    }
  }

  async function editProduct(formData: FormData) {
    "use server"
    const supabaseServer = await createClient()
    const id = formData.get('id') as string
    const name = formData.get('name') as string
    const sku = formData.get('sku') as string
    const image_url = formData.get('image_url') as string

    const { error } = await supabaseServer.from('products').update({
      name,
      sku,
      image_url: image_url || null
    }).eq("id", id)

    if (!error) {
      revalidatePath('/products')
    } else {
      throw new Error(error.message)
    }
  }

  async function attachPackaging(formData: FormData) {
    "use server"
    const supabaseServer = await createClient()
    const product_id = formData.get('product_id') as string
    const packaging_item_id = formData.get('packaging_id') as string
    const quantity_used = Number(formData.get('quantity'))

    const { error } = await supabaseServer.from('product_packaging_rules').insert({
      product_id,
      packaging_item_id,
      quantity_used
    })

    if (!error) {
      revalidatePath('/products')
    } else {
      throw new Error(error.message)
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">Products Catalog</h1>
          <p className="text-muted-foreground">
            Manage WooCommerce SKUs, metadata, and packaging composition rules.
          </p>
        </div>
        
        <CreateProductDialog addAction={addProduct} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {products && products.length > 0 ? (
          products.map((product) => (
            <div key={product.id} className="group relative overflow-hidden rounded-2xl border bg-card/50 backdrop-blur-sm p-0 shadow-sm transition-all hover:shadow-md hover:border-border/80 flex flex-col h-full">
              
              <div className="relative h-48 w-full bg-muted/30 border-b overflow-hidden flex items-center justify-center">
                {product.image_url ? (
                  <img 
                     src={product.image_url} 
                     alt={product.name}
                     className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-muted-foreground/40">
                    <Box className="h-10 w-10 mb-2" />
                    <span className="text-xs font-medium uppercase tracking-wider">No Image</span>
                  </div>
                )}
                <div className="absolute top-3 right-3 flex gap-2">
                  {product.active ? (
                    <Badge className="bg-white/90 text-emerald-700 hover:bg-white/90 shadow-sm border-0 font-medium">Active</Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-white/90 shadow-sm border-0">Inactive</Badge>
                  )}
                </div>
              </div>

              <div className="p-5 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-1">
                   <h3 className="font-semibold text-lg tracking-tight line-clamp-1">{product.name}</h3>
                </div>
                <span className="text-sm font-mono text-muted-foreground mb-3">SKU: {product.sku}</span>
                
                <div className="flex items-center gap-2 mb-4">
                  <EditProductDialog product={product} editAction={editProduct} />
                  <ManageRecipeDialog product={product} packagingItems={packagingItems || []} attachAction={attachPackaging} />
                </div>
                
                <div className="mt-auto pt-4 border-t">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Packaging Recipe</h4>
                  </div>
                  
                  {product.product_packaging_rules && product.product_packaging_rules.length > 0 ? (
                    <ul className="space-y-2">
                      {product.product_packaging_rules.map((rule: any, idx: number) => (
                        <li key={idx} className="flex justify-between items-center text-sm bg-muted/40 px-3 py-2 rounded-lg border border-border/50">
                          <span className="font-medium text-foreground/80">{rule.packaging_items?.name}</span>
                          <span className="font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                            {rule.quantity_used}x <span className="text-xs font-normal opacity-70">{rule.packaging_items?.unit}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-sm text-muted-foreground italic bg-muted/20 px-3 py-4 rounded-lg border border-dashed text-center flex flex-col items-center justify-center">
                      <PackagePlus className="h-5 w-5 mb-1 opacity-40" />
                      <span>No recipe defined</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full rounded-2xl border border-dashed bg-card/30 p-12 flex flex-col items-center justify-center shadow-sm">
            <Box className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h2 className="text-xl font-semibold tracking-tight">No products found</h2>
            <p className="text-muted-foreground mb-6 max-w-sm text-center">
              Define your products to associate them with packaging rules and begin syncing with WooCommerce.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
