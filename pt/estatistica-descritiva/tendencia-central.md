---
layout: page
title: Medidas de Tendência Central
lang: pt
ref: tendencia-central
parent: estatistica-descritiva
permalink: /pt/estatistica-descritiva/tendencia-central
order: 1
mathjax: true
description: "Média, mediana e moda: as principais medidas que descrevem o valor típico de um conjunto de dados."
---

As **medidas de tendência central** são ferramentas fundamentais na estatística descritiva. Elas nos ajudam a entender *para onde* os dados "apontam", ou seja, qual é o valor em torno do qual os dados tendem a se concentrar.

As três medidas mais comuns são:

1. **Média Aritmética**
2. **Mediana**
3. **Moda**

Cada uma é útil em diferentes contextos, dependendo do tipo de dado e da forma da distribuição.

---

<div style="border-left: 4px solid orange; padding: 0.5em; background-color: #fff3cd;">
  <strong>⚠️ Atenção:</strong> A <strong>média aritmética</strong> pode ser bastante <em>sensível a valores extremos</em> (outliers).<br>
  Em distribuições assimétricas, como a de <strong>renda</strong> ou <strong>tempos de espera</strong>, a média pode <em>não representar bem a tendência central</em>.<br>
  Nesses casos, prefira a <strong>mediana</strong> ou a <strong>moda</strong>, conforme o objetivo da análise estatística.
</div>

---

## 1. Média Aritmética

A **média aritmética** é o valor obtido somando todos os elementos do conjunto e dividindo pelo número total de elementos.

### Fórmula

$$\bar{x} = \frac{1}{n}\sum_{i=1}^{n}x_i = \frac{x_1 + x_2 + \cdots + x_n}{n}$$

- **Σxᵢ**: soma de todos os valores
- **n**: número de observações

### Exemplo Prático

Considere as idades: `20, 22, 24, 26, 28`

Considere os seguintes valores:  
$x_1 = 20$, 
$x_2 = 22$, 
$x_3 = 24$, 
$x_4 = 26$, 
$x_5 = 28$

A média aritmética $\bar{x}$ é dada por:

$$\bar{x} = \frac{x_1 + x_2 + x_3 + x_4 + x_5}{n}$$

Substituindo os valores:

$$\bar{x} = \frac{20 + 22 + 24 + 26 + 28}{5}$$

$$\bar{x} = \frac{120}{5}$$

$$\bar{x} = 24$$

### Quando usar com cautela

- Alta sensibilidade a **valores atípicos** (outliers)
- Pode **não representar bem** a centralidade em distribuições **assimétricas**

### 💻 Exemplo em Julia

Vamos calcular a média aritmética em Julia:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code># Carregando o pacote Statistics
using Statistics

# Dados do exemplo
idades = [20, 22, 24, 26, 28]

# Calculando a média
media = mean(idades)
println("Idades: ", idades)
println("Média: ", media)

# Cálculo manual
soma = sum(idades)
n = length(idades)
media_manual = soma / n
println("Soma: ", soma)
println("Quantidade: ", n)
println("Média (manual): ", media_manual)</code></pre>
  </div>
</div>

#### Saída esperada:
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>Idades: [20, 22, 24, 26, 28]</div>
  <div>Média: 24.0</div>
  <div>Soma: 120</div>
  <div>Quantidade: 5</div>
  <div>Média (manual): 24.0</div>
</div>

### 💡 Curiosidade

A média é muito usada em indicadores sociais, como o **PIB per capita**, mas nem sempre representa fielmente a realidade de todos os indivíduos de uma população.

Na estatística, diferentes símbolos são usados para representar a **média**, dependendo do contexto (amostral, populacional, etc.). Abaixo estão os mais comuns:

---

### 1. Média Aritmética Amostral

**Símbolo:** $\bar{x}$ (lê-se: "x barra")

**Significado:** Representa a **média de uma amostra**.

**Fórmula:**
$\bar{x} = \frac{\sum_{i=1}^{n} x_i}{n}$

**Onde:**
- $\bar{x}$: média amostral  
- $x_i$: i-ésimo valor da amostra  
- $n$: número total de observações na amostra  
- $\sum$: símbolo de somatório (soma de todos os valores)

