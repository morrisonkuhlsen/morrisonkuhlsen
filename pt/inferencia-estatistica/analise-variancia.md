---
layout: page
title: Análise de Variância (ANOVA)
lang: pt
ref: analise-variancia
parent: inferencia-estatistica
permalink: /pt/inferencia-estatistica/analise-variancia
order: 5
mathjax: true
description: "ANOVA de um fator: compare as médias de vários grupos com o teste F, passo a passo, com pressupostos, tamanho do efeito, teste de Tukey e código em Julia."
---

![Ilustração de um analista apontando para um gráfico com o título ANOVA na tela do computador]({{ site.baseurl }}/assets/images/statistics.avif){:style="max-width: 600px; display: block; margin: 0 auto;"}

A **análise de variância (ANOVA)** é um teste de hipótese que compara as médias de dois ou mais grupos de uma só vez. Ela responde à pergunta: *as diferenças entre as médias dos grupos são grandes demais para serem só acaso?* Na prática é usada sobretudo com três ou mais grupos; com dois, ela dá exatamente o mesmo resultado que o [teste t de Student]({{ '/pt/inferencia-estatistica/testes-hipotese' | relative_url }}) com variâncias iguais (seção 10).

Apesar do nome, a ANOVA compara **médias**. O nome vem do método: ela separa a variação total dos dados em duas partes, a que existe **entre** os grupos e a que existe **dentro** de cada grupo, e compara as duas.

Esta página trata da **ANOVA de um fator** (one-way): os grupos são definidos por uma única variável categórica, como o tipo de fertilizante.

---

## 1. A Ideia: Variação Entre × Variação Dentro dos Grupos

Imagine três grupos de medidas. Dois tipos de variação aparecem:

- **variação entre grupos**: o quanto as médias dos grupos se afastam da média geral;
- **variação dentro dos grupos**: o quanto cada valor se afasta da média do seu próprio grupo.

Se as médias populacionais forem todas iguais, as médias amostrais ainda vão diferir um pouco, só por acaso, e essa diferença terá o mesmo tamanho que se espera a partir da variação dentro dos grupos. Se a variação entre os grupos for **muito maior** do que a variação dentro deles, o acaso sozinho explica mal os dados, e é razoável concluir que pelo menos uma média é diferente.

A estatística da ANOVA, chamada **F**, é exatamente essa comparação:

$$
F = \frac{\text{variação entre os grupos (por grau de liberdade)}}{\text{variação dentro dos grupos (por grau de liberdade)}}
$$

F perto de 1 é o que se espera quando as médias são iguais; F muito maior que 1 é evidência de que não são. A seção 4 define cada parte com precisão.

O código abaixo simula três situações, com 30 valores por grupo, e calcula F e o p-valor de cada uma.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Plots, Random, Statistics, HypothesisTests

Random.seed!(123)

# O objeto do teste guarda as somas de quadrados; F = (SQ entre / gl) / (SQ dentro / gl).
estatistica_F(t) = (sum(t.SStᵢ) / t.DFt) / (sum(t.SSeᵢ) / t.DFe)

# Gera três grupos de 30 valores: as médias ficam a `distancia` umas das outras
# e cada grupo se espalha com desvio padrão `espalhamento`.
function grafico_grupos(titulo, distancia, espalhamento)
    grupos = ["A", "B", "C"]
    valores = [randn(30) .* espalhamento .+ distancia * (i - 1) for i in 1:3]
    media_geral = mean(vcat(valores...))

    p = plot(title = titulo, titlefontsize = 10, xlabel = "Grupo", ylabel = "Valor",
             xticks = (1:3, grupos), xlims = (0.5, 3.5), legend = :outerbottom, legendcolumns = 2,
             size = (420, 420))
    for i in 1:3
        x = i .+ 0.08 .* randn(30)          # pequeno deslocamento para os pontos não se sobreporem
        scatter!(p, x, valores[i], alpha = 0.6, markersize = 5, label = "")
        plot!(p, [i - 0.3, i + 0.3], fill(mean(valores[i]), 2), lw = 3, color = :crimson,
              label = i == 1 ? "Média do grupo" : "")
    end
    hline!(p, [media_geral], lw = 2, ls = :dash, color = :black, label = "Média geral")
    teste = OneWayANOVATest(valores...)
    println(titulo, ": F = ", round(estatistica_F(teste), digits = 2), ", p-valor = ", round(pvalue(teste), sigdigits = 3))
    return p
end

p1 = grafico_grupos("Médias iguais, muita variação dentro", 0.0, 1.0)
p2 = grafico_grupos("Médias distantes, pouca variação dentro", 3.0, 0.5)
p3 = grafico_grupos("Médias pouco distantes, variação moderada", 0.5, 1.0)

savefig(p1, "variabilidade_grupos.png")
savefig(p2, "variabilidade_grupos2.png")
savefig(p3, "variabilidade_grupos3.png")</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>Médias iguais, muita variação dentro: F = 0.61, p-valor = 0.547</div>
  <div>Médias distantes, pouca variação dentro: F = 1076.59, p-valor = 4.28e-62</div>
  <div>Médias pouco distantes, variação moderada: F = 13.36, p-valor = 8.71e-6</div>
