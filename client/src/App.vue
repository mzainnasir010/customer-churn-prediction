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
  
  <!-- Modern Snackbar / Toast Notification Stack -->
  <div class="toasts" aria-live="polite">
    <TransitionGroup name="toast">
      <div v-for="t in ui.toasts" :key="t.id" class="toast" :class="t.kind">
        <div class="toast-badge">
          <svg v-if="t.kind === 'ok'" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <svg v-else viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        <div class="toast-body">
          <span class="toast-title">{{ t.kind === 'ok' ? 'Success' : 'Attention' }}</span>
          <span class="toast-text">{{ t.text }}</span>
        </div>

        <button class="toast-close" @click="ui.dismiss(t.id)" aria-label="Dismiss notification">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div class="toast-progress"></div>
      </div>
    </TransitionGroup>
  </div>
</template>