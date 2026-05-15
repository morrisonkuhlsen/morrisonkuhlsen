---
layout: post
image: /assets/images/percentage.avif
title: "Porcentagem — fórmulas e exemplos resolvidos."
categories: [MATEMÁTICA, GUIA]
tags: [matemática, porcentagem, álgebra]
lang: pt
ref: porcentagens
author: dante-bertuzzi
description: "Guia prático de porcentagens: fórmulas e exemplos resolvidos."
mathjax: true
---

Porcentagem é uma forma de comparar quantidades usando a ideia de “por cem” (do símbolo %). Em vez de dizer “0,25”, você pode dizer 25%, o que facilita muito interpretar descontos, aumentos, juros, impostos, probabilidades, estatísticas, gráficos e relatórios do dia a dia.

<div style="text-align:center; margin-bottom:1rem;">
	<img src="/assets/images/percentage.avif" alt="Capa: porcentagem" style="max-width:560px; width:100%; height:auto;">
</div>

## 1. Calcular $p\%$ de um valor

$$R = V \cdot \frac{p}{100}$$

**Exemplo:** Calcular $10\%$ de $500$.

<div style="text-align:center">
$$
\begin{aligned}
R &= 500 \cdot \frac{10}{100} \\
	&= 500 \cdot 0{,}10 \\
\end{aligned}
$$
$$\boxed{R = 50}$$
</div>

## 2. Descobrir o valor total (base)

$$V = \frac{T}{p/100} = \frac{T \cdot 100}{p}$$

**Exemplo:** Uma taxa de $450$ corresponde a $5\%$ do valor total.

<div style="text-align:center">
$$
\begin{aligned}
V &= \frac{450}{5/100} \\
	&= \frac{450}{0{,}05} \\
\end{aligned}
$$
$$\boxed{V = 9\!000}$$
</div>

## 3. Descobrir a porcentagem

$$p = \frac{T}{V} \cdot 100$$

**Exemplo:** $200$ é quantos porcento de $800$?

<div style="text-align:center">
$$
\begin{aligned}
p &= \frac{200}{800} \cdot 100 \\
	&= 0{,}25 \cdot 100 \\
\end{aligned}
$$
$$\boxed{p = 25\%}$$
</div>

## 4. Aumento percentual

$$V_f = V \cdot \left(1 + \frac{p}{100}\right)$$

**Exemplo:** Aumentar $1.000$ em $12\%$.

<div style="text-align:center">
$$
\begin{aligned}
V_f &= 1.000 \cdot \left(1 + \frac{12}{100}\right) \\
	&= 1.000 \cdot (1 + 0{,}12) \\
	&= 1.000 \cdot 1{,}12 \\
\end{aligned}
$$
$$\boxed{V_f = 1{,}120}$$
</div>

## 5. Desconto percentual

$$V_f = V \cdot \left(1 - \frac{p}{100}\right)$$

**Exemplo:** Aplicar desconto de $25\%$ sobre $800$.

<div style="text-align:center">
$$
\begin{aligned}
V_f &= 800 \cdot \left(1 - \frac{25}{100}\right) \\
	&= 800 \cdot (1 - 0{,}25) \\
	&= 800 \cdot 0{,}75 \\
\end{aligned}
$$
$$\boxed{V_f = 600}$$
</div>

## 6. Valor original antes do aumento

$$V = \frac{V_f}{1 + \frac{p}{100}}$$

**Exemplo:** Após aumento de $20\%$, o valor passou a ser $1.200$.

<div style="text-align:center">
$$
\begin{aligned}
V &= \frac{1.200}{1 + \frac{20}{100}} \\
	&= \frac{1.200}{1{,}20} \\
\end{aligned}
$$
$$\boxed{V = 1{,}000}$$
</div>

## 7. Valor original antes do desconto

$$V = \frac{V_f}{1 - \frac{p}{100}}$$

**Exemplo:** Após desconto de $10\%$, o valor ficou $900$.

<div style="text-align:center">
$$
\begin{aligned}
V &= \frac{900}{1 - \frac{10}{100}} \\
	&= \frac{900}{0{,}90} \\
\end{aligned}
$$
$$\boxed{V = 1{,}000}$$
</div>

## 8. Variação percentual

