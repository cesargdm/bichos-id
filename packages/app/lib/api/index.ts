import Sentry from '@/app/lib/sentry'

import { getIdToken } from '../auth'
import { API_BASE_URL } from './constants'

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

export class Api {
	static async identify(base64Image: string) {
		const idToken = await getIdToken()

		return fetcher<{ id?: string; error?: string }>(
			`${API_BASE_URL}/ai/vision`,
			{
				body: JSON.stringify({ base64Image }),
				headers: {
					'Accept-Language': 'es',
					Authorization: `Bearer ${idToken}`,
					'Content-Type': 'application/json',
				},
				method: 'POST',
			},
		)
	}

	static getOrganismKey(id: string) {
		return `${API_BASE_URL}/organisms/${id}` as const
	}

	static getOrganismsKey(params?: URLSearchParams) {
		return `${API_BASE_URL}/organisms?${params}` as const
	}
}
