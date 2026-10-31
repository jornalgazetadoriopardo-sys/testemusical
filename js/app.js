// Navegação entre as abas e inicialização dos módulos.
function ligarAbas(seletor, atributo, seletorViews) {
  const abas = document.querySelectorAll(seletor);
  abas.forEach((aba) => {
    aba.addEventListener('click', () => {
      // Só a prévia da administração para ao trocar de aba: vinhetas e jogos continuam tocando.
      if ((Player.atual() || '').startsWith('admin-')) Player.parar();
      abas.forEach((a) => a.classList.toggle('ativa', a === aba));
      document.querySelectorAll(seletorViews).forEach((v) => {
        v.classList.toggle('ativa', v.id === aba.dataset[atributo]);
      });
    });
  });
}

ligarAbas('.topo .aba', 'view', '.view');
ligarAbas('.subabas .aba', 'subview', '.subview');

Vinhetas.iniciar();
JogoNotas.iniciar();
JogoTempo.iniciar();
AdminNotas.iniciar(() => JogoNotas.carregar());
AdminTempo.iniciar(() => JogoTempo.carregar());
AdminVinhetas.iniciar(() => Vinhetas.carregar());
