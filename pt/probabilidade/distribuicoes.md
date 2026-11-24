---
layout: page
title: Distribuições de Probabilidade
lang: pt
ref: distribuicoes
parent: probabilidade
permalink: /pt/probabilidade/distribuicoes
order: 1
mathjax: true
description: "Bernoulli, binomial, Poisson, normal, exponencial e uniforme: fórmulas, média, variância, exemplos resolvidos à mão e código em Julia."
---

As **distribuições de probabilidade** são funções matemáticas que descrevem a probabilidade de diferentes resultados para uma variável aleatória. Elas são fundamentais na estatística e na ciência de dados, permitindo modelar e entender fenômenos aleatórios em diversas áreas do conhecimento.

Os exemplos desta página usam **números ilustrativos**, escolhidos para que as contas fiquem simples de conferir à mão. O código em Julia de cada seção gera a figura correspondente; nas saídas, o Julia escreve os números com ponto decimal (0.6 em vez de 0,6).

<div style="border-left: 4px solid #4CAF50; padding: 0.5em; background-color: #e8f5e9;">
  <strong>📊 Importante:</strong> Escolher a distribuição adequada é essencial para a <strong>análise estatística correta</strong>.<br>
  Cada distribuição tem <em>pressupostos e aplicações específicas</em> que devem ser considerados.
</div>

---

## Símbolos e Conceitos Fundamentais

### Variáveis Aleatórias

- **Variável Aleatória Discreta**: assume valores em um conjunto finito ou infinito enumerável (que pode ser listado: 0, 1, 2, …).
  - Exemplo: número de clientes em uma fila, número de acidentes por dia.

- **Variável Aleatória Contínua**: assume valores em um intervalo de números reais.
  - Exemplo: peso, altura, tempo de espera.

### Funções de Probabilidade

- **Função de probabilidade (discreta)**: $P(X = x_i) = p_i$
- **Função densidade de probabilidade (contínua)**: $f(x)$ tal que $P(a \leq X \leq b) = \int_a^b f(x)\,dx$
- **Função de distribuição acumulada (FDA)**: $F(x) = P(X \leq x)$

Em todas as seções, $\mu$ é a média (o valor esperado) e $\sigma^2$ é a variância da distribuição; $\sigma$ é o desvio padrão.

---

## 1. Distribuições Discretas

### 1.1 Distribuição de Bernoulli

Modela um experimento com apenas dois resultados possíveis, chamados de sucesso ($X = 1$) e fracasso ($X = 0$).

#### Parâmetros
- $p$: probabilidade de sucesso ($0 \leq p \leq 1$)

#### Função de Probabilidade
$$P(X = x) = p^x(1-p)^{1-x}, \quad x \in \{0, 1\}$$

#### Média e Variância
- Média: $\mu = p$
- Variância: $\sigma^2 = p(1-p)$

#### Aplicações
- Modelagem de sucesso/falha
- Testes binários (ex.: uma peça passa ou não no controle de qualidade)

<div style="border-left: 4px solid #2196F3; padding: 0.5em; background-color: #e3f2fd; margin: 1em 0;">
  <strong>💡 Exemplo</strong><br>
  Uma moeda viciada dá cara (sucesso, $X = 1$) com probabilidade $p = 0{,}6$. Quais são as probabilidades de cada resultado, a média e a variância?
</div>

#### Resolução à mão

**Dados:** $p = 0{,}6$ (do enunciado) e, portanto, $1 - p = 1 - 0{,}6 = 0{,}4$.

**Fórmula:** $P(X = x) = p^x(1-p)^{1-x}$, com $x = 0$ ou $x = 1$.

**Substituição e conta**, uma probabilidade por vez:

$$P(X = 1) = 0{,}6^{1} \cdot 0{,}4^{0} = 0{,}6 \cdot 1 = 0{,}6$$

$$P(X = 0) = 0{,}6^{0} \cdot 0{,}4^{1} = 1 \cdot 0{,}4 = 0{,}4$$

$$\mu = p = 0{,}6$$

$$\sigma^2 = p(1-p) = 0{,}6 \cdot 0{,}4 = 0{,}24$$

**Interpretação:** em muitos lançamentos, cerca de 60% darão cara. A média 0,6 não é um resultado possível de um lançamento, que só dá 0 ou 1: ela é a proporção de caras no longo prazo.

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

