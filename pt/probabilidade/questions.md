---
layout: page
title: Questões
lang: pt
ref: questions
parent: probabilidade
permalink: /pt/probabilidade/questions
order: 6
---

## Questões Práticas Resolvidas

<div style="border-left: 4px solid #f44336; padding: 1em; background-color: #ffebee; margin: 1em 0; border-radius: 4px;">
  <img src="{{ site.baseurl }}/assets/images/lampiao.png" alt="Lampião a querosene" style="float: right; width: 350px; margin-left: 1em; margin-bottom: 1em;">
  <h4 style="margin-top: 0;">🎲 Questão de Probabilidade: Lampiões em uma Vila</h4>
  <p><strong>Enunciado:</strong></p>
  <p>Em uma vila onde o fornecimento elétrico é instável, cada morador possui um lampião a querosene. Estudos mostram que, em média, 1 em cada 5 lampiões falha ao ser aceso devido a impurezas no combustível.</p>
  <p>Durante uma noite de apagão, 6 moradores tentam acender seus lampiões independentemente.</p>
  <p><strong>Pergunta-se:</strong></p>
  <ol>
    <li>Qual a probabilidade de <strong>exatamente 2</strong> lampiões falharem ao acender?</li>
    <li>Qual a probabilidade de <strong>pelo menos 1</strong> lampião funcionar corretamente?</li>
    <li>Se um morador substitui o querosene por um combustível filtrado que reduz a chance de falha para 10%, qual a nova probabilidade de <strong>nenhum lampião falhar</strong> entre os 6?</li>
  </ol>
</div>

### Resolução Detalhada

O problema pode ser modelado usando a **distribuição binomial**, pois temos um número fixo de tentativas independentes ($n=6$), cada uma com dois resultados possíveis (falha ou sucesso) e uma probabilidade constante de falha ($p=1/5=0.2$).

Seja $X$ o número de lampiões que falham. Temos $X \sim \text{Binomial}(n=6, p=0.2)$.

#### 1. Probabilidade de exatamente 2 lampiões falharem

Usamos a fórmula da função de probabilidade binomial:

$$ P(X = k) = \binom{n}{k} p^k (1-p)^{n-k} $$

Para $k=2$, $n=6$ e $p=0.2$:

$$ P(X=2) = \binom{6}{2} (0.2)^2 (0.8)^4 $$

Calculando cada termo separadamente:

$$ \binom{6}{2} = \frac{6!}{2!(6-2)!} = \frac{6 \cdot 5}{2 \cdot 1} = 15 $$

$$ (0.2)^2 = 0.04 $$

$$ (0.8)^4 = 0.4096 $$

Juntando os resultados:

$$ P(X=2) = 15 \cdot 0.04 \cdot 0.4096 $$

$$ P(X=2) = 0.24576 $$

A probabilidade de exatamente 2 lampiões falharem é de **24,58%**.

#### 2. Probabilidade de pelo menos 1 lampião funcionar corretamente

"Pelo menos 1 funcionar" é o evento complementar de "nenhum funcionar", ou seja, "todos os 6 falharem".
$$ P(\text{pelo menos 1 funciona}) = 1 - P(\text{todos os 6 falham}) $$
A probabilidade de todos os 6 falharem corresponde a $P(X=6)$:

$$ P(X=6) = \binom{6}{6} (0.2)^6 (0.8)^0 $$

$$ P(X=6) = 1 \cdot (0.2)^6 \cdot 1 $$

$$ P(X=6) = 0.000064 $$

Agora, calculamos a probabilidade complementar:

$$ P(\text{pelo menos 1 funciona}) = 1 - 0.000064 $$

$$ P(\text{pelo menos 1 funciona}) = 0.999936 $$

A probabilidade é de **99,99%**, ou seja, é quase certo que pelo menos um lampião acenderá.

#### 3. Nova probabilidade com combustível filtrado

Com o novo combustível, a probabilidade de falha é $p' = 0.1$. A probabilidade de um lampião funcionar é $1 - p' = 0.9$.

A pergunta é a probabilidade de **nenhum lampião falhar**, que corresponde a $P(X=0)$ com a nova probabilidade $p'=0.1$.

$$ P(X=0) = \binom{6}{0} (0.1)^0 (0.9)^6 $$

$$ P(X=0) = 1 \cdot 1 \cdot (0.9)^6 $$

$$ P(X=0) = 0.531441 $$

Com o combustível filtrado, a probabilidade de nenhum lampião falhar é de **53,14%**.

