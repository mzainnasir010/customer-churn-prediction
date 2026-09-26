<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { BarItem } from '../types'

const props = withDefaults(defineProps<{ items: BarItem[]; min?: number; max?: number; baseline?: number; suffix?: string }>(),
  { min: 0, max: 100, suffix: '%' })
const root = ref<HTMLElement>()
const on = ref(false)
onMounted(() => {
  const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { on.value = true; io.disconnect() } }, { threshold: 0.2 })
  io.observe(root.value!)
})
const width = (v: number) => Math.max(0, Math.min(100, ((v - props.min) / (props.max - props.min)) * 100))
const tone = (v: number) => (props.baseline === undefined ? 'accent' : v > props.baseline ? 'high' : 'low')
</script>

<template>
  <ul ref="root" class="bars">
    <li v-for="(it, i) in items" :key="it.label">
      <div class="bars-row"><span>{{ it.label }}</span><strong>{{ it.text ?? it.value + suffix }}</strong></div>
      <div class="bars-track">
        <span class="bars-fill" :class="tone(it.value)" :style="{ width: on ? width(it.value) + '%' : '0%', transitionDelay: i * 60 + 'ms' }" />
        <span v-if="baseline !== undefined" class="bars-base" :style="{ left: width(baseline) + '%' }" title="Overall churn rate" />
      </div>
    </li>
  </ul>
</template>