<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import CountUp from './CountUp.vue'

const props = defineProps<{ probability: number; tier: 'Low' | 'Medium' | 'High'; threshold?: number }>()
const LEN = 251.33
const on = ref(false)
onMounted(() => requestAnimationFrame(() => (on.value = true)))
const color = computed(() => ({ Low: 'var(--low)', Medium: 'var(--med)', High: 'var(--high)' })[props.tier])
const offset = computed(() => (on.value ? LEN * (1 - props.probability) : LEN))
const tick = computed(() => {
  const a = Math.PI * (props.threshold ?? 0)
  return { x1: 90 - 68 * Math.cos(a), y1: 90 - 68 * Math.sin(a), x2: 90 - 94 * Math.cos(a), y2: 90 - 94 * Math.sin(a) }
})
</script>

<template>
  <div class="gauge" role="img" :aria-label="`Churn probability ${(probability * 100).toFixed(1)} percent, ${tier} risk`">
    <svg viewBox="0 0 180 105">
      <path d="M10 90 A80 80 0 0 1 170 90" fill="none" stroke="var(--border)" stroke-width="12" stroke-linecap="round" />
      <path d="M10 90 A80 80 0 0 1 170 90" fill="none" :stroke="color" stroke-width="12" stroke-linecap="round"
        :stroke-dasharray="LEN" :stroke-dashoffset="offset" style="transition:stroke-dashoffset 1.1s var(--ease)" />
      <line v-if="threshold" v-bind="tick" stroke="var(--text)" stroke-width="2" stroke-linecap="round" />
    </svg>
    <div class="gauge-num"><CountUp :to="probability * 100" :decimals="1" suffix="%" /></div>
    <span class="badge" :class="tier">{{ tier.toUpperCase() }} RISK</span>
    <small v-if="threshold" class="muted">Tick marks the decision threshold ({{ threshold }})</small>
  </div>
</template>