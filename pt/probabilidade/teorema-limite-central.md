---
layout: page
title: Teorema do Limite Central
lang: pt
ref: teorema-limite-central
parent: probabilidade
permalink: /pt/probabilidade/teorema-limite-central
order: 3
mathjax: true
description: "Teorema do Limite Central: enunciado, condições, exemplo resolvido à mão, simulações em Julia e como ele sustenta intervalos de confiança."
---

O **Teorema do Limite Central (TLC)** é um dos resultados mais importantes da teoria da probabilidade. Ele diz que a média (ou a soma) de muitas variáveis aleatórias independentes e com a mesma distribuição tem distribuição aproximadamente normal, **qualquer que seja a forma da distribuição original**, desde que a variância seja finita.

<div style="border-left: 4px solid #4CAF50; padding: 0.5em; background-color: #e8f5e9;">
  <strong>📊 Importante:</strong> O TLC é fundamental para a <strong>inferência estatística</strong>.<br>
  Ele justifica o uso da distribuição normal para a média amostral e é a base de muitos intervalos de confiança e testes de hipóteses.
</div>

Os códigos em Julia desta página fixam a semente (`Random.seed!(123)`); nas saídas, o Julia escreve os números com ponto decimal (0.1151 em vez de 0,1151).

## 1. Contexto Histórico

### 1.1 Desenvolvimento Histórico

- **Abraham de Moivre (1733)**: estudando o limite da distribuição binomial, chegou à curva normal; é a primeira versão do teorema.
- **Pierre-Simon Laplace**: demonstrou de novo e estendeu o resultado de de Moivre, que por isso é conhecido como teorema de De Moivre–Laplace.
- **Aleksandr Lyapunov (1900, 1901)**: primeira grande generalização, demonstrada com um método novo, o das funções características.
- **Jarl Waldemar Lindeberg (1922)** e **William Feller (1935)**: Lindeberg provou uma condição suficiente para o teorema valer; Feller mostrou que, sob uma condição adicional, ela também é necessária (teorema de Lindeberg–Feller).
- **Paul Lévy**: resultados fundamentais sobre funções características (1922) e, em 1935, uma versão do teorema para somas de variáveis dependentes.
- O nome "teorema do limite central" (*zentraler Grenzwertsatz*) aparece no título de um artigo de **George Pólya** de 1920.

As datas e atribuições acima seguem Ulyanov (2024) e, para o nome, o próprio artigo de Pólya (1920). Para a história completa, veja Fischer (2011).

### 1.2 Importância Histórica

O TLC revolucionou a estatística ao:
- Justificar o uso da distribuição normal para médias e somas
- Permitir aproximar distribuições complicadas por uma normal
- Fundamentar métodos de inferência estatística

## 2. Enunciado Formal

Sejam $X_1, X_2, \ldots, X_n$ variáveis aleatórias **independentes** e **identicamente distribuídas** (todas com a mesma distribuição), com:
- média $\mu$;
- variância $\sigma^2$ **finita e positiva** ($0 < \sigma^2 < \infty$).

Então, quando $n \to \infty$:

$$\frac{\sum_{i=1}^n X_i - n\mu}{\sigma\sqrt{n}} \xrightarrow{d} N(0,1)$$

Ou, equivalentemente, para a média amostral $\bar{X} = \frac{1}{n}\sum_{i=1}^n X_i$:

$$\frac{\bar{X} - \mu}{\sigma/\sqrt{n}} \xrightarrow{d} N(0,1)$$

onde $\xrightarrow{d}$ indica **convergência em distribuição**: para todo número $z$, a probabilidade $P\\!\left(\frac{\bar{X} - \mu}{\sigma/\sqrt{n}} \leq z\right)$ se aproxima de $P(Z \leq z)$, com $Z \sim N(0, 1)$, à medida que $n$ cresce.

Na prática, isso quer dizer que, para $n$ grande,

$$\bar{X} \approx N\!\left(\mu,\ \frac{\sigma^2}{n}\right)$$