$$\Delta\% = \frac{V_f - V_i}{V_i} \cdot 100$$

**Exemplo:** De $500$ para $650$.

<div style="text-align:center">
$$
\begin{aligned}
\Delta\% &= \frac{650 - 500}{500} \cdot 100 \\
		 &= \frac{150}{500} \cdot 100 \\
\end{aligned}
$$
$$\boxed{\Delta\% = 30\%}$$
</div>

## 9. Porcentagens sucessivas

Ao realizar porcentagens sucessivas, os efeitos não se anulam necessariamente. Exemplo:

$$(1 + a)(1 - b) \neq 1$$

**Exemplo:** Aumento de $20\%$ seguido de desconto de $20\%$.

<div style="text-align:center">
$$
\begin{aligned}
V &= 1 \cdot 1{,}20 \cdot 0{,}80 \\
	&= 0{,}96 \\
\end{aligned}
$$
$$\boxed{\text{Perda real de } 4\%}$$
</div>

## 10. Porcentagem de outra porcentagem (ex.: $12\%$ de $95\%$)

Quando queremos aplicar uma porcentagem sobre outra porcentagem (por exemplo, $12\%$ de $95\%$), convertemos cada porcentagem em sua forma decimal e multiplicamos. Em termos gerais:

$$
	ext{(p\% de q\%)} = \frac{p}{100} \cdot \frac{q}{100} = \frac{p\,q}{10000}
$$

Para expressar o resultado novamente em porcentagem, multiplicamos por $100$:

$$
	ext{(p\% de q\%) em \%} = \frac{p\,q}{100}
$$

Exemplo: calcular $12\%$ de $95\%$.

Exemplo: calcular $12\%$ de $95\%$ — usando a multiplicação direta e cortando um zero:

$$
\frac{12}{100}\cdot\frac{95}{100}=\frac{12\cdot95}{10000}
$$

Primeiro calcule $12\cdot95$:

$$
12\times95=1140
$$

Então temos a fração $\dfrac{1140}{10000}$. Podemos "cortar" um zero no numerador com um zero no denominador (dividindo ambos por $10$):

$$
\frac{1140}{10000}=\frac{114\cancel{0}}{1000\cancel{0}}=\frac{114}{1000}
$$

Agora simplificamos dividindo por $2$:

$$
\frac{114}{1000}=\frac{57}{500}
$$

Convertendo para decimal e porcentagem:

$$
\frac{57}{500}=0{,}114=11{,}4\%.
$$

Portanto, $12\%$ de $95\%$ corresponde a $11{,}4\%$, mostrado com a abordagem desejada (multiplicação direta e cancelamento de um zero).

## Atalho: multiplicar e "cortar 2 zeros"

Regra rápida: para calcular $p\%$ de um valor $V$ você pode usar

$$
p\%\text{ de }V = \frac{p\cdot V}{100}
$$

Um atalho prático é calcular primeiro $p\cdot V$ e depois "cortar dois zeros" (ou seja, dividir por $100$, que equivale a mover a vírgula duas casas para a esquerda). Exemplos (do quadro):

$$
5\%\text{ de }400:\quad 5\times4\cancel{0}\cancel{0}=20\ \Rightarrow\ \text{cortar dois zeros}\ \Rightarrow\ 20
$$

$$
30\%\text{ de }80:\quad 3\cancel{0}\times8\cancel{0}=24\ \Rightarrow\ \text{cortar dois zeros}\ \Rightarrow\ 24
$$

$$
30\%\text{ de }500:\quad 30\times5\cancel{0}\cancel{0}=150\ \Rightarrow\ \text{cortar dois zeros}\ \Rightarrow\ 150
$$

$$
6\%\text{ de }60:\quad 6\times6\cancel{0}=36\ \Rightarrow\ \text{cortar um zero e anda uma vírgula para esquerda}\ \Rightarrow\ 3{,}6
$$

$$
60\%\text{ de }683:\quad 6\cancel{0}\times683=4.098\ \Rightarrow\ \text{cortar um zero e anda uma vírgula para esquerda}\ \Rightarrow\ 409{,}8
$$

$$
3\%\text{ de }240:\quad 3\times24\cancel{0}=72\ \Rightarrow\ \text{cortar um zero e anda uma vírgula para esquerda}\ \Rightarrow\ 7{,}2
$$

