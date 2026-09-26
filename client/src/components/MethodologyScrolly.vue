<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { LIMITATIONS } from '../data/results'

const rootEl = ref<HTMLElement | null>(null)
const activePrinciple = ref(0)
const activePipelineNode = ref(0)
const activeLimitation = ref(0)
const scrollProgress = ref(0)
const reducedMotion = ref(false)

let ticking = false

// Data Science Principles (Layer Stack)
const PRINCIPLES = [
  {
    num: '01',
    code: 'PROTO-SPLIT',
    title: 'Split Before Fitting',
    summary: 'Prevent data leakage by fitting transformers strictly within training folds.',
    detail: 'Scaling, encoding, and imputation parameters are estimated exclusively on training data inside each cross-validation fold. Zero test set bleed.'
  },
  {
    num: '02',
    code: 'PROTO-FAIR',
    title: 'Fair Baseline Comparison',
    summary: 'Evaluate candidate models under identical preprocessing and fold seeds.',
    detail: 'All 5 model families (Logistic Regression, Decision Tree, Random Forest, Gradient Boosting, XGBoost) use identical StratifiedKFold partitions with random_state = 42.'
  },
  {
    num: '03',
    code: 'PROTO-LOCK',
    title: 'Single-Pass Test Evaluation',
    summary: 'Reserve the test set exclusively for final verification.',
    detail: 'Hyperparameter tuning and decision threshold optimization use training data only. The held-out test set (1,409 customers) is evaluated exactly once.'
  },
  {
    num: '04',
    code: 'PROTO-METRIC',
    title: 'Recall-Weighted Metrics',
    summary: 'Prioritize catching churners over naive overall accuracy.',
    detail: 'Evaluated on Recall, Precision, F1, and ROC-AUC. Threshold 0.17 was tuned via out-of-fold F2 scoring because missed churners cost ~2x false alarms.'
  }
]

// Pipeline Orbit Nodes
const PIPELINE_NODES = [
  {
    id: 'NODE-1',
    title: '01 / Vue 3 Ingress',
    sub: 'Client State & Payload Serialization',
    desc: 'Captures raw customer inputs from the interface and serializes a clean JSON request without client-side feature calculation.'
  },
  {
    id: 'NODE-2',
    title: '02 / FastAPI Gateway',
    sub: 'Schema Validation & Security',
    desc: 'Validates input types against Pydantic schemas, handles missing optional fields, and manages API CORS boundaries.'
  },
  {
    id: 'NODE-3',
    title: '03 / Feature Engine',
    sub: 'Server-Side Derived Features',
    desc: 'Rebuilds 4 derived features (num_addons, has_security_support, auto_pay, tenure_group) and applies standard scaling.'
  },
  {
    id: 'NODE-4',
    title: '04 / XGBoost Core',
    sub: 'Probability Scoring & Threshold Cutoff',
    desc: 'Passes the 33-dimensional feature vector into the tuned XGBoost model and applies the 0.17 decision threshold.'
  },
  {
    id: 'NODE-5',
    title: '05 / SHAP Explainer',
    sub: 'TreeExplainer Local Contributions',
    desc: 'Computes marginal feature attributions for the customer score to surface top risk drivers.'
  }
]

// Known Limitations (Accordion Deck)
const LIMITATION_DECK = LIMITATIONS.map((lim, idx) => {
  const categories = [
    { cat: 'CAUSALITY', title: 'Association, Not Causation' },
    { cat: 'TEMPORALITY', title: 'Single Snapshot Dataset' },
    { cat: 'PERFORMANCE', title: 'Signal Ceiling (~0.85 ROC-AUC)' },
    { cat: 'ECONOMICS', title: 'Precision Floor (44.9%)' },
    { cat: 'THRESHOLD', title: 'Assumed Cost Ratio (0.17 Cutoff)' },
    { cat: 'COLINEARITY', title: 'Correlated Feature Signals' },
    { cat: 'COMPLIANCE', title: 'Demographic Inputs Audit' }
  ]
  return {
    num: `0${idx + 1}`,
    cat: categories[idx]?.cat || 'GOVERNANCE',
    title: categories[idx]?.title || `Limitation #${idx + 1}`,
    text: lim
  }
})

// Active pipeline node getter
const currentPipelineNode = computed(() => PIPELINE_NODES[activePipelineNode.value] || PIPELINE_NODES[0])

