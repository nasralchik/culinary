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
  const rows = displayCategories.map((category) => ({
    category,
    books: books.filter((book) => book.category === category),
  }))
  const lastCategory = rows[rows.length - 1]?.category

  return (
    <div className="shelf-cabinet" aria-label="Библиотека рецептов">
      <div className="cabinet-crown" aria-hidden="true">
        <svg className="crown-carving" viewBox="0 0 900 52" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <path strokeWidth="1.6" d="M42 27c39-18 72-18 105 0 27 15 51 15 78 1 30-16 59-16 88 0 23 12 46 12 70 0 20-10 37-10 55-2" />
            <path strokeWidth=".8" d="M48 32c38-14 67-14 96 1 29 15 57 15 86 0 28-15 54-15 82 0 26 14 51 14 78 1 18-9 33-10 48-4" />
            <path strokeWidth="1.2" d="M112 19c-3-8-1-13 6-16 2 8 0 13-6 16Zm53 15c-1 8 2 13 10 15 1-8-2-13-10-15Zm69-15c-2-8 1-13 8-16 1 8-2 13-8 16Zm64 19c0 8 4 12 12 13 0-8-4-12-12-13Zm67-19c-1-7 2-12 9-14 0 7-3 12-9 14Z" />
            <path strokeWidth="1.2" d="M858 27c-39-18-72-18-105 0-27 15-51 15-78 1-30-16-59-16-88 0-23 12-46 12-70 0-20-10-37-10-55-2" />
            <path strokeWidth=".8" d="M852 32c-38-14-67-14-96 1-29 15-57 15-86 0-28-15-54-15-82 0-26 14-51 14-78 1-18-9-33-10-48-4" />
            <path strokeWidth="1.2" d="M788 19c3-8 1-13-6-16-2 8 0 13 6 16Zm-53 15c1 8-2 13-10 15-1-8 2-13 10-15Zm-69-15c2-8-1-13-8-16-1 8 2 13 8 16Zm-64 19c0 8-4 12-12 13 0-8 4-12 12-13Zm-67-19c1-7-2-12-9-14 0 7 3 12 9 14Z" />
          </g>
          <circle cx="450" cy="26" r="17" fill="#6E4928" stroke="#E7C47C" strokeWidth="1.5" />
          <circle cx="450" cy="26" r="13" stroke="#C59A52" strokeWidth=".8" />
          <path d="M450 36V16m0 10c-7 0-10-4-10-9 6 0 10 3 10 9Zm0-3c0-6 4-10 10-10 0 6-4 10-10 10Zm-1 8c-4-4-8-4-12-1 3 4 7 5 12 1Zm2 0c4-4 8-4 12-1-3 4-7 5-12 1Z" fill="#E7C47C" />
          <path d="M418 26h11m42 0h11" stroke="#E7C47C" strokeWidth="1.2" strokeLinecap="round" />
          <path d="m412 26 3-3 3 3-3 3-3-3Zm70 0 3-3 3 3-3 3-3-3Z" fill="#E7C47C" />
        </svg>
      </div>
      {rows.map((row, index) => {
        const nextRow = rows[index + 1]
        return (
          <div className={`shelf-row${nextRow ? '' : ' shelf-row-last'}`} key={index}>
            <div className="shelf-books">
              {row.books.map((book) => <div className="book-wrap" key={book.id} onClick={() => onBookSelect(book)}><BookSpine book={book} /></div>)}
            </div>
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
