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
  { id: 'borscht', title: 'Борщ и щи', subtitle: 'Супы из русской печи', category: 'Первые блюда', color: '#7b3027', accent: '#e4c47d', art: '🍲' },
  { id: 'broths', title: 'Бульоны и похлёбки', subtitle: 'Крепкий домашний навар', category: 'Первые блюда', color: '#344c3d', accent: '#d8bb73', art: '🥣' },
  { id: 'mushroom-soup', title: 'Лесные супы', subtitle: 'Грибы, травы и коренья', category: 'Первые блюда', color: '#526040', accent: '#e0c47c', art: '🍄' },
  { id: 'sweet-bake', title: 'Сладкая выпечка', subtitle: 'Пироги к семейному чаю', category: 'Выпечка', color: '#8b4635', accent: '#f0d394', art: '🥧' },
  { id: 'buns', title: 'Пирожки из печи', subtitle: 'Румяные и душистые', category: 'Выпечка', color: '#8f5c2f', accent: '#e9ce91', art: '🥐' },
  { id: 'sourdough', title: 'Секреты закваски', subtitle: 'Хлеб на каждый день', category: 'Выпечка', color: '#70502f', accent: '#edcf8e', art: '🍞' },
  { id: 'dumplings', title: 'Пельмени и вареники', subtitle: 'Лепим всей семьёй', category: 'Основные блюда', color: '#4b5540', accent: '#dfc47c', art: '🥟' },
  { id: 'meat', title: 'Мясные блюда', subtitle: 'Печное жаркое и дичь', category: 'Основные блюда', color: '#78392e', accent: '#e6c47a', art: '🍖' },
  { id: 'cakes', title: 'Торты и пирожные', subtitle: 'Сладкий праздничный стол', category: 'Десерты', color: '#68424a', accent: '#e4c789', art: '🍰' },
  { id: 'honey-jam', title: 'Мёд и варенье', subtitle: 'Летние ягоды впрок', category: 'Десерты', color: '#8b6732', accent: '#f1d38d', art: '🍯' },
  { id: 'berry-desserts', title: 'Ягодные десерты', subtitle: 'Дары сада к чаю', category: 'Десерты', color: '#713c4a', accent: '#e6c37c', art: '🍓' },
  { id: 'cellar-pickles', title: 'Соленья на зиму', subtitle: 'Кладовая старого дома', category: 'Заготовки', color: '#31564d', accent: '#dec47d', art: '🫙' },
  { id: 'forest-pantry', title: 'Грибная кладовая', subtitle: 'Лесной урожай впрок', category: 'Заготовки', color: '#4c5940', accent: '#dec47d', art: '🍄' },
]
