---
layout: page
title: Testes de Hipótese
lang: pt
ref: testes-hipotese
parent: inferencia-estatistica
permalink: /pt/inferencia-estatistica/testes-hipotese
order: 1
mathjax: true
description: "Testes de hipótese: H₀ e H₁, erros tipo I e II, p-valor, poder, testes t, Z, qui-quadrado e de proporção, com exemplos resolvidos e código em Julia."
---

<img src="{{ site.baseurl }}/assets/images/testedehipotese.avif" alt="Ilustração de uma pessoa diante de um computador que mostra duas curvas normais sobrepostas" style="max-width: 600px; display: block; margin: 1em auto;">

Um **teste de hipótese** é um procedimento para decidir, a partir de uma amostra, se os dados são compatíveis com uma afirmação sobre a população. Exemplo: uma empresa diz que o atendimento dura, em média, 10 minutos; numa amostra de 36 atendimentos, a média foi 11,2 minutos. A diferença de 1,2 minuto pode ser só acaso da amostra, ou é sinal de que a média verdadeira não é 10? O teste responde a essa pergunta com uma regra explícita e com uma taxa de erro conhecida.

A lógica é parecida com uma prova por contradição, mas probabilística: supõe-se, provisoriamente, que a afirmação (a **hipótese nula**) é verdadeira e calcula-se quão surpreendentes os dados seriam nesse caso. Se forem surpreendentes demais, a hipótese nula é rejeitada.

Na prática atual convivem duas tradições: a de Ronald Fisher, centrada no p-valor como medida de evidência, e a de Jerzy Neyman e Egon Pearson, que acrescentou a hipótese alternativa e os dois tipos de erro. Lehmann (1993) discute as diferenças entre elas e como se combinam.

<div style="border-left: 4px solid #4CAF50; padding: 0.5em; background-color: #e8f5e9;">
  <strong>🎯 Os ingredientes de um teste:</strong>
  <ul>
    <li>a <strong>hipótese nula</strong> $H_0$: a afirmação testada, em geral "não há efeito" ou "não há diferença";</li>
    <li>a <strong>hipótese alternativa</strong> $H_1$: o que se quer detectar, que contradiz $H_0$;</li>
    <li>uma <strong>estatística de teste</strong> $T$, calculada a partir dos dados, cuja distribuição é conhecida quando $H_0$ é verdadeira;</li>
    <li>uma <strong>região crítica</strong>: os valores de $T$ que levam a rejeitar $H_0$, escolhidos de modo que $P(T \text{ na região crítica} \mid H_0) = \alpha$ (ou no máximo $\alpha$, em distribuições discretas).</li>
  </ul>
  <strong>Regra de decisão:</strong> rejeitar $H_0$ se e somente se o valor observado de $T$ cair na região crítica.
</div>

## 1. Conceitos Fundamentais

### 1.1 As etapas

1. **Formular as hipóteses** $H_0$ e $H_1$, **antes** de ver os dados.
2. **Escolher o nível de significância** $\alpha$: a probabilidade de rejeitar $H_0$ quando ela é verdadeira (o erro tipo I). Os valores mais usados são 5% e 1%.
3. **Calcular a estatística de teste** com os dados.
4. **Comparar com a região crítica**, ou calcular o **p-valor**: a probabilidade, supondo $H_0$ verdadeira, de obter um resultado tão extremo quanto o observado, ou mais.
5. **Decidir e interpretar**: rejeitar $H_0$ se p-valor $\leq \alpha$ (o que é o mesmo que a estatística cair na região crítica). **Não rejeitar $H_0$ não prova $H_0$**: quer dizer só que os dados não trouxeram evidência suficiente contra ela.

### 1.2 Bilateral ou unilateral

A escolha depende da hipótese alternativa, definida **antes** da coleta. Na tabela, $\theta$ é o parâmetro testado, $\theta_0$ o valor de $H_0$, $t$ a estatística observada e $t_{\alpha}$ o valor que deixa área $\alpha$ à sua direita.

<div style="overflow-x:auto; margin: 1em 0;">
<table style="border-collapse: collapse; margin: 0 auto; min-width: 580px;">
  <thead style="background: #e3f2fd;">
    <tr>
      <th style="border: 1px solid #bbb; padding: 8px;">Tipo</th>
      <th style="border: 1px solid #bbb; padding: 8px;">Hipótese alternativa</th>
      <th style="border: 1px solid #bbb; padding: 8px;">Rejeita $H_0$ se</th>
      <th style="border: 1px solid #bbb; padding: 8px;">p-valor</th>
      <th style="border: 1px solid #bbb; padding: 8px;">Quando usar</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border: 1px solid #bbb; padding: 8px;"><strong>Bilateral</strong></td>
      <td style="border: 1px solid #bbb; padding: 8px;">$H_1: \theta \neq \theta_0$</td>
      <td style="border: 1px solid #bbb; padding: 8px;">$|t| > t_{\alpha/2}$</td>
      <td style="border: 1px solid #bbb; padding: 8px;">$2P(T > |t|)$</td>
      <td style="border: 1px solid #bbb; padding: 8px;">Desvios nos dois sentidos importam</td>
    </tr>
    <tr>
      <td style="border: 1px solid #bbb; padding: 8px;"><strong>Unilateral à direita</strong></td>
      <td style="border: 1px solid #bbb; padding: 8px;">$H_1: \theta > \theta_0$</td>
      <td style="border: 1px solid #bbb; padding: 8px;">$t > t_{\alpha}$</td>
      <td style="border: 1px solid #bbb; padding: 8px;">$P(T > t)$</td>
      <td style="border: 1px solid #bbb; padding: 8px;">Só interessa desvio para cima</td>
    </tr>
    <tr>
      <td style="border: 1px solid #bbb; padding: 8px;"><strong>Unilateral à esquerda</strong></td>
      <td style="border: 1px solid #bbb; padding: 8px;">$H_1: \theta < \theta_0$</td>
      <td style="border: 1px solid #bbb; padding: 8px;">$t < -t_{\alpha}$</td>
      <td style="border: 1px solid #bbb; padding: 8px;">$P(T < t)$</td>
      <td style="border: 1px solid #bbb; padding: 8px;">Só interessa desvio para baixo</td>
    </tr>
  </tbody>
</table>
</div>

(A coluna "p-valor" da linha bilateral vale para estatísticas de distribuição simétrica, como Z e t.)

