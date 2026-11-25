---
layout: page
title: Inferência Estatística
lang: pt
ref: inferencia-estatistica
order: 3
mathjax: true
description: "Inferência estatística: população e amostra, erro padrão, Teorema do Limite Central, intervalos de confiança, testes de hipótese, p-valor e tamanho de efeito."
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
    vertical-align: top;
  }

  .mk-table tr:last-child td {
    border-bottom: none;
  }

  .mk-example {
    padding: 1.4rem;
    border-radius: 18px;
    background: linear-gradient(135deg, var(--mk-surface) 0%, var(--mk-tint-warn) 100%);
    border: 1px solid rgba(196, 122, 44, 0.18);
    box-shadow: 0 10px 25px rgba(11, 31, 53, 0.06);
    margin: 1.5rem 0;
  }

  .mk-example h3 {
    margin-top: 0;
    color: var(--mk-ink);
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
    quantidades, testar hipóteses e tomar decisões com base em dados, dizendo
    também quanta incerteza essas conclusões carregam.
  </p>
</section>

## O que é Inferência Estatística?

Na [Estatística Descritiva]({{ '/pt/estatistica-descritiva/' | relative_url }}), organizamos e resumimos os dados observados.  
Na [Probabilidade]({{ '/pt/probabilidade/' | relative_url }}), estudamos matematicamente a incerteza.  
Na Inferência Estatística, juntamos essas duas ideias para responder uma pergunta central:

> O que podemos concluir sobre uma população usando apenas uma amostra?

Esse tipo de raciocínio aparece em pesquisas eleitorais, estudos médicos, controle de qualidade,
análise de mercado, experimentos científicos, modelos econômicos e muitas outras situações.

<div class="mk-note">
  <strong>Ideia central:</strong> a Inferência Estatística transforma dados amostrais
  em conclusões sobre uma população, sempre levando em conta a incerteza envolvida.
</div>

### Páginas desta seção

Os tópicos abaixo detalham cada parte desta página, com exemplos resolvidos e código em Julia:

- [Amostragem]({{ '/pt/inferencia-estatistica/amostragem' | relative_url }}): como escolher a amostra (aleatória simples, estratificada, por conglomerados, sistemática) e de que tamanho.
- [Testes de Hipótese]({{ '/pt/inferencia-estatistica/testes-hipotese' | relative_url }}): hipóteses, estatística de teste, p-valor, erros tipo I e II e poder.
- [Intervalos de Confiança]({{ '/pt/inferencia-estatistica/intervalos-confianca' | relative_url }}): como construir e interpretar intervalos para médias e proporções.
- [Estimadores]({{ '/pt/inferencia-estatistica/estimadores' | relative_url }}): viés, variância, erro quadrático médio e máxima verossimilhança.
- [Análise de Variância (ANOVA)]({{ '/pt/inferencia-estatistica/analise-variancia' | relative_url }}): comparar as médias de vários grupos com o teste F, e o teste de Tukey.

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

A diferença entre parâmetro e estatística é uma das ideias mais importantes da Inferência Estatística. As letras gregas costumam indicar parâmetros; as latinas, estatísticas.

<table class="mk-table">
  <thead>
    <tr>
      <th>Conceito</th>
      <th>Representa</th>
      <th>Exemplos</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Parâmetro</td>
      <td>Uma característica da população (um número fixo, em geral desconhecido).</td>
      <td>$\mu$ (média), $\sigma^2$ (variância), $p$ (proporção)</td>
    </tr>
    <tr>
      <td>Estatística</td>
      <td>Uma característica calculada na amostra (muda de amostra para amostra).</td>
      <td>$\bar{x}$ (média), $s^2$ (variância), $\hat{p}$ (proporção)</td>
    </tr>
  </tbody>
</table>

Por exemplo, se queremos saber a renda média de todos os moradores de uma cidade, essa média verdadeira, $\mu$, é um parâmetro. Se entrevistamos 500 moradores sorteados e calculamos a média dessa amostra, obtemos uma estatística, $\bar{x}$.

---

## Por que precisamos de inferência?

Em muitos problemas reais, observar toda a população é impossível, caro ou demorado.

Imagine, por exemplo:

- entrevistar todos os eleitores de um país;
- testar a durabilidade de todos os produtos fabricados (o teste destrói o produto);
- medir todos os habitantes de uma cidade;
- acompanhar todos os pacientes de uma população;
- verificar todos os atendimentos de um sistema ao longo de anos.

Por isso, usamos amostras.

A grande questão é que amostras variam.  
Se retirarmos duas amostras diferentes da mesma população, dificilmente obteremos exatamente a mesma média, proporção ou desvio padrão.

<div class="mk-note">
  A Inferência Estatística existe justamente porque amostras carregam informação,
  mas também carregam incerteza. E ela só funciona bem se a amostra for escolhida
  com cuidado, de preferência por sorteio: nenhuma fórmula corrige uma amostra
  viciada (veja <a href="{{ '/pt/inferencia-estatistica/amostragem' | relative_url }}">Amostragem</a>).
</div>

---

## Estimação pontual

A estimação pontual consiste em usar um único valor calculado na amostra para estimar um parâmetro da população.

Por exemplo, usamos a média amostral para estimar a média populacional, e a proporção amostral para estimar a proporção populacional:

<div class="mk-formula">

$$
\bar{x} \approx \mu \qquad\qquad \hat{p} \approx p
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
      <td>Média populacional: $\mu$</td>
      <td>Média amostral: $\bar{x}$</td>
    </tr>
    <tr>
      <td>Proporção populacional: $p$</td>
      <td>Proporção amostral: $\hat{p}$</td>
    </tr>
    <tr>
      <td>Variância populacional: $\sigma^2$</td>
      <td>Variância amostral: $s^2$ (com divisor $n - 1$)</td>
    </tr>
  </tbody>
</table>

Como julgar se um estimador é bom (viés, variância, erro quadrático médio) está em [Estimadores]({{ '/pt/inferencia-estatistica/estimadores' | relative_url }}).

---

## Erro amostral

Como a amostra é apenas uma parte da população, existe uma diferença natural entre o valor amostral e o valor populacional.

Essa diferença é chamada de **erro amostral**. Para a média:

<div class="mk-formula">

$$
\text{Erro amostral} = \bar{x} - \mu
$$

</div>

Na prática, não conhecemos $\mu$; por isso não conseguimos saber o erro amostral de uma amostra específica. O que conseguimos é medir **de quanto ele costuma ser**, de amostra para amostra. Essa ideia leva ao conceito de **erro padrão**.

O erro amostral é diferente dos erros que não vêm do sorteio (perguntas mal feitas, pessoas que não respondem, aparelho descalibrado). Esses não diminuem com uma amostra maior.

---

## Erro padrão da média

O **erro padrão** de uma estatística é o desvio padrão da sua distribuição amostral: mede o quanto ela varia de uma amostra para outra.

Se as $n$ observações são independentes e vêm de uma população com desvio padrão $\sigma$, o erro padrão da média é:

<div class="mk-formula">

$$
EP(\bar{x}) = \frac{\sigma}{\sqrt{n}}
$$

</div>

Quando $\sigma$ é desconhecido (o caso mais comum), ele é **estimado** trocando $\sigma$ pelo desvio padrão amostral $s$:

<div class="mk-formula">

$$
\widehat{EP}(\bar{x}) = \frac{s}{\sqrt{n}}
$$

</div>

Onde:

- $EP(\bar{x})$ é o erro padrão da média;
- $\sigma$ é o desvio padrão da população, e $s$, o da amostra;
- $n$ é o tamanho da amostra.

<div class="mk-note">
  Quanto maior a amostra, menor o erro padrão, mas devagar: como $n$ aparece dentro
  da raiz, para reduzir o erro padrão à metade é preciso <strong>quadruplicar</strong>
  a amostra.
</div>

---

## Distribuição amostral

A distribuição amostral é a distribuição de uma estatística calculada em todas as amostras possíveis de mesmo tamanho.

Por exemplo, se retirássemos várias amostras de tamanho $n$ da mesma população e calculássemos a média de cada uma, teríamos várias médias amostrais:

<div class="mk-formula">

$$
\bar{x}_1,\ \bar{x}_2,\ \bar{x}_3,\ \ldots
$$

</div>

A distribuição desses valores é chamada de **distribuição amostral da média**. Na prática temos uma amostra só; a distribuição amostral é o que a teoria nos diz sobre todas as amostras que **poderíamos** ter tirado.

Essa ideia é a base dos intervalos de confiança e dos testes de hipótese.

---

## Teorema do Limite Central

O [Teorema do Limite Central]({{ '/pt/probabilidade/teorema-limite-central' | relative_url }}) (TLC) é um dos resultados mais importantes da Estatística.

Para observações independentes e de mesma distribuição, com média $\mu$ e variância $\sigma^2$ finita, valem sempre, para qualquer $n$:

- a média da distribuição amostral de $\bar{X}$ é exatamente $\mu$: $E[\bar{X}] = \mu$;
- a variância de $\bar{X}$ é $\sigma^2 / n$, que diminui quando $n$ aumenta.

O TLC acrescenta a **forma**: quando $n$ cresce, a distribuição de $\bar{X}$ se aproxima de uma normal, **mesmo que a população não seja normal**:

<div class="mk-formula">

$$
\bar{X} \approx N\left(\mu,\ \frac{\sigma^2}{n}\right) \quad \text{para } n \text{ grande}
$$

</div>

Quão grande precisa ser $n$ depende da população: com populações simétricas, a aproximação já é boa com amostras pequenas; com populações muito assimétricas, pode precisar de bem mais. O conhecido "$n \geq 30$" é uma regra de bolso, não um teorema.

<div class="mk-note">
  O Teorema do Limite Central explica por que a distribuição normal aparece com tanta frequência
  na Inferência Estatística, mesmo quando os dados em si não são normais.
</div>

---

## Intervalo de confiança

A estimação pontual fornece um único valor, que quase nunca é exatamente igual ao parâmetro.  
Por isso, em geral é melhor fornecer uma faixa de valores plausíveis para o parâmetro, construída com uma margem de erro.

Essa faixa é chamada de **intervalo de confiança**.

Quando $\sigma$ é conhecido, um intervalo de confiança para a média é:

<div class="mk-formula">

$$
IC = \bar{x} \pm z_{\alpha/2}\cdot \frac{\sigma}{\sqrt{n}}
$$

</div>

Quando $\sigma$ é desconhecido e usamos $s$, o valor crítico vem da distribuição t de Student com $n - 1$ graus de liberdade:

<div class="mk-formula">

$$
IC = \bar{x} \pm t_{\alpha/2,\ n-1}\cdot \frac{s}{\sqrt{n}}
$$

</div>

Onde:

- $\bar{x}$ é a média amostral;
- $1 - \alpha$ é o nível de confiança (por exemplo, $\alpha = 0{,}05$ para 95%);
- $z_{\alpha/2}$ é o valor crítico da distribuição normal padrão (1,96 para 95%);
- $t_{\alpha/2,\ n-1}$ é o valor crítico da distribuição t;
- $s$ é o desvio padrão amostral;
- $n$ é o tamanho da amostra.

As duas fórmulas supõem observações independentes e população normal ou $n$ grande o bastante para o TLC valer. Detalhes e exemplos em [Intervalos de Confiança]({{ '/pt/inferencia-estatistica/intervalos-confianca' | relative_url }}).

---

## Como interpretar um intervalo de confiança?

Um intervalo de confiança de 95% **não** significa que há 95% de chance de o parâmetro estar naquele intervalo específico, depois que ele foi calculado. O parâmetro é um número fixo: ou está dentro, ou não está.

A interpretação correta (frequentista) é sobre o **método**:

> Se repetíssemos o processo de amostragem muitas vezes e construíssemos um intervalo de confiança em cada amostra, cerca de 95% desses intervalos conteriam o verdadeiro parâmetro populacional.

<div class="mk-example">
  <h3>Exemplo</h3>

  <p>Suponha (números ilustrativos) que uma pesquisa estime a média do tempo de atendimento
  com o intervalo de 95% $IC_{95\%} = [8{,}4;\ 10{,}2]$ minutos.</p>

  <p>Isso quer dizer que o intervalo foi construído por um método que acerta a média verdadeira
  em 95% das amostras, e que os valores de 8,4 a 10,2 minutos são os compatíveis com os dados
  por esse critério. Não quer dizer que 95% dos atendimentos duram entre 8,4 e 10,2 minutos:
  o intervalo é sobre a <strong>média</strong>, não sobre cada atendimento.</p>
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
      <td>$H_0$</td>
      <td>Hipótese nula. Geralmente representa ausência de efeito, ausência de diferença ou um valor de referência.</td>
    </tr>
    <tr>
      <td>$H_1$ ou $H_a$</td>
      <td>Hipótese alternativa. Representa aquilo para o qual queremos procurar evidência.</td>
    </tr>
  </tbody>
</table>

O teste parte de $H_0$ e pergunta se os dados são incomuns demais para ela. Detalhes em [Testes de Hipótese]({{ '/pt/inferencia-estatistica/testes-hipotese' | relative_url }}).

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

Nesse caso, temos um **teste bilateral**, pois estamos interessados em diferenças tanto para cima quanto para baixo.

---

## Estatística de teste

A estatística de teste transforma os dados amostrais em um valor padronizado, que pode ser comparado com uma distribuição conhecida.

Para testar uma média com desvio padrão populacional conhecido, usa-se a estatística Z, que sob $H_0$ segue a normal padrão:

<div class="mk-formula">

$$
Z = \frac{\bar{x} - \mu_0}{\sigma/\sqrt{n}}
$$

</div>

Quando o desvio padrão populacional é desconhecido, usa-se a estatística t, que sob $H_0$ segue a distribuição t de Student com $n - 1$ graus de liberdade (supondo população normal ou $n$ grande):

<div class="mk-formula">

$$
t = \frac{\bar{x} - \mu_0}{s/\sqrt{n}}
$$

</div>

Onde:

- $\bar{x}$ é a média amostral;
- $\mu_0$ é o valor da média segundo a hipótese nula;
- $\sigma$ é o desvio padrão populacional, e $s$, o amostral;
- $n$ é o tamanho da amostra.

---

## p-valor

O **p-valor** é a probabilidade de obter um resultado **tão ou mais extremo** que o observado, **supondo que a hipótese nula seja verdadeira**.

Se o p-valor é muito pequeno, os dados seriam raros caso $H_0$ fosse verdadeira, e isso é evidência contra $H_0$.

Uma leitura comum, que é só uma **convenção** (não uma regra da matemática), é:

<table class="mk-table">
  <thead>
    <tr>
      <th>p-valor</th>
      <th>Leitura comum</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>$p \leq 0{,}01$</td>
      <td>Evidência forte contra $H_0$.</td>
    </tr>
    <tr>
      <td>$0{,}01 &lt; p \leq 0{,}05$</td>
      <td>Evidência moderada contra $H_0$.</td>
    </tr>
    <tr>
      <td>$p &gt; 0{,}05$</td>
      <td>Evidência insuficiente para rejeitar $H_0$ ao nível de 5%.</td>
    </tr>
  </tbody>
</table>

<div class="mk-note">
  <strong>O que o p-valor não é:</strong> não é a probabilidade de $H_0$ ser verdadeira,
  nem a probabilidade de o resultado ser "obra do acaso", nem uma medida do tamanho do efeito.
  E um p-valor alto não prova que $H_0$ é verdadeira: ele apenas indica que os dados
  não trouxeram evidência suficiente contra ela.
</div>

---

## Nível de significância

O nível de significância é representado por $\alpha$. Ele é escolhido **antes** de olhar os dados e define o limite usado para decidir se rejeitamos ou não a hipótese nula.

O valor mais comum é $\alpha = 0{,}05$, mas ele é uma convenção; áreas diferentes usam valores diferentes.

A regra de decisão é:

<table class="mk-table">
  <thead>
    <tr>
      <th>Condição</th>
      <th>Decisão</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>$p \leq \alpha$</td>
      <td>Rejeitamos $H_0$.</td>
    </tr>
    <tr>
      <td>$p &gt; \alpha$</td>
      <td>Não rejeitamos $H_0$.</td>
    </tr>
  </tbody>
</table>

---

## Erros do tipo I e tipo II

Como os testes são feitos com amostras, decisões estatísticas podem estar erradas.

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
      <td>Rejeitar $H_0$ quando $H_0$ é verdadeira (falso positivo).</td>
      <td>$\alpha$</td>
    </tr>
    <tr>
      <td>Erro tipo II</td>
      <td>Não rejeitar $H_0$ quando $H_0$ é falsa (falso negativo).</td>
      <td>$\beta$ (depende de quão longe o valor verdadeiro está de $H_0$)</td>
    </tr>
  </tbody>
</table>

O **poder do teste** é a probabilidade de rejeitar corretamente $H_0$ quando ela é falsa:

<div class="mk-formula">

$$
\text{Poder} = 1 - \beta
$$

</div>

Para um mesmo $\alpha$, o poder aumenta com o tamanho da amostra e com o tamanho do efeito.

---

## Teste unilateral e bilateral

A hipótese alternativa pode assumir diferentes formas. A escolha é feita antes de ver os dados, a partir da pergunta.

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
      <td>$H_1: \mu \neq \mu_0$</td>
      <td>Quando queremos saber se existe diferença em qualquer direção.</td>
    </tr>
    <tr>
      <td>Unilateral à direita</td>
      <td>$H_1: \mu &gt; \mu_0$</td>
      <td>Quando só interessa saber se a média é maior que o valor de referência.</td>
    </tr>
    <tr>
      <td>Unilateral à esquerda</td>
      <td>$H_1: \mu &lt; \mu_0$</td>
      <td>Quando só interessa saber se a média é menor que o valor de referência.</td>
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
      <td>Teste Z</td>
      <td>Testar uma média quando o desvio padrão populacional é conhecido, ou uma proporção com amostra grande.</td>
    </tr>
    <tr>
      <td>Teste t de Student</td>
      <td>Testar médias (uma amostra, duas amostras ou dados pareados) quando o desvio padrão populacional é desconhecido.</td>
    </tr>
    <tr>
      <td>Teste qui-quadrado</td>
      <td>Testar associação entre variáveis categóricas ou aderência a uma distribuição.</td>
    </tr>
    <tr>
      <td>ANOVA</td>
      <td>Comparar as médias de dois ou mais grupos (usada sobretudo com três ou mais). Veja <a href="{{ '/pt/inferencia-estatistica/analise-variancia' | relative_url }}">Análise de Variância</a>.</td>
    </tr>
    <tr>
      <td>Correlação de Pearson</td>
      <td>Avaliar associação linear entre duas variáveis quantitativas.</td>
    </tr>
    <tr>
      <td>Regressão linear</td>
      <td>Modelar a relação entre uma variável resposta e uma ou mais variáveis explicativas.</td>
    </tr>
  </tbody>
</table>

---

## Exemplo prático: teste para média

Suponha (números ilustrativos) que uma amostra aleatória de 36 atendimentos apresentou:

- tamanho da amostra: $n = 36$;
- média amostral: $\bar{x} = 12$ minutos;
- desvio padrão amostral: $s = 6$ minutos;
- valor de referência (afirmação da empresa): $\mu_0 = 10$ minutos;
- nível de significância: $\alpha = 0{,}05$.

**Hipóteses:**

<div class="mk-formula">

$$
H_0: \mu = 10 \qquad\qquad H_1: \mu \neq 10
$$

</div>

**Condições.** Os atendimentos foram sorteados (independência). O desvio padrão da população é desconhecido, então usamos a estatística t. Com $n = 36$, a distribuição t serve mesmo que os tempos não sejam exatamente normais, desde que não sejam muito assimétricos.

**Fórmula e substituição:**

<div class="mk-formula">

$$
t = \frac{\bar{x} - \mu_0}{s/\sqrt{n}} = \frac{12 - 10}{6/\sqrt{36}}
$$

</div>

**Conta, um passo por linha:**

<div class="mk-formula">

$$
\sqrt{36} = 6
$$

$$
\frac{s}{\sqrt{n}} = \frac{6}{6} = 1 \text{ minuto} \quad \text{(erro padrão estimado)}
$$

$$
\bar{x} - \mu_0 = 12 - 10 = 2 \text{ minutos}
$$

$$
t = \frac{2}{1} = 2
$$

</div>

**Graus de liberdade:**

<div class="mk-formula">

$$
gl = n - 1 = 36 - 1 = 35
$$

</div>

**Decisão pelo valor crítico.** Para um teste bilateral a 5%, o valor crítico é o quantil 97,5% da distribuição t com 35 graus de liberdade: $t_{0{,}025;\,35} = 2{,}030$ (tabela t; em Julia, `quantile(TDist(35), 0.975)` dá 2,0301). Como $\lvert t \rvert = 2 &lt; 2{,}030$, **não rejeitamos** $H_0$.

**Decisão pelo p-valor.** $p = 2 \times P(T_{35} \geq 2) = 0{,}0533$ (em Julia, `2 * ccdf(TDist(35), 2)`). Como $0{,}0533 &gt; 0{,}05$, a decisão é a mesma: não rejeitar $H_0$.

**Conferência pelo intervalo.** O intervalo de 95% é $12 \pm 2{,}0301 \times 1 = [9{,}97;\ 14{,}03]$ minutos. Ele contém o 10, o que combina com não rejeitar $H_0$.

**Interpretação.** A amostra tem média 2 minutos acima do valor anunciado, mas, com esse tamanho de amostra e essa variação, uma diferença assim não é rara o bastante para descartar que a média verdadeira seja 10 minutos. Isso **não prova** que a média é 10: o intervalo mostra que valores de quase 10 até 14 minutos são compatíveis com os dados.

<div class="mk-note">
  <strong>Um resultado no limite.</strong> O p-valor 0,0533 fica muito perto de 0,05. Se
  alguém usasse por engano a normal em vez da t, obteria $p = 2 \times P(Z \geq 2) = 0{,}0455$
  e a decisão se inverteria. Por isso é importante usar a distribuição certa e mostrar o
  p-valor com casas suficientes, em vez de só dizer "significativo" ou "não significativo".
</div>

---

## Tamanho de efeito

Nem todo resultado estatisticamente significativo é importante na prática, e um resultado não significativo pode esconder um efeito relevante medido com pouca precisão.

Por isso, além do p-valor, é importante analisar o **tamanho de efeito**.

Para uma média, uma medida comum é o **d de Cohen**, a diferença medida em desvios padrão:

<div class="mk-formula">

$$
d = \frac{\bar{x} - \mu_0}{s}
$$

</div>

No exemplo anterior:

<div class="mk-formula">

$$
d = \frac{12 - 10}{6} = \frac{2}{6} = \frac{1}{3} \approx 0{,}33
$$

</div>

**Interpretação:** a média da amostra está a um terço de desvio padrão acima do valor anunciado. Pelas referências que Cohen (1988) propôs para as ciências do comportamento (0,2 pequeno, 0,5 médio, 0,8 grande), é um efeito entre pequeno e médio. O próprio Cohen avisou que essas referências são relativas à área; em minutos de atendimento, o que importa é se 2 minutos a mais fazem diferença para o serviço.

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
      <td>Trata os parâmetros como números fixos e desconhecidos; a probabilidade descreve o que aconteceria em muitas repetições da amostragem. Usa p-valores, intervalos de confiança e testes de hipótese.</td>
    </tr>
    <tr>
      <td>Bayesiana</td>
      <td>Representa a incerteza sobre os parâmetros com distribuições de probabilidade e as atualiza com os dados, por meio do <a href="{{ '/pt/probabilidade/probabilidade-condicional' | relative_url }}">Teorema de Bayes</a>.</td>
    </tr>
  </tbody>
</table>

Na inferência bayesiana, a atualização pode ser resumida assim (o símbolo $\propto$ significa "proporcional a"):

<div class="mk-formula">

$$
\text{distribuição a posteriori} \propto \text{verossimilhança} \times \text{distribuição a priori}
$$

</div>

Ou seja, combinamos uma informação inicial (a priori) com a evidência trazida pelos dados (a verossimilhança). Esta seção do site usa a abordagem frequentista.

---

## Cuidados na Inferência Estatística

A Inferência Estatística é poderosa, mas precisa ser usada com cuidado.

Alguns erros comuns são:

- concluir causalidade apenas a partir de correlação;
- usar uma amostra que não foi sorteada (voluntários, quem respondeu) como se fosse aleatória;
- ignorar o tamanho da amostra;
- interpretar o p-valor como probabilidade de a hipótese nula ser verdadeira;
- escolher o teste, ou as hipóteses, depois de olhar os resultados;
- fazer muitos testes e relatar só os significativos;
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
      <td>Parte da população usada para análise, de preferência sorteada.</td>
    </tr>
    <tr>
      <td>Parâmetro</td>
      <td>Medida fixa e, em geral, desconhecida da população.</td>
    </tr>
    <tr>
      <td>Estatística</td>
      <td>Medida calculada a partir da amostra; varia de amostra para amostra.</td>
    </tr>
    <tr>
      <td>Erro padrão</td>
      <td>Desvio padrão da distribuição amostral de uma estatística.</td>
    </tr>
    <tr>
      <td>Intervalo de confiança</td>
      <td>Faixa de valores plausíveis para um parâmetro, obtida por um método que acerta numa proporção conhecida das amostras.</td>
    </tr>
    <tr>
      <td>Teste de hipótese</td>
      <td>Procedimento para avaliar a evidência contra uma hipótese nula.</td>
    </tr>
    <tr>
      <td>p-valor</td>
      <td>Probabilidade de um resultado tão ou mais extremo que o observado, se $H_0$ for verdadeira.</td>
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
> — George E. P. Box, título de uma seção de “Robustness in the Strategy of Scientific Model Building” (1979), p. 202 (em tradução livre; no original: “All models are wrong but some are useful”)

## Referências

1. Box, G. E. P. (1979). Robustness in the Strategy of Scientific Model Building. In: Launer, R. L.; Wilkinson, G. N. (Eds.). *Robustness in Statistics*. Academic Press, p. 201–236.
2. Bussab, W. O.; Morettin, P. A. (2023). *Estatística Básica*. 10. ed. Saraiva Uni.
3. Cohen, J. (1988). *Statistical Power Analysis for the Behavioral Sciences*. 2nd ed. Lawrence Erlbaum Associates.
4. Wasserstein, R. L.; Lazar, N. A. (2016). The ASA's Statement on p-Values: Context, Process, and Purpose. *The American Statistician*, 70(2), 129–133. DOI: [10.1080/00031305.2016.1154108](https://doi.org/10.1080/00031305.2016.1154108).
