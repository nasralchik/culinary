import { supabase } from '../lib/supabase'

export async function getPublishedRecipeCount(): Promise<number | null> {
  if (!supabase) return null

  const { count, error } = await supabase
    .from('recipes')
    .select('id', { count: 'exact', head: true })
    .eq('is_published', true)

  if (error) throw error
  return count ?? 0
}
