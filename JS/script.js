'use strict';

/* ================================================================
   CATÁLOGO — 3 grupos fixos (A=R$6, B=R$7, C=R$8)
================================================================ */
const Produto = Object.freeze({
  A: Object.freeze({ codigo:'A', nome:'Doce A', preco:6 }),
  B: Object.freeze({ codigo:'B', nome:'Doce B', preco:7 }),
  C: Object.freeze({ codigo:'C', nome:'Doce C', preco:8 }),
  todos() { return [this.A, this.B, this.C]; },
});

// Sem estoque — compras ilimitadas
const SLOT_GRUPO = { 1:'A',2:'A',3:'A', 4:'B',5:'B',6:'B', 7:'C',8:'C',9:'C' };

/* ================================================================
   AFD — Estados Q
================================================================ */
const Estado = Object.freeze({
  S0:     Object.freeze({ id:'S0',     label:'R$0',  descricao:'Aguardando pagamento',                aceite:false }),
  S1:     Object.freeze({ id:'S1',     label:'R$1',  descricao:'R$1,00 inserido',                     aceite:false }),
  S2:     Object.freeze({ id:'S2',     label:'R$2',  descricao:'R$2,00 inserido',                     aceite:false }),
  S3:     Object.freeze({ id:'S3',     label:'R$3',  descricao:'R$3,00 inserido',                     aceite:false }),
  S4:     Object.freeze({ id:'S4',     label:'R$4',  descricao:'R$4,00 inserido',                     aceite:false }),
  S5:     Object.freeze({ id:'S5',     label:'R$5',  descricao:'R$5,00 inserido',                     aceite:false }),
  S6:     Object.freeze({ id:'S6',     label:'R$6',  descricao:'Saldo suficiente para Doce A',        aceite:false }),
  S7:     Object.freeze({ id:'S7',     label:'R$7',  descricao:'Saldo suficiente para Doce A ou B',   aceite:false }),
  S8:     Object.freeze({ id:'S8',     label:'R$8+', descricao:'Saldo suficiente para qualquer doce', aceite:false }),
  DISP_A: Object.freeze({ id:'DISP_A', label:'Doce A', descricao:'Doce A dispensado ✓', aceite:true, produto:'A' }),
  DISP_B: Object.freeze({ id:'DISP_B', label:'Doce B', descricao:'Doce B dispensado ✓', aceite:true, produto:'B' }),
  DISP_C: Object.freeze({ id:'DISP_C', label:'Doce C', descricao:'Doce C dispensado ✓', aceite:true, produto:'C' }),
  doSaldo(s) {
    if (s <= 0) return this.S0;
    if (s >= 8) return this.S8;
    return this[['S0','S1','S2','S3','S4','S5','S6','S7','S8'][s]];
  },
});

/* ================================================================
   ALFABETO Σ
================================================================ */
const Simbolo = Object.freeze({
  MOEDA_1:  Object.freeze({ id:'MOEDA_1',  valor:1, descricao:'Moeda R$1,00',        ehInsercao:true,  ehSelecao:false }),
  MOEDA_2:  Object.freeze({ id:'MOEDA_2',  valor:2, descricao:'Moeda R$2,00',        ehInsercao:true,  ehSelecao:false }),
  NOTA_5:   Object.freeze({ id:'NOTA_5',   valor:5, descricao:'Nota R$5,00',         ehInsercao:true,  ehSelecao:false }),
  SEL_A:    Object.freeze({ id:'SEL_A',    valor:0, descricao:'Selecionar Doce A',   ehInsercao:false, ehSelecao:true, codigoProduto:'A' }),
  SEL_B:    Object.freeze({ id:'SEL_B',    valor:0, descricao:'Selecionar Doce B',   ehInsercao:false, ehSelecao:true, codigoProduto:'B' }),
  SEL_C:    Object.freeze({ id:'SEL_C',    valor:0, descricao:'Selecionar Doce C',   ehInsercao:false, ehSelecao:true, codigoProduto:'C' }),
  CANCELAR: Object.freeze({ id:'CANCELAR', valor:0, descricao:'Cancelar / Devolver', ehInsercao:false, ehSelecao:false }),
  porCodigo(c) { return { A:this.SEL_A, B:this.SEL_B, C:this.SEL_C }[c]; },
});

