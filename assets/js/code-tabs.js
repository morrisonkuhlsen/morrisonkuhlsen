// =========================
// SELETOR DE LINGUAGEM DOS BLOCOS DE CÓDIGO (Julia, R, Python)
// =========================
// Markup esperado (ver CLAUDE.md §4.1):
//   <div class="code-tabs">
//     <div class="code-tab" data-lang="julia"> code-container + code-output </div>
//     <div class="code-tab" data-lang="r"> ... </div>
//     <div class="code-tab" data-lang="python"> ... </div>
//   </div>
// O script troca o rótulo da linguagem no cabeçalho de cada bloco por botões,
// mostra só a versão escolhida e aplica a escolha a todos os blocos da página.
// A escolha fica salva em localStorage ("mk-code-lang"). Sem JavaScript, as três
// versões aparecem uma embaixo da outra.

(function () {
  "use strict";

  var CHAVE = "mk-code-lang";
  var NOMES = { julia: "Julia", r: "R", python: "Python" };

  function linguagemSalva() {
    try { return localStorage.getItem(CHAVE); } catch (e) { return null; }
  }

  function salvar(lang) {
    try { localStorage.setItem(CHAVE, lang); } catch (e) { /* modo privado: ignora */ }
  }

  function linguagensDe(grupo) {
    return Array.prototype.map.call(grupo.querySelectorAll(":scope > .code-tab"), function (aba) {
      return aba.getAttribute("data-lang");
    });
  }

  // Mostra a linguagem `lang` em todos os grupos que a têm.
  function aplicar(lang, focarGrupo) {
    document.querySelectorAll(".code-tabs").forEach(function (grupo) {
      var langs = linguagensDe(grupo);
      var escolhida = langs.indexOf(lang) >= 0 ? lang : langs[0];
      grupo.querySelectorAll(":scope > .code-tab").forEach(function (aba) {
        var ativa = aba.getAttribute("data-lang") === escolhida;
        aba.hidden = !ativa;
        aba.querySelectorAll(".code-lang-btn").forEach(function (btn) {
          var sel = btn.getAttribute("data-lang") === escolhida;
          btn.setAttribute("aria-selected", sel ? "true" : "false");
          btn.tabIndex = sel ? 0 : -1;
        });
      });
      if (grupo === focarGrupo) {
        var btn = grupo.querySelector(':scope > .code-tab:not([hidden]) .code-lang-btn[aria-selected="true"]');
        if (btn) btn.focus();
      }
    });
  }

  function montar(grupo, indice) {
    var langs = linguagensDe(grupo);
    grupo.classList.add("code-tabs--ativo");
    grupo.querySelectorAll(":scope > .code-tab").forEach(function (aba) {
      var rotulo = aba.querySelector(".code-lang");
      if (!rotulo) return;
      var lista = document.createElement("div");
      lista.className = "code-lang code-lang--tabs";
      lista.setAttribute("role", "tablist");
      lista.setAttribute("aria-label", document.documentElement.lang === "en" ? "Programming language" : "Linguagem de programação");
      langs.forEach(function (lang) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "code-lang-btn";
        btn.setAttribute("role", "tab");
        btn.setAttribute("data-lang", lang);
        btn.textContent = NOMES[lang] || lang;
        btn.addEventListener("click", function () {
          salvar(lang);
          aplicar(lang, grupo);
        });
        btn.addEventListener("keydown", function (ev) {
          var i = langs.indexOf(lang), novo = null;
          if (ev.key === "ArrowRight") novo = langs[(i + 1) % langs.length];
          if (ev.key === "ArrowLeft") novo = langs[(i - 1 + langs.length) % langs.length];
          if (ev.key === "Home") novo = langs[0];
          if (ev.key === "End") novo = langs[langs.length - 1];
          if (novo) { ev.preventDefault(); salvar(novo); aplicar(novo, grupo); }
        });
        lista.appendChild(btn);
      });
      aba.setAttribute("role", "tabpanel");
      aba.id = aba.id || "code-tab-" + indice + "-" + aba.getAttribute("data-lang");
      rotulo.replaceWith(lista);
    });
  }

  function iniciar() {
    var grupos = document.querySelectorAll(".code-tabs");
    if (!grupos.length) return;
    grupos.forEach(montar);
    aplicar(linguagemSalva() || "julia", null);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})();
