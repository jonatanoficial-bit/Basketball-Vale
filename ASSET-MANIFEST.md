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

## Vídeo de abertura

- Arquivo: `public/assets/video/abertura-vale-basketball.mp4`
- Estado: integrado à tela de inicialização, com reprodução sonora após interação e opção de pular.
- SHA-256: `A3E94221D787429CC679C134D364AC2DACC8C62FD2C1D7E8B453ED4DC094F938`
- Fluxo: tela inicial com marca e botão **Iniciar**; o clique inicia o vídeo com som e mantém um botão **Pular** visível.

O vídeo entra no build estático e funciona no GitHub Pages sem depender de caminho local.

## Trilha musical

Sete arquivos fornecidos pelo usuário foram normalizados e copiados para `public/assets/audio`:

- `bola-na-ginga.mp3`
- `quadra-em-fogo.mp3`
- `quadra-em-fogo-alt.mp3`
- `quadra-em-fumaca.mp3`
- `quadra-em-fumaca-alt.mp3`
- `quadra-em-veludo.mp3`
- `quadra-em-veludo-alt.mp3`

As faixas são escolhidas aleatoriamente, sem repetição imediata. Música ativada/desativada e volume são preferências locais independentes do save da carreira.

## Criar Clube

Cinco emblemas autorais foram copiados para `public/assets/create-club`. Eles são exibidos apenas no laboratório Criar Clube e não substituem qualquer escudo oficial.

## Regra de separação

O motor referencia IDs neutros e caminhos descritos no LicensePack. As regras de carreira, rotação, calendário e simulação não dependem do nome ou do desenho de uma marca específica.
