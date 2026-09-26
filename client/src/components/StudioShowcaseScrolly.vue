<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

const rootEl = ref<HTMLElement | null>(null)
const activeIndex = ref(0)
const scrollProgress = ref(0)
const reducedMotion = ref(false)

let cardEls: HTMLElement[] = []
let ticking = false

const STEPS = [
  {
    num: '01',
    title: 'Select or Configure Profile',
    desc: 'Choose from 4 instant personas or enter custom contract and billing choices.',
    pillText: 'Sarah M. • Month-to-month • Fiber optic • $89.50/mo',
    tag: 'Profile Input'
  },
  {
    num: '02',
    title: 'Instant Risk & SHAP Explanation',
    desc: 'The tuned XGBoost model scores churn probability instantly and surfaces drivers.',
    pillText: '78.4% Churn Risk • Exceeds 0.17 Threshold',
    tag: 'Live Scoring',
    isDanger: true
  },
  {
    num: '03',
    title: 'Simulate What-If Scenarios',
    desc: 'Test intervention strategies to see how risk drops before offering retention offers.',
    pillText: 'Contract to 2-Year → Risk drops to 12.1% (-66.3%)',
    tag: 'What-If Simulation',
    isGood: true
  }
]

function recalc() {
  ticking = false
  if (!rootEl.value || !cardEls.length) return

  const windowHeight = window.innerHeight
  const triggerPoint = windowHeight * 0.65
  const rect = rootEl.value.getBoundingClientRect()

  const scrolled = triggerPoint - rect.top
  const totalHeight = rect.height - windowHeight * 0.3

  const rawP = scrolled / Math.max(1, totalHeight)
  scrollProgress.value = Math.max(0, Math.min(1, rawP))

  let current = 0
  for (let i = 0; i < cardEls.length; i++) {
    const cRect = cardEls[i].getBoundingClientRect()
    if (cRect.top <= triggerPoint + 40) {
      current = i
    }
  }
  activeIndex.value = current
}

function onScroll() {
  if (ticking) return
  ticking = true
  requestAnimationFrame(recalc)
}

onMounted(async () => {
  reducedMotion.value = matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reducedMotion.value) {
    activeIndex.value = STEPS.length - 1
    scrollProgress.value = 1
    return
  }
  await nextTick()
  cardEls = Array.from(rootEl.value?.querySelectorAll<HTMLElement>('.ss-card-item') ?? [])
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
  <div ref="rootEl" class="ss-full-root" aria-label="Prediction studio full width scroll section">
    
    <!-- Section Header -->
    <div class="ss-header">
      <span class="eyebrow">Prediction Studio</span>
      <h2 class="h2">Try it on a customer.</h2>
      <p class="lead">
        Enter a profile, or load an example, and see the risk, the reasons, 
        and a what-if scenario scored by the live model.
      </p>
    </div>

    <!-- Full-Width 3-Column Grid of Scroll Steps -->
    <div class="ss-grid-container">
      <div 
        v-for="(s, i) in STEPS" 
        :key="s.num"
        class="ss-card-item card glass"
        :class="{ 'is-active': i <= activeIndex }"
      >
        <div class="ss-card-top">
          <span class="ss-card-num">{{ s.num }}</span>
          <span class="chip">{{ s.tag }}</span>
        </div>

        <h3 class="ss-card-title">{{ s.title }}</h3>
        <p class="ss-card-desc">{{ s.desc }}</p>

        <div 
          class="ss-preview-pill"
          :class="{ 'pill-danger': s.isDanger, 'pill-good': s.isGood }"
        >
          <span>{{ s.pillText }}</span>
        </div>
      </div>
    </div>

    <!-- Full-Width Bottom CTA Box -->
    <div class="ss-cta-box card glass" :class="{ 'is-active': activeIndex >= 2 }">
      <div class="ss-cta-content">
        <div>
          <h3 class="h3" style="margin-bottom: 0.3rem">Ready to analyze customer profiles?</h3>
          <p class="muted" style="margin: 0">
            Access the full studio with pre-loaded personas, custom parameter inputs, and real-time model scoring.
          </p>
        </div>
        <RouterLink to="/predict" class="btn primary btn-cta">
          Open the prediction studio &rarr;
        </RouterLink>
      </div>
    </div>

  </div>
</template>

<style scoped>
.ss-full-root {
  position: relative;
  width: 100%;
  margin: 3rem 0 1rem;
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

/* ── HEADER ── */
.ss-header {
  max-width: 680px;
}

.ss-header .lead {
  margin-bottom: 0;
}

/* ── FULL WIDTH 3-COLUMN GRID ── */
.ss-grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  width: 100%;
}

.ss-card-item {
  padding: 1.75rem;
  border-radius: var(--r);
  border: 1px solid var(--border);
  opacity: 0.35;
  filter: saturate(0.4);
  transform: translateY(16px);
  transition: opacity 0.6s var(--ease), transform 0.6s var(--ease), filter 0.6s var(--ease), border-color 0.6s var(--ease);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.ss-card-item.is-active {
  opacity: 1;
  filter: saturate(1);
  transform: translateY(0);
  border-color: var(--accent);
  box-shadow: 0 8px 30px color-mix(in srgb, var(--accent) 12%, transparent);
}

.ss-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.ss-card-num {
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  color: var(--muted);
}

.ss-card-item.is-active .ss-card-num {
  color: var(--accent);
}

.ss-card-title {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
}

.ss-card-desc {
  font-size: 0.92rem;
  line-height: 1.55;
  color: var(--muted);
  margin-bottom: 1.5rem;
  flex: 1;
}

.ss-preview-pill {
  display: flex;
  align-items: center;
  padding: 0.6rem 0.85rem;
  border-radius: 10px;
  font-size: 0.82rem;
  font-weight: 600;
  background: var(--surface2);
  border: 1px solid var(--border);
  color: var(--text);
  line-height: 1.35;
}

.pill-danger {
  background: color-mix(in srgb, var(--high) 12%, var(--surface2));
  color: var(--high);
  border-color: color-mix(in srgb, var(--high) 30%, transparent);
}

.pill-good {
  background: color-mix(in srgb, var(--low) 12%, var(--surface2));
  color: var(--low);
  border-color: color-mix(in srgb, var(--low) 30%, transparent);
}

/* ── FULL WIDTH BOTTOM CTA ── */
.ss-cta-box {
  width: 100%;
  padding: 2.25rem 2.5rem;
  border-radius: var(--r);
  border: 1px solid var(--border);
  opacity: 0.4;
  transform: translateY(16px);
  transition: opacity 0.6s var(--ease), transform 0.6s var(--ease), border-color 0.6s var(--ease);
}

.ss-cta-box.is-active {
  opacity: 1;
  transform: translateY(0);
  border-color: var(--low);
  box-shadow: 0 12px 36px color-mix(in srgb, var(--low) 15%, transparent);
}

.ss-cta-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.btn-cta {
  padding: 0.85rem 1.75rem;
  font-size: 1.02rem;
  white-space: nowrap;
}

/* ── RESPONSIVE ── */
@media (max-width: 900px) {
  .ss-grid-container {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }
  .ss-cta-content {
    flex-direction: column;
    align-items: flex-start;
  }
}

/* ── REDUCED MOTION ── */
@media (prefers-reduced-motion: reduce) {
  .ss-card-item, .ss-cta-box {
    opacity: 1;
    transform: none;
    filter: none;
  }
}
</style>
