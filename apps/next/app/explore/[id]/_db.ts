import { createKysely } from '@vercel/postgres-kysely'

import { Database } from '../../api/v1/_db'

export function getOrganism(id: string) {
  const db = createKysely<Database>()

  return db
    .selectFrom('organisms')
    .where('id', '=', id)
    .selectAll()
    .executeTakeFirst()
}
