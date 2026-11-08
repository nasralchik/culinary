interface CategoryFilterProps {
  categories: readonly string[]
  selected: string
  onSelect: (category: string) => void
}

export function CategoryFilter({ categories, selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="category-list" role="group" aria-label="Фильтр по разделам">
      {categories.map((category) => (
        <button key={category} className={`category-chip ${selected === category ? 'selected' : ''}`} onClick={() => onSelect(category)} aria-pressed={selected === category}>{category}</button>
      ))}
    </div>
  )
}
