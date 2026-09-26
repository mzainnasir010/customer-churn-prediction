<script setup lang="ts">
import { computed, ref } from 'vue'
import { api } from '../api/client'
import { useUi } from '../stores/ui'
import { parseCsv, toCsv, downloadText, SAMPLE_CSV } from '../utils/csv'
import { driverLabel } from '../utils/format'
import { recommend } from '../utils/recommend'
import ImpactBars from '../components/ImpactBars.vue'
import type { BatchResult, Customer } from '../types'

const ui = useUi()
const rows = ref<Customer[]>([])
const parseErrors = ref<string[]>([])
const fileName = ref('')
const status = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
const error = ref('')
const result = ref<BatchResult | null>(null)
const filter = ref<'all' | 'flagged'>('all')
const expanded = ref<number | null>(null)

const MAX_ROWS = 500

function onFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  fileName.value = file.name
  result.value = null
  const reader = new FileReader()
  reader.onload = () => {
    const { rows: parsed, errors } = parseCsv(String(reader.result))
    parseErrors.value = errors
    if (parsed.length > MAX_ROWS) {
      parseErrors.value.push(`File has ${parsed.length} rows; only the first ${MAX_ROWS} will be sent.`)
      parsed.length = MAX_ROWS
    }
    rows.value = parsed
    if (errors.length) ui.toast('err', `${errors.length} row(s) had a problem`)
  }
  reader.readAsText(file)
}

function loadSample() {
  const { rows: parsed } = parseCsv(SAMPLE_CSV)
  rows.value = parsed
  parseErrors.value = []
  fileName.value = 'sample-customers.csv'
  result.value = null
}

function reset() {
  rows.value = []; parseErrors.value = []; fileName.value = ''; result.value = null; status.value = 'idle'; error.value = ''; expanded.value = null
}

async function run() {
  if (!rows.value.length) return
  status.value = 'loading'; error.value = ''; expanded.value = null
  try {
    result.value = await api.predictBatch(rows.value)
    status.value = 'success'
    ui.toast('ok', `Scored ${result.value.count} customers, ${result.value.flagged} flagged`)
  } catch (e) {
    status.value = 'error'; error.value = (e as Error).message
    ui.toast('err', error.value)
  }
}

const visibleRows = computed(() => {
  if (!result.value) return []
  return result.value.results
    .map((r, i) => ({ ...r, row: rows.value[i], idx: i }))
    .filter((r) => filter.value === 'all' || r.at_risk)
})

function toggle(i: number) { expanded.value = expanded.value === i ? null : i }

function exportCsv() {
  if (!result.value) return
  const out = result.value.results.map((r, i) => ({
    ...rows.value[i],
    churn_probability: r.churn_probability,
    risk_tier: r.risk_tier,
    at_risk: r.at_risk,
    top_driver_1: r.top_drivers[0] ? driverLabel(r.top_drivers[0]) : '',
    top_driver_2: r.top_drivers[1] ? driverLabel(r.top_drivers[1]) : '',
    top_driver_3: r.top_drivers[2] ? driverLabel(r.top_drivers[2]) : '',
  }))
  downloadText('churn_predictions.csv', toCsv(out))
}
</script>

