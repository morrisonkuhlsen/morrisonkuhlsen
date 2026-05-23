---
layout: post
image: /assets/images/desvio-vs-erro.avif
title: "Desvio padrão x Erro padrão: qual a diferença?"
categories: [ESTATÍSTICA, PROBABILIDADE, INFERÊNCIA ESTATÍSTICA]
tags: [Estatística]
lang: pt
ref: desvio-padrao-erro-padrao
author: dante-bertuzzi
mathjax: true
description: "Entenda, com exemplos resolvidos à mão e em Julia, a diferença entre desvio padrão e erro padrão da média."
slug: desvio-padrao-x-erro-padrao-qual-a-diferenca
---

## 1. Desvio padrão x erro padrão: por que essa confusão acontece?

---

Na Estatística, é muito comum encontrar os termos **desvio padrão** e **erro padrão** em tabelas, gráficos, pesquisas e artigos científicos. Como os dois nomes são parecidos e ambos estão ligados à ideia de “variação”, muita gente acaba tratando os dois como se fossem a mesma coisa, mas eles não são.

<figure style="text-align:center; margin: 2em auto; max-width: 700px;">
  <img src="/assets/images/desvio-vs-erro.avif" alt="Desvio vs Erro" style="width:100%; border-radius:8px;" />
  <figcaption style="margin-top:0.75em; font-size:0.88rem; color:#555;">
    
  </figcaption>
</figure>

O **desvio padrão** mede a variabilidade dos dados individuais. Ele ajuda a responder perguntas como:

> As notas dos alunos, os tempos de atendimento ou as alturas das pessoas estão muito espalhados em torno da média?

Já o **erro padrão** mede a variabilidade da média amostral. Ele está ligado à precisão da média calculada a partir de uma amostra. Em outras palavras, ajuda a responder:

> Se coletássemos outra amostra parecida, a média encontrada mudaria muito?

A diferença principal pode ser resumida assim:

<div class="mk-grid-2">
  <div class="mk-card">
    <h4>Desvio padrão</h4>
    <p>Olha para os <strong>valores individuais</strong>.</p>
    <p>Mede o quanto os dados variam em torno da média.</p>
  </div>

  <div class="mk-card">
    <h4>Erro padrão</h4>
    <p>Olha para a <strong>média amostral</strong>.</p>
    <p>Mede o quanto essa média pode variar de amostra para amostra.</p>
  </div>
</div>

Em forma compacta:

$$
\text{desvio padrão} \rightarrow \text{variabilidade dos dados}
$$

$$
\text{erro padrão} \rightarrow \text{variabilidade da média amostral}
$$

<div style="border-left: 4px solid #f44336; padding: 1em; background-color: #ffebee; margin: 1em 0; border-radius: 4px;">
  <h4 style="margin-top: 0;">Pergunta central</h4>
  <p>Estamos tentando entender o quanto os valores variam entre si ou o quanto a média amostral pode variar de amostra para amostra?</p>
</div>

<style>
/* ==========================================================
   ESTILO DO POST — DESVIO PADRÃO X ERRO PADRÃO
   Tudo foi escopado em .mk-stat-post para não afetar o TOC.
   ========================================================== */

.mk-stat-post {
  --mk-bg-code: #1d1d2f;
  --mk-bg-code-2: #181829;
  --mk-text-code: #edf1ff;
  --mk-muted: #64748b;

  --mk-blue-dark: #17324d;
  --mk-blue: #2563eb;
  --mk-green: #10b981;
  --mk-orange: #fb923c;
  --mk-red: #f43f5e;
  --mk-purple: #7c3aed;

  --mk-card-bg: #f8fafc;
  --mk-card-border: #e5e7eb;

  --mk-note-bg: #fff7ed;
  --mk-note-border: #fb923c;

  --mk-tip-bg: #ecfdf5;
  --mk-tip-border: #10b981;

  --mk-alert-bg: #fff1f2;
  --mk-alert-border: #f43f5e;

  --mk-info-bg: #eff6ff;
  --mk-info-border: #3b82f6;

  --mk-purple-bg: #f5f3ff;
  --mk-purple-border: #7c3aed;
}

/* Caixas de destaque */
.mk-stat-post .mk-box {
  border-radius: 14px;
  padding: 1.05rem 1.15rem;
  margin: 1.25rem 0;
  border-left: 5px solid;
  box-shadow: 0 6px 18px rgba(15, 23, 42, .06);
}

.mk-stat-post .mk-box p:last-child {
  margin-bottom: 0;
}

.mk-stat-post .mk-box-note {
  background: var(--mk-note-bg);
  border-left-color: var(--mk-note-border);
}

.mk-stat-post .mk-box-tip {
  background: var(--mk-tip-bg);
  border-left-color: var(--mk-tip-border);
}

.mk-stat-post .mk-box-alert {
  background: var(--mk-alert-bg);
  border-left-color: var(--mk-alert-border);
}

.mk-stat-post .mk-box-info {
  background: var(--mk-info-bg);
  border-left-color: var(--mk-info-border);
}

.mk-stat-post .mk-box-purple {
  background: var(--mk-purple-bg);
  border-left-color: var(--mk-purple-border);
}

/* Cartões */
.mk-stat-post .mk-card {
  background: #ffffff;
  border: 1px solid var(--mk-card-border);
  border-radius: 16px;
  padding: 1.15rem 1.25rem;
  margin: 1.25rem 0;
  box-shadow: 0 8px 22px rgba(15, 23, 42, .06);
}