</div>

<div style="display: flex; flex-wrap: wrap; gap: 20px; justify-content: center;">
  <div style="text-align: center; max-width: 320px;">
    <img src="{{ site.baseurl }}/assets/images/variabilidade_grupos.png" alt="Três grupos de pontos com médias quase na mesma altura e pontos bem espalhados dentro de cada grupo" style="max-width: 320px;">
    <div style="font-size: 0.95em; margin-top: 0.5em;">Figura 1. Médias verdadeiras iguais e muita variação dentro dos grupos: F = 0,61 (p-valor = 0,547). Não há evidência de diferença.</div>
  </div>
  <div style="text-align: center; max-width: 320px;">
    <img src="{{ site.baseurl }}/assets/images/variabilidade_grupos2.png" alt="Três grupos de pontos bem separados, em alturas 0, 3 e 6, com pouca dispersão em cada grupo" style="max-width: 320px;">
    <div style="font-size: 0.95em; margin-top: 0.5em;">Figura 2. Médias verdadeiras distantes (0, 3 e 6) e pouca variação dentro: F = 1076,59. A diferença é evidente.</div>
  </div>
  <div style="text-align: center; max-width: 320px;">
    <img src="{{ site.baseurl }}/assets/images/variabilidade_grupos3.png" alt="Três grupos de pontos que se sobrepõem bastante, com médias um pouco diferentes" style="max-width: 320px;">
    <div style="font-size: 0.95em; margin-top: 0.5em;">Figura 3. Médias verdadeiras pouco distantes (0; 0,5; 1) e variação moderada: os pontos se sobrepõem, mas com 30 valores por grupo F = 13,36 (p-valor ≈ 0,0000087).</div>
  </div>
</div>

A figura 3 mostra uma coisa importante: os grupos se sobrepõem bastante e, mesmo assim, o teste aponta diferença. Com amostras grandes, diferenças pequenas ficam detectáveis. **Significância estatística não é o mesmo que importância prática**; para isso é preciso olhar o tamanho da diferença (seções 6 e 8).

---

## 2. Por que Não Fazer Vários Testes t?

Com três grupos, daria para comparar A com B, A com C e B com C, cada um com um teste t a 5%. O problema é que cada teste tem 5% de chance de um **falso positivo** (erro tipo I) quando as médias são iguais, e as chances se acumulam:

- pela desigualdade da união, a chance de pelo menos um falso positivo nos três testes é **no máximo** $3 \times 0{,}05 = 0{,}15$;
- se os três testes fossem independentes, ela seria $1 - 0{,}95^3 = 1 - 0{,}857375 = 0{,}142625$, cerca de 14%. (Os três testes não são independentes, porque usam os mesmos dados; o valor exato é outro, mas continua bem acima de 5%.)

A ANOVA faz **um único teste** para a pergunta "as médias são todas iguais?", com erro tipo I de 5%. Só depois de ela indicar diferença é que se compara par a par, com um método que controla o erro do conjunto (seção 8).

---

## 3. Hipóteses e Pressupostos

Com $k$ grupos e médias populacionais $\mu_1, \mu_2, \ldots, \mu_k$:

$$
H_0: \mu_1 = \mu_2 = \cdots = \mu_k
$$

$$
H_1: \text{pelo menos uma média é diferente das outras}
$$

Atenção: $H_1$ **não** diz que todas as médias são diferentes. Basta uma diferente para $H_0$ ser falsa.

Para o teste F valer, são necessários três pressupostos:

1. **Independência**: as observações são independentes, dentro e entre os grupos. Isso vem do desenho do estudo (sorteio das unidades, nenhuma unidade medida duas vezes), não de um teste.
2. **Normalidade**: em cada grupo, os valores vêm de uma distribuição normal. Na prática se confere nos **resíduos** (cada valor menos a média do seu grupo).
3. **Variâncias iguais** (homocedasticidade): todos os grupos têm a mesma variância populacional $\sigma^2$.

A seção 7 mostra como conferir os pressupostos no exemplo, e a seção 11 o que fazer quando eles falham.

---

## 4. As Fórmulas

**Notação.** Há $k$ grupos; o grupo $i$ tem $n_i$ observações $x_{i1}, x_{i2}, \ldots, x_{in_i}$ e média $\bar{x}_i$. O total de observações é $N = n_1 + n_2 + \cdots + n_k$ e a média geral (de todas as $N$ observações juntas) é $\bar{x}$.

**Somas de quadrados.** Cada uma mede uma parte da variação:

$$
SQ_{\text{total}} = \sum_{i=1}^{k} \sum_{j=1}^{n_i} (x_{ij} - \bar{x})^2 \qquad \text{(cada valor em relação à média geral)}
$$

$$
SQ_{\text{entre}} = \sum_{i=1}^{k} n_i \,(\bar{x}_i - \bar{x})^2 \qquad \text{(cada média de grupo em relação à média geral)}
$$

$$
SQ_{\text{dentro}} = \sum_{i=1}^{k} \sum_{j=1}^{n_i} (x_{ij} - \bar{x}_i)^2 \qquad \text{(cada valor em relação à média do seu grupo)}
$$