# X = 1 se sair cara (sucesso) e X = 0 se sair coroa; P(cara) = 0,6
p = 0.6
d = Bernoulli(p)

# Probabilidades exatas de cada resultado
probs = pdf.(d, [0, 1])
println("P(X = 0) = ", probs[1])
println("P(X = 1) = ", probs[2])
println("Média = ", mean(d), "   Variância = ", round(var(d), digits = 4))

# Vírgula decimal nos rótulos do gráfico
virgula(x) = replace(string(round(x, digits = 2)), "." =&gt; ",")

bar([0, 1], probs;
    legend = false,
    title = "Distribuição de Bernoulli (p = 0,6)",
    xlabel = "Resultado do lançamento",
    ylabel = "Probabilidade P(X = x)",
    xticks = ([0, 1], ["Coroa (X = 0)", "Cara (X = 1)"]),
    ylims = (0, 0.75), yformatter = virgula,
    color = :steelblue, alpha = 0.7, lw = 0, bar_width = 0.5)
annotate!([(x, pr + 0.03, text(virgula(pr), 10)) for (x, pr) in zip([0, 1], probs)])
savefig("bernoulli_histogram.png")</code></pre>
  </div>
</div>

#### Saída esperada:
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>P(X = 0) = 0.4</div>
  <div>P(X = 1) = 0.6</div>
  <div>Média = 0.6   Variância = 0.24</div>
</div>

![Gráfico de barras da distribuição de Bernoulli com p = 0,6: barra de 0,4 para coroa e de 0,6 para cara]({{ site.baseurl }}/assets/images/bernoulli_histogram.png)
<div class="image-caption">Figura 1: Probabilidades da Bernoulli com p = 0,6: P(X = 0) = 0,4 (coroa) e P(X = 1) = 0,6 (cara).</div>

### 1.2 Distribuição Binomial

Modela o número de sucessos em $n$ tentativas de Bernoulli **independentes**, todas com a mesma probabilidade $p$ de sucesso.

#### Parâmetros
- $n$: número de tentativas
- $p$: probabilidade de sucesso em cada tentativa ($0 \leq p \leq 1$)

#### Função de Probabilidade
$$P(X = k) = C(n,k) \cdot p^k (1-p)^{n-k}, \quad k = 0, 1, 2, \ldots, n$$

onde $C(n,k) = \frac{n!}{k!(n-k)!}$ é o coeficiente binomial: o número de maneiras de escolher em quais das $n$ tentativas ocorrem os $k$ sucessos.

#### Média e Variância
- Média: $\mu = np$
- Variância: $\sigma^2 = np(1-p)$

#### Aplicações
- Controle de qualidade (peças defeituosas num lote)
- Pesquisas de opinião (quantos entrevistados dizem "sim")
- Testes de múltipla escolha (acertos no chute)

<div style="border-left: 4px solid #2196F3; padding: 0.5em; background-color: #e3f2fd; margin: 1em 0;">
  <strong>💡 Exemplo</strong><br>
  Uma moeda honesta é lançada 10 vezes. Qual é a probabilidade de sair exatamente 5 caras?
</div>

#### Resolução à mão

**Dados** (do enunciado): $n = 10$ lançamentos, $p = 0{,}5$ (moeda honesta) e $k = 5$ caras. Daí, $1 - p = 0{,}5$ e $n - k = 10 - 5 = 5$.

**Condição:** os lançamentos são independentes e $p$ é o mesmo em todos, então o modelo binomial se aplica.

**Fórmula:** $P(X = k) = C(n,k) \cdot p^k (1-p)^{n-k}$.

**Substituição:**

$$P(X = 5) = C(10, 5) \cdot 0{,}5^{5} \cdot 0{,}5^{5}$$

**Conta**, um passo por linha. Primeiro o coeficiente binomial:

$$C(10, 5) = \frac{10!}{5! \cdot 5!} = \frac{3.628.800}{120 \cdot 120} = \frac{3.628.800}{14.400} = 252$$

Depois as potências e o produto:

$$0{,}5^{5} = 0{,}03125$$

$$0{,}5^{5} \cdot 0{,}5^{5} = 0{,}03125 \cdot 0{,}03125 = 0{,}0009765625$$

