---
layout: post
image: /assets/images/algebra1.avif
title: "Binômio ao Quadrado: a prova geométrica de (a+b)² = a² + 2ab + b²"
categories: [ALGEBRA, MATEMATICA]
lang: pt
tags: [Álgebra]
ref: binomio-quadrado
author: dante-bertuzzi
description: "Entenda geometricamente por que (a+b)² = a² + 2ab + b² usando um gadget interativo com sliders — mova os valores e veja a identidade acontecer em tempo real."
mathjax: true
---

<div style="border-left: 4px solid #f44336; padding: 1em; background-color: #ffebee; margin: 1em 0; border-radius: 4px;">
  <h4 style="margin-top: 0;">Pergunta</h4>
  <p>Por que $(a+b)^2 = a^2 + 2ab + b^2$? Como visualizar essa identidade de forma geométrica e intuitiva?</p>
</div>

---

## A ideia geométrica

Imagine um quadrado de lado $(a + b)$. Sua área total é $(a+b)^2$.

Agora divida esse quadrado em quatro partes usando uma linha horizontal e uma vertical:

- Um quadrado de lado $a$ → área $a^2$
- Um quadrado de lado $b$ → área $b^2$
- **Dois** retângulos de lados $a$ e $b$ → cada um com área $ab$

Somando: $a^2 + ab + ab + b^2 = a^2 + 2ab + b^2$.

Isso é exatamente $(a+b)^2$. &nbsp; $\checkmark$

---

## Gadget interativo

Ajuste os sliders abaixo e veja a identidade acontecer em tempo real:

<div id="binom-gadget" style="
  background: transparent;
  border-radius: 12px;
  padding: 28px 24px;
  max-width: 700px;
  margin: 1.5em auto;
  font-family: 'Segoe UI', sans-serif;
  color: #000000;
">

  <!-- Fórmula principal -->
  <div style="text-align:center; font-size: 1.5rem; font-weight: 700; color: #000000; margin-bottom: 22px; letter-spacing: 0.01em;">
    $(a + b)^2 = a^2 + 2ab + b^2$
  </div>

  <div style="display:flex; flex-wrap:wrap; gap: 24px; align-items:flex-start; justify-content:center;">

    <!-- Coluna esquerda: sliders + cálculo -->
    <div style="flex: 1 1 220px; min-width: 200px;">

      <!-- Slider a -->
      <div style="margin-bottom: 18px;">
        <label style="display:flex; justify-content:space-between; color:#000000; font-size:1rem; font-weight:600; margin-bottom:6px;">
          <span><em>a</em></span>
          <span id="val-a" style="color:#000000;">5.0</span>
        </label>
        <input type="range" id="slider-a" min="1" max="10" step="0.5" value="5"
          style="width:100%; accent-color:#17324d; cursor:pointer;" />
      </div>

      <!-- Slider b -->
      <div style="margin-bottom: 24px;">
        <label style="display:flex; justify-content:space-between; color:#000000; font-size:1rem; font-weight:600; margin-bottom:6px;">
          <span><em>b</em></span>
          <span id="val-b" style="color:#000000;">3.0</span>
        </label>
        <input type="range" id="slider-b" min="1" max="10" step="0.5" value="3"
          style="width:100%; accent-color:#17324d; cursor:pointer;" />
      </div>

      <!-- Cálculo dinâmico -->
      <div style="background:rgba(0,0,0,0.05); border-radius:8px; padding: 14px 16px; font-size:0.93rem; line-height:1.9; color:#000000;">
        <div id="line1" style="color:#000000; font-weight:600;"></div>
        <div id="line2" style="color:#333333;"></div>
      </div>
    </div>

    <!-- Coluna direita: grid geométrico -->
    <div style="flex: 0 0 auto; text-align:center;">
      <canvas id="binom-canvas" width="220" height="220"
        style="border-radius:8px; display:block; margin: 0 auto;"></canvas>
      <div style="font-size:0.8rem; color:#555555; margin-top:6px;">(a + b)</div>
    </div>

  </div>
</div>

<script>
(function() {
  const sliderA = document.getElementById('slider-a');
  const sliderB = document.getElementById('slider-b');
  const valA    = document.getElementById('val-a');
  const valB    = document.getElementById('val-b');
  const line1   = document.getElementById('line1');
  const line2   = document.getElementById('line2');
  const canvas  = document.getElementById('binom-canvas');
  const ctx     = canvas.getContext('2d');

  const SIZE = 220;
  const COLORS = {
    a2:  '#89b4fa',  // azul — quadrado a²
    ab:  '#b4befe',  // lavanda — retângulos ab
    b2:  '#a6e3a1',  // verde — quadrado b²
    text:'#1e1e2e',
    border: '#313244'
  };

  function fmt(n) { return parseFloat(n.toFixed(1)); }

  function draw(a, b) {
    const total = a + b;
    const pad   = 12;
    const avail = SIZE - 2 * pad;
    const pxA   = (a / total) * avail;
    const pxB   = (b / total) * avail;
    const ox    = pad, oy = pad;

    ctx.clearRect(0, 0, SIZE, SIZE);
    ctx.strokeStyle = COLORS.border;
    ctx.lineWidth = 1;

    // a²
    ctx.fillStyle = COLORS.a2;
    ctx.fillRect(ox, oy, pxA, pxA);
    ctx.strokeRect(ox, oy, pxA, pxA);

    // ab (top-right)
    ctx.fillStyle = COLORS.ab;
    ctx.fillRect(ox + pxA, oy, pxB, pxA);
    ctx.strokeRect(ox + pxA, oy, pxB, pxA);

    // ab (bottom-left)
    ctx.fillStyle = COLORS.ab;
    ctx.fillRect(ox, oy + pxA, pxA, pxB);
    ctx.strokeRect(ox, oy + pxA, pxA, pxB);

    // b²
    ctx.fillStyle = COLORS.b2;
    ctx.fillRect(ox + pxA, oy + pxA, pxB, pxB);
    ctx.strokeRect(ox + pxA, oy + pxA, pxB, pxB);

    // Labels
    ctx.font = 'bold 13px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = COLORS.text;

    if (pxA > 28) { ctx.fillText('a²',  ox + pxA/2,        oy + pxA/2); }
    if (pxB > 20 && pxA > 20) { ctx.fillText('ab', ox + pxA + pxB/2, oy + pxA/2); }
    if (pxA > 20 && pxB > 20) { ctx.fillText('ab', ox + pxA/2,       oy + pxA + pxB/2); }
    if (pxB > 28) { ctx.fillText('b²',  ox + pxA + pxB/2,  oy + pxA + pxB/2); }

    // Axis labels
    ctx.font = '11px Segoe UI, sans-serif';
    ctx.fillStyle = '#89b4fa';
    ctx.fillText('a', ox + pxA/2, oy - 6);
    ctx.fillStyle = '#a6e3a1';
    ctx.fillText('b', ox + pxA + pxB/2, oy - 6);
    ctx.fillStyle = '#89b4fa';
    ctx.textAlign = 'right';
    ctx.fillText('a', ox - 4, oy + pxA/2);
    ctx.fillStyle = '#a6e3a1';
    ctx.fillText('b', ox - 4, oy + pxA + pxB/2);
  }

  function update() {
    const a = parseFloat(sliderA.value);
    const b = parseFloat(sliderB.value);

    valA.textContent = fmt(a);
    valB.textContent = fmt(b);

    const sum  = fmt(a + b);
    const a2   = fmt(a * a);
    const ab   = fmt(a * b);
    const b2   = fmt(b * b);
    const tot  = fmt(a2 + 2*ab + b2);

    line1.textContent = `(a+b)² = (${a} + ${b})² = ${sum}² = ${tot}`;
    line2.textContent = `= ${a2} + ${ab} + ${ab} + ${b2}  =  a² + 2ab + b²`;

    draw(a, b);
  }

  sliderA.addEventListener('input', update);
  sliderB.addEventListener('input', update);
  update();
})();
</script>

