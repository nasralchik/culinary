import type { PublicRecipe, RecipeIngredient, RecipeStep } from '../data/recipeRepository'

interface RecipeViewProps {
  recipe: PublicRecipe
  ingredients: RecipeIngredient[]
  steps: RecipeStep[]
  loadingDetails: boolean
  recipeError: string
  pdfError: string
  creatingPdf: boolean
  scaleIngredientId: string
  scaleTarget: string
  scaleFactor: number
  showScaler: boolean
  shareUrl: string
  shareNotice: string
  standalone?: boolean
  onClose: () => void
  onDownloadPdf: () => void
  onToggleScaler: () => void
  onSelectScaleIngredient: (id: string) => void
  onScaleTargetChange: (value: string) => void
  onResetScale: () => void
  onShare: () => void
  formatAmount: (ingredient: RecipeIngredient, multiplier: number) => string
}

function validUnit(unit: string) {
  const value = unit.trim()
  return value.length > 0 && !/^\d+(?:[.,]\d+)?$/.test(value)
}

export function RecipeView({
  recipe,
  ingredients,
  steps,
  loadingDetails,
  recipeError,
  pdfError,
  creatingPdf,
  scaleIngredientId,
  scaleTarget,
  scaleFactor,
  showScaler,
  shareUrl,
  shareNotice,
  standalone = false,
  onClose,
  onDownloadPdf,
  onToggleScaler,
  onSelectScaleIngredient,
  onScaleTargetChange,
  onResetScale,
  onShare,
  formatAmount,
}: RecipeViewProps) {
  const scalableIngredients = ingredients.filter((ingredient) => ingredient.quantity != null && ingredient.quantity >= 0.01)
  const selectedIngredient = scalableIngredients.find((ingredient) => ingredient.id === scaleIngredientId) ?? scalableIngredients[0]
  const Title = standalone ? 'h1' : 'h2'

  const content = <>
    <div className="recipe-dialog-topline">
      <p className="eyebrow small">{recipe.category}</p>
      <div className="recipe-dialog-actions">
        <button className="recipe-print-button recipe-icon-button" type="button" onClick={onDownloadPdf} disabled={creatingPdf || loadingDetails} aria-label={creatingPdf ? 'Создаём PDF' : 'Скачать рецепт в PDF'} title={creatingPdf ? 'Создаём PDF…' : 'Скачать рецепт в PDF'}>
          {creatingPdf ? <span className="recipe-pdf-spinner" aria-hidden="true" /> : <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M7 3h7l5 5v13H7z"/><path d="M14 3v6h5M12 12v6m0 0 3-3m-3 3-3-3M4 7v14"/></svg>}
        </button>
        {scalableIngredients.length > 0 && <button className={`recipe-scaler-toggle recipe-icon-button${showScaler ? ' is-active' : ''}`} type="button" aria-expanded={showScaler} aria-controls="recipe-scaler" onClick={onToggleScaler} aria-label={showScaler ? 'Скрыть пересчёт количества' : 'Изменить количество'} title={showScaler ? 'Скрыть пересчёт количества' : 'Изменить количество'}>
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16M4 12h16M4 18h16"/><circle cx="9" cy="6" r="2" fill="currentColor"/><circle cx="15" cy="12" r="2" fill="currentColor"/><circle cx="11" cy="18" r="2" fill="currentColor"/></svg>
        </button>}
        <button className="recipe-share-button recipe-icon-button" type="button" onClick={onShare} aria-label="Поделиться рецептом" title="Поделиться рецептом">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.7 10.6 6.6-4.2m-6.6 7 6.6 4"/></svg>
        </button>
      </div>
    </div>
    <Title className="recipe-view-title" id={standalone ? 'shared-recipe-title' : 'dialog-title'}>{recipe.title}</Title>
    {recipe.summary && <p className="recipe-summary">{recipe.summary}</p>}
    {recipe.image_url && <img className="recipe-image" src={recipe.image_url} alt={recipe.title} />}
    {recipe.description && <p className="recipe-description">{recipe.description}</p>}
    {shareUrl && <div className="recipe-share-result" role="status">
      <label>Ссылка на рецепт<input readOnly value={shareUrl} onFocus={(event) => event.currentTarget.select()} aria-label="Ссылка для отправки рецепта" /></label>
      <span>{shareNotice}</span>
    </div>}
    {loadingDetails ? <p className="recipe-empty" role="status">Загружаем рецепт…</p> : <>
      {ingredients.length > 0 && <div className="recipe-detail-section"><h3>Ингредиенты</h3>
        {showScaler && selectedIngredient && <div className="recipe-scaler" id="recipe-scaler">
          <div className="recipe-scaler-heading"><strong>Изменить количество</strong><span>Остальные ингредиенты пересчитаются пропорционально.</span></div>
          <div className="recipe-scaler-controls">
            <label>Пересчитать по продукту<select value={selectedIngredient.id} onChange={(event) => onSelectScaleIngredient(event.target.value)}>{scalableIngredients.map((ingredient) => <option key={ingredient.id} value={ingredient.id}>{ingredient.name}</option>)}</select></label>
            <label>Новое количество<div className="recipe-scaler-amount"><input type="number" min="0.01" step="0.01" aria-label={`Новое количество ингредиента: ${selectedIngredient.name}`} value={scaleTarget} onChange={(event) => onScaleTargetChange(event.target.value)} onBlur={(event) => {
              const value = Number(event.currentTarget.value)
              if (Number.isFinite(value) && value > 0) onScaleTargetChange(String(Math.max(0.01, Math.floor((value + 1e-9) * 100) / 100)))
            }} /><span>{validUnit(selectedIngredient.unit) ? selectedIngredient.unit : 'ед.'}</span></div></label>
            <button type="button" className="recipe-scaler-reset" onClick={onResetScale}>Исходное количество</button>
          </div>
        </div>}
        <ul>{ingredients.map((ingredient) => {
          const missingUnit = ingredient.quantity != null && !validUnit(ingredient.unit)
          return <li key={ingredient.id}><span>{ingredient.name}</span><span className={missingUnit ? 'ingredient-amount ingredient-unit-missing' : 'ingredient-amount'}>{formatAmount(ingredient, scaleFactor)}</span></li>
        })}</ul>
      </div>}
      {steps.length > 0 && <div className="recipe-detail-section"><h3>Приготовление</h3><ol>{steps.map((step) => <li key={step.id}>{step.instruction}</li>)}</ol></div>}
    </>}
    {pdfError && <p className="recipe-pdf-error" role="alert">{pdfError}</p>}
    {recipeError && <p className="admin-error" role="alert">{recipeError}</p>}
    {recipe.youtube_url && <a className="recipe-video-link" href={recipe.youtube_url} target="_blank" rel="noreferrer">Смотреть на YouTube ↗</a>}
  </>

  if (standalone) {
    return <main className="shared-recipe-page">
      <header className="shared-recipe-header"><button type="button" onClick={onClose}>← К библиотеке</button><span>Кулинарная библиотека</span></header>
      <article className="shared-recipe-card" aria-labelledby="shared-recipe-title">{content}</article>
    </main>
  }

  return <div className="dialog-backdrop" role="presentation" onClick={onClose}>
    <section className="book-dialog recipe-dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title" onClick={(event) => event.stopPropagation()}>
      <button className="dialog-close" onClick={onClose} aria-label="Закрыть">×</button>
      {content}
    </section>
  </div>
}
