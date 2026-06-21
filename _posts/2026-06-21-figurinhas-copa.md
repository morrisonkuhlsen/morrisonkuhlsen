---
layout: post
image: /assets/images/album-copa.avif
title: "Quanto custa completar o álbum de figurinhas da Copa do Mundo? R$ 7.316 — com a conta passo a passo"
categories: [PROBABILIDADE, ESTATÍSTICA]
lang: pt
tags: [Probabilidade, Estatística]
ref: figurinhas-copa-coletor-cupons
author: dante-bertuzzi
description: "Quanto gasta para completar o álbum de 980 figurinhas da Copa? R$ 7.316, segundo o problema do coletor de cupons. Resolução com números harmônicos, constante de Euler-Mascheroni, probabilidades e cálculos feitos à mão."
mathjax: true
---

<div style="border-left: 4px solid #f44336; padding: 1em; background-color: #ffebee; margin: 1em 0; border-radius: 4px;">
  <h4 style="margin-top: 0;">Pergunta</h4>
  <p>Um álbum da Copa do Mundo tem <strong>$m = 980$ figurinhas</strong> distintas. Cada figurinha comprada (em pacotinho unitário, a R$ 1,00 cada) vem com uma figurinha sorteada <strong>uniformemente</strong> entre as 980 possíveis, e as compras são independentes. <strong>Quanto se espera gastar, em reais, para completar o álbum?</strong></p>
</div>

<figure style="display: flex; flex-direction: column; align-items: center; margin: 2.5em 0 2em 0;">
  <img src="/assets/images/album-copa.avif" alt="Álbum de figurinhas da Copa com espaços vazios e pilhas de figurinhas repetidas." style="max-width: 50%; height: auto; border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.07);" />
  <figcaption class="img-caption-contrast">
    <strong>Figura:</strong> Comprar figurinhas novas fica cada vez mais difícil — e as repetidas vão se acumulando. A estatística explica exatamente por quê.
  </figcaption>
</figure>

---

## 1) Modelo do problema

Temos

$$
m = 980.
$$

Cada compra sorteia uma figurinha entre as $m$ possíveis, todas com a mesma probabilidade. Portanto, para uma figurinha específica,

$$
P(\text{sair essa figurinha}) = \frac{1}{m} = \frac{1}{980}.
$$

Mas o que interessa não é sair uma figurinha específica: o que interessa é sair uma **figurinha nova**, isto é, uma que a pessoa ainda não possui.

---

## 2) Probabilidade de sair uma figurinha nova

Suponha que a pessoa já tenha $k$ figurinhas diferentes coladas no álbum. Então ainda **faltam**

$$
m - k
$$

figurinhas.

Como todas as $m$ figurinhas são igualmente prováveis, a probabilidade de a próxima compra trazer uma figurinha nova é

$$
P_k = \frac{m - k}{m}.
$$

Por exemplo:

- Se $k = 0$, a pessoa não tem nenhuma figurinha. Então **qualquer compra será nova**:

  $$
  P_0 = \frac{m - 0}{m} = \frac{m}{m} = 1.
  $$

- Se $k = 1$, ela já tem uma figurinha diferente. Então faltam $m-1$:

  $$
  P_1 = \frac{m - 1}{m}.
  $$

- Se $k = m - 1$, falta apenas **uma** figurinha:

  $$
  P_{m-1} = \frac{m - (m-1)}{m} = \frac{1}{m}.
  $$

Perceba a dificuldade crescente: quando você está quase completando o álbum, a chance de tirar uma figurinha nova é de apenas $1$ em $980$.

---

## 3) Esperança até aparecer uma figurinha nova

Defina $T_k$ como o **número de compras** necessárias para passar de $k$ figurinhas diferentes para $k+1$ figurinhas diferentes.

A cada compra, a probabilidade de sucesso é

$$
P_k = \frac{m - k}{m}.
$$

Logo, $T_k$ segue uma **distribuição geométrica** com parâmetro $P_k$.

### Recordação: esperança da distribuição geométrica

Se $T \sim \text{Geom}(p)$, então

$$
P(T = t) = (1-p)^{\,t-1}\,p, \quad t = 1, 2, 3, \dots
$$

A esperança é:

$$
\begin{aligned}
E(T) &= \sum_{t=1}^{\infty} t\,P(T = t) \\
&= \sum_{t=1}^{\infty} t\,(1-p)^{\,t-1}\,p \\
&= p\sum_{t=1}^{\infty} t\,(1-p)^{\,t-1}.
\end{aligned}
$$

Sabemos que, para $|q| < 1$,

$$
\sum_{t=1}^{\infty} t\,q^{\,t-1} = \frac{1}{(1-q)^2}.
$$

Aqui, $q = 1 - p$. Então

$$
\sum_{t=1}^{\infty} t\,(1-p)^{\,t-1} = \frac{1}{(1 - (1-p))^2} = \frac{1}{p^2}.
$$

Logo,

$$
E(T) = p \cdot \frac{1}{p^2} = \frac{1}{p}.
$$

### Aplicando ao nosso problema

No nosso caso, $p = P_k = \dfrac{m - k}{m}$. Portanto,

$$
E(T_k) = \frac{1}{P_k} = \frac{1}{\frac{m - k}{m}} = \frac{m}{m - k}.
$$

> **Interpretação:** quando faltam $m - k$ figurinhas, você espera comprar $\dfrac{m}{m - k}$ figurinhas até conseguir **uma** nova.

---

## 4) Soma dos tempos esperados

O tempo total para completar o álbum é

$$
T = T_0 + T_1 + T_2 + \cdots + T_{m-1}.
$$

Tomando esperança dos dois lados (a esperança é linear):

$$
E(T) = E(T_0) + E(T_1) + E(T_2) + \cdots + E(T_{m-1}).
$$

Substituindo $E(T_k) = \dfrac{m}{m - k}$:

$$
E(T) = \frac{m}{m-0} + \frac{m}{m-1} + \frac{m}{m-2} + \cdots + \frac{m}{m-(m-2)} + \frac{m}{m-(m-1)}.
$$

Simplificando cada denominador:

$$
\begin{aligned}
m - 0 &= m, \\
m - 1 &= m - 1, \\
m - 2 &= m - 2, \\
&\;\;\vdots \\
m - (m-2) &= 2, \\
m - (m-1) &= 1.
\end{aligned}
$$

Então

$$
E(T) = \frac{m}{m} + \frac{m}{m-1} + \frac{m}{m-2} + \cdots + \frac{m}{2} + \frac{m}{1}.
$$

Colocando $m$ em evidência:

$$
E(T) = m\!\left(\frac{1}{m} + \frac{1}{m-1} + \frac{1}{m-2} + \cdots + \frac{1}{2} + \frac{1}{1}\right).
$$

Como a ordem da soma não altera o valor, podemos escrever de trás para frente:

$$
E(T) = m\!\left(1 + \frac{1}{2} + \frac{1}{3} + \cdots + \frac{1}{m}\right).
$$

A soma

$$
H_m = 1 + \frac{1}{2} + \frac{1}{3} + \cdots + \frac{1}{m} = \sum_{i=1}^{m} \frac{1}{i}
$$

é o **número harmônico de ordem $m$**.

Portanto,

$$
\boxed{E(T) = m\,H_m}.
$$

> Este é o resultado exato. O problema se reduz a calcular o número harmônico $H_m$.

---

## 5) Aplicando $m = 980$

Como $m = 980$, temos

$$
E(T) = 980\,H_{980}.
$$

Isto é,

$$
E(T) = 980\!\left(1 + \frac{1}{2} + \frac{1}{3} + \cdots + \frac{1}{980}\right).
$$

Essa é a **resposta exata**: $E(T) = 980\,H_{980}$.

Agora precisamos **aproximar** $H_{980}$ numericamente.

---

## 6) De onde vem a constante de Euler-Mascheroni?

O número harmônico é

$$
H_n = 1 + \frac{1}{2} + \frac{1}{3} + \cdots + \frac{1}{n}.
$$

Para aproximar essa soma, comparamos com a integral

$$
\int_{1}^{n} \frac{1}{x}\,dx = \ln(n).
$$

Assim, $H_n$ cresce **aproximadamente** como $\ln(n)$.

Mas $H_n$ não é igual a $\ln(n)$. Existe uma **diferença** entre a soma discreta

$$
1 + \frac{1}{2} + \frac{1}{3} + \cdots + \frac{1}{n}
$$

e a área contínua $\displaystyle\int_{1}^{n} \frac{1}{x}\,dx$.

