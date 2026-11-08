import { useEffect, useMemo, useState } from 'react'
import { books, categories } from './data/books'
import { getPublishedRecipeCount } from './data/recipeRepository'
import { Bookshelf } from './components/Bookshelf'
import { CategoryFilter } from './components/CategoryFilter'
import { Header } from './components/Header'
import { SearchBar } from './components/SearchBar'
import type { RecipeBook } from './types/recipe'
import { supabase } from './lib/supabase'

function App() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string>('Все книги')
  const [selectedBook, setSelectedBook] = useState<RecipeBook | null>(null)
  const [publishedRecipeCount, setPublishedRecipeCount] = useState<number | null>(null)
  const [connectionError, setConnectionError] = useState(false)

  useEffect(() => {
    if (!supabase) return

    let active = true
    getPublishedRecipeCount()
      .then((count) => {
        if (active) setPublishedRecipeCount(count)
      })
      .catch(() => {
        if (active) setConnectionError(true)
      })

    return () => { active = false }
  }, [])

  const filteredBooks = useMemo(() => books.filter((book) => {
    const matchesCategory = category === 'Все книги' || book.category === category
    const term = search.trim().toLocaleLowerCase('ru')
    const matchesSearch = !term || `${book.title} ${book.subtitle} ${book.category}`.toLocaleLowerCase('ru').includes(term)
    return matchesCategory && matchesSearch
  }), [category, search])

  return (
    <div className="app-shell" id="home">
      <div className="paper-grain" aria-hidden="true" />
      <Header />
      <main id="library">
        <section className="intro-section" aria-labelledby="page-title">
          <div className="intro-copy">
            <p className="eyebrow"><span /> СЕМЕЙНЫЙ АРХИВ ВКУСОВ <span /></p>
            <h1 id="page-title">У каждого блюда<br />есть <em>своя история</em></h1>
            <p className="intro-description">Собрали под одной крышей рецепты, которые передаются из поколения в поколение. Выберите книгу — и пусть на кухне станет уютнее.</p>
          </div>
          <div className="hero-seal" aria-hidden="true"><span className="seal-top">ДОМ</span><strong>К</strong><span className="seal-bottom">И ВКУС</span></div>
        </section>

        <section className="library-section" aria-label="Коллекция рецептов">
          <div className="section-heading"><div><p className="eyebrow small">НАШЕ СОБРАНИЕ</p><h2>Книжные полки</h2></div><p className="book-count"><strong>{filteredBooks.length.toString().padStart(2, '0')}</strong> книг в собрании</p></div>
          <SearchBar value={search} onChange={setSearch} />
          <CategoryFilter categories={categories} selected={category} onSelect={setCategory} />
          {filteredBooks.length > 0 ? <Bookshelf books={filteredBooks} onBookSelect={setSelectedBook} /> : <div className="empty-state"><span>⌕</span><h3>Книга не нашлась</h3><p>Попробуйте изменить запрос или выбрать другой раздел.</p></div>}
          {publishedRecipeCount !== null
            ? <p className="shelf-caption"><span>✦</span> В цифровом архиве опубликовано рецептов: <strong>{publishedRecipeCount}</strong> <span>✦</span></p>
            : <p className="shelf-caption"><span>✦</span> Выберите книгу, чтобы открыть собрание рецептов <span>✦</span></p>}
          {connectionError && <p className="archive-status error" role="status">Не удалось связаться с архивом. Показана библиотека-пример.</p>}
        </section>
      </main>
      <footer className="site-footer" id="about"><span>Кулинарная библиотека</span><span>С теплом и памятью о доме <i>✦</i></span><span>Храните, готовьте, передавайте</span></footer>
      {selectedBook && <div className="dialog-backdrop" role="presentation" onClick={() => setSelectedBook(null)}><section className="book-dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title" onClick={(event) => event.stopPropagation()}><button className="dialog-close" onClick={() => setSelectedBook(null)} aria-label="Закрыть">×</button><p className="eyebrow small">КНИГА ИЗ СОБРАНИЯ</p><h2 id="dialog-title">{selectedBook.title}</h2><p>{selectedBook.subtitle}</p><div className="dialog-rule" /><p className="dialog-meta">{selectedBook.category}</p><span className="dialog-note">Скоро здесь откроются страницы с рецептами.</span></section></div>}
    </div>
  )
}

export default App
