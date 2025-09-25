import './globals.css'
import { ReactNode } from 'react'

export const metadata = {
  title: 'Replay — AI Interview (MVP)',
  description: 'Manager + Applicant flows (MVP)',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto p-6">
          {children}
        </div>
      </body>
    </html>
  )
}
