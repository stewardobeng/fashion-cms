import type { Metadata } from 'next'
import './globals.css'
import { SettingsProvider } from '@/contexts/SettingsContext'

export const metadata: Metadata = {
  title: 'Fashion Client Management System',
  description: 'Complete client management solution for fashion firms',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <SettingsProvider>
          {children}
        </SettingsProvider>
      </body>
    </html>
  )
}