<div style="border-left: 4px solid #e53935; padding: 0.5em 1em; background-color: #ffebee; margin: 1em 0;">
<strong>Cuidado:</strong> um teste unilateral detecta melhor um desvio no sentido escolhido, mas não detecta desvios no sentido oposto. Escolher o sentido <em>depois</em> de ver para que lado os dados foram dobra, na prática, a chance de um falso positivo. O sentido tem de vir do problema, antes dos dados.
</div>

### 1.3 Os dois tipos de erro

Toda decisão pode errar de dois jeitos:

<div style="overflow-x:auto; margin: 1em 0;">
  <table style="min-width: 380px; border-collapse: collapse; margin: 0 auto;">
    <thead style="background: #e3f2fd;">
      <tr>
        <th style="border: 1px solid #bbb; padding: 8px;">Decisão \ Realidade</th>
        <th style="border: 1px solid #bbb; padding: 8px;">H<sub>0</sub> verdadeira</th>
        <th style="border: 1px solid #bbb; padding: 8px;">H<sub>0</sub> falsa</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="border: 1px solid #bbb; padding: 8px;">Rejeitar H<sub>0</sub></td>
        <td style="border: 1px solid #bbb; padding: 8px;">🔴 Erro tipo I (probabilidade &alpha;)</td>
        <td style="border: 1px solid #bbb; padding: 8px;">✅ Decisão correta (probabilidade 1 − &beta;, o <strong>poder</strong>)</td>
      </tr>
      <tr>
        <td style="border: 1px solid #bbb; padding: 8px;">Não rejeitar H<sub>0</sub></td>
        <td style="border: 1px solid #bbb; padding: 8px;">✅ Decisão correta (probabilidade 1 − &alpha;)</td>
        <td style="border: 1px solid #bbb; padding: 8px;">🔵 Erro tipo II (probabilidade &beta;)</td>
      </tr>
    </tbody>
  </table>
</div>

- **Erro tipo I (falso positivo):** rejeitar $H_0$ quando ela é verdadeira. Exemplo: um remédio novo não é melhor que o antigo, mas o teste conclui que é. A probabilidade desse erro é o nível $\alpha$, fixado por quem faz o teste.
- **Erro tipo II (falso negativo):** não rejeitar $H_0$ quando ela é falsa. Exemplo: o remédio novo é melhor, mas o teste não detecta a diferença. A probabilidade é $\beta$, e $1 - \beta$ é o **poder do teste**: a chance de detectar um efeito que existe.

$\beta$ não é fixado diretamente: depende de quão grande é o efeito verdadeiro, do tamanho da amostra e da variabilidade dos dados. Com os mesmos dados, diminuir $\alpha$ aumenta $\beta$; para reduzir os dois ao mesmo tempo, é preciso uma amostra maior.

A figura mostra um teste Z unilateral à direita com $\alpha = 0{,}05$. Sob $H_0$, a estatística tem distribuição $N(0, 1)$; supomos que, sob $H_1$, ela tenha distribuição $N(1{,}5;\ 1)$. O código abaixo calcula os três números da figura. (A figura foi gerada por `scripts/figuras-testes-hipotese.jl`, com os mesmos números.)

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

# Teste Z unilateral à direita: sob H₀ a estatística é N(0, 1); sob H₁, N(1,5; 1)
α = 0.05
H0 = Normal(0, 1)
H1 = Normal(1.5, 1)

z_crit = quantile(H0, 1 - α)   # rejeita H₀ se z &gt; z_crit
β = cdf(H1, z_crit)            # P(não rejeitar H₀ | H₁ verdadeira)
poder = 1 - β

println("Valor crítico   = ", round(z_crit, digits=4))
println("Erro tipo II β  = ", round(β, digits=4))
println("Poder 1 − β     = ", round(poder, digits=4))</code></pre>
  </div>
</div>

#### Saída esperada:
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>Valor crítico &nbsp; = 1.6449</div>
  <div>Erro tipo II β &nbsp;= 0.5576</div>
  <div>Poder 1 − β &nbsp; &nbsp; = 0.4424</div>
</div>

![Duas curvas normais: H₀ centrada em 0, em azul, e H₁ centrada em 1,5, em vermelho; uma linha tracejada em 1,6449 separa a área azul à direita (erro tipo I, 0,05) da área vermelha à esquerda (erro tipo II, 0,5576)]({{ site.baseurl }}/assets/images/erro_tipo_I_II.png)
<div class="image-caption">Figura 1: A área azul, à direita do valor crítico sob H₀, é a probabilidade do erro tipo I (α = 0,05). A área vermelha, à esquerda do valor crítico sob H₁, é a do erro tipo II (β ≈ 0,5576).</div>

**Interpretação:**

- **Valor crítico 1,6449:** é o valor que deixa 5% da curva de $H_0$ à direita. Se a estatística observada passar de 1,6449, rejeita-se $H_0$.
- **β ≈ 0,5576:** se $H_1$ for verdadeira, em cerca de 56% das amostras a estatística fica abaixo de 1,6449 e o efeito passa despercebido.
- **Poder ≈ 0,4424:** a chance de detectar o efeito é de só 44%. Um alvo comum no planejamento de estudos é poder de pelo menos 80%; este teste está bem abaixo disso.

Para aumentar o poder: aumentar o tamanho da amostra (o caminho usual), reduzir a variabilidade das medidas ou aceitar um $\alpha$ maior (o que aumenta os falsos positivos). Um efeito verdadeiro maior também é mais fácil de detectar, mas esse não depende de quem faz o teste.

<img src="{{ site.baseurl }}/assets/images/teste_erros.avif" alt="Quatro quadrinhos com um médico e um paciente: verdadeiro positivo (mulher grávida, 'Você está grávida'), verdadeiro negativo (homem idoso, 'Você não está grávida'), falso positivo (homem idoso, 'Você está grávida') e falso negativo (mulher grávida, 'Você não está grávida')" style="max-width: 600px; display: block; margin: 1em auto;">
<div class="image-caption">Figura 2: Os quatro resultados de um teste, num exemplo exagerado de propósito. Com H₀ = "a pessoa não está grávida", dizer "você está grávida" a um homem idoso é um erro tipo I (falso positivo), e dizer "você não está grávida" a uma gestante é um erro tipo II (falso negativo).</div>

## 2. Nível de Significância e Estatística de Teste

### 2.1 Escolha do nível de significância

O **nível de significância** $\alpha$ é a probabilidade de erro tipo I que se aceita correr:

$$\alpha = P(\text{rejeitar } H_0 \mid H_0 \text{ verdadeira})$$

