'use client'

import { useServerInsertedHTML } from 'next/navigation'
import { StyleSheet } from 'react-native'

export function StylesProvider({ children }: { children: React.ReactNode }) {
	useServerInsertedHTML(() => {
		if ('getSheet' in StyleSheet && typeof StyleSheet.getSheet === 'function') {
			// react-native-web extension, not part of the react-native types
			const getSheet = StyleSheet.getSheet as () => {
				id: string
				textContent: string
			}
			const sheet = getSheet()

			return (
				<style
					dangerouslySetInnerHTML={{ __html: sheet.textContent }}
					id={sheet.id}
				/>
			)
		}
	})

	return children
}
