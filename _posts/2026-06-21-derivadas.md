---
layout: post
image: /assets/images/calculus.avif
title: "Derivadas no Cálculo: definição, regras, regra da cadeia e exemplos resolvidos (passo a passo)"
categories: [CALCULO, MATEMATICA]
lang: pt
tags: [Cálculo]
ref: derivadas-calculo
author: dante-bertuzzi
description: "Derivadas - da definição por limite às aplicações com reta tangente."
mathjax: true
---

<div style="border-left: 4px solid #f44336; padding: 1em; background-color: #ffebee; margin: 1em 0; border-radius: 4px;">
  <h4 style="margin-top: 0;">Pergunta</h4>
  <p>O que é a <strong>derivada</strong> de uma função, como calculá-la usando a <strong>definição por limite</strong>, quais são as <strong>regras de derivação</strong> (potência, produto, quociente, cadeia), e como usá-la para encontrar a <strong>equação da reta tangente</strong>?</p>
</div>

<figure style="display: flex; flex-direction: column; align-items: center; margin: 2.5em 0 2em 0;">
  <img src="/assets/images/calculus.avif" alt="Interpretação geométrica da derivada como inclinação da reta tangente." style="max-width: 50%; height: auto; border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.07);" />
  <figcaption class="img-caption-contrast">
    <strong>Figura:</strong> A derivada $f'(x_0)$ é a <em>inclinação</em> da reta tangente ao gráfico de $f$ no ponto $(x_0, f(x_0))$.
  </figcaption>
</figure>

---

## 1) A ideia central (intuição + fórmula)

A **derivada** de uma função $f$ em um ponto $x$ é definida como o limite do quociente diferencial:

$$
f'(x) = \lim_{h \to 0} \frac{f(x+h) - f(x)}{h}.
$$

Se esse limite existe, dizemos que $f$ é **derivável** (ou **diferenciável**) em $x$. A derivada mede a **taxa de variação instantânea** de $f$ — geometricamente, é a **inclinação da reta tangente** ao gráfico de $f$ naquele ponto.

### Notações (o que cada uma significa)

<table class="mk-table">
  <thead>
    <tr><th>Símbolo</th><th>Significado</th></tr>
  </thead>
  <tbody>
    <tr><td>$f'(x)$</td><td>notação de Lagrange (lê-se "$f$ linha de $x$")</td></tr>
    <tr><td>$\dfrac{dy}{dx}$</td><td>notação de Leibniz ($y$ em função de $x$)</td></tr>
    <tr><td>$\dfrac{d}{dx}\big[f(x)\big]$</td><td>operador diferencial aplicado a $f(x)$</td></tr>
    <tr><td>$D_x f(x)$</td><td>notação de Euler</td></tr>
    <tr><td>$\dot{y}$</td><td>notação de Newton (derivada em relação ao tempo)</td></tr>
  </tbody>
</table>

### Diferenciabilidade implica continuidade

Se $f$ é derivável em $x = a$, então $f$ é **contínua** em $a$. Mas a recíproca é **falsa**: uma função pode ser contínua num ponto sem ser derivável ali (exemplo clássico: $f(x) = |x|$ em $x = 0$).

---

## 2) Formas de calcular a derivada

Você tem basicamente **três caminhos**:

- **Definição** (limite do quociente diferencial) — usado para deduzir as regras e para funções que não se encaixam nas regras-padrão.
- **Regras de derivação** — tabela de derivadas prontas (potência, exponencial, trigonométricas, etc.).
- **Regras operatórias** — produto, quociente, cadeia.

A regra de ouro:

> **A definição justifica as regras. Depois que você domina as regras, raramente volta à definição. Mas saber a definição é o que separa quem entende Cálculo de quem só decora fórmulas.**

---

# PARTE 01 — Derivada pela definição (limite do quociente diferencial)