<div style="border-left: 4px solid #4CAF50; padding: 0.5em; background-color: #e8f5e9; margin: 1em 0;">
  <strong>Resumo dos Resultados:</strong>
  <ul>
    <li>Probabilidade de exatamente 2 falhas: <strong>24,58%</strong></li>
    <li>Probabilidade de pelo menos 1 funcionar: <strong>99,99%</strong></li>
    <li>Probabilidade de nenhuma falha (combustível novo): <strong>53,14%</strong></li>
  </ul>
</div>

<div style="border-left: 4px solid #2196F3; padding: 1em; background-color: #e3f2fd; margin: 1em 0; border-radius: 4px;">
  <img src="{{ site.baseurl }}/assets/images/lampiao.png" alt="Lampião a querosene" style="float: right; width: 350px; margin-left: 1em; margin-bottom: 1em;">
  <h4 style="margin-top: 0;">🎲 Questão 2: A Vida Útil dos Lampiões (Distribuição Exponencial)</h4>
  <p><strong>Enunciado:</strong></p>
  <p>Sabe-se que a vida útil (em horas) de um lampião de citronela segue uma <strong>distribuição exponencial</strong> com média de 6 horas (ou seja, o parâmetro de taxa $\lambda = 1/6$).</p>
  <p><strong>Pergunta-se:</strong></p>
  <ol>
    <li>Qual a probabilidade de um lampião durar <strong>mais de 8 horas</strong>?</li>
    <li>Se um morador tem 4 lampiões idênticos, qual a probabilidade de <strong>pelo menos um</strong> deles durar mais de 8 horas?</li>
    <li>Determine a <strong>mediana</strong> da distribuição (o tempo em que metade dos lampiões já se apagou).</li>
    <li>Se um lampião já está aceso há 6 horas, qual a probabilidade de ele continuar aceso por <strong>pelo menos mais 4 horas</strong>? (Dica: use a propriedade de "falta de memória").</li>
  </ol>
</div>

### Resolução Detalhada

A vida útil $T$ de um lampião segue uma distribuição Exponencial com média $E[T] = 6$ horas. O parâmetro de taxa $\lambda$ é o inverso da média, então $\lambda = 1/6$.

A função de sobrevivência para a distribuição exponencial é 

$$P(T > t) = e^{-\lambda t}$$

#### 1. Probabilidade de um lampião durar mais de 8 horas

Usamos a função de sobrevivência com $t=8$:

$$ P(T > 8) = e^{-\lambda \cdot 8} $$

$$ P(T > 8) = e^{-(1/6) \cdot 8} = e^{-8/6} \approx e^{-1.333} $$

$$ P(T > 8) \approx 0.2636 $$

A probabilidade de um lampião durar mais de 8 horas é de **26,36%**.

#### 2. Probabilidade de pelo menos 1 de 4 lampiões durar mais de 8 horas

Este é o evento complementar de "nenhum dos 4 lampiões durar mais de 8 horas".
Seja $p = P(T > 8) \approx 0.2636$. A probabilidade de um lampião NÃO durar mais de 8 horas é $1-p$.

$$ P(\text{pelo menos 1 > 8h}) = 1 - P(\text{nenhum > 8h}) $$

$$ P(\text{pelo menos 1 > 8h}) = 1 - (1 - p)^4 $$

$$ P(\text{pelo menos 1 > 8h}) = 1 - (1 - 0.2636)^4 = 1 - (0.7364)^4 $$

$$ P(\text{pelo menos 1 > 8h}) \approx 1 - 0.2941 \approx 0.7059 $$

A probabilidade de pelo menos um dos quatro lampiões durar mais de 8 horas é de **70,59%**.

#### 3. Mediana da distribuição

A mediana $m$ é o tempo $t$ para o qual $P(T > m) = 0.5$.

$$ e^{-\lambda m} = 0.5 $$

Resolvendo para $m$:

$$ -\lambda m = \ln(0.5) = -\ln(2) $$

$$ m = \frac{\ln(2)}{\lambda} = \ln(2) \cdot 6 $$

$$ m \approx 0.6931 \cdot 6 \approx 4.1586 \text{ horas} $$

A mediana da vida útil é de aproximadamente **4,16 horas**. Metade dos lampiões terá se apagado antes desse tempo.

#### 4. Probabilidade condicional (Propriedade de Falta de Memória)

A distribuição exponencial tem a propriedade de "falta de memória", que diz:

$$ P(T > s+t \mid T > s) = P(T > t) $$

