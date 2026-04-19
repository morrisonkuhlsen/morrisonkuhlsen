---
layout: page
title: Estimadores
lang: pt
ref: estimadores
parent: inferencia-estatistica
permalink: /pt/inferencia-estatistica/estimadores
order: 4
---

![Estimadores Estatísticos]({{ site.baseurl }}/assets/images/estimadores.png){:style="max-width: 600px; display: block; margin: 0 auto;"}

$$
\text{Dados} \;\longrightarrow\; \text{Distribuição} \;\longrightarrow\; \text{Verossimilhança} \;\longrightarrow\; \text{Suficiência} \;\longrightarrow\; \text{Estimador} \;\longrightarrow\; \text{Inferência} \;\longrightarrow\; \text{Decisão}
$$

Este material desenvolve todo esse fluxo com rigor matemático e exemplos concretos. O problema-guia é o **controle de qualidade do peso de embalagens de um produto industrial**.

---

## 1. Definição do Problema Estatístico

### 1.1 Pergunta de interesse

Uma empresa produz embalagens de um produto que, segundo especificação, devem conter **500 g** em média. O engenheiro de qualidade deseja verificar se a máquina de envase está calibrada corretamente.

> **Pergunta estatística:** A média do peso das embalagens produzidas pela máquina é de 500 g?

### 1.2 Parâmetro populacional

O parâmetro de interesse é a **média populacional** $\mu$:

$$
\mu = \mathbb{E}[X]
$$

onde $X$ representa o peso (em gramas) de uma embalagem selecionada aleatoriamente.

### 1.3 Contexto e hipóteses de trabalho

- O processo de envase produz pesos que flutuam em torno de um valor central.
- Histórico de produção indica **desvio padrão do processo** $\sigma = 5$ g (valor conhecido de longo prazo).
- Coletou-se uma **amostra aleatória simples** de $n = 10$ embalagens.
- Objetivo: decidir se a máquina deve ser recalibrada.

---

## 2. Identificação da Distribuição dos Dados

### 2.1 Natureza dos dados

Os pesos são **variáveis contínuas** (medidas em gramas com alta precisão), resultantes de um processo físico que envolve a soma de muitas fontes de variação independentes: vibração da máquina, densidade do produto, temperatura ambiente, etc.

### 2.2 Justificativa para a distribuição Normal

Pelo **Teorema Central do Limite** e pela natureza do processo industrial:

- O peso de cada embalagem é resultado da composição de múltiplos fatores independentes de pequena magnitude — a distribuição tende à normalidade.
- Processos industriais bem controlados tipicamente exibem variabilidade simétrica em torno do valor nominal.
- A hipótese de normalidade pode ser verificada empiricamente com testes (Shapiro–Wilk, gráfico Q-Q) em amostras maiores.

Formalmente adotamos: $X_i \sim \mathcal{N}(\mu, \sigma^2)$ com $\sigma^2 = 25$.

### 2.3 Modelos de referência

<div style="overflow-x:auto; margin: 1em 0;">
<table style="border-collapse: collapse; margin: 0 auto; min-width: 500px;">
  <thead style="background: #e3f2fd;">
    <tr>
      <th style="border: 1px solid #bbb; padding: 8px;">Tipo de dado</th>
      <th style="border: 1px solid #bbb; padding: 8px;">Distribuição indicada</th>
      <th style="border: 1px solid #bbb; padding: 8px;">Parâmetro estimado</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border: 1px solid #bbb; padding: 8px;">Binário (sucesso/falha)</td>
      <td style="border: 1px solid #bbb; padding: 8px;">Bernoulli / Binomial</td>
      <td style="border: 1px solid #bbb; padding: 8px;">Proporção $p$</td>
    </tr>
    <tr>
      <td style="border: 1px solid #bbb; padding: 8px;">Contagens (eventos raros)</td>
      <td style="border: 1px solid #bbb; padding: 8px;">Poisson</td>
      <td style="border: 1px solid #bbb; padding: 8px;">Taxa $\lambda$</td>
    </tr>
    <tr>
      <td style="border: 1px solid #bbb; padding: 8px;">Medidas contínuas simétricas</td>
      <td style="border: 1px solid #bbb; padding: 8px;">Normal</td>
      <td style="border: 1px solid #bbb; padding: 8px;">Média $\mu$</td>
    </tr>
    <tr>
      <td style="border: 1px solid #bbb; padding: 8px;">Tempo até evento (falha, chegada)</td>
      <td style="border: 1px solid #bbb; padding: 8px;">Exponencial / Weibull</td>
      <td style="border: 1px solid #bbb; padding: 8px;">Taxa $\lambda$</td>
    </tr>
  </tbody>
</table>
</div>

> **Escolha adotada:** $X_1, X_2, \ldots, X_n \overset{\text{iid}}{\sim} \mathcal{N}(\mu, \sigma^2)$, com $\sigma^2 = 25$ conhecido.

---

## 3. Construção da Função de Verossimilhança

### 3.1 Definição

A **função de verossimilhança** $L(\mu \mid \mathbf{x})$ mede o quão plausível é o valor do parâmetro $\mu$, dado que os dados observados foram $\mathbf{x} = (x_1, \ldots, x_n)$:

$$
L(\mu \mid \mathbf{x}) = \prod_{i=1}^{n} f(x_i;\, \mu)
$$

Importante: a verossimilhança é uma função de $\mu$, com os dados $\mathbf{x}$ fixados — o oposto da função de densidade, que é função dos dados.

### 3.2 Construção explícita para a Normal

A densidade de cada observação $X_i \sim \mathcal{N}(\mu, \sigma^2)$ é:

$$
f(x_i;\, \mu) = \frac{1}{\sigma\sqrt{2\pi}} \exp\!\left(-\frac{(x_i - \mu)^2}{2\sigma^2}\right)
$$

Como as observações são independentes, a verossimilhança conjunta é o **produto** das densidades individuais:

$$
L(\mu \mid \mathbf{x})
= \prod_{i=1}^{n} f(x_i;\,\mu)
= f(x_1;\mu) \cdot f(x_2;\mu) \cdots f(x_n;\mu)
$$

**Passo 1 — Escrever o produto explicitamente:**

$$
L(\mu \mid \mathbf{x})
= \prod_{i=1}^{n} \frac{1}{\sigma\sqrt{2\pi}} \exp\!\left(-\frac{(x_i - \mu)^2}{2\sigma^2}\right)
$$

**Passo 2 — Separar a constante do exponencial** (cada fator tem a mesma constante $\tfrac{1}{\sigma\sqrt{2\pi}}$, que aparece $n$ vezes):

$$
= \underbrace{\frac{1}{\sigma\sqrt{2\pi}} \cdot \frac{1}{\sigma\sqrt{2\pi}} \cdots \frac{1}{\sigma\sqrt{2\pi}}}_{n \text{ vezes}}
\cdot
\exp\!\left(-\frac{(x_1-\mu)^2}{2\sigma^2}\right) \cdot \exp\!\left(-\frac{(x_2-\mu)^2}{2\sigma^2}\right) \cdots \exp\!\left(-\frac{(x_n-\mu)^2}{2\sigma^2}\right)
$$

