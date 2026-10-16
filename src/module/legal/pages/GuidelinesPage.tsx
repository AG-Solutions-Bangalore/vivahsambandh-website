import { useTranslation } from 'react-i18next'
import LegalLayout, { type LegalSection } from '../components/LegalLayout'

export default function GuidelinesPage() {
  const { t } = useTranslation()
  const sections = t('legal.guidelines.sections', { returnObjects: true }) as LegalSection[]

  return (
    <LegalLayout
      eyebrow={t('legal.guidelines.eyebrow')}
      title={t('legal.guidelines.title')}
      updated={t('legal.guidelines.updated')}
      intro={t('legal.guidelines.intro')}
      sections={Array.isArray(sections) ? sections : []}
    />
  )
}
