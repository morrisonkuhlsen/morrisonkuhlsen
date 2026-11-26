---
layout: post
image: /assets/images/capa-riemann.avif
title: "A hipótese de Riemann, contada nos primos: zeros, ondas e uma escada refeita em Julia"
categories: [MATEMÁTICA, JULIA]
tags: [Matemática, Julia, R, Python]
lang: pt
ref: hipotese-de-riemann
author: dante-bertuzzi
description: "O que a hipótese de Riemann diz, por que é sobre os números primos e o que se vê com um computador: zeros, a escada dos primos refeita e um padrão da física."
mathjax: true
slug: hipotese-de-riemann-zeros-primos-julia
---

A hipótese de Riemann tem uma fama esquisita. É um dos problemas em aberto
mais famosos da matemática, vale um milhão de dólares, e o enunciado dela
parece não ter nada a ver com nada: *todos os zeros não triviais da função
zeta têm parte real igual a 1/2*.

Eu passei anos sabendo recitar essa frase sem entender por que alguém se
importaria com ela. Zeros de uma função complexa. Parte real 1/2. E daí?

O "e daí" é que essa frase é sobre os números primos. Mais precisamente,
sobre **quanto** a distribuição dos primos pode se desviar de uma regra
simples. Este post é a minha tentativa de chegar até aí com o mínimo de
análise complexa e o máximo de conta feita no computador: peguei os
primeiros 20.000 zeros, refiz a contagem dos primos a partir deles e acabei
encontrando, num problema de teoria dos números, um histograma que parece
ter saído de um livro de física.

Aviso logo: nada aqui prova a hipótese. O que dá para fazer é ver o que ela
diz, e o que estaria em jogo se fosse falsa.

<div style="border-left: 4px solid #FF9800; padding: 1em; background-color: var(--mk-tint-warn); margin: 1em 0; border-radius: 4px;">
<strong>Nota (25 de novembro de 2026).</strong> Nos dias em que este post foi revisado, circulava o anúncio de uma demonstração formal da hipótese de Riemann, escrita no assistente de provas Lean. Até essa data não havia artigo publicado com a demonstração nem verificação independente, e o Instituto Clay continuava a listar o problema como aberto. Este post trata a hipótese como em aberto; se a demonstração for confirmada, o texto será atualizado.
</div>

## A ideia, antes de qualquer fórmula

Imagine uma estrada infinita com uma placa em cada número inteiro, e você
andando por ela com um caderno, anotando os primos que encontra pelo
caminho.

No começo eles aparecem a toda hora: 2, 3, 5, 7, 11, 13. Depois vão
rareando, num ritmo que dá para prever. Perto da placa mil, a distância
média entre um primo e o seguinte é de umas 7 placas; perto de um milhão, de
14; perto de um bilhão, de 21. (A regra é que, perto de $x$, essa distância
média é $\ln x$: $\ln 1.000 = 6{,}9$, $\ln 10^6 = 13{,}8$ e $\ln 10^9 = 20{,}7$.)
Essa parte está resolvida desde 1896: no longo prazo, a média nunca falha.

Mas quem anda pela estrada não vê a média. Vê o caminho de perto, e de perto
os primos não têm ritmo nenhum:

- Logo depois de um bilhão vem um par colado: 1.000.000.007 e
  1.000.000.009. O par seguinte só aparece 402 placas depois.
- Antes de mil, o trecho mais longo sem primos vai de 887 a 907: são 19
  placas vazias seguidas, quase o triplo da distância média por ali.
- Antes de um milhão, o recorde é de 492.113 a 492.227: 113 placas sem
  nenhum primo, onde a média seria 13.
- Logo depois de um bilhão, entre 1.002.901.069 e 1.002.901.279, são 209
  placas vazias, dez vezes a média local.
- Divida os 10 milhões de placas depois de um bilhão em trechos de mil. Em
  média, cada trecho tem 48 primos. Mas houve trecho com 29 e trecho com 71.

Nada disso é aleatório: se um número é primo ou não está decidido desde
sempre. Mesmo assim, ninguém consegue dizer onde vai cair o próximo primo
sem ir lá conferir. E aí vem a pergunta que interessa: **até onde a
realidade pode se afastar da média?**

Dá para imaginar estradas bem piores que a nossa. Uma em que, lá pela placa
$10^{100}$, os primos simplesmente somem por um trecho gigantesco e depois
reaparecem em bando, compensando o atraso. A média de longo prazo
continuaria certa, mas quem estivesse no meio do caminho contaria muito
menos primos do que a regra promete, e por muito tempo.

A hipótese de Riemann diz que a nossa estrada não é assim. Depois de andar
até a placa $x$, o seu caderno nunca vai discordar da conta da média por
mais do que algo da ordem de $\sqrt{x}$ (vezes um logaritmo). Parece muito,
mas é quase nada. Até um bilhão você anota 50.847.534 primos, a média
previa 50.849.235, e a hipótese só permitiria uma diferença de uns 26 mil,
cerca de 0,05% do total. A diferença real é 1.701.

E não é só no total. Se a hipótese for verdadeira, nenhum deserto pode ser
comprido demais: depois da placa $x$, o próximo primo aparece no máximo a
uma distância da ordem de $\sqrt{x}\,\ln x$ (Harald Cramér provou isso
supondo a hipótese). Os desertos existem e crescem sem limite, mas crescem
devagar perto do tamanho da estrada. O de 209 placas, logo depois de um
bilhão, está a anos-luz do que esse limite permitiria, que é da ordem de
$\sqrt{10^9} \times \ln 10^9 \approx 31.623 \times 20{,}7 \approx 655$ mil.

Por que justamente $\sqrt{x}$? Uma intuição é pensar em moedas. Jogue um
bilhão de moedas: a quantidade de caras vai ficar perto de meio bilhão, mas
quase nunca exatamente; o desvio típico é $\sqrt{x}/2$, uns 16 mil. A
hipótese diz que os primos, que não têm nada de sorteados, oscilam em torno
da média no máximo tanto quanto oscilaria uma coisa sorteada ao acaso.
Parecem espalhados sem regra, mas o tamanho das oscilações tem dono.

E quem é o dono, mais adiante, fica literal: as oscilações dos primos são
uma soma de ondas, uma para cada zero da função zeta, e a parte real do zero
dita quanto a onda dele cresce. Parte real 1/2 quer dizer que toda onda
cresce como $\sqrt{x}$. Um único zero fora da reta seria uma onda crescendo
mais rápido que as outras, e aí sim, em algum lugar muito longe na estrada,
os primos sairiam do controle.

Também por isso conferir no computador não basta. Os primeiros 12 trilhões
de zeros já foram verificados, todos na reta. Mas são infinitos, e o zero
que estragaria tudo pode estar numa altura que nenhum computador vai
alcançar. É o mesmo problema da estrada: dá para andar um trecho enorme,
mas nunca até o fim.

## Primeiro, os primos

Os [números primos](/matematica-basica/primos.html) não seguem padrão
aparente: 2, 3, 5, 7, 11, 13, 17, 19, 23... Às vezes vêm colados (11 e 13),
às vezes somem por um tempo (não há nenhum entre 114 e 126). Mas, olhados de
longe, eles ficam surpreendentemente comportados.

Seja $\pi(x)$ a quantidade de primos até $x$ — o $\pi$ aqui não tem nada a
ver com 3,14; é só a notação que pegou. A ideia que acabou vingando é que,
perto de um número $x$, a chance de um inteiro ser primo é mais ou menos
$1/\ln x$. Somando essa "densidade" até $x$, sai a integral logarítmica:

$$
\operatorname{li}(x) = \int_0^x \frac{dt}{\ln t}.
$$

(A integral passa por cima de $t = 1$, onde $\ln t = 0$, e é tomada no sentido
de valor principal. Muitos textos começam em 2 e escrevem
$\operatorname{Li}(x)$; a diferença entre as duas é uma constante,
$\operatorname{li}(2) = 1{,}045$, que não muda nada aqui. Uso a que começa em
0 porque é com ela que as cotas mais adiante são enunciadas.)

Contei os primos até um bilhão com um crivo de Eratóstenes e comparei:

| $x$ | $\pi(x)$ | $x / \ln x$ | $\operatorname{li}(x)$ | $\pi(x) - \operatorname{li}(x)$ |
|---|---:|---:|---:|---:|
| $10^3$ | 168 | 145 | 177,6 | −9,6 |
| $10^4$ | 1.229 | 1.086 | 1.246,1 | −17,1 |
| $10^5$ | 9.592 | 8.686 | 9.629,8 | −37,8 |
| $10^6$ | 78.498 | 72.382 | 78.627,5 | −129,5 |
| $10^7$ | 664.579 | 620.421 | 664.918,4 | −339,4 |
| $10^8$ | 5.761.455 | 5.428.681 | 5.762.209,4 | −754,4 |
| $10^9$ | 50.847.534 | 48.254.942 | 50.849.235,0 | −1.701,0 |

Até um bilhão, $\operatorname{li}(x)$ erra por 1.701 primos, num total de 50
milhões: um erro de $1.701 / 50.847.534 = 0{,}003\%$. A versão mais simples,
$x/\ln x$, erra por $(50.847.534 - 48.254.942)/50.847.534 = 5{,}1\%$.

O código abaixo faz o crivo, monta a tabela e desenha a Figura 3, mais
adiante. Em Julia e em Python leva uns dez segundos; em R, que guarda um
número por vez em vez de um bit e por isso faz o crivo em trechos, leva
bem mais (meia hora aqui).

<div class="code-tabs">
  <div class="code-tab" data-lang="julia">
<div class="code-container">
  <div class="code-header">
    <div class="code-lang">Julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Arblib, Plots, Printf

# Crivo de Eratóstenes até 10⁹ (um bit por número: cerca de 125 MB)
function crivo(n)
    eh_primo = trues(n); eh_primo[1] = false
    for i in 2:isqrt(n)
        eh_primo[i] || continue
        for j in i*i:i:n
            eh_primo[j] = false
        end
    end
    eh_primo
end
N = 10^9
eh_primo = crivo(N)

# π(x) = quantidade de primos ≤ x, para uma lista crescente de x (contando trecho a trecho)
function contar_ate(eh_primo, xs)
    total, inicio = 0, 1
    map(xs) do x
        total += count(eh_primo[inicio:x])
        inicio = x + 1
        total
    end
end

# Integral logarítmica li(x), calculada pelo Arblib com 128 bits
li(x) = Float64(Arblib.hypgeom_li!(Arb(prec = 128), Arb(x; prec = 128), 0))

potencias = [10^k for k in 3:9]
π_pot = contar_ate(eh_primo, potencias)
println("x       π(x)        x/ln x      li(x)           π(x) − li(x)")
for (k, x, p) in zip(3:9, potencias, π_pot)
    @printf("10^%d  %-11d %-11d %-15.1f %.1f\n", k, p, round(Int, x / log(x)), li(x), p - li(x))
end
x = 10^9
println("Cota de Schoenfeld em 10^9: ", round(sqrt(x) * log(x) / (8π), digits = 1))

# Figura 3: o erro em 300 pontos espaçados em escala log, de 3.000 a 10⁹
xs = round.(Int, exp10.(range(log10(3000), 9, length = 300)))
erro = contar_ate(eh_primo, xs) .- li.(xs)
unidade = sqrt.(xs) ./ log.(xs)
razao = erro ./ unidade
quadrados = [-li(sqrt(x)) / 2 for x in xs] ./ unidade   # desvio esperado pelos quadrados de primos
println("Erro / (√x/ln x): mínimo ", round(minimum(razao), digits = 2), ", máximo ", round(maximum(razao), digits = 2),
        ", em 10^9 ", round(razao[end], digits = 2))
println("Curva dos quadrados: de ", round(quadrados[1], digits = 2), " a ", round(quadrados[end], digits = 2))

cota = sqrt.(xs) .* log.(xs) ./ (8π)
p1 = plot(xs, cota, fillrange = -cota, fillalpha = 0.2, color = :royalblue, lw = 0, label = "Cota (se a hipótese valer)",
          xscale = :log10, xlabel = "x", ylabel = "π(x) − li(x)", title = "Erro e cota de Schoenfeld", legend = :bottomleft)
