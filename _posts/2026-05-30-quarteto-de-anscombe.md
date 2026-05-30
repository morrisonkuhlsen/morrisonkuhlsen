---
layout: post
image: /assets/images/anscombi.avif
title: "Quarteto de Anscombe: por que gráficos são indispensáveis na Estatística?"
categories: [ESTATÍSTICA, VISUALIZAÇÃO DE DADOS, JULIA]
tags: [Estatística, News]
lang: pt
ref: quarteto-de-anscombe
author: dante-bertuzzi
mathjax: true
description: "Entenda o Quarteto de Anscombe e veja por que médias, variâncias, correlação e regressão podem contar a mesma história numérica, mas esconder gráficos completamente diferentes."
slug: quarteto-de-anscombe-por-que-graficos-sao-indispensaveis-na-estatistica
---

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
</style>

<div class="mk-stat-post" markdown="1">

---

## 1. Quarteto de Anscombe: quatro gráficos, quase os mesmos números

---

O **Quarteto de Anscombe** é um dos exemplos mais famosos da Estatística porque mostra uma lição simples e poderosa:

> estatísticas resumidas podem ser iguais, mas os gráficos podem contar histórias completamente diferentes.

Ele é formado por quatro conjuntos de dados. Cada conjunto possui pares de valores $(x, y)$. Quando calculamos média, variância, correlação de Pearson e reta de regressão, os resultados são praticamente os mesmos. Porém, quando fazemos os gráficos de dispersão, percebemos que os padrões são muito diferentes.

<div class="mk-box mk-box-info">
  <strong>Pergunta central:</strong><br>
  Se média, variância, correlação e reta de regressão são quase iguais, por que os gráficos são tão diferentes?
</div>

A resposta é que uma única estatística raramente consegue representar toda a estrutura dos dados. Ela resume. E todo resumo, por definição, perde informação.

---

## 2. O que é o Quarteto de Anscombe?

---

O Quarteto de Anscombe foi apresentado pelo estatístico **Francis J. Anscombe** no artigo *Graphs in Statistical Analysis*, publicado em 1973 na revista *The American Statistician*.

A ideia do exemplo é didática: mostrar que gráficos não são apenas enfeites em uma análise estatística. Eles são parte essencial da investigação dos dados.

<div class="mk-grid-2">
  <div class="mk-card">
    <h4>O que os números sugerem?</h4>
    <p>Os quatro conjuntos parecem quase iguais quando observamos apenas estatísticas resumidas.</p>
    <p>Média, variância, correlação e regressão apontam para uma relação parecida.</p>
  </div>

  <div class="mk-card">
    <h4>O que os gráficos revelam?</h4>
    <p>Os quatro conjuntos têm padrões visuais diferentes.</p>
    <p>Há linearidade, curvatura, pontos influentes e concentração artificial de valores.</p>
  </div>
</div>

Em forma compacta:

$$
\text{mesmos resumos estatísticos} \not\Rightarrow \text{mesma estrutura dos dados}
$$

<div class="mk-box mk-box-tip">
  <strong>Ideia principal:</strong><br>
  O Quarteto de Anscombe mostra que uma análise estatística responsável deve combinar resumos numéricos com visualização de dados.
</div>

---

## 3. Os dados do Quarteto de Anscombe

---

Cada conjunto possui 11 observações. Os três primeiros usam os mesmos valores de $x$. O quarto conjunto possui quase todos os valores de $x$ iguais a 8, com um ponto distante em $x = 19$.

