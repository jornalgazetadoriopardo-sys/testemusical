// Recebimento de arquivos de áudio em lote: área de arrastar/clicar, filtro e ordenação.
const Arquivos = (() => {
  const EXTENSOES_AUDIO = /\.(mp3|wav|ogg|oga|m4a|aac|flac|wma|opus|webm)$/i;
  const temArquivos = (e) => [...e.dataTransfer.types].includes('Files');
  const areas = [];

  function ehAudio(arquivo) {
    return arquivo.type.startsWith('audio/') || EXTENSOES_AUDIO.test(arquivo.name);
  }

  // "03 - Asa_Branca.mp3" -> "Asa Branca"
  function tituloDoArquivo(nome) {
    const semExtensao = nome.replace(/\.[^.]+$/, '');
    const limpo = semExtensao
      .replace(/[_]+/g, ' ')
      .replace(/^\s*\d{1,3}\s*[-–.)_]?\s+/, '')
      .replace(/\s+/g, ' ')
      .trim();
    return limpo || semExtensao;
  }

  // Separa os áudios (em ordem de nome, com números em ordem natural) dos demais arquivos.
  function separar(lista) {
    const audios = [...lista]
      .filter(ehAudio)
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { numeric: true }));
    return { audios, ignorados: lista.length - audios.length };
  }

  // Liga uma área (clicável e que aceita arquivos soltos) a um input de arquivo.
  function ligarArea(area, entrada, aoReceber) {
    areas.push(area);
    area.addEventListener('click', () => entrada.click());
    area.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        entrada.click();
      }
    });
    entrada.addEventListener('change', () => {
      aoReceber(entrada.files);
      entrada.value = '';
    });
    area.addEventListener('dragover', (e) => {
      if (!temArquivos(e)) return;
      e.preventDefault();
      area.classList.add('ativa');
    });
    area.addEventListener('dragleave', () => area.classList.remove('ativa'));
    area.addEventListener('drop', (e) => {
      if (!temArquivos(e)) return;
      e.preventDefault();
      area.classList.remove('ativa');
      aoReceber(e.dataTransfer.files);
    });
  }

  // Evita que soltar um arquivo fora das áreas abra o áudio no lugar do painel.
  ['dragover', 'drop'].forEach((tipo) => {
    window.addEventListener(tipo, (e) => {
      if (temArquivos(e) && !areas.some((area) => area.contains(e.target))) e.preventDefault();
    });
  });

  return { ehAudio, tituloDoArquivo, separar, ligarArea };
})();
