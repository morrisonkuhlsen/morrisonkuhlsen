---
layout: post
image: /assets/images/capa-sobrevivencia.avif
title: "Os aviões que voltaram: o viés de sobrevivência, de Abraham Wald aos fundos que batem o mercado"
categories: [ESTATÍSTICA, JULIA, PROBABILIDADE]
tags: [Estatística, Probabilidade, Julia, R, Python]
lang: pt
ref: vies-de-sobrevivencia
author: dante-bertuzzi
description: "Por que blindar onde os aviões voltam furados é o erro: Abraham Wald, a conta de Bayes do viés de sobrevivência e o mesmo erro nos fundos, com simulações."
mathjax: true
slug: vies-de-sobrevivencia-avioes-abraham-wald
---

Eu conhecia a história dos aviões da Segunda Guerra do jeito que todo mundo
conhece: os bombardeiros voltavam furados, os oficiais queriam blindar onde
havia furos, e um estatístico disse que não — a blindagem ia onde **não**
havia furos, porque os aviões atingidos ali não tinham voltado para ser
contados.

É uma história ótima. Tão ótima que eu nunca tinha feito a conta.

Este post é a conta. Ela acabou sendo uma linha do teorema de Bayes, um
estimador que eu não esperava que funcionasse tão bem, uma simulação que na
primeira tentativa não mostrou nada, e um erro meu num exemplo de fundos de
investimento que, ironicamente, era ele mesmo um viés de seleção.

## Primeiro, o que é verdade nessa história

O estatístico existiu. Abraham Wald nasceu em 1902 em Kolozsvár — na época
Hungria, hoje Cluj, na Romênia — e chegou aos Estados Unidos em 1938. Na
guerra, trabalhou no Statistical Research Group da Universidade de Columbia,
um grupo que respondia a perguntas militares com estatística.[^grupo]

Os documentos também existiram. Durante a guerra, Wald escreveu os
memorandos *A Method of Estimating Plane Vulnerability Based on Damage of
Survivors*, reimpressos em 1980 pelo Center for Naval Analyses. O título já
entrega o post inteiro: estimar a vulnerabilidade dos aviões **a partir do
dano dos sobreviventes**. O trabalho é descrito em detalhe no artigo de
Mangel e Samaniego (1984).

Agora, o que eu não consegui confirmar. O diálogo com os oficiais — eles
apontando os furos, Wald apontando o vazio — é a versão que circula em
livros de divulgação e palestras, e não achei uma fonte que mostre de onde
ela veio. Pode ter acontecido mais ou menos assim; pode ser uma boa
dramatização de um relatório cheio de equações.

E o desenho do avião coberto de pontinhos vermelhos, que aparece em toda
apresentação sobre o assunto? É moderno. Não saiu de relatório nenhum.[^desenho]

Então a anedota é, no mínimo, embelezada. A ideia, não. A ideia está no
título dos memorandos: o dano que você vê nos que voltaram é informação sobre
os que não voltaram.

## A conta, com um avião de mentira

Peguei um avião e dividi em cinco regiões. Supus que um tiro tem a mesma
chance de cair em qualquer ponto da silhueta, então cada região recebe tiros
na proporção da sua área, $a_i$. E inventei a letalidade $q_i$: a chance de um
tiro naquela região derrubar o avião.

| Região | Área ($a_i$) | Letalidade de um tiro ($q_i$) |
|---|---:|---:|
| Motores | 20% | 65% |
| Cabine | 5% | 70% |
| Fuselagem | 30% | 3% |
| Asas | 35% | 4% |
| Cauda | 10% | 10% |

Esses 65% e 70% não vieram de lugar nenhum além da minha cabeça. Mas a ordem
é razoável: um tiro no motor ou no piloto é bem pior que um furo na lataria.
(E, como vou contar adiante, os números altos não foram a minha primeira
escolha.)

Mande 1.000 aviões, cada um levando **um** tiro só. Pelas áreas, 200 são
atingidos no motor. Desses, 65% caem: $200 \times 0{,}65 = 130$. Voltam
$200 - 130 = 70$. Repetindo para todas as regiões:

| Região | Atingidos | Caem | Voltam | Parcela dos furos no hangar |
|---|---:|---:|---:|---:|
| Motores | 200 | 130 | 70 | $70/802 = 8{,}7\%$ |
| Cabine | 50 | 35 | 15 | $15/802 = 1{,}9\%$ |
| Fuselagem | 300 | 9 | 291 | $291/802 = 36{,}3\%$ |
| Asas | 350 | 14 | 336 | $336/802 = 41{,}9\%$ |
| Cauda | 100 | 10 | 90 | $90/802 = 11{,}2\%$ |
| **Total** | **1.000** | **198** | **802** | **100%** |

Os motores levaram 20% dos tiros e aparecem com 8,7% dos furos. A fuselagem
levou 30% e aparece com 36,3%.

Quem está no hangar contando furos vê a fuselagem e as asas como as partes
"mais atingidas". E elas são exatamente as que menos importam.

## Isso tem nome, e o nome é Bayes

A última coluna da tabela não é "onde os tiros caem". É "onde os tiros caem,
**sabendo que o avião voltou**". Pelo
[teorema de Bayes](/formulas/teorema-bayes.html), com
$P(\text{voltou}) = 802/1.000 = 0{,}802$:

$$
P(\text{motor} \mid \text{voltou})
= \frac{P(\text{voltou} \mid \text{motor})\, P(\text{motor})}{P(\text{voltou})}
= \frac{0{,}35 \times 0{,}20}{0{,}802} = \frac{0{,}07}{0{,}802} = 0{,}087.
$$

São três números diferentes andando juntos: onde os tiros caem,
$P(\text{região})$; quanto cada região aguenta, $P(\text{voltou} \mid
\text{região})$; e o que o hangar mede, $P(\text{região} \mid \text{voltou})$.
A fórmula diz exatamente como o terceiro deforma o primeiro: cada região é
multiplicada por $1 - q_i$ (e tudo é dividido pelo mesmo $P(\text{voltou})$).
Quanto mais letal, mais ela some.