**Passo 3 — Compactar usando notação de produto** (usando $a^m \cdot a^m \cdots = a^{mn}$ e $e^a \cdot e^b = e^{a+b}$):

$$
= \left(\frac{1}{\sigma\sqrt{2\pi}}\right)^{\!n} \exp\!\left(-\frac{1}{2\sigma^2}\sum_{i=1}^{n}(x_i - \mu)^2\right)
$$

> **Por que combinar os exponenciais em uma soma?** A regra $e^a \cdot e^b = e^{a+b}$ transforma um produto de $n$ exponenciais em um único exponencial com o expoente igual à soma. Isso é fundamental: transforma um produto intratável em uma soma, que é algebricamente manipulável.

### 3.3 Log-verossimilhança

Para fins de otimização (maximização), trabalha-se com a **log-verossimilhança** $\ell(\mu)$, que tem o mesmo ponto de máximo que $L(\mu)$, mas é algebricamente mais tratável.

> **Por que aplicar logaritmo?** $\ln$ é uma função estritamente crescente, portanto não altera o ponto de máximo: $\arg\max L(\mu) = \arg\max \ln L(\mu)$. A vantagem é transformar o **produto** em **soma** (via $\ln(a \cdot b) = \ln a + \ln b$) e eliminar a exponencial (via $\ln(e^x) = x$).

**Passo 1 — Aplicar $\ln$ ao produto:**

$$
\ell(\mu \mid \mathbf{x})
= \ln\!\left[\left(\frac{1}{\sigma\sqrt{2\pi}}\right)^{\!n}\!\exp\!\left(-\frac{1}{2\sigma^2}\sum_{i=1}^n(x_i-\mu)^2\right)\right]
$$

**Passo 2 — Separar os fatores** usando $\ln(A \cdot B) = \ln A + \ln B$:

$$
= \ln\!\left(\frac{1}{\sigma\sqrt{2\pi}}\right)^{\!n} + \ln\!\left[\exp\!\left(-\frac{1}{2\sigma^2}\sum_{i=1}^n(x_i-\mu)^2\right)\right]
$$

**Passo 3 — Simplificar cada parcela** (usando $\ln(a^n) = n\ln a$ e $\ln(e^x) = x$):

$$
= n\ln\!\left(\frac{1}{\sigma\sqrt{2\pi}}\right) - \frac{1}{2\sigma^2}\sum_{i=1}^n(x_i-\mu)^2
$$

$$
= -n\ln(\sigma\sqrt{2\pi}) - \frac{1}{2\sigma^2}\sum_{i=1}^n(x_i-\mu)^2
$$

> O primeiro termo, $-n\ln(\sigma\sqrt{2\pi})$, é uma **constante** em relação a $\mu$ — não influencia a maximização e será descartado na derivação.

**Passo 4 — Expandir $(x_i - \mu)^2$** usando a identidade do quadrado do binômio $(a - b)^2 = a^2 - 2ab + b^2$, com $a = x_i$ e $b = \mu$:

$$
(x_i - \mu)^2 = x_i^2 - 2\mu x_i + \mu^2
$$

**Passo 5 — Distribuir o somatório** (a soma de parcelas é a parcela das somas):

$$
\sum_{i=1}^n (x_i - \mu)^2
= \sum_{i=1}^n x_i^2 \;-\; 2\mu\sum_{i=1}^n x_i \;+\; \sum_{i=1}^n \mu^2
$$

> O terceiro termo: $\displaystyle\sum_{i=1}^n \mu^2 = n\mu^2$, pois $\mu$ é uma constante somada $n$ vezes.

**Passo 6 — Resultado final da log-verossimilhança expandida:**

$$
\ell(\mu \mid \mathbf{x}) = -n\ln(\sigma\sqrt{2\pi}) - \frac{1}{2\sigma^2}\left[\sum_{i=1}^{n}x_i^2 - 2\mu\sum_{i=1}^{n}x_i + n\mu^2\right]
$$

> **Observação crítica:** Após a expansão, os dados $x_1, \ldots, x_n$ entram na log-verossimilhança em **duas formas apenas**: $\sum x_i^2$ e $\sum x_i$. O termo $\sum x_i^2$ não depende de $\mu$ (é constante na otimização). Logo, toda a dependência em $\mu$ passa **exclusivamente** por $\sum x_i$ — o que antecipa a suficiência da média amostral, demonstrada na seção seguinte.

---

## 4. Estatística Suficiente

### 4.1 Definição

Uma estatística $T(\mathbf{X})$ é **suficiente** para $\mu$ se a distribuição condicional de $\mathbf{X}$ dado $T(\mathbf{X}) = t$ não depende de $\mu$. Em outras palavras: dado o valor de $T(\mathbf{X})$, os dados individuais não fornecem informação adicional sobre o parâmetro.

### 4.2 Teorema da Fatorização de Neyman–Fisher

**Teorema:** $T(\mathbf{X})$ é suficiente para $\mu$ se e somente se a densidade conjunta admite a fatorização:

$$
f(\mathbf{x};\, \mu) = g\!\left(T(\mathbf{x}),\, \mu\right) \cdot h(\mathbf{x})
$$

onde $g$ depende de $\mathbf{x}$ apenas através de $T(\mathbf{x})$, e $h$ não depende de $\mu$.

### 4.3 Aplicação à distribuição Normal

O objetivo é reescrever $L(\mu \mid \mathbf{x})$ na forma $h(\mathbf{x}) \cdot g(T(\mathbf{x}), \mu)$, separando o que depende apenas dos dados do que depende também de $\mu$.

**Passo 1 — Partir da verossimilhança compacta** (obtida na Seção 3.2):

$$
L(\mu \mid \mathbf{x})
= \left(\frac{1}{\sigma\sqrt{2\pi}}\right)^{\!n}
\exp\!\left(-\frac{1}{2\sigma^2}\sum_{i=1}^n(x_i-\mu)^2\right)
$$

**Passo 2 — Expandir o expoente** usando $(x_i - \mu)^2 = x_i^2 - 2\mu x_i + \mu^2$ (ver Seção 3.3, Passo 4–5):

$$
-\frac{1}{2\sigma^2}\sum_{i=1}^n(x_i-\mu)^2
= -\frac{1}{2\sigma^2}\left[\sum_{i=1}^n x_i^2 - 2\mu\sum_{i=1}^n x_i + n\mu^2\right]
$$

**Passo 3 — Distribuir o fator $-\tfrac{1}{2\sigma^2}$ pelas três parcelas** (regra da distributividade $\tfrac{a}{c}(x+y+z) = \tfrac{ax}{c} + \tfrac{ay}{c} + \tfrac{az}{c}$):

$$
= -\frac{\sum_{i=1}^n x_i^2}{2\sigma^2}
  + \frac{\mu\sum_{i=1}^n x_i}{\sigma^2}
  - \frac{n\mu^2}{2\sigma^2}
$$

> Observe que a segunda parcela tem sinal positivo: $-\tfrac{1}{2\sigma^2} \cdot (-2\mu\sum x_i) = +\tfrac{\mu\sum x_i}{\sigma^2}$.

