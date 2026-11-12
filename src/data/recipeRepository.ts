import { supabase } from '../lib/supabase'
import type { RecipeCategory } from '../types/recipe'

export interface PublicRecipe {
  id: string
  title: string
  category: RecipeCategory
  summary: string
  description: string
  servings: number
  prep_minutes: number
  cook_minutes: number
  image_url: string | null
  youtube_url: string | null
}

export interface RecipeIngredient {
  id: string
  name: string
  quantity: number | null
  unit: string
  note: string
  alternative_name: string
  alternative_quantity: number | null
  alternative_unit: string
}

export interface RecipeStep {
  id: string
  step_number: number
  instruction: string
}

export interface RecipeSection {
  id: string
  title: string
  sort_order: number
  ingredients: RecipeIngredient[]
  steps: RecipeStep[]
}

export async function getPublishedRecipeCount(): Promise<number | null> {
  if (!supabase) return null

  const { count, error } = await supabase
    .from('recipes')
    .select('id', { count: 'exact', head: true })
    .eq('is_published', true)

  if (error) throw error
  return count ?? 0
}

export async function getPublishedLibrary(): Promise<{ categories: string[]; recipes: PublicRecipe[] }> {
  if (!supabase) return { categories: [], recipes: [] }

  const [categoryResult, recipeResult] = await Promise.all([
    supabase.from('recipe_categories').select('id,title').order('sort_order'),
    supabase.from('recipes')
      .select('id,title,category_id,summary,description,servings,prep_minutes,cook_minutes,image_url,youtube_url')
      .eq('is_published', true)
      .order('published_at', { ascending: false }),
  ])
  if (categoryResult.error) throw categoryResult.error
  if (recipeResult.error) throw recipeResult.error

  const categoryRows = categoryResult.data ?? []
  const categoryById = new Map(categoryRows.map((category) => [category.id, category.title as RecipeCategory]))
  const recipes = (recipeResult.data ?? []).flatMap((recipe) => {
    const category = recipe.category_id ? categoryById.get(recipe.category_id) : undefined
    return category ? [{ ...recipe, category } as PublicRecipe] : []
  })
  return { categories: categoryRows.map((category) => category.title as string), recipes }
}

export async function getRecipeDetails(recipeId: string): Promise<{ sections: RecipeSection[] }> {
  if (!supabase) return { sections: [] }

  const [sectionResult, ingredientResult, stepResult] = await Promise.all([
    supabase.from('recipe_sections').select('id,title,sort_order').eq('recipe_id', recipeId).order('sort_order'),
    supabase.from('recipe_ingredients').select('id,section_id,name,quantity,unit,note,alternative_name,alternative_quantity,alternative_unit,sort_order').eq('recipe_id', recipeId).order('sort_order'),
    supabase.from('recipe_steps').select('id,section_id,step_number,instruction').eq('recipe_id', recipeId).order('step_number'),
  ])
  if (sectionResult.error) throw sectionResult.error
  if (ingredientResult.error) throw ingredientResult.error
  if (stepResult.error) throw stepResult.error

  const sections: RecipeSection[] = (sectionResult.data ?? []).map((section) => ({
    id: section.id,
    title: section.title ?? '',
    sort_order: section.sort_order,
    ingredients: [],
    steps: [],
  }))
  const sectionById = new Map(sections.map((section) => [section.id, section]))
  for (const ingredient of ingredientResult.data ?? []) {
    sectionById.get(ingredient.section_id)?.ingredients.push(ingredient as RecipeIngredient)
  }
  for (const step of stepResult.data ?? []) {
    sectionById.get(step.section_id)?.steps.push(step as RecipeStep)
  }
  return { sections }
}