Essa diferença tende a uma **constante** quando $n \to \infty$. Essa constante é $\gamma$.

Formalmente,

$$
\gamma = \lim_{n\to\infty} \big(H_n - \ln(n)\big).
$$

Ou seja,

$$
\gamma = \lim_{n\to\infty} \left(1 + \frac{1}{2} + \frac{1}{3} + \cdots + \frac{1}{n} - \ln(n)\right).
$$

Esse número é chamado de **constante de Euler-Mascheroni**.

Numericamente,

$$
\gamma \approx 0{,}5772156649.
$$

Portanto, para $n$ grande,

$$
H_n \approx \ln(n) + \gamma.
$$

Mais precisamente, usando a expansão de Euler-Maclaurin:

$$
H_n \approx \ln(n) + \gamma + \frac{1}{2n} - \frac{1}{12n^2} + \frac{1}{120n^4} - \cdots
$$

---

## 7) Cálculo manual aproximado de $\gamma$

Para ver como aparece o valor $\gamma \approx 0{,}5772$, podemos usar a fórmula refinada

$$
H_n \approx \ln(n) + \gamma + \frac{1}{2n} - \frac{1}{12n^2} + \frac{1}{120n^4}.
$$

Isolando $\gamma$:

$$
\gamma \approx H_n - \ln(n) - \frac{1}{2n} + \frac{1}{12n^2} - \frac{1}{120n^4}.
$$

Vamos usar $n = 10$, porque $H_{10}$ pode ser calculado à mão.

### Cálculo de $H_{10}$

$$
\begin{aligned}
H_{10} &= 1 + \frac{1}{2} + \frac{1}{3} + \frac{1}{4} + \frac{1}{5} + \frac{1}{6} + \frac{1}{7} + \frac{1}{8} + \frac{1}{9} + \frac{1}{10}.
\end{aligned}
$$

Somando passo a passo com denominador comum:

$$
\begin{aligned}
1 + \frac{1}{2} &= \frac{3}{2}. \\[4pt]
\frac{3}{2} + \frac{1}{3} &= \frac{9}{6} + \frac{2}{6} = \frac{11}{6}. \\[4pt]
\frac{11}{6} + \frac{1}{4} &= \frac{44}{24} + \frac{6}{24} = \frac{50}{24} = \frac{25}{12}. \\[4pt]
\frac{25}{12} + \frac{1}{5} &= \frac{125}{60} + \frac{12}{60} = \frac{137}{60}. \\[4pt]
\frac{137}{60} + \frac{1}{6} &= \frac{137}{60} + \frac{10}{60} = \frac{147}{60} = \frac{49}{20}. \\[4pt]
\frac{49}{20} + \frac{1}{7} &= \frac{343}{140} + \frac{20}{140} = \frac{363}{140}. \\[4pt]
\frac{363}{140} + \frac{1}{8} &= \frac{2904}{1120} + \frac{140}{1120} = \frac{3044}{1120} = \frac{761}{280}. \\[4pt]
\frac{761}{280} + \frac{1}{9} &= \frac{6849}{2520} + \frac{280}{2520} = \frac{7129}{2520}. \\[4pt]
\frac{7129}{2520} + \frac{1}{10} &= \frac{7129}{2520} + \frac{252}{2520} = \frac{7381}{2520}.
\end{aligned}
$$

Logo,

$$
H_{10} = \frac{7381}{2520}.
$$

Fazendo a divisão:

$$
H_{10} \approx 2{,}928968254.
$$

Agora usamos $\ln(10) \approx 2{,}302585093$.

### Aproximando $\gamma$

$$
\begin{aligned}
\gamma &\approx H_{10} - \ln(10) - \frac{1}{2\cdot 10} + \frac{1}{12\cdot 10^2} - \frac{1}{120\cdot 10^4} \\[4pt]
&\approx 2{,}928968254 - 2{,}302585093 - \frac{1}{20} + \frac{1}{1200} - \frac{1}{1200000}.
\end{aligned}
$$

Calculando cada fração:

$$
\frac{1}{20} = 0{,}05, \qquad
\frac{1}{1200} \approx 0{,}000833333, \qquad
\frac{1}{1200000} \approx 0{,}000000833.
$$

Então

