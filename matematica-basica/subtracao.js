/* Subtração: os blocos de dezena e unidade do início (com a troca de uma
 * barra por dez cubinhos), a conta em que se clica nas partes e a conta
 * armada passo a passo — empresta, subtrai. A grade, os quadros e o clique
 * vêm de conta.js; os utilitários, de licao.js.
 */
(() => {
  const { fmt, tone, math, el, saveParams } = Licao;
  const { casa, casa1, readInt, tones } = Conta;

  /* ---------------------------------------------------------------- blocos */

  function initBlocos(section) {
    const inM = section.querySelector("input[name=tem]");
    const inS = section.querySelector("input[name=tira]");
    const outM = section.querySelector(".out-tem");
    const outS = section.querySelector(".out-tira");
    const tens = section.querySelector(".blk-tens");
    const units = section.querySelector(".blk-units");
    const eq = section.querySelector(".blk-eq");
    const text = section.querySelector(".intro-text");
    const q = new URLSearchParams(location.search);
    if (q.has("tem")) inM.value = q.get("tem");
    if (q.has("tira")) inS.value = q.get("tira");

    function draw() {
      const M = Number(inM.value);
      inS.max = M;
      if (Number(inS.value) > M) inS.value = M;
      const S = Number(inS.value);
      outM.textContent = M;
      outS.textContent = S;
      const mt = Math.floor(M / 10), mu = M % 10, st = Math.floor(S / 10), su = S % 10;
      const troca = mu < su;
      const t = troca ? mt - 1 : mt, u = troca ? mu + 10 : mu;

      // Barras: as que ficam, a trocada (tracejada) e, por último, as tiradas.
      tens.replaceChildren(...Array.from({ length: mt }, (_, i) => {
        const broken = troca && i === mt - 1;
        const out = !broken && i >= t - st;
        return el("span", `bar${broken ? " is-broken" : ""}${out ? " is-out" : ""}`);
      }));
      // Cubinhos: os do número, os 10 que vieram da troca e os tirados no fim.
      units.replaceChildren(...Array.from({ length: u }, (_, i) => el("span", `cube${i >= mu ? " is-new" : ""}${i >= u - su ? " is-out" : ""}`)));

      math(eq, `\\displaystyle ${tone(M, 2)} - ${tone(S, 5)} = ${tone(M - S, 1)}`);
      const parts = [`<p>${fmt(M)} é <strong>${mt} ${mt === 1 ? "barra" : "barras"} de dez</strong> e <strong>${mu} ${mu === 1 ? "cubinho" : "cubinhos"}</strong>. Tirar ${fmt(S)} é tirar ${st} ${st === 1 ? "barra" : "barras"} e ${su} ${su === 1 ? "cubinho" : "cubinhos"}.</p>`];
      if (troca) parts.push(`<p>Mas não dá para tirar ${su} cubinhos de ${mu}. Então <strong>troque uma barra por 10 cubinhos</strong> (a tracejada): ficam ${t} ${t === 1 ? "barra" : "barras"} e ${u} cubinhos — o mesmo ${fmt(M)}, só que trocado. É isso que a conta armada chama de <strong>emprestar</strong>.</p>`);
      parts.push(`<p>Tirando o que se pede (os apagados), sobram ${t - st} ${t - st === 1 ? "barra" : "barras"} e ${u - su} ${u - su === 1 ? "cubinho" : "cubinhos"}: <strong>${fmt(M - S)}</strong>.</p>`);
      text.innerHTML = parts.join("");
      saveParams({ tem: M, tira: S });
    }

    section.addEventListener("input", draw);
    draw();
  }

  /* ---------------------------------------------------------------- a conta armada */

  const KINDS = {
    minuendo: { nome: "Minuendo", tone: 2 },
    subtraendo: { nome: "Subtraendo", tone: 5 },
    diferenca: { nome: "Diferença", tone: 1 },
    emprestimo: { nome: "Empréstimo", plural: "Empréstimos", tone: 4 },
  };

  const digits = n => String(n).split("").map(Number);

  // Tons: minuendo 2, subtraendo 5, empréstimo 4, diferença 1.
  function build(M, S) {
    const ms = digits(M), ss = digits(S);
    const W = ms.length, Ls = ss.length;
    const Dv = M - S, Ld = String(Dv).length;
    const col = c => 1 + W - c;
    // De cima para baixo: o que recebeu 10, o que emprestou, os números e a
    // diferença.
    const plusRow = 1, decRow = 2, mRow = 3, sRow = 4, dRow = 5;

    const cells = [], frames = [];
    const cell = (row, c, text, kind, group, info, extra = {}) => {
      cells.push({ row, col: c, text, kind, group, info, ...extra });
      return cells.length - 1;
    };
    const frame = (tag, html, show = [], hl = [], extra = {}) => frames.push({ tag, html, show, hl, ...extra });
    const riscar = (id, porque) => { cells[id].info += ` Está riscado porque ${porque}.`; };

    const mIds = ms.map((x, k) => cell(mRow, col(W - 1 - k), String(x), "minuendo", "m",
      `O número de onde se tira. Este ${x} é das ${casa(W - 1 - k)}.`, { val: M })).reverse();
    const sIds = ss.map((x, k) => cell(sRow, col(Ls - 1 - k), String(x), "subtraendo", "s",
      `O número que se tira. Este ${x} é das ${casa(Ls - 1 - k)}, e sai das ${casa(Ls - 1 - k)} do ${M}.`, { val: S })).reverse();
    const menos = cell(sRow, 1, "−", "sinal");
    const linha = cell(sRow, `1 / ${W + 2}`, "", "linha");
    frame("Monta", `Monte a conta: o minuendo, ${M}, em cima; o subtraendo, ${S}, embaixo, alinhados pela direita — unidades embaixo de unidades, dezenas embaixo de dezenas. A conta anda da direita para a esquerda.`,
      [...mIds, ...sIds, menos, linha], [...tones(mIds, 2), ...tones(sIds, 5)]);

    const cur = ms.slice().reverse();     // valor atual de cada casa
    const topo = mIds.slice();            // célula que mostra esse valor
    const dIds = [];
    for (let c = 0; c < W; c++) {
      const bot = c < Ls ? ss[Ls - 1 - c] : null;
      const top = cur[c];
      if (bot != null && top < bot) {
        let k = c + 1;
        while (cur[k] === 0) k++;
        const show = [], cross = [];
        const oldK = cur[k];
        cur[k]--;
        const kid = cell(decRow, col(k), String(cur[k]), "emprestimo", `e${k}`,
          `O ${oldK} das ${casa(k)} emprestou 1 ${casa1(k)} para a casa da direita e ficou ${cur[k]}.`, { cls: "is-small", val: cur[k] });
        riscar(topo[k], `emprestou 1 para a casa da direita e virou ${cur[k]}`);
        cross.push(topo[k]); topo[k] = kid; show.push(kid);
        const meio = [];
        for (let t = c + 1; t < k; t++) {
          cur[t] = 9;
          const tid = cell(decRow, col(t), "9", "emprestimo", `e${t}`,
            `Era 0: recebeu 1 ${casa1(t + 1)} = 10 ${casa(t)}, passou 1 adiante, para a casa da direita, e ficou com 9.`, { cls: "is-small", val: 9 });
          riscar(topo[t], "era 0, recebeu 10 da esquerda e passou 1 adiante");
          cross.push(topo[t]); topo[t] = tid; show.push(tid); meio.push(t);
        }
        cur[c] += 10;
        const cid = cell(plusRow, col(c), String(cur[c]), "emprestimo", `e${c}+`,
          `O ${top} recebeu 10 ${casa(c)} emprestadas da casa da esquerda (1 ${casa1(c + 1)} = 10 ${casa(c)}) e virou ${cur[c]}. Agora dá para tirar ${bot}.`, { cls: "is-small", val: cur[c] });
        riscar(topo[c], `recebeu 10 emprestado e virou ${cur[c]}`);
        cross.push(topo[c]); topo[c] = cid; show.push(cid);

        const cadeia = [];
        for (let t = k; t > c; t--) cadeia.push(`1 ${casa1(t)} = 10 ${casa(t - 1)}`);
        frame("Empresta", meio.length
          ? `O ${top} é menor que o ${bot}: não dá para tirar. A casa da esquerda tem 0 — nada para emprestar —, então o empréstimo vem de mais longe, das ${casa(k)}: o ${oldK} vira ${cur[k]}. Essa ${casa1(k)} desce trocada (${cadeia.join("; ")}): ${meio.length === 1 ? "a casa do meio fica" : "as casas do meio ficam"} com 9, e o ${top} vira ${cur[c]}.`
          : `O ${top} é menor que o ${bot}: não dá para tirar ${bot} de ${top}. Peça emprestado à casa da esquerda: o ${oldK} das ${casa(k)} vira ${cur[k]}, e essa ${casa1(k)} vira 10 ${casa(c)}, que se juntam ao ${top}: agora são ${cur[c]}.`,
          show, [...tones(show, 4), [sIds[c], 5]], { cross });
      }

      const d = cur[c] - (bot ?? 0);
      const hl = [[topo[c], topo[c] === mIds[c] ? 2 : 4], ...(bot != null ? [[sIds[c], 5]] : [])];
      if (c >= Ld) {
        frame("Subtrai", `Nas ${casa(c)} ${bot != null ? `fica ${cur[c]} − ${bot} = 0` : `sobrou ${cur[c]}`}: é um zero à esquerda, e zero à esquerda não se escreve.`, [], hl);
        continue;
      }
      const did = cell(dRow, col(c), String(d), "diferenca", "diferenca",
        `O resultado: ${M} − ${S} = ${Dv}. Este ${d} é das ${casa(c)}: ${bot != null ? `${cur[c]} − ${bot} = ${d}` : `não havia nada para tirar ali, então o ${cur[c]} desceu direto`}.`, { val: Dv });
      dIds.push(did);
      frame("Subtrai", bot != null
        ? `Nas ${casa(c)}: ${cur[c]} − ${bot} = ${d}. Escreva ${d} embaixo do traço.`
        : `Nas ${casa(c)} não há nada embaixo para tirar (é como tirar 0): o ${cur[c]} desce direto.`,
        [did], [...hl, [did, 1]]);
    }

    frame("Fim", `Pronto: ${M} − ${S} = <strong>${fmt(Dv)}</strong>. Prova real: ${fmt(Dv)} + ${S} = ${M} — somar de volta o que se tirou devolve o número do começo.`,
      [], [...tones(sIds, 5), ...tones(dIds, 1)]);

    return { cells, frames, template: `auto repeat(${W}, auto)`, value: c => c.val, M, S, Dv };
  }

  /* ---------------------------------------------------------------- seções */

  function read(sM, sS, nM, nS) {
    const M = readInt(sM, 9), S = readInt(sS, 9);
    if (Number.isNaN(M)) return { err: "Digite um minuendo inteiro, sem sinal, com até 9 algarismos.", bad: [nM] };
    if (Number.isNaN(S)) return { err: "Digite um subtraendo inteiro, sem sinal, com até 9 algarismos.", bad: [nS] };
    if (S > M) return { err: `O subtraendo é maior que o minuendo, e o resultado fica negativo. Faça a conta ao contrário, ${S} − ${M} = ${fmt(S - M)}, e ponha o sinal de menos: ${M} − ${S} = −${fmt(S - M)}.`, bad: [nS] };
    return { args: [M, S] };
  }

  Licao.renderTex();
  const intro = document.querySelector(".blocos");
  if (intro) initBlocos(intro);

  const partes = document.querySelector("#partes");
  if (partes) Conta.partes(partes, {
    kinds: KINDS,
    fields: ["a", "b"],
    read: v => read(v.a, v.b, "a", "b"),
    build: ([M, S]) => build(M, S),
    cards: (b, [M, S]) => [
      ["minuendo", M, "O número de onde se tira."],
      ["subtraendo", S, "O número que se tira."],
      ["diferenca", b.Dv, "O que sobra: o resultado da subtração. Também se diz resto."],
      ["emprestimo", null, "Uma casa troca 1 dos seus por 10 da casa da direita quando falta o que tirar."],
    ],
    prova: (b, [M, S]) => `${tone(M, 2)} - ${tone(S, 5)} = ${tone(b.Dv, 1)} \\iff ${tone(b.Dv, 1)} + ${tone(S, 5)} = ${tone(M, 2)}`,
  });

  const conta = document.querySelector("#conta");
  if (conta) Conta.passos(conta, {
    kinds: KINDS,
    fields: ["minuendo", "subtraendo"],
    read: v => read(v.minuendo, v.subtraendo, "minuendo", "subtraendo"),
    build: ([M, S]) => build(M, S),
    result: b => `${tone(b.M, 2)} - ${tone(b.S, 5)} = ${tone(b.Dv, 1)}`,
  });
})();
