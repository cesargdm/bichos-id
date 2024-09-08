import './styles.css'

export default function Footer() {
  return (
    <footer>
      <div className="content">
        <p>
          Esta herramienta se ofrece tal cual, sin ninguna garantía. No nos
          hacemos responsables de cualquier daño causado por su uso.
        </p>
        <p>
          © {new Date().getFullYear()} Bichos ID de{' '}
          <a href="https://fucesa.com">Fucesa</a>
        </p>
      </div>
    </footer>
  )
}