plot!(p1, xs, erro, color = :red, lw = 1.5, label = "π(x) − li(x)")
p2 = plot(xs, razao, color = :red, lw = 1.5, label = "(π(x) − li(x)) / (√x / ln x)", xscale = :log10,
          xlabel = "x", title = "O erro em unidades de √x / ln x", legend = :bottomright)
plot!(p2, xs, quadrados, color = :black, ls = :dash, label = "−li(√x)/2, em unidades de √x / ln x")
hline!(p2, [0], color = :gray, label = "")
savefig(plot(p1, p2, layout = (1, 2), size = (1000, 420), margin = 4Plots.mm), "riemann_erro_jl.png")</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">x       π(x)        x/ln x      li(x)           π(x) − li(x)
10^3  168         145         177.6           -9.6
10^4  1229        1086        1246.1          -17.1
10^5  9592        8686        9629.8          -37.8
10^6  78498       72382       78627.5         -129.5
10^7  664579      620421      664918.4        -339.4
10^8  5761455     5428681     5762209.4       -754.4
10^9  50847534    48254942    50849235.0      -1701.0
Cota de Schoenfeld em 10^9: 26074.6
Erro / (√x/ln x): mínimo -2.18, máximo -0.74, em 10^9 -1.11
Curva dos quadrados: de -1.44 a -1.13</pre>
</div>
  </div>
  <div class="code-tab" data-lang="r">
<div class="code-container">
  <div class="code-header">
    <div class="code-lang">R</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code># Crivo de Eratóstenes segmentado até 10⁹: trechos de 10⁷ números
# (um vetor lógico com 10⁹ posições ocuparia 4 GB)
N &lt;- 1e9
raiz &lt;- floor(sqrt(N))
base &lt;- rep(TRUE, raiz); base[1] &lt;- FALSE                 # crivo simples até √N
for (i in 2:floor(sqrt(raiz))) if (base[i]) base[seq(i * i, raiz, by = i)] &lt;- FALSE
primos_base &lt;- which(base)

# π(x) = quantidade de primos ≤ x, para uma lista crescente de x
contar_ate &lt;- function(xs, tamanho = 1e7) {
  saida &lt;- numeric(length(xs)); total &lt;- 0; j &lt;- 1
  for (inicio in seq(1, N, by = tamanho)) {
    fim &lt;- inicio + tamanho - 1
    trecho &lt;- rep(TRUE, tamanho)
    if (inicio == 1) trecho[1] &lt;- FALSE
    for (p in primos_base[primos_base * primos_base &lt;= fim]) {
      primeiro &lt;- max(p * p, ceiling(inicio / p) * p)
      if (primeiro &lt;= fim) trecho[seq(primeiro - inicio + 1, tamanho, by = p)] &lt;- FALSE
    }
    acumulado &lt;- cumsum(trecho)
    while (j &lt;= length(xs) &amp;&amp; xs[j] &lt;= fim) {
      saida[j] &lt;- total + acumulado[xs[j] - inicio + 1]; j &lt;- j + 1
    }
    total &lt;- total + acumulado[tamanho]
  }
  saida
}

# Integral logarítmica: li(x) = li(2) + ∫ de ln 2 a ln x de e^u / u du
li2 &lt;- 1.045163780117492784844588889194613136522615578151   # li(2)
li &lt;- function(x) li2 + integrate(function(u) exp(u) / u, log(2), log(x), rel.tol = 1e-13)$value

# Uma passada só do crivo: as potências de 10 (tabela) e os 300 pontos da Figura 3
potencias &lt;- 10^(3:9)
xs &lt;- round(10^seq(log10(3000), 9, length.out = 300))
todos &lt;- sort(unique(c(potencias, xs)))
pi_todos &lt;- contar_ate(todos)
pi_de &lt;- function(x) pi_todos[match(x, todos)]
p_pot &lt;- pi_de(potencias)
cat("x       π(x)        x/ln x      li(x)           π(x) − li(x)\n")
for (k in 3:9) {
  x &lt;- 10^k; p &lt;- p_pot[k - 2]
  cat(sprintf("10^%d  %-11d %-11d %-15.1f %.1f\n", k, as.integer(p), as.integer(round(x / log(x))), li(x), p - li(x)))
}
x &lt;- 1e9
cat(sprintf("Cota de Schoenfeld em 10^9: %.1f\n", sqrt(x) * log(x) / (8 * pi)))

# Figura 3: o erro em 300 pontos espaçados em escala log, de 3.000 a 10⁹
erro &lt;- pi_de(xs) - sapply(xs, li)
unidade &lt;- sqrt(xs) / log(xs)
razao &lt;- erro / unidade
quadrados &lt;- -sapply(sqrt(xs), li) / 2 / unidade     # desvio esperado pelos quadrados de primos
cat(sprintf("Erro / (√x/ln x): mínimo %.2f, máximo %.2f, em 10^9 %.2f\n", min(razao), max(razao), razao[300]))
cat(sprintf("Curva dos quadrados: de %.2f a %.2f\n", quadrados[1], quadrados[300]))

cota &lt;- sqrt(xs) * log(xs) / (8 * pi)
png("riemann_erro_r.png", width = 1000, height = 420)
par(mfrow = c(1, 2))
plot(xs, erro, log = "x", type = "n", ylim = range(c(-cota, cota)), xlab = "x", ylab = "π(x) − li(x)",
     main = "Erro e cota de Schoenfeld")
polygon(c(xs, rev(xs)), c(cota, rev(-cota)), col = adjustcolor("royalblue", 0.2), border = NA)
lines(xs, erro, col = "red", lwd = 1.5)
legend("bottomleft", c("Cota (se a hipótese valer)", "π(x) − li(x)"), fill = c(adjustcolor("royalblue", 0.2), NA),
       border = NA, col = c(NA, "red"), lwd = c(NA, 1.5))
plot(xs, razao, log = "x", type = "l", col = "red", lwd = 1.5, ylim = range(c(razao, quadrados, 0)),
     xlab = "x", ylab = "", main = "O erro em unidades de √x / ln x")
lines(xs, quadrados, lty = 2); abline(h = 0, col = "gray")
legend("bottomright", c("(π(x) − li(x)) / (√x / ln x)", "−li(√x)/2, em unidades de √x / ln x"),
       col = c("red", "black"), lty = c(1, 2))
invisible(dev.off())</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">x       π(x)        x/ln x      li(x)           π(x) − li(x)
10^3  168         145         177.6           -9.6
10^4  1229        1086        1246.1          -17.1
10^5  9592        8686        9629.8          -37.8
10^6  78498       72382       78627.5         -129.5
10^7  664579      620421      664918.4        -339.4
10^8  5761455     5428681     5762209.4       -754.4
10^9  50847534    48254942    50849235.0      -1701.0
Cota de Schoenfeld em 10^9: 26074.6
Erro / (√x/ln x): mínimo -2.18, máximo -0.74, em 10^9 -1.11
Curva dos quadrados: de -1.44 a -1.13</pre>
</div>
  </div>
  <div class="code-tab" data-lang="python">
<div class="code-container">
  <div class="code-header">
    <div class="code-lang">Python</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>import numpy as np
import matplotlib.pyplot as plt
from mpmath import li as mp_li

# Crivo de Eratóstenes até 10⁹ (um byte por número: cerca de 1 GB)
N = 10**9
eh_primo = np.ones(N + 1, dtype=bool)
eh_primo[:2] = False
for i in range(2, int(N**0.5) + 1):
    if eh_primo[i]:
        eh_primo[i * i::i] = False

# π(x) = quantidade de primos ≤ x, para uma lista crescente de x (contando trecho a trecho)
def contar_ate(xs):
    total, inicio, saida = 0, 0, []
    for x in xs:
        total += np.count_nonzero(eh_primo[inicio:x + 1])
        inicio = x + 1
        saida.append(total)
    return np.array(saida)

li = lambda x: float(mp_li(x))        # integral logarítmica (mpmath)

potencias = [10**k for k in range(3, 10)]
print("x       π(x)        x/ln x      li(x)           π(x) − li(x)")
for k, x, p in zip(range(3, 10), potencias, contar_ate(potencias)):
    print(f"10^{k}  {p:&lt;11d} {round(x / np.log(x)):&lt;11d} {li(x):&lt;15.1f} {p - li(x):.1f}")
x = 10**9
print(f"Cota de Schoenfeld em 10^9: {np.sqrt(x) * np.log(x) / (8 * np.pi):.1f}")

# Figura 3: o erro em 300 pontos espaçados em escala log, de 3.000 a 10⁹
xs = np.round(10 ** np.linspace(np.log10(3000), 9, 300)).astype(np.int64)
erro = contar_ate(xs) - np.array([li(int(x)) for x in xs])
unidade = np.sqrt(xs) / np.log(xs)
razao = erro / unidade
quadrados = np.array([-li(np.sqrt(x)) / 2 for x in xs]) / unidade   # desvio esperado pelos quadrados de primos
print(f"Erro / (√x/ln x): mínimo {razao.min():.2f}, máximo {razao.max():.2f}, em 10^9 {razao[-1]:.2f}")
print(f"Curva dos quadrados: de {quadrados[0]:.2f} a {quadrados[-1]:.2f}")

cota = np.sqrt(xs) * np.log(xs) / (8 * np.pi)
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4.2))
ax1.fill_between(xs, -cota, cota, color="royalblue", alpha=0.2, label="Cota (se a hipótese valer)")
ax1.plot(xs, erro, color="red", lw=1.5, label="π(x) − li(x)")
ax1.set_xscale("log"); ax1.set_xlabel("x"); ax1.set_ylabel("π(x) − li(x)")
ax1.set_title("Erro e cota de Schoenfeld"); ax1.legend(loc="lower left")
ax2.plot(xs, razao, color="red", lw=1.5, label="(π(x) − li(x)) / (√x / ln x)")
ax2.plot(xs, quadrados, color="black", ls="--", label="−li(√x)/2, em unidades de √x / ln x")
ax2.axhline(0, color="gray", lw=0.8)
ax2.set_xscale("log"); ax2.set_xlabel("x"); ax2.set_title("O erro em unidades de √x / ln x")
ax2.legend(loc="lower right")
fig.tight_layout(); fig.savefig("riemann_erro.png", dpi=100)</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">x       π(x)        x/ln x      li(x)           π(x) − li(x)
10^3  168         145         177.6           -9.6
10^4  1229        1086        1246.1          -17.1
10^5  9592        8686        9629.8          -37.8
10^6  78498       72382       78627.5         -129.5
10^7  664579      620421      664918.4        -339.4
10^8  5761455     5428681     5762209.4       -754.4
10^9  50847534    48254942    50849235.0      -1701.0
Cota de Schoenfeld em 10^9: 26074.6
Erro / (√x/ln x): mínimo -2.18, máximo -0.74, em 10^9 -1.11
Curva dos quadrados: de -1.44 a -1.13</pre>
</div>
  </div>
</div>

Que $\pi(x)/\operatorname{li}(x)$ tende a 1 é o **teorema dos números
primos**, demonstrado em 1896, de forma independente, por Hadamard e por de
la Vallée Poussin. A hipótese de Riemann é sobre a coluna da direita: **o
tamanho do erro**.

## A ponte de Euler

A ligação entre primos e a função zeta é de Euler, de 1737, e é a coisa mais
bonita deste post. Para $s > 1$, defina

$$
\zeta(s) = \sum_{n=1}^{\infty} \frac{1}{n^s} = 1 + \frac{1}{2^s} + \frac{1}{3^s} + \frac{1}{4^s} + \cdots
$$

Euler percebeu que essa soma sobre **todos os inteiros** é igual a um
produto sobre **os primos**:

$$
\zeta(s) = \prod_{p \text{ primo}} \frac{1}{1 - p^{-s}}
= \frac{1}{1 - 2^{-s}} \cdot \frac{1}{1 - 3^{-s}} \cdot \frac{1}{1 - 5^{-s}} \cdots
$$

O motivo é a fatoração única. Cada fator é uma série geométrica,
$1 + p^{-s} + p^{-2s} + \cdots$. Multiplicando todas, cada combinação de
potências de primos aparece exatamente uma vez — e cada combinação de
potências de primos é exatamente um inteiro. O produto "sabe" quais números
são primos; a soma não parece saber, mas é a mesma coisa.

