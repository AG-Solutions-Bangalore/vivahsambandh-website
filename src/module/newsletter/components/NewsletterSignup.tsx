/**
 * @file src/module/newsletter/components/NewsletterSignup.tsx
 * The newsletter signup form used on the public website.
 *
 * One component, two layouts: `band` sits in the footer as a wide strip and
 * `card` stands on its own on the contact page. Both share the same
 * validation, the same success state and the same CRM call, so a visitor
 * meets the same form wherever they meet it.
 */

import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { Mail, Send } from 'lucide-react'
import { cn } from 'cn'
import { sanitizeEmail, validateEmail } from '@/lib/validation'
import { useNewsletterSubscribeMutation } from '../hook/useNewsletter'

interface NewsletterSignupProps {
  /** `band` lays the copy beside the form, `card` stacks them. */
  variant?: 'band' | 'card'
  className?: string
}

export default function NewsletterSignup({
  variant = 'band',
  className,
}: NewsletterSignupProps) {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [outcome, setOutcome] = useState<
    'subscribed' | 'already_subscribed' | null
  >(null)
  const mutation = useNewsletterSubscribeMutation()

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    const result = validateEmail(email, true, t('newsletter.emailLabel', 'Email address'))
    if (!result.valid) {
      setError(result.error ?? null)
      return
    }

    try {
      const response = await mutation.mutateAsync({ newsletter_email: email.trim() })
      setOutcome(response.outcome)
      setEmail('')
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : t('newsletter.errorBody', 'Could not subscribe right now. Please try again.')
      setError(message)
      toast.error(message)
    }
  }

  if (outcome) {
    const already = outcome === 'already_subscribed'

    return (
      <div
        className={cn(
          'flex items-center gap-3 rounded-2xl border border-gold-500/40 bg-white/10 px-5 py-4 backdrop-blur-[2px]',
          className,
        )}
        role="status"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gold-500 text-navy-950">
          <svg viewBox="0 0 24 24" className="size-4.5" fill="none" stroke="currentColor" strokeWidth="2.6">
            <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <div>
          <p className="font-display text-sm font-bold text-white sm:text-base">
            {already
              ? t('newsletter.alreadyTitle', "You're already on the list")
              : t('newsletter.successTitle', "You're on the list!")}
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-white/70">
            {already
              ? t(
                  'newsletter.alreadyBody',
                  'This address is already subscribed — nothing more to do.',
                )
              : t('newsletter.successBody', 'Watch your inbox for our next newsletter.')}
          </p>
        </div>
      </div>
    )
  }

  const copy = (
    <div className="min-w-0">
      <p
        data-eyebrow
        className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-gold-300 sm:text-[11px]"
      >
        <span aria-hidden="true" className="h-px w-6 bg-gold-500/60" />
        {t('newsletter.eyebrow', 'Newsletter')}
      </p>
      <h2 className="font-display mt-2 text-lg font-bold leading-snug text-white sm:text-xl">
        {t('newsletter.title', 'Matrimonial advice, straight to your inbox')}
      </h2>
      <p className="mt-1.5 max-w-md text-xs leading-relaxed text-white/70 sm:text-sm">
        {t(
          'newsletter.body',
          'Monthly success stories, marriage tips and community updates. No spam — unsubscribe any time.',
        )}
      </p>
    </div>
  )

  const form = (
    <form
      noValidate
      onSubmit={handleSubmit}
      className={cn(
        'flex flex-col gap-2.5 sm:flex-row',
        variant === 'card' ? 'w-full' : 'w-full max-w-md shrink-0',
      )}
    >
      <div className="relative min-w-0 flex-1">
        <Mail
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-4 my-auto size-4 text-gold-400"
        />
        <input
          type="email"
          name="newsletter_email"
          value={email}
          onChange={(event) => {
            setEmail(sanitizeEmail(event.target.value))
            if (error) setError(null)
          }}
          onPaste={(event) => {
            const clean = sanitizeEmail(event.clipboardData.getData('text'))
            event.preventDefault()
            setEmail(clean)
          }}
          maxLength={100}
          autoComplete="email"
          required
          aria-label={t('newsletter.emailLabel', 'Email address')}
          aria-invalid={Boolean(error)}
          placeholder={t('newsletter.placeholder', 'Enter your email address')}
          className={cn(
            'w-full rounded-full border bg-white/95 py-3 pl-11 pr-4 text-sm text-navy-900 shadow-xs outline-none transition',
            'placeholder:text-ink-400 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/40',
            error ? 'border-rose-400' : 'border-white/70',
          )}
        />
      </div>

      <button
        type="submit"
        disabled={mutation.isPending}
        className="group inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full bg-gradient-to-r from-gold-400 via-gold-500 to-gold-300 px-6 py-3 text-sm font-bold text-zinc-800 shadow-gold transition hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {mutation.isPending ? (
          <span className="flex items-center gap-2">
            <span className="size-4 animate-spin rounded-full border-2 border-zinc-800 border-t-transparent" />
            {t('newsletter.subscribing', 'Subscribing…')}
          </span>
        ) : (
          <>
            <span>{t('newsletter.cta', 'Subscribe')}</span>
            <Send
              aria-hidden="true"
              className="size-4 transition-transform duration-300 group-hover:translate-x-0.5"
            />
          </>
        )}
      </button>

      {error ? (
        <p role="alert" className="text-xs font-semibold text-rose-300 sm:col-span-full">
          {error}
        </p>
      ) : null}
    </form>
  )

  if (variant === 'card') {
    return (
      <div
        className={cn(
          'rounded-[1.5rem] border border-gold-500/25 bg-navy-pattern p-6 shadow-lift sm:p-8',
          className,
        )}
      >
        <div className="space-y-5">
          {copy}
          {form}
          <p className="text-[11px] leading-relaxed text-white/50">
            {t(
              'newsletter.privacyNote',
              'We only use your address for this mailing. We never share it.',
            )}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('rounded-[1.5rem] border border-gold-500/25 bg-navy-800/40 p-6 backdrop-blur-[2px] sm:p-7', className)}>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
        {copy}
        {form}
      </div>
    </div>
  )
}
