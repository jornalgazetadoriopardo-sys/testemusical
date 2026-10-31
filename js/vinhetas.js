// Início: botões das vinhetas do programa (abertura, volta do intervalo etc.).
const Vinhetas = (() => {
  const LISTA = [
    { id: 'abertura', nome: 'Abertura' },
    { id: 'volta-intervalo', nome: 'Volta do intervalo' },
    { id: 'jogo-notas', nome: 'Jogo das notas' },
    { id: 'vitrola-musical', nome: 'Vitrola musical' },
    { id: 'encerramento', nome: 'Encerramento' },
  ];
  const el = (id) => document.getElementById(id);

  let audios = {};
  let duracoes = {};
  let relogio = null;

  const chave = (id) => `vinheta-${id}`;
  const idDaChave = (c) => (c && c.startsWith('vinheta-') ? c.slice(8) : null);

  function formatar(segundos) {
    if (!Number.isFinite(segundos)) return '';
    const total = Math.max(0, Math.round(segundos));
    return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
  }

  // Lê a duração de cada áudio sem tocar (para mostrar no botão).
  function medirDuracao(id, blob) {
    const url = URL.createObjectURL(blob);
    const sonda = new Audio();
    sonda.preload = 'metadata';
    sonda.addEventListener('loadedmetadata', () => {
      duracoes[id] = sonda.duration;
      URL.revokeObjectURL(url);
      render();
    }, { once: true });
    sonda.addEventListener('error', () => URL.revokeObjectURL(url), { once: true });
    sonda.src = url;
  }

  async function carregar() {
    const registros = await DB.vinhetas.listar();
    audios = {};
    duracoes = {};
    registros.forEach((r) => {
      if (!r.audio) return;
      audios[r.id] = r.audio;
      medirDuracao(r.id, r.audio);
    });
    render();
  }

  function tocar(id) {
    if (!audios[id]) return;
    Player.alternar(audios[id], chave(id));
  }

  function render() {
    const grade = el('botoes-vinhetas');
    grade.innerHTML = '';
    const tocando = idDaChave(Player.atual());

    LISTA.forEach((v, i) => {
      const btn = document.createElement('button');
      btn.className = 'btn vinheta';
      btn.dataset.vinheta = v.id;
      btn.disabled = !audios[v.id];
      btn.classList.toggle('tocando', tocando === v.id);
      btn.innerHTML = `
        <span class="tecla">${i + 1}</span>
        <span class="nome"></span>
        <span class="estado"></span>
        <span class="barra"><span class="preenchido"></span></span>
      `;
      btn.querySelector('.nome').textContent = v.nome;
      btn.querySelector('.estado').textContent = audios[v.id]
        ? (formatar(duracoes[v.id]) || 'pronta')
        : 'sem áudio cadastrado';
      btn.addEventListener('click', () => tocar(v.id));
      grade.appendChild(btn);
    });
    atualizarProgresso();
  }

  function atualizarProgresso() {
    const id = idDaChave(Player.atual());
    const btn = id && document.querySelector(`#botoes-vinhetas [data-vinheta="${id}"]`);
    if (!btn) return;
    const { atual, duracao } = Player.progresso();
    const total = Number.isFinite(duracao) ? duracao : duracoes[id];
    btn.querySelector('.estado').textContent = Number.isFinite(total)
      ? `${formatar(atual)} / ${formatar(total)} · faltam ${formatar(total - atual)}`
      : formatar(atual);
    btn.querySelector('.preenchido').style.width = Number.isFinite(total) && total > 0
      ? `${Math.min(100, (atual / total) * 100)}%`
      : '0%';
  }

  function aoMudarPlayer(chaveAtual) {
    clearInterval(relogio);
    relogio = null;
    if (idDaChave(chaveAtual)) relogio = setInterval(atualizarProgresso, 200);
    render();
    renderTocandoAgora(chaveAtual);
  }

  // Aviso no topo enquanto uma vinheta toca, visível em qualquer aba.
  function renderTocandoAgora(chaveAtual) {
    const id = idDaChave(chaveAtual);
    const vinheta = LISTA.find((v) => v.id === id);
    el('tocando-agora').hidden = !vinheta;
    if (vinheta) el('tocando-agora-nome').textContent = vinheta.nome;
  }

  function teclado(e) {
    if (!el('inicio').classList.contains('ativa') || Confirmar.aberta()) return;
    if (e.target.closest('input, textarea, select')) return;
    const n = Number(e.key);
    if (n >= 1 && n <= LISTA.length) {
      tocar(LISTA[n - 1].id);
    } else if (e.key === 'Escape' || e.key === ' ') {
      e.preventDefault();
      Player.parar();
    }
  }

  function iniciar() {
    el('btn-parar-vinheta').addEventListener('click', Player.parar);
    el('btn-parar-tocando-agora').addEventListener('click', Player.parar);
    document.addEventListener('keydown', teclado);
    Player.aoMudar(aoMudarPlayer);
    return carregar();
  }

  return { iniciar, carregar, LISTA };
})();
