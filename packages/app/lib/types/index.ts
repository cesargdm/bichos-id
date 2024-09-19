export type Organism = {
	id: string
	common_name: string
	/** Scientific classification */
	classification: {
		phylum: string
		class: string
		order: string
		family: string
		genus?: string
		species?: string
	}
	description?: string
	habitat?: string
	metadata: {
		venomous: {
			type?: string
			level: 'NON_VENOMOUS' | 'VENOMOUS' | 'HIGHLY_VENOMOUS'
		}
	}
	scan_count: number
	taxonomy: 'SPECIES' | 'GENUS' | 'FAMILY'
	image_quality_rating: number
	image_key: string
	created_at: string
	updated_at: string
	created_by: string
}
