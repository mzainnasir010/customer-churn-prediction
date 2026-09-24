# AI-Powered Customer Churn Prediction & Retention System

## Business Problem
Customers who cancel take recurring revenue with them, and replacing them costs more than keeping them. This project predicts which customers are likely to churn, and why, so a retention team can act before they leave.

## Dataset
IBM Telco Customer Churn dataset (Kaggle: `blastchar/telco-customer-churn`).
7,043 customers, 21 columns, binary target `Churn` (about 26.5% Yes).

## Installation
```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
jupyter notebook
```
## Data Cleaning
- `TotalCharges` was stored as text. 11 blank values belonged to customers with `tenure = 0` (not yet billed), so they were set to 0.
- "No internet service" / "No phone service" were collapsed to "No", since `InternetService` and `PhoneService` already capture this.
- `Churn` encoded as 1 (Yes) / 0 (No).
- `customerID` dropped (identifier, no predictive value). No duplicate rows found.
- No leakage columns identified: every feature would be known before a customer churns.

## EDA (Exploratory Data Analysis) Findings
- Overall churn rate: 26.5% (imbalanced target).
- Contract: month-to-month churn ~43% vs ~11% (one-year) and ~3% (two-year).
- Internet service: fiber optic ~42% vs ~19% (DSL) and ~7% (no internet).
- Tenure: 47.4% churn in months 0-12, dropping to 9.5% after 48 months.
- Payment method: electronic check ~45%, versus 15-19% for the other methods.
- Seniors churn at 41.7% vs 23.6% for non-seniors.
- Riskiest segment: month-to-month fiber optic customers (54.6%).
- Customers with OnlineSecurity, TechSupport, a partner, or dependents churn less.
- Paperless billing customers churn more (~34% vs ~16%).
- Gender and PhoneService have little to no effect.
- `tenure` and `TotalCharges` are highly correlated (0.83).
Figures are in `reports/`.

## Feature Engineering
Derived from EDA findings (row-wise only, no leakage):
- `num_addons`: count of add-on services subscribed.
- `has_security_support`: has OnlineSecurity or TechSupport.
- `auto_pay`: pays by automatic bank transfer or credit card.
- `tenure_group`: tenure bands (0-12, 13-24, 25-48, 49-72 months).
Encoding and scaling are fitted on the training set only, inside a scikit-learn pipeline.

## Train/Test Split and Preprocessing
- 80/20 stratified split on `Churn` (random_state=42): 5,634 train / 1,409 test rows, churn rate 26.5% in both.
- Split performed before any fitting to avoid leakage.
- Preprocessing (scikit-learn `ColumnTransformer`): standard scaling for numeric features, one-hot encoding for categorical features. It is fitted on the training set only, inside each model's pipeline.