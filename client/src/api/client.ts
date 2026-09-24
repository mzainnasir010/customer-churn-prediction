import type { Customer, ModelInfo, Options, Prediction } from '../types'

const BASE = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000'

export class ApiError extends Error {
  constructor(public kind: 'validation' | 'api' | 'network', message: string) { super(message) }
}

async function request<T>(path: string, init?: RequestInit, retries = 1): Promise<T> {
  try {
    const res = await fetch(BASE + path, {
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(15000),
      ...init,
    })
    if (res.status === 422) {
      const body = await res.json()
      throw new ApiError('validation', body.detail.map((d: any) => `${d.loc.slice(1).join('.')}: ${d.msg}`).join('; '))
    }
    if (!res.ok) throw new ApiError('api', `Server error (${res.status})`)
    return (await res.json()) as T
  } catch (e) {
    if (e instanceof ApiError) throw e
    if (retries > 0) return request<T>(path, init, retries - 1)
    throw new ApiError('network', 'Cannot reach the API. Is the server running?')
  }
}

export const api = {
  options: () => request<Options>('/model/options'),
  info: () => request<ModelInfo>('/model/info'),
  predict: (c: Customer) => request<Prediction>('/predict', { method: 'POST', body: JSON.stringify(c) }),
}