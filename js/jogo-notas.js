// Jogo das Notas: o ouvinte escolhe quantas notas ouvir (1 a 7) e tenta adivinhar a música.
// Acertando, ganha os pontos configurados para a maior quantidade de notas que ouviu; errando, 0.
const JogoNotas = (() => {
  const TOTAL_NOTAS = 7;
  const el = (id) => document.getElementById(id);

  let musicas = [];
  let selecionada = null;
  // Notas já tocadas por música na jogada atual: { [id]: Set<numero> }
  const tocadas = {};
  // Músicas já jogadas nesta sessão (marcadas na lista).
  const jogadas = new Set();

  async function carregar() {
    musicas = await DB.musicas.listar();
    if (selecionada) {
      selecionada = musicas.find((m) => m.id === selecionada.id) || null;
    }
    renderMusicas();
    renderNotas();
  }

  function rotuloNotas(n) {
    return `${n} ${n === 1 ? 'nota' : 'notas'}`;
  }

  // Maior quantidade de notas que o ouvinte já ouviu da música selecionada.
  function notasOuvidas() {
    const conjunto = selecionada && tocadas[selecionada.id];
    return conjunto && conjunto.size ? Math.max(...conjunto) : 0;
  }

  function renderMusicas() {
    const lista = el('lista-musicas-jogo');
    lista.innerHTML = '';
    el('sem-musicas').hidden = musicas.length > 0;

    musicas.forEach((m, i) => {
      const btn = document.createElement('button');
      btn.className = 'btn musica';
      if (selecionada && selecionada.id === m.id) btn.classList.add('selecionada');
      if (jogadas.has(m.id) || (tocadas[m.id] && tocadas[m.id].size)) btn.classList.add('usada');
      btn.innerHTML = `<span class="num">${i + 1}</span><span class="nome"></span>`;
      btn.querySelector('.nome').textContent = m.titulo;
      btn.addEventListener('click', () => selecionar(m.id));
      lista.appendChild(btn);
    });
  }

  function selecionar(id) {
    Player.parar();
    selecionada = musicas.find((m) => m.id === id) || null;
    el('resultado-notas').hidden = true;
    renderMusicas();
    renderNotas();
  }

  function renderNotas() {
    el('area-notas').hidden = !selecionada;
    if (!selecionada) return;

    el('titulo-em-jogo').textContent = selecionada.titulo;
    el('artista-em-jogo').textContent = selecionada.artista || '';
    el('btn-completa').disabled = !selecionada.completa;

    const pontos = Pontuacao.obter();
    const grade = el('botoes-notas');
    grade.innerHTML = '';
    const jaTocadas = tocadas[selecionada.id] || new Set();

    for (let n = 1; n <= TOTAL_NOTAS; n++) {
      const btn = document.createElement('button');
      btn.className = 'btn nota';
      btn.dataset.chave = `nota-${n}`;
      btn.innerHTML = `
        <span class="qtd">${n}</span>
        <span class="rotulo">${n === 1 ? 'nota' : 'notas'}</span>
        <span class="pts">${pontos[n - 1]} pts</span>
      `;
      btn.disabled = !selecionada.notas[n - 1];
      if (jaTocadas.has(n)) btn.classList.add('tocada');
      btn.addEventListener('click', () => tocarNota(n));
      grade.appendChild(btn);
    }
    marcarTocando(Player.atual());
    renderValendo();
  }

  function renderValendo() {
    const ouvidas = notasOuvidas();
    el('valendo-pontos').textContent = ouvidas ? `${Pontuacao.valor(ouvidas)} pts` : '—';
    el('valendo-detalhe').textContent = ouvidas
      ? `ouvindo ${rotuloNotas(ouvidas)}`
      : 'toque as notas que o ouvinte escolher';
    el('btn-acertou').disabled = !ouvidas;
    el('btn-errou').disabled = !ouvidas;
  }

  function tocarNota(n) {
    if (!selecionada || !selecionada.notas[n - 1]) return;
    (tocadas[selecionada.id] ||= new Set()).add(n);
    el('resultado-notas').hidden = true;
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
    el('resultado-notas').hidden = true;
    renderMusicas();
    renderNotas();
  }

  function marcarTocando(chave = null) {
    document.querySelectorAll('#jogo-notas [data-chave]').forEach((b) => {
      b.classList.toggle('tocando', b.dataset.chave === chave);
    });
  }

  // ---------- Resposta ----------

  function responder(acertou) {
    const ouvidas = notasOuvidas();
    if (!selecionada || !ouvidas) return;
    const campo = el('campo-ouvinte-notas');
    const ouvinte = campo.value.trim();
    if (!ouvinte) {
      el('aviso-ouvinte-notas').textContent = 'Digite o nome do ouvinte para registrar no ranking.';
      campo.focus();
      return;
    }

    const pontos = acertou ? Pontuacao.valor(ouvidas) : 0;
    Historico.notas.adicionar({
      data: new Date().toISOString(),
      ouvinte,
      musica: selecionada.titulo,
      notas: ouvidas,
      acertou,
      pontos,
    });

    Player.parar();
    delete tocadas[selecionada.id];
    jogadas.add(selecionada.id);
    campo.value = '';
    el('aviso-ouvinte-notas').textContent = '';

    el('resultado-notas').hidden = false;
    el('resultado-notas').classList.toggle('errou', !acertou);
    el('resultado-notas-titulo').textContent = acertou ? `${ouvinte} acertou!` : `${ouvinte} errou`;
    el('resultado-notas-pontos').textContent = `${pontos} pts`;
    el('resultado-notas-detalhe').textContent = `${selecionada.titulo} · ${rotuloNotas(ouvidas)}`;

    renderMusicas();
    renderNotas();
    renderPlacar();
  }

  // ---------- Ranking e histórico ----------

  function formatarData(iso) {
    return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
  }

  // Soma por ouvinte (o nome é comparado sem diferenciar maiúsculas e espaços extras).
  function calcularRanking(registros) {
    const porOuvinte = new Map();
    [...registros].reverse().forEach((r) => {
      const chave = r.ouvinte.trim().replace(/\s+/g, ' ').toLocaleLowerCase('pt-BR');
      const linha = porOuvinte.get(chave) || { nome: r.ouvinte.trim(), pontos: 0, acertos: 0, jogadas: 0 };
      linha.pontos += r.pontos;
      linha.acertos += r.acertou ? 1 : 0;
      linha.jogadas += 1;
      porOuvinte.set(chave, linha);
    });
    const linhas = [...porOuvinte.values()].sort((a, b) =>
      b.pontos - a.pontos || b.acertos - a.acertos || a.nome.localeCompare(b.nome, 'pt-BR'));
    // Empates em pontos e acertos dividem a mesma posição.
    linhas.forEach((linha, i) => {
      const anterior = linhas[i - 1];
      linha.posicao = anterior && anterior.pontos === linha.pontos && anterior.acertos === linha.acertos
        ? anterior.posicao
        : i + 1;
    });
    return linhas;
  }

  function celula(tr, texto, classe) {
    const td = document.createElement('td');
    td.textContent = texto;
    if (classe) td.className = classe;
    tr.appendChild(td);
    return td;
  }

  function renderPlacar() {
    const registros = Historico.notas.listar();
    el('btn-limpar-historico-notas').disabled = registros.length === 0;

    const ranking = calcularRanking(registros);
    const corpoRanking = el('tabela-ranking');
    corpoRanking.innerHTML = '';
    el('ranking-vazio').hidden = ranking.length > 0;
    el('tabela-ranking-wrap').hidden = ranking.length === 0;
    ranking.forEach((linha) => {
      const tr = document.createElement('tr');
      if (linha.posicao <= 3) tr.classList.add(`podio-${linha.posicao}`);
      celula(tr, `${linha.posicao}º`, 'num-col posicao');
      celula(tr, linha.nome);
      celula(tr, `${linha.acertos}/${linha.jogadas}`, 'num-col');
      celula(tr, `${linha.pontos}`, 'num-col pontos');
      corpoRanking.appendChild(tr);
    });

    const corpoHistorico = el('tabela-historico-notas');
    corpoHistorico.innerHTML = '';
    el('historico-notas-vazio').hidden = registros.length > 0;
    el('tabela-historico-notas-wrap').hidden = registros.length === 0;
    registros.forEach((r) => {
      const tr = document.createElement('tr');
      celula(tr, formatarData(r.data), 'num-col');
      celula(tr, r.ouvinte);
      celula(tr, r.musica);
      celula(tr, `${r.notas}`, 'num-col');
      celula(tr, r.acertou ? 'Acertou' : 'Errou', r.acertou ? 'res-acertou' : 'res-errou');
      celula(tr, `${r.pontos}`, 'num-col pontos');
      const acoes = celula(tr, '', 'acoes');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn perigo pequeno';
      btn.textContent = 'Excluir';
      btn.addEventListener('click', async () => {
        if (!await Confirmar.perguntar(`Excluir a jogada de ${r.ouvinte} (${r.musica})? Os pontos saem do ranking.`, 'Excluir')) return;
        Historico.notas.excluir(r.id);
        renderPlacar();
      });
      acoes.appendChild(btn);
      corpoHistorico.appendChild(tr);
    });
  }

  async function limparHistorico() {
    if (!await Confirmar.perguntar('Apagar todo o histórico e zerar o ranking do Jogo das Notas?', 'Apagar tudo')) return;
    Historico.notas.limpar();
    renderPlacar();
  }

  function ligarAbasPlacar() {
    const abas = document.querySelectorAll('.abas-placar .aba');
    abas.forEach((aba) => {
      aba.addEventListener('click', () => {
        abas.forEach((a) => {
          a.classList.toggle('ativa', a === aba);
          a.setAttribute('aria-selected', String(a === aba));
          el(a.dataset.painel).hidden = a !== aba;
        });
      });
    });
  }

  function teclado(e) {
    if (!el('jogo-notas').classList.contains('ativa') || Confirmar.aberta()) return;
    if (e.target.closest('input, textarea, select')) return;
    if (e.key >= '1' && e.key <= String(TOTAL_NOTAS)) {
      tocarNota(Number(e.key));
    } else if (e.key === 'm' || e.key === 'M') {
      tocarCompleta();
    } else if (e.key === 'a' || e.key === 'A') {
      responder(true);
    } else if (e.key === 'e' || e.key === 'E') {
      responder(false);
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
    el('btn-acertou').addEventListener('click', () => responder(true));
    el('btn-errou').addEventListener('click', () => responder(false));
    el('campo-ouvinte-notas').addEventListener('input', () => { el('aviso-ouvinte-notas').textContent = ''; });
    el('btn-limpar-historico-notas').addEventListener('click', limparHistorico);
    document.addEventListener('keydown', teclado);
    Player.aoMudar(marcarTocando);
    ligarAbasPlacar();
    renderPlacar();
    return carregar();
  }

  return { iniciar, carregar, TOTAL_NOTAS };
})();
