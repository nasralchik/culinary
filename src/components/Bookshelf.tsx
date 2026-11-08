import type { RecipeBook } from '../types/recipe'
import { BookSpine } from './BookSpine'

interface BookshelfProps {
  books: RecipeBook[]
  onBookSelect: (book: RecipeBook) => void
}

export function Bookshelf({ books, onBookSelect }: BookshelfProps) {
  const rowCount = Math.min(5, books.length)
  const rows: RecipeBook[][] = []
  let offset = 0
  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    const rowsLeft = rowCount - rowIndex
    const booksLeft = books.length - offset
    const size = Math.ceil(booksLeft / rowsLeft)
    const row = books.slice(offset, offset + size)
    offset += size
    rows.push(row)
  }
  return (
    <div className="shelf-cabinet" aria-label="Библиотека рецептов">
      <div className="cabinet-crown" aria-hidden="true" />
      {rows.map((row, index) => (
        <div className="shelf-row" key={index}>
          <div className="shelf-books">
            {row.map((book) => <div className="book-wrap" key={book.id} onClick={() => onBookSelect(book)}><BookSpine book={book} /></div>)}
          </div>
          <div className="shelf-plank"><i /><i /><i /></div>
        </div>
      ))}
      <div className="cabinet-base" aria-hidden="true" />
    </div>
  )
}