Isso quer dizer que tudo o que se descobrir sobre $\zeta$ é, de algum jeito,
informação sobre os primos.

## O que Riemann fez num artigo curto

Em 1859, Bernhard Riemann publicou o único artigo que escreveu sobre teoria
dos números, *Sobre a quantidade de primos menores que uma grandeza dada*.
É curto, e fez duas coisas.

A primeira foi estender $\zeta(s)$ para $s$ complexo. A soma só converge
quando a parte real de $s$ passa de 1, mas existe uma única maneira "suave"
(analítica) de definir a função no plano inteiro, exceto em $s = 1$. Essa
extensão tem zeros:

- os **triviais**, em $-2, -4, -6, \ldots$, que são fáceis e não interessam
  aqui;
- e os **não triviais**, que caem todos na faixa $0 < \operatorname{Re}(s) < 1$
  — a *faixa crítica*. Eles vêm em pares simétricos em relação à reta
  $\operatorname{Re}(s) = 1/2$, a *reta crítica*, e em relação ao eixo real.

A segunda foi uma fórmula exata para contar primos a partir desses zeros.
Chego nela já já.

E, no meio do artigo, quase de passagem, Riemann escreveu que é "muito
provável" que todos os zeros não triviais estejam sobre a reta crítica. E
completou (em tradução livre): "Seria desejável, claro, uma demonstração
rigorosa disso; deixei de lado a busca por ela, por ora, depois de algumas
tentativas rápidas e inúteis".[^riemann]

Isso foi há 167 anos. As tentativas publicadas e aceitas continuam
inúteis (veja a nota no começo do post).

## Vendo os zeros

Em $s = \tfrac12 + it$, a função $\zeta$ devolve um número complexo. Quando
$t$ anda de 0 a 34, esse número descreve uma curva no plano — e a curva passa
pela origem exatamente nos zeros. Calculei com o
[Arblib](https://github.com/kalmarek/Arblib.jl), em Julia, que usa aritmética
de intervalos, e com o [mpmath](https://mpmath.org/), em Python; as duas
versões estão no código abaixo da figura.

<figure>
  <a href="/assets/images/riemann-zeros.png" title="Abrir em tamanho original">
  <img src="/assets/images/riemann-zeros.avif" alt="À esquerda, a curva de zeta de meio mais i t no plano complexo para t de 0 a 34: uma série de laços azuis que passam repetidamente pela origem, marcada em vermelho; uma curva cinza, de zeta de 0,75 mais i t, faz laços parecidos mas não toca a origem nesse trecho. À direita, a função Z de t, real, oscilando entre −3,7 e 2,9 para t de 0 a 60 e cruzando o zero 13 vezes; os três primeiros cruzamentos estão marcados em 14,13, 21,02 e 25,01" />
  </a>
  <figcaption>
    <strong>Figura 1:</strong> à esquerda, o caminho de $\zeta(\tfrac12 + it)$ no plano complexo; cada passagem pela origem é um zero. Em cinza, o mesmo caminho um pouco à direita da reta crítica, em $\operatorname{Re}(s) = 0{,}75$, que não toca a origem nesse trecho (o menor $\lvert \zeta \rvert$ ali é 0,179). À direita, a função $Z(t)$, que tem o mesmo módulo de $\zeta(\tfrac12 + it)$ mas é real, e por isso troca de sinal em cada zero (pelo menos nos simples, que são todos os conhecidos). Gerada pelo código em Python abaixo. Clique na imagem para vê-la em tamanho original.
  </figcaption>
</figure>

<div class="code-tabs">
  <div class="code-tab" data-lang="julia">
<div class="code-container">
  <div class="code-header">
    <div class="code-lang">Julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Arblib, Plots

# ζ(s) e a função Z(t) de Hardy, calculadas pelo Arblib (aritmética de intervalos, resultado em Float64)
ζ(σ, t) = Arblib.fpwrap_zeta(ComplexF64(σ, t))
Z(t) = real(Arblib.fpwrap_hardy_z(ComplexF64(t)))   # real, com |Z(t)| = |ζ(1/2 + it)|

ts = range(0, 34, length = 4000)
na_reta = ζ.(0.5, ts)
fora = ζ.(0.75, ts)
println("Menor |ζ(0,75 + it)| para t de 0 a 34: ", round(minimum(abs, fora), digits = 3))

# Zeros de Z(t) em (0, 60]: trocas de sinal numa grade fina, refinadas por bissecção
function bissecao(f, a, b; iter = 60)
    for _ in 1:iter
        m = (a + b) / 2
        sign(f(m)) == sign(f(a)) ? (a = m) : (b = m)
    end
    (a + b) / 2
end
grade = range(0.01, 60, length = 6000)
valores = Z.(grade)
trocas = findall(sign.(valores[1:end-1]) .!= sign.(valores[2:end]))
zeros_Z = [bissecao(Z, grade[i], grade[i+1]) for i in trocas]
println("Trocas de sinal de Z(t) até t = 60: ", length(zeros_Z), "; primeiras: ", round.(zeros_Z[1:4], digits = 4))
println("Z(t) entre t = 0 e 60: mínimo ", round(minimum(valores), digits = 2), ", máximo ", round(maximum(valores), digits = 2))

# Figura 1
p1 = plot(real.(fora), imag.(fora), color = :gray, label = "ζ(0,75 + it)", aspect_ratio = :equal,
          xlabel = "parte real", ylabel = "parte imaginária", title = "ζ(s) para t de 0 a 34")
plot!(p1, real.(na_reta), imag.(na_reta), color = :royalblue, label = "ζ(1/2 + it)")
scatter!(p1, [0], [0], color = :red, label = "origem")
p2 = plot(grade, valores, color = :royalblue, label = "Z(t)", xlabel = "t", title = "Z(t): troca de sinal em cada zero")
hline!(p2, [0], color = :gray, label = "")
scatter!(p2, zeros_Z[1:3], zeros(3), color = :red, label = "14,13; 21,02; 25,01")
savefig(plot(p1, p2, layout = (1, 2), size = (1000, 430), margin = 4Plots.mm), "riemann_zeros_jl.png")</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">Menor |ζ(0,75 + it)| para t de 0 a 34: 0.179
Trocas de sinal de Z(t) até t = 60: 13; primeiras: [14.1347, 21.022, 25.0109, 30.4249]
Z(t) entre t = 0 e 60: mínimo -3.66, máximo 2.94</pre>
</div>
  </div>
  <div class="code-tab" data-lang="python">
<div class="code-container">
  <div class="code-header">
    <div class="code-lang">Python</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>import numpy as np
import matplotlib.pyplot as plt
from mpmath import zeta, siegelz

# ζ(s) e a função Z(t) de Hardy, calculadas pelo mpmath
zeta_c = lambda s, t: complex(zeta(complex(s, t)))
Z = lambda t: float(siegelz(t))          # real, com |Z(t)| = |ζ(1/2 + it)|

ts = np.linspace(0, 34, 4000)
na_reta = np.array([zeta_c(0.5, t) for t in ts])
fora = np.array([zeta_c(0.75, t) for t in ts])
print(f"Menor |ζ(0,75 + it)| para t de 0 a 34: {np.abs(fora).min():.3f}")

# Zeros de Z(t) em (0, 60]: trocas de sinal numa grade fina, refinadas por bissecção
def bissecao(f, a, b, iteracoes=60):
    fa = f(a)
    for _ in range(iteracoes):
        m = (a + b) / 2
        if np.sign(f(m)) == np.sign(fa):
            a = m
        else:
            b = m
    return (a + b) / 2

grade = np.linspace(0.01, 60, 6000)
valores = np.array([Z(t) for t in grade])
trocas = np.flatnonzero(np.sign(valores[:-1]) != np.sign(valores[1:]))
zeros_Z = [bissecao(Z, grade[i], grade[i + 1]) for i in trocas]
print(f"Trocas de sinal de Z(t) até t = 60: {len(zeros_Z)}; primeiras: {np.round(zeros_Z[:4], 4)}")
print(f"Z(t) entre t = 0 e 60: mínimo {valores.min():.2f}, máximo {valores.max():.2f}")

# Figura 1
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4.3))
ax1.plot(fora.real, fora.imag, color="0.6", label="ζ(0,75 + it)")
ax1.plot(na_reta.real, na_reta.imag, color="royalblue", label="ζ(1/2 + it)")
ax1.plot(0, 0, "o", color="red", label="origem")
ax1.set_aspect("equal"); ax1.set_xlabel("parte real"); ax1.set_ylabel("parte imaginária")
ax1.set_title("ζ(s) para t de 0 a 34"); ax1.legend(loc="upper left")
ax2.plot(grade, valores, color="royalblue", label="Z(t)")
ax2.axhline(0, color="0.6", lw=0.8)
ax2.plot(zeros_Z[:3], [0, 0, 0], "o", color="red", label="14,13; 21,02; 25,01")
ax2.set_xlabel("t"); ax2.set_title("Z(t): troca de sinal em cada zero"); ax2.legend(loc="lower left")
fig.tight_layout(); fig.savefig("riemann_zeros.png", dpi=100)</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">Menor |ζ(0,75 + it)| para t de 0 a 34: 0.179
Trocas de sinal de Z(t) até t = 60: 13; primeiras: [14.1347 21.022  25.0109 30.4249]
Z(t) entre t = 0 e 60: mínimo -3.66, máximo 2.94</pre>
</div>
  </div>
</div>

(Este bloco e o da integral de Volchkov, mais adiante, não têm versão em R:
o R não tem, entre os pacotes que uso, uma função zeta para números
complexos.)

O primeiro zero está em $t = 14{,}1347\ldots$; depois vêm 21,0220,
25,0109, 30,4249... Até $t = 60$ são 13. Eles ficam cada vez mais juntos: a
quantidade de zeros até a altura $T$ cresce como
$\tfrac{T}{2\pi}\ln\tfrac{T}{2\pi e}$, então perto de $T$ a distância média
entre dois vizinhos é $2\pi / \ln(T/2\pi)$. O 20.000º zero, o último que
uso, está em $t = 18.046{,}46$.

O painel da direita é o truque que se usa na prática. Existe uma função real,
$Z(t)$, com $\lvert Z(t)\rvert = \lvert \zeta(\tfrac12 + it)\rvert$. Achar zeros na reta crítica
vira achar trocas de sinal de uma função real — coisa que dá para certificar
com aritmética de intervalos. A fórmula para calcular $Z(t)$ rápido é a de
Riemann–Siegel, e tem uma história boa: Carl Siegel a encontrou em 1932 em
manuscritos não publicados de Riemann, dos anos 1850.

Os 20.000 zeros que uso daqui em diante vêm da tabela pública de Andrew
Odlyzko, com os primeiros 100.000 zeros e precisão de $3 \times 10^{-9}$; os
primeiros conferem com os do Arblib até a última casa da tabela. Uma
ressalva de método: a tabela traz só a parte imaginária de cada zero,
porque os zeros são procurados justamente na reta crítica, como trocas de
sinal de $Z(t)$. A parte real 1/2 é construção, não medida. O que garante
que nenhum zero escapou para fora da reta até essa altura é outra conta:
comparar quantas trocas de sinal se encontrou com quantos zeros existem no
total abaixo daquela altura, que dá para calcular sem saber onde eles estão
(é o método de Alan Turing, de 1953). Para os primeiros 20.000 isso foi
feito há muito tempo, e muito além deles, como conto no fim. E, de todo
modo, nada disso prova a hipótese.

## A escada refeita com ondas

Agora a parte que transformou a hipótese, para mim, de curiosidade em coisa
que faz sentido.

Em vez de $\pi(x)$, é mais limpo trabalhar com a função de Chebyshev,
$\psi(x)$: uma escada que sobe $\ln p$ em cada primo $p$ e em cada potência
dele ($p^2, p^3, \ldots$). Ela carrega a mesma informação que $\pi(x)$ e o
teorema dos números primos vira simplesmente $\psi(x) \approx x$.

