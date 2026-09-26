<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

const rootEl = ref<HTMLElement | null>(null)
const activeQuad = ref(0)
const activeRow = ref(0)
const horizontalScrollIndex = ref(0)
const reducedMotion = ref(false)

let quadEls: HTMLElement[] = []
let rowEls: HTMLElement[] = []
let horizContainerEl: HTMLElement | null = null
let ticking = false

const PRINCIPLES = [
  {
    code: 'RULE-01',
    title: 'Split before fitting',
    desc: 'Scaling and encoding parameters are estimated exclusively on training folds during cross-validation to eliminate data leakage.'
  },
  {
    code: 'RULE-02',
    title: 'Fair baseline comparison',
    desc: 'Candidate model families are evaluated on identical CV partitions using a fixed random seed.'
  },
  {
    code: 'RULE-03',
    title: 'Locked test evaluation',
    desc: 'Selection and threshold optimization strictly use out-of-fold validation data. The test set is evaluated exactly once.'
  },
  {
    code: 'RULE-04',
    title: 'Metric alignment',
    desc: 'Evaluation focuses on Recall, Precision, F1, and ROC-AUC rather than naive overall accuracy.'
  }
]

const PIPELINE_MODULES = [
  {
    id: 'MOD-01',
    name: 'Client Payload Ingress',
    sub: 'Vue 3 • TypeScript • Pinia',
    body: 'Captures raw customer attributes without performing client-side calculations.',
    output: 'JSON Raw Payload'
  },
  {
    id: 'MOD-02',
    name: 'FastAPI Validation Layer',
    sub: 'FastAPI • Pydantic',
    body: 'Validates raw schema, handles CORS, and delegates computation to the pipeline engine.',
    output: 'Validated Schema'
  },
  {
    id: 'MOD-03',
    name: 'Feature Engineering Pipeline',
    sub: 'scikit-learn • pandas',
    body: 'Rebuilds 4 derived features (Add-ons, Support, AutoPay, Tenure Band) and applies pre-learned encoders.',
    output: 'Dense Feature Vector'
  },
  {
    id: 'MOD-04',
    name: 'Tuned XGBoost Engine',
    sub: 'XGBoost Core',
    body: 'Calculates raw risk probability and evaluates against the tuned 0.17 decision threshold.',
    output: 'Churn Probability & Tier'
  },
  {
    id: 'MOD-05',
    name: 'SHAP Contribution Tree',
    sub: 'SHAP Kernel',
    body: 'Computes local feature attribution values per customer for immediate explanation.',
    output: 'Attribution Array'
  }
]

const LIMITATIONS_MATRIX = [
  {
    id: 'LIM-01',
    cat: 'Causality',
    rule: 'Association, Not Causation',
    spec: 'SHAP values reflect statistical linkage, not causal mechanisms. Interventions require A/B validation.'
  },
  {
    id: 'LIM-02',
    cat: 'Temporality',
    rule: 'Static Snapshot Dataset',
    spec: 'Trained on a single dataset snapshot; performance must be monitored on future customer cohorts.'
  },
  {
    id: 'LIM-03',
    cat: 'Signal Ceiling',
    rule: 'ROC-AUC Cap (~0.85)',
    spec: 'ROC-AUC plateaus near 0.85 across model families, indicating data signal boundaries.'
  },
  {
    id: 'LIM-04',
    cat: 'Economics',
    rule: 'Precision Floor (45.0%)',
    spec: 'More than half of flagged customers would remain; retention offers must remain cost-effective.'
  },
  {
    id: 'LIM-05',
    cat: 'Threshold',
    rule: 'Assumed Cost Ratio (0.17)',
    spec: 'The 0.17 threshold assumes missed churners cost ~2x false alarms. Re-tuning is required for exact LTV.'
  },
  {
    id: 'LIM-06',
    cat: 'Colinearity',
    rule: 'Feature Interdependence',
    spec: 'Tenure, tenure bands, and total charges share variance and should be interpreted as a group.'
  },
  {
    id: 'LIM-07',
    cat: 'Compliance',
    rule: 'Demographic Inputs',
    spec: 'Gender and senior status inputs require formal fairness and regulatory compliance auditing.'
  }
]

const TECH_STACK = ['Python', 'pandas', 'scikit-learn', 'XGBoost', 'SHAP', 'FastAPI', 'Vue 3', 'TypeScript', 'Pinia']

