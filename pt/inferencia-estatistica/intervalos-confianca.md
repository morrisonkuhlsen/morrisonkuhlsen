---
layout: page
title: Intervalos de Confiança
lang: pt
ref: intervalos-confianca
parent: inferencia-estatistica
permalink: /pt/inferencia-estatistica/intervalos-confianca
order: 2
mathjax: true
description: "Intervalo de confiança para média e proporção: o que 95% quer dizer, exemplo resolvido passo a passo, tamanho da amostra e código em Julia."
---

## Introdução

Uma amostra dá uma **estimativa pontual** do parâmetro da população: a média de 12 tintas testadas, por exemplo, estima a média de todas as tintas daquele tipo. Mas outra amostra daria outro número. O **intervalo de confiança** acrescenta à estimativa uma margem que leva em conta essa variação de amostra para amostra, e diz com que frequência o método acerta.

![Uma lata de tinta no chão de madeira, diante de uma parede iluminada pelo sol]({{ site.baseurl }}/assets/images/concept.avif){:style="max-width: 400px; display: block; margin: 0 auto;"}
<div class="image-caption" style="text-align: center;">Figura 1: O exemplo resolvido desta página estima o tempo médio que uma tinta resiste ao sol (ilustração).</div>

<div style="border-left: 4px solid #4CAF50; padding: 0.5em; background-color: #e8f5e9;">
  <strong>🎯 A forma geral:</strong>
  $$\text{estimativa} \pm \underbrace{\text{valor crítico} \times \text{erro padrão}}_{\text{margem de erro}}$$
  O <strong>erro padrão</strong> mede quanto a estimativa varia de amostra para amostra; o <strong>valor crítico</strong> vem da distribuição da estimativa (normal ou t) e do nível de confiança escolhido.
</div>

## 1. O que "95% de confiança" quer dizer

O nível de confiança é uma propriedade do **método**, não de um intervalo específico. Se o mesmo procedimento fosse repetido com muitas amostras diferentes, cerca de 95% dos intervalos calculados conteriam o valor verdadeiro do parâmetro, e cerca de 5% não.

A figura mostra isso numa simulação: 50 amostras de 12 valores, tiradas de uma população cuja média verdadeira é $\mu = 125$ (conhecida aqui só para podermos conferir). Cada amostra dá um intervalo de 95%.

![50 segmentos verticais, um por amostra, em torno de uma linha tracejada em 125; 44 segmentos azuis cruzam a linha e 6 vermelhos ficam inteiramente acima ou abaixo dela]({{ site.baseurl }}/assets/images/cobertura_intervalos.png)
<div class="image-caption">Figura 2: 50 intervalos de 95% calculados com 50 amostras diferentes. Os azuis contêm a média verdadeira, 125; os vermelhos não. Nesta simulação, 44 de 50 acertaram.</div>

Em 50 intervalos, o número de acertos varia: aqui foram 44 (88%), um pouco abaixo dos 47 ou 48 esperados, por acaso. Com muitas repetições, a proporção fica perto de 95%; o código abaixo repete o procedimento 10.000 vezes:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Statistics, Distributions, Random

# 10.000 amostras de tamanho 12 de uma população N(125, 3²), cuja média μ = 125
# é conhecida aqui só para podermos conferir quantos intervalos acertam.
Random.seed!(123)
μ, σ, n, repeticoes = 125, 3, 12, 10_000
t = quantile(TDist(n - 1), 0.975)

function contem_μ(amostra)
    me = t * std(amostra) / sqrt(n)
    return mean(amostra) - me &lt;= μ &lt;= mean(amostra) + me
end

acertos = count(_ -&gt; contem_μ(rand(Normal(μ, σ), n)), 1:repeticoes)
println("Proporção de intervalos que contêm μ: ", acertos / repeticoes)</code></pre>
  </div>
</div>

#### Saída esperada:
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>Proporção de intervalos que contêm μ: 0.9468</div>
</div>

O que isso **não** quer dizer:

- **Não** é "95% de chance de $\mu$ estar neste intervalo". Depois de calculado, o intervalo é fixo, e $\mu$ também: ou ele contém $\mu$, ou não. Os 95% descrevem o método antes de a amostra ser sorteada. (A pergunta "qual a probabilidade de $\mu$ estar aqui?" é respondida por outro tipo de intervalo, o intervalo de credibilidade da estatística bayesiana.)
- **Não** é "95% dos dados estão no intervalo". O intervalo é para a **média**, não para os valores individuais; ele fica mais estreito à medida que a amostra cresce, enquanto os dados continuam espalhados (veja a figura 3).
- **Não** cobre erros que não são de amostragem: uma amostra que não é aleatória, medições com viés ou perguntas mal formuladas podem deixar o intervalo inteiro longe do valor verdadeiro.

## 2. Exemplo Resolvido: Resistência de uma Tinta

> **Problema** (números ilustrativos): uma fábrica testou 12 latas de uma tinta e mediu, em horas, quanto tempo cada uma resistiu ao sol intenso até desbotar: 120, 130, 125, 128, 122, 127, 126, 124, 129, 123, 128, 125. Calcule um intervalo de 95% de confiança para o tempo médio de resistência dessa tinta.

**Fórmula.** O desvio padrão da população não é conhecido, então ele é estimado pelo desvio padrão amostral $s$ e o valor crítico vem da distribuição t de Student:

$$\text{IC} = \bar{x} \pm t_{\alpha/2;\,n-1} \cdot \frac{s}{\sqrt{n}}$$

onde $\bar{x}$ é a média amostral, $s$ o desvio padrão amostral, $n$ o tamanho da amostra e $t_{\alpha/2;\,n-1}$ o valor que deixa área $\alpha/2$ à direita na distribuição t com $n - 1$ graus de liberdade (para 95%, $\alpha = 0{,}05$).

**Condições.** O intervalo t supõe observações independentes, de uma população aproximadamente normal. O t é usado porque $\sigma$ é desconhecido, e não por causa do tamanho da amostra: com $\sigma$ desconhecido, o certo é o t mesmo com $n$ grande (os dois só ficam parecidos). Com $n = 12$, a normalidade importa; estes dados não têm assimetria forte nem valores atípicos.

**Passo 1, média:**

$$\bar{x} = \frac{120 + 130 + 125 + 128 + 122 + 127 + 126 + 124 + 129 + 123 + 128 + 125}{12} = \frac{1507}{12} \approx 125{,}5833 \text{ horas}$$

**Passo 2, desvio padrão.** Cada desvio $x_i - \bar{x}$ ao quadrado, com a média completa ($\frac{1507}{12}$):

| $x_i$ | $x_i - \bar{x}$ | $(x_i - \bar{x})^2$ |
|---|---|---|
| 120 | −5,5833 | 31,1736 |
| 130 | 4,4167 | 19,5069 |
| 125 | −0,5833 | 0,3403 |
| 128 | 2,4167 | 5,8403 |
| 122 | −3,5833 | 12,8403 |
| 127 | 1,4167 | 2,0069 |
| 126 | 0,4167 | 0,1736 |
| 124 | −1,5833 | 2,5069 |
| 129 | 3,4167 | 11,6736 |
| 123 | −2,5833 | 6,6736 |
| 128 | 2,4167 | 5,8403 |
| 125 | −0,5833 | 0,3403 |
| **Soma** | **0** | **98,9167** |

(Em fração exata, a soma é $\frac{1187}{12}$.)

$$s^2 = \frac{98{,}9167}{12 - 1} = \frac{98{,}9167}{11} \approx 8{,}9924 \qquad s = \sqrt{8{,}9924} \approx 2{,}9987 \text{ horas}$$

**Passo 3, valor crítico.** Com $n - 1 = 11$ graus de liberdade e 2,5% em cada cauda (tabela t, ou `quantile(TDist(11), 0.975)` no Julia): $t_{0{,}025;\,11} = 2{,}2010$.

**Passo 4, erro padrão:**

$$\text{EP} = \frac{s}{\sqrt{n}} = \frac{2{,}9987}{\sqrt{12}} = \frac{2{,}9987}{3{,}4641} \approx 0{,}8657 \text{ hora}$$

**Passo 5, margem de erro:**

