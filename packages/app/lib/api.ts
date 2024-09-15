import { Platform } from 'react-native'
import { getIdToken } from './auth'

const USE_LOCAL_API = process.env.NODE_ENV === 'development'

export const API_BASE_URL = USE_LOCAL_API
	? 'http://localhost:3000/api/v1'
	: Platform.OS === 'web'
		? '/api/v1'
		: 'https://bichos-id.fucesa.com/api/v1'

export const ASSETS_BASE_URL = 'https://bichos-id.assets.fucesa.com'

export function fetcher<TData, TKey extends string>(url: TKey) {
	return fetch(url).then((response) => response.json() as TData)
}

export class Api {
	static async identify(base64Image: string) {
		const idToken = await getIdToken()

		return fetch(`${API_BASE_URL}/ai/vision`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${idToken}`,
				'Accept-Language': 'es',
			},
			body: JSON.stringify({ base64Image }),
		}).then(
			(response) => response.json() as Promise<{ id?: string; error?: string }>,
		)
	}

	static getOrganismKey(id: string) {
		return `${API_BASE_URL}/organisms/${id}`
	}

	static getOrganismsKey() {
		return `${API_BASE_URL}/organisms`
	}
}
