import type { NextRequest } from 'next/server'

import * as Sentry from '@sentry/nextjs'
import { NextResponse } from 'next/server'

import { getOrganisms } from '@/next/lib/db'
import { getOrganismsSchema } from '@/next/lib/schema'

export async function GET(request: NextRequest) {
	try {
		const params = getOrganismsSchema.parse(
			Object.fromEntries(request.nextUrl.searchParams),
		)

		const organisms = await getOrganisms(params)

		return NextResponse.json(organisms, {
			headers: {
				'Cache-Control': 'public, max-age=3600, must-revalidate',
			},
		})
	} catch (error) {
		Sentry.captureException(error)

		return NextResponse.json(
			{ error: 'Failed to connect to database' },
			{ status: 500 },
		)
	}
}
