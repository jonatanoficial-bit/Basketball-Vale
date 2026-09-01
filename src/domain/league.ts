import type { CareerV2, Fixture, GameEvent, GameResult, Player, RotationEntry, StatLine, Team, TeamRecord } from './types'
import { addStats, blankStats } from './types'

const seasonStart = new Date('2026-10-20T12:00:00Z')
const dateAt = (round: number) => { const d = new Date(seasonStart); d.setUTCDate(d.getUTCDate() + Math.floor(round * 2.05)); return d.toISOString().slice(0, 10) }

/** 82 rounds x 15 games: every franchise receives exactly 82 regular-season fixtures. */
export function createLeagueSchedule(teams: Team[]): Fixture[] {
  const ring = teams.map((team) => team.abbr)
  const fixtures: Fixture[] = []
  for (let round = 0; round < 82; round += 1) {
    const shift = round % ring.length
    const rotated = ring.map((_, index) => ring[(index + shift) % ring.length])
    for (let pair = 0; pair < 15; pair += 1) {
      const left = rotated[pair]
      const right = rotated[29 - pair]
      const home = (round + pair) % 2 === 0 ? left : right
      const away = home === left ? right : left
      fixtures.push({ id: `26-${round + 1}-${pair + 1}`, date: dateAt(round), round: round + 1, home, away, status: 'scheduled' })
    }
  }
  return fixtures
}

export const baseStandings = (teams: Team[]): Record<string, TeamRecord> => Object.fromEntries(teams.map((team) => [team.abbr, { team: team.abbr, wins: 0, losses: 0, pf: 0, pa: 0, streak: 0 }]))
const seeded = (seed: number) => { let x = Math.sin(seed * 999) * 10000; return () => { x = Math.sin(x) * 10000; return x - Math.floor(x) } }
const nameOf = (players: Player[], id: number) => players.find((player) => player.id === id)?.name ?? 'Jogador'
const playerPool = (players: Player[], team: string, rotation?: RotationEntry[]) => {
  const roster = players.filter((player) => player.team === team).sort((a, b) => b.overall - a.overall).slice(0, 10)
  if (!rotation || rotation.length === 0) return roster.map((player, i) => ({ player, minutes: [34, 33, 31, 29, 27, 23, 20, 16, 15, 12][i] }))
  return roster.map((player, i) => ({ player, minutes: rotation.find((entry) => entry.playerId === player.id)?.minutes ?? [34, 33, 31, 29, 27, 23, 20, 16, 15, 12][i] }))
}
const zeroBox = (pool: ReturnType<typeof playerPool>) => Object.fromEntries(pool.map(({ player }) => [player.id, blankStats()])) as Record<number, StatLine>
const sumPoints = (box: Record<number, StatLine>) => Object.values(box).reduce((sum, line) => sum + line.pts, 0)