$$
\begin{aligned}
\gamma &\approx 2{,}928968254 - 2{,}302585093 - 0{,}05 + 0{,}000833333 - 0{,}000000833 \\[4pt]
&= 0{,}626383161 - 0{,}05 + 0{,}000833333 - 0{,}000000833 \\[4pt]
&= 0{,}576383161 + 0{,}000833333 - 0{,}000000833 \\[4pt]
&= 0{,}577216494 - 0{,}000000833 \\[4pt]
&= 0{,}577215661.
\end{aligned}
$$

Arredondando:

$$
\boxed{\gamma \approx 0{,}5772}.
$$

É desse limite entre soma harmônica e logaritmo que nasce o valor usado na aproximação.

---

## 8) Cálculo de $H_{980}$

Usando a aproximação principal,

$$
H_n \approx \ln(n) + \gamma,
$$

temos

$$
H_{980} \approx \ln(980) + \gamma.
$$

### Calculando $\ln(980)$

Escrevemos

$$
980 = 1000 \cdot 0{,}98.
$$

Pela propriedade dos logaritmos,

$$
\ln(980) = \ln(1000 \cdot 0{,}98) = \ln(1000) + \ln(0{,}98).
$$

Agora, $1000 = 10^3$. Logo,

$$
\ln(1000) = \ln(10^3) = 3\ln(10).
$$

Como $\ln(10) \approx 2{,}302585093$, temos

$$
\ln(1000) \approx 3 \cdot 2{,}302585093 = 6{,}907755279.
$$

Agora calculamos $\ln(0{,}98)$.

Como $0{,}98 = 1 - 0{,}02$, usamos a expansão

$$
\ln(1 - x) = -\left(x + \frac{x^2}{2} + \frac{x^3}{3} + \frac{x^4}{4} + \cdots\right).
$$

Aqui, $x = 0{,}02$.

Calculamos os termos:

$$
\begin{aligned}
x &= 0{,}02, \\[4pt]
\frac{x^2}{2} &= \frac{0{,}0004}{2} = 0{,}0002, \\[4pt]
\frac{x^3}{3} &= \frac{0{,}000008}{3} \approx 0{,}000002667, \\[4pt]
\frac{x^4}{4} &= \frac{0{,}00000016}{4} = 0{,}00000004.
\end{aligned}
$$

Somando:

$$
x + \frac{x^2}{2} + \frac{x^3}{3} + \frac{x^4}{4} \approx 0{,}02 + 0{,}0002 + 0{,}000002667 + 0{,}00000004 = 0{,}020202707.
$$

Portanto,

$$
\ln(0{,}98) \approx -0{,}020202707.
$$

Logo,

$$
\begin{aligned}
\ln(980) &\approx 6{,}907755279 - 0{,}020202707 \\
&= 6{,}887552572.
\end{aligned}
$$

### Somando a constante de Euler-Mascheroni

$$
\begin{aligned}
H_{980} &\approx \ln(980) + \gamma \\
&\approx 6{,}887552572 + 0{,}577215661 \\
&= 7{,}464768233.
\end{aligned}
$$

---

## 9) Cálculo do valor esperado

Como $E(T) = 980\,H_{980}$, temos

$$
E(T) \approx 980 \cdot 7{,}464768233.
$$

Multiplicamos à mão usando $980 = 1000 - 20$:

$$
\begin{aligned}
980 \cdot 7{,}464768233 &= (1000 - 20) \cdot 7{,}464768233 \\
&= 1000 \cdot 7{,}464768233 - 20 \cdot 7{,}464768233 \\
&= 7464{,}768233 - 149{,}29536466 \\
&= 7315{,}47286834.
\end{aligned}
$$

Assim, pela aproximação $H_n \approx \ln(n) + \gamma$, obtemos

$$
E(T) \approx 7315{,}47.
$$

Como cada figurinha custa **R$ 1,00**, o gasto esperado é

$$
\boxed{\text{R\$ } 7315{,}47}.
$$

Arredondando para reais inteiros: **R$ 7316,00**.

---

## 10) Resultado mais preciso

A aproximação $H_n \approx \ln(n) + \gamma$ ignora termos pequenos. Para $n = 980$, podemos melhorar usando

$$
H_n \approx \ln(n) + \gamma + \frac{1}{2n} - \frac{1}{12n^2}.
$$

Então

