---
layout: page
title: Modelos Preditivos
lang: pt
ref: modelos-preditivos
parent: analise-de-dados
permalink: /pt/analise-de-dados/modelos-preditivos
order: 4
mathjax: true
description: "Modelos preditivos: treino e teste, EAM e REQM, sobreajuste, validação cruzada, regressão logística e matriz de confusão, com código em Julia, R e Python."
---

<img src="{{ site.baseurl }}/assets/images/sobreajuste_sorvete.png" alt="Gráfico de sorvetes vendidos contra a temperatura máxima: seis pontos azuis de treino, três losangos laranja de teste, uma reta cinza que passa perto de todos e uma curva vermelha tracejada de grau 5 que passa exatamente pelos pontos azuis e se afasta dos laranja" style="max-width: 760px; width: 100%; display: block; margin: 1em auto;">

<p style="text-align: center; font-size: 0.9em;"><strong>Figura 1.</strong> Dois modelos ajustados aos mesmos 6 dias de treino (pontos azuis) e avaliados em 3 dias novos (losangos laranja). A curva de grau 5 acerta o treino em cheio e erra mais nos dias novos do que a reta. Gerada pelo código em Python da seção 4.</p>

Um **modelo preditivo** é uma regra, ajustada a dados já observados, que dá um palpite para um valor ainda desconhecido: quantos sorvetes uma loja vai vender amanhã, dada a previsão de temperatura; se um carro tem câmbio manual, dado o seu peso. O que importa num modelo preditivo é **errar pouco em casos que ele ainda não viu**, e é isso que esta página ensina a medir.

O caminho é: o que é prever (seção 1), separar dados de treino e de teste (2), medir o erro (3), o sobreajuste (4), a validação cruzada (5), a classificação com regressão logística e matriz de confusão (6), outros modelos (7) e os cuidados (8). Os exemplos à mão usam números pequenos; os exemplos com dados reais usam a tabela `mtcars`, que vem com o R.

Todo código aparece em três linguagens, **Julia, R e Python**: escolha a sua no cabeçalho de qualquer bloco, e a escolha vale para a página inteira. As três versões fazem a mesma conta e dão os mesmos números.

---

## 1. Prever e Explicar

Os mesmos modelos (uma [regressão linear]({{ '/pt/analise-de-dados/regressao-linear' | relative_url }}), por exemplo) servem a dois objetivos diferentes:

- **explicar:** entender como a resposta se relaciona com cada variável. Interessam os coeficientes, os testes, as hipóteses do modelo;
- **prever:** acertar o valor da resposta em casos novos. Interessa o tamanho do erro nesses casos; um modelo difícil de interpretar serve, se prever bem.

Os problemas de previsão se dividem pelo tipo de resposta:

| Tipo | A resposta é | Exemplo | Seção |
|---|---|---|---|
| **Regressão** | um número | sorvetes vendidos num dia; consumo de um carro | 2 a 5 |
| **Classificação** | uma categoria | câmbio manual ou automático; e-mail é spam ou não | 6 |

As variáveis usadas para prever se chamam **preditoras** (ou variáveis explicativas); a que se quer prever é a **resposta**.

---

## 2. Treino e Teste

Um modelo sempre parece bom nos dados em que foi ajustado: ele foi escolhido justamente para passar perto deles. Para saber como ele se sai em casos novos, separa-se uma parte dos dados que **não** entra no ajuste:

- **conjunto de treino:** os dados usados para ajustar o modelo;
- **conjunto de teste:** os dados guardados, usados só para medir o erro de previsão.

### 2.1 Exemplo resolvido: vendas de sorvete

**Dados** (números ilustrativos): temperatura máxima ($x$, em °C) e sorvetes vendidos ($y$) por uma loja em 9 dias. Seis dias formam o treino, três ficam para o teste.

| | Dia | Temperatura $x$ (°C) | Vendas $y$ |
|---|---|---|---|
| **Treino** | 1 | 20 | 52 |
| | 2 | 22 | 57 |
| | 3 | 24 | 71 |
| | 4 | 26 | 81 |
| | 5 | 28 | 87 |
| | 6 | 30 | 102 |
| **Teste** | 7 | 21 | 58 |
| | 8 | 25 | 72 |
| | 9 | 29 | 99 |

**Modelo:** a reta de [mínimos quadrados]({{ '/pt/analise-de-dados/regressao-linear' | relative_url }}) $\hat{y} = a + b\,x$, ajustada **só com os 6 dias de treino**, com

$$
b = \frac{S_{xy}}{S_{xx}} = \frac{\sum (x_i - \bar{x})(y_i - \bar{y})}{\sum (x_i - \bar{x})^2}, \qquad a = \bar{y} - b\,\bar{x}.
$$

**Passo 1: médias do treino.**

$$
\bar{x} = \frac{20 + 22 + 24 + 26 + 28 + 30}{6} = \frac{150}{6} = 25
\qquad
\bar{y} = \frac{52 + 57 + 71 + 81 + 87 + 102}{6} = \frac{450}{6} = 75
$$

**Passo 2: desvios, produtos e quadrados.**

| Dia | $x - 25$ | $y - 75$ | $(x - 25)(y - 75)$ | $(x - 25)^2$ |
|---|---|---|---|---|
| 1 | −5 | −23 | 115 | 25 |
| 2 | −3 | −18 | 54 | 9 |
| 3 | −1 | −4 | 4 | 1 |
| 4 | 1 | 6 | 6 | 1 |
| 5 | 3 | 12 | 36 | 9 |
| 6 | 5 | 27 | 135 | 25 |
| **Soma** | 0 | 0 | $S\_{xy} = 350$ | $S\_{xx} = 70$ |

**Passo 3: coeficientes.**

$$
b = \frac{350}{70} = 5 \qquad a = 75 - 5 \times 25 = 75 - 125 = -50
$$

**Resultado:** $\hat{y} = -50 + 5\,x$. Cada grau a mais de temperatura máxima está associado, em média, a 5 sorvetes a mais vendidos (dentro da faixa observada, de 20 °C a 30 °C).

**Passo 4: previsões e erros no teste.** O erro de previsão é $e = y - \hat{y}$ (real menos previsto).

| Dia | $x$ | Previsão $\hat{y} = -50 + 5x$ | Real $y$ | Erro $e$ |
|---|---|---|---|---|
| 7 | 21 | $-50 + 105 = 55$ | 58 | 3 |
| 8 | 25 | $-50 + 125 = 75$ | 72 | −3 |
| 9 | 29 | $-50 + 145 = 95$ | 99 | 4 |

