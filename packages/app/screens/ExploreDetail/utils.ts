import type { Organism } from '@/app/lib/types'

export function getVenomousLabel(level: string) {
	switch (level) {
		case 'HIGHLY_VENOMOUS':
			return 'Importancia médica'
		case 'VENOMOUS':
			return 'Precaución médica'
		case 'NON_VENOMOUS':
			return 'Sin importancia médica'
		default:
			return level
	}
}

export function getVenomousColor(level: string) {
	switch (level) {
		case 'HIGHLY_VENOMOUS':
			return 'rgba(255,0,0,0.2)'
		case 'VENOMOUS':
			return 'rgba(238, 207, 5, 0.2)'
		default:
			return 'rgba(255,255,255,0.1)'
	}
}

export function getTaxonomyLabel(data: Organism['taxonomy']) {
	return {
		FAMILY: 'Familia',
		GENUS: 'Género',
		SPECIES: 'Especie',
	}[data]
}