O valor 0,05 é uma **convenção**, não uma lei. A escolha deveria pesar o custo de cada erro no problema: quando um falso positivo é caro (aprovar um tratamento que não funciona), usa-se um $\alpha$ menor, como 0,01; em estudos exploratórios, em que perder um efeito real é o erro mais caro, às vezes se usa 0,10.

Um caso extremo é o critério "5 sigma" da física de partículas: exige-se que o resultado esteja a 5 desvios padrão do esperado sob $H_0$, o que corresponde a uma probabilidade de cerca de $2{,}9 \times 10^{-7}$ (uma chance em 3,5 milhões) numa cauda da normal.

### 2.2 Estatísticas de teste mais usadas

A estatística de teste é uma função dos dados que, sob $H_0$, tem distribuição conhecida. Cada uma vale sob condições que precisam ser conferidas.

**1. Teste Z para a média** (variância da população $\sigma^2$ conhecida):

$$Z = \frac{\bar{X} - \mu_0}{\sigma/\sqrt{n}}$$

Se a população é normal, $Z$ tem distribuição $N(0, 1)$ exatamente quando $H_0: \mu = \mu_0$ é verdadeira. Se não é normal, a distribuição é só aproximadamente $N(0, 1)$, pelo [Teorema do Limite Central]({{ '/pt/probabilidade/teorema-limite-central' | relative_url }}), e a aproximação melhora com $n$ maior. O "n ≥ 30" que aparece em muitos livros é uma regra de bolso, não um teorema: com dados muito assimétricos, pode ser pouco.

**2. Teste t de Student para a média** ($\sigma$ desconhecido, estimado pelo desvio padrão amostral $s$):

$$t = \frac{\bar{X} - \mu_0}{s/\sqrt{n}}$$

Se a população é normal, $t$ tem distribuição t de Student com $n - 1$ graus de liberdade sob $H_0$. Ela tem caudas mais pesadas que a normal porque $s$ também varia de amostra para amostra (para dados normais, $(n-1)s^2/\sigma^2$ tem distribuição qui-quadrado com $n - 1$ graus de liberdade). Com $n$ grande, a t fica muito parecida com a normal padrão.

**3. Teste qui-quadrado** para frequências observadas ($O_i$) e esperadas ($E_i$) em $k$ categorias:

$$\chi^2 = \sum_{i=1}^{k} \frac{(O_i - E_i)^2}{E_i}$$

Sob $H_0$, e com amostra grande, $\chi^2$ tem distribuição **aproximadamente** qui-quadrado. Os graus de liberdade são $k - 1$ no teste de aderência com proporções totalmente especificadas, e $(r-1)(c-1)$ no teste de independência de uma tabela com $r$ linhas e $c$ colunas. A regra de bolso usual para a aproximação valer é que as frequências esperadas sejam pelo menos 5.

**4. Teste F** para comparar duas variâncias:

$$F = \frac{s_1^2}{s_2^2}$$

Se as duas populações são normais e independentes, sob $H_0: \sigma_1^2 = \sigma_2^2$ a razão tem distribuição F com $n_1 - 1$ e $n_2 - 1$ graus de liberdade. Esse teste é muito sensível à falta de normalidade. A mesma distribuição F aparece na [Análise de Variância]({{ '/pt/inferencia-estatistica/analise-variancia' | relative_url }}).

O código abaixo aplica um teste t a 100 valores simulados de uma normal com média 0,5, testando $H_0: \mu = 0$ contra $H_1: \mu \neq 0$:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>using HypothesisTests, Random, Statistics

Random.seed!(123)
dados = randn(100) .+ 0.5     # 100 valores simulados de uma normal com média 0,5

# H₀: μ = 0  contra  H₁: μ ≠ 0
teste = OneSampleTTest(dados, 0)

println("Média amostral = ", round(mean(dados), digits=4))
println("Estatística t  = ", round(teste.t, digits=4))
println("p-valor        = ", round(pvalue(teste), sigdigits=3))</code></pre>
  </div>
</div>

#### Saída esperada:
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>Média amostral = 0.4517</div>
  <div>Estatística t &nbsp;= 4.8554</div>
  <div>p-valor &nbsp; &nbsp; &nbsp; &nbsp;= 4.49e-6</div>
</div>

Como os dados foram gerados com média 0,5, $H_0$ é falsa, e o teste a rejeita com folga: o p-valor é muito pequeno.

## 3. O p-valor

### 3.1 Definição e interpretação

![Curva normal padrão com as duas caudas além de −2,1 e 2,1 pintadas de laranja, cada uma marcada p/2; título "Valor-p bilateral: P(|Z| ≥ 2,1) = 0,036"]({{ site.baseurl }}/assets/images/valor-p.png){:style="max-width: 500px; display: block; margin: 0 auto;"}
<div class="image-caption">Figura 3: Num teste bilateral com z observado = 2,1, o p-valor é a área das duas caudas além de ±2,1 (cerca de 0,036).</div>

O **p-valor** é a probabilidade, calculada supondo $H_0$ verdadeira, de obter uma estatística de teste tão extrema quanto a observada, ou mais:

$$\text{p-valor} = P(T \geq t_{\text{obs}} \mid H_0) \quad \text{(unilateral à direita)}$$

$$\text{p-valor} = 2 \cdot P(T \geq |t_{\text{obs}}| \mid H_0) \quad \text{(bilateral, distribuição simétrica)}$$

**Regra de decisão:** se p-valor $\leq \alpha$, rejeita-se $H_0$; se p-valor $> \alpha$, não se rejeita.

<div style="border-left: 4px solid #e53935; padding: 0.5em 1em; background-color: #ffebee; margin: 1em 0;">
<strong>O que o p-valor não é.</strong> A declaração da American Statistical Association sobre p-valores (Wasserstein e Lazar, 2016) lista seis princípios; vários deles desfazem os erros mais comuns:
<ol>
  <li><strong>Não é a probabilidade de H₀ ser verdadeira.</strong> O p-valor é calculado <em>supondo</em> H₀ verdadeira; ele mede quão incompatíveis os dados são com H₀, não a chance de H₀ estar certa.</li>
  <li><strong>Não mede o tamanho nem a importância do efeito.</strong> Com amostras muito grandes, diferenças pequenas demais para importar dão p-valores minúsculos. Reporte sempre a estimativa do efeito, com seu intervalo de confiança.</li>
  <li><strong>Uma decisão não deveria depender só de o p-valor passar de um limite.</strong> p = 0,049 e p = 0,051 trazem praticamente a mesma evidência.</li>
  <li><strong>Sozinho, não é uma boa medida de evidência</strong> sobre um modelo ou hipótese; ele depende do desenho do estudo, da qualidade das medidas e do que mais se sabe.</li>
