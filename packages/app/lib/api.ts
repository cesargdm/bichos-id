export const API_BASE_URL = 'https://bichos-id.fucesa.com/api/v1'

export const ASSETS_BASE_URL = 'https://bichos-id.assets.fucesa.com'

export class Api {
  static async identify(base64Image: string) {
    return fetch(`${API_BASE_URL}/ai/vision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base64Image }),
    }).then((response) => response.json())
  }
  static async getOrganism(id: string) {
    return fetch(`${API_BASE_URL}/organisms/${id}`).then((response) =>
      response.json(),
    )
  }
}
