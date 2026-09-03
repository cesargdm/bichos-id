import { S3Client } from '@aws-sdk/client-s3'

/**
 * Every value is read inside the function, not destructured at module scope.
 *
 * On Workers `process.env` is populated from the Cloudflare bindings per
 * request; at module-initialisation time the secrets aren't there yet. Reading
 * them once at import gave the client `undefined` credentials for the life of
 * the isolate, so every R2 call failed with `Unauthorized` no matter what
 * secrets were configured — the same trap `Redis.fromEnv()` has in proxy.ts.
 */
export function getR2BucketName() {
	return process.env.R2_BUCKET_NAME
}

export function getR2Client() {
	return new S3Client({
		credentials: {
			accessKeyId: process.env.R2_ACCESS_KEY_ID as string,
			secretAccessKey: process.env.R2_SECRET_ACCESS_KEY as string,
		},
		endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
		region: 'auto',
	})
}