**Passo 4 — Reagrupar as parcelas** separando o que depende só de $\mathbf{x}$ do que envolve $\mu$:

$$
= \underbrace{\vphantom{\frac{n\mu^2}{2\sigma^2}}-\frac{\sum_{i=1}^n x_i^2}{2\sigma^2}}_{\text{só dados}} + \underbrace{\frac{\mu}{\sigma^2}\sum_{i=1}^n x_i - \frac{n\mu^2}{2\sigma^2}}_{\text{dados} + \mu}
$$

**Passo 5 — Usar a propriedade $e^{a+b} = e^a \cdot e^b$** para separar os dois grupos em dois exponenciais distintos:

$$
L(\mu \mid \mathbf{x})
= \underbrace{\left(\frac{1}{\sigma\sqrt{2\pi}}\right)^n \exp\!\left(-\frac{\sum x_i^2}{2\sigma^2}\right)}_{h(\mathbf{x}) \;:\; \text{não depende de }\mu}
\cdot
\underbrace{\exp\!\left(\frac{\mu}{\sigma^2}\sum_{i=1}^n x_i - \frac{n\mu^2}{2\sigma^2}\right)}_{g(T(\mathbf{x}),\,\mu) \;:\; \text{depende de }\mathbf{x}\text{ só via }T=\sum x_i}
$$

A fatorização está estabelecida com $T(\mathbf{X}) = \displaystyle\sum_{i=1}^n X_i$.

> **Por que $g$ depende de $\mathbf{x}$ apenas através de $\sum x_i$?** O expoente de $g$ contém $\sum x_i$ como bloco monolítico — dado o valor de $\sum x_i$, não importa quais foram os $x_i$ individuais. Isso é precisamente o significado de suficiência: $T = \sum X_i$ captura toda a informação que $\mathbf{x}$ carrega sobre $\mu$.

Como $\bar{X} = T(\mathbf{X})/n$ é uma transformação bijetora de $T(\mathbf{X})$, a **média amostral $\bar{X}$** também é suficiente para $\mu$.

### 4.4 Interpretação prática

> A suficiência garante que, após calcular $\bar{X}$, os dados individuais $x_1, \ldots, x_n$ não acrescentam nenhuma informação sobre $\mu$. A média amostral é uma **compressão sem perda de informação**: em vez de armazenar e transmitir 10 números, basta um.

---

## 5. Estimador de Máxima Verossimilhança

### 5.1 Princípio da Máxima Verossimilhança

O **Estimador de Máxima Verossimilhança (EMV)** $\hat{\mu}$ é o valor de $\mu$ que maximiza a verossimilhança observada:

$$
\hat{\mu} = \arg\max_{\mu \in \mathbb{R}} \; \ell(\mu \mid \mathbf{x})
$$

### 5.2 Derivação completa

**Passo 1 — Log-verossimilhança** (forma expandida, da Seção 3.3):

$$
\ell(\mu) = -n\ln(\sigma\sqrt{2\pi}) - \frac{1}{2\sigma^2}\sum_{i=1}^{n}(x_i - \mu)^2
$$

O primeiro termo não depende de $\mu$ — sua derivada é zero. O segundo termo é o que precisa ser derivado.

**Passo 2 — Calcular $\frac{\partial}{\partial\mu}\sum(x_i - \mu)^2$** usando a regra da cadeia para cada parcela:

$$
\frac{\partial}{\partial\mu}(x_i - \mu)^2
\overset{\text{cadeia}}{=}
2(x_i - \mu) \cdot \frac{\partial}{\partial\mu}(x_i - \mu)
= 2(x_i - \mu) \cdot (-1)
= -2(x_i - \mu)
$$

Somando sobre $i$:

$$
\frac{\partial}{\partial\mu}\sum_{i=1}^n (x_i - \mu)^2
= \sum_{i=1}^n -2(x_i - \mu)
= -2\sum_{i=1}^n (x_i - \mu)
$$

**Passo 3 — Derivar a log-verossimilhança completa:**

$$
\frac{\partial \ell}{\partial \mu}
= 0 - \frac{1}{2\sigma^2} \cdot \left[-2\sum_{i=1}^{n}(x_i - \mu)\right]
= \frac{1}{\sigma^2}\sum_{i=1}^{n}(x_i - \mu)
$$

> O fator $-\tfrac{1}{2\sigma^2}$ multiplicado por $-2$ resulta em $+\tfrac{1}{\sigma^2}$ — os dois sinais negativos se cancelam.

**Passo 4 — Condição de primeira ordem** (equação de score — igualada a zero):

$$
\frac{\partial \ell}{\partial \mu} = 0
\quad\Longrightarrow\quad
\frac{1}{\sigma^2}\sum_{i=1}^{n}(x_i - \mu) = 0
$$

Como $\sigma^2 > 0$, podemos multiplicar ambos os lados por $\sigma^2$ sem alterar a igualdade:

$$
\sum_{i=1}^{n}(x_i - \mu) = 0
$$

**Passo 5 — Distribuir o somatório** (usando $\sum(a - b) = \sum a - \sum b$):

$$
\sum_{i=1}^{n} x_i - \sum_{i=1}^{n} \mu = 0
\quad\Longrightarrow\quad
\sum_{i=1}^{n} x_i - n\mu = 0
$$

> $\displaystyle\sum_{i=1}^n \mu = n\mu$ porque $\mu$ é constante, somada $n$ vezes.

**Passo 6 — Isolar $\hat{\mu}$** (dividir ambos os lados por $n$):

$$
n\mu = \sum_{i=1}^{n} x_i
\quad\Longrightarrow\quad
\hat{\mu} = \frac{1}{n}\sum_{i=1}^{n} x_i = \bar{x}
$$

**Passo 7 — Verificação de máximo via segunda derivada** (condição suficiente de máximo):

$$
\frac{\partial^2 \ell}{\partial \mu^2}
= \frac{\partial}{\partial\mu}\left[\frac{1}{\sigma^2}\sum_{i=1}^n(x_i - \mu)\right]
= \frac{1}{\sigma^2}\sum_{i=1}^n \frac{\partial}{\partial\mu}(x_i - \mu)
= \frac{1}{\sigma^2}\sum_{i=1}^n (-1)
= -\frac{n}{\sigma^2}
$$

$$
-\frac{n}{\sigma^2} < 0 \quad \forall\, n \geq 1,\; \sigma > 0
$$

> A segunda derivada é **independente de $\mu$** e sempre negativa — a log-verossimilhança é côncava em todo $\mathbb{R}$, portanto $\hat{\mu} = \bar{x}$ é um **máximo global único** (e não apenas local).

### 5.3 Estimador final

$$
\boxed{\hat{\mu}_{\,\text{EMV}} = \bar{X} = \frac{1}{n}\sum_{i=1}^{n} X_i}
$$

---

## 6. Propriedades dos Estimadores

### 6.1 Não-viesamento

Um estimador $\hat{\theta}$ é **não-viesado** (ou não tendencioso) para $\theta$ se:

