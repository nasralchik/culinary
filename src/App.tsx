import { useCallback, useEffect, useMemo, useState } from 'react'
import { ALL_RECIPES_LABEL, recipeCoverPalettes } from './data/books'
import { getPublishedLibrary, getRecipeDetails, type PublicRecipe, type RecipeIngredient, type RecipeSection } from './data/recipeRepository'
import { AdminPanel } from './components/AdminPanel'
import { Bookshelf } from './components/Bookshelf'
import { CategoryFilter } from './components/CategoryFilter'
import { RecipeView } from './components/RecipeView'
import { SearchBar } from './components/SearchBar'
import { PwaInstallPrompt } from './components/PwaInstallPrompt'
import type { RecipeBook, RecipeCategory } from './types/recipe'

function isValidIngredientUnit(unit: string) {
  const value = unit.trim()
  return value.length > 0 && !/^\d+(?:[.,]\d+)?$/.test(value)
}

function roundDownToTwo(value: number) {
  return Math.floor((value + 1e-9) * 100) / 100
}

function formatIngredientAmount(ingredient: RecipeIngredient, multiplier = 1) {
  const unit = isValidIngredientUnit(ingredient.unit) ? ingredient.unit.trim() : ''
  const parts: string[] = []

  if (ingredient.quantity != null) {
    const quantity = roundDownToTwo(ingredient.quantity * multiplier)
    parts.push(unit
      ? `${quantity.toLocaleString('ru-RU', { maximumFractionDigits: 2 })} ${unit}`
      : `${quantity.toLocaleString('ru-RU', { maximumFractionDigits: 2 })} · единица не указана`)
  } else if (unit) {
    parts.push(unit)
  }

  if (ingredient.alternative_name.trim()) {
    const alternativeUnit = isValidIngredientUnit(ingredient.alternative_unit) ? ingredient.alternative_unit.trim() : ''
    const alternativeQuantity = ingredient.alternative_quantity == null
      ? ''
      : roundDownToTwo(ingredient.alternative_quantity * multiplier).toLocaleString('ru-RU', { maximumFractionDigits: 2 })
    const alternativeAmount = [alternativeQuantity, alternativeUnit].filter(Boolean).join(' ')
    parts.push(`или ${ingredient.alternative_name.trim()}${alternativeAmount ? ` — ${alternativeAmount}` : ''}`)
  }

  if (ingredient.note.trim()) parts.push(ingredient.note.trim())
  return parts.join(' · ') || 'Количество не указано'
}

