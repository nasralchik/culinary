interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <label className="search-box">
      <span className="search-icon" aria-hidden="true">⌕</span>
      <input type="search" value={value} onChange={(event) => onChange(event.target.value)} placeholder="Найдите рецепт или любимое блюдо…" aria-label="Поиск рецептов" />
    </label>
  )
}
