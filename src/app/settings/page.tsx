"use client";

import { useI18n } from "@/lib/i18n/context"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Globe } from "lucide-react"

export default function SettingsPage() {
  const { t, lang, setLang } = useI18n()

  return (
    <div className="flex flex-col gap-8 w-full max-w-[1400px] mx-auto p-2">
      <div>
         <h1 className="text-2xl font-bold tracking-tight text-foreground/90">{t('settings.title')}</h1>
      </div>

      <Card className="rounded-[1.5rem] border-0 shadow-[0_2px_20px_rgb(0,0,0,0.04)] bg-white max-w-2xl">
        <CardHeader className="flex flex-row items-center gap-4">
          <div className="p-3 bg-zinc-100 text-zinc-900 rounded-xl">
             <Globe className="w-5 h-5" />
          </div>
          <div>
            <CardTitle>{t('settings.language')}</CardTitle>
            <CardDescription>{t('settings.language_desc')}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-6 border-t border-gray-50/50">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setLang('pt')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all cursor-pointer ${lang === 'pt' ? 'bg-zinc-900 text-white shadow-md' : 'bg-gray-100 text-muted-foreground hover:bg-gray-200'}`}
            >
              Português (BR)
            </button>
            <button 
              onClick={() => setLang('en')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all cursor-pointer ${lang === 'en' ? 'bg-zinc-900 text-white shadow-md' : 'bg-gray-100 text-muted-foreground hover:bg-gray-200'}`}
            >
              English (US)
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
