---
layout: page
title: Análise Exploratória de Dados
lang: pt
ref: analise-exploratoria
parent: estatistica-descritiva
permalink: /pt/estatistica-descritiva/analise-exploratoria
order: 4
mathjax: true
description: "Exploração inicial dos dados para descobrir padrões, detectar anomalias e formular hipóteses."
---

A **Análise Exploratória de Dados (AED)** é uma abordagem para analisar conjuntos de dados com o objetivo de resumir suas principais características, frequentemente com métodos visuais. Ela ajuda a entender os dados, identificar padrões, detectar anomalias e formular hipóteses.

### John Tukey e o Nascimento da AED

A Análise Exploratória de Dados, como a conhecemos hoje, tem suas raízes no trabalho de **John Wilder Tukey** (1915–2000), um dos estatísticos mais influentes do século XX.

#### Quem foi John Tukey?

- **Nascimento**: 16 de junho de 1915, em New Bedford, Massachusetts, EUA
- **Formação**: graduação (1936) e mestrado (1937) em Química pela Brown University, e doutorado em Matemática pela Princeton University (1939)
- **Carreira**: professor em Princeton e pesquisador dos Bell Labs
- **Palavras que ele deu à computação**: o termo **"bit"** (de *binary digit*) é atribuído a Tukey — a primeira vez que aparece impresso é no artigo de Claude Shannon de 1948, que dá o crédito a ele. Ele também é lembrado por ter usado a palavra **"software"** em 1958, no sentido de programas de computador — o primeiro uso impresso conhecido (Leonhardt, 2000).

### A Revolução da Análise Exploratória

Em 1977, Tukey publicou o livro **"Exploratory Data Analysis"**, que estabeleceu os fundamentos da AED. A ideia central é que a análise estatística não deveria se limitar a testar hipóteses já formuladas (a análise *confirmatória*): antes disso, é preciso explorar os dados para descobrir padrões inesperados e gerar novas hipóteses.

#### Princípios Fundamentais de Tukey:

1. **Ênfase na Visualização**: no livro de 1977, Tukey escreve que “o maior valor de uma imagem está em quando ela nos força a notar o que nunca esperávamos ver” (em tradução livre; no original: “The greatest value of a picture is when it forces us to notice what we never expected to see”).

2. **Resistência**: Tukey valorizava medidas *resistentes*, que não se deixam arrastar por poucos valores atípicos, como a mediana e os quartis — em vez de depender só da média e do desvio padrão.

3. **Exploração Ativa**: olhar os mesmos dados de vários jeitos, com perguntas e gráficos diferentes, antes de escolher um modelo.

4. **Ferramentas Novas**: ele criou ferramentas visuais que hoje são padrão, entre elas:
   - **Boxplot** (ou diagrama de caixa)
   - **Diagrama de ramo e folhas** (*stem-and-leaf plot*)
   - **Resumo dos cinco números** (*five-number summary*): mínimo, $Q_1$, mediana, $Q_3$ e máximo

### Impacto e Legado

A abordagem de Tukey teve um impacto profundo em diversos campos:

- **Ciência de Dados Moderna**: a AED é tratada como a primeira etapa de qualquer projeto de análise de dados.
- **Big Data**: com volumes grandes de dados, olhar antes de modelar ficou ainda mais importante.
- **Educação**: a AED é ensinada em cursos de estatística e de ciência de dados em todo o mundo.

### A AED Hoje

Embora os princípios continuem os mesmos, a AED evoluiu com a tecnologia:

- **Ferramentas Modernas**: linguagens como Python, R e Julia trazem os gráficos de Tukey em suas bibliotecas de visualização.
- **Visualizações Interativas**: ferramentas como Tableau e Power BI permitem explorar os dados de forma dinâmica.
- **Automação**: técnicas de aprendizado de máquina vêm sendo usadas para automatizar partes do processo exploratório.

Como resume Behrens (1997), a meta da AED é descobrir padrões nos dados e gerar hipóteses, não chegar a veredictos — os veredictos ficam para a análise confirmatória.

## Objetivos da Análise Exploratória

