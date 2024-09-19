import * as Sentry from '@sentry/nextjs'

export const routingInstrumentation = null

Sentry.init({
	dsn: 'https://e50094c733f8a02cff976221d95c6a62@o4507958202662912.ingest.us.sentry.io/4507958204628992',
	integrations: [],
	replaysOnErrorSampleRate: 1.0,
	replaysSessionSampleRate: 0.1,
	tracePropagationTargets: ['https://bichos-id.fucesa.com', /^\//, 'localhost'],
	tracesSampleRate: 1.0,
})

export default Sentry
