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

## Model Comparison
5-fold stratified cross-validation on the training set (same folds, preprocessing, and seed for every model). Class imbalance handled with class weights.

| Model | Accuracy | Precision | Recall | F1 | ROC-AUC |
|---|---|---|---|---|---|
| Gradient Boosting | 0.750 | 0.519 | 0.793 | 0.627 | 0.847 |
| Logistic Regression | 0.748 | 0.517 | 0.795 | 0.626 | 0.846 |
| Random Forest | 0.780 | 0.565 | 0.734 | 0.639 | 0.846 |
| XGBoost | 0.759 | 0.532 | 0.783 | 0.633 | 0.843 |
| Decision Tree (depth-limited) | 0.735 | 0.500 | 0.788 | 0.612 | 0.828 |

- The four strongest models are effectively tied on ROC-AUC (0.843-0.847), and the simple Logistic Regression baseline is not beaten.
- Class weighting (Logistic Regression): recall rose from 0.538 to 0.795 and precision fell from 0.665 to 0.517. Accuracy dropped from 0.805 to 0.748 and ROC-AUC was unchanged (0.846).
- Removing the Decision Tree depth limit: train recall 0.999 vs CV recall 0.492, and ROC-AUC fell from 0.828 to 0.658, which is severe overfitting.

## Final Model and Evaluation
- Hyperparameter tuning: `RandomizedSearchCV` (20 iterations, 5-fold stratified CV, scored by ROC-AUC).

| Tuned model | Best CV ROC-AUC |
|---|---|
| XGBoost | 0.8502 |
| Gradient Boosting | 0.8499 |
| Random Forest | 0.8481 |
| Logistic Regression (baseline, untuned) | 0.846 |

- Final model: XGBoost, selected for the highest cross-validated ROC-AUC. Its gain over the baseline is only +0.004, so the dataset has a limited signal ceiling and model choice matters less than data quality.
- Class imbalance is handled by threshold tuning. The threshold (0.17) maximises F2 (recall weighted twice as heavily as precision) on out-of-fold training predictions, since a missed churner costs lost revenue while a false alarm costs only a retention offer.
- Test set results (1,409 customers, evaluated once):

| Threshold | Accuracy | Precision | Recall | F1 | ROC-AUC |
|---|---|---|---|---|---|
| 0.50 (default) | 0.802 | 0.664 | 0.513 | 0.579 | 0.848 |
| 0.17 (tuned) | 0.681 | 0.449 | 0.885 | 0.596 | 0.848 |

- Confusion matrix (threshold 0.17): 331 churners caught, 43 missed, 406 false alarms, 629 loyal customers correctly left alone. The model flags 737 customers, and 45% of them actually churn.
- Trade-off: lowering the threshold raises recall from 51% to 89% at the cost of accuracy and precision. Retention offers should therefore be cheap to send.
- Test ROC-AUC (0.848) matches cross-validation (0.850), so there is no sign of overfitting or leakage.
- Saved model: `models/churn_model.joblib` (preprocessing pipeline, XGBoost, and the tuned threshold).

## Explainability
SHAP (`TreeExplainer`) on the final XGBoost model, computed on the test set. Figures in `reports/`.

Top churn drivers (mean absolute SHAP value):

| Rank | Feature | Mean \|SHAP\| | Effect |
|---|---|---|---|
| 1 | Contract: month-to-month | 0.619 | raises churn |
| 2 | Tenure | 0.317 | lowers churn |
| 3 | Internet service: fiber optic | 0.251 | raises churn |
| 4 | Payment method: electronic check | 0.191 | raises churn |
| 5 | Monthly charges | 0.173 | raises churn |
| 6 | Contract: two year | 0.159 | lowers churn |
| 7 | Internet service: none | 0.146 | lowers churn |
| 8 | Paperless billing | 0.125 | raises churn |
| 9 | Has security or tech support | 0.107 | lowers churn |
| 10 | Total charges | 0.098 | lowers churn |

- Contract type is by far the strongest driver, about twice as influential as tenure. This agrees with the EDA (month-to-month ~43% churn vs ~3% for two-year contracts).
- Per-customer explanations: the waterfall plot shows which features pushed one customer's risk up or down (the highest-risk test customer has a churn probability of 0.869).
- Limitations: SHAP shows association, not causation, so recommendations are hypotheses to test. `tenure`, `tenure_group`, and `TotalCharges` are correlated, so their importance is shared between them. The two contract and two internet-service rows above are different levels of the same variable.