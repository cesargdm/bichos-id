/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as Sentry from '@sentry/nextjs'

// Same __DEV__ polyfill as instrumentation-client.ts, but for the server
// (SSR/Workers) runtime — see that file for why it's needed. Without this,
// server rendering a Suspense boundary that pulls in reanimated/moti (e.g.
// the /explore skeleton) throws during SSR and React silently falls back to
// client-only rendering for that boundary (React error #419).
const globalScope = globalThis as Record<string, unknown>

if (typeof globalScope.__DEV__ === 'undefined') {
	globalScope.__DEV__ = process.env.NODE_ENV !== 'production'
}

export async function register() {
	if (process.env.NEXT_RUNTIME === 'nodejs') {
		// @ts-ignore
		await import('./lib/sentry/sentry.server.config')
	}

	if (process.env.NEXT_RUNTIME === 'edge') {
		// @ts-ignore
		await import('./lib/sentry/sentry.edge.config')
	}
}

export const onRequestError = Sentry.captureRequestError
