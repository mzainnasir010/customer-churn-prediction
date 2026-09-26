<script setup lang="ts">
import { onMounted, ref } from 'vue'

const props = defineProps<{ to: number; decimals?: number; prefix?: string; suffix?: string }>()
const shown = ref(0)
const el = ref<HTMLElement>()

onMounted(() => {
  const run = () => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { shown.value = props.to; return }
    const start = performance.now()
    const tick = (t: number) => {
      const p = Math.min((t - start) / 1400, 1)
      shown.value = props.to * (1 - Math.pow(1 - p, 3))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }
  const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { run(); io.disconnect() } })
  io.observe(el.value!)
})
</script>

<template>
  <span ref="el">{{ prefix }}{{ shown.toLocaleString(undefined, { minimumFractionDigits: decimals ?? 0, maximumFractionDigits: decimals ?? 0 }) }}{{ suffix }}</span>
</template>