<div class="mk-table-wrap">
<table class="mk-table">
  <thead>
    <tr>
      <th>Conjunto</th>
      <th>Característica visual</th>
      <th>O que pode enganar?</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>I</td>
      <td>Relação aproximadamente linear</td>
      <td>Este é o caso em que a reta resume razoavelmente bem o padrão</td>
    </tr>
    <tr>
      <td>II</td>
      <td>Padrão curvo</td>
      <td>A correlação linear ignora a curvatura</td>
    </tr>
    <tr>
      <td>III</td>
      <td>Quase linear, mas com um ponto discrepante</td>
      <td>Um único ponto altera a reta e a correlação</td>
    </tr>
    <tr>
      <td>IV</td>
      <td>Quase todos os valores de $x$ são iguais</td>
      <td>Um ponto com $x$ distante domina a regressão</td>
    </tr>
  </tbody>
</table>
</div>

O ponto mais importante é que a tabela acima só fica clara depois que olhamos os gráficos.

---

## 4. O paradoxo didático: números parecidos, histórias diferentes

---

Os quatro conjuntos possuem aproximadamente:

<div class="mk-grid-4">
  <div class="mk-kpi">
    <strong>$\bar{x} = 9$</strong>
    <span>média de x</span>
  </div>

  <div class="mk-kpi">
    <strong>$\bar{y} \approx 7{,}5$</strong>
    <span>média de y</span>
  </div>

  <div class="mk-kpi">
    <strong>$r \approx 0{,}816$</strong>
    <span>correlação de Pearson</span>
  </div>

  <div class="mk-kpi">
    <strong>$\hat{y} \approx 3 + 0{,}5x$</strong>
    <span>reta ajustada</span>
  </div>
</div>

Uma forma simples de resumir a situação é:

<div class="mk-formula-box">

$$
\bar{x}_1 \approx \bar{x}_2 \approx \bar{x}_3 \approx \bar{x}_4
$$

$$
\bar{y}_1 \approx \bar{y}_2 \approx \bar{y}_3 \approx \bar{y}_4
$$

$$
r_1 \approx r_2 \approx r_3 \approx r_4
$$

$$
\hat{y}_1 \approx \hat{y}_2 \approx \hat{y}_3 \approx \hat{y}_4
$$

</div>

Mesmo assim, os gráficos são muito diferentes.

<div class="mk-box mk-box-alert">
  <strong>Cuidado:</strong><br>
  Quando usamos apenas média, variância, correlação e regressão, podemos perder informações importantes sobre curvatura, assimetria, agrupamentos e pontos influentes.
</div>

---

## 5. Resumos estatísticos dos quatro conjuntos

---

Usando o código em Julia deste post, obtemos os seguintes resultados aproximados:

<div class="mk-table-wrap">
<table class="mk-table">
  <thead>
    <tr>
      <th>Conjunto</th>
      <th>$\bar{x}$</th>
      <th>$\bar{y}$</th>
      <th>$s_x^2$</th>
      <th>$s_y^2$</th>
      <th>$r$</th>
      <th>Reta ajustada</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>I</td>
      <td>9,0000</td>
      <td>7,5009</td>
      <td>11,0000</td>
      <td>4,1273</td>
      <td>0,8164</td>
      <td>$\hat{y} = 3{,}0001 + 0{,}5001x$</td>
    </tr>
    <tr>
      <td>II</td>
      <td>9,0000</td>
      <td>7,5009</td>
      <td>11,0000</td>
      <td>4,1276</td>
      <td>0,8162</td>
      <td>$\hat{y} = 3{,}0009 + 0{,}5000x$</td>
    </tr>
    <tr>
      <td>III</td>
      <td>9,0000</td>
      <td>7,5000</td>
      <td>11,0000</td>
      <td>4,1226</td>
      <td>0,8163</td>
      <td>$\hat{y} = 3{,}0025 + 0{,}4997x$</td>
    </tr>
    <tr>
      <td>IV</td>
      <td>9,0000</td>
      <td>7,5009</td>
      <td>11,0000</td>
      <td>4,1232</td>
      <td>0,8165</td>
      <td>$\hat{y} = 3{,}0017 + 0{,}4999x$</td>
    </tr>
  </tbody>
</table>
</div>

