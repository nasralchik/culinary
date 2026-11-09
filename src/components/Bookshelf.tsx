import type { RecipeBook } from '../types/recipe'
import { categories } from '../data/books'
import { BookSpine } from './BookSpine'

interface BookshelfProps {
  books: RecipeBook[]
  onBookSelect: (book: RecipeBook) => void
}

export function Bookshelf({ books, onBookSelect }: BookshelfProps) {
  const displayBooks = [...books].sort((a, b) => categories.indexOf(a.category) - categories.indexOf(b.category))
  const rowCount = displayBooks.length ? 5 : 0
  const rows: RecipeBook[][] = []
  let offset = 0
  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    const rowsLeft = rowCount - rowIndex
    const booksLeft = displayBooks.length - offset
    const size = displayBooks.length <= 5 ? (rowIndex === 0 ? booksLeft : 0) : Math.ceil(booksLeft / rowsLeft)
    const row = displayBooks.slice(offset, offset + size)
    offset += size
    rows.push(row)
  }
  return (
    <div className="shelf-cabinet" aria-label="Библиотека рецептов">
      <div className="cabinet-crown" aria-hidden="true" />
      {rows.map((row, index) => {
        return (
          <div className={index === 0 ? 'shelf-row shelf-row-first' : 'shelf-row'} key={index}>
            <div className="shelf-books">
              {row.map((book) => <div className="book-wrap" key={book.id} onClick={() => onBookSelect(book)}><BookSpine book={book} /></div>)}
            </div>
            <div className="shelf-plank"><i /><i /><i />{row[0] && <div className="shelf-row-label" aria-hidden="true">{row[0].category}</div>}</div>
          </div>
        )
      })}
      <div className="cabinet-base" aria-hidden="true" />
    </div>
  )
}
