'use client'

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { createBrowserStorage } from './storage'
import {
  saveBookData,
  getBookData,
  deleteBookData,
  getAllCachedBookIds,
  getTotalStorageUsed,
  clearAllOfflineData,
  getBookRecord,
} from '@/lib/offlineDb'
import { books as allBooks } from '@/data/data'

interface DownloadProgress {
  current: number
  total: number
  currentBook: string
}

interface OfflineState {
  /** IDs of books that are cached in IndexedDB */
  downloadedBooks: string[]
  /** Whether a download is in progress */
  isDownloading: boolean
  /** Progress info during download */
  downloadProgress: DownloadProgress | null
  /** Total bytes used by offline data */
  storageUsedBytes: number
  /** Whether the browser is currently online */
  isOnline: boolean

  // Actions
  refreshDownloadedBooks: () => Promise<void>
  refreshStorageUsed: () => Promise<void>
  downloadBook: (bookId: string) => Promise<void>
  downloadTestament: (testament: 'old' | 'new' | 'all') => Promise<void>
  removeBook: (bookId: string) => Promise<void>
  removeAll: () => Promise<void>
  isBookDownloaded: (bookId: string) => boolean
  getOfflineBookData: (bookId: string) => Promise<any | null>
  setOnlineStatus: (online: boolean) => void
  cancelDownload: () => void
}

let abortController: AbortController | null = null

export const useOfflineStore = create<OfflineState>()(
  devtools(
    persist(
      (set, get) => ({
        downloadedBooks: [],
        isDownloading: false,
        downloadProgress: null,
        storageUsedBytes: 0,
        isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,

        setOnlineStatus: (online) => set({ isOnline: online }),

        refreshDownloadedBooks: async () => {
          const ids = await getAllCachedBookIds()
          set({ downloadedBooks: ids })
        },

        refreshStorageUsed: async () => {
          const bytes = await getTotalStorageUsed()
          set({ storageUsedBytes: bytes })
        },

        isBookDownloaded: (bookId: string) => {
          return get().downloadedBooks.includes(bookId)
        },

        getOfflineBookData: async (bookId: string) => {
          return getBookData(bookId)
        },

        downloadBook: async (bookId: string) => {
          try {
            const res = await fetch(`/api/books/${bookId}/data`)
            if (!res.ok) throw new Error(`Failed to fetch ${bookId}`)
            const { data, version } = await res.json()
            await saveBookData(bookId, data, version)

            // Update downloaded list
            const ids = await getAllCachedBookIds()
            const bytes = await getTotalStorageUsed()
            set({ downloadedBooks: ids, storageUsedBytes: bytes })
          } catch (err) {
            console.error(`Failed to download book ${bookId}:`, err)
            throw err
          }
        },

        downloadTestament: async (testament: 'old' | 'new' | 'all') => {
          const booksToDownload = allBooks
            .filter((b) => testament === 'all' || b.testament === testament)
            .map((b) => ({
              id: b.book_name_en.replace(/ /g, '-').toLowerCase(),
              name: b.book_name_en,
            }))

          // Filter out already downloaded books
          const existing = get().downloadedBooks
          const pending = booksToDownload.filter((b) => !existing.includes(b.id))

          if (pending.length === 0) return

          abortController = new AbortController()

          set({
            isDownloading: true,
            downloadProgress: { current: 0, total: pending.length, currentBook: '' },
          })

          for (let i = 0; i < pending.length; i++) {
            if (abortController.signal.aborted) break

            const book = pending[i]
            set({
              downloadProgress: {
                current: i + 1,
                total: pending.length,
                currentBook: book.name,
              },
            })

            try {
              const res = await fetch(`/api/books/${book.id}/data`, {
                signal: abortController.signal,
              })
              if (!res.ok) {
                console.error(`Skipping ${book.id}: HTTP ${res.status}`)
                continue
              }
              const { data, version } = await res.json()
              await saveBookData(book.id, data, version)
            } catch (err: any) {
              if (err?.name === 'AbortError') break
              console.error(`Failed to download ${book.id}:`, err)
              // Continue with next book
            }
          }

          abortController = null

          // Refresh state
          const ids = await getAllCachedBookIds()
          const bytes = await getTotalStorageUsed()
          set({
            isDownloading: false,
            downloadProgress: null,
            downloadedBooks: ids,
            storageUsedBytes: bytes,
          })
        },

        cancelDownload: () => {
          if (abortController) {
            abortController.abort()
            abortController = null
          }
          set({ isDownloading: false, downloadProgress: null })
        },

        removeBook: async (bookId: string) => {
          await deleteBookData(bookId)
          const ids = await getAllCachedBookIds()
          const bytes = await getTotalStorageUsed()
          set({ downloadedBooks: ids, storageUsedBytes: bytes })
        },

        removeAll: async () => {
          await clearAllOfflineData()
          set({ downloadedBooks: [], storageUsedBytes: 0 })
        },
      }),
      {
        name: 'offline',
        storage: createBrowserStorage('eotc-'),
        partialize: (state) => ({
          downloadedBooks: state.downloadedBooks,
        }),
      },
    ),
  ),
)