$$P(X = 5) = 252 \cdot 0{,}0009765625 = 0{,}24609375$$

**Resultado:** $P(X = 5) = 0{,}24609375 \approx 0{,}2461$ (quatro casas).

Média e variância do número de caras:

$$\mu = np = 10 \cdot 0{,}5 = 5 \qquad \sigma^2 = np(1-p) = 10 \cdot 0{,}5 \cdot 0{,}5 = 2{,}5 \qquad \sigma = \sqrt{2{,}5} \approx 1{,}5811$$

**Interpretação:** mesmo com uma moeda honesta, sair exatamente 5 caras em 10 lançamentos acontece em só cerca de 1 de cada 4 sequências (24,61%). O valor 5 é o mais provável e é a média, mas está longe de ser garantido.

<div style="border-left: 4px solid #ff9800; padding: 0.5em; background-color: #fff3e0; margin: 1em 0;">
  <strong>⚠️ Aproximação normal da binomial</strong><br>
  Quando $n$ é grande, a binomial pode ser aproximada por uma normal com a mesma média $np$ e o mesmo desvio padrão $\sqrt{np(1-p)}$. A regra de bolso usual pede $np \geq 5$ e $n(1-p) \geq 5$; aqui $np = 5$ e $n(1-p) = 5$, exatamente no limite. Como a binomial só assume valores inteiros, usa-se a <strong>correção de continuidade</strong>: o valor 5 vira o intervalo de 4,5 a 5,5. O código abaixo faz essa conta e obtém 0,2482, perto do valor exato 0,2461. Com $np$ ou $n(1-p)$ menores que 5, a aproximação piora; nesse caso, use a binomial exata.
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
    <pre><code>using Distributions, Plots

# Número de caras em 10 lançamentos de uma moeda honesta
n, p = 10, 0.5
d_bin = Binomial(n, p)

# Probabilidade exata de sair exatamente 5 caras
println("P(X = 5) exata = ", round(pdf(d_bin, 5), digits = 4))

# Normal com a mesma média (np) e o mesmo desvio padrão (√(np(1 − p)))
μ = n * p
σ = sqrt(n * p * (1 - p))
d_normal = Normal(μ, σ)   # Normal(μ, σ) recebe o desvio padrão, não a variância

# Correção de continuidade: o valor inteiro 5 vira o intervalo de 4,5 a 5,5
p5_aprox = cdf(d_normal, 5.5) - cdf(d_normal, 4.5)
println("P(X = 5) pela normal, com correção de continuidade = ", round(p5_aprox, digits = 4))

virgula(x) = replace(string(round(x, digits = 2)), "." =&gt; ",")

k = 0:n
bar(k, pdf.(d_bin, k);
    label = "Binomial (exata)",
    title = "Binomial (n = 10, p = 0,5) e aproximação normal",
    xlabel = "Número de caras (k)",
    ylabel = "Probabilidade P(X = k)",
    xticks = k, ylims = (0, 0.3), yformatter = virgula,
    color = :steelblue, alpha = 0.6, lw = 0, bar_width = 0.8)
x_curva = range(0, n, length = 200)
plot!(x_curva, pdf.(d_normal, x_curva);
      lw = 2, color = :darkred, label = "Normal (μ = 5; σ ≈ 1,58)")
savefig("binomial_normal_approximation.png")</code></pre>
  </div>
</div>

#### Saída esperada:
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>P(X = 5) exata = 0.2461</div>
  <div>P(X = 5) pela normal, com correção de continuidade = 0.2482</div>
</div>

![Barras da distribuição binomial com n = 10 e p = 0,5, com a curva da normal de média 5 sobreposta]({{ site.baseurl }}/assets/images/binomial_normal_approximation.png)
<div class="image-caption">Figura 2: Binomial com n = 10 e p = 0,5 (barras) e a normal com μ = 5 e σ ≈ 1,58 (curva). A curva acompanha bem o topo das barras.</div>

### 1.3 Distribuição de Poisson

Usada para contar quantos eventos ocorrem em um intervalo fixo de tempo ou de espaço, quando os eventos acontecem de forma independente uns dos outros, a uma taxa média constante, e dois eventos não ocorrem exatamente no mesmo instante.

#### Parâmetro
- $\lambda$: número médio de ocorrências no intervalo ($\lambda > 0$)

