---
layout: post
image: /assets/images/triangulo-de-pascal.avif
title: "Triângulo de Pascal: padrões, combinações e identidades algébricas"
categories: [MATEMATICA, PROBABILIDADE, COMPUTACAO]
lang: pt
tags: [triângulo de pascal, coeficientes binomiais, binômio de Newton, combinações, álgebra, probabilidade, matemática interativa]
ref: triangulo-de-pascal
author: dante-bertuzzi
description: "Entenda o Triângulo de Pascal, seus padrões, suas aplicações em álgebra, combinatória e probabilidade, e explore um widget interativo em HTML, CSS e JavaScript com sliders e identidades em LaTeX."
mathjax: true
---

<figure style="display: flex; flex-direction: column; align-items: center; margin: 2.5em 0 2em 0;">
  <img src="/assets/images/triangulo-de-pascal.avif" alt="Triângulo de Pascal com coeficientes binomiais destacados" style="max-width: 80%; height: auto; border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.07);" />
  <figcaption class="img-caption-contrast">
    <strong>Figura:</strong> O Triângulo de Pascal organiza os coeficientes binomiais em linhas, revelando padrões em álgebra, combinatória e probabilidade.
  </figcaption>
</figure>

<div style="border-left: 4px solid #f44336; padding: 1em; background-color: #ffebee; margin: 1em 0; border-radius: 4px;">
  <h4 style="margin-top: 0;">Pergunta</h4>
  <p>Como uma simples tabela de números pode explicar expansões algébricas, contagem de possibilidades, probabilidades, caminhos em grades e até padrões escondidos na matemática?</p>
</div>

---

## O que é o Triângulo de Pascal?

O **Triângulo de Pascal** é uma organização triangular de números em que cada número interno é obtido pela soma dos dois números imediatamente acima dele.

As primeiras linhas são:

$$
\begin{array}{ccccccccc}
&&&&1&&&&\\
&&&1&&1&&&\\
&&1&&2&&1&&\\
&1&&3&&3&&1&\\
1&&4&&6&&4&&1
\end{array}
$$

A regra é simples:

$$
\boxed{\text{número novo}=\text{número acima à esquerda}+\text{número acima à direita}}
$$

Por exemplo, na linha

$$
1,\ 3,\ 3,\ 1,
$$

a próxima linha começa e termina com $1$. Os números internos são:

$$
1+3=4,
$$

$$
3+3=6,
$$

$$
3+1=4.
$$

Logo, a próxima linha é:

$$
1,\ 4,\ 6,\ 4,\ 1.
$$

---

## Por que esse triângulo é importante?

O Triângulo de Pascal é importante porque ele aparece em várias áreas ao mesmo tempo:

| Onde aparece | Ideia principal |
|---|---|
| Álgebra | Coeficientes de expansões como $(a+b)^n$ |
| Combinatória | Quantidade de formas de escolher objetos |
| Probabilidade | Distribuições binomiais e jogos de chance |
| Geometria discreta | Contagem de caminhos em grades |
| Sequências numéricas | Padrões como simetria, potências de 2 e diagonais especiais |

A beleza do triângulo está no fato de que uma regra extremamente simples gera muitos resultados profundos.

<div style="border-left: 4px solid #17324d; padding: 0.75em 1em; background-color: #f0f4f8; margin: 1.2em 0; border-radius: 4px;">
  <strong>Ideia central</strong><br>
  Cada linha do Triângulo de Pascal fornece exatamente os coeficientes da expansão de uma potência do tipo $(a+b)^n$.
</div>

---

## Relação com combinações

A linha $n$ do Triângulo de Pascal contém os números:

$$
\binom{n}{0},\ \binom{n}{1},\ \binom{n}{2},\ \ldots,\ \binom{n}{n}.
$$

Esses números são chamados de **coeficientes binomiais**.

A notação

$$
\binom{n}{k}
$$

lê-se:

> combinação de $n$ elementos tomados $k$ a $k$.

Ela representa quantas formas existem de escolher $k$ elementos dentro de um conjunto com $n$ elementos, sem considerar a ordem.

A fórmula é:

$$
\boxed{
\binom{n}{k}
=
\frac{n!}{k!(n-k)!}
}
$$

