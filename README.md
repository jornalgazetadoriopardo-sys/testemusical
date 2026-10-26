# Painel de Participação dos Ouvintes

Painel para o operador conduzir os jogos com ouvintes durante o programa de rádio.

## Como usar

Abra o arquivo `index.html` no navegador (Chrome, Edge ou Firefox). Não precisa instalar nada.

### Administração

A aba **Administração** tem uma sub-aba para cada jogo.

Em **Jogo das Notas**, cadastre cada música:

- **Título** e **artista**
- **Música inteira**: o arquivo completo
- **Áudios das notas (1 a 7)**: um arquivo para cada botão. O botão 3, por exemplo, toca o áudio com as 3 primeiras notas.

Os slots podem ficar vazios; o botão correspondente aparece desabilitado no jogo.
Músicas cadastradas podem ser editadas ou excluídas na tabela.

Em **Jogo do Tempo**, cadastre rodadas: um nome (ex.: "Programa de segunda") e as 10 músicas na ordem em que serão tocadas, cada uma com título e áudio.

### Jogo das Notas

1. Clique na música em jogo.
2. Clique nos botões de **1 a 7** para tocar a quantidade de notas que será mostrada ao participante.
3. **▶ Música inteira** toca a faixa completa; **■ Parar** interrompe o áudio.

Os botões de notas já tocados ficam marcados em laranja. As músicas já usadas aparecem com borda tracejada. **Zerar rodada** limpa as marcações.

Atalhos de teclado: `1`–`7` tocam as notas, `M` toca a música inteira, `Esc` ou `Espaço` param o áudio.

### Jogo do Tempo

1. Escolha a rodada.
2. Clique no botão **1**: a primeira música começa a tocar e o cronômetro dispara.
3. **Próxima** registra o tempo de resposta abaixo do botão e já toca a música seguinte.
4. **Pular** registra "pulou" e já toca a música seguinte.
5. Depois da música 10, **Próxima** volta automaticamente para a primeira música pulada, e assim por diante até todas serem respondidas.
6. Ao final aparece o **tempo total** (soma dos tempos registrados).

Se uma música pulada for respondida depois, o tempo dela soma as duas vezes em que tocou.
**Finalizar** encerra antes do fim (a música em execução conta como pulada); **Nova participação** zera tudo para o próximo ouvinte.

Atalhos de teclado: `Enter` ou `→` começa / próxima, `P` pula.

## Onde ficam os dados

As músicas e os áudios ficam salvos no próprio navegador (IndexedDB) do computador onde foram cadastrados.
Use sempre o mesmo computador e navegador no estúdio. Limpar os dados de navegação apaga o cadastro.