Queremos saber a probabilidade de o lampião durar mais 4 horas, dado que já durou 6 horas. Ou seja, $s=6$ e $t=4$.

$$ P(T > 6+4 \mid T > 6) = P(T > 4) $$

Calculamos $P(T > 4)$:

$$ P(T > 4) = e^{-\lambda \cdot 4} = e^{-(1/6) \cdot 4} = e^{-4/6} \approx e^{-0.667} $$

$$ P(T > 4) \approx 0.5134 $$

A probabilidade de o lampião durar pelo menos mais 4 horas é de **51,34%**, independentemente do fato de já estar aceso há 6 horas.

<div style="border-left: 4px solid #4CAF50; padding: 0.5em; background-color: #e8f5e9; margin: 1em 0;">
  <strong>Resumo dos Resultados (Questão 2):</strong>
  <ul>
    <li>Probabilidade de durar > 8h: <strong>26,36%</strong></li>
    <li>Probabilidade de pelo menos 1 de 4 durar > 8h: <strong>70,59%</strong></li>
    <li>Mediana da vida útil: <strong>4,16 horas</strong></li>
    <li>Probabilidade de durar mais 4h (dado 6h): <strong>51,34%</strong></li>
  </ul>
</div>

<div style="border-left: 4px solid #673AB7; padding: 1em; background-color: #ede7f6; margin: 1em 0; border-radius: 4px;">
  <img src="{{ site.baseurl }}/assets/images/telephone.png" alt="Telefone antigo" style="float: right; width: 350px; margin-left: 1em; margin-bottom: 1em;">
  <h4 style="margin-top: 0;">📞 Questão 3: Chamadas em um Call Center (Distribuição de Poisson)</h4>
  <p><strong>Enunciado:</strong></p>
  <p>Um pequeno call center recebe chamadas a uma taxa média de 12 chamadas por hora. O número de chamadas recebidas segue uma <strong>distribuição de Poisson</strong>.</p>
  <p><strong>Pergunta-se:</strong></p>
  <ol>
    <li>Qual a probabilidade de o call center receber <strong>exatamente 5 chamadas</strong> em um período de 30 minutos?</li>
    <li>Qual a probabilidade de <strong>nenhuma chamada</strong> ser recebida em um intervalo de 10 minutos?</li>
    <li>Qual a probabilidade de receber <strong>mais de 3 chamadas</strong> em um período de 20 minutos?</li>
  </ol>
</div>

### Resolução Detalhada

O número de eventos (chamadas) $X$ em um intervalo de tempo segue uma distribuição de Poisson. A fórmula da probabilidade de Poisson é:

$$ P(X=k) = \frac{e^{-\lambda} \lambda^k}{k!} $$

Nesta fórmula, o parâmetro $\lambda$ (lambda) representa a taxa média de ocorrências **no intervalo de tempo específico** que estamos analisando. A taxa base do problema é de 12 chamadas por hora, e devemos ajustá-la para cada item.

#### 1. Probabilidade de exatamente 5 chamadas em 30 minutos

Primeiro, ajustamos a taxa para o intervalo de tempo desejado.
- Intervalo: $30 \text{ minutos} = 0.5 \text{ horas}$.
- Taxa média no intervalo ($\lambda$): $12 \text{ chamadas/hora} \times 0.5 \text{ horas} = 6$.

Agora, calculamos $P(X=5)$ para $\lambda=6$:

$$ P(X=5) = \frac{e^{-6} \cdot 6^5}{5!} $$

$$ P(X=5) = \frac{0.002479 \cdot 7776}{120} \approx \frac{19.28}{120} \approx 0.1606 $$

A probabilidade de receber exatamente 5 chamadas em 30 minutos é de **16,06%**.

#### 2. Probabilidade de nenhuma chamada em 10 minutos

Ajustamos a taxa para o novo intervalo.
- Intervalo: $10 \text{ minutos} = 1/6 \text{ horas}$.
- Taxa média no intervalo ($\lambda$): $12 \times (1/6) = 2$.

Calculamos $P(X=0)$ para $\lambda=2$:

$$ P(X=0) = \frac{e^{-2} \cdot 2^0}{0!} = e^{-2} \approx 0.1353 $$

A probabilidade de não receber nenhuma chamada em 10 minutos é de **13,53%**.

#### 3. Probabilidade de mais de 3 chamadas em 20 minutos

"Mais de 3 chamadas" é o complementar de "3 ou menos chamadas".