<div style="border-left: 4px solid #2196F3; padding: 1em; background-color: #e3f2fd; margin: 1em 0; border-radius: 4px;">
  <h4 style="margin-top: 0;">Definição</h4>
  <p>$\displaystyle f'(x) = \lim_{h \to 0} \frac{f(x+h) - f(x)}{h}$. Calcule $f(x+h)$, monte a fração, cancele $h$ e então faça $h \to 0$.</p>
</div>

### Exemplo 1
Calcule $f'(x)$ para $f(x) = x^2$ usando a definição.

$$
\begin{aligned}
f(x+h) &= (x+h)^2 = x^2 + 2xh + h^2,\\[4pt]
\frac{f(x+h)-f(x)}{h} &= \frac{(x^2 + 2xh + h^2) - x^2}{h}
= \frac{2xh + h^2}{h}
= \frac{h(2x + h)}{h}
= 2x + h,\\[4pt]
f'(x) &= \lim_{h \to 0} (2x + h) = 2x.
\end{aligned}
$$

### Exemplo 2
Calcule $f'(x)$ para $f(x) = 3x + 1$ usando a definição.

$$
\begin{aligned}
f(x+h) &= 3(x+h) + 1 = 3x + 3h + 1,\\[4pt]
\frac{f(x+h)-f(x)}{h} &= \frac{(3x + 3h + 1) - (3x + 1)}{h}
= \frac{3h}{h}
= 3,\\[4pt]
f'(x) &= \lim_{h \to 0} 3 = 3.
\end{aligned}
$$

### Exemplo 3
Calcule $f'(x)$ para $f(x) = \dfrac{1}{x}$ usando a definição.

$$
\begin{aligned}
f(x+h) &= \frac{1}{x+h},\\[4pt]
\frac{f(x+h)-f(x)}{h} &= \frac{\frac{1}{x+h} - \frac{1}{x}}{h}
= \frac{\frac{x - (x+h)}{x(x+h)}}{h}
= \frac{\frac{-h}{x(x+h)}}{h}
= \frac{-1}{x(x+h)},\\[4pt]
f'(x) &= \lim_{h \to 0} \frac{-1}{x(x+h)} = -\frac{1}{x^2}.
\end{aligned}
$$

### Exemplo 4
Calcule $f'(x)$ para $f(x) = \sqrt{x}$ usando a definição.

$$
\begin{aligned}
\frac{f(x+h)-f(x)}{h} &= \frac{\sqrt{x+h} - \sqrt{x}}{h}
\cdot \frac{\sqrt{x+h} + \sqrt{x}}{\sqrt{x+h} + \sqrt{x}} \\[4pt]
&= \frac{(x+h) - x}{h(\sqrt{x+h} + \sqrt{x})}
= \frac{h}{h(\sqrt{x+h} + \sqrt{x})}
= \frac{1}{\sqrt{x+h} + \sqrt{x}},\\[4pt]
f'(x) &= \lim_{h \to 0} \frac{1}{\sqrt{x+h} + \sqrt{x}} = \frac{1}{2\sqrt{x}}.
\end{aligned}
$$

### Exemplo 5
Calcule $f'(0)$ para $f(x) = x\,|x|$ usando a definição.

$$
\begin{aligned}
f'(0) &= \lim_{h \to 0} \frac{f(0+h) - f(0)}{h}
= \lim_{h \to 0} \frac{h\,|h| - 0}{h}
= \lim_{h \to 0} |h|
= 0.
\end{aligned}
$$

A derivada existe e vale $0$ em $x=0$, embora $|x|$ sozinha não fosse derivável ali.

---

# PARTE 02 — Regras básicas (potência, constante, soma e diferença)

