---
layout: page
title: Probabilidade Condicional
lang: pt
ref: probabilidade-condicional
parent: probabilidade
permalink: /pt/probabilidade/probabilidade-condicional
order: 6
mathjax: true
description: "Probabilidade condicional, regra da multiplicação, lei da probabilidade total e Teorema de Bayes, com exemplos resolvidos passo a passo e código em Julia."
---

A **probabilidade condicional** é a probabilidade de um evento quando já se sabe que outro evento ocorreu. Saber alguma coisa muda as chances: a probabilidade de chover é uma; a probabilidade de chover sabendo que o céu está carregado é outra. Esta página mostra como calcular essa probabilidade, como ela leva à regra da multiplicação, à lei da probabilidade total e ao Teorema de Bayes, e onde é fácil errar.

<div style="border-left: 4px solid #4CAF50; padding: 0.5em; background-color: #e8f5e9;">
  <strong>🎯 Importante:</strong><br>
  A probabilidade condicional de $A$ dado $B$ é escrita $P(A \mid B)$ (lê-se "probabilidade de A dado B") e, quando $P(B) > 0$, vale:
  $$P(A \mid B) = \frac{P(A \cap B)}{P(B)}$$
</div>

## 1. A ideia

Lance um dado honesto. A probabilidade de sair 6 é $\frac{1}{6}$, porque o 6 é um dos 6 resultados igualmente prováveis.

Agora suponha que alguém olhou o dado e contou só que **saiu um número par**. Os resultados possíveis passam a ser apenas 2, 4 e 6, e eles continuam igualmente prováveis entre si. O 6 é um desses 3, então a probabilidade de ter saído 6, **sabendo que saiu par**, é $\frac{1}{3}$.

A informação "saiu par" fez duas coisas:

- **encolheu o espaço amostral**, de $\\{1, 2, 3, 4, 5, 6\\}$ para $\\{2, 4, 6\\}$;
- **mudou a probabilidade** de "sair 6", de $\frac{1}{6}$ para $\frac{1}{3}$.

A probabilidade condicional é exatamente isso: recalcular as chances dentro do pedaço do espaço amostral que a informação deixou de pé.

## 2. Definição

Sejam $A$ e $B$ dois eventos, com $P(B) > 0$. A **probabilidade condicional de $A$ dado $B$** é:

$$P(A \mid B) = \frac{P(A \cap B)}{P(B)}$$

onde:

- $P(A \cap B)$ é a probabilidade de $A$ **e** $B$ ocorrerem juntos;
- $P(B)$ é a probabilidade do evento que se sabe que ocorreu (o **evento condicionante**).

A fórmula diz: dentre as vezes em que $B$ ocorre, em que fração delas $A$ também ocorre?

A condição $P(B) > 0$ é necessária por dois motivos: não se divide por zero, e não faz sentido "saber que ocorreu" um evento que não pode ocorrer.

No exemplo do dado, com $A$ = "sair 6" e $B$ = "sair par": $A \cap B = \\{6\\}$, então $P(A \cap B) = \frac{1}{6}$ e $P(B) = \frac{3}{6}$. Pela fórmula, $P(A \mid B) = \frac{1/6}{3/6} = \frac{1}{3}$, o mesmo valor obtido contando.

### 2.1 Exemplo resolvido: um ás, sabendo que a carta é vermelha

Uma carta é tirada ao acaso de um baralho comum de 52 cartas. Sabe-se que ela é vermelha (copas ou ouros). Qual é a probabilidade de ser um ás?

**Dados** (do enunciado e da composição do baralho):

- $A$ = "a carta é um ás"; há 4 ases;
- $B$ = "a carta é vermelha"; há 26 cartas vermelhas, então $P(B) = \frac{26}{52}$;
- $A \cap B$ = "a carta é um ás vermelho"; há 2 (ás de copas e ás de ouros), então $P(A \cap B) = \frac{2}{52}$.

**Fórmula:**

$$P(A \mid B) = \frac{P(A \cap B)}{P(B)}$$

**Substituição:**

$$P(A \mid B) = \frac{2/52}{26/52}$$

**Conta:** os dois denominadores 52 se cancelam.

$$P(A \mid B) = \frac{2}{26} = \frac{1}{13} \approx 0{,}0769$$

**Interpretação:** entre as cartas vermelhas, cerca de 7,69% são ases (2 em 26). Repare que $P(A) = \frac{4}{52} = \frac{1}{13}$ também: saber que a carta é vermelha **não mudou** a chance de ser um ás. Quando isso acontece, os eventos são independentes (seção 5).

### 2.2 Interpretação geométrica

Num diagrama de Venn, condicionar a $B$ é jogar fora tudo o que está fora de $B$. O que sobra de $A$ é a parte $A \cap B$, e a probabilidade condicional é a fração que essa parte ocupa dentro de $B$.

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

# Pontos de um círculo de centro (h, k) e raio r
function circulo(h, k, r; n=400)
    θ = range(0, 2π, length=n)
    return h .+ r .* cos.(θ), k .+ r .* sin.(θ)
end

# A interseção (a "lente") é formada pelo arco de A que fica dentro de B
# e pelo arco de B que fica dentro de A
function lente(cA, cB, r; n=2000)
    xa, ya = circulo(cA..., r; n=n)
    xb, yb = circulo(cB..., r; n=n)
    dentroB = @. (xa - cB[1])^2 + (ya - cB[2])^2 &lt;= r^2
    dentroA = @. (xb - cA[1])^2 + (yb - cA[2])^2 &lt;= r^2
    x = [xa[dentroB]; xb[dentroA]]
    y = [ya[dentroB]; yb[dentroA]]
    ordem = sortperm(atan.(y .- 0, x .- 0))   # ordena os pontos em volta do centro da lente
    return x[ordem], y[ordem]
end

cA, cB, r = (-0.45, 0.0), (0.45, 0.0), 0.8
omega = Shape([-1.6, 1.6, 1.6, -1.6], [-1.15, -1.15, 1.15, 1.15])
opcoes = (xlims=(-1.7, 1.7), ylims=(-1.25, 1.25), aspect_ratio=:equal,
          axis=false, grid=false, legend=false)

