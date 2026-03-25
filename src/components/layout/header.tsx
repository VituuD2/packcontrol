import { Bell, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Header() {
  return (
    <header className="flex h-14 items-center gap-4 border-b dark:border-white/[0.04] bg-background dark:bg-[#0A0A0A] px-4 lg:h-[60px] lg:px-6 shrink-0">
      <Button variant="outline" size="icon" className="shrink-0 md:hidden">
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle navigation menu</span>
      </Button>
      <div className="w-full flex-1">
      </div>
      <div className="flex items-center justify-end gap-2 md:ml-auto md:gap-2 lg:gap-4">
        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full">
          <Bell className="h-4 w-4" />
          <span className="sr-only">Toggle notifications</span>
        </Button>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary dark:bg-primary/20 text-sm font-medium">
          A
        </div>
      </div>
    </header>
  )
}
