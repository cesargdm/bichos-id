import { ListObjectsCommand } from '@aws-sdk/client-s3'
import * as Sentry from '@sentry/nextjs'
import { NextResponse } from 'next/server'

import { DETAIL_IMAGE_WIDTH, getImageUrl } from '@/app/lib/api/constants'
import { buildScanPrefix, repairLegacyOrganismId } from '@/app/lib/organism-id'
import { getOrganism, getOrganismScans } from '@/next/lib/db'
import { getR2BucketName, getR2Client } from '@/next/lib/r2'

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
				Bucket: getR2BucketName(),
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
			return { failed: true, images: [] as string[] }
		})
}

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const id = (await params).id

		const [organism, organismScans] = await Promise.all([
			getOrganism(id),
			getOrganismScans(id),
		])

		// Without this an unknown id spreads `undefined` into the response and
		// returns 200 with `{"images":[],"scansCount":0}`, so callers can't tell
		// a missing organism from one that simply has no photos.
		if (!organism) {
			// The native apps open universal links straight against this endpoint,
			// so they never see the web redirect. Point a legacy id at its current
			// row here too, rather than 404ing an old shared link.
			const repaired = repairLegacyOrganismId(id)

			if (repaired !== id && (await getOrganism(repaired))) {
				return NextResponse.redirect(
					new URL(`/api/v1/organisms/${repaired}`, request.url),
					301,
				)
			}

			return NextResponse.json({ error: 'Not found' }, { status: 404 })
		}

		// Derived from the classification rather than the slug: the slug drops
		// unidentified ranks, which would make a family's prefix an ancestor of
		// every species below it and pull their photos into its carousel.
		const imageResult = await getOrganismImages(
			buildScanPrefix([
				organism.classification?.family,
				organism.classification?.genus,
				organism.classification?.species,
			]),
		)

		const primaryImage = getImageUrl(organism.image_key, {
			width: DETAIL_IMAGE_WIDTH,
		})

		// A successful listing is the authority on what exists in R2, including
		// when it comes back empty: that is positive evidence the organism's
		// `image_key` points at a deleted object, so leading with it would cache a
		// broken image for the full three hours.
		//
		// A *failed* listing is the opposite — it says nothing either way, and
		// returning `[]` there is what made the detail page render its
		// server-side image and then blank out on SWR revalidation. Only that
		// case falls back to the unverified primary image.
		const images = imageResult.failed
			? [primaryImage]
			: imageResult.images.includes(primaryImage)
				? [
						primaryImage,
						...imageResult.images.filter((image) => image !== primaryImage),
					]
				: imageResult.images

		return NextResponse.json(
			{
				...organism,
				images,
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