# Painel 1: o espaço amostral inteiro, com A e B
p1 = plot(omega; color=:lightgray, alpha=0.4, linecolor=:gray, opcoes...,
          title="Antes: o espaço amostral é Ω")
plot!(p1, Shape(circulo(cA..., r)...); color=:steelblue, alpha=0.45, linecolor=:steelblue)
plot!(p1, Shape(circulo(cB..., r)...); color=:darkorange, alpha=0.45, linecolor=:darkorange)
annotate!(p1, [(-0.85, 0.0, text("A", 14)), (0.85, 0.0, text("B", 14)),
               (-1.4, 0.95, text("Ω", 14))])

# Painel 2: sabendo que B ocorreu, só B importa; A ∩ B é a parte de A que sobra
p2 = plot(omega; color=:white, linecolor=:lightgray, linestyle=:dash, opcoes...,
          title="Depois de saber que B ocorreu")
plot!(p2, Shape(circulo(cA..., r)...); fillalpha=0, linecolor=:gray, linestyle=:dash)
plot!(p2, Shape(circulo(cB..., r)...); color=:darkorange, alpha=0.30, linecolor=:darkorange, linewidth=2)
plot!(p2, Shape(lente(cA, cB, r)...); color=:purple, alpha=0.55, linecolor=:purple)
annotate!(p2, [(0.0, 0.0, text("A ∩ B", 11, :white)), (0.85, 0.0, text("B", 14)),
               (0.0, -1.0, text("P(A | B) = área de A ∩ B ÷ área de B", 11))])

fig = plot(p1, p2; layout=(1, 2), size=(900, 360), titlefontsize=12)
savefig(fig, "prob_condicional.png")</code></pre>
  </div>
</div>

![À esquerda, um retângulo cinza (o espaço amostral) com dois círculos que se sobrepõem, A em azul e B em laranja; à direita, só o círculo B fica colorido, com a parte comum A ∩ B destacada em roxo e o contorno de A tracejado]({{ site.baseurl }}/assets/images/prob_condicional.png)
<div class="image-caption">Figura 1: Antes da informação, as chances se medem em todo o espaço amostral Ω (à esquerda). Depois de saber que B ocorreu, só B importa (à direita): P(A | B) é a fração de B ocupada por A ∩ B.</div>

## 3. Propriedades

Fixado um evento $B$ com $P(B) > 0$, a probabilidade condicional $P(\cdot \mid B)$ é, ela mesma, uma probabilidade. Por isso valem as mesmas regras de sempre:

1. **Fica entre 0 e 1:** $0 \leq P(A \mid B) \leq 1$.
2. **O evento certo tem probabilidade 1:** $P(\Omega \mid B) = 1$; e também $P(B \mid B) = 1$.
3. **Aditividade:** se $A_1$ e $A_2$ são mutuamente exclusivos ($A_1 \cap A_2 = \emptyset$), então $P(A_1 \cup A_2 \mid B) = P(A_1 \mid B) + P(A_2 \mid B)$.
4. **Complemento:** $P(A^c \mid B) = 1 - P(A \mid B)$, onde $A^c$ é o complemento de $A$ ("$A$ não ocorre").

**Cuidado: a ordem importa.** Em geral $P(A \mid B) \neq P(B \mid A)$. No baralho, com $A$ = "ás" e $B$ = "vermelha":

- $P(A \mid B) = \frac{2}{26} = \frac{1}{13} \approx 0{,}0769$: entre as vermelhas, poucas são ases;
- $P(B \mid A) = \frac{2}{4} = \frac{1}{2} = 0{,}5$: entre os ases, metade é vermelha.

As duas perguntas têm o mesmo numerador, $P(A \cap B) = \frac{2}{52}$, mas dividem por eventos diferentes. O Teorema de Bayes (seção 7) é a regra que liga uma à outra.

## 4. Regra da multiplicação

Multiplicando os dois lados da definição por $P(B)$, a probabilidade de dois eventos ocorrerem juntos fica:

$$P(A \cap B) = P(B) \cdot P(A \mid B) = P(A) \cdot P(B \mid A)$$

(a primeira forma usa $P(B) > 0$ e a segunda, $P(A) > 0$, para que as condicionais estejam definidas).

A regra é útil quando o experimento acontece em etapas: a probabilidade da primeira etapa vezes a probabilidade da segunda, **sabendo o que aconteceu na primeira**.

**Exemplo: dois ases sem reposição.** Tiram-se duas cartas de um baralho de 52, uma depois da outra, sem devolver a primeira. Qual é a probabilidade de as duas serem ases?

**Dados:**

- $A_1$ = "a 1ª carta é ás": há 4 ases em 52 cartas, então $P(A_1) = \frac{4}{52}$;
- $A_2$ = "a 2ª carta é ás": se a 1ª foi ás, sobram 3 ases em 51 cartas, então $P(A_2 \mid A_1) = \frac{3}{51}$.

**Fórmula e substituição:**

$$P(A_1 \cap A_2) = P(A_1) \cdot P(A_2 \mid A_1) = \frac{4}{52} \cdot \frac{3}{51}$$

**Conta:**

$$\frac{4}{52} \cdot \frac{3}{51} = \frac{4 \cdot 3}{52 \cdot 51} = \frac{12}{2652} = \frac{1}{221} \approx 0{,}0045$$

**Interpretação:** em média, as duas primeiras cartas são ases em cerca de 1 a cada 221 repetições do experimento. Não é o mesmo que $\frac{4}{52} \cdot \frac{4}{52} = \frac{1}{169}$: sem reposição, a 1ª carta muda a composição do baralho, e a 2ª retirada **depende** da 1ª. A página [Eventos Independentes]({{ '/pt/probabilidade/eventos-independentes' | relative_url }}) compara os dois casos.

## 5. Independência

Dois eventos $A$ e $B$ são **independentes** quando:

$$P(A \cap B) = P(A) \cdot P(B)$$

Se $P(B) > 0$, isso é o mesmo que dizer $P(A \mid B) = P(A)$: saber que $B$ ocorreu não muda a probabilidade de $A$. (Basta dividir os dois lados por $P(B)$.) A definição pelo produto tem a vantagem de valer mesmo quando $P(B) = 0$ e de ser simétrica em $A$ e $B$.

