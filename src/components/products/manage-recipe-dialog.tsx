"use client"

import { useState } from "react"
import { PackagePlus, Code, Box } from "lucide-react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRouter } from "next/navigation"

export function ManageRecipeDialog({ 
  product, 
  packagingItems,
  attachAction 
}: { 
  product: any, 
  packagingItems: any[],
  attachAction: (formData: FormData) => Promise<any> 
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    formData.append("product_id", product.id)
    
    try {
      await attachAction(formData)
      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Failed to attach packaging", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button variant="secondary" size="sm" className="h-8 gap-1.5 cursor-pointer bg-emerald-50 text-emerald-600 hover:bg-emerald-100/80 hover:text-emerald-700 shadow-none px-3 font-bold border border-emerald-100/40" />
      }>
        <PackagePlus className="w-3.5 h-3.5" /> Recipe
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[460px] p-0 border-0 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] rounded-[1.5rem] overflow-hidden bg-white">
        <form onSubmit={handleSubmit} className="flex flex-col">
          
          <div className="px-8 pt-8 pb-4">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold tracking-tight text-foreground/90 flex items-center gap-2">
                <div className="p-2 bg-emerald-50 text-emerald-500 rounded-xl inline-flex"><PackagePlus className="w-5 h-5" /></div>
                Build Component Tree
              </DialogTitle>
            </DialogHeader>
          </div>

          <div className="px-8 py-6 space-y-6 bg-gray-50/30">
            <div className="space-y-1.5">
              <Label htmlFor="packaging_id" className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Packaging Component</Label>
              <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                   <Box className="h-4 w-4 text-muted-foreground/40" />
                 </div>
                 <Select name="packaging_id" required>
                   <SelectTrigger className="flex h-12 w-full pl-10 pr-4 rounded-xl border-gray-200/60 bg-white shadow-sm text-[14px] font-medium text-foreground focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors">
                     <SelectValue placeholder="Select a component..." />
                   </SelectTrigger>
                   <SelectContent>
                     {packagingItems.map((pkg) => (
                       <SelectItem key={pkg.id} value={pkg.id} className="cursor-pointer">{pkg.name} — [{pkg.sku_internal}]</SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
              </div>
            </div>

            <div className="space-y-1.5 w-1/2">
              <Label htmlFor="quantity" className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Units Consumed</Label>
              <div className="relative">
                <Input 
                  id="quantity" 
                  name="quantity" 
                  type="number" 
                  min="1" 
                  step="1" 
                  defaultValue="1" 
                  required 
                  className="h-12 bg-white border-gray-200/60 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 rounded-xl px-4 text-[16px] shadow-sm font-bold tracking-tight text-center"
                />
              </div>
            </div>
          </div>

          <div className="px-8 py-5 border-t border-gray-100 bg-white flex items-center justify-between rounded-b-[1.5rem]">
             <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="h-10 px-5 rounded-xl font-semibold text-muted-foreground hover:bg-gray-100">Cancel</Button>
             <Button type="submit" disabled={loading} className="h-10 px-6 rounded-xl font-semibold bg-zinc-900 hover:bg-zinc-800 text-white shadow-[0_4px_14px_0_rgba(0,0,0,0.2)] transition-all">
               {loading ? "Injecting..." : "Inject to Recipe"}
             </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
