---
layout: page
title: Estimadores
lang: pt
ref: estimadores
parent: inferencia-estatistica
permalink: /pt/inferencia-estatistica/estimadores
order: 4
mathjax: true
description: "Estimadores: viés, variância, erro quadrático médio, verossimilhança, suficiência, máxima verossimilhança e Cramér–Rao, com exemplo resolvido e código em Julia."
---

![Ilustração de uma inspetora de qualidade pesando embalagens numa linha de envase]({{ site.baseurl }}/assets/images/estimadores.avif){:style="max-width: 600px; display: block; margin: 0 auto;"}

Um **estimador** é uma regra que usa os dados de uma amostra para calcular um valor aproximado de um parâmetro desconhecido da população. Esta página mostra como julgar se um estimador é bom e como construir um, seguindo o caminho completo:

$$
\text{Dados} \;\longrightarrow\; \text{Distribuição} \;\longrightarrow\; \text{Verossimilhança} \;\longrightarrow\; \text{Suficiência} \;\longrightarrow\; \text{Estimador} \;\longrightarrow\; \text{Inferência} \;\longrightarrow\; \text{Decisão}
$$

O problema-guia é o **controle de qualidade do peso de embalagens**, com números ilustrativos.

## 0. Estimador, Estimativa e o que Torna um Estimador Bom

Um **estimador** $\hat{\theta}$ é uma função da amostra $X_1, \ldots, X_n$ usada para estimar um parâmetro $\theta$. Antes de a amostra ser sorteada, ele é uma variável aleatória; depois, o número calculado com os dados é a **estimativa**. Exemplos:

- a média amostral $\bar{X} = \frac{1}{n}\sum X_i$ estima a média $\mu$ da população;
- a proporção amostral $\hat{p}$ estima a proporção $p$;
- a variância amostral $s^2 = \frac{1}{n-1}\sum (X_i - \bar{X})^2$ estima a variância $\sigma^2$ (o divisor $n - 1$ é o que a torna não viesada; veja [Medidas de Dispersão]({{ '/pt/estatistica-descritiva/dispersao' | relative_url }})).

Como o estimador varia de amostra para amostra, ele é julgado pela distribuição dos seus valores:

- **Viés:** $\text{Viés}(\hat{\theta}) = E[\hat{\theta}] - \theta$. O estimador é **não viesado** quando, em média, acerta o parâmetro.
- **Variância:** $\text{Var}(\hat{\theta})$, quanto as estimativas se espalham de amostra para amostra.
- **Erro quadrático médio (EQM):** a distância média ao quadrado entre a estimativa e o parâmetro, que junta as duas coisas:

$$
\text{EQM}(\hat{\theta}) = E\big[(\hat{\theta} - \theta)^2\big] = \text{Var}(\hat{\theta}) + \text{Viés}(\hat{\theta})^2
$$

Por isso, um estimador com um pequeno viés pode ter EQM menor que um não viesado, se a sua variância for bem menor. As seções seguintes constroem um estimador para a média de uma normal e mostram que ele é o melhor possível entre os não viesados.

---

## 1. Definição do Problema Estatístico

### 1.1 Pergunta de interesse

Uma empresa produz embalagens que, pela especificação, devem conter **500 g** em média. O engenheiro de qualidade quer verificar se a máquina de envase está calibrada.

> **Pergunta estatística:** a média do peso das embalagens produzidas pela máquina é 500 g?

### 1.2 Parâmetro populacional

O parâmetro de interesse é a **média da população** $\mu$:

$$
\mu = \mathbb{E}[X]
$$

onde $X$ é o peso, em gramas, de uma embalagem escolhida ao acaso.

### 1.3 Contexto e hipóteses de trabalho

- Os pesos variam em torno de um valor central.
- O histórico da produção indica **desvio padrão do processo** $\sigma = 5$ g, tratado como conhecido.
- Coletou-se uma **amostra aleatória simples** de $n = 10$ embalagens.
- Objetivo: decidir se a máquina deve ser recalibrada.

---

## 2. Identificação da Distribuição dos Dados

### 2.1 Natureza dos dados

Os pesos são **variáveis contínuas**, resultado de um processo físico com muitas fontes pequenas de variação: vibração da máquina, densidade do produto, temperatura etc.

### 2.2 Por que a distribuição normal

- Quando uma medida é a soma de muitos efeitos pequenos e independentes, o [Teorema do Limite Central]({{ '/pt/probabilidade/teorema-limite-central' | relative_url }}) sugere que ela tenha distribuição aproximadamente normal.
- Processos industriais sob controle costumam ter variação simétrica em torno do valor nominal.
- A normalidade é uma **hipótese do modelo**, que pode ser conferida com um gráfico QQ ou o teste de Shapiro–Wilk (com só 10 valores, esses diagnósticos têm pouco poder).

