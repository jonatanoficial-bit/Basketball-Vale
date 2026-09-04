export type Language = 'pt-BR' | 'en' | 'es';

export type Team = {
  id: number;
  abbr: string;
  name: string;
  city: string;
  nickname: string;
  conference: 'East' | 'West' | string;
  division: string;
  primary: string;
  secondary: string;
  logo: string;
  rosterSize: number;
};

export type Player = {
  id: number;
  firstName: string;
  lastName: string;
  name: string;
  slug: string;
  teamId: number;
  team: string;
  jersey: string;
  position: string;
  height: string;
  weight: string;
  college: string;
  country: string;
  overall: number;
  headshot: string;
};

export type StatLine = {
  gp: number;
  gs: number;
  min: number;
  pts: number;
  reb: number;
  ast: number;
  stl: number;
  blk: number;
  tov: number;
  pf: number;
  fgm: number;
  fga: number;
  tpm: number;
  tpa: number;
  ftm: number;
  fta: number;
};

export type RotationEntry = {
  playerId: number;
  minutes: number;
  role: 'Starter' | 'Rotation' | 'Reserve';
};
export type Tactics = {
  pace: number;
  offense: string;
  defense: string;
  rebounding: string;
  focus: string;
};
export type ManagerProfile = {
  name: string;
  origin: string;
  experience: string;
  style: string;
  avatar: string;
  reputation: number;
};
export type Health = { fatigue: number; condition: number; injury?: string };

export type Fixture = {
  id: string;
  date: string;
  round: number;
  home: string;
  away: string;
  status: 'scheduled' | 'played';
  homeScore?: number;
  awayScore?: number;
  gameId?: string;
};

export type GameEvent = {
  id: string;
  seq: number;
  period: number;
  clock: number;
  shotClock: number;
  team: string;
  playerId: number;
  type:
    | 'made2'
    | 'made3'
    | 'miss2'
    | 'miss3'
    | 'ft'
    | 'rebound'
    | 'turnover'
    | 'steal'
    | 'block'
    | 'foul'
    | 'timeout'
    | 'substitution'
    | 'injury'
    | 'period';
  text: string;
  homeScore: number;
  awayScore: number;
  x: number;
  y: number;
};

export type GameResult = {
  id: string;
  fixtureId: string;
  home: string;
  away: string;
  homeScore: number;
  awayScore: number;
  playedAt: string;
  events: GameEvent[];
  box: Record<string, StatLine>;
  teamTotals: Record<string, StatLine>;
  seed?: string;
  engineVersion?: string;
  overtime?: number;
  advanced?: Record<string, AdvancedTeamStats>;
  lineups?: LineupStat[];
  shotChart?: ShotChartPoint[];
  injuries?: { playerId: number; diagnosis: string; recoveryGames: number }[];
  checksum?: string;
};

export type TeamRecord = {
  team: string;
  wins: number;
  losses: number;
  pf: number;
  pa: number;
  streak: number;
};
export type NewsItem = {
  id: string;
  date: string;
  category: 'league' | 'team' | 'market' | 'board';
  title: string;
  body: string;
};
export type TrainingPlan = { focus: string; sessions: string[]; load: number };
export type StaffAssignment = {
  role: string;
  name: string;
  impact: string;
  level: number;
};
export type Prospect = {
  id: string;
  name: string;
  position: string;
  age: number;
  archetype: string;
  projection: string;
  scouting: number;
  note: string;
};

export type PlayerModel = {
  playerId: number;
  age: number;
  archetype: string;
  roles: string[];
  hiddenPotential: number;
  offense: number;
  shooting: number;
  finishing: number;
  playmaking: number;
  defense: number;
  rebounding: number;
  athleticism: number;
  iq: number;
  durability: number;
  tendencies: {
    three: number;
    rim: number;
    pass: number;
    turnover: number;
    foulDraw: number;
  };
  morale: number;
  readiness: number;
  personality: 'Líder' | 'Competidor' | 'Reservado' | 'Mentor';
  phase: 'development' | 'prime' | 'plateau' | 'regression';
};

export type SimContract = {
  playerId: number;
  team: string;
  salary: number;
  years: number;
  startSeason: string;
  option?: 'team' | 'player';
  status: 'active' | 'free-agent' | 'waived';
  source: 'SIMULATION';
};

export type LeagueEconomy = {
  cap: number;
  tax: number;
  firstApron: number;
  secondApron: number;
  rulesVersion: string;
  contracts: Record<number, SimContract>;
  capHolds: Record<string, number>;
  exceptions: Record<string, number>;
};