É o erro clássico da
[probabilidade condicional](/formulas/probabilidade-condicional.html) —
trocar $P(A \mid B)$ por $P(A)$ — com um agravante. Normalmente dá para
perceber que existe um $B$. Aqui, o $B$ é "chegou até aqui", e **todo mundo
que você consegue observar** o satisfaz. A condição fica invisível.

## Dá para desfazer (isso eu não esperava)

Eu achava que a lição de Wald terminava em "cuidado, os dados estão
enviesados". Não termina. Como o viés tem uma forma conhecida, dá para
desfazê-lo.

Na versão de um tiro por avião, se você sabe quantos aviões saíram
($N = 1.000$) e a área de cada região, a conta é quase ofensiva de tão
simples:

$$
\hat{q}_i = 1 - \frac{s_i}{N\, a_i},
\qquad\text{por exemplo}\qquad
\hat{q}_{\text{motor}} = 1 - \frac{70}{1.000 \times 0{,}20} = 1 - \frac{70}{200} = 1 - 0{,}35 = 0{,}65.
$$

Aqui $s_i$ é quantos aviões voltaram furados na região $i$. Se ninguém
caísse, essa região deveria aparecer em $N a_i$ aviões. O que falta é a
letalidade.

Avião de verdade leva mais de um tiro. O que faço abaixo é uma versão
simplificada minha, não a formulação de Wald.[^formula] Suponha que o
número de tiros de cada missão segue uma
[distribuição de Poisson](/formulas/distribuicao-poisson.html) com média
$\lambda$ e que cada tiro cai e age de forma independente. Uma propriedade da
Poisson, a decomposição (ou "afinamento"), faz o trabalho pesado: os tiros
letais e os não letais de cada região viram contagens Poisson independentes
umas das outras. Daí:

- um avião volta se não levar nenhum tiro letal:
  $P(\text{voltar}) = e^{-\lambda Q}$, com $Q = \sum_i a_i q_i$;
- e, entre os que voltam, os furos na região $i$ continuam Poisson, com média
  $\lambda a_i (1 - q_i)$ por avião.

Com $N$ missões, $S$ aviões de volta e $H$ furos neles, as duas equações dão
até o $\lambda$, que ninguém observa diretamente. Como $S/N \approx e^{-\lambda Q}$,
temos $\ln(N/S) \approx \lambda Q$; e como $H/S \approx \lambda(1 - Q)$, somando:

$$
\hat{\lambda} = \frac{H}{S} + \ln\frac{N}{S},
\qquad
\hat{q}_i = 1 - \frac{h_i}{S\,\hat{\lambda}\,a_i},
$$

com $h_i$ o número de furos na região $i$ entre os que voltaram. Tudo do lado
direito é coisa que se conta no hangar ou na papelada: quantos saíram, quantos
voltaram, onde estão os furos e o tamanho de cada região. (Se as contagens
fossem exatamente iguais às médias, as fórmulas devolveriam $\lambda$ e $q_i$
exatos; com contagens sorteadas, devolvem aproximações.)

Quando cheguei nessa fórmula, desconfiei dela. Então simulei.

## A simulação que não mostrou nada

Desenhei um bombardeiro de quatro motores visto de cima, feito de
retângulos, sorteei tiros uniformemente sobre a silhueta e mandei 10.000
missões, com 2 tiros por missão em média. Na primeira versão, dei 30% de
letalidade aos motores e 35% à cabine. Pareciam números respeitáveis.

O desenho dos furos ficou... um avião furado. Por igual. Os motores tinham
um pouco menos de furos que o resto, mas nada que alguém notasse olhando.

Demorei um pouco para entender que a simulação não estava errada. Ela estava
me ensinando uma coisa: o hangar só esconde muito quando a região é **muito**
letal. A densidade de furos de cada região entre os sobreviventes é
proporcional a $1 - q_i$. Com 30% de letalidade, os motores aparecem com 70%
da densidade de uma região inofensiva — diferença real, mas discreta. Para o
"vazio" famoso aparecer, um tiro ali precisa ser quase sempre fatal.

Subi para 65% e 70%. Ainda não é o vazio do desenho famoso — para isso
seria preciso chegar perto de 100% —, mas a diferença já aparece. O código
completo, nas três linguagens:

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
    <pre><code>using Random, Distributions, StatsPlots

# Silhueta de um bombardeiro de quatro motores, vista de cima, feita de retângulos
# (x1, x2, y1, y2). Um ponto pertence à primeira região da lista que o contém.
regioes = ["Motores", "Cabine", "Fuselagem", "Asas", "Cauda"]
retangulos = [
    [(-7.7, -6.3, -1.5, 3.5), (-4.2, -2.8, -1.5, 3.5), (2.8, 4.2, -1.5, 3.5), (6.3, 7.7, -1.5, 3.5)],  # motores
    [(-0.8, 0.8, 7.0, 9.5)],    # cabine
    [(-0.8, 0.8, -9.0, 7.0)],   # fuselagem
    [(-11.0, 11.0, 0.0, 3.0)],  # asas
    [(-4.0, 4.0, -9.0, -7.0)],  # cauda (estabilizador horizontal)
]
dentro(x, y, (x1, x2, y1, y2)) = x1 &lt;= x &lt;= x2 &amp;&amp; y1 &lt;= y &lt;= y2
regiao(x, y) = findfirst(rs -&gt; any(r -&gt; dentro(x, y, r), rs), retangulos)   # nothing = fora do avião

# Área exata de cada região (sem contar a parte coberta por regiões anteriores da lista)
area = [4 * 1.4 * 5.0,                        # motores
        1.6 * 2.5,                            # cabine
        1.6 * 16.0,                           # fuselagem
        22.0 * 3.0 - 1.6 * 3.0 - 4 * 1.4 * 3.0, # asas, sem fuselagem e motores
        8.0 * 2.0 - 1.6 * 2.0]                # cauda, sem fuselagem
a = area ./ sum(area)                         # fração da silhueta em cada região

