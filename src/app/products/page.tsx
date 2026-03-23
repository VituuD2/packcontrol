import { Box, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ProductsPage() {
  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">Products Catalog</h1>
          <p className="text-muted-foreground">
            Manage WooCommerce SKUs and their packaging composition rules.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 w-4 h-4" /> Sync / Add Product
        </Button>
      </div>

      <div className="rounded-xl border bg-card p-6 min-h-[400px] flex items-center justify-center shadow-sm">
        <div className="text-center">
          <Box className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <h2 className="text-xl font-semibold">No products found</h2>
          <p className="text-muted-foreground mb-4">
            Define your products to associate them with packaging rules.
          </p>
        </div>
      </div>
    </div>
  )
}
