"use client"

import { useState } from "react"
import { Pencil, Link as LinkIcon, Upload, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useRouter } from "next/navigation"
import { useI18n } from "@/lib/i18n/context"

export function EditProductDialog({ 
  product, 
  editAction 
}: { 
  product: any, 
  editAction: (formData: FormData) => Promise<any> 
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { t } = useI18n()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    formData.append("id", product.id)
    
    try {
      await editAction(formData)
      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Failed to edit product", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" className="h-8 gap-1 cursor-pointer bg-white dark:bg-[#141415] dark:border dark:border-white/[0.04] dark:shadow-none border-gray-200/60 shadow-sm hover:bg-gray-50/50" />}>
        <Pencil className="w-3.5 h-3.5 text-indigo-500" /> {t('products.edit')}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px] p-0 border-0 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] rounded-[1.5rem] overflow-hidden bg-white dark:bg-[#141415] dark:border dark:border-white/[0.04] dark:shadow-none">
        <form onSubmit={handleSubmit} className="flex flex-col">
          
          <div className="px-8 pt-8 pb-4">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold tracking-tight text-foreground/90 dark:text-[#EDEDED] flex items-center gap-2">
                 <div className="p-2 bg-indigo-50 text-indigo-500 dark:bg-indigo-500/10 dark:text-indigo-400 rounded-xl inline-flex"><Pencil className="w-5 h-5" /></div>
                 Edit Product Identity
              </DialogTitle>
            </DialogHeader>
          </div>

          <div className="px-8 py-5 space-y-6 bg-gray-50/30 dark:bg-black/20">
            {/* Status Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100/80 bg-white dark:bg-[#141415] dark:border dark:border-white/[0.04] dark:shadow-none shadow-sm">
               <div className="space-y-0.5">
                  <Label className="text-[14px] font-semibold text-foreground/90 dark:text-[#EDEDED]">{t('products.active')}</Label>
               </div>
               <label className="relative inline-flex items-center cursor-pointer">
                 <input type="checkbox" name="active" defaultChecked={product.active !== false} className="sr-only peer" />
                 <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:bg-[#141415] dark:border dark:border-white/[0.04] dark:shadow-none after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
               </label>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Product Identity</Label>
                <Input 
                  id="name" 
                  name="name" 
                  defaultValue={product.name} 
                  required 
                  className="h-11 bg-white dark:bg-[#141415] dark:border dark:border-white/[0.04] dark:shadow-none border-gray-200/60 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 rounded-xl px-4 text-[14px] shadow-sm font-medium" 
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sku" className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">WooCommerce SKU</Label>
                <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                     <Info className="h-4 w-4 text-muted-foreground/40" />
                   </div>
                   <Input 
                    id="sku" 
                    name="sku" 
                    defaultValue={product.sku} 
                    required 
                    className="h-11 bg-white dark:bg-[#141415] dark:border dark:border-white/[0.04] dark:shadow-none pl-10 border-gray-200/60 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 rounded-xl text-[14px] shadow-sm font-mono" 
                   />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Product Media</Label>
              <div className="p-4 rounded-xl border border-gray-100/80 bg-white dark:bg-[#141415] dark:border dark:border-white/[0.04] dark:shadow-none shadow-sm space-y-3">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-indigo-50 text-indigo-500 dark:bg-indigo-500/10 dark:text-indigo-400 rounded-lg shrink-0">
                      <Upload className="h-4 w-4" />
                   </div>
                   <div className="flex-1">
                      <Input id="image_file" name="image_file" type="file" accept="image/*" className="h-9 px-0 py-1.5 border-0 bg-transparent text-sm file:bg-gray-100 file:text-foreground file:font-semibold file:text-xs file:border-0 file:rounded-md file:px-3 file:py-1 file:mr-3 hover:file:bg-gray-200 transition-colors file:cursor-pointer cursor-pointer" />
                   </div>
                </div>
                
                <div className="relative flex items-center py-1">
                  <div className="flex-grow border-t border-gray-100 dark:border-white/[0.04]"></div>
                  <span className="flex-shrink-0 mx-3 text-[10px] font-bold text-muted-foreground/50 uppercase">OR</span>
                  <div className="flex-grow border-t border-gray-100 dark:border-white/[0.04]"></div>
                </div>

                <div className="flex items-center gap-3">
                   <div className="p-2 bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-lg shrink-0">
                      <LinkIcon className="h-4 w-4" />
                   </div>
                   <Input 
                      id="image_url" 
                      name="image_url" 
                      type="url" 
                      placeholder="Paste image URL directly..." 
                      defaultValue={product.image_url || ""}
                      className="h-10 border-gray-100/80 bg-gray-50/50 shadow-none rounded-lg text-sm" 
                   />
                </div>
              </div>
            </div>

          </div>

          <div className="px-8 py-5 border-t border-gray-100 dark:border-white/[0.04] bg-white dark:bg-[#141415] dark:border dark:border-white/[0.04] dark:shadow-none flex justify-end gap-3 rounded-b-[1.5rem]">
             <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="h-10 px-5 rounded-xl font-semibold text-muted-foreground dark:text-[#A1A1AA] hover:bg-gray-100 dark:hover:bg-white/[0.04]">Reset</Button>
             <Button type="submit" disabled={loading} className="h-10 px-6 rounded-xl font-semibold bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-black dark:hover:bg-gray-200 dark:shadow-none shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] transition-all">
               {loading ? t('dashboard.syncing') : t('products.edit')}
             </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
