<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { DATASET, FINAL } from '../data/results'
import { money } from '../utils/format'

const rootEl = ref<HTMLElement | null>(null)
const reducedMotion = ref(false)

// Input parameters
const customers = ref(10000)
const value = ref(1000)
const cost = ref(20)
const success = ref(25)

// Presets for quick scenario loading
const PRESETS = [
  { label: 'Mid-Market Base', c: 5000, v: 850, k: 25, s: 20 },
  { label: 'Enterprise Base (Default)', c: 10000, v: 1000, k: 20, s: 25 },
  { label: 'Low-Cost Digital Credit', c: 15000, v: 1200, k: 10, s: 35 },
  { label: 'VIP White Glove Concierge', c: 2000, v: 3500, k: 150, s: 50 }
]

function loadPreset(p: typeof PRESETS[number]) {
  customers.value = p.c
  value.value = p.v
  cost.value = p.k
  success.value = p.s
}

// Financial calculations
const churners = computed(() => customers.value * (DATASET.churnRate / 100))
const caught = computed(() => churners.value * FINAL.tuned.recall)
const flagged = computed(() => caught.value / FINAL.tuned.precision)
const retained = computed(() => caught.value * (success.value / 100))
const protectedRev = computed(() => retained.value * value.value)
const spend = computed(() => flagged.value * cost.value)
const net = computed(() => protectedRev.value - spend.value)
const roiPct = computed(() => (spend.value > 0 ? (net.value / spend.value) * 100 : 0))
const breakEven = computed(() => (caught.value * value.value > 0 ? (spend.value / (caught.value * value.value)) * 100 : 0))

// Sensitivity Matrix calculation helper (cost vs success)
const MATRIX_COSTS = [10, 25, 50, 100]
const MATRIX_RATES = [10, 20, 35, 50]

function calcMatrixNet(cCost: number, sRate: number) {
  const cCaught = customers.value * (DATASET.churnRate / 100) * FINAL.tuned.recall
  const cFlagged = cCaught / FINAL.tuned.precision
  const cRetained = cCaught * (sRate / 100)
  const cProtected = cRetained * value.value
  const cSpend = cFlagged * cCost
  return cProtected - cSpend
}

// Scroll animation trigger setup
let ticking = false
const activeSection = ref(0)
let sectionEls: HTMLElement[] = []

function recalc() {
  ticking = false
  if (!rootEl.value || !sectionEls.length) return
  const triggerPoint = window.innerHeight * 0.65
  for (let i = 0; i < sectionEls.length; i++) {
    const rect = sectionEls[i].getBoundingClientRect()
    if (rect.top <= triggerPoint) activeSection.value = i
  }
}

function onScroll() {
  if (ticking) return
  ticking = true
  requestAnimationFrame(recalc)
}

onMounted(async () => {
  reducedMotion.value = matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reducedMotion.value) {
    activeSection.value = 3
    return
  }
  await nextTick()
  sectionEls = Array.from(rootEl.value?.querySelectorAll<HTMLElement>('.sim-section') ?? [])
  recalc()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
})
</script>

