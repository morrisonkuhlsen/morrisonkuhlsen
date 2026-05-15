---
layout: post
image: /assets/images/eml.avif
title: "O operador EML: de Euler e logaritmos naturais às operações aritméticas"
categories: [MATEMATICA, COMPUTACAO]
lang: pt
tags: [matemática, funções elementares, eml, euler, logaritmo natural, operações aritméticas]
ref: operador-eml-operacoes-aritmeticas
author: dante-bertuzzi
description: "Entenda a história do número e, do logaritmo natural e do operador EML, definido por $E(x,y)=e^x-ln(y)$. Veja como operações aritméticas básicas podem ser reescritas com blocos EML."
mathjax: true
---

<div style="border-left: 4px solid #f44336; padding: 1em; background-color: #ffebee; margin: 1em 0; border-radius: 4px;">
  <h4 style="margin-top: 0;">Pergunta</h4>
  <p>Será que é possível começar com duas ideias antigas — o número $e$ e o logaritmo natural — e construir, a partir delas, uma espécie de calculadora minimalista capaz de representar operações aritméticas básicas?</p>
</div>

---

## Antes do EML: a história do número $e$

O número $e$ é uma das constantes mais importantes da matemática. Hoje escrevemos:

$$
\boxed{e \approx 2{,}718281828\ldots}
$$

mas ele não nasceu simplesmente como "um número bonito". Historicamente, ele apareceu pouco a pouco em problemas envolvendo **logaritmos**, **áreas**, **juros compostos** e **séries infinitas**.

Uma forma intuitiva de entender o nascimento de $e$ é imaginar um capital inicial de R$ 1,00 aplicado a uma taxa de 100% ao ano.

Se o rendimento é aplicado uma vez no ano, o valor final é:

$$
1+1=2.
$$

Se o rendimento é dividido em duas partes, isto é, 50% em cada semestre, temos:

$$
\left(1+\frac{1}{2}\right)^2
= \left(\frac{3}{2}\right)^2
= \frac{9}{4}
= 2{,}25.
$$

Se dividimos em $n$ partes iguais ao longo do ano, o valor final fica:

$$
\left(1+\frac{1}{n}\right)^n.
$$

Quando $n$ cresce sem parar, chegamos ao limite:

$$
\boxed{e = \lim_{n\to\infty}\left(1+\frac{1}{n}\right)^n}
$$

Esse limite foi estudado por Jacob Bernoulli no contexto dos juros compostos contínuos. Depois, Leonhard Euler popularizou a notação $e$ e mostrou, entre outras formas, que o mesmo número também pode ser escrito pela série:

$$
\boxed{e = 1 + \frac{1}{1!} + \frac{1}{2!} + \frac{1}{3!} + \frac{1}{4!} + \cdots}
$$

---

## Calculando $e$ do início até chegar perto de $2{,}71$

Vamos usar a série de Euler:

$$
e = 1 + \frac{1}{1!} + \frac{1}{2!} + \frac{1}{3!} + \frac{1}{4!} + \frac{1}{5!}+\cdots
$$

Lembre que:

$$
0! = 1, \qquad 1! = 1, \qquad 2! = 2, \qquad 3! = 6, \qquad 4! = 24.
$$

Agora somamos termo por termo.

| Etapa | Soma parcial | Valor aproximado |
|---|---:|---:|
| $1$ | $1$ | $1{,}000000$ |
| $1+\frac{1}{1!}$ | $1+1$ | $2{,}000000$ |
| $1+\frac{1}{1!}+\frac{1}{2!}$ | $2+\frac{1}{2}$ | $2{,}500000$ |
| $+\frac{1}{3!}$ | $2{,}5+\frac{1}{6}$ | $2{,}666667$ |
| $+\frac{1}{4!}$ | $2{,}666667+\frac{1}{24}$ | $2{,}708333$ |
| $+\frac{1}{5!}$ | $2{,}708333+\frac{1}{120}$ | $2{,}716667$ |
| $+\frac{1}{6!}$ | $2{,}716667+\frac{1}{720}$ | $2{,}718056$ |
| $+\frac{1}{7!}$ | $2{,}718056+\frac{1}{5040}$ | $2{,}718254$ |

Então, ainda com poucas parcelas, já chegamos em:

$$
\boxed{e \approx 2{,}71}
$$

E, com mais termos:

$$
\boxed{e \approx 2{,}718281828\ldots}
$$