.mk-stat-post .mk-card h4 {
  margin-top: 0;
}

/* Grid comparativo */
.mk-stat-post .mk-grid-2 {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  margin: 1.25rem 0;
}

@media (max-width: 780px) {
  .mk-stat-post .mk-grid-2 {
    grid-template-columns: 1fr;
  }
}

/* Tabelas HTML */
.mk-stat-post .mk-table-wrap {
  overflow-x: auto;
  margin: 1em 0;
}

.mk-stat-post table {
  width: 100%;
  border-collapse: collapse;
  margin: 1em 0;
  font-size: 0.95rem;
}

.mk-stat-post table thead tr {
  background-color: #17324d;
  color: #ffffff;
}

.mk-stat-post table th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 700;
}

.mk-stat-post table td {
  padding: 10px 16px;
  color: #17324d;
  vertical-align: top;
}

.mk-stat-post table tbody tr:nth-child(odd) {
  background-color: #f5f6f7;
}

.mk-stat-post table tbody tr:nth-child(even) {
  background-color: #ffffff;
}

.mk-stat-post .mk-table {
  width: 100%;
  border-collapse: collapse;
  margin: 1em 0;
  font-size: 0.95rem;
}

.mk-stat-post .mk-table thead tr {
  background-color: #17324d;
  color: #ffffff;
}

.mk-stat-post .mk-table th {
  padding: 14px 18px;
  text-align: center;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.mk-stat-post .mk-table td {
  padding: 12px 18px;
  text-align: center;
  color: #17324d;
}

.mk-stat-post .mk-table tbody tr:nth-child(odd) {
  background-color: #f5f6f7;
}

.mk-stat-post .mk-table tbody tr:nth-child(even) {
  background-color: #ffffff;
}

/* Bloco de fórmula */
.mk-stat-post .mk-formula-box {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 1.2rem;
  margin: 1.35rem 0;
  text-align: center;
  box-shadow: 0 6px 18px rgba(15, 23, 42, .05);
}

/* Passos manuais */
.mk-stat-post .mk-step {
  border-left: 4px solid #17324d;
  background: #f8fafc;
  padding: 1rem 1.1rem;
  border-radius: 10px;
  margin: 1rem 0;
}

.mk-stat-post .mk-step strong {
  color: #17324d;
}

/* Compartilhamento */
.mk-stat-post .share-buttons {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #444;
  text-align: center;
}

.mk-stat-post .share-buttons-title {
  margin-bottom: 15px;
  font-weight: bold;
  font-size: 1.1em;
}

.mk-stat-post .share-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 45px;
  height: 45px;
  margin: 5px;
  border-radius: 50%;
  text-decoration: none;
  background-color: transparent;
  color: #333 !important;
  font-size: 24px;
  border: none;
  cursor: pointer;
  transition: color .2s, transform .2s;
}

.mk-stat-post .share-btn:hover {
  color: #000 !important;
  transform: scale(1.1);
}

/* Modo escuro */
.dark-mode .mk-stat-post .mk-card,
.dark-mode .mk-stat-post .mk-formula-box,
.dark-mode .mk-stat-post .mk-step {
  background: #1f1f1f;
  border-color: #333;
}

.dark-mode .mk-stat-post .mk-box-note {
  background: #2a2115;
}

.dark-mode .mk-stat-post .mk-box-tip {
  background: #10251c;
}

.dark-mode .mk-stat-post .mk-box-alert {
  background: #2a1518;
}

.dark-mode .mk-stat-post .mk-box-info {
  background: #101f33;
}

.dark-mode .mk-stat-post .mk-box-purple {
  background: #201633;
}
</style>

<div class="mk-stat-post" markdown="1">

---

## 2. O que é desvio padrão?

---

O **desvio padrão** mede o quanto os dados estão espalhados em torno da média.

Quando o desvio padrão é pequeno, os valores estão próximos da média.

Quando o desvio padrão é grande, os valores estão mais distantes da média.

Imagine duas turmas com notas de prova.

<div class="mk-table-wrap">
<table class="mk-table">
  <thead>
    <tr>
      <th>Turma</th>
      <th>Notas</th>
      <th>Interpretação</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Turma A</td>
      <td>7, 7, 8, 8, 8</td>
      <td>Notas próximas entre si</td>
    </tr>
    <tr>
      <td>Turma B</td>
      <td>3, 5, 8, 10, 14</td>
      <td>Notas mais espalhadas</td>
    </tr>
  </tbody>
</table>
</div>

Mesmo que duas turmas tenham médias parecidas, elas podem ter dispersões muito diferentes.

O desvio padrão ajuda justamente a medir essa dispersão.

<div class="mk-formula-box">

$$
s = \sqrt{\frac{\sum_{i=1}^{n}(x_i - \bar{x})^2}{n-1}}
$$

</div>

Onde:

<div class="mk-table-wrap">
<table class="mk-table">
  <thead>
    <tr>
      <th>Símbolo</th>
      <th>Significado</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>$s$</td>
      <td>desvio padrão amostral</td>
    </tr>
    <tr>
      <td>$x_i$</td>
      <td>cada valor observado na amostra</td>
    </tr>
    <tr>
      <td>$\bar{x}$</td>
      <td>média amostral</td>
    </tr>
    <tr>
      <td>$n$</td>
      <td>tamanho da amostra</td>
    </tr>
    <tr>
      <td>$x_i - \bar{x}$</td>
      <td>distância de cada valor até a média</td>
    </tr>
    <tr>
      <td>$n-1$</td>
      <td>graus de liberdade usados no cálculo amostral</td>
    </tr>
  </tbody>
