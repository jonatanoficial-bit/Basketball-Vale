# Cobertura da Bíblia Mestra — Entrega 1/3

Esta entrega implementa a camada **Fundação**. Os sistemas avançados de simulação, mercado, narrativa e conteúdo vivo serão expandidos nas Partes 2 e 3 sem quebrar o save `v1`.

| Eixo da Bíblia | Implementação nesta parte |
|---|---|
| Web/PWA | Vite estático, manifest, service worker e layout responsivo |
| GitHub | Base relativa, build `dist` e workflow GitHub Pages |
| Save | `localStorage`, schema versionado e botão Continuar |
| LicensePack | JSON separado, IDs oficiais, manifesto, fonte e data de captura |
| Franquias | 30 times, conferência/divisão, cores e escudos oficiais |
| Atletas | 581 registros e 581 retratos locais; 580 atletas nas 30 escalações |
| Team Hub | campanha, próximo jogo, objetivos, núcleo e decisões |
| Roster | quinteto, troca de titular, minutos manuais e auto rotação 240 |
| Calendário | 24 compromissos gerados por carreira e histórico de resultados |
| Match preview | simulação funcional de placar, mando, força do elenco e impacto no save |
| Treino | foco selecionável, prontidão e evolução de química |
| Diretoria | orçamento, torcida, expectativas e metas |
| Criar Clube | laboratório visual isolado das marcas oficiais |

## Interfaces reservadas para continuidade

- O save contém `version`, `teamAbbr`, `rotation`, `starters`, `schedule` e indicadores institucionais.
- O LicensePack preserva IDs de equipe e pessoa para atualizações de roster.
- A simulação atual é deliberadamente compacta; a Parte 2 poderá substituí-la pelo motor tático sem mudar a interface do calendário.
- Draft de expansão, mercado aprofundado, narrativa e temporadas completas pertencem às próximas entregas.
