<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { api } from '../api/client'
import { usePrediction } from '../stores/prediction'
import { useUi } from '../stores/ui'
import { recommend } from '../utils/recommend'
import RiskGauge from '../components/RiskGauge.vue'
import DriverBars from '../components/DriverBars.vue'
import type { Options } from '../types'

const store = usePrediction()
const ui = useUi()
const options = ref<Options>({})
const loadError = ref('')
const form = reactive<Record<string, any>>({
  gender: 'Female', SeniorCitizen: 0, Partner: 'No', Dependents: 'No', tenure: 3, PhoneService: 'Yes',
  MultipleLines: 'No', InternetService: 'Fiber optic', OnlineSecurity: 'No', OnlineBackup: 'No',
  DeviceProtection: 'No', TechSupport: 'No', StreamingTV: 'No', StreamingMovies: 'No',
  Contract: 'Month-to-month', PaperlessBilling: 'Yes', PaymentMethod: 'Electronic check',
  MonthlyCharges: 75, TotalCharges: '',
})
const errors = reactive<Record<string, string>>({})
const label = (k: string) => k.replace(/([A-Z])/g, ' $1').trim()

onMounted(async () => { try { options.value = await api.options() } catch (e) { loadError.value = (e as Error).message } })

function validate() {
  Object.keys(errors).forEach((k) => delete errors[k])
  for (const [k, lo, hi] of [['tenure', 0, 72], ['MonthlyCharges', 0, 500]] as const) {
    const v = Number(form[k])
    if (form[k] === '' || isNaN(v) || v < lo || v > hi) errors[k] = `Enter a number from ${lo} to ${hi}`
  }
  if (form.TotalCharges !== '' && !(Number(form.TotalCharges) >= 0)) errors.TotalCharges = 'Must be 0 or more'
  if (Object.keys(errors).length) { ui.toast('err', 'Please fix the highlighted fields'); return false }
  return true
}

async function submit() {
  if (!validate()) return
  await store.run({
    ...form, tenure: Number(form.tenure), MonthlyCharges: Number(form.MonthlyCharges),
    TotalCharges: form.TotalCharges === '' ? null : Number(form.TotalCharges),
  })
}
</script>

<template>
  <h1>Analyze a customer</h1>
  <p v-if="loadError" class="err" role="alert">{{ loadError }}</p>
  <form class="card" novalidate @submit.prevent="submit">
    <div class="fields">
      <div v-for="(vals, key) in options" :key="key">
        <label :for="String(key)">{{ label(String(key)) }}</label>
        <select :id="String(key)" v-model="form[key]"><option v-for="v in vals" :key="v" :value="v">{{ v }}</option></select>
      </div>
      <div v-for="[k, hint] in [['tenure', 'months, 0-72'], ['MonthlyCharges', '0-500'], ['TotalCharges', 'optional']]" :key="k">
        <label :for="k">{{ label(k) }} ({{ hint }})</label>
        <input :id="k" v-model="form[k]" type="number" step="any" :aria-invalid="!!errors[k]" />
        <div v-if="errors[k]" class="err" role="alert">{{ errors[k] }}</div>
      </div>
    </div>
    <button class="btn primary" style="margin-top:1rem" :disabled="store.status === 'loading' || !Object.keys(options).length">
      {{ store.status === 'loading' ? 'Analyzing...' : 'Analyze customer' }}
    </button>
  </form>

  <section aria-live="polite" style="margin-top:1.5rem">
    <div v-if="store.status === 'loading'" class="grid g2"><div class="skeleton" style="height:200px" /><div class="skeleton" style="height:200px" /></div>
    <div v-else-if="store.status === 'error'" class="card"><p style="margin:0" class="err">{{ store.error }}</p></div>
    <div v-else-if="store.status === 'idle'" class="card"><p style="margin:0">Fill in the customer details and press Analyze to see the risk dashboard.</p></div>
    <div v-else-if="store.result" class="grid g2">
      <div class="card glass"><h3>Churn probability</h3><RiskGauge :probability="store.result.churn_probability" :tier="store.result.risk_tier" />
        <p style="text-align:center;margin-top:.75rem">{{ store.result.at_risk ? 'Flagged as at risk' : 'Not flagged' }} (threshold {{ store.result.threshold }})</p></div>
      <div class="card"><h3>Top risk factors</h3><DriverBars :drivers="store.result.top_drivers" />
        <h3 style="margin-top:1.25rem">Recommended action</h3><p style="margin:0">{{ recommend(store.result.top_drivers) }}</p></div>
    </div>
  </section>
</template>