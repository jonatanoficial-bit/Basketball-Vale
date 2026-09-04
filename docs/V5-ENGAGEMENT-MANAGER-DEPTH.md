# V5 — Engagement & Manager Depth

## Fluxo de temporada corrigido

O pacote oficial usa `Eastern` e `Western`; a chave antiga filtrava `East` e `West` por igualdade e produzia seeds `TBD`. A V5 normaliza essa leitura e testa a chave completa: 8 séries na primeira rodada, 4 semifinais, 2 finais de conferência e 1 Final.

Os playoffs agora avançam uma rodada por clique. Após o campeão, o calendário e o Game Center exibem uma ação explícita para processar contratos, aposentadorias, draft, agência livre e iniciar a temporada seguinte. O teste automatizado confirma o reinício na temporada 2 com calendário novo e playoffs vazios.

## Fim da sensação de tédio

- Central de próxima ação no dashboard.
- Caixa de entrada com decisões urgentes e entrevistas.
- Consequências persistentes em química, torcida, reputação e orçamento.
- Rivalidade ativa com nível de calor.
- Objetivo semanal rastreável e recompensa resgatável.
- Feed de histórias gerado por partidas, mercado, decisões, playoffs e offseason.

## Profundidade de manager

- IA adversária apresenta perfil de perímetro, aro, criação, defesa e rebote.
- Nível do analista afeta confiança do relatório e velocidade do scouting.
- Táticas mostram efeitos e trade-offs identificáveis antes da partida.
- Agentes livres avaliam salário, anos e reputação; recusas permitem contraproposta.
- Scouting exibe faixa incerta de OVR, reduzida pelo trabalho de observação.
- Contratos, trades, draft, lesões, staff, economia e desenvolvimento continuam integrados ao mesmo save.

## Mobile e identidade

Em retrato até 600 px, a quadra usa orientação vertical verdadeira. Coordenadas de eventos, bola e jogadores são trocadas entre os eixos, e as marcações passam para topo/fundo.

O emblema Vale derivado da capa fornecida está em `public/assets/brand/vale-official-logo.png`. O novo avatar inclusivo está em `public/assets/managers/manager-06.png`.

## Evidências automatizadas

- TypeScript sem erros.
- Build Vite com base relativa para GitHub Pages.
- 30 franquias e 82 jogos por franquia.
- 61.500 partidas no stress test de 50 temporadas.
- Playoffs 8→4→2→1, campeão e nova temporada.
- Visual smoke test em 390×844: logo carregado, seis avatares e quadra 304×598 em retrato.
