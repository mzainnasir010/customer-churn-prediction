<script setup lang="ts">
import { ref } from 'vue'
import { useUi } from './stores/ui'

const ui = useUi()
const open = ref(false)
const links = [['/', 'Overview'], ['/predict', 'Predict'], ['/model', 'Model']]
</script>

<template>
  <header class="glass" style="position:sticky;top:0;z-index:10;border-bottom:1px solid var(--border)">
    <nav class="wrap" style="display:flex;align-items:center;gap:1rem;padding-block:.75rem" aria-label="Main">
      <strong class="grad" style="font-size:1.15rem;margin-right:auto">Churn Analytics</strong>
      <div class="desk" style="display:flex;gap:.5rem">
        <RouterLink v-for="[to, name] in links" :key="to" :to="to" class="btn">{{ name }}</RouterLink>
      </div>
      <button class="btn" :aria-label="`Switch to ${ui.theme === 'dark' ? 'light' : 'dark'} theme`" @click="ui.toggle">
        {{ ui.theme === 'dark' ? 'Light' : 'Dark' }}
      </button>
      <button class="btn burger" aria-label="Menu" :aria-expanded="open" @click="open = !open">Menu</button>
    </nav>
    <Transition name="page">
      <div v-if="open" class="wrap drawer" style="padding-top:0">
        <RouterLink v-for="[to, name] in links" :key="to" :to="to" class="btn" style="display:flex;margin-bottom:.5rem" @click="open = false">{{ name }}</RouterLink>
      </div>
    </Transition>
  </header>

  <main class="wrap">
    <RouterView v-slot="{ Component }">
      <Transition name="page" mode="out-in">
        <div :key="$route.path"><component :is="Component" /></div>
      </Transition>
    </RouterView>
  </main>

  <div aria-live="polite" style="position:fixed;right:1rem;bottom:1rem;display:grid;gap:.5rem;z-index:20">
    <TransitionGroup name="page">
      <div v-for="t in ui.toasts" :key="t.id" class="card" :style="{ borderLeft: `4px solid var(--${t.kind === 'ok' ? 'low' : 'high'})` }">{{ t.text }}</div>
    </TransitionGroup>
  </div>
</template>

<style>
.burger,.drawer{display:none}
@media(max-width:640px){.desk{display:none!important}.burger{display:inline-flex}.drawer{display:block}}
</style>