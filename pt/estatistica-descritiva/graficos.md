---
layout: page
title: Gráficos Estatísticos
lang: pt
ref: graficos
parent: estatistica-descritiva
permalink: /pt/estatistica-descritiva/graficos
order: 3
mathjax: true
description: "Representações visuais para comunicar e interpretar dados estatísticos com clareza."
---

Os **gráficos estatísticos** são ferramentas visuais essenciais para a análise exploratória de dados. Eles permitem visualizar padrões, tendências, relações e anomalias que podem não ser óbvias em tabelas de dados brutos. Um bom gráfico pode comunicar informações complexas de forma clara e eficiente.

## Tipos de Gráficos e Quando Usar

1. **Gráficos para Variáveis Qualitativas**
   - Gráfico de Barras
   - Gráfico de Pizza
   - Gráfico de Rosca

2. **Gráficos para Variáveis Quantitativas**
   - Histograma
   - Boxplot (Diagrama de Caixa)
   - Gráfico de Densidade

3. **Gráficos para Relações entre Variáveis**
   - Gráfico de Dispersão (Scatter Plot)
   - Gráfico de Linhas
   - Mapa de Calor (Heatmap)

4. **Gráficos para Séries Temporais**
   - Gráfico de Linha Temporal
   - Gráfico de Área

Esta página detalha seis deles: barras, pizza, histograma, boxplot, dispersão e linha temporal.

---

<div style="border-left: 4px solid #4CAF50; padding: 0.5em; background-color: #e8f5e9;">
  <strong>📊 Princípios do Design Visual</strong><br>
  Um bom gráfico deve ser: <em>preciso, claro, eficiente e revelador</em>. Como resume Ben Shneiderman, um dos pioneiros da visualização de informação: “o objetivo da visualização é o <em>insight</em>, não as imagens” (em tradução livre; no original, “The purpose of visualization is insight, not pictures”; ver a <a href="https://medium.com/multiple-views-visualization-research-explained/the-purpose-of-visualization-is-insight-not-pictures-an-interview-with-visualization-pioneer-ben-beb15b2d8e9b">entrevista com Shneiderman</a> no blog <em>Multiple Views</em>).
</div>

---

## 1. Gráfico de Barras

O **gráfico de barras** é ideal para comparar categorias ou mostrar a distribuição de uma variável categórica.

### Quando Usar
- Comparar quantidades entre categorias distintas
- Mostrar a frequência de categorias
- Dados qualitativos ou quantitativos discretos

### Exemplo Prático

Considere o número de alunos por curso em uma faculdade (números ilustrativos):

| Curso | Alunos |
|---|---:|
| Engenharia | 120 |
| Medicina | 90 |
| Direito | 85 |
| Administração | 110 |
| **Total** | **405** |

<div style="text-align: center; margin: 1em 0;">
  <img src="{{ site.baseurl }}/assets/images/grafico-barras-cursos.png" alt="Gráfico de barras com o número de alunos por curso: Engenharia 120, Medicina 90, Direito 85 e Administração 110" style="max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 4px;">
  <p style="font-size: 0.8em; color: #666;">Figura 1: Número de alunos por curso. A altura de cada barra é o número de alunos; compare as alturas lendo o eixo vertical.</p>
</div>

**Leitura:** Engenharia tem o maior número de alunos (120) e Direito o menor (85). A diferença entre eles é $120 - 85 = 35$ alunos. Como todas as barras começam no zero, a altura é proporcional ao número de alunos: a barra de Engenharia é $120 / 85 \approx 1{,}41$ vez a de Direito.

### Vantagens e Limitações

**Vantagens:**
- Fácil de interpretar
- Bom para comparar categorias
- Funciona bem com poucas categorias

**Limitações:**
- Pode ficar poluído com muitas categorias
- Não mostra distribuição dentro das categorias

<div style="border-left: 4px solid #2196F3; padding: 0.5em; background-color: #e3f2fd; margin: 1em 0;">
  <strong>💡 Dica de Visualização</strong><br>
  Ordene as barras por valor para facilitar a comparação. Use cores consistentes e evite rótulos muito longos que podem se sobrepor. O eixo de um gráfico de barras deve começar no zero: cortar o eixo faz diferenças pequenas parecerem enormes.
</div>

---

## 2. Gráfico de Pizza

