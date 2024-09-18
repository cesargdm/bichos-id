/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment */
'use client'

import type { NativeStackNavigationOptions } from '@react-navigation/native-stack'

import AsyncStorage from '@react-native-async-storage/async-storage'
import { StatusBar } from 'expo-status-bar'
import { useState, useCallback, useEffect, useMemo } from 'react'
import { View, Pressable, Text, Platform, StyleSheet } from 'react-native'
import { SolitoImage } from 'solito/image'
import { Link } from 'solito/link'
import { useRouter } from 'solito/navigation'

const styles = StyleSheet.create({
	container: {
		flex: 1,
		gap: 30,
		padding: 30,
	},
	title: {
		color: 'white',
		fontSize: 20,
		fontWeight: 'bold',
		textAlign: 'center',
	},
})

function useBooleanItem(key: string) {
	const [value, setValue] = useState<boolean | null>(null)

	useEffect(() => {
		void AsyncStorage.getItem(key).then((value) => setValue(value === 'true'))
	}, [key])

	return useMemo(
		() =>
			[
				value,
				(value: boolean) => {
					setValue(value)
					void AsyncStorage.setItem(key, value ? 'true' : 'false')
				},
			] as const,
		[value, key],
	)
}

function SettingsScreen() {
	const router = useRouter()
	const [isOnboardingComplete, setIsOnboardingComplete] = useBooleanItem(
		'@bichos-id/onboarding-complete',
	)

	const handleDismiss = useCallback(() => {
		setIsOnboardingComplete(true)
		router.back()
	}, [router])

	if (isOnboardingComplete || Platform.OS === 'web') {
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
						alignItems: 'center',
						flexDirection: 'row',
						gap: 10,
					}}
				>
					<SolitoImage
						width={50}
						height={50}
						alt=""
						src={require('./alert.png')}
					/>
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
						alignItems: 'center',
						flexDirection: 'row',
						gap: 10,
					}}
				>
					<SolitoImage
						width={50}
						height={50}
						alt=""
						src={require('./hands.png')}
					/>
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
						marginTop: 'auto',
						textAlign: 'center',
					}}
				>
					Si aceptas los términos y condiciones, puedes continuar.
				</Text>
				<Pressable
					onPress={handleDismiss}
					style={{
						alignItems: 'center',
						backgroundColor: 'white',
						borderRadius: 10,
						justifyContent: 'center',
						marginBottom: 30,
						padding: 10,
					}}
				>
					<Text style={{ fontSize: 15 }}>Entendido</Text>
				</Pressable>
			</View>
		</>
	)
}

SettingsScreen.options = {
	headerBackTitleVisible: false,
	headerShown: false,
	headerTintColor: 'white',
	presentation: 'modal',
} as NativeStackNavigationOptions

export default SettingsScreen
