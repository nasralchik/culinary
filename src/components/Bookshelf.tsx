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
  const firstBook = rows.find((row) => row.length > 0)?.[0]
  let lastRowIndex = -1
  for (let index = rows.length - 1; index >= 0; index--) {
    if (rows[index].length > 0) {
      lastRowIndex = index
      break
    }
  }
  const lastBook = lastRowIndex > 0 ? rows[lastRowIndex][0] : undefined

  return (
    <div className="shelf-cabinet" aria-label="Библиотека рецептов">
      <div className="cabinet-crown" aria-hidden="true">
        {firstBook && <div className="shelf-row-label">{firstBook.category}</div>}
      </div>
      {rows.map((row, index) => {
        const isLastRow = index === rows.length - 1
        return (
          <div className={index === 0 ? 'shelf-row shelf-row-first' : 'shelf-row'} key={index}>
            <div className="shelf-books">
              {row.map((book) => <div className="book-wrap" key={book.id} onClick={() => onBookSelect(book)}><BookSpine book={book} /></div>)}
            </div>
            {!isLastRow && (
              <div className="shelf-plank">
                {index > 0 && row[0] && <div className="shelf-row-label" aria-hidden="true">{row[0].category}</div>}
              </div>
            )}
          </div>
        )
      })}
      <div className="cabinet-base" aria-hidden="true">
        {lastBook && <div className="shelf-row-label">{lastBook.category}</div>}
      </div>
    </div>
  )
}
