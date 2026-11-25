---
layout: page
title: Estatística Descritiva
lang: pt
ref: estatistica-descritiva
order: 1
mathjax: true
description: "O que é Estatística Descritiva: média, mediana, moda, amplitude, variância, desvio padrão e quartis, com exemplo resolvido passo a passo."
---

<style>
  .mk-hero {
    padding: 2rem;
    margin: 1.5rem 0 2rem;
    border-radius: 22px;
    background: linear-gradient(135deg, #fff8e8 0%, #f7e0c6 45%, #fffdf8 100%);
    border: 1px solid rgba(120, 72, 20, 0.12);
    box-shadow: 0 12px 30px rgba(80, 45, 10, 0.08);
  }

  .mk-hero h1 {
    margin-top: 0;
    color: #0b1f35;
    font-size: clamp(2rem, 4vw, 3rem);
    line-height: 1.1;
  }

  .mk-hero p {
    font-size: 1.08rem;
    color: #34495e;
    max-width: 760px;
    line-height: 1.75;
  }

  .mk-tag {
    display: inline-block;
    margin-bottom: 0.8rem;
    padding: 0.35rem 0.75rem;
    border-radius: 999px;
    background: #0b1f35;
    color: #fff8e8;
    font-size: 0.82rem;
    font-weight: 700;
    letter-spacing: 0.03em;
  }

  .mk-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
    gap: 1rem;
    margin: 1.5rem 0;
  }

  .mk-card {
    padding: 1.25rem;
    border-radius: 18px;
    background: var(--mk-surface);
    border: 1px solid var(--mk-border);
    box-shadow: 0 8px 22px rgba(11, 31, 53, 0.06);
    transition: transform 0.25s ease, box-shadow 0.25s ease;
  }

  .mk-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 14px 32px rgba(11, 31, 53, 0.1);
  }

  .mk-card h3 {
    margin-top: 0;
    color: var(--mk-ink);
  }

  .mk-card p {
    color: var(--mk-ink-soft);
    line-height: 1.65;
  }

  .mk-note {
    padding: 1.2rem 1.4rem;
    border-left: 5px solid #c47a2c;
    background: var(--mk-tint-warn);
    border-radius: 12px;
    margin: 1.5rem 0;
    color: var(--mk-ink);
  }

  .mk-formula {
    padding: 1.2rem;
    margin: 1.2rem 0;
    border-radius: 16px;
    background: var(--mk-surface-2);
    border: 1px solid var(--mk-border);
    overflow-x: auto;
  }

  .mk-table {
    width: 100%;
    border-collapse: collapse;
    margin: 1.4rem 0;
    overflow: hidden;
    border-radius: 14px;
    box-shadow: 0 8px 20px rgba(11, 31, 53, 0.06);
  }

  .mk-table th {
    background: #0b1f35;
    color: #fff8e8;
    text-align: left;
    padding: 0.85rem;
  }

  .mk-table td {
    padding: 0.85rem;
    border-bottom: 1px solid var(--mk-border);
    background: var(--mk-surface);
    color: var(--mk-ink);
  }

  .mk-table tr:last-child td {
    border-bottom: none;
  }

  .mk-quote {
    margin: 2rem 0;
    padding: 1.4rem 1.6rem;
    border-radius: 18px;
    background: #0b1f35;
    color: #fff8e8;
    font-size: 1.1rem;
    line-height: 1.7;
  }

  .mk-quote strong {
    color: #f7e0c6;
  }
</style>

<section class="mk-hero">
  <span class="mk-tag">ESTATÍSTICA • DADOS • INTERPRETAÇÃO</span>

  <h1>Estatística Descritiva</h1>

  <p>
    A <strong>Estatística Descritiva</strong> é o ramo da Estatística responsável por
    organizar, resumir, visualizar e interpretar dados. Antes de construir modelos,
    fazer previsões ou testar hipóteses, precisamos compreender o que os dados estão
    mostrando de maneira clara, objetiva e visualmente acessível.
  </p>
</section>

## O que é Estatística Descritiva?

A Estatística Descritiva é o primeiro contato entre o pesquisador e os dados.  
Ela não busca, necessariamente, fazer previsões ou generalizações para uma população inteira.  
Seu objetivo principal é **descrever o conjunto de dados observado**.

Em outras palavras, ela responde perguntas como:

- Qual é o valor típico dos dados?
- Os dados estão muito espalhados?
- Existem valores extremos?
- A distribuição é simétrica ou assimétrica?
- Quais padrões aparecem quando organizamos os dados em tabelas ou gráficos?

