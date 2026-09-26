<script setup lang="ts">
import { computed, ref } from 'vue'
import { FINAL } from '../data/results'
import BarList from './BarList.vue'

const mode = ref<'tuned' | 'default'>('tuned')
const m = computed(() => FINAL[mode.value])
const items = computed(() => [
  { label: 'Recall (churners caught)', value: +(m.value.recall * 100).toFixed(1) },
  { label: 'Precision (flagged who churn)', value: +(m.value.precision * 100).toFixed(1) },
  { label: 'F1', value: +(m.value.f1 * 100).toFixed(1) },
  { label: 'Accuracy', value: +(m.value.accuracy * 100).toFixed(1) },
])
</script>

<template>
  <div class="card">
    <div class="seg" role="group" aria-label="Decision threshold">
      <button :aria-pressed="mode === 'default'" :class="{ on: mode === 'default' }" @click="mode = 'default'">Default 0.50</button>
      <button :aria-pressed="mode === 'tuned'" :class="{ on: mode === 'tuned' }" @click="mode = 'tuned'">Tuned {{ FINAL.threshold }}</button>
    </div>
    <BarList :items="items" />
    <p class="muted" style="margin:1rem 0 0" aria-live="polite">
      <template v-if="mode === 'tuned'">Catches {{ FINAL.confusion.tp }} of {{ FINAL.confusion.tp + FINAL.confusion.fn }} churners in the test set, at the cost of {{ FINAL.confusion.fp }} false alarms. Accuracy falls by design.</template>
      <template v-else>Higher accuracy, but only about half of churners are caught, so most at-risk customers would be missed.</template>
    </p>
  </div>
</template>