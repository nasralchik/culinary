declare module 'pdfmake/build/pdfmake' {
  interface PdfMakeInstance {
    addVirtualFileSystem(files: unknown): void
    createPdf(documentDefinition: unknown): {
      download(filename?: string): Promise<void> | void
    }
  }

  const pdfMake: PdfMakeInstance
  export default pdfMake
}

declare module 'pdfmake/build/vfs_fonts' {
  const virtualFonts: Record<string, unknown>
  export default virtualFonts
}