<div class="mk-note">
  <strong>Ideia central:</strong> antes de interpretar qualquer fenômeno, precisamos
  transformar dados brutos em informação compreensível.
</div>

---

## Por que a Estatística Descritiva é importante?

Imagine uma tabela com milhares de linhas contendo notas de alunos, tempos de atendimento,
valores de vendas ou medidas biológicas. Olhar diretamente para todos esses números pode ser
confuso e pouco produtivo.

A Estatística Descritiva resolve esse problema ao criar **resumos numéricos e visuais**.

<div class="mk-grid">

  <div class="mk-card">
    <h3>Organização</h3>
    <p>
      Os dados podem ser classificados, ordenados e agrupados em tabelas,
      facilitando a leitura inicial do fenômeno estudado.
    </p>
  </div>

  <div class="mk-card">
    <h3>Resumo</h3>
    <p>
      Medidas como média, mediana, moda, variância e desvio padrão ajudam
      a representar grandes conjuntos de dados com poucos números.
    </p>
  </div>

  <div class="mk-card">
    <h3>Visualização</h3>
    <p>
      Gráficos tornam padrões, tendências, dispersões e assimetrias muito
      mais fáceis de perceber.
    </p>
  </div>

  <div class="mk-card">
    <h3>Interpretação</h3>
    <p>
      A análise descritiva ajuda a transformar números em conclusões práticas,
      apoiando decisões em diferentes áreas.
    </p>
  </div>

</div>

---

## Principais medidas da Estatística Descritiva

A Estatística Descritiva costuma ser dividida em três grandes grupos de medidas:

1. **Medidas de tendência central**
2. **Medidas de dispersão**
3. **Medidas de posição**

Cada grupo revela um aspecto diferente do comportamento dos dados.

---

## 1. Medidas de tendência central

As medidas de tendência central indicam onde os dados parecem se concentrar.  
Elas tentam responder à pergunta:

> Qual valor representa bem esse conjunto de dados?

### Média aritmética

A média aritmética é uma das medidas mais conhecidas.  
Ela é obtida somando todos os valores e dividindo pela quantidade de observações.

<div class="mk-formula">

$$
\bar{x} = \frac{x_1 + x_2 + x_3 + \cdots + x_n}{n}
$$

</div>

Também podemos escrever:

<div class="mk-formula">

$$
\bar{x} = \frac{\sum_{i=1}^{n} x_i}{n}
$$

</div>

Onde:

- $$\bar{x}$$ representa a média da amostra (média amostral);
- $$x_i$$ representa cada valor observado;
- $$n$$ representa o número total de observações.

### Exemplo

Considere as notas:

$$
6,\ 7,\ 8,\ 9,\ 10
$$

A média será:

<div class="mk-formula">

$$
\bar{x} = \frac{6 + 7 + 8 + 9 + 10}{5}
$$

$$
\bar{x} = \frac{40}{5}
$$

$$
\bar{x} = 8
$$

</div>

Portanto, a média das notas é **8**.

---

### Mediana

A mediana é o valor que ocupa a posição central quando os dados estão ordenados.

Se o número de observações for ímpar, a mediana será o valor do meio.  
Se for par, será a média dos dois valores centrais.

#### Exemplo com quantidade ímpar

Dados:

$$
3,\ 5,\ 7,\ 9,\ 11
$$

A mediana é:

$$
7
$$

#### Exemplo com quantidade par

Dados:

$$
4,\ 6,\ 8,\ 10
$$

Os dois valores centrais são $$6$$ e $$8$$. Então:

<div class="mk-formula">

$$
Md = \frac{6 + 8}{2}
$$

$$
Md = 7
$$

</div>

---

### Moda

A moda é o valor que aparece com maior frequência em um conjunto de dados.

Exemplo:

$$
2,\ 3,\ 3,\ 4,\ 5,\ 5,\ 5,\ 6
$$

Nesse caso, a moda é:

$$
5
$$

porque o número 5 aparece 3 vezes, mais do que qualquer outro valor.

<div class="mk-note">
  Um conjunto de dados pode ter uma moda, mais de uma moda ou nenhuma moda.
</div>

---

## 2. Medidas de dispersão

Enquanto as medidas de tendência central mostram o “centro” dos dados, as medidas de dispersão mostram o quanto os dados estão espalhados.

Duas turmas podem ter a mesma média, mas comportamentos muito diferentes.

Por exemplo:

- Turma A: $$7,\ 7,\ 7,\ 7,\ 7$$
- Turma B: $$2,\ 5,\ 7,\ 9,\ 12$$

As duas têm exatamente a mesma média:

<div class="mk-formula">

