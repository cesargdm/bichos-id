import { Suspense } from 'react'

import type { Props } from './utils'

import FeaturedOrganisms from './components/FeaturedList'
import LatestsOrganisms from './components/LatestsList'
import PopularOrganisms from './components/PopularList'

export default function HomeScreen(props: Props) {
	const { featuredOrganismsData, latestsOrganismsData, popularOrganismsData } =
		props

	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				gap: 20,
				width: '100%',
			}}
		>
			<h1>Descubre insectos, arácnidos y otros artrópodos</h1>
			<p>
				Identifica insectos, arácnidos y otros artrópodos usando Inteligencia
				Artificial.
			</p>

			<form
				style={{
					alignItems: 'center',
					display: 'flex',
					gap: 10,
					margin: 'auto',
				}}
				method="get"
				action="/explore"
			>
				<input
					style={{
						backgroundColor: 'transparent',
						border: '1px solid #ddd',
						borderRadius: 8,
						color: 'white',
						fontSize: 16,
						padding: 16,
					}}
					name="query"
					placeholder="Buscar bicho..."
					type="search"
				/>
				<button
					type="submit"
					style={{
						backgroundColor: '#ddd',
						border: 'none',
						borderRadius: 8,
						padding: 16,
					}}
				>
					Buscar
				</button>
			</form>

			<h2>Los más buscados</h2>
			<p>
				Descubre los bichos más buscados por la comunidad de Bicho ID. ¿Ya los
				has encontrado?
			</p>

			<Suspense fallback={<div>Cargando...</div>}>
				<PopularOrganisms fallbackData={popularOrganismsData} />
			</Suspense>

			<h2>Nuevos descubrimientos</h2>
			<p>
				Explora los últimos descubrimientos realizados por nuestra comunidad.
				Cada día se identifican nuevas especies y se amplía nuestro conocimiento
				sobre el fascinante mundo de los artrópodos.
			</p>
			<Suspense fallback={<div>Cargando...</div>}>
				<LatestsOrganisms fallbackData={latestsOrganismsData} />
			</Suspense>

			<h2>Destacados</h2>
			<p>Organismos curados por nuestros expertos.</p>
			<Suspense fallback={<div>Cargando...</div>}>
				<FeaturedOrganisms fallbackData={featuredOrganismsData} />
			</Suspense>
		</div>
	)
}
