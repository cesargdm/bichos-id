import HomeScreen from '@/app/screens/Home'
import {
	featuredListOptions,
	latestListOptions,
	popularListOptions,
} from '@/app/screens/Home/utils'
import { getOrganisms } from '@/next/lib/db'

export const revalidate = 60 * 60 * 1 // 1 hour

export default async function HomePage() {
	const [latestsOrganismsData, popularOrganismsData, featuredOrganismsData] =
		await Promise.all([
			getOrganisms(latestListOptions),
			getOrganisms(popularListOptions),
			getOrganisms(featuredListOptions),
		])

	return (
		<HomeScreen
			latestsOrganismsData={latestsOrganismsData}
			popularOrganismsData={popularOrganismsData}
			featuredOrganismsData={featuredOrganismsData}
		/>
	)
}
