import { useEffect, useState, type FormEvent } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { ALL_RECIPES_LABEL } from '../data/books'

interface CategoryRow {
  id: string
  title: string
  slug: string
  sort_order: number
}

interface CategoryDraft {
  id?: string
  title: string
  sort_order: string
}

interface RecipeRow {
  id: string
  title: string
  slug: string
  category_id: string | null
  summary: string
  description: string
  servings: number
  prep_minutes: number
  cook_minutes: number
  image_url: string | null
  youtube_url: string | null
  is_published: boolean
}

interface IngredientDraft {
  name: string
  quantity: string
  unit: string
  note: string
}

interface RecipeDraft {
  id?: string
  title: string
  category_id: string
  summary: string
  description: string
  servings: string
  prep_minutes: string
  cook_minutes: string
  image_url: string
  youtube_url: string
  is_published: boolean
}

const emptyDraft: RecipeDraft = {
  title: '', category_id: '', summary: '', description: '', servings: '4',
  prep_minutes: '0', cook_minutes: '0', image_url: '', youtube_url: '', is_published: false,
}

const emptyCategoryDraft: CategoryDraft = { title: '', sort_order: '1' }

const transliteration: Record<string, string> = {
  а:'a', б:'b', в:'v', г:'g', д:'d', е:'e', ё:'yo', ж:'zh', з:'z', и:'i', й:'y', к:'k', л:'l', м:'m', н:'n', о:'o', п:'p', р:'r', с:'s', т:'t', у:'u', ф:'f', х:'kh', ц:'ts', ч:'ch', ш:'sh', щ:'shch', ы:'y', э:'e', ю:'yu', я:'ya', ъ:'', ь:'',
}