Por exemplo:

$$
\binom{4}{2}
=
\frac{4!}{2!(4-2)!}
$$

Como:

$$
4!=24,\qquad 2!=2,\qquad (4-2)!=2!=2,
$$

temos:

$$
\binom{4}{2}
=
\frac{24}{2\cdot 2}
=
\frac{24}{4}
=
6.
$$

Por isso a linha $4$ do Triângulo de Pascal é:

$$
1,\ 4,\ 6,\ 4,\ 1.
$$

---

## Relação com o Binômio de Newton

O Triângulo de Pascal aparece diretamente na expansão de:

$$
(a+b)^n.
$$

A fórmula geral é:

$$
\boxed{
(a+b)^n
=
\sum_{k=0}^{n}
\binom{n}{k}
a^{\,n-k}b^k
}
$$

Essa fórmula é conhecida como **Teorema Binomial** ou **Binômio de Newton**.

Vamos observar algumas potências:

$$
(a+b)^0=1
$$

$$
(a+b)^1=a+b
$$

$$
(a+b)^2=a^2+2ab+b^2
$$

$$
(a+b)^3=a^3+3a^2b+3ab^2+b^3
$$

$$
(a+b)^4=a^4+4a^3b+6a^2b^2+4ab^3+b^4
$$

Veja que os coeficientes são exatamente as linhas do Triângulo de Pascal:

| Potência | Coeficientes |
|---|---|
| $(a+b)^0$ | $1$ |
| $(a+b)^1$ | $1,\ 1$ |
| $(a+b)^2$ | $1,\ 2,\ 1$ |
| $(a+b)^3$ | $1,\ 3,\ 3,\ 1$ |
| $(a+b)^4$ | $1,\ 4,\ 6,\ 4,\ 1$ |

---

## Widget interativo: Triângulo de Pascal

Use os sliders abaixo para controlar:

1. a quantidade de linhas exibidas;
2. a linha destacada;
3. os valores de $a$ e $b$ na expressão $(a+b)^n$.

Ao mudar a linha, a identidade algébrica aparece automaticamente em notação matemática.

<div id="pascal-widget" style="
  background: transparent;
  border-radius: 12px;
  padding: 28px 20px;
  max-width: 900px;
  margin: 1.5em auto;
  font-family: 'Segoe UI', sans-serif;
  color: #000000;
">

  <div style="text-align:center; font-size: 1.45rem; font-weight: 700; color: #000000; margin-bottom: 8px; letter-spacing: 0.01em;">
    Triângulo de Pascal
  </div>

  <div style="text-align:center; color:#555555; margin-bottom: 24px; font-size:0.95rem;">
    Coeficientes binomiais, combinações e identidades algébricas em tempo real.
  </div>

  <div class="pascal-controls">
    <div class="pascal-control">
      <label>
        <span>Linhas exibidas</span>
        <strong id="pascal-total-rows-value">9</strong>
      </label>
      <input type="range" id="pascal-total-rows" min="3" max="13" step="1" value="9">
      <div class="pascal-latex-small" id="pascal-total-rows-latex"></div>
    </div>

    <div class="pascal-control">
      <label>
        <span>Linha destacada: \(n\)</span>
        <strong id="pascal-row-value">4</strong>
      </label>
      <input type="range" id="pascal-row" min="0" max="8" step="1" value="4">
      <div class="pascal-latex-small" id="pascal-row-latex"></div>
    </div>

    <div class="pascal-control">
      <label>
        <span>Valor de \(a\)</span>
        <strong id="pascal-a-value">2</strong>
      </label>
      <input type="range" id="pascal-a" min="-5" max="5" step="1" value="2">
      <div class="pascal-latex-small" id="pascal-a-latex"></div>
    </div>

    <div class="pascal-control">
      <label>
        <span>Valor de \(b\)</span>
        <strong id="pascal-b-value">3</strong>
      </label>
      <input type="range" id="pascal-b" min="-5" max="5" step="1" value="3">
      <div class="pascal-latex-small" id="pascal-b-latex"></div>
    </div>
  </div>

  <div id="pascal-triangle-box">
    <div id="pascal-triangle"></div>
  </div>

  <div class="pascal-output">
    <div class="pascal-output-title">Identidade algébrica da linha escolhida</div>
    <div id="pascal-identity"></div>
  </div>

  <div class="pascal-output">
    <div class="pascal-output-title">Forma geral usando coeficientes binomiais</div>
    <div id="pascal-summation"></div>
  </div>

  <div class="pascal-output">
    <div class="pascal-output-title">Cálculo numérico com os valores escolhidos</div>
    <div id="pascal-numeric"></div>
  </div>

  <div class="pascal-output pascal-note">
    <strong>Como ler:</strong> a linha destacada mostra os coeficientes de \((a+b)^n\). Por exemplo, a linha \(4\), formada por \(1,4,6,4,1\), gera
    \[
      (a+b)^4=a^4+4a^3b+6a^2b^2+4ab^3+b^4.
    \]
  </div>