---

### 2. Média Aritmética Populacional

**Símbolo:** $\mu$ (letra grega "mi")

**Significado:** Representa a **média de uma população** inteira.

**Fórmula:**
\$\mu = \frac{\sum_{i=1}^{N} x_i}{N}
$

**Onde:**
- $\mu$: média populacional  
- $x_i$: i-ésimo valor da população  
- $N$: número total de elementos da população  

---

#### 3. Somatório

**Símbolo:** $\sum$ (letra grega "sigma maiúsculo")

**Significado:** Indica a **soma** de uma sequência de valores.

**Exemplo:**
$\sum_{i=1}^{5} x_i = x_1 + x_2 + x_3 + x_4 + x_5$

---

#### 4. Subscrito $i$

**Símbolo:** $x_i$

**Significado:** Representa o **i-ésimo elemento** da amostra ou população.  
Usado para indicar que estamos trabalhando com uma sequência de dados, como $x_1, x_2, ..., x_n$.

---

#### Resumo

| Símbolo     | Nome                     | Representa                             |
|-------------|--------------------------|----------------------------------------|
| $\bar{x}$    | x barra                  | Média amostral                         |
| $\mu$       | mi                       | Média populacional                     |
| $\sum$      | sigma maiúsculo          | Somatório (soma dos valores)           |
| $x_i$       | x sub i                  | i-ésimo elemento da amostra/população  |

---

#### Curiosidade 📚

- A média amostral ($\bar{x}$) é uma **estimativa pontual** da média populacional ($\mu$).
- Em análise estatística inferencial, usamos $\bar{x}$ para inferir ou estimar $\mu$.

---

## 2. Mediana

A **mediana** é o valor central de um conjunto ordenado. Ela divide o conjunto em duas partes com o mesmo número de observações.

#### Definição

Seja um conjunto de dados ordenado $\{x_1, x_2, ..., x_n\}$:

- Se $n$ (número de observações) é **ímpar**, a mediana é o valor do meio:
  $\text{Mediana} = x_{\frac{n+1}{2}}$

- Se $n$ é **par**, a mediana é a **média dos dois valores centrais**:
  $\text{Mediana} = \frac{x_{\frac{n}{2}} + x_{\frac{n}{2} + 1}}{2}$

---

#### Exemplos

##### 🔹 Exemplo 1: Número ímpar de elementos

Conjunto de dados:  
$\{1,\, 3,\, 3,\, 6,\, 7,\, 8,\, 9\}$

Número de elementos: $n = 7$ (ímpar)  
Valor central: 4ª posição → **6**

**Mediana = 6**

---

##### 🔹 Exemplo 2: Número par de elementos

Conjunto de dados:  
$\{3,\, 5,\, 7,\, 9\}$

Número de elementos: $n = 4$ (par)  
Valores centrais: 2ª e 3ª posições → 5 e 7  
$\text{Mediana} = \frac{5 + 7}{2} = 6$

---

#### Importância da Mediana

A **mediana** é uma medida de tendência central **robusta**. Ou seja, é menos sensível a valores extremos (**outliers**) do que a média.

### 💻 Exemplo em Julia

Vamos calcular a mediana em Julia:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code># Carregando o pacote Statistics
using Statistics

# Dados dos exemplos
dados_impar = [1, 3, 3, 6, 7, 8, 9]
dados_par = [3, 5, 7, 9]

# Calculando a mediana
mediana_impar = median(dados_impar)
mediana_par = median(dados_par)


println("Dados (ímpar): ", dados_impar)
println("Mediana: ", mediana_impar)
println("\nDados (par): ", dados_par)
println("Mediana: ", mediana_par)

# Cálculo manual para o caso par
function mediana_manual(v)
    sorted = sort(v)
    n = length(sorted)
    if n % 2 == 1  # Ímpar
        return sorted[(n + 1) ÷ 2]
    else  # Par
        return (sorted[n ÷ 2] + sorted[n ÷ 2 + 1]) / 2
    end
end

println("\nCálculo manual (par): ", mediana_manual(dados_par))</code></pre>
  </div>
