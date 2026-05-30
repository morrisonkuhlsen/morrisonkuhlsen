---
layout: post
date: 2026-05-13 09:00:00 -0300
image: /assets/images/questbooks.avif
title: "Questões de Livros Famosos — Vol. 1"
categories: [ALGEBRA, MATEMATICA, CALCULO, PROBABILIDADE, ESTATISTICA]
lang: pt
tags: [News, Probabilidade, Estatística]
ref: questoes-livros-famosos-vol1
author: dante-bertuzzi
description: "Três questões clássicas retiradas de livros famosos da matemática, resolvidas passo a passo com explicação completa."
mathjax: true
serie: questoes-livros-famosos
serie_vol: 1
---

<div style="border-left: 4px solid #17324d; padding: 1em; background-color: #f0f4f8; margin: 1em 0; border-radius: 4px;">
  <h4 style="margin-top: 0;">Sobre esta série</h4>
  <p>Em <strong>Questões de Livros Famosos</strong> selecionamos três questões por volume, cada uma extraída de um livro clássico da matemática. Para cada questão: o enunciado original, a referência bibliográfica completa, e a resolução detalhada feita a mão, sem pular etapas.</p>
</div>

---

<!-- ================================================================
     QUESTÃO 1
     ================================================================ -->

## Questão 1

<div style="display:flex;flex-wrap:wrap;gap:24px;align-items:flex-start;margin-bottom:1em;">

  <!-- Capa do livro -->
  <div style="flex:0 0 auto;text-align:center;">
    <img src="/assets/images/cover-principios-tecnicas-combinatoria.png" alt="Capa do livro" style="width:120px;height:170px;border-radius:4px;object-fit:cover;box-shadow:3px 3px 8px rgba(0,0,0,0.25);">
    <div style="font-size:0.7rem;color:#555;margin-top:6px;width:120px;line-height:1.4;">
      Chen Chuan-Chong &amp;<br>Koh Khee-Meng
    </div>
  </div>

  <!-- Enunciado -->
  <div style="flex:1 1 260px;">
    <div style="border-left:4px solid #f44336;padding:1em;background:#ffebee;border-radius:4px;">
      <h4 style="margin-top:0;">Enunciado</h4>
      <p>De quantas maneiras podemos distribuir $r$ objetos idênticos em $n$ caixas distintas?</p>
    </div>
    <div style="margin-top:10px;font-size:0.82rem;color:#555;border-left:3px solid #ccc;padding-left:10px;">
      <strong>Referência:</strong> CHEN, Chuan-Chong; KOH, Khee-Meng. <em>Principles and Techniques in Combinatorics</em>. Singapore: World Scientific, 1992. p. 43, exemplo 3.4.
    </div>
  </div>

</div>

### Resolução

O problema equivale a contar o número de soluções inteiras não-negativas da equação:

$$
x_1 + x_2 + \cdots + x_n = r,
$$

onde $x_i \geq 0$ representa a quantidade de objetos colocados na caixa $i$.

---

**Técnica das estrelas e separadores (Stars and Bars)**

Representamos os $r$ objetos como $r$ estrelas: $\star\star\cdots\star$.

Para separar esses objetos em $n$ grupos (um por caixa), precisamos de $n - 1$ separadores $|$.

Por exemplo, com $r = 5$ objetos e $n = 3$ caixas, a distribuição $(2, 0, 3)$ corresponde a:

$$
\star\star \;|\; \;|\; \star\star\star
$$

Cada distribuição é, portanto, um arranjo dos $r + (n-1)$ símbolos — $r$ estrelas e $n-1$ separadores — em posições distintas.

---

**Contando as disposições:**

Temos no total $r + n - 1$ posições. Precisamos escolher quais $r$ delas serão ocupadas pelas estrelas (as demais serão separadores):

$$
\binom{r + n - 1}{r} = \binom{r + n - 1}{n - 1}.
$$

---

**Demonstração pela fórmula do coeficiente binomial:**

O número de formas de escolher $r$ posições dentre $r + n - 1$ é:

$$
\binom{r + n - 1}{r} = \frac{(r + n - 1)!}{r!\,(n-1)!}.
$$

---

**Exemplo numérico:** distribuir $r = 4$ objetos em $n = 3$ caixas:

$$
\binom{4 + 3 - 1}{4} = \binom{6}{4} = \frac{6!}{4!\,2!} = \frac{6 \cdot 5}{2} = \boxed{15}.
$$

Verificação parcial — listando as distribuições $(x_1, x_2, x_3)$ com $x_1 + x_2 + x_3 = 4$, $x_i \geq 0$:

- $(4,0,0)$, $(0,4,0)$, $(0,0,4)$ → **3** disposições
- $(3,1,0)$ e suas permutações → $3! / 1! = $ **6** disposições
- $(2,2,0)$ e suas permutações → $3!/2! = $ **3** disposições
- $(2,1,1)$ e suas permutações → $3!/2! = $ **3** disposições

Total: $3 + 6 + 3 + 3 = \boxed{15}$. ✓

---

**Resultado geral:**

$$
\boxed{\binom{r + n - 1}{r} = \frac{(r+n-1)!}{r!\,(n-1)!}}
$$

---

<!-- ================================================================
     QUESTÃO 2
     ================================================================ -->

## Questão 2

<div style="display:flex;flex-wrap:wrap;gap:24px;align-items:flex-start;margin-bottom:1em;">

  <!-- Capa do livro -->
  <div style="flex:0 0 auto;text-align:center;">
    <img src="/assets/images/murray.avif" alt="Capa do livro Probabilidade e Estatística — Spiegel" style="width:120px;height:170px;border-radius:4px;object-fit:cover;box-shadow:3px 3px 8px rgba(0,0,0,0.25);">
    <div style="font-size:0.7rem;color:#555;margin-top:6px;width:120px;line-height:1.4;">
      Murray R. Spiegel
    </div>
  </div>

  <!-- Enunciado -->
  <div style="flex:1 1 260px;">
    <div style="border-left:4px solid #f44336;padding:1em;background:#ffebee;border-radius:4px;">
      <h4 style="margin-top:0;">Enunciado</h4>
      <p>A e B jogam alternadamente um par de dados. Ganha o jogo aquele que primeiro obtém o total 7. Determine a probabilidade (a) de ganhar aquele que inicia o jogo, (b) de ganhar o que faz a segunda jogada.</p>
    </div>
    <div style="margin-top:10px;font-size:0.82rem;color:#555;border-left:3px solid #ccc;padding-left:10px;">
      <strong>Referência:</strong> SPIEGEL, Murray R. <em>Probabilidade e estatística: resumo da teoria, 760 problemas resolvidos</em>. Tradução de Alfredo Alves de Faria. Coleção Schaum. São Paulo: McGraw-Hill, [s.d.]. p. 39, problema 1.50.
    </div>
  </div>

</div>

### Resolução

Vamos resolver completo, à mão, passo a passo.

O jogo é assim:

- $A$ joga primeiro.
- Depois $B$ joga.
- Depois $A$ joga de novo.
- Depois $B$, e assim por diante.
- Ganha quem primeiro tirar soma $7$ em dois dados.

---

**Probabilidade de obter soma $7$**

Primeiro, vamos calcular a probabilidade de sair soma $7$ em uma jogada com dois dados.

Os pares possíveis que dão soma $7$ são:

$$
(1,6),\ (2,5),\ (3,4),\ (4,3),\ (5,2),\ (6,1)
$$

São $6$ casos favoráveis.

Como dois dados têm:

$$
6 \cdot 6 = 36
$$

resultados possíveis, temos:

$$
P(\text{sair } 7)=\frac{6}{36}
$$

Simplificando:

$$
P(\text{sair } 7)=\frac{1}{6}
$$

Chamemos essa probabilidade de $p$:

$$
p=\frac{1}{6}
$$

Agora, a probabilidade de **não sair 7** é o complementar:

$$
q=1-p
$$

Substituindo $p=\dfrac{1}{6}$:

$$
q=1-\frac{1}{6}
$$

