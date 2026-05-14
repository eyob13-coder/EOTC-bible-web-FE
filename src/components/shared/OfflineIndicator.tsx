'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WifiOff, Wifi } from 'lucide-react'
import { useOfflineStore } from '@/stores/offlineStore'

export default function OfflineIndicator() {
  const isOnline = useOfflineStore((s) => s.isOnline)
  const downloadedBooks = useOfflineStore((s) => s.downloadedBooks)
  const [showReconnect, setShowReconnect] = useState(false)
  const [wasOffline, setWasOffline] = useState(false)

  // Track transitions from offline → online to show the reconnect toast
  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true)
      setShowReconnect(false)
    } else if (wasOffline) {
      setShowReconnect(true)
      setWasOffline(false)
      const timer = setTimeout(() => setShowReconnect(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [isOnline, wasOffline])

  const hasOfflineBooks = downloadedBooks.length > 0

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          key="offline-banner"
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed top-36 md:top-20 left-1/2 z-50 -translate-x-1/2"
        >
          <div className="flex items-center gap-2.5 rounded-full border border-amber-200 dark:border-amber-500/30 bg-amber-50/90 dark:bg-amber-950/90 px-5 py-2.5 shadow-xl shadow-amber-900/10 dark:shadow-amber-900/40 backdrop-blur-md">
            <WifiOff className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="text-sm font-black text-amber-900 dark:text-amber-200 whitespace-nowrap">
              {hasOfflineBooks
                ? "You're offline — reading from downloads"
                : "You're offline — download books for offline reading"}
            </span>
          </div>
        </motion.div>
      )}

      {showReconnect && (
        <motion.div
          key="reconnect-banner"
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed top-36 md:top-20 left-1/2 z-50 -translate-x-1/2"
        >
          <div className="flex items-center gap-2.5 rounded-full border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/90 dark:bg-emerald-950/90 px-5 py-2.5 shadow-xl shadow-emerald-900/10 dark:shadow-emerald-900/40 backdrop-blur-md">
            <Wifi className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-sm font-black text-emerald-900 dark:text-emerald-200 whitespace-nowrap">
              Back online
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