</div>

#### Saída esperada:
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>Dados (ímpar): [1, 3, 3, 6, 7, 8, 9]</div>
  <div>Mediana: 6.0</div>
  <div> </div>
  <div>Dados (par): [3, 5, 7, 9]</div>
  <div>Mediana: 6.0</div>
  <div> </div>
  <div>Cálculo manual (par): 6.0</div>
</div>

<div style="border-left: 4px solid #007BFF; padding: 0.5em; background-color: #e7f1ff;">
  <strong>🔎 Definição – Robustez:</strong> Na estatística, <strong>robustez</strong> refere-se à <em>capacidade de um estimador ou medida resistir à influência de dados atípicos (outliers)</em>.<br>
  Um método robusto continua fornecendo resultados confiáveis mesmo quando os dados contêm <strong>valores extremos</strong> ou <strong>pequenas violações das suposições</strong>, a <strong>mediana</strong>, por exemplo, é considerada uma medida robusta porque não é afetada por valores muito altos ou muito baixos.
</div>
<br>

Em situações com **valores distorcidos ou assimétricos**, a mediana é **mais representativa** do que a média.

---

#### Mediana na Estatística Robusta

A mediana possui um **ponto de ruptura de 50%**, o que significa que **até metade dos dados pode estar contaminada** (com erros ou valores extremos) sem que a mediana seja afetada significativamente.

Isso torna a mediana essencial em áreas como:
- Análise de renda (ex: evitar distorções por bilionários)
- Avaliação de preços
- Bioestatística

---

#### Comparação: Mediana vs. Média

| Característica        | Mediana                     | Média                      |
|-----------------------|-----------------------------|----------------------------|
| Sensível a outliers   | ❌ Não                      | ✅ Sim                     |
| Simples de calcular   | ✅ Sim (dados ordenados)    | ✅ Sim                     |
| Robustez              | ✅ Alta                     | ❌ Baixa                   |
| Aplicações            | Dados assimétricos, rendas  | Dados simétricos, normais |

---

### 📜 História da Mediana

A **mediana** é uma medida estatística que representa o valor central de um conjunto ordenado de dados. Apesar de seu uso generalizado hoje, sua origem e formalização ocorreram ao longo de séculos.

#### 🔹 Origem Antiga

A ideia de um "valor do meio" em um conjunto de dados aparece de forma implícita desde a Antiguidade, em contextos ligados à justiça, divisão proporcional e decisões imparciais. Contudo, **não havia uma formulação matemática clara da mediana** nesse período.

#### 🔹 Século XVII: Primeiros Passos Formais

A primeira menção mais próxima ao conceito moderno da mediana aparece nos escritos do **astrônomo e matemático Christiaan Huygens** (1629–1695). Ele considerou a ideia de um ponto central como uma alternativa à média em situações envolvendo **observações ruidosas**.

#### 🔹 Século XVIII: Desenvolvimento com Laplace

Foi **Pierre-Simon Laplace** (1749–1827), matemático francês, quem formalizou a ideia da mediana como uma ferramenta estatística robusta. Laplace utilizou a mediana como uma alternativa à média aritmética quando os dados continham **erros extremos**, como no problema de estimação da posição verdadeira de um astro a partir de várias observações imprecisas.

> Laplace mostrou que a mediana minimiza a soma dos desvios absolutos:

$$
\text{Mediana} = \underset{m}{\arg\min} \sum_{i=1}^{n} \left| x_i - m \right|
$$

- $x_i$ são os valores dos dados,
- $m$ é o valor candidato à mediana,
- $\arg\min$ indica o valor de $m$ que minimiza a soma,
- $
\sum \left| x_i - m \right|
$ é a soma das distâncias absolutas entre os dados e $m$.

Essa definição mostra por que a mediana é **resistente a outliers**: ela minimiza as distâncias absolutas, ao contrário da média que minimiza os quadrados dos desvios.


**Referência**:  
Laplace, P.S. (1812). *Théorie Analytique des Probabilités*. Paris.

#### 🔹 Século XIX: Consolidação da Mediana como Medida Estatística

