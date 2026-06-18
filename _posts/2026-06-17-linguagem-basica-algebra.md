---
layout: post
image: /assets/images/algebra1.avif
title: "Monômios, polinômios e coeficientes: entendendo a linguagem da álgebra"
categories: [MATEMATICA, ALGEBRA, EDUCACAO]
lang: pt
tags: [Álgebra]
ref: monomios-polinomios-coeficientes
author: dante-bertuzzi
description: "Entenda a linguagem básica da álgebra: variáveis, coeficientes, monômios, polinômios, grau, termo independente, polinômio mônico, completo, incompleto, reduzido e outras classificações."
mathjax: true
---

<figure style="display: flex; flex-direction: column; align-items: center; margin: 2.5em 0 2em 0;">
  <img src="/assets/images/algebra1.avif" alt="Expressões algébricas com variáveis, coeficientes e polinômios" style="max-width: 80%; height: auto; border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.07);" />
  <figcaption class="img-caption-contrast">
    <strong>Figura:</strong> A álgebra possui uma linguagem própria: variáveis, coeficientes, monômios, polinômios, graus e termos.
  </figcaption>
</figure>

<div style="border-left: 4px solid #f44336; padding: 1em; background-color: #ffebee; margin: 1em 0; border-radius: 4px;">
  <h4 style="margin-top: 0;">Pergunta</h4>
  <p>Antes de resolver equações, fatorar expressões ou estudar funções, será que entendemos a linguagem usada pela álgebra?</p>
</div>

---

## Por que estudar a linguagem da álgebra?

Muitas pessoas dizem que álgebra é apenas “matemática com letras”.

Mas essa definição é incompleta.

A álgebra usa letras, números e operações para representar relações gerais. Em vez de estudar apenas casos particulares, ela permite escrever padrões, fórmulas, identidades e equações de forma mais ampla.

Por exemplo, na aritmética podemos calcular:

$$
3\cdot 5 + 2 = 17.
$$

Na álgebra, podemos escrever:

$$
3x + 2.
$$

Agora, o valor depende de $x$.

Se:

$$
x=5,
$$

temos:

$$
3x+2=3\cdot 5+2=17.
$$

Mas se:

$$
x=10,
$$

então:

$$
3x+2=3\cdot 10+2=32.
$$

A mesma expressão representa muitos valores possíveis.

<div style="border-left: 4px solid #17324d; padding: 0.75em 1em; background-color: #f0f4f8; margin: 1.2em 0; border-radius: 4px;">
  <strong>Ideia central</strong><br>
  A álgebra é uma linguagem matemática usada para representar quantidades variáveis, relações gerais e estruturas que vão além de contas específicas.
</div>

---

## O que é uma expressão algébrica?

Uma <strong>expressão algébrica</strong> é uma combinação de números, letras e operações matemáticas.

Exemplos:

$$
3x+5
$$

$$
2a^2-4a+7
$$

$$
5xy-3x^2
$$

Nessas expressões, aparecem letras como $x$, $a$ e $y$. Essas letras representam valores que podem variar ou valores desconhecidos.

Por isso, elas são chamadas de <strong>variáveis</strong>.

---

## Variável, coeficiente e constante

Vamos observar a expressão:

$$
4x+7.
$$

Ela possui duas partes principais:

| Parte | Nome | Significado |
|---|---|---|
| $x$ | variável | valor que pode mudar |
| $4$ | coeficiente | número que multiplica a variável |
| $7$ | constante | número sem variável |

Na expressão:

$$
-5a^2+3a-9,
$$

temos:

| Termo | Coeficiente | Parte literal |
|---|---:|---|
| $-5a^2$ | $-5$ | $a^2$ |
| $3a$ | $3$ | $a$ |
| $-9$ | $-9$ | não possui |

A <strong>parte literal</strong> é a parte formada pelas letras e seus expoentes.

Por exemplo, no termo:

$$
8x^2y^3,
$$

o coeficiente é:

$$
8,
$$

e a parte literal é:

$$
x^2y^3.
$$

---

## O que é um monômio?

Um <strong>monômio</strong> é uma expressão algébrica formada por apenas um termo.

Exemplos:

$$
7x
$$

$$
-3a^2
$$

$$
5xy
$$

$$
\frac{2}{3}x^4y
$$

De forma geral, podemos pensar em um monômio como:

$$
\boxed{
\text{monômio}
=
\text{coeficiente}
\cdot
\text{parte literal}
}
$$

Por exemplo:

$$
9x^2y.
$$

Aqui:

| Elemento | Valor |
|---|---|
| Coeficiente | $9$ |
| Parte literal | $x^2y$ |
| Variáveis | $x$ e $y$ |

---

## Grau de um monômio

O <strong>grau de um monômio</strong> é dado pela soma dos expoentes de suas variáveis.

Por exemplo:

$$
5x^3
$$

tem grau:

$$
3.
$$

Já:

$$
7x^2y^4
$$

tem grau:

$$
2+4=6.
$$

Portanto, o monômio:

$$
7x^2y^4
$$

é de grau $6$.

<div style="border-left: 4px solid #2196F3; padding: 0.75em 1em; background-color: #e3f2fd; margin: 1em 0; border-radius: 4px;">
  <strong>Atenção</strong><br>
  Quando uma variável aparece sem expoente escrito, o expoente é $1$. Assim, em $3xy^2$, temos $x^1y^2$, e o grau é $1+2=3$.
</div>

---

## O que é um polinômio?

Um <strong>polinômio</strong> é uma soma algébrica de monômios.

Exemplo:

$$
3x^2+2x-7.
$$

Esse polinômio possui três termos:

$$
3x^2,
$$

$$
2x,
$$

e

$$
-7.
$$

Cada termo é um monômio.

Portanto, um polinômio pode ser visto como uma expressão formada por vários monômios somados ou subtraídos.

---

## Classificação pelo número de termos

Uma das formas mais comuns de classificar expressões algébricas é pelo número de termos.

| Nome | Quantidade de termos | Exemplo |
|---|---:|---|
| Monômio | 1 termo | $5x^2$ |
| Binômio | 2 termos | $x+3$ |
| Trinômio | 3 termos | $x^2+5x+6$ |
| Polinômio | 1 ou mais termos | $4x^3-2x^2+x-9$ |

Todo monômio, binômio e trinômio também pode ser chamado de polinômio.

Mas, na prática, usamos nomes diferentes para destacar a quantidade de termos.

---

## Grau de um polinômio

O <strong>grau de um polinômio</strong> é o maior grau entre seus termos.

Considere:

$$
4x^3+2x^2-x+9.
$$

Os graus dos termos são:

| Termo | Grau |
|---|---:|
| $4x^3$ | $3$ |
| $2x^2$ | $2$ |
| $-x$ | $1$ |
| $9$ | $0$ |

O maior grau é $3$.

Logo, o polinômio é de grau $3$.

---

## Classificação pelo grau

Os polinômios também recebem nomes de acordo com seu grau.

| Grau | Nome | Exemplo |
|---:|---|---|
| $0$ | constante | $7$ |
| $1$ | linear | $2x+5$ |
| $2$ | quadrático | $x^2-4x+3$ |
| $3$ | cúbico | $x^3+2x-1$ |
| $4$ | quarto grau | $x^4-5x^2+6$ |
| $5$ | quinto grau | $x^5+x-1$ |

Por exemplo:

$$
x^2-4x+3
$$

é um polinômio quadrático, pois seu grau é $2$.

Já:

$$
x^3+2x^2-x+8
$$

é um polinômio cúbico, pois seu grau é $3$.

---

## Coeficiente principal e termo independente

Em um polinômio, o <strong>coeficiente principal</strong> é o coeficiente do termo de maior grau.

Considere:

$$
5x^4-3x^2+2x-1.
$$

O termo de maior grau é:

$$
5x^4.
$$

Então o coeficiente principal é:

$$
5.
$$

Já o <strong>termo independente</strong> é o termo que não possui variável.

Nesse mesmo polinômio:

$$
5x^4-3x^2+2x-1,
$$

o termo independente é:

$$
-1.
$$

---

## O que é um polinômio mônico?

Um polinômio é chamado de <strong>mônico</strong> quando seu coeficiente principal é igual a $1$.

Exemplo:

$$
x^3+4x^2-2x+7.
$$

O termo de maior grau é:

$$
x^3.
$$

O coeficiente de $x^3$ é $1$.

Logo, esse polinômio é mônico.

Agora observe:

$$
3x^3+4x^2-2x+7.
$$

O coeficiente principal é $3$.

Portanto, esse polinômio não é mônico.

