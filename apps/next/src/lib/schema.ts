import { z } from 'zod'

export const getOrganismsSchema = z.object({
	direction: z.enum(['asc', 'desc']).default('asc'),
	limit: z.number().min(1).max(100).default(50),
	query: z.string().max(100).default(''),
	sortBy: z
		.enum(['scan_count', 'created_at', 'common_name'])
		.default('common_name'),
})
