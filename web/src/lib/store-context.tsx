import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import {
  createStore,
  listStores,
  type StoreRecord,
} from '#/lib/api'

const ACTIVE_STORE_KEY = 'fnnpay:active-store-id'

type StoreContextValue = {
  stores: StoreRecord[]
  activeStore: StoreRecord | null
  activeStoreId: string | null
  isLoading: boolean
  error: string | null
  setActiveStoreId: (storeId: string) => void
  refreshStores: () => Promise<void>
  createNewStore: (input: {
    name: string
    websiteUrl?: string
    brandColor?: string
    logoUrl?: string
    defaultCurrency?: string
  }) => Promise<{ store?: StoreRecord; error?: string }>
}

const StoreContext = createContext<StoreContextValue | null>(null)

function readStoredStoreId(): string | null {
  if (typeof window === 'undefined') {
    return null
  }

  return window.localStorage.getItem(ACTIVE_STORE_KEY)
}

function writeStoredStoreId(storeId: string | null) {
  if (typeof window === 'undefined') {
    return
  }

  if (storeId) {
    window.localStorage.setItem(ACTIVE_STORE_KEY, storeId)
  } else {
    window.localStorage.removeItem(ACTIVE_STORE_KEY)
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [stores, setStores] = useState<StoreRecord[]>([])
  const [activeStoreId, setActiveStoreIdState] = useState<string | null>(
    readStoredStoreId,
  )
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshStores = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    const result = await listStores()
    if (result.error) {
      setError(result.error.error)
      setStores([])
      setIsLoading(false)
      return
    }

    const nextStores = result.data?.stores ?? []
    setStores(nextStores)

    const storedId = readStoredStoreId()
    const storedStore = storedId
      ? nextStores.find((entry) => entry.id === storedId)
      : null

    if (storedStore) {
      setActiveStoreIdState(storedStore.id)
    } else if (nextStores.length > 0) {
      const firstStore = nextStores[0]!
      setActiveStoreIdState(firstStore.id)
      writeStoredStoreId(firstStore.id)
    } else {
      setActiveStoreIdState(null)
      writeStoredStoreId(null)
    }

    setIsLoading(false)
  }, [])

  useEffect(() => {
    void refreshStores()
  }, [refreshStores])

  const setActiveStoreId = useCallback((storeId: string) => {
    setActiveStoreIdState(storeId)
    writeStoredStoreId(storeId)
  }, [])

  const createNewStore = useCallback(
    async (input: {
      name: string
      websiteUrl?: string
      brandColor?: string
      logoUrl?: string
      defaultCurrency?: string
    }) => {
      const result = await createStore(input)
      if (result.error) {
        return { error: result.error.error }
      }

      const createdStore = result.data?.store
      if (!createdStore) {
        return { error: 'Unable to create store' }
      }

      await refreshStores()
      setActiveStoreId(createdStore.id)

      return { store: createdStore }
    },
    [refreshStores, setActiveStoreId],
  )

  const activeStore = useMemo(
    () => stores.find((entry) => entry.id === activeStoreId) ?? null,
    [activeStoreId, stores],
  )

  const value = useMemo(
    () => ({
      stores,
      activeStore,
      activeStoreId,
      isLoading,
      error,
      setActiveStoreId,
      refreshStores,
      createNewStore,
    }),
    [
      stores,
      activeStore,
      activeStoreId,
      isLoading,
      error,
      setActiveStoreId,
      refreshStores,
      createNewStore,
    ],
  )

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  )
}

export function useStores() {
  const context = useContext(StoreContext)
  if (!context) {
    throw new Error('useStores must be used within StoreProvider')
  }

  return context
}
