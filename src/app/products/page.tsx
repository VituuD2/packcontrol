import { Box, PackagePlus, Search, MoreVertical, Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { Badge } from "@/components/ui/badge"
import { SearchInput } from "@/components/ui/search-input"
import { CreateProductDialog } from "@/components/products/create-product-dialog"
import { EditProductDialog } from "@/components/products/edit-product-dialog"
import { ManageRecipeDialog } from "@/components/products/manage-recipe-dialog"
import { getTranslation } from "@/lib/i18n/server"

export const dynamic = "force-dynamic"

export default async function ProductsPage(props: { searchParams: { q?: string } }) {
  const query = props.searchParams?.q || ""

  const supabase = await createClient()
  const t = await getTranslation()

  // Fetch products and their packaging rules
  let dbQuery = supabase
    .from('products')
    .select(`
      *,
      product_packaging_rules(
        quantity_used,
        packaging_items(id, name, sku_internal, current_stock, minimum_stock)
      )
    `)
    .order('created_at', { ascending: false })

  if (query) {
    dbQuery = dbQuery.or(`name.ilike.%${query}%,sku.ilike.%${query}%`)
  }
  
  const { data: products, error } = await dbQuery

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
    let image_url = formData.get('image_url') as string
    const image_file = formData.get('image_file') as File

    // Handle File Upload to Supabase Storage if present
    if (image_file && image_file.size > 0) {
      const fileExt = image_file.name.split('.').pop()
      const fileName = `product-${Date.now()}.${fileExt}`
      const { data, error } = await supabaseServer.storage.from('images').upload(`products/${fileName}`, image_file)
      
      if (!error) {
        const { data: { publicUrl } } = supabaseServer.storage.from('images').getPublicUrl(`products/${fileName}`)
        image_url = publicUrl
      } else {
        console.error("Storage upload error:", error)
      }
    }

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
    const active = formData.get('active') === 'on'
    let image_url = formData.get('image_url') as string
    const image_file = formData.get('image_file') as File

    if (image_file && image_file.size > 0) {
      const fileExt = image_file.name.split('.').pop()
      const fileName = `product-${Date.now()}.${fileExt}`
      const { data, error } = await supabaseServer.storage.from('images').upload(`products/${fileName}`, image_file)
      
      if (!error) {
        const { data: { publicUrl } } = supabaseServer.storage.from('images').getPublicUrl(`products/${fileName}`)
        image_url = publicUrl
      }
    }

    const { error } = await supabaseServer.from('products').update({
      name,
      sku,
      active,
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
    <div className="flex flex-col gap-6 w-full max-w-[1400px] mx-auto p-2">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-foreground/90 dark:text-[#EDEDED]">{t('products.title')}</h1>
        <CreateProductDialog addAction={addProduct} />
      </div>

      <SearchInput placeholder={t('products.search')} />

      <div className="rounded-[1.25rem] border-0 dark:border dark:border-border shadow-[0_2px_20px_rgb(0,0,0,0.04)] dark:shadow-none bg-white dark:bg-card overflow-hidden">
        {products && products.length > 0 ? (
          <div className="divide-y divide-gray-100 dark:divide-white/[0.04]">
            {products.map((product) => (
              <div key={product.id} className="flex flex-col sm:flex-row items-center p-4 gap-4 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                
                {/* Image */}
                <div className="w-16 h-16 shrink-0 rounded-xl bg-gray-100 dark:bg-white/[0.04] flex items-center justify-center overflow-hidden border border-gray-100/50 dark:border-white/[0.04]">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="object-cover w-full h-full" />
                  ) : (
                    <Box className="w-6 h-6 text-muted-foreground/30" />
                  )}
                </div>

                {/* Info (Name, SKU, Status) */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-[15px] truncate text-foreground/90 dark:text-[#EDEDED]">{product.name}</h3>
                    {product.active ? (
                      <Badge className="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border-0 h-5 px-1.5 text-[10px] uppercase font-bold tracking-wider rounded-md">{t('products.active')}</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-500 dark:bg-white/[0.06] dark:text-gray-400 border-0 h-5 px-1.5 text-[10px] uppercase font-bold tracking-wider rounded-md">{t('products.inactive')}</Badge>
                    )}
                  </div>
                  <span className="text-xs font-medium font-mono text-muted-foreground bg-gray-50 dark:bg-white/[0.04] px-1.5 py-0.5 rounded-md self-start border border-gray-100/50 dark:border-white/[0.04]">{product.sku}</span>
                </div>

                {/* Recipe Overview */}
                <div className="flex-1 min-w-[200px] hidden md:flex flex-col justify-center border-l border-gray-100 dark:border-white/[0.04] pl-6 space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t('products.recipe')}</span>
                  {product.product_packaging_rules && product.product_packaging_rules.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {product.product_packaging_rules.map((rule: any, idx: number) => (
                        <span key={idx} className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 dark:text-indigo-400 px-2 py-0.5 rounded-md border border-indigo-100/50">
                          {rule.quantity_used}x <span className="truncate max-w-[80px] text-indigo-900/70 dark:text-indigo-200/70">{rule.packaging_items?.name}</span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[11px] font-medium text-muted-foreground/50 flex items-center gap-1">
                      <PackagePlus className="w-3 h-3" /> {t('products.no_recipe')}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-auto shrink-0 pl-4 sm:border-l border-gray-100 dark:border-white/[0.04]">
                  <ManageRecipeDialog product={product} packagingItems={packagingItems || []} attachAction={attachPackaging} />
                  <EditProductDialog product={product} editAction={editProduct} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <Box className="h-10 w-10 text-muted-foreground/20 mb-4" />
            <h2 className="text-[15px] font-semibold text-foreground/80 tracking-tight">{t('products.no_products')}</h2>
          </div>
        )}
      </div>
    </div>
  )
}
