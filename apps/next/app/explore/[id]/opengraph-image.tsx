import { notFound } from 'next/navigation'
import { ImageResponse } from 'next/og'

import { getImageUrl, SOCIAL_IMAGE_WIDTH } from '@/app/lib/api/constants'
import { getOrganism } from '@/next/lib/db'

type Props = {
	params: Promise<{ id: string }>
}

export const size = {
	height: 630,
	width: 1200,
}

// Same reasoning as the page: without this the OG image is regenerated on
// every request. Satori rendering plus the remote image fetch is expensive and
// social crawlers hit these repeatedly, so let each one cache after first use.
export function generateStaticParams() {
	return []
}

export const contentType = 'image/png'

export default async function Image({ params }: Props) {
	const id = (await params).id

	const organism = await getOrganism(id)

	if (!organism) {
		return notFound()
	}

	return new ImageResponse(
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				height: '100%',
				width: '100%',
			}}
		>
			<img
				src={getImageUrl(organism.image_key, {
					width: SOCIAL_IMAGE_WIDTH,
				})}
				style={{
					height: '100%',
					left: 0,
					objectFit: 'cover',
					position: 'absolute',
					top: 0,
					width: '100%',
				}}
			/>
			<div
				style={{
					background: 'linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0))',
					color: 'white',
					display: 'flex',
					flexDirection: 'column',
					fontSize: 50,
					fontWeight: '600',
					height: '100%',
					justifyContent: 'flex-end',
					padding: 20,
					paddingLeft: 100,
					paddingRight: 100,
					width: '100%',
				}}
			>
				<p
					style={{
						fontSize: 100,
						fontWeight: '800',
						margin: 0,
					}}
				>
					{organism.common_name}
				</p>
			</div>
		</div>,
	)
}
