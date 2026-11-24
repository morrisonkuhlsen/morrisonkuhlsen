---
layout: page
title: Medidas de Dispersão
lang: pt
ref: dispersao
parent: estatistica-descritiva
permalink: /pt/estatistica-descritiva/dispersao
order: 2
mathjax: true
description: "Medidas que descrevem a variabilidade dos dados: variância, desvio padrão e amplitude."
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

Na estatística, diferentes símbolos são usados para representar as medidas de dispersão:

### 1. Variância
- **Símbolo Populacional**: $\sigma^2$ (sigma minúsculo ao quadrado)
  - **Significado**: é o quadrado do desvio padrão populacional $\sigma$. O quadrado lembra a conta: os desvios em relação à média são elevados ao quadrado, o que elimina os sinais negativos e dá mais peso aos desvios grandes.
  - **Origem do nome**: a palavra *variance* (variância) foi introduzida por Ronald Fisher em 1918, num artigo sobre genética, para o quadrado do desvio padrão (Fisher, 1918).

- **Símbolo Amostral**: $s^2$
  - **Significado**: a variância calculada a partir de uma amostra. Segue a convenção de usar letras latinas para estatísticas amostrais.

### 2. Desvio Padrão
- **Símbolo Populacional**: $\sigma$ (sigma minúsculo)
  - **Origem**: Karl Pearson usou o termo *standard deviation* (desvio padrão) e o símbolo $\sigma$ num artigo de 1894 (Pearson, 1894).
  - **Significado**: o desvio típico dos valores em relação à média populacional.

- **Símbolo Amostral**: $s$
  - **Significado**: o desvio padrão calculado a partir de uma amostra. O $s$ é a letra latina que corresponde ao sigma grego.

### 3. Coeficiente de Variação
- **Símbolo**: $CV$
  - **Significado**: a razão entre o desvio padrão e a média, em porcentagem. Por ser uma medida relativa, não tem unidade.

### 4. Intervalo Interquartil
- **Símbolo**: $IQR$ (do inglês *interquartile range*)
  - **Significado**: a distância entre o primeiro ($Q_1$) e o terceiro ($Q_3$) quartis, que abrange os 50% centrais dos dados.

### 5. Amplitude
- **Símbolo**: $A$ ou $R$ (de *range*, em inglês)
  - **Significado**: a diferença entre o maior e o menor valor de um conjunto de dados.

> **Convenção de Notação**: 
> - Letras gregas ($\sigma$, $\mu$) são usadas para parâmetros populacionais (valores fixos, porém geralmente desconhecidos).
> - Letras latinas ($s$, $\bar{x}$) são usadas para estatísticas amostrais (valores calculados a partir de dados amostrais).
> - A distinção entre parâmetros e estatísticas é fundamental na inferência estatística.

---

<div style="border-left: 4px solid #4CAF50; padding: 0.5em; background-color: #e8f5e9;">
  <strong>📊 Importante:</strong> a análise de dispersão é crucial para entender a <strong>confiabilidade</strong> das medidas de tendência central.<br>
  Conjuntos de dados com a mesma média podem ter <em>distribuições completamente diferentes</em> em termos de variabilidade.
</div>

---

## 1. Amplitude

A **amplitude** é a medida de dispersão mais simples: a diferença entre o maior e o menor valor do conjunto de dados.

### Fórmula

$$A = x_{\text{máx}} - x_{\text{mín}}$$

### Exemplo Prático

Considere o conjunto de idades ordenadas:

$$\{x_1, x_2, x_3, x_4, x_5, x_6, x_7\} = \{18, 20, 22, 25, 30, 35, 40\}$$

- Valor máximo: $x_{\text{máx}} = x_7 = 40$
- Valor mínimo: $x_{\text{mín}} = x_1 = 18$
- Amplitude: $A = x_{\text{máx}} - x_{\text{mín}} = 40 - 18 = 22$ anos

**Interpretação:** entre a pessoa mais nova e a mais velha do grupo há 22 anos de diferença.

### Vantagens e Limitações

**Vantagens:**
- Fácil de calcular
- Fácil de interpretar

**Limitações:**
- Depende só dos dois valores extremos, então é sensível a valores atípicos (outliers)
- Não diz nada sobre como os dados se distribuem entre os extremos

<div style="border-left: 4px solid #ff9800; padding: 0.5em; background-color: #fff3e0; margin: 1em 0;">
  <strong>⚠️ Cuidado com Outliers!</strong><br>
  A amplitude pode ser <em>enganosamente grande</em> mesmo quando a maioria dos dados está concentrada. Por exemplo, em {1; 2; 2; 2; 2; 2; 100}, a amplitude é $100 - 1 = 99$, mas 6 dos 7 valores são 1 ou 2!
