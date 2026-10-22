/**
 * @file src/module/super-admin/components/ProfileDetails.tsx
 * Biodata detail grid shared by the member directory and the moderation queue.
 *
 * Every field here is one the CRM API actually returns for a member profile —
 * nothing renders a row of dashes for data the backend never sends.
 */

import { Briefcase, GraduationCap, Phone, User } from 'lucide-react'
import type { ReactNode } from 'react'
import type { Member } from '../types'
import { formatDate } from '../utils/format'

interface DetailField {
  label: string
  value: string
}

interface DetailSection {
  title: string
  icon: ReactNode
  fields: DetailField[]
}

function DetailSectionBlock({ title, icon, fields }: DetailSection) {
  const visible = fields.filter((field) => field.value && field.value !== '—')
  if (visible.length === 0) return null

  return (
    <section>
      <h4 className="mb-2 flex items-center gap-1.5 text-[0.7rem] font-bold tracking-[0.14em] text-gold-700 uppercase">
        {icon}
        {title}
      </h4>
      <div className="grid grid-cols-2 gap-3 rounded-2xl border border-cream-300/80 bg-cream-50/70 p-4 sm:grid-cols-3">
        {visible.map((field) => (
          <div key={field.label}>
            <span className="block text-[0.68rem] text-ink-400">{field.label}</span>
            <span className="font-semibold break-words text-navy-900">
              {field.value}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}

interface ProfileDetailsProps {
  member: Member
  /** Full variant adds the contact section used by the directory. */
  variant?: 'full' | 'basic'
}

export function ProfileDetails({ member, variant = 'basic' }: ProfileDetailsProps) {
  const height =
    member.height_feet != null && member.height_feet !== ''
      ? `${member.height_feet}' ${member.height_inch || 0}"`
      : '—'

  const personal: DetailSection = {
    title: 'Personal Information',
    icon: <User className="size-3.5" aria-hidden />,
    fields: [
      { label: 'Date of Birth', value: formatDate(member.date_of_birth) },
      { label: 'Height', value: height },
      { label: 'Community', value: member.community_name || '—' },
      { label: 'Gotra', value: member.gotra_name || '—' },
      {
        label: 'Marital History',
        value:
          member.married_before && member.married_before !== 'No'
            ? member.married_before
            : 'Never Married',
      },
      { label: 'Physical Disability', value: member.physical_disablity || '—' },
      {
        label: 'Marry In Community',
        value:
          member.marry_in_community || member.marry_multi_community || '—',
      },
      { label: 'Registered On', value: formatDate(member.register_date) },
    ],
  }

  const career: DetailSection = {
    title: 'Education & Profession',
    icon: <GraduationCap className="size-3.5" aria-hidden />,
    fields: [
      { label: 'Education Qualification', value: member.education_name || '—' },
      { label: 'Profession', value: member.profession_name || '—' },
      { label: 'Current City', value: member.user_current_city || '—' },
    ],
  }

  const contact: DetailSection = {
    title: 'Contact Details',
    icon: <Phone className="size-3.5" aria-hidden />,
    fields: [
      { label: 'Mobile', value: member.mobile || '—' },
      { label: 'Contact Name', value: member.contact_name || '—' },
    ],
  }

  const sections =
    variant === 'full'
      ? [personal, career, contact]
      : [personal, { ...career, icon: <Briefcase className="size-3.5" aria-hidden /> }]

  return (
    <div className="space-y-5">
      {sections.map((section) => (
        <DetailSectionBlock
          key={section.title}
          title={section.title}
          icon={section.icon}
          fields={section.fields}
        />
      ))}
    </div>
  )
}
