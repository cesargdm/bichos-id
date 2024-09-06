import { createKysely } from '@vercel/postgres-kysely'
import { NextResponse } from 'next/server'
import { ListObjectsCommand } from '@aws-sdk/client-s3'

import { Database } from '../../_db'
import { getR2Client, R2_BUCKET_NAME } from '../../_r2'

export const revalidate = 60 * 60 * 1 // 1 hour

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const db = createKysely<Database>()

    const id = params.id

    const [organism, images] = await Promise.all([
      db
        .selectFrom('organism')
        .where('id', '=', id)
        .selectAll()
        .executeTakeFirst(),
      await getR2Client()
        .send(
          new ListObjectsCommand({
            Bucket: R2_BUCKET_NAME,
            Prefix: `organisms/${id}`,
          }),
        )
        .catch(() => ({ Contents: [] }))
        .then(({ Contents = [] }) =>
          Contents.map(
            ({ Key }) => `https://bichos-id.assets.fucesa.com/${Key}`,
          ),
        ),
    ])

    return NextResponse.json({ ...organism, images })
  } catch {
    return NextResponse.json(
      { error: 'Failed to connect to database' },
      { status: 500 },
    )
  }
}
