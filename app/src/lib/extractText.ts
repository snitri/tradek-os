import * as pdfjsLib from "pdfjs-dist"
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url"

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

// Extrai texto de um arquivo de conhecimento. PDF via pdf.js (no navegador); txt/md direto.
export async function extractText(file: File): Promise<string> {
  const name = file.name.toLowerCase()
  if (name.endsWith(".pdf") || file.type === "application/pdf") {
    const buf = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: buf }).promise
    const parts: string[] = []
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      parts.push(content.items.map((it) => ("str" in it ? (it as { str: string }).str : "")).join(" "))
    }
    return parts.join("\n\n").replace(/\n{3,}/g, "\n\n").trim()
  }
  return (await file.text()).trim()
}
