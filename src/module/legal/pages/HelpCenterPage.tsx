import { useTranslation } from 'react-i18next'
import LegalLayout, { type LegalSection } from '../components/LegalLayout'

export default function HelpCenterPage() {
  const { t } = useTranslation()
  const sections = t('legal.help.sections', { returnObjects: true }) as LegalSection[]

  return (
    <LegalLayout
      eyebrow={t('legal.help.eyebrow')}
      title={t('legal.help.title')}
      updated={t('legal.help.updated')}
      intro={t('legal.help.intro')}
      sections={Array.isArray(sections) ? sections : []}
    />
  )
}
