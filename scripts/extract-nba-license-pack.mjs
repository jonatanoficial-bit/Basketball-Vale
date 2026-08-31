import fs from 'node:fs'
import path from 'node:path'

const projectRoot = path.resolve(import.meta.dirname, '..')
const htmlPath = path.resolve(projectRoot, '..', 'nba-players.html')
const html = fs.readFileSync(htmlPath, 'utf8')
const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/)

if (!match) throw new Error('NBA __NEXT_DATA__ payload not found')

const payload = JSON.parse(match[1])
const sourcePlayers = payload.props.pageProps.players

const teamMeta = {
  ATL: ['Atlanta Hawks', 'Atlanta', 'Hawks', 'Eastern', 'Southeast', '#E03A3E', '#C1D32F'],
  BOS: ['Boston Celtics', 'Boston', 'Celtics', 'Eastern', 'Atlantic', '#007A33', '#BA9653'],
  BKN: ['Brooklyn Nets', 'Brooklyn', 'Nets', 'Eastern', 'Atlantic', '#000000', '#FFFFFF'],
  CHA: ['Charlotte Hornets', 'Charlotte', 'Hornets', 'Eastern', 'Southeast', '#1D1160', '#00788C'],
  CHI: ['Chicago Bulls', 'Chicago', 'Bulls', 'Eastern', 'Central', '#CE1141', '#000000'],
  CLE: ['Cleveland Cavaliers', 'Cleveland', 'Cavaliers', 'Eastern', 'Central', '#860038', '#FDBB30'],
  DAL: ['Dallas Mavericks', 'Dallas', 'Mavericks', 'Western', 'Southwest', '#00538C', '#B8C4CA'],
  DEN: ['Denver Nuggets', 'Denver', 'Nuggets', 'Western', 'Northwest', '#0E2240', '#FEC524'],
  DET: ['Detroit Pistons', 'Detroit', 'Pistons', 'Eastern', 'Central', '#C8102E', '#1D42BA'],
  GSW: ['Golden State Warriors', 'San Francisco', 'Warriors', 'Western', 'Pacific', '#1D428A', '#FFC72C'],
  HOU: ['Houston Rockets', 'Houston', 'Rockets', 'Western', 'Southwest', '#CE1141', '#000000'],
  IND: ['Indiana Pacers', 'Indianapolis', 'Pacers', 'Eastern', 'Central', '#002D62', '#FDBB30'],
  LAC: ['LA Clippers', 'Los Angeles', 'Clippers', 'Western', 'Pacific', '#C8102E', '#1D428A'],
  LAL: ['Los Angeles Lakers', 'Los Angeles', 'Lakers', 'Western', 'Pacific', '#552583', '#FDB927'],
  MEM: ['Memphis Grizzlies', 'Memphis', 'Grizzlies', 'Western', 'Southwest', '#5D76A9', '#12173F'],
  MIA: ['Miami Heat', 'Miami', 'Heat', 'Eastern', 'Southeast', '#98002E', '#F9A01B'],
  MIL: ['Milwaukee Bucks', 'Milwaukee', 'Bucks', 'Eastern', 'Central', '#00471B', '#EEE1C6'],
  MIN: ['Minnesota Timberwolves', 'Minneapolis', 'Timberwolves', 'Western', 'Northwest', '#0C2340', '#78BE20'],
  NOP: ['New Orleans Pelicans', 'New Orleans', 'Pelicans', 'Western', 'Southwest', '#0C2340', '#C8102E'],
  NYK: ['New York Knicks', 'New York', 'Knicks', 'Eastern', 'Atlantic', '#006BB6', '#F58426'],
  OKC: ['Oklahoma City Thunder', 'Oklahoma City', 'Thunder', 'Western', 'Northwest', '#007AC1', '#EF3B24'],
  ORL: ['Orlando Magic', 'Orlando', 'Magic', 'Eastern', 'Southeast', '#0077C0', '#C4CED4'],
  PHI: ['Philadelphia 76ers', 'Philadelphia', '76ers', 'Eastern', 'Atlantic', '#006BB6', '#ED174C'],
  PHX: ['Phoenix Suns', 'Phoenix', 'Suns', 'Western', 'Pacific', '#1D1160', '#E56020'],
  POR: ['Portland Trail Blazers', 'Portland', 'Trail Blazers', 'Western', 'Northwest', '#E03A3E', '#000000'],
  SAC: ['Sacramento Kings', 'Sacramento', 'Kings', 'Western', 'Pacific', '#5A2D81', '#63727A'],
  SAS: ['San Antonio Spurs', 'San Antonio', 'Spurs', 'Western', 'Southwest', '#C4CED4', '#000000'],
  TOR: ['Toronto Raptors', 'Toronto', 'Raptors', 'Eastern', 'Atlantic', '#CE1141', '#000000'],
  UTA: ['Utah Jazz', 'Salt Lake City', 'Jazz', 'Western', 'Northwest', '#2A2A2A', '#FFF21F'],
  WAS: ['Washington Wizards', 'Washington', 'Wizards', 'Eastern', 'Southeast', '#002B5C', '#E31837'],
}

