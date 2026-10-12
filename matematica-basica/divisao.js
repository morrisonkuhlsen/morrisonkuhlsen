/* Divisão: a partilha do início (repartir e agrupar), a conta em que se
 * clica nas partes e a conta armada passo a passo — divide, multiplica,
 * subtrai, baixa —, com o quociente em cima. Os utilitários vêm de licao.js.
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

  const CASA_INT = ["unidades", "dezenas", "centenas", "unidades de milhar", "dezenas de milhar", "centenas de milhar", "unidades de milhão", "dezenas de milhão", "centenas de milhão"];
  // Cada tipo de célula: nome, tom e o que vale para todas desse tipo.
  const KINDS = {
    dividendo: { nome: "Dividendo", tone: 2 },
    divisor: { nome: "Divisor", tone: 5 },
    quociente: { nome: "Quociente", tone: 1 },
    resto: { nome: "Resto", tone: 3 },
    produto: { nome: "Produto", tone: 4 },
    parcial: { nome: "Resto parcial", tone: 0 },
    baixa: { nome: "Algarismo baixado", tone: 2 },
  };

  // Tons: dividendo 2, quociente 1, resto 3, produto 4, divisor 5.
  // Cada célula leva kind (o tipo), group (as células que formam o mesmo
  // número, acesas juntas no clique) e info (a explicação desse número).
  function build(D, d, casasPedidas) {
    const ds = String(D).split("").map(Number);
    const L = ds.length;
    // Não reserva casas que a conta não vai usar: 85 ÷ 4 para em 21,25.
    let casas = 0;
    for (let r = D % d; r && casas < casasPedidas; casas++) r = r * 10 % d;
    const n = L + casas;
    const dig = j => (j < L ? ds[j] : 0);
    const casa = j => (j < L ? CASA_INT[L - 1 - j] || "casas altas" : CASA[j - L + 1]);
    // Coluna 1 da grade: o divisor e os sinais de menos.
    const col = j => 2 + j + (casas && j >= L ? 1 : 0);
    const commaCol = 2 + L;
    const lastCol = col(n - 1);
    const Q = Math.floor(D * 10 ** casas / d);
    const Qs = decStr(Q, casas);

    const cells = [], frames = [];
    const cell = (row, c, text, kind, group, info) => {
      cells.push({ row, col: c, text, kind, group, info });
      return cells.length - 1;
    };
    const frame = (tag, html, show = [], hl = [], extra = {}) => frames.push({ tag, html, show, hl, ...extra });
    const tones = (ids, t) => ids.map(id => [id, t]);

    const divId = cell(2, 1, String(d), "divisor", "divisor",
      `O número pelo qual se divide: em quantas partes o ${D} é repartido, ou o tamanho de cada grupo. Ele não muda durante a conta — é a tabuada dele que se consulta a cada passo.`);
    const dvdIds = ds.map((x, j) => cell(2, col(j), String(x), "dividendo", "dividendo",
      `O número que está sendo dividido. Este ${x} é o algarismo das ${casa(j)}; a conta usa os algarismos do dividendo da esquerda para a direita.`));
    const barra = cell(2, `2 / ${lastCol + 1}`, "", "barra");
    const qCell = (j, text, info) => cell(1, col(j), text, "quociente", "quociente", info);

    frame("Monta", `Monte a conta: o dividendo, ${D}, embaixo da barra; o divisor, ${d}, do lado de fora, à esquerda. O quociente vai ser escrito em cima, algarismo por algarismo.`,
      [divId, ...dvdIds, barra], [[divId, 5], ...tones(dvdIds, 2)]);

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

    let curRow = 2, first = true, explicou = false, passo = 0, lastRest = null;
    const qIds = [];
    for (;;) {
      const q = Math.floor(p / d), prod = q * d, r = p - prod;
      const qi = qCell(j, String(q), q
        ? `O resultado da divisão: ${Qs}. Este ${q} fica em cima das ${casa(j)} porque saiu da pergunta “quantas vezes o ${d} cabe em ${p}?” — cabe ${q} ${q === 1 ? "vez" : "vezes"}.`
        : `O resultado da divisão: ${Qs}. Este 0 está nas ${casa(j)}: o ${d} não cabe nenhuma vez em ${p}. Sem ele, os outros algarismos sairiam da casa certa.`);
      qIds.push(qi);
      frame("Divide", q
        ? `Quantas vezes o ${d} cabe em ${p}? Pela tabuada do ${d}: ${d} × ${q} = ${prod} cabe; ${d} × ${q + 1} = ${prod + d} já passa de ${p}. Então cabe ${q} ${q === 1 ? "vez" : "vezes"}: escreva ${q} no quociente.`
        : first
          ? `O ${d} cabe 0 vezes em ${p}: escreva 0 no quociente.`
          : `Quantas vezes o ${d} cabe em ${p}? Nenhuma: ${d} é maior que ${p}. Escreva <strong>0</strong> no quociente — o zero é obrigatório, ele segura o lugar dessa casa — e passe direto para baixar o próximo.`,
        [qi], [...tones(partIds, 2), [qi, 1], [divId, 5]], { tab: { p, q } });

      if (q || first) {
        passo++;
        const ps = String(prod), start = j - ps.length + 1;
        let mc = col(start) - 1;
        const prodRow = curRow + 1;
        const pinfo = `${d} × ${q} = ${prod}: o divisor vezes o algarismo ${q} do quociente. É o quanto foi repartido neste passo, e sai do ${p} logo acima pela subtração.`;
        // Sinal fora da coluna estreita da vírgula; o traço passa por ela.
        const fio = casas && mc === commaCol ? [cell(prodRow, mc--, "", "produto", `p${passo}`, pinfo)] : [];
        const minus = cell(prodRow, mc, "−", "produto", `p${passo}`, pinfo);
        const prodIds = ps.split("").map((c, k) => cell(prodRow, col(start + k), c, "produto", `p${passo}`, pinfo));
        frame("Multiplica", `Multiplique o algarismo que entrou no quociente pelo divisor: ${q} × ${d} = ${prod}. Escreva ${prod} embaixo do ${p}, alinhado pela direita.`,
          [minus, ...fio, ...prodIds], [[qi, 1], [divId, 5], ...tones(prodIds, 4)]);

        const rs = String(r), rstart = j - rs.length + 1;
        curRow = prodRow + 1;
        const remIds = rs.split("").map((c, k) => cell(curRow, col(rstart + k), c, "parcial", `r${passo}`,
          `${p} − ${prod} = ${r}: o que sobrou neste passo. É menor que o divisor ${d} — senão caberia mais uma vez — e passa para a casa seguinte, junto com o próximo algarismo.`));
        frame("Subtrai", `Subtraia: ${p} − ${prod} = ${r}.${explicou ? "" : ` O que sobra tem de ser menor que o divisor (${r} < ${d}); se não fosse, o ${d} caberia mais uma vez e o algarismo do quociente estaria pequeno demais.`}`,
          remIds, [...tones(partIds, 2), ...tones(prodIds, 4), ...tones(remIds, 3)]);
        explicou = true;
        partIds = remIds;
      }
      first = false;

      if (j + 1 >= n) {
        const Rs = decStr(r, casas);
        const exata = r === 0;
        // As células do último número são o resto final.
        partIds.forEach(id => Object.assign(cells[id], {
          kind: "resto", group: "resto",
          info: exata
            ? `Sobrou 0: a divisão é exata, e ${D} é divisível por ${d}${casas ? ` com ${pl(casas, "casa decimal", "casas decimais")}` : ""}.`
            : `O que sobrou no fim, sem dar para repartir: ${Rs}${casas ? ` (o ${r} está na casa dos ${CASA[casas]})` : ""}. É sempre menor que o divisor. Prova real: ${d} × ${Qs} + ${Rs} = ${D}.`,
        }));
        const prova = `Prova real: ${d} × ${Qs}${exata ? "" : ` + ${Rs}`} = ${D}.`;
        frame("Fim", casas
          ? `${exata ? `A divisão deu exata com ${pl(casas, "casa decimal", "casas decimais")}` : `Parando em ${pl(casas, "casa decimal", "casas decimais")}`}: quociente <strong>${Qs}</strong>${exata ? "" : `, resto <strong>${Rs}</strong> (o ${r} que sobrou está na casa dos ${CASA[casas]})`}. ${prova}`
          : `Não há mais algarismos para baixar: acabou. Quociente <strong>${Qs}</strong>, resto <strong>${Rs}</strong>${exata ? " — divisão exata" : ""}. ${prova}`,
          [], [[divId, 5], ...tones(dvdIds, 2), ...tones(qIds, 1), ...tones(partIds, 3)], { fim: true });
        return { cells, frames, cols: lastCol, comma: casas ? commaCol : 0, casas, Q: Qs, R: Rs, D, d };
      }

      j++;
      const x = dig(j);
      const novo = r * 10 + x;
      const bId = cell(curRow, col(j), String(x), "baixa", `b${j}`, j < L
        ? `Este ${x} desceu do dividendo (é o algarismo das ${casa(j)}) e se juntou ao ${r} que tinha sobrado: forma ${novo}, o próximo número a dividir.`
        : `Um zero acrescentado depois da vírgula (${D} = ${D},000…). Junto ao ${r} que sobrou, forma ${novo}: são ${CASA[j - L + 1]} sendo repartidos.`);
      const show = [bId];
      if (j === L) {
        const ci = qCell(null, ",", `A vírgula do quociente entrou quando os algarismos do dividendo acabaram e a conta seguiu com zeros. Daqui para a direita são décimos, centésimos, milésimos…`);
        cells[ci].col = commaCol;
        qIds.push(ci);
        show.push(ci);
      }
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

  // Desenha a grade. Devolve show(k), que mostra o quadro k, e pick(teste),
  // que contorna as células visíveis que passam no teste. Clicar num
  // número chama onPick com a célula.
  function grid(box, b, onPick) {
    const g = el("div", "ld");
    const cols = ["auto"];
    for (let c = 2; c <= b.cols; c++) cols.push(c === b.comma ? ".3em" : "auto");
    g.style.gridTemplateColumns = cols.join(" ");
    const nodes = b.cells.map((c, i) => {
      const e = el("span", `ld-cell ld-${c.kind}`, c.text);
      e.style.gridRow = c.row;
      e.style.gridColumn = c.col;
      if (c.kind === "produto") e.classList.add("is-line");
      if (c.info && c.text) {
        e.tabIndex = 0;
        e.setAttribute("role", "button");
        e.setAttribute("aria-label", `${c.text}: ${KINDS[c.kind].nome.toLowerCase()}`);
        e.dataset.i = i;
      }
      g.appendChild(e);
      return e;
    });
    box.replaceChildren(g);

    const choose = e => {
      const t = e.target.closest("[data-i]");
      if (t && !t.classList.contains("is-off")) onPick(b.cells[t.dataset.i]);
    };
    g.addEventListener("click", choose);
    g.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); choose(e); }
    });

    return {
      show(k) {
        const vis = new Set();
        b.frames.slice(0, k + 1).forEach(f => f.show.forEach(id => vis.add(id)));
        const hl = new Map(b.frames[k].hl);
        nodes.forEach((e, i) => {
          e.classList.toggle("is-off", !vis.has(i));
          e.classList.toggle("is-hl", hl.has(i));
          if (hl.has(i)) e.dataset.tone = hl.get(i);
          else delete e.dataset.tone;
        });
      },
      pick(test) {
        nodes.forEach((e, i) => {
          const c = b.cells[i];
          const on = !!test && !!c.info && test(c) && !e.classList.contains("is-off");
          e.classList.toggle("is-pick", on);
          if (on) e.style.setProperty("--pk", `var(--tone-${KINDS[c.kind].tone})`);
        });
      },
    };
  }

  // O quadro com o nome e a explicação do número clicado.
  function say(panel, kind, text, value) {
    const k = KINDS[kind];
    panel.dataset.tone = k.tone;
    panel.replaceChildren(el("strong", null, value == null ? k.nome : `${k.nome} — ${value}`), el("p", null, text));
  }
  const valueOf = (b, c) => ({ dividendo: b.D, divisor: b.d, quociente: b.Q, resto: b.R })[c.kind]
    ?? b.cells.filter(x => x.group === c.group && x.text !== "−").map(x => x.text).join("");

  const readInt = (s, max) => (new RegExp(`^\\s*\\d{1,${max}}\\s*$`).test(s) ? Number(s.trim()) : NaN);
  function readPair(inD, ind) {
    const D = readInt(inD.value, 9), d = readInt(ind.value, 5);
    inD.setAttribute("aria-invalid", Number.isNaN(D));
    ind.setAttribute("aria-invalid", Number.isNaN(d) || d === 0);
    const err = Number.isNaN(D) ? "Digite um dividendo inteiro, sem sinal, com até 9 algarismos."
      : Number.isNaN(d) ? "Digite um divisor inteiro, sem sinal, com até 5 algarismos."
        : d === 0 ? `Não existe divisão por zero: nenhum número vezes 0 dá ${D}. Não é que o resultado seja grande demais — é que a pergunta “quantas vezes o 0 cabe?” não tem resposta.`
          : "";
    return { D, d, err };
  }

  /* ---------------------------------------------------------------- as partes */

  // A conta pronta, para clicar nos números; estado em ?a=&b=.
  function initPartes(section) {
    const inD = section.querySelector("input[name=a]");
    const ind = section.querySelector("input[name=b]");
    const box = section.querySelector(".ld-box");
    const info = section.querySelector(".ld-info");
    const terms = section.querySelector(".terms");
    const prova = section.querySelector(".prova");
    const note = section.querySelector(".calc-note");
    const q = new URLSearchParams(location.search);
    if (q.has("a")) inD.value = q.get("a");
    if (q.has("b")) ind.value = q.get("b");
    let b = null, view = null;

    const blank = () => {
      delete info.dataset.tone;
      info.replaceChildren(el("p", "ld-hint", "Clique em qualquer número da conta — ou num dos cartões abaixo — para ver o nome dele."));
      terms.querySelectorAll("button").forEach(t => t.setAttribute("aria-pressed", "false"));
    };

    function update() {
      const { D, d, err } = readPair(inD, ind);
      saveParams({ a: inD.value.trim(), b: ind.value.trim() });
      section.classList.toggle("has-error", !!err);
      note.textContent = err;
      if (err) { b = null; box.replaceChildren(); terms.replaceChildren(); prova.textContent = ""; return; }
      b = build(D, d, 0);
      view = grid(box, b, c => {
        view.pick(x => x.group === c.group);
        say(info, c.kind, c.info, valueOf(b, c));
        terms.querySelectorAll("button").forEach(t => t.setAttribute("aria-pressed", t.dataset.kind === c.kind));
      });
      view.show(b.frames.length - 1);

      const R = Number(b.R);
      const cards = [
        ["dividendo", D, "O que vai ser repartido."],
        ["divisor", d, "Em quantas partes se reparte, ou o tamanho de cada grupo."],
        ["quociente", b.Q, "Quanto cabe em cada parte: o resultado da divisão."],
        ["resto", b.R, R ? `O que sobra no fim. Sempre menor que o divisor.` : "Deu 0: a divisão é exata."],
        ["produto", null, "O divisor vezes cada algarismo do quociente: o que se reparte em cada passo."],
        ["parcial", null, "O que sobra em cada passo e desce para a casa seguinte."],
      ];
      terms.replaceChildren(...cards.filter(([k]) => b.cells.some(c => c.kind === k)).map(([k, v, txt]) => {
        const t = el("button", null);
        t.type = "button";
        t.dataset.kind = k;
        t.dataset.tone = KINDS[k].tone;
        t.setAttribute("aria-pressed", "false");
        t.append(el("strong", null, v == null ? (k === "produto" ? "Produtos" : "Restos parciais") : `${KINDS[k].nome} — ${v}`), el("span", null, txt));
        t.addEventListener("click", () => {
          view.pick(x => x.kind === k || (k === "parcial" && x.kind === "baixa"));
          say(info, k, txt, v);
          terms.querySelectorAll("button").forEach(o => o.setAttribute("aria-pressed", o === t));
        });
        return t;
      }));
      math(prova, `\\displaystyle ${tone(D, 2)} = ${tone(d, 5)} \\times ${tone(b.Q, 1)} + ${tone(b.R, 3)}`);
      view.pick(null);
      blank();
    }

    section.querySelectorAll("[data-exemplo]").forEach(btn => btn.addEventListener("click", () => {
      [inD.value, ind.value] = btn.dataset.exemplo.split(";");
      update();
    }));
    inD.addEventListener("input", update);
    ind.addEventListener("input", update);
    update();
  }

  /* ---------------------------------------------------------------- passo a passo */

  function initConta(section) {
    const inD = section.querySelector("input[name=dividendo]");
    const ind = section.querySelector("input[name=divisor]");
    const inC = section.querySelector("select[name=casas]");
    const result = section.querySelector(".calc-result");
    const box = section.querySelector(".ld-box");
    const info = section.querySelector(".ld-info");
    const tag = section.querySelector(".ld-tags");
    const sayEl = section.querySelector(".ld-say");
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
    let b = null, view = null, k = 0;

    const blank = () => { info.hidden = true; view.pick(null); };

    function go(to) {
      if (!b) return;
      k = Math.max(0, Math.min(b.frames.length - 1, to));
      const f = b.frames[k];
      view.show(k);
      blank();
      tag.querySelectorAll("span").forEach(s => s.classList.toggle("is-on", s.dataset.tag === f.tag));
      sayEl.innerHTML = f.html;
      count.textContent = `Passo ${k + 1} de ${b.frames.length}`;
      nav.first.disabled = nav.prev.disabled = k === 0;
      nav.next.disabled = nav.last.disabled = k === b.frames.length - 1;
      // A tabuada do divisor, acesa só quando a pergunta é "quantas vezes cabe?".
      tab.querySelectorAll("li").forEach((li, i) => {
        const m = i + 1;
        li.className = !f.tab ? "" : m === f.tab.q ? "is-best" : m * b.d <= f.tab.p ? "is-common" : "is-past";
      });
      all.querySelectorAll("li").forEach((li, i) => li.classList.toggle("is-on", i === k));
    }

    function update() {
      const { D, d, err } = readPair(inD, ind);
      const casas = Number(inC.value);
      saveParams({ dividendo: inD.value.trim(), divisor: ind.value.trim(), casas });
      section.classList.toggle("has-error", !!err);
      if (err) {
        b = null;
        result.textContent = "";
        box.replaceChildren();
        all.replaceChildren();
        note.textContent = err;
        return;
      }
      b = build(D, d, casas);
      view = grid(box, b, c => {
        view.pick(x => x.group === c.group);
        info.hidden = false;
        say(info, c.kind, c.info, valueOf(b, c));
      });
      math(result, `${tone(D, 2)} \\div ${tone(d, 5)} = ${tone(b.Q.replace(",", "{,}"), 1)}${/^0(,0*)?$/.test(b.R) ? "" : `\\ \\ \\text{resto } ${tone(b.R.replace(",", "{,}"), 3)}`}`);
      tab.replaceChildren(...Array.from({ length: 9 }, (_, i) => el("li", null, `${d} × ${i + 1} = ${d * (i + 1)}`)));
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

  Licao.renderTex();
  const share = document.querySelector(".share");
  if (share) initShare(share);
  const partes = document.querySelector("#partes");
  if (partes) initPartes(partes);
  const conta = document.querySelector("#conta");
  if (conta) initConta(conta);
})();
