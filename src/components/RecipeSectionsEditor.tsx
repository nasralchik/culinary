import type { Dispatch, SetStateAction } from 'react'

export interface IngredientDraft {
  name: string
  quantity: string
  unit: string
  note: string
  alternative_name: string
  alternative_quantity: string
  alternative_unit: string
  alternative_open: boolean
}

export interface RecipeSectionDraft {
  key: string
  id?: string
  title: string
  stepListStyle: 'numbered' | 'bulleted'
  ingredients: IngredientDraft[]
  steps: string[]
}

export const emptyIngredientDraft: IngredientDraft = {
  name: '', quantity: '', unit: '', note: '',
  alternative_name: '', alternative_quantity: '', alternative_unit: '', alternative_open: false,
}

export function makeEmptyRecipeSection(title = ''): RecipeSectionDraft {
  return {
    key: `section-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    title,
    stepListStyle: 'numbered',
    ingredients: [{ ...emptyIngredientDraft }],
    steps: [''],
  }
}

const ingredientUnits = [
  'г', 'кг', 'мл', 'л', 'ч. л.', 'ст. л.', 'шт.', 'стакан', 'чашка',
  'щепотка', 'зубчик', 'пучок', 'ломтик', 'головка', 'упаковка', 'банка', 'по вкусу',
]

interface RecipeSectionsEditorProps {
  sections: RecipeSectionDraft[]
  setSections: Dispatch<SetStateAction<RecipeSectionDraft[]>>
}

export function RecipeSectionsEditor({ sections, setSections }: RecipeSectionsEditorProps) {
  function updateSection(sectionIndex: number, update: (section: RecipeSectionDraft) => RecipeSectionDraft) {
    setSections((current) => current.map((section, index) => index === sectionIndex ? update(section) : section))
  }

  function updateIngredient(sectionIndex: number, ingredientIndex: number, update: (ingredient: IngredientDraft) => IngredientDraft) {
    updateSection(sectionIndex, (section) => ({
      ...section,
      ingredients: section.ingredients.map((ingredient, index) => index === ingredientIndex ? update(ingredient) : ingredient),
    }))
  }

  return <>
    {sections.map((section, sectionIndex) => <fieldset className="admin-rows admin-recipe-section" key={section.key}>
      <legend>{section.title.trim() || `Раздел ${sectionIndex + 1}`}</legend>
      <div className="recipe-section-title-row">
        <label>Название раздела<input value={section.title} onChange={(event) => updateSection(sectionIndex, (current) => ({ ...current, title: event.target.value }))} placeholder="Например: Тесто или Начинка" maxLength={80} /></label>
        <button type="button" className="admin-delete" aria-label={`Удалить раздел ${section.title || sectionIndex + 1}`} title="Удалить раздел" disabled={sections.length === 1} onClick={() => setSections((current) => current.length > 1 ? current.filter((_, index) => index !== sectionIndex) : [makeEmptyRecipeSection()])}>×</button>
      </div>
      <fieldset className="admin-rows recipe-section-rows"><legend>Ингредиенты раздела</legend>
        {section.ingredients.map((item, ingredientIndex) => {
          const alternativeId = `ingredient-alternative-${section.key}-${ingredientIndex}`
          return <div className="ingredient-editor" key={`${section.key}-ingredient-${ingredientIndex}`}>
            <div className="ingredient-row">
              <input aria-label="Название ингредиента" placeholder="Продукт" value={item.name} onChange={(event) => updateIngredient(sectionIndex, ingredientIndex, (current) => ({ ...current, name: event.target.value }))} />
              <input type="number" min="0" step="0.001" aria-label="Количество" placeholder="Кол-во" value={item.quantity} onChange={(event) => updateIngredient(sectionIndex, ingredientIndex, (current) => ({ ...current, quantity: event.target.value }))} />
              <select aria-label="Единица измерения" value={item.unit} onChange={(event) => updateIngredient(sectionIndex, ingredientIndex, (current) => ({ ...current, unit: event.target.value }))}>
                <option value="">Ед. изм.</option>
                {item.unit && !ingredientUnits.includes(item.unit) && <option value={item.unit}>{item.unit}</option>}
                {ingredientUnits.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
              </select>
              <input aria-label="Примечание к ингредиенту" placeholder="Примечание (например, Тип 405)" value={item.note} onChange={(event) => updateIngredient(sectionIndex, ingredientIndex, (current) => ({ ...current, note: event.target.value }))} />
              <button type="button" className="admin-delete" aria-label="Убрать ингредиент" onClick={() => updateSection(sectionIndex, (current) => ({ ...current, ingredients: current.ingredients.length > 1 ? current.ingredients.filter((_, index) => index !== ingredientIndex) : [{ ...emptyIngredientDraft }] }))}>×</button>
            </div>
            {item.alternative_open ? <div className="ingredient-alternative" id={alternativeId}>
              <p>Замена · количество будет пересчитано вместе с рецептом</p>
              <div className="ingredient-alternative-row">
                <input aria-label="Название заменяющего ингредиента" placeholder="Например, сода" value={item.alternative_name} onChange={(event) => updateIngredient(sectionIndex, ingredientIndex, (current) => ({ ...current, alternative_name: event.target.value }))} />
                <input type="number" min="0" step="0.01" aria-label="Количество заменяющего ингредиента" placeholder="Кол-во" value={item.alternative_quantity} onChange={(event) => updateIngredient(sectionIndex, ingredientIndex, (current) => ({ ...current, alternative_quantity: event.target.value }))} />
                <select aria-label="Единица измерения замены" value={item.alternative_unit} onChange={(event) => updateIngredient(sectionIndex, ingredientIndex, (current) => ({ ...current, alternative_unit: event.target.value }))}>
                  <option value="">Ед. изм.</option>
                  {item.alternative_unit && !ingredientUnits.includes(item.alternative_unit) && <option value={item.alternative_unit}>{item.alternative_unit}</option>}
                  {ingredientUnits.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
                </select>
                <button type="button" className="admin-delete" aria-label="Убрать замену" onClick={() => updateIngredient(sectionIndex, ingredientIndex, (current) => ({ ...current, alternative_name: '', alternative_quantity: '', alternative_unit: '', alternative_open: false }))}>×</button>
              </div>
            </div> : <button type="button" className="ingredient-alternative-toggle" aria-expanded={false} aria-controls={alternativeId} onClick={() => updateIngredient(sectionIndex, ingredientIndex, (current) => ({ ...current, alternative_open: true }))}><span aria-hidden="true">＋</span> Добавить замену для пересчёта</button>}
          </div>
        })}
        <button type="button" className="admin-add-row" onClick={() => updateSection(sectionIndex, (current) => ({ ...current, ingredients: [...current.ingredients, { ...emptyIngredientDraft }] }))}>+ Добавить ингредиент</button>
      </fieldset>
      <fieldset className="admin-rows recipe-section-rows"><legend>Шаги приготовления</legend>
        <label className="step-list-style">Формат списка
          <select value={section.stepListStyle} onChange={(event) => updateSection(sectionIndex, (current) => ({ ...current, stepListStyle: event.target.value as RecipeSectionDraft['stepListStyle'] }))}>
            <option value="numbered">Нумерованный список</option>
            <option value="bulleted">Список с маркерами</option>
          </select>
        </label>
        {section.steps.map((step, stepIndex) => <div className="step-row" key={`${section.key}-step-${stepIndex}`}>
          <span aria-hidden="true">{section.stepListStyle === 'bulleted' ? '•' : stepIndex + 1}</span>
          <textarea aria-label={`Шаг ${stepIndex + 1} раздела ${section.title || sectionIndex + 1}`} rows={2} value={step} onChange={(event) => updateSection(sectionIndex, (current) => ({ ...current, steps: current.steps.map((currentStep, index) => index === stepIndex ? event.target.value : currentStep) }))} />
          <button type="button" className="admin-delete" aria-label="Убрать шаг" onClick={() => updateSection(sectionIndex, (current) => ({ ...current, steps: current.steps.length > 1 ? current.steps.filter((_, index) => index !== stepIndex) : [''] }))}>×</button>
        </div>)}
        <button type="button" className="admin-add-row" onClick={() => updateSection(sectionIndex, (current) => ({ ...current, steps: [...current.steps, ''] }))}>+ Добавить шаг</button>
      </fieldset>
    </fieldset>)}
    <button type="button" className="admin-add-row admin-add-section" onClick={() => setSections((current) => [...current, makeEmptyRecipeSection()])}>+ Добавить раздел</button>
  </>
}
