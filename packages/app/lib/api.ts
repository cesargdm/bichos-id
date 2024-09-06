import { Platform } from 'react-native'

export const API_BASE_URL =
  Platform.OS === 'web' ? '/api/v1' : 'https://bichos-id.fucesa.com/api/v1'

export const ASSETS_BASE_URL = 'https://bichos-id.assets.fucesa.com'

export const fetcher = (url: string) =>
  fetch(url).then((response) => response.json())

export class Api {
  static async identify(base64Image: string) {
    return fetch(`${API_BASE_URL}/ai/vision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base64Image }),
    }).then((response) => response.json())
  }

  static getOrganismKey(id: string) {
    return `${API_BASE_URL}/organisms/${id}`
  }

  static getOrganismsKey() {
    return `${API_BASE_URL}/organisms`
  }
}
