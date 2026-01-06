---
layout: post
title: "Limites no Cálculo: notação, técnicas e exemplos resolvidos (passo a passo)"
categories: [CALCULO, MATEMATICA]
lang: pt
tags: [matematica, calculo, limites]
ref: limites-calculo
description: "Limites - tendendo ao infinito."
---

<div style="border-left: 4px solid #f44336; padding: 1em; background-color: #ffebee; margin: 1em 0; border-radius: 4px;">
  <h4 style="margin-top: 0;">Pergunta</h4>
  <p>O que significa “<strong>limite</strong>” em Cálculo, quais são as principais <strong>notações/símbolos</strong>, e como resolver os tipos mais comuns de limites <strong>passo a passo</strong>?</p>
</div>

<figure style="display: flex; flex-direction: column; align-items: center; margin: 2.5em 0 2em 0;">
  <img src="/assets/images/limite-image.png" alt="Ilustração conceitual de limite (substitua por uma imagem do seu blog, se quiser)." style="max-width: 50%; height: auto; border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.07);" />
  <figcaption class="img-caption-contrast">
    <strong>Figura:</strong> Limite não é “chegar” em $a$, e sim entender o que acontece com $f(x)$ quando $x$ chega <em>muito perto</em> de $a$.
  </figcaption>
</figure>

---

## 1) A ideia central (intuição + fórmula)

Quando escrevemos

$$
\lim_{x\to a} f(x)=L,
$$

estamos dizendo: “quando $x$ se aproxima de $a$, os valores de $f(x)$ se aproximam de $L$”.

### Notações e símbolos (o que cada coisa quer dizer)

- $\lim$: operador “limite”.
- $x\to a$: “$x$ tende a $a$” (aproxima-se de $a$).
- $f(x)$: função.
- $L$: valor-limite (o “número alvo”).
- $\to$: “tende a”.
- $\infty$: infinito (cresce sem bound).
- $a^-$ e $a^+$:
  - $\lim_{x\to a^-} f(x)$: limite pela esquerda (valores menores que $a$).
  - $\lim_{x\to a^+} f(x)$: limite pela direita (valores maiores que $a$).

### Quando o limite “existe” (regra prática)

O limite bilateral existe se e somente se:

$$
\lim_{x\to a^-} f(x)=\lim_{x\to a^+} f(x)=L.
$$

Se der valores diferentes, o limite bilateral **não existe**.

---

## 2) Formas indeterminadas

Quando você calcula um limite por **substituição direta**, podem acontecer dois cenários:

- Sai um número “normal” (ex.: $7$, $\frac{2}{3}$, $\sqrt{5}$) $\Rightarrow$ o limite geralmente está resolvido.
- Sai uma **forma indeterminada** $\Rightarrow$ o resultado **ainda não está definido**, porque depende de simplificar/transformar a expressão.

### O que é indeterminação?

Uma **indeterminação** é uma forma que, sozinha, **não determina** o valor do limite.

O exemplo mais comum é:

- $\displaystyle \frac{0}{0}$

Aqui, não dá para concluir nada, porque:
- numerador $\to 0$ e denominador $\to 0$,
- mas a “velocidade” com que cada um vai a zero pode ser diferente.

**Exemplo-relâmpago (para ver por que não dá para decidir só olhando):**

1) 
$$
\begin{aligned}
\lim_{x\to 1}\frac{x-1}{x-1}
&=\lim_{x\to 1}1\\
&=1
\end{aligned}
$$

2)
$$
\begin{aligned}
\lim_{x\to 1}\frac{(x-1)^2}{x-1}
&=\lim_{x\to 1}(x-1)\\
&=0
\end{aligned}
$$

3)
$$
\begin{aligned}
\lim_{x\to 1}\frac{x-1}{(x-1)^2}
&=\lim_{x\to 1}\frac{1}{x-1}\\
&\text{não existe (diverge)}
\end{aligned}
$$

Nos três casos, a substituição direta dá $\frac{0}{0}$, mas os limites são **diferentes**.  
Por isso $\frac{0}{0}$ é **indeterminação**.

