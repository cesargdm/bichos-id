import { notFound } from 'next/navigation'

import { ASSETS_BASE_URL } from '@/app/lib/api/constants'
import DiscoveryDetailScreen from '@/app/screens/ExploreDetail'
import { getOrganism } from '@/next/lib/db'

type Props = {
	params: { id: string }
}

export const revalidate = 60 * 60 * 3 // 3 hours

export async function generateMetadata({ params }: Props) {
	const id = params.id

	const organism = await getOrganism(id)

	if (!organism) {
		return notFound()
	}

	return {
		description: organism.description,
		title: organism.common_name,
	}
}

export default async function DiscoveryDetailPage({ params }: Props) {
	const id = params.id

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
			<DiscoveryDetailScreen fallbackData={organism} />
		</>
	)
}
