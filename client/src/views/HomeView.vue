<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { DATASET, FINAL, PIPELINE } from '../data/results'
import CountUp from '../components/CountUp.vue'
import HeroScene from '../components/hero/HeroScene.vue'
import HeroDataCard from '../components/hero/HeroDataCard.vue'
import HeroTooltip from '../components/hero/HeroTooltip.vue'
import PipelineTimeline from '../components/PipelineTimeline.vue'
import ThresholdScrolly from '../components/ThresholdScrolly.vue'
import ExplainabilityScrolly from '../components/ExplainabilityScrolly.vue'
import StudioShowcaseScrolly from '../components/StudioShowcaseScrolly.vue'


const show = ref(false)
onMounted(() => requestAnimationFrame(() => (show.value = true)))

type Hover = { x: number; y: number; tier: 'Low' | 'Medium' | 'High'; probability: number; driver: string } | null
const hover = ref<Hover>(null)
function onSceneHover(payload: Hover) { hover.value = payload }
</script>

<template>
  <!-- ═══════════════════════════ HERO ═══════════════════════════ -->
  <section class="hero-shell" aria-label="ChurnIQ hero">

    <!-- ── Background layers ── -->
    <div class="hero-bg" aria-hidden="true">
      <div class="hb-glow"></div>
      <div class="hb-grid"></div>
      <!-- Sparse data-point particles (CSS only, no lib) -->
      <div class="hb-particles">
        <span v-for="n in 18" :key="n" class="hb-dot" :style="`--i:${n}`"></span>
      </div>
    </div>

    <!-- ── Main content row ── -->
    <div class="hero-body">

      <!-- LEFT 42% — text content -->
      <div class="hero-left">
        <span class="eyebrow he-eyebrow" :class="{ 'he-in': show }">
          Explainable Machine Learning
        </span>

        <h1 class="display he-h1" :class="{ 'he-in': show }">
          Know who is<br>about to leave.<br>Know why.<br>
          <span class="grad">Act before<br>they do.</span>
        </h1>

        <p class="lead he-lead" :class="{ 'he-in': show }">
          Predicts telecom customer churn risk, explains the drivers behind every score, and turns those insights into retention decisions.
        </p>

        <div class="cta he-cta" :class="{ 'he-in': show }">
          <RouterLink to="/predict" class="btn primary">
            Try the prediction studio &rarr;
          </RouterLink>
          <RouterLink to="/model" class="btn">
            Explore the model
          </RouterLink>
        </div>
      </div>

      <!-- RIGHT 58% — 3D scene + floating cards -->
      <div class="hero-right" :class="{ 'he-in': show }">
        <div class="scene-pulse" aria-hidden="true"></div>

        <div class="scene-wrap" aria-hidden="true">
          <Suspense>
            <HeroScene @hover="onSceneHover" />
          </Suspense>
          <HeroTooltip v-if="hover" v-bind="hover" />
        </div>

        <div class="fc fc-1" :class="{ 'he-in': show }" aria-label="Model core">
          <HeroDataCard title="MODEL CORE" value="Tuned XGBoost" sub="ROC-AUC 0.848" accent="#3b82f6" />
        </div>

        <div class="fc fc-2 shap-wrap" :class="{ 'he-in': show }">
          <div class="shap-line" aria-hidden="true"></div>
          <HeroDataCard title="SURFACED RISK" value="High-risk cohort" sub="Flagged and beamed to core" accent="#ff4d5e" />
          <div class="shap-tooltip">Hover a point to see its risk</div>
        </div>

        <div class="fc fc-3" :class="{ 'he-in': show }" aria-label="Decision boundary">
          <HeroDataCard title="DECISION BOUNDARY" value="Threshold 0.17" sub="Tuned for recall" accent="#2dd4bf" />
        </div>

        <div class="fc fc-4" :class="{ 'he-in': show }" aria-label="Explainability">
          <HeroDataCard title="EXPLAINED" value="Every prediction" sub="Comes with its top drivers" accent="#00ffcc" />
        </div>
      </div>
    </div>

    <!-- ── Metrics strip ── -->
    <div class="hero-metrics" :class="{ 'he-in': show }" role="region" aria-label="Model metrics">
      <div class="hm-item">
        <span class="hm-val">7,043</span>
        <span class="hm-lbl">customers</span>
      </div>
      <div class="hm-sep" aria-hidden="true"></div>
      <div class="hm-item">
        <span class="hm-val">0.848</span>
        <span class="hm-lbl">ROC-AUC</span>
      </div>
      <div class="hm-sep" aria-hidden="true"></div>
      <div class="hm-item">
        <span class="hm-val">88.5%</span>
        <span class="hm-lbl">recall</span>
      </div>
      <div class="hm-sep" aria-hidden="true"></div>
      <div class="hm-item">
        <span class="hm-val">0.17</span>
        <span class="hm-lbl">threshold</span>
      </div>
      <div class="hm-sep" aria-hidden="true"></div>
      <div class="hm-item">
        <span class="hm-val">XGBoost</span>
        <span class="hm-lbl">final model</span>
      </div>
    </div>
  </section>

  <!-- ═══════════════════════════ REST OF HOME ═══════════════════ -->
  <section class="container section stats">
    <div v-reveal="0"   class="card"><h2 class="grad"><CountUp :to="DATASET.customers" /></h2><p>customers analysed</p></div>
    <div v-reveal="80"  class="card"><h2 class="grad"><CountUp :to="FINAL.testAuc" :decimals="3" /></h2><p>test ROC-AUC</p></div>
    <div v-reveal="160" class="card"><h2 class="grad"><CountUp :to="FINAL.tuned.recall * 100" :decimals="1" suffix="%" /></h2><p>of churners caught</p></div>
    <div v-reveal="240" class="card"><h2 class="grad"><CountUp :to="5" /></h2><p>models compared fairly</p></div>
  </section>

  <section class="container section">
    <div class="section-header" v-reveal>
      <span class="eyebrow">How it works</span>
      <h2 class="h2">From raw records to a retention decision.</h2>
    </div>
    <PipelineTimeline :items="PIPELINE" />
  </section>

  <section class="container section">
    <ThresholdScrolly />
  </section>

  <section class="container section">
    <ExplainabilityScrolly />
  </section>

  <section class="container section">
    <StudioShowcaseScrolly />
  </section>
