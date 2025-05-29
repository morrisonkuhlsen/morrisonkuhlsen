---
layout: page
title: Amostragem
lang: pt
ref: amostragem
parent: inferencia-estatistica
permalink: /pt/inferencia-estatistica/amostragem
order: 3
---

Conteúdo sobre técnicas de amostragem.

## Introdução

A amostragem é o processo de selecionar um subconjunto representativo de uma população para realizar inferências estatísticas sobre toda a população. Uma amostra bem escolhida permite estimar parâmetros populacionais com precisão e eficiência, reduzindo custos e tempo em relação ao censo completo.

![Amostragem]({{ site.baseurl }}/assets/images/amostragem.png){:style="max-width: 400px; display: block; margin: 0 auto;"}
<div class="image-caption" style="text-align: center;">Figura: Exemplo visual de amostragem em uma população.</div>

---

## Por que Amostrar?

- Reduz custos e tempo
- Permite análises destrutivas (quando o teste destrói o item)
- Torna viável o estudo de populações grandes
- Facilita o controle de qualidade

---

## Conceitos Fundamentais

- **População** ($N$): Conjunto completo de elementos ou observações de interesse.
  - *Origem*: Do latim "populatio", referente ao conjunto de pessoas ou coisas.
- **Amostra** ($n$): Subconjunto da população, selecionado para análise.
  - *Origem*: Do latim "amostra", porção retirada para representar o todo.
- **Parâmetro** ($\mu$, $\sigma$, $p$): Medida numérica que descreve uma característica da população (ex: média $\mu$, desvio padrão $\sigma$, proporção $p$).
  - *Origem*: Do grego "parámetros", aquilo que serve de referência.
- **Estatística** ($\bar{x}$, $s$, $\hat{p}$): Medida numérica que descreve uma característica da amostra (ex: média amostral $\bar{x}$, desvio padrão amostral $s$, proporção amostral $\hat{p}$).
  - *Origem*: Do latim "statisticum", relativo ao Estado, e do italiano "statistica", ciência dos dados do Estado.

---

## Tipos de Amostragem

### 1. Amostragem Aleatória Simples

Cada elemento da população tem a mesma probabilidade de ser selecionado.

**Exemplo:** Sortear 50 nomes de uma urna contendo todos os funcionários de uma empresa.

### 2. Amostragem Sistemática

Seleciona-se um ponto de partida aleatório e, a partir dele, escolhe-se cada k-ésimo elemento.

**Exemplo:** Em uma linha de produção, inspecionar a cada 10ª peça fabricada.

### 3. Amostragem Estratificada

A população é dividida em grupos (estratos) homogêneos, e amostras são retiradas de cada estrato proporcionalmente.

**Exemplo:** Separar alunos por curso e sortear proporcionalmente de cada curso.

### 4. Amostragem por Conglomerados

A população é dividida em grupos (conglomerados) heterogêneos, sorteando-se alguns grupos inteiros para análise.

**Exemplo:** Sortear algumas turmas de uma escola e entrevistar todos os alunos dessas turmas.

---

## Avisos Importantes

- **Amostragem mal planejada pode introduzir vieses e comprometer a validade dos resultados.**
- **A aleatoriedade é fundamental para garantir a representatividade.**
- **O tamanho da amostra influencia a precisão das estimativas.**

---

## Fórmulas Básicas

### Tamanho da Amostra para Proporção

$$
n = \frac{z_{\alpha/2}^2 \hat{p}(1-\hat{p})}{E^2}
$$

Onde:
- $z_{\alpha/2}$ = valor crítico da normal padrão
- $\hat{p}$ = proporção estimada
- $E$ = erro máximo tolerável

### Tamanho da Amostra para Média

$$
n = \left(\frac{z_{\alpha/2} \sigma}{E}\right)^2
$$

Onde:
- $\sigma$ = desvio padrão populacional

---

## Exemplo Prático

Uma fábrica deseja estimar a proporção de peças defeituosas em sua produção diária. Deseja-se um erro máximo de 3% e um nível de confiança de 95%. Supondo proporção estimada de 0,10, qual o tamanho mínimo da amostra?