$$
H_{980} \approx \ln(980) + \gamma + \frac{1}{2\cdot 980} - \frac{1}{12\cdot 980^2}.
$$

Já temos $\ln(980) + \gamma \approx 7{,}464768233$.

Agora:

$$
\frac{1}{2\cdot 980} = \frac{1}{1960} \approx 0{,}000510204.
$$

Além disso, $980^2 = 960\,400$, logo

$$
\frac{1}{12\cdot 980^2} = \frac{1}{12\cdot 960\,400} = \frac{1}{11\,524\,800} \approx 0{,}0000000868.
$$

Assim,

$$
\begin{aligned}
H_{980} &\approx 7{,}464768233 + 0{,}000510204 - 0{,}0000000868 \\
&= 7{,}465278350.
\end{aligned}
$$

Agora,

$$
\begin{aligned}
E(T) &\approx 980 \cdot 7{,}465278350 \\
&= (1000 - 20) \cdot 7{,}465278350 \\
&= 7465{,}278350 - 149{,}305567 \\
&= 7315{,}972783.
\end{aligned}
$$

Portanto, com a **aproximação refinada**,

$$
E(T) \approx 7315{,}97.
$$

Como cada figurinha custa R$ 1,00, o gasto esperado é

$$
\boxed{\text{R\$ } 7315{,}97}.
$$

Arredondando:

$$
\boxed{\text{R\$ } 7316{,}00}.
$$

---

## 11) Panorama de probabilidades ao longo da coleção

<div style="border-left: 4px solid #E91E63; padding: 1em; background-color: #fce4ec; margin: 1em 0; border-radius: 4px;">
  <h4 style="margin-top: 0;">O que está por trás de cada compra</h4>
  <p>A cada figurinha comprada, a probabilidade de ser <strong>nova</strong> ou <strong>repetida</strong> depende unicamente de quantas você já tem. Abaixo, os momentos mais dramáticos da jornada.</p>
</div>

### A fórmula geral (recapitulando)

Com $k$ figurinhas no álbum:

$$
P(\text{nova}) = \frac{m - k}{m}, \qquad
P(\text{repetida}) = \frac{k}{m}.
$$

### Tabela de probabilidades em marcos da coleção

<table class="mk-table">
  <thead>
    <tr><th>Figurinhas já coladas ($k$)</th><th>% do álbum</th><th>P(nova)</th><th>P(repetida)</th><th>Compra esperada até a próxima nova</th></tr>
  </thead>
  <tbody>
    <tr><td>$0$</td><td>$0\%$</td><td>$1 = 100\%$</td><td>$0$</td><td>$1$ compra</td></tr>
    <tr><td>$98$</td><td>$10\%$</td><td>$\frac{882}{980} \approx 90{,}0\%$</td><td>$10{,}0\%$</td><td>$\approx 1{,}11$ compras</td></tr>
    <tr><td>$245$</td><td>$25\%$</td><td>$\frac{735}{980} = 75{,}0\%$</td><td>$25{,}0\%$</td><td>$\approx 1{,}33$ compras</td></tr>
    <tr><td>$490$</td><td>$50\%$</td><td>$\frac{490}{980} = 50{,}0\%$</td><td>$50{,}0\%$</td><td>$2$ compras</td></tr>
    <tr><td>$735$</td><td>$75\%$</td><td>$\frac{245}{980} = 25{,}0\%$</td><td>$75{,}0\%$</td><td>$4$ compras</td></tr>
    <tr><td>$882$</td><td>$90\%$</td><td>$\frac{98}{980} = 10{,}0\%$</td><td>$90{,}0\%$</td><td>$10$ compras</td></tr>
    <tr><td>$970$</td><td>$\approx 99\%$</td><td>$\frac{10}{980} \approx 1{,}02\%$</td><td>$\approx 98{,}98\%$</td><td>$98$ compras</td></tr>
    <tr><td>$979$</td><td>$\approx 99{,}9\%$</td><td>$\frac{1}{980} \approx 0{,}102\%$</td><td>$\approx 99{,}898\%$</td><td>$980$ compras</td></tr>
  </tbody>
</table>

> **Leitura da tabela:** quando você está na metade do álbum ($k = 490$), cada compra ainda tem 50% de chance de ser nova — um "cara ou coroa". Mas quando você já colou 90% do álbum ($k = 882$), só 1 em cada 10 compras virá com figurinha inédita. E quando falta **uma única figurinha** ($k = 979$), você precisa em média de **980 compras** — ou R$ 980,00 — só para achá-la.

