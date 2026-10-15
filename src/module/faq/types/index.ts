export interface FaqItem {
  faq_sort?: string | number | null
  faq_heading?: string | null
  faq_que?: string
  faq_ans?: string
  question?: string
  answer?: string
}

export interface FaqResponse {
  data: FaqItem[]
}

export interface GroupedFaqs {
  heading: string | null
  items: FaqItem[]
}
