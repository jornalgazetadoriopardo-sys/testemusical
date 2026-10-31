// Administração das vinhetas do Início: um áudio por botão, salvo assim que escolhido.
const AdminVinhetas = (() => {
  const el = (id) => document.getElementById(id);

  let audios = {};
  let aoAlterar = () => {};

  async function definir(id, arquivo) {
    audios[id] = arquivo;
    if (arquivo) await DB.vinhetas.salvar({ id, audio: arquivo });
    else await DB.vinhetas.excluir(id);
    aoAlterar();
  }

  // Cada linha também aceita o arquivo solto em cima dela.
  function aceitarSoltar(linha, id, atualizar) {
    const temArquivos = (e) => [...e.dataTransfer.types].includes('Files');
    linha.addEventListener('dragover', (e) => {
      if (!temArquivos(e)) return;
      e.preventDefault();
      linha.classList.add('alvo');
    });
    linha.addEventListener('dragleave', () => linha.classList.remove('alvo'));
    linha.addEventListener('drop', async (e) => {
      if (!temArquivos(e)) return;
      e.preventDefault();
      linha.classList.remove('alvo');
      const { audios: lista } = Arquivos.separar(e.dataTransfer.files);
      if (!lista.length) return;
      Player.parar();
      await definir(id, lista[0]);
      atualizar();
    });
  }

  function render() {
    const lista = el('slots-vinhetas');
    lista.innerHTML = '';
    Vinhetas.LISTA.forEach((v) => {
      const linha = document.createElement('div');
      linha.className = 'linha-rodada linha-vinheta';
      const slot = Slot.criar({
        rotulo: v.nome,
        chave: `vinheta-${v.id}`,
        obter: () => audios[v.id] || null,
        definir: (b) => { definir(v.id, b); },
      });
      linha.appendChild(slot);
      aceitarSoltar(linha, v.id, render);
      lista.appendChild(linha);
    });
  }

  async function iniciar(callbackAlteracao) {
    aoAlterar = callbackAlteracao || aoAlterar;
    const registros = await DB.vinhetas.listar();
    audios = Object.fromEntries(registros.map((r) => [r.id, r.audio]));
    render();
  }

  return { iniciar };
})();
