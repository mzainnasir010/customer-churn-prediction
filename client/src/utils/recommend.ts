import type { Driver } from '../types'

const RULES: Record<string, string> = {
  Contract: 'Offer a discount or bonus to move the customer to a one-year plan.',
  tenure: 'Start onboarding check-ins and a welcome offer in the first months.',
  PaymentMethod: 'Offer a small bill credit for switching to automatic payment.',
  auto_pay: 'Offer a small bill credit for switching to automatic payment.',
  InternetService: 'Review fiber pricing and service quality with the customer.',
  MonthlyCharges: 'Offer plan right-sizing or a targeted price review.',
  has_security_support: 'Offer a free trial of security or tech support add-ons.',
  TechSupport: 'Offer a free trial of tech support.',
  OnlineSecurity: 'Offer a free trial of online security.',
}

export function recommend(drivers: Driver[]): string {
  const hit = drivers.find((d) => d.direction === 'increases risk' && RULES[d.feature])
  return hit ? RULES[hit.feature] : 'No urgent action. Keep monitoring this customer.'
}