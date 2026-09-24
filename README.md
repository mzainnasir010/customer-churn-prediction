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

## Model Development
Five classifiers trained on identical preprocessing, split, and random seed (42):
Logistic Regression (baseline), Decision Tree, Random Forest, Gradient Boosting, XGBoost.
Class imbalance handled via class weights (`class_weight="balanced"`, sample weights for Gradient Boosting, `scale_pos_weight` for XGBoost).

## Model Comparison
5-fold stratified cross-validation on the training set (same folds, preprocessing, and seed for every model). Class imbalance handled with class weights.

| Model | Accuracy | Precision | Recall | F1 | ROC-AUC |
|---|---|---|---|---|---|
| Gradient Boosting | 0.750 | 0.519 | 0.793 | 0.627 | 0.847 |
| Logistic Regression | 0.748 | 0.517 | 0.795 | 0.626 | 0.846 |
| Random Forest | 0.780 | 0.565 | 0.734 | 0.639 | 0.846 |
| XGBoost | 0.759 | 0.532 | 0.783 | 0.633 | 0.843 |
| Decision Tree (depth-limited) | 0.735 | 0.500 | 0.788 | 0.612 | 0.828 |

**Findings**
- Gradient Boosting, Logistic Regression, Random Forest, and XGBoost are effectively tied on ROC-AUC (0.843-0.847). The simple Logistic Regression baseline is not beaten by the more complex models.
- Effect of class weighting (Logistic Regression): recall rose from 0.538 to 0.795 and precision fell from 0.665 to 0.517. Accuracy dropped from 0.805 to 0.748 and ROC-AUC was unchanged (0.846). Weighting catches more churners at the cost of more false alarms.
- Effect of removing the Decision Tree depth limit: train recall 0.999 vs CV recall 0.492, and ROC-AUC fell from 0.828 to 0.658. This is severe overfitting, so a depth limit is required.
- Random Forest has the highest precision (0.565) and F1 (0.639) but the lowest recall of the top four (0.734).