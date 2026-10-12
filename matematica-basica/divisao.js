/* Divisão: a partilha do início (repartir e agrupar), a anatomia da conta e
 * a conta armada passo a passo — divide, multiplica, subtrai, baixa — nos
 * dois formatos: quociente em cima (como na maioria dos livros em inglês) e
 * método da chave (como se ensina no Brasil). Os utilitários vêm de licao.js.
 *
 * A conta armada é uma grade: build() devolve as células (cada algarismo no
 * seu lugar da grade) e os quadros (cada ação, com as células que aparecem e
 * as que acendem). Mostrar o quadro k é tornar visível tudo o que apareceu
 * até k. As células invisíveis continuam ocupando lugar, então a conta não
 * pula quando anda.
 */
(() => {
  const { fmt, tone, math, el, saveParams } = Licao;

  const pl = (n, um, varios) => `${fmt(n)} ${n === 1 ? um : varios}`;
  // 2833 com 2 casas → "28,33"; 1 com 2 casas → "0,01".
  const decStr = (v, c) => {
    if (!c) return String(v);
    const s = String(v).padStart(c + 1, "0");
    return `${s.slice(0, -c)},${s.slice(-c)}`;
  };
  const CASA = ["", "décimos", "centésimos", "milésimos", "décimos de milésimo"];

  /* ---------------------------------------------------------------- partilha */

  function initShare(section) {
    const inT = section.querySelector("input[name=total]");
    const inG = section.querySelector("input[name=grupos]");
    const outT = section.querySelector(".out-total");
    const outG = section.querySelector(".out-grupos");
    const modeBtns = section.querySelectorAll("[data-modo]");
    const figure = section.querySelector(".share-figure");
    const eq = section.querySelector(".share-eq");
    const text = section.querySelector(".intro-text");
    const q = new URLSearchParams(location.search);
    if (q.has("total")) inT.value = q.get("total");
    if (q.has("grupos")) inG.value = q.get("grupos");
    let modo = q.get("modo") === "agrupar" ? "agrupar" : "repartir";

    const box = (n, cls, label) => {
      const b = el("div", `share-box ${cls}`);
      const dots = el("div", "share-dots");
      for (let i = 0; i < n; i++) dots.appendChild(el("span", "dot"));
      b.append(dots, el("span", "share-label", label));
      return b;
    };

    function draw() {
      const D = Number(inT.value), d = Number(inG.value);
      const Q = Math.floor(D / d), R = D % d;
      outT.textContent = D;
      outG.textContent = d;
      modeBtns.forEach(b => b.setAttribute("aria-pressed", b.dataset.modo === modo));
      section.querySelector(".var-grupos i").textContent = modo === "repartir" ? "amigos" : "por pacote";

      figure.replaceChildren();
      if (modo === "repartir") for (let i = 0; i < d; i++) figure.appendChild(box(Q, "is-q", `amigo ${i + 1}`));
      else for (let i = 0; i < Q; i++) figure.appendChild(box(d, "is-q", `pacote ${i + 1}`));
      if (R) figure.appendChild(box(R, "is-r", "sobra"));
      math(eq, `\\displaystyle ${tone(D, 2)} = ${tone(d, 5)} \\times ${tone(Q, 1)} + ${tone(R, 3)}`);

      const parts = [];
      if (modo === "repartir") {
        parts.push(`<p><strong>${pl(D, "bala", "balas")}</strong> repartidas igualmente entre <strong>${pl(d, "amigo", "amigos")}</strong>: cada um recebe <strong>${fmt(Q)}</strong> e ${R === 1 ? "sobra" : "sobram"} <strong>${fmt(R)}</strong>.</p>`);
        if (D < d && D > 0) parts.push(`<p>Há menos balas que amigos: não dá nem uma para cada. O quociente é 0 e tudo sobra.</p>`);
      } else {
        parts.push(`<p>Com <strong>${pl(D, "bala", "balas")}</strong>, quantos pacotes de <strong>${fmt(d)}</strong> dá para montar? <strong>${pl(Q, "pacote", "pacotes")}</strong>, e ${R === 1 ? "sobra" : "sobram"} <strong>${fmt(R)}</strong>.</p>`);
        parts.push(`<p>É a outra leitura da divisão: <strong>quantas vezes o ${fmt(d)} cabe no ${fmt(D)}</strong>. É essa pergunta que a conta armada faz a cada passo.</p>`);
      }
      parts.push(R === 0
        ? `<p>Não sobrou nada: a divisão é <strong>exata</strong>, e se diz que ${fmt(D)} é <strong>divisível</strong> por ${fmt(d)}.</p>`
        : `<p>O resto é sempre <strong>menor que o divisor</strong>: se sobrassem ${fmt(d)} ou mais, dava para ${modo === "repartir" ? "mais uma rodada, uma bala para cada amigo" : "montar mais um pacote"}.</p>`);
      text.innerHTML = parts.join("");
      saveParams({ total: D, grupos: d, modo });
    }

    modeBtns.forEach(b => b.addEventListener("click", () => { modo = b.dataset.modo; draw(); }));
    section.addEventListener("input", draw);
    draw();
  }

  /* ---------------------------------------------------------------- a conta armada */

  // Tons: dividendo 2, quociente 1, resto 3, produto 4, divisor 5.
  function build(D, d, casasPedidas, cima) {
    const ds = String(D).split("").map(Number);
    const L = ds.length;
    // Não reserva casas que a conta não vai usar: 85 ÷ 4 para em 21,25.
    let casas = 0;
    for (let r = D % d; r && casas < casasPedidas; casas++) r = r * 10 % d;
    const n = L + casas;
    const dig = j => (j < L ? ds[j] : 0);
    // Coluna 1 da grade: o divisor (em cima) e os sinais de menos.
    const col = j => 2 + j + (casas && j >= L ? 1 : 0);
    const commaCol = 2 + L;
    const lastCol = col(n - 1);

    const cells = [], frames = [];
    const cell = (row, c, text, kind, parent) => {
      cells.push({ row, col: c, text, kind, parent });
      return cells.length - 1;
    };
    const frame = (tag, html, show = [], hl = [], extra = {}) => frames.push({ tag, html, show, hl, ...extra });
    const tones = (ids, t) => ids.map(id => [id, t]);

    const dvdRow = cima ? 2 : 1;
    const divId = cell(dvdRow, cima ? 1 : lastCol + 1, String(d), "divisor");
    const dvdIds = ds.map((x, j) => cell(dvdRow, col(j), String(x), "dividendo"));
    const setup = [divId, ...dvdIds];
    if (cima) setup.push(cell(2, `2 / ${lastCol + 1}`, "", "barra"));
    const qbox = cima ? null : cell(2, lastCol + 1, "", "qbox");
    if (!cima) setup.push(qbox);
    const qCell = (j, text) => (cima ? cell(1, col(j), text, "quociente") : cell(null, null, text, "quociente", qbox));

    frame("Monta", cima
      ? `Monte a conta: o dividendo, ${D}, embaixo da barra; o divisor, ${d}, do lado de fora, à esquerda. O quociente vai ser escrito em cima, algarismo por algarismo.`
      : `Monte a conta: o dividendo, ${D}, à esquerda; o divisor, ${d}, dentro da chave. O quociente vai ser escrito embaixo do divisor, algarismo por algarismo.`,
      setup, [[divId, 5], ...tones(dvdIds, 2)]);

    // O primeiro pedaço: o menor começo do dividendo em que o divisor cabe.
    let j = 0, p = ds[0];
    const antes = [];
    while (p < d && j < L - 1) { antes.push(p); p = p * 10 + ds[++j]; }
    let partIds = dvdIds.slice(0, j + 1);
    frame("Separa", p < d
      ? `O dividendo inteiro, ${D}, é menor que o divisor, ${d}: o ${d} cabe 0 vezes nele${casas ? ", e a conta continua depois da vírgula" : ""}.`
      : antes.length
        ? `Comece pela esquerda. O ${d} não cabe em ${antes.join(" nem em ")}, então pegue mais algarismos: em ${p} ele já cabe. Esse é o primeiro pedaço a dividir.`
        : `Comece pela esquerda, pelo primeiro algarismo: ${p}. O ${d} cabe no ${p}, então esse é o primeiro pedaço a dividir.`,
      [], [[divId, 5], ...tones(partIds, 2)]);

    let curRow = dvdRow, first = true, explicou = false;
    const qIds = [];
    for (;;) {
      const q = Math.floor(p / d), prod = q * d, r = p - prod;
      const qi = qCell(j, String(q));
      qIds.push(qi);
      frame("Divide", q
        ? `Quantas vezes o ${d} cabe em ${p}? Pela tabuada do ${d}: ${d} × ${q} = ${prod} cabe; ${d} × ${q + 1} = ${prod + d} já passa de ${p}. Então cabe ${q} ${q === 1 ? "vez" : "vezes"}: escreva ${q} no quociente.`
        : first
          ? `O ${d} cabe 0 vezes em ${p}: escreva 0 no quociente.`
          : `Quantas vezes o ${d} cabe em ${p}? Nenhuma: ${d} é maior que ${p}. Escreva <strong>0</strong> no quociente — o zero é obrigatório, ele segura o lugar dessa casa — e passe direto para baixar o próximo.`,
        [qi], [...tones(partIds, 2), [qi, 1], [divId, 5]], { tab: { p, q } });

      if (q || first) {
        const ps = String(prod), start = j - ps.length + 1;
        let mc = col(start) - 1;
        const prodRow = curRow + 1;
        // Sinal fora da coluna estreita da vírgula; o traço passa por ela.
        const fio = casas && mc === commaCol ? [cell(prodRow, mc--, "", "menos")] : [];
        const minus = cell(prodRow, mc, "−", "menos");
        const prodIds = ps.split("").map((c, k) => cell(prodRow, col(start + k), c, "produto"));
        frame("Multiplica", `Multiplique o algarismo que entrou no quociente pelo divisor: ${q} × ${d} = ${prod}. Escreva ${prod} embaixo do ${p}, alinhado pela direita.`,
          [minus, ...fio, ...prodIds], [[qi, 1], [divId, 5], ...tones(prodIds, 4)]);

        const rs = String(r), rstart = j - rs.length + 1;
        curRow = prodRow + 1;
        const remIds = rs.split("").map((c, k) => cell(curRow, col(rstart + k), c, "resto"));
        frame("Subtrai", `Subtraia: ${p} − ${prod} = ${r}.${explicou ? "" : ` O que sobra tem de ser menor que o divisor (${r} < ${d}); se não fosse, o ${d} caberia mais uma vez e o algarismo do quociente estaria pequeno demais.`}`,
          remIds, [...tones(partIds, 2), ...tones(prodIds, 4), ...tones(remIds, 3)]);
        explicou = true;
        partIds = remIds;
      }
      first = false;

      if (j + 1 >= n) {
        const Q = Math.floor(D * 10 ** casas / d);
        const Qs = decStr(Q, casas), Rs = decStr(r, casas);
        const exata = r === 0;
        const prova = `Prova real: ${d} × ${Qs}${exata ? "" : ` + ${Rs}`} = ${D}.`;
        frame("Fim", casas
          ? `${exata ? `A divisão deu exata com ${pl(casas, "casa decimal", "casas decimais")}` : `Parando em ${pl(casas, "casa decimal", "casas decimais")}`}: quociente <strong>${Qs}</strong>${exata ? "" : `, resto <strong>${Rs}</strong> (o ${r} que sobrou está na casa dos ${CASA[casas]})`}. ${prova}`
          : `Não há mais algarismos para baixar: acabou. Quociente <strong>${Qs}</strong>, resto <strong>${Rs}</strong>${exata ? " — divisão exata" : ""}. ${prova}`,
          [], [[divId, 5], ...tones(dvdIds, 2), ...tones(qIds, 1), ...tones(partIds, 3)], { fim: true });
        return { cells, frames, cols: lastCol + (cima ? 0 : 1), casas, comma: casas ? commaCol : 0, Q: Qs, R: Rs };
      }

      j++;
      const x = dig(j);
      const bId = cell(curRow, col(j), String(x), "baixa");
      const show = [bId];
      if (j === L) {
        const ci = cima ? cell(1, commaCol, ",", "quociente") : qCell(null, ",");
        qIds.push(ci);
        show.push(ci);
      }
      const novo = r * 10 + x;
      frame("Baixa", j < L
        ? `Baixe o próximo algarismo do dividendo, o ${x}, para o lado do ${r}: o número da vez agora é ${novo}.`
        : j === L
          ? `Os algarismos do dividendo acabaram, mas sobrou ${r}. Como ${D} = ${D},000…, dá para continuar: ponha uma <strong>vírgula</strong> no quociente e baixe um zero. O ${r} vira ${novo}.`
          : `Baixe mais um zero: o ${r} vira ${novo}.`,
        show, [...tones(partIds, 2), [bId, 2], ...(j < L ? [[dvdIds[j], 2]] : []), ...(j === L ? [[show[1], 1]] : [])]);
      partIds = [...partIds, bId];
      p = novo;
    }
  }

  // Desenha a grade e devolve show(k), que mostra o quadro k.
  function grid(box, b, cima) {
    const g = el("div", `ld ${cima ? "is-cima" : "is-chave"}`);
    const cols = ["auto"];
    for (let c = 2; c <= b.cols; c++) cols.push(c === b.comma ? ".3em" : "auto");
    g.style.gridTemplateColumns = cols.join(" ");
    const nodes = b.cells.map(c => {
      const e = el("span", `ld-cell ld-${c.kind}`, c.text);
      if (c.parent == null) {
        e.style.gridRow = c.row;
        e.style.gridColumn = c.col;
        g.appendChild(e);
      }
      return e;
    });
    b.cells.forEach((c, i) => { if (c.parent != null) nodes[c.parent].appendChild(nodes[i]); });
    // O traço de subtrair vai embaixo do produto e do sinal de menos.
    b.cells.forEach((c, i) => { if (c.kind === "produto" || c.kind === "menos") nodes[i].classList.add("is-line"); });
    box.replaceChildren(g);

    return k => {
      const vis = new Set();
      b.frames.slice(0, k + 1).forEach(f => f.show.forEach(id => vis.add(id)));
      const hl = new Map(b.frames[k].hl);
      nodes.forEach((e, i) => {
        const c = b.cells[i];
        if (c.parent != null) e.hidden = !vis.has(i);
        else e.classList.toggle("is-off", !vis.has(i));
        e.classList.toggle("is-hl", hl.has(i));
        if (hl.has(i)) e.dataset.tone = hl.get(i);
        else delete e.dataset.tone;
      });
    };
  }

  const readInt = (s, max) => (new RegExp(`^\\s*\\d{1,${max}}\\s*$`).test(s) ? Number(s.trim()) : NaN);

  function initConta(section) {
    const inD = section.querySelector("input[name=dividendo]");
    const ind = section.querySelector("input[name=divisor]");
    const inC = section.querySelector("select[name=casas]");
    const fmtBtns = section.querySelectorAll("[data-formato]");
    const result = section.querySelector(".calc-result");
    const box = section.querySelector(".ld-box");
    const tag = section.querySelector(".ld-tags");
    const say = section.querySelector(".ld-say");
    const count = section.querySelector(".ld-count");
    const tab = section.querySelector(".ld-tab");
    const all = section.querySelector(".ld-all");
    const note = section.querySelector(".calc-note");
    const nav = {};
    section.querySelectorAll("[data-nav]").forEach(btn => { nav[btn.dataset.nav] = btn; });

    const q = new URLSearchParams(location.search);
    if (q.has("dividendo")) inD.value = q.get("dividendo");
    if (q.has("divisor")) ind.value = q.get("divisor");
    if (["0", "1", "2", "3", "4"].includes(q.get("casas"))) inC.value = q.get("casas");
    let cima = q.get("formato") !== "chave";
    let b = null, show = null, k = 0;

    function go(to) {
      if (!b) return;
      k = Math.max(0, Math.min(b.frames.length - 1, to));
      const f = b.frames[k];
      show(k);
      tag.querySelectorAll("span").forEach(s => s.classList.toggle("is-on", s.dataset.tag === f.tag));
      say.innerHTML = f.html;
      count.textContent = `Passo ${k + 1} de ${b.frames.length}`;
      nav.first.disabled = nav.prev.disabled = k === 0;
      nav.next.disabled = nav.last.disabled = k === b.frames.length - 1;
      // A tabuada do divisor, acesa só quando a pergunta é "quantas vezes cabe?".
      tab.querySelectorAll("li").forEach((li, i) => {
        const m = i + 1;
        li.className = !f.tab ? "" : m === f.tab.q ? "is-best" : m * Number(li.dataset.d) <= f.tab.p ? "is-common" : "is-past";
      });
      all.querySelectorAll("li").forEach((li, i) => li.classList.toggle("is-on", i === k));
    }

    function update() {
      const D = readInt(inD.value, 9), d = readInt(ind.value, 5), casas = Number(inC.value);
      fmtBtns.forEach(btn => btn.setAttribute("aria-pressed", (btn.dataset.formato === "cima") === cima));
      saveParams({ dividendo: inD.value.trim(), divisor: ind.value.trim(), casas, formato: cima ? "cima" : "chave" });
      inD.setAttribute("aria-invalid", Number.isNaN(D));
      ind.setAttribute("aria-invalid", Number.isNaN(d) || d === 0);
      const err = Number.isNaN(D) ? "Digite um dividendo inteiro, sem sinal, com até 9 algarismos."
        : Number.isNaN(d) ? "Digite um divisor inteiro, sem sinal, com até 5 algarismos."
          : d === 0 ? `Não existe divisão por zero: nenhum número vezes 0 dá ${D}. Não é que o resultado seja grande demais — é que a pergunta “quantas vezes o 0 cabe?” não tem resposta.`
            : "";
      section.classList.toggle("has-error", !!err);
      if (err) {
        b = null;
        result.textContent = "";
        box.replaceChildren();
        all.replaceChildren();
        note.textContent = err;
        return;
      }
      b = build(D, d, casas, cima);
      show = grid(box, b, cima);
      math(result, `${tone(D, 2)} \\div ${tone(d, 5)} = ${tone(b.Q.replace(",", "{,}"), 1)}${b.R === "0" || /^0,0*$/.test(b.R) ? "" : `\\ \\ \\text{resto } ${tone(b.R.replace(",", "{,}"), 3)}`}`);
      tab.replaceChildren(...Array.from({ length: 9 }, (_, i) => {
        const li = el("li", null, `${d} × ${i + 1} = ${d * (i + 1)}`);
        li.dataset.d = d;
        return li;
      }));
      all.replaceChildren(...b.frames.map((f, i) => {
        const li = el("li");
        const btn = el("button");
        btn.type = "button";
        btn.innerHTML = `<b>${f.tag}.</b> ${f.html}`;
        btn.addEventListener("click", () => go(i));
        li.appendChild(btn);
        return li;
      }));
      note.innerHTML = casas && b.casas < casas
        ? `A divisão ficou exata antes das ${casas} casas pedidas: não há o que continuar.`
        : casas && !/^0,0*$/.test(b.R) ? `Quer saber se os decimais se repetem para sempre? <a href="fracoes.html?conv=${D}/${d}#converter">Converta ${D}/${d} em decimal →</a>` : "";
      go(0);
    }

    fmtBtns.forEach(btn => btn.addEventListener("click", () => {
      cima = btn.dataset.formato === "cima";
      const keep = k;
      update();
      go(keep);
    }));
    nav.first.addEventListener("click", () => go(0));
    nav.prev.addEventListener("click", () => go(k - 1));
    nav.next.addEventListener("click", () => go(k + 1));
    nav.last.addEventListener("click", () => go(Infinity));
    section.querySelectorAll("[data-exemplo]").forEach(btn => btn.addEventListener("click", () => {
      [inD.value, ind.value, inC.value] = btn.dataset.exemplo.split(";");
      update();
    }));
    inD.addEventListener("input", update);
    ind.addEventListener("input", update);
    inC.addEventListener("change", update);
    update();
  }

  // As duas montagens de 85 ÷ 3 já resolvidas, com as partes pintadas.
  function initAnatomia(section) {
    section.querySelectorAll(".ld-box[data-formato]").forEach(box => {
      const cima = box.dataset.formato === "cima";
      const b = build(85, 3, 0, cima);
      grid(box, b, cima)(b.frames.length - 1);
    });
  }

  Licao.renderTex();
  const share = document.querySelector(".share");
  if (share) initShare(share);
  const anat = document.querySelector("#partes");
  if (anat) initAnatomia(anat);
  const conta = document.querySelector("#conta");
  if (conta) initConta(conta);
})();
