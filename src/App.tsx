import { useCallback, useEffect, useMemo, useState } from 'react'
import { categories, recipeCoverPalettes } from './data/books'
import { getPublishedRecipes, getRecipeDetails, type PublicRecipe, type RecipeIngredient, type RecipeStep } from './data/recipeRepository'
import { AdminPanel } from './components/AdminPanel'
import { Bookshelf } from './components/Bookshelf'
import { CategoryFilter } from './components/CategoryFilter'
import { SearchBar } from './components/SearchBar'
import type { RecipeBook, RecipeCategory } from './types/recipe'

function isValidIngredientUnit(unit: string) {
  const value = unit.trim()
  return value.length > 0 && !/^\d+(?:[.,]\d+)?$/.test(value)
}

function formatIngredientAmount(ingredient: RecipeIngredient) {
  const unit = isValidIngredientUnit(ingredient.unit) ? ingredient.unit.trim() : ''
  const parts: string[] = []

  if (ingredient.quantity != null) {
    parts.push(unit
      ? `${ingredient.quantity.toLocaleString('ru-RU')} ${unit}`
      : `${ingredient.quantity.toLocaleString('ru-RU')} · единица не указана`)
  } else if (unit) {
    parts.push(unit)
  }

  if (ingredient.note.trim()) parts.push(ingredient.note.trim())
  return parts.join(' · ') || 'Количество не указано'
}