**Exemplo 1 (independentes).** No baralho, "ás" e "vermelha": $P(\text{ás} \cap \text{vermelha}) = \frac{2}{52} = \frac{1}{26}$ e $P(\text{ás}) \cdot P(\text{vermelha}) = \frac{1}{13} \cdot \frac{1}{2} = \frac{1}{26}$. Os dois lados são iguais, então os eventos são independentes, como já se tinha visto na seção 2.1.

**Exemplo 2 (dependentes).** Lançam-se dois dados. Seja $T$ = "o primeiro dado deu 3".

- Com $S_8$ = "a soma é 8": $P(S_8) = \frac{5}{36}$ (os pares (2,6), (3,5), (4,4), (5,3), (6,2)). Sabendo que o primeiro deu 3, a soma é 8 só se o segundo der 5: $P(S_8 \mid T) = \frac{1}{6} = \frac{6}{36}$. Como $\frac{6}{36} \neq \frac{5}{36}$, $S_8$ e $T$ **não** são independentes.
- Com $S_7$ = "a soma é 7": $P(S_7) = \frac{6}{36} = \frac{1}{6}$, e sabendo que o primeiro deu 3, a soma é 7 só se o segundo der 4: $P(S_7 \mid T) = \frac{1}{6}$. Aqui as duas são iguais, e $S_7$ e $T$ **são** independentes.

Independente não é o mesmo que mutuamente exclusivo. Se $A$ e $B$ são mutuamente exclusivos e têm probabilidade positiva, saber que $B$ ocorreu dá $P(A \mid B) = 0$, o que muda (e muito) a chance de $A$: eles são dependentes.

A simulação abaixo lança dois dados 100.000 vezes e estima as probabilidades pelas proporções observadas, com $A$ = "o primeiro dado é maior que 3" e $B$ = "o segundo dado é par". Os valores exatos são $P(A) = P(A \mid B) = 0{,}5$ e $P(A \cap B) = 0{,}25$.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Random, Statistics

Random.seed!(123)
n = 100_000                    # número de lançamentos simulados
dado1 = rand(1:6, n)
dado2 = rand(1:6, n)

A = dado1 .&gt; 3                 # A: o primeiro dado é maior que 3
B = iseven.(dado2)             # B: o segundo dado é par

P_A = mean(A)                  # proporção de lançamentos em que A ocorreu
P_B = mean(B)
P_AeB = mean(A .&amp; B)
P_A_dado_B = P_AeB / P_B       # P(A | B) = P(A ∩ B) / P(B)

println("P(A)       ≈ ", round(P_A, digits=4), "   (exato: 0.5)")
println("P(A | B)   ≈ ", round(P_A_dado_B, digits=4), "   (exato: 0.5)")
println("P(A ∩ B)   ≈ ", round(P_AeB, digits=4), "   (exato: 0.25)")
println("P(A)·P(B)  ≈ ", round(P_A * P_B, digits=4))</code></pre>
  </div>
</div>

#### Saída esperada:
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>P(A) &nbsp; &nbsp; &nbsp; ≈ 0.5012 &nbsp; (exato: 0.5)</div>
  <div>P(A | B) &nbsp; ≈ 0.5011 &nbsp; (exato: 0.5)</div>
  <div>P(A ∩ B) &nbsp; ≈ 0.251 &nbsp; (exato: 0.25)</div>
  <div>P(A)·P(B) &nbsp;≈ 0.2511</div>
</div>

As estimativas ficam perto dos valores exatos, mas não iguais: são proporções de uma amostra finita, e mudam um pouco com a semente. Com mais lançamentos, elas tendem a ficar mais perto de 0,5 e 0,25.

## 6. Lei da probabilidade total

Às vezes $P(B)$ não é dada diretamente, mas se sabe quanto ela vale em cada um de vários cenários. A lei da probabilidade total junta os cenários.

Os cenários precisam formar uma **partição** do espaço amostral: eventos $A_1, A_2, \ldots, A_n$ tais que

- são **mutuamente exclusivos**: $A_i \cap A_j = \emptyset$ para $i \neq j$ (dois cenários não ocorrem juntos);
- são **exaustivos**: $A_1 \cup A_2 \cup \cdots \cup A_n = \Omega$ (algum cenário sempre ocorre);
- cada um tem $P(A_i) > 0$ (para que $P(B \mid A_i)$ esteja definida).

Então, para qualquer evento $B$:

$$P(B) = \sum_{i=1}^{n} P(B \mid A_i) \, P(A_i) = P(B \mid A_1) P(A_1) + \cdots + P(B \mid A_n) P(A_n)$$

Cada parcela é, pela regra da multiplicação, $P(B \cap A_i)$: a probabilidade de $B$ ocorrer **no cenário $i$**. Como os cenários não se sobrepõem e cobrem tudo, somar as parcelas dá $P(B)$.

**Exemplo: três fábricas** (números ilustrativos). Uma empresa produz a mesma peça em três fábricas. A tabela dá a parte da produção de cada uma e a taxa de peças defeituosas de cada uma.

| Fábrica | Parte da produção $P(A_i)$ | Taxa de defeito $P(B \mid A_i)$ | Parcela $P(B \mid A_i)\,P(A_i)$ |
|---|---|---|---|
| 1 | 0,5 | 0,02 | $0{,}02 \cdot 0{,}5 = 0{,}010$ |
| 2 | 0,3 | 0,03 | $0{,}03 \cdot 0{,}3 = 0{,}009$ |
| 3 | 0,2 | 0,04 | $0{,}04 \cdot 0{,}2 = 0{,}008$ |
| **Total** | **1** | | **0,027** |

Aqui $A_i$ = "a peça veio da fábrica $i$" (as três formam uma partição: toda peça vem de exatamente uma fábrica, e $0{,}5 + 0{,}3 + 0{,}2 = 1$) e $B$ = "a peça é defeituosa".

**Fórmula, substituição e conta:**

$$P(B) = P(B \mid A_1)P(A_1) + P(B \mid A_2)P(A_2) + P(B \mid A_3)P(A_3)$$

$$P(B) = 0{,}02 \cdot 0{,}5 + 0{,}03 \cdot 0{,}3 + 0{,}04 \cdot 0{,}2$$

$$P(B) = 0{,}010 + 0{,}009 + 0{,}008 = 0{,}027$$

