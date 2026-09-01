# Parte 2 — SIMULATION

Esta entrega acrescenta o núcleo sistêmico e jogável da segunda macrofase sem remover a Foundation.

## Jogadores e carreira

- Atributos separados de ataque, arremesso, finalização, criação, defesa, rebote, atletismo, QI e durabilidade.
- Tendências independentes, arquétipos, papéis, OVR contextual, potencial oculto e incerteza de scouting.
- Desenvolvimento, auge, platô, regressão, envelhecimento e aposentadoria determinísticos.
- Fadiga, condição, prontidão, moral, personalidade, lesões, recuperação e retorno registrados no save.

## Partidas

- Um único motor por posses atende Live, avanço rápido e simulação de rodada.
- Relógio, shot clock, ritmo, seleção de arremesso, contestação, faltas, lances livres, turnovers, roubos, rebotes, assistências, tocos, substituições, timeouts, clutch e prorrogação.
- Play-by-play, box score, métricas avançadas, lineups, on/off simplificado, shot chart, seed e checksum reprodutível.
- A IA usa atributos e táticas; não recebe bônus mágicos.

## Liga, economia e offseason

- 82 partidas por time, standings, líderes e playoffs completos em séries melhor de sete.
- Contratos plurianuais SIMULATION, salary cap, luxury tax, first/second apron, holds e exceptions.
- Agência livre, regras de elenco, Trade Machine com proteção contra desequilíbrio/excesso de payroll e execução persistente.
- Classes futuras de 60 prospectos, Big Board, scouting com confiança crescente, 30 escolhas anuais, contratos de novato e histórico do draft.
- Offseason renova o universo: draft, agência livre de IA, limites de 15–18 atletas, desenvolvimento, aposentadorias e nova temporada.

## Transparência

Logos, nomes, elencos e retratos do pacote local 2026–27 são separados dos dados gerados. Contratos, atributos, idades de simulação, finanças e prospectos estão marcados como SIMULATION/DEV e não afirmam ser dados oficiais.

## Persistência e hospedagem

O save v3 vive no `localStorage` do navegador e migra v1/v2. O projeto usa caminhos relativos, service worker e workflow do GitHub Pages; depois do deploy não depende de arquivos do PC de origem.