export function simulateFixture(fixture: Fixture, players: Player[], userTeam: string, rotation: RotationEntry[], tactics: CareerV2['tactics'], includeEvents = true): GameResult {
  const random = seeded(Number(fixture.id.replace(/\D/g, '')) + fixture.round * 17)
  const homePool = playerPool(players, fixture.home, fixture.home === userTeam ? rotation : undefined)
  const awayPool = playerPool(players, fixture.away, fixture.away === userTeam ? rotation : undefined)
  const box = { ...zeroBox(homePool), ...zeroBox(awayPool) }
  const events: GameEvent[] = []
  const scores = { [fixture.home]: 0, [fixture.away]: 0 }
  const pools = { [fixture.home]: homePool, [fixture.away]: awayPool }
  let seq = 0
  for (let possession = 0; possession < 194; possession += 1) {
    const period = Math.min(4, Math.floor(possession / 49) + 1)
    const attacking = possession % 2 === 0 ? fixture.home : fixture.away
    const defending = attacking === fixture.home ? fixture.away : fixture.home
    const pool = pools[attacking]
    const shooterInfo = pool[Math.min(pool.length - 1, Math.floor(random() * pool.length))]
    const shooter = shooterInfo.player
    const line = box[shooter.id]
    const three = random() < 0.37
    const userAdjustment = attacking === userTeam ? (tactics.pace - 50) / 450 : 0
    const makeChance = Math.min(0.67, Math.max(0.38, 0.44 + (shooter.overall - 70) / 180 + userAdjustment + (three ? -0.045 : 0.035)))
    const made = random() < makeChance
    const clock = Math.max(1, 720 - (possession % 49) * 14)
    const type = made ? (three ? 'made3' : 'made2') : (three ? 'miss3' : 'miss2')
    line.fga += 1; if (three) line.tpa += 1
    if (made) { line.fgm += 1; if (three) line.tpm += 1; line.pts += three ? 3 : 2; scores[attacking] += three ? 3 : 2 }
    if (!made) { const rebounder = pools[defending][Math.floor(random() * pools[defending].length)].player; box[rebounder.id].reb += 1 }
    if (random() < .12) { const teammate = pool[Math.floor(random() * pool.length)].player; if (teammate.id !== shooter.id && made) box[teammate.id].ast += 1 }
    if (random() < .075) { line.tov += 1; const thief = pools[defending][Math.floor(random() * pools[defending].length)].player; box[thief.id].stl += 1 }
    if (includeEvents) events.push({ id: `${fixture.id}-e${seq}`, seq: seq++, period, clock, shotClock: Math.floor(random() * 17) + 4, team: attacking, playerId: shooter.id, type, text: `${nameOf(players, shooter.id)} ${made ? (three ? 'converte de três' : 'converte a cesta') : 'não converte o arremesso'}.`, homeScore: scores[fixture.home], awayScore: scores[fixture.away], x: 18 + random() * 64, y: 13 + random() * 74 })
  }
  if (scores[fixture.home] === scores[fixture.away]) { const closer = homePool[0].player; box[closer.id].pts += 2; box[closer.id].fgm += 1; box[closer.id].fga += 1; scores[fixture.home] += 2 }
  for (const entry of [...homePool, ...awayPool]) { const line = box[entry.player.id]; line.gp = 1; line.gs = entry.minutes >= 27 ? 1 : 0; line.min = entry.minutes }
  const homeTotal = homePool.map(({ player }) => box[player.id]).reduce(addStats, blankStats())
  const awayTotal = awayPool.map(({ player }) => box[player.id]).reduce(addStats, blankStats())
  return { id: `game-${fixture.id}`, fixtureId: fixture.id, home: fixture.home, away: fixture.away, homeScore: sumPoints(Object.fromEntries(homePool.map(({ player }) => [player.id, box[player.id]]))), awayScore: sumPoints(Object.fromEntries(awayPool.map(({ player }) => [player.id, box[player.id]]))), playedAt: fixture.date, events, box, teamTotals: { [fixture.home]: homeTotal, [fixture.away]: awayTotal } }
}

export function applyResults(career: CareerV2, games: GameResult[]): CareerV2 {
  const next = structuredClone(career)
  for (const game of games) {
    const fixture = next.fixtures.find((candidate) => candidate.id === game.fixtureId)
    if (!fixture || fixture.status === 'played') continue
    fixture.status = 'played'; fixture.homeScore = game.homeScore; fixture.awayScore = game.awayScore; fixture.gameId = game.id
    next.results[game.id] = game
    const home = next.standings[game.home]; const away = next.standings[game.away]
    home.pf += game.homeScore; home.pa += game.awayScore; away.pf += game.awayScore; away.pa += game.homeScore
    const homeWin = game.homeScore > game.awayScore
    home.wins += homeWin ? 1 : 0; home.losses += homeWin ? 0 : 1; away.wins += homeWin ? 0 : 1; away.losses += homeWin ? 1 : 0
    home.streak = homeWin ? Math.max(1, home.streak + 1) : Math.min(-1, home.streak - 1); away.streak = homeWin ? Math.min(-1, away.streak - 1) : Math.max(1, away.streak + 1)
    Object.entries(game.box).forEach(([id, line]) => { const playerId = Number(id); next.playerStats[playerId] = addStats(next.playerStats[playerId] ?? blankStats(), line) })
    if (game.home === next.teamAbbr || game.away === next.teamAbbr) { next.record = { wins: next.standings[next.teamAbbr].wins, losses: next.standings[next.teamAbbr].losses }; next.currentDate = game.playedAt }
  }
  return next
}

export const standingsSorted = (records: Record<string, TeamRecord>) => Object.values(records).sort((a, b) => b.wins - a.wins || (b.pf - b.pa) - (a.pf - a.pa))
export const nextTeamFixture = (career: CareerV2) => career.fixtures.find((fixture) => fixture.status === 'scheduled' && (fixture.home === career.teamAbbr || fixture.away === career.teamAbbr))