</template>

<style scoped>
/* ═══════════ HERO SHELL ═══════════ */
.hero-shell {
  min-height: calc(100svh - 64px);
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  contain: layout;
}

/* ═══════════ BACKGROUND ═══════════ */
.hero-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.hb-glow {
  position: absolute;
  top: 50%;
  right: 5%;
  width: 55vw;
  height: 55vw;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(15, 23, 42, 0.8) 0%,
    rgba(0, 255, 204, 0.05) 35%,
    transparent 65%
  );
  transform: translateY(-50%);
  z-index: 0;
}

.hb-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse 80% 80% at 65% 50%, black 0%, transparent 100%);
  -webkit-mask-image: radial-gradient(ellipse 80% 80% at 65% 50%, black 0%, transparent 100%);
}

.hb-particles { position: absolute; inset: 0; }
.hb-dot {
  position: absolute;
  width: 2px;
  height: 2px;
  border-radius: 50%;
  background: rgba(0, 255, 204, 0.4);
  top:  calc(10% + (var(--i) * 17.3% - floor(var(--i) * 17.3% / 100%) * 100%));
  left: calc(45% + (var(--i) * 23.7% - floor(var(--i) * 23.7% / 100%) * 100%));
  animation: particle-drift calc(8s + var(--i) * 1.3s) ease-in-out infinite;
  animation-delay: calc(var(--i) * -0.7s);
  opacity: 0.5;
}

@keyframes particle-drift {
  0%, 100% { transform: translate(0, 0); opacity: 0.5; }
  33%       { transform: translate(4px, -8px); opacity: 0.8; }
  66%       { transform: translate(-3px, 5px); opacity: 0.3; }
}

/* ═══════════ MAIN CONTENT ROW ═══════════ */
.hero-body {
  flex: 1;
  display: flex;
  align-items: center;
  width: 100%;
  padding: 3rem 3vw 2rem;
  position: relative;
  z-index: 1;
  gap: 2rem;
}

/* ═══════════ LEFT CONTENT ═══════════ */
.hero-left {
  flex: 0 0 42%;
  display: flex;
  flex-direction: column;
  gap: 0;
  z-index: 2;
}

.he-eyebrow { transition-delay: 0ms; }
.he-h1      { transition-delay: 100ms; }
.he-lead    { transition-delay: 250ms; }
.he-cta     { transition-delay: 400ms; }

.he-eyebrow, .he-h1, .he-lead, .he-cta {
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 0.65s cubic-bezier(0.2, 0.7, 0.2, 1),
              transform 0.65s cubic-bezier(0.2, 0.7, 0.2, 1);
}

.he-eyebrow.he-in, .he-h1.he-in, .he-lead.he-in, .he-cta.he-in {
  opacity: 1;
  transform: none;
}

.hero-left .display {
  margin-top: 0.75rem;
  margin-bottom: 1.25rem;
  line-height: 1.05;
}

.hero-left .lead {
  max-width: 420px;
  margin-bottom: 0;
  color: rgba(255, 255, 255, 0.65);
}

.hero-left .cta {
  margin-top: 2rem;
}

/* ═══════════ RIGHT — 3D SCENE + CARDS ═══════════ */
.hero-right {
  flex: 0 0 58%;
  position: relative;
  min-height: 560px;
  opacity: 0;
  transition: opacity 0.8s cubic-bezier(0.2, 0.7, 0.2, 1) 500ms;
}

.hero-right.he-in {
  opacity: 1;
}

.scene-pulse {
  position: absolute;
  top: 50%;
  left: 55%;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  border: 1px solid rgba(0, 255, 204, 0.08);
  transform: translate(-50%, -50%);
  animation: pulse-ring 3s ease-in-out infinite;
}

@keyframes pulse-ring {
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.4; }
  50%       { transform: translate(-50%, -50%) scale(1.05); opacity: 0.1; }
}