A média de $\bar{X}$ é $\mu$ e a sua variância é $\sigma^2/n$ (isso vale para qualquer $n$, não só para $n$ grande); o desvio padrão de $\bar{X}$, $\sigma/\sqrt{n}$, é chamado de **erro padrão**. O TLC acrescenta que a **forma** da distribuição de $\bar{X}$ fica parecida com a da normal.

<div style="border-left: 4px solid #ff9800; padding: 0.5em; background-color: #fff3e0; margin: 1em 0;">
  <strong>⚠️ O que o TLC não diz</strong><br>
  O TLC fala da <strong>média</strong> (ou da soma), não dos dados individuais: ele não diz que os dados ficam normais quando a amostra cresce. E ele é um resultado sobre o limite $n \to \infty$: não diz a partir de que $n$ a aproximação já é boa. A famosa regra "$n \geq 30$" é uma <strong>regra de bolso</strong>, não parte do teorema (ver seção 5).
</div>

## 3. Exemplo Resolvido

<div style="border-left: 4px solid #2196F3; padding: 0.5em; background-color: #e3f2fd; margin: 1em 0;">
  <strong>💡 Exemplo</strong><br>
  O tempo de cada atendimento em um guichê segue uma distribuição exponencial com média de 1 minuto (números ilustrativos). Em um dia, são feitos 36 atendimentos, independentes entre si. Qual é a probabilidade de o tempo médio desses 36 atendimentos passar de 1,2 minuto?
</div>

**Dados** (do enunciado): $\mu = 1$ min; na exponencial, o desvio padrão é igual à média, então $\sigma = 1$ min; $n = 36$; queremos $P(\bar{X} > 1{,}2)$.

**Condições:** os atendimentos são independentes e têm a mesma distribuição, com variância finita. A exponencial é bem assimétrica, mas, com $n = 36$, o TLC deve dar uma aproximação razoável (o código abaixo confere).

**Fórmula:** pelo TLC, $\bar{X} \approx N(\mu, \sigma^2/n)$, e padronizamos com

$$Z = \frac{\bar{X} - \mu}{\sigma/\sqrt{n}}$$

**Substituição e conta**, um passo por linha:

$$\frac{\sigma}{\sqrt{n}} = \frac{1}{\sqrt{36}} = \frac{1}{6} \approx 0{,}1667 \text{ min}$$

$$z = \frac{1{,}2 - 1}{1/6} = 0{,}2 \cdot 6 = 1{,}2$$

$$P(Z \leq 1{,}2) = 0{,}8849 \quad \text{(tabela Z)}$$

$$P(\bar{X} > 1{,}2) \approx 1 - 0{,}8849 = 0{,}1151$$

**Resultado:** $P(\bar{X} > 1{,}2) \approx 0{,}1151$, ou seja, cerca de 11,5%.

**Interpretação:** em cerca de 1 de cada 9 dias, o tempo médio de atendimento passaria de 1,2 minuto. Um atendimento isolado passa de 1,2 minuto com muito mais frequência (com probabilidade $e^{-1{,}2} \approx 0{,}3012$, isto é, cerca de 30% das vezes, pela função acumulada da exponencial); a média de 36 atendimentos varia bem menos, porque o erro padrão (1/6 de minuto) é seis vezes menor que o desvio padrão de um atendimento.

**Quão boa é a aproximação?** Aqui dá para calcular o valor exato: a soma de 36 exponenciais independentes de média 1 tem distribuição gama, e o código abaixo obtém $P(\bar{X} > 1{,}2) = 0{,}1184$. O TLC dá 0,1151: erra na terceira casa, porque a exponencial é assimétrica e $n = 36$ ainda não é "infinito". Para decisões em que essa diferença importa, use a distribuição exata ou simulação.

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

# Tempo de cada atendimento: exponencial com média 1 minuto (então σ = 1)
μ, σ, n = 1.0, 1.0, 36
atendimento = Exponential(μ)   # no Julia, Exponential(θ) recebe a média θ = 1/λ

