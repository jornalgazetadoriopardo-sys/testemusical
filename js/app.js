// Navegação entre as abas e inicialização dos módulos.
document.querySelectorAll('.aba').forEach((aba) => {
  aba.addEventListener('click', () => {
    Player.parar();
    document.querySelectorAll('.aba').forEach((a) => a.classList.toggle('ativa', a === aba));
    document.querySelectorAll('.view').forEach((v) => v.classList.toggle('ativa', v.id === aba.dataset.view));
  });
});

JogoNotas.iniciar();
Admin.iniciar(() => JogoNotas.carregar());
