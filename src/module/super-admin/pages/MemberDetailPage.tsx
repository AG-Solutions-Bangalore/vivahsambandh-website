/**
 * @file src/module/super-admin/pages/MemberDetailPage.tsx
 * Full-page biodata view for a matrimonial member or a pending applicant.
 *
 * The directory and moderation queues send only a record id here, so the page
 * calls `GET /member/{id}` for the complete profile instead of filtering the
 * list response. That endpoint also serves pending records, which keeps both
 * queues on one code path. Print and PDF actions export the same A4 sheet.
 */

import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Download, Loader2, Printer, UserRoundX } from 'lucide-react'
import { useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useCompanyDetails } from '@/module/company'
import { MemberExportSheet } from '../components/MemberExportSheet'
import { PanelCard } from '../components/PanelCard'
import { PanelPageHeader } from '../components/PanelPageHeader'
import { PanelEmpty, PanelError } from '../components/PanelState'
import { Skeleton } from '../components/PanelSkeleton'
import { ProfileDetails } from '../components/ProfileDetails'
import { RemoteImage } from '../components/RemoteImage'
import { StatusBadge } from '../components/StatusBadge'
import { errorMessage, unwrapItem } from '../hook/errors'
import { PANEL_STALE_TIME, superAdminKeys } from '../hook/queryKeys'
import { fetchMemberById } from '../services/adminApi'
import { downloadMemberPdf, printMemberSheet } from '../utils/memberExport'
import { formatDate, initials } from '../utils/format'

interface MemberDetailPageProps {
  /** Keeps the back link on the pending queue instead of the directory. */
  pending?: boolean
}

export default function MemberDetailPage({ pending = false }: MemberDetailPageProps) {
  const navigate = useNavigate()
  const { id } = useParams()
  const memberId = Number(id)
  const isValidId = Number.isInteger(memberId) && memberId > 0
  const listPath = pending ? '/crm/pending-members' : '/crm/members'
  const { name: companyName } = useCompanyDetails()
  const exportRef = useRef<HTMLDivElement>(null)
  const [exporting, setExporting] = useState(false)

  const { data: member, isLoading, error, refetch } = useQuery({
    queryKey: superAdminKeys.member(memberId),
    queryFn: async () => unwrapItem(await fetchMemberById(memberId)),
    enabled: isValidId,
    staleTime: PANEL_STALE_TIME,
  })

  const handlePrint = async () => {
    if (!exportRef.current) {
      window.print()
      return
    }
    try {
      await printMemberSheet(exportRef.current)
    } catch {
      window.print()
    }
  }

  const handleDownloadPdf = async () => {
    if (!member || !exportRef.current || exporting) return
    setExporting(true)
    try {
      const result = await downloadMemberPdf(exportRef.current, member)
      if (result === 'print-fallback') {
        toast('The photo cannot be embedded on this domain. Choose "Save as PDF" in the print dialog.')
      } else {
        toast.success('Biodata PDF downloaded.')
      }
    } catch (err) {
      console.error('[super-admin] member PDF export failed:', err)
      toast.error('Could not generate the PDF. Use Print and choose "Save as PDF".')
    } finally {
      setExporting(false)
    }
  }

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
      <div className="space-y-6 print:hidden">
        {backButton}

        <PanelPageHeader
          title={member.name}
          description={summary}
          chip={<StatusBadge status={member.status} />}
          actions={
            <>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => void handlePrint()}
                className="cursor-pointer rounded-full border-cream-300 text-xs font-semibold"
              >
                <Printer className="size-3.5" aria-hidden />
                <span>Print</span>
              </Button>

              <Button
                type="button"
                size="sm"
                onClick={() => void handleDownloadPdf()}
                disabled={exporting}
                className="cursor-pointer rounded-full text-xs font-semibold"
              >
                {exporting ? (
                  <Loader2 className="size-3.5 animate-spin" aria-hidden />
                ) : (
                  <Download className="size-3.5" aria-hidden />
                )}
                <span>{exporting ? 'Preparing…' : 'Download PDF'}</span>
              </Button>
            </>
          }
        />

        <PanelCard>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,15rem)_1fr]">
            <figure className="space-y-2">
              <RemoteImage
                src={member.full_image || member.face_image}
                alt={`${member.name} photograph`}
                className="aspect-[3/4] w-full rounded-2xl border border-cream-300 bg-cream-100 object-cover"
                fallback={
                  <span className="flex aspect-[3/4] w-full items-center justify-center rounded-2xl border border-cream-300 bg-cream-100 font-display text-5xl font-bold text-gold-700">
                    {initials(member.name)}
                  </span>
                }
              />
              <figcaption className="truncate text-center text-[0.68rem] text-ink-400">
                {member.face_image_name || member.full_image_name || 'No photograph on file'}
              </figcaption>
            </figure>

            <div className="min-w-0">
              <ProfileDetails member={member} variant="full" />
            </div>
          </div>
        </PanelCard>
      </div>

      <MemberExportSheet
        member={member}
        companyName={companyName || undefined}
        sheetRef={exportRef}
      />
    </div>
  )
}
