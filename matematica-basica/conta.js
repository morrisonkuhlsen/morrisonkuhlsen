/* A conta armada que as lições de aritmética dividem: a grade de algarismos,
 * os quadros do passo a passo e o clique que diz o nome de cada parte. Cada
 * lição só monta a sua conta (build) e diz o que cada parte é.
 *
 * build devolve { cells, frames, template, value? }:
 * - célula: { row, col, text, kind, group, info, cls }. kind é o tipo
 *   (dividendo, produto…), group junta as células de um mesmo número, que
 *   acendem juntas no clique, info é a explicação e cls, classes extras
 *   (is-small para o vai-um, is-ghost para um zero de posição…). Sem info,
 *   a célula não é clicável (sinais, traços).
 * - quadro: { tag, html, show, hide, cross, hl, tab }: as células que
 *   aparecem, somem ou são riscadas nesse passo, e as que acendem ([id, tom]).
 * Mostrar o quadro k é aplicar os quadros 0…k. As células invisíveis
 * continuam ocupando lugar, então a conta não pula quando anda.
 *
 * Conta.partes e Conta.passos ligam uma <section> à conta: a primeira mostra
 * a conta pronta para clicar, com cartões por tipo; a segunda, o passo a
 * passo com os botões de avançar.
 */
window.Conta = (() => {
  const { el, math, saveParams } = Licao;

  const CASAS = ["unidades", "dezenas", "centenas", "unidades de milhar", "dezenas de milhar", "centenas de milhar", "unidades de milhão", "dezenas de milhão", "centenas de milhão", "unidades de bilhão", "dezenas de bilhão", "centenas de bilhão"];
  const CASAS1 = ["unidade", "dezena", "centena", "unidade de milhar", "dezena de milhar", "centena de milhar", "unidade de milhão", "dezena de milhão", "centena de milhão", "unidade de bilhão", "dezena de bilhão", "centena de bilhão"];
  // Casa i a partir da direita (0 = unidades), no plural e no singular.
  const casa = i => CASAS[i] || "casas altas";
  const casa1 = i => CASAS1[i] || "casa alta";

  const readInt = (s, max) => (new RegExp(`^\\s*\\d{1,${max}}\\s*$`).test(s) ? Number(s.trim()) : NaN);
  const tones = (ids, t) => ids.map(id => [id, t]);

  // Desenha a grade. Devolve show(k), que mostra o quadro k, e pick(teste),
  // que acende as células visíveis que passam no teste. Clicar num número
  // chama onPick com a célula.
  function grid(box, b, kinds, onPick) {
    const g = el("div", "ld");
    g.style.gridTemplateColumns = b.template;
    const nodes = b.cells.map((c, i) => {
      const e = el("span", `ld-cell ld-${c.kind}${c.cls ? ` ${c.cls}` : ""}`, c.text);
      e.style.gridRow = c.row;
      e.style.gridColumn = c.col;
      if (c.info && c.text) {
        e.tabIndex = 0;
        e.setAttribute("role", "button");
        e.setAttribute("aria-label", `${c.text}: ${kinds[c.kind].nome.toLowerCase()}`);
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
        const vis = new Set(), crossed = new Set();
        b.frames.slice(0, k + 1).forEach(f => {
          (f.show || []).forEach(id => vis.add(id));
          (f.hide || []).forEach(id => vis.delete(id));
          (f.cross || []).forEach(id => crossed.add(id));
        });
        const hl = new Map(b.frames[k].hl);
        nodes.forEach((e, i) => {
          e.classList.toggle("is-off", !vis.has(i));
          e.classList.toggle("is-crossed", crossed.has(i));
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
          if (on) e.style.setProperty("--pk", `var(--tone-${kinds[c.kind].tone})`);
        });
      },
    };
  }

  // O quadro com o nome e a explicação do número clicado.
  function say(panel, kinds, kind, text, value) {
    const k = kinds[kind];
    panel.dataset.tone = k.tone;
    panel.replaceChildren(el("strong", null, value == null ? k.nome : `${k.nome} — ${value}`), el("p", null, text));
  }

  // O número que um grupo de células forma, sem os sinais.
  const valueOf = (b, c) => b.value?.(c) ?? b.cells.filter(x => x.group === c.group && /\d|,/.test(x.text)).map(x => x.text).join("");

  // Campos da seção, com o valor inicial vindo da URL (o nome do campo é o
  // nome do parâmetro).
  function fields(section, names) {
    const inputs = names.map(n => section.querySelector(`[name=${n}]`));
    const q = new URLSearchParams(location.search);
    inputs.forEach(i => {
      if (!q.has(i.name)) return;
      if (i.tagName === "SELECT" && ![...i.options].some(o => o.value === q.get(i.name))) return;
      i.value = q.get(i.name);
    });
    return {
      inputs,
      values: () => Object.fromEntries(inputs.map(i => [i.name, i.value.trim()])),
      // cfg.read devolve { args, err, bad }: bad são os campos inválidos.
      read(read) {
        const vals = this.values();
        saveParams(vals);
        const out = read(vals);
        inputs.forEach(i => i.setAttribute("aria-invalid", (out.bad || []).includes(i.name)));
        return out;
      },
      bind(section, update) {
        inputs.forEach(i => i.addEventListener(i.tagName === "SELECT" ? "change" : "input", update));
        section.querySelectorAll("[data-exemplo]").forEach(btn => btn.addEventListener("click", () => {
          btn.dataset.exemplo.split(";").forEach((v, k) => { if (inputs[k]) inputs[k].value = v; });
          update();
        }));
      },
    };
  }

  /* ---------------------------------------------------------------- a conta pronta */

  // cfg: { kinds, fields, read, build(args), cards(b, args), prova(b, args) }.
  // cards: [[tipo, valor ou null, texto, teste?]]; o teste diz quais
  // células o cartão acende (por padrão, as do mesmo tipo).
  function partes(section, cfg) {
    const f = fields(section, cfg.fields);
    const box = section.querySelector(".ld-box");
    const info = section.querySelector(".ld-info");
    const terms = section.querySelector(".terms");
    const prova = section.querySelector(".prova");
    const note = section.querySelector(".calc-note");
    let b = null, view = null;

    const press = kind => terms.querySelectorAll("button").forEach(t => t.setAttribute("aria-pressed", t.dataset.kind === kind));
    const blank = () => {
      delete info.dataset.tone;
      info.replaceChildren(el("p", "ld-hint", "Clique em qualquer número da conta — ou num dos cartões abaixo — para ver o nome dele."));
      press(null);
    };

    function update() {
      const { args, err } = f.read(cfg.read);
      section.classList.toggle("has-error", !!err);
      note.textContent = err || "";
      if (err) { b = null; box.replaceChildren(); terms.replaceChildren(); prova.textContent = ""; return; }
      b = cfg.build(args);
      view = grid(box, b, cfg.kinds, c => {
        view.pick(x => x.group === c.group);
        say(info, cfg.kinds, c.kind, c.info, valueOf(b, c));
        press(c.kind);
      });
      view.show(b.frames.length - 1);
      terms.replaceChildren(...cfg.cards(b, args).filter(([k]) => b.cells.some(c => c.kind === k && c.info)).map(([k, v, txt, test]) => {
        const t = el("button");
        t.type = "button";
        t.dataset.kind = k;
        t.dataset.tone = cfg.kinds[k].tone;
        t.append(el("strong", null, v == null ? cfg.kinds[k].plural || cfg.kinds[k].nome : `${cfg.kinds[k].nome} — ${v}`), el("span", null, txt));
        t.addEventListener("click", () => {
          view.pick(test || (x => x.kind === k));
          say(info, cfg.kinds, k, txt, v);
          press(k);
        });
        return t;
      }));
      math(prova, `\\displaystyle ${cfg.prova(b, args)}`);
      view.pick(null);
      blank();
    }

    f.bind(section, update);
    update();
  }

  /* ---------------------------------------------------------------- passo a passo */

  // cfg: { kinds, fields, read, build(args), result(b, args), note?(b, args),
  // side?(sideEl, b, frame) }. side desenha o painel ao lado da conta (a
  // tabuada) a cada passo.
  function passos(section, cfg) {
    const f = fields(section, cfg.fields);
    const result = section.querySelector(".calc-result");
    const box = section.querySelector(".ld-box");
    const info = section.querySelector(".ld-info");
    const tag = section.querySelector(".ld-tags");
    const sayEl = section.querySelector(".ld-say");
    const count = section.querySelector(".ld-count");
    const side = section.querySelector(".ld-side");
    const all = section.querySelector(".ld-all");
    const note = section.querySelector(".calc-note");
    const nav = {};
    section.querySelectorAll("[data-nav]").forEach(btn => { nav[btn.dataset.nav] = btn; });
    let b = null, view = null, k = 0;

    function go(to) {
      if (!b) return;
      k = Math.max(0, Math.min(b.frames.length - 1, to));
      const fr = b.frames[k];
      view.show(k);
      view.pick(null);
      info.hidden = true;
      const tags = [].concat(fr.tag);
      tag.querySelectorAll("span").forEach(s => s.classList.toggle("is-on", tags.includes(s.dataset.tag)));
      sayEl.innerHTML = fr.html;
      count.textContent = `Passo ${k + 1} de ${b.frames.length}`;
      nav.first.disabled = nav.prev.disabled = k === 0;
      nav.next.disabled = nav.last.disabled = k === b.frames.length - 1;
      if (side && cfg.side) cfg.side(side, b, fr);
      all.querySelectorAll("li").forEach((li, i) => li.classList.toggle("is-on", i === k));
    }

    function update() {
      const { args, err } = f.read(cfg.read);
      section.classList.toggle("has-error", !!err);
      if (err) {
        b = null;
        result.textContent = "";
        box.replaceChildren();
        all.replaceChildren();
        note.textContent = err;
        return;
      }
      b = cfg.build(args);
      view = grid(box, b, cfg.kinds, c => {
        view.pick(x => x.group === c.group);
        info.hidden = false;
        say(info, cfg.kinds, c.kind, c.info, valueOf(b, c));
      });
      math(result, cfg.result(b, args));
      all.replaceChildren(...b.frames.map((fr, i) => {
        const li = el("li");
        const btn = el("button");
        btn.type = "button";
        btn.innerHTML = `<b>${[].concat(fr.tag).join(", ")}.</b> ${fr.html}`;
        btn.addEventListener("click", () => go(i));
        li.appendChild(btn);
        return li;
      }));
      note.innerHTML = cfg.note ? cfg.note(b, args) : "";
      go(0);
    }

    nav.first.addEventListener("click", () => go(0));
    nav.prev.addEventListener("click", () => go(k - 1));
    nav.next.addEventListener("click", () => go(k + 1));
    nav.last.addEventListener("click", () => go(Infinity));
    f.bind(section, update);
    update();
  }

  // Tabuada de `base` no painel ao lado; mark(i) dá a classe da linha i.
  function tabuada(sideEl, label, base, mark = () => "") {
    sideEl.replaceChildren(el("span", "ld-tab-label", label));
    const ol = el("ol", "ld-tab");
    for (let i = 1; i <= 9; i++) {
      const li = el("li", mark(i) || null, `${base} × ${i} = ${base * i}`);
      ol.appendChild(li);
    }
    sideEl.appendChild(ol);
  }

  return { casa, casa1, readInt, tones, grid, say, partes, passos, tabuada };
})();