---

## Prova algébrica

Expandindo diretamente com distributividade:

$$
(a+b)^2 = (a+b)(a+b) = a\cdot a + a\cdot b + b\cdot a + b\cdot b = a^2 + 2ab + b^2.
$$

---

## Casos de uso no Cálculo

A identidade aparece com frequência ao completar quadrados, fatorar e desenvolver binômios:

| Situação | Aplicação |
|---|---|
| Completar quadrado | $x^2 + 6x = (x+3)^2 - 9$ |
| Fatoração | $x^2 + 2x + 1 = (x+1)^2$ |
| Limites notáveis | $\lim_{h\to 0}\frac{(x+h)^2 - x^2}{h} = 2x$ |
| Integrais | $\int (x+1)^2\,dx = \frac{(x+1)^3}{3} + C$ |

---

## Exercício resolvido

<div style="border-left: 4px solid #f44336; padding: 1em; background-color: #ffebee; margin: 1em 0; border-radius: 4px;">
  <h4 style="margin-top: 0;">Questão</h4>
  <p>Sabendo que $a + b = 1$ e $a^2 + b^2 = 2$, calcule $a^3 + b^3$.</p>
</div>

### 1. Primeiro objetivo: descobrir $ab$

Para achar $a^3 + b^3$, vamos precisar saber o valor de $ab$.

A identidade que usamos é o **quadrado da soma**. Vamos demonstrá-la sem pular etapas:

$$
(a+b)^2 = (a+b)(a+b).
$$

Aplicamos a distributiva:

$$
(a+b)(a+b) = a(a+b) + b(a+b).
$$

Distribuindo cada parcela:

$$
a(a+b) = a^2 + ab,
$$

$$
b(a+b) = ba + b^2.
$$

Somando tudo:

$$
(a+b)(a+b) = a^2 + ab + ba + b^2.
$$

Como $ab = ba$, temos $ab + ba = ab + ab = 2ab$. Logo:

$$
(a+b)^2 = a^2 + 2ab + b^2.
$$

Podemos escrever também assim:

$$
(a+b)^2 = a^2 + b^2 + 2ab.
$$

Agora substituímos as informações do problema. Sabemos que $a + b = 1$, então:

$$
(a+b)^2 = 1^2.
$$

Calculando $1^2$:

$$
1^2 = 1 \cdot 1 = 1.
$$

E sabemos que $a^2 + b^2 = 2$. Substituindo na identidade:

$$
1 = 2 + 2ab.
$$

Subtraímos $2$ dos dois lados:

$$
1 - 2 = 2 + 2ab - 2.
$$

No lado direito, $2 - 2 = 0$, então:

$$
-1 = 2ab.
$$

Dividimos os dois lados por $2$:

$$
\frac{-1}{2} = \frac{2ab}{2}.
$$

Como $\dfrac{2ab}{2} = ab$, temos:

$$
ab = -\frac{1}{2}.
$$

---

### 2. Agora queremos $a^3 + b^3$

Vamos usar a identidade:

$$
a^3 + b^3 = (a+b)^3 - 3ab(a+b).
$$

Mas vamos mostrar de onde ela vem, partindo do zero.

Começamos com $(a+b)^3$, que significa:

$$
(a+b)^3 = (a+b)(a+b)(a+b).
$$

Já demonstramos que $(a+b)^2 = a^2 + 2ab + b^2$. Então:

$$
(a+b)^3 = (a+b)\cdot(a^2 + 2ab + b^2).
$$

Aplicamos a distributiva:

$$
(a+b)(a^2 + 2ab + b^2) = a(a^2 + 2ab + b^2) + b(a^2 + 2ab + b^2).
$$

Calculando a primeira parte:

$$
a(a^2 + 2ab + b^2) = a \cdot a^2 + a \cdot 2ab + a \cdot b^2 = a^3 + 2a^2b + ab^2.
$$

Calculando a segunda parte:

$$
b(a^2 + 2ab + b^2) = b \cdot a^2 + b \cdot 2ab + b \cdot b^2 = a^2b + 2ab^2 + b^3.
$$

Somando tudo:

$$
(a+b)^3 = a^3 + 2a^2b + ab^2 + a^2b + 2ab^2 + b^3.
$$

Agrupando os termos semelhantes:

$$
(a+b)^3 = a^3 + b^3 + 2a^2b + a^2b + ab^2 + 2ab^2.
$$

Somando os termos do meio:

$$
2a^2b + a^2b = 3a^2b, \qquad ab^2 + 2ab^2 = 3ab^2.
$$

Então:

$$
(a+b)^3 = a^3 + b^3 + 3a^2b + 3ab^2.
$$

Nos dois últimos termos, colocamos $3ab$ em evidência:

$$
3a^2b + 3ab^2 = 3ab(a + b).
$$

Portanto:

$$
(a+b)^3 = a^3 + b^3 + 3ab(a+b).
$$

Para deixar $a^3 + b^3$ sozinho, subtraímos $3ab(a+b)$ dos dois lados:

$$
(a+b)^3 - 3ab(a+b) = a^3 + b^3 + 3ab(a+b) - 3ab(a+b).
$$

Como $3ab(a+b) - 3ab(a+b) = 0$, fica:

$$
a^3 + b^3 = (a+b)^3 - 3ab(a+b).
$$

---

### 3. Substituindo os valores

Já temos $a + b = 1$ e $ab = -\dfrac{1}{2}$. Substituindo na fórmula:

$$
a^3 + b^3 = (1)^3 - 3\!\left(-\frac{1}{2}\right)(1).
$$

Calculamos $(1)^3$:

$$
1^3 = 1 \cdot 1 \cdot 1 = 1.
$$

Calculamos $-3\!\left(-\dfrac{1}{2}\right)$. Negativo vezes negativo dá positivo:

$$
-3 \cdot \left(-\frac{1}{2}\right) = \frac{3}{2}.
$$

Multiplicando por $(1)$:

$$
\frac{3}{2} \cdot 1 = \frac{3}{2}.
$$

Então:

$$
a^3 + b^3 = 1 + \frac{3}{2}.
$$

Escrevendo $1$ como fração de denominador $2$:

$$
1 = \frac{2}{2}.
$$

Somando as frações:

$$
a^3 + b^3 = \frac{2}{2} + \frac{3}{2} = \frac{2 + 3}{2} = \boxed{\dfrac{5}{2}}.
$$

---

### 4. Conferindo pela ideia de Girard

As **relações de Girard** (também chamadas de relações de Viète) estabelecem que, para um polinômio mônico de grau 2 com raízes $a$ e $b$:

$$
\boxed{a + b = -\frac{p}{1} = s_1, \qquad ab = \frac{q}{1} = s_2}
$$

De forma geral, para o polinômio $x^2 + px + q = 0$ com raízes $a$ e $b$:

$$
\begin{aligned}
a + b &= -p \quad \text{(soma das raízes)},\\
a \cdot b &= q \quad \text{(produto das raízes)}.
\end{aligned}
$$

Isso significa que, conhecendo apenas a **soma** e o **produto** das raízes, conseguimos reconstruir o polinômio — e calcular potências como $a^3 + b^3$ — sem precisar encontrar $a$ e $b$ individualmente.

Como $a$ e $b$ são duas raízes, podemos montar um polinômio de grau 2. Se $a$ e $b$ são raízes de um <abbr title="Polinômio cujo coeficiente do termo de maior grau é igual a 1. Exemplo: x² − 3x + 2 é mônico porque o coeficiente de x² é 1." style="text-decoration: underline dotted #17324d; text-underline-offset: 3px; color: #17324d; font-weight: 600; cursor: help;">polinômio mônico</abbr>, ele tem a forma:

$$
x^2 - (a+b)x + ab = 0.
$$

Substituindo $a + b = 1$ e $ab = -\dfrac{1}{2}$:

$$
x^2 - x - \frac{1}{2} = 0.
$$

Então $a$ e $b$ satisfazem essa equação. Isolando $x^2$:

$$
x^2 = x + \frac{1}{2}.
$$

Multiplicamos os dois lados por $x$:

$$
x \cdot x^2 = x\!\left(x + \frac{1}{2}\right),
$$

$$
x^3 = x^2 + \frac{x}{2}.
$$

Como isso vale para $a$:

$$
a^3 = a^2 + \frac{a}{2}.
$$

E vale para $b$:

$$
b^3 = b^2 + \frac{b}{2}.
$$

Somando as duas equações:

$$
a^3 + b^3 = a^2 + b^2 + \frac{a}{2} + \frac{b}{2}.
$$

Colocando a fração em evidência:

$$
a^3 + b^3 = a^2 + b^2 + \frac{a + b}{2}.
$$

Substituindo $a^2 + b^2 = 2$ e $a + b = 1$:

$$
a^3 + b^3 = 2 + \frac{1}{2} = \frac{4}{2} + \frac{1}{2} = \boxed{\dfrac{5}{2}}.
$$

A resposta se confirma pelos dois métodos.

---

## Produtos notáveis, fatoração e as relações de Girard: a conexão

Os três tópicos formam um ciclo: produtos notáveis **expandem**, fatoração **reverte** essa expansão, e as relações de Girard **explicam por quê** a reversão funciona.

### Produtos notáveis: da forma fatorada para a expandida

Um **produto notável** é uma multiplicação cujo resultado segue um padrão fixo — útil para expandir rapidamente sem distribuir termo a termo:

$$
\begin{aligned}
(a+b)^2 &= a^2 + 2ab + b^2,\\
(a-b)^2 &= a^2 - 2ab + b^2,\\
(a+b)(a-b) &= a^2 - b^2.
\end{aligned}
$$

Em todos os casos, o ponto de partida é a **forma fatorada** $(a+b)$, $(a-b)$… e o resultado é a **forma expandida** (polinômio).

### Fatoração: o caminho inverso

**Fatorar** é o processo oposto — dado um polinômio expandido, encontrar as expressões cujo produto o gera:

$$
x^2 - 5x + 6 \;\longrightarrow\; (x-2)(x-3).
$$

Para quadráticas, a questão se resume a: *"quais dois números têm soma $5$ e produto $6$?"* — e a resposta é $2$ e $3$.

### Relações de Girard: a ponte entre os dois

Aqui entra Girard. Para o polinômio $x^2 + px + q$, as relações garantem:

$$
\text{soma das raízes} = -p, \qquad \text{produto das raízes} = q.
$$

Isso significa que os **coeficientes do polinômio são, literalmente, a soma e o produto das raízes**. Fatorar $x^2 + px + q$ é, portanto, resolver o sistema:

$$
r_1 + r_2 = -p \quad \text{e} \quad r_1 \cdot r_2 = q,
$$

e escrever $(x - r_1)(x - r_2)$ — que, ao ser expandido com o produto notável do quadrado da soma, volta ao polinômio original.

<div style="border-left: 4px solid #17324d; padding: 0.75em 1em; background-color: #f0f4f8; margin: 1.2em 0;">
  <strong>Ciclo completo</strong><br>
  <ol style="margin: 0.5em 0 0 1.2em; padding: 0;">
    <li><strong>Produto notável</strong> expande $(x - r_1)(x - r_2)$ → obtém $x^2 - (r_1+r_2)x + r_1 r_2$.</li>
    <li><strong>Relações de Girard</strong> identificam que $-p = r_1 + r_2$ e $q = r_1 r_2$.</li>
    <li><strong>Fatoração</strong> lê esses coeficientes e reconstrói $(x - r_1)(x - r_2)$.</li>
  </ol>
</div>

No exercício resolvido acima, usamos exatamente esse ciclo ao contrário: partimos dos valores $a + b = 1$ e $ab = -\tfrac{1}{2}$ (as "relações de Girard" do nosso par) para montar o polinômio $x^2 - x - \tfrac{1}{2} = 0$ — e então manipulá-lo para obter $a^3 + b^3$.

---

## Exemplos resolvidos passo a passo

### Produtos notáveis

---

**Exemplo 1 — Quadrado da soma: $(x + 3)^2$**

Aplicamos a identidade $(a + b)^2 = a^2 + 2ab + b^2$ com $a = x$ e $b = 3$:

$$
(x + 3)^2 = x^2 + 2 \cdot x \cdot 3 + 3^2 = x^2 + 6x + 9.
$$

<div id="g1" style="background:transparent;border-radius:12px;padding:20px 18px;max-width:580px;margin:1.2em auto;font-family:'Segoe UI',sans-serif;color:#000;">
  <div style="text-align:center;font-size:1.25rem;font-weight:700;margin-bottom:14px;">$(x + 3)^2 = x^2 + 6x + 9$</div>
  <div style="display:flex;flex-wrap:wrap;gap:18px;align-items:flex-start;justify-content:center;">
    <div style="flex:1 1 190px;min-width:170px;">
      <label style="display:flex;justify-content:space-between;color:#000;font-size:1rem;font-weight:600;margin-bottom:5px;"><span><em>x</em></span><span id="g1-vx">5.0</span></label>
      <input type="range" id="g1-sx" min="1" max="10" step="0.5" value="5" style="width:100%;accent-color:#17324d;cursor:pointer;" />
      <div style="background:rgba(0,0,0,0.05);border-radius:8px;padding:10px 12px;font-size:0.88rem;line-height:2;color:#000;margin-top:14px;">
        <div id="g1-l1" style="font-weight:600;"></div>
        <div id="g1-l2" style="color:#333;"></div>
      </div>
    </div>
    <div style="flex:0 0 auto;text-align:center;">
      <canvas id="g1-c" width="180" height="180" style="border-radius:6px;display:block;margin:0 auto;"></canvas>
      <div style="font-size:0.72rem;color:#555;margin-top:4px;">lado = (x + 3)</div>
    </div>
  </div>
</div>
<script>
(function(){
  var sx=document.getElementById('g1-sx'),vx=document.getElementById('g1-vx');
  var l1=document.getElementById('g1-l1'),l2=document.getElementById('g1-l2');
  var cv=document.getElementById('g1-c'),ctx=cv.getContext('2d');
  var S=180,pad=10,bv=3;
  var C={a2:'#89b4fa',ab:'#b4befe',b2:'#a6e3a1',txt:'#1e1e2e',brd:'#313244'};
  function fmt(n){return parseFloat(n.toFixed(1));}
  function draw(x){
    var total=x+bv,av=S-2*pad,pA=(x/total)*av,pB=(bv/total)*av,ox=pad,oy=pad;
    ctx.clearRect(0,0,S,S); ctx.strokeStyle=C.brd; ctx.lineWidth=1;
    ctx.fillStyle=C.a2; ctx.fillRect(ox,oy,pA,pA); ctx.strokeRect(ox,oy,pA,pA);
    ctx.fillStyle=C.ab; ctx.fillRect(ox+pA,oy,pB,pA); ctx.strokeRect(ox+pA,oy,pB,pA);
    ctx.fillStyle=C.ab; ctx.fillRect(ox,oy+pA,pA,pB); ctx.strokeRect(ox,oy+pA,pA,pB);
    ctx.fillStyle=C.b2; ctx.fillRect(ox+pA,oy+pA,pB,pB); ctx.strokeRect(ox+pA,oy+pA,pB,pB);
    ctx.font='bold 11px Segoe UI,sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillStyle=C.txt;
    if(pA>24)ctx.fillText('x²',ox+pA/2,oy+pA/2);
    if(pB>14&&pA>14){ctx.fillText('3x',ox+pA+pB/2,oy+pA/2);ctx.fillText('3x',ox+pA/2,oy+pA+pB/2);}
    if(pB>16)ctx.fillText('9',ox+pA+pB/2,oy+pA+pB/2);
    ctx.font='10px Segoe UI,sans-serif';
    ctx.fillStyle='#89b4fa'; ctx.textAlign='center'; ctx.fillText('x',ox+pA/2,oy-4);
    ctx.fillStyle='#a6e3a1'; ctx.fillText('3',ox+pA+pB/2,oy-4);
    ctx.textAlign='right'; ctx.fillStyle='#89b4fa'; ctx.fillText('x',ox-3,oy+pA/2);
    ctx.fillStyle='#a6e3a1'; ctx.fillText('3',ox-3,oy+pA+pB/2);
  }
  function update(){
    var x=parseFloat(sx.value); vx.textContent=fmt(x);
    var x2=fmt(x*x),xb=fmt(x*bv),res=fmt(x*x+6*x+9);
    l1.textContent='(x+3)² = ('+x+'+3)² = '+fmt(x+3)+'² = '+res;
    l2.textContent='= '+x2+' + '+xb+' + '+xb+' + 9  =  x² + 6x + 9';
    draw(x);
  }
  sx.addEventListener('input',update); update();
})();
</script>