const starOverrides = {
  'nikola-jokic': 97, 'luka-doncic': 96, 'shai-gilgeous-alexander': 96,
  'giannis-antetokounmpo': 96, 'victor-wembanyama': 95, 'jayson-tatum': 94,
  'anthony-edwards': 94, 'devin-booker': 93, 'donovan-mitchell': 93,
  'stephen-curry': 92, 'cade-cunningham': 92, 'jalen-brunson': 92,
  'paolo-banchero': 91, 'tyrese-haliburton': 91, 'tyrese-maxey': 91,
  'bam-adebayo': 90, 'chet-holmgren': 90, 'scottie-barnes': 90,
  'trae-young': 90, 'ja-morant': 90, 'jalen-williams': 90,
  'kevin-durant': 90, 'jaylen-brown': 90, 'domantas-sabonis': 89,
  'kawhi-leonard': 89, 'zion-williamson': 89, 'amen-thompson': 89,
  'cooper-flagg': 89, 'lebron-james': 88, 'lamelo-ball': 88,
}

function hash(text) {
  let value = 2166136261
  for (const char of text) value = Math.imul(value ^ char.charCodeAt(0), 16777619)
  return Math.abs(value)
}

function derivedOverall(player) {
  const slug = player.PLAYER_SLUG
  if (starOverrides[slug]) return starOverrides[slug]
  const experience = Math.max(0, 2026 - Number(player.FROM_YEAR || 2026))
  const draftBoost = player.DRAFT_ROUND === 1 ? 5 : player.DRAFT_ROUND === 2 ? 2 : 0
  return Math.min(87, 67 + (hash(slug) % 10) + Math.min(experience, 8) + draftBoost)
}

const players = sourcePlayers.map((player) => ({
  id: player.PERSON_ID,
  firstName: player.PLAYER_FIRST_NAME,
  lastName: player.PLAYER_LAST_NAME,
  name: `${player.PLAYER_FIRST_NAME} ${player.PLAYER_LAST_NAME}`,
  slug: player.PLAYER_SLUG,
  teamId: player.TEAM_ID,
  team: player.TEAM_ABBREVIATION || 'FA',
  jersey: player.JERSEY_NUMBER || '—',
  position: player.POSITION || 'G/F',
  height: player.HEIGHT || '—',
  weight: player.WEIGHT ? `${player.WEIGHT} lb` : '—',
  college: player.COLLEGE || '—',
  country: player.COUNTRY || '—',
  draftYear: player.DRAFT_YEAR || null,
  draftRound: player.DRAFT_ROUND || null,
  draftPick: player.DRAFT_NUMBER || null,
  overall: derivedOverall(player),
  headshot: `assets/nba/players/${player.PERSON_ID}.png`,
}))

const teamIdByAbbr = Object.fromEntries(players.map((player) => [player.team, player.teamId]))
const teams = Object.entries(teamMeta).map(([abbr, meta]) => ({
  id: teamIdByAbbr[abbr],
  abbr,
  name: meta[0],
  city: meta[1],
  nickname: meta[2],
  conference: meta[3],
  division: meta[4],
  primary: meta[5],
  secondary: meta[6],
  logo: `assets/nba/teams/${abbr}.svg`,
  rosterSize: players.filter((player) => player.team === abbr).length,
}))

const licensePack = {
  schemaVersion: 1,
  season: '2026-27',
  retrievedAt: '2026-08-31',
  source: 'NBA.com League Roster / official NBA CDN',
  sourceUrl: 'https://www.nba.com/players',
  rightsMode: 'user-authorized-official-assets',
  playerCount: players.length,
  teamCount: teams.length,
  teams,
  players,
}

const outDir = path.join(projectRoot, 'src', 'data')
fs.mkdirSync(outDir, { recursive: true })
fs.writeFileSync(path.join(outDir, 'nba-license-pack.json'), JSON.stringify(licensePack, null, 2))
console.log(`Wrote ${teams.length} teams and ${players.length} players`)
