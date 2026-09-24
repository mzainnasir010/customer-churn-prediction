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