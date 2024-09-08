import { Metadata } from 'next'

import { StylesProvider } from './styles-provider'
import './globals.css'
import Nav from '../components/Nav'
import Footer from '../components/Footer'

export const metadata: Metadata = {
  title: {
    template: '%s - Bichos ID de Fucesa',
    default: 'Bichos ID de Fucesa',
  },
  description:
    'Identifica insectos, arácnidos y otros bichos con Bichos ID utilizando inteligencia artificial avanzada.',
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
        <Nav />
        <StylesProvider>
          <main>{children}</main>
        </StylesProvider>
        <Footer />
      </body>
    </html>
  )
}
