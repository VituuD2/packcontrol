import { cookies, headers } from "next/headers";
import { ptBR, enUS } from "./dictionaries";

export async function getTranslation() {
  const cookieStore = await cookies();
  const langCookie = cookieStore.get("app_lang")?.value;
  
  let lang = "pt"; // default fallback
  
  if (langCookie) {
    lang = langCookie;
  } else {
    const headersList = await headers();
    const acceptLanguage = headersList.get("accept-language");
    if (acceptLanguage && acceptLanguage.toLowerCase().startsWith("en")) {
      lang = "en";
    }
  }

  const dict = lang === "en" ? enUS : ptBR;

  return function t(key: string): string {
    const keys = key.split(".");
    let value: any = dict;
    
    for (const k of keys) {
      if (value[k as keyof typeof value] === undefined) {
        return key;
      }
      value = value[k as keyof typeof value];
    }
    
    return value as string;
  };
}