</table>
</div>

A ideia da fórmula é:

1. calcular a média;
2. medir a distância de cada valor até a média;
3. elevar essas distâncias ao quadrado;
4. somar tudo;
5. dividir por $n-1$;
6. tirar a raiz quadrada.

<div class="mk-box mk-box-info">
  <strong>Ideia principal:</strong><br>
  O desvio padrão descreve a variabilidade dos próprios dados. Ele olha para os valores individuais da amostra.
</div>

---

## 3. O que é erro padrão?

---

O **erro padrão da média** mede o quanto a média amostral tende a variar de amostra para amostra.

Essa frase é muito importante.

O erro padrão não mede diretamente o espalhamento dos dados individuais.

Ele mede o espalhamento das médias amostrais.

Imagine que queremos estimar o tempo médio de atendimento em um cartório, banco, hospital ou escola.

Podemos pegar uma amostra de atendimentos e calcular uma média.

Depois, poderíamos pegar outra amostra e calcular outra média.

Depois outra.

Depois outra.

Cada amostra provavelmente teria uma média um pouco diferente.

O erro padrão tenta medir justamente essa variação das médias.

<div class="mk-formula-box">

$$
EP = \frac{s}{\sqrt{n}}
$$

</div>

Onde:

<div class="mk-table-wrap">
<table class="mk-table">
  <thead>
    <tr>
      <th>Símbolo</th>
      <th>Significado</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>$EP$</td>
      <td>erro padrão da média</td>
    </tr>
    <tr>
      <td>$s$</td>
      <td>desvio padrão amostral</td>
    </tr>
    <tr>
      <td>$n$</td>
      <td>tamanho da amostra</td>
    </tr>
    <tr>
      <td>$\sqrt{n}$</td>
      <td>raiz quadrada do tamanho da amostra</td>
    </tr>
  </tbody>
</table>
</div>

Essa fórmula mostra algo essencial:

$$
EP = \frac{s}{\sqrt{n}}
$$

Quanto maior o tamanho da amostra, maior será o denominador.

E, quando o denominador aumenta, o erro padrão diminui.

<div class="mk-box mk-box-tip">
  <strong>Ideia principal:</strong><br>
  O erro padrão mostra o quanto a média amostral é instável ou incerta como estimativa da média verdadeira da população.
</div>

---

## 4. A diferença principal entre os dois

---

A diferença central é esta:

<div class="mk-grid-2">
  <div class="mk-card">
    <h4>Desvio padrão</h4>
    <p>Mede a variabilidade dos dados individuais.</p>
    <p>Ele responde:</p>
    <p><strong>os valores estão muito espalhados em torno da média?</strong></p>
  </div>

  <div class="mk-card">
    <h4>Erro padrão</h4>
    <p>Mede a variabilidade da média amostral.</p>
    <p>Ele responde:</p>
    <p><strong>a média calculada é uma estimativa muito incerta?</strong></p>
  </div>
</div>

Em linguagem direta:

$$
\text{desvio padrão} \rightarrow \text{variação dos dados}
$$

$$
\text{erro padrão} \rightarrow \text{variação da média}
$$

<div class="mk-table-wrap">
<table class="mk-table">
  <thead>
    <tr>
      <th>Critério</th>
      <th>Desvio padrão</th>
      <th>Erro padrão</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>O que mede?</strong></td>
      <td>A variabilidade dos dados individuais</td>
      <td>A variabilidade da média amostral</td>
    </tr>
    <tr>
      <td><strong>Fórmula</strong></td>
      <td>$s = \sqrt{\frac{\sum(x_i - \bar{x})^2}{n-1}}$</td>
      <td>$EP = \frac{s}{\sqrt{n}}$</td>
    </tr>
    <tr>
      <td><strong>Usado para quê?</strong></td>
      <td>Descrever a dispersão dos dados</td>
      <td>Medir a precisão da média estimada</td>
    </tr>
    <tr>
      <td><strong>Pergunta que responde</strong></td>
      <td>Os valores variam muito?</td>
      <td>A média é muito incerta?</td>
    </tr>
    <tr>
      <td><strong>Exemplo</strong></td>
      <td>As notas dos alunos são parecidas?</td>
      <td>A média da turma foi estimada com precisão?</td>
    </tr>
  </tbody>
</table>
</div>

<div class="mk-box mk-box-alert">
  <strong>Atenção:</strong><br>
  O erro padrão depende do desvio padrão, mas não é a mesma coisa que o desvio padrão.
</div>

---

## 5. Exemplo resolvido à mão

---

Vamos usar um exemplo pequeno para conseguir calcular tudo manualmente.

Imagine que observamos os tempos de atendimento, em minutos, de 4 pessoas:

$$
6,\ 8,\ 10,\ 12
$$

Então:

$$
n = 4
$$

Queremos calcular:

- a média;
- o desvio padrão amostral;
- o erro padrão da média.

**Passo 1: calcular a média**

A média amostral é:

$$
\bar{x} = \frac{x_1 + x_2 + x_3 + x_4}{n}
$$

Substituindo os valores:

$$
\bar{x} = \frac{6 + 8 + 10 + 12}{4}
$$

Somando o numerador:

$$
6 + 8 + 10 + 12 = 36
$$

