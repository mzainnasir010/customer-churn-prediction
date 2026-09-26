<script setup lang="ts">
import { REPO_URL } from '../data/results'

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
}
</script>

<template>
  <footer class="app-footer" aria-label="Global application footer">
    <div class="container footer-inner">

      <!-- Top Section: Brand & Link Columns -->
      <div class="footer-grid">

        <!-- BRAND & MISSION COLUMN -->
        <div class="footer-brand-col">
          <RouterLink to="/" class="footer-brand">
            <div class="footer-logo"></div>
            <span class="footer-brand-title">ChurnIQ</span>
            <span class="footer-version">v1.0</span>
          </RouterLink>

          <p class="footer-desc">
            Explainable machine learning engine for telecom customer churn prediction. 
            Powered by tuned XGBoost, SHAP driver attributions, and real-time retention scenario simulation.
          </p>

          <div class="footer-status-pill">
            <span class="status-dot"></span>
            <span>XGBoost Core Online • 88.5% Recall</span>
          </div>
        </div>

        <!-- LINK COLUMN 1: PLATFORM -->
        <div class="footer-col">
          <h4 class="footer-heading">Platform</h4>
          <ul class="footer-links">
            <li><RouterLink to="/">Overview & Metrics</RouterLink></li>
            <li><RouterLink to="/predict">Prediction Studio</RouterLink></li>
            <li><RouterLink to="/batch">Batch Processing</RouterLink></li>
            <li><RouterLink to="/simulator">Retention Simulator</RouterLink></li>
          </ul>
        </div>

        <!-- LINK COLUMN 2: INTELLIGENCE -->
        <div class="footer-col">
          <h4 class="footer-heading">Intelligence</h4>
          <ul class="footer-links">
            <li><RouterLink to="/insights">Churn Insights</RouterLink></li>
            <li><RouterLink to="/model">Model Card & Benchmarks</RouterLink></li>
            <li><RouterLink to="/methodology">Engineering Methodology</RouterLink></li>
            <li><RouterLink to="/model">Threshold Evaluation</RouterLink></li>
          </ul>
        </div>

        <!-- LINK COLUMN 3: TECHNICAL & PROJECT -->
        <div class="footer-col">
          <h4 class="footer-heading">Project & Code</h4>
          <ul class="footer-links">
            <li><a :href="REPO_URL" target="_blank" rel="noopener">GitHub Repository ↗</a></li>
            <li><a href="https://www.kaggle.com/datasets/blastchar/telco-customer-churn" target="_blank" rel="noopener">IBM Telco Dataset ↗</a></li>
            <li><RouterLink to="/methodology">FastAPI System Architecture</RouterLink></li>
            <li><RouterLink to="/methodology">SHAP TreeExplainer Spec</RouterLink></li>
          </ul>
        </div>

      </div>

      <!-- Bottom Bar: Attribution & Copyright -->
      <div class="footer-bottom">
        <div class="footer-copy">
          <span>&copy; {{ new Date().getFullYear() }} ChurnIQ. Built by <strong>Muhammad Zain Nasir</strong> for the <strong>seKer AI Internship</strong>.</span>
        </div>

        <div class="footer-actions">
          <a :href="REPO_URL" target="_blank" rel="noopener" class="footer-bottom-link">Source Code</a>
          <span class="footer-sep">•</span>
          <RouterLink to="/methodology" class="footer-bottom-link">Ethics & Limitations</RouterLink>
          <span class="footer-sep">•</span>
          <button class="footer-top-btn" @click="scrollToTop" aria-label="Scroll back to top">
            Back to top &uarr;
          </button>
        </div>
      </div>

    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  margin-top: 5rem;
  border-top: 1px solid var(--border);
  background: color-mix(in srgb, var(--surface) 60%, transparent);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  padding: 4.5rem 0 2rem;
  position: relative;
  z-index: 10;
}

.footer-inner {
  display: flex;
  flex-direction: column;
  gap: 3.5rem;
}

/* ── GRID ── */
.footer-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr 1fr;
  gap: 3rem;
  align-items: start;
}

/* ── BRAND COLUMN ── */
.footer-brand-col {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.footer-brand {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  text-decoration: none;
  color: var(--text);
}

.footer-logo {
  width: 24px;
  height: 24px;
  border-radius: 7px;
  background: linear-gradient(135deg, var(--accent), var(--accent2));
}

.footer-brand-title {
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.footer-version {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.15rem 0.5rem;
  border-radius: 99px;
  background: var(--surface2);
  border: 1px solid var(--border);
  color: var(--muted);
}

.footer-desc {
  font-size: 0.88rem;
  line-height: 1.6;
  color: var(--muted);
  margin: 0;
  max-width: 360px;
}

.footer-status-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.4rem 0.8rem;
  border-radius: 99px;
  background: var(--surface2);
  border: 1px solid var(--border);
  color: var(--text);
  width: fit-content;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--low);
  box-shadow: 0 0 8px var(--low);
  animation: pulse 2s infinite;
}

/* ── LINK COLUMNS ── */
.footer-col {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.footer-heading {
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text);
  margin: 0;
}

.footer-links {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.footer-links a {
  font-size: 0.88rem;
  color: var(--muted);
  text-decoration: none;
  transition: color 0.2s ease, transform 0.2s ease;
  display: inline-block;
}

.footer-links a:hover {
  color: var(--text);
  transform: translateX(2px);
}

/* ── BOTTOM BAR ── */
.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1.75rem;
  border-top: 1px solid var(--border);
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.84rem;
  color: var(--muted);
}

.footer-copy strong {
  color: var(--text);
}

.footer-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.footer-bottom-link {
  color: var(--muted);
  text-decoration: none;
  transition: color 0.2s ease;
}

.footer-bottom-link:hover {
  color: var(--text);
}

.footer-sep {
  color: var(--border);
}

.footer-top-btn {
  background: var(--surface2);
  border: 1px solid var(--border);
  color: var(--text);
  padding: 0.35rem 0.75rem;
  border-radius: 8px;
  font: inherit;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.2s ease, transform 0.2s ease;
}

.footer-top-btn:hover {
  border-color: var(--accent);
  transform: translateY(-2px);
}

/* ── RESPONSIVE ── */
@media (max-width: 900px) {
  .footer-grid {
    grid-template-columns: 1fr 1fr;
    gap: 2.5rem;
  }
  .footer-brand-col {
    grid-column: span 2;
  }
}

@media (max-width: 600px) {
  .footer-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  .footer-brand-col {
    grid-column: span 1;
  }
  .footer-bottom {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
