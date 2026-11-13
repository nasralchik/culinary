export type InlineTextFormat = 'plain' | 'bold' | 'italic' | 'highlight'

export interface InlineTextPart {
  text: string
  format: InlineTextFormat
}

const inlinePattern = /\*\*([^*\n]+)\*\*|\*([^*\n]+)\*|==([^=\n]+)==/g

export function parseInlineText(value: string): InlineTextPart[] {
  const parts: InlineTextPart[] = []
  let lastIndex = 0

  for (const match of value.matchAll(inlinePattern)) {
    const index = match.index ?? 0
    if (index > lastIndex) parts.push({ text: value.slice(lastIndex, index), format: 'plain' })

    if (match[1] != null) parts.push({ text: match[1], format: 'bold' })
    else if (match[2] != null) parts.push({ text: match[2], format: 'italic' })
    else if (match[3] != null) parts.push({ text: match[3], format: 'highlight' })
    lastIndex = index + match[0].length
  }

  if (lastIndex < value.length) parts.push({ text: value.slice(lastIndex), format: 'plain' })
  return parts.length ? parts : [{ text: value, format: 'plain' }]
}
