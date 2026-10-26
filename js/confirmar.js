// Janela de confirmação dentro da página (substitui o confirm() do navegador,
// que não aparece quando o painel é aberto por link).
const Confirmar = (() => {
  let resolver = null;

  function fechar(resposta) {
    document.getElementById('confirmacao').hidden = true;
    if (resolver) resolver(resposta);
    resolver = null;
  }

  function perguntar(mensagem, textoOk = 'Confirmar') {
    if (resolver) resolver(false);
    document.getElementById('confirmacao-texto').textContent = mensagem;
    document.getElementById('confirmacao-ok').textContent = textoOk;
    document.getElementById('confirmacao').hidden = false;
    document.getElementById('confirmacao-cancelar').focus();
    return new Promise((resolve) => { resolver = resolve; });
  }

  document.getElementById('confirmacao-ok').addEventListener('click', () => fechar(true));
  document.getElementById('confirmacao-cancelar').addEventListener('click', () => fechar(false));
  document.addEventListener('keydown', (e) => {
    if (resolver && e.key === 'Escape') fechar(false);
  });

  return { perguntar, aberta: () => resolver !== null };
})();