$$
\bar{x}_A = \frac{7 + 7 + 7 + 7 + 7}{5} = \frac{35}{5} = 7
\qquad
\bar{x}_B = \frac{2 + 5 + 7 + 9 + 12}{5} = \frac{35}{5} = 7
$$

</div>

Mas na Turma A todos tiraram 7, e na Turma B as notas vão de 2 a 12. A média sozinha
não mostra essa diferença; as medidas de dispersão mostram. A amplitude, por exemplo,
é $$7 - 7 = 0$$ na Turma A e $$12 - 2 = 10$$ na Turma B.

---

### Amplitude

A amplitude é a diferença entre o maior e o menor valor observado.

<div class="mk-formula">

$$
A = x_{\max} - x_{\min}
$$

</div>

Exemplo:

$$
4,\ 6,\ 8,\ 10,\ 15
$$

Temos:

$$
x_{\max} = 15
$$

$$
x_{\min} = 4
$$

Logo:

<div class="mk-formula">

$$
A = 15 - 4 = 11
$$

</div>

---

### Variância

A variância mede o quanto os dados se afastam da média. Para calculá-la, subtraímos a
média de cada valor (esse é o **desvio** de cada valor), elevamos cada desvio ao quadrado
e tiramos uma espécie de média desses quadrados. Os desvios são elevados ao quadrado
porque, sem isso, os positivos e os negativos se cancelariam: a soma dos desvios em
relação à média é sempre zero.  
Quanto maior a variância, mais espalhados estão os valores.

Para uma população:

<div class="mk-formula">

$$
\sigma^2 = \frac{\sum_{i=1}^{N}(x_i - \mu)^2}{N}
$$

</div>

Para uma amostra:

<div class="mk-formula">

$$
s^2 = \frac{\sum_{i=1}^{n}(x_i - \bar{x})^2}{n - 1}
$$

</div>

Onde:

- $$\sigma^2$$ é a variância populacional;
- $$s^2$$ é a variância amostral;
- $$\mu$$ é a média populacional;
- $$\bar{x}$$ é a média amostral;
- $$N$$ é o tamanho da população e $$n$$, o tamanho da amostra.

Na amostra, dividimos por $$n - 1$$ e não por $$n$$. Isso corrige a tendência que a
variância calculada com $$n$$ teria de subestimar, em média, a variância da população.
A explicação completa está em [Medidas de Dispersão]({{ '/pt/estatistica-descritiva/dispersao' | relative_url }}).

---

### Desvio padrão

O desvio padrão é a raiz quadrada da variância.  
Ele é muito utilizado porque volta para a mesma unidade dos dados originais.

<div class="mk-formula">

$$
s = \sqrt{s^2} \qquad \text{(amostra)} \qquad\qquad \sigma = \sqrt{\sigma^2} \qquad \text{(população)}
$$

</div>

Se a variância está em “pontos ao quadrado”, o desvio padrão volta a ser medido em “pontos”.

<div class="mk-note">
  O desvio padrão é uma das medidas mais importantes da Estatística Descritiva,
  pois ajuda a entender a estabilidade ou instabilidade de um conjunto de dados.
</div>

---

## 3. Medidas de posição

As medidas de posição indicam a localização relativa de um valor dentro do conjunto de dados.

As principais são:

- os **quartis** ($$Q_1$$, $$Q_2$$, $$Q_3$$) dividem os dados ordenados em quatro partes;
- os **decis** ($$D_1$$ a $$D_9$$) dividem em dez partes;
- os **percentis** ($$P_1$$ a $$P_{99}$$) dividem em cem partes. O percentil 90, por exemplo,
  é o valor que deixa cerca de 90% dos dados abaixo dele.

Assim, $$Q_1 = P_{25}$$, $$Q_2 = D_5 = P_{50}$$ e $$Q_3 = P_{75}$$.

### Quartis

Os quartis dividem os dados ordenados em quatro partes, cada uma com cerca de 25% dos dados.

<table class="mk-table">
  <thead>
    <tr>
      <th>Quartil</th>
      <th>Interpretação</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Q1</td>
      <td>Cerca de 25% dos dados estão abaixo desse valor.</td>
    </tr>
    <tr>
      <td>Q2</td>
      <td>Cerca de 50% dos dados estão abaixo desse valor. É a mediana.</td>
    </tr>
    <tr>
      <td>Q3</td>
      <td>Cerca de 75% dos dados estão abaixo desse valor.</td>
    </tr>
  </tbody>
</table>

