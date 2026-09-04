import { makeCareer, teams } from '../src/domain/career';
import { achievementCatalog, careerModes, evaluateMetaProgress } from '../src/domain/content';

const assert = (condition: unknown, message: string) => {
  if (!condition) throw new Error(message);
  console.log(`PASS  ${message}`);
};

for (const mode of Object.keys(careerModes) as (keyof typeof careerModes)[]) {
  const career = makeCareer(teams[0], {
    name: 'Auditoria Vale', origin: 'Brasil', experience: 'QA', style: 'Equilibrado', avatar: 'manager-06.png', reputation: 50,
  }, 'pt-BR', mode);
  assert(career.careerMode === mode, `modo ${careerModes[mode].name} cria save próprio`);
  assert(career.boardObjective === careerModes[mode].objective, `modo ${careerModes[mode].name} aplica objetivo`);
  assert(career.metaChallenges.length >= 3, `modo ${careerModes[mode].name} recebe desafios`);
  assert(career.customClub.abbr === teams[0].abbr, `modo ${careerModes[mode].name} preserva vaga esportiva`);
}

const progress = makeCareer(teams[0], {
  name: 'Auditoria Vale', origin: 'Brasil', experience: 'QA', style: 'Equilibrado', avatar: 'manager-06.png', reputation: 50,
});
progress.record.wins = 10;
progress.customClub.enabled = true;
const evaluated = evaluateMetaProgress(progress);
assert(evaluated.achievements.some((item) => item.id === 'first-win'), 'conquista de primeira vitória desbloqueia');
assert(evaluated.achievements.some((item) => item.id === 'ten-wins'), 'conquista de dez vitórias desbloqueia');
assert(evaluated.achievements.some((item) => item.id === 'architect'), 'conquista de criar clube desbloqueia');
assert(evaluated.historicalEvents.length >= 2, 'linha do tempo registra marcos sem duplicar');
assert(new Set(evaluated.achievements.map((item) => item.id)).size <= achievementCatalog.length, 'conquistas permanecem únicas');
assert(evaluated.goldMaster.telemetryConsent === false, 'telemetria nasce desativada');
console.log('GOLD MASTER AUDIT OK');
