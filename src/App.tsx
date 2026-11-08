import { useMemo, useState } from 'react'
import { books, categories } from './data/books'
import { Bookshelf } from './components/Bookshelf'
import { CategoryFilter } from './components/CategoryFilter'
import { SearchBar } from './components/SearchBar'
import type { RecipeBook } from './types/recipe'

function App() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string>('Все книги')
  const [selectedBook, setSelectedBook] = useState<RecipeBook | null>(null)

  const filteredBooks = useMemo(() => books.filter((book) => {
    const matchesCategory = category === 'Все книги' || book.category === category
    const term = search.trim().toLocaleLowerCase('ru')
    const matchesSearch = !term || `${book.title} ${book.subtitle} ${book.category}`.toLocaleLowerCase('ru').includes(term)
    return matchesCategory && matchesSearch
  }), [category, search])

  return (
    <div className="app-shell" id="home">
      <div className="paper-grain" aria-hidden="true" />
      <main id="library">
        <section className="library-section" aria-label="Коллекция рецептов">
          <div className="section-heading"><div><p className="eyebrow small">НАШЕ СОБРАНИЕ</p><h2>Книжные полки</h2></div><p className="book-count"><strong>{filteredBooks.length.toString().padStart(2, '0')}</strong> книг в собрании</p></div>
          <SearchBar value={search} onChange={setSearch} />
          <CategoryFilter categories={categories} selected={category} onSelect={setCategory} />
          {filteredBooks.length > 0 ? <Bookshelf books={filteredBooks} onBookSelect={setSelectedBook} /> : <div className="empty-state"><span>⌕</span><h3>Книга не нашлась</h3><p>Попробуйте изменить запрос или выбрать другой раздел.</p></div>}
        </section>
      </main>
      {selectedBook && <div className="dialog-backdrop" role="presentation" onClick={() => setSelectedBook(null)}><section className="book-dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title" onClick={(event) => event.stopPropagation()}><button className="dialog-close" onClick={() => setSelectedBook(null)} aria-label="Закрыть">×</button><p className="eyebrow small">КНИГА ИЗ СОБРАНИЯ</p><h2 id="dialog-title">{selectedBook.title}</h2><p>{selectedBook.subtitle}</p><div className="dialog-rule" /><p className="dialog-meta">{selectedBook.category}</p><span className="dialog-note">Скоро здесь откроются страницы с рецептами.</span></section></div>}
    </div>
  )
}

export default App
