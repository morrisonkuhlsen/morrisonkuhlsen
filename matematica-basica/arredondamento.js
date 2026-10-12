/* Arredondamento: o zoom na reta entre os dois candidatos, a calculadora
 * por casas decimais ou por algarismos significativos (feita com os
 * algarismos como texto — 2,675 com 2 casas dá 2,68, não o 2,67 do ponto
 * flutuante) e o card de arredondar no meio da conta. Os utilitários vêm
 * de licao.js.
 */
(() => {
  const { fmt, texNum, tone, math, el, svg, saveParams } = Licao;

  /* ---------------------------------------------------------------- arredondar como texto */

  // "-12,3456" → { neg, ds: "123456", p: 2 }: p algarismos antes da vírgula.
  function parse(s) {
    const m = /^(-?)(\d{1,12})(?:,(\d{1,10}))?$/.exec(s.trim());
    if (!m) return null;
    return { neg: m[1] === "-", ds: m[2] + (m[3] || ""), p: m[2].length };
  }

  // Monta "12,35" a partir dos algarismos e da posição da vírgula.
  function show(ds, p, neg) {
    let i = ds.slice(0, p).replace(/^0+(?=\d)/, "") || "0";
    if (p <= 0) i = "0";
    const f = p <= 0 ? "0".repeat(-p) + ds : ds.slice(p);
    const s = f ? `${i},${f}` : i;
    return (neg && /[1-9]/.test(s) ? "−" : "") + s;
  }

  // Arredonda mantendo `keep` (≥ 1) algarismos a partir do começo de ds.
  // modo "sig": se o vai-um criar um algarismo novo, o último zero sai.
  function round(x, keep, modo) {
    let { ds, p } = x;
    if (keep > ds.length) return { ds: ds.padEnd(keep, "0"), p, next: null, up: false, pad: keep - ds.length };
    const next = keep < ds.length ? Number(ds[keep]) : 0;
    let K = ds.slice(0, keep) || "0";
    const up = next >= 5;
    if (up) {
      const inc = (BigInt(K) + 1n).toString().padStart(K.length, "0");
      const cresceu = inc.length > K.length;
      if (cresceu) p += 1;
      // Em significativos, o vai-um que cria um algarismo à esquerda (0,0999
      // → 0,10, 9,96 → 10) ganha um significativo: o zero do fim sai.
      const ganhou = cresceu || inc.search(/[1-9]/) < K.search(/[1-9]/);
      K = modo === "sig" && ganhou ? inc.slice(0, -1) : inc;
    }
    return { ds: K, p, next, up };
  }

  // Resultado como texto, com zeros no lugar das casas inteiras cortadas.
  function result(x, r) {
    const { ds, p } = r;
    if (ds.length < p) return show(ds + "0".repeat(p - ds.length), p, x.neg);
    return show(ds, p, x.neg);
  }

  // Quantos algarismos guardar.
  function keepFor(x, modo, k) {
    if (modo === "casas") return x.p + k;
    const f = x.ds.search(/[1-9]/);
    return f < 0 ? -1 : f + k;
  }

  /* ---------------------------------------------------------------- zoom na reta */

  function initZoom(section) {
    const input = section.querySelector("input[name=zv]");
    const out = section.querySelector(".out-zv");
    const btns = section.querySelectorAll("[data-casas]");
    const fig = section.querySelector(".zoom-fig");
    const eq = section.querySelector(".zoom-eq");
    const text = section.querySelector(".intro-text");
    const q = new URLSearchParams(location.search);
    if (q.has("zv")) input.value = q.get("zv");
    let casas = ["0", "1", "2"].includes(q.get("zc")) ? Number(q.get("zc")) : 1;

    function draw() {
      const milesimos = Number(input.value);
      const v = milesimos / 1000;
      const s = (milesimos / 1000).toFixed(3).replace(".", ",");
      out.textContent = s;
      btns.forEach(b => b.setAttribute("aria-pressed", Number(b.dataset.casas) === casas));
      const step = 10 ** -casas;
      const lo = Math.floor(milesimos / (1000 * step) + 1e-9) * step;
      const hi = lo + step, mid = lo + step / 2;
      const x = parse(s), r = round(x, keepFor(x, "casas", casas), "casas");
      const res = result(x, r);
      const exato = Math.abs(v - lo) < 1e-9;

      const W = 640, H = 120, L = 40, R = 40, Y = 64;
      const X = t => L + (t - lo) / step * (W - L - R);
      const g = svg("svg", { viewBox: `0 0 ${W} ${H}`, class: "plot reta", role: "img",
        "aria-label": `${s} entre ${fmt(lo, casas)} e ${fmt(hi, casas)}; arredonda para ${res}` });
      svg("line", { x1: L - 20, x2: W - R + 20, y1: Y, y2: Y, class: "plot-axis is-x" }, g);
      for (let i = 0; i <= 10; i++) svg("line", { x1: X(lo + i * step / 10), x2: X(lo + i * step / 10), y1: Y - (i === 5 ? 10 : 5), y2: Y + (i === 5 ? 10 : 5), class: i === 5 ? "zoom-mid" : "plot-grid" }, g);
      [[lo, fmt(lo, casas)], [hi, fmt(hi, casas)]].forEach(([t, lab]) => {
        svg("line", { x1: X(t), x2: X(t), y1: Y - 14, y2: Y + 14, class: "plot-axis" }, g);
        const tt = svg("text", { x: X(t), y: Y + 32, class: "plot-tick is-zero", "text-anchor": "middle" }, g);
        tt.textContent = lab;
      });
      const tm = svg("text", { x: X(mid), y: Y + 32, class: "plot-tick", "text-anchor": "middle" }, g);
      tm.textContent = `${fmt(mid, casas + 1)} (meio)`;
      const target = r.up ? hi : lo;
      if (!exato) svg("path", { d: `M${X(v)},${Y - 8} Q${(X(v) + X(target)) / 2},${Y - 44} ${X(target)},${Y - 10}`, class: "reta-jump" }, g);
      svg("circle", { cx: X(v), cy: Y, r: 6, class: "plot-dot reta-a" }, g);
      fig.replaceChildren(g);

      // O número com os algarismos guardados, o que decide e o resto.
      const keep = keepFor(x, "casas", casas);
      const digs = x.ds.split("").map((d, i) => (i < keep ? tone(d, 2) : i === keep ? tone(d, 4) : `\\htmlData{tone=0}{${d}}`));
      const texV = `${digs.slice(0, x.p).join("")}{,}${digs.slice(x.p).join("")}`;
      math(eq, `\\displaystyle ${texV} \\;\\approx\\; ${tone(res.replace(",", "{,}"), 1)}`);
      const d = x.ds[keep];
      text.innerHTML = exato
        ? `<p>${s} já está exatamente em ${fmt(lo, casas)}: com ${casas} ${casas === 1 ? "casa" : "casas"}, não há o que arredondar.</p>`
        : `<p>Com ${casas === 0 ? "nenhuma casa decimal" : `${casas} ${casas === 1 ? "casa decimal" : "casas decimais"}`}, ${s} fica entre <strong>${fmt(lo, casas)}</strong> e <strong>${fmt(hi, casas)}</strong>. Quem decide é o primeiro algarismo cortado, o <strong>${d}</strong> (em vermelho): ${Number(d) >= 5 ? `5 ou mais, o número está na metade de cima — <strong>sobe</strong> para ${res}` : `menos de 5, está na metade de baixo — <strong>fica</strong> em ${res}`}.</p>`
          + (Number(d) === 5 && /^0*$/.test(x.ds.slice(keep + 1)) ? `<p>Exatamente no meio: pela regra mais comum (a do ensino básico), o 5 sobe. Há outra regra, a do “meio para o par”, explicada abaixo.</p>` : "");
      saveParams({ zv: milesimos, zc: casas });
    }

    btns.forEach(b => b.addEventListener("click", () => { casas = Number(b.dataset.casas); draw(); }));
    section.addEventListener("input", draw);
    draw();
  }

  /* ---------------------------------------------------------------- calculadora */

  function initCalc(section) {
    const input = section.querySelector("input[name=num]");
    const modo = section.querySelector("select[name=modo]");
    const inK = section.querySelector("input[name=k]");
    const result_ = section.querySelector(".calc-result");
    const steps = section.querySelector(".calc-steps");
    const note = section.querySelector(".calc-note");
    const q = new URLSearchParams(location.search);
    if (q.has("num")) input.value = q.get("num");
    if (q.has("modo") && ["casas", "sig"].includes(q.get("modo"))) modo.value = q.get("modo");
    if (q.has("k")) inK.value = q.get("k");

    function update() {
      saveParams({ num: input.value.trim(), modo: modo.value, k: inK.value.trim() });
      steps.replaceChildren();
      const x = parse(input.value.replace(/\s/g, "").replace("−", "-"));
      const k = /^\d{1,2}$/.test(inK.value.trim()) ? Number(inK.value) : NaN;
      const sig = modo.value === "sig";
      const okK = !Number.isNaN(k) && k <= 10 && (!sig || k >= 1);
      input.setAttribute("aria-invalid", String(!x));
      inK.setAttribute("aria-invalid", String(!okK));
      const err = !x ? "Digite um número com vírgula nos decimais, sem pontos de milhar (como 3,14159 ou -0,00456)."
        : !okK ? (sig ? "Use de 1 a 10 algarismos significativos." : "Use de 0 a 10 casas decimais.")
        : sig && !/[1-9]/.test(x.ds) ? "Zero não tem algarismos significativos." : "";
      section.classList.toggle("has-error", !!err);
      if (err) { result_.textContent = ""; note.textContent = err; return; }

      const keep = keepFor(x, modo.value, k);
      const r = round(x, keep, modo.value);
      const res = result(x, r);
      const orig = show(x.ds, x.p, x.neg);
      const add = (html, src) => {
        const li = el("li");
        const p = el("span");
        p.innerHTML = html;
        li.appendChild(p);
        if (src) { const mm = el("span", "calc-math"); math(mm, src); li.appendChild(mm); }
        steps.appendChild(li);
      };
      const colored = x.ds.split("").map((d, i) => (i < keep ? tone(d, 2) : i === keep ? tone(d, 4) : `\\htmlData{tone=0}{${d}}`));
      const texOrig = `${x.neg ? "-" : ""}${colored.slice(0, x.p).join("")}${x.ds.length > x.p ? `{,}${colored.slice(x.p).join("")}` : ""}`;
      const resTex = res.replace("−", "-").replace(",", "{,}");

      if (sig) {
        const f = x.ds.search(/[1-9]/);
        add(`<strong>Onde começam os significativos.</strong> ${f > 0 ? `Os zeros antes do primeiro algarismo diferente de zero só marcam a posição da vírgula — não contam. ` : ""}Conte ${k} ${k === 1 ? "algarismo" : "algarismos"} a partir do ${x.ds[f]} (em laranja).`, texOrig);
      } else {
        add(`<strong>Até onde guardar.</strong> Conte ${k === 0 ? "até a vírgula: nenhuma casa decimal" : `${k} ${k === 1 ? "casa" : "casas"} depois da vírgula`} (em laranja).`, texOrig);
      }
      if (r.pad) {
        add(`O número tem menos casas do que o pedido: não há o que cortar. Completa-se com ${r.pad === 1 ? "um zero" : `${r.pad} zeros`}, para mostrar a precisão.`, `${orig.replace("−", "-").replace(",", "{,}")} = ${tone(resTex, 1)}`);
      } else {
        const d = r.next;
        add(`<strong>O algarismo que decide</strong> é o primeiro cortado, o ${d} (em vermelho). ${d >= 5 ? "É 5 ou mais: o último guardado <strong>sobe</strong> 1." : "É menos de 5: os guardados <strong>ficam</strong> como estão."}${d >= 5 && r.p > x.p ? " O vai-um passou por noves e abriu uma casa à esquerda." : ""}`, null);
        add(`<strong>Troque o resto por nada</strong> — ${keep < x.p ? "as casas inteiras cortadas viram zeros, para o número não encolher" : "as casas decimais cortadas simplesmente saem"}.`, `${texOrig} \\;\\approx\\; ${tone(resTex, 1)}`);
        const trunc = result(x, { ds: x.ds.slice(0, keep), p: x.p });
        if (d >= 5 && trunc !== res) add(`Só cortar, sem olhar o ${d}, daria ${trunc} — isso é <strong>truncar</strong>, e erra sempre para o mesmo lado.`, null);
      }
      math(result_, `${orig.replace("−", "-").replace(",", "{,}")} \\approx ${tone(resTex, 1)}`);
      // Algarismos significativos grandes: a notação científica tira a dúvida dos zeros.
      if (sig && keep < x.p) {
        const nz = res.replace(/[−,]/g, "").replace(/^0+/, "");
        const e = (res.replace("−", "").split(",")[0].length) - 1;
        const man = nz.slice(0, k);
        note.textContent = `Em ${res}, os zeros do fim só seguram o lugar e não são significativos — mas quem lê não tem como saber. A notação científica deixa claro: ${x.neg ? "−" : ""}${man.length > 1 ? `${man[0]},${man.slice(1)}` : man} × 10${Licao.sup(e)}.`;
      } else note.textContent = "";
    }

    section.addEventListener("input", update);
    modo.addEventListener("change", update);
    section.querySelectorAll("[data-exemplo]").forEach(btn => btn.addEventListener("click", () => {
      [input.value, modo.value, inK.value] = btn.dataset.exemplo.split(";");
      update();
    }));
    update();
  }

  /* ---------------------------------------------------------------- arredondar no meio */

  const VARS = {
    d: { min: 3, max: 9, value: 3 },
    k: { min: 0, max: 3, value: 1 },
  };
  const rd = (v, k) => Math.round(v * 10 ** k + 1e-9) / 10 ** k;
  const RULES = {
    meio({ d, k }) {
      const parte = rd(100 / d, k), l = rd(parte * d, k);
      return {
        lhs: [`${d} \\times ${texNum(parte, k)}\\% = ${texNum(l, k)}\\%`, l],
        rhs: [`${d} \\times \\frac{100\\%}{${d}} = 100\\%`, 100],
        note: Math.abs(l - 100) < 1e-9
          ? "Aqui o arredondamento não atrapalhou. Mude d ou o número de casas."
          : `Cada uma das ${d} partes vale 100/${d} = ${fmt(100 / d, 6)}…%, mostrada como ${fmt(parte, k)}%. Somando os valores já arredondados, o total sai ${fmt(l, k)}% — o erro de cada parte se acumula. Por isso tabelas de porcentagem às vezes somam 99% ou 101%.`,
      };
    },
  };

  Licao.renderTex();
  const zoom = document.querySelector("#zoom");
  if (zoom) initZoom(zoom);
  const calc = document.querySelector("#calc");
  if (calc) initCalc(calc);
  Licao.regras(VARS, RULES);
})();
