'use client'

import { useCallback } from 'react'
import {
	Image,
	View,
	Pressable,
	Text,
	Platform,
	StyleSheet,
} from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { NativeStackNavigationOptions } from '@react-navigation/native-stack'
import { useItem } from '@bichos-id/app/lib/hooks'
import { useRouter } from 'solito/navigation'
import { Link } from 'solito/link'

const styles = StyleSheet.create({
	container: {
		gap: 30,
		padding: 30,
		flex: 1,
	},
	title: {
		textAlign: 'center',
		fontSize: 20,
		fontWeight: 'bold',
		color: 'white',
	},
})

function SettingsScreen() {
	const [onboarding, setOnboarding] = useItem<'completed'>(
		'@bichos-id/onboarding',
	)
	const router = useRouter()

	const handleDismiss = useCallback(async () => {
		await setOnboarding('completed')

		router.back()
	}, [setOnboarding, router])

	if (onboarding === 'completed' || Platform.OS === 'web') {
		return (
			<>
				<StatusBar style="light" />
				<View style={styles.container}>
					<Text style={styles.title}>Bichos ID</Text>
					<Link href="https://bichos-id.fucesa.com/licenses">
						<Text style={{ color: 'white', fontWeight: 'bold' }}>
							Licencias
						</Text>
						<Text style={{ color: 'white' }}>
							Librerías usadas, agradecimientos y licencias.
						</Text>
					</Link>
					<Link href="https://bichos-id.fucesa.com/terms">
						<Text style={{ color: 'white', fontWeight: 'bold' }}>
							Términos y Condiciones
						</Text>
						<Text style={{ color: 'white' }}>
							Lee nuestros términos y condiciones de uso.
						</Text>
					</Link>
					<Link href="https://bichos-id.fucesa.com/privacy">
						<Text style={{ color: 'white', fontWeight: 'bold' }}>
							Política de Privacidad
						</Text>
						<Text style={{ color: 'white' }}>
							Lee sobre cómo manejamos y protegemos tus datos.
						</Text>
					</Link>
					<Link href="https://github.com/cesargdm/bichos-id">
						<Text style={{ color: 'white', fontWeight: 'bold' }}>
							Repositorio
						</Text>
						<Text style={{ color: 'white' }}>
							Código abierto de Bichos ID en GitHub.
						</Text>
					</Link>
				</View>
			</>
		)
	}

	return (
		<>
			<StatusBar style="light" />
			<View style={styles.container}>
				<Text style={styles.title} role="heading" aria-level={1}>
					Bichos ID
				</Text>
				<Text style={{ color: 'white' }}>
					Antes de comenzar queremos que entiendas algunas cosas importantes:
				</Text>
				<View
					style={{
						flexDirection: 'row',
						gap: 10,
						alignItems: 'center',
					}}
				>
					<Image style={{ width: 75, height: 75, backgroundColor: 'white' }} />
					<View style={{ flex: 1 }}>
						<Text style={{ color: 'white', fontWeight: 'bold' }}>
							Podemos cometer errores
						</Text>
						<Text style={{ color: 'white', opacity: 0.66 }}>
							Nuestra AI puede realizar identificaciones inexactas.{' '}
							<Text style={{ fontWeight: 'bold' }}>
								No uses el app para diagnósticos sensibles.
							</Text>
						</Text>
					</View>
				</View>
				<View
					style={{
						flexDirection: 'row',
						gap: 10,
						alignItems: 'center',
					}}
				>
					<Image style={{ width: 75, height: 75, backgroundColor: 'white' }} />
					<View style={{ flex: 1 }}>
						<Text style={{ color: 'white', fontWeight: 'bold' }}>
							Pólitica de uso justo
						</Text>
						<Text style={{ color: 'white', opacity: 0.66 }}>
							En nuestro modo gratuito, podrás hacer un número limitado de
							identificaciones al día.
						</Text>
					</View>
				</View>

				<Text
					style={{
						color: 'white',
						textAlign: 'center',
						marginTop: 'auto',
					}}
				>
					Si aceptas los términos y condiciones, puedes continuar.
				</Text>
				<Pressable
					onPress={handleDismiss}
					style={{
						padding: 10,
						backgroundColor: 'white',
						justifyContent: 'center',
						alignItems: 'center',
						borderRadius: 10,
						marginBottom: 30,
					}}
				>
					<Text style={{ fontSize: 15 }}>Entendido</Text>
				</Pressable>
			</View>
		</>
	)
}

SettingsScreen.options = {
	headerTintColor: 'white',
	headerBackTitleVisible: false,
	presentation: 'modal',
	headerShown: false,
} as NativeStackNavigationOptions

export default SettingsScreen
