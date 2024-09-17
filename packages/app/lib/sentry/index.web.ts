import * as RSentry from '@sentry/react'

export const routingInstrumentation = null

RSentry.init({
	dsn: 'https://d8fb4a916d7f155778f7ea083e566572@o4507958202662912.ingest.us.sentry.io/4507958206201856',
	integrations: [
		RSentry.browserTracingIntegration(),
		RSentry.replayIntegration(),
	],
	replaysOnErrorSampleRate: 1.0,
	replaysSessionSampleRate: 0.1,
	tracePropagationTargets: ['https://bichos-id.fucesa.com', /^\/api\//],
	tracesSampleRate: 1.0,
})

export default RSentry
