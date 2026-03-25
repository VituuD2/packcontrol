"use client"
import Link from 'next/link'
import { LayoutDashboard, Package, Box, RefreshCw, Settings, History, ShoppingCart } from 'lucide-react'
import { useI18n } from '@/lib/i18n/context'

export function Sidebar() {
  const { t } = useI18n();
  
  const navigation = [
    { name: t('sidebar.dashboard'), href: '/', icon: LayoutDashboard },
    { name: t('sidebar.products'), href: '/products', icon: Box },
    { name: t('sidebar.packaging'), href: '/packaging', icon: Package },
    { name: t('sidebar.orders'), href: '/orders', icon: ShoppingCart },
    { name: t('sidebar.movements'), href: '/movements', icon: History },
    { name: t('sidebar.settings'), href: '/settings', icon: Settings },
  ]

  return (
    <div className="hidden border-r dark:border-white/[0.04] bg-muted/40 dark:bg-[#0A0A0A] md:block w-64 shrink-0">
      <div className="flex h-14 items-center border-b dark:border-white/[0.04] px-4 lg:h-[60px] lg:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold text-primary">
          <Package className="h-6 w-6" />
          <span className="text-foreground dark:text-[#EDEDED]">SB Pack Sync</span>
        </Link>
      </div>
      <div className="flex-1 py-4">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4 gap-1">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted dark:hover:bg-white/[0.04]"
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