q = [0.65, 0.70, 0.03, 0.04, 0.10]   # letalidade de um tiro (inventada)
λ, N = 2.0, 10_000                   # tiros por missão (Poisson de média λ) e número de missões

rng = Xoshiro(1943)
function tiro(rng)                   # um ponto uniforme sobre a silhueta (por rejeição)
    while true
        x, y = rand(rng) * 22 - 11, rand(rng) * 18.5 - 9
        r = regiao(x, y)
        r === nothing || return x, y, r
    end
end

h = zeros(Int, 5)        # furos por região nos aviões que voltaram
S = 0                    # aviões que voltaram
furos = Tuple{Float64, Float64}[]
for _ in 1:N
    tiros = [tiro(rng) for _ in 1:rand(rng, Poisson(λ))]
    any(rand(rng) &lt; q[t[3]] for t in tiros) &amp;&amp; continue      # abatido: não entra no hangar
    global S += 1
    for (x, y, r) in tiros
        h[r] += 1
        push!(furos, (x, y))
    end
end
H = sum(h)

# Estimador: só com o que se vê no hangar, mais N e as áreas
λ̂ = H / S + log(N / S)
q̂ = 1 .- h ./ (S * λ̂ .* a)

println("Áreas relativas: ", round.(a, digits = 4))
println("Voltaram S = $S de N = $N; furos H = $H")
println("Furos por avião, por unidade de área relativa: ", round.(h ./ (S .* a), digits = 2),
        "   (esperado λ(1 − q): ", round.(λ .* (1 .- q), digits = 2), ")")
println("λ̂ = ", round(λ̂, digits = 3))
for i in 1:5
    println(rpad(regioes[i], 10), " verdadeira ", round(100q[i], digits = 1), "%   estimada ", round(100q̂[i], digits = 1), "%")
end

# Figura: os primeiros 1.100 furos registrados no hangar e letalidade verdadeira × estimada
p1 = plot(aspect_ratio = :equal, legend = false, axis = false, ticks = false, title = "Furos nos aviões que voltaram")
for i in [4, 3, 5, 2, 1], (x1, x2, y1, y2) in retangulos[i]   # asas por baixo, motores por cima
    plot!(p1, Shape([x1, x2, x2, x1], [y1, y1, y2, y2]), color = :lightgray, linecolor = :gray)
end
pts = furos[1:min(end, 1100)]
scatter!(p1, first.(pts), last.(pts), markersize = 1.5, color = :red, markerstrokewidth = 0)
p2 = groupedbar(regioes, 100 .* [q q̂], label = ["Verdadeira" "Estimada"], color = [:gray :royalblue],
                ylabel = "Letalidade de um tiro (%)", title = "Letalidade por região", legend = :topright)
savefig(plot(p1, p2, layout = (1, 2), size = (1000, 460)), "sobrevivencia_avioes_jl.png")</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">Áreas relativas: [0.2439, 0.0348, 0.223, 0.3868, 0.1115]
Voltaram S = 6445 de N = 10000; furos H = 9994
Furos por avião, por unidade de área relativa: [0.68, 0.5, 1.99, 1.9, 1.7]   (esperado λ(1 − q): [0.7, 0.6, 1.94, 1.92, 1.8])
λ̂ = 1.99
Motores    verdadeira 65.0%   estimada 65.8%
Cabine     verdadeira 70.0%   estimada 74.7%
Fuselagem  verdadeira 3.0%   estimada 0.0%
Asas       verdadeira 4.0%   estimada 4.6%
Cauda      verdadeira 10.0%   estimada 14.8%</pre>
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
    <pre><code># Silhueta de um bombardeiro de quatro motores, vista de cima, feita de retângulos
# (x1, x2, y1, y2). Um ponto pertence à primeira região da lista que o contém.
regioes &lt;- c("Motores", "Cabine", "Fuselagem", "Asas", "Cauda")
retangulos &lt;- list(
  rbind(c(-7.7, -6.3, -1.5, 3.5), c(-4.2, -2.8, -1.5, 3.5), c(2.8, 4.2, -1.5, 3.5), c(6.3, 7.7, -1.5, 3.5)),  # motores
  rbind(c(-0.8, 0.8, 7.0, 9.5)),    # cabine
  rbind(c(-0.8, 0.8, -9.0, 7.0)),   # fuselagem
  rbind(c(-11.0, 11.0, 0.0, 3.0)),  # asas
  rbind(c(-4.0, 4.0, -9.0, -7.0))   # cauda (estabilizador horizontal)
)
regiao &lt;- function(x, y) {
  for (i in seq_along(retangulos)) {
    r &lt;- retangulos[[i]]
    if (any(r[, 1] &lt;= x &amp; x &lt;= r[, 2] &amp; r[, 3] &lt;= y &amp; y &lt;= r[, 4])) return(i)
  }
  NA   # fora do avião
}

# Área exata de cada região (sem contar a parte coberta por regiões anteriores da lista)
area &lt;- c(4 * 1.4 * 5.0,                          # motores
          1.6 * 2.5,                              # cabine
          1.6 * 16.0,                             # fuselagem
          22.0 * 3.0 - 1.6 * 3.0 - 4 * 1.4 * 3.0, # asas, sem fuselagem e motores
          8.0 * 2.0 - 1.6 * 2.0)                  # cauda, sem fuselagem
a &lt;- area / sum(area)                             # fração da silhueta em cada região

q &lt;- c(0.65, 0.70, 0.03, 0.04, 0.10)   # letalidade de um tiro (inventada)
lambda &lt;- 2; N &lt;- 10000                # tiros por missão (Poisson de média λ) e número de missões

set.seed(1943)
tiro &lt;- function() {                   # um ponto uniforme sobre a silhueta (por rejeição)
  repeat {
    x &lt;- runif(1, -11, 11); y &lt;- runif(1, -9, 9.5)
    r &lt;- regiao(x, y)
    if (!is.na(r)) return(c(x, y, r))
  }
}