1. **Entender** a estrutura e distribuição dos dados
2. **Identificar** valores atípicos e anomalias
3. **Descobrir** padrões e relações entre variáveis
4. **Validar** suposições iniciais
5. **Preparar** os dados para análises mais avançadas

## Técnicas Básicas de AED

### 1. Estatísticas Descritivas

As medidas de tendência central e dispersão fornecem um resumo numérico dos dados:

- **Média, mediana e moda**
- **Amplitude, variância e desvio padrão**
- **Assimetria e curtose**

### 2. Visualizações Básicas

- **Histogramas**: Mostram a distribuição de uma variável contínua
- **Gráficos de caixa (boxplots)**: Mostram a distribuição e identificam outliers
- **Gráficos de dispersão**: Mostram a relação entre duas variáveis
- **Gráficos de barras**: Úteis para variáveis categóricas

## Exemplo Prático em Julia

Vamos realizar uma análise exploratória em um conjunto de dados de exemplo usando Julia. Usaremos o pacote `DataFrames` para manipulação de dados e `Plots` para visualização.

### Carregando os Pacotes

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code># Carregando os pacotes necessários
using DataFrames
using Statistics
using Plots

# Criando um conjunto de dados de exemplo com valores estáticos
function criar_dados_estudantes()
    # Dados estáticos para garantir reprodutibilidade
    nomes = ["Ana", "Carlos", "Maria", "João", "Julia", "Pedro", "Luiza", "Rafael"]
    idades = [18, 24, 20, 22, 19, 21, 23, 18]  # Idades fixas
    notas = [7, 6, 9, 8, 7, 5, 8, 6]  # Notas fixas
    horas_estudo = [17, 18, 15, 12, 19, 10, 14, 16]  # Horas de estudo fixas
    aprovado = [nota >= 7 ? "Sim" : "Não" for nota in notas]  # Calculado baseado nas notas fixas
    
    return DataFrame(
        Nome = nomes,
        Idade = idades,
        Nota = notas,
        HorasEstudo = horas_estudo,
        Aprovado = aprovado
    )
end

# Criando o DataFrame
df = criar_dados_estudantes()

# Visualizando as primeiras linhas
println("Primeiras linhas do conjunto de dados:")
df</code></pre>
  </div>
</div>

#### Saída esperada:
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>8×5 DataFrame</div>
  <div> Row │ Nome    Idade  Nota  HorasEstudo  Aprovado </div>
  <div>     │ String  Int64  Int64  Int64       String   </div>
  <div>─────┼───────────────────────────────────────────</div>
  <div>   1 │ Ana        18      7          17  Sim</div>
  <div>   2 │ Carlos     24      6          18  Não</div>
  <div>   3 │ Maria      20      9          15  Sim</div>
  <div>   4 │ João       22      8          12  Sim</div>
  <div>   5 │ Julia      19      7          19  Sim</div>
  <div>   6 │ Pedro      21      5          10  Não</div>
  <div>   7 │ Luiza      23      8          14  Sim</div>
  <div>   8 │ Rafael     18      6          16  Não</div>
</div>

### Estatísticas Descritivas

Vamos calcular algumas estatísticas descritivas básicas:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code># Estatísticas descritivas para colunas numéricas
function resumo_estatistico(df)
    println("Estatísticas Descritivas:")
    println("------------------------")
    
    for col in names(df)
        if eltype(df[!, col]) <: Number
            println("\nVariável: ", col)
            println("  Média: ", round(mean(skipmissing(df[!, col])), digits=2))
            println("  Mediana: ", median(skipmissing(df[!, col])))
            println("  Mínimo: ", minimum(skipmissing(df[!, col])))
            println("  Máximo: ", maximum(skipmissing(df[!, col])))
            println("  Desvio Padrão: ", round(std(skipmissing(df[!, col])), digits=2))
        end
    end
    
    # Contagem para variáveis categóricas
    println("\nContagem por categoria (Aprovado):")
    println(combine(groupby(df, :Aprovado), nrow => :Contagem))
end

resumo_estatistico(df)</code></pre>
  </div>
</div>

