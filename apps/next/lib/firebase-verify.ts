/// <reference types="@cloudflare/workers-types" />

import { getCloudflareContext } from '@opennextjs/cloudflare'
import { Auth, WorkersKVStoreSingle } from 'firebase-auth-cloudflare-workers'

declare global {
	interface CloudflareEnv {
		FIREBASE_AUTH_EMULATOR_HOST: string | undefined
		FIREBASE_PROJECT_ID: string
		PUBLIC_JWK_CACHE_KEY: string
		PUBLIC_JWK_CACHE_KV: KVNamespace
	}
}

let auth: Auth | undefined

/**
 * Verifies a Firebase ID token against Google's public keys (cached in the
 * `PUBLIC_JWK_CACHE_KV` binding). Replaces `firebase-admin`'s
 * `getAuth().verifyIdToken`, which relies on Node internals unavailable on
 * Workers.
 *
 * Returns the decoded token claims (including `sub`, the Firebase uid), or
 * `undefined` if the token is missing or invalid.
 */
export async function verifyFirebaseIdToken(idToken: string | undefined) {
	if (!idToken) return undefined

	const { env } = await getCloudflareContext({ async: true })

	auth ??= Auth.getOrInitialize(
		env.FIREBASE_PROJECT_ID,
		WorkersKVStoreSingle.getOrInitialize(
			env.PUBLIC_JWK_CACHE_KEY,
			env.PUBLIC_JWK_CACHE_KV,
		),
	)

	return auth.verifyIdToken(idToken, false, env).catch(() => undefined)
}