export type AdvancedTeamStats = {
  possessions: number;
  offensiveRating: number;
  defensiveRating: number;
  pace: number;
  effectiveFg: number;
  trueShooting: number;
  turnoverRate: number;
  offensiveReboundRate: number;
  freeThrowRate: number;
};
export type LineupStat = {
  team: string;
  playerIds: number[];
  minutes: number;
  pointsFor: number;
  pointsAgainst: number;
  netRating: number;
};
export type ShotChartPoint = {
  team: string;
  playerId: number;
  x: number;
  y: number;
  made: boolean;
  value: 2 | 3;
  period: number;
};
export type TradeAsset = { kind: 'player' | 'pick'; id: string; team: string };
export type TradeProposal = {
  id: string;
  teams: string[];
  outgoing: TradeAsset[];
  incoming: TradeAsset[];
  score: number;
  valid: boolean;
  reasons: string[];
};
export type PlayoffSeries = {
  id: string;
  conference: string;
  round: number;
  higherSeed: string;
  lowerSeed: string;
  higherWins: number;
  lowerWins: number;
  winner?: string;
};
export type SeasonArchive = {
  season: string;
  champion?: string;
  standings: TeamRecord[];
  awards: Record<string, string>;
  draftClassId?: string;
};
export type DraftHistoryEntry = {
  season: number;
  pick: number;
  team: string;
  playerId: number;
  name: string;
  position: string;
};
export type ManagerDecisionChoice = {
  id: string;
  label: string;
  consequence: string;
  fanMood: number;
  chemistry: number;
  budget: number;
  reputation: number;
};
export type ManagerDecision = {
  id: string;
  title: string;
  body: string;
  deadline: string;
  category: 'media' | 'team' | 'board';
  choices: ManagerDecisionChoice[];
};
export type WeeklyObjective = {
  id: string;
  title: string;
  description: string;
  targetWins: number;
  targetGames: number;
  baseWins: number;
  baseGames: number;
  rewardBudget: number;
  rewardReputation: number;
  claimed: boolean;
};
export type EngagementState = {
  pendingDecisions: ManagerDecision[];
  resolvedDecisionIds: string[];
  inboxRead: string[];
  rivalryTeam: string;
  rivalryHeat: number;
  storyChapter: number;
  weeklyObjective: WeeklyObjective;
};
export type FranchiseWorld = {
  owner: string;
  ownerSatisfaction: number;
  jobSecurity: number;
  marketSize: 'Pequeno' | 'Médio' | 'Grande';
  arena: { name: string; level: number; capacity: number; condition: number };
  ticketPrice: number;
  seasonTickets: number;
  premiumSeats: number;
  marketing: number;
  sponsorship: number;
  merchandise: number;
  valuation: number;
  ledger: {
    id: string;
    date: string;
    label: string;
    amount: number;
    kind: 'receita' | 'despesa';
  }[];
  accessibility: {
    reducedMotion: boolean;
    highContrast: boolean;
    screenReaderHints: boolean;
  };
};

export type CareerV2 = {
  version: 3;
  schemaVersion: 3;
  engineVersion: string;
  createdAt: string;
  currentDate: string;
  teamAbbr: string;
  language: Language;
  manager: ManagerProfile;
  record: { wins: number; losses: number };
  fanMood: number;
  chemistry: number;
  budget: number;
  rotation: RotationEntry[];
  tactics: Tactics;
  health: Record<number, Health>;
  playerStats: Record<number, StatLine>;
  fixtures: Fixture[];
  results: Record<string, GameResult>;
  standings: Record<string, TeamRecord>;
  news: NewsItem[];
  training: TrainingPlan;
  staff: StaffAssignment[];
  prospects: Prospect[];
  selectedProspectId?: string;
  boardObjective: string;
  scoutingAssignments: string[];
  savedFromV1?: boolean;
  playerModels: Record<number, PlayerModel>;
  economy: LeagueEconomy;
  tradeDesk: TradeProposal[];
  playoffs: PlayoffSeries[];
  seasonArchives: SeasonArchive[];
  seasonNumber: number;
  simulationLog: string[];
  generatedPlayers: Player[];
  retiredPlayerIds: number[];
  draftHistory: DraftHistoryEntry[];
  engagement: EngagementState;
  world: FranchiseWorld;
};

export const blankStats = (): StatLine => ({
  gp: 0,
  gs: 0,
  min: 0,
  pts: 0,
  reb: 0,
  ast: 0,
  stl: 0,
  blk: 0,
  tov: 0,
  pf: 0,
  fgm: 0,
  fga: 0,
  tpm: 0,
  tpa: 0,
  ftm: 0,
  fta: 0,
});
export const addStats = (a: StatLine, b: StatLine): StatLine =>
  Object.fromEntries(
    Object.keys(a).map((key) => [
      key,
      a[key as keyof StatLine] + b[key as keyof StatLine],
    ]),
  ) as StatLine;
export const pct = (made: number, attempts: number) =>
  attempts ? `${((made / attempts) * 100).toFixed(1)}%` : '—';
