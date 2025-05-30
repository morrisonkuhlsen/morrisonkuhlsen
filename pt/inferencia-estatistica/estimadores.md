---
layout: page
title: Estimadores
lang: pt
ref: estimadores
parent: inferencia-estatistica
permalink: /pt/inferencia-estatistica/estimadores
order: 4
---

Conteúdo sobre estimadores estatísticos.

## Introdução

Estimadores são funções ou regras que, a partir de dados amostrais, produzem valores aproximados para parâmetros desconhecidos de uma população. Eles são fundamentais na inferência estatística, pois permitem fazer previsões e tomar decisões baseadas em amostras.

![Conceito de Estimador]({{ site.baseurl }}/assets/images/estimador.png){:style="max-width: 400px; display: block; margin: 0 auto;"}
<div class="image-caption" style="text-align: center;">Figura: O estimador é como uma "ferramenta" que transforma dados amostrais em estimativas para a população.</div>

---

## Conceito de Estimador

- **Estimador:** É uma regra ou função matemática que associa a cada amostra um valor numérico, usado para estimar um parâmetro populacional.
- **Estimativa:** É o valor numérico obtido ao aplicar o estimador a uma amostra específica.

Exemplo:
- O estimador da média populacional é a média amostral ($\bar{x}$).
- O estimador da proporção populacional é a proporção amostral ($\hat{p}$).

---

## Propriedades dos Estimadores

### 1. Viés
- Um estimador é **não-viesado** se, em média, ele acerta o valor do parâmetro populacional.
- $$\text{Viés}(\hat{\theta}) = E[\hat{\theta}] - \theta$$
- Exemplo: A média amostral $\bar{x}$ é um estimador não-viesado da média populacional $\mu$.

### 2. Consistência
- Um estimador é **consistente** se, à medida que o tamanho da amostra aumenta, ele converge para o valor verdadeiro do parâmetro.

### 3. Eficiência
- Entre dois estimadores não-viesados, o mais eficiente é o que tem menor variância.

### 4. Suficiência
- Um estimador é **suficiente** se utiliza toda a informação relevante da amostra sobre o parâmetro.

---

## Exemplos de Estimadores

### 1. Média Amostral

- **Estimador:** $\bar{x} = \frac{1}{n}\sum_{i=1}^n x_i$
- **Parâmetro estimado:** Média populacional ($\mu$)

### 2. Proporção Amostral

- **Estimador:** $\hat{p} = \frac{x}{n}$
- **Parâmetro estimado:** Proporção populacional ($p$)

### 3. Variância Amostral

- **Estimador:** $s^2 = \frac{1}{n-1}\sum_{i=1}^n (x_i - \bar{x})^2$
- **Parâmetro estimado:** Variância populacional ($\sigma^2$)

---

## Exemplo Prático Manual (Passo a Passo)

Suponha a amostra: $[8, 10, 9, 11, 12]$

1. **Média amostral:**
   $$\bar{x} = \frac{8+10+9+11+12}{5} = \frac{50}{5} = 10$$
2. **Proporção amostral (ex: quantos são maiores que 10):**
   $$\hat{p} = \frac{2}{5} = 0,4$$
3. **Variância amostral:**
   $$s^2 = \frac{(8-10)^2 + (10-10)^2 + (9-10)^2 + (11-10)^2 + (12-10)^2}{5-1} = \frac{4+0+1+1+4}{4} = \frac{10}{4} = 2,5$$

---

## Exemplo em Julia

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

dados = [8, 10, 9, 11, 12]

# Média amostral
media = mean(dados)
# Proporção de valores > 10
prop = count(x -> x > 10, dados) / length(dados)
# Variância amostral
variancia = var(dados, corrected=true)

println("Média amostral: $media")
println("Proporção amostral (>10): $prop")
println("Variância amostral: $variancia")
</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  Média amostral: 10.0<br>
  Proporção amostral (>10): 0.4<br>
  Variância amostral: 2.5
</div>

---

## Avisos Importantes

- O estimador é uma função, a estimativa é o valor numérico obtido.
- Estimadores diferentes podem ser usados para o mesmo parâmetro, mas nem todos são igualmente bons.
- Sempre verifique as propriedades do estimador para garantir a qualidade da inferência.

---

## Referências Bibliográficas

1. Montgomery, D. C., & Runger, G. C. (2010). Applied Statistics and Probability for Engineers.
2. Morettin, P. A., & Bussab, W. O. (2017). Estatística Básica.
3. Triola, M. F. (2017). Introdução à Estatística.
