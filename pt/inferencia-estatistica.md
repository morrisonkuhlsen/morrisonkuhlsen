---
layout: page
title: Inferência Estatística
lang: pt
ref: inferencia-estatistica
order: 3
mathjax: true
description: "Aprenda a fazer inferências sobre populações com base em amostras e testes estatísticos."
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
    max-width: 800px;
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
  <span class="mk-tag">INFERÊNCIA • AMOSTRAS • DECISÃO ESTATÍSTICA</span>

  <h1>Inferência Estatística</h1>

  <p>
    A <strong>Inferência Estatística</strong> é a área da Estatística que permite
    tirar conclusões sobre uma população a partir de uma amostra. Ela é usada quando
    não conseguimos observar todos os indivíduos de interesse, mas queremos estimar
    quantidades, testar hipóteses e tomar decisões com base em dados.
  </p>
</section>

## O que é Inferência Estatística?

Na Estatística Descritiva, organizamos e resumimos os dados observados.  
Na Probabilidade, estudamos matematicamente a incerteza.  
Na Inferência Estatística, juntamos essas duas ideias para responder uma pergunta central:

> O que podemos concluir sobre uma população usando apenas uma amostra?

Esse tipo de raciocínio aparece em pesquisas eleitorais, estudos médicos, controle de qualidade,
análise de mercado, experimentos científicos, modelos econômicos e muitas outras situações.

<div class="mk-note">
  <strong>Ideia central:</strong> a Inferência Estatística transforma dados amostrais
  em conclusões sobre uma população, sempre levando em conta a incerteza envolvida.
</div>

---

## População e amostra

Dois conceitos são fundamentais para entender inferência: **população** e **amostra**.

<div class="mk-grid">

  <div class="mk-card">
    <h3>População</h3>
    <p>
      É o conjunto completo de elementos que queremos estudar. Pode ser formado por
      pessoas, empresas, atendimentos, medições, produtos, municípios ou qualquer
      unidade de interesse.
    </p>
  </div>

  <div class="mk-card">
    <h3>Amostra</h3>
    <p>
      É uma parte da população selecionada para análise. A partir dela, buscamos
      estimar características da população inteira.
    </p>
  </div>

  <div class="mk-card">
    <h3>Parâmetro</h3>
    <p>
      É uma medida verdadeira da população, geralmente desconhecida, como a média
      populacional, a proporção populacional ou a variância populacional.
    </p>
  </div>

  <div class="mk-card">
    <h3>Estatística</h3>
    <p>
      É uma medida calculada a partir da amostra, como a média amostral, a proporção
      amostral ou o desvio padrão amostral.
    </p>
  </div>

</div>

---

## Parâmetro versus estatística

A diferença entre parâmetro e estatística é uma das ideias mais importantes da Inferência Estatística.

<table class="mk-table">
  <thead>
    <tr>
      <th>Conceito</th>
      <th>Representa</th>
      <th>Exemplo</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Parâmetro</td>
      <td>Uma característica da população.</td>
      <td>$$\mu$$, $$\sigma^2$$, $$p$$</td>
    </tr>
    <tr>
      <td>Estatística</td>
      <td>Uma característica calculada na amostra.</td>
      <td>$$\bar{x}$$, $$s^2$$, $$\hat{p}$$</td>
    </tr>
  </tbody>
</table>

Por exemplo, se queremos saber a renda média de todos os moradores de uma cidade, essa média verdadeira seria um parâmetro:

<div class="mk-formula">

$$
\mu
$$

</div>

Mas, se entrevistamos apenas 500 moradores e calculamos a média dessa amostra, obtemos uma estatística:

<div class="mk-formula">

$$
\bar{x}
$$

</div>

---

## Por que precisamos de inferência?

Em muitos problemas reais, observar toda a população é impossível, caro ou demorado.

Imagine, por exemplo:

- entrevistar todos os eleitores de um país;
- testar a durabilidade de todos os produtos fabricados;
- medir todos os habitantes de uma cidade;
- acompanhar todos os pacientes de uma população;
- verificar todos os atendimentos de um sistema ao longo de anos.

Por isso, usamos amostras.

A grande questão é que amostras variam.  
Se retirarmos duas amostras diferentes da mesma população, dificilmente obteremos exatamente a mesma média, proporção ou desvio padrão.

<div class="mk-note">
  A Inferência Estatística existe justamente porque amostras carregam informação,
  mas também carregam incerteza.
</div>

---

