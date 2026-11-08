import { supabase } from '../lib/supabase'
import type { RecipeCategory } from '../types/recipe'

export interface PublicRecipe {
  id: string
  title: string
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
}

export interface RecipeStep {
  id: string
  step_number: number
  instruction: string
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

export async function getPublishedRecipes(category: RecipeCategory): Promise<PublicRecipe[]> {
  if (!supabase) return []

  const { data: categoryRow, error: categoryError } = await supabase
    .from('recipe_categories')
    .select('id')
    .eq('title', category)
    .maybeSingle()
  if (categoryError) throw categoryError
  if (!categoryRow) return []

  const { data, error } = await supabase
    .from('recipes')
    .select('id,title,summary,description,servings,prep_minutes,cook_minutes,image_url,youtube_url')
    .eq('category_id', categoryRow.id)
    .eq('is_published', true)
    .order('published_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as PublicRecipe[]
}

export async function getRecipeDetails(recipeId: string): Promise<{ ingredients: RecipeIngredient[]; steps: RecipeStep[] }> {
  if (!supabase) return { ingredients: [], steps: [] }

  const [ingredientResult, stepResult] = await Promise.all([
    supabase.from('recipe_ingredients').select('id,name,quantity,unit,note').eq('recipe_id', recipeId).order('sort_order'),
    supabase.from('recipe_steps').select('id,step_number,instruction').eq('recipe_id', recipeId).order('step_number'),
  ])
  if (ingredientResult.error) throw ingredientResult.error
  if (stepResult.error) throw stepResult.error
  return {
    ingredients: (ingredientResult.data ?? []) as RecipeIngredient[],
    steps: (stepResult.data ?? []) as RecipeStep[],
  }
}
