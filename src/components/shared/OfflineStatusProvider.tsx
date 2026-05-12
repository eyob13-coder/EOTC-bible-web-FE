'use client'

import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import OfflineIndicator from '@/components/shared/OfflineIndicator'

/**
 * Client wrapper that mounts the OfflineIndicator banner and keeps
 * online/offline status in sync with the Zustand store.
 * Rendered once at the root layout level.
 */
export default function OfflineStatusProvider() {
  // This hook keeps the store's `isOnline` in sync with browser events
  useOnlineStatus()

  return <OfflineIndicator />
}
