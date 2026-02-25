// Criação da varivel produtos onde terá os doces
const produtos = {
  1: { img: "IMG/doce1.png", preco: 5 },
  2: { img: "IMG/doce2.png", preco: 7 },
  3: { img: "IMG/doce3.png", preco: 6 },
  4: { img: "IMG/doce4.png", preco: 4 },
  5: { img: "IMG/doce5.png", preco: 8 },
  6: { img: "IMG/doce6.png", preco: 9 },
  7: { img: "IMG/doce7.png", preco: 3 },
  8: { img: "IMG/doce8.png", preco: 6 },
  9: { img: "IMG/doce9.png", preco: 4 }
};

let saldo = 0;
let codigoSelecionado = "";
let jogadas = 10;

// Elementos 
const vidro = document.getElementById("vidro");
const carteira = document.getElementById("carteira");
const visor = document.getElementById("visor");
const overlay = document.getElementById("overlay");
const bandeja = document.getElementById("bandeja");

// Função Criação de produtos
for (let i = 1; i <= 9; i++) {
  const slot = document.createElement("div");
  slot.className = "slot";
  slot.innerHTML = `
    <div class="numero">${i}</div>
    <img src="${produtos[i].img}" class="produto-img">
    <div class="preco">R$${produtos[i].preco}</div>
  `;
  vidro.appendChild(slot);
}

// Função Criar moedas e atribuir valores (1,2,10,20 e 50)
const valoresMoeda = [1, 2, 10, 20, 50];

function adicionarMoeda(valor) {
  const moeda = document.createElement("div");
  moeda.className = "moeda";

  moeda.innerHTML = `
    <img src="IMG/moeda${valor}.png" class="moeda-img">
  `;

  //instancia o arrastar
  moeda.draggable = true;
  moeda.dataset.valor = valor;
  moeda.ondragstart = arrastar;
  carteira.appendChild(moeda);
}

// Gera moedas aleatórias
for (let i = 0; i < 6; i++) {
  const valorAleatorio =
    valoresMoeda[Math.floor(Math.random() * valoresMoeda.length)];
  adicionarMoeda(valorAleatorio);
}

// Função responsavel pela a Atualização do visor
function atualizarVisor(mensagem = null) {
  visor.innerText =
    (mensagem ? mensagem + " | " : "") +
    `SALDO: R$${saldo} | JOGADAS: ${jogadas}`;
}

// Teclado da Maquina
function pressionar(numero) {
  codigoSelecionado += numero;

  if (parseInt(codigoSelecionado) > 9) {
    atualizarVisor("CÓDIGO INVÁLIDO");
    codigoSelecionado = "";
    return;
  }

  atualizarVisor(`CÓDIGO: ${codigoSelecionado}`);
}

function apagarNumero() {
  codigoSelecionado = codigoSelecionado.slice(0, -1);
  atualizarVisor(
    codigoSelecionado ? `CÓDIGO: ${codigoSelecionado}` : null
  );
}

// Função de Arrastar as moedas 
function arrastar(evento) {
  evento.dataTransfer.setData("valor", evento.target.dataset.valor);
  evento.target.classList.add("arrastando");
}

function inserirMoeda(evento) {
  const valor = parseInt(evento.dataTransfer.getData("valor"));
  const moeda = document.querySelector(".arrastando");

  if (!moeda || isNaN(valor)) return;

  saldo += valor;
  moeda.remove();
  atualizarVisor();
}

// Funções de Compras/ casos invalidos
function comprar() {
  if (jogadas <= 0) {
    atualizarVisor("SEM JOGADAS");
    return;
  }

  const produto = produtos[codigoSelecionado];

  if (!produto) {
    atualizarVisor("CÓDIGO INVÁLIDO");
    codigoSelecionado = "";
    return;
  }

  if (saldo < produto.preco) {
    atualizarVisor("SEM SALDO");
    codigoSelecionado = "";
    return;
  }

  saldo -= produto.preco;
  jogadas--;

  const animacao = document.createElement("img");
  animacao.src = produto.img;
  animacao.className = "produto-cair";

  vidro.appendChild(animacao);

setTimeout(() => {
  animacao.remove();
  bandeja.innerHTML = `<img src="${produto.img}" class="produto-img">`;
}, 600);

  mostrarPopup();
  codigoSelecionado = "";
  atualizarVisor();
}

// Função de Devolver a moeda
function devolverTroco() {
  if (saldo <= 0) {
    atualizarVisor("SEM SALDO");
    return;
  }

  let restante = saldo;
  saldo = 0;

  while (restante > 0) {
    const moeda = valoresMoeda
      .filter(v => v <= restante)
      .sort((a, b) => b - a)[0];

    restante -= moeda;
    adicionarMoeda(moeda);
  }

  atualizarVisor("TROCO DEVOLVIDO");
}

// Função de Remover o item da bandeja
function removerDoce() {
  bandeja.innerHTML = "";
}

// Criação do PopUP=
function mostrarPopup() {
  overlay.classList.add("ativa");
  setTimeout(() => overlay.classList.remove("ativa"), 2000);
}

overlay.addEventListener("click", function (e) {
  if (e.target === overlay) {
    overlay.classList.remove("ativa");
  }
});

// Animação da moeda cair na entrada de moedas
function inserirMoeda(evento) {
  const valor = parseInt(evento.dataTransfer.getData("valor"));
  const moeda = document.querySelector(".arrastando");

  if (!moeda || isNaN(valor)) return;

  saldo += valor;

  // cria animação de cair 
  const animacao = document.createElement("img");
  animacao.src = `IMG/moeda${valor}.png`;
  animacao.className = "moeda-cair";
  animacao.style.left = "50%";

  document.getElementById("slotMoeda").appendChild(animacao);

  setTimeout(() => animacao.remove(), 600);

  moeda.remove();
  atualizarVisor();
}



