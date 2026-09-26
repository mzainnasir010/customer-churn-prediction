<script setup lang="ts">
import { CHURN_BASE, INSIGHTS, SEGMENTS } from '../data/results'
import BarList from '../components/BarList.vue'

const heat = (v: number) => `color-mix(in srgb, var(--high) ${Math.round(Math.min(v, 60) / 60 * 85)}%, var(--surface))`
</script>

<template>
  <section class="container section-sm">
    <div v-reveal>
      <span class="eyebrow">Churn insights</span>
      <h1 class="h1">What the data says about who leaves</h1>
      <p class="lead">Churn rates from the exploratory analysis. Red bars are above the overall {{ CHURN_BASE }}% rate (marked by the line), green bars below. These are associations, not proven causes.</p>
    </div>
    <div class="grid g2">
      <article v-for="(ins, i) in INSIGHTS" :key="ins.id" v-reveal="(i % 2) * 80" class="card hover">
        <span class="chip">Insight {{ String(i + 1).padStart(2, '0') }}</span>
        <h3 style="margin-top:.6rem">{{ ins.title }}</h3>
        <p>{{ ins.takeaway }}</p>
        <BarList :items="ins.items" :max="60" :baseline="CHURN_BASE" />
      </article>
    </div>

    <div v-reveal class="card" style="margin-top:1rem">
      <span class="chip">Risk segments</span>
      <h3 style="margin-top:.6rem">Churn rate by contract and internet service</h3>
      <p>Risk concentrates where features combine: month-to-month fiber optic customers churn at 54.6%, the riskiest segment.</p>
      <div style="overflow-x:auto"><table class="heat">
        <thead><tr><th /><th v-for="c in SEGMENTS.cols" :key="c">{{ c }}</th></tr></thead>
        <tbody><tr v-for="r in SEGMENTS.rows" :key="r.label"><th scope="row">{{ r.label }}</th>
          <td v-for="(v, i) in r.values" :key="i" :style="{ background: heat(v) }">{{ v }}%</td></tr></tbody>
      </table></div>
    </div>
  </section>
</template>