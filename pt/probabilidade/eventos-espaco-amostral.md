---
layout: page
title: Eventos e Espaço Amostral
lang: pt
ref: eventos-espaco-amostral
parent: probabilidade
permalink: /pt/probabilidade/eventos-espaco-amostral
order: 4
mathjax: true
description: "Espaço amostral, eventos, união, interseção, complemento e cardinalidade, com exemplos de dados e baralho, exercícios resolvidos e código em Julia."
---

Os conceitos de **Eventos** e **Espaço Amostral** são fundamentais para a teoria da probabilidade. Eles fornecem a estrutura básica para entender e calcular probabilidades em diversos contextos.

<div style="border-left: 4px solid #4CAF50; padding: 0.5em; background-color: #e8f5e9;">
  <strong>🎲 Importante:</strong><br>
  O <strong>espaço amostral</strong> é o conjunto de todos os possíveis resultados de um experimento aleatório.<br>
  Um <strong>evento</strong> é qualquer subconjunto do espaço amostral.
</div>

## 1. Espaço Amostral

### 1.1 Definição Formal

O espaço amostral, geralmente denotado por $\Omega$ (ômega) ou $S$, é o conjunto que contém todos os possíveis resultados de um experimento aleatório.

**Exemplos:**
- Lançamento de uma moeda: $\Omega = \\{\text{cara}, \text{coroa}\\}$
- Lançamento de um dado: $\Omega = \\{1, 2, 3, 4, 5, 6\\}$
- Extração de uma carta de um baralho: $\Omega$ = as 52 cartas

### 1.2 Tipos de Espaço Amostral

1. **Discreto**
   - Número finito ou infinito enumerável (que pode ser listado: 1, 2, 3, …) de elementos
   - Exemplo: resultados de um dado

2. **Contínuo**
   - Um intervalo de números reais, com infinitos elementos que não podem ser listados
   - Exemplo: temperatura em um dia

### 1.3 Representação Visual

O gráfico à esquerda mostra o espaço amostral do dado, com a probabilidade de cada resultado; o da direita, um espaço amostral contínuo (um intervalo de temperaturas), com uma curva de densidade apenas ilustrativa.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Distributions, Plots
using Measures

# Espaço amostral discreto: Ω = {1, 2, 3, 4, 5, 6}, cada face com probabilidade 1/6
faces = 1:6
p1 = bar(faces, fill(1 / 6, 6);
    title = "Espaço amostral discreto\nΩ = {1, 2, 3, 4, 5, 6}",
    xlabel = "Resultado do dado", ylabel = "Probabilidade",
    xticks = faces, ylims = (0, 0.25), label = "",
    yformatter = y -&gt; replace(string(round(y, digits = 2)), "." =&gt; ","),
    color = :royalblue, alpha = 0.7, lw = 0)

# Espaço amostral contínuo: um intervalo de temperaturas.
# A curva (normal com média 25 °C e desvio padrão 5 °C) é só ilustrativa.
temperatura = Normal(25, 5)
x = 5:0.1:45
p2 = plot(x, pdf.(temperatura, x);
    title = "Espaço amostral contínuo\n(temperatura do dia, ilustrativo)",
    xlabel = "Temperatura (°C)", ylabel = "Densidade", label = "",
    yformatter = y -&gt; replace(string(round(y, digits = 3)), "." =&gt; ","),
    color = :darkorange, lw = 2, fillrange = 0, fillalpha = 0.3)

plot(p1, p2; layout = (1, 2), size = (1000, 400), margin = 8mm)
savefig("espaco_amostral.png")</code></pre>
  </div>
</div>

![À esquerda, seis barras iguais de altura 1/6 para as faces de 1 a 6 de um dado; à direita, uma curva de densidade em forma de sino sobre temperaturas de 5 a 45 °C]({{ site.baseurl }}/assets/images/espaco_amostral.png)
<div class="image-caption">Figura 1: Espaço amostral discreto (as seis faces de um dado, cada uma com probabilidade 1/6) e contínuo (um intervalo de temperaturas, com densidade ilustrativa).</div>

## 2. Eventos

### 2.1 Definição Formal

Um evento $A$ é qualquer subconjunto do espaço amostral $\Omega$. Em termos matemáticos:

$$A \subseteq \Omega$$

