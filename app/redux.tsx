'use client'
import { useRef } from 'react'
import { Provider } from 'react-redux'
import { Persistor, persistStore } from 'redux-persist'
import { PersistGate } from 'redux-persist/integration/react'
import { makeStore, AppStore } from 'util/redux/store'

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore>()
  const persistStoreRef = useRef<Persistor>()
  if (!storeRef.current) {
    storeRef.current = makeStore()
    persistStoreRef.current = persistStore(storeRef.current)
  }

  return (
    <Provider store={storeRef.current}>
      <PersistGate persistor={persistStoreRef.current!}>
        {children}
      </PersistGate>
    </Provider>
  )
}