Escrevendo $1$ como fração de denominador $6$:

$$
q=\frac{6}{6}-\frac{1}{6}
$$

$$
q=\frac{5}{6}
$$

Então:

$$
p=\frac{1}{6}
$$

e

$$
q=\frac{5}{6}
$$

---

### (a) Probabilidade de $A$ ganhar

Como $A$ começa, ele pode ganhar na primeira jogada, ou na terceira, ou na quinta, e assim por diante.

Ou seja, $A$ ganha se:

$$
A \text{ acerta}
$$

ou

$$
A \text{ erra},\ B \text{ erra},\ A \text{ acerta}
$$

ou

$$
A \text{ erra},\ B \text{ erra},\ A \text{ erra},\ B \text{ erra},\ A \text{ acerta}
$$

e assim por diante.

---

**Primeiro caso: $A$ ganha na 1ª jogada**

Para $A$ ganhar logo na primeira jogada, basta sair soma $7$.

Logo:

$$
P_1=\frac{1}{6}
$$

---

**Segundo caso: $A$ ganha na 3ª jogada**

Para $A$ ganhar na terceira jogada do jogo, precisa acontecer:

$$
A \text{ perde},\ B \text{ perde},\ A \text{ ganha}
$$

A probabilidade é:

$$
P_2=
\left(\frac{5}{6}\right)
\left(\frac{5}{6}\right)
\left(\frac{1}{6}\right)
$$

Multiplicando:

$$
P_2=
\frac{5 \cdot 5 \cdot 1}{6 \cdot 6 \cdot 6}
$$

$$
P_2=\frac{25}{216}
$$

---

**Terceiro caso: $A$ ganha na 5ª jogada**

Agora precisa acontecer:

$$
A \text{ perde},\ B \text{ perde},\ A \text{ perde},\ B \text{ perde},\ A \text{ ganha}
$$

A probabilidade é:

$$
P_3=
\left(\frac{5}{6}\right)
\left(\frac{5}{6}\right)
\left(\frac{5}{6}\right)
\left(\frac{5}{6}\right)
\left(\frac{1}{6}\right)
$$

Agrupando:

$$
P_3=
\left(\frac{5}{6}\right)^4
\left(\frac{1}{6}\right)
$$

---

**Quarto caso: $A$ ganha na 7ª jogada**

Precisa acontecer:

$$
A \text{ perde},\ B \text{ perde},\ A \text{ perde},\ B \text{ perde},\ A \text{ perde},\ B \text{ perde},\ A \text{ ganha}
$$

A probabilidade é:

$$
P_4=
\left(\frac{5}{6}\right)^6
\left(\frac{1}{6}\right)
$$

---

**Soma das probabilidades de $A$ ganhar**

Portanto, a probabilidade de $A$ ganhar é a soma:

$$
P(A)=
\frac{1}{6}
+
\left(\frac{5}{6}\right)^2\frac{1}{6}
+
\left(\frac{5}{6}\right)^4\frac{1}{6}
+
\left(\frac{5}{6}\right)^6\frac{1}{6}
+\cdots
$$

Colocando $\dfrac{1}{6}$ em evidência:

$$
P(A)=
\frac{1}{6}
\left[
1+
\left(\frac{5}{6}\right)^2+
\left(\frac{5}{6}\right)^4+
\left(\frac{5}{6}\right)^6+
\cdots
\right]
$$

Agora observe que:

$$
\left(\frac{5}{6}\right)^2=\frac{25}{36}
$$

Logo:

$$
P(A)=
\frac{1}{6}
\left[
1+
\frac{25}{36}
+
\left(\frac{25}{36}\right)^2
+
\left(\frac{25}{36}\right)^3
+\cdots
\right]
$$

A parte dentro dos colchetes é uma série geométrica:

$$
1+r+r^2+r^3+\cdots
$$

com razão:

$$
r=\frac{25}{36}
$$

A soma de uma série geométrica infinita é:

$$
1+r+r^2+r^3+\cdots=\frac{1}{1-r}
$$

Então:

