'use client'

import { useState, useEffect } from 'react'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import OfflineIndicator from '@/components/shared/OfflineIndicator'

/**
 * Client wrapper that mounts the OfflineIndicator banner and keeps
 * online/offline status in sync with the Zustand store.
 * Rendered once at the root layout level.
 *
 * IMPORTANT: We defer rendering the OfflineIndicator until after the
 * component has mounted on the client. The offlineStore uses Zustand's
 * `persist` middleware, which rehydrates `downloadedBooks` from
 * localStorage. This can differ from the server-rendered defaults
 * (empty array), causing a React hydration mismatch that breaks
 * ALL event handlers across the entire page.
 */
export default function OfflineStatusProvider() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // This hook keeps the store's `isOnline` in sync with browser events
  useOnlineStatus()

  // Don't render the indicator during SSR / initial hydration
  // to avoid hydration mismatch from persisted store values
  if (!mounted) return null

  return <OfflineIndicator />
}
