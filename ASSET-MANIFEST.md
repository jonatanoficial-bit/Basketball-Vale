# Manifesto de assets — Parte 1

## LicensePack NBA 2026–27

| Classe | Quantidade | Origem | Local no projeto |
|---|---:|---|---|
| Franquias | 30 | NBA.com / CDN oficial | `public/assets/nba/teams` |
| Atletas vinculados | 580 | NBA.com League Roster | `src/data/nba-license-pack.json` |
| Agente livre listado | 1 | NBA.com League Roster | `src/data/nba-license-pack.json` |
| Retratos | 581 | CDN oficial NBA, 260×190 | `public/assets/nba/players` |

Captura realizada em 31/08/2026. O relatório de download registra zero falhas em `src/data/asset-download-report.json`.

## Cenários fornecidos pelo usuário

- `home-arena.png`
- `franchise-campus.png`
- `team-arena.png`
- `locker-room.png`
- `training-center.png`
- `executive-suite.png`
- `og.png`

## Criar Clube

Cinco emblemas autorais foram copiados para `public/assets/create-club`. Eles são exibidos apenas no laboratório Criar Clube e não substituem qualquer escudo oficial.

## Regra de separação

O motor referencia IDs neutros e caminhos descritos no LicensePack. As regras de carreira, rotação, calendário e simulação não dependem do nome ou do desenho de uma marca específica.
