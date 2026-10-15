import { useState, type FormEvent, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import Reveal from '../../../components/motion/Reveal'
import { useEnquiryMutation } from '../hook/useEnquiry'
import { getEnquiryFrom, getUtmParams } from '../../../lib/api/utm'

const inputCls =
  'w-full rounded-xl border border-navy-100 bg-white py-3 pl-11 pr-4 text-sm text-navy-900 placeholder:text-ink-400 shadow-xs outline-none transition focus:border-gold-500 focus:ring-2 focus:ring-gold-500/30'

function FieldIcon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] text-gold-600" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d={d} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** Label + icon field row. Visible labels (best UX) tinted for the navy card. */
function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold tracking-wide text-gold-200">
        {label}
        {required && (
          <span aria-hidden="true" className="text-gold-400"> *</span>
        )}
      </span>
      <span className="relative block">{children}</span>
    </label>
  )
}

/**
 * Navy "We'd Love to Hear from You" form card (design's left panel).
 * Controlled fields, native required validation, inline success state, and CRM API integration.
 */
export default function MessageForm() {
  const { t } = useTranslation()
  const subjectOptions = (t('contactPage.subjectOptions', { returnObjects: true }) as string[]) || []
  const [sent, setSent] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const enquiryMutation = useEnquiryMutation()

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMsg(null)

    const form = e.currentTarget
    const formData = new FormData(form)
    const name = String(formData.get('name') ?? '').trim()
    const email = String(formData.get('email') ?? '').trim()
    const phone = String(formData.get('phone') ?? '').trim()
    const subject = String(formData.get('subject') ?? '').trim()
    const message = String(formData.get('message') ?? '').trim()

    try {
      await enquiryMutation.mutateAsync({
        enquiryFullName: name,
        enquiryEmail: email,
        enquiryMobile: phone,
        enquirySubject: subject,
        enquiryMessage: message,
        enquiryFrom: getEnquiryFrom('Contact Page'),
        ...getUtmParams(),
      })
      setSent(true)
    } catch (err) {
      // In case of backend error or network failure, provide helpful feedback
      const msg = err instanceof Error ? err.message : 'Unable to submit your message. Please try again.'
      setErrorMsg(msg)
    }
  }

  return (
    <Reveal variant="up" className="h-full">
      <div className="relative h-full overflow-hidden rounded-[1.5rem] bg-navy-pattern p-6 sm:p-8 lg:p-10 shadow-lift">
        {/* Filigree corner */}
        <img
          src="/images/home/Ornate_Corner_Filigree_image.webp"
          width={948}
          height={1659}
          alt="Ornate golden filigree decoration"
          title="Ornate golden filigree decoration"
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          className="pointer-events-none absolute -right-10 -top-10 z-0 h-56 w-auto select-none opacity-40 sm:h-72"
        />

        <div className="relative z-10">
          <p data-eyebrow className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-bold uppercase tracking-[0.22em] text-gold-300">
            <span aria-hidden="true" className="h-px w-8 bg-gold-500/60" />
            ✦ {t('contactPage.formEyebrow')} ✦
            <span aria-hidden="true" className="h-px w-8 bg-gold-500/60" />
          </p>
          <h2 className="font-display mt-3 text-2xl sm:text-3xl lg:text-4xl font-bold leading-[1.15]">
            <span className="block text-white">{t('contactPage.formTitleA')}</span>
            <span className="block text-gold-400">{t('contactPage.formTitleB')}</span>
          </h2>
          <p className="mt-3 max-w-md text-xs sm:text-sm leading-relaxed text-white/75 font-medium">
            {t('contactPage.formBody')}
          </p>

          {sent ? (
            <div className="mt-7 rounded-2xl border border-gold-500/40 bg-white/10 p-6 text-center backdrop-blur-[2px] sm:p-8">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold-500 text-navy-950" aria-hidden="true">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <p className="font-display mt-4 text-lg sm:text-xl font-bold text-white">
                {t('contactPage.successTitle')}
              </p>
              <p className="mx-auto mt-2 max-w-sm text-xs sm:text-sm leading-relaxed text-white/75">
                {t('contactPage.successBody')}
              </p>
              <button
                type="button"
                onClick={() => setSent(false)}
                className="mt-5 rounded-full border border-gold-500/50 px-6 py-2.5 text-xs sm:text-sm font-semibold text-gold-300 transition hover:bg-gold-500 hover:text-navy-950 cursor-pointer"
              >
                {t('contactPage.sendAnother')}
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-6 grid content-start gap-4 sm:grid-cols-2">
              <Field label={`${t('contactPage.name')}`} required>
                <span aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
                  <FieldIcon d="M12 12a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM5 20c0-3 3-5 7-5s7 2 7 5" />
                </span>
                <input required name="name" autoComplete="name" placeholder={t('contactPage.name')} className={inputCls} />
              </Field>
              <Field label={`${t('contactPage.email')}`} required>
                <span aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
                  <FieldIcon d="M3 6h18v12H3zM3.5 7.5L12 13l8.5-5.5" />
                </span>
                <input required type="email" name="email" autoComplete="email" placeholder={t('contactPage.email')} className={inputCls} />
              </Field>
              <Field label={t('contactPage.phone')}>
                <span aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
                  <FieldIcon d="M5 4h4l2 5-2.5 1.5a12 12 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" />
                </span>
                <input type="tel" name="phone" autoComplete="tel" placeholder={t('contactPage.phone')} className={inputCls} />
              </Field>
              <Field label={t('contactPage.subject')} required>
                <span aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
                  <FieldIcon d="M21 12a8 8 0 01-8 8H5l-2 2V12a8 8 0 018-8h2a8 8 0 018 8z" />
                </span>
                <select required name="subject" defaultValue="" className={`${inputCls} appearance-none pr-10 invalid:text-ink-400`}>
                  <option value="" disabled>
                    {t('contactPage.subjectPlaceholder')}
                  </option>
                  {subjectOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <span aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gold-600">
                  ⌄
                </span>
              </Field>
              <div className="sm:col-span-2">
                <Field label={t('contactPage.message')} required>
                  <span aria-hidden="true" className="pointer-events-none absolute left-4 top-4">
                    <FieldIcon d="M4 5h16v11H8l-4 4zM8 9h8M8 12.5h5" />
                  </span>
                  <textarea
                    required
                    name="message"
                    rows={4}
                    placeholder={t('contactPage.message')}
                    className="w-full resize-y rounded-xl border border-navy-100 bg-white py-3 pl-11 pr-4 text-sm text-navy-900 placeholder:text-ink-400 shadow-xs outline-none transition focus:border-gold-500 focus:ring-2 focus:ring-gold-500/30"
                  />
                </Field>
              </div>
              {errorMsg && (
                <div role="alert" className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3.5 text-xs text-rose-200 sm:col-span-2">
                  <p className="font-semibold">{errorMsg}</p>
                </div>
              )}
              <div className="pt-1 sm:col-span-2">
                <button
                  type="submit"
                  disabled={enquiryMutation.isPending}
                  className="group flex w-full items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-gold-300 via-gold-400 to-gold-300 px-7 py-3.5 text-sm font-bold text-navy-950 shadow-gold transition hover:brightness-105 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {enquiryMutation.isPending ? (
                    <span>{t('contactPage.submitting', 'Sending...')}</span>
                  ) : (
                    <>
                      <span aria-hidden="true">✈</span>
                      <span>{t('contactPage.send')}</span>
                      <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </Reveal>
  )
}