**Interpretação:** 2,7% de todas as peças da empresa são defeituosas, ou 27 em cada 1.000. O valor fica entre a menor taxa (2%) e a maior (4%), mais perto da fábrica 1, que produz metade das peças: é uma média das taxas, ponderada pela produção.

## 7. Teorema de Bayes

### 7.1 Fórmula

O Teorema de Bayes responde à pergunta "ao contrário": se se conhece $P(B \mid A)$, quanto vale $P(A \mid B)$?

Pela regra da multiplicação, $P(A \cap B)$ pode ser escrita de dois jeitos:

$$P(A \mid B) \, P(B) = P(A \cap B) = P(B \mid A) \, P(A)$$

Dividindo os dois lados por $P(B)$, que precisa ser maior que zero:

$$P(A \mid B) = \frac{P(B \mid A) \, P(A)}{P(B)}$$

Cada termo tem um nome:

- $P(A)$ é a **probabilidade a priori** de $A$: o que se sabia **antes** de observar $B$;
- $P(B \mid A)$ é a **verossimilhança**: quão provável é observar $B$ se $A$ for o caso;
- $P(B)$ é a **probabilidade total** de observar $B$, em todos os cenários;
- $P(A \mid B)$ é a **probabilidade a posteriori** de $A$: o que se sabe **depois** de observar $B$.

Quando os cenários formam uma partição $A_1, \ldots, A_n$ (seção 6), o denominador sai da lei da probabilidade total:

$$P(A_i \mid B) = \frac{P(B \mid A_i) \, P(A_i)}{\sum_{j=1}^{n} P(B \mid A_j) \, P(A_j)}$$

O numerador é a parcela do cenário $i$; o denominador é a soma de todas as parcelas. Então a posteriori de cada cenário é **a fração que a sua parcela representa no total**, e as posterioris somam 1.

### 7.2 Exemplo: de qual fábrica veio a peça defeituosa?

Continuando o exemplo da seção 6: uma peça é escolhida ao acaso e está defeituosa. Qual é a probabilidade de ela ter vindo da fábrica 2?

**Dados** (da seção 6): $P(B \mid A_2) = 0{,}03$, $P(A_2) = 0{,}3$ e $P(B) = 0{,}027$.

**Fórmula:**

$$P(A_2 \mid B) = \frac{P(B \mid A_2) \, P(A_2)}{P(B)}$$

**Substituição e conta:**

$$P(A_2 \mid B) = \frac{0{,}03 \cdot 0{,}3}{0{,}027} = \frac{0{,}009}{0{,}027} = \frac{1}{3} \approx 0{,}3333$$

Do mesmo jeito, com as parcelas da tabela:

| Fábrica | A priori $P(A_i)$ | Parcela | A posteriori $P(A_i \mid B)$ |
|---|---|---|---|
| 1 | 0,5 | 0,010 | $\frac{0{,}010}{0{,}027} = \frac{10}{27} \approx 0{,}3704$ |
| 2 | 0,3 | 0,009 | $\frac{0{,}009}{0{,}027} = \frac{9}{27} = \frac{1}{3} \approx 0{,}3333$ |
| 3 | 0,2 | 0,008 | $\frac{0{,}008}{0{,}027} = \frac{8}{27} \approx 0{,}2963$ |
| **Total** | **1** | **0,027** | **1** |