</div>

<style>
#pascal-widget * {
  box-sizing: border-box;
}

#pascal-widget .pascal-controls {
  display: grid;
  grid-template-columns: repeat(2, minmax(220px, 1fr));
  gap: 18px;
  margin-bottom: 26px;
}

#pascal-widget .pascal-control {
  background: rgba(0,0,0,0.04);
  border: 1px solid rgba(23,50,77,0.10);
  border-radius: 10px;
  padding: 14px 16px;
}

#pascal-widget .pascal-control label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  color: #000000;
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 8px;
}

#pascal-widget .pascal-control strong {
  color: #17324d;
  font-size: 1rem;
}

#pascal-widget input[type="range"] {
  width: 100%;
  accent-color: #17324d;
  cursor: pointer;
}

#pascal-widget .pascal-latex-small {
  margin-top: 8px;
  color: #17324d;
  font-size: 0.95rem;
  min-height: 1.4em;
}

#pascal-triangle-box {
  overflow-x: auto;
  padding: 18px 8px 22px;
  background: linear-gradient(180deg, rgba(23,50,77,0.05), rgba(23,50,77,0.015));
  border-radius: 12px;
  border: 1px solid rgba(23,50,77,0.10);
}

#pascal-triangle {
  min-width: 620px;
}

#pascal-widget .pascal-row {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin: 7px 0;
}

#pascal-widget .pascal-cell {
  min-width: 42px;
  height: 38px;
  padding: 0 8px;
  border-radius: 999px;
  background: #ffffff;
  border: 1px solid rgba(23,50,77,0.20);
  color: #17324d;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 7px rgba(0,0,0,0.06);
  transition: transform 0.18s ease, background-color 0.18s ease, color 0.18s ease, border-color 0.18s ease;
}

#pascal-widget .pascal-row.is-selected .pascal-cell {
  background: #17324d;
  color: #ffffff;
  border-color: #17324d;
  transform: translateY(-1px);
}

#pascal-widget .pascal-cell.is-edge {
  background: #f5f6f7;
}

#pascal-widget .pascal-row.is-selected .pascal-cell.is-edge {
  background: #f44336;
  border-color: #f44336;
  color: #ffffff;
}

#pascal-widget .pascal-output {
  margin-top: 18px;
  background: rgba(0,0,0,0.04);
  border-radius: 10px;
  padding: 14px 16px;
  color: #000000;
  line-height: 1.8;
  overflow-x: auto;
}

#pascal-widget .pascal-output-title {
  font-weight: 700;
  color: #17324d;
  margin-bottom: 6px;
}

#pascal-widget .pascal-note {
  border-left: 4px solid #17324d;
  background: #f0f4f8;
}

@media (max-width: 720px) {
  #pascal-widget .pascal-controls {
    grid-template-columns: 1fr;
  }

  #pascal-triangle {
    min-width: 560px;
  }

  #pascal-widget .pascal-cell {
    min-width: 38px;
    height: 34px;
    font-size: 0.85rem;
  }
}
</style>

