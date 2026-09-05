import type { MetadataRoute } from 'next'

import { getIndexableOrganismRefs } from '@/next/lib/db'

// Rendered per request, not prerendered at build.
//
// The catalogue now lives in D1, and a D1 binding only exists inside a request:
// during `next build` there is no Worker context, so a prerender of this route
// would bake an empty catalogue into the deployed HTML and serve it until the
// revalidate window elapsed. Middleware sets a shared Cache-Control on the
// response so the edge still caches it.
export const dynamic = 'force-dynamic'

const origin = process.env.NEXT_PUBLIC_ORIGIN

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const organisms = await getIndexableOrganismRefs()

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