<div style="border-left: 4px solid #17324d; padding: 0.75em 1em; background-color: #f0f4f8; margin: 1.2em 0; border-radius: 4px;">
  <strong>Resumo rápido</strong><br>
  Um polinômio mônico é aquele cujo termo de maior grau tem coeficiente igual a $1$.
</div>

---

## Existem outras classificações além de mônico?

Sim.

A classificação “mônico” observa apenas o coeficiente principal. Mas os polinômios podem ser classificados de várias outras formas.

Eles podem ser classificados:

| Critério | Exemplos de classificação |
|---|---|
| Número de termos | monômio, binômio, trinômio |
| Grau | linear, quadrático, cúbico |
| Coeficiente principal | mônico ou não mônico |
| Presença dos termos | completo ou incompleto |
| Organização | ordenado ou não ordenado |
| Redução | reduzido ou não reduzido |
| Fatoração | redutível ou irredutível |

Vamos observar cada uma dessas classificações.

---

## Polinômio completo e incompleto

Um polinômio é chamado de <strong>completo</strong> quando possui todos os termos desde o maior grau até o termo constante.

Exemplo:

$$
x^3+2x^2-5x+7.
$$

Esse polinômio possui termos de grau:

$$
3,\ 2,\ 1,\ 0.
$$

Logo, ele é completo.

Agora observe:

$$
x^3-5x+7.
$$

Esse polinômio possui termos de grau:

$$
3,\ 1,\ 0.
$$

Falta o termo de grau $2$.

Portanto, ele é incompleto.

Outro exemplo:

$$
x^4+3x^2-1.
$$

Esse polinômio possui termos de grau:

$$
4,\ 2,\ 0.
$$

Faltam os termos de grau $3$ e grau $1$.

---

## Polinômio ordenado e não ordenado

Um polinômio é <strong>ordenado</strong> quando seus termos aparecem em ordem crescente ou decrescente de grau.

Exemplo em ordem decrescente:

$$
5x^4-2x^3+x^2-7x+1.
$$

Os graus aparecem assim:

$$
4,\ 3,\ 2,\ 1,\ 0.
$$

Agora observe:

$$
x^2+5x^4+1-7x.
$$

Os graus aparecem assim:

$$
2,\ 4,\ 0,\ 1.
$$

Logo, esse polinômio não está ordenado.

Podemos ordená-lo assim:

$$
5x^4+x^2-7x+1.
$$

---

## Polinômio reduzido e não reduzido

Um polinômio é <strong>reduzido</strong> quando não possui termos semelhantes para juntar.

Exemplo:

$$
3x^2+2x-5.
$$

Não existem dois termos com a mesma parte literal.

Logo, ele está reduzido.

Agora observe:

$$
3x^2+2x-5+4x^2-x.
$$

Esse polinômio possui termos semelhantes:

$$
3x^2
\quad \text{e} \quad
4x^2,
$$

além de:

$$
2x
\quad \text{e} \quad
-x.
$$

Somando os termos semelhantes:

$$
3x^2+4x^2=7x^2,
$$

e

$$
2x-x=x.
$$

Portanto:

$$
3x^2+2x-5+4x^2-x
=
7x^2+x-5.
$$

A forma reduzida é:

$$
\boxed{
7x^2+x-5
}
$$

---

## Polinômio redutível e irredutível

Essa classificação aparece muito em fatoração.

Um polinômio é <strong>redutível</strong> quando pode ser escrito como produto de polinômios de grau menor.

Exemplo:

$$
x^2-9.
$$

Esse polinômio pode ser fatorado:

$$
x^2-9=(x-3)(x+3).
$$

Logo, ele é redutível.

Agora considere:

$$
x^2+1.
$$

Nos números reais, esse polinômio não pode ser fatorado em fatores lineares reais, pois não possui raízes reais.

Então, sobre os reais, ele é irredutível.

Mas sobre os números complexos:

$$
x^2+1=(x-i)(x+i).
$$

<div style="border-left: 4px solid #f44336; padding: 0.75em 1em; background-color: #ffebee; margin: 1.2em 0; border-radius: 4px;">
  <strong>Observação importante</strong><br>
  Dizer que um polinômio é irredutível depende do conjunto considerado. Um polinômio pode ser irredutível nos reais, mas redutível nos complexos.
</div>

---

## Widget interativo: classificador de polinômios

Use os controles abaixo para alterar:

1. o coeficiente principal;
2. o grau do polinômio;
3. o termo independente;
4. a presença ou ausência de termos intermediários.

O widget monta um polinômio simples e mostra algumas classificações automaticamente.

<div id="poly-widget" style="
  background: transparent;
  border-radius: 12px;
  padding: 28px 20px;
  max-width: 900px;
  margin: 1.5em auto;
  font-family: 'Segoe UI', sans-serif;
  color: #000000;
">

  <div style="text-align:center; font-size: 1.45rem; font-weight: 700; color: #000000; margin-bottom: 8px; letter-spacing: 0.01em;">
    Classificador de Polinômios
  </div>

  <div style="text-align:center; color:#555555; margin-bottom: 24px; font-size:0.95rem;">
    Monte um polinômio e observe como ele pode ser classificado.
  </div>

  <div class="poly-controls">
    <div class="poly-control">
      <label>
        <span>Coeficiente principal</span>
        <strong id="poly-leading-value">1</strong>
      </label>
      <input type="range" id="poly-leading" min="-5" max="5" step="1" value="1">
      <div class="poly-latex-small" id="poly-leading-latex"></div>
    </div>

    <div class="poly-control">
      <label>
        <span>Grau do polinômio</span>
        <strong id="poly-degree-value">3</strong>
      </label>
      <input type="range" id="poly-degree" min="1" max="6" step="1" value="3">
      <div class="poly-latex-small" id="poly-degree-latex"></div>
    </div>

    <div class="poly-control">
      <label>
        <span>Termo independente</span>
        <strong id="poly-constant-value">2</strong>
      </label>
      <input type="range" id="poly-constant" min="-10" max="10" step="1" value="2">
      <div class="poly-latex-small" id="poly-constant-latex"></div>
    </div>

    <div class="poly-control">
      <label>
        <span>Termos intermediários</span>
        <strong id="poly-middle-value">Sim</strong>
      </label>
      <input type="checkbox" id="poly-middle" checked>
      <div class="poly-latex-small" id="poly-middle-latex"></div>
    </div>
  </div>

  <div class="poly-output">
    <div class="poly-output-title">Polinômio gerado</div>
    <div id="poly-expression"></div>
  </div>

  <div class="poly-output">
    <div class="poly-output-title">Classificações</div>
    <div id="poly-classification"></div>
  </div>

  <div class="poly-output poly-note">
    <strong>Como ler:</strong> o coeficiente principal determina se o polinômio é mônico ou não mônico. O grau determina se ele é linear, quadrático, cúbico etc. A presença ou ausência dos termos intermediários indica se ele é completo ou incompleto.
  </div>
</div>

<style>
#poly-widget * {
  box-sizing: border-box;
}

#poly-widget .poly-controls {
  display: grid;
  grid-template-columns: repeat(2, minmax(220px, 1fr));
  gap: 18px;
  margin-bottom: 26px;
}

#poly-widget .poly-control {
  background: rgba(0,0,0,0.04);
  border: 1px solid rgba(23,50,77,0.10);
  border-radius: 10px;
  padding: 14px 16px;
}

#poly-widget .poly-control label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  color: #000000;
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 8px;
}

#poly-widget .poly-control strong {
  color: #17324d;
  font-size: 1rem;
}

#poly-widget input[type="range"] {
  width: 100%;
  accent-color: #17324d;
  cursor: pointer;
}

#poly-widget input[type="checkbox"] {
  transform: scale(1.25);
  accent-color: #17324d;
  cursor: pointer;
  margin-top: 8px;
}

#poly-widget .poly-latex-small {
  margin-top: 8px;
  color: #17324d;
  font-size: 0.95rem;
  min-height: 1.4em;
}

#poly-widget .poly-output {
  margin-top: 18px;
  background: rgba(0,0,0,0.04);
  border-radius: 10px;
  padding: 14px 16px;
  color: #000000;
  line-height: 1.8;
  overflow-x: auto;
}

#poly-widget .poly-output-title {
  font-weight: 700;
  color: #17324d;
  margin-bottom: 6px;
}

#poly-widget .poly-note {
  border-left: 4px solid #17324d;
  background: #f0f4f8;
}

#poly-widget .poly-badge {
  display: inline-block;
  background: #17324d;
  color: #ffffff;
  padding: 5px 10px;
  border-radius: 999px;
  margin: 4px 6px 4px 0;
  font-size: 0.88rem;
  font-weight: 700;
}

