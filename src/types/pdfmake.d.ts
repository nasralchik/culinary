declare module 'pdfmake/build/pdfmake' {
  export function addVirtualFileSystem(files: unknown): void
  export function createPdf(documentDefinition: unknown): {
    download(filename?: string): Promise<void> | void
  }
}

declare module 'pdfmake/build/vfs_fonts' {
  const virtualFonts: Record<string, unknown>
  export = virtualFonts
}