<script>
(function() {
  const totalRowsSlider = document.getElementById('pascal-total-rows');
  const rowSlider = document.getElementById('pascal-row');
  const aSlider = document.getElementById('pascal-a');
  const bSlider = document.getElementById('pascal-b');

  const totalRowsValue = document.getElementById('pascal-total-rows-value');
  const rowValue = document.getElementById('pascal-row-value');
  const aValue = document.getElementById('pascal-a-value');
  const bValue = document.getElementById('pascal-b-value');

  const totalRowsLatex = document.getElementById('pascal-total-rows-latex');
  const rowLatex = document.getElementById('pascal-row-latex');
  const aLatex = document.getElementById('pascal-a-latex');
  const bLatex = document.getElementById('pascal-b-latex');

  const triangleBox = document.getElementById('pascal-triangle');
  const identityBox = document.getElementById('pascal-identity');
  const summationBox = document.getElementById('pascal-summation');
  const numericBox = document.getElementById('pascal-numeric');

  function binom(n, k) {
    if (k < 0 || k > n) return 0;
    if (k === 0 || k === n) return 1;
    k = Math.min(k, n - k);
    let value = 1;
    for (let i = 1; i <= k; i++) {
      value = value * (n - k + i) / i;
    }
    return Math.round(value);
  }

  function rowValues(n) {
    const arr = [];
    for (let k = 0; k <= n; k++) {
      arr.push(binom(n, k));
    }
    return arr;
  }

  function powTex(base, power) {
    if (power === 0) return '';
    if (power === 1) return base;
    return base + '^{' + power + '}';
  }

  function termTex(coef, aPow, bPow) {
    const aPart = powTex('a', aPow);
    const bPart = powTex('b', bPow);

    let variablePart = '';
    if (aPart && bPart) variablePart = aPart + bPart;
    else variablePart = aPart || bPart;

    if (!variablePart) return String(coef);
    if (coef === 1) return variablePart;
    return coef + variablePart;
  }

  function expansionTex(n) {
    const terms = [];
    for (let k = 0; k <= n; k++) {
      const coef = binom(n, k);
      const aPow = n - k;
      const bPow = k;
      terms.push(termTex(coef, aPow, bPow));
    }
    return '(a+b)^{' + n + '}=' + terms.join('+');
  }

  function signedNumberTex(x) {
    if (x < 0) return '\\left(' + x + '\\right)';
    return String(x);
  }

  function numericExpansionTex(n, a, b) {
    const symbolicTerms = [];
    const numericTerms = [];

    for (let k = 0; k <= n; k++) {
      const coef = binom(n, k);
      const aPow = n - k;
      const bPow = k;
      const termValue = coef * Math.pow(a, aPow) * Math.pow(b, bPow);

      let symbolic = '';
      if (coef !== 1 || (aPow === 0 && bPow === 0)) symbolic += coef;

      if (aPow > 0) {
        symbolic += '\\cdot ' + signedNumberTex(a);
        if (aPow > 1) symbolic += '^{' + aPow + '}';
      }

      if (bPow > 0) {
        symbolic += '\\cdot ' + signedNumberTex(b);
        if (bPow > 1) symbolic += '^{' + bPow + '}';
      }

      symbolicTerms.push(symbolic.replace(/^\\cdot\s*/, ''));
      numericTerms.push(String(termValue));
    }

    const lhs = '\\left(' + signedNumberTex(a) + '+' + signedNumberTex(b) + '\\right)^{' + n + '}';
    const direct = Math.pow(a + b, n);
    return lhs + '=' + symbolicTerms.join('+') + '=' + numericTerms.join('+') + '=' + direct;
  }

  function typeset(el, tex, display) {
    if (display) {
      el.innerHTML = '\\[' + tex + '\\]';
    } else {
      el.innerHTML = '\\(' + tex + '\\)';
    }

    if (window.MathJax && window.MathJax.typesetPromise) {
      if (window.MathJax.typesetClear) window.MathJax.typesetClear([el]);
      window.MathJax.typesetPromise([el]).catch(function(){});
    }
  }

  function drawTriangle(totalRows, selectedRow) {
    triangleBox.innerHTML = '';

    for (let n = 0; n < totalRows; n++) {
      const row = document.createElement('div');
      row.className = 'pascal-row' + (n === selectedRow ? ' is-selected' : '');

      const values = rowValues(n);
      values.forEach(function(value, k) {
        const cell = document.createElement('span');
        cell.className = 'pascal-cell' + (k === 0 || k === n ? ' is-edge' : '');
        cell.textContent = value;
        row.appendChild(cell);
      });

      triangleBox.appendChild(row);
    }
  }

  function update() {
    const totalRows = parseInt(totalRowsSlider.value, 10);
    let selectedRow = parseInt(rowSlider.value, 10);
    const a = parseInt(aSlider.value, 10);
    const b = parseInt(bSlider.value, 10);

    rowSlider.max = totalRows - 1;
    if (selectedRow > totalRows - 1) {
      selectedRow = totalRows - 1;
      rowSlider.value = selectedRow;
    }

    totalRowsValue.textContent = totalRows;
    rowValue.textContent = selectedRow;
    aValue.textContent = a;
    bValue.textContent = b;

    typeset(totalRowsLatex, '\\text{linhas}= ' + totalRows, false);
    typeset(rowLatex, 'n=' + selectedRow, false);
    typeset(aLatex, 'a=' + a, false);
    typeset(bLatex, 'b=' + b, false);

    drawTriangle(totalRows, selectedRow);

    typeset(identityBox, expansionTex(selectedRow), true);

    typeset(
      summationBox,
      '(a+b)^{' + selectedRow + '}=\\sum_{k=0}^{' + selectedRow + '}\\binom{' + selectedRow + '}{k}a^{' + selectedRow + '-k}b^k',
      true
    );

    typeset(numericBox, numericExpansionTex(selectedRow, a, b), true);
  }

  [totalRowsSlider, rowSlider, aSlider, bSlider].forEach(function(slider) {
    slider.addEventListener('input', update);
  });

  update();
})();
</script>

