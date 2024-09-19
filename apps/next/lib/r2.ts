import { S3Client } from '@aws-sdk/client-s3'

const {
	CLOUDFLARE_ACCOUNT_ID,
	R2_ACCESS_KEY_ID,
	R2_BUCKET_NAME,
	R2_SECRET_ACCESS_KEY,
} = process.env

export { R2_BUCKET_NAME }

export function getR2Client() {
	return new S3Client({
		credentials: {
			accessKeyId: R2_ACCESS_KEY_ID as string,
			secretAccessKey: R2_SECRET_ACCESS_KEY as string,
		},
		endpoint: `https://${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
		region: 'auto',
	})
}