A reta errou por 3, 3 e 4 sorvetes nos dias novos. A próxima seção resume esses erros num número só.

---

## 3. Medindo o Erro

### 3.1 As medidas

Com $n$ previsões e erros $e\_i = y\_i - \hat{y}\_i$, as medidas mais usadas são as mesmas da página de [Séries Temporais]({{ '/pt/analise-de-dados/series-temporais' | relative_url }}):

$$
\text{EAM} = \frac{1}{n}\sum_{i=1}^{n} \lvert e_i \rvert
\qquad
\text{REQM} = \sqrt{\frac{1}{n}\sum_{i=1}^{n} e_i^2}
\qquad
\text{EPAM} = \frac{100\%}{n}\sum_{i=1}^{n} \left\lvert \frac{e_i}{y_i} \right\rvert
$$

- **EAM** (erro absoluto médio): o tamanho típico do erro, na unidade da resposta;
- **REQM** (raiz do erro quadrático médio): também na unidade da resposta, mas eleva os erros ao quadrado antes da média, então pesa mais os erros grandes. É sempre maior ou igual ao EAM;
- **EPAM** (erro percentual absoluto médio): o erro em porcentagem do valor real; não funciona quando algum valor real é zero ou perto de zero.

### 3.2 No exemplo

Com os erros 3, −3 e 4 do teste:

$$
\text{EAM} = \frac{\lvert 3 \rvert + \lvert -3 \rvert + \lvert 4 \rvert}{3} = \frac{10}{3} = 3{,}33 \text{ sorvetes}
$$

$$
\text{REQM} = \sqrt{\frac{3^2 + (-3)^2 + 4^2}{3}} = \sqrt{\frac{9 + 9 + 16}{3}} = \sqrt{\frac{34}{3}} = \sqrt{11{,}333} = 3{,}37 \text{ sorvetes}
$$

$$
\text{EPAM} = \frac{100\%}{3}\left(\frac{3}{58} + \frac{3}{72} + \frac{4}{99}\right) = \frac{5{,}17\% + 4{,}17\% + 4{,}04\%}{3} = 4{,}46\%
$$

**Interpretação:** nos dias que não entraram no ajuste, a reta erra em média 3,33 sorvetes, cerca de 4,46% das vendas.

### 3.3 Compare com uma linha de base

Um erro só é "pequeno" ou "grande" em comparação com alguma coisa. A comparação mínima é com uma **linha de base** simples: prever **sempre a média do treino** (75 sorvetes), sem olhar a temperatura. Entre todas as previsões constantes, a média é a que torna mínima a soma dos erros ao quadrado no treino, por isso é a escolha natural.

| Dia | Real $y$ | Previsão (média) | Erro |
|---|---|---|---|
| 7 | 58 | 75 | −17 |
| 8 | 72 | 75 | −3 |
| 9 | 99 | 75 | 24 |

$$
\text{EAM} = \frac{17 + 3 + 24}{3} = \frac{44}{3} = 14{,}67
\qquad
\text{REQM} = \sqrt{\frac{289 + 9 + 576}{3}} = \sqrt{\frac{874}{3}} = \sqrt{291{,}33} = 17{,}07
$$

e EPAM de 19,24%. A reta reduz o erro típico de 14,67 para 3,33 sorvetes: a temperatura ajuda muito a prever. Um modelo que não bate a linha de base não serve para prever, por mais sofisticado que seja.

### 3.4 Erro no treino × erro no teste

No próprio treino, os erros da reta são 2, −3, 1, 1, −3 e 2 (por exemplo, dia 1: $52 - (-50 + 5 \times 20) = 52 - 50 = 2$), e

$$
\text{REQM}_{\text{treino}} = \sqrt{\frac{4 + 9 + 1 + 1 + 9 + 4}{6}} = \sqrt{\frac{28}{6}} = \sqrt{4{,}667} = 2{,}16.
$$

O erro no treino (2,16) é menor que no teste (3,37). Isso é o esperado: o erro no treino é **otimista**, porque o modelo foi ajustado para aqueles mesmos pontos. Quem relata só o erro no treino superestima a qualidade do modelo.

---

## 4. Sobreajuste

Um modelo mais flexível sempre consegue passar mais perto dos pontos de treino. Com 6 pontos, um polinômio de grau 5 (6 coeficientes) passa **exatamente** por todos eles: erro de treino zero. Mas ele usa essa liberdade para seguir também o ruído, os altos e baixos que não se repetem em dias novos.

| | REQM no treino | REQM no teste | Previsões para os dias 7, 8 e 9 |
|---|---|---|---|
| Reta (grau 1) | 2,16 | **3,37** | 55; 75; 95 |
| Polinômio de grau 5 | 0 | 5,96 | 52,05; 76,80; 92,05 |

(valores do código abaixo). O polinômio acerta o treino em cheio e erra mais nos dias novos (Figura 1). Esse é o **sobreajuste** (*overfitting*): erro pequeno no treino e grande no teste, porque o modelo aprendeu padrões que são só acaso dos dados de treino (James et al., 2021, p. 32). À medida que o modelo fica mais flexível, o erro no treino só cai, mas o erro em dados novos cai até certo ponto e depois volta a subir.

<div class="code-tabs">
  <div class="code-tab" data-lang="julia">
<div class="code-container">
  <div class="code-header">
    <div class="code-lang">Julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Statistics, Plots

# Temperatura máxima (°C) e sorvetes vendidos por dia (números ilustrativos)
temp_treino   = [20, 22, 24, 26, 28, 30];  vendas_treino = [52, 57, 71, 81, 87, 102]
temp_teste    = [21, 25, 29];              vendas_teste  = [58, 72, 99]

# Reta de mínimos quadrados ajustada SÓ com os dias de treino
b = sum((temp_treino .- mean(temp_treino)) .* (vendas_treino .- mean(vendas_treino))) /
    sum((temp_treino .- mean(temp_treino)) .^ 2)
a = mean(vendas_treino) - b * mean(temp_treino)
println("Reta: vendas = ", a, " + ", b, " × temperatura")

# Medidas de erro: EAM, REQM e EPAM
eam(e) = mean(abs.(e))
reqm(e) = sqrt(mean(e .^ 2))
epam(e, y) = 100 * mean(abs.(e ./ y))

