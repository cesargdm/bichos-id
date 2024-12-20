import type { MetadataRoute } from 'next'

import { getOrganisms } from '@/next/lib/db'

export const revalidate = 60

const origin = process.env.NEXT_PUBLIC_ORIGIN

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const organisms = await getOrganisms()

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
		...organisms.map((organism) => ({
			lastModified: organism.updated_at,
			priority: 1,
			url: `${origin}/explore/${organism.id}`,
		})),
	]
}
