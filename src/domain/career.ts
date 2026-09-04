import rawPack from '../data/nba-license-pack.json';
import { baseStandings, createLeagueSchedule } from './league';
import {
  blankStats,
  type CareerV2,
  type Language,
  type Player,
  type RotationEntry,
  type Team,
} from './types';
import {
  createEconomy,
  createPlayerModels,
  ENGINE_VERSION,
  generateDraftClass,
} from './simulationData';
import { createEngagement } from './engagement';
import {
  careerModes,
  completeGoldMasterState,
  createCustomClub,
  createMetaChallenges,
} from './content';

const pack = rawPack as unknown as { teams: Team[]; players: Player[] };
export const teams = pack.teams;
export const players = pack.players;
export const SAVE_KEY = 'vale-basket-manager-career-v3';
export const FOUNDATION_KEY = 'vale-basket-manager-career-v2';
export const LEGACY_KEY = 'vale-basket-manager-career-v1';
export const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;
export const money = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
  }).format(value);
export const dateLabel = (date: string, language = 'pt-BR') =>
  new Intl.DateTimeFormat(language, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T12:00:00Z`));

const defaultRotation = (teamAbbr: string): RotationEntry[] =>
  players
    .filter((player) => player.team === teamAbbr)
    .sort((a, b) => b.overall - a.overall)
    .slice(0, 10)
    .map((player, index) => ({
      playerId: player.id,
      minutes: [34, 33, 31, 29, 27, 23, 20, 16, 15, 12][index],
      role: index < 5 ? 'Starter' : index < 9 ? 'Rotation' : 'Reserve',
    }));
export const makeProspects = (): CareerV2['prospects'] =>
  generateDraftClass(2027);
const makeWorld = (): CareerV2['world'] => ({
  owner: 'Vale Sports Group',
  ownerSatisfaction: 68,
  jobSecurity: 74,
  marketSize: 'Grande',
  arena: { name: 'Vale Arena', level: 3, capacity: 18800, condition: 88 },
  ticketPrice: 92,
  seasonTickets: 12600,
  premiumSeats: 740,
  marketing: 55,
  sponsorship: 18_000_000,
  merchandise: 12_500_000,
  valuation: 2_450_000_000,
  ledger: [
    {
      id: 'opening-sponsor',
      date: '2026-10-20',
      label: 'Patrocínio anual SIMULATION',
      amount: 18_000_000,
      kind: 'receita',
    },
    {
      id: 'opening-arena',
      date: '2026-10-20',
      label: 'Operação da arena SIMULATION',
      amount: -7_400_000,
      kind: 'despesa',
    },
  ],
  accessibility: {
    reducedMotion: false,
    highContrast: false,
    screenReaderHints: true,
    largeText: false,
    colorBlindMode: false,
  },
});

export function makeCareer(
  team: Team,
  manager: CareerV2['manager'],
  language: Language = 'pt-BR',
  careerMode: CareerV2['careerMode'] = 'dynasty',
): CareerV2 {
  return {
    version: 3,
    schemaVersion: 3,
    engineVersion: ENGINE_VERSION,
    createdAt: new Date().toISOString(),
    currentDate: '2026-10-20',
    teamAbbr: team.abbr,
    language,
    manager,
    record: { wins: 0, losses: 0 },
    fanMood: 66,
    chemistry: 62,
    budget: 18_500_000,
    rotation: defaultRotation(team.abbr),
    tactics: {
      pace: 55,
      offense: 'Equilibrado',
      defense: 'Trocas seletivas',
      rebounding: 'Proteção de aro',
      focus: 'Ataque ao aro',
    },
    health: Object.fromEntries(
      players
        .filter((player) => player.team === team.abbr)
        .map((player) => [player.id, { fatigue: 18, condition: 92 }]),
    ),
    playerStats: Object.fromEntries(
      players.map((player) => [player.id, blankStats()]),
    ),
    fixtures: createLeagueSchedule(teams),
    results: {},
    standings: baseStandings(teams),
    news: [
      {
        id: 'welcome',
        date: '2026-10-20',
        category: 'team',
        title: `Nova gestão em ${team.name}`,
        body: 'A pré-temporada começa com o plano de jogo e a rotação sob seu comando.',
      },
    ],
    training: {
      focus: 'Equilíbrio',
      sessions: ['Técnica individual', 'Defesa coletiva', 'Recuperação'],
      load: 55,
    },
    staff: [
      {
        role: 'Assistente principal',
        name: 'Avery Collins',
        impact: 'Desenvolvimento tático',
        level: 3,
      },
      {
        role: 'Preparadora física',
        name: 'Renata Mello',
        impact: 'Condição e recuperação',
        level: 3,
      },
      {
        role: 'Analista',
        name: 'Jordan Park',
        impact: 'Scouting e vídeo',
        level: 2,
      },
    ],
    prospects: makeProspects(),
    boardObjective: careerModes[careerMode].objective,
    scoutingAssignments: ['NCAA – alas two-way'],
    playerModels: createPlayerModels(players),
    economy: createEconomy(players, teams),
    tradeDesk: [],
    playoffs: [],
    seasonArchives: [],
    seasonNumber: 1,
    simulationLog: [
      `${new Date().toISOString()}: save v3 criado com ${ENGINE_VERSION}.`,
    ],
    generatedPlayers: [],
    retiredPlayerIds: [],
    draftHistory: [],
    engagement: createEngagement(team.abbr, teams),
    world: makeWorld(),
    careerMode,
    customClub: createCustomClub(team),
    achievements: [],
    careerRecords: {
      gamesManaged: 0,
      regularSeasonWins: 0,
      playoffSeriesWins: 0,
      championships: 0,
      bestSeasonWins: 0,
      bestWinStreak: 0,
      signings: 0,
      trades: 0,
      draftPicks: 0,
    },
    metaChallenges: createMetaChallenges(),
    historicalEvents: [],
    goldMaster: {
      localAccount: null,
      telemetryConsent: false,
      tutorialComplete: false,
    },
  };
}

type Legacy = {
  version: 1;
  teamAbbr: string;
  createdAt?: string;
  currentDate?: string;
  wins?: number;
  losses?: number;
  budget?: number;
  fanMood?: number;
  chemistry?: number;
  trainingFocus?: string;
  starters?: number[];
  rotation?: Record<string, number>;
};
export function migrateLegacy(value: Legacy): CareerV2 | null {
  const team = teams.find((candidate) => candidate.abbr === value.teamAbbr);
  if (!team) return null;
  const manager = {
    name: 'Manager Vale',
    origin: 'Brasil',
    experience: 'Carreira migrada',
    style: 'Equilibrado',
    avatar: 'manager-01.png',
    reputation: 50,
  };
  const next = makeCareer(team, manager);
  next.createdAt = value.createdAt ?? next.createdAt;
  next.currentDate = value.currentDate ?? next.currentDate;
  next.record = { wins: value.wins ?? 0, losses: value.losses ?? 0 };
  next.budget = value.budget ?? next.budget;
  next.fanMood = value.fanMood ?? next.fanMood;
  next.chemistry = value.chemistry ?? next.chemistry;
  next.training.focus = value.trainingFocus ?? next.training.focus;
  next.savedFromV1 = true;
  next.rotation = next.rotation.map((entry) => ({
    ...entry,
    minutes: value.rotation?.[String(entry.playerId)] ?? entry.minutes,
    role: value.starters?.includes(entry.playerId) ? 'Starter' : entry.role,
  }));
  next.standings[team.abbr].wins = next.record.wins;
  next.standings[team.abbr].losses = next.record.losses;
  next.news.unshift({
    id: 'migration',
    date: next.currentDate,
    category: 'team',
    title: 'Save v1 migrado com segurança',
    body: 'Registro, orçamento e rotação foram preservados. Estatísticas históricas sem box score permanecem indisponíveis.',
  });
  return next;
}
function migrateFoundation(value: Record<string, unknown>): CareerV2 | null {
  const teamAbbr = String(value.teamAbbr ?? '');
  const team = teams.find((candidate) => candidate.abbr === teamAbbr);
  if (!team) return null;
  const base = makeCareer(
    team,
    (value.manager as CareerV2['manager']) ?? {
      name: 'Manager Vale',
      origin: 'Brasil',
      experience: 'Carreira Foundation',
      style: 'Equilibrado',
      avatar: 'manager-01.png',
      reputation: 50,
    },
    (value.language as Language) ?? 'pt-BR',
  );
  const migrated = {
    ...base,
    ...value,
    version: 3 as const,
    schemaVersion: 3 as const,
    engineVersion: ENGINE_VERSION,
    playerModels: createPlayerModels(players),
    economy: createEconomy(players, teams),
    tradeDesk: [],
    playoffs: [],
    seasonArchives: [],
    seasonNumber: 1,
    simulationLog: [
      `${new Date().toISOString()}: save Foundation v2 migrado para Simulation v3.`,
    ],
    generatedPlayers: [],
    retiredPlayerIds: [],
    draftHistory: [],
    engagement: createEngagement(team.abbr, teams),
  } as CareerV2;
  return migrated;
}
function completeV3(value: CareerV2): CareerV2 {
  const completed = {
    ...value,
    generatedPlayers: value.generatedPlayers ?? [],
    retiredPlayerIds: value.retiredPlayerIds ?? [],
    draftHistory: value.draftHistory ?? [],
    engagement:
      value.engagement ??
      createEngagement(
        value.teamAbbr,
        teams,
        value.seasonNumber ?? 1,
        value.record?.wins ?? 0,
        (value.record?.wins ?? 0) + (value.record?.losses ?? 0),
      ),
    world: {
      ...(value.world ?? makeWorld()),
      accessibility: {
        ...makeWorld().accessibility,
        ...(value.world?.accessibility ?? {}),
      },
    },
  };
  return completeGoldMasterState(completed, teams.find((team) => team.abbr === value.teamAbbr)!);
}
export function loadCareer(): CareerV2 | null {
  try {
    const v3 = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
    if (v3?.version === 3) return completeV3(v3);
    const foundation = JSON.parse(
      localStorage.getItem(FOUNDATION_KEY) || 'null',
    );
    if (foundation?.version === 2) {
      const migrated = migrateFoundation(foundation);
      if (migrated) {
        localStorage.setItem(SAVE_KEY, JSON.stringify(migrated));
        return migrated;
      }
    }
    const legacy = JSON.parse(
      localStorage.getItem(LEGACY_KEY) || 'null',
    ) as Legacy | null;
    if (legacy?.version === 1) {
      const migrated = migrateLegacy(legacy);
      if (migrated) {
        localStorage.setItem(SAVE_KEY, JSON.stringify(migrated));
        return migrated;
      }
    }
  } catch {
    /* storage unavailable or malformed */
  }
  return null;
}
export const persistCareer = (career: CareerV2) =>
  localStorage.setItem(SAVE_KEY, JSON.stringify(career));
