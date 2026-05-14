import { MetadataRoute } from 'next'
import { books } from '@/data/data'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://nehemiah-osc.org'

  // Static routes
  const staticRoutes = [
    '',
    '/read-online',
    '/plans',
    '/privacy-policy',
    '/terms-and-conditions',
    '/data-deletion',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  // Dynamic routes for Bible books and chapters
  const bibleRoutes: MetadataRoute.Sitemap = []

  books.forEach((book) => {
    const bookId = book.book_name_en.replace(/ /g, '-').toLowerCase()
    
    // Add the book page (index of chapters)
    bibleRoutes.push({
      url: `${baseUrl}/read-online/${bookId}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })

    // Add each chapter
    for (let i = 1; i <= book.chapters; i++) {
      bibleRoutes.push({
        url: `${baseUrl}/read-online/${bookId}/${i}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      })
    }
  })

  return [...staticRoutes, ...bibleRoutes]
}
