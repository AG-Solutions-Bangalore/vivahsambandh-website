/**
 * @file src/module/registration/components/registration-form/sections/PhotosSection.tsx
 * Part 4 — Profile Photographs with the interactive crop flow.
 * Owns the file inputs and cropper modal state; cropped results are written
 * into shared form state through setPhotoFields().
 */

import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { Button } from '@/components/ui/button'
import { ImageUp, RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import ImageCropModal from '../../ImageCropModal'
import { useRegistrationForm } from '../context'
import FormSection from '../FormSection'
import { REGISTRATION_STEP_IDS } from '../steps'

/** Output aspect ratios of the two uploads (width / height). */
const FULL_PHOTO_ASPECT = 3 / 4
const FACE_PHOTO_ASPECT = 1

export default function PhotosSection() {
  const { t } = useTranslation()
  const { baseId, form, fieldErrors, setPhotoFields } = useRegistrationForm()

  const fullPhotoInputRef = useRef<HTMLInputElement>(null)
  const facePhotoInputRef = useRef<HTMLInputElement>(null)

  const [cropTarget, setCropTarget] = useState<'full' | 'face' | null>(null)
  const [cropRawSrc, setCropRawSrc] = useState<string | null>(null)

  // The blob URL of the photo being cropped — revoked when it is replaced.
  const cropUrlRef = useRef<string | null>(null)

  useEffect(() => {
    return () => {
      if (cropUrlRef.current) URL.revokeObjectURL(cropUrlRef.current)
    }
  }, [])

  // File selection for image cropping
  const handleFileSelect = (
    e: ChangeEvent<HTMLInputElement>,
    target: 'full' | 'face',
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    // A blob URL keeps a 12 MP phone photo out of a base64 string in memory.
    const url = URL.createObjectURL(file)
    if (cropUrlRef.current) URL.revokeObjectURL(cropUrlRef.current)
    cropUrlRef.current = url

    setCropRawSrc(url)
    setCropTarget(target)
    e.target.value = ''
  }

  const handleCropComplete = (croppedFile: File, previewUrl: string) => {
    if (!cropTarget) return
    setPhotoFields(cropTarget, croppedFile, previewUrl)
  }

  const closeCropper = () => {
    setCropTarget(null)
    setCropRawSrc(null)
    if (cropUrlRef.current) {
      URL.revokeObjectURL(cropUrlRef.current)
      cropUrlRef.current = null
    }
  }

  return (
    <FormSection
      id={REGISTRATION_STEP_IDS.photos}
      title={t('registrationPage.form.part4Title', 'Profile Photographs')}
      subtitle={t('registrationPage.form.part4Subtitle', 'High-resolution recent photographs. Selecting a photo will open the interactive cropper.')}
    >
      <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
        {/* Full Length Photo */}
        <div
          id={`${baseId}-full-image-group`}
          className={`flex flex-col rounded-2xl border p-5 transition ${
            fieldErrors.full_image
              ? 'border-maroon-500 bg-maroon-50/20'
              : 'border-cream-300 bg-cream-50/70'
          }`}
        >
          <span className="text-[13px] font-semibold leading-tight tracking-tight text-navy-900">
            {t('registrationPage.form.fullPhotoLabel', 'Full Length Photograph')} <span className="text-maroon-600" aria-hidden="true">*</span>
          </span>
          <p className="mt-1 text-xs leading-relaxed text-ink-500">
            {t('registrationPage.form.fullPhotoSubtitle', 'Full-standing recent photo showing attire clearly.')}
          </p>

          <div className="mt-4 flex flex-1 flex-col items-center justify-center gap-4">
            {/* 3:4 frame — matches the cropper's output exactly, so the
                preview shows the uploaded file without cropping it again. */}
            <div className="flex h-56 w-42 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-gold-500/50 bg-white">
              {form.full_image_preview ? (
                <img
                  src={form.full_image_preview}
                  alt="Full photograph preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="px-4 text-center">
                  <ImageUp className="mx-auto size-9 text-gold-500/70" aria-hidden />
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
              size="default"
              onClick={() => fullPhotoInputRef.current?.click()}
              className="h-11 w-full max-w-[16rem] rounded-full border-gold-500/60 bg-white font-semibold text-navy-900 hover:border-gold-500 hover:bg-gold-50"
            >
              {form.full_image ? (
                <>
                  <RefreshCw aria-hidden />
                  {t('registrationPage.form.changeAndCrop', 'Change & Crop')}
                </>
              ) : (
                <>
                  <ImageUp aria-hidden />
                  {t('registrationPage.form.uploadAndCrop', 'Upload & Crop Photo')}
                </>
              )}
            </Button>
          </div>
          {fieldErrors.full_image && (
            <p role="alert" className="mt-3 flex items-start gap-1.5 text-xs font-semibold text-maroon-600">
              {fieldErrors.full_image}
            </p>
          )}
        </div>

        {/* Full Face Photo */}
        <div
          id={`${baseId}-face-image-group`}
          className={`flex flex-col rounded-2xl border p-5 transition ${
            fieldErrors.face_image
              ? 'border-maroon-500 bg-maroon-50/20'
              : 'border-cream-300 bg-cream-50/70'
          }`}
        >
          <span className="text-[13px] font-semibold leading-tight tracking-tight text-navy-900">
            {t('registrationPage.form.facePhotoLabel', 'Full Face Photograph')} <span className="text-maroon-600" aria-hidden="true">*</span>
          </span>
          <p className="mt-1 text-xs leading-relaxed text-ink-500">
            {t('registrationPage.form.facePhotoSubtitle', 'Close-up portrait with clear frontal view of facial features.')}
          </p>

          <div className="mt-4 flex flex-1 flex-col items-center justify-center gap-4">
            <div className="flex h-56 w-56 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-gold-500/50 bg-white">
              {form.face_image_preview ? (
                <img
                  src={form.face_image_preview}
                  alt="Face photograph preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="px-4 text-center">
                  <ImageUp className="mx-auto size-9 text-gold-500/70" aria-hidden />
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
              size="default"
              onClick={() => facePhotoInputRef.current?.click()}
              className="h-11 w-full max-w-[16rem] rounded-full border-gold-500/60 bg-white font-semibold text-navy-900 hover:border-gold-500 hover:bg-gold-50"
            >
              {form.face_image ? (
                <>
                  <RefreshCw aria-hidden />
                  {t('registrationPage.form.changeAndCrop', 'Change & Crop')}
                </>
              ) : (
                <>
                  <ImageUp aria-hidden />
                  {t('registrationPage.form.uploadAndCrop', 'Upload & Crop Photo')}
                </>
              )}
            </Button>
          </div>
          {fieldErrors.face_image && (
            <p role="alert" className="mt-3 flex items-start gap-1.5 text-xs font-semibold text-maroon-600">
              {fieldErrors.face_image}
            </p>
          )}
        </div>
      </div>

      {/* Image Cropper Modal */}
      <ImageCropModal
        key={cropTarget || 'none'}
        isOpen={cropTarget !== null}
        aspect={cropTarget === 'full' ? FULL_PHOTO_ASPECT : FACE_PHOTO_ASPECT}
        title={
          cropTarget === 'full'
            ? t('registrationPage.form.cropFullPhoto', 'Crop Full Length Photo')
            : t('registrationPage.form.cropFacePhoto', 'Crop Full Face Photo')
        }
        imageSrc={cropRawSrc}
        onClose={closeCropper}
        onCropComplete={handleCropComplete}
      />
    </FormSection>
  )
}
