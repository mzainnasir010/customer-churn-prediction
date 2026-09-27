# Ground Truth Project Audit Checklist

This checklist tracks the implementation, audit status, and completion state of the **AI-Powered Customer Churn Prediction & Retention System** against the official project requirements.

---

## Audit Summary

- **Total Technical Audit Items:** 36
- **Completed:** 36 / 36 (100% Technical, Architectural & Documentation Completion)
- **Overall Status:** All technical, machine learning, server, client, documentation, explainability, business insight, and screenshot requirements are fully completed and verified.

---

## Detailed Audit Status

### A. Data Foundation

- [x] **Dataset source is recorded exactly**  
  *Status:* Completed  
  *Location:* `README.md` (Dataset Overview), `notebook/notebooks/01_data_understanding.ipynb`, `client/src/views/MethodologyView.vue`  
  *Details:* IBM Telco Customer Churn dataset (`blastchar/telco-customer-churn`, 7,043 rows, 21 columns).

- [x] **Data loads reproducibly**  
  *Status:* Completed  
  *Location:* `notebook/data/raw/WA_Fn-UseC_-Telco-Customer-Churn.csv`, `01_data_understanding.ipynb`  
  *Details:* Raw dataset stored locally; notebooks load reproducibly via pandas.

- [x] **Data dictionary written in your own words**  
  *Status:* Completed  
  *Location:* `README.md` (Dataset Overview table), `01_data_understanding.ipynb`  
  *Details:* Full breakdown of Demographics, Account Profile, Subscribed Services, and Financial Signals with data types, units, and churn hypotheses.

- [x] **Identifier columns identified and excluded**  
  *Status:* Completed  
  *Location:* `notebook/notebooks/02_data_cleaning.ipynb`, `server/app/services/model_service.py`  
  *Details:* `customerID` identified as unique string identifier and dropped before pipeline fitting and inference.

- [x] **Numbers stored as text fixed**  
  *Status:* Completed  
  *Location:* `notebook/notebooks/02_data_cleaning.ipynb`  
  *Details:* `TotalCharges` space strings (`" "`) handled and cast to float. Missing values imputed as `tenure * MonthlyCharges`.

- [x] **Missing values, duplicates, and inconsistent categories handled**  
  *Status:* Completed  
  *Location:* `notebook/notebooks/02_data_cleaning.ipynb`  
  *Details:* Categorical string inconsistencies audited and normalized (`"No internet service"` / `"No phone service"` handled cleanly).

- [x] **Checked for data leakage**  
  *Status:* Completed  
  *Location:* `notebook/notebooks/05_modelling.ipynb`  
  *Details:* Scalers and OneHotEncoders wrapped in scikit-learn `Pipeline` objects fitted strictly within 5-fold cross-validation training folds. Split into train/test prior to fitting.

- [x] **EDA shows churn against each feature, with written conclusions**  
  *Status:* Completed  
  *Location:* `notebook/notebooks/03_EDA.ipynb`, `README.md`, `client/src/views/InsightsView.vue`  
  *Details:* Bivariate analyses for contract types, internet services, tenure bands, payment methods, and monthly charges with written key findings.

---

### B. Modelling

- [x] **Categorical encoding and numeric scaling applied**  
  *Status:* Completed  
  *Location:* `notebook/notebooks/05_modelling.ipynb`, `ColumnTransformer`  
  *Details:* `OneHotEncoder(handle_unknown='ignore')` applied to categoricals; `StandardScaler` applied to numeric continuous features.

- [x] **Engineered features that carry real signal**  
  *Status:* Completed  
  *Location:* `notebook/notebooks/04_feature_engineering.ipynb`, `server/app/services/model_service.py`  
  *Details:* `num_addons` (0-6), `has_security_support` (binary), `auto_pay` (binary), `tenure_group` (cohorts).

- [x] **Train/test split done before fitting anything, stratified on churn label**  
  *Status:* Completed  
  *Location:* `notebook/notebooks/05_modelling.ipynb`  
  *Details:* 80/20 Stratified train/test split (`train_test_split(..., stratify=y, random_state=42)`).

- [x] **Same preprocessing, same split, and same random seed for every model**  
  *Status:* Completed  
  *Location:* `notebook/notebooks/05_modelling.ipynb`  
  *Details:* Unified `StratifiedKFold(n_splits=5, shuffle=True, random_state=42)` applied to all 5 candidate models.

- [x] **Logistic Regression (baseline) trained**  
  *Status:* Completed  
  *Location:* `05_modelling.ipynb`, `notebook/reports/model_comparison.csv`  
  *Details:* Baseline Logistic Regression trained (CV ROC-AUC: 0.846).

