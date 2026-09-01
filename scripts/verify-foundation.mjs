import { readFile, stat } from 'node:fs/promises'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const pack = JSON.parse(await readFile(resolve(root, 'src/data/nba-license-pack.json'), 'utf8'))
const league = await readFile(resolve(root, 'src/domain/league.ts'), 'utf8')
const career = await readFile(resolve(root, 'src/domain/career.ts'), 'utf8')
const app = await readFile(resolve(root, 'src/App.tsx'), 'utf8')
const checks = [
  ['30 franquias no pacote', pack.teams.length === 30],
  ['elenco oficial local disponível', pack.players.length >= 550],
  ['calendário estrutural de 82 rodadas', league.includes('round < 82')],
  ['simulação por eventos', league.includes('GameEvent') && league.includes('made3')],
  ['migração segura v1 para v2', career.includes('migrateLegacy') && career.includes('version: 2')],
  ['Game Center, PBP e box score', app.includes('Game Center') && app.includes('Play-by-play') && app.includes('BoxScore')],
  ['mundo da liga no mesmo dia', app.includes('dailyGames')],
  ['PWA gerado', await stat(resolve(root, 'dist/manifest.webmanifest')).then(() => true).catch(() => false)],
]
for (const [label, passed] of checks) console.log(`${passed ? 'PASS' : 'FAIL'}  ${label}`)
if (checks.some(([, passed]) => !passed)) process.exit(1)
