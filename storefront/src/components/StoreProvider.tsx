'use client'

import { createContext, useContext, type ReactNode } from 'react'
import type { BankDetails } from '@/lib/types'

export type StoreInfo = {
  storeName: string
  whatsappNumber: string
  instagram?: string
  codNote?: string
  bank?: BankDetails
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