A fórmula explícita, que von Mangoldt demonstrou em 1895 seguindo o caminho
de Riemann, diz que a escada é **exatamente** igual a

$$
\psi(x) = x \;-\; \sum_{\rho} \frac{x^{\rho}}{\rho} \;-\; \ln(2\pi) \;-\; \tfrac12 \ln\!\left(1 - x^{-2}\right),
$$

onde a soma percorre todos os zeros não triviais $\rho$, em pares
conjugados e em ordem crescente de altura, e $x$ não é uma potência de primo
(em cima de um degrau, a fórmula dá o ponto médio do salto). O termo $x$ é a
tendência suave. Cada zero acrescenta uma correção. Escrevendo
$\rho = \beta + i\gamma$, um zero e o seu conjugado juntos contribuem

$$
\frac{x^{\rho}}{\rho} + \frac{x^{\bar\rho}}{\bar\rho}
= \frac{2\, x^{\beta}}{|\rho|} \cos\!\left(\gamma \ln x - \arg \rho\right),
$$

uma onda em $\ln x$ com frequência $\gamma$ e amplitude $x^{\beta}/\lvert \rho\rvert$.
Os zeros são as frequências da música dos primos — a metáfora é velha, mas
aqui ela é literal.

Fiz a conta com os 10 e com os 1.000 primeiros zeros:

<figure>
  <a href="/assets/images/riemann-primos.png" title="Abrir em tamanho original">
  <img src="/assets/images/riemann-primos.avif" alt="À esquerda, a escada psi de x de 1,5 a 32, que sobe em cada primo e em cada potência de primo; uma curva cinza feita com 10 zeros acompanha a escada de forma ondulada, e uma curva azul feita com 1.000 zeros fica praticamente sobre ela, com degraus nítidos. À direita, a soma de 1.000 cossenos com as frequências dos zeros: uma linha quase plana com picos agudos exatamente em 2, 3, 5, 7, 11, 13, 17, 19, 23, 29 e 31, e picos menores em 4, 8, 9, 16, 25 e 27" />
  </a>
  <figcaption>
    <strong>Figura 2:</strong> à esquerda, a escada $\psi(x)$ contada diretamente (preto), e refeita pela fórmula explícita com os 10 (cinza) e os 1.000 (azul) primeiros zeros. À direita, só as ondas: a soma de $-\cos(\gamma \ln x)$ para os 1.000 primeiros zeros, dividida por $\sqrt{x}$. Os picos caem nos primos (vermelho) e, menores, nas potências de primos (cinza). Gerada pelo código em Python abaixo. Clique na imagem para vê-la em tamanho original.
  </figcaption>
</figure>

Com dez zeros, a curva cinza já sabe mais ou menos onde ficam os degraus. Com
mil, a azul fica em cima da escada. E o painel da direita me impressionou
mais que qualquer explicação: some mil cossenos cujas frequências são as
partes imaginárias dos zeros, e os picos aparecem em 2, 3, 5, 7, 11, 13...
Ninguém disse à soma quais números são primos. Os picos das potências são
menores que os dos primos vizinhos porque o degrau em $p^k$ é $\ln p$, e não
$\ln p^k$: em 8 a escada sobe $\ln 2$, como em 2.

O código que lê os zeros e reconstrói $\psi(x)$:

<div class="code-tabs">
  <div class="code-tab" data-lang="julia">
<div class="code-container">
  <div class="code-header">
    <div class="code-lang">Julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Downloads, Plots

# Partes imaginárias dos primeiros 100.000 zeros não triviais, da tabela de A. Odlyzko
# (Universidade de Minnesota; precisão de 3 × 10⁻⁹). Baixa o arquivo só uma vez.
arquivo = "zeros1"
isfile(arquivo) || Downloads.download("https://www-users.cse.umn.edu/~odlyzko/zeta_tables/zeros1", arquivo)
γ = parse.(Float64, readlines(arquivo))
println("Zeros lidos: ", length(γ), "; primeiros: ", γ[1:4], "; até t = 60: ", count(&lt;=(60), γ),
        "; 20.000º: ", γ[20000])

# Fórmula explícita: ψ(x) a partir dos zeros ρ = 1/2 + iγ (parte real 1/2: ver o texto)
ψ_zeros(x, γ) = x - sum(2real(x^(0.5 + im * g) / (0.5 + im * g)) for g in γ) - log(2π) - log(1 - x^-2) / 2

# ψ(x) contada diretamente: soma ln p para cada potência de primo pᵏ ≤ x
eh_primo(n) = n ≥ 2 &amp;&amp; all(n % d != 0 for d in 2:isqrt(n))
function ψ_direto(x)
    total = 0.0
    for p in 2:floor(Int, x)
        eh_primo(p) || continue
        q = p
        while q ≤ x
            total += log(p)
            q *= p
        end
    end
    total
end

println("ψ(30,5): direto = ", round(ψ_direto(30.5), digits = 3), ";  com 10 zeros = ",
        round(ψ_zeros(30.5, γ[1:10]), digits = 3), ";  com 1.000 zeros = ", round(ψ_zeros(30.5, γ[1:1000]), digits = 3))

# Figura 2: a escada e as ondas
xs = range(1.5, 32, length = 8000)
p1 = plot(xs, ψ_direto.(xs), color = :black, lw = 1.5, label = "ψ(x) contada", xlabel = "x", ylabel = "ψ(x)",
          title = "A escada refeita com os zeros", legend = :topleft)
plot!(p1, xs, ψ_zeros.(xs, Ref(γ[1:10])), color = :gray, label = "10 zeros")
plot!(p1, xs, ψ_zeros.(xs, Ref(γ[1:1000])), color = :royalblue, label = "1.000 zeros")
ondas = [-sum(cos(g * log(x)) for g in γ[1:1000]) / sqrt(x) for x in xs]
p2 = plot(xs, ondas, color = :black, lw = 0.8, label = "", xlabel = "x", title = "Só as ondas (1.000 zeros)")
vline!(p2, filter(eh_primo, 2:31), color = :red, alpha = 0.4, label = "primos")
vline!(p2, [4, 8, 9, 16, 25, 27], color = :gray, alpha = 0.4, ls = :dash, label = "potências de primos")
savefig(plot(p1, p2, layout = (1, 2), size = (1000, 420), margin = 4Plots.mm), "riemann_primos_jl.png")</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">Zeros lidos: 100000; primeiros: [14.134725142, 21.022039639, 25.01085758, 30.424876126]; até t = 60: 13; 20.000º: 18046.464296238
ψ(30,5): direto = 28.476;  com 10 zeros = 29.248;  com 1.000 zeros = 28.463</pre>
</div>
  </div>
  <div class="code-tab" data-lang="r">
<div class="code-container">
  <div class="code-header">
    <div class="code-lang">R</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code># Partes imaginárias dos primeiros 100.000 zeros não triviais, da tabela de A. Odlyzko
# (Universidade de Minnesota; precisão de 3 × 10⁻⁹). Baixa o arquivo só uma vez.
arquivo &lt;- "zeros1"
if (!file.exists(arquivo)) download.file("https://www-users.cse.umn.edu/~odlyzko/zeta_tables/zeros1", arquivo)
gamma &lt;- scan(arquivo, quiet = TRUE)
cat("Zeros lidos:", length(gamma), "; primeiros:", gamma[1:4], "; até t = 60:", sum(gamma &lt;= 60),
    "; 20.000º:", format(gamma[20000], nsmall = 9), "\n")

# Fórmula explícita: ψ(x) a partir dos zeros ρ = 1/2 + iγ (parte real 1/2: ver o texto)
psi_zeros &lt;- function(x, g) {
  rho &lt;- complex(real = 0.5, imaginary = g)
  x - sum(2 * Re(x^rho / rho)) - log(2 * pi) - log(1 - x^-2) / 2
}

# ψ(x) contada diretamente: soma ln p para cada potência de primo pᵏ ≤ x
eh_primo &lt;- function(n) n &gt;= 2 &amp;&amp; (n &lt; 4 || all(n %% 2:floor(sqrt(n)) != 0))
psi_direto &lt;- function(x) {
  total &lt;- 0
  for (p in 2:floor(x)) {
    if (!eh_primo(p)) next
    q &lt;- p
    while (q &lt;= x) { total &lt;- total + log(p); q &lt;- q * p }
  }
  total
}

cat(sprintf("ψ(30,5): direto = %.3f;  com 10 zeros = %.3f;  com 1.000 zeros = %.3f\n",
            psi_direto(30.5), psi_zeros(30.5, gamma[1:10]), psi_zeros(30.5, gamma[1:1000])))

# Figura 2: a escada e as ondas
xs &lt;- seq(1.5, 32, length.out = 8000)
png("riemann_primos_r.png", width = 1000, height = 420)
par(mfrow = c(1, 2))
plot(xs, sapply(xs, psi_direto), type = "l", lwd = 1.5, xlab = "x", ylab = "ψ(x)", main = "A escada refeita com os zeros")
lines(xs, sapply(xs, psi_zeros, g = gamma[1:10]), col = "gray")
lines(xs, sapply(xs, psi_zeros, g = gamma[1:1000]), col = "royalblue")
legend("topleft", c("ψ(x) contada", "10 zeros", "1.000 zeros"), col = c("black", "gray", "royalblue"), lwd = c(1.5, 1, 1))
ondas &lt;- sapply(xs, function(x) -sum(cos(gamma[1:1000] * log(x))) / sqrt(x))
plot(xs, ondas, type = "n", xlab = "x", ylab = "", main = "Só as ondas (1.000 zeros)")
abline(v = Filter(eh_primo, 2:31), col = adjustcolor("red", 0.4))
abline(v = c(4, 8, 9, 16, 25, 27), col = adjustcolor("gray40", 0.4), lty = 2)
lines(xs, ondas, lwd = 0.8)
legend("topright", c("primos", "potências de primos"), col = c("red", "gray40"), lty = c(1, 2))
invisible(dev.off())</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">Zeros lidos: 100000 ; primeiros: 14.13473 21.02204 25.01086 30.42488 ; até t = 60: 13 ; 20.000º: 18046.464296238 
ψ(30,5): direto = 28.476;  com 10 zeros = 29.248;  com 1.000 zeros = 28.463</pre>
</div>
  </div>
  <div class="code-tab" data-lang="python">
<div class="code-container">
  <div class="code-header">
    <div class="code-lang">Python</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>import os
import urllib.request
import numpy as np
import matplotlib.pyplot as plt

# Partes imaginárias dos primeiros 100.000 zeros não triviais, da tabela de A. Odlyzko
# (Universidade de Minnesota; precisão de 3 × 10⁻⁹). Baixa o arquivo só uma vez.
arquivo = "zeros1"
if not os.path.exists(arquivo):
    urllib.request.urlretrieve("https://www-users.cse.umn.edu/~odlyzko/zeta_tables/zeros1", arquivo)
gamma = np.loadtxt(arquivo)
print(f"Zeros lidos: {len(gamma)}; primeiros: {gamma[:4]}; até t = 60: {np.sum(gamma &lt;= 60)}; "
      f"20.000º: {gamma[19999]}")

# Fórmula explícita: ψ(x) a partir dos zeros ρ = 1/2 + iγ (parte real 1/2: ver o texto)
def psi_zeros(x, g):
    rho = 0.5 + 1j * g
    return x - np.sum(2 * (x**rho / rho).real) - np.log(2 * np.pi) - np.log(1 - x**-2.0) / 2

# ψ(x) contada diretamente: soma ln p para cada potência de primo pᵏ ≤ x
def eh_primo(n):
    return n &gt;= 2 and all(n % d for d in range(2, int(n**0.5) + 1))

def psi_direto(x):
    total = 0.0
    for p in range(2, int(x) + 1):
        if eh_primo(p):
            q = p
            while q &lt;= x:
                total += np.log(p)
                q *= p
    return total

print(f"ψ(30,5): direto = {psi_direto(30.5):.3f};  com 10 zeros = {psi_zeros(30.5, gamma[:10]):.3f};  "
      f"com 1.000 zeros = {psi_zeros(30.5, gamma[:1000]):.3f}")

