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
      <link rel="icon" href="/favicon.svg"/>
      <body>
        <StylesProvider>{children}</StylesProvider>
      </body>
    </html>
  )
}