---

## Como o triângulo constrói as identidades algébricas?

A linha $n$ do Triângulo de Pascal fornece os coeficientes de:

$$
(a+b)^n.
$$

Se escolhemos $n=5$, a linha é:

$$
1,\ 5,\ 10,\ 10,\ 5,\ 1.
$$

Então:

$$
(a+b)^5
=
1a^5
+
5a^4b
+
10a^3b^2
+
10a^2b^3
+
5ab^4
+
1b^5.
$$

Como geralmente não escrevemos o coeficiente $1$, ficamos com:

$$
\boxed{
(a+b)^5
=
a^5
+
5a^4b
+
10a^3b^2
+
10a^2b^3
+
5ab^4
+
b^5
}
$$

A estrutura dos expoentes também segue um padrão:

- o expoente de $a$ começa em $n$ e vai diminuindo até $0$;
- o expoente de $b$ começa em $0$ e vai aumentando até $n$;
- a soma dos expoentes em cada termo sempre dá $n$.

Por exemplo, em:

$$
10a^3b^2,
$$

temos:

$$
3+2=5.
$$

---

## Exemplos resolvidos à mão

### Exemplo 1: expandir $(a+b)^2$

A linha $2$ do Triângulo de Pascal é:

$$
1,\ 2,\ 1.
$$

Logo:

$$
(a+b)^2
=
1a^2+2ab+1b^2.
$$

Como os coeficientes $1$ ficam implícitos:

$$
\boxed{
(a+b)^2=a^2+2ab+b^2
}
$$

Também podemos verificar pela multiplicação direta:

$$
(a+b)^2=(a+b)(a+b).
$$

Distribuindo:

$$
(a+b)(a+b)=a(a+b)+b(a+b).
$$

Agora:

$$
a(a+b)=a^2+ab,
$$

e

$$
b(a+b)=ab+b^2.
$$

Somando:

$$
a^2+ab+ab+b^2.
$$

Como:

$$
ab+ab=2ab,
$$

temos:

$$
\boxed{
(a+b)^2=a^2+2ab+b^2
}
$$

---

### Exemplo 2: expandir $(a+b)^3$

A linha $3$ do Triângulo de Pascal é:

$$
1,\ 3,\ 3,\ 1.
$$

Logo:

$$
(a+b)^3
=
1a^3+3a^2b+3ab^2+1b^3.
$$

Portanto:

$$
\boxed{
(a+b)^3
=
a^3+3a^2b+3ab^2+b^3
}
$$

Agora veja a multiplicação direta:

$$
(a+b)^3=(a+b)(a+b)(a+b).
$$

Já sabemos que:

$$
(a+b)^2=a^2+2ab+b^2.
$$

Então:

$$
(a+b)^3=(a^2+2ab+b^2)(a+b).
$$

Distribuindo termo a termo:

$$
(a^2+2ab+b^2)(a+b)
=
a^2(a+b)+2ab(a+b)+b^2(a+b).
$$

Calculando cada parte:

$$
a^2(a+b)=a^3+a^2b,
$$

$$
2ab(a+b)=2a^2b+2ab^2,
$$

$$
b^2(a+b)=ab^2+b^3.
$$

Somando tudo:

$$
a^3+a^2b+2a^2b+2ab^2+ab^2+b^3.
$$

Agrupando termos semelhantes:

$$
a^3+(a^2b+2a^2b)+(2ab^2+ab^2)+b^3.
$$

Logo:

$$
\boxed{
(a+b)^3=a^3+3a^2b+3ab^2+b^3
}
$$

---

### Exemplo 3: expandir $(x+y)^4$

A linha $4$ do Triângulo de Pascal é:

$$
1,\ 4,\ 6,\ 4,\ 1.
$$

Substituindo $a$ por $x$ e $b$ por $y$:

$$
(x+y)^4
=
1x^4
+
4x^3y
+
6x^2y^2
+
4xy^3
+
1y^4.
$$

Portanto:

$$
\boxed{
(x+y)^4
=
x^4+4x^3y+6x^2y^2+4xy^3+y^4
}
$$

---

## Padrões importantes no Triângulo de Pascal

### 1. As laterais são sempre iguais a $1$

Todo início e todo fim de linha é formado por $1$:

$$
1
$$

$$
1,\ 1
$$

$$
1,\ 2,\ 1
$$

$$
1,\ 3,\ 3,\ 1
$$

Isso acontece porque:

$$
\binom{n}{0}=1
$$

e

$$
\binom{n}{n}=1.
$$

Interpretando: existe apenas uma forma de escolher nenhum elemento e apenas uma forma de escolher todos os elementos.

---

### 2. Cada linha é simétrica

A linha

$$
1,\ 4,\ 6,\ 4,\ 1
$$

é simétrica.

Isso acontece porque:

$$
\boxed{
\binom{n}{k}=\binom{n}{n-k}
}
$$

Por exemplo:

$$
\binom{5}{2}=\binom{5}{3}=10.
$$

Interpretando: escolher $2$ elementos entre $5$ equivale a deixar $3$ elementos de fora.

---

### 3. A soma de cada linha é uma potência de $2$

A soma dos números da linha $n$ é:

$$
\boxed{
2^n
}
$$

Veja:

| Linha | Números | Soma |
|---|---|---|
| $0$ | $1$ | $1=2^0$ |
| $1$ | $1+1$ | $2=2^1$ |
| $2$ | $1+2+1$ | $4=2^2$ |
| $3$ | $1+3+3+1$ | $8=2^3$ |
| $4$ | $1+4+6+4+1$ | $16=2^4$ |

Isso vem da própria fórmula do binômio.

Se colocarmos:

$$
a=1
$$

e

$$
b=1,
$$

temos:

$$
(a+b)^n=(1+1)^n=2^n.
$$

Mas, pelo Teorema Binomial:

$$
(1+1)^n
=
\binom{n}{0}
+
\binom{n}{1}
+
\binom{n}{2}
+
\cdots
+
\binom{n}{n}.
$$

Logo:

$$
\boxed{
\binom{n}{0}
+
\binom{n}{1}
+
\cdots
+
\binom{n}{n}
=
2^n
}
$$

---

### 4. A segunda diagonal forma os números naturais

A diagonal seguinte à lateral é:

$$
1,\ 2,\ 3,\ 4,\ 5,\ 6,\ldots
$$

Isso acontece porque:

$$
\binom{n}{1}=n.
$$

Por exemplo:

$$
\binom{6}{1}=6.
$$

Interpretando: se existem $6$ objetos, há exatamente $6$ formas de escolher apenas $1$ deles.

---

### 5. A terceira diagonal forma os números triangulares

A próxima diagonal é:

$$
1,\ 3,\ 6,\ 10,\ 15,\ 21,\ldots
$$

Esses são chamados de **números triangulares**.

Eles aparecem porque:

$$
\binom{n}{2}
=
\frac{n(n-1)}{2}.
$$

Por exemplo:

$$
\binom{5}{2}
=
\frac{5\cdot 4}{2}
=
10.
$$

---

## Aplicação em probabilidade

O Triângulo de Pascal também aparece em situações com duas possibilidades, como:

- sucesso ou fracasso;
- cara ou coroa;
- sim ou não;
- acontece ou não acontece.

Por exemplo, imagine $3$ lançamentos de uma moeda. As possibilidades são:

$$
CCC,\ CCK,\ CKC,\ KCC,\ CKK,\ KCK,\ KKC,\ KKK.
$$

Aqui, $C$ representa cara e $K$ representa coroa.

A quantidade de resultados com exatamente $0$, $1$, $2$ ou $3$ caras segue a linha $3$ do Triângulo de Pascal:

$$
1,\ 3,\ 3,\ 1.
$$

Ou seja:

| Número de caras | Quantidade de resultados |
|---|---:|
| $0$ caras | $1$ |
| $1$ cara | $3$ |
| $2$ caras | $3$ |
| $3$ caras | $1$ |

Como existem:

$$
2^3=8
$$

resultados possíveis, a probabilidade de sair exatamente $2$ caras é:

$$
P(X=2)
=
\frac{3}{8}.
$$

Esse raciocínio leva à distribuição binomial:

$$
\boxed{
P(X=k)
=
\binom{n}{k}
p^k(1-p)^{n-k}
}
$$

onde:

- $n$ é o número de tentativas;
- $k$ é o número de sucessos;
- $p$ é a probabilidade de sucesso;
- $\binom{n}{k}$ vem do Triângulo de Pascal.

---

## Aplicação em caminhos

Imagine que você só pode andar para a direita ou para baixo em uma grade.

Para chegar a um ponto específico, você precisa escolher em quais momentos dará passos para baixo e em quais momentos dará passos para a direita.

Se o caminho tem $n$ passos e você precisa escolher $k$ passos de um tipo, o número de caminhos é:

$$
\boxed{
\binom{n}{k}
}
$$

Por isso o Triângulo de Pascal também aparece em problemas de rotas, redes, jogos e geometria discreta.

---

## O que guardar deste artigo?

<div style="border-left: 4px solid #2196F3; padding: 0.75em 1em; background-color: #e3f2fd; margin: 1em 0; border-radius: 4px;">
  <strong>Resumo</strong>
  <ul>
    <li>O Triângulo de Pascal é construído somando dois números acima.</li>
    <li>A linha $n$ contém os coeficientes de $(a+b)^n$.</li>
    <li>Cada elemento da linha pode ser escrito como $\binom{n}{k}$.</li>
    <li>Ele aparece em álgebra, combinatória, probabilidade e contagem de caminhos.</li>
    <li>A soma da linha $n$ é $2^n$.</li>
    <li>A simetria vem da identidade $\binom{n}{k}=\binom{n}{n-k}$.</li>
  </ul>
</div>

---

## Referências e fontes

1. Blaise Pascal. <em>Traité du triangle arithmétique</em>, 1654.
2. Ronald L. Graham, Donald E. Knuth e Oren Patashnik. <em>Concrete Mathematics: A Foundation for Computer Science</em>. Addison-Wesley.
3. Richard A. Brualdi. <em>Introductory Combinatorics</em>. Pearson.
4. Sheldon Ross. <em>A First Course in Probability</em>. Pearson.

<style>
table {
  width: 100%;
  border-collapse: collapse;
  margin: 1em 0;
  font-size: 0.95rem;
}
table thead tr {
  background-color: #17324d;
  color: #ffffff;
}
table th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 700;
}
table td {
  padding: 10px 16px;
  color: #17324d;
}
table tbody tr:nth-child(odd)  { background-color: #f5f6f7; }
table tbody tr:nth-child(even) { background-color: #ffffff; }

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