$$
\mathbb{E}[\hat{\theta}] = \theta
\quad\Longleftrightarrow\quad
\text{Viés}(\hat{\theta}) = \mathbb{E}[\hat{\theta}] - \theta = 0
$$

**Prova para $\bar{X}$** (passo a passo com justificativa de cada propriedade):

$$
\mathbb{E}[\bar{X}]
= \mathbb{E}\!\left[\frac{1}{n}\sum_{i=1}^n X_i\right]
$$

**Passo 1 — Linearidade de $\mathbb{E}$:** a constante multiplicativa sai da esperança ($\mathbb{E}[c \cdot Z] = c\cdot\mathbb{E}[Z]$):

$$
= \frac{1}{n}\,\mathbb{E}\!\left[\sum_{i=1}^n X_i\right]
$$

**Passo 2 — Linearidade de $\mathbb{E}$ para somas** ($\mathbb{E}[Z_1 + \cdots + Z_n] = \mathbb{E}[Z_1] + \cdots + \mathbb{E}[Z_n]$, sem exigir independência):

$$
= \frac{1}{n}\sum_{i=1}^n \mathbb{E}[X_i]
$$

**Passo 3 — Substituir $\mathbb{E}[X_i] = \mu$** (por hipótese, cada $X_i \sim \mathcal{N}(\mu, \sigma^2)$):

$$
= \frac{1}{n}\sum_{i=1}^n \mu
$$

**Passo 4 — Calcular a soma de $n$ termos iguais a $\mu$:**

$$
= \frac{1}{n} \cdot n\mu = \mu \quad \checkmark
$$

> **Interpretação:** Se o processo amostral fosse repetido infinitas vezes e $\bar{x}$ calculado em cada réplica, a média de todas as estimativas convergiria exatamente para o parâmetro verdadeiro $\mu$.

### 6.2 Variância do estimador

**Passo 1 — Escrever a definição:**

$$
\text{Var}(\bar{X})
= \text{Var}\!\left(\frac{1}{n}\sum_{i=1}^n X_i\right)
$$

**Passo 2 — Extrair a constante** usando $\text{Var}(c\cdot Z) = c^2 \,\text{Var}(Z)$ com $c = \tfrac{1}{n}$:

$$
= \frac{1}{n^2}\,\text{Var}\!\left(\sum_{i=1}^n X_i\right)
$$

> Atenção: a constante sai **ao quadrado** na variância, diferente da esperança onde sai linearmente.

**Passo 3 — Distribuir a variância sobre a soma** usando independência das observações. Para variáveis **independentes**, $\text{Var}(Z_1 + \cdots + Z_n) = \text{Var}(Z_1) + \cdots + \text{Var}(Z_n)$ (se houvesse dependência, apareceriam termos de covariância $2\sum_{i<j}\text{Cov}(X_i, X_j)$, que aqui são zero por independência):

$$
= \frac{1}{n^2}\sum_{i=1}^n \text{Var}(X_i)
$$

**Passo 4 — Substituir $\text{Var}(X_i) = \sigma^2$** (por hipótese, cada $X_i \sim \mathcal{N}(\mu, \sigma^2)$):

$$
= \frac{1}{n^2}\sum_{i=1}^n \sigma^2
= \frac{1}{n^2} \cdot n\sigma^2
= \frac{\sigma^2}{n}
$$

O **erro padrão** do estimador (medida de precisão) é:

$$
\text{SE}(\bar{X}) = \sqrt{\text{Var}(\bar{X})} = \frac{\sigma}{\sqrt{n}}
$$

> **Interpretação:** Quadruplicar o tamanho da amostra reduz o erro padrão à metade. A precisão cresce com $\sqrt{n}$, não com $n$ — lei dos rendimentos decrescentes da amostragem.

### 6.3 Eficiência e Limite de Cramér–Rao

#### Informação de Fisher

A **informação de Fisher** quantifica a curvatura esperada da log-verossimilhança — quanto mais "pontiaguda" a curva, mais informativa é a amostra sobre $\mu$:

$$
\mathcal{I}(\mu) = \mathbb{E}\!\left[-\frac{\partial^2}{\partial \mu^2}\ln f(X;\,\mu)\right]
$$

Para $X \sim \mathcal{N}(\mu, \sigma^2)$, o cálculo segue:

**Passo 1 — Log-densidade de uma observação:**

$$
\ln f(x;\,\mu)
= -\ln(\sigma\sqrt{2\pi}) - \frac{(x-\mu)^2}{2\sigma^2}
$$

**Passo 2 — Primeira derivada** (a constante $-\ln(\sigma\sqrt{2\pi})$ desaparece; aplica-se a regra da cadeia a $(x-\mu)^2$):

$$
\frac{\partial}{\partial\mu}\ln f(x;\,\mu)
= -\frac{1}{2\sigma^2} \cdot 2(x-\mu)\cdot(-1)
= \frac{x - \mu}{\sigma^2}
$$

> Esta expressão — a **função score** — mede o quanto a log-densidade varia ao mudar $\mu$. Seu valor esperado é zero: $\mathbb{E}[\text{score}] = \mathbb{E}[(X-\mu)/\sigma^2] = 0$.

**Passo 3 — Segunda derivada** (derivar $\tfrac{x-\mu}{\sigma^2}$ em relação a $\mu$; $x$ é constante):

$$
\frac{\partial^2}{\partial\mu^2}\ln f(x;\,\mu)
= \frac{\partial}{\partial\mu}\!\left(\frac{x-\mu}{\sigma^2}\right)
= \frac{-1}{\sigma^2}
$$

**Passo 4 — Tomar o valor esperado com sinal negativo:**

$$
\mathcal{I}(\mu)
= \mathbb{E}\!\left[-\frac{\partial^2}{\partial\mu^2}\ln f(X;\,\mu)\right]
= \mathbb{E}\!\left[-\left(-\frac{1}{\sigma^2}\right)\right]
= \mathbb{E}\!\left[\frac{1}{\sigma^2}\right]
= \frac{1}{\sigma^2}
$$

> A segunda derivada é **constante** (não depende de $x$ nem de $\mu$), então o valor esperado é a própria constante.

Para $n$ observações i.i.d., a informação de Fisher total é aditiva: $\;\mathcal{I}_n(\mu) = n \cdot \mathcal{I}(\mu) = \dfrac{n}{\sigma^2}$.

#### Limite de Cramér–Rao (LCR)

Para qualquer estimador não-viesado $\hat{\mu}$ de $\mu$:

$$
\text{Var}(\hat{\mu}) \geq \frac{1}{\mathcal{I}_n(\mu)} = \frac{\sigma^2}{n}
$$

Nenhum estimador não-viesado pode ter variância menor que $\sigma^2/n$ — este é o **menor erro possível**.

#### Verificação da eficiência de $\bar{X}$

$$
\text{Var}(\bar{X}) = \frac{\sigma^2}{n} = \frac{1}{\mathcal{I}_n(\mu)}
\quad\Rightarrow\quad
\text{Eficiência relativa} = \frac{\text{LCR}}{\text{Var}(\hat{\mu})} = 1 = 100\%
$$