<template>
  <div ref="rootEl" class="sim-root container" aria-label="Retention simulator page">
    
    <!-- ════════════ HERO HEADER ════════════ -->
    <header class="sim-hero">
      <span class="eyebrow">ROI & Financial Modeling</span>
      <h1 class="h1">Retention Campaign ROI Simulator</h1>
      <p class="lead">
        Model the net financial impact of targeting at-risk customers using model recall ({{ (FINAL.tuned.recall * 100).toFixed(1) }}%), 
        precision ({{ (FINAL.tuned.precision * 100).toFixed(1) }}%), and custom offer cost assumptions.
      </p>
    </header>

    <div class="notice card glass" role="note">
      💡 <strong>Model Metric Context:</strong> Because precision is {{ (FINAL.tuned.precision * 100).toFixed(1) }}%, 
      roughly 55% of contacted customers would have stayed anyway. Keeping offer costs low is essential to maximize net campaign profit.
    </div>

    <!-- ════════════ SECTION 1: INTERACTIVE SIMULATOR COMMAND CENTER ════════════ -->
    <section class="sim-section">
      
      <!-- Preset Quick-Select Chips -->
      <div class="sim-presets-bar">
        <span class="sim-preset-lbl">QUICK SCENARIO PRESETS:</span>
        <div class="sim-preset-chips">
          <button 
            v-for="p in PRESETS" 
            :key="p.label" 
            class="btn btn-chip"
            @click="loadPreset(p)"
          >
            {{ p.label }}
          </button>
        </div>
      </div>

      <div class="sim-main-grid">

        <!-- LEFT COLUMN: Parameter Controls -->
        <form class="sim-form-card card glass" @submit.prevent>
          <h3 class="h3" style="margin-bottom: 1.25rem">Campaign Parameters</h3>

          <div class="sim-field-group">
            <div class="sim-field-label">
              <label for="c">Total Customer Base</label>
              <span class="sim-field-val">{{ customers.toLocaleString() }}</span>
            </div>
            <input id="c" v-model.number="customers" type="range" min="500" max="50000" step="500" />
            <span class="sim-field-hint">Range: 500 to 50,000 customers</span>
          </div>

          <div class="sim-field-group">
            <div class="sim-field-label">
              <label for="v">Retained Customer Annual Value</label>
              <span class="sim-field-val">${{ value.toLocaleString() }}</span>
            </div>
            <input id="v" v-model.number="value" type="range" min="100" max="5000" step="50" />
            <span class="sim-field-hint">Average annual gross margin per retained user</span>
          </div>

          <div class="sim-field-group">
            <div class="sim-field-label">
              <label for="k">Cost Per Retention Offer</label>
              <span class="sim-field-val">${{ cost }}</span>
            </div>
            <input id="k" v-model.number="cost" type="range" min="5" max="250" step="5" />
            <span class="sim-field-hint">Cost per offer sent (discount, credit, gift)</span>
          </div>

          <div class="sim-field-group">
            <div class="sim-field-label">
              <label for="s">Offer Conversion Success Rate</label>
              <span class="sim-field-val">{{ success }}%</span>
            </div>
            <input id="s" v-model.number="success" type="range" min="1" max="80" step="1" />
            <span class="sim-field-hint">% of contacted churners who accept and stay</span>
          </div>
        </form>

        <!-- RIGHT COLUMN: Real-Time Financial Dashboard -->
        <div class="sim-dash-card card glass">
          
          <!-- Top KPI Highlight Cards -->
          <div class="sim-kpi-grid">
            <div class="sim-kpi-box" :class="net >= 0 ? 'kpi-good' : 'kpi-bad'">
              <span class="sim-kpi-title">NET CAMPAIGN PROFIT</span>
              <strong class="sim-kpi-val">
                {{ net < 0 ? '-' : '+' }}${{ money(Math.abs(net)) }}
              </strong>
              <span class="sim-kpi-sub">{{ roiPct.toFixed(1) }}% Return on Campaign Spend</span>
            </div>

            <div class="sim-kpi-box">
              <span class="sim-kpi-title">BREAK-EVEN CONVERSION</span>
              <strong class="sim-kpi-val">{{ breakEven.toFixed(1) }}%</strong>
              <span class="sim-kpi-sub">Required acceptance rate to break even</span>
            </div>
          </div>

          <!-- Financial Breakdown List -->
          <div class="sim-breakdown-list">
            <h4 class="sim-breakdown-head">CAMPAIGN WATERFALL BREAKDOWN</h4>

            <dl class="kv big">
              <dt>Expected Churners ({{ DATASET.churnRate }}% Base)</dt>
              <dd>{{ money(churners) }}</dd>

              <dt>Churners Model Catches ({{ (FINAL.tuned.recall * 100).toFixed(1) }}% Recall)</dt>
              <dd>{{ money(caught) }}</dd>

              <dt>Total Customers Contacted ({{ (FINAL.tuned.precision * 100).toFixed(1) }}% Precision)</dt>
              <dd>{{ money(flagged) }}</dd>

              <dt>Churners Successfully Retained ({{ success }}% Conv.)</dt>
              <dd style="color: var(--low); font-weight: 800">{{ money(retained) }}</dd>

              <dt>Gross Revenue Protected</dt>
              <dd>${{ money(protectedRev) }}</dd>

              <dt>Total Campaign Outreach Cost</dt>
              <dd>${{ money(spend) }}</dd>

              <dt>Net Financial Impact</dt>
              <dd :class="net >= 0 ? 'good' : 'bad'">
                {{ net < 0 ? '-' : '+' }}${{ money(Math.abs(net)) }}
              </dd>
            </dl>
          </div>

        </div>

      </div>
    </section>

    <!-- ════════════ SECTION 2: SENSITIVITY ANALYSIS MATRIX ════════════ -->
    <section class="sim-section card glass">
      <div class="sim-section-header">
        <span class="eyebrow">Sensitivity Matrix</span>
        <h2 class="h2">Offer Cost vs. Conversion Rate Sensitivity</h2>
        <p class="lead">
          Net campaign profit under varying offer costs ($10 to $100) and conversion rates (10% to 50%) 
          for your current {{ customers.toLocaleString() }} customer base.
        </p>
      </div>

      <div class="sim-matrix-table-wrap">
        <table class="sim-matrix-table">
          <thead>
            <tr>
              <th>Offer Cost \ Success Rate</th>
              <th v-for="r in MATRIX_RATES" :key="r">{{ r }}% Conversion</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="cCost in MATRIX_COSTS" :key="cCost">
              <td><strong>${{ cCost }} / Offer</strong></td>
              <td 
                v-for="sRate in MATRIX_RATES" 
                :key="sRate"
                :class="calcMatrixNet(cCost, sRate) >= 0 ? 'good-cell' : 'bad-cell'"
              >
                <span>{{ calcMatrixNet(cCost, sRate) >= 0 ? '+' : '-' }}${{ money(Math.abs(calcMatrixNet(cCost, sRate))) }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- ════════════ SECTION 3: STRATEGIC RETENTION RECOMMENDATIONS ════════════ -->
    <section class="sim-section">
      <div class="sim-section-header">
        <span class="eyebrow">Executive Guidance</span>
        <h2 class="h2">Strategic Guidelines for Campaign Deployment</h2>
      </div>

      <div class="grid g3">
        <div class="card glass">
          <div class="sim-guide-num">01</div>
          <h3>Tiered Outreach Priority</h3>
          <p class="muted">
            Target the top high-risk cohort (above 0.50 threshold) first before expanding to medium-risk tiers. 
            This preserves budget for higher-confidence churn risks.
          </p>
        </div>

        <div class="card glass">
          <div class="sim-guide-num">02</div>
          <h3>Low-Cost High-Value Offers</h3>
          <p class="muted">
            Free service add-ons (OnlineSecurity or TechSupport trials) carry low marginal cost but deliver high perceived value, 
            protecting campaign net profit even at 45% precision.
          </p>
        </div>

        <div class="card glass">
          <div class="sim-guide-num">03</div>
          <h3>Rigorous A/B Holdout Testing</h3>
          <p class="muted">
            Always retain a random 10% holdout group of flagged churners who receive no offer to measure true incremental 
            retention uplift versus natural customer survival.
          </p>
        </div>
      </div>
    </section>

    <!-- ════════════ SECTION 4: DIRECT ACTION BAR ════════════ -->
    <section class="sim-section">
      <div class="card glass sim-action-bar">
        <div>
          <h3 class="h3" style="margin-bottom: 0.3rem">Ready to score live customer profiles?</h3>
          <p class="muted" style="margin: 0">
            Open the Prediction Studio to analyze specific customer risk factors or evaluate the model card.
          </p>
        </div>
        <div class="cta" style="margin: 0">
          <RouterLink to="/predict" class="btn primary">
            Open Prediction Studio &rarr;
          </RouterLink>
          <RouterLink to="/model" class="btn">
            View Model Card
          </RouterLink>
        </div>
      </div>
    </section>

  </div>
</template>

<style scoped>
.sim-root {
  width: 100%;
  padding-top: 2.5rem;
  padding-bottom: 5rem;
  display: flex;
  flex-direction: column;
  gap: 3.5rem;
}

/* ── HERO ── */
.sim-hero {
  max-width: 720px;
}

.sim-hero .lead {
  margin-bottom: 0;
}

.notice {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.5;
}

/* ── PRESETS BAR ── */
.sim-presets-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.sim-preset-lbl {
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: var(--muted);
}

.sim-preset-chips {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

/* ── MAIN GRID ── */
.sim-main-grid {
  display: grid;
  grid-template-columns: 1fr 1.1fr;
  gap: 2.5rem;
  align-items: start;
}

.sim-form-card {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.sim-field-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.sim-field-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sim-field-label label {
  font-size: 0.88rem;
  font-weight: 700;
  margin: 0;
}

.sim-field-val {
  font-size: 1rem;
  font-weight: 800;
  color: var(--accent);
}

.sim-field-hint {
  font-size: 0.75rem;
  color: var(--muted);
}

/* ── DASHBOARD CARD ── */
.sim-dash-card {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.sim-kpi-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 1rem;
}

.sim-kpi-box {
  padding: 1.25rem;
  border-radius: 12px;
  background: var(--surface2);
  border: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.kpi-good {
  background: color-mix(in srgb, var(--low) 12%, var(--surface2));
  border-color: color-mix(in srgb, var(--low) 30%, transparent);
}

.kpi-bad {
  background: color-mix(in srgb, var(--high) 12%, var(--surface2));
  border-color: color-mix(in srgb, var(--high) 30%, transparent);
}

.sim-kpi-title {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: var(--muted);
}

.sim-kpi-val {
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.1;
}

.kpi-good .sim-kpi-val { color: var(--low); }
.kpi-bad .sim-kpi-val { color: var(--high); }

.sim-kpi-sub {
  font-size: 0.75rem;
  color: var(--muted);
  font-weight: 600;
}

/* Breakdown List */
.sim-breakdown-head {
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: var(--muted);
  margin-bottom: 0.75rem;
}

/* ── SENSITIVITY MATRIX TABLE ── */
.sim-matrix-table-wrap {
  overflow-x: auto;
  margin-top: 1rem;
}

.sim-matrix-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0.4rem;
}

.sim-matrix-table th, .sim-matrix-table td {
  padding: 0.85rem 1rem;
  text-align: center;
  border-radius: 8px;
  font-size: 0.88rem;
}

.sim-matrix-table th {
  background: var(--surface2);
  color: var(--muted);
  font-weight: 700;
}

.good-cell {
  background: color-mix(in srgb, var(--low) 15%, var(--surface2));
  color: var(--low);
  font-weight: 800;
}

.bad-cell {
  background: color-mix(in srgb, var(--high) 15%, var(--surface2));
  color: var(--high);
  font-weight: 800;
}

/* ── GUIDANCE & ACTION BAR ── */
.sim-guide-num {
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: var(--muted);
  margin-bottom: 0.5rem;
}

.sim-action-bar {
  padding: 2rem 2.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
}

/* ── RESPONSIVE ── */
@media (max-width: 900px) {
  .sim-main-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  .sim-kpi-grid {
    grid-template-columns: 1fr;
  }
  .sim-action-bar {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>