#### Função de Probabilidade
$$P(X = k) = \frac{e^{-\lambda} \lambda^k}{k!}, \quad k = 0, 1, 2, \ldots$$

#### Média e Variância
- Média: $\mu = \lambda$
- Variância: $\sigma^2 = \lambda$

#### Aplicações
- Número de chamadas em uma central telefônica por hora
- Número de acidentes em uma rodovia por mês
- Número de erros de digitação por página

<div style="border-left: 4px solid #2196F3; padding: 0.5em; background-color: #e3f2fd; margin: 1em 0;">
  <strong>💡 Exemplo</strong><br>
  Uma central recebe, em média, 5 chamadas por hora ($\lambda = 5$). Qual é a probabilidade de chegarem exatamente 3 chamadas em uma hora?
</div>

#### Resolução à mão

**Dados** (do enunciado): $\lambda = 5$ chamadas por hora e $k = 3$ chamadas.

**Condição:** as chamadas chegam de forma independente e a taxa média é a mesma ao longo da hora.

**Fórmula:** $P(X = k) = \dfrac{e^{-\lambda} \lambda^k}{k!}$.

**Substituição:**

$$P(X = 3) = \frac{e^{-5} \cdot 5^{3}}{3!}$$

**Conta:**

$$5^{3} = 5 \cdot 5 \cdot 5 = 125$$

$$3! = 3 \cdot 2 \cdot 1 = 6$$

$$e^{-5} \approx 0{,}006737947 \quad \text{(calculadora)}$$

$$e^{-5} \cdot 125 \approx 0{,}006737947 \cdot 125 = 0{,}842243$$

$$P(X = 3) \approx \frac{0{,}842243}{6} = 0{,}140374$$

**Resultado:** $P(X = 3) \approx 0{,}1404$ (quatro casas).

**Interpretação:** em cerca de 14% das horas chegam exatamente 3 chamadas. Na Poisson, a média e a variância são iguais ($\lambda = 5$). Se, em dados reais, a variância das contagens for muito maior que a média, o modelo de Poisson provavelmente não serve (os eventos podem não ser independentes, ou a taxa pode variar).

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

# Chamadas que chegam a uma central: em média, 5 por hora
λ = 5
d = Poisson(λ)

println("P(X = 3) = ", round(pdf(d, 3), digits = 4))
println("Média = ", mean(d), "   Variância = ", var(d))

virgula(x) = replace(string(round(x, digits = 2)), "." =&gt; ",")

k = 0:15
bar(k, pdf.(d, k);
    label = "P(X = k)",
    title = "Distribuição de Poisson (λ = 5)",
    xlabel = "Número de chamadas em uma hora (k)",
    ylabel = "Probabilidade P(X = k)",
    xticks = k, ylims = (0, 0.2), yformatter = virgula,
    color = :steelblue, alpha = 0.6, lw = 0, bar_width = 0.8)
vline!([λ]; ls = :dash, lw = 2, color = :darkred, label = "Média λ = 5")
savefig("poisson_distribution.png")</code></pre>
  </div>
</div>

#### Saída esperada:
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>P(X = 3) = 0.1404</div>
  <div>Média = 5.0   Variância = 5.0</div>
</div>

![Gráfico de barras da distribuição de Poisson com λ = 5, com pico em 4 e 5 chamadas e uma linha tracejada na média]({{ site.baseurl }}/assets/images/poisson_distribution.png)
<div class="image-caption">Figura 3: Probabilidades da Poisson com λ = 5. A linha tracejada marca a média; 4 e 5 chamadas são os valores mais prováveis.</div>

<div style="border-left: 4px solid #9c27b0; padding: 0.5em; background-color: #f3e5f5; margin: 1em 0;">
  <strong>🔍 Curiosidade Histórica</strong><br>
  A distribuição leva o nome de Siméon Denis Poisson, que a discutiu em 1837 no livro <em>Recherches sur la probabilité des jugements en matière criminelle et en matière civile</em>. Stigler (1982) traduz para o inglês toda a discussão de Poisson sobre a distribuição e aponta a relação dela com um trabalho anterior de Abraham de Moivre.
</div>

---

## 2. Distribuições Contínuas

### 2.1 Distribuição Normal (Gaussiana)

A distribuição mais usada em estatística, com forma de sino simétrico.

