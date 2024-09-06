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
  const handleUploadFile = useCallback(async (event) => {
    const file = event.target.files[0]

    const base64Image = await toBase64(file)

    const data = await Api.identify(base64Image)

    console.log(data)
  }, [])

  return (
    <>
      <h1>Bicho ID</h1>

      <label>
        <b>Subir imagen</b>
        <input type="file" accept="image/jpeg" onChange={handleUploadFile} />
      </label>

      <Link href="/explore">Ir a explorar</Link>
    </>
  )
}
