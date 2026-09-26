<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useUi } from '../stores/ui'

const ui = useUi()
const route = useRoute()
const open = ref(false)
const links = [['/', 'Overview'], ['/predict', 'Predict'], ['/batch', 'Batch'], ['/insights', 'Insights'], ['/model', 'Model'], ['/simulator', 'Simulator'], ['/methodology', 'Method']]

watch(() => route.path, () => (open.value = false))
</script>

<template>
  <header class="nav glass">
    <div class="container nav-in">
      <RouterLink to="/" class="brand"><span class="logo" aria-hidden="true" />ChurnIQ</RouterLink>
      <nav class="nav-links" aria-label="Main">
        <RouterLink v-for="[to, name] in links" :key="to" :to="to">{{ name }}</RouterLink>
      </nav>
      <button class="icon-btn" :aria-label="`Switch to ${ui.theme === 'dark' ? 'light' : 'dark'} theme`" @click="ui.toggle">
        <svg v-if="ui.theme === 'dark'" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
        <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
      </button>
      <button class="icon-btn burger" aria-label="Menu" :aria-expanded="open" @click="open = !open">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path v-if="!open" d="M4 7h16M4 12h16M4 17h16" /><path v-else d="M6 6l12 12M18 6L6 18" /></svg>
      </button>
    </div>
    <Transition name="drawer">
      <nav v-if="open" class="drawer container" aria-label="Mobile">
        <RouterLink v-for="[to, name] in links" :key="to" :to="to">{{ name }}</RouterLink>
      </nav>
    </Transition>
  </header>
</template>