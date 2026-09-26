<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

interface Step { title: string; text: string; stat: string }
const props = defineProps<{ items: Step[] }>()

const rootEl = ref<HTMLElement | null>(null)
const activeIndex = ref(-1)
const progress = ref(0)
const reducedMotion = ref(false)
let itemEls: HTMLElement[] = []
let ticking = false

function recalc() {
  ticking = false
  if (!rootEl.value || !itemEls.length) return
  
  const windowHeight = window.innerHeight
  // Trigger animations when elements cross the bottom 40% of the screen (i.e. 60% from top)
  const triggerPoint = windowHeight * 0.6
  
  const rect = rootEl.value.getBoundingClientRect()
  const scrolled = triggerPoint - rect.top
  const totalHeight = rect.height
  
  // Calculate spine progress (0 to 1)
  let p = scrolled / totalHeight
  progress.value = Math.max(0, Math.min(1, p))

  // Determine active item
  let next = -1
  for (let i = 0; i < itemEls.length; i++) {
    const itemRect = itemEls[i].getBoundingClientRect()
    // When the middle of the card crosses the trigger point
    if (itemRect.top + itemRect.height / 2 <= triggerPoint + 60) {
      next = i
    }
  }
  activeIndex.value = next
}

function onScroll() {
  if (ticking) return
  ticking = true
  requestAnimationFrame(recalc)
}

onMounted(async () => {
  reducedMotion.value = matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reducedMotion.value) {
    progress.value = 1
    activeIndex.value = props.items.length
    return
  }

  await nextTick()
  itemEls = Array.from(rootEl.value?.querySelectorAll<HTMLElement>('.pt-item') ?? [])
  recalc()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
})
</script>

<template>
  <div ref="rootEl" class="premium-timeline" :style="{ '--scroll-p': progress }">
    <!-- Center spine background -->
    <div class="pt-spine"></div>
    <!-- Center spine fill (scroll driven) -->
    <div class="pt-spine-fill"></div>

    <div
      v-for="(s, i) in items"
      :key="s.title"
      class="pt-item"
      :class="{ 'is-active': i === activeIndex, 'is-past': i < activeIndex, 'is-left': i % 2 === 0, 'is-right': i % 2 !== 0 }"
    >
      <div class="pt-node">
        <div class="pt-node-inner"></div>
      </div>

      <div class="pt-card card glass">
        <div class="pt-card-header">
          <span class="pt-num">STEP {{ String(i + 1).padStart(2, '0') }}</span>
          <h3 class="pt-title">{{ s.title }}</h3>
        </div>
        <p class="pt-text">{{ s.text }}</p>
        <div class="pt-stat-wrap">
          <strong class="pt-stat grad">{{ s.stat }}</strong>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.premium-timeline {
  position: relative;
  max-width: 1040px;
  margin: 4rem auto 2rem;
  padding: 2rem 0;
  display: flex;
  flex-direction: column;
  gap: 3.5rem; /* vertical spacing between alternating cards */
}

/* ── SPINE ── */
.pt-spine {
  position: absolute;
  top: 0; bottom: 0;
  left: 50%; transform: translateX(-50%);
  width: 2px;
  background: var(--border);
  opacity: 0.6;
}
.pt-spine-fill {
  position: absolute;
  top: 0; left: 50%; transform: translateX(-50%);
  width: 2px;
  height: calc(var(--scroll-p) * 100%);
  background: linear-gradient(to bottom, var(--low) 0%, var(--accent) 100%);
  box-shadow: 0 0 20px var(--accent);
  transition: height 0.1s linear; /* smooth out fast scrolls slightly */
  z-index: 1;
}

/* ── ITEMS & NODES ── */
.pt-item {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}
.pt-node {
  position: absolute;
  left: 50%; top: 50%;
  transform: translate(-50%, -50%);
  width: 28px; height: 28px;
  border-radius: 50%;
  background: var(--surface);
  border: 3px solid var(--border);
  display: grid; place-items: center;
  z-index: 2;
  transition: all 0.5s var(--ease);
}
.pt-item.is-active .pt-node, .pt-item.is-past .pt-node {
  border-color: var(--accent);
  box-shadow: 0 0 20px color-mix(in srgb, var(--accent) 40%, transparent);
}
.pt-node-inner {
  width: 10px; height: 10px;
  border-radius: 50%;
  background: transparent;
  transition: all 0.5s var(--ease);
}
.pt-item.is-active .pt-node-inner, .pt-item.is-past .pt-node-inner {
  background: var(--accent);
}
.pt-item.is-active .pt-node {
  transform: translate(-50%, -50%) scale(1.15);
}

/* ── CARDS ── */
.pt-card {
  width: calc(50% - 4.5rem);
  opacity: 0.3;
  transform: translateY(24px) scale(0.97);
  filter: saturate(0.2);
  transition: all 0.7s var(--ease);
  padding: 2.25rem;
}
.pt-item.is-left .pt-card {
  margin-right: auto;
  text-align: right;
  transform-origin: center right;
}
.pt-item.is-right .pt-card {
  margin-left: auto;
  text-align: left;
  transform-origin: center left;
}

/* Reveal active/past cards */
.pt-item.is-active .pt-card, .pt-item.is-past .pt-card {
  opacity: 1;
  transform: translateY(0) scale(1);
  filter: saturate(1);
}
.pt-item.is-active .pt-card {
  border-color: var(--accent);
  box-shadow: 0 12px 40px color-mix(in srgb, var(--accent) 12%, transparent);
}

/* ── CONTENT ── */
.pt-num {
  font-size: 0.75rem; 
  font-weight: 800; 
  color: var(--muted); 
  letter-spacing: 0.15em;
  display: block; 
  margin-bottom: 0.6rem;
  transition: color 0.5s var(--ease);
}
.pt-item.is-active .pt-num {
  color: var(--accent);
}
.pt-title {
  font-size: 1.3rem;
  margin-bottom: 0.75rem;
}
.pt-text {
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0;
}
.pt-stat-wrap {
  margin-top: 1.5rem;
  display: flex;
}
.pt-item.is-left .pt-stat-wrap {
  justify-content: flex-end;
}
.pt-stat {
  font-size: 2.4rem; 
  font-weight: 800; 
  letter-spacing: -0.03em; 
  line-height: 1;
}

/* ── REDUCED MOTION ── */
@media (prefers-reduced-motion: reduce) {
  .pt-card {
    opacity: 1; transform: none; filter: none;
  }
  .pt-spine-fill {
    transition: none;
  }
}

/* ── MOBILE ── */
@media (max-width: 820px) {
  .premium-timeline {
    gap: 2rem;
  }
  .pt-spine, .pt-spine-fill {
    left: 28px;
  }
  .pt-node {
    left: 28px;
  }
  .pt-card {
    width: calc(100% - 72px);
    margin-left: auto !important;
    text-align: left !important;
    padding: 1.5rem;
  }
  .pt-item.is-left .pt-card, .pt-item.is-right .pt-card {
    transform-origin: center left;
  }
  .pt-item.is-left .pt-stat-wrap {
    justify-content: flex-start;
  }
}
</style>