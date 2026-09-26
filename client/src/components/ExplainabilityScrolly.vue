<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { SHAP } from '../data/results'

const rootEl = ref<HTMLElement | null>(null)
const activeStep = ref(0)
const scrollProgress = ref(0)
const reducedMotion = ref(false)

let stepEls: HTMLElement[] = []
let ticking = false

const items = computed(() => SHAP.slice(0, 6))
const maxVal = computed(() => Math.max(...items.value.map(i => Math.abs(i.value)), 0.0001))

function recalc() {
  ticking = false
  if (!rootEl.value || !stepEls.length) return

  const windowHeight = window.innerHeight
  const triggerPoint = windowHeight * 0.55
  const rect = rootEl.value.getBoundingClientRect()

  const scrolled = triggerPoint - rect.top
  const totalHeight = rect.height - windowHeight * 0.3

  const rawP = scrolled / Math.max(1, totalHeight)
  scrollProgress.value = Math.max(0, Math.min(1, rawP))

  let current = 0
  for (let i = 0; i < stepEls.length; i++) {
    const sRect = stepEls[i].getBoundingClientRect()
    if (sRect.top <= triggerPoint) {
      current = i
    }
  }
  activeStep.value = current
}

function onScroll() {
  if (ticking) return
  ticking = true
  requestAnimationFrame(recalc)
}

onMounted(async () => {
  reducedMotion.value = matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reducedMotion.value) {
    activeStep.value = 2
    scrollProgress.value = 1
    return
  }
  await nextTick()
  stepEls = Array.from(rootEl.value?.querySelectorAll<HTMLElement>('.es-step') ?? [])
  recalc()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
})

function isItemActive(index: number) {
  if (reducedMotion.value) return true
  if (activeStep.value === 0 && (index === 0 || index === 1)) return true
  if (activeStep.value === 1 && (index === 2 || index === 3)) return true
  if (activeStep.value >= 2 && (index === 4 || index === 5)) return true
  return false
}

function getItemWidth(val: number, index: number) {
  if (reducedMotion.value) {
    return (Math.abs(val) / maxVal.value) * 50 + '%'
  }
  // Reveal bars progressively as scroll occurs
  const unlocked = activeStep.value * 2 + 1 >= index
  if (!unlocked && scrollProgress.value < 0.1) return '0%'
  return (Math.abs(val) / maxVal.value) * 50 + '%'
}
</script>

