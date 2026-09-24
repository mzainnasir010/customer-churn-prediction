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