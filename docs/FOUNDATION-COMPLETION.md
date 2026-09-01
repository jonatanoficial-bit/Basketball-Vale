# Foundation Completion — cobertura

| Área | Estado | Implementação |
| --- | --- | --- |
| Carreira | Funcional | Criador de manager, escolha de franquia e save v2 |
| Compatibilidade | Funcional | Migração não destrutiva de v1 para v2 |
| Liga | Funcional | 30 times, 82 jogos por time, 1.230 fixtures e standings |
| Jogos | Funcional | Eventos, PBP, box score, visual de quadra e simulação diária |
| Time | Funcional | Elenco, perfil, rotação, tática, treino e staff |
| Front Office | Funcional | Mercado transparente, scouting/draft DEV, finanças e board |
| Carreira | Funcional | Mídia, perfil, licenças e i18n central |

## Limites explícitos

- O motor é uma simulação de gestão: atributos de gameplay são estimativas internas e não avaliações oficiais.
- O pacote não tem contratos, cap ou payroll; por isso estes campos são sempre `DADO NÃO CARREGADO`.
- A base de playoffs deriva da classificação final; chave pós-temporada completa é expansão futura.
- Não há serviço externo em produção: dados, imagens e save funcionam no browser/GitHub Pages.

## Auditoria executada

- `tsc --noEmit`
- `vite build`
- `node scripts/verify-foundation.mjs`
