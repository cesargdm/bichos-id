import type { MetadataRoute } from 'next'
import { createKysely } from '@vercel/postgres-kysely'

import { Database } from './api/v1/_db'

export const dynamic = 'force-dynamic'

export const revalidate = 60

const origin = process.env.NEXT_PUBLIC_ORIGIN

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const db = createKysely<Database>()

  const organisms = await db.selectFrom('organisms').selectAll().execute()

  return [
    {
      url: `${origin}/`,
      lastModified: new Date(),
      priority: 1,
    },
    {
      url: `${origin}/explore`,
      lastModified: new Date(),
      priority: 1,
    },
    ...organisms.map((organism) => ({
      url: `${origin}/explore/${organism.id}`,
      lastModified: organism.updated_at,
      priority: 1,
    })),
  ]
}