# Figura 2: a escada e as ondas
xs = np.linspace(1.5, 32, 8000)
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4.2))
ax1.plot(xs, [psi_direto(x) for x in xs], color="black", lw=1.5, label="ψ(x) contada")
ax1.plot(xs, [psi_zeros(x, gamma[:10]) for x in xs], color="gray", label="10 zeros")
ax1.plot(xs, [psi_zeros(x, gamma[:1000]) for x in xs], color="royalblue", label="1.000 zeros")
ax1.set_xlabel("x"); ax1.set_ylabel("ψ(x)"); ax1.set_title("A escada refeita com os zeros"); ax1.legend(loc="upper left")
ondas = [-np.sum(np.cos(gamma[:1000] * np.log(x))) / np.sqrt(x) for x in xs]
for p in [n for n in range(2, 32) if eh_primo(n)]:
    ax2.axvline(p, color="red", alpha=0.4, lw=1)
for q in [4, 8, 9, 16, 25, 27]:
    ax2.axvline(q, color="gray", alpha=0.4, lw=1, ls="--")
ax2.plot(xs, ondas, color="black", lw=0.8)
ax2.set_xlabel("x"); ax2.set_title("Só as ondas (1.000 zeros)")
ax2.plot([], [], color="red", alpha=0.4, label="primos"); ax2.plot([], [], color="gray", ls="--", label="potências de primos")
ax2.legend(loc="upper right")
fig.tight_layout(); fig.savefig("riemann_primos.png", dpi=100)</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">Zeros lidos: 100000; primeiros: [14.13472514 21.02203964 25.01085758 30.42487613]; até t = 60: 13; 20.000º: 18046.464296238
ψ(30,5): direto = 28.476;  com 10 zeros = 29.248;  com 1.000 zeros = 28.463</pre>
</div>
  </div>
</div>

Em $x = 30{,}5$, a escada vale 28,476; com 10 zeros, a fórmula dá 29,248, e
com 1.000, 28,463.

O `0.5` dentro da fórmula é a hipótese de Riemann usada como atalho: eu
escrevi a parte real de todo zero como 1/2. Para esses mil, isso é sabido
que vale (pela verificação que mencionei acima). Mas é bom saber que a
hipótese está ali, escondida num literal.[^metade]

## Por que 1/2 importa

Agora dá para responder o "e daí" do começo.

A amplitude da onda de cada zero é $x^{\beta}/\lvert \rho\rvert$, e $\beta$ é a parte
real do zero. Se todos os zeros têm $\beta = 1/2$, toda onda cresce como
$\sqrt{x}$. O erro de aproximar os primos pela curva suave fica, então, do
tamanho de $\sqrt{x}$ — um pouco mais, por causa do logaritmo e da quantidade
de ondas.

Se houvesse um único zero com $\beta = 0{,}8$, a onda dele cresceria como
$x^{0{,}8}$ e, para $x$ grande o bastante, engoliria todas as outras. Os
primos se afastariam da curva suave muito mais do que se vê. E não dá para
ter um zero só com $\beta < 1/2$ para "compensar": pela simetria, um zero em
$\beta$ vem acompanhado de um em $1 - \beta$, e um dos dois está à direita da
reta.

Isso foi tornado preciso por Helge von Koch em 1901: a hipótese de Riemann é
**equivalente** a

$$
\pi(x) = \operatorname{li}(x) + O\!\left(\sqrt{x}\,\ln x\right).
$$

Equivalente, nos dois sentidos. Em 1976, Lowell Schoenfeld deu até a
constante: **se** a hipótese for verdadeira, então para todo $x \geq 2.657$,

$$
\left|\pi(x) - \operatorname{li}(x)\right| < \frac{\sqrt{x}\,\ln x}{8\pi}.
$$

Em $x = 10^9$, isso dá $31.623 \times 20{,}72 / 25{,}13 = 26.075$.

Então a hipótese de Riemann é, no fundo, a afirmação de que os primos são
tão bem distribuídos quanto poderiam ser. O "1/2" é o expoente do erro.

Comparei a contagem real com essa cota (o código é o do crivo, lá em cima):

<figure>
  <a href="/assets/images/riemann-erro.png" title="Abrir em tamanho original">
  <img src="/assets/images/riemann-erro.avif" alt="À esquerda, em escala logarítmica de 3 mil a 1 bilhão, uma faixa azul que se abre até mais ou menos 26 mil, a cota de Schoenfeld, e dentro dela a diferença entre pi de x e li de x, uma linha vermelha que desce devagar até cerca de −1.700, quase colada ao zero. À direita, a mesma diferença dividida por raiz de x sobre ln x: uma linha vermelha que oscila entre −2,2 e −0,7, subindo devagar e terminando perto de −1,1, sempre abaixo de zero, acompanhando de perto uma curva tracejada que sobe de −1,4 a −1,13" />
  </a>
  <figcaption>
    <strong>Figura 3:</strong> à esquerda, $\pi(x) - \operatorname{li}(x)$ contado até $10^9$ (vermelho) e a faixa em que a hipótese de Riemann obriga essa diferença a ficar (azul). À direita, a mesma diferença medida em unidades de $\sqrt{x}/\ln x$, e, tracejado, o desvio esperado só pelos quadrados de primos, $-\tfrac12 \operatorname{li}(\sqrt{x})$. As duas curvas usam 300 valores de $x$ espaçados em escala logarítmica. Gerada pelo código em Python do crivo. Clique na imagem para vê-la em tamanho original.
  </figcaption>
</figure>

À esquerda, folga enorme: em um bilhão, o erro é 1.701 e a cota permite
26.075. O painel da direita mostra que o erro tem mesmo o tamanho de
$\sqrt{x}/\ln x$ — nem some, nem explode —, e que ele fica teimosamente
**negativo**, flutuando entre −2,18 e −0,74 e terminando em −1,11.

Esse −1 tem explicação, e ela me fez gostar ainda mais da fórmula
explícita. $\operatorname{li}(x)$ é, na verdade, a aproximação natural para
uma contagem que inclui as potências de primos com peso: os quadrados de
primos entram com peso 1/2, os cubos com 1/3... Como $\pi(x)$ conta só os
primos, ele fica abaixo de $\operatorname{li}(x)$ por cerca de
$\tfrac12 \operatorname{li}(\sqrt{x})$, a linha tracejada. Para $x$ muito
grande, isso é $\approx \sqrt{x}/\ln x$, o −1; mas a aproximação
$\operatorname{li}(y) \approx y / \ln y$ converge devagar, e é por isso que a
linha sai de −1,44 em $x = 3.000$ e só chega a −1,13 em $10^9$. A curva
vermelha fica um pouco abaixo da tracejada (os cubos de primos e os termos
seguintes puxam mais um pouco), e as oscilações em volta são as ondas dos
zeros.

## Os dados mentem (às vezes por muito tempo)

Olhando a tabela e a Figura 3, qualquer pessoa razoável apostaria que
$\pi(x) < \operatorname{li}(x)$ sempre. A desigualdade foi verificada para
todo $x$ até $10^{19}$.

E ela é falsa. Em 1914, John Littlewood provou que $\pi(x) - \operatorname{li}(x)$
troca de sinal **infinitas vezes**. O viés que aparece na Figura 3 é real, mas
de vez em quando as ondas dos zeros se alinham e vencem o viés. Ninguém
encontrou a primeira troca de sinal: sabe-se que não há nenhuma antes de
$10^{19}$ e que há uma antes de $1{,}4 \times 10^{316}$. O primeiro limite
superior, de Stanley Skewes, em 1933 — e supondo a própria hipótese de
Riemann —, era $e^{e^{e^{79}}} < 10^{10^{10^{34}}}$: um número cuja
quantidade de algarismos tem, ela mesma, mais de $10^{34}$ algarismos.

Para um blog de estatística, essa é talvez a lição mais útil do post. Um
bilhão de casos a favor, uma regularidade que dura até onde a vista
alcança, e a afirmação é falsa. Os primos têm escalas em que coisas
acontecem que são simplesmente grandes demais para amostrar.

É por isso que os matemáticos não se dão por satisfeitos com o fato de que a
hipótese de Riemann foi verificada, com rigor, por David Platt e Tim
Trudgian em 2021, para todos os zeros até a altura $3 \times 10^{12}$: pela
fórmula de contagem lá de cima, uns 12 trilhões de zeros. É evidência. Não
é prova.

## Um histograma que veio da física

A última coisa que eu fiz foi a que eu menos esperava que desse algo.

Se os primos se comportam "como se fossem aleatórios", talvez os zeros
também. Peguei os 20.000 zeros, corrigi o fato de que eles vão ficando mais
juntos (usando a fórmula de contagem lá de cima, para que a distância média
vire 1) e fiz o histograma das distâncias entre vizinhos. Fiz o mesmo com os
1.080.193 primos entre $10^8$ e $1{,}2 \times 10^8$:

<figure>
  <a href="/assets/images/riemann-espacamentos.png" title="Abrir em tamanho original">
  <img src="/assets/images/riemann-espacamentos.avif" alt="À esquerda, o histograma da distância entre primos vizinhos, em unidades da média: as barras decrescem a partir de perto de zero e acompanham a curva exponencial e elevado a menos s. À direita, o histograma da distância entre zeros vizinhos: quase nada perto de zero, um pico perto de 0,9 e quase nada depois de 2,5, seguindo de perto uma curva vermelha em forma de sino assimétrico, a aproximação de Wigner para matrizes aleatórias GUE; a exponencial tracejada não se parece com o histograma" />
  </a>
  <figcaption>
    <strong>Figura 4:</strong> à esquerda, distância entre primos vizinhos, em unidades da distância média, comparada com $e^{-s}$, a distribuição de pontos espalhados ao acaso e de forma independente. À direita, distância entre zeros vizinhos, comparada com a mesma $e^{-s}$ (tracejada) e com a previsão da teoria de matrizes aleatórias (vermelho). As barras dos primos agrupam três distâncias pares cada, porque a distância entre dois primos ímpares é sempre par. Gerada pelo código em Python abaixo. Clique na imagem para vê-la em tamanho original.
  </figcaption>
</figure>

Os primos, à esquerda, se parecem com pontos jogados ao acaso: distâncias
pequenas são as mais comuns, e as barras acompanham a exponencial.[^cramer]
Mas o agrupamento de três em três esconde uma estrutura fina. Olhando
distância por distância, 2 e 4 aparecem cada uma em 7,1% dos pares, e 6 em
12,6%, quase o dobro. O culpado é o 3: para $p$ e $p + 2$ serem primos (com
$p > 3$), $p$ precisa deixar resto 2 na divisão por 3 (senão $p$ ou $p + 2$ é
múltiplo de 3), e para $p + 4$, resto 1; já $p + 6$ deixa o mesmo resto que
$p$, então nunca é barrado por isso. Por esse motivo, contando só as
distâncias abaixo de um quarto da média (2 e 4, já que a média é 18,5), os
primos ficam com 14,3% dos pares, contra $1 - e^{-1/4} = 22{,}1\%$ de pontos
ao acaso.

Os zeros, à direita, são outra coisa. Eles **se repelem**: quase nunca ficam
muito perto um do outro. Só 1,07% dos pares vizinhos estão a menos de um
quarto da distância média. A curva vermelha, que é a aproximação de Wigner
para o GUE, $p(s) = \tfrac{32}{\pi^2} s^2 e^{-4s^2/\pi}$, prevê 1,61%; a
diferença diminui com a altura (nos primeiros 5.000 zeros, 0,94%; nos
últimos 5.000, 1,22%).

<div class="code-tabs">
  <div class="code-tab" data-lang="julia">
<div class="code-container">
  <div class="code-header">
    <div class="code-lang">Julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Statistics, Plots, Downloads

# Distância entre primos vizinhos de 10⁸ a 1,2 × 10⁸ (crivo de Eratóstenes)
function crivo(n)
    eh_primo = trues(n); eh_primo[1] = false
    for i in 2:isqrt(n)
        eh_primo[i] || continue
        for j in i*i:i:n
            eh_primo[j] = false
        end
    end
    eh_primo
