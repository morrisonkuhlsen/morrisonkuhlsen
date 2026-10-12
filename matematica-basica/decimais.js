/* Números decimais: o quadro de centésimos do início e a conta com vírgula
 * passo a passo — somar e subtrair alinhando a vírgula, multiplicar contando
 * as casas, dividir tirando a vírgula. A grade, os quadros e o clique vêm de
 * conta.js; os utilitários, de licao.js.
 *
 * A vírgula é uma célula própria, na mesma casa da grade que o algarismo das
 * unidades, encostada à direita dele: assim ela aparece, some ou é riscada
 * num passo sem empurrar os algarismos.
 */
(() => {
  const { tone, math, svg } = Licao;

  const pl = (k, um, varios) => `${k} ${k === 1 ? um : varios}`;
  const casasTxt = k => pl(k, "casa decimal", "casas decimais");

  /* ---------------------------------------------------------------- quadro do início */

  function initQuadro(section) {
    const input = section.querySelector("input[name=v]");
    const out = section.querySelector(".out-v");
    const fig = section.querySelector(".dec-figure");
    const eq = section.querySelector(".dec-eq");
    const text = section.querySelector(".intro-text");
    const q = new URLSearchParams(location.search);
    if (q.has("v")) input.value = q.get("v");

    function draw() {
      const c = Number(input.value); // em centésimos
      const I = Math.floor(c / 100), D = Math.floor(c / 10) % 10, C = c % 10;
      const v = (c / 100).toFixed(2).replace(".", ",");
      out.textContent = v;
      const S = 100, G = 14, N = 4;
      const g = svg("svg", { viewBox: `0 0 ${N * S + (N - 1) * G} ${S}`, class: "dec-svg", role: "img",
        "aria-label": `${I} ${I === 1 ? "quadrado inteiro" : "quadrados inteiros"}, ${D} ${D === 1 ? "coluna" : "colunas"} e ${C} ${C === 1 ? "quadradinho" : "quadradinhos"}` });
      for (let s = 0; s < N; s++) {
        const x0 = s * (S + G);
        for (let col = 0; col < 10; col++) {
          for (let row = 0; row < 10; row++) {
            let cls = "dec-cell";
            if (s < I) cls += " is-int";
            else if (s === I && col < D) cls += " is-dec";
            else if (s === I && col === D && row >= 10 - C) cls += " is-cent";
            svg("rect", { x: x0 + col * 10, y: row * 10, width: 10, height: 10, class: cls }, g);
          }
        }
        svg("rect", { x: x0, y: 0, width: S, height: S, class: "dec-edge" }, g);
      }
      fig.replaceChildren(g);

      const terms = [];
      if (I) terms.push(tone(I, 1));
      if (D) terms.push(tone(`\\tfrac{${D}}{10}`, 2));
      if (C) terms.push(tone(`\\tfrac{${C}}{100}`, 3));
      math(eq, `\\displaystyle ${v.replace(",", "{,}")} = ${terms.join(" + ") || "0"}${c % 100 && I + D + C > 1 ? ` = \\frac{${c}}{100}` : ""}`);
      text.innerHTML = `<p>Cada quadrado grande é <strong>1 inteiro</strong>. Dividido em 10 colunas, cada coluna é <strong>1 décimo</strong>; dividido em 100 quadradinhos, cada um é <strong>1 centésimo</strong>.</p>`
        + `<p>${v} são ${pl(I, "inteiro", "inteiros")}, ${pl(D, "décimo", "décimos")} e ${pl(C, "centésimo", "centésimos")}: o primeiro algarismo depois da vírgula conta colunas; o segundo, quadradinhos. ${D || C ? `Ou, de uma vez só, ${c % 100} centésimos além dos inteiros.` : ""}</p>`;
      Licao.saveParams({ v: c });
    }

    section.addEventListener("input", draw);
    draw();
  }

  /* ---------------------------------------------------------------- a conta */

  const KINDS = {
    parcela: { nome: "Parcela", plural: "Parcelas", tone: 2 },
    minuendo: { nome: "Minuendo", tone: 2 },
    subtraendo: { nome: "Subtraendo", tone: 5 },
    fator: { nome: "Fator", plural: "Fatores", tone: 2 },
    fator2: { nome: "Fator", tone: 5 },
    dividendo: { nome: "Dividendo", tone: 2 },
    divisor: { nome: "Divisor", tone: 5 },
    soma: { nome: "Soma", tone: 1 },
    diferenca: { nome: "Diferença", tone: 1 },
    produto: { nome: "Produto", tone: 1 },
    quociente: { nome: "Quociente", tone: 1 },
    virgula: { nome: "Vírgula", tone: 4 },
    zero: { nome: "Zero acrescentado", tone: 3 },
  };

  const OPS = {
    "+": { a: "parcela", b: "parcela", r: "soma", sinal: "+", tex: "+" },
    "-": { a: "minuendo", b: "subtraendo", r: "diferenca", sinal: "−", tex: "-" },
    "*": { a: "fator", b: "fator2", r: "produto", sinal: "×", tex: "\\times" },
    "/": { a: "dividendo", b: "divisor", r: "quociente", sinal: "÷", tex: "\\div" },
  };

  // "12,50" → { i: "12", f: "50" }; o valor em inteiros é i+f com f casas.
  const parse = s => { const [i, f = ""] = s.split(","); return { i: i.replace(/^0+(?=\d)/, ""), f }; };
  const str = d => (d.f ? `${d.i},${d.f}` : d.i);
  // n (inteiro) com k casas: 1250, 2 → { i: "12", f: "50" }.
  const fromInt = (n, k) => {
    const s = String(n).padStart(k + 1, "0");
    return { i: s.slice(0, s.length - k), f: s.slice(s.length - k) };
  };
  const tidy = d => { const f = d.f.replace(/0+$/, ""); return f ? `${d.i},${f}` : d.i; };
  const texDec = s => s.replace(",", "{,}");

  function build(sa, op, sb) {
    const O = OPS[op];
    const A = parse(sa), B = parse(sb);
    const cells = [], frames = [];
    const cell = (row, col, text, kind, group, info, extra = {}) => {
      cells.push({ row, col, text, kind, group, info, ...extra });
      return cells.length - 1;
    };
    const frame = (tag, html, show = [], hl = [], extra = {}) => frames.push({ tag, html, show, hl, ...extra });
    const virgInfo = `A vírgula separa os inteiros (à esquerda) das partes do inteiro (à direita): décimos, centésimos, milésimos…`;

    if (op === "*") return buildMul(A, B, O, { cells, frames, cell, frame, virgInfo });

    // Somar, subtrair e dividir: tudo alinhado pela vírgula. A casa p (0 =
    // unidades, negativa depois da vírgula) vai na coluna 2 + (maxI − 1 − p).
    const F = Math.max(A.f.length, B.f.length);
    const NA = Number(A.i + A.f.padEnd(F, "0")), NB = Number(B.i + B.f.padEnd(F, "0"));
    let R, Rk = F, exata = true;
    if (op === "+") R = NA + NB;
    else if (op === "-") R = NA - NB;
    else {
      // Quociente com até 4 casas: NA/NB é a mesma divisão sem vírgula.
      Rk = 0;
      while (Rk < 4 && (NA * 10 ** Rk) % NB) Rk++;
      exata = (NA * 10 ** Rk) % NB === 0;
      R = Math.floor(NA * 10 ** Rk / NB);
    }
    const RD = fromInt(R, Rk);
    const FF = Math.max(F, Rk);
    const maxI = Math.max(A.i.length, B.i.length, RD.i.length);
    const col = p => 2 + (maxI - 1 - p);
    const W = maxI + FF;

    // Escreve um número na linha row, algarismo por algarismo, e a vírgula.
    function number(row, d, kind, group, info, value, padTo = 0) {
      const ids = [], zeros = [];
      d.i.split("").forEach((x, j) => ids.push(cell(row, col(d.i.length - 1 - j), x, kind, group, info, { val: value })));
      let comma = null;
      if (d.f || padTo) comma = cell(row, col(0), ",", "virgula", `${group}v`, virgInfo, { cls: "ld-virgula" });
      d.f.split("").forEach((x, j) => ids.push(cell(row, col(-1 - j), x, kind, group, info, { val: value })));
      for (let j = d.f.length; j < padTo; j++) {
        zeros.push(cell(row, col(-1 - j), "0", "zero", `${group}z`,
          `Zero acrescentado à direita da parte decimal: ${str(d)} = ${str({ i: d.i, f: d.f.padEnd(padTo, "0") })}. Não muda o valor — são zero décimos, centésimos… a mais — e deixa os dois números com o mesmo número de casas.`, { cls: "is-ghost" }));
      }
      return { ids, zeros, comma, own: d.f ? comma : null, added: d.f ? null : comma };
    }

    const a = number(1, A, O.a, "a", op === "+" ? `Uma das parcelas: ${str(A)}.` : op === "-" ? `O número de que se tira: ${str(A)}.` : `O número que se divide: ${str(A)}.`, str(A), F);
    const b = number(2, B, O.b, "b", op === "+" ? `Uma das parcelas: ${str(B)}.` : op === "-" ? `O número que se tira: ${str(B)}.` : `O número pelo qual se divide: ${str(B)}.`, str(B), F);
    const sinal = cell(2, 1, O.sinal, "sinal");
    const linha = cell(2, `1 / ${W + 2}`, "", "linha");
    const commas = [a.comma, b.comma].filter(x => x != null);
    const own = [a.own, b.own].filter(x => x != null), added = [a.added, b.added].filter(x => x != null);

    if (op !== "/") {
      frame("Monta", `Escreva um número embaixo do outro com <strong>vírgula embaixo de vírgula</strong>. Assim, unidades ficam embaixo de unidades, décimos embaixo de décimos, centésimos embaixo de centésimos — só se soma ou subtrai o que é da mesma casa.`,
        [...a.ids, ...b.ids, ...own, sinal, linha], [...a.ids.map(i => [i, 2]), ...b.ids.map(i => [i, 5]), ...own.map(i => [i, 4])]);
    } else {
      frame("Monta", F
        ? `Escreva o dividendo e o divisor um embaixo do outro, alinhados pela vírgula, para comparar quantas casas decimais cada um tem: ${str(A)} tem ${casasTxt(A.f.length)}; ${str(B)}, ${casasTxt(B.f.length)}.`
        : `Os dois números são inteiros: não há vírgula para tirar, e a divisão é a de sempre. A vírgula só aparece no quociente, se a conta continuar depois que os algarismos acabarem.`,
        [...a.ids, ...b.ids, ...own, sinal], [...a.ids.map(i => [i, 2]), ...b.ids.map(i => [i, 5]), ...own.map(i => [i, 4])]);
    }

    const zs = [...a.zeros, ...b.zeros];
    if (zs.length) {
      const quem = a.zeros.length ? str(A) : str(B), novo = a.zeros.length ? str({ i: A.i, f: A.f.padEnd(F, "0") }) : str({ i: B.i, f: B.f.padEnd(F, "0") });
      frame("Completa", `Complete com zeros para os dois terem ${casasTxt(F)}: ${quem} = ${novo}.${added.length ? ` Todo número inteiro tem uma vírgula escondida no fim, que agora aparece.` : ""} Zero no fim da parte decimal não muda o valor — ${quem} e ${novo} são o mesmo número.`,
        [...zs, ...added], [...zs.map(i => [i, 3]), ...added.map(i => [i, 4])]);
    }

    const digA = [...a.ids, ...a.zeros], digB = [...b.ids, ...b.zeros];
    const RS = tidy(RD);
    const rInfo = op === "+" ? `A soma: ${str(A)} + ${str(B)} = ${RS}.` : op === "-" ? `A diferença: ${str(A)} − ${str(B)} = ${RS}.` : `O quociente: ${str(A)} ÷ ${str(B)} ${exata ? "=" : "≈"} ${RS}${exata ? "" : "…"}.`;
    const rIds = [];
    RD.i.split("").forEach((x, j) => rIds.push(cell(3, col(RD.i.length - 1 - j), x, O.r, "r", rInfo, { val: RS })));
    const rComma = RD.f ? cell(3, col(0), ",", "virgula", "rv", virgInfo, { cls: "ld-virgula" }) : null;
    RD.f.split("").forEach((x, j) => rIds.push(cell(3, col(-1 - j), x, O.r, "r", rInfo, { val: RS })));

    if (op !== "/") {
      const ia = NA, ib = NB;
      const link = op === "+" ? `adicao.html?parcelas=${ia}+%2B+${ib}#conta` : `subtracao.html?minuendo=${ia}&subtraendo=${ib}#conta`;
      frame("Conta", `Agora faça a conta ${op === "+" ? "de mais" : "de menos"} normalmente, coluna por coluna da direita para a esquerda, como se a vírgula não estivesse lá: ${ia} ${O.sinal} ${ib} = ${R}. <a href="${link}">Veja essa conta armada passo a passo →</a>`,
        rIds, [...digA.map(i => [i, 2]), ...digB.map(i => [i, 5]), ...rIds.map(i => [i, 1])]);
      if (rComma != null) {
        frame("Vírgula", `A vírgula do resultado desce <strong>no mesmo lugar</strong>, embaixo das outras: ${str(A)} ${O.sinal} ${str(B)} = <strong>${str(RD)}</strong>${RS !== str(RD) ? ` = ${RS}` : ""}.`,
          [rComma], [...commas.map(i => [i, 4]), [rComma, 4], ...rIds.map(i => [i, 1])]);
      }
      frame("Fim", `Pronto: ${str(A)} ${O.sinal} ${str(B)} = <strong>${RS}</strong>. ${op === "+" ? `Prova real: ${RS} − ${str(B)} = ${str(A)}.` : `Prova real: ${RS} + ${str(B)} = ${str(A)}.`}`,
        [], [...digA.map(i => [i, 2]), ...digB.map(i => [i, 5]), ...rIds.map(i => [i, 1])]);
      return { cells, frames, template: `auto repeat(${W}, auto)`, value: c => c.val, A, B, op, RS, exata };
    }

    // Divisão: multiplicar os dois por 10, 100… até sumirem as vírgulas.
    const k = F;
    if (k) {
      frame("Vírgula", `Multiplique dividendo e divisor por ${10 ** k} — a vírgula anda ${k === 1 ? "uma casa" : `${k} casas`} para a direita nos dois. A divisão não muda: dividir ${str(A)} por ${str(B)} é o mesmo que dividir ${NA} por ${NB}, como 6 ÷ 3 = 60 ÷ 30. Agora são dois inteiros.`,
        [], [...digA.map(i => [i, 2]), ...digB.map(i => [i, 5])], { cross: commas });
    }
    const link = `divisao.html?dividendo=${NA}&divisor=${NB}&casas=${Rk}#conta`;
    frame("Conta", `Divida os inteiros: ${NA} ÷ ${NB} ${exata ? "=" : "≈"} ${RS}${exata ? "" : "…"}${Rk ? ` — a conta continua depois da vírgula, baixando zeros` : ""}. <a href="${link}">Veja essa divisão armada passo a passo →</a>`,
      [...rIds, ...(rComma != null ? [rComma] : []), linha], [...digA.map(i => [i, 2]), ...digB.map(i => [i, 5]), ...rIds.map(i => [i, 1])]);
    frame("Fim", `Pronto: ${str(A)} ÷ ${str(B)} ${exata ? "=" : "≈"} <strong>${RS}</strong>${exata ? "" : " (parando na 4ª casa)"}. ${exata ? `Prova real: ${RS} × ${str(B)} = ${str(A)}.` : "A divisão não termina em 4 casas: os decimais continuam, e podem se repetir para sempre."}`,
      [], [...rIds.map(i => [i, 1])]);
    return { cells, frames, template: `auto repeat(${W}, auto)`, value: c => c.val, A, B, op, RS, exata };
  }

  // Multiplicar: alinhados pela direita, sem olhar a vírgula; depois contam-se as casas.
  function buildMul(A, B, O, { cells, frames, cell, frame, virgInfo }) {
    const ka = A.f.length, kb = B.f.length, K = ka + kb;
    const da = A.i + A.f, db = B.i + B.f;
    const ia = Number(da), ib = Number(db), P = ia * ib;
    const PD = fromInt(P, K);
    const ps = PD.i + PD.f; // com os zeros à esquerda que a vírgula pedir
    const W = Math.max(da.length, db.length, ps.length);
    const col = j => 2 + j; // j: 0…W−1 da esquerda
    const RS = tidy(PD);

    function number(row, ds, k, kind, group, info, value) {
      const off = W - ds.length;
      const ids = ds.split("").map((x, j) => cell(row, col(off + j), x, kind, group, info, { val: value }));
      const comma = k ? cell(row, col(off + ds.length - k - 1), ",", "virgula", `${group}v`, virgInfo, { cls: "ld-virgula" }) : null;
      return { ids, comma, dec: k ? ids.slice(ids.length - k) : [] };
    }

    const a = number(1, da, ka, O.a, "a", `Um dos fatores: ${str(A)}${ka ? `, com ${casasTxt(ka)}` : ""}.`, str(A));
    const b = number(2, db, kb, O.b, "b", `O outro fator: ${str(B)}${kb ? `, com ${casasTxt(kb)}` : ""}.`, str(B));
    const sinal = cell(2, 1, "×", "sinal");
    const linha = cell(2, `1 / ${W + 2}`, "", "linha");
    const commas = [a.comma, b.comma].filter(x => x != null);

    frame("Monta", `Na multiplicação <strong>não se alinha a vírgula</strong>: escreva os fatores alinhados pela direita, como se fossem inteiros. Não é preciso que tenham o mesmo número de casas.`,
      [...a.ids, ...b.ids, ...commas, sinal, linha], [...a.ids.map(i => [i, 2]), ...b.ids.map(i => [i, 5]), ...commas.map(i => [i, 4])]);

    const off = W - ps.length;
    const lead = ps.length - String(P).length; // zeros à esquerda que só a vírgula pede
    const rIds = [], zIds = [];
    ps.split("").forEach((x, j) => {
      const isLead = j < lead;
      const id = cell(3, col(off + j), x, isLead ? "zero" : O.r, isLead ? "rz" : "r",
        isLead ? `Zero à esquerda: o produto ${P} tem menos algarismos que as ${K} casas decimais pedidas, então se completa com zeros antes dele para a vírgula ter onde ficar.` : `O produto: ${str(A)} × ${str(B)} = ${RS}.`,
        { val: RS, cls: isLead ? "is-ghost" : undefined });
      (isLead ? zIds : rIds).push(id);
    });
    const rComma = K ? cell(3, col(off + ps.length - K - 1), ",", "virgula", "rv", virgInfo, { cls: "ld-virgula" }) : null;

    frame("Conta", `Multiplique como se não houvesse vírgula: ${ia} × ${ib} = ${P}. <a href="multiplicacao.html?multiplicando=${ia}&multiplicador=${ib}#conta">Veja essa conta armada passo a passo →</a>`,
      rIds, [...a.ids.map(i => [i, 2]), ...b.ids.map(i => [i, 5]), ...rIds.map(i => [i, 1])], { cross: commas });
    if (K) {
      frame("Casas", `Agora conte as casas decimais dos fatores: ${str(A)} tem ${ka}, ${str(B)} tem ${kb}. Juntos, <strong>${ka} + ${kb} = ${K}</strong>. Por quê? ${ka ? `${str(A)} = ${ia}/${10 ** ka}` : str(A)} e ${kb ? `${str(B)} = ${ib}/${10 ** kb}` : str(B)}: o produto é ${P} dividido por ${10 ** K}.`,
        [], [...a.dec.map(i => [i, 2]), ...b.dec.map(i => [i, 5]), ...rIds.map(i => [i, 1])]);
      frame("Vírgula", `Ponha a vírgula no produto contando ${K} ${K === 1 ? "casa" : "casas"} da direita para a esquerda${lead ? `; como faltam algarismos, complete com ${lead === 1 ? "um zero" : `${lead} zeros`} à esquerda` : ""}: <strong>${str(PD)}</strong>${RS !== str(PD) ? ` = ${RS}` : ""}.`,
        [...zIds, rComma], [...rIds.map(i => [i, 1]), ...zIds.map(i => [i, 3]), [rComma, 4]]);
    }
    frame("Fim", `Pronto: ${str(A)} × ${str(B)} = <strong>${RS}</strong>.${K ? " Confira pela estimativa: arredondando os fatores, o resultado tem de dar perto disso." : ""}`,
      [], [...rIds.map(i => [i, 1]), ...zIds.map(i => [i, 1])]);
    return { cells, frames, template: `auto repeat(${W}, auto)`, value: c => c.val, A, B, op: "*", RS, exata: true };
  }

  /* ---------------------------------------------------------------- seção */

  const DEC = /^\d{1,7}(,\d{1,4})?$/;
  function read(v) {
    const a = v.a.replace(/\./g, ","), b = v.b.replace(/\./g, ",");
    const bad = [];
    if (!DEC.test(a)) bad.push("a");
    if (!DEC.test(b)) bad.push("b");
    if (bad.length) return { err: "Use números sem sinal, com vírgula e até 4 casas decimais (como 12,5 ou 0,75).", bad };
    const A = parse(a), B = parse(b), F = Math.max(A.f.length, B.f.length);
    const na = Number(A.i + A.f.padEnd(F, "0")), nb = Number(B.i + B.f.padEnd(F, "0"));
    if (v.op === "-" && na < nb) return { err: `${a} é menor que ${b}: o resultado seria negativo. Faça ${b} − ${a} e ponha o sinal de menos na frente (veja a página de números negativos).`, bad: ["a", "b"] };
    if (v.op === "/" && nb === 0) return { err: "Divisão por zero não existe.", bad: ["b"] };
    return { args: [a, v.op, b] };
  }

  Licao.renderTex();
  const intro = document.querySelector("#quadro");
  if (intro) initQuadro(intro);

  const conta = document.querySelector("#conta");
  if (conta) Conta.passos(conta, {
    kinds: KINDS,
    fields: ["a", "op", "b"],
    read,
    build: ([a, op, b]) => build(a, op, b),
    result: bb => `${tone(texDec(str(bb.A)), 2)} ${OPS[bb.op].tex} ${tone(texDec(str(bb.B)), 5)} ${bb.exata ? "=" : "\\approx"} ${tone(texDec(bb.RS), 1)}`,
  });
})();
