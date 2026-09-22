/* Comportamento do site: header sticky, mega-menu, gaveta mobile, índice do
   post, busca, tema e as barras dispensáveis. Sem dependências. */

(function () {
  'use strict';

  /* ── Header: transparente sobre o hero, sólido depois de rolar ───────────
     Um sentinel de 1px logo abaixo do topo diz quando o header saiu da área
     do hero. IntersectionObserver em vez de listener de scroll: o navegador
     só nos acorda na transição, não a cada quadro rolado. */
  function initHeader() {
    var header = document.querySelector('.site-header');
    if (!header) return;

    var overHero = header.classList.contains('is-over-hero');

    /* O sentinel fica 80px abaixo do topo do documento: enquanto ele estiver
       visível, estamos "no topo"; assim que a rolagem o empurra para fora da
       janela, o header vira a barra sólida. */
    var sentinel = document.createElement('div');
    sentinel.setAttribute('aria-hidden', 'true');
    sentinel.style.cssText = 'position:absolute;top:80px;left:0;width:1px;height:1px;pointer-events:none;';
    document.body.prepend(sentinel);

    var observer = new IntersectionObserver(function (entries) {
      var atTop = entries[0].isIntersecting;
      header.classList.toggle('is-scrolled', !atTop);
      if (overHero) header.classList.toggle('is-over-hero', atTop);
    }, { threshold: 0 });

    observer.observe(sentinel);
  }

  /* ── Mega-menu ───────────────────────────────────────────────────────────
     Um painel aberto por vez. Enquanto há painel aberto, o header fica sólido
     e o resto da página é desfocado. Fecha com Esc, clique fora ou Tab. */
  function initMegaMenu() {
    var toggles = document.querySelectorAll('[data-dropdown]');
    if (!toggles.length) return;

    var header = document.querySelector('.site-header');
    var blur = document.createElement('div');
    blur.className = 'page-blur';
    blur.setAttribute('aria-hidden', 'true');

    function panelOf(toggle) {
      return document.getElementById(toggle.getAttribute('aria-controls'));
    }

    /* O terceiro nível começa vazio e só aparece quando um item do segundo,
       que tenha filhos, é acionado. */
    function resetThird(panel) {
      panel.querySelectorAll('.megamenu__third').forEach(function (el) { el.hidden = true; });
      panel.querySelectorAll('[data-third-toggle]').forEach(function (el) {
        el.setAttribute('aria-expanded', 'false');
      });
    }

    function close(toggle) {
      var panel = panelOf(toggle);
      toggle.setAttribute('aria-expanded', 'false');
      if (panel) { panel.hidden = true; resetThird(panel); }
    }

    function closeAll(except) {
      toggles.forEach(function (t) { if (t !== except) close(t); });
      if (!document.querySelector('[data-dropdown][aria-expanded="true"]')) {
        header.classList.remove('is-menu-open');
        if (blur.parentNode) blur.remove();
      }
    }

    toggles.forEach(function (toggle) {
      toggle.addEventListener('click', function (event) {
        event.preventDefault();
        var wasOpen = toggle.getAttribute('aria-expanded') === 'true';
        closeAll(toggle);
        close(toggle);
        if (wasOpen) { closeAll(); return; }

        toggle.setAttribute('aria-expanded', 'true');
        var panel = panelOf(toggle);
        if (panel) panel.hidden = false;
        header.classList.add('is-menu-open');
        document.body.appendChild(blur);
      });
    });

    document.addEventListener('click', function (event) {
      if (event.target.closest('[data-third-toggle]')) {
        var button = event.target.closest('[data-third-toggle]');
        var panel = button.closest('.megamenu');
        var open = button.getAttribute('aria-expanded') === 'true';
        resetThird(panel);
        if (!open) {
          button.setAttribute('aria-expanded', 'true');
          var third = document.getElementById(button.dataset.thirdToggle);
          if (third) third.hidden = false;
        }
        return;
      }
      if (!event.target.closest('.site-nav__item') && !event.target.closest('.megamenu')) closeAll();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape') return;
      var open = document.querySelector('[data-dropdown][aria-expanded="true"]');
      closeAll();
      if (open) open.focus();
    });

    document.addEventListener('focusin', function (event) {
      if (!event.target.closest('.site-nav__item') && !event.target.closest('.megamenu')) closeAll();
    });
  }

  /* ── Gaveta mobile ───────────────────────────────────────────────────────── */
  function initDrawer() {
    var toggle = document.querySelector('[data-drawer-toggle]');
    var drawer = document.getElementById('site-drawer');
    if (!toggle || !drawer) return;

    var scrim = document.createElement('div');
    scrim.className = 'scrim';
    scrim.hidden = true;

    function setOpen(open) {
      toggle.setAttribute('aria-expanded', String(open));
      drawer.classList.toggle('is-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
      if (open) {
        document.body.appendChild(scrim);
        scrim.hidden = false;
        requestAnimationFrame(function () { scrim.classList.add('is-open'); });
        drawer.querySelector('a, button').focus();
      } else {
        scrim.classList.remove('is-open');
        scrim.hidden = true;
        if (scrim.parentNode) scrim.remove();
      }
    }

    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    scrim.addEventListener('click', function () { setOpen(false); });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && drawer.classList.contains('is-open')) {
        setOpen(false);
        toggle.focus();
      }
    });
  }

  /* ── "Mostrar mais" na lista de posts ────────────────────────────────────── */
  function initShowMore() {
    var button = document.querySelector('[data-show-more]');
    if (!button) return;
    var step = parseInt(button.dataset.showMore, 10) || 3;

    button.addEventListener('click', function () {
      var hidden = document.querySelectorAll('.post-item[hidden]');
      for (var i = 0; i < step && hidden[i]; i++) hidden[i].hidden = false;
      if (!document.querySelector('.post-item[hidden]')) button.hidden = true;
    });
  }

  /* ── Índice do post ──────────────────────────────────────────────────────
     Porta o bootstrap-toc da versão 1.0 para JS puro: mesma árvore
     (ul.nav > li > a.nav-link + ul.nav aninhada), sub-listas fechadas e
     item ativo = último título que já passou 80px abaixo do topo. */
  function initToc() {
    var content = document.getElementById('post-content');
    var nav = document.getElementById('toc');
    if (!content || !nav) return;

    var headings = Array.prototype.slice.call(content.querySelectorAll('h2, h3'));
    if (headings.length < 2) return;

    function slug(el, i) {
      return (el.textContent || '')
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'secao-' + i;
    }

    var root = document.createElement('ul');
    root.className = 'nav';

    /* Pilha de listas por nível: stack[0] é a raiz, stack[1] a sub-lista do
       último h2, e assim por diante. Um salto de nível sem pai (um h4 logo
       após um h2) cria a lista que falta, para nunca perder um item. */
    var base = Math.min.apply(null, headings.map(function (h) {
      return parseInt(h.tagName.charAt(1), 10);
    }));
    var stack = [root];

    headings.forEach(function (heading, i) {
      if (!heading.id) heading.id = slug(heading, i);

      var depth = parseInt(heading.tagName.charAt(1), 10) - base;
      while (stack.length > depth + 1) stack.pop();
      while (stack.length < depth + 1) {
        var parentLi = stack[stack.length - 1].lastElementChild;
        if (!parentLi) {
          parentLi = document.createElement('li');
          stack[stack.length - 1].appendChild(parentLi);
        }
        var sub = parentLi.querySelector(':scope > ul');
        if (!sub) {
          sub = document.createElement('ul');
          sub.className = 'nav';
          parentLi.appendChild(sub);
        }
        stack.push(sub);
      }

      var li = document.createElement('li');
      var a = document.createElement('a');
      a.className = 'nav-link';
      a.href = '#' + heading.id;
      a.textContent = heading.textContent;
      li.appendChild(a);
      stack[stack.length - 1].appendChild(li);
    });

    nav.appendChild(root);

    var links = Array.prototype.slice.call(nav.querySelectorAll('a.nav-link'));

    function update() {
      var limit = window.scrollY + 80;
      var activeId = null;
      headings.forEach(function (h) {
        if (h.getBoundingClientRect().top + window.scrollY <= limit) activeId = h.id;
      });

      links.forEach(function (a) { a.classList.remove('active'); });
      nav.querySelectorAll('.nav-link + ul').forEach(function (ul) { ul.style.display = ''; });
      if (!activeId) return;

      var active = nav.querySelector('a[href="#' + activeId + '"]');
      if (!active) return;
      active.classList.add('active');

      /* Abre as listas ancestrais e a lista filha direta do item ativo, e
         marca os pais como ativos — é o que a 1.0 faz. */
      var node = active.parentElement;
      while (node && node !== nav) {
        if (node.tagName === 'UL') {
          node.style.display = 'block';
          var parentLink = node.previousElementSibling;
          if (parentLink && parentLink.classList.contains('nav-link')) parentLink.classList.add('active');
        }
        node = node.parentElement;
      }
      var ownSub = active.nextElementSibling;
      if (ownSub && ownSub.tagName === 'UL') ownSub.style.display = 'block';
    }

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ── Blog: filtro por tag e paginação ────────────────────────────────────
     A tag ativa vem de ?tag= na URL, então um link de tag num post abre o
     blog já filtrado. A alternância esquerda/direita é aplicada sobre a
     lista visível, não sobre a original — senão o padrão quebra ao filtrar. */
  function initBlog() {
    var list = document.getElementById('blog-list');
    if (!list) return;

    var PAGE_SIZE = 8;
    var cards = Array.prototype.slice.call(list.querySelectorAll('.blog-card'));
    var filters = document.querySelectorAll('.blog__filter');
    var empty = document.getElementById('blog-empty');
    var more = document.getElementById('blog-more');
    var moreBtn = document.getElementById('blog-more-btn');

    var shown = 0;
    var matching = [];

    function render() {
      cards.forEach(function (card) { card.hidden = true; });
      matching.forEach(function (card, i) {
        card.hidden = i >= shown;
        card.classList.toggle('blog-card--reverse', i % 2 !== 0);
      });
      empty.hidden = matching.length !== 0;
      more.hidden = shown >= matching.length;
    }

    function filter(tag) {
      matching = cards.filter(function (card) {
        if (tag === 'all') return true;
        return (card.dataset.tags || '').split(',').indexOf(tag) !== -1;
      });
      shown = Math.min(PAGE_SIZE, matching.length);
      render();

      filters.forEach(function (f) {
        f.classList.toggle('is-active', f.dataset.filter === tag);
      });
    }

    moreBtn.addEventListener('click', function () {
      shown = Math.min(shown + PAGE_SIZE, matching.length);
      render();
    });

    filters.forEach(function (f) {
      f.addEventListener('click', function (event) {
        event.preventDefault();
        var tag = f.dataset.filter;
        history.pushState({}, '', tag === 'all' ? location.pathname : '?tag=' + encodeURIComponent(tag));
        filter(tag);
      });
    });

    /* Voltar e avançar no histórico refiltram, já que a tag mora na URL. */
    window.addEventListener('popstate', function () {
      filter(new URLSearchParams(location.search).get('tag') || 'all');
    });

    filter(new URLSearchParams(location.search).get('tag') || 'all');
  }

  /* ── Tema claro/escuro ───────────────────────────────────────────────────
     O tema já foi aplicado no <head> para evitar o flash; aqui só cuidamos
     do clique, da persistência e de avisar o giscus, que roda num iframe e
     não enxerga o data-theme da página. */
  function initTheme() {
    var button = document.querySelector('[data-theme-toggle]');
    if (!button) return;

    var root = document.documentElement;

    function syncGiscus(theme) {
      var frame = document.querySelector('iframe.giscus-frame');
      if (!frame) return;
      frame.contentWindow.postMessage(
        { giscus: { setConfig: { theme: theme === 'dark' ? 'dark' : 'light' } } },
        'https://giscus.app'
      );
    }

    function apply(theme) {
      if (theme === 'dark') root.dataset.theme = 'dark';
      else delete root.dataset.theme;
      /* Seis posts trazem regras `.dark-mode ...` no próprio <style>, escritas
         para o tema antigo. A classe ficou órfã quando ele saiu; religá-la faz
         esses posts usarem as cores escuras que o autor já tinha definido. */
      root.classList.toggle('dark-mode', theme === 'dark');
      button.setAttribute('aria-pressed', String(theme === 'dark'));
      syncGiscus(theme);
      try { localStorage.setItem('mk-theme', theme); } catch (e) {}
    }

    apply(root.dataset.theme === 'dark' ? 'dark' : 'light');

    button.addEventListener('click', function () {
      apply(root.dataset.theme === 'dark' ? 'light' : 'dark');
    });

    /* O iframe do giscus carrega depois; reaplica o tema quando ele avisar
       que está pronto. */
    window.addEventListener('message', function (event) {
      if (event.origin !== 'https://giscus.app') return;
      if (event.data && event.data.giscus) syncGiscus(root.dataset.theme);
    });
  }

  /* ── Busca ───────────────────────────────────────────────────────────────
     Sem Lunr, e não só por peso: o pipeline padrão do Lunr faz stemming em
     inglês, o que atrapalha num site majoritariamente em português. Para ~70
     documentos, casar prefixos de token sem acento é mais rápido e acerta
     mais. O índice é buscado uma vez, na primeira abertura. */
  function initSearch() {
    var overlay = document.getElementById('search');
    var input = document.getElementById('search-input');
    var results = document.getElementById('search-results');
    var closeBtn = document.getElementById('search-close');
    if (!overlay || !input) return;

    var lang = document.documentElement.lang || 'pt';
    var docs = null;
    var loading = false;
    var active = -1;

    function fold(text) {
      return (text || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
    }

    function load() {
      if (docs || loading) return Promise.resolve();
      loading = true;
      /* site.js é servido como asset estático, sem passar pelo Liquid; a URL
         do índice vem do data-* do próprio <script>, que o layout preenche. */
      var src = document.currentScript || document.querySelector('script[data-search-index]');
      var url = (src && src.dataset.searchIndex) || '/search.json';
      return fetch(url)
        .then(function (r) { return r.json(); })
        .then(function (data) {
          docs = data
            .filter(function (d) { return d.l === lang; })
            .map(function (d) {
              d._t = fold(d.t);
              d._e = fold(d.e);
              d._g = fold(d.g);
              return d;
            });
        })
        .catch(function () { docs = []; })
        .then(function () { loading = false; });
    }

    /* Pontua por onde o termo aparece: título vale mais que tag, que vale
       mais que resumo. Todos os termos precisam casar em algum campo. */
    function score(doc, terms) {
      var total = 0;
      for (var i = 0; i < terms.length; i++) {
        var term = terms[i];
        var hit = 0;
        if (doc._t.indexOf(term) !== -1) hit += doc._t.indexOf(term) === 0 ? 14 : 10;
        if (doc._g.indexOf(term) !== -1) hit += 5;
        if (doc._e.indexOf(term) !== -1) hit += 1;
        if (!hit) return 0;
        total += hit;
      }
      return total;
    }

    function highlight(text, terms) {
      var folded = fold(text);
      var marks = [];
      terms.forEach(function (term) {
        var at = folded.indexOf(term);
        while (at !== -1) {
          marks.push([at, at + term.length]);
          at = folded.indexOf(term, at + term.length);
        }
      });
      if (!marks.length) return escapeHtml(text);

      marks.sort(function (a, b) { return a[0] - b[0]; });
      var out = '';
      var cursor = 0;
      marks.forEach(function (m) {
        if (m[0] < cursor) return;
        out += escapeHtml(text.slice(cursor, m[0])) + '<mark>' + escapeHtml(text.slice(m[0], m[1])) + '</mark>';
        cursor = m[1];
      });
      return out + escapeHtml(text.slice(cursor));
    }

    function escapeHtml(text) {
      var div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    function rotulo(doc) {
      if (doc.k === 'post') {
        return (lang === 'en' ? 'ARTICLE' : 'ARTIGO') + (doc.d ? ' · ' + doc.d : '');
      }
      if (doc.k === 'tool') return lang === 'en' ? 'TOOL' : 'FERRAMENTA';
      if (doc.k === 'term') return lang === 'en' ? 'TERM' : 'VERBETE';
      return lang === 'en' ? 'PAGE' : 'PÁGINA';
    }

    function render(query) {
      results.innerHTML = '';
      active = -1;
      input.setAttribute('aria-expanded', 'false');

      var terms = fold(query).split(/\s+/).filter(Boolean);
      if (!terms.length || !docs) return;

      var hits = docs
        .map(function (d) { return { doc: d, s: score(d, terms) }; })
        .filter(function (h) { return h.s > 0; })
        .sort(function (a, b) { return b.s - a.s; })
        .slice(0, 8);

      if (!hits.length) {
        results.innerHTML = '<p class="search__empty">' +
          (lang === 'en' ? 'No results found.' : 'Nenhum resultado encontrado.') + '</p>';
        return;
      }

      hits.forEach(function (hit) {
        var a = document.createElement('a');
        a.className = 'search__result';
        a.href = hit.doc.u;
        a.setAttribute('role', 'option');
        a.innerHTML =
          '<span class="search__result-title">' + highlight(hit.doc.t, terms) + '</span>' +
          '<span class="search__result-excerpt">' + highlight(hit.doc.e, terms) + '</span>' +
          '<span class="search__result-meta">' + rotulo(hit.doc) + '</span>';
        results.appendChild(a);
      });

      input.setAttribute('aria-expanded', 'true');
    }

    function setActive(index) {
      var items = results.querySelectorAll('.search__result');
      if (!items.length) return;
      if (index < 0) index = items.length - 1;
      if (index >= items.length) index = 0;
      items.forEach(function (el) { el.classList.remove('is-active'); });
      items[index].classList.add('is-active');
      items[index].scrollIntoView({ block: 'nearest' });
      active = index;
    }

    function open() {
      overlay.hidden = false;
      document.body.style.overflow = 'hidden';
      input.value = '';
      results.innerHTML = '';
      active = -1;
      input.focus();
      load();
    }

    function close() {
      overlay.hidden = true;
      document.body.style.overflow = '';
    }

    document.addEventListener('click', function (event) {
      if (event.target.closest('[data-search-open]')) { event.preventDefault(); open(); }
    });

    if (closeBtn) closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', function (event) {
      if (event.target === overlay) close();
    });

    input.addEventListener('input', function () {
      load().then(function () { render(input.value); });
    });

    document.addEventListener('keydown', function (event) {
      var typing = /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName) || event.target.isContentEditable;

      if (((event.key === 'k' || event.key === 'K') && (event.ctrlKey || event.metaKey)) ||
          (event.key === '/' && !typing)) {
        event.preventDefault();
        open();
        return;
      }

      if (overlay.hidden) return;

      if (event.key === 'Escape') { close(); return; }
      if (event.key === 'ArrowDown') { event.preventDefault(); setActive(active + 1); }
      if (event.key === 'ArrowUp') { event.preventDefault(); setActive(active - 1); }
      if (event.key === 'Enter' && active >= 0) {
        var item = results.querySelectorAll('.search__result')[active];
        if (item) { event.preventDefault(); item.click(); }
      }
    });
  }

  /* ── Barra de anúncio e aviso de cookies ─────────────────────────────────
     Ambos nascem escondidos no HTML e só aparecem se ainda não foram
     dispensados — assim nada pisca para quem já os fechou. */
  function initDismissables() {
    var root = document.documentElement;

    var annbar = document.getElementById('annbar');
    if (annbar) {
      var seen = false;
      try { seen = localStorage.getItem('mk-annbar') === '1'; } catch (e) {}

      if (!seen) {
        annbar.hidden = false;
        var measure = function () {
          root.style.setProperty('--annbar-h', annbar.offsetHeight + 'px');
        };
        measure();
        window.addEventListener('resize', measure);

        annbar.querySelector('[data-annbar-close]').addEventListener('click', function (event) {
          /* O botão vive dentro do link — sem isto, fechar navegaria. */
          event.preventDefault();
          event.stopPropagation();
          annbar.hidden = true;
          root.style.removeProperty('--annbar-h');
          try { localStorage.setItem('mk-annbar', '1'); } catch (e) {}
        });
      }
    }

    var cookiebar = document.getElementById('cookiebar');
    if (cookiebar) {
      var accepted = false;
      try { accepted = localStorage.getItem('mk-cookies') === '1'; } catch (e) {}

      if (!accepted) {
        cookiebar.hidden = false;
        cookiebar.querySelector('[data-cookiebar-accept]').addEventListener('click', function () {
          cookiebar.hidden = true;
          try { localStorage.setItem('mk-cookies', '1'); } catch (e) {}
        });
      }
    }
  }

  /* ── Card de anúncio do post ─────────────────────────────────────────────
     Mesma regra das barras dispensáveis: nasce escondido e só aparece se
     ainda não foi fechado. Os slots se revezam por CSS — aqui só anda a
     classe `is-on`. O relógio para com a aba em segundo plano e enquanto o
     cursor está sobre o card, para a troca não acontecer sob o clique. */
  function initAdCard() {
    var card = document.querySelector('[data-adcard]');
    if (!card) return;

    var fechado = false;
    try { fechado = localStorage.getItem('mk-adcard') === '1'; } catch (e) {}
    if (fechado) return;

    card.hidden = false;

    /* Capa sorteada, quando o slot traz uma lista. O HTML já sai com a
       primeira, então sem JS ainda se vê uma imagem. */
    card.querySelectorAll('[data-images]').forEach(function (img) {
      var fontes;
      try { fontes = JSON.parse(img.dataset.images); } catch (e) { return; }
      if (!fontes || !fontes.length) return;
      img.src = fontes[Math.floor(Math.random() * fontes.length)];
    });

    var slots = card.querySelectorAll('.adcard__slot');
    var relogio = null;

    if (slots.length > 1) {
      var espera = parseInt(card.dataset.rotate, 10) || 9000;
      var atual = 0;
      var parado = false;

      relogio = setInterval(function () {
        if (document.hidden || parado) return;
        slots[atual].classList.remove('is-on');
        atual = (atual + 1) % slots.length;
        slots[atual].classList.add('is-on');
      }, espera);

      var segurar = function () { parado = true; };
      var soltar = function () { parado = false; };
      card.addEventListener('mouseenter', segurar);
      card.addEventListener('mouseleave', soltar);
      card.addEventListener('focusin', segurar);
      card.addEventListener('focusout', soltar);
    }

    card.querySelector('[data-adcard-close]').addEventListener('click', function () {
      card.hidden = true;
      if (relogio) clearInterval(relogio);
      try { localStorage.setItem('mk-adcard', '1'); } catch (e) {}
    });
  }

  /* ── Barra de ações do post ──────────────────────────────────────────────
     Copiar link, escala de leitura e voltar ao topo. A escala fica no
     localStorage, então o leitor a escolhe uma vez e ela vale nos próximos
     artigos. */
  function initRail() {
    var rail = document.querySelector('[data-rail]');
    if (!rail) return;

    var root = document.documentElement;
    var PASSOS = [0.9, 1, 1.1, 1.25, 1.4];
    var nivel = 1;

    try {
      var guardado = parseInt(localStorage.getItem('mk-prose-scale'), 10);
      if (!isNaN(guardado)) nivel = Math.min(Math.max(guardado, 0), PASSOS.length - 1);
    } catch (e) {}

    function aplicarEscala() {
      root.style.setProperty('--prose-scale', PASSOS[nivel]);
      rail.querySelectorAll('[data-rail-font]').forEach(function (b) {
        var passo = parseInt(b.dataset.railFont, 10);
        b.disabled = (passo < 0 && nivel === 0) || (passo > 0 && nivel === PASSOS.length - 1);
        b.style.opacity = b.disabled ? 0.35 : '';
      });
      try { localStorage.setItem('mk-prose-scale', String(nivel)); } catch (e) {}
    }

    aplicarEscala();

    rail.addEventListener('click', function (event) {
      var alvo = event.target.closest('button');
      if (!alvo) return;

      if (alvo.dataset.railFont) {
        nivel = Math.min(Math.max(nivel + parseInt(alvo.dataset.railFont, 10), 0), PASSOS.length - 1);
        aplicarEscala();
        return;
      }

      if (alvo.hasAttribute('data-rail-top')) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      if (alvo.hasAttribute('data-rail-copy')) {
        var url = alvo.dataset.url || location.href;
        var confirmar = function () {
          alvo.classList.add('is-done');
          setTimeout(function () { alvo.classList.remove('is-done'); }, 1800);
        };
        /* clipboard.writeText não existe fora de https/localhost e ainda pode
           rejeitar por falta de ativação do usuário — então o plano B roda
           também no rejeitado, não só quando a API falta. */
        var planoB = function () {
          var campo = document.createElement('textarea');
          campo.value = url;
          campo.style.cssText = 'position:fixed;top:0;opacity:0';
          document.body.appendChild(campo);
          campo.select();
          try { document.execCommand('copy'); confirmar(); } catch (e) {}
          campo.remove();
        };

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(confirmar, planoB);
        } else {
          planoB();
        }
      }
    });
  }

  /* ── Filtro do glossário ─────────────────────────────────────────────────
     Reduz a lista enquanto se digita. Compara sem acento, como a busca do
     site: quem procura "media" tem que achar "Média". Esconder um grupo
     inteiro quando nenhum verbete dele sobra evita a letra órfã. */
  function initGlossary() {
    var glossario = document.querySelector('[data-glossary]');
    if (!glossario) return;

    var campo = glossario.querySelector('[data-glossary-filter]');
    var vazio = glossario.querySelector('[data-glossary-empty]');
    var itens = glossario.querySelectorAll('[data-glossary-item]');
    var grupos = glossario.querySelectorAll('[data-glossary-group]');

    function dobrar(texto) {
      return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    }

    campo.addEventListener('input', function () {
      var busca = dobrar(campo.value.trim());
      var achou = 0;

      itens.forEach(function (item) {
        var casa = !busca || dobrar(item.dataset.term).indexOf(busca) !== -1;
        item.hidden = !casa;
        if (casa) achou++;
      });

      grupos.forEach(function (grupo) {
        var visivel = grupo.querySelector('[data-glossary-item]:not([hidden])');
        grupo.hidden = !visivel;
      });

      vazio.hidden = achou !== 0;
    });
  }

  /* ── Tabelas roláveis no celular ─────────────────────────────────────────── */
  function initTables() {
    document.querySelectorAll('.prose table').forEach(function (table) {
      if (table.parentElement.classList.contains('table-wrap')) return;
      var wrap = document.createElement('div');
      wrap.className = 'table-wrap';
      table.parentNode.insertBefore(wrap, table);
      wrap.appendChild(table);
    });
  }

  function init() {
    initHeader();
    initMegaMenu();
    initDrawer();
    initShowMore();
    initToc();
    initTheme();
    initBlog();
    initSearch();
    initDismissables();
    initAdCard();
    initRail();
    initTables();
    initGlossary();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
