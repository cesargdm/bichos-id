import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { GoogleAnalytics } from '@next/third-parties/google'

import Footer from '@/next/components/Footer'
import Nav from '@/next/components/Nav'

import './globals.css'
import { StylesProvider } from './styles-provider'

// Without this, Next resolves relative OG/Twitter image URLs (e.g. from
// opengraph-image.tsx) against http://localhost:3000 in production. Only
// fall back in development — the rest of the app (robots.ts, sitemap.ts)
// already assumes this is set, so failing fast in production surfaces a
// misconfiguration instead of silently reintroducing the localhost bug.
if (!process.env.NEXT_PUBLIC_ORIGIN && process.env.NODE_ENV === 'production') {
	throw new Error('NEXT_PUBLIC_ORIGIN is required in production')
}

export const metadata: Metadata = {
	description:
		'Identifica insectos, arácnidos y otros bichos con Bichos ID utilizando inteligencia artificial avanzada.',
	metadataBase: new URL(
		process.env.NEXT_PUBLIC_ORIGIN || 'http://localhost:3000',
	),
	title: {
		default: 'Bichos ID de Fucesa',
		template: '%s - Bichos ID de Fucesa',
	},
}

type Props = {
	children: ReactNode
}

export default function Layout({ children }: Props) {
	return (
		<html lang="es">
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
			<meta name="apple-itunes-app" content="app-id=6689492259" />
			<link rel="icon" href="/favicon.svg" />
			<link rel="manifest" href="/site.webmanifest" />
			<GoogleAnalytics gaId="G-7ZFZPVBYYF" />
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