/* ================================================================
   MOTOR AFD — M = (Q, Σ, δ, q₀, F)
================================================================ */
class AutomatoAFD {
  static SALDO_MAX = 15;

  constructor() {
    this._estado    = Estado.S0;
    this._saldo     = 0;
    this._historico = [];
  }

  transicao(simbolo) {
    if (this._estado.aceite) throw new Error('AFD em estado final. Reinicie.');
    const antes = this._estado;

    if      (simbolo.ehInsercao)           this._estado = this._inserir(simbolo.valor);
    else if (simbolo.ehSelecao)            this._estado = this._selecionar(simbolo);
    else if (simbolo === Simbolo.CANCELAR) this._estado = this._cancelar();
    else throw new Error(`Símbolo desconhecido: ${simbolo.id}`);

    const horario = new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
    this._historico.push({ origem:antes, simbolo, destino:this._estado, saldo:this._saldo, horario });
  }

  _inserir(valor) {
    this._saldo = Math.min(this._saldo + valor, AutomatoAFD.SALDO_MAX);
    return Estado.doSaldo(this._saldo);
  }

  _selecionar(simbolo) {
    const prod = Produto[simbolo.codigoProduto];
    if (this._saldo < prod.preco) throw new Error('Saldo insuficiente');
    this._saldo -= prod.preco; // saldo restante = troco
    return { A:Estado.DISP_A, B:Estado.DISP_B, C:Estado.DISP_C }[simbolo.codigoProduto];
  }

  _cancelar() { this._saldo = 0; return Estado.S0; }

  get estado()    { return this._estado; }
  get saldo()     { return this._saldo; }
  get aceite()    { return this._estado.aceite; }
  get historico() { return [...this._historico]; }
  podeComprar(p)  { return this._saldo >= p.preco; }

  reiniciarParaNovaCompra() { this._estado = Estado.S0; this._saldo = 0; }
  reiniciarTudo()           { this._estado = Estado.S0; this._saldo = 0; this._historico = []; }
}

/* ================================================================
   ESTADO GLOBAL
================================================================ */
const automato        = new AutomatoAFD();
let codigoSelecionado = '';
let animando          = false;
let logEventos        = [];
let totalComprasSessao = 0;

/* ================================================================
   SOM — Web Audio API (sem arquivos externos)
================================================================ */
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function getAudio() {
  if (!audioCtx) audioCtx = new AudioCtx();
  return audioCtx;
}

function somMoeda() {
  try {
    const ctx = getAudio();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.start(); osc.stop(ctx.currentTime + 0.12);
  } catch(e) {}
}

function somCompra() {
  try {
    const ctx = getAudio();
    const notas = [523, 659, 784, 1047];
    notas.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
      gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.1);
      osc.start(ctx.currentTime + i * 0.1);
      osc.stop(ctx.currentTime + i * 0.1 + 0.1);
    });
  } catch(e) {}
}

function somCancelar() {
  try {
    const ctx = getAudio();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.start(); osc.stop(ctx.currentTime + 0.2);
  } catch(e) {}
}

function somDesbloqueio() {
  try {
    const ctx = getAudio();
    [600, 900].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.07);
      gain.gain.setValueAtTime(0.18, ctx.currentTime + i * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.07 + 0.12);
      osc.start(ctx.currentTime + i * 0.07);
      osc.stop(ctx.currentTime + i * 0.07 + 0.12);
    });
  } catch(e) {}
}

/* ================================================================
   UTILITÁRIOS DOM
================================================================ */
function getVisor()   { return document.getElementById('visor'); }
function getBandeja() { return document.getElementById('deliveryInner'); }
function getFlap()    { return document.getElementById('deliveryFlap'); }

