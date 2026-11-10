export type RecipeCategory = string

export interface RecipeBook {
  id: string
  title: string
  subtitle: string
  category: RecipeCategory
  color: string
  accent: string
  featured?: boolean
  art?: string
  artImage?: string
}
