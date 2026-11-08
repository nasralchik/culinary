import type { RecipeBook } from '../types/recipe'

export const categories = ['Все рецепты', 'Первые блюда', 'Выпечка', 'Основные блюда', 'Десерты', 'Заготовки'] as const

export const books: RecipeBook[] = [
  { id: 'soups', title: 'Супы русской усадьбы', subtitle: 'Душистые и наваристые', category: 'Первые блюда', color: '#405b43', accent: '#d7b66a', featured: true },
  { id: 'pies', title: 'Пироги и караваи', subtitle: 'Из печи — к столу', category: 'Выпечка', color: '#9a4939', accent: '#e4c984' },
  { id: 'forest', title: 'Дары леса', subtitle: 'Грибы, ягоды, травы', category: 'Заготовки', color: '#31595a', accent: '#d9bd78' },
  { id: 'feast', title: 'Праздничный стол', subtitle: 'Блюда для гостей', category: 'Основные блюда', color: '#665044', accent: '#ddc78c' },
  { id: 'sweets', title: 'Сладости к чаю', subtitle: 'Мёд, орехи и ягоды', category: 'Десерты', color: '#8b6940', accent: '#f0d99b' },
  { id: 'porridge', title: 'Каши да кулебяки', subtitle: 'Сытная старина', category: 'Основные блюда', color: '#72513e', accent: '#dfbe70' },
  { id: 'garden', title: 'Огородные припасы', subtitle: 'Соленья и маринады', category: 'Заготовки', color: '#566047', accent: '#d9c278' },
  { id: 'tea', title: 'Самоварные истории', subtitle: 'Варенье и напитки', category: 'Десерты', color: '#78404a', accent: '#e0c480' },
  { id: 'fish', title: 'Рыбные сказания', subtitle: 'Реки и озёра', category: 'Основные блюда', color: '#3c5360', accent: '#d9be7d' },
  { id: 'bread', title: 'Хлебный дом', subtitle: 'Закваски и хлеба', category: 'Выпечка', color: '#915b32', accent: '#ebd49b' },
  { id: 'fasting', title: 'Постная трапеза', subtitle: 'Щедрость простых даров', category: 'Первые блюда', color: '#4a604c', accent: '#d0b36c' },
  { id: 'dessert', title: 'Из погреба с любовью', subtitle: 'Домашние заготовки', category: 'Заготовки', color: '#6a4858', accent: '#e2cb8d' },
]