Observe como os números são parecidos. Se uma pessoa analisasse apenas essa tabela, talvez dissesse:

> os quatro conjuntos apresentam uma relação linear positiva moderada a forte entre $x$ e $y$.

Mas essa interpretação seria incompleta.

---

## 6. Como cada gráfico muda a interpretação?

---

**Conjunto I: relação aproximadamente linear**

O primeiro conjunto é o mais comportado. A nuvem de pontos segue uma tendência aproximadamente linear. Nesse caso, a reta de regressão é uma descrição razoável do padrão geral.

<div class="mk-step">
  <strong>Interpretação:</strong><br>
  Aqui, a correlação e a reta de regressão contam uma história compatível com o gráfico.
</div>

**Conjunto II: relação curva**

O segundo conjunto tem uma estrutura curvilínea. A correlação de Pearson ainda aparece alta, mas ela mede associação linear. Portanto, ela não descreve bem a curvatura dos dados.

<div class="mk-step">
  <strong>Interpretação:</strong><br>
  A relação entre $x$ e $y$ existe, mas não parece linear. Uma reta pode ser uma simplificação ruim.
</div>

**Conjunto III: ponto discrepante com grande influência**

O terceiro conjunto parece ter uma tendência linear, mas um ponto muito alto em $y$ influencia o ajuste da reta.

<div class="mk-step">
  <strong>Interpretação:</strong><br>
  Um único ponto pode afetar fortemente a correlação e a regressão. Por isso, é importante investigar pontos influentes.
</div>

**Conjunto IV: ponto de alavancagem**

O quarto conjunto possui quase todos os valores de $x$ iguais a 8. A reta é praticamente determinada por um único ponto distante em $x$.

<div class="mk-step">
  <strong>Interpretação:</strong><br>
  Mesmo com correlação alta, o gráfico mostra que a relação depende demais de uma observação com alta alavancagem.
</div>

<div class="mk-box mk-box-purple">
  <strong>Resumo interpretativo:</strong><br>
  O Quarteto de Anscombe ensina que correlação e regressão devem ser interpretadas junto com gráficos de dispersão, e não como substitutas da visualização.
</div>

---

## 7. Correlação de Pearson: o que ela mede e o que ela não mede

---

A correlação de Pearson mede a força e a direção de uma associação **linear** entre duas variáveis quantitativas.

A fórmula é:

<div class="mk-formula-box">

$$
r = \frac{\sum_{i=1}^{n}(x_i - \bar{x})(y_i - \bar{y})}{\sqrt{\sum_{i=1}^{n}(x_i - \bar{x})^2}\sqrt{\sum_{i=1}^{n}(y_i - \bar{y})^2}}
$$

</div>

Quando $r$ está próximo de 1, existe uma associação linear positiva forte. Quando $r$ está próximo de -1, existe uma associação linear negativa forte. Quando $r$ está próximo de 0, não há forte associação linear.

Mas isso não significa que não exista relação alguma.

<div class="mk-grid-2">
  <div class="mk-card">
    <h4>O que a correlação capta bem?</h4>
    <p>Associações aproximadamente lineares.</p>
    <p>Direção geral da relação entre duas variáveis.</p>
  </div>

  <div class="mk-card">
    <h4>O que a correlação pode esconder?</h4>
    <p>Curvaturas, agrupamentos, pontos influentes e relações não lineares.</p>
    <p>Ela também não prova causalidade.</p>
  </div>
</div>

<div class="mk-box mk-box-alert">
  <strong>Erro comum:</strong><br>
  Ver uma correlação alta e concluir imediatamente que a relação é linear, estável e causal. O gráfico precisa ser analisado antes dessa conclusão.
</div>

---

## 8. Regressão linear: por que a mesma reta pode enganar?

---

A regressão linear simples ajusta uma reta do tipo:

<div class="mk-formula-box">

$$
\hat{y} = \hat{\beta}_0 + \hat{\beta}_1x
$$

