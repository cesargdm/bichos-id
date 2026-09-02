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
 * Width used for the organism detail carousel. Shared so the API route and the
 * server-rendered fallback request the *same* URL — a mismatch would make the
 * client swap image URLs on revalidation, re-downloading the photo and billing
 * a second transformation for no visible change.
 */
export const DETAIL_IMAGE_WIDTH = 800

/** Width for social/preview images (OG cards are 1200x630). */
export const SOCIAL_IMAGE_WIDTH = 1200

type ImageOptions = {
	/**
	 * Target width in pixels — pass the largest size the image is actually
	 * displayed at (roughly 2x the CSS size, for high-density screens).
	 * Omit it to get the untransformed original.
	 */
	width?: number
	quality?: number
}

/**
 * Returns the URL for an image key, optionally resized and re-encoded by
 * Cloudflare Images.
 *
 * Scans are uploaded at full camera resolution (frequently >500KB), so serving
 * originals into a 200px card meant downloading ~30x more bytes than needed.
 * Transformations run on the assets zone, so image traffic never touches the
 * app Worker, and `format=auto` negotiates AVIF/WebP per browser.
 *
 * Each unique (image, parameter) combination is billed once per month, so
 * prefer a few shared widths over per-viewport values.
 */
export function getImageUrl(imageKey: string, options: ImageOptions = {}) {
	const { quality = 80, width } = options

	if (!width) {
		return `${ASSETS_BASE_URL}/${imageKey}`
	}

	return `${ASSETS_BASE_URL}/cdn-cgi/image/width=${width},quality=${quality},format=auto/${imageKey}`
}

/**
 * A tiny, heavily-compressed version of the image, used as the placeholder
 * shown while the real one loads. A few hundred bytes, so it arrives almost
 * immediately and the card never renders as an empty box.
 */
export function getBlurUrl(imageKey: string) {
	return `${ASSETS_BASE_URL}/cdn-cgi/image/width=32,quality=50,blur=64,format=auto/${imageKey}`
}