#poly-widget .poly-badge-red {
  background: #f44336;
}

@media (max-width: 720px) {
  #poly-widget .poly-controls {
    grid-template-columns: 1fr;
  }
}
</style>

<script>
(function() {
  const leadingSlider = document.getElementById('poly-leading');
  const degreeSlider = document.getElementById('poly-degree');
  const constantSlider = document.getElementById('poly-constant');
  const middleCheck = document.getElementById('poly-middle');

  const leadingValue = document.getElementById('poly-leading-value');
  const degreeValue = document.getElementById('poly-degree-value');
  const constantValue = document.getElementById('poly-constant-value');
  const middleValue = document.getElementById('poly-middle-value');

  const leadingLatex = document.getElementById('poly-leading-latex');
  const degreeLatex = document.getElementById('poly-degree-latex');
  const constantLatex = document.getElementById('poly-constant-latex');
  const middleLatex = document.getElementById('poly-middle-latex');

  const expressionBox = document.getElementById('poly-expression');
  const classificationBox = document.getElementById('poly-classification');

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

  function degreeName(n) {
    if (n === 1) return 'linear';
    if (n === 2) return 'quadrático';
    if (n === 3) return 'cúbico';
    if (n === 4) return 'quarto grau';
    if (n === 5) return 'quinto grau';
    if (n === 6) return 'sexto grau';
    return 'grau ' + n;
  }

  function term(coef, degree, first) {
    if (coef === 0) return '';

    let sign = '';
    if (coef > 0 && !first) sign = '+';
    if (coef < 0) sign = '-';

    const absCoef = Math.abs(coef);

    let coefText = '';
    if (degree === 0) {
      coefText = String(absCoef);
    } else {
      coefText = absCoef === 1 ? '' : String(absCoef);
    }

    let literal = '';
    if (degree === 1) literal = 'x';
    if (degree > 1) literal = 'x^{' + degree + '}';

    return sign + coefText + literal;
  }

  function buildPolynomial(a, n, c, complete) {
    if (a === 0) a = 1;

    const terms = [];
    terms.push(term(a, n, true));

    if (complete) {
      for (let d = n - 1; d >= 1; d--) {
        const coef = d % 2 === 0 ? d : -d;
        terms.push(term(coef, d, false));
      }
    } else {
      if (n > 2) {
        terms.push(term(-2, 1, false));
      }
    }

    if (c !== 0) {
      terms.push(term(c, 0, false));
    }

    return terms.filter(Boolean).join('');
  }

  function update() {
    let a = parseInt(leadingSlider.value, 10);
    const n = parseInt(degreeSlider.value, 10);
    const c = parseInt(constantSlider.value, 10);
    const complete = middleCheck.checked;

    if (a === 0) {
      a = 1;
      leadingSlider.value = 1;
    }

    leadingValue.textContent = a;
    degreeValue.textContent = n;
    constantValue.textContent = c;
    middleValue.textContent = complete ? 'Sim' : 'Não';

    typeset(leadingLatex, 'a_n=' + a, false);
    typeset(degreeLatex, '\\deg(P)=' + n, false);
    typeset(constantLatex, 'a_0=' + c, false);
    typeset(middleLatex, complete ? '\\text{com termos intermediários}' : '\\text{sem todos os termos intermediários}', false);

    const poly = buildPolynomial(a, n, c, complete);
    typeset(expressionBox, 'P(x)=' + poly, true);

    const monic = a === 1 ? 'Mônico' : 'Não mônico';
    const completeText = complete ? 'Completo' : 'Incompleto';
    const ordered = 'Ordenado';
    const reduced = 'Reduzido';
    const degreeText = degreeName(n);

    classificationBox.innerHTML =
      '<span class="poly-badge">' + degreeText + '</span>' +
      '<span class="poly-badge ' + (a === 1 ? '' : 'poly-badge-red') + '">' + monic + '</span>' +
      '<span class="poly-badge">' + completeText + '</span>' +
      '<span class="poly-badge">' + ordered + '</span>' +
      '<span class="poly-badge">' + reduced + '</span>';
  }

  [leadingSlider, degreeSlider, constantSlider, middleCheck].forEach(function(input) {
    input.addEventListener('input', update);
    input.addEventListener('change', update);
  });

  update();
})();
</script>

---

## Exemplos resolvidos

### Exemplo 1: identificar coeficiente, variável e termo independente

Considere:

$$
P(x)=3x^2+5x-8.
$$

Os termos são:

$$
3x^2,\quad 5x,\quad -8.
$$

A variável é:

$$
x.
$$

O coeficiente do termo $3x^2$ é:

$$
3.
$$

O coeficiente do termo $5x$ é:

$$
5.
$$

O termo independente é:

$$
-8.
$$

O grau do polinômio é $2$, pois o maior expoente de $x$ é $2$.

Logo, esse é um polinômio quadrático.

---

### Exemplo 2: verificar se o polinômio é mônico

Considere:

$$
P(x)=x^4-3x^2+2x-1.
$$

O termo de maior grau é:

$$
x^4.
$$

O coeficiente principal é:

$$
1.
$$

Logo, o polinômio é mônico.

Agora considere:

$$
Q(x)=4x^4-3x^2+2x-1.
$$

O termo de maior grau é:

$$
4x^4.
$$

O coeficiente principal é:

$$
4.
$$

Logo, o polinômio não é mônico.

---

### Exemplo 3: polinômio completo ou incompleto

Considere:

$$
P(x)=2x^3+x^2-5x+9.
$$

Ele possui os graus:

$$
3,\ 2,\ 1,\ 0.
$$

Logo, é completo.

Agora considere:

$$
Q(x)=2x^3-5x+9.
$$

Ele possui os graus:

$$
3,\ 1,\ 0.
$$

Falta o termo de grau $2$.

Logo, é incompleto.

---

### Exemplo 4: reduzir um polinômio

Considere:

$$
P(x)=4x^2+3x-5+2x^2-x+7.
$$

Agrupando os termos semelhantes:

$$
4x^2+2x^2=6x^2,
$$

$$
3x-x=2x,
$$

$$
-5+7=2.
$$

Logo:

$$
P(x)=6x^2+2x+2.
$$

A forma reduzida é:

$$
\boxed{
6x^2+2x+2
}
$$

---

## Por que isso importa?

Entender monômios, polinômios e coeficientes é uma base essencial para vários assuntos da matemática.

Essa linguagem aparece em:

| Assunto | Relação com polinômios |
|---|---|
| Equações | Resolver expressões como $x^2-5x+6=0$ |
| Fatoração | Escrever polinômios como produtos |
| Produtos notáveis | Expandir e simplificar expressões |
| Funções | Estudar gráficos de funções polinomiais |
| Cálculo | Derivar e integrar funções polinomiais |
| Álgebra abstrata | Estudar anéis de polinômios |

Por exemplo, a equação:

$$
x^2-5x+6=0
$$

envolve um polinômio quadrático.

Ela pode ser fatorada como:

$$
x^2-5x+6=(x-2)(x-3).
$$

Assim:

$$
(x-2)(x-3)=0.
$$

Logo:

$$
x=2
$$

ou

$$
x=3.
$$

A fatoração só fica clara quando sabemos reconhecer os termos, os coeficientes e o grau do polinômio.

---

## O que guardar deste artigo?

<div style="border-left: 4px solid #2196F3; padding: 0.75em 1em; background-color: #e3f2fd; margin: 1em 0; border-radius: 4px;">
  <strong>Resumo</strong>
  <ul>
    <li>Uma expressão algébrica combina números, letras e operações.</li>
    <li>A variável representa um valor que pode mudar ou ser desconhecido.</li>
    <li>O coeficiente é o número que multiplica a parte literal.</li>
    <li>Um monômio possui apenas um termo.</li>
    <li>Um polinômio é uma soma algébrica de monômios.</li>
    <li>O grau de um polinômio é o maior grau entre seus termos.</li>
    <li>Um polinômio mônico possui coeficiente principal igual a $1$.</li>
    <li>Polinômios também podem ser completos, incompletos, ordenados, reduzidos, redutíveis ou irredutíveis.</li>
  </ul>
</div>

---

## Referências e fontes

1. Iezzi, Gelson. <em>Fundamentos de Matemática Elementar: Álgebra</em>. Atual Editora.
2. Lima, Elon Lages. <em>A Matemática do Ensino Médio</em>. Sociedade Brasileira de Matemática.
3. Lang, Serge. <em>Basic Mathematics</em>. Springer.
4. Herstein, I. N. <em>Topics in Algebra</em>. Wiley.

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