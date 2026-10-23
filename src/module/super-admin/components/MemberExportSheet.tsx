/**
 * @file src/module/super-admin/components/MemberExportSheet.tsx
 * Print- and PDF-ready biodata sheet for one member.
 *
 * The panel's on-screen card is designed for a dark shell and a scrolling
 * viewport, neither of which belongs in a printed document. This sheet is
 * a light, fixed-width A4 composition rendered off-screen on the web page,
 * captured for the PDF download, and promoted to normal flow by the print
 * stylesheet.
 */

import { useState, type RefObject } from 'react'
import type { Member } from '../types'
import { formatDate, initials } from '../utils/format'
import { exportImageUrl } from '../utils/memberExport'
import { ProfileDetails } from './ProfileDetails'

interface MemberExportSheetProps {
  member: Member
  companyName?: string
  sheetRef: RefObject<HTMLDivElement | null>
}

export function MemberExportSheet({
  member,
  companyName = 'VivahSambandh',
  sheetRef,
}: MemberExportSheetProps) {
  const [generatedOn] = useState(() => formatDate(new Date().toISOString()))
  const photo = exportImageUrl(member.full_image || member.face_image)

  return (
    <article
      ref={sheetRef}
      aria-hidden="true"
      className="fixed top-0 left-[-10000px] z-[-1] w-[794px] bg-white p-10 font-sans text-ink-900 print:static print:top-auto print:left-auto print:z-auto print:w-full print:p-0"
    >
      <header className="flex items-start justify-between gap-6 border-b-2 border-gold-600 pb-4">
        <div>
          <p className="text-[0.62rem] font-bold tracking-[0.22em] text-gold-700 uppercase">
            {companyName}
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold text-navy-900">
            Matrimonial Biodata
          </h1>
          <p className="mt-1 text-xs font-semibold text-ink-500">
            Profile #{member.id} · {member.status}
          </p>
        </div>
        <div className="text-right text-[0.62rem] leading-relaxed text-ink-400">
          <p className="font-bold tracking-[0.14em] uppercase">Generated</p>
          <p className="font-semibold text-ink-600">{generatedOn}</p>
        </div>
      </header>

      <div className="mt-6 flex gap-6">
        {photo ? (
          <img
            src={photo}
            alt={`${member.name} photograph`}
            loading="eager"
            decoding="sync"
            className="h-52 w-40 shrink-0 rounded-2xl border border-cream-300 object-cover"
          />
        ) : (
          <div className="flex h-52 w-40 shrink-0 items-center justify-center rounded-2xl border border-cream-300 bg-cream-50 font-display text-5xl font-bold text-gold-700">
            {initials(member.name)}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h2 className="font-display text-3xl font-bold text-navy-900">{member.name}</h2>
          <p className="mt-1 text-sm font-semibold text-ink-500">
            {[member.gender, member.user_current_city].filter(Boolean).join(' · ') || '—'}
          </p>

          <div className="mt-3 flex flex-wrap gap-2 text-[0.68rem] font-semibold text-ink-600">
            <span className="rounded-full border border-gold-500/40 bg-gold-50 px-2.5 py-1">
              {member.status}
            </span>
            {member.register_date ? (
              <span className="rounded-full border border-cream-300 bg-cream-50 px-2.5 py-1">
                Registered {formatDate(member.register_date)}
              </span>
            ) : null}
            {member.contact_name ? (
              <span className="rounded-full border border-cream-300 bg-cream-50 px-2.5 py-1">
                Contact: {member.contact_name}
              </span>
            ) : null}
          </div>

          {member.user_summary ? (
            <p className="mt-3 text-xs leading-relaxed text-ink-500">{member.user_summary}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-7">
        <ProfileDetails member={member} variant="full" />
      </div>

      <footer className="mt-7 border-t border-cream-300 pt-3 text-[0.62rem] leading-relaxed text-ink-400">
        <p>
          This biodata is generated from the {companyName} member database for internal panel
          use. Profile #{member.id}
          {member.updated_at ? ` · Last updated ${formatDate(member.updated_at)}` : ''}
        </p>
      </footer>
    </article>
  )
}