Logo:

$$
\bar{x} = \frac{36}{4}
$$

$$
\bar{x} = 9
$$

Portanto:

$$
\bar{x} = 9 \text{ minutos}
$$

**Passo 2: calcular os desvios em relação à média**

Agora calculamos:

$$
x_i - \bar{x}
$$

Como:

$$
\bar{x} = 9
$$

temos:

<div class="mk-table-wrap">
<table class="mk-table">
  <thead>
    <tr>
      <th>Valor</th>
      <th>Cálculo</th>
      <th>Desvio</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>$6$</td>
      <td>$6 - 9$</td>
      <td>$-3$</td>
    </tr>
    <tr>
      <td>$8$</td>
      <td>$8 - 9$</td>
      <td>$-1$</td>
    </tr>
    <tr>
      <td>$10$</td>
      <td>$10 - 9$</td>
      <td>$1$</td>
    </tr>
    <tr>
      <td>$12$</td>
      <td>$12 - 9$</td>
      <td>$3$</td>
    </tr>
  </tbody>
</table>
</div>

**Passo 3: elevar os desvios ao quadrado**

Agora calculamos:

$$
(x_i - \bar{x})^2
$$

<div class="mk-table-wrap">
<table class="mk-table">
  <thead>
    <tr>
      <th>Valor</th>
      <th>Desvio</th>
      <th>Desvio ao quadrado</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>$6$</td>
      <td>$-3$</td>
      <td>$(-3)^2 = 9$</td>
    </tr>
    <tr>
      <td>$8$</td>
      <td>$-1$</td>
      <td>$(-1)^2 = 1$</td>
    </tr>
    <tr>
      <td>$10$</td>
      <td>$1$</td>
      <td>$(1)^2 = 1$</td>
    </tr>
    <tr>
      <td>$12$</td>
      <td>$3$</td>
      <td>$(3)^2 = 9$</td>
    </tr>
  </tbody>
</table>
</div>

Somando os desvios ao quadrado:

$$
\sum_{i=1}^{n}(x_i - \bar{x})^2 = 9 + 1 + 1 + 9
$$

$$
\sum_{i=1}^{n}(x_i - \bar{x})^2 = 20
$$

**Passo 4: calcular o desvio padrão amostral**

A fórmula é:

$$
s = \sqrt{\frac{\sum_{i=1}^{n}(x_i - \bar{x})^2}{n-1}}
$$

Já sabemos que:

$$
\sum_{i=1}^{n}(x_i - \bar{x})^2 = 20
$$

e:

$$
n = 4
$$

Então:

$$
s = \sqrt{\frac{20}{4-1}}
$$

$$
s = \sqrt{\frac{20}{3}}
$$

Fazendo a divisão:

$$
\frac{20}{3} \approx 6{,}6667
$$

Logo:

$$
s = \sqrt{6{,}6667}
$$

$$
s \approx 2{,}58
$$

Portanto:

$$
s \approx 2{,}58 \text{ minutos}
$$

**Passo 5: calcular o erro padrão**

Agora usamos:

$$
EP = \frac{s}{\sqrt{n}}
$$

Como:

$$
s \approx 2{,}58
$$

e:

$$
n = 4
$$

temos:

$$
EP = \frac{2{,}58}{\sqrt{4}}
$$

Sabemos que:

$$
\sqrt{4} = 2
$$

Então:

$$
EP = \frac{2{,}58}{2}
$$

$$
EP \approx 1{,}29
$$

Portanto:

$$
EP \approx 1{,}29 \text{ minutos}
$$

<div class="mk-box mk-box-info">
  <strong>Resultado do exemplo:</strong><br>
  A média foi $9$ minutos, o desvio padrão foi aproximadamente $2{,}58$ minutos e o erro padrão foi aproximadamente $1{,}29$ minuto.
</div>

---

## 6. Como interpretar os resultados?

---

Encontramos:

$$
\bar{x} = 9
$$

$$
s \approx 2{,}58
$$

$$
EP \approx 1{,}29
$$

Esses três valores contam partes diferentes da história.

A média diz:

> o tempo médio de atendimento observado foi de 9 minutos.

O desvio padrão diz:

> os tempos individuais de atendimento se afastam da média, em termos típicos, cerca de 2,58 minutos.

O erro padrão diz:

> a média amostral de 9 minutos tem uma incerteza típica de aproximadamente 1,29 minuto.

Ou seja:

$$
2{,}58
$$

descreve a dispersão dos atendimentos individuais.

Já:

$$
1{,}29
$$

descreve a incerteza da média calculada.

<div class="mk-box mk-box-purple">
  <strong>Resumo interpretativo:</strong><br>
  O desvio padrão fala sobre os dados. O erro padrão fala sobre a média.
</div>

---

## 7. O que acontece quando o tamanho da amostra aumenta?

---

O erro padrão é calculado por:

$$
EP = \frac{s}{\sqrt{n}}
$$

Observe que o tamanho da amostra aparece no denominador.

Isso significa que, quando $n$ aumenta, $\sqrt{n}$ também aumenta.

Como estamos dividindo por um número maior, o erro padrão diminui.

Vamos supor que o desvio padrão seja aproximadamente:

$$
s = 12
$$

Agora vamos comparar diferentes tamanhos de amostra.

