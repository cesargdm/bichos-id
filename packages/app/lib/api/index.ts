import { getIdToken } from '../auth'
import { API_BASE_URL } from './constants'
import { fetcher } from './fetcher'

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
}