function App() {
  const initialRecipeId = new URLSearchParams(window.location.search).get('recipe')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string>(ALL_RECIPES_LABEL)
  const [availableCategories, setAvailableCategories] = useState<string[]>([])
  const [showAdmin, setShowAdmin] = useState(false)
  const [recipes, setRecipes] = useState<PublicRecipe[]>([])
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(initialRecipeId)
  const [sharedRecipeId, setSharedRecipeId] = useState<string | null>(initialRecipeId)
  const [recipeSections, setRecipeSections] = useState<RecipeSection[]>([])
  const [scaleIngredientId, setScaleIngredientId] = useState('')
  const [scaleTarget, setScaleTarget] = useState('')
  const [scaleAdjusted, setScaleAdjusted] = useState(false)
  const [showScaler, setShowScaler] = useState(false)
  const [pdfError, setPdfError] = useState('')
  const [shareUrl, setShareUrl] = useState('')
  const [shareNotice, setShareNotice] = useState('')
  const [creatingPdf, setCreatingPdf] = useState(false)
  const [loadingLibrary, setLoadingLibrary] = useState(true)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [libraryError, setLibraryError] = useState('')
  const [recipeError, setRecipeError] = useState('')

  const refreshRecipes = useCallback(async () => {
    setLoadingLibrary(true)
    setLibraryError('')
    try {
      const library = await getPublishedLibrary()
      setRecipes(library.recipes)
      setAvailableCategories(library.categories)
      setCategory((current) => current === ALL_RECIPES_LABEL || library.categories.includes(current) ? current : ALL_RECIPES_LABEL)
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
    setRecipeSections([])
    setScaleIngredientId('')
    setScaleTarget('')
    setScaleAdjusted(false)
    setShowScaler(false)
    setPdfError('')
    setShareUrl('')
    setShareNotice('')
    setRecipeError('')
    setLoadingDetails(true)
    getRecipeDetails(selectedRecipeId)
      .then((details) => {
        if (active) {
          setRecipeSections(details.sections)
          const firstScalable = details.sections.flatMap((section) => section.ingredients).find((ingredient) => ingredient.quantity != null && ingredient.quantity >= 0.01)
          setScaleIngredientId(firstScalable?.id ?? '')
          setScaleTarget(firstScalable?.quantity == null ? '' : String(roundDownToTwo(firstScalable.quantity)))
          setScaleAdjusted(false)
        }
      })
      .catch(() => { if (active) setRecipeError('Состав и приготовление рецепта не удалось загрузить.') })
      .finally(() => { if (active) setLoadingDetails(false) })
    return () => { active = false }
  }, [selectedRecipeId])

  const filteredRecipes = useMemo(() => recipes.filter((recipe) => {
    const matchesCategory = category === ALL_RECIPES_LABEL || recipe.category === category
    const term = search.trim().toLocaleLowerCase('ru')
    const matchesSearch = !term || [recipe.title, recipe.summary, recipe.category].join(' ').toLocaleLowerCase('ru').includes(term)
    return matchesCategory && matchesSearch
  }), [category, recipes, search])

  const searchSuggestions = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('ru')
    const titleMatchScore = (title: string) => {
      const normalizedTitle = title.toLocaleLowerCase('ru')
      if (normalizedTitle === term) return 0
      if (normalizedTitle.startsWith(term)) return 1
      if (normalizedTitle.includes(term)) return 2
      return 3
    }

    return [...filteredRecipes]
      .sort((left, right) => titleMatchScore(left.title) - titleMatchScore(right.title) || left.title.localeCompare(right.title, 'ru'))
      .slice(0, 6)
      .map(({ id, title, summary, category: recipeCategory }) => ({ id, title, summary, category: recipeCategory }))
  }, [filteredRecipes, search])

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
  const ingredients = recipeSections.flatMap((section) => section.ingredients)
  const scalableIngredients = ingredients.filter((ingredient) => ingredient.quantity != null && ingredient.quantity >= 0.01)
  const selectedScaleIngredient = scalableIngredients.find((ingredient) => ingredient.id === scaleIngredientId) ?? scalableIngredients[0]
  const requestedScaleQuantity = Number(scaleTarget)
  const scaleFactor = scaleAdjusted && selectedScaleIngredient && scaleTarget.trim() && Number.isFinite(requestedScaleQuantity) && requestedScaleQuantity > 0
    ? requestedScaleQuantity / (selectedScaleIngredient.quantity ?? 1)
    : 1
  const closeRecipe = () => {
    if (sharedRecipeId) {
      const url = new URL(window.location.href)
      url.searchParams.delete('recipe')
      window.history.replaceState({}, '', url)
      setSharedRecipeId(null)
    }
    setSelectedRecipeId(null)
    setRecipeError('')
    setScaleIngredientId('')
    setScaleTarget('')
    setScaleAdjusted(false)
    setShowScaler(false)
    setPdfError('')
    setShareUrl('')
    setShareNotice('')
  }

  const downloadRecipePdf = async () => {
    if (!selectedRecipe || creatingPdf) return
    setCreatingPdf(true)
    setPdfError('')
    try {
      const { downloadRecipePdfFile } = await import('./utils/recipePdf')
      await downloadRecipePdfFile({
        recipe: selectedRecipe,
        sections: recipeSections.map((section) => ({
          title: section.title,
          ingredients: section.ingredients.map((ingredient) => ({
            name: ingredient.name,
            amount: formatIngredientAmount(ingredient, scaleFactor),
          })),
          steps: section.steps.map((step) => step.instruction),
        })),
      })
    } catch (error) {
      console.error('PDF creation failed:', error)
      setPdfError(error instanceof Error ? `Не удалось создать PDF: ${error.message}` : 'Не удалось создать PDF. Попробуйте ещё раз.')
    } finally {
      setCreatingPdf(false)
    }
  }

  const shareRecipe = async () => {
    if (!selectedRecipe) return
    const url = new URL(window.location.href)
    url.search = ''
    url.hash = ''
    url.searchParams.set('recipe', selectedRecipe.id)
    const link = url.toString()
    setShareUrl(link)
    try {
      await navigator.clipboard.writeText(link)
      setShareNotice('Ссылка скопирована. Её можно отправить друзьям.')
    } catch {
      setShareNotice('Скопируйте ссылку из поля выше.')
    }
  }

  const changeScaleIngredient = (ingredientId: string) => {
    const nextIngredient = scalableIngredients.find((ingredient) => ingredient.id === ingredientId)
    if (!nextIngredient) return
    setScaleIngredientId(nextIngredient.id)
    setScaleTarget(String(roundDownToTwo(nextIngredient.quantity ?? 0)))
    setScaleAdjusted(false)
  }

  const resetScale = () => {
    if (!selectedScaleIngredient) return
    setScaleTarget(String(roundDownToTwo(selectedScaleIngredient.quantity ?? 0)))
    setScaleAdjusted(false)
  }

  const openRecipe = (recipeId: string) => {
    setRecipeError('')
    setShareUrl('')
    setShareNotice('')
    setSharedRecipeId(null)
    setSelectedRecipeId(recipeId)
  }

  return (
    <div className="app-shell" id="home">
      <div className="paper-grain" aria-hidden="true" />
      {!sharedRecipeId && <main id="library">
        <section className="library-section" aria-label="Коллекция рецептов">
          <div className="library-toolbar">
            <div className="library-tools"><SearchBar value={search} suggestions={searchSuggestions} onChange={setSearch} onSelect={openRecipe} /><button className="admin-entry" aria-label="Админ-панель" title="Админ-панель" onClick={() => setShowAdmin(true)}><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="3"/><path d="M12 2.5v2m0 15v2M2.5 12h2m15 0h2M5.3 5.3l1.4 1.4m10.6 10.6 1.4 1.4m0-13.4-1.4 1.4M6.7 17.3l-1.4 1.4"/></svg></button></div>
            <CategoryFilter categories={[ALL_RECIPES_LABEL, ...availableCategories]} selected={category} onSelect={setCategory} />
          </div>
          {loadingLibrary ? <div className="empty-state" role="status"><span>⌛</span><h3>Загружаем рецепты</h3><p>Открываем страницы нашей кулинарной библиотеки.</p></div>
            : libraryError ? <div className="empty-state" role="alert"><span>⌕</span><h3>Библиотека временно недоступна</h3><p>{libraryError}</p></div>
              : recipeBooks.length > 0 ? <Bookshelf books={recipeBooks} categories={availableCategories} selectedCategory={category} onBookSelect={(book) => openRecipe(book.id)} />
                : <div className="empty-state"><span>⌕</span><h3>{recipes.length === 0 ? 'Рецептов пока нет' : 'Ничего не найдено'}</h3><p>{recipes.length === 0 ? 'Опубликованные рецепты появятся здесь отдельными книгами.' : 'Измените поиск или выберите другую категорию.'}</p></div>}
        </section>
      </main>}
      {sharedRecipeId && (selectedRecipe
        ? <RecipeView recipe={selectedRecipe} sections={recipeSections} loadingDetails={loadingDetails} recipeError={recipeError} pdfError={pdfError} creatingPdf={creatingPdf} scaleIngredientId={scaleIngredientId} scaleTarget={scaleTarget} scaleFactor={scaleFactor} showScaler={showScaler} shareUrl={shareUrl} shareNotice={shareNotice} standalone onClose={closeRecipe} onDownloadPdf={() => void downloadRecipePdf()} onToggleScaler={() => setShowScaler((visible) => !visible)} onSelectScaleIngredient={changeScaleIngredient} onScaleTargetChange={(value) => { setScaleTarget(value); setScaleAdjusted(true) }} onResetScale={resetScale} onShare={() => void shareRecipe()} formatAmount={formatIngredientAmount} />
        : <main className="shared-recipe-page"><section className="shared-recipe-card shared-recipe-status"><p className="recipe-empty" role={loadingLibrary ? 'status' : 'alert'}>{loadingLibrary ? 'Загружаем рецепт…' : libraryError || 'Рецепт не найден или больше не опубликован.'}</p><button type="button" className="shared-recipe-back" onClick={closeRecipe}>← К библиотеке</button></section></main>)}
      {!sharedRecipeId && selectedRecipe && <RecipeView recipe={selectedRecipe} sections={recipeSections} loadingDetails={loadingDetails} recipeError={recipeError} pdfError={pdfError} creatingPdf={creatingPdf} scaleIngredientId={scaleIngredientId} scaleTarget={scaleTarget} scaleFactor={scaleFactor} showScaler={showScaler} shareUrl={shareUrl} shareNotice={shareNotice} onClose={closeRecipe} onDownloadPdf={() => void downloadRecipePdf()} onToggleScaler={() => setShowScaler((visible) => !visible)} onSelectScaleIngredient={changeScaleIngredient} onScaleTargetChange={(value) => { setScaleTarget(value); setScaleAdjusted(true) }} onResetScale={resetScale} onShare={() => void shareRecipe()} formatAmount={formatIngredientAmount} />}
      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} onRecipesChanged={() => { void refreshRecipes() }} />}
      <PwaInstallPrompt />
    </div>
  )
}

export default App
