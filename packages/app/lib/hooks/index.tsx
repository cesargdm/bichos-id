import { useEffect, useMemo, useState, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

type AsyncStorageKey = '@bichos-id/onboarding'

export function useItem<ValueT extends string>(
	key: AsyncStorageKey,
	defaultValue: ValueT | null = null,
) {
	const [itemValue, setItemValue] = useState<ValueT | null>(defaultValue)

	useEffect(() => {
		void AsyncStorage.getItem(key).then((value) =>
			setItemValue(value as ValueT | null),
		)
	}, [key])

	const setItem = useCallback(
		(value: ValueT) => {
			return AsyncStorage.setItem(key, value).then(() => setItemValue(value))
		},
		[key],
	)

	return useMemo(() => [itemValue, setItem] as const, [itemValue, setItem])
}
