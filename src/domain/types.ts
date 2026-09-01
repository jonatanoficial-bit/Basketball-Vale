export type Language = 'pt-BR' | 'en' | 'es'

export type Team = {
  id: number; abbr: string; name: string; city: string; nickname: string
  conference: 'East' | 'West' | string; division: string; primary: string; secondary: string
  logo: string; rosterSize: number
}

export type Player = {
  id: number; firstName: string; lastName: string; name: string; slug: string
  teamId: number; team: string; jersey: string; position: string; height: string; weight: string
  college: string; country: string; overall: number; headshot: string
}

export type StatLine = {
  gp: number; gs: number; min: number; pts: number; reb: number; ast: number; stl: number; blk: number
  tov: number; pf: number; fgm: number; fga: number; tpm: number; tpa: number; ftm: number; fta: number
}

export type RotationEntry = { playerId: number; minutes: number; role: 'Starter' | 'Rotation' | 'Reserve' }
export type Tactics = { pace: number; offense: string; defense: string; rebounding: string; focus: string }
export type ManagerProfile = { name: string; origin: string; experience: string; style: string; avatar: string; reputation: number }
export type Health = { fatigue: number; condition: number; injury?: string }

export type Fixture = {
  id: string; date: string; round: number; home: string; away: string; status: 'scheduled' | 'played'
  homeScore?: number; awayScore?: number; gameId?: string
}

export type GameEvent = {
  id: string; seq: number; period: number; clock: number; shotClock: number; team: string; playerId: number
  type: 'made2' | 'made3' | 'miss2' | 'miss3' | 'ft' | 'rebound' | 'turnover' | 'steal' | 'block' | 'foul' | 'timeout'
  text: string; homeScore: number; awayScore: number; x: number; y: number
}

export type GameResult = {
  id: string; fixtureId: string; home: string; away: string; homeScore: number; awayScore: number
  playedAt: string; events: GameEvent[]; box: Record<string, StatLine>; teamTotals: Record<string, StatLine>
}

export type TeamRecord = { team: string; wins: number; losses: number; pf: number; pa: number; streak: number }
export type NewsItem = { id: string; date: string; category: 'league' | 'team' | 'market' | 'board'; title: string; body: string }
export type TrainingPlan = { focus: string; sessions: string[]; load: number }
export type StaffAssignment = { role: string; name: string; impact: string; level: number }
export type Prospect = { id: string; name: string; position: string; age: number; archetype: string; projection: string; scouting: number; note: string }

export type CareerV2 = {
  version: 2; createdAt: string; currentDate: string; teamAbbr: string; language: Language; manager: ManagerProfile
  record: { wins: number; losses: number }; fanMood: number; chemistry: number; budget: number
  rotation: RotationEntry[]; tactics: Tactics; health: Record<number, Health>; playerStats: Record<number, StatLine>
  fixtures: Fixture[]; results: Record<string, GameResult>; standings: Record<string, TeamRecord>
  news: NewsItem[]; training: TrainingPlan; staff: StaffAssignment[]; prospects: Prospect[]; selectedProspectId?: string
  boardObjective: string; scoutingAssignments: string[]; savedFromV1?: boolean
}

export const blankStats = (): StatLine => ({ gp: 0, gs: 0, min: 0, pts: 0, reb: 0, ast: 0, stl: 0, blk: 0, tov: 0, pf: 0, fgm: 0, fga: 0, tpm: 0, tpa: 0, ftm: 0, fta: 0 })
export const addStats = (a: StatLine, b: StatLine): StatLine => Object.fromEntries(Object.keys(a).map((key) => [key, a[key as keyof StatLine] + b[key as keyof StatLine]])) as StatLine
export const pct = (made: number, attempts: number) => attempts ? `${((made / attempts) * 100).toFixed(1)}%` : '—'