Dizemos que o evento $A$ **ocorreu** quando o resultado do experimento é um elemento de $A$.

### 2.2 Tipos de Eventos

1. **Evento Simples**
   - Contém apenas um elemento do espaço amostral
   - Exemplo: $\\{6\\}$ no lançamento de um dado

2. **Evento Composto**
   - Contém mais de um elemento do espaço amostral
   - Exemplo: $\\{2, 4, 6\\}$ (números pares no dado)

3. **Evento Impossível ($\emptyset$)**
   - Não contém elementos
   - Probabilidade = 0

4. **Evento Certo ($\Omega$)**
   - Contém todos os elementos do espaço amostral
   - Probabilidade = 1

### 2.3 Operações com Eventos

Sejam $A$ e $B$ eventos do mesmo espaço amostral:

1. **União ($A \cup B$)**
   - Ocorre quando ocorre $A$ **ou** $B$ (ou os dois)
   - Exemplo: no dado, "par ou maior que 4" $= \\{2, 4, 6\\} \cup \\{5, 6\\} = \\{2, 4, 5, 6\\}$

2. **Interseção ($A \cap B$)**
   - Ocorre quando ocorrem $A$ **e** $B$ ao mesmo tempo
   - Exemplo: no dado, "par e maior que 4" $= \\{2, 4, 6\\} \cap \\{5, 6\\} = \\{6\\}$

3. **Complemento ($A^c$)**
   - Ocorre quando $A$ **não** ocorre
   - $A^c = \Omega \setminus A$ (os elementos de $\Omega$ que não estão em $A$)
   - Exemplo: no dado, o complemento de "par" é $\\{1, 3, 5\\}$

Dois eventos são **mutuamente exclusivos** quando não podem ocorrer juntos, isto é, quando $A \cap B = \emptyset$.

### 2.4 Visualização de Operações

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Plots

# Círculo de raio r centrado em (h, k)
function circulo(h, k, r)
    θ = range(0, 2π, length = 100)
    Shape(h .+ r .* cos.(θ), k .+ r .* sin.(θ))
end

# A ∩ B: o arco de A que fica dentro de B, seguido do arco de B dentro de A
θa = range(-π/3, π/3, length = 50)
θb = range(2π/3, 4π/3, length = 50)
lente = Shape(vcat(cos.(θa), 1 .+ cos.(θb)), vcat(sin.(θa), sin.(θb)))

omega = Shape([-1.5, 2.5, 2.5, -1.5], [-1.5, -1.5, 1.5, 1.5])
eixos = (xlims = (-1.5, 2.5), ylims = (-1.5, 1.5), aspect_ratio = :equal,
         framestyle = :box, ticks = false, grid = false, legend = false)

# União: tudo o que está em A ou em B
p1 = plot(omega; color = :white, linecolor = :gray, title = "União (A ∪ B)", eixos...)
plot!(p1, circulo(0, 0, 1); color = :royalblue, alpha = 0.5, linecolor = :black)
plot!(p1, circulo(1, 0, 1); color = :royalblue, alpha = 0.5, linecolor = :black)

# Interseção: só a parte comum
p2 = plot(omega; color = :white, linecolor = :gray, title = "Interseção (A ∩ B)", eixos...)
plot!(p2, lente; color = :royalblue, alpha = 0.7, linewidth = 0)
plot!(p2, circulo(0, 0, 1); fillalpha = 0, linecolor = :black)
plot!(p2, circulo(1, 0, 1); fillalpha = 0, linecolor = :black)

# Complemento: tudo em Ω que não está em A
p3 = plot(omega; color = :royalblue, alpha = 0.5, linecolor = :gray, title = "Complemento (Aᶜ)", eixos...)
plot!(p3, circulo(0, 0, 1); color = :white, linecolor = :black)

# Rótulos dos conjuntos (no complemento só aparece A)
for p in (p1, p2)
    annotate!(p, [(-0.4, 0.0, text("A", 12)), (1.4, 0.0, text("B", 12)), (-1.25, 1.25, text("Ω", 12))])
end
annotate!(p3, [(-0.4, 0.0, text("A", 12)), (-1.25, 1.25, text("Ω", 12))])

plot(p1, p2, p3; layout = (1, 3), size = (900, 320))
savefig("operacoes_eventos.png")</code></pre>
  </div>
</div>

