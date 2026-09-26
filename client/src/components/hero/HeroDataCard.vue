<!-- Glass intelligence card floating around the 3D analyst -->
<script setup lang="ts">
defineProps<{
  title: string
  value: string
  sub?: string
  accent?: string // optional accent color override
}>()
</script>

<template>
  <div class="hdc" :style="accent ? `--hdc-accent: ${accent}` : ''">
    <div class="hdc-title">{{ title }}</div>
    <div class="hdc-value">{{ value }}</div>
    <div v-if="sub" class="hdc-sub">{{ sub }}</div>
    <div class="hdc-shimmer" aria-hidden="true"></div>
  </div>
</template>

<style scoped>
.hdc {
  --hdc-accent: var(--accent);
  background: color-mix(in srgb, var(--surface) 40%, transparent);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-left: 2px solid var(--hdc-accent);
  border-radius: 4px;
  padding: 0.6rem 0.85rem;
  min-width: 120px;
  position: relative;
  overflow: hidden;
  cursor: default;
  transition: transform 0.25s ease, background 0.25s ease;
}

.hdc:hover {
  background: color-mix(in srgb, var(--surface) 70%, transparent);
  transform: translateX(4px);
}

.hdc-title {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted);
  margin-bottom: 0.2rem;
}

.hdc-value {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -0.02em;
  line-height: 1.1;
}

.hdc-sub {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--hdc-accent);
  margin-top: 0.2rem;
  letter-spacing: 0.02em;
}

/* Subtle shimmer sweep on hover */
.hdc-shimmer {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    105deg,
    transparent 40%,
    color-mix(in srgb, var(--text) 5%, transparent) 50%,
    transparent 60%
  );
  background-size: 200% 100%;
  background-position: 200% 0;
  transition: background-position 0.6s ease;
  pointer-events: none;
}

.hdc:hover .hdc-shimmer {
  background-position: -200% 0;
}
</style>
