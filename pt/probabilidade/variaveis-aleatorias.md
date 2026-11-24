---
layout: page
title: Variáveis Aleatórias
lang: pt
ref: variaveis-aleatorias
parent: probabilidade
permalink: /pt/probabilidade/variaveis-aleatorias
order: 2
mathjax: true
description: "O que é uma variável aleatória: casos discreto e contínuo, esperança e variância com exemplos resolvidos, transformações e simulação em Julia."
---

Uma **variável aleatória** é uma função que associa um número real a cada resultado possível de um experimento aleatório. Este conceito é fundamental em probabilidade e estatística, permitindo a análise matemática de fenômenos aleatórios.

<div style="border-left: 4px solid #4CAF50; padding: 0.5em; background-color: #e8f5e9;">
  <strong>📊 Importante:</strong> A compreensão de variáveis aleatórias é essencial para o <strong>estudo de probabilidade</strong>.<br>
  Elas são a base para entender <em>distribuições de probabilidade</em> e fazer <em>inferências estatísticas</em>.
</div>

Os códigos em Julia desta página fixam a semente (`Random.seed!(123)`), para que as simulações deem sempre os mesmos números; nas saídas, o Julia escreve os números com ponto decimal (3.5 em vez de 3,5).

---

## 1. Tipos de Variáveis Aleatórias

### 1.1 Variáveis Aleatórias Discretas

São aquelas que assumem valores em um conjunto enumerável: finito ou infinito, mas que pode ser listado (0, 1, 2, …).

#### Características
- Valores isolados
- Podem ser contados
- Descritas por uma função de probabilidade

#### Exemplos
- Número que sai no lançamento de um dado
- Quantidade de clientes em uma fila
- Número de defeitos em um lote

<div style="border-left: 4px solid #2196F3; padding: 0.5em; background-color: #e3f2fd; margin: 1em 0;">
  <strong>💡 Exemplo</strong><br>
  Lançamento de um dado: $X$ = número que aparece na face de cima.<br>
  Valores possíveis: $\{1, 2, 3, 4, 5, 6\}$.
</div>

### 1.2 Variáveis Aleatórias Contínuas

São aquelas que assumem valores em um intervalo dos números reais.

#### Características
- Valores em um intervalo contínuo
- Não podem ser contados, apenas medidos
- Descritas por uma função densidade de probabilidade

#### Exemplos
- Altura de uma pessoa
- Tempo de espera em um serviço
- Temperatura em um dia

<div style="border-left: 4px solid #2196F3; padding: 0.5em; background-color: #e3f2fd; margin: 1em 0;">
  <strong>💡 Exemplo</strong><br>
  Temperatura máxima do dia em uma cidade: $X$ = temperatura em graus Celsius.<br>
  Valores possíveis: qualquer número de um intervalo, por exemplo entre 0 °C e 40 °C (faixa ilustrativa), inclusive 23,7 °C ou 23,71 °C.
</div>

---

## 2. Funções de Probabilidade

### 2.1 Função de Probabilidade (Caso Discreto)

#### Definição
A função de probabilidade de uma variável discreta $X$ é $p(x) = P(X = x)$. Ela precisa satisfazer duas condições:
1. $p(x) \geq 0$ para todo $x$
2. $\sum_{x} p(x) = 1$ (a soma sobre todos os valores possíveis é 1)

#### Exemplo
Para um dado honesto:

$$p(x) = \frac{1}{6}, \quad x \in \{1, 2, 3, 4, 5, 6\}$$

As duas condições valem: cada $p(x) = \frac{1}{6}$ é positivo, e a soma dos seis valores é $6 \cdot \frac{1}{6} = 1$.

### 2.2 Função Densidade de Probabilidade (Caso Contínuo)

#### Definição
Uma função $f(x)$ é uma função densidade de probabilidade se:
1. $f(x) \geq 0$ para todo $x$
2. $\int_{-\infty}^{\infty} f(x)\,dx = 1$ (a área total sob a curva é 1)

e, nesse caso, as probabilidades são áreas sob a curva:

$$P(a \leq X \leq b) = \int_{a}^{b} f(x)\,dx$$