**Interpretação:** antes de saber do defeito, a peça tinha 50% de chance de ter vindo da fábrica 1. Sabendo que é defeituosa, essa chance cai para cerca de 37%, e a da fábrica 3 sobe de 20% para cerca de 30%, porque a fábrica 3 tem a maior taxa de defeito. Mesmo assim, a fábrica 1 continua sendo a origem mais provável: ela erra menos, mas produz muito mais peças.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code># Frações exatas (//) para conferir as contas; float() mostra o decimal
P_fabrica = [5//10, 3//10, 2//10]          # P(A₁), P(A₂), P(A₃): parte da produção
P_def_dado_fabrica = [2//100, 3//100, 4//100]  # P(B | Aᵢ): taxa de defeito de cada fábrica

# Lei da probabilidade total: P(B) = Σ P(B | Aᵢ) P(Aᵢ)
P_def = sum(P_def_dado_fabrica .* P_fabrica)

# Teorema de Bayes: P(Aᵢ | B) = P(B | Aᵢ) P(Aᵢ) / P(B)
P_fabrica_dado_def = P_def_dado_fabrica .* P_fabrica ./ P_def

println("P(B) = ", P_def, " = ", float(P_def))
for i in 1:3
    println("P(A", i, " | B) = ", P_fabrica_dado_def[i], " ≈ ",
            round(float(P_fabrica_dado_def[i]), digits=4))
end
println("Soma das posteriores = ", sum(P_fabrica_dado_def))</code></pre>
  </div>
</div>

#### Saída esperada:
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>P(B) = 27//1000 = 0.027</div>
  <div>P(A1 | B) = 10//27 ≈ 0.3704</div>
  <div>P(A2 | B) = 1//3 ≈ 0.3333</div>
  <div>P(A3 | B) = 8//27 ≈ 0.2963</div>
  <div>Soma das posteriores = 1//1</div>
</div>

### 7.3 Exemplo: teste diagnóstico

Os números deste exemplo são **ilustrativos**, escolhidos para a conta ficar simples; não descrevem nenhuma doença ou teste real.

Uma doença atinge 1% de uma população. Um teste dá positivo em 99% das pessoas que têm a doença (a **sensibilidade**) e em 5% das que não têm (os **falsos positivos**). Uma pessoa escolhida ao acaso testa positivo. Qual é a probabilidade de ela ter a doença?

**Dados:**

- $D$ = "a pessoa tem a doença"; $P(D) = 0{,}01$, então $P(D^c) = 1 - 0{,}01 = 0{,}99$;
- $T^+$ = "o teste dá positivo";
- $P(T^+ \mid D) = 0{,}99$ (sensibilidade);
- $P(T^+ \mid D^c) = 0{,}05$ (taxa de falsos positivos).

**Passo 1: probabilidade total de um positivo.** $D$ e $D^c$ formam uma partição (toda pessoa tem ou não tem a doença):

$$P(T^+) = P(T^+ \mid D) \, P(D) + P(T^+ \mid D^c) \, P(D^c)$$

$$P(T^+) = 0{,}99 \cdot 0{,}01 + 0{,}05 \cdot 0{,}99$$

$$P(T^+) = 0{,}0099 + 0{,}0495 = 0{,}0594$$

**Passo 2: Bayes.**

$$P(D \mid T^+) = \frac{P(T^+ \mid D) \, P(D)}{P(T^+)} = \frac{0{,}0099}{0{,}0594} = \frac{1}{6} \approx 0{,}1667$$

**Interpretação:** mesmo com um teste que acerta 99% dos doentes, só cerca de 1 em cada 6 pessoas com resultado positivo tem a doença. Contando pessoas fica mais fácil de ver. Em 10.000 pessoas:

- 1% tem a doença: 100 pessoas, das quais 99% (99 pessoas) testam positivo;
- 99% não tem: 9.900 pessoas, das quais 5% (495 pessoas) testam positivo por engano.

São $99 + 495 = 594$ positivos, e só 99 deles têm a doença: $\frac{99}{594} = \frac{1}{6}$. Os falsos positivos são uma fração pequena dos saudáveis, mas os saudáveis são tantos que os falsos positivos superam os verdadeiros.

O que o resultado **não** diz: que o teste é ruim, ou que um positivo deve ser ignorado. Um positivo elevou a chance de 1% para cerca de 17%; o número depende muito da prevalência na população testada. Esta página explica a matemática e não dá orientação médica: o resultado de um teste real deve ser interpretado por um profissional de saúde.

O código abaixo refaz a conta para três prevalências, com o mesmo teste:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code># P(D | T+) para um teste com sensibilidade 99% e 5% de falsos positivos,
# em três prevalências diferentes (números ilustrativos)
sensibilidade = 0.99      # P(T+ | D)
falso_positivo = 0.05     # P(T+ | Dᶜ)

for prevalencia in (0.001, 0.01, 0.10)                  # P(D)
    P_pos = sensibilidade * prevalencia + falso_positivo * (1 - prevalencia)  # P(T+)
    P_D_dado_pos = sensibilidade * prevalencia / P_pos                          # Bayes
    println("P(D) = ", rpad(prevalencia, 5), "   P(T+) = ", rpad(round(P_pos, digits=5), 7),
            "   P(D | T+) = ", round(P_D_dado_pos, digits=4))
end</code></pre>
  </div>
</div>

#### Saída esperada:
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>P(D) = 0.001 &nbsp; P(T+) = 0.05094 &nbsp; P(D | T+) = 0.0194</div>
  <div>P(D) = 0.01 &nbsp; &nbsp;P(T+) = 0.0594 &nbsp; &nbsp;P(D | T+) = 0.1667</div>
  <div>P(D) = 0.1 &nbsp; &nbsp; P(T+) = 0.144 &nbsp; &nbsp; P(D | T+) = 0.6875</div>
</div>

Com a doença rara (0,1%), um positivo indica a doença em menos de 2% dos casos; com prevalência de 10%, em quase 69%. O mesmo teste dá respostas muito diferentes conforme a probabilidade a priori.

## 8. Exercícios resolvidos

### 8.1 Carrapatos com duas doenças

![Ilustração de quatro carrapatos vistos de cima, em tons de marrom]({{ site.baseurl }}/assets/images/carrapato.avif){:style="max-width: 400px; display: block; margin: 0 auto;"}
<div class="image-caption" style="text-align: center;">Figura 2: Ilustração de carrapatos.</div>

> **Problema** (números ilustrativos): carrapatos podem transmitir a doença de Lyme e a erliquiose granulocítica humana (HGE). Suponha que, numa população de carrapatos, 16% carreguem o agente da doença de Lyme, 10% carreguem o da HGE e, entre os que carregam pelo menos um dos dois, 10% carreguem os dois.
>
> a) Qual é a probabilidade de um carrapato carregar os dois?
>
> b) Qual é a probabilidade de um carrapato carregar o da HGE, sabendo que carrega o de Lyme?

**Dados.** Sejam $L$ = "carrega o agente de Lyme" e $H$ = "carrega o agente da HGE". Do enunciado:

$$P(L) = 0{,}16 \qquad P(H) = 0{,}10 \qquad P(L \cap H \mid L \cup H) = 0{,}10$$

A terceira frase é uma probabilidade condicional: "entre os que carregam pelo menos um" é o evento $L \cup H$, e "carregam os dois" é $L \cap H$.

**(a)** Chame $x = P(L \cap H)$, o valor procurado. Como $L \cap H$ está contido em $L \cup H$, a interseção dos dois é o próprio $L \cap H$, e a definição de probabilidade condicional dá:

$$P(L \cap H \mid L \cup H) = \frac{P(L \cap H)}{P(L \cup H)} = \frac{x}{P(L \cup H)}$$

Pela regra da adição, $P(L \cup H) = P(L) + P(H) - P(L \cap H) = 0{,}16 + 0{,}10 - x = 0{,}26 - x$. Substituindo:

$$0{,}10 = \frac{x}{0{,}26 - x}$$

Multiplicando os dois lados por $0{,}26 - x$:

$$0{,}10 \cdot (0{,}26 - x) = x$$

$$0{,}026 - 0{,}10\,x = x$$

Somando $0{,}10\,x$ aos dois lados:

$$0{,}026 = 1{,}10\,x$$

$$x = \frac{0{,}026}{1{,}10} = \frac{13}{550} \approx 0{,}02364$$

**Conferência:** $P(L \cup H) = 0{,}26 - 0{,}02364 = 0{,}23636$, e $\frac{0{,}02364}{0{,}23636} \approx 0{,}10$, como o enunciado pede.

**Resposta (a):** $P(L \cap H) \approx 0{,}0236$, ou cerca de 2,36% dos carrapatos (perto de 24 em cada 1.000) carregam os dois agentes.

**(b)** Pela definição:

$$P(H \mid L) = \frac{P(H \cap L)}{P(L)} = \frac{13/550}{0{,}16} = \frac{13}{88} \approx 0{,}1477$$

**Resposta (b):** cerca de 14,77% dos carrapatos que carregam o agente de Lyme também carregam o da HGE.

