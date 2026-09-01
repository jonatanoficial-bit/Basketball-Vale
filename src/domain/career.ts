import rawPack from '../data/nba-license-pack.json'
import { baseStandings, createLeagueSchedule } from './league'
import { blankStats, type CareerV2, type Language, type Player, type RotationEntry, type Team } from './types'

const pack = rawPack as unknown as { teams: Team[]; players: Player[] }
export const teams = pack.teams
export const players = pack.players
export const SAVE_KEY = 'vale-basket-manager-career-v2'
export const LEGACY_KEY = 'vale-basket-manager-career-v1'
export const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`
export const money = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'USD', notation: 'compact' }).format(value)
export const dateLabel = (date: string, language = 'pt-BR') => new Intl.DateTimeFormat(language, { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T12:00:00Z`))

const defaultRotation = (teamAbbr: string): RotationEntry[] => players.filter((player) => player.team === teamAbbr).sort((a, b) => b.overall - a.overall).slice(0, 10).map((player, index) => ({ playerId: player.id, minutes: [34, 33, 31, 29, 27, 23, 20, 16, 15, 12][index], role: index < 5 ? 'Starter' : index < 9 ? 'Rotation' : 'Reserve' }))
export const makeProspects = (): CareerV2['prospects'] => [
  ['dev-01', 'Dario Vale', 'PG', 19, 'Criador de jogo', 'Loteria'], ['dev-02', 'Malik Torres', 'SG', 20, 'Pontuador de perímetro', 'Top 10'], ['dev-03', 'Ivo Martins', 'SF', 19, 'Ala two-way', 'Top 15'], ['dev-04', 'Kenji Sato', 'PF', 20, 'Stretch four', '1ª rodada'], ['dev-05', 'Noah Brooks', 'C', 19, 'Protetor de aro', '1ª rodada'],
].map(([id, name, position, age, archetype, projection]) => ({ id: String(id), name: String(name), position: String(position), age: Number(age), archetype: String(archetype), projection: String(projection), scouting: 25, note: 'Prospecto fictício de desenvolvimento (DEV).' }))

export function makeCareer(team: Team, manager: CareerV2['manager'], language: Language = 'pt-BR'): CareerV2 {
  return { version: 2, createdAt: new Date().toISOString(), currentDate: '2026-10-20', teamAbbr: team.abbr, language, manager, record: { wins: 0, losses: 0 }, fanMood: 66, chemistry: 62, budget: 18_500_000, rotation: defaultRotation(team.abbr), tactics: { pace: 55, offense: 'Equilibrado', defense: 'Trocas seletivas', rebounding: 'Proteção de aro', focus: 'Ataque ao aro' }, health: Object.fromEntries(players.filter((player) => player.team === team.abbr).map((player) => [player.id, { fatigue: 18, condition: 92 }])), playerStats: Object.fromEntries(players.map((player) => [player.id, blankStats()])), fixtures: createLeagueSchedule(teams), results: {}, standings: baseStandings(teams), news: [{ id: 'welcome', date: '2026-10-20', category: 'team', title: `Nova gestão em ${team.name}`, body: 'A pré-temporada começa com o plano de jogo e a rotação sob seu comando.' }], training: { focus: 'Equilíbrio', sessions: ['Técnica individual', 'Defesa coletiva', 'Recuperação'], load: 55 }, staff: [{ role: 'Assistente principal', name: 'Avery Collins', impact: 'Desenvolvimento tático', level: 3 }, { role: 'Preparadora física', name: 'Renata Mello', impact: 'Condição e recuperação', level: 3 }, { role: 'Analista', name: 'Jordan Park', impact: 'Scouting e vídeo', level: 2 }], prospects: makeProspects(), boardObjective: 'Manter competitividade e desenvolver o elenco.', scoutingAssignments: ['NCAA – alas two-way'], }
}

type Legacy = { version: 1; teamAbbr: string; createdAt?: string; currentDate?: string; wins?: number; losses?: number; budget?: number; fanMood?: number; chemistry?: number; trainingFocus?: string; starters?: number[]; rotation?: Record<string, number> }
export function migrateLegacy(value: Legacy): CareerV2 | null {
  const team = teams.find((candidate) => candidate.abbr === value.teamAbbr); if (!team) return null
  const manager = { name: 'Manager Vale', origin: 'Brasil', experience: 'Carreira migrada', style: 'Equilibrado', avatar: 'manager-01.png', reputation: 50 }
  const next = makeCareer(team, manager)
  next.createdAt = value.createdAt ?? next.createdAt; next.currentDate = value.currentDate ?? next.currentDate; next.record = { wins: value.wins ?? 0, losses: value.losses ?? 0 }; next.budget = value.budget ?? next.budget; next.fanMood = value.fanMood ?? next.fanMood; next.chemistry = value.chemistry ?? next.chemistry; next.training.focus = value.trainingFocus ?? next.training.focus; next.savedFromV1 = true
  next.rotation = next.rotation.map((entry) => ({ ...entry, minutes: value.rotation?.[String(entry.playerId)] ?? entry.minutes, role: value.starters?.includes(entry.playerId) ? 'Starter' : entry.role }))
  next.standings[team.abbr].wins = next.record.wins; next.standings[team.abbr].losses = next.record.losses
  next.news.unshift({ id: 'migration', date: next.currentDate, category: 'team', title: 'Save v1 migrado com segurança', body: 'Registro, orçamento e rotação foram preservados. Estatísticas históricas sem box score permanecem indisponíveis.' })
  return next
}
export function loadCareer(): CareerV2 | null { try { const v2 = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); if (v2?.version === 2) return v2; const legacy = JSON.parse(localStorage.getItem(LEGACY_KEY) || 'null') as Legacy | null; if (legacy?.version === 1) { const migrated = migrateLegacy(legacy); if (migrated) { localStorage.setItem(SAVE_KEY, JSON.stringify(migrated)); return migrated } } } catch { /* storage unavailable or malformed */ } return null }
export const persistCareer = (career: CareerV2) => localStorage.setItem(SAVE_KEY, JSON.stringify(career))
