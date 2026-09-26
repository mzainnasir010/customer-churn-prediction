import type { Customer } from '../types'

const NUMERIC = new Set(['SeniorCitizen', 'tenure', 'MonthlyCharges', 'TotalCharges'])

function splitLine(line: string): string[] {
  // handles quoted commas: "Bank transfer, sort of" -> one field
  const out: string[] = []
  let cur = '', inQ = false
  for (const ch of line) {
    if (ch === '"') inQ = !inQ
    else if (ch === ',' && !inQ) { out.push(cur.trim()); cur = '' }
    else cur += ch
  }
  out.push(cur.trim())
  return out.map((v) => v.replace(/^"|"$/g, ''))
}

export function parseCsv(text: string): { rows: Customer[]; errors: string[] } {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length)
  if (!lines.length) return { rows: [], errors: ['File is empty'] }
  const headers = splitLine(lines[0])
  const rows: Customer[] = []
  const errors: string[] = []

  lines.slice(1).forEach((line, i) => {
    const cells = splitLine(line)
    if (cells.length !== headers.length) { errors.push(`Row ${i + 2}: expected ${headers.length} columns, got ${cells.length}`); return }
    const row: Customer = {}
    headers.forEach((h, j) => {
      const raw = cells[j]
      if (h === 'TotalCharges' && raw === '') { row[h] = null; return }
      row[h] = NUMERIC.has(h) ? Number(raw) : raw
    })
    rows.push(row)
  })
  return { rows, errors }
}

export function toCsv(rows: Record<string, unknown>[]): string {
  if (!rows.length) return ''
  const headers = Object.keys(rows[0])
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
  return [headers.join(','), ...rows.map((r) => headers.map((h) => esc(r[h])).join(','))].join('\n')
}

export function downloadText(filename: string, text: string, mime = 'text/csv') {
  const blob = new Blob([text], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

export const SAMPLE_CSV_HEADERS = [
  'gender', 'SeniorCitizen', 'Partner', 'Dependents', 'tenure', 'PhoneService', 'MultipleLines',
  'InternetService', 'OnlineSecurity', 'OnlineBackup', 'DeviceProtection', 'TechSupport',
  'StreamingTV', 'StreamingMovies', 'Contract', 'PaperlessBilling', 'PaymentMethod',
  'MonthlyCharges', 'TotalCharges',
]

export const SAMPLE_CSV = [
  SAMPLE_CSV_HEADERS.join(','),
  'Female,0,No,No,3,Yes,No,Fiber optic,No,No,No,No,No,No,Month-to-month,Yes,Electronic check,75.0,',
  'Male,0,Yes,Yes,60,Yes,Yes,DSL,Yes,Yes,Yes,Yes,No,No,Two year,No,Credit card (automatic),60.0,3600.0',
].join('\n')