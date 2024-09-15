import * as Sentry from '@sentry/react'

export const routingInstrumentation = null

Sentry.init({
	dsn: 'https://d8fb4a916d7f155778f7ea083e566572@o4507958202662912.ingest.us.sentry.io/4507958206201856',
	integrations: [
		Sentry.browserTracingIntegration(),
		Sentry.replayIntegration(),
	],
	tracesSampleRate: 1.0,
	replaysSessionSampleRate: 0.1,
	replaysOnErrorSampleRate: 1.0,
})
