import type { NextRequest } from 'next/server'

import { getCloudflareContext } from '@opennextjs/cloudflare'
import * as Sentry from '@sentry/nextjs'
import { NextResponse } from 'next/server'

import {
	repairLegacyOrganismId,
	UNIDENTIFIED_ORGANISM_ID,
} from '@/app/lib/organism-id'

declare global {
	interface CloudflareEnv {
		RATE_LIMIT_KV: KVNamespace
	}
}

const RATE_LIMIT = 5
const RATE_LIMIT_WINDOW_SECONDS = 24 * 60 * 60

const CACHED_DYNAMIC_ROUTES = new Set(['/', '/explore', '/sitemap.xml'])

/**
 * Counts scans per IP per UTC day in KV.
 *
 * Deliberately not Cloudflare's native rate-limiting binding: its window "must
 * be either 10 or 60" seconds, and the cap this enforces is 5 per 24 hours —
 * the control that keeps a single visitor from running up the OpenAI bill.
 * Expressing that as 5 per minute would permit 7,200 a day.
 *
 * KV is eventually consistent, so a visitor hitting several colos at once can
 * overshoot slightly before the count propagates. That is acceptable for an
 * abuse ceiling — and the previous Redis limiter is gone along with its two
 * secrets and its own eventual-consistency caveat.
 */
async function consumeRateLimit(ip: string) {
	const { env } = await getCloudflareContext({ async: true })
	const key = `scan:${ip}:${new Date().toISOString().slice(0, 10)}`

	const used = Number((await env.RATE_LIMIT_KV.get(key)) ?? 0)

	if (used >= RATE_LIMIT) {
		return { success: false as const }
	}

	await env.RATE_LIMIT_KV.put(key, String(used + 1), {
		expirationTtl: RATE_LIMIT_WINDOW_SECONDS,
	})

	return { success: true as const }
}

// Runs on every rendered page too (not just /api and /sitemap.xml), so the
// workers.dev-noindex header below can apply site-wide — excludes static
// assets (by extension, since public/ has more than just favicons — icons,
// the manifest, etc.), which `_headers` already covers with its own cache
// rules. /sitemap.xml is exempted from that exclusion since, despite the
// extension, it's a dynamically generated Worker route that still needs the
// Cache-Control fix below.
export const config = {
	matcher: [
		'/((?!_next/static|_next/image|.*\\.(?:ico|png|jpg|jpeg|gif|svg|webp|webmanifest)$).*)',
		'/sitemap.xml',
	],
}

async function withRateLimit(request: NextRequest) {
	if (request.method !== 'POST') {
		return NextResponse.next()
	}

	try {
		const ip = request.headers.get('CF-Connecting-IP') || '127.0.0.1'

		const { success } = await consumeRateLimit(ip)

		if (!success) {
			// Seconds until the UTC day rolls over, which is when the counter's
			// key changes and the allowance resets.
			const now = new Date()
			const resetsAt = Date.UTC(
				now.getUTCFullYear(),
				now.getUTCMonth(),
				now.getUTCDate() + 1,
			)

			return NextResponse.json(
				{ error: `Límite alcanzado` },
				{
					headers: {
						'Retry-After': Math.max(
							0,
							Math.ceil((resetsAt - now.getTime()) / 1000),
						).toString(),
						'X-RateLimit-Limit': RATE_LIMIT.toString(),
					},
					status: 429,
				},
			)
		}

		return NextResponse.next()
	} catch (error) {
		// A genuine rate-limiter failure (KV unavailable) is
		// not the same as a client being rate-limited — surface it as a real
		// error instead of masking it as 429, which would otherwise silently
		// block all API traffic.
		Sentry.captureException(error)

		return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
	}
}

/**
 * Organism ids used to be built by joining family/genus/species unconditionally,
 * so a listing identified only to family produced `/explore/apidae--`. The rows
 * have since been renamed to the collapsed form, which would leave every
 * existing link and indexed URL on a 404 — redirect them permanently instead,
 * so the old and new spellings resolve to one canonical page.
 *
 * This runs in middleware rather than as a `redirect()` inside the page so the
 * old URL never reaches the renderer or the ISR cache.
 */
function redirectLegacyOrganismUrl(request: NextRequest) {
	const { pathname } = request.nextUrl

	if (!pathname.startsWith('/explore/')) return

	const id = pathname.slice('/explore/'.length)
	// Anything with a further path segment isn't an organism id.
	if (!id || id.includes('/')) return

	// Both repairs are safe to do blind here because no stored id can contain an
	// adjacent repeated segment or a doubled dash: `buildOrganismId` drops a
	// rank that repeats the one above it, so even a tautonymous species like
	// *Membracis membracis* is stored as `membracidae-membracis`. Verified
	// against the catalogue — zero rows violate it.
	//
	// This has to happen in middleware rather than the page: `permanentRedirect`
	// inside the prerendered route does not produce a redirect response under
	// the Cloudflare adapter — the page renders the resolved organism at the old
	// URL with a 200 instead. The database-backed fallback in the page and the
	// organism API stays as a second line of defence.
	let decoded: string
	try {
		decoded = decodeURIComponent(id)
	} catch {
		// A malformed escape like `/explore/%ZZ` throws; let the route handle it
		// rather than turning every bad link into a middleware 500.
		return
	}

	const normalized = repairLegacyOrganismId(decoded)
	// `--` carried no taxonomy at all and normalizes to nothing, so it gets the
	// explicit unidentified slug rather than an empty path.
	const target = normalized || (/^-+$/.test(id) ? UNIDENTIFIED_ORGANISM_ID : '')

	if (!target || target === id) return

	const url = request.nextUrl.clone()
	url.pathname = `/explore/${target}`

	return NextResponse.redirect(url, 301)
}

export async function proxy(request: NextRequest) {
	const legacyRedirect = redirectLegacyOrganismUrl(request)
	if (legacyRedirect) return legacyRedirect

	const response = request.nextUrl.pathname.startsWith('/api/')
		? await withRateLimit(request)
		: NextResponse.next()

	// These three read the catalogue from D1, whose binding only exists inside a
	// request, so they render per request rather than being prerendered with an
	// empty database at build time. The edge cache is what keeps that from
	// meaning a render per visitor.
	if (CACHED_DYNAMIC_ROUTES.has(request.nextUrl.pathname)) {
		response.headers.set(
			'Cache-Control',
			'public, s-maxage=3600, stale-while-revalidate=86400',
		)
	}

	// Keep the workers.dev host out of search results — the real domain is
	// bichos-id.fucesa.com, this one should never rank as duplicate content.
	// (_headers can't cover this: it only overrides headers on genuinely
	// static asset responses, not on pages the Worker renders.)
	if (request.nextUrl.hostname.endsWith('.workers.dev')) {
		response.headers.set('X-Robots-Tag', 'noindex')
	}

	return response
}