# 1) Aproximação pelo TLC: X̄ ≈ Normal(μ, σ/√n)
erro_padrao = σ / sqrt(n)
z = (1.2 - μ) / erro_padrao
println("Erro padrão = ", round(erro_padrao, digits = 4), "   z = ", round(z, digits = 4))
println("P(X̄ &gt; 1,2) pelo TLC:      ", round(1 - cdf(Normal(), z), digits = 4))

# 2) Valor exato: a soma de 36 exponenciais de média 1 é Gamma(36, 1),
#    então a média X̄ = soma/36 é Gamma(36, 1/36)
println("P(X̄ &gt; 1,2) exata (gama):  ", round(ccdf(Gamma(36, 1 / 36), 1.2), digits = 4))

# 3) Simulação: 100.000 grupos de 36 atendimentos
medias = [mean(rand(atendimento, n)) for _ in 1:100_000]
println("P(X̄ &gt; 1,2) na simulação:  ", round(mean(medias .&gt; 1.2), digits = 4))</code></pre>
  </div>
</div>

#### Saída esperada:
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>Erro padrão = 0.1667   z = 1.2</div>
  <div>P(X̄ &gt; 1,2) pelo TLC:      0.1151</div>
  <div>P(X̄ &gt; 1,2) exata (gama):  0.1184</div>
  <div>P(X̄ &gt; 1,2) na simulação:  0.1172</div>
</div>

## 4. Demonstração Visual com Julia

Vamos ver o TLC em ação com três distribuições de partida bem diferentes da normal: a uniforme, a exponencial (assimétrica) e a Bernoulli (que só assume 0 ou 1). Para cada uma, geramos 1.000 amostras de tamanho $n = 30$, calculamos a média de cada amostra e a padronizamos com $\mu$ e $\sigma$ da distribuição de partida, como no enunciado.

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

n_amostras = 1_000     # quantas médias amostrais vamos gerar
tamanho_amostra = 30   # n: quantos valores entram em cada média

# Três distribuições de partida, bem diferentes da normal.
# Na Bernoulli, a média de 30 valores só pode ser k/30 (k = 0, 1, …, 30); as faixas do
# histograma são centradas nesses valores para não sobrar faixa vazia.
bordas_bernoulli = ((-0.5:1:tamanho_amostra + 0.5) ./ tamanho_amostra .- 0.5) ./
                   (0.5 / sqrt(tamanho_amostra))
distribuicoes = [("Uniforme(0, 1)", Uniform(0, 1), 30),
                 ("Exponencial (média 1)", Exponential(1), 30),
                 ("Bernoulli(0,5)", Bernoulli(0.5), bordas_bernoulli)]

virgula(x) = replace(string(round(x, digits = 2)), "." =&gt; ",")
x = range(-4, 4, length = 200)
graficos = []

for (nome, dist, faixas) in distribuicoes
    μ, σ = mean(dist), std(dist)
    medias = [mean(rand(dist, tamanho_amostra)) for _ in 1:n_amostras]
    # Padronização pela teoria: (X̄ − μ) / (σ/√n), como no enunciado do TLC
    z = (medias .- μ) ./ (σ / sqrt(tamanho_amostra))
    p = histogram(z; normalize = :pdf, bins = faixas,
        title = "Médias de n = 30\n($nome)", xlabel = "Média padronizada",
        ylabel = "Densidade", label = "Médias amostrais",
        color = :steelblue, alpha = 0.6, linealpha = 0, formatter = virgula,
        xlims = (-4, 4))
    plot!(p, x, pdf.(Normal(), x); label = "N(0, 1)", color = :black, lw = 2, ls = :dash)
    push!(graficos, p)
end

plot(graficos...; layout = (1, 3), size = (1350, 450),
     left_margin = 8mm, bottom_margin = 8mm, top_margin = 5mm)