</ol>
E, como já dito: <strong>não rejeitar H₀ não é o mesmo que aceitar H₀</strong>. Ausência de evidência não é evidência de ausência.
</div>

### 3.2 Poder do teste

O **poder** é a probabilidade de rejeitar $H_0$ quando ela é falsa: $1 - \beta$. Ele depende do efeito verdadeiro, então só pode ser calculado supondo um valor para ele.

**Exemplo.** Um teste Z bilateral para a média, com $\alpha = 0{,}05$, $n = 30$, $\sigma = 1$, $H_0: \mu = 0$. Qual é o poder se a média verdadeira for $\mu_1 = 0{,}5$?

**Passo 1, o efeito em erros padrão.** O erro padrão da média é $\sigma/\sqrt{n} = 1/\sqrt{30} \approx 0{,}1826$, e a média verdadeira está a

$$\delta = \frac{\mu_1 - \mu_0}{\sigma/\sqrt{n}} = \frac{0{,}5}{0{,}1826} \approx 2{,}7386$$

erros padrão de $\mu_0$. Sob $H_1$, a estatística $Z$ tem distribuição $N(\delta, 1)$.

**Passo 2, β.** O teste não rejeita quando $-1{,}96 < Z < 1{,}96$ (valor crítico bilateral de 5%, 1,9600 com quatro casas). Então:

$$\beta = \Phi(1{,}96 - \delta) - \Phi(-1{,}96 - \delta) = \Phi(-0{,}7786) - \Phi(-4{,}6986) \approx 0{,}2181 - 0{,}0000 = 0{,}2181$$

onde $\Phi$ é a função de distribuição acumulada da normal padrão.

**Resultado:** poder $= 1 - 0{,}2181 = 0{,}7819$, cerca de 78%.

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

# Poder de um teste Z bilateral para a média
n = 30          # tamanho da amostra
α = 0.05        # nível de significância
μ₀ = 0          # média sob H₀
μ₁ = 0.5        # média verdadeira suposta (sob H₁)
σ = 1           # desvio padrão (conhecido)

z_crit = quantile(Normal(), 1 - α/2)
δ = (μ₁ - μ₀) / (σ / √n)      # quantos erros padrão separam μ₁ de μ₀

# Sob H₁, Z ~ N(δ, 1); β = P(−z_crit &lt; Z &lt; z_crit)
β = cdf(Normal(), z_crit - δ) - cdf(Normal(), -z_crit - δ)

println("δ     = ", round(δ, digits=4))
println("β     = ", round(β, digits=4))
println("Poder = ", round(1 - β, digits=4))</code></pre>
  </div>
</div>

#### Saída esperada:
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>δ &nbsp; &nbsp; = 2.7386</div>
  <div>β &nbsp; &nbsp; = 0.2181</div>
  <div>Poder = 0.7819</div>
</div>

**Interpretação:** se a média verdadeira for 0,5, um estudo com 30 observações detecta a diferença em cerca de 78% das vezes. Para chegar a 80%, seria preciso um $n$ um pouco maior.

## 4. Exercícios Resolvidos

### 4.1 Teste t para a média

![Curva t com 35 graus de liberdade, regiões de rejeição pintadas além de ±2,0301 e uma linha azul em t = 3,00, dentro da região de rejeição da direita]({{ site.baseurl }}/assets/images/teste-media.png){:style="max-width: 500px; display: block; margin: 0 auto;"}
<div class="image-caption">Figura 4: Distribuição t com 35 graus de liberdade sob H₀. O t observado, 3,00, cai na região de rejeição da direita.</div>

> **Problema** (números ilustrativos): uma empresa afirma que o tempo médio de atendimento é de 10 minutos. Numa amostra aleatória de 36 atendimentos, a média foi de 11,2 minutos, com desvio padrão de 2,4 minutos. Ao nível de 5%, os dados contradizem a afirmação?

**Dados:**

- $H_0: \mu = 10$ minutos e $H_1: \mu \neq 10$ minutos (bilateral: interessa desvio nos dois sentidos);
- $\bar{x} = 11{,}2$ minutos, $s = 2{,}4$ minutos, $n = 36$, $\alpha = 0{,}05$.

**Condições.** O desvio padrão da população não é conhecido, então o teste é o t. Ele supõe atendimentos independentes e uma população aproximadamente normal; com $n = 36$ e sem assimetria forte, o TLC torna o teste razoável mesmo sem normalidade exata.

**Passo 1, erro padrão:**

$$\text{EP} = \frac{s}{\sqrt{n}} = \frac{2{,}4}{\sqrt{36}} = \frac{2{,}4}{6} = 0{,}4 \text{ minuto}$$

**Passo 2, estatística de teste:**

$$t_{\text{obs}} = \frac{\bar{x} - \mu_0}{\text{EP}} = \frac{11{,}2 - 10}{0{,}4} = \frac{1{,}2}{0{,}4} = 3{,}00$$

A média amostral está 3 erros padrão acima de 10.

**Passo 3, valor crítico.** Com $n - 1 = 35$ graus de liberdade e $\alpha/2 = 0{,}025$ em cada cauda (função `quantile(TDist(35), 0.975)` do Julia, ou tabela t): $t_{0{,}025;\,35} = 2{,}0301$.

**Passo 4, p-valor.** $P(t_{35} > 3{,}00) = 0{,}002474$, e no teste bilateral multiplica-se por 2:

$$\text{p-valor} = 2 \times 0{,}002474 = 0{,}004949 \approx 0{,}0049$$

**Passo 5, decisão.** $\lvert t_{\text{obs}}\rvert = 3{,}00 > 2{,}0301$, ou, do mesmo jeito, p-valor $= 0{,}0049 < 0{,}05$: **rejeita-se $H_0$**.

**Interpretação:** se a média verdadeira fosse 10 minutos, uma média amostral tão longe de 10 quanto 11,2 (para cima ou para baixo) aconteceria em só cerca de 0,5% das amostras de 36 atendimentos. Os dados são evidência de que o tempo médio não é 10 minutos; a estimativa, 11,2 minutos, sugere que o atendimento é mais lento que o anunciado. O teste não diz se 1,2 minuto a mais importa para a empresa: isso é uma questão prática, não estatística.

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

x̄ = 11.2      # média amostral (minutos)
μ₀ = 10.0     # média sob H₀
s = 2.4       # desvio padrão amostral
n = 36
α = 0.05

ep = s / √n                          # erro padrão
t_obs = (x̄ - μ₀) / ep
t_crit = quantile(TDist(n - 1), 1 - α/2)
p_valor = 2 * ccdf(TDist(n - 1), abs(t_obs))

