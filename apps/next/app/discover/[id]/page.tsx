import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { createKysely } from '@vercel/postgres-kysely'

import DiscoveryDetailScreen from '@bichos-id/app/screens/ExploreDetail'

import { Database } from '../../api/v1/_db'

type Props = {
  params: { id: string }
}

export const dynamic = 'force-dynamic'

export const revalidate = 60 * 60 * 24 // 1 day

export async function generateMetadata({ params }: Props) {
  const db = createKysely<Database>()
  const id = params.id

  const organism = await db
    .selectFrom('organism')
    .select('identification')
    .where('id', '=', id)
    .executeTakeFirst()

  if (!organism) {
    return notFound()
  }

  return {
    title: `${organism.identification.commonName} - Bichos ID - Fucesa`,
    description: organism.identification.description,
  }
}

export default function DiscoveryDetailPage() {
  return (
    <Suspense fallback={null}>
      <DiscoveryDetailScreen />
    </Suspense>
  )
}
