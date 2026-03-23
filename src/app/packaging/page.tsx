import { Package, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PackagingPage() {
  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">Packaging Inventory</h1>
          <p className="text-muted-foreground">
            Manage your boxes, bags, and other packaging materials.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 w-4 h-4" /> Add Item
        </Button>
      </div>

      <div className="rounded-xl border bg-card p-6 min-h-[400px] flex items-center justify-center shadow-sm">
        <div className="text-center">
          <Package className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <h2 className="text-xl font-semibold">No packaging items found</h2>
          <p className="text-muted-foreground mt-1 mb-4">
            Get started by adding your first packaging material.
          </p>
          <Button variant="outline">
            <Plus className="mr-2 w-4 h-4" /> Add Item
          </Button>
        </div>
      </div>
    </div>
  )
}
