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

function formatIngredientAmount(ingredient: RecipeIngredient, multiplier = 1) {
  const unit = isValidIngredientUnit(ingredient.unit) ? ingredient.unit.trim() : ''
  const parts: string[] = []

  if (ingredient.quantity != null) {
    const quantity = Math.floor((ingredient.quantity * multiplier + 1e-9) * 100) / 100
    parts.push(unit
      ? `${quantity.toLocaleString('ru-RU', { maximumFractionDigits: 2 })} ${unit}`
      : `${quantity.toLocaleString('ru-RU', { maximumFractionDigits: 2 })} · единица не указана`)
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
  const [scaleIngredientId, setScaleIngredientId] = useState('')
  const [scaleTarget, setScaleTarget] = useState('')
  const [showScaler, setShowScaler] = useState(false)
  const [pdfError, setPdfError] = useState('')
  const [creatingPdf, setCreatingPdf] = useState(false)
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
    setScaleIngredientId('')
    setScaleTarget('')
    setShowScaler(false)
    setPdfError('')
    setRecipeError('')
    setLoadingDetails(true)
    getRecipeDetails(selectedRecipeId)
      .then((details) => {
        if (active) {
          setIngredients(details.ingredients)
          setSteps(details.steps)
          const firstScalable = details.ingredients.find((ingredient) => ingredient.quantity != null && ingredient.quantity > 0)
          setScaleIngredientId(firstScalable?.id ?? '')
          setScaleTarget(firstScalable?.quantity == null ? '' : String(firstScalable.quantity))
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
  const scalableIngredients = ingredients.filter((ingredient) => ingredient.quantity != null && ingredient.quantity > 0)
  const selectedScaleIngredient = scalableIngredients.find((ingredient) => ingredient.id === scaleIngredientId) ?? scalableIngredients[0]
  const requestedScaleQuantity = Number(scaleTarget)
  const scaleFactor = selectedScaleIngredient && scaleTarget.trim() && Number.isFinite(requestedScaleQuantity) && requestedScaleQuantity > 0
    ? requestedScaleQuantity / (selectedScaleIngredient.quantity ?? 1)
    : 1
  const closeRecipe = () => {
    setSelectedRecipeId(null)
    setRecipeError('')
    setScaleIngredientId('')
    setScaleTarget('')
    setShowScaler(false)
    setPdfError('')
  }

  const downloadRecipePdf = async () => {
    if (!selectedRecipe || creatingPdf) return
    setCreatingPdf(true)
    setPdfError('')
    try {
      const { downloadRecipePdfFile } = await import('./utils/recipePdf')
      await downloadRecipePdfFile({
        recipe: selectedRecipe,
        ingredients: ingredients.map((ingredient) => ({
          name: ingredient.name,
          amount: formatIngredientAmount(ingredient, scaleFactor),
        })),
        steps: steps.map((step) => step.instruction),
      })
    } catch {
      setPdfError('PDF не удалось создать. Попробуйте ещё раз.')
    } finally {
      setCreatingPdf(false)
    }
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
          <div className="recipe-dialog-topline">
            <p className="eyebrow small">{selectedRecipe.category}</p>
            <div className="recipe-dialog-actions">
              <button className="recipe-print-button" type="button" onClick={() => void downloadRecipePdf()} disabled={creatingPdf || loadingDetails}>
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12m0 0 4-4m-4 4-4-4M5 17v4h14v-4"/></svg>
                {creatingPdf ? 'Создаём PDF…' : 'Сохранить в PDF'}
              </button>
              {scalableIngredients.length > 0 && <button className="recipe-scaler-toggle" type="button" aria-expanded={showScaler} aria-controls="recipe-scaler" onClick={() => setShowScaler((visible) => !visible)}>
                {showScaler ? 'Скрыть пересчёт' : 'Изменить количество'}
              </button>}
            </div>
          </div>
          <h2 id="dialog-title">{selectedRecipe.title}</h2>
          {selectedRecipe.summary && <p className="recipe-summary">{selectedRecipe.summary}</p>}
          {selectedRecipe.image_url && <img className="recipe-image" src={selectedRecipe.image_url} alt={selectedRecipe.title} />}
          {selectedRecipe.description && <p className="recipe-description">{selectedRecipe.description}</p>}
          {loadingDetails ? <p className="recipe-empty">Загружаем рецепт…</p> : <>
            {ingredients.length > 0 && <div className="recipe-detail-section"><h3>Ингредиенты</h3>
              {showScaler && scalableIngredients.length > 0 && selectedScaleIngredient && <div className="recipe-scaler" id="recipe-scaler">
                <div className="recipe-scaler-heading"><strong>Изменить количество</strong><span>Остальные ингредиенты пересчитаются пропорционально.</span></div>
                <div className="recipe-scaler-controls">
                  <label>Пересчитать по продукту<select value={selectedScaleIngredient.id} onChange={(event) => {
                    const nextIngredient = scalableIngredients.find((ingredient) => ingredient.id === event.target.value)
                    if (nextIngredient) {
                      setScaleIngredientId(nextIngredient.id)
                      setScaleTarget(String(nextIngredient.quantity))
                    }
                  }}>{scalableIngredients.map((ingredient) => <option key={ingredient.id} value={ingredient.id}>{ingredient.name}</option>)}</select></label>
                  <label>Новое количество<div className="recipe-scaler-amount"><input type="number" min="0.001" step="any" aria-label={`Новое количество ингредиента: ${selectedScaleIngredient.name}`} value={scaleTarget} onChange={(event) => setScaleTarget(event.target.value)} /><span>{isValidIngredientUnit(selectedScaleIngredient.unit) ? selectedScaleIngredient.unit : 'ед.'}</span></div></label>
                  <button type="button" className="recipe-scaler-reset" onClick={() => setScaleTarget(String(selectedScaleIngredient.quantity))}>Исходное количество</button>
                </div>
              </div>}
              <ul>{ingredients.map((ingredient) => {
              const missingUnit = ingredient.quantity != null && !isValidIngredientUnit(ingredient.unit)
              return <li key={ingredient.id}><span>{ingredient.name}</span><span className={missingUnit ? 'ingredient-amount ingredient-unit-missing' : 'ingredient-amount'}>{formatIngredientAmount(ingredient, scaleFactor)}</span></li>
            })}</ul></div>}
            {steps.length > 0 && <div className="recipe-detail-section"><h3>Приготовление</h3><ol>{steps.map((step) => <li key={step.id}>{step.instruction}</li>)}</ol></div>}
          </>}
          {pdfError && <p className="recipe-pdf-error" role="alert">{pdfError}</p>}
          {recipeError && <p className="admin-error" role="alert">{recipeError}</p>}
          {selectedRecipe.youtube_url && <a className="recipe-video-link" href={selectedRecipe.youtube_url} target="_blank" rel="noreferrer">Смотреть на YouTube ↗</a>}
        </section>
      </div>}
      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} onRecipesChanged={() => { void refreshRecipes() }} />}
    </div>
  )
}

export default App
