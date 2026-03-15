/**
 * Roda cada arquivo E2E em um processo separado do Vitest, em sequência.
 * Evita que truncate/estado de um arquivo interfira em outro (mesmo banco).
 */
import { execSync } from 'child_process'
import { readdirSync } from 'fs'
import { join } from 'path'

// Apenas src do projeto atual (não projeto-exemplo)
const root = join(process.cwd(), 'src')
const config = join(process.cwd(), 'vitest.config.e2e.ts')

function* findE2eSpecs(dir, base = 'src') {
  const entries = readdirSync(dir, { withFileTypes: true })
  for (const e of entries) {
    if (e.name === 'projeto-exemplo') continue
    const rel = `${base}/${e.name}`
    if (e.isDirectory()) {
      yield* findE2eSpecs(join(dir, e.name), rel)
    } else if (e.name.endsWith('.e2e-spec.ts')) {
      yield rel
    }
  }
}

const files = [...findE2eSpecs(root)].sort()
if (files.length === 0) {
  console.error('Nenhum arquivo *.e2e-spec.ts encontrado em src/')
  process.exit(1)
}

console.log(`Rodando ${files.length} arquivo(s) E2E em sequência...\n`)
let failed = 0
for (const file of files) {
  const cmd = `pnpm exec vitest run --config "${config}" "${file}"`
  console.log(`▶ ${file}`)
  try {
    execSync(cmd, { stdio: 'inherit', cwd: process.cwd() })
  } catch {
    failed++
  }
}
if (failed > 0) {
  console.error(`\n${failed} arquivo(s) com falha.`)
  process.exit(1)
}
console.log('\n✓ Todos os testes E2E passaram.')
