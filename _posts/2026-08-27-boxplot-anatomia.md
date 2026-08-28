---
layout: post
image: /assets/images/boxplot.avif
title: "Boxplot: o que é cada elemento, como se calcula e como interpretar"
categories: [ESTATÍSTICA, VISUALIZAÇÃO DE DADOS, JULIA]
lang: pt
tags: [Estatística, Visualização de dados]
ref: boxplot-anatomia
author: dante-bertuzzi
mathjax: true
description: "A anatomia completa do boxplot: caixa, mediana, quartis, IQR, cercas de 1,5 · IQR, bigodes e outliers — o que cada elemento é, como se calcula, como se interpreta e onde o gráfico engana. Com as variantes clássicas (notch, largura proporcional a √n, letter-value plot) e o código em Julia com CairoMakie."
slug: boxplot-o-que-e-cada-elemento-como-se-calcula-e-como-interpretar
---

Existe um gráfico que todo relatório estatístico tem e que quase ninguém lê inteiro. O leitor olha a caixa, localiza a mediana, vê os pontinhos soltos e segue em frente — sem saber que a ponta do bigode não é o valor máximo, que o número 1,5 da fórmula das cercas foi calibrado para uma situação específica, e que dois softwares podem desenhar caixas diferentes para os mesmos dados.

Este post desmonta o **boxplot** peça por peça. Para cada elemento: o que é, como se calcula, como se interpreta — e, no fim, o que ele esconde, as variantes que resolvem cada limitação e o código em Julia para gerar tudo.

<style>
/* ==========================================================
   ESTILO DO POST — QUARTETO DE ANSCOMBE
   Escopado em .mk-stat-post para não afetar o restante do site.
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

.mk-stat-post .mk-grid-2 {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  margin: 1.25rem 0;
}

.mk-stat-post .mk-grid-4 {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: .9rem;
  margin: 1.25rem 0;
}

@media (max-width: 900px) {
  .mk-stat-post .mk-grid-4 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 780px) {
  .mk-stat-post .mk-grid-2,
  .mk-stat-post .mk-grid-4 {
    grid-template-columns: 1fr;
  }
}

.mk-stat-post .mk-kpi {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 1rem;
  text-align: center;
  box-shadow: 0 6px 18px rgba(15, 23, 42, .05);
}

.mk-stat-post .mk-kpi strong {
  display: block;
  color: #17324d;
  font-size: 1.25rem;
  margin-bottom: .25rem;
}

.mk-stat-post .mk-kpi span {
  color: #64748b;
  font-size: .9rem;
}

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

.mk-stat-post .mk-formula-box {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 1.2rem;
  margin: 1.35rem 0;
  text-align: center;
  box-shadow: 0 6px 18px rgba(15, 23, 42, .05);
}

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

.dark-mode .mk-stat-post .mk-card,
.dark-mode .mk-stat-post .mk-formula-box,
.dark-mode .mk-stat-post .mk-step,
.dark-mode .mk-stat-post .mk-kpi {
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

/* ----------------------------------------------------------------------
   O tema do site marca o modo escuro em [data-theme="dark"] no <html>;
   o bloco acima só previa .dark-mode. Sem estas regras, caixas, KPIs e
   tabelas ficam com fundo claro e texto claro no tema escuro.
   ---------------------------------------------------------------------- */
