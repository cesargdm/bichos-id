import type { NextRequest } from 'next/server'

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis/cloudflare'
import { NextResponse } from 'next/server'

const RATE_LIMIT = 5

const rateLimit = new Ratelimit({
	limiter: Ratelimit.slidingWindow(RATE_LIMIT, '24 h'),
	redis: Redis.fromEnv(),
})

export const config = {
	matcher: '/api/:path*',
}

export async function proxy(request: NextRequest) {
	if (request.method !== 'POST') {
		return NextResponse.next()
	}

	let waitUntil = Date.now()

	try {
		const ip = request.headers.get('CF-Connecting-IP') || '127.0.0.1'

		const { reset, success } = await rateLimit.limit(ip)

		if (!success) {
			waitUntil = reset
			throw new Error('Rate limit exceeded')
		}

		return NextResponse.next()
	} catch {
		return NextResponse.json(
			{ error: `Límite alcanzado` },
			{
				headers: {
					'Retry-After': Math.floor((waitUntil - Date.now()) / 1000).toString(),
					'X-RateLimit-Limit': RATE_LIMIT.toString(),
				},
				status: 429,
			},
		)
	}
}
