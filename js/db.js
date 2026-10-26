// Armazenamento local (IndexedDB) dos cadastros e seus áudios.
// musicas (Jogo das Notas): { id, titulo, artista, completa: Blob|null, notas: [Blob|null x7], criadoEm }
// rodadas (Jogo do Tempo): { id, nome, musicas: [{ titulo, audio: Blob|null } x10], criadoEm }
const DB = (() => {
  const NOME = 'painel-participacao';
  const VERSAO = 2;
  const STORES = ['musicas', 'rodadas'];
  let conexao = null;

  function abrir() {
    if (conexao) return conexao;
    conexao = new Promise((resolve, reject) => {
      const req = indexedDB.open(NOME, VERSAO);
      req.onupgradeneeded = () => {
        STORES.forEach((store) => {
          if (!req.result.objectStoreNames.contains(store)) {
            req.result.createObjectStore(store, { keyPath: 'id', autoIncrement: true });
          }
        });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return conexao;
  }

  async function executar(store, modo, acao) {
    const db = await abrir();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(store, modo);
      const req = acao(tx.objectStore(store));
      tx.oncomplete = () => resolve(req.result);
      tx.onerror = () => reject(tx.error);
    });
  }

  function colecao(store) {
    return {
      async listar() {
        const itens = await executar(store, 'readonly', (s) => s.getAll());
        return itens.sort((a, b) => a.criadoEm - b.criadoEm);
      },
      obter: (id) => executar(store, 'readonly', (s) => s.get(id)),
      salvar: (item) => executar(store, 'readwrite', (s) => s.put(item)),
      excluir: (id) => executar(store, 'readwrite', (s) => s.delete(id)),
    };
  }

  return {
    musicas: colecao('musicas'),
    rodadas: colecao('rodadas'),
  };
})();
