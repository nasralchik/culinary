export type RecipeCategory = 'Первые блюда' | 'Выпечка' | 'Основные блюда' | 'Десерты' | 'Заготовки'

export interface RecipeBook {
  id: string
  title: string
  subtitle: string
  category: RecipeCategory
  color: string
  accent: string
  recipes: number
  featured?: boolean
}
