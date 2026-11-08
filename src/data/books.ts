import type { RecipeBook } from '../types/recipe'

export const categories = ['Все книги', 'Первые блюда', 'Выпечка', 'Основные блюда', 'Десерты', 'Заготовки'] as const

export const books: RecipeBook[] = [
  { id: 'soups', title: 'Супы русской усадьбы', subtitle: 'Душистые и наваристые', category: 'Первые блюда', color: '#405b43', accent: '#d7b66a', recipes: 24, featured: true },
  { id: 'pies', title: 'Пироги и караваи', subtitle: 'Из печи — к столу', category: 'Выпечка', color: '#9a4939', accent: '#e4c984', recipes: 18 },
  { id: 'forest', title: 'Дары леса', subtitle: 'Грибы, ягоды, травы', category: 'Заготовки', color: '#31595a', accent: '#d9bd78', recipes: 31 },
  { id: 'feast', title: 'Праздничный стол', subtitle: 'Блюда для гостей', category: 'Основные блюда', color: '#665044', accent: '#ddc78c', recipes: 16 },
  { id: 'sweets', title: 'Сладости к чаю', subtitle: 'Мёд, орехи и ягоды', category: 'Десерты', color: '#8b6940', accent: '#f0d99b', recipes: 22 },
  { id: 'porridge', title: 'Каши да кулебяки', subtitle: 'Сытная старина', category: 'Основные блюда', color: '#72513e', accent: '#dfbe70', recipes: 14 },
  { id: 'garden', title: 'Огородные припасы', subtitle: 'Соленья и маринады', category: 'Заготовки', color: '#566047', accent: '#d9c278', recipes: 27 },
  { id: 'tea', title: 'Самоварные истории', subtitle: 'Варенье и напитки', category: 'Десерты', color: '#78404a', accent: '#e0c480', recipes: 19 },
  { id: 'fish', title: 'Рыбные сказания', subtitle: 'Реки и озёра', category: 'Основные блюда', color: '#3c5360', accent: '#d9be7d', recipes: 12 },
  { id: 'bread', title: 'Хлебный дом', subtitle: 'Закваски и хлеба', category: 'Выпечка', color: '#915b32', accent: '#ebd49b', recipes: 11 },
  { id: 'fasting', title: 'Постная трапеза', subtitle: 'Щедрость простых даров', category: 'Первые блюда', color: '#4a604c', accent: '#d0b36c', recipes: 20 },
  { id: 'dessert', title: 'Из погреба с любовью', subtitle: 'Домашние заготовки', category: 'Заготовки', color: '#6a4858', accent: '#e2cb8d', recipes: 15 },
]
