'use strict';

/* ================================================================
   ESTADO DO JOGO
   ================================================================ */
const Game = {
  saldo: 0,
  codigoSelecionado: "",
  animando: false
};

/* ================================================================
   PRODUTOS
   ================================================================ */
const produtos = {
  1: { img: "IMG/doce1.png", preco: 5,  nome: "Doce 1" },
  2: { img: "IMG/doce2.png", preco: 7,  nome: "Doce 2" },
  3: { img: "IMG/doce3.png", preco: 6,  nome: "Doce 3" },
  4: { img: "IMG/doce4.png", preco: 4,  nome: "Doce 4" },
  5: { img: "IMG/doce5.png", preco: 8,  nome: "Doce 5" },
  6: { img: "IMG/doce6.png", preco: 9,  nome: "Doce 6" },
  7: { img: "IMG/doce7.png", preco: 3,  nome: "Doce 7" },
  8: { img: "IMG/doce8.png", preco: 6,  nome: "Doce 8" },
  9: { img: "IMG/doce9.png", preco: 4,  nome: "Doce 9" }
};

const valoresMoeda = [1, 2, 10, 20, 50];
let logEventos = [];

/* ================================================================
   TELA DE ENTRADA
   ================================================================ */
function iniciarJogo() {
  const intro = document.getElementById('introScreen');
  const game  = document.getElementById('gameScreen');

  intro.classList.add('fade-out');

  setTimeout(() => {
    intro.style.display = 'none';
    game.style.display  = 'flex';
    game.classList.add('fade-in');

    // Inicializa a máquina após mostrar
    criarSlots();
    gerarMoedasIniciais();
    atualizarVisor();
    adicionarLog('Máquina iniciada', 'system');
    adicionarLog('Arraste moedas para inserir crédito', 'system');
  }, 800);
}

/* ================================================================
   ELEMENTOS DOM (obtidos depois que o jogo inicia)
   ================================================================ */
function getVisor()    { return document.getElementById("visor"); }
function getBandeja()  { return document.getElementById("deliveryInner"); }
function getFlap()     { return document.getElementById("deliveryFlap"); }
function getSlot()     { return document.getElementById("slotMoeda"); }
function getCarteira() { return document.getElementById("carteira"); }

/* ================================================================
   LOG
   ================================================================ */
function adicionarLog(mensagem, categoria = 'system') {
  const horario = new Date().toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit', second:'2-digit' });
  logEventos.push({ mensagem, categoria, horario });
}

/* ================================================================
   CRIAR SLOTS 3x3
   ================================================================ */
function criarSlots() {
  const container = document.getElementById("shelves");
  if (!container) return;
  container.innerHTML = "";

  for (let linha = 0; linha < 3; linha++) {
    const row = document.createElement("div");
    row.className = "shelf-row";

    for (let col = 0; col < 3; col++) {
      const i = linha * 3 + col + 1;
      const slot = document.createElement("div");
      slot.className = "slot";
      slot.id = `slot-${i}`;
      slot.innerHTML = `
        <div class="coil"></div>
        <div class="slot-num">${i}</div>
        <img src="${produtos[i].img}" class="produto-img" id="produto-img-${i}" onerror="this.style.opacity='0.3'">
        <div class="slot-preco">R$${produtos[i].preco}</div>
        <div class="slot-label">${i}</div>
      `;
      row.appendChild(slot);
    }
    container.appendChild(row);
  }

  const strip = document.getElementById("priceStrip");
  if (!strip) return;
  strip.innerHTML = "";
  for (let i = 1; i <= 9; i++) {
    const tag = document.createElement("div");
    tag.className = "price-tag";
    tag.textContent = `${i}·R$${produtos[i].preco}`;
    strip.appendChild(tag);
  }
}

/* ================================================================
   MOEDAS ARRASTÁVEIS
   ================================================================ */
function adicionarMoeda(valor) {
  const carteira = getCarteira();
  if (!carteira) return;

  const moeda = document.createElement("div");
  moeda.className = "moeda";
  moeda.draggable = true;
  moeda.dataset.valor = valor;
  moeda.innerHTML = `<img src="IMG/moeda${valor}.png" class="moeda-img" 
    onerror="this.parentElement.innerHTML='<div style=\\'width:52px;height:52px;border-radius:50%;background:radial-gradient(circle,#e080ff,#7a00b3);border:2px solid #b100ff;display:flex;align-items:center;justify-content:center;color:#fff;font-size:.65rem;font-weight:bold;\\'>R$${valor}</div>'">`;
  moeda.addEventListener("dragstart", arrastar);
  moeda.addEventListener("dragend",   () => moeda.classList.remove("arrastando"));
  carteira.appendChild(moeda);
}

