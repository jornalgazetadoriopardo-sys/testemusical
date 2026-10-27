// Pontos do Jogo das Notas por quantidade de notas ouvidas, salvos no navegador.
// Posição 0 = acertou ouvindo 1 nota; posição 6 = acertou ouvindo 7 notas.
const Pontuacao = (() => {
  const CHAVE = 'painel-participacao:pontuacao-notas';
  const PADRAO = [70, 60, 50, 40, 30, 20, 10];
  let memoria = [...PADRAO];

  function obter() {
    try {
      const salvo = JSON.parse(localStorage.getItem(CHAVE));
      if (Array.isArray(salvo) && salvo.length === PADRAO.length) return salvo;
    } catch {
      // Sem armazenamento disponível: usa o que estiver em memória.
    }
    return [...memoria];
  }

  function salvar(pontos) {
    memoria = [...pontos];
    try {
      localStorage.setItem(CHAVE, JSON.stringify(pontos));
    } catch {
      // Vale só enquanto a página estiver aberta.
    }
  }

  return {
    obter,
    salvar,
    padrao: () => [...PADRAO],
    // Pontos de quem acertou ouvindo `notas` notas.
    valor: (notas) => obter()[notas - 1] ?? 0,
  };
})();
