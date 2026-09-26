<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { FINAL } from '../data/results'

const rootEl = ref<HTMLElement | null>(null)
const activeStep = ref(0)
const scrollProgress = ref(0) // 0 (Default 0.50) -> 1 (Tuned 0.17)
const reducedMotion = ref(false)

let stepEls: HTMLElement[] = []
let ticking = false

// Metrics calculation based on smooth scrollProgress (0 to 1)
const thresholdVal = computed(() => {
  if (reducedMotion.value || activeStep.value >= 1) return 0.17
  // Interpolate between 0.50 and 0.17 based on progress
  const val = 0.50 - (0.50 - 0.17) * Math.min(1, Math.max(0, scrollProgress.value * 2))
  return +val.toFixed(2)
})

const recallVal = computed(() => {
  const start = FINAL.default.recall * 100
  const end = FINAL.tuned.recall * 100
  if (reducedMotion.value || activeStep.value >= 1) return end
  const p = Math.min(1, Math.max(0, scrollProgress.value * 1.8))
  return +(start + (end - start) * p).toFixed(1)
})

const precisionVal = computed(() => {
  const start = FINAL.default.precision * 100
  const end = FINAL.tuned.precision * 100
  if (reducedMotion.value || activeStep.value >= 1) return end
  const p = Math.min(1, Math.max(0, scrollProgress.value * 1.8))
  return +(start + (end - start) * p).toFixed(1)
})

const f1Val = computed(() => {
  const start = FINAL.default.f1 * 100
  const end = FINAL.tuned.f1 * 100
  if (reducedMotion.value || activeStep.value >= 1) return end
  const p = Math.min(1, Math.max(0, scrollProgress.value * 1.8))
  return +(start + (end - start) * p).toFixed(1)
})

const accuracyVal = computed(() => {
  const start = FINAL.default.accuracy * 100
  const end = FINAL.tuned.accuracy * 100
  if (reducedMotion.value || activeStep.value >= 1) return end
  const p = Math.min(1, Math.max(0, scrollProgress.value * 1.8))
  return +(start + (end - start) * p).toFixed(1)
})

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
    activeStep.value = 1
    scrollProgress.value = 1
    return
  }
  await nextTick()
  stepEls = Array.from(rootEl.value?.querySelectorAll<HTMLElement>('.ts-step') ?? [])
  recalc()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
})

function setModeManually(mode: 'default' | 'tuned') {
  if (mode === 'default') {
    activeStep.value = 0
    scrollProgress.value = 0
  } else {
    activeStep.value = 1
    scrollProgress.value = 1
  }
}
</script>