function adicionarLog(msg, cat='system') {
  const h = new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
  logEventos.push({ mensagem:msg, categoria:cat, horario:h });
}

function atualizarVisor(msg) {
  const v = getVisor();
  if (!v) return;
  const e = automato.estado;
  const s = automato.saldo;

  // Cor do visor por estado
  if (e.aceite) {
    v.style.color = '#00ff88'; v.style.borderColor = '#00ff88';
    v.style.boxShadow = 'inset 0 0 10px rgba(0,0,0,.8), 0 0 10px rgba(0,255,136,.4)';
  } else if (s >= 8) {
    v.style.color = '#b100ff'; v.style.borderColor = '#b100ff';
    v.style.boxShadow = 'inset 0 0 10px rgba(0,0,0,.8), 0 0 10px rgba(177,0,255,.5)';
  } else if (s >= 7) {
    v.style.color = '#ffcc00'; v.style.borderColor = '#aa8800';
    v.style.boxShadow = 'inset 0 0 10px rgba(0,0,0,.8), 0 0 8px rgba(255,200,0,.3)';
  } else if (s >= 6) {
    v.style.color = '#00ccff'; v.style.borderColor = '#006688';
    v.style.boxShadow = 'inset 0 0 10px rgba(0,0,0,.8), 0 0 8px rgba(0,200,255,.3)';
  } else {
    v.style.color = '#00ff00'; v.style.borderColor = '#1a3a1a';
    v.style.boxShadow = 'inset 0 0 10px rgba(0,0,0,.8), 0 0 6px rgba(0,255,0,.1)';
  }

  const compraLabel = totalComprasSessao > 0 ? `COMPRAS: ${totalComprasSessao}\n` : '';
  v.innerText = (msg ? msg+'\n' : '') + compraLabel + `SALDO: R$${s},00\n${e.id}: ${e.descricao}`;
}

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
    criarSlots();
    gerarMoedasCarteira();
    atualizarVisor();
    atualizarBotaoComprar();
    adicionarLog('Máquina iniciada', 'system');
    adicionarLog('Clique numa moeda da carteira para inserir', 'system');
  }, 800);
}

/* ================================================================
   PRATELEIRAS 3x3 — sem estoque real
================================================================ */
function criarSlots() {
  const container = document.getElementById('shelves');
  container.innerHTML = '';

  for (let linha = 0; linha < 3; linha++) {
    const row = document.createElement('div');
    row.className = 'shelf-row';
    for (let col = 0; col < 3; col++) {
      const i     = linha * 3 + col + 1;
      const grupo = SLOT_GRUPO[i];
      const prod  = Produto[grupo];
      const slot  = document.createElement('div');
      slot.className = 'slot';
      slot.id = `slot-${i}`;
      slot.innerHTML = `
        <div class="coil"></div>
        <div class="slot-num">${i}</div>
        <img src="IMG/doce${i}.png" class="produto-img" id="produto-img-${i}"
             onerror="this.style.opacity='.3'">
        <div class="slot-preco">R$${prod.preco}</div>
        <div class="slot-label">${grupo}</div>
      `;
      row.appendChild(slot);
    }
    container.appendChild(row);
  }

  const strip = document.getElementById('priceStrip');
  strip.innerHTML = '';
  for (let i = 1; i <= 9; i++) {
    const grupo = SLOT_GRUPO[i];
    const tag = document.createElement('div');
    tag.className = 'price-tag';
    tag.textContent = `${grupo}·R$${Produto[grupo].preco}`;
    strip.appendChild(tag);
  }
}