**Interpretação:** $P(H \mid L) \approx 0{,}148$ é maior que $P(H) = 0{,}10$. Nesses números, saber que o carrapato carrega o agente de Lyme aumenta a chance de ele carregar o da HGE: os dois eventos **não** são independentes. (Se fossem, $P(L \cap H)$ seria $0{,}16 \cdot 0{,}10 = 0{,}016$, e não 0,0236.)

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>P_L = 0.16      # P(L): portador de Lyme
P_H = 0.10      # P(H): portador de HGE
r = 0.10        # P(L ∩ H | L ∪ H)

# De x = r·(P(L) + P(H) − x) vem x = r·(P(L) + P(H)) / (1 + r)
P_LeH = r * (P_L + P_H) / (1 + r)
P_LouH = P_L + P_H - P_LeH
P_H_dado_L = P_LeH / P_L

println("P(L ∩ H)     = ", round(P_LeH, digits=5))
println("P(L ∪ H)     = ", round(P_LouH, digits=5))
println("Conferência: P(L ∩ H) / P(L ∪ H) = ", round(P_LeH / P_LouH, digits=5))
println("P(H | L)     = ", round(P_H_dado_L, digits=4))</code></pre>
  </div>
</div>

#### Saída esperada:
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>P(L ∩ H) &nbsp; &nbsp; = 0.02364</div>
  <div>P(L ∪ H) &nbsp; &nbsp; = 0.23636</div>
  <div>Conferência: P(L ∩ H) / P(L ∪ H) = 0.1</div>
  <div>P(H | L) &nbsp; &nbsp; = 0.1477</div>
</div>

A conta usa a solução fechada $x = \frac{r\,(P(L) + P(H))}{1 + r}$, com $r = 0{,}10$, obtida isolando $x$ como acima.

### 8.2 Teste de HIV

> **Problema** (números ilustrativos): suponha que 1 em cada 5.000 pessoas de uma população viva com HIV e que um teste dê o resultado certo em 99% dos casos, tanto para quem vive com HIV quanto para quem não vive.
>
> a) Qual é a probabilidade de o teste dar negativo para uma pessoa que vive com HIV?
>
> b) Uma pessoa escolhida ao acaso testa positivo. Qual é a probabilidade de ela viver com HIV?
>
> c) Uma pessoa escolhida ao acaso testa negativo. Qual é a probabilidade de ela não viver com HIV?

**Dados.** Sejam $V$ = "a pessoa vive com HIV", $+$ = "o teste dá positivo" e $-$ = "o teste dá negativo". Do enunciado:

- $P(V) = \frac{1}{5000} = 0{,}0002$, então $P(V^c) = 1 - 0{,}0002 = 0{,}9998$;
- o teste acerta 99% de quem vive com HIV: $P(+ \mid V) = 0{,}99$;
- e 99% de quem não vive: $P(- \mid V^c) = 0{,}99$.

**(a)** Para quem vive com HIV, o teste dá positivo ou negativo. Pela regra do complemento (seção 3):

$$P(- \mid V) = 1 - P(+ \mid V) = 1 - 0{,}99 = 0{,}01$$

**Resposta (a):** 0,01, ou 1% (um **falso negativo**).

**(b)** Primeiro, a probabilidade total de um positivo. Também pelo complemento, $P(+ \mid V^c) = 1 - P(- \mid V^c) = 1 - 0{,}99 = 0{,}01$ (um **falso positivo**). Então:

$$P(+) = P(+ \mid V) \, P(V) + P(+ \mid V^c) \, P(V^c)$$

$$P(+) = 0{,}99 \cdot 0{,}0002 + 0{,}01 \cdot 0{,}9998$$

$$P(+) = 0{,}000198 + 0{,}009998 = 0{,}010196$$

Agora, o Teorema de Bayes:

$$P(V \mid +) = \frac{P(+ \mid V) \, P(V)}{P(+)} = \frac{0{,}000198}{0{,}010196} \approx 0{,}0194$$

**Resposta (b):** cerca de 1,94%.

**(c)** A probabilidade total de um negativo:

$$P(-) = P(- \mid V^c) \, P(V^c) + P(- \mid V) \, P(V)$$

$$P(-) = 0{,}99 \cdot 0{,}9998 + 0{,}01 \cdot 0{,}0002$$

$$P(-) = 0{,}989802 + 0{,}000002 = 0{,}989804$$

E Bayes:

$$P(V^c \mid -) = \frac{P(- \mid V^c) \, P(V^c)}{P(-)} = \frac{0{,}989802}{0{,}989804} \approx 0{,}99999798$$

**Resposta (c):** cerca de 0,99999798, ou 99,999798%.

**Interpretação**, contando pessoas. Em 500.000 pessoas:

- 1 em 5.000 vive com HIV: 100 pessoas; o teste dá positivo para 99 delas e negativo para 1;
- 499.900 não vivem com HIV; o teste dá negativo para 99% delas (494.901) e positivo para 1% (4.999).

Dos $99 + 4.999 = 5.098$ positivos, só 99 vivem com HIV: $\frac{99}{5098} \approx 1{,}94\%$. Dos $494.901 + 1 = 494.902$ negativos, só 1 vive com HIV. Com uma condição tão rara, um positivo isolado diz pouco (a maioria dos positivos é falso positivo), enquanto um negativo é muito confiável. Com estes números ilustrativos, um positivo sozinho não basta para concluir que a pessoa vive com HIV; a interpretação de um teste real cabe a um profissional de saúde.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>P_HIV = 1 / 5000              # prevalência (ilustrativa)
P_pos_dado_HIV = 0.99         # sensibilidade: P(+ | HIV)
P_neg_dado_semHIV = 0.99      # especificidade: P(− | HIVᶜ)

P_semHIV = 1 - P_HIV
P_neg_dado_HIV = 1 - P_pos_dado_HIV          # (a) falso negativo
P_pos_dado_semHIV = 1 - P_neg_dado_semHIV    # falso positivo

# Lei da probabilidade total
P_pos = P_pos_dado_HIV * P_HIV + P_pos_dado_semHIV * P_semHIV
P_neg = P_neg_dado_semHIV * P_semHIV + P_neg_dado_HIV * P_HIV

# Teorema de Bayes
P_HIV_dado_pos = P_pos_dado_HIV * P_HIV / P_pos            # (b)
P_semHIV_dado_neg = P_neg_dado_semHIV * P_semHIV / P_neg   # (c)