h &lt;- integer(5)          # furos por região nos aviões que voltaram
S &lt;- 0                   # aviões que voltaram
furos &lt;- matrix(numeric(0), ncol = 2)
for (m in 1:N) {
  k &lt;- rpois(1, lambda)
  tiros &lt;- if (k &gt; 0) t(replicate(k, tiro())) else matrix(numeric(0), ncol = 3)
  if (any(runif(k) &lt; q[tiros[, 3]])) next      # abatido: não entra no hangar
  S &lt;- S + 1
  for (j in seq_len(k)) h[tiros[j, 3]] &lt;- h[tiros[j, 3]] + 1
  furos &lt;- rbind(furos, tiros[, 1:2, drop = FALSE])
}
H &lt;- sum(h)

# Estimador: só com o que se vê no hangar, mais N e as áreas
lambda_hat &lt;- H / S + log(N / S)
q_hat &lt;- 1 - h / (S * lambda_hat * a)

cat("Áreas relativas:", round(a, 4), "\n")
cat("Voltaram S =", S, "de N =", N, "; furos H =", H, "\n")
cat("Furos por avião, por unidade de área relativa:", round(h / (S * a), 2),
    "  (esperado λ(1 − q):", round(lambda * (1 - q), 2), ")\n")
cat("λ̂ =", round(lambda_hat, 3), "\n")
for (i in 1:5) cat(sprintf("%-10s verdadeira %.1f%%   estimada %.1f%%\n", regioes[i], 100 * q[i], 100 * q_hat[i]))

# Figura: os primeiros 1.100 furos registrados no hangar e letalidade verdadeira × estimada
png("sobrevivencia_avioes_r.png", width = 1000, height = 460)
par(mfrow = c(1, 2))
plot(NA, xlim = c(-11, 11), ylim = c(-9, 9.5), asp = 1, axes = FALSE, xlab = "", ylab = "",
     main = "Furos nos aviões que voltaram")
for (i in c(4, 3, 5, 2, 1)) {          # asas por baixo, motores por cima
  r &lt;- retangulos[[i]]
  rect(r[, 1], r[, 3], r[, 2], r[, 4], col = "gray85", border = "gray50")
}
pts &lt;- furos[seq_len(min(nrow(furos), 1100)), , drop = FALSE]
points(pts[, 1], pts[, 2], pch = 16, cex = 0.4, col = "red")
barplot(100 * rbind(q, q_hat), beside = TRUE, names.arg = regioes, col = c("gray50", "royalblue"),
        ylab = "Letalidade de um tiro (%)", main = "Letalidade por região",
        legend.text = c("Verdadeira", "Estimada"))
invisible(dev.off())</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">Áreas relativas: 0.2439 0.0348 0.223 0.3868 0.1115 
Voltaram S = 6488 de N = 10000 ; furos H = 10225 
Furos por avião, por unidade de área relativa: 0.71 0.57 1.93 1.95 1.8   (esperado λ(1 − q): 0.7 0.6 1.94 1.92 1.8 )
λ̂ = 2.009 
Motores    verdadeira 65.0%   estimada 64.7%
Cabine     verdadeira 70.0%   estimada 71.8%
Fuselagem  verdadeira 3.0%   estimada 3.9%
Asas       verdadeira 4.0%   estimada 3.2%
Cauda      verdadeira 10.0%   estimada 10.3%</pre>
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
from matplotlib.patches import Rectangle

# Silhueta de um bombardeiro de quatro motores, vista de cima, feita de retângulos
# (x1, x2, y1, y2). Um ponto pertence à primeira região da lista que o contém.
regioes = ["Motores", "Cabine", "Fuselagem", "Asas", "Cauda"]
retangulos = [
    [(-7.7, -6.3, -1.5, 3.5), (-4.2, -2.8, -1.5, 3.5), (2.8, 4.2, -1.5, 3.5), (6.3, 7.7, -1.5, 3.5)],  # motores
    [(-0.8, 0.8, 7.0, 9.5)],    # cabine
    [(-0.8, 0.8, -9.0, 7.0)],   # fuselagem
    [(-11.0, 11.0, 0.0, 3.0)],  # asas
    [(-4.0, 4.0, -9.0, -7.0)],  # cauda (estabilizador horizontal)
]

def regiao(x, y):
    for i, rs in enumerate(retangulos):
        if any(x1 &lt;= x &lt;= x2 and y1 &lt;= y &lt;= y2 for (x1, x2, y1, y2) in rs):
            return i
    return None   # fora do avião

# Área exata de cada região (sem contar a parte coberta por regiões anteriores da lista)
area = np.array([4 * 1.4 * 5.0,                          # motores
                 1.6 * 2.5,                              # cabine
                 1.6 * 16.0,                             # fuselagem
                 22.0 * 3.0 - 1.6 * 3.0 - 4 * 1.4 * 3.0, # asas, sem fuselagem e motores
                 8.0 * 2.0 - 1.6 * 2.0])                 # cauda, sem fuselagem
a = area / area.sum()                                    # fração da silhueta em cada região

q = np.array([0.65, 0.70, 0.03, 0.04, 0.10])   # letalidade de um tiro (inventada)
lam, N = 2.0, 10_000                           # tiros por missão (Poisson de média λ) e número de missões

rng = np.random.default_rng(1943)
def tiro():                                    # um ponto uniforme sobre a silhueta (por rejeição)
    while True:
        x, y = rng.uniform(-11, 11), rng.uniform(-9, 9.5)
        r = regiao(x, y)
        if r is not None:
            return x, y, r

h = np.zeros(5, dtype=int)   # furos por região nos aviões que voltaram
S = 0                        # aviões que voltaram
furos = []
for _ in range(N):
    tiros = [tiro() for _ in range(rng.poisson(lam))]
    if any(rng.random() &lt; q[r] for (_, _, r) in tiros):   # abatido: não entra no hangar
        continue
    S += 1
    for (x, y, r) in tiros:
        h[r] += 1
        furos.append((x, y))
H = h.sum()

# Estimador: só com o que se vê no hangar, mais N e as áreas
lam_hat = H / S + np.log(N / S)
q_hat = 1 - h / (S * lam_hat * a)

