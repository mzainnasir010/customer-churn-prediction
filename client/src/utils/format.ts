import type { Driver } from '../types'

export const pretty = (s: string) => {
  const t = s.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2')
  return t.charAt(0).toUpperCase() + t.slice(1)
}
export const driverLabel = (d: Driver) => `${pretty(d.feature)}: ${d.value}`
export const money = (n: number) => Math.round(n).toLocaleString()