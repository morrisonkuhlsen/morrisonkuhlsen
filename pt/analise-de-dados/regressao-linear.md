---
layout: page
title: Regressão Linear
lang: pt
ref: regressao-linear
parent: analise-de-dados
permalink: /pt/analise-de-dados/regressao-linear
order: 1
---

<img src="{{ site.baseurl }}/assets/images/regressao.png" alt="Ilustração de regressão linear" style="max-width: 600px; display: block; margin: 1em auto;">

A regressão linear é uma das técnicas estatísticas mais utilizadas para modelar a relação entre duas variáveis quantitativas. Ela permite prever o valor de uma variável (dependente) a partir do valor de outra (independente), ajustando uma reta aos dados observados.

---

## O que é Regressão Linear?

A regressão linear simples busca encontrar a melhor reta que descreve a relação entre uma variável explicativa (X) e uma variável resposta (Y). A equação geral é:

$$
Y = a + bX + \varepsilon
$$

- $Y$: variável dependente (resposta)
- $X$: variável independente (explicativa)
- $a$: intercepto (valor de Y quando X = 0)
- $b$: coeficiente angular (inclinação da reta)
- $\varepsilon$: erro aleatório

---

## Exemplo Prático em Julia

Vamos ajustar uma regressão linear simples usando Julia.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>using DataFrames, GLM, Plots

# Dados de exemplo: Horas de estudo (X) e Nota na prova (Y)
dados = DataFrame(HorasEstudo = [5, 7, 8, 10, 12, 15, 18, 20],
                 Nota = [6, 7, 7.5, 8, 8.5, 9, 9.5, 10])

# Ajuste do modelo linear
modelo = lm(@formula(Nota ~ HorasEstudo), dados)

# Resumo do modelo
println(coeftable(modelo))

# Previsão para 14 horas de estudo
pred = predict(modelo, DataFrame(HorasEstudo = [14]))
println("Previsão para 14 horas de estudo: ", pred[1])

# Visualização
scatter(dados.HorasEstudo, dados.Nota, label="Dados", xlabel="Horas de Estudo", ylabel="Nota", title="Regressão Linear")
plot!(dados.HorasEstudo, predict(modelo), label="Reta Ajustada", lw=2, color=:red)
</code></pre>
  </div>
</div>

<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="color:white;; padding:1em; border-radius:6px; font-size:0.97em;">
────────────────────────────────────────────────────────────────────────
                Coef.  Std. Error      t  Pr(>|t|)  Lower 95%  Upper 95%
────────────────────────────────────────────────────────────────────────
(Intercept)  5.30838    0.272462   19.48    <1e-05   4.64169    5.97507
HorasEstudo  0.242452   0.0211233  11.48    <1e-04   0.190765   0.294139
────────────────────────────────────────────────────────────────────────
Previsão para 14 horas de estudo: 8.702711028958717
  </pre>
</div>

![Visualização da Regressão Linear]({{ site.baseurl }}/assets/images/regressao_linear.png){:style="max-width: 700px; display: block; margin: 1em auto;"}
<div class="image-caption" style="text-align: center;">Figura: Reta de regressão ajustada aos dados de horas de estudo e nota.</div>

---

## Interpretação dos Resultados

- **Intercepto ($a$):** Valor esperado da nota quando HorasEstudo = 0.
- **Inclinação ($b$):** Variação esperada na nota para cada hora adicional de estudo.
- **Valor-p:** Indica se o coeficiente é estatisticamente significativo.
- **$R^2$ (coeficiente de determinação):** Mede o quanto da variação de Y é explicida por X (quanto mais próximo de 1, melhor o ajuste).

---

## Visualização Gráfica

A regressão linear pode ser visualizada como uma reta que "melhor se ajusta" aos pontos do gráfico de dispersão. O objetivo é minimizar a soma dos quadrados dos resíduos (diferença entre valores observados e previstos).

---

## Quando Usar Regressão Linear?

- Quando deseja prever uma variável quantitativa a partir de outra.
- Quando a relação entre as variáveis é aproximadamente linear.
- Quando os resíduos apresentam distribuição aproximadamente normal e variância constante (homocedasticidade).

---

## Dicas e Limitações

- Sempre visualize os dados antes de ajustar o modelo.
- Verifique a presença de outliers e influências.
- Não extrapole previsões para fora do intervalo observado.
- Para múltiplas variáveis explicativas, use **regressão linear múltipla**.

---

## Resolução Manual Passo a Passo

Vamos resolver o mesmo exemplo da regressão linear (Horas de Estudo vs Nota) manualmente, mostrando todos os cálculos:

### **Dados**

