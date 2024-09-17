import Link from 'next/link'

export default function NotFound() {
	return (
		<div
			style={{
				flexDirection: 'column',
				display: 'flex',
				minHeight: '100%',
				justifyContent: 'center',
				alignItems: 'center',
				gap: 15,
			}}
		>
			<h1>No Encontrado</h1>
			<p>Lo siento, no se pudo encontrar la página que estás buscando.</p>
			<p>
				<Link style={{ color: 'inherit' }} href="/">
					Volver a la página de inicio
				</Link>
			</p>
		</div>
	)
}