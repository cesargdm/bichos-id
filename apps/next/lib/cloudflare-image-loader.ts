'use client'

import { ASSETS_BASE_URL } from '@/app/lib/api/constants'

type LoaderArgs = {
	src: string
	width: number
	quality?: number
}

/**
 * Routes next/image through Cloudflare Images transformations.
 *
 * Next calls this once per width in its srcset, so the browser picks the
 * smallest file that fits the layout instead of always pulling the full-size
 * scan (frequently >500KB for a 200px card).
 *
 * Transformations are requested from the zone that hosts the image, with a
 * relative source path — that keeps image traffic off the app Worker entirely.
 */
export default function cloudflareImageLoader({
	quality,
	src,
	width,
}: LoaderArgs) {
	// Only the user-uploaded scans are worth transforming. Local assets (app
	// icons, store badges — mostly SVG) are already tiny and served with
	// immutable caching, so routing them through a transformation would add a
	// hop and bill a transformation for no gain.
	if (!src.startsWith(ASSETS_BASE_URL)) {
		return src
	}

	const params = `width=${width},quality=${quality || 80},format=auto`
	const path = src.slice(ASSETS_BASE_URL.length).replace(/^\//, '')

	// Already a transformation (e.g. the blur placeholder) — don't nest one.
	if (path.startsWith('cdn-cgi/image/')) {
		return src
	}

	return `${ASSETS_BASE_URL}/cdn-cgi/image/${params}/${path}`
}
