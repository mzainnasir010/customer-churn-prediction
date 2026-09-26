<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { api } from '../api/client'
import { usePrediction } from '../stores/prediction'
import { useUi } from '../stores/ui'
import { BASE, PERSONAS } from '../data/personas'
import { toPayload } from '../utils/payload'
import { driverLabel, pretty } from '../utils/format'
import { recommend } from '../utils/recommend'
import type { Options, Prediction } from '../types'
import RiskGauge from '../components/RiskGauge.vue'
import ImpactBars from '../components/ImpactBars.vue'

const store = usePrediction()
const ui = useUi()
const options = ref<Options>({})
const loadError = ref('')
const form = reactive<Record<string, any>>({ ...BASE })
const errors = reactive<Record<string, string>>({})
const step = ref(0)
const snapshot = ref<Record<string, any>>({})

const STEPS = [
  { title: 'Profile', fields: ['gender', 'SeniorCitizen', 'Partner', 'Dependents'] },
  { title: 'Account', fields: ['tenure', 'Contract', 'PaperlessBilling', 'PaymentMethod'] },
  { title: 'Services', fields: ['PhoneService', 'MultipleLines', 'InternetService', 'OnlineSecurity', 'OnlineBackup', 'DeviceProtection', 'TechSupport', 'StreamingTV', 'StreamingMovies'] },
  { title: 'Billing', fields: ['MonthlyCharges', 'TotalCharges'] },
]
const NUMERIC: Record<string, { min: number; max: number; hint: string; optional?: boolean }> = {
  tenure: { min: 0, max: 72, hint: 'Months as a customer (0-72)' },
  MonthlyCharges: { min: 0, max: 500, hint: 'Per month (0-500)' },
  TotalCharges: { min: 0, max: 100000, hint: 'Optional. Defaults to tenure x monthly charges', optional: true },
}
const optText = (f: string, v: string | number) => (f === 'SeniorCitizen' ? (v === 1 ? 'Yes' : 'No') : String(v))

async function loadOptions() {
  loadError.value = ''
  try { options.value = await api.options() } catch (e) { loadError.value = (e as Error).message }
}
onMounted(loadOptions)

function validateStep(i: number) {
  let ok = true
  for (const f of STEPS[i].fields) {
    delete errors[f]
    const rule = NUMERIC[f]
    if (!rule) continue
    const raw = form[f]
    if (rule.optional && (raw === '' || raw == null)) continue
    const v = Number(raw)
    if (raw === '' || raw == null || isNaN(v) || v < rule.min || v > rule.max) { errors[f] = `Enter a number from ${rule.min} to ${rule.max}`; ok = false }
  }
  if (!ok) ui.toast('err', 'Please fix the highlighted fields')
  return ok
}
const next = () => { if (validateStep(step.value)) step.value++ }

async function analyze() {
  for (let i = 0; i < STEPS.length; i++) if (!validateStep(i)) { step.value = i; return }
  snapshot.value = { ...form }
  wRes.value = null
  await store.run(toPayload(form))
  await nextTick()
  document.getElementById('result')?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
}
async function pick(p: (typeof PERSONAS)[number]) {
  Object.assign(form, BASE, p.values)
  step.value = 0
  await analyze()
}

// what-if
const WHATIF = ['Contract', 'PaymentMethod', 'TechSupport', 'OnlineSecurity', 'PaperlessBilling', 'InternetService']
const wField = ref('Contract')
const wValue = ref('')
const wBusy = ref(false)
const wErr = ref('')
const wRes = ref<Prediction | null>(null)
const wChoices = computed(() => (options.value[wField.value] ?? []).filter((v) => v !== snapshot.value[wField.value]))
watch(wField, () => { wValue.value = ''; wRes.value = null })
async function rescore() {
  wBusy.value = true; wErr.value = ''
  try { wRes.value = await api.predict(toPayload({ ...snapshot.value, [wField.value]: wValue.value })) }
  catch (e) { wErr.value = (e as Error).message }
  finally { wBusy.value = false }
}
const delta = computed(() => (wRes.value && store.result ? (wRes.value.churn_probability - store.result.churn_probability) * 100 : 0))
</script>