<template>
  <div ref="rootEl" class="ts-root" aria-label="Interactive threshold scrollytelling">
    <div class="ts-grid">

      <!-- LEFT COLUMN: Scrollable Steps -->
      <div class="ts-steps">

        <div class="ts-header">
          <span class="eyebrow">Threshold Tuning</span>
          <h2 class="h2">Accuracy is the wrong target.</h2>
          <p class="lead">
            A model that predicts "nobody leaves" is already about 73% accurate and useless.
            The decision threshold was tuned so a missed churner counts twice as much as a false alarm.
          </p>
        </div>

        <!-- Step 0: Default Threshold -->
        <div 
          class="ts-step card glass" 
          :class="{ 'is-active': activeStep === 0 }"
          @click="setModeManually('default')"
        >
          <div class="ts-step-badge">DEFAULT THRESHOLD 0.50</div>
          <h3 class="ts-step-title">The Naive Accuracy Trap</h3>
          <p class="ts-step-text">
            At 0.50 threshold, high overall accuracy (80.2%) masks a fatal weakness: 
            <strong>only 51.3% of actual churners</strong> are caught. Nearly half of at-risk customers slip through unnoticed.
          </p>
          <div class="ts-step-pill">
            <span>Recall: 51.3%</span>
            <span class="ts-muted">• Misses 183 churners</span>
          </div>
        </div>

        <!-- Step 1: Tuned Threshold -->
        <div 
          class="ts-step card glass" 
          :class="{ 'is-active': activeStep >= 1 }"
          @click="setModeManually('tuned')"
        >
          <div class="ts-step-badge active-badge">TUNED THRESHOLD 0.17</div>
          <h3 class="ts-step-title">Tuned for Maximum Recall</h3>
          <p class="ts-step-text">
            By shifting the decision threshold to 0.17, the model prioritizes catching churners early. 
            Recall surges to <strong>88.5%</strong>—catching 331 out of 374 churners in the test set.
          </p>
          <div class="ts-step-pill active-pill">
            <span>Recall: 88.5%</span>
            <span class="ts-highlight">• Catches 331 of 374 churners</span>
          </div>
        </div>

        <!-- Step 2: Strategic Trade-off -->
        <div class="ts-step card glass" :class="{ 'is-active': activeStep >= 2 }">
          <div class="ts-step-badge">STRATEGIC RESULT</div>
          <h3 class="ts-step-title">Accepting False Alarms by Design</h3>
          <p class="ts-step-text">
            Accuracy drops from 80.2% to 68.1% intentionally. The business saves 331 customers at the cost of 
            406 false alarms—a trade-off optimized for retention ROI.
          </p>
          <div class="ts-cta-row">
            <RouterLink to="/model" class="btn primary">
              See the full evaluation &rarr;
            </RouterLink>
          </div>
        </div>

      </div>

      <!-- RIGHT COLUMN: Sticky Interactive Visualization -->
      <div class="ts-panel-wrap">
        <div class="ts-panel card glass">
          
          <!-- Top gauge / Mode switcher header -->
          <div class="ts-panel-header">
            <div class="ts-panel-title">
              <span>Decision Boundary Cutoff</span>
              <strong class="ts-cutoff-val grad">{{ thresholdVal }}</strong>
            </div>
            
            <div class="seg" role="group" aria-label="Threshold selector">
              <button 
                :class="{ on: activeStep === 0 }" 
                @click="setModeManually('default')"
              >
                Default 0.50
              </button>
              <button 
                :class="{ on: activeStep >= 1 }" 
                @click="setModeManually('tuned')"
              >
                Tuned 0.17
              </button>
            </div>
          </div>

          <!-- Dynamic Threshold Slider Track visual -->
          <div class="ts-slider-track">
            <div class="ts-slider-labels">
              <span>0.0 (High Recall)</span>
              <span>0.50 (Default)</span>
              <span>1.0 (High Precision)</span>
            </div>
            <div class="ts-track-bg">
              <div 
                class="ts-track-pointer" 
                :style="{ left: `calc(${100 - (thresholdVal / 0.50) * 50}% - 12px)` }"
              >
                <div class="ts-pointer-dot"></div>
                <div class="ts-pointer-line"></div>
              </div>
            </div>
          </div>

          <!-- Animated Bar Metrics -->
          <div class="ts-metrics-list">

            <!-- Recall -->
            <div class="ts-metric-item highlight-metric">
              <div class="ts-metric-info">
                <span>Recall (churners caught)</span>
                <strong>{{ recallVal }}%</strong>
              </div>
              <div class="ts-bar-track">
                <div 
                  class="ts-bar-fill recall-fill" 
                  :style="{ width: `${recallVal}%` }"
                ></div>
              </div>
            </div>

            <!-- Precision -->
            <div class="ts-metric-item">
              <div class="ts-metric-info">
                <span>Precision (flagged who churn)</span>
                <strong>{{ precisionVal }}%</strong>
              </div>
              <div class="ts-bar-track">
                <div 
                  class="ts-bar-fill precision-fill" 
                  :style="{ width: `${precisionVal}%` }"
                ></div>
              </div>
            </div>

            <!-- F1 Score -->
            <div class="ts-metric-item">
              <div class="ts-metric-info">
                <span>F1 Score</span>
                <strong>{{ f1Val }}%</strong>
              </div>
              <div class="ts-bar-track">
                <div 
                  class="ts-bar-fill f1-fill" 
                  :style="{ width: `${f1Val}%` }"
                ></div>
              </div>
            </div>

            <!-- Accuracy -->
            <div class="ts-metric-item">
              <div class="ts-metric-info">
                <span>Accuracy</span>
                <strong>{{ accuracyVal }}%</strong>
              </div>
              <div class="ts-bar-track">
                <div 
                  class="ts-bar-fill accuracy-fill" 
                  :style="{ width: `${accuracyVal}%` }"
                ></div>
              </div>
            </div>

          </div>

          <!-- Confusion Matrix Callout -->
          <div class="ts-confusion-callout">
            <div class="ts-conf-box low">
              <span class="ts-conf-num">{{ activeStep >= 1 ? FINAL.confusion.tp : 191 }}</span>
              <span class="ts-conf-lbl">Churners Caught (TP)</span>
            </div>
            <div class="ts-conf-box high">
              <span class="ts-conf-num">{{ activeStep >= 1 ? FINAL.confusion.fp : 97 }}</span>
              <span class="ts-conf-lbl">False Alarms (FP)</span>
            </div>
          </div>

          <p class="ts-summary-note">
            <template v-if="activeStep >= 1">
              Catches {{ FINAL.confusion.tp }} of {{ FINAL.confusion.tp + FINAL.confusion.fn }} churners in the test set, at the cost of {{ FINAL.confusion.fp }} false alarms. Accuracy falls by design.
            </template>
            <template v-else>
              Higher default accuracy (80.2%), but misses nearly half of actual churners (only 51.3% caught).
            </template>
          </p>

        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.ts-root {
  position: relative;
  width: 100%;
  margin: 3rem 0;
}

.ts-grid {
  display: grid;
  grid-template-columns: 1fr 1.05fr;
  gap: 3.5rem;
  align-items: start;
}

