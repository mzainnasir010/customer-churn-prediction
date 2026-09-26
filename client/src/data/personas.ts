export const BASE: Record<string, any> = {
  gender: 'Female', SeniorCitizen: 0, Partner: 'No', Dependents: 'No', tenure: 3, PhoneService: 'Yes',
  MultipleLines: 'No', InternetService: 'Fiber optic', OnlineSecurity: 'No', OnlineBackup: 'No',
  DeviceProtection: 'No', TechSupport: 'No', StreamingTV: 'No', StreamingMovies: 'No',
  Contract: 'Month-to-month', PaperlessBilling: 'Yes', PaymentMethod: 'Electronic check',
  MonthlyCharges: 75, TotalCharges: '',
}

export const PERSONAS = [
  { id: 'new', label: 'New fiber customer', blurb: 'Month-to-month, 3 months in, pays by electronic check.', values: {} },
  { id: 'loyal', label: 'Loyal two-year customer', blurb: 'Five years in, full support bundle, pays automatically.',
    values: { gender: 'Male', Partner: 'Yes', Dependents: 'Yes', tenure: 60, MultipleLines: 'Yes', InternetService: 'DSL',
      OnlineSecurity: 'Yes', OnlineBackup: 'Yes', DeviceProtection: 'Yes', TechSupport: 'Yes', Contract: 'Two year',
      PaperlessBilling: 'No', PaymentMethod: 'Credit card (automatic)', MonthlyCharges: 60, TotalCharges: 3600 } },
  { id: 'mid', label: 'Mid-tenure DSL customer', blurb: 'One-year plan, 18 months in, streams TV, no support add-ons.',
    values: { tenure: 18, InternetService: 'DSL', StreamingTV: 'Yes', Contract: 'One year',
      PaymentMethod: 'Mailed check', MonthlyCharges: 55 } },
]