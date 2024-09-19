import { ListObjectsCommand } from '@aws-sdk/client-s3'
import * as Sentry from '@sentry/nextjs'
import { NextResponse } from 'next/server'

import { getOrganism, getOrganismScans } from '@/next/lib/db'
import { getR2Client, R2_BUCKET_NAME } from '@/next/lib/r2'

const cacheMaxAge = 60 * 60 * 3 // 3 hours

export async function GET(
	_request: Request,
	{ params }: { params: { id: string } },
) {
	try {
		const id = params.id

		const images_path = `scans/${id.replaceAll('-', '/')}`

		const [organism, organismScans, images] = await Promise.all([
			getOrganism(id),
			getOrganismScans(id),
			await getR2Client()
				.send(
					new ListObjectsCommand({
						Bucket: R2_BUCKET_NAME,
						Prefix: images_path,
					}),
				)
				.catch(() => ({ Contents: [] }))
				.then(({ Contents = [] }) =>
					Contents.map(
						({ Key }) => `https://bichos-id.assets.fucesa.com/${Key}`,
					),
				),
		])

		return NextResponse.json(
			{
				...organism,
				images,
				scansCount: organismScans.length,
			},
			{
				headers: {
					'Cache-Control': `public, max-age=${cacheMaxAge}, must-revalidate`,
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