</div>

No Quarteto de Anscombe, os quatro conjuntos produzem aproximadamente a mesma reta:

$$
\hat{y} \approx 3 + 0{,}5x
$$

A inclinação $0{,}5$ sugere que, para cada aumento de uma unidade em $x$, o valor previsto de $y$ aumenta, em média, cerca de meia unidade.

Mas essa interpretação só é segura quando o modelo linear é uma descrição razoável dos dados.

<div class="mk-box mk-box-note">
  <strong>Regra prática:</strong><br>
  Antes de confiar em uma regressão linear, observe o gráfico de dispersão e os resíduos. A reta pode existir matematicamente, mas não representar bem a estrutura real dos dados.
</div>

---

## 9. Código em Julia com CairoMakie

---

O código abaixo monta os dados do Quarteto de Anscombe, calcula as estatísticas principais, ajusta a reta de regressão, constrói intervalos de confiança pontuais e gera uma figura 2 × 2 com `CairoMakie`.

Para instalar os pacotes necessários, execute no REPL do Julia:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang"></div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar código">
      Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Pkg
Pkg.add(["CairoMakie", "Distributions"])</code></pre>
  </div>
</div>

Agora, o script completo:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang"></div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar código">
      Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code># ============================================================
#  Quarteto de Anscombe em Julia — CairoMakie
#  Equivalente ao script R do vídeo (ggplot2 + stat_cor)
#  Pacotes: Statistics (stdlib), CairoMakie, Distributions
# ============================================================
#
#  Para instalar as dependências, execute no REPL:
#    using Pkg
#    Pkg.add([&quot;CairoMakie&quot;, &quot;Distributions&quot;])
#
# ============================================================

using Statistics
using Distributions   # quantil t de Student
using CairoMakie

# ----------------------------------------------------------
# 1. Dados — equivalente a datasets::anscombe do R
# ----------------------------------------------------------
anscombe = (
    x1 = [10, 8, 13, 9, 11, 14, 6, 4, 12, 7, 5],
    y1 = [8.04, 6.95, 7.58, 8.81, 8.33, 9.96, 7.24, 4.26, 10.84, 4.82, 5.68],

    x2 = [10, 8, 13, 9, 11, 14, 6, 4, 12, 7, 5],
    y2 = [9.14, 8.14, 8.74, 8.77, 9.26, 8.10, 6.13, 3.10, 9.13, 7.26, 4.74],

    x3 = [10, 8, 13, 9, 11, 14, 6, 4, 12, 7, 5],
    y3 = [7.46, 6.77, 12.74, 7.11, 7.81, 8.84, 6.08, 5.39, 8.15, 6.42, 5.73],

    x4 = [8, 8, 8, 8, 8, 8, 8, 19, 8, 8, 8],
    y4 = [6.58, 5.76, 7.71, 8.84, 8.47, 7.04, 5.25, 12.50, 5.56, 7.91, 6.89],
)

# ----------------------------------------------------------
# 2. Funções auxiliares
# ----------------------------------------------------------

&quot;&quot;&quot;Correlação de Pearson — equivalente a cor(..., method=&quot;pearson&quot;)&quot;&quot;&quot;
function pearson_r(x::AbstractVector, y::AbstractVector)
    mx, my = mean(x), mean(y)
    num = sum((x .- mx) .* (y .- my))
    den = sqrt(sum((x .- mx) .^ 2) * sum((y .- my) .^ 2))
    return num / den
end

&quot;&quot;&quot;Regressão linear simples — equivalente a lm(y ~ x)&quot;&quot;&quot;
function lin_reg(x::AbstractVector, y::AbstractVector)
    mx, my = mean(x), mean(y)
    slope     = sum((x .- mx) .* (y .- my)) / sum((x .- mx) .^ 2)
    intercept = my - slope * mx
    return slope, intercept
end

