---
layout: post
image: /assets/images/sd.avif
title: "Desvio padrão explicado sem mistério"
categories: [ESTATÍSTICA]
lang: pt
tags: [desvio padrão, variância, dispersão, estatística descritiva, estatística]
ref: desvio-padrao
author: dante-bertuzzi
description: "Entenda o que é o desvio padrão, como calculá-lo passo a passo, a diferença entre a versão populacional e amostral, e por que ele é a medida de dispersão mais usada na estatística."
mathjax: true
---

O desvio padrão é provavelmente a medida mais citada em relatórios, artigos e apresentações de dados — e também uma das mais mal interpretadas. Muitas pessoas sabem que ele "mede dispersão", mas não conseguem explicar o que isso significa de verdade, nem por que a fórmula tem aquela raiz quadrada.

Este post resolve isso de uma vez.

<figure style="display: flex; flex-direction: column; align-items: center; margin: 2.5em 0 2em 0;">
  <img src="/assets/images/sd.avif" alt="Ilustração do desvio padrão como medida de dispersão em torno da média" style="max-width: 80%; height: auto; border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.07);" />
  <figcaption class="img-caption-contrast">
    <strong>Figura:</strong> O desvio padrão quantifica o quanto os valores de um conjunto de dados se afastam da média.
  </figcaption>
</figure>

---

## O problema que o desvio padrão resolve

Imagine dois grupos de alunos com a mesma nota média:

<table style="width:100%; border-collapse: collapse; margin: 1.5em 0; font-size: 0.97em;">
  <thead>
    <tr style="background-color: #37474f; color: #fff;">
      <th style="padding: 10px 16px; text-align: left; border: 1px solid #cfd8dc;">Grupo</th>
      <th style="padding: 10px 16px; text-align: left; border: 1px solid #cfd8dc;">Notas</th>
      <th style="padding: 10px 16px; text-align: center; border: 1px solid #cfd8dc;">Média</th>
    </tr>
  </thead>
  <tbody>
    <tr style="background-color: #f5f5f5;">
      <td style="padding: 10px 16px; border: 1px solid #cfd8dc; font-weight: bold;">A</td>
      <td style="padding: 10px 16px; border: 1px solid #cfd8dc;">70, 70, 70, 70, 70</td>
      <td style="padding: 10px 16px; text-align: center; border: 1px solid #cfd8dc;">70</td>
    </tr>
    <tr style="background-color: #fff;">
      <td style="padding: 10px 16px; border: 1px solid #cfd8dc; font-weight: bold;">B</td>
      <td style="padding: 10px 16px; border: 1px solid #cfd8dc;">40, 55, 70, 85, 100</td>
      <td style="padding: 10px 16px; text-align: center; border: 1px solid #cfd8dc;">70</td>
    </tr>
  </tbody>
</table>

A média é idêntica, mas os grupos são completamente diferentes. No grupo A, todos tiraram exatamente 70. No grupo B, as notas variam de 40 a 100. Usar apenas a média para descrever esses grupos seria enganoso.

**O desvio padrão mede o quanto os valores se afastam da média.** Mais precisamente, ele é a raiz quadrada da média dos desvios ao quadrado — e não a média das distâncias absolutas (essa medida existe e se chama **desvio absoluto médio**). A distinção será explorada na próxima seção.

---

## Da ideia intuitiva à fórmula

A ideia mais direta seria calcular a média das diferenças entre cada valor e a média. Para o grupo B acima (média = 70):

<table style="width:100%; border-collapse: collapse; margin: 1.5em 0; font-size: 0.97em;">
  <thead>
    <tr style="background-color: #37474f; color: #fff;">
      <th style="padding: 10px 16px; text-align: center; border: 1px solid #cfd8dc;">Aluno</th>
      <th style="padding: 10px 16px; text-align: center; border: 1px solid #cfd8dc;">Nota (\(x_i\))</th>
      <th style="padding: 10px 16px; text-align: center; border: 1px solid #cfd8dc;">Diferença (\(x_i - \bar{x}\))</th>
    </tr>
  </thead>
  <tbody>
    <tr style="background-color: #f5f5f5;">
      <td style="padding: 10px 16px; text-align: center; border: 1px solid #cfd8dc;">1</td>
      <td style="padding: 10px 16px; text-align: center; border: 1px solid #cfd8dc;">40</td>
      <td style="padding: 10px 16px; text-align: center; border: 1px solid #cfd8dc; color: #c62828;">−30</td>
    </tr>
    <tr style="background-color: #fff;">
      <td style="padding: 10px 16px; text-align: center; border: 1px solid #cfd8dc;">2</td>
      <td style="padding: 10px 16px; text-align: center; border: 1px solid #cfd8dc;">55</td>
      <td style="padding: 10px 16px; text-align: center; border: 1px solid #cfd8dc; color: #c62828;">−15</td>
    </tr>
    <tr style="background-color: #f5f5f5;">
      <td style="padding: 10px 16px; text-align: center; border: 1px solid #cfd8dc;">3</td>
      <td style="padding: 10px 16px; text-align: center; border: 1px solid #cfd8dc;">70</td>
      <td style="padding: 10px 16px; text-align: center; border: 1px solid #cfd8dc;">0</td>
    </tr>
    <tr style="background-color: #fff;">
      <td style="padding: 10px 16px; text-align: center; border: 1px solid #cfd8dc;">4</td>
      <td style="padding: 10px 16px; text-align: center; border: 1px solid #cfd8dc;">85</td>
      <td style="padding: 10px 16px; text-align: center; border: 1px solid #cfd8dc; color: #2e7d32;">+15</td>
    </tr>
    <tr style="background-color: #f5f5f5;">
      <td style="padding: 10px 16px; text-align: center; border: 1px solid #cfd8dc;">5</td>
      <td style="padding: 10px 16px; text-align: center; border: 1px solid #cfd8dc;">100</td>
      <td style="padding: 10px 16px; text-align: center; border: 1px solid #cfd8dc; color: #2e7d32;">+30</td>
    </tr>
    <tr style="background-color: #eceff1; font-weight: bold;">
      <td style="padding: 10px 16px; text-align: center; border: 1px solid #cfd8dc;">Soma</td>
      <td style="padding: 10px 16px; text-align: center; border: 1px solid #cfd8dc;"></td>
      <td style="padding: 10px 16px; text-align: center; border: 1px solid #cfd8dc;">0</td>
    </tr>
  </tbody>
