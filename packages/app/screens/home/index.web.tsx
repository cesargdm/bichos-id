'use client'

import { useCallback } from 'react'
import { Link } from 'solito/link'

import { Api } from '@bichos-id/app/lib/api'

function toBase64(file) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
  })
}

export default function HomeScreen() {
  const handleSubmitForm = useCallback(async (event) => {
    event.preventDefault()

    const file = event.target.elements.file.files[0]

    const base64Image = await toBase64(file)

    const data = await Api.identify(base64Image)

    if (data.id) {
      window.location.href = `/explore/${data.id}`
    }
  }, [])

  return (
    <>
      <h1>Bicho ID</h1>

      <form onSubmit={handleSubmitForm}>
        <label>
          <b>Imagen</b>
          <input name="file" type="file" accept="image/jpeg" />
        </label>
        <button type="submit">Identificar</button>
      </form>

      <Link href="/explore">
        <p>Ir a explorar</p>
      </Link>
    </>
  )
}
