import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'
import type { PublicRecipe } from '../data/recipeRepository'

pdfMake.addVirtualFileSystem(pdfFonts)

interface RecipePdfData {
  recipe: PublicRecipe
  sections: Array<{
    title: string
    stepListStyle: 'numbered' | 'bulleted'
    ingredients: Array<{ name: string; amount: string }>
    steps: string[]
  }>
}

function safeFileName(title: string) {
  const cleaned = title.trim().replace(/[\\/:*?"<>|\u0000-\u001f]/g, '-').replace(/\s+/g, '-').replace(/-+/g, '-')
  return `${cleaned || 'recept'}.pdf`
}

export async function downloadRecipePdfFile({ recipe, sections }: RecipePdfData) {
  const content: unknown[] = [
    { text: recipe.category.toLocaleUpperCase('ru-RU'), style: 'category', margin: [0, 0, 0, 10] },
    { text: recipe.title, style: 'title', margin: [0, 0, 0, recipe.summary ? 10 : 22] },
  ]

  if (recipe.summary) content.push({ text: recipe.summary, style: 'subtitle', margin: [0, 0, 0, 23] })
  if (recipe.description.trim()) content.push({ text: recipe.description.trim(), style: 'description', margin: [0, 0, 0, 20] })

  sections.filter((section) => section.title.trim() || section.ingredients.length > 0 || section.steps.length > 0).forEach((section) => {
    const named = section.title.trim().length > 0
    if (named) content.push({ text: section.title.trim(), style: 'sectionTitle', margin: [0, 22, 0, 9], keepWithNext: true })

    if (section.ingredients.length) {
      content.push({ text: 'Ингредиенты', style: named ? 'subsectionTitle' : 'sectionTitle', margin: [0, named ? 3 : 3, 0, 10], keepWithNext: true })
      content.push({
        table: {
          widths: ['*', 'auto'],
          headerRows: 1,
          keepWithHeaderRows: 1,
          dontBreakRows: true,
          body: [
            [{ text: 'Продукт', style: 'tableHeader' }, { text: 'Количество', style: 'tableHeader', alignment: 'right' }],
            ...section.ingredients.map((ingredient) => [
              { text: ingredient.name, style: 'tableCell' },
              { text: ingredient.amount, style: 'tableAmount', alignment: 'right' },
            ]),
          ],
        },
        layout: {
          hLineWidth: (index: number) => index === 1 ? 1 : 0.55,
          hLineColor: (index: number) => index === 1 ? '#B48949' : '#D6C39B',
          vLineWidth: () => 0,
          paddingLeft: () => 0,
          paddingRight: () => 0,
          paddingTop: (index: number) => index === 0 ? 8 : 9,
          paddingBottom: (index: number) => index === 0 ? 8 : 9,
          fillColor: (rowIndex: number) => rowIndex === 0 ? '#EDE0C3' : rowIndex % 2 === 0 ? '#FBF7ED' : '#F5EEDC',
        },
      })
    }

    if (section.steps.length) {
      content.push({ text: 'Приготовление', style: named ? 'subsectionTitle' : 'sectionTitle', margin: [0, named ? 16 : 25, 0, 10], keepWithNext: true })
      if (section.stepListStyle === 'bulleted') {
        content.push({
          ul: section.steps.map((instruction) => ({ text: instruction, style: 'stepText' })),
          margin: [0, 0, 0, 11],
        })
      } else {
        section.steps.forEach((instruction, index) => content.push({
          columns: [
            { text: `${index + 1}.`, width: 28, style: 'stepNumber' },
            { text: instruction, style: 'stepText' },
          ],
          columnGap: 6,
          margin: [0, 0, 0, 11],
          unbreakable: true,
        }))
      }
    }
  })

  const documentDefinition = {
    info: {
      title: recipe.title,
      subject: 'Рецепт из Кулинарной библиотеки',
      author: 'Кулинарная библиотека',
    },
    pageSize: 'A4',
    pageMargins: [54, 54, 54, 58],
    background: (_currentPage: number, pageSize: { width: number; height: number }) => ({
      canvas: [
        { type: 'rect', x: 0, y: 0, w: pageSize.width, h: pageSize.height, color: '#FBF7ED' },
        { type: 'rect', x: 24, y: 24, w: pageSize.width - 48, h: pageSize.height - 48, lineColor: '#C5A46A', lineWidth: 0.8 },
        { type: 'rect', x: 29, y: 29, w: pageSize.width - 58, h: pageSize.height - 58, lineColor: '#E3D4B2', lineWidth: 0.45 },
      ],
    }),
    footer: (currentPage: number, pageCount: number) => ({
      margin: [54, 0, 54, 31],
      text: `${currentPage} / ${pageCount}`,
      style: 'footer',
      alignment: 'right',
    }),
    defaultStyle: { font: 'Roboto', color: '#403629', fontSize: 10.5, lineHeight: 1.35 },
    content,
    styles: {
      category: { fontSize: 9, bold: true, color: '#956D34', characterSpacing: 1.4, alignment: 'center' },
      title: { fontSize: 27, bold: true, color: '#263D30', alignment: 'center', lineHeight: 1.2 },
      subtitle: { fontSize: 13, italics: true, color: '#725C3C', alignment: 'center', lineHeight: 1.35 },
      description: { fontSize: 10.5, color: '#514633', lineHeight: 1.5 },
      sectionTitle: { fontSize: 17, bold: true, color: '#263D30' },
      subsectionTitle: { fontSize: 12, bold: true, color: '#725735' },
      tableHeader: { fontSize: 9, bold: true, color: '#6B512F' },
      tableCell: { fontSize: 10, color: '#403629' },
      tableAmount: { fontSize: 10, color: '#5C472B' },
      stepNumber: { bold: true, color: '#9B7139' },
      stepText: { fontSize: 10.5, color: '#514633', lineHeight: 1.45 },
      footer: { fontSize: 8, color: '#8A7655' },
    },
  }

  await pdfMake.createPdf(documentDefinition).download(safeFileName(recipe.title))
}