println("Erro padrão   = ", round(ep, digits=4))
println("t observado   = ", round(t_obs, digits=4))
println("Valor crítico = ±", round(t_crit, digits=4))
println("p-valor       = ", round(p_valor, digits=4))</code></pre>
  </div>
</div>

#### Saída esperada:
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>Erro padrão &nbsp; = 0.4</div>
  <div>t observado &nbsp; = 3.0</div>
  <div>Valor crítico = ±2.0301</div>
  <div>p-valor &nbsp; &nbsp; &nbsp; = 0.0049</div>
</div>

### 4.2 Teste qui-quadrado de independência

> **Problema** (números ilustrativos): numa pesquisa com 110 pessoas, perguntou-se a atividade física preferida. A tabela cruza a resposta com o grupo da pessoa (grupo 1 ou grupo 2). Ao nível de 5%, a preferência é independente do grupo?

<div style="overflow-x:auto; margin: 0.5em 0;">
<table style="border-collapse: collapse; margin: 0 auto; text-align: center;">
  <thead style="background: #e8f5e9;">
    <tr><th style="border:1px solid #bbb;padding:6px;"></th><th style="border:1px solid #bbb;padding:6px;">Musculação</th><th style="border:1px solid #bbb;padding:6px;">Corrida</th><th style="border:1px solid #bbb;padding:6px;">Ioga</th><th style="border:1px solid #bbb;padding:6px;">Total</th></tr>
  </thead>
  <tbody>
    <tr><td style="border:1px solid #bbb;padding:6px;"><strong>Grupo 1</strong></td><td style="border:1px solid #bbb;padding:6px;">30</td><td style="border:1px solid #bbb;padding:6px;">15</td><td style="border:1px solid #bbb;padding:6px;">5</td><td style="border:1px solid #bbb;padding:6px;">50</td></tr>
    <tr><td style="border:1px solid #bbb;padding:6px;"><strong>Grupo 2</strong></td><td style="border:1px solid #bbb;padding:6px;">20</td><td style="border:1px solid #bbb;padding:6px;">25</td><td style="border:1px solid #bbb;padding:6px;">15</td><td style="border:1px solid #bbb;padding:6px;">60</td></tr>
    <tr><td style="border:1px solid #bbb;padding:6px;"><strong>Total</strong></td><td style="border:1px solid #bbb;padding:6px;">50</td><td style="border:1px solid #bbb;padding:6px;">40</td><td style="border:1px solid #bbb;padding:6px;">20</td><td style="border:1px solid #bbb;padding:6px;">110</td></tr>
  </tbody>
</table>
</div>

**Hipóteses:** $H_0$: preferência e grupo são independentes; $H_1$: há associação entre eles.

**Passo 1, frequências esperadas.** Se fossem independentes, cada casela teria $E = \frac{\text{total da linha} \times \text{total da coluna}}{\text{total geral}}$:

<div style="overflow-x:auto; margin: 0.5em 0;">
<table style="border-collapse: collapse; margin: 0 auto; text-align: center;">
  <thead style="background: #e8f5e9;">
    <tr><th style="border:1px solid #bbb;padding:6px;">Esperado</th><th style="border:1px solid #bbb;padding:6px;">Musculação</th><th style="border:1px solid #bbb;padding:6px;">Corrida</th><th style="border:1px solid #bbb;padding:6px;">Ioga</th></tr>
  </thead>
  <tbody>
    <tr><td style="border:1px solid #bbb;padding:6px;"><strong>Grupo 1</strong></td><td style="border:1px solid #bbb;padding:6px;">$\frac{50 \cdot 50}{110} \approx 22{,}73$</td><td style="border:1px solid #bbb;padding:6px;">$\frac{50 \cdot 40}{110} \approx 18{,}18$</td><td style="border:1px solid #bbb;padding:6px;">$\frac{50 \cdot 20}{110} \approx 9{,}09$</td></tr>
    <tr><td style="border:1px solid #bbb;padding:6px;"><strong>Grupo 2</strong></td><td style="border:1px solid #bbb;padding:6px;">$\frac{60 \cdot 50}{110} \approx 27{,}27$</td><td style="border:1px solid #bbb;padding:6px;">$\frac{60 \cdot 40}{110} \approx 21{,}82$</td><td style="border:1px solid #bbb;padding:6px;">$\frac{60 \cdot 20}{110} \approx 10{,}91$</td></tr>
  </tbody>
</table>
</div>

Todas as esperadas passam de 5, então a aproximação qui-quadrado é razoável.

**Passo 2, as parcelas** $\frac{(O - E)^2}{E}$, com os esperados sem arredondar:

| Casela | $O$ | $E$ | $\frac{(O-E)^2}{E}$ |
|---|---|---|---|
| Grupo 1, musculação | 30 | 22,7273 | 2,3273 |
| Grupo 1, corrida | 15 | 18,1818 | 0,5568 |
| Grupo 1, ioga | 5 | 9,0909 | 1,8409 |
| Grupo 2, musculação | 20 | 27,2727 | 1,9394 |
| Grupo 2, corrida | 25 | 21,8182 | 0,4640 |
| Grupo 2, ioga | 15 | 10,9091 | 1,5341 |
| **Soma** | | | **8,6625** |

(Em frações exatas, $\chi^2 = \frac{693}{80} = 8{,}6625$. Arredondar os esperados para duas casas antes de calcular dá 8,6566, um pouco diferente; por isso a conta usa os valores completos.)

**Passo 3, graus de liberdade:** $(r - 1)(c - 1) = (2 - 1)(3 - 1) = 2$.

**Passo 4, valor crítico e p-valor.** Da tabela qui-quadrado com 2 graus de liberdade, $\chi^2_{0{,}05;\,2} = 5{,}9915$; o p-valor é $P(\chi^2_2 > 8{,}6625) \approx 0{,}0132$.

**Passo 5, decisão:** $8{,}6625 > 5{,}9915$ (p-valor $0{,}0132 < 0{,}05$): **rejeita-se $H_0$**.

**Interpretação:** nestes dados, a preferência não parece independente do grupo: o grupo 1 prefere musculação mais do que se esperaria sob independência (30 contra 22,7), e o grupo 2 prefere corrida e ioga. O teste diz que há associação, não qual é a causa, nem que toda pessoa de um grupo prefere a mesma coisa.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Distributions, HypothesisTests

O = [30 15 5;     # linha 1
     20 25 15]    # linha 2