![Três diagramas de Venn: a união de A e B com os dois círculos pintados, a interseção com só a parte comum pintada, e o complemento de A com tudo pintado menos o círculo A]({{ site.baseurl }}/assets/images/operacoes_eventos.png)
<div class="image-caption">Figura 2: Diagramas de Venn das operações com eventos. A área pintada é o evento resultante: A ∪ B, A ∩ B e Aᶜ.</div>

## 3. Cardinalidade

A cardinalidade de um conjunto finito, denotada por $\text{card}(A)$ ou $n(A)$, é o número de elementos desse conjunto. Este conceito é fundamental para o cálculo de probabilidades em espaços amostrais finitos.

### 3.1 Definição e Notação

Seja $A$ um conjunto finito:
- Cardinalidade de $A$: $\text{card}(A)$ ou $n(A)$
- Cardinalidade do espaço amostral: $\text{card}(\Omega)$
- Cardinalidade do conjunto vazio: $\text{card}(\emptyset) = 0$

Para conjuntos finitos, a cardinalidade é um número natural:

$$\text{card}(A) \in \{0, 1, 2, \ldots\}$$

### 3.2 Propriedades

Nas propriedades abaixo, $A$, $B$ e $C$ são eventos finitos.

1. **Cardinalidade da União**

   Para dois eventos:

   $$\text{card}(A \cup B) = \text{card}(A) + \text{card}(B) - \text{card}(A \cap B)$$

   Subtraímos $\text{card}(A \cap B)$ porque os elementos que estão nos dois eventos foram contados duas vezes.

   Para três eventos:

   $$\begin{align*}
   \text{card}(A \cup B \cup C) &= \text{card}(A) + \text{card}(B) + \text{card}(C) \\
   &- \text{card}(A \cap B) - \text{card}(B \cap C) - \text{card}(A \cap C) \\
   &+ \text{card}(A \cap B \cap C)
   \end{align*}$$

2. **Cardinalidade do Complemento**

   Para um evento $A \subseteq \Omega$, com $\Omega$ finito:

   $$\text{card}(A^c) = \text{card}(\Omega) - \text{card}(A)$$

3. **Propriedades Básicas**
   - Se $A \subseteq B$, então $\text{card}(A) \leq \text{card}(B)$
   - $\text{card}(A \cap B) \leq \min(\text{card}(A), \text{card}(B))$
   - $\text{card}(A \cup B) \leq \text{card}(A) + \text{card}(B)$

### 3.3 Exemplos Práticos

1. **Lançamento de um Dado**
   - $\text{card}(\Omega) = 6$ (faces do dado)
   - Seja $P = \\{x \in \Omega : x \text{ é par}\\}$, então $\text{card}(P) = 3$ (faces 2, 4, 6)
   - Seja $M = \\{x \in \Omega : x > 4\\}$, então $\text{card}(M) = 2$ (faces 5, 6)
   - $\text{card}(P \cap M) = 1$ (face 6)
   - $\text{card}(P \cup M) = \text{card}(P) + \text{card}(M) - \text{card}(P \cap M) = 3 + 2 - 1 = 4$ (faces 2, 4, 5, 6)

2. **Baralho de 52 Cartas**
   - $\text{card}(\Omega) = 52$ (total de cartas)
   - Seja $C$ = cartas de copas; então $\text{card}(C) = 13$
   - Seja $V$ = cartas vermelhas (copas e ouros); então $\text{card}(V) = 26$
   - Seja $F$ = figuras (valete, dama e rei de cada naipe); então $\text{card}(F) = 12$
   - $\text{card}(C \cap F) = 3$ (valete, dama e rei de copas)

### 3.4 Aplicação em Probabilidade

Em um espaço amostral **finito e equiprovável** (todos os resultados com a mesma probabilidade), a probabilidade de um evento $A$ é:

$$P(A) = \frac{\text{card}(A)}{\text{card}(\Omega)}$$

Para eventos $A$ e $B$, usando a cardinalidade da união:

$$P(A \cup B) = \frac{\text{card}(A \cup B)}{\text{card}(\Omega)} = \frac{\text{card}(A) + \text{card}(B) - \text{card}(A \cap B)}{\text{card}(\Omega)}$$

**Exemplo: dois dados.** Lançam-se dois dados honestos. Sejam $A$ = "a soma é 7" e $B$ = "o primeiro dado é maior que 4".

