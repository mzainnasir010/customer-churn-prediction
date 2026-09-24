import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUi = defineStore('ui', () => {
  const stored = localStorage.getItem('theme') as 'light' | 'dark' | null
  const theme = ref<'light' | 'dark'>(stored ?? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'))
  const apply = () => { document.documentElement.dataset.theme = theme.value; localStorage.setItem('theme', theme.value) }
  const toggle = () => { theme.value = theme.value === 'dark' ? 'light' : 'dark'; apply() }

  const toasts = ref<{ id: number; kind: 'ok' | 'err'; text: string }[]>([])
  let n = 0
  function toast(kind: 'ok' | 'err', text: string) {
    const id = ++n
    toasts.value.push({ id, kind, text })
    setTimeout(() => (toasts.value = toasts.value.filter((t) => t.id !== id)), 4500)
  }
  apply()
  return { theme, toggle, toasts, toast }
})