$$\text{ME} = 2{,}2010 \times 0{,}8657 \approx 1{,}9053 \text{ hora}$$

**Passo 6, intervalo:**

$$\text{IC}_{95\%} = 125{,}5833 \pm 1{,}9053 = [123{,}68;\ 127{,}49] \text{ horas}$$

**Interpretação:** o tempo médio de resistência dessa tinta foi estimado em 125,6 horas, com margem de erro de cerca de 1,9 hora. O intervalo [123,68; 127,49] foi obtido por um método que, em 95% das amostras, produz um intervalo que contém a média verdadeira. Se o padrão de qualidade exigisse uma média de pelo menos 123 horas, todo o intervalo estaria acima disso; se exigisse 125 horas, o intervalo não permitiria afirmar que a tinta cumpre o padrão.

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

dados = [120, 130, 125, 128, 122, 127, 126, 124, 129, 123, 128, 125]   # horas
n = length(dados)
x̄ = mean(dados)
s = std(dados)                         # desvio padrão amostral (divide por n − 1)
t = quantile(TDist(n - 1), 0.975)      # valor crítico para 95%
ep = s / sqrt(n)                       # erro padrão da média
me = t * ep                            # margem de erro

println("x̄ = ", round(x̄, digits=4), "   s = ", round(s, digits=4))
println("t = ", round(t, digits=4), "   EP = ", round(ep, digits=4), "   ME = ", round(me, digits=4))
println("IC 95% = [", round(x̄ - me, digits=2), "; ", round(x̄ + me, digits=2), "]")</code></pre>
  </div>
</div>

#### Saída esperada:
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>x̄ = 125.5833 &nbsp; s = 2.9987</div>
  <div>t = 2.201 &nbsp; EP = 0.8657 &nbsp; ME = 1.9053</div>
  <div>IC 95% = [123.68; 127.49]</div>
</div>

![Os 12 tempos como pontos pretos espalhados entre 120 e 130 horas, uma linha azul na média 125,58 e uma faixa azul clara de 123,68 a 127,49, o intervalo de 95% para a média]({{ site.baseurl }}/assets/images/intervalo_confianca_resistencia_tinta.png)
<div class="image-caption">Figura 3: Os 12 tempos medidos, a média (linha) e o intervalo de 95% para a média (faixa). Sete dos 12 tempos individuais ficam fora da faixa, e está tudo certo: o intervalo estima onde está a média, não onde caem as latas individuais. A figura foi gerada por scripts/figuras-intervalos-confianca.jl.</div>

## 3. Outros Intervalos

### 3.1 Média com $\sigma$ conhecido

Quando o desvio padrão da população é conhecido (situação rara, por exemplo um instrumento de medição com precisão bem estabelecida), o valor crítico vem da normal padrão:

$$\text{IC} = \bar{x} \pm z_{\alpha/2} \cdot \frac{\sigma}{\sqrt{n}}$$

Para 95%, $z_{0{,}025} = 1{,}96$. O intervalo é exato se a população é normal, e aproximado (pelo [Teorema do Limite Central]({{ '/pt/probabilidade/teorema-limite-central' | relative_url }})) se não é.

**Exemplo** (números ilustrativos): numa amostra de $n = 100$ medidas de altura, $\bar{x} = 170$ cm, com $\sigma = 5$ cm conhecido. Então $\text{ME} = 1{,}96 \cdot \frac{5}{\sqrt{100}} = 1{,}96 \cdot 0{,}5 = 0{,}98$ cm, e o intervalo de 95% é $[169{,}02;\ 170{,}98]$ cm.

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

x̄ = 170      # média amostral (cm)
σ = 5        # desvio padrão da população, suposto conhecido (cm)
n = 100
z = quantile(Normal(), 0.975)    # 1,96 para 95%

me = z * σ / sqrt(n)
println("z = ", round(z, digits=4), "   ME = ", round(me, digits=4))
println("IC 95% = [", round(x̄ - me, digits=2), "; ", round(x̄ + me, digits=2), "]")</code></pre>
  </div>
</div>

#### Saída esperada:
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>z = 1.96 &nbsp; ME = 0.98</div>
  <div>IC 95% = [169.02; 170.98]</div>
