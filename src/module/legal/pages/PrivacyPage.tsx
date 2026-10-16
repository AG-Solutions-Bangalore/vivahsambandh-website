import { useTranslation } from 'react-i18next'
import LegalLayout, { type LegalSection } from '../components/LegalLayout'

export default function PrivacyPage() {
  const { t } = useTranslation()
  const sections = t('legal.privacy.sections', { returnObjects: true }) as LegalSection[]

  return (
    <LegalLayout
      eyebrow={t('legal.privacy.eyebrow')}
      title={t('legal.privacy.title')}
      updated={t('legal.privacy.updated')}
      intro={t('legal.privacy.intro')}
      sections={Array.isArray(sections) ? sections : []}
    />
  )
}