$$
2\%\text{ de }252:\quad 2\times252=504\ \Rightarrow\ \text{como não tem zero, a vírgula anda duas casas para esquerda}\ \Rightarrow\ 5,04
$$

$$
5\%\text{ de }0,43:\quad 5\times\cancel{0},43=0,0215\ \Rightarrow\ \text{como é um número decimal, a vírgula anda duas casas para esquerda}\ \Rightarrow\ 0,0215
$$

<div style="border-left: 4px solid #ff9800; padding: 0.5em; background-color: #fff3e0; margin: 1em 0;">
⚠️<strong>Observação</strong>: quando o produto não termina em zeros, você coloca a vírgula movendo-a duas casas para a esquerda (por exemplo, $630\to6{,}30$). Esse é um atalho útil para cálculos mentais e checagens rápidas.
</div>

---
## Conceitos adicionais e explicações

### Conceito formal de porcentagem
Porcentagem é uma razão comparada a 100. Dizer que algo é $p\%$ significa que a parte vale $\tfrac{p}{100}$ da totalidade.

### Conversões úteis
- Percentual → decimal: $p\% = \dfrac{p}{100}$. Ex.: $15\% = 0{,}15$.
- Decimal → percentual: $d = 0{,}23 \Rightarrow 23\%$.
- Percentual → fração: $p\% = \dfrac{p}{100}$ simplificada. Ex.: $50\% = \dfrac{1}{2}$.

### Avos ("n-avos") e nomenclatura
O termo "avos" refere-se a partes iguais de uma unidade: "n-avos" significa dividir a unidade em $n$ partes iguais e considerar quantas dessas partes temos. Por exemplo, 1/4 são "quatro avos" e 3/4 são "três quartos" (três avos de quatro).

Nomes tradicionais para denominadores comuns:
- $1/2$ — meio (ou "dois avos" quando se fala em número de partes)
- $1/3$ — um terço
- $1/4$ — um quarto
- $1/5$ — um quinto
- $1/6$ — um sexto
- $1/8$ — um oitavo

Nomenclatura por ordens de grandeza (usualmente usada com decimais e porcentagens):
- Décimos = $1/10$ ("10 avos")
- Centésimos = $1/100$ ("100 avos") — diretamente relacionado a porcentagens: $1\% = 1/100$.
- Milésimos = $1/1000$ ("1000 avos")

Quando usar cada forma:
- Use nomes tradicionais (meio, terço, quarto...) em linguagem corrente e quando o denominador pequeno facilita a leitura (receitas, frações simples).
- Use "décimos/centésimos/milésimos" ao relacionar com medidas decimais, precisão ou porcentagens (ex.: centésimos para porcentagens e notas com duas casas decimais).
- Use a notação "n-avos" (por exemplo, "15 avos de 100") quando for necessário destacar o número de partes iguais de forma genérica.

Exemplos rápidos:
- $\tfrac{1}{2} = 0{,}5 = 50\%$ (meio / dois avos).
- $\tfrac{1}{10} = 0{,}1 = 10\%$ (um décimo / 10 avos).
- $\tfrac{3}{100} = 0{,}03 = 3\%$ (três centésimos / 3 avos de 100).


### Pontos percentuais vs. variação percentual
- Se a taxa sobe de $5\%$ para $8\%$, o acréscimo é de 3 pontos percentuais.
- A variação percentual relativa é $\dfrac{8-5}{5}\cdot100 = 60\%$.

### Exemplos práticos adicionais
1. Converter $2{,}5\%$ para decimal e fração:
$$2{,}5\% = 0{,}025 = \dfrac{25}{1000} = \dfrac{1}{40}$$
2. Aumentar $250$ em $7{,}5\%$:
$$V_f = 250 \cdot \left(1 + \frac{7{,}5}{100}\right) = 250 \cdot 1{,}075 = 268{,}75$$

### Porcentagens ponderadas
Quando diferentes grupos têm pesos distintos, usa-se média ponderada:
$$\bar{p} = \frac{\sum_i w_i p_i}{\sum_i w_i}$$
Ex.: turma A (30 alunos) média 80%, turma B (20 alunos) média 70%:
$$\bar{p}=\frac{30\cdot80 + 20\cdot70}{30+20} = \frac{2400+1400}{50}=76\%$$

