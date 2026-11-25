---
layout: page
title: Questões
lang: pt
ref: questions
parent: probabilidade
permalink: /pt/probabilidade/questions
order: 7
mathjax: true
description: "Questões de probabilidade resolvidas passo a passo: distribuições binomial, exponencial, Poisson, normal, geométrica e binomial negativa, com código em Julia."
---

## Questões Práticas Resolvidas

Seis questões, uma para cada distribuição vista em [Distribuições de Probabilidade]({{ '/pt/probabilidade/distribuicoes' | relative_url }}). Cada resolução diz por que a distribuição serve, faz as contas uma a uma, interpreta o resultado e confere tudo com um código em Julia. Os enunciados e os números são **ilustrativos**, inventados para a conta ficar simples; não descrevem nenhuma vila, empresa ou pessoa real.

<div style="border-left: 4px solid #f44336; padding: 1em; background-color: #ffebee; margin: 1em 0; border-radius: 4px;">
  <img src="{{ site.baseurl }}/assets/images/lampiao.avif" alt="Lampião a querosene" style="float: right; width: 350px; margin-left: 1em; margin-bottom: 1em;">
  <h4 style="margin-top: 0;">🎲 Questão 1: Lampiões numa Vila (Distribuição Binomial)</h4>
  <p><strong>Enunciado:</strong></p>
  <p>Numa vila onde a energia elétrica falha com frequência, cada morador tem um lampião a querosene. Por causa de impurezas no combustível, 1 em cada 5 lampiões falha ao ser aceso.</p>
  <p>Numa noite de apagão, 6 moradores tentam acender seus lampiões, cada um de forma independente dos outros.</p>
  <p><strong>Pergunta-se:</strong></p>
  <ol>
    <li>Qual é a probabilidade de <strong>exatamente 2</strong> lampiões falharem?</li>
    <li>Qual é a probabilidade de <strong>pelo menos 1</strong> lampião acender?</li>
    <li>Se os 6 moradores trocarem o querosene por um combustível filtrado, que reduz a chance de falha para 10%, qual passa a ser a probabilidade de <strong>nenhum lampião falhar</strong>?</li>
  </ol>
</div>

### Resolução Detalhada

**Por que binomial.** Há um número fixo de tentativas ($n = 6$ lampiões); cada uma tem dois resultados (falha ou acende); as tentativas são independentes (o enunciado diz isso); e a probabilidade de falha é a mesma em todas, $p = \frac{1}{5} = 0{,}2$. Essas são exatamente as condições da distribuição binomial.

Seja $X$ o número de lampiões que falham entre os 6. Então $X \sim \text{Binomial}(n = 6;\ p = 0{,}2)$, com função de probabilidade:

$$P(X = k) = \binom{n}{k} p^k (1-p)^{n-k}, \qquad k = 0, 1, \ldots, n$$

onde $\binom{n}{k} = \frac{n!}{k!\,(n-k)!}$ é o número de maneiras de escolher quais $k$ das $n$ tentativas falham.

#### 1. Exatamente 2 lampiões falharem

**Substituição** ($n = 6$, $k = 2$, $p = 0{,}2$, $1 - p = 0{,}8$):

$$P(X = 2) = \binom{6}{2} \cdot (0{,}2)^2 \cdot (0{,}8)^4$$

**Conta**, um termo de cada vez:

$$\binom{6}{2} = \frac{6!}{2! \cdot 4!} = \frac{6 \cdot 5}{2 \cdot 1} = \frac{30}{2} = 15$$

$$(0{,}2)^2 = 0{,}04$$

$$(0{,}8)^4 = 0{,}8 \cdot 0{,}8 \cdot 0{,}8 \cdot 0{,}8 = 0{,}4096$$

$$P(X = 2) = 15 \cdot 0{,}04 \cdot 0{,}4096 = 0{,}6 \cdot 0{,}4096 = 0{,}24576$$

**Resultado:** $P(X = 2) = 0{,}24576$, ou cerca de **24,58%**.

**Interpretação:** em cerca de 1 de cada 4 noites de apagão com 6 lampiões, exatamente 2 deles falham. Para comparar, o número **esperado** de falhas é $n \cdot p = 6 \cdot 0{,}2 = 1{,}2$ por noite.

#### 2. Pelo menos 1 lampião acender

"Pelo menos 1 acende" é o complemento de "nenhum acende", ou seja, de "os 6 falham" ($X = 6$). Pela regra do complemento:

$$P(\text{pelo menos 1 acende}) = 1 - P(X = 6)$$