<div style="border-left: 4px solid #9c27b0; padding: 0.5em; background-color: #f3e5f5; margin: 1em 0;">
  <strong>🔍 Observação Importante</strong><br>
  Em uma variável aleatória contínua (com densidade), a probabilidade de um valor exato é sempre zero: $P(X = x) = 0$. O que tem probabilidade positiva são intervalos. Por isso, numa variável contínua, $P(a \leq X \leq b)$ e $P(a < X < b)$ são iguais.
</div>

---

## 3. Esperança e Variância

### 3.1 Esperança (Valor Esperado)

A **esperança** $E[X]$ é a média dos valores de $X$, cada um pesado pela sua probabilidade. Ela é a média de longo prazo: se o experimento for repetido muitas vezes, a média dos resultados se aproxima de $E[X]$.

#### Caso Discreto

$$E[X] = \sum_{x} x \cdot p(x)$$

**Exemplo: dado honesto.** Dados: valores $1, 2, \ldots, 6$, cada um com probabilidade $\frac{1}{6}$ (seção 2.1).

**Substituição:**

$$E[X] = 1 \cdot \tfrac{1}{6} + 2 \cdot \tfrac{1}{6} + 3 \cdot \tfrac{1}{6} + 4 \cdot \tfrac{1}{6} + 5 \cdot \tfrac{1}{6} + 6 \cdot \tfrac{1}{6}$$

**Conta:** como todos os termos têm o fator $\frac{1}{6}$, ele sai da soma:

$$E[X] = \frac{1 + 2 + 3 + 4 + 5 + 6}{6} = \frac{21}{6} = 3{,}5$$

**Interpretação:** 3,5 não é uma face do dado; é a média de longo prazo. Em muitos lançamentos, a média dos números obtidos fica perto de 3,5, como a simulação abaixo mostra.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Statistics, Random

Random.seed!(123)

