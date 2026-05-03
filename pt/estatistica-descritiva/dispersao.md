---
layout: page
title: Medidas de Dispersão
lang: pt
ref: dispersao
parent: estatistica-descritiva
permalink: /pt/estatistica-descritiva/dispersao
order: 2
mathjax: true
---

As **medidas de dispersão** são ferramentas essenciais na estatística descritiva que nos ajudam a entender o quão espalhados ou concentrados estão os dados em torno de uma medida de tendência central, geralmente a média. Enquanto as medidas de tendência central mostram o valor típico, as medidas de dispersão mostram a variabilidade dos dados.

As principais medidas de dispersão são:

1. **Amplitude**
2. **Variância**
3. **Desvio Padrão**
4. **Coeficiente de Variação**
5. **Intervalo Interquartil (IQR)**

---

## Símbolos e Suas Origens

Na estatística, diferentes símbolos são usados para representar as medidas de dispersão, cada um com sua origem e significado específicos:

### 1. Variância
- **Símbolo Populacional**: $\sigma^2$ (sigma minúsculo ao quadrado)
  - **Origem**: A letra grega sigma ($\sigma$) foi escolhida por Karl Pearson no início do século XX para representar o desvio padrão populacional. O quadrado do desvio padrão ($\sigma^2$) passou a representar a variância.
  - **Significado**: O quadrado simboliza a função quadrática usada no cálculo, que elimina valores negativos e dá maior peso a desvios maiores.

- **Símbolo Amostral**: $s^2$
  - **Origem**: Segue a convenção de usar letras latinas para estatísticas amostrais. O "s" vem de "standard deviation" (desvio padrão em inglês).
  - **Significado**: O expoente 2 indica que é uma medida de dispersão ao quadrado, mantendo a mesma lógica da notação populacional.

### 2. Desvio Padrão
- **Símbolo Populacional**: $\sigma$ (sigma minúsculo)
  - **Origem**: Introduzido por Karl Pearson em 1894, baseado na letra grega sigma, que representa um "s" em grego (de "standard").
  - **Significado**: Representa o desvio típico dos valores em relação à média populacional.

- **Símbolo Amostral**: $s$
  - **Origem**: Versão em letra latina do sigma grego, seguindo a convenção estatística.
  - **Significado**: Indica o desvio padrão calculado a partir de uma amostra da população.

### 3. Coeficiente de Variação
- **Símbolo**: $CV$
  - **Origem**: A sigla vem do inglês "Coefficient of Variation".
  - **Significado**: Representa a razão entre o desvio padrão e a média, expressa em porcentagem. Não possui notação diferente para população e amostra, pois já é uma medida relativa.

### 4. Intervalo Interquartil
- **Símbolo**: $IQR$ (do inglês "Interquartile Range")
  - **Origem**: A sigla foi adotada do termo em inglês para facilitar a comunicação internacional.
  - **Significado**: Representa a distância entre o primeiro ($Q_1$) e o terceiro ($Q_3$) quartis, abrangendo os 50% centrais dos dados.

### 5. Amplitude
- **Símbolo**: $A$ ou $R$ (de "range" em inglês)
  - **Origem**: O "R" vem do termo em inglês "range", que significa intervalo ou amplitude.
  - **Significado**: Representa a diferença entre os valores máximo e mínimo de um conjunto de dados.

> **Convenção de Notação**: 
> - Letras gregas ($\sigma$, $\mu$) são usadas para parâmetros populacionais (valores fixos, porém geralmente desconhecidos).
> - Letras latinas ($s$, $\bar{x}$) são usadas para estatísticas amostrais (valores calculados a partir de dados amostrais).
> - A distinção entre parâmetros e estatísticas é fundamental na inferência estatística.

---

<div style="border-left: 4px solid #4CAF50; padding: 0.5em; background-color: #e8f5e9;">
  <strong>📊 Importante:</strong> A análise de dispersão é crucial para entender a <strong>confiabilidade</strong> das medidas de tendência central.<br>
  Conjuntos de dados com a mesma média podem ter <em>distribuições completamente diferentes</em> em termos de variabilidade.
</div>

---

## 1. Amplitude

A **amplitude** é a medida de dispersão mais simples, representando a diferença entre o maior e o menor valor do conjunto de dados.

### Fórmula

$$\text{Amplitude} = x_{\text{máx}} - x_{\text{mín}}$$

### Exemplo Prático

Considere o conjunto de idades ordenadas:

$$\{x_1, x_2, x_3, x_4, x_5, x_6, x_7\} = \{18, 20, 22, 25, 30, 35, 40\}$$

- Valor máximo: $x_{\text{máx}} = x_7 = 40$
- Valor mínimo: $x_{\text{mín}} = x_1 = 18$
- Amplitude: $A = x_{\text{máx}} - x_{\text{mín}} = 40 - 18 = 22$ anos

