import type { CareerV2, EngagementState, ManagerDecision, Team } from './types';

const clamp = (value: number) => Math.max(0, Math.min(100, value));

export function createEngagement(
  teamAbbr: string,
  teams: Team[],
  seasonNumber = 1,
  baseWins = 0,
  baseGames = 0,
): EngagementState {
  const own = teams.find((team) => team.abbr === teamAbbr);
  const rival =
    teams.find(
      (team) =>
        team.abbr !== teamAbbr &&
        team.conference === own?.conference &&
        team.division === own?.division,
    ) ?? teams.find((team) => team.abbr !== teamAbbr)!;
  const decisions: ManagerDecision[] = [
    {
      id: `identity-s${seasonNumber}`,
      title: 'Qual será a mensagem ao vestiário?',
      body: 'O elenco espera uma direção clara antes da próxima sequência de jogos.',
      deadline: 'Antes do próximo jogo',
      category: 'team',
      choices: [
        {
          id: 'trust',
          label: 'Dar confiança ao elenco',
          consequence: '+4 química, +1 reputação',
          fanMood: 0,
          chemistry: 4,
          budget: 0,
          reputation: 1,
        },
        {
          id: 'pressure',
          label: 'Cobrar resultado imediato',
          consequence: '+4 torcida, -2 química',
          fanMood: 4,
          chemistry: -2,
          budget: 0,
          reputation: 0,
        },
      ],
    },
    {
      id: `interview-s${seasonNumber}`,
      title: `Entrevista: a rivalidade com ${rival.abbr}`,
      body: 'A imprensa quer uma declaração que definirá o clima do próximo confronto.',
      deadline: 'Coletiva desta semana',
      category: 'media',
      choices: [
        {
          id: 'respect',
          label: 'Demonstrar respeito',
          consequence: '+2 química, +1 reputação',
          fanMood: 0,
          chemistry: 2,
          budget: 0,
          reputation: 1,
        },
        {
          id: 'challenge',
          label: 'Provocar o rival',
          consequence: '+6 torcida, +10 calor da rivalidade',
          fanMood: 6,
          chemistry: 0,
          budget: 0,
          reputation: 0,
        },
      ],
    },
  ];
  return {
    pendingDecisions: decisions,
    resolvedDecisionIds: [],
    inboxRead: [],
    rivalryTeam: rival.abbr,
    rivalryHeat: 45,
    storyChapter: seasonNumber,
    weeklyObjective: {
      id: `weekly-s${seasonNumber}-g${baseGames}`,
      title: 'Estabelecer o ritmo da semana',
      description: 'Vença 2 das próximas 3 partidas.',
      targetWins: 2,
      targetGames: 3,
      baseWins,
      baseGames,
      rewardBudget: 750_000,
      rewardReputation: 2,
      claimed: false,
    },
  };
}

export function seasonStatus(career: CareerV2) {
  const regularGames = career.fixtures.filter(
    (fixture) =>
      fixture.home === career.teamAbbr || fixture.away === career.teamAbbr,
  );
  const regularPlayed = regularGames.filter(
    (fixture) => fixture.status === 'played',
  ).length;
  const regularDone = regularPlayed >= regularGames.length && regularGames.length > 0;
  const finals = career.playoffs.find((series) => series.round === 4);
  const champion = finals?.winner;
  const currentPlayoffRound = career.playoffs.length
    ? Math.max(...career.playoffs.map((series) => series.round))
    : 0;
  return { regularGames, regularPlayed, regularDone, champion, currentPlayoffRound };
}

export function objectiveProgress(career: CareerV2) {
  const objective = career.engagement.weeklyObjective;
  const games = career.record.wins + career.record.losses - objective.baseGames;
  const wins = career.record.wins - objective.baseWins;
  return {
    games: Math.max(0, games),
    wins: Math.max(0, wins),
    complete: games >= objective.targetGames && wins >= objective.targetWins,
    failed: games >= objective.targetGames && wins < objective.targetWins,
  };
}

export function resolveManagerDecision(
  career: CareerV2,
  decisionId: string,
  choiceId: string,
) {
  const next = structuredClone(career);
  const decision = next.engagement.pendingDecisions.find(
    (item) => item.id === decisionId,
  );
  const choice = decision?.choices.find((item) => item.id === choiceId);
  if (!decision || !choice) return next;
  next.fanMood = clamp(next.fanMood + choice.fanMood);
  next.chemistry = clamp(next.chemistry + choice.chemistry);
  next.budget += choice.budget;
  next.manager.reputation = clamp(next.manager.reputation + choice.reputation);
  if (choice.id === 'challenge') next.engagement.rivalryHeat = clamp(next.engagement.rivalryHeat + 10);
  next.engagement.pendingDecisions = next.engagement.pendingDecisions.filter(
    (item) => item.id !== decisionId,
  );
  next.engagement.resolvedDecisionIds.unshift(decisionId);
  next.news.unshift({
    id: `decision-${decisionId}-${choiceId}`,
    date: next.currentDate,
    category: decision.category === 'media' ? 'league' : decision.category,
    title: decision.title,
    body: `${choice.label}. Consequência aplicada: ${choice.consequence}.`,
  });
  return next;
}

export function claimWeeklyObjective(career: CareerV2) {
  const progress = objectiveProgress(career);
  if (!progress.complete || career.engagement.weeklyObjective.claimed) return career;
  const next = structuredClone(career);
  const reward = next.engagement.weeklyObjective;
  next.budget += reward.rewardBudget;
  next.manager.reputation = clamp(next.manager.reputation + reward.rewardReputation);
  reward.claimed = true;
  next.news.unshift({
    id: `objective-${reward.id}`,
    date: next.currentDate,
    category: 'board',
    title: 'Objetivo semanal concluído',
    body: `Recompensa recebida: $${reward.rewardBudget.toLocaleString('pt-BR')} e +${reward.rewardReputation} de reputação.`,
  });
  return next;
}
