export const REPO_URL = 'https://github.com/mzainnasir010/customer-churn-prediction'

export const DATASET = { customers: 7043, features: 21, churners: 1869, churnRate: 26.5 }

export const FINAL = {
  model: 'XGBoost', cvAuc: 0.8502, testAuc: 0.848, threshold: 0.17, testSize: 1409,
  tuned: { accuracy: 0.681, precision: 0.449, recall: 0.885, f1: 0.596 },
  default: { accuracy: 0.802, precision: 0.664, recall: 0.513, f1: 0.579 },
  confusion: { tn: 629, fp: 406, fn: 43, tp: 331 },
}

export const COMPARISON = [
  { label: 'Gradient Boosting', auc: 0.847, recall: 0.793 },
  { label: 'Logistic Regression', auc: 0.846, recall: 0.795 },
  { label: 'Random Forest', auc: 0.846, recall: 0.734 },
  { label: 'XGBoost', auc: 0.843, recall: 0.783 },
  { label: 'Decision Tree (depth-limited)', auc: 0.828, recall: 0.788 },
]

export const TUNED = [
  { label: 'XGBoost (final)', value: 0.8502 },
  { label: 'Gradient Boosting', value: 0.8499 },
  { label: 'Random Forest', value: 0.8481 },
  { label: 'Logistic Regression (untuned baseline)', value: 0.846 },
]

// mean |SHAP| on the test set; sign = direction of effect on churn
export const SHAP = [
  { label: 'Contract: month-to-month', value: 0.619, sub: 'raises churn' },
  { label: 'Tenure', value: -0.317, sub: 'longer tenure lowers churn' },
  { label: 'Internet: fiber optic', value: 0.251, sub: 'raises churn' },
  { label: 'Payment: electronic check', value: 0.191, sub: 'raises churn' },
  { label: 'Monthly charges', value: 0.173, sub: 'raises churn' },
  { label: 'Contract: two year', value: -0.159, sub: 'lowers churn' },
  { label: 'Internet: none', value: -0.146, sub: 'lowers churn' },
  { label: 'Paperless billing', value: 0.125, sub: 'raises churn' },
  { label: 'Security or tech support', value: -0.107, sub: 'lowers churn' },
  { label: 'Total charges', value: -0.098, sub: 'lowers churn' },
]

export const PIPELINE = [
  { title: 'Start with real customers', stat: '7,043', text: 'IBM Telco Customer Churn: 21 columns, 26.5% churn, so the classes are imbalanced.' },
  { title: 'Clean and explore', stat: '11 fixes', text: 'Blank TotalCharges repaired, redundant categories merged, leakage checked. Contract, tenure, internet service and payment method dominate.' },
  { title: 'Engineer features', stat: '4 new', text: 'Add-on count, security or support flag, auto-pay flag and tenure bands, all derived from the EDA.' },
  { title: 'Split before fitting', stat: '5,634 / 1,409', text: 'Stratified 80/20 split. The test set stays locked until the final evaluation.' },
  { title: 'Compare fairly', stat: '5 models', text: 'Same folds, same seed, 5-fold CV. The top four tie on ROC-AUC (0.843 to 0.847).' },
  { title: 'Tune and select', stat: '0.850', text: 'XGBoost wins narrowly after randomized search, by cross-validated ROC-AUC.' },
  { title: 'Set the threshold', stat: '0.17', text: 'Tuned for recall (F2) on out-of-fold data. The default 0.50 caught only 51% of churners.' },
  { title: 'Evaluate once', stat: '88.5% recall', text: 'On 1,409 unseen customers: 331 of 374 churners caught, at the cost of 406 false alarms.' },
  { title: 'Explain', stat: 'Contract #1', text: 'SHAP shows month-to-month contracts as the strongest churn driver, about twice tenure.' },
]

export const CHURN_BASE = 26.5
export const INSIGHTS = [
  { id: 'contract', title: 'Contract type', takeaway: 'Month-to-month customers churn at about 43%, versus about 3% on two-year contracts.',
    items: [{ label: 'Month-to-month', value: 43 }, { label: 'One year', value: 11 }, { label: 'Two year', value: 3 }] },
  { id: 'tenure', title: 'Customer tenure', takeaway: 'Nearly half of customers in their first year leave; risk falls steadily with tenure.',
    items: [{ label: '0-12 months', value: 47.4 }, { label: '13-24', value: 28.7 }, { label: '25-48', value: 20.4 }, { label: '49-72', value: 9.5 }] },
  { id: 'internet', title: 'Internet service', takeaway: 'Fiber optic customers churn at more than twice the DSL rate.',
    items: [{ label: 'Fiber optic', value: 42 }, { label: 'DSL', value: 19 }, { label: 'No internet', value: 7 }] },
  { id: 'payment', title: 'Payment method', takeaway: 'Electronic check payers churn at nearly three times the rate of automatic payers.',
    items: [{ label: 'Electronic check', value: 45 }, { label: 'Mailed check', value: 19 }, { label: 'Bank transfer (auto)', value: 17 }, { label: 'Credit card (auto)', value: 15 }] },
  { id: 'addons', title: 'Add-on services', takeaway: 'Risk peaks at one add-on and falls as customers take more. The zero group is low because it includes customers with no internet service.',
    items: [0, 1, 2, 3, 4, 5, 6].map((n, i) => ({ label: `${n} add-ons`, value: [21.4, 45.8, 35.8, 27.4, 22.3, 12.4, 5.3][i] })) },
  { id: 'support', title: 'Security or tech support', takeaway: 'Customers with either service churn at roughly half the rate of those without.',
    items: [{ label: 'Neither service', value: 33.4 }, { label: 'Has security or support', value: 17.1 }] },
  { id: 'autopay', title: 'Automatic payment', takeaway: 'Paying automatically roughly halves churn (16% vs 35%).',
    items: [{ label: 'Manual payment', value: 34.7 }, { label: 'Automatic payment', value: 16.0 }] },
  { id: 'senior', title: 'Senior citizens', takeaway: 'Seniors churn at 41.7% versus 23.6% for everyone else.',
    items: [{ label: 'Senior citizens', value: 41.7 }, { label: 'Others', value: 23.6 }] },
]

// churn % by contract (rows) x internet service (columns)
export const SEGMENTS = {
  cols: ['DSL', 'Fiber optic', 'No internet'],
  rows: [
    { label: 'Month-to-month', values: [32.2, 54.6, 18.9] },
    { label: 'One year', values: [9.3, 19.3, 2.5] },
    { label: 'Two year', values: [1.9, 7.2, 0.8] },
  ],
}

export const LIMITATIONS = [
  'Association, not causation: the model and SHAP show what is linked to churn, not what causes it.',
  'Single-snapshot dataset: validated on a random split, not on future customers.',
  'Signal ceiling: ROC-AUC plateaus near 0.85 for every model family, so data limits performance more than the algorithm.',
  'Precision is 45%: more than half of flagged customers would have stayed, so retention offers must be cheap.',
  'No cost data: the 0.17 threshold assumes a missed churner costs about twice a false alarm. Re-tune it with real offer costs and customer value.',
  'Correlated features: tenure, tenure band and total charges share importance, so read them together.',
  'Fairness: gender and senior status are demographic inputs, so a real deployment needs a fairness and compliance review.',
]