<div style="border-left: 4px solid #4CAF50; padding: 1em; background-color: #e8f5e9; margin: 1em 0; border-radius: 4px;">
  <h4 style="margin-top: 0;">Tabela-relâmpago</h4>
  <p>
    $\displaystyle \frac{d}{dx}\big[c\big] = 0$ &nbsp;(derivada de constante é zero).<br>
    $\displaystyle \frac{d}{dx}\big[x^n\big] = n x^{n-1}$ &nbsp;(regra da potência, $n \in \mathbb{R}$).<br>
    $\displaystyle \frac{d}{dx}\big[c \cdot f(x)\big] = c \cdot f'(x)$ &nbsp;(múltiplo constante).<br>
    $\displaystyle \frac{d}{dx}\big[f(x) \pm g(x)\big] = f'(x) \pm g'(x)$ &nbsp;(soma/diferença).
  </p>
</div>

### Exemplo 1
Derive $f(x) = 7x^4$.

$$
f'(x) = 7 \cdot 4x^{3} = 28x^3.
$$

### Exemplo 2
Derive $f(x) = 5x^3 - 2x^2 + 4x - 9$.

$$
f'(x) = 5\cdot 3x^2 - 2\cdot 2x^1 + 4\cdot 1x^0 - 0 = 15x^2 - 4x + 4.
$$

### Exemplo 3
Derive $f(x) = \sqrt[3]{x^2} = x^{2/3}$.

$$
f'(x) = \frac{2}{3}\,x^{\frac{2}{3}-1} = \frac{2}{3}\,x^{-1/3} = \frac{2}{3\sqrt[3]{x}}.
$$

### Exemplo 4
Derive $f(x) = \dfrac{1}{x^3} = x^{-3}$.

$$
f'(x) = -3x^{-4} = -\frac{3}{x^4}.
$$

### Exemplo 5
Derive $f(x) = \dfrac{x^3 + 2x^2 - 5}{x}$ (simplifique antes).

$$
\begin{aligned}
f(x) &= \frac{x^3}{x} + \frac{2x^2}{x} - \frac{5}{x}
= x^2 + 2x - 5x^{-1},\\[4pt]
f'(x) &= 2x + 2 - 5(-1)x^{-2}
= 2x + 2 + \frac{5}{x^2}.
\end{aligned}
$$

---

# PARTE 03 — Regra do produto e do quociente

<div style="border-left: 4px solid #9C27B0; padding: 1em; background-color: #f3e5f5; margin: 1em 0; border-radius: 4px;">
  <h4 style="margin-top: 0;">Fórmulas</h4>
  <p>
    <strong>Produto:</strong> $(f \cdot g)' = f' \cdot g + f \cdot g'$.<br>
    <strong>Quociente:</strong> $\displaystyle \left(\frac{f}{g}\right)' = \frac{f' \cdot g - f \cdot g'}{g^2}$.
  </p>
</div>

### Exemplo 1
Derive $h(x) = (x^2 + 1)(3x - 5)$.

$$
\begin{aligned}
h'(x) &= (2x)(3x-5) + (x^2+1)(3)\\
&= 6x^2 - 10x + 3x^2 + 3\\
&= 9x^2 - 10x + 3.
\end{aligned}
$$

### Exemplo 2
Derive $h(x) = (x^3 - x)(x^2 + 2x)$.

$$
\begin{aligned}
h'(x) &= (3x^2 - 1)(x^2 + 2x) + (x^3 - x)(2x + 2)\\
&= (3x^2 - 1)(x^2 + 2x) + (x^3 - x) \cdot 2(x+1).
\end{aligned}
$$

(A fatoração completa não é necessária aqui — o importante é aplicar a regra corretamente.)

### Exemplo 3
Derive $h(x) = \dfrac{x^2 - 1}{x + 2}$.

$$
\begin{aligned}
h'(x) &= \frac{(2x)(x+2) - (x^2 - 1)(1)}{(x+2)^2}\\[4pt]
&= \frac{2x^2 + 4x - x^2 + 1}{(x+2)^2}\\[4pt]
&= \frac{x^2 + 4x + 1}{(x+2)^2}.
\end{aligned}
$$

