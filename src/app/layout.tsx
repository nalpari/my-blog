import { Geist, Geist_Mono } from 'next/font/google'
import { metadata } from './metadata'
import { Providers } from './providers'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export { metadata }

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode
}>) => {
  return (
    <html lang="ko" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

export default RootLayout
