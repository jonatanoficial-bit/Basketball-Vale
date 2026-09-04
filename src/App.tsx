import { useEffect, useRef, useState } from 'react';
import {
  Activity,
  Award,
  BarChart3,
  BriefcaseBusiness,
  CalendarDays,
  ChevronLeft,
  CircleDollarSign,
  ClipboardList,
  Cpu,
  Dumbbell,
  Gamepad2,
  GraduationCap,
  Handshake,
  HeartPulse,
  Landmark,
  LayoutDashboard,
  LineChart,
  Menu,
  Newspaper,
  Pause,
  Play,
  Radar,
  RotateCcw,
  Settings,
  Shield,
  ShieldCheck,
  SlidersHorizontal,
  SkipForward,
  Sparkles,
  Star,
  Trophy,
  UserRound,
  Users,
  Volume2,
  VolumeX,
  Zap,
  X,
} from 'lucide-react';
import {
  applyResults,
  nextTeamFixture,
  simulateFixture,
  standingsSorted,
} from './domain/league';
import {
  asset,
  dateLabel,
  loadCareer,
  makeCareer,
  money,
  persistCareer,
  players,
  teams,
} from './domain/career';
import { t } from './domain/i18n';
import {
  addStats,
  blankStats,
  pct,
  type CareerV2,
  type Fixture,
  type GameResult,
  type Language,
  type Player,
  type RotationEntry,
  type StatLine,
  type Team,
  type TradeProposal,
} from './domain/types';
import { evaluateTrade, payrollFor } from './domain/simulationData';
import {
  advanceOffseason,
  simulatePostseason,
  simulateRounds,
} from './domain/seasonEngine';

type Screen =
  | 'landing'
  | 'creator'
  | 'dashboard'
  | 'roster'
  | 'rotation'
  | 'tactics'
  | 'training'
  | 'staff'
  | 'game'
  | 'calendar'
  | 'league'
  | 'stats'
  | 'market'
  | 'scouting'
  | 'draft'
  | 'finances'
  | 'board'
  | 'media'
  | 'profile'
  | 'licenses'
  | 'world'
  | 'history'
  | 'settings';
type CreatorDraft = {
  name: string;
  origin: string;
  experience: string;
  style: string;
  avatar: string;
  teamAbbr: string;
};
const managerAvatars = [
  'manager-01.png',
  'manager-02.png',
  'manager-03.png',
  'manager-04.png',
  'manager-05.png',
];
const nav = [
  [
    'team',
    [
      ['dashboard', 'home', LayoutDashboard],
      ['roster', 'roster', Users],
      ['rotation', 'rotation', SlidersHorizontal],
      ['tactics', 'tactics', Shield],
      ['training', 'training', Dumbbell],
      ['staff', 'staff', UserRound],
    ],
  ],
  [
    'competition',
    [
      ['game', 'gameCenter', Gamepad2],
      ['calendar', 'calendar', CalendarDays],
      ['league', 'league', Trophy],
      ['stats', 'stats', BarChart3],
    ],
  ],
  [
    'office',
    [
      ['market', 'market', Handshake],
      ['scouting', 'scouting', Radar],
      ['draft', 'draft', GraduationCap],
      ['finances', 'finances', CircleDollarSign],
      ['board', 'board', BriefcaseBusiness],
      ['world', 'world', Landmark],
    ],
  ],
  [
    'career',
    [
      ['media', 'media', Newspaper],
      ['profile', 'profile', Award],
      ['history', 'history', Trophy],
      ['settings', 'settings', Settings],
      ['licenses', 'licenses', ShieldCheck],
    ],
  ],
] as const;
const teamByAbbr = (abbr: string) => teams.find((team) => team.abbr === abbr)!;
const allCareerPlayers = (career: CareerV2) =>
  [...players, ...(career.generatedPlayers ?? [])].filter(
    (player) => !(career.retiredPlayerIds ?? []).includes(player.id),
  );
const roster = (abbr: string, career?: CareerV2) =>
  (career ? allCareerPlayers(career) : players)
    .filter((player) =>
      career
        ? career.economy.contracts[player.id]?.team === abbr &&
          career.economy.contracts[player.id]?.status === 'active'
        : player.team === abbr,
    )
    .sort((a, b) => b.overall - a.overall);
const playersForCareer = (career: CareerV2) =>
  allCareerPlayers(career).map((player) => ({
    ...player,
    team: career.economy.contracts[player.id]?.team ?? player.team,
  }));
const img = (path: string) => asset(path.replace(/^\//, ''));
const backgroundByScreen: Record<Exclude<Screen, 'landing' | 'creator'>, string> = {
  dashboard: 'home-arena.png',
  roster: 'locker-room.png',
  rotation: 'training-center.png',
  tactics: 'training-center.png',
  training: 'training-center.png',
  staff: 'executive-suite.png',
  game: 'team-arena.png',
  calendar: 'team-arena.png',
  league: 'franchise-campus.png',
  stats: 'franchise-campus.png',
  market: 'executive-suite.png',
  scouting: 'franchise-campus.png',
  draft: 'franchise-campus.png',
  finances: 'executive-suite.png',
  board: 'executive-suite.png',
  media: 'home-arena.png',
  profile: 'locker-room.png',
  licenses: 'franchise-campus.png',
  world: 'franchise-campus.png',
  history: 'home-arena.png',
  settings: 'executive-suite.png',
};
const musicTracks = [
  ['Quadra em Fogo', 'assets/audio/quadra-em-fogo.mp3'],
  ['Quadra em Fogo II', 'assets/audio/quadra-em-fogo-alt.mp3'],
  ['Quadra em Fumaça', 'assets/audio/quadra-em-fumaca.mp3'],
  ['Quadra em Fumaça II', 'assets/audio/quadra-em-fumaca-alt.mp3'],
  ['Quadra em Veludo', 'assets/audio/quadra-em-veludo.mp3'],
  ['Quadra em Veludo II', 'assets/audio/quadra-em-veludo-alt.mp3'],
  ['Bola na Ginga', 'assets/audio/bola-na-ginga.mp3'],
] as const;
const statAverage = (stats: StatLine, key: keyof StatLine) =>
  stats.gp ? (stats[key] / stats.gp).toFixed(1) : '0.0';

function TeamMark({ team, small = false }: { team: Team; small?: boolean }) {
  return (
    <img
      className={small ? 'team-mark small' : 'team-mark'}
      src={img(team.logo)}
      alt={`${team.name} logo`}
    />
  );
}
function PlayerFace({
  player,
  small = false,
}: {
  player: Player;
  small?: boolean;
}) {
  return (
    <img
      className={small ? 'player-face small' : 'player-face'}
      src={img(player.headshot)}
      alt={player.name}
    />
  );
}
function StatCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  detail?: string;
  icon?: typeof Trophy;
}) {
  return (
    <article className="stat-card">
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        {detail && <small>{detail}</small>}
      </div>
      {Icon && <Icon size={24} />}
    </article>
  );
}
function Panel({
  title,
  action,
  children,
  className = '',
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`panel ${className}`}>
      <header className="panel-head">
        <h2>{title}</h2>
        {action}
      </header>
      {children}
    </section>
  );
}
function PageTitle({
  kicker,
  title,
  copy,
}: {
  kicker: string;
  title: string;
  copy: string;
}) {
  return (
    <header className="page-title">
      <p className="eyebrow">{kicker}</p>
      <h1>{title}</h1>
      <p>{copy}</p>
    </header>
  );
}

function IntroGate({ onComplete }: { onComplete: () => void }) {
  const [playing, setPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const start = async () => {
    setVideoError(false);
    setPlaying(true);
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    video.muted = false;
    video.volume = 1;
    try {
      await video.play();
    } catch {
      setVideoError(true);
    }
  };
  const skip = () => {
    videoRef.current?.pause();
    onComplete();
  };
  return (
    <main
      className={`intro-gate ${playing ? 'is-playing' : ''}`}
      style={{ backgroundImage: `url(${img('assets/backgrounds/home-arena.png')})` }}
    >
      <video
        ref={videoRef}
        className="intro-video"
        src={img('assets/video/abertura-vale-basketball.mp4')}
        playsInline
        preload="metadata"
        onEnded={onComplete}
        onError={() => setVideoError(true)}
      />
      <div className="intro-shade" />
      <section className="intro-brand" aria-hidden={playing}>
        <div className="intro-emblem">V</div>
        <p>VALE BASKETBALL MANAGER</p>
        <h1>Construa uma dinastia.</h1>
        <button className="intro-start" onClick={start}>
          <Play fill="currentColor" /> Iniciar experiência
        </button>
        <span>O vídeo será reproduzido com som</span>
      </section>
      {playing && (
        <div className="intro-controls">
          {videoError && (
            <button className="intro-retry" onClick={start}>
              <Volume2 /> Ativar som e tentar novamente
            </button>
          )}
          <button className="intro-skip" onClick={skip}>
            Pular abertura <SkipForward />
          </button>
        </div>
      )}
    </main>
  );
}

function Soundtrack({
  enabled,
  volume,
  onEnabled,
  onVolume,
  onOpenSettings,
}: {
  enabled: boolean;
  volume: number;
  onEnabled: (enabled: boolean) => void;
  onVolume: (volume: number) => void;
  onOpenSettings: () => void;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [trackIndex, setTrackIndex] = useState(() => Math.floor(Math.random() * musicTracks.length));
  const [blocked, setBlocked] = useState(false);
  const chooseNext = () =>
    setTrackIndex((current) => {
      if (musicTracks.length < 2) return current;
      let next = current;
      while (next === current) next = Math.floor(Math.random() * musicTracks.length);
      return next;
    });
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    if (enabled) {
      void audio.play().then(() => setBlocked(false)).catch(() => setBlocked(true));
    } else {
      audio.pause();
      setBlocked(false);
    }
  }, [enabled, trackIndex, volume]);
  const toggle = () => {
    onEnabled(!enabled);
    if (!enabled) setBlocked(false);
  };
  const resumeOrNext = () => {
    if (blocked && audioRef.current) {
      void audioRef.current.play().then(() => setBlocked(false));
      return;
    }
    chooseNext();
  };
  return (
    <aside className="music-dock" aria-label="Trilha musical">
      <audio
        ref={audioRef}
        src={img(musicTracks[trackIndex][1])}
        onEnded={chooseNext}
        preload="metadata"
      />
      <button className="music-main" onClick={toggle} aria-label={enabled ? 'Desativar música' : 'Ativar música'}>
        {enabled && !blocked ? <Volume2 /> : <VolumeX />}
      </button>
      <button className="music-title" onClick={resumeOrNext}>
        <small>{blocked ? 'CLIQUE PARA OUVIR' : enabled ? 'TOCANDO AGORA' : 'MÚSICA DESATIVADA'}</small>
        <b>{musicTracks[trackIndex][0]}</b>
      </button>
      <button className="music-next" onClick={chooseNext} aria-label="Próxima música"><SkipForward /></button>
      <button className="music-settings" onClick={onOpenSettings} aria-label="Configurações de áudio"><Settings /></button>
      <input
        aria-label="Volume da música"
        type="range"
        min="0"
        max="1"
        step="0.05"
        value={volume}
        onChange={(event) => onVolume(Number(event.target.value))}
      />
    </aside>
  );
}

