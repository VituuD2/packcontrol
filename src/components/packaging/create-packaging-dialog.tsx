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

export function CreatePackagingDialog({ addAction }: { addAction: (formData: FormData) => Promise<any> }) {
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
      console.error("Failed to add packaging", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="cursor-pointer" />}>
        <Plus className="mr-2 w-4 h-4" /> Add Item
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] overflow-hidden rounded-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Packaging Material</DialogTitle>
            <DialogDescription>
              Enter the details of the new packaging item.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 py-6">
            <div className="space-y-2">
              <Label htmlFor="name">Material Name</Label>
              <Input id="name" name="name" placeholder="E.g. Box L" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku">Internal SKU</Label>
              <Input id="sku" name="sku_internal" placeholder="BOX-L-01" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Input id="unit" name="unit" defaultValue="un" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="min_stock">Min. Stock</Label>
                <Input id="min_stock" name="minimum_stock" type="number" defaultValue="10" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Current Stock</Label>
              <Input id="stock" name="current_stock" type="number" defaultValue="0" required />
            </div>
            <div className="space-y-2">
              <Label>Packaging Image</Label>
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
             <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Settings"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