> **Conclusão:** $\bar{X}$ é **eficiente** — atinge o limite teórico mínimo de variância entre todos os estimadores não-viesados de $\mu$.

### 6.4 Consistência

$\bar{X}$ é **consistente** para $\mu$. Pela Lei dos Grandes Números (LGN):

$$
\bar{X} \xrightarrow{\;P\;} \mu \quad \text{quando } n \to \infty
$$

Formalmente: $\forall\, \varepsilon > 0$,

$$
\lim_{n \to \infty} P\!\left(|\bar{X} - \mu| > \varepsilon\right) = 0
$$

### 6.5 Suficiência (confirmação)

Conforme demonstrado na Seção 4, $\bar{X}$ é suficiente para $\mu$ pela fatorização de Neyman–Fisher: toda a informação amostral sobre $\mu$ está contida em $\bar{X}$.

### 6.6 Completude

A família $\{\mathcal{N}(\mu, \sigma^2) : \mu \in \mathbb{R}\}$ com $\sigma^2$ conhecido pertence à classe das **famílias exponenciais completas**. Nesse contexto, a estatística suficiente $T(\mathbf{X}) = \sum X_i$ é também **completa**:

$$
\mathbb{E}_\mu\!\left[g(T(\mathbf{X}))\right] = 0 \;\;\forall\, \mu
\quad\Longrightarrow\quad
g\!\left(T(\mathbf{X})\right) = 0 \;\;\text{q.c.}
$$

A completude garante que **não existe nenhuma função da estatística suficiente que seja não-informativa** sobre $\mu$ — ela utiliza toda a estrutura paramétrica disponível.

### 6.7 UMVUE — Teorema de Lehmann–Scheffé

**Teorema (Lehmann–Scheffé):** Se $T(\mathbf{X})$ é uma estatística **completa e suficiente** para $\theta$, e $\varphi(T)$ é uma função não-viesada de $T$ para $\theta$, então $\varphi(T)$ é o **UMVUE** (*Uniformly Minimum Variance Unbiased Estimator* — Estimador Não-Viesado de Variância Uniformemente Mínima).

**Aplicação:**

| Condição | Verifica? |
|---|:---:|
| $T = \sum X_i$ é suficiente para $\mu$ | ✓ |
| $T = \sum X_i$ é completa para $\mu$ | ✓ |
| $\bar{X} = T/n$ é função de $T$ | ✓ |
| $\mathbb{E}[\bar{X}] = \mu$ (não-viesado) | ✓ |

$$
\boxed{\bar{X} \;\text{é o UMVUE de } \mu \;\text{— o melhor estimador não-viesado possível.}}
$$

---

## 7. Intervalo de Confiança

### 7.1 Formulação geral

Um **intervalo de confiança** de nível $1-\alpha$ para $\mu$ é um intervalo aleatório $[L(\mathbf{X}),\, U(\mathbf{X})]$ tal que:

$$
P\!\left(L(\mathbf{X}) \leq \mu \leq U(\mathbf{X})\right) = 1 - \alpha \quad \forall\, \mu
$$

### 7.2 Construção via quantidade pivô

Como $X_i \sim \mathcal{N}(\mu, \sigma^2)$ com $\sigma^2$ conhecido, a quantidade:

$$
Z = \frac{\bar{X} - \mu}{\sigma/\sqrt{n}} \sim \mathcal{N}(0,1)
$$

é um **pivô** — tem distribuição conhecida e independente de $\mu$. Portanto:

$$
P\!\left(-z_{\alpha/2} \leq \frac{\bar{X}-\mu}{\sigma/\sqrt{n}} \leq z_{\alpha/2}\right) = 1-\alpha
$$

Isolando $\mu$:

$$
\boxed{IC_{1-\alpha}(\mu) = \bar{x} \pm z_{\alpha/2} \cdot \frac{\sigma}{\sqrt{n}}}
$$

Para $\alpha = 0.05$: $z_{0.025} = 1.96$.

### 7.3 Interpretação correta

<div style="border-left: 4px solid #e53935; padding: 0.5em 1em; background-color: #ffebee; margin: 1em 0;">
<strong>Atenção — erro frequente:</strong> O IC <em>não</em> afirma que "há 95% de probabilidade de μ estar neste intervalo calculado". O parâmetro μ é um valor fixo (desconhecido), não uma variável aleatória.<br><br>
O que se afirma corretamente: <em>o procedimento</em> de construção desses intervalos captura o verdadeiro μ em 95% das amostras possíveis. O intervalo específico calculado ou contém μ ou não — com certeza.
</div>

---

## 8. Teste de Hipótese

### 8.1 Formulação das hipóteses

$$
H_0:\, \mu = \mu_0 = 500 \quad \text{vs} \quad H_1:\, \mu \neq 500
$$

- $H_0$: a máquina está calibrada.
- $H_1$: a máquina está desregulada (peso sistematicamente diferente de 500 g).

O teste é **bilateral**, pois qualquer desvio — tanto excesso quanto falta de produto — é problemático.

### 8.2 Estatística de teste

Sob $H_0$, a distribuição amostral do estimador $\bar{X}$ é completamente especificada:

$$
Z = \frac{\bar{X} - \mu_0}{\sigma/\sqrt{n}} \overset{H_0}{\sim} \mathcal{N}(0,1)
$$

### 8.3 Região crítica

Para nível de significância $\alpha = 0.05$:

$$
\mathcal{RC} = \left\{|z| > z_{\alpha/2}\right\} = \left\{|z| > 1.96\right\}
$$

### 8.4 Cálculo do p-valor

O **p-valor** é a probabilidade de observar uma estatística tão ou mais extrema que a observada, supondo $H_0$ verdadeira:

$$
\text{p-valor} = 2 \cdot P\!\left(Z > |z_{\text{obs}}|\right) = 2 \cdot \left[1 - \Phi(|z_{\text{obs}}|)\right]
$$

### 8.5 Regra de decisão

$$
\text{Rejeitar } H_0 \iff |z_{\text{obs}}| > z_{\alpha/2} \iff \text{p-valor} < \alpha
$$

<div style="overflow-x:auto; margin: 1em 0;">
<table style="border-collapse: collapse; margin: 0 auto; min-width: 450px;">
  <thead style="background: #e3f2fd;">
    <tr>
      <th style="border: 1px solid #bbb; padding: 8px;">Decisão vs. Realidade</th>
      <th style="border: 1px solid #bbb; padding: 8px;">$H_0$ Verdadeira</th>
      <th style="border: 1px solid #bbb; padding: 8px;">$H_0$ Falsa</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border: 1px solid #bbb; padding: 8px;">Rejeitar $H_0$</td>
      <td style="border: 1px solid #bbb; padding: 8px;">Erro Tipo I ($\alpha$)</td>
      <td style="border: 1px solid #bbb; padding: 8px;">Decisão correta ($1-\beta$)</td>
    </tr>
    <tr>
      <td style="border: 1px solid #bbb; padding: 8px;">Não rejeitar $H_0$</td>
      <td style="border: 1px solid #bbb; padding: 8px;">Decisão correta ($1-\alpha$)</td>
      <td style="border: 1px solid #bbb; padding: 8px;">Erro Tipo II ($\beta$)</td>
    </tr>
  </tbody>