$$
P(A)=
\frac{1}{6}
\cdot
\frac{1}{1-\dfrac{25}{36}}
$$

Agora vamos resolver o denominador:

$$
1-\frac{25}{36}
=
\frac{36}{36}-\frac{25}{36}
$$

$$
1-\frac{25}{36}
=
\frac{11}{36}
$$

Então:

$$
P(A)=
\frac{1}{6}
\cdot
\frac{1}{\dfrac{11}{36}}
$$

Dividir por uma fração é multiplicar pelo inverso:

$$
P(A)=
\frac{1}{6}
\cdot
\frac{36}{11}
$$

Multiplicando:

$$
P(A)=
\frac{36}{66}
$$

Dividindo numerador e denominador por $6$:

$$
P(A)=\frac{\cancel{6} \cdot 6}{\cancel{6} \cdot 11} = \frac{6}{11}
$$

Portanto:

$$
\boxed{P(A)=\frac{6}{11}}
$$

---

### (b) Probabilidade de $B$ ganhar

Agora vamos calcular a probabilidade de ganhar o jogador que faz a segunda jogada, ou seja, $B$.

Para $B$ ganhar, ele pode ganhar na segunda jogada, ou na quarta, ou na sexta, e assim por diante.

---

**Primeiro caso: $B$ ganha na 2ª jogada**

Para $B$ ganhar na segunda jogada, precisa acontecer:

$$
A \text{ perde},\ B \text{ ganha}
$$

A probabilidade é:

$$
P_1=
\left(\frac{5}{6}\right)
\left(\frac{1}{6}\right)
$$

Multiplicando:

$$
P_1=\frac{5}{36}
$$

---

**Segundo caso: $B$ ganha na 4ª jogada**

Agora precisa acontecer:

$$
A \text{ perde},\ B \text{ perde},\ A \text{ perde},\ B \text{ ganha}
$$

A probabilidade é:

$$
P_2=
\left(\frac{5}{6}\right)
\left(\frac{5}{6}\right)
\left(\frac{5}{6}\right)
\left(\frac{1}{6}\right)
$$

Agrupando:

$$
P_2=
\left(\frac{5}{6}\right)^3
\left(\frac{1}{6}\right)
$$

---

**Terceiro caso: $B$ ganha na 6ª jogada**

Precisa acontecer:

$$
A \text{ perde},\ B \text{ perde},\ A \text{ perde},\ B \text{ perde},\ A \text{ perde},\ B \text{ ganha}
$$

A probabilidade é:

$$
P_3=
\left(\frac{5}{6}\right)^5
\left(\frac{1}{6}\right)
$$

---

**Soma das probabilidades de $B$ ganhar**

Portanto:

$$
P(B)=
\left(\frac{5}{6}\right)
\left(\frac{1}{6}\right)
+
\left(\frac{5}{6}\right)^3
\left(\frac{1}{6}\right)
+
\left(\frac{5}{6}\right)^5
\left(\frac{1}{6}\right)
+\cdots
$$

Colocando $\dfrac{5}{6}\cdot \dfrac{1}{6}$ em evidência:

$$
P(B)=
\left(\frac{5}{6}\right)
\left(\frac{1}{6}\right)
\left[
1+
\left(\frac{5}{6}\right)^2+
\left(\frac{5}{6}\right)^4+
\left(\frac{5}{6}\right)^6+
\cdots
\right]
$$

Já sabemos que:

$$
\left(\frac{5}{6}\right)^2=\frac{25}{36}
$$

Então:

$$
P(B)=
\left(\frac{5}{6}\right)
\left(\frac{1}{6}\right)
\left[
1+
\frac{25}{36}
+
\left(\frac{25}{36}\right)^2
+
\left(\frac{25}{36}\right)^3
+\cdots
\right]
$$

A série dentro dos colchetes é:

$$
1+
\frac{25}{36}
+
\left(\frac{25}{36}\right)^2
+
\left(\frac{25}{36}\right)^3
+\cdots
$$

com razão:

$$
r=\frac{25}{36}
$$

Logo:

$$
1+
\frac{25}{36}
+
\left(\frac{25}{36}\right)^2
+
\left(\frac{25}{36}\right)^3
+\cdots
=
\frac{1}{1-\dfrac{25}{36}}
$$

Então:

$$
P(B)=
\left(\frac{5}{6}\right)
\left(\frac{1}{6}\right)
\cdot
\frac{1}{1-\dfrac{25}{36}}
$$

Agora:

$$
\left(\frac{5}{6}\right)
\left(\frac{1}{6}\right)
=
\frac{5}{36}
$$

E:

$$
1-\frac{25}{36}
=
\frac{11}{36}
$$

Logo:

$$
P(B)=
\frac{5}{36}
\cdot
\frac{1}{\dfrac{11}{36}}
$$

Dividindo por fração:

$$
P(B)=
\frac{5}{36}
\cdot
\frac{36}{11}
$$

Agora simplificamos o $36$:

$$
P(B)=
\frac{5}{\cancel{36}}
\cdot
\frac{\cancel{36}}{11}
$$

$$
P(B)=\frac{5}{11}
$$

Portanto:

$$
\boxed{P(B)=\frac{5}{11}}
$$

---

**Conferência**

Vamos conferir se as duas probabilidades somam $1$:

$$
P(A)+P(B)=\frac{6}{11}+\frac{5}{11}
$$

Como os denominadores são iguais, somamos os numeradores:

$$
P(A)+P(B)=\frac{6+5}{11}
$$

$$
P(A)+P(B)=\frac{11}{11}
$$

$$
P(A)+P(B)=1
$$

Então as probabilidades estão corretas:

$$
\boxed{P(A)=\frac{6}{11}}
$$

$$
\boxed{P(B)=\frac{5}{11}}
$$

---

**Resposta em porcentagem**

Para $A$:

$$
P(A)=\frac{6}{11} \approx 0{,}5454 \approx 54{,}54\%
$$

Para $B$:

$$
P(B)=\frac{5}{11} \approx 0{,}4545 \approx 45{,}45\%
$$

---

**Resposta final**

$$
\boxed{P(A)=\frac{6}{11}\approx 54{,}54\%}
$$

$$
\boxed{P(B)=\frac{5}{11}\approx 45{,}45\%}
$$

Portanto, quem começa o jogo tem vantagem.

---

<!-- ================================================================
     QUESTÃO 3
     ================================================================ -->

## Questão 3

<div style="display:flex;flex-wrap:wrap;gap:24px;align-items:flex-start;margin-bottom:1em;">

  <!-- Capa do livro -->
  <div style="flex:0 0 auto;text-align:center;">
    <img src="/assets/images/sheldonross.avif" alt="Capa do livro Probabilidade: Um Curso Moderno com Aplicações" style="width:120px;height:170px;border-radius:4px;object-fit:cover;box-shadow:3px 3px 8px rgba(0,0,0,0.25);">
    <div style="font-size:0.7rem;color:#555;margin-top:6px;width:120px;line-height:1.4;">
      Sheldon M. Ross
    </div>
  </div>

  <!-- Enunciado -->
  <div style="flex:1 1 260px;">
    <div style="border-left:4px solid #f44336;padding:1em;background:#ffebee;border-radius:4px;">
      <h4 style="margin-top:0;">Enunciado</h4>
      <p>
        Uma turma com 120 estudantes é levada em 3 ônibus para a apresentação de uma curta sinfonia.
        Há 36 estudantes em um ônibus, 40 no outro e 44 no terceiro ônibus. Quando os ônibus chegam,
        um dos 120 estudantes é escolhido aleatoriamente. Suponha que $X$ represente o número de
        estudantes que vieram no mesmo ônibus do estudante escolhido e determine $E[X]$.
      </p>
    </div>
    <div style="margin-top:10px;font-size:0.82rem;color:#555;border-left:3px solid #ccc;padding-left:10px;">
      <strong>Referência:</strong> ROSS, Sheldon M. <em>Probabilidade: um curso moderno com aplicações</em>. 8. ed. Porto Alegre: Bookman, 2010. p. 162 Exemplo 3d.
    </div>
  </div>