function SettingsScreen({
  enabled,
  volume,
  onEnabled,
  onVolume,
}: {
  enabled: boolean;
  volume: number;
  onEnabled: (enabled: boolean) => void;
  onVolume: (volume: number) => void;
}) {
  return (
    <>
      <PageTitle kicker="PREFERÊNCIAS" title="Configurações do jogo" copy="Controle a experiência audiovisual sem alterar sua carreira." />
      <div className="settings-grid">
        <Panel title="Áudio e música">
          <div className="setting-row">
            <div><b>Trilha musical</b><span>Reproduz as sete faixas em ordem aleatória.</span></div>
            <button className={enabled ? 'setting-toggle active' : 'setting-toggle'} onClick={() => onEnabled(!enabled)}>
              {enabled ? <Volume2 /> : <VolumeX />} {enabled ? 'Ligada' : 'Desligada'}
            </button>
          </div>
          <label className="volume-setting">
            <span>Volume <b>{Math.round(volume * 100)}%</b></span>
            <input type="range" min="0" max="1" step="0.05" value={volume} onChange={(event) => onVolume(Number(event.target.value))} />
          </label>
        </Panel>
        <Panel title="Faixas instaladas">
          <div className="track-library">
            {musicTracks.map(([title], index) => <span key={title}><b>{String(index + 1).padStart(2, '0')}</b>{title}</span>)}
          </div>
        </Panel>
      </div>
    </>
  );
}

function Creator({
  onCreate,
  onBack,
}: {
  onCreate: (draft: CreatorDraft) => void;
  onBack: () => void;
}) {
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<CreatorDraft>({
    name: 'Alex Vale',
    origin: 'Brasil',
    experience: 'Assistente técnico',
    style: 'Equilibrado',
    avatar: 'manager-03.png',
    teamAbbr: 'BOS',
  });
  const pick = (key: keyof CreatorDraft, value: string) =>
    setDraft((current) => ({ ...current, [key]: value }));
  const chosen = teamByAbbr(draft.teamAbbr);
  return (
    <main
      className="creator-screen"
      style={{
        backgroundImage: `linear-gradient(100deg, #020711f2, #061224cf), url(${img('assets/backgrounds/executive-suite.png')})`,
      }}
    >
      <button className="back-link" onClick={onBack}>
        <ChevronLeft size={18} /> Voltar à abertura
      </button>
      <div className="creator-steps">
        <b className={step === 1 ? 'active' : ''}>1. Manager</b>
        <b className={step === 2 ? 'active' : ''}>2. Franquia</b>
        <b className={step === 3 ? 'active' : ''}>3. Proposta</b>
      </div>
      {step === 1 && (
        <section className="creator-card">
          <div>
            <p className="eyebrow">CRIE SUA CARREIRA</p>
            <h1>Seu manager, sua identidade.</h1>
            <p>
              Escolha um retrato, defina o perfil e inicie uma carreira
              persistente no navegador.
            </p>
          </div>
          <div className="creator-grid">
            <label>
              Nome
              <input
                value={draft.name}
                onChange={(e) => pick('name', e.target.value)}
                maxLength={32}
              />
            </label>
            <label>
              Origem
              <input
                value={draft.origin}
                onChange={(e) => pick('origin', e.target.value)}
                maxLength={32}
              />
            </label>
            <label>
              Experiência
              <select
                value={draft.experience}
                onChange={(e) => pick('experience', e.target.value)}
              >
                <option>Assistente técnico</option>
                <option>Ex-jogador</option>
                <option>Analista de elite</option>
                <option>Projeto de longo prazo</option>
              </select>
            </label>
            <label>
              Estilo
              <select
                value={draft.style}
                onChange={(e) => pick('style', e.target.value)}
              >
                <option>Equilibrado</option>
                <option>Defesa primeiro</option>
                <option>Ritmo e espaço</option>
                <option>Desenvolvimento jovem</option>
              </select>
            </label>
          </div>
          <div className="avatar-grid">
            {managerAvatars.map((avatar) => (
              <button
                key={avatar}
                className={`avatar-choice ${draft.avatar === avatar ? 'selected' : ''}`}
                onClick={() => pick('avatar', avatar)}
              >
                <img
                  src={img(`assets/managers/${avatar}`)}
                  alt="Avatar de manager"
                />
              </button>
            ))}
          </div>
          <button className="gold-button" onClick={() => setStep(2)}>
            Escolher franquia
          </button>
        </section>
      )}
      {step === 2 && (
        <section className="creator-card">
          <p className="eyebrow">30 FRANQUIAS</p>
          <h1>Escolha o projeto.</h1>
          <div className="team-picker">
            {teams.map((team) => (
              <button
                key={team.abbr}
                className={`team-choice ${draft.teamAbbr === team.abbr ? 'selected' : ''}`}
                onClick={() => pick('teamAbbr', team.abbr)}
              >
                <TeamMark team={team} small />
                <span>{team.city}</span>
                <b>{team.nickname}</b>
              </button>
            ))}
          </div>
          <div className="button-row">
            <button className="ghost-button" onClick={() => setStep(1)}>
              Voltar
            </button>
            <button className="gold-button" onClick={() => setStep(3)}>
              Ver proposta
            </button>
          </div>
        </section>
      )}
      {step === 3 && (
        <section className="creator-card proposal">
          <TeamMark team={chosen} />
          <div>
            <p className="eyebrow">PROPOSTA DE {chosen.name.toUpperCase()}</p>
            <h1>{draft.name}, o comando é seu.</h1>
            <p>
              Objetivo: construir uma campanha sólida e proteger o futuro do
              elenco.
            </p>
            <ul>
              <li>Calendário completo de 82 jogos por time</li>
              <li>Direção técnica: {draft.style}</li>
              <li>Orçamento operacional inicial: {money(18_500_000)}</li>
            </ul>
          </div>
          <div className="button-row">
            <button className="ghost-button" onClick={() => setStep(2)}>
              Voltar
            </button>
            <button className="gold-button" onClick={() => onCreate(draft)}>
              Assinar e iniciar
            </button>
          </div>
        </section>
      )}
    </main>
  );
}