**Dados:** cada resultado é um par (primeiro dado, segundo dado), e os $6 \cdot 6 = 36$ pares são igualmente prováveis.

**Contagem**, um evento por vez:
- $A = \\{(1,6), (2,5), (3,4), (4,3), (5,2), (6,1)\\}$, então $\text{card}(A) = 6$
- $B$: o primeiro dado é 5 ou 6 (2 opções) e o segundo é qualquer um (6 opções), então $\text{card}(B) = 2 \cdot 6 = 12$
- $A \cap B = \\{(5,2), (6,1)\\}$, então $\text{card}(A \cap B) = 2$

**Substituição e conta:**

$$\text{card}(A \cup B) = 6 + 12 - 2 = 16$$

$$P(A \cup B) = \frac{16}{36} = \frac{4}{9} \approx 0{,}4444$$

**Interpretação:** em cerca de 44% dos lançamentos de dois dados, a soma é 7 ou o primeiro dado mostra 5 ou 6 (ou as duas coisas).

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code># Lançamento de dois dados: cada resultado é um par (primeiro dado, segundo dado)
Ω = [(i, j) for i in 1:6 for j in 1:6]

A = filter(x -&gt; sum(x) == 7, Ω)    # evento A: soma igual a 7
B = filter(x -&gt; x[1] &gt; 4, Ω)       # evento B: primeiro dado maior que 4

println("card(Ω) = ", length(Ω))
println("card(A) = ", length(A), "   A = ", A)
println("card(B) = ", length(B))
println("card(A ∩ B) = ", length(intersect(A, B)), "   A ∩ B = ", intersect(A, B))
println("card(A ∪ B) = ", length(union(A, B)))

# Espaço equiprovável: P(E) = card(E) / card(Ω), em frações exatas
P(E) = length(E) // length(Ω)
println("P(A) = ", P(A), "   P(B) = ", P(B), "   P(A ∪ B) = ", P(union(A, B)))</code></pre>
  </div>
</div>

#### Saída esperada:
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>card(Ω) = 36</div>
  <div>card(A) = 6   A = [(1, 6), (2, 5), (3, 4), (4, 3), (5, 2), (6, 1)]</div>
  <div>card(B) = 12</div>
  <div>card(A ∩ B) = 2   A ∩ B = [(5, 2), (6, 1)]</div>
  <div>card(A ∪ B) = 16</div>
  <div>P(A) = 1//6   P(B) = 1//3   P(A ∪ B) = 4//9</div>
</div>

## 4. Propriedades e Relações

### 4.1 Propriedades da União e Interseção

Para quaisquer eventos $A$, $B$ e $C$:

1. **Comutativa**

   $$A \cup B = B \cup A \qquad A \cap B = B \cap A$$

2. **Associativa**

   $$(A \cup B) \cup C = A \cup (B \cup C) \qquad (A \cap B) \cap C = A \cap (B \cap C)$$

3. **Distributiva**

   $$A \cup (B \cap C) = (A \cup B) \cap (A \cup C) \qquad A \cap (B \cup C) = (A \cap B) \cup (A \cap C)$$

### 4.2 Leis de De Morgan

$$(A \cup B)^c = A^c \cap B^c \qquad (A \cap B)^c = A^c \cup B^c$$

Em palavras: "não ocorrer A ou B" é o mesmo que "não ocorrer A e não ocorrer B"; "não ocorrerem A e B juntos" é o mesmo que "não ocorrer A ou não ocorrer B".

**Exemplo no dado**, com $P = \\{2, 4, 6\\}$ e $M = \\{5, 6\\}$: $(P \cup M)^c = \\{2, 4, 5, 6\\}^c = \\{1, 3\\}$, e $P^c \cap M^c = \\{1, 3, 5\\} \cap \\{1, 2, 3, 4\\} = \\{1, 3\\}$. Os dois lados dão o mesmo conjunto.

## 5. Aplicações Práticas

### 5.1 Análise de Dados

Com dados de uma tabela, a probabilidade de um evento é estimada pela proporção de linhas em que ele ocorre. No exemplo abaixo, com números ilustrativos, 100 estudantes responderam se tiram nota alta (evento $A$) e se estudam muito (evento $B$): 30 responderam sim às duas perguntas, 10 só à primeira, 20 só à segunda e 40 a nenhuma.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>using DataFrames, Statistics

