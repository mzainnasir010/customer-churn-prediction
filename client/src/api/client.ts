import type { Customer, ModelInfo, Options, Prediction, BatchResult } from '../types'

const BASE = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000'

export class ApiError extends Error {
  public kind: 'validation' | 'api' | 'network'

  constructor(kind: 'validation' | 'api' | 'network', message: string) {
    super(message)
    this.kind = kind
    this.name = 'ApiError'
  }
}

function formatValidationError(details: any[]): string {
  if (!Array.isArray(details) || !details.length) {
    return 'Invalid input request.'
  }

  const missingFields = new Set<string>()
  const otherErrors: string[] = []

  for (const d of details) {
    const field = d.loc && d.loc.length ? d.loc[d.loc.length - 1] : ''
    const rowIdx = d.loc && typeof d.loc[2] === 'number' ? d.loc[2] + 1 : null

    if (d.type === 'missing' || d.msg?.toLowerCase().includes('required')) {
      if (field) missingFields.add(String(field))
    } else {
      const fieldStr = field ? `'${field}' ` : ''
      const rowStr = rowIdx ? `Row ${rowIdx}: ` : ''
      otherErrors.push(`${rowStr}${fieldStr}${d.msg}`)
    }
  }

  const parts: string[] = []
  if (missingFields.size > 0) {
    parts.push(`Missing required column(s): ${Array.from(missingFields).join(', ')}`)
  }
  if (otherErrors.length > 0) {
    parts.push(otherErrors.slice(0, 3).join('; '))
  }

  return parts.join('. ') || 'Validation error'
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
      throw new ApiError('validation', formatValidationError(body.detail))
    }

    if (!res.ok) {
      throw new ApiError('api', `Server error (${res.status})`)
    }

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

  predict: (c: Customer) =>
    request<Prediction>('/predict', {
      method: 'POST',
      body: JSON.stringify(c),
    }),

  predictBatch: (customers: Customer[]) =>
  request<BatchResult>('/predict/batch', { method: 'POST', body: JSON.stringify({ customers }) }),

  health: async () => {
    const t = performance.now()
    const r = await request<{ status: string; model_loaded: boolean }>('/health', undefined, 0)
    return { ...r, ms: Math.round(performance.now() - t) }
  },
}

