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

export const config = {
	matcher: '/api/:path*',
}

export async function proxy(request: NextRequest) {
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