end
eh_primo = crivo(12 * 10^7)
primos = findall(eh_primo[10^8:12*10^7]) .+ (10^8 - 1)
d = diff(primos)
media_p = mean(d)
println("Primos: ", length(primos), "; distância média ", round(media_p, digits = 2))
println("Fração com distância 2: ", round(100mean(d .== 2), digits = 1), "%;  4: ", round(100mean(d .== 4), digits = 1),
        "%;  6: ", round(100mean(d .== 6), digits = 1), "%")
println("Primos abaixo de 1/4 da média: ", round(100mean(d ./ media_p .&lt; 0.25), digits = 1),
        "%   (pontos ao acaso: ", round(100(1 - exp(-0.25)), digits = 1), "%)")

# Distância entre zeros vizinhos (20.000 primeiros), na escala em que a média vale 1:
# N(t) ≈ (t/2π) ln(t/2πe) conta os zeros até a altura t
arquivo = "zeros1"
isfile(arquivo) || Downloads.download("https://www-users.cse.umn.edu/~odlyzko/zeta_tables/zeros1", arquivo)
γ = parse.(Float64, readlines(arquivo))[1:20000]
u = γ ./ (2π) .* log.(γ ./ (2π * ℯ))
s = diff(u)
println("Zeros abaixo de 1/4 da média: ", round(100mean(s .&lt; 0.25), digits = 2), "%  (primeiros 5.000: ",
        round(100mean(s[1:4999] .&lt; 0.25), digits = 2), "%; últimos 5.000: ", round(100mean(s[end-4999:end] .&lt; 0.25), digits = 2), "%)")
wigner(x) = 32 / π^2 * x^2 * exp(-4x^2 / π)     # aproximação de Wigner para o GUE
# P(s &lt; 1/4) pela aproximação de Wigner (integral numérica pela regra do ponto médio)
h = 0.25 / 10_000
println("Aproximação de Wigner, P(s &lt; 1/4) = ", round(100sum(wigner((k - 0.5) * h) for k in 1:10_000) * h, digits = 2), "%")

# Figura 4
largura = 6 / media_p                          # cada barra junta três distâncias pares (2, 4, 6; 8, 10, 12; ...)
p1 = histogram(d ./ media_p, bins = 0:largura:4, normalize = :pdf, color = :gray70, label = "primos",
               xlabel = "distância / média", title = "Primos vizinhos (10⁸ a 1,2 × 10⁸)")
plot!(p1, x -&gt; exp(-x), 0, 4, color = :black, lw = 2, label = "e^(−s)")
p2 = histogram(s, bins = 0:0.1:4, normalize = :pdf, color = :lightblue, label = "zeros",
               xlabel = "distância / média", title = "Zeros vizinhos (20.000 primeiros)")
plot!(p2, x -&gt; exp(-x), 0, 4, color = :black, ls = :dash, label = "e^(−s)")
plot!(p2, wigner, 0, 4, color = :red, lw = 2, label = "Wigner (GUE)")
savefig(plot(p1, p2, layout = (1, 2), size = (1000, 420), margin = 4Plots.mm), "riemann_espacamentos_jl.png")</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">Primos: 1080193; distância média 18.52
Fração com distância 2: 7.1%;  4: 7.1%;  6: 12.6%
Primos abaixo de 1/4 da média: 14.3%   (pontos ao acaso: 22.1%)
Zeros abaixo de 1/4 da média: 1.07%  (primeiros 5.000: 0.94%; últimos 5.000: 1.22%)
Aproximação de Wigner, P(s &lt; 1/4) = 1.61%</pre>
</div>
  </div>
  <div class="code-tab" data-lang="r">
<div class="code-container">
  <div class="code-header">
    <div class="code-lang">R</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code># Distância entre primos vizinhos de 10⁸ a 1,2 × 10⁸ (crivo de Eratóstenes)
N &lt;- 12e7
eh_primo &lt;- rep(TRUE, N); eh_primo[1] &lt;- FALSE
for (i in 2:floor(sqrt(N))) if (eh_primo[i]) eh_primo[seq(i * i, N, by = i)] &lt;- FALSE
primos &lt;- which(eh_primo[1e8:N]) + 1e8 - 1
rm(eh_primo)
d &lt;- diff(primos)
media_p &lt;- mean(d)
cat(sprintf("Primos: %d; distância média %.2f\n", length(primos), media_p))
cat(sprintf("Fração com distância 2: %.1f%%;  4: %.1f%%;  6: %.1f%%\n", 100 * mean(d == 2), 100 * mean(d == 4), 100 * mean(d == 6)))
cat(sprintf("Primos abaixo de 1/4 da média: %.1f%%   (pontos ao acaso: %.1f%%)\n",
            100 * mean(d / media_p &lt; 0.25), 100 * (1 - exp(-0.25))))

# Distância entre zeros vizinhos (20.000 primeiros), na escala em que a média vale 1:
# N(t) ≈ (t/2π) ln(t/2πe) conta os zeros até a altura t
arquivo &lt;- "zeros1"
if (!file.exists(arquivo)) download.file("https://www-users.cse.umn.edu/~odlyzko/zeta_tables/zeros1", arquivo)
gamma &lt;- scan(arquivo, quiet = TRUE)[1:20000]
u &lt;- gamma / (2 * pi) * log(gamma / (2 * pi * exp(1)))
s &lt;- diff(u)
cat(sprintf("Zeros abaixo de 1/4 da média: %.2f%%  (primeiros 5.000: %.2f%%; últimos 5.000: %.2f%%)\n",
            100 * mean(s &lt; 0.25), 100 * mean(s[1:4999] &lt; 0.25), 100 * mean(tail(s, 5000) &lt; 0.25)))
wigner &lt;- function(x) 32 / pi^2 * x^2 * exp(-4 * x^2 / pi)   # aproximação de Wigner para o GUE
cat(sprintf("Aproximação de Wigner, P(s &lt; 1/4) = %.2f%%\n", 100 * integrate(wigner, 0, 0.25)$value))

# Figura 4
largura &lt;- 6 / media_p                       # cada barra junta três distâncias pares (2, 4, 6; 8, 10, 12; ...)
png("riemann_espacamentos_r.png", width = 1000, height = 420)
par(mfrow = c(1, 2))
hist(d[d / media_p &lt; 4] / media_p, breaks = seq(0, 4 + largura, by = largura), freq = FALSE, col = "gray80",
     border = "white", xlim = c(0, 4), xlab = "distância / média", main = "Primos vizinhos (10⁸ a 1,2 × 10⁸)")
curve(exp(-x), 0, 4, add = TRUE, lwd = 2)
legend("topright", c("primos", "e^(−s)"), fill = c("gray80", NA), border = NA, lwd = c(NA, 2))
hist(s[s &lt; 4], breaks = seq(0, 4, by = 0.1), freq = FALSE, col = "lightblue", border = "white",
     xlab = "distância / média", main = "Zeros vizinhos (20.000 primeiros)", ylim = c(0, 1.05))
curve(exp(-x), 0, 4, add = TRUE, lty = 2)
curve(wigner(x), 0, 4, add = TRUE, col = "red", lwd = 2)
legend("topright", c("zeros", "e^(−s)", "Wigner (GUE)"), fill = c("lightblue", NA, NA), border = NA,
       col = c(NA, "black", "red"), lty = c(NA, 2, 1), lwd = c(NA, 1, 2))
invisible(dev.off())</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">Primos: 1080193; distância média 18.52
Fração com distância 2: 7.1%;  4: 7.1%;  6: 12.6%
Primos abaixo de 1/4 da média: 14.3%   (pontos ao acaso: 22.1%)
Zeros abaixo de 1/4 da média: 1.07%  (primeiros 5.000: 0.94%; últimos 5.000: 1.22%)
Aproximação de Wigner, P(s &lt; 1/4) = 1.61%</pre>
</div>
  </div>
  <div class="code-tab" data-lang="python">
<div class="code-container">
  <div class="code-header">
    <div class="code-lang">Python</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>import os
import urllib.request
import numpy as np
import matplotlib.pyplot as plt

# Distância entre primos vizinhos de 10⁸ a 1,2 × 10⁸ (crivo de Eratóstenes)
N = 12 * 10**7
eh_primo = np.ones(N + 1, dtype=bool)
eh_primo[:2] = False
for i in range(2, int(N**0.5) + 1):
    if eh_primo[i]:
        eh_primo[i * i::i] = False
primos = np.flatnonzero(eh_primo[10**8:]) + 10**8
d = np.diff(primos)
media_p = d.mean()
print(f"Primos: {len(primos)}; distância média {media_p:.2f}")
print(f"Fração com distância 2: {100 * np.mean(d == 2):.1f}%;  4: {100 * np.mean(d == 4):.1f}%;  6: {100 * np.mean(d == 6):.1f}%")
print(f"Primos abaixo de 1/4 da média: {100 * np.mean(d / media_p &lt; 0.25):.1f}%   "
      f"(pontos ao acaso: {100 * (1 - np.exp(-0.25)):.1f}%)")

# Distância entre zeros vizinhos (20.000 primeiros), na escala em que a média vale 1:
# N(t) ≈ (t/2π) ln(t/2πe) conta os zeros até a altura t
arquivo = "zeros1"
if not os.path.exists(arquivo):
    urllib.request.urlretrieve("https://www-users.cse.umn.edu/~odlyzko/zeta_tables/zeros1", arquivo)
gamma = np.loadtxt(arquivo)[:20000]
u = gamma / (2 * np.pi) * np.log(gamma / (2 * np.pi * np.e))
s = np.diff(u)
print(f"Zeros abaixo de 1/4 da média: {100 * np.mean(s &lt; 0.25):.2f}%  (primeiros 5.000: "
      f"{100 * np.mean(s[:4999] &lt; 0.25):.2f}%; últimos 5.000: {100 * np.mean(s[-5000:] &lt; 0.25):.2f}%)")
wigner = lambda x: 32 / np.pi**2 * x**2 * np.exp(-4 * x**2 / np.pi)   # aproximação de Wigner para o GUE
# P(s &lt; 1/4) pela aproximação de Wigner (integral numérica pela regra do ponto médio)
h = 0.25 / 10_000
print(f"Aproximação de Wigner, P(s &lt; 1/4) = {100 * np.sum(wigner((np.arange(1, 10_001) - 0.5) * h)) * h:.2f}%")

# Figura 4
largura = 6 / media_p                          # cada barra junta três distâncias pares (2, 4, 6; 8, 10, 12; ...)
x = np.linspace(0, 4, 400)
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4.2))
ax1.hist(d / media_p, bins=np.arange(0, 4 + largura, largura), density=True, color="0.75", label="primos")
ax1.plot(x, np.exp(-x), color="black", lw=2, label="e^(−s)")
ax1.set_xlim(0, 4); ax1.set_xlabel("distância / média"); ax1.set_title("Primos vizinhos (10⁸ a 1,2 × 10⁸)"); ax1.legend()
ax2.hist(s, bins=np.arange(0, 4.05, 0.1), density=True, color="lightblue", label="zeros")
ax2.plot(x, np.exp(-x), color="black", ls="--", label="e^(−s)")
ax2.plot(x, wigner(x), color="red", lw=2, label="Wigner (GUE)")
ax2.set_xlim(0, 4); ax2.set_xlabel("distância / média"); ax2.set_title("Zeros vizinhos (20.000 primeiros)"); ax2.legend()
fig.tight_layout(); fig.savefig("riemann_espacamentos.png", dpi=100)</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">Primos: 1080193; distância média 18.52
Fração com distância 2: 7.1%;  4: 7.1%;  6: 12.6%
Primos abaixo de 1/4 da média: 14.3%   (pontos ao acaso: 22.1%)
Zeros abaixo de 1/4 da média: 1.07%  (primeiros 5.000: 0.94%; últimos 5.000: 1.22%)
Aproximação de Wigner, P(s &lt; 1/4) = 1.61%</pre>
</div>
  </div>
</div>

A curva vermelha que se ajusta tão bem aos zeros não veio da teoria dos
números. Ela vem da teoria de matrizes aleatórias, usada na física: descreve
a distância entre os autovalores de matrizes hermitianas aleatórias grandes
— o *ensemble gaussiano unitário*, ou GUE.

