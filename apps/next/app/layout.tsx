import { Metadata } from 'next'

import { StylesProvider } from './styles-provider'
import './globals.css'

export const metadata: Metadata = {
  title: 'Bichos ID - Fucesa',
  description:
    'Identifica insectos, arácnidos y otros bichos con Bichos ID usando inteligencia artificial.',
}

type Props = {
  children: React.ReactNode
}

export default function RootLayout({ children }: Props) {
  return (
    <html lang="en">
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/apple-touch-icon.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/favicon-32x32.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/favicon-16x16.png"
      />
      <link rel="icon" href="/favicon.svg" />
      <link rel="manifest" href="/site.webmanifest" />
      <body>
        <StylesProvider>{children}</StylesProvider>
      </body>
    </html>
  )
}