<div style="border-left: 4px solid #17324d; padding: 0.75em 1em; background-color: #f0f4f8; margin: 1.2em 0; border-radius: 4px;">
  <strong>Interpretação</strong><br>
  O número $e$ aparece naturalmente quando uma quantidade cresce de modo contínuo. Por isso ele está em modelos de crescimento populacional, juros contínuos, decaimento radioativo, equações diferenciais, estatística e probabilidade.
</div>

---

## O que é um logaritmo?

O logaritmo de base $b$ responde à pergunta: a que potência devo elevar $b$ para obter $x$? Escrevemos $\log_b(x) = a$ quando $b^a = x$.

Por exemplo:

$$
\log_2(8) = 3, \qquad \text{pois } 2^3 = 8.
$$

$$
\log_{10}(1000) = 3, \qquad \text{pois } 10^3 = 1000.
$$

---

## O que é o logaritmo natural?

O logaritmo natural é simplesmente o caso especial em que a base é $e$. Escrevemos:

$$
\boxed{\ln(x) = \log_e(x)}
$$

Isso significa que $\ln(x)$ responde à pergunta:

<div style="border-left: 4px solid #f44336; padding: 1em; background-color: #ffebee; margin: 1em 0; border-radius: 4px;">
  <h4 style="margin-top: 0;">Pergunta</h4>
  <p>A que potência devo elevar $e$ para obter $x$?</p>
</div>

Por exemplo:

$$
\ln(e)=1,
$$

porque:

$$
e^1=e.
$$

Também:

$$
\ln(e^3)=3,
$$

porque:

$$
e^3=e^3.
$$

Assim, a exponencial natural e o logaritmo natural são funções inversas:

$$
\boxed{\ln(e^x)=x}
$$

$$
\boxed{e^{\ln(x)}=x, \qquad x>0}
$$

Outra definição muito importante é pela área sob a curva $y=\frac{1}{t}$:

$$
\boxed{\ln(x)=\int_1^x \frac{1}{t}\,dt, \qquad x>0}
$$

Isso quer dizer que $\ln(x)$ mede uma área. Em particular, $e$ é o número que torna essa área igual a $1$:

$$
\int_1^e \frac{1}{t}\,dt = 1.
$$

---

## Por que isso importa para o EML?

Porque o operador EML é feito exatamente das duas peças anteriores:

$$
\boxed{E(x,y)=e^x-\ln(y)}
$$

Ou seja:

- a primeira entrada passa pela exponencial $e^x$;
- a segunda entrada passa pelo logaritmo natural $\ln(y)$;
- depois subtraímos os dois resultados.

Por isso o nome:

$$
\text{EML} = \text{Exp} - \text{Log}.
$$

O artigo <em>All elementary functions from a single operator</em>, de Andrzej Odrzywołek, mostra que esse operador, junto com a constante $1$, consegue reconstruir as funções elementares usuais de uma calculadora científica. A ideia é parecida com o papel da porta NAND na lógica digital: uma peça básica que, repetida muitas vezes, constrói operações mais complexas.

<div style="border-left: 4px solid #17324d; padding: 0.75em 1em; background-color: #f0f4f8; margin: 1.2em 0; border-radius: 4px;">
  <strong>Ideia central do artigo</strong><br>
  Em vez de usar botões separados para $+$, $-$, $\times$, $\div$, $e^x$ e $\ln(x)$, podemos montar árvores de cálculo usando repetidamente o mesmo operador $E(x,y)=e^x-\ln(y)$ e a constante $1$.
</div>

<figure style="text-align:center; margin: 2em auto; max-width: 700px;">
  <img src="/assets/images/eml-phylogenetic-tree.png" alt="Árvore filogenética das funções elementares derivadas do operador EML" style="width:100%; border-radius:8px;" />
  <figcaption style="margin-top:0.75em; font-size:0.88rem; color:#555;">
    <strong>Figura 1</strong> — Árvore "filogenética" de bootstrapping das funções elementares derivadas do EML como LUCA (<em>Last Universal Common Ancestor</em>) e da constante 1. A espiral se desenrola conforme novas primitivas são descobertas; as setas indicam de quais elementos cada função foi composta. As que usam EML e 1 diretamente estão marcadas com setas grossas. Fonte: Odrzywołek (2026), <em>All elementary functions from a single operator</em>, arXiv:2603.21852v2.
  </figcaption>
</figure>

---

## As primeiras peças em EML

