<script setup lang="ts">
import { computed, ref } from 'vue'
import { DATASET, FINAL } from '../data/results'
import { money } from '../utils/format'

const customers = ref(10000)
const value = ref(1000)
const cost = ref(20)
const success = ref(25)

const churners = computed(() => customers.value * (DATASET.churnRate / 100))
const caught = computed(() => churners.value * FINAL.tuned.recall)
const flagged = computed(() => caught.value / FINAL.tuned.precision)
const retained = computed(() => caught.value * (success.value / 100))
const protectedRev = computed(() => retained.value * value.value)
const spend = computed(() => flagged.value * cost.value)
const net = computed(() => protectedRev.value - spend.value)
const breakEven = computed(() => (caught.value * value.value > 0 ? (spend.value / (caught.value * value.value)) * 100 : 0))
</script>

<template>
  <section class="container section-sm">
    <div v-reveal>
      <span class="eyebrow">Retention simulator</span>
      <h1 class="h1">What could a campaign be worth?</h1>
      <p class="lead">The model's real recall ({{ (FINAL.tuned.recall * 100).toFixed(1) }}%), precision ({{ (FINAL.tuned.precision * 100).toFixed(1) }}%) and the {{ DATASET.churnRate }}% base churn rate, combined with assumptions you choose.</p>
    </div>
    <p v-reveal class="notice" role="note">Illustrative scenario. Not a model-derived revenue forecast: the model predicts churn risk, and the offer success rate and customer value below are your assumptions.</p>

    <div class="grid g2">
      <form v-reveal class="card" @submit.prevent>
        <div class="fields one">
          <div><label for="c">Customers in the base</label><input id="c" v-model.number="customers" type="number" min="100" step="100" /></div>
          <div><label for="v">Value of a retained customer</label><input id="v" v-model.number="value" type="number" min="0" step="50" /></div>
          <div><label for="k">Cost per retention offer</label><input id="k" v-model.number="cost" type="number" min="0" step="5" /></div>
          <div><label for="s">Offer success rate: {{ success }}%</label><input id="s" v-model.number="success" type="range" min="1" max="80" /></div>
        </div>
      </form>
      <div v-reveal="100" class="card glass" aria-live="polite">
        <dl class="kv big">
          <dt>Expected churners</dt><dd>{{ money(churners) }}</dd>
          <dt>Churners the model catches</dt><dd>{{ money(caught) }}</dd>
          <dt>Customers contacted</dt><dd>{{ money(flagged) }}</dd>
          <dt>Customers retained</dt><dd>{{ money(retained) }}</dd>
          <dt>Revenue protected</dt><dd>{{ money(protectedRev) }}</dd>
          <dt>Campaign cost</dt><dd>{{ money(spend) }}</dd>
          <dt>Net value</dt><dd :class="net >= 0 ? 'good' : 'bad'">{{ net < 0 ? '-' : '' }}{{ money(Math.abs(net)) }}</dd>
        </dl>
        <p class="muted" style="margin:1rem 0 0">Break-even: offers must succeed at least {{ breakEven.toFixed(1) }}% of the time. Because precision is {{ (FINAL.tuned.precision * 100).toFixed(0) }}%, most offers go to customers who would have stayed, so cheap offers matter.</p>
      </div>
    </div>
  </section>
</template>