&quot;&quot;&quot;
Intervalo de confiança pontual da regressão — equivalente a geom_smooth(se=TRUE).

Retorna (y_hat, ci_lower, ci_upper) para cada ponto em x_new.
Fórmula:  ŷ ± t_{α/2, n-2} · σ̂ · √(1/n + (x_new - x̄)² / Σ(xᵢ - x̄)²)
&quot;&quot;&quot;
function reg_ci(x::AbstractVector, y::AbstractVector,
                x_new::AbstractVector; level::Float64 = 0.95)
    n          = length(x)
    slope, int = lin_reg(x, y)
    y_hat_obs  = slope .* x .+ int
    σ̂²         = sum((y .- y_hat_obs) .^ 2) / (n - 2)
    σ̂          = sqrt(σ̂²)
    mx         = mean(x)
    Sxx        = sum((x .- mx) .^ 2)
    t_crit     = quantile(TDist(n - 2), 1 - (1 - level) / 2)

    y_new  = slope .* x_new .+ int
    se_fit = σ̂ .* sqrt.(1/n .+ (x_new .- mx) .^ 2 ./ Sxx)
    return y_new, y_new .- t_crit .* se_fit, y_new .+ t_crit .* se_fit
end

&quot;&quot;&quot;Imprime estatísticas descritivas do par (x, y)&quot;&quot;&quot;
function print_stats(label::String, x::AbstractVector, y::AbstractVector)
    r          = pearson_r(x, y)
    slope, int = lin_reg(x, y)
    println(&quot;─── $label ───────────────────────────────&quot;)
    println(&quot;  mean(x)   = $(round(mean(x); digits=4))&quot;)
    println(&quot;  mean(y)   = $(round(mean(y); digits=4))&quot;)
    println(&quot;  var(x)    = $(round(var(x);  digits=4))&quot;)
    println(&quot;  var(y)    = $(round(var(y);  digits=4))&quot;)
    println(&quot;  r Pearson = $(round(r;       digits=4))&quot;)
    println(&quot;  y = $(round(slope; digits=4))x + $(round(int; digits=4))&quot;)
    println()
end

# ----------------------------------------------------------
# 3. Impressão das estatísticas
# ----------------------------------------------------------
println(&quot;\n=== Quarteto de Anscombe — Estatísticas Descritivas ===\n&quot;)

pares   = [(:x1,:y1), (:x2,:y2), (:x3,:y3), (:x4,:y4)]
titulos = [&quot;Exemplo 1&quot;, &quot;Exemplo 2&quot;, &quot;Exemplo 3&quot;, &quot;Exemplo 4&quot;]

for (i, (xk, yk)) in enumerate(pares)
    x = getfield(anscombe, xk)
    y = getfield(anscombe, yk)
    print_stats(titulos[i], x, y)
end

# ----------------------------------------------------------
# 4. Gráficos com CairoMakie
# ----------------------------------------------------------

# Paleta de cores (uma por exemplo)
cores = [
    Makie.wong_colors()[1],   # azul
    Makie.wong_colors()[3],   # verde
    Makie.wong_colors()[2],   # laranja
    Makie.wong_colors()[6],   # roxo
]

# Figura com layout 2×2
fig = Figure(size = (860, 700), fontsize = 13)

Label(fig[0, 1:2],
    &quot;Quarteto de Anscombe&quot;,
    fontsize = 16,
    font     = :bold,
    padding  = (0, 0, 4, 0),
)

positions = [(1,1), (1,2), (2,1), (2,2)]

