'use client'

import { useEffect } from 'react'
import { useOfflineStore } from '@/stores/offlineStore'

/**
 * Syncs browser online/offline events with the offlineStore.
 * Mount this once at the app root to keep `isOnline` accurate everywhere.
 */
export function useOnlineStatus() {
  const setOnlineStatus = useOfflineStore((s) => s.setOnlineStatus)

  useEffect(() => {
    const goOnline = () => setOnlineStatus(true)
    const goOffline = () => setOnlineStatus(false)

    // Sync initial state
    setOnlineStatus(navigator.onLine)

    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)

    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [setOnlineStatus])

  return useOfflineStore((s) => s.isOnline)
}
