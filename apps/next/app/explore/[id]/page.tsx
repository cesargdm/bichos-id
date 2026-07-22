import type { Metadata } from 'next'

import { notFound } from 'next/navigation'

import { ASSETS_BASE_URL } from '@/app/lib/api/constants'
import DiscoveryDetailScreen from '@/app/screens/ExploreDetail'
import { getOrganism, isOrganismIndexable } from '@/next/lib/db'

type Props = {
	params: Promise<{ id: string }>
}

export const revalidate = 10800 // 3 hours

/**
 * Required for this route to be cached at all.
 *
 * Without `generateStaticParams`, Next renders a dynamic segment on every
 * request and `revalidate` above never engages — the route was serving
 * `x-vercel-cache: MISS` on repeat hits. Returning an empty array prerenders
 * nothing at build time (so build duration and OG-image generation are
 * unaffected) while opting every organism page into ISR: each is rendered once
 * on first visit, then served from cache until `revalidate` elapses.
 *
 * See https://nextjs.org/docs/app/api-reference/functions/generate-static-params
 * — "You must always return an array from generateStaticParams, even if it's
 * empty. Otherwise, the route will be dynamically rendered."
 */
export function generateStaticParams() {
	return []
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const id = (await params).id

	const organism = await getOrganism(id)

	if (!organism) {
		return notFound()
	}

	return {
		description: organism.description,
		// Incomplete taxonomy stubs are thin pages. Mark them noindex so they
		// stop being crawled as low-quality content, but keep `follow` so link
		// equity still flows through to the complete organisms they link to.
		...(isOrganismIndexable(organism)
			? null
			: { robots: { follow: true, index: false } }),
		title: organism.common_name,
	}
}

export default async function DiscoveryDetailPage({ params }: Props) {
	const id = (await params).id

	const organism = await getOrganism(id)

	if (!organism) {
		return notFound()
	}

	const jsonLd = {
		'@context': 'https://schema.org',
		'@type': 'Taxon',
		alternateName: organism.common_name,
		description: organism.description,
		identifier: organism.id,
		image: `${ASSETS_BASE_URL}/${organism.image_key}`,
		name: `${organism.classification?.genus} ${organism.classification?.species}`,
	}

	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>
			<DiscoveryDetailScreen
				fallbackData={{
					...organism,
					images: [`${ASSETS_BASE_URL}/${organism.image_key}`],
				}}
			/>
		</>
	)
}