n = sum(O)
E = sum(O, dims=2) * sum(O, dims=1) / n     # esperados: total da linha × total da coluna / n
χ² = sum((O .- E).^2 ./ E)
gl = (size(O, 1) - 1) * (size(O, 2) - 1)

println("Esperados = ", round.(E, digits=2))
println("χ²        = ", round(χ², digits=4))
println("Crítico   = ", round(quantile(Chisq(gl), 0.95), digits=4))
println("p-valor   = ", round(ccdf(Chisq(gl), χ²), digits=4))
println("Conferência (ChisqTest): p = ", round(pvalue(ChisqTest(O)), digits=4))</code></pre>
  </div>
</div>

#### Saída esperada:
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>Esperados = [22.73 18.18 9.09; 27.27 21.82 10.91]</div>
  <div>χ² &nbsp; &nbsp; &nbsp; &nbsp;= 8.6625</div>
  <div>Crítico &nbsp; = 5.9915</div>
  <div>p-valor &nbsp; = 0.0132</div>
  <div>Conferência (ChisqTest): p = 0.0132</div>
</div>

### 4.3 Teste para uma proporção

> **Problema** (números ilustrativos): uma empresa afirma que a taxa de conversão de seus e-mails é de 15%. Numa amostra de 200 e-mails, 40 resultaram em conversão. Ao nível de 5%, os dados contradizem a afirmação?

**Dados:** $H_0: p = 0{,}15$, $H_1: p \neq 0{,}15$; $n = 200$, $x = 40$, então $\hat{p} = \frac{40}{200} = 0{,}20$.

**Condições.** O teste Z para proporção usa a aproximação normal da binomial. A regra de bolso é $n p_0 \geq 5$ e $n(1 - p_0) \geq 5$: aqui, $200 \cdot 0{,}15 = 30$ e $200 \cdot 0{,}85 = 170$. Sem correção de continuidade.

**Passo 1, erro padrão sob $H_0$:**

$$\text{EP} = \sqrt{\frac{p_0(1-p_0)}{n}} = \sqrt{\frac{0{,}15 \cdot 0{,}85}{200}} = \sqrt{\frac{0{,}1275}{200}} = \sqrt{0{,}0006375} \approx 0{,}02525$$

**Passo 2, estatística:**

$$Z = \frac{\hat{p} - p_0}{\text{EP}} = \frac{0{,}20 - 0{,}15}{0{,}02525} = \frac{0{,}05}{0{,}02525} \approx 1{,}9803$$

**Passo 3, p-valor:** $2 \cdot P(Z > 1{,}9803) \approx 2 \times 0{,}02384 = 0{,}0477$.

**Passo 4, decisão:** $0{,}0477 < 0{,}05$, e $\lvert Z\rvert = 1{,}9803 > 1{,}96$: **rejeita-se $H_0$**, mas por pouco.

**Interpretação:** a taxa observada, 20%, é evidência (fraca) de que a conversão não é 15%. O p-valor está muito perto de 0,05: com uma conversão a menos (39 em 200), a conclusão já mudaria. Um resultado assim pede cautela, e de preferência mais dados, antes de qualquer decisão.

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

n = 200; x = 40; p₀ = 0.15
p̂ = x / n
ep = sqrt(p₀ * (1 - p₀) / n)      # erro padrão sob H₀
z = (p̂ - p₀) / ep
p_valor = 2 * ccdf(Normal(), abs(z))

println("n·p₀ = ", n * p₀, "   n·(1 − p₀) = ", n * (1 - p₀))
println("p̂ = ", p̂, "   erro padrão = ", round(ep, digits=5))
println("z = ", round(z, digits=4), "   p-valor = ", round(p_valor, digits=4))</code></pre>
  </div>
</div>

#### Saída esperada:
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>n·p₀ = 30.0 &nbsp; n·(1 − p₀) = 170.0</div>
  <div>p̂ = 0.2 &nbsp; erro padrão = 0.02525</div>
  <div>z = 1.9803 &nbsp; p-valor = 0.0477</div>
</div>

### 4.4 Teste para a correlação

> **Problema** (números ilustrativos): para 10 estudantes, anotaram-se as horas de estudo e a nota na prova. Há correlação linear entre as duas, ao nível de 5%?

| Horas | 2 | 3 | 4 | 3 | 5 | 6 | 4 | 5 | 6 | 7 |
|---|---|---|---|---|---|---|---|---|---|---|
| **Nota** | 65 | 70 | 75 | 68 | 80 | 85 | 72 | 78 | 88 | 90 |

**Hipóteses:** $H_0: \rho = 0$ (sem correlação linear na população) e $H_1: \rho \neq 0$. O teste supõe pares independentes e, para o resultado ser exato, normalidade bivariada.

**Passo 1, correlação amostral:** $r \approx 0{,}9837$ (calculada pelo código; a conta à mão está em [Coeficiente de Pearson]({{ '/formulas/coeficiente-pearson.html' | relative_url }})).

**Passo 2, estatística:**

$$t = r\sqrt{\frac{n - 2}{1 - r^2}} = 0{,}9837 \cdot \sqrt{\frac{8}{1 - 0{,}9677}} \approx 15{,}48$$

com $n - 2 = 8$ graus de liberdade.

**Passo 3, decisão:** o valor crítico é $t_{0{,}025;\,8} = 2{,}3060$; como $15{,}48 > 2{,}3060$ (p-valor $\approx 3 \times 10^{-7}$), **rejeita-se $H_0$**.

**Interpretação:** nestes dados há uma associação linear forte e positiva entre horas de estudo e nota. Isso não mostra que estudar mais **causa** notas maiores (outras variáveis podem influir nas duas), e 10 estudantes de um exemplo não permitem generalizar.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Distributions, Statistics

horas = [2, 3, 4, 3, 5, 6, 4, 5, 6, 7]
notas = [65, 70, 75, 68, 80, 85, 72, 78, 88, 90]

n = length(horas)
r = cor(horas, notas)
t = r * sqrt((n - 2) / (1 - r^2))
p_valor = 2 * ccdf(TDist(n - 2), abs(t))

println("r = ", round(r, digits=4))
println("t = ", round(t, digits=4), "   (", n - 2, " graus de liberdade)")
println("p-valor = ", round(p_valor, sigdigits=3))</code></pre>
  </div>
</div>

#### Saída esperada:
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>r = 0.9837</div>
  <div>t = 15.4761 &nbsp; (8 graus de liberdade)</div>
  <div>p-valor = 3.02e-7</div>
</div>

## 5. Relação com Intervalos de Confiança