print("Áreas relativas:", a.round(4))
print(f"Voltaram S = {S} de N = {N}; furos H = {H}")
print("Furos por avião, por unidade de área relativa:", (h / (S * a)).round(2),
      "  (esperado λ(1 − q):", (lam * (1 - q)).round(2), ")")
print(f"λ̂ = {lam_hat:.3f}")
for i in range(5):
    print(f"{regioes[i]:&lt;10} verdadeira {100 * q[i]:.1f}%   estimada {100 * q_hat[i]:.1f}%")

# Figura: os primeiros 1.100 furos registrados no hangar e letalidade verdadeira × estimada
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4.6))
for i in [3, 2, 4, 1, 0]:          # asas por baixo, motores por cima
    for (x1, x2, y1, y2) in retangulos[i]:
        ax1.add_patch(Rectangle((x1, y1), x2 - x1, y2 - y1, facecolor="0.85", edgecolor="0.5"))
pts = np.array(furos[:1100])
ax1.scatter(pts[:, 0], pts[:, 1], s=3, color="red")
ax1.set_xlim(-11.5, 11.5); ax1.set_ylim(-9.5, 10); ax1.set_aspect("equal"); ax1.axis("off")
ax1.set_title("Furos nos aviões que voltaram")
x = np.arange(5)
ax2.bar(x - 0.2, 100 * q, 0.4, color="0.5", label="Verdadeira")
ax2.bar(x + 0.2, 100 * q_hat, 0.4, color="royalblue", label="Estimada")
ax2.set_xticks(x, regioes); ax2.set_ylabel("Letalidade de um tiro (%)")
ax2.set_title("Letalidade por região"); ax2.legend()
fig.tight_layout(); fig.savefig("sobrevivencia_avioes.png", dpi=100)</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">Áreas relativas: [0.2439 0.0348 0.223  0.3868 0.1115]
Voltaram S = 6456 de N = 10000; furos H = 10102
Furos por avião, por unidade de área relativa: [0.67 0.6  1.97 1.94 1.71]   (esperado λ(1 − q): [0.7  0.6  1.94 1.92 1.8 ] )
λ̂ = 2.002
Motores    verdadeira 65.0%   estimada 66.3%
Cabine     verdadeira 70.0%   estimada 70.2%
Fuselagem  verdadeira 3.0%   estimada 1.7%
Asas       verdadeira 4.0%   estimada 3.1%
Cauda      verdadeira 10.0%   estimada 14.6%</pre>
</div>
  </div>
</div>

Os números do texto e a figura vêm da versão em Python. As versões em Julia
e em R sorteiam outros números (cada linguagem tem o seu gerador aleatório) e
dão resultados um pouco diferentes, com as mesmas conclusões.

<figure>
  <a href="/assets/images/sobrevivencia-avioes.png" title="Abrir em tamanho original">
  <img src="/assets/images/sobrevivencia-avioes.avif" alt="À esquerda, a silhueta de um bombardeiro de quatro motores vista de cima, feita de retângulos cinza, com 1.100 pontos vermelhos marcando furos dos aviões que voltaram: fuselagem, asas e cauda cheias de furos, motores e cabine com poucos. À direita, barras comparando a letalidade verdadeira de um tiro em cada região com a estimada só a partir dos que voltaram: motores 65% e 66,3%, cabine 70% e 70,2%, fuselagem 3% e 1,7%, asas 4% e 3,1%, cauda 10% e 14,6%" />
  </a>
  <figcaption>
    <strong>Figura 1:</strong> à esquerda, os primeiros 1.100 furos registrados no hangar; motores e cabine aparecem com cerca de um terço da densidade de furos das outras regiões, porque a maioria dos aviões atingidos ali não voltou. À direita, a letalidade de cada região: em cinza, a verdadeira; em azul, a estimada pelas fórmulas acima usando só os sobreviventes. Gerada pelo código em Python acima. Clique na imagem para vê-la em tamanho original.
  </figcaption>
</figure>

Voltaram 6.456 dos 10.000 aviões, com 10.102 furos. Medindo os furos por
avião e por fração da área, a fuselagem tem 1,97; os motores, 0,67. Quase três
vezes menos — e a conta prevê $\lambda(1 - q_i)$: $2 \times 0{,}97 = 1{,}94$ na
fuselagem e $2 \times 0{,}35 = 0{,}70$ nos motores.

E a fórmula de que eu desconfiava deu $\hat{\lambda} = 2{,}002$, contra o
verdadeiro 2:

| Região | Letalidade verdadeira | Estimada só com os que voltaram |
|---|---:|---:|
| Motores | 65% | 66,3% |
| Cabine | 70% | 70,2% |
| Fuselagem | 3% | 1,7% |
| Asas | 4% | 3,1% |
| Cauda | 10% | 14,6% |

As regiões que importam saem perto do valor certo. As de letalidade baixa
erram mais, e por um motivo meio contraintuitivo: letalidade baixa é estimada
como "o pouquinho que falta" de uma contagem grande, então uma flutuação
pequena vira um erro relativo enorme (na versão em Julia, a fuselagem sai com
0,03%, contra 3% verdadeiros). Com mais missões, melhora.

## Fundos que batem o mercado (e o meu erro)

Troque aviões por fundos de investimento. Fundo que vai mal perde cotista,
encolhe e um dia é fechado ou engolido por outro. Quem abre hoje uma base de
fundos e calcula o desempenho médio dos últimos quinze anos está no hangar,
contando furos dos que voltaram.

Para medir o tamanho disso, simulei 500 fundos **sem talento nenhum**. O
retorno de cada um acima do mercado, a cada ano, sai de uma normal com média
zero e desvio padrão de 6 pontos percentuais. Nenhum gestor é melhor que
outro; é tudo sorte. E, a cada ano, fecham os 8% (arredondado) com pior
retorno acumulado entre os que ainda estão abertos.

Quinze anos depois, sobram 143. A média anual deles fica **1,74 ponto acima
do mercado**. Todos os 143, sem exceção, têm média positiva.

