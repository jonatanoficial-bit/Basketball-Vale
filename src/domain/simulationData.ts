import type { LeagueEconomy, Player, PlayerModel, Prospect, SimContract, Team, TradeAsset, TradeProposal } from './types'

export const ENGINE_VERSION = '2.0.0-simulation'
export const RULESET_VERSION = 'VBM-SIM-2026.2'

const hash = (value: string | number) => {
  let output = 2166136261
  for (const char of String(value)) { output ^= char.charCodeAt(0); output = Math.imul(output, 16777619) }
  return output >>> 0
}
export const randomFromSeed = (seed: string | number) => {
  let state = hash(seed)
  return () => { state += 0x6D2B79F5; let value = state; value = Math.imul(value ^ value >>> 15, value | 1); value ^= value + Math.imul(value ^ value >>> 7, value | 61); return ((value ^ value >>> 14) >>> 0) / 4294967296 }
}
const clamp = (value: number, min = 25, max = 99) => Math.max(min, Math.min(max, Math.round(value)))

export function createPlayerModel(player: Player): PlayerModel {
  const random = randomFromSeed(`player-${player.id}`)
  const position = player.position.toUpperCase()
  const guard = /G/.test(position); const big = /C|F-C|C-F/.test(position); const base = player.overall
  const age = 19 + (hash(player.id) % 18)
  const phase: PlayerModel['phase'] = age < 25 ? 'development' : age < 30 ? 'prime' : age < 33 ? 'plateau' : 'regression'
  const archetype = guard ? (random() > .5 ? 'Criador de perímetro' : 'Pontuador dinâmico') : big ? (random() > .5 ? 'Protetor de aro' : 'Finalizador interior') : (random() > .5 ? 'Ala two-way' : 'Conector versátil')
  return { playerId: player.id, age, archetype, roles: [guard ? 'Ball Handler' : big ? 'Rim Protector' : 'Wing', base >= 84 ? 'Primary' : base >= 76 ? 'Rotation' : 'Depth'], hiddenPotential: clamp(base + (random() * 18 - 6)), offense: clamp(base + (random() * 8 - 4)), shooting: clamp(base + (guard ? 3 : -2) + (random() * 10 - 5)), finishing: clamp(base + (big ? 4 : 0) + (random() * 10 - 5)), playmaking: clamp(base + (guard ? 5 : -5) + (random() * 10 - 5)), defense: clamp(base + (big ? 2 : 0) + (random() * 12 - 6)), rebounding: clamp(base + (big ? 7 : guard ? -9 : 0) + (random() * 10 - 5)), athleticism: clamp(base + (random() * 10 - 5)), iq: clamp(base + (age - 25) * .7 + (random() * 8 - 4)), durability: clamp(72 + random() * 24), tendencies: { three: clamp(guard ? 68 + random() * 25 : 42 + random() * 42), rim: clamp(big ? 72 + random() * 22 : 43 + random() * 40), pass: clamp(guard ? 64 + random() * 28 : 35 + random() * 45), turnover: clamp(32 + random() * 40), foulDraw: clamp(35 + random() * 50) }, morale: 70, readiness: 92, personality: (['Líder','Competidor','Reservado','Mentor'] as const)[hash(`p-${player.id}`) % 4], phase }
}

export const createPlayerModels = (players: Player[]) => Object.fromEntries(players.map((player) => [player.id, createPlayerModel(player)]))
const salaryFor = (player: Player) => Math.round((1_400_000 + Math.pow(Math.max(0, player.overall - 58), 2.25) * 7_000) / 100_000) * 100_000
export function createEconomy(players: Player[], teams: Team[]): LeagueEconomy {
  const contracts: Record<number, SimContract> = {}
  for (const player of players) contracts[player.id] = { playerId: player.id, team: player.team, salary: salaryFor(player), years: 1 + hash(`years-${player.id}`) % 4, startSeason: '2026-27', option: hash(`option-${player.id}`) % 5 === 0 ? 'player' : hash(`option-${player.id}`) % 7 === 0 ? 'team' : undefined, status: player.team === 'FA' ? 'free-agent' : 'active', source: 'SIMULATION' }
  return { cap: 170_000_000, tax: 207_000_000, firstApron: 215_000_000, secondApron: 228_000_000, rulesVersion: RULESET_VERSION, contracts, capHolds: Object.fromEntries(teams.map((team) => [team.abbr, 0])), exceptions: Object.fromEntries(teams.map((team) => [team.abbr, 8_000_000])) }
}
export const payrollFor = (economy: LeagueEconomy, team: string) => Object.values(economy.contracts).filter((contract) => contract.team === team && contract.status === 'active').reduce((sum, contract) => sum + contract.salary, 0)

