const data = [
  { id:"alpha",   glyph:"Αα", name:"ALPHA",   ipa:"[a]",  greek:"ἄλφα" },
  { id:"beta",    glyph:"Ββ", name:"BETA",    ipa:"[b]",  greek:"βῆτα" },
  { id:"gamma",   glyph:"Γγ", name:"GAMMA",   ipa:"[g]",  greek:"γάμμα" },
  { id:"delta",   glyph:"Δδ", name:"DELTA",   ipa:"[d]",  greek:"δέλτα" },
  { id:"epsilon", glyph:"Εε", name:"EPSILON", ipa:"[e]",  greek:"ἐ ψιλόν" },
  { id:"zeta",    glyph:"Ζζ", name:"ZETA",    ipa:"[dz]", greek:"ζῆτα" },

  { id:"eta",     glyph:"Ηη", name:"ETA",     ipa:"[ɛː]", greek:"ἦτα" },
  { id:"theta",   glyph:"Θθ", name:"THETA",   ipa:"[tʰ]", greek:"θῆτα" },
  { id:"iota",    glyph:"Ιι", name:"IOTA",    ipa:"[i]",  greek:"ἰῶτα" },
  { id:"kappa",   glyph:"Κκ", name:"KAPPA",   ipa:"[k]",  greek:"κάππα" },
  { id:"lambda",  glyph:"Λλ", name:"LAMBDA",  ipa:"[l]",  greek:"λάμβδα" },
  { id:"mu",      glyph:"Μμ", name:"MU",      ipa:"[m]",  greek:"μῦ" },

  { id:"nu",      glyph:"Νν", name:"NU",      ipa:"[n]",  greek:"νῦ" },
  { id:"xi",      glyph:"Ξξ", name:"XI",      ipa:"[ks]", greek:"ξεῖ" },
  { id:"omicron", glyph:"Οο", name:"OMICRON", ipa:"[o]",  greek:"ὂ μικρόν" },
  { id:"pi",      glyph:"Ππ", name:"PI",      ipa:"[p]",  greek:"πεῖ" },
  { id:"rho",     glyph:"Ρρ", name:"RHO",     ipa:"[r]",  greek:"ῥῶ" },
  { id:"sigma",   glyph:"Σσς",name:"SIGMA",   ipa:"[s]",  greek:"σίγμα" },

  { id:"tau",     glyph:"Ττ", name:"TAU",     ipa:"[t]",  greek:"ταῦ" },
  { id:"upsilon", glyph:"Υυ", name:"UPSILON", ipa:"[u]",  greek:"ὖ ψιλόν" },
  { id:"phi",     glyph:"Φφ", name:"PHI",     ipa:"[pʰ]", greek:"φεῖ" },
  { id:"chi",     glyph:"Χχ", name:"CHI",     ipa:"[kʰ]", greek:"χεῖ" },
  { id:"psi",     glyph:"Ψψ", name:"PSI",     ipa:"[ps]", greek:"ψεῖ" },
  { id:"omega",   glyph:"Ωω", name:"OMEGA",   ipa:"[ɔː]", greek:"ὦ μέγα" },
];