Durante o século XIX, a mediana começou a ser reconhecida como uma **medida de tendência central** distinta da média e da moda. Foi estudada principalmente em contextos onde **a média era distorcida por outliers**.

<div style="float: right; margin: 0 0 15px 20px; text-align: center;">
  <img src="{{ site.baseurl }}/assets/images/FrancisGalton.jpg" alt="Francis Galton" style="max-width: 200px; border-radius: 5px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"/>
  <p style="font-size: 0.8em; margin-top: 5px; color: #666;">Sir Francis Galton (1822-1911)</p>
</div>

**Francis Galton** (1822–1911), estatístico britânico e primo de Charles Darwin, popularizou o uso da mediana em **estudos de características humanas**, como altura e inteligência.

> Galton também desenvolveu o conceito de **percentis**, com a mediana sendo o percentil 50.

**Referência**:  
Galton, F. (1881). *The Visions of Sane Persons*. *Fortnightly Review*, 29, 707–717.

#### 🔹 Século XX em diante: Uso Amplo e Estatística Robusta

Com o avanço da **estatística robusta**, especialmente a partir da década de 1960, a mediana ganhou grande destaque como uma alternativa **resistente a valores extremos**.

<div style="float: left; margin: 0 20px 15px 0; text-align: center;">
  <img src="{{ site.baseurl }}/assets/images/JohnTukey.jpg" alt="John Tukey" style="max-width: 200px; border-radius: 5px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"/>
  <p style="font-size: 0.8em; margin-top: 5px; color: #666;">John W. Tukey (1915-2000)</p>
</div>

**John Tukey** foi um dos grandes defensores da mediana e da estatística robusta.

**Referência**:  
Tukey, J.W. (1960). *A survey of sampling from contaminated distributions*. In *Contributions to Probability and Statistics* (I. Olkin et al., Eds.). Stanford University Press.
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>

## 3. Moda

A **moda** é o valor que ocorre com maior frequência em um conjunto de dados. Diferente da média e da mediana, a moda pode ser usada tanto para dados numéricos quanto para dados categóricos.

### Definição Matemática

Para um conjunto de dados $X = \{x_1, x_2, ..., x_n\}$, a moda é o valor $x_i$ que maximiza a função de frequência:

$$
\text{Moda} = \arg\max_{x} \, f(x)
$$

onde $f(x)$ é o número de vezes que o valor $x$ aparece no conjunto de dados.

### Propriedades da Moda

- **Não é afetada por valores extremos**
- **Pode haver mais de uma moda** (bimodal, trimodal, etc.)
- **Útil para dados qualitativos** (categóricos)
- **Pode não existir** se todos os valores tiverem a mesma frequência

### Exemplos Práticos

#### Exemplo 1: Dados Numéricos Únicos

Conjunto de dados: $\{1, 2, 2, 3, 4, 4, 4, 5\}$  
**Moda = 4** (ocorre 3 vezes)

#### Exemplo 2: Dados Categóricos

Cores de carros em um estacionamento:  
Vermelho, Azul, Azul, Verde, Vermelho, Preto, Preto, Preto  
**Moda = Preto** (ocorre 3 vezes)

#### Exemplo 3: Dados Bimodais

Idades em uma turma:  
$\{18, 19, 19, 19, 20, 21, 22, 22, 22, 23\}$  
**Modas = 19 e 22** (ambos ocorrem 3 vezes)

### 💻 Exemplo em Julia

Vamos calcular a moda em Julia:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code># Carregando o pacote StatsBase para a função mode
using StatsBase

# Exemplo 1: Dados Numéricos Únicos
dados1 = [1, 2, 2, 3, 4, 4, 4, 5]
moda1 = mode(dados1)
println("Dados 1: ", dados1)
println("Moda: ", moda1)

# Exemplo 2: Dados Categóricos
cores = ["Vermelho", "Azul", "Azul", "Verde", "Vermelho", "Preto", "Preto", "Preto"]
moda_cores = mode(cores)
println("\nCores: ", cores)
println("Moda: ", moda_cores)

# Exemplo 3: Dados Bimodais
function encontrar_modas(v)
    contagem = countmap(v)  # Conta a frequência de cada valor
    max_contagem = maximum(values(contagem))
    modas = [k for (k, v) in contagem if v == max_contagem]
    return length(modas) > 1 ? modas : modas[1]
