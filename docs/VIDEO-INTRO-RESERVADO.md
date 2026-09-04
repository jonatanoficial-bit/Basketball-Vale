# Vídeo de abertura integrado

## Estado

O vídeo fornecido pelo usuário foi integrado em:

`public/assets/video/abertura-vale-basketball.mp4`

Ele é exibido em toda inicialização do jogo depois que o usuário pressiona **Iniciar experiência**. A interação explícita libera o áudio nos navegadores compatíveis. O usuário pode pular a abertura a qualquer momento.

## Integridade

- Tamanho: 18.943.293 bytes
- SHA-256: `A3E94221D787429CC679C134D364AC2DACC8C62FD2C1D7E8B453ED4DC094F938`

## Experiência implementada

1. Mostrar primeiro uma tela leve com a marca Vale Basketball Manager.
2. Exibir um botão principal grande **Iniciar**.
3. Após o clique, reproduzir o vídeo com áudio.
4. Manter um botão **Pular** claramente visível durante toda a reprodução.
5. Ao terminar ou pular, abrir o menu principal.
6. O vídeo não interrompe nem modifica o save da carreira.

O clique em **Iniciar** é necessário também por compatibilidade com as políticas dos navegadores, que normalmente bloqueiam reprodução automática com som antes de uma interação do usuário.

## Observação de distribuição

O vídeo tem aproximadamente 18 MB e usa carregamento de metadados antes do clique. Compressão adicional poderá reduzir o primeiro download sem alterar o fluxo implementado.