### As indeterminações mais comuns

- $\displaystyle \frac{0}{0}$

- $\displaystyle \frac{\infty}{\infty}$

Outras (que aparecem depois, quando você avançar um pouco mais):

- $0\cdot\infty$

- $\infty-\infty$

- $0^0$, $1^\infty$, $\infty^0$

### O que fazer quando aparecer indeterminação?

Você precisa transformar a expressão até ela deixar de ser indeterminada, usando técnicas como:

- fatoração e cancelamento,
- racionalização,
- termo em evidência,
- identidades trigonométricas,
- (mais adiante) regra de L’Hôpital.

A regra de ouro é:

> **Indeterminação não é resposta. É um sinal de que você precisa simplificar.**

---

## 3) Técnicas que você vai usar o tempo todo (mini-resumo)

- **Substituição direta** (quando $f$ é contínua no ponto).
- **Fatoração** (diferença de dois quadrados / trinômio do 2º grau).
- **Termo em evidência** (colocar $x$ ou $x^n$ em evidência e cancelar).
- **Limites trigonométricos fundamentais**:
  - $\displaystyle \lim_{x\to 0}\frac{\sin x}{x}=1$
  - $\displaystyle \lim_{x\to 0}\frac{1-\cos x}{x^2}=\frac12$
- **Limites laterais** (esquerda/direita).
- **Limites no infinito** (grau do polinômio / dividir pelo maior grau / racionalizar).

---

# PARTE 01 — Substituição direta (quando dá para “trocar”)

<div style="border-left: 4px solid #2196F3; padding: 1em; background-color: #e3f2fd; margin: 1em 0; border-radius: 4px;">
  <h4 style="margin-top: 0;">Ideia</h4>
  <p>Se $f$ é contínua em $a$, então $\displaystyle \lim_{x\to a} f(x)=f(a)$. Aqui, substituir direto funciona.</p>
</div>

### Exemplo 1
Calcule $\displaystyle \lim_{x\to 2}(3x^2-5x+1)$.

$$
\begin{aligned}
\lim_{x\to 2}(3x^2-5x+1)
&=3(2)^2-5(2)+1\\
&=3\cdot 4-10+1\\
&=12-10+1\\
&=3
\end{aligned}
$$

### Exemplo 2
Calcule $\displaystyle \lim_{x\to -1}(x^3+4x^2-2x+7)$.

$$
\begin{aligned}
\lim_{x\to -1}(x^3+4x^2-2x+7)
&=(-1)^3+4(-1)^2-2(-1)+7\\
&=-1+4\cdot 1+2+7\\
&=-1+4+2+7\\
&=12
\end{aligned}
$$

### Exemplo 3
Calcule $\displaystyle \lim_{x\to 9}\left(\sqrt{x}+\frac{1}{x}\right)$.

$$
\begin{aligned}
\lim_{x\to 9}\left(\sqrt{x}+\frac{1}{x}\right)
&=\sqrt{9}+\frac{1}{9}\\
&=3+\frac{1}{9}\\
&=\frac{27}{9}+\frac{1}{9}\\
&=\frac{28}{9}
\end{aligned}
$$

### Exemplo 4
Calcule $\displaystyle \lim_{x\to \pi/6}(2\sin x-1)$.

$$
\begin{aligned}
\lim_{x\to \pi/6}(2\sin x-1)
&=2\sin\left(\frac{\pi}{6}\right)-1\\
&=2\cdot \frac12-1\\
&=1-1\\
&=0
\end{aligned}
$$

### Exemplo 5
Calcule $\displaystyle \lim_{x\to 1}\frac{x^2+1}{x+2}$.

$$
\begin{aligned}
\lim_{x\to 1}\frac{x^2+1}{x+2}
&=\frac{1^2+1}{1+2}\\
&=\frac{2}{3}
\end{aligned}
$$

---

# PARTE 02 — Diferença de dois quadrados

