import type { Metadata } from 'next'

import ExploreScreen from '@/app/screens/Explore'
import { getOrganisms } from '@/next/lib/db'
import { getOrganismsSchema } from '@/next/lib/schema'

type Props = {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

// Rendered per request, not prerendered at build.
//
// The catalogue now lives in D1, and a D1 binding only exists inside a request:
// during `next build` there is no Worker context, so a prerender of this route
// would bake an empty catalogue into the deployed HTML and serve it until the
// revalidate window elapsed. Middleware sets a shared Cache-Control on the
// response so the edge still caches it.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
	description:
		'Descubre insectos, arácnidos y otros bichos con Bichos ID usando inteligencia artificial.',
	title: 'Explorar',
}

export default async function ExplorePage({ searchParams }: Props) {
	// Parsed with the same schema the API route uses. Passing the raw params
	// straight through sent the string "false" for `identified`, which is truthy
	// — so the server rendered a filtered list that the first SWR revalidation
	// then replaced with an unfiltered one.
	const parsed = getOrganismsSchema.safeParse(await searchParams)
	const organisms = await getOrganisms(
		parsed.success ? parsed.data : getOrganismsSchema.parse({}),
	)

	return <ExploreScreen fallbackData={organisms} />
}