/* ================================================================
   CARTEIRA — 3 moedas fixas
================================================================ */
function gerarMoedasCarteira() {
  const carteira = document.getElementById('carteira');
  carteira.innerHTML = '';

  const label = document.createElement('div');
  label.style.cssText = 'font-size:.4rem;color:rgba(177,0,255,.6);letter-spacing:1px;margin-bottom:4px;text-align:center;';
  label.textContent = '💰 MOEDAS';
  carteira.appendChild(label);

  [1, 2, 5].forEach(v => {
    const btn = document.createElement('div');
    btn.className = 'moeda';
    btn.dataset.val = v;
    btn.title = `Clique para inserir R$${v}`;
    btn.innerHTML = `<img src="IMG/moeda${v}.png" class="moeda-img"
      onerror="this.outerHTML='<div style=\\'width:52px;height:52px;border-radius:50%;background:radial-gradient(circle,#e080ff,#7a00b3);border:2px solid #b100ff;display:flex;align-items:center;justify-content:center;color:#fff;font-size:.65rem;font-weight:bold;\\'>R$${v}</div>'">`;
    btn.onclick = () => clicarMoeda(v, btn);
    carteira.appendChild(btn);
  });
}

/* ================================================================
   CLICAR NA MOEDA
================================================================ */
function clicarMoeda(valor, btnEl) {
  if (animando) return;

  const slotEl  = document.getElementById('slotMoeda');
  const origem  = btnEl.getBoundingClientRect();
  const destino = slotEl.getBoundingClientRect();

  const fly = document.createElement('div');
  fly.className = 'moeda-voando';
  fly.style.background = 'transparent';
  fly.style.border = 'none';
  fly.innerHTML = `<img src="IMG/moeda${valor}.png" style="width:100%;height:100%;object-fit:contain;"
    onerror="this.parentElement.textContent='R$${valor}'">`;
  fly.style.left = `${origem.left + origem.width/2  - 18}px`;
  fly.style.top  = `${origem.top  + origem.height/2 - 18}px`;
  fly.style.setProperty('--vx', `${destino.left + destino.width/2  - (origem.left + origem.width/2)}px`);
  fly.style.setProperty('--vy', `${destino.top  + destino.height/2 - (origem.top  + origem.height/2)}px`);
  document.body.appendChild(fly);

  slotEl.classList.add('ativo');
  setTimeout(() => { slotEl.classList.remove('ativo'); fly.remove(); }, 520);

  setTimeout(() => {
    const simbolo = valor === 1 ? Simbolo.MOEDA_1
                  : valor === 2 ? Simbolo.MOEDA_2
                  :               Simbolo.NOTA_5;
    const saldoAntes = automato.saldo;
    automato.transicao(simbolo);
    somMoeda();
    adicionarLog(`Inserido R$${valor},00 → saldo R$${automato.saldo},00`, 'coin');
    // Toca som de desbloqueio quando novo grupo é ativado
    const sb = automato.saldo;
    if ((sb >= 6 && saldoAntes < 6) || (sb >= 7 && saldoAntes < 7) || (sb >= 8 && saldoAntes < 8)) {
      setTimeout(somDesbloqueio, 150);
      pulsarSlotsDesbloqueados(sb);
    }
    atualizarVisor();
    atualizarBotaoComprar();
    atualizarSlotsDisponiveis();
    gatoEspia();
  }, 420);
}

/* ================================================================
   TECLADO
================================================================ */
function pressionar(numero) {
  if (animando) return;
  const num = parseInt(numero);
  if (num < 1 || num > 9) { atualizarVisor('CÓDIGO INVÁLIDO'); return; }
  codigoSelecionado = SLOT_GRUPO[num];
  atualizarVisor(`CÓDIGO: ${num} → Grupo ${codigoSelecionado} (R$${Produto[codigoSelecionado].preco})`);
  atualizarBotaoComprar();
}

function apagarCodigo() {
  codigoSelecionado = '';
  atualizarVisor();
  atualizarBotaoComprar();
}

/* ================================================================
   BOTÃO COMPRAR
================================================================ */
function atualizarBotaoComprar() {
  const btn = document.getElementById('botaoComprar');
  if (!codigoSelecionado) { btn.disabled = true; return; }
  btn.disabled = !automato.podeComprar(Produto[codigoSelecionado]) || animando;
}