</div>

<div style="border-left: 4px solid #2196F3; padding: 0.5em; background-color: #e3f2fd; margin: 1em 0;">
  <strong>💡 Dica Prática</strong><br>
  Use a amplitude para uma <em>primeira impressão</em> da dispersão, mas complemente com outras medidas, como o desvio padrão ou o IQR.
</div>

---

## 2. Variância

A **variância** mede o quanto os valores de um conjunto de dados se afastam da média. É calculada a partir dos quadrados dos desvios em relação à média.

### Fórmula (Populacional)

$$\sigma^2 = \frac{1}{N}\sum_{i=1}^{N}(x_i - \mu)^2$$

### Fórmula (Amostral)

$$s^2 = \frac{1}{n-1}\sum_{i=1}^{n}(x_i - \bar{x})^2$$

A versão amostral divide por $n - 1$, e não por $n$. Com os dados de uma amostra, os desvios são medidos em relação a $\bar{x}$, que é calculada com os próprios dados e fica sempre "no meio" deles; por isso, a soma dos quadrados tende a sair menor do que seria em relação à média verdadeira $\mu$. Dividir por $n - 1$ compensa essa diferença.

### Exemplo Prático

Considere uma amostra de notas:

$$\{x_1, x_2, x_3, x_4, x_5\} = \{7, 8, 8, 9, 10\}$$

**Passo 1 — média amostral ($\bar{x}$):**

$$\bar{x} = \frac{\sum_{i=1}^{5}x_i}{n} = \frac{7 + 8 + 8 + 9 + 10}{5} = \frac{42}{5} = 8{,}4$$

**Passo 2 — desvio de cada nota em relação à média, e o quadrado do desvio:**

| Nota $x_i$ | $x_i - \bar{x}$ | $(x_i - \bar{x})^2$ |
|---:|---:|---:|
| 7 | $7 - 8{,}4 = -1{,}4$ | $(-1{,}4)^2 = 1{,}96$ |
| 8 | $8 - 8{,}4 = -0{,}4$ | $(-0{,}4)^2 = 0{,}16$ |
| 8 | $8 - 8{,}4 = -0{,}4$ | $(-0{,}4)^2 = 0{,}16$ |
| 9 | $9 - 8{,}4 = 0{,}6$ | $(0{,}6)^2 = 0{,}36$ |
| 10 | $10 - 8{,}4 = 1{,}6$ | $(1{,}6)^2 = 2{,}56$ |
| **Soma** | $0$ | $5{,}2$ |

**Passo 3 — soma dos desvios ao quadrado:**

$$\sum_{i=1}^{5}(x_i - \bar{x})^2 = 1{,}96 + 0{,}16 + 0{,}16 + 0{,}36 + 2{,}56 = 5{,}2$$

**Passo 4 — divisão por $n - 1 = 5 - 1 = 4$ (variância amostral):**

$$s^2 = \frac{\sum_{i=1}^{n}(x_i - \bar{x})^2}{n-1} = \frac{5{,}2}{4} = 1{,}3$$

Portanto, a variância amostral é $s^2 = 1{,}3$ **pontos ao quadrado**. A unidade ao quadrado é o motivo de, na prática, se usar mais o desvio padrão.

<div style="border-left: 4px solid #9c27b0; padding: 0.5em; background-color: #f3e5f5; margin: 1em 0;">
  <strong>🔍 Curiosidade Histórica</strong><br>
  O nome <em>variance</em> (variância) apareceu num artigo de Ronald Fisher de 1918 sobre a correlação entre parentes sob a herança mendeliana — o mesmo trabalho em que ele começou a decompor a variabilidade total em partes atribuídas a causas diferentes, a ideia que depois virou a análise de variância (ANOVA).
</div>

---

## 3. Desvio Padrão

O **desvio padrão** é a raiz quadrada da variância e tem a vantagem de estar na mesma unidade de medida dos dados originais.

### Fórmula (Populacional)

$$\sigma = \sqrt{\sigma^2}$$

### Fórmula (Amostral)

$$s = \sqrt{s^2}$$

### Exemplo Prático

Continuando com o exemplo anterior, em que calculamos a variância amostral $s^2 = 1{,}3$:

$$s = \sqrt{s^2} = \sqrt{1{,}3} \approx 1{,}1402 \approx 1{,}14$$

O desvio padrão amostral é $s \approx 1{,}14$ **ponto**, de volta à unidade das notas. Ele é a medida usual de quanto as notas costumam se afastar da média $\bar{x} = 8{,}4$.

Cuidado com a leitura "em média, as notas se afastam 1,14 ponto da média": isso não é exatamente verdade. A média dos afastamentos em valor absoluto é

$$\frac{|7 - 8{,}4| + |8 - 8{,}4| + |8 - 8{,}4| + |9 - 8{,}4| + |10 - 8{,}4|}{5} = \frac{1{,}4 + 0{,}4 + 0{,}4 + 0{,}6 + 1{,}6}{5} = \frac{4{,}4}{5} = 0{,}88$$

O desvio padrão (1,14) sai maior porque eleva os desvios ao quadrado antes de tirar a média, o que dá mais peso aos desvios grandes, e porque divide por $n - 1$ em vez de $n$.

<div style="border-left: 4px solid #4caf50; padding: 0.5em; background-color: #e8f5e9; margin: 1em 0;">
  <strong>📊 Regra Empírica (68–95–99,7)</strong><br>
  Para dados com distribuição <strong>normal</strong>, aproximadamente:
  <ul>
    <li>68% dos dados estão a até 1 desvio padrão da média ($\mu \pm \sigma$) — mais precisamente, 68,27%</li>
    <li>95% estão a até 2 desvios padrão ($\mu \pm 2\sigma$) — 95,45%</li>
    <li>99,7% estão a até 3 desvios padrão ($\mu \pm 3\sigma$) — 99,73%</li>
  </ul>
  A regra vale para a distribuição normal. Para dados assimétricos ou com caudas pesadas, as porcentagens podem ser bem diferentes.
</div>

---

## 4. Coeficiente de Variação (CV)

O **coeficiente de variação** é uma medida relativa de dispersão, expressa em porcentagem, que relaciona o desvio padrão à média.

### Fórmula

$$CV = \frac{\text{desvio padrão}}{\text{média}} \times 100\%$$

Com dados de uma amostra, $CV = \dfrac{s}{\bar{x}} \times 100\%$; com a população inteira, $CV = \dfrac{\sigma}{\mu} \times 100\%$.

### Exemplo Prático

Considere dois conjuntos de dados com as seguintes estatísticas:

- **Conjunto A**: média 50 e desvio padrão 5.
  $$CV_A = \frac{5}{50} \times 100\% = 0{,}1 \times 100\% = 10\%$$

- **Conjunto B**: média 500 e desvio padrão 20.
  $$CV_B = \frac{20}{500} \times 100\% = 0{,}04 \times 100\% = 4\%$$

O desvio padrão de B (20) é quatro vezes o de A (5), mas, **em relação à média**, A varia mais: $CV_A = 10\% > CV_B = 4\%$. É para esse tipo de comparação que o CV serve.

<div style="border-left: 4px solid #ff5722; padding: 0.5em; background-color: #fbe9e7; margin: 1em 0;">
  <strong>⚠️ Limitações Importantes</strong>
  <ul>
    <li><strong>Média perto de zero:</strong> como se divide pela média, um valor próximo de zero faz o CV explodir e perder o sentido.</li>
    <li><strong>Só para escala de razão</strong> (com zero absoluto, como peso, altura ou renda). Em escalas com zero arbitrário, o CV depende da escolha da unidade. Exemplo: as temperaturas 10, 20 e 30 °C têm média 20 °C e desvio padrão 10 °C, então $CV = \frac{10}{20} = 50\%$. As mesmas temperaturas em Fahrenheit são 50, 68 e 86 °F, com média 68 °F e desvio padrão 18 °F, e $CV = \frac{18}{68} \approx 26{,}5\%$. Mesmos dias, mesmo calor — CVs diferentes.</li>
  </ul>
</div>

---

## 5. Intervalo Interquartil (IQR)

O **intervalo interquartil** é a diferença entre o terceiro quartil ($Q_3$, o percentil 75) e o primeiro quartil ($Q_1$, o percentil 25), ou seja, a faixa que contém os 50% centrais dos dados.

### Fórmula

$$IQR = Q_3 - Q_1$$

### Exemplo Prático

Considere o conjunto de idades ordenadas ($n = 7$):

$$\{x_{(1)}, x_{(2)}, x_{(3)}, x_{(4)}, x_{(5)}, x_{(6)}, x_{(7)}\} = \{18, 20, 22, 25, 30, 35, 40\}$$

Aqui usamos o método das posições $\frac{n+1}{4}$ e $\frac{3(n+1)}{4}$:

1. **Primeiro Quartil ($Q_1$)**:
   - Posição: $\dfrac{n+1}{4} = \dfrac{7+1}{4} = \dfrac{8}{4} = 2$
   - $Q_1 = x_{(2)} = 20$

2. **Terceiro Quartil ($Q_3$)**:
   - Posição: $\dfrac{3(n+1)}{4} = \dfrac{3 \times 8}{4} = \dfrac{24}{4} = 6$
   - $Q_3 = x_{(6)} = 35$

3. **Intervalo Interquartil**:
   $$IQR = Q_3 - Q_1 = 35 - 20 = 15 \text{ anos}$$

**Interpretação:** os 50% centrais das idades estão entre 20 e 35 anos, uma faixa de 15 anos.

<div style="border-left: 4px solid #2196F3; padding: 0.5em; background-color: #e3f2fd; margin: 1em 0;">
  <strong>💡 Quartis dependem do método</strong><br>
  Não existe uma única fórmula de quartil: Hyndman e Fan (1996) compararam nove definições usadas por programas estatísticos. Com os mesmos dados, o método padrão do Julia e do R (chamado "tipo 7") dá $Q_1 = 21$, $Q_3 = 32{,}5$ e $IQR = 11{,}5$, e não 20, 35 e 15. Nenhum dos dois está errado; ao comparar resultados, confira qual método foi usado. A diferença diminui quando há muitos dados.
</div>

<div style="border-left: 4px solid #673ab7; padding: 0.5em; background-color: #ede7f6; margin: 1em 0;">
  <strong>🔍 Identificando Outliers</strong><br>
  O IQR é usado para identificar valores atípicos: pelo critério do boxplot, são outliers os valores abaixo de $Q_1 - 1{,}5 \times IQR$ ou acima de $Q_3 + 1{,}5 \times IQR$. No nosso exemplo (com $Q_1 = 20$, $Q_3 = 35$ e $IQR = 15$):
  <ul>
    <li>Margem: $1{,}5 \times 15 = 22{,}5$</li>
    <li>Limite inferior: $20 - 22{,}5 = -2{,}5$</li>
    <li>Limite superior: $35 + 22{,}5 = 57{,}5$</li>
  </ul>
  Todas as idades (de 18 a 40) ficam entre $-2{,}5$ e $57{,}5$, então não há outliers neste conjunto.
</div>

---

## Comparação entre as Medidas

| Medida | Vantagens | Limitações |
|--------|-----------|------------|
| **Amplitude** | Fácil de calcular | Depende só dos extremos; sensível a outliers |
| **Variância** | Usa todos os dados | Unidade ao quadrado |
| **Desvio Padrão** | Mesma unidade dos dados | Sensível a outliers |
| **Coeficiente de Variação** | Compara conjuntos de escalas diferentes | Não serve com média perto de zero nem fora da escala de razão |
| **IQR** | Resistente a outliers | Ignora os 25% de cada ponta; depende do método de quartil |

---

## Aplicações Práticas

1. **Controle de Qualidade**: o desvio padrão é usado em gráficos de controle para monitorar processos.
2. **Finanças**: o desvio padrão dos retornos é usado como medida de risco de um investimento.
3. **Pesquisa**: o IQR é usado em boxplots para identificar valores atípicos.
4. **Meteorologia**: a amplitude térmica (máxima menos mínima do dia) é uma medida de dispersão usada nas previsões do tempo.

---

## Referências

1. Fisher, R. A. (1918). The correlation between relatives on the supposition of Mendelian inheritance. *Transactions of the Royal Society of Edinburgh*, 52(2), 399–433.
2. Hyndman, R. J.; Fan, Y. (1996). Sample quantiles in statistical packages. *The American Statistician*, 50(4), 361–365. DOI: [10.1080/00031305.1996.10473566](https://doi.org/10.1080/00031305.1996.10473566).
3. NIST/SEMATECH. *e-Handbook of Statistical Methods*, seção 1.3.5.6, "Measures of Scale". Disponível em: <https://www.itl.nist.gov/div898/handbook/eda/section3/eda356.htm>. Acesso em: 23 nov. 2026.
4. Pearson, K. (1894). Contributions to the mathematical theory of evolution. I. On the dissection of asymmetrical frequency curves. *Philosophical Transactions of the Royal Society of London. A*, 185, 71–110.

### Para saber mais

- Bussab, W. O.; Morettin, P. A. (2023). *Estatística Básica*. 10. ed. Saraiva Uni.
- Triola, M. F. (2024). *Introdução à Estatística*. 14. ed. LTC.
