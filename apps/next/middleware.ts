import { NextRequest, NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { kv } from '@vercel/kv'

const getRateLimit = new Ratelimit({
	redis: kv,
	limiter: Ratelimit.slidingWindow(60, '60 s'),
})

const rateLimit = new Ratelimit({
	redis: kv,
	limiter: Ratelimit.slidingWindow(3, '24 h'),
})

export const config = {
	matcher: '/api/:path*',
}

export async function middleware(request: NextRequest) {
	console.log('middleware')

	if (request.method !== 'POST') {
		return NextResponse.next()
	}

	let waitUntil = Date.now()

	try {
		const ip = request.ip ?? '127.0.0.1'

		const { success, reset } = await rateLimit.limit(ip)

		if (!success) {
			waitUntil = reset
			throw new Error('Rate limit exceeded')
		}

		return NextResponse.next()
	} catch {
		console.log('rate limit exceeded')

		return NextResponse.json(
			{ error: `Rate limit exceeded` },
			{
				status: 429,
				headers: {
					'Retry-After': Math.floor((waitUntil - Date.now()) / 1000).toString(),
				},
			},
		)
	}
}
