import Image from 'next/image'
import Link from 'next/link'

import './styles.css'

export default function Nav() {
	return (
		<nav>
			<div className="content">
				<a href="/">
					<Image width={25} height={25} src="/favicon.svg" alt="" />
					Bichos ID
				</a>
				<ul>
					<li>
						<Link href="/explore">Explorar</Link>
					</li>
					<li>
						<b>Descargar</b>
					</li>
				</ul>
			</div>
		</nav>
	)
}
