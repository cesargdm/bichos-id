import { ImageResponse } from '@vercel/og'
import { notFound } from 'next/navigation'

import { getOrganism } from './_db'

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
          fontSize: 128,
          background: 'white',
          width: '100%',
          height: '100%',
        }}
      >
        Hello, World!
      </div>
    ),
  )
}