function recalc() {
  ticking = false
  if (!rootEl.value) return

  const windowHeight = window.innerHeight
  const triggerPoint = windowHeight * 0.6
  const rect = rootEl.value.getBoundingClientRect()

  // Overall scroll progress (0 to 1)
  const scrolled = triggerPoint - rect.top
  const total = rect.height - windowHeight * 0.4
  scrollProgress.value = Math.max(0, Math.min(1, scrolled / Math.max(1, total)))

  // Section 1: Principles progress
  const pEls = Array.from(rootEl.value.querySelectorAll<HTMLElement>('.ms-spec-layer'))
  for (let i = 0; i < pEls.length; i++) {
    if (pEls[i].getBoundingClientRect().top <= triggerPoint) {
      activePrinciple.value = i
    }
  }

  // Section 2: Pipeline nodes progress
  const nEls = Array.from(rootEl.value.querySelectorAll<HTMLElement>('.ms-orbit-node-btn'))
  for (let i = 0; i < nEls.length; i++) {
    if (nEls[i].getBoundingClientRect().top <= triggerPoint + 60) {
      activePipelineNode.value = i
    }
  }

  // Section 3: Limitations accordion progress
  const lEls = Array.from(rootEl.value.querySelectorAll<HTMLElement>('.ms-acc-item'))
  for (let i = 0; i < lEls.length; i++) {
    if (lEls[i].getBoundingClientRect().top <= triggerPoint + 80) {
      activeLimitation.value = i
    }
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
    activePrinciple.value = PRINCIPLES.length - 1
    activePipelineNode.value = PIPELINE_NODES.length - 1
    activeLimitation.value = LIMITATION_DECK.length - 1
    scrollProgress.value = 1
    return
  }
  await nextTick()
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
  <div ref="rootEl" class="ms-root container" aria-label="Methodology interactive scrollytelling canvas">

    <!-- ════════════ STICKY HEADER PROGRESS DIAL ════════════ -->
    <div class="ms-sticky-dial card glass">
      <div class="ms-dial-left">
        <span class="ms-dial-tag">METHODOLOGY CANVAS</span>
        <div class="ms-dial-bar">
          <div class="ms-dial-fill" :style="{ width: `${scrollProgress * 100}%` }"></div>
        </div>
      </div>
      <div class="ms-dial-steps">
        <span :class="{ active: scrollProgress < 0.33 }">01. PROTOCOLS</span>
        <span :class="{ active: scrollProgress >= 0.33 && scrollProgress < 0.66 }">02. PIPELINE</span>
        <span :class="{ active: scrollProgress >= 0.66 }">03. GOVERNANCE</span>
      </div>
    </div>

    <!-- ════════════ HERO ════════════ -->
    <header class="ms-hero">
      <span class="eyebrow">Engineering Specifications</span>
      <h1 class="h1">System Architecture & Methodology</h1>
      <p class="lead">
        Interactive specification covering data splitting guardrails, server-side pipeline nodes, 
        and empirical governance boundaries.
      </p>
    </header>

    <!-- ════════════ SECTION 1: MONOLITHIC SPECIFICATION LAYER STACK ════════════ -->
    <section class="ms-section">
      <div class="ms-section-head">
        <span class="ms-sec-num">01</span>
        <div>
          <span class="eyebrow">Core Protocols</span>
          <h2 class="h2">Data Science Layer Stack</h2>
        </div>
      </div>

      <!-- Monolithic Frame containing progressive spec layers -->
      <div class="ms-monolith-frame card glass">
        <div class="ms-frame-header">
          <span>SPECIFICATION FRAME // ENFORCED SYSTEM RULES</span>
          <span class="ms-frame-ver">ACTIVE EXECUTION</span>
        </div>

        <div class="ms-spec-layers">
          <div 
            v-for="(p, i) in PRINCIPLES" 
            :key="p.code"
            class="ms-spec-layer"
            :class="{ 'is-active': i <= activePrinciple }"
          >
            <div class="ms-layer-top">
              <span class="ms-layer-num">{{ p.num }}</span>
              <span class="ms-layer-code">{{ p.code }}</span>
              <span class="ms-status-dot" :class="{ 'on': i <= activePrinciple }"></span>
            </div>

            <div class="ms-layer-body">
              <h3 class="ms-layer-title">{{ p.title }}</h3>
              <p class="ms-layer-summary">{{ p.summary }}</p>
              <div v-if="i <= activePrinciple" class="ms-layer-detail">
                <span>VERIFIED RULE:</span> {{ p.detail }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ════════════ SECTION 2: CIRCULAR SYSTEM ORBIT ENGINE ════════════ -->
    <section class="ms-section">
      <div class="ms-section-head">
        <span class="ms-sec-num">02</span>
        <div>
          <span class="eyebrow">Data Pipeline</span>
          <h2 class="h2">Interactive System Core & Node Orbit</h2>
        </div>
      </div>

      <div class="ms-orbit-stage card glass">
        
        <!-- Left: Central Core Display -->
        <div class="ms-core-display">
          <div class="ms-core-badge">SELECTED STAGE NODE</div>
          <h3 class="ms-core-title">{{ currentPipelineNode.title }}</h3>
          <span class="ms-core-sub">{{ currentPipelineNode.sub }}</span>
          <p class="ms-core-desc">{{ currentPipelineNode.desc }}</p>
        </div>

        <!-- Right: Satellite Orbit Nodes Switcher -->
        <div class="ms-orbit-nodes">
          <div class="ms-nodes-title">SYSTEM PROCESSING STAGES</div>
          <button 
            v-for="(n, i) in PIPELINE_NODES" 
            :key="n.id"
            class="ms-orbit-node-btn"
            :class="{ 'is-active': i === activePipelineNode, 'is-past': i < activePipelineNode }"
            @click="activePipelineNode = i"
          >
            <span class="node-btn-num">0{{ i + 1 }}</span>
            <div class="node-btn-info">
              <strong>{{ n.title.split('/')[1] }}</strong>
              <small>{{ n.sub }}</small>
            </div>
            <span class="node-btn-arrow">&rarr;</span>
          </button>
        </div>

      </div>
    </section>

    <!-- ════════════ SECTION 3: AUTO-COLLAPSING GOVERNANCE ACCORDION DECK ════════════ -->
    <section class="ms-section">
      <div class="ms-section-head">
        <span class="ms-sec-num">03</span>
        <div>
          <span class="eyebrow">Governance Audit</span>
          <h2 class="h2">Known Limitations Disclosure Deck</h2>
        </div>
      </div>

      <div class="ms-accordion-deck">
        <div 
          v-for="(lim, i) in LIMITATION_DECK" 
          :key="lim.num"
          class="ms-acc-item card glass"
          :class="{ 'is-expanded': i === activeLimitation }"
          @click="activeLimitation = i"
        >
          <div class="ms-acc-header">
            <div class="ms-acc-title-group">
              <span class="ms-acc-num">{{ lim.num }}</span>
              <span class="chip">{{ lim.cat }}</span>
              <strong class="ms-acc-title">{{ lim.title }}</strong>
            </div>
            <span class="ms-acc-toggle">{{ i === activeLimitation ? '−' : '+' }}</span>
          </div>

          <div v-if="i === activeLimitation" class="ms-acc-body">
            <p class="ms-acc-text">{{ lim.text }}</p>
          </div>
        </div>
      </div>
    </section>

  </div>
</template>

<style scoped>
.ms-root {
  width: 100%;
  padding-top: 1rem;
  padding-bottom: 6rem;
  display: flex;
  flex-direction: column;
  gap: 4.5rem;
  position: relative;
}

/* ── STICKY DIAL ── */
.ms-sticky-dial {
  position: sticky;
  top: 5rem;
  z-index: 15;
  padding: 0.85rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 12px;
  margin-bottom: 1rem;
}

.ms-dial-left {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  max-width: 420px;
}

.ms-dial-tag {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: var(--muted);

  white-space: nowrap;
}

.ms-dial-bar {
  flex: 1;
  height: 6px;
  background: var(--surface2);
  border-radius: 99px;
  overflow: hidden;
  border: 1px solid var(--border);
}

.ms-dial-fill {
  height: 100%;
  background: var(--accent);
  transition: width 0.15s linear;
}

.ms-dial-steps {
  display: flex;
  gap: 1.25rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--muted);
}

.ms-dial-steps span.active {
  color: var(--text);
}

/* ── HERO ── */
.ms-hero {
  max-width: 720px;
}

.ms-hero .lead {
  margin-bottom: 0;
}

/* ── SECTIONS ── */
.ms-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.ms-section-head {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.ms-sec-num {
  font-size: 0.9rem;
  font-weight: 800;
  color: var(--muted);
  padding: 0.3rem 0.6rem;
  border-radius: 8px;
  background: var(--surface2);
  border: 1px solid var(--border);
}

/* ── SECTION 1: MONOLITHIC SPECIFICATION STACK ── */
.ms-monolith-frame {
  padding: 0;
  overflow: hidden;
  border-color: color-mix(in srgb, var(--accent) 30%, var(--border));
}

.ms-frame-header {
  display: flex;
  justify-content: space-between;
  padding: 0.85rem 1.5rem;
  background: var(--surface2);
  border-bottom: 1px solid var(--border);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: var(--muted);
}

.ms-spec-layers {
  display: flex;
  flex-direction: column;
}

.ms-spec-layer {
  padding: 1.75rem;
  border-bottom: 1px solid var(--border);
  opacity: 0.4;
  filter: saturate(0.3);
  transition: opacity 0.5s var(--ease), filter 0.5s var(--ease), background 0.5s var(--ease);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.ms-spec-layer:last-child {
  border-bottom: 0;
}

.ms-spec-layer.is-active {
  opacity: 1;
  filter: saturate(1);
  background: color-mix(in srgb, var(--surface) 80%, transparent);
}

.ms-layer-top {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.78rem;
  color: var(--muted);
}

.ms-layer-num {
  font-weight: 800;

}

.ms-layer-code {
  font-weight: 700;

  color: var(--muted);
}

.ms-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--border);
  margin-left: auto;
  transition: background 0.3s ease, box-shadow 0.3s ease;
}

.ms-status-dot.on {
  background: var(--low);
  box-shadow: 0 0 8px var(--low);
}

.ms-layer-title {
  font-size: 1.25rem;
  margin-bottom: 0.3rem;
}

.ms-layer-summary {
  font-size: 0.95rem;
  color: var(--muted);
  line-height: 1.55;
  margin: 0;
}

.ms-layer-detail {
  font-size: 0.85rem;
  line-height: 1.5;
  padding: 0.65rem 0.9rem;
  border-radius: 8px;
  background: var(--surface2);
  border: 1px solid var(--border);
  color: var(--text);

  margin-top: 0.4rem;
}

.ms-layer-detail span {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: var(--muted);
  margin-right: 0.4rem;
}

/* ── SECTION 2: SYSTEM ORBIT STAGE ── */
.ms-orbit-stage {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 2rem;
  padding: 2rem;
  align-items: center;
}

.ms-core-display {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 2rem;
  border-radius: var(--r);
  background: var(--surface2);
  border: 1px solid var(--border);
}

.ms-core-badge {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: var(--accent);
}

.ms-core-title {
  font-size: 1.35rem;
  margin: 0;
}

.ms-core-sub {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--muted);
}