### Vantagens e Limitações

**Vantagens:**
- Fácil de calcular
- Fácil de interpretar

**Limitações:**
- Sensível a valores extremos (outliers)
- Não leva em conta a distribuição dos dados entre os extremos

<div style="border-left: 4px solid #ff9800; padding: 0.5em; background-color: #fff3e0; margin: 1em 0;">
  <strong>⚠️ Cuidado com Outliers!</strong><br>
  A amplitude pode ser <em>enganosamente grande</em> mesmo quando a maioria dos dados está concentrada. Por exemplo, em um conjunto como {1, 2, 2, 2, 2, 2, 100}, a amplitude é 99, mas 6 dos 7 valores são 1 ou 2!
</div>

<div style="border-left: 4px solid #2196F3; padding: 0.5em; background-color: #e3f2fd; margin: 1em 0;">
  <strong>💡 Dica Prática</strong><br>
  Use a amplitude para uma <em>primeira impressão</em> da dispersão, mas sempre complemente com outras medidas como o desvio padrão ou IQR para uma visão mais completa.
</div>

---

## 2. Variância

A **variância** mede o quanto os valores de um conjunto de dados se afastam da média. É calculada como a média dos quadrados dos desvios em relação à média.

### Fórmula (Populacional)

$$\sigma^2 = \frac{1}{N}\sum_{i=1}^{N}(x_i - \mu)^2$$

### Fórmula (Amostral)

$$s^2 = \frac{1}{n-1}\sum_{i=1}^{n}(x_i - \bar{x})^2$$

### Exemplo Prático

Considere o conjunto de notas amostrais:

$$\{x_1, x_2, x_3, x_4, x_5\} = \{7, 8, 8, 9, 10\}$$


1. Calcule a média amostral ($\bar{x}$):
   $$\bar{x} = \frac{\sum_{i=1}^{5}x_i}{n} = \frac{7 + 8 + 8 + 9 + 10}{5} = \frac{42}{5} = 8.4$$

2. Calcule os desvios em relação à média e eleve ao quadrado:
   $$(x_1 - \bar{x})^2 = (7 - 8.4)^2 = (-1.4)^2 = 1.96$$
   $$(x_2 - \bar{x})^2 = (8 - 8.4)^2 = (-0.4)^2 = 0.16$$
   $$(x_3 - \bar{x})^2 = (8 - 8.4)^2 = (-0.4)^2 = 0.16$$
   $$(x_4 - \bar{x})^2 = (9 - 8.4)^2 = (0.6)^2 = 0.36$$
   $$(x_5 - \bar{x})^2 = (10 - 8.4)^2 = (1.6)^2 = 2.56$$

3. Some os desvios ao quadrado:
   $$\sum_{i=1}^{5}(x_i - \bar{x})^2 = 1.96 + 0.16 + 0.16 + 0.36 + 2.56 = 5.2$$

4. Divida por $n-1$ (para variância amostral):
   $$s^2 = \frac{\sum_{i=1}^{n}(x_i - \bar{x})^2}{n-1} = \frac{5.2}{4} = 1.3$$

Portanto, a variância amostral é $s^2 = 1.3$.

<div style="border-left: 4px solid #9c27b0; padding: 0.5em; background-color: #f3e5f5; margin: 1em 0;">
  <strong>🔍 Curiosidade Histórica</strong><br>
  O conceito de variância foi formalizado por Ronald Fisher em 1918, mas suas origens remontam a trabalhos anteriores de Gauss e Laplace sobre o método dos mínimos quadrados. Fisher a chamou inicialmente de "dispersão", mas o termo "variância" prevaleceu por sua clareza conceitual.
</div>

---

## 3. Desvio Padrão

O **desvio padrão** é a raiz quadrada da variância e tem a vantagem de estar na mesma unidade de medida dos dados originais.

### Fórmula (Populacional)

$$\sigma = \sqrt{\sigma^2}$$

### Fórmula (Amostral)

$$s = \sqrt{s^2}$$

### Exemplo Prático

Continuando com o exemplo anterior, onde calculamos a variância amostral $s^2 = 1.3$:

$$s = \sqrt{s^2} = \sqrt{1.3} \approx 1.14$$


Isso significa que o desvio padrão amostral é $s \approx 1.14$ pontos. Em outras palavras, em média, as notas desviam-se aproximadamente $1.14$ pontos da média amostral $\bar{x} = 8.4$.

<div style="border-left: 4px solid #4caf50; padding: 0.5em; background-color: #e8f5e9; margin: 1em 0;">
  <strong>📊 Regra Empírica (68-95-99.7)</strong><br>
  Para distribuições normais, aproximadamente:
  - 68% dos dados estão dentro de 1 desvio padrão da média ($\bar{x} \pm s$)
  - 95% dentro de 2 desvios padrão
  - 99.7% dentro de 3 desvios padrão
