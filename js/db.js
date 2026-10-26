// Armazenamento local (IndexedDB) das músicas e seus áudios.
// Cada música: { id, titulo, artista, completa: Blob|null, notas: [Blob|null x7], criadoEm }
const DB = (() => {
  const NOME = 'painel-participacao';
  const VERSAO = 1;
  const STORE = 'musicas';
  let conexao = null;

  function abrir() {
    if (conexao) return conexao;
    conexao = new Promise((resolve, reject) => {
      const req = indexedDB.open(NOME, VERSAO);
      req.onupgradeneeded = () => {
        req.result.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return conexao;
  }

  async function executar(modo, acao) {
    const db = await abrir();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, modo);
      const req = acao(tx.objectStore(STORE));
      tx.oncomplete = () => resolve(req.result);
      tx.onerror = () => reject(tx.error);
    });
  }

  return {
    async listar() {
      const musicas = await executar('readonly', (s) => s.getAll());
      return musicas.sort((a, b) => a.criadoEm - b.criadoEm);
    },
    obter: (id) => executar('readonly', (s) => s.get(id)),
    salvar: (musica) => executar('readwrite', (s) => s.put(musica)),
    excluir: (id) => executar('readwrite', (s) => s.delete(id)),
  };
})();