<template>
  <div ref="rootEl" class="es-root" aria-label="Interactive SHAP explainability scrollytelling">
    <div class="es-grid">

      <!-- LEFT COLUMN: Scroll Steps -->
      <div class="es-steps">

        <div class="es-header">
          <span class="eyebrow">Explainability</span>
          <h2 class="h2">Why customers leave.</h2>
          <p class="lead">
            SHAP (SHapley Additive exPlanations) values reveal which factors move churn risk, 
            in which direction, and how strongly across the entire test set.
          </p>
        </div>

        <!-- Step 0: Contract & Tenure -->
        <div 
          class="es-step card glass" 
          :class="{ 'is-active': activeStep === 0 }"
        >
          <div class="es-step-tag">DRIVER GROUP #1</div>
          <h3 class="es-step-title">Contract Type & Tenure Dominate</h3>
          <p class="es-step-text">
            <strong>Month-to-month contracts</strong> are by far the single strongest churn driver (+0.619 SHAP). 
            Conversely, <strong>customer tenure</strong> provides the strongest natural protection against churn (-0.317 SHAP).
          </p>
          <div class="es-highlights">
            <span class="es-badge high">Month-to-Month (+0.619)</span>
            <span class="es-badge low">Longer Tenure (-0.317)</span>
          </div>
        </div>

        <!-- Step 1: Internet & Payment -->
        <div 
          class="es-step card glass" 
          :class="{ 'is-active': activeStep === 1 }"
        >
          <div class="es-step-tag">DRIVER GROUP #2</div>
          <h3 class="es-step-title">Service & Payment Friction</h3>
          <p class="es-step-text">
            <strong>Fiber optic service</strong> (+0.251 SHAP) shows surprisingly high churn velocity, often driven by higher price points. 
            Paying via <strong>Electronic check</strong> (+0.191 SHAP) also strongly correlates with uncommitted behavior.
          </p>
          <div class="es-highlights">
            <span class="es-badge high">Fiber Optic (+0.251)</span>
            <span class="es-badge high">Electronic Check (+0.191)</span>
          </div>
        </div>

        <!-- Step 2: Pricing & Long-Term Commitment -->
        <div 
          class="es-step card glass" 
          :class="{ 'is-active': activeStep >= 2 }"
        >
          <div class="es-step-tag">DRIVER GROUP #3</div>
          <h3 class="es-step-title">Financial Strain vs. Long-Term Loyalty</h3>
          <p class="es-step-text">
            High <strong>monthly charges</strong> (+0.173 SHAP) add continuous churn risk, whereas 
            securing a <strong>two-year contract</strong> (-0.159 SHAP) effectively anchors the customer long-term.
          </p>
          <div class="es-cta-row">
            <RouterLink to="/insights" class="btn primary">
              Read full insights &rarr;
            </RouterLink>
          </div>
        </div>

      </div>

      <!-- RIGHT COLUMN: Sticky Dynamic SHAP Waterfall Panel -->
      <div class="es-panel-wrap">
        <div class="es-panel card glass">

          <div class="es-panel-header">
            <div class="es-panel-title">
              <span>SHAP Global Driver Breakdown</span>
              <h3 class="h3" style="margin:0">Impact on Churn Risk</h3>
            </div>
            <div class="es-legend">
              <span class="leg-item low"><i /> Lowers churn risk</span>
              <span class="leg-item high"><i /> Raises churn risk</span>
            </div>
          </div>

          <!-- SHAP Bar List -->
          <ul class="es-shap-list">
            <li 
              v-for="(it, i) in items" 
              :key="it.label"
              class="es-shap-item"
              :class="{ 
                'is-focused': isItemActive(i), 
                'is-positive': it.value > 0, 
                'is-negative': it.value < 0 
              }"
            >
              <div class="es-row-top">
                <span class="es-label">{{ it.label }}</span>
                <span class="es-val" :class="it.value > 0 ? 'high-val' : 'low-val'">
                  {{ it.value > 0 ? `+${it.value.toFixed(3)}` : it.value.toFixed(3) }}
                </span>
              </div>

              <div class="es-track-container">
                <span class="es-mid-line" />
                <span 
                  class="es-bar" 
                  :class="it.value > 0 ? 'up' : 'down'"
                  :style="{ 
                    width: getItemWidth(it.value, i), 
                    transitionDelay: `${(i % 2) * 80}ms` 
                  }" 
                />
              </div>

              <div class="es-sub">{{ it.sub }}</div>
            </li>
          </ul>

          <div class="es-footer-note">
            <p class="muted" style="margin:0">
              * Bars represent mean absolute SHAP values calculated across 1,409 test set predictions.
            </p>
          </div>

        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.es-root {
  position: relative;
  width: 100%;
  margin: 3rem 0;
}

.es-grid {
  display: grid;
  grid-template-columns: 1fr 1.1fr;
  gap: 3.5rem;
  align-items: start;
}

