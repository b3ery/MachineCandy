# 🍬 Meow Candy — Máquina de Doces

Simulação interativa de uma **Vending Machine** desenvolvida para a disciplina de **Linguagens Formais e Autômatos**, aplicando conceitos de **Autômato Finito Determinístico (AFD)** e **Máquina de Mealy** em uma interface web animada com estética *lo-fi noturna*.

🔗 **[Jogar agora → b3ery.github.io/MachineCandy](https://b3ery.github.io/MachineCandy/)**

---

## 🎯 Objetivo

Modelar e implementar uma máquina de doces que:

- Aceita moedas arrastáveis via drag & drop
- Atualiza o saldo dinamicamente no visor
- Permite seleção de produtos por código numérico
- Libera o produto quando o saldo é suficiente
- Calcula e devolve o troco **automaticamente** junto com o produto
- Representa formalmente um Autômato Finito com saída

---

## 🧠 Fundamentação Teórica

A modelagem do sistema é baseada na definição formal de um autômato:

```
M = (Q, Σ, δ, q₀, F, Δ)
```

| Componente | Descrição |
|---|---|
| **Q** | Conjunto de estados — representados pelo saldo acumulado |
| **Σ** | Alfabeto de entrada — inserção de moedas + seleção de código |
| **δ** | Função de transição — atualização do saldo a cada moeda inserida |
| **q₀** | Estado inicial — saldo = R$ 0 |
| **F** | Estados finais — compra validada (saldo ≥ preço) |
| **Δ** | Saída — produto liberado + troco devolvido automaticamente |

Cada inserção de moeda representa uma **transição de estado**. A compra representa um **estado final com saída associada** (produto + troco calculado pelo algoritmo guloso).

---

## 💰 Sistema de Moedas

A máquina aceita as seguintes moedas (arrastáveis via drag & drop):

| Moeda | Arquivo |
|---|---|
| R$ 1 | `IMG/moeda1.png` |
| R$ 2 | `IMG/moeda2.png` |
| R$ 5 | `IMG/moeda5.png` |
| R$ 10 | `IMG/moeda10.png` |
| R$ 20 | `IMG/moeda20.png` |
| R$ 50 | `IMG/moeda50.png` |

---

## 🍫 Produtos

9 produtos disponíveis, organizados em grade 3×3 na vitrine da máquina:

| Código | Produto | Preço |
|---|---|---|
| 1 | Doce 1 | R$ 5 |
| 2 | Doce 2 | R$ 7 |
| 3 | Doce 3 | R$ 6 |
| 4 | Doce 4 | R$ 4 |
| 5 | Doce 5 | R$ 8 |
| 6 | Doce 6 | R$ 9 |
| 7 | Doce 7 | R$ 3 |
| 8 | Doce 8 | R$ 6 |
| 9 | Doce 9 | R$ 4 |

A compra é liberada quando: `saldo >= preço do produto`

---

## ⚙️ Funcionalidades

- 🪙 Inserção animada de moedas com física (queda + quique)
- 📺 Visor digital com atualização dinâmica de saldo
- 🔢 Teclado numérico para seleção de produto por código
- 🐱 Gato animado que busca e entrega o produto
- 🎊 Efeito de confetti roxo na entrega
- 💸 Troco calculado automaticamente e exibido na bandeja
- 🌃 Fundo lo-fi animado com GIF noturno
- ✨ Luzes de fio com efeito de flicker
- 📋 Relatório de transação ao final de cada compra

---

## 🛠 Tecnologias

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)

- HTML5 + CSS3 + JavaScript puro (sem frameworks)
- Drag & Drop API nativa
- `requestAnimationFrame` para animações fluidas
- Google Fonts: *Share Tech Mono*, *Barlow Condensed*, *Press Start 2P*

---

## 📂 Estrutura do Projeto

```
📦 MachineCandy
 ┣ 📂 CSS
 ┃ ┗ 📜 style.css
 ┣ 📂 JS
 ┃ ┗ 📜 script.js
 ┣ 📂 IMG
 ┃ ┣ 🖼 bg-site.gif
 ┃ ┣ 🖼 Candy_Machine.png
 ┃ ┣ 🖼 doce1.png ~ doce9.png
 ┃ ┗ 🖼 moeda1.png, moeda2.png, moeda5.png, moeda10.png, moeda20.png, moeda50.png
 ┣ 📜 index.html
 ┗ 📜 README.md
```

---

## 🔄 Fluxo de Funcionamento

```
[Início] → Arraste uma moeda → Saldo atualizado
        → Digite o código do produto → Pressione PEGAR DOCE
        → Gato busca o produto na vitrine
        → Produto + Troco caem na bandeja
        → Relatório de transação exibido
        → [Nova compra]
```

---

## 🚀 Como Executar

**Online:**
```
https://b3ery.github.io/MachineCandy/
```

**Local:**
```bash
git clone https://github.com/b3ery/MachineCandy.git
cd MachineCandy
# Abra o index.html no navegador
```

---

## 🏁 Conclusão

Este projeto demonstra a aplicação prática de **Autômatos Finitos** na modelagem de sistemas reais, integrando teoria da computação, lógica de programação e interface gráfica em uma solução interativa e funcional — com um gato roxo entregando doces. 🐱💜
