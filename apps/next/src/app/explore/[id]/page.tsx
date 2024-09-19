import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import DiscoveryDetailScreen from '@/app/screens/ExploreDetail'
import { getOrganism } from '@/next/lib/db'

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

	return (
		<Suspense fallback={null}>
			<DiscoveryDetailScreen fallbackData={organism} />
		</Suspense>
	)
}