</div>

---

## 4. Coeficiente de Variação (CV)

O **coeficiente de variação** é uma medida relativa de dispersão, expressa em porcentagem, que relaciona o desvio padrão à média.

### Fórmula

$$CV = \left(\frac{s}{\bar{x}}\right) \times 100\%$$

### Exemplo Prático

Considere dois conjuntos de dados com as seguintes estatísticas:

- **Conjunto A**: 
  - Média: $\mu_A = 50$
  - Desvio Padrão: $\sigma_A = 5$
  - CV: $CV_A = \left(\frac{\sigma_A}{\mu_A}\right) \times 100\% = \left(\frac{5}{50}\right) \times 100\% = 10\%$

- **Conjunto B**:
  - Média: $\mu_B = 500$
  - Desvio Padrão: $\sigma_B = 20$
  - CV: $CV_B = \left(\frac{\sigma_B}{\mu_B}\right) \times 100\% = \left(\frac{20}{500}\right) \times 100\% = 4\%$

Como $CV_A > CV_B$ (10% > 4%), o Conjunto A apresenta maior dispersão relativa em relação à sua média.

<div style="border-left: 4px solid #ff5722; padding: 0.5em; background-color: #fbe9e7; margin: 1em 0;">
  <strong>⚠️ Limitação Importante</strong><br>
  O Coeficiente de Variação <em>não deve ser usado</em> quando a média está próxima de zero, pois pode levar a valores extremamente altos e enganosos. Além disso, só faz sentido para dados em escala de razão (com zero absoluto bem definido).
</div>

---

## 5. Intervalo Interquartil (IQR)

O **intervalo interquartil** é a diferença entre o terceiro quartil (Q3) e o primeiro quartil (Q1), representando a faixa que contém os 50% centrais dos dados.

### Fórmula

$$IQR = Q3 - Q1$$

### Exemplo Prático

Considere o conjunto de idades ordenadas:

$$\{x_{(1)}, x_{(2)}, x_{(3)}, x_{(4)}, x_{(5)}, x_{(6)}, x_{(7)}\} = \{18, 20, 22, 25, 30, 35, 40\}$$


1. **Primeiro Quartil (Q₁)**:
   - Posição: $Q_1$ = 25º percentil
   - Fórmula: $Q_1 = x_{(\frac{n+1}{4})} = x_{(2)} = 20$

2. **Terceiro Quartil (Q₃)**:
   - Posição: $Q_3$ = 75º percentil
   - Fórmula: $Q_3 = x_{(\frac{3(n+1)}{4})} = x_{(6)} = 35$

3. **Intervalo Interquartil (IQR)**:
   $$IQR = Q_3 - Q_1 = 35 - 20 = 15 \text{ anos}$$

Portanto, os 50% centrais das idades estão compreendidos entre 20 e 35 anos, com uma dispersão de 15 anos.

<div style="border-left: 4px solid #673ab7; padding: 0.5em; background-color: #ede7f6; margin: 1em 0;">
  <strong>🔍 Identificando Outliers</strong><br>
  O IQR é fundamental para identificar valores atípicos. Geralmente, considera-se como outliers os valores que estão abaixo de $Q_1 - 1.5 \times IQR$ ou acima de $Q_3 + 1.5 \times IQR$. No nosso exemplo, qualquer valor abaixo de $20 - 1.5 \times 15 = -2.5$ ou acima de $35 + 1.5 \times 15 = 57.5$ seria considerado um outlier.
</div>

---

## Comparação entre as Medidas

| Medida | Vantagens | Limitações |
|--------|-----------|------------|
| **Amplitude** | Fácil de calcular | Sensível a outliers |
| **Variância** | Considera todos os dados | Unidade ao quadrado |
| **Desvio Padrão** | Mesma unidade dos dados | Sensível a outliers |
| **Coeficiente de Variação** | Comparação entre conjuntos | Não se aplica a média zero |
| **IQR** | Robusto a outliers | Desconsidera 50% dos dados |

---

## Aplicações Práticas

1. **Controle de Qualidade**: O desvio padrão é amplamente usado em gráficos de controle para monitorar processos.
2. **Finanças**: O desvio padrão é usado como medida de risco em investimentos.
3. **Pesquisa**: O IQR é frequentemente usado em boxplots para identificar valores atípicos.
4. **Meteorologia**: A amplitude térmica é uma medida de dispersão usada em previsões do tempo.

---

## Referências

1. Bussab, W. O.; Morettin, P. A. (2017). *Estatística Básica*. Saraiva.
2. Triola, M. F. (2017). *Introdução à Estatística*. LTC.
3. Moore, D. S.; Notz, W. I.; Fligner, M. A. (2014). *A Estatística Básica e Sua Prática*. LTC.
