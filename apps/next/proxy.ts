import type { NextRequest } from 'next/server'

import { getCloudflareContext } from '@opennextjs/cloudflare'
import * as Sentry from '@sentry/nextjs'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis/cloudflare'
import { NextResponse } from 'next/server'

declare global {
	interface CloudflareEnv {
		UPSTASH_REDIS_REST_TOKEN: string
		UPSTASH_REDIS_REST_URL: string
	}
}

const RATE_LIMIT = 5

// Constructed lazily: Redis.fromEnv() (the Cloudflare build of @upstash/redis)
// doesn't read process.env — it needs the Workers env bindings object passed
// explicitly, which is only available once a request is in flight.
let rateLimit: Ratelimit | undefined

async function getRateLimit() {
	if (!rateLimit) {
		const { env } = await getCloudflareContext({ async: true })
		rateLimit = new Ratelimit({
			limiter: Ratelimit.slidingWindow(RATE_LIMIT, '24 h'),
			redis: Redis.fromEnv(env),
		})
	}
	return rateLimit
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

		const limiter = await getRateLimit()
		const { reset, success } = await limiter.limit(ip)

		if (!success) {
			return NextResponse.json(
				{ error: `Límite alcanzado` },
				{
					headers: {
						'Retry-After': Math.max(
							0,
							Math.floor((reset - Date.now()) / 1000),
						).toString(),
						'X-RateLimit-Limit': RATE_LIMIT.toString(),
					},
					status: 429,
				},
			)
		}

		return NextResponse.next()
	} catch (error) {
		// A genuine rate-limiter failure (Redis misconfigured/unreachable) is
		// not the same as a client being rate-limited — surface it as a real
		// error instead of masking it as 429, which would otherwise silently
		// block all API traffic.
		Sentry.captureException(error)

		return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
	}
}

export async function proxy(request: NextRequest) {
	const response = request.nextUrl.pathname.startsWith('/api/')
		? await withRateLimit(request)
		: NextResponse.next()

	if (request.nextUrl.pathname === '/sitemap.xml') {
		// sitemap.ts's `revalidate` export isn't reflected in the response's
		// Cache-Control under this adapter (unlike page routes, where it is) —
		// set it explicitly so the sitemap doesn't get regenerated on every
		// request.
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
