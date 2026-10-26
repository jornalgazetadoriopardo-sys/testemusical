// Navegação entre as abas e inicialização dos módulos.
function ligarAbas(seletor, atributo, seletorViews) {
  const abas = document.querySelectorAll(seletor);
  abas.forEach((aba) => {
    aba.addEventListener('click', () => {
      // Não interrompe a música de uma participação do Jogo do Tempo em andamento.
      if (!JogoTempo.emAndamento()) Player.parar();
      abas.forEach((a) => a.classList.toggle('ativa', a === aba));
      document.querySelectorAll(seletorViews).forEach((v) => {
        v.classList.toggle('ativa', v.id === aba.dataset[atributo]);
      });
    });
  });
}

ligarAbas('.topo .aba', 'view', '.view');
ligarAbas('.subabas .aba', 'subview', '.subview');

JogoNotas.iniciar();
JogoTempo.iniciar();
AdminNotas.iniciar(() => JogoNotas.carregar());
AdminTempo.iniciar(() => JogoTempo.carregar());