$$P(X = 6) = \binom{6}{6} \cdot (0{,}2)^6 \cdot (0{,}8)^0 = 1 \cdot 0{,}000064 \cdot 1 = 0{,}000064$$

$$P(\text{pelo menos 1 acende}) = 1 - 0{,}000064 = 0{,}999936$$

**Resultado:** $0{,}999936$, ou **99,9936%**.

**Interpretação:** os 6 falharem ao mesmo tempo acontece, em média, em 64 de cada 1.000.000 de noites (1 em 15.625). É quase certo que alguém na vila terá luz. Esse número depende da independência: se as falhas vierem de um mesmo lote de querosene ruim, elas deixam de ser independentes e "todos falham" fica bem mais provável.

#### 3. Nenhum lampião falhar com o combustível filtrado

Com o combustível novo, a probabilidade de falha passa a ser $p' = 0{,}1$, e a de acender, $1 - p' = 0{,}9$. Seja $X'$ o novo número de falhas, $X' \sim \text{Binomial}(6;\ 0{,}1)$:

$$P(X' = 0) = \binom{6}{0} \cdot (0{,}1)^0 \cdot (0{,}9)^6 = 1 \cdot 1 \cdot (0{,}9)^6$$

$$(0{,}9)^6 = 0{,}81 \cdot 0{,}81 \cdot 0{,}81 = 0{,}531441$$

**Resultado:** $P(X' = 0) = 0{,}531441$, ou cerca de **53,14%**.

**Interpretação:** com o combustível antigo, a chance de nenhum falhar era $(0{,}8)^6 = 0{,}262144$, cerca de 26,21%. O combustível filtrado praticamente dobra essa chance, mas ainda assim, em quase metade das noites, pelo menos um lampião falha.

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

X = Binomial(6, 0.2)          # X = número de lampiões que falham, entre 6
println("P(X = 2)             = ", round(pdf(X, 2), digits=5))
println("P(pelo menos 1 acende) = 1 − P(X = 6) = ", round(1 - pdf(X, 6), digits=6))

X_filtrado = Binomial(6, 0.1) # falha de 10% com o combustível filtrado
println("P(nenhuma falha), p = 0,1: ", round(pdf(X_filtrado, 0), digits=6))
println("P(nenhuma falha), p = 0,2: ", round(pdf(X, 0), digits=6))</code></pre>
  </div>
</div>

#### Saída esperada:
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>P(X = 2) &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; = 0.24576</div>
  <div>P(pelo menos 1 acende) = 1 − P(X = 6) = 0.999936</div>
  <div>P(nenhuma falha), p = 0,1: 0.531441</div>
  <div>P(nenhuma falha), p = 0,2: 0.262144</div>
</div>

<div style="border-left: 4px solid #4CAF50; padding: 0.5em; background-color: #e8f5e9; margin: 1em 0;">
  <strong>Resumo dos Resultados (Questão 1):</strong>
  <ul>
    <li>Exatamente 2 falhas: <strong>24,58%</strong></li>
    <li>Pelo menos 1 acende: <strong>99,9936%</strong></li>
    <li>Nenhuma falha com o combustível filtrado: <strong>53,14%</strong></li>
  </ul>
</div>

<div style="border-left: 4px solid #2196F3; padding: 1em; background-color: #e3f2fd; margin: 1em 0; border-radius: 4px;">
  <img src="{{ site.baseurl }}/assets/images/lampiao.avif" alt="Lampião a querosene" style="float: right; width: 350px; margin-left: 1em; margin-bottom: 1em;">
  <h4 style="margin-top: 0;">🎲 Questão 2: Quanto Tempo o Lampião Fica Aceso (Distribuição Exponencial)</h4>
  <p><strong>Enunciado:</strong></p>
  <p>Suponha que o tempo, em horas, que um lampião fica aceso até se apagar siga uma <strong>distribuição exponencial</strong> com média de 6 horas.</p>
  <p><strong>Pergunta-se:</strong></p>
  <ol>
    <li>Qual é a probabilidade de um lampião ficar aceso <strong>mais de 8 horas</strong>?</li>
    <li>Um morador acende 4 lampiões idênticos, que funcionam de forma independente. Qual é a probabilidade de <strong>pelo menos um</strong> deles ficar aceso mais de 8 horas?</li>
    <li>Qual é a <strong>mediana</strong> do tempo aceso (o tempo em que metade dos lampiões já se apagou)?</li>
    <li>Um lampião já está aceso há 6 horas. Qual é a probabilidade de ele continuar aceso por <strong>pelo menos mais 4 horas</strong>?</li>
  </ol>
</div>

### Resolução Detalhada

A exponencial é um **modelo** escolhido para o exercício: ela supõe que o lampião não "envelhece", isto é, que a chance de se apagar na próxima hora é a mesma no começo e no fim da noite. Na prática, o querosene acaba, e um lampião de verdade não se comporta bem assim. O item 4 mostra a consequência dessa hipótese.

Seja $T$ o tempo aceso, em horas. A exponencial tem um parâmetro, a **taxa** $\lambda$, e a média é $E[T] = \frac{1}{\lambda}$. Com média de 6 horas:

$$\lambda = \frac{1}{E[T]} = \frac{1}{6} \text{ por hora}$$

A probabilidade de o lampião durar mais que $t$ horas (a **função de sobrevivência**) é:

$$P(T > t) = e^{-\lambda t}, \qquad t \geq 0$$

#### 1. Ficar aceso mais de 8 horas

$$P(T > 8) = e^{-\lambda \cdot 8} = e^{-\frac{1}{6} \cdot 8} = e^{-\frac{4}{3}}$$

$$-\frac{4}{3} \approx -1{,}3333 \qquad e^{-1{,}3333} \approx 0{,}2636$$

**Resultado:** $P(T > 8) \approx 0{,}2636$, ou cerca de **26,36%**.

**Interpretação:** pouco mais de 1 em cada 4 lampiões fica aceso mais de 8 horas, embora a média seja 6 horas.

#### 2. Pelo menos 1 de 4 ficar aceso mais de 8 horas

Seja $p = P(T > 8) \approx 0{,}2636$. "Pelo menos 1 passa de 8 horas" é o complemento de "nenhum passa". Como os 4 lampiões são independentes, a probabilidade de nenhum passar é o produto das 4 probabilidades, cada uma igual a $1 - p$:

$$P(\text{pelo menos 1} > 8\text{ h}) = 1 - (1 - p)^4$$

$$1 - p \approx 1 - 0{,}2636 = 0{,}7364$$

$$(0{,}7364)^4 \approx 0{,}2941$$

$$P(\text{pelo menos 1} > 8\text{ h}) \approx 1 - 0{,}2941 = 0{,}7059$$

**Resultado:** cerca de **70,59%**. (Com $p$ sem arredondar, o valor é 0,705922…, que também arredonda para 70,59%.)

#### 3. Mediana

A mediana $m$ é o tempo com metade dos lampiões ainda acesa: $P(T > m) = 0{,}5$.

$$e^{-\lambda m} = 0{,}5$$

Tomando o logaritmo natural dos dois lados:

$$-\lambda m = \ln(0{,}5) = -\ln 2$$

$$m = \frac{\ln 2}{\lambda} = 6 \cdot \ln 2 \approx 6 \cdot 0{,}693147 \approx 4{,}1589 \text{ horas}$$

**Resultado:** $m \approx 4{,}16$ horas (cerca de 4 h 10 min).

**Interpretação:** metade dos lampiões se apaga antes de 4,16 horas, embora a média seja 6 horas. Na exponencial, a média fica acima da mediana porque alguns lampiões duram muito mais que o típico e puxam a média para cima.

#### 4. Continuar aceso mais 4 horas, sabendo que já está há 6

Pela definição de probabilidade condicional, como "durar mais de 10 horas" está contido em "durar mais de 6 horas":

$$P(T > 10 \mid T > 6) = \frac{P(T > 10)}{P(T > 6)} = \frac{e^{-\lambda \cdot 10}}{e^{-\lambda \cdot 6}} = e^{-\lambda \cdot 4} = P(T > 4)$$

Esse é um caso da **falta de memória** da exponencial: para quaisquer $s, t \geq 0$, $P(T > s + t \mid T > s) = P(T > t)$. Agora a conta:

$$P(T > 4) = e^{-\frac{1}{6} \cdot 4} = e^{-\frac{2}{3}} \approx e^{-0{,}6667} \approx 0{,}5134$$

**Resultado:** cerca de **51,34%**.

**Interpretação:** pelo modelo exponencial, um lampião que já está aceso há 6 horas tem a mesma chance de durar mais 4 horas que um lampião recém-aceso. É isso que "sem memória" quer dizer, e é também o ponto fraco do modelo para lampiões de verdade, cujo combustível vai acabando.

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

# Cuidado: Exponential(θ) do Julia recebe a ESCALA θ = média = 1/λ
T = Exponential(6)            # média de 6 horas, taxa λ = 1/6 por hora

p = ccdf(T, 8)                # ccdf(T, t) = P(T &gt; t)
println("P(T &gt; 8)                 = ", round(p, digits=4))
println("P(pelo menos 1 de 4 &gt; 8) = ", round(1 - (1 - p)^4, digits=4))
println("Mediana                  = ", round(median(T), digits=4), " horas")
println("P(T &gt; 10 | T &gt; 6)        = ", round(ccdf(T, 10) / ccdf(T, 6), digits=4))
println("P(T &gt; 4)                 = ", round(ccdf(T, 4), digits=4))</code></pre>
  </div>
</div>

#### Saída esperada:
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>P(T &gt; 8) &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; = 0.2636</div>
  <div>P(pelo menos 1 de 4 &gt; 8) = 0.7059</div>
  <div>Mediana &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;= 4.1589 horas</div>
  <div>P(T &gt; 10 | T &gt; 6) &nbsp; &nbsp; &nbsp; &nbsp;= 0.5134</div>
  <div>P(T &gt; 4) &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; = 0.5134</div>
</div>

<div style="border-left: 4px solid #4CAF50; padding: 0.5em; background-color: #e8f5e9; margin: 1em 0;">
  <strong>Resumo dos Resultados (Questão 2):</strong>
  <ul>
    <li>Ficar aceso mais de 8 h: <strong>26,36%</strong></li>
    <li>Pelo menos 1 de 4 passar de 8 h: <strong>70,59%</strong></li>
    <li>Mediana do tempo aceso: <strong>4,16 horas</strong></li>
    <li>Mais 4 h, sabendo que já está aceso há 6 h: <strong>51,34%</strong></li>
  </ul>
</div>

<div style="border-left: 4px solid #673AB7; padding: 1em; background-color: #ede7f6; margin: 1em 0; border-radius: 4px;">
  <img src="{{ site.baseurl }}/assets/images/telephone.avif" alt="Telefone antigo" style="float: right; width: 350px; margin-left: 1em; margin-bottom: 1em;">
  <h4 style="margin-top: 0;">📞 Questão 3: Chamadas numa Central de Atendimento (Distribuição de Poisson)</h4>
  <p><strong>Enunciado:</strong></p>
  <p>Uma pequena central de atendimento recebe, em média, 12 chamadas por hora. Suponha que as chamadas cheguem uma de cada vez, de forma independente, e com a mesma taxa ao longo do tempo, de modo que o número de chamadas num intervalo siga uma <strong>distribuição de Poisson</strong>.</p>
  <p><strong>Pergunta-se:</strong></p>
  <ol>
    <li>Qual é a probabilidade de chegarem <strong>exatamente 5 chamadas</strong> em 30 minutos?</li>
    <li>Qual é a probabilidade de <strong>nenhuma chamada</strong> chegar em 10 minutos?</li>
    <li>Qual é a probabilidade de chegarem <strong>mais de 3 chamadas</strong> em 20 minutos?</li>
  </ol>
</div>

### Resolução Detalhada

Seja $X$ o número de chamadas num intervalo. A função de probabilidade da Poisson é:

$$P(X = k) = \frac{e^{-\lambda} \lambda^k}{k!}, \qquad k = 0, 1, 2, \ldots$$

onde $\lambda$ é o **número médio de chamadas no intervalo considerado**. Com taxa constante, esse número é proporcional ao tamanho do intervalo:

$$\lambda = 12 \text{ chamadas/hora} \times \text{duração do intervalo em horas}$$

#### 1. Exatamente 5 chamadas em 30 minutos

**Dados:** 30 minutos $= 0{,}5$ hora, então $\lambda = 12 \cdot 0{,}5 = 6$ chamadas; $k = 5$.

$$P(X = 5) = \frac{e^{-6} \cdot 6^5}{5!}$$

$$e^{-6} \approx 0{,}0024788 \qquad 6^5 = 7.776 \qquad 5! = 120$$

$$P(X = 5) \approx \frac{0{,}0024788 \cdot 7.776}{120} \approx \frac{19{,}2748}{120} \approx 0{,}1606$$

**Resultado:** cerca de **16,06%**.

**Interpretação:** a média em 30 minutos é 6 chamadas, mas receber exatamente 5 acontece em só cerca de 1 de cada 6 meias horas: o número de chamadas varia bastante em torno da média.

#### 2. Nenhuma chamada em 10 minutos

**Dados:** 10 minutos $= \frac{1}{6}$ hora, então $\lambda = 12 \cdot \frac{1}{6} = 2$ chamadas; $k = 0$. Como $2^0 = 1$ e $0! = 1$:

$$P(X = 0) = \frac{e^{-2} \cdot 2^0}{0!} = e^{-2} \approx 0{,}1353$$

**Resultado:** cerca de **13,53%**.

**Interpretação:** em cerca de 1 de cada 7 intervalos de 10 minutos, ninguém liga.

#### 3. Mais de 3 chamadas em 20 minutos

**Dados:** 20 minutos $= \frac{1}{3}$ hora, então $\lambda = 12 \cdot \frac{1}{3} = 4$ chamadas.

"Mais de 3" é o complemento de "3 ou menos". Pela regra do complemento:

$$P(X > 3) = 1 - P(X \leq 3) = 1 - [P(X = 0) + P(X = 1) + P(X = 2) + P(X = 3)]$$

Com $e^{-4} \approx 0{,}018316$, cada termo:

| $k$ | $\frac{e^{-4}\,4^k}{k!}$ | $P(X = k)$ |
|---|---|---|
| 0 | $e^{-4} \cdot \frac{1}{1}$ | 0,0183 |
| 1 | $e^{-4} \cdot \frac{4}{1}$ | 0,0733 |
| 2 | $e^{-4} \cdot \frac{16}{2}$ | 0,1465 |
| 3 | $e^{-4} \cdot \frac{64}{6}$ | 0,1954 |
| **Soma** | | **0,4335** |

$$P(X > 3) = 1 - 0{,}4335 = 0{,}5665$$

**Resultado:** cerca de **56,65%**. (Os termos da tabela estão arredondados; somando os valores completos, $P(X \leq 3) = 0{,}433470\ldots$, e o resultado arredondado é o mesmo.)

**Interpretação:** em pouco mais da metade dos intervalos de 20 minutos chegam 4 chamadas ou mais. Se a central só consegue atender 3 chamadas a cada 20 minutos, ela vai acumular fila com frequência.

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

taxa = 12                     # chamadas por hora
for (minutos, k) in ((30, 5), (10, 0))
    λ = taxa * minutos / 60   # média de chamadas no intervalo
    println("λ = ", λ, " em ", minutos, " min:  P(X = ", k, ") = ", round(pdf(Poisson(λ), k), digits=4))
end

X = Poisson(taxa * 20 / 60)   # λ = 4 em 20 minutos
println("P(X ≤ 3) = ", round(cdf(X, 3), digits=4), "   P(X &gt; 3) = ", round(ccdf(X, 3), digits=4))</code></pre>
  </div>
</div>

#### Saída esperada:
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>λ = 6.0 em 30 min: &nbsp;P(X = 5) = 0.1606</div>
  <div>λ = 2.0 em 10 min: &nbsp;P(X = 0) = 0.1353</div>
  <div>P(X ≤ 3) = 0.4335 &nbsp; P(X &gt; 3) = 0.5665</div>
</div>

<div style="border-left: 4px solid #4CAF50; padding: 0.5em; background-color: #e8f5e9; margin: 1em 0;">
  <strong>Resumo dos Resultados (Questão 3):</strong>
  <ul>
    <li>Exatamente 5 chamadas em 30 min: <strong>16,06%</strong></li>
    <li>Nenhuma chamada em 10 min: <strong>13,53%</strong></li>
    <li>Mais de 3 chamadas em 20 min: <strong>56,65%</strong></li>
  </ul>
</div>

<div style="border-left: 4px solid #FF9800; padding: 1em; background-color: #fff3e0; margin: 1em 0; border-radius: 4px;">
  <img src="{{ site.baseurl }}/assets/images/telephone.avif" alt="Telefone antigo" style="float: right; width: 320px; margin-left: 1em; margin-bottom: 1em;">
  <h4 style="margin-top: 0;">📞 Questão 4: Duração das Chamadas (Distribuição Normal)</h4>
  <p><strong>Enunciado:</strong></p>
  <p>A duração das chamadas de suporte técnico numa central segue uma <strong>distribuição normal</strong> com média $\mu = 10$ minutos e desvio padrão $\sigma = 2$ minutos.</p>
  <p><strong>Pergunta-se:</strong></p>
  <ol>
    <li>Qual é a probabilidade de uma chamada durar <strong>menos de 7 minutos</strong>?</li>
    <li>Qual é a probabilidade de uma chamada durar <strong>entre 9 e 12 minutos</strong>?</li>
    <li>A partir de quantos minutos estão os <strong>5% de chamadas mais longas</strong>?</li>
  </ol>
</div>

### Resolução Detalhada

Seja $X$ a duração de uma chamada, em minutos: $X \sim N(\mu = 10;\ \sigma^2 = 2^2)$. (Na notação $N(\mu, \sigma^2)$, o segundo parâmetro é a **variância**, $\sigma^2 = 4$; o desvio padrão é $\sigma = 2$.)

Uma duração não pode ser negativa, e a normal admite qualquer valor real. Aqui isso não atrapalha: $P(X < 0)$ é cerca de 0,0000003, porque 0 está 5 desvios padrão abaixo da média.

Para usar a tabela da normal padrão, transformamos cada valor em **escore Z**, que diz a quantos desvios padrão o valor está da média:

$$Z = \frac{X - \mu}{\sigma}$$

Se $X$ é normal, $Z$ tem distribuição normal padrão, $N(0;\ 1)$.

#### 1. Menos de 7 minutos

$$Z = \frac{7 - 10}{2} = \frac{-3}{2} = -1{,}5$$

Da tabela Z: $P(Z < -1{,}5) = 0{,}0668$.

**Resultado:** $P(X < 7) \approx 0{,}0668$, ou cerca de **6,68%**.

**Interpretação:** cerca de 7 em cada 100 chamadas terminam em menos de 7 minutos.

#### 2. Entre 9 e 12 minutos

$$Z_1 = \frac{9 - 10}{2} = -0{,}5 \qquad Z_2 = \frac{12 - 10}{2} = 1$$

A probabilidade é a área entre os dois escores:

$$P(9 < X < 12) = P(-0{,}5 < Z < 1) = P(Z < 1) - P(Z < -0{,}5)$$

Da tabela Z: $P(Z < 1) = 0{,}8413$ e $P(Z < -0{,}5) = 0{,}3085$.

$$P(9 < X < 12) = 0{,}8413 - 0{,}3085 = 0{,}5328$$

**Resultado:** cerca de **53,28%**.

**Interpretação:** pouco mais da metade das chamadas dura entre 9 e 12 minutos. O intervalo não é simétrico em torno da média (vai de 1 minuto abaixo a 2 acima), por isso a resposta não é a de "média ± 1 desvio padrão".

#### 3. Os 5% mais longos

Procuramos o valor $x$ com $P(X > x) = 0{,}05$, o que é o mesmo que $P(X < x) = 0{,}95$: $x$ é o **percentil 95** da duração.

Da tabela Z, o escore com área 0,95 à esquerda é $z \approx 1{,}645$ (com mais casas, 1,6449). Voltando para minutos, com $X = \mu + Z \cdot \sigma$:

$$x = 10 + 1{,}645 \cdot 2 = 10 + 3{,}29 = 13{,}29 \text{ minutos}$$

**Resultado:** as 5% chamadas mais longas duram **13,29 minutos ou mais**.

**Interpretação:** só 1 em cada 20 chamadas passa de cerca de 13 minutos e 17 segundos. Um valor assim serve, por exemplo, para definir a partir de quando uma chamada é considerada "longa".

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

# Cuidado: Normal(μ, σ) do Julia recebe o DESVIO PADRÃO σ, não a variância
X = Normal(10, 2)

println("P(X &lt; 7)        = ", round(cdf(X, 7), digits=4))
println("P(9 &lt; X &lt; 12)   = ", round(cdf(X, 12) - cdf(X, 9), digits=4))
println("Quantil 95%     = ", round(quantile(X, 0.95), digits=2), " minutos")
println("P(X &lt; 0)        = ", round(cdf(X, 0), sigdigits=2), "  (duração negativa: desprezível)")</code></pre>
  </div>
</div>

#### Saída esperada:
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>P(X &lt; 7) &nbsp; &nbsp; &nbsp; &nbsp;= 0.0668</div>
  <div>P(9 &lt; X &lt; 12) &nbsp; = 0.5328</div>
  <div>Quantil 95% &nbsp; &nbsp; = 13.29 minutos</div>
  <div>P(X &lt; 0) &nbsp; &nbsp; &nbsp; &nbsp;= 2.9e-7 &nbsp;(duração negativa: desprezível)</div>
</div>

<div style="border-left: 4px solid #4CAF50; padding: 0.5em; background-color: #e8f5e9; margin: 1em 0;">
  <strong>Resumo dos Resultados (Questão 4):</strong>
  <ul>
    <li>Menos de 7 min: <strong>6,68%</strong></li>
    <li>Entre 9 e 12 min: <strong>53,28%</strong></li>
    <li>Os 5% mais longos: <strong>13,29 minutos ou mais</strong></li>
  </ul>
</div>

<div style="border-left: 4px solid #009688; padding: 1em; background-color: #e0f2f1; margin: 1em 0; border-radius: 4px;">
  <img src="{{ site.baseurl }}/assets/images/boxkite.avif" alt="Pipa em forma de caixa" style="float: right; width: 350px; margin-left: 1em; margin-bottom: 1em;">
  <h4 style="margin-top: 0;">🪁 Questão 5: Tentativas para Empinar uma Pipa (Distribuição Geométrica)</h4>
  <p><strong>Enunciado:</strong></p>
  <p>Por causa do vento, uma pessoa consegue empinar sua pipa em 40% das tentativas ($p = 0{,}4$). As tentativas são independentes umas das outras.</p>
  <p><strong>Pergunta-se:</strong></p>
  <ol>
    <li>Qual é a probabilidade de conseguir na <strong>primeira tentativa</strong>?</li>
    <li>Qual é a probabilidade de serem necessárias <strong>exatamente 3 tentativas</strong>?</li>
    <li>Qual é a probabilidade de serem necessárias <strong>mais de 4 tentativas</strong>?</li>
  </ol>
</div>

### Resolução Detalhada

**Por que geométrica.** As tentativas são independentes, cada uma com sucesso ou fracasso, e a probabilidade de sucesso é sempre $p = 0{,}4$. A pergunta é **quando** vem o primeiro sucesso.

Seja $X$ o **número da tentativa** em que vem o primeiro sucesso ($X = 1, 2, 3, \ldots$). Para $X = k$, as $k - 1$ primeiras tentativas falham e a $k$-ésima dá certo; pela independência, multiplicam-se as probabilidades:

$$P(X = k) = (1 - p)^{k-1} \, p, \qquad k = 1, 2, 3, \ldots$$

(Há outra convenção, que conta o número de **fracassos** antes do primeiro sucesso, começando em 0. Ela dá as mesmas probabilidades com o índice deslocado de 1; é a usada pelo Julia, como mostra o código abaixo.)

#### 1. Sucesso na primeira tentativa

$$P(X = 1) = (0{,}6)^{0} \cdot 0{,}4 = 1 \cdot 0{,}4 = 0{,}4$$

**Resultado:** **40%**.

#### 2. Exatamente 3 tentativas

Duas falhas e depois um sucesso:

$$P(X = 3) = (0{,}6)^{2} \cdot 0{,}4 = 0{,}36 \cdot 0{,}4 = 0{,}144$$

**Resultado:** **14,4%**.

#### 3. Mais de 4 tentativas

Precisar de mais de 4 tentativas é o mesmo que as 4 primeiras falharem. Pela independência:

$$P(X > 4) = (1 - p)^4 = (0{,}6)^4 = 0{,}36 \cdot 0{,}36 = 0{,}1296$$

**Resultado:** cerca de **12,96%**.

**Interpretação:** em média, a pessoa precisa de $E[X] = \frac{1}{p} = \frac{1}{0{,}4} = 2{,}5$ tentativas, mas em cerca de 13% das vezes precisa de 5 ou mais. Os fracassos anteriores não "aumentam a chance" da próxima tentativa: cada uma continua com 40%, por mais tentativas que já tenham falhado.

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

# Cuidado: Geometric(p) do Julia conta os FRACASSOS antes do 1º sucesso (0, 1, 2, …).
# Aqui X = número da tentativa do 1º sucesso, então X = fracassos + 1.
F = Geometric(0.4)

println("P(X = 1) = ", round(pdf(F, 0), digits=4))
println("P(X = 3) = ", round(pdf(F, 2), digits=4))
println("P(X &gt; 4) = ", round(ccdf(F, 3), digits=4))   # mais de 3 fracassos
println("E[X]     = ", round(mean(F) + 1, digits=4))</code></pre>
  </div>
</div>

#### Saída esperada:
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>P(X = 1) = 0.4</div>
  <div>P(X = 3) = 0.144</div>
  <div>P(X &gt; 4) = 0.1296</div>
  <div>E[X] &nbsp; &nbsp; = 2.5</div>
</div>

<div style="border-left: 4px solid #4CAF50; padding: 0.5em; background-color: #e8f5e9; margin: 1em 0;">
  <strong>Resumo dos Resultados (Questão 5):</strong>
  <ul>
    <li>Sucesso na 1ª tentativa: <strong>40%</strong></li>
    <li>Exatamente 3 tentativas: <strong>14,4%</strong></li>
    <li>Mais de 4 tentativas: <strong>12,96%</strong></li>
  </ul>
</div>

<div style="border-left: 4px solid #009688; padding: 1em; background-color: #e0f2f1; margin: 1em 0; border-radius: 4px;">
  <img src="{{ site.baseurl }}/assets/images/boxkite.avif" alt="Pipa em forma de caixa" style="float: right; width: 350px; margin-left: 1em; margin-bottom: 1em;">
  <h4 style="margin-top: 0;">🪁 Questão 6: Três Sucessos com a Pipa (Binomial Negativa)</h4>
  <p><strong>Enunciado:</strong></p>
  <p>A mesma pessoa, ainda com 40% de chance de sucesso em cada tentativa independente, quer empinar a pipa 3 vezes para treinar uma manobra.</p>
  <p><strong>Pergunta-se:</strong></p>
  <ol>
    <li>Qual é a probabilidade de o <strong>terceiro sucesso</strong> vir exatamente na <strong>quinta tentativa</strong>?</li>
    <li>Qual é o <strong>número esperado de tentativas</strong> até os 3 sucessos?</li>
  </ol>
</div>

### Resolução Detalhada

**Por que binomial negativa.** Agora a pergunta é quando vem o $r$-ésimo sucesso, com $r = 3$. Seja $X$ o **número da tentativa** em que vem o 3º sucesso ($X = 3, 4, 5, \ldots$). (A binomial negativa tem várias definições; esta conta tentativas. O Julia conta os fracassos antes do $r$-ésimo sucesso, como mostra o código.)

Para o $r$-ésimo sucesso vir na tentativa $k$, a tentativa $k$ precisa ser um sucesso, e as $k - 1$ anteriores precisam ter exatamente $r - 1$ sucessos, em qualquer ordem:

$$P(X = k) = \binom{k-1}{r-1} p^r (1-p)^{k-r}, \qquad k = r, r+1, \ldots$$

#### 1. Terceiro sucesso na quinta tentativa

**Substituição** ($r = 3$, $k = 5$, $p = 0{,}4$, $1 - p = 0{,}6$):

$$P(X = 5) = \binom{4}{2} \cdot (0{,}4)^3 \cdot (0{,}6)^2$$

**Conta:**

$$\binom{4}{2} = \frac{4!}{2! \cdot 2!} = \frac{24}{4} = 6 \qquad (0{,}4)^3 = 0{,}064 \qquad (0{,}6)^2 = 0{,}36$$

$$P(X = 5) = 6 \cdot 0{,}064 \cdot 0{,}36 = 0{,}384 \cdot 0{,}36 = 0{,}13824$$

**Resultado:** cerca de **13,82%**.

**Interpretação:** o $\binom{4}{2} = 6$ conta as ordens possíveis dos 2 sucessos nas 4 primeiras tentativas (por exemplo, SSFF, SFSF, …); cada ordem, seguida do sucesso na 5ª, tem probabilidade $(0{,}4)^3 \cdot (0{,}6)^2 = 0{,}02304$.

#### 2. Número esperado de tentativas

Esperar 3 sucessos é esperar o 1º sucesso, depois esperar o 2º a partir dali, depois o 3º. Cada espera é uma geométrica com média $\frac{1}{p}$ (Questão 5), e a esperança de uma soma é a soma das esperanças. Por isso:

$$E[X] = \frac{r}{p} = \frac{3}{0{,}4} = 7{,}5 \text{ tentativas}$$

**Resultado:** **7,5 tentativas**, em média.

**Interpretação:** 7,5 é uma média de longo prazo: se a pessoa repetir o treino muitas vezes, a média do número de tentativas fica perto de 7,5. Numa vez específica, o número é sempre inteiro e pode ser bem menor (3, se acertar logo as 3) ou bem maior.

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

# Cuidado: NegativeBinomial(r, p) do Julia conta os FRACASSOS antes do r-ésimo sucesso.
# Aqui X = número da tentativa do 3º sucesso, então X = fracassos + 3.
r, p = 3, 0.4
F = NegativeBinomial(r, p)

println("P(X = 5) = ", round(pdf(F, 5 - r), digits=5))
println("E[X]     = ", round(mean(F) + r, digits=4))</code></pre>
  </div>
</div>

#### Saída esperada:
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>P(X = 5) = 0.13824</div>
  <div>E[X] &nbsp; &nbsp; = 7.5</div>
</div>

<div style="border-left: 4px solid #4CAF50; padding: 0.5em; background-color: #e8f5e9; margin: 1em 0;">
  <strong>Resumo dos Resultados (Questão 6):</strong>
  <ul>
    <li>3º sucesso na 5ª tentativa: <strong>13,82%</strong></li>
    <li>Número esperado de tentativas: <strong>7,5</strong></li>
  </ul>
</div>

---

## Referências

1. Bussab, W. O.; Morettin, P. A. (2023). *Estatística Básica*. 10. ed. Saraiva Uni.
2. Ross, S. M. (2012). *A First Course in Probability*. 9th ed. Pearson.
