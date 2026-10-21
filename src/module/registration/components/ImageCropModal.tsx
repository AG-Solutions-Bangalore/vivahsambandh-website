/**
 * @file src/module/registration/components/ImageCropModal.tsx
 * Modal for cropping full length and face photos with 1:1 aspect ratio.
 */

import { useState, useRef, useCallback, type MouseEvent, type TouchEvent } from 'react'
import { useTranslation } from 'react-i18next'

interface ImageCropModalProps {
  isOpen: boolean
  title: string
  imageSrc: string | null
  onClose: () => void
  onCropComplete: (file: File, previewUrl: string) => void
}

export default function ImageCropModal({
  isOpen,
  title,
  imageSrc,
  onClose,
  onCropComplete,
}: ImageCropModalProps) {
  const { t } = useTranslation()
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)



  const handleMouseDown = (e: MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }, [isDragging, dragStart])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true)
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      })
    }
  }

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return
    setPosition({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    })
  }, [isDragging, dragStart])

  const handleCrop = () => {
    if (!imageRef.current) return
    const img = imageRef.current
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const outputSize = 500
    canvas.width = outputSize
    canvas.height = outputSize

    // Container crop box size
    const cropBoxSize = 280
    const ratio = outputSize / cropBoxSize

    // Render cropped view from canvas transform
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, outputSize, outputSize)

    // Center pivot
    ctx.translate(outputSize / 2, outputSize / 2)
    ctx.translate(position.x * ratio, position.y * ratio)
    ctx.scale(scale * ratio, scale * ratio)

    // Draw the image centered
    const imgW = img.naturalWidth || img.width
    const imgH = img.naturalHeight || img.height
    // Fit into 280 box initially
    const fitScale = Math.max(cropBoxSize / imgW, cropBoxSize / imgH)
    const drawW = imgW * fitScale
    const drawH = imgH * fitScale

    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH)

    canvas.toBlob(
      (blob) => {
        if (!blob) return
        const fileName = `${title.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.jpg`
        const croppedFile = new File([blob], fileName, { type: 'image/jpeg' })
        const previewUrl = URL.createObjectURL(blob)
        onCropComplete(croppedFile, previewUrl)
        onClose()
      },
      'image/jpeg',
      0.9,
    )
  }

  if (!isOpen || !imageSrc) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/70 p-4 backdrop-blur-xs"
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-lift ring-1 ring-gold-500/20">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cream-200 bg-cream-50 px-6 py-4">
          <h3 className="text-base font-bold text-navy-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-ink-500 hover:bg-cream-200 hover:text-navy-900 transition"
            aria-label="Close"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Crop workspace */}
        <div className="p-6">
          <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
            className="relative mx-auto flex h-[280px] w-[280px] cursor-grab items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-gold-500 bg-navy-950 select-none active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Crop preview"
              draggable={false}
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                transition: isDragging ? 'none' : 'transform 0.05s ease-out',
                maxWidth: 'none',
                userSelect: 'none',
              }}
              className="pointer-events-none max-h-full max-w-full object-contain"
            />
            {/* Overlay grid lines */}
            <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3 border border-gold-400/30">
              <div className="border-r border-b border-gold-400/20" />
              <div className="border-r border-b border-gold-400/20" />
              <div className="border-b border-gold-400/20" />
              <div className="border-r border-b border-gold-400/20" />
              <div className="border-r border-b border-gold-400/20" />
              <div className="border-b border-gold-400/20" />
              <div className="border-r border-gold-400/20" />
              <div className="border-r border-gold-400/20" />
              <div />
            </div>
          </div>

          <p className="mt-2 text-center text-xs text-ink-500">
            {t('registrationPage.form.cropDragHint', 'Drag to reposition. Use the slider below to zoom.')}
          </p>

          {/* Zoom controls */}
          <div className="mt-4 flex items-center justify-center gap-3">
            <span className="text-xs font-semibold text-navy-900">{t('registrationPage.form.zoom', 'Zoom:')}</span>
            <input
              type="range"
              min="0.8"
              max="3"
              step="0.05"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="h-2 w-48 cursor-pointer appearance-none rounded-lg bg-cream-200 accent-gold-600"
            />
            <span className="w-10 text-right text-xs font-mono text-ink-600">
              {Math.round(scale * 100)}%
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-cream-200 bg-cream-50 px-6 py-3.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-navy-200 bg-white px-5 py-2 text-xs font-bold text-navy-900 transition hover:bg-cream-100"
          >
            {t('registrationPage.form.cancel', 'Cancel')}
          </button>
          <button
            type="button"
            onClick={handleCrop}
            className="btn-primary !px-6 !py-2 text-xs"
          >
            {t('registrationPage.form.cropAndApply', 'Crop & Apply')}
          </button>
        </div>
      </div>
    </div>
  )
}