## Estimação pontual

A estimação pontual consiste em usar um único valor amostral para estimar um parâmetro populacional.

Por exemplo, usamos a média amostral para estimar a média populacional:

<div class="mk-formula">

$$
\bar{x} \approx \mu
$$

</div>

Também podemos usar a proporção amostral para estimar a proporção populacional:

<div class="mk-formula">

$$
\hat{p} \approx p
$$

</div>

<table class="mk-table">
  <thead>
    <tr>
      <th>Parâmetro populacional</th>
      <th>Estimador amostral</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Média populacional: $$\mu$$</td>
      <td>Média amostral: $$\bar{x}$$</td>
    </tr>
    <tr>
      <td>Proporção populacional: $$p$$</td>
      <td>Proporção amostral: $$\hat{p}$$</td>
    </tr>
    <tr>
      <td>Variância populacional: $$\sigma^2$$</td>
      <td>Variância amostral: $$s^2$$</td>
    </tr>
  </tbody>
</table>

---

## Erro amostral

Como a amostra é apenas uma parte da população, existe uma diferença natural entre o valor amostral e o valor populacional.

Essa diferença é chamada de **erro amostral**.

<div class="mk-formula">

$$
\text{Erro amostral} = \bar{x} - \mu
$$

</div>

Na prática, geralmente não conhecemos $$\mu$$.  
Por isso, não conseguimos saber exatamente o erro amostral, mas conseguimos estimar sua variabilidade.

Essa ideia leva ao conceito de **erro padrão**.

---

## Erro padrão da média

O erro padrão mede o quanto a média amostral tende a variar de uma amostra para outra.

Quando o desvio padrão populacional $$\sigma$$ é conhecido, o erro padrão da média é:

<div class="mk-formula">

$$
EP(\bar{x}) = \frac{\sigma}{\sqrt{n}}
$$

</div>

Quando usamos o desvio padrão amostral $$s$$ como aproximação:

<div class="mk-formula">

$$
EP(\bar{x}) = \frac{s}{\sqrt{n}}
$$

</div>

Onde:

- $$EP(\bar{x})$$ é o erro padrão da média;
- $$s$$ é o desvio padrão amostral;
- $$n$$ é o tamanho da amostra.

<div class="mk-note">
  Quanto maior o tamanho da amostra, menor tende a ser o erro padrão.
</div>

---

## Distribuição amostral

A distribuição amostral é a distribuição de uma estatística calculada em muitas amostras possíveis.

Por exemplo, se retirássemos várias amostras de tamanho $$n$$ da mesma população e calculássemos a média de cada uma, teríamos várias médias amostrais:

<div class="mk-formula">

$$
\bar{x}_1,\ \bar{x}_2,\ \bar{x}_3,\ \ldots,\ \bar{x}_k
$$

</div>

A distribuição desses valores é chamada de **distribuição amostral da média**.

Essa ideia é essencial para construir intervalos de confiança e testes de hipóteses.

---

## Teorema Central do Limite

O Teorema Central do Limite é um dos resultados mais importantes da Estatística.

Ele afirma que, sob certas condições, a distribuição da média amostral tende a se aproximar de uma distribuição normal quando o tamanho da amostra aumenta.

De forma simplificada:

<div class="mk-formula">

$$
\bar{X} \approx N\left(\mu,\frac{\sigma^2}{n}\right)
$$

</div>

Isso significa que:

- a média das médias amostrais tende a ser igual à média populacional;
- a variância das médias amostrais diminui conforme $$n$$ aumenta;
- mesmo que a população original não seja normal, a média amostral pode se aproximar da normalidade para amostras grandes.

<div class="mk-note">
  O Teorema Central do Limite explica por que a distribuição normal aparece com tanta frequência
  na Inferência Estatística.
</div>

---

## Intervalo de confiança

A estimação pontual fornece um único valor.  
Mas, em muitos casos, é melhor fornecer uma faixa de valores plausíveis para o parâmetro.

Essa faixa é chamada de **intervalo de confiança**.

Um intervalo de confiança para a média pode ser escrito como:

<div class="mk-formula">

$$
IC = \bar{x} \pm z_{\alpha/2}\cdot \frac{\sigma}{\sqrt{n}}
$$

</div>

Quando $$\sigma$$ é desconhecido e usamos $$s$$, é comum usar a distribuição t de Student:

<div class="mk-formula">

$$
IC = \bar{x} \pm t_{\alpha/2,\ n-1}\cdot \frac{s}{\sqrt{n}}
$$

