import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jbMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SB Pack Sync - WooCommerce Packaging Inventory",
  description: "Dashboard for controlling packaging inventory linked to WooCommerce.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jbMono.variable} min-h-screen bg-background font-sans antialiased overflow-hidden`}>
        <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
        >
          <div className="flex h-screen w-full bg-muted/20">
            <Sidebar />
            <div className="flex flex-col flex-1 h-screen overflow-hidden">
              <Header />
              <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
                {children}
              </main>
            </div>
          </div>
          <Toaster />
        </ThemeProvider>

      </body>
    </html>
  );
}