#### Saída esperada:
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>Estatísticas Descritivas:</div>
  <div>------------------------</div>
  <div> </div>
  <div>Variável: Idade</div>
  <div>  Média: 20.62</div>
  <div>  Mediana: 20.5</div>
  <div>  Mínimo: 18</div>
  <div>  Máximo: 24</div>
  <div>  Desvio Padrão: 2.26</div>
  <div> </div>
  <div>Variável: Nota</div>
  <div>  Média: 7.0</div>
  <div>  Mediana: 7.0</div>
  <div>  Mínimo: 5</div>
  <div>  Máximo: 9</div>
  <div>  Desvio Padrão: 1.31</div>
  <div> </div>
  <div>Variável: HorasEstudo</div>
  <div>  Média: 15.12</div>
  <div>  Mediana: 15.5</div>
  <div>  Mínimo: 10</div>
  <div>  Máximo: 19</div>
  <div>  Desvio Padrão: 3.04</div>
  <div> </div>
  <div>Contagem por categoria (Aprovado):</div>
  <div>2×2 DataFrame</div>
  <div> Row │ Aprovado  Contagem </div>
  <div>     │ String    Int64    </div>
  <div>─────┼────────────────────</div>
  <div>   1 │ Sim             5</div>
  <div>   2 │ Não             3</div>
</div>

#### Conferindo à mão: o desvio padrão das notas

A função `std` do Julia calcula o desvio padrão **amostral**, que divide por $n - 1$. Vamos refazer a conta das notas para ver de onde sai o 1,31.

**Dados:** as 8 notas são 7, 6, 9, 8, 7, 5, 8, 6, então $n = 8$.

**Passo 1 — média:**

$$\bar{x} = \frac{7 + 6 + 9 + 8 + 7 + 5 + 8 + 6}{8} = \frac{56}{8} = 7$$

**Passo 2 — desvio de cada nota em relação à média, e o quadrado do desvio:**

| Aluno | Nota $x_i$ | $x_i - \bar{x}$ | $(x_i - \bar{x})^2$ |
|---|---:|---:|---:|
| Ana | 7 | $7 - 7 = 0$ | 0 |
| Carlos | 6 | $6 - 7 = -1$ | 1 |
| Maria | 9 | $9 - 7 = 2$ | 4 |
| João | 8 | $8 - 7 = 1$ | 1 |
| Julia | 7 | $7 - 7 = 0$ | 0 |
| Pedro | 5 | $5 - 7 = -2$ | 4 |
| Luiza | 8 | $8 - 7 = 1$ | 1 |
| Rafael | 6 | $6 - 7 = -1$ | 1 |
| **Soma** | | $0$ | $12$ |

A soma dos desvios dá zero (sempre dá, quando se usa a média) — é por isso que se elevam os desvios ao quadrado.

**Passo 3 — variância amostral:**

$$s^2 = \frac{\sum (x_i - \bar{x})^2}{n - 1} = \frac{12}{8 - 1} = \frac{12}{7} \approx 1{,}7143$$

**Passo 4 — desvio padrão:**

$$s = \sqrt{s^2} = \sqrt{\frac{12}{7}} \approx 1{,}3093 \approx 1{,}31$$

**Interpretação:** em média, as notas se afastam cerca de 1,31 ponto da nota média 7. É o mesmo valor que o Julia mostrou.

### Visualização dos Dados

#### 1. Histograma das Notas

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code># Criando um histograma das notas
histogram(df.Nota, 
          bins=5, 
          xlabel="Notas", 
          ylabel="Frequência", 
          title="Distribuição das Notas",
          color=:steelblue,
          alpha=0.6,
          lw=0,
          legend=false,
          xlims=(4, 10),
          xticks=4:10)</code></pre>
  </div>
</div>

#### Saída do Histograma:

![Histograma das notas dos 8 alunos: uma nota 5, duas 6, duas 7, duas 8 e uma 9]({{ site.baseurl }}/assets/images/histograma_notas.png)

**Leitura:** as notas vão de 5 a 9. Uma nota 5, duas 6, duas 7, duas 8 e uma 9: a distribuição é simétrica em torno de 7, que é ao mesmo tempo a média e a mediana.