Para mostrar o contraste, calculei a média "de todos, inclusive os que
fecharam". Deu −2,05.

Fiquei olhando para esse número um tempo. Os fundos não têm talento nenhum —
nem bom, nem ruim. A média verdadeira é zero por construção. De onde vinham
esses −2?

Vinham de mim. Eu tinha tirado a média de cada fundo e depois a média das
médias. Só que um fundo que fechou no segundo ano tem na média dele
exatamente os dois anos ruins que o fizeram fechar — e mais nada. A regra de
fechamento escolhe **quando** cada fundo para de ser contado, e parar logo
depois de um tombo puxa a média para baixo. Eu estava "corrigindo" o viés de
sobrevivência com outro viés de seleção.

A conta certa olha cada ano de cada fundo enquanto ele existiu — 4.459
fundo-anos — e dá **−0,03 ponto**. Praticamente zero, como deveria: o retorno
de cada ano é sorteado antes de se saber se o fundo vai fechar no fim dele,
então nenhum ano é escolhido por ter sido ruim.

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
    <pre><code>using Random, Statistics, Plots

# 500 fundos SEM talento: retorno anual acima do mercado ~ Normal(0, 6) pontos percentuais.
# A cada ano, fecham os 8% (arredondado) com pior retorno acumulado entre os que estão abertos.
n_fundos, anos, σ, taxa = 500, 15, 6.0, 0.08
rng = Xoshiro(2026)
retorno = σ .* randn(rng, n_fundos, anos)   # retorno[i, t]
ultimo_ano = fill(anos, n_fundos)          # último ano em que o fundo existiu
aberto = trues(n_fundos)
for t in 1:anos
    vivos = findall(aberto)
    acumulado = [sum(retorno[i, 1:t]) for i in vivos]
    fecham = vivos[sortperm(acumulado)[1:round(Int, taxa * length(vivos))]]
    aberto[fecham] .= false
    ultimo_ano[fecham] .= t
end

sobreviventes = findall(aberto)
media_fundo = [mean(retorno[i, 1:ultimo_ano[i]]) for i in 1:n_fundos]
fundo_anos = vcat([retorno[i, 1:ultimo_ano[i]] for i in 1:n_fundos]...)

println("Sobreviventes: ", length(sobreviventes), " de ", n_fundos)
println("Média anual dos sobreviventes: ", round(mean(media_fundo[sobreviventes]), digits = 2), " ponto(s)")
println("Sobreviventes com média positiva: ", count(&gt;(0), media_fundo[sobreviventes]))
println("Média das médias de todos os fundos: ", round(mean(media_fundo), digits = 2), " ponto(s)")
println("Todos os fundo-anos (", length(fundo_anos), "): ", round(mean(fundo_anos), digits = 2), " ponto(s)")

# Figura: trajetórias do retorno acumulado e as três médias
p1 = plot(legend = false, xlabel = "Ano", ylabel = "Retorno acumulado acima do mercado (pontos)",
          title = "500 fundos sem talento")
for i in sortperm(aberto)   # fechados primeiro, sobreviventes por cima
    caminho = cumsum(retorno[i, 1:ultimo_ano[i]])
    cor = aberto[i] ? :royalblue : :gray70
    plot!(p1, 1:ultimo_ano[i], caminho, color = cor, alpha = aberto[i] ? 0.6 : 0.3, lw = 0.7)
end
medias = [mean(media_fundo[sobreviventes]), mean(media_fundo), mean(fundo_anos)]
p2 = bar(["Só\nsobreviventes", "Média das\nmédias", "Todos os\nfundo-anos"], medias,
         color = [:royalblue, :darkorange, :gray50], legend = false,
         ylabel = "Retorno médio anual acima do mercado (pontos)", title = "O que cada conta mostra")
hline!(p2, [0], color = :black)
savefig(plot(p1, p2, layout = (1, 2), size = (1000, 460), left_margin = 5Plots.mm), "sobrevivencia_fundos_jl.png")</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">Sobreviventes: 143 de 500
Média anual dos sobreviventes: 1.7 ponto(s)
Sobreviventes com média positiva: 143
Média das médias de todos os fundos: -1.91 ponto(s)
Todos os fundo-anos (4459): 0.0 ponto(s)</pre>
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
    <pre><code># 500 fundos SEM talento: retorno anual acima do mercado ~ Normal(0, 6) pontos percentuais.
# A cada ano, fecham os 8% (arredondado) com pior retorno acumulado entre os que estão abertos.
n_fundos &lt;- 500; anos &lt;- 15; sigma &lt;- 6; taxa &lt;- 0.08
set.seed(2026)
retorno &lt;- matrix(rnorm(n_fundos * anos, 0, sigma), nrow = n_fundos)   # retorno[i, t]
ultimo_ano &lt;- rep(anos, n_fundos)        # último ano em que o fundo existiu
aberto &lt;- rep(TRUE, n_fundos)
for (t in 1:anos) {
  vivos &lt;- which(aberto)
  acumulado &lt;- rowSums(retorno[vivos, 1:t, drop = FALSE])
  fecham &lt;- vivos[order(acumulado)[seq_len(round(taxa * length(vivos)))]]
  aberto[fecham] &lt;- FALSE
  ultimo_ano[fecham] &lt;- t
}

sobreviventes &lt;- which(aberto)
media_fundo &lt;- sapply(1:n_fundos, function(i) mean(retorno[i, 1:ultimo_ano[i]]))
fundo_anos &lt;- unlist(lapply(1:n_fundos, function(i) retorno[i, 1:ultimo_ano[i]]))

cat("Sobreviventes:", length(sobreviventes), "de", n_fundos, "\n")
cat("Média anual dos sobreviventes:", round(mean(media_fundo[sobreviventes]), 2), "ponto(s)\n")
cat("Sobreviventes com média positiva:", sum(media_fundo[sobreviventes] &gt; 0), "\n")
cat("Média das médias de todos os fundos:", round(mean(media_fundo), 2), "ponto(s)\n")
cat("Todos os fundo-anos (", length(fundo_anos), "): ", round(mean(fundo_anos), 2), " ponto(s)\n", sep = "")

