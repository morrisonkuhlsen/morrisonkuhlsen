/* Expressões algébricas: o passo a passo de tirar parênteses, colchetes e
 * chaves e juntar os termos semelhantes, com o valor de cada linha calculado
 * para os a e b do leitor (as linhas mudam de cara, não de valor), e os
 * cards de regra. Os utilitários vêm de licao.js.
 *
 * O valor de cada passo sai do próprio TeX que aparece na tela (ver
 * `avaliar`), não de uma fórmula escrita à parte: se um passo estiver
 * errado, a página mostra o valor diferente.
 */
(() => {
  const { fmt, tone, paren, math, el, saveParams } = Licao;
  const t = v => Licao.texNum(v);

  // Pinta um trecho: 2 = o que acabou de mudar, 5 = o que trocou de sinal.
  const T = (n, s) => tone(s, n);

  /* ---------------------------------------------------------------- avaliar o TeX */

  // Transforma o TeX dos passos em conta de JavaScript: a cor sai (ela só
  // pinta, não agrupa), colchetes e chaves viram parênteses, \cdot vira *, e
  // a multiplicação implícita (3a, 2[, )( ) ganha o * que falta. Só serve
  // para os textos fixos desta página.
  function avaliar(tex) {
    let js = tex
      .replace(/\\htmlData\{tone=\d\}\{/g, "")
      .replace(/\\\{/g, "(").replace(/\\\}/g, ")")
      .replace(/\}/g, "")
      .replace(/\\cdot/g, "*")
      .replace(/\\[,;!]/g, "")
      .replace(/\[/g, "(").replace(/\]/g, ")")
      .replace(/\s+/g, "");
    js = js.replace(/([\da-z)])(?=[a-z(])/g, "$1*");
    return new Function("a", "b", `return ${js};`);
  }

  /* ---------------------------------------------------------------- exemplos */

  // Os quatro primeiros têm botão; os outros são as respostas dos exercícios,
  // abertos pelo link "Veja passo a passo".
  const EX = {
    colchete: {
      botao: "5a − [2b + (3a − b) − (a − 2b)]",
      passos: [
        { tex: "5a - [\\,2b + (3a - b) - (a - 2b)\\,]", html: "A expressão, como foi escrita. Comece pelo grupo mais de dentro: os parênteses." },
        { tag: "Tire os parênteses", html: "O <strong>+</strong> na frente de (3a − b) deixa os sinais como estão. O <strong>−</strong> na frente de (a − 2b) troca os dois: vira −a + 2b.",
          tex: `5a - [\\,2b + ${T(2, "3a - b")} ${T(5, "- a + 2b")}\\,]` },
        { tag: "Junte os semelhantes", html: "Dentro do colchete, a com a e b com b: 3a − a = 2a e 2b − b + 2b = 3b.",
          tex: `5a - [\\,${T(2, "2a + 3b")}\\,]` },
        { tag: "Tire o colchete", html: "O − na frente do colchete troca o sinal dos dois termos de dentro.",
          tex: `5a ${T(5, "- 2a - 3b")}` },
        { tag: "Junte os semelhantes", html: "5a − 2a = 3a. O −3b não tem outro termo em b para juntar e fica como está.",
          tex: T(1, "3a - 3b") },
      ],
    },
    chaves: {
      botao: "2a − {3b − [a − (b − 2a)]}",
      passos: [
        { tex: "2a - \\{\\,3b - [\\,a - (b - 2a)\\,]\\,\\}", html: "Três camadas: parênteses dentro de colchetes dentro de chaves. Vá de dentro para fora, uma camada por vez." },
        { tag: "Tire os parênteses", html: "O − na frente de (b − 2a) troca os dois sinais: −b + 2a.",
          tex: `2a - \\{\\,3b - [\\,a ${T(5, "- b + 2a")}\\,]\\,\\}` },
        { tag: "Junte os semelhantes", html: "No colchete, a + 2a = 3a.",
          tex: `2a - \\{\\,3b - [\\,${T(2, "3a - b")}\\,]\\,\\}` },
        { tag: "Tire o colchete", html: "O − na frente do colchete troca os dois sinais: −3a + b.",
          tex: `2a - \\{\\,3b ${T(5, "- 3a + b")}\\,\\}` },
        { tag: "Junte os semelhantes", html: "Nas chaves, 3b + b = 4b.",
          tex: `2a - \\{\\,${T(2, "4b - 3a")}\\,\\}` },
        { tag: "Tire as chaves", html: "Mais um − na frente: −4b + 3a.",
          tex: `2a ${T(5, "- 4b + 3a")}` },
        { tag: "Junte os semelhantes", html: "2a + 3a = 5a. É costume escrever o resultado em ordem: primeiro a, depois b.",
          tex: T(1, "5a - 4b") },
      ],
    },
    numero: {
      botao: "3(a − 2b) − 2[a − (b − a)]",
      passos: [
        { tex: "3(a - 2b) - 2[\\,a - (b - a)\\,]", html: "Agora há números multiplicando os grupos. O caminho é o mesmo; só muda que, em vez de um sinal, é um número que se distribui." },
        { tag: "Tire os parênteses de dentro", html: "O − na frente de (b − a) troca os dois: −b + a.",
          tex: `3(a - 2b) - 2[\\,a ${T(5, "- b + a")}\\,]` },
        { tag: "Junte os semelhantes", html: "No colchete, a + a = 2a.",
          tex: `3(a - 2b) - 2[\\,${T(2, "2a - b")}\\,]` },
        { tag: "Distribua", html: "O 3 multiplica cada termo dos parênteses: 3a − 6b. O <strong>−2</strong> multiplica cada termo do colchete, com o sinal junto: −2 · 2a = −4a e −2 · (−b) = +2b.",
          tex: `${T(2, "3a - 6b")} ${T(5, "- 4a + 2b")}` },
        { tag: "Junte os semelhantes", html: "3a − 4a = −a e −6b + 2b = −4b.",
          tex: T(1, "-a - 4b") },
      ],
    },
    some: {
      botao: "7a − [4b − (2a + b) + (a − 3b)]",
      passos: [
        { tex: "7a - [\\,4b - (2a + b) + (a - 3b)\\,]", html: "Este tem uma surpresa no fim. Comece pelos parênteses." },
        { tag: "Tire os parênteses", html: "O − na frente de (2a + b) troca os dois: −2a − b. O + na frente de (a − 3b) não troca nada.",
          tex: `7a - [\\,4b ${T(5, "- 2a - b")} ${T(2, "+ a - 3b")}\\,]` },
        { tag: "Junte os semelhantes", html: "No colchete, −2a + a = −a e 4b − b − 3b = 0: os termos em b se anulam.",
          tex: `7a - [\\,${T(2, "-a")}\\,]` },
        { tag: "Tire o colchete", html: "Menos com menos: −(−a) = +a.",
          tex: `7a ${T(5, "+ a")}` },
        { tag: "Junte os semelhantes", html: "7a + a = 8a. O b sumiu: mexa no slider de b e veja que nenhuma linha muda de valor.",
          tex: T(1, "8a") },
      ],
    },
    ex1: {
      passos: [
        { tex: "4a - [\\,b + (3a - 2b) - (a + b)\\,]", html: "A expressão do exercício 1." },
        { tag: "Tire os parênteses", html: "+(3a − 2b) fica igual; −(a + b) vira −a − b.",
          tex: `4a - [\\,b + ${T(2, "3a - 2b")} ${T(5, "- a - b")}\\,]` },
        { tag: "Junte os semelhantes", html: "3a − a = 2a e b − 2b − b = −2b.",
          tex: `4a - [\\,${T(2, "2a - 2b")}\\,]` },
        { tag: "Tire o colchete", html: "O − troca os dois sinais.",
          tex: `4a ${T(5, "- 2a + 2b")}` },
        { tag: "Junte os semelhantes", html: "4a − 2a = 2a.",
          tex: T(1, "2a + 2b") },
      ],
    },
    ex2: {
      passos: [
        { tex: "6a - \\{\\,2b - [\\,a - (3b - a)\\,]\\,\\}", html: "A expressão do exercício 2." },
        { tag: "Tire os parênteses", html: "−(3b − a) vira −3b + a.",
          tex: `6a - \\{\\,2b - [\\,a ${T(5, "- 3b + a")}\\,]\\,\\}` },
        { tag: "Junte os semelhantes", html: "a + a = 2a.",
          tex: `6a - \\{\\,2b - [\\,${T(2, "2a - 3b")}\\,]\\,\\}` },
        { tag: "Tire o colchete", html: "−[2a − 3b] vira −2a + 3b.",
          tex: `6a - \\{\\,2b ${T(5, "- 2a + 3b")}\\,\\}` },
        { tag: "Junte os semelhantes", html: "2b + 3b = 5b.",
          tex: `6a - \\{\\,${T(2, "5b - 2a")}\\,\\}` },
        { tag: "Tire as chaves", html: "−{5b − 2a} vira −5b + 2a.",
          tex: `6a ${T(5, "- 5b + 2a")}` },
        { tag: "Junte os semelhantes", html: "6a + 2a = 8a.",
          tex: T(1, "8a - 5b") },
      ],
    },
    ex3: {
      passos: [
        { tex: "2(3a - b) - 3[\\,a - (2b - a)\\,]", html: "A expressão do exercício 3." },
        { tag: "Tire os parênteses de dentro", html: "−(2b − a) vira −2b + a.",
          tex: `2(3a - b) - 3[\\,a ${T(5, "- 2b + a")}\\,]` },
        { tag: "Junte os semelhantes", html: "a + a = 2a.",
          tex: `2(3a - b) - 3[\\,${T(2, "2a - 2b")}\\,]` },
        { tag: "Distribua", html: "2 · 3a = 6a e 2 · (−b) = −2b; −3 · 2a = −6a e −3 · (−2b) = +6b.",
          tex: `${T(2, "6a - 2b")} ${T(5, "- 6a + 6b")}` },
        { tag: "Junte os semelhantes", html: "6a − 6a = 0 e −2b + 6b = 4b. Agora é o a que some.",
          tex: T(1, "4b") },
      ],
    },
  };
  for (const ex of Object.values(EX)) ex.passos.forEach(p => (p.f = avaliar(p.tex)));

  /* ---------------------------------------------------------------- passo a passo */

  function initPassos(section) {
    const inA = section.querySelector("input[name=pa]");
    const inB = section.querySelector("input[name=pb]");
    const outA = section.querySelector(".out-pa");
    const outB = section.querySelector(".out-pb");
    const btnBox = section.querySelector(".calc-examples");
    const result = section.querySelector(".calc-result");
    const list = section.querySelector(".calc-steps");
    const note = section.querySelector(".calc-note");
    const q = new URLSearchParams(location.search);
    const clamp = (v, input) => Math.min(Number(input.max), Math.max(Number(input.min), v));
    if (Number.isInteger(Number(q.get("pa"))) && q.has("pa")) inA.value = clamp(Number(q.get("pa")), inA);
    if (Number.isInteger(Number(q.get("pb"))) && q.has("pb")) inB.value = clamp(Number(q.get("pb")), inB);
    let ex = EX[q.get("ex")] ? q.get("ex") : "colchete";

    // Os botões dos exemplos saem da tabela, para o texto ser um só.
    for (const [key, e] of Object.entries(EX)) {
      if (!e.botao) continue;
      const b = el("button", null, e.botao);
      b.type = "button";
      b.dataset.ex = key;
      b.addEventListener("click", () => { ex = key; draw(); });
      btnBox.appendChild(b);
    }

    function draw() {
      const a = Number(inA.value), b = Number(inB.value);
      outA.textContent = fmt(a);
      outB.textContent = fmt(b);
      btnBox.querySelectorAll("[data-ex]").forEach(btn => btn.setAttribute("aria-pressed", btn.dataset.ex === ex));
      const passos = EX[ex].passos;
      const vals = passos.map(p => p.f(a, b));
      const fim = passos[passos.length - 1];

      // Dois blocos inteiros: na tela estreita a linha quebra antes do =, e
      // não no meio de um parêntese.
      const ini = el("span", "res-part"), res = el("span", "res-part");
      math(ini, `\\displaystyle {${passos[0].tex}}`);
      math(res, `\\displaystyle {} = ${fim.tex}`);
      result.replaceChildren(ini, " ", res);
      list.replaceChildren();
      passos.forEach((p, i) => {
        const li = el("li");
        const txt = el("span");
        txt.innerHTML = p.tag ? `<strong>${p.tag}.</strong> ${p.html}` : p.html;
        const m = el("span", "calc-math");
        // Entre chaves o KaTeX não parte a linha; se não couber, a caixa rola.
        math(m, `\\displaystyle {${p.tex}}`);
        const v = el("span", "step-val", `Com a = ${fmt(a)} e b = ${fmt(b)}, vale ${fmt(vals[i])}.`);
        li.append(txt, m, v);
        list.appendChild(li);
      });

      const iguais = vals.every(v => v === vals[0]);
      note.innerHTML = iguais
        ? `<strong>Todas as linhas valem ${fmt(vals[0])}.</strong> Simplificar muda a cara da expressão, não o valor: com quaisquer a e b, a primeira e a última linha dão o mesmo número. Por isso a última é mais útil — para a = ${fmt(a)} e b = ${fmt(b)}, ela é uma conta de uma linha: ${substituir(fim.tex, a, b)}.`
        : "As linhas deram valores diferentes: algum passo está errado.";
      saveParams({ ex, pa: a, pb: b });
    }

    section.addEventListener("input", draw);
    draw();
  }

  // O resultado final com os números no lugar das letras, em texto corrido.
  function substituir(tex, a, b) {
    const s = tex.replace(/\\htmlData\{tone=\d\}\{(.*)\}/, "$1").replace(/\s+/g, "");
    const f = avaliar(tex);
    const p = v => (v < 0 ? `(${fmt(v)})` : fmt(v));
    const conta = s.match(/[+-]?[^+-]+/g).map((term, i) => {
      const [, sinal, coef, letra] = term.match(/^([+-]?)(\d*)([ab])$/);
      const v = letra === "a" ? a : b;
      const sig = i === 0 ? (sinal === "-" ? "−" : "") : sinal === "-" ? " − " : " + ";
      const corpo = coef ? `${coef} · ${p(v)}` : sig ? p(v) : fmt(v);
      return sig + corpo;
    }).join("");
    return `${conta} = ${fmt(f(a, b))}`;
  }

  /* ---------------------------------------------------------------- regras */

  const VARS = {
    a: { min: -9, max: 9, value: 4 },
    b: { min: -9, max: 9, value: -2 },
  };

  const RULES = {
    mais({ a, b }) {
      return {
        lhs: [`+(${t(a)} - ${paren(b)}) = +(${t(a - b)}) = ${t(a - b)}`, a - b],
        rhs: [`${t(a)} - ${paren(b)} = ${t(a - b)}`, a - b],
        note: "Somar um grupo é somar cada termo dele: os parênteses podem sair sem mexer em nada.",
      };
    },
    menos({ a, b }) {
      return {
        lhs: [`-(${t(a)} - ${paren(b)}) = -(${t(a - b)}) = ${t(-(a - b))}`, -(a - b)],
        rhs: [`${paren(-a)} + ${paren(b)} = ${t(-a + b)}`, -a + b],
        note: "O − na frente é um −1 multiplicando o grupo inteiro: cada termo de dentro troca de sinal.",
      };
    },
    distribui({ a, b }) {
      return {
        lhs: [`-2 \\cdot (${t(a)} - ${paren(b)}) = -2 \\cdot ${paren(a - b)} = ${t(-2 * (a - b))}`, -2 * (a - b)],
        rhs: [`-2 \\cdot ${paren(a)} + 2 \\cdot ${paren(b)} = ${t(-2 * a)} + ${paren(2 * b)} = ${t(-2 * a + 2 * b)}`, -2 * a + 2 * b],
        note: "O número de fora multiplica cada termo de dentro, levando o sinal junto: −2 vezes −b dá +2b.",
      };
    },
    junta({ a }) {
      return {
        lhs: [`5 \\cdot ${paren(a)} - 2 \\cdot ${paren(a)} = ${t(5 * a)} - ${paren(2 * a)} = ${t(3 * a)}`, 3 * a],
        rhs: [`3 \\cdot ${paren(a)} = ${t(3 * a)}`, 3 * a],
        note: "Cinco vezes um número menos duas vezes o mesmo número dá três vezes ele. Soma-se o coeficiente; a letra fica.",
      };
    },
    erroMenos({ a, b }) {
      return {
        lhs: [`-(${t(a)} - ${paren(b)}) = ${t(-(a - b))}`, -(a - b)],
        rhs: [`${paren(-a)} - ${paren(b)} = ${t(-a - b)}`, -a - b],
        note: b === 0 ? "Com b = 0 o erro não aparece. Mova b." : "O erro é trocar só o primeiro sinal. O certo: −(a − b) = −a + b.",
      };
    },
    erroJunta({ a, b }) {
      return {
        lhs: [`3 \\cdot ${paren(a)} + 2 \\cdot ${paren(b)} = ${t(3 * a + 2 * b)}`, 3 * a + 2 * b],
        rhs: [`5 \\cdot ${paren(a)} \\cdot ${paren(b)} = ${t(5 * a * b)}`, 5 * a * b],
        note: "3a e 2b não são semelhantes: a e b são números diferentes, e 3a + 2b já está simplificado.",
      };
    },
  };

  Licao.renderTex();
  const passos = document.querySelector("#passos");
  if (passos) initPassos(passos);
  Licao.regras(VARS, RULES);
})();