#### Parâmetros
- $\mu$: média (posição do pico)
- $\sigma$: desvio padrão (largura da curva, $\sigma > 0$)

A notação $N(\mu, \sigma^2)$ usa a **variância** $\sigma^2$; já a função `Normal(μ, σ)` do Julia recebe o **desvio padrão** $\sigma$.

#### Função Densidade de Probabilidade
$$f(x) = \frac{1}{\sqrt{2\pi\sigma^2}} e^{-\frac{(x-\mu)^2}{2\sigma^2}}$$

#### Propriedades
- Simétrica em relação à média: $f(\mu + t) = f(\mu - t)$ para todo $t$
- Média = mediana = moda = $\mu$
- Cerca de 68% da probabilidade fica entre $\mu - \sigma$ e $\mu + \sigma$ (com mais casas, 68,27%)
- Cerca de 95% fica entre $\mu - 2\sigma$ e $\mu + 2\sigma$ (95,45%)
- Cerca de 99,7% fica entre $\mu - 3\sigma$ e $\mu + 3\sigma$ (99,73%)

#### Aplicações
- Altura e peso de adultos (aproximadamente)
- Erros de medição
- Médias de amostras grandes (pelo [Teorema do Limite Central]({{ '/pt/probabilidade/teorema-limite-central' | relative_url }}))

<div style="border-left: 4px solid #2196F3; padding: 0.5em; background-color: #e3f2fd; margin: 1em 0;">
  <strong>💡 Exemplo</strong><br>
  As alturas de uma população seguem, aproximadamente, uma normal com $\mu = 170$ cm e $\sigma = 10$ cm. Que proporção das pessoas tem mais de 185 cm?
</div>

#### Resolução à mão

**Dados** (do enunciado): $\mu = 170$ cm, $\sigma = 10$ cm e o valor de corte $x = 185$ cm.

**Fórmula:** o escore Z diz quantos desvios padrão um valor está acima da média:

$$Z = \frac{X - \mu}{\sigma}$$

e, pela regra do complemento, $P(X > x) = 1 - P(X \leq x) = 1 - P(Z \leq z)$.

**Substituição:**

$$z = \frac{185 - 170}{10}$$

**Conta:**

$$185 - 170 = 15$$

$$z = \frac{15}{10} = 1{,}5$$

$$P(Z \leq 1{,}5) = 0{,}9332 \quad \text{(tabela Z)}$$

$$P(X > 185) = 1 - 0{,}9332 = 0{,}0668$$

**Resultado:** $P(X > 185) \approx 0{,}0668$, ou seja, 6,68%.

**Interpretação:** cerca de 6,7% das pessoas dessa população têm mais de 185 cm, aproximadamente 1 em cada 15. Isso vale só enquanto o modelo normal descreve bem as alturas: dados reais costumam se afastar da normal nas caudas, onde estão os valores muito altos ou muito baixos.

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

# Alturas: média 170 cm e desvio padrão 10 cm (números ilustrativos)
μ, σ = 170, 10
d = Normal(μ, σ)   # Normal(μ, σ) recebe o desvio padrão σ, não a variância σ²

# P(X &gt; 185) = 1 − P(X ≤ 185)
println("P(X &gt; 185) = ", round(1 - cdf(d, 185), digits = 4))

# Probabilidade a até 1, 2 e 3 desvios padrão da média
for k in 1:3
    prob = cdf(d, μ + k * σ) - cdf(d, μ - k * σ)
    println("P(μ − $(k)σ ≤ X ≤ μ + $(k)σ) = ", round(prob, digits = 4))
end

virgula(x) = replace(string(round(x, digits = 3)), "." =&gt; ",")

x = 130:0.1:210
plot(x, pdf.(d, x);
     lw = 2, color = :steelblue, label = "Densidade f(x)",
     title = "Distribuição normal (μ = 170 cm; σ = 10 cm)",
     xlabel = "Altura (cm)",
     ylabel = "Densidade de probabilidade",
     yformatter = virgula)
x_cauda = 185:0.1:210
plot!(x_cauda, pdf.(d, x_cauda);
      fillrange = 0, fillalpha = 0.4, color = :darkred, lw = 0, label = "P(X &gt; 185)")
vline!([μ]; ls = :dash, color = :black, label = "μ = 170")
savefig("normal_distribution_alturas.png")</code></pre>
  </div>
