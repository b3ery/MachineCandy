
// ESTADO DO JOGO

const Game = {
  saldo: 0,
  codigoSelecionado: "",
  jogadas: 10,
  animando: false
};


// PRODUTOS

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


// ELEMENTOS


const vidro = document.getElementById("vidro");
const carteira = document.getElementById("carteira");
const visor = document.getElementById("visor");
const overlay = document.getElementById("overlay");
const bandeja = document.getElementById("bandeja");
const slotMoeda = document.getElementById("slotMoeda");


// ARRASTAR

slotMoeda.addEventListener("dragover", function(e){
  e.preventDefault();
});

slotMoeda.addEventListener("drop", inserirMoeda);


// INICIALIZAÇÃO


function criarSlots() {
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
}

const valoresMoeda = [1, 2, 10, 20, 50];

function adicionarMoeda(valor) {
  const moeda = document.createElement("div");
  moeda.className = "moeda";
  moeda.innerHTML = `<img src="IMG/moeda${valor}.png" class="moeda-img">`;
  moeda.draggable = true;
  moeda.dataset.valor = valor;
  moeda.addEventListener("dragstart", arrastar);
  carteira.appendChild(moeda);
}

function gerarMoedasIniciais() {
  for (let i = 0; i < 6; i++) {
    const valorAleatorio =
      valoresMoeda[Math.floor(Math.random() * valoresMoeda.length)];
    adicionarMoeda(valorAleatorio);
  }
}

==
// VISOR

function atualizarVisor(mensagem = null) {
  visor.innerText =
    (mensagem ? mensagem + " | " : "") +
    `SALDO: R$${Game.saldo} | JOGADAS: ${Game.jogadas}`;
}


// TECLADO

function pressionar(numero) {
  if (Game.animando) return;

  Game.codigoSelecionado += numero;

  if (parseInt(Game.codigoSelecionado) > 9) {
    atualizarVisor("CÓDIGO INVÁLIDO");
    Game.codigoSelecionado = "";
    return;
  }

  atualizarVisor(`CÓDIGO: ${Game.codigoSelecionado}`);
}

function apagarNumero() {
  Game.codigoSelecionado =
    Game.codigoSelecionado.slice(0, -1);

  atualizarVisor(
    Game.codigoSelecionado
      ? `CÓDIGO: ${Game.codigoSelecionado}`
      : null
  );
}

// MOEDA


function arrastar(evento) {
  evento.dataTransfer.setData(
    "valor",
    evento.target.dataset.valor
  );
  evento.target.classList.add("arrastando");
}

function inserirMoeda(evento) {
  if (Game.animando) return;

  const valor = parseInt(
    evento.dataTransfer.getData("valor")
  );

  const moeda = document.querySelector(".arrastando");

  if (!moeda || isNaN(valor)) return;

  Game.saldo += valor;
  moeda.remove();

  atualizarVisor();
}


// ANIMAÇÃO PRODUTO 


function animarQuedaProduto(imgSrc, callback) {
  Game.animando = true;

  const item = document.createElement("img");
  item.src = imgSrc;
  item.className = "produto-cair-real";
  vidro.appendChild(item);

  vidro.classList.add("ligado");

  let posY = 0;
  let velocidade = 0;
  let rotacao = 0;
  const gravidade = 0.85;
  let quicadas = 0;

  setTimeout(() => {

    function cair() {
      velocidade += gravidade;
      posY += velocidade;
      rotacao += velocidade * 0.5;

      item.style.top = posY + "px";
      item.style.transform =
        `translateX(-50%) rotate(${rotacao}deg)`;

      if (posY >= 260) {
        posY = 260;
        velocidade *= -0.45;
        quicadas++;
      }

      if (quicadas >= 2 &&
          Math.abs(velocidade) < 1.2) {

        item.style.top = "260px";

        setTimeout(() => {
          item.remove();
          vidro.classList.remove("ligado");
          Game.animando = false;
          callback();
        }, 300);

        return;
      }

      requestAnimationFrame(cair);
    }

    cair();

  }, 350);
}


// COMPRA


function comprar() {
  if (Game.animando) return;

  if (Game.jogadas <= 0) {
    atualizarVisor("SEM JOGADAS");
    return;
  }

  const produto =
    produtos[Game.codigoSelecionado];

  if (!produto) {
    atualizarVisor("CÓDIGO INVÁLIDO");
    Game.codigoSelecionado = "";
    return;
  }

  if (Game.saldo < produto.preco) {
    atualizarVisor("SEM SALDO");
    Game.codigoSelecionado = "";
    return;
  }

  Game.saldo -= produto.preco;
  Game.jogadas--;

  animarQuedaProduto(produto.img, () => {
    bandeja.innerHTML =
      `<img src="${produto.img}" class="produto-img">`;
    mostrarPopup();
  });

  Game.codigoSelecionado = "";
  atualizarVisor();
}


// TROCO


function devolverTroco() {
  if (Game.saldo <= 0) {
    atualizarVisor("SEM SALDO");
    return;
  }

  let restante = Game.saldo;
  Game.saldo = 0;

  while (restante > 0) {
    const moeda = valoresMoeda
      .filter(v => v <= restante)
      .sort((a, b) => b - a)[0];

    restante -= moeda;
    adicionarMoeda(moeda);
  }

  atualizarVisor("TROCO DEVOLVIDO");
}


// BANDEJA


function removerDoce() {
  bandeja.innerHTML = "";
}


// POPUP


function mostrarPopup() {
  overlay.classList.add("ativa");
  setTimeout(() => {
    overlay.classList.remove("ativa");
  }, 2000);
}

overlay.addEventListener("click", e => {
  if (e.target === overlay)
    overlay.classList.remove("ativa");
});

// INICIAR


criarSlots();
gerarMoedasIniciais();
atualizarVisor();