### O drama da última figurinha

Quando $k = 979$ (falta só uma), a probabilidade de sucesso em cada compra é

$$
p = \frac{1}{980} \approx 0{,}00102 = 0{,}102\%.
$$

O número de compras $T_{979}$ segue $\text{Geom}(1/980)$. Algumas perguntas que você pode se fazer:

**Qual a chance de achar a última logo na primeira compra?**

$$
P(T_{979} = 1) = \frac{1}{980} \approx 0{,}102\%.
$$

**Qual a chance de precisar de mais de 500 compras?**

$$
\begin{aligned}
P(T_{979} > 500) &= \left(\frac{979}{980}\right)^{500} \\[4pt]
&= \left(1 - \frac{1}{980}\right)^{500} \\[4pt]
&\approx e^{-500/980} \approx e^{-0{,}5102} \approx 0{,}600 = 60{,}0\%.
\end{aligned}
$$

**Qual a chance de precisar de mais de 980 compras?**

$$
P(T_{979} > 980) = \left(\frac{979}{980}\right)^{980} \approx e^{-1} \approx 0{,}368 = 36{,}8\%.
$$

> Isso significa que, quando você chega na reta final, a chance de gastar **mais de R$ 980,00** só para conseguir a última figurinha é de quase **37%**. Nada desprezível.

**Quantas compras são necessárias para ter 50% de chance de já ter achado a última?** (Mediana da geométrica)

Resolvemos $P(T_{979} \le t) = 0{,}5$, ou seja, $1 - (979/980)^t = 0{,}5$. Então

$$
\left(\frac{979}{980}\right)^t = 0{,}5 \implies t = \frac{\ln(0{,}5)}{\ln(979/980)} \approx \frac{-0{,}6931}{-0{,}001021} \approx 679.
$$

Portanto, você tem **50% de chance** de achar a última figurinha em até **679 compras** — e 50% de precisar de mais do que isso.

**Probabilidade de achar a última em até $t$ compras:**

$$
\begin{aligned}
P(T_{979} \le 10) &= 1 - \left(\frac{979}{980}\right)^{10} \approx 1{,}02\%, \\[4pt]
P(T_{979} \le 100) &= 1 - \left(\frac{979}{980}\right)^{100} \approx 9{,}7\%, \\[4pt]
P(T_{979} \le 500) &\approx 40{,}0\%, \\[4pt]
P(T_{979} \le 980) &\approx 63{,}2\%, \\[4pt]
P(T_{979} \le 2000) &\approx 87{,}0\%.
\end{aligned}
$$

Ou seja, mesmo depois de **2000 compras** (R$ 2000,00) focadas só na última figurinha, ainda há **13% de chance** de não tê-la encontrado.

### O ponto de equilíbrio: metade do álbum

Com $k = 490$ (metade das figurinhas coladas), $P(\text{nova}) = 50\%$. É o único momento em que a coleção é um jogo justo:

$$
E(T_{490}) = \frac{980}{490} = 2 \text{ compras}.
$$

A partir daí, cada figurinha nova vai ficando mais rara. O gasto **acelera**.

### Quanto custa cada "terço" do álbum?

Usando a soma parcial dos números harmônicos:

- **Primeiro terço** ($k = 0$ até $k \approx 327$):

  $$
  E(\text{compras}) = 980\left(\frac{1}{980} + \frac{1}{979} + \cdots + \frac{1}{654}\right) \approx 980 \cdot 0{,}405 \approx 397 \text{ compras}.
  $$

  Gasto: **\~R$ 397,00** (apenas 5,4% do custo total).

- **Segundo terço** ($k \approx 327$ até $k \approx 653$):

  $$
  E(\text{compras}) \approx 980\left(\frac{1}{653} + \cdots + \frac{1}{327}\right) \approx 980 \cdot 0{,}693 \approx 679 \text{ compras}.
  $$

  Gasto: **\~R$ 679,00** (9,3% do custo total).

- **Último terço** ($k \approx 653$ até $k = 979$):

  $$
  E(\text{compras}) \approx 7316 - 397 - 679 = 6240 \text{ compras}.
  $$

  Gasto: **\~R$ 6240,00** (incríveis **85% do custo total**).