<template>
  <section class="container section-sm">
    <div v-reveal>
      <span class="eyebrow">Batch prediction</span>
      <h1 class="h1">Score many customers at once</h1>
      <p class="lead">Upload a CSV of raw customer records (up to {{ MAX_ROWS }} rows) and get a churn probability, risk tier, and the top drivers for each, from the live model.</p>
    </div>

    <div v-reveal="80" class="card">
      <div class="between" style="flex-wrap:wrap;gap:.75rem">
        <div style="display:flex;gap:.75rem;flex-wrap:wrap;align-items:center">
          <label class="btn" for="csv-file" style="margin:0">Choose CSV file</label>
          <input id="csv-file" type="file" accept=".csv" style="display:none" @change="onFile" />
          <button class="btn" type="button" @click="loadSample">Use sample data</button>
          <button v-if="rows.length" class="btn" type="button" @click="reset">Clear</button>
        </div>
        <a href="#" class="btn" @click.prevent="downloadText('churn_template.csv', SAMPLE_CSV)">Download CSV template</a>
      </div>

      <p v-if="fileName" class="muted" style="margin-top:1rem">{{ fileName }}: {{ rows.length }} row(s) ready.</p>
      <ul v-if="parseErrors.length" class="limits" style="margin-top:.5rem">
        <li v-for="e in parseErrors" :key="e" class="err">{{ e }}</li>
      </ul>

      <button class="btn primary" style="margin-top:1rem" :disabled="!rows.length || status === 'loading'" @click="run">
        {{ status === 'loading' ? `Scoring ${rows.length} customers...` : `Score ${rows.length || ''} customers` }}
      </button>
    </div>

    <div v-if="status === 'loading'" class="grid g3" style="margin-top:1.5rem">
      <div class="skeleton" style="height:90px" /><div class="skeleton" style="height:90px" /><div class="skeleton" style="height:90px" />
    </div>

    <div v-else-if="status === 'error'" class="card" style="margin-top:1.5rem"><p class="err" style="margin:0">{{ error }}</p></div>

    <template v-else-if="result">
      <div v-reveal="160" class="grid g3" style="margin-top:1.5rem">
        <div class="card"><h2 class="grad" style="font-size:2rem">{{ result.count }}</h2><p style="margin:0">customers scored</p></div>
        <div class="card"><h2 class="grad" style="font-size:2rem">{{ result.flagged }}</h2><p style="margin:0">flagged at risk</p></div>
        <div class="card"><h2 class="grad" style="font-size:2rem">{{ ((result.flagged / result.count) * 100).toFixed(1) }}%</h2><p style="margin:0">of batch flagged</p></div>
      </div>

      <div v-reveal="240" class="card" style="margin-top:1rem">
        <div class="between" style="flex-wrap:wrap;gap:.75rem">
          <div class="seg" role="group" aria-label="Filter">
            <button :class="{ on: filter === 'all' }" @click="filter = 'all'">All ({{ result.count }})</button>
            <button :class="{ on: filter === 'flagged' }" @click="filter = 'flagged'">Flagged ({{ result.flagged }})</button>
          </div>
          <button class="btn" @click="exportCsv">Export results as CSV</button>
        </div>
        <p class="muted" style="margin-top:.75rem">Click a row to see its top drivers.</p>
        <div style="overflow-x:auto;margin-top:.5rem">
          <table>
            <thead><tr><th /><th>#</th><th>Contract</th><th>Tenure</th><th>Monthly</th><th>Probability</th><th>Risk</th><th>Top driver</th></tr></thead>
            <tbody>
              <template v-for="r in visibleRows" :key="r.idx">
                <tr class="row-click" tabindex="0" role="button" title="Click to view details" :aria-expanded="expanded === r.idx" @click="toggle(r.idx)" @keydown.enter="toggle(r.idx)">
                  <td>{{ expanded === r.idx ? '▾' : '▸' }}</td>
                  <td>{{ r.idx + 1 }}</td>
                  <td>{{ r.row.Contract }}</td>
                  <td>{{ r.row.tenure }}</td>
                  <td>{{ r.row.MonthlyCharges }}</td>
                  <td>{{ (r.churn_probability * 100).toFixed(1) }}%</td>
                  <td><span class="badge" :class="r.risk_tier">{{ r.risk_tier }}</span></td>
                  <td>{{ r.top_drivers[0] ? driverLabel(r.top_drivers[0]) : '—' }}</td>
                </tr>
                <tr v-if="expanded === r.idx">
                  <td colspan="8" style="background:var(--surface2); padding: 1.5rem;">
                    <div style="display: flex; flex-direction: column; gap: 1rem;">
                      
                      <!-- Recommendation Card -->
                      <div class="card" style="display: flex; gap: 2rem; align-items: center;">
                        <div style="text-align: center; padding-right: 2rem; border-right: 1px solid var(--border); min-width: 140px; flex-shrink: 0;">
                          <h3 class="grad" style="margin: 0; font-size: 2.2rem; line-height: 1;">{{ (r.churn_probability * 100).toFixed(0) }}%</h3>
                          <span class="badge" :class="r.risk_tier" style="margin-top: 0.5rem;">{{ r.risk_tier }} risk</span>
                        </div>
                        <div>
                          <span class="eyebrow" style="margin-bottom: 0.4rem;">Suggested Action</span>
                          <p style="margin: 0; font-size: 1rem; font-weight: 500; line-height: 1.5;">{{ recommend(r.top_drivers) }}</p>
                        </div>
                      </div>

                      <!-- Drivers Card -->
                      <div class="card">
                        <span class="eyebrow" style="margin-bottom: 1.25rem;">Impact Factors</span>
                        <ImpactBars :items="r.top_drivers.map((d) => ({ label: driverLabel(d), value: d.contribution, sub: d.direction }))" />
                      </div>
                      
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </section>
</template>