<div class="mk-table-wrap">
<table class="mk-table">
  <thead>
    <tr>
      <th>Tamanho da amostra</th>
      <th>Cálculo</th>
      <th>Erro padrão</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>$n = 4$</td>
      <td>$EP = \frac{12}{\sqrt{4}} = \frac{12}{2}$</td>
      <td>$6$</td>
    </tr>
    <tr>
      <td>$n = 9$</td>
      <td>$EP = \frac{12}{\sqrt{9}} = \frac{12}{3}$</td>
      <td>$4$</td>
    </tr>
    <tr>
      <td>$n = 16$</td>
      <td>$EP = \frac{12}{\sqrt{16}} = \frac{12}{4}$</td>
      <td>$3$</td>
    </tr>
    <tr>
      <td>$n = 36$</td>
      <td>$EP = \frac{12}{\sqrt{36}} = \frac{12}{6}$</td>
      <td>$2$</td>
    </tr>
  </tbody>
</table>
</div>

Repare no padrão:

$$
n \uparrow \quad \Rightarrow \quad EP \downarrow
$$

Mas o erro padrão não cai na mesma velocidade que o tamanho da amostra cresce.

Ele cai com a raiz quadrada de $n$.

Por isso, para reduzir o erro padrão pela metade, em geral precisamos multiplicar o tamanho da amostra por 4.

<div class="mk-box mk-box-alert">
  <strong>Cuidado:</strong><br>
  Aumentar a amostra reduz o erro padrão, mas não resolve automaticamente problemas como viés, dados mal coletados, amostragem ruim ou perguntas mal formuladas.
</div>

---

## 8. Erros comuns e conexão com intervalo de confiança

---

**Erro 1: interpretar erro padrão como se fosse desvio padrão**

Se alguém diz:

> o erro padrão foi 1,2

isso não significa necessariamente que os dados individuais variam apenas 1,2 unidade em torno da média.

Significa que a média amostral tem uma incerteza típica de 1,2 unidade.

Para saber a dispersão dos dados, precisamos olhar para o desvio padrão.

---

**Erro 2: achar que erro padrão pequeno significa dados homogêneos**

Uma amostra grande pode ter erro padrão pequeno mesmo que os dados individuais sejam bastante variados.

Isso acontece porque:

$$
EP = \frac{s}{\sqrt{n}}
$$

Se $n$ for grande, o denominador fica grande.

Então, mesmo com um desvio padrão alto, o erro padrão pode ficar pequeno.

Exemplo:

$$
s = 20
$$

e:

$$
n = 400
$$

Então:

$$
EP = \frac{20}{\sqrt{400}}
$$

$$
EP = \frac{20}{20}
$$

$$
EP = 1
$$

Nesse caso, o erro padrão é 1, mas o desvio padrão é 20.

Ou seja, os dados individuais ainda variam bastante.

---

**Erro 3: usar desvio padrão quando a pergunta é sobre precisão da média**

Se queremos descrever os dados, usamos desvio padrão.

Se queremos falar da precisão da média, usamos erro padrão.

Por exemplo:

> As alturas das pessoas variam muito?

Essa pergunta pede desvio padrão.

Agora:

> A média de altura estimada pela amostra é precisa?

Essa pergunta pede erro padrão.

---

**Conexão com intervalo de confiança**

O erro padrão aparece diretamente na construção de intervalos de confiança.

De forma simplificada, um intervalo de confiança para a média costuma ter a ideia:

$$
\text{estimativa} \pm \text{margem de erro}
$$

No caso da média:

$$
\bar{x} \pm \text{valor crítico} \times EP
$$

Em muitas situações introdutórias, aparece algo como:

$$
\bar{x} \pm z \cdot EP
$$

ou, quando usamos a distribuição t de Student:

$$
\bar{x} \pm t \cdot EP
$$

No nosso exemplo, encontramos:

$$
\bar{x} = 9
$$

e:

$$
EP \approx 1{,}29
$$

Se usássemos, apenas como aproximação didática, um valor crítico igual a 2, teríamos:

$$
9 \pm 2 \cdot 1{,}29
$$

Primeiro calculamos a margem:

$$
2 \cdot 1{,}29 = 2{,}58
$$

Então:

$$
9 - 2{,}58 = 6{,}42
$$

e:

$$
9 + 2{,}58 = 11{,}58
$$

Logo, um intervalo aproximado seria:

$$
[6{,}42,\ 11{,}58]
$$

<div class="mk-box mk-box-info">
  <strong>Interpretação didática:</strong><br>
  O erro padrão entra no intervalo de confiança porque ele mede a incerteza da média. Quanto menor o erro padrão, mais estreito tende a ser o intervalo de confiança.
</div>

---

## 9. Exemplos em Julia

---

Agora vamos calcular os mesmos conceitos usando Julia.

Primeiro, vamos usar o exemplo dos tempos de atendimento:

$$
6,\ 8,\ 10,\ 12
$$

No cálculo manual, encontramos:

$$
\bar{x} = 9
$$

$$
s \approx 2{,}58
$$

$$
EP \approx 1{,}29
$$

**Cálculo manual em Julia**

<div class="code-container">
  <div class="code-header">
    <div class="code-lang"></div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar código">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-keyword">using</span> <span class="code-module">Statistics</span>

<span class="code-variable">tempos</span> <span class="code-operator">=</span> <span class="code-paren">[</span><span class="code-number">6</span>, <span class="code-number">8</span>, <span class="code-number">10</span>, <span class="code-number">12</span><span class="code-paren">]</span>

