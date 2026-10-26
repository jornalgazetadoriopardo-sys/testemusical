// Linha de arquivo de áudio usada nos formulários da administração:
// escolher arquivo, ouvir e remover.
const Slot = (() => {
  function nomeArquivo(blob) {
    return blob && blob.name ? blob.name : 'áudio salvo';
  }

  // extra: elemento opcional inserido entre o rótulo e o nome do arquivo.
  function criar({ rotulo, chave, obter, definir, extra }) {
    const slot = document.createElement('div');
    slot.className = 'slot-linha';
    slot.innerHTML = `
      <span class="slot-rotulo"></span>
      <span class="slot-arquivo"></span>
      <label class="btn secundario pequeno">Escolher arquivo
        <input type="file" accept="audio/*" hidden>
      </label>
      <button type="button" class="btn secundario pequeno ouvir">▶ Ouvir</button>
      <button type="button" class="btn perigo pequeno remover">Remover</button>
    `;
    slot.querySelector('.slot-rotulo').textContent = rotulo;
    if (extra) slot.insertBefore(extra, slot.querySelector('.slot-arquivo'));

    const atualizar = () => {
      const blob = obter();
      const arquivo = slot.querySelector('.slot-arquivo');
      arquivo.textContent = blob ? nomeArquivo(blob) : 'nenhum arquivo';
      arquivo.classList.toggle('vazio', !blob);
      slot.querySelector('.ouvir').disabled = !blob;
      slot.querySelector('.remover').disabled = !blob;
    };

    slot.querySelector('input[type="file"]').addEventListener('change', (e) => {
      const arquivo = e.target.files[0];
      if (arquivo) definir(arquivo);
      e.target.value = '';
      atualizar();
    });
    slot.querySelector('.ouvir').addEventListener('click', () => Player.alternar(obter(), `admin-${chave}`));
    slot.querySelector('.remover').addEventListener('click', () => {
      Player.parar();
      definir(null);
      atualizar();
    });

    atualizar();
    return slot;
  }

  return { criar };
})();
