import { useEffect, useState, type KeyboardEvent } from 'react'

export interface SearchSuggestion {
  id: string
  title: string
  summary: string
  category: string
}

interface SearchBarProps {
  value: string
  suggestions: readonly SearchSuggestion[]
  onChange: (value: string) => void
  onSelect: (recipeId: string) => void
  placeholder?: string
  ariaLabel?: string
  idPrefix?: string
  className?: string
}

export function SearchBar({
  value,
  suggestions,
  onChange,
  onSelect,
  placeholder = 'Найдите рецепт или любимое блюдо…',
  ariaLabel = 'Поиск рецептов',
  idPrefix = 'recipe-search',
  className = '',
}: SearchBarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const hasQuery = value.trim().length > 0
  const showSuggestions = isOpen && hasQuery && suggestions.length > 0

  useEffect(() => {
    if (activeIndex >= suggestions.length) setActiveIndex(-1)
  }, [activeIndex, suggestions.length])

  const chooseSuggestion = (suggestion: SearchSuggestion) => {
    setIsOpen(false)
    setActiveIndex(-1)
    onSelect(suggestion.id)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' && suggestions.length > 0) {
      event.preventDefault()
      setIsOpen(true)
      setActiveIndex((index) => index >= suggestions.length - 1 ? 0 : index + 1)
    } else if (event.key === 'ArrowUp' && suggestions.length > 0) {
      event.preventDefault()
      setIsOpen(true)
      setActiveIndex((index) => index <= 0 ? suggestions.length - 1 : index - 1)
    } else if (event.key === 'Enter' && showSuggestions) {
      event.preventDefault()
      chooseSuggestion(suggestions[activeIndex] ?? suggestions[0])
    } else if (event.key === 'Escape') {
      setIsOpen(false)
      setActiveIndex(-1)
    }
  }

  return (
    <div className={`search-control ${className}`.trim()} onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsOpen(false)
    }}>
      <label className="search-box">
        <span className="search-icon" aria-hidden="true">⌕</span>
        <input
          type="search"
          value={value}
          onChange={(event) => {
            onChange(event.target.value)
            setIsOpen(event.target.value.trim().length > 0)
            setActiveIndex(-1)
          }}
          onFocus={() => { if (hasQuery) setIsOpen(true) }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label={ariaLabel}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showSuggestions}
          aria-controls={`${idPrefix}-suggestions`}
          aria-activedescendant={showSuggestions && activeIndex >= 0 && suggestions[activeIndex] ? `${idPrefix}-suggestion-${suggestions[activeIndex].id}` : undefined}
        />
      </label>

      {showSuggestions && <div className="search-suggestions" id={`${idPrefix}-suggestions`} role="listbox" aria-label="Подходящие рецепты">
        {suggestions.map((suggestion, index) => (
          <button
            className={`search-suggestion ${index === activeIndex ? 'active' : ''}`}
            id={`${idPrefix}-suggestion-${suggestion.id}`}
            key={suggestion.id}
            type="button"
            role="option"
            aria-selected={index === activeIndex}
            tabIndex={-1}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => chooseSuggestion(suggestion)}
          >
            <span className="search-suggestion-copy">
              <strong>{suggestion.title}</strong>
              {suggestion.summary && <small>{suggestion.summary}</small>}
            </span>
            <span className="search-suggestion-category">{suggestion.category}</span>
          </button>
        ))}
      </div>}
    </div>
  )
}