function recalc() {
  ticking = false
  if (!rootEl.value) return

  const windowHeight = window.innerHeight
  const triggerPoint = windowHeight * 0.55

  // Principles Quad trigger
  for (let i = 0; i < quadEls.length; i++) {
    const rect = quadEls[i].getBoundingClientRect()
    if (rect.top <= triggerPoint) {
      activeQuad.value = i
    }
  }

  // Row Matrix trigger
  for (let i = 0; i < rowEls.length; i++) {
    const rect = rowEls[i].getBoundingClientRect()
    if (rect.top <= triggerPoint + 60) {
      activeRow.value = i
    }
  }

  // Horizontal scroll sync
  if (horizContainerEl) {
    const rect = horizContainerEl.getBoundingClientRect()
    const scrolled = triggerPoint - rect.top
    const total = rect.height
    const p = Math.max(0, Math.min(1, scrolled / total))
    horizontalScrollIndex.value = Math.floor(p * (PIPELINE_MODULES.length - 1))
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
    activeQuad.value = 3
    activeRow.value = LIMITATIONS_MATRIX.length - 1
    return
  }
  await nextTick()
  quadEls = Array.from(rootEl.value?.querySelectorAll<HTMLElement>('.blueprint-quad') ?? [])
  rowEls = Array.from(rootEl.value?.querySelectorAll<HTMLElement>('.matrix-row') ?? [])
  horizContainerEl = rootEl.value?.querySelector<HTMLElement>('.blueprint-horiz-track') ?? null
  recalc()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
})

function scrollHoriz(direction: number) {
  if (!horizContainerEl) return
  const track = horizContainerEl.querySelector<HTMLElement>('.horiz-flex')
  if (track) {
    track.scrollBy({ left: direction * 320, behavior: 'smooth' })
  }
}
</script>

<template>
  <div ref="rootEl" class="blueprint-root container" aria-label="Methodology architectural specification">
    
    <!-- ════════════ HEADER: INDUSTRIAL MONOLITH ════════════ -->
    <header class="blueprint-header">
      <div class="bp-top-line">
        <span class="bp-tag">// SYSTEM SPECIFICATION</span>
        <span class="bp-ver">REV 2.4 — PRODUCTION</span>
      </div>
      <h1 class="bp-title">Engineering Methodology</h1>
      <p class="bp-lead">
        Architectural rules, pipeline data flow, and empirical governance boundaries 
        governing the churn prediction system.
      </p>
    </header>

    <!-- ════════════ PARADIGM 1: 4-QUADRANT SWISS BLUEPRINT GRID ════════════ -->
    <section class="bp-section">
      <div class="bp-section-head">
        <span class="bp-num">01</span>
        <h2 class="bp-h2">CORE PROTOCOL PRINCIPLES</h2>
      </div>

      <div class="blueprint-grid-2x2">
        <div 
          v-for="(p, i) in PRINCIPLES" 
          :key="p.code"
          class="blueprint-quad"
          :class="{ 'is-active': i <= activeQuad }"
        >
          <!-- Corner Crosshairs -->
          <span class="crosshair tl">+</span>
          <span class="crosshair tr">+</span>
          <span class="crosshair bl">+</span>
          <span class="crosshair br">+</span>

          <div class="quad-head">
            <span class="quad-code">{{ p.code }}</span>
            <span class="quad-status">{{ i <= activeQuad ? 'ENFORCED' : 'PENDING' }}</span>
          </div>

          <h3 class="quad-title">{{ p.title }}</h3>
          <p class="quad-desc">{{ p.desc }}</p>
        </div>
      </div>
    </section>

    <!-- ════════════ PARADIGM 2: HORIZONTAL CONVEYOR PIPELINE TRACK ════════════ -->
    <section class="bp-section blueprint-horiz-track">
      <div class="bp-section-head between-row">
        <div>
          <span class="bp-num">02</span>
          <h2 class="bp-h2">DATA FLOW PIPELINE ARCHITECTURE</h2>
        </div>
        <div class="horiz-controls">
          <button class="bp-btn" @click="scrollHoriz(-1)" aria-label="Scroll left">&larr;</button>
          <button class="bp-btn" @click="scrollHoriz(1)" aria-label="Scroll right">&rarr;</button>
        </div>
      </div>

      <!-- Horizontal Scrubbing Container -->
      <div class="horiz-flex">
        <div 
          v-for="(mod, i) in PIPELINE_MODULES" 
          :key="mod.id"
          class="horiz-card"
          :class="{ 'is-focused': i === horizontalScrollIndex }"
        >
          <div class="hcard-top">
            <span class="hcard-id">{{ mod.id }}</span>
            <span class="hcard-sub">{{ mod.sub }}</span>
          </div>

          <h3 class="hcard-name">{{ mod.name }}</h3>
          <p class="hcard-body">{{ mod.body }}</p>

          <div class="hcard-out">
            <span class="out-lbl">OUTPUT:</span>
            <code class="out-code">{{ mod.output }}</code>
          </div>
        </div>
      </div>

      <div class="bp-tech-strip">
        <span class="bp-tech-lbl">SYSTEM STACK:</span>
        <div class="bp-tech-tags">
          <span v-for="t in TECH_STACK" :key="t" class="bp-tag-item">{{ t }}</span>
        </div>
      </div>
    </section>

    <!-- ════════════ PARADIGM 3: TERMINAL GOVERNANCE MATRIX TABLE ════════════ -->
    <section class="bp-section">
      <div class="bp-section-head">
        <span class="bp-num">03</span>
        <h2 class="bp-h2">GOVERNANCE & LIMITATIONS MATRIX</h2>
      </div>

      <div class="matrix-table">
        <div class="matrix-head">
          <span>CODE</span>
          <span>CATEGORY</span>
          <span>RULE HEADLINE</span>
          <span>SPECIFICATION</span>
        </div>

        <div 
          v-for="(lim, i) in LIMITATIONS_MATRIX" 
          :key="lim.id"
          class="matrix-row"
          :class="{ 'is-active': i <= activeRow }"
        >
          <span class="col-id">{{ lim.id }}</span>
          <span class="col-cat">{{ lim.cat }}</span>
          <strong class="col-rule">{{ lim.rule }}</strong>
          <span class="col-spec">{{ lim.spec }}</span>
        </div>
      </div>
    </section>

  </div>
