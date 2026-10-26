// Jogo das Notas: operador escolhe a música e toca de 1 a 7 notas ou a música inteira.
const JogoNotas = (() => {
  const TOTAL_NOTAS = 7;
  const el = (id) => document.getElementById(id);

  let musicas = [];
  let selecionada = null;
  // Notas já tocadas por música nesta sessão: { [id]: Set<numero> }
  const tocadas = {};

  async function carregar() {
    musicas = await DB.listar();
    if (selecionada) {
      selecionada = musicas.find((m) => m.id === selecionada.id) || null;
    }
    renderMusicas();
    renderNotas();
  }

  function renderMusicas() {
    const lista = el('lista-musicas-jogo');
    lista.innerHTML = '';
    el('sem-musicas').hidden = musicas.length > 0;

    musicas.forEach((m, i) => {
      const btn = document.createElement('button');
      btn.className = 'btn musica';
      if (selecionada && selecionada.id === m.id) btn.classList.add('selecionada');
      if (tocadas[m.id] && tocadas[m.id].size) btn.classList.add('usada');
      btn.innerHTML = `<span class="num">${i + 1}</span><span class="nome"></span>`;
      btn.querySelector('.nome').textContent = m.titulo;
      btn.addEventListener('click', () => selecionar(m.id));
      lista.appendChild(btn);
    });
  }

  function selecionar(id) {
    Player.parar();
    selecionada = musicas.find((m) => m.id === id) || null;
    renderMusicas();
    renderNotas();
  }

  function renderNotas() {
    el('area-notas').hidden = !selecionada;
    if (!selecionada) return;

    el('titulo-em-jogo').textContent = selecionada.titulo;
    el('artista-em-jogo').textContent = selecionada.artista || '';
    el('btn-completa').disabled = !selecionada.completa;

    const grade = el('botoes-notas');
    grade.innerHTML = '';
    const jaTocadas = tocadas[selecionada.id] || new Set();

    for (let n = 1; n <= TOTAL_NOTAS; n++) {
      const btn = document.createElement('button');
      btn.className = 'btn nota';
      btn.dataset.chave = `nota-${n}`;
      btn.innerHTML = `<span class="qtd">${n}</span><span class="rotulo">${n === 1 ? 'nota' : 'notas'}</span>`;
      btn.disabled = !selecionada.notas[n - 1];
      if (jaTocadas.has(n)) btn.classList.add('tocada');
      btn.addEventListener('click', () => tocarNota(n));
      grade.appendChild(btn);
    }
    marcarTocando(Player.atual());
  }

  function tocarNota(n) {
    if (!selecionada || !selecionada.notas[n - 1]) return;
    (tocadas[selecionada.id] ||= new Set()).add(n);
    Player.alternar(selecionada.notas[n - 1], `nota-${n}`);
    renderMusicas();
    renderNotas();
  }

  function tocarCompleta() {
    if (!selecionada || !selecionada.completa) return;
    Player.alternar(selecionada.completa, 'completa');
  }

  function zerar() {
    if (!selecionada) return;
    Player.parar();
    delete tocadas[selecionada.id];
    renderMusicas();
    renderNotas();
  }

  function marcarTocando(chave = null) {
    document.querySelectorAll('#jogo-notas [data-chave]').forEach((b) => {
      b.classList.toggle('tocando', b.dataset.chave === chave);
    });
  }

  function teclado(e) {
    if (!el('jogo-notas').classList.contains('ativa')) return;
    if (e.target.closest('input, textarea, select')) return;
    if (e.key >= '1' && e.key <= String(TOTAL_NOTAS)) {
      tocarNota(Number(e.key));
    } else if (e.key === 'm' || e.key === 'M') {
      tocarCompleta();
    } else if (e.key === 'Escape' || e.key === ' ') {
      e.preventDefault();
      Player.parar();
    }
  }

  function iniciar() {
    el('btn-completa').dataset.chave = 'completa';
    el('btn-completa').addEventListener('click', tocarCompleta);
    el('btn-parar').addEventListener('click', Player.parar);
    el('btn-zerar').addEventListener('click', zerar);
    document.addEventListener('keydown', teclado);
    Player.aoMudar(marcarTocando);
    return carregar();
  }

  return { iniciar, carregar, TOTAL_NOTAS };
})();
