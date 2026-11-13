import { parseInlineText } from '../utils/inlineText'

interface FormattedTextProps {
  text: string
}

export function FormattedText({ text }: FormattedTextProps) {
  return <>{parseInlineText(text).map((part, index) => {
    if (part.format === 'bold') return <strong key={index}>{part.text}</strong>
    if (part.format === 'italic') return <em key={index}>{part.text}</em>
    if (part.format === 'highlight') return <mark className="recipe-highlight" key={index}>{part.text}</mark>
    return <span key={index}>{part.text}</span>
  })}</>
}