A conexão foi descoberta quase por acaso. Em 1972, visitando o Instituto de
Estudos Avançados, em Princeton, Hugh Montgomery mostrou ao físico Freeman
Dyson um resultado sobre a correlação entre pares de zeros. Dyson reconheceu
a fórmula: era a mesma dos autovalores de matrizes hermitianas aleatórias.
Nos anos 1980, Andrew Odlyzko calculou milhões de zeros a alturas enormes e
o ajuste se confirmou.

Ninguém sabe exatamente por quê. Uma ideia antiga, de Hilbert e Pólya, é que
os zeros sejam os autovalores de algum operador ainda desconhecido; se esse
operador for do tipo certo (autoadjunto), os autovalores seriam reais, e
isso é justamente a hipótese de Riemann. A estatística da Figura 4 é uma
pista de que essa ideia talvez não seja só bonita. Mas é uma pista.

## O que se sabe, então

Para separar o que está provado do que é só muito provável:

- **Provado:** há infinitos zeros na reta crítica (Hardy, 1914), e uma
  proporção positiva deles está lá — hoje, mais de 5/12, ou 41,6% (as
  melhorias vêm do trabalho de Selberg, Levinson e Conrey, e o 5/12 é de
  Pratt, Robles, Zaharescu e Zeindler).
- **Provado:** não há zeros sobre a reta $\operatorname{Re}(s) = 1$. Isso é
  essencialmente o teorema dos números primos.
- **Verificado numericamente, com rigor:** todos os zeros até a altura
  $3 \times 10^{12}$ estão na reta.
- **Em aberto** (segundo o Instituto Clay, na data desta revisão): todo o
  resto.

A hipótese faz parte do oitavo dos 23 problemas que David Hilbert propôs em
1900, e é um dos Problemas do Milênio do Instituto Clay, anunciados em 2000,
com prêmio de um milhão de dólares. De tempos em tempos aparece uma
demonstração anunciada; até a data desta revisão, nenhuma tinha sido
publicada e aceita (veja a nota no começo do post).

## A hipótese numa integral só

A hipótese também aparece disfarçada, em formulações que não lembram nem
primos nem zeros. A minha preferida é de V. V. Volchkov, de 1995: ela é
equivalente a uma única igualdade entre números.

$$
\int_0^{\infty} \frac{1 - 12t^2}{(1 + 4t^2)^3} \int_{1/2}^{\infty} \ln\left|\zeta(\sigma + it)\right| \, d\sigma \, dt = \frac{\pi\,(3 - \gamma)}{32}
$$

Se essa conta der exatamente o número da direita, todos os zeros não
triviais estão na reta crítica; se não der, algum está fora. Ela parece
arbitrária, mas cada pedaço tem um papel.

<figure>
  <a href="/assets/images/riemann-volchkov.png" title="Abrir em tamanho original">
  <img src="/assets/images/riemann-volchkov.avif" alt="À esquerda, um mapa de cores de ln do módulo de zeta no retângulo de sigma 0 a 3 e t 0 a 40: faixas azul-escuras, como poços, saem de cada zero sobre a reta sigma igual a meio, marcados em preto em t igual a 14,13, 21,02, 25,01, 30,42, 32,94 e 37,59; um pico vermelho fica em s igual a 1, junto ao eixo; à direita de sigma igual a 2 tudo fica quase branco, perto de zero. No alto à direita, a integral de dentro I de t, que começa em 2,57, oscila entre −2 e 1,4 e tem bicos para baixo em cada zero, e o peso, multiplicado por 5, que começa em 5, fica negativo logo depois de t igual a 0,29 e já é praticamente zero em t igual a 3. Embaixo à direita, o módulo do produto dos dois em escala logarítmica: cerca de 2,6 em t igual a 0, caindo para menos de um centésimo de milésimo depois do primeiro zero" />
  </a>
  <figcaption>
    <strong>Figura 5:</strong> as peças da integral de Volchkov. À esquerda, $\ln\lvert \zeta(\sigma + it)\rvert$: azul onde $\lvert \zeta\rvert < 1$, vermelho onde $\lvert \zeta\rvert > 1$; os zeros (pontos pretos, na reta $\sigma = \tfrac12$) são poços, e o polo em $s = 1$ é um pico. No alto à direita, a integral de dentro, $I(t)$, e o peso. Embaixo, o módulo do produto dos dois, em escala logarítmica: é ele que a integral de fora soma. Gerada pelo código em Python abaixo. Clique na imagem para vê-la em tamanho original.
  </figcaption>
</figure>

**O logaritmo, $\ln\lvert \zeta(\sigma + it)\rvert$.** Num zero, $\lvert \zeta\rvert = 0$ e o
logaritmo vai a $-\infty$: cada zero vira um poço. No polo em $s = 1$,
$\lvert \zeta\rvert$ vai ao infinito e o logaritmo vira um pico. Longe dos dois,
$\ln\lvert \zeta\rvert$ é a parte real de $\ln \zeta$, uma função analítica, e por isso
se comporta como um potencial elétrico no plano, em que os zeros e o polo
fazem o papel de cargas. Essa é a razão de usar o logaritmo: integrais de um
potencial "sentem" as cargas que estão dentro da região, e a análise
complexa tem ferramentas exatas para contar essas cargas a partir das
integrais.

**A integral de dentro, de $\sigma = \tfrac12$ a $\infty$.** Para cada altura
$t$, ela anda na horizontal, da reta crítica para a direita. É justamente a
metade da faixa crítica onde um zero fora da reta teria de aparecer: como os
zeros vêm em pares simétricos, $\beta$ e $1 - \beta$, se houver algum fora da
reta, um dos dois está à direita dela. Para a direita de $\sigma = 1$ não há
zeros (o produto de Euler garante), e mais longe ainda $\zeta(s) \to 1$, o
logaritmo vai a zero e a integral converge sem problema: em $\sigma = 45$,
$\ln\lvert \zeta\rvert$ já é $3 \times 10^{-14}$. No gráfico do alto, a curva azul é o
resultado, $I(t)$: ela tem um bico para baixo em cada zero, o rastro do poço
que fica na borda esquerda.

**O peso, $\dfrac{1 - 12t^2}{(1 + 4t^2)^3}$.** Este é o pedaço que parece
mais arbitrário e é o mais esperto. Ele é exatamente a parte real de
$1/(1 + 2it)^3$, e, sobre a reta crítica, $1 + 2it = 2s$. Ou seja: o peso é a
parte real de $1/(8s^3)$, uma função analítica cujo único polo está em
$s = 0$, à esquerda de toda a região que a integral percorre. Por isso ele
não cria singularidades novas do lado direito, e a integral dupla pode ser
calculada de forma exata com as ferramentas de análise complexa: as únicas
singularidades que contam são as da própria $\zeta$. O cubo garante que o
peso caia como $t^{-4}$, rápido o bastante para tudo convergir. O peso vale 1
em $t = 0$, troca de sinal em $t = 1/\sqrt{12} \approx 0{,}29$ e, em $t = 3$,
já é praticamente zero na escala do gráfico.

**A integral de fora, de $t = 0$ a $\infty$.** Só a metade de cima porque a
de baixo é igual: $\lvert \zeta(\sigma - it)\rvert = \lvert \zeta(\sigma + it)\rvert$, e o peso é
par. Com essa simetria, as duas integrais juntas cobrem o semiplano inteiro
à direita da reta crítica.

**O lado direito, $\pi(3 - \gamma)/32$.** É quanto a integral vale se a única
singularidade de $\zeta$ do lado direito for o polo em $s = 1$. O $\gamma$
aqui é a constante de Euler–Mascheroni, 0,5772..., e não a altura de um zero:
ela aparece porque é o termo constante de $\zeta$ perto do polo,
$\zeta(s) = \frac{1}{s - 1} + \gamma + \cdots$. O resto do número sai de
fazer essa conta com o peso escolhido.

**E a equivalência.** Cada zero fora da reta, se existisse, acrescentaria
uma parcela própria à conta, e o ponto do teorema de Volchkov é que essas
parcelas não podem se anular. Se a igualdade vale, não há nenhum. Se não
vale, há pelo menos um. A ideia de fundo é a da fórmula de Jensen, que conta
os zeros de uma função dentro de um círculo integrando $\ln\lvert f\rvert$, e a do lema
de Littlewood, que faz o mesmo num retângulo; aqui ela é aplicada a uma
região infinita, com um peso escolhido para que a conta feche. Em 2012,
Sekatskii, Beltraminelli e Merlini estudaram uma família inteira de
igualdades desse tipo, todas equivalentes à hipótese.

Calculei a integral cortando em $t = 300$: deu 0,237856295867, contra
0,237856295887 do lado direito, uma diferença na 11ª casa decimal.[^volchkov]
Parece uma confirmação, mas o painel de baixo da Figura 5 mostra de onde vem
o valor. O produto do peso pela integral de dentro vale 2,57 em $t = 0$ e cai
para menos de $10^{-5}$ depois do primeiro zero. Somado, tudo o que fica além
de $t = 14{,}13$ contribui com 0,00000095, uns quatro milionésimos do total.
A integral é decidida quase inteira perto de $t = 0$, onde não há zero
nenhum. Um zero fora da reta numa altura de $10^{20}$ (abaixo de
$3 \times 10^{12}$ já se sabe que não há nenhum) mexeria numa casa decimal
que nenhum computador alcança. A igualdade é exata, e é inútil como
teste: mais uma vez, a conta não substitui a prova.

<div class="code-tabs">
  <div class="code-tab" data-lang="julia">
<div class="code-container">
  <div class="code-header">
    <div class="code-lang">Julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Arblib, QuadGK, Downloads, Plots

# ln|ζ(σ + it)|, com ζ calculada pelo Arblib
ln_abs_ζ(σ, t) = log(abs(Arblib.fpwrap_zeta(ComplexF64(σ, t))))

# Integral de dentro: I(t) = ∫ de 1/2 a ∞ de ln|ζ(σ + it)| dσ, cortada em σ = 45
# (lá, ln|ζ| já é da ordem de 10⁻¹⁴); o ponto σ = 1 entra como ponto de quebra por causa do polo
I(t) = quadgk(σ -&gt; ln_abs_ζ(σ, t), 0.5, 1.0, 45.0; rtol = 1e-12)[1]
peso(t) = (1 - 12t^2) / (1 + 4t^2)^3

# Integral de fora, de 0 a 300, quebrada nas alturas dos zeros (lá ln|ζ| tem singularidade na borda σ = 1/2)
arquivo = "zeros1"
isfile(arquivo) || Downloads.download("https://www-users.cse.umn.edu/~odlyzko/zeta_tables/zeros1", arquivo)
γ = parse.(Float64, readlines(arquivo))
cortes = vcat(0.0, 1 / sqrt(12), 3.0, filter(&lt;(300), γ), 300.0)
partes = [quadgk(t -&gt; peso(t) * I(t), cortes[k], cortes[k+1]; rtol = 1e-12)[1] for k in 1:length(cortes)-1]
total = sum(partes)
lado_direito = π * (3 - Base.MathConstants.eulergamma) / 32
println("Integral (t até 300) = ", round(total, digits = 12))
println("π(3 − γ)/32          = ", round(lado_direito, digits = 12), "   diferença: ", total - lado_direito)
println("I(0) = ", round(I(0.0), digits = 4), ";  contribuição de t &gt; 14,13: ", sum(partes[findfirst(==(γ[1]), cortes):end]))
println("peso(300) = ", peso(300.0))

# Figura 5
σs, ts = range(0, 3, length = 200), range(0, 40, length = 300)
mapa = [clamp(ln_abs_ζ(σ, t), -4, 4) for t in ts, σ in σs]
p1 = heatmap(σs, ts, mapa, color = cgrad(:RdBu, rev = true), clims = (-4, 4), xlabel = "σ", ylabel = "t", title = "ln|ζ(σ + it)|")
scatter!(p1, fill(0.5, 6), γ[1:6], color = :black, markersize = 3, label = "zeros")
tt = range(0, 40, length = 800)
It = I.(tt)
p2 = plot(tt, It, color = :royalblue, label = "I(t)", title = "Integral de dentro e peso", xlabel = "t")
plot!(p2, tt, 5 .* peso.(tt), color = :darkorange, label = "5 × peso")
p3 = plot(tt, abs.(peso.(tt) .* It) .+ 1e-16, yscale = :log10, color = :black, label = "|peso × I(t)|",
          xlabel = "t", title = "O que a integral de fora soma")
