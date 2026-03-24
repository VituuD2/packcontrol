import Link from 'next/link'
import { LayoutDashboard, Package, Box, RefreshCw, Settings, History, ShoppingCart } from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Products', href: '/products', icon: Box },
  { name: 'Packaging', href: '/packaging', icon: Package },
  { name: 'Orders', href: '/orders', icon: ShoppingCart },
  { name: 'Movements', href: '/movements', icon: History },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  return (
    <div className="hidden border-r bg-muted/40 md:block w-64 shrink-0">
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold text-primary">
          <Package className="h-6 w-6" />
          <span className="text-foreground">SB Pack Sync</span>
        </Link>
      </div>
      <div className="flex-1 py-4">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4 gap-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted"
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}