<div style="border-left: 4px solid #4CAF50; padding: 1em; background-color: #e8f5e9; margin: 1em 0; border-radius: 4px;">
  <h4 style="margin-top: 0;">Chave</h4>
  <p>Use $a^2-b^2=(a-b)(a+b)$ para cancelar o fator que zera (normalmente dá $0/0$).</p>
</div>

### Exemplo 1
$\displaystyle \lim_{x\to 3}\frac{x^2-9}{x-3}$

$$
\begin{aligned}
\lim_{x\to 3}\frac{x^2-9}{x-3}
&=\lim_{x\to 3}\frac{(x-3)(x+3)}{x-3}\\
&=\lim_{x\to 3}(x+3)\\
&=3+3\\
&=6
\end{aligned}
$$

### Exemplo 2
$\displaystyle \lim_{x\to 5}\frac{x^2-25}{x-5}$

$$
\begin{aligned}
\lim_{x\to 5}\frac{x^2-25}{x-5}
&=\lim_{x\to 5}\frac{(x-5)(x+5)}{x-5}\\
&=\lim_{x\to 5}(x+5)\\
&=10
\end{aligned}
$$

### Exemplo 3
$\displaystyle \lim_{x\to -2}\frac{x^2-4}{x+2}$

$$
\begin{aligned}
\lim_{x\to -2}\frac{x^2-4}{x+2}
&=\lim_{x\to -2}\frac{(x-2)(x+2)}{x+2}\\
&=\lim_{x\to -2}(x-2)\\
&=-2-2\\
&=-4
\end{aligned}
$$

### Exemplo 4
$\displaystyle \lim_{x\to 1}\frac{1-x^2}{1-x}$

$$
\begin{aligned}
\lim_{x\to 1}\frac{1-x^2}{1-x}
&=\lim_{x\to 1}\frac{(1-x)(1+x)}{1-x}\\
&=\lim_{x\to 1}(1+x)\\
&=1+1\\
&=2
\end{aligned}
$$

### Exemplo 5
$\displaystyle \lim_{x\to 2}\frac{4-x^2}{2-x}$

$$
\begin{aligned}
\lim_{x\to 2}\frac{4-x^2}{2-x}
&=\lim_{x\to 2}\frac{(2-x)(2+x)}{2-x}\\
&=\lim_{x\to 2}(2+x)\\
&=2+2\\
&=4
\end{aligned}
$$

---

# PARTE 03 — Seno e Cosseno (limites trigonométricos)

<div style="border-left: 4px solid #9C27B0; padding: 1em; background-color: #f3e5f5; margin: 1em 0; border-radius: 4px;">
  <h4 style="margin-top: 0;">Fórmulas-base</h4>
  <p>
    $\displaystyle \lim_{x\to 0}\frac{\sin x}{x}=1$ e
    $\displaystyle \lim_{x\to 0}\frac{1-\cos x}{x^2}=\frac12$.
    A partir delas, você resolve quase tudo com substituições e manipulações.
  </p>
</div>

### Exemplo 1
$\displaystyle \lim_{x\to 0}\frac{\sin x}{x}$

$$
\begin{aligned}
\lim_{x\to 0}\frac{\sin x}{x}
&=1
\end{aligned}
$$

### Exemplo 2
$\displaystyle \lim_{x\to 0}\frac{\sin(5x)}{x}$

$$
\begin{aligned}
\lim_{x\to 0}\frac{\sin(5x)}{x}
&=\lim_{x\to 0}\left(5\cdot\frac{\sin(5x)}{5x}\right)\\
&=5\cdot \lim_{x\to 0}\frac{\sin(5x)}{5x}\\
&=5\cdot 1\\
&=5
\end{aligned}
$$

### Exemplo 3
$\displaystyle \lim_{x\to 0}\frac{1-\cos x}{x^2}$

