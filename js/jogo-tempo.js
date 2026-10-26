// Jogo do Tempo: 10 músicas em sequência. "Próxima" registra o tempo de resposta
// e já toca a seguinte; "Pular" registra "pulou". Depois da última, volta às puladas.
const JogoTempo = (() => {
  const TOTAL_MUSICAS = 10;
  const el = (id) => document.getElementById(id);

  let rodadas = [];
  let rodada = null;
  let estado = novoEstado();
  let relogio = null;

  // status de cada música: 'pendente' | 'pulou' | 'respondeu'.
  // O tempo acumula todas as vezes que a música tocou (inclusive antes de ser pulada).
  function novoEstado() {
    return {
      itens: Array.from({ length: TOTAL_MUSICAS }, () => ({ tempo: 0, status: 'pendente' })),
      atual: -1,
      inicio: 0,
      finalizado: false,
    };
  }

  function emAndamento() {
    return estado.atual >= 0;
  }

  function formatarTempo(ms) {
    const decimos = Math.floor(ms / 100);
    const minutos = Math.floor(decimos / 600);
    const segundos = Math.floor((decimos % 600) / 10);
    const fracao = decimos % 10;
    if (minutos === 0) return `${segundos},${fracao} s`;
    return `${minutos}:${String(segundos).padStart(2, '0')},${fracao}`;
  }

  function decorrido() {
    return emAndamento() ? performance.now() - estado.inicio : 0;
  }

  function totalRespondido() {
    return estado.itens
      .filter((item) => item.status === 'respondeu')
      .reduce((soma, item) => soma + item.tempo, 0);
  }

  // ---------- Fluxo do jogo ----------

  function tocarAtual() {
    Player.tocar(rodada.musicas[estado.atual].audio, `tempo-${estado.atual}`);
    estado.inicio = performance.now();
    iniciarRelogio();
  }

  function encerrarAtual(status) {
    const item = estado.itens[estado.atual];
    item.tempo += decorrido();
    item.status = status;
  }

  // Próxima música ainda não respondida depois da atual; ao passar da última, volta ao início
  // (onde só restam as puladas). Pode retornar a própria atual se ela for a única pendente.
  function proximaPendente() {
    for (let k = 1; k <= TOTAL_MUSICAS; k++) {
      const i = (estado.atual + k) % TOTAL_MUSICAS;
      if (estado.itens[i].status !== 'respondeu') return i;
    }
    return -1;
  }

  function comecar() {
    if (!rodada || emAndamento() || estado.finalizado) return;
    estado.atual = 0;
    tocarAtual();
    render();
  }

  function avancar(status) {
    if (!emAndamento()) return;
    encerrarAtual(status);
    const proxima = proximaPendente();
    if (proxima === -1) {
      finalizar();
      return;
    }
    estado.atual = proxima;
    tocarAtual();
    render();
  }

  function finalizar() {
    if (emAndamento() && estado.itens[estado.atual].status !== 'respondeu') {
      // Encerrada antes de responder a música em execução: conta como pulada.
      encerrarAtual('pulou');
    }
    Player.parar();
    pararRelogio();
    estado.atual = -1;
    estado.finalizado = true;
    render();
  }

  async function reiniciar() {
    if (emAndamento() && !await Confirmar.perguntar('Descartar a participação em andamento?', 'Descartar')) return;
    Player.parar();
    pararRelogio();
    estado = novoEstado();
    render();
  }

  async function selecionarRodada(id) {
    if (rodada && rodada.id === id) return;
    if (emAndamento() && !await Confirmar.perguntar('Trocar de rodada descarta a participação em andamento. Continuar?', 'Trocar')) return;
    Player.parar();
    pararRelogio();
    rodada = rodadas.find((r) => r.id === id) || null;
    estado = novoEstado();
    renderRodadas();
    render();
  }

  // ---------- Relógio ----------

  function iniciarRelogio() {
    if (relogio) return;
    relogio = setInterval(atualizarTempos, 100);
  }

  function pararRelogio() {
    clearInterval(relogio);
    relogio = null;
  }

  function atualizarTempos() {
    if (!emAndamento()) return;
    const item = estado.itens[estado.atual];
    const info = document.querySelector(`#botoes-tempo [data-indice="${estado.atual}"] .info`);
    if (info) info.textContent = formatarTempo(item.tempo + decorrido());
    el('cronometro').textContent = formatarTempo(item.tempo + decorrido());
  }

  // ---------- Renderização ----------

  function renderRodadas() {
    const lista = el('lista-rodadas');
    lista.innerHTML = '';
    el('sem-rodadas').hidden = rodadas.length > 0;
    rodadas.forEach((r) => {
      const btn = document.createElement('button');
      btn.className = 'btn rodada';
      btn.textContent = r.nome;
      if (rodada && rodada.id === r.id) btn.classList.add('selecionada');
      btn.addEventListener('click', () => selecionarRodada(r.id));
      lista.appendChild(btn);
    });
  }

  function textoInfo(item, i) {
    if (i === estado.atual) return formatarTempo(item.tempo + decorrido());
    if (item.status === 'respondeu') return formatarTempo(item.tempo);
    if (item.status === 'pulou') return 'pulou';
    return '';
  }

  function render() {
    el('area-tempo').hidden = !rodada;
    if (!rodada) return;

    const grade = el('botoes-tempo');
    grade.innerHTML = '';
    estado.itens.forEach((item, i) => {
      const musica = rodada.musicas[i];
      const celula = document.createElement('div');
      celula.className = 'celula-tempo';
      celula.dataset.indice = i;
      celula.innerHTML = `
        <button class="btn musica-tempo"><span class="qtd">${i + 1}</span><span class="rotulo"></span></button>
        <span class="info"></span>
      `;
      const btn = celula.querySelector('button');
      btn.querySelector('.rotulo').textContent = musica.titulo || `Música ${i + 1}`;
      btn.classList.add(item.status);
      if (i === estado.atual) btn.classList.add('tocando');
      if (!musica.audio) btn.title = 'Sem áudio cadastrado';
      // Só o primeiro botão inicia a participação.
      btn.disabled = !(i === 0 && !emAndamento() && !estado.finalizado);
      btn.addEventListener('click', comecar);

      const info = celula.querySelector('.info');
      info.textContent = textoInfo(item, i);
      info.classList.toggle('pulou', item.status === 'pulou' && i !== estado.atual);
      grade.appendChild(celula);
    });

    el('btn-proxima').disabled = !emAndamento();
    el('btn-pular').disabled = !emAndamento();
    el('btn-finalizar').disabled = !emAndamento();

    const respondidas = estado.itens.filter((item) => item.status === 'respondeu').length;
    el('status-tempo').textContent = emAndamento()
      ? `Tocando a música ${estado.atual + 1} · ${respondidas} de ${TOTAL_MUSICAS} respondidas`
      : estado.finalizado
        ? 'Participação finalizada'
        : 'Clique no botão 1 para começar';
    el('cronometro').textContent = emAndamento()
      ? formatarTempo(estado.itens[estado.atual].tempo + decorrido())
      : '';

    el('resultado-tempo').hidden = !estado.finalizado;
    if (estado.finalizado) {
      el('total-tempo').textContent = formatarTempo(totalRespondido());
      el('resumo-tempo').textContent = `${respondidas} de ${TOTAL_MUSICAS} músicas respondidas`;
    }
  }

  async function carregar() {
    rodadas = await DB.rodadas.listar();
    if (rodada) {
      const atualizada = rodadas.find((r) => r.id === rodada.id);
      if (!atualizada) {
        Player.parar();
        pararRelogio();
        estado = novoEstado();
      }
      rodada = atualizada || null;
    }
    renderRodadas();
    render();
  }

  function teclado(e) {
    if (!el('jogo-tempo').classList.contains('ativa') || Confirmar.aberta()) return;
    if (e.target.closest('input, textarea, select')) return;
    if (e.key === 'Enter' || e.key === 'ArrowRight') {
      e.preventDefault();
      if (emAndamento()) avancar('respondeu');
      else comecar();
    } else if (e.key === 'p' || e.key === 'P') {
      avancar('pulou');
    }
  }

  function iniciar() {
    el('btn-proxima').addEventListener('click', () => avancar('respondeu'));
    el('btn-pular').addEventListener('click', () => avancar('pulou'));
    el('btn-finalizar').addEventListener('click', finalizar);
    el('btn-nova-participacao').addEventListener('click', reiniciar);
    document.addEventListener('keydown', teclado);
    return carregar();
  }

  return { iniciar, carregar, emAndamento, TOTAL_MUSICAS };
})();
