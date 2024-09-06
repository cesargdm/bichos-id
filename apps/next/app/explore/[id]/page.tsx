import { Suspense } from 'react'
import { notFound, useParams } from 'next/navigation'
import { createKysely } from '@vercel/postgres-kysely'

import DiscoveryDetailScreen from '@bichos-id/app/screens/ExploreDetail'

import { Database } from '../../api/v1/_db'

type Props = {
  params: { id: string }
}

export const dynamic = 'force-dynamic'

export const revalidate = 60 * 60 * 24 // 1 day

function getOrganism(id: string) {
  const db = createKysely<Database>()

  return db
    .selectFrom('organism')
    .where('id', '=', id)
    .selectAll()
    .executeTakeFirst()
}

export async function generateMetadata({ params }: Props) {
  const id = params.id

  const organism = await getOrganism(id)

  if (!organism) {
    return notFound()
  }

  return {
    title: `${organism.identification.commonName} - Bichos ID - Fucesa`,
    description: organism.identification.description,
  }
}

export default async function DiscoveryDetailPage({ params }: Props) {
  const id = params.id

  const organism = await getOrganism(id)

  return (
    <Suspense fallback={null}>
      <DiscoveryDetailScreen fallbackData={organism} />
    </Suspense>
  )
}
