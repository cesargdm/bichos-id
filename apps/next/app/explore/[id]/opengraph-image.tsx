import { ImageResponse } from '@vercel/og'
import { notFound } from 'next/navigation'

import { getOrganism } from './_db'
import { ASSETS_BASE_URL } from '@bichos-id/app/lib/api'

type Props = {
	params: { id: string }
}

export const runtime = 'edge'

export const size = {
	width: 1200,
	height: 630,
}

export const contentType = 'image/png'

export default async function Image({ params }: Props) {
	const id = params.id

	const organism = await getOrganism(id)

	if (!organism) {
		return notFound()
	}

	return new ImageResponse(
		(
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					width: '100%',
					height: '100%',
				}}
			>
				<img
					src={`${ASSETS_BASE_URL}/${organism.image_key}`}
					style={{
						position: 'absolute',
						top: 0,
						left: 0,
						height: '100%',
						width: '100%',
						objectFit: 'cover',
					}}
				/>
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						fontSize: 50,
						fontWeight: '600',
						background:
							'linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0))',
						width: '100%',
						height: '100%',
						padding: 20,
						paddingRight: 100,
						paddingLeft: 100,
						color: 'white',
						justifyContent: 'flex-end',
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
			</div>
		),
	)
}