erro_teste = vendas_teste .- (a .+ b .* temp_teste)
erro_base = vendas_teste .- mean(vendas_treino)       # linha de base: prever sempre a média do treino
println("Previsões no teste: ", a .+ b .* temp_teste, "   erros: ", erro_teste)
println("Reta  — EAM = ", round(eam(erro_teste), digits = 4), "   REQM = ", round(reqm(erro_teste), digits = 4),
        "   EPAM = ", round(epam(erro_teste, vendas_teste), digits = 2), "%")
println("Média — EAM = ", round(eam(erro_base), digits = 4), "   REQM = ", round(reqm(erro_base), digits = 4),
        "   EPAM = ", round(epam(erro_base, vendas_teste), digits = 2), "%")
println("REQM da reta no próprio treino: ", round(reqm(vendas_treino .- (a .+ b .* temp_treino)), digits = 4))

# Polinômio de grau 5: passa exatamente pelos 6 pontos de treino
# (x centrado em 25 para a conta numérica ficar estável)
X(t) = hcat([(t .- 25.0) .^ k for k in 0:5]...)
coef5 = X(temp_treino) \ vendas_treino
println("Grau 5 — REQM no treino = ", round(reqm(vendas_treino .- X(temp_treino) * coef5), digits = 4),
        "   previsões no teste = ", round.(X(temp_teste) * coef5, digits = 4),
        "   REQM no teste = ", round(reqm(vendas_teste .- X(temp_teste) * coef5), digits = 4))

# Gráfico: treino, teste, reta e polinômio de grau 5
grade = range(19.5, 30.5, length = 200)
p = scatter(temp_treino, vendas_treino, label = "Treino", color = :royalblue, markersize = 6,
            xlabel = "Temperatura máxima (°C)", ylabel = "Sorvetes vendidos",
            title = "Reta × polinômio de grau 5", legend = :topleft, size = (760, 460))
scatter!(p, temp_teste, vendas_teste, label = "Teste", color = :darkorange, markershape = :diamond, markersize = 7)
plot!(p, grade, a .+ b .* grade, label = "Reta (grau 1)", color = :gray30, lw = 2)
plot!(p, grade, X(collect(grade)) * coef5, label = "Polinômio de grau 5", color = :crimson, lw = 2, ls = :dash)
savefig(p, "sobreajuste_sorvete_jl.png")</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">Reta: vendas = -50.0 + 5.0 × temperatura
Previsões no teste: [55.0, 75.0, 95.0]   erros: [3.0, -3.0, 4.0]
Reta  — EAM = 3.3333   REQM = 3.3665   EPAM = 4.46%
Média — EAM = 14.6667   REQM = 17.0685   EPAM = 19.24%
REQM da reta no próprio treino: 2.1602
Grau 5 — REQM no treino = 0.0   previsões no teste = [52.0547, 76.8047, 92.0547]   REQM no teste = 5.9629</pre>
</div>
  </div>
  <div class="code-tab" data-lang="r">
<div class="code-container">
  <div class="code-header">
    <div class="code-lang">R</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code># Temperatura máxima (°C) e sorvetes vendidos por dia (números ilustrativos)
treino &lt;- data.frame(temp = c(20, 22, 24, 26, 28, 30), vendas = c(52, 57, 71, 81, 87, 102))
teste  &lt;- data.frame(temp = c(21, 25, 29),             vendas = c(58, 72, 99))

# Reta de mínimos quadrados ajustada SÓ com os dias de treino
reta &lt;- lm(vendas ~ temp, data = treino)
cat("Reta: vendas =", coef(reta)[1], "+", coef(reta)[2], "× temperatura\n")

# Medidas de erro: EAM, REQM e EPAM
eam  &lt;- function(e) mean(abs(e))
reqm &lt;- function(e) sqrt(mean(e^2))
epam &lt;- function(e, y) 100 * mean(abs(e / y))

previsao &lt;- predict(reta, teste)
erro_teste &lt;- teste$vendas - previsao
erro_base  &lt;- teste$vendas - mean(treino$vendas)     # linha de base: prever sempre a média do treino
cat("Previsões no teste:", previsao, "  erros:", erro_teste, "\n")
cat("Reta  — EAM =", round(eam(erro_teste), 4), "  REQM =", round(reqm(erro_teste), 4),
    "  EPAM =", round(epam(erro_teste, teste$vendas), 2), "%\n")
cat("Média — EAM =", round(eam(erro_base), 4), "  REQM =", round(reqm(erro_base), 4),
    "  EPAM =", round(epam(erro_base, teste$vendas), 2), "%\n")
cat("REQM da reta no próprio treino:", round(reqm(residuals(reta)), 4), "\n")

# Polinômio de grau 5: passa exatamente pelos 6 pontos de treino
# (x centrado em 25 para a conta numérica ficar estável)
grau5 &lt;- lm(vendas ~ poly(I(temp - 25), 5, raw = TRUE), data = treino)
prev5 &lt;- predict(grau5, teste)
cat("Grau 5 — REQM no treino =", round(reqm(residuals(grau5)), 4),
    "  previsões no teste =", round(prev5, 4),
    "  REQM no teste =", round(reqm(teste$vendas - prev5), 4), "\n")

# Gráfico: treino, teste, reta e polinômio de grau 5
grade &lt;- data.frame(temp = seq(19.5, 30.5, length.out = 200))
png("sobreajuste_sorvete_r.png", width = 760, height = 460)
plot(treino$temp, treino$vendas, pch = 19, col = "royalblue", cex = 1.4, ylim = c(40, 110),
     xlab = "Temperatura máxima (°C)", ylab = "Sorvetes vendidos", main = "Reta × polinômio de grau 5")
points(teste$temp, teste$vendas, pch = 18, col = "darkorange", cex = 2)
lines(grade$temp, predict(reta, grade), col = "gray30", lwd = 2)
lines(grade$temp, predict(grau5, grade), col = "red3", lwd = 2, lty = 2)
legend("topleft", c("Treino", "Teste", "Reta (grau 1)", "Polinômio de grau 5"),
       col = c("royalblue", "darkorange", "gray30", "red3"), pch = c(19, 18, NA, NA), lty = c(NA, NA, 1, 2), lwd = 2)
