import type { CSSProperties } from 'react'
import { useState } from 'react'
import type { RecipeBook } from '../types/recipe'

export function BookSpine({ book }: { book: RecipeBook }) {
  const [imageFailed, setImageFailed] = useState(false)
  const artByCategory = { 'Первые блюда': '🍲', 'Выпечка': '🥧', 'Основные блюда': '🍖', 'Десерты': '🍰', 'Заготовки': '🫙' }
  const imageByCategory = { 'Первые блюда': '/images/dish-soup.jpg', 'Выпечка': '/images/dish-pie.jpg', 'Основные блюда': '/images/dish-roast.jpg', 'Десерты': '/images/dish-cake.jpg', 'Заготовки': '/images/dish-salad.jpg' }
  const image = book.artImage ?? imageByCategory[book.category]
  return (
    <button className="book-spine" style={{ '--book-color': book.color, '--book-accent': book.accent } as CSSProperties} aria-label={book.title} title={book.title}>
      <span className="book-top-rule" />
      <span className="book-ornament" aria-hidden="true">✳</span>
      <span className="book-title">{book.title}</span>
      <span className="book-subtitle">{book.subtitle}</span>
      <span className="book-art" aria-hidden="true">{image && !imageFailed ? <img src={image} alt="" loading="lazy" onError={() => setImageFailed(true)} /> : <span className="book-art-fallback">{book.art ?? artByCategory[book.category]}</span>}</span>
      <span className="book-ornament bottom" aria-hidden="true">✦</span>
      <span className="book-bottom-rule" />
    </button>
  )
}
