import Image from 'next/image'
import { useState } from 'react'
import { Link } from 'solito/link'

import type { Organism } from '@/app/lib/types'

import { getBlurUrl, getImageUrl } from '@/app/lib/api/constants'

const IMAGE_SIZE = 200

// Note: the <Image> below deliberately has no `sizes` prop. With one, Next
// emits a srcset candidate for every configured deviceSize/imageSize (15
// widths). Cloudflare bills per unique image+parameter combination, so a
// fixed-size card would burn ~15 transformations instead of the 2 it needs —
// without `sizes`, Next emits just 1x/2x off the width.

const styles = {
	caption: {
		background: 'linear-gradient(to top, rgba(0, 0, 0, 0.5), transparent)',
		bottom: 0,
		color: 'white',
		fontSize: 20,
		fontWeight: 'bold',
		left: 0,
		padding: 5,
		position: 'absolute',
		right: 0,
	},
	image: {
		flexShrink: 0,
		minWidth: IMAGE_SIZE,
		objectFit: 'cover',
	},
	link: {
		borderRadius: 16,
		flexShrink: 0,
		overflow: 'hidden',
		position: 'relative',
		width: IMAGE_SIZE,
	},
	placeholder: {
		backgroundColor: '#222',
		height: IMAGE_SIZE,
		width: IMAGE_SIZE,
	},
} as const

export default function Organism({ data }: { data: Organism }) {
	// Some organisms' image_key points at an R2 object that no longer exists.
	// Fall back to a plain placeholder instead of a broken image — but keep
	// the card itself (name + link to the organism), rather than removing it,
	// so a run of failures doesn't empty out the whole list.
	const [imageFailed, setImageFailed] = useState(false)

	return (
		<Link href={`/explore/${data.id}`} style={styles.link}>
			{imageFailed ? (
				<div style={styles.placeholder} />
			) : (
				<Image
					width={IMAGE_SIZE}
					height={IMAGE_SIZE}
					style={styles.image}
					src={getImageUrl(data.image_key)}
					placeholder="blur"
					blurDataURL={getBlurUrl(data.image_key)}
					alt={data.common_name}
					onError={() => setImageFailed(true)}
					onLoad={(event) => {
						// A defensive check, not a known-common case: a "load"
						// event with zero natural dimensions means the browser
						// couldn't decode the response as an image even though
						// the request itself succeeded.
						if (event.currentTarget.naturalWidth === 0) {
							setImageFailed(true)
						}
					}}
				/>
			)}
			<p style={styles.caption}>{data.common_name}</p>
		</Link>
	)
}