</div>

#### Saída esperada:
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>P(X &gt; 185) = 0.0668</div>
  <div>P(μ − 1σ ≤ X ≤ μ + 1σ) = 0.6827</div>
  <div>P(μ − 2σ ≤ X ≤ μ + 2σ) = 0.9545</div>
  <div>P(μ − 3σ ≤ X ≤ μ + 3σ) = 0.9973</div>
</div>

![Curva normal com média 170 cm e desvio padrão 10 cm, com a cauda acima de 185 cm sombreada]({{ site.baseurl }}/assets/images/normal_distribution_alturas.png)
<div class="image-caption">Figura 4: Normal com μ = 170 cm e σ = 10 cm. A área sombreada é P(X > 185) ≈ 0,0668.</div>

### 2.2 Distribuição Exponencial

Modela o tempo até o próximo evento quando os eventos seguem um processo de Poisson (independentes, a uma taxa constante $\lambda$).

#### Parâmetro
- $\lambda$: taxa de ocorrência, em eventos por unidade de tempo ($\lambda > 0$)

#### Função Densidade e Função Acumulada
$$f(x) = \lambda e^{-\lambda x}, \quad x \geq 0$$

$$F(x) = P(X \leq x) = 1 - e^{-\lambda x}, \quad x \geq 0$$

#### Média e Variância
- Média: $\mu = 1/\lambda$
- Variância: $\sigma^2 = 1/\lambda^2$

#### Aplicações
- Tempo entre chamadas telefônicas
- Vida útil de componentes eletrônicos que não se desgastam com o uso
- Tempo de espera em filas

<div style="border-left: 4px solid #ff9800; padding: 0.5em; background-color: #fff3e0; margin: 1em 0;">
  <strong>⚠️ Atenção à parametrização</strong><br>
  Alguns livros e programas descrevem a exponencial pela <strong>taxa</strong> $\lambda$; outros, pela <strong>escala</strong> $\theta = 1/\lambda$, que é a própria média. No Julia, <code>Exponential(θ)</code> recebe a escala: <code>Exponential(2)</code> tem média 2, ou seja, $\lambda = 0{,}5$. No R, <code>rexp(n, rate)</code> recebe a taxa; no SciPy, o argumento é <code>scale</code>.
</div>

<div style="border-left: 4px solid #2196F3; padding: 0.5em; background-color: #e3f2fd; margin: 1em 0;">
  <strong>💡 Exemplo</strong><br>
  Clientes chegam a um banco à taxa de $\lambda = 0{,}5$ cliente por minuto. Qual é a probabilidade de o próximo cliente chegar em até 2 minutos?
</div>

#### Resolução à mão

**Dados** (do enunciado): $\lambda = 0{,}5$ por minuto e $x = 2$ minutos.

**Fórmula:** $P(X \leq x) = F(x) = 1 - e^{-\lambda x}$.

**Substituição:**

$$P(X \leq 2) = 1 - e^{-0{,}5 \cdot 2}$$

**Conta:**

$$0{,}5 \cdot 2 = 1$$

$$e^{-1} \approx 0{,}367879 \quad \text{(calculadora)}$$

$$P(X \leq 2) \approx 1 - 0{,}367879 = 0{,}632121$$

**Resultado:** $P(X \leq 2) \approx 0{,}6321$ (quatro casas).

Média e variância do tempo de espera:

$$\mu = \frac{1}{\lambda} = \frac{1}{0{,}5} = 2 \text{ min} \qquad \sigma^2 = \frac{1}{\lambda^2} = \frac{1}{0{,}25} = 4 \text{ min}^2 \qquad \sigma = 2 \text{ min}$$

**Interpretação:** em cerca de 63% das vezes o próximo cliente chega em até 2 minutos, mesmo sendo 2 minutos o tempo médio. Isso acontece porque a distribuição é assimétrica: há muitas esperas curtas e algumas longas, que puxam a média para cima. A mediana, calculada pelo código abaixo, é de cerca de 1,39 minuto. O modelo não serve quando a taxa muda ao longo do tempo (por exemplo, no horário de pico).

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

# Clientes chegam a uma taxa de λ = 0,5 por minuto
λ = 0.5
# Atenção: no Julia, Exponential(θ) recebe a ESCALA θ = 1/λ (que é a média), não a taxa λ
d = Exponential(1 / λ)

