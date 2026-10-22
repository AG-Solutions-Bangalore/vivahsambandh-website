/**
 * @file src/module/registration/components/registration-form/sections/PhotosSection.tsx
 * Part 4 — Profile Photographs with the interactive crop flow.
 * Reuses the shared `PhotoCropField`, which owns the file input and the
 * cropper modal; cropped results are written into shared form state
 * through setPhotoFields().
 */

import { useTranslation } from 'react-i18next'
import PhotoCropField from '../../PhotoCropField'
import { useRegistrationForm } from '../context'
import FormSection from '../FormSection'
import { REGISTRATION_STEP_IDS } from '../steps'

/** Output aspect ratios of the two uploads (width / height). */
const FULL_PHOTO_ASPECT = 3 / 4
const FACE_PHOTO_ASPECT = 1

export default function PhotosSection() {
  const { t } = useTranslation()
  const { baseId, form, fieldErrors, setPhotoFields } = useRegistrationForm()

  return (
    <FormSection
      id={REGISTRATION_STEP_IDS.photos}
      title={t('registrationPage.form.part4Title', 'Profile Photographs')}
      subtitle={t('registrationPage.form.part4Subtitle', 'High-resolution recent photographs. Selecting a photo will open the interactive cropper.')}
    >
      <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
        {/* Full Length Photo */}
        <PhotoCropField
          id={`${baseId}-full-image-group`}
          label={t('registrationPage.form.fullPhotoLabel', 'Full Length Photograph')}
          subtitle={t('registrationPage.form.fullPhotoSubtitle', 'Full-standing recent photo showing attire clearly.')}
          previewUrl={form.full_image_preview}
          hasPhoto={Boolean(form.full_image)}
          onCropComplete={(file, previewUrl) => setPhotoFields('full', file, previewUrl)}
          error={fieldErrors.full_image}
          aspect={FULL_PHOTO_ASPECT}
          outputSize={800}
          cropTitle={t('registrationPage.form.cropFullPhoto', 'Crop Full Length Photo')}
          frameClassName="flex h-56 w-42 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-gold-500/50 bg-white"
        />

        {/* Full Face Photo */}
        <PhotoCropField
          id={`${baseId}-face-image-group`}
          label={t('registrationPage.form.facePhotoLabel', 'Full Face Photograph')}
          subtitle={t('registrationPage.form.facePhotoSubtitle', 'Close-up portrait with clear frontal view of facial features.')}
          previewUrl={form.face_image_preview}
          hasPhoto={Boolean(form.face_image)}
          onCropComplete={(file, previewUrl) => setPhotoFields('face', file, previewUrl)}
          error={fieldErrors.face_image}
          aspect={FACE_PHOTO_ASPECT}
          outputSize={600}
          shape="circle"
          cropTitle={t('registrationPage.form.cropFacePhoto', 'Crop Full Face Photo')}
          frameClassName="flex h-56 w-56 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-gold-500/50 bg-white"
        />
      </div>
    </FormSection>
  )
}