Num teste bilateral para a média, rejeitar $H_0: \mu = \mu_0$ ao nível $\alpha$ é o mesmo que $\mu_0$ ficar **fora** do intervalo de confiança de nível $1 - \alpha$:

$$\text{IC}_{1-\alpha} = \bar{x} \pm t_{\alpha/2;\,n-1} \cdot \frac{s}{\sqrt{n}}$$

Isso porque $\lvert t_{\text{obs}} \rvert \leq t_{\alpha/2;\,n-1}$ equivale a $\bar{x} - t_{\alpha/2;\,n-1}\frac{s}{\sqrt{n}} \leq \mu_0 \leq \bar{x} + t_{\alpha/2;\,n-1}\frac{s}{\sqrt{n}}$.

No exercício 4.1: $11{,}2 \pm 2{,}0301 \times 0{,}4 = 11{,}2 \pm 0{,}8120$, ou seja, $[10{,}388;\ 12{,}012]$ minutos. O valor 10 está fora do intervalo, e o teste rejeitou $H_0: \mu = 10$, como previsto. O intervalo diz mais que o teste: mostra a faixa de médias compatíveis com os dados.

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

# Intervalo de 95% para a média, com os dados do exercício 4.1
x̄, s, n = 11.2, 2.4, 36
t_crit = quantile(TDist(n - 1), 0.975)
margem = t_crit * s / √n

println("IC 95% = [", round(x̄ - margem, digits=4), "; ", round(x̄ + margem, digits=4), "]")
println("10 está no intervalo? ", x̄ - margem &lt;= 10 &lt;= x̄ + margem)</code></pre>
  </div>
</div>

#### Saída esperada:
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>IC 95% = [10.388; 12.012]</div>
  <div>10 está no intervalo? false</div>
</div>

Mais sobre intervalos em [Intervalos de Confiança]({{ '/pt/inferencia-estatistica/intervalos-confianca' | relative_url }}).

## 6. Muitos Testes ao Mesmo Tempo

Se cada teste tem probabilidade $\alpha$ de dar um falso positivo, fazer muitos testes aumenta a chance de pelo menos um. Com $m$ testes **independentes**, todos com $H_0$ verdadeira:

$$P(\text{pelo menos 1 falso positivo}) = 1 - (1 - \alpha)^m$$

Com $m = 20$ e $\alpha = 0{,}05$: $1 - 0{,}95^{20} \approx 1 - 0{,}3585 = 0{,}6415$. Em 20 testes sem nenhum efeito real, a chance de pelo menos um "achado" é de cerca de 64%.

Duas correções comuns:

- **Bonferroni:** usar $\alpha/m$ em cada teste (com $m = 20$, $0{,}05/20 = 0{,}0025$). Pela desigualdade da união, a probabilidade de pelo menos um falso positivo fica no máximo em $\alpha$, mesmo sem independência. É simples, mas perde muito poder quando $m$ é grande.
- **Benjamini–Hochberg (1995):** controla a **taxa de falsas descobertas** (a proporção esperada de falsos positivos entre as rejeições), em vez da chance de qualquer falso positivo. Ordenam-se os p-valores, $p_{(1)} \leq \cdots \leq p_{(m)}$, acha-se o maior $k$ com $p_{(k)} \leq \frac{k}{m}\,\alpha$ e rejeitam-se as hipóteses dos $k$ menores p-valores. A garantia do artigo original vale para testes independentes.

**Exemplo** com 10 p-valores ilustrativos (0,001; 0,008; 0,012; 0,024; 0,039; 0,041; 0,21; 0,35; 0,62; 0,90) e $\alpha = 0{,}05$: Bonferroni exige $p \leq 0{,}005$ e rejeita só 1 hipótese. No BH, os limites são $\frac{k}{10} \cdot 0{,}05$ = 0,005; 0,010; 0,015; 0,020; …; os três primeiros p-valores ficam abaixo dos seus limites (0,001 ≤ 0,005; 0,008 ≤ 0,010; 0,012 ≤ 0,015) e o quarto não (0,024 > 0,020), nem nenhum depois dele; então $k^* = 3$, e o BH rejeita 3.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code># Benjamini–Hochberg à mão, com 10 p-valores ilustrativos
p = [0.001, 0.008, 0.012, 0.024, 0.039, 0.041, 0.21, 0.35, 0.62, 0.90]
m, α = length(p), 0.05

ordem = sortperm(p)
limites = (1:m) ./ m .* α                 # k/m · α
abaixo = p[ordem] .&lt;= limites
k = findlast(abaixo)                       # maior k com p₍ₖ₎ ≤ k/m · α
k = k === nothing ? 0 : k

println("P(pelo menos 1 falso positivo em 20 testes) = ", round(1 - 0.95^20, digits=4))
println("Bonferroni: α/m = ", α / m, " → hipóteses rejeitadas: ", count(p .&lt;= α / m))
println("BH: k* = ", k, " → hipóteses rejeitadas: ", k)</code></pre>
  </div>
</div>

#### Saída esperada:
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>P(pelo menos 1 falso positivo em 20 testes) = 0.6415</div>
  <div>Bonferroni: α/m = 0.005 → hipóteses rejeitadas: 1</div>
  <div>BH: k* = 3 → hipóteses rejeitadas: 3</div>
</div>

## 7. Como Escolher o Teste

A [árvore de decisão interativa]({{ site.baseurl }}/testes-estatisticos/arvore/) leva, em poucas perguntas (o objetivo, o tipo de dado e o delineamento), a um dos testes do [catálogo]({{ site.baseurl }}/testes-estatisticos/). A tabela resume os casos mais comuns:

<div style="overflow-x:auto; margin: 1em 0;">
<table style="border-collapse: collapse; margin: 0 auto; min-width: 580px;">
<thead style="background: #e3f2fd;">
<tr><th style="border:1px solid #bbb;padding:8px;">Objetivo</th><th style="border:1px solid #bbb;padding:8px;">Paramétrico (supõe normalidade)</th><th style="border:1px solid #bbb;padding:8px;">Não paramétrico</th></tr>
</thead>
<tbody>
<tr><td style="border:1px solid #bbb;padding:8px;">Média de um grupo contra um valor</td><td style="border:1px solid #bbb;padding:8px;">Teste t de uma amostra</td><td style="border:1px solid #bbb;padding:8px;">Wilcoxon (postos sinalizados)</td></tr>
<tr><td style="border:1px solid #bbb;padding:8px;">Dois grupos independentes</td><td style="border:1px solid #bbb;padding:8px;">Teste t de Welch (ou t com variâncias iguais)</td><td style="border:1px solid #bbb;padding:8px;">Mann-Whitney</td></tr>
<tr><td style="border:1px solid #bbb;padding:8px;">Dois grupos pareados (antes e depois)</td><td style="border:1px solid #bbb;padding:8px;">Teste t pareado</td><td style="border:1px solid #bbb;padding:8px;">Wilcoxon (postos sinalizados)</td></tr>
<tr><td style="border:1px solid #bbb;padding:8px;">Três ou mais grupos independentes</td><td style="border:1px solid #bbb;padding:8px;">ANOVA</td><td style="border:1px solid #bbb;padding:8px;">Kruskal-Wallis</td></tr>
<tr><td style="border:1px solid #bbb;padding:8px;">Três ou mais medidas no mesmo grupo</td><td style="border:1px solid #bbb;padding:8px;">ANOVA de medidas repetidas</td><td style="border:1px solid #bbb;padding:8px;">Friedman</td></tr>
<tr><td style="border:1px solid #bbb;padding:8px;">Associação entre duas variáveis categóricas</td><td colspan="2" style="border:1px solid #bbb;padding:8px;">Qui-quadrado de independência; teste exato de Fisher quando há esperados pequenos</td></tr>
<tr><td style="border:1px solid #bbb;padding:8px;">Relação entre duas variáveis numéricas</td><td style="border:1px solid #bbb;padding:8px;">Correlação de Pearson (relação linear)</td><td style="border:1px solid #bbb;padding:8px;">Correlação de Spearman (relação monótona)</td></tr>
<tr><td style="border:1px solid #bbb;padding:8px;">Uma proporção contra um valor</td><td style="border:1px solid #bbb;padding:8px;">Teste Z para proporção (n grande)</td><td style="border:1px solid #bbb;padding:8px;">Teste binomial exato</td></tr>
</tbody>
</table>
</div>

**Paramétrico ou não paramétrico?** Os testes paramétricos supõem uma forma para a distribuição (em geral, normal); quando ela vale, eles têm mais poder. Os não paramétricos supõem menos sobre a forma, toleram melhor valores atípicos e servem para dados ordinais, mas testam hipóteses um pouco diferentes (o Mann-Whitney, por exemplo, não compara médias, e sim se os valores de um grupo tendem a ser maiores que os do outro). Com amostras pequenas e dados muito assimétricos, o não paramétrico costuma ser a escolha mais segura.

O código compara os dois num exemplo com dados assimétricos (exponenciais com médias 1,0 e 1,5, 20 valores em cada grupo):

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Distributions, HypothesisTests, Random

Random.seed!(123)
grupo1 = rand(Exponential(1.0), 20)    # dados assimétricos: médias 1,0 e 1,5
grupo2 = rand(Exponential(1.5), 20)

teste_t = UnequalVarianceTTest(grupo1, grupo2)    # teste t de Welch
teste_mw = MannWhitneyUTest(grupo1, grupo2)

println("Welch:        p = ", round(pvalue(teste_t), digits=4))
println("Mann-Whitney: p = ", round(pvalue(teste_mw), digits=4))</code></pre>
  </div>
</div>

#### Saída esperada:
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>Welch: &nbsp; &nbsp; &nbsp; &nbsp;p = 0.0412</div>
  <div>Mann-Whitney: p = 0.1344</div>
</div>

Nesta amostra, o teste de Welch rejeita a igualdade ao nível de 5% e o Mann-Whitney não. Isso não quer dizer que um sempre tenha mais poder que o outro: com outra semente, o resultado pode se inverter. O exemplo mostra que testes diferentes, que testam hipóteses diferentes, podem discordar perto do limite, e que a escolha do teste tem de ser feita **antes** de ver o resultado.

## 8. Erros Comuns e Boas Práticas

- **Definir as hipóteses, o teste e o α depois de ver os dados.** Tudo isso vem antes; escolher depois é uma forma de "p-hacking".
- **Ler "não rejeitar" como "provar $H_0$".** Sem poder suficiente, não rejeitar é o resultado esperado mesmo que haja um efeito.
- **Confundir significância estatística com importância prática.** Reporte o tamanho do efeito e o intervalo de confiança, não só o p-valor.
- **Fazer muitos testes sem correção** (seção 6).
- **Ignorar as condições do teste:** independência das observações, normalidade quando o teste a supõe (verificável com um gráfico QQ ou o teste de Shapiro-Wilk), variâncias parecidas quando o teste supõe variâncias iguais.
- **Planejar sem calcular o poder:** decida o tamanho da amostra antes, para o efeito que importa detectar.

## Quiz Interativo

<div style="border: 2px solid #4CAF50; border-radius: 8px; padding: 16px; background: #f9f9f9; margin-top: 32px; margin-bottom: 32px;">
  <strong>🎮 Teste seus conhecimentos sobre testes de hipótese:</strong>
  <br><br>
  <iframe src="{{ site.baseurl }}/quiz/" title="Quiz de testes estatísticos" width="100%" height="700" style="border:none; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.1);"></iframe>
  <br>
  <span style="font-size: 0.95em; color: #555;">Se o quiz não carregar, <a href="{{ site.baseurl }}/quiz/" target="_blank">abra em nova aba</a>.</span>
</div>

## Referências

1. Benjamini, Y.; Hochberg, Y. (1995). Controlling the False Discovery Rate: A Practical and Powerful Approach to Multiple Testing. *Journal of the Royal Statistical Society: Series B (Methodological)*, 57(1), 289–300. DOI: [10.1111/j.2517-6161.1995.tb02031.x](https://doi.org/10.1111/j.2517-6161.1995.tb02031.x).
2. Bussab, W. O.; Morettin, P. A. (2023). *Estatística Básica*. 10. ed. Saraiva Uni.
3. Lehmann, E. L. (1993). The Fisher, Neyman-Pearson Theories of Testing Hypotheses: One Theory or Two? *Journal of the American Statistical Association*, 88(424), 1242–1249. DOI: [10.1080/01621459.1993.10476404](https://doi.org/10.1080/01621459.1993.10476404).
4. Lehmann, E. L.; Romano, J. P. (2005). *Testing Statistical Hypotheses*. 3rd ed. Springer.
5. Wasserman, L. (2004). *All of Statistics: A Concise Course in Statistical Inference*. Springer.
6. Wasserstein, R. L.; Lazar, N. A. (2016). The ASA's Statement on p-Values: Context, Process, and Purpose. *The American Statistician*, 70(2), 129–133. DOI: [10.1080/00031305.2016.1154108](https://doi.org/10.1080/00031305.2016.1154108).
