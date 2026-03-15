import { spawnSync } from 'node:child_process'

const commands = [
  ['docker', ['compose', 'up', '-d']],
  ['pnpm', ['run', 'db:migrate:deploy']],
  ['pnpm', ['run', 'db:seed:demo']],
]

for (const [command, args] of commands) {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    stdio: 'inherit',
    shell: true,
  })

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}