invisible(dev.off())</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">Reta: vendas = -50 + 5 × temperatura
Previsões no teste: 55 75 95   erros: 3 -3 4 
Reta  — EAM = 3.3333   REQM = 3.3665   EPAM = 4.46 %
Média — EAM = 14.6667   REQM = 17.0685   EPAM = 19.24 %
REQM da reta no próprio treino: 2.1602 
Grau 5 — REQM no treino = 0   previsões no teste = 52.0547 76.8047 92.0547   REQM no teste = 5.9629</pre>
</div>
  </div>
  <div class="code-tab" data-lang="python">
<div class="code-container">
  <div class="code-header">
    <div class="code-lang">Python</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>import numpy as np
import matplotlib.pyplot as plt

# Temperatura máxima (°C) e sorvetes vendidos por dia (números ilustrativos)
temp_treino = np.array([20, 22, 24, 26, 28, 30]); vendas_treino = np.array([52, 57, 71, 81, 87, 102])
temp_teste  = np.array([21, 25, 29]);             vendas_teste  = np.array([58, 72, 99])

# Reta de mínimos quadrados ajustada SÓ com os dias de treino
b, a = np.polyfit(temp_treino, vendas_treino, 1)
print(f"Reta: vendas = {a:.4f} + {b:.4f} × temperatura")

# Medidas de erro: EAM, REQM e EPAM
eam  = lambda e: np.mean(np.abs(e))
reqm = lambda e: np.sqrt(np.mean(e**2))
epam = lambda e, y: 100 * np.mean(np.abs(e / y))

previsao = a + b * temp_teste
erro_teste = vendas_teste - previsao
erro_base = vendas_teste - vendas_treino.mean()     # linha de base: prever sempre a média do treino
print("Previsões no teste:", previsao.round(4), "  erros:", erro_teste.round(4))
print(f"Reta  — EAM = {eam(erro_teste):.4f}   REQM = {reqm(erro_teste):.4f}   EPAM = {epam(erro_teste, vendas_teste):.2f}%")
print(f"Média — EAM = {eam(erro_base):.4f}   REQM = {reqm(erro_base):.4f}   EPAM = {epam(erro_base, vendas_teste):.2f}%")
print(f"REQM da reta no próprio treino: {reqm(vendas_treino - (a + b * temp_treino)):.4f}")

# Polinômio de grau 5: passa exatamente pelos 6 pontos de treino
# (x centrado em 25 para a conta numérica ficar estável)
coef5 = np.polyfit(temp_treino - 25, vendas_treino, 5)
prev5 = np.polyval(coef5, temp_teste - 25)
print(f"Grau 5 — REQM no treino = {reqm(vendas_treino - np.polyval(coef5, temp_treino - 25)):.4f}"
      f"   previsões no teste = {prev5.round(4)}   REQM no teste = {reqm(vendas_teste - prev5):.4f}")

# Gráfico: treino, teste, reta e polinômio de grau 5
grade = np.linspace(19.5, 30.5, 200)
fig, ax = plt.subplots(figsize=(7.6, 4.6))
ax.scatter(temp_treino, vendas_treino, s=55, color="royalblue", label="Treino", zorder=3)
ax.scatter(temp_teste, vendas_teste, s=75, marker="D", color="darkorange", label="Teste", zorder=3)
ax.plot(grade, a + b * grade, color="0.3", lw=2, label="Reta (grau 1)")
ax.plot(grade, np.polyval(coef5, grade - 25), color="crimson", lw=2, ls="--", label="Polinômio de grau 5")
ax.set_xlabel("Temperatura máxima (°C)"); ax.set_ylabel("Sorvetes vendidos")
ax.set_title("Reta × polinômio de grau 5"); ax.legend(loc="upper left")
fig.tight_layout(); fig.savefig("sobreajuste_sorvete.png", dpi=100)</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">Reta: vendas = -50.0000 + 5.0000 × temperatura
Previsões no teste: [55. 75. 95.]   erros: [ 3. -3.  4.]
Reta  — EAM = 3.3333   REQM = 3.3665   EPAM = 4.46%
Média — EAM = 14.6667   REQM = 17.0685   EPAM = 19.24%
REQM da reta no próprio treino: 2.1602
Grau 5 — REQM no treino = 0.0000   previsões no teste = [52.0547 76.8047 92.0547]   REQM no teste = 5.9629</pre>
</div>
  </div>
</div>

---

## 5. Validação Cruzada

### 5.1 A ideia

Separar treino e teste uma vez só tem dois problemas: com poucos dados, o resultado depende muito de **quais** casos caíram no teste, e os dados do teste deixam de ser usados no ajuste. A **validação cruzada com $k$ partes** (*k-fold cross-validation*) resolve as duas coisas (James et al., 2021, p. 203):

1. divida os dados em $k$ partes de tamanhos parecidos;
2. ajuste o modelo com $k - 1$ partes e calcule os erros de previsão na parte que ficou de fora;
3. repita, deixando de fora cada parte uma vez;
4. junte os erros das $k$ rodadas numa medida só (aqui, a REQM de todos os erros).

Cada caso é previsto exatamente uma vez, por um modelo que não o viu. Na prática se usa $k = 5$ ou $k = 10$ (James et al., 2021, p. 203). A validação cruzada serve também para **comparar** modelos e escolher entre eles.

As partes costumam ser sorteadas. Nos códigos abaixo elas são fixas, para que as três linguagens deem os mesmos números: o carro na posição $i$ da tabela vai para a parte $((i - 1) \bmod 5) + 1$, ou seja, os carros 1, 6, 11, … formam a parte 1, os carros 2, 7, 12, … a parte 2, e assim por diante.

### 5.2 Exemplo com dados reais: consumo × peso dos carros

A tabela **mtcars** traz dados de 32 modelos de carro de 1973–74, publicados pela revista *Motor Trend* e analisados por Henderson e Velleman (1981). Usamos duas colunas: o consumo, em milhas por galão (mpg; 1 mpg ≈ 0,425 km/L), e o peso, em milhares de libras (1.000 libras ≈ 454 kg).

O código ajusta polinômios de grau 0 a 4 no peso (grau 0 é prever sempre a média; grau 1 é a reta) e compara o erro no treino com o da validação cruzada de 5 partes:

| Grau | REQM no treino (mpg) | REQM na validação cruzada (mpg) |
|---|---|---|
| 0 (média) | 5,932 | 6,092 |
| 1 (reta) | 2,949 | 3,174 |
| 2 | 2,523 | **2,718** |
| 3 | 2,523 | 2,889 |
| 4 | 2,503 | 2,906 |

**Interpretação:**