savefig(plot(p1, p2, p3, layout = @layout([a [b; c]]), size = (1000, 600), margin = 4Plots.mm), "riemann_volchkov_jl.png")</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">Integral (t até 300) = 0.237856295867
π(3 − γ)/32          = 0.237856295887   diferença: -1.9520135507988812e-11
I(0) = 2.5678;  contribuição de t &gt; 14,13: 9.527790594390683e-7
peso(300) = -2.3147933814693353e-11</pre>
</div>
  </div>
  <div class="code-tab" data-lang="python">
<div class="code-container">
  <div class="code-header">
    <div class="code-lang">Python</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>import os
import urllib.request
import numpy as np
import matplotlib.pyplot as plt
from mpmath import zeta
from scipy.integrate import quad

# ln|ζ(σ + it)|, com ζ calculada pelo mpmath
ln_abs_zeta = lambda s, t: float(np.log(abs(complex(zeta(complex(s, t))))))

# Integral de dentro: I(t) = ∫ de 1/2 a ∞ de ln|ζ(σ + it)| dσ, cortada em σ = 45
# (lá, ln|ζ| já é da ordem de 10⁻¹⁴); o ponto σ = 1 entra como ponto de quebra por causa do polo
def I(t):
    return sum(quad(lambda s: ln_abs_zeta(s, t), a, b, epsabs=1e-13, epsrel=1e-11, limit=200)[0]
               for a, b in [(0.5, 1.0), (1.0, 45.0)])
peso = lambda t: (1 - 12 * t**2) / (1 + 4 * t**2) ** 3

# Integral de fora, quebrada nas alturas dos zeros (lá ln|ζ| tem singularidade na borda σ = 1/2).

arquivo = "zeros1"
if not os.path.exists(arquivo):
    urllib.request.urlretrieve("https://www-users.cse.umn.edu/~odlyzko/zeta_tables/zeros1", arquivo)
gamma = np.loadtxt(arquivo)
T = 300.0
cortes = [0.0, 1 / np.sqrt(12), 3.0] + [g for g in gamma if g &lt; T] + [T]
partes = [quad(lambda t: peso(t) * I(t), a, b, epsabs=1e-14, epsrel=1e-11, limit=200)[0]
          for a, b in zip(cortes[:-1], cortes[1:])]
total = sum(partes)
lado_direito = np.pi * (3 - np.euler_gamma) / 32
print(f"Integral (t até {T:.0f}) = {total:.12f}")
print(f"π(3 − γ)/32          = {lado_direito:.12f}   diferença: {total - lado_direito:.3e}")
print(f"I(0) = {I(0.0):.4f};  contribuição de t &gt; 14,13: {sum(partes[3:]):.4e}")

# Figura 5
sigmas, ts = np.linspace(0, 3, 120), np.linspace(0, 40, 200)
mapa = np.array([[np.clip(ln_abs_zeta(s, t), -4, 4) for s in sigmas] for t in ts])
tt = np.linspace(0, 40, 400)
It = np.array([I(t) for t in tt])
fig = plt.figure(figsize=(10, 6))
ax1 = fig.add_subplot(1, 2, 1)
im = ax1.pcolormesh(sigmas, ts, mapa, cmap="RdBu_r", vmin=-4, vmax=4, shading="auto")
fig.colorbar(im, ax=ax1)
ax1.plot([0.5] * 6, gamma[:6], "o", color="black", ms=3, label="zeros")
ax1.set_xlabel("σ"); ax1.set_ylabel("t"); ax1.set_title("ln|ζ(σ + it)|"); ax1.legend(loc="upper right")
ax2 = fig.add_subplot(2, 2, 2)
ax2.plot(tt, It, color="royalblue", label="I(t)")
ax2.plot(tt, 5 * peso(tt), color="darkorange", label="5 × peso")
ax2.set_xlabel("t"); ax2.set_title("Integral de dentro e peso"); ax2.legend()
ax3 = fig.add_subplot(2, 2, 4)
ax3.semilogy(tt, np.abs(peso(tt) * It) + 1e-16, color="black", label="|peso × I(t)|")
ax3.set_xlabel("t"); ax3.set_title("O que a integral de fora soma"); ax3.legend()
fig.tight_layout(); fig.savefig("riemann_volchkov.png", dpi=100)</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">Integral (t até 300) = 0.237856295867
π(3 − γ)/32          = 0.237856295887   diferença: -1.952e-11
I(0) = 2.5678;  contribuição de t &gt; 14,13: 9.5278e-07</pre>
</div>
  </div>
</div>

---

O que eu levo deste post não é o prêmio. É a fórmula explícita: os primos,
que parecem não ter regra, são uma tendência suave mais uma soma de ondas,
e as frequências das ondas são os zeros de uma única função. A hipótese de
Riemann diz que todas essas ondas crescem no mesmo ritmo, $\sqrt{x}$.
Nenhuma grita mais que as outras.

Riemann achou isso "muito provável" depois de conferir alguns zeros. Eu
usei 20.000 com um computador e acho a mesma coisa. Os dois podemos estar
errados — os primos já enganaram gente melhor —, mas, se for o caso, vai ser
a partir de uma altura que nenhum de nós vai ver.

## Referências

- Riemann, B. (1859). Ueber die Anzahl der Primzahlen unter einer gegebenen
  Grösse. *Monatsberichte der Berliner Akademie*, novembro de 1859.
  Transcrição do original e tradução para o inglês de D. R. Wilkins:
  [maths.tcd.ie/pub/HistMath/People/Riemann/Zeta](https://www.maths.tcd.ie/pub/HistMath/People/Riemann/Zeta/).
- von Koch, H. (1901). Sur la distribution des nombres premiers. *Acta
  Mathematica*, 24, 159–182. DOI: [10.1007/BF02403071](https://doi.org/10.1007/BF02403071).
- Littlewood, J. E. (1914). Sur la distribution des nombres premiers.
  *Comptes Rendus de l'Académie des Sciences*, 158, 1869–1872.
- Skewes, S. (1933). On the difference π(x) − li(x) (I). *Journal of the
  London Mathematical Society*, s1-8(4), 277–283. DOI: [10.1112/jlms/s1-8.4.277](https://doi.org/10.1112/jlms/s1-8.4.277).
- Cramér, H. (1936). On the order of magnitude of the difference between
  consecutive prime numbers. *Acta Arithmetica*, 2(1), 23–46. DOI:
  [10.4064/aa-2-1-23-46](https://doi.org/10.4064/aa-2-1-23-46).
- Turing, A. M. (1953). Some calculations of the Riemann zeta-function.
  *Proceedings of the London Mathematical Society*, s3-3(1), 99–117. DOI:
  [10.1112/plms/s3-3.1.99](https://doi.org/10.1112/plms/s3-3.1.99).
- Montgomery, H. L. (1973). The pair correlation of zeros of the zeta
  function. *Proceedings of Symposia in Pure Mathematics*, 24, 181–193. DOI:
  [10.1090/pspum/024/9944](https://doi.org/10.1090/pspum/024/9944).
- Schoenfeld, L. (1976). Sharper bounds for the Chebyshev functions θ(x) and
  ψ(x). II. *Mathematics of Computation*, 30(134), 337–360. DOI:
  [10.1090/S0025-5718-1976-0457374-X](https://doi.org/10.1090/S0025-5718-1976-0457374-X).
- Odlyzko, A. M. (1987). On the distribution of spacings between zeros of the
  zeta function. *Mathematics of Computation*, 48(177), 273–308. DOI:
  [10.1090/S0025-5718-1987-0866115-0](https://doi.org/10.1090/S0025-5718-1987-0866115-0).
- Volchkov, V. V. (1995). On an equality equivalent to the Riemann
  hypothesis. *Ukrainian Mathematical Journal*, 47(3), 491–493. DOI:
  [10.1007/BF01056314](https://doi.org/10.1007/BF01056314).
- Bays, C.; Hudson, R. H. (2000). A new bound for the smallest $x$ with
  $\pi(x) > \operatorname{li}(x)$. *Mathematics of Computation*, 69(231),
  1285–1296. DOI: [10.1090/S0025-5718-99-01104-7](https://doi.org/10.1090/S0025-5718-99-01104-7).
- Sekatskii, S. K.; Beltraminelli, S.; Merlini, D. (2012). On equalities
  involving integrals of the logarithm of the Riemann ζ-function and
  equivalent to the Riemann hypothesis. *Ukrainian Mathematical Journal*,
  64(2), 247–261. DOI: [10.1007/s11253-012-0642-0](https://doi.org/10.1007/s11253-012-0642-0).
- Büthe, J. (2018). An analytic method for bounding $\psi(x)$. *Mathematics
  of Computation*, 87(312), 1991–2009. DOI: [10.1090/mcom/3264](https://doi.org/10.1090/mcom/3264).
- Pratt, K.; Robles, N.; Zaharescu, A.; Zeindler, D. (2020). More than
  five-twelfths of the zeros of ζ are on the critical line. *Research in the
  Mathematical Sciences*, 7(1). DOI: [10.1007/s40687-019-0199-8](https://doi.org/10.1007/s40687-019-0199-8).
- Platt, D.; Trudgian, T. (2021). The Riemann hypothesis is true up to
  $3 \cdot 10^{12}$. *Bulletin of the London Mathematical Society*, 53(3),
  792–797. DOI: [10.1112/blms.12460](https://doi.org/10.1112/blms.12460).
- Odlyzko, A. M. Tables of zeros of the Riemann zeta function (os primeiros
  100.000 zeros, com precisão de $3 \times 10^{-9}$).
  [www-users.cse.umn.edu/~odlyzko/zeta_tables](https://www-users.cse.umn.edu/~odlyzko/zeta_tables/index.html).
  Acesso em 25 nov. 2026.

[^riemann]: No original: "Es ist sehr wahrscheinlich, dass alle Wurzeln reell sind. Hiervon wäre allerdings ein strenger Beweis zu wünschen; ich habe indess die Aufsuchung desselben nach einigen flüchtigen vergeblichen Versuchen vorläufig bei Seite gelassen, da er für den nächsten Zweck meiner Untersuchung entbehrlich schien" (o fim da frase diz que a demonstração parecia dispensável para o objetivo imediato do artigo). O texto foi conferido na transcrição de D. R. Wilkins (nas referências). Ele fala em raízes *reais* porque escreve a função numa variável deslocada e girada, em que a reta crítica vira o eixo real. É o mesmo enunciado.

[^metade]: A tabela de Odlyzko traz só a parte imaginária de cada zero, justamente porque os zeros foram procurados na reta crítica. Usar a parte real 1/2 não tira a suposição do código, só a deixa explícita. Quem garante que é 1/2 de verdade, para esses zeros, é a verificação numérica, não o meu código.

[^volchkov]: Integrei em Julia com o pacote QuadGK, avaliando $\zeta$ com o `fpwrap_zeta` do Arblib, e em Python com o `quad` do SciPy e a $\zeta$ do mpmath. A integral de dentro vai de $\sigma = 1/2$ a 45 (depois disso, $\ln\lvert \zeta\rvert$ é menor que $10^{-13}$), e a de fora foi quebrada nas alturas dos zeros, onde $\ln\lvert \zeta\rvert$ tem singularidades na borda $\sigma = 1/2$. Há outra singularidade no polo, em $s = 1$, e as duas são integráveis. Depois de $t = 300$ o peso já vale $2 \times 10^{-11}$, e uma cota grosseira para o que o corte deixa de fora é da ordem de $10^{-8}$; a diferença observada, $2 \times 10^{-11}$, mostra que na prática é bem menos. Em Julia a conta leva cerca de um minuto.

[^cramer]: Essa é a intuição do modelo de Harald Cramér, de 1936: tratar cada inteiro $n$ como primo com probabilidade $1/\ln n$, de forma independente. O modelo erra em detalhes — por exemplo, dois primos ímpares nunca estão a uma distância ímpar, e distâncias múltiplas de 6 são mais comuns que as outras —, mas acerta a forma geral, que é a que aparece na figura.
