import { useEffect, useMemo, useState } from 'react'
import { books, categories } from './data/books'
import { getPublishedRecipes, getRecipeDetails, type PublicRecipe, type RecipeIngredient, type RecipeStep } from './data/recipeRepository'
import { AdminPanel } from './components/AdminPanel'
import { Bookshelf } from './components/Bookshelf'
import { CategoryFilter } from './components/CategoryFilter'
import { SearchBar } from './components/SearchBar'
import type { RecipeBook } from './types/recipe'

function App() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string>('Все рецепты')
  const [selectedBook, setSelectedBook] = useState<RecipeBook | null>(null)
  const [showAdmin, setShowAdmin] = useState(false)
  const [recipes, setRecipes] = useState<PublicRecipe[]>([])
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null)
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([])
  const [steps, setSteps] = useState<RecipeStep[]>([])
  const [loadingRecipes, setLoadingRecipes] = useState(false)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [recipeError, setRecipeError] = useState('')

  useEffect(() => {
    if (!selectedBook) return
    let active = true
    setRecipes([])
    setSelectedRecipeId(null)
    setRecipeError('')
    setLoadingRecipes(true)
    getPublishedRecipes(selectedBook.category)
      .then((data) => { if (active) setRecipes(data) })
      .catch(() => { if (active) setRecipeError('Не удалось загрузить рецепты. Попробуйте открыть книгу ещё раз.') })
      .finally(() => { if (active) setLoadingRecipes(false) })
    return () => { active = false }
  }, [selectedBook])

  useEffect(() => {
    if (!selectedRecipeId) return
    let active = true
    setIngredients([])
    setSteps([])
    setLoadingDetails(true)
    getRecipeDetails(selectedRecipeId)
      .then((details) => {
        if (active) {
          setIngredients(details.ingredients)
          setSteps(details.steps)
        }
      })
      .catch(() => { if (active) setRecipeError('Не удалось загрузить состав и приготовление рецепта.') })
      .finally(() => { if (active) setLoadingDetails(false) })
    return () => { active = false }
  }, [selectedRecipeId])

  const filteredBooks = useMemo(() => books.filter((book) => {
    const matchesCategory = category === 'Все рецепты' || book.category === category
    const term = search.trim().toLocaleLowerCase('ru')
    const matchesSearch = !term || `${book.title} ${book.subtitle} ${book.category}`.toLocaleLowerCase('ru').includes(term)
    return matchesCategory && matchesSearch
  }), [category, search])

  const selectedRecipe = recipes.find((recipe) => recipe.id === selectedRecipeId) ?? null
  const closeBook = () => {
    setSelectedBook(null)
    setSelectedRecipeId(null)
    setRecipeError('')
  }

  return (
    <div className="app-shell" id="home">
      <div className="paper-grain" aria-hidden="true" />
      <main id="library">
        <section className="library-section" aria-label="Коллекция рецептов">
          <div className="library-tools"><SearchBar value={search} onChange={setSearch} /><button className="admin-entry" aria-label="Админ-панель" title="Админ-панель" onClick={() => setShowAdmin(true)}><span aria-hidden="true">⚙</span></button></div>
          <CategoryFilter categories={categories} selected={category} onSelect={setCategory} />
          {filteredBooks.length > 0 ? <Bookshelf books={filteredBooks} onBookSelect={setSelectedBook} /> : <div className="empty-state"><span>⌕</span><h3>Книга не нашлась</h3><p>Попробуйте изменить запрос или выбрать другой раздел.</p></div>}
        </section>
      </main>
      {selectedBook && <div className="dialog-backdrop" role="presentation" onClick={closeBook}>
        <section className="book-dialog recipe-dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title" onClick={(event) => event.stopPropagation()}>
          <button className="dialog-close" onClick={closeBook} aria-label="Закрыть">×</button>
          {selectedRecipe ? <>
            <button className="recipe-back" onClick={() => { setSelectedRecipeId(null); setRecipeError('') }}>← К списку рецептов</button>
            <p className="eyebrow small">{selectedBook.category}</p>
            <h2 id="dialog-title">{selectedRecipe.title}</h2>
            {selectedRecipe.image_url && <img className="recipe-image" src={selectedRecipe.image_url} alt={selectedRecipe.title} />}
            {selectedRecipe.summary && <p className="recipe-summary">{selectedRecipe.summary}</p>}
            <p className="recipe-meta">Порций: {selectedRecipe.servings} · Подготовка: {selectedRecipe.prep_minutes} мин. · Готовка: {selectedRecipe.cook_minutes} мин.</p>
            {selectedRecipe.description && <p className="recipe-description">{selectedRecipe.description}</p>}
            {loadingDetails ? <p className="recipe-empty">Загружаем рецепт…</p> : <>
              {ingredients.length > 0 && <div className="recipe-detail-section"><h3>Ингредиенты</h3><ul>{ingredients.map((ingredient) => <li key={ingredient.id}><span>{ingredient.name}</span><span>{ingredient.quantity == null ? '' : ingredient.quantity.toLocaleString('ru-RU')} {ingredient.unit} {ingredient.note}</span></li>)}</ul></div>}
              {steps.length > 0 && <div className="recipe-detail-section"><h3>Приготовление</h3><ol>{steps.map((step) => <li key={step.id}>{step.instruction}</li>)}</ol></div>}
            </>}
            {recipeError && <p className="admin-error" role="alert">{recipeError}</p>}
            {selectedRecipe.youtube_url && <a className="recipe-video-link" href={selectedRecipe.youtube_url} target="_blank" rel="noreferrer">Смотреть на YouTube ↗</a>}
          </> : <>
            <p className="eyebrow small">КНИГА ИЗ СОБРАНИЯ</p>
            <h2 id="dialog-title">{selectedBook.title}</h2>
            <p>{selectedBook.subtitle}</p>
            <div className="dialog-rule" />
            {loadingRecipes && <p className="recipe-empty">Загружаем рецепты…</p>}
            {!loadingRecipes && !recipeError && recipes.length === 0 && <p className="recipe-empty">В этой книге пока нет опубликованных рецептов.</p>}
            {recipeError && <p className="admin-error" role="alert">{recipeError}</p>}
            {recipes.length > 0 && <div className="recipe-list">{recipes.map((recipe) => <button key={recipe.id} onClick={() => { setRecipeError(''); setSelectedRecipeId(recipe.id) }}><strong>{recipe.title}</strong>{recipe.summary && <small>{recipe.summary}</small>}<span>Открыть →</span></button>)}</div>}
          </>}
        </section>
      </div>}
      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
    </div>
  )
}

export default App
