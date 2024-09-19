import Image from 'next/image'
import Link from 'next/link'

import appStore from './app-store.svg'
import googlePlay from './google-play.svg'
import './styles.css'

export default function Footer() {
	return (
		<footer>
			<div className="content">
				<div>
					<p>
						La información es solo informativa y puede presentar errores.
						Contenido compartido bajo{' '}
						<Link href="https://creativecommons.org/licenses/by/4.0/">
							CC BY 4.0
						</Link>
						.
					</p>
					<p>
						© {new Date().getFullYear()} Bichos ID de{' '}
						<Link href="https://fucesa.com">Fucesa</Link>
					</p>
				</div>

				<ul>
					<li>
						<Link href="/terms">Términos y Condiciones</Link>
					</li>
					<li>
						<Link href="/privacy">Política de Privacidad</Link>
					</li>
					<li>
						<Link href="/settings">Ajustes</Link>
					</li>
					<li>
						<Link href="/licenses">Licencias</Link>
					</li>
				</ul>

				<ul>
					<li>
						<Link href="https://apps.apple.com/app/bichos-id/id6689492259">
							<Image height="40" src={appStore as string} alt="App Store" />
						</Link>
					</li>
					<li>
						<Link href="https://play.google.com/store/apps/details?id=com.fucesa.bichos_id">
							<Image height="40" src={googlePlay as string} alt="Google Play" />
						</Link>
					</li>
				</ul>
			</div>
		</footer>
	)
}