/* usos (curtos para caber bem em mobile) */
const uses = {
  alpha: {
    math: ["Ângulo/constante em fórmulas.", "Parâmetro em funções e séries."],
    prob: ["Parâmetro de forma em Beta/Gamma (convenção comum).", "Nível de significância em testes (via estatística)."],
    stats:["Nível de significância (α) e erro tipo I.", "Em modelos, pode aparecer como parâmetro/hiperparâmetro."]
  },
  beta: {
    math: ["Função Beta B(·,·) e integrais.", "Constantes/coeficientes genéricos."],
    prob: ["Distribuição Beta (parâmetros α, β).", "Parâmetro em modelos bayesianos (hiperparâmetro)."],
    stats:["Coeficientes em regressão (β).", "Erro tipo II (β) e poder (1−β)."]
  },
  gamma: {
    math: ["Função Gamma Γ(·).", "Constante de Euler–Mascheroni (γ) em análise."],
    prob: ["Distribuição Gamma (forma/escala, convenções).", "Aparece em Poisson–Gamma (conjugação)."],
    stats:["Ligada a estimação em modelos com Gamma/Exponencial.", "Aparece em verossimilhança e funções especiais."]
  },
  delta: {
    math: ["Variação/diferença: Δx.", "Delta de Kronecker δᵢⱼ e delta de Dirac δ(·)."],
    prob: ["Massa pontual pode ser escrita com δ(·) em teoria de medidas.", "Diferença entre eventos/valores (Δ)."],
    stats:["Diferença de médias/efeitos: Δ.", "Incrementos em otimização numérica."]
  },
  epsilon: {
    math: ["Quantidade “muito pequena” (ε).", "Limites: definições ε–δ."],
    prob: ["Erros/perturbações pequenas em aproximações.", "Margem ε em desigualdades/limites."],
    stats:["Erro/resíduo (ε) em regressão.", "Precisão numérica (machine epsilon)."]
  },
  zeta: {
    math: ["Função zeta de Riemann ζ(s).", "Aparece em séries e teoria dos números."],
    prob: ["Menos comum; pode surgir em funções especiais.", "Às vezes parâmetro/constante em modelos específicos."],
    stats:["Raro como padrão; usado em alguns textos para parâmetros auxiliares.", "Se aparecer, é convenção do autor."]
  },
  eta: {
    math: ["Parâmetro/constante em diversas áreas.", "Notação de eficiência/viscosidade (fora da matemática pura)."],
    prob: ["Raro como padrão; pode ser parâmetro em textos específicos."],
    stats:["Tamanho de efeito: η² (ANOVA).", "Outras medidas: η (convenções em alguns livros)."]
  },
  theta: {
    math: ["Ângulo (θ) e coordenadas polares.", "Parâmetro genérico em funções."],
    prob: ["Parâmetro desconhecido do modelo (θ).", "Bayes: prior/posterior sobre θ."],
    stats:["Parâmetro do modelo a ser estimado (θ).", "MLE/MAP e inferência sobre θ."]
  },
  iota: {
    math: ["Notação rara hoje; pode indicar inclusão/índice.", "Em alguns textos: operador/pequena quantidade."],
    prob: ["Pouco usado; depende do autor."],
    stats:["Pouco usado; se aparecer, normalmente é convenção local do material."]
  },
  kappa: {
    math: ["Curvatura κ em geometria.", "Constante/índice em fórmulas."],
    prob: ["Parâmetro de concentração (ex.: von Mises, em alguns contextos)."],
    stats:["Coeficiente Kappa de Cohen (concordância).", "Pode aparecer em estatística direcional."]
  },
  lambda: {
    math: ["Autovalores (λ).", "Multiplicador de Lagrange (λ)."],
    prob: ["Taxa em Poisson (λ) e Exponencial (λ).", "Intensidade em processos de Poisson."],
    stats:["Parâmetro de taxa/regularização (λ) em alguns métodos.", "Aparece em GLMs/penalizações (ridge/lasso em convenções)."]
  },
  mu: {
    math: ["Constante/índice; prefixo micro (μ) em unidades."],
    prob: ["Parâmetro de localização (μ) em Normais e outras famílias.", "Média teórica quando existe."],
    stats:["Média populacional (μ).", "Estimativa: \u03bĉ (mu chapéu) em alguns textos."]
  },
  nu: {
    math: ["Frequência ν (em aplicações).", "Índice/parâmetro em funções especiais."],
    prob: ["Parâmetro de liberdade/forma em algumas famílias (convenções)."],
    stats:["Graus de liberdade (ν).", "Muito comum em t de Student e qui-quadrado (via ν)."]
  },
  xi: {
    math: ["Variável/índice (ξ).", "Aparece em PDEs e funções especiais."],
    prob: ["Variável aleatória (ξ) em alguns textos.", "Parâmetro em modelos estocásticos (convenção)."],
    stats:["Às vezes usado para observações latentes/ruído.", "Depende da convenção do autor."]
  },
  omicron: {
    math: ["Notação assintótica: o(n), o(1).", "“Pequeno-o” (ordem estrita)."],
    prob: ["Aparece em limites de sequência de variáveis (o_p(1)).", "Em convergência em probabilidade."],
    stats:["Notação: o_p(1), O_p(·) em teoria assintótica.", "Muito usado em econometria/teoria de estimadores."]
  },
  pi: {
    math: ["Constante π.", "Operador produto Π (pi maiúsculo)."],
    prob: ["Aparece em densidades/normalizações (π).", "Em Bayes, π(θ) pode denotar prior (convenção)."],
    stats:["Pode denotar proporção/probabilidade em modelos (π).", "Em logística: π(x)=P(Y=1|x) (convenção)."]
  },
  rho: {
    math: ["Coordenada radial ρ (às vezes).", "Parâmetro/constante em equações."],
    prob: ["Densidade/medida em alguns contextos (ρ).", "Pode aparecer como parâmetro de dependência."],
    stats:["Correlação populacional (ρ).", "Spearman ρ (correlação por postos)."]
  },
  sigma: {
    math: ["Somatório Σ (sigma maiúsculo).", "Estruturas: σ-álgebra (sigma)."],
    prob: ["Espaços de prob.: σ-álgebra (F).", "σ(X) = σ-álgebra gerada por X."],
    stats:["Desvio-padrão populacional (σ).", "Variância (σ²) em modelos normais."]
  },
  tau: {
    math: ["Constante/tempo característico (aplicações).", "Notação em topologia (τ) em alguns textos."],
    prob: ["Menos comum; aparece em modelos específicos.", "Parâmetro/limiar em certas construções."],
    stats:["Kendall’s τ (correlação por concordância).", "Muito usado em estatística não-paramétrica."]
  },
  upsilon: {
    math: ["Pouco usado; às vezes em funções especiais.", "Pode ser usado como variável auxiliar."],
    prob: ["Raro como padrão; depende do autor."],
    stats:["Raro; se aparecer, é convenção do material."]
  },
  phi: {
    math: ["φ: ângulo/função genérica; razão áurea (φ) em alguns contextos.", "Φ: função de distribuição normal padrão (comum)."],
    prob: ["φ/Φ aparecem em densidade/CDF da Normal.", "Também pode denotar função característica (varia por autor)."],
    stats:["Φ(z): CDF da N(0,1) em testes e ICs.", "φ(z): densidade normal em regressão/GLMs."]
  },
  chi: {
    math: ["Letra usada em funções especiais.", "Índice/variável em algumas áreas."],
    prob: ["Distribuição qui-quadrado χ².", "Aparece em testes e medidas de distância."],
    stats:["Testes χ² (aderência/independência).", "Estatística χ² em tabelas de contingência."]
  },
  psi: {
    math: ["Função digama ψ(x) (derivada de log Γ).", "Símbolo genérico em análise."],
    prob: ["Surge em momentos/estimativas envolvendo Γ/Beta.", "Aparece em inferência bayesiana com conjugações."],
    stats:["Digama ψ em MLE de Gamma/Dirichlet.", "Usado em EM/variacional em alguns modelos."]
  },
  omega: {
    math: ["Notação de ordem: Ω(·) (limite inferior assintótico).", "Conjunto/constante em vários contextos."],
    prob: ["Espaço amostral: Ω.", "Eventos são subconjuntos de Ω."],
    stats:["Base formal: (Ω, F, P).", "Ajuda a organizar eventos/variáveis aleatórias."]
  },
};

function el(tag, className, text){
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function makeCell(item){
  const cell = el("div", "cell");
  cell.tabIndex = 0;                 // acessível por teclado
  cell.dataset.id = item.id;

  const glyph = el("div", "glyph", item.glyph);

  const meta = el("div", "meta");
  const latin = el("div", "latin");
  latin.append(
    el("span", "name", item.name),
    el("span", "ipa", item.ipa)
  );

  meta.append(latin, el("div", "greek", item.greek));
  cell.append(glyph, meta);

  // Clique / Enter / Espaço
  const open = () => openModal(item);
  cell.addEventListener("click", open);
  cell.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      open();
    }
  });

  return cell;
}

function render(){
  const root = document.getElementById("chart");
  root.innerHTML = "";

  const perRow = 6;
  const rows = Math.ceil(data.length / perRow);

  for (let r = 0; r < rows; r++){
    const row = el("div", "row");
    data.slice(r * perRow, (r + 1) * perRow)
      .forEach(item => row.appendChild(makeCell(item)));

    root.appendChild(row);
    if (r !== rows - 1) root.appendChild(el("div", "rule"));
  }
}

/* ---- AUTO-FIT (sem scroll) ---- */
function fitToScreen(){
  const chart = document.getElementById("chart");
  const wrap = document.querySelector(".wrap");

  chart.style.transform = "scale(1)";
  chart.style.position = "absolute";
  chart.style.left = "0";
  chart.style.top = "0";

  const cs = getComputedStyle(wrap);
  const padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
  const padY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);

  const availW = window.innerWidth - padX;
  const availH = window.innerHeight - padY;

  const rect = chart.getBoundingClientRect();
  const contentW = rect.width;
  const contentH = rect.height;
  if (contentW <= 0 || contentH <= 0) return;

  const s = Math.min(availW / contentW, availH / contentH) * 0.995;
  chart.style.transform = `scale(${s})`;

  const scaledW = contentW * s;
  const scaledH = contentH * s;

  chart.style.left = `${Math.max(0, (availW - scaledW) / 2)}px`;
  chart.style.top  = `${Math.max(0, (availH - scaledH) / 2)}px`;
}

/* ---- MODAL ---- */
const backdrop = document.getElementById("backdrop");
const closeBtn = document.getElementById("closeBtn");
const bigGlyph = document.getElementById("bigGlyph");
const modalTitle = document.getElementById("modalTitle");
const modalSub = document.getElementById("modalSub");
const modalBody = document.getElementById("modalBody");

let lastFocusEl = null;

function block(title, items){
  const b = document.createElement("div");
  b.className = "block";
  const h = document.createElement("h3");
  h.textContent = title;
  const ul = document.createElement("ul");
  (items || ["(sem uso “padrão”; depende da convenção do autor)"]).forEach(t => {
    const li = document.createElement("li");
    li.textContent = t;
    ul.appendChild(li);
  });
  b.append(h, ul);
  return b;
}

function openModal(item){
  lastFocusEl = document.activeElement;

  const u = uses[item.id] || {};
  bigGlyph.textContent = item.glyph;
  modalTitle.textContent = item.name;
  modalSub.textContent = `${item.greek} · ${item.ipa}`;

  modalBody.innerHTML = "";
  modalBody.append(
    block("MATEMÁTICA", u.math),
    block("PROBABILIDADE", u.prob),
    block("ESTATÍSTICA", u.stats)
  );

  const note = document.createElement("div");
  note.className = "note";
  note.textContent = "Obs.: notações variam entre livros/áreas; aqui estão os usos mais comuns.";
  modalBody.appendChild(note);

  backdrop.hidden = false;
  backdrop.setAttribute("aria-hidden", "false");
  closeBtn.focus();
}

function closeModal(){
  backdrop.hidden = true;
  backdrop.setAttribute("aria-hidden", "true");
  if (lastFocusEl && typeof lastFocusEl.focus === "function") lastFocusEl.focus();
}

closeBtn.addEventListener("click", closeModal);
backdrop.addEventListener("click", (e) => {
  if (e.target === backdrop) closeModal();
});
window.addEventListener("keydown", (e) => {
  if (!backdrop.hidden && e.key === "Escape") closeModal();
});

/* init */
render();
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => fitToScreen());
} else {
  window.addEventListener("load", fitToScreen, { once: true });
}

window.addEventListener("resize", () => {
  clearTimeout(window.__fitT);
  window.__fitT = setTimeout(fitToScreen, 40);
});

const ro = new ResizeObserver(() => fitToScreen());
ro.observe(document.getElementById("chart"));

fitToScreen();
