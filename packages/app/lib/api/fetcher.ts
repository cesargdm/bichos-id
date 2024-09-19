import Sentry from '@/app/lib/sentry'

export function fetcher<TData, TKey extends string = string>(
	url: TKey,
	options?: RequestInit,
) {
	return fetch(url, options)
		.then((response) => response.json() as TData)
		.catch((error: unknown) => {
			Sentry.captureException(error, { data: { error } })
			throw error
		})
}
