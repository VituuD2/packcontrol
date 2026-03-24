"use client"

import { useState } from "react"
import { PackagePlus } from "lucide-react"
import { Button } from "@/components/ui/button"
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
      <DialogTrigger render={<Button variant="secondary" size="sm" className="h-8 gap-1 cursor-pointer" />}>
        <PackagePlus className="w-3.5 h-3.5" /> Recipe
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] overflow-hidden rounded-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Attach Packaging</DialogTitle>
            <DialogDescription>
              Select a packaging material consumed by this product. This will ADD to the recipe.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 py-6">
            <div className="space-y-2">
              <Label htmlFor="packaging_id">Packaging Item</Label>
              <select 
                id="packaging_id" 
                name="packaging_id" 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                required
              >
                <option value="">Select an item...</option>
                {packagingItems.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>{pkg.name} ({pkg.sku_internal})</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity Used</Label>
              <Input id="quantity" name="quantity" type="number" min="1" step="1" defaultValue="1" required />
            </div>
          </div>
          <div className="flex justify-end gap-3 pb-2">
             <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
             <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Add to Recipe"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
