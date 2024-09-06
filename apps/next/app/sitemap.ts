import type { MetadataRoute } from 'next'
import { createKysely } from '@vercel/postgres-kysely'

import { Database } from './api/v1/_db'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const db = createKysely<Database>()

    const organisms = await db.selectFrom('organism').selectAll().execute()

    return [
      {
        url: '/',
        lastModified: new Date(),
        priority: 1,
      },
      {
        url: '/discover',
        lastModified: new Date(),
        priority: 1,
      },
      ...organisms.map((organism) => ({
        url: `/discover/${organism.id}`,
        lastModified: organism.updated_at,
        priority: 1,
      })),
    ]
  } catch {
    return []
  }
}
