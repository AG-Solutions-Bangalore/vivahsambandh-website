/**
 * @file src/module/super-admin/utils/memberExport.ts
 * Client-side export helpers for the member biodata sheet.
 *
 * Printing is handed to the browser's own print pipeline so the output keeps
 * vector text, web fonts and same-origin photographs. The PDF download
 * rasterises the same sheet — jsPDF + html2canvas are loaded on demand so the
 * panel's initial bundle never pays for them.
 *
 * Member photos (and the CRM asset host) do not send CORS headers. On the
 * deployed site they are same-origin, so they can be embedded directly; on a
 * local dev origin they are rewritten through the Vite `/crmapi` proxy. If an
 * image still cannot be read, the exporter opens the print dialog rather than
 * silently writing a PDF with an empty photo box — the browser's print-to-PDF
 * path always includes images.
 */

import type { Member } from '../types'

export type MemberPdfResult = 'saved' | 'print-fallback'

const CRM_ORIGIN = 'https://vivahsambandh.com'

function isLocalHost(): boolean {
  if (typeof window === 'undefined') return false
  return ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname)
}

/**
 * Resolves the photo URL used inside the export sheet.
 *
 * Production serves the panel from the CRM host, so the absolute URL stays
 * same-origin. Vite's dev server proxies `/crmapi` to that host, giving the
 * canvas readable pixels instead of a CORS-blocked (tainted) image.
 */
export function exportImageUrl(url?: string | null): string | undefined {
  if (!url) return undefined
  if (isLocalHost() && url.startsWith(`${CRM_ORIGIN}/crmapi/`)) {
    return url.slice(CRM_ORIGIN.length)
  }
  return url
}

/** Waits for fonts and every image in the sheet so exports never race loading. */
export async function waitForSheetAssets(element: HTMLElement): Promise<void> {
  if (document.fonts?.ready) {
    await document.fonts.ready
  }

  const images = Array.from(element.querySelectorAll('img'))
  await Promise.all(
    images.map(
      (image) =>
        new Promise<void>((resolve) => {
          if (image.complete) {
            resolve()
            return
          }
          image.addEventListener('load', () => resolve(), { once: true })
          image.addEventListener('error', () => resolve(), { once: true })
        }),
    ),
  )
}

/** Opens the browser print dialog with the biodata sheet as the only content. */
export async function printMemberSheet(element: HTMLElement): Promise<void> {
  await waitForSheetAssets(element)
  window.print()
}

/**
 * Checks whether every image in the sheet can be read by the canvas API.
 *
 * An `<img>` that renders on screen may still taint a canvas when the asset
 * host omits `Access-Control-Allow-Origin`. Testing with `fetch` up front lets
 * the exporter choose the print path instead of producing a photo-less PDF.
 */
async function canEmbedImages(element: HTMLElement): Promise<boolean> {
  const sources = Array.from(element.querySelectorAll('img'))
    .map((image) => image.currentSrc || image.src)
    .filter((src) => src && !src.startsWith('data:') && !src.startsWith('blob:'))

  for (const src of sources) {
    try {
      const response = await fetch(src, { mode: 'cors', credentials: 'omit' })
      if (!response.ok) return false
    } catch {
      return false
    }
  }

  return true
}

function fileName(member: Member): string {
  const slug =
    member.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'member'
  return `${slug}-${member.id}-biodata.pdf`
}

interface PageSlice {
  top: number
  height: number
}

/**
 * Plans page breaks on section boundaries rather than at arbitrary pixel
 * offsets, so a PDF page never ends halfway through a detail row.
 */
function planPageSlices(
  element: HTMLElement,
  canvas: HTMLCanvasElement,
  contentWidth: number,
  contentHeight: number,
): PageSlice[] {
  const sheetRect = element.getBoundingClientRect()
  const scale = sheetRect.width > 0 ? canvas.width / sheetRect.width : 1
  const capacity = Math.floor((contentHeight / contentWidth) * canvas.width)

  const boundaries = new Set<number>([canvas.height])
  for (const node of element.querySelectorAll('section, header, footer')) {
    const rect = node.getBoundingClientRect()
    const top = Math.round((rect.top - sheetRect.top) * scale)
    if (top > 0 && top < canvas.height) boundaries.add(top)
  }

  const sorted = [...boundaries].sort((a, b) => a - b)
  const slices: PageSlice[] = []
  let start = 0

  while (start < canvas.height) {
    const limit = start + capacity
    if (limit >= canvas.height) {
      slices.push({ top: start, height: canvas.height - start })
      break
    }

    const candidates = sorted.filter((boundary) => boundary > start && boundary <= limit)
    const end = candidates.length > 0 ? candidates[candidates.length - 1] : limit
    slices.push({ top: start, height: end - start })
    start = end
  }

  return slices
}

/**
 * Captures the export sheet and writes it to a paginated A4 PDF.
 *
 * The sheet is rendered at 794px (A4 at 96dpi), so a two-times scale keeps
 * text crisp without producing an unreasonably large file. Each page is cut
 * from the full canvas at a section boundary and drawn as its own image.
 */
export async function downloadMemberPdf(
  element: HTMLElement,
  member: Member,
): Promise<MemberPdfResult> {
  await waitForSheetAssets(element)

  if (!(await canEmbedImages(element))) {
    await printMemberSheet(element)
    return 'print-fallback'
  }

  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas-pro'),
    import('jspdf'),
  ])

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
  })

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 8
  const contentWidth = pageWidth - margin * 2
  const contentHeight = pageHeight - margin * 2
  const slices = planPageSlices(element, canvas, contentWidth, contentHeight)

  slices.forEach((slice, index) => {
    if (index > 0) pdf.addPage()

    const pageCanvas = document.createElement('canvas')
    pageCanvas.width = canvas.width
    pageCanvas.height = slice.height
    const context = pageCanvas.getContext('2d')
    if (!context) throw new Error('Could not create the PDF page canvas.')

    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, pageCanvas.width, pageCanvas.height)
    context.drawImage(
      canvas,
      0,
      slice.top,
      canvas.width,
      slice.height,
      0,
      0,
      canvas.width,
      slice.height,
    )

    const sliceHeight = (slice.height / canvas.width) * contentWidth
    pdf.addImage(
      pageCanvas.toDataURL('image/jpeg', 0.92),
      'JPEG',
      margin,
      margin,
      contentWidth,
      sliceHeight,
    )
  })

  const pageCount = pdf.getNumberOfPages()
  for (let page = 1; page <= pageCount; page += 1) {
    pdf.setPage(page)
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(7)
    pdf.setTextColor(150, 140, 126)
    pdf.text(`Page ${page} of ${pageCount}`, pageWidth - margin, pageHeight - 3.5, {
      align: 'right',
    })
  }

  pdf.save(fileName(member))
  return 'saved'
}
