import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Nunito, Nunito_Sans } from 'next/font/google'
import './globals.css'

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
})

const nunitoSans = Nunito_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Paty · Asistente de Patitas Felices',
  description:
    'Habla con Paty, la asistente virtual de Patitas Felices — centro veterinario y pet shop en Medellín. Consulta precios, servicios, horarios y sedes.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#16a34a',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${nunito.variable} ${nunitoSans.variable} dark bg-background`}>
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
