<script setup lang="ts">
import { computed } from 'vue'
import type { Driver } from '../types'

const props = defineProps<{ drivers: Driver[] }>()
const max = computed(() => Math.max(...props.drivers.map((d) => Math.abs(d.contribution)), 0.001))
const label = (d: Driver) => `${d.feature.replace(/_/g, ' ')} = ${d.value}`
</script>

<template>
  <ul style="list-style:none;padding:0;margin:0;display:grid;gap:.75rem">
    <li v-for="d in drivers" :key="d.feature">
      <div style="display:flex;justify-content:space-between;font-size:.9rem">
        <span>{{ label(d) }}</span>
        <strong :style="{ color: d.direction === 'increases risk' ? 'var(--high)' : 'var(--low)' }">{{ d.direction }}</strong>
      </div>
      <div style="height:8px;background:var(--border);border-radius:99px;overflow:hidden">
        <div :style="{ width: (Math.abs(d.contribution) / max) * 100 + '%', height: '100%', transition: 'width .8s ease',
          background: d.direction === 'increases risk' ? 'var(--high)' : 'var(--low)' }" />
      </div>
    </li>
  </ul>
</template>