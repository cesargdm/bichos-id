import type { NextRequest} from 'next/server';

import { Ratelimit } from '@upstash/ratelimit'
import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'

const rateLimit = new Ratelimit({
	limiter: Ratelimit.slidingWindow(3, '24 h'),
	redis: kv,
})

export const config = {
	matcher: '/api/:path*',
}

export async function middleware(request: NextRequest) {
	if (request.method !== 'POST') {
		return NextResponse.next()
	}

	let waitUntil = Date.now()

	try {
		const ip = request.ip ?? '127.0.0.1'

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
				},
				status: 429,
			},
		)
	}
}
