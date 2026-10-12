/* Multiplicação: o retângulo de quadradinhos do início, a conta em que se
 * clica nas partes e a conta armada passo a passo — multiplica, vai um,
 * desloca, soma. A grade, os quadros e o clique vêm de conta.js; os
 * utilitários, de licao.js.
 */
(() => {
  const { fmt, tone, math, el, saveParams } = Licao;
  const { casa, casa1, readInt, tones } = Conta;

  /* ---------------------------------------------------------------- retângulo */

  function initArray(section) {
    const inA = section.querySelector("input[name=linhas]");
    const inB = section.querySelector("input[name=colunas]");
    const outA = section.querySelector(".out-linhas");
    const outB = section.querySelector(".out-colunas");
    const figure = section.querySelector(".array-figure");
    const eq = section.querySelector(".array-eq");
    const text = section.querySelector(".intro-text");
    const q = new URLSearchParams(location.search);
    if (q.has("linhas")) inA.value = q.get("linhas");
    if (q.has("colunas")) inB.value = q.get("colunas");

    function draw() {
      const a = Number(inA.value), b = Number(inB.value);
      outA.textContent = a;
      outB.textContent = b;
      figure.style.gridTemplateColumns = `repeat(${b}, 1fr)`;
      figure.style.maxWidth = `${b * 1.7}rem`;
      figure.replaceChildren(...Array.from({ length: a * b }, (_, i) => el("span", `sq${Math.floor(i / b) % 2 ? " is-alt" : ""}`)));
      const parcelas = a <= 6 ? Array(a).fill(b).join(" + ") : `${b} + ${b} + \\cdots + ${b}`;
      math(eq, `\\displaystyle ${tone(a, 2)} \\times ${tone(b, 5)} = ${a === 1 ? "" : `\\underbrace{${parcelas}}_{${a}\\ \\text{vezes}} = `}${tone(a * b, 1)}`);
      text.innerHTML = `<p><strong>${a} ${a === 1 ? "fileira" : "fileiras"} de ${b}</strong>: ${a === 1 ? `só ${b}` : `${b} somado ${a} vezes`}, ${fmt(a * b)} quadradinhos. Multiplicar é somar parcelas iguais — e contar um retângulo sem contar um por um.</p>`
        + (a !== b ? `<p>Gire o retângulo e ele vira ${b} ${b === 1 ? "fileira" : "fileiras"} de ${a}: os mesmos ${fmt(a * b)}. Por isso <strong>a ordem dos fatores não altera o produto</strong>.</p>` : `<p>Com ${a} fileiras de ${a}, o retângulo é um quadrado: ${a} × ${a} = ${a}², “${a} ao quadrado”.</p>`);
      saveParams({ linhas: a, colunas: b });
    }

    section.querySelector("[data-girar]").addEventListener("click", () => {
      [inA.value, inB.value] = [inB.value, inA.value];
      draw();
    });
    section.addEventListener("input", draw);
    draw();
  }

  /* ---------------------------------------------------------------- a conta armada */

  const KINDS = {
    multiplicando: { nome: "Multiplicando", tone: 2 },
    multiplicador: { nome: "Multiplicador", tone: 5 },
    vaium: { nome: "Vai um", plural: "Vai um (reservas)", tone: 4 },
    parcial: { nome: "Produto parcial", plural: "Produtos parciais", tone: 0 },
    zero: { nome: "Zero de posição", plural: "Zeros de posição", tone: 0 },
    produto: { nome: "Produto", tone: 1 },
  };

  const digits = n => String(n).split("").map(Number);

  // Tons: multiplicando 2, multiplicador 5, vai um 4, produto 1.
  function build(A, B) {
    const as = digits(A), bs = digits(B);
    const La = as.length, Lb = bs.length;
    const P = A * B, Lp = String(P).length;
    const W = Math.max(Lp, La, Lb);
    // Casa c (0 = unidades) → coluna da grade; a coluna 1 é a dos sinais.
    const col = c => 1 + W - c;
    const aDig = c => as[La - 1 - c];
    const bDig = i => bs[Lb - 1 - i];
    const multi = Lb > 1;
    // De cima para baixo: os vai-um de cada algarismo do multiplicador (o
    // das unidades mais perto do multiplicando), os dois fatores, os
    // vai-um da soma, os produtos parciais e o produto.
    const carryRow = i => Lb - i;
    const aRow = Lb + 1, bRow = Lb + 2, sumCarryRow = Lb + 3;
    const partRow = i => (multi ? Lb + 4 + i : Lb + 3);
    const prodRow = multi ? partRow(Lb - 1) + 1 : partRow(0);

    const cells = [], frames = [];
    const cell = (row, c, text, kind, group, info, extra = {}) => {
      cells.push({ row, col: c, text, kind, group, info, ...extra });
      return cells.length - 1;
    };
    const frame = (tag, html, show = [], hl = [], extra = {}) => frames.push({ tag, html, show, hl, ...extra });

    const aIds = as.map((x, k) => cell(aRow, col(La - 1 - k), String(x), "multiplicando", "a",
      `O primeiro fator, o número que é multiplicado. Este ${x} é das ${casa(La - 1 - k)}; cada algarismo do multiplicador passa por todos os algarismos dele.`, { val: A })).reverse();
    const bIds = bs.map((x, k) => {
      const i = Lb - 1 - k, v = x * 10 ** i;
      return cell(bRow, col(i), String(x), "multiplicador", "b",
        `O segundo fator: quantas vezes o ${A} é tomado. Este ${x} é das ${casa(i)} e vale ${fmt(v)}; ${multi ? `ele gera a ${i + 1}ª linha de produtos parciais: ${A} × ${fmt(v)} = ${fmt(A * v)}` : `ele gera o produto: ${A} × ${x} = ${fmt(A * x)}`}.`, { val: B });
    }).reverse();
    const vezes = cell(bRow, 1, "×", "sinal");
    const linha1 = cell(bRow, `1 / ${W + 2}`, "", "linha");
    frame("Monta", `Monte a conta: o multiplicando, ${A}, em cima; o multiplicador, ${B}, embaixo, alinhados pela direita — unidades embaixo de unidades. O traço separa os fatores do resultado.`,
      [...aIds, ...bIds, vezes, linha1], [...tones(aIds, 2), ...tones(bIds, 5)]);

    const rowIds = [];
    for (let i = 0; i < Lb; i++) {
      const m = bDig(i), Pi = A * m, valor = Pi * 10 ** i;
      const kind = multi ? "parcial" : "produto", group = multi ? `p${i}` : "produto";
      const pinfo = multi
        ? `Produto parcial: ${A} × ${fmt(m * 10 ** i)} = ${fmt(valor)}. É a parte do produto que vem do ${m} das ${casa(i)} do multiplicador.`
        : `O resultado: ${A} × ${B} = ${fmt(P)}.`;
      const ids = [];
      rowIds.push(ids);

      if (i > 0) {
        const zeros = Array.from({ length: i }, (_, z) => cell(partRow(i), col(z), "0", "zero", group,
          `Zero de posição: o ${m} do multiplicador está nas ${casa(i)} e vale ${fmt(m * 10 ** i)}. Multiplicar por ${fmt(10 ** i)} é pôr ${i === 1 ? "um zero" : `${i} zeros`} no fim — por isso esta linha começa ${i === 1 ? "uma casa" : `${i} casas`} mais à esquerda.`, { cls: "is-ghost", val: valor }));
        ids.push(...zeros);
        frame("Desloca", `Agora o ${m} das ${casa(i)}. Ele não vale ${m}: vale ${fmt(m * 10 ** i)}. Multiplicar por ${fmt(10 ** i)} põe ${i === 1 ? "um zero" : `${i} zeros`} no fim, então marque ${i === 1 ? "um 0 na casa das unidades" : `${i} zeros nas casas da direita`} e comece a escrever ${i === 1 ? "uma casa" : `${i} casas`} mais à esquerda.`,
          zeros, [[bIds[i], 5], ...tones(zeros, 0)]);
      }

      if (m === 0 || A === 0) {
        const zs = Array.from({ length: La }, (_, c) => cell(partRow(i), col(i + c), "0", kind, group, pinfo, { val: valor }));
        ids.push(...zs);
        frame("Multiplica", `${m === 0 ? `O algarismo da vez é 0, e qualquer número vezes 0 dá 0` : `O multiplicando é 0, e 0 vezes qualquer número dá 0`}: a linha inteira é de zeros.`,
          zs, [[bIds[i], 5], ...tones(aIds, 2), ...tones(zs, 1)]);
        continue;
      }

      let carry = 0, carryId = null;
      for (let c = 0; c < La; c++) {
        const a = aDig(c), v = a * m + carry, last = c === La - 1;
        const vs = last ? String(v) : String(v % 10);
        const nc = last ? 0 : Math.floor(v / 10);
        const written = vs.split("").map((x, k) => cell(partRow(i), col(i + c + vs.length - 1 - k), x, kind, group, pinfo, { val: multi ? valor : P }));
        ids.push(...written);
        const show = [...written];
        let ncId = null;
        if (nc) {
          ncId = cell(carryRow(i), col(c + 1), String(nc), "vaium", `v${i}-${c}`,
            `${m} × ${a}${carry ? ` + ${carry}` : ""} deu ${v}, que não cabe numa casa só: o ${v % 10} ficou embaixo e este ${nc} — ${nc} ${nc === 1 ? casa1(i + c + 1) : casa(i + c + 1)} — subiu para ser somado na conta seguinte, ${m} × ${aDig(c + 1)}.`, { cls: "is-small" });
          show.push(ncId);
        }
        const conta = `${m} × ${a} = ${a * m}${carry ? `, mais o ${carry} que subiu: ${v}` : ""}.`;
        frame(nc ? ["Multiplica", "Vai um"] : "Multiplica",
          `${conta} ${last
            ? (v >= 10 ? `É o último algarismo de cima, então escreva o ${v} inteiro.` : `É o último algarismo de cima: escreva ${v}.`)
            : nc ? `Escreva o ${v % 10} e suba o ${nc} para a casa das ${casa(i + c + 1)}, em cima do ${aDig(c + 1)}: ele vai ser somado na próxima conta.` : `Escreva ${v}; não sobe nada.`}`,
          show, [[aIds[c], 2], [bIds[i], 5], ...(carryId != null ? [[carryId, 4]] : []), ...tones(written, 1), ...(ncId != null ? [[ncId, 4]] : [])], { tab: { base: m, hit: a } });
        carry = nc;
        carryId = ncId;
      }
    }

    if (multi) {
      const mais = cell(partRow(Lb - 1), 1, "+", "sinal");
      const linha2 = cell(partRow(Lb - 1), `1 / ${W + 2}`, "", "linha");
      frame("Soma", `Cada algarismo do multiplicador deu uma linha. O produto é a soma delas: ${Array.from({ length: Lb }, (_, i) => fmt(A * bDig(i) * 10 ** i)).join(" + ")}. Some coluna por coluna, da direita para a esquerda.`,
        [mais, linha2], rowIds.flat().map(id => [id, 0]));
      // Algarismo de cada linha em cada casa, se a linha chega lá.
      const at = (i, c) => rowIds[i].find(id => cells[id].col === col(c));
      let carry = 0, carryId = null;
      for (let c = 0; c < Lp; c++) {
        const parts = [];
        for (let i = 0; i < Lb; i++) { const id = at(i, c); if (id != null) parts.push(id); }
        const s = parts.reduce((t, id) => t + Number(cells[id].text), 0) + carry;
        const nc = c === Lp - 1 ? 0 : Math.floor(s / 10);
        const ds = c === Lp - 1 ? String(s) : String(s % 10);
        const written = ds.split("").map((x, k) => cell(prodRow, col(c + ds.length - 1 - k), x, "produto", "produto", `O resultado: ${A} × ${B} = ${fmt(P)}. É a soma dos produtos parciais.`, { val: P }));
        const show = [...written];
        let ncId = null;
        if (nc) {
          ncId = cell(sumCarryRow, col(c + 1), String(nc), "vaium", `s${c}`,
            `Vai um da soma: a coluna das ${casa(c)} somou ${s}. O ${s % 10} ficou no produto e este ${nc} subiu para a coluna das ${casa(c + 1)}.`, { cls: "is-small" });
          show.push(ncId);
        }
        const termos = parts.map(id => cells[id].text);
        if (carry) termos.push(String(carry));
        frame(nc ? ["Soma", "Vai um"] : "Soma",
          `Coluna das ${casa(c)}: ${termos.length > 1 ? `${termos.join(" + ")} = ${s}` : `só o ${s}`}${carry ? ` (o último ${carry} é o que subiu)` : ""}. ${nc ? `Escreva o ${s % 10} e suba o ${nc}.` : `Escreva ${ds}.`}`,
          show, [...tones(parts, 0), ...(carryId != null ? [[carryId, 4]] : []), ...tones(written, 1), ...(ncId != null ? [[ncId, 4]] : [])]);
        carry = nc;
        carryId = ncId;
      }
    }

    const prodIds = cells.map((c, i) => (c.kind === "produto" ? i : -1)).filter(i => i >= 0);
    frame("Fim", `Pronto: ${A} × ${B} = <strong>${fmt(P)}</strong>.${B ? ` Prova real: ${fmt(P)} ÷ ${B} = ${A} — dividir pelo multiplicador devolve o multiplicando.` : ""}`,
      [], [...tones(aIds, 2), ...tones(bIds, 5), ...tones(prodIds, 1)]);

    return { cells, frames, template: `auto repeat(${W}, auto)`, value: c => c.val, A, B, P };
  }

  /* ---------------------------------------------------------------- seções */

  function read(sA, sB, nA, nB) {
    const A = readInt(sA, 6), B = readInt(sB, 4);
    if (Number.isNaN(A)) return { err: "Digite um multiplicando inteiro, sem sinal, com até 6 algarismos.", bad: [nA] };
    if (Number.isNaN(B)) return { err: "Digite um multiplicador inteiro, sem sinal, com até 4 algarismos.", bad: [nB] };
    return { args: [A, B] };
  }

  Licao.renderTex();
  const intro = document.querySelector(".array");
  if (intro) initArray(intro);

  const partes = document.querySelector("#partes");
  if (partes) Conta.partes(partes, {
    kinds: KINDS,
    fields: ["a", "b"],
    read: v => read(v.a, v.b, "a", "b"),
    build: ([A, B]) => build(A, B),
    cards: (b, [A, B]) => [
      ["multiplicando", A, "O número que é multiplicado: o primeiro fator."],
      ["multiplicador", B, "Quantas vezes o multiplicando é tomado: o segundo fator."],
      ["produto", fmt(b.P), "O resultado da multiplicação."],
      ["vaium", null, "O que passa de 9 numa casa sobe para a casa seguinte, para ser somado depois."],
      ["parcial", null, "Uma linha para cada algarismo do multiplicador; somadas, dão o produto.", x => x.kind === "parcial" || x.kind === "zero"],
      ["zero", null, "Marcam o deslocamento: o algarismo das dezenas vale dez vezes mais."],
    ],
    prova: (b, [A, B]) => `${tone(A, 2)} \\times ${tone(B, 5)} = ${tone(fmt(b.P).replace(/\./g, "{.}"), 1)}`,
  });

  const conta = document.querySelector("#conta");
  if (conta) Conta.passos(conta, {
    kinds: KINDS,
    fields: ["multiplicando", "multiplicador"],
    read: v => read(v.multiplicando, v.multiplicador, "multiplicando", "multiplicador"),
    build: ([A, B]) => build(A, B),
    result: b => `${tone(b.A, 2)} \\times ${tone(b.B, 5)} = ${tone(fmt(b.P).replace(/\./g, "{.}"), 1)}`,
    // A tabuada do algarismo da vez, com a conta do passo acesa.
    side: (sideEl, b, f) => (f.tab
      ? Conta.tabuada(sideEl, `Tabuada do ${f.tab.base}`, f.tab.base, i => (i === f.tab.hit ? "is-best" : ""))
      : sideEl.replaceChildren()),
    note: b => (b.B ? `Para conferir pela volta: <a href="divisao.html?dividendo=${b.P}&amp;divisor=${b.B}&amp;casas=0#conta">divida ${fmt(b.P)} por ${b.B} →</a>` : ""),
  });
})();
