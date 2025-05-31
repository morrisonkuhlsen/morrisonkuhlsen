---
layout: page
title: Análise de Variância
lang: pt
ref: analise-variancia
parent: inferencia-estatistica
permalink: /pt/inferencia-estatistica/analise-variancia
order: 5
---

# Análise de Variância (ANOVA)

A Análise de Variância (ANOVA) é uma técnica estatística utilizada para comparar médias de dois ou mais grupos e verificar se pelo menos um deles difere significativamente dos demais. É amplamente empregada em experimentos científicos, controle de qualidade, ciências sociais e biológicas.

![Exemplo de ANOVA]({{ site.baseurl }}/assets/images/anova.png){:style="max-width: 400px; display: block; margin: 0 auto;"}
<div class="image-caption" style="text-align: center;">Figura: ANOVA compara médias de diferentes grupos.</div>

---

## Quando Usar ANOVA?

- Quando deseja comparar médias de **três ou mais grupos** independentes.
- Quando as variáveis são **quantitativas** e os grupos são **categóricos**.
- Quando os pressupostos de normalidade e homocedasticidade são atendidos.

**Exemplos de aplicação:**
- Comparar rendimento de diferentes fertilizantes em plantações.
- Avaliar desempenho de alunos em diferentes métodos de ensino.

---

## Tipos de ANOVA

- **ANOVA One-Way (um fator):** Compara médias de grupos definidos por um único fator (ex: tipo de tratamento).
- **ANOVA Two-Way (dois fatores):** Avalia o efeito de dois fatores e sua interação (ex: tipo de tratamento e sexo).
- **ANOVA de medidas repetidas:** Para dados em que os mesmos indivíduos são avaliados em diferentes condições.

---

## Pressupostos da ANOVA

1. **Independência:** As observações são independentes entre si.
2. **Normalidade:** Os resíduos (erros) seguem distribuição normal.
3. **Homocedasticidade:** As variâncias dos grupos são iguais.

> **Dica:** Teste de Shapiro-Wilk para normalidade e Levene para homocedasticidade.

---

## Exemplo Prático Manual (Passo a Passo)

Suponha o rendimento (em kg) de três fertilizantes em 5 plantas cada:

- **A:** 20, 21, 19, 22, 20
- **B:** 18, 17, 20, 16, 19
- **C:** 23, 22, 21, 24, 25

Vamos resolver o teste ANOVA one-way completo, passo a passo:

### 1. Calcule a média de cada grupo

- $\bar{x}_A = \frac{20 + 21 + 19 + 22 + 20}{5} = \frac{102}{5} = 20,4$
- $\bar{x}_B = \frac{18 + 17 + 20 + 16 + 19}{5} = \frac{90}{5} = 18,0$
- $\bar{x}_C = \frac{23 + 22 + 21 + 24 + 25}{5} = \frac{115}{5} = 23,0$

### 2. Calcule a média geral (sem arredondar)

- $\bar{x}_G = \frac{102 + 90 + 115}{15} = \frac{307}{15} = 20,466666\ldots$

### 3. Calcule a Soma dos Quadrados Entre Grupos (SQB) usando médias exatas

$SQB = 5 \times [(20,4 - 20,466666\ldots)^2 + (18,0 - 20,466666\ldots)^2 + (23,0 - 20,466666\ldots)^2]$

- $(20,4 - 20,466666\ldots)^2 = ( -0,066666\ldots )^2 = 0,004444\ldots$
- $(18,0 - 20,466666\ldots)^2 = ( -2,466666\ldots )^2 = 6,084444\ldots$
- $(23,0 - 20,466666\ldots)^2 = (2,533333\ldots )^2 = 6,417777\ldots$

$SQB = 5 \times (0,004444\ldots + 6,084444\ldots + 6,417777\ldots ) = 5 \times 12,506666\ldots = 62,533333\ldots$

### 4. Calcule a Soma dos Quadrados Dentro dos Grupos (SQD)

$SQD = \sum_{i=1}^k \sum_{j=1}^n (x_{ij} - \bar{x}_i)^2$

- Para A:
  - $(20-20,4)^2 = 0,16$
  - $(21-20,4)^2 = 0,36$
  - $(19-20,4)^2 = 1,96$
  - $(22-20,4)^2 = 2,56$
  - $(20-20,4)^2 = 0,16$
  - Soma A: $0,16 + 0,36 + 1,96 + 2,56 + 0,16 = 5,2$
- Para B:
  - $(18-18)^2 = 0$
  - $(17-18)^2 = 1$
  - $(20-18)^2 = 4$
  - $(16-18)^2 = 4$
  - $(19-18)^2 = 1$
  - Soma B: $0 + 1 + 4 + 4 + 1 = 10$
- Para C:
  - $(23-23)^2 = 0$
  - $(22-23)^2 = 1$
  - $(21-23)^2 = 4$
  - $(24-23)^2 = 1$
  - $(25-23)^2 = 4$
  - Soma C: $0 + 1 + 4 + 1 + 4 = 10$

$SQD = 5,2 + 10 + 10 = 25,2$

### 5. Calcule os graus de liberdade

- Entre grupos: $gl_B = 3 - 1 = 2$
- Dentro dos grupos: $gl_D = 15 - 3 = 12$

### 6. Calcule os Quadrados Médios (QM)

- $QM_B = 62,533333\ldots / 2 = 31,266666\ldots$
- $QM_D = 25,2 / 12 = 2,1$

### 7. Calcule a estatística F

$F = 31,266666\ldots / 2,1 = 14,8889$

