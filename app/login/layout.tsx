"use client"

import { ThemeProvider } from "../providers"
import { Toaster } from "../../components/ui/toaster"

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider>
      {children}
      <Toaster />
    </ThemeProvider>
  )
} 