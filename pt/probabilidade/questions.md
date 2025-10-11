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

---

## Referências

1. Ross, S. M. **Introduction to Probability Models**. 12ª ed. Academic Press, 2019.
2. Papoulis, A.; Pillai, S. U. **Probability, Random Variables and Stochastic Processes**. 4ª ed. McGraw-Hill, 2002.
3. Feller, W. **An Introduction to Probability Theory and Its Applications**. Vol. 1, 3ª ed. Wiley, 1968.
4. DeGroot, M. H.; Schervish, M. J. **Probability and Statistics**. 4ª ed. Pearson, 2012.
5. Mood, A. M.; Graybill, F. A.; Boes, D. C. **Introduction to the Theory of Statistics**. 3ª ed. McGraw-Hill, 1974.
