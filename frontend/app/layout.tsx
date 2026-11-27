import type { Metadata } from "next"
import "./globals.css"

import { AuthProvider } from "@/features/auth/AuthProvider"

export const metadata: Metadata = {
  title: "Gadget Hub",
  description: "Modern ecommerce platform",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
