<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { ImpactItem } from '../types'

const props = defineProps<{ items: ImpactItem[] }>()
const max = computed(() => Math.max(...props.items.map((i) => Math.abs(i.value)), 0.0001))
const root = ref<HTMLElement>()
const on = ref(false)
onMounted(() => {
  const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { on.value = true; io.disconnect() } }, { threshold: 0.2 })
  io.observe(root.value!)
})
</script>

<template>
  <div ref="root">
    <ul class="impact">
      <li v-for="(it, i) in items" :key="it.label">
        <div class="impact-row"><span>{{ it.label }}</span><small class="muted">{{ it.sub }}</small></div>
        <div class="impact-track">
          <span class="impact-mid" />
          <span class="impact-bar" :class="it.value > 0 ? 'up' : 'down'"
            :style="{ width: on ? (Math.abs(it.value) / max) * 50 + '%' : '0%', transitionDelay: i * 70 + 'ms' }" />
        </div>
      </li>
    </ul>
    <div class="impact-legend" style="color:var(--muted)">
      <span style="display:flex;align-items:center;gap:0.4rem"><span style="width:10px;height:10px;border-radius:50%;background:var(--low)"></span> Lowers churn risk</span>
      <span style="display:flex;align-items:center;gap:0.4rem"><span style="width:10px;height:10px;border-radius:50%;background:var(--high)"></span> Raises churn risk</span>
    </div>
  </div>
</template>