</table>
</div>

---

## 9. Tomada de Decisão

<div style="overflow-x:auto; margin: 1em 0;">
<table style="border-collapse: collapse; margin: 0 auto; min-width: 500px;">
  <thead style="background: #e8f5e9;">
    <tr>
      <th style="border: 1px solid #bbb; padding: 8px;">Resultado estatístico</th>
      <th style="border: 1px solid #bbb; padding: 8px;">Interpretação prática</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border: 1px solid #bbb; padding: 8px;">Não rejeitar $H_0$</td>
      <td style="border: 1px solid #bbb; padding: 8px;">Máquina operando conforme especificação; nenhuma ação necessária</td>
    </tr>
    <tr>
      <td style="border: 1px solid #bbb; padding: 8px;">Rejeitar $H_0$ (p $<$ 0.05)</td>
      <td style="border: 1px solid #bbb; padding: 8px;">Evidência de desregulagem; acionar manutenção e recalibração</td>
    </tr>
    <tr>
      <td style="border: 1px solid #bbb; padding: 8px;">IC não contém $\mu_0 = 500$</td>
      <td style="border: 1px solid #bbb; padding: 8px;">Confirma desvio significativo da especificação nominal</td>
    </tr>
  </tbody>
</table>
</div>

### Dimensões de risco

- **Erro Tipo I** ($\alpha = 5\%$): recalibrar a máquina quando ela está funcionando corretamente — custo operacional desnecessário e parada de produção.
- **Erro Tipo II** ($\beta$): não recalibrar quando a máquina está desregulada — risco de produto fora de especificação, insatisfação de clientes e penalidades regulatórias.

> Em controle de qualidade, o engenheiro define $\alpha$ com base no **custo relativo** desses dois tipos de erro. O valor padrão de 5% não é universal; em aplicações críticas (segurança alimentar, saúde), $\alpha = 1\%$ ou menor pode ser mais apropriado.

---

## 10. Exemplo Completo com Dados

### 10.1 Dados observados

Uma amostra de $n = 10$ embalagens produziu os seguintes pesos (em gramas):

<div style="overflow-x:auto; margin: 1em 0;">
<table style="border-collapse: collapse; margin: 0 auto; text-align: center;">
  <thead style="background: #e3f2fd;">
    <tr>
      <th style="border: 1px solid #bbb; padding: 8px;">Embalagem</th>
      <th style="border: 1px solid #bbb; padding: 8px;">$x_i$</th>
      <th style="border: 1px solid #bbb; padding: 8px;">$x_i - \bar{x}$</th>
      <th style="border: 1px solid #bbb; padding: 8px;">$(x_i - \bar{x})^2$</th>
    </tr>
  </thead>
  <tbody>
    <tr><td style="border: 1px solid #bbb; padding: 8px;">1</td><td style="border: 1px solid #bbb; padding: 8px;">504</td><td style="border: 1px solid #bbb; padding: 8px;">−1</td><td style="border: 1px solid #bbb; padding: 8px;">1</td></tr>
    <tr><td style="border: 1px solid #bbb; padding: 8px;">2</td><td style="border: 1px solid #bbb; padding: 8px;">507</td><td style="border: 1px solid #bbb; padding: 8px;">+2</td><td style="border: 1px solid #bbb; padding: 8px;">4</td></tr>
    <tr><td style="border: 1px solid #bbb; padding: 8px;">3</td><td style="border: 1px solid #bbb; padding: 8px;">503</td><td style="border: 1px solid #bbb; padding: 8px;">−2</td><td style="border: 1px solid #bbb; padding: 8px;">4</td></tr>
    <tr><td style="border: 1px solid #bbb; padding: 8px;">4</td><td style="border: 1px solid #bbb; padding: 8px;">506</td><td style="border: 1px solid #bbb; padding: 8px;">+1</td><td style="border: 1px solid #bbb; padding: 8px;">1</td></tr>
    <tr><td style="border: 1px solid #bbb; padding: 8px;">5</td><td style="border: 1px solid #bbb; padding: 8px;">505</td><td style="border: 1px solid #bbb; padding: 8px;">0</td><td style="border: 1px solid #bbb; padding: 8px;">0</td></tr>
    <tr><td style="border: 1px solid #bbb; padding: 8px;">6</td><td style="border: 1px solid #bbb; padding: 8px;">502</td><td style="border: 1px solid #bbb; padding: 8px;">−3</td><td style="border: 1px solid #bbb; padding: 8px;">9</td></tr>
    <tr><td style="border: 1px solid #bbb; padding: 8px;">7</td><td style="border: 1px solid #bbb; padding: 8px;">508</td><td style="border: 1px solid #bbb; padding: 8px;">+3</td><td style="border: 1px solid #bbb; padding: 8px;">9</td></tr>
    <tr><td style="border: 1px solid #bbb; padding: 8px;">8</td><td style="border: 1px solid #bbb; padding: 8px;">506</td><td style="border: 1px solid #bbb; padding: 8px;">+1</td><td style="border: 1px solid #bbb; padding: 8px;">1</td></tr>
    <tr><td style="border: 1px solid #bbb; padding: 8px;">9</td><td style="border: 1px solid #bbb; padding: 8px;">503</td><td style="border: 1px solid #bbb; padding: 8px;">−2</td><td style="border: 1px solid #bbb; padding: 8px;">4</td></tr>
    <tr><td style="border: 1px solid #bbb; padding: 8px;">10</td><td style="border: 1px solid #bbb; padding: 8px;">506</td><td style="border: 1px solid #bbb; padding: 8px;">+1</td><td style="border: 1px solid #bbb; padding: 8px;">1</td></tr>
    <tr style="background:#f5f5f5; font-weight: bold;">
      <td style="border: 1px solid #bbb; padding: 8px;">Soma</td>
      <td style="border: 1px solid #bbb; padding: 8px;">5050</td>
      <td style="border: 1px solid #bbb; padding: 8px;">0</td>
      <td style="border: 1px solid #bbb; padding: 8px;">34</td>
    </tr>
  </tbody>
</table>
</div>

Parâmetros do processo: $\sigma = 5$ g (conhecido), $\mu_0 = 500$ g, $\alpha = 0.05$.

---

### 10.2 Passo 1 — Estatística suficiente e estimativa pontual

A estatística suficiente $T = \sum x_i = 5050$ resume toda a informação amostral. O EMV é:

$$
\hat{\mu} = \bar{x} = \frac{T}{n} = \frac{5050}{10} = 505.0 \text{ g}
$$

A estimativa pontual indica que a máquina está produzindo embalagens com peso médio **5 g acima** da especificação.

---

### 10.3 Passo 2 — Variância amostral e erro padrão

Variância amostral não-viesada ($s^2$):

$$
s^2 = \frac{1}{n-1}\sum_{i=1}^n (x_i - \bar{x})^2 = \frac{34}{9} \approx 3.778 \text{ g}^2
\quad\Rightarrow\quad s \approx 1.944 \text{ g}
$$