Adotamos: $X_i \sim \mathcal{N}(\mu, \sigma^2)$, com $\sigma^2 = 25$.

### 2.3 Modelos de referência

<div style="overflow-x:auto; margin: 1em 0;">
<table style="border-collapse: collapse; margin: 0 auto; min-width: 500px;">
  <thead style="background: #e3f2fd;">
    <tr>
      <th style="border: 1px solid #bbb; padding: 8px;">Tipo de dado</th>
      <th style="border: 1px solid #bbb; padding: 8px;">Distribuição usual</th>
      <th style="border: 1px solid #bbb; padding: 8px;">Parâmetro estimado</th>
    </tr>
  </thead>
  <tbody>
    <tr><td style="border: 1px solid #bbb; padding: 8px;">Binário (sucesso/fracasso)</td><td style="border: 1px solid #bbb; padding: 8px;">Bernoulli / binomial</td><td style="border: 1px solid #bbb; padding: 8px;">Proporção $p$</td></tr>
    <tr><td style="border: 1px solid #bbb; padding: 8px;">Contagens de eventos</td><td style="border: 1px solid #bbb; padding: 8px;">Poisson</td><td style="border: 1px solid #bbb; padding: 8px;">Taxa $\lambda$</td></tr>
    <tr><td style="border: 1px solid #bbb; padding: 8px;">Medidas contínuas simétricas</td><td style="border: 1px solid #bbb; padding: 8px;">Normal</td><td style="border: 1px solid #bbb; padding: 8px;">Média $\mu$</td></tr>
    <tr><td style="border: 1px solid #bbb; padding: 8px;">Tempo até um evento</td><td style="border: 1px solid #bbb; padding: 8px;">Exponencial / Weibull</td><td style="border: 1px solid #bbb; padding: 8px;">Taxa $\lambda$</td></tr>
  </tbody>
</table>
</div>

> **Modelo adotado:** $X_1, X_2, \ldots, X_n \overset{\text{iid}}{\sim} \mathcal{N}(\mu, \sigma^2)$, com $\sigma^2 = 25$ conhecido ("iid": independentes e com a mesma distribuição).

---

## 3. Construção da Função de Verossimilhança

### 3.1 Definição

A **função de verossimilhança** $L(\mu \mid \mathbf{x})$ mede quão compatível cada valor de $\mu$ é com os dados observados $\mathbf{x} = (x_1, \ldots, x_n)$:

$$
L(\mu \mid \mathbf{x}) = \prod_{i=1}^{n} f(x_i;\, \mu)
$$

A fórmula é a mesma da densidade conjunta, mas a leitura é outra: os dados ficam fixos e $\mu$ varia. A verossimilhança não é uma probabilidade de $\mu$ (não soma nem integra 1 em $\mu$).

### 3.2 Construção explícita para a normal

A densidade de cada observação $X_i \sim \mathcal{N}(\mu, \sigma^2)$ é:

$$
f(x_i;\, \mu) = \frac{1}{\sigma\sqrt{2\pi}} \exp\!\left(-\frac{(x_i - \mu)^2}{2\sigma^2}\right)
$$

Como as observações são independentes, a verossimilhança é o **produto** das densidades:

$$
L(\mu \mid \mathbf{x})
= \prod_{i=1}^{n} \frac{1}{\sigma\sqrt{2\pi}} \exp\!\left(-\frac{(x_i - \mu)^2}{2\sigma^2}\right)
$$

O fator $\frac{1}{\sigma\sqrt{2\pi}}$ aparece $n$ vezes, e o produto de exponenciais é a exponencial da soma ($e^a \cdot e^b = e^{a+b}$):

$$
L(\mu \mid \mathbf{x}) = \left(\frac{1}{\sigma\sqrt{2\pi}}\right)^{\!n} \exp\!\left(-\frac{1}{2\sigma^2}\sum_{i=1}^{n}(x_i - \mu)^2\right)
$$

### 3.3 Log-verossimilhança

Como $\ln$ é estritamente crescente, $L$ e $\ln L$ têm o máximo no mesmo ponto. O logaritmo transforma o produto em soma ($\ln(ab) = \ln a + \ln b$) e desfaz a exponencial ($\ln e^x = x$):