for (i, (xk, yk)) in enumerate(pares)
    x = Float64.(getfield(anscombe, xk))
    y = Float64.(getfield(anscombe, yk))

    r              = pearson_r(x, y)
    slope, intcept = lin_reg(x, y)

    x_seq = collect(range(minimum(x) - 1, maximum(x) + 1; length = 200))
    y_seq, ci_lo, ci_hi = reg_ci(x, y, x_seq)

    row, col = positions[i]
    ax = Axis(fig[row, col];
        title       = &quot;$(titulos[i])   r = $(round(r; digits=3))&quot;,
        titlesize   = 13,
        titlefont   = :bold,
        xlabel      = &quot;x&quot;,
        ylabel      = &quot;y&quot;,
        xgridcolor  = (:black, 0.08),
        ygridcolor  = (:black, 0.08),
        spinewidth  = 0.8,
    )

    # Sombreamento do IC 95% — equivalente a geom_smooth(se = TRUE)
    band!(ax, x_seq, ci_lo, ci_hi;
        color = (cores[i], 0.18),
    )

    # Linha de regressão — equivalente a geom_smooth(method = &quot;lm&quot;)
    lines!(ax, x_seq, y_seq;
        color     = (:gray40, 0.85),
        linewidth = 1.8,
        linestyle = :dash,
    )

    # Pontos — equivalente a geom_point
    scatter!(ax, x, y;
        color        = (cores[i], 0.85),
        strokecolor  = :white,
        strokewidth  = 0.8,
        markersize   = 11,
    )

    # Anotação com r e p-valor (equivalente a stat_cor do ggpubr)
    # p-valor bilateral via distribuição t com n-2 graus de liberdade
    n    = length(x)
    t_stat = r * sqrt(n - 2) / sqrt(1 - r^2)
    pval   = 2 * (1 - cdf(TDist(n - 2), abs(t_stat)))
    pstr   = pval &lt; 0.001 ? &quot;p &lt; 0.001&quot; : &quot;p = $(round(pval; digits=3))&quot;

    text!(ax,
        minimum(x) - 0.2, maximum(y) + 0.1;
        text     = &quot;r = $(round(r; digits=3)),  $pstr&quot;,
        fontsize = 11,
        color    = :gray30,
        align    = (:left, :bottom),
    )
end

# Ajuste de espaçamento entre subplots
colgap!(fig.layout, 18)
rowgap!(fig.layout, 14)

# ----------------------------------------------------------
# 5. Salvar a figura
# ----------------------------------------------------------
mkpath(&quot;assets/images&quot;)
save(&quot;assets/images/quarteto_anscombe_cairomakie.png&quot;, fig; px_per_unit = 2)   # resolução 2×
println(&quot;Figura salva em: assets/images/quarteto_anscombe_cairomakie.png&quot;)

# Para visualizar interativamente no REPL:
#   display(fig)</code></pre>
  </div>
</div>

**Saída esperada no terminal**

<div class="code-container">
  <div class="code-header">
    <div class="code-lang"></div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar saída">
      Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>=== Quarteto de Anscombe — Estatísticas Descritivas ===

─── Exemplo 1 ───────────────────────────────
  mean(x)   = 9.0
  mean(y)   = 7.5009
  var(x)    = 11.0
  var(y)    = 4.1273
  r Pearson = 0.8164
  y = 0.5001x + 3.0001

─── Exemplo 2 ───────────────────────────────
  mean(x)   = 9.0
  mean(y)   = 7.5009
  var(x)    = 11.0
  var(y)    = 4.1276
  r Pearson = 0.8162
  y = 0.5x + 3.0009

─── Exemplo 3 ───────────────────────────────
  mean(x)   = 9.0
  mean(y)   = 7.5
  var(x)    = 11.0
  var(y)    = 4.1226
  r Pearson = 0.8163
  y = 0.4997x + 3.0025

─── Exemplo 4 ───────────────────────────────
  mean(x)   = 9.0
  mean(y)   = 7.5009
  var(x)    = 11.0
  var(y)    = 4.1232
  r Pearson = 0.8165
  y = 0.4999x + 3.0017

Figura salva em: assets/images/quarteto_anscombe_cairomakie.png</code></pre>
  </div>
</div>

