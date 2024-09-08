'use client'

/* eslint-disable @next/next/no-img-element */
import { useCallback, useState } from 'react'

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
  const [isLoading, setIsLoading] = useState(false)
  const [imageData, setImageData] = useState<string | null>(null)

  const handleSubmitForm = useCallback(async (event) => {
    event.preventDefault()

    try {
      setIsLoading(true)

      const file = event.target.elements.file.files[0]

      const base64Image = await toBase64(file)

      console.log({ base64Image })

      const data = await Api.identify(base64Image)

      if (data.id) {
        // window.location.href = `/explore/${data.id}`
      }
    } finally {
      setIsLoading(false)
      setImageData(null)
    }
  }, [])

  const handleChangeFile = useCallback((event) => {
    const file = event.target.files[0]

    setImageData(URL.createObjectURL(file))
  }, [])

  return (
    <>
      <h1>Bicho ID</h1>
      <p>
        Identifica insectos, arácnidos y otros artrópodos usando Inteligencia
        Artificial.
      </p>

      <form
        style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
        onSubmit={handleSubmitForm}
      >
        <label
          style={{ cursor: 'pointer', padding: 16, backgroundColor: '#ddd' }}
        >
          {imageData ? (
            <img
              alt=""
              src={imageData}
              style={{ width: 100, height: 100, objectFit: 'cover' }}
            />
          ) : (
            <b>Seleccionar imagen</b>
          )}
          <input
            onChange={handleChangeFile}
            hidden
            name="file"
            type="file"
            accept="image/jpeg"
          />
        </label>

        <button
          disabled={isLoading}
          style={{
            padding: 16,
            backgroundColor: '#ddd',
            border: 'none',
            fontSize: '1rem',
          }}
          type="submit"
        >
          {isLoading ? 'Cargando...' : 'Identificar'}
        </button>
      </form>
    </>
  )
}