$$ P(X > 3) = 1 - P(X \le 3) = 1 - [P(X=0) + P(X=1) + P(X=2) + P(X=3)] $$

Ajustamos a taxa para o intervalo.
- Intervalo: $20 \text{ minutos} = 1/3 \text{ horas}$.
- Taxa média no intervalo ($\lambda$): $12 \times (1/3) = 4$.

Calculamos as probabilidades para $k=0, 1, 2, 3$ com $\lambda=4$:
- $P(X=0) = \frac{e^{-4} 4^0}{0!} \approx 0.0183$
- $P(X=1) = \frac{e^{-4} 4^1}{1!} \approx 0.0733$
- $P(X=2) = \frac{e^{-4} 4^2}{2!} \approx 0.1465$
- $P(X=3) = \frac{e^{-4} 4^3}{3!} \approx 0.1954$

Somando essas probabilidades:

$$ P(X \le 3) \approx 0.0183 + 0.0733 + 0.1465 + 0.1954 = 0.4335 $$

Finalmente, calculamos o complementar:

$$ P(X > 3) = 1 - 0.4335 = 0.5665 $$

A probabilidade de receber mais de 3 chamadas em 20 minutos é de **56,65%**.

<div style="border-left: 4px solid #4CAF50; padding: 0.5em; background-color: #e8f5e9; margin: 1em 0;">
  <strong>Resumo dos Resultados (Questão 3):</strong>
  <ul>
    <li>Probabilidade de 5 chamadas em 30 min: <strong>16,06%</strong></li>
    <li>Probabilidade de 0 chamadas em 10 min: <strong>13,53%</strong></li>
    <li>Probabilidade de >3 chamadas em 20 min: <strong>56,65%</strong></li>
  </ul>
</div>

<div style="border-left: 4px solid #FF9800; padding: 1em; background-color: #fff3e0; margin: 1em 0; border-radius: 4px;">
  <img src="{{ site.baseurl }}/assets/images/telephone.png" alt="Telefone antigo" style="float: right; width: 320px; margin-left: 1em; margin-bottom: 1em;">
  <h4 style="margin-top: 0;">📞 Questão 4: Duração das Chamadas (Distribuição Normal)</h4>
  <p><strong>Enunciado:</strong></p>
  <p>A duração das chamadas de suporte técnico em um call center segue uma <strong>distribuição Normal</strong> com uma média ($\mu$) de 10 minutos e um desvio padrão ($\sigma$) de 2 minutos.</p>
  <p><strong>Pergunta-se:</strong></p>
  <ol>
    <li>Qual a probabilidade de uma chamada durar <strong>menos de 7 minutos</strong>?</li>
    <li>Qual a probabilidade de uma chamada durar <strong>entre 9 e 12 minutos</strong>?</li>
    <li>Qual é a duração mínima das <strong>5% chamadas mais longas</strong>?</li>
  </ol>
</div>

### Resolução Detalhada

A duração da chamada $X$ segue uma distribuição Normal, $X \sim N(\mu=10, \sigma=2)$. Para resolver, padronizamos os valores de $X$ para a distribuição Normal Padrão ($Z$) usando a fórmula do Z-score:

$$ Z = \frac{X - \mu}{\sigma} $$

#### 1. Probabilidade de uma chamada durar menos de 7 minutos

Queremos encontrar $P(X < 7)$. Primeiro, calculamos o Z-score para $X=7$:

$$ Z = \frac{7 - 10}{2} = \frac{-3}{2} = -1.5 $$

Agora, procuramos a probabilidade $P(Z < -1.5)$ em uma tabela Z ou usando uma calculadora.

$$ P(Z < -1.5) \approx 0.0668 $$

A probabilidade de uma chamada durar menos de 7 minutos é de **6,68%**.

#### 2. Probabilidade de uma chamada durar entre 9 e 12 minutos

Queremos encontrar $P(9 < X < 12)$. Calculamos os Z-scores para $X=9$ e $X=12$:
- Para $X=9$: $Z_1 = \frac{9 - 10}{2} = -0.5$
- Para $X=12$: $Z_2 = \frac{12 - 10}{2} = 1.0$

A probabilidade é a área entre esses dois Z-scores: $P(-0.5 < Z < 1.0) = P(Z < 1.0) - P(Z < -0.5)$.
- $P(Z < 1.0) \approx 0.8413$
- $P(Z < -0.5) \approx 0.3085$

$$ P(9 < X < 12) \approx 0.8413 - 0.3085 = 0.5328 $$