</div>

Onde:

- $$\bar{x}$$ é a média amostral;
- $$z_{\alpha/2}$$ é o valor crítico da distribuição normal padrão;
- $$t_{\alpha/2,\ n-1}$$ é o valor crítico da distribuição t;
- $$s$$ é o desvio padrão amostral;
- $$n$$ é o tamanho da amostra.

---

## Como interpretar um intervalo de confiança?

Um intervalo de confiança de 95% não significa que há 95% de chance de o parâmetro estar naquele intervalo específico depois que ele foi calculado.

A interpretação frequentista correta é:

> Se repetíssemos o processo de amostragem muitas vezes e construíssemos um intervalo de confiança em cada amostra, aproximadamente 95% desses intervalos conteriam o verdadeiro parâmetro populacional.

<div class="mk-example">
  <h3>Exemplo intuitivo</h3>

  Suponha que uma pesquisa estime a média de tempo de atendimento em:

  <div class="mk-formula">

  $$
  IC_{95\%} = [8{,}4,\ 10{,}2]
  $$

  </div>

  Isso indica que, pelo método utilizado, o intervalo de 8,4 a 10,2 minutos é uma faixa plausível
  para a verdadeira média populacional do tempo de atendimento.
</div>

---

## Testes de hipóteses

Os testes de hipóteses são usados para avaliar afirmações sobre parâmetros populacionais.

Eles ajudam a responder perguntas como:

- A média de uma população é diferente de certo valor?
- Duas médias são estatisticamente diferentes?
- Uma proporção mudou ao longo do tempo?
- Existe associação entre duas variáveis categóricas?
- Um tratamento teve efeito mensurável?

Todo teste de hipótese começa com duas hipóteses:

<table class="mk-table">
  <thead>
    <tr>
      <th>Hipótese</th>
      <th>Significado</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>$$H_0$$</td>
      <td>Hipótese nula. Geralmente representa ausência de efeito, ausência de diferença ou valor de referência.</td>
    </tr>
    <tr>
      <td>$$H_1$$ ou $$H_a$$</td>
      <td>Hipótese alternativa. Representa aquilo que queremos investigar ou encontrar evidência.</td>
    </tr>
  </tbody>
</table>

---

## Exemplo de hipóteses

Suponha que uma empresa afirme que o tempo médio de atendimento é de 10 minutos.

Queremos verificar se os dados indicam que o tempo médio é diferente de 10 minutos.

As hipóteses seriam:

<div class="mk-formula">

$$
H_0: \mu = 10
$$

$$
H_1: \mu \neq 10
$$

</div>

Nesse caso, temos um teste bilateral, pois estamos interessados em diferenças tanto para cima quanto para baixo.

---

## Estatística de teste

A estatística de teste transforma os dados amostrais em um valor padronizado, que pode ser comparado com uma distribuição conhecida.

Para testar uma média com desvio padrão conhecido, podemos usar:

<div class="mk-formula">

$$
Z = \frac{\bar{x} - \mu_0}{\sigma/\sqrt{n}}
$$

</div>

Quando o desvio padrão populacional é desconhecido, usamos a estatística t:

<div class="mk-formula">

$$
t = \frac{\bar{x} - \mu_0}{s/\sqrt{n}}
$$

</div>

Onde:

- $$\bar{x}$$ é a média amostral;
- $$\mu_0$$ é o valor testado na hipótese nula;
- $$s$$ é o desvio padrão amostral;
- $$n$$ é o tamanho da amostra.

---

## Valor-p

O valor-p, ou p-value, mede o quão compatíveis os dados são com a hipótese nula.

De forma intuitiva:

> O valor-p indica a probabilidade de observar um resultado tão extremo quanto o obtido, supondo que a hipótese nula seja verdadeira.

Se o valor-p é muito pequeno, os dados parecem pouco compatíveis com $$H_0$$.

<table class="mk-table">
  <thead>
    <tr>
      <th>Valor-p</th>
      <th>Interpretação comum</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>$$p \leq 0{,}01$$</td>
      <td>Forte evidência contra $$H_0$$.</td>
    </tr>
    <tr>
      <td>$$0{,}01 < p \leq 0{,}05$$</td>
      <td>Evidência moderada contra $$H_0$$.</td>
    </tr>
    <tr>
      <td>$$p > 0{,}05$$</td>
      <td>Não há evidência suficiente para rejeitar $$H_0$$ ao nível de 5%.</td>
    </tr>
  </tbody>
