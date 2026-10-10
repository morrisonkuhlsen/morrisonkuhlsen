/* Conjuntos: o diagrama de Venn em que se clica nas regiões, o verificador
 * de leis com dois diagramas lado a lado e os cards de contagem (licao.js).
 *
 * Uma região é a combinação de "dentro/fora" de cada conjunto, escrita como
 * texto: "10" = em A e fora de B; "011" = fora de A, em B e em C. Uma
 * seleção é um conjunto dessas chaves, e uma operação (A ∪ B, A − B…) é só
 * a lista das regiões em que ela é verdadeira.
 */
(() => {
  const { fmt, texNum, math, el, svg } = Licao;

  /* ---------------------------------------------------------------- geometria */

  const GEO = {
    2: {
      W: 360, H: 240,
      circles: [{ x: 140, y: 125, r: 80 }, { x: 220, y: 125, r: 80 }],
      labels: [{ x: 74, y: 52 }, { x: 286, y: 52 }],
      anchors: { "10": [95, 130], "11": [180, 130], "01": [265, 130], "00": [24, 32, "start"] },
    },
    3: {
      W: 360, H: 280,
      circles: [{ x: 145, y: 112, r: 75 }, { x: 215, y: 112, r: 75 }, { x: 180, y: 175, r: 75 }],
      labels: [{ x: 74, y: 50 }, { x: 286, y: 50 }, { x: 96, y: 240 }],
      anchors: {
        "100": [110, 98], "010": [250, 98], "001": [180, 225],
        "110": [180, 82], "101": [137, 168], "011": [223, 168],
        "111": [180, 136], "000": [24, 32, "start"],
      },
    },
  };
  const NAMES = ["A", "B", "C"];

  // Ordem das regiões nas listas: primeiro as "só X", depois as interseções.
  const REGIONS = {
    2: ["10", "11", "01", "00"],
    3: ["100", "010", "001", "110", "101", "011", "111", "000"],
  };
  const REGION_NAME = {
    "10": "só A", "11": "A e B", "01": "só B", "00": "fora dos dois",
    "100": "só A", "010": "só B", "001": "só C", "110": "A e B, não C",
    "101": "A e C, não B", "011": "B e C, não A", "111": "A, B e C", "000": "fora dos três",
  };

  // O exemplo com elementos: U = {1, …, 10}.
  const U = Array.from({ length: 10 }, (_, i) => i + 1);
  const MEMBER = [x => x % 2 === 0, x => x % 3 === 0, x => [2, 3, 5, 7].includes(x)];
  const keyOf = (x, n) => MEMBER.slice(0, n).map(f => (f(x) ? 1 : 0)).join("");

  let uid = 0;

  // Desenha um Venn de n conjuntos. Devolve o <svg> e set(seleção, hover).
  function venn(n, opts = {}) {
    const G = GEO[n], id = `v${uid++}`;
    const g = svg("svg", { viewBox: `0 0 ${G.W} ${G.H}`, class: "venn", role: opts.role || "img" });
    if (opts.label) g.setAttribute("aria-label", opts.label);
    const defs = svg("defs", {}, g);
    const uni = { x: 6, y: 6, width: G.W - 12, height: G.H - 12, rx: 10 };
    G.circles.forEach((c, i) => {
      const cp = svg("clipPath", { id: `${id}-c${i}` }, defs);
      svg("circle", { cx: c.x, cy: c.y, r: c.r }, cp);
    });

    svg("rect", { ...uni, class: "venn-universe" }, g);
    const regionEls = {};
    REGIONS[n].forEach(key => {
      // Fora dos conjuntos excluídos (máscara) e dentro dos incluídos (clip).
      const mask = svg("mask", { id: `${id}-m${key}` }, defs);
      svg("rect", { ...uni, fill: "#fff" }, mask);
      [...key].forEach((bit, i) => {
        if (bit === "0") svg("circle", { cx: G.circles[i].x, cy: G.circles[i].y, r: G.circles[i].r, fill: "#000" }, mask);
      });
      let node = svg("rect", { ...uni, mask: `url(#${id}-m${key})`, class: "venn-region" });
      [...key].forEach((bit, i) => {
        if (bit === "1") {
          const wrap = svg("g", { "clip-path": `url(#${id}-c${i})` });
          wrap.appendChild(node);
          node = wrap;
        }
      });
      g.appendChild(node);
      regionEls[key] = node.tagName === "rect" ? node : node.querySelector("rect");
    });

    G.circles.forEach(c => svg("circle", { cx: c.x, cy: c.y, r: c.r, class: "venn-circle" }, g));
    G.labels.forEach((p, i) => {
      const t = svg("text", { x: p.x, y: p.y, class: "venn-name", "text-anchor": "middle" }, g);
      t.textContent = NAMES[i];
    });
    const ut = svg("text", { x: G.W - 16, y: G.H - 14, class: "venn-name is-u", "text-anchor": "end" }, g);
    ut.textContent = "U";

    // Textos por região: elementos ou contagens.
    const textLayer = svg("g", { class: "venn-texts" }, g);
    function writeTexts(byRegion) {
      textLayer.replaceChildren();
      for (const [key, items] of Object.entries(byRegion)) {
        const [ax, ay, anchor] = G.anchors[key];
        const step = 18, start = anchor === "start" ? ax : ax - (items.length - 1) * step / 2;
        items.forEach((txt, i) => {
          const t = svg("text", { x: start + i * step, y: ay + 5, class: `venn-el${opts.big ? " is-big" : ""}`, "text-anchor": "middle" }, textLayer);
          t.textContent = txt;
        });
      }
    }

    function set(selected, hover) {
      for (const [key, r] of Object.entries(regionEls)) {
        r.classList.toggle("is-on", selected.has(key));
        r.classList.toggle("is-hover", key === hover && !selected.has(key));
      }
    }

    // Qual região está sob o ponteiro (ou null fora do universo).
    function regionAt(evt) {
      const pt = g.createSVGPoint();
      pt.x = evt.clientX; pt.y = evt.clientY;
      const p = pt.matrixTransform(g.getScreenCTM().inverse());
      if (p.x < uni.x || p.y < uni.y || p.x > uni.x + uni.width || p.y > uni.y + uni.height) return null;
      return G.circles.map(c => (Math.hypot(p.x - c.x, p.y - c.y) <= c.r ? 1 : 0)).join("");
    }

    return { svg: g, set, regionAt, writeTexts };
  }

  /* ---------------------------------------------------------------- operações conhecidas */

  // tex, nome, leitura e a função que diz se uma região está dentro.
  const OPS = {
    2: [
      ["\\varnothing", "conjunto vazio", "Nenhuma região selecionada.", () => false],
      ["U", "universo", "Tudo: todos os elementos considerados.", () => true],
      ["A", "o conjunto A", "Os elementos de A, estejam ou não em B.", (a) => a],
      ["B", "o conjunto B", "Os elementos de B, estejam ou não em A.", (a, b) => b],
      ["A \\cup B", "união", "Está em A ou em B — ou nos dois: esse “ou” é inclusivo.", (a, b) => a || b],
      ["A \\cap B", "interseção", "Está em A e em B ao mesmo tempo.", (a, b) => a && b],
      ["A - B", "diferença", "Está em A, mas não em B: “só A”.", (a, b) => a && !b],
      ["B - A", "diferença", "Está em B, mas não em A: “só B”.", (a, b) => b && !a],
      ["A \\,\\triangle\\, B", "diferença simétrica", "Está em um dos dois, mas não nos dois: o “ou” exclusivo.", (a, b) => a !== b],
      ["A^c", "complemento de A", "Tudo o que não está em A.", (a) => !a],
      ["B^c", "complemento de B", "Tudo o que não está em B.", (a, b) => !b],
      ["(A \\cup B)^c = A^c \\cap B^c", "nenhum dos dois", "Não está em A e não está em B (lei de De Morgan).", (a, b) => !a && !b],
      ["(A \\cap B)^c = A^c \\cup B^c", "complemento da interseção", "Não está nos dois ao mesmo tempo (lei de De Morgan).", (a, b) => !(a && b)],
      ["A \\cup B^c", "A ou fora de B", "Está em A ou não está em B: tudo menos o “só B”.", (a, b) => a || !b],
      ["A^c \\cup B", "B ou fora de A", "Está em B ou não está em A: tudo menos o “só A”.", (a, b) => b || !a],
      ["(A \\,\\triangle\\, B)^c", "os dois ou nenhum", "Está nos dois conjuntos ou em nenhum deles.", (a, b) => a === b],
    ],
    3: [
      ["\\varnothing", "conjunto vazio", "Nenhuma região selecionada.", () => false],
      ["U", "universo", "Tudo: todos os elementos considerados.", () => true],
      ["A", "o conjunto A", "Os elementos de A.", (a) => a],
      ["B", "o conjunto B", "Os elementos de B.", (a, b) => b],
      ["C", "o conjunto C", "Os elementos de C.", (a, b, c) => c],
      ["A \\cup B", "união", "Está em A ou em B.", (a, b) => a || b],
      ["A \\cup C", "união", "Está em A ou em C.", (a, b, c) => a || c],
      ["B \\cup C", "união", "Está em B ou em C.", (a, b, c) => b || c],
      ["A \\cup B \\cup C", "união dos três", "Está em pelo menos um dos três.", (a, b, c) => a || b || c],
      ["A \\cap B", "interseção", "Está em A e em B (em C ou não).", (a, b) => a && b],
      ["A \\cap C", "interseção", "Está em A e em C.", (a, b, c) => a && c],
      ["B \\cap C", "interseção", "Está em B e em C.", (a, b, c) => b && c],
      ["A \\cap B \\cap C", "interseção dos três", "Está nos três ao mesmo tempo.", (a, b, c) => a && b && c],
      ["A^c", "complemento de A", "Tudo o que não está em A.", (a) => !a],
      ["B^c", "complemento de B", "Tudo o que não está em B.", (a, b) => !b],
      ["C^c", "complemento de C", "Tudo o que não está em C.", (a, b, c) => !c],
      ["(A \\cup B \\cup C)^c", "nenhum dos três", "Fora de todos os conjuntos.", (a, b, c) => !a && !b && !c],
      ["(A \\cap B \\cap C)^c", "não está nos três", "Pode estar em um ou dois, mas não nos três ao mesmo tempo.", (a, b, c) => !(a && b && c)],
      ["A - (B \\cup C)", "só A", "Está em A e em nenhum dos outros.", (a, b, c) => a && !b && !c],
      ["B - (A \\cup C)", "só B", "Está em B e em nenhum dos outros.", (a, b, c) => b && !a && !c],
      ["C - (A \\cup B)", "só C", "Está em C e em nenhum dos outros.", (a, b, c) => c && !a && !b],
      ["(A \\cap B) - C", "A e B, mas não C", "Está em A e em B, e fora de C.", (a, b, c) => a && b && !c],
      ["(A \\cap C) - B", "A e C, mas não B", "Está em A e em C, e fora de B.", (a, b, c) => a && c && !b],
      ["(B \\cap C) - A", "B e C, mas não A", "Está em B e em C, e fora de A.", (a, b, c) => b && c && !a],
      ["A - B", "diferença", "Está em A e não em B (em C ou não).", (a, b) => a && !b],
      ["A - C", "diferença", "Está em A e não em C.", (a, b, c) => a && !c],
      ["B - A", "diferença", "Está em B e não em A.", (a, b) => b && !a],
      ["B - C", "diferença", "Está em B e não em C.", (a, b, c) => b && !c],
      ["C - A", "diferença", "Está em C e não em A.", (a, b, c) => c && !a],
      ["C - B", "diferença", "Está em C e não em B.", (a, b, c) => c && !b],
      ["(A \\cap B) \\cup (A \\cap C) \\cup (B \\cap C)", "pelo menos dois", "Está em dois ou nos três conjuntos.", (a, b, c) => a + b + c >= 2],
      [null, "exatamente um", "Está em um conjunto só, qualquer que seja.", (a, b, c) => a + b + c === 1],
      [null, "exatamente dois", "Está em dois conjuntos, mas não no terceiro.", (a, b, c) => a + b + c === 2],
      ["A \\cap (B \\cup C)", "A e (B ou C)", "Está em A e em pelo menos um dos outros dois.", (a, b, c) => a && (b || c)],
      ["A \\cup (B \\cap C)", "A ou (B e C)", "Está em A, ou está em B e C ao mesmo tempo.", (a, b, c) => a || (b && c)],
      ["(A \\cup B) \\cap C", "(A ou B) e C", "Está em C e em A ou B.", (a, b, c) => (a || b) && c],
      ["(A \\cup B) - C", "(A ou B), mas não C", "Está em A ou B, e fora de C.", (a, b, c) => (a || b) && !c],
      ["A \\,\\triangle\\, B", "diferença simétrica", "Está em A ou em B, mas não nos dois.", (a, b) => a !== b],
    ],
  };

  const maskOf = (n, f) => new Set(REGIONS[n].filter(k => f(...[...k].map(b => b === "1"))));
  const sameSet = (s, t) => s.size === t.size && [...s].every(x => t.has(x));

  // A ∩ B ∩ Cᶜ — uma região escrita por extenso, para o que não tem nome.
  const regionTex = key => [...key].map((b, i) => (b === "1" ? NAMES[i] : `${NAMES[i]}^c`)).join(" \\cap ");

  function recognize(n, selected) {
    const hit = OPS[n].find(op => sameSet(maskOf(n, op[3]), selected));
    if (hit) return { tex: hit[0] || REGIONS[n].filter(k => selected.has(k)).map(k => `(${regionTex(k)})`).join(" \\cup "), name: hit[1], read: hit[2] };
    return {
      tex: REGIONS[n].filter(k => selected.has(k)).map(k => (selected.size > 1 ? `(${regionTex(k)})` : regionTex(k))).join(" \\cup "),
      name: null,
      read: "Essa combinação não tem nome curto. Toda seleção pode ser escrita como a união das regiões que a formam, como acima.",
    };
  }

  /* ---------------------------------------------------------------- explorador */

  const SHORTCUTS = {
    2: ["A \\cup B", "A \\cap B", "A - B", "B - A", "A \\,\\triangle\\, B", "A^c", "(A \\cup B)^c = A^c \\cap B^c"],
    3: ["A \\cup B \\cup C", "A \\cap B \\cap C", "A - (B \\cup C)", "(A \\cap B) - C", "A \\cap (B \\cup C)", "(A \\cap B) \\cup (A \\cap C) \\cup (B \\cap C)", "exatamente um", "(A \\cup B \\cup C)^c"],
  };

  function initExplorer(section) {
    const stage = section.querySelector(".venn-stage");
    const chips = section.querySelector(".region-chips");
    const shortcuts = section.querySelector(".venn-shortcuts");
    const outTex = section.querySelector(".venn-expr");
    const outName = section.querySelector(".venn-name-out");
    const outRead = section.querySelector(".venn-read");
    const outEls = section.querySelector(".venn-elements");
    const showEls = section.querySelector("input[name=elementos]");
    const legend = section.querySelector(".venn-legend");
    let n = 2, selected = new Set(["10", "11", "01"]), hover = null, v;

    function build() {
      v = venn(n, { role: "group", label: `Diagrama de Venn com ${n} conjuntos. Clique nas regiões para selecioná-las.` });
      stage.replaceChildren(v.svg);
      v.svg.addEventListener("click", e => {
        const key = v.regionAt(e);
        if (key) toggle(key);
      });
      v.svg.addEventListener("pointermove", e => { hover = v.regionAt(e); v.set(selected, hover); });
      v.svg.addEventListener("pointerleave", () => { hover = null; v.set(selected, hover); });

      // A mesma seleção por botões: o caminho pelo teclado.
      chips.replaceChildren();
      REGIONS[n].forEach(key => {
        const b = el("button", "chip", REGION_NAME[key]);
        b.type = "button";
        b.dataset.key = key;
        b.addEventListener("click", () => toggle(key));
        chips.appendChild(b);
      });

      shortcuts.replaceChildren();
      SHORTCUTS[n].forEach(ref => {
        const op = OPS[n].find(o => o[0] === ref || o[1] === ref);
        const b = el("button", "chip");
        b.type = "button";
        if (op[0]) math(b, op[0].split(" = ")[0]); else b.textContent = op[1];
        b.addEventListener("click", () => { selected = maskOf(n, op[3]); render(); });
        shortcuts.appendChild(b);
      });
      [["Inverter", () => { selected = new Set(REGIONS[n].filter(k => !selected.has(k))); }],
        ["Limpar", () => { selected = new Set(); }]].forEach(([t, fn]) => {
        const b = el("button", "chip is-ghost", t);
        b.type = "button";
        b.addEventListener("click", () => { fn(); render(); });
        shortcuts.appendChild(b);
      });

      legend.textContent = n === 2
        ? "U = {1, 2, …, 10} · A = pares · B = múltiplos de 3"
        : "U = {1, 2, …, 10} · A = pares · B = múltiplos de 3 · C = primos";
      render();
    }

    function toggle(key) {
      if (selected.has(key)) selected.delete(key); else selected.add(key);
      render();
    }

    function render() {
      v.set(selected, hover);
      chips.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", String(selected.has(b.dataset.key))));
      const by = {};
      if (showEls.checked) U.forEach(x => { (by[keyOf(x, n)] ||= []).push(String(x)); });
      v.writeTexts(by);

      const r = recognize(n, selected);
      math(outTex, r.tex);
      outName.textContent = r.name ? r.name[0].toUpperCase() + r.name.slice(1) : "Sem nome curto";
      outRead.textContent = r.read;
      const els = U.filter(x => selected.has(keyOf(x, n)));
      math(outEls, els.length ? `= \\{${els.join(",\\ ")}\\}` : "= \\varnothing");
    }

    section.querySelectorAll("[data-sets]").forEach(b => b.addEventListener("click", () => {
      const m = Number(b.dataset.sets);
      if (m === n) return;
      section.querySelectorAll("[data-sets]").forEach(o => o.setAttribute("aria-pressed", String(o === b)));
      // Leva a seleção junto: "10" vira "100" e "101" (fora/dentro de C).
      selected = m === 3
        ? new Set([...selected].flatMap(k => [`${k}0`, `${k}1`]))
        : new Set([...selected].filter(k => k.endsWith("0")).map(k => k.slice(0, 2)));
      n = m;
      build();
    }));
    showEls.addEventListener("change", render);
    build();
  }

  /* ---------------------------------------------------------------- leis */

  // [nome, n, lado esquerdo, lado direito, explicação]
  const LAWS = [
    ["De Morgan (união)", 2, ["(A \\cup B)^c", (a, b) => !(a || b)], ["A^c \\cap B^c", (a, b) => !a && !b],
      "“Não (A ou B)” é “não A e não B”. O complemento troca ∪ por ∩."],
    ["De Morgan (interseção)", 2, ["(A \\cap B)^c", (a, b) => !(a && b)], ["A^c \\cup B^c", (a, b) => !a || !b],
      "“Não (A e B)” é “não A ou não B”. O complemento troca ∩ por ∪."],
    ["Distributiva (∩ sobre ∪)", 3, ["A \\cap (B \\cup C)", (a, b, c) => a && (b || c)], ["(A \\cap B) \\cup (A \\cap C)", (a, b, c) => (a && b) || (a && c)],
      "Funciona como a · (b + c) = a·b + a·c, com ∩ no papel da multiplicação."],
    ["Distributiva (∪ sobre ∩)", 3, ["A \\cup (B \\cap C)", (a, b, c) => a || (b && c)], ["(A \\cup B) \\cap (A \\cup C)", (a, b, c) => (a || b) && (a || c)],
      "Esta não tem paralelo nos números (a + b·c ≠ (a + b)·(a + c)), mas com conjuntos vale."],
    ["Armadilha: (A ∪ B) − B = A?", 2, ["(A \\cup B) - B", (a, b) => (a || b) && !b], ["A", a => a],
      "Parece que “somar B e tirar B” devolve A, mas tirar B leva junto a parte de A que estava em B."],
    ["Armadilha: A − (B − C) = (A − B) − C?", 3, ["A - (B - C)", (a, b, c) => a && !(b && !c)], ["(A - B) - C", (a, b, c) => a && !b && !c],
      "Diferença não é associativa: a ordem dos parênteses muda o resultado."],
  ];

  function initLaws(section) {
    const tabs = section.querySelector(".law-tabs");
    const panes = section.querySelector(".law-panes");
    const verdict = section.querySelector(".law-verdict");
    const note = section.querySelector(".law-note");

    function show(i) {
      const [, n, L, R, why] = LAWS[i];
      tabs.querySelectorAll("button").forEach((b, j) => b.setAttribute("aria-pressed", String(i === j)));
      const sl = maskOf(n, L[1]), sr = maskOf(n, R[1]);
      panes.replaceChildren(...[L, R].map(([tex], j) => {
        const pane = el("figure", "law-pane");
        const v = venn(n, { label: `Diagrama de ${tex.replace(/\\[a-z]+/g, "")}` });
        v.set(j ? sr : sl, null);
        const cap = el("figcaption");
        math(cap, tex);
        pane.append(v.svg, cap);
        return pane;
      }));
      const ok = sameSet(sl, sr);
      verdict.className = `rule-verdict law-verdict ${ok ? "is-ok" : "is-diff"}`;
      if (ok) verdict.textContent = "✓ As regiões pintadas são as mesmas: os dois lados são o mesmo conjunto.";
      else {
        // Os nomes já têm vírgula ("A e C, não B"): vão entre aspas.
        const diff = REGIONS[n].filter(k => sl.has(k) !== sr.has(k)).map(k => `“${REGION_NAME[k]}”`);
        verdict.textContent = diff.length === 1
          ? `✗ Os diagramas diferem na região ${diff[0]}.`
          : `✗ Os diagramas diferem nas regiões ${diff.slice(0, -1).join(", ")} e ${diff[diff.length - 1]}.`;
      }
      note.textContent = why;
    }

    LAWS.forEach(([name], i) => {
      const b = el("button", "chip", name);
      b.type = "button";
      b.addEventListener("click", () => show(i));
      tabs.appendChild(b);
    });
    show(0);
  }

  /* ---------------------------------------------------------------- contagem */

  const VARS = {
    a: { min: 0, max: 40, value: 25 },
    b: { min: 0, max: 40, value: 18 },
    i: { min: 0, max: 20, value: 8 },
    n: { min: 10, max: 80, value: 40 },
  };

  // |A ∩ B| não pode passar do menor dos dois: limita e avisa.
  const inter = ({ a, b, i }) => Math.min(i, a, b);
  const capNote = s => (s.i > Math.min(s.a, s.b) ? ` |A ∩ B| não pode ser maior que o menor dos dois conjuntos (${Math.min(s.a, s.b)}), então a conta usa ${Math.min(s.a, s.b)}.` : "");

  function countVenn(counts, withOut) {
    const v = venn(2, { big: true, label: `Só A: ${counts["10"]}; A e B: ${counts["11"]}; só B: ${counts["01"]}${withOut ? `; fora dos dois: ${counts["00"]}` : ""}` });
    v.set(new Set(["10", "11", "01"]), null);
    v.svg.classList.add("is-soft");
    const by = { "10": [String(counts["10"])], "11": [String(counts["11"])], "01": [String(counts["01"])] };
    if (withOut) by["00"] = [String(counts["00"])];
    v.writeTexts(by);
    return v.svg;
  }

  const RULES = {
    uniao(s) {
      const { a, b } = s, j = inter(s), u = a + b - j;
      return {
        lhs: [`\\underbrace{${a - j}}_{\\text{só }A} + \\underbrace{${j}}_{A \\cap B} + \\underbrace{${b - j}}_{\\text{só }B} = ${u}`, u],
        rhs: [`|A| + |B| - |A \\cap B| = ${a} + ${b} - ${j} = ${u}`, u],
        note: "O lado esquerdo conta região por região no diagrama; o direito usa só os três totais." + capNote(s),
        draw: box => box.replaceChildren(countVenn({ "10": a - j, "11": j, "01": b - j })),
      };
    },
    somaDireta(s) {
      const { a, b } = s, j = inter(s), u = a + b - j;
      return {
        lhs: [`|A \\cup B| = ${a - j} + ${j} + ${b - j} = ${u}`, u],
        rhs: [`|A| + |B| = ${a} + ${b} = ${a + b}`, a + b],
        note: (j === 0
          ? "Com A ∩ B vazio (conjuntos disjuntos) os dois coincidem: não há nada contado duas vezes."
          : `A soma passa de ${j}, exatamente |A ∩ B|: quem está nos dois foi contado uma vez em |A| e outra em |B|.`) + capNote(s),
      };
    },
    prob(s) {
      const { a, b } = s, j = inter(s), u = a + b - j;
      const n = Math.max(s.n, u);
      const fix = s.n < u ? ` O total precisa ser pelo menos |A ∪ B| = ${u}; a conta usa n = ${u}.` : "";
      const fr = (p, q) => `\\tfrac{${p}}{${q}}`;
      return {
        lhs: [`P(A \\cup B) = ${fr(u, n)} \\approx ${texNum(u / n)}`, u / n],
        rhs: [`P(A) + P(B) - P(A \\cap B) = ${fr(a, n)} + ${fr(b, n)} - ${fr(j, n)} \\approx ${texNum((a + b - j) / n)}`, (a + b - j) / n],
        note: `Dividir a contagem pelo total transforma a fórmula de contagem na de probabilidade. Ficam fora dos dois ${n - u} de ${n}: P(nenhum) = ${fmt((n - u) / n)}.` + capNote(s) + fix,
        draw: box => box.replaceChildren(countVenn({ "10": a - j, "11": j, "01": b - j, "00": n - u }, true)),
      };
    },
  };

  Licao.renderTex();
  const ex = document.querySelector(".venn-explorer");
  if (ex) initExplorer(ex);
  const laws = document.querySelector(".laws");
  if (laws) initLaws(laws);
  Licao.regras(VARS, RULES);
})();
