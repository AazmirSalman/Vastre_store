'use client'

import { createContext, useContext, type ReactNode } from 'react'

export type StoreInfo = {
  storeName: string
  whatsappNumber: string
  instagram?: string
  codNote?: string
  deliveryTime?: string
  returnSummary?: string
}

const StoreContext = createContext<StoreInfo>({ storeName: 'Vastre', whatsappNumber: '' })

export function StoreProvider({ value, children }: { value: StoreInfo; children: ReactNode }) {
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreInfo {
  return useContext(StoreContext)
}
