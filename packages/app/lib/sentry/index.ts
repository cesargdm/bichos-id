import * as Sentry from '@sentry/react-native'

export const routingInstrumentation = new Sentry.ReactNavigationInstrumentation(
	{
		enableTimeToInitialDisplay: true,
	},
)

Sentry.init({
	_experiments: {
		profilesSampleRate: 1.0,
	},
	dsn: 'https://d8fb4a916d7f155778f7ea083e566572@o4507958202662912.ingest.us.sentry.io/4507958206201856',
	integrations: [new Sentry.ReactNativeTracing({ routingInstrumentation })],
	tracePropagationTargets: ['https://bichos-id.fucesa.com', /^\/api\//],
	tracesSampleRate: 1.0,
})

export default Sentry