<table style="margin: 1em auto; border-collapse: collapse; min-width: 220px;">
  <thead>
    <tr style="background: #f0f0f0;">
      <th style="padding: 4px 10px; border: 1px solid #ccc;">Horas de Estudo (X)</th>
      <th style="padding: 4px 10px; border: 1px solid #ccc;">Nota (Y)</th>
    </tr>
  </thead>
  <tbody>
    <tr><td style="border: 1px solid #ccc; text-align: right;">5</td><td style="border: 1px solid #ccc; text-align: right;">6</td></tr>
    <tr><td style="border: 1px solid #ccc; text-align: right;">7</td><td style="border: 1px solid #ccc; text-align: right;">7</td></tr>
    <tr><td style="border: 1px solid #ccc; text-align: right;">8</td><td style="border: 1px solid #ccc; text-align: right;">7.5</td></tr>
    <tr><td style="border: 1px solid #ccc; text-align: right;">10</td><td style="border: 1px solid #ccc; text-align: right;">8</td></tr>
    <tr><td style="border: 1px solid #ccc; text-align: right;">12</td><td style="border: 1px solid #ccc; text-align: right;">8.5</td></tr>
    <tr><td style="border: 1px solid #ccc; text-align: right;">15</td><td style="border: 1px solid #ccc; text-align: right;">9</td></tr>
    <tr><td style="border: 1px solid #ccc; text-align: right;">18</td><td style="border: 1px solid #ccc; text-align: right;">9.5</td></tr>
    <tr><td style="border: 1px solid #ccc; text-align: right;">20</td><td style="border: 1px solid #ccc; text-align: right;">10</td></tr>
  </tbody>
</table>

Total de observações: $$n = 8$$

### **1. Calcule as médias de X e Y**

$$
\bar{X} = \frac{5 + 7 + 8 + 10 + 12 + 15 + 18 + 20}{8} = \frac{95}{8} = 11,875
$$

$$
\bar{Y} = \frac{6 + 7 + 7,5 + 8 + 8,5 + 9 + 9,5 + 10}{8} = \frac{65,5}{8} = 8,1875
$$

### **2. Calcule as somas necessárias**

Vamos calcular $$\sum X_i$$, $$\sum Y_i$$, $$\sum X_i^2$$, $$\sum Y_i^2$$, $$\sum X_i Y_i$$:

<table style="margin: 1em auto; border-collapse: collapse; min-width: 350px;">
  <thead>
    <tr style="background: #f0f0f0;">
      <th style="padding: 4px 10px; border: 1px solid #ccc;">X<sub>i</sub></th>
      <th style="padding: 4px 10px; border: 1px solid #ccc;">Y<sub>i</sub></th>
      <th style="padding: 4px 10px; border: 1px solid #ccc;">X<sub>i</sub><sup>2</sup></th>
      <th style="padding: 4px 10px; border: 1px solid #ccc;">Y<sub>i</sub><sup>2</sup></th>
      <th style="padding: 4px 10px; border: 1px solid #ccc;">X<sub>i</sub>Y<sub>i</sub></th>
    </tr>
  </thead>
  <tbody>
    <tr><td style="border: 1px solid #ccc; text-align: right;">5</td><td style="border: 1px solid #ccc; text-align: right;">6</td><td style="border: 1px solid #ccc; text-align: right;">25</td><td style="border: 1px solid #ccc; text-align: right;">36</td><td style="border: 1px solid #ccc; text-align: right;">30</td></tr>
    <tr><td style="border: 1px solid #ccc; text-align: right;">7</td><td style="border: 1px solid #ccc; text-align: right;">7</td><td style="border: 1px solid #ccc; text-align: right;">49</td><td style="border: 1px solid #ccc; text-align: right;">49</td><td style="border: 1px solid #ccc; text-align: right;">49</td></tr>
    <tr><td style="border: 1px solid #ccc; text-align: right;">8</td><td style="border: 1px solid #ccc; text-align: right;">7.5</td><td style="border: 1px solid #ccc; text-align: right;">64</td><td style="border: 1px solid #ccc; text-align: right;">56.25</td><td style="border: 1px solid #ccc; text-align: right;">60</td></tr>
    <tr><td style="border: 1px solid #ccc; text-align: right;">10</td><td style="border: 1px solid #ccc; text-align: right;">8</td><td style="border: 1px solid #ccc; text-align: right;">100</td><td style="border: 1px solid #ccc; text-align: right;">64</td><td style="border: 1px solid #ccc; text-align: right;">80</td></tr>
    <tr><td style="border: 1px solid #ccc; text-align: right;">12</td><td style="border: 1px solid #ccc; text-align: right;">8.5</td><td style="border: 1px solid #ccc; text-align: right;">144</td><td style="border: 1px solid #ccc; text-align: right;">72.25</td><td style="border: 1px solid #ccc; text-align: right;">102</td></tr>
    <tr><td style="border: 1px solid #ccc; text-align: right;">15</td><td style="border: 1px solid #ccc; text-align: right;">9</td><td style="border: 1px solid #ccc; text-align: right;">225</td><td style="border: 1px solid #ccc; text-align: right;">81</td><td style="border: 1px solid #ccc; text-align: right;">135</td></tr>
    <tr><td style="border: 1px solid #ccc; text-align: right;">18</td><td style="border: 1px solid #ccc; text-align: right;">9.5</td><td style="border: 1px solid #ccc; text-align: right;">324</td><td style="border: 1px solid #ccc; text-align: right;">90.25</td><td style="border: 1px solid #ccc; text-align: right;">171</td></tr>
    <tr><td style="border: 1px solid #ccc; text-align: right;">20</td><td style="border: 1px solid #ccc; text-align: right;">10</td><td style="border: 1px solid #ccc; text-align: right;">400</td><td style="border: 1px solid #ccc; text-align: right;">100</td><td style="border: 1px solid #ccc; text-align: right;">200</td></tr>
    <tr style="background: #f0f0f0; font-weight: bold;"><td style="border: 1px solid #ccc; text-align: right;">95</td><td style="border: 1px solid #ccc; text-align: right;">40</td><td style="border: 1px solid #ccc; text-align: right;">1331</td><td style="border: 1px solid #ccc; text-align: right;">330</td><td style="border: 1px solid #ccc; text-align: right;">827</td></tr>
  </tbody>