#### 2. Gráfico de Dispersão: Horas de Estudo vs Notas

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code># Criando um gráfico de dispersão
scatter(df.HorasEstudo, df.Nota,
        xlabel="Horas de Estudo",
        ylabel="Nota",
        title="Relação entre Horas de Estudo e Notas",
        color=:blue,
        legend=false,
        markersize=8,
        markercolor=:white,
        markerstrokecolor=:steelblue,
        markerstrokewidth=2,
        xlims=(8, 20),
        ylims=(4, 10),
        xticks=8:20,
        yticks=4:10)

# Adicionando uma linha de tendência
x_range = minimum(df.HorasEstudo):0.1:maximum(df.HorasEstudo)
coef = cov(df.HorasEstudo, df.Nota) / var(df.HorasEstudo)
intercept = mean(df.Nota) - coef * mean(df.HorasEstudo)
plot!(x_range, x -> intercept + coef * x, 
      linewidth=2, 
      linestyle=:dash, 
      color=:darkred,
      label="Linha de Tendência")</code></pre>
  </div>
</div>

#### Saída do Gráfico de Dispersão:

![Gráfico de dispersão das horas de estudo contra a nota dos 8 alunos, com uma reta de tendência quase horizontal]({{ site.baseurl }}/assets/images/grafico_dispersao.png)

A reta de tendência é quase horizontal: sobe só 0,03 ponto por hora de estudo. Para medir a força da relação linear, calculamos o coeficiente de correlação de Pearson:

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

horas = [17, 18, 15, 12, 19, 10, 14, 16]
notas = [7, 6, 9, 8, 7, 5, 8, 6]

println("Correlação entre horas e nota: ", round(cor(horas, notas), digits=2))</code></pre>
  </div>
</div>

#### Saída esperada:
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>Correlação entre horas e nota: 0.07</div>
</div>

#### Conferindo à mão: a correlação

A fórmula de Pearson é

$$r = \frac{\sum (x_i - \bar{x})(y_i - \bar{y})}{\sqrt{\sum (x_i - \bar{x})^2 \cdot \sum (y_i - \bar{y})^2}}$$

onde $x$ são as horas de estudo e $y$ as notas.

**Passo 1 — médias:**

$$\bar{x} = \frac{17 + 18 + 15 + 12 + 19 + 10 + 14 + 16}{8} = \frac{121}{8} = 15{,}125 \qquad \bar{y} = 7 \text{ (calculada acima)}$$

**Passo 2 — desvios, produtos e quadrados:**

| Aluno | $x_i$ | $y_i$ | $x_i - \bar{x}$ | $y_i - \bar{y}$ | $(x_i - \bar{x})(y_i - \bar{y})$ | $(x_i - \bar{x})^2$ | $(y_i - \bar{y})^2$ |
|---|---:|---:|---:|---:|---:|---:|---:|
| Ana | 17 | 7 | 1,875 | 0 | 0 | 3,515625 | 0 |
| Carlos | 18 | 6 | 2,875 | −1 | −2,875 | 8,265625 | 1 |
| Maria | 15 | 9 | −0,125 | 2 | −0,25 | 0,015625 | 4 |
| João | 12 | 8 | −3,125 | 1 | −3,125 | 9,765625 | 1 |
| Julia | 19 | 7 | 3,875 | 0 | 0 | 15,015625 | 0 |
| Pedro | 10 | 5 | −5,125 | −2 | 10,25 | 26,265625 | 4 |
| Luiza | 14 | 8 | −1,125 | 1 | −1,125 | 1,265625 | 1 |
| Rafael | 16 | 6 | 0,875 | −1 | −0,875 | 0,765625 | 1 |
| **Soma** | | | $0$ | $0$ | $2$ | $64{,}875$ | $12$ |

**Passo 3 — substituição na fórmula:**

$$r = \frac{2}{\sqrt{64{,}875 \times 12}} = \frac{2}{\sqrt{778{,}5}} = \frac{2}{27{,}9016\ldots} \approx 0{,}0717 \approx 0{,}07$$

**Interpretação:** $r \approx 0{,}07$ está muito perto de zero. Nestes 8 alunos, **não há relação linear** entre horas de estudo e nota: saber quantas horas um aluno estudou quase não ajuda a prever a nota dele.