export function evaluateTrade(economy: LeagueEconomy, models: Record<number, PlayerModel>, assets: TradeAsset[], teams: string[]): TradeProposal {
  const reasons: string[] = []; const values: Record<string, number> = Object.fromEntries(teams.map((team) => [team, 0])); const salaries: Record<string, number> = Object.fromEntries(teams.map((team) => [team, 0]))
  for (const asset of assets) { if (asset.kind === 'player') { const id = Number(asset.id); const model = models[id]; const contract = economy.contracts[id]; values[asset.team] += (model?.hiddenPotential ?? 65) * 1_000_000 - (contract?.salary ?? 0) * .35; salaries[asset.team] += contract?.salary ?? 0 } else values[asset.team] += 18_000_000 }
  const spread = Math.max(...Object.values(values)) - Math.min(...Object.values(values)); if (spread > 24_000_000) reasons.push('Valor esportivo desequilibrado entre as equipes.')
  for (const team of teams) { const otherSalary = teams.filter((candidate) => candidate !== team).reduce((sum,candidate) => sum + salaries[candidate],0); const projected = payrollFor(economy,team) - salaries[team] + otherSalary; if (payrollFor(economy, team) > economy.secondApron && projected > payrollFor(economy,team)) reasons.push(`${team}: equipe acima do second apron não pode aumentar payroll.`); if (projected > economy.secondApron * 1.18) reasons.push(`${team}: payroll projetado excede a tolerância máxima do ruleset.`) }
  return { id: `trade-${Date.now()}`, teams, outgoing: assets, incoming: [...assets].reverse(), score: Math.max(0, 100 - Math.round(spread / 1_000_000)), valid: reasons.length === 0, reasons: reasons.length ? reasons : ['Salários e valor esportivo dentro da tolerância do ruleset.'] }
}

export function developModels(models: Record<number, PlayerModel>, season: number) {
  const next = structuredClone(models)
  Object.values(next).forEach((model) => { const random = randomFromSeed(`dev-${season}-${model.playerId}`); const ageEffect = model.phase === 'development' ? 1.8 : model.phase === 'prime' ? .3 : model.phase === 'plateau' ? -.5 : -1.2; const delta = Math.round(ageEffect + (random() * 4 - 2)); model.offense = clamp(model.offense + delta, 50, 99); model.defense = clamp(model.defense + delta, 50, 99); model.shooting = clamp(model.shooting + Math.round(delta * .6), 50, 99); model.finishing = clamp(model.finishing + Math.round(delta * .7), 50, 99); model.playmaking = clamp(model.playmaking + Math.round(delta * .5), 45, 99); model.age += 1; model.phase = model.age < 25 ? 'development' : model.age < 30 ? 'prime' : model.age < 33 ? 'plateau' : 'regression'; model.morale = clamp(model.morale + (random() * 10 - 5), 25, 99); model.readiness = clamp(88 + random() * 10, 50, 99) })
  return next
}

const firstNames = ['Mateo','Noah','Darius','Kenji','Ivo','Malik','Eli','Theo','Caio','Jamal','Luka','Nico']
const lastNames = ['Torres','Brooks','Sato','Martins','Okafor','Silva','Miller','Costa','Reed','Walker','Petrov','Diaz']
export function generateDraftClass(season: number, count = 60): Prospect[] {
  const random = randomFromSeed(`draft-class-${season}`)
  return Array.from({ length: count }, (_, index) => { const position = ['PG','SG','SF','PF','C'][index % 5]; const quality = 55 + Math.round(random() * 34); return { id: `dev-${season}-${index + 1}`, name: `${firstNames[Math.floor(random() * firstNames.length)]} ${lastNames[Math.floor(random() * lastNames.length)]}`, position, age: 18 + Math.floor(random() * 4), archetype: position === 'C' ? 'Protetor de aro' : position === 'PG' ? 'Criador' : random() > .5 ? 'Two-way' : 'Pontuador', projection: quality > 82 ? 'Loteria' : quality > 73 ? '1ª rodada' : '2ª rodada', scouting: 10 + Math.round(random() * 22), note: 'Prospecto fictício gerado pelo motor SIMULATION. Potencial real oculto.' } })
}