</table>

$$\sum X_i = 95$$

$$\sum Y_i = 40$$

$$\sum X_i^2 = 1331$$

$$\sum Y_i^2 = 330$$

$$\sum X_i Y_i = 827$$

### **3. Calcule a variância de X e a covariância entre X e Y**

A fórmula para o coeficiente angular ($$b$$) é:

$$
b = \frac{\sum (X_i - \bar{X})(Y_i - \bar{Y})}{\sum (X_i - \bar{X})^2}
$$

Mas podemos usar a forma equivalente:

$$
b = \frac{\sum X_i Y_i - n \bar{X} \bar{Y}}{\sum X_i^2 - n \bar{X}^2}
$$

Calculando:

$$n \bar{X} \bar{Y} = 8 \times 11,875 \times 8,1875 = 8 \times 97,22265625 = 777,78125$$

$$n \bar{X}^2 = 8 \times (11,875)^2 = 8 \times 141,015625 = 1128,125$$

Agora:

$$\sum X_i Y_i - n \bar{X} \bar{Y} = 827 - 777,78125 = 49,21875$$

$$\sum X_i^2 - n \bar{X}^2 = 1331 - 1128,125 = 202,875$$

Portanto:

$$
b = \frac{49,21875}{202,875} \approx 0,24245
$$

### **4. Calcule o intercepto ($$a$$)**

$$
a = \bar{Y} - b \bar{X} = 8,1875 - 0,24245 \times 11,875 \approx 8,1875 - 2,8805 = 5,3070
$$

### **5. Equação da reta ajustada**

$$
\boxed{Y = 5,31 + 0,24 X}
$$

(Arredondando para duas casas decimais)

### **6. Previsão para 14 horas de estudo**

$$
Y = 5,31 + 0,24 \times 14 = 5,31 + 3,36 = 8,67
$$

(Usando mais casas decimais, $$Y = 5,30838 + 0,24245 \times 14 = 5,30838 + 3,3943 = 8,7027$$)

### **7. Interpretação**

- **Inclinação ($$b$$):** Cada hora adicional de estudo aumenta a nota esperada em aproximadamente 0,24 pontos.
- **Intercepto ($$a$$):** Nota esperada para quem não estuda ($$X=0$$) seria cerca de 5,31.
- **Previsão:** Para 14 horas de estudo, a nota prevista é aproximadamente 8,70.

---

<div id="regressao-linear-calc" style="max-width:600px;margin:2em auto;padding:1.5em 2em;background:#f8f8f8;border-radius:10px;box-shadow:0 2px 8px rgba(0,0,0,0.07);">
  <h3 style="text-align:center;margin-bottom:1em;">Calculadora de Regressão Linear</h3>
  <form id="rl-form-adicionar" style="display:flex;gap:0.5em;flex-wrap:wrap;justify-content:center;margin-bottom:1em;">
    <input id="rl-x" type="number" step="any" placeholder="X" required style="width:90px;padding:0.3em;">
    <input id="rl-y" type="number" step="any" placeholder="Y" required style="width:90px;padding:0.3em;">
    <button type="submit" style="padding:0.3em 1em;">Adicionar</button>
  </form>
  <table style="width:100%;margin-bottom:1em;border-collapse:collapse;">
    <thead>
      <tr style="background:#e0e0e0;"><th style="padding:4px 8px;">X</th><th style="padding:4px 8px;">Y</th><th></th></tr>
    </thead>
    <tbody id="rl-tabela-corpo"></tbody>
  </table>
  <div style="margin-bottom:1em;">
    <label for="rl-prev-x"><b>Prever Y para X =</b></label>
    <input id="rl-prev-x" type="number" step="any" style="width:90px;padding:0.3em;">
  </div>
  <div id="rl-resultado" style="background:#fff;border-radius:6px;padding:1em 1.2em;min-height:2.5em;font-size:1.08em;"></div>
  <div style="font-size:0.93em;color:#888;margin-top:1em;text-align:center;">Os dados iniciais são os mesmos do exemplo acima. Você pode adicionar, remover ou prever valores.</div>
</div>

<script src="{{ site.baseurl }}/assets/js/regressao-linear-calc.js"></script>

---

## Referências

1. Montgomery, D. C., & Peck, E. A. (2012). Introduction to Linear Regression Analysis.
2. Draper, N. R., & Smith, H. (1998). Applied Regression Analysis.
3. Triola, M. F. (2017). Introdução à Estatística.
