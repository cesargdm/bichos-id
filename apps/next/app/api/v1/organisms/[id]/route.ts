import { ListObjectsCommand } from '@aws-sdk/client-s3'
import * as Sentry from '@sentry/nextjs'
import { NextResponse } from 'next/server'

import { DETAIL_IMAGE_WIDTH, getImageUrl } from '@/app/lib/api/constants'
import { getOrganism, getOrganismScans } from '@/next/lib/db'
import { getR2Client, R2_BUCKET_NAME } from '@/next/lib/r2'

const cacheMaxAge = 60 * 60 * 3 // 3 hours

/**
 * Returns `failed: true` (with an empty image list) rather than throwing, so
 * a transient R2 problem doesn't take down the whole organism response — but
 * the caller must skip the long cache lifetime in that case, or a bad empty
 * result gets locked in for `cacheMaxAge`.
 */
function getOrganismImages(prefix: string) {
	return getR2Client()
		.send(
			new ListObjectsCommand({
				// Trailing slash: without it "scans/family/genus/species" (no
				// slash) also prefix-matches a sibling like
				// "scans/family/genus/speciesX/...", pulling in another
				// organism's photos.
				Bucket: R2_BUCKET_NAME,
				Prefix: `${prefix}/`,
			}),
		)
		.then(({ Contents = [] }) => ({
			failed: false,
			images: Contents.filter(
				(item): item is typeof item & { Key: string } => !!item.Key,
			).map(({ Key }) => getImageUrl(Key, { width: DETAIL_IMAGE_WIDTH })),
		}))
		.catch((error: unknown) => {
			console.error('getOrganismImages failed', error)
			Sentry.captureException(error)
			return { failed: true, images: [] }
		})
}

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const id = (await params).id

		const images_path = `scans/${id.replaceAll('-', '/')}`

		const [organism, organismScans, imageResult] = await Promise.all([
			getOrganism(id),
			getOrganismScans(id),
			getOrganismImages(images_path),
		])

		// Without this an unknown id spreads `undefined` into the response and
		// returns 200 with `{"images":[],"scansCount":0}`, so callers can't tell
		// a missing organism from one that simply has no photos.
		if (!organism) {
			return NextResponse.json({ error: 'Not found' }, { status: 404 })
		}

		// The organism's own image always leads, and the R2 listing only adds
		// *other* scans on top of it.
		//
		// Previously `images` was the R2 listing alone, so whenever that listing
		// came back empty — a failed call, or a key layout the prefix doesn't
		// match — the detail page rendered its server-side image and then blanked
		// out the moment SWR revalidated against this endpoint and got `[]`.
		const primaryImage = getImageUrl(organism.image_key, {
			width: DETAIL_IMAGE_WIDTH,
		})

		return NextResponse.json(
			{
				...organism,
				images: [
					primaryImage,
					...imageResult.images.filter((image) => image !== primaryImage),
				],
				scansCount: organismScans.length,
			},
			{
				headers: {
					// A transient R2 failure degrades to an empty image list rather
					// than a 500 (organism info is still useful without photos), but
					// that empty result must not get locked in by the long cache
					// lifetime — retry on the next request instead.
					'Cache-Control': imageResult.failed
						? 'no-store'
						: `public, s-maxage=${cacheMaxAge}, must-revalidate`,
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
