/**
 * @file src/module/super-admin/components/ProfileAvatar.tsx
 * Round profile photograph used by every member and administrator list row.
 *
 * The panel needs a picture for the same person in several lists, so the
 * photograph, the initials fallback and the tone live in one component
 * instead of being re-marked up per page.
 */

import { cn } from 'cn'
import { RemoteImage } from './RemoteImage'

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg'
type AvatarTone = 'gold' | 'navy' | 'maroon'

interface ProfileAvatarProps {
  /** Absolute URL of the photograph, resolved from the API metadata. */
  src?: string | null
  /** Name the initials are taken from when there is no photograph. */
  name?: string | null
  alt?: string
  size?: AvatarSize
  tone?: AvatarTone
  className?: string
}

const SIZE_CLASSES: Record<AvatarSize, string> = {
  xs: 'size-6 text-[0.6rem]',
  sm: 'size-8 text-[0.68rem]',
  md: 'size-9 text-xs',
  lg: 'size-10 text-xs',
}

const TONE_CLASSES: Record<AvatarTone, string> = {
  gold: 'border border-gold-200 bg-gold-100 text-gold-900',
  navy: 'border border-navy-100 bg-navy-100 text-navy-900',
  maroon: 'border border-maroon-200 bg-maroon-50 text-maroon-600',
}

function initialOf(name?: string | null): string {
  const trimmed = name?.trim()
  return trimmed ? trimmed.charAt(0).toUpperCase() : '?'
}

export function ProfileAvatar({
  src,
  name,
  alt,
  size = 'md',
  tone = 'navy',
  className,
}: ProfileAvatarProps) {
  const label = alt ?? (name ? `${name} photograph` : 'Profile photograph')

  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden rounded-full font-bold',
        SIZE_CLASSES[size],
        TONE_CLASSES[tone],
        className,
      )}
    >
      <RemoteImage
        src={src}
        alt={label}
        className="size-full object-cover"
        fallback={<span aria-hidden>{initialOf(name)}</span>}
      />
    </span>
  )
}
