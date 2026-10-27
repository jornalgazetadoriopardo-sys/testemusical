// Histórico das participações do Jogo do Tempo, salvo no navegador (localStorage).
// Registro: { id, data, rodada, ouvinte, itens: [{ titulo, tempo, status }], total, respondidas }
const Historico = (() => {
  const CHAVE = 'painel-participacao:historico-tempo';
  let memoria = [];

  function ler() {
    try {
      const salvo = JSON.parse(localStorage.getItem(CHAVE));
      return Array.isArray(salvo) ? salvo : memoria;
    } catch {
      return memoria;
    }
  }

  function gravar(lista) {
    memoria = lista;
    try {
      localStorage.setItem(CHAVE, JSON.stringify(lista));
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
})();
