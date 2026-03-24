"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
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
      <DialogTrigger render={<Button className="cursor-pointer" />}>
        <Plus className="mr-2 w-4 h-4" /> Add Product
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] overflow-hidden rounded-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Product</DialogTitle>
            <DialogDescription>
              Enter the details mapping to your WooCommerce product.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 py-6">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input id="name" name="name" placeholder="Minimalist T-Shirt" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku">WooCommerce SKU</Label>
              <Input id="sku" name="sku" placeholder="TSHIRT-MIN-01" required />
            </div>
            <div className="space-y-2">
              <Label>Product Image</Label>
              <div className="flex flex-col gap-2">
                <Input id="image_file" name="image_file" type="file" accept="image/*" className="text-muted-foreground file:text-foreground file:bg-muted file:border-0 file:rounded-md file:mr-4 file:px-4 file:py-1 cursor-pointer" />
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-muted-foreground/50 mx-1">OR</span>
                  <Input id="image_url" name="image_url" placeholder="Paste image URL..." type="url" className="flex-1" />
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pb-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Product"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