- O erro **no treino** só diminui com o grau (de 5,932 até 2,503): pelo treino, o grau 4 pareceria o melhor.
- O erro **na validação cruzada** é menor no grau 2 (2,718 mpg, cerca de 1,16 km/L) e volta a subir nos graus 3 e 4: a curvatura extra desses graus segue o ruído dos dados.
- Pelo critério da validação cruzada, o modelo escolhido é o de grau 2. A diferença entre os graus 2, 3 e 4 é pequena com só 32 carros; outra divisão em partes poderia mudar a ordem entre eles. A diferença para a média (6,092) e para a reta (3,174) é clara.
- O erro do grau 0 no treino, 5,932, é o desvio padrão do consumo calculado com divisor $n$, porque a previsão é a própria média.

<div class="code-tabs">
  <div class="code-tab" data-lang="julia">
<div class="code-container">
  <div class="code-header">
    <div class="code-lang">Julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>using RDatasets, Statistics

# Dados mtcars (Henderson e Velleman, 1981): 32 carros de 1973–74
# MPG = milhas por galão (consumo); WT = peso, em milhares de libras
carros = dataset("datasets", "mtcars")
n = nrow(carros)

# 5 partes fixas: o carro i vai para a parte ((i − 1) mod 5) + 1, na ordem da tabela
parte = [(i - 1) % 5 + 1 for i in 1:n]

# Polinômio de grau g no peso (grau 0 = prever sempre a média)
matriz(peso, g) = hcat([peso .^ k for k in 0:g]...)
reqm(e) = sqrt(mean(e .^ 2))

println("grau   REQM no treino   REQM na validação cruzada")
for g in 0:4
    # Erro no treino: ajusta e avalia com os mesmos 32 carros
    coef_todos = matriz(carros.WT, g) \ carros.MPG
    erro_treino = carros.MPG .- matriz(carros.WT, g) * coef_todos
    # Validação cruzada: cada parte é prevista por um modelo que não a viu
    erros_cv = Float64[]
    for k in 1:5
        treino, teste = carros[parte .!= k, :], carros[parte .== k, :]
        coef = matriz(treino.WT, g) \ treino.MPG
        append!(erros_cv, teste.MPG .- matriz(teste.WT, g) * coef)
    end
    println(g, "      ", round(reqm(erro_treino), digits = 4), "           ", round(reqm(erros_cv), digits = 4))
end</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">grau   REQM no treino   REQM na validação cruzada
0      5.932           6.0922
1      2.9492           3.1742
2      2.5233           2.7181
3      2.5228           2.8887
4      2.5029           2.9059</pre>
</div>
  </div>
  <div class="code-tab" data-lang="r">
<div class="code-container">
  <div class="code-header">
    <div class="code-lang">R</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code># Dados mtcars (Henderson e Velleman, 1981): 32 carros de 1973–74
# mpg = milhas por galão (consumo); wt = peso, em milhares de libras
carros &lt;- mtcars
n &lt;- nrow(carros)

# 5 partes fixas: o carro i vai para a parte ((i − 1) mod 5) + 1, na ordem da tabela
parte &lt;- (seq_len(n) - 1) %% 5 + 1

reqm &lt;- function(e) sqrt(mean(e^2))
# Polinômio de grau g no peso (grau 0 = prever sempre a média)
formula_grau &lt;- function(g) if (g == 0) mpg ~ 1 else mpg ~ poly(wt, g, raw = TRUE)

cat("grau   REQM no treino   REQM na validação cruzada\n")
for (g in 0:4) {
  # Erro no treino: ajusta e avalia com os mesmos 32 carros
  erro_treino &lt;- residuals(lm(formula_grau(g), data = carros))
  # Validação cruzada: cada parte é prevista por um modelo que não a viu
  erros_cv &lt;- c()
  for (k in 1:5) {
    modelo &lt;- lm(formula_grau(g), data = carros[parte != k, ])
    teste &lt;- carros[parte == k, ]
    erros_cv &lt;- c(erros_cv, teste$mpg - predict(modelo, teste))
  }
  cat(g, "     ", round(reqm(erro_treino), 4), "          ", round(reqm(erros_cv), 4), "\n")
}</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">grau   REQM no treino   REQM na validação cruzada
0       5.932            6.0922 
1       2.9492            3.1742 
2       2.5233            2.7181 
3       2.5228            2.8887 
4       2.5029            2.9059</pre>
</div>
  </div>
  <div class="code-tab" data-lang="python">
<div class="code-container">
  <div class="code-header">
    <div class="code-lang">Python</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>import numpy as np
import statsmodels.api as sm

# Dados mtcars (Henderson e Velleman, 1981): 32 carros de 1973–74
# (cópia dos dados do R, baixada do repositório Rdatasets)
# mpg = milhas por galão (consumo); wt = peso, em milhares de libras
carros = sm.datasets.get_rdataset("mtcars").data
peso, consumo = carros["wt"].to_numpy(), carros["mpg"].to_numpy()
n = len(carros)

# 5 partes fixas: o carro i vai para a parte ((i − 1) mod 5) + 1, na ordem da tabela
parte = np.arange(n) % 5 + 1

reqm = lambda e: np.sqrt(np.mean(e**2))

print("grau   REQM no treino   REQM na validação cruzada")
for g in range(5):
    # Polinômio de grau g no peso (grau 0 = prever sempre a média)
    # Erro no treino: ajusta e avalia com os mesmos 32 carros
    erro_treino = consumo - np.polyval(np.polyfit(peso, consumo, g), peso)
    # Validação cruzada: cada parte é prevista por um modelo que não a viu
    erros_cv = []
    for k in range(1, 6):
        treino, teste = parte != k, parte == k
        coef = np.polyfit(peso[treino], consumo[treino], g)
        erros_cv.extend(consumo[teste] - np.polyval(coef, peso[teste]))
    print(f"{g}      {reqm(erro_treino):.4f}           {reqm(np.array(erros_cv)):.4f}")</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">grau   REQM no treino   REQM na validação cruzada
0      5.9320           6.0922
1      2.9492           3.1742
2      2.5233           2.7181
3      2.5228           2.8887
4      2.5029           2.9059</pre>
</div>
  </div>
</div>

---

## 6. Classificação

### 6.1 Regressão logística

Quando a resposta é sim/não (1/0), o modelo deve dar uma **probabilidade**, um número entre 0 e 1. A reta comum não serve, porque pode passar de 1 ou ficar negativa para valores extremos da preditora (James et al., 2021, p. 134). A **regressão logística** usa a função logística:

$$
p(x) = P(Y = 1 \mid x) = \frac{1}{1 + e^{-(\beta_0 + \beta_1 x)}}
$$

- $p(x)$: probabilidade de a resposta ser 1 quando a preditora vale $x$;
- $\beta\_0$, $\beta\_1$: coeficientes, estimados por **máxima verossimilhança** (os valores que tornam os dados observados mais prováveis), e não por mínimos quadrados;
- $e$: a base dos logaritmos naturais (2,71828…).

Para qualquer valor de $\beta\_0 + \beta\_1 x$, o resultado fica estritamente entre 0 e 1. E o logaritmo da **chance**, $\ln\big(p/(1-p)\big)$, é exatamente $\beta\_0 + \beta\_1 x$: o modelo é uma reta na escala do log da chance.

**Exemplo com dados reais.** Na tabela mtcars, a coluna `am` indica o câmbio (1 = manual, 0 = automático); 13 dos 32 carros são manuais. Ajustando a regressão logística do câmbio no peso com os 32 carros (código abaixo):

$$
b_0 = 12{,}0404 \qquad b_1 = -4{,}0240
$$

O sinal negativo de $b\_1$ diz que carros mais pesados têm menor probabilidade de ser manuais.

**Probabilidade para um carro de 3 mil libras** (cerca de 1.360 kg):

$$
b_0 + b_1 \times 3 = 12{,}0404 - 4{,}0240 \times 3 = 12{,}0404 - 12{,}0719 = -0{,}0315
$$

$$
p = \frac{1}{1 + e^{0{,}0315}} = \frac{1}{1 + 1{,}0320} = \frac{1}{2{,}0320} = 0{,}4921
$$

(com os coeficientes completos; as quatro casas acima são arredondamentos). Um carro desse peso tem probabilidade de 49,21% de ter câmbio manual: praticamente meio a meio.

**Leitura de $b\_1$:** cada mil libras a mais multiplicam a chance de câmbio manual por $e^{-4{,}0240} = 0{,}0179$, isto é, dividem a chance por cerca de 56. Atenção: isso vale para a **chance** $p/(1-p)$, não para a probabilidade $p$, e descreve uma associação nestes 32 carros de 1973–74, não um efeito do peso sobre a escolha do câmbio.

### 6.2 Limiar e matriz de confusão

Para transformar a probabilidade em decisão, escolhe-se um **limiar**: aqui, classificar como manual quando $p \geq 0{,}5$. A **matriz de confusão** conta os quatro resultados possíveis (James et al., 2021, p. 152):

| | Real: manual (positivo) | Real: automático (negativo) |
|---|---|---|
| **Previsto: manual** | VP: verdadeiro positivo | FP: falso positivo |
| **Previsto: automático** | FN: falso negativo | VN: verdadeiro negativo |

Como na regressão, a matriz deve vir de casos que o modelo não viu. Com a validação cruzada de 5 partes da seção 5 (cada carro classificado por um modelo ajustado sem ele), o resultado é:

| | Real: manual | Real: automático | Total |
|---|---|---|---|
| **Previsto: manual** | VP = 11 | FP = 1 | 12 |
| **Previsto: automático** | FN = 2 | VN = 18 | 20 |
| **Total** | 13 | 19 | 32 |

### 6.3 Medidas de desempenho

Os nomes seguem James et al. (2021, p. 152), que lista os sinônimos usados em cada área.

**Acurácia**, a fração de acertos:

$$
\text{acurácia} = \frac{VP + VN}{n} = \frac{11 + 18}{32} = \frac{29}{32} = 0{,}90625
$$

(O código mostra 0,9062: é 29/32 = 0,90625 arredondado para quatro casas, com o 5 final arredondado para o par.) Sozinha, a acurácia engana quando uma classe é muito mais comum. A linha de base aqui é prever sempre "automático", a classe mais comum: acerta $19/32 = 0{,}59375$. O modelo (90,6%) bate essa linha de base com folga.

**Sensibilidade** (ou *recall*, ou taxa de verdadeiros positivos), a fração dos positivos reais que o modelo encontra:

$$
\text{sensibilidade} = \frac{VP}{VP + FN} = \frac{11}{11 + 2} = \frac{11}{13} = 0{,}8462
$$

**Especificidade**, a fração dos negativos reais que o modelo reconhece como negativos:

$$
\text{especificidade} = \frac{VN}{VN + FP} = \frac{18}{18 + 1} = \frac{18}{19} = 0{,}9474
$$

**Precisão** (ou valor preditivo positivo), a fração dos casos apontados como positivos que são de fato positivos:

$$
\text{precisão} = \frac{VP}{VP + FP} = \frac{11}{11 + 1} = \frac{11}{12} = 0{,}9167
$$

**F1**, a média harmônica da precisão e da sensibilidade, que só é alta quando as duas são:

$$
F_1 = \frac{2 \times \text{precisão} \times \text{sensibilidade}}{\text{precisão} + \text{sensibilidade}} = \frac{2 \times 0{,}9167 \times 0{,}8462}{0{,}9167 + 0{,}8462} = 0{,}88
$$

ou, direto das contagens,

$$
F_1 = \frac{2\,VP}{2\,VP + FP + FN} = \frac{22}{22 + 1 + 2} = \frac{22}{25} = 0{,}88
$$

**Interpretação:** dos 13 carros manuais, o modelo encontrou 11; dos 12 que ele apontou como manuais, 11 eram. Os erros foram 2 manuais tomados por automáticos e 1 automático tomado por manual.

Atenção à palavra **precisão**: aqui ela é um termo técnico (a fração de acertos entre os apontados como positivos), diferente do sentido comum de "exatidão".

### 6.4 O limiar é uma escolha

O limiar de 0,5 não é obrigatório. Baixar o limiar faz o modelo apontar mais casos como positivos: a sensibilidade sobe ou fica igual, e a especificidade cai ou fica igual. Subir o limiar faz o contrário. A escolha depende do custo de cada tipo de erro: quando deixar passar um positivo é grave, usa-se um limiar mais baixo; quando um alarme falso é caro, um mais alto.

<div class="code-tabs">
  <div class="code-tab" data-lang="julia">
<div class="code-container">
  <div class="code-header">
    <div class="code-lang">Julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>using RDatasets, GLM, DataFrames, Statistics

