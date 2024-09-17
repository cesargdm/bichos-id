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
	core: require('./core.json') as License[],
	web: require('./web.json') as License[],
	app: require('./app.json') as License[],
} as const