$$
\begin{aligned}
\lim_{x\to 0}\frac{1-\cos x}{x^2}
&=\lim_{x\to 0}\frac{1-\cos x}{x^2}\cdot\frac{1+\cos x}{1+\cos x}\\
&=\lim_{x\to 0}\frac{1-\cos^2 x}{x^2(1+\cos x)}\\
&=\lim_{x\to 0}\frac{\sin^2 x}{x^2(1+\cos x)}\\
&=\lim_{x\to 0}\left(\frac{\sin x}{x}\right)^2\cdot \frac{1}{1+\cos x}\\
&=1^2\cdot \frac{1}{1+1}\\
&=\frac{1}{2}
\end{aligned}
$$

### Exemplo 4
$\displaystyle \lim_{x\to 0}\frac{1-\cos(3x)}{x^2}$

$$
\begin{aligned}
\lim_{x\to 0}\frac{1-\cos(3x)}{x^2}
&=\lim_{x\to 0}\left(\frac{1-\cos(3x)}{(3x)^2}\right)\cdot 9\\
&=9\cdot \lim_{x\to 0}\frac{1-\cos(3x)}{(3x)^2}\\
&=9\cdot \frac{1}{2}\\
&=\frac{9}{2}
\end{aligned}
$$

### Exemplo 5
$\displaystyle \lim_{x\to 0}\frac{\tan x}{x}$

$$
\begin{aligned}
\lim_{x\to 0}\frac{\tan x}{x}
&=\lim_{x\to 0}\frac{\sin x}{x\cos x}\\
&=\lim_{x\to 0}\left(\frac{\sin x}{x}\right)\cdot\left(\frac{1}{\cos x}\right)\\
&=1\cdot \frac{1}{1}\\
&=1
\end{aligned}
$$

---

# PARTE 04 — Trinômio de segundo grau (fatoração)

<div style="border-left: 4px solid #FF9800; padding: 1em; background-color: #fff3e0; margin: 1em 0; border-radius: 4px;">
  <h4 style="margin-top: 0;">Chave</h4>
  <p>Quando aparece um polinômio do tipo $x^2+bx+c$, fatorar em $(x-r_1)(x-r_2)$ costuma revelar o fator que cancela e remove o $0/0$.</p>
</div>

### Exemplo 1
$\displaystyle \lim_{x\to 1}\frac{x^2-3x+2}{x-1}$

$$
\begin{aligned}
\lim_{x\to 1}\frac{x^2-3x+2}{x-1}
&=\lim_{x\to 1}\frac{(x-1)(x-2)}{x-1}\\
&=\lim_{x\to 1}(x-2)\\
&=1-2\\
&=-1
\end{aligned}
$$

### Exemplo 2
$\displaystyle \lim_{x\to 2}\frac{x^2-5x+6}{x-2}$

$$
\begin{aligned}
\lim_{x\to 2}\frac{x^2-5x+6}{x-2}
&=\lim_{x\to 2}\frac{(x-2)(x-3)}{x-2}\\
&=\lim_{x\to 2}(x-3)\\
&=2-3\\
&=-1
\end{aligned}
$$

### Exemplo 3
$\displaystyle \lim_{x\to -1}\frac{x^2+x}{x+1}$

$$
\begin{aligned}
\lim_{x\to -1}\frac{x^2+x}{x+1}
&=\lim_{x\to -1}\frac{x(x+1)}{x+1}\\
&=\lim_{x\to -1}x\\
&=-1
\end{aligned}
$$

### Exemplo 4
$\displaystyle \lim_{x\to 3}\frac{x^2-6x+9}{x-3}$

$$
\begin{aligned}
\lim_{x\to 3}\frac{x^2-6x+9}{x-3}
&=\lim_{x\to 3}\frac{(x-3)^2}{x-3}\\
&=\lim_{x\to 3}(x-3)\\
&=3-3\\
&=0
\end{aligned}
$$

### Exemplo 5
$\displaystyle \lim_{x\to 1}\frac{x^2+2x-3}{x-1}$

$$
\begin{aligned}
\lim_{x\to 1}\frac{x^2+2x-3}{x-1}
&=\lim_{x\to 1}\frac{(x+3)(x-1)}{x-1}\\
&=\lim_{x\to 1}(x+3)\\
&=1+3\\
&=4
\end{aligned}
$$

---

# PARTE 05 — Termo em evidência (fator comum)

