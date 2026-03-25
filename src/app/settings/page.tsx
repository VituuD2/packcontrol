"use client";

import { useI18n } from "@/lib/i18n/context"
import { useTheme } from "next-themes"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Globe, Moon } from "lucide-react"
import { useEffect, useState } from "react"

export default function SettingsPage() {
  const { t, lang, setLang } = useI18n()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="flex flex-col gap-8 w-full max-w-[1400px] mx-auto p-2">
      <div>
         <h1 className="text-2xl font-bold tracking-tight text-foreground/90 dark:text-[#EDEDED]">{t('settings.title')}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <Card className="rounded-[1.5rem] border-0 shadow-[0_2px_20px_rgb(0,0,0,0.04)] bg-white dark:bg-[#0F0F11] dark:shadow-none dark:border dark:border-white/[0.04]">
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="p-3 bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-200 rounded-xl">
               <Globe className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="dark:text-[#EDEDED]">{t('settings.language')}</CardTitle>
              <CardDescription className="dark:text-[#A1A1AA]">{t('settings.language_desc')}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-6 border-t border-gray-50/50 dark:border-white/[0.04]">
            <div className="flex flex-wrap items-center gap-4">
              <button 
                onClick={() => setLang('pt')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all cursor-pointer ${lang === 'pt' ? 'bg-zinc-900 text-white dark:bg-white dark:text-black shadow-md' : 'bg-gray-100 text-muted-foreground hover:bg-gray-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'}`}
              >
                Português (BR)
              </button>
              <button 
                onClick={() => setLang('en')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all cursor-pointer ${lang === 'en' ? 'bg-zinc-900 text-white dark:bg-white dark:text-black shadow-md' : 'bg-gray-100 text-muted-foreground hover:bg-gray-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'}`}
              >
                English (US)
              </button>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[1.5rem] border-0 shadow-[0_2px_20px_rgb(0,0,0,0.04)] bg-white dark:bg-[#0F0F11] dark:shadow-none dark:border dark:border-white/[0.04]">
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="p-3 bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-200 rounded-xl">
               <Moon className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="dark:text-[#EDEDED]">{t('settings.theme')}</CardTitle>
              <CardDescription className="dark:text-[#A1A1AA]">{t('settings.theme_desc')}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-6 border-t border-gray-50/50 dark:border-white/[0.04]">
            <div className="flex flex-wrap items-center gap-4">
              <button 
                onClick={() => setTheme('light')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all cursor-pointer ${theme === 'light' ? 'bg-zinc-900 text-white shadow-md' : 'bg-gray-100 text-muted-foreground hover:bg-gray-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'}`}
              >
                {t('settings.light')}
              </button>
              <button 
                onClick={() => setTheme('dark')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all cursor-pointer ${theme === 'dark' ? 'bg-white text-black shadow-md' : 'bg-gray-100 text-muted-foreground hover:bg-gray-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'}`}
              >
                {t('settings.dark')}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
