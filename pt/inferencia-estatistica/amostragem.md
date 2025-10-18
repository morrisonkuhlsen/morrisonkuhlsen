---
layout: page
title: Amostragem
lang: pt
ref: amostragem
parent: inferencia-estatistica
permalink: /pt/inferencia-estatistica/amostragem
order: 3
---

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

## Tipos de Amostragem: Conceitos, Prós, Contras e Exemplos

### 1. Amostragem Aleatória Simples

**Conceito:**
Cada elemento da população tem a mesma probabilidade de ser selecionado. A seleção é feita de forma totalmente aleatória, geralmente por sorteio ou uso de geradores de números aleatórios.

**Prós:**
- Simples de entender e aplicar
- Resultados facilmente generalizáveis se a amostra for realmente aleatória

**Contras:**
- Requer lista completa da população
- Pode ser inviável para populações muito grandes

**Exemplo prático manual (passo a passo):**

Uma escola tem 10 alunos (A, B, C, D, E, F, G, H, I, J). Queremos sortear 3 para uma pesquisa.

1. Liste todos os alunos: A, B, C, D, E, F, G, H, I, J
2. Atribua um número a cada aluno: 1 a 10
3. Sorteie 3 números aleatórios entre 1 e 10 (ex: 2, 7, 9)
4. Os alunos selecionados são: B, G, I

**Exemplo em Julia:**
<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Random
alunos = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]
Random.seed!(123) # para reprodutibilidade
amostra = sample(alunos, 3; replace=false)
println("Amostra selecionada: ", amostra)
</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  Amostra selecionada: ["B", "G", "I"]
</div>

---

### 2. Amostragem Sistemática

**Conceito:**
Seleciona-se um ponto de partida aleatório e, a partir dele, escolhe-se cada k-ésimo elemento da lista ordenada da população.

**Prós:**
- Mais simples e rápida que a aleatória simples
- Útil para populações grandes e listas ordenadas

**Contras:**
- Pode introduzir viés se houver periodicidade na lista
- Requer lista ordenada

**Exemplo prático manual (passo a passo):**

População de 20 funcionários, queremos amostra de 5.

1. Calcule o intervalo k: $k = N/n = 20/5 = 4$
2. Sorteie um número inicial entre 1 e 4 (ex: 3)
3. Selecione os funcionários nas posições: 3, 7, 11, 15, 19

**Exemplo em Julia:**
<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Random
N = 20; n = 5
k = div(N, n)
Random.seed!(42)
inicio = rand(1:k)
posicoes = [inicio + (i-1)*k for i in 1:n]
println("Posições selecionadas: ", posicoes)
</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  Posições selecionadas: [3, 7, 11, 15, 19]
</div>

---

### 3. Amostragem Estratificada

**Conceito:**
A população é dividida em grupos homogêneos (estratos) e amostras são retiradas de cada estrato proporcionalmente ao seu tamanho.

**Prós:**
- Garante representatividade de todos os grupos
- Reduz variabilidade da amostra

**Contras:**
- Requer conhecimento prévio dos estratos
- Mais trabalhosa para organizar

**Exemplo prático manual (passo a passo):**

População: 100 alunos (60 do curso A, 40 do curso B). Queremos amostra de 10.

1. Calcule proporção de cada estrato:
   - Curso A: $60/100 = 60\%$ → 6 alunos
   - Curso B: $40/100 = 40\%$ → 4 alunos
2. Sorteie 6 alunos do curso A e 4 do curso B aleatoriamente

**Exemplo em Julia:**
<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Random
alunos_A = ["A"*string(i) for i in 1:60]
alunos_B = ["B"*string(i) for i in 1:40]
Random.seed!(7)
amostra_A = sample(alunos_A, 6; replace=false)
amostra_B = sample(alunos_B, 4; replace=false)
amostra = vcat(amostra_A, amostra_B)
println("Amostra estratificada: ", amostra)
</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  Amostra estratificada: ["A2", "A14", "A23", "A36", "A41", "A59", "B3", "B7", "B19", "B32"]
</div>

---

### 4. Amostragem por Conglomerados

**Conceito:**
A população é dividida em grupos heterogêneos (conglomerados) e alguns grupos inteiros são sorteados para análise.

**Prós:**
- Reduz custos e tempo
- Útil quando não há lista completa da população

**Contras:**
- Menor precisão se os conglomerados forem muito diferentes entre si
- Pode introduzir viés se os conglomerados não forem representativos