<span class="code-variable">n</span> <span class="code-operator">=</span> <span class="code-function">length</span><span class="code-paren">(</span><span class="code-variable">tempos</span><span class="code-paren">)</span>
<span class="code-variable">media</span> <span class="code-operator">=</span> <span class="code-function">mean</span><span class="code-paren">(</span><span class="code-variable">tempos</span><span class="code-paren">)</span>

<span class="code-variable">desvios</span> <span class="code-operator">=</span> <span class="code-variable">tempos</span> <span class="code-operator">.-</span> <span class="code-variable">media</span>
<span class="code-variable">desvios_quadrado</span> <span class="code-operator">=</span> <span class="code-variable">desvios</span> <span class="code-operator">.^</span> <span class="code-number">2</span>

<span class="code-variable">soma_desvios_quadrado</span> <span class="code-operator">=</span> <span class="code-function">sum</span><span class="code-paren">(</span><span class="code-variable">desvios_quadrado</span><span class="code-paren">)</span>

<span class="code-variable">variancia_amostral</span> <span class="code-operator">=</span> <span class="code-variable">soma_desvios_quadrado</span> <span class="code-operator">/</span> <span class="code-paren">(</span><span class="code-variable">n</span> <span class="code-operator">-</span> <span class="code-number">1</span><span class="code-paren">)</span>
<span class="code-variable">desvio_padrao</span> <span class="code-operator">=</span> <span class="code-function">sqrt</span><span class="code-paren">(</span><span class="code-variable">variancia_amostral</span><span class="code-paren">)</span>

<span class="code-variable">erro_padrao</span> <span class="code-operator">=</span> <span class="code-variable">desvio_padrao</span> <span class="code-operator">/</span> <span class="code-function">sqrt</span><span class="code-paren">(</span><span class="code-variable">n</span><span class="code-paren">)</span>

<span class="code-function">println</span><span class="code-paren">(</span><span class="code-string">"Média = "</span>, <span class="code-variable">media</span><span class="code-paren">)</span>
<span class="code-function">println</span><span class="code-paren">(</span><span class="code-string">"Desvios = "</span>, <span class="code-variable">desvios</span><span class="code-paren">)</span>
<span class="code-function">println</span><span class="code-paren">(</span><span class="code-string">"Desvios ao quadrado = "</span>, <span class="code-variable">desvios_quadrado</span><span class="code-paren">)</span>
<span class="code-function">println</span><span class="code-paren">(</span><span class="code-string">"Soma dos desvios ao quadrado = "</span>, <span class="code-variable">soma_desvios_quadrado</span><span class="code-paren">)</span>
<span class="code-function">println</span><span class="code-paren">(</span><span class="code-string">"Variância amostral = "</span>, <span class="code-variable">variancia_amostral</span><span class="code-paren">)</span>
<span class="code-function">println</span><span class="code-paren">(</span><span class="code-string">"Desvio padrão amostral = "</span>, <span class="code-variable">desvio_padrao</span><span class="code-paren">)</span>
<span class="code-function">println</span><span class="code-paren">(</span><span class="code-string">"Erro padrão = "</span>, <span class="code-variable">erro_padrao</span><span class="code-paren">)</span></code></pre>
  </div>
</div>

**Saída esperada**

<div class="code-container">
  <div class="code-header">
    <div class="code-lang"></div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar saída">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code>Média = 9.0
Desvios = [-3.0, -1.0, 1.0, 3.0]
Desvios ao quadrado = [9.0, 1.0, 1.0, 9.0]
Soma dos desvios ao quadrado = 20.0
Variância amostral = 6.666666666666667
Desvio padrão amostral = 2.581988897471611
Erro padrão = 1.2909944487358056</code></pre>
  </div>
</div>

**Cálculo com funções prontas**

Julia possui funções estatísticas básicas no módulo `Statistics`.

A função `mean()` calcula a média.

A função `std()` calcula o desvio padrão.

Por padrão, `std()` calcula o desvio padrão amostral, usando a correção com $n-1$.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang"></div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar código">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-keyword">using</span> <span class="code-module">Statistics</span>

<span class="code-variable">tempos</span> <span class="code-operator">=</span> <span class="code-paren">[</span><span class="code-number">6</span>, <span class="code-number">8</span>, <span class="code-number">10</span>, <span class="code-number">12</span><span class="code-paren">]</span>

<span class="code-variable">media</span> <span class="code-operator">=</span> <span class="code-function">mean</span><span class="code-paren">(</span><span class="code-variable">tempos</span><span class="code-paren">)</span>
<span class="code-variable">desvio_padrao</span> <span class="code-operator">=</span> <span class="code-function">std</span><span class="code-paren">(</span><span class="code-variable">tempos</span><span class="code-paren">)</span>
<span class="code-variable">erro_padrao</span> <span class="code-operator">=</span> <span class="code-variable">desvio_padrao</span> <span class="code-operator">/</span> <span class="code-function">sqrt</span><span class="code-paren">(</span><span class="code-function">length</span><span class="code-paren">(</span><span class="code-variable">tempos</span><span class="code-paren">)</span><span class="code-paren">)</span>

<span class="code-function">println</span><span class="code-paren">(</span><span class="code-string">"Média = "</span>, <span class="code-variable">media</span><span class="code-paren">)</span>
<span class="code-function">println</span><span class="code-paren">(</span><span class="code-string">"Desvio padrão = "</span>, <span class="code-variable">desvio_padrao</span><span class="code-paren">)</span>
<span class="code-function">println</span><span class="code-paren">(</span><span class="code-string">"Erro padrão = "</span>, <span class="code-variable">erro_padrao</span><span class="code-paren">)</span></code></pre>
  </div>
