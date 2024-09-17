import Link from 'next/link'

export default function NotFound() {
	return (
		<div>
			<h1>No Encontrado</h1>
			<p>Lo siento, no se pudo encontrar la página que estás buscando.</p>
			<p>
				<Link href="/">Volver a la página de inicio</Link>
			</p>
		</div>
	)
}
