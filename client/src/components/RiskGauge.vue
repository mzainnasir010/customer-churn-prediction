<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

const props = defineProps<{ probability: number; tier: 'Low' | 'Medium' | 'High' }>()
const LEN = 251.3
const shown = ref(false)
onMounted(() => requestAnimationFrame(() => (shown.value = true)))
const offset = computed(() => (shown.value ? LEN * (1 - props.probability) : LEN))
</script>

<template>
  <div role="img" :aria-label="`Churn probability ${(probability * 100).toFixed(1)} percent, ${tier} risk`" style="text-align:center">
    <svg viewBox="0 0 180 105" width="260">
      <path d="M10 90 A80 80 0 0 1 170 90" fill="none" stroke="var(--border)" stroke-width="14" stroke-linecap="round" />
      <path d="M10 90 A80 80 0 0 1 170 90" fill="none" :stroke="`var(--${tier === 'Low' ? 'low' : tier === 'Medium' ? 'med' : 'high'})`"
        stroke-width="14" stroke-linecap="round" :stroke-dasharray="LEN" :stroke-dashoffset="offset" style="transition:stroke-dashoffset 1s ease" />
      <text x="90" y="82" text-anchor="middle" font-size="26" font-weight="800" fill="var(--text)">{{ (probability * 100).toFixed(1) }}%</text>
    </svg>
    <div><span class="badge" :class="tier">{{ tier.toUpperCase() }} RISK</span></div>
  </div>
</template>