<div class="mk-note">
  <strong>Por que "cerca de"?</strong> Com poucos dados, nem sempre existe um valor que
  deixe exatamente 25% abaixo dele. Por isso há vários métodos para calcular quartis
  (Hyndman e Fan, 1996, descrevem nove), e programas diferentes podem dar valores um pouco
  diferentes para os mesmos dados. Ao relatar um quartil, diga qual método foi usado.
</div>

---

## Tabelas e gráficos na Estatística Descritiva

Além das medidas numéricas, a Estatística Descritiva usa gráficos para facilitar a interpretação.

<table class="mk-table">
  <thead>
    <tr>
      <th>Tipo de gráfico</th>
      <th>Uso principal</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Gráfico de barras</td>
      <td>Comparar categorias.</td>
    </tr>
    <tr>
      <td>Histograma</td>
      <td>Visualizar a distribuição de dados quantitativos.</td>
    </tr>
    <tr>
      <td>Boxplot</td>
      <td>Identificar mediana, quartis e possíveis valores extremos.</td>
    </tr>
    <tr>
      <td>Gráfico de linhas</td>
      <td>Analisar evolução ao longo do tempo.</td>
    </tr>
    <tr>
      <td>Gráfico de dispersão</td>
      <td>Observar relação entre duas variáveis quantitativas.</td>
    </tr>
  </tbody>
</table>

---

## Exemplo prático

Considere o tempo de atendimento, em minutos, de 8 pessoas (números ilustrativos, escolhidos
para a conta ficar simples). Vamos tratar essas 8 pessoas como uma **amostra** dos clientes
atendidos:

$$
5,\ 7,\ 8,\ 8,\ 10,\ 12,\ 15,\ 18
$$

### Média

<div class="mk-formula">

$$
\bar{x} = \frac{5 + 7 + 8 + 8 + 10 + 12 + 15 + 18}{8}
$$

$$
\bar{x} = \frac{83}{8}
$$

$$
\bar{x} = 10{,}375
$$

</div>

A média do tempo de atendimento é $$10{,}375$$ minutos (valor exato), ou
$$10{,}38$$ minutos arredondando para duas casas.

### Mediana

Como temos 8 valores, a mediana será a média entre o 4º e o 5º valores:

$$
8 \quad \text{e} \quad 10
$$

<div class="mk-formula">

$$
Md = \frac{8 + 10}{2}
$$

$$
Md = 9
$$

</div>

A mediana é:

$$
9 \text{ minutos}
$$

### Moda

O valor que mais se repete é:

$$
8
$$

Logo, a moda é:

$$
Mo = 8
$$

O valor 8 aparece 2 vezes; todos os outros aparecem 1 vez.

### Amplitude

O maior tempo é $$x_{\max} = 18$$ e o menor é $$x_{\min} = 5$$:

<div class="mk-formula">

$$
A = 18 - 5 = 13
$$

</div>

### Variância e desvio padrão

Como os dados são uma amostra, usamos a fórmula com $$n - 1 = 8 - 1 = 7$$ no denominador.
A média, calculada acima, é $$\bar{x} = 10{,}375$$. Cada linha da tabela mostra o desvio
$$x_i - \bar{x}$$ e o seu quadrado:

<table class="mk-table">
  <thead>
    <tr>
      <th>x<sub>i</sub></th>
      <th>x<sub>i</sub> − x̄</th>
      <th>(x<sub>i</sub> − x̄)²</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>5</td><td>5 − 10,375 = −5,375</td><td>28,890625</td></tr>
    <tr><td>7</td><td>7 − 10,375 = −3,375</td><td>11,390625</td></tr>
    <tr><td>8</td><td>8 − 10,375 = −2,375</td><td>5,640625</td></tr>
    <tr><td>8</td><td>8 − 10,375 = −2,375</td><td>5,640625</td></tr>
    <tr><td>10</td><td>10 − 10,375 = −0,375</td><td>0,140625</td></tr>
    <tr><td>12</td><td>12 − 10,375 = 1,625</td><td>2,640625</td></tr>
    <tr><td>15</td><td>15 − 10,375 = 4,625</td><td>21,390625</td></tr>
    <tr><td>18</td><td>18 − 10,375 = 7,625</td><td>58,140625</td></tr>
    <tr><td><strong>Soma</strong></td><td><strong>0</strong></td><td><strong>133,875</strong></td></tr>
  </tbody>
</table>

A soma dos desvios dá zero, como esperado. Agora dividimos a soma dos quadrados por 7:

<div class="mk-formula">

$$
s^2 = \frac{133{,}875}{7}
$$

$$
s^2 = 19{,}125 \text{ minutos}^2
$$

</div>

E tiramos a raiz quadrada:

<div class="mk-formula">

$$
s = \sqrt{19{,}125}
$$

