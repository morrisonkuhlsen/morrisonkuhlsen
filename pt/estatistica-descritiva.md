---
layout: page
title: Estatística Descritiva
lang: pt
ref: estatistica-descritiva
order: 1
mathjax: true
description: "Conceitos e ferramentas para descrever e resumir dados de forma clara e objetiva."
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
    background: #ffffff;
    border: 1px solid rgba(11, 31, 53, 0.08);
    box-shadow: 0 8px 22px rgba(11, 31, 53, 0.06);
    transition: transform 0.25s ease, box-shadow 0.25s ease;
  }

  .mk-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 14px 32px rgba(11, 31, 53, 0.1);
  }

  .mk-card h3 {
    margin-top: 0;
    color: #0b1f35;
  }

  .mk-card p {
    color: #4a5568;
    line-height: 1.65;
  }

  .mk-note {
    padding: 1.2rem 1.4rem;
    border-left: 5px solid #c47a2c;
    background: #fff7ed;
    border-radius: 12px;
    margin: 1.5rem 0;
    color: #3f2a14;
  }

  .mk-formula {
    padding: 1.2rem;
    margin: 1.2rem 0;
    border-radius: 16px;
    background: #f8fafc;
    border: 1px solid rgba(11, 31, 53, 0.08);
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
    border-bottom: 1px solid #e5e7eb;
    background: #ffffff;
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

- $$\bar{x}$$ representa a média;
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

porque o número 5 aparece mais vezes.

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

As duas podem ter média semelhante, mas a Turma B apresenta maior variação.

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

A variância mede o afastamento médio dos dados em relação à média.  
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
- $$\bar{x}$$ é a média amostral.

---

### Desvio padrão

O desvio padrão é a raiz quadrada da variância.  
Ele é muito utilizado porque volta para a mesma unidade dos dados originais.

<div class="mk-formula">

$$
s = \sqrt{s^2}
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

- quartis;
- decis;
- percentis.

### Quartis

Os quartis dividem os dados ordenados em quatro partes.

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
      <td>25% dos dados estão abaixo desse valor.</td>
    </tr>
    <tr>
      <td>Q2</td>
      <td>50% dos dados estão abaixo desse valor. É equivalente à mediana.</td>
    </tr>
    <tr>
      <td>Q3</td>
      <td>75% dos dados estão abaixo desse valor.</td>
    </tr>
  </tbody>
</table>

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

Considere o tempo de atendimento, em minutos, de 8 pessoas:

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

A média do tempo de atendimento é aproximadamente:

$$
10{,}38 \text{ minutos}
$$

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

> “A Estatística é a gramática da ciência.”  
> — Karl Pearson