# mtcars: AM = câmbio (1 = manual, 0 = automático); WT = peso, em milhares de libras
carros = dataset("datasets", "mtcars")
n = nrow(carros)

# Regressão logística com todos os 32 carros: P(manual) = 1 / (1 + exp(−(b0 + b1·peso)))
modelo = glm(@formula(AM ~ WT), carros, Binomial(), LogitLink())
b0, b1 = coef(modelo)
println("b0 = ", round(b0, digits = 4), "   b1 = ", round(b1, digits = 4))
println("P(manual | peso = 3) = ", round(1 / (1 + exp(-(b0 + b1 * 3))), digits = 4))

# Matriz de confusão com validação cruzada (as mesmas 5 partes fixas) e limiar 0,5
parte = [(i - 1) % 5 + 1 for i in 1:n]
previsto = zeros(Int, n)
for k in 1:5
    m = glm(@formula(AM ~ WT), carros[parte .!= k, :], Binomial(), LogitLink())
    previsto[parte .== k] = Int.(predict(m, carros[parte .== k, :]) .&gt;= 0.5)
end
real = carros.AM
VP = sum((previsto .== 1) .&amp; (real .== 1)); FN = sum((previsto .== 0) .&amp; (real .== 1))
FP = sum((previsto .== 1) .&amp; (real .== 0)); VN = sum((previsto .== 0) .&amp; (real .== 0))
println("VP = $VP   FN = $FN   FP = $FP   VN = $VN")

acuracia = (VP + VN) / n
precisao = VP / (VP + FP)
sensibilidade = VP / (VP + FN)
especificidade = VN / (VN + FP)
F1 = 2 * precisao * sensibilidade / (precisao + sensibilidade)
println("acurácia = ", round(acuracia, digits = 4), "   precisão = ", round(precisao, digits = 4),
        "   sensibilidade = ", round(sensibilidade, digits = 4),
        "   especificidade = ", round(especificidade, digits = 4), "   F1 = ", round(F1, digits = 4))
println("Acurácia de prever sempre 'automático': ", round(mean(real .== 0), digits = 4))</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">b0 = 12.0404   b1 = -4.024
P(manual | peso = 3) = 0.4921
VP = 11   FN = 2   FP = 1   VN = 18
acurácia = 0.9062   precisão = 0.9167   sensibilidade = 0.8462   especificidade = 0.9474   F1 = 0.88
Acurácia de prever sempre 'automático': 0.5938</pre>
</div>
  </div>
  <div class="code-tab" data-lang="r">
<div class="code-container">
  <div class="code-header">
    <div class="code-lang">R</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code># mtcars: am = câmbio (1 = manual, 0 = automático); wt = peso, em milhares de libras
carros &lt;- mtcars
n &lt;- nrow(carros)

# Regressão logística com todos os 32 carros: P(manual) = 1 / (1 + exp(−(b0 + b1·peso)))
modelo &lt;- glm(am ~ wt, data = carros, family = binomial)
b &lt;- coef(modelo)
cat("b0 =", round(b[1], 4), "  b1 =", round(b[2], 4), "\n")
cat("P(manual | peso = 3) =", round(plogis(b[1] + b[2] * 3), 4), "\n")

# Matriz de confusão com validação cruzada (as mesmas 5 partes fixas) e limiar 0,5
parte &lt;- (seq_len(n) - 1) %% 5 + 1
previsto &lt;- integer(n)
for (k in 1:5) {
  m &lt;- glm(am ~ wt, data = carros[parte != k, ], family = binomial)
  previsto[parte == k] &lt;- as.integer(predict(m, carros[parte == k, ], type = "response") &gt;= 0.5)
}
real &lt;- carros$am
VP &lt;- sum(previsto == 1 &amp; real == 1); FN &lt;- sum(previsto == 0 &amp; real == 1)
FP &lt;- sum(previsto == 1 &amp; real == 0); VN &lt;- sum(previsto == 0 &amp; real == 0)
cat("VP =", VP, "  FN =", FN, "  FP =", FP, "  VN =", VN, "\n")

acuracia &lt;- (VP + VN) / n
precisao &lt;- VP / (VP + FP)
sensibilidade &lt;- VP / (VP + FN)
especificidade &lt;- VN / (VN + FP)
F1 &lt;- 2 * precisao * sensibilidade / (precisao + sensibilidade)
cat("acurácia =", round(acuracia, 4), "  precisão =", round(precisao, 4),
    "  sensibilidade =", round(sensibilidade, 4), "  especificidade =", round(especificidade, 4),
    "  F1 =", round(F1, 4), "\n")
cat("Acurácia de prever sempre 'automático':", round(mean(real == 0), 4), "\n")</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">b0 = 12.0404   b1 = -4.024 
P(manual | peso = 3) = 0.4921 
VP = 11   FN = 2   FP = 1   VN = 18 
acurácia = 0.9062   precisão = 0.9167   sensibilidade = 0.8462   especificidade = 0.9474   F1 = 0.88 
Acurácia de prever sempre 'automático': 0.5938</pre>
</div>
  </div>
  <div class="code-tab" data-lang="python">
<div class="code-container">
  <div class="code-header">
    <div class="code-lang">Python</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>import numpy as np
import statsmodels.api as sm
import statsmodels.formula.api as smf

# mtcars: am = câmbio (1 = manual, 0 = automático); wt = peso, em milhares de libras
carros = sm.datasets.get_rdataset("mtcars").data.reset_index(drop=True)
n = len(carros)

# Regressão logística com todos os 32 carros: P(manual) = 1 / (1 + exp(−(b0 + b1·peso)))
modelo = smf.logit("am ~ wt", data=carros).fit(disp=0)
b0, b1 = modelo.params
print(f"b0 = {b0:.4f}   b1 = {b1:.4f}")
print(f"P(manual | peso = 3) = {1 / (1 + np.exp(-(b0 + b1 * 3))):.4f}")

# Matriz de confusão com validação cruzada (as mesmas 5 partes fixas) e limiar 0,5
parte = np.arange(n) % 5 + 1
previsto = np.zeros(n, dtype=int)
for k in range(1, 6):
    m = smf.logit("am ~ wt", data=carros[parte != k]).fit(disp=0)
    previsto[parte == k] = (m.predict(carros[parte == k]) &gt;= 0.5).astype(int)
