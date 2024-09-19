'use client'

import { useServerInsertedHTML } from 'next/navigation'
import { StyleSheet } from 'react-native'

export function StylesProvider({ children }: { children: React.ReactNode }) {
	useServerInsertedHTML(() => {
		if ('getSheet' in StyleSheet && typeof StyleSheet.getSheet === 'function') {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			const sheet = StyleSheet.getSheet()

			return (
				<style
					// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
					dangerouslySetInnerHTML={{ __html: sheet.textContent }}
					// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
					id={sheet.id}
				/>
			)
		}
	})

	return children
}
