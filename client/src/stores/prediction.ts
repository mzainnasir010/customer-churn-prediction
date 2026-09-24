import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '../api/client'
import type { Customer, Prediction } from '../types'
import { useUi } from './ui'

export const usePrediction = defineStore('prediction', () => {
  const ui = useUi()
  const status = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
  const result = ref<Prediction | null>(null)
  const error = ref('')

  async function run(customer: Customer) {
    status.value = 'loading'; error.value = ''
    try {
      result.value = await api.predict(customer)
      status.value = 'success'
      ui.toast('ok', 'Analysis complete')
    } catch (e) {
      status.value = 'error'; error.value = (e as Error).message
      ui.toast('err', error.value)
    }
  }
  return { status, result, error, run }
})