As três estão ligadas por uma identidade que vale **sempre**, para quaisquer dados:

$$
SQ_{\text{total}} = SQ_{\text{entre}} + SQ_{\text{dentro}}
$$

É essa a "análise" (decomposição) da variação que dá nome ao método.

**Graus de liberdade (gl).** $gl_{\text{entre}} = k - 1$ e $gl_{\text{dentro}} = N - k$. Somados, dão $N - 1$, os graus de liberdade da $SQ_{\text{total}}$.

**Quadrados médios (QM)** são as somas de quadrados divididas pelos graus de liberdade:

$$
QM_{\text{entre}} = \frac{SQ_{\text{entre}}}{k - 1} \qquad\qquad QM_{\text{dentro}} = \frac{SQ_{\text{dentro}}}{N - k}
$$

O $QM_{\text{dentro}}$ é a estimativa combinada da variância $\sigma^2$ comum aos grupos; com grupos do mesmo tamanho, é a média das variâncias amostrais $s^2$ dos grupos.

**Estatística F:**

$$
F = \frac{QM_{\text{entre}}}{QM_{\text{dentro}}}
$$

Sob $H_0$ e com os pressupostos da seção 3, F segue a **distribuição F de Snedecor** com $(k - 1)$ e $(N - k)$ graus de liberdade. O p-valor é $P(F_{k-1,\,N-k} \geq F_{\text{observado}})$: o teste é sempre unilateral à direita, porque só valores grandes de F são evidência contra $H_0$.

Os resultados costumam ser apresentados numa **tabela ANOVA**:

| Fonte de variação | SQ | gl | QM | F |
|---|---|---|---|---|
| Entre os grupos | $SQ_{\text{entre}}$ | $k - 1$ | $SQ_{\text{entre}} / (k - 1)$ | $QM_{\text{entre}} / QM_{\text{dentro}}$ |
| Dentro dos grupos | $SQ_{\text{dentro}}$ | $N - k$ | $SQ_{\text{dentro}} / (N - k)$ | |
| Total | $SQ_{\text{total}}$ | $N - 1$ | | |

---

## 5. Exemplo Resolvido Passo a Passo

**Situação** (números ilustrativos, escolhidos para a conta ficar simples): um agrônomo testa três fertilizantes, A, B e C, em 15 plantas, sorteando 5 plantas para cada fertilizante. Ao fim, mede o rendimento de cada planta, em kg.

| Fertilizante | Rendimentos (kg) |
|---|---|
| A | 20, 21, 19, 22, 20 |
| B | 18, 17, 20, 16, 19 |
| C | 23, 22, 21, 24, 25 |

**Pergunta:** ao nível de significância $\alpha = 0{,}05$, há evidência de que o rendimento médio difere entre os fertilizantes?

### 5.1 Dados e hipóteses

- Número de grupos: $k = 3$ (do enunciado).
- Tamanho de cada grupo: $n_A = n_B = n_C = 5$ (do enunciado).
- Total de observações: $N = 5 + 5 + 5 = 15$.
- Nível de significância: $\alpha = 0{,}05$ (do enunciado).

$$
H_0: \mu_A = \mu_B = \mu_C \qquad\qquad H_1: \text{pelo menos uma média é diferente}
$$

### 5.2 Médias dos grupos

Média de cada grupo: soma dos valores dividida por 5.

$$
\bar{x}_A = \frac{20 + 21 + 19 + 22 + 20}{5} = \frac{102}{5} = 20{,}4 \text{ kg}
$$

$$
\bar{x}_B = \frac{18 + 17 + 20 + 16 + 19}{5} = \frac{90}{5} = 18{,}0 \text{ kg}
$$

$$
\bar{x}_C = \frac{23 + 22 + 21 + 24 + 25}{5} = \frac{115}{5} = 23{,}0 \text{ kg}
$$

### 5.3 Média geral

Soma de todos os 15 valores, dividida por 15. A soma de todos é a soma das três somas parciais:

$$
\bar{x} = \frac{102 + 90 + 115}{15} = \frac{307}{15} = 20{,}4\overline{6} \approx 20{,}4667 \text{ kg}
$$

Esse valor é uma dízima periódica (20,4666…). As contas seguintes usam a fração exata $307/15$; os decimais mostrados são arredondados só para leitura.

### 5.4 Soma de quadrados entre os grupos

Fórmula: $SQ_{\text{entre}} = \sum n_i (\bar{x}_i - \bar{x})^2$. Para cada grupo, o desvio da média do grupo em relação à média geral, o seu quadrado e o produto por $n_i = 5$:

| Grupo | $\bar{x}_i - \bar{x}$ | $(\bar{x}_i - \bar{x})^2$ | $n_i(\bar{x}_i - \bar{x})^2$ |
|---|---|---|---|
| A | $\frac{102}{5} - \frac{307}{15} = \frac{306 - 307}{15} = -\frac{1}{15} \approx -0{,}0667$ | $\frac{1}{225} \approx 0{,}0044$ | $\frac{5}{225} = \frac{1}{45} \approx 0{,}0222$ |
| B | $18 - \frac{307}{15} = \frac{270 - 307}{15} = -\frac{37}{15} \approx -2{,}4667$ | $\frac{1369}{225} \approx 6{,}0844$ | $\frac{1369}{45} \approx 30{,}4222$ |
| C | $23 - \frac{307}{15} = \frac{345 - 307}{15} = \frac{38}{15} \approx 2{,}5333$ | $\frac{1444}{225} \approx 6{,}4178$ | $\frac{1444}{45} \approx 32{,}0889$ |

Somando a última coluna:

$$
SQ_{\text{entre}} = \frac{1 + 1369 + 1444}{45} = \frac{2814}{45} = \frac{938}{15} \approx 62{,}5333
$$

### 5.5 Soma de quadrados dentro dos grupos

Fórmula: $SQ_{\text{dentro}} = \sum_i \sum_j (x_{ij} - \bar{x}_i)^2$. Cada valor menos a média **do seu grupo**, ao quadrado:

| Grupo A ($\bar{x}_A = 20{,}4$) | | Grupo B ($\bar{x}_B = 18$) | | Grupo C ($\bar{x}_C = 23$) | |
|---|---|---|---|---|---|
| $x - \bar{x}_A$ | $(x - \bar{x}_A)^2$ | $x - \bar{x}_B$ | $(x - \bar{x}_B)^2$ | $x - \bar{x}_C$ | $(x - \bar{x}_C)^2$ |
| $20 - 20{,}4 = -0{,}4$ | $0{,}16$ | $18 - 18 = 0$ | $0$ | $23 - 23 = 0$ | $0$ |
| $21 - 20{,}4 = 0{,}6$ | $0{,}36$ | $17 - 18 = -1$ | $1$ | $22 - 23 = -1$ | $1$ |
| $19 - 20{,}4 = -1{,}4$ | $1{,}96$ | $20 - 18 = 2$ | $4$ | $21 - 23 = -2$ | $4$ |
| $22 - 20{,}4 = 1{,}6$ | $2{,}56$ | $16 - 18 = -2$ | $4$ | $24 - 23 = 1$ | $1$ |
| $20 - 20{,}4 = -0{,}4$ | $0{,}16$ | $19 - 18 = 1$ | $1$ | $25 - 23 = 2$ | $4$ |
| **Soma** | $\mathbf{5{,}2}$ | **Soma** | $\mathbf{10}$ | **Soma** | $\mathbf{10}$ |

$$
SQ_{\text{dentro}} = 5{,}2 + 10 + 10 = 25{,}2
$$

### 5.6 Soma de quadrados total (conferência)

Pela identidade da seção 4, $SQ_{\text{total}} = SQ_{\text{entre}} + SQ_{\text{dentro}}$:

$$
SQ_{\text{total}} = \frac{938}{15} + 25{,}2 = \frac{938}{15} + \frac{378}{15} = \frac{1316}{15} \approx 87{,}7333
$$

Para conferir por outro caminho, calcule $SQ_{\text{total}}$ direto, com a forma equivalente $\sum x^2 - \frac{(\sum x)^2}{N}$ (a soma dos quadrados dos 15 valores menos o quadrado da soma dividido por $N$):

- soma dos quadrados dos 15 valores: $20^2 + 21^2 + \cdots + 25^2 = 6371$;
- quadrado da soma: $307^2 = 94\,249$; dividido por 15: $94\,249 / 15 = 6283{,}2\overline{6}$;

$$
SQ_{\text{total}} = 6371 - \frac{94\,249}{15} = \frac{95\,565 - 94\,249}{15} = \frac{1316}{15} \approx 87{,}7333
$$

Os dois caminhos dão o mesmo valor.

### 5.7 Graus de liberdade

$$
gl_{\text{entre}} = k - 1 = 3 - 1 = 2 \qquad\qquad gl_{\text{dentro}} = N - k = 15 - 3 = 12
$$

Conferência: $2 + 12 = 14 = N - 1$.

### 5.8 Quadrados médios

$$
QM_{\text{entre}} = \frac{SQ_{\text{entre}}}{gl_{\text{entre}}} = \frac{938/15}{2} = \frac{469}{15} \approx 31{,}2667
$$

$$
QM_{\text{dentro}} = \frac{SQ_{\text{dentro}}}{gl_{\text{dentro}}} = \frac{25{,}2}{12} = 2{,}1
$$

Conferência do $QM_{\text{dentro}}$: as variâncias amostrais dos grupos são $s_A^2 = 5{,}2/4 = 1{,}3$, $s_B^2 = 10/4 = 2{,}5$ e $s_C^2 = 10/4 = 2{,}5$; como os grupos têm o mesmo tamanho, $QM_{\text{dentro}}$ é a média delas: $(1{,}3 + 2{,}5 + 2{,}5)/3 = 6{,}3/3 = 2{,}1$.

### 5.9 Estatística F

$$
F = \frac{QM_{\text{entre}}}{QM_{\text{dentro}}} = \frac{469/15}{2{,}1} = \frac{469/15}{21/10} = \frac{469 \times 10}{15 \times 21} = \frac{4690}{315} = \frac{134}{9} \approx 14{,}8889
$$