$$
\ell(\mu \mid \mathbf{x}) = \ln L(\mu \mid \mathbf{x})
= n\ln\!\left(\frac{1}{\sigma\sqrt{2\pi}}\right) - \frac{1}{2\sigma^2}\sum_{i=1}^n(x_i-\mu)^2
= -n\ln(\sigma\sqrt{2\pi}) - \frac{1}{2\sigma^2}\sum_{i=1}^n(x_i-\mu)^2
$$

O primeiro termo não depende de $\mu$. Expandindo o quadrado, $(x_i - \mu)^2 = x_i^2 - 2\mu x_i + \mu^2$, e somando em $i$ (a soma de $n$ parcelas iguais a $\mu^2$ é $n\mu^2$):

$$
\sum_{i=1}^n (x_i - \mu)^2 = \sum_{i=1}^n x_i^2 \;-\; 2\mu\sum_{i=1}^n x_i \;+\; n\mu^2
$$

$$
\ell(\mu \mid \mathbf{x}) = -n\ln(\sigma\sqrt{2\pi}) - \frac{1}{2\sigma^2}\left[\sum_{i=1}^{n}x_i^2 - 2\mu\sum_{i=1}^{n}x_i + n\mu^2\right]
$$

> Os dados entram em $\ell$ só por $\sum x_i^2$ e $\sum x_i$, e $\sum x_i^2$ não interage com $\mu$. Toda a dependência em $\mu$ passa por $\sum x_i$: é isso que a seção 4 formaliza.

---

## 4. Estatística Suficiente

### 4.1 Definição

Uma estatística $T(\mathbf{X})$ é **suficiente** para $\mu$ se a distribuição condicional da amostra, dado $T(\mathbf{X}) = t$, não depende de $\mu$. Em palavras: conhecido o valor de $T$, os dados individuais não trazem mais informação sobre $\mu$ (dentro do modelo adotado).

### 4.2 Teorema da fatorização de Neyman–Fisher

$T(\mathbf{X})$ é suficiente para $\mu$ se, e somente se, a densidade conjunta pode ser escrita como

$$
f(\mathbf{x};\, \mu) = g\!\left(T(\mathbf{x}),\, \mu\right) \cdot h(\mathbf{x})
$$

onde $g$ depende dos dados só por meio de $T(\mathbf{x})$, e $h$ não depende de $\mu$.

### 4.3 Aplicação à normal

Partindo de $L(\mu \mid \mathbf{x})$ da seção 3.2 e da expansão da seção 3.3, o expoente se separa em três parcelas (o sinal da segunda é positivo: $-\frac{1}{2\sigma^2} \cdot (-2\mu\sum x_i) = +\frac{\mu\sum x_i}{\sigma^2}$):

$$
-\frac{1}{2\sigma^2}\sum_{i=1}^n(x_i-\mu)^2
= \underbrace{-\frac{\sum_{i=1}^n x_i^2}{2\sigma^2}}_{\text{só dados}} + \underbrace{\frac{\mu}{\sigma^2}\sum_{i=1}^n x_i - \frac{n\mu^2}{2\sigma^2}}_{\text{dados e } \mu}
$$

Usando $e^{a+b} = e^a \cdot e^b$:

$$
L(\mu \mid \mathbf{x})
= \underbrace{\left(\frac{1}{\sigma\sqrt{2\pi}}\right)^n \exp\!\left(-\frac{\sum x_i^2}{2\sigma^2}\right)}_{h(\mathbf{x})\text{: não depende de }\mu}
\cdot
\underbrace{\exp\!\left(\frac{\mu}{\sigma^2}\sum_{i=1}^n x_i - \frac{n\mu^2}{2\sigma^2}\right)}_{g(T(\mathbf{x}),\,\mu)\text{: depende dos dados só por } T = \sum x_i}
$$

A fatorização vale com $T(\mathbf{X}) = \sum_{i=1}^n X_i$. Como $\bar{X} = T/n$ é uma função invertível de $T$, a **média amostral $\bar{X}$** também é suficiente para $\mu$.

### 4.4 Interpretação prática

Calculada $\bar{x}$, os 10 valores individuais não acrescentam nada à inferência sobre $\mu$ **dentro do modelo normal com $\sigma$ conhecido**. Eles continuam úteis para outra coisa: conferir o próprio modelo (normalidade, valores atípicos, o valor de $\sigma$). A seção 10.3 mostra um caso em que isso importa.

---

## 5. Estimador de Máxima Verossimilhança

### 5.1 Princípio

O **estimador de máxima verossimilhança (EMV)** é o valor de $\mu$ que torna os dados observados mais verossímeis:

$$
\hat{\mu} = \arg\max_{\mu \in \mathbb{R}} \; \ell(\mu \mid \mathbf{x})
$$

### 5.2 Derivação

**Passo 1, derivada.** O primeiro termo de $\ell$ não depende de $\mu$. Pela regra da cadeia, $\frac{\partial}{\partial\mu}(x_i - \mu)^2 = 2(x_i - \mu)\cdot(-1) = -2(x_i - \mu)$. Então:

$$
\frac{\partial \ell}{\partial \mu}
= -\frac{1}{2\sigma^2} \cdot \left[-2\sum_{i=1}^{n}(x_i - \mu)\right]
= \frac{1}{\sigma^2}\sum_{i=1}^{n}(x_i - \mu)
$$

**Passo 2, igualar a zero** (a equação de escore). Como $\sigma^2 > 0$, pode-se multiplicar por $\sigma^2$:

$$
\sum_{i=1}^{n}(x_i - \mu) = 0
\quad\Longrightarrow\quad
\sum_{i=1}^{n} x_i - n\mu = 0
\quad\Longrightarrow\quad
\hat{\mu} = \frac{1}{n}\sum_{i=1}^{n} x_i = \bar{x}
$$

**Passo 3, conferir que é máximo.** A segunda derivada é

$$
\frac{\partial^2 \ell}{\partial \mu^2} = \frac{1}{\sigma^2}\sum_{i=1}^n (-1) = -\frac{n}{\sigma^2} < 0
$$

para todo $\mu$: a log-verossimilhança é côncava em toda a reta, e $\bar{x}$ é o **único máximo global**. (Do mesmo jeito, sem derivadas: $\sum (x_i - \mu)^2 = \sum (x_i - \bar{x})^2 + n(\bar{x} - \mu)^2$, que é mínimo só em $\mu = \bar{x}$.)

### 5.3 Estimador final

$$
\boxed{\hat{\mu}_{\,\text{EMV}} = \bar{X} = \frac{1}{n}\sum_{i=1}^{n} X_i}
$$

---

## 6. Propriedades do Estimador $\bar{X}$

### 6.1 Não viesado

$$
\mathbb{E}[\bar{X}]
= \mathbb{E}\!\left[\frac{1}{n}\sum_{i=1}^n X_i\right]
= \frac{1}{n}\sum_{i=1}^n \mathbb{E}[X_i]
= \frac{1}{n}\cdot n\mu = \mu
$$

O segundo passo usa a linearidade da esperança, que **não** exige independência; o terceiro usa $\mathbb{E}[X_i] = \mu$.

**Interpretação:** se a amostragem fosse repetida muitas vezes, a média das estimativas $\bar{x}$ ficaria perto de $\mu$: o estimador não erra sistematicamente para nenhum lado.

### 6.2 Variância e erro padrão

$$
\text{Var}(\bar{X})
= \frac{1}{n^2}\,\text{Var}\!\left(\sum_{i=1}^n X_i\right)
= \frac{1}{n^2}\sum_{i=1}^n \text{Var}(X_i)
= \frac{1}{n^2}\cdot n\sigma^2
= \frac{\sigma^2}{n}
$$

O primeiro passo usa $\text{Var}(cZ) = c^2\,\text{Var}(Z)$ (a constante sai **ao quadrado**); o segundo usa a **independência** das observações (sem ela, apareceriam covariâncias).

$$
\text{EP}(\bar{X}) = \sqrt{\text{Var}(\bar{X})} = \frac{\sigma}{\sqrt{n}}
$$

Quadruplicar o tamanho da amostra reduz o erro padrão à metade.

### 6.3 Eficiência e limite de Cramér–Rao

**Informação de Fisher.** Mede a curvatura esperada da log-verossimilhança: quanto mais "pontuda", mais a amostra informa sobre $\mu$.

$$
\mathcal{I}(\mu) = \mathbb{E}\!\left[-\frac{\partial^2}{\partial \mu^2}\ln f(X;\,\mu)\right]
$$

Para uma observação $X \sim \mathcal{N}(\mu, \sigma^2)$:

$$
\ln f(x;\,\mu) = -\ln(\sigma\sqrt{2\pi}) - \frac{(x-\mu)^2}{2\sigma^2}
\qquad
\frac{\partial}{\partial\mu}\ln f(x;\,\mu) = \frac{x - \mu}{\sigma^2}
\qquad
\frac{\partial^2}{\partial\mu^2}\ln f(x;\,\mu) = -\frac{1}{\sigma^2}
$$

