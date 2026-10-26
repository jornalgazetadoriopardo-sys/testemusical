// Administração do Jogo das Notas: cadastro, edição e exclusão das músicas e seus áudios.
const AdminNotas = (() => {
  const el = (id) => document.getElementById(id);

  let editandoId = null;
  let rascunho = novoRascunho();
  let aoAlterar = () => {};

  function novoRascunho() {
    return { completa: null, notas: Array(JogoNotas.TOTAL_NOTAS).fill(null) };
  }

  function renderSlots() {
    const completa = el('slot-completa');
    completa.innerHTML = '';
    completa.appendChild(Slot.criar({
      rotulo: 'Inteira',
      chave: 'completa',
      obter: () => rascunho.completa,
      definir: (b) => { rascunho.completa = b; },
    }));

    const notas = el('slots-notas');
    notas.innerHTML = '';
    for (let i = 0; i < JogoNotas.TOTAL_NOTAS; i++) {
      const rotulo = `${i + 1} ${i === 0 ? 'nota' : 'notas'}`;
      notas.appendChild(Slot.criar({
        rotulo,
        chave: `nota-${i + 1}`,
        obter: () => rascunho.notas[i],
        definir: (b) => { rascunho.notas[i] = b; },
      }));
    }
  }

  function limparFormulario() {
    editandoId = null;
    rascunho = novoRascunho();
    el('form-musica').reset();
    el('titulo-form').textContent = 'Cadastrar música';
    el('btn-cancelar').hidden = true;
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
    if (!confirm(`Excluir a música "${titulo}"? Os áudios cadastrados serão apagados.`)) return;
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
    renderSlots();
    return renderTabela();
  }

  return { iniciar };
})();
