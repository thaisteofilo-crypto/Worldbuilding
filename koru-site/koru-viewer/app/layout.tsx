import type { Metadata } from "next"
import { Inter, Instrument_Serif } from "next/font/google"

import "./globals.css"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/koru/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-serif",
})

export const metadata: Metadata = {
  title: { default: "Korú", template: "%s · Korú" },
  description: "Um mundo cuja física é baseada em memória.",
  openGraph: {
    title: "Korú",
    description: "Um mundo cuja física é baseada em memória.",
    type: "website",
    locale: "pt_BR",
    siteName: "Korú",
  },
  twitter: {
    card: "summary_large_image",
    title: "Korú",
    description: "Um mundo cuja física é baseada em memória.",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="pt-BR"
      className={cn("antialiased", inter.variable, instrumentSerif.variable)}
      suppressHydrationWarning
    >
      <body className="bg-background text-foreground min-h-screen">
        <ThemeProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
