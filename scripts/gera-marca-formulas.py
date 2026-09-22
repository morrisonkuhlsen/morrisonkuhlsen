#!/usr/bin/env python3
"""Gera a marca d'água de fórmulas do rodapé (_sass/_footer.scss).

As frações saem empilhadas — numerador sobre denominador, com barra —, o que
em SVG puro significa três elementos por fração, não um texto com barra. Daí
este gerador: escrever isso à mão dentro de um data URI seria ilegível.

    python3 scripts/gera-marca-formulas.py        # imprime a linha do CSS
    python3 scripts/gera-marca-formulas.py --escrever   # troca no _footer.scss

Cada fórmula é uma lista de pedaços: "texto" para o que é corrido e
("numerador", "denominador") para o que vira fração.
"""
import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
FOOTER = RAIZ / "_sass" / "_footer.scss"

# x, y, tamanho, rotação, pedaços
FORMULAS = [
    (20,   54, 27, -4, ["P(A|B) = ", ("P(B|A)·P(A)", "P(B)")]),
    (430,  38, 22,  3, ["σ² = E[(X − μ)²]"]),
    (700,  86, 25, -2, ["x̄ = ", ("1", "n"), " ∑ xᵢ"]),
    (990,  50, 21,  4, ["∫ f(x) dx = 1"]),
    (1210, 104, 24, -3, ["H₀ : μ = μ₀"]),
    (70,  148, 21,  5, ["Z = ", ("x − μ", "σ")]),
    (300, 186, 26, -3, ["f(x) = ", ("1", "σ√2π"), " e", ("−(x−μ)²", "2σ²")]),
    (820, 176, 22,  2, ["Var(X) = E[X²] − E[X]²"]),
    (1180, 216, 25, -4, ["ρ = ", ("Cov(X,Y)", "σₓσᵧ")]),
    (30,  262, 24, -5, ["s² = ", ("∑(xᵢ − x̄)²", "n − 1")]),
    (480, 300, 21,  3, ["E[X] = ∑ xᵢ·p(xᵢ)"]),
    (900, 286, 27, -2, ["lim n→∞ P(|X̄ₙ − μ| < ε) = 1"]),
    (1330, 330, 22, 4, ["χ² = ∑ ", ("(O−E)²", "E")]),
    (140, 368, 23,  3, ["C(n,k) = ", ("n!", "k!(n−k)!")]),
    (620, 398, 26, -4, ["t = ", ("x̄ − μ₀", "s ∕ √n")]),
    (1040, 420, 21, 2, ["P(X=k) = ", ("λᵏ·e^−λ", "k!")]),
    (60,  462, 25, -2, ["β̂ = ", ("∑(xᵢ−x̄)(yᵢ−ȳ)", "∑(xᵢ−x̄)²")]),
    (700, 500, 22,  4, ["IC = x̄ ± z·", ("σ", "√n")]),
    (1180, 534, 24, -3, ["F = ", ("MS entre", "MS dentro")]),
    (320, 572, 21,  3, ["P(A∪B) = P(A)+P(B)−P(A∩B)"]),
]

# Larguras médias em Georgia itálico, como fração do corpo da fonte. Não é
# métrica exata: serve para dimensionar a barra da fração e o espaço que ela
# ocupa. As partes corridas se ancoram nas pontas, então um erro aqui muda a
# folga em volta da barra, nunca sobrepõe texto.
ESTREITOS = set("il1.,|ₓᵧᵢₙ⁻ᵏ ")
LARGOS = set("MWm∑√∞")


def largura(texto, corpo):
    total = 0.0
    for c in texto:
        if c in ESTREITOS:
            total += 0.30
        elif c in LARGOS:
            total += 0.80
        elif c.isupper():
            total += 0.62
        else:
            total += 0.50
    return total * corpo


def svg_formula(x, y, corpo, giro, pedacos):
    """Uma fórmula, em coordenadas locais, dentro de um grupo já rotacionado."""
    partes = []
    cursor = 0.0
    for pedaco in pedacos:
        if isinstance(pedaco, str):
            partes.append(
                f"<text x='{cursor:.1f}' y='0' font-size='{corpo}'>{escapa(pedaco)}</text>"
            )
            cursor += largura(pedaco, corpo)
        else:
            num, den = pedaco
            menor = corpo * 0.82
            barra = max(largura(num, menor), largura(den, menor)) + menor * 0.45
            meio = cursor + barra / 2
            # numerador acima da linha de base, denominador abaixo, barra no meio
            partes.append(
                f"<text x='{meio:.1f}' y='{-corpo * 0.42:.1f}' font-size='{menor:.1f}'"
                f" text-anchor='middle'>{escapa(num)}</text>"
            )
            partes.append(
                f"<line x1='{cursor:.1f}' y1='{-corpo * 0.28:.1f}'"
                f" x2='{cursor + barra:.1f}' y2='{-corpo * 0.28:.1f}'"
                f" stroke='rgb(32,37,49)' stroke-width='{max(1, corpo * 0.055):.1f}'/>"
            )
            partes.append(
                f"<text x='{meio:.1f}' y='{corpo * 0.62:.1f}' font-size='{menor:.1f}'"
                f" text-anchor='middle'>{escapa(den)}</text>"
            )
            cursor += barra + corpo * 0.12
    return f"<g transform='translate({x} {y}) rotate({giro})'>" + "".join(partes) + "</g>"


def escapa(texto):
    return texto.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def monta_svg():
    corpo = "".join(svg_formula(*f) for f in FORMULAS)
    return (
        "<svg xmlns='http://www.w3.org/2000/svg' width='1600' height='620'"
        " viewBox='0 0 1600 620'>"
        "<g fill='rgb(32,37,49)' font-family='Georgia, Times New Roman, serif'"
        " font-style='italic'>" + corpo + "</g></svg>"
    )


def para_data_uri(svg):
    """Percent-encoding do que quebraria o url() ou o CSS."""
    saida = []
    for c in svg:
        if c == '"':
            saida.append("%22")
        elif c == "#":
            saida.append("%23")
        elif c == "%":
            saida.append("%25")
        elif ord(c) > 127:
            saida.extend(f"%{b:02X}" for b in c.encode("utf-8"))
        elif c == " ":
            saida.append("%20")
        else:
            saida.append(c)
    return "data:image/svg+xml," + "".join(saida)


def main():
    uri = para_data_uri(monta_svg())
    linha = f'  background-image: url("{uri}");'
    if "--escrever" in sys.argv:
        css = FOOTER.read_text(encoding="utf-8")
        novo = re.sub(r'^  background-image: url\(".*?"\);$', linha.replace("\\", "\\\\"),
                      css, count=1, flags=re.M)
        if novo == css:
            print("nada substituído — o seletor mudou?")
            return 1
        FOOTER.write_text(novo, encoding="utf-8")
        print(f"_footer.scss atualizado ({len(uri)} caracteres no data URI)")
    else:
        print(linha)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
