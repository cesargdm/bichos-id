import { Suspense } from 'react'

import FeaturedOrganisms from './components/FeaturedOrganisms'
import LatestDiscoveries from './components/LatestDiscoveries'
import MostSearched from './components/MostSearched'

export default function HomeScreen() {
	return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
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
				action=""
			>
				<input
					style={{
						backgroundColor: 'transparent',
						border: '1px solid #ddd',
						borderRadius: 8,
						fontSize: 16,
						padding: 16,
					}}
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
				<MostSearched />
			</Suspense>

			<h2>Nuevos descubrimientos</h2>
			<p>
				Explora los últimos descubrimientos realizados por nuestra comunidad.
				Cada día se identifican nuevas especies y se amplía nuestro conocimiento
				sobre el fascinante mundo de los artrópodos.
			</p>
			<Suspense fallback={<div>Cargando...</div>}>
				<LatestDiscoveries />
			</Suspense>

			<h2>Destacados</h2>
			<p>Organismos curados por nuestros expertos.</p>
			<Suspense fallback={<div>Cargando...</div>}>
				<FeaturedOrganisms />
			</Suspense>
		</div>
	)
}
