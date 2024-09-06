import { createKysely } from '@vercel/postgres-kysely'
import { NextResponse } from 'next/server'

import { Database } from '../../_db'

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const db = createKysely<Database>()

    const id = params.id

    const organism = await db
      .selectFrom('organism')
      .where('id', '=', id)
      .selectAll()
      .executeTakeFirst()

    return NextResponse.json({ organism })
  } catch {
    return NextResponse.json(
      { error: 'Failed to connect to database' },
      { status: 500 },
    )
  }
}