A segunda derivada é constante, então $\mathcal{I}(\mu) = \frac{1}{\sigma^2}$. Para $n$ observações independentes, a informação se soma: $\mathcal{I}_n(\mu) = \frac{n}{\sigma^2}$.

**Limite de Cramér–Rao.** Sob condições de regularidade (que valem para a normal), todo estimador não viesado $\hat{\mu}$ de $\mu$ satisfaz

$$
\text{Var}(\hat{\mu}) \geq \frac{1}{\mathcal{I}_n(\mu)} = \frac{\sigma^2}{n}
$$

Como $\text{Var}(\bar{X}) = \frac{\sigma^2}{n}$, a média amostral **atinge** o limite: é **eficiente**, e nenhum estimador não viesado de $\mu$ tem variância menor.

### 6.4 Consistência

Pela Lei dos Grandes Números, $\bar{X}$ converge em probabilidade para $\mu$: para todo $\varepsilon > 0$,

$$
\lim_{n \to \infty} P\!\left(|\bar{X} - \mu| > \varepsilon\right) = 0
$$

Com amostras cada vez maiores, a estimativa fica cada vez mais perto do valor verdadeiro.

### 6.5 Completude e o teorema de Lehmann–Scheffé

A família $\\{\mathcal{N}(\mu, \sigma^2) : \mu \in \mathbb{R}\\}$, com $\sigma^2$ conhecido, é uma família exponencial, e nela a estatística suficiente $T = \sum X_i$ é também **completa**: a única função de $T$ com esperança zero para todo $\mu$ é a função nula (quase certamente),

$$
\mathbb{E}_\mu\!\left[g(T)\right] = 0 \;\;\text{para todo}\; \mu
\quad\Longrightarrow\quad
g(T) = 0 \;\;\text{quase certamente}
$$

**Teorema de Lehmann–Scheffé.** Se $T$ é suficiente e completa para $\theta$, e $\varphi(T)$ é um estimador não viesado de $\theta$ com variância finita, então $\varphi(T)$ é o **estimador não viesado de variância uniformemente mínima** (em inglês, UMVUE).

| Condição | Vale? |
|---|:---:|
| $T = \sum X_i$ é suficiente para $\mu$ | ✓ |
| $T = \sum X_i$ é completa | ✓ |
| $\bar{X} = T/n$ é função de $T$ | ✓ |
| $\mathbb{E}[\bar{X}] = \mu$ | ✓ |

$$
\boxed{\bar{X} \;\text{é o UMVUE de } \mu \text{ no modelo normal com } \sigma \text{ conhecido.}}
$$

---

## 7. Intervalo de Confiança

Como $\sigma$ é conhecido, a quantidade

$$
Z = \frac{\bar{X} - \mu}{\sigma/\sqrt{n}} \sim \mathcal{N}(0,1)
$$

tem distribuição que não depende de $\mu$ (uma **quantidade pivô**). Então $P(-z_{\alpha/2} \leq Z \leq z_{\alpha/2}) = 1 - \alpha$, e isolando $\mu$:

$$
\boxed{IC_{1-\alpha}(\mu) = \bar{x} \pm z_{\alpha/2} \cdot \frac{\sigma}{\sqrt{n}}}
$$

Para $\alpha = 0{,}05$: $z_{0{,}025} = 1{,}96$.

<div style="border-left: 4px solid #e53935; padding: 0.5em 1em; background-color: #ffebee; margin: 1em 0;">
<strong>Interpretação correta:</strong> o intervalo <em>não</em> diz que "há 95% de probabilidade de μ estar neste intervalo". O parâmetro μ é fixo; o que varia de amostra para amostra é o intervalo. Os 95% descrevem o <em>procedimento</em>: em 95% das amostras possíveis, o intervalo construído assim contém μ. Mais em <a href="{{ '/pt/inferencia-estatistica/intervalos-confianca' | relative_url }}">Intervalos de Confiança</a>.
</div>

---

## 8. Teste de Hipótese

$$
H_0:\, \mu = 500 \quad \text{contra} \quad H_1:\, \mu \neq 500
$$

- $H_0$: a máquina está calibrada.
- $H_1$: o peso médio é diferente de 500 g.

O teste é **bilateral**, porque tanto excesso quanto falta de produto são problemas. Sob $H_0$:

$$
Z = \frac{\bar{X} - 500}{\sigma/\sqrt{n}} \overset{H_0}{\sim} \mathcal{N}(0,1)
$$

