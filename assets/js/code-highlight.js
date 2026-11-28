// =========================
// REALCE DE SINTAXE DOS BLOCOS DE CÓDIGO
// =========================
//
// Colore os blocos .code-content code de Julia, R, Python, Bash e Lean, sem
// biblioteca externa. A linguagem vem do data-lang da aba (code-tabs) ou do
// rótulo .code-lang do bloco. Saídas (.code-output) e blocos sem linguagem
// conhecida ficam como estão; blocos que já trazem cores feitas à mão
// (<span> dentro do <code>) também.
//
// Cada trecho colorido termina na própria linha: o code-copy.js divide o HTML
// por "\n" para numerar as linhas, e um <span> não pode atravessar a quebra.
// As classes são as de assets/css/code-container.css (code-keyword etc.).
//
// Linguagem nova: acrescente uma entrada em LINGUAGENS e o rótulo em APELIDOS.

(function () {
  "use strict";

  function palavras(lista) {
    var conjunto = Object.create(null);
    lista.split(/\s+/).forEach(function (p) { if (p) conjunto[p] = true; });
    return conjunto;
  }

  var LINGUAGENS = {
    julia: {
      comentarioLinha: "#",
      comentarioBloco: ["#=", "=#"],
      aspasTriplas: true,
      aspas: ['"'],
      macro: /^@[A-Za-z_][\w!]*/,
      simbolo: true,
      chaves: palavras("function end if elseif else for while in return using import export module " +
        "struct mutable abstract type begin let local global const do try catch finally break continue " +
        "macro quote where isa"),
      literais: palavras("true false nothing missing NaN Inf π"),
      nomeFuncao: /^[A-Za-z_][\w]*!?(?=\()/
    },
    r: {
      comentarioLinha: "#",
      aspas: ['"', "'"],
      chaves: palavras("function if else for while repeat in return next break library require"),
      literais: palavras("TRUE FALSE NULL NA NaN Inf NA_integer_ NA_real_ NA_character_ T F"),
      nomeFuncao: /^[A-Za-z_.][\w.]*(?=\()/
    },
    python: {
      comentarioLinha: "#",
      aspasTriplas: true,
      aspas: ['"', "'"],
      prefixoString: /^[rRbBuUfF]{1,2}(?=["'])/,
      macro: /^@[A-Za-z_][\w.]*/,
      chaves: palavras("def return if elif else for while in not and or is import from as class " +
        "with try except finally raise lambda yield pass break continue global nonlocal assert del async await"),
      literais: palavras("True False None"),
      nomeFuncao: /^[A-Za-z_]\w*(?=\()/
    },
    bash: {
      comentarioLinha: "#",
      aspas: ['"', "'"],
      chaves: palavras("if then else elif fi for while do done case esac in function return export local"),
      literais: palavras(""),
      nomeFuncao: null
    },
    lean: {
      comentarioLinha: "--",
      comentarioBloco: ["/-", "-/"],
      aspas: ['"'],
      chaves: palavras("theorem lemma example def abbrev instance structure class inductive where by fun " +
        "have show from let in if then else match with do open namespace section end variable import " +
        "noncomputable private protected universe set_option calc at"),
      // táticas mais comuns: aparecem como "função"
      taticas: palavras("intro intros exact apply refine rw rewrite simp simp_all norm_num ring ring_nf " +
        "field_simp linarith nlinarith omega decide induction cases rcases obtain constructor use " +
        "interval_cases unfold push_cast positivity gcongr sorry trivial rfl exact? aesop tauto"),
      literais: palavras("true false True False"),
      macro: /^#[A-Za-z_]\w*/,
      nomeFuncao: null
    }
  };

  var APELIDOS = {
    julia: "julia", jl: "julia",
    r: "r",
    python: "python", py: "python",
    bash: "bash", sh: "bash", shell: "bash", zsh: "bash",
    lean: "lean", lean4: "lean"
  };

  function escapar(texto) {
    return texto.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // Envolve o texto na classe, linha por linha (nenhum span cruza "\n")
  function trecho(texto, classe) {
    if (!classe) return escapar(texto);
    return texto.split("\n").map(function (parte) {
      return parte ? '<span class="' + classe + '">' + escapar(parte) + "</span>" : "";
    }).join("\n");
  }

  // Fim de uma string que começa em i (aspas simples ou triplas), com escapes
  function fimString(fonte, i, delim) {
    var j = i + delim.length;
    while (j < fonte.length) {
      if (fonte[j] === "\\" && delim.length === 1) { j += 2; continue; }
      if (fonte.startsWith(delim, j)) return j + delim.length;
      if (delim.length === 1 && fonte[j] === "\n") return j;   // string sem fechar: para na linha
      j++;
    }
    return fonte.length;
  }

  var NUMERO = /^(?:0[xX][0-9a-fA-F_]+|(?:\d[\d_]*\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)(?:im|L|i)?/;
  var IDENT = /^[A-Za-z_À-ɏͰ-Ͽ][\w!?À-ɏͰ-Ͽ']*/;

  function realcar(fonte, nome) {
    var L = LINGUAGENS[nome];
    if (!L) return null;
    var saida = [];
    var i = 0, n = fonte.length;
    var anterior = "";            // último caractere que não é espaço, para decidir símbolos e números

    while (i < n) {
      var resto = fonte.slice(i);
      var c = fonte[i];
      var m;

      // comentário de bloco
      if (L.comentarioBloco && resto.startsWith(L.comentarioBloco[0])) {
        var fimB = fonte.indexOf(L.comentarioBloco[1], i + L.comentarioBloco[0].length);
        fimB = fimB < 0 ? n : fimB + L.comentarioBloco[1].length;
        saida.push(trecho(fonte.slice(i, fimB), "code-comment"));
        i = fimB; continue;
      }
      // comentário de linha
      if (resto.startsWith(L.comentarioLinha)) {
        var fimL = fonte.indexOf("\n", i);
        fimL = fimL < 0 ? n : fimL;
        saida.push(trecho(fonte.slice(i, fimL), "code-comment"));
        i = fimL; continue;
      }
      // prefixo de string (Python: f"", r"", b"")
      var prefixo = "";
      if (L.prefixoString && (m = resto.match(L.prefixoString)) && !/[\w]/.test(fonte[i - 1] || "")) {
        prefixo = m[0];
      }
      var k = i + prefixo.length;
      // string
      if (L.aspas.indexOf(fonte[k]) >= 0) {
        var aspa = fonte[k];
        var delim = L.aspasTriplas && fonte.startsWith(aspa + aspa + aspa, k) ? aspa + aspa + aspa : aspa;
        var fimS = fimString(fonte, k, delim);
        saida.push(trecho(fonte.slice(i, fimS), "code-string"));
        i = fimS; anterior = aspa; continue;
      }
      // caractere em Julia: 'a', '\n'
      if (nome === "julia" && c === "'" && !/[\w)\]}.']/.test(anterior)) {
        var mc = resto.match(/^'(?:\\.|[^'\\\n])'/);
        if (mc) { saida.push(trecho(mc[0], "code-string")); i += mc[0].length; anterior = "'"; continue; }
      }
      // macro / diretiva (@printf, @decorador, #print)
      if (L.macro && (m = resto.match(L.macro))) {
        saida.push(trecho(m[0], "code-module"));
        i += m[0].length; anterior = "x"; continue;
      }
      // símbolo do Julia (:gray), mas não faixas (1:n, a:b) nem o ternário (x ? a : b)
      if (L.simbolo && c === ":" && !/[\w)\]}.:'"]/.test(anterior) && (m = resto.match(/^:[A-Za-z_]\w*/))) {
        saida.push(trecho(m[0], "code-operator"));
        i += m[0].length; anterior = "x"; continue;
      }
      // número (não pode estar grudado num nome, como x1)
      if (/[\d.]/.test(c) && !/[\w]/.test(fonte[i - 1] || "") && (m = resto.match(NUMERO)) && m[0] !== ".") {
        saida.push(trecho(m[0], "code-number"));
        i += m[0].length; anterior = "0"; continue;
      }
      // identificador
      if ((m = resto.match(IDENT))) {
        var palavra = m[0];
        var classe = null;
        if (L.chaves[palavra]) classe = "code-keyword";
        else if (L.literais[palavra]) classe = "code-number";
        else if (L.taticas && L.taticas[palavra]) classe = "code-function";
        else if (L.nomeFuncao && L.nomeFuncao.test(resto)) {
          var mf = resto.match(L.nomeFuncao);
          palavra = mf[0];
          classe = "code-function";
        }
        // depois de um ponto (campo: s.q1, np.mean) a palavra não é palavra-chave
        if (classe === "code-keyword" && anterior === ".") classe = null;
        saida.push(trecho(palavra, classe));
        i += palavra.length; anterior = palavra[palavra.length - 1]; continue;
      }
      // qualquer outro caractere
      saida.push(escapar(c));
      if (!/\s/.test(c)) anterior = c;
      i++;
    }
    return saida.join("");
  }

  function linguagemDoBloco(code) {
    var aba = code.closest(".code-tab");
    var rotulo = aba && aba.dataset.lang;
    if (!rotulo) {
      var container = code.closest(".code-container");
      var el = container && container.querySelector(".code-lang");
      rotulo = el ? el.textContent : "";
    }
    return APELIDOS[(rotulo || "").trim().toLowerCase()] || null;
  }

  function realcarPagina() {
    document.querySelectorAll(".code-content code").forEach(function (code) {
      if (code.dataset.hlReady === "true") return;
      if (code.closest(".code-output")) return;
      if (code.querySelector("span")) return;          // cores feitas à mão
      var nome = linguagemDoBloco(code);
      if (!nome) return;
      var html = realcar(code.textContent, nome);
      if (html !== null) {
        code.innerHTML = html;
        code.dataset.hlReady = "true";
        code.classList.add("language-" + nome);
      }
    });
  }

  // Saídas (.code-output pre): cores leves, iguais para qualquer linguagem.
  // Números, valores lógicos, erros/avisos e o objetivo do Lean (⊢).
  // Número pode terminar em unidade imaginária (0.8660i, 1.0im, 2j), e nunca
  // casa só o começo de outro (o "0" de "0.8660i"): por isso o (?!\.\d).
  var SAIDA = /(\b(?:error|erro|Error|ERROR)\b)|(\b(?:warning|aviso|Warning|WARNING)\b)|(\b(?:true|false|TRUE|FALSE|True|False|nothing|None|NULL|NA|NaN|Inf|missing)\b)|((?:^|(?<=[^\w.]))[-−]?(?:\d[\d_]*\.?\d*|\.\d+)(?:[eE][+-]?\d+)?(?:%|im|i|j)?(?![\w]|\.\d))|(⊢)/g;
  var CLASSE_SAIDA = [null, "code-error", "code-warning", "code-builtin", "code-number", "code-function"];

  function realcarSaida(fonte) {
    var saida = [], ultimo = 0, m;
    SAIDA.lastIndex = 0;
    while ((m = SAIDA.exec(fonte))) {
      if (m[0] === "") { SAIDA.lastIndex++; continue; }
      saida.push(escapar(fonte.slice(ultimo, m.index)));
      var grupo = 1;
      while (m[grupo] === undefined) grupo++;
      saida.push(trecho(m[0], CLASSE_SAIDA[grupo]));
      ultimo = m.index + m[0].length;
    }
    saida.push(escapar(fonte.slice(ultimo)));
    return saida.join("");
  }

  function realcarSaidas() {
    document.querySelectorAll(".code-output pre").forEach(function (pre) {
      if (pre.dataset.hlReady === "true" || pre.querySelector("span")) return;
      pre.innerHTML = realcarSaida(pre.textContent);
      pre.dataset.hlReady = "true";
    });
  }

  if (typeof window !== "undefined") {
    window.mkRealcarPagina = function () { realcarPagina(); realcarSaidas(); };
  }
  if (typeof module !== "undefined") {
    module.exports = { realcar: realcar, realcarSaida: realcarSaida, LINGUAGENS: LINGUAGENS };
  }
})();
