import { ListObjectsCommand } from '@aws-sdk/client-s3'
import * as Sentry from '@sentry/nextjs'
import { NextResponse } from 'next/server'

import { ASSETS_BASE_URL } from '@/app/lib/api/constants'
import { getOrganism, getOrganismScans } from '@/next/lib/db'
import { getR2Client, R2_BUCKET_NAME } from '@/next/lib/r2'

const cacheMaxAge = 60 * 60 * 3 // 3 hours

function getOrganismImages(prefix: string) {
	return getR2Client()
		.send(
			new ListObjectsCommand({
				Bucket: R2_BUCKET_NAME,
				Prefix: prefix,
			}),
		)
		.catch(() => ({ Contents: [] }))
		.then(({ Contents = [] }) =>
			Contents.map(({ Key }) => `${ASSETS_BASE_URL}/${Key}`),
		)
}

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const id = (await params).id

		const images_path = `scans/${id.replaceAll('-', '/')}`

		const [organism, organismScans, images] = await Promise.all([
			getOrganism(id),
			getOrganismScans(id),
			getOrganismImages(images_path),
		])

		return NextResponse.json(
			{
				...organism,
				images,
				scansCount: organismScans.length,
			},
			{
				headers: {
					'Cache-Control': `public, s-maxage=${cacheMaxAge}, must-revalidate`,
				},
			},
		)
	} catch (error) {
		Sentry.captureException(error)

		return NextResponse.json(
			{ error: 'Failed to connect to database' },
			{ status: 500 },
		)
	}
}