Com $\alpha = 0{,}05$, rejeita-se $H_0$ se $\lvert z_{\text{obs}}\rvert  > 1{,}96$. O p-valor é $2\,[1 - \Phi(\lvert z_{\text{obs}}\rvert )]$, onde $\Phi$ é a função de distribuição acumulada da normal padrão. Mais em [Testes de Hipótese]({{ '/pt/inferencia-estatistica/testes-hipotese' | relative_url }}).

**Os riscos de cada erro, neste problema:**

- **Erro tipo I** ($\alpha = 5\%$): recalibrar uma máquina que estava certa, com parada de produção desnecessária.
- **Erro tipo II** ($\beta$): não recalibrar uma máquina desregulada, entregando produto fora da especificação.

O nível $\alpha$ deveria ser escolhido pesando esses dois custos; 5% é só uma convenção.

---

## 9. Exemplo Completo com Dados

### 9.1 Dados observados

Uma amostra de $n = 10$ embalagens deu os pesos abaixo, em gramas (números ilustrativos). A média, calculada no passo 1, é 505 g.

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
    <tr style="background:#f5f5f5; font-weight: bold;"><td style="border: 1px solid #bbb; padding: 8px;">Soma</td><td style="border: 1px solid #bbb; padding: 8px;">5050</td><td style="border: 1px solid #bbb; padding: 8px;">0</td><td style="border: 1px solid #bbb; padding: 8px;">34</td></tr>
  </tbody>
</table>
</div>

Dados do processo: $\sigma = 5$ g (suposto conhecido), $\mu_0 = 500$ g, $\alpha = 0{,}05$.

### 9.2 Passo 1: estatística suficiente e estimativa

$$
T = \sum x_i = 5050 \qquad \hat{\mu} = \bar{x} = \frac{T}{n} = \frac{5050}{10} = 505 \text{ g}
$$

A estimativa indica embalagens com peso médio **5 g acima** da especificação.

### 9.3 Passo 2: variância amostral e erro padrão

$$
s^2 = \frac{1}{n-1}\sum_{i=1}^n (x_i - \bar{x})^2 = \frac{34}{9} \approx 3{,}778 \text{ g}^2
\qquad s \approx 1{,}944 \text{ g}
$$

$$
\text{EP}(\bar{X}) = \frac{\sigma}{\sqrt{n}} = \frac{5}{\sqrt{10}} = \frac{5}{3{,}1623} \approx 1{,}5811 \text{ g}
$$

### 9.4 Passo 3: informação de Fisher e Cramér–Rao

$$
\mathcal{I}_{10}(\mu) = \frac{n}{\sigma^2} = \frac{10}{25} = 0{,}4
\qquad
\text{LCR} = \frac{1}{0{,}4} = 2{,}5 \text{ g}^2 = \frac{\sigma^2}{n} = \text{Var}(\bar{X})
$$

A média amostral atinge o limite: eficiência de 100%.

### 9.5 Passo 4: intervalo de 95%

$$
IC_{95\%}(\mu) = 505 \pm 1{,}96 \times 1{,}5811 = 505 \pm 3{,}099
\qquad
\boxed{IC_{95\%}(\mu) = [501{,}90;\ 508{,}10] \text{ g}}
$$

O intervalo **não contém** 500 g.

### 9.6 Passo 5: teste bilateral

$$
z_{\text{obs}} = \frac{505 - 500}{5/\sqrt{10}} = \frac{5}{1{,}5811} = \sqrt{10} \approx 3{,}162
$$

Como $\lvert z_{\text{obs}}\rvert  = 3{,}162 > 1{,}96$, **rejeita-se $H_0$**. O p-valor é $2\,[1 - \Phi(3{,}162)] \approx 2 \times 0{,}000783 = 0{,}00157$.

### 9.7 Síntese

<div style="border-left: 4px solid #4CAF50; padding: 0.5em 1em; background-color: #e8f5e9; margin: 1em 0;">
<strong>Conclusão estatística:</strong> com 10 embalagens, há evidência de que o peso médio é maior que 500 g (<em>z</em> = 3,162; p = 0,0016; IC de 95% = [501,90; 508,10] g).<br><br>
<strong>Decisão prática:</strong> recalibrar a máquina. O excesso estimado, 5 g por embalagem, é 1% de produto a mais dado em cada unidade (5/500 = 0,01).
</div>

---

## 10. Implementação em Julia

### 10.1 Todas as contas

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
decisao = abs(z_obs) &gt; z_crit ? "REJEITAR H₀" : "Não rejeitar H₀"
println("\n── Teste de Hipótese ──────────────────────────────────────────────")
println("H₀: μ = $μ₀  vs  H₁: μ ≠ $μ₀")
println("Estatística z observada: $(round(z_obs;   digits=4))")
println("Valor crítico (α = $α):  ±$(round(z_crit; digits=4))")
println("p-valor:                 $(round(p_valor; digits=6))")
println("Decisão:                 $decisao")</code></pre>
  </div>
