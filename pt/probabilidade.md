---
layout: page
title: Probabilidade
lang: pt
ref: probabilidade
order: 2
mathjax: true
description: "Fundamentos da teoria da probabilidade, desde eventos básicos até distribuições e variáveis aleatórias."
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
    max-width: 780px;
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
    vertical-align: top;
  }

  .mk-table tr:last-child td {
    border-bottom: none;
  }

  .mk-example {
    padding: 1.4rem;
    border-radius: 18px;
    background: linear-gradient(135deg, #ffffff 0%, #fff8e8 100%);
    border: 1px solid rgba(196, 122, 44, 0.18);
    box-shadow: 0 10px 25px rgba(11, 31, 53, 0.06);
    margin: 1.5rem 0;
  }

  .mk-example h3 {
    margin-top: 0;
    color: #0b1f35;
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
  <span class="mk-tag">PROBABILIDADE • INCERTEZA • DECISÃO</span>

  <h1>Probabilidade</h1>

  <p>
    A <strong>Probabilidade</strong> é a área da Matemática que estuda fenômenos
    incertos. Ela permite medir, comparar e interpretar chances de ocorrência,
    ajudando-nos a compreender situações em que o resultado não pode ser previsto
    com total certeza.
  </p>
</section>

## O que é Probabilidade?

A probabilidade surge quando lidamos com situações em que existe **incerteza**.

Ao lançar uma moeda, não sabemos com certeza se sairá cara ou coroa.  
Ao jogar um dado, não sabemos previamente qual face ficará voltada para cima.  
Ao observar uma fila, não sabemos exatamente quanto tempo a próxima pessoa esperará.

Mesmo assim, podemos estudar essas situações de forma matemática.

A Probabilidade responde perguntas como:

- Qual é a chance de um evento acontecer?
- Quais resultados são possíveis?
- Um evento influencia outro?
- Como calcular a chance de vários eventos ocorrerem juntos?
- Como tomar decisões em situações incertas?

<div class="mk-note">
  <strong>Ideia central:</strong> a Probabilidade transforma a incerteza em uma
  medida numérica, permitindo raciocinar melhor sobre fenômenos aleatórios.
</div>

---

## Experimento aleatório, espaço amostral e evento

Antes de calcular probabilidades, precisamos entender três ideias fundamentais.

<div class="mk-grid">

  <div class="mk-card">
    <h3>Experimento aleatório</h3>
    <p>
      É uma situação cujo resultado não pode ser previsto com certeza antes de acontecer.
      Exemplo: lançar uma moeda, jogar um dado ou sortear uma carta.
    </p>
  </div>

  <div class="mk-card">
    <h3>Espaço amostral</h3>
    <p>
      É o conjunto de todos os resultados possíveis de um experimento aleatório.
      Costuma ser representado pela letra grega Ω.
    </p>
  </div>

  <div class="mk-card">
    <h3>Evento</h3>
    <p>
      É qualquer subconjunto do espaço amostral. Em outras palavras, é uma coleção
      de resultados que queremos analisar.
    </p>
  </div>

</div>

### Exemplo: lançamento de um dado

Ao lançar um dado comum, os resultados possíveis são:

<div class="mk-formula">

$$
\Omega = \{1,2,3,4,5,6\}
$$

</div>

Se quisermos estudar o evento “sair número par”, temos:

<div class="mk-formula">

$$
A = \{2,4,6\}
$$

</div>

Nesse caso, o evento $$A$$ é um subconjunto do espaço amostral $$\Omega$$.

---

## Definição clássica de probabilidade

Quando todos os resultados são igualmente prováveis, podemos calcular a probabilidade de um evento pela razão:

<div class="mk-formula">

$$
P(A) = \frac{\text{número de casos favoráveis}}{\text{número de casos possíveis}}
$$

</div>

No lançamento de um dado, a probabilidade de sair um número par é:

<div class="mk-formula">

$$
P(A) = \frac{3}{6}
$$

$$
P(A) = \frac{1}{2}
$$

$$
P(A) = 0{,}5
$$

</div>

Portanto, a chance de sair um número par é de:

<div class="mk-formula">

$$
50\%
$$

</div>

---

## Valores possíveis de uma probabilidade

Toda probabilidade está entre 0 e 1.

<div class="mk-formula">

$$
0 \leq P(A) \leq 1
$$

</div>

Isso significa que:

<table class="mk-table">
  <thead>
    <tr>
      <th>Valor</th>
      <th>Interpretação</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>$$P(A)=0$$</td>
      <td>O evento é impossível.</td>
    </tr>
    <tr>
      <td>$$P(A)=1$$</td>
      <td>O evento é certo.</td>
    </tr>
    <tr>
      <td>$$0 < P(A) < 1$$</td>
      <td>O evento é possível, mas incerto.</td>
    </tr>
  </tbody>
</table>

---

## Evento complementar

O evento complementar de $$A$$ representa tudo aquilo que está no espaço amostral, mas não está em $$A$$.

Ele pode ser indicado por:

<div class="mk-formula">

$$
A^c
$$

</div>

A probabilidade do complementar é:

<div class="mk-formula">

$$
P(A^c) = 1 - P(A)
$$

</div>

### Exemplo

Se a probabilidade de chover hoje é:

<div class="mk-formula">

$$
P(A) = 0{,}30
$$

</div>

Então a probabilidade de não chover é:

<div class="mk-formula">

$$
P(A^c) = 1 - 0{,}30
$$

$$
P(A^c) = 0{,}70
$$

</div>

Logo, a chance de não chover é de:

<div class="mk-formula">

$$
70\%
$$

</div>

---

## União e interseção de eventos

Na Probabilidade, frequentemente estudamos a relação entre dois ou mais eventos.

<table class="mk-table">
  <thead>
    <tr>
      <th>Operação</th>
      <th>Notação</th>
      <th>Significado</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>União</td>
      <td>$$A \cup B$$</td>
      <td>Ocorre o evento A, ou o evento B, ou ambos.</td>
    </tr>
    <tr>
      <td>Interseção</td>
      <td>$$A \cap B$$</td>
      <td>Ocorrem A e B ao mesmo tempo.</td>
    </tr>
    <tr>
      <td>Complementar</td>
      <td>$$A^c$$</td>
      <td>O evento A não ocorre.</td>
    </tr>
  </tbody>
</table>

---

## Regra da adição

A regra da adição permite calcular a probabilidade de ocorrer $$A$$ ou $$B$$.

<div class="mk-formula">

$$
P(A \cup B) = P(A) + P(B) - P(A \cap B)
$$

</div>

O termo $$P(A \cap B)$$ é subtraído porque, ao somar $$P(A)$$ e $$P(B)$$, a parte em comum entre os eventos é contada duas vezes.

<div class="mk-note">
  Quando dois eventos não podem acontecer ao mesmo tempo, dizemos que eles são
  <strong>mutuamente exclusivos</strong>. Nesse caso, $$P(A \cap B)=0$$.
</div>

Se $$A$$ e $$B$$ forem mutuamente exclusivos:

<div class="mk-formula">

$$
P(A \cup B) = P(A) + P(B)
$$

</div>

---

## Probabilidade condicional

A probabilidade condicional mede a chance de um evento ocorrer sabendo que outro evento já ocorreu.

A notação é:

<div class="mk-formula">

$$
P(A \mid B)
$$

</div>

Lemos como:

> Probabilidade de A dado B.

A fórmula é:

<div class="mk-formula">

$$
P(A \mid B) = \frac{P(A \cap B)}{P(B)}
$$

</div>

desde que:

<div class="mk-formula">

$$
P(B) > 0
$$

</div>

---

## Regra da multiplicação

A partir da probabilidade condicional, obtemos a regra da multiplicação:

<div class="mk-formula">

$$
P(A \cap B) = P(B) \cdot P(A \mid B)
$$

</div>

Também podemos escrever:

<div class="mk-formula">

$$
P(A \cap B) = P(A) \cdot P(B \mid A)
$$

</div>

Essa regra é muito útil quando queremos calcular a probabilidade de dois eventos acontecerem juntos.

---

## Eventos independentes

Dois eventos são independentes quando a ocorrência de um não altera a probabilidade do outro.

Se $$A$$ e $$B$$ são independentes, então:

<div class="mk-formula">

$$
P(A \mid B) = P(A)
$$

</div>

e também:

<div class="mk-formula">

$$
P(A \cap B) = P(A) \cdot P(B)
$$

</div>

### Exemplo

Lançar uma moeda duas vezes é um caso típico de independência.

O resultado do primeiro lançamento não altera o resultado do segundo.

Se quisermos a probabilidade de sair cara nos dois lançamentos:

<div class="mk-formula">

$$
P(\text{cara e cara}) = \frac{1}{2} \cdot \frac{1}{2}
$$

$$
P(\text{cara e cara}) = \frac{1}{4}
$$

</div>

Portanto, a chance é de:

<div class="mk-formula">

$$
25\%
$$

</div>

---

## Teorema de Bayes

O Teorema de Bayes é uma das ideias mais importantes da Probabilidade.

Ele permite atualizar uma probabilidade quando recebemos uma nova informação.

<div class="mk-formula">

$$
P(A \mid B) = \frac{P(B \mid A) \cdot P(A)}{P(B)}
$$

</div>

Onde:

- $$P(A)$$ é a probabilidade inicial de $$A$$;
- $$P(B \mid A)$$ é a probabilidade de observar $$B$$ sabendo que $$A$$ ocorreu;
- $$P(B)$$ é a probabilidade total de $$B$$;
- $$P(A \mid B)$$ é a probabilidade atualizada de $$A$$ depois de observar $$B$$.

<div class="mk-note">
  O Teorema de Bayes é muito usado em diagnósticos médicos, filtros de spam,
  aprendizado de máquina, análise de risco e inferência estatística.
</div>

---

## Variável aleatória

Uma variável aleatória é uma função que associa valores numéricos aos resultados de um experimento aleatório.

Por exemplo, ao lançar duas moedas, podemos definir:

> X = número de caras obtidas.

O espaço amostral é:

<div class="mk-formula">

$$
\Omega = \{CC, CK, KC, KK\}
$$

</div>

onde podemos interpretar:

- $$C$$ como cara;
- $$K$$ como coroa.

A variável aleatória $$X$$ pode assumir os valores:

<div class="mk-formula">

$$
X = 0,\ 1,\ 2
$$

</div>

<table class="mk-table">
  <thead>
    <tr>
      <th>Resultado</th>
      <th>Valor de X</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>$$KK$$</td>
      <td>0 caras</td>
    </tr>
    <tr>
      <td>$$CK$$ ou $$KC$$</td>
      <td>1 cara</td>
    </tr>
    <tr>
      <td>$$CC$$</td>
      <td>2 caras</td>
    </tr>
  </tbody>
</table>

---

## Valor esperado

O valor esperado representa uma média teórica de uma variável aleatória.

Para uma variável aleatória discreta:

<div class="mk-formula">

$$
E(X) = \sum x_i \cdot P(X=x_i)
$$

</div>

Ele não precisa ser um valor que aparece diretamente no experimento.  
Ele representa o comportamento médio esperado no longo prazo.

---

## Variância de uma variável aleatória

A variância mede o grau de dispersão da variável aleatória em torno do seu valor esperado.

<div class="mk-formula">

$$
Var(X) = E[(X - E(X))^2]
$$

</div>

Uma forma equivalente e muito usada é:

<div class="mk-formula">

$$
Var(X) = E(X^2) - [E(X)]^2
$$

</div>

O desvio padrão é:

<div class="mk-formula">

$$
\sigma = \sqrt{Var(X)}
$$

</div>

---

## Distribuições de probabilidade

Uma distribuição de probabilidade descreve como as probabilidades estão distribuídas entre os possíveis valores de uma variável aleatória.

<table class="mk-table">
  <thead>
    <tr>
      <th>Distribuição</th>
      <th>Tipo</th>
      <th>Uso comum</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Bernoulli</td>
      <td>Discreta</td>
      <td>Experimentos com apenas dois resultados: sucesso ou fracasso.</td>
    </tr>
    <tr>
      <td>Binomial</td>
      <td>Discreta</td>
      <td>Contagem de sucessos em um número fixo de tentativas.</td>
    </tr>
    <tr>
      <td>Poisson</td>
      <td>Discreta</td>
      <td>Contagem de ocorrências em um intervalo de tempo ou espaço.</td>
    </tr>
    <tr>
      <td>Normal</td>
      <td>Contínua</td>
      <td>Modelagem de fenômenos aproximadamente simétricos em torno da média.</td>
    </tr>
    <tr>
      <td>Exponencial</td>
      <td>Contínua</td>
      <td>Tempo de espera até a ocorrência de um evento.</td>
    </tr>
  </tbody>
</table>

---

## Distribuição de Bernoulli

A distribuição de Bernoulli modela um experimento com apenas dois resultados possíveis:

- sucesso;
- fracasso.

Se $$X$$ segue uma Bernoulli com parâmetro $$p$$, escrevemos:

<div class="mk-formula">

$$
X \sim Bernoulli(p)
$$

</div>

A função de probabilidade é:

<div class="mk-formula">

$$
P(X=x) = p^x(1-p)^{1-x}
$$

</div>

para:

<div class="mk-formula">

$$
x \in \{0,1\}
$$

</div>

---

## Distribuição Binomial

A distribuição binomial é usada quando temos:

- número fixo de tentativas;
- tentativas independentes;
- apenas dois resultados possíveis em cada tentativa;
- mesma probabilidade de sucesso em todas as tentativas.

Se $$X$$ segue uma binomial, escrevemos:

<div class="mk-formula">

$$
X \sim Binomial(n,p)
$$

</div>

A função de probabilidade é:

<div class="mk-formula">

$$
P(X=k) = \binom{n}{k}p^k(1-p)^{n-k}
$$

</div>

onde:

- $$n$$ é o número de tentativas;
- $$k$$ é o número de sucessos;
- $$p$$ é a probabilidade de sucesso.

---

## Distribuição de Poisson

A distribuição de Poisson é usada para modelar contagens de eventos em um intervalo.

Exemplos:

- número de clientes que chegam a uma fila por hora;
- número de chamadas recebidas por minuto;
- número de acidentes em determinado trecho;
- número de defeitos em uma peça.

Se $$X$$ segue uma Poisson com parâmetro $$\lambda$$, escrevemos:

<div class="mk-formula">

$$
X \sim Poisson(\lambda)
$$

</div>

Sua função de probabilidade é:

<div class="mk-formula">

$$
P(X=k) = \frac{e^{-\lambda}\lambda^k}{k!}
$$

</div>

onde:

- $$\lambda$$ representa a taxa média de ocorrência;
- $$k$$ representa o número de ocorrências.

---

## Distribuição Normal

A distribuição normal é uma das distribuições mais importantes da Estatística.

Ela possui formato de sino, é simétrica em torno da média e aparece em diversos fenômenos naturais, sociais e econômicos.

Se $$X$$ segue uma normal, escrevemos:

<div class="mk-formula">

$$
X \sim N(\mu,\sigma^2)
$$

</div>

Sua função densidade é:

<div class="mk-formula">

$$
f(x) = \frac{1}{\sigma\sqrt{2\pi}}
e^{-\frac{1}{2}\left(\frac{x-\mu}{\sigma}\right)^2}
$$

</div>

Onde:

- $$\mu$$ é a média;
- $$\sigma$$ é o desvio padrão;
- $$\sigma^2$$ é a variância.

---

## Exemplo prático: lançamento de moedas

Considere o experimento de lançar uma moeda 3 vezes.

Queremos calcular a probabilidade de sair exatamente 2 caras.

Nesse caso:

- número de tentativas: $$n = 3$$;
- número de sucessos desejados: $$k = 2$$;
- probabilidade de cara: $$p = \frac{1}{2}$$.

Usamos a distribuição binomial:

<div class="mk-formula">

$$
P(X=2) = \binom{3}{2}
\left(\frac{1}{2}\right)^2
\left(1-\frac{1}{2}\right)^{3-2}
$$

</div>

Como:

<div class="mk-formula">

$$
\binom{3}{2} = 3
$$

</div>

temos:

<div class="mk-formula">

$$
P(X=2) = 3 \cdot \left(\frac{1}{2}\right)^2 \cdot \left(\frac{1}{2}\right)^1
$$

$$
P(X=2) = 3 \cdot \frac{1}{4} \cdot \frac{1}{2}
$$

$$
P(X=2) = \frac{3}{8}
$$

</div>

Portanto:

<div class="mk-formula">

$$
P(X=2) = 0{,}375 = 37{,}5\%
$$

</div>

---

## Exemplo prático: dado comum

Considere o lançamento de um dado justo.

Queremos calcular a probabilidade de sair um número maior que 4.

O espaço amostral é:

<div class="mk-formula">

$$
\Omega = \{1,2,3,4,5,6\}
$$

</div>

O evento desejado é:

<div class="mk-formula">

$$
A = \{5,6\}
$$

</div>

Logo:

<div class="mk-formula">

$$
P(A) = \frac{2}{6}
$$

$$
P(A) = \frac{1}{3}
$$

$$
P(A) \approx 0{,}3333
$$

</div>

Portanto, a chance de sair um número maior que 4 é aproximadamente:

<div class="mk-formula">

$$
33{,}33\%
$$

</div>

---

## Como interpretar probabilidades?

<table class="mk-table">
  <thead>
    <tr>
      <th>Probabilidade</th>
      <th>Interpretação intuitiva</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>0%</td>
      <td>O evento não ocorre.</td>
    </tr>
    <tr>
      <td>25%</td>
      <td>O evento tem baixa chance de ocorrer.</td>
    </tr>
    <tr>
      <td>50%</td>
      <td>O evento tem chance equilibrada de ocorrer ou não ocorrer.</td>
    </tr>
    <tr>
      <td>75%</td>
      <td>O evento tem alta chance de ocorrer.</td>
    </tr>
    <tr>
      <td>100%</td>
      <td>O evento ocorre com certeza.</td>
    </tr>
  </tbody>
</table>

---

## Probabilidade na prática

A Probabilidade aparece em muitas áreas:

<div class="mk-grid">

  <div class="mk-card">
    <h3>Estatística</h3>
    <p>
      Serve como base para inferência estatística, testes de hipóteses,
      intervalos de confiança e modelos probabilísticos.
    </p>
  </div>

  <div class="mk-card">
    <h3>Ciência de dados</h3>
    <p>
      É usada em modelos preditivos, classificação, aprendizado de máquina
      e análise de incerteza.
    </p>
  </div>

  <div class="mk-card">
    <h3>Filas e atendimento</h3>
    <p>
      Ajuda a estudar chegadas de clientes, tempos de espera, capacidade
      de atendimento e risco de congestionamento.
    </p>
  </div>

  <div class="mk-card">
    <h3>Jogos e sorteios</h3>
    <p>
      Permite calcular chances em dados, cartas, loterias, moedas e outros
      experimentos aleatórios.
    </p>
  </div>

</div>

---

## Resumo geral

<table class="mk-table">
  <thead>
    <tr>
      <th>Conceito</th>
      <th>Ideia principal</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Experimento aleatório</td>
      <td>Situação cujo resultado não é conhecido antecipadamente.</td>
    </tr>
    <tr>
      <td>Espaço amostral</td>
      <td>Conjunto de todos os resultados possíveis.</td>
    </tr>
    <tr>
      <td>Evento</td>
      <td>Subconjunto do espaço amostral.</td>
    </tr>
    <tr>
      <td>Probabilidade</td>
      <td>Medida numérica da chance de ocorrência de um evento.</td>
    </tr>
    <tr>
      <td>Probabilidade condicional</td>
      <td>Chance de um evento ocorrer sabendo que outro ocorreu.</td>
    </tr>
    <tr>
      <td>Independência</td>
      <td>Quando um evento não altera a probabilidade do outro.</td>
    </tr>
    <tr>
      <td>Variável aleatória</td>
      <td>Função que associa números aos resultados de um experimento aleatório.</td>
    </tr>
    <tr>
      <td>Distribuição de probabilidade</td>
      <td>Forma como as probabilidades se distribuem entre os valores possíveis.</td>
    </tr>
  </tbody>
</table>

---

<div class="mk-quote">
  <strong>Conclusão:</strong><br>
  A Probabilidade é a linguagem matemática da incerteza. Ela permite estudar
  fenômenos aleatórios com rigor, calcular chances, atualizar informações e tomar
  decisões mais conscientes diante de situações em que o resultado não é garantido.
</div>

> “A teoria das probabilidades é, no fundo, apenas o bom senso reduzido ao cálculo.”  
> — Pierre-Simon Laplace