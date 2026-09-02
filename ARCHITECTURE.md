# Arquitetura atual

- `src/data`: License Pack local, desacoplado do motor.
- `src/domain`: carreira v3, economia, match engine, offseason, mundo de franquia e migrações.
- `src/App.tsx`: superfícies jogáveis de manager, liga, mercado, World e Legacy.
- `public/assets`: fundos fornecidos, logos e retratos do pacote local, com prospectos DEV identificados.
- `scripts`: verificação Foundation e stress test deterministicamente reproduzível.

O save v3 separa identidade licenciada de estado SIMULATION. A função de migração completa saves anteriores acrescentando o estado `world` sem apagar histórico existente.
