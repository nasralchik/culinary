import type { CSSProperties } from 'react'
import type { RecipeBook } from '../types/recipe'

export function BookSpine({ book }: { book: RecipeBook }) {
  return (
    <button className="book-spine" style={{ '--book-color': book.color, '--book-accent': book.accent } as CSSProperties} aria-label={`${book.title}, ${book.recipes} рецептов`}>
      <span className="book-top-rule" />
      <span className="book-ornament" aria-hidden="true">✳</span>
      <span className="book-title">{book.title}</span>
      <span className="book-subtitle">{book.subtitle}</span>
      <span className="book-ornament bottom" aria-hidden="true">✦</span>
      <span className="book-bottom-rule" />
    </button>
  )
}