/* ================================================================
   SLOTS DISPONÍVEIS
================================================================ */
function atualizarSlotsDisponiveis() {
  for (let i = 1; i <= 9; i++) {
    const slot = document.getElementById(`slot-${i}`);
    if (!slot) continue;
    slot.classList.toggle('disponivel', automato.podeComprar(Produto[SLOT_GRUPO[i]]));
  }
}

/* ================================================================
   CANCELAR — devolve saldo em moedas na bandeja
================================================================ */
function cancelarCompra() {
  if (animando) return;
  const saldoAtual = automato.saldo;

  if (saldoAtual <= 0) {
    atualizarVisor('NENHUM SALDO PARA DEVOLVER');
    setTimeout(() => atualizarVisor(), 1500);
    return;
  }

  somCancelar();
  adicionarLog(`Cancelado — devolvendo R$${saldoAtual},00`, 'troco');
  automato.transicao(Simbolo.CANCELAR);

  getFlap()?.classList.add('open');
  devolverTrocoBandeja(saldoAtual, getBandeja());

  codigoSelecionado = '';
  atualizarVisor('CANCELADO — RETIRE SEU DINHEIRO 💰');
  atualizarBotaoComprar();
  atualizarSlotsDisponiveis();
  setTimeout(() => atualizarVisor(), 2500);
}

/* ================================================================
   COMPRAR
================================================================ */
function comprar() {
  if (animando) return;
  if (!codigoSelecionado)          { atualizarVisor('SELECIONE A, B OU C'); return; }
  const prod = Produto[codigoSelecionado];
  if (!automato.podeComprar(prod)) { atualizarVisor('SALDO INSUFICIENTE');  return; }

  const codigo     = codigoSelecionado;
  const saldoAntes = automato.saldo;
  animando = true;
  document.getElementById('botaoComprar').disabled = true;

  automato.transicao(Simbolo.porCodigo(codigo));
  const troco = automato.saldo; // saldo restante após desconto = troco

  somCompra();
  totalComprasSessao++;
  adicionarLog(`Comprou ${prod.nome} por R$${prod.preco},00`, 'buy');
  if (troco > 0) adicionarLog(`Troco: R$${troco},00`, 'troco');
  else           adicionarLog('Pagamento exato — sem troco', 'system');

  gatoDispensa(codigo, () => {
    const slotBase = codigo === 'A' ? 1 : codigo === 'B' ? 4 : 7;
    const bandeja  = getBandeja();
    bandeja.innerHTML = `<img src="IMG/doce${slotBase}.png" class="produto-img"
      style="max-height:32px" onerror="this.style.opacity='.5'">`;

    devolverTrocoBandeja(troco, bandeja);

    // Reinicia AFD para nova compra mantendo log/histórico da sessão
    automato.reiniciarParaNovaCompra();
    animando = false;
    codigoSelecionado = '';
    atualizarVisor();
    atualizarBotaoComprar();
    atualizarSlotsDisponiveis();
    mostrarPopupMiau();
  });
}

/* ================================================================
   TROCO VISUAL — imagens de moedas na bandeja
================================================================ */
function devolverTrocoBandeja(troco, bandeja) {
  if (!troco || troco <= 0) return;
  const denoms = [5, 2, 1];
  const moedas = [];
  let rem = troco;
  denoms.forEach(d => { while (rem >= d) { moedas.push(d); rem -= d; } });

  moedas.forEach((v, idx) => {
    setTimeout(() => {
      if (!bandeja) return;
      const mc = document.createElement('img');
      mc.src = `IMG/moeda${v}.png`;
      mc.style.cssText = 'max-height:22px;margin:0 2px;vertical-align:middle;';
      mc.onerror = () => {
        const sp = document.createElement('span');
        sp.textContent = `R$${v}`;
        sp.style.cssText = 'font-size:.55rem;color:#e0b0ff;padding:2px 4px;background:#2a0040;border-radius:3px;margin:1px;display:inline-block;';
        mc.replaceWith(sp);
      };
      bandeja.appendChild(mc);
    }, idx * 130);
  });
}

