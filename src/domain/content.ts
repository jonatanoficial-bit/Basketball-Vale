import type {
  CareerModeId,
  CareerV2,
  CustomClub,
  MetaChallenge,
  Team,
} from './types';

export const careerModes: Record<
  CareerModeId,
  { name: string; eyebrow: string; description: string; objective: string }
> = {
  dynasty: {
    name: 'Dinastia',
    eyebrow: 'LONGO PRAZO',
    description: 'Construa uma potência, preserve estrelas e empilhe títulos.',
    objective: 'Conquistar um título em até três temporadas.',
  },
  rebuild: {
    name: 'Reconstrução',
    eyebrow: 'PROJETO',
    description: 'Priorize jovens, draft e flexibilidade financeira.',
    objective: 'Desenvolver o elenco e chegar aos playoffs em duas temporadas.',
  },
  challenge: {
    name: 'Desafio Vale',
    eyebrow: 'PRESSÃO TOTAL',
    description: 'Metas agressivas, orçamento menor e decisões com peso maior.',
    objective: 'Superar a projeção da diretoria já na primeira temporada.',
  },
  legend: {
    name: 'Lenda',
    eyebrow: 'ELITE',
    description: 'Margem mínima para erros e exigência máxima da torcida.',
    objective: 'Terminar entre os quatro melhores e disputar o título.',
  },
};

export const achievementCatalog = [
  { id: 'first-game', name: 'Primeiro Apito', description: 'Conclua seu primeiro jogo.', icon: '🏀' },
  { id: 'first-win', name: 'Primeira Vitória', description: 'Vença uma partida.', icon: '⚡' },
  { id: 'ten-wins', name: 'Duplo Dígito', description: 'Some 10 vitórias na carreira.', icon: '🔥' },
  { id: 'playoffs', name: 'Luzes de Maio', description: 'Vença uma série de playoffs.', icon: '⭐' },
  { id: 'champion', name: 'Rei da Liga', description: 'Conquiste o campeonato.', icon: '🏆' },
  { id: 'architect', name: 'Arquiteto', description: 'Personalize o seu clube.', icon: '🛡️' },
  { id: 'century', name: 'Centenário', description: 'Gerencie 100 partidas.', icon: '💯' },
] as const;

export function createCustomClub(team: Team): CustomClub {
  return {
    enabled: false,
    name: team.name,
    city: team.city,
    abbr: team.abbr,
    arenaName: 'Vale Arena',
    mascot: 'Guardião',
    primary: team.primary,
    secondary: team.secondary,
    crestStyle: 'Coroa',
  };
}

export function createMetaChallenges(): MetaChallenge[] {
  return [
    {
      id: 'wins-5',
      title: 'Arranque de respeito',
      description: 'Vença cinco jogos na carreira.',
      target: 5,
      progress: 0,
      reward: 600_000,
      completed: false,
      claimed: false,
    },
    {
      id: 'chemistry-75',
      title: 'Vestiário fechado',
      description: 'Eleve a química para 75%.',
      target: 75,
      progress: 0,
      reward: 450_000,
      completed: false,
      claimed: false,
    },
    {
      id: 'season-82',
      title: 'Maratona completa',
      description: 'Gerencie uma temporada regular completa.',
      target: 82,
      progress: 0,
      reward: 1_250_000,
      completed: false,
      claimed: false,
    },
  ];
}

export function completeGoldMasterState(career: CareerV2, team: Team): CareerV2 {
  return {
    ...career,
    careerMode: career.careerMode ?? 'dynasty',
    customClub: career.customClub ?? createCustomClub(team),
    achievements: career.achievements ?? [],
    careerRecords: career.careerRecords ?? {
      gamesManaged: Object.keys(career.results ?? {}).length,
      regularSeasonWins: career.record?.wins ?? 0,
      playoffSeriesWins: 0,
      championships: (career.seasonArchives ?? []).filter(
        (season) => season.champion === career.teamAbbr,
      ).length,
      bestSeasonWins: career.record?.wins ?? 0,
      bestWinStreak: Math.max(0, career.standings?.[career.teamAbbr]?.streak ?? 0),
      signings: 0,
      trades: 0,
      draftPicks: (career.draftHistory ?? []).filter(
        (pick) => pick.team === career.teamAbbr,
      ).length,
    },
    metaChallenges: career.metaChallenges ?? createMetaChallenges(),
    historicalEvents: career.historicalEvents ?? [],
    goldMaster: career.goldMaster ?? {
      localAccount: null,
      telemetryConsent: false,
      tutorialComplete: false,
    },
  };
}