</table>

O problema: as diferenças positivas e negativas sempre se cancelam, e a soma é zero para qualquer conjunto de dados. Isso não é útil.

**Solução 1 — usar o valor absoluto:**

$$
\text{Desvio médio absoluto} = \frac{1}{n}\sum_{i=1}^{n} |x_i - \bar{x}|
$$

Essa medida existe e tem nome: chama-se **desvio absoluto médio (DAM)**. Funciona, mas o valor absoluto tem propriedades matemáticas inconvenientes: não é diferenciável em zero, o que dificulta o uso em otimização e em teoria estatística mais avançada.

**Solução 2 — elevar ao quadrado:**

Elevar ao quadrado também elimina os sinais, mas usa operações algébricas padrão. O resultado é a **variância**:

$$
\sigma^2 = \frac{1}{n}\sum_{i=1}^{n} (x_i - \mu)^2
$$

O único custo é que a variância está em unidades ao quadrado (por exemplo, notas² em vez de notas). Para voltar à unidade original, basta tirar a raiz quadrada — e esse é exatamente o **desvio padrão**.

---

## A fórmula do desvio padrão

Existem duas versões, dependendo do contexto.

### Desvio padrão populacional

Usado quando você tem **todos** os dados do grupo de interesse (a população inteira):

$$
\sigma = \sqrt{\frac{1}{N}\sum_{i=1}^{N} (x_i - \mu)^2}
$$

Onde:
- $N$ é o número total de elementos da população
- $\mu$ é a média da população
- $x_i$ é cada valor individual

### Desvio padrão amostral

Usado quando você tem apenas uma **amostra** e quer estimar a dispersão da população:

$$
s = \sqrt{\frac{1}{n-1}\sum_{i=1}^{n} (x_i - \bar{x})^2}
$$

Onde:
- $n$ é o tamanho da amostra
- $\bar{x}$ é a média da amostra

A única diferença está no denominador: $N$ na versão populacional e $n - 1$ na amostral. A razão dessa diferença — o famoso **denominador $n - 1$** — merece uma explicação própria.

---

## Por que $n - 1$ e não $n$?

Se você usa $\bar{x}$ (a média da amostra) no lugar de $\mu$ (a média da população), já está cometendo um pequeno erro: $\bar{x}$ é calculado a partir dos mesmos dados que estão sendo usados para medir a dispersão. Isso cria uma dependência que tende a **subestimar** a variabilidade real da população.

A correção matemática exata é dividir por $n - 1$ em vez de $n$. Esse ajuste é chamado de **correção de Bessel**, e garante que $s^2$ seja um **estimador não viesado** de $\sigma^2$ — ou seja, que em média (sobre muitas amostras possíveis) o estimador acerte o valor verdadeiro.

Outra forma de pensar: ao calcular $\bar{x}$, você "consome" 1 grau de liberdade dos dados. Dos $n$ valores, apenas $n - 1$ podem variar livremente depois que a média é fixada — o último valor fica determinado pelos demais. Por isso, divide-se por $n - 1$, não por $n$.

<div style="border-left: 4px solid #9C27B0; padding: 1em; background-color: #f3e5f5; margin: 1em 0; border-radius: 4px;">
  <h4 style="margin-top: 0;">Detalhe: $s^2$ é não viesado, mas $s$ não é</h4>
  <p>A variância amostral $s^2$ é um estimador <strong>não viesado</strong> de $\sigma^2$: $E(s^2) = \sigma^2$. No entanto, o desvio padrão amostral $s$ <em>não é</em> exatamente não viesado para $\sigma$: em geral, $E(s) \neq \sigma$. Isso decorre da não-linearidade da raiz quadrada (desigualdade de Jensen). Na prática, para amostras médias ou grandes, o viés de $s$ é pequeno e geralmente ignorado.</p>
</div>

<div style="border-left: 4px solid #2196F3; padding: 1em; background-color: #e3f2fd; margin: 1em 0; border-radius: 4px;">
  <h4 style="margin-top: 0;">Quando usar cada versão?</h4>
  <ul>
    <li><strong>$\sigma$ (populacional):</strong> quando você tem os dados de <em>toda</em> a população — por exemplo, as notas de todos os alunos de uma turma específica que você quer descrever, sem pretensão de generalizar.</li>
    <li><strong>$s$ (amostral):</strong> quando você quer <em>estimar</em> a dispersão de uma população maior a partir de uma amostra — situação muito mais comum na prática.</li>
  </ul>
