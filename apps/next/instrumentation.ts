/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as Sentry from '@sentry/nextjs'

export async function register() {
	console.log('register instrumentation')

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
