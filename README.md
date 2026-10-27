# Painel de Participação dos Ouvintes

Painel para o operador conduzir os jogos com ouvintes durante o programa de rádio.

## Como usar

Abra pelo link https://claude.ai/artifact/1z1xFtKeVj4qxXGvqhceXr ou abra o arquivo `index.html` no navegador (Chrome, Edge ou Firefox). Não precisa instalar nada.

### Administração

A aba **Administração** tem uma sub-aba para cada jogo.

Em **Jogo das Notas**:

- **Pontuação**: os pontos de quem acerta ouvindo 1, 2, … 7 notas (padrão 70, 60, 50, 40, 30, 20, 10). Quem erra fica com 0. Salva automaticamente e vale para todas as músicas.
- Cadastre cada música com **título**, **artista**, **música inteira** e **áudios das notas (1 a 7)**. O botão 3, por exemplo, toca o áudio com as 3 primeiras notas.
- Arraste o arquivo da música inteira para a primeira área tracejada (se o título estiver vazio, ele vem do nome do arquivo).
- Arraste os 7 áudios das notas de uma vez para a segunda área: entram nas posições vazias em ordem de nome. Corrija a ordem com as setas ↑ ↓.

Os slots podem ficar vazios; o botão correspondente aparece desabilitado no jogo.
Músicas cadastradas podem ser editadas ou excluídas na tabela.

Em **Jogo do Tempo**, cadastre rodadas: um nome (ex.: "Programa de segunda") e as 10 músicas na ordem em que serão tocadas, cada uma com título e áudio.

- Arraste vários arquivos de áudio de uma vez para a área tracejada (ou clique nela para escolher). Eles entram nas posições vazias, em ordem de nome.
- O título é preenchido pelo nome do arquivo, sem a extensão e sem o número da faixa (`03 - Asa_Branca.mp3` vira `Asa Branca`). Dá para editar.
- Mude a ordem arrastando a linha pela alça ⠿ ou com as setas ↑ ↓. **Limpar as 10 posições** recomeça a lista.

### Jogo das Notas

1. Clique na música em jogo e digite o **nome do ouvinte**.
2. Clique nos botões de **1 a 7** para tocar a quantidade de notas que o ouvinte escolher. Cada botão mostra quantos pontos vale.
3. O quadro **Valendo** mostra os pontos da maior quantidade de notas já tocada.
4. Marque **✔ Acertou** (ganha os pontos) ou **✘ Errou** (0 pontos). A jogada é registrada e o resultado aparece na tela.

**▶ Música inteira** toca a faixa completa; **■ Parar** interrompe o áudio. **Zerar notas** limpa as notas tocadas sem registrar nada.
As músicas já usadas aparecem com borda tracejada.

Abaixo do jogo ficam o **Ranking** (soma dos pontos por ouvinte, pelo nome) e o **Histórico** de todas as respostas, salvos no navegador. Dá para excluir uma resposta ou apagar tudo.

Atalhos de teclado: `1`–`7` tocam as notas, `M` toca a música inteira, `Esc` ou `Espaço` param o áudio, `A` acertou, `E` errou.

### Jogo do Tempo

1. Escolha a rodada.
2. Clique no botão **1**: a primeira música começa a tocar e o cronômetro dispara.
3. **Próxima** registra o tempo de resposta abaixo do botão e já toca a música seguinte.
4. **Pular** registra "pulou" e já toca a música seguinte.
5. Depois da música 10, **Próxima** volta automaticamente para a primeira música pulada, e assim por diante até todas serem respondidas.
6. Ao final aparece o **tempo total** (soma dos tempos registrados).

Se uma música pulada for respondida depois, o tempo dela soma as duas vezes em que tocou.
**Finalizar** encerra antes do fim (a música em execução conta como pulada); **Nova participação** zera tudo para o próximo ouvinte.

Cada participação fica registrada no **Histórico de participações**, logo abaixo do jogo: data, nome do ouvinte (campo opcional), rodada, músicas respondidas, tempo total e, ao abrir o registro, o tempo de cada música.
O registro é feito ao terminar a participação. Se uma nova for aberta (ou a rodada trocada) no meio de uma participação, a que estava em andamento é encerrada e registrada.
O histórico fica salvo no navegador.

Atalhos de teclado: `Enter` ou `→` começa / próxima, `P` pula.

## Onde ficam os dados

As músicas e os áudios ficam salvos no próprio navegador (IndexedDB) do computador onde foram cadastrados.
Use sempre o mesmo computador e navegador no estúdio. Limpar os dados de navegação apaga o cadastro.