</table>

<div class="mk-note">
  Um valor-p alto não prova que $$H_0$$ é verdadeira. Ele apenas indica que os dados
  não forneceram evidência suficiente contra ela.
</div>

---

## Nível de significância

O nível de significância é representado por $$\alpha$$.

Ele define o limite usado para decidir se rejeitamos ou não a hipótese nula.

O valor mais comum é:

<div class="mk-formula">

$$
\alpha = 0{,}05
$$

</div>

A regra usual é:

<table class="mk-table">
  <thead>
    <tr>
      <th>Condição</th>
      <th>Decisão</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>$$p \leq \alpha$$</td>
      <td>Rejeitamos $$H_0$$.</td>
    </tr>
    <tr>
      <td>$$p > \alpha$$</td>
      <td>Não rejeitamos $$H_0$$.</td>
    </tr>
  </tbody>
</table>

---

## Erros do tipo I e tipo II

Como os testes são feitos com amostras, decisões estatísticas podem envolver erro.

<table class="mk-table">
  <thead>
    <tr>
      <th>Tipo de erro</th>
      <th>O que acontece?</th>
      <th>Probabilidade</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Erro tipo I</td>
      <td>Rejeitar $$H_0$$ quando $$H_0$$ é verdadeira.</td>
      <td>$$\alpha$$</td>
    </tr>
    <tr>
      <td>Erro tipo II</td>
      <td>Não rejeitar $$H_0$$ quando $$H_0$$ é falsa.</td>
      <td>$$\beta$$</td>
    </tr>
  </tbody>
</table>

O poder do teste é a probabilidade de rejeitar corretamente $$H_0$$ quando ela é falsa:

<div class="mk-formula">

$$
\text{Poder} = 1 - \beta
$$

</div>

---

## Teste unilateral e bilateral

A hipótese alternativa pode assumir diferentes formas.

<table class="mk-table">
  <thead>
    <tr>
      <th>Tipo de teste</th>
      <th>Hipótese alternativa</th>
      <th>Quando usar?</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Bilateral</td>
      <td>$$H_1: \mu \neq \mu_0$$</td>
      <td>Quando queremos saber se existe diferença em qualquer direção.</td>
    </tr>
    <tr>
      <td>Unilateral à direita</td>
      <td>$$H_1: \mu > \mu_0$$</td>
      <td>Quando investigamos se a média é maior que o valor de referência.</td>
    </tr>
    <tr>
      <td>Unilateral à esquerda</td>
      <td>$$H_1: \mu < \mu_0$$</td>
      <td>Quando investigamos se a média é menor que o valor de referência.</td>
    </tr>
  </tbody>
</table>

---

## Principais testes estatísticos

<table class="mk-table">
  <thead>
    <tr>
      <th>Teste</th>
      <th>Uso principal</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Teste z</td>
      <td>Testar média quando o desvio padrão populacional é conhecido ou em grandes amostras.</td>
    </tr>
    <tr>
      <td>Teste t de Student</td>
      <td>Testar médias quando o desvio padrão populacional é desconhecido.</td>
    </tr>
    <tr>
      <td>Teste qui-quadrado</td>
      <td>Testar associação entre variáveis categóricas ou aderência a uma distribuição.</td>
    </tr>
    <tr>
      <td>ANOVA</td>
      <td>Comparar médias de três ou mais grupos.</td>
    </tr>
    <tr>
      <td>Correlação</td>
      <td>Avaliar associação linear entre duas variáveis quantitativas.</td>
    </tr>
    <tr>
      <td>Regressão</td>
      <td>Modelar a relação entre uma variável resposta e uma ou mais variáveis explicativas.</td>
    </tr>
  </tbody>
</table>

---

## Exemplo prático: teste para média

Suponha que uma amostra de 36 atendimentos apresentou:

- média amostral: $$\bar{x}=12$$ minutos;
- desvio padrão amostral: $$s=6$$ minutos;
- valor de referência: $$\mu_0=10$$ minutos.

Queremos testar:

<div class="mk-formula">

$$
H_0: \mu = 10
$$

$$
H_1: \mu \neq 10
$$

</div>

Como o desvio padrão populacional é desconhecido, usamos a estatística t:

<div class="mk-formula">

$$
t = \frac{\bar{x} - \mu_0}{s/\sqrt{n}}
$$

</div>

Substituindo:

<div class="mk-formula">