### Exemplo 4
Derive $h(x) = \dfrac{\sin x}{x}$.

$$
\begin{aligned}
h'(x) &= \frac{(\cos x)(x) - (\sin x)(1)}{x^2}
= \frac{x\cos x - \sin x}{x^2}.
\end{aligned}
$$

### Exemplo 5
Derive $h(x) = \dfrac{x+1}{x^2+3}$.

$$
\begin{aligned}
h'(x) &= \frac{(1)(x^2+3) - (x+1)(2x)}{(x^2+3)^2}\\[4pt]
&= \frac{x^2 + 3 - 2x^2 - 2x}{(x^2+3)^2}\\[4pt]
&= \frac{-x^2 - 2x + 3}{(x^2+3)^2}.
\end{aligned}
$$

---

# PARTE 04 — Regra da cadeia

<div style="border-left: 4px solid #FF9800; padding: 1em; background-color: #fff3e0; margin: 1em 0; border-radius: 4px;">
  <h4 style="margin-top: 0;">Fórmula</h4>
  <p>
    $\displaystyle \frac{d}{dx}\big[f(g(x))\big] = f'(g(x)) \cdot g'(x)$.<br>
    Em palavras: <strong>derivada de fora $\times$ derivada de dentro</strong>.
  </p>
</div>

### Exemplo 1
Derive $h(x) = (2x + 1)^5$.

$$
\begin{aligned}
h'(x) &= 5(2x + 1)^4 \cdot \frac{d}{dx}[2x + 1]\\
&= 5(2x + 1)^4 \cdot 2\\
&= 10(2x + 1)^4.
\end{aligned}
$$

### Exemplo 2
Derive $h(x) = \sqrt{x^2 + 4} = (x^2 + 4)^{1/2}$.

$$
\begin{aligned}
h'(x) &= \frac{1}{2}(x^2 + 4)^{-1/2} \cdot (2x)\\
&= \frac{x}{\sqrt{x^2 + 4}}.
\end{aligned}
$$

### Exemplo 3
Derive $h(x) = \sin(x^2 + 3x)$.

$$
\begin{aligned}
h'(x) &= \cos(x^2 + 3x) \cdot \frac{d}{dx}[x^2 + 3x]\\
&= \cos(x^2 + 3x) \cdot (2x + 3).
\end{aligned}
$$

### Exemplo 4
Derive $h(x) = e^{x^3 - x}$.

$$
\begin{aligned}
h'(x) &= e^{x^3 - x} \cdot \frac{d}{dx}[x^3 - x]\\
&= e^{x^3 - x} \cdot (3x^2 - 1).
\end{aligned}
$$

### Exemplo 5 (cadeia dupla)
Derive $h(x) = \ln\big(\sin(x)\big)$.

$$
\begin{aligned}
h'(x) &= \frac{1}{\sin x} \cdot \frac{d}{dx}[\sin x]\\
&= \frac{1}{\sin x} \cdot \cos x\\
&= \cot x.
\end{aligned}
$$

---

# PARTE 05 — Derivadas de funções elementares (tabela completa)

<div style="border-left: 4px solid #607D8B; padding: 1em; background-color: #eceff1; margin: 1em 0; border-radius: 4px;">
  <h4 style="margin-top: 0;">Decore estas (aparecem o tempo todo)</h4>
  <p>
    $\displaystyle \frac{d}{dx}\big[\sin x\big] = \cos x$,
    $\displaystyle \frac{d}{dx}\big[\cos x\big] = -\sin x$,
    $\displaystyle \frac{d}{dx}\big[\tan x\big] = \sec^2 x$.<br>
    $\displaystyle \frac{d}{dx}\big[e^x\big] = e^x$,
    $\displaystyle \frac{d}{dx}\big[\ln x\big] = \frac{1}{x}$.<br>
    $\displaystyle \frac{d}{dx}\big[a^x\big] = a^x \ln a$,
    $\displaystyle \frac{d}{dx}\big[\log_a x\big] = \frac{1}{x \ln a}$.
  </p>
