import { useEffect, useState, type FormEvent } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { RecipeCategory } from '../types/recipe'

interface CategoryRow {
  id: string
  title: RecipeCategory
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

const transliteration: Record<string, string> = {
  а:'a', б:'b', в:'v', г:'g', д:'d', е:'e', ё:'yo', ж:'zh', з:'z', и:'i', й:'y', к:'k', л:'l', м:'m', н:'n', о:'o', п:'p', р:'r', с:'s', т:'t', у:'u', ф:'f', х:'kh', ц:'ts', ч:'ch', ш:'sh', щ:'shch', ы:'y', э:'e', ю:'yu', я:'ya', ъ:'', ь:'',
}

function makeSlug(title: string) {
  const latin = [...title.toLocaleLowerCase('ru')].map((letter) => transliteration[letter] ?? letter).join('')
  return latin.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export function AdminPanel({ onClose }: { onClose: () => void }) {
  const [user, setUser] = useState<User | null>(null)
  const [checking, setChecking] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [categories, setCategories] = useState<CategoryRow[]>([])
  const [recipes, setRecipes] = useState<RecipeRow[]>([])
  const [draft, setDraft] = useState<RecipeDraft>(emptyDraft)
  const [ingredients, setIngredients] = useState<IngredientDraft[]>([{ name: '', quantity: '', unit: '', note: '' }])
  const [steps, setSteps] = useState<string[]>([''])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

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
        supabase.from('recipe_categories').select('id,title').order('sort_order'),
        supabase.from('recipes').select('id,title,slug,category_id,summary,description,servings,prep_minutes,cook_minutes,image_url,youtube_url,is_published').order('created_at', { ascending: false }),
      ])
      if (categoryResult.error || recipeResult.error) {
        setError(categoryResult.error?.message ?? recipeResult.error?.message ?? 'Не удалось загрузить рецепты.')
      } else {
        const categoryRows = (categoryResult.data ?? []) as CategoryRow[]
        setCategories(categoryRows)
        setRecipes((recipeResult.data ?? []) as RecipeRow[])
        setDraft((current) => ({ ...current, category_id: current.category_id || categoryRows[0]?.id || '' }))
      }
    }
    setChecking(false)
  }

  useEffect(() => {
    let active = true
    if (!supabase) {
      setChecking(false)
      setError('Supabase не настроен. Проверьте переменные VITE_SUPABASE_URL и VITE_SUPABASE_PUBLISHABLE_KEY в Render.')
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
    if (!supabase) return
    setBusy(true)
    setError('')
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError || !data.user) {
      setError(signInError?.message ?? 'Вход не выполнен.')
    } else {
      await loadAdminData(data.user)
    }
    setBusy(false)
  }

  async function signOut() {
    if (supabase) await supabase.auth.signOut()
    setUser(null)
    setIsAdmin(false)
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
      const loadedIngredients = (ingredientResult.data ?? []).map((item) => ({ name: item.name, quantity: item.quantity == null ? '' : String(item.quantity), unit: item.unit ?? '', note: item.note ?? '' }))
      setIngredients(loadedIngredients.length ? loadedIngredients : [{ name: '', quantity: '', unit: '', note: '' }])
      const loadedSteps = (stepResult.data ?? []).map((item) => item.instruction)
      setSteps(loadedSteps.length ? loadedSteps : [''])
      setNotice('Редактирование рецепта')
    }
    setBusy(false)
  }

  function resetDraft() {
    setDraft({ ...emptyDraft, category_id: categories[0]?.id ?? '' })
    setIngredients([{ name: '', quantity: '', unit: '', note: '' }])
    setSteps([''])
    setNotice('Новый рецепт')
    setError('')
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
    setBusy(false)
  }

  return (
    <div className="admin-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="admin-panel" role="dialog" aria-modal="true" aria-labelledby="admin-title">
        <div className="admin-heading">
          <div><p className="eyebrow small">КУЛИНАРНАЯ БИБЛИОТЕКА</p><h2 id="admin-title">Панель администратора</h2></div>
          <button className="dialog-close" onClick={onClose} aria-label="Закрыть">×</button>
        </div>
        {!supabase && <p className="admin-error">{error}</p>}
        {supabase && checking && <p className="admin-muted">Проверяем доступ…</p>}
        {supabase && !checking && !user && <form className="admin-login" onSubmit={signIn}>
          <p>Войдите, чтобы добавлять и редактировать рецепты.</p>
          <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" required /></label>
          <label>Пароль<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required /></label>
          {error && <p className="admin-error" role="alert">{error}</p>}
          <button className="admin-primary" disabled={busy}>{busy ? 'Входим…' : 'Войти'}</button>
        </form>}
        {supabase && !checking && user && !isAdmin && <div className="admin-login"><p>Этот пользователь не имеет прав администратора.</p>{error && <p className="admin-error" role="alert">{error}</p>}<button className="admin-secondary" onClick={signOut}>Выйти</button></div>}
        {supabase && !checking && isAdmin && <>
          <div className="admin-toolbar"><span>{user?.email}</span><div><button className="admin-secondary" onClick={resetDraft}>Новый рецепт</button><button className="admin-secondary" onClick={signOut}>Выйти</button></div></div>
          <div className="admin-content">
            <aside className="admin-recipe-list"><h3>Рецепты ({recipes.length})</h3>{recipes.length === 0 && <p className="admin-muted">Пока рецептов нет.</p>}{recipes.map((recipe) => <div className="admin-recipe-row" key={recipe.id}><button onClick={() => void editRecipe(recipe)} disabled={busy}><strong>{recipe.title}</strong><small>{recipe.is_published ? 'Опубликован' : 'Черновик'}</small></button></div>)}</aside>
            <form className="recipe-form" onSubmit={saveRecipe}>
              <h3>{draft.id ? 'Редактировать рецепт' : 'Новый рецепт'}</h3>
              <label>Название<input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} required /></label>
              <label>Категория<select value={draft.category_id} onChange={(event) => setDraft({ ...draft, category_id: event.target.value })} required><option value="" disabled>Выберите категорию</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
              <label>Краткое описание<input value={draft.summary} onChange={(event) => setDraft({ ...draft, summary: event.target.value })} /></label>
              <label>Описание<textarea rows={3} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} /></label>
              <div className="admin-field-grid"><label>Порции<input type="number" min="0.5" step="0.5" value={draft.servings} onChange={(event) => setDraft({ ...draft, servings: event.target.value })} /></label><label>Подготовка, мин<input type="number" min="0" value={draft.prep_minutes} onChange={(event) => setDraft({ ...draft, prep_minutes: event.target.value })} /></label><label>Готовка, мин<input type="number" min="0" value={draft.cook_minutes} onChange={(event) => setDraft({ ...draft, cook_minutes: event.target.value })} /></label></div>
              <label>Ссылка на фото<input type="url" value={draft.image_url} onChange={(event) => setDraft({ ...draft, image_url: event.target.value })} placeholder="https://…" /></label>
              <label>YouTube<input type="url" value={draft.youtube_url} onChange={(event) => setDraft({ ...draft, youtube_url: event.target.value })} placeholder="https://youtube.com/…" /></label>
              <fieldset className="admin-rows"><legend>Ингредиенты</legend>{ingredients.map((item, index) => <div className="ingredient-row" key={index}><input aria-label="Название ингредиента" placeholder="Продукт" value={item.name} onChange={(event) => setIngredients((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, name: event.target.value } : row))} /><input type="number" min="0" step="0.001" aria-label="Количество" placeholder="Кол-во" value={item.quantity} onChange={(event) => setIngredients((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, quantity: event.target.value } : row))} /><input aria-label="Единица измерения" placeholder="Ед." value={item.unit} onChange={(event) => setIngredients((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, unit: event.target.value } : row))} /><input aria-label="Примечание к ингредиенту" placeholder="Примечание" value={item.note} onChange={(event) => setIngredients((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, note: event.target.value } : row))} /><button type="button" className="admin-delete" aria-label="Убрать ингредиент" onClick={() => setIngredients((current) => current.length > 1 ? current.filter((_, rowIndex) => rowIndex !== index) : [{ name: '', quantity: '', unit: '', note: '' }])}>×</button></div>)}<button type="button" className="admin-add-row" onClick={() => setIngredients((current) => [...current, { name: '', quantity: '', unit: '', note: '' }])}>+ Добавить ингредиент</button></fieldset>
              <fieldset className="admin-rows"><legend>Шаги приготовления</legend>{steps.map((step, index) => <div className="step-row" key={index}><span>{index + 1}</span><textarea aria-label={`Шаг ${index + 1}`} rows={2} value={step} onChange={(event) => setSteps((current) => current.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} /><button type="button" className="admin-delete" aria-label="Убрать шаг" onClick={() => setSteps((current) => current.length > 1 ? current.filter((_, itemIndex) => itemIndex !== index) : [''])}>×</button></div>)}<button type="button" className="admin-add-row" onClick={() => setSteps((current) => [...current, ''])}>+ Добавить шаг</button></fieldset>
              <label className="admin-publish"><input type="checkbox" checked={draft.is_published} onChange={(event) => setDraft({ ...draft, is_published: event.target.checked })} /> Опубликовать рецепт</label>
              {error && <p className="admin-error" role="alert">{error}</p>}{notice && !error && <p className="admin-notice" role="status">{notice}</p>}
              <button className="admin-primary" disabled={busy || !draft.title.trim() || !draft.category_id}>{busy ? 'Сохраняем…' : 'Сохранить рецепт'}</button>
            </form>
          </div>
        </>}
      </section>
    </div>
  )
}
