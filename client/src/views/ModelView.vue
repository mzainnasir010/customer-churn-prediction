<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { api } from '../api/client'
import { COMPARISON, DATASET, FINAL, SHAP, TUNED } from '../data/results'
import type { ModelInfo } from '../types'
import BarList from '../components/BarList.vue'
import ImpactBars from '../components/ImpactBars.vue'
import ThresholdCompare from '../components/ThresholdCompare.vue'

const info = ref<ModelInfo | null>(null)
const error = ref('')
const load = async () => { error.value = ''; try { info.value = await api.info() } catch (e) { error.value = (e as Error).message } }
onMounted(load)
const c = FINAL.confusion
const cells = [
  { label: 'Correctly left alone', v: c.tn, tone: 'low' }, { label: 'False alarms', v: c.fp, tone: 'med' },
  { label: 'Missed churners', v: c.fn, tone: 'high' }, { label: 'Churners caught', v: c.tp, tone: 'low' },
]
const card = [
  ['Model', FINAL.model], ['Task', 'Binary classification'], ['Dataset', `Telco churn, ${DATASET.customers.toLocaleString()} rows`],
  ['Input features', `${DATASET.features - 2} raw + 4 engineered`], ['Threshold', String(FINAL.threshold)], ['CV ROC-AUC', String(FINAL.cvAuc)],
  ['Test ROC-AUC', String(FINAL.testAuc)], ['Test recall', '88.5%'], ['Test precision', '44.9%'],
]
</script>

<template>
  <section class="container section-sm">
    <div v-reveal>
      <span class="eyebrow">Model intelligence</span>
      <h1 class="h1">Inside the model</h1>
      <p class="lead">Five algorithms compared under identical conditions, the best three tuned, one chosen, then evaluated once on data it never saw.</p>
    </div>

    <div class="grid g2">
      <div v-reveal class="card"><h3>Model card</h3>
        <dl class="kv"><template v-for="[k, v] in card" :key="k"><dt>{{ k }}</dt><dd>{{ v }}</dd></template></dl>
        <p class="muted" style="margin:1rem 0 0">Optimised for recall: a missed churner costs more than contacting a customer who would have stayed.</p></div>
      <div v-reveal="100" class="card"><h3>Live service</h3>
        <p v-if="error" class="err" role="alert">{{ error }} <button class="btn" @click="load">Retry</button></p>
        <div v-else-if="!info" class="skeleton" style="height:150px" />
        <template v-else>
          <dl class="kv"><dt>Serving</dt><dd>{{ info.model }}</dd><dt>Threshold</dt><dd>{{ info.decision_threshold }}</dd><dt>Inputs</dt><dd>{{ info.input_features }} features</dd></dl>
          <table><tbody><tr v-for="(rule, tier) in info.risk_tiers" :key="tier"><td><span class="badge" :class="tier">{{ tier }}</span></td><td>{{ rule }}</td></tr></tbody></table>
        </template></div>
    </div>

    <div class="grid g2" style="margin-top:1rem">
      <div v-reveal class="card"><h3>Cross-validated ROC-AUC</h3><p>Five models, same folds and seed. The top four are effectively tied.</p>
        <BarList :items="COMPARISON.map((m) => ({ label: m.label, value: m.auc, text: m.auc.toFixed(3) }))" :min="0.8" :max="0.86" suffix="" /></div>
      <div v-reveal="100" class="card"><h3>After tuning</h3><p>Randomized search on the top three. XGBoost wins by a hair, so model choice matters less than data quality.</p>
        <BarList :items="TUNED.map((m) => ({ label: m.label, value: m.value, text: m.value.toFixed(4) }))" :min="0.8" :max="0.86" suffix="" /></div>
    </div>

    <div class="grid g2" style="margin-top:1rem">
      <div v-reveal><ThresholdCompare /></div>
      <div v-reveal="100" class="card"><h3>Confusion matrix (tuned threshold, test set)</h3>
        <div class="cm"><div v-for="x in cells" :key="x.label" :class="x.tone"><strong>{{ x.v }}</strong><small>{{ x.label }}</small></div></div>
        <p class="muted" style="margin:1rem 0 0">Of {{ FINAL.testSize.toLocaleString() }} unseen customers, 737 were flagged and 45% of them actually churned.</p></div>
    </div>

    <div class="grid g2" style="margin-top:1rem">
      <div v-reveal class="card"><h3>Diagnostic: class weighting</h3>
        <p style="margin:0">On Logistic Regression, weighting raised recall from 0.538 to 0.795 and cut precision from 0.665 to 0.517. ROC-AUC stayed at 0.846: weighting moves the decision line, it does not improve ranking.</p></div>
      <div v-reveal="100" class="card"><h3>Diagnostic: overfitting</h3>
        <p style="margin:0">An unlimited decision tree reached 0.999 recall on training data but 0.492 in cross-validation, and ROC-AUC fell from 0.828 to 0.658. A depth limit is required.</p></div>
    </div>

    <div v-reveal class="card" style="margin-top:1rem"><h3>Global drivers (SHAP)</h3>
      <p>Mean absolute SHAP value on the test set. Contract type is about twice as influential as tenure.</p><ImpactBars :items="SHAP" /></div>
  </section>
</template>