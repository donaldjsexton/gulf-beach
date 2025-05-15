import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login - Gulf Beach Weddings',
  description: 'Admin login for Gulf Beach Weddings',
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
} 