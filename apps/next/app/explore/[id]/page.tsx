import { notFound } from 'next/navigation'

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

	return <DiscoveryDetailScreen fallbackData={organism} />
}