</div>

---

## Cálculo passo a passo

Vamos calcular o desvio padrão amostral das notas do grupo B: **40, 55, 70, 85, 100**.

**Passo 1 — calcule a média amostral $\bar{x}$:**

$$
\bar{x} = \frac{40 + 55 + 70 + 85 + 100}{5} = \frac{350}{5} = 70
$$

**Passo 2 — calcule cada desvio ao quadrado $(x_i - \bar{x})^2$:**

<table style="width:100%; border-collapse: collapse; margin: 1.5em 0; font-size: 0.97em;">
  <thead>
    <tr style="background-color: #37474f; color: #fff;">
      <th style="padding: 10px 16px; text-align: center; border: 1px solid #cfd8dc;">\(x_i\)</th>
      <th style="padding: 10px 16px; text-align: center; border: 1px solid #cfd8dc;">\(x_i - \bar{x}\)</th>
      <th style="padding: 10px 16px; text-align: center; border: 1px solid #cfd8dc;">\((x_i - \bar{x})^2\)</th>
    </tr>
  </thead>
  <tbody>
    <tr style="background-color: #f5f5f5;">
      <td style="padding: 10px 16px; text-align: center; border: 1px solid #cfd8dc;">40</td>
      <td style="padding: 10px 16px; text-align: center; border: 1px solid #cfd8dc; color: #c62828;">−30</td>
      <td style="padding: 10px 16px; text-align: center; border: 1px solid #cfd8dc;">900</td>
    </tr>
    <tr style="background-color: #fff;">
      <td style="padding: 10px 16px; text-align: center; border: 1px solid #cfd8dc;">55</td>
      <td style="padding: 10px 16px; text-align: center; border: 1px solid #cfd8dc; color: #c62828;">−15</td>
      <td style="padding: 10px 16px; text-align: center; border: 1px solid #cfd8dc;">225</td>
    </tr>
    <tr style="background-color: #f5f5f5;">
      <td style="padding: 10px 16px; text-align: center; border: 1px solid #cfd8dc;">70</td>
      <td style="padding: 10px 16px; text-align: center; border: 1px solid #cfd8dc;">0</td>
      <td style="padding: 10px 16px; text-align: center; border: 1px solid #cfd8dc;">0</td>
    </tr>
    <tr style="background-color: #fff;">
      <td style="padding: 10px 16px; text-align: center; border: 1px solid #cfd8dc;">85</td>
      <td style="padding: 10px 16px; text-align: center; border: 1px solid #cfd8dc; color: #2e7d32;">+15</td>
      <td style="padding: 10px 16px; text-align: center; border: 1px solid #cfd8dc;">225</td>
    </tr>
    <tr style="background-color: #f5f5f5;">
      <td style="padding: 10px 16px; text-align: center; border: 1px solid #cfd8dc;">100</td>
      <td style="padding: 10px 16px; text-align: center; border: 1px solid #cfd8dc; color: #2e7d32;">+30</td>
      <td style="padding: 10px 16px; text-align: center; border: 1px solid #cfd8dc;">900</td>
    </tr>
    <tr style="background-color: #eceff1; font-weight: bold;">
      <td style="padding: 10px 16px; text-align: center; border: 1px solid #cfd8dc;">Soma</td>
      <td style="padding: 10px 16px; text-align: center; border: 1px solid #cfd8dc;"></td>
      <td style="padding: 10px 16px; text-align: center; border: 1px solid #cfd8dc;">2250</td>
    </tr>
  </tbody>
</table>

**Passo 3 — calcule a variância amostral $s^2$:**

$$
s^2 = \frac{2250}{5 - 1} = \frac{2250}{4} = 562{,}5
$$

**Passo 4 — tire a raiz quadrada:**

$$
s = \sqrt{562{,}5} \approx 23{,}72
$$

A raiz quadrada não é um detalhe algébrico: a variância $s^2 = 562{,}5$ está em **pontos²** — uma unidade sem interpretação direta no contexto de notas. A raiz devolve a medida para a escala original dos dados, resultando em **pontos**.

**Interpretação:** o desvio padrão das notas do grupo B é de **23,72 pontos**. Compare com o grupo A, onde o desvio padrão é **zero** — todas as notas são iguais à média.

---

## Desvio padrão e variância: qual a diferença?

Variância e desvio padrão medem a mesma coisa, mas em escalas diferentes:

<table style="width:100%; border-collapse: collapse; margin: 1.5em 0; font-size: 0.97em;">
  <thead>
    <tr style="background-color: #37474f; color: #fff;">
      <th style="padding: 10px 16px; text-align: left; border: 1px solid #cfd8dc;"></th>
      <th style="padding: 10px 16px; text-align: left; border: 1px solid #cfd8dc;">Variância (\(\sigma^2\) ou \(s^2\))</th>
      <th style="padding: 10px 16px; text-align: left; border: 1px solid #cfd8dc;">Desvio padrão (\(\sigma\) ou \(s\))</th>
    </tr>
  </thead>
  <tbody>
    <tr style="background-color: #f5f5f5;">
      <td style="padding: 10px 16px; border: 1px solid #cfd8dc; font-weight: bold;">Unidade</td>
      <td style="padding: 10px 16px; border: 1px solid #cfd8dc;">Unidade original ao quadrado</td>
      <td style="padding: 10px 16px; border: 1px solid #cfd8dc;">Mesma unidade dos dados</td>
    </tr>
    <tr style="background-color: #fff;">
      <td style="padding: 10px 16px; border: 1px solid #cfd8dc; font-weight: bold;">Vantagem</td>
      <td style="padding: 10px 16px; border: 1px solid #cfd8dc;">Propriedades algébricas convenientes</td>
      <td style="padding: 10px 16px; border: 1px solid #cfd8dc;">Diretamente comparável aos dados</td>
    </tr>
    <tr style="background-color: #f5f5f5;">
      <td style="padding: 10px 16px; border: 1px solid #cfd8dc; font-weight: bold;">Uso típico</td>
      <td style="padding: 10px 16px; border: 1px solid #cfd8dc;">Cálculos teóricos, ANOVA, regressão</td>
      <td style="padding: 10px 16px; border: 1px solid #cfd8dc;">Comunicação de resultados, intervalos de confiança</td>
    </tr>
  </tbody>
</table>

Na prática, o desvio padrão é preferido para comunicação porque está na mesma unidade dos dados. A variância é mais usada internamente em derivações matemáticas.

---

## Propriedades importantes

### 1. O desvio padrão é sempre não negativo

$$
\sigma \ge 0 \qquad s \ge 0
$$

É igual a zero somente quando todos os valores são idênticos.

### 2. Não é resistente a valores extremos

Um único valor muito afastado da média pode aumentar drasticamente o desvio padrão. Para dados com *outliers* marcantes, o **intervalo interquartil (IQR)** é uma alternativa mais robusta.

### 3. Efeito de transformações lineares

Se você transformar os dados pela operação $Y = aX + b$, o desvio padrão de $Y$ será:

$$
\sigma_Y = |a| \cdot \sigma_X
$$

O deslocamento $b$ (somar ou subtrair uma constante) não altera a dispersão. A escala $a$ (multiplicar por uma constante) afeta o desvio padrão proporcionalmente, mas sem elevar ao quadrado.

### 4. Soma de variáveis independentes

Se $X$ e $Y$ são variáveis aleatórias **independentes**:

$$
\text{Var}(X + Y) = \text{Var}(X) + \text{Var}(Y)
$$

$$
\sigma_{X+Y} = \sqrt{\sigma_X^2 + \sigma_Y^2}
$$

Note que as variâncias somam, não os desvios padrão. Somar desvios padrão diretamente seria um erro comum.

---

## O coeficiente de variação

O desvio padrão tem uma limitação: seu valor depende da escala dos dados. Um desvio de 5 kg numa pesagem de elefantes é desprezível; o mesmo desvio de 5 g numa pesagem de joias é enorme.

Para comparar dispersões em escalas diferentes, usa-se o **coeficiente de variação (CV)**:

$$
CV = \frac{s}{\bar{x}} \times 100\%
$$

O CV expressa o desvio padrão como percentual da média, tornando-o comparável entre conjuntos de dados com unidades ou ordens de grandeza distintas.

**Referência prática (aproximada):**

<table style="width:100%; border-collapse: collapse; margin: 1.5em 0; font-size: 0.97em;">
  <thead>
    <tr style="background-color: #37474f; color: #fff;">
      <th style="padding: 10px 16px; text-align: left; border: 1px solid #cfd8dc;">CV</th>
      <th style="padding: 10px 16px; text-align: left; border: 1px solid #cfd8dc;">Interpretação</th>
    </tr>
  </thead>
  <tbody>
    <tr style="background-color: #e8f5e9;">
      <td style="padding: 10px 16px; border: 1px solid #cfd8dc; font-weight: bold; color: #2e7d32;">Até 15%</td>
      <td style="padding: 10px 16px; border: 1px solid #cfd8dc;">Baixa dispersão</td>
    </tr>
    <tr style="background-color: #fff9c4;">
      <td style="padding: 10px 16px; border: 1px solid #cfd8dc; font-weight: bold; color: #f57f17;">15% a 30%</td>
      <td style="padding: 10px 16px; border: 1px solid #cfd8dc;">Dispersão moderada</td>
    </tr>
    <tr style="background-color: #ffebee;">
      <td style="padding: 10px 16px; border: 1px solid #cfd8dc; font-weight: bold; color: #c62828;">Acima de 30%</td>
      <td style="padding: 10px 16px; border: 1px solid #cfd8dc;">Alta dispersão</td>
    </tr>
  </tbody>
</table>

<div style="border-left: 4px solid #FF9800; padding: 1em; background-color: #fff3e0; margin: 1em 0; border-radius: 4px;">
  <h4 style="margin-top: 0;">Atenção</h4>
  <p>O CV só é interpretável quando a média é positiva e os dados não incluem zero ou valores negativos. Em dados de temperatura em Celsius, por exemplo, a interpretação do CV pode ser enganosa.</p>
  <p>Quando a média é <strong>próxima de zero</strong>, o CV pode crescer artificialmente e perder qualquer significado prático. Quando a média é <strong>negativa</strong>, o CV pode apresentar sinal negativo, tornando a comparação entre grupos problemática. Use o CV apenas quando a média estiver bem distante de zero e for positiva.</p>
</div>

---

## Exemplo prático: comparando dois grupos

Um pesquisador mede o tempo de resposta (em milissegundos) de dois algoritmos, cada um executado 6 vezes:

- **Algoritmo A:** 210, 215, 212, 208, 214, 211
- **Algoritmo B:** 195, 230, 205, 240, 198, 232

**Médias:**

$$
\bar{x}_A = \frac{1270}{6} \approx 211{,}7 \text{ ms} \qquad \bar{x}_B = \frac{1300}{6} \approx 216{,}7 \text{ ms}
$$

**Desvios padrão (amostral):**

$$
s_A \approx 2{,}7 \text{ ms} \qquad s_B \approx 19{,}4 \text{ ms}
$$

**Coeficientes de variação:**

$$
CV_A \approx 1{,}3\% \qquad CV_B \approx 9{,}0\%
$$

O algoritmo A é ligeiramente mais rápido em média — menor tempo de resposta implica maior velocidade — e muito mais consistente. O algoritmo B apresenta maior tempo médio de resposta e variabilidade substancialmente maior: cerca de sete vezes o desvio padrão do A. A diferença de 5 ms na média pode parecer pequena, mas a instabilidade do B (desvio de quase 20 ms) costuma ser o fator decisivo em aplicações sensíveis a latência.

---

## A conexão com a distribuição normal

Quando os dados seguem uma [distribuição normal](/distribuicao-normal/), o desvio padrão ganha um significado preciso graças à **regra 68–95–99,7**:

$$
P(\mu - \sigma \le X \le \mu + \sigma) \approx 68{,}27\%
$$

$$
P(\mu - 2\sigma \le X \le \mu + 2\sigma) \approx 95{,}45\%
$$

$$
P(\mu - 3\sigma \le X \le \mu + 3\sigma) \approx 99{,}73\%
$$

<figure style="display: flex; flex-direction: column; align-items: center; margin: 2.5em 0 2em 0;">
  <img src="/assets/images/sd-2.avif" alt="Regra 68-95-99,7: concentração de valores em torno da média em desvios padrão" style="max-width: 80%; height: auto; border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.07);" />
  <figcaption class="img-caption-contrast">
    <strong>Figura:</strong> A regra 68–95–99,7 mostra como o desvio padrão delimita faixas de probabilidade ao redor da média numa distribuição normal.
  </figcaption>
</figure>

Isso significa que, numa distribuição normal, saber a média e o desvio padrão é suficiente para descrever completamente a distribuição — e calcular probabilidades para qualquer intervalo.

Fora da normalidade, o **Teorema de Chebyshev** oferece uma garantia mais fraca, mas válida para qualquer distribuição: para qualquer $k > 1$, pelo menos $1 - 1/k^2$ dos valores estão dentro de $k$ desvios padrão da média.

---

## O escore Z: padronizando com o desvio padrão

O desvio padrão é a unidade natural para medir o "quão distante" uma observação está da média. Essa ideia se formaliza no **escore Z** (ou valor padronizado):

$$
z_i = \frac{x_i - \bar{x}}{s}
$$

O escore Z indica quantos desvios padrão a observação $x_i$ está acima (se positivo) ou abaixo (se negativo) da média.

**Exemplo com os dados do grupo B** ($\bar{x} = 70$, $s \approx 23{,}72$):

A nota $x = 100$ corresponde ao escore:

$$
z = \frac{100 - 70}{23{,}72} \approx 1{,}26
$$

A nota 100 está aproximadamente **1,26 desvios padrão acima da média**. Já a nota $x = 40$:

$$
z = \frac{40 - 70}{23{,}72} \approx -1{,}26
$$

A nota 40 está 1,26 desvios padrão **abaixo** da média — simetricamente oposta à nota 100, como esperado.

O escore Z é útil para:

- **Comparar observações de diferentes distribuições** — por exemplo, a nota em Matemática e a nota em Português, que têm médias e desvios padrão distintos.
- **Identificar valores atípicos** — escores com z > 2 são incomuns em distribuições normais (ocorrem em cerca de 5% dos casos); com z > 3, são raros (0,3%).
- **Padronizar variáveis** antes de algoritmos de aprendizado de máquina sensíveis à escala, como regressão com regularização e k-NN.

Quando a variável segue uma distribuição normal, o escore Z permite consultar a [tabela Z](/ztable.html) para calcular probabilidades de intervalos — conforme explorado no post sobre [distribuição normal](/distribuicao-normal/).

---

## Erros comuns

**Confundir desvio padrão com erro padrão.** O desvio padrão ($s$) descreve a variabilidade dos dados individuais. O erro padrão ($SE = s/\sqrt{n}$) descreve a variabilidade da *média amostral* — ele diminui conforme o tamanho da amostra aumenta. São medidas diferentes para propósitos diferentes.

**Somar desvios padrão.** Ao somar variáveis aleatórias **independentes**, as variâncias somam ($\text{Var}(X + Y) = \text{Var}(X) + \text{Var}(Y)$), mas os desvios padrão não se somam diretamente. Para **combinar grupos de dados** (por exemplo, juntar turma A e turma B num único conjunto), somar variâncias também não basta — é preciso levar em conta os tamanhos dos grupos e a diferença entre as médias. A variância do conjunto combinado de dois grupos é:

$$
s_{\text{comb}}^2 = \frac{(n_1 - 1)s_1^2 + (n_2 - 1)s_2^2 + n_1(\bar{x}_1 - \bar{x})^2 + n_2(\bar{x}_2 - \bar{x})^2}{n_1 + n_2 - 1}
$$

onde $\bar{x}$ é a média ponderada dos dois grupos.

