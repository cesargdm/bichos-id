'use client'

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
					display: 'flex',
					gap: 10,
					margin: 'auto',
					alignItems: 'center',
				}}
				action=""
			>
				<input
					style={{
						padding: 16,
						fontSize: 16,
						borderRadius: 8,
						border: '1px solid #ddd',
						backgroundColor: 'transparent',
					}}
					placeholder="Buscar bicho..."
					type="search"
				/>
				<button
					type="submit"
					style={{
						padding: 16,
						backgroundColor: '#ddd',
						border: 'none',
						borderRadius: 8,
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

			<h2>Nuevos descubrimientos</h2>
			<p>
				Explora los últimos descubrimientos realizados por nuestra comunidad.
				Cada día se identifican nuevas especies y se amplía nuestro conocimiento
				sobre el fascinante mundo de los artrópodos.
			</p>

			<h2>Destacados</h2>
			<p>Descripción de organismos curados por nuestros expertos.</p>
		</div>
	)
}