# Figura: trajetórias do retorno acumulado e as três médias
png("sobrevivencia_fundos_r.png", width = 1000, height = 460)
par(mfrow = c(1, 2))
plot(NA, xlim = c(1, anos), ylim = range(apply(retorno, 1, cumsum)), xlab = "Ano",
     ylab = "Retorno acumulado acima do mercado (pontos)", main = "500 fundos sem talento")
for (i in order(aberto)) {   # fechados primeiro, sobreviventes por cima
  lines(1:ultimo_ano[i], cumsum(retorno[i, 1:ultimo_ano[i]]),
        col = if (aberto[i]) adjustcolor("royalblue", 0.6) else adjustcolor("gray60", 0.3))
}
medias &lt;- c(mean(media_fundo[sobreviventes]), mean(media_fundo), mean(fundo_anos))
barplot(medias, names.arg = c("Só\nsobreviventes", "Média das\nmédias", "Todos os\nfundo-anos"),
        col = c("royalblue", "darkorange", "gray50"),
        ylab = "Retorno médio anual acima do mercado (pontos)", main = "O que cada conta mostra")
abline(h = 0)
invisible(dev.off())</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">Sobreviventes: 143 de 500 
Média anual dos sobreviventes: 1.45 ponto(s)
Sobreviventes com média positiva: 143 
Média das médias de todos os fundos: -1.94 ponto(s)
Todos os fundo-anos (4459): -0.12 ponto(s)</pre>
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

# 500 fundos SEM talento: retorno anual acima do mercado ~ Normal(0, 6) pontos percentuais.
# A cada ano, fecham os 8% (arredondado) com pior retorno acumulado entre os que estão abertos.
n_fundos, anos, sigma, taxa = 500, 15, 6.0, 0.08
rng = np.random.default_rng(2026)
retorno = rng.normal(0, sigma, size=(n_fundos, anos))   # retorno[i, t]
ultimo_ano = np.full(n_fundos, anos)                    # último ano em que o fundo existiu
aberto = np.ones(n_fundos, dtype=bool)
for t in range(1, anos + 1):
    vivos = np.flatnonzero(aberto)
    acumulado = retorno[vivos, :t].sum(axis=1)
    fecham = vivos[np.argsort(acumulado, kind="stable")[:round(taxa * len(vivos))]]
    aberto[fecham] = False
    ultimo_ano[fecham] = t

sobreviventes = np.flatnonzero(aberto)
media_fundo = np.array([retorno[i, :ultimo_ano[i]].mean() for i in range(n_fundos)])
fundo_anos = np.concatenate([retorno[i, :ultimo_ano[i]] for i in range(n_fundos)])

print(f"Sobreviventes: {len(sobreviventes)} de {n_fundos}")
print(f"Média anual dos sobreviventes: {media_fundo[sobreviventes].mean():.2f} ponto(s)")
print(f"Sobreviventes com média positiva: {(media_fundo[sobreviventes] &gt; 0).sum()}")
print(f"Média das médias de todos os fundos: {media_fundo.mean():.2f} ponto(s)")
print(f"Todos os fundo-anos ({len(fundo_anos)}): {fundo_anos.mean():.2f} ponto(s)")

# Figura: trajetórias do retorno acumulado e as três médias
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4.6))
for i in np.argsort(aberto, kind="stable"):   # fechados primeiro, sobreviventes por cima
    caminho = np.cumsum(retorno[i, :ultimo_ano[i]])
    if aberto[i]:
        ax1.plot(range(1, ultimo_ano[i] + 1), caminho, color="royalblue", alpha=0.6, lw=0.7)
    else:
        ax1.plot(range(1, ultimo_ano[i] + 1), caminho, color="0.6", alpha=0.3, lw=0.7)
        ax1.plot(ultimo_ano[i], caminho[-1], ".", color="0.5", ms=2)
ax1.set_xlabel("Ano"); ax1.set_ylabel("Retorno acumulado acima do mercado (pontos)")
ax1.set_title("500 fundos sem talento")
medias = [media_fundo[sobreviventes].mean(), media_fundo.mean(), fundo_anos.mean()]
ax2.bar(["Só\nsobreviventes", "Média das\nmédias", "Todos os\nfundo-anos"], medias,
        color=["royalblue", "darkorange", "0.5"])
ax2.axhline(0, color="black", lw=0.8)
ax2.set_ylabel("Retorno médio anual acima do mercado (pontos)"); ax2.set_title("O que cada conta mostra")
fig.tight_layout(); fig.savefig("sobrevivencia_fundos.png", dpi=100)</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">Sobreviventes: 143 de 500
Média anual dos sobreviventes: 1.74 ponto(s)
Sobreviventes com média positiva: 143
Média das médias de todos os fundos: -2.05 ponto(s)
Todos os fundo-anos (4459): -0.03 ponto(s)</pre>
</div>
  </div>
</div>

O número de sobreviventes (143) e de fundo-anos (4.459) é o mesmo nas três
linguagens, porque só depende da regra de fechamento. As médias mudam com o
sorteio: em Julia, 1,70, −1,91 e 0,00; em R, 1,45, −1,94 e −0,12. A história
é a mesma.

<figure>
  <a href="/assets/images/sobrevivencia-fundos.png" title="Abrir em tamanho original">
  <img src="/assets/images/sobrevivencia-fundos.avif" alt="À esquerda, 500 trajetórias de retorno acumulado acima do mercado ao longo de 15 anos: as linhas cinzentas terminam num ponto quando o fundo fecha, quase sempre abaixo das azuis, e as azuis, dos 143 sobreviventes, terminam acima de zero. À direita, três barras: os sobreviventes rendem em média 1,74 ponto ao ano acima do mercado; a média das médias de todos os fundos dá −2,05; todos os anos de todos os fundos, −0,03" />
  </a>
  <figcaption>
    <strong>Figura 2:</strong> à esquerda, os 500 fundos; os cinzentos fecham no ponto em que terminam, os azuis chegam aos 15 anos. À direita, o retorno médio que a base de dados mostra (só os sobreviventes), a minha correção errada (média das médias) e o valor certo (todos os anos de todos os fundos). Gerada pelo código em Python acima. Clique na imagem para vê-la em tamanho original.
  </figcaption>