real = carros["am"].to_numpy()
VP = np.sum((previsto == 1) &amp; (real == 1)); FN = np.sum((previsto == 0) &amp; (real == 1))
FP = np.sum((previsto == 1) &amp; (real == 0)); VN = np.sum((previsto == 0) &amp; (real == 0))
print(f"VP = {VP}   FN = {FN}   FP = {FP}   VN = {VN}")

acuracia = (VP + VN) / n
precisao = VP / (VP + FP)
sensibilidade = VP / (VP + FN)
especificidade = VN / (VN + FP)
F1 = 2 * precisao * sensibilidade / (precisao + sensibilidade)
print(f"acurácia = {acuracia:.4f}   precisão = {precisao:.4f}   sensibilidade = {sensibilidade:.4f}"
      f"   especificidade = {especificidade:.4f}   F1 = {F1:.4f}")
print(f"Acurácia de prever sempre 'automático': {np.mean(real == 0):.4f}")</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">b0 = 12.0404   b1 = -4.0240
P(manual | peso = 3) = 0.4921
VP = 11   FN = 2   FP = 1   VN = 18
acurácia = 0.9062   precisão = 0.9167   sensibilidade = 0.8462   especificidade = 0.9474   F1 = 0.8800
Acurácia de prever sempre 'automático': 0.5938</pre>
</div>
  </div>
</div>

Ao rodar a versão em R, o `glm` pode avisar que "probabilidades ajustadas numericamente 0 ou 1 ocorreram" numa das partes. Vem dos carros mais pesados (mais de 5 mil libras), para os quais o modelo dá probabilidade praticamente nula de câmbio manual. Não é erro, e os coeficientes continuam válidos.

---

## 7. Outros Modelos

Regressão linear e logística são o ponto de partida, e muitas vezes bastam. Há modelos mais flexíveis, todos avaliados do mesmo jeito (teste ou validação cruzada contra uma linha de base):

- **Regressão ridge e lasso:** regressão linear com uma penalidade que encolhe os coeficientes em direção a zero, o que reduz o sobreajuste quando há muitas preditoras (James et al., 2021, p. 237). O lasso pode zerar coeficientes, deixando só uma parte das preditoras no modelo (James et al., 2021, p. 241–242). O tamanho da penalidade é escolhido por validação cruzada.
- **Árvores de decisão, florestas aleatórias e boosting:** dividem os dados em grupos por perguntas sucessivas ("peso < 3,3?") e preveem pela média ou pela classe mais comum de cada grupo; florestas e boosting combinam muitas árvores (James et al., 2021, cap. 8).
- **Redes neurais:** modelos muito flexíveis, usados sobretudo com imagens, som e texto (James et al., 2021, cap. 10).

Mais flexibilidade não garante previsões melhores: com poucos dados, o modelo simples muitas vezes vence, como no exemplo do sorvete. Só a validação diz.

---

## 8. Cuidados

- **Vazamento de dados:** nenhuma informação do teste pode entrar no ajuste, nem indiretamente. Se for padronizar as variáveis, escolher preditoras ou tratar valores faltantes, faça isso com médias e desvios calculados **só no treino** (dentro de cada rodada da validação cruzada). Senão o erro medido sai otimista.
- **Dados no tempo:** em séries temporais não se sorteiam as partes; treina-se com o passado e testa-se com o futuro, como na [validação no tempo]({{ '/pt/analise-de-dados/series-temporais' | relative_url }}) da página de Séries Temporais.
- **O mundo muda:** um modelo vale para casos parecidos com os do treino. Os carros de 1974 não representam os carros de hoje; um modelo de vendas ajustado antes de uma mudança grande (uma pandemia, um concorrente novo) pode deixar de funcionar.
- **Extrapolação:** a reta do sorvete foi ajustada entre 20 °C e 30 °C; prever para 40 °C é chute.
- **Prever não é explicar:** um modelo que prevê bem pode usar preditoras que não têm relação de causa com a resposta. Para decidir o que mudar no mundo, é preciso outro tipo de análise.
- **Decisões sobre pessoas:** quando o modelo decide algo sobre pessoas (crédito, emprego, saúde), confira os erros separadamente em cada grupo relevante: um modelo com boa acurácia geral pode errar muito mais num grupo do que em outro.
- **Relate a linha de base, o método de validação e o erro em dados novos**, não só o erro no treino.

---

## 9. Resumo

- Um modelo preditivo é avaliado pelo erro em **casos que ele não viu**: separe treino e teste, ou use validação cruzada.
- Medidas de erro para respostas numéricas: EAM, REQM (pesa mais os erros grandes; é sempre ≥ EAM) e EPAM. No sorvete, a reta errou em média 3,33 sorvetes no teste, contra 14,67 da linha de base (prever a média).
- O erro no treino é otimista (2,16 contra 3,37 no teste). Modelos flexíveis demais sofrem **sobreajuste**: o polinômio de grau 5 zerou o erro de treino e errou mais no teste (5,96).
- **Validação cruzada com $k$ partes:** cada caso é previsto por um modelo que não o viu. No mtcars, ela escolheu o grau 2 (REQM de 2,718 mpg), enquanto o erro no treino preferiria o grau 4.
- **Classificação:** a regressão logística dá probabilidades entre 0 e 1; um limiar transforma em decisão. Com validação cruzada, o câmbio dos carros foi previsto com acurácia 0,90625 (linha de base 0,59375), sensibilidade 0,8462, especificidade 0,9474, precisão 0,9167 e F1 0,88.
- O limiar, a linha de base e o método de validação são escolhas: diga quais foram.

---

## Referências

1. Henderson, H. V.; Velleman, P. F. (1981). Building multiple regression models interactively. *Biometrics*, 37(2), 391–411. DOI: [10.2307/2530428](https://doi.org/10.2307/2530428).
2. James, G.; Witten, D.; Hastie, T.; Tibshirani, R. (2021). *An Introduction to Statistical Learning: with Applications in R*. 2nd ed. Springer. DOI: [10.1007/978-1-0716-1418-1](https://doi.org/10.1007/978-1-0716-1418-1).

## Dados

- Carros: conjunto `mtcars` do pacote `datasets` do R (R Core Team), extraído da revista *Motor Trend* (EUA, 1974), que cita Henderson e Velleman (1981). Em Julia, lido pelo pacote RDatasets; em Python, por `statsmodels.datasets.get_rdataset("mtcars")`, que baixa a mesma tabela do repositório Rdatasets.
- Sorvete (seções 2 a 4): números ilustrativos, inventados para as contas ficarem simples.