</div>

#### Saída esperada:
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>Estatística suficiente T = Σxᵢ: 5050</div>
  <div>Estimativa pontual (EMV): x̄ = 505.0 g</div>
  <div></div>
  <div>Variância amostral (s²): 3.778 g²</div>
  <div>Erro padrão do estimador (SE): 1.5811 g</div>
  <div></div>
  <div>Log-verossimilhança em x̄ = 505.0: &nbsp;-25.9638</div>
  <div>Log-verossimilhança em μ₀ = 500.0: -30.9638</div>
  <div></div>
  <div>Informação de Fisher (n obs): Iₙ(μ) = 0.4</div>
  <div>Limite de Cramér–Rao: LCR = 2.5 g²</div>
  <div>Eficiência de x̄: 100.0%</div>
  <div></div>
  <div>Intervalo de Confiança 95%: [501.9, 508.1] g</div>
  <div>Contém μ₀ = 500.0? false</div>
  <div></div>
  <div>── Teste de Hipótese ──────────────────────────────────────────────</div>
  <div>H₀: μ = 500.0 &nbsp;vs &nbsp;H₁: μ ≠ 500.0</div>
  <div>Estatística z observada: 3.1623</div>
  <div>Valor crítico (α = 0.05): &nbsp;±1.96</div>
  <div>p-valor: &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; 0.001565</div>
  <div>Decisão: &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; REJEITAR H₀</div>
</div>

### 10.2 A curva de log-verossimilhança

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Plots, Statistics

dados = [504, 507, 503, 506, 505, 502, 508, 506, 503, 506]
n, σ = length(dados), 5.0
loglik(μ) = -n * log(σ * sqrt(2π)) - sum((dados .- μ).^2) / (2σ^2)

μs = range(493, 517; length=300)
plot(μs, loglik.(μs); xlabel="μ (g)", ylabel="ℓ(μ | x)", lw=2, color=:steelblue,
     label="log-verossimilhança", title="Log-verossimilhança da normal com σ = 5 g")
vline!([mean(dados)]; label="EMV = 505 g", color=:red, lw=2, linestyle=:dash)
vline!([500.0]; label="μ₀ = 500 g", color=:orange, lw=2, linestyle=:dot)
savefig("log_verossimilhanca.png")</code></pre>
  </div>
</div>

![Curva em forma de parábola invertida, com o máximo em μ = 505 g marcado por uma linha vermelha tracejada e uma linha laranja pontilhada em μ = 500 g, onde a curva está mais baixa]({{ site.baseurl }}/assets/images/log_verossimilhanca.png)
<div class="image-caption">Figura 1: A log-verossimilhança dos 10 pesos tem o máximo em μ = 505 g, o EMV. Em μ = 500 g ela vale cerca de 5 unidades menos (−30,96 contra −25,96).</div>

### 10.3 Um alerta sobre o σ suposto

O modelo supôs $\sigma = 5$ g, mas o desvio padrão dos 10 pesos é só $s \approx 1{,}94$ g. Para dados normais com $\sigma = 5$, um valor tão pequeno seria raro: $(n-1)s^2/\sigma^2 = 9 \cdot 3{,}778/25 = 1{,}36$, e a probabilidade de a qui-quadrado com 9 graus de liberdade ficar abaixo disso é de cerca de 0,0019. Ou seja, os dados sugerem que a variação do processo hoje é **menor** que a do histórico.

Isso não muda a conclusão deste exemplo: o teste t, que usa $s$ no lugar de $\sigma$, dá $t \approx 8{,}13$ com p-valor de cerca de 0,00002, rejeitando $H_0$ com ainda mais força. Mas mostra por que os dados individuais continuam importando (seção 4.4): o $\sigma$ "conhecido" é uma hipótese, e vale a pena conferi-la.

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

dados = [504, 507, 503, 506, 505, 502, 508, 506, 503, 506]
n, σ = length(dados), 5.0
s = std(dados)

# Os dados são compatíveis com σ = 5? Para dados normais, (n − 1)s²/σ² ~ χ²(n − 1).
q = (n - 1) * s^2 / σ^2
println("s = ", round(s, digits=4), " g   (n − 1)s²/σ² = ", round(q, digits=4))
println("P(χ²₉ ≤ ", round(q, digits=2), ") = ", round(cdf(Chisq(n - 1), q), digits=4))