savefig("tlc_demonstracao.png")</code></pre>
  </div>
</div>

![Três histogramas de médias padronizadas de 30 valores, vindas da uniforme, da exponencial e da Bernoulli, cada um com a curva da normal padrão tracejada por cima]({{ site.baseurl }}/assets/images/tlc_demonstracao.png)
<div class="image-caption">Figura 1: Médias padronizadas de amostras de tamanho 30, vindas de três distribuições diferentes. Nos três casos, o histograma fica próximo da curva N(0, 1).</div>

## 5. Condições e Considerações

### 5.1 Requisitos Fundamentais
- Variáveis aleatórias independentes
- Identicamente distribuídas (versões mais gerais do teorema, como a de Lindeberg–Feller, dispensam esta condição)
- Variância finita e positiva
- $n$ "suficientemente grande": a regra de bolso mais citada é $n \geq 30$, mas ela não é parte do teorema; para distribuições quase simétricas, bem menos já basta, e para distribuições muito assimétricas ou de caudas pesadas pode ser preciso muito mais

### 5.2 Velocidade de Convergência

A rapidez com que a média se aproxima da normal depende:
- da assimetria da distribuição original (quanto mais assimétrica, mais devagar);
- do peso das caudas;
- do tamanho da amostra.

Os gráficos Q-Q abaixo mostram isso para a exponencial, que é assimétrica. Num gráfico Q-Q, cada ponto compara um quantil das médias simuladas com o quantil correspondente da normal padrão: se os pontos seguem a reta, a distribuição está próxima da normal.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Distributions, Statistics, StatsPlots, Random

Random.seed!(123)

n_amostras = 1_000
tamanhos = [2, 5, 10, 30]
dist = Exponential(1)   # assimétrica, com média 1 e desvio padrão 1
μ, σ = mean(dist), std(dist)

virgula(x) = replace(string(round(x, digits = 1)), "." =&gt; ",")
graficos = []
for n in tamanhos
    medias = [mean(rand(dist, n)) for _ in 1:n_amostras]
    z = (medias .- μ) ./ (σ / sqrt(n))   # padronização pela teoria
    # Gráfico Q-Q: se os pontos seguem a reta, a distribuição é próxima da normal
    p = qqplot(Normal(0, 1), z; title = "n = $n",
        xlabel = "Quantis da N(0, 1)", ylabel = "Quantis das médias",
        markercolor = :steelblue, markeralpha = 0.6, markerstrokewidth = 0,
        linecolor = :red, formatter = virgula)
    push!(graficos, p)
end

plot(graficos...; layout = (2, 2), size = (800, 800))
savefig("tlc_qqplot.png")</code></pre>
  </div>
</div>

![Quatro gráficos Q-Q de médias padronizadas da exponencial, para n igual a 2, 5, 10 e 30; os pontos se curvam longe da reta para n pequeno e quase seguem a reta para n = 30]({{ site.baseurl }}/assets/images/tlc_qqplot.png)
<div class="image-caption">Figura 2: Gráficos Q-Q das médias padronizadas da exponencial para n = 2, 5, 10 e 30. Com n = 2 os pontos se curvam (assimetria); com n = 30 quase seguem a reta, mas ainda se afastam um pouco nas pontas.</div>

## 6. Aplicações Práticas

### 6.1 Intervalos de Confiança
Quando o desvio padrão populacional $\sigma$ é conhecido, o TLC permite construir um intervalo de 95% de confiança para a média $\mu$:

$$\bar{x} \pm 1{,}96 \cdot \frac{\sigma}{\sqrt{n}}$$

O valor 1,96 é o $z$ que deixa 2,5% em cada cauda da normal padrão. Se $\sigma$ não é conhecido e é substituído pelo desvio padrão amostral $s$, o usual é trocar 1,96 pelo valor da distribuição t de Student; para $n$ grande, os dois ficam próximos. Os detalhes estão em [Intervalos de Confiança]({{ '/pt/inferencia-estatistica/intervalos-confianca' | relative_url }}).