### 5.10 Tabela ANOVA do exemplo

| Fonte de variação | SQ | gl | QM | F |
|---|---|---|---|---|
| Entre os fertilizantes | 62,5333 | 2 | 31,2667 | 14,8889 |
| Dentro dos fertilizantes | 25,2000 | 12 | 2,1000 | |
| Total | 87,7333 | 14 | | |

### 5.11 Decisão

**Pelo valor crítico.** O valor crítico é o quantil 95% da distribuição F com 2 e 12 graus de liberdade. Na tabela F para $\alpha = 0{,}05$ (coluna 2, linha 12), $F_{\text{crítico}} = 3{,}89$; em Julia, `quantile(FDist(2, 12), 0.95)` dá 3,8853. Como $F = 14{,}89 > 3{,}89$, rejeitamos $H_0$.

**Pelo p-valor.** $P(F_{2,12} \geq 14{,}8889) = 0{,}00056$, calculado com `ccdf(FDist(2, 12), 134/9)` em Julia. Como $0{,}00056 < 0{,}05$, a decisão é a mesma: rejeitar $H_0$.

### 5.12 Interpretação

**O que o resultado diz:** se os três fertilizantes tivessem o mesmo rendimento médio, diferenças entre as médias amostrais tão grandes quanto as observadas (ou maiores) aconteceriam em cerca de 0,056% dos experimentos, isto é, cerca de 1 em 1.800. Por isso concluímos que **pelo menos um fertilizante tem rendimento médio diferente** dos outros.

**O que o resultado não diz:**

- **não diz qual** fertilizante difere, nem se todos diferem entre si; isso é o papel do teste de Tukey (seção 8);
- o p-valor **não** é a probabilidade de $H_0$ ser verdadeira;
- o p-valor não mede o **tamanho** da diferença; para isso servem as diferenças entre as médias (em kg) e o $\eta^2$ (seção 6);
- como os fertilizantes foram **sorteados** entre as plantas, é razoável atribuir a diferença ao fertilizante; num estudo só observacional (sem sorteio), a ANOVA mostraria associação, não causa;
- com 5 plantas por grupo, a conclusão depende dos pressupostos, que precisam ser conferidos (seção 7).

---

## 6. Tamanho do Efeito: η²

O **eta ao quadrado** diz que fração da variação total está associada à diferença entre os grupos:

$$
\eta^2 = \frac{SQ_{\text{entre}}}{SQ_{\text{total}}}
$$

Como $SQ_{\text{total}} = SQ_{\text{entre}} + SQ_{\text{dentro}}$ e as duas parcelas são maiores ou iguais a zero, $\eta^2$ fica sempre entre 0 e 1 (desde que os dados não sejam todos iguais, o que daria $SQ_{\text{total}} = 0$).

No exemplo:

$$
\eta^2 = \frac{938/15}{1316/15} = \frac{938}{1316} = \frac{67}{94} \approx 0{,}7128
$$

**Interpretação:** cerca de 71% da variação no rendimento das 15 plantas está associada ao fertilizante usado; os outros 29% são variação entre plantas que receberam o mesmo fertilizante. É um efeito grande. Cuidado: $\eta^2$ calculado na amostra tende a superestimar o efeito na população, sobretudo com amostras pequenas como esta.

---

## 7. Conferindo os Pressupostos no Exemplo

1. **Independência.** Cada planta recebeu um único fertilizante, sorteado, e foi medida uma vez. Supondo que as plantas não interferem umas nas outras (por exemplo, vasos separados), a independência vem do desenho do experimento.
2. **Variâncias iguais.** As variâncias amostrais são 1,3; 2,5 e 2,5. A maior é $2{,}5 / 1{,}3 \approx 1{,}92$ vez a menor. O teste de Levene (na versão com a média, a da função `LeveneTest` do HypothesisTests.jl) dá p-valor = 0,7493: não há evidência de variâncias diferentes.
3. **Normalidade.** Os resíduos são os valores das colunas $x - \bar{x}_i$ da tabela da seção 5.5. O teste de Shapiro-Wilk nos 15 resíduos dá p-valor = 0,465: não há evidência contra a normalidade.

**Limite importante:** com só 5 observações por grupo, esses testes têm pouco poder; "não rejeitar" a normalidade ou a igualdade de variâncias **não prova** que elas valem. Eles só não acharam um problema grande. Com amostras pequenas, vale também olhar os dados (como no gráfico da seção 9) e usar o conhecimento do assunto.

---

## 8. Qual Grupo Difere? O Teste de Tukey

A ANOVA rejeitou $H_0$, mas não disse onde está a diferença. Um **teste post-hoc** compara os grupos dois a dois, controlando a chance de pelo menos um falso positivo no conjunto das comparações (a 5%). O mais usado quando todos os pares interessam é o **teste de Tukey** (HSD, *honestly significant difference*).

**Fórmula.** Para grupos do mesmo tamanho $n$, duas médias diferem a 5% quando a distância entre elas passa da **diferença mínima significativa** (DMS):