</div>

### 3.2 Proporção

Para uma proporção, a estimativa é a proporção amostral $\hat{p} = \frac{x}{n}$ (sucessos divididos pelo tamanho da amostra), e o intervalo aproximado é:

$$\text{IC} = \hat{p} \pm z_{\alpha/2} \sqrt{\frac{\hat{p}(1-\hat{p})}{n}}$$

Ele usa a aproximação normal da binomial, que só é boa com amostra grande e $\hat{p}$ longe de 0 e de 1; a regra de bolso é $n\hat{p} \geq 5$ e $n(1 - \hat{p}) \geq 5$ (alguns livros pedem 10). Fora disso, há intervalos melhores para proporção.

**Exemplo** (números ilustrativos): 45 de 100 pessoas entrevistadas aprovam uma proposta. Então $\hat{p} = 0{,}45$, $n\hat{p} = 45$ e $n(1 - \hat{p}) = 55$ (a condição vale), e:

$$\text{EP} = \sqrt{\frac{0{,}45 \cdot 0{,}55}{100}} = \sqrt{0{,}002475} \approx 0{,}0497 \qquad \text{ME} = 1{,}96 \cdot 0{,}0497 \approx 0{,}0975$$

$$\text{IC}_{95\%} = 0{,}45 \pm 0{,}0975 = [0{,}3525;\ 0{,}5475]$$

**Interpretação:** a aprovação está estimada em 45%, com margem de erro de cerca de 10 pontos percentuais. O intervalo vai de 35% a 55%: com esta amostra, não dá para dizer se a maioria aprova ou desaprova.

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

sucessos, n = 45, 100
p̂ = sucessos / n
z = quantile(Normal(), 0.975)
ep = sqrt(p̂ * (1 - p̂) / n)

println("n·p̂ = ", n * p̂, "   n·(1 − p̂) = ", round(n * (1 - p̂), digits=2))
println("EP = ", round(ep, digits=4), "   ME = ", round(z * ep, digits=4))
println("IC 95% = [", round(p̂ - z * ep, digits=4), "; ", round(p̂ + z * ep, digits=4), "]")</code></pre>
  </div>
</div>

#### Saída esperada:
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>n·p̂ = 45.0 &nbsp; n·(1 − p̂) = 55.0</div>
  <div>EP = 0.0497 &nbsp; ME = 0.0975</div>
  <div>IC 95% = [0.3525; 0.5475]</div>
</div>

## 4. Tamanho da Amostra

Para que a margem de erro seja no máximo $E$, basta isolar $n$ na fórmula da margem.

**Média** ($\sigma$ conhecido ou estimado de um estudo anterior):

$$z_{\alpha/2}\frac{\sigma}{\sqrt{n}} \leq E \quad\Longleftrightarrow\quad n \geq \left(\frac{z_{\alpha/2}\,\sigma}{E}\right)^2$$

**Proporção**, com $p^{\ast}$ uma estimativa prévia da proporção:

$$n \geq \frac{z_{\alpha/2}^2\, p^{\ast}(1-p^{\ast})}{E^2}$$

Sem estimativa prévia, usa-se $p^{\ast} = 0{,}5$, que dá o maior valor possível de $p^{\ast}(1 - p^{\ast})$ (0,25) e, por isso, um $n$ que serve para qualquer proporção verdadeira. O resultado é sempre arredondado **para cima**.

**Exemplos:**

- Proporção com margem de 5 pontos percentuais e 95% de confiança: $n \geq \frac{1{,}96^2 \cdot 0{,}25}{0{,}05^2} = \frac{3{,}8415 \cdot 0{,}25}{0{,}0025} \approx 384{,}15$, ou seja, **385** pessoas.
- Média com $\sigma = 5$ cm e margem de 1 cm: $n \geq \left(\frac{1{,}96 \cdot 5}{1}\right)^2 = 9{,}8^2 \approx 96{,}04$, ou seja, **97** medidas.

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

z = quantile(Normal(), 0.975)

# Proporção: margem E = 0,05 (5 pontos percentuais), sem estimativa prévia de p (usa 0,5)
E = 0.05
n_prop = z^2 * 0.5 * 0.5 / E^2
println("Proporção: n = ", round(n_prop, digits=2), " → ", ceil(Int, n_prop))

