import type { ImageUrlEntry } from '@/lib/api/types'

export interface CompanyData {
  company_name: string | null
  company_email: string | null
  company_gst: string | null
  company_pan_no: string | null
  company_mobile_no: string | null
  company_landline_no: string | null
  company_address: string | null
  company_place: string | null
  company_logo: string | null
}

export interface CompanyResponse {
  data: CompanyData
  image_url?: ImageUrlEntry[]
}
