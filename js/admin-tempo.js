// Administração do Jogo do Tempo: cadastro, edição e exclusão das rodadas de 10 músicas.
const AdminTempo = (() => {
  const el = (id) => document.getElementById(id);

  let editandoId = null;
  let rascunho = novoRascunho();
  let aoAlterar = () => {};
  let arrastando = null;

  function novoRascunho() {
    return Array.from({ length: JogoTempo.TOTAL_MUSICAS }, () => ({ titulo: '', audio: null }));
  }

  function definirAudio(musica, arquivo) {
    musica.audio = arquivo;
    if (arquivo && !musica.titulo.trim()) musica.titulo = Arquivos.tituloDoArquivo(arquivo.name);
  }

  function mover(de, para) {
    if (para < 0 || para >= rascunho.length || de === para) return;
    Player.parar();
    const [item] = rascunho.splice(de, 1);
    rascunho.splice(para, 0, item);
    renderSlots();
  }

  // Distribui os arquivos, em ordem de nome, nas posições vazias.
  function distribuir(lista) {
    const { audios, ignorados } = Arquivos.separar(lista);
    const vazias = rascunho.filter((m) => !m.audio);
    audios.slice(0, vazias.length).forEach((arquivo, i) => definirAudio(vazias[i], arquivo));
    renderSlots();

    const avisos = [];
    if (audios.length > vazias.length) {
      avisos.push(`${audios.length - vazias.length} arquivo(s) ficaram de fora: não há posições vazias suficientes.`);
    }
    if (ignorados) avisos.push(`${ignorados} arquivo(s) ignorados por não serem áudio.`);
    el('aviso-arquivos').textContent = avisos.join(' ');
  }

  function limparTodas() {
    Player.parar();
    rascunho = novoRascunho();
    el('aviso-arquivos').textContent = '';
    renderSlots();
  }

  function criarLinha(musica, i) {
    const linha = document.createElement('div');
    linha.className = 'linha-rodada';
    linha.dataset.indice = i;

    const alca = document.createElement('span');
    alca.className = 'alca';
    alca.title = 'Arraste para mudar a ordem';
    alca.textContent = '⠿';
    alca.draggable = true;
    alca.addEventListener('dragstart', (e) => {
      arrastando = i;
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', String(i));
      e.dataTransfer.setDragImage(linha, 20, 20);
      linha.classList.add('arrastando');
    });
    alca.addEventListener('dragend', () => {
      arrastando = null;
      linha.classList.remove('arrastando');
    });
    linha.addEventListener('dragover', (e) => {
      if (arrastando === null) return;
      e.preventDefault();
      linha.classList.add('alvo');
    });
    linha.addEventListener('dragleave', () => linha.classList.remove('alvo'));
    linha.addEventListener('drop', (e) => {
      if (arrastando === null) return;
      e.preventDefault();
      mover(arrastando, i);
    });

    const titulo = document.createElement('input');
    titulo.type = 'text';
    titulo.id = `titulo-tempo-${i}`;
    titulo.className = 'slot-titulo';
    titulo.placeholder = 'Título da música';
    titulo.value = musica.titulo;
    titulo.addEventListener('input', () => { musica.titulo = titulo.value; });

    const slot = Slot.criar({
      rotulo: `${i + 1}`,
      chave: `tempo-${i}`,
      obter: () => musica.audio,
      definir: (b) => {
        definirAudio(musica, b);
        titulo.value = musica.titulo;
      },
      extra: titulo,
    });

    const setas = document.createElement('div');
    setas.className = 'setas';
    [['↑', 'Subir', i - 1], ['↓', 'Descer', i + 1]].forEach(([texto, dica, destino]) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn secundario pequeno';
      btn.textContent = texto;
      btn.title = dica;
      btn.setAttribute('aria-label', `${dica} música ${i + 1}`);
      btn.disabled = destino < 0 || destino >= rascunho.length;
      btn.addEventListener('click', () => mover(i, destino));
      setas.appendChild(btn);
    });

    linha.append(alca, slot, setas);
    return linha;
  }

  function renderSlots() {
    const lista = el('slots-tempo');
    lista.innerHTML = '';
    rascunho.forEach((musica, i) => lista.appendChild(criarLinha(musica, i)));
  }

  function ligarAreaArquivos() {
    Arquivos.ligarArea(el('area-arquivos'), el('entrada-arquivos'), distribuir);
    el('btn-limpar-musicas').addEventListener('click', limparTodas);
  }

  function limparFormulario() {
    editandoId = null;
    rascunho = novoRascunho();
    el('form-rodada').reset();
    el('titulo-form-rodada').textContent = 'Cadastrar rodada';
    el('btn-cancelar-rodada').hidden = true;
    el('aviso-arquivos').textContent = '';
    renderSlots();
  }

  async function editar(id) {
    const r = await DB.rodadas.obter(id);
    if (!r) return;
    Player.parar();
    editandoId = id;
    rascunho = r.musicas.map((m) => ({ ...m }));
    el('campo-nome-rodada').value = r.nome;
    el('titulo-form-rodada').textContent = `Editando: ${r.nome}`;
    el('btn-cancelar-rodada').hidden = false;
    renderSlots();
    el('form-rodada').scrollIntoView({ behavior: 'smooth' });
  }

  async function excluir(id, nome) {
    if (!await Confirmar.perguntar(`Excluir a rodada "${nome}"? Os áudios cadastrados serão apagados.`, 'Excluir')) return;
    Player.parar();
    await DB.rodadas.excluir(id);
    if (editandoId === id) limparFormulario();
    await renderTabela();
    aoAlterar();
  }

  async function salvar(e) {
    e.preventDefault();
    const nome = el('campo-nome-rodada').value.trim();
    if (!nome) return;

    const existente = editandoId ? await DB.rodadas.obter(editandoId) : null;
    const r = {
      nome,
      musicas: rascunho.map((m) => ({ titulo: m.titulo.trim(), audio: m.audio })),
      criadoEm: existente ? existente.criadoEm : Date.now(),
    };
    if (editandoId) r.id = editandoId;

    Player.parar();
    await DB.rodadas.salvar(r);
    limparFormulario();
    await renderTabela();
    aoAlterar();
  }

  async function renderTabela() {
    const rodadas = await DB.rodadas.listar();
    const corpo = el('tabela-rodadas');
    corpo.innerHTML = '';
    el('tabela-rodadas-vazia').hidden = rodadas.length > 0;

    rodadas.forEach((r) => {
      const comAudio = r.musicas.filter((m) => m.audio).length;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="t-nome"></td>
        <td>${comAudio}/${JogoTempo.TOTAL_MUSICAS}</td>
        <td class="acoes">
          <button type="button" class="btn secundario pequeno">Editar</button>
          <button type="button" class="btn perigo pequeno">Excluir</button>
        </td>
      `;
      tr.querySelector('.t-nome').textContent = r.nome;
      const [btnEditar, btnExcluir] = tr.querySelectorAll('button');
      btnEditar.addEventListener('click', () => editar(r.id));
      btnExcluir.addEventListener('click', () => excluir(r.id, r.nome));
      corpo.appendChild(tr);
    });
  }

  function iniciar(callbackAlteracao) {
    aoAlterar = callbackAlteracao || aoAlterar;
    el('form-rodada').addEventListener('submit', salvar);
    el('btn-cancelar-rodada').addEventListener('click', limparFormulario);
    ligarAreaArquivos();
    renderSlots();
    return renderTabela();
  }

  return { iniciar };
})();
