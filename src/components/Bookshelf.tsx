import type { RecipeBook } from '../types/recipe'
import { categories } from '../data/books'
import { BookSpine } from './BookSpine'

interface BookshelfProps {
  books: RecipeBook[]
  onBookSelect: (book: RecipeBook) => void
}

export function Bookshelf({ books, onBookSelect }: BookshelfProps) {
  const displayBooks = [...books].sort((a, b) => categories.indexOf(a.category) - categories.indexOf(b.category))
  const rows: RecipeBook[][] = []
  for (let offset = 0; offset < displayBooks.length; offset += 5) {
    rows.push(displayBooks.slice(offset, offset + 5))
  }
  const firstBook = rows[0]?.[0]
  const lastBook = rows[rows.length - 1]?.[0]

  return (
    <div className="shelf-cabinet" aria-label="Библиотека рецептов">
      <div className="cabinet-crown" aria-hidden="true">
        {firstBook && <div className="shelf-row-label">{firstBook.category}</div>}
      </div>
      {rows.map((row, index) => {
        const nextRow = rows[index + 1]
        const nextRowIsFinal = index === rows.length - 2
        return (
          <div className={`shelf-row${nextRow ? '' : ' shelf-row-last'}`} key={index}>
            <div className="shelf-books">
              {row.map((book) => <div className="book-wrap" key={book.id} onClick={() => onBookSelect(book)}><BookSpine book={book} /></div>)}
            </div>
            {nextRow && !nextRowIsFinal && <div className="shelf-plank"><div className="shelf-row-label" aria-hidden="true">{nextRow[0].category}</div></div>}
          </div>
        )
      })}
      <div className="cabinet-base" aria-hidden="true">
        {lastBook && <div className="shelf-row-label">{lastBook.category}</div>}
      </div>
    </div>
  )
}