$$
t = \frac{12 - 10}{6/\sqrt{36}}
$$

$$
t = \frac{2}{6/6}
$$

$$
t = \frac{2}{1}
$$

$$
t = 2
$$

</div>

O valor da estatística de teste é:

<div class="mk-formula">

$$
t = 2
$$

</div>

Esse valor será comparado com a distribuição t de Student com:

<div class="mk-formula">

$$
gl = n - 1 = 36 - 1 = 35
$$

</div>

---

## Tamanho de efeito

Nem todo resultado estatisticamente significativo é, necessariamente, importante na prática.

Por isso, além do valor-p, é importante analisar o **tamanho de efeito**.

Um exemplo comum é o d de Cohen:

<div class="mk-formula">

$$
d = \frac{\bar{x} - \mu_0}{s}
$$

</div>

No exemplo anterior:

<div class="mk-formula">

$$
d = \frac{12 - 10}{6}
$$

$$
d = \frac{2}{6}
$$

$$
d \approx 0{,}33
$$

</div>

Isso sugere um efeito pequeno a moderado, dependendo do contexto.

<div class="mk-note">
  Significância estatística e relevância prática não são a mesma coisa.
</div>

---

## Inferência frequentista e inferência bayesiana

Existem diferentes formas de pensar a inferência.

<table class="mk-table">
  <thead>
    <tr>
      <th>Abordagem</th>
      <th>Ideia principal</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Frequentista</td>
      <td>Trata os parâmetros como fixos e os dados como variáveis. Usa conceitos como valor-p, intervalos de confiança e testes de hipóteses.</td>
    </tr>
    <tr>
      <td>Bayesiana</td>
      <td>Trata os parâmetros como quantidades incertas e atualiza crenças usando dados, por meio do Teorema de Bayes.</td>
    </tr>
  </tbody>
</table>

Na inferência bayesiana, a atualização pode ser representada de forma simplificada por:

<div class="mk-formula">

$$
\text{Posterior} \propto \text{Verossimilhança} \times \text{Prior}
$$

</div>

Ou seja, combinamos uma informação inicial com a evidência trazida pelos dados.

---

## Cuidados na Inferência Estatística

A Inferência Estatística é poderosa, mas precisa ser usada com cuidado.

Alguns erros comuns são:

- concluir causalidade apenas a partir de correlação;
- ignorar o tamanho da amostra;
- interpretar valor-p como probabilidade de a hipótese nula ser verdadeira;
- escolher testes depois de olhar os resultados;
- ignorar pressupostos do modelo;
- remover dados sem justificativa;
- confundir significância estatística com importância prática.

<div class="mk-note">
  Uma boa inferência depende não apenas das fórmulas, mas também do desenho do estudo,
  da qualidade dos dados e da interpretação correta dos resultados.
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
      <td>População</td>
      <td>Conjunto completo que queremos estudar.</td>
    </tr>
    <tr>
      <td>Amostra</td>
      <td>Parte da população usada para análise.</td>
    </tr>
    <tr>
      <td>Parâmetro</td>
      <td>Medida desconhecida da população.</td>
    </tr>
    <tr>
      <td>Estatística</td>
      <td>Medida calculada a partir da amostra.</td>
    </tr>
    <tr>
      <td>Erro padrão</td>
      <td>Variabilidade esperada de uma estatística amostral.</td>
    </tr>
    <tr>
      <td>Intervalo de confiança</td>
      <td>Faixa de valores plausíveis para um parâmetro.</td>
    </tr>
    <tr>
      <td>Teste de hipótese</td>
      <td>Procedimento para avaliar evidências contra uma hipótese nula.</td>
    </tr>
    <tr>
      <td>Valor-p</td>
      <td>Medida de compatibilidade entre os dados e a hipótese nula.</td>
    </tr>
    <tr>
      <td>Poder do teste</td>
      <td>Probabilidade de detectar um efeito quando ele realmente existe.</td>
    </tr>
  </tbody>
</table>

---

<div class="mk-quote">
  <strong>Conclusão:</strong><br>
  A Inferência Estatística é a ponte entre a amostra e a população. Ela permite estimar
  parâmetros, testar hipóteses e tomar decisões em cenários de incerteza. Mais do que
  aplicar fórmulas, fazer inferência exige interpretar os resultados com cuidado,
  compreender os pressupostos e reconhecer os limites dos dados disponíveis.
</div>

> “Todos os modelos estão errados, mas alguns são úteis.”  
> — George E. P. Box