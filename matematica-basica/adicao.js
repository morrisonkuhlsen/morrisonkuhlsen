/* Adição: os blocos de dezena e unidade do início (com a troca de dez
 * cubinhos por uma barra), a conta em que se clica nas partes e a conta
 * armada passo a passo — soma, vai um. A grade, os quadros e o clique vêm
 * de conta.js; os utilitários, de licao.js.
 */
(() => {
  const { fmt, tone, math, el, saveParams } = Licao;
  const { casa, casa1, tones } = Conta;

  /* ---------------------------------------------------------------- blocos */

  function initBlocos(section) {
    const inA = section.querySelector("input[name=um]");
    const inB = section.querySelector("input[name=outro]");
    const outA = section.querySelector(".out-um");
    const outB = section.querySelector(".out-outro");
    const tens = section.querySelector(".blk-tens");
    const units = section.querySelector(".blk-units");
    const eq = section.querySelector(".blk-eq");
    const text = section.querySelector(".intro-text");
    const q = new URLSearchParams(location.search);
    if (q.has("um")) inA.value = q.get("um");
    if (q.has("outro")) inB.value = q.get("outro");

    function draw() {
      const a = Number(inA.value), b = Number(inB.value);
      outA.textContent = a;
      outB.textContent = b;
      const at = Math.floor(a / 10), au = a % 10, bt = Math.floor(b / 10), bu = b % 10;
      const u = au + bu, troca = u >= 10;

      // Barras dos dois números e, se houver troca, a barra nova (tracejada).
      tens.replaceChildren(
        ...Array.from({ length: at }, () => el("span", "bar")),
        ...Array.from({ length: bt }, () => el("span", "bar is-b")),
        ...(troca ? [el("span", "bar is-made")] : []));
      // Cubinhos dos dois; os dez primeiros, se houver troca, viram a barra.
      units.replaceChildren(...Array.from({ length: u }, (_, i) => el("span", `cube${i >= au ? " is-b" : ""}${troca && i < 10 ? " is-out" : ""}`)));

      math(eq, `\\displaystyle ${tone(a, 2)} + ${tone(b, 5)} = ${tone(a + b, 1)}`);
      const parts = [`<p>Junte ${at} + ${bt} = <strong>${at + bt} ${at + bt === 1 ? "barra" : "barras"} de dez</strong> e ${au} + ${bu} = <strong>${u} ${u === 1 ? "cubinho" : "cubinhos"}</strong>.</p>`];
      if (troca) parts.push(`<p>Mas uma casa só guarda até 9: com ${u} cubinhos, <strong>dez deles viram uma barra</strong> (a tracejada) e sobram ${u - 10}. Essa barra nova é o <strong>vai um</strong>: 1 dezena que sobe para a casa das dezenas.</p>`);
      parts.push(`<p>No fim, ${at + bt + (troca ? 1 : 0)} ${at + bt + (troca ? 1 : 0) === 1 ? "barra" : "barras"} e ${u % 10} ${u % 10 === 1 ? "cubinho" : "cubinhos"}: <strong>${fmt(a + b)}</strong>.</p>`);
      text.innerHTML = parts.join("");
      saveParams({ um: a, outro: b });
    }

    section.addEventListener("input", draw);
    draw();
  }

  /* ---------------------------------------------------------------- a conta armada */

  const KINDS = {
    parcela: { nome: "Parcela", plural: "Parcelas", tone: 2 },
    vaium: { nome: "Vai um", plural: "Vai um (reservas)", tone: 4 },
    soma: { nome: "Soma", tone: 1 },
  };

  const digits = n => String(n).split("").map(Number);
  const ORD = ["primeira", "segunda", "terceira", "quarta", "quinta"];

  // Tons: parcelas 2, vai um 4, soma 1.
  function build(nums) {
    const T = nums.reduce((s, n) => s + n, 0);
    const W = String(T).length;
    const col = c => 1 + W - c;
    const k = nums.length;
    // De cima para baixo: os vai-um, as parcelas, o traço e a soma.
    const carryRow = 1, parRow = i => 2 + i, somaRow = k + 2;

    const cells = [], frames = [];
    const cell = (row, c, text, kind, group, info, extra = {}) => {
      cells.push({ row, col: c, text, kind, group, info, ...extra });
      return cells.length - 1;
    };
    const frame = (tag, html, show = [], hl = []) => frames.push({ tag, html, show, hl });

    // parIds[i][c]: célula da parcela i na casa c.
    const parIds = nums.map((n, i) => {
      const ds = digits(n), L = ds.length;
      return ds.map((x, j) => cell(parRow(i), col(L - 1 - j), String(x), "parcela", `p${i}`,
        `${k === 2 ? (i ? "A segunda parcela" : "A primeira parcela") : `A ${ORD[i]} parcela`}, um dos números que se somam. Este ${x} é das ${casa(L - 1 - j)}, e se soma só com o que está na mesma coluna.`, { val: n })).reverse();
    });
    const mais = cell(parRow(k - 1), 1, "+", "sinal");
    const linha = cell(parRow(k - 1), `1 / ${W + 2}`, "", "linha");
    frame("Monta", `Monte a conta: ${k === 2 ? "as duas parcelas" : `as ${k} parcelas`}, uma embaixo da outra, alinhadas pela direita — unidades embaixo de unidades, dezenas embaixo de dezenas. A conta anda da direita para a esquerda.`,
      [...parIds.flat(), mais, linha], tones(parIds.flat(), 2));

    let carry = 0, carryId = null;
    const somaIds = [];
    for (let c = 0; c < W; c++) {
      const parts = parIds.map(ids => ids[c]).filter(id => id != null);
      const s = parts.reduce((t, id) => t + Number(cells[id].text), 0) + carry;
      const d = s % 10, nc = Math.floor(s / 10);
      const termos = parts.map(id => cells[id].text);
      if (carry) termos.push(String(carry));
      const did = cell(somaRow, col(c), String(d), "soma", "soma",
        `O resultado: ${nums.join(" + ")} = ${T}. Este ${d} é das ${casa(c)}: ${termos.length > 1 ? `${termos.join(" + ")} = ${s}` : `só o ${s}${carry && !parts.length ? ", que subiu da casa anterior" : ""}`}${nc ? `, e fica o ${d}` : ""}.`, { val: T });
      somaIds.push(did);
      const show = [did];
      let ncId = null;
      if (nc) {
        ncId = cell(carryRow, col(c + 1), String(nc), "vaium", `v${c}`,
          `A coluna das ${casa(c)} somou ${s}, e uma casa só guarda até 9. O ${d} ficou embaixo e este ${nc} — ${nc} ${nc === 1 ? casa1(c + 1) : casa(c + 1)}, ou ${nc * 10} ${casa(c)} — subiu para ser somado na coluna seguinte.`, { cls: "is-small" });
        show.push(ncId);
      }
      const conta = termos.length > 1 ? `${termos.join(" + ")} = ${s}` : `só o ${s}`;
      frame(nc ? ["Soma", "Vai um"] : "Soma",
        !parts.length
          ? `Nas ${casa(c)} não há mais parcelas, só o ${carry} que subiu: ele desce para a soma.`
          : `Nas ${casa(c)}: ${conta}${carry ? ` (o último ${carry} é o que subiu)` : ""}. ${nc
            ? `${s} ${casa(c)} são ${nc === 1 ? "uma" : nc} ${nc === 1 ? casa1(c + 1) : casa(c + 1)} e ${d} ${d === 1 ? casa1(c) : casa(c)}: escreva o ${d} e suba o ${nc}${nc > 1 ? ` — é um “vai ${nc}”` : ""}.`
            : `Escreva ${d}.`}`,
        show, [...tones(parts, 2), ...(carryId != null ? [[carryId, 4]] : []), [did, 1], ...(ncId != null ? [[ncId, 4]] : [])]);
      carry = nc;
      carryId = ncId;
    }

    frame("Fim", `Pronto: ${nums.join(" + ")} = <strong>${fmt(T)}</strong>. Prova real: ${fmt(T)} − ${nums[k - 1]} = ${fmt(T - nums[k - 1])}${k === 2 ? "" : `, que é a soma das outras parcelas`} — tirar uma parcela devolve o resto da soma.`,
      [], [...tones(parIds.flat(), 2), ...tones(somaIds, 1)]);

    return { cells, frames, template: `auto repeat(${W}, auto)`, value: c => c.val, nums, T };
  }

  /* ---------------------------------------------------------------- seções */

  // Parcelas separadas por +, vírgula, ponto e vírgula ou espaço.
  function read(s, name) {
    const parts = s.split(/[\s+,;]+/).filter(Boolean);
    if (parts.length < 2) return { err: "Digite pelo menos duas parcelas, separadas por + (como 27 + 48).", bad: [name] };
    if (parts.length > 5) return { err: "Use no máximo cinco parcelas.", bad: [name] };
    if (parts.some(p => !/^\d{1,9}$/.test(p))) return { err: "As parcelas precisam ser inteiras, sem sinal, com até 9 algarismos.", bad: [name] };
    return { args: [parts.map(Number)] };
  }

  Licao.renderTex();
  const intro = document.querySelector(".blocos");
  if (intro) initBlocos(intro);

  const partes = document.querySelector("#partes");
  if (partes) Conta.partes(partes, {
    kinds: KINDS,
    fields: ["n"],
    read: v => read(v.n, "n"),
    build: ([nums]) => build(nums),
    cards: b => [
      ["parcela", null, "Os números que se somam. A ordem não importa."],
      ["soma", fmt(b.T), "O resultado da adição: o total."],
      ["vaium", null, "Quando uma coluna passa de 9, as dezenas dela sobem para a coluna seguinte."],
    ],
    prova: b => `${b.nums.map(n => tone(n, 2)).join(" + ")} = ${tone(fmt(b.T).replace(/\./g, "{.}"), 1)}`,
  });

  const conta = document.querySelector("#conta");
  if (conta) Conta.passos(conta, {
    kinds: KINDS,
    fields: ["parcelas"],
    read: v => read(v.parcelas, "parcelas"),
    build: ([nums]) => build(nums),
    result: b => `${b.nums.map(n => tone(n, 2)).join(" + ")} = ${tone(fmt(b.T).replace(/\./g, "{.}"), 1)}`,
  });
})();