### 8. Decisão

- Consulte a tabela F para $gl_B = 2$ e $gl_D = 12$ ao nível de 5%: $F_{crítico} \approx 3,89$
- Como $F_{calculado} = 14,89 > 3,89$, rejeitamos $H_0$.
- O valor-p (calculado pelo software) é $\approx 0,0006$, confirmando a rejeição.

**Conclusão:**

Há diferença significativa entre as médias dos grupos. Pelo menos um fertilizante tem rendimento diferente dos outros.

<em>Observação: Usando as médias exatas e sem arredondar valores intermediários, o valor da estatística F coincide exatamente com o resultado do Julia: <b>14,8889</b>.</em>

---

## Exemplo em Julia

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Statistics
using HypothesisTests
using StatsPlots
using DataFrames
using CategoricalArrays
using Measures

theme(:bright)

# Dados
a = [20, 21, 19, 22, 20]
b = [18, 17, 20, 16, 19]
c = [23, 22, 21, 24, 25]

# ANOVA
anova = OneWayANOVATest(a, b, c)
println(anova)
println("Valor-p: ", pvalue(anova))

# Criar DataFrame
df = DataFrame(:Grupo => repeat(["A", "B", "C"], inner=5), :Valor => vcat(a, b, c))
df.Grupo = CategoricalArray(df.Grupo, ordered=true, levels=["A", "B", "C"])

# Calcular médias por grupo
medias = combine(groupby(df, :Grupo), :Valor => mean => :Media)

# X para posição dos grupos no gráfico
x = 1:length(levels(df.Grupo))  # [1, 2, 3]

# Y com médias na ordem dos grupos
y_media = [
    medias.Media[findfirst(==("A"), medias.Grupo)],
    medias.Media[findfirst(==("B"), medias.Grupo)],
    medias.Media[findfirst(==("C"), medias.Grupo)]
]

# Paleta de cores
pal = [:steelblue, :darkseagreen, :orchid]

# Margens ajustadas com Measures.jl para não cortar textos
right_margin = 10mm
left_margin = 5mm

# Criar boxplot com margem direita aumentada
p = @df df boxplot(:Grupo, :Valor,
    group = :Grupo,
    palette = pal,
    title = "Comparação entre Grupos \n(ANOVA)",
    ylabel = "Valores",
    legend = false,
    fillalpha = 0.6,
    linecolor = :black,
    linewidth = 1.5,
    outlier = :circle,
    size = (700, 400),
    right_margin = right_margin,
    left_margin = left_margin)

# Linha conectando as médias
plot!(p, x, y_media, lw=2, marker=:circle, linecolor=:crimson, label="Médias")

# Anotações das médias à direita de cada ponto
for (xi, yi) in zip(x, y_media)
    annotate!(p, xi + 0.5, yi, text(string(round(yi, digits=2)), :black, :left, 10))
end

display(p)
</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="color:#f8f8f2; padding:1em; border-radius:6px; font-size:0.97em;">
One-way analysis of variance (ANOVA) test
-----------------------------------------
Population details:
    parameter of interest:   Means
    value under h_0:         "all equal"
    point estimate:          NaN

Test summary:
    outcome with 95% confidence: reject h_0
    p-value:                     0.0006

Details:
    number of observations: [5, 5, 5]
    F statistic:            14.8889
    degrees of freedom:     (2, 12)

Valor-p: 0.0005615849536226485
  </pre>
</div>

<div class="code-explanation">
  <strong>Interpretação da saída:</strong><br>
  <ul>
    <li><b>Rejeição da hipótese nula (h₀):</b> O teste ANOVA rejeitou a hipótese de que todas as médias dos grupos são iguais ao nível de 5% de significância (95% de confiança). Isso significa que <b>há evidências estatísticas de que pelo menos um dos grupos tem média diferente dos outros</b>.</li>
    <li><b>Valor-p muito pequeno (0.0006):</b> A probabilidade de observarmos diferenças tão grandes entre as médias dos grupos, caso todas fossem realmente iguais, é de apenas 0,06%. Portanto, é muito improvável que as médias sejam todas iguais.</li>
    <li><b>Estatística F elevada (14.89):</b> Indica forte evidência contra a hipótese nula.</li>
    <li><b>O teste ANOVA não indica qual grupo é diferente:</b> Ele apenas aponta que existe diferença significativa. Para identificar <b>onde</b> estão as diferenças, é necessário realizar testes post-hoc, como o teste de Tukey.</li>
  </ul>
</div>

![Boxplot dos grupos ANOVA]({{ site.baseurl }}/assets/images/anova_boxplot.png){:style="max-width: 700px; display: block; margin: 1em auto;"}
<div class="image-caption" style="text-align: center;">Figura: Boxplot dos grupos com médias conectadas (linha vermelha) gerado pelo código Julia acima.</div>

---

## Avisos Importantes

- ANOVA indica que há diferença, mas não diz **onde** está a diferença. Para isso, use testes post-hoc (ex: Tukey).
- Sempre verifique os pressupostos antes de interpretar o resultado.
- Para grupos com variâncias muito diferentes ou dados não normais, use alternativas como Kruskal-Wallis.

---

## Referências Bibliográficas

1. Montgomery, D. C., & Runger, G. C. (2010). Applied Statistics and Probability for Engineers.
2. Morettin, P. A., & Bussab, W. O. (2017). Estatística Básica.
3. Triola, M. F. (2017). Introdução à Estatística.
4. Zar, J. H. (2010). Biostatistical Analysis.