### Porcentagens compostas (sucessivas)
Aplicar $a\%$ e depois $b\%$ não é o mesmo que aplicar $(a+b)\%$, mas sim multiplicar fatores:
$$V_f = V\cdot\left(1+\frac{a}{100}\right)\left(1+\frac{b}{100}\right)$$
Ex.: dois aumentos de $10\%$: $1{,}1\cdot1{,}1=1{,}21$ → aumento total $21\%$.

### Erros comuns
- Confundir pontos percentuais com variação percentual.
- Somar porcentagens em situações compostas (porcentagens sucessivas).
- Não converter para decimal ao multiplicar valores.

### Dicas práticas
- Para estimativas rápidas: $10\%$ é dividir por 10; $5\%$ é metade de $10\%$; $1\%$ é dividir por 100.
- Use duas casas decimais em valores monetários e uma casa em percentuais para clareza.

### Exercícios propostos (com resposta)
1. Quanto é $18\%$ de $450$? — Resposta: $81$.
2. Se $x$ representa $12\%$ de $V$ e $x=36$, qual é $V$? — Resposta: $300$.
3. Uma mercadoria custa $200$; aplica-se desconto de $15\%$ e depois acréscimo de $10\%$. Qual o preço final? — Resposta: $200\cdot0{,}85\cdot1{,}10=187$.

---

### Questão — Venda Parcial de Loteamento e Comunicação DOI no Cartório de Imóveis

Cinco pessoas são coproprietárias de um loteamento urbano com área total de $2.000\ \text{m}^2$. O imóvel está registrado em matrícula no Cartório de Registro de Imóveis, e cada coproprietário possui uma fração ideal sobre o imóvel.

Entretanto, apenas quatro coproprietários irão vender suas respectivas partes ideais. A quinta pessoa possui $35\%$ do imóvel e não participará da venda.

A distribuição das frações ideais é a seguinte:

<table style="margin: 1rem auto; border-collapse: collapse; text-align: center;">
  <thead>
    <tr style="background-color: #1565c0; color: #fff;">
      <th style="border: 1px solid #90caf9; padding: 8px 16px;">Pessoa</th>
      <th style="border: 1px solid #90caf9; padding: 8px 16px;">Percentual real sobre o imóvel</th>
      <th style="border: 1px solid #90caf9; padding: 8px 16px;">Situação</th>
    </tr>
  </thead>
  <tbody>
    <tr style="background-color: #e3f2fd;">
      <td style="border: 1px solid #90caf9; padding: 8px 16px;">Marcos</td>
      <td style="border: 1px solid #90caf9; padding: 8px 16px;">40%</td>
      <td style="border: 1px solid #90caf9; padding: 8px 16px;">Vai vender</td>
    </tr>
    <tr style="background-color: #fff;">
      <td style="border: 1px solid #90caf9; padding: 8px 16px;">Leandro</td>
      <td style="border: 1px solid #90caf9; padding: 8px 16px;">15%</td>
      <td style="border: 1px solid #90caf9; padding: 8px 16px;">Vai vender</td>
    </tr>
    <tr style="background-color: #e3f2fd;">
      <td style="border: 1px solid #90caf9; padding: 8px 16px;">João</td>
      <td style="border: 1px solid #90caf9; padding: 8px 16px;">8%</td>
      <td style="border: 1px solid #90caf9; padding: 8px 16px;">Vai vender</td>
    </tr>
    <tr style="background-color: #fff;">
      <td style="border: 1px solid #90caf9; padding: 8px 16px;">Pedro</td>
      <td style="border: 1px solid #90caf9; padding: 8px 16px;">2%</td>
      <td style="border: 1px solid #90caf9; padding: 8px 16px;">Vai vender</td>
    </tr>
    <tr style="background-color: #fff9c4;">
      <td style="border: 1px solid #90caf9; padding: 8px 16px;"><strong>Quinta pessoa</strong></td>
      <td style="border: 1px solid #90caf9; padding: 8px 16px;"><strong>35%</strong></td>
      <td style="border: 1px solid #90caf9; padding: 8px 16px;"><strong>Não vai vender</strong></td>
    </tr>
  </tbody>
