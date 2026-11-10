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
        <svg className="crown-carving" viewBox="0 0 1440 72" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <path strokeWidth="1.1" opacity=".72" d="M14 13H1426M14 59H1426" />
            <path strokeWidth="2.1" d="M692 36c-45 0-50-19-94-19-42 0-57 34-100 34-40 0-55-23-96-23-39 0-58 20-98 20-41 0-57-20-96-20-32 0-52 15-80 20-27 5-50 1-68-10-16-10-30-9-40 3-9 11-4 23 7 23 10 0 15-8 9-15" />
            <path strokeWidth="1" opacity=".9" d="M692 43c-43 0-52-17-94-17-41 0-59 31-100 31-38 0-56-20-96-20-38 0-60 18-98 18-39 0-58-17-96-17-29 0-52 12-79 17-25 5-47 1-67-8" />
            <path strokeWidth="1.2" opacity=".82" d="M677 29c-25 1-43-7-62-18-18-10-36-10-53 1m-76 29c-19 2-34-3-49-13m-107 19c-19-3-34-9-48-19m-113 17c-17 0-32-5-45-14m385 5c-14 4-25 11-34 20m125-27c-17 1-31-4-44-13" />
            <path strokeWidth="1.8" d="M40 57c2-14 11-21 24-22 14-1 22-9 24-23 2 14 10 22 24 23 14 1 22 8 24 22m-96-5c10-8 19-11 30-10m35 0c11 0 21 3 30 10m-85-5c10 2 18-1 23-10m36 0c5 9 13 12 23 10" />
            <path strokeWidth="1.2" d="M49 49c-5-10-3-19 7-26 6 10 5 18-7 26Zm29-13c-2-12 3-20 15-25 3 12-1 20-15 25Zm25 1c5-10 13-14 25-12-4 11-12 15-25 12Zm-47 9c-9 8-11 16-7 25 10-7 12-15 7-25Zm59 1c8 8 10 16 6 24-9-7-10-15-6-24Z" />
            <path strokeWidth="1.35" d="M147 45c18 3 34-1 48-12m23 1c13 9 26 13 41 13m27-7c14 2 28 0 42-6m23 1c14 7 27 10 42 7m29-9c13 1 24 0 36-5m-347 9c11-4 21-4 32 0" />
            <path strokeWidth="1.05" d="M179 36c-7-8-7-15 0-23 8 8 8 15 0 23Zm91 8c-4 10-2 17 7 23 5-10 2-17-7-23Zm69-7c-2-9 2-16 12-20 3 10-1 17-12 20Zm95 0c-1 9 4 16 14 18 1-11-4-17-14-18Zm99 2c-1-9 4-15 13-18 2 10-2 16-13 18Zm94-4c-3-9 0-15 8-20 5 9 2 16-8 20Z" />
          </g>
          <g transform="translate(1440 0) scale(-1 1)" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <path strokeWidth="2.1" d="M692 36c-45 0-50-19-94-19-42 0-57 34-100 34-40 0-55-23-96-23-39 0-58 20-98 20-41 0-57-20-96-20-32 0-52 15-80 20-27 5-50 1-68-10-16-10-30-9-40 3-9 11-4 23 7 23 10 0 15-8 9-15" />
            <path strokeWidth="1" opacity=".9" d="M692 43c-43 0-52-17-94-17-41 0-59 31-100 31-38 0-56-20-96-20-38 0-60 18-98 18-39 0-58-17-96-17-29 0-52 12-79 17-25 5-47 1-67-8" />
            <path strokeWidth="1.2" opacity=".82" d="M677 29c-25 1-43-7-62-18-18-10-36-10-53 1m-76 29c-19 2-34-3-49-13m-107 19c-19-3-34-9-48-19m-113 17c-17 0-32-5-45-14m385 5c-14 4-25 11-34 20m125-27c-17 1-31-4-44-13" />
            <path strokeWidth="1.8" d="M40 57c2-14 11-21 24-22 14-1 22-9 24-23 2 14 10 22 24 23 14 1 22 8 24 22m-96-5c10-8 19-11 30-10m35 0c11 0 21 3 30 10m-85-5c10 2 18-1 23-10m36 0c5 9 13 12 23 10" />
            <path strokeWidth="1.2" d="M49 49c-5-10-3-19 7-26 6 10 5 18-7 26Zm29-13c-2-12 3-20 15-25 3 12-1 20-15 25Zm25 1c5-10 13-14 25-12-4 11-12 15-25 12Zm-47 9c-9 8-11 16-7 25 10-7 12-15 7-25Zm59 1c8 8 10 16 6 24-9-7-10-15-6-24Z" />
            <path strokeWidth="1.35" d="M147 45c18 3 34-1 48-12m23 1c13 9 26 13 41 13m27-7c14 2 28 0 42-6m23 1c14 7 27 10 42 7m29-9c13 1 24 0 36-5m-347 9c11-4 21-4 32 0" />
            <path strokeWidth="1.05" d="M179 36c-7-8-7-15 0-23 8 8 8 15 0 23Zm91 8c-4 10-2 17 7 23 5-10 2-17-7-23Zm69-7c-2-9 2-16 12-20 3 10-1 17-12 20Zm95 0c-1 9 4 16 14 18 1-11-4-17-14-18Zm99 2c-1-9 4-15 13-18 2 10-2 16-13 18Zm94-4c-3-9 0-15 8-20 5 9 2 16-8 20Z" />
          </g>
          <g fill="currentColor" stroke="currentColor" strokeLinejoin="round">
            <path d="M14 8h1420v3H14zM14 62h1420v2H14z" opacity=".72" />
            <path d="m664 36 8-7 8 7-8 7-8-7Zm96 0 8-7 8 7-8 7-8-7Z" />
            <circle cx="720" cy="36" r="25" fill="#5c3a20" strokeWidth="2.4" />
            <circle cx="720" cy="36" r="19" fill="none" stroke="#c99f58" strokeWidth="1.2" />
            <path d="M720 52V21m0 17c-9 0-14-6-13-14 8 1 13 5 13 14Zm0-6c0-9 5-14 13-15 1 9-4 15-13 15Zm-2 15c-6-7-13-7-19-2 6 7 12 8 19 2Zm4 0c6-7 13-7 19-2-6 7-12 8-19 2Z" stroke="none" />
            <circle cx="720" cy="36" r="3" fill="#5c3a20" stroke="none" />
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
