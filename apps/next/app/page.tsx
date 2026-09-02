import HomeScreen from '@/app/screens/Home'
import {
	featuredListOptions,
	latestListOptions,
	popularListOptions,
} from '@/app/screens/Home/utils'
import { getOrganisms } from '@/next/lib/db'
import { getOrganismsSchema } from '@/next/lib/schema'

export const revalidate = 3600 // 1 hour

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