</table>

A soma dos percentuais dos coproprietários que irão vender é:

$$40\% + 15\% + 8\% + 2\% = 65\%$$

Logo, a venda não corresponde à totalidade do imóvel, mas apenas a $65\%$. A quinta pessoa, que possui $35\%$, não entra no cálculo da DOI dessa transmissão, pois não está alienando sua parte ideal.

---

A soma total de todos os coproprietários é:

$$40\% + 15\% + 8\% + 2\% + 35\% = 100\%$$

Mas, para a DOI desta venda, entram apenas os que estão vendendo:

$$40\% + 15\% + 8\% + 2\% = 65\%$$

Portanto, a venda corresponde a apenas $65\%$ do imóvel. A quinta pessoa possui $35\%$ e não participa da venda, então ela não entra na base da DOI dessa transmissão.

---

#### 1. Representando os percentuais como vetor

Na Álgebra Linear, colocamos os percentuais de todos os coproprietários em um vetor coluna:

$$
\mathbf{p} = \begin{pmatrix} p_M \\ p_L \\ p_J \\ p_P \\ p_Q \end{pmatrix}
= \begin{pmatrix} 40 \\ 15 \\ 8 \\ 2 \\ 35 \end{pmatrix}
$$

com $p_M = 40$, $p_L = 15$, $p_J = 8$, $p_P = 2$, $p_Q = 35$.

A soma total do vetor é:

$$40 + 15 + 8 + 2 + 35 = 100$$

O imóvel inteiro está corretamente representado.

---

#### 2. Separando apenas os vendedores

Como a quinta pessoa não vai vender, trabalhamos somente com os quatro vendedores. O vetor dos vendedores é:

$$
\mathbf{v} = \begin{pmatrix} 40 \\ 15 \\ 8 \\ 2 \end{pmatrix}
$$

A soma dos componentes de $\mathbf{v}$ é:

$$40 + 15 + 8 + 2 = 65$$

---

#### 3. O que a DOI exige?

A DOI precisa que a parte vendida seja considerada como uma nova base de $100\%$. Matematicamente, queremos transformar:

$$65\% \longrightarrow 100\%$$

mantendo as proporções internas entre os vendedores ($40:15:8:2$). O novo vetor $\mathbf{x}$ deve satisfazer:

$$x_M + x_L + x_J + x_P = 100 \qquad \text{com} \qquad x_M : x_L : x_J : x_P = 40:15:8:2$$

---

#### 4. Modelo de Álgebra Linear

Como a transformação é proporcional, escrevemos $\mathbf{x} = \lambda\,\mathbf{v}$:

$$
\begin{pmatrix} x_M \\ x_L \\ x_J \\ x_P \end{pmatrix}
= \lambda \begin{pmatrix} 40 \\ 15 \\ 8 \\ 2 \end{pmatrix}
= \begin{pmatrix} 40\lambda \\ 15\lambda \\ 8\lambda \\ 2\lambda \end{pmatrix}
$$

---

#### 5. Usando a condição da DOI

A DOI precisa fechar em $100\%$:

$$x_M + x_L + x_J + x_P = 100$$

Substituindo:

$$40\lambda + 15\lambda + 8\lambda + 2\lambda = 100$$

$$65\lambda = 100$$

Isolando $\lambda$:

$$\lambda = \frac{100}{65} = \frac{20}{13}$$

---

#### 6. Calculando o percentual DOI de cada vendedor

Aplicando $\mathbf{x} = \lambda\,\mathbf{v}$ com $\lambda = \dfrac{20}{13}$:

**Marcos** $(p_M = 40\%)$:

<div style="text-align:center">
$$
x_M = 40 \cdot \frac{20}{13} = \frac{800}{13} = 61{,}538\ldots\%
\approx \boxed{61{,}54\%}
$$
</div>

**Leandro** $(p_L = 15\%)$:

<div style="text-align:center">
$$
x_L = 15 \cdot \frac{20}{13} = \frac{300}{13} = 23{,}076\ldots\%
\approx \boxed{23{,}08\%}
$$
</div>

**João** $(p_J = 8\%)$:

<div style="text-align:center">
$$
x_J = 8 \cdot \frac{20}{13} = \frac{160}{13} = 12{,}307\ldots\%
\approx \boxed{12{,}31\%}
$$
</div>

**Pedro** $(p_P = 2\%)$:

<div style="text-align:center">
$$
x_P = 2 \cdot \frac{20}{13} = \frac{40}{13} = 3{,}076\ldots\%
\approx \boxed{3{,}08\%}
$$
</div>

---

#### 7. Vetor DOI final

$$
\mathbf{x} = \begin{pmatrix} \frac{800}{13} \\[4pt] \frac{300}{13} \\[4pt] \frac{160}{13} \\[4pt] \frac{40}{13} \end{pmatrix}
\approx \begin{pmatrix} 61{,}54 \\ 23{,}08 \\ 12{,}31 \\ 3{,}08 \end{pmatrix}
$$

<table style="margin: 1rem auto; border-collapse: collapse; text-align: center;">
  <thead>
    <tr style="background-color: #1565c0; color: #fff;">
      <th style="border: 1px solid #90caf9; padding: 8px 14px;">Vendedor</th>
      <th style="border: 1px solid #90caf9; padding: 8px 14px;">% real sobre o imóvel</th>
      <th style="border: 1px solid #90caf9; padding: 8px 14px;">% DOI exato</th>
      <th style="border: 1px solid #90caf9; padding: 8px 14px;">% DOI aprox.</th>
    </tr>
  </thead>
  <tbody>
    <tr style="background-color: #e3f2fd;">
      <td style="border: 1px solid #90caf9; padding: 8px 14px;">Marcos</td>
      <td style="border: 1px solid #90caf9; padding: 8px 14px;">40%</td>
      <td style="border: 1px solid #90caf9; padding: 8px 14px;">800/13 %</td>
      <td style="border: 1px solid #90caf9; padding: 8px 14px;">61,54%</td>
    </tr>
    <tr style="background-color: #fff;">
      <td style="border: 1px solid #90caf9; padding: 8px 14px;">Leandro</td>
      <td style="border: 1px solid #90caf9; padding: 8px 14px;">15%</td>
      <td style="border: 1px solid #90caf9; padding: 8px 14px;">300/13 %</td>
      <td style="border: 1px solid #90caf9; padding: 8px 14px;">23,08%</td>
    </tr>
    <tr style="background-color: #e3f2fd;">
      <td style="border: 1px solid #90caf9; padding: 8px 14px;">João</td>
      <td style="border: 1px solid #90caf9; padding: 8px 14px;">8%</td>
      <td style="border: 1px solid #90caf9; padding: 8px 14px;">160/13 %</td>
      <td style="border: 1px solid #90caf9; padding: 8px 14px;">12,31%</td>
    </tr>
    <tr style="background-color: #fff;">
      <td style="border: 1px solid #90caf9; padding: 8px 14px;">Pedro</td>
      <td style="border: 1px solid #90caf9; padding: 8px 14px;">2%</td>
      <td style="border: 1px solid #90caf9; padding: 8px 14px;">40/13 %</td>
      <td style="border: 1px solid #90caf9; padding: 8px 14px;">3,08%</td>
    </tr>
    <tr style="background-color: #fff9c4;">
      <td style="border: 1px solid #90caf9; padding: 8px 14px;"><strong>Quinta pessoa</strong></td>
      <td style="border: 1px solid #90caf9; padding: 8px 14px;"><strong>35%</strong></td>
      <td style="border: 1px solid #90caf9; padding: 8px 14px;"><strong>Não entra</strong></td>
      <td style="border: 1px solid #90caf9; padding: 8px 14px;"><strong>Não entra</strong></td>
    </tr>
  </tbody>
</table>

---

#### 8. Conferindo a soma exata

$$
x_M + x_L + x_J + x_P
= \frac{800}{13} + \frac{300}{13} + \frac{160}{13} + \frac{40}{13}
= \frac{800 + 300 + 160 + 40}{13}
= \frac{1300}{13}
= \boxed{100\%}
$$

A transformação está correta.

---

#### 9. Escrevendo como matriz de transformação

