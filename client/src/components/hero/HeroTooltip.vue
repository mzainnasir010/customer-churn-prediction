<script setup lang="ts">
defineProps<{ x: number; y: number; tier: 'Low' | 'Medium' | 'High'; probability: number; driver: string }>()
</script>

<template>
  <div class="ht" :class="tier" :style="{ left: x + 'px', top: y + 'px' }">
    <strong>{{ (probability * 100).toFixed(0) }}%</strong>
    <span class="ht-tier">{{ tier }} risk</span>
    <small>{{ driver }}</small>
  </div>
</template>

<style scoped>
.ht{position:absolute;transform:translate(-50%,-135%);background:rgba(10,14,26,.85);backdrop-filter:blur(10px);
border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:.5rem .7rem;min-width:130px;pointer-events:none;
box-shadow:0 8px 24px rgba(0,0,0,.45);z-index:5;transition:left .05s linear,top .05s linear}
.ht strong{display:block;font-size:1.1rem;color:#fff;font-weight:800}
.ht-tier{display:block;font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;margin:.1rem 0}
.ht.Low .ht-tier{color:#2dd4bf}.ht.Medium .ht-tier{color:#f5a524}.ht.High .ht-tier{color:#ff4d5e}
.ht small{color:rgba(255,255,255,.55);font-size:.72rem}
</style>