# Média: σ = 5 cm, margem E = 1 cm
σ, E = 5, 1
n_media = (z * σ / E)^2
println("Média: n = ", round(n_media, digits=2), " → ", ceil(Int, n_media))</code></pre>
  </div>
</div>

#### Saída esperada:
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>Proporção: n = 384.15 → 385</div>
  <div>Média: n = 96.04 → 97</div>
</div>

Essas fórmulas supõem amostragem aleatória simples de uma população grande; o planejamento de amostras mais complexas está em [Amostragem]({{ '/pt/inferencia-estatistica/amostragem' | relative_url }}).

## 5. O que Muda a Largura do Intervalo

A margem de erro é $\text{valor crítico} \times \frac{s}{\sqrt{n}}$, então:

- **Nível de confiança maior → intervalo mais largo.** No exemplo da tinta: 90% dá $[124{,}03;\ 127{,}14]$ (margem 1,55); 95% dá $[123{,}68;\ 127{,}49]$ (margem 1,91); 99% dá $[122{,}89;\ 128{,}27]$ (margem 2,69). Mais confiança custa precisão.
- **Amostra maior → intervalo mais estreito**, mas devagar: a margem cai com $\sqrt{n}$. Para cortar a margem pela metade, é preciso **quadruplicar** a amostra.
- **Mais variabilidade nos dados → intervalo mais largo.**

## 6. Relação com Testes de Hipótese

Um intervalo de $(1 - \alpha)$ de confiança para a média contém exatamente os valores $\mu_0$ que **não** seriam rejeitados por um teste t bilateral de nível $\alpha$. No exemplo da tinta, um teste de $H_0: \mu = 125$ ao nível de 5% não rejeitaria (125 está dentro de $[123{,}68;\ 127{,}49]$), e um teste de $H_0: \mu = 128$ rejeitaria. O intervalo dá mais informação que o teste: mostra todos os valores compatíveis com os dados de uma vez. Mais em [Testes de Hipótese]({{ '/pt/inferencia-estatistica/testes-hipotese' | relative_url }}).

## 7. Um Pouco de História

O intervalo de confiança foi proposto por Jerzy Neyman, primeiro num apêndice de um trabalho sobre amostragem apresentado à Royal Statistical Society em 1934, e depois desenvolvido num artigo de 1937 sobre a teoria da estimação. A interpretação pela frequência de acertos em repetições do procedimento, descrita na seção 1, segue a formulação de Neyman.

## 8. Cuidados

- O intervalo só leva em conta o **erro de amostragem**. Amostras não aleatórias, não resposta e medidas com viés não entram na margem de erro.
- As fórmulas supõem **observações independentes**. Dados agrupados (alunos da mesma turma, medidas repetidas na mesma pessoa) pedem outros métodos.
- Com **amostras pequenas** e dados assimétricos ou com valores atípicos, o intervalo t pode ter cobertura bem diferente de 95%.
- Com **proporções perto de 0 ou de 1**, ou amostras pequenas, o intervalo da seção 3.2 funciona mal.
- Calcular muitos intervalos e destacar só os "interessantes" faz a cobertura real cair, pelo mesmo motivo que os [testes múltiplos]({{ '/pt/inferencia-estatistica/testes-hipotese' | relative_url }}) aumentam os falsos positivos.

## Referências

1. Bussab, W. O.; Morettin, P. A. (2023). *Estatística Básica*. 10. ed. Saraiva Uni.
2. Neyman, J. (1934). On the Two Different Aspects of the Representative Method: The Method of Stratified Sampling and the Method of Purposive Selection. *Journal of the Royal Statistical Society*, 97(4), 558–625.
3. Neyman, J. (1937). Outline of a Theory of Statistical Estimation Based on the Classical Theory of Probability. *Philosophical Transactions of the Royal Society of London. Series A*, 236(767), 333–380. DOI: [10.1098/rsta.1937.0005](https://doi.org/10.1098/rsta.1937.0005).
4. Triola, M. F. (2024). *Introdução à Estatística*. 14. ed. LTC.
