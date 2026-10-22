export interface QuickAnswer {
  q: string
  a: string
}

export interface EnquiryPayload {
  enquiryFullName: string
  enquiryEmail: string
  enquiryMobile: string
  enquiryService?: string
  enquiryMessage: string
  enquiryFrom?: string
  utm_medium?: string
  utm_source?: string
  utm_campaign?: string
}

export interface EnquiryResponse {
  status?: boolean | string
  message?: string
  data?: unknown
}
