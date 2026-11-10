import type { RecipeBook } from '../types/recipe'
import { ALL_RECIPES_LABEL } from '../data/books'
import { BookSpine } from './BookSpine'

interface BookshelfProps {
  books: RecipeBook[]
  categories: string[]
  selectedCategory: string
  onBookSelect: (book: RecipeBook) => void
}

export function Bookshelf({ books, categories, selectedCategory, onBookSelect }: BookshelfProps) {
  const displayCategories = selectedCategory === ALL_RECIPES_LABEL
    ? categories
    : [selectedCategory]
  const categoryRows = displayCategories.map((category) => ({
    category,
    books: books.filter((book) => book.category === category),
  }))
  const rows = selectedCategory === ALL_RECIPES_LABEL
    ? categoryRows.filter((row) => row.books.length > 0)
    : categoryRows
  const lastCategory = rows[rows.length - 1]?.category

  return (
    <div className="shelf-cabinet" aria-label="Библиотека рецептов">
      <div className="cabinet-crown" aria-hidden="true">
        <svg className="crown-carving" viewBox="0 0 1400 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <path strokeWidth="2" d="M330 37c58-27 104-27 148 0 36 21 72 22 111 2 41-21 78-21 117 0 34 18 66 19 102 2 26-13 48-14 72-5" />
            <path strokeWidth="1" d="M337 43c54-21 98-21 137 1 43 23 81 23 123 1 39-21 75-21 114 0 37 20 73 20 112 1 25-12 45-14 66-8" />
            <path strokeWidth="1.1" d="M354 32c34-10 65-9 92 4 25 12 48 17 72 14m480-18c-34-10-65-9-92 4-25 12-48 17-72 14" opacity=".8" />
            <path strokeWidth="1.7" d="M43 59c3-13 13-20 30-20 17 0 27-8 29-22 2 14 11 22 28 22 16 0 26 8 28 22m-116-3c8-8 17-12 29-12m57 0c11 1 20 5 28 12" />
            <path strokeWidth="1.1" d="M45 53c-1-11 4-18 15-22 0 10-4 17-15 22Zm35-19c-1-12 5-20 17-24 1 12-5 20-17 24Zm29 2c9-8 18-9 29-3-8 9-18 10-29 3Zm-55 21c-9 4-13 11-11 21 10-4 14-11 11-21Zm69 0c9 4 13 11 11 21-10-4-14-11-11-21Z" />
            <path strokeWidth="1.7" d="M1357 59c-3-13-13-20-30-20-17 0-27-8-29-22-2 14-11 22-28 22-16 0-26 8-28 22m116-3c-8-8-17-12-29-12m-57 0c-11 1-20 5-28 12" />
            <path strokeWidth="1.1" d="M1355 53c1-11-4-18-15-22 0 10 4 17 15 22Zm-35-19c1-12-5-20-17-24-1 12 5 20 17 24Zm-29 2c-9-8-18-9-29-3 8 9 18 10 29 3Zm55 21c9 4 13 11 11 21-10-4-14-11-11-21Zm-69 0c-9 4-13 11-11 21 10-4 14-11 11-21Z" />
            <path strokeWidth="1.2" d="M183 40c39 4 75 2 110-7m824 0c35 9 71 11 110 7" opacity=".76" />
          </g>
          <g fill="currentColor" opacity=".96">
            <circle cx="700" cy="36" r="25" fill="#704827" stroke="#E7C47C" strokeWidth="2" />
            <circle cx="700" cy="36" r="19" fill="none" stroke="#C59A52" strokeWidth="1" />
            <path d="M700 51V23m0 17c-10 0-15-6-14-15 9 1 14 6 14 15Zm0-5c0-9 5-15 14-16 1 9-4 15-14 16Zm-2 12c-7-7-14-7-20-1 6 7 13 8 20 1Zm4 0c7-7 14-7 20-1-6 7-13 8-20 1Z" />
            <path d="M664 36h10m52 0h10" stroke="#E7C47C" strokeWidth="1.5" strokeLinecap="round" />
            <path d="m653 36 5-5 5 5-5 5-5-5Zm84 0 5-5 5 5-5 5-5-5Z" />
          </g>
        </svg>
      </div>
      {rows.length === 0 ? (
        <div className="shelf-empty-all">На полках пока нет опубликованных рецептов</div>
      ) : rows.map((row, index) => {
        const nextRow = rows[index + 1]
        return (
          <div className={`shelf-row${nextRow ? '' : ' shelf-row-last'}${row.books.length === 0 ? ' shelf-row-empty' : ''}`} key={row.category}>
            {row.books.length > 0 ? (
              <div className="shelf-books">
                {row.books.map((book) => <div className="book-wrap" key={book.id} onClick={() => onBookSelect(book)}><BookSpine book={book} /></div>)}
              </div>
            ) : (
              <p className="shelf-empty-category">В этой категории пока нет рецептов</p>
            )}
            {nextRow && (
              <div className="shelf-plank">
                <div className="shelf-row-label" aria-hidden="true">{row.category}</div>
              </div>
            )}
          </div>
        )
      })}
      <div className="cabinet-base" aria-hidden="true">
        {lastCategory && <div className="shelf-row-label">{lastCategory}</div>}
      </div>
    </div>
  )
}
