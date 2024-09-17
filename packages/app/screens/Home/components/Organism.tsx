import { Link } from 'solito/link'
import Image from 'next/image'
import { Organism } from '../../../../../apps/next/app/api/v1/_db'
import { getImageUrl } from '@bichos-id/app/lib/api'

export default function Organism({ data }: { data: Organism }) {
	return (
		<Link href={`/explore/${data.id}`} style={{ position: 'relative' }}>
			<Image
				width={150}
				height={150}
				style={{
					objectFit: 'cover',
					flexShrink: 0,
					minWidth: 150,
				}}
				src={getImageUrl(data.image_key)}
				alt={data.common_name}
			/>
			<p
				style={{
					position: 'absolute',
					bottom: 0,
					left: 0,
					right: 0,
					padding: 5,
					background:
						'linear-gradient(to top, rgba(0, 0, 0, 0.5), transparent)',
					color: 'white',
					fontSize: 20,
					fontWeight: 'bold',
				}}
			>
				{data.common_name}
			</p>
		</Link>
	)
}