A transformação $\mathbf{x} = \lambda\,\mathbf{v}$ é uma transformação linear de escala. Com $\lambda = \dfrac{20}{13}$ e $I_4$ a identidade de ordem 4, a matriz de transformação é $T = \dfrac{20}{13}\,I_4$:

$$
T = \frac{20}{13}
\begin{pmatrix}
1 & 0 & 0 & 0 \\
0 & 1 & 0 & 0 \\
0 & 0 & 1 & 0 \\
0 & 0 & 0 & 1
\end{pmatrix}
=
\begin{pmatrix}
\frac{20}{13} & 0 & 0 & 0 \\[4pt]
0 & \frac{20}{13} & 0 & 0 \\[4pt]
0 & 0 & \frac{20}{13} & 0 \\[4pt]
0 & 0 & 0 & \frac{20}{13}
\end{pmatrix}
$$

Então $\mathbf{x} = T\,\mathbf{v}$:

$$
\begin{pmatrix} x_M \\ x_L \\ x_J \\ x_P \end{pmatrix}
=
\begin{pmatrix}
\frac{20}{13} & 0 & 0 & 0 \\[4pt]
0 & \frac{20}{13} & 0 & 0 \\[4pt]
0 & 0 & \frac{20}{13} & 0 \\[4pt]
0 & 0 & 0 & \frac{20}{13}
\end{pmatrix}
\begin{pmatrix} 40 \\ 15 \\ 8 \\ 2 \end{pmatrix}
=
\begin{pmatrix} \frac{800}{13} \\[4pt] \frac{300}{13} \\[4pt] \frac{160}{13} \\[4pt] \frac{40}{13} \end{pmatrix}
$$

---

#### 10. Fórmula algébrica geral

A relação algébrica usada em cada cálculo individual é:

$$
\text{Percentual DOI} = \frac{\text{percentual vendido pela pessoa}}{\text{total vendido}} \cdot 100
$$

Neste caso, o total vendido é $65\%$, então:

$$
\text{Percentual DOI} = \frac{\text{percentual vendido pela pessoa}}{65} \cdot 100
$$

Aplicando para cada vendedor:

<div style="text-align:center">
$$
\begin{aligned}
\text{DOI Marcos}  &= \frac{40}{65} \cdot 100 = \frac{4000}{65} = \frac{800}{13} \approx 61{,}54\% \\[8pt]
\text{DOI Leandro} &= \frac{15}{65} \cdot 100 = \frac{1500}{65} = \frac{300}{13} \approx 23{,}08\% \\[8pt]
\text{DOI João}    &= \frac{8}{65}  \cdot 100 = \frac{800}{65}  = \frac{160}{13} \approx 12{,}31\% \\[8pt]
\text{DOI Pedro}   &= \frac{2}{65}  \cdot 100 = \frac{200}{65}  = \frac{40}{13}  \approx 3{,}08\%
\end{aligned}
$$
</div>

---

#### 11. Resolução por EML

##### 1. Dados do problema

Temos:

$$p_M = 40, \quad p_L = 15, \quad p_J = 8, \quad p_P = 2$$

A soma vendida é:

$$S = 40 + 15 + 8 + 2$$

Mas, pelo EML, podemos escrever uma soma usando:

$$a + b = \ln(e^a \cdot e^b)$$

Para quatro parcelas:

$$40 + 15 + 8 + 2 = \ln(e^{40} \cdot e^{15} \cdot e^8 \cdot e^2)$$

Então:

$$S = \ln(e^{40} \cdot e^{15} \cdot e^8 \cdot e^2)$$

Como $e^{40} \cdot e^{15} \cdot e^8 \cdot e^2 = e^{40+15+8+2}$, temos:

$$S = \ln(e^{65})$$

Como $\ln(e^{65}) = 65$, logo:

$$\boxed{S = 65}$$

Portanto, a parte transmitida é $65\%$.

---

##### 2. Fórmula da DOI

A fórmula proporcional comum é:

$$x_i = \frac{p_i}{S} \cdot 100$$

onde $p_i$ é o percentual real vendido por cada pessoa e $S = 65$ é o total vendido.

Usando o EML, a divisão pode ser escrita como:

$$\frac{a}{b} = e^{\ln(a) - \ln(b)}$$

Então:

$$\frac{p_i}{S} = e^{\ln(p_i) - \ln(S)}$$

