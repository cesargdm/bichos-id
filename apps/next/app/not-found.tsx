import Link from 'next/link'

const styles = {
	container: {
		alignItems: 'center',
		display: 'flex',
		flexDirection: 'column',
		gap: 15,
		justifyContent: 'center',
		minHeight: '100%',
	},
	link: {
		color: 'inherit',
	},
} as const

export default function NotFound() {
	return (
		<div style={styles.container}>
			<h1>No Encontrado</h1>
			<p>Lo siento, no se pudo encontrar la página que estás buscando.</p>
			<p>
				<Link style={styles.link} href="/">
					Volver a la página de inicio
				</Link>
			</p>
		</div>
	)
}