<template>
  <section class="container section-sm">
    <div v-reveal>
      <span class="eyebrow">Prediction studio</span>
      <h1 class="h1">Analyze a customer</h1>
      <p class="lead">Describe a customer in four steps, or load an example. Every score comes from the live XGBoost model.</p>
    </div>
    <div v-reveal="80" class="card" style="margin-top: 1.5rem; background: var(--surface2);">
      <h3 style="font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted); margin-bottom: 1rem;">Quick Analysis Templates</h3>
      <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
        <button v-for="p in PERSONAS" :key="p.id" class="btn" style="flex: 1; justify-content: center; min-width: 220px; background: var(--surface); box-shadow: var(--shadow);" :title="p.blurb" :disabled="store.status === 'loading' || !Object.keys(options).length" @click="pick(p)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="opacity: 0.6; margin-right: 0.2rem;"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          {{ p.label }}
        </button>
      </div>
    </div>

    <div v-if="loadError" v-reveal="160" class="card" role="alert">
      <p class="err">{{ loadError }}</p><button class="btn" @click="loadOptions">Retry</button>
    </div>

    <div v-else class="grid g2" style="align-items: stretch; gap: 2rem; margin-top: 2rem;">
      <!-- Left Column: Form & Interactive Tools -->
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        <form v-reveal="160" class="card" style="flex: 1; display: flex; flex-direction: column;" novalidate @submit.prevent="step < STEPS.length - 1 ? next() : analyze()">
      <ol class="stepper">
        <li v-for="(s, i) in STEPS" :key="s.title">
          <button type="button" :class="{ on: i === step, done: i < step }" :aria-current="i === step ? 'step' : undefined" :disabled="i > step" @click="step = i">
            <span>{{ i + 1 }}</span>{{ s.title }}
          </button>
        </li>
      </ol>
      <div v-if="!Object.keys(options).length" class="skeleton" style="height:140px" />
      <Transition v-else name="slide" mode="out-in">
        <div :key="step" class="fields">
          <div v-for="f in STEPS[step].fields" :key="f">
            <label :for="f">{{ pretty(f) }}</label>
            <select v-if="options[f]" :id="f" v-model="form[f]">
              <option v-for="v in options[f]" :key="v" :value="v">{{ optText(f, v) }}</option>
            </select>
            <template v-else>
              <input :id="f" v-model="form[f]" type="number" step="any" :aria-invalid="!!errors[f]" :aria-describedby="f + '-h'" />
              <small :id="f + '-h'" class="muted">{{ NUMERIC[f].hint }}</small>
              <div v-if="errors[f]" class="err" role="alert">{{ errors[f] }}</div>
            </template>
          </div>
        </div>
      </Transition>
      <div class="between" style="margin-top: auto; padding-top: 1.5rem;">
        <button type="button" class="btn" :disabled="step === 0" @click="step--">Back</button>
        <button v-if="step < STEPS.length - 1" type="submit" class="btn primary">Next</button>
        <button v-else type="submit" class="btn primary" :disabled="store.status === 'loading'">{{ store.status === 'loading' ? 'Analyzing...' : 'Analyze customer' }}</button>
      </div>
        </form>

        <!-- What-If Scenario (Moves to left side after prediction) -->
        <div v-if="store.result" v-reveal class="card" style="flex: 1; display: flex; flex-direction: column;">
          <h3>What-if scenario</h3>
          <p>Change one attribute and re-score the same customer with the live model.</p>
          <div class="whatif">
            <div><label for="wf">Attribute</label>
              <select id="wf" v-model="wField"><option v-for="f in WHATIF" :key="f" :value="f">{{ pretty(f) }} (now: {{ snapshot[f] }})</option></select></div>
            <div><label for="wv">Change to</label>
              <select id="wv" v-model="wValue"><option value="" disabled>Select a value</option><option v-for="v in wChoices" :key="v" :value="v">{{ v }}</option></select></div>
            <button class="btn primary" :disabled="!wValue || wBusy" @click="rescore">{{ wBusy ? 'Scoring...' : 'Re-score' }}</button>
          </div>
          <p v-if="wErr" class="err">{{ wErr }}</p>
          <div v-if="wRes" class="delta">
            <span>{{ (store.result.churn_probability * 100).toFixed(1) }}%</span><b aria-hidden="true">&rarr;</b>
            <span>{{ (wRes.churn_probability * 100).toFixed(1) }}%</span>
            <strong :class="delta <= 0 ? 'good' : 'bad'">{{ delta > 0 ? '+' : '' }}{{ delta.toFixed(1) }} pts</strong>
            <span class="badge" :class="wRes.risk_tier">{{ wRes.risk_tier }}</span>
          </div>
          <small class="muted">A model estimate under changed inputs, based on associations in past data. It is not a guaranteed outcome.</small>
        </div>
      </div>

      <!-- Right Column: Results -->
      <div id="result" aria-live="polite" style="display: flex; flex-direction: column; gap: 1rem;">
        <div v-if="store.status === 'loading'" style="display: flex; flex-direction: column; gap: 1rem;">
          <div class="skeleton" style="height:240px" />
          <div class="skeleton" style="height:240px" />
        </div>
      <div v-else-if="store.status === 'error'" class="card"><p class="err" style="margin:0">{{ store.error }}</p></div>
      <div v-else-if="store.status === 'idle'" class="card" v-reveal style="flex: 1; display: flex; align-items: center; justify-content: center; border-style: dashed; opacity: 0.7;">
        <p class="muted" style="margin:0; font-size: 1.1rem; font-weight: 500;">Fill out the form to generate the dashboard</p>
      </div>
            <template v-else-if="store.result">
        <div class="card" v-reveal style="display:flex;gap:2rem;align-items:center;flex-wrap:wrap">
          <div style="text-align:center;padding-right:2rem;border-right:1px solid var(--border);min-width:140px;flex-shrink:0">
            <RiskGauge :key="store.result.churn_probability" :probability="store.result.churn_probability" :tier="store.result.risk_tier" :threshold="store.result.threshold" />
          </div>
          <div>
            <span class="eyebrow" style="margin-bottom:.4rem">Suggested action</span>
            <p style="margin:0;font-size:1rem;font-weight:500;line-height:1.5">{{ recommend(store.result.top_drivers) }}</p>
            <div class="facts" style="grid-template-columns:repeat(3,auto);justify-content:flex-start;gap:1.5rem;text-align:left;margin-top:1rem">
              <div><small>Decision</small><strong>{{ store.result.at_risk ? 'Flagged at risk' : 'Not flagged' }}</strong></div>
              <div><small>Threshold</small><strong>{{ store.result.threshold }}</strong></div>
              <div><small>Model</small><strong>XGBoost</strong></div>
            </div>
          </div>
        </div>

        <div class="card" v-reveal="150" style="margin-top:1rem">
          <span class="eyebrow" style="margin-bottom:1.25rem">Impact factors</span>
          <ImpactBars :items="store.result.top_drivers.map((d) => ({ label: driverLabel(d), value: d.contribution, sub: d.direction }))" />
        </div>

      </template>
      </div>
    </div>
  </section>
</template>