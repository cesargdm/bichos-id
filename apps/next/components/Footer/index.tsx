import './styles.css'

import appStore from './app-store.svg'
import googlePlay from './google-play.svg'
import Image from 'next/image'

export default function Footer() {
	return (
		<footer>
			<div className="content">
				<p>
					Esta herramienta por ser preeliminar se ofrece tal cual, sin ninguna
					garantía. No nos hacemos responsables de cualquier daño causado por su
					uso.
				</p>
				<p>
					© {new Date().getFullYear()} Bichos ID de{' '}
					<a href="https://fucesa.com">Fucesa</a>
				</p>
				<ul>
					<li>
						<a href="https://apps.apple.com">
							<Image src={appStore as string} alt="App Store" />
						</a>
					</li>
					<li>
						<a href="https://play.google.com">
							<Image src={googlePlay as string} alt="Google Play" />
						</a>
					</li>
				</ul>
			</div>
		</footer>
	)
}
