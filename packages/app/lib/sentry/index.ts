import * as Sentry from '@sentry/react-native'

export const routingInstrumentation = Sentry.reactNavigationIntegration({
	enableTimeToInitialDisplay: true,
})

Sentry.init({
	dsn: 'https://d8fb4a916d7f155778f7ea083e566572@o4507958202662912.ingest.us.sentry.io/4507958206201856',
	tracesSampleRate: 1.0,
	integrations: [
		Sentry.reactNativeTracingIntegration({ routingInstrumentation }),
		Sentry.mobileReplayIntegration(),
	],
	tracePropagationTargets: ["https://bichos-id.fucesa.com", /^\/api\//],
	_experiments: {
		profilesSampleRate: 1.0,
	},
})

export default Sentry