Repare na coluna dos produtos: quase todo o positivo vem de um aluno só, o Pedro (10 horas, nota 5), com $+10{,}25$; os outros sete somam $2 - 10{,}25 = -8{,}25$. Sem o Pedro, a correlação dos outros sete alunos é $r \approx -0{,}60$ — negativa. Com tão poucos dados, um único aluno decide o sinal do resultado.

#### 3. Boxplot das Horas de Estudo por Status de Aprovação

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>using StatsPlots
# Criando um boxplot agrupado por aprovação
boxplot(df.Aprovado, df.HorasEstudo;
        xlabel="Aprovado",
        ylabel="Horas de Estudo",
        title="Distribuição de Horas de Estudo por Status de Aprovação",
        color=:steelblue,
        legend=false)</code></pre>
  </div>
</div>

#### Saída do Boxplot:

![Boxplots das horas de estudo dos alunos reprovados e aprovados, com medianas 16 e 15 horas]({{ site.baseurl }}/assets/images/boxplot_horas_estudo.png)

**Leitura:** os 3 reprovados (Carlos, Pedro e Rafael) estudaram 18, 10 e 16 horas, com mediana 16; os 5 aprovados (Ana, Maria, João, Julia e Luiza) estudaram 17, 15, 12, 19 e 14 horas, com mediana 15. Os aprovados não estudaram mais que os reprovados — o que combina com a correlação quase nula. Com 3 e 5 alunos, cada caixa é desenhada com pouquíssimos pontos, e o desenho muda bastante se um aluno mudar.

## Análise dos Resultados

Com base na análise exploratória, podemos tirar as seguintes conclusões:

1. **Distribuição das Notas**: as notas vão de 5 a 9, com média 7,0, mediana 7,0 e desvio padrão de 1,31 ponto; a distribuição é simétrica.
2. **Relação entre Variáveis**: nestes dados, **não há relação linear** entre horas de estudo e nota ($r \approx 0{,}07$). O pouco de correlação positiva que aparece vem de um único aluno; sem ele, a correlação fica negativa.
3. **Aprovação**: 5 dos 8 alunos foram aprovados (nota ≥ 7), ou seja, $\frac{5}{8} = 62{,}5\%$. Os aprovados não estudaram mais horas que os reprovados (medianas de 15 e 16 horas).
4. **Idade dos Alunos**: a idade média é $\frac{165}{8} = 20{,}625 \approx 20{,}6$ anos, de 18 a 24 anos, com desvio padrão de 2,26 anos.

<div style="border-left: 4px solid #ff9800; padding: 0.5em; background-color: #fff3e0; margin: 1em 0;">
  <strong>⚠️ O que este exemplo ensina</strong><br>
  Era de esperar que quem estuda mais tire nota maior — e estes dados <em>não</em> mostram isso. Esse é justamente o valor da análise exploratória: ela mostra o que os dados dizem, inclusive quando contrariam a expectativa. Com 8 alunos (dados inventados para o exemplo), nenhuma dessas conclusões vale para outros alunos; elas só descrevem este grupo.
</div>

## Próximos Passos

Com base nessa análise exploratória, poderíamos:

1. Coletar dados de muito mais alunos: com 8, um único aluno muda o sinal da correlação
2. Investigar o caso do Pedro (poucas horas e a menor nota) e o de alunos que estudaram muito e foram reprovados, como o Carlos
3. Com mais dados, testar se a relação entre horas e nota é estatisticamente significativa, e considerar outras variáveis (como a forma de estudar)

## Referências

1. Behrens, J. T. (1997). Principles and procedures of exploratory data analysis. *Psychological Methods*, 2(2), 131–160. DOI: [10.1037/1082-989X.2.2.131](https://doi.org/10.1037/1082-989X.2.2.131).
2. Shannon, C. E. (1948). A mathematical theory of communication. *The Bell System Technical Journal*, 27(3), 379–423. DOI: [10.1002/j.1538-7305.1948.tb01338.x](https://doi.org/10.1002/j.1538-7305.1948.tb01338.x).
3. Leonhardt, D. (2000, 28 jul.). John Tukey, 85, statistician; coined the word "software". *The New York Times*.
4. Tukey, J. W. (1977). *Exploratory Data Analysis*. Addison-Wesley.
5. Wickham, H.; Grolemund, G. (2016). *R for Data Science*. O'Reilly Media.
