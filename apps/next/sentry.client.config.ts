import * as Sentry from '@sentry/nextjs'

Sentry.init({
	debug: false,
	dsn: 'https://e50094c733f8a02cff976221d95c6a62@o4507958202662912.ingest.us.sentry.io/4507958204628992',
	integrations: [Sentry.replayIntegration()],
	replaysOnErrorSampleRate: 1.0,
	replaysSessionSampleRate: 0.1,
	tracesSampleRate: 1,
})
