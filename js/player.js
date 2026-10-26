// Reprodutor único: tocar um áudio sempre interrompe o anterior.
const Player = (() => {
  const audio = new Audio();
  let urlAtual = null;
  let chaveAtual = null;
  const ouvintes = [];

  function avisar() {
    ouvintes.forEach((fn) => fn(chaveAtual));
  }

  function limpar() {
    if (urlAtual) URL.revokeObjectURL(urlAtual);
    urlAtual = null;
    chaveAtual = null;
  }

  function parar() {
    audio.pause();
    audio.removeAttribute('src');
    audio.load();
    limpar();
    avisar();
  }

  function tocar(blob, chave) {
    parar();
    if (!blob) return;
    urlAtual = URL.createObjectURL(blob);
    chaveAtual = chave;
    audio.src = urlAtual;
    audio.play().catch((erro) => {
      console.error('Falha ao tocar áudio', erro);
      parar();
    });
    avisar();
  }

  audio.addEventListener('ended', () => {
    limpar();
    avisar();
  });

  return {
    tocar,
    parar,
    // Toca a chave informada ou para, se ela já estiver tocando.
    alternar(blob, chave) {
      if (chaveAtual === chave) parar();
      else tocar(blob, chave);
    },
    aoMudar: (fn) => ouvintes.push(fn),
    atual: () => chaveAtual,
  };
})();