[data-theme="dark"] .mk-stat-post .mk-box-note   { background: #2a2115; }
[data-theme="dark"] .mk-stat-post .mk-box-tip    { background: #10251c; }
[data-theme="dark"] .mk-stat-post .mk-box-alert  { background: #2a1518; }
[data-theme="dark"] .mk-stat-post .mk-box-info   { background: #101f33; }
[data-theme="dark"] .mk-stat-post .mk-box-purple { background: #201633; }

[data-theme="dark"] .mk-stat-post .mk-formula-box,
[data-theme="dark"] .mk-stat-post .mk-step,
[data-theme="dark"] .mk-stat-post .mk-card,
[data-theme="dark"] .mk-stat-post .mk-kpi {
  background: #1f1f1f;
  border-color: #333;
  color: #e8e8e8;
}

[data-theme="dark"] .mk-stat-post .mk-kpi strong,
[data-theme="dark"] .mk-stat-post .mk-step strong,
[data-theme="dark"] .mk-stat-post .mk-card h4 { color: #9cc0e6; }

[data-theme="dark"] .mk-stat-post .mk-kpi span { color: #a9b4c2; }

[data-theme="dark"] .mk-stat-post .mk-step { border-left-color: #7fa8d4; }

[data-theme="dark"] .mk-stat-post table thead tr,
[data-theme="dark"] .mk-stat-post .mk-table thead tr { background-color: #1f3a5f; }

[data-theme="dark"] .mk-stat-post table td,
[data-theme="dark"] .mk-stat-post .mk-table td { color: #e8e8e8; }

[data-theme="dark"] .mk-stat-post table tbody tr:nth-child(odd),
[data-theme="dark"] .mk-stat-post .mk-table tbody tr:nth-child(odd) { background-color: #1c1c1c; }

[data-theme="dark"] .mk-stat-post table tbody tr:nth-child(even),
[data-theme="dark"] .mk-stat-post .mk-table tbody tr:nth-child(even) { background-color: #161616; }

[data-theme="dark"] .mk-stat-post figcaption { color: #a9b4c2 !important; }

/* As figuras têm fundo claro próprio: uma moldura discreta evita o corte seco
   contra o fundo escuro da página. */
[data-theme="dark"] .mk-stat-post figure img { border: 1px solid #2c2c2a; }
</style>

<div class="mk-stat-post" markdown="1">

---

## 1. O boxplot em uma figura

---

O **boxplot** — diagrama de caixa, *box-and-whisker plot* — é o gráfico que mais aparece em relatórios estatísticos e o que mais gente lê pela metade. Quase todo mundo sabe apontar a mediana. Bem menos gente sabe dizer o que a ponta do bigode representa, por que o número 1,5 aparece na conta das cercas, ou por que dois softwares desenham caixas ligeiramente diferentes para os mesmos dados.

Este post desmonta o gráfico peça por peça. Cada elemento tem três perguntas a responder: **o que é**, **como se calcula** e **como se interpreta**.

A figura abaixo é o mapa do post. Ela mostra, sobre o mesmo eixo horizontal: a distribuição dos dados (em cima), o boxplot com todos os elementos anotados (no meio) e os dados brutos que o resumo esconde (embaixo).

<figure style="text-align:center; margin: 2em auto; max-width: 1000px;">
  <img src="/assets/images/boxplot-anatomia.png" alt="Anatomia de um boxplot: densidade, boxplot anotado com Q1, mediana, Q3, IQR, cercas de 1,5 IQR, valores adjacentes e outliers, e os dados brutos com jitter" style="width:100%; border-radius:10px; box-shadow: 0 8px 24px rgba(15, 23, 42, .12);" />
  <figcaption style="margin-top:0.75em; font-size:0.88rem; color:#555;">
    Anatomia de um boxplot. Dados simulados de tempo de atendimento em uma unidade de saúde (n = 100), gerados com Julia e CairoMakie — o código completo está na seção 11.
  </figcaption>
</figure>

<div class="mk-box mk-box-info">
  <strong>A ideia em uma frase:</strong><br>
  O boxplot troca 100 números por 5, escolhidos de modo que a troca sobreviva a valores extremos — e marca separadamente tudo o que não coube nesse resumo.
</div>

---

## 2. Os cinco números de Tukey

---

O boxplot foi apresentado por **John W. Tukey** em *Exploratory Data Analysis* (1977) com o nome de *schematic plot*. Wickham e Stryjewski (2011) mostram que ele tem um precursor direto: o *range bar* de **Mary Eleanor Spear** (1952), que já desenhava caixa e extremos. A contribuição de Tukey foi tornar o gráfico **resistente**: separar o corpo da distribuição dos pontos extremos, em vez de deixar que os extremos definam o desenho.

A base é o **resumo de cinco números**:

<div class="mk-table-wrap">
<table class="mk-table">
  <thead>
    <tr>
      <th>Elemento</th>
      <th>O que é</th>
      <th>No exemplo (minutos)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Mínimo</td>
      <td>Menor valor observado</td>
      <td>8,5</td>
    </tr>
    <tr>
      <td>Q1 (1º quartil)</td>
      <td>Valor abaixo do qual estão 25% das observações</td>
      <td>13,4</td>
    </tr>
    <tr>
      <td>Q2 (mediana)</td>
      <td>Valor que divide a amostra ao meio</td>
      <td>16,9</td>
    </tr>
    <tr>
      <td>Q3 (3º quartil)</td>
      <td>Valor abaixo do qual estão 75% das observações</td>
      <td>21,7</td>
    </tr>
    <tr>
      <td>Máximo</td>
      <td>Maior valor observado</td>
      <td>49,6</td>
    </tr>
  </tbody>
</table>
</div>

Repare que o gráfico **não desenha o mínimo e o máximo**. Ele desenha os quartis e, no lugar dos extremos, desenha os *valores adjacentes* — que quase sempre são outra coisa. É a fonte de erro de leitura mais comum, e a seção 5 trata dela.

---

## 3. A caixa: Q1, mediana, Q3 e o IQR

---

### 3.1 A caixa

A caixa vai de $Q_1$ a $Q_3$. Ela contém, por definição, os **50% centrais** dos dados. No painel de cima da figura, é exatamente a soma dos dois quartos escuros da área sob a curva.

### 3.2 A linha interna

A linha grossa dentro da caixa é a **mediana**, não a média. A distinção importa: a mediana só depende da *ordem* dos valores, e por isso não se move quando um valor extremo fica ainda mais extremo. A média se move.

No exemplo, média = 18,4 e mediana = 16,9. Sempre que a média é sensivelmente maior que a mediana, há uma cauda pesada à direita puxando a média.

### 3.3 O IQR

A largura da caixa é a **amplitude interquartil**:

$$
\mathrm{IQR} = Q_3 - Q_1
$$

No exemplo, $\mathrm{IQR} = 21{,}7 - 13{,}4 = 8{,}3$ minutos: metade dos atendimentos se concentra numa faixa de 8,3 minutos.

O IQR é a medida de dispersão do boxplot, e cumpre o mesmo papel do desvio-padrão com uma vantagem: seu **ponto de ruptura é 25%**. Você pode corromper até um quarto das observações de cada lado que o IQR continua descrevendo o miolo dos dados. Com o desvio-padrão, um único valor absurdo basta para inflar a medida.

<div class="mk-box mk-box-tip">
  <strong>Como interpretar a caixa:</strong><br>
  Posição da caixa = onde estão os valores típicos. Largura da caixa = quão espalhados eles são. Posição da mediana <em>dentro</em> da caixa = assimetria.
</div>

### 3.4 A assimetria já aparece dentro da caixa

Compare as duas metades da caixa:

$$
Q_2 - Q_1 = 3{,}5 \qquad\text{e}\qquad Q_3 - Q_2 = 4{,}8
$$

A metade de cima é mais larga: entre a mediana e $Q_3$ os dados estão mais espalhados do que entre $Q_1$ e a mediana. Isso é **assimetria à direita**, e ela é visível sem calcular nenhum coeficiente — basta ver que a linha da mediana não está no centro da caixa.

---

## 4. Como se calcula um quartil (e por que softwares discordam)

---

Aqui está o detalhe que a maioria dos textos didáticos omite: **não existe uma única definição de quartil amostral**. Hyndman e Fan (1996) catalogaram **nove** definições diferentes em uso nos pacotes estatísticos.

O Julia, o R e o NumPy usam por padrão o **tipo 7**. Para uma proporção $p$ e uma amostra ordenada $x_{(1)} \le \dots \le x_{(n)}$:

$$
h = (n-1)\,p + 1, \qquad
Q(p) = x_{(\lfloor h \rfloor)} + \bigl(h - \lfloor h \rfloor\bigr)\left(x_{(\lceil h \rceil)} - x_{(\lfloor h \rfloor)}\right)
$$

Ou seja: encontra-se a posição $h$ e interpola-se linearmente entre os dois valores vizinhos.

Já o boxplot **original de Tukey** não usa esse quartil. Ele usa os *hinges* (quartos): a mediana da metade inferior e a mediana da metade superior da amostra — incluindo a mediana global nas duas metades quando $n$ é ímpar. Os dois resultados são próximos, mas não idênticos.

<div class="mk-box mk-box-note">
  <strong>Consequência prática:</strong><br>
  Em amostras grandes a diferença é invisível. Em amostras pequenas (n &lt; 30), a mesma amostra pode gerar caixas visivelmente diferentes em softwares diferentes — e, como as cercas dependem dos quartis, isso muda também quais pontos são marcados como outliers. Frigge, Hoaglin e Iglewicz (1989) documentaram essa divergência entre implementações. Ao publicar, diga qual definição você usou.
</div>

---

## 5. Os bigodes e as cercas: de onde vem o 1,5

---

Esta é a parte do gráfico mais mal interpretada. São **duas coisas diferentes** com nomes parecidos.

### 5.1 As cercas (fences) — valores calculados

As cercas são limiares aritméticos. Elas não são desenhadas na maioria dos softwares (na figura deste post elas aparecem pontilhadas, de propósito):

$$
\text{cerca inferior} = Q_1 - 1{,}5 \cdot \mathrm{IQR}
\qquad
\text{cerca superior} = Q_3 + 1{,}5 \cdot \mathrm{IQR}
$$

No exemplo: $13{,}4 - 1{,}5 \times 8{,}3 = 0{,}9$ e $21{,}7 + 1{,}5 \times 8{,}3 = 34{,}2$.

### 5.2 Os bigodes (whiskers) — valores observados

O bigode **não vai até a cerca**. Ele para no **valor adjacente**: a observação mais extrema que ainda está *dentro* da cerca.

No exemplo, a cerca inferior está em 0,9 minuto, mas nenhum atendimento durou tão pouco — o bigode esquerdo para em 8,5, que é o menor tempo observado. Do lado direito, a cerca está em 34,2 e o bigode para em 29,3, o maior tempo abaixo da cerca.

<div class="mk-box mk-box-alert">
  <strong>Três leituras erradas que aparecem até em artigos publicados:</strong><br>
  ❌ "O bigode é o mínimo e o máximo." — Só por coincidência, quando não há outliers.<br>
  ❌ "O bigode é um desvio-padrão." — O boxplot não usa desvio-padrão em lugar nenhum.<br>
  ❌ "O bigode marca 1,5 × IQR." — Isso é a <em>cerca</em>. O bigode para no último dado antes dela.
</div>

### 5.3 Por que 1,5?

O 1,5 é uma escolha de Tukey, calibrada — não uma dedução. Se os dados vierem de uma distribuição normal, as cercas caem a aproximadamente $\pm 2{,}698\,\sigma$ da média, e a probabilidade de uma observação cair fora delas é de cerca de **0,70%**.

<div class="mk-grid-4">
  <div class="mk-kpi">
    <strong>1,5 · IQR</strong>
    <span>cerca interna</span>
  </div>
  <div class="mk-kpi">
    <strong>2,698 σ</strong>
    <span>equivalente sob normalidade</span>
  </div>
  <div class="mk-kpi">
    <strong>0,70%</strong>
    <span>pontos fora, se normal</span>
  </div>
  <div class="mk-kpi">
    <strong>~0,7</strong>
    <span>outliers esperados em n = 100</span>
  </div>
</div>

Ou seja: numa amostra normal de 100 observações, **espera-se menos de um "outlier" por puro acaso**. O critério foi escolhido para ser raro sob normalidade e ainda assim sensível o suficiente para sinalizar caudas pesadas.

Tukey também definiu uma **cerca externa**, em $Q_3 + 3 \cdot \mathrm{IQR}$, para separar pontos "distantes" (*far out*) dos meramente atípicos. Sob normalidade ela corresponde a $\pm 4{,}72\,\sigma$ — cerca de 2 em cada milhão de observações.

---

## 6. Outliers: o que o ponto solto significa

---

Cada ponto além das cercas é desenhado individualmente. No exemplo são cinco: 37,8; 38,5; 38,5; 44,0 e 49,6 minutos.

O que esses pontos **significam**:

<div class="mk-table-wrap">
<table class="mk-table">
  <thead>
    <tr>
      <th>O ponto é…</th>
      <th>Leitura correta</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>um valor incomum <em>em relação ao IQR desta amostra</em></td>
      <td>É uma marcação relativa. Muda se a dispersão do resto mudar.</td>
    </tr>
    <tr>
      <td>um candidato à investigação</td>
      <td>Vale olhar o caso: erro de digitação? Outra população? Evento real e raro?</td>
    </tr>
    <tr>
      <td><strong>não</strong> um erro comprovado</td>
      <td>O critério é geométrico, não diagnóstico. Ele não sabe nada sobre o fenômeno.</td>
    </tr>
    <tr>
      <td><strong>não</strong> licença para excluir o dado</td>
      <td>Excluir observação porque o gráfico a destacou é como apagar o termômetro por causa da febre.</td>
    </tr>
  </tbody>
</table>
</div>

Um detalhe que muda a leitura: sob normalidade esperaríamos 0,7 outlier em $n = 100$; encontramos 5. Isso não indica cinco erros de medição — indica que a distribuição **não é normal**: ela tem cauda direita pesada, como é típico de tempos de espera e atendimento.

<div class="mk-box mk-box-note">
  <strong>Efeito de mascaramento:</strong><br>
  Quando existem <em>muitos</em> valores extremos juntos, eles inflam o próprio IQR, empurram as cercas para longe e podem deixar de ser marcados. O boxplot é resistente, não infalível: com caudas muito pesadas, use também a seção 9.
</div>

---

## 7. Como ler um boxplot em seis passos

---

<div class="mk-step"><strong>1. Mediana.</strong> Onde está o valor típico? É a única leitura que não depende da forma da distribuição.</div>
<div class="mk-step"><strong>2. Largura da caixa (IQR).</strong> Quão concentrados estão os 50% centrais? Caixa estreita = grupo homogêneo.</div>
<div class="mk-step"><strong>3. Posição da mediana dentro da caixa.</strong> No centro = simétrico; deslocada para baixo = cauda à direita; para cima = cauda à esquerda.</div>
<div class="mk-step"><strong>4. Comprimento relativo dos bigodes.</strong> Confirma (ou desmente) a assimetria vista na caixa.</div>
<div class="mk-step"><strong>5. Pontos além das cercas.</strong> Quantos, de que lado, quão longe. Um ponto muito distante conta uma história diferente de cinco pontos logo depois da cerca.</div>
<div class="mk-step"><strong>6. O que não está no gráfico.</strong> n, unidade de medida, e se a distribuição pode ser bimodal. É o passo que a próxima seção justifica.</div>

Comparando **vários grupos**, acrescente: as caixas se sobrepõem? As medianas de um grupo caem fora da caixa do outro? A dispersão muda junto com o nível (caixas maiores onde a mediana é maior indicam que uma escala logarítmica pode ser mais adequada)?

---

## 8. O que o boxplot esconde

---

O boxplot é um resumo, e todo resumo perde informação. A pergunta é: **quanta**?

A figura abaixo mostra quatro amostras de $n = 400$ construídas de propósito para terem **a mesma mediana e o mesmo IQR**. À esquerda, só os boxplots. À direita, os mesmos dados com violino e pontos sobrepostos.

<figure style="text-align:center; margin: 2em auto; max-width: 1000px;">
  <img src="/assets/images/boxplot-armadilha.png" alt="Quatro distribuições diferentes — simétrica, bimodal, uniforme e assimétrica — com mediana e IQR idênticos, mostradas como boxplot puro e como boxplot com violino e pontos" style="width:100%; border-radius:10px; box-shadow: 0 8px 24px rgba(15, 23, 42, .12);" />
  <figcaption style="margin-top:0.75em; font-size:0.88rem; color:#555;">
    Mesma mediana, mesmo IQR, quatro formas completamente diferentes. À esquerda, o boxplot não distingue nenhuma delas; à direita, o violino denuncia a bimodalidade em dois segundos.
  </figcaption>
</figure>

O caso grave é o **bimodal**: uma distribuição com dois grupos separados produz um boxplot de aparência perfeitamente normal, com a mediana caindo justamente na região onde **não há quase nenhum dado**. É o mesmo argumento do <a href="/quarteto-de-anscombe-por-que-graficos-sao-indispensaveis-na-estatistica">Quarteto de Anscombe</a>, transportado dos resumos bivariados para os univariados.

<div class="mk-box mk-box-tip">
  <strong>Regra prática:</strong><br>
  Até algumas centenas de pontos, sobreponha os dados ao boxplot (com <em>jitter</em>). Custa uma linha de código e elimina a classe inteira de erro acima. Krzywinski e Altman (2014) fazem essa recomendação explicitamente em <em>Nature Methods</em>.
</div>

---

## 9. Truques e variantes

---

Três variantes clássicas resolvem três limitações reais do boxplot padrão. Todas estão na figura, e todas estão implementadas no código da seção 11.

<figure style="text-align:center; margin: 2em auto; max-width: 1000px;">
  <img src="/assets/images/boxplot-variantes.png" alt="Três variantes do boxplot: com notch para comparar medianas, com largura proporcional à raiz de n, e letter-value plot para amostras grandes" style="width:100%; border-radius:10px; box-shadow: 0 8px 24px rgba(15, 23, 42, .12);" />
  <figcaption style="margin-top:0.75em; font-size:0.88rem; color:#555;">
    (a) notch, (b) largura proporcional a √n e (c) letter-value plot — as duas primeiras de McGill, Tukey e Larsen (1978); a terceira de Hofmann, Wickham e Kafadar (2017).
  </figcaption>
</figure>

### 9.1 Notch: comparar medianas sem fazer teste

O *notch* é um entalhe na altura da mediana, com meia-largura

$$
\pm\, 1{,}58 \cdot \frac{\mathrm{IQR}}{\sqrt{n}}
$$

que aproxima um intervalo de confiança de 95% para a mediana. A leitura é direta: **se os entalhes de dois grupos não se sobrepõem, há evidência de que as medianas diferem**. É uma aproximação (supõe normalidade assintótica da mediana) e não substitui um teste formal, mas resolve 90% das comparações visuais.

### 9.2 Largura proporcional a √n

O boxplot padrão desenha uma caixa de $n = 12$ do mesmo tamanho de uma caixa de $n = 900$, e o leitor confia igualmente nas duas. Fazendo a largura proporcional a $\sqrt{n}$ — que é como a precisão de fato cresce — o tamanho da amostra volta ao gráfico.

### 9.3 Letter-value plot: para amostras grandes

Com $n$ muito grande, a regra 1,5 · IQR desmonta: ela foi calibrada para ser rara sob normalidade, e em dados reais assimétricos ela marca uma multidão. No exemplo da figura (lognormal, $n = 20.000$), o boxplot padrão marca **970 pontos** — 4,85% da amostra — como outliers. Não é informação; é entulho.

O *letter-value plot* substitui a decisão binária "dentro ou fora" por uma sequência de quantis cada vez mais extremos — a mediana (M), os quartos (F, de *fourths*), os oitavos (E), os dezesseis avos (D), e assim por diante. Cada caixa cobre metade da cauda restante da anterior. O número de letras cresce com $n$, exatamente porque uma amostra maior permite estimar a cauda com mais confiança.

### 9.4 Outros truques que valem a pena

<div class="mk-table-wrap">
<table class="mk-table">
  <thead>
    <tr>
      <th>Situação</th>
      <th>O que fazer</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>n muito pequeno (menos de ~10 por grupo)</td>
      <td>Não use boxplot: mostre os pontos. Cinco pontos não sustentam quartis.</td>
    </tr>
    <tr>
      <td>Vários grupos sem ordem natural</td>
      <td>Ordene as caixas pela mediana. O gráfico passa a ser lido em um passe.</td>
    </tr>
    <tr>
      <td>Dados positivos muito assimétricos (tempo, renda, contagens)</td>
      <td>Escala logarítmica no eixo dos valores. Metade dos "outliers" costuma desaparecer.</td>
    </tr>
    <tr>
      <td>Suspeita de bimodalidade</td>
      <td>Violino ou <em>raincloud</em> (densidade + boxplot + pontos).</td>
    </tr>
    <tr>
      <td>Boxplot horizontal vs. vertical</td>
      <td>Horizontal quando os rótulos dos grupos são longos — nomes ficam legíveis sem rotacionar texto.</td>
    </tr>
    <tr>
      <td>Publicação científica</td>
      <td>Declare na legenda: o que os bigodes representam, qual definição de quartil e o n de cada grupo.</td>
    </tr>
  </tbody>
</table>
</div>

---

## 10. Erros comuns

---

<div class="mk-box mk-box-alert">
  <strong>1. Ler o bigode como mínimo/máximo.</strong> Já tratado na seção 5 — é o erro campeão.
</div>

<div class="mk-box mk-box-alert">
  <strong>2. Achar que a caixa é a média ± desvio-padrão.</strong> Não é. Não há média nem desvio-padrão em nenhuma parte do boxplot padrão.
</div>

<div class="mk-box mk-box-alert">
  <strong>3. Excluir automaticamente os pontos marcados.</strong> A marcação é relativa ao IQR da própria amostra e não sabe nada sobre o fenômeno medido.
</div>

<div class="mk-box mk-box-alert">
  <strong>4. Comparar caixas de tamanhos de amostra muito diferentes sem dizer o n.</strong> Use largura ∝ √n ou escreva o n abaixo de cada caixa.
</div>

<div class="mk-box mk-box-alert">
  <strong>5. Usar boxplot com dados bimodais.</strong> O gráfico fica bonito e a conclusão fica errada.
</div>

<div class="mk-box mk-box-alert">
  <strong>6. Omitir a definição usada.</strong> Bigode até 1,5 · IQR, até o percentil 5–95, ou até o mínimo/máximo? Os três existem em softwares diferentes e produzem figuras diferentes.
</div>

---

## 11. Código em Julia com CairoMakie

---

Todas as figuras deste post foram geradas em Julia com **CairoMakie**, que exporta PNG em 300 dpi e PDF vetorial — os dois formatos que uma revista costuma pedir.

Para instalar os pacotes:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>

    <button class="copy-button" aria-label="Copiar código">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code>using Pkg
Pkg.add(["CairoMakie", "Distributions", "KernelDensity", "StatsBase", "Colors"])</code></pre>
  </div>
</div>

### 11.1 A função que calcula todos os elementos

Se você levar uma única coisa deste post para o seu código, que seja esta função. Ela devolve, de uma vez, tudo o que o boxplot desenha — inclusive a distinção entre cerca e valor adjacente:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>

    <button class="copy-button" aria-label="Copiar código">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code>"""
    cinco_numeros(x)

Devolve os elementos que o boxplot desenha:
quartis, IQR, cercas internas (1,5·IQR), valores adjacentes (pontas dos
bigodes = valores observados mais extremos DENTRO das cercas) e outliers.

Nota: `quantile` do Julia usa o tipo 7 de Hyndman &amp; Fan (1996), o mesmo do R e
do numpy; Tukey (1977) usa *hinges* (medianas das metades), que diferem em
até 1/4 de observação. Em amostras pequenas isso desloca visivelmente a caixa.
"""
function cinco_numeros(x)
    q1, q2, q3 = quantile(x, [0.25, 0.5, 0.75])
    iqr = q3 - q1
    cerca_inf, cerca_sup = q1 - 1.5iqr, q3 + 1.5iqr
    dentro = x[(x .&gt;= cerca_inf) .&amp; (x .&lt;= cerca_sup)]
    (; q1, q2, q3, iqr, cerca_inf, cerca_sup,
       adj_inf = minimum(dentro), adj_sup = maximum(dentro),
       outliers = x[(x .&lt; cerca_inf) .| (x .&gt; cerca_sup)],
       n = length(x))
end</code></pre>
  </div>
</div>

Aplicada aos dados do exemplo, ela produz exatamente os números que aparecem na figura da seção 1:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">output</div>

    <button class="copy-button" aria-label="Copiar código">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code>mínimo                 8.5
valor adj. inferior    8.5   (ponta do bigode esquerdo)
Q1                    13.4
mediana (Q2)          16.9
Q3                    21.7
IQR                    8.3
cerca inferior         0.9   (Q1 − 1,5·IQR)
cerca superior        34.2   (Q3 + 1,5·IQR)
valor adj. superior   29.3   (ponta do bigode direito)
máximo                49.6
outliers                 5   [37.8, 38.5, 38.5, 44.0, 49.6]
assimetria          1.70   (média 18.4 > mediana 16.9)</code></pre>
  </div>
</div>

### 11.2 O script completo

O script abaixo gera as quatro figuras do post (anatomia, armadilha, variantes e capa), em PNG e PDF. As funções de desenho — `boxplot_h!`, `caixa_notch!` e `letter_values` — são independentes e podem ser reaproveitadas com seus próprios dados.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>

    <button class="copy-button" aria-label="Copiar código">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code># =============================================================================
#  ANATOMIA DO BOXPLOT — figuras didáticas para artigo
#  Julia 1.12 · CairoMakie
#
#  Gera três figuras (PNG 300 dpi + PDF vetorial):
#    1. boxplot-anatomia    → cada elemento do boxplot, anotado e ligado
#                             à distribuição que ele resume
#    2. boxplot-armadilha   → quatro distribuições muito diferentes com
#                             o MESMO boxplot (por que sobrepor os dados)
#    3. boxplot-variantes   → notch, largura variável e letter-value plot
#
#  Referências
#    Tukey, J. W. (1977). Exploratory Data Analysis. Addison-Wesley.
#      → o box-and-whisker original ("schematic plot"), hinges e a regra 1,5·IQR
#    McGill, R., Tukey, J. W. &amp; Larsen, W. A. (1978). Variations of Box Plots.
#      The American Statistician, 32(1), 12-16.  → notch e largura variável
#    Frigge, M., Hoaglin, D. C. &amp; Iglewicz, B. (1989). Some Implementations of
#      the Boxplot. The American Statistician, 43(1), 50-54.
#    Hyndman, R. J. &amp; Fan, Y. (1996). Sample Quantiles in Statistical Packages.
#      The American Statistician, 50(4), 361-365.  → os 9 tipos de quantil
#    Hintze, J. L. &amp; Nelson, R. D. (1998). Violin Plots. TAS, 52(2), 181-184.
#    Hofmann, H., Wickham, H. &amp; Kafadar, K. (2017). Letter-Value Plots: Boxplots
#      for Large Data. J. Comput. Graph. Stat., 26(3), 469-477.
#    Krzywinski, M. &amp; Altman, N. (2014). Visualizing samples with box plots.
#      Nature Methods, 11(2), 119-120.
#    Wickham, H. &amp; Stryjewski, L. (2011). 40 years of boxplots. (technical report)
# =============================================================================

using CairoMakie, Statistics, StatsBase, Random, Distributions, KernelDensity
using Colors, Printf

CairoMakie.activate!(type = "png", px_per_unit = 3)

const OUT = joinpath(@__DIR__, "assets", "images")
mkpath(OUT)

# ── paleta (validada para daltonismo; ver referências de dataviz) ────────────
const SURF   = parse(Colorant, "#fcfcfb")   # superfície do gráfico
const INK    = parse(Colorant, "#0b0b0b")   # tinta primária
const INK2   = parse(Colorant, "#52514e")   # tinta secundária
const MUTED  = parse(Colorant, "#898781")   # eixos, rótulos discretos
const GRID   = parse(Colorant, "#e1e0d9")   # hairline
const BLUE   = parse(Colorant, "#2a78d6")   # série 1
const BLUE_L = parse(Colorant, "#cde2fb")   # azul 100
const BLUE_M = parse(Colorant, "#9ec5f4")   # azul 200
const BLUE_D = parse(Colorant, "#184f95")   # azul 600
const ORANGE = parse(Colorant, "#eb6834")   # série 2
const AQUA   = parse(Colorant, "#1baf7a")   # série 3
const RED    = parse(Colorant, "#e34948")   # outliers / atenção

# ── estatísticas resumo de cinco números + cercas de Tukey ───────────────────
"""
    cinco_numeros(x)

Devolve os elementos que o boxplot desenha:
quartis, IQR, cercas internas (1,5·IQR), valores adjacentes (pontas dos
bigodes = valores observados mais extremos DENTRO das cercas) e outliers.

Nota: `quantile` do Julia usa o tipo 7 de Hyndman &amp; Fan (1996), o mesmo do R e
do numpy; Tukey (1977) usa *hinges* (medianas das metades), que diferem em
até 1/4 de observação. Em amostras pequenas isso desloca visivelmente a caixa.
"""
function cinco_numeros(x)
    q1, q2, q3 = quantile(x, [0.25, 0.5, 0.75])
    iqr = q3 - q1
    cerca_inf, cerca_sup = q1 - 1.5iqr, q3 + 1.5iqr
    dentro = x[(x .&gt;= cerca_inf) .&amp; (x .&lt;= cerca_sup)]
    (; q1, q2, q3, iqr, cerca_inf, cerca_sup,
       adj_inf = minimum(dentro), adj_sup = maximum(dentro),
       outliers = x[(x .&lt; cerca_inf) .| (x .&gt; cerca_sup)],
       n = length(x))
end

# ── primitivas de desenho ────────────────────────────────────────────────────
"Caixa + bigodes + outliers, na horizontal, centrada em `y` com meia-altura `h`."
function boxplot_h!(ax, s, y, h; cor = BLUE, fundo = BLUE_L, lw = 1.8, pontos = true)
    lines!(ax, [s.adj_inf, s.q1], [y, y]; color = cor, linewidth = lw)
    lines!(ax, [s.q3, s.adj_sup], [y, y]; color = cor, linewidth = lw)
    for v in (s.adj_inf, s.adj_sup)                       # tampas dos bigodes
        lines!(ax, [v, v], [y - 0.55h, y + 0.55h]; color = cor, linewidth = lw)
    end
    poly!(ax, Rect2f(s.q1, y - h, s.q3 - s.q1, 2h);
          color = fundo, strokecolor = cor, strokewidth = lw)
    lines!(ax, [s.q2, s.q2], [y - h, y + h]; color = cor, linewidth = 3.2)
    pontos &amp;&amp; scatter!(ax, s.outliers, fill(y, length(s.outliers));
                       color = RED, markersize = 10, strokecolor = SURF,
                       strokewidth = 1.5)
    return nothing
end

"Seta dupla horizontal em `y`, de `x1` a `x2` (usada para medir o IQR)."
function seta_dupla!(ax, x1, x2, y; cor = INK2, lw = 1.3, ms = 9)
    lines!(ax, [x1, x2], [y, y]; color = cor, linewidth = lw)
    scatter!(ax, [x1], [y]; marker = :ltriangle, color = cor, markersize = ms)
    scatter!(ax, [x2], [y]; marker = :rtriangle, color = cor, markersize = ms)
end

"Linha-guia (leader) fina ligando um elemento ao seu rótulo."
guia!(ax, x, y1, y2; cor = MUTED) =
    lines!(ax, [x, x], [y1, y2]; color = cor, linewidth = 0.9)

"Número formatado com vírgula decimal (padrão pt-BR)."
rot(x; d = 1) = replace(Printf.format(Printf.Format("%.$(d)f"), x), "." =&gt; ",")

# =============================================================================
#  FIGURA 1 — anatomia
# =============================================================================
Random.seed!(42)
# tempo de atendimento (min): assimétrico à direita, como quase todo tempo real
dados = round.(rand(LogNormal(log(17.5), 0.34), 100), digits = 1)
dados[[7, 33, 61]] .= [38.5, 44.0, 49.6]        # três casos extremos plausíveis
s = cinco_numeros(dados)

xmin, xmax = 0.0, 54.0

fig1 = Figure(size = (1180, 900), backgroundcolor = SURF,
              figure_padding = (30, 30, 22, 18))

Label(fig1[1, 1], "Anatomia de um boxplot";
      fontsize = 24, font = :bold, color = INK, halign = :left)
Label(fig1[2, 1],
      "Tempo de atendimento em uma unidade de saúde · n = $(s.n) · cinco números " *
      "resumem a distribuição e separam o típico do extremo";
      fontsize = 13.5, color = INK2, halign = :left)

# — painel A: a distribuição por trás do resumo ------------------------------
axA = Axis(fig1[3, 1]; backgroundcolor = SURF, ylabel = "densidade",
           ylabelsize = 12, ylabelcolor = MUTED)
hidespines!(axA); hidedecorations!(axA, label = false)

k = kde(dados; boundary = (xmin, xmax))
xs, ys = collect(k.x), collect(k.density)
regioes = [(s.adj_inf, s.q1, BLUE_L), (s.q1, s.q2, BLUE_M),
           (s.q2, s.q3, BLUE_M), (s.q3, s.adj_sup, BLUE_L)]
for (a, b, cor) in regioes
    m = (xs .&gt;= a) .&amp; (xs .&lt;= b)
    band!(axA, xs[m], zeros(count(m)), ys[m]; color = cor)
    text!(axA, (a + b) / 2, 0.004; text = "25%", align = (:center, :bottom),
          fontsize = 12, color = INK2)
end
lines!(axA, xs, ys; color = BLUE, linewidth = 2)
for v in (s.q1, s.q2, s.q3)
    i = argmin(abs.(xs .- v))
    lines!(axA, [v, v], [0, ys[i]]; color = SURF, linewidth = 2)
end
text!(axA, s.q2, maximum(ys) * 1.04;
      text = "cada quarto da área ≈ 25% das observações",
      align = (:center, :bottom), fontsize = 12, color = MUTED)
ylims!(axA, 0, maximum(ys) * 1.36)

# — painel B: o boxplot anotado ----------------------------------------------
axB = Axis(fig1[4, 1]; backgroundcolor = SURF)
hidespines!(axB); hidedecorations!(axB)
ylims!(axB, 0, 1)

# cercas internas (limiares — únicas linhas pontilhadas da figura)
for (v, lab, al) in ((s.cerca_inf, "cerca inferior = $(rot(s.cerca_inf))\nQ1 − 1,5·IQR", :left),
                     (s.cerca_sup, "cerca superior = $(rot(s.cerca_sup))\nQ3 + 1,5·IQR", :right))
    lines!(axB, [v, v], [0.06, 0.66]; color = MUTED, linewidth = 1.1,
           linestyle = :dot)
    text!(axB, v + (al == :left ? 0.6 : -0.6), 0.045; text = lab,
          align = (al, :top), fontsize = 11.5, color = INK2)
end

boxplot_h!(axB, s, 0.52, 0.15)

# acima: mediana e as pontas dos bigodes
guia!(axB, s.q2, 0.68, 0.715)
text!(axB, s.q2, 0.725; text = "mediana (Q2) = $(rot(s.q2))\n50% dos dados abaixo",
      align = (:center, :bottom), fontsize = 13, color = BLUE_D, font = :bold)
for (v, lab) in ((s.adj_inf, "valor adjacente inferior = $(rot(s.adj_inf))"),
                 (s.adj_sup, "valor adjacente superior = $(rot(s.adj_sup))"))
    guia!(axB, v, 0.61, 0.875)
    text!(axB, v, 0.885; text = lab * "\núltimo valor dentro da cerca",
          align = (:center, :bottom), fontsize = 11.5, color = INK2)
end

# abaixo: quartis, IQR
for (v, lab) in ((s.q1, "Q1 = $(rot(s.q1))\n25% abaixo"),
                 (s.q3, "Q3 = $(rot(s.q3))\n75% abaixo"))
    guia!(axB, v, 0.37, 0.325)
    text!(axB, v, 0.315; text = lab, align = (:center, :top),
          fontsize = 12.5, color = INK2)
end
seta_dupla!(axB, s.q1, s.q3, 0.185)
text!(axB, (s.q1 + s.q3) / 2, 0.16;
      text = "IQR = Q3 − Q1 = $(rot(s.iqr))\na caixa contém os 50% centrais",
      align = (:center, :top), fontsize = 12.5, color = INK2)

# caixa e outliers
text!(axB, mean(s.outliers), 0.57;
      text = "outliers: $(length(s.outliers)) pontos além das cercas",
      align = (:center, :bottom), fontsize = 12, color = RED)
text!(axB, xmax - 0.8, 0.42;
      text = "o bigode não é o mínimo nem o máximo,\ne não é um desvio-padrão",
      align = (:right, :top), fontsize = 11.5, color = MUTED)

# — painel C: os dados brutos ------------------------------------------------
axC = Axis(fig1[5, 1]; backgroundcolor = SURF, xlabel = "tempo de atendimento (minutos)",
           xlabelsize = 13.5, xlabelcolor = INK2, xticklabelsize = 12,
           xticklabelcolor = INK2, xgridcolor = GRID, xgridwidth = 1,
           ygridvisible = false, bottomspinecolor = GRID,
           xtickcolor = MUTED, xticksize = 4)
hidespines!(axC, :l, :r, :t); hideydecorations!(axC)

Random.seed!(7)
jit = 0.48 .+ 0.34 .* (rand(length(dados)) .- 0.5)
eh_out = (dados .&lt; s.cerca_inf) .| (dados .&gt; s.cerca_sup)
scatter!(axC, dados[.!eh_out], jit[.!eh_out]; color = (BLUE, 0.55),
         markersize = 9, strokewidth = 0)
scatter!(axC, dados[eh_out], jit[eh_out]; color = RED, markersize = 10,
         strokecolor = SURF, strokewidth = 1.5)
text!(axC, xmin + 0.8, 0.97; text = "os dados que o resumo esconde (jitter)",
      align = (:left, :top), fontsize = 12, color = MUTED)
ylims!(axC, 0, 1)

linkxaxes!(axA, axB, axC)
xlims!(axC, xmin, xmax)

Label(fig1[6, 1],
      "Regra 1,5·IQR e o gráfico esquemático: Tukey (1977). " *
      "Quantis pelo tipo 7 de Hyndman &amp; Fan (1996) — o mesmo de R e numpy.";
      fontsize = 11, color = MUTED, halign = :left)

rowsize!(fig1.layout, 3, Fixed(150))
rowsize!(fig1.layout, 4, Fixed(350))
rowsize!(fig1.layout, 5, Fixed(105))
rowgap!(fig1.layout, 1, 4); rowgap!(fig1.layout, 2, 16)
rowgap!(fig1.layout, 3, 2);  rowgap!(fig1.layout, 4, 2)
rowgap!(fig1.layout, 5, 12)

save(joinpath(OUT, "boxplot-anatomia.png"), fig1)
save(joinpath(OUT, "boxplot-anatomia.pdf"), fig1)

# =============================================================================
#  FIGURA 2 — a armadilha: mesmo boxplot, distribuições diferentes
# =============================================================================
Random.seed!(11)
n = 400
amostras = [
    ("simétrica",  randn(n) .* 1.0 .+ 10),
    ("bimodal",    vcat(randn(n ÷ 2) .* 0.42 .+ 8.35, randn(n ÷ 2) .* 0.42 .+ 11.65)),
    ("uniforme",   rand(Uniform(7.6, 12.4), n)),
    ("assimétrica", 10 .+ (rand(Gamma(1.6, 1.0), n) .- 1.6) .* 0.86),
]
# padroniza mediana e IQR: os quatro boxplots ficam praticamente idênticos
amostras = [(nome, begin
                 q1, q2, q3 = quantile(v, [0.25, 0.5, 0.75])
                 (v .- q2) .* (1.35 / (q3 - q1)) .+ 10.0
             end) for (nome, v) in amostras]

fig2 = Figure(size = (1180, 620), backgroundcolor = SURF,
              figure_padding = (30, 30, 22, 18))
Label(fig2[1, 1:2], "O boxplot não é único: quatro distribuições, o mesmo resumo";
      fontsize = 22, font = :bold, color = INK, halign = :left)
Label(fig2[2, 1:2],
      "n = 400 por linha, com mediana e IQR idênticos por construção: as caixas saem iguais\n" *
      "e a forma da distribuição fica invisível. À direita, o mesmo dado com violino e pontos.";
      fontsize = 13, color = INK2, halign = :left)

axL = Axis(fig2[3, 1]; backgroundcolor = SURF, title = "só o boxplot",
           titlesize = 14, titlecolor = INK2, titlealign = :left,
           yticks = (1:4, reverse(first.(amostras))), yticklabelsize = 13,
           yticklabelcolor = INK2, xticklabelsize = 12, xticklabelcolor = INK2,
           xgridcolor = GRID, ygridvisible = false, xlabel = "valor",
           xlabelsize = 13, xlabelcolor = INK2)
axR = Axis(fig2[3, 2]; backgroundcolor = SURF,
           title = "boxplot + violino + dados", titlesize = 14,
           titlecolor = INK2, titlealign = :left,
           yticksvisible = false, yticklabelsvisible = false,
           xticklabelsize = 12, xticklabelcolor = INK2, xgridcolor = GRID,
           ygridvisible = false, xlabel = "valor", xlabelsize = 13,
           xlabelcolor = INK2)
for a in (axL, axR); hidespines!(a, :t, :r, :l); a.bottomspinecolor = GRID; end

for (i, (nome, v)) in enumerate(amostras)
    si = cinco_numeros(v)
    pos = Float64(length(amostras) + 1 - i)          # 1ª amostra no topo
    boxplot_h!(axL, si, pos, 0.20)
    # direita: violino (densidade espelhada) + jitter + box fino
    ki = kde(v)
    dens = ki.density ./ maximum(ki.density) .* 0.34
    band!(axR, collect(ki.x), pos .- dens, pos .+ dens; color = (BLUE_M, 0.75))
    Random.seed!(100 + i)
    idx = rand(1:length(v), 120)
    scatter!(axR, v[idx], pos .+ 0.30 .* (rand(120) .- 0.5);
             color = (INK2, 0.35), markersize = 5, strokewidth = 0)
    boxplot_h!(axR, si, pos, 0.075; cor = INK, fundo = SURF,
               lw = 1.2, pontos = false)
end
for a in (axL, axR); ylims!(a, 0.4, 4.75); xlims!(a, 6.2, 13.8); end

Label(fig2[4, 1:2],
      "Mesma lição dos quartetos de Anscombe (1973), aplicada a resumos de " *
      "uma variável; sobreposição de dados: Krzywinski &amp; Altman (2014); " *
      "violino: Hintze &amp; Nelson (1998).";
      fontsize = 11, color = MUTED, halign = :left)
rowgap!(fig2.layout, 1, 4); rowgap!(fig2.layout, 2, 18); rowgap!(fig2.layout, 3, 12)
colgap!(fig2.layout, 26)

save(joinpath(OUT, "boxplot-armadilha.png"), fig2)
save(joinpath(OUT, "boxplot-armadilha.pdf"), fig2)

# =============================================================================
#  FIGURA 3 — três variantes que resolvem problemas reais
# =============================================================================

"Polígono da caixa com entalhe (notch) em torno da mediana — horizontal."
function caixa_notch!(ax, s, y, h; cor = BLUE, fundo = BLUE_L, lw = 1.6)
    nlo = s.q2 - 1.58 * s.iqr / sqrt(s.n)
    nhi = s.q2 + 1.58 * s.iqr / sqrt(s.n)
    nlo, nhi = max(nlo, s.q1), min(nhi, s.q3)
    hn = 0.45h
    pts = Point2f[(s.q1, y - h), (nlo, y - h), (s.q2, y - hn), (nhi, y - h),
                  (s.q3, y - h), (s.q3, y + h), (nhi, y + h), (s.q2, y + hn),
                  (nlo, y + h), (s.q1, y + h)]
    lines!(ax, [s.adj_inf, s.q1], [y, y]; color = cor, linewidth = lw)
    lines!(ax, [s.q3, s.adj_sup], [y, y]; color = cor, linewidth = lw)
    poly!(ax, pts; color = fundo, strokecolor = cor, strokewidth = lw)
    lines!(ax, [s.q2, s.q2], [y - hn, y + hn]; color = cor, linewidth = 3)
    scatter!(ax, s.outliers, fill(y, length(s.outliers)); color = RED,
             markersize = 8, strokecolor = SURF, strokewidth = 1.2)
    return (nlo, nhi)
end

"""
    letter_values(x; k)

Profundidades e valores das letras (M = mediana, F = quartos, E = oitavos, ...)
usadas no letter-value plot de Hofmann, Wickham &amp; Kafadar (2017).
"""
function letter_values(x; k = nothing)
    xs = sort(x); n = length(xs)
    kmax = isnothing(k) ? max(2, ceil(Int, log2(n)) - 3) : k
    d = (n + 1) / 2
    depths = [d]
    while length(depths) &lt; kmax
        d = (floor(d) + 1) / 2
        d &lt; 1 &amp;&amp; break
        push!(depths, d)
    end
    lo = [(xs[floor(Int, d)] + xs[ceil(Int, d)]) / 2 for d in depths]
    hi = [(xs[n + 1 - floor(Int, d)] + xs[n + 1 - ceil(Int, d)]) / 2 for d in depths]
    cob = [1 - 2.0^-(i) for i in 1:length(depths)]     # cobertura aproximada
    (; depths, lo, hi, cob)
end

fig3 = Figure(size = (1180, 700), backgroundcolor = SURF,
              figure_padding = (30, 30, 22, 18))
Label(fig3[1, 1:3], "Três variantes que resolvem problemas do boxplot padrão";
      fontsize = 22, font = :bold, color = INK, halign = :left)

# (a) notch — comparar medianas ----------------------------------------------
Random.seed!(3)
grupos = [("A", randn(120) .* 2.3 .+ 20.0),
          ("B", randn(120) .* 2.3 .+ 21.0),
          ("C", randn(120) .* 2.3 .+ 24.5)]
axa = Axis(fig3[2, 1]; backgroundcolor = SURF,
           title = "(a) notch: teste visual de medianas", titlesize = 14,
           titlealign = :left, titlecolor = INK,
           yticks = (1:3, reverse(first.(grupos))), yticklabelsize = 13,
           yticklabelcolor = INK2, xticklabelsize = 11, xticklabelcolor = INK2,
           xgridcolor = GRID, ygridvisible = false, xlabel = "valor",
           xlabelsize = 12, xlabelcolor = INK2)
for (i, (_, v)) in enumerate(grupos)
    caixa_notch!(axa, cinco_numeros(v), Float64(4 - i), 0.24)
end
text!(axa, 31.5, 4.25;
      text = "entalhes que não se sobrepõem ⇒\nmedianas diferentes (≈95%)",
      align = (:right, :top), fontsize = 11, color = INK2)
ylims!(axa, 0.5, 4.3)

# (b) largura variável — mostrar n -------------------------------------------
Random.seed!(5)
gr2 = [("n = 12", randn(12) .* 2.4 .+ 20), ("n = 60", randn(60) .* 2.4 .+ 21),
       ("n = 900", randn(900) .* 2.4 .+ 20.5)]
axb = Axis(fig3[2, 2]; backgroundcolor = SURF,
           title = "(b) largura ∝ √n: quanto pesa cada caixa", titlesize = 14,
           titlealign = :left, titlecolor = INK,
           yticks = (1:3, reverse(first.(gr2))), yticklabelsize = 12.5,
           yticklabelcolor = INK2, xticklabelsize = 11, xticklabelcolor = INK2,
           xgridcolor = GRID, ygridvisible = false, xlabel = "valor",
           xlabelsize = 12, xlabelcolor = INK2)
ns = [length(v) for (_, v) in gr2]
for (i, (_, v)) in enumerate(gr2)
    h = 0.32 * sqrt(ns[i]) / sqrt(maximum(ns))
    boxplot_h!(axb, cinco_numeros(v), Float64(4 - i), max(h, 0.055))
end
text!(axb, 28.2, 4.25;
      text = "a largura mostra o n: uma caixa estreita\né uma caixa para não levar a sério",
      align = (:right, :top), fontsize = 11, color = INK2)
ylims!(axb, 0.5, 4.3)

# (c) letter-value plot — n grande -------------------------------------------
Random.seed!(9)
grande = rand(LogNormal(3.0, 0.62), 20_000)
sg = cinco_numeros(grande)
axc = Axis(fig3[2, 3]; backgroundcolor = SURF,
           title = "(c) letter-value plot: n = 20.000", titlesize = 14,
           titlealign = :left, titlecolor = INK,
           yticks = ([1, 2], ["letter-value", "boxplot"]), yticklabelsize = 12.5,
           yticklabelcolor = INK2, xticklabelsize = 11, xticklabelcolor = INK2,
           xgridcolor = GRID, ygridvisible = false, xlabel = "valor",
           xlabelsize = 12, xlabelcolor = INK2)
boxplot_h!(axc, sg, 2.0, 0.22)
lv = letter_values(grande)
rampa = [BLUE_D, parse(Colorant, "#256abf"), BLUE, parse(Colorant, "#5598e7"),
         parse(Colorant, "#86b6ef"), BLUE_M, BLUE_L, parse(Colorant, "#e7f1fd")]
for i in length(lv.depths):-1:1
    h = 0.30 * (1 - 0.085 * (i - 1))
    poly!(axc, Rect2f(lv.lo[i], 1 - h, lv.hi[i] - lv.lo[i], 2h);
          color = rampa[min(i, end)], strokecolor = SURF, strokewidth = 1)
end
letras = ["M", "F", "E", "D", "C", "B", "A"]
for i in 1:min(4, length(lv.depths))
    text!(axc, lv.hi[i], 1.34; text = letras[i], align = (:center, :bottom),
          fontsize = 11, color = INK2)
end
text!(axc, quantile(grande, 0.999), 0.62;
      text = "o boxplot marca centenas de pontos como \"outliers\";\n" *
             "as letras (M, F, E, D…) mostram a cauda\nem vez de descartá-la",
      align = (:right, :top), fontsize = 10.5, color = INK2)
ylims!(axc, 0.02, 2.55); xlims!(axc, 0, quantile(grande, 0.999))

for a in (axa, axb, axc)
    hidespines!(a, :t, :r, :l); a.bottomspinecolor = GRID
    a.xtickcolor = MUTED; a.xticksize = 4
end

Label(fig3[3, 1:3],
      "(a) e (b): McGill, Tukey &amp; Larsen (1978) — notch ≈ mediana ± 1,58·IQR/√n. " *
      "(c): Hofmann, Wickham &amp; Kafadar (2017).";
      fontsize = 11, color = MUTED, halign = :left)
rowgap!(fig3.layout, 1, 14); rowgap!(fig3.layout, 2, 12); colgap!(fig3.layout, 30)

save(joinpath(OUT, "boxplot-variantes.png"), fig3)
save(joinpath(OUT, "boxplot-variantes.pdf"), fig3)

# =============================================================================
#  Números para o texto do artigo
# =============================================================================
println("\n── Figura 1: cinco números (tempo de atendimento, n = $(s.n)) ──")
@printf("mínimo              %6.1f\n", minimum(dados))
@printf("valor adj. inferior %6.1f   (ponta do bigode esquerdo)\n", s.adj_inf)
@printf("Q1                  %6.1f\n", s.q1)
@printf("mediana (Q2)        %6.1f\n", s.q2)
@printf("Q3                  %6.1f\n", s.q3)
@printf("IQR                 %6.1f\n", s.iqr)
@printf("cerca inferior      %6.1f   (Q1 − 1,5·IQR)\n", s.cerca_inf)
@printf("cerca superior      %6.1f   (Q3 + 1,5·IQR)\n", s.cerca_sup)
@printf("valor adj. superior %6.1f   (ponta do bigode direito)\n", s.adj_sup)
@printf("máximo              %6.1f\n", maximum(dados))
@printf("outliers            %6d   %s\n", length(s.outliers), string(sort(s.outliers)))
@printf("assimetria          %6.2f   (média %.1f &gt; mediana %.1f)\n",
        skewness(dados), mean(dados), s.q2)

println("\n── Figura 2: mediana e IQR por construção iguais ──")
for (nome, v) in amostras
    si = cinco_numeros(v)
    @printf("%-12s mediana %.2f  IQR %.2f  bigodes [%.2f, %.2f]  outliers %d\n",
            nome, si.q2, si.iqr, si.adj_inf, si.adj_sup, length(si.outliers))
end

println("\nFiguras salvas em: $OUT")

# =============================================================================
#  FIGURA 4 — capa do post (1200 × 630, proporção de card social)
# =============================================================================
figc = Figure(size = (1200, 630), backgroundcolor = SURF,
              figure_padding = (56, 56, 44, 40))
axk = Axis(figc[1, 1]; backgroundcolor = SURF)
hidespines!(axk); hidedecorations!(axk)
xlims!(axk, 4.0, 53.0); ylims!(axk, 0, 1)

boxplot_h!(axk, s, 0.40, 0.115)
for (v, lab) in ((s.q1, "Q1"), (s.q2, "mediana"), (s.q3, "Q3"))
    guia!(axk, v, 0.53, 0.585)
    text!(axk, v, 0.60; text = lab, align = (:center, :bottom), fontsize = 21,
          color = v == s.q2 ? BLUE_D : INK2, font = v == s.q2 ? :bold : :regular)
end
seta_dupla!(axk, s.q1, s.q3, 0.20; ms = 12)
text!(axk, (s.q1 + s.q3) / 2, 0.17; text = "IQR", align = (:center, :top),
      fontsize = 20, color = INK2)
text!(axk, mean(s.outliers), 0.46; text = "outliers", align = (:center, :bottom),
      fontsize = 19, color = RED)
for v in (s.adj_inf, s.adj_sup)
    text!(axk, v, 0.47; text = "bigode", align = (:center, :bottom), fontsize = 17,
          color = MUTED)
end
text!(axk, 4.0, 0.99; text = "Anatomia de um boxplot", align = (:left, :top),
      fontsize = 36, font = :bold, color = INK)
text!(axk, 4.0, 0.845;
      text = "Q1, mediana, Q3, IQR, bigodes e outliers — o que cada elemento significa",
      align = (:left, :top), fontsize = 19, color = INK2)

save(joinpath(OUT, "boxplot-capa.png"), figc)</code></pre>
  </div>
</div>

<div class="mk-box mk-box-tip">
  <strong>Detalhe de implementação que vale reaproveitar:</strong><br>
  as figuras são desenhadas com primitivas (<code>poly!</code>, <code>lines!</code>, <code>scatter!</code>) em vez da receita pronta de boxplot. Dá mais trabalho na primeira vez, mas é o que permite anotar cada elemento, controlar a altura de cada caixa e implementar variantes que a receita padrão não oferece.
</div>

---

## 12. Conclusão

---

O boxplot é um resumo de cinco números desenhado de forma resistente a valores extremos. Cada elemento tem um significado preciso:

- a **caixa** vai de Q1 a Q3 e contém os 50% centrais;
- a **linha interna** é a mediana, não a média;
- o **IQR** é a largura da caixa e mede dispersão sem se deixar levar por um único valor absurdo;
- as **cercas** são limiares calculados a 1,5 · IQR dos quartis;
- os **bigodes** param no último dado antes da cerca — não no mínimo, não no máximo, não em um desvio-padrão;
- os **pontos soltos** são observações incomuns em relação ao IQR desta amostra, e nada mais que isso.

E, como todo resumo, ele tem um preço: quatro distribuições radicalmente diferentes podem produzir a mesma caixa. Sobrepor os dados custa uma linha de código e devolve o que o resumo tirou.

<div class="mk-box mk-box-purple">
  <strong>Resumo em uma frase:</strong><br>
  O boxplot responde "onde estão os dados típicos e quão espalhados eles são" com resistência a extremos — mas não responde "que forma a distribuição tem", e é por isso que ele quase sempre pede companhia.
</div>

---

## Referências

---

- Tukey, J. W. — *Exploratory Data Analysis*. Addison-Wesley, 1977. (Obra que introduz o *schematic plot*, os *hinges* e a regra de 1,5 · IQR.)

- McGill, R.; Tukey, J. W.; Larsen, W. A. — *Variations of Box Plots*. The American Statistician, 32(1), 12–16, 1978. DOI: 10.1080/00031305.1978.10479236.  
  https://www.tandfonline.com/doi/abs/10.1080/00031305.1978.10479236

- Frigge, M.; Hoaglin, D. C.; Iglewicz, B. — *Some Implementations of the Boxplot*. The American Statistician, 43(1), 50–54, 1989. DOI: 10.1080/00031305.1989.10475612.  
  https://www.tandfonline.com/doi/abs/10.1080/00031305.1989.10475612

- Hyndman, R. J.; Fan, Y. — *Sample Quantiles in Statistical Packages*. The American Statistician, 50(4), 361–365, 1996. DOI: 10.1080/00031305.1996.10473566.  
  https://robjhyndman.com/papers/sample_quantiles.pdf

- Hintze, J. L.; Nelson, R. D. — *Violin Plots: A Box Plot-Density Trace Synergism*. The American Statistician, 52(2), 181–184, 1998. DOI: 10.1080/00031305.1998.10480559.  
  https://www.tandfonline.com/doi/abs/10.1080/00031305.1998.10480559

- Wickham, H.; Stryjewski, L. — *40 Years of Boxplots*. Relatório técnico, 2011. (História do gráfico, incluindo o *range bar* de Mary Eleanor Spear, de 1952, e um catálogo de variantes.)  
  https://vita.had.co.nz/papers/boxplots.pdf

- Krzywinski, M.; Altman, N. — *Visualizing samples with box plots*. Nature Methods, 11(2), 119–120, 2014. DOI: 10.1038/nmeth.2813.  
  https://www.nature.com/articles/nmeth.2813

- Hofmann, H.; Wickham, H.; Kafadar, K. — *Letter-Value Plots: Boxplots for Large Data*. Journal of Computational and Graphical Statistics, 26(3), 469–477, 2017. DOI: 10.1080/10618600.2017.1305277.  
  https://vita.had.co.nz/papers/letter-value-plot.pdf

- Anscombe, F. J. — *Graphs in Statistical Analysis*. The American Statistician, 27(1), 17–21, 1973. DOI: 10.1080/00031305.1973.10478966.

- Julia — Statistics Standard Library: documentação de `quantile`, `median` e demais funções usadas no código.  
  https://docs.julialang.org/en/v1/stdlib/Statistics/

- Makie.jl — CairoMakie: documentação oficial do backend usado para gerar as figuras.  
  https://docs.makie.org/stable/explanations/backends/cairomakie

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

  <button id="copy-link-btn-boxplot-anatomia" class="share-btn copy-link" title="Copiar Link">
    <i class="bi bi-link-45deg"></i>
  </button>
</div>

<script>
document.addEventListener("DOMContentLoaded", function () {
  const btn = document.getElementById("copy-link-btn-boxplot-anatomia");
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

