/**
 * @file src/module/super-admin/components/ProfileDetails.tsx
 * Biodata detail grid shared by the member directory and the moderation queue.
 *
 * Every field here is one the CRM API actually returns for a member profile —
 * nothing renders a row of dashes for data the backend never sends. The full
 * variant is fed by `GET /member/{id}`, which sends the family, address and
 * preference fields the list endpoints omit.
 */

import {
  Briefcase,
  ClipboardList,
  FileText,
  GraduationCap,
  HeartHandshake,
  Phone,
  User,
  Users,
} from 'lucide-react'
import type { ReactNode } from 'react'
import type { Member } from '../types'
import { formatDate } from '../utils/format'

interface DetailField {
  label: string
  value: string
  /** Spans the full grid width for long-form values like addresses. */
  wide?: boolean
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
    <section className="break-inside-avoid">
      <h4 className="mb-2 flex items-center gap-1.5 text-[0.7rem] font-bold tracking-[0.14em] text-gold-700 uppercase">
        {icon}
        {title}
      </h4>
      <div className="grid grid-cols-2 gap-3 rounded-2xl border border-cream-300/80 bg-cream-50/70 p-4 sm:grid-cols-3">
        {visible.map((field) => (
          <div
            key={field.label}
            className={field.wide ? 'col-span-2 sm:col-span-3' : undefined}
          >
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
  /** Full variant adds family, preferences and contact sections. */
  variant?: 'full' | 'basic'
}

export function ProfileDetails({ member, variant = 'basic' }: ProfileDetailsProps) {
  const feet = Number(member.height_feet)
  const inches = Number(member.height_inch)
  const height =
    Number.isFinite(feet) && feet > 0
      ? `${feet}' ${Number.isFinite(inches) ? inches : 0}"`
      : '—'

  const source = member.created_by
    ? member.created_by.charAt(0).toUpperCase() + member.created_by.slice(1)
    : '—'

  const personal: DetailSection = {
    title: 'Personal Information',
    icon: <User className="size-3.5" aria-hidden />,
    fields: [
      { label: 'Date of Birth', value: formatDate(member.date_of_birth) },
      { label: 'Time of Birth', value: member.time_of_birth || '—' },
      { label: 'Place of Birth', value: member.place_of_birth || '—' },
      { label: 'Height', value: height },
      { label: 'Gender', value: member.gender || '—' },
      {
        label: 'Marital History',
        value:
          member.married_before && member.married_before !== 'No'
            ? member.married_before
            : 'Never Married',
      },
      { label: 'Divorce Status', value: member.divorce_status || '—' },
      {
        label: 'Children from Prior Marriage',
        value: member.children_from_prior_marriage || '—',
      },
      { label: 'Physical Disability', value: member.physical_disablity || '—' },
    ],
  }

  const community: DetailSection = {
    title: 'Community & Partner Preferences',
    icon: <HeartHandshake className="size-3.5" aria-hidden />,
    fields: [
      { label: 'Community', value: member.community_name || '—' },
      { label: 'Gotra', value: member.gotra_name || '—' },
      {
        label: 'Marry in Community',
        value: member.marry_multi_community || member.marry_in_community || '—',
      },
      { label: 'Manglik', value: member.is_manglik || '—' },
      { label: 'Will Marry Same Gotra', value: member.will_marry_same_gotra || '—' },
      { label: 'Will Marry Manglik', value: member.will_marry_manglik || '—' },
    ],
  }

  const career: DetailSection = {
    title: 'Education & Profession',
    icon: <GraduationCap className="size-3.5" aria-hidden />,
    fields: [
      { label: 'Education Qualification', value: member.education_name || '—' },
      { label: 'Profession', value: member.profession_name || '—' },
      { label: 'Company', value: member.company_name || '—' },
      { label: 'Company Type', value: member.company_type || '—' },
      { label: 'Annual Income', value: member.annual_income || '—' },
      { label: 'Current City', value: member.user_current_city || '—' },
      { label: 'Other Cities', value: member.multiple_city || '—' },
    ],
  }

  const family: DetailSection = {
    title: 'Family Details',
    icon: <Users className="size-3.5" aria-hidden />,
    fields: [
      { label: "Father's Name", value: member.father_name || '—' },
      { label: "Mother's Name", value: member.mother_name || '—' },
      { label: 'Married Brothers', value: member.brother_married || '—' },
      { label: 'Unmarried Brothers', value: member.brother_un_married || '—' },
      { label: 'Married Sisters', value: member.sister_married || '—' },
      { label: 'Unmarried Sisters', value: member.sister_un_married || '—' },
      { label: 'Children Living With', value: member.children_with || '—' },
    ],
  }

  const contact: DetailSection = {
    title: 'Contact Details',
    icon: <Phone className="size-3.5" aria-hidden />,
    fields: [
      { label: 'Mobile', value: member.mobile || '—' },
      { label: 'Alternate Mobile', value: member.alternate_mobile_no || '—' },
      { label: 'Contact Name', value: member.contact_name || '—' },
      {
        label: 'Alternate Contact Name',
        value: member.alternate_contact_name || '—',
      },
      { label: 'Email', value: member.email || '—' },
      { label: 'House Type', value: member.house_type || '—' },
      { label: 'Address', value: member.user_address || '—', wide: true },
    ],
  }

  const about: DetailSection = {
    title: 'About the Member',
    icon: <FileText className="size-3.5" aria-hidden />,
    fields: [
      { label: 'Summary', value: member.user_summary || '—', wide: true },
      { label: 'Remarks', value: member.remarks || '—', wide: true },
    ],
  }

  const record: DetailSection = {
    title: 'Record Information',
    icon: <ClipboardList className="size-3.5" aria-hidden />,
    fields: [
      { label: 'Profile ID', value: String(member.id) },
      { label: 'Status', value: member.status },
      { label: 'Registered On', value: formatDate(member.register_date) },
      { label: 'Source', value: source },
      { label: 'Created On', value: formatDate(member.created_at) },
      { label: 'Last Updated', value: formatDate(member.updated_at) },
      { label: 'Updated By', value: member.updated_by || '—' },
    ],
  }

  const sections =
    variant === 'full'
      ? [personal, community, career, family, contact, about, record]
      : [
          personal,
          { ...career, icon: <Briefcase className="size-3.5" aria-hidden /> },
        ]

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
