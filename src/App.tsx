import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Check,
  ChevronRight,
  CircleDollarSign,
  Dumbbell,
  Gamepad2,
  Info,
  LayoutDashboard,
  Menu,
  Minus,
  Play,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Trophy,
  UsersRound,
  X,
} from 'lucide-react'
import rawPack from './data/nba-license-pack.json'

type Team = {
  id: number
  abbr: string
  name: string
  city: string
  nickname: string
  conference: string
  division: string
  primary: string
  secondary: string
  logo: string
  rosterSize: number
}

type Player = {
  id: number
  firstName: string
  lastName: string
  name: string
  slug: string
  teamId: number
  team: string
  jersey: string
  position: string
  height: string
  weight: string
  college: string
  country: string
  overall: number
  headshot: string
}

type Game = {
  id: string
  date: string
  opponent: string
  home: boolean
  played: boolean
  teamScore?: number
  opponentScore?: number
}

type Career = {
  version: 1
  teamAbbr: string
  createdAt: string
  currentDate: string
  wins: number
  losses: number
  budget: number
  fanMood: number
  chemistry: number
  trainingFocus: string
  starters: number[]
  rotation: Record<string, number>
  schedule: Game[]
}

type Tab = 'overview' | 'roster' | 'schedule' | 'training' | 'office' | 'license'
type Screen = 'landing' | 'select' | 'create' | 'career'

const pack = rawPack as unknown as {
  season: string
  retrievedAt: string
  source: string
  sourceUrl: string
  rightsMode: string
  playerCount: number
  teamCount: number
  teams: Team[]
  players: Player[]
}

const BASE = import.meta.env.BASE_URL
const SAVE_KEY = 'vale-basket-manager-career-v1'
const asset = (path: string) => `${BASE}${path}`
const formatMoney = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'USD', notation: 'compact' }).format(value)
const formatDate = (value: string) => new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T12:00:00Z`))

function getSavedCareer(): Career | null {
  try {
    const parsed = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null')
    return parsed?.version === 1 ? parsed : null
  } catch {
    return null
  }
}

function createSchedule(teamAbbr: string): Game[] {
  const rivals = pack.teams.filter((team) => team.abbr !== teamAbbr)
  const start = new Date('2026-10-02T12:00:00Z')
  return Array.from({ length: 24 }, (_, index) => {
    const date = new Date(start)
    date.setUTCDate(start.getUTCDate() + index * 3 + (index % 4 === 0 ? 1 : 0))
    return {
      id: `${teamAbbr}-${index + 1}`,
      date: date.toISOString().slice(0, 10),
      opponent: rivals[(index * 7 + teamAbbr.charCodeAt(0)) % rivals.length].abbr,
      home: index % 2 === 0,
      played: false,
    }
  })
}

function makeCareer(team: Team): Career {
  const roster = pack.players.filter((player) => player.team === team.abbr).sort((a, b) => b.overall - a.overall)
  const rotation: Record<string, number> = {}
  const minutes = [34, 34, 32, 30, 28, 22, 20, 16, 14, 10]
  roster.forEach((player, index) => { rotation[player.id] = minutes[index] || 0 })
  return {
    version: 1,
    teamAbbr: team.abbr,
    createdAt: new Date().toISOString(),
    currentDate: '2026-10-01',
    wins: 0,
    losses: 0,
    budget: 118_000_000,
    fanMood: 72,
    chemistry: 68,
    trainingFocus: 'Equilíbrio',
    starters: roster.slice(0, 5).map((player) => player.id),
    rotation,
    schedule: createSchedule(team.abbr),
  }
}

function App() {
  const [saved, setSaved] = useState<Career | null>(() => getSavedCareer())
  const [career, setCareer] = useState<Career | null>(() => getSavedCareer())
  const [screen, setScreen] = useState<Screen>('landing')
  const [tab, setTab] = useState<Tab>('overview')
  const [toast, setToast] = useState('')

  useEffect(() => {
    if (!career) return
    localStorage.setItem(SAVE_KEY, JSON.stringify(career))
    setSaved(career)
  }, [career])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 3600)
    return () => window.clearTimeout(timer)
  }, [toast])

  const startCareer = (team: Team) => {
    const next = makeCareer(team)
    setCareer(next)
    setTab('overview')
    setScreen('career')
    setToast(`Contrato assinado com ${team.name}. A temporada começou.`)
  }

  const continueCareer = () => {
    if (!saved) return
    setCareer(saved)
    setTab('overview')
    setScreen('career')
  }

  if (screen === 'landing') {
    return <Landing saved={saved} onNew={() => setScreen('select')} onContinue={continueCareer} onCreate={() => setScreen('create')} />
  }

  if (screen === 'select') {
    return <TeamSelect onBack={() => setScreen('landing')} onPick={startCareer} onCreate={() => setScreen('create')} />
  }

  if (screen === 'create') {
    return <CreateClub onBack={() => setScreen('landing')} onSaved={(message) => setToast(message)} />
  }

  if (!career) return null

  return (
    <CareerShell
      career={career}
      setCareer={setCareer}
      tab={tab}
      setTab={setTab}
      onExit={() => setScreen('landing')}
      notify={setToast}
    >
      {toast && <div className="toast"><Check size={18} />{toast}</div>}
    </CareerShell>
  )
}

function Landing({ saved, onNew, onContinue, onCreate }: { saved: Career | null; onNew: () => void; onContinue: () => void; onCreate: () => void }) {
  const savedTeam = saved ? pack.teams.find((team) => team.abbr === saved.teamAbbr) : null
  return (
    <main className="landing page-bg" style={{ '--bg': `url("${asset('assets/backgrounds/home-arena.png')}")` } as React.CSSProperties}>
      <header className="public-header">
        <Brand />
        <div className="season-pill">NBA 2026–27 • FOUNDATION</div>
      </header>
      <section className="hero-copy">
        <p className="eyebrow">DREAM · DRAFT · BUILD · WIN</p>
        <h1>O jogo começa<br /><span>fora da quadra.</span></h1>
        <p className="hero-lead">Assuma o comando de uma franquia, organize seu elenco oficial e conduza cada decisão da temporada.</p>
        <div className="hero-actions">
          <button className="primary-button" onClick={onNew}><Play size={18} fill="currentColor" /> Nova carreira</button>
          <button className="ghost-button" onClick={onContinue} disabled={!saved}>{savedTeam ? <><img src={asset(savedTeam.logo)} alt="" />Continuar com {savedTeam.abbr}</> : 'Nenhum save encontrado'}</button>
        </div>
        <button className="text-button" onClick={onCreate}><Sparkles size={16} /> Laboratório Criar Clube</button>
      </section>
      <section className="landing-status glass-panel">
        <div><strong>30</strong><span>franquias oficiais</span></div>
        <div><strong>{pack.playerCount}</strong><span>atletas com retrato</span></div>
        <div><strong>100%</strong><span>jogável no navegador</span></div>
      </section>
      <footer className="landing-footer">Parte 1/3 · Base jogável · Dados salvos no navegador</footer>
    </main>
  )
}

function TeamSelect({ onBack, onPick, onCreate }: { onBack: () => void; onPick: (team: Team) => void; onCreate: () => void }) {
  const [query, setQuery] = useState('')
  const [conference, setConference] = useState('Todos')
  const [selected, setSelected] = useState<Team | null>(null)
  const teams = pack.teams.filter((team) => {
    const matches = `${team.name} ${team.abbr} ${team.city}`.toLowerCase().includes(query.toLowerCase())
    return matches && (conference === 'Todos' || team.conference === conference)
  })
  return (
    <main className="selection page-bg" style={{ '--bg': `url("${asset('assets/backgrounds/franchise-campus.png')}")` } as React.CSSProperties}>
      <header className="public-header"><button className="icon-button" onClick={onBack} aria-label="Voltar"><ArrowLeft /></button><Brand compact /><div className="season-pill">ESCOLHA SUA FRANQUIA</div></header>
      <section className="selection-head">
        <div><p className="eyebrow">CARREIRA 2026–27</p><h1>Qual história você vai construir?</h1><p>Todos os 30 times usam seus nomes, escudos e elencos oficiais do pacote de 31/08/2026.</p></div>
        <div className="filters"><label className="search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar time" /></label><div className="segmented">{['Todos', 'Eastern', 'Western'].map((value) => <button key={value} className={conference === value ? 'active' : ''} onClick={() => setConference(value)}>{value === 'Todos' ? 'Todos' : value === 'Eastern' ? 'Leste' : 'Oeste'}</button>)}</div></div>
      </section>
      <section className="team-grid">
        {teams.map((team) => (
          <button key={team.abbr} className={`team-card ${selected?.abbr === team.abbr ? 'selected' : ''}`} onClick={() => setSelected(team)} style={{ '--team': team.primary, '--team2': team.secondary } as React.CSSProperties}>
            <img src={asset(team.logo)} alt={`Escudo ${team.name}`} />
            <span className="team-abbr">{team.abbr}</span><strong>{team.name}</strong><small>{team.conference === 'Eastern' ? 'Leste' : 'Oeste'} · {team.division}</small>
          </button>
        ))}
      </section>
      <div className="selection-dock glass-panel">
        <button className="ghost-button" onClick={onCreate}><Sparkles size={16} /> Criar clube</button>
        <div className="selected-team">{selected ? <><img src={asset(selected.logo)} alt="" /><span><small>Selecionado</small><strong>{selected.name}</strong></span><span>{selected.rosterSize} atletas</span></> : <span>Selecione uma franquia para começar</span>}</div>
        <button className="primary-button" disabled={!selected} onClick={() => selected && onPick(selected)}>Assinar contrato <ChevronRight size={18} /></button>
      </div>
    </main>
  )
}

function CreateClub({ onBack, onSaved }: { onBack: () => void; onSaved: (message: string) => void }) {
  const [city, setCity] = useState('Vale')
  const [name, setName] = useState('Stars')
  const [logo, setLogo] = useState(1)
  const save = () => {
    localStorage.setItem('vbm-create-club-concept', JSON.stringify({ city, name, logo }))
    onSaved(`Conceito ${city} ${name} salvo para a expansão Criar Clube.`)
  }
  return (
    <main className="create-screen page-bg" style={{ '--bg': `url("${asset('assets/backgrounds/executive-suite.png')}")` } as React.CSSProperties}>
      <header className="public-header"><button className="icon-button" onClick={onBack}><ArrowLeft /></button><Brand compact /><div className="season-pill">LABORATÓRIO CRIAR CLUBE</div></header>
      <section className="create-layout">
        <div className="create-preview glass-panel"><p className="eyebrow">IDENTIDADE FICTÍCIA</p><img src={asset(`assets/create-club/mascot-${logo}.png`)} alt="Mascote criado para o modo Criar Clube" /><h1>{city || 'Cidade'} <span>{name || 'Clube'}</span></h1><p>Estes mascotes autorais aparecem exclusivamente neste laboratório e nunca substituem marcas das franquias oficiais.</p></div>
        <form className="create-form glass-panel" onSubmit={(event) => { event.preventDefault(); save() }}>
          <h2>Defina sua identidade</h2><label>Cidade<input value={city} maxLength={24} onChange={(event) => setCity(event.target.value)} /></label><label>Nome do clube<input value={name} maxLength={24} onChange={(event) => setName(event.target.value)} /></label>
          <span className="field-label">Mascote</span><div className="mascot-grid">{[1, 2, 3, 4, 5].map((index) => <button type="button" key={index} className={logo === index ? 'active' : ''} onClick={() => setLogo(index)}><img src={asset(`assets/create-club/mascot-${index}.png`)} alt={`Mascote ${index}`} /></button>)}</div>
          <div className="notice"><Info size={17} /><span>O conceito fica salvo neste navegador. Draft de expansão e entrada na liga serão ativados na Parte 3.</span></div>
          <button className="primary-button" type="submit"><Check size={18} /> Salvar conceito</button>
        </form>
      </section>
    </main>
  )
}

function CareerShell({ career, setCareer, tab, setTab, onExit, notify, children }: { career: Career; setCareer: React.Dispatch<React.SetStateAction<Career | null>>; tab: Tab; setTab: (tab: Tab) => void; onExit: () => void; notify: (message: string) => void; children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const team = pack.teams.find((item) => item.abbr === career.teamAbbr)!
  const roster = useMemo(() => pack.players.filter((player) => player.team === team.abbr).sort((a, b) => b.overall - a.overall), [team.abbr])
  const nextGame = career.schedule.find((game) => !game.played)

  const simulate = () => {
    if (!nextGame) return notify('O calendário desta fundação foi concluído.')
    const opponent = pack.teams.find((item) => item.abbr === nextGame.opponent)!
    const ours = roster.slice(0, 10).reduce((sum, player) => sum + player.overall, 0) / Math.max(1, roster.slice(0, 10).length)
    const theirs = pack.players.filter((player) => player.team === opponent.abbr).sort((a, b) => b.overall - a.overall).slice(0, 10)
    const theirRating = theirs.reduce((sum, player) => sum + player.overall, 0) / Math.max(1, theirs.length)
    const homeBoost = nextGame.home ? 3 : -1
    const teamScore = Math.max(78, Math.round(103 + (ours - theirRating) * 1.25 + homeBoost + (Math.random() * 17 - 8)))
    const opponentScore = Math.max(78, Math.round(102 + (theirRating - ours) * 1.05 + (nextGame.home ? 0 : 3) + (Math.random() * 17 - 8)))
    const win = teamScore > opponentScore
    setCareer((current) => current && ({ ...current, currentDate: nextGame.date, wins: current.wins + (win ? 1 : 0), losses: current.losses + (win ? 0 : 1), budget: current.budget + (nextGame.home ? 1_250_000 : 500_000), fanMood: Math.max(20, Math.min(100, current.fanMood + (win ? 3 : -2))), schedule: current.schedule.map((game) => game.id === nextGame.id ? { ...game, played: true, teamScore, opponentScore } : game) }))
    notify(`${win ? 'Vitória' : 'Derrota'}: ${team.abbr} ${teamScore} × ${opponentScore} ${opponent.abbr}`)
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Central', icon: <LayoutDashboard /> },
    { id: 'roster', label: 'Elenco', icon: <UsersRound /> },
    { id: 'schedule', label: 'Calendário', icon: <CalendarDays /> },
    { id: 'training', label: 'Treino', icon: <Dumbbell /> },
    { id: 'office', label: 'Diretoria', icon: <Building2 /> },
    { id: 'license', label: 'Créditos', icon: <ShieldCheck /> },
  ]

  return (
    <div className="game-shell" style={{ '--team': team.primary, '--team2': team.secondary } as React.CSSProperties}>
      <header className="game-header"><button className="mobile-menu icon-button" onClick={() => setMenuOpen(true)}><Menu /></button><Brand compact /><div className="club-identity"><img src={asset(team.logo)} alt="" /><span><small>GENERAL MANAGER</small><strong>{team.name}</strong></span></div><div className="header-stats"><span><CalendarDays />{formatDate(career.currentDate)}</span><span><CircleDollarSign />{formatMoney(career.budget)}</span><span className="record">{career.wins}–{career.losses}</span></div></header>
      <aside className={`sidebar ${menuOpen ? 'open' : ''}`}><button className="close-menu icon-button" onClick={() => setMenuOpen(false)}><X /></button><div className="sidebar-team"><img src={asset(team.logo)} alt={`Escudo ${team.name}`} /><strong>{team.abbr}</strong><small>{pack.season}</small></div><nav>{tabs.map((item) => <button key={item.id} className={tab === item.id ? 'active' : ''} onClick={() => { setTab(item.id); setMenuOpen(false) }}>{item.icon}<span>{item.label}</span></button>)}</nav><button className="exit-career" onClick={onExit}><ArrowLeft /> Menu principal</button></aside>
      <main className="career-content">
        {tab === 'overview' && <Overview team={team} career={career} roster={roster} nextGame={nextGame} onSimulate={simulate} setTab={setTab} />}
        {tab === 'roster' && <Roster team={team} career={career} roster={roster} setCareer={setCareer} notify={notify} />}
        {tab === 'schedule' && <Schedule team={team} career={career} onSimulate={simulate} />}
        {tab === 'training' && <Training career={career} setCareer={setCareer} notify={notify} roster={roster} />}
        {tab === 'office' && <Office team={team} career={career} />}
        {tab === 'license' && <License />}
      </main>
      {children}
    </div>
  )
}

function Overview({ team, career, roster, nextGame, onSimulate, setTab }: { team: Team; career: Career; roster: Player[]; nextGame?: Game; onSimulate: () => void; setTab: (tab: Tab) => void }) {
  const opponent = nextGame && pack.teams.find((item) => item.abbr === nextGame.opponent)
  return (
    <div className="screen overview-screen">
      <section className="dashboard-hero page-bg" style={{ '--bg': `url("${asset('assets/backgrounds/team-arena.png')}")` } as React.CSSProperties}>
        <div><p className="eyebrow">TEAM HUB · {pack.season}</p><h1>{team.city}<br /><span>{team.nickname}</span></h1><p>{team.conference === 'Eastern' ? 'Conferência Leste' : 'Conferência Oeste'} · Divisão {team.division}</p></div>
        <img className="hero-team-logo" src={asset(team.logo)} alt={`Escudo ${team.name}`} />
        <div className="hero-record"><small>CAMPANHA</small><strong>{career.wins}<span>–</span>{career.losses}</strong><div><span>Torcida {career.fanMood}%</span><span>Química {career.chemistry}%</span></div></div>
      </section>
      <section className="dashboard-grid">
        <article className="next-game panel"><div className="panel-title"><span>Próximo jogo</span><button onClick={() => setTab('schedule')}>Calendário <ChevronRight size={15} /></button></div>{opponent && nextGame ? <><div className="matchup"><div><img src={asset(team.logo)} alt="" /><strong>{team.abbr}</strong></div><span><small>{nextGame.home ? 'EM CASA' : 'FORA'}</small><b>VS</b><time>{formatDate(nextGame.date)}</time></span><div><img src={asset(opponent.logo)} alt="" /><strong>{opponent.abbr}</strong></div></div><button className="primary-button full" onClick={onSimulate}><Gamepad2 size={18} /> Simular partida</button></> : <div className="empty-state"><Trophy /><p>Calendário concluído</p></div>}</article>
        <article className="panel objectives"><div className="panel-title"><span>Objetivos da diretoria</span><small>3 ATIVOS</small></div><Objective label="Chegar aos playoffs" progress={Math.min(100, (career.wins / 12) * 100)} /><Objective label="Química acima de 75" progress={career.chemistry} /><Objective label="Manter torcida engajada" progress={career.fanMood} /></article>
        <article className="panel top-players"><div className="panel-title"><span>Núcleo do elenco</span><button onClick={() => setTab('roster')}>Ver elenco <ChevronRight size={15} /></button></div><div className="player-strip">{roster.slice(0, 4).map((player) => <PlayerMini key={player.id} player={player} />)}</div></article>
        <article className="panel activity"><div className="panel-title"><span>Central de decisões</span><small>AUTOSAVE ATIVO</small></div><div className="decision-list"><button onClick={() => setTab('roster')}><UsersRound /><span><strong>Definir rotação</strong><small>Distribua os 240 minutos</small></span><ChevronRight /></button><button onClick={() => setTab('training')}><Dumbbell /><span><strong>Planejar treino</strong><small>Escolha o foco da semana</small></span><ChevronRight /></button><button onClick={() => setTab('office')}><Building2 /><span><strong>Revisar finanças</strong><small>Bilheteria e orçamento</small></span><ChevronRight /></button></div></article>
      </section>
    </div>
  )
}

function Objective({ label, progress }: { label: string; progress: number }) {
  return <div className="objective"><div><span>{label}</span><b>{Math.round(progress)}%</b></div><div className="progress"><i style={{ width: `${Math.min(100, progress)}%` }} /></div></div>
}

function PlayerMini({ player }: { player: Player }) {
  return <div className="player-mini"><div className="player-photo"><img src={asset(player.headshot)} alt={`Retrato de ${player.name}`} /></div><span className="ovr">{player.overall}</span><strong>{player.firstName}<br />{player.lastName}</strong><small>#{player.jersey} · {player.position}</small></div>
}

function Roster({ team, career, roster, setCareer, notify }: { team: Team; career: Career; roster: Player[]; setCareer: React.Dispatch<React.SetStateAction<Career | null>>; notify: (message: string) => void }) {
  const [query, setQuery] = useState('')
  const visible = roster.filter((player) => player.name.toLowerCase().includes(query.toLowerCase()))
  const totalMinutes = Object.values(career.rotation).reduce((sum, value) => sum + value, 0)
  const autoRotate = () => {
    const minutes = [34, 34, 32, 30, 28, 22, 20, 16, 14, 10]
    const rotation: Record<string, number> = {}
    roster.forEach((player, index) => { rotation[player.id] = minutes[index] || 0 })
    setCareer((current) => current && ({ ...current, starters: roster.slice(0, 5).map((player) => player.id), rotation }))
    notify('Rotação automática aplicada: 240 minutos distribuídos.')
  }
  const changeMinutes = (id: number, delta: number) => setCareer((current) => current && ({ ...current, rotation: { ...current.rotation, [id]: Math.max(0, Math.min(48, (current.rotation[id] || 0) + delta)) } }))
  const toggleStarter = (id: number) => setCareer((current) => {
    if (!current) return current
    if (current.starters.includes(id)) return current
    const weakest = [...current.starters].sort((a, b) => (roster.find((p) => p.id === a)?.overall || 0) - (roster.find((p) => p.id === b)?.overall || 0))[0]
    return { ...current, starters: current.starters.filter((playerId) => playerId !== weakest).concat(id) }
  })
  return (
    <div className="screen roster-screen page-bg" style={{ '--bg': `url("${asset('assets/backgrounds/locker-room.png')}")` } as React.CSSProperties}>
      <ScreenTitle eyebrow="BASKETBALL OPERATIONS" title="Elenco e rotação" description={`${team.name} · ${roster.length} atletas oficiais`} />
      <section className="lineup-board panel"><div className="panel-title"><span>Quinteto titular</span><button onClick={autoRotate}><RotateCcw size={15} /> Auto rotação</button></div><div className="starting-five">{career.starters.map((id, index) => { const player = roster.find((item) => item.id === id); return player ? <div key={id}><span>{['PG', 'SG', 'SF', 'PF', 'C'][index]}</span><img src={asset(player.headshot)} alt={player.name} /><strong>{player.lastName}</strong><small>{player.overall} OVR</small></div> : null })}</div><div className={`minutes-total ${totalMinutes === 240 ? 'valid' : ''}`}><span>Minutos da rotação</span><strong>{totalMinutes} / 240</strong><div className="progress"><i style={{ width: `${Math.min(100, totalMinutes / 2.4)}%` }} /></div></div></section>
      <section className="roster-table panel"><div className="roster-tools"><label className="search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar atleta" /></label><span>{visible.length} atletas</span></div><div className="table-head"><span>Atleta</span><span>Pos.</span><span>OVR</span><span>Titular</span><span>Minutos</span></div>{visible.map((player) => <div className="player-row" key={player.id}><div className="player-cell"><img src={asset(player.headshot)} alt={`Retrato de ${player.name}`} /><span><strong>{player.name}</strong><small>#{player.jersey} · {player.height} · {player.country}</small></span></div><span>{player.position}</span><b className="rating">{player.overall}</b><button className={`starter-toggle ${career.starters.includes(player.id) ? 'active' : ''}`} onClick={() => toggleStarter(player.id)}>{career.starters.includes(player.id) ? <><Check size={14} /> Titular</> : 'Escalar'}</button><div className="minutes"><button onClick={() => changeMinutes(player.id, -2)}><Minus size={14} /></button><b>{career.rotation[player.id] || 0}</b><button onClick={() => changeMinutes(player.id, 2)}><Plus size={14} /></button></div></div>)}</section>
    </div>
  )
}

function Schedule({ team, career, onSimulate }: { team: Team; career: Career; onSimulate: () => void }) {
  const next = career.schedule.find((game) => !game.played)
  return <div className="screen schedule-screen"><ScreenTitle eyebrow="TEMPORADA 2026–27" title="Calendário" description="Fundação jogável · primeiros 24 compromissos" /><section className="schedule-summary panel"><div><small>CAMPANHA</small><strong>{career.wins}–{career.losses}</strong></div><div><small>APROVEITAMENTO</small><strong>{career.wins + career.losses ? Math.round(career.wins / (career.wins + career.losses) * 100) : 0}%</strong></div><div><small>PRÓXIMO</small><strong>{next ? formatDate(next.date) : 'Concluído'}</strong></div><button className="primary-button" onClick={onSimulate} disabled={!next}><Play size={17} fill="currentColor" /> Simular próximo</button></section><section className="games-list panel">{career.schedule.map((game) => { const opponent = pack.teams.find((item) => item.abbr === game.opponent)!; const win = game.played && (game.teamScore || 0) > (game.opponentScore || 0); return <div className={`game-row ${!game.played && game.id === next?.id ? 'next' : ''}`} key={game.id}><time>{formatDate(game.date)}</time><span className="venue">{game.home ? 'CASA' : 'FORA'}</span><div className="game-teams"><img src={asset(team.logo)} alt="" /><strong>{team.abbr}</strong><b>{game.home ? 'vs' : '@'}</b><img src={asset(opponent.logo)} alt="" /><strong>{opponent.abbr}</strong></div>{game.played ? <div className={`score ${win ? 'win' : 'loss'}`}><span>{win ? 'V' : 'D'}</span><strong>{game.teamScore}–{game.opponentScore}</strong></div> : <span className="pending">Agendado</span>}</div>})}</section></div>
}

function Training({ career, setCareer, notify, roster }: { career: Career; setCareer: React.Dispatch<React.SetStateAction<Career | null>>; notify: (message: string) => void; roster: Player[] }) {
  const focuses = [{ name: 'Equilíbrio', desc: 'Mantém o grupo estável', icon: '◎' }, { name: 'Ataque', desc: 'Ritmo e criação', icon: '↗' }, { name: 'Defesa', desc: 'Pressão e cobertura', icon: '◆' }, { name: 'Físico', desc: 'Resistência e explosão', icon: '▲' }, { name: 'Coesão', desc: 'Química do elenco', icon: '∞' }]
  const run = () => { setCareer((current) => current && ({ ...current, chemistry: Math.min(100, current.chemistry + (current.trainingFocus === 'Coesão' ? 4 : 2)), fanMood: Math.min(100, current.fanMood + 1) })); notify(`Sessão de ${career.trainingFocus} concluída. Química do grupo evoluiu.`) }
  return <div className="screen training-screen page-bg" style={{ '--bg': `url("${asset('assets/backgrounds/training-center.png')}")` } as React.CSSProperties}><ScreenTitle eyebrow="PERFORMANCE CENTER" title="Plano de treino" description="Defina o foco e desenvolva a identidade do time" /><section className="training-layout"><div className="focus-panel panel"><div className="panel-title"><span>Foco da sessão</span><small>SELECIONE 1</small></div><div className="focus-grid">{focuses.map((focus) => <button key={focus.name} className={career.trainingFocus === focus.name ? 'active' : ''} onClick={() => setCareer((current) => current && ({ ...current, trainingFocus: focus.name }))}><b>{focus.icon}</b><span><strong>{focus.name}</strong><small>{focus.desc}</small></span>{career.trainingFocus === focus.name && <Check />}</button>)}</div><button className="primary-button full" onClick={run}><Dumbbell size={18} /> Executar sessão</button></div><div className="readiness panel"><div className="panel-title"><span>Prontidão do elenco</span><small>{roster.length} ATLETAS</small></div><div className="readiness-score"><strong>{Math.round((career.chemistry + career.fanMood) / 2)}</strong><span>/ 100</span><small>PRONTO PARA COMPETIR</small></div>{roster.slice(0, 6).map((player, index) => <div className="readiness-row" key={player.id}><img src={asset(player.headshot)} alt={player.name} /><span><strong>{player.name}</strong><small>{index < 3 ? 'Condição excelente' : 'Carga controlada'}</small></span><div className="progress"><i style={{ width: `${88 - index * 3}%` }} /></div></div>)}</div></section></div>
}

function Office({ team, career }: { team: Team; career: Career }) {
  return <div className="screen office-screen page-bg" style={{ '--bg': `url("${asset('assets/backgrounds/executive-suite.png')}")` } as React.CSSProperties}><ScreenTitle eyebrow="FRONT OFFICE" title="Diretoria" description="Visão financeira e metas institucionais" /><section className="finance-grid"><article className="panel finance-card"><CircleDollarSign /><small>CAIXA DISPONÍVEL</small><strong>{formatMoney(career.budget)}</strong><span className="positive">+ {formatMoney(1_250_000)} por jogo em casa</span></article><article className="panel finance-card"><UsersRound /><small>ENGAJAMENTO</small><strong>{career.fanMood}%</strong><span>Humor da torcida</span></article><article className="panel finance-card"><Trophy /><small>EXPECTATIVA</small><strong>{career.wins >= career.losses ? 'PLAYOFFS' : 'DISPUTAR'}</strong><span>Meta da temporada</span></article></section><section className="board-room panel"><div><p className="eyebrow">MEMORANDO DA PRESIDÊNCIA</p><h2>Construa uma cultura vencedora em {team.city}.</h2><p>A diretoria avaliará resultado esportivo, química do elenco, desenvolvimento e sustentabilidade financeira. Suas decisões nesta fundação serão preservadas para as Partes 2 e 3.</p><div className="board-metrics"><Objective label="Confiança da diretoria" progress={72 + Math.min(20, career.wins * 2)} /><Objective label="Aprovação da torcida" progress={career.fanMood} /><Objective label="Coesão do vestiário" progress={career.chemistry} /></div></div><img src={asset(team.logo)} alt={`Escudo ${team.name}`} /></section></div>
}

function License() {
  return <div className="screen license-screen"><ScreenTitle eyebrow="LICENSEPACK · DATA GOVERNANCE" title="Pacote oficial separado do motor" description="Rastreabilidade prevista na Bíblia Mestra" /><section className="license-grid"><article className="panel"><ShieldCheck /><h3>Franquias oficiais</h3><strong>{pack.teamCount} / 30</strong><p>Nomes e escudos do CDN oficial da NBA, organizados por IDs neutros.</p></article><article className="panel"><UsersRound /><h3>Atletas oficiais</h3><strong>{pack.playerCount}</strong><p>Elencos 2026–27 e retratos de todos os atletas vinculados em 31/08/2026.</p></article><article className="panel"><Gamepad2 /><h3>Motor independente</h3><strong>v1</strong><p>O save referencia IDs e continua funcional com fallback, sem acoplar regras esportivas às marcas.</p></article></section><section className="source-panel panel"><h2>Manifesto da fonte</h2><dl><div><dt>Temporada</dt><dd>{pack.season}</dd></div><div><dt>Capturado em</dt><dd>{pack.retrievedAt}</dd></div><div><dt>Fonte</dt><dd>{pack.source}</dd></div><div><dt>Modo de direitos</dt><dd>Autorização declarada pelo responsável pelo projeto</dd></div></dl><a href={pack.sourceUrl} target="_blank" rel="noreferrer">Abrir fonte oficial <ChevronRight size={15} /></a><p className="legal-note">Este protótipo não declara afiliação ou endosso da NBA. Para distribuição comercial, valide contratos de marcas, imagem e dados com assessoria jurídica.</p></section></div>
}

function ScreenTitle({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <header className="screen-title"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{description}</p></div></header>
}

function Brand({ compact = false }: { compact?: boolean }) {
  return <div className={`brand ${compact ? 'compact' : ''}`}><div className="brand-mark">V<span>●</span></div><div><strong>VALE</strong><small>BASKET MANAGER</small></div></div>
}

export default App