/* ================================================================
   REMOVER DOCE DA BANDEJA
================================================================ */
function removerDoce() {
  const bandeja = getBandeja();
  if (bandeja?.innerHTML.trim() !== '') {
    getFlap()?.classList.remove('open');
    bandeja.innerHTML = '';
  }
}

/* ================================================================
   RESET VISUAL DO SLOT — imagem volta após compra
================================================================ */
function resetarImagemSlot(codigo) {
  for (let i = 1; i <= 9; i++) {
    if (SLOT_GRUPO[i] !== codigo) continue;
    const img = document.getElementById(`produto-img-${i}`);
    if (img) {
      img.style.transition = 'opacity .4s, transform .4s';
      img.style.opacity    = '1';
      img.style.transform  = 'none';
    }
  }
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
  cat.style.bottom     = `${glassH * .35}px`;
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
  const slotBase  = codigo === 'A' ? 1 : codigo === 'B' ? 4 : 7;
  const prodImgEl = document.getElementById(`produto-img-${slotBase}`);
  const shelfY    = glassH - (glassH / 4) * 2.3;

  cat.style.transition = 'none';
  cat.style.opacity    = '0';
  cat.style.left       = '-60px';
  cat.style.bottom     = `${shelfY}px`;
  catItem.className    = 'ca-item';
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
      catItem.innerHTML = `<img src="IMG/doce${slotBase}.png"
        style="width:100%;height:100%;object-fit:contain;" onerror="this.style.display='none'">`;

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
          resetarImagemSlot(codigo); // imagem volta — sem estoque

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

/* ================================================================
   CONFETTI
================================================================ */
function confetti() {
  const bin   = document.querySelector('.delivery-bin');
  const cores = ['#b100ff','#ff00ff','#ff60ff','#d400ff','#9000cc'];
  for (let i = 0; i < 10; i++) {
    const p = document.createElement('div');
    p.style.cssText = `position:absolute;width:5px;height:5px;border-radius:1px;pointer-events:none;z-index:200;
      left:${20 + Math.random()*60}%;top:${40 + Math.random()*20}%;
      background:${cores[~~(Math.random()*cores.length)]};
      animation:confettiFall ${.4+Math.random()*.7}s ease-in ${Math.random()*.3}s forwards;`;
    bin?.appendChild(p);
    setTimeout(() => p.remove(), 1800);
  }
}

/* ================================================================
   POPUP MIAU
================================================================ */
function mostrarPopupMiau() {
  const ov = document.getElementById('overlayMiau');
  ov.classList.add('ativa');
  setTimeout(() => { ov.classList.remove('ativa'); mostrarRelatorio(); }, 2000);
}

/* ================================================================
   RELATÓRIO FINAL
================================================================ */
function mostrarRelatorio() {
  const body = document.getElementById('popupBody');
  body.innerHTML = '';

  const compras      = logEventos.filter(e => e.categoria === 'buy');
  const totalCompras = compras.length;

  const resumo = document.createElement('div');
  resumo.className = 'popup-purchase';
  resumo.innerHTML = `
    <div class="icon">🍬</div>
    <div class="info">
      <div class="title">SESSÃO — ${totalCompras} COMPRA${totalCompras !== 1 ? 'S' : ''}</div>
      <div class="detail">${compras.map(c => c.mensagem).join('<br>') || 'Nenhuma compra realizada'}</div>
    </div>
    <div style="font-size:1.5rem">✅</div>
  `;
  body.appendChild(resumo);

  // Timeline AFD
  const historico = automato.historico;
  if (historico.length > 0) {
    const tlSec = document.createElement('div');
    tlSec.className = 'tl-section';
    tlSec.innerHTML = '<h3>▸ TRAJETÓRIA DO AUTÔMATO (AFD)</h3>';
    const tl = document.createElement('div');
    tl.className = 'timeline';

    historico.forEach((ent, i) => {
      const isLast    = i === historico.length - 1;
      const dotClass  = isLast ? 'final' : (i > 0 ? 'active' : '');
      const descricao = ent.destino.aceite
        ? `ESTADO DE ACEITE — ${ent.destino.label} dispensado (F)`
        : ent.destino.descricao;

      const item = document.createElement('div');
      item.className = 'tl-item';
      item.style.animationDelay = `${i * 60}ms`;
      item.innerHTML = `
        <div class="tl-dot-col">
          <div class="tl-dot ${dotClass}">${ent.destino.id}</div>
          ${!isLast ? '<div class="tl-line"></div>' : ''}
        </div>
        <div class="tl-content">
          <div class="tl-state">${descricao}</div>
          <div class="tl-trans">δ(${ent.origem.id}, ${ent.simbolo.descricao}) → ${ent.destino.id}</div>
          <div class="tl-bal">Saldo: R$${ent.saldo},00 | ${ent.horario}</div>
        </div>
      `;
      tl.appendChild(item);
    });

    tlSec.appendChild(tl);
    body.appendChild(tlSec);
  }

  // Log de eventos
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

  document.getElementById('popupOverlay')?.classList.add('visible');
  document.getElementById('popupOverlay')?.setAttribute('aria-hidden','false');
}

/* ================================================================
   CONTINUAR COMPRANDO — mantém sessão e histórico
================================================================ */
function continuarComprando() {
  document.getElementById('popupOverlay')?.classList.remove('visible');
  document.getElementById('popupOverlay')?.setAttribute('aria-hidden','true');

  getBandeja().innerHTML = '';
  getFlap()?.classList.remove('open');
  const cat = document.getElementById('catActor');
  if (cat) { cat.style.opacity='0'; cat.style.left='-60px'; cat.classList.remove('idle'); }

  atualizarSlotsDisponiveis();
  atualizarBotaoComprar();
  atualizarVisor('PRONTO PARA NOVA COMPRA! 💜');
  adicionarLog('Continuando sessão', 'system');
  setTimeout(() => atualizarVisor(), 1800);
}

/* ================================================================
   NOVA SESSÃO — zera tudo
================================================================ */
function novaSessao() {
  document.getElementById('popupOverlay')?.classList.remove('visible');
  document.getElementById('popupOverlay')?.setAttribute('aria-hidden','true');

  automato.reiniciarTudo();
  codigoSelecionado = '';
  animando          = false;
  logEventos        = [];
  totalComprasSessao = 0;

  for (let i = 1; i <= 9; i++) {
    const img  = document.getElementById(`produto-img-${i}`);
    const slot = document.getElementById(`slot-${i}`);
    if (img)  { img.style.opacity='1'; img.style.transform='none'; img.style.filter=''; }
    if (slot) { slot.classList.remove('esgotado','disponivel'); }
  }

  getBandeja().innerHTML = '';
  getFlap()?.classList.remove('open');
  const cat = document.getElementById('catActor');
  if (cat) { cat.style.opacity='0'; cat.style.left='-60px'; cat.classList.remove('idle'); }

  atualizarVisor();
  atualizarBotaoComprar();
  adicionarLog('Nova sessão iniciada', 'system');
}

/* ================================================================
   PULSE NOS SLOTS DESBLOQUEADOS
================================================================ */
function pulsarSlotsDesbloqueados(saldo) {
  for (let i = 1; i <= 9; i++) {
    const slot = document.getElementById(`slot-${i}`);
    if (!slot) continue;
    const grupo = SLOT_GRUPO[i];
    if (automato.podeComprar(Produto[grupo])) {
      slot.classList.add('pulse-unlock');
      setTimeout(() => slot.classList.remove('pulse-unlock'), 1000);
    }
  }
}