### 6.2 Teste de Hipóteses
A estatística Z para testar se a média é igual a um valor $\mu_0$ (com $\sigma$ conhecido):

$$Z = \frac{\bar{X} - \mu_0}{\sigma/\sqrt{n}}$$

Pelo TLC, se a média for mesmo $\mu_0$, $Z$ tem distribuição aproximadamente $N(0, 1)$. Ver [Testes de Hipótese]({{ '/pt/inferencia-estatistica/testes-hipotese' | relative_url }}).

### 6.3 Exemplo Prático: Controle de Qualidade

<div style="border-left: 4px solid #2196F3; padding: 0.5em; background-color: #e3f2fd; margin: 1em 0;">
  <strong>💡 Exemplo</strong><br>
  Uma fábrica produz parafusos cujo comprimento especificado é 10 mm, com tolerância de ±0,1 mm. Pelo histórico, o desvio padrão do processo é $\sigma = 0{,}02$ mm. Uma amostra de 100 parafusos deu comprimento médio $\bar{x} = 10{,}002$ mm (números ilustrativos). Construa o intervalo de 95% de confiança para o comprimento médio $\mu$ da produção.
</div>

**Dados** (do enunciado): $n = 100$ parafusos; $\sigma = 0{,}02$ mm (conhecido); $\bar{x} = 10{,}002$ mm; confiança de 95%, isto é, $z = 1{,}96$.

**Condição:** os parafusos da amostra são independentes entre si. Com $n = 100$, pelo TLC, $\bar{X}$ é aproximadamente normal mesmo que os comprimentos individuais não sejam.

**Passo 1, erro padrão:**

$$EP = \frac{\sigma}{\sqrt{n}} = \frac{0{,}02}{\sqrt{100}} = \frac{0{,}02}{10} = 0{,}002 \text{ mm}$$

**Passo 2, margem de erro:**

$$1{,}96 \cdot EP = 1{,}96 \cdot 0{,}002 = 0{,}00392 \text{ mm}$$

**Passo 3, limites do intervalo:**

$$\text{limite inferior} = 10{,}002 - 0{,}00392 = 9{,}99808 \text{ mm}$$

$$\text{limite superior} = 10{,}002 + 0{,}00392 = 10{,}00592 \text{ mm}$$

**Resultado:** $IC_{95\%} = [9{,}99808;\ 10{,}00592]$ mm.

**Interpretação:**
1. O intervalo estima o **comprimento médio** da produção. O "95%" é sobre o método: se repetíssemos a amostragem muitas vezes, cerca de 95% dos intervalos construídos assim conteriam a verdadeira média $\mu$. Não é "95% de chance de $\mu$ estar neste intervalo".
2. O intervalo contém o valor especificado, 10 mm: os dados não indicam que a média da produção esteja deslocada.
3. O intervalo **não diz** se cada parafuso está dentro da tolerância. Isso depende da dispersão das peças ($\sigma = 0{,}02$ mm), não da largura do intervalo, que encolhe com $n$ (o erro padrão é $\sigma/\sqrt{n}$). Se, além disso, os comprimentos individuais seguirem uma normal (uma hipótese a mais, que o TLC **não** garante), quase todas as peças ficam entre $10{,}002 \pm 3 \cdot 0{,}02$, isto é, entre 9,942 e 10,062 mm, dentro de $[9{,}9;\ 10{,}1]$; o código abaixo calcula a fração fora da tolerância nesse modelo: cerca de $6{,}5 \times 10^{-7}$, perto de 1 peça em 1,5 milhão.
4. Saber se o processo está "sob controle estatístico" (estável ao longo do tempo) é outra pergunta, respondida com gráficos de controle, não com um único intervalo de confiança.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Distributions

# Dados do exemplo (ilustrativos)
n = 100        # parafusos medidos
σ = 0.02       # desvio padrão do processo, conhecido (mm)
x̄ = 10.002     # média das 100 medições (mm)

