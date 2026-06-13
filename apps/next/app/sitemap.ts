import type { MetadataRoute } from 'next'

import { getOrganisms, isOrganismIndexable } from '@/next/lib/db'

export const revalidate = 3600

const origin = process.env.NEXT_PUBLIC_ORIGIN

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	// Fetch the full organism set rather than the default 50-row page: the
	// completeness filter below must see every organism, otherwise incomplete
	// stubs sorting into the first page would shrink the sitemap and push
	// complete, indexable organisms out of it. 50,000 is the per-sitemap URL cap.
	const organisms = await getOrganisms({ limit: 50_000 })

	return [
		{
			lastModified: new Date(),
			priority: 1,
			url: `${origin}/`,
		},
		{
			lastModified: new Date(),
			priority: 1,
			url: `${origin}/explore`,
		},
		// Only emit complete organisms. Incomplete taxonomy stubs are marked
		// noindex on their detail page, so keeping them out of the sitemap avoids
		// advertising thin URLs that drag down crawl quality.
		...organisms.filter(isOrganismIndexable).map((organism) => ({
			lastModified: organism.updated_at,
			priority: 1,
			url: `${origin}/explore/${organism.id}`,
		})),
	]
}
