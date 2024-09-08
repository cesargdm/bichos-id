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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h1>Bicho ID</h1>
      <p>
        Identifica insectos, arácnidos y otros artrópodos usando Inteligencia
        Artificial.
      </p>

      <form
        style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
        onSubmit={handleSubmitForm}
      >
        <label
          style={{
            borderRadius: 8,
            borderWidth: 2,
            borderColor: '#ccc',
            borderStyle: 'dashed',
            cursor: 'pointer',
            padding: 16,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 200,
          }}
        >
          {imageData ? (
            <img
              alt=""
              src={imageData}
              style={{ width: 100, height: 100, objectFit: 'cover' }}
            />
          ) : (
            <b>Selecciona o arrastra una fotografía</b>
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
            borderRadius: 8,
          }}
          type="submit"
        >
          {isLoading ? 'Cargando...' : 'Identificar'}
        </button>
      </form>
    </div>
  )
}