# Valor de z para 95%: deixa 2,5% em cada cauda da normal padrão
z = quantile(Normal(), 0.975)
erro_padrao = σ / sqrt(n)
margem = 1.96 * erro_padrao
println("z (95%) = ", round(z, digits = 4))
println("Erro padrão = ", erro_padrao, " mm   Margem = ", round(margem, digits = 5), " mm")
println("IC de 95% para a média: [", round(x̄ - margem, digits = 5), "; ",
        round(x̄ + margem, digits = 5), "] mm")

# Peças individuais: supondo comprimentos ~ Normal(x̄, σ), fração fora de [9,9; 10,1]
peca = Normal(x̄, σ)
fora = cdf(peca, 9.9) + ccdf(peca, 10.1)
println("Fração de peças fora da tolerância (supondo normalidade): ", round(fora, sigdigits = 2))</code></pre>
  </div>
</div>

#### Saída esperada:
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>z (95%) = 1.96</div>
  <div>Erro padrão = 0.002 mm   Margem = 0.00392 mm</div>
  <div>IC de 95% para a média: [9.99808; 10.00592] mm</div>
  <div>Fração de peças fora da tolerância (supondo normalidade): 6.5e-7</div>
</div>

### 6.4 Aplicações em Diferentes Áreas

1. **Engenharia**: controle de qualidade, tolerâncias de fabricação
2. **Medicina**: comparação de médias em ensaios clínicos
3. **Ciências Sociais**: pesquisas de opinião (a proporção amostral é uma média de zeros e uns)
4. **Finanças**: retornos acumulados ao longo de muitos períodos, com cuidado, porque retornos costumam ter caudas pesadas e dependência

## 7. Limitações e Considerações

<div style="border-left: 4px solid #ff9800; padding: 0.5em; background-color: #fff3e0; margin: 1em 0;">
  <strong>⚠️ Atenção:</strong><br>
  A aproximação normal pode ser ruim, ou o TLC pode nem valer, quando:
  <ul>
    <li>a amostra é pequena e a distribuição original é muito assimétrica;</li>
    <li>as variáveis não são independentes (por exemplo, medições seguidas no tempo que dependem umas das outras);</li>
    <li>a variância é infinita ou não existe: nesse caso o TLC não se aplica (é o que acontece com a distribuição de Cauchy);</li>
    <li>a distribuição tem caudas pesadas: valores extremos raros, mas enormes, fazem a convergência exigir amostras muito grandes.</li>
  </ul>
</div>

## 8. Dicas para Aplicação Prática

1. **Verifique a independência** no modo como os dados foram coletados: o TLC depende dela, e nenhum tamanho de amostra a corrige.
2. **Olhe os dados** (histograma, boxplot): assimetria forte e valores atípicos indicam que $n$ precisa ser maior.
3. **Na dúvida, simule**: como nas seções 3 e 5, uma simulação mostra se a aproximação normal é boa para a sua distribuição e o seu $n$.
4. **Lembre que $n \geq 30$ é regra de bolso**, não garantia.

## Referências

1. Billingsley, P. (1995). *Probability and Measure*. 3rd ed. Wiley.
2. Bussab, W. O.; Morettin, P. A. (2023). *Estatística Básica*. 10. ed. Saraiva Uni.
3. Fischer, H. (2011). *A History of the Central Limit Theorem: From Classical to Modern Probability Theory*. Springer.
4. Pólya, G. (1920). Über den zentralen Grenzwertsatz der Wahrscheinlichkeitsrechnung und das Momentenproblem. *Mathematische Zeitschrift*, 8(3–4), 171–181. DOI: [10.1007/BF01206525](https://doi.org/10.1007/BF01206525).
5. Ulyanov, V. V. (2024). From classical to modern central limit theorems. arXiv:2405.19828. DOI: [10.48550/arXiv.2405.19828](https://doi.org/10.48550/arXiv.2405.19828).