# Teste t, que usa s no lugar de σ
t = (mean(dados) - 500) / (s / sqrt(n))
println("t = ", round(t, digits=4), "   p-valor = ", round(2 * ccdf(TDist(n - 1), abs(t)), sigdigits=3))</code></pre>
  </div>
</div>

#### Saída esperada:
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>s = 1.9437 g &nbsp; (n − 1)s²/σ² = 1.36</div>
  <div>P(χ²₉ ≤ 1.36) = 0.0019</div>
  <div>t = 8.1349 &nbsp; p-valor = 1.94e-5</div>
</div>

---

## 11. Conclusão

$$
\underbrace{\mathcal{N}(\mu, \sigma^2)}_{\text{Distribuição}}
\;\longrightarrow\;
\underbrace{L(\mu\mid\mathbf{x})}_{\text{Verossimilhança}}
\;\longrightarrow\;
\underbrace{T = \sum X_i}_{\text{Suficiente}}
\;\longrightarrow\;
\underbrace{\bar{X}}_{\text{EMV e UMVUE}}
\;\longrightarrow\;
\underbrace{IC \;\text{e teste}}_{\text{Inferência}}
\;\longrightarrow\;
\underbrace{\text{Recalibrar}}_{\text{Decisão}}
$$

<div style="overflow-x:auto; margin: 1em 0;">
<table style="border-collapse: collapse; margin: 0 auto; min-width: 500px;">
  <thead style="background: #e3f2fd;">
    <tr>
      <th style="border: 1px solid #bbb; padding: 8px;">Propriedade de $\bar{X}$</th>
      <th style="border: 1px solid #bbb; padding: 8px;">Significado</th>
      <th style="border: 1px solid #bbb; padding: 8px;">Onde</th>
    </tr>
  </thead>
  <tbody>
    <tr><td style="border: 1px solid #bbb; padding: 8px;">Não viesado</td><td style="border: 1px solid #bbb; padding: 8px;">$\mathbb{E}[\bar{X}] = \mu$</td><td style="border: 1px solid #bbb; padding: 8px;">6.1</td></tr>
    <tr><td style="border: 1px solid #bbb; padding: 8px;">Consistente</td><td style="border: 1px solid #bbb; padding: 8px;">$\bar{X}$ converge para $\mu$ quando $n$ cresce</td><td style="border: 1px solid #bbb; padding: 8px;">6.4</td></tr>
    <tr><td style="border: 1px solid #bbb; padding: 8px;">Eficiente</td><td style="border: 1px solid #bbb; padding: 8px;">$\text{Var}(\bar{X})$ igual ao limite de Cramér–Rao</td><td style="border: 1px solid #bbb; padding: 8px;">6.3</td></tr>
    <tr><td style="border: 1px solid #bbb; padding: 8px;">Suficiente</td><td style="border: 1px solid #bbb; padding: 8px;">Resume toda a informação dos dados sobre $\mu$ (no modelo)</td><td style="border: 1px solid #bbb; padding: 8px;">4</td></tr>
    <tr><td style="border: 1px solid #bbb; padding: 8px;">UMVUE</td><td style="border: 1px solid #bbb; padding: 8px;">Menor variância entre os não viesados</td><td style="border: 1px solid #bbb; padding: 8px;">6.5</td></tr>
  </tbody>
</table>
</div>

**Lições:**

1. **O modelo vem primeiro.** A distribuição escolhida define a verossimilhança e o estimador ótimo. Com o modelo errado, as garantias desta página deixam de valer.
2. **"Ótimo" é relativo ao modelo.** $\bar{X}$ é o melhor estimador não viesado de $\mu$ **na normal**. Com dados de cauda pesada, por exemplo, a mediana pode ser um estimador melhor da posição central.
3. **Não viesado não é tudo.** O EQM junta viés e variância; às vezes um pouco de viés compensa uma variância bem menor.
4. **Estatística e decisão andam juntas.** O p-valor e o intervalo medem a incerteza; a decisão envolve também custos e contexto.

---

## Referências

1. Bussab, W. O.; Morettin, P. A. (2023). *Estatística Básica*. 10. ed. Saraiva Uni.
2. Casella, G.; Berger, R. L. (2002). *Statistical Inference*. 2nd ed. Duxbury.
3. Lehmann, E. L.; Casella, G. (1998). *Theory of Point Estimation*. 2nd ed. Springer.
4. Wasserman, L. (2004). *All of Statistics: A Concise Course in Statistical Inference*. Springer.
