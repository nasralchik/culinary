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
