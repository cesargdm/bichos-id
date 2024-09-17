import { Suspense } from 'react'
import { notFound } from 'next/navigation'

import DiscoveryDetailScreen from '@bichos-id/app/screens/ExploreDetail'
import { getOrganism } from './_db'

type Props = {
	params: { id: string }
}

export const dynamic = 'force-dynamic'

export const revalidate = 60 * 60 * 24 // 1 day

export async function generateMetadata({ params }: Props) {
	const id = params.id

	const organism = await getOrganism(id)

	if (!organism) {
		return notFound()
	}

	return {
		title: organism.common_name,
		description: organism.description,
	}
}

export default async function DiscoveryDetailPage({ params }: Props) {
	const id = params.id

	const organism = await getOrganism(id)

	return (
		<Suspense fallback={null}>
			<DiscoveryDetailScreen fallbackData={organism} />
		</Suspense>
	)
}
