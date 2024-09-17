import './styles.css'

import appStore from './app-store.svg'
import googlePlay from './google-play.svg'
import Image from 'next/image'

export default function Footer() {
	return (
		<footer>
			<div className="content">
				<div>
					<p>
						La información es solo informativa y puede presentar errores.
						Contenido compartido bajo{' '}
						<a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>
						.
					</p>
					<p>
						© {new Date().getFullYear()} Bichos ID de{' '}
						<a href="https://fucesa.com">Fucesa</a>
					</p>
				</div>

				<ul>
					<li>
						<a href="/terms">Términos y Condiciones</a>
					</li>
					<li>
						<a href="/privacy">Política de Privacidad</a>
					</li>
					<li>
						<a href="/settings">Ajustes</a>
					</li>
					<li>
						<a href="/licenses">Licencias</a>
					</li>
				</ul>

				<ul>
					<li>
						<a href="https://apps.apple.com/app/bichos-id/id6689492259">
							<Image src={appStore as string} alt="App Store" />
						</a>
					</li>
					<li>
						<a href="https://play.google.com/store/apps/details?id=com.fucesa.bichos_id">
							<Image src={googlePlay as string} alt="Google Play" />
						</a>
					</li>
				</ul>
			</div>
		</footer>
	)
}
