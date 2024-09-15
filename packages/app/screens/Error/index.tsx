import { View, Text } from 'react-native'

export default function ErrorScreen({ error }: { error: Error | undefined }) {
	return (
		<View style={{ flex: 1 }}>
			<Text style={{ color: 'white' }}>An error occurred</Text>
			{error && 'message' in error ? (
				<Text style={{ color: 'white' }}>{error.message}</Text>
			) : null}
		</View>
	)
}