$$
s \approx 4{,}37 \text{ minutos}
$$

</div>

### Interpretação

- Um atendimento típico leva por volta de 9 a 10 minutos: a mediana é 9 minutos e a média,
  10,375 minutos.
- A média ficou acima da mediana porque os dois tempos mais longos (15 e 18 minutos) puxam
  a média para cima. A mediana não se altera com eles: se o último tempo fosse 40 minutos
  em vez de 18, a mediana continuaria 9 minutos.
- O desvio padrão de cerca de 4,37 minutos diz que os tempos se afastam da média, tipicamente,
  em torno de 4 minutos para mais ou para menos.
- O que esses números **não** dizem: com só 8 atendimentos, eles descrevem esta amostra. Dizer
  que o tempo médio de **todos** os atendimentos é 10,375 minutos já é inferência, e exige as
  ferramentas da Inferência Estatística (como um intervalo de confiança).

---

## Média, mediana e moda: quando usar?

<table class="mk-table">
  <thead>
    <tr>
      <th>Medida</th>
      <th>Quando é mais útil?</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Média</td>
      <td>Quando os dados não possuem valores extremos muito fortes.</td>
    </tr>
    <tr>
      <td>Mediana</td>
      <td>Quando há valores muito altos ou muito baixos distorcendo a média.</td>
    </tr>
    <tr>
      <td>Moda</td>
      <td>Quando queremos identificar o valor mais frequente.</td>
    </tr>
  </tbody>
</table>

---

## Estatística Descritiva e análise exploratória

A Estatística Descritiva está diretamente ligada à **Análise Exploratória de Dados**, conhecida como EDA.

A ideia da análise exploratória é investigar os dados antes de aplicar modelos mais avançados.  
Nesse processo, procuramos:

- padrões;
- tendências;
- valores atípicos;
- erros de digitação;
- relações entre variáveis;
- possíveis hipóteses para estudos futuros.

<div class="mk-note">
  Uma boa análise estatística começa com uma boa descrição dos dados.
  Sem isso, qualquer modelo pode se tornar apenas uma fórmula aplicada sem contexto.
</div>

---

## Resumo geral

<table class="mk-table">
  <thead>
    <tr>
      <th>Categoria</th>
      <th>Principais ferramentas</th>
      <th>O que revela?</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Tendência central</td>
      <td>Média, mediana e moda</td>
      <td>O centro dos dados.</td>
    </tr>
    <tr>
      <td>Dispersão</td>
      <td>Amplitude, variância e desvio padrão</td>
      <td>O espalhamento dos dados.</td>
    </tr>
    <tr>
      <td>Posição</td>
      <td>Quartis, decis e percentis</td>
      <td>A localização relativa dos valores.</td>
    </tr>
    <tr>
      <td>Visualização</td>
      <td>Tabelas, gráficos, histogramas e boxplots</td>
      <td>A forma e os padrões dos dados.</td>
    </tr>
  </tbody>
</table>

---

<div class="mk-quote">
  <strong>Conclusão:</strong><br>
  A Estatística Descritiva é a base de toda análise de dados. Ela permite transformar
  observações isoladas em informação organizada, revelando padrões, tendências,
  variações e comportamentos que não seriam percebidos apenas olhando para os dados brutos.
</div>

## Para aprofundar

- [Medidas de Tendência Central]({{ '/pt/estatistica-descritiva/tendencia-central' | relative_url }}): média, mediana, moda e quando cada uma engana.
- [Medidas de Dispersão]({{ '/pt/estatistica-descritiva/dispersao' | relative_url }}): amplitude, variância, desvio padrão, coeficiente de variação e intervalo interquartil.
- [Gráficos Estatísticos]({{ '/pt/estatistica-descritiva/graficos' | relative_url }}): qual gráfico usar para cada tipo de dado.
- [Análise Exploratória de Dados]({{ '/pt/estatistica-descritiva/analise-exploratoria' | relative_url }}): como investigar um conjunto de dados antes de modelar.
- [Visualização de Dados]({{ '/pt/estatistica-descritiva/visualizacao' | relative_url }}): princípios para gráficos claros e honestos.

---

## Referências

1. Hyndman, R. J.; Fan, Y. (1996). Sample quantiles in statistical packages. *The American Statistician*, 50(4), 361–365. DOI: [10.1080/00031305.1996.10473566](https://doi.org/10.1080/00031305.1996.10473566).

### Para saber mais

- Bussab, W. O.; Morettin, P. A. (2023). *Estatística Básica*. 10. ed. Saraiva Uni.
- Triola, M. F. (2024). *Introdução à Estatística*. 14. ed. LTC.