# Dado honesto: faces de 1 a 6, cada uma com probabilidade 1/6
valores = 1:6
probabilidades = fill(1 // 6, 6)   # frações exatas

# Esperança: soma de cada valor vezes a sua probabilidade
esperanca = sum(valores .* probabilidades)
println("Esperança exata: ", esperanca, " = ", float(esperanca))

# Simulação: a média de muitos lançamentos se aproxima da esperança
n_lancamentos = 10_000
lancamentos = rand(1:6, n_lancamentos)
println("Média de $n_lancamentos lançamentos: ", round(mean(lancamentos), digits = 4))</code></pre>
  </div>
</div>

#### Saída esperada:
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>Esperança exata: 7//2 = 3.5</div>
  <div>Média de 10000 lançamentos: 3.5342</div>
</div>

#### Caso Contínuo

$$E[X] = \int_{-\infty}^{\infty} x \cdot f(x)\,dx$$

**Exemplo: distribuição normal.** Para uma normal com média $\mu$ e desvio padrão $\sigma$:

$$E[X] = \int_{-\infty}^{\infty} x \cdot \frac{1}{\sqrt{2\pi\sigma^2}} e^{-\frac{(x-\mu)^2}{2\sigma^2}}\,dx$$

A integral sai com a mudança de variável $z = \frac{x - \mu}{\sigma}$, isto é, $x = \mu + \sigma z$ e $dx = \sigma\,dz$. Chamando de $\varphi(z) = \frac{1}{\sqrt{2\pi}} e^{-z^2/2}$ a densidade da normal padrão:

$$E[X] = \int_{-\infty}^{\infty} (\mu + \sigma z)\,\varphi(z)\,dz = \mu \int_{-\infty}^{\infty} \varphi(z)\,dz + \sigma \int_{-\infty}^{\infty} z\,\varphi(z)\,dz$$

- A primeira integral vale 1, porque $\varphi$ é uma densidade (área total 1).
- A segunda integral vale 0, porque $z\,\varphi(z)$ é uma função ímpar: a área à esquerda de zero é negativa e cancela exatamente a área à direita.

$$E[X] = \mu \cdot 1 + \sigma \cdot 0 = \mu$$

Para $\mu = 10$ e $\sigma = 2$, portanto, $E[X] = 10$.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Distributions, Statistics, Random

Random.seed!(123)

μ = 10   # média
σ = 2    # desvio padrão
dist = Normal(μ, σ)   # Normal(μ, σ) recebe o desvio padrão, não a variância

println("Esperança teórica: ", mean(dist))

# Simulação: a média de muitas amostras se aproxima de μ
n_amostras = 10_000
amostras = rand(dist, n_amostras)
println("Média de $n_amostras amostras: ", round(mean(amostras), digits = 4))</code></pre>
  </div>
</div>

#### Saída esperada:
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>Esperança teórica: 10.0</div>
  <div>Média de 10000 amostras: 9.9859</div>
</div>

### 3.2 Variância

A **variância** mede o quanto os valores de $X$ se espalham em torno da esperança: é a esperança do quadrado da distância até a média.

#### Definição e atalho

$$Var(X) = E\big[(X - E[X])^2\big] = E[X^2] - (E[X])^2$$

A segunda forma (o "atalho") vale sempre que $E[X^2]$ é finito, e costuma dar menos contas.

#### Caso Discreto (Dado)

**Dados:** valores $1, \ldots, 6$ com probabilidade $\frac{1}{6}$ cada, e $E[X] = 3{,}5$ (seção 3.1).

**Caminho 1, pela definição.** Cada desvio $x - 3{,}5$ e o seu quadrado:

| $x$ | $x - 3{,}5$ | $(x - 3{,}5)^2$ |
|---|---|---|
| 1 | −2,5 | 6,25 |
| 2 | −1,5 | 2,25 |
| 3 | −0,5 | 0,25 |
| 4 | 0,5 | 0,25 |
| 5 | 1,5 | 2,25 |
| 6 | 2,5 | 6,25 |
| **Soma** | **0** | **17,5** |

Como cada quadrado tem peso $\frac{1}{6}$:

$$Var(X) = \frac{17{,}5}{6} = \frac{35}{12} \approx 2{,}9167$$

**Caminho 2, pelo atalho.** Primeiro $E[X^2]$:

$$E[X^2] = \frac{1 + 4 + 9 + 16 + 25 + 36}{6} = \frac{91}{6}$$

$$Var(X) = \frac{91}{6} - 3{,}5^2 = \frac{91}{6} - \frac{49}{4} = \frac{182}{12} - \frac{147}{12} = \frac{35}{12}$$

Os dois caminhos dão o mesmo valor: $Var(X) = \frac{35}{12} \approx 2{,}9167$, e o desvio padrão é $\sqrt{35/12} \approx 1{,}7078$.

**Interpretação:** os resultados de um dado se afastam da média 3,5, tipicamente, cerca de 1,7 ponto para mais ou para menos.

#### Caso Contínuo (Normal)

$$Var(X) = \int_{-\infty}^{\infty} (x - \mu)^2 \cdot \frac{1}{\sqrt{2\pi\sigma^2}} e^{-\frac{(x-\mu)^2}{2\sigma^2}}\,dx = \sigma^2$$

Para $\mu = 10$ e $\sigma = 2$, a variância é $\sigma^2 = 2^2 = 4$.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Distributions, Statistics, Random

Random.seed!(123)

# Dado honesto, com frações exatas
valores = 1:6
probabilidades = fill(1 // 6, 6)
media = sum(valores .* probabilidades)

# Caminho 1: pela definição, E[(X − E[X])²]
var_definicao = sum((valores .- media) .^ 2 .* probabilidades)
# Caminho 2: pelo atalho, E[X²] − (E[X])²
var_atalho = sum(valores .^ 2 .* probabilidades) - media^2
println("Variância pela definição: ", var_definicao, " ≈ ", round(float(var_definicao), digits = 4))
println("Variância pelo atalho:    ", var_atalho)

# Simulação (var usa n − 1 no denominador: é a variância amostral)
lancamentos = rand(1:6, 10_000)
println("Variância amostral de 10000 lançamentos: ", round(var(lancamentos), digits = 4))

# Normal com μ = 10 e σ = 2: a variância é σ² = 4
dist_normal = Normal(10, 2)
println("Variância teórica da Normal(10, 2): ", var(dist_normal))
println("Variância amostral de 10000 valores: ", round(var(rand(dist_normal, 10_000)), digits = 4))</code></pre>
  </div>
</div>

#### Saída esperada:
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>Variância pela definição: 35//12 ≈ 2.9167</div>
  <div>Variância pelo atalho:    35//12</div>
  <div>Variância amostral de 10000 lançamentos: 2.9285</div>
  <div>Variância teórica da Normal(10, 2): 4.0</div>
  <div>Variância amostral de 10000 valores: 4.0288</div>
</div>

<div style="border-left: 4px solid #ff9800; padding: 0.5em; background-color: #fff3e0; margin: 1em 0;">
  <strong>⚠️ Variância da distribuição × variância da amostra</strong><br>
  $Var(X)$ é uma propriedade da distribuição (uma conta com as probabilidades). Já a função <code>var</code> do Julia, aplicada a dados simulados, calcula a <strong>variância amostral</strong>, com $n - 1$ no denominador: é uma estimativa de $Var(X)$, que fica perto dela quando há muitos dados, mas não é igual.
</div>

---

## 4. Funções de Variáveis Aleatórias

### 4.1 Transformações

Se $Y = g(X)$, onde $g$ é uma função e $X$ é uma variável aleatória, então $Y$ também é uma variável aleatória.

#### Para Discretas
Somam-se as probabilidades de todos os valores de $X$ que levam ao mesmo $y$:

$$P(Y = y) = \sum_{x:\, g(x) = y} P(X = x)$$

#### Para Contínuas
Quando $g$ é **estritamente monótona** (sempre crescente ou sempre decrescente) e a inversa $g^{-1}$ é derivável, a densidade de $Y$ é:

$$f_Y(y) = f_X\big(g^{-1}(y)\big) \cdot \left|\frac{d}{dy}g^{-1}(y)\right|$$

Se $g$ não for monótona, divide-se o domínio em trechos onde ela é monótona (os "ramos") e somam-se as contribuições de cada ramo, como no exemplo a seguir.

**Exemplo: $Y = X^2$, com $X \sim N(0, 1)$.** Aqui $g(x) = x^2$ não é monótona (desce até 0 e depois sobe), então usamos dois ramos.

1) Densidade da normal padrão (variável original $X$):

$$f_X(x) = \frac{1}{\sqrt{2\pi}} e^{-x^2/2}, \quad -\infty < x < \infty$$

2) Função de transformação:

$$g(x) = x^2$$

3) Inversa em cada ramo (para $y > 0$): no ramo $x > 0$, $x = \sqrt{y}$; no ramo $x < 0$, $x = -\sqrt{y}$.

4) Derivada da inversa em cada ramo:

$$\frac{d}{dy}\sqrt{y} = \frac{1}{2\sqrt{y}} \qquad \frac{d}{dy}\big(-\sqrt{y}\big) = -\frac{1}{2\sqrt{y}}$$

5) Valor absoluto da derivada (igual nos dois ramos):

$$\left|\pm\frac{1}{2\sqrt{y}}\right| = \frac{1}{2\sqrt{y}}$$

6) Somando a contribuição dos dois ramos:

$$f_Y(y) = f_X(\sqrt{y}) \cdot \frac{1}{2\sqrt{y}} + f_X(-\sqrt{y}) \cdot \frac{1}{2\sqrt{y}}$$

7) Substituindo a densidade da normal:

$$f_Y(y) = \frac{1}{\sqrt{2\pi}} e^{-(\sqrt{y})^2/2} \cdot \frac{1}{2\sqrt{y}} + \frac{1}{\sqrt{2\pi}} e^{-(-\sqrt{y})^2/2} \cdot \frac{1}{2\sqrt{y}}$$

8) Como $(\sqrt{y})^2 = (-\sqrt{y})^2 = y$, as duas exponenciais ficam iguais:

$$f_Y(y) = \frac{1}{\sqrt{2\pi}} e^{-y/2} \cdot \frac{1}{2\sqrt{y}} + \frac{1}{\sqrt{2\pi}} e^{-y/2} \cdot \frac{1}{2\sqrt{y}}$$

9) Os dois termos são iguais; somados, o $\frac{1}{2}$ some:

$$f_Y(y) = \frac{1}{\sqrt{2\pi}} e^{-y/2} \cdot \frac{1}{\sqrt{y}} = \frac{1}{\sqrt{2\pi y}} e^{-y/2}, \quad y > 0$$

10) Esperança de $Y$, usando o atalho da variância ao contrário ($E[X^2] = Var(X) + (E[X])^2$) e os valores da normal padrão, $E[X] = 0$ e $Var(X) = 1$:

$$E[Y] = E[X^2] = Var(X) + (E[X])^2 = 1 + 0^2 = 1$$

11) Variância de $Y$. Primeiro $E[Y^2] = E[X^4]$. Como a derivada de $\varphi(x) = \frac{1}{\sqrt{2\pi}}e^{-x^2/2}$ é $\varphi'(x) = -x\,\varphi(x)$, a integração por partes dá:

$$E[X^4] = \int_{-\infty}^{\infty} x^3 \cdot x\,\varphi(x)\,dx = \Big[-x^3 \varphi(x)\Big]_{-\infty}^{\infty} + 3\int_{-\infty}^{\infty} x^2\,\varphi(x)\,dx = 0 + 3 \cdot E[X^2] = 3 \cdot 1 = 3$$

(o termo entre colchetes é zero porque $x^3\varphi(x) \to 0$ quando $x \to \pm\infty$). Então:

$$Var(Y) = E[Y^2] - (E[Y])^2 = 3 - 1^2 = 2$$

<div style="border-left: 4px solid #2196F3; padding: 0.5em; background-color: #e3f2fd; margin: 1em 0;">
  <strong>💡 Observação:</strong><br>
  A densidade obtida no passo 9 é a da distribuição <strong>qui-quadrado com 1 grau de liberdade</strong>, $\chi^2(1)$, que tem média 1 e variância 2, como nos passos 10 e 11. A qui-quadrado aparece, por exemplo, no teste qui-quadrado e no intervalo de confiança para a variância.
</div>

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Distributions, Statistics, Plots, Random

Random.seed!(123)

X = Normal(0, 1)   # normal padrão
n_amostras = 10_000
amostras_x = rand(X, n_amostras)

# Transformação Y = X²
amostras_y = amostras_x .^ 2

# A teoria diz E[Y] = 1 e Var(Y) = 2
println("Média de Y nas amostras:     ", round(mean(amostras_y), digits = 4))
println("Variância de Y nas amostras: ", round(var(amostras_y), digits = 4))

virgula(x) = replace(string(round(x, digits = 2)), "." =&gt; ",")

x_vals = -4:0.01:4
p1 = histogram(amostras_x; bins = 50, normalize = :pdf,
    title = "X ~ N(0, 1)", label = "Amostras",
    color = :steelblue, lw = 0, alpha = 0.6, formatter = virgula)
plot!(p1, x_vals, pdf.(X, x_vals); lw = 2, color = :darkred, label = "Densidade teórica")

# A densidade da qui-quadrado vai a infinito em 0; a curva começa em 0,05
y_vals = 0.05:0.01:8
p2 = histogram(amostras_y; bins = 0:0.2:8, normalize = :pdf,
    title = "Y = X² ~ χ²(1)", label = "Amostras",
    color = :steelblue, lw = 0, alpha = 0.6, xlims = (0, 8), ylims = (0, 1.5),
    formatter = virgula)
plot!(p2, y_vals, pdf.(Chisq(1), y_vals); lw = 2, color = :darkred, label = "Densidade teórica")

plot(p1, p2; layout = (1, 2), size = (800, 400))
savefig("transformacao_qui_quadrado.png")</code></pre>
  </div>
</div>

#### Saída esperada:
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>Média de Y nas amostras:     0.9894</div>
  <div>Variância de Y nas amostras: 2.0167</div>
</div>

