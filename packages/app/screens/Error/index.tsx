import { View, Text, StyleSheet } from 'react-native'

const styles = StyleSheet.create({
	container: {
		alignItems: 'center',
		flex: 1,
		gap: 10,
		justifyContent: 'center',
	},
	title: { color: 'white', fontSize: 25 },
})

export default function ErrorScreen({ error }: { error: Error | undefined }) {
	return (
		<View style={styles.container}>
			<Text style={styles.title}>Ocurrió un error</Text>
			{error && 'message' in error ? (
				<Text style={{ color: 'white' }}>{error.message}</Text>
			) : null}
		</View>
	)
}