/* ── LEFT COLUMN ── */
.es-steps {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.es-header {
  margin-bottom: 1rem;
}

.es-step {
  padding: 1.75rem;
  border-radius: var(--r);
  border: 1px solid var(--border);
  opacity: 0.45;
  filter: saturate(0.5);
  transform: translateY(10px);
  transition: opacity 0.5s var(--ease), transform 0.5s var(--ease), filter 0.5s var(--ease), border-color 0.5s var(--ease);
}

.es-step.is-active {
  opacity: 1;
  filter: saturate(1);
  transform: translateY(0);
  border-color: var(--accent);
  box-shadow: 0 8px 32px color-mix(in srgb, var(--accent) 15%, transparent);
}

.es-step-tag {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  background: var(--surface2);
  color: var(--muted);
  margin-bottom: 0.75rem;
}

.es-step.is-active .es-step-tag {
  background: color-mix(in srgb, var(--accent) 15%, var(--surface2));
  color: var(--accent);
}

.es-step-title {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}

.es-step-text {
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 1rem;
  color: var(--muted);
}

.es-highlights {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.es-badge {
  font-size: 0.78rem;
  font-weight: 700;
  padding: 0.25rem 0.65rem;
  border-radius: 99px;
}

.es-badge.high {
  background: color-mix(in srgb, var(--high) 15%, var(--surface2));
  color: var(--high);
  border: 1px solid color-mix(in srgb, var(--high) 30%, transparent);
}

.es-badge.low {
  background: color-mix(in srgb, var(--low) 15%, var(--surface2));
  color: var(--low);
  border: 1px solid color-mix(in srgb, var(--low) 30%, transparent);
}

.es-cta-row {
  margin-top: 1rem;
}

/* ── RIGHT COLUMN (STICKY PANEL) ── */
.es-panel-wrap {
  position: sticky;
  top: 6rem;
  align-self: start;
}

.es-panel {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  border-color: color-mix(in srgb, var(--accent) 30%, var(--border));
}

.es-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border);
}

.es-panel-title span {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--muted);
  display: block;
  margin-bottom: 0.2rem;
}

.es-legend {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.leg-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.leg-item i {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.leg-item.low i { background: var(--low); box-shadow: 0 0 8px var(--low); }
.leg-item.high i { background: var(--high); box-shadow: 0 0 8px var(--high); }

/* ── SHAP LIST ── */
.es-shap-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.es-shap-item {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  opacity: 0.5;
  filter: saturate(0.4);
  transition: opacity 0.4s var(--ease), filter 0.4s var(--ease), transform 0.4s var(--ease);
}

.es-shap-item.is-focused {
  opacity: 1;
  filter: saturate(1);
  transform: translateX(4px);
}

.es-row-top {
  display: flex;
  justify-content: space-between;
  font-size: 0.88rem;
  font-weight: 600;
}

.es-val {
  font-family: ui-monospace, monospace;
  font-size: 0.85rem;
  font-weight: 700;
}

.high-val { color: var(--high); }
.low-val { color: var(--low); }

.es-track-container {
  position: relative;
  height: 12px;
  background: var(--surface2);
  border-radius: 99px;
  overflow: hidden;
  border: 1px solid var(--border);
}

.es-mid-line {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--border);
  z-index: 1;
}

.es-bar {
  position: absolute;
  top: 0;
  bottom: 0;
  transition: width 0.6s var(--ease);
  z-index: 2;
}

.es-bar.up {
  left: 50%;
  background: linear-gradient(90deg, color-mix(in srgb, var(--high) 70%, transparent), var(--high));
  border-radius: 0 99px 99px 0;
  box-shadow: 0 0 12px color-mix(in srgb, var(--high) 40%, transparent);
}

.es-bar.down {
  right: 50%;
  background: linear-gradient(-90deg, color-mix(in srgb, var(--low) 70%, transparent), var(--low));
  border-radius: 99px 0 0 99px;
  box-shadow: 0 0 12px color-mix(in srgb, var(--low) 40%, transparent);
}

.es-sub {
  font-size: 0.75rem;
  color: var(--muted);
  font-weight: 500;
}

.es-footer-note {
  font-size: 0.78rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--border);
}

/* ── RESPONSIVE ── */
@media (max-width: 900px) {
  .es-grid {
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }
  .es-panel-wrap {
    position: static;
    order: -1;
  }
}
</style>