/* ── LEFT COLUMN ── */
.ts-steps {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.ts-header {
  margin-bottom: 1rem;
}

.ts-step {
  padding: 1.75rem;
  border-radius: var(--r);
  border: 1px solid var(--border);
  opacity: 0.45;
  filter: saturate(0.5);
  transform: translateY(10px);
  transition: opacity 0.5s var(--ease), transform 0.5s var(--ease), filter 0.5s var(--ease), border-color 0.5s var(--ease);
  cursor: pointer;
}

.ts-step.is-active {
  opacity: 1;
  filter: saturate(1);
  transform: translateY(0);
  border-color: var(--accent);
  box-shadow: 0 8px 32px color-mix(in srgb, var(--accent) 15%, transparent);
}

.ts-step-badge {
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

.ts-step-badge.active-badge {
  background: color-mix(in srgb, var(--low) 20%, var(--surface2));
  color: var(--low);
  border: 1px solid color-mix(in srgb, var(--low) 40%, transparent);
}

.ts-step-title {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}

.ts-step-text {
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 1rem;
  color: var(--muted);
}

.ts-step-pill {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.5rem 0.8rem;
  background: var(--surface2);
  border-radius: 8px;
  color: var(--text);
}

.ts-step-pill.active-pill {
  background: color-mix(in srgb, var(--low) 15%, var(--surface2));
}

.ts-muted { color: var(--muted); }
.ts-highlight { color: var(--low); font-weight: 700; }

.ts-cta-row {
  margin-top: 1rem;
}

/* ── RIGHT COLUMN (STICKY VISUAL) ── */
.ts-panel-wrap {
  position: sticky;
  top: 6rem;
  align-self: start;
}

.ts-panel {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  border-color: color-mix(in srgb, var(--accent) 30%, var(--border));
}

.ts-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.ts-panel-title {
  display: flex;
  flex-direction: column;
}

.ts-panel-title span {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--muted);
}

.ts-cutoff-val {
  font-size: 2.2rem;
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

/* ── SLIDER TRACK ── */
.ts-slider-track {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.ts-slider-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--muted);
}

.ts-track-bg {
  position: relative;
  height: 12px;
  border-radius: 99px;
  background: var(--surface2);
  border: 1px solid var(--border);
  overflow: visible;
}

.ts-track-pointer {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  transition: left 0.25s var(--ease);
  z-index: 2;
}

.ts-pointer-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--accent);
  border: 3px solid var(--surface);
  box-shadow: 0 0 16px var(--accent);
}

/* ── BAR METRICS LIST ── */
.ts-metrics-list {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.ts-metric-item {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.ts-metric-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.88rem;
  font-weight: 600;
}

.ts-metric-info strong {
  font-size: 1rem;
  letter-spacing: -0.01em;
}

.ts-bar-track {
  height: 10px;
  border-radius: 99px;
  background: var(--surface2);
  overflow: hidden;
  position: relative;
}

.ts-bar-fill {
  height: 100%;
  border-radius: 99px;
  transition: width 0.4s var(--ease);
}

.recall-fill {
  background: linear-gradient(90deg, var(--low), var(--accent));
  box-shadow: 0 0 12px color-mix(in srgb, var(--low) 50%, transparent);
}

.precision-fill {
  background: linear-gradient(90deg, #3b82f6, #6366f1);
}

.f1-fill {
  background: linear-gradient(90deg, #8b5cf6, #ec4899);
}

.accuracy-fill {
  background: var(--muted);
  opacity: 0.7;
}

/* ── CONFUSION CALLOUT ── */
.ts-confusion-callout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.ts-conf-box {
  padding: 0.9rem;
  border-radius: 12px;
  text-align: center;
  background: var(--surface2);
  border: 1px solid var(--border);
}

.ts-conf-box.low {
  background: color-mix(in srgb, var(--low) 12%, var(--surface2));
  border-color: color-mix(in srgb, var(--low) 30%, transparent);
}

.ts-conf-box.high {
  background: color-mix(in srgb, var(--high) 12%, var(--surface2));
  border-color: color-mix(in srgb, var(--high) 30%, transparent);
}

.ts-conf-num {
  display: block;
  font-size: 1.6rem;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 0.2rem;
}

.ts-conf-box.low .ts-conf-num { color: var(--low); }
.ts-conf-box.high .ts-conf-num { color: var(--high); }

.ts-conf-lbl {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--muted);
}

.ts-summary-note {
  font-size: 0.85rem;
  line-height: 1.5;
  color: var(--muted);
  margin: 0;
  padding-top: 0.5rem;
  border-top: 1px solid var(--border);
}

/* ── RESPONSIVE ── */
@media (max-width: 900px) {
  .ts-grid {
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }
  .ts-panel-wrap {
    position: static;
    order: -1;
  }
}
</style>