</div>

### Exemplo 1
Derive $f(x) = 3\sin x - 2\cos x$.

$$
\begin{aligned}
f'(x) &= 3\cos x - 2(-\sin x)\\
&= 3\cos x + 2\sin x.
\end{aligned}
$$

### Exemplo 2
Derive $f(x) = \tan x + \sec x$.

$$
\begin{aligned}
f'(x) &= \sec^2 x + \sec x \tan x.
\end{aligned}
$$

### Exemplo 3
Derive $f(x) = e^x \ln x$.

Usando regra do produto:

$$
\begin{aligned}
f'(x) &= e^x \cdot \ln x + e^x \cdot \frac{1}{x}\\
&= e^x\left(\ln x + \frac{1}{x}\right).
\end{aligned}
$$

### Exemplo 4
Derive $f(x) = 2^x + \log_2 x$.

$$
\begin{aligned}
f'(x) &= 2^x \ln 2 + \frac{1}{x \ln 2}.
\end{aligned}
$$

### Exemplo 5
Derive $f(x) = \dfrac{e^x}{\cos x}$.

Usando regra do quociente:

$$
\begin{aligned}
f'(x) &= \frac{e^x \cdot \cos x - e^x \cdot (-\sin x)}{\cos^2 x}\\[4pt]
&= \frac{e^x(\cos x + \sin x)}{\cos^2 x}.
\end{aligned}
$$

---

# PARTE 06 — Derivação implícita

<div style="border-left: 4px solid #E91E63; padding: 1em; background-color: #fce4ec; margin: 1em 0; border-radius: 4px;">
  <h4 style="margin-top: 0;">Quando usar</h4>
  <p>Quando $y$ está <strong>implícito</strong> como função de $x$ (ex.: $x^2 + y^2 = 25$), derive termo a termo em relação a $x$, tratando $y$ como $y(x)$ e usando a regra da cadeia em cada ocorrência de $y$: $\displaystyle \frac{d}{dx}[y] = \frac{dy}{dx}$ e $\displaystyle \frac{d}{dx}[y^n] = n y^{n-1}\,\frac{dy}{dx}$.</p>
</div>

### Exemplo 1
Encontre $\dfrac{dy}{dx}$ para $x^2 + y^2 = 25$.

$$
\begin{aligned}
\frac{d}{dx}[x^2] + \frac{d}{dx}[y^2] &= \frac{d}{dx}[25],\\[4pt]
2x + 2y\,\frac{dy}{dx} &= 0,\\[4pt]
2y\,\frac{dy}{dx} &= -2x,\\[4pt]
\frac{dy}{dx} &= -\frac{x}{y}.
\end{aligned}
$$

### Exemplo 2
Encontre $\dfrac{dy}{dx}$ para $x^3 + y^3 = 6xy$ (folium de Descartes).

$$
\begin{aligned}
3x^2 + 3y^2\,\frac{dy}{dx} &= 6y + 6x\,\frac{dy}{dx},\\[4pt]
3y^2\,\frac{dy}{dx} - 6x\,\frac{dy}{dx} &= 6y - 3x^2,\\[4pt]
\frac{dy}{dx}\,(3y^2 - 6x) &= 6y - 3x^2,\\[4pt]
\frac{dy}{dx} &= \frac{2y - x^2}{y^2 - 2x}.
\end{aligned}
$$

### Exemplo 3
Encontre $\dfrac{dy}{dx}$ para $e^{xy} = x + y$.

