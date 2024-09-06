import { createKysely } from '@vercel/postgres-kysely'
import { NextResponse } from 'next/server'

import { Database } from '../_db'

export async function GET() {
  try {
    const db = createKysely<Database>()

    const organisms = await db.selectFrom('organism').selectAll().execute()

    return NextResponse.json(organisms)
  } catch {
    return NextResponse.json(
      { error: 'Failed to connect to database' },
      { status: 500 },
    )
  }
}
