import { randomInt } from 'crypto'

let _cpfCallCount = 0

/**
 * Gera um CPF numérico de 11 dígitos único (tempo + contador + aleatório),
 * para evitar colisões em testes E2E (unique constraint vl_cpf).
 */
export function uniqueCpf(): string {
  _cpfCallCount += 1
  const t = Date.now().toString().slice(-8) // últimos 8 dígitos do timestamp
  const c = String(_cpfCallCount).padStart(2, '0').slice(-2)
  const r = randomInt(0, 99)
  const s = t + c + String(r)
  return s.padStart(11, '0').slice(-11)
}

/**
 * Verifica se o erro é de violação de constraint única (P2002 ou driver adapter).
 * Usa message primeiro pois em alguns ambientes (Vitest) code/meta podem não estar acessíveis.
 */
export function isUniqueConstraintError(e: unknown): boolean {
  if (!e || typeof e !== 'object') return false
  const obj = e as Record<string, unknown>
  const msg = typeof obj.message === 'string' ? obj.message : ''
  if (
    msg.includes('Unique constraint') ||
    msg.includes('vl_cpf') ||
    msg.includes('UniqueConstraintViolation')
  )
    return true
  if (obj.code === 'P2002') return true
  const meta = obj.meta as Record<string, unknown> | undefined
  const driverErr = meta?.driverAdapterError as
    | Record<string, unknown>
    | undefined
  const cause = driverErr?.cause as Record<string, unknown> | undefined
  if (cause?.kind === 'UniqueConstraintViolation') return true
  return false
}