$$
\begin{aligned}
\frac{d}{dx}\big[e^{xy}\big] &= \frac{d}{dx}[x + y],\\[4pt]
e^{xy}\left(y + x\,\frac{dy}{dx}\right) &= 1 + \frac{dy}{dx},\\[4pt]
e^{xy}y + e^{xy}x\,\frac{dy}{dx} &= 1 + \frac{dy}{dx},\\[4pt]
e^{xy}x\,\frac{dy}{dx} - \frac{dy}{dx} &= 1 - e^{xy}y,\\[4pt]
\frac{dy}{dx}\,(e^{xy}x - 1) &= 1 - e^{xy}y,\\[4pt]
\frac{dy}{dx} &= \frac{1 - e^{xy}y}{e^{xy}x - 1}.
\end{aligned}
$$

### Exemplo 4
Encontre $\dfrac{dy}{dx}$ para $\sin(x + y) = y$.

$$
\begin{aligned}
\cos(x + y)\left(1 + \frac{dy}{dx}\right) &= \frac{dy}{dx},\\[4pt]
\cos(x + y) + \cos(x + y)\,\frac{dy}{dx} &= \frac{dy}{dx},\\[4pt]
\cos(x + y) &= \frac{dy}{dx} - \cos(x + y)\,\frac{dy}{dx},\\[4pt]
\cos(x + y) &= \frac{dy}{dx}\,\big(1 - \cos(x + y)\big),\\[4pt]
\frac{dy}{dx} &= \frac{\cos(x + y)}{1 - \cos(x + y)}.
\end{aligned}
$$

### Exemplo 5
Se $x^2 + xy + y^2 = 7$, encontre a inclinação da reta tangente no ponto $(-1, 2)$.

$$
\begin{aligned}
2x + \left(y + x\,\frac{dy}{dx}\right) + 2y\,\frac{dy}{dx} &= 0,\\[4pt]
2x + y + x\,\frac{dy}{dx} + 2y\,\frac{dy}{dx} &= 0,\\[4pt]
\frac{dy}{dx}\,(x + 2y) &= -2x - y,\\[4pt]
\frac{dy}{dx} &= \frac{-2x - y}{x + 2y}.
\end{aligned}
$$

No ponto $(-1, 2)$:

$$
\left.\frac{dy}{dx}\right|_{(-1,2)} = \frac{-2(-1) - 2}{-1 + 2(2)} = \frac{2 - 2}{-1 + 4} = \frac{0}{3} = 0.
$$

A tangente é horizontal nesse ponto.

---

# PARTE 07 — Aplicações: equação da reta tangente

<div style="border-left: 4px solid #3F51B5; padding: 1em; background-color: #e8eaf6; margin: 1em 0; border-radius: 4px;">
  <h4 style="margin-top: 0;">Chave</h4>
  <p>A equação da reta tangente ao gráfico de $f$ no ponto $(x_0, f(x_0))$ é:
  $\displaystyle y - f(x_0) = f'(x_0)(x - x_0)$.<br>
  A <strong>reta normal</strong> é perpendicular à tangente: sua inclinação é $-\dfrac{1}{f'(x_0)}$ (se $f'(x_0) \neq 0$).
  </p>
</div>

### Exemplo 1
Encontre a equação da reta tangente a $f(x) = x^2 + 1$ no ponto onde $x = 2$.

$$
\begin{aligned}
f(2) &= 4 + 1 = 5,\\
f'(x) &= 2x \implies f'(2) = 4,\\[4pt]
y - 5 &= 4(x - 2) \implies y = 4x - 3.
\end{aligned}
$$

### Exemplo 2
Encontre a equação da reta tangente a $f(x) = \sqrt{x}$ no ponto $(9, 3)$.

$$
\begin{aligned}
f'(x) &= \frac{1}{2\sqrt{x}} \implies f'(9) = \frac{1}{2 \cdot 3} = \frac{1}{6},\\[4pt]
y - 3 &= \frac{1}{6}(x - 9) \implies y = \frac{1}{6}x + \frac{3}{2}.
\end{aligned}
$$

### Exemplo 3
Encontre a equação da reta normal a $f(x) = e^x$ no ponto $(0, 1)$.