</div>

**Saída esperada**

<div class="code-container">
  <div class="code-header">
    <div class="code-lang"></div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar saída">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code>Média = 9.0
Desvio padrão = 2.581988897471611
Erro padrão = 1.2909944487358056</code></pre>
  </div>
</div>

**Usando StatsBase.jl para calcular o erro padrão diretamente**

Também podemos usar o pacote `StatsBase.jl`, que possui a função `sem()`.

O nome `sem` vem de:

> standard error of the mean

Em português:

> erro padrão da média.

Primeiro, instalamos o pacote, caso ainda não esteja instalado:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang"></div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar código">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-keyword">import</span> <span class="code-module">Pkg</span>

<span class="code-module">Pkg</span><span class="code-operator">.</span><span class="code-function">add</span><span class="code-paren">(</span><span class="code-string">"StatsBase"</span><span class="code-paren">)</span></code></pre>
  </div>
</div>

Depois usamos:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang"></div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar código">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-keyword">using</span> <span class="code-module">Statistics</span>
<span class="code-keyword">using</span> <span class="code-module">StatsBase</span>

<span class="code-variable">tempos</span> <span class="code-operator">=</span> <span class="code-paren">[</span><span class="code-number">6</span>, <span class="code-number">8</span>, <span class="code-number">10</span>, <span class="code-number">12</span><span class="code-paren">]</span>

<span class="code-variable">media</span> <span class="code-operator">=</span> <span class="code-function">mean</span><span class="code-paren">(</span><span class="code-variable">tempos</span><span class="code-paren">)</span>
<span class="code-variable">desvio_padrao</span> <span class="code-operator">=</span> <span class="code-function">std</span><span class="code-paren">(</span><span class="code-variable">tempos</span><span class="code-paren">)</span>
<span class="code-variable">erro_padrao</span> <span class="code-operator">=</span> <span class="code-function">sem</span><span class="code-paren">(</span><span class="code-variable">tempos</span><span class="code-paren">)</span>

<span class="code-function">println</span><span class="code-paren">(</span><span class="code-string">"Média = "</span>, <span class="code-variable">media</span><span class="code-paren">)</span>
<span class="code-function">println</span><span class="code-paren">(</span><span class="code-string">"Desvio padrão = "</span>, <span class="code-variable">desvio_padrao</span><span class="code-paren">)</span>
<span class="code-function">println</span><span class="code-paren">(</span><span class="code-string">"Erro padrão com sem() = "</span>, <span class="code-variable">erro_padrao</span><span class="code-paren">)</span></code></pre>
  </div>
</div>

**Saída esperada**

<div class="code-container">
  <div class="code-header">
    <div class="code-lang"></div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar saída">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code>Média = 9.0
Desvio padrão = 2.581988897471611
Erro padrão com sem() = 1.2909944487358056</code></pre>
  </div>
</div>

**Exemplo com notas de alunos**

Agora vamos usar um contexto de notas.

Imagine as notas de 6 alunos:

$$
7,\ 8,\ 6,\ 9,\ 10,\ 8
$$

Queremos calcular:

- a média da turma;
- o desvio padrão das notas;
- o erro padrão da média.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang"></div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar código">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-keyword">using</span> <span class="code-module">Statistics</span>

<span class="code-variable">notas</span> <span class="code-operator">=</span> <span class="code-paren">[</span><span class="code-number">7</span>, <span class="code-number">8</span>, <span class="code-number">6</span>, <span class="code-number">9</span>, <span class="code-number">10</span>, <span class="code-number">8</span><span class="code-paren">]</span>

<span class="code-variable">media</span> <span class="code-operator">=</span> <span class="code-function">mean</span><span class="code-paren">(</span><span class="code-variable">notas</span><span class="code-paren">)</span>
<span class="code-variable">desvio_padrao</span> <span class="code-operator">=</span> <span class="code-function">std</span><span class="code-paren">(</span><span class="code-variable">notas</span><span class="code-paren">)</span>
<span class="code-variable">erro_padrao</span> <span class="code-operator">=</span> <span class="code-variable">desvio_padrao</span> <span class="code-operator">/</span> <span class="code-function">sqrt</span><span class="code-paren">(</span><span class="code-function">length</span><span class="code-paren">(</span><span class="code-variable">notas</span><span class="code-paren">)</span><span class="code-paren">)</span>

<span class="code-function">println</span><span class="code-paren">(</span><span class="code-string">"Média da turma = "</span>, <span class="code-variable">media</span><span class="code-paren">)</span>
<span class="code-function">println</span><span class="code-paren">(</span><span class="code-string">"Desvio padrão das notas = "</span>, <span class="code-variable">desvio_padrao</span><span class="code-paren">)</span>
<span class="code-function">println</span><span class="code-paren">(</span><span class="code-string">"Erro padrão da média = "</span>, <span class="code-variable">erro_padrao</span><span class="code-paren">)</span></code></pre>
  </div>
</div>

**Saída esperada**

<div class="code-container">
  <div class="code-header">
    <div class="code-lang"></div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar saída">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code>Média da turma = 8.0
Desvio padrão das notas = 1.4142135623730951
Erro padrão da média = 0.5773502691896258</code></pre>
  </div>
</div>

A interpretação é:

$$
\bar{x} = 8
$$

