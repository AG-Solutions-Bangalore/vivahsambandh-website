/**
 * @file src/module/super-admin/pages/DashboardOverviewPage.tsx
 * Overview dashboard displaying aggregated metrics, recent registrations, and quick admin actions.
 */

import { useEffect, useState } from 'react'
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
  Server,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '../components/StatusBadge'
import { useSuperAdminAuth } from '../context/SuperAdminAuthContext'
import {
  fetchAdminMembers,
  fetchBlockProfiles,
  fetchFeedbacks,
  fetchMembers,
  fetchNotifications,
  fetchPendingAdminMembers,
  fetchPendingMembers,
} from '../services/adminApi'
import type { AdminMember, Member, NotificationRecord } from '../types'
import { API_BASE_URL } from '@/lib/api/apiClient'

export default function DashboardOverviewPage() {
  const { isDevSession } = useSuperAdminAuth()

  const [isLoading, setIsLoading] = useState(true)
  const [adminCount, setAdminCount] = useState(0)
  const [pendingAdminCount, setPendingAdminCount] = useState(0)
  const [memberCount, setMemberCount] = useState(0)
  const [pendingMemberCount, setPendingMemberCount] = useState(0)
  const [feedbackCount, setFeedbackCount] = useState(0)
  const [blockCount, setBlockCount] = useState(0)
  const [notificationCount, setNotificationCount] = useState(0)

  const [recentAdmins, setRecentAdmins] = useState<AdminMember[]>([])
  const [recentMembers, setRecentMembers] = useState<Member[]>([])
  const [recentNotifications, setRecentNotifications] = useState<NotificationRecord[]>([])

  const loadDashboardData = async () => {
    setIsLoading(true)
    try {
      const [
        adminsRes,
        pendingAdminsRes,
        membersRes,
        pendingMembersRes,
        feedbacksRes,
        blocksRes,
        notificationsRes,
      ] = await Promise.all([
        fetchAdminMembers(),
        fetchPendingAdminMembers(),
        fetchMembers(),
        fetchPendingMembers(),
        fetchFeedbacks(),
        fetchBlockProfiles(),
        fetchNotifications(),
      ])

      setAdminCount(adminsRes.data.length)
      setPendingAdminCount(pendingAdminsRes.data.length)
      setMemberCount(membersRes.data.length)
      setPendingMemberCount(pendingMembersRes.data.length)
      setFeedbackCount(feedbacksRes.data.length)
      setBlockCount(blocksRes.data.length)
      setNotificationCount(notificationsRes.data.length)

      setRecentAdmins(adminsRes.data.slice(0, 4))
      setRecentMembers(membersRes.data.slice(0, 4))
      setRecentNotifications(notificationsRes.data.slice(0, 3))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadDashboardData()
  }, [])

  const statCards = [
    {
      label: 'Admin Members',
      count: adminCount,
      icon: ShieldCheck,
      to: '/panel/admin-members',
      accent: 'text-navy-700 bg-navy-50 border-navy-200',
    },
    {
      label: 'Pending Admins',
      count: pendingAdminCount,
      icon: UserCheck,
      to: '/panel/pending-admin-members',
      accent: 'text-amber-700 bg-amber-50 border-amber-200',
      highlight: pendingAdminCount > 0,
    },
    {
      label: 'Total Members',
      count: memberCount,
      icon: Users,
      to: '/panel/members',
      accent: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    },
    {
      label: 'Pending Members',
      count: pendingMemberCount,
      icon: UserPlus,
      to: '/panel/pending-members',
      accent: 'text-purple-700 bg-purple-50 border-purple-200',
      highlight: pendingMemberCount > 0,
    },
    {
      label: 'Feedback Records',
      count: feedbackCount,
      icon: MessageSquare,
      to: '/panel/feedback',
      accent: 'text-blue-700 bg-blue-50 border-blue-200',
    },
    {
      label: 'Blocked Profiles',
      count: blockCount,
      icon: Ban,
      to: '/panel/block-profiles',
      accent: 'text-rose-700 bg-rose-50 border-rose-200',
    },
    {
      label: 'Notifications',
      count: notificationCount,
      icon: Bell,
      to: '/panel/notifications',
      accent: 'text-gold-700 bg-gold-50 border-gold-200',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-navy-900 via-navy-800 to-navy-900 p-6 text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
              VivahSambandh Control Center
            </h2>
            {isDevSession && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 border border-amber-400/40 px-2.5 py-0.5 text-[0.7rem] font-bold text-amber-300">
                <Sparkles className="size-3" />
                Dev Mode
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-cream-200/80">
            Real-time platform overview, moderation queues, and operational metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void loadDashboardData()}
            disabled={isLoading}
            className="rounded-full border-white/20 bg-white/10 text-white hover:bg-white/20 text-xs font-semibold cursor-pointer"
          >
            <RefreshCw className={`size-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Metrics</span>
          </Button>

          <Link to="/panel/notifications">
            <Button
              type="button"
              size="sm"
              className="rounded-full bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-300 text-navy-950 font-bold text-xs shadow-gold cursor-pointer"
            >
              <Bell className="size-3.5" />
              <span>Broadcast Alert</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <Link
              key={card.label}
              to={card.to}
              className="group relative overflow-hidden rounded-2xl border border-cream-200/90 bg-white p-5 shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between">
                <div className={`size-10 rounded-xl flex items-center justify-center border ${card.accent}`}>
                  <Icon className="size-5" />
                </div>
                {card.highlight && (
                  <span className="flex size-2 rounded-full bg-amber-500 animate-ping" />
                )}
              </div>

              <div className="mt-4">
                <p className="text-2xl font-black font-display text-navy-900 tracking-tight">
                  {isLoading ? '...' : card.count}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs font-semibold text-ink-500">
                    {card.label}
                  </span>
                  <ArrowRight className="size-3.5 text-ink-400 group-hover:text-gold-600 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Two Column Section: Recent Admin Activity & Recent Members */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Admin Members */}
        <div className="rounded-2xl border border-cream-200/90 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-cream-200 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4.5 text-navy-800" />
              <h3 className="text-sm font-bold font-display text-navy-900">
                Recent Admin Members
              </h3>
            </div>
            <Link
              to="/panel/admin-members"
              className="text-xs font-semibold text-gold-600 hover:text-gold-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="size-3" />
            </Link>
          </div>

          {recentAdmins.length === 0 ? (
            <div className="py-8 text-center text-xs text-ink-400">
              No admin records found.
            </div>
          ) : (
            <div className="space-y-3">
              {recentAdmins.map((admin) => (
                <div
                  key={admin.id}
                  className="flex items-center justify-between rounded-xl border border-cream-200/60 bg-cream-50/40 p-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-9 rounded-full bg-navy-100 text-navy-800 font-bold text-xs flex items-center justify-center shrink-0">
                      {admin.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-navy-900 truncate">
                        {admin.name}
                      </p>
                      <p className="text-[0.7rem] text-ink-400 truncate">
                        {admin.mobile} • {admin.user_current_city || 'City unassigned'}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={admin.status} size="sm" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Matrimonial Members */}
        <div className="rounded-2xl border border-cream-200/90 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-cream-200 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Users className="size-4.5 text-navy-800" />
              <h3 className="text-sm font-bold font-display text-navy-900">
                Recent Member Profiles
              </h3>
            </div>
            <Link
              to="/panel/members"
              className="text-xs font-semibold text-gold-600 hover:text-gold-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="size-3" />
            </Link>
          </div>

          {recentMembers.length === 0 ? (
            <div className="py-8 text-center text-xs text-ink-400">
              No member profiles found.
            </div>
          ) : (
            <div className="space-y-3">
              {recentMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-xl border border-cream-200/60 bg-cream-50/40 p-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-9 rounded-full bg-gold-100 text-gold-800 font-bold text-xs flex items-center justify-center shrink-0">
                      {member.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-navy-900 truncate">
                        {member.name} ({member.gender})
                      </p>
                      <p className="text-[0.7rem] text-ink-400 truncate">
                        {member.community_name || 'Community N/A'} • {member.user_current_city || 'City N/A'}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={member.status} size="sm" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Latest Broadcast Announcements */}
      <div className="rounded-2xl border border-cream-200/90 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-cream-200 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Bell className="size-4.5 text-navy-800" />
            <h3 className="text-sm font-bold font-display text-navy-900">
              Latest Broadcast Announcements
            </h3>
          </div>
          <Link
            to="/panel/notifications"
            className="text-xs font-semibold text-gold-600 hover:text-gold-700 flex items-center gap-1"
          >
            <span>Manage Notifications</span>
            <ArrowRight className="size-3" />
          </Link>
        </div>

        {recentNotifications.length === 0 ? (
          <div className="py-6 text-center text-xs text-ink-400">
            No broadcast notifications dispatched yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {recentNotifications.map((notif) => (
              <div
                key={notif.id}
                className="rounded-xl border border-cream-200/70 bg-cream-50/40 p-3.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span
                      className={`text-[0.68rem] px-2 py-0.5 rounded-full font-bold ${
                        notif.notification_for === 'Admin'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {notif.notification_for}
                    </span>
                    <span className="text-[0.68rem] text-ink-400">
                      {notif.notification_date}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-navy-900 line-clamp-1">
                    {notif.notification_heading}
                  </h4>
                  <p className="mt-1 text-[0.72rem] text-ink-500 line-clamp-2 leading-relaxed">
                    {notif.notification_message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* System Infrastructure Details Card */}
      <div className="rounded-2xl border border-cream-200/90 bg-white p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <Server className="size-4.5 text-navy-800" />
          <h3 className="text-sm font-bold font-display text-navy-900">
            System & API Endpoint Status
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="rounded-xl bg-cream-50/70 p-3 border border-cream-200/80">
            <span className="text-[0.68rem] uppercase font-bold text-ink-400">
              API Base URL
            </span>
            <p className="mt-1 font-mono text-[0.75rem] text-navy-900 break-all">
              {API_BASE_URL}
            </p>
          </div>

          <div className="rounded-xl bg-cream-50/70 p-3 border border-cream-200/80">
            <span className="text-[0.68rem] uppercase font-bold text-ink-400">
              Authentication Scheme
            </span>
            <p className="mt-1 font-semibold text-navy-900">
              Bearer Token (Laravel Sanctum/CRM)
            </p>
          </div>

          <div className="rounded-xl bg-cream-50/70 p-3 border border-cream-200/80">
            <span className="text-[0.68rem] uppercase font-bold text-ink-400">
              Active Mode
            </span>
            <p className="mt-1 font-semibold text-navy-900 flex items-center gap-1.5">
              <span className={`size-2 rounded-full ${isDevSession ? 'bg-amber-500' : 'bg-emerald-500'}`} />
              {isDevSession ? 'Development Preview' : 'Production Live'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