A probabilidade de uma chamada durar entre 9 e 12 minutos é de **53,28%**.

#### 3. Duração mínima das 5% chamadas mais longas

Queremos encontrar o valor $x$ tal que $P(X > x) = 0.05$. Isso é o mesmo que encontrar um Z-score, $z$, tal que $P(Z > z) = 0.05$, o que implica que $P(Z < z) = 0.95$.
Consultando uma tabela Z inversa, o Z-score que corresponde a uma área de 0.95 à sua esquerda é aproximadamente $z \approx 1.645$.

Agora, convertemos esse Z-score de volta para minutos usando a fórmula rearranjada: $X = \mu + Z \cdot \sigma$.

$$ x = 10 + (1.645 \cdot 2) $$

$$ x = 10 + 3.29 = 13.29 \text{ minutos} $$

As 5% chamadas mais longas duram pelo menos **13,29 minutos**.

<div style="border-left: 4px solid #4CAF50; padding: 0.5em; background-color: #e8f5e9; margin: 1em 0;">
  <strong>Resumo dos Resultados (Questão 4):</strong>
  <ul>
    <li>Probabilidade de chamada < 7 min: <strong>6,68%</strong></li>
    <li>Probabilidade de chamada entre 9 e 12 min: <strong>53,28%</strong></li>
    <li>Duração mínima das 5% chamadas mais longas: <strong>13,29 minutos</strong></li>
  </ul>
</div>

<div style="border-left: 4px solid #009688; padding: 1em; background-color: #e0f2f1; margin: 1em 0; border-radius: 4px;">
  <img src="{{ site.baseurl }}/assets/images/boxkite.png" alt="Pipa de caixa (box kite)" style="float: right; width: 350px; margin-left: 1em; margin-bottom: 1em;">
  <h4 style="margin-top: 0;">🪁 Questão 5: Tentativas para Empinar Pipa (Distribuição Geométrica)</h4>
  <p><strong>Enunciado:</strong></p>
  <p>Um entusiasta de pipas sabe que, devido às condições variáveis do vento, a probabilidade de conseguir empinar sua pipa em uma determinada tentativa é de 40% (p=0.4). Cada tentativa é independente da anterior.</p>
  <p><strong>Pergunta-se:</strong></p>
  <ol>
    <li>Qual a probabilidade de ele conseguir empinar a pipa na <strong>primeira tentativa</strong>?</li>
    <li>Qual a probabilidade de serem necessárias <strong>exatamente 3 tentativas</strong> para o sucesso?</li>
    <li>Qual a probabilidade de serem necessárias <strong>mais de 4 tentativas</strong>?</li>
  </ol>
</div>

### Resolução Detalhada

Este problema descreve uma série de ensaios de Bernoulli independentes, onde estamos interessados no número de tentativas até o primeiro sucesso. Isso é modelado pela **Distribuição Geométrica**.

Seja $X$ o número de tentativas até o primeiro sucesso. A probabilidade de sucesso é $p=0.4$. A fórmula da distribuição geométrica é:

$$ P(X = k) = (1-p)^{k-1} p $$

#### 1. Probabilidade de sucesso na primeira tentativa

Queremos encontrar $P(X=1)$. Usando a fórmula com $k=1$:

$$ P(X=1) = (1-0.4)^{1-1} \cdot 0.4 $$

$$ P(X=1) = (0.6)^0 \cdot 0.4 = 1 \cdot 0.4 = 0.4 $$

A probabilidade de sucesso na primeira tentativa é de **40%**.

#### 2. Probabilidade de sucesso na terceira tentativa

Queremos encontrar $P(X=3)$. Isso significa duas falhas seguidas de um sucesso.

$$ P(X=3) = (1-0.4)^{3-1} \cdot 0.4 $$

$$ P(X=3) = (0.6)^2 \cdot 0.4 = 0.36 \cdot 0.4 = 0.144 $$

A probabilidade de serem necessárias exatamente 3 tentativas é de **14,4%**.

#### 3. Probabilidade de precisar de mais de 4 tentativas

Queremos encontrar $P(X > 4)$. Isso significa que as primeiras 4 tentativas devem ser todas falhas. A probabilidade de uma única falha é $(1-p) = 0.6$.

$$ P(X > 4) = P(\text{falha na 1ª}) \cdot P(\text{falha na 2ª}) \cdot P(\text{falha na 3ª}) \cdot P(\text{falha na 4ª}) $$

$$ P(X > 4) = (1-p)^4 = (0.6)^4 $$

