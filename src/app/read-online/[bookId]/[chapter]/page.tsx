import { promises as fs } from "fs";
import path from "path";
import ReaderClient from "./reader-client";
import { books } from "@/data/data";
import OfflineReaderFallback from "@/components/reader/OfflineReaderFallback";

async function getBookData(bookId: string) {
  const bibleDataPath = path.join(process.cwd(), "src", "data", "bible-data");
  try {
    const bookData = books.find((b) => b.book_name_en.replace(/ /g, "-").toLowerCase() === bookId);
    if (!bookData) return null;

    const files = await fs.readdir(bibleDataPath);
    for (const file of files) {
      if (file.includes(bookData.file_name)) {
        const jsonPath = path.join(bibleDataPath, file);
        const fileContent = await fs.readFile(jsonPath, "utf8");
        return JSON.parse(fileContent);
      }
    }
  } catch (error) {
    console.error("Could not read bible data:", error);
  }
  return null;
}

export default async function ReaderPage({
  params,
}: {
  params: Promise<{ bookId: string; chapter: string }>;
}) {
  const { bookId, chapter } = await params;
  const bookData = await getBookData(bookId);

  if (!bookData) {
    // Book not found on server — let the client fallback handle offline
    return (
      <OfflineReaderFallback bookId={bookId} chapter={chapter}>
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">Book not found</p>
        </div>
      </OfflineReaderFallback>
    );
  }

  const chapterData = bookData.chapters.find(
    (c: any) => c.chapter === parseInt(chapter)
  );

  if (!chapterData) {
    return (
      <OfflineReaderFallback bookId={bookId} chapter={chapter}>
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">Chapter not found</p>
        </div>
      </OfflineReaderFallback>
    );
  }

  const currentChapter = parseInt(chapter);
  const totalChapters = bookData.chapters.length;
  const prevChapter = currentChapter > 1 ? currentChapter - 1 : null;
  const nextChapter =
    currentChapter < totalChapters ? currentChapter + 1 : null;

  return (
    <OfflineReaderFallback bookId={bookId} chapter={chapter}>
      <ReaderClient
        bookData={bookData}
        chapterData={chapterData}
        prevChapter={prevChapter}
        nextChapter={nextChapter}
        bookId={bookId}
      />
    </OfflineReaderFallback>
  );
}
