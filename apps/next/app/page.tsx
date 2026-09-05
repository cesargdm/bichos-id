import HomeScreen from '@/app/screens/Home'
import {
	featuredListOptions,
	latestListOptions,
	popularListOptions,
} from '@/app/screens/Home/utils'
import { getOrganisms } from '@/next/lib/db'
import { getOrganismsSchema } from '@/next/lib/schema'

// Rendered per request, not prerendered at build.
//
// The catalogue now lives in D1, and a D1 binding only exists inside a request:
// during `next build` there is no Worker context, so a prerender of this route
// would bake an empty catalogue into the deployed HTML and serve it until the
// revalidate window elapsed. Middleware sets a shared Cache-Control on the
// response so the edge still caches it.
export const dynamic = 'force-dynamic'

export default async function HomePage() {
	// Same parse the API route applies, so the server-rendered lists and the
	// client's revalidation fetch resolve these options identically — including
	// the string "true" -> boolean conversion for `identified`.
	const [latestsOrganismsData, popularOrganismsData, featuredOrganismsData] =
		await Promise.all([
			getOrganisms(getOrganismsSchema.parse(latestListOptions)),
			getOrganisms(getOrganismsSchema.parse(popularListOptions)),
			getOrganisms(getOrganismsSchema.parse(featuredListOptions)),
		])

	return (
		<HomeScreen
			latestsOrganismsData={latestsOrganismsData}
			popularOrganismsData={popularOrganismsData}
			featuredOrganismsData={featuredOrganismsData}
		/>
	)
}