<div style="border-left: 4px solid #FF9800; padding: 1em; background-color: #fff3e0; margin: 1em 0; border-radius: 4px;">
  <h4 style="margin-top: 0;">Moral da história</h4>
  <p>Os <strong>primeiros 654 espaços</strong> do álbum custam menos de R$ 1.100,00. Os <strong>últimos 327 espaços</strong> custam mais de R$ 6.200,00. A coleção não é linear — ela é <strong>brutalmente concentrada no final</strong>.</p>
</div>

---

## 12) Interpretação e comentários finais

O que este resultado significa na prática?

- **Valor esperado não é garantia.** O número R$ 7316,00 é a **média** do gasto se você repetisse o experimento (completar o álbum do zero) infinitas vezes. Na vida real, você pode gastar mais ou menos — a variância do tempo de coleta é considerável.
- **As últimas figurinhas são as mais caras.** Quando você já tem 979 figurinhas, a probabilidade de tirar a última é de apenas $1/980 \approx 0{,}102\%$. Nessa etapa, você espera comprar **980 figurinhas** (gastar R$ 980,00) só para conseguir a última — e ainda assim, 37% das pessoas precisarão de **mais** do que isso.
- **85% do gasto vai para o último terço do álbum.** Os primeiros 654 espaços custam cerca de R$ 1.076; os últimos 327 custam R$ 6.240. É a **lei dos rendimentos decrescentes do coletor** levada ao extremo.
- **Trocar figurinhas reduz drasticamente o custo.** Se você tem amigos com álbuns incompletos, a troca de repetidas faz o gasto real cair muito abaixo desse valor teórico — porque o modelo com troca é diferente: cada figurinha repetida deixa de ser "desperdício" e vira moeda de troca.

### A resposta exata é

$$
\boxed{E(T) = 980\,H_{980}},
$$

e a resposta numérica arredondada é

$$
\boxed{\text{R\$ } 7316{,}00}.
$$

---

## Referência rápida (para revisar em 30 segundos)

<div style="border-left: 4px solid #2196F3; padding: 0.5em; background-color: #e3f2fd; margin: 1em 0;">
  <strong>Checklist</strong>
  <ul>
    <li>Problema do <strong>coletor de cupons</strong> com $m$ itens distintos e sorteio uniforme.</li>
    <li>Probabilidade de figurinha nova quando se tem $k$: $P_k = \dfrac{m-k}{m}$.</li>
    <li>Tempo até a próxima nova segue <strong>geométrica</strong> com $E(T_k) = \dfrac{m}{m-k}$.</li>
    <li>Tempo total esperado: $E(T) = m\,H_m = m\left(1 + \frac{1}{2} + \cdots + \frac{1}{m}\right)$.</li>
    <li>Para $m$ grande: $H_m \approx \ln(m) + \gamma$, com $\gamma \approx 0{,}5772$ (Euler-Mascheroni).</li>
    <li>Para $m = 980$: $E(T) \approx 7316$ figurinhas $\Rightarrow$ <strong>R$ 7316,00</strong>.</li>
    <li>Marco importante: com $k = 490$ (metade), $P(\text{nova}) = 50\%$; com $k = 979$ (falta 1), $P(\text{nova}) \approx 0{,}1\%$.</li>
    <li>Última figurinha: $37\%$ de chance de precisar de <strong>mais de 980 compras</strong> só para achá-la.</li>
    <li>$85\%$ do gasto total concentra-se no <strong>último terço</strong> do álbum.</li>
  </ul>
</div>

---

<style>
.mk-table {
  width: 100%;
  border-collapse: collapse;
  margin: 1em 0;
  font-size: 0.95rem;
}
.mk-table thead tr {
  background-color: #17324d;
  color: #ffffff;
}
.mk-table th {
  padding: 14px 18px;
  text-align: center;
  font-weight: 700;
  letter-spacing: 0.02em;
}
.mk-table td {
  padding: 12px 18px;
  text-align: center;
  color: #17324d;
}
.mk-table tbody tr:nth-child(odd) {
  background-color: #f5f6f7;
}
.mk-table tbody tr:nth-child(even) {
  background-color: #ffffff;
}
.mk-table tbody tr:last-child td {
  font-weight: 700;
}

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

<!-- Fim do artigo -->
