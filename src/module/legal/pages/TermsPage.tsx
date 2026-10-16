import { useTranslation } from 'react-i18next'
import LegalLayout, { type LegalSection } from '../components/LegalLayout'

export default function TermsPage() {
  const { t } = useTranslation()
  const sections = t('legal.terms.sections', { returnObjects: true }) as LegalSection[]

  return (
    <LegalLayout
      eyebrow={t('legal.terms.eyebrow')}
      title={t('legal.terms.title')}
      updated={t('legal.terms.updated')}
      intro={t('legal.terms.intro')}
      sections={Array.isArray(sections) ? sections : []}
    />
  )
}