println("Média = ", mean(d), " min   Variância = ", var(d), " min²")
println("Mediana = ", round(median(d), digits = 4), " min")
println("P(X ≤ 2) = ", round(cdf(d, 2), digits = 4))

virgula(x) = replace(string(round(x, digits = 2)), "." =&gt; ",")

x = 0:0.01:10
plot(x, pdf.(d, x);
     lw = 2, color = :steelblue, label = "Densidade f(x)",
     title = "Distribuição exponencial (λ = 0,5 por minuto)",
     xlabel = "Tempo até a próxima chegada (min)",
     ylabel = "Densidade de probabilidade",
     xformatter = virgula, yformatter = virgula)
x_ate2 = 0:0.01:2
plot!(x_ate2, pdf.(d, x_ate2);
      fillrange = 0, fillalpha = 0.4, color = :darkred, lw = 0, label = "P(X ≤ 2) ≈ 0,63")
vline!([mean(d)]; ls = :dash, color = :black, label = "Média = 2 min")
savefig("exponential_distribution.png")</code></pre>
  </div>
</div>

#### Saída esperada:
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>Média = 2.0 min   Variância = 4.0 min²</div>
  <div>Mediana = 1.3863 min</div>
  <div>P(X ≤ 2) = 0.6321</div>
</div>

![Curva decrescente da densidade exponencial com λ = 0,5, com a área de 0 a 2 minutos sombreada e uma linha tracejada na média de 2 minutos]({{ site.baseurl }}/assets/images/exponential_distribution.png)
<div class="image-caption">Figura 5: Exponencial com λ = 0,5 por minuto. A área sombreada é P(X ≤ 2) ≈ 0,6321; a linha tracejada marca a média, 2 minutos.</div>

### 2.3 Distribuição Uniforme Contínua

Todos os intervalos de mesmo comprimento dentro de $[a, b]$ têm a mesma probabilidade.

#### Parâmetros
- $a$: limite inferior
- $b$: limite superior ($a < b$)

#### Função Densidade de Probabilidade
$$f(x) = \frac{1}{b-a}, \quad a \leq x \leq b \qquad (\text{e } f(x) = 0 \text{ fora de } [a, b])$$

Para $a \leq c \leq d \leq b$:

$$P(c \leq X \leq d) = \frac{d - c}{b - a}$$

#### Média e Variância
- Média: $\mu = \frac{a+b}{2}$
- Variância: $\sigma^2 = \frac{(b-a)^2}{12}$

#### Aplicações
- Geração de números aleatórios
- Modelagem de situações em que nenhum valor do intervalo é mais provável que outro
- Simulações computacionais

<div style="border-left: 4px solid #2196F3; padding: 0.5em; background-color: #e3f2fd; margin: 1em 0;">
  <strong>💡 Exemplo</strong><br>
  Um número é sorteado ao acaso entre 0 e 1. Qual é a probabilidade de ele cair entre 0,2 e 0,5?
</div>

#### Resolução à mão

**Dados** (do enunciado): $a = 0$, $b = 1$, $c = 0{,}2$ e $d = 0{,}5$.

**Fórmula:** $P(c \leq X \leq d) = \dfrac{d - c}{b - a}$.

**Substituição:**

$$P(0{,}2 \leq X \leq 0{,}5) = \frac{0{,}5 - 0{,}2}{1 - 0}$$

**Conta:**

$$0{,}5 - 0{,}2 = 0{,}3$$

$$1 - 0 = 1$$

$$P(0{,}2 \leq X \leq 0{,}5) = \frac{0{,}3}{1} = 0{,}3$$

Média e variância:

$$\mu = \frac{0 + 1}{2} = 0{,}5 \qquad \sigma^2 = \frac{(1 - 0)^2}{12} = \frac{1}{12} \approx 0{,}0833$$

**Interpretação:** 30% dos sorteios caem entre 0,2 e 0,5, exatamente a fração do intervalo [0, 1] que esse trecho ocupa. Numa distribuição contínua, a probabilidade de um valor exato (como $X = 0{,}3$) é zero: só intervalos têm probabilidade positiva.

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

# Número sorteado ao acaso entre 0 e 1
a, b = 0, 1
d = Uniform(a, b)