# Pesquisa com 100 estudantes (números ilustrativos):
# 30 tiram nota alta e estudam muito, 10 só tiram nota alta,
# 20 só estudam muito e 40 nenhuma das duas coisas.
nota_alta    = vcat(fill(true, 30), fill(true, 10), fill(false, 20), fill(false, 40))
estuda_muito = vcat(fill(true, 30), fill(false, 10), fill(true, 20), fill(false, 40))
df = DataFrame(nota_alta = nota_alta, estuda_muito = estuda_muito)

# Proporção de linhas em que o evento ocorre
p_A  = mean(df.nota_alta)
p_B  = mean(df.estuda_muito)
p_AB = mean(df.nota_alta .&amp; df.estuda_muito)      # interseção: os dois
p_AuB = mean(df.nota_alta .| df.estuda_muito)     # união: pelo menos um
p_nenhum = mean(.!df.nota_alta .&amp; .!df.estuda_muito)

arred(x) = round(x, digits = 2)   # evita resíduos de ponto flutuante na saída
println("P(A) = ", arred(p_A), "   P(B) = ", arred(p_B), "   P(A ∩ B) = ", arred(p_AB))
println("P(A ∪ B) = ", arred(p_AuB), "   pela fórmula: ", arred(p_A + p_B - p_AB))
println("P(Aᶜ ∩ Bᶜ) = ", arred(p_nenhum), "   = 1 − P(A ∪ B) = ", arred(1 - p_AuB))</code></pre>
  </div>
</div>

#### Saída esperada:
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>P(A) = 0.4   P(B) = 0.5   P(A ∩ B) = 0.3</div>
  <div>P(A ∪ B) = 0.6   pela fórmula: 0.6</div>
  <div>P(Aᶜ ∩ Bᶜ) = 0.4   = 1 − P(A ∪ B) = 0.4</div>
</div>

**Interpretação:** 60% dos estudantes tiram nota alta ou estudam muito, e os outros 40% não fazem nenhuma das duas coisas, como a lei de De Morgan prevê ($A^c \cap B^c = (A \cup B)^c$). Esses números descrevem o grupo pesquisado; eles não dizem que estudar **causa** nota alta.

### 5.2 Exemplos do Mundo Real

1. **Controle de Qualidade**
   - $\Omega$ = produtos fabricados num dia
   - $A$ = produtos defeituosos; $A^c$ = produtos sem defeito

2. **Medicina**
   - $\Omega$ = pacientes atendidos num hospital
   - $A$ = pacientes com um sintoma; $B$ = pacientes com uma condição
   - $A \cap B$ = pacientes com o sintoma e a condição

3. **Finanças**
   - $\Omega$ = possíveis retornos de um investimento
   - $A$ = retornos positivos; $B$ = retornos acima de um índice de referência

## 6. Exercícios Práticos

1. **Lançamento de Dois Dados.** Descreva o espaço amostral, identifique o evento "soma igual a 7" e calcule a sua probabilidade.

   *Resposta:* $\Omega$ tem os 36 pares $(i, j)$, com $i, j \in \\{1, \ldots, 6\\}$; o evento é $\\{(1,6), (2,5), (3,4), (4,3), (5,2), (6,1)\\}$, com 6 elementos; a probabilidade é $\frac{6}{36} = \frac{1}{6} \approx 0{,}1667$.

2. **Cartas de Baralho.** Quantas cartas tem o evento "tirar uma figura"? Qual é a probabilidade de tirar um ás ou uma carta de copas?

   *Resposta:* as figuras são valete, dama e rei de cada um dos 4 naipes: $3 \cdot 4 = 12$ cartas. Sejam $E$ = ases (4 cartas) e $C$ = copas (13 cartas); $E \cap C$ = ás de copas (1 carta). Então $\text{card}(E \cup C) = 4 + 13 - 1 = 16$ e

   $$P(E \cup C) = \frac{16}{52} = \frac{4}{13} \approx 0{,}3077$$

## Referências

1. Bussab, W. O.; Morettin, P. A. (2023). *Estatística Básica*. 10. ed. Saraiva Uni.
2. Ross, S. M. (2012). *A First Course in Probability*. 9th ed. Pearson.
