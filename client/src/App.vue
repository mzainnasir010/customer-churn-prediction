<script setup lang="ts">
import AppNav from './components/AppNav.vue'
import AppFooter from './components/AppFooter.vue'
import { useUi } from './stores/ui'

const ui = useUi()
</script>

<template>
  <a href="#main" class="skip">Skip to content</a>
  <AppNav />
  <main id="main">
    <RouterView v-slot="{ Component }">
      <Transition name="page" mode="out-in">
        <div :key="$route.path"><component :is="Component" /></div>
      </Transition>
    </RouterView>
  </main>
  <AppFooter />
  <div class="toasts" aria-live="polite">
    <TransitionGroup name="page">
      <div v-for="t in ui.toasts" :key="t.id" class="toast" :class="t.kind">{{ t.text }}</div>
    </TransitionGroup>
  </div>
</template>