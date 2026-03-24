import { Package } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { Badge } from "@/components/ui/badge"
import { CreatePackagingDialog } from "@/components/packaging/create-packaging-dialog"
import { EditPackagingDialog } from "@/components/packaging/edit-packaging-dialog"
import { getTranslation } from "@/lib/i18n/server"

export const dynamic = "force-dynamic"

export default async function PackagingPage() {
  const supabase = await createClient()
  const t = await getTranslation()

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
    let image_url = formData.get('image_url') as string
    const image_file = formData.get('image_file') as File

    // Handle File Upload to Supabase Storage if present
    if (image_file && image_file.size > 0) {
      const fileExt = image_file.name.split('.').pop()
      const fileName = `packaging-${Date.now()}.${fileExt}`
      const { data, error } = await supabaseServer.storage.from('images').upload(`packaging/${fileName}`, image_file)
      
      if (!error) {
        const { data: { publicUrl } } = supabaseServer.storage.from('images').getPublicUrl(`packaging/${fileName}`)
        image_url = publicUrl
      } else {
        console.error("Storage upload error:", error)
      }
    }

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

  async function editPackaging(formData: FormData) {
    "use server"
    const supabaseServer = await createClient()
    const id = formData.get('id') as string
    const name = formData.get('name') as string
    const sku_internal = formData.get('sku_internal') as string
    const unit = formData.get('unit') as string
    const current_stock = Number(formData.get('current_stock'))
    const minimum_stock = Number(formData.get('minimum_stock'))
    let image_url = formData.get('image_url') as string
    const image_file = formData.get('image_file') as File

    if (image_file && image_file.size > 0) {
      const fileExt = image_file.name.split('.').pop()
      const fileName = `packaging-${Date.now()}.${fileExt}`
      const { data, error } = await supabaseServer.storage.from('images').upload(`packaging/${fileName}`, image_file)
      
      if (!error) {
        const { data: { publicUrl } } = supabaseServer.storage.from('images').getPublicUrl(`packaging/${fileName}`)
        image_url = publicUrl
      }
    }

    const { error } = await supabaseServer.from('packaging_items').update({
      name,
      sku_internal,
      unit,
      current_stock,
      minimum_stock,
      image_url: image_url || null
    }).eq("id", id)

    if (!error) {
      revalidatePath('/packaging')
    } else {
      throw new Error(error.message)
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1400px] mx-auto p-2">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-foreground/90">{t('packaging.title')}</h1>
        <CreatePackagingDialog addAction={addPackaging} />
      </div>

      <div className="rounded-[1.25rem] border-0 shadow-[0_2px_20px_rgb(0,0,0,0.04)] bg-white overflow-hidden">
        {packagingItems && packagingItems.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {packagingItems.map((item) => (
              <div key={item.id} className="flex flex-col sm:flex-row items-center p-4 gap-4 hover:bg-gray-50/50 transition-colors">
                
                {/* Image */}
                <div className="w-16 h-16 shrink-0 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-100/50">
                   {item.image_url ? (
                     <img src={item.image_url} alt={item.name} className="object-cover w-full h-full" />
                   ) : (
                     <Package className="w-6 h-6 text-muted-foreground/30" />
                   )}
                </div>

                {/* Info (Name, SKU) */}
                <div className="flex-1 min-w-[200px] flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-[15px] truncate text-foreground/90">{item.name}</h3>
                  </div>
                  <span className="text-xs font-medium font-mono text-muted-foreground bg-gray-50 px-1.5 py-0.5 rounded-md self-start border border-gray-100/50">{item.sku_internal}</span>
                </div>

                {/* Stock Details */}
                <div className="flex items-center justify-between gap-8 md:gap-12 px-6 sm:border-l border-gray-100">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider mb-0.5">{t('packaging.stock')}</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl font-bold tracking-tight text-foreground/90">{item.current_stock}</span>
                      <span className="text-xs font-medium text-muted-foreground">{item.unit}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider mb-0.5">{t('packaging.min_stock')}</span>
                    <span className="text-base font-semibold text-foreground/70">{item.minimum_stock}</span>
                  </div>

                  <div className="w-[110px] flex justify-end">
                    {item.current_stock <= item.minimum_stock ? (
                      <Badge className="bg-rose-50 text-rose-600 border-0 h-6 px-2 text-[11px] font-bold tracking-wide rounded-md">Reorder</Badge>
                    ) : (
                      <Badge className="bg-emerald-50 text-emerald-600 border-0 h-6 px-2 text-[11px] font-bold tracking-wide rounded-md">Healthy</Badge>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-center pl-4 sm:border-l border-gray-100">
                  <EditPackagingDialog item={item} editAction={editPackaging} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <Package className="h-10 w-10 text-muted-foreground/20 mb-4" />
            <h2 className="text-[15px] font-semibold text-foreground/80 tracking-tight">{t('packaging.no_materials')}</h2>
          </div>
        )}
      </div>
    </div>
  )
}

