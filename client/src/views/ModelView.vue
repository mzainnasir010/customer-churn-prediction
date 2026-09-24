<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { api } from '../api/client'
import type { ModelInfo } from '../types'

const info = ref<ModelInfo | null>(null)
const error = ref('')
const load = async () => { error.value = ''; try { info.value = await api.info() } catch (e) { error.value = (e as Error).message } }
onMounted(load)
</script>

<template>
  <h1>Model information</h1>
  <div v-if="error" class="card" role="alert"><p>{{ error }}</p><button class="btn" @click="load">Retry</button></div>
  <div v-else-if="!info" class="grid g2"><div class="skeleton" style="height:180px" /><div class="skeleton" style="height:180px" /></div>
  <div v-else class="grid g2">
    <div class="card">
      <h3>{{ info.model }}</h3>
      <p>Decision threshold {{ info.decision_threshold }}, {{ info.input_features }} input features.</p>
      <table><tbody>
        <tr v-for="(rule, tier) in info.risk_tiers" :key="tier"><td><span class="badge" :class="tier">{{ tier }}</span></td><td>{{ rule }}</td></tr>
      </tbody></table>
    </div>
    <div class="card">
      <h3>Test-set evaluation</h3>
      <p v-if="!info.test_set_evaluation">No evaluation file found.</p>
      <div v-else style="overflow-x:auto"><table>
        <thead><tr><th>Threshold</th><th>Precision</th><th>Recall</th><th>F1</th><th>ROC-AUC</th></tr></thead>
        <tbody>
          <tr v-for="(m, name) in info.test_set_evaluation" :key="name">
            <td>{{ String(name).replace('threshold ', '') }}</td><td>{{ m.Precision }}</td><td>{{ m.Recall }}</td><td>{{ m.F1 }}</td><td>{{ m['ROC-AUC'] }}</td>
          </tr>
        </tbody></table></div>
    </div>
  </div>
</template>