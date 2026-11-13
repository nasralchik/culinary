import { useRef } from 'react'

interface FormattedTextareaProps {
  value: string
  onChange: (value: string) => void
  ariaLabel: string
  rows?: number
  placeholder?: string
}

const formats = [
  { marker: '**', label: 'Жирный', className: 'format-bold', content: 'B' },
  { marker: '*', label: 'Курсив', className: 'format-italic', content: 'I' },
  { marker: '==', label: 'Выделить цветом', className: 'format-highlight', content: 'A' },
]

export function FormattedTextarea({ value, onChange, ariaLabel, rows = 2, placeholder }: FormattedTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function applyFormat(marker: string) {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.slice(start, end)
    const insertion = selectedText ? `${marker}${selectedText}${marker}` : `${marker}${marker}`
    const nextValue = `${value.slice(0, start)}${insertion}${value.slice(end)}`
    const selectionStart = start + marker.length
    const selectionEnd = selectedText ? selectionStart + selectedText.length : selectionStart

    onChange(nextValue)
    window.requestAnimationFrame(() => {
      textarea.focus()
      textarea.setSelectionRange(selectionStart, selectionEnd)
    })
  }

  return <div className="formatted-textarea">
    <div className="inline-format-toolbar" role="toolbar" aria-label={`Форматирование: ${ariaLabel}`}>
      {formats.map((format) => <button
        key={format.label}
        type="button"
        className={format.className}
        aria-label={format.label}
        title={format.label}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => applyFormat(format.marker)}
      >{format.content}</button>)}
    </div>
    <textarea
      ref={textareaRef}
      rows={rows}
      value={value}
      aria-label={ariaLabel}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
    />
  </div>
}