.scene-wrap {
  position: absolute;
  inset: 0;
  z-index: 1;
}

/* ═══════════ FLOATING INTELLIGENCE CARDS ═══════════ */
.fc {
  position: absolute;
  z-index: 3;
  opacity: 0;
  transform: translateY(12px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.fc.he-in { opacity: 1; transform: translateY(0); }

.fc-1 { top: 14%;  right: 4%;  animation: float-card 7s ease-in-out infinite 0s;    transition-delay: 700ms; }
.fc-2 { top: 44%;  left: 2%;   animation: float-card 8s ease-in-out infinite -2.5s; transition-delay: 800ms; }
.fc-3 { bottom: 16%; right: 8%;  animation: float-card 9s ease-in-out infinite -4s;  transition-delay: 900ms; }
.fc-4 { bottom: 22%; left: 10%; animation: float-card 7.5s ease-in-out infinite -1s; transition-delay: 1000ms; }

@keyframes float-card {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-8px); }
}

.shap-wrap { position: absolute; }

.shap-line {
  position: absolute;
  top: 50%;
  left: 100%;
  width: 55px;
  height: 1px;
  margin-left: 2px;
  background: linear-gradient(90deg, rgba(0, 255, 204, 0.5), transparent);
  transform-origin: left center;
  transform: translateY(-50%) rotate(-10deg);
  transition: width 0.3s ease, opacity 0.3s ease, background 0.3s ease;
  opacity: 0.3;
}

.shap-wrap:hover .shap-line {
  opacity: 1;
  width: 72px;
  background: linear-gradient(90deg, rgba(0, 255, 204, 0.9), transparent);
}

.shap-tooltip {
  position: absolute;
  bottom: calc(100% + 6px);
  left: 0;
  font-size: 0.7rem;
  color: rgba(0, 255, 204, 0.7);
  white-space: nowrap;
  letter-spacing: 0.04em;
  font-weight: 600;
  opacity: 0;
  transform: translateY(4px);
  transition: opacity 0.2s ease, transform 0.2s ease;
  pointer-events: none;
}

.shap-wrap:hover .shap-tooltip {
  opacity: 1;
  transform: translateY(0);
}

/* ═══════════ METRICS STRIP ═══════════ */
.hero-metrics {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem 2rem;
  padding: 1.2rem 3vw;
  border-top: 1px solid var(--border);
  background: color-mix(in srgb, var(--surface) 60%, transparent);
  backdrop-filter: blur(8px);
  position: relative;
  z-index: 2;
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.6s ease 1100ms, transform 0.6s ease 1100ms;
}
.hero-metrics.he-in { opacity: 1; transform: none; }

.hm-item {
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
}

.hm-val {
  font-size: 1rem;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -0.01em;
}

.hm-lbl {
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--muted);
}

.hm-sep {
  width: 1px;
  height: 20px;
  background: var(--border);
  flex-shrink: 0;
}

/* ═══════════ RESPONSIVE ═══════════ */
@media (max-width: 1024px) {
  .hero-body {
    flex-direction: column;
    align-items: stretch;
    padding-top: 2.5rem;
    gap: 0;
  }
  .hero-left {
    flex: none;
    width: 100%;
    text-align: center;
    align-items: center;
  }
  .hero-left .lead { max-width: 560px; text-align: center; }
  .hero-right {
    flex: none;
    width: 100%;
    min-height: 480px;
    margin-top: 1.5rem;
  }
  .fc-4 { display: none; }
  .fc-1 { top: 8%; right: 2%; }
  .fc-2 { top: auto; bottom: 10%; left: 2%; }
  .fc-3 { bottom: 10%; right: 2%; }
  .scene-wrap { position: absolute; inset: 0; z-index: 1; }
}

@media (max-width: 640px) {
  .hero-right { min-height: 360px; }
  .fc-3 { display: none; }
  .hm-sep { display: none; }
  .hero-metrics { gap: 0.75rem 1rem; }
}

/* ═══════════ REST OF HOME ═══════════ */
.section-header {
  max-width: 680px;
  margin-bottom: 3.5rem;
}
.section-header.center {
  margin-left: auto;
  margin-right: auto;
}
.section-header .h2 {
  margin-top: 0.5rem;
  margin-bottom: 1rem;
}
.section-header .lead {
  margin-bottom: 0;
}

.split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8vw;
  align-items: center;
}
.split-text {
  max-width: 600px;
}
.split-text .lead {
  margin: 1.25rem 0 2rem;
}
.split-visual {
  width: 100%;
}

@media (max-width: 900px) {
  .split {
    grid-template-columns: 1fr;
    gap: 4rem;
  }
  .split-visual.order-last { order: 2; }
}

/* ═══════════ ACCESSIBILITY — REDUCED MOTION ═══════════ */
@media (prefers-reduced-motion: reduce) {
  .hb-dot,
  .fc,
  .scene-pulse { animation: none; }

  .he-eyebrow, .he-h1, .he-lead, .he-cta,
  .hero-right, .hero-metrics {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
</style>