function gerarMoedasIniciais() {
  const carteira = getCarteira();
  if (!carteira) return;
  carteira.innerHTML = '';
  // Label da carteira
  const label = document.createElement('div');
  label.style.cssText = 'font-size:.4rem;color:rgba(177,0,255,.6);letter-spacing:1px;margin-bottom:4px;text-align:center;';
  label.textContent = '💰 MOEDAS';
  carteira.appendChild(label);

  for (let i = 0; i < 6; i++) {
    const v = valoresMoeda[Math.floor(Math.random() * valoresMoeda.length)];
    adicionarMoeda(v);
  }
}

/* ================================================================
   VISOR
   ================================================================ */
function atualizarVisor(mensagem = null) {
  const v = getVisor();
  if (!v) return;
  v.innerText = (mensagem ? mensagem + "\n" : "") + `SALDO: R$${Game.saldo}`;
}

/* ================================================================
   TECLADO
   ================================================================ */
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
  Game.codigoSelecionado = Game.codigoSelecionado.slice(0, -1);
  atualizarVisor(Game.codigoSelecionado ? `CÓDIGO: ${Game.codigoSelecionado}` : null);
}

/* ================================================================
   DRAG & DROP
   ================================================================ */
function arrastar(evento) {
  evento.dataTransfer.setData("valor", evento.target.closest('.moeda').dataset.valor);
  evento.target.closest('.moeda').classList.add("arrastando");
}

function inserirMoeda(evento) {
  if (Game.animando) return;
  const valor   = parseInt(evento.dataTransfer.getData("valor"));
  const moedaEl = document.querySelector(".moeda.arrastando");
  if (!moedaEl || isNaN(valor)) return;

  const imgSrc = moedaEl.querySelector("img")?.src || "";

  animarMoedaCaindo(imgSrc, valor, () => {
    Game.saldo += valor;
    moedaEl.remove();
    atualizarVisor();
    adicionarLog(`Moeda R$${valor},00 inserida`, 'coin');
    gatoEspia();
  });
}

function animarMoedaCaindo(imgSrc, valor, callback) {
  const slot = getSlot();
  if (!slot) { callback(); return; }

  const moedaAnim = document.createElement("img");
  moedaAnim.src = imgSrc;
  moedaAnim.style.cssText = "position:absolute;top:0;left:50%;transform:translateX(-50%);width:36px;pointer-events:none;z-index:200;";
  moedaAnim.onerror = () => { moedaAnim.style.display = 'none'; };
  slot.appendChild(moedaAnim);

  let posY = 0, vel = 0, quicadas = 0;
  const maxY = 30;

  function cair() {
    vel += 0.6; posY += vel;
    moedaAnim.style.top = posY + "px";
    if (posY >= maxY) { posY = maxY; vel *= -0.4; quicadas++; }
    if (quicadas >= 2 && Math.abs(vel) < 1) {
      setTimeout(() => { moedaAnim.remove(); callback(); }, 180);
      return;
    }
    requestAnimationFrame(cair);
  }
  setTimeout(cair, 80);
}

/* ================================================================
   GATO — ESPIADA
   ================================================================ */
function gatoEspia() {
  const cat    = document.getElementById('catActor');
  const glassH = document.getElementById('glassFrame')?.offsetHeight || 376;
  cat.style.transition = 'none';
  cat.style.opacity    = '0';
  cat.style.left       = '-60px';
  cat.style.bottom     = `${glassH * 0.35}px`;
  setTimeout(() => {
    cat.style.transition = 'left .4s ease-out, opacity .15s';
    cat.style.opacity    = '1';
    cat.style.left       = '10px';
    setTimeout(() => {
      cat.style.transition = 'left .35s ease-in, opacity .2s .2s';
      cat.style.left       = '-60px';
      cat.style.opacity    = '0';
    }, 850);
  }, 50);
}

/* ================================================================
   GATO — DISPENSA
   ================================================================ */
