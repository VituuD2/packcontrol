"use client"

import { useState } from "react"
import { Plus, Link as LinkIcon, Upload, Info, Box } from "lucide-react"
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

export function CreateProductDialog({ addAction }: { addAction: (formData: FormData) => Promise<any> }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    
    try {
      await addAction(formData)
      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Failed to add product", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button className="cursor-pointer h-10 px-4 gap-2 bg-zinc-900 border-0 rounded-xl font-semibold shadow-sm hover:bg-zinc-800 transition-all text-white" />
      }>
        <Plus className="w-4 h-4" /> Add Product
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px] p-0 border-0 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] rounded-[1.5rem] overflow-hidden bg-white">
        <form onSubmit={handleSubmit} className="flex flex-col">
          
          <div className="px-8 pt-8 pb-4">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold tracking-tight text-foreground/90 flex items-center gap-2">
                 <div className="p-2 bg-zinc-100 text-zinc-900 rounded-xl inline-flex"><Box className="w-5 h-5" /></div>
                 New Product Identity
              </DialogTitle>
              <p className="text-[13px] text-muted-foreground/80 mt-2">
                Register a new sellable item. The SKU must exactly match the WooCommerce product SKU to enable automatic sync.
              </p>
            </DialogHeader>
          </div>

          <div className="px-8 py-5 space-y-6 bg-gray-50/30">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Product Identity</Label>
                <Input 
                  id="name" 
                  name="name" 
                  placeholder="e.g., Premium Ceramic Mug" 
                  required 
                  className="h-11 bg-white border-gray-200/60 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 rounded-xl px-4 text-[14px] shadow-sm font-medium" 
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
                    placeholder="MUG-CER-01" 
                    required 
                    className="h-11 bg-white pl-10 border-gray-200/60 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 rounded-xl text-[14px] shadow-sm font-mono" 
                   />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Product Media</Label>
              <div className="p-4 rounded-xl border border-gray-100/80 bg-white shadow-sm space-y-3">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-indigo-50 text-indigo-500 rounded-lg shrink-0">
                      <Upload className="h-4 w-4" />
                   </div>
                   <div className="flex-1">
                      <Input id="image_file" name="image_file" type="file" accept="image/*" className="h-9 px-0 py-1.5 border-0 bg-transparent text-sm file:bg-gray-100 file:text-foreground file:font-semibold file:text-xs file:border-0 file:rounded-md file:px-3 file:py-1 file:mr-3 hover:file:bg-gray-200 transition-colors cursor-pointer" />
                   </div>
                </div>
                
                <div className="relative flex items-center py-1">
                  <div className="flex-grow border-t border-gray-100"></div>
                  <span className="flex-shrink-0 mx-3 text-[10px] font-bold text-muted-foreground/50 uppercase">OR</span>
                  <div className="flex-grow border-t border-gray-100"></div>
                </div>

                <div className="flex items-center gap-3">
                   <div className="p-2 bg-emerald-50 text-emerald-500 rounded-lg shrink-0">
                      <LinkIcon className="h-4 w-4" />
                   </div>
                   <Input 
                      id="image_url" 
                      name="image_url" 
                      type="url" 
                      placeholder="Paste image URL directly..." 
                      className="h-10 border-gray-100/80 bg-gray-50/50 shadow-none rounded-lg text-sm" 
                   />
                </div>
              </div>
            </div>

          </div>

          <div className="px-8 py-5 border-t border-gray-100 bg-white flex justify-end gap-3 rounded-b-[1.5rem]">
             <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="h-10 px-5 rounded-xl font-semibold text-muted-foreground hover:bg-gray-100">Cancel</Button>
             <Button type="submit" disabled={loading} className="h-10 px-6 rounded-xl font-semibold bg-zinc-900 hover:bg-zinc-800 text-white shadow-[0_4px_14px_0_rgba(0,0,0,0.2)] transition-all">
               {loading ? "Creating..." : "Create Product"}
             </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