O arquivo gerado pelo script será:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang"></div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar nome do arquivo">
      Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>assets/images/quarteto_anscombe_cairomakie.png</code></pre>
  </div>
</div>

<figure style="text-align:center; margin: 2em auto; max-width: 900px;">
  <img src="/assets/images/quarteto_anscombe_cairomakie.png" alt="Gráfico do Quarteto de Anscombe gerado com CairoMakie em Julia" style="width:100%; border-radius:10px; box-shadow: 0 8px 24px rgba(15, 23, 42, .12);" />
  <figcaption style="margin-top:0.75em; font-size:0.88rem; color:#555;">
    Figura gerada pelo código em Julia com CairoMakie: os quatro conjuntos do Quarteto de Anscombe.
  </figcaption>
</figure>

---

## 10. Como ler o gráfico gerado pelo código?

---

Quando a figura 2 × 2 é gerada, cada painel mostra:

<div class="mk-table-wrap">
<table class="mk-table">
  <thead>
    <tr>
      <th>Elemento visual</th>
      <th>Significado</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Pontos</td>
      <td>Observações reais de cada conjunto</td>
    </tr>
    <tr>
      <td>Linha tracejada</td>
      <td>Reta de regressão linear ajustada</td>
    </tr>
    <tr>
      <td>Faixa sombreada</td>
      <td>Intervalo de confiança pontual da regressão</td>
    </tr>
    <tr>
      <td>Anotação $r$</td>
      <td>Correlação de Pearson calculada para o conjunto</td>
    </tr>
    <tr>
      <td>Anotação do valor-p</td>
      <td>Teste bilateral para correlação linear diferente de zero</td>
    </tr>
  </tbody>
</table>
</div>

A parte mais interessante é comparar a linha tracejada com a nuvem de pontos.

No primeiro conjunto, a linha parece coerente.

No segundo, a linha ignora a curvatura.

No terceiro, a linha é afetada por um ponto atípico.

No quarto, a linha depende de um ponto com alta alavancagem.

<div class="mk-box mk-box-tip">
  <strong>Leitura estatística:</strong><br>
  A regressão linear não deve ser avaliada apenas pelos coeficientes. Ela precisa ser avaliada visualmente e também por diagnósticos do modelo.
</div>

---

## 11. O que esse exemplo ensina para projetos reais?

---

O Quarteto de Anscombe é pequeno, mas a lição vale para bases de dados reais.

Em pesquisas, relatórios, dashboards, artigos e análises operacionais, é comum resumir tudo com médias, desvios padrão, correlações e coeficientes de regressão.

Essas medidas são úteis, mas não substituem a inspeção visual.

<div class="mk-grid-2">
  <div class="mk-card">
    <h4>Antes de concluir</h4>
    <p>Faça gráficos de dispersão.</p>
    <p>Observe padrões não lineares.</p>
    <p>Procure pontos discrepantes.</p>
    <p>Verifique agrupamentos.</p>
  </div>

  <div class="mk-card">
    <h4>Antes de modelar</h4>
    <p>Cheque se a relação parece linear.</p>
    <p>Investigue observações influentes.</p>
    <p>Analise resíduos.</p>
    <p>Não trate correlação como causalidade.</p>
  </div>
</div>

Uma análise estatística madura geralmente alterna entre dois movimentos:

$$
\text{resumir numericamente} \quad \longleftrightarrow \quad \text{visualizar graficamente}
$$

<div class="mk-box mk-box-info">
  <strong>Boa prática:</strong><br>
  Use tabelas para resumir. Use gráficos para investigar. Use modelos para formalizar. Nenhuma dessas etapas substitui totalmente as outras.
</div>

---

## 12. Erros comuns ao interpretar o Quarteto de Anscombe

---

**Erro 1: achar que correlação alta significa relação linear bem comportada**

A correlação de Pearson mede associação linear, mas pode ser alta em situações onde há curvatura, ponto influente ou estrutura artificial nos dados.