$$
\begin{aligned}
f'(x) &= e^x \implies f'(0) = 1,\\[4pt]
m_{\text{normal}} &= -\frac{1}{1} = -1,\\[4pt]
y - 1 &= -1(x - 0) \implies y = -x + 1.
\end{aligned}
$$

### Exemplo 4
Encontre os pontos sobre a curva $y = x^3 - 3x$ onde a reta tangente é horizontal.

$$
\begin{aligned}
f'(x) &= 3x^2 - 3 = 3(x^2 - 1) = 3(x - 1)(x + 1),\\[4pt]
f'(x) &= 0 \implies x = 1 \text{ ou } x = -1,\\[4pt]
f(1) &= 1 - 3 = -2,\\
f(-1) &= -1 + 3 = 2.
\end{aligned}
$$

Pontos: $(1, -2)$ e $(-1, 2)$.

### Exemplo 5
Encontre a equação da reta tangente a $f(x) = \sin x$ no ponto $x = \dfrac{\pi}{3}$.

$$
\begin{aligned}
f\!\left(\frac{\pi}{3}\right) &= \sin\frac{\pi}{3} = \frac{\sqrt{3}}{2},\\[4pt]
f'(x) &= \cos x \implies f'\!\left(\frac{\pi}{3}\right) = \cos\frac{\pi}{3} = \frac{1}{2},\\[4pt]
y - \frac{\sqrt{3}}{2} &= \frac{1}{2}\!\left(x - \frac{\pi}{3}\right)\\[4pt]
y &= \frac{1}{2}x - \frac{\pi}{6} + \frac{\sqrt{3}}{2}.
\end{aligned}
$$

---

## Derivadas de ordem superior

Se $f'$ for derivável, podemos derivar de novo e obter a **segunda derivada**:

$$
f''(x) = \frac{d^2f}{dx^2} = \frac{d}{dx}\big[f'(x)\big].
$$

A segunda derivada mede a **concavidade** do gráfico e a **aceleração** (em física). Analogamente, $f'''$, $f^{(4)}$, etc.

**Exemplo-relâmpago:** $f(x) = x^4$. Então $f'(x) = 4x^3$, $f''(x) = 12x^2$, $f'''(x) = 24x$, $f^{(4)}(x) = 24$, $f^{(5)}(x) = 0$.

---

## Referência rápida (para revisar em 30 segundos)

<div style="border-left: 4px solid #2196F3; padding: 0.5em; background-color: #e3f2fd; margin: 1em 0;">
  <strong>Checklist</strong>
  <ul>
    <li><strong>Definição:</strong> $\displaystyle f'(x) = \lim_{h \to 0} \frac{f(x+h) - f(x)}{h}$ &mdash; é a inclinação da tangente.</li>
    <li><strong>Potência:</strong> $\frac{d}{dx}[x^n] = n x^{n-1}$.</li>
    <li><strong>Produto:</strong> $(fg)' = f'g + fg'$.</li>
    <li><strong>Quociente:</strong> $\displaystyle \left(\frac{f}{g}\right)' = \frac{f'g - fg'}{g^2}$.</li>
    <li><strong>Cadeia:</strong> $\frac{d}{dx}[f(g(x))] = f'(g(x)) \cdot g'(x)$ &mdash; derivada de fora vezes derivada de dentro.</li>
    <li><strong>Elementares:</strong> $\sin'=\cos$, $\cos'=-\sin$, $\tan'=\sec^2$, $e^x{'}=e^x$, $\ln'(x)=1/x$.</li>
    <li><strong>Implícita:</strong> derive tudo em $x$, use regra da cadeia em $y$, isole $dy/dx$.</li>
    <li><strong>Reta tangente:</strong> $y - y_0 = f'(x_0)(x - x_0)$.</li>
    <li><strong>Ordem superior:</strong> $f''$, $f'''$, $\dots$ &mdash; derivadas da derivada.</li>
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