---

**Exemplo 2 — Quadrado da diferença: $(2x - 5)^2$**

Identidade: $(a - b)^2 = a^2 - 2ab + b^2$ com $a = 2x$ e $b = 5$:

$$
(2x - 5)^2 = (2x)^2 - 2 \cdot 2x \cdot 5 + 5^2 = 4x^2 - 20x + 25.
$$

<div id="g2" style="background:transparent;border-radius:12px;padding:20px 18px;max-width:580px;margin:1.2em auto;font-family:'Segoe UI',sans-serif;color:#000;">
  <div style="text-align:center;font-size:1.25rem;font-weight:700;margin-bottom:14px;">$(2x - 5)^2 = 4x^2 - 20x + 25$</div>
  <div style="display:flex;flex-wrap:wrap;gap:18px;align-items:flex-start;justify-content:center;">
    <div style="flex:1 1 190px;min-width:170px;">
      <label style="display:flex;justify-content:space-between;color:#000;font-size:1rem;font-weight:600;margin-bottom:5px;"><span><em>x</em></span><span id="g2-vx">5.0</span></label>
      <input type="range" id="g2-sx" min="3" max="9" step="0.5" value="5" style="width:100%;accent-color:#17324d;cursor:pointer;" />
      <div style="background:rgba(0,0,0,0.05);border-radius:8px;padding:10px 12px;font-size:0.88rem;line-height:2;color:#000;margin-top:14px;">
        <div id="g2-l1" style="font-weight:600;"></div>
        <div id="g2-l2" style="color:#333;"></div>
        <div id="g2-l3" style="color:#555;font-size:0.8rem;"></div>
      </div>
    </div>
    <div style="flex:0 0 auto;text-align:center;">
      <canvas id="g2-c" width="180" height="180" style="border-radius:6px;display:block;margin:0 auto;"></canvas>
      <div style="font-size:0.72rem;color:#555;margin-top:4px;">quadrado de lado 2x</div>
    </div>
  </div>
</div>
<script>
(function(){
  var sx=document.getElementById('g2-sx'),vx=document.getElementById('g2-vx');
  var l1=document.getElementById('g2-l1'),l2=document.getElementById('g2-l2'),l3=document.getElementById('g2-l3');
  var cv=document.getElementById('g2-c'),ctx=cv.getContext('2d');
  var S=180,pad=10,bv=5;
  var C={res:'#89b4fa',strip:'#b4befe',b2:'#a6e3a1',txt:'#1e1e2e',brd:'#313244'};
  function fmt(n){return parseFloat(n.toFixed(1));}
  function draw(x){
    var a=2*x,rest=a-bv,av=S-2*pad,pR=(rest/a)*av,pB=(bv/a)*av,ox=pad,oy=pad;
    ctx.clearRect(0,0,S,S); ctx.strokeStyle=C.brd; ctx.lineWidth=1;
    ctx.fillStyle=C.res; ctx.fillRect(ox,oy,pR,pR); ctx.strokeRect(ox,oy,pR,pR);
    ctx.fillStyle=C.strip; ctx.fillRect(ox+pR,oy,pB,pR); ctx.strokeRect(ox+pR,oy,pB,pR);
    ctx.fillStyle=C.strip; ctx.fillRect(ox,oy+pR,pR,pB); ctx.strokeRect(ox,oy+pR,pR,pB);
    ctx.fillStyle=C.b2; ctx.fillRect(ox+pR,oy+pR,pB,pB); ctx.strokeRect(ox+pR,oy+pR,pB,pB);
    ctx.font='bold 10px Segoe UI,sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillStyle=C.txt;
    if(pR>34)ctx.fillText('(2x−5)²',ox+pR/2,oy+pR/2);
    if(pB>12&&pR>22){ctx.fillText('5(2x−5)',ox+pR+pB/2,oy+pR/2);ctx.fillText('5(2x−5)',ox+pR/2,oy+pR+pB/2);}
    if(pB>16)ctx.fillText('25',ox+pR+pB/2,oy+pR+pB/2);
    ctx.font='10px Segoe UI,sans-serif';
    ctx.fillStyle='#89b4fa'; ctx.textAlign='center'; ctx.fillText('2x−5',ox+pR/2,oy-4);
    ctx.fillStyle='#a6e3a1'; ctx.fillText('5',ox+pR+pB/2,oy-4);
    ctx.textAlign='right'; ctx.fillStyle='#89b4fa'; ctx.fillText('2x−5',ox-3,oy+pR/2);
    ctx.fillStyle='#a6e3a1'; ctx.fillText('5',ox-3,oy+pR+pB/2);
  }
  function update(){
    var x=parseFloat(sx.value); vx.textContent=fmt(x);
    var a=2*x,rest=a-bv,r2=fmt(rest*rest),strip=fmt(bv*rest),res=fmt(4*x*x-20*x+25);
    l1.textContent='(2x−5)² = ('+fmt(a)+'−5)² = '+fmt(rest)+'² = '+res;
    l2.textContent='= '+r2+' + '+fmt(2*strip)+' + 25  =  4x²−20x+25';
    l3.textContent='(2x)² = '+fmt(a*a)+' = (2x−5)² + 2·5·(2x−5) + 5²';
    draw(x);
  }
  sx.addEventListener('input',update); update();
})();
</script>

---

**Exemplo 3 — Produto da soma pela diferença: $(x + 7)(x - 7)$**

Identidade: $(a + b)(a - b) = a^2 - b^2$ com $a = x$ e $b = 7$:

$$
(x + 7)(x - 7) = x^2 - 7^2 = x^2 - 49.
$$