<div style="border-left: 4px solid #607D8B; padding: 1em; background-color: #eceff1; margin: 1em 0; border-radius: 4px;">
  <h4 style="margin-top: 0;">Chave</h4>
  <p>Se dá $0/0$, procure <strong>fator comum</strong> (como $x$, $x^2$, $x-2$, etc.). Coloque em evidência, cancele e só então substitua.</p>
</div>

### Exemplo 1
$\displaystyle \lim_{x\to 0}\frac{x^2+x}{x}$

$$
\begin{aligned}
\lim_{x\to 0}\frac{x^2+x}{x}
&=\lim_{x\to 0}\frac{x(x+1)}{x}\\
&=\lim_{x\to 0}(x+1)\\
&=0+1\\
&=1
\end{aligned}
$$

### Exemplo 2
$\displaystyle \lim_{x\to 0}\frac{x^3-4x}{x}$

$$
\begin{aligned}
\lim_{x\to 0}\frac{x^3-4x}{x}
&=\lim_{x\to 0}\frac{x(x^2-4)}{x}\\
&=\lim_{x\to 0}(x^2-4)\\
&=0^2-4\\
&=-4
\end{aligned}
$$

### Exemplo 3
$\displaystyle \lim_{x\to 0}\frac{x^3-x^2}{x^2}$

$$
\begin{aligned}
\lim_{x\to 0}\frac{x^3-x^2}{x^2}
&=\lim_{x\to 0}\frac{x^2(x-1)}{x^2}\\
&=\lim_{x\to 0}(x-1)\\
&=0-1\\
&=-1
\end{aligned}
$$

### Exemplo 4
$\displaystyle \lim_{x\to 2}\frac{x^2-2x}{x-2}$

$$
\begin{aligned}
\lim_{x\to 2}\frac{x^2-2x}{x-2}
&=\lim_{x\to 2}\frac{x(x-2)}{x-2}\\
&=\lim_{x\to 2}x\\
&=2
\end{aligned}
$$

### Exemplo 5
$\displaystyle \lim_{x\to 0}\frac{7x^4-x^2}{x^2}$

$$
\begin{aligned}
\lim_{x\to 0}\frac{7x^4-x^2}{x^2}
&=\lim_{x\to 0}\frac{x^2(7x^2-1)}{x^2}\\
&=\lim_{x\to 0}(7x^2-1)\\
&=7\cdot 0^2-1\\
&=-1
\end{aligned}
$$

---

# PARTE 06 — Limites laterais (esquerda e direita)

<div style="border-left: 4px solid #E91E63; padding: 1em; background-color: #fce4ec; margin: 1em 0; border-radius: 4px;">
  <h4 style="margin-top: 0;">Chave</h4>
  <p>Se a função muda de “regra” perto do ponto (módulo, frações com sinal, função por partes, domínio), calcule $\lim_{x\to a^-}$ e $\lim_{x\to a^+}$ separadamente.</p>
</div>

### Exemplo 1
$\displaystyle \lim_{x\to 0}\frac{|x|}{x}$

**Pela direita** ($x\to 0^+$, então $x>0\Rightarrow |x|=x$):

$$
\begin{aligned}
\lim_{x\to 0^+}\frac{|x|}{x}
&=\lim_{x\to 0^+}\frac{x}{x}\\
&=\lim_{x\to 0^+}1\\
&=1
\end{aligned}
$$

**Pela esquerda** ($x\to 0^-$, então $x<0\Rightarrow |x|=-x$):

$$
\begin{aligned}
\lim_{x\to 0^-}\frac{|x|}{x}
&=\lim_{x\to 0^-}\frac{-x}{x}\\
&=\lim_{x\to 0^-}(-1)\\
&=-1
\end{aligned}
$$

Como $1\neq -1$, o limite bilateral **não existe**.

---

### Exemplo 2
$\displaystyle \lim_{x\to 1}\frac{1}{x-1}$

**Pela esquerda** ($x\to 1^-\Rightarrow x-1<0$):

