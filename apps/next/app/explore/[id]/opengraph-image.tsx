import { ImageResponse } from '@vercel/og'
import { notFound } from 'next/navigation'

import { ASSETS_BASE_URL } from '@bichos-id/app/lib/api'

import { getOrganism } from './_db'

type Props = {
	params: { id: string }
}

export const runtime = 'edge'

export const size = {
	height: 630,
	width: 1200,
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
					height: '100%',
					width: '100%',
				}}
			>
				<img
					src={`${ASSETS_BASE_URL}/${organism.image_key}`}
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
						background:
							'linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0))',
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
			</div>
		),
	)
}
