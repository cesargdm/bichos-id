export interface Organism {
  id: string
  identification: {
    commonName: string
    scientificClassification: {
      genus: string
      species?: string
    }
    description?: string
    venomous: {
      type?: string
      level: 'NON_VENOMOUS' | 'MILDLY_VENOMOUS' | 'VENOMOUS' | 'HIGHLY_VENOMOUS'
    }
  }
  confidence: number
  createdAt: string
  updatedAt: string
}

export interface Database {
  organism: Organism
}
