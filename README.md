# VALE BASKET MANAGER — Foundation Completion

Jogo web/PWA funcional, preparado para GitHub Pages. Esta entrega evolui a Parte 1 sem remover o pacote local de logos, elencos e headshots: criador de manager, save v2, liga viva, calendário de 82 jogos e Game Center por eventos.

## Conteúdo desta entrega

- 30 franquias da NBA com nomes e escudos oficiais.
- 581 atletas listados pela NBA em 31/08/2026: 580 vinculados às franquias e 1 agente livre.
- Retrato oficial local para os 581 atletas; o site não depende do computador que gerou o ZIP.
- Temporada identificada como 2026–27.
- Calendário completo de 82 jogos por franquia (1.230 fixtures estruturais na liga).
- Game Center com quadra visual, placar, período/relógio/posse, controle de velocidade, play-by-play, box score e simulação por eventos.
- Ao confirmar seu jogo, todos os jogos da mesma data são processados pela mesma engine e atualizam classificação/estatísticas.
- Save `v2` com migração segura de save `v1` (registro, orçamento e rotação preservados).
- Gerenciamento de quinteto e distribuição dos 240 minutos.
- Plano de treino, química, torcida e painel da diretoria.
- Autosave via `localStorage`, botão Continuar e instalação como PWA.
- Fundos originais fornecidos pelo responsável do projeto.
- Mascotes fictícios restritos ao laboratório Criar Clube.
- Mercado, scouting/draft DEV, staff, táticas, perfil de atleta, mídia, diretoria, finanças transparentes e idiomas PT/EN/ES.

## Transparência de dados

Contratos, payroll e salary cap que não estão no pacote fornecido aparecem como **DADO NÃO CARREGADO**. Prospectos e staff DEV são marcados como fictícios; atributos de gameplay são estimativas internas, não avaliações oficiais.

## Validar

```bash
pnpm typecheck
pnpm build
pnpm test:foundation
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
- `docs/COBERTURA-PARTE-1.md`: relação com a Bíblia Mestra.

## Direitos e atualização de temporada

O responsável pelo projeto declarou autorização para a inserção dos nomes, escudos e imagens. Essa declaração não substitui contratos necessários para distribuição comercial. Antes de monetizar ou publicar em lojas, valide os direitos de marcas, imagem e base de dados com os titulares e assessoria jurídica.

Fonte de roster: [NBA.com League Roster](https://www.nba.com/players). Escudos e retratos: CDN oficial NBA. Consulte `ASSET-MANIFEST.md`.
