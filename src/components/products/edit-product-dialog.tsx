"use client"

import { useState } from "react"
import { Pencil } from "lucide-react"
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
      <DialogTrigger render={<Button variant="outline" size="sm" className="h-8 gap-1 cursor-pointer" />}>
        <Pencil className="w-3.5 h-3.5" /> Edit
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] overflow-hidden rounded-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update the details mapping to your WooCommerce product.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 py-6">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input id="name" name="name" defaultValue={product.name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku">WooCommerce SKU</Label>
              <Input id="sku" name="sku" defaultValue={product.sku} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image_url">Photo URL (Optional)</Label>
              <Input id="image_url" name="image_url" type="url" defaultValue={product.image_url || ""} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pb-2">
             <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
             <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Changes"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