$$
\text{DMS} = q_{0{,}05;\,k,\,N-k} \times \sqrt{\frac{QM_{\text{dentro}}}{n}}
$$

em que $q_{0{,}05;\,k,\,N-k}$ é o quantil 95% da **distribuição da amplitude studentizada** com $k$ grupos e $N - k$ graus de liberdade (tabela de Tukey).

**Substituição e conta.**

- $q_{0{,}05;\,3,\,12} = 3{,}77$ (tabela de Tukey, $k = 3$, 12 graus de liberdade); em Julia, `quantile(StudentizedRange(12, 3), 0.95)` dá 3,7729.
- Erro padrão: $\sqrt{QM_{\text{dentro}} / n} = \sqrt{2{,}1 / 5} = \sqrt{0{,}42} \approx 0{,}6481$ kg.
- $\text{DMS} = 3{,}7729 \times 0{,}6481 \approx 2{,}4451$ kg.

| Comparação | Diferença das médias (kg) | Passa da DMS (2,4451)? | p-valor ajustado | IC 95% para a diferença (kg) |
|---|---|---|---|---|
| B − A | $18{,}0 - 20{,}4 = -2{,}4$ | não ($2{,}4 < 2{,}4451$) | 0,0545 | [−4,85; 0,05] |
| C − A | $23{,}0 - 20{,}4 = 2{,}6$ | sim | 0,0371 | [0,15; 5,05] |
| C − B | $23{,}0 - 18{,}0 = 5{,}0$ | sim | 0,0004 | [2,55; 7,45] |

Os intervalos são diferença ± DMS; os p-valores ajustados vêm da mesma distribuição, com $q = \lvert\text{diferença}\rvert / 0{,}6481$ (código na seção 9).

**Interpretação:**

- O fertilizante **C** rende mais que A (cerca de 2,6 kg a mais por planta) e mais que B (cerca de 5,0 kg a mais).
- A diferença entre **A e B** (2,4 kg) **não** é significativa a 5% depois do ajuste. Isso **não** quer dizer que A e B rendem igual: o intervalo [−4,85; 0,05] vai de "B rende quase 5 kg a menos" até "praticamente igual". Com 5 plantas por grupo, o experimento não tem precisão para separar os dois.
- Repare no efeito do ajuste: um teste t isolado entre A e B daria p-valor = 0,025 (seção 10). O Tukey é mais exigente porque está fazendo três comparações de uma vez, e é isso que mantém em 5% a chance de algum falso positivo.

---

## 9. Código em Julia

Cada bloco roda sozinho. Os pacotes usados são Statistics (da biblioteca padrão), Distributions, HypothesisTests e StatsPlots.

### 9.1 Tabela ANOVA, à mão e com a função pronta

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Statistics, Distributions, HypothesisTests

# Rendimento (kg) de 5 plantas por fertilizante
grupos = Dict("A" =&gt; [20, 21, 19, 22, 20],
              "B" =&gt; [18, 17, 20, 16, 19],
              "C" =&gt; [23, 22, 21, 24, 25])
nomes = ["A", "B", "C"]
todos = vcat((grupos[g] for g in nomes)...)

k = length(nomes)          # número de grupos
N = length(todos)          # número total de observações
media_geral = mean(todos)

# Somas de quadrados, como na conta à mão
SQE = sum(length(grupos[g]) * (mean(grupos[g]) - media_geral)^2 for g in nomes)
SQD = sum(sum((grupos[g] .- mean(grupos[g])).^2) for g in nomes)
SQT = sum((todos .- media_geral).^2)

gl_entre, gl_dentro = k - 1, N - k
QME = SQE / gl_entre
QMD = SQD / gl_dentro
F = QME / QMD
p_valor = ccdf(FDist(gl_entre, gl_dentro), F)       # P(F(2, 12) &gt; F observado)
F_critico = quantile(FDist(gl_entre, gl_dentro), 0.95)

println("SQE = ", round(SQE, digits = 4), "   SQD = ", round(SQD, digits = 4),
        "   SQT = ", round(SQT, digits = 4), "   SQE + SQD = ", round(SQE + SQD, digits = 4))
println("QME = ", round(QME, digits = 4), "   QMD = ", round(QMD, digits = 4))
println("F = ", round(F, digits = 4), "   F crítico (5%) = ", round(F_critico, digits = 4))
println("p-valor = ", round(p_valor, digits = 6))
println("η² = SQE/SQT = ", round(SQE / SQT, digits = 4))

# Conferência com a função pronta do HypothesisTests
teste = OneWayANOVATest((grupos[g] for g in nomes)...)
println("p-valor (HypothesisTests) = ", round(pvalue(teste), digits = 6))</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>SQE = 62.5333   SQD = 25.2   SQT = 87.7333   SQE + SQD = 87.7333</div>
  <div>QME = 31.2667   QMD = 2.1</div>
  <div>F = 14.8889   F crítico (5%) = 3.8853</div>
  <div>p-valor = 0.000562</div>
  <div>η² = SQE/SQT = 0.7128</div>
  <div>p-valor (HypothesisTests) = 0.000562</div>