O **gráfico de pizza** (ou gráfico de setores) é um gráfico circular dividido em fatias que representam proporções de um todo. Cada fatia corresponde a uma categoria, e seu ângulo (e sua área) é proporcional à quantidade que representa.

### Quando Usar
- Mostrar proporções de um todo (quando as partes somam 100%)
- Comparar poucas categorias
- Comunicar rapidamente distribuições simples

### Exemplo Prático

Participação de cada sistema operacional nos acessos à internet feitos por celular no mundo, na média de 2023, segundo a StatCounter:

| Sistema | Participação |
|---|---:|
| Android | 70,37% |
| iOS | 29,06% |
| Outros (Samsung, KaiOS, Windows, Linux e demais) | 0,57% |
| **Total** | **100,00%** |

Fonte: StatCounter Global Stats, *Mobile Operating System Market Share Worldwide*, granularidade anual, 2023 ([gs.statcounter.com](https://gs.statcounter.com/os-market-share/mobile/worldwide)), acesso em 23 nov. 2026. A StatCounter mede a participação nas **páginas visitadas** em sites que usam o seu contador, não nas vendas de aparelhos.

Para desenhar a pizza, cada porcentagem vira um ângulo. O círculo tem 360°, então:

$$\text{ângulo} = \frac{\text{porcentagem}}{100} \times 360°$$

- Android: $\dfrac{70{,}37}{100} \times 360° = 0{,}7037 \times 360° = 253{,}332° \approx 253{,}3°$
- iOS: $\dfrac{29{,}06}{100} \times 360° = 0{,}2906 \times 360° = 104{,}616° \approx 104{,}6°$
- Outros: $\dfrac{0{,}57}{100} \times 360° = 0{,}0057 \times 360° = 2{,}052° \approx 2{,}1°$

Conferência: $253{,}332° + 104{,}616° + 2{,}052° = 360{,}000°$.

<div style="text-align: center; margin: 1em 0;">
  <img src="{{ site.baseurl }}/assets/images/grafico_pizza.png" alt="Gráfico de pizza: Android 70,4%, iOS 29,1% e outros 0,6% dos acessos por celular no mundo em 2023" style="max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 4px;">
  <p style="font-size: 0.8em; color: #666;">Figura 2: Sistemas operacionais móveis no mundo, média de 2023 (StatCounter). Na legenda, os valores estão arredondados para uma casa; por isso somam 100,1%.</p>
</div>

**Leitura:** a mensagem que a pizza passa bem é uma só: o Android responde por mais de dois terços do total ($70{,}37\% > 66{,}67\%$). Já a fatia "Outros", com 0,57%, quase não aparece — e comparar fatias pequenas a olho é justamente onde a pizza falha.

### Vantagens e Limitações

**Vantagens:**
- Fácil de entender para o público leigo
- Mostra claramente a relação parte-todo
- Visualmente atraente para apresentações

**Limitações:**
- Difícil comparar fatias de tamanho parecido
- Ineficiente para muitas categorias
- Dificulta comparações precisas

### O que os Estatísticos Pensam

<div style="border-left: 4px solid #FF9800; padding: 0.5em; background-color: #FFF3E0; margin: 1em 0;">
  <strong>🔍 John Tukey</strong><br>
  Conhecido como o "pai da análise exploratória de dados", Tukey criou gráficos pensados para mostrar a <em>distribuição</em> dos dados, como o boxplot e o diagrama de ramo e folhas, apresentados no livro <em>Exploratory Data Analysis</em> (1977). Uma pizza mostra só as proporções de cada categoria e não diz nada sobre como os valores se distribuem — por isso os gráficos de Tukey resolvem um problema diferente.
</div>

<div style="border-left: 4px solid #f44336; padding: 0.5em; background-color: #ffebee; margin: 1em 0;">
  <strong>❌ Edward Tufte</strong><br>
  No clássico <em>The Visual Display of Quantitative Information</em>, Tufte escreve que “uma tabela é quase sempre melhor do que um gráfico de pizza tolo; o único desenho pior do que um gráfico de pizza é vários deles, porque então o leitor precisa comparar quantidades espalhadas em desordem pelo espaço” (em tradução livre; no original: “A table is nearly always better than a dumb pie chart; the only worse design than a pie chart is several of them, for then the viewer is asked to compare quantities located in spatial disarray”).
</div>

<div style="border-left: 4px solid #2196F3; padding: 0.5em; background-color: #e3f2fd; margin: 1em 0;">
  <strong>📊 Stephen Few</strong><br>
  No artigo <em>Save the Pies for Dessert</em> (2007), Few argumenta que o gráfico de barras compara as mesmas informações com muito mais precisão do que a pizza. Ele reconhece na pizza uma única vantagem: mostrar a relação de cada parte com o todo.
</div>

<div style="border-left: 4px solid #4CAF50; padding: 0.5em; background-color: #e8f5e9; margin: 1em 0;">
  <strong>📈 Naomi Robbins</strong><br>
  Em <em>Creating More Effective Graphs</em> (2005), Robbins coloca o gráfico de pizza entre os gráficos comuns que têm limitações e recomenda alternativas em que os valores são lidos numa escala comum, como o gráfico de barras e o gráfico de pontos (<em>dot plot</em>).
</div>

### Alternativas Recomendadas

1. **Gráfico de Barras**: para comparações precisas entre categorias
2. **Gráfico de Barras Empilhadas**: para mostrar partes de um todo com mais categorias
3. **Gráfico de Área**: para mostrar mudanças nas proporções ao longo do tempo
4. **Gráfico de Waffle**: alternativa visualmente atraente para mostrar proporções

<div style="border-left: 4px solid #9c27b0; padding: 0.5em; background-color: #f3e5f5; margin: 1em 0;">
  <strong>💡 Quando Usar o Gráfico de Pizza?</strong><br>
  Apesar das críticas, o gráfico de pizza pode funcionar quando:
  <ul>
    <li>Você tem apenas 2 ou 3 categorias</li>
    <li>A mensagem é simples (ex.: "mais da metade", "dois terços")</li>
    <li>O público é leigo e está acostumado com esse formato</li>
    <li>O que importa é a relação de cada parte com o todo, não a comparação precisa entre as partes</li>
  </ul>
</div>

---

## 3. Histograma

O **histograma** mostra a distribuição de uma variável quantitativa contínua, agrupando os dados em intervalos (classes, ou *bins*).

### Quando Usar
- Visualizar a distribuição de dados contínuos
- Identificar tendência central e dispersão
- Detectar assimetria e outliers

### Exemplo Prático

Considere as notas de 100 alunos em uma prova, de 0 a 10, agrupadas em classes de 2 pontos (números ilustrativos):

| Classe de nota | Frequência (alunos) |
|---|---:|
| [0, 2) | 5 |
| [2, 4) | 15 |
| [4, 6) | 30 |
| [6, 8) | 35 |
| [8, 10] | 15 |
| **Total** | **100** |

A notação [4, 6) quer dizer "de 4 até 6, incluindo o 4 e excluindo o 6": um aluno com nota 6 entra na classe [6, 8). A última classe, [8, 10], inclui o 10.

Conferência do total: $5 + 15 + 30 + 35 + 15 = 100$ alunos.

<div style="text-align: center; margin: 1em 0;">
  <img src="{{ site.baseurl }}/assets/images/histograma.png" alt="Histograma das notas de 100 alunos em classes de 2 pontos: 5, 15, 30, 35 e 15 alunos" style="max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 4px;">
  <p style="font-size: 0.8em; color: #666;">Figura 3: Distribuição das notas dos 100 alunos. As barras se encostam porque as classes são contínuas.</p>
</div>

**Leitura:** a classe mais frequente é [6, 8), com 35 alunos. Somando as duas classes do meio, $30 + 35 = 65$ alunos — 65% da turma — tiraram entre 4 e 8. A cauda da esquerda (notas baixas) é mais comprida que a da direita, um sinal de leve assimetria à esquerda.

### Vantagens e Limitações

**Vantagens:**
- Mostra a forma da distribuição
- Identifica modas e assimetria
- Bom para grandes conjuntos de dados

**Limitações:**
- A escolha do número de classes afeta a interpretação
- Pode esconder detalhes importantes

<div style="border-left: 4px solid #9c27b0; padding: 0.5em; background-color: #f3e5f5; margin: 1em 0;">
  <strong>🔍 Regra de Sturges</strong><br>
  Uma regra prática para o número de classes $k$, proposta por Herbert Sturges (1926), é $k = 1 + \log_2(n)$, que costuma ser escrita com logaritmo na base 10 como $k \approx 1 + 3{,}322 \log_{10}(n)$, onde $n$ é o número de observações. O resultado é arredondado para um número inteiro de classes.
</div>

**Exemplo com os 100 alunos.** Aqui, $n = 100$.

1. Logaritmo na base 10: $\log_{10}(100) = 2$, porque $10^2 = 100$.
2. Multiplicação: $3{,}322 \times 2 = 6{,}644$.
3. Soma: $k = 1 + 6{,}644 = 7{,}644$.
4. Arredondamento: $k \approx 8$ classes.

Com 8 classes no intervalo de 0 a 10, cada classe teria largura $\dfrac{10 - 0}{8} = 1{,}25$ ponto. A Figura 3 usa 5 classes de 2 pontos porque números redondos são mais fáceis de ler — uma escolha legítima, mas que muda o desenho. É uma boa ilustração da limitação acima: o mesmo conjunto de dados pode parecer diferente com outra quantidade de classes. A regra de Sturges é só um ponto de partida, não uma regra obrigatória.

---

## 4. Boxplot (Diagrama de Caixa)

O **boxplot** resume a distribuição de uma variável quantitativa através de seus quartis, destacando a mediana e possíveis outliers.

### Quando Usar
- Comparar distribuições entre grupos
- Identificar valores atípicos
- Visualizar assimetria e dispersão

### Elementos do Boxplot

Na versão mais usada, proposta por Tukey, o boxplot tem cinco elementos (veja a Figura 4):

1. **A caixa**, que vai do primeiro quartil ($Q_1$) ao terceiro quartil ($Q_3$) e contém os 50% centrais dos dados.
2. **A linha dentro da caixa**, que marca a mediana ($Q_2$).
3. **As cercas**, que não aparecem desenhadas: ficam a $1{,}5 \times IQR$ abaixo de $Q_1$ e acima de $Q_3$, onde $IQR = Q_3 - Q_1$.
4. **Os bigodes**, que vão da caixa até o menor e o maior valor que ainda estão **dentro** das cercas.
5. **Os pontos isolados**, que são os valores **fora** das cercas: os outliers.

Há outras convenções (bigodes até o mínimo e o máximo, ou até certos percentis); quando ler um boxplot, confira qual foi usada.

### Exemplo Prático

Considere as idades dos participantes de um evento (números ilustrativos), resumidas assim:
- Menor valor dentro das cercas: 18
- $Q_1$: 22
- Mediana: 25
- $Q_3$: 30
- Maior valor dentro das cercas: 41
- Valores acima de 41: 45 e 50

Para saber se 45 e 50 são outliers, calculamos as cercas passo a passo:

1. Intervalo interquartil: $IQR = Q_3 - Q_1 = 30 - 22 = 8$.
2. Margem: $1{,}5 \times IQR = 1{,}5 \times 8 = 12$.
3. Cerca inferior: $Q_1 - 12 = 22 - 12 = 10$.
4. Cerca superior: $Q_3 + 12 = 30 + 12 = 42$.

Agora comparamos cada valor com as cercas: $45 > 42$ e $50 > 42$, então os dois são outliers. Já $41 \le 42$ e $18 \ge 10$, então 41 e 18 estão dentro das cercas e são os fins dos bigodes.

<div style="text-align: center; margin: 1em 0;">
  <img src="{{ site.baseurl }}/assets/images/boxplot.png" alt="Boxplot das idades: bigode de 18 a 22, caixa de 22 a 30 com a mediana em 25, bigode de 30 a 41 e dois outliers em 45 e 50" style="max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 4px;">
  <p style="font-size: 0.8em; color: #666;">Figura 4: Distribuição das idades dos participantes. Os pontos laranja (45 e 50) estão além da cerca superior, em 42.</p>
</div>

**Leitura:** metade dos participantes tem entre 22 e 30 anos (a caixa). A mediana, 25, está mais perto de $Q_1$ do que de $Q_3$ ($25 - 22 = 3$ contra $30 - 25 = 5$), e o bigode da direita é bem mais comprido que o da esquerda ($41 - 30 = 11$ contra $22 - 18 = 4$): a distribuição é assimétrica à direita, puxada por poucas pessoas mais velhas.

### Vantagens e Limitações

**Vantagens:**
- Mostra várias estatísticas em uma única visualização
- Eficiente para comparar grupos
- Boa visualização de outliers

**Limitações:**
- Pode esconder a forma da distribuição (duas modas, por exemplo, não aparecem)
- Menos intuitivo para leigos

<div style="border-left: 4px solid #ff9800; padding: 0.5em; background-color: #fff3e0; margin: 1em 0;">
  <strong>⚠️ Cuidado com Outliers</strong><br>
  Um valor fora das cercas $Q_1 - 1{,}5 \times IQR$ e $Q_3 + 1{,}5 \times IQR$ é um outlier <em>pelo critério do boxplot</em>. Isso não quer dizer que ele seja um erro: pode ser um dado legítimo e importante. Investigue antes de remover.
</div>

---

## 5. Gráfico de Dispersão (Scatter Plot)

O **gráfico de dispersão** mostra a relação entre duas variáveis quantitativas: cada ponto representa uma observação.

### Quando Usar
- Verificar correlação entre variáveis
- Identificar padrões e tendências
- Detectar valores atípicos

### Exemplo Prático

Relação entre horas de estudo e nota em uma prova (números ilustrativos):

| Aluno | Horas | Nota |
|---|---:|---:|
| A | 2 | 4,5 |
| B | 5 | 6,8 |
| C | 8 | 7,2 |
| … | … | … |

<div style="text-align: center; margin: 1em 0;">
  <img src="{{ site.baseurl }}/assets/images/scatter_plot.png" alt="Gráfico de dispersão de horas de estudo contra nota para 30 alunos, com uma reta de tendência crescente e r igual a 0,91" style="max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 4px;">
  <p style="font-size: 0.8em; color: #666;">Figura 5: Horas de estudo × nota, para 30 alunos: os três da tabela e mais 27 ilustrativos. A linha tracejada é a reta de mínimos quadrados.</p>
</div>

**Leitura:** os pontos sobem da esquerda para a direita — quem estudou mais horas tende a ter nota maior. Com os 30 alunos da figura, o coeficiente de correlação de Pearson é $r \approx 0{,}91$, uma relação linear positiva forte. Isso **não** prova que estudar mais causa a nota maior: o gráfico mostra associação, não causa.

### Vantagens e Limitações

**Vantagens:**
- Mostra a relação entre duas variáveis
- Identifica padrões e tendências
- Útil para grandes conjuntos de dados

**Limitações:**
- Com muitos dados, os pontos se sobrepõem e escondem onde há mais observações
- Difícil de interpretar com muitas variáveis

<div style="border-left: 4px solid #2196F3; padding: 0.5em; background-color: #e3f2fd; margin: 1em 0;">
  <strong>💡 Dica de Análise</strong><br>
  Adicione uma linha de tendência para destacar a relação entre as variáveis. O coeficiente de correlação de Pearson ($r$) quantifica a força e a direção da relação <em>linear</em>: ele pode ser perto de zero mesmo quando há uma relação forte, mas curva.
</div>

---

## 6. Gráfico de Linha Temporal

O **gráfico de linha temporal** mostra como uma variável quantitativa muda ao longo do tempo.

### Quando Usar
- Visualizar tendências temporais
- Comparar séries ao longo do tempo
- Identificar padrões sazonais

### Exemplo Prático

Vendas mensais de uma loja ao longo de um ano (números ilustrativos):

| Mês | Vendas (R$) |
|---|---:|
| Jan | 12.500 |
| Fev | 14.200 |
| Mar | 15.800 |
| … | … |
| Dez | 28.300 |

<div style="text-align: center; margin: 1em 0;">
  <img src="{{ site.baseurl }}/assets/images/linha_temporal.png" alt="Gráfico de linha das vendas mensais, subindo de 12,5 mil reais em janeiro para 28,3 mil reais em dezembro" style="max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 4px;">
  <p style="font-size: 0.8em; color: #666;">Figura 6: Vendas mensais ao longo do ano, em milhares de reais.</p>
</div>

**Leitura:** as vendas mais que dobraram no ano. De janeiro a dezembro, o aumento foi de $28.300 - 12.500 = 15.800$ reais, ou seja, $\dfrac{15.800}{12.500} = 1{,}264 = 126{,}4\%$. A única queda é de junho para julho.

### Vantagens e Limitações

**Vantagens:**
- Mostra claramente tendências ao longo do tempo
- Bom para séries temporais longas
- Fácil de interpretar

**Limitações:**
- Pode ficar poluído com muitas séries
- Sensível à escolha da escala do eixo Y

<div style="border-left: 4px solid #4caf50; padding: 0.5em; background-color: #e8f5e9; margin: 1em 0;">
  <strong>📈 Dica de Visualização</strong><br>
  Use marcas claras nos pontos de dados e linhas suaves para destacar a tendência geral. Considere usar áreas sombreadas para mostrar intervalos de confiança quando relevante.
</div>

---

## Escolhendo o Gráfico Adequado

| Tipo de Dados | Objetivo | Gráfico Recomendado |
|---------------|----------|---------------------|
| Categórico   | Comparar categorias | Barras ou Colunas |
| Categórico   | Proporções | Pizza ou Rosca (poucas categorias) |
| Quantitativo | Distribuição | Histograma ou Boxplot |
| Duas Variáveis Quantitativas | Relação | Dispersão (Scatter) |
| Temporal     | Tendência | Linha |
| Múltiplas Variáveis | Comparação | Múltiplas Linhas ou Barras Agrupadas |

---

## Boas Práticas em Visualização de Dados

1. **Simplicidade**: menos é mais. Evite elementos desnecessários.
2. **Precisão**: escalas devem ser proporcionais; em gráficos de barras, o eixo começa no zero.
3. **Consistência**: use as mesmas cores e estilos para os mesmos elementos.
4. **Legibilidade**: fontes claras e de tamanho adequado.
5. **Contexto**: inclua títulos, rótulos e a fonte dos dados.

<div style="border-left: 4px solid #f44336; padding: 0.5em; background-color: #ffebee; margin: 1em 0;">
  <strong>❌ Erros Comuns a Evitar</strong>
  <ul>
    <li>Gráficos 3D desnecessários que distorcem a percepção</li>
    <li>Escalas enganosas (eixos que não começam no zero sem justificativa)</li>
    <li>Muitas cores ou elementos que competem pela atenção</li>
    <li>Falta de rótulos, legendas ou fonte dos dados</li>
  </ul>
</div>

---

## Ferramentas Recomendadas

- **Julia**: Plots.jl, Makie.jl, StatsPlots.jl
- **Python**: Matplotlib, Seaborn, Plotly
- **R**: ggplot2, plotly, lattice
- **Ferramentas Visuais**: Tableau, Power BI, Looker Studio (antigo Google Data Studio)
- **Online**: Datawrapper, Flourish, RAWGraphs

As figuras desta página foram geradas em Julia, com Plots.jl, pelo script `scripts/figuras-graficos.jl` do repositório do site.

---

## Referências

1. Cairo, A. (2016). *The Truthful Art: Data, Charts, and Maps for Communication*. New Riders.
2. Few, S. (2007). Save the Pies for Dessert. *Visual Business Intelligence Newsletter*, Perceptual Edge, ago. 2007.
3. Few, S. (2012). *Show Me the Numbers: Designing Tables and Graphs to Enlighten*. 2. ed. Analytics Press.
4. Healy, K. (2018). *Data Visualization: A Practical Introduction*. Princeton University Press.
5. Nussbaumer Knaflic, C. (2015). *Storytelling with Data: A Data Visualization Guide for Business Professionals*. Wiley.
6. Robbins, N. B. (2005). *Creating More Effective Graphs*. Wiley-Interscience.
7. StatCounter Global Stats. *Mobile Operating System Market Share Worldwide*, 2023 (dados anuais). Disponível em: <https://gs.statcounter.com/os-market-share/mobile/worldwide>. Acesso em: 23 nov. 2026.
8. Sturges, H. A. (1926). The choice of a class interval. *Journal of the American Statistical Association*, 21(153), 65–66. DOI: [10.1080/01621459.1926.10502161](https://doi.org/10.1080/01621459.1926.10502161).
9. Tufte, E. R. (2001). *The Visual Display of Quantitative Information*. 2. ed. Graphics Press.
10. Tukey, J. W. (1977). *Exploratory Data Analysis*. Addison-Wesley.