println("(a) P(− | HIV)   = ", round(P_neg_dado_HIV, digits=4))
println("    P(+)         = ", round(P_pos, digits=6))
println("(b) P(HIV | +)   = ", round(P_HIV_dado_pos, digits=4))
println("    P(−)         = ", round(P_neg, digits=6))
println("(c) P(HIVᶜ | −)  = ", round(P_semHIV_dado_neg, digits=8))</code></pre>
  </div>
</div>

#### Saída esperada:
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>(a) P(− | HIV) &nbsp; = 0.01</div>
  <div> &nbsp; &nbsp;P(+) &nbsp; &nbsp; &nbsp; &nbsp; = 0.010196</div>
  <div>(b) P(HIV | +) &nbsp; = 0.0194</div>
  <div> &nbsp; &nbsp;P(−) &nbsp; &nbsp; &nbsp; &nbsp; = 0.989804</div>
  <div>(c) P(HIVᶜ | −) &nbsp;= 0.99999798</div>
</div>

### 8.3 Controle de qualidade

![Fotografia ilustrativa de um inspetor de capacete e luvas examinando uma peça metálica numa fábrica]({{ site.baseurl }}/assets/images/qualidade.avif){:style="max-width: 400px; display: block; margin: 0 auto;"}
<div class="image-caption" style="text-align: center;">Figura 3: Inspeção de qualidade numa linha de produção (ilustração).</div>

> **Problema** (números ilustrativos): numa fábrica, 2 em cada 1.000 produtos são defeituosos. Um teste de qualidade classifica cada produto como "defeituoso" ou "perfeito" e acerta 95% das vezes, tanto para produtos defeituosos quanto para perfeitos.
>
> a) Qual é a probabilidade de o teste indicar "defeituoso" para um produto perfeito?
>
> b) O teste indicou "defeituoso". Qual é a probabilidade de o produto ser mesmo defeituoso?

**Dados.** Sejam $D$ = "o produto é defeituoso", $E$ = "o produto é perfeito" ($E = D^c$), $T_d$ = "o teste indica defeituoso" e $T_e$ = "o teste indica perfeito". Do enunciado:

- $P(D) = \frac{2}{1000} = 0{,}002$, então $P(E) = 1 - 0{,}002 = 0{,}998$;
- $P(T_d \mid D) = 0{,}95$ e $P(T_e \mid E) = 0{,}95$.

**(a)** Pela regra do complemento:

$$P(T_d \mid E) = 1 - P(T_e \mid E) = 1 - 0{,}95 = 0{,}05$$

**Resposta (a):** 0,05, ou 5% (a taxa de falsos positivos).

**(b)** Probabilidade total de o teste indicar defeito:

$$P(T_d) = P(T_d \mid D) \, P(D) + P(T_d \mid E) \, P(E)$$

$$P(T_d) = 0{,}95 \cdot 0{,}002 + 0{,}05 \cdot 0{,}998$$

$$P(T_d) = 0{,}0019 + 0{,}0499 = 0{,}0518$$

E Bayes:

$$P(D \mid T_d) = \frac{P(T_d \mid D) \, P(D)}{P(T_d)} = \frac{0{,}0019}{0{,}0518} = \frac{19}{518} \approx 0{,}0367$$

**Resposta (b):** cerca de 3,67%.

**Interpretação:** em 10.000 produtos, 20 são defeituosos e o teste aponta 19 deles; dos 9.980 perfeitos, aponta 5% por engano, ou 499. Dos $19 + 499 = 518$ apontados, só 19 são defeituosos. Isso acontece porque os defeitos são raros (0,2%) e a taxa de falsos positivos (5%) é muito maior que essa prevalência. Na prática, um alarme do teste deveria levar a uma segunda inspeção, não ao descarte direto.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>P_D = 2 / 1000          # P(D): produto defeituoso
P_E = 1 - P_D           # P(E): produto em perfeitas condições

P_Td_dado_D = 0.95      # o teste acerta 95% dos defeituosos
P_Te_dado_E = 0.95      # e 95% dos perfeitos
P_Td_dado_E = 1 - P_Te_dado_E           # (a) falso positivo

P_Td = P_Td_dado_D * P_D + P_Td_dado_E * P_E   # probabilidade total
P_D_dado_Td = P_Td_dado_D * P_D / P_Td         # (b) Bayes

println("(a) P(Td | E) = ", round(P_Td_dado_E, digits=4))
println("    P(Td)     = ", round(P_Td, digits=4))
println("(b) P(D | Td) = ", round(P_D_dado_Td, digits=4))</code></pre>
  </div>
</div>

#### Saída esperada:
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>(a) P(Td | E) = 0.05</div>
  <div> &nbsp; &nbsp;P(Td) &nbsp; &nbsp; = 0.0518</div>
  <div>(b) P(D | Td) = 0.0367</div>
</div>

### 8.4 Previsão do tempo

![Fotografia de um guarda-chuva preto sob chuva forte, com fundo verde desfocado]({{ site.baseurl }}/assets/images/chuva.avif){:style="max-width: 400px; display: block; margin: 0 auto;"}
<div class="image-caption" style="text-align: center;">Figura 4: Um dia de chuva (ilustração).</div>

> **Problema** (números ilustrativos): numa cidade, chove em 1 de cada 10 dias de verão. Um modelo de previsão acerta 80% das vezes: quando vai chover, prevê "chuva" com probabilidade 0,8; quando não vai chover, prevê "sem chuva" com probabilidade 0,8.
>
> a) Qual é a probabilidade de o modelo prever "sem chuva" num dia em que chove?
>
> b) O modelo previu "sem chuva". Qual é a probabilidade de chover mesmo assim?

**Dados.** Sejam $C$ = "chove no dia" e $S$ = "o modelo prevê sem chuva". Do enunciado:

- $P(C) = \frac{1}{10} = 0{,}1$, então $P(C^c) = 1 - 0{,}1 = 0{,}9$;
- $P(S^c \mid C) = 0{,}8$ (prevê "chuva" quando chove) e $P(S \mid C^c) = 0{,}8$ (prevê "sem chuva" quando não chove).

**(a)** Pela regra do complemento:

$$P(S \mid C) = 1 - P(S^c \mid C) = 1 - 0{,}8 = 0{,}2$$