println("Média = ", mean(d), "   Variância = ", round(var(d), digits = 4))
println("P(0,2 ≤ X ≤ 0,5) = ", round(cdf(d, 0.5) - cdf(d, 0.2), digits = 4))

virgula(x) = replace(string(round(x, digits = 2)), "." =&gt; ",")

x = -0.5:0.001:1.5
plot(x, pdf.(d, x);
     lw = 2, color = :steelblue, label = "Densidade f(x)",
     title = "Distribuição uniforme contínua em [0, 1]",
     xlabel = "Valor de x",
     ylabel = "Densidade de probabilidade",
     ylims = (0, 1.3), xformatter = virgula, yformatter = virgula)
x_faixa = 0.2:0.001:0.5
plot!(x_faixa, pdf.(d, x_faixa);
      fillrange = 0, fillalpha = 0.4, color = :darkred, lw = 0, label = "P(0,2 ≤ X ≤ 0,5) = 0,3")
savefig("uniform_distribution.png")</code></pre>
  </div>
</div>

#### Saída esperada:
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>Média = 0.5   Variância = 0.0833</div>
  <div>P(0,2 ≤ X ≤ 0,5) = 0.3</div>
</div>

![Densidade uniforme constante igual a 1 entre 0 e 1, com a faixa de 0,2 a 0,5 sombreada]({{ site.baseurl }}/assets/images/uniform_distribution.png)
<div class="image-caption">Figura 6: Uniforme contínua em [0, 1]. A densidade vale 1 no intervalo e 0 fora dele; a área sombreada é P(0,2 ≤ X ≤ 0,5) = 0,3.</div>

---

## 3. Como Escolher a Distribuição Correta?

1. **Identifique o tipo de variável**: discreta ou contínua?
2. **Analise o domínio dos dados**: quais valores são possíveis? (Só inteiros? Só positivos? Limitados a um intervalo?)
3. **Verifique a forma dos dados**: simétricos, assimétricos, com caudas pesadas?
4. **Considere o fenômeno**: o processo que gera os dados combina com as condições do modelo (independência, taxa constante, número fixo de tentativas)?
5. **Use testes de aderência e gráficos**:
   - Teste qui-quadrado de aderência
   - Teste de Kolmogorov-Smirnov
   - Teste de Anderson-Darling
   - Gráficos Q-Q

<div style="border-left: 4px solid #ff9800; padding: 0.5em; background-color: #fff3e0; margin: 1em 0;">
  <strong>⚠️ Cuidado com Pressupostos!</strong><br>
  A escolha incorreta da distribuição pode levar a <em>conclusões equivocadas</em>. Sempre valide os pressupostos antes de realizar inferências. E lembre que um teste de aderência que não rejeita o modelo não prova que o modelo está certo: só diz que os dados não o contradizem.
</div>

---

## 4. Aplicações Práticas

### Engenharia
- Controle de qualidade (distribuição normal)
- Confiabilidade de sistemas (distribuições exponencial e Weibull)
- Contagem de falhas ou chegadas (distribuição de Poisson)

### Finanças
- Modelagem de riscos (distribuições normal e t de Student, esta com caudas mais pesadas)
- Precificação de opções (distribuição log-normal, no modelo de Black-Scholes)

### Ciências Naturais
- Física: movimento browniano (distribuição normal)
- Física: tempo até o decaimento de um átomo radioativo (distribuição exponencial)
- Biologia: número de mutações ou de colônias de bactérias numa placa (distribuição de Poisson)

### Ciências Sociais
- Pesquisas de opinião (distribuição binomial)
- Psicometria (distribuição normal)

---

## Referências

1. Bussab, W. O.; Morettin, P. A. (2023). *Estatística Básica*. 10. ed. Saraiva Uni.
2. Montgomery, D. C.; Runger, G. C. (2021). *Estatística Aplicada e Probabilidade para Engenheiros*. 7. ed. LTC.
3. Stigler, S. M. (1982). Poisson on the Poisson distribution. *Statistics & Probability Letters*, 1(1), 33–35. DOI: [10.1016/0167-7152(82)90010-4](https://doi.org/10.1016/0167-7152%2882%2990010-4).
4. Triola, M. F. (2024). *Introdução à Estatística*. 14. ed. LTC.