![Dois histogramas: à esquerda, amostras da normal padrão com a curva teórica; à direita, os quadrados dessas amostras com a curva da qui-quadrado com 1 grau de liberdade]({{ site.baseurl }}/assets/images/transformacao_qui_quadrado.png)
<div class="image-caption">Figura 1: Amostras de X ~ N(0, 1) (esquerda) e de Y = X² (direita), com as densidades teóricas da normal padrão e da χ²(1). Os histogramas acompanham as curvas.</div>

### 4.2 Simulação de Variáveis Aleatórias

Simular é sortear muitos valores de uma distribuição e comparar o que sai com a teoria. Abaixo, três exemplos.

#### Binomial(n, p)
Função de probabilidade:

$$P(X = k) = \binom{n}{k}p^k(1-p)^{n-k}, \quad k = 0, 1, \ldots, n$$

Para $n = 10$ e $p = 0{,}3$:

$$P(X = k) = \binom{10}{k}(0{,}3)^k(0{,}7)^{10-k}$$

$$E[X] = np = 10 \cdot 0{,}3 = 3$$

$$Var(X) = np(1-p) = 10 \cdot 0{,}3 \cdot 0{,}7 = 2{,}1$$

#### Normal(μ, σ)
Função densidade de probabilidade:

$$f(x) = \frac{1}{\sqrt{2\pi\sigma^2}} e^{-\frac{(x-\mu)^2}{2\sigma^2}}$$

Para $\mu = 0$ e $\sigma = 1$:

$$f(x) = \frac{1}{\sqrt{2\pi}} e^{-\frac{x^2}{2}}$$

$$E[X] = \mu = 0$$

$$Var(X) = \sigma^2 = 1$$

#### Exponencial(λ)
Função densidade de probabilidade, com taxa $\lambda > 0$:

$$f(x) = \lambda e^{-\lambda x}, \quad x \geq 0$$

Para $\lambda = 2$:

$$f(x) = 2e^{-2x}, \quad x \geq 0$$

$$E[X] = \frac{1}{\lambda} = \frac{1}{2} = 0{,}5$$

$$Var(X) = \frac{1}{\lambda^2} = \frac{1}{4} = 0{,}25$$

<div style="border-left: 4px solid #ff9800; padding: 0.5em; background-color: #fff3e0; margin: 1em 0;">
  <strong>⚠️ Atenção à parametrização da exponencial</strong><br>
  No Julia, <code>Exponential(θ)</code> recebe a <strong>escala</strong> $\theta = 1/\lambda$, que é a média, e não a taxa $\lambda$. Para $\lambda = 2$, o certo é <code>Exponential(1/2)</code>; <code>Exponential(2)</code> teria média 2, ou seja, $\lambda = 0{,}5$. (Uma versão anterior desta página tinha esse erro no código.)
</div>

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Distributions, Statistics, Plots, Random
using Measures

Random.seed!(123)
n_amostras = 1_000

# 1. Discreta: Binomial com n = 10 e p = 0,3
X_bin = Binomial(10, 0.3)
amostras_bin = rand(X_bin, n_amostras)

# 2. Contínua: normal padrão
X_norm = Normal(0, 1)
amostras_norm = rand(X_norm, n_amostras)

# 3. Contínua: exponencial com taxa λ = 2
λ = 2
# Atenção: no Julia, Exponential(θ) recebe a ESCALA θ = 1/λ (a média), não a taxa λ
X_exp = Exponential(1 / λ)
amostras_exp = rand(X_exp, n_amostras)

for (nome, dist, amostras) in (("Binomial(10; 0,3)", X_bin, amostras_bin),
                               ("Normal(0, 1)", X_norm, amostras_norm),
                               ("Exponencial(λ = 2)", X_exp, amostras_exp))
    println(nome, ": média teórica = ", round(mean(dist), digits = 4),
            "; média amostral = ", round(mean(amostras), digits = 4),
            "; variância teórica = ", round(var(dist), digits = 4),
            "; variância amostral = ", round(var(amostras), digits = 4))
end

virgula(x) = replace(string(round(x, digits = 2)), "." =&gt; ",")

