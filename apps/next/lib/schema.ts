import { z } from 'zod'

export const getOrganismsSchema = z.object({
	direction: z.enum(['asc', 'desc']).default('asc'),
	// Not `z.coerce.boolean()`: that treats any non-empty string as true, so
	// "identified=false" would read as true.
	identified: z
		.enum(['true', 'false'])
		.default('false')
		.transform((value) => value === 'true'),
	limit: z.coerce.number().min(1).max(100).default(50),
	query: z.string().max(100).default(''),
	sortBy: z
		.enum(['scan_count', 'created_at', 'common_name'])
		.default('common_name'),
})