</div>

### 9.2 Pressupostos

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Statistics, HypothesisTests

a = [20, 21, 19, 22, 20]
b = [18, 17, 20, 16, 19]
c = [23, 22, 21, 24, 25]

# Resíduos: cada valor menos a média do seu grupo
residuos = vcat(a .- mean(a), b .- mean(b), c .- mean(c))

println("Variâncias dos grupos (s²): ", var(a), ", ", var(b), ", ", var(c))
println("Shapiro-Wilk nos resíduos: p-valor = ", round(pvalue(ShapiroWilkTest(residuos)), digits = 4))
println("Levene (variâncias iguais): p-valor = ", round(pvalue(LeveneTest(a, b, c)), digits = 4))</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>Variâncias dos grupos (s²): 1.3, 2.5, 2.5</div>
  <div>Shapiro-Wilk nos resíduos: p-valor = 0.465</div>
  <div>Levene (variâncias iguais): p-valor = 0.7493</div>
</div>

### 9.3 Teste de Tukey

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Statistics, Distributions

medias = Dict("A" =&gt; mean([20, 21, 19, 22, 20]),
              "B" =&gt; mean([18, 17, 20, 16, 19]),
              "C" =&gt; mean([23, 22, 21, 24, 25]))
k, n, N = 3, 5, 15
QM_dentro = 2.1                 # quadrado médio dentro, da tabela ANOVA
erro_padrao = sqrt(QM_dentro / n)

# Distribuição da amplitude studentizada. Atenção à ordem dos parâmetros
# no Distributions.jl: StudentizedRange(ν, k), graus de liberdade primeiro.
dist_q = StudentizedRange(N - k, k)
q_critico = quantile(dist_q, 0.95)
DMS = q_critico * erro_padrao   # diferença mínima significativa de Tukey

println("q crítico = ", round(q_critico, digits = 4), "   DMS = ", round(DMS, digits = 4))
for (g1, g2) in [("A", "B"), ("A", "C"), ("B", "C")]
    diferenca = medias[g2] - medias[g1]
    q = abs(diferenca) / erro_padrao
    p = ccdf(dist_q, q)
    println(g2, " − ", g1, ": diferença = ", round(diferenca, digits = 2),
            "   q = ", round(q, digits = 4), "   p-valor = ", round(p, digits = 4),
            "   IC 95% = [", round(diferenca - DMS, digits = 2), "; ", round(diferenca + DMS, digits = 2), "]")
end</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>q crítico = 3.7729   DMS = 2.4451</div>
  <div>B − A: diferença = -2.4   q = 3.7033   p-valor = 0.0545   IC 95% = [-4.85; 0.05]</div>
  <div>C − A: diferença = 2.6   q = 4.0119   p-valor = 0.0371   IC 95% = [0.15; 5.05]</div>
  <div>C − B: diferença = 5.0   q = 7.7152   p-valor = 0.0004   IC 95% = [2.55; 7.45]</div>
</div>

### 9.4 Gráfico

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>using StatsPlots, Statistics

a = [20, 21, 19, 22, 20]
b = [18, 17, 20, 16, 19]
c = [23, 22, 21, 24, 25]
nomes = ["A", "B", "C"]
medias = mean.([a, b, c])

p = boxplot(fill("A", 5), a, label = "", fillalpha = 0.5,
            title = "Rendimento por fertilizante", xlabel = "Fertilizante",
            ylabel = "Rendimento (kg)", size = (650, 420))
boxplot!(p, fill("B", 5), b, label = "", fillalpha = 0.5)
boxplot!(p, fill("C", 5), c, label = "", fillalpha = 0.5)
dotplot!(p, repeat(nomes, inner = 5), vcat(a, b, c), color = :black, markersize = 4, label = "Observações")
scatter!(p, nomes, medias, color = :crimson, markersize = 7, marker = :diamond, label = "Média do grupo")
hline!(p, [mean(vcat(a, b, c))], ls = :dash, color = :gray, label = "Média geral")

savefig(p, "anova_boxplot.png")</code></pre>
  </div>
</div>

![Boxplots do rendimento dos fertilizantes A, B e C, com os pontos de cada planta, a média de cada grupo marcada por um losango vermelho e a média geral por uma linha tracejada]({{ site.baseurl }}/assets/images/anova_boxplot.png){:style="max-width: 650px; display: block; margin: 1em auto;"}
<div class="image-caption" style="text-align: center;">Figura 4. Rendimento por fertilizante, gerado pelo código acima. C fica acima dos outros dois; A e B se sobrepõem em parte, o que combina com o resultado do teste de Tukey.</div>

---

## 10. ANOVA com Dois Grupos é o Teste t

Com só dois grupos, a ANOVA e o teste t de duas amostras com variâncias iguais são o mesmo teste: vale sempre $F = t^2$, e os p-valores são idênticos. O motivo é que, com dois grupos, a soma de quadrados entre os grupos se reduz a

$$
SQ_{\text{entre}} = \frac{n_1 n_2}{n_1 + n_2}(\bar{x}_1 - \bar{x}_2)^2
$$