# Binomial: proporção observada de cada valor × probabilidade exata
k = 0:10
proporcoes = [count(==(i), amostras_bin) / n_amostras for i in k]
p1 = bar(k, proporcoes; label = "Amostras", color = :steelblue, alpha = 0.6, lw = 0,
    title = "Binomial(10; 0,3)", xticks = k, ylims = (0, 0.32), yformatter = virgula)
scatter!(p1, k, pdf.(X_bin, k); color = :darkred, label = "P(X = k) teórica")

x_norm = -4:0.01:4
p2 = histogram(amostras_norm; bins = 30, normalize = :pdf, color = :steelblue, alpha = 0.6,
    lw = 0, title = "Normal(0, 1)", label = "Amostras", ylims = (0, 0.5), formatter = virgula)
plot!(p2, x_norm, pdf.(X_norm, x_norm); lw = 2, color = :darkred, label = "Densidade teórica")

x_exp = 0:0.01:3
p3 = histogram(amostras_exp; bins = 30, normalize = :pdf, color = :steelblue, alpha = 0.6,
    lw = 0, title = "Exponencial(λ = 2)", label = "Amostras",
    formatter = virgula)
plot!(p3, x_exp, pdf.(X_exp, x_exp); lw = 2, color = :darkred, label = "Densidade teórica")

plot(p1, p2, p3; layout = (1, 3), size = (1200, 400), bottom_margin = 5mm, left_margin = 5mm)
savefig("simulacao_variaveis_aleatorias.png")</code></pre>
  </div>
</div>

#### Saída esperada:
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>Binomial(10; 0,3): média teórica = 3.0; média amostral = 2.99; variância teórica = 2.1; variância amostral = 2.104</div>
  <div>Normal(0, 1): média teórica = 0.0; média amostral = -0.0316; variância teórica = 1.0; variância amostral = 0.9492</div>
  <div>Exponencial(λ = 2): média teórica = 0.5; média amostral = 0.4834; variância teórica = 0.25; variância amostral = 0.2521</div>
</div>

![Três painéis: proporções simuladas da binomial com n = 10 e p = 0,3 com as probabilidades teóricas, histograma da normal padrão e histograma da exponencial com taxa 2, ambos com a densidade teórica]({{ site.baseurl }}/assets/images/simulacao_variaveis_aleatorias.png)
<div class="image-caption">Figura 2: Simulação de 1.000 valores de cada distribuição: Binomial (esquerda, barras simuladas e pontos teóricos), Normal (centro) e Exponencial com λ = 2 (direita), com as densidades teóricas.</div>

**Interpretação:** com 1.000 sorteios, as médias e variâncias amostrais ficam perto das teóricas, mas não iguais (por exemplo, 0,9492 contra 1 na normal). A diferença é a variação natural de amostra para amostra, e diminui quando o número de sorteios aumenta.

---

## 5. Aplicações Práticas

### Engenharia
- Controle de qualidade
- Análise de confiabilidade
- Processamento de sinais

### Finanças
- Análise de risco
- Precificação de ativos

### Ciências Naturais
- Genética
- Ecologia de populações

### Computação
- Aprendizado de máquina
- Simulações
- Análise de algoritmos

<div style="border-left: 4px solid #2196F3; padding: 0.5em; background-color: #e3f2fd; margin: 1em 0;">
  <strong>💡 Exemplo de Aplicação</strong><br>
  Em aprendizado de máquina, variáveis aleatórias são usadas para modelar incertezas e fazer previsões probabilísticas.
</div>

Para as distribuições mais usadas, com fórmulas e exemplos resolvidos, veja [Distribuições de Probabilidade]({{ '/pt/probabilidade/distribuicoes' | relative_url }}).

---

## Referências

1. Bussab, W. O.; Morettin, P. A. (2023). *Estatística Básica*. 10. ed. Saraiva Uni.
2. Papoulis, A.; Pillai, S. U. (2002). *Probability, Random Variables and Stochastic Processes*. 4th ed. McGraw-Hill.
3. Ross, S. M. (2019). *Introduction to Probability Models*. 12th ed. Academic Press.
