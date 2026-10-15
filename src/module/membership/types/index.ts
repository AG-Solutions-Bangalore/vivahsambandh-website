export interface PlanFeature {
  text: string
  included: boolean
  highlight?: boolean
}

export interface MembershipPlan {
  id: string
  name: string
  tagline: string
  price: string
  duration: string
  badge?: string
  isPopular?: boolean
  features: PlanFeature[]
  ctaText: string
}

export interface ComparisonRow {
  feature: string
  silver: string
  gold: string
  platinum: string
}

export interface MembershipBenefitItem {
  icon: string
  title: string
  desc: string
}

export interface MembershipFaqItem {
  q: string
  a: string
}
