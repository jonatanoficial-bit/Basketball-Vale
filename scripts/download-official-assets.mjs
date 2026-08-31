import fs from 'node:fs/promises'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const pack = JSON.parse(await fs.readFile(path.join(root, 'src/data/nba-license-pack.json'), 'utf8'))
const playerDir = path.join(root, 'public/assets/nba/players')
const teamDir = path.join(root, 'public/assets/nba/teams')

await fs.mkdir(playerDir, { recursive: true })
await fs.mkdir(teamDir, { recursive: true })

const headers = {
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140 Safari/537.36',
  referer: 'https://www.nba.com/',
}

async function download(url, destination) {
  try {
    await fs.access(destination)
    return { status: 'cached' }
  } catch {}

  const response = await fetch(url, { headers })
  if (!response.ok) throw new Error(`${response.status} ${url}`)
  await fs.writeFile(destination, Buffer.from(await response.arrayBuffer()))
  return { status: 'downloaded' }
}

const failures = []
for (const team of pack.teams) {
  const url = `https://cdn.nba.com/logos/nba/${team.id}/primary/L/logo.svg`
  try {
    await download(url, path.join(teamDir, `${team.abbr}.svg`))
  } catch (error) {
    failures.push({ type: 'team', id: team.abbr, error: String(error) })
  }
}

const queue = [...pack.players]
const workers = Array.from({ length: 12 }, async () => {
  while (queue.length) {
    const player = queue.shift()
    const url = `https://cdn.nba.com/headshots/nba/latest/260x190/${player.id}.png`
    try {
      await download(url, path.join(playerDir, `${player.id}.png`))
    } catch (error) {
      failures.push({ type: 'player', id: player.id, name: player.name, error: String(error) })
    }
  }
})

await Promise.all(workers)
await fs.writeFile(path.join(root, 'src/data/asset-download-report.json'), JSON.stringify({
  completedAt: new Date().toISOString(),
  teams: pack.teams.length,
  players: pack.players.length,
  failures,
}, null, 2))

console.log(`Official assets complete. Failures: ${failures.length}`)
if (failures.length) console.log(failures.slice(0, 20))