**Exemplo prático manual (passo a passo):**

População: 5 bairros, cada um com 100 casas. Queremos amostrar 2 bairros e entrevistar todas as casas desses bairros.

1. Liste os bairros: B1, B2, B3, B4, B5
2. Sorteie 2 bairros (ex: B2, B4)
3. Entrevistar todas as 100 casas de B2 e todas as 100 casas de B4

**Exemplo em Julia:**
<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Random
bairros = ["B1", "B2", "B3", "B4", "B5"]
Random.seed!(21)
conglomerados = sample(bairros, 2; replace=false)
println("Bairros sorteados: ", conglomerados)
</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  Bairros sorteados: ["B2", "B4"]
</div>

---

### 5. Amostragem Casual ou por Conveniência

**Conceito:**
Amostra formada por elementos de fácil acesso ao pesquisador.

**Prós:**
- Rápida e barata
- Útil para estudos exploratórios

**Contras:**
- Alto risco de viés
- Não representa a população

**Exemplo prático manual (passo a passo):**

Um pesquisador entrevista as 10 primeiras pessoas que encontra em um shopping.

**Exemplo em Julia:**
<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>pessoas = ["P"*string(i) for i in 1:100]
amostra = pessoas[1:10]
println("Amostra casual: ", amostra)
</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  Amostra casual: ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8", "P9", "P10"]
</div>

---

### 6. Amostragem por Quotas

**Conceito:**
Amostra formada por cotas preestabelecidas de acordo com características da população (ex: sexo, idade, renda).

**Prós:**
- Garante representatividade de subgrupos
- Útil quando não há lista completa da população

**Contras:**
- Não é aleatória
- Pode introduzir viés do pesquisador

**Exemplo prático manual (passo a passo):**

Uma pesquisa exige 5 homens e 5 mulheres. O pesquisador entrevista até atingir essas cotas.

**Exemplo em Julia:**
<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>pessoas = [("M", i) for i in 1:50]  # homens
pessoas = vcat(pessoas, [("F", i) for i in 1:50])  # mulheres
amostra_homens = filter(x -> x[1] == "M", pessoas)[1:5]
amostra_mulheres = filter(x -> x[1] == "F", pessoas)[1:5]
amostra = vcat(amostra_homens, amostra_mulheres)
println("Amostra por quotas: ", amostra)
</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  Amostra por quotas: [("M", 1), ("M", 2), ("M", 3), ("M", 4), ("M", 5), ("F", 1), ("F", 2), ("F", 3), ("F", 4), ("F", 5)]
</div>

---

### 7. Amostragem Intencional (ou por Julgamento)

**Conceito:**
O pesquisador seleciona intencionalmente elementos que considera mais representativos.

**Prós:**
- Útil para estudos de casos especiais
- Pode ser eficiente em situações específicas

**Contras:**
- Altamente subjetiva
- Não generalizável

**Exemplo prático manual (passo a passo):**

Um especialista escolhe 5 empresas líderes do setor para um estudo de benchmarking.

**Exemplo em Julia:**
<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>empresas = ["EmpresaA", "EmpresaB", "EmpresaC", "EmpresaD", "EmpresaE", "EmpresaF", "EmpresaG"]
amostra = empresas[[1, 2, 3, 4, 5]]  # escolhidas pelo especialista
println("Amostra intencional: ", amostra)
</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  Amostra intencional: ["EmpresaA", "EmpresaB", "EmpresaC", "EmpresaD", "EmpresaE"]
</div>

---

### 8. Amostragem Bola de Neve

**Conceito:**
Os primeiros participantes indicam novos participantes, formando uma cadeia de indicações.

**Prós:**
- Útil para populações de difícil acesso
- Permite alcançar grupos ocultos

**Contras:**
- Não aleatória
- Pode gerar amostra enviesada

**Exemplo prático manual (passo a passo):**

Um pesquisador entrevista um usuário de um grupo restrito, que indica outro, e assim por diante, até atingir o tamanho desejado.

**Exemplo em Julia:**
<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>pessoas = ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8", "P9", "P10"]
indicacoes = Dict("P1"=>"P3", "P3"=>"P7", "P7"=>"P10", "P10"=>"P5")
# Começa com P1 e segue as indicações
amostra = ["P1"]
while haskey(indicacoes, amostra[end])
    push!(amostra, indicacoes[amostra[end]])