- [x] **Decision Tree trained, with overfitting risk handled**  
  *Status:* Completed  
  *Location:* `05_modelling.ipynb`, `model_comparison.csv`  
  *Details:* DecisionTreeClassifier trained with `max_depth=5` to prevent tree overfitting (CV ROC-AUC: 0.828).

- [x] **Random Forest trained**  
  *Status:* Completed  
  *Location:* `05_modelling.ipynb`, `model_comparison.csv`  
  *Details:* RandomForestClassifier trained (CV ROC-AUC: 0.846).

- [x] **Gradient Boosting trained**  
  *Status:* Completed  
  *Location:* `05_modelling.ipynb`, `model_comparison.csv`  
  *Details:* GradientBoostingClassifier trained (CV ROC-AUC: 0.847).

- [x] **XGBoost, LightGBM, or CatBoost trained**  
  *Status:* Completed  
  *Location:* `05_modelling.ipynb`, `model_comparison.csv`  
  *Details:* XGBoostClassifier trained and selected as final production model (CV ROC-AUC: 0.850).

- [x] **Class imbalance handled and effect stated**  
  *Status:* Completed  
  *Location:* `05_modelling.ipynb`, `README.md` (Threshold Tuning section)  
  *Details:* Handled via decision threshold optimization (tuned from 0.50 to 0.17 for $F_2$ score). Effect: increased Recall from 51.3% to 88.5% on unseen test records.

- [x] **Comparison table of headline metrics for every model**  
  *Status:* Completed  
  *Location:* `notebook/reports/model_comparison.csv`, `README.md`, `client/src/views/ModelView.vue`  
  *Details:* Full table comparing ROC-AUC, Recall, Precision, and F1 across all 5 models.

- [x] **Final model selected and justified**  
  *Status:* Completed  
  *Location:* `README.md`, `05_modelling.ipynb`  
  *Details:* XGBoost selected based on superior cross-validated ROC-AUC (0.850) and test ROC-AUC (0.848).

---

### C. Evaluation

- [x] **Final model reports Accuracy, Precision, Recall, F1, Confusion Matrix, and ROC-AUC**  
  *Status:* Completed  
  *Location:* `notebook/reports/final_test_results.csv`, `notebook/reports/confusion_matrix.png`, `README.md`, `ModelView.vue`  
  *Details:* Full metrics set calculated and rendered visually on held-out test set.

- [x] **Headline metrics reported for every trained model**  
  *Status:* Completed  
  *Location:* `README.md`, `model_comparison.csv`, `ModelView.vue`  
  *Details:* Leaderboard table present in documentation and UI.

- [x] **State which metric was optimized for and what that choice costs the business**  
  *Status:* Completed  
  *Location:* `README.md` (Decision Threshold Tuning section), `client/src/views/MethodologyView.vue`  
  *Details:* Explicitly optimized for Recall ($F_2$). Cost: Precision drops from 66.4% to 44.9%, meaning ~55% of flagged customers are false alarms receiving retention outreach.

- [x] **Accuracy is not presented as the verdict**  
  *Status:* Completed  
  *Location:* `README.md`, `client/src/views/ModelView.vue`  
  *Details:* Highlights why 80.2% accuracy at threshold 0.50 is deceptive because it missed 182 actual churners (48.7% false negative rate).

---

### D. Explainability

- [x] **Feature importance surfaced**  
  *Status:* Completed  
  *Location:* `notebook/reports/shap_importance.png`, `notebook/reports/shap_beeswarm.png`, `README.md`, `InsightsView.vue`  
  *Details:* Global SHAP feature importances and beeswarm plots generated and displayed.

- [x] **Explain what drives an individual prediction**  
  *Status:* Completed  
  *Location:* `server/app/services/model_service.py` (SHAP TreeExplainer), `client/src/views/PredictView.vue`, `client/src/components/ImpactBars.vue`  
  *Details:* FastAPI computes instant per-customer SHAP contributions returning top 5 risk factors (+ and -) for any given record.

---

### E. Prediction System

- [x] **Trained model saved in a loadable format**  
  *Status:* Completed  
  *Location:* `notebook/models/churn_model.joblib`, `server/models/churn_model.joblib`  
  *Details:* Pipeline bundle serialized using `joblib` containing preprocessing transformers, XGBoost estimator, threshold (0.17), and metadata.

- [x] **Simple UI or API that takes customer attributes and returns churn probability**  
  *Status:* Completed  
  *Location:* FastAPI backend (`POST /predict`, `POST /predict/batch`), Vue 3 web client (`PredictView.vue`, `BatchView.vue`)  
  *Details:* Fast REST API and interactive web interface with scenario testing, risk gauge, and batch CSV processing.