---

**Erro 2: confiar na reta sem olhar os pontos**

Uma reta de regressão sempre pode ser ajustada quando há variação em $x$, mas isso não significa que ela seja uma boa descrição da relação.

---

**Erro 3: ignorar pontos influentes**

Um único ponto pode alterar muito a inclinação, o intercepto e a correlação.

---

**Erro 4: usar apenas tabelas em relatórios analíticos**

Tabelas são úteis, mas podem esconder padrões que aparecem imediatamente em gráficos.

<div class="mk-box mk-box-alert">
  <strong>Resumo do alerta:</strong><br>
  Quando uma análise depende de relações entre variáveis, gráficos de dispersão não são opcionais. Eles são parte do diagnóstico estatístico.
</div>

---

## 13. Conclusão

---

O Quarteto de Anscombe é um exemplo clássico porque desmonta uma ilusão comum: a ideia de que bons resumos numéricos bastam para entender os dados.

Os quatro conjuntos têm médias, variâncias, correlações e retas de regressão praticamente iguais.

Ainda assim, cada gráfico revela uma história diferente.

Isso mostra que a Estatística não deve ser feita apenas com fórmulas ou tabelas. Ela também precisa de visualização, contexto e julgamento crítico.

<div class="mk-box mk-box-purple">
  <strong>Resumo em uma frase:</strong><br>
  O Quarteto de Anscombe mostra que estatísticas resumidas podem parecer iguais, mesmo quando a estrutura real dos dados é completamente diferente.
</div>

---

## Referências

---

As explicações deste post foram organizadas a partir do artigo original de Anscombe, de materiais sobre visualização estatística e da documentação oficial dos pacotes Julia usados no código.

- Anscombe, F. J. — *Graphs in Statistical Analysis*. The American Statistician, 27(1), 17–21, 1973. DOI: 10.1080/00031305.1973.10478966.  
  https://www.tandfonline.com/doi/abs/10.1080/00031305.1973.10478966

- JSTOR — Registro do artigo *Graphs in Statistical Analysis*, com DOI 10.2307/2682899.  
  https://www.jstor.org/stable/i326377

- Matejka, J.; Fitzmaurice, G. — *Same Stats, Different Graphs: Generating Datasets with Varied Appearance and Identical Statistics through Simulated Annealing*. CHI 2017.  
  https://dl.acm.org/doi/10.1145/3025453.3025912

- Autodesk Research — *Same Stats, Different Graphs*.  
  https://www.research.autodesk.com/publications/same-stats-different-graphs/

- Julia — Statistics Standard Library: documentação oficial de funções como `mean`, `var`, `std` e outras funções estatísticas básicas.  
  https://docs.julialang.org/en/v1/stdlib/Statistics/

- Makie.jl — CairoMakie: documentação oficial do backend usado para gerar gráficos estáticos em Julia.  
  https://docs.makie.org/stable/documentation/backends/cairomakie/

- Distributions.jl — documentação oficial do pacote usado no código para trabalhar com distribuições, incluindo a distribuição t de Student.  
  https://juliastats.org/Distributions.jl/

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

  <button id="copy-link-btn-quarteto-anscombe" class="share-btn copy-link" title="Copiar Link">
    <i class="bi bi-link-45deg"></i>
  </button>
</div>

<script>
if (typeof window.copyCode !== "function") {
  window.copyCode = function(button) {
    const container = button.closest(".code-container");
    if (!container) return;

    const code = container.querySelector("code");
    if (!code) return;

    navigator.clipboard.writeText(code.innerText).then(function () {
      const originalText = button.innerText;
      button.innerText = "Copiado!";

      setTimeout(function () {
        button.innerText = originalText;
      }, 2000);
    });
  };
}

document.addEventListener("DOMContentLoaded", function () {
  const btn = document.getElementById("copy-link-btn-quarteto-anscombe");
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