</figure>

Em finanças, o problema tem nome e literatura própria; dois artigos sobre
ele são os de Brown, Goetzmann, Ibbotson e Ross (1992) e de Elton, Gruber e
Blake (1996), nas referências. O meu tropeço com a média das médias mostra
que não basta incluir os mortos: é preciso incluí-los do jeito certo.

## Outros hangares

**Os gênios que largaram a faculdade.** Os casos famosos de quem largou a
faculdade e ficou bilionário viraram exemplo porque deram certo; quem largou e
não deu certo não é chamado para palestrar. A comparação que interessa é entre
todos que largaram e todos que concluíram — e essa comparação não aparece nas
palestras.

**"Antigamente se construía melhor."** Os prédios antigos que ainda estão de
pé são os que foram bem construídos. Os ruins já caíram ou viraram
estacionamento. Vale igual para "a música de antigamente era melhor": a gente
ouve o que sobreviveu a décadas de peneira, não a média do que tocava no
rádio em 1978.

**Os estudos que chegam à revista.** Se só os resultados significativos são
publicados, a literatura científica vira um hangar: os efeitos parecem maiores
e mais consistentes do que são, porque os estudos que não acharam nada ficaram
na gaveta.

## Como não cair nessa

O viés de sobrevivência é um tipo de [viés](/pt/glossario#vies) de seleção, e
tem a propriedade mais irritante de todas: aumentar a amostra não ajuda. Mil
aviões a mais no hangar dão a mesma resposta errada, só que com mais
confiança.

O que ajuda é mudar a pergunta:

- **Quem não chegou aqui?** Antes de qualquer média, pergunte que processo
  decidiu quem entra nos dados, e se esse processo depende justamente do que
  você quer medir.
- **Qual é o denominador?** Quantos aviões saíram, quantos fundos foram
  abertos, quantas pessoas largaram a faculdade. Sem a população de partida,
  não dá para saber o que se perdeu no caminho.
- **Dá para modelar a perda?** Foi o que a fórmula acima fez. Em ensaios
  clínicos, a análise por intenção de tratar mantém no grupo quem abandonou o
  tratamento. Na análise de sobrevivência, métodos como o de
  [Kaplan-Meier](/pt/glossario#kaplan-meier) existem para aproveitar a
  informação de quem saiu do estudo antes do fim — como no
  [post sobre as orcas](/orcas-residentes-do-sul-demografia-julia-kaplan-meier/).
- **E a minha correção, tem viés também?** Essa eu aprendi com os fundos.

---

A parte da história de Wald de que eu mais gosto não é a esperteza da
resposta. É que ela troca a pergunta. A pergunta ingênua é onde os aviões são
atingidos. A pergunta útil é onde um avião pode ser atingido e ainda voltar.

A distância entre as duas é uma probabilidade condicional. E quase todo erro
de sobrevivência — inclusive o meu, com os fundos — é alguém lendo
$P(A \mid \text{sobreviveu})$ como se fosse $P(A)$.

## Referências

- Wald, A. (1980). *A Reprint of "A Method of Estimating Plane Vulnerability
  Based on Damage of Survivors"*. Center for Naval Analyses, CRC 432.
- Mangel, M.; Samaniego, F. J. (1984). Abraham Wald's Work on Aircraft
  Survivability. *Journal of the American Statistical Association*, 79(386),
  259–267. DOI: [10.1080/01621459.1984.10478038](https://doi.org/10.1080/01621459.1984.10478038).
- Wallis, W. A. (1980). The Statistical Research Group, 1942–1945. *Journal of
  the American Statistical Association*, 75(370), 320–330. DOI:
  [10.1080/01621459.1980.10477469](https://doi.org/10.1080/01621459.1980.10477469).
- Brown, S. J.; Goetzmann, W.; Ibbotson, R. G.; Ross, S. A. (1992).
  Survivorship Bias in Performance Studies. *The Review of Financial Studies*,
  5(4), 553–580. DOI: [10.1093/rfs/5.4.553](https://doi.org/10.1093/rfs/5.4.553).
- Elton, E. J.; Gruber, M. J.; Blake, C. R. (1996). Survivor Bias and Mutual
  Fund Performance. *The Review of Financial Studies*, 9(4), 1097–1120. DOI:
  [10.1093/rfs/9.4.1097](https://doi.org/10.1093/rfs/9.4.1097).
- Abraham Wald. *MacTutor History of Mathematics Archive*, Universidade de
  St Andrews.
  [mathshistory.st-andrews.ac.uk/Biographies/Wald](https://mathshistory.st-andrews.ac.uk/Biographies/Wald/).

[^grupo]: As datas de nascimento e de chegada aos Estados Unidos e o trabalho no grupo de Columbia estão na biografia do MacTutor (nas referências). A história do grupo é contada no artigo de W. Allen Wallis (1980).

[^desenho]: Ele circula na internet como se fosse um diagrama de época. Não é: a versão mais conhecida está no Wikimedia Commons, em [Survivorship-bias.png](https://commons.wikimedia.org/wiki/File:Survivorship-bias.png) (2016) e [Survivorship-bias.svg](https://commons.wikimedia.org/wiki/File:Survivorship-bias.svg) (2021), e a própria página do arquivo diz que é só vagamente baseada num relatório de Wald, que não tinha ilustração. A Figura 1 deste post também é moderna, só que tem a vantagem de vir de uma simulação que dá para conferir.

[^formula]: Para o que Wald de fato fez, o caminho é o artigo de Mangel e Samaniego (1984). A minha versão com a Poisson é a mais curta que eu consegui escrever e que ainda funciona, o que não é a mesma coisa que ser a dele.
