// Históricos salvos no navegador (localStorage), um por jogo.
// Jogo do Tempo: { id, data, rodada, ouvinte, itens: [{ titulo, tempo, status }], total, respondidas }
// Jogo das Notas: { id, data, ouvinte, musica, notas, acertou, pontos }
const Historico = (() => {
  function criar(chave) {
    let memoria = [];

    function ler() {
      try {
        const salvo = JSON.parse(localStorage.getItem(chave));
        return Array.isArray(salvo) ? salvo : memoria;
      } catch {
        return memoria;
      }
    }

    function gravar(lista) {
      memoria = lista;
      try {
        localStorage.setItem(chave, JSON.stringify(lista));
      } catch {
        // Sem armazenamento disponível: o histórico vale só enquanto a página estiver aberta.
      }
    }

    return {
      listar: ler,
      adicionar(registro) {
        gravar([{ id: Date.now(), ...registro }, ...ler()]);
      },
      excluir(id) {
        gravar(ler().filter((r) => r.id !== id));
      },
      limpar() {
        gravar([]);
      },
    };
  }

  return {
    tempo: criar('painel-participacao:historico-tempo'),
    notas: criar('painel-participacao:historico-notas'),
  };
})();
