import { createKysely } from '@vercel/postgres-kysely'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { Database } from '../_db'

const paramsSchema = z.object({
	sortBy: z
		.enum(['scan_count', 'created_at', 'common_name'])
		.default('common_name'),
	limit: z.number().min(1).max(100).default(50),
	direction: z.enum(['asc', 'desc']).default('asc'),
})

export async function GET(request: NextRequest) {
	try {
		const db = createKysely<Database>()

		const { sortBy, limit, direction } = paramsSchema.parse(
			Object.fromEntries(request.nextUrl.searchParams),
		)

		const organisms = await db
			.selectFrom('organisms')
			.orderBy(sortBy, direction)
			.limit(limit)
			.selectAll()
			.execute()

		return NextResponse.json(organisms)
	} catch (error) {
		console.log('Failed to connect to database', error)

		return NextResponse.json(
			{ error: 'Failed to connect to database' },
			{ status: 500 },
		)
	}
}