**Usar o desvio padrão para distribuições muito assimétricas.** Em distribuições com assimetria forte, como renda ou preços de imóveis, a média e o desvio padrão podem ser pouco informativos. Prefira a mediana e o IQR nesses casos.

---

## Resumo das fórmulas

<table style="width:100%; border-collapse: collapse; margin: 1.5em 0; font-size: 0.97em;">
  <thead>
    <tr style="background-color: #37474f; color: #fff;">
      <th style="padding: 10px 16px; text-align: left; border: 1px solid #cfd8dc;">Medida</th>
      <th style="padding: 10px 16px; text-align: center; border: 1px solid #cfd8dc;">Fórmula</th>
      <th style="padding: 10px 16px; text-align: left; border: 1px solid #cfd8dc;">Uso</th>
    </tr>
  </thead>
  <tbody>
    <tr style="background-color: #f5f5f5;">
      <td style="padding: 10px 16px; border: 1px solid #cfd8dc;">Variância populacional</td>
      <td style="padding: 10px 16px; text-align: center; border: 1px solid #cfd8dc;">\(\sigma^2 = \dfrac{1}{N}\displaystyle\sum(x_i - \mu)^2\)</td>
      <td style="padding: 10px 16px; border: 1px solid #cfd8dc;">Quando se tem a população inteira</td>
    </tr>
    <tr style="background-color: #fff;">
      <td style="padding: 10px 16px; border: 1px solid #cfd8dc;">Variância amostral</td>
      <td style="padding: 10px 16px; text-align: center; border: 1px solid #cfd8dc;">\(s^2 = \dfrac{1}{n-1}\displaystyle\sum(x_i - \bar{x})^2\)</td>
      <td style="padding: 10px 16px; border: 1px solid #cfd8dc;">Quando se tem uma amostra</td>
    </tr>
    <tr style="background-color: #f5f5f5;">
      <td style="padding: 10px 16px; border: 1px solid #cfd8dc;">Desvio padrão populacional</td>
      <td style="padding: 10px 16px; text-align: center; border: 1px solid #cfd8dc;">\(\sigma = \sqrt{\sigma^2}\)</td>
      <td style="padding: 10px 16px; border: 1px solid #cfd8dc;">Descrição da população</td>
    </tr>
    <tr style="background-color: #fff;">
      <td style="padding: 10px 16px; border: 1px solid #cfd8dc;">Desvio padrão amostral</td>
      <td style="padding: 10px 16px; text-align: center; border: 1px solid #cfd8dc;">\(s = \sqrt{s^2}\)</td>
      <td style="padding: 10px 16px; border: 1px solid #cfd8dc;">Estimação e inferência</td>
    </tr>
    <tr style="background-color: #f5f5f5;">
      <td style="padding: 10px 16px; border: 1px solid #cfd8dc;">Coeficiente de variação</td>
      <td style="padding: 10px 16px; text-align: center; border: 1px solid #cfd8dc;">\(CV = \dfrac{s}{\bar{x}} \times 100\%\)</td>
      <td style="padding: 10px 16px; border: 1px solid #cfd8dc;">Comparação entre escalas diferentes</td>
    </tr>
  </tbody>
</table>

---

## Exercício resolvido: alturas de uma turma

<figure style="display: flex; flex-direction: column; align-items: center; margin: 2.5em 0 2em 0;">
  <img src="/assets/images/sd-altura.avif" alt="Representação visual das alturas de seis pessoas em relação à média do grupo" style="max-width: 80%; height: auto; border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.07);" />
  <figcaption class="img-caption-contrast">
    <strong>Figura:</strong> Cada barra representa a altura de uma pessoa do grupo; a linha horizontal indica a média. Os segmentos verticais mostram o quanto cada altura se afasta da média.
  </figcaption>
</figure>

### Enunciado

Em uma turma, foram medidas as alturas de seis pessoas. Após calcular a altura média do grupo, observou-se que cada pessoa se distancia da média em uma determinada quantidade de centímetros.

As diferenças absolutas entre a altura de cada pessoa e a média foram:

$$
|x_1 - \bar{x}| = 18 \text{ cm}, \quad
|x_2 - \bar{x}| = 8 \text{ cm}, \quad
|x_3 - \bar{x}| = 15 \text{ cm}
$$

$$
|x_4 - \bar{x}| = 8 \text{ cm}, \quad
|x_5 - \bar{x}| = 9 \text{ cm}, \quad
|x_6 - \bar{x}| = 6 \text{ cm}
$$

Sabendo que o desvio padrão dessas alturas é aproximadamente $11{,}5$ cm, interprete o que esse valor significa no contexto da imagem.

**Pergunta:** O que significa dizer que o desvio padrão das alturas desse grupo é de aproximadamente $11{,}5$ cm?

---

### Resolução

#### Passo 1 — Identificar os desvios absolutos de cada pessoa

As diferenças absolutas $|x_i - \bar{x}|$ informam, para cada indivíduo, o quanto sua altura está acima ou abaixo da média. Organizando:

<table style="width:100%; border-collapse: collapse; margin: 1.5em 0; font-size: 0.97em;">
  <thead>
    <tr style="background-color: #37474f; color: #fff;">
      <th style="padding: 10px 16px; text-align: center; border: 1px solid #cfd8dc;">Pessoa</th>
      <th style="padding: 10px 16px; text-align: center; border: 1px solid #cfd8dc;">\(|x_i - \bar{x}|\) (cm)</th>
      <th style="padding: 10px 16px; text-align: center; border: 1px solid #cfd8dc;">\((x_i - \bar{x})^2\) (cm²)</th>
    </tr>
  </thead>
  <tbody>
    <tr style="background-color: #f5f5f5;">
      <td style="padding: 10px 16px; text-align: center; border: 1px solid #cfd8dc;">1</td>
      <td style="padding: 10px 16px; text-align: center; border: 1px solid #cfd8dc;">18</td>
      <td style="padding: 10px 16px; text-align: center; border: 1px solid #cfd8dc;">\(18^2 = 324\)</td>
    </tr>
    <tr style="background-color: #fff;">
      <td style="padding: 10px 16px; text-align: center; border: 1px solid #cfd8dc;">2</td>
      <td style="padding: 10px 16px; text-align: center; border: 1px solid #cfd8dc;">8</td>
      <td style="padding: 10px 16px; text-align: center; border: 1px solid #cfd8dc;">\(8^2 = 64\)</td>
    </tr>
    <tr style="background-color: #f5f5f5;">
      <td style="padding: 10px 16px; text-align: center; border: 1px solid #cfd8dc;">3</td>
      <td style="padding: 10px 16px; text-align: center; border: 1px solid #cfd8dc;">15</td>
      <td style="padding: 10px 16px; text-align: center; border: 1px solid #cfd8dc;">\(15^2 = 225\)</td>
    </tr>
    <tr style="background-color: #fff;">
      <td style="padding: 10px 16px; text-align: center; border: 1px solid #cfd8dc;">4</td>
      <td style="padding: 10px 16px; text-align: center; border: 1px solid #cfd8dc;">8</td>
      <td style="padding: 10px 16px; text-align: center; border: 1px solid #cfd8dc;">\(8^2 = 64\)</td>
    </tr>
    <tr style="background-color: #f5f5f5;">
      <td style="padding: 10px 16px; text-align: center; border: 1px solid #cfd8dc;">5</td>
      <td style="padding: 10px 16px; text-align: center; border: 1px solid #cfd8dc;">9</td>
      <td style="padding: 10px 16px; text-align: center; border: 1px solid #cfd8dc;">\(9^2 = 81\)</td>
    </tr>
    <tr style="background-color: #fff;">
      <td style="padding: 10px 16px; text-align: center; border: 1px solid #cfd8dc;">6</td>
      <td style="padding: 10px 16px; text-align: center; border: 1px solid #cfd8dc;">6</td>
      <td style="padding: 10px 16px; text-align: center; border: 1px solid #cfd8dc;">\(6^2 = 36\)</td>
    </tr>
    <tr style="background-color: #eceff1; font-weight: bold;">
      <td style="padding: 10px 16px; text-align: center; border: 1px solid #cfd8dc;">Soma</td>
      <td style="padding: 10px 16px; text-align: center; border: 1px solid #cfd8dc;">64</td>
      <td style="padding: 10px 16px; text-align: center; border: 1px solid #cfd8dc;">794</td>
    </tr>
  </tbody>
</table>

#### Passo 2 — Calcular a soma dos quadrados dos desvios

$$
\sum_{i=1}^{6}(x_i - \bar{x})^2 = 324 + 64 + 225 + 64 + 81 + 36 = 794 \text{ cm}^2
$$

#### Passo 3 — Calcular a variância

Como temos os dados de um **grupo específico** que queremos apenas descrever (não estimar uma população maior), usamos o denominador $N = 6$:

$$
\sigma^2 = \frac{\displaystyle\sum_{i=1}^{6}(x_i - \bar{x})^2}{N} = \frac{794}{6} \approx 132{,}33 \text{ cm}^2
$$

#### Passo 4 — Calcular o desvio padrão

$$
\sigma = \sqrt{132{,}33} \approx 11{,}5 \text{ cm}
$$

O resultado confirma o valor enunciado.

#### Passo 5 — Comparar com o desvio absoluto médio

Para verificar que o desvio padrão **não é** a média das distâncias absolutas, calculamos o **desvio absoluto médio (DAM)**:

$$
\text{DAM} = \frac{|x_1 - \bar{x}| + |x_2 - \bar{x}| + \cdots + |x_6 - \bar{x}|}{6}
= \frac{18 + 8 + 15 + 8 + 9 + 6}{6}
= \frac{64}{6}
\approx 10{,}67 \text{ cm}
$$

O DAM ($10{,}67$ cm) e o desvio padrão ($11{,}5$ cm) são parecidos, mas diferentes. O desvio padrão eleva os desvios ao quadrado antes de calcular a média — o que faz com que desvios maiores (como o de 18 cm da pessoa 1) pesem desproporcionalmente mais. Por isso $\sigma > \text{DAM}$ sempre que os desvios não são todos iguais.

---

### Resposta

Dizer que o desvio padrão das alturas é de **11,5 cm** significa que, em termos de dispersão quadrática em torno da média, cada pessoa do grupo se afasta da altura média em uma magnitude equivalente a **11,5 cm**. Em outras palavras:

- Pessoas com alturas dentro do intervalo $[\bar{x} - 11{,}5\text{ cm},\; \bar{x} + 11{,}5\text{ cm}]$ estão a **um desvio padrão** da média.
- Olhando para a imagem: a pessoa 1 (desvio de 18 cm) e a pessoa 3 (desvio de 15 cm) estão **além** desse intervalo, enquanto as demais (desvios de 8, 8, 9 e 6 cm) estão **dentro** dele.
- O desvio padrão de 11,5 cm captura o espalhamento geral do grupo de forma mais sensível a valores extremos do que o DAM (10,67 cm), pois penaliza mais quem se afasta muito da média.

<div style="border-left: 4px solid #4CAF50; padding: 1em; background-color: #e8f5e9; margin: 1em 0; border-radius: 4px;">
  <h4 style="margin-top: 0;">Conclusão</h4>
  <p>O desvio padrão de 11,5 cm <strong>não</strong> é a distância média simples das alturas à média (isso seria o DAM = 10,67 cm). É a raiz quadrada da média dos quadrados dos desvios — uma medida que dá mais peso às pessoas cujas alturas mais se distanciam da média do grupo.</p>
</div>

---

## Calculando na prática: código em Julia

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

dados = [40, 55, 70, 85, 100]

media              = mean(dados)
variancia_amostral = var(dados)       # denominador n − 1
desvio_amostral    = std(dados)       # denominador n − 1

println("Média = ", media)
println("Variância amostral = ", variancia_amostral)
println("Desvio padrão amostral = ", round(desvio_amostral, digits=2))</code></pre>
  </div>
</div>

#### Saída esperada:
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>Média = <span class="code-number">70.0</span></div>
  <div>Variância amostral = <span class="code-number">562.5</span></div>
  <div>Desvio padrão amostral = <span class="code-number">23.72</span></div>
</div>

Para a versão **populacional** (denominador $N$):

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>n             = length(dados)
variancia_pop = sum((dados .- mean(dados)).^2) / n
desvio_pop    = sqrt(variancia_pop)

println("Variância populacional = ", variancia_pop)
println("Desvio padrão populacional = ", round(desvio_pop, digits=2))</code></pre>
  </div>
</div>

#### Saída esperada:
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>Variância populacional = <span class="code-number">450.0</span></div>
  <div>Desvio padrão populacional = <span class="code-number">21.21</span></div>
</div>

Note que a variância populacional ($450{,}0$) é menor do que a amostral ($562{,}5$), pois divide por $N = 5$ em vez de $n - 1 = 4$.

---

## Referências

- Casella, George; Berger, Roger L. *Statistical Inference*. 2. ed. Duxbury Press, 2002.
- Montgomery, Douglas C.; Runger, George C. *Applied Statistics and Probability for Engineers*. 6. ed. Wiley, 2014.
- Freedman, David; Pisani, Robert; Purves, Roger. *Statistics*. 4. ed. W. W. Norton & Company, 2007.
- Bessel, Friedrich Wilhelm. *Untersuchungen über die Wahrscheinlichkeit der Beobachtungsfehler*. 1838.

---

<style>
.share-buttons {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #444;
  text-align: center;
}
.share-buttons-title {
  margin-bottom: 15px;
  font-weight: bold;
  font-size: 1.1em;
}
.share-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 45px;
  height: 45px;
  margin: 5px;
  border-radius: 50%;
  text-decoration: none;
  background-color: transparent;
  color: #333 !important;
  font-size: 24px;
  border: none;
  cursor: pointer;
  transition: color 0.2s, transform 0.2s;
}
.share-btn:hover {
  color: #000 !important;
  transform: scale(1.1);
}
</style>

<div class="share-buttons">
  <p class="share-buttons-title">Gostou deste artigo? Compartilhe!</p>
  <a href="https://api.whatsapp.com/send?text={{ page.title | url_encode }}%20-%20{{ site.url }}{{ page.url }}" target="_blank" rel="noopener noreferrer" class="share-btn whatsapp" title="Compartilhar no WhatsApp"><i class="bi bi-whatsapp"></i></a>
  <a href="https://www.facebook.com/sharer/sharer.php?u={{ site.url }}{{ page.url }}" target="_blank" rel="noopener noreferrer" class="share-btn facebook" title="Compartilhar no Facebook"><i class="bi bi-facebook"></i></a>
  <a href="https://www.linkedin.com/shareArticle?mini=true&url={{ site.url }}{{ page.url }}&title={{ page.title | url_encode }}&summary={{ page.description | url_encode }}" target="_blank" rel="noopener noreferrer" class="share-btn linkedin" title="Compartilhar no LinkedIn"><i class="bi bi-linkedin"></i></a>
  <a href="https://x.com/intent/tweet?text={{ page.title | url_encode }}&url={{ site.url }}{{ page.url }}" target="_blank" rel="noopener noreferrer" class="share-btn twitter-x" title="Compartilhar no X"><i class="bi bi-twitter-x"></i></a>
  <button id="copy-link-btn" class="share-btn copy-link" title="Copiar Link"><i class="bi bi-link-45deg"></i></button>
</div>

<script>
document.getElementById('copy-link-btn').addEventListener('click', function() {
  navigator.clipboard.writeText(window.location.href).then(function() {
    const button = this;
    const originalContent = button.innerHTML;
    button.innerHTML = 'Copiado!';
    button.style.fontSize = '12px';
    button.style.fontWeight = 'bold';

    setTimeout(() => {
      button.innerHTML = originalContent;
      button.style.fontSize = '';
      button.style.fontWeight = '';
    }, 2000);
  }.bind(this), function(err) {
    console.error('Erro ao copiar o link: ', err);
  });
});
</script>
