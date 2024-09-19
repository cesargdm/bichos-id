import { API_BASE_URL } from './constants'

export const keys = {
	organisms: {
		all(params?: URLSearchParams) {
			return `${API_BASE_URL}/organisms?${params}` as const
		},
		detail(id: string) {
			return `${API_BASE_URL}/organisms/${id}` as const
		},
	},
}
