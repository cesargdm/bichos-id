import type { Metadata } from 'next'

import { notFound, permanentRedirect } from 'next/navigation'

import { repairLegacyOrganismId } from '@/app/lib/organism-id'

import {
	DETAIL_IMAGE_WIDTH,
	getImageUrl,
	SOCIAL_IMAGE_WIDTH,
} from '@/app/lib/api/constants'
import DiscoveryDetailScreen from '@/app/screens/ExploreDetail'
import {
	getFamilyMembers,
	getOrganism,
	isOrganismIndexable,
} from '@/next/lib/db'

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

/**
 * Resolves an id to its organism, following the repeated-rank repair when the
 * id misses. Shared with `generateMetadata` because that runs first: if it
 * called `notFound()` on a legacy id, the 404 would win before the page ever
 * got the chance to redirect.
 *
 * `getOrganism` is request-cached, so the repeated lookups collapse.
 */
async function resolveOrganism(id: string) {
	const organism = await getOrganism(id)

	if (organism) return { canonicalId: id, organism }

	const repaired = repairLegacyOrganismId(id)

	if (repaired !== id) {
		const repairedOrganism = await getOrganism(repaired)

		if (repairedOrganism) {
			return { canonicalId: repaired, organism: repairedOrganism }
		}
	}

	return { canonicalId: id, organism: undefined }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const id = (await params).id

	const { organism } = await resolveOrganism(id)

	if (!organism) {
		return notFound()
	}

	// The organism's own photo, rather than a card rendered by next/og. That
	// route returned 500 for every request in production: Satori and resvg need
	// to compile WebAssembly at runtime and Workers disallows it
	// ("Wasm code generation disallowed by embedder"), so each crawler hit
	// burned CPU to fail. A real photo is a better preview anyway, and this URL
	// is the one the JSON-LD already references — so it adds no new billed
	// image transformation.
	const socialImage = getImageUrl(organism.image_key, {
		width: SOCIAL_IMAGE_WIDTH,
	})

	return {
		description: organism.description,
		openGraph: {
			description: organism.description,
			images: [socialImage],
			title: organism.common_name,
			type: 'article',
		},
		// Incomplete taxonomy stubs are thin pages. Mark them noindex so they
		// stop being crawled as low-quality content, but keep `follow` so link
		// equity still flows through to the complete organisms they link to.
		...(isOrganismIndexable(organism)
			? null
			: { robots: { follow: true, index: false } }),
		title: organism.common_name,
		twitter: {
			card: 'summary_large_image',
			description: organism.description,
			images: [socialImage],
			title: organism.common_name,
		},
	}
}

export default async function DiscoveryDetailPage({ params }: Props) {
	const id = (await params).id

	const { canonicalId, organism } = await resolveOrganism(id)

	if (!organism) {
		return notFound()
	}

	if (canonicalId !== id) {
		permanentRedirect(`/explore/${canonicalId}`)
	}

	const familyMembers = await getFamilyMembers(
		organism.classification?.family ?? '',
		organism.id,
	)

	const jsonLd = {
		'@context': 'https://schema.org',
		'@type': 'Taxon',
		alternateName: organism.common_name,
		description: organism.description,
		identifier: organism.id,
		image: getImageUrl(organism.image_key, { width: SOCIAL_IMAGE_WIDTH }),
		// Only the ranks that exist — an unidentified genus/species used to
		// render this as the literal "undefined undefined".
		name:
			[organism.classification?.genus, organism.classification?.species]
				.filter(Boolean)
				.join(' ') ||
			organism.classification?.family ||
			organism.common_name,
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
					images: [
						getImageUrl(organism.image_key, { width: DETAIL_IMAGE_WIDTH }),
					],
				}}
				familyMembers={familyMembers}
			/>
		</>
	)
}
