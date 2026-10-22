/**
 * @file src/module/super-admin/pages/MemberDetailPage.tsx
 * Full-page biodata view for a matrimonial member or a pending applicant.
 *
 * The list rows keep only the record id and route here, so the whole profile —
 * photograph, personal details, education, profession and contact — can be
 * read without opening a modal. The record is resolved from the same list
 * endpoint the directory uses, which keeps caching and invalidation shared.
 */

import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, UserRoundX } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { PanelCard } from '../components/PanelCard'
import { PanelPageHeader } from '../components/PanelPageHeader'
import { PanelEmpty, PanelError } from '../components/PanelState'
import { Skeleton } from '../components/PanelSkeleton'
import { ProfileDetails } from '../components/ProfileDetails'
import { RemoteImage } from '../components/RemoteImage'
import { StatusBadge } from '../components/StatusBadge'
import { errorMessage, unwrapList } from '../hook/errors'
import { PANEL_STALE_TIME, superAdminKeys } from '../hook/queryKeys'
import { fetchMembers, fetchPendingMembers } from '../services/adminApi'
import { formatDate, initials } from '../utils/format'

interface MemberDetailPageProps {
  /** Resolves the record from the pending queue instead of the directory. */
  pending?: boolean
}

export default function MemberDetailPage({ pending = false }: MemberDetailPageProps) {
  const navigate = useNavigate()
  const { id } = useParams()
  const memberId = Number(id)
  const listPath = pending ? '/panel/pending-members' : '/panel/members'

  const { data: member, isLoading, error, refetch } = useQuery({
    queryKey: [
      ...(pending ? superAdminKeys.pendingMembers : superAdminKeys.members),
      'detail',
      memberId,
    ],
    queryFn: async () => {
      const records = unwrapList(
        await (pending ? fetchPendingMembers() : fetchMembers()),
      )
      return records.find((record) => record.id === memberId) ?? null
    },
    staleTime: PANEL_STALE_TIME,
  })

  const backButton = (
    <Button
      type="button"
      size="sm"
      variant="outline"
      onClick={() => navigate(listPath)}
      className="w-fit cursor-pointer gap-1.5 rounded-full border-cream-300 text-xs font-semibold text-ink-700 hover:bg-cream-100"
    >
      <ArrowLeft className="size-3.5" aria-hidden />
      Back to list
    </Button>
  )

  if (isLoading) {
    return (
      <div className="space-y-6">
        {backButton}
        <PanelCard>
          <div className="flex flex-col gap-6 sm:flex-row">
            <Skeleton className="aspect-[3/4] w-full rounded-2xl sm:w-56" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-24 w-full rounded-2xl" />
              <Skeleton className="h-24 w-full rounded-2xl" />
            </div>
          </div>
        </PanelCard>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        {backButton}
        <PanelCard>
          <PanelError
            title="Could not load this profile"
            message={errorMessage(error, 'The member record could not be loaded.')}
            onRetry={() => refetch()}
          />
        </PanelCard>
      </div>
    )
  }

  if (!member) {
    return (
      <div className="space-y-6">
        {backButton}
        <PanelCard>
          <PanelEmpty
            icon={<UserRoundX className="size-6" aria-hidden />}
            title="Profile not found"
            description="This member may have been removed or moved out of the current queue."
            action={backButton}
          />
        </PanelCard>
      </div>
    )
  }

  const summary = [
    `Profile #${member.id}`,
    member.gender || 'Gender not set',
    member.register_date ? `Registered ${formatDate(member.register_date)}` : null,
  ]
    .filter(Boolean)
    .join(' • ')

  return (
    <div className="space-y-6">
      {backButton}

      <PanelPageHeader
        title={member.name}
        description={summary}
        chip={<StatusBadge status={member.status} />}
      />

      <PanelCard>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,15rem)_1fr]">
          <figure className="space-y-2">
            <RemoteImage
              src={member.face_image}
              alt={`${member.name} photograph`}
              className="aspect-[3/4] w-full rounded-2xl border border-cream-300 bg-cream-100 object-cover"
              fallback={
                <span className="flex aspect-[3/4] w-full items-center justify-center rounded-2xl border border-cream-300 bg-cream-100 font-display text-5xl font-bold text-gold-700">
                  {initials(member.name)}
                </span>
              }
            />
            <figcaption className="truncate text-center text-[0.68rem] text-ink-400">
              {member.face_image_name || 'No photograph on file'}
            </figcaption>
          </figure>

          <div className="min-w-0">
            <ProfileDetails member={member} variant="full" />
          </div>
        </div>
      </PanelCard>
    </div>
  )
}
