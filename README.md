🍬✨ Máquina de Doces Inteligente
Simulação de Autômato Finito com Interface Interativa
<p align="center"> <b>Projeto acadêmico de Linguagens Formais e Autômatos</b><br> Modelagem formal + Implementação prática + Animação visual </p>
🎯 Sobre o Projeto

Esta aplicação simula o funcionamento de uma máquina de doces (Vending Machine) utilizando conceitos de:

🧠 Autômato Finito Determinístico (AFD)

🔁 Máquina de Mealy (Autômato com Saída)

💻 Programação Web Interativa

O sistema combina modelagem formal da teoria da computação com uma interface animada e interativa, transformando um conceito matemático em um sistema visual real.

🧠 Conceito Teórico Aplicado

O sistema foi estruturado com base na seguinte definição formal:

M = (Q, Σ, δ, q0, F, Δ)

Onde:

Q → Conjunto de estados (representados pelo saldo acumulado)

Σ → Inserção de moedas + seleção de código

δ → Função de transição (atualização de saldo)

q0 → Estado inicial (saldo = 0)

F → Estados finais (compra validada)

Δ → Saída (produto liberado + troco)

Cada inserção de moeda representa uma transição de estado.
A compra representa um estado final com saída associada.

💰 Sistema de Moedas

A máquina aceita:

Moeda	Valor
🪙 moeda1.png	R$ 1
🪙 moeda2.png	R$ 2
🪙 moeda10.png	R$ 10
🪙 moeda20.png	R$ 20
🪙 moeda50.png	R$ 50

📂 Estrutura:

IMG/
 ├── moeda1.png
 ├── moeda2.png
 ├── moeda10.png
 ├── moeda20.png
 └── moeda50.png

Cada moeda possui seu próprio PNG e animação ao ser inserida.

🍫 Sistema de Produtos

Cada produto contém:

Código identificador

Nome

Preço

Imagem

A compra é liberada quando:

saldo >= precoProduto

Caso o saldo seja superior ao valor, o sistema calcula e devolve o troco automaticamente.

⚙️ Funcionalidades

✔ Inserção animada de moedas
✔ Atualização dinâmica do visor
✔ Validação de código
✔ Liberação animada do produto
✔ Sistema automático de troco
✔ Controle de jogadas
✔ Efeito de vidro (Glassmorphism)
✔ Animações suaves
✔ Código organizado seguindo Clean Code

🎨 Interface e Design

O projeto foi desenvolvido com foco em:

🎨 Estética moderna

🪟 Efeito de vidro controlado

💡 Brilho interno ajustado

🎞 Animações fluidas

📱 Layout organizado

A interface simula visualmente uma máquina real, proporcionando melhor experiência do usuário.

🛠 Tecnologias Utilizadas
<p> <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white"/> <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white"/> <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black"/> </p>
📂 Estrutura do Projeto
📦 maquina-de-doces
 ┣ 📂 IMG
 ┃ ┣ moedas
 ┃ ┣ produtos
 ┣ 📜 index.html
 ┣ 📜 style.css
 ┣ 📜 script.js
 ┗ 📜 README.md
🔄 Fluxo de Funcionamento

graph TD
A[Estado Inicial - Saldo 0] --> B[Inserção de Moeda]
B --> C[Atualiza Saldo]
C --> D{Saldo >= Preço?}
D -- Não --> B
D -- Sim --> E[Liberar Produto]
E --> F[Calcular Troco]
F --> A

🚀 Como Executar


