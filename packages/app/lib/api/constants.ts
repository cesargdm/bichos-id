function getBaseUrl() {
	if (process.env.NODE_ENV === 'development') {
		return 'http://localhost:3000/api/v1'
	}

	// Check if we're in web environment
	if (typeof globalThis === 'object' && 'window' in globalThis) {
		return '/api/v1'
	}

	return 'https://bichos-id.fucesa.com/api/v1'
}

export const API_BASE_URL = getBaseUrl()

export const ASSETS_BASE_URL = 'https://bichos-id.assets.fucesa.com'

/**
 * Returns the full URL for an image key
 */
export function getImageUrl(imageKey: string) {
	return `${ASSETS_BASE_URL}/${imageKey}` as const
}
