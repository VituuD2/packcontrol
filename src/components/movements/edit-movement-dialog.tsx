"use client"

import { useState } from "react"
import { Pencil, Trash2 } from "lucide-react"
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

export function EditMovementDialog({ 
  movement, 
  editAction,
  deleteAction
}: { 
  movement: any, 
  editAction: (formData: FormData) => Promise<any>,
  deleteAction: (formData: FormData) => Promise<any>
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    formData.append("id", movement.id)
    
    try {
      await editAction(formData)
      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Failed to edit movement", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to reverse/delete this movement?")) return
    setLoading(true)
    const formData = new FormData()
    formData.append("id", movement.id)
    formData.append("packaging_item_id", movement.packaging_item_id)
    formData.append("quantity", movement.quantity)
    formData.append("movement_type", movement.movement_type)
    
    try {
      await deleteAction(formData)
      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Failed to delete movement", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer" />}>
        <Pencil className="w-4 h-4" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] overflow-hidden rounded-2xl">
        <form onSubmit={handleEdit}>
          <DialogHeader className="mb-4">
            <DialogTitle>Edit Movement</DialogTitle>
            <DialogDescription>
              Adjust quantity or reference.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Direction</Label>
                <select 
                  id="type" 
                  name="movement_type" 
                  defaultValue={movement.movement_type}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="in">In (+)</option>
                  <option value="out">Out (-)</option>
                  <option value="adjustment">Adj</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input id="quantity" name="quantity" type="number" min="1" defaultValue={movement.quantity} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reference">Reference / Order ID</Label>
              <Input id="reference" name="source_id" defaultValue={movement.source_id || ""} />
            </div>
          </div>
          <div className="flex justify-between items-center mt-4 pt-4 border-t">
             <Button type="button" variant="destructive" size="icon" className="h-9 w-9" onClick={handleDelete} disabled={loading} title="Reverse Entry">
               <Trash2 className="h-4 w-4" />
             </Button>
             <div className="flex gap-3">
               <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
               <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Update Entry"}</Button>
             </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
