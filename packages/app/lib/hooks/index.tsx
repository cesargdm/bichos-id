import { useEffect, useMemo, useState, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

export function useItem<ValueT extends string>(key: string) {
	const [itemValue, setItemValue] = useState<ValueT | null>(null)

	useEffect(() => {
		void AsyncStorage.getItem(key).then((value) =>
			setItemValue(value as ValueT | null),
		)
	}, [key])

	const setItem = useCallback(
		(value: ValueT) => {
			void AsyncStorage.setItem(key, value).then(() => setItemValue(value))
		},
		[key],
	)

	return useMemo(() => [itemValue, setItem] as const, [itemValue, setItem])
}