### Resolução

$$
z = 1,96\ (95\%\ de\ confiança)\qquad \hat{p} = 0,10\qquad E = 0,03
$$

$$
n = \frac{1,96^2 \times 0,10 \times 0,90}{0,03^2} = \frac{3,8416 \times 0,09}{0,0009} = \frac{0,3457}{0,0009} \approx 384,11
$$

Arredondando para cima:

$$
n = 385
$$

**Portanto, a amostra deve ter pelo menos 385 peças.**

### Exemplo em Julia

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

# Parâmetros
z = quantile(Normal(), 1 - 0.05/2)  # 95% de confiança
p̂ = 0.10                            # proporção estimada
erro = 0.03                         # erro máximo tolerável

# Cálculo do tamanho da amostra
n = ceil(Int, (z^2 * p̂ * (1 - p̂)) / erro^2)

println("Tamanho mínimo da amostra: $n")
</code></pre>
  </div>
</div>

<div class="code-output">
  <div class="code-output-header"># Saída</div>
  Tamanho mínimo da amostra: 385
</div>

---

## Exemplo Prático: Pesquisa de Intenção de Voto para Presidente

Uma empresa de pesquisas deseja estimar a proporção de eleitores que pretendem votar em um determinado candidato à presidência. Para garantir um nível de confiança de 95% e um erro máximo de 2%, qual deve ser o tamanho mínimo da amostra, supondo que a proporção estimada de intenção de voto seja de 40%?

### Resolução Manual Passo a Passo

**Dados:**
- Nível de confiança: 95% ($\alpha = 0,05$)
- Proporção estimada ($\hat{p}$): 0,40
- Erro máximo tolerável ($E$): 0,02

**O que é a proporção estimada ($\hat{p}$)?**

A proporção estimada ($\hat{p}$) representa a melhor estimativa, antes da pesquisa, da fração da população que possui a característica de interesse. No contexto de uma pesquisa eleitoral, é a estimativa inicial da porcentagem de eleitores que pretendem votar no candidato analisado. Essa estimativa pode ser baseada em pesquisas anteriores, dados históricos ou, na ausência de informações, pode-se usar o valor mais conservador ($\hat{p} = 0,5$), que resulta no maior tamanho de amostra possível.

#### 1. Valor crítico $z_{\alpha/2}$

Para 95% de confiança:
$$
z_{\alpha/2} = 1,96
$$

#### 2. Aplicando a fórmula do tamanho da amostra para proporção

$$
n = \frac{z_{\alpha/2}^2 \hat{p}(1-\hat{p})}{E^2}
$$

Substituindo os valores:
$$
n = \frac{1,96^2 \times 0,40 \times 0,60}{0,02^2}
$$

Calculando passo a passo:
- $1,96^2 = 3,8416$
- $0,40 \times 0,60 = 0,24$
- $0,02^2 = 0,0004$

$$
n = \frac{3,8416 \times 0,24}{0,0004} = \frac{0,921984}{0,0004} = 2304,96
$$

Arredondando para cima:
$$
n = 2305
$$

**Portanto, a amostra deve ter pelo menos 2.305 eleitores para garantir o erro máximo de 2% com 95% de confiança.**

---

### Exemplo em Julia

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

# Parâmetros
z = quantile(Normal(), 1 - 0.05/2)  # 95% de confiança
p̂ = 0.40                            # proporção estimada
erro = 0.02                         # erro máximo tolerável

# Cálculo do tamanho da amostra
n = ceil(Int, (z^2 * p̂ * (1 - p̂)) / erro^2)

println("Tamanho mínimo da amostra: $n")
</code></pre>
  </div>
</div>

<div class="code-output">
  <div class="code-output-header"># Saída</div>
  Tamanho mínimo da amostra: 2305
</div>

---

## Referências Bibliográficas

1. Montgomery, D. C., & Runger, G. C. (2010). Applied Statistics and Probability for Engineers.
2. Morettin, P. A., & Bussab, W. O. (2017). Estatística Básica.
3. Triola, M. F. (2017). Introdução à Estatística.