Como $S = 65$:

$$\frac{p_i}{65} = e^{\ln(p_i) - \ln(65)}$$

Logo, a fórmula da DOI em forma EML é:

$$\boxed{x_i = 100 \cdot e^{\ln(p_i) - \ln(65)}}$$

---

##### 3. Marcos

Marcos vende $p_M = 40$, então:

$$x_M = 100 \cdot e^{\ln(40) - \ln(65)}$$

Pela identidade $\ln(a) - \ln(b) = \ln\!\left(\dfrac{a}{b}\right)$:

$$\ln(40) - \ln(65) = \ln\!\left(\frac{40}{65}\right)$$

Logo:

$$x_M = 100 \cdot e^{\ln\!\left(\frac{40}{65}\right)}$$

Como $e^{\ln(y)} = y$:

$$x_M = 100 \cdot \frac{40}{65}$$

Simplificando $\dfrac{40}{65} = \dfrac{8}{13}$:

$$x_M = 100 \cdot \frac{8}{13} = \frac{800}{13} = 61{,}538\ldots$$

$$\boxed{x_M \approx 61{,}54\%}$$

---

##### 4. Leandro

Leandro vende $p_L = 15$, então:

$$x_L = 100 \cdot e^{\ln(15) - \ln(65)}$$

Pela identidade:

$$\ln(15) - \ln(65) = \ln\!\left(\frac{15}{65}\right)$$

Logo:

$$x_L = 100 \cdot e^{\ln\!\left(\frac{15}{65}\right)} = 100 \cdot \frac{15}{65}$$

Simplificando $\dfrac{15}{65} = \dfrac{3}{13}$:

$$x_L = 100 \cdot \frac{3}{13} = \frac{300}{13} = 23{,}076\ldots$$

$$\boxed{x_L \approx 23{,}08\%}$$

---

##### 5. João

João vende $p_J = 8$, então:

$$x_J = 100 \cdot e^{\ln(8) - \ln(65)}$$

Pela identidade:

$$\ln(8) - \ln(65) = \ln\!\left(\frac{8}{65}\right)$$

Logo:

$$x_J = 100 \cdot e^{\ln\!\left(\frac{8}{65}\right)} = 100 \cdot \frac{8}{65} = \frac{800}{65}$$

Simplificando por $5$:

$$x_J = \frac{160}{13} = 12{,}307\ldots$$

$$\boxed{x_J \approx 12{,}31\%}$$

---

##### 6. Pedro

Pedro vende $p_P = 2$, então:

$$x_P = 100 \cdot e^{\ln(2) - \ln(65)}$$

Pela identidade:

$$\ln(2) - \ln(65) = \ln\!\left(\frac{2}{65}\right)$$

Logo:

$$x_P = 100 \cdot e^{\ln\!\left(\frac{2}{65}\right)} = 100 \cdot \frac{2}{65} = \frac{200}{65}$$

Simplificando por $5$:

$$x_P = \frac{40}{13} = 3{,}076\ldots$$

$$\boxed{x_P \approx 3{,}08\%}$$

---

##### 7. Resultado em forma EML

A fórmula geral usada foi:

$$x_i = 100 \cdot e^{\ln(p_i) - \ln(65)}$$

Aplicando aos quatro vendedores:

<div style="text-align:center">
$$
\begin{aligned}
x_M &= 100 \cdot e^{\ln(40) - \ln(65)} = \frac{800}{13} \approx 61{,}54\% \\[8pt]
x_L &= 100 \cdot e^{\ln(15) - \ln(65)} = \frac{300}{13} \approx 23{,}08\% \\[8pt]
x_J &= 100 \cdot e^{\ln(8)  - \ln(65)} = \frac{160}{13} \approx 12{,}31\% \\[8pt]
x_P &= 100 \cdot e^{\ln(2)  - \ln(65)} = \frac{40}{13}  \approx  3{,}08\%
\end{aligned}
$$
</div>


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
  color: #333 !important; /* Cor do ícone (cinza escuro) */
  font-size: 24px;
  border: none;
  cursor: pointer;
  transition: color 0.2s, transform 0.2s;
}
.share-btn:hover {
  color: #000 !important; /* Cor do ícone ao passar o mouse */
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