$$
\begin{aligned}
\lim_{x\to 1^-}\frac{1}{x-1}
&=-\infty
\end{aligned}
$$

**Pela direita** ($x\to 1^+\Rightarrow x-1>0$):

$$
\begin{aligned}
\lim_{x\to 1^+}\frac{1}{x-1}
&=+\infty
\end{aligned}
$$

Como divergem para infinitos “diferentes”, o limite bilateral **não existe**.

---

### Exemplo 3
$\displaystyle \lim_{x\to 4}\sqrt{4-x}$ (no conjunto dos reais)

O domínio exige $4-x\ge 0\Rightarrow x\le 4$.  
Então só faz sentido aproximar por **esquerda**.

$$
\begin{aligned}
\lim_{x\to 4^-}\sqrt{4-x}
&=\sqrt{4-4}\\
&=0
\end{aligned}
$$

Pela direita ($x>4$), $\sqrt{4-x}$ **não é real**.  
Logo, o limite bilateral (em $\mathbb{R}$) **não existe**.

---

### Exemplo 4 (função por partes)
Considere

$$
f(x)=
\begin{cases}
x^2+1, & x<2\\
5-x, & x\ge 2
\end{cases}
$$

Calcule $\displaystyle \lim_{x\to 2} f(x)$.

**Pela esquerda:**

$$
\begin{aligned}
\lim_{x\to 2^-}f(x)
&=\lim_{x\to 2^-}(x^2+1)\\
&=2^2+1\\
&=5
\end{aligned}
$$

**Pela direita:**

$$
\begin{aligned}
\lim_{x\to 2^+}f(x)
&=\lim_{x\to 2^+}(5-x)\\
&=5-2\\
&=3
\end{aligned}
$$

Como $5\neq 3$, o limite bilateral **não existe**.

---

### Exemplo 5 (limite existe e “conserta” o ponto)
Defina

$$
g(x)=
\begin{cases}
\dfrac{x^2-1}{x-1}, & x\ne 1\\
2, & x=1
\end{cases}
$$

Calcule $\displaystyle \lim_{x\to 1} g(x)$.

$$
\begin{aligned}
\lim_{x\to 1}g(x)
&=\lim_{x\to 1}\frac{x^2-1}{x-1}\\
&=\lim_{x\to 1}\frac{(x-1)(x+1)}{x-1}\\
&=\lim_{x\to 1}(x+1)\\
&=1+1\\
&=2
\end{aligned}
$$

Como o limite dá $2$ e $g(1)=2$, a função ficou **contínua** em $x=1$.

---

# PARTE 07 — Limites no infinito ($x\to \infty$ / $x\to -\infty$)

<div style="border-left: 4px solid #3F51B5; padding: 1em; background-color: #e8eaf6; margin: 1em 0; border-radius: 4px;">
  <h4 style="margin-top: 0;">Chave</h4>
  <p>Para frações com polinômios, compare <strong>graus</strong> e/ou divida tudo pelo maior grau. Para raízes, às vezes é melhor <strong>racionalizar</strong>.</p>
</div>

### Exemplo 1
$\displaystyle \lim_{x\to \infty}\frac{3x^2+1}{x^2-5x}$

$$
\begin{aligned}
\lim_{x\to \infty}\frac{3x^2+1}{x^2-5x}
&=\lim_{x\to \infty}\frac{\frac{3x^2}{x^2}+\frac{1}{x^2}}{\frac{x^2}{x^2}-\frac{5x}{x^2}}\\
&=\lim_{x\to \infty}\frac{3+\frac{1}{x^2}}{1-\frac{5}{x}}\\
&=\frac{3+0}{1-0}\\
&=3
\end{aligned}
$$

### Exemplo 2
$\displaystyle \lim_{x\to \infty}\frac{5x-2}{2x^2+1}$

$$
\begin{aligned}
\lim_{x\to \infty}\frac{5x-2}{2x^2+1}
&=\lim_{x\to \infty}\frac{\frac{5x}{x^2}-\frac{2}{x^2}}{\frac{2x^2}{x^2}+\frac{1}{x^2}}\\
&=\lim_{x\to \infty}\frac{\frac{5}{x}-\frac{2}{x^2}}{2+\frac{1}{x^2}}\\
&=\frac{0-0}{2+0}\\
&=0
\end{aligned}
$$

