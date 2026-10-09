#!/usr/bin/env python3
"""Gera /en/formulas/ a partir das páginas em português e liga as duas versões.

As traduções ficam em scripts/formulas_en_data.py. Rode depois de mexer numa
página de /formulas/ ou nas traduções:

    python3 scripts/gera-formulas-en.py

O script também acrescenta (uma vez só) os hreflang e o link "English" nas
páginas em português, e falha se algum texto esperado não for encontrado.
"""
import html
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from formulas_en_data import PAGES, CATEGORIES, BLURBS, INDEX  # noqa: E402

ROOT = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parent.parent
PT_DIR = ROOT / "formulas"
EN_DIR = ROOT / "en" / "formulas"
EN_DIR.mkdir(parents=True, exist_ok=True)
SITE = "https://morrisonkuhlsen.com"


def sub1(s, old, new, count=1):
    n = s.count(old)
    assert n == count, (n, old[:100])
    return s.replace(old, new)


def resub(s, pat, repl, count=1, flags=0):
    out, n = re.subn(pat, repl, s, flags=flags)
    assert n == count, (n, pat[:100])
    return out


def esc(t):
    return html.escape(t, quote=True)


def hreflang(pt_url, en_url):
    return (f'  <link rel="alternate" hreflang="pt-BR" href="{pt_url}">\n'
            f'  <link rel="alternate" hreflang="en" href="{en_url}">\n'
            f'  <link rel="alternate" hreflang="x-default" href="{pt_url}">\n')


def lang_link(href, code, label):
    return f'<a class="lang-link" href="{href}" hreflang="{code}" lang="{code}">{label}</a>'


def link_pt(s, pt_url, en_url, en_path):
    """Acrescenta hreflang e o link "English" a uma página em português."""
    if 'hreflang="en"' in s:
        return s
    s = resub(s, r'(  <link rel="canonical" href="[^"]+">\n)', lambda m: m.group(1) + hreflang(pt_url, en_url))
    s = resub(s, r'(<a href="[^"]*" class="back-link"[^>]*>.*?</a>)',
              lambda m: m.group(1) + "\n  " + lang_link(en_path, "en", "English"), flags=re.S)
    return s


COMMON = [
    ('<html lang="pt-BR">', '<html lang="en">'),
    ('<meta property="og:locale" content="pt_BR">', '<meta property="og:locale" content="en_US">'),
    ('href="style.css"', 'href="/formulas/style.css"'),
    ('src="script.js"', 'src="/formulas/script.js"'),
]
FORMULA_COMMON = [
    ('aria-label="Todas as fórmulas" title="Todas as fórmulas"', 'aria-label="All formulas" title="All formulas"'),
    ('Toque num termo para ver o que ele significa, ou <button type="button" class="toggle-all" aria-pressed="false">mostre todos</button>.',
     'Tap a term to see what it means, or <button type="button" class="toggle-all" aria-pressed="false">show them all</button>.'),
    ('<h2>O que significa cada termo</h2>', '<h2>What each term means</h2>'),
    ('aria-label="Outras fórmulas"', 'aria-label="Other formulas"'),
]
CALC_COMMON = [
    ('<h2 id="calc-title">Calcule</h2>', '<h2 id="calc-title">Calculate</h2>'),
    ('<h3>Passo a passo</h3>', '<h3>Step by step</h3>'),
]


def meta_text(s, title, desc):
    pt_title = re.search(r"<title>(.*?)</title>", s).group(1)
    s = sub1(s, f"<title>{pt_title}</title>", f"<title>{esc(title)}</title>")
    # og:title e twitter:title podem trazer o título com o apóstrofo escapado.
    variants = {pt_title, html.escape(pt_title, quote=True)}
    assert sum(s.count(f'content="{v}"') for v in variants) == 2, pt_title
    for v in variants:
        s = s.replace(f'content="{v}"', f'content="{esc(title)}"')
    for pat in [r'(<meta name="description" content=")[^"]*(")', r'(<meta property="og:description" content=")[^"]*(")',
                r'(<meta name="twitter:description" content=")[^"]*(")']:
        s = resub(s, pat, lambda m: m.group(1) + esc(desc) + m.group(2))
    return s


