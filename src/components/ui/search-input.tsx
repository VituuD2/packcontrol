"use client"

import { useEffect, useState, Suspense } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useDebounce } from "@/hooks/use-debounce"

function SearchInputComponent({ placeholder }: { placeholder?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const initialQuery = searchParams.get("q") || ""
  const [query, setQuery] = useState(initialQuery)
  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    if (debouncedQuery !== initialQuery) {
      const params = new URLSearchParams(searchParams.toString())
      if (debouncedQuery.trim()) {
        params.set("q", debouncedQuery.trim())
      } else {
        params.delete("q")
      }
      router.push(`${pathname}?${params.toString()}`)
    }
  }, [debouncedQuery, pathname, router, searchParams, initialQuery])

  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-[#A1A1AA]" />
      <Input 
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pl-9 h-10 w-full bg-background/50 dark:bg-[#0A0A0A] border-border/80 dark:border-white/[0.04] rounded-lg shadow-sm" 
      />
    </div>
  )
}

export function SearchInput({ placeholder = "Search..." }: { placeholder?: string }) {
  return (
    <Suspense fallback={
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-[#A1A1AA]" />
        <Input placeholder={placeholder} disabled className="pl-9 h-10 w-full bg-background/50 dark:bg-[#0A0A0A] border-border/80 dark:border-white/[0.04] rounded-lg shadow-sm opacity-50" />
      </div>
    }>
      <SearchInputComponent placeholder={placeholder} />
    </Suspense>
  )
}