<div id="g3" style="background:transparent;border-radius:12px;padding:20px 18px;max-width:580px;margin:1.2em auto;font-family:'Segoe UI',sans-serif;color:#000;">
  <div style="text-align:center;font-size:1.25rem;font-weight:700;margin-bottom:14px;">$(x+7)(x-7) = x^2 - 49$</div>
  <div style="display:flex;flex-wrap:wrap;gap:18px;align-items:flex-start;justify-content:center;">
    <div style="flex:1 1 190px;min-width:170px;">
      <label style="display:flex;justify-content:space-between;color:#000;font-size:1rem;font-weight:600;margin-bottom:5px;"><span><em>x</em></span><span id="g3-vx">10.0</span></label>
      <input type="range" id="g3-sx" min="8" max="15" step="0.5" value="10" style="width:100%;accent-color:#17324d;cursor:pointer;" />
      <div style="background:rgba(0,0,0,0.05);border-radius:8px;padding:10px 12px;font-size:0.88rem;line-height:2;color:#000;margin-top:14px;">
        <div id="g3-l1" style="font-weight:600;"></div>
        <div id="g3-l2" style="color:#333;"></div>
        <div id="g3-l3" style="color:#555;font-size:0.8rem;"></div>
      </div>
    </div>
    <div style="flex:0 0 auto;text-align:center;">
      <canvas id="g3-c" width="180" height="180" style="border-radius:6px;display:block;margin:0 auto;"></canvas>
      <div style="font-size:0.72rem;color:#555;margin-top:4px;">quadrado x² menos canto 7² (vermelho)</div>
    </div>
  </div>
</div>
<script>
(function(){
  var sx=document.getElementById('g3-sx'),vx=document.getElementById('g3-vx');
  var l1=document.getElementById('g3-l1'),l2=document.getElementById('g3-l2'),l3=document.getElementById('g3-l3');
  var cv=document.getElementById('g3-c'),ctx=cv.getContext('2d');
  var S=180,pad=10,bv=7;
  function fmt(n){return parseFloat(n.toFixed(1));}
  function draw(x){
    var av=S-2*pad,pX=av,pB=(bv/x)*av,ox=pad,oy=pad;
    ctx.clearRect(0,0,S,S);
    // L-shape top: x × (x-7) → full width, height pX-pB
    ctx.fillStyle='#89b4fa'; ctx.fillRect(ox,oy,pX,pX-pB); ctx.strokeStyle='#313244'; ctx.lineWidth=1; ctx.strokeRect(ox,oy,pX,pX-pB);
    // L-shape bottom-left: (x-7) × 7 → width pX-pB, height pB
    ctx.fillStyle='#b4befe'; ctx.fillRect(ox,oy+pX-pB,pX-pB,pB); ctx.strokeRect(ox,oy+pX-pB,pX-pB,pB);
    // Missing corner: 7×7 → bottom-right
    ctx.fillStyle='#f38ba8'; ctx.fillRect(ox+pX-pB,oy+pX-pB,pB,pB); ctx.strokeRect(ox+pX-pB,oy+pX-pB,pB,pB);
    ctx.beginPath(); ctx.strokeStyle='#cc2222'; ctx.lineWidth=1.5;
    ctx.moveTo(ox+pX-pB,oy+pX-pB); ctx.lineTo(ox+pX,oy+pX);
    ctx.moveTo(ox+pX,oy+pX-pB); ctx.lineTo(ox+pX-pB,oy+pX);
    ctx.stroke(); ctx.lineWidth=1; ctx.strokeStyle='#313244';
    ctx.font='bold 10px Segoe UI,sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillStyle='#1e1e2e';
    if(pX-pB>20)ctx.fillText('x(x−7)',ox+pX/2,oy+(pX-pB)/2);
    if(pX-pB>18&&pB>10)ctx.fillText('7(x−7)',ox+(pX-pB)/2,oy+pX-pB/2);
    ctx.font='10px Segoe UI,sans-serif'; ctx.fillStyle='#cc2222';
    if(pB>16)ctx.fillText('49',ox+pX-pB/2,oy+pX-pB/2);
    ctx.fillStyle='#555'; ctx.textAlign='center'; ctx.font='10px Segoe UI,sans-serif';
    ctx.fillText('x',ox+pX/2,oy-4);
    ctx.textAlign='right'; ctx.fillText('x',ox-3,oy+pX/2);
  }
  function update(){
    var x=parseFloat(sx.value); vx.textContent=fmt(x);
    var x2=fmt(x*x),res=fmt(x*x-49),prod=fmt((x+7)*(x-7));
    l1.textContent='x²−49 = '+x2+'−49 = '+res;
    l2.textContent='(x+7)(x−7) = '+fmt(x+7)+'×'+fmt(x-7)+' = '+prod;
    l3.textContent='L-shape = x(x−7) + 7(x−7) = (x−7)(x+7)';
    draw(x);
  }
  sx.addEventListener('input',update); update();
})();
</script>

---

**Exemplo 4 — Cubo da soma: $(x + 2)^3$**

Expandimos com a identidade $(a + b)^3 = a^3 + 3a^2b + 3ab^2 + b^3$, sendo $a = x$ e $b = 2$:

$$
(x + 2)^3 = x^3 + 3 \cdot x^2 \cdot 2 + 3 \cdot x \cdot 2^2 + 2^3 = x^3 + 6x^2 + 12x + 8.
$$

<div id="g4" style="background:transparent;border-radius:12px;padding:20px 18px;max-width:580px;margin:1.2em auto;font-family:'Segoe UI',sans-serif;color:#000;">
  <div style="text-align:center;font-size:1.25rem;font-weight:700;margin-bottom:14px;">$(x+2)^3 = x^3 + 6x^2 + 12x + 8$</div>
  <label style="display:flex;justify-content:space-between;color:#000;font-size:1rem;font-weight:600;margin-bottom:5px;max-width:320px;"><span><em>x</em></span><span id="g4-vx">4.0</span></label>
  <input type="range" id="g4-sx" min="1" max="8" step="0.5" value="4" style="width:100%;max-width:320px;accent-color:#17324d;cursor:pointer;display:block;" />
  <div style="margin-top:16px;">
    <div id="g4-bar" style="display:flex;height:44px;border-radius:6px;overflow:hidden;width:100%;max-width:520px;"></div>
    <div id="g4-legend" style="display:flex;flex-wrap:wrap;gap:10px;margin-top:10px;font-size:0.83rem;"></div>
  </div>
  <div style="background:rgba(0,0,0,0.05);border-radius:8px;padding:10px 12px;font-size:0.88rem;line-height:2;color:#000;margin-top:14px;max-width:520px;">
    <div id="g4-l1" style="font-weight:600;"></div>
    <div id="g4-l2" style="color:#333;"></div>
  </div>