export function evaluateMetaProgress(career: CareerV2): CareerV2 {
  const gamesManaged = Object.keys(career.results).filter((id) => {
    const result = career.results[id];
    return result.home === career.teamAbbr || result.away === career.teamAbbr;
  }).length;
  const championships = career.seasonArchives.filter(
    (season) => season.champion === career.teamAbbr,
  ).length;
  const playoffSeriesWins = career.playoffs.filter(
    (series) => series.winner === career.teamAbbr,
  ).length;
  const records = {
    ...career.careerRecords,
    gamesManaged,
    regularSeasonWins: Math.max(career.careerRecords.regularSeasonWins, career.record.wins),
    playoffSeriesWins: Math.max(career.careerRecords.playoffSeriesWins, playoffSeriesWins),
    championships,
    bestSeasonWins: Math.max(career.careerRecords.bestSeasonWins, career.record.wins),
    bestWinStreak: Math.max(
      career.careerRecords.bestWinStreak,
      Math.max(0, career.standings[career.teamAbbr]?.streak ?? 0),
    ),
    draftPicks: Math.max(
      career.careerRecords.draftPicks,
      career.draftHistory.filter((pick) => pick.team === career.teamAbbr).length,
    ),
  };
  const unlockIds = [
    gamesManaged >= 1 && 'first-game',
    records.regularSeasonWins >= 1 && 'first-win',
    records.regularSeasonWins >= 10 && 'ten-wins',
    records.playoffSeriesWins >= 1 && 'playoffs',
    championships >= 1 && 'champion',
    career.customClub.enabled && 'architect',
    gamesManaged >= 100 && 'century',
  ].filter(Boolean) as string[];
  const now = new Date().toISOString();
  const known = new Set(career.achievements.map((item) => item.id));
  const achievements = [
    ...career.achievements,
    ...unlockIds.filter((id) => !known.has(id)).map((id) => ({ id, unlockedAt: now })),
  ];
  const metaChallenges = career.metaChallenges.map((challenge) => {
    const progress =
      challenge.id === 'wins-5'
        ? records.regularSeasonWins
        : challenge.id === 'chemistry-75'
          ? career.chemistry
          : gamesManaged;
    return { ...challenge, progress, completed: progress >= challenge.target };
  });
  const historicalEvents = [...career.historicalEvents];
  const addEvent = (id: string, title: string, description: string, category: 'recorde' | 'rivalidade' | 'título' | 'franquia') => {
    if (!historicalEvents.some((event) => event.id === id)) {
      historicalEvents.unshift({ id, season: career.seasonNumber, date: career.currentDate, title, description, category });
    }
  };
  if (records.regularSeasonWins >= 1) addEvent('first-win', 'A primeira vitória', 'A era do novo manager começou oficialmente.', 'franquia');
  if (records.regularSeasonWins >= 10) addEvent('ten-wins', 'Dez vitórias', 'A franquia atingiu dois dígitos de vitórias sob a nova gestão.', 'recorde');
  if (championships >= 1) addEvent(`title-${championships}`, 'No topo da liga', `Título número ${championships} conquistado nesta carreira.`, 'título');
  return { ...career, careerRecords: records, achievements, metaChallenges, historicalEvents };
}

export function claimMetaChallenge(career: CareerV2, id: string): CareerV2 {
  const challenge = career.metaChallenges.find((item) => item.id === id);
  if (!challenge?.completed || challenge.claimed) return career;
  return {
    ...career,
    budget: career.budget + challenge.reward,
    metaChallenges: career.metaChallenges.map((item) =>
      item.id === id ? { ...item, claimed: true } : item,
    ),
    news: [
      {
        id: `challenge-${id}-${career.seasonNumber}`,
        date: career.currentDate,
        category: 'board',
        title: `Desafio concluído: ${challenge.title}`,
        body: `A recompensa de $${(challenge.reward / 1_000).toFixed(0)} mil foi adicionada ao orçamento operacional.`,
      },
      ...career.news,
    ],
  };
}
