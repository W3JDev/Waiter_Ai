import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"
import { MobileNavigation } from "@/components/mobile-navigation"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "WaiterAI Enterprise | Restaurant AI Management Platform",
  description: "Enterprise-ready AI-powered restaurant management platform with menu optimization, multi-language support, and real-time analytics",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  generator: 'WaiterAI Enterprise'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased")}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <div className="flex flex-col min-h-screen pb-16 md:pb-0">
            {children}
            <MobileNavigation />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}