- [x] **Usable by someone outside the data team**  
  *Status:* Completed  
  *Location:* Vue 3 client app with 4-step wizard form, preset customer persona buttons, batch drag-and-drop CSV processor, and financial ROI simulator (`SimulatorView.vue`).

---

### F. Business Insights

- [x] **Key churn drivers, with direction, strength, and evidence**  
  *Status:* Completed  
  *Location:* `README.md`, `notebook/reports/shap_beeswarm.png`, `InsightsView.vue`  
  *Details:* Contract type (Month-to-month: +0.619 log-odds), tenure (-0.317 log-odds), fiber optic internet (+0.251 log-odds), electronic check (+0.191 log-odds).

- [x] **High-risk customer profile in plain language**  
  *Status:* Completed  
  *Location:* `README.md` (EDA Findings), `client/src/views/InsightsView.vue`  
  *Details:* Plain English profile: New customer (<12 mos tenure) on a month-to-month contract with fiber optic internet, paying >$80/mo via electronic check without tech support or online security.

- [x] **Segments with elevated risk**  
  *Status:* Completed  
  *Location:* `client/src/views/InsightsView.vue` (Segment Heatmap Matrix)  
  *Details:* Matrix evaluating Contract Type × Internet Service combinations (e.g. Month-to-Month + Fiber Optic = 54.6% churn rate).

- [x] **Retention strategies tied to drivers, marked cheap-to-test vs. needs investment**  
  *Status:* Completed  
  *Location:* `client/src/views/MethodologyView.vue`, `client/src/views/SimulatorView.vue`, `README.md`  
  *Details:* Cheap-to-test (automated payment setup incentives, free tech support onboarding trial) vs. Needs investment (fiber optic network infrastructure upgrade, long-term contract discount packages).

- [x] **Limitations named: association is not causation, and dataset limits stated**  
  *Status:* Completed  
  *Location:* `README.md` (Section 11: Governance, Limitations & Ethics), `client/src/views/MethodologyView.vue`  
  *Details:* Explicit disclosures on correlation vs causation, snapshot data drift, and human-in-the-loop operational bounds.

---

### G. Deliverables & Code Artifacts

- [x] **Complete source code (notebook and/or scripts)**  
  *Status:* Completed  
  *Location:* `notebook/notebooks/`, `server/`, `client/`

- [x] **Public GitHub repo with clean structure**  
  *Status:* Completed / Verified  
  *Location:* `https://github.com/mzainnasir010/customer-churn-prediction`  
  *Details:* Contains `data/`, `notebooks/`, `server/` (`app/`), `client/` (`src/`), `models/`, `reports/`, `README.md`, `requirements.txt`.

- [x] **`.gitignore` excludes large data, virtual environments, and credentials**  
  *Status:* Completed  
  *Location:* `.gitignore`, `server/.gitignore`, `client/.gitignore`  
  *Details:* Excludes `venv/`, `node_modules/`, `.env`, build outputs.

- [x] **Small, meaningful commits**  
  *Status:* Completed  
  *Location:* Git commit history in repository.

- [x] **README covers all 16 required sections**  
  *Status:* Completed  
  *Location:* `README.md` (Table of Contents & explicit section headers)  
  *Sections Covered:* Title, Overview, Business Problem, Objectives, Dataset, Technologies, Methodology, EDA Findings, Model Development, Model Comparison, Evaluation Results, Key Insights, Installation & Setup, Usage, Screenshots & Visual Demos, Future Improvements & Governance.

- [x] **`requirements.txt` with pinned versions, reproducible in clean environment**  
  *Status:* Completed  
  *Location:* `requirements.txt`, `server/requirements.txt`

- [x] **Screenshots of outputs and interface**  
  *Status:* Completed  
  *Location:* `client/src/assets/screenshots/`, embedded directly in `README.md` under Section 15  
  *Details:* All 7 high-resolution application screenshots embedded with GitHub markdown image tags.

---

### H. Quality Bar (How You'll Be Reviewed)

- [x] **No leakage, honest evaluation, sound comparison**  
  *Status:* Fully Compliant  
  *Details:* Pipeline isolates preprocessing parameters to training folds; threshold optimization explicitly accounts for precision costs.

- [x] **Original work, not a copied tutorial**  
  *Status:* Fully Compliant  
  *Details:* Features full 3-tiered system architecture (ML notebooks + FastAPI REST API + custom Vue 3/Three.js frontend).

- [x] **You can defend every choice in conversation**  
  *Status:* Prepared  
  *Details:* Every design decision (F2 metric choice, threshold 0.17, XGBoost selection, TreeExplainer SHAP) is documented with empirical data.