e o quadrado médio dentro dos grupos é a variância combinada $s_p^2$ do teste t.

Conferência com os grupos A e B do exemplo:

- variância combinada: $s_p^2 = \frac{(5 - 1) \times 1{,}3 + (5 - 1) \times 2{,}5}{5 + 5 - 2} = \frac{5{,}2 + 10}{8} = \frac{15{,}2}{8} = 1{,}9$;
- $t = \frac{20{,}4 - 18{,}0}{\sqrt{1{,}9 \times (1/5 + 1/5)}} = \frac{2{,}4}{\sqrt{0{,}76}} \approx \frac{2{,}4}{0{,}8718} \approx 2{,}7530$;
- $t^2 = \frac{2{,}4^2}{0{,}76} = \frac{5{,}76}{0{,}76} = \frac{144}{19} \approx 7{,}5789$, que é o F da ANOVA só com A e B;
- p-valor dos dois testes: 0,0249.

A vantagem da ANOVA aparece com três grupos ou mais.

---

## 11. Quando Não Usar e Alternativas

- **Variâncias muito diferentes**, sobretudo com grupos de tamanhos diferentes: o teste F pode errar bastante. Use a **ANOVA de Welch**, que não supõe variâncias iguais (no R, `oneway.test(..., var.equal = FALSE)`).
- **Dados claramente não normais com amostras pequenas** (assimetria forte, valores atípicos): use o teste de **Kruskal-Wallis**, que compara os postos em vez dos valores. No exemplo, `KruskalWallisTest(a, b, c)` dá H = 10,49 e p-valor = 0,0053, a mesma conclusão. (O HypothesisTests avisa que, com grupos tão pequenos, o p-valor desse teste é aproximado.) Com amostras grandes, a ANOVA é robusta a desvios moderados da normalidade.
- **Mesmas unidades medidas várias vezes** (os mesmos alunos antes, durante e depois): as observações não são independentes. Use **ANOVA de medidas repetidas** ou modelos mistos.
- **Dois fatores ao mesmo tempo** (fertilizante e tipo de solo): use a **ANOVA de dois fatores**, que também mede a **interação** (quando o efeito de um fator depende do nível do outro).
- **Resposta categórica** (sim/não, categorias): a ANOVA compara médias de uma variável numérica; para proporções e tabelas, use o teste qui-quadrado.

### Efeitos fixos, aleatórios e mistos

- **Efeitos fixos**: os níveis do fator são exatamente os que interessam (os três fertilizantes A, B e C). As conclusões valem para esses níveis. É o caso desta página.
- **Efeitos aleatórios**: os níveis são uma amostra de um conjunto maior (lotes sorteados de uma produção). O interesse é a variância entre os níveis em geral, não cada nível.
- **Modelos mistos**: têm os dois tipos de fator (tratamentos fixos aplicados em blocos ou locais sorteados).

A conta da tabela ANOVA de um fator é a mesma nos casos fixo e aleatório; o que muda é a hipótese testada e a interpretação.

---

## 12. Um Pouco de História

A palavra *variance* (variância), como o quadrado do desvio padrão, aparece no artigo de Ronald A. Fisher de 1918 sobre a correlação entre parentes sob a herança mendeliana, que decompõe a variância de características herdadas em partes atribuídas a causas diferentes. Em 1925, no livro *Statistical Methods for Research Workers*, Fisher apresentou a análise de variância a pesquisadores de outras áreas, nos capítulos VII e VIII, com aplicações a experimentos agrícolas.

---

## 13. Resumo

- A ANOVA de um fator testa $H_0$: todas as médias são iguais, contra $H_1$: pelo menos uma é diferente.
- Ela decompõe a variação: $SQ_{\text{total}} = SQ_{\text{entre}} + SQ_{\text{dentro}}$, e compara as partes com $F = QM_{\text{entre}} / QM_{\text{dentro}}$, que sob $H_0$ segue uma F com $(k - 1, N - k)$ graus de liberdade.
- Pressupostos: independência, normalidade dos resíduos e variâncias iguais.
- No exemplo: F = 14,89, p-valor = 0,00056, $\eta^2 = 0{,}71$; pelo Tukey, C difere de A e de B, e A × B não é significativo a 5%.
- Rejeitar $H_0$ não diz qual grupo difere (use Tukey) nem o tamanho da diferença (use as diferenças em unidades e o $\eta^2$).
- Com dois grupos, ANOVA e teste t são o mesmo teste ($F = t^2$).

---

## Referências

1. Fisher, R. A. (1918). The Correlation between Relatives on the Supposition of Mendelian Inheritance. *Transactions of the Royal Society of Edinburgh*, 52(2), 399–433. DOI: [10.1017/S0080456800012163](https://doi.org/10.1017/S0080456800012163).
2. Fisher, R. A. (1925). *Statistical Methods for Research Workers*. Oliver and Boyd.
3. Triola, M. F. (2024). *Introdução à Estatística*. 14. ed. LTC.
4. Zar, J. H. (2010). *Biostatistical Analysis*. 5th ed. Pearson Prentice Hall. Capítulos 10 (análise de variância) e 11 (comparações múltiplas).
