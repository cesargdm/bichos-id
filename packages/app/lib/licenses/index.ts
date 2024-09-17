/* eslint-disable @typescript-eslint/no-require-imports */
export type License = {
	department: string
	relatedTo: string
	name: string
	licensePeriod: string
	material: string
	licenseType: string
	link: string
	remoteVersion: string
	installedVersion: string
	definedVersion: string
	author: string
}

export const licenses = {
	app: require('./app.json') as License[],
	core: require('./core.json') as License[],
	web: require('./web.json') as License[],
} as const
