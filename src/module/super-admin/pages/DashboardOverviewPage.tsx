/**
 * @file src/module/super-admin/pages/DashboardOverviewPage.tsx
 * Overview dashboard displaying aggregated metrics, recent registrations, and quick admin actions.
 */

import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  ShieldCheck,
  UserCheck,
  UserPlus,
  MessageSquare,
  Ban,
  Bell,
  RefreshCw,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from 'cn'
import { StatusBadge } from '../components/StatusBadge'
import { PanelCard, PanelCardHeader } from '../components/PanelCard'
import { PanelPageHeader } from '../components/PanelPageHeader'
import { PanelListSkeleton, Skeleton, SkeletonText } from '../components/PanelSkeleton'
import { PanelError } from '../components/PanelState'
import { ProfileAvatar } from '../components/ProfileAvatar'
import { RemoteImage } from '../components/RemoteImage'
import { formatDate } from '../utils/format'
import { useDashboardOverview } from '../hook/useDashboardOverview'
import { errorMessage } from '../hook/errors'
import toast from 'react-hot-toast'

export default function DashboardOverviewPage() {
  const {
    adminCount,
    pendingAdminCount,
    memberCount,
    pendingMemberCount,
    feedbackCount,
    blockCount,
    notificationCount,
    recentAdmins,
    recentMembers,
    recentNotifications,
    isLoading,
    isFetching,
    error,
    failedCount,
    totalCount,
    refetch,
  } = useDashboardOverview()

  // Surface a partial-failure notice once per failure burst instead of
  // spamming a toast for every refetch.
  const reportedError = useRef<Error | null>(null)
  useEffect(() => {
    if (!error) {
      reportedError.current = null
      return
    }
    if (reportedError.current?.message === error.message) return
    reportedError.current = error
    toast.error(errorMessage(error, 'Some dashboard data could not be loaded.'))
  }, [error])

  /* Queues the admin has to work through — these carry the visual weight. */
  const attentionMetrics = [
    {
      label: 'Pending Admin Applications',
      count: pendingAdminCount,
      icon: UserCheck,
      to: '/crm/pending-admin-members',
      attention: true,
    },
    {
      label: 'Pending Member Profiles',
      count: pendingMemberCount,
      icon: UserPlus,
      to: '/crm/pending-members',
      attention: true,
    },
    {
      label: 'Total Members',
      count: memberCount,
      icon: Users,
      to: '/crm/members',
    },
    {
      label: 'Admin Members',
      count: adminCount,
      icon: ShieldCheck,
      to: '/crm/admin-members',
    },
  ]

  /* Everything else is context — one dense, scannable strip. */
  const contextMetrics = [
    {
      label: 'Blocked Profiles',
      count: blockCount,
      icon: Ban,
      to: '/crm/block-profiles',
      critical: blockCount > 0,
    },
    {
      label: 'Feedback',
      count: feedbackCount,
      icon: MessageSquare,
      to: '/crm/feedback',
    },
    {
      label: 'Broadcasts',
      count: notificationCount,
      icon: Bell,
      to: '/crm/notifications',
    },
  ]

  /* Every source failed — there is nothing trustworthy to render. */
  if (error && failedCount === totalCount && !isLoading) {
    return (
      <div className="space-y-6">
        <PanelPageHeader
          title="Dashboard Overview"
          description="Moderation queues, platform totals, and recent activity across every module."
        />
        <PanelCard flush>
          <PanelError
            title="Could not load the dashboard"
            message={errorMessage(error, 'The panel backend is unreachable right now.')}
            onRetry={() => void refetch()}
          />
        </PanelCard>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PanelPageHeader
        title="Dashboard Overview"
        description="Moderation queues, platform totals, and recent activity across every module."
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void refetch()}
              disabled={isFetching}
              className="cursor-pointer rounded-full border-cream-300 bg-white text-xs font-semibold hover:border-gold-500/60 hover:bg-cream-50"
            >
              <RefreshCw
                className={cn('size-3.5', isFetching && 'animate-spin')}
                aria-hidden
              />
              <span>Refresh</span>
            </Button>

            <Link to="/crm/notifications">
              <Button
                type="button"
                size="sm"
                className="cursor-pointer rounded-full bg-gold-600 text-xs font-bold text-white shadow-gold ring-1 ring-gold-500/40 ring-inset hover:bg-gold-700"
              >
                <Bell className="size-3.5" aria-hidden />
                <span>Broadcast</span>
              </Button>
            </Link>
          </>
        }
      />

      {/* Primary metrics — two queues that need a decision, two totals for scale */}
      <section aria-label="Primary metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="panel-card p-5">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="mt-4 h-9 w-14" />
              </div>
            ))
          : attentionMetrics.map((metric) => {
              const Icon = metric.icon
              const isAttention = metric.attention === true
              const isClear = metric.count === 0
              return (
                <Link
                  key={metric.label}
                  to={metric.to}
                  className={cn(
                    'group relative overflow-hidden rounded-[1.25rem] border p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:outline-none',
                    isAttention
                      ? isClear
                        ? 'border-cream-300 bg-white'
                        : 'border-gold-500/40 bg-gold-50'
                      : 'border-cream-300 bg-white',
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-[0.66rem] font-bold tracking-[0.14em] text-ink-500 uppercase">
                      {metric.label}
                    </span>
                    <span
                      className={cn(
                        'flex size-9 shrink-0 items-center justify-center rounded-xl transition-colors',
                        isAttention
                          ? isClear
                            ? 'bg-cream-100 text-ink-400'
                            : 'bg-gold-600 text-white'
                          : 'bg-navy-50 text-navy-700',
                      )}
                    >
                      <Icon className="size-4.5" aria-hidden />
                    </span>
                  </div>
                  <p className="mt-4 flex items-baseline gap-2">
                    <span className="font-display text-4xl font-bold tabular-nums text-navy-900">
                      {metric.count}
                    </span>
                    {isAttention ? (
                      <span className="text-xs font-medium text-ink-500">
                        awaiting review
                      </span>
                    ) : null}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-gold-700 transition-all group-hover:gap-1.5">
                    {isAttention ? 'Review queue' : 'Open list'}
                    <ArrowRight className="size-3.5" aria-hidden />
                  </span>
                </Link>
              )
            })}
      </section>

      {/* Platform totals — one dense, scannable strip */}
      <section
        aria-label="Platform totals"
        className="panel-card overflow-hidden px-5 py-4"
      >
        {isLoading ? (
          <div className="flex flex-wrap gap-x-10 gap-y-3">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-8 w-28" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
            {contextMetrics.map((metric) => {
              const Icon = metric.icon
              return (
                <Link
                  key={metric.label}
                  to={metric.to}
                  className="group flex items-center gap-2.5 focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:outline-none"
                >
                  <Icon
                    className={cn(
                      'size-4 shrink-0 transition-colors',
                      metric.critical ? 'text-maroon-500' : 'text-navy-400',
                      'group-hover:text-gold-600',
                    )}
                    aria-hidden
                  />
                  <span className="font-display text-lg font-bold tabular-nums text-navy-900">
                    {metric.count}
                  </span>
                  <span className="text-xs font-medium text-ink-500 transition-colors group-hover:text-navy-900">
                    {metric.label}
                  </span>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      {/* Recent activity */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        <PanelCard>
          <PanelCardHeader
            title="Recent Admin Members"
            icon={<ShieldCheck className="size-4" />}
            action={
              <Link
                to="/crm/admin-members"
                className="flex items-center gap-1 text-xs font-semibold text-gold-700 transition-colors hover:text-gold-600"
              >
                <span>View All</span>
                <ArrowRight className="size-3" aria-hidden />
              </Link>
            }
          />

          {isLoading ? (
            <PanelListSkeleton rows={4} />
          ) : recentAdmins.length === 0 ? (
            <p className="py-8 text-center text-xs text-ink-400">
              No admin records found.
            </p>
          ) : (
            <ul className="space-y-2.5">
              {recentAdmins.map((admin) => (
                <li
                  key={admin.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-cream-300/70 bg-cream-50/60 p-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <ProfileAvatar
                      src={admin.face_image}
                      name={admin.name}
                      size="md"
                      tone="navy"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-navy-900">
                        {admin.name}
                      </p>
                      <p className="truncate text-[0.7rem] text-ink-400">
                        {admin.mobile || 'No mobile'} &middot;{' '}
                        {admin.user_current_city || 'City unassigned'}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={admin.status} size="sm" />
                </li>
              ))}
            </ul>
          )}
        </PanelCard>

        <PanelCard>
          <PanelCardHeader
            title="Recent Member Profiles"
            icon={<Users className="size-4" />}
            action={
              <Link
                to="/crm/members"
                className="flex items-center gap-1 text-xs font-semibold text-gold-700 transition-colors hover:text-gold-600"
              >
                <span>View All</span>
                <ArrowRight className="size-3" aria-hidden />
              </Link>
            }
          />

          {isLoading ? (
            <PanelListSkeleton rows={4} />
          ) : recentMembers.length === 0 ? (
            <p className="py-8 text-center text-xs text-ink-400">
              No member profiles found.
            </p>
          ) : (
            <ul className="space-y-2.5">
              {recentMembers.map((member) => (
                <li
                  key={member.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-cream-300/70 bg-cream-50/60 p-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <ProfileAvatar
                      src={member.face_image}
                      name={member.name}
                      size="md"
                      tone="gold"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-navy-900">
                        {member.name} ({member.gender})
                      </p>
                      <p className="truncate text-[0.7rem] text-ink-400">
                        {member.community_name || 'Community N/A'} &middot;{' '}
                        {member.user_current_city || 'City N/A'}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={member.status} size="sm" />
                </li>
              ))}
            </ul>
          )}
        </PanelCard>
      </div>

      {/* Latest Broadcast Announcements */}
      <PanelCard>
        <PanelCardHeader
          title="Latest Broadcast Announcements"
          icon={<Bell className="size-4" />}
          action={
            <Link
              to="/crm/notifications"
              className="flex items-center gap-1 text-xs font-semibold text-gold-700 transition-colors hover:text-gold-600"
            >
              <span>Manage</span>
              <ArrowRight className="size-3" aria-hidden />
            </Link>
          }
        />

        {isLoading ? (
          <div className="space-y-2.5">
            {Array.from({ length: 3 }, (_, index) => (
              <div
                key={index}
                className="rounded-xl border border-cream-300/70 bg-cream-50/60 p-3.5"
              >
                <Skeleton className="h-4 w-16 rounded-full" />
                <Skeleton className="mt-3 h-3 w-1/3" />
                <SkeletonText lines={2} className="mt-2" />
              </div>
            ))}
          </div>
        ) : recentNotifications.length === 0 ? (
          <p className="py-8 text-center text-xs text-ink-400">
            No broadcast notifications dispatched yet.
          </p>
        ) : (
          <ul className="divide-y divide-cream-200/80">
            {recentNotifications.map((notif) => (
              <li
                key={notif.id}
                className="flex flex-wrap items-start gap-x-4 gap-y-2 py-3 first:pt-0 last:pb-0"
              >
                <span
                  className={cn(
                    'shrink-0 rounded-full px-2 py-0.5 text-[0.66rem] font-bold',
                    notif.notification_for === 'Admin'
                      ? 'bg-navy-100 text-navy-800'
                      : 'bg-gold-100 text-gold-800',
                  )}
                >
                  {notif.notification_for}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-navy-900">
                    {notif.notification_heading}
                  </p>
                  <p className="mt-0.5 text-[0.72rem] leading-relaxed text-ink-500">
                    {notif.notification_message}
                  </p>
                </div>
                {notif.notification_image ? (
                  <a
                    href={notif.notification_image}
                    target="_blank"
                    rel="noreferrer"
                    title="Open the attachment in a new tab"
                    className="shrink-0 overflow-hidden rounded-lg"
                  >
                    <RemoteImage
                      src={notif.notification_image}
                      alt={notif.notification_image_name ?? 'Notification attachment'}
                      className="size-10 rounded-lg border border-cream-300 object-cover"
                    />
                  </a>
                ) : null}
                <span className="shrink-0 text-[0.68rem] text-ink-400">
                  {formatDate(notif.notification_date)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </PanelCard>
    </div>
  )
}