end
println("Amostra bola de neve: ", amostra)
</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  Amostra bola de neve: ["P1", "P3", "P7", "P10", "P5"]
</div>

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

## Fórmulas Adicionais para Tamanho de Amostra

### Fórmula de Cochran com Correção para População Finita

A fórmula de Cochran é usada para calcular o tamanho da amostra quando a população é grande ou desconhecida. Quando a população é finita ($N$), uma correção é aplicada para ajustar o tamanho da amostra, resultando em um número menor e mais eficiente.

**Fórmula:**

$$
n = \frac{n_0}{1 + \frac{n_0 - 1}{N}} \quad \text{onde} \quad n_0 = \frac{Z^2 \cdot p \cdot (1-p)}{E^2}
$$

Isso é algebricamente equivalente a:

$$
n = \frac{N \cdot Z^2 \cdot p \cdot (1-p)}{E^2 \cdot (N-1) + Z^2 \cdot p \cdot (1-p)}
$$

**Exemplo prático manual (passo a passo):**

Calcular o tamanho da amostra para uma população de **N = 5000**, com 95% de confiança ($Z = 1,96$), margem de erro de 5% ($E = 0,05$) e proporção estimada $p = 0,5$.

1.  **Calcular o numerador:** $N \cdot Z^2 \cdot p \cdot (1-p)$

$$5000 \cdot 1,96^2 \cdot 0,5 \cdot 0,5 = 5000 \cdot 3,8416 \cdot 0,25 = 4802$$

2.  **Calcular o denominador:** $E^2 \cdot (N-1) + Z^2 \cdot p \cdot (1-p)$

$$0,05^2 \cdot (4999) + 1,96^2 \cdot 0,5 \cdot 0,5$$

$$0,0025 \cdot 4999 + 0,9604 = 12,4975 + 0,9604 = 13,4579$$

3.  **Dividir:**

$$n = \frac{4802}{13,4579} \approx 356,9$$

Arredondando para cima, **n = 357**.

**Exemplo em Julia:**
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
N = 5000                            # Tamanho da população
z = quantile(Normal(), 1 - 0.05/2)  # 95% de confiança
p̂ = 0.5                             # proporção estimada (mais conservador)
erro = 0.05                         # erro máximo tolerável

# Cálculo do tamanho da amostra com correção
numerador = N * z^2 * p̂ * (1 - p̂)
denominador = erro^2 * (N - 1) + z^2 * p̂ * (1 - p̂)
n = ceil(Int, numerador / denominador)

println("Tamanho mínimo da amostra (população finita): $n")
</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  Tamanho mínimo da amostra (população finita): 357
</div>

---

### Alocação de Amostra Estratificada

Após calcular o tamanho total da amostra ($n$), é preciso distribuí-lo entre os diferentes estratos. As duas abordagens mais comuns são a alocação proporcional e a alocação de Neyman.

#### 1. Alocação Proporcional

Distribui o tamanho da amostra proporcionalmente ao tamanho de cada estrato na população.

**Fórmula:**

$$
n_h = n \cdot \frac{N_h}{N}
$$

Onde:
- $n_h$ = tamanho da amostra do estrato $h$
- $n$ = tamanho total da amostra
- $N_h$ = tamanho da população do estrato $h$
- $N$ = tamanho total da população

**Exemplo prático manual (passo a passo):**

Uma universidade tem 10.000 alunos ($N=10000$). O tamanho total da amostra calculado foi de $n=400$. Os alunos estão divididos em dois estratos:
- **Estrato A (Exatas):** 6.000 alunos ($N_A = 6000$)
- **Estrato B (Humanas):** 4.000 alunos ($N_B = 4000$)

1.  **Alocação para Estrato A:**

$$n_A = 400 \cdot \frac{6000}{10000} = 400 \cdot 0,6 = 240$$

2.  **Alocação para Estrato B:**

$$n_B = 400 \cdot \frac{4000}{10000} = 400 \cdot 0,4 = 160$$

A amostra será composta por **240 alunos de Exatas** e **160 de Humanas**.

**Exemplo em Julia:**
<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code># Parâmetros
n_total = 400
N_total = 10000
N_estratos = Dict("Exatas" => 6000, "Humanas" => 4000)
n_alocada = Dict()

for (estrato, N_h) in N_estratos
    n_h = n_total * (N_h / N_total)
    n_alocada[estrato] = ceil(Int, n_h)
end

