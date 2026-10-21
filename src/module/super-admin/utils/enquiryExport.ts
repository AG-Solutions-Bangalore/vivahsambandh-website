/**
 * @file src/module/super-admin/utils/enquiryExport.ts
 * Report helpers for the enquiry module.
 *
 * The CRM exposes `GET /getEnquiryReport`, which answers with the flat
 * enquiry list as JSON — every row, no pagination and no server-side
 * filters. The report and the downloads are therefore built from that
 * response, with the panel's own filters applied to it.
 */

import type { EnquiryRecord, EnquiryStatus } from '../types'

/** The status buckets a report breaks down into. */
export const ENQUIRY_STATUSES: EnquiryStatus[] = [
  'Pending',
  'Processing',
  'Completed',
  'Cancel',
]

/** The columns the CSV export writes, in order. */
export const ENQUIRY_EXPORT_COLUMNS = [
  'ID',
  'Name',
  'Mobile',
  'Email',
  'Service',
  'Source',
  'Message',
  'Status',
  'UTM Medium',
  'UTM Source',
  'UTM Campaign',
] as const

/** Escapes a value for a CSV cell. */
function csvCell(value: string | number | null | undefined): string {
  return `"${String(value ?? '').replace(/"/g, '""')}"`
}

/** Builds the CSV body for a set of enquiries. */
export function enquiriesToCsv(rows: EnquiryRecord[]): string {
  const lines = [ENQUIRY_EXPORT_COLUMNS.map(csvCell).join(',')]

  for (const row of rows) {
    lines.push(
      [
        row.id,
        row.full_name,
        row.mobile,
        row.email,
        row.service,
        row.source,
        row.message,
        row.status,
        row.utm_medium,
        row.utm_source,
        row.utm_campaign,
      ]
        .map(csvCell)
        .join(','),
    )
  }

  return lines.join('\r\n')
}

/** Hands a file to the browser as a download. */
function downloadFile(content: string, filename: string, type: string): void {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

/** Downloads the enquiries as a CSV file. */
export function downloadEnquiriesCsv(rows: EnquiryRecord[]): void {
  // The BOM keeps Excel from reading UTF-8 names as mojibake.
  downloadFile(
    `\uFEFF${enquiriesToCsv(rows)}`,
    `enquiries-${new Date().toISOString().slice(0, 10)}.csv`,
    'text/csv;charset=utf-8;',
  )
}

/** Downloads the enquiries as a JSON file. */
export function downloadEnquiriesJson(rows: EnquiryRecord[]): void {
  downloadFile(
    JSON.stringify(rows, null, 2),
    `enquiries-${new Date().toISOString().slice(0, 10)}.json`,
    'application/json;charset=utf-8;',
  )
}

export interface EnquiryReportSummary {
  total: number
  byStatus: Array<{ status: EnquiryStatus; count: number }>
  bySource: Array<{ label: string; count: number }>
  byCampaign: Array<{ label: string; count: number }>
  byMedium: Array<{ label: string; count: number }>
}

/** Counts how often a value occurs, most frequent first. */
function tally(values: Array<string | null | undefined>): Array<{ label: string; count: number }> {
  const counts = new Map<string, number>()

  for (const value of values) {
    const label = (value ?? '').trim()
    if (!label) continue
    counts.set(label, (counts.get(label) ?? 0) + 1)
  }

  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
}

/** Builds the report figures from the enquiry rows. */
export function summariseEnquiries(rows: EnquiryRecord[]): EnquiryReportSummary {
  return {
    total: rows.length,
    byStatus: ENQUIRY_STATUSES.map((status) => ({
      status,
      count: rows.filter((row) => row.status === status).length,
    })),
    bySource: tally(rows.map((row) => row.source)),
    byCampaign: tally(rows.map((row) => row.utm_campaign)),
    byMedium: tally(rows.map((row) => row.utm_medium)),
  }
}
