import { licenses, type License } from '@/app/lib/licenses'

import './style.css'

function cleanAuthor(author: string): string {
	return author.split(/ <|\(|https?:\/\/|@|mailto:/)[0]?.trim() ?? ''
}

function cleanLicenseLink(link: string): string {
	return link.replace(/^git\+/, '')
}

function License({ license }: { license: License }) {
	return (
		<li>
			<p>
				<a href={cleanLicenseLink(license.link)}>{license.name}</a> (
				{license.licenseType})
			</p>
		</li>
	)
}

function groupByAuthor(licenses: License[]) {
	return licenses.reduce(
		(acc, license) => {
			const cleanedAuthor = cleanAuthor(license.author)
			if (!acc[cleanedAuthor]) {
				acc[cleanedAuthor] = [license]
			} else {
				acc[cleanedAuthor]?.push(license)
			}
			return acc
		},
		{} as Record<string, License[]>,
	)
}

export default function Licenses() {
	const coreLicensesByAuthor = groupByAuthor(licenses.core)
	const webLicensesByAuthor = groupByAuthor(licenses.web)
	const appLicensesByAuthor = groupByAuthor(licenses.app)

	return (
		<div className="container">
			<h1>Licenses</h1>

			<p>
				Bichos ID no podría existir sin las maravillosas librerías que se
				encuentran enlistadas a continuación. Queremos extender nuestro sentido
				de gratitud hacia los autores y mantenedores de este código abierto.
			</p>

			<h2>Core</h2>
			{Object.entries(coreLicensesByAuthor).map(([author, licenses]) => (
				<div key={author}>
					<h3>{author}</h3>
					<ul>
						{licenses.map((license) => (
							<License key={license.name} license={license} />
						))}
					</ul>
				</div>
			))}

			<h2>Web</h2>
			{Object.entries(webLicensesByAuthor).map(([author, licenses]) => (
				<div key={author}>
					<h3>{author}</h3>
					<ul>
						{licenses.map((license) => (
							<License key={license.name} license={license} />
						))}
					</ul>
				</div>
			))}

			<h2>App</h2>
			{Object.entries(appLicensesByAuthor).map(([author, licenses]) => (
				<div key={author}>
					<h3>{author}</h3>
					<ul>
						{licenses.map((license) => (
							<License key={license.name} license={license} />
						))}
					</ul>
				</div>
			))}
		</div>
	)
}
