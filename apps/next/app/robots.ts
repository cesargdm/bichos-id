import type { MetadataRoute } from 'next'

const origin = process.env.NEXT_PUBLIC_ORIGIN

export default function robots(): MetadataRoute.Robots {
	return {
		rules: {
			allow: '/',
			userAgent: '*',
		},
		sitemap: `${origin}/sitemap.xml`,
	}
}
