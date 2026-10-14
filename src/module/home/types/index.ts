export interface CityProfile {
  name: string
  count: string
  image?: string
}

export interface WhyFeature {
  title: string
  icon?: string
}

export interface SuccessStory {
  quote: string
  name: string
  city: string
  image: string
}

export interface AppFeature {
  title: string
  desc: string
}

export interface FaqItem {
  q: string
  a: string
}

export interface ContactFormData {
  name: string
  email: string
  phone: string
  message: string
}
