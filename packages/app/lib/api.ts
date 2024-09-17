import { Platform } from 'react-native'

import Sentry from '@bichos-id/app/lib/sentry'

import { getIdToken } from './auth'

function getBaseUrl() {
	const isDevelopment = process.env.NODE_ENV === 'development'
	if (isDevelopment) return 'http://localhost:3000/api/v1'

	if (Platform.OS === 'web') return '/api/v1'

	return 'https://bichos-id.fucesa.com/api/v1'
}

export const API_BASE_URL = getBaseUrl()

export const ASSETS_BASE_URL = 'https://bichos-id.assets.fucesa.com'

export function getImageUrl(imageKey: string) {
	return `${ASSETS_BASE_URL}/${imageKey}`
}

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

	static getOrganismsKey() {
		return `${API_BASE_URL}/organisms` as const
	}
}
