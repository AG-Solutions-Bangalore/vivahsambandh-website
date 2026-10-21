/**
 * @file src/module/registration/components/registration-form/sections/PhotosSection.tsx
 * Part 4 — Profile Photographs with the interactive crop flow.
 * Owns the file inputs and cropper modal state; cropped results are written
 * into shared form state through setPhotoFields().
 */

import { useState, useRef, type ChangeEvent } from 'react'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import ImageCropModal from '../../ImageCropModal'
import { useRegistrationForm } from '../context'

export default function PhotosSection() {
  const { t } = useTranslation()
  const { baseId, form, fieldErrors, setPhotoFields } = useRegistrationForm()

  const fullPhotoInputRef = useRef<HTMLInputElement>(null)
  const facePhotoInputRef = useRef<HTMLInputElement>(null)

  const [cropTarget, setCropTarget] = useState<'full' | 'face' | null>(null)
  const [cropRawSrc, setCropRawSrc] = useState<string | null>(null)

  // File selection for image cropping
  const handleFileSelect = (
    e: ChangeEvent<HTMLInputElement>,
    target: 'full' | 'face',
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      setCropRawSrc(reader.result as string)
      setCropTarget(target)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleCropComplete = (croppedFile: File, previewUrl: string) => {
    if (cropTarget) {
      setPhotoFields(cropTarget, croppedFile, previewUrl)
    }
  }

  return (
    <div className="rounded-[1.5rem] border border-gold-500/30 bg-white p-6 sm:p-8 lg:p-10 shadow-card">
      <div className="mb-6 border-b border-cream-200 pb-4">
        <span className="eyebrow">{t('registrationPage.form.part4Badge', 'Part 4')}</span>
        <h2 className="text-xl sm:text-2xl font-bold font-display text-navy-900">
          {t('registrationPage.form.part4Title', 'Profile Photographs')}
        </h2>
        <p className="mt-1 text-xs text-ink-500">
          {t('registrationPage.form.part4Subtitle', 'High-resolution recent photographs. Selecting a photo will open the interactive cropper.')}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        {/* Full Length Photo */}
        <div
          id={`${baseId}-full-image-group`}
          className={`rounded-2xl border p-5 transition ${
            fieldErrors.full_image
              ? 'border-maroon-500 bg-maroon-50/20'
              : 'border-cream-200 bg-cream-50/50'
          }`}
        >
          <span className="block text-sm font-bold text-navy-900 mb-1">
            {t('registrationPage.form.fullPhotoLabel', 'Full Length Photograph')} <span className="text-maroon-600">*</span>
          </span>
          <p className="text-xs text-ink-500 mb-4">
            {t('registrationPage.form.fullPhotoSubtitle', 'Full-standing recent photo showing attire clearly.')}
          </p>

          <div className="flex flex-col items-center gap-4">
            <div className="h-44 w-44 overflow-hidden rounded-xl border-2 border-dashed border-gold-500/50 bg-white flex items-center justify-center shadow-inner">
              {form.full_image_preview ? (
                <img
                  src={form.full_image_preview}
                  alt="Full photograph preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="text-center p-4">
                  <svg className="mx-auto h-10 w-10 text-gold-500/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="mt-2 block text-xs text-ink-500">
                    {t('registrationPage.form.noPhotoSelected', 'No photo selected')}
                  </span>
                </div>
              )}
            </div>

            <input
              ref={fullPhotoInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileSelect(e, 'full')}
              className="sr-only"
              aria-label={t('registrationPage.form.fullPhotoLabel', 'Full Length Photograph')}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fullPhotoInputRef.current?.click()}
            >
              <span>
                {form.full_image
                  ? t('registrationPage.form.changeAndCrop', 'Change & Crop')
                  : t('registrationPage.form.uploadAndCrop', 'Upload & Crop Photo')}
              </span>
            </Button>
          </div>
          {fieldErrors.full_image && (
            <p role="alert" className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-maroon-600">
              {fieldErrors.full_image}
            </p>
          )}
        </div>

        {/* Full Face Photo */}
        <div
          id={`${baseId}-face-image-group`}
          className={`rounded-2xl border p-5 transition ${
            fieldErrors.face_image
              ? 'border-maroon-500 bg-maroon-50/20'
              : 'border-cream-200 bg-cream-50/50'
          }`}
        >
          <span className="block text-sm font-bold text-navy-900 mb-1">
            {t('registrationPage.form.facePhotoLabel', 'Full Face Photograph')} <span className="text-maroon-600">*</span>
          </span>
          <p className="text-xs text-ink-500 mb-4">
            {t('registrationPage.form.facePhotoSubtitle', 'Close-up portrait with clear frontal view of facial features.')}
          </p>

          <div className="flex flex-col items-center gap-4">
            <div className="h-44 w-44 overflow-hidden rounded-full border-2 border-dashed border-gold-500/50 bg-white flex items-center justify-center shadow-inner">
              {form.face_image_preview ? (
                <img
                  src={form.face_image_preview}
                  alt="Face photograph preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="text-center p-4">
                  <svg className="mx-auto h-10 w-10 text-gold-500/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="mt-2 block text-xs text-ink-500">
                    {t('registrationPage.form.noPhotoSelected', 'No photo selected')}
                  </span>
                </div>
              )}
            </div>

            <input
              ref={facePhotoInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileSelect(e, 'face')}
              className="sr-only"
              aria-label={t('registrationPage.form.facePhotoLabel', 'Full Face Photograph')}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => facePhotoInputRef.current?.click()}
            >
              <span>
                {form.face_image
                  ? t('registrationPage.form.changeAndCrop', 'Change & Crop')
                  : t('registrationPage.form.uploadAndCrop', 'Upload & Crop Photo')}
              </span>
            </Button>
          </div>
          {fieldErrors.face_image && (
            <p role="alert" className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-maroon-600">
              {fieldErrors.face_image}
            </p>
          )}
        </div>
      </div>

      {/* Image Cropper Modal */}
      <ImageCropModal
        key={cropTarget || 'none'}
        isOpen={cropTarget !== null}
        title={
          cropTarget === 'full'
            ? t('registrationPage.form.cropFullPhoto', 'Crop Full Length Photo')
            : t('registrationPage.form.cropFacePhoto', 'Crop Full Face Photo')
        }
        imageSrc={cropRawSrc}
        onClose={() => {
          setCropTarget(null)
          setCropRawSrc(null)
        }}
        onCropComplete={handleCropComplete}
      />
    </div>
  )
}
