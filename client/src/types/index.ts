export type Options = Record<string, (string | number)[]>
export type Customer = Record<string, string | number | null>
export interface Driver { feature: string; value: string; contribution: number; direction: 'increases risk' | 'decreases risk' }
export interface Prediction { churn_probability: number; at_risk: boolean; risk_tier: 'Low' | 'Medium' | 'High'; threshold: number; top_drivers: Driver[] }
export interface ModelInfo {
  model: string; decision_threshold: number; input_features: number
  risk_tiers: Record<string, string>; test_set_evaluation: Record<string, Record<string, number>> | null
}