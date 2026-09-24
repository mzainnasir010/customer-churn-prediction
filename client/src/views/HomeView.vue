<script setup lang="ts">
const stats = [['0.848', 'Test ROC-AUC'], ['88.5%', 'Churners caught'], ['54.6%', 'Riskiest segment churn'], ['Top 5', 'Drivers per customer']]
</script>

<template>
  <section style="text-align:center;padding:3rem 0 2rem">
    <h1 style="font-size:clamp(2rem,6vw,3.4rem)"><span class="grad">Churn Analytics</span></h1>
    <p style="font-size:1.1rem;max-width:560px;margin-inline:auto">AI-powered customer risk intelligence: find who is about to leave, and why, while there is still time to act.</p>
    <RouterLink to="/predict" class="btn primary">Analyze a customer</RouterLink>
    <RouterLink to="/model" class="btn" style="margin-left:.5rem">View the model</RouterLink>
  </section>
  <div class="grid g3">
    <div v-for="[v, l] in stats" :key="l" class="card hover glass" style="text-align:center">
      <h2 class="grad" style="font-size:2rem">{{ v }}</h2><p style="margin:0">{{ l }}</p>
    </div>
  </div>
</template>