function gatoDispensa(codigo, callback) {
  const cat       = document.getElementById('catActor');
  const catItem   = document.getElementById('catItem');
  const glassH    = document.getElementById('glassFrame')?.offsetHeight || 376;
  const prodImgEl = document.getElementById(`produto-img-${codigo}`);
  const shelfY    = glassH - (glassH / 4) * 2.3;

  cat.style.transition = 'none';
  cat.style.opacity    = '0';
  cat.style.left       = '-60px';
  cat.style.bottom     = `${shelfY}px`;
  catItem.className    = 'ca-item';
  catItem.innerHTML    = '';
  cat.classList.remove('idle');

  setTimeout(() => getFlap()?.classList.add('open'), 100);

  setTimeout(() => {
    cat.style.opacity    = '1';
    cat.style.transition = 'left .55s linear';
    cat.style.left       = '48px';

    setTimeout(() => {
      cat.style.transition = 'none';
      if (prodImgEl) {
        prodImgEl.style.transition = 'opacity .2s, transform .2s';
        prodImgEl.style.opacity    = '0';
        prodImgEl.style.transform  = 'scale(.4)';
      }
      catItem.className = 'ca-item has-item';
      catItem.innerHTML = `<img src="${produtos[codigo].img}" style="width:100%;height:100%;object-fit:contain;" onerror="this.style.display='none'">`;

      setTimeout(() => {
        cat.style.transition = 'left .5s linear, bottom .5s ease-in';
        cat.style.left       = '290px';
        cat.style.bottom     = '8px';

        setTimeout(() => {
          cat.style.transition = 'none';
          catItem.className    = 'ca-item';
          catItem.innerHTML    = '';
          cat.classList.add('idle');
          confetti();

          setTimeout(() => {
            cat.classList.remove('idle');
            cat.style.transition = 'left .4s linear, opacity .3s .25s';
            cat.style.left       = '380px';
            cat.style.opacity    = '0';
            setTimeout(callback, 500);
          }, 1400);
        }, 550);
      }, 280);
    }, 650);
  }, 200);
}

/* Confetti roxo */
function confetti() {
  const bin   = document.querySelector('.delivery-bin');
  const cores = ['#b100ff','#ff00ff','#ff60ff','#d400ff','#9000cc'];
  for (let i = 0; i < 10; i++) {
    const p = document.createElement('div');
    p.style.cssText = `position:absolute;width:5px;height:5px;border-radius:1px;pointer-events:none;z-index:200;
      left:${20+Math.random()*60}%;top:${40+Math.random()*20}%;
      background:${cores[Math.floor(Math.random()*cores.length)]};
      animation:confettiFall ${0.4+Math.random()*0.7}s ease-in ${Math.random()*0.3}s forwards;`;
    bin?.appendChild(p);
    setTimeout(() => p.remove(), 1800);
  }
}
const _s = document.createElement('style');
_s.textContent = `@keyframes confettiFall{0%{transform:translateY(-10px) rotate(0);opacity:1}100%{transform:translateY(90px) rotate(720deg);opacity:0}}`;
document.head.appendChild(_s);

/* ================================================================
   ANIMAÇÃO QUEDA DE PRODUTO
   ================================================================ */
function animarQuedaProduto(imgSrc, callback) {
  Game.animando = true;
  const glassFrame = document.getElementById("glassFrame");
  const item = document.createElement("img");
  item.src   = imgSrc;
  item.style.cssText = "position:absolute;top:0;left:50%;transform:translateX(-50%);width:50px;pointer-events:none;z-index:100;";
  glassFrame?.appendChild(item);

  let posY = 0, velocidade = 0, rotacao = 0, quicadas = 0;

  setTimeout(() => {
    function cair() {
      velocidade += 0.85; posY += velocidade; rotacao += velocidade * 0.5;
      item.style.top       = posY + "px";
      item.style.transform = `translateX(-50%) rotate(${rotacao}deg)`;
      if (posY >= 260) { posY = 260; velocidade *= -0.45; quicadas++; }
      if (quicadas >= 2 && Math.abs(velocidade) < 1.2) {
        item.style.top = "260px";
        setTimeout(() => { item.remove(); Game.animando = false; callback(); }, 300);
        return;
      }
      requestAnimationFrame(cair);
    }
    cair();
  }, 350);
}

/* ================================================================
   COMPRA
   ================================================================ */
function comprar() {
  if (Game.animando) return;
  const produto = produtos[Game.codigoSelecionado];
  if (!produto)                        { atualizarVisor("CÓDIGO INVÁLIDO"); Game.codigoSelecionado = ""; return; }
  if (Game.saldo < produto.preco)      { atualizarVisor("SEM SALDO");      Game.codigoSelecionado = ""; return; }

  const codigo = parseInt(Game.codigoSelecionado);
  Game.saldo   -= produto.preco;
  adicionarLog(`Comprou ${produto.nome} por R$${produto.preco}`, 'buy');

  gatoDispensa(codigo, () => {
    const bandeja = getBandeja();
    bandeja.innerHTML = `<img src="${produto.img}" class="produto-img" style="max-height:32px" onerror="this.style.opacity='.5'">`;
    devolverTroco(bandeja);
    mostrarPopupMiau();
  });

  Game.codigoSelecionado = "";
  atualizarVisor();
}

  let restante = Game.saldo;
  Game.saldo   = 0;
  adicionarLog(`Troco devolvido: R$${restante}`, 'troco');

  const ordenado = [...valoresMoeda].sort((a, b) => b - a);
  while (restante > 0) {
    const moeda = ordenado.find(v => v <= restante);
    if (!moeda) break;
    restante -= moeda;
    adicionarMoeda(moeda);
  }
  atualizarVisor("TROCO DEVOLVIDO");
}