$$ P(X > 4) = 0.1296 $$

A probabilidade de precisar de mais de 4 tentativas para empinar a pipa é de **12,96%**.

<div style="border-left: 4px solid #4CAF50; padding: 0.5em; background-color: #e8f5e9; margin: 1em 0;">
  <strong>Resumo dos Resultados (Questão 5):</strong>
  <ul>
    <li>Probabilidade de sucesso na 1ª tentativa: <strong>40%</strong></li>
    <li>Probabilidade de sucesso na 3ª tentativa: <strong>14,4%</strong></li>
    <li>Probabilidade de precisar de > 4 tentativas: <strong>12,96%</strong></li>
  </ul>
</div>

<div style="border-left: 4px solid #009688; padding: 1em; background-color: #e0f2f1; margin: 1em 0; border-radius: 4px;">
  <img src="{{ site.baseurl }}/assets/images/boxkite.png" alt="Pipa de caixa (box kite)" style="float: right; width: 350px; margin-left: 1em; margin-bottom: 1em;">
  <h4 style="margin-top: 0;">🪁 Questão 6: Múltiplos Sucessos com a Pipa (Binomial Negativa)</h4>
  <p><strong>Enunciado:</strong></p>
  <p>O mesmo entusiasta de pipas, com uma probabilidade de sucesso de 40% em cada tentativa, agora quer conseguir empinar a pipa um total de 3 vezes para praticar uma manobra. As tentativas são independentes.</p>
  <p><strong>Pergunta-se:</strong></p>
  <ol>
    <li>Qual a probabilidade de o <strong>terceiro sucesso</strong> ocorrer exatamente na <strong>quinta tentativa</strong>?</li>
    <li>Qual é o <strong>número esperado de tentativas</strong> que ele precisará fazer para alcançar os 3 sucessos?</li>
  </ol>
</div>

### Resolução Detalhada

Este problema busca o número de tentativas necessárias para alcançar um número fixo de sucessos ($r$). Isso é modelado pela **Distribuição Binomial Negativa**.

Seja $X$ o número da tentativa em que o $r$-ésimo sucesso ocorre. A fórmula é:

$$ P(X = k) = \binom{k-1}{r-1} p^r (1-p)^{k-r} $$

Onde $r=3$ (sucessos), $p=0.4$ (probabilidade de sucesso), e $k$ é o número total de tentativas.

#### 1. Probabilidade do 3º sucesso na 5ª tentativa

Aqui, $r=3$ e $k=5$. Para que o 3º sucesso ocorra na 5ª tentativa, precisamos ter tido exatamente $r-1=2$ sucessos nas $k-1=4$ tentativas anteriores, e a 5ª tentativa deve ser um sucesso.

$$ P(X=5) = \binom{5-1}{3-1} (0.4)^3 (1-0.4)^{5-3} $$

$$ P(X=5) = \binom{4}{2} (0.4)^3 (0.6)^2 $$

Calculando os termos:
- $\binom{4}{2} = \frac{4!}{2!2!} = 6$
- $(0.4)^3 = 0.064$
- $(0.6)^2 = 0.36$
Juntando os resultados:

$$ P(X=5) = 6 \cdot 0.064 \cdot 0.36 = 0.13824 $$

A probabilidade de o terceiro sucesso ocorrer na quinta tentativa é de **13,82%**.

#### 2. Número esperado de tentativas

Para a distribuição binomial negativa, o valor esperado (ou média) do número de tentativas ($X$) para alcançar $r$ sucessos é dado pela fórmula:

$$ E[X] = \frac{r}{p} $$

Com $r=3$ e $p=0.4$:

$$ E[X] = \frac{3}{0.4} = 7.5 $$

O número esperado de tentativas para conseguir empinar a pipa 3 vezes é **7.5**.

---

## Referências

1. Ross, S. M. **Introduction to Probability Models**. 12ª ed. Academic Press, 2019.
2. Papoulis, A.; Pillai, S. U. **Probability, Random Variables and Stochastic Processes**. 4ª ed. McGraw-Hill, 2002.
3. Feller, W. **An Introduction to Probability Theory and Its Applications**. Vol. 1, 3ª ed. Wiley, 1968.
4. DeGroot, M. H.; Schervish, M. J. **Probability and Statistics**. 4ª ed. Pearson, 2012.
5. Mood, A. M.; Graybill, F. A.; Boes, D. C. **Introduction to the Theory of Statistics**. 3ª ed. McGraw-Hill, 1974.