**Resposta (a):** 0,2, ou 20% dos dias de chuva.

**(b)** Probabilidade total de o modelo prever "sem chuva":

$$P(S) = P(S \mid C) \, P(C) + P(S \mid C^c) \, P(C^c)$$

$$P(S) = 0{,}2 \cdot 0{,}1 + 0{,}8 \cdot 0{,}9$$

$$P(S) = 0{,}02 + 0{,}72 = 0{,}74$$

E Bayes:

$$P(C \mid S) = \frac{P(S \mid C) \, P(C)}{P(S)} = \frac{0{,}02}{0{,}74} = \frac{1}{37} \approx 0{,}0270$$

**Resposta (b):** cerca de 2,70%.

**Interpretação:** quando o modelo prevê "sem chuva", chove em cerca de 1 a cada 37 desses dias. A previsão "sem chuva" é confiável porque a maioria dos dias já é seca. A previsão "chuva" é bem menos: fazendo a mesma conta, $P(C \mid S^c) = \frac{0{,}8 \cdot 0{,}1}{0{,}8 \cdot 0{,}1 + 0{,}2 \cdot 0{,}9} = \frac{0{,}08}{0{,}26} = \frac{4}{13} \approx 0{,}3077$, ou seja, só cerca de 31% dos dias com previsão de chuva têm chuva de fato.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>P_C = 1 / 10            # P(C): dia de verão com chuva
P_Cc = 1 - P_C          # P(Cᶜ): dia sem chuva

P_S_dado_C = 1 - 0.8    # (a) o modelo erra 20% dos dias de chuva
P_S_dado_Cc = 0.8       # e acerta 80% dos dias secos

P_S = P_S_dado_C * P_C + P_S_dado_Cc * P_Cc    # probabilidade total
P_C_dado_S = P_S_dado_C * P_C / P_S            # (b) Bayes

println("(a) P(S | C) = ", round(P_S_dado_C, digits=4))
println("    P(S)     = ", round(P_S, digits=4))
println("(b) P(C | S) = ", round(P_C_dado_S, digits=4))</code></pre>
  </div>
</div>

#### Saída esperada:
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>(a) P(S | C) = 0.2</div>
  <div> &nbsp; &nbsp;P(S) &nbsp; &nbsp; = 0.74</div>
  <div>(b) P(C | S) = 0.027</div>
</div>

## 9. Exercícios propostos

1. **Dois dados.** Lançam-se dois dados honestos. Qual é a probabilidade de a soma ser 8, sabendo que o primeiro dado deu 3? Compare com a probabilidade de a soma ser 8 sem nenhuma informação. Os eventos são independentes?

   *Resposta:* sabendo que o primeiro deu 3, a soma é 8 só se o segundo der 5: $\frac{1}{6} \approx 0{,}1667$. Sem informação, $P(\text{soma } 8) = \frac{5}{36} \approx 0{,}1389$. Como os valores diferem, os eventos não são independentes (seção 5).

2. **Urna sem reposição.** Uma urna tem 3 bolas vermelhas e 2 azuis. Tiram-se duas, sem reposição. (a) Qual é a probabilidade de as duas serem vermelhas? (b) Qual é a probabilidade de a segunda ser vermelha? (c) Sabendo que a segunda é vermelha, qual é a probabilidade de a primeira também ser?

   *Resposta:* sejam $V_1$ e $V_2$ = "a 1ª / a 2ª bola é vermelha".
   (a) Pela regra da multiplicação, $P(V_1 \cap V_2) = \frac{3}{5} \cdot \frac{2}{4} = \frac{6}{20} = \frac{3}{10} = 0{,}3$.
   (b) Pela probabilidade total, com a partição $V_1$, $V_1^c$: $P(V_2) = \frac{3}{5} \cdot \frac{2}{4} + \frac{2}{5} \cdot \frac{3}{4} = \frac{6}{20} + \frac{6}{20} = \frac{12}{20} = \frac{3}{5} = 0{,}6$ (a mesma chance da 1ª retirada).
   (c) Por Bayes, $P(V_1 \mid V_2) = \frac{P(V_1 \cap V_2)}{P(V_2)} = \frac{3/10}{3/5} = \frac{1}{2} = 0{,}5$.

3. **Prevalência.** Refaça o exemplo da seção 7.3 com prevalência de 10% (mesmo teste). Qual é $P(D \mid T^+)$?

   *Resposta:* $P(T^+) = 0{,}99 \cdot 0{,}1 + 0{,}05 \cdot 0{,}9 = 0{,}099 + 0{,}045 = 0{,}144$ e $P(D \mid T^+) = \frac{0{,}099}{0{,}144} = 0{,}6875$, ou 68,75%.

## 10. Erros comuns e quando tomar cuidado

- **Trocar $P(A \mid B)$ por $P(B \mid A)$.** "99% dos doentes testam positivo" não quer dizer "99% dos positivos estão doentes". No exemplo da seção 7.3, o segundo número é cerca de 17%.
- **Esquecer a probabilidade a priori.** O resultado de Bayes depende muito de $P(A)$. O mesmo teste dá 1,94%, 16,67% ou 68,75% conforme a prevalência (seção 7.3). Usar a prevalência de outra população (por exemplo, a da população geral para pessoas que já têm sintomas) muda a resposta.
- **Condicionar num evento de probabilidade zero.** $P(A \mid B)$ só está definida pela fórmula quando $P(B) > 0$.
- **Supor independência sem justificar.** Multiplicar $P(A) \cdot P(B)$ só vale para eventos independentes; em retiradas sem reposição, por exemplo, não vale (seção 4).
- **Ler condicional como causa.** $P(A \mid B)$ alta diz que $A$ é frequente **quando** $B$ ocorre, não que $B$ **causa** $A$. No exemplo dos carrapatos, $P(H \mid L) > P(H)$ não diz que um agente provoca o outro.
- **Confundir independentes com mutuamente exclusivos.** Eventos mutuamente exclusivos com probabilidade positiva são sempre dependentes (seção 5).

## Referências

1. Bussab, W. O.; Morettin, P. A. (2023). *Estatística Básica*. 10. ed. Saraiva Uni.
2. Ross, S. M. (2012). *A First Course in Probability*. 9th ed. Pearson.