/* ================================================================
   BANDEJA
   ================================================================ */
function removerDoce() {
  const bandeja = getBandeja();
  if (bandeja?.innerHTML.trim() !== "") {
    getFlap()?.classList.remove('open');
    bandeja.innerHTML = "";
  }
}

/* ================================================================
   TROCO — chamado automaticamente após cada compra
   ================================================================ */
function devolverTroco(bandeja) {
  if (Game.saldo <= 0) return;
  let restante = Game.saldo;
  Game.saldo = 0;
  adicionarLog(`Troco automático: R$${restante}`, 'troco');

  const ordenado = [...valoresMoeda].sort((a, b) => b - a);
  const moedasTroco = [];
  while (restante > 0) {
    const moeda = ordenado.find(v => v <= restante);
    if (!moeda) break;
    restante -= moeda;
    moedasTroco.push(moeda);
  }

  moedasTroco.forEach((v, idx) => {
    setTimeout(() => {
      if (bandeja) {
        const mc = document.createElement('img');
        mc.src = `IMG/moeda${v}.png`;
        mc.style.cssText = 'max-height:26px;margin:0 2px;vertical-align:middle;';
        mc.onerror = () => {
          const sp = document.createElement('span');
          sp.textContent = `R$${v}`;
          sp.style.cssText = 'font-size:.55rem;color:#e0b0ff;padding:2px 4px;background:#2a0040;border-radius:3px;margin:1px;display:inline-block;';
          mc.replaceWith(sp);
        };
        bandeja.appendChild(mc);
      }
      adicionarMoeda(v);
    }, idx * 130);
  });
  atualizarVisor();
}

/* ================================================================
   POPUP MIAU
   ================================================================ */
function mostrarPopupMiau() {
  const overlay = document.createElement('div');
  overlay.className = 'sobreposicao ativa';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;z-index:9999;';
  overlay.innerHTML = '<div class="popup-miau">🐱 Miau! Pegue seus docinhos.</div>';
  document.body.appendChild(overlay);
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  setTimeout(() => { overlay.remove(); mostrarRelatorio(); }, 2000);
}

/* ================================================================
   RELATÓRIO
   ================================================================ */
function mostrarRelatorio() {
  const body = document.getElementById('popupBody');
  if (!body) return;
  body.innerHTML = '';

  const resumo = document.createElement('div');
  resumo.className = 'popup-purchase';
  resumo.innerHTML = `
    <div class="icon">🍬</div>
    <div class="info">
      <div class="title">COMPRA REALIZADA!</div>
      <div class="detail">Saldo restante: <strong>R$${Game.saldo},00</strong></div>
    </div>
    <div style="font-size:1.5rem">✅</div>
  `;
  body.appendChild(resumo);

  const logSec = document.createElement('div');
  logSec.className = 'log-section';
  logSec.innerHTML = '<h3>▸ LOG DE EVENTOS</h3>';
  const entries = document.createElement('div');
  entries.className = 'log-entries';
  logEventos.forEach((e, i) => {
    const row = document.createElement('div');
    row.className = `log-entry ${e.categoria}`;
    row.style.animationDelay = `${i * 55}ms`;
    row.innerHTML = `<span class="log-time">${e.horario}</span><span class="log-text">${e.mensagem}</span>`;
    entries.appendChild(row);
  });
  logSec.appendChild(entries);
  body.appendChild(logSec);

  const overlay = document.getElementById('popupOverlay');
  overlay?.classList.add('visible');
  overlay?.setAttribute('aria-hidden', 'false');
}

function closePopup() {
  const overlay = document.getElementById('popupOverlay');
  overlay?.classList.remove('visible');
  overlay?.setAttribute('aria-hidden', 'true');
}

function restartMachine() {
  closePopup();
  Game.saldo = 0; Game.codigoSelecionado = ""; Game.animando = false;
  logEventos = [];

  getBandeja().innerHTML = '';
  getFlap()?.classList.remove('open');

  const cat = document.getElementById('catActor');
  if (cat) { cat.style.opacity = '0'; cat.style.left = '-60px'; cat.classList.remove('idle'); }

  document.querySelectorAll('.produto-img').forEach(img => {
    img.style.opacity = '1'; img.style.transform = 'none';
  });

  gerarMoedasIniciais();
  atualizarVisor();
  adicionarLog('Máquina reiniciada', 'system');
}