A média das notas foi 8.

$$
s \approx 1{,}41
$$

As notas individuais se afastam da média em torno de 1,41 ponto.

$$
EP \approx 0{,}58
$$

A média amostral tem uma incerteza típica de aproximadamente 0,58 ponto.

<div class="mk-box mk-box-tip">
  <strong>Regra prática em Julia:</strong><br>
  Para calcular o desvio padrão, use <code>std(x)</code>. Para calcular o erro padrão manualmente, use <code>std(x) / sqrt(length(x))</code>. Com <code>StatsBase.jl</code>, também é possível usar <code>sem(x)</code>.
</div>

---

## 10. Conclusão e resumo em uma frase

---

Desvio padrão e erro padrão são conceitos conectados, mas não equivalentes.

O desvio padrão nasce da pergunta:

> quanto os dados variam?

Já o erro padrão nasce da pergunta:

> quanto a média amostral varia como estimativa?

O desvio padrão é uma medida descritiva da variabilidade dos valores observados.

O erro padrão é uma medida inferencial da incerteza da média.

Por isso, quando lemos uma tabela, um artigo, um gráfico ou um relatório, precisamos observar com atenção se o valor mostrado é um desvio padrão ou um erro padrão.

Confundir os dois pode levar a interpretações erradas.

Um erro padrão pequeno não significa necessariamente que os dados são pouco dispersos.

Pode significar apenas que a média foi estimada com maior precisão, especialmente quando o tamanho da amostra é grande.

<div class="mk-box mk-box-purple">
  <strong>Resumo em uma frase:</strong><br>
  O desvio padrão mede o quanto os dados individuais variam em torno da média, enquanto o erro padrão mede o quanto a própria média amostral tende a variar de amostra para amostra.
</div>

---

## Referências

---

As explicações deste post foram organizadas didaticamente a partir de materiais clássicos de Estatística Descritiva, Inferência Estatística e documentação oficial de Julia.

As explicações deste post foram organizadas didaticamente a partir de materiais clássicos de Estatística Descritiva, Inferência Estatística e documentação oficial de Julia.

- Julia — Statistics Standard Library: documentação oficial das funções `mean`, `std`, `var` e outras funções estatísticas básicas.  
  https://docs.julialang.org/en/v1/stdlib/Statistics/

- StatsBase.jl — Scalar Statistics: documentação do pacote `StatsBase.jl`, incluindo funções estatísticas adicionais, como `sem`.  
  https://juliastats.org/StatsBase.jl/stable/scalarstats/

- Penn State — STAT 200: Confidence Intervals: material introdutório sobre intervalos de confiança, estimativa pontual, margem de erro e erro padrão.  
  https://online.stat.psu.edu/stat200/lesson/4/4.2

- Altman & Bland — Standard deviations and standard errors: artigo curto explicando a diferença entre desvio padrão e erro padrão em contexto científico.  
  https://pmc.ncbi.nlm.nih.gov/articles/PMC1255808/

- NIST/SEMATECH — e-Handbook of Statistical Methods: manual técnico com conceitos estatísticos usados em análise de dados, incerteza, variabilidade e métodos estatísticos.  
  https://www.itl.nist.gov/div898/handbook/

---

## Compartilhe este artigo

<div class="share-buttons">
  <p class="share-buttons-title">Gostou deste artigo? Compartilhe!</p>

  <a href="https://api.whatsapp.com/send?text={{ page.title | url_encode }}%20-%20{{ site.url }}{{ page.url }}" target="_blank" rel="noopener noreferrer" class="share-btn whatsapp" title="Compartilhar no WhatsApp">
    <i class="bi bi-whatsapp"></i>
  </a>

  <a href="https://www.facebook.com/sharer/sharer.php?u={{ site.url }}{{ page.url }}" target="_blank" rel="noopener noreferrer" class="share-btn facebook" title="Compartilhar no Facebook">
    <i class="bi bi-facebook"></i>
  </a>

  <a href="https://www.linkedin.com/shareArticle?mini=true&url={{ site.url }}{{ page.url }}&title={{ page.title | url_encode }}&summary={{ page.description | url_encode }}" target="_blank" rel="noopener noreferrer" class="share-btn linkedin" title="Compartilhar no LinkedIn">
    <i class="bi bi-linkedin"></i>
  </a>

  <a href="https://x.com/intent/tweet?text={{ page.title | url_encode }}&url={{ site.url }}{{ page.url }}" target="_blank" rel="noopener noreferrer" class="share-btn twitter-x" title="Compartilhar no X">
    <i class="bi bi-twitter-x"></i>
  </a>

  <button id="copy-link-btn-desvio-padrao-erro-padrao" class="share-btn copy-link" title="Copiar Link">
    <i class="bi bi-link-45deg"></i>
  </button>
</div>

<script>
document.addEventListener("DOMContentLoaded", function () {
  const btn = document.getElementById("copy-link-btn-desvio-padrao-erro-padrao");
  if (!btn) return;

  btn.addEventListener("click", function () {
    navigator.clipboard.writeText(window.location.href).then(function () {
      const originalContent = btn.innerHTML;
      btn.innerHTML = "Copiado!";
      btn.style.fontSize = "12px";
      btn.style.fontWeight = "bold";

      setTimeout(function () {
        btn.innerHTML = originalContent;
        btn.style.fontSize = "";
        btn.style.fontWeight = "";
      }, 2000);
    });
  });
});
</script>

</div>