end

idades = [18, 19, 19, 19, 20, 21, 22, 22, 22, 23]
modas_idades = encontrar_modas(idades)
println("\nIdades: ", idades)
println("Moda(s): ", modas_idades)

# Exemplo 4: Sem moda (todos os valores são únicos)
sem_moda = [1, 2, 3, 4, 5]
println("\nDados sem moda: ", sem_moda)
println("Função mode retorna (primeiro elemento): ", mode(sem_moda))</code></pre>
  </div>
</div>

#### Saída esperada:
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>Dados 1: [1, 2, 2, 3, 4, 4, 4, 5]</div>
  <div>Moda: 4</div>
  <div> </div>
  <div>Cores: ["Vermelho", "Azul", "Azul", "Verde", "Vermelho", "Preto", "Preto", "Preto"]</div>
  <div>Moda: Preto</div>
  <div> </div>
  <div>Idades: [18, 19, 19, 19, 20, 21, 22, 22, 22, 23]</div>
  <div>Moda(s): [19, 22]</div>
  <div> </div>
  <div>Dados sem moda: [1, 2, 3, 4, 5]</div>
  <div>Função mode retorna (primeiro elemento): 1</div>
</div>

#### Observações:
- A função `mode` do pacote `StatsBase` retorna a primeira moda encontrada
- Para conjuntos multimodais, implementamos uma função `encontrar_modas` que retorna todas as modas
- Em conjuntos sem moda (todos os valores são únicos), a função `mode` retorna o primeiro elemento
- Para dados categóricos, a função funciona da mesma forma que para dados numéricos

### Contexto Histórico

<div style="float: right; margin: 0 0 15px 20px; text-align: center;">
  <img src="{{ site.baseurl }}/assets/images/KarlPearson.jpg" alt="Karl Pearson" style="max-width: 200px; border-radius: 5px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"/>
  <p style="font-size: 0.8em; margin-top: 5px; color: #666;">Karl Pearson (1857-1936)</p>
</div>

O conceito de moda tem raízes antigas, mas foi formalizado no século XIX juntamente com outras medidas de tendência central. Karl Pearson foi um dos primeiros a destacar a importância da moda na análise estatística, especialmente para distribuições assimétricas.

**Referência**:  
Pearson, K. (1895). *Contributions to the Mathematical Theory of Evolution. II. Skew Variation in Homogeneous Material*. Philosophical Transactions of the Royal Society of London. (A), 186, 343-414.

### Vantagens e Desvantagens

| Vantagens | Desvantagens |
|-----------|--------------|
| Fácil de entender | Pode não ser única |
| Útil para dados categóricos | Pode não existir |
| Não é afetada por valores extremos | Pode não representar bem o centro dos dados |
| Pode ser usada em qualquer escala de medição | Pode não refletir mudanças nos dados |

### Quando Usar a Moda

- Dados categóricos (cores, tipos, categorias)
- Identificar o valor mais comum em uma distribuição
- Quando os dados têm múltiplos picos (distribuições multimodais)
- Análise inicial rápida de dados

### Aplicações Práticas

1. **Varejo**: Identificar produtos mais vendidos
2. **Pesquisas de opinião**: Descobrir a resposta mais frequente
3. **Controle de qualidade**: Encontrar defeitos mais comuns
4. **Demografia**: Identificar faixas etárias mais comuns
5. **Meteorologia**: Determinar a temperatura mais frequente em um período

---

## Referências Bibliográficas

1. Laplace, P.S. (1812). *Théorie Analytique des Probabilités*. Paris.
2. Galton, F. (1881). *The Visions of Sane Persons*. *Fortnightly Review*, 29, 707–717.
3. Tukey, J.W. (1960). *A Survey of Sampling from Contaminated Distributions*. Stanford University Press.
4. Hald, A. (1998). *A History of Mathematical Statistics from 1750 to 1930*. Wiley.
5. Stigler, S.M. (1986). *The History of Statistics: The Measurement of Uncertainty before 1900*. Harvard University Press.