</div>

### Resolução

Temos uma turma com:

$$
120 \text{ estudantes}
$$

Eles foram distribuídos em 3 ônibus:

$$
36 \text{ estudantes no 1º ônibus}
$$

$$
40 \text{ estudantes no 2º ônibus}
$$

$$
44 \text{ estudantes no 3º ônibus}
$$

Note que:

$$
36 + 40 + 44 = 120
$$

A variável aleatória $X$ representa:

$$
X = \text{número de estudantes que vieram no mesmo ônibus do estudante escolhido}
$$

Ou seja, se o estudante escolhido estava no ônibus com 36 alunos, então:

$$
X = 36
$$

Se estava no ônibus com 40 alunos:

$$
X = 40
$$

Se estava no ônibus com 44 alunos:

$$
X = 44
$$

---

Como o estudante é escolhido aleatoriamente entre os 120 estudantes, a probabilidade de ele estar em cada ônibus depende da quantidade de estudantes naquele ônibus.

### Probabilidade de o estudante escolhido estar no 1º ônibus

O primeiro ônibus tem 36 estudantes.

Logo:

$$
P(X = 36) = \frac{36}{120}
$$

Simplificando:

$$
P(X = 36) = \frac{3}{10}
$$

---

### Probabilidade de o estudante escolhido estar no 2º ônibus

O segundo ônibus tem 40 estudantes.

Logo:

$$
P(X = 40) = \frac{40}{120}
$$

Simplificando:

$$
P(X = 40) = \frac{1}{3}
$$

---

### Probabilidade de o estudante escolhido estar no 3º ônibus

O terceiro ônibus tem 44 estudantes.

Logo:

$$
P(X = 44) = \frac{44}{120}
$$

Simplificando:

$$
P(X = 44) = \frac{11}{30}
$$

---

Agora usamos a fórmula da esperança matemática:

$$
E[X] = \sum x_i \cdot P(X = x_i)
$$

Então:

$$
E[X]
=
36 \cdot P(X = 36)
+
40 \cdot P(X = 40)
+
44 \cdot P(X = 44)
$$

Substituindo as probabilidades:

$$
E[X]
=
36 \cdot \frac{36}{120}
+
40 \cdot \frac{40}{120}
+
44 \cdot \frac{44}{120}
$$

Agora fazemos cada multiplicação:

$$
36 \cdot \frac{36}{120}
=
\frac{36^2}{120}
$$

$$
40 \cdot \frac{40}{120}
=
\frac{40^2}{120}
$$

$$
44 \cdot \frac{44}{120}
=
\frac{44^2}{120}
$$

Logo:

$$
E[X]
=
\frac{36^2}{120}
+
\frac{40^2}{120}
+
\frac{44^2}{120}
$$

Como os denominadores são iguais:

$$
E[X]
=
\frac{36^2 + 40^2 + 44^2}{120}
$$

Agora calculamos os quadrados:

$$
36^2 = 1296
$$

$$
40^2 = 1600
$$

$$
44^2 = 1936
$$

Substituindo:

$$
E[X]
=
\frac{1296 + 1600 + 1936}{120}
$$

Somando:

$$
1296 + 1600 = 2896
$$

$$
2896 + 1936 = 4832
$$

Então:

$$
E[X] = \frac{4832}{120}
$$

Simplificando por 8:

$$
E[X] = \frac{604}{15}
$$

Em decimal:

$$
E[X] \approx 40{,}27
$$

Portanto:

$$
\boxed{E[X] = \frac{604}{15} \approx 40{,}27}
$$

Assim, o número esperado de estudantes que vieram no mesmo ônibus do estudante escolhido é aproximadamente:

$$
\boxed{40{,}27 \text{ estudantes}}
$$

---

Observe que esse valor não é simplesmente:

$$
\frac{36 + 40 + 44}{3} = 40
$$

Isso acontece porque o estudante é escolhido entre os 120 estudantes, e não entre os 3 ônibus.

Portanto, ônibus com mais estudantes têm maior chance de ser o ônibus do estudante escolhido.

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