function App() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string>('Все рецепты')
  const [showAdmin, setShowAdmin] = useState(false)
  const [recipes, setRecipes] = useState<PublicRecipe[]>([])
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null)
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([])
  const [steps, setSteps] = useState<RecipeStep[]>([])
  const [loadingLibrary, setLoadingLibrary] = useState(true)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [libraryError, setLibraryError] = useState('')
  const [recipeError, setRecipeError] = useState('')

  const refreshRecipes = useCallback(async () => {
    setLoadingLibrary(true)
    setLibraryError('')
    try {
      setRecipes(await getPublishedRecipes())
    } catch {
      setLibraryError('Опубликованные рецепты не удалось загрузить. Попробуйте обновить страницу.')
    } finally {
      setLoadingLibrary(false)
    }
  }, [])

  useEffect(() => {
    void refreshRecipes()
  }, [refreshRecipes])

  useEffect(() => {
    if (!selectedRecipeId) return
    let active = true
    setIngredients([])
    setSteps([])
    setRecipeError('')
    setLoadingDetails(true)
    getRecipeDetails(selectedRecipeId)
      .then((details) => {
        if (active) {
          setIngredients(details.ingredients)
          setSteps(details.steps)
        }
      })
      .catch(() => { if (active) setRecipeError('Состав и приготовление рецепта не удалось загрузить.') })
      .finally(() => { if (active) setLoadingDetails(false) })
    return () => { active = false }
  }, [selectedRecipeId])

  const filteredRecipes = useMemo(() => recipes.filter((recipe) => {
    const matchesCategory = category === 'Все рецепты' || recipe.category === category
    const term = search.trim().toLocaleLowerCase('ru')
    const matchesSearch = !term || [recipe.title, recipe.summary, recipe.category].join(' ').toLocaleLowerCase('ru').includes(term)
    return matchesCategory && matchesSearch
  }), [category, recipes, search])

  const recipeBooks = useMemo(() => filteredRecipes.map((recipe): RecipeBook => {
    const recipeIndex = recipes.findIndex((item) => item.id === recipe.id)
    const palette = recipeCoverPalettes[recipeIndex % recipeCoverPalettes.length]
    return {
      id: recipe.id,
      title: recipe.title,
      subtitle: recipe.summary,
      category: recipe.category as RecipeCategory,
      color: palette.color,
      accent: palette.accent,
      artImage: recipe.image_url ?? undefined,
    }
  }), [filteredRecipes, recipes])

  const selectedRecipe = recipes.find((recipe) => recipe.id === selectedRecipeId) ?? null
  const closeRecipe = () => {
    setSelectedRecipeId(null)
    setRecipeError('')
  }

  return (
    <div className="app-shell" id="home">
      <div className="paper-grain" aria-hidden="true" />
      <main id="library">
        <section className="library-section" aria-label="Коллекция рецептов">
          <div className="library-toolbar">
            <div className="library-tools"><SearchBar value={search} onChange={setSearch} /><button className="admin-entry" aria-label="Админ-панель" title="Админ-панель" onClick={() => setShowAdmin(true)}><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="3"/><path d="M12 2.5v2m0 15v2M2.5 12h2m15 0h2M5.3 5.3l1.4 1.4m10.6 10.6 1.4 1.4m0-13.4-1.4 1.4M6.7 17.3l-1.4 1.4"/></svg></button></div>
            <CategoryFilter categories={categories} selected={category} onSelect={setCategory} />
          </div>
          {loadingLibrary ? <div className="empty-state" role="status"><span>⌛</span><h3>Загружаем рецепты</h3><p>Открываем страницы нашей кулинарной библиотеки.</p></div>
            : libraryError ? <div className="empty-state" role="alert"><span>⌕</span><h3>Библиотека временно недоступна</h3><p>{libraryError}</p></div>
              : recipeBooks.length > 0 ? <Bookshelf books={recipeBooks} selectedCategory={category} onBookSelect={(book) => { setRecipeError(''); setSelectedRecipeId(book.id) }} />
                : <div className="empty-state"><span>⌕</span><h3>{recipes.length === 0 ? 'Рецептов пока нет' : 'Ничего не найдено'}</h3><p>{recipes.length === 0 ? 'Опубликованные рецепты появятся здесь отдельными книгами.' : 'Измените поиск или выберите другую категорию.'}</p></div>}
        </section>
      </main>
      {selectedRecipe && <div className="dialog-backdrop" role="presentation" onClick={closeRecipe}>
        <section className="book-dialog recipe-dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title" onClick={(event) => event.stopPropagation()}>
          <button className="dialog-close" onClick={closeRecipe} aria-label="Закрыть">×</button>
          <button className="recipe-print-button" type="button" onClick={() => window.print()} title="Откроется окно печати, где можно выбрать «Сохранить в PDF»">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M7 8V3h10v5M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"/><path d="M7 14h10v7H7zM17 11h.01"/></svg>
            Сохранить в PDF
          </button>
          <p className="eyebrow small">{selectedRecipe.category}</p>
          <h2 id="dialog-title">{selectedRecipe.title}</h2>
          {selectedRecipe.summary && <p className="recipe-summary">{selectedRecipe.summary}</p>}
          {selectedRecipe.image_url && <img className="recipe-image" src={selectedRecipe.image_url} alt={selectedRecipe.title} />}
          <p className="recipe-meta">Порций: {selectedRecipe.servings} · Подготовка: {selectedRecipe.prep_minutes} мин. · Готовка: {selectedRecipe.cook_minutes} мин.</p>
          {selectedRecipe.description && <p className="recipe-description">{selectedRecipe.description}</p>}
          {loadingDetails ? <p className="recipe-empty">Загружаем рецепт…</p> : <>
            {ingredients.length > 0 && <div className="recipe-detail-section"><h3>Ингредиенты</h3><ul>{ingredients.map((ingredient) => {
              const missingUnit = ingredient.quantity != null && !isValidIngredientUnit(ingredient.unit)
              return <li key={ingredient.id}><span>{ingredient.name}</span><span className={missingUnit ? 'ingredient-amount ingredient-unit-missing' : 'ingredient-amount'}>{formatIngredientAmount(ingredient)}</span></li>
            })}</ul></div>}
            {steps.length > 0 && <div className="recipe-detail-section"><h3>Приготовление</h3><ol>{steps.map((step) => <li key={step.id}>{step.instruction}</li>)}</ol></div>}
          </>}
          {recipeError && <p className="admin-error" role="alert">{recipeError}</p>}
          {selectedRecipe.youtube_url && <a className="recipe-video-link" href={selectedRecipe.youtube_url} target="_blank" rel="noreferrer">Смотреть на YouTube ↗</a>}
        </section>
      </div>}
      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} onRecipesChanged={() => { void refreshRecipes() }} />}
    </div>
  )
}

export default App
