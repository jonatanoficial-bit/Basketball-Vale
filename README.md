# VALE BASKET MANAGER — v4.0 Cinematic Game Day

Jogo web/PWA funcional, preparado para GitHub Pages. Esta entrega preserva Foundation, Simulation e World & Release e acrescenta a primeira evolução comercial: reforma visual e apresentação audiovisual.

## Conteúdo desta entrega

- Abertura audiovisual executada em toda inicialização: botão de entrada, vídeo com som e opção de pular.
- Sete músicas fornecidas pelo responsável, reproduzidas em ordem aleatória durante o jogo.
- Controle musical discreto e Configurações persistentes de ativação e volume.
- Dashboard cinematográfico com logo da franquia protagonista, atalhos grandes e cards dos principais atletas.
- Navegação ampliada e mais legível, mantendo todas as áreas existentes.
- Uso contextual dos seis cenários fornecidos: arena, campus, vestiário, treino e ambiente executivo.
- Game Day com apresentação do confronto, quintetos iniciais e entrada na quadra.
- Placar em estilo broadcast, quadra 2.5D, atleta da posse em movimento, som sintetizado da arena e celebração final.
- Layout adaptado para desktop e mobile, com redução de movimento respeitada.
- 30 franquias da NBA com nomes e escudos oficiais.
- 581 atletas listados pela NBA em 31/08/2026: 580 vinculados às franquias e 1 agente livre.
- Retrato oficial local para os 581 atletas; o site não depende do computador que gerou o ZIP.
- Temporada identificada como 2026–27.
- Calendário completo de 82 jogos por franquia (1.230 fixtures estruturais na liga).
- Game Center determinístico por posses, com relógio/shot clock, faltas, lances livres, rebotes, turnovers, assistências, tocos, substituições, lesões, prorrogação, play-by-play, box score, métricas avançadas, lineups e shot chart.
- Ao confirmar seu jogo, todos os jogos da mesma data são processados pela mesma engine e atualizam classificação/estatísticas.
- Save `v3` com migração segura de saves `v1` e Foundation `v2`.
- Contratos plurianuais SIMULATION, cap/tax/aprons, agência livre e Trade Machine com execução no save.
- Temporada regular, playoffs completos em melhor de sete, campeão, offseason e arquivo histórico.
- Draft anual com 60 prospectos, 30 escolhas automáticas, contratos de novato, classes futuras e histórico.
- Desenvolvimento, auge, platô, regressão, envelhecimento, aposentadorias, fadiga, condição, prontidão e moral.
- Gerenciamento de quinteto e distribuição dos 240 minutos.
- Plano de treino, química, torcida e painel da diretoria.
- Autosave via `localStorage`, botão Continuar e instalação como PWA.
- Fundos originais fornecidos pelo responsável do projeto.
- Mascotes fictícios restritos ao laboratório Criar Clube.
- Mercado, scouting/draft DEV, staff, táticas, perfil de atleta, mídia, diretoria, finanças transparentes e idiomas PT/EN/ES.

## Transparência de dados

Nomes, franquias, logos, elencos e 581 retratos vêm do pacote local da temporada 2026–27. Contratos, payroll, atributos, tendências, potencial, draft e regras financeiras gerados para gameplay aparecem como **SIMULATION** ou **DEV FICTÍCIO** e não são dados oficiais.

## Validar

```bash
pnpm typecheck
pnpm build
pnpm test:foundation
pnpm test:simulation
```

## Publicar no GitHub Pages

1. Crie um repositório vazio no GitHub.
2. Envie **todo o conteúdo desta pasta** para a branch `main`.
3. No GitHub, abra **Settings → Pages**.
4. Em **Build and deployment → Source**, selecione **GitHub Actions**.
5. Abra a aba **Actions** e aguarde o workflow “Publicar Vale Basket Manager no GitHub Pages”.

O `vite.config.ts` usa `base: './'`, portanto o site funciona tanto em `usuario.github.io/repositorio/` quanto em domínio próprio.

### Publicação sem build

A pasta `dist/` já vem compilada. É possível enviar somente o conteúdo dela para uma branch `gh-pages` ou para qualquer hospedagem estática.

## Executar localmente para desenvolvimento

Requer Node.js 22.13 ou superior e pnpm.

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Build de produção:

```bash
pnpm run typecheck
pnpm run build
```

## Estrutura relevante

- `src/App.tsx`: fluxo jogável e telas.
- `src/data/nba-license-pack.json`: dados esportivos separados do motor.
- `public/assets/nba/teams`: escudos oficiais.
- `public/assets/nba/players`: retratos oficiais.
- `public/assets/backgrounds`: cenários enviados pelo responsável.
- `scripts/`: reconstrução auditável do pacote de dados e assets.
- `docs/SIMULATION-COMPLETE.md`: cobertura da Parte 2 da Bíblia Mestra.
- `docs/STRESS-TEST-50-SEASONS.md`: evidência de 61.500 partidas auditadas.

## Direitos e atualização de temporada

O responsável pelo projeto declarou autorização para a inserção dos nomes, escudos e imagens. Essa declaração não substitui contratos necessários para distribuição comercial. Antes de monetizar ou publicar em lojas, valide os direitos de marcas, imagem e base de dados com os titulares e assessoria jurídica.

Fonte de roster: [NBA.com League Roster](https://www.nba.com/players). Escudos e retratos: CDN oficial NBA. Consulte `ASSET-MANIFEST.md`.