.ms-core-desc {
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--muted);
  margin: 0;
}

.ms-orbit-nodes {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.ms-nodes-title {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: var(--muted);
  margin-bottom: 0.25rem;
}

.ms-orbit-node-btn {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.85rem 1.1rem;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--muted);
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: all 0.3s var(--ease);
}

.ms-orbit-node-btn:hover {
  border-color: var(--accent);
  color: var(--text);
}

.ms-orbit-node-btn.is-active {
  background: var(--surface2);
  border-color: var(--accent);
  color: var(--text);
  box-shadow: 0 4px 16px color-mix(in srgb, var(--accent) 15%, transparent);
}

.node-btn-num {
  font-size: 0.78rem;
  font-weight: 800;

  color: var(--muted);
}

.node-btn-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.node-btn-info strong {
  font-size: 0.92rem;
}

.node-btn-info small {
  font-size: 0.75rem;
  color: var(--muted);
}

.node-btn-arrow {
  font-size: 1rem;
  opacity: 0.5;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.ms-orbit-node-btn.is-active .node-btn-arrow {
  opacity: 1;
  transform: translateX(4px);
  color: var(--accent);
}

/* ── SECTION 3: ACCORDION DISCLOSURE DECK ── */
.ms-accordion-deck {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.ms-acc-item {
  padding: 1.25rem 1.75rem;
  border-radius: 14px;
  border: 1px solid var(--border);
  cursor: pointer;
  transition: all 0.4s var(--ease);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.ms-acc-item.is-expanded {
  border-color: var(--accent);
  box-shadow: 0 8px 28px color-mix(in srgb, var(--accent) 12%, transparent);
  background: color-mix(in srgb, var(--surface) 90%, transparent);
}

.ms-acc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ms-acc-title-group {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.ms-acc-num {
  font-size: 0.8rem;
  font-weight: 800;

  color: var(--muted);
}

.ms-acc-title {
  font-size: 1.05rem;
  font-weight: 700;
}

.ms-acc-toggle {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--muted);

}

.ms-acc-body {
  padding-top: 0.5rem;
  border-top: 1px dashed var(--border);
}

.ms-acc-text {
  font-size: 0.92rem;
  line-height: 1.6;
  color: var(--muted);
  margin: 0;
}

/* ── RESPONSIVE ── */
@media (max-width: 880px) {
  .ms-orbit-stage {
    grid-template-columns: 1fr;
  }
  .ms-sticky-dial {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}

/* ── REDUCED MOTION ── */
@media (prefers-reduced-motion: reduce) {
  .ms-spec-layer, .ms-acc-item {
    opacity: 1;
    filter: none;
  }
}
</style>
