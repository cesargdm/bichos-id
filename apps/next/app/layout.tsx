import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import Footer from '../components/Footer'
import Nav from '../components/Nav'
import './globals.css'
import { StylesProvider } from './styles-provider'

export const metadata: Metadata = {
	description:
		'Identifica insectos, arácnidos y otros bichos con Bichos ID utilizando inteligencia artificial avanzada.',
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
			<meta name="apple-itunes-app" content="app-id=6689492259" />
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
