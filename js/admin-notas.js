// Administração do Jogo das Notas: cadastro, edição e exclusão das músicas e seus áudios.
const AdminNotas = (() => {
  const el = (id) => document.getElementById(id);

  let editandoId = null;
  let rascunho = novoRascunho();
  let aoAlterar = () => {};

  function novoRascunho() {
    return { completa: null, notas: Array(JogoNotas.TOTAL_NOTAS).fill(null) };
  }

  function definirCompleta(arquivo) {
    rascunho.completa = arquivo;
    const titulo = el('campo-titulo');
    if (arquivo && !titulo.value.trim()) titulo.value = Arquivos.tituloDoArquivo(arquivo.name);
  }

  function moverNota(de, para) {
    if (para < 0 || para >= rascunho.notas.length) return;
    Player.parar();
    [rascunho.notas[de], rascunho.notas[para]] = [rascunho.notas[para], rascunho.notas[de]];
    renderSlots();
  }

  function renderSlots() {
    const completa = el('slot-completa');
    completa.innerHTML = '';
    completa.appendChild(Slot.criar({
      rotulo: 'Inteira',
      chave: 'completa',
      obter: () => rascunho.completa,
      definir: definirCompleta,
    }));

    const notas = el('slots-notas');
    notas.innerHTML = '';
    for (let i = 0; i < JogoNotas.TOTAL_NOTAS; i++) {
      const linha = document.createElement('div');
      linha.className = 'linha-rodada';
      const slot = Slot.criar({
        rotulo: `${i + 1} ${i === 0 ? 'nota' : 'notas'}`,
        chave: `nota-${i + 1}`,
        obter: () => rascunho.notas[i],
        definir: (b) => { rascunho.notas[i] = b; },
      });
      slot.classList.add('slot-nota');

      const setas = document.createElement('div');
      setas.className = 'setas';
      [['↑', 'Subir', i - 1], ['↓', 'Descer', i + 1]].forEach(([texto, dica, destino]) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn secundario pequeno';
        btn.textContent = texto;
        btn.title = `${dica} (troca com a posição vizinha)`;
        btn.setAttribute('aria-label', `${dica} o áudio de ${i + 1} ${i === 0 ? 'nota' : 'notas'}`);
        btn.disabled = destino < 0 || destino >= JogoNotas.TOTAL_NOTAS;
        btn.addEventListener('click', () => moverNota(i, destino));
        setas.appendChild(btn);
      });

      linha.append(slot, setas);
      notas.appendChild(linha);
    }
  }

  function avisar(id, partes) {
    el(id).textContent = partes.filter(Boolean).join(' ');
  }

  function receberCompleta(lista) {
    const { audios, ignorados } = Arquivos.separar(lista);
    if (audios.length) definirCompleta(audios[0]);
    renderSlots();
    avisar('aviso-completa', [
      audios.length > 1 && `Só o primeiro arquivo (${audios[0].name}) foi usado como música inteira.`,
      ignorados && `${ignorados} arquivo(s) ignorados por não serem áudio.`,
    ]);
  }

  // Distribui os áudios, em ordem de nome, nas posições de notas vazias.
  function receberNotas(lista) {
    const { audios, ignorados } = Arquivos.separar(lista);
    const vazias = rascunho.notas.map((a, i) => (a ? -1 : i)).filter((i) => i >= 0);
    audios.slice(0, vazias.length).forEach((arquivo, k) => { rascunho.notas[vazias[k]] = arquivo; });
    renderSlots();
    avisar('aviso-notas', [
      audios.length > vazias.length && `${audios.length - vazias.length} arquivo(s) ficaram de fora: não há posições vazias suficientes.`,
      ignorados && `${ignorados} arquivo(s) ignorados por não serem áudio.`,
    ]);
  }

  function limparNotas() {
    Player.parar();
    rascunho.notas = Array(JogoNotas.TOTAL_NOTAS).fill(null);
    el('aviso-notas').textContent = '';
    renderSlots();
  }

  // ---------- Pontuação ----------

  function renderPontuacao() {
    const pontos = Pontuacao.obter();
    const grade = el('campos-pontuacao');
    grade.innerHTML = '';
    pontos.forEach((valor, i) => {
      const campo = document.createElement('label');
      campo.className = 'campo-ponto';
      campo.innerHTML = `<span>${i + 1} ${i === 0 ? 'nota' : 'notas'}</span>`;
      const entrada = document.createElement('input');
      entrada.type = 'number';
      entrada.id = `ponto-${i + 1}`;
      entrada.min = '0';
      entrada.step = '1';
      entrada.inputMode = 'numeric';
      entrada.value = valor;
      entrada.addEventListener('input', salvarPontuacao);
      campo.appendChild(entrada);
      grade.appendChild(campo);
    });
  }

  function salvarPontuacao() {
    const pontos = [...el('campos-pontuacao').querySelectorAll('input')]
      .map((e) => Math.max(0, Math.round(Number(e.value) || 0)));
    Pontuacao.salvar(pontos);
    el('status-pontuacao').textContent = 'Pontuação salva.';
    aoAlterar();
  }

  function restaurarPontuacao() {
    Pontuacao.salvar(Pontuacao.padrao());
    renderPontuacao();
    el('status-pontuacao').textContent = 'Pontuação padrão restaurada.';
    aoAlterar();
  }

  function limparFormulario() {
    editandoId = null;
    rascunho = novoRascunho();
    el('form-musica').reset();
    el('titulo-form').textContent = 'Cadastrar música';
    el('btn-cancelar').hidden = true;
    el('aviso-completa').textContent = '';
    el('aviso-notas').textContent = '';
    renderSlots();
  }

  async function editar(id) {
    const musica = await DB.musicas.obter(id);
    if (!musica) return;
    Player.parar();
    editandoId = id;
    rascunho = { completa: musica.completa, notas: [...musica.notas] };
    el('campo-titulo').value = musica.titulo;
    el('campo-artista').value = musica.artista || '';
    el('titulo-form').textContent = `Editando: ${musica.titulo}`;
    el('btn-cancelar').hidden = false;
    renderSlots();
    el('form-musica').scrollIntoView({ behavior: 'smooth' });
  }

  async function excluir(id, titulo) {
    if (!await Confirmar.perguntar(`Excluir a música "${titulo}"? Os áudios cadastrados serão apagados.`, 'Excluir')) return;
    Player.parar();
    await DB.musicas.excluir(id);
    if (editandoId === id) limparFormulario();
    await renderTabela();
    aoAlterar();
  }

  async function salvar(e) {
    e.preventDefault();
    const titulo = el('campo-titulo').value.trim();
    if (!titulo) return;

    const existente = editandoId ? await DB.musicas.obter(editandoId) : null;
    const musica = {
      titulo,
      artista: el('campo-artista').value.trim(),
      completa: rascunho.completa,
      notas: rascunho.notas,
      criadoEm: existente ? existente.criadoEm : Date.now(),
    };
    if (editandoId) musica.id = editandoId;

    Player.parar();
    await DB.musicas.salvar(musica);
    limparFormulario();
    await renderTabela();
    aoAlterar();
  }

  async function renderTabela() {
    const musicas = await DB.musicas.listar();
    const corpo = el('tabela-musicas');
    corpo.innerHTML = '';
    el('tabela-vazia').hidden = musicas.length > 0;

    musicas.forEach((m) => {
      const qtdNotas = m.notas.filter(Boolean).length;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="t-titulo"></td>
        <td class="t-artista"></td>
        <td>${qtdNotas}/${JogoNotas.TOTAL_NOTAS}</td>
        <td>${m.completa ? '✔' : '—'}</td>
        <td class="acoes">
          <button type="button" class="btn secundario pequeno">Editar</button>
          <button type="button" class="btn perigo pequeno">Excluir</button>
        </td>
      `;
      tr.querySelector('.t-titulo').textContent = m.titulo;
      tr.querySelector('.t-artista').textContent = m.artista || '';
      const [btnEditar, btnExcluir] = tr.querySelectorAll('button');
      btnEditar.addEventListener('click', () => editar(m.id));
      btnExcluir.addEventListener('click', () => excluir(m.id, m.titulo));
      corpo.appendChild(tr);
    });
  }

  function iniciar(callbackAlteracao) {
    aoAlterar = callbackAlteracao || aoAlterar;
    el('form-musica').addEventListener('submit', salvar);
    el('btn-cancelar').addEventListener('click', limparFormulario);
    Arquivos.ligarArea(el('area-completa'), el('entrada-completa'), receberCompleta);
    Arquivos.ligarArea(el('area-notas-arquivos'), el('entrada-notas'), receberNotas);
    el('btn-limpar-notas').addEventListener('click', limparNotas);
    el('btn-pontuacao-padrao').addEventListener('click', restaurarPontuacao);
    renderPontuacao();
    renderSlots();
    return renderTabela();
  }

  return { iniciar };
})();