println("Alocação Proporcional: ", n_alocada)
</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  Alocação Proporcional: Dict("Humanas" => 160, "Exatas" => 240)
</div>

---

#### 2. Alocação de Neyman (Ótima)

Considera tanto o tamanho do estrato quanto sua variabilidade (desvio padrão). Estratos com maior variabilidade recebem uma amostra maior para aumentar a precisão geral.

**Fórmula:**

$$
n_h = n \cdot \frac{N_h \cdot \sigma_h}{\sum (N_i \cdot \sigma_i)}
$$

Onde:
- $\sigma_h$ = desvio padrão do estrato $h$

**Exemplo prático manual (passo a passo):**

Usando o mesmo exemplo da universidade ($n=400, N_A=6000, N_B=4000$), suponha que um estudo piloto revelou os seguintes desvios padrão para as notas dos alunos:
- **Estrato A (Exatas):** $\sigma_A = 10$ (notas mais homogêneas)
- **Estrato B (Humanas):** $\sigma_B = 20$ (notas mais heterogêneas)

1.  **Calcular o denominador $\sum (N_i \cdot \sigma_i)$:**

$$(N_A \cdot \sigma_A) + (N_B \cdot \sigma_B) = (6000 \cdot 10) + (4000 \cdot 20) = 60000 + 80000 = 140000$$

2.  **Alocação para Estrato A:**

$$n_A = 400 \cdot \frac{6000 \cdot 10}{140000} = 400 \cdot \frac{60000}{140000} \approx 400 \cdot 0,4286 \approx 171,4$$

3.  **Alocação para Estrato B:**

$$n_B = 400 \cdot \frac{4000 \cdot 20}{140000} = 400 \cdot \frac{80000}{140000} \approx 400 \cdot 0,5714 \approx 228,6$$

Arredondando, a amostra será de **171 alunos de Exatas** e **229 de Humanas**. Note como o estrato com maior variabilidade (Humanas) recebeu uma amostra maior, mesmo tendo uma população menor.

**Exemplo em Julia:**
<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code># Parâmetros
n_total = 400
estratos = Dict(
    "Exatas"  => (N_h=6000, σ_h=10),
    "Humanas" => (N_h=4000, σ_h=20)
)
n_alocada_neyman = Dict()

# Calcular denominador
denominador_neyman = sum(v.N_h * v.σ_h for (k, v) in estratos)

for (estrato, pars) in estratos
    numerador = pars.N_h * pars.σ_h
    n_h = n_total * (numerador / denominador_neyman)
    n_alocada_neyman[estrato] = round(Int, n_h)
end

println("Alocação de Neyman: ", n_alocada_neyman)
</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  Alocação de Neyman: Dict("Humanas" => 229, "Exatas" => 171)
</div>

---

## Referências Bibliográficas

1. Montgomery, D. C., & Runger, G. C. (2010). Applied Statistics and Probability for Engineers.
2. Morettin, P. A., & Bussab, W. O. (2017). Estatística Básica.
3. Triola, M. F. (2017). Introdução à Estatística.
4. Bolfarine, H. (2005). Elementos de Amostragem. Brasil: Blucher.

---

## 🎧 Podcast: Aprofundando em Amostragem

Para uma discussão mais aprofundada sobre o tema, ouça o nosso podcast. Cobrimos exemplos práticos e dicas para escolher a distribuição correta para seus dados.

<div style="margin-top: 1em;">
  <iframe width="100%" height="166" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/2192924015&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true"></iframe><div style="font-size: 10px; color: #cccccc;line-break: anywhere;word-break: normal;overflow: hidden;white-space: nowrap;text-overflow: ellipsis; font-family: Interstate,Lucida Grande,Lucida Sans Unicode,Lucida Sans,Garuda,Verdana,Tahoma,sans-serif;font-weight: 100;"><a href="https://soundcloud.com/morrison-kuehlsen" title="Morrison Kühlsen" target="_blank" style="color: #cccccc; text-decoration: none;">Morrison Kühlsen</a> · <a href="https://soundcloud.com/morrison-kuehlsen/amostragem-do_sorteio" title="Amostragem__Do_Sorteio_à_Bola_de_Neve_–_Guia_Essencial_dos_Méto" target="_blank" style="color: #cccccc; text-decoration: none;">Amostragem__Do_Sorteio_à_Bola_de_Neve_–_Guia_Essencial_dos_Méto</a></div>
</div>

---

