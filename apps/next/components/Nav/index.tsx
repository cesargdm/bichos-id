import Image from 'next/image'
import './styles.css'
import Link from 'next/link'

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
            <Link href="https://fucesa.com">Fucesa</Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}