Para não escrever árvores gigantes a cada linha, vamos definir alguns blocos auxiliares. Cada bloco abaixo pode ser expandido usando apenas $E$ e a constante $1$.

### 1. A constante $e$

Pela definição:

$$
E(1,1)=e^1-\ln(1).
$$

Como:

$$
\ln(1)=0,
$$

temos:

$$
E(1,1)=e-0=e.
$$

Logo:

$$
\boxed{e = E(1,1)}
$$

---

### 2. A exponencial

Queremos recuperar $e^x$ usando $E$.

Pela definição:

$$
E(x,1)=e^x-\ln(1).
$$

Como $\ln(1)=0$:

$$
E(x,1)=e^x.
$$

Portanto:

$$
\boxed{\operatorname{Exp}_E(x)=E(x,1)=e^x}
$$

---

### 3. O logaritmo natural

O artigo fornece uma forma de recuperar $\ln(x)$ usando apenas o EML:

$$
\boxed{\operatorname{Ln}_E(x)=E\left(1,\,E(E(1,x),1)\right)}
$$

Vamos verificar com calma.

Primeiro:

$$
E(1,x)=e^1-\ln(x)=e-\ln(x).
$$

Depois:

$$
E(E(1,x),1)=e^{E(1,x)}-\ln(1).
$$

Como $\ln(1)=0$:

$$
E(E(1,x),1)=e^{e-\ln(x)}.
$$

Agora usamos a propriedade:

$$
e^{e-\ln(x)}=\frac{e^e}{e^{\ln(x)}}=\frac{e^e}{x}.
$$

Então:

$$
E\left(1,E(E(1,x),1)\right)
= e-\ln\left(\frac{e^e}{x}\right).
$$

Pela propriedade do logaritmo:

$$
\ln\left(\frac{e^e}{x}\right)=\ln(e^e)-\ln(x)=e-\ln(x).
$$

Logo:

$$
E\left(1,E(E(1,x),1)\right)
= e-[e-\ln(x)].
$$

Distribuindo o sinal negativo:

$$
= e-e+\ln(x).
$$

Portanto:

$$
\boxed{\operatorname{Ln}_E(x)=\ln(x)}
$$

---

## Gadget interativo: $E(x,y)=e^x-\ln(y)$

Ajuste os valores abaixo e veja três coisas acontecendo ao mesmo tempo:

1. o valor direto de $E(x,y)$;
2. como recuperar $e^x$ usando $E(x,1)$;
3. como recuperar $\ln(x)$ usando apenas o EML e a constante $1$.

<div id="eml-gadget" style="
  background: transparent;
  border-radius: 12px;
  padding: 28px 24px;
  max-width: 760px;
  margin: 1.5em auto;
  font-family: 'Segoe UI', sans-serif;
  color: #000000;
">

  <div style="text-align:center; font-size: 1.45rem; font-weight: 700; color: #000000; margin-bottom: 22px; letter-spacing: 0.01em;">
    $E(x,y)=e^x-\ln(y)$
  </div>

  <div style="display:flex; flex-wrap:wrap; gap: 24px; align-items:flex-start; justify-content:center;">

    <div style="flex: 1 1 260px; min-width: 230px;">

      <div style="margin-bottom: 18px;">
        <label style="display:flex; justify-content:space-between; color:#000000; font-size:1rem; font-weight:600; margin-bottom:6px;">
          <span><em>x</em></span>
          <span id="eml-val-x" style="color:#000000;">2.0</span>
        </label>
        <input type="range" id="eml-slider-x" min="0.2" max="5" step="0.1" value="2"
          style="width:100%; accent-color:#17324d; cursor:pointer;" />
        <div id="eml-latex-x" style="margin-top:8px; color:#17324d; font-size:1rem;"></div>
      </div>

      <div style="margin-bottom: 24px;">
        <label style="display:flex; justify-content:space-between; color:#000000; font-size:1rem; font-weight:600; margin-bottom:6px;">
          <span><em>y</em></span>
          <span id="eml-val-y" style="color:#000000;">3.0</span>
        </label>
        <input type="range" id="eml-slider-y" min="0.2" max="5" step="0.1" value="3"
          style="width:100%; accent-color:#17324d; cursor:pointer;" />
        <div id="eml-latex-y" style="margin-top:8px; color:#17324d; font-size:1rem;"></div>
      </div>

      <div style="background:rgba(0,0,0,0.05); border-radius:8px; padding: 14px 16px; font-size:0.9rem; line-height:1.9; color:#000000;">
        <div id="eml-line1" style="color:#000000; font-weight:600;"></div>
        <div id="eml-line2" style="color:#333333;"></div>
        <div id="eml-line3" style="color:#333333;"></div>
      </div>

    </div>

    <div style="flex: 0 0 auto; text-align:center;">
      <canvas id="eml-canvas" width="260" height="220"
        style="border-radius:8px; display:block; margin: 0 auto;"></canvas>
      <div style="font-size:0.8rem; color:#555555; margin-top:6px;">árvore binária do operador EML</div>
    </div>

  </div>
</div>

<script>
(function() {
  const sx = document.getElementById('eml-slider-x');
  const sy = document.getElementById('eml-slider-y');
  const vx = document.getElementById('eml-val-x');
  const vy = document.getElementById('eml-val-y');
  const tx = document.getElementById('eml-latex-x');
  const ty = document.getElementById('eml-latex-y');
  const l1 = document.getElementById('eml-line1');
  const l2 = document.getElementById('eml-line2');
  const l3 = document.getElementById('eml-line3');
  const canvas = document.getElementById('eml-canvas');
  const ctx = canvas.getContext('2d');

  function fmt(n) {
    return Number(n).toFixed(4).replace(/\.?0+$/, '');
  }

  function eml(a,b) {
    return Math.exp(a) - Math.log(b);
  }

  function node(x, y, text, color) {
    ctx.fillStyle = color;
    ctx.strokeStyle = '#313244';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x - 32, y - 18, 64, 36, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#1e1e2e';
    ctx.font = 'bold 12px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
  }

  function drawTree(x, y, result) {
    ctx.clearRect(0,0,260,220);

    ctx.strokeStyle = '#313244';
    ctx.lineWidth = 1.2;

    ctx.beginPath();
    ctx.moveTo(130, 58);
    ctx.lineTo(72, 126);
    ctx.moveTo(130, 58);
    ctx.lineTo(188, 126);
    ctx.stroke();

    node(130, 46, 'EML', '#89b4fa');
    node(72, 138, 'x = ' + fmt(x), '#b4befe');
    node(188, 138, 'y = ' + fmt(y), '#a6e3a1');

    ctx.font = '12px Segoe UI, sans-serif';
    ctx.fillStyle = '#555555';
    ctx.textAlign = 'center';
    ctx.fillText('eˣ − ln(y)', 130, 92);

    ctx.fillStyle = '#17324d';
    ctx.font = 'bold 14px Segoe UI, sans-serif';
    ctx.fillText('resultado = ' + fmt(result), 130, 198);
  }

  function typeset(el, tex) {
    el.innerHTML = '\\(' + tex + '\\)';
    if (window.MathJax && window.MathJax.typesetPromise) {
      if (window.MathJax.typesetClear) window.MathJax.typesetClear([el]);
      window.MathJax.typesetPromise([el]).catch(function(){});
    }
  }

  function update() {
    const x = parseFloat(sx.value);
    const y = parseFloat(sy.value);

    vx.textContent = fmt(x);
    vy.textContent = fmt(y);

    const direct = eml(x,y);
    const expx = eml(x,1);

    const a = eml(1,x);
    const b = eml(a,1);
    const logx = eml(1,b);

    typeset(tx, 'x = ' + fmt(x));
    typeset(ty, 'y = ' + fmt(y));

    typeset(l1, `E(${fmt(x)},\\,${fmt(y)}) = e^{${fmt(x)}} - \\ln(${fmt(y)}) = ${fmt(direct)}`);
    typeset(l2, `E(x,1) = e^x - \\ln(1) = e^x \\approx ${fmt(expx)}`);
    typeset(l3, `E(1,\\,E(E(1,x),1)) = \\ln(x) \\approx ${fmt(logx)}`);

    drawTree(x, y, direct);
  }

  sx.addEventListener('input', update);
  sy.addEventListener('input', update);
  update();
})();
</script>

---

## Operações aritméticas básicas com EML

A partir daqui, vamos usar quatro blocos auxiliares:

$$
\operatorname{Exp}_E(x)=E(x,1),
$$

$$
\operatorname{Ln}_E(x)=E\left(1,E(E(1,x),1)\right),
$$

$$
\operatorname{Sub}_E(x,y)=E\left(\operatorname{Ln}_E(x),\operatorname{Exp}_E(y)\right),
$$

$$
\operatorname{Neg}_E(y)=\operatorname{Sub}_E(\operatorname{Sub}_E(1,y),1).
$$

A operação $\operatorname{Sub}_E$ funciona porque:

$$
\operatorname{Sub}_E(x,y)
=E(\ln x,e^y)
=e^{\ln x}-\ln(e^y)
=x-y.
$$

> Observação: algumas expressões intermediárias podem sair do domínio real positivo do logaritmo. O artigo trabalha naturalmente no domínio complexo, usando o ramo principal do logaritmo quando necessário. Para fins didáticos, vamos simplificar as identidades algebricamente e mostrar o resultado final real.

---

### 1. Adição

Como somar é o mesmo que subtrair o oposto, definimos:

$$
\boxed{\operatorname{Add}_E(x,y)=\operatorname{Sub}_E(x,\operatorname{Neg}_E(y))}
$$

Como:

$$
\operatorname{Neg}_E(y)=-y,
$$

temos:

$$
\operatorname{Add}_E(x,y)=x-(-y)=x+y.
$$

**Exemplo:** calcular $4+3$.

$$
\operatorname{Add}_E(4,3)=\operatorname{Sub}_E(4,\operatorname{Neg}_E(3)).
$$

Como:

$$
\operatorname{Neg}_E(3)=-3,
$$

então:

$$
\operatorname{Add}_E(4,3)=\operatorname{Sub}_E(4,-3).
$$

Como $\operatorname{Sub}_E(x,y)=x-y$:

$$
\operatorname{Sub}_E(4,-3)=4-(-3)=4+3=\boxed{7}.
$$

---

### 2. Subtração

A subtração é direta:

$$
\boxed{\operatorname{Sub}_E(x,y)=E\left(\operatorname{Ln}_E(x),\operatorname{Exp}_E(y)\right)}
$$

Verificação:

$$
\operatorname{Sub}_E(x,y)=E(\ln x,e^y).
$$

Pela definição de $E$:

$$
E(\ln x,e^y)=e^{\ln x}-\ln(e^y).
$$

Como:

$$
e^{\ln x}=x
$$

e

$$
\ln(e^y)=y,
$$

temos:

$$
\operatorname{Sub}_E(x,y)=x-y.
$$

**Exemplo:** calcular $9-4$.

$$
\operatorname{Sub}_E(9,4)=9-4=\boxed{5}.
$$

---

### 3. Multiplicação

Usamos a propriedade dos logaritmos:

$$
\ln(xy)=\ln(x)+\ln(y).
$$

Então:

$$
xy=e^{\ln(x)+\ln(y)}.
$$

Em blocos EML:

$$
\boxed{
\operatorname{Mul}_E(x,y)=
\operatorname{Exp}_E\left(
\operatorname{Add}_E(\operatorname{Ln}_E(x),\operatorname{Ln}_E(y))
\right)
}
$$

**Exemplo:** calcular $6\times 5$.

$$
\operatorname{Mul}_E(6,5)
=\operatorname{Exp}_E(\ln(6)+\ln(5)).
$$

Pela propriedade do logaritmo:

$$
\ln(6)+\ln(5)=\ln(30).
$$

Logo:

$$
\operatorname{Mul}_E(6,5)=e^{\ln(30)}=\boxed{30}.
$$

---

### 4. Divisão

Usamos a propriedade:

$$
\ln\left(\frac{x}{y}\right)=\ln(x)-\ln(y).
$$

Então:

$$
\frac{x}{y}=e^{\ln(x)-\ln(y)}.
$$

Em blocos EML:

$$
\boxed{
\operatorname{Div}_E(x,y)=
\operatorname{Exp}_E\left(
\operatorname{Sub}_E(\operatorname{Ln}_E(x),\operatorname{Ln}_E(y))
\right)
}
$$

**Exemplo:** calcular $20\div 4$.

$$
\operatorname{Div}_E(20,4)
=\operatorname{Exp}_E(\ln(20)-\ln(4)).
$$

Pela propriedade do logaritmo:

$$
\ln(20)-\ln(4)=\ln\left(\frac{20}{4}\right)=\ln(5).
$$

Logo:

$$
\operatorname{Div}_E(20,4)=e^{\ln(5)}=\boxed{5}.
$$

---

## Potência, raiz e quadrado em EML

Também podemos estender a ideia para potência e raiz quadrada. Podemos defini-las com exponencial e logaritmo:

$$
x^a=e^{a\ln(x)}.
$$

Em EML:

$$
\boxed{
\operatorname{Pow}_E(x,a)=
\operatorname{Exp}_E\left(\operatorname{Mul}_E(a,\operatorname{Ln}_E(x))\right)
}
$$

A raiz quadrada é potência de expoente $\frac{1}{2}$:

$$
\boxed{
\sqrt{x}=x^{1/2}
}
$$

Logo:

$$
\boxed{
\operatorname{Sqrt}_E(x)=\operatorname{Pow}_E\left(x,\frac{1}{2}\right)
}
$$

**Exemplo:** calcular $\sqrt{25}$.

$$
\operatorname{Sqrt}_E(25)=\operatorname{Pow}_E\left(25,\frac{1}{2}\right).
$$

Como:

$$
25^{1/2}=5,
$$

temos:

$$
\boxed{\operatorname{Sqrt}_E(25)=5}.
$$

---

## Resumo visual das traduções

| Operação | Forma comum | Forma com blocos EML |
|---|---|---|
| Exponencial | $e^x$ | $\operatorname{Exp}_E(x)=E(x,1)$ |
| Logaritmo natural | $\ln(x)$ | $\operatorname{Ln}_E(x)=E(1,E(E(1,x),1))$ |
| Subtração | $x-y$ | $\operatorname{Sub}_E(x,y)$ |
| Adição | $x+y$ | $\operatorname{Add}_E(x,y)$ |
| Multiplicação | $xy$ | $\operatorname{Mul}_E(x,y)$ |
| Divisão | $x/y$ | $\operatorname{Div}_E(x,y)$ |
| Potência | $x^a$ | $\operatorname{Pow}_E(x,a)$ |
| Raiz quadrada | $\sqrt{x}$ | $\operatorname{Sqrt}_E(x)$ |

---

## Atenção: o EML é elegante, mas não é sempre prático

Do ponto de vista conceitual, o EML é belíssimo porque mostra que muitas funções podem nascer de um único operador.

Mas, na prática, até mesmo uma expressão simples como:

$$
x+y
$$

fica muito maior quando escrita apenas com árvores EML.

Então o valor pedagógico do EML não é substituir toda calculadora comum no dia a dia. O valor está em mostrar que operações aparentemente diferentes podem ter uma estrutura comum por trás.

<div style="border-left: 4px solid #2196F3; padding: 0.75em 1em; background-color: #e3f2fd; margin: 1em 0; border-radius: 4px;">
  <strong>Resumo</strong>
  <ul>
    <li>O número $e$ surge naturalmente em crescimento contínuo e pode ser calculado por limite ou série.</li>
    <li>O logaritmo natural $\ln(x)$ é o inverso da exponencial $e^x$ e também pode ser definido como uma área.</li>
    <li>O operador EML é $E(x,y)=e^x-\ln(y)$.</li>
    <li>Com $E$ e a constante $1$, podemos reconstruir exponencial, logaritmo e, por composição, operações aritméticas.</li>
    <li>Potência e raiz também podem ser descritas com blocos EML, embora as expressões fiquem mais longas.</li>
    <li>O interesse principal do EML é conceitual: mostrar como muita coisa pode nascer de uma única peça básica.</li>
  </ul>
</div>

---

## Referências e fontes

1. Andrzej Odrzywołek. <em>All elementary functions from a single operator</em>. arXiv:2603.21852v2, 2026. Disponível em: <a href="https://arxiv.org/html/2603.21852v2" target="_blank" rel="noopener noreferrer">arxiv.org/html/2603.21852v2</a>.
2. J. J. O'Connor e E. F. Robertson. <em>The number e</em>. MacTutor History of Mathematics, University of St Andrews. Disponível em: <a href="https://mathshistory.st-andrews.ac.uk/HistTopics/e/" target="_blank" rel="noopener noreferrer">MacTutor — The number e</a>.
3. Encyclopaedia Britannica. <em>Natural logarithm</em>. Disponível em: <a href="https://www.britannica.com/science/natural-logarithm" target="_blank" rel="noopener noreferrer">Britannica — Natural logarithm</a>.
4. NIST Digital Library of Mathematical Functions. <em>Chapter 4: Elementary Functions</em>. Disponível em: <a href="https://dlmf.nist.gov/4" target="_blank" rel="noopener noreferrer">DLMF — Elementary Functions</a>.

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