Erro padrão do estimador (com $\sigma$ de processo conhecido):

$$
\text{SE}(\bar{X}) = \frac{\sigma}{\sqrt{n}} = \frac{5}{\sqrt{10}} = \frac{5}{3.1623} \approx 1.5811 \text{ g}
$$

---

### 10.4 Passo 3 — Informação de Fisher e Limite de Cramér–Rao

$$
\mathcal{I}_{10}(\mu) = \frac{n}{\sigma^2} = \frac{10}{25} = 0.4
$$

$$
\text{LCR} = \frac{1}{\mathcal{I}_{10}(\mu)} = \frac{\sigma^2}{n} = \frac{25}{10} = 2.5 \text{ g}^2
$$

$$
\text{Var}(\bar{X}) = \frac{\sigma^2}{n} = 2.5 = \text{LCR}
\quad\Rightarrow\quad \text{Eficiência de } \bar{X} = 100\%
$$

---

### 10.5 Passo 4 — Intervalo de confiança de 95%

$$
IC_{95\%}(\mu) = \bar{x} \pm z_{0.025} \cdot \frac{\sigma}{\sqrt{n}}
= 505.0 \pm 1.96 \times 1.5811
= 505.0 \pm 3.099
$$

$$
\boxed{IC_{95\%}(\mu) = [501.9\,;\;508.1] \text{ g}}
$$

O intervalo **não contém** o valor nominal $\mu_0 = 500$ g — sinal preliminar de desregulagem.

---

### 10.6 Passo 5 — Teste de hipótese bilateral

**Estatística de teste observada:**

$$
z_{\text{obs}} = \frac{\bar{x} - \mu_0}{\sigma/\sqrt{n}}
= \frac{505.0 - 500}{5/\sqrt{10}}
= \frac{5.0}{1.5811}
= \sqrt{10}
\approx 3.162
$$

**Comparação com região crítica:**

$$
|z_{\text{obs}}| = 3.162 > z_{0.025} = 1.96 \quad\Longrightarrow\quad \textbf{Rejeitar } H_0
$$

**p-valor:**

$$
\text{p-valor} = 2 \cdot \left[1 - \Phi(3.162)\right]
\approx 2 \times 0.000783
\approx 0.00157
$$

Como $0.00157 < 0.05$ → **Rejeitar $H_0$** (confirmado).

---

### 10.7 Síntese dos resultados

<div style="border-left: 4px solid #4CAF50; padding: 0.5em 1em; background-color: #e8f5e9; margin: 1em 0;">
<strong>Conclusão estatística:</strong> Com base na amostra de 10 embalagens, há evidência estatisticamente significativa (<em>z</em> = 3.162, p = 0.0016, IC₉₅% = [501.9; 508.1] g) de que o peso médio de produção é superior a 500 g.<br><br>
<strong>Decisão prática:</strong> Acionar a equipe de manutenção para recalibração da máquina de envase. O excesso de 5 g por embalagem representa prejuízo econômico de 1% da massa do produto por unidade produzida.
</div>

---

## 11. Implementação em Julia

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
using Distributions

# ── Dados ──────────────────────────────────────────────────────────────────
dados = [504, 507, 503, 506, 505, 502, 508, 506, 503, 506]
n     = length(dados)
σ     = 5.0          # desvio padrão do processo (conhecido)
μ₀    = 500.0        # valor nominal (hipótese nula)
α     = 0.05         # nível de significância

# ── 1. Estatística suficiente e estimativa pontual (EMV) ───────────────────
T  = sum(dados)          # estatística suficiente
x̄  = T / n              # EMV = média amostral
println("Estatística suficiente T = Σxᵢ: $T")
println("Estimativa pontual (EMV): x̄ = $x̄ g")

# ── 2. Variância amostral e erro padrão ────────────────────────────────────
s²  = var(dados; corrected=true)    # variância amostral não-viesada
SE  = σ / sqrt(n)                   # erro padrão com σ conhecido
println("\nVariância amostral (s²): $(round(s²; digits=3)) g²")
println("Erro padrão do estimador (SE): $(round(SE; digits=4)) g")

# ── 3. Log-verossimilhança ─────────────────────────────────────────────────
loglik(μ) = -n * log(σ * sqrt(2π)) - sum((dados .- μ).^2) / (2σ^2)
println("\nLog-verossimilhança em x̄ = $x̄:  $(round(loglik(x̄);  digits=4))")
println("Log-verossimilhança em μ₀ = $μ₀: $(round(loglik(μ₀); digits=4))")

# ── 4. Informação de Fisher e Limite de Cramér–Rao ─────────────────────────
I_n  = n / σ^2
LCR  = 1 / I_n
efic = LCR / (σ^2/n) * 100
println("\nInformação de Fisher (n obs): Iₙ(μ) = $I_n")
println("Limite de Cramér–Rao: LCR = $LCR g²")
println("Eficiência de x̄: $(round(efic; digits=1))%")

# ── 5. Intervalo de confiança (95%) ────────────────────────────────────────
z_crit = quantile(Normal(0, 1), 1 - α/2)
margem = z_crit * SE
IC_inf = x̄ - margem
IC_sup = x̄ + margem
println("\nIntervalo de Confiança $(Int((1-α)*100))%: [$(round(IC_inf; digits=2)), $(round(IC_sup; digits=2))] g")
println("Contém μ₀ = $μ₀? $(IC_inf ≤ μ₀ ≤ IC_sup)")

# ── 6. Teste de hipótese bilateral (z-test) ────────────────────────────────
z_obs   = (x̄ - μ₀) / SE
p_valor = 2 * (1 - cdf(Normal(0, 1), abs(z_obs)))
decisao = abs(z_obs) > z_crit ? "REJEITAR H₀" : "Não rejeitar H₀"
println("\n── Teste de Hipótese ──────────────────────────────────────────────")
println("H₀: μ = $μ₀  vs  H₁: μ ≠ $μ₀")
println("Estatística z observada: $(round(z_obs;   digits=4))")
println("Valor crítico (α = $α):  ±$(round(z_crit; digits=4))")
println("p-valor:                 $(round(p_valor; digits=6))")
println("Decisão:                 $decisao")
</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  Estatística suficiente T = Σxᵢ: 5050<br>
  Estimativa pontual (EMV): x̄ = 505.0 g<br>
  <br>
  Variância amostral (s²): 3.778 g²<br>
  Erro padrão do estimador (SE): 1.5811 g<br>
  <br>
  Log-verossimilhança em x̄ = 505.0:  -25.9638<br>
  Log-verossimilhança em μ₀ = 500.0: -30.9638<br>
  <br>
  Informação de Fisher (n obs): Iₙ(μ) = 0.4<br>
  Limite de Cramér–Rao: LCR = 2.5 g²<br>
  Eficiência de x̄: 100.0%<br>
  <br>
  Intervalo de Confiança 95%: [501.9, 508.1] g<br>
  Contém μ₀ = 500.0? false<br>
  <br>
  ── Teste de Hipótese ──────────────────────────────────────────────<br>
  H₀: μ = 500.0  vs  H₁: μ ≠ 500.0<br>
  Estatística z observada: 3.1623<br>
  Valor crítico (α = 0.05):  ±1.9600<br>
  p-valor:                 0.001565<br>
  Decisão:                 REJEITAR H₀
</div>

### Visualização da curva de log-verossimilhança

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia - Visualização</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Plots, Statistics

dados = [504, 507, 503, 506, 505, 502, 508, 506, 503, 506]
n, σ  = length(dados), 5.0
loglik(μ) = -n * log(σ * sqrt(2π)) - sum((dados .- μ).^2) / (2σ^2)

μ_vals = range(493, 517; length=300)

plot(μ_vals, loglik.(μ_vals),
     xlabel="μ (g)", ylabel="ℓ(μ | x)",
     title="Log-Verossimilhança — Normal(μ, σ²=25)",
     label="ℓ(μ)", lw=2, color=:steelblue)

vline!([mean(dados)],
       label="EMV = $(mean(dados)) g",
       color=:red, lw=2, linestyle=:dash)

vline!([500.0],
       label="μ₀ = 500 g",
       color=:orange, lw=2, linestyle=:dot)
</code></pre>
  </div>
</div>

---

## 12. Conclusão Conceitual

### 12.1 Síntese do fluxo de inferência

$$
\underbrace{\mathcal{N}(\mu, \sigma^2)}_{\text{Distribuição}}
\;\longrightarrow\;
\underbrace{L(\mu\mid\mathbf{x})}_{\text{Verossimilhança}}
\;\longrightarrow\;
\underbrace{T = \sum X_i}_{\substack{\text{Estat.} \\ \text{Suficiente}}}
\;\longrightarrow\;
\underbrace{\bar{X}}_{\substack{\text{EMV} \\ \text{UMVUE}}}
\;\longrightarrow\;
\underbrace{IC \;\text{e}\; z\text{-test}}_{\text{Inferência}}
\;\longrightarrow\;
\underbrace{\text{Recalibrar}}_{\text{Decisão}}
$$

### 12.2 Hierarquia das propriedades de $\bar{X}$

<div style="overflow-x:auto; margin: 1em 0;">
<table style="border-collapse: collapse; margin: 0 auto; min-width: 500px;">
  <thead style="background: #e3f2fd;">
    <tr>
      <th style="border: 1px solid #bbb; padding: 8px;">Propriedade</th>
      <th style="border: 1px solid #bbb; padding: 8px;">Significado</th>
      <th style="border: 1px solid #bbb; padding: 8px; text-align: center;">$\bar{X}$ satisfaz?</th>
    </tr>
  </thead>
  <tbody>
    <tr><td style="border: 1px solid #bbb; padding: 8px;">Não-viesado</td><td style="border: 1px solid #bbb; padding: 8px;">$\mathbb{E}[\bar{X}] = \mu$</td><td style="border: 1px solid #bbb; padding: 8px; text-align: center;">✓</td></tr>
    <tr><td style="border: 1px solid #bbb; padding: 8px;">Consistente</td><td style="border: 1px solid #bbb; padding: 8px;">$\bar{X} \xrightarrow{P} \mu$ quando $n \to \infty$</td><td style="border: 1px solid #bbb; padding: 8px; text-align: center;">✓</td></tr>
    <tr><td style="border: 1px solid #bbb; padding: 8px;">Eficiente</td><td style="border: 1px solid #bbb; padding: 8px;">$\text{Var}(\bar{X}) = \text{LCR}$</td><td style="border: 1px solid #bbb; padding: 8px; text-align: center;">✓</td></tr>
    <tr><td style="border: 1px solid #bbb; padding: 8px;">Suficiente</td><td style="border: 1px solid #bbb; padding: 8px;">Captura toda a informação amostral sobre $\mu$</td><td style="border: 1px solid #bbb; padding: 8px; text-align: center;">✓</td></tr>
    <tr><td style="border: 1px solid #bbb; padding: 8px;">Completo</td><td style="border: 1px solid #bbb; padding: 8px;">Não carrega informação supérflua</td><td style="border: 1px solid #bbb; padding: 8px; text-align: center;">✓</td></tr>
    <tr><td style="border: 1px solid #bbb; padding: 8px;">UMVUE</td><td style="border: 1px solid #bbb; padding: 8px;">Melhor estimador não-viesado (Lehmann–Scheffé)</td><td style="border: 1px solid #bbb; padding: 8px; text-align: center;">✓</td></tr>
  </tbody>
</table>
</div>

### 12.3 Lições fundamentais

**1. Modelagem é o passo mais crítico.** A escolha da distribuição determina a verossimilhança e, por consequência, o estimador ótimo. Um modelo incorreto pode levar a estimadores inconsistentes independentemente do tamanho da amostra.

**2. Suficiência permite compressão de dados.** Em vez de armazenar todos os $n$ valores individuais, basta $\bar{x}$ para toda a inferência sobre $\mu$. Isso é especialmente relevante em sistemas com restrições de memória, transmissão ou privacidade.

**3. O UMVUE é o melhor possível — não apenas na prática.** Nenhum procedimento não-viesado pode ser mais preciso que $\bar{X}$ para estimar $\mu$ na Normal. Essa é uma garantia matemática derivada do Teorema de Lehmann–Scheffé.

**4. Estatística e decisão são inseparáveis.** O p-valor e o IC quantificam a incerteza; a decisão final envolve também custos, riscos e contexto. Um resultado estatisticamente significativo pode não ser praticamente relevante — e vice-versa.

**5. A assimetria de erros guia a escolha de $\alpha$.** O nível padrão de 5% não é uma lei da natureza. Em contextos com alta assimetria de custos (Tipo I vs. Tipo II), o nível deve ser calibrado explicitamente.

---

## Referências Bibliográficas

1. Casella, G., & Berger, R. L. (2002). *Statistical Inference* (2nd ed.). Duxbury Press. — [Página do livro (Cengage)](https://www.cengage.com/c/statistical-inference-2e-casella/9780534243128/)

2. Lehmann, E. L., & Casella, G. (1998). *Theory of Point Estimation* (2nd ed.). Springer. — [Springer Link](https://link.springer.com/book/10.1007/b98854)

3. Morettin, P. A., & Bussab, W. O. (2017). *Estatística Básica* (9ª ed.). Saraiva.

4. Montgomery, D. C., & Runger, G. C. (2018). *Applied Statistics and Probability for Engineers* (7th ed.). Wiley. — [Wiley](https://www.wiley.com/en-us/Applied+Statistics+and+Probability+for+Engineers%2C+7th+Edition-p-9781119400363)

5. Wasserman, L. (2004). *All of Statistics: A Concise Course in Statistical Inference*. Springer. — [Springer Link](https://link.springer.com/book/10.1007/978-0-387-21736-9)

6. Julia Language — Documentação `Statistics.jl`: [https://docs.julialang.org/en/v1/stdlib/Statistics/](https://docs.julialang.org/en/v1/stdlib/Statistics/)

7. Julia Language — Documentação `Distributions.jl`: [https://juliastats.org/Distributions.jl/stable/](https://juliastats.org/Distributions.jl/stable/)

---