import Image from 'next/image'
import { Link } from 'solito/link'

import { getImageUrl } from '@bichos-id/app/lib/api'

import type { Organism } from '../../../../../apps/next/app/api/v1/_db'

export default function Organism({ data }: { data: Organism }) {
	return (
		<Link href={`/explore/${data.id}`} style={{ position: 'relative' }}>
			<Image
				width={150}
				height={150}
				style={{
					flexShrink: 0,
					minWidth: 150,
					objectFit: 'cover',
				}}
				src={getImageUrl(data.image_key)}
				alt={data.common_name}
			/>
			<p
				style={{
					background:
						'linear-gradient(to top, rgba(0, 0, 0, 0.5), transparent)',
					bottom: 0,
					color: 'white',
					fontSize: 20,
					fontWeight: 'bold',
					left: 0,
					padding: 5,
					position: 'absolute',
					right: 0,
				}}
			>
				{data.common_name}
			</p>
		</Link>
	)
}