</div>
<script>
(function(){
  var sx=document.getElementById('g4-sx'),vx=document.getElementById('g4-vx');
  var bar=document.getElementById('g4-bar'),leg=document.getElementById('g4-legend');
  var l1=document.getElementById('g4-l1'),l2=document.getElementById('g4-l2');
  var cols=['#89b4fa','#b4befe','#a6e3a1','#fab387'];
  var lbls=['x³','6x²','12x','8'];
  function fmt(n){return parseFloat(n.toFixed(1));}
  function update(){
    var x=parseFloat(sx.value); vx.textContent=fmt(x);
    var t1=Math.pow(x,3),t2=6*x*x,t3=12*x,t4=8,tot=t1+t2+t3+t4;
    var vals=[t1,t2,t3,t4];
    bar.innerHTML='';
    vals.forEach(function(v,i){
      var pct=(v/tot)*100;
      var d=document.createElement('div');
      d.style.cssText='width:'+pct+'%;background:'+cols[i]+';display:flex;align-items:center;justify-content:center;font-size:0.78rem;font-weight:700;color:#1e1e2e;overflow:hidden;';
      d.textContent=pct>6?fmt(v):'';
      bar.appendChild(d);
    });
    leg.innerHTML='';
    var names=['x³ = '+fmt(t1),'6x² = '+fmt(t2),'12x = '+fmt(t3),'8'];
    names.forEach(function(n,i){
      var d=document.createElement('div');
      d.style.cssText='display:flex;align-items:center;gap:5px;';
      d.innerHTML='<span style="display:inline-block;width:12px;height:12px;border-radius:2px;background:'+cols[i]+'"></span>'+n;
      leg.appendChild(d);
    });
    l1.textContent='(x+2)³ = ('+x+'+2)³ = '+fmt(x+2)+'³ = '+fmt(tot);
    l2.textContent='= '+fmt(t1)+' + '+fmt(t2)+' + '+fmt(t3)+' + 8';
  }
  sx.addEventListener('input',update); update();
})();
</script>

---

**Exemplo 5 — Expressão composta: $(3x + 1)^2 - (3x - 1)^2$**

Expandimos cada quadrado separadamente:

$$
(3x + 1)^2 = 9x^2 + 6x + 1,
$$

$$
(3x - 1)^2 = 9x^2 - 6x + 1.
$$

Subtraindo:

$$
(3x + 1)^2 - (3x - 1)^2 = (9x^2 + 6x + 1) - (9x^2 - 6x + 1)
$$

$$
= 9x^2 + 6x + 1 - 9x^2 + 6x - 1
$$

$$
= 12x.
$$

<div id="g5" style="background:transparent;border-radius:12px;padding:20px 18px;max-width:580px;margin:1.2em auto;font-family:'Segoe UI',sans-serif;color:#000;">
  <div style="text-align:center;font-size:1.25rem;font-weight:700;margin-bottom:14px;">$(3x+1)^2 - (3x-1)^2 = 12x$</div>
  <label style="display:flex;justify-content:space-between;color:#000;font-size:1rem;font-weight:600;margin-bottom:5px;max-width:320px;"><span><em>x</em></span><span id="g5-vx">3.0</span></label>
  <input type="range" id="g5-sx" min="1" max="8" step="0.5" value="3" style="width:100%;max-width:320px;accent-color:#17324d;cursor:pointer;display:block;" />
  <div style="display:flex;gap:24px;align-items:flex-end;justify-content:center;margin-top:18px;flex-wrap:wrap;">
    <div style="text-align:center;">
      <canvas id="g5-ca" width="100" height="100" style="display:block;margin:0 auto;border-radius:4px;"></canvas>
      <div id="g5-la" style="font-size:0.8rem;color:#333;margin-top:4px;"></div>
    </div>
    <div style="font-size:1.6rem;font-weight:700;color:#17324d;align-self:center;">−</div>
    <div style="text-align:center;">
      <canvas id="g5-cb" width="100" height="100" style="display:block;margin:0 auto;border-radius:4px;"></canvas>
      <div id="g5-lb" style="font-size:0.8rem;color:#333;margin-top:4px;"></div>
    </div>
    <div style="font-size:1.6rem;font-weight:700;color:#17324d;align-self:center;">=</div>
    <div style="text-align:center;align-self:center;">
      <div id="g5-res" style="font-size:1.5rem;font-weight:700;color:#17324d;"></div>
      <div style="font-size:0.78rem;color:#555;">= 12x</div>
    </div>
  </div>
  <div style="background:rgba(0,0,0,0.05);border-radius:8px;padding:10px 12px;font-size:0.88rem;line-height:2;color:#000;margin-top:14px;">
    <div id="g5-l1" style="font-weight:600;"></div>
    <div id="g5-l2" style="color:#333;"></div>
  </div>