</template>

<style scoped>
/* ═══════════ SWISS INDUSTRIAL BLUEPRINT DESIGN SYSTEM ═══════════ */
.blueprint-root {
  width: 100%;
  padding-top: 3rem;
  padding-bottom: 6rem;
  display: flex;
  flex-direction: column;
  gap: 5.5rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

/* ── HEADER ── */
.blueprint-header {
  border-bottom: 1px solid var(--border);
  padding-bottom: 2rem;
  max-width: 800px;
}

.bp-top-line {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--muted);
  letter-spacing: 0.1em;
  margin-bottom: 1rem;
}

.bp-title {
  font-family: Inter, system-ui, sans-serif;
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  margin-bottom: 0.75rem;
}

.bp-lead {
  font-family: Inter, system-ui, sans-serif;
  font-size: 1.05rem;
  color: var(--muted);
  line-height: 1.6;
  margin: 0;
}

/* ── SECTIONS ── */
.bp-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.bp-section-head {
  display: flex;
  align-items: center;
  gap: 1rem;
  border-bottom: 1px dashed var(--border);
  padding-bottom: 0.75rem;
}

.bp-section-head.between-row {
  justify-content: space-between;
}

.bp-num {
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--muted);
  padding: 0.2rem 0.5rem;
  border: 1px solid var(--border);
  background: var(--surface2);
}

.bp-h2 {
  font-family: Inter, system-ui, sans-serif;
  font-size: 1.3rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  margin: 0;
}

/* ── PARADIGM 1: 2x2 SWISS BLUEPRINT GRID ── */
.blueprint-grid-2x2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.blueprint-quad {
  position: relative;
  padding: 2rem;
  background: var(--surface);
  border: 1px solid var(--border);
  opacity: 0.4;
  filter: saturate(0.2);
  transform: translateY(12px);
  transition: opacity 0.5s ease, transform 0.5s ease, border-color 0.5s ease;
}

.blueprint-quad.is-active {
  opacity: 1;
  filter: saturate(1);
  transform: translateY(0);
  border-color: var(--accent);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

/* Corner Crosshairs */
.crosshair {
  position: absolute;
  font-size: 0.8rem;
  color: var(--muted);
  line-height: 1;
  pointer-events: none;
}
.crosshair.tl { top: 4px; left: 6px; }
.crosshair.tr { top: 4px; right: 6px; }
.crosshair.bl { bottom: 4px; left: 6px; }
.crosshair.br { bottom: 4px; right: 6px; }

.quad-head {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--muted);
  margin-bottom: 1.25rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px var(--border) dashed;
}

.quad-code {
  font-weight: 800;
  color: var(--text);
}

.quad-title {
  font-family: Inter, system-ui, sans-serif;
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 0.6rem;
}

.quad-desc {
  font-family: Inter, system-ui, sans-serif;
  font-size: 0.92rem;
  line-height: 1.6;
  color: var(--muted);
  margin: 0;
}

/* ── PARADIGM 2: HORIZONTAL CONVEYOR TRACK ── */
.horiz-controls {
  display: flex;
  gap: 0.5rem;
}

.bp-btn {
  background: var(--surface2);
  border: 1px solid var(--border);
  color: var(--text);
  width: 36px;
  height: 36px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  display: grid;
  place-items: center;
  transition: border-color 0.2s ease;
}

.bp-btn:hover {
  border-color: var(--text);
}

.horiz-flex {
  display: flex;
  gap: 1.5rem;
  overflow-x: auto;
  padding: 0.5rem 0 1.5rem;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
}

.horiz-card {
  flex: 0 0 320px;
  scroll-snap-align: start;
  padding: 1.75rem;
  background: var(--surface);
  border: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1rem;
  opacity: 0.7;
  transition: border-color 0.3s ease, opacity 0.3s ease, transform 0.3s ease;
}

.horiz-card.is-focused, .horiz-card:hover {
  opacity: 1;
  border-color: var(--accent);
  transform: translateY(-4px);
}

.hcard-top {
  display: flex;
  justify-content: space-between;
  font-size: 0.72rem;
  color: var(--muted);
}

.hcard-id {
  font-weight: 800;
  color: var(--text);
}

.hcard-name {
  font-family: Inter, system-ui, sans-serif;
  font-size: 1.15rem;
  font-weight: 700;
  margin: 0;
}

.hcard-body {
  font-family: Inter, system-ui, sans-serif;
  font-size: 0.88rem;
  color: var(--muted);
  line-height: 1.5;
  margin: 0;
}

.hcard-out {
  padding-top: 0.75rem;
  border-top: 1px dashed var(--border);
  font-size: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.out-lbl {
  color: var(--muted);
  font-size: 0.68rem;
}

.out-code {
  color: var(--text);
  font-weight: 700;
}

.bp-tech-strip {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: var(--surface2);
  border: 1px solid var(--border);
  font-size: 0.78rem;
  flex-wrap: wrap;
}

.bp-tech-lbl {
  color: var(--muted);
  font-weight: 800;
}

.bp-tech-tags {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.bp-tag-item {
  padding: 0.2rem 0.5rem;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  font-size: 0.75rem;
}

/* ── PARADIGM 3: TERMINAL GOVERNANCE MATRIX TABLE ── */
.matrix-table {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border);
  background: var(--surface);
}

.matrix-head {
  display: grid;
  grid-template-columns: 90px 180px 240px 1fr;
  padding: 0.85rem 1.25rem;
  background: var(--surface2);
  border-bottom: 1px solid var(--border);
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--muted);
  letter-spacing: 0.08em;
}

.matrix-row {
  display: grid;
  grid-template-columns: 90px 180px 240px 1fr;
  padding: 1.1rem 1.25rem;
  border-bottom: 1px solid var(--border);
  font-size: 0.85rem;
  align-items: center;
  gap: 0.5rem;
  opacity: 0.4;
  transition: opacity 0.4s ease, background 0.4s ease;
}

.matrix-row:last-child {
  border-bottom: 0;
}

.matrix-row.is-active {
  opacity: 1;
}

.matrix-row:hover {
  background: color-mix(in srgb, var(--surface2) 60%, transparent);
}

.col-id {
  font-weight: 800;
  color: var(--muted);
  font-size: 0.78rem;
}

.col-cat {
  color: var(--muted);
  font-size: 0.78rem;
}

.col-rule {
  font-family: Inter, system-ui, sans-serif;
  color: var(--text);
  font-size: 0.9rem;
}

.col-spec {
  font-family: Inter, system-ui, sans-serif;
  color: var(--muted);
  font-size: 0.85rem;
  line-height: 1.45;
}

/* ── RESPONSIVE ── */
@media (max-width: 900px) {
  .blueprint-grid-2x2 {
    grid-template-columns: 1fr;
  }
  .matrix-head {
    display: none;
  }
  .matrix-row {
    grid-template-columns: 1fr;
    gap: 0.3rem;
  }
}

/* ── REDUCED MOTION ── */
@media (prefers-reduced-motion: reduce) {
  .blueprint-quad, .horiz-card, .matrix-row {
    opacity: 1;
    transform: none;
    filter: none;
  }
}
</style>