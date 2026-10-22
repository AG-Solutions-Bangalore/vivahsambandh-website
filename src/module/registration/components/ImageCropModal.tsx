/**
 * @file src/module/registration/components/ImageCropModal.tsx
 * Interactive photo cropper — drag to reposition, slider to zoom, then crop.
 *
 * The preview and the produced file are driven by the SAME geometry
 * (`lib/imageCrop.ts`): the photo is cover-fitted into the crop box, the
 * canvas re-renders that exact framing at the output resolution. Before
 * that, the preview letterboxed the whole photo while the canvas centre-
 * cropped it, so the saved file never matched the framing.
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
} from 'react'
import { useTranslation } from 'react-i18next'
import { ZoomIn, ZoomOut, RotateCcw, X, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  clampOffset,
  computeCropGeometry,
  cropBoxSizeFor,
  outputSizeFor,
} from '../lib/imageCrop'

export interface ImageCropModalProps {
  isOpen: boolean
  title: string
  /** Source image — a blob: or data: URL. */
  imageSrc: string | null
  /** Output aspect ratio as width / height. 1 = square, 0.75 = 3:4. */
  aspect?: number
  /** Longest edge of the produced image, in pixels. */
  outputSize?: number
  onClose: () => void
  onCropComplete: (file: File, previewUrl: string) => void
}

/** Longest edge of the visible crop box, in CSS pixels. */
const BOX_LONG_EDGE = 280
/** Longest edge of the produced image, in pixels. */
const DEFAULT_OUTPUT_SIZE = 600
const MIN_ZOOM = 1
const MAX_ZOOM = 3

export default function ImageCropModal({
  isOpen,
  title,
  imageSrc,
  aspect = 1,
  outputSize = DEFAULT_OUTPUT_SIZE,
  onClose,
  onCropComplete,
}: ImageCropModalProps): ReactElement | null {
  const { t } = useTranslation()

  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [loadError, setLoadError] = useState(false)
  /** Intrinsic size of the image currently on screen. */
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(null)

  const imageRef = useRef<HTMLImageElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const dragPointerId = useRef<number | null>(null)
  /** The dialog takes focus once per open — never while the user is dragging. */
  const focusedRef = useRef(false)

  // A new photo resets the framing. Adjusting state during render (instead of
  // in an effect) keeps the reset in the same commit as the new image.
  const [lastSrc, setLastSrc] = useState<string | null>(imageSrc)
  if (imageSrc !== lastSrc) {
    setLastSrc(imageSrc)
    setScale(1)
    setPosition({ x: 0, y: 0 })
    setNaturalSize(null)
    setLoadError(false)
  }

  // Escape closes the dialog, Tab stays inside it.
  useEffect(() => {
    if (!isOpen) {
      focusedRef.current = false
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onClose()
        return
      }
      if (event.key !== 'Tab' || !dialogRef.current) return

      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)

    if (!focusedRef.current) {
      focusedRef.current = true
      dialogRef.current?.focus()
    }

    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  const box = cropBoxSizeFor(aspect, BOX_LONG_EDGE)
  const output = outputSizeFor(aspect, outputSize)

  // Cover fit of the source into the crop box. Unknown size yet → the photo
  // is not measurable, so nothing is drawn until it loads.
  const geometry =
    naturalSize && naturalSize.width > 0 && naturalSize.height > 0
      ? computeCropGeometry(naturalSize.width, naturalSize.height, box.width, box.height)
      : null

  // The offset is clamped against the *scaled* photo, so a frame can never
  // be dragged until the photo no longer covers the box.
  const clamped = geometry
    ? clampOffset(
        position,
        geometry.drawWidth * scale,
        geometry.drawHeight * scale,
        geometry.boxWidth,
        geometry.boxHeight,
      )
    : position

  const setZoom = useCallback((next: number) => {
    setScale(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number(next.toFixed(2)))))
  }, [])

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!geometry) return
    event.preventDefault()
    dragPointerId.current = event.pointerId
    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      /* capture unsupported — the move/up handlers still work */
    }
    setIsDragging(true)
    setDragStart({ x: event.clientX - clamped.x, y: event.clientY - clamped.y })
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDragging) return
    event.preventDefault()
    setPosition({
      x: event.clientX - dragStart.x,
      y: event.clientY - dragStart.y,
    })
  }

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragPointerId.current !== null) {
      try {
        event.currentTarget.releasePointerCapture(dragPointerId.current)
      } catch {
        /* already released */
      }
      dragPointerId.current = null
    }
    setIsDragging(false)
  }

  const handleReset = () => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }

  const handleCrop = () => {
    const img = imageRef.current
    if (!img || !geometry || !naturalSize) return

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = output.width
    canvas.height = output.height

    // Ratio between the visible box and the output canvas.
    const ratio = output.width / geometry.boxWidth

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, output.width, output.height)

    // Same transform the preview uses, scaled up to the output resolution:
    // pivot on the centre, apply the drag offset, then the zoom.
    ctx.translate(output.width / 2, output.height / 2)
    ctx.translate(clamped.x * ratio, clamped.y * ratio)
    ctx.scale(scale * ratio, scale * ratio)
    ctx.drawImage(
      img,
      -geometry.drawWidth / 2,
      -geometry.drawHeight / 2,
      geometry.drawWidth,
      geometry.drawHeight,
    )

    canvas.toBlob(
      (blob) => {
        if (!blob) return
        const fileName = `${slugify(title)}_${Date.now()}.jpg`
        const croppedFile = new File([blob], fileName, { type: 'image/jpeg' })
        const previewUrl = URL.createObjectURL(blob)
        onCropComplete(croppedFile, previewUrl)
        onClose()
      },
      'image/jpeg',
      0.92,
    )
  }

  if (!isOpen || !imageSrc) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="crop-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/75 p-4 backdrop-blur-xs"
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white shadow-lift ring-1 ring-gold-500/25 outline-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cream-200 bg-cream-50/80 px-6 py-4">
          <div>
            <h3 id="crop-modal-title" className="font-display text-base font-bold text-navy-900">
              {title}
            </h3>
            <p className="text-[11px] font-medium text-ink-500">
              {t(
                'registrationPage.form.cropHint',
                'Drag to reposition. Use the slider below to zoom.',
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-ink-400 transition hover:bg-cream-200 hover:text-navy-900"
            aria-label={t('registrationPage.form.close', 'Close')}
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Crop workspace */}
        <div className="flex flex-col items-center p-6">
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            style={{
              width: `${box.width}px`,
              height: `${box.height}px`,
              touchAction: 'none',
            }}
            className="relative items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-gold-500 bg-navy-950 select-none shadow-inner"
            role="group"
            aria-label={t('registrationPage.form.cropViewport', 'Crop viewport')}
          >
            {geometry ? (
              <img
                ref={imageRef}
                src={imageSrc}
                alt={t('registrationPage.form.cropPreview', 'Crop preview')}
                draggable={false}
                onLoad={(event) => {
                  const target = event.currentTarget
                  setNaturalSize({
                    width: target.naturalWidth,
                    height: target.naturalHeight,
                  })
                }}
                onError={() => setLoadError(true)}
                style={{
                  width: `${geometry.drawWidth}px`,
                  height: `${geometry.drawHeight}px`,
                  maxWidth: 'none',
                  maxHeight: 'none',
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: `translate(-50%, -50%) translate(${clamped.x}px, ${clamped.y}px) scale(${scale})`,
                  transition: isDragging ? 'none' : 'transform 0.05s ease-out',
                  userSelect: 'none',
                  pointerEvents: 'none',
                }}
                className="will-change-transform"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-cream-200/70">
                {loadError ? (
                  <p className="px-4 text-center text-xs font-semibold text-maroon-200">
                    {t(
                      'registrationPage.form.cropLoadError',
                      'This image could not be read. Please choose another file.',
                    )}
                  </p>
                ) : (
                  <>
                    <Loader2 className="size-5 animate-spin" aria-hidden />
                    <p className="text-xs">
                      {t('registrationPage.form.cropLoading', 'Preparing preview...')}
                    </p>
                  </>
                )}
              </div>
            )}

            {/* Rule-of-thirds guide */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3 border border-gold-400/30"
            >
              <div className="border-r border-b border-gold-400/20" />
              <div className="border-r border-b border-gold-400/20" />
              <div className="border-b border-gold-400/20" />
              <div className="border-r border-b border-gold-400/20" />
              <div className="border-r border-b border-gold-400/20" />
              <div className="border-b border-gold-400/20" />
              <div className="border-r border-b border-gold-400/20" />
              <div className="border-r border-b border-gold-400/20" />
              <div />
            </div>
          </div>

          {/* Zoom controls */}
          <div className="mt-5 flex w-full max-w-xs items-center justify-between gap-3 px-2">
            <button
              type="button"
              onClick={() => setZoom(scale - 0.1)}
              disabled={scale <= MIN_ZOOM}
              className="p-1 text-ink-500 transition hover:text-navy-900 disabled:opacity-30"
              aria-label={t('registrationPage.form.zoomOut', 'Zoom out')}
            >
              <ZoomOut className="size-4" />
            </button>

            <input
              type="range"
              min={MIN_ZOOM}
              max={MAX_ZOOM}
              step="0.05"
              value={scale}
              onChange={(event) => setZoom(parseFloat(event.target.value))}
              className="h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-cream-200 accent-gold-600"
              aria-label={t('registrationPage.form.zoomSlider', 'Zoom')}
            />

            <button
              type="button"
              onClick={() => setZoom(scale + 0.1)}
              disabled={scale >= MAX_ZOOM}
              className="p-1 text-ink-500 transition hover:text-navy-900 disabled:opacity-30"
              aria-label={t('registrationPage.form.zoomIn', 'Zoom in')}
            >
              <ZoomIn className="size-4" />
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="rounded-full p-1.5 text-xs text-ink-500 transition hover:bg-cream-100 hover:text-navy-900"
              aria-label={t('registrationPage.form.cropReset', 'Reset zoom and position')}
            >
              <RotateCcw className="size-3.5" />
            </button>

            <span className="w-10 text-right font-mono text-xs font-semibold text-ink-600">
              {Math.round(scale * 100)}%
            </span>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 border-t border-cream-200 bg-cream-50/80 px-6 py-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="rounded-full border-cream-300 text-xs font-bold text-navy-900 hover:bg-cream-100"
          >
            {t('registrationPage.form.cancel', 'Cancel')}
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleCrop}
            disabled={!geometry || loadError}
            className="gap-1.5 rounded-full bg-navy-900 text-xs font-bold text-white shadow-sm hover:bg-navy-950 disabled:opacity-50"
          >
            <Check className="size-3.5 text-gold-400" />
            <span>{t('registrationPage.form.cropAndApply', 'Crop & Apply')}</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

/** File-name-safe slug from a (possibly translated) label. */
function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
  return slug || 'photo'
}
