'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Download,
  Trash2,
  HardDrive,
  CloudOff,
  CheckCircle2,
  Loader2,
  BookOpen,
  X,
  AlertTriangle,
} from 'lucide-react'
import { useOfflineStore } from '@/stores/offlineStore'
import { books as allBooks } from '@/data/data'

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const StorageEstimate = ({ testament }: { testament: 'old' | 'new' | 'all' }) => {
  const estimateMap = { old: '~10 MB', new: '~5 MB', all: '~15 MB' }
  return (
    <span className="text-xs text-gray-500 dark:text-gray-400">
      {estimateMap[testament]}
    </span>
  )
}

const DownloadButton = ({
  label,
  testament,
  downloadedCount,
  totalCount,
}: {
  label: string
  testament: 'old' | 'new' | 'all'
  downloadedCount: number
  totalCount: number
}) => {
  const { downloadTestament, isDownloading } = useOfflineStore()
  const isComplete = downloadedCount === totalCount
  const [showConfirm, setShowConfirm] = useState(false)

  const handleClick = () => {
    if (isComplete || isDownloading) return
    setShowConfirm(true)
  }

  const handleConfirm = async () => {
    setShowConfirm(false)
    await downloadTestament(testament)
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isComplete || isDownloading}
        className={`
          group relative flex items-center justify-between w-full rounded-2xl border px-5 py-4
          transition-all duration-300 overflow-hidden
          ${isComplete
            ? 'border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 cursor-default'
            : isDownloading
              ? 'border-gray-200 dark:border-gray-600/30 bg-gray-50/50 dark:bg-gray-900/20 cursor-not-allowed opacity-60'
              : 'border-gray-200 dark:border-gray-700/50 bg-white dark:bg-gray-900/40 hover:border-[#4C0E0F]/40 dark:hover:border-amber-500/40 hover:shadow-xl dark:hover:shadow-amber-900/10 cursor-pointer shadow-sm'
          }
        `}
      >
        <div className="flex items-center gap-3">
          <div className={`
            h-10 w-10 rounded-xl flex items-center justify-center transition-colors
            ${isComplete 
              ? 'bg-emerald-100 dark:bg-emerald-500/20' 
              : 'bg-[#4C0E0F]/5 dark:bg-amber-500/10 group-hover:bg-[#4C0E0F]/10 dark:group-hover:bg-amber-500/20'}
          `}>
            {isComplete ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Download className="h-5 w-5 text-[#4C0E0F] dark:text-amber-400" />
            )}
          </div>
          <div className="text-left">
            <div className="text-sm font-bold text-gray-900 dark:text-white">{label}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {downloadedCount}/{totalCount} books downloaded
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StorageEstimate testament={testament} />
          {!isComplete && !isDownloading && (
            <div className="h-8 w-8 rounded-lg bg-[#4C0E0F]/5 dark:bg-amber-500/10 flex items-center justify-center group-hover:bg-[#4C0E0F]/10 dark:group-hover:bg-amber-500/20 transition-colors shadow-sm">
              <Download className="h-4 w-4 text-[#4C0E0F] dark:text-amber-400" />
            </div>
          )}
        </div>
      </button>

      {/* Confirmation modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="mx-4 w-full max-w-sm rounded-3xl border border-gray-200 dark:border-gray-700/50 bg-white dark:bg-gray-900 p-8 shadow-2xl"
            >
              <div className="flex items-start gap-3 mb-4">
                <HardDrive className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Download {label}?</h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    This will use approximately <StorageEstimate testament={testament} /> of storage on your device.
                    {totalCount - downloadedCount} books will be downloaded.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 rounded-xl bg-[#4C0E0F] px-4 py-3 text-sm font-bold text-white hover:bg-[#5D1213] transition-colors shadow-lg shadow-red-900/20"
                >
                  Download
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

const DownloadProgressBar = () => {
  const { isDownloading, downloadProgress, cancelDownload } = useOfflineStore()

  if (!isDownloading || !downloadProgress) return null

  const pct = Math.round((downloadProgress.current / downloadProgress.total) * 100)

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="rounded-2xl border border-blue-200 dark:border-blue-500/30 bg-blue-50/50 dark:bg-blue-950/20 p-5 shadow-sm"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-spin" />
          <span className="text-sm font-bold text-blue-800 dark:text-blue-200">
            Downloading {downloadProgress.currentBook}...
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
            {downloadProgress.current}/{downloadProgress.total}
          </span>
          <button
            onClick={cancelDownload}
            className="h-7 w-7 rounded-lg bg-red-100 dark:bg-red-500/20 flex items-center justify-center hover:bg-red-200 dark:hover:bg-red-500/30 transition-colors shadow-sm"
            title="Cancel download"
          >
            <X className="h-4 w-4 text-red-600 dark:text-red-400" />
          </button>
        </div>
      </div>
      <div className="h-2.5 rounded-full bg-blue-100 dark:bg-blue-950/50 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </motion.div>
  )
}

const DownloadedBooksList = () => {
  const { downloadedBooks, removeBook, isDownloading } = useOfflineStore()

  if (downloadedBooks.length === 0) return null

  const downloadedBooksInfo = downloadedBooks
    .map((id) => {
      const meta = allBooks.find(
        (b) => b.book_name_en.replace(/ /g, '-').toLowerCase() === id
      )
      return meta ? { id, name: meta.book_name_en, nameAm: meta.book_name_am, testament: meta.testament } : null
    })
    .filter(Boolean) as { id: string; name: string; nameAm: string; testament: string }[]

  const oldBooks = downloadedBooksInfo.filter((b) => b.testament === 'old')
  const newBooks = downloadedBooksInfo.filter((b) => b.testament === 'new')

  const BookGroup = ({ title, books }: { title: string; books: typeof downloadedBooksInfo }) => {
    if (books.length === 0) return null
    return (
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">{title}</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {books.map((book) => (
            <div
              key={book.id}
              className="group flex items-center justify-between rounded-xl border border-gray-100 dark:border-gray-800/50 bg-white dark:bg-gray-900/30 px-3 py-2.5 hover:border-gray-200 dark:hover:border-gray-700/50 transition-all shadow-sm"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-2 w-2 rounded-full bg-[#4C0E0F]/40 dark:bg-amber-500/40" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{book.name}</span>
              </div>
              <button
                onClick={() => removeBook(book.id)}
                disabled={isDownloading}
                className="opacity-0 group-hover:opacity-100 h-7 w-7 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-500/20 transition-all disabled:opacity-0"
                title={`Remove ${book.name}`}
              >
                <Trash2 className="h-4 w-4 text-red-500 dark:text-red-400" />
              </button>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <BookGroup title="Old Testament" books={oldBooks} />
      <BookGroup title="New Testament" books={newBooks} />
    </div>
  )
}

export default function OfflineManager() {
  const {
    downloadedBooks,
    storageUsedBytes,
    isDownloading,
    refreshDownloadedBooks,
    refreshStorageUsed,
    removeAll,
  } = useOfflineStore()
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  useEffect(() => {
    refreshDownloadedBooks()
    refreshStorageUsed()
  }, [refreshDownloadedBooks, refreshStorageUsed])

  const oldBooks = allBooks.filter((b) => b.testament === 'old')
  const newBooks = allBooks.filter((b) => b.testament === 'new')

  const downloadedOld = downloadedBooks.filter((id) =>
    oldBooks.some((b) => b.book_name_en.replace(/ /g, '-').toLowerCase() === id)
  ).length
  const downloadedNew = downloadedBooks.filter((id) =>
    newBooks.some((b) => b.book_name_en.replace(/ /g, '-').toLowerCase() === id)
  ).length

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Header Card */}
      <div className="rounded-3xl border border-gray-100 dark:border-gray-700/40 bg-white dark:bg-gray-900/50 p-8 shadow-xl shadow-gray-200/50 dark:shadow-none backdrop-blur-md">
        <div className="flex items-start gap-5">
          <div className="h-14 w-14 rounded-2xl bg-[#4C0E0F]/5 dark:bg-amber-500/20 flex items-center justify-center border border-[#4C0E0F]/10 dark:border-amber-500/20 shadow-inner">
            <CloudOff className="h-7 w-7 text-[#4C0E0F] dark:text-amber-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Offline Access</h2>
            <p className="mt-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
              Download the Bible for reading without internet. Perfect for traveling, commuting, or remote areas.
            </p>
          </div>
        </div>

        {/* Storage usage */}
        <div className="mt-8 flex items-center gap-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 px-5 py-4 border border-gray-100 dark:border-gray-700/30">
          <div className="h-10 w-10 rounded-xl bg-white dark:bg-gray-900 flex items-center justify-center shadow-sm border border-gray-200/50 dark:border-gray-700/50">
            <HardDrive className="h-5 w-5 text-gray-400 shrink-0" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Device Storage</span>
              <span className="text-sm font-black text-gray-900 dark:text-white">{formatBytes(storageUsedBytes)}</span>
            </div>
            <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700/50 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#4C0E0F] to-[#8E1C1E] dark:from-amber-600 dark:to-amber-400 transition-all duration-700 ease-out"
                style={{ width: `${Math.min((storageUsedBytes / (20 * 1024 * 1024)) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Download buttons */}
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 px-1">
          Download Modules
        </h3>

        <DownloadButton
          label="Old Testament"
          testament="old"
          downloadedCount={downloadedOld}
          totalCount={oldBooks.length}
        />
        <DownloadButton
          label="New Testament"
          testament="new"
          downloadedCount={downloadedNew}
          totalCount={newBooks.length}
        />
        <DownloadButton
          label="Entire Bible"
          testament="all"
          downloadedCount={downloadedBooks.length}
          totalCount={allBooks.length}
        />
      </div>

      {/* Download progress */}
      <AnimatePresence>
        <DownloadProgressBar />
      </AnimatePresence>

      {/* Downloaded books list */}
      {downloadedBooks.length > 0 && (
        <div className="rounded-3xl border border-gray-100 dark:border-gray-700/40 bg-white/50 dark:bg-gray-900/50 p-6 space-y-6 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Downloaded Books <span className="ml-1 text-sm font-medium text-gray-400">({downloadedBooks.length})</span>
            </h3>
            <button
              onClick={() => setShowClearConfirm(true)}
              disabled={isDownloading}
              className="flex items-center gap-2 rounded-xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 px-4 py-2 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition-all disabled:opacity-50 shadow-sm"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear All
            </button>
          </div>

          <DownloadedBooksList />
        </div>
      )}

      {/* Empty state */}
      {downloadedBooks.length === 0 && !isDownloading && (
        <div className="rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20 py-16 text-center shadow-inner">
          <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <BookOpen className="h-8 w-8 text-gray-300 dark:text-gray-700" />
          </div>
          <p className="text-base font-bold text-gray-900 dark:text-gray-300">No books downloaded yet</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Download a testament to read offline</p>
        </div>
      )}

      {/* Clear all confirmation */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowClearConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="mx-4 w-full max-w-sm rounded-2xl border border-gray-700/50 bg-gray-900 p-6 shadow-2xl"
            >
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 shrink-0" />
                <div>
                  <h3 className="text-base font-semibold text-white">Clear All Downloads?</h3>
                  <p className="mt-1 text-sm text-gray-400">
                    This will remove all {downloadedBooks.length} downloaded books and free up {formatBytes(storageUsedBytes)} of storage. You can re-download them later.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Keep
                </button>
                <button
                  onClick={() => {
                    removeAll()
                    setShowClearConfirm(false)
                  }}
                  className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white hover:bg-red-500 transition-colors shadow-lg shadow-red-900/20"
                >
                  Clear All
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