### Exemplo 3
$\displaystyle \lim_{x\to -\infty}\frac{2x^3-x}{x^3+4}$

$$
\begin{aligned}
\lim_{x\to -\infty}\frac{2x^3-x}{x^3+4}
&=\lim_{x\to -\infty}\frac{\frac{2x^3}{x^3}-\frac{x}{x^3}}{\frac{x^3}{x^3}+\frac{4}{x^3}}\\
&=\lim_{x\to -\infty}\frac{2-\frac{1}{x^2}}{1+\frac{4}{x^3}}\\
&=\frac{2-0}{1+0}\\
&=2
\end{aligned}
$$

### Exemplo 4 (racionalização)
$\displaystyle \lim_{x\to \infty}\left(\sqrt{x^2+4x}-x\right)$

$$
\begin{aligned}
\lim_{x\to \infty}\left(\sqrt{x^2+4x}-x\right)
&=\lim_{x\to \infty}\left(\sqrt{x^2+4x}-x\right)\cdot\frac{\sqrt{x^2+4x}+x}{\sqrt{x^2+4x}+x}\\
&=\lim_{x\to \infty}\frac{(x^2+4x)-x^2}{\sqrt{x^2+4x}+x}\\
&=\lim_{x\to \infty}\frac{4x}{\sqrt{x^2+4x}+x}\\
&=\lim_{x\to \infty}\frac{4}{\sqrt{1+\frac{4}{x}}+1}\\
&=\frac{4}{\sqrt{1+0}+1}\\
&=\frac{4}{2}\\
&=2
\end{aligned}
$$

### Exemplo 5
$\displaystyle \lim_{x\to \infty}\frac{x^2+3}{\sqrt{x^4+1}}$

$$
\begin{aligned}
\lim_{x\to \infty}\frac{x^2+3}{\sqrt{x^4+1}}
&=\lim_{x\to \infty}\frac{x^2\left(1+\frac{3}{x^2}\right)}{\sqrt{x^4\left(1+\frac{1}{x^4}\right)}}\\
&=\lim_{x\to \infty}\frac{x^2\left(1+\frac{3}{x^2}\right)}{|x^2|\sqrt{1+\frac{1}{x^4}}}\\
&=\lim_{x\to \infty}\frac{x^2\left(1+\frac{3}{x^2}\right)}{x^2\sqrt{1+\frac{1}{x^4}}}\\
&=\lim_{x\to \infty}\frac{1+\frac{3}{x^2}}{\sqrt{1+\frac{1}{x^4}}}\\
&=\frac{1+0}{\sqrt{1+0}}\\
&=1
\end{aligned}
$$

---

## Referência rápida (para revisar em 30 segundos)

<div style="border-left: 4px solid #2196F3; padding: 0.5em; background-color: #e3f2fd; margin: 1em 0;">
  <strong>Checklist</strong>
  <ul>
    <li>Se substituição direta não dá problema: <strong>substitua</strong>.</li>
    <li>Se apareceu <strong>$0/0$</strong>: <strong>fatore</strong> e cancele o fator que zera.</li>
    <li>Diferença de quadrados: <strong>$a^2-b^2=(a-b)(a+b)$</strong>.</li>
    <li>Trigonométricos: <strong>$\lim_{x\to 0}\frac{\sin x}{x}=1$</strong> e <strong>$\lim_{x\to 0}\frac{1-\cos x}{x^2}=\frac12$</strong>.</li>
    <li>Laterais: calcule $\lim_{x\to a^-}$ e $\lim_{x\to a^+}$. Se forem diferentes, <strong>não existe</strong> limite bilateral.</li>
    <li>No infinito: compare <strong>graus</strong> (divida pelo maior grau) e, se tiver raiz, considere <strong>racionalizar</strong>.</li>
  </ul>
</div>

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