</div>
<script>
(function(){
  var sx=document.getElementById('g5-sx'),vx=document.getElementById('g5-vx');
  var ca=document.getElementById('g5-ca'),ctxa=ca.getContext('2d');
  var cb=document.getElementById('g5-cb'),ctxb=cb.getContext('2d');
  var la=document.getElementById('g5-la'),lb=document.getElementById('g5-lb');
  var res=document.getElementById('g5-res'),l1=document.getElementById('g5-l1'),l2=document.getElementById('g5-l2');
  function fmt(n){return parseFloat(n.toFixed(1));}
  function drawSquare(ctx,size,color,label,S){
    var sc=Math.min(size/20,1)*S;
    ctx.clearRect(0,0,S,S);
    var off=(S-sc)/2;
    ctx.fillStyle=color; ctx.fillRect(off,off,sc,sc);
    ctx.strokeStyle='#313244'; ctx.lineWidth=1; ctx.strokeRect(off,off,sc,sc);
    ctx.font='bold 11px Segoe UI,sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillStyle='#1e1e2e';
    if(sc>24)ctx.fillText(label,S/2,S/2);
  }
  function update(){
    var x=parseFloat(sx.value); vx.textContent=fmt(x);
    var sA=3*x+1,sB=3*x-1,aA=sA*sA,aB=sB*sB,diff=aA-aB;
    drawSquare(ctxa,sA,'#89b4fa',fmt(aA),100);
    drawSquare(ctxb,sB,'#b4befe',fmt(aB),100);
    la.textContent='(3x+1)² = '+fmt(aA);
    lb.textContent='(3x−1)² = '+fmt(aB);
    res.textContent=fmt(diff);
    l1.textContent='(3x+1)²−(3x−1)² = '+fmt(aA)+'−'+fmt(aB)+' = '+fmt(diff);
    l2.textContent='12x = 12×'+x+' = '+fmt(12*x);
  }
  sx.addEventListener('input',update); update();
})();
</script>

---

### Fatoração algébrica

---

**Exemplo 6 — Fator comum: $6x^2 + 9x$**

Identificamos o maior fator comum entre os termos. $6x^2 = 3x \cdot 2x$ e $9x = 3x \cdot 3$, então o MDC é $3x$:

$$
6x^2 + 9x = 3x \cdot 2x + 3x \cdot 3 = 3x(2x + 3).
$$

Verificação: $3x \cdot 2x + 3x \cdot 3 = 6x^2 + 9x$. ✓

---

**Exemplo 7 — Trinômio quadrado perfeito: $x^2 + 10x + 25$**

Reconhecemos o padrão $a^2 + 2ab + b^2$ com $a = x$ e $b = 5$ (pois $2ab = 2 \cdot x \cdot 5 = 10x$ e $b^2 = 25$):

$$
x^2 + 10x + 25 = (x + 5)^2.
$$

---

**Exemplo 8 — Diferença de quadrados: $4x^2 - 49$**

Reconhecemos $a^2 - b^2$ com $a = 2x$ (pois $(2x)^2 = 4x^2$) e $b = 7$ (pois $7^2 = 49$):

$$
4x^2 - 49 = (2x + 7)(2x - 7).
$$

---

**Exemplo 9 — Trinômio geral: $x^2 - 7x + 12$**

Procuramos dois números $r_1$ e $r_2$ tais que (relações de Girard):

$$
r_1 + r_2 = 7 \quad \text{e} \quad r_1 \cdot r_2 = 12.
$$

Testamos pares de fatores de $12$:

| Par $(r_1, r_2)$ | Soma | Produto |
|---|---|---|
| $1$ e $12$ | $13$ | $12$ |
| $2$ e $6$ | $8$ | $12$ |
| $3$ e $4$ | $7$ ✓ | $12$ ✓ |

Logo $r_1 = 3$ e $r_2 = 4$, portanto:

$$
x^2 - 7x + 12 = (x - 3)(x - 4).
$$

Verificação: $(x-3)(x-4) = x^2 - 4x - 3x + 12 = x^2 - 7x + 12$. ✓

---

**Exemplo 10 — Trinômio com coeficiente $a \neq 1$: $2x^2 + 7x + 3$**

Como o coeficiente de $x^2$ é $2$, usamos o método do produto $a \cdot c$:

$$
a \cdot c = 2 \cdot 3 = 6.
$$

Precisamos de dois números com soma $7$ (coeficiente de $x$) e produto $6$: são $1$ e $6$.

Reescrevemos o termo do meio:

$$
2x^2 + 7x + 3 = 2x^2 + 1x + 6x + 3.
$$

Agrupamos em dois pares e fatoramos cada um:

$$
= x(2x + 1) + 3(2x + 1).
$$

O fator $(2x + 1)$ aparece em ambos — colocamos em evidência:

$$
= (2x + 1)(x + 3).
$$

Verificação: $(2x+1)(x+3) = 2x^2 + 6x + x + 3 = 2x^2 + 7x + 3$. ✓

---

**Exemplo 11 — Soma de cubos: $x^3 + 8$**

Identidade: $a^3 + b^3 = (a + b)(a^2 - ab + b^2)$ com $a = x$ e $b = 2$ (pois $2^3 = 8$):

$$
x^3 + 8 = x^3 + 2^3 = (x + 2)(x^2 - 2x + 4).
$$

Verificação pela distribuição:

$$
(x + 2)(x^2 - 2x + 4) = x^3 - 2x^2 + 4x + 2x^2 - 4x + 8 = x^3 + 8. \checkmark
$$

---

**Exemplo 12 — Fatoração completa: $3x^3 - 12x$**

**Passo 1:** fator comum.

$$
3x^3 - 12x = 3x(x^2 - 4).
$$

**Passo 2:** $x^2 - 4$ é diferença de quadrados ($a = x$, $b = 2$):

$$
x^2 - 4 = (x + 2)(x - 2).
$$

**Resultado final:**

$$
3x^3 - 12x = 3x(x + 2)(x - 2).
$$

---

## Atenção: erro mais comum

$$
(a + b)^2 \neq a^2 + b^2
$$

O termo $2ab$ é **sempre** necessário. Geometricamente: esquecer os dois retângulos do meio.

---

<div style="border-left: 4px solid #2196F3; padding: 0.5em; background-color: #e3f2fd; margin: 1em 0;">
  <strong>Resumo</strong>
  <ul>
    <li>$(a+b)^2 = a^2 + 2ab + b^2$ — <strong>sempre inclua o $2ab$</strong>.</li>
    <li>Geometricamente: o quadrado de lado $(a+b)$ contém <em>quatro</em> regiões.</li>
    <li>A identidade análoga: $(a-b)^2 = a^2 - 2ab + b^2$.</li>
    <li>Produto notável complementar: $(a+b)(a-b) = a^2 - b^2$.</li>
  </ul>
</div>

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
</style>


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
