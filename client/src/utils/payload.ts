import type { Customer } from '../types'

export const toPayload = (f: Record<string, any>): Customer => ({
  ...f,
  SeniorCitizen: Number(f.SeniorCitizen),
  tenure: Number(f.tenure),
  MonthlyCharges: Number(f.MonthlyCharges),
  TotalCharges: f.TotalCharges === '' || f.TotalCharges == null ? null : Number(f.TotalCharges),
})