def seq(s, pat, items, make):
    """Troca, em ordem, cada ocorrência de pat pelo item correspondente."""
    found = list(re.finditer(pat, s, flags=re.S))
    assert len(found) == len(items), (pat[:60], len(found), len(items))
    out, last = [], 0
    for m, it in zip(found, items):
        out.append(s[last:m.start()])
        out.append(make(m, it))
        last = m.end()
    out.append(s[last:])
    return "".join(out)


def clean(s):
    """Tira o que link_pt já acrescentou, para o gerador poder rodar de novo."""
    s = re.sub(r'  <link rel="alternate" hreflang="[^"]+" href="[^"]+">\n', "", s)
    return re.sub(r'\n  <a class="lang-link"[^>]*>[^<]*</a>', "", s)


def build(slug, d):
    s = clean((PT_DIR / f"{slug}.html").read_text())
    en = d["en"]
    pt_url, en_url = f"{SITE}/formulas/{slug}.html", f"{SITE}/en/formulas/{en}.html"

    # A página em português ganha os links para a inglesa.
    (PT_DIR / f"{slug}.html").write_text(link_pt(s, pt_url, en_url, f"/en/formulas/{en}.html"))

    for a, b in COMMON + FORMULA_COMMON:
        s = sub1(s, a, b)
    if '<section class="calc"' in s:
        for a, b in CALC_COMMON:
            s = sub1(s, a, b)
    s = meta_text(s, d["title"], d["desc"])
    s = sub1(s, pt_url, en_url, 2)  # canonical e og:url
    s = resub(s, r'(  <link rel="canonical" href="[^"]+">\n)', lambda m: m.group(1) + hreflang(pt_url, en_url))
    s = resub(s, r'(<a href="\./" class="back-link"[^>]*>.*?</a>)',
              lambda m: m.group(1) + "\n  " + lang_link(f"/formulas/{slug}.html", "pt-BR", "Português"), flags=re.S)
    s = resub(s, r'(<h1 id="title" class="formula-title">)[^<]*(</h1>)', lambda m: m.group(1) + esc(d["h1"]) + m.group(2))
    s = resub(s, r'(<div class="formula-wrap" role="group" aria-label=")[^"]*(")', lambda m: m.group(1) + esc(d["aria"]) + m.group(2))
    if slug == "intervalo-confianca":
        s = sub1(s, 'data-tex="IC"', 'data-tex="CI"')

    s = seq(s, r'(<dt data-part="[^"]+" data-tone="\d">).*?(</dt>\s*<dd>).*?(</dd>)', d["dl"],
            lambda m, it: m.group(1) + it[0] + m.group(2) + it[1] + m.group(3))
    if "lede" in d:
        s = resub(s, r'(<p class="calc-lede">).*?(</p>)', lambda m: m.group(1) + d["lede"] + m.group(2), flags=re.S)
    if "labels" in d:
        s = seq(s, r'(<label class="calc-field[^"]*" data-tone="\d">\s*<span>).*?(</span>)', d["labels"],
                lambda m, it: m.group(1) + it + m.group(2))
    s = seq(s, r'(<small>).*?(</small>)', d.get("smalls", []), lambda m, it: m.group(1) + it + m.group(2))
    s = seq(s, r'(placeholder=")[^"]*(")', d.get("ph", []), lambda m, it: m.group(1) + esc(it) + m.group(2))
    for name, (old, new) in d.get("values", {}).items():
        s = sub1(s, f'name="{name}" type="text" inputmode="decimal" value="{old}"', f'name="{name}" type="text" inputmode="decimal" value="{new}"')
    # As dicas de lista em português falam em "ponto e vírgula"; em inglês a vírgula também separa.
    for a, b in d.get("extra", []):
        s = sub1(s, a, b)

    # O link para o catálogo de testes vai para a página do teste em inglês.
    def catalogo(m):
        teste, texto = CATALOG[slug]
        return (f'    <p class="formula-catalog">When to use it, assumptions and alternatives: '
                f'<a href="/en/statistical-tests/{teste}/">{texto} in the statistical tests catalog</a>.</p>\n\n')
    s = re.sub(r'    <p class="formula-catalog">.*?</p>\n\n', catalogo, s)

    def pager(m):
        kind, target = m.group(1), m.group(2)
        word = "Previous" if kind == "prev" else "Next"
        return f'<a class="pager-{kind}" href="{PAGES[target]["en"]}.html" rel="{kind}"><span>{word}</span>{esc(PAGES[target]["h1"])}</a>'
    s = re.sub(r'<a class="pager-(prev|next)" href="([\w-]+)\.html" rel="(?:prev|next)"><span>[^<]*</span>[^<]*</a>', pager, s)

    (EN_DIR / f"{en}.html").write_text(s)
    return s


# Fórmula com link para o catálogo de testes → (página do teste em inglês, texto do link).
CATALOG = {
    "t-student": ("one-sample-t-test", "the one-sample t-test"),
    "qui-quadrado": ("chi-square-goodness-of-fit-test", "the chi-square goodness-of-fit test"),
    "coeficiente-pearson": ("pearson-correlation", "Pearson correlation"),
    "regressao-linear": ("regression-coefficient-t-test", "regression tests"),
}


def build_index():
    s = clean((PT_DIR / "index.html").read_text())
    pt_url, en_url = f"{SITE}/formulas/", f"{SITE}/en/formulas/"
    (PT_DIR / "index.html").write_text(link_pt(s, pt_url, en_url, "/en/formulas/"))
    for a, b in COMMON:
        s = sub1(s, a, b)
    s = meta_text(s, INDEX["title"], INDEX["desc"])
    s = sub1(s, f'"{pt_url}"', f'"{en_url}"', 2)
    s = resub(s, r'(  <link rel="canonical" href="[^"]+">\n)', lambda m: m.group(1) + hreflang(pt_url, en_url))
    s = sub1(s, '<a href="../" class="back-link" aria-label="Voltar ao site" title="Voltar ao site">',
             '<a href="/en/" class="back-link" aria-label="Back to the site" title="Back to the site">')
    s = resub(s, r'(<a href="/en/" class="back-link"[^>]*>.*?</a>)',
              lambda m: m.group(1) + "\n  " + lang_link("/formulas/", "pt-BR", "Português"), flags=re.S)
    s = sub1(s, '<h1 class="home-title">Fórmulas</h1>', f'<h1 class="home-title">{INDEX["h1"]}</h1>')
    n = len(PAGES)
    s = resub(s, r'(<p class="home-lede">).*?(</p>)', lambda m: m.group(1) + INDEX["lede"].format(n=n) + m.group(2), flags=re.S)
    s = sub1(s, '<span class="visually-hidden">Filtrar fórmulas</span>', f'<span class="visually-hidden">{INDEX["label"]}</span>')
    s = resub(s, r'(id="filtro" placeholder=")[^"]*(")', lambda m: m.group(1) + esc(INDEX["ph"]) + m.group(2))
    s = sub1(s, 'Nenhuma fórmula com esse nome.', INDEX["empty"])
    for pt, en in CATEGORIES.items():
        s = sub1(s, f"<h2>{pt}</h2>", f"<h2>{en}</h2>")

    def card(m):
        slug, tex = m.group(1), m.group(2)
        if slug == "intervalo-confianca":
            tex = tex.replace("IC =", "CI =")
        d = PAGES[slug]
        return (f'<li><a class="formula-card" href="{d["en"]}.html">\n'
                f'            <span class="card-tex" data-tex="{tex}"></span>\n'
                f'            <span class="card-name">{esc(d["h1"])}</span>\n'
                f'            <span class="card-blurb">{esc(BLURBS[slug])}</span>\n'
                f'          </a></li>')
    s = resub(s, r'<li><a class="formula-card" href="([\w-]+)\.html">\s*<span class="card-tex" data-tex="([^"]*)"></span>\s*'
                 r'<span class="card-name">[^<]*</span>\s*<span class="card-blurb">[^<]*</span>\s*</a></li>', card, count=n)
    (EN_DIR / "index.html").write_text(s)
    return s


ALLOWED = ("Hôpital", "Português", "L&#x27;Hôpital")


def check(name, s):
    body = re.sub(r"<!--.*?-->", "", s, flags=re.S)
    body = re.sub(r"<script>.*?</script>", "", body, flags=re.S)
    for a in ALLOWED:
        body = body.replace(a, "")
    bad = re.findall(r"[^<>\"]{0,40}[ãõçáéíúâêÁÉ][^<>\"]{0,40}", body)
    if bad:
        print("PORTUGUÊS RESTANTE em", name, bad[:5])


for slug, d in PAGES.items():
    check(d["en"], build(slug, d))
check("index", build_index())
print("ok:", len(PAGES), "páginas + índice")