function GameCenter({
  career,
  commit,
}: {
  career: CareerV2;
  commit: (next: CareerV2) => void;
}) {
  const fixture = nextTeamFixture(career);
  const [preview, setPreview] = useState<GameResult | null>(null);
  const [index, setIndex] = useState(0);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [tab, setTab] = useState<'court' | 'box' | 'pbp' | 'advanced'>('court');
  const [pregame, setPregame] = useState(true);
  const [arenaSound, setArenaSound] = useState(true);
  const audioContext = useRef<AudioContext | null>(null);
  const ensureArenaAudio = () => {
    if (!audioContext.current) audioContext.current = new AudioContext();
    if (audioContext.current.state === 'suspended') void audioContext.current.resume();
    return audioContext.current;
  };
  const playArenaTone = (kind: 'anthem' | 'score' | 'court') => {
    if (!arenaSound) return;
    const context = ensureArenaAudio();
    const notes = kind === 'anthem' ? [220, 330, 440] : [kind === 'score' ? 520 : 180];
    notes.forEach((frequency, noteIndex) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = kind === 'court' ? 'triangle' : 'sine';
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, context.currentTime + noteIndex * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.045, context.currentTime + noteIndex * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + noteIndex * 0.12 + 0.22);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(context.currentTime + noteIndex * 0.12);
      oscillator.stop(context.currentTime + noteIndex * 0.12 + 0.24);
    });
  };
  useEffect(() => {
    setPreview(null);
    setIndex(0);
    setRunning(false);
    setPregame(true);
  }, [fixture?.id]);
  useEffect(
    () => () => {
      if (audioContext.current) void audioContext.current.close();
    },
    [],
  );
  useEffect(() => {
    if (!running || !preview || index >= preview.events.length) return;
    const timer = window.setTimeout(
      () => {
        if (index > 0 && index % 11 === 0)
          playArenaTone(index % 33 === 0 ? 'score' : 'court');
        setIndex((current) =>
          Math.min(
            preview.events.length,
            current + Math.max(1, Math.round(speed * 2)),
          ),
        );
      },
      Math.max(90, 650 / speed),
    );
    return () => window.clearTimeout(timer);
  }, [running, preview, index, speed]);
  if (!fixture)
    return (
      <Panel title="Game Center">
        <div className="empty-state">
          <Trophy size={34} />
          <h3>Temporada regular concluída</h3>
          <p>
            O quadro de playoffs é preparado a partir da classificação final.
          </p>
        </div>
      </Panel>
    );
  const home = teamByAbbr(fixture.home);
  const away = teamByAbbr(fixture.away);
  const universePlayers = playersForCareer(career);
  const game =
    preview ??
    simulateFixture(
      fixture,
      universePlayers,
      career.teamAbbr,
      career.rotation,
      career.tactics,
      true,
      career.playerModels,
      career.health,
    );
  const event =
    game.events[Math.max(0, Math.min(index - 1, game.events.length - 1))];
  const final = index >= game.events.length;
  const homeScore = event?.homeScore ?? 0;
  const awayScore = event?.awayScore ?? 0;
  const finish = () => {
    setRunning(false);
    setIndex(game.events.length);
    const dailyGames = career.fixtures
      .filter(
        (item) => item.status === 'scheduled' && item.date === fixture.date,
      )
      .map((item) =>
        item.id === fixture.id
          ? game
          : simulateFixture(
              item,
              universePlayers,
              career.teamAbbr,
              career.rotation,
              career.tactics,
              false,
              career.playerModels,
              career.health,
            ),
      );
    const next = applyResults(career, dailyGames);
    next.news.unshift({
      id: `game-${fixture.id}`,
      date: fixture.date,
      category: 'league',
      title: `${away.abbr} ${game.awayScore}–${game.homeScore} ${home.abbr}`,
      body: `Rodada concluída: ${dailyGames.length} jogos processados pela engine determinística ${game.engineVersion}. Checksum ${game.checksum}.`,
    });
    commit(next);
  };
  const advance = (target: number) => {
    setPreview(game);
    setIndex(Math.min(game.events.length, target));
    setRunning(false);
  };
  const teamPlayers = (abbr: string) => roster(abbr, career).slice(0, 5);
  if (pregame)
    return (
      <div className="game-center pregame-wrap">
        <section
          className="pregame-stage"
          style={
            {
              '--home-color': home.primary,
              '--away-color': away.primary,
            } as React.CSSProperties
          }
        >
          <div className="pregame-lights" />
          <header>
            <span><Sparkles /> APRESENTAÇÃO OFICIAL</span>
            <b>{dateLabel(fixture.date)} · VALE GAME DAY</b>
          </header>
          <div className="pregame-matchup">
            <div className="pregame-team away">
              <TeamMark team={away} />
              <span>{away.city}</span>
              <strong>{away.nickname}</strong>
            </div>
            <div className="pregame-versus">
              <small>TEMPORADA 2026–27</small>
              <b>VS</b>
              <span>{fixture.home === career.teamAbbr ? 'EM CASA' : 'FORA DE CASA'}</span>
            </div>
            <div className="pregame-team home">
              <TeamMark team={home} />
              <span>{home.city}</span>
              <strong>{home.nickname}</strong>
            </div>
          </div>
          <div className="lineup-showcase">
            {[away, home].map((side) => (
              <div className="lineup-team" key={side.abbr}>
                <p><TeamMark team={side} small /> QUINTETO INICIAL · {side.abbr}</p>
                <div>
                  {teamPlayers(side.abbr).map((player) => (
                    <article key={player.id}>
                      <PlayerFace player={player} />
                      <b>{player.lastName}</b>
                      <small>#{player.jersey || '—'} · {player.position}</small>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <footer>
            <button
              className="gold-button game-entry"
              onClick={() => {
                setPreview(game);
                setPregame(false);
                setRunning(true);
                playArenaTone('anthem');
              }}
            >
              <Zap /> Entrar em quadra
            </button>
            <button
              className="ghost-button"
              onClick={() => {
                setPreview(game);
                setPregame(false);
              }}
            >
              Pular apresentação
            </button>
          </footer>
        </section>
      </div>
    );
  return (
    <div className="game-center">
      <Panel
        title="Game Center"
        action={<div className="broadcast-actions">
          <button
            className="sound-toggle"
            onClick={() => {
              const next = !arenaSound;
              setArenaSound(next);
              if (next) ensureArenaAudio();
            }}
            aria-label={arenaSound ? 'Desativar som da arena' : 'Ativar som da arena'}
          >
            {arenaSound ? <Volume2 /> : <VolumeX />}
            <span>{arenaSound ? 'SOM ATIVO' : 'SEM SOM'}</span>
          </button>
          <span className="live-chip">{final ? 'FINAL' : `AO VIVO · ${game.engineVersion}`}</span>
        </div>}
      >
        <div className="scoreboard">
          <div>
            <TeamMark team={away} />
            <b>{away.abbr}</b>
            <strong>{awayScore}</strong>
          </div>
          <section>
            <span>
              Q{event?.period ?? 1} ·{' '}
              {event
                ? `${Math.floor(event.clock / 60)}:${String(event.clock % 60).padStart(2, '0')}`
                : '12:00'}
            </span>
            <small>
              POSSE · {event?.team ?? home.abbr} &nbsp; | &nbsp;{' '}
              {event?.shotClock ?? 24}s
            </small>
            <b>
              {dateLabel(fixture.date)} ·{' '}
              {fixture.home === career.teamAbbr ? 'CASA' : 'FORA'}
            </b>
          </section>
          <div>
            <TeamMark team={home} />
            <b>{home.abbr}</b>
            <strong>{homeScore}</strong>
          </div>
        </div>
        <div className="game-tabs">
          {(['court', 'box', 'pbp', 'advanced'] as const).map((key) => (
            <button
              className={tab === key ? 'active' : ''}
              onClick={() => setTab(key)}
              key={key}
            >
              {key === 'court'
                ? 'Quadra'
                : key === 'box'
                  ? 'Box score'
                  : key === 'pbp'
                    ? 'Play-by-play'
                    : 'Avançado'}
            </button>
          ))}
        </div>
        {tab === 'court' && (
          <div className={`court broadcast-court ${final ? 'game-finished' : ''}`}>
            <div className="court-line center" />
            <div className="paint left" />
            <div className="paint right" />
            <TeamMark team={home} />
            <div
              className="ball"
              style={{ left: `${event?.x ?? 50}%`, top: `${event?.y ?? 50}%` }}
            />
            {teamPlayers(away.abbr).map((player, i) => (
              <div
                className="court-player away"
                style={{
                  left: `${event?.playerId === player.id ? event.x : 18 + i * 13}%`,
                  top: `${event?.playerId === player.id ? event.y : 22 + ((i * 17) % 58)}%`,
                }}
                key={player.id}
              >
                <PlayerFace player={player} small />
                <small>{player.jersey || i + 1}</small>
              </div>
            ))}
            {teamPlayers(home.abbr).map((player, i) => (
              <div
                className="court-player home"
                style={{
                  left: `${event?.playerId === player.id ? event.x : 26 + i * 13}%`,
                  top: `${event?.playerId === player.id ? event.y : 66 - ((i * 17) % 55)}%`,
                }}
                key={player.id}
              >
                <PlayerFace player={player} small />
                <small>{player.jersey || i + 1}</small>
              </div>
            ))}
            <div className="event-banner">
              {event?.text ?? 'Aqueça a partida e controle cada posse.'}
            </div>
            {final && (
              <div className="finale-overlay">
                <Trophy />
                <span>FIM DE JOGO</span>
                <strong>{game.awayScore} — {game.homeScore}</strong>
                <b>{game.homeScore === game.awayScore ? 'DECISÃO ENCERRADA' : (game.homeScore > game.awayScore ? home.name : away.name)}</b>
              </div>
            )}
          </div>
        )}
        {tab === 'box' && <BoxScore game={game} career={career} />}
        {tab === 'pbp' && (
          <div className="pbp">
            {game.events
              .slice(0, Math.max(1, index))
              .reverse()
              .map((entry) => (
                <p key={entry.id}>
                  <b>
                    Q{entry.period} {Math.floor(entry.clock / 60)}:
                    {String(entry.clock % 60).padStart(2, '0')}
                  </b>{' '}
                  <span>{entry.team}</span> {entry.text}
                </p>
              ))}
          </div>
        )}
        {tab === 'advanced' && <AdvancedGame game={game} />}
        <div className="game-controls">
          <button className="ghost-button" onClick={() => setPreview(game)}>
            Preparar jogo
          </button>
          <button className="ghost-button" onClick={() => advance(49)}>
            Fim do Q1
          </button>
          <button className="ghost-button" onClick={() => advance(98)}>
            Intervalo
          </button>
          <button className="ghost-button" onClick={() => advance(147)}>
            Fim do Q3
          </button>
          <button
            className="gold-button"
            onClick={
              final
                ? finish
                : () => {
                    setPreview(game);
                    setRunning((current) => !current);
                    ensureArenaAudio();
                  }
            }
          >
            {running ? (
              <>
                <Pause size={16} /> Pausar
              </>
            ) : (
              <>
                <Play size={16} />{' '}
                {final ? 'Confirmar resultado' : 'Simular ao vivo'}
              </>
            )}
          </button>
          <select
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            aria-label="Velocidade"
          >
            <option value={1}>1×</option>
            <option value={2}>2×</option>
            <option value={4}>4×</option>
          </select>
          <button className="ghost-button" onClick={finish}>
            Simular até o final
          </button>
        </div>
        <p className="game-note">
          O placar, box score, classificação e notícias só são persistidos
          quando a partida é confirmada.
        </p>
      </Panel>
      <TacticsInline career={career} commit={commit} />
    </div>
  );
}
function BoxScore({ game, career }: { game: GameResult; career: CareerV2 }) {
  const universe = allCareerPlayers(career);
  const rows = Object.entries(game.box)
    .map(([id, stats]) => ({
      player: universe.find((candidate) => candidate.id === Number(id)),
      stats,
    }))
    .filter((item) => item.player)
    .sort((a, b) => b.stats.pts - a.stats.pts);
  return (
    <div className="box-table">
      <table>
        <thead>
          <tr>
            <th>Jogador</th>
            <th>MIN</th>
            <th>PTS</th>
            <th>REB</th>
            <th>AST</th>
            <th>FG</th>
            <th>3PT</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ player, stats }) => (
            <tr key={player!.id}>
              <td>
                <PlayerFace player={player!} small />
                {player!.name}
              </td>
              <td>{stats.min}</td>
              <td>
                <b>{stats.pts}</b>
              </td>
              <td>{stats.reb}</td>
              <td>{stats.ast}</td>
              <td>
                {stats.fgm}-{stats.fga}
              </td>
              <td>
                {stats.tpm}-{stats.tpa}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function AdvancedGame({ game }: { game: GameResult }) {
  const metrics = [
    ['ORtg', 'offensiveRating'],
    ['DRtg', 'defensiveRating'],
    ['Pace', 'pace'],
    ['eFG%', 'effectiveFg'],
    ['TS%', 'trueShooting'],
    ['TOV%', 'turnoverRate'],
    ['ORB%', 'offensiveReboundRate'],
    ['FTr', 'freeThrowRate'],
  ] as const;
  return (
    <div className="advanced-game">
      <div className="advanced-head">
        <span>
          Seed <b>{game.seed}</b>
        </span>
        <span>
          Engine <b>{game.engineVersion}</b>
        </span>
        <span>
          Checksum <b>{game.checksum}</b>
        </span>
        <span>
          Prorrogações <b>{game.overtime ?? 0}</b>
        </span>
      </div>
      <div className="advanced-grid">
        {[game.away, game.home].map((team) => (
          <article key={team}>
            <h3>{team}</h3>
            {metrics.map(([label, key]) => (
              <p key={key}>
                <span>{label}</span>
                <b>{game.advanced?.[team]?.[key] ?? '—'}</b>
              </p>
            ))}
          </article>
        ))}
      </div>
      <h3>Shot chart</h3>
      <div className="shot-chart">
        {game.shotChart?.map((shot, index) => (
          <i
            key={`${shot.playerId}-${index}`}
            className={shot.made ? 'made' : 'missed'}
            style={{ left: `${shot.x}%`, top: `${shot.y}%` }}
            title={`${shot.team} · ${shot.value}PT`}
          />
        ))}
      </div>
    </div>
  );
}
function TacticsInline({
  career,
  commit,
}: {
  career: CareerV2;
  commit: (next: CareerV2) => void;
}) {
  const set = (key: keyof CareerV2['tactics'], value: string | number) =>
    commit({ ...career, tactics: { ...career.tactics, [key]: value } });
  return (
    <Panel title="Comandos de banco" className="tactics-inline">
      <div className="inline-fields">
        <label>
          Ritmo
          <input
            type="range"
            min="25"
            max="85"
            value={career.tactics.pace}
            onChange={(e) => set('pace', Number(e.target.value))}
          />
          <b>{career.tactics.pace}</b>
        </label>
        <label>
          Defesa
          <select
            value={career.tactics.defense}
            onChange={(e) => set('defense', e.target.value)}
          >
            <option>Trocas seletivas</option>
            <option>Proteção de aro</option>
            <option>Pressão na bola</option>
          </select>
        </label>
        <label>
          Foco
          <select
            value={career.tactics.focus}
            onChange={(e) => set('focus', e.target.value)}
          >
            <option>Ataque ao aro</option>
            <option>Bola de três</option>
            <option>Poste baixo</option>
          </select>
        </label>
      </div>
    </Panel>
  );
}

function App() {
  const [introComplete, setIntroComplete] = useState(false);
  const [musicEnabled, setMusicEnabled] = useState(
    () => localStorage.getItem('vale-music-enabled') !== 'false',
  );
  const [musicVolume, setMusicVolume] = useState(() => {
    const saved = localStorage.getItem('vale-music-volume');
    const parsed = Number(saved);
    return saved === null || !Number.isFinite(parsed)
      ? 0.3
      : Math.min(1, Math.max(0, parsed));
  });
  const [career, setCareer] = useState<CareerV2 | null>(() => loadCareer());
  const [screen, setScreen] = useState<Screen>(() =>
    loadCareer() ? 'dashboard' : 'landing',
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [playerId, setPlayerId] = useState<number | null>(null);
  const commit = (next: CareerV2) => {
    setCareer(next);
    persistCareer(next);
  };
  useEffect(() => {
    localStorage.setItem('vale-music-enabled', String(musicEnabled));
  }, [musicEnabled]);
  useEffect(() => {
    localStorage.setItem('vale-music-volume', String(musicVolume));
  }, [musicVolume]);
  const newCareer = (draft: CreatorDraft) => {
    const save = makeCareer(teamByAbbr(draft.teamAbbr), {
      name: draft.name.trim() || 'Manager Vale',
      origin: draft.origin,
      experience: draft.experience,
      style: draft.style,
      avatar: draft.avatar,
      reputation: 50,
    });
    commit(save);
    setScreen('dashboard');
  };
  if (!introComplete)
    return <IntroGate onComplete={() => setIntroComplete(true)} />;
  if (!career && screen === 'creator')
    return <Creator onCreate={newCareer} onBack={() => setScreen('landing')} />;
  if (!career) return <Landing onStart={() => setScreen('creator')} />;
  const ownTeam = teamByAbbr(career.teamAbbr);
  const ownRoster = roster(career.teamAbbr, career);
  const open = (to: Screen) => {
    setScreen(to);
    setMenuOpen(false);
    setPlayerId(null);
  };
  const activePlayer = ownRoster.find((player) => player.id === playerId);
  return (
    <div
      className={`app-shell ${career.world.accessibility.highContrast ? 'high-contrast' : ''} ${career.world.accessibility.reducedMotion ? 'reduced-motion' : ''}`}
      style={
        {
          '--team-primary': ownTeam.primary,
          '--team-secondary': ownTeam.secondary,
          '--screen-bg': `url(${img(`assets/backgrounds/${backgroundByScreen[screen as Exclude<Screen, 'landing' | 'creator'>]}`)})`,
        } as React.CSSProperties
      }
    >
      <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="brand">
          <span>V</span>
          <div>
            <b>VALE</b>
            <small>BASKET MANAGER</small>
          </div>
          <button className="mobile-close" onClick={() => setMenuOpen(false)}>
            <X />
          </button>
        </div>
        <div className="manager-mini">
          <img
            src={img(`assets/managers/${career.manager.avatar}`)}
            alt="Manager"
          />
          <div>
            <b>{career.manager.name}</b>
            <small>{ownTeam.name}</small>
          </div>
        </div>
        {nav.map(([group, items]) => (
          <div className="nav-group" key={group}>
            <p>
              {t(
                career.language,
                group as 'team' | 'competition' | 'office' | 'career',
              )}
            </p>
            {items.map(([id, label, Icon]) => (
              <button
                className={screen === id ? 'active' : ''}
                onClick={() => open(id as Screen)}
                key={id}
              >
                <Icon size={16} />
                {t(
                  career.language,
                  label as
                    | 'home'
                    | 'roster'
                    | 'rotation'
                    | 'tactics'
                    | 'training'
                    | 'staff'
                    | 'gameCenter'
                    | 'calendar'
                    | 'league'
                    | 'stats'
                    | 'market'
                    | 'scouting'
                    | 'draft'
                    | 'finances'
                    | 'board'
                    | 'media'
                    | 'profile'
                    | 'settings'
                    | 'licenses',
                )}
              </button>
            ))}
          </div>
        ))}
        <div className="sidebar-bottom">
          <button
            onClick={() => {
              if (
                confirm('Apagar apenas o save Simulation v3 deste navegador?')
              ) {
                localStorage.removeItem('vale-basket-manager-career-v3');
                setCareer(null);
                setScreen('landing');
              }
            }}
          >
            <RotateCcw size={16} /> Reiniciar save
          </button>
        </div>
      </aside>
      <main className="workspace">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMenuOpen(true)}>
            <Menu />
          </button>
          <div className="crumb">
            <span>
              {t(career.language, 'season')} · {career.engineVersion}
            </span>
            <b>
              {ownTeam.city} {ownTeam.nickname}
            </b>
          </div>
          <div className="top-actions">
            <select
              value={career.language}
              onChange={(e) =>
                commit({ ...career, language: e.target.value as Language })
              }
              aria-label="Idioma"
            >
              <option value="pt-BR">PT</option>
              <option value="en">EN</option>
              <option value="es">ES</option>
            </select>
            <button className="manager-chip" onClick={() => open('profile')}>
              <img
                src={img(`assets/managers/${career.manager.avatar}`)}
                alt=""
              />
              {career.manager.name}
            </button>
          </div>
        </header>
        <div className="content">
          {screen === 'settings' ? (
            <SettingsScreen
              enabled={musicEnabled}
              volume={musicVolume}
              onEnabled={setMusicEnabled}
              onVolume={setMusicVolume}
            />
          ) : activePlayer ? (
            <PlayerProfile
              player={activePlayer}
              career={career}
              onBack={() => setPlayerId(null)}
            />
          ) : (
            <ScreenContent
              screen={screen}
              career={career}
              ownTeam={ownTeam}
              ownRoster={ownRoster}
              upcoming={nextTeamFixture(career)}
              commit={commit}
              open={open}
              selectPlayer={setPlayerId}
            />
          )}
        </div>
      </main>
      <Soundtrack
        enabled={musicEnabled}
        volume={musicVolume}
        onEnabled={setMusicEnabled}
        onVolume={setMusicVolume}
        onOpenSettings={() => open('settings')}
      />
    </div>
  );
}

function Landing({ onStart }: { onStart: () => void }) {
  return (
    <main className="landing">
      <div className="landing-overlay" />
      <nav>
        <div className="brand">
          <span>V</span>
          <div>
            <b>VALE</b>
            <small>BASKET MANAGER</small>
          </div>
        </div>
        <span className="season-badge">2026–27 FOUNDATION</span>
      </nav>
      <section>
        <p className="eyebrow">DREAM · DRAFT · BUILD · WIN</p>
        <h1>
          COMANDE A SUA
          <br />
          <em>DINASTIA.</em>
        </h1>
        <p>
          Uma carreira de basquete com pacote oficial local, liga viva, Game
          Center e gestão de longo prazo.
        </p>
        <button className="gold-button large" onClick={onStart}>
          <Play size={18} /> Criar carreira
        </button>
        <div className="landing-features">
          <span>
            <Gamepad2 /> Game Center por eventos
          </span>
          <span>
            <CalendarDays /> 82 jogos por franquia
          </span>
          <span>
            <ShieldCheck /> Save local e PWA
          </span>
        </div>
      </section>
    </main>
  );
}

function ScreenContent({
  screen,
  career,
  ownTeam,
  ownRoster,
  upcoming,
  commit,
  open,
  selectPlayer,
}: {
  screen: Screen;
  career: CareerV2;
  ownTeam: Team;
  ownRoster: Player[];
  upcoming?: Fixture;
  commit: (next: CareerV2) => void;
  open: (screen: Screen) => void;
  selectPlayer: (id: number) => void;
}) {
  if (screen === 'dashboard')
    return (
      <Dashboard
        career={career}
        team={ownTeam}
        roster={ownRoster}
        upcoming={upcoming}
        open={open}
      />
    );
  if (screen === 'roster')
    return (
      <Roster career={career} roster={ownRoster} selectPlayer={selectPlayer} />
    );
  if (screen === 'rotation')
    return <Rotation career={career} roster={ownRoster} commit={commit} />;
  if (screen === 'tactics')
    return <TacticsScreen career={career} commit={commit} />;
  if (screen === 'training')
    return <Training career={career} commit={commit} />;
  if (screen === 'staff') return <Staff career={career} commit={commit} />;
  if (screen === 'game') return <GameCenter career={career} commit={commit} />;
  if (screen === 'calendar')
    return (
      <Calendar career={career} team={ownTeam} open={open} commit={commit} />
    );
  if (screen === 'league') return <League career={career} />;
  if (screen === 'stats') return <Stats career={career} />;
  if (screen === 'market') return <Market career={career} commit={commit} />;
  if (screen === 'scouting' || screen === 'draft')
    return <Draft career={career} commit={commit} mode={screen} />;
  if (screen === 'finances') return <Finances career={career} />;
  if (screen === 'board') return <Board career={career} />;
  if (screen === 'world') return <World career={career} commit={commit} />;
  if (screen === 'media') return <Media career={career} />;
  if (screen === 'profile') return <Profile career={career} />;
  if (screen === 'history') return <History career={career} />;
  return <Licenses />;
}

function Dashboard({
  career,
  team,
  roster: ownRoster,
  upcoming,
  open,
}: {
  career: CareerV2;
  team: Team;
  roster: Player[];
  upcoming?: Fixture;
  open: (screen: Screen) => void;
}) {
  const opponent = upcoming
    ? teamByAbbr(upcoming.home === team.abbr ? upcoming.away : upcoming.home)
    : null;
  return (
    <>
      <section
        className="hero-banner"
        style={{
          backgroundImage: `linear-gradient(90deg, #020711f5 0%, ${team.primary}dd 48%, #02071177 100%), url(${img('assets/backgrounds/team-arena.png')})`,
        }}
      >
        <div>
          <p className="eyebrow">CENTRAL DA CARREIRA</p>
          <h1>
            {team.city} <em>{team.nickname}</em>
          </h1>
          <p>
            {career.manager.name} · {career.manager.style} · Objetivo:{' '}
            {career.boardObjective}
          </p>
          {upcoming && opponent && (
            <button className="gold-button" onClick={() => open('game')}>
              <Gamepad2 size={17} /> Próximo jogo:{' '}
              {upcoming.home === team.abbr ? 'vs' : '@'} {opponent.abbr}
            </button>
          )}
        </div>
        <TeamMark team={team} />
      </section>
      <nav className="cinematic-actions" aria-label="Atalhos principais">
        <button className="featured" onClick={() => open('game')}>
          <span><Gamepad2 /></span>
          <div><b>Game Day</b><small>Entre na arena</small></div>
          <Play />
        </button>
        <button onClick={() => open('roster')}>
          <span><Users /></span>
          <div><b>Meu elenco</b><small>Jogadores e funções</small></div>
        </button>
        <button onClick={() => open('market')}>
          <span><Handshake /></span>
          <div><b>Mercado</b><small>Construa o próximo movimento</small></div>
        </button>
        <button onClick={() => open('league')}>
          <span><Trophy /></span>
          <div><b>Liga</b><small>Classificação e líderes</small></div>
        </button>
      </nav>
      <div className="stat-grid">
        <StatCard
          label="Registro"
          value={`${career.record.wins}–${career.record.losses}`}
          detail="Temporada regular"
          icon={Trophy}
        />
        <StatCard
          label="Química"
          value={`${career.chemistry}%`}
          detail="Vestiário"
          icon={Users}
        />
        <StatCard
          label="Humor da torcida"
          value={`${career.fanMood}%`}
          detail="Engajamento"
          icon={HeartPulse}
        />
        <StatCard
          label="Orçamento operacional"
          value={money(career.budget)}
          detail="Não é folha salarial"
          icon={CircleDollarSign}
        />
      </div>
      <div className="dashboard-grid">
        <Panel
          title="Próximo compromisso"
          action={
            <button className="text-button" onClick={() => open('calendar')}>
              Calendário
            </button>
          }
        >
          {upcoming && opponent ? (
            <div className="matchup">
              <div>
                <TeamMark team={team} />
                <b>{team.abbr}</b>
              </div>
              <section>
                <span>{dateLabel(upcoming.date)}</span>
                <strong>{upcoming.home === team.abbr ? 'CASA' : 'FORA'}</strong>
                <small>Game Center com placar, PBP e box score</small>
              </section>
              <div>
                <TeamMark team={opponent} />
                <b>{opponent.abbr}</b>
              </div>
            </div>
          ) : (
            <div className="empty-state">Sem jogos pendentes.</div>
          )}
        </Panel>
        <Panel
          title="Núcleo da franquia"
          action={
            <button className="text-button" onClick={() => open('roster')}>
              Ver elenco completo
            </button>
          }
        >
          <div className="franchise-core">
            {ownRoster.slice(0, 3).map((player, index) => (
              <article key={player.id}>
                <span>{index === 0 ? 'FRANCHISE' : index === 1 ? 'IMPACTO' : 'NÚCLEO'}</span>
                <PlayerFace player={player} />
                <div>
                  <b>{player.name}</b>
                  <small>{player.position} · #{player.jersey || '—'}</small>
                </div>
                <strong>{player.overall}</strong>
              </article>
            ))}
          </div>
        </Panel>
        <Panel
          title="Feed da liga"
          className="news-preview"
          action={
            <button className="text-button" onClick={() => open('media')}>
              Abrir mídia
            </button>
          }
        >
          {career.news.slice(0, 3).map((news) => (
            <article key={news.id}>
              <span>{news.category.toUpperCase()}</span>
              <b>{news.title}</b>
              <p>{news.body}</p>
            </article>
          ))}
        </Panel>
        <Panel
          title="Plano semanal"
          action={
            <button className="text-button" onClick={() => open('training')}>
              Treino
            </button>
          }
        >
          <div className="week-plan">
            {career.training.sessions.map((session, index) => (
              <div key={session}>
                <b>D{index + 1}</b>
                <span>{session}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}

function Roster({
  career,
  roster: ownRoster,
  selectPlayer,
}: {
  career: CareerV2;
  roster: Player[];
  selectPlayer: (id: number) => void;
}) {
  return (
    <>
      <PageTitle
        kicker="TIME"
        title="Elenco e desenvolvimento"
        copy="Dados oficiais do pacote local. Contratos e payroll sem fonte licenciada são mostrados como não carregados."
      />
      <Panel title={`${ownRoster.length} atletas ativos`}>
        <div className="roster-table">
          <table>
            <thead>
              <tr>
                <th>Atleta</th>
                <th>POS</th>
                <th>OVR</th>
                <th>MIN</th>
                <th>PTS</th>
                <th>REB</th>
                <th>AST</th>
                <th>Saúde</th>
              </tr>
            </thead>
            <tbody>
              {ownRoster.map((player) => {
                const s = career.playerStats[player.id] ?? blankStats();
                const health = career.health[player.id];
                return (
                  <tr key={player.id}>
                    <td>
                      <button
                        className="player-link"
                        onClick={() => selectPlayer(player.id)}
                      >
                        <PlayerFace player={player} small />
                        <span>
                          <b>{player.name}</b>
                          <small>
                            #{player.jersey || '—'} · {player.country}
                          </small>
                        </span>
                      </button>
                    </td>
                    <td>{player.position}</td>
                    <td>
                      <b className="rating">{player.overall}</b>
                    </td>
                    <td>{statAverage(s, 'min')}</td>
                    <td>{statAverage(s, 'pts')}</td>
                    <td>{statAverage(s, 'reb')}</td>
                    <td>{statAverage(s, 'ast')}</td>
                    <td>
                      <span
                        className={health?.injury ? 'health bad' : 'health'}
                      >
                        {health?.injury ?? `${health?.condition ?? 90}%`}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
function Rotation({
  career,
  roster: ownRoster,
  commit,
}: {
  career: CareerV2;
  roster: Player[];
  commit: (next: CareerV2) => void;
}) {
  const minutes = career.rotation.reduce(
    (sum, entry) => sum + entry.minutes,
    0,
  );
  const change = (id: number, value: number) =>
    commit({
      ...career,
      rotation: career.rotation.map((entry) =>
        entry.playerId === id ? { ...entry, minutes: value } : entry,
      ),
    });
  return (
    <>
      <PageTitle
        kicker="TIME"
        title="Rotação de 240 minutos"
        copy="Ajuste a carga. O motor usa esta rotação quando seu time entra em quadra."
      />
      <div className="rotation-summary">
        <b>{minutes} / 240 MIN</b>
        <div>
          <i style={{ width: `${Math.min(100, minutes / 2.4)}%` }} />
        </div>
        <span>
          {minutes === 240
            ? 'Rotação equilibrada.'
            : 'A soma ideal é 240 minutos.'}
        </span>
      </div>
      <Panel title="Minutagem e papéis">
        {career.rotation.map((entry) => {
          const player = ownRoster.find(
            (candidate) => candidate.id === entry.playerId,
          );
          if (!player) return null;
          return (
            <div className="rotation-row" key={entry.playerId}>
              <PlayerFace player={player} small />
              <b>{player.name}</b>
              <span>{entry.role}</span>
              <input
                type="range"
                min="0"
                max="40"
                value={entry.minutes}
                onChange={(e) => change(player.id, Number(e.target.value))}
              />
              <strong>{entry.minutes}</strong>
              <select
                value={entry.role}
                onChange={(e) =>
                  commit({
                    ...career,
                    rotation: career.rotation.map((item) =>
                      item.playerId === player.id
                        ? {
                            ...item,
                            role: e.target.value as RotationEntry['role'],
                          }
                        : item,
                    ),
                  })
                }
              >
                <option>Starter</option>
                <option>Rotation</option>
                <option>Reserve</option>
              </select>
            </div>
          );
        })}
      </Panel>
    </>
  );
}
function TacticsScreen({
  career,
  commit,
}: {
  career: CareerV2;
  commit: (next: CareerV2) => void;
}) {
  const set = (key: keyof CareerV2['tactics'], value: string | number) =>
    commit({ ...career, tactics: { ...career.tactics, [key]: value } });
  return (
    <>
      <PageTitle
        kicker="TIME"
        title="Táticas e plano de jogo"
        copy="As escolhas são persistidas e alimentam o motor do Game Center."
      />
      <Panel title="Identidade de quadra">
        <div className="tactics-grid">
          <label>
            Ritmo <output>{career.tactics.pace}</output>
            <input
              type="range"
              min="25"
              max="85"
              value={career.tactics.pace}
              onChange={(e) => set('pace', Number(e.target.value))}
            />
          </label>
          {(
            [
              ['offense', 'Ataque', ['Equilibrado', '5-out', 'Poste baixo']],
              [
                'defense',
                'Defesa',
                ['Trocas seletivas', 'Proteção de aro', 'Pressão na bola'],
              ],
              [
                'rebounding',
                'Rebotes',
                ['Proteção de aro', 'Ataque ao rebote', 'Transição segura'],
              ],
              [
                'focus',
                'Foco',
                ['Ataque ao aro', 'Bola de três', 'Poste baixo'],
              ],
            ] as const
          ).map(([key, label, options]) => (
            <label key={key}>
              {label}
              <select
                value={career.tactics[key]}
                onChange={(e) => set(key, e.target.value)}
              >
                {options.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
          ))}
        </div>
        <div className="tactic-callouts">
          <span>
            <Shield /> Defesa: {career.tactics.defense}
          </span>
          <span>
            <Activity /> Ritmo: {career.tactics.pace}
          </span>
          <span>
            <Cpu /> Foco: {career.tactics.focus}
          </span>
        </div>
      </Panel>
    </>
  );
}
function Training({
  career,
  commit,
}: {
  career: CareerV2;
  commit: (next: CareerV2) => void;
}) {
  const sessions = [
    'Técnica individual',
    'Defesa coletiva',
    'Recuperação',
    'Força funcional',
    'Vídeo e scouting',
  ];
  const swap = (index: number, session: string) => {
    const next = [...career.training.sessions];
    next[index] = session;
    commit({ ...career, training: { ...career.training, sessions: next } });
  };
  return (
    <>
      <PageTitle
        kicker="TIME"
        title="Treino e carga"
        copy="Planeje a semana e proteja a condição dos atletas. O efeito é aplicado ao confirmar cada sessão."
      />
      <div className="training-layout">
        <Panel title="Semana de trabalho">
          {career.training.sessions.map((current, index) => (
            <label className="session-row" key={`${current}-${index}`}>
              <b>DIA {index + 1}</b>
              <select
                value={current}
                onChange={(e) => swap(index, e.target.value)}
              >
                {sessions.map((session) => (
                  <option key={session}>{session}</option>
                ))}
              </select>
            </label>
          ))}
          <label className="load-control">
            Carga coletiva <b>{career.training.load}</b>
            <input
              type="range"
              min="25"
              max="85"
              value={career.training.load}
              onChange={(e) =>
                commit({
                  ...career,
                  training: {
                    ...career.training,
                    load: Number(e.target.value),
                  },
                })
              }
            />
          </label>
          <button
            className="gold-button"
            onClick={() =>
              commit({
                ...career,
                chemistry: Math.min(100, career.chemistry + 2),
                health: Object.fromEntries(
                  Object.entries(career.health).map(([id, health]) => [
                    id,
                    {
                      ...health,
                      fatigue: Math.min(
                        100,
                        health.fatigue + Math.round(career.training.load / 18),
                      ),
                      condition: Math.max(
                        55,
                        health.condition -
                          Math.round(career.training.load / 28),
                      ),
                    },
                  ]),
                ),
                news: [
                  {
                    id: `training-${Date.now()}`,
                    date: career.currentDate,
                    category: 'team',
                    title: 'Sessões semanais concluídas',
                    body: 'A equipe assimilou a carga de treino; fadiga e condição foram atualizadas.',
                  },
                  ...career.news,
                ],
              })
            }
          >
            Confirmar semana
          </button>
        </Panel>
        <Panel title="Centro de performance">
          <img
            className="panel-image"
            src={img('assets/backgrounds/training-center.png')}
            alt="Centro de treinamento"
          />
          <p>
            Indicadores de fadiga e prevenção são internos ao jogo. Não são
            dados médicos reais.
          </p>
        </Panel>
      </div>
    </>
  );
}
function Staff({
  career,
  commit,
}: {
  career: CareerV2;
  commit: (next: CareerV2) => void;
}) {
  return (
    <>
      <PageTitle
        kicker="TIME"
        title="Staff técnico"
        copy="Profissionais fictícios de desenvolvimento (DEV), separados de qualquer licença oficial."
      />
      <div className="staff-grid">
        {career.staff.map((staff, index) => (
          <Panel title={staff.role} key={staff.role}>
            <div className="staff-card">
              <UserRound />
              <div>
                <b>{staff.name}</b>
                <p>{staff.impact}</p>
                <span>Nível {staff.level}/5</span>
              </div>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              value={staff.level}
              onChange={(e) =>
                commit({
                  ...career,
                  staff: career.staff.map((item, itemIndex) =>
                    itemIndex === index
                      ? { ...item, level: Number(e.target.value) }
                      : item,
                  ),
                })
              }
            />
          </Panel>
        ))}
      </div>
    </>
  );
}
function Calendar({
  career,
  team,
  open,
  commit,
}: {
  career: CareerV2;
  team: Team;
  open: (screen: Screen) => void;
  commit: (next: CareerV2) => void;
}) {
  const games = career.fixtures.filter(
    (fixture) => fixture.home === team.abbr || fixture.away === team.abbr,
  );
  const played = games.filter((game) => game.status === 'played').length;
  const regularDone = played === 82;
  const sim = (rounds: number) =>
    commit(simulateRounds(career, players, rounds));
  return (
    <>
      <PageTitle
        kicker="COMPETIÇÃO"
        title={`Temporada ${career.seasonNumber} · 82 jogos`}
        copy="Fast Sim, Key Moments e Live Game Center usam o mesmo motor lógico determinístico."
      />
      <Panel
        title={`${played} de 82 jogos concluídos`}
        action={
          <div className="calendar-actions">
            {!regularDone && (
              <>
                <button className="ghost-button" onClick={() => sim(1)}>
                  Simular rodada
                </button>
                <button className="ghost-button" onClick={() => sim(5)}>
                  Simular 5 rodadas
                </button>
                <button
                  className="gold-button small-button"
                  onClick={() => open('game')}
                >
                  Live Game Center
                </button>
              </>
            )}
            {regularDone && career.playoffs.length === 0 && (
              <button
                className="gold-button"
                onClick={() =>
                  commit(simulatePostseason(career, players, teams))
                }
              >
                Simular playoffs completos
              </button>
            )}
            {career.playoffs.some(
              (series) => series.round === 4 && series.winner,
            ) && (
              <button
                className="gold-button"
                onClick={() => commit(advanceOffseason(career, players, teams))}
              >
                Avançar offseason
              </button>
            )}
          </div>
        }
      >
        <div className="schedule-list">
          {games
            .filter((fixture) => fixture.status === 'scheduled')
            .slice(0, 18)
            .concat(
              games.filter((fixture) => fixture.status === 'played').slice(-10),
            )
            .map((fixture) => {
              const opponent = teamByAbbr(
                fixture.home === team.abbr ? fixture.away : fixture.home,
              );
              return (
                <article key={fixture.id} className={fixture.status}>
                  <span>{dateLabel(fixture.date)}</span>
                  <TeamMark team={opponent} small />
                  <b>
                    {fixture.home === team.abbr ? 'vs' : '@'} {opponent.name}
                  </b>
                  <em>
                    {fixture.status === 'played'
                      ? `${fixture.homeScore}–${fixture.awayScore}`
                      : 'AGENDADO'}
                  </em>
                </article>
              );
            })}
        </div>
        <p className="minor-note">
          O histórico concluído e o calendário integral permanecem no save v3.
        </p>
      </Panel>
    </>
  );
}
function League({ career }: { career: CareerV2 }) {
  const [view, setView] = useState<'all' | 'East' | 'West'>('all');
  const sorted = standingsSorted(career.standings).filter(
    (record) => view === 'all' || teamByAbbr(record.team).conference === view,
  );
  const dayGames = career.fixtures.filter(
    (fixture) => fixture.date === career.currentDate,
  );
  return (
    <>
      <PageTitle
        kicker="COMPETIÇÃO"
        title="Liga viva"
        copy="Classificação, placares, líderes e playoffs são atualizados pelo motor SIMULATION."
      />
      <div className="league-grid">
        <Panel
          title="Classificação"
          action={
            <div className="tab-pills">
              {(['all', 'East', 'West'] as const).map((key) => (
                <button
                  key={key}
                  onClick={() => setView(key)}
                  className={view === key ? 'active' : ''}
                >
                  {key === 'all' ? 'Geral' : key === 'East' ? 'Leste' : 'Oeste'}
                </button>
              ))}
            </div>
          }
        >
          <table className="standing-table">
            <thead>
              <tr>
                <th>#</th>
                <th>TIME</th>
                <th>V</th>
                <th>D</th>
                <th>%</th>
                <th>DIFF</th>
                <th>SEQ</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((record, index) => (
                <tr
                  className={record.team === career.teamAbbr ? 'own-row' : ''}
                  key={record.team}
                >
                  <td>{index + 1}</td>
                  <td>
                    <TeamMark team={teamByAbbr(record.team)} small />
                    {record.team}
                  </td>
                  <td>{record.wins}</td>
                  <td>{record.losses}</td>
                  <td>
                    {record.wins + record.losses
                      ? (record.wins / (record.wins + record.losses))
                          .toFixed(3)
                          .replace('0.', '.')
                      : '.000'}
                  </td>
                  <td>
                    {record.pf - record.pa >= 0 ? '+' : ''}
                    {record.pf - record.pa}
                  </td>
                  <td>
                    {record.streak > 0
                      ? `W${record.streak}`
                      : record.streak < 0
                        ? `L${Math.abs(record.streak)}`
                        : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
        <Panel title={`Jogos de ${dateLabel(career.currentDate)}`}>
          {dayGames.length ? (
            <div className="league-games">
              {dayGames.map((game) => (
                <p key={game.id}>
                  <span>
                    {game.away} @ {game.home}
                  </span>
                  <b>
                    {game.status === 'played'
                      ? `${game.awayScore}–${game.homeScore}`
                      : 'AGENDADO'}
                  </b>
                </p>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              A próxima rodada será atualizada ao jogar seu próximo compromisso.
            </div>
          )}
        </Panel>
      </div>
      <Leaders career={career} />
      <PlayoffBoard career={career} />
    </>
  );
}
function PlayoffBoard({ career }: { career: CareerV2 }) {
  const regularDone = !career.fixtures.some(
    (fixture) => fixture.status === 'scheduled',
  );
  if (!regularDone && career.playoffs.length === 0)
    return (
      <Panel title="Playoffs">
        <div className="empty-state">
          <Trophy />
          <h3>Temporada regular em andamento</h3>
          <p>Seeds são definidos após 82 jogos.</p>
        </div>
      </Panel>
    );
  return (
    <Panel title="Chave de playoffs">
      <div className="playoff-board">
        {career.playoffs.map((series) => (
          <article key={series.id}>
            <span>
              {series.conference} · R{series.round}
            </span>
            <b>
              {series.higherSeed} <em>{series.higherWins}</em>
            </b>
            <b>
              {series.lowerSeed} <em>{series.lowerWins}</em>
            </b>
            {series.winner && <small>Vencedor: {series.winner}</small>}
          </article>
        ))}
      </div>
    </Panel>
  );
}
function Leaders({ career }: { career: CareerV2 }) {
  const categories: [string, keyof StatLine][] = [
    ['Pontos', 'pts'],
    ['Rebotes', 'reb'],
    ['Assistências', 'ast'],
    ['Roubos', 'stl'],
  ];
  return (
    <Panel title="Líderes da temporada">
      <div className="leader-grid">
        {categories.map(([label, key]) => {
          const list = allCareerPlayers(career)
            .map((player) => ({
              player,
              line: career.playerStats[player.id] ?? blankStats(),
            }))
            .filter((entry) => entry.line.gp > 0)
            .sort((a, b) => b.line[key] / b.line.gp - a.line[key] / a.line.gp)
            .slice(0, 3);
          return (
            <article key={label}>
              <p>{label}</p>
              {list.length ? (
                list.map(({ player, line }, index) => (
                  <div key={player.id}>
                    <b>{index + 1}</b>
                    <PlayerFace player={player} small />
                    <span>{player.name}</span>
                    <strong>{(line[key] / line.gp).toFixed(1)}</strong>
                  </div>
                ))
              ) : (
                <small>Jogue partidas para gerar líderes.</small>
              )}
            </article>
          );
        })}
      </div>
    </Panel>
  );
}
function Stats({ career }: { career: CareerV2 }) {
  const list = allCareerPlayers(career)
    .map((player) => ({
      player,
      stat: career.playerStats[player.id] ?? blankStats(),
    }))
    .filter((entry) => entry.stat.gp > 0)
    .sort((a, b) => b.stat.pts / b.stat.gp - a.stat.pts / a.stat.gp);
  return (
    <>
      <PageTitle
        kicker="COMPETIÇÃO"
        title="Estatísticas da temporada"
        copy="Cada linha vem de box scores gerados por eventos de jogo; não há números pré-preenchidos."
      />
      <Panel title="Liga · médias por jogo">
        <div className="roster-table">
          <table>
            <thead>
              <tr>
                <th>Jogador</th>
                <th>J</th>
                <th>PTS</th>
                <th>REB</th>
                <th>AST</th>
                <th>FG%</th>
                <th>3PT%</th>
              </tr>
            </thead>
            <tbody>
              {list.length ? (
                list.slice(0, 40).map(({ player, stat }) => (
                  <tr key={player.id}>
                    <td>
                      <PlayerFace player={player} small />
                      {player.name}
                    </td>
                    <td>{stat.gp}</td>
                    <td>
                      <b>{statAverage(stat, 'pts')}</b>
                    </td>
                    <td>{statAverage(stat, 'reb')}</td>
                    <td>{statAverage(stat, 'ast')}</td>
                    <td>{pct(stat.fgm, stat.fga)}</td>
                    <td>{pct(stat.tpm, stat.tpa)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="empty-cell">
                    Sem estatísticas ainda. Use o Game Center para iniciar a
                    temporada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
function Market({
  career,
  commit,
}: {
  career: CareerV2;
  commit: (next: CareerV2) => void;
}) {
  const freeAgents = allCareerPlayers(career)
    .filter((player) =>
      ['free-agent', 'waived'].includes(
        career.economy.contracts[player.id]?.status,
      ),
    )
    .slice(0, 12);
  const own = roster(career.teamAbbr, career);
  const rival = teams.find((team) => team.abbr !== career.teamAbbr)!;
  const rivalRoster = roster(rival.abbr, career);
  const [ownId, setOwnId] = useState(own[0]?.id ?? 0);
  const [rivalId, setRivalId] = useState(rivalRoster[0]?.id ?? 0);
  const propose = () => {
    const proposal = evaluateTrade(
      career.economy,
      career.playerModels,
      [
        { kind: 'player', id: String(ownId), team: career.teamAbbr },
        { kind: 'player', id: String(rivalId), team: rival.abbr },
      ],
      [career.teamAbbr, rival.abbr],
    );
    commit({ ...career, tradeDesk: [proposal, ...career.tradeDesk] });
  };
  const executeTrade = (proposal: TradeProposal) => {
    if (!proposal.valid) return;
    const next = structuredClone(career);
    const assets = proposal.outgoing.filter((asset) => asset.kind === 'player');
    if (assets.length !== 2) return;
    const [first, second] = assets;
    next.economy.contracts[Number(first.id)].team = second.team;
    next.economy.contracts[Number(second.id)].team = first.team;
    next.rotation = next.rotation.filter(
      (entry) => entry.playerId !== Number(first.id),
    );
    if (second.team !== career.teamAbbr) {
      next.rotation.push({
        playerId: Number(second.id),
        minutes: 14,
        role: 'Rotation',
      });
    }
    next.tradeDesk = next.tradeDesk.map((item) =>
      item.id === proposal.id
        ? {
            ...item,
            valid: false,
            reasons: ['Troca executada e registrada no save.'],
          }
        : item,
    );
    next.news.unshift({
      id: `trade-done-${proposal.id}`,
      date: next.currentDate,
      category: 'market',
      title: 'Troca concluída pela Trade Machine',
      body: 'Contratos, elencos e rotação foram atualizados pelo ruleset SIMULATION.',
    });
    commit(next);
  };
  const sign = (player: Player) => {
    if (own.length >= 18) return alert('Roster no limite máximo do ruleset.');
    const next = structuredClone(career);
    next.economy.contracts[player.id] = {
      ...next.economy.contracts[player.id],
      team: career.teamAbbr,
      status: 'active',
      years: 1,
      source: 'SIMULATION',
    };
    next.health[player.id] = { fatigue: 10, condition: 94 };
    next.rotation.push({ playerId: player.id, minutes: 0, role: 'Reserve' });
    next.news.unshift({
      id: `fa-${player.id}`,
      date: next.currentDate,
      category: 'market',
      title: `${player.name} assina contrato de simulação`,
      body: 'Contrato de gameplay gerado pelo ruleset SIMULATION; não representa contrato oficial real.',
    });
    commit(next);
  };
  return (
    <>
      <PageTitle
        kicker="FRONT OFFICE"
        title="Mercado, contratos e trocas"
        copy="Nomes e elencos vêm do pacote oficial local. Valores marcados SIMULATION são contratos de gameplay, não dados contratuais oficiais."
      />
      <div className="office-grid">
        <Panel title="Agentes livres">
          <div className="market-list">
            {freeAgents.length ? (
              freeAgents.map((player) => (
                <article key={player.id}>
                  <PlayerFace player={player} small />
                  <div>
                    <b>{player.name}</b>
                    <small>
                      {player.position} · OVR {player.overall}
                    </small>
                  </div>
                  <span>
                    SIM ·{' '}
                    {money(career.economy.contracts[player.id]?.salary ?? 0)} /{' '}
                    {career.economy.contracts[player.id]?.years} ano(s)
                  </span>
                  <button className="ghost-button" onClick={() => sign(player)}>
                    Negociar e assinar
                  </button>
                </article>
              ))
            ) : (
              <p>Não há agentes livres disponíveis neste momento.</p>
            )}
          </div>
        </Panel>
        <Panel title="Trade Machine">
          <Handshake size={42} className="gold" />
          <p>
            A IA avalia idade simulada, potencial oculto, contrato, payroll e
            restrições do apron.
          </p>
          <div className="trade-builder">
            <label>
              {career.teamAbbr}
              <select
                value={ownId}
                onChange={(e) => setOwnId(Number(e.target.value))}
              >
                {own.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name}
                  </option>
                ))}
              </select>
            </label>
            <strong>⇄</strong>
            <label>
              {rival.abbr}
              <select
                value={rivalId}
                onChange={(e) => setRivalId(Number(e.target.value))}
              >
                {rivalRoster.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button className="gold-button" onClick={propose}>
            Validar proposta
          </button>
          {career.tradeDesk.slice(0, 3).map((proposal) => (
            <div
              className={proposal.valid ? 'trade-result valid' : 'trade-result'}
              key={proposal.id}
            >
              <b>
                {proposal.valid ? 'VÁLIDA' : 'REPROVADA'} · score{' '}
                {proposal.score}
              </b>
              {proposal.reasons.map((reason) => (
                <span key={reason}>{reason}</span>
              ))}
              {proposal.valid && (
                <button
                  className="ghost-button"
                  onClick={() => executeTrade(proposal)}
                >
                  Confirmar e executar troca
                </button>
              )}
            </div>
          ))}
        </Panel>
      </div>
      <Panel title="Contratos do elenco · valores SIMULATION">
        <div className="contract-grid">
          {own.map((player) => {
            const contract = career.economy.contracts[player.id];
            return (
              <article key={player.id}>
                <PlayerFace player={player} small />
                <span>
                  <b>{player.name}</b>
                  <small>
                    {contract.years} ano(s) ·{' '}
                    {contract.option
                      ? `opção ${contract.option}`
                      : 'garantido SIM'}
                  </small>
                </span>
                <strong>{money(contract.salary)}</strong>
              </article>
            );
          })}
        </div>
      </Panel>
    </>
  );
}
function Draft({
  career,
  commit,
  mode,
}: {
  career: CareerV2;
  commit: (next: CareerV2) => void;
  mode: 'scouting' | 'draft';
}) {
  const title = mode === 'draft' ? 'Draft Board' : 'Scouting internacional';
  return (
    <>
      <PageTitle
        kicker="FRONT OFFICE"
        title={title}
        copy="Prospectos e avaliações são ficcionais (DEV), devidamente separados dos dados oficiais do elenco."
      />
      <Panel
        title={
          mode === 'draft'
            ? `Big Board ${2026 + career.seasonNumber}`
            : 'Atribuições de scouting'
        }
        action={<span className="dev-badge">DEV FICTÍCIO</span>}
      >
        {mode === 'scouting' && (
          <div className="scouting-actions">
            <button
              className="ghost-button"
              onClick={() =>
                commit({
                  ...career,
                  scoutingAssignments: [
                    ...career.scoutingAssignments,
                    'Europa – armadores criativos',
                  ],
                })
              }
            >
              Enviar à Europa
            </button>
            <button
              className="ghost-button"
              onClick={() =>
                commit({
                  ...career,
                  scoutingAssignments: [
                    ...career.scoutingAssignments,
                    'G League – pivôs defensivos',
                  ],
                })
              }
            >
              Enviar à G League
            </button>
            {career.scoutingAssignments.map((assignment) => (
              <span key={assignment}>{assignment}</span>
            ))}
          </div>
        )}
        <div className="prospect-grid">
          {career.prospects.map((prospect, index) => (
            <article
              key={prospect.id}
              className={
                career.selectedProspectId === prospect.id ? 'selected' : ''
              }
            >
              <span>
                #{index + 1} · {prospect.projection}
              </span>
              <h3>{prospect.name}</h3>
              <p>
                {prospect.position} · {prospect.age} anos · {prospect.archetype}
              </p>
              <div className="scouting-meter">
                <i style={{ width: `${prospect.scouting}%` }} />
              </div>
              <small>{prospect.scouting}% observado</small>
              <p>{prospect.note}</p>
              <button
                className="ghost-button"
                onClick={() =>
                  commit({
                    ...career,
                    selectedProspectId: prospect.id,
                    prospects: career.prospects.map((item) =>
                      item.id === prospect.id
                        ? {
                            ...item,
                            scouting: Math.min(100, item.scouting + 15),
                          }
                        : item,
                    ),
                  })
                }
              >
                Observar / priorizar
              </button>
            </article>
          ))}
        </div>
      </Panel>
      {mode === 'draft' && career.draftHistory.length > 0 && (
        <Panel title="Histórico do draft SIMULATION">
          <div className="contract-grid">
            {career.draftHistory.slice(-30).map((pick) => (
              <article key={`${pick.season}-${pick.pick}`}>
                <strong>#{pick.pick}</strong>
                <span>
                  <b>{pick.name}</b>
                  <small>
                    {pick.team} · {pick.position} · temporada {pick.season}
                  </small>
                </span>
              </article>
            ))}
          </div>
        </Panel>
      )}
    </>
  );
}
function Finances({ career }: { career: CareerV2 }) {
  const payroll = payrollFor(career.economy, career.teamAbbr);
  const room = career.economy.cap - payroll;
  return (
    <>
      <PageTitle
        kicker="FRONT OFFICE"
        title="Cap e economia esportiva"
        copy="Todos os valores abaixo são gerados pelo ruleset SIMULATION para gameplay; não são dados contratuais oficiais."
      />
      <div className="finance-grid">
        <StatCard
          label="Payroll SIM"
          value={money(payroll)}
          detail={`${roster(career.teamAbbr, career).length} contratos ativos`}
          icon={CircleDollarSign}
        />
        <StatCard
          label="Salary cap SIM"
          value={money(career.economy.cap)}
          detail={
            room >= 0
              ? `${money(room)} de espaço`
              : `${money(Math.abs(room))} acima`
          }
          icon={LineChart}
        />
        <StatCard
          label="Luxury tax SIM"
          value={money(career.economy.tax)}
          detail={career.economy.rulesVersion}
          icon={ShieldCheck}
        />
      </div>
      <Panel title="Aprons, holds e exceptions">
        <div className="finance-cards">
          <article>
            <b>First apron</b>
            <p>
              {money(career.economy.firstApron)} ·{' '}
              {payroll > career.economy.firstApron
                ? 'restrições ativas'
                : 'abaixo do limite'}
            </p>
          </article>
          <article>
            <b>Second apron</b>
            <p>
              {money(career.economy.secondApron)} ·{' '}
              {payroll > career.economy.secondApron
                ? 'restrições severas'
                : 'abaixo do limite'}
            </p>
          </article>
          <article>
            <b>Exception disponível</b>
            <p>
              {money(career.economy.exceptions[career.teamAbbr] ?? 0)} · valor
              interno configurável
            </p>
          </article>
        </div>
      </Panel>
    </>
  );
}
function Board({ career }: { career: CareerV2 }) {
  const record = career.record.wins + career.record.losses;
  const progress = Math.min(
    100,
    30 +
      career.fanMood * 0.25 +
      career.chemistry * 0.25 +
      (record ? (career.record.wins / record) * 30 : 0),
  );
  return (
    <>
      <PageTitle
        kicker="FRONT OFFICE"
        title="Diretoria e objetivos"
        copy="Aprovação conecta desempenho, química e humor da torcida ao seu ciclo de carreira."
      />
      <div className="board-grid">
        <Panel title="Objetivo da temporada">
          <Trophy className="gold" size={38} />
          <h3>{career.boardObjective}</h3>
          <p>
            O objetivo é revisado nos marcos da temporada e permanece visível na
            Central.
          </p>
        </Panel>
        <Panel title="Aprovação">
          <div className="approval">
            <strong>{Math.round(progress)}%</strong>
            <div>
              <i style={{ width: `${progress}%` }} />
            </div>
            <span>
              {progress > 70
                ? 'Confiança alta'
                : progress > 45
                  ? 'Em observação'
                  : 'Atenção da diretoria'}
            </span>
          </div>
        </Panel>
        <Panel title="Marcos">
          <ul className="milestones">
            <li className={record >= 10 ? 'done' : ''}>
              Início de temporada · 10 jogos
            </li>
            <li className={record >= 41 ? 'done' : ''}>
              Metade da temporada · 41 jogos
            </li>
            <li className={record >= 82 ? 'done' : ''}>
              Fim da temporada regular
            </li>
          </ul>
        </Panel>
      </div>
    </>
  );
}
function World({
  career,
  commit,
}: {
  career: CareerV2;
  commit: (next: CareerV2) => void;
}) {
  const world = career.world;
  const change = (key: 'marketing' | 'ticketPrice', value: number) => {
    const next = structuredClone(career);
    next.world[key] = value;
    const delta =
      key === 'marketing'
        ? Math.round((value - world.marketing) * 180000)
        : Math.round((value - world.ticketPrice) * world.arena.capacity * 0.42);
    next.budget += delta;
    next.world.ledger.unshift({
      id: `world-${Date.now()}`,
      date: next.currentDate,
      label:
        key === 'marketing'
          ? 'Campanha de marketing SIMULATION'
          : 'Revisão de ticket pricing SIMULATION',
      amount: delta,
      kind: delta >= 0 ? 'receita' : 'despesa',
    });
    commit(next);
  };
  const renovate = () => {
    if (world.arena.condition >= 100 || career.budget < 4_000_000) return;
    const next = structuredClone(career);
    next.budget -= 4_000_000;
    next.world.arena.condition = Math.min(100, next.world.arena.condition + 12);
    next.world.arena.level = Math.min(5, next.world.arena.level + 1);
    next.world.ledger.unshift({
      id: `arena-${Date.now()}`,
      date: next.currentDate,
      label: 'Reforma da arena SIMULATION',
      amount: -4_000_000,
      kind: 'despesa',
    });
    commit(next);
  };
  const toggle = (key: keyof typeof world.accessibility) => {
    const next = structuredClone(career);
    next.world.accessibility[key] = !next.world.accessibility[key];
    commit(next);
  };
  return (
    <>
      <PageTitle
        kicker="FRANCHISE WORLD"
        title="Franquia, arena e comunidade"
        copy="Receitas, despesas e decisões abaixo são geradas pelo mundo SIMULATION e persistem no seu save."
      />
      <div className="finance-grid">
        <StatCard
          label="Valuation SIM"
          value={money(world.valuation)}
          detail={`Mercado ${world.marketSize}`}
          icon={Landmark}
        />
        <StatCard
          label="Satisfação do proprietário"
          value={`${world.ownerSatisfaction}%`}
          detail={`${world.owner} · segurança ${world.jobSecurity}%`}
          icon={BriefcaseBusiness}
        />
        <StatCard
          label="Arena"
          value={`${world.arena.condition}%`}
          detail={`${world.arena.name} · ${world.arena.capacity.toLocaleString('pt-BR')} lugares`}
          icon={Trophy}
        />
      </div>
      <div className="office-grid">
        <Panel title="Receita e público">
          <label className="load-control">
            Marketing <b>{world.marketing}</b>
            <input
              type="range"
              min="0"
              max="100"
              value={world.marketing}
              onChange={(e) => change('marketing', Number(e.target.value))}
            />
          </label>
          <label className="load-control">
            Ticket médio <b>${world.ticketPrice}</b>
            <input
              type="range"
              min="35"
              max="180"
              value={world.ticketPrice}
              onChange={(e) => change('ticketPrice', Number(e.target.value))}
            />
          </label>
          <p>
            Season tickets: {world.seasonTickets.toLocaleString('pt-BR')} ·
            Premium seats: {world.premiumSeats} · Merchandise SIM:{' '}
            {money(world.merchandise)}.
          </p>
          <button className="gold-button" onClick={renovate}>
            Reformar arena · $4M
          </button>
        </Panel>
        <Panel title="Acessibilidade e conforto">
          <p>
            Preferências persistem apenas neste save e não alteram a simulação
            esportiva.
          </p>
          {(
            ['reducedMotion', 'highContrast', 'screenReaderHints'] as const
          ).map((key) => (
            <button
              key={key}
              className="ghost-button"
              onClick={() => toggle(key)}
            >
              {world.accessibility[key] ? '✓ ' : ''}
              {key === 'reducedMotion'
                ? 'Reduzir animações'
                : key === 'highContrast'
                  ? 'Alto contraste'
                  : 'Dicas para leitor de tela'}
            </button>
          ))}
        </Panel>
      </div>
      <Panel title="Finance ledger · SIMULATION">
        <div className="news-feed">
          {world.ledger.slice(0, 12).map((entry) => (
            <article key={entry.id}>
              <span>
                {dateLabel(entry.date)} · {entry.kind.toUpperCase()}
              </span>
              <b>{entry.label}</b>
              <p className={entry.amount >= 0 ? 'health' : 'health bad'}>
                {entry.amount >= 0 ? '+' : ''}
                {money(entry.amount)}
              </p>
            </article>
          ))}
        </div>
      </Panel>
    </>
  );
}
function History({ career }: { career: CareerV2 }) {
  return (
    <>
      <PageTitle
        kicker="LEGADO"
        title="Arquivo da franquia"
        copy="Campeões, drafts, aposentadorias e temporadas concluídas preservados pelo save."
      />
      <div className="office-grid">
        <Panel title="Season Archive">
          {career.seasonArchives.length ? (
            career.seasonArchives.map((season) => (
              <article className="news-feed" key={season.season}>
                <b>{season.season}</b>
                <p>
                  Campeão: {season.champion ?? '—'} · {season.standings.length}{' '}
                  franquias arquivadas.
                </p>
              </article>
            ))
          ) : (
            <p>Conclua uma temporada para registrar o primeiro capítulo.</p>
          )}
        </Panel>
        <Panel title="Hall of Fame / aposentados">
          <p>
            <b>{career.retiredPlayerIds.length}</b> atletas aposentados
            registrados.
          </p>
          <p>
            O histórico de draft contém {career.draftHistory.length} escolhas e
            as trocas aprovadas permanecem no log de carreira.
          </p>
          <p>
            Record book:{' '}
            {career.results ? Object.keys(career.results).length : 0} partidas
            preservadas nesta temporada.
          </p>
        </Panel>
      </div>
      <Panel title="Draft history">
        <div className="contract-grid">
          {career.draftHistory.length ? (
            career.draftHistory.slice(-30).map((pick) => (
              <article key={`${pick.season}-${pick.pick}`}>
                <strong>#{pick.pick}</strong>
                <span>
                  <b>{pick.name}</b>
                  <small>
                    {pick.team} · {pick.position} · S{pick.season}
                  </small>
                </span>
              </article>
            ))
          ) : (
            <p>O primeiro draft será incluído após a offseason.</p>
          )}
        </div>
      </Panel>
    </>
  );
}
function Media({ career }: { career: CareerV2 }) {
  return (
    <>
      <PageTitle
        kicker="CARREIRA"
        title="Mídia e universo"
        copy="Notícias são geradas a partir de resultados, treinos e eventos registrados no save."
      />
      <Panel title="Feed">
        <div className="news-feed">
          {career.news.map((news) => (
            <article key={news.id}>
              <span>
                {news.category.toUpperCase()} · {dateLabel(news.date)}
              </span>
              <h3>{news.title}</h3>
              <p>{news.body}</p>
            </article>
          ))}
        </div>
      </Panel>
    </>
  );
}
function Profile({ career }: { career: CareerV2 }) {
  return (
    <>
      <PageTitle
        kicker="CARREIRA"
        title="Perfil de manager"
        copy="Sua identidade e reputação permanecem vinculadas ao save v2."
      />
      <Panel title="Cartão de carreira" className="profile-card">
        <img
          src={img(`assets/managers/${career.manager.avatar}`)}
          alt={career.manager.name}
        />
        <div>
          <p className="eyebrow">MANAGER</p>
          <h1>{career.manager.name}</h1>
          <span>
            {career.manager.origin} · {career.manager.experience}
          </span>
          <p>
            Estilo: <b>{career.manager.style}</b>
          </p>
          <div className="profile-metrics">
            <span>
              <b>{career.manager.reputation}</b> reputação
            </span>
            <span>
              <b>
                {career.record.wins}–{career.record.losses}
              </b>{' '}
              registro atual
            </span>
            <span>
              <b>{career.news.length}</b> eventos de carreira
            </span>
          </div>
        </div>
      </Panel>
      {career.savedFromV1 && (
        <div className="migration-alert">
          Este save foi migrado da v1 com segurança. O registro, orçamento e
          rotação foram preservados.
        </div>
      )}
    </>
  );
}
function Licenses() {
  return (
    <>
      <PageTitle
        kicker="CARREIRA"
        title="Licenças e fontes"
        copy="Transparência sobre o material incluído e suas limitações de dados."
      />
      <Panel title="Pacote NBA 2026–27">
        <div className="license-grid">
          <article>
            <ShieldCheck className="gold" />
            <b>30 franquias · 581 atletas</b>
            <p>
              Logos, nomes, rosters e headshots já presentes no pacote local de
              licença, capturado em 31/08/2026.
            </p>
          </article>
          <article>
            <ClipboardList className="gold" />
            <b>Fonte de dados</b>
            <p>
              Arquivo <code>src/data/nba-license-pack.json</code>; o app não
              busca dados em tempo de execução.
            </p>
          </article>
          <article>
            <CircleDollarSign className="gold" />
            <b>Limites explícitos</b>
            <p>
              Contratos, payroll e detalhes financeiros não fornecidos pelo
              pacote aparecem como “DADO NÃO CARREGADO”.
            </p>
          </article>
        </div>
      </Panel>
    </>
  );
}
function PlayerProfile({
  player,
  career,
  onBack,
}: {
  player: Player;
  career: CareerV2;
  onBack: () => void;
}) {
  const stats = career.playerStats[player.id] ?? blankStats();
  const health = career.health[player.id];
  const model = career.playerModels[player.id];
  const contract = career.economy.contracts[player.id];
  const attrs = [
    ['Ataque', model.offense],
    ['Arremesso', model.shooting],
    ['Finalização', model.finishing],
    ['Criação', model.playmaking],
    ['Defesa', model.defense],
    ['Rebote', model.rebounding],
    ['Atletismo', model.athleticism],
    ['QI', model.iq],
  ] as const;
  return (
    <>
      <button className="back-link" onClick={onBack}>
        <ChevronLeft size={18} /> Voltar ao elenco
      </button>
      <section className="player-profile">
        <PlayerFace player={player} />
        <div>
          <p className="eyebrow">PERFIL SIMULATION</p>
          <h1>{player.name}</h1>
          <span>
            {player.position} · #{player.jersey || '—'} · {player.height} ·{' '}
            {player.country}
          </span>
          <div className="attribute-row">
            <b>
              OVR CONTEXTUAL{' '}
              {Math.round((model.offense + model.defense + model.iq) / 3)}
            </b>
            <span>{model.archetype}</span>
            <span>{model.phase}</span>
            <span>{model.personality}</span>
          </div>
        </div>
        <div className="health-panel">
          <HeartPulse />
          <b>{health?.injury ?? 'Disponível'}</b>
          <span>
            Readiness {model.readiness}% · Moral {model.morale}% · Fadiga{' '}
            {health?.fatigue ?? 18}%
          </span>
        </div>
      </section>
      <div className="profile-grid">
        <Panel title="Temporada">
          <div className="profile-stat-grid">
            <StatCard label="PTS" value={statAverage(stats, 'pts')} />
            <StatCard label="REB" value={statAverage(stats, 'reb')} />
            <StatCard label="AST" value={statAverage(stats, 'ast')} />
            <StatCard label="JOGOS" value={stats.gp} />
          </div>
        </Panel>
        <Panel title="Atributos e tendências">
          <div className="attributes">
            {attrs.map(([name, value]) => (
              <label key={name}>
                <span>{name}</span>
                <i>
                  <b style={{ width: `${value}%` }} />
                </i>
                <strong>{value}</strong>
              </label>
            ))}
          </div>
          <div className="tendency-row">
            <span>3PT {model.tendencies.three}</span>
            <span>Aro {model.tendencies.rim}</span>
            <span>Passe {model.tendencies.pass}</span>
            <span>Faltas {model.tendencies.foulDraw}</span>
          </div>
        </Panel>
        <Panel title="Contrato e desenvolvimento">
          <p>
            <b>Contrato SIM:</b> {money(contract.salary)} · {contract.years}{' '}
            ano(s) ·{' '}
            {contract.option
              ? `opção ${contract.option}`
              : 'garantido no ruleset'}
          </p>
          <p>
            <b>Idade de simulação:</b> {model.age} · fase {model.phase}.
            Potencial permanece oculto e o scouting mostra incerteza.
          </p>
          <p>
            <b>Biografia do pacote:</b> {player.college || 'não carregado'} ·{' '}
            {player.country || 'não carregado'}.
          </p>
          <p className="minor-note">
            Contrato, idade de simulação, atributos e tendências são dados
            internos SIMULATION; não são informações oficiais.
          </p>
        </Panel>
      </div>
    </>
  );
}
export default App;
