# Painel de Participação dos Ouvintes

Painel para o operador conduzir os jogos com ouvintes durante o programa de rádio.

## Como usar

Abra o arquivo `index.html` no navegador (Chrome, Edge ou Firefox). Não precisa instalar nada.

### Administração

Na aba **Administração**, cadastre cada música:

- **Título** e **artista**
- **Música inteira**: o arquivo completo
- **Áudios das notas (1 a 7)**: um arquivo para cada botão. O botão 3, por exemplo, toca o áudio com as 3 primeiras notas.

Os slots podem ficar vazios; o botão correspondente aparece desabilitado no jogo.
Músicas cadastradas podem ser editadas ou excluídas na tabela.

### Jogo das Notas

1. Clique na música em jogo.
2. Clique nos botões de **1 a 7** para tocar a quantidade de notas que será mostrada ao participante.
3. **▶ Música inteira** toca a faixa completa; **■ Parar** interrompe o áudio.

Os botões de notas já tocados ficam marcados em laranja. As músicas já usadas aparecem com borda tracejada. **Zerar rodada** limpa as marcações.

Atalhos de teclado: `1`–`7` tocam as notas, `M` toca a música inteira, `Esc` ou `Espaço` param o áudio.

## Onde ficam os dados

As músicas e os áudios ficam salvos no próprio navegador (IndexedDB) do computador onde foram cadastrados.
Use sempre o mesmo computador e navegador no estúdio. Limpar os dados de navegação apaga o cadastro.