function makeSlug(title: string) {
  const latin = [...title.toLocaleLowerCase('ru')].map((letter) => transliteration[letter] ?? letter).join('')
  return latin.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export function AdminPanel({ onClose, onRecipesChanged }: { onClose: () => void; onRecipesChanged?: () => void }) {
  const [user, setUser] = useState<User | null>(null)
  const [checking, setChecking] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [categories, setCategories] = useState<CategoryRow[]>([])
  const [categoryDraft, setCategoryDraft] = useState<CategoryDraft>(emptyCategoryDraft)
  const [adminView, setAdminView] = useState<'recipes' | 'categories'>('recipes')
  const [recipes, setRecipes] = useState<RecipeRow[]>([])
  const [draft, setDraft] = useState<RecipeDraft>(emptyDraft)
  const [ingredients, setIngredients] = useState<IngredientDraft[]>([{ name: '', quantity: '', unit: '', note: '' }])
  const [steps, setSteps] = useState<string[]>([''])
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL?.trim()
  const loginView = Boolean(supabase && adminEmail && !checking && !user)

  async function loadAdminData(currentUser: User) {
    if (!supabase) return
    setChecking(true)
    setError('')
    const { data: adminResult, error: adminError } = await supabase.rpc('is_recipe_admin')
    if (adminError) {
      setError('Не удалось проверить права. Сначала выполните миграцию администратора в Supabase.')
      setIsAdmin(false)
      setChecking(false)
      return
    }
    const allowed = Boolean(adminResult)
    setIsAdmin(allowed)
    setUser(currentUser)
    if (allowed) {
      const [categoryResult, recipeResult] = await Promise.all([
        supabase.from('recipe_categories').select('id,title,slug,sort_order').order('sort_order'),
        supabase.from('recipes').select('id,title,slug,category_id,summary,description,servings,prep_minutes,cook_minutes,image_url,youtube_url,is_published').order('created_at', { ascending: false }),
      ])
      if (categoryResult.error || recipeResult.error) {
        setError(categoryResult.error?.message ?? recipeResult.error?.message ?? 'Не удалось загрузить рецепты.')
      } else {
        const categoryRows = (categoryResult.data ?? []) as CategoryRow[]
        setCategories(categoryRows)
        setRecipes((recipeResult.data ?? []) as RecipeRow[])
        setDraft((current) => ({ ...current, category_id: current.category_id || categoryRows[0]?.id || '' }))
        setCategoryDraft((current) => ({ ...current, sort_order: current.sort_order === '1' ? String(categoryRows.length + 1) : current.sort_order }))
      }
    }
    setChecking(false)
  }

  useEffect(() => {
    let active = true
    if (!supabase || !adminEmail) {
      setChecking(false)
      setError(!supabase
        ? 'Supabase не настроен. Проверьте переменные VITE_SUPABASE_URL и VITE_SUPABASE_PUBLISHABLE_KEY в Render.'
        : 'Email администратора не настроен. Добавьте VITE_ADMIN_EMAIL в Render.')
      return () => { active = false }
    }
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      if (data.session?.user) void loadAdminData(data.session.user)
      else setChecking(false)
    })
    return () => { active = false }
  }, [])

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!supabase || !adminEmail) return
    setBusy(true)
    setError('')
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email: adminEmail, password })
    if (signInError || !data.user) {
      setError(signInError?.message ?? 'Вход не выполнен.')
    } else {
      setPassword('')
      await loadAdminData(data.user)
    }
    setBusy(false)
  }

  async function signOut() {
    if (supabase) await supabase.auth.signOut()
    setUser(null)
    setIsAdmin(false)
    setPassword('')
    setRecipes([])
    setDraft(emptyDraft)
    setNotice('')
    setError('')
  }

  async function editRecipe(recipe: RecipeRow) {
    if (!supabase) return
    setBusy(true)
    setError('')
    const [ingredientResult, stepResult] = await Promise.all([
      supabase.from('recipe_ingredients').select('name,quantity,unit,note,sort_order').eq('recipe_id', recipe.id).order('sort_order'),
      supabase.from('recipe_steps').select('instruction,step_number').eq('recipe_id', recipe.id).order('step_number'),
    ])
    if (ingredientResult.error || stepResult.error) {
      setError(ingredientResult.error?.message ?? stepResult.error?.message ?? 'Рецепт не удалось открыть.')
    } else {
      setDraft({
        id: recipe.id, title: recipe.title, category_id: recipe.category_id ?? '', summary: recipe.summary,
        description: recipe.description, servings: String(recipe.servings), prep_minutes: String(recipe.prep_minutes),
        cook_minutes: String(recipe.cook_minutes), image_url: recipe.image_url ?? '', youtube_url: recipe.youtube_url ?? '',
        is_published: recipe.is_published,
      })
      const loadedIngredients = (ingredientResult.data ?? []).map((item) => ({
        name: item.name,
        quantity: item.quantity == null ? '' : String(item.quantity),
        unit: item.unit && !/^\d+(?:[.,]\d+)?$/.test(item.unit.trim()) ? item.unit : '',
        note: item.note ?? '',
      }))
      setIngredients(loadedIngredients.length ? loadedIngredients : [{ name: '', quantity: '', unit: '', note: '' }])
      const loadedSteps = (stepResult.data ?? []).map((item) => item.instruction)
      setSteps(loadedSteps.length ? loadedSteps : [''])
      setNotice('Редактирование рецепта')
    }
    setBusy(false)
  }

  async function deleteRecipe(recipe: RecipeRow) {
    if (!supabase || busy) return
    const confirmed = window.confirm(`Удалить рецепт «${recipe.title}»? Его ингредиенты и шаги приготовления также будут удалены.`)
    if (!confirmed) return

    setBusy(true)
    setError('')
    setNotice('Удаляем рецепт…')
    const { error: deleteError } = await supabase.from('recipes').delete().eq('id', recipe.id)
    if (deleteError) {
      setError(`Рецепт не удалось удалить: ${deleteError.message}`)
      setBusy(false)
      return
    }

    setRecipes((current) => current.filter((item) => item.id !== recipe.id))
    if (draft.id === recipe.id) {
      setDraft({ ...emptyDraft, category_id: categories[0]?.id ?? '' })
      setIngredients([{ name: '', quantity: '', unit: '', note: '' }])
      setSteps([''])
    }
    setNotice('Рецепт удалён.')
    onRecipesChanged?.()
    setBusy(false)
  }

  function resetDraft() {
    setAdminView('recipes')
    setDraft({ ...emptyDraft, category_id: categories[0]?.id ?? '' })
    setIngredients([{ name: '', quantity: '', unit: '', note: '' }])
    setSteps([''])
    setNotice('Новый рецепт')
    setError('')
  }

  function startNewCategory() {
    setCategoryDraft({ ...emptyCategoryDraft, sort_order: String(categories.length + 1) })
    setNotice('Новая категория')
    setError('')
  }

  async function deleteCategory(category: CategoryRow) {
    if (!supabase || busy) return
    setBusy(true)
    setError('')
    setNotice('Проверяем связанные рецепты…')

    const { count, error: usageError } = await supabase
      .from('recipes')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', category.id)
    if (usageError) {
      setError(`Не удалось проверить рецепты категории «${category.title}»: ${usageError.message}`)
      setBusy(false)
      return
    }
    if ((count ?? 0) > 0) {
      setError(`Категорию «${category.title}» нельзя удалить: к ней привязаны рецепты (${count}). Сначала перенесите их в другую категорию.`)
      setBusy(false)
      return
    }
    if (!window.confirm(`Удалить пустую категорию «${category.title}»?`)) {
      setNotice('')
      setBusy(false)
      return
    }

    setNotice('Удаляем категорию…')
    const { error: deleteError } = await supabase.from('recipe_categories').delete().eq('id', category.id)
    if (deleteError) {
      setError(deleteError.message)
      setBusy(false)
      return
    }

    const nextCategories = categories.filter((item) => item.id !== category.id)
    setCategories(nextCategories)
    setDraft((current) => current.category_id === category.id
      ? { ...current, category_id: nextCategories[0]?.id ?? '' }
      : current)
    if (categoryDraft.id === category.id) {
      setCategoryDraft({ ...emptyCategoryDraft, sort_order: String(nextCategories.length + 1) })
    }
    setNotice('Категория удалена.')
    onRecipesChanged?.()
    setBusy(false)
  }

  async function saveCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!supabase || !categoryDraft.title.trim()) return
    const title = categoryDraft.title.trim()
    if (title.toLocaleLowerCase('ru') === ALL_RECIPES_LABEL.toLocaleLowerCase('ru')) {
      setError(`Название «${ALL_RECIPES_LABEL}» зарезервировано для общего фильтра.`)
      return
    }

    setBusy(true)
    setError('')
    setNotice('Сохраняем категорию…')
    const values = { title, sort_order: Math.max(0, Number(categoryDraft.sort_order) || 0) }
    const result = categoryDraft.id
      ? await supabase.from('recipe_categories').update(values).eq('id', categoryDraft.id).select('id,title,slug,sort_order').single()
      : await supabase.from('recipe_categories').insert({ ...values, slug: makeSlug(title) || `category-${Date.now()}` }).select('id,title,slug,sort_order').single()

    if (result.error || !result.data) {
      setError(result.error?.code === '23505'
        ? 'Категория с таким названием или адресом уже существует.'
        : result.error?.message ?? 'Категорию не удалось сохранить.')
      setBusy(false)
      return
    }

    const savedCategory = result.data as CategoryRow
    const nextCategories = [...categories.filter((item) => item.id !== savedCategory.id), savedCategory]
      .sort((left, right) => left.sort_order - right.sort_order || left.title.localeCompare(right.title, 'ru'))
    setCategories(nextCategories)
    setDraft((current) => ({ ...current, category_id: current.category_id || savedCategory.id }))
    setCategoryDraft({ ...emptyCategoryDraft, sort_order: String(nextCategories.length + 1) })
    setNotice(categoryDraft.id ? 'Категория обновлена.' : 'Категория создана.')
    onRecipesChanged?.()
    setBusy(false)
  }

  async function saveRecipe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!supabase || !draft.title.trim() || !draft.category_id) return
    setBusy(true)
    setError('')
    setNotice('Сохраняем…')
    const slug = makeSlug(draft.title) || `recipe-${Date.now()}`
    const payload = {
      category_id: draft.category_id,
      slug,
      title: draft.title.trim(),
      summary: draft.summary.trim(),
      description: draft.description.trim(),
      servings: Number(draft.servings) || 4,
      prep_minutes: Number(draft.prep_minutes) || 0,
      cook_minutes: Number(draft.cook_minutes) || 0,
      image_url: draft.image_url.trim() || null,
      youtube_url: draft.youtube_url.trim() || null,
      is_published: draft.is_published,
      published_at: draft.is_published ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    }

    let recipeId = draft.id
    if (recipeId) {
      const { error: updateError } = await supabase.from('recipes').update(payload).eq('id', recipeId)
      if (updateError) {
        setError(updateError.message)
        setBusy(false)
        return
      }
    } else {
      const { data, error: insertError } = await supabase.from('recipes').insert(payload).select('id').single()
      if (insertError || !data) {
        setError(insertError?.message ?? 'Рецепт не удалось создать.')
        setBusy(false)
        return
      }
      recipeId = data.id
    }

    const { error: clearIngredientsError } = await supabase.from('recipe_ingredients').delete().eq('recipe_id', recipeId)
    const cleanIngredients = ingredients.filter((item) => item.name.trim()).map((item, index) => ({
      recipe_id: recipeId,
      name: item.name.trim(),
      quantity: item.quantity.trim() ? Number(item.quantity.replace(',', '.')) : null,
      unit: item.unit.trim(),
      note: item.note.trim(),
      sort_order: index,
    }))
    const { error: ingredientsError } = cleanIngredients.length
      ? await supabase.from('recipe_ingredients').insert(cleanIngredients)
      : { error: null }
    const { error: clearStepsError } = await supabase.from('recipe_steps').delete().eq('recipe_id', recipeId)
    const cleanSteps = steps.filter((step) => step.trim()).map((instruction, index) => ({ recipe_id: recipeId, step_number: index + 1, instruction: instruction.trim() }))
    const { error: stepsError } = cleanSteps.length
      ? await supabase.from('recipe_steps').insert(cleanSteps)
      : { error: null }

    if (clearIngredientsError || ingredientsError || clearStepsError || stepsError) {
      setError(clearIngredientsError?.message ?? ingredientsError?.message ?? clearStepsError?.message ?? stepsError?.message ?? 'Rezeptdetails konnten nicht gespeichert werden.')
      setBusy(false)
      return
    }

    const { data: refreshed, error: refreshError } = await supabase.from('recipes').select('id,title,slug,category_id,summary,description,servings,prep_minutes,cook_minutes,image_url,youtube_url,is_published').order('created_at', { ascending: false })
    if (refreshError) setError(refreshError.message)
    else setRecipes((refreshed ?? []) as RecipeRow[])
    setDraft({ ...emptyDraft, category_id: categories[0]?.id ?? '' })
    setIngredients([{ name: '', quantity: '', unit: '', note: '' }])
    setSteps([''])
    setNotice(payload.is_published ? 'Рецепт опубликован.' : 'Черновик сохранён.')
    onRecipesChanged?.()
    setBusy(false)
  }

  return (
    <div className="admin-overlay" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className={`admin-panel ${loginView ? 'admin-panel-login' : ''}`} role="dialog" aria-modal="true" aria-label={loginView ? 'Вход администратора' : 'Панель администратора'}>
        {!loginView && <div className="admin-heading">
          <div><p className="eyebrow small">КУЛИНАРНАЯ БИБЛИОТЕКА</p><h2>Панель администратора</h2></div>
        </div>}
        {!supabase && <p className="admin-error">{error}</p>}
        {supabase && !checking && !adminEmail && <p className="admin-error">{error}</p>}
        {supabase && checking && <p className="admin-muted">Проверяем доступ…</p>}
        {supabase && !checking && adminEmail && !user && <form className="admin-login" onSubmit={signIn}>
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" aria-label="Пароль администратора" placeholder="Пароль" required />
          {error && <p className="admin-error" role="alert">{error}</p>}
          <button className="admin-primary" disabled={busy}>{busy ? 'Входим…' : 'Войти'}</button>
        </form>}
        {supabase && !checking && user && !isAdmin && <div className="admin-login"><p>Этот пользователь не имеет прав администратора.</p>{error && <p className="admin-error" role="alert">{error}</p>}<button className="admin-secondary" onClick={signOut}>Выйти</button></div>}
        {supabase && !checking && isAdmin && <>
          <div className="admin-toolbar"><span>Управление библиотекой</span><div className="admin-toolbar-actions"><button className={`admin-secondary${adminView === 'recipes' ? ' is-selected' : ''}`} onClick={() => setAdminView('recipes')}>Рецепты</button><button className={`admin-secondary${adminView === 'categories' ? ' is-selected' : ''}`} onClick={() => setAdminView('categories')}>Категории</button>{adminView === 'recipes' && <button className="admin-secondary" onClick={resetDraft}>Новый рецепт</button>}<button className="admin-secondary" onClick={signOut}>Выйти</button></div></div>
          {adminView === 'recipes' ? <div className="admin-content">
            <aside className="admin-recipe-list"><h3>Рецепты ({recipes.length})</h3>{recipes.length === 0 && <p className="admin-muted">Пока рецептов нет.</p>}{recipes.map((recipe) => <div className="admin-recipe-row" key={recipe.id}><button onClick={() => void editRecipe(recipe)} disabled={busy}><strong>{recipe.title}</strong><small>{recipe.is_published ? 'Опубликован' : 'Черновик'}</small></button><button type="button" className="admin-delete admin-category-delete" aria-label={`Удалить рецепт ${recipe.title}`} title="Удалить рецепт" onClick={() => void deleteRecipe(recipe)} disabled={busy}><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16M10 11v6m4-6v6M6 7l1 14h10l1-14M9 7V4h6v3" /></svg></button></div>)}</aside>
            <form className="recipe-form" onSubmit={saveRecipe}>
              <h3>{draft.id ? 'Редактировать рецепт' : 'Новый рецепт'}</h3>
              <label>Название<input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} required /></label>
              <label>Категория<select value={draft.category_id} onChange={(event) => setDraft({ ...draft, category_id: event.target.value })} required><option value="" disabled>Выберите категорию</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
              <label>Краткое описание<input value={draft.summary} onChange={(event) => setDraft({ ...draft, summary: event.target.value })} /></label>
              <label>Описание<textarea rows={3} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} /></label>
              <div className="admin-field-grid"><label>Порции<input type="number" min="0.5" step="0.5" value={draft.servings} onChange={(event) => setDraft({ ...draft, servings: event.target.value })} /></label><label>Подготовка, мин<input type="number" min="0" value={draft.prep_minutes} onChange={(event) => setDraft({ ...draft, prep_minutes: event.target.value })} /></label><label>Готовка, мин<input type="number" min="0" value={draft.cook_minutes} onChange={(event) => setDraft({ ...draft, cook_minutes: event.target.value })} /></label></div>
              <label>Ссылка на фото<input type="url" value={draft.image_url} onChange={(event) => setDraft({ ...draft, image_url: event.target.value })} placeholder="https://…" /></label>
              <label>YouTube<input type="url" value={draft.youtube_url} onChange={(event) => setDraft({ ...draft, youtube_url: event.target.value })} placeholder="https://youtube.com/…" /></label>
              <fieldset className="admin-rows"><legend>Ингредиенты</legend>{ingredients.map((item, index) => <div className="ingredient-row" key={index}><input aria-label="Название ингредиента" placeholder="Продукт" value={item.name} onChange={(event) => setIngredients((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, name: event.target.value } : row))} /><input type="number" min="0" step="0.001" aria-label="Количество" placeholder="Кол-во" value={item.quantity} onChange={(event) => setIngredients((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, quantity: event.target.value } : row))} /><input aria-label="Единица измерения, например г, мл или шт." placeholder="г / мл / шт." value={item.unit} onChange={(event) => setIngredients((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, unit: event.target.value } : row))} /><input aria-label="Примечание к ингредиенту" placeholder="Примечание" value={item.note} onChange={(event) => setIngredients((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, note: event.target.value } : row))} /><button type="button" className="admin-delete" aria-label="Убрать ингредиент" onClick={() => setIngredients((current) => current.length > 1 ? current.filter((_, rowIndex) => rowIndex !== index) : [{ name: '', quantity: '', unit: '', note: '' }])}>×</button></div>)}<button type="button" className="admin-add-row" onClick={() => setIngredients((current) => [...current, { name: '', quantity: '', unit: '', note: '' }])}>+ Добавить ингредиент</button></fieldset>
              <fieldset className="admin-rows"><legend>Шаги приготовления</legend>{steps.map((step, index) => <div className="step-row" key={index}><span>{index + 1}</span><textarea aria-label={`Шаг ${index + 1}`} rows={2} value={step} onChange={(event) => setSteps((current) => current.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} /><button type="button" className="admin-delete" aria-label="Убрать шаг" onClick={() => setSteps((current) => current.length > 1 ? current.filter((_, itemIndex) => itemIndex !== index) : [''])}>×</button></div>)}<button type="button" className="admin-add-row" onClick={() => setSteps((current) => [...current, ''])}>+ Добавить шаг</button></fieldset>
              <label className="admin-publish"><input type="checkbox" checked={draft.is_published} onChange={(event) => setDraft({ ...draft, is_published: event.target.checked })} /> Опубликовать рецепт</label>
              {error && <p className="admin-error" role="alert">{error}</p>}{notice && !error && <p className="admin-notice" role="status">{notice}</p>}
              <button className="admin-primary" disabled={busy || !draft.title.trim() || !draft.category_id}>{busy ? 'Сохраняем…' : 'Сохранить рецепт'}</button>
            </form>
          </div> : <div className="admin-content category-admin-content">
            <aside className="admin-recipe-list"><h3>Категории ({categories.length})</h3><button type="button" className="admin-add-row" onClick={startNewCategory}>+ Новая категория</button>{categories.map((item) => {
              const recipeCount = recipes.filter((recipe) => recipe.category_id === item.id).length
              return <div className="admin-recipe-row category-row" key={item.id}>
                <button type="button" onClick={() => { setCategoryDraft({ id: item.id, title: item.title, sort_order: String(item.sort_order) }); setNotice('Редактирование категории'); setError('') }} disabled={busy}><strong>{item.title}</strong><small>{recipeCount ? `Рецептов: ${recipeCount}` : 'Нет рецептов'} · Порядок на полке: {item.sort_order}</small></button>
                <button type="button" className="admin-delete admin-category-delete" aria-label={`Удалить категорию ${item.title}`} title={recipeCount ? 'Сначала перенесите её рецепты в другую категорию' : 'Удалить категорию'} onClick={() => void deleteCategory(item)} disabled={busy}><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16M10 11v6m4-6v6M6 7l1 14h10l1-14M9 7V4h6v3" /></svg></button>
              </div>
            })}</aside>
            <form className="recipe-form category-form" onSubmit={saveCategory}>
              <h3>{categoryDraft.id ? 'Редактировать категорию' : 'Новая категория'}</h3>
              <p className="admin-muted">Название появится в фильтрах, на полке и в карточках рецептов. Удалять можно только категории без привязанных рецептов.</p>
              <label>Название категории<input value={categoryDraft.title} onChange={(event) => setCategoryDraft((current) => ({ ...current, title: event.target.value }))} required maxLength={80} placeholder="Например: Домашние напитки" /></label>
              <label>Порядок на полке<input type="number" min="0" step="1" value={categoryDraft.sort_order} onChange={(event) => setCategoryDraft((current) => ({ ...current, sort_order: event.target.value }))} /></label>
              {error && <p className="admin-error" role="alert">{error}</p>}{notice && !error && <p className="admin-notice" role="status">{notice}</p>}
              <div className="category-form-actions"><button className="admin-primary" disabled={busy || !categoryDraft.title.trim()}>{busy ? 'Сохраняем…' : 'Сохранить категорию'}</button>{categoryDraft.id && <button type="button" className="admin-secondary" onClick={startNewCategory} disabled={busy}>Отмена</button>}</div>
            </form>
          </div>}
        </>}
      </section>
    </div>
  )
}
