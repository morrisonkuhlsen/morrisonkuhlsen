# Gera as figuras que as páginas citavam mas que nunca tinham sido feitas.
#
#     julia scripts/gera-figuras-pendentes.jl
#
# Cada figura sai dos números do próprio texto da página. Onde a página só dá
# o começo de uma tabela ("A, B, C, ..."), as primeiras linhas são as dela e o
# resto é completado com semente fixa, para a figura não mudar a cada rodada.
# Escreve em assets/images/; a do desvio padrão sai em .avif, como as vizinhas
# (precisa do avifenc).
using Plots, Distributions, Random, Statistics

const SAIDA = joinpath(@__DIR__, "..", "assets", "images")
const AZUL = colorant"#2540d8"
const LARANJA = colorant"#d9631e"
const CINZA = colorant"#8b91a0"
const VERMELHO = colorant"#c62828"

gr()
default(fontfamily = "sans-serif", framestyle = :axes, grid = :y, gridalpha = 0.15,
        legend = false, titlefontsize = 12, guidefontsize = 10, tickfontsize = 9,
        dpi = 200, size = (800, 450), left_margin = 4Plots.mm, bottom_margin = 4Plots.mm)

salva(p, nome) = (savefig(p, joinpath(SAIDA, nome)); println("ok  ", nome))
# Número com vírgula decimal, para os textos das figuras.
br(x) = replace(string(x), "." => ",")

# ─── pt/estatistica-descritiva/graficos ─────────────────────────────────────

# Pizza: sistemas operacionais móveis em 2023.
let partes = [70, 28, 2], nomes = ["Android", "iOS", "Outros"]
    p = pie(nomes .* " (" .* string.(partes) .* "%)", partes;
            color = [AZUL, LARANJA, CINZA], linecolor = :white, linewidth = 2,
            legend = :outerright, legendfontsize = 10, framestyle = :none, grid = false,
            title = "Participação de mercado dos sistemas móveis (2023)", size = (700, 450))
    salva(p, "grafico_pizza.png")
end

# Histograma: notas de 100 alunos, já agrupadas em classes de 2 pontos.
let bordas = 0:2:10, freq = [5, 15, 30, 35, 15]
    p = bar(1:2:9, freq; bar_width = 2, color = AZUL, linecolor = :white, linewidth = 1.5,
            xticks = bordas, xlims = (0, 10), ylims = (0, 40),
            xlabel = "Nota", ylabel = "Frequência (alunos)", title = "Distribuição das notas de 100 alunos")
    annotate!(p, [(x, f + 1.6, text(string(f), 9, :center)) for (x, f) in zip(1:2:9, freq)])
    salva(p, "histograma.png")
end

# Boxplot: idades de participantes, desenhado direto dos cinco números e dos
# outliers do texto (Q1 = 22, Q3 = 30, cercas em 10 e 42).
let q1 = 22, med = 25, q3 = 30, lo = 18, hi = 41, outl = [45, 50]
    p = plot(; xlims = (10, 55), ylims = (0, 2), yticks = false, grid = :x,
             xlabel = "Idade (anos)", title = "Idades dos participantes do evento", size = (800, 320))
    plot!(p, Shape([q1, q3, q3, q1], [0.6, 0.6, 1.4, 1.4]); color = AZUL, fillalpha = 0.25, linecolor = AZUL, linewidth = 2)
    plot!(p, [med, med], [0.6, 1.4]; color = AZUL, linewidth = 3)
    plot!(p, [lo, q1], [1, 1]; color = AZUL, linewidth = 2)
    plot!(p, [q3, hi], [1, 1]; color = AZUL, linewidth = 2)
    plot!(p, [lo, lo], [0.8, 1.2]; color = AZUL, linewidth = 2)
    plot!(p, [hi, hi], [0.8, 1.2]; color = AZUL, linewidth = 2)
    scatter!(p, outl, fill(1, length(outl)); color = LARANJA, markersize = 7, markerstrokewidth = 0)
    for (x, t) in [(lo, "mín\n$lo"), (q1, "Q1\n$q1"), (med, "mediana\n$med"), (q3, "Q3\n$q3"), (hi, "máx\n$hi")]
        annotate!(p, x, 0.3, text(t, 8, :center, CINZA))
    end
    annotate!(p, 47.5, 1.45, text("outliers", 8, :center, LARANJA))
    salva(p, "boxplot.png")
end

# Dispersão: horas de estudo × nota. A, B e C são os da tabela da página.
let rng = MersenneTwister(2025)
    horas = vcat([2, 5, 8], round.(rand(rng, Uniform(0.5, 10), 27); digits = 1))
    nota = vcat([4.5, 6.8, 7.2], clamp.(round.(3.2 .+ 0.55 .* horas[4:end] .+ randn(rng, 27) .* 0.8; digits = 1), 0, 10))
    b = cov(horas, nota) / var(horas); a = mean(nota) - b * mean(horas)
    p = scatter(horas, nota; color = AZUL, markersize = 6, markerstrokewidth = 0, alpha = 0.8,
                xlabel = "Horas de estudo", ylabel = "Nota na prova", xlims = (0, 10.5), ylims = (0, 10), xticks = 0:2:10,
                title = "Horas de estudo × nota (r = $(br(round(cor(horas, nota); digits = 2))))")
    plot!(p, [0, 10.5], a .+ b .* [0, 10.5]; color = LARANJA, linewidth = 2, linestyle = :dash)
    salva(p, "scatter_plot.png")
end

# Linha temporal: vendas mensais. Jan, Fev, Mar e Dez são os da página; os
# meses do meio seguem a mesma tendência, com um pico no meio do ano.
let meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
    vendas = [12_500, 14_200, 15_800, 16_900, 18_400, 21_000, 20_300, 21_600, 22_900, 24_200, 26_100, 28_300]
    p = plot(1:12, vendas ./ 1000; color = AZUL, linewidth = 2.5, marker = :circle, markersize = 5,
             markerstrokewidth = 0, xticks = (1:12, meses), ylims = (0, 30),
             xlabel = "Mês", ylabel = "Vendas (R\$ mil)", title = "Vendas mensais ao longo do ano")
    salva(p, "linha_temporal.png")
end

# ─── pt/probabilidade/eventos-espaco-amostral ───────────────────────────────

# O código que a página mostra, com semente fixa.
let
    Random.seed!(42)
    lancamentos = rand(1:6, 1000)
    p1 = histogram(lancamentos, bins = 0.5:1:6.5, title = "Espaço Amostral Discreto\n(Lançamento de Dado)",
                   xlabel = "Resultado", ylabel = "Frequência", label = "", color = :royalblue, alpha = 0.7)
    temperaturas = rand(Normal(25, 5), 1000)
    p2 = histogram(temperaturas, bins = 30, title = "Espaço Amostral Contínuo\n(Temperatura Diária)",
                   xlabel = "Temperatura (°C)", ylabel = "Frequência", label = "", color = :darkorange, alpha = 0.7)
    salva(plot(p1, p2, layout = (1, 2), size = (1000, 400), margin = 10Plots.mm), "espaco_amostral.png")
end

# União, interseção e complemento. A página mostra este mesmo código.
let
    circulo(h, k, r) = (θ = range(0, 2π, length = 100); Shape(h .+ r .* cos.(θ), k .+ r .* sin.(θ)))
    # A ∩ B: o arco de A que fica dentro de B, seguido do arco de B dentro de A.
    θa = range(-π / 3, π / 3, length = 50); θb = range(2π / 3, 4π / 3, length = 50)
    lente = Shape(vcat(cos.(θa), 1 .+ cos.(θb)), vcat(sin.(θa), sin.(θb)))
    omega = Shape([-1.5, 2.5, 2.5, -1.5], [-1.5, -1.5, 1.5, 1.5])
    eixos = (xlims = (-1.5, 2.5), ylims = (-1.5, 1.5), aspect_ratio = :equal, framestyle = :box,
             ticks = false, grid = false, legend = false)

    p1 = plot(omega; color = :white, linecolor = :gray, title = "União (A ∪ B)", eixos...)
    plot!(p1, circulo(0, 0, 1); color = :royalblue, alpha = 0.5, linecolor = :black)
    plot!(p1, circulo(1, 0, 1); color = :royalblue, alpha = 0.5, linecolor = :black)

    p2 = plot(omega; color = :white, linecolor = :gray, title = "Interseção (A ∩ B)", eixos...)
    plot!(p2, lente; color = :royalblue, alpha = 0.7, linewidth = 0)
    plot!(p2, circulo(0, 0, 1); fillalpha = 0, linecolor = :black)
    plot!(p2, circulo(1, 0, 1); fillalpha = 0, linecolor = :black)

    p3 = plot(omega; color = :royalblue, alpha = 0.5, linecolor = :gray, title = "Complemento (A′)", eixos...)
    plot!(p3, circulo(0, 0, 1); color = :white, linecolor = :black)

    for p in (p1, p2)
        annotate!(p, [(-0.4, 0, text("A", 12)), (1.4, 0, text("B", 12))])
    end
    for p in (p1, p2, p3)
        annotate!(p, -1.2, 1.2, text("Ω", 11))
    end
    annotate!(p3, 0, 0, text("A", 12))
    salva(plot(p1, p2, p3, layout = (1, 3), size = (900, 320)), "operacoes_eventos.png")
end

# ─── pt/inferencia-estatistica/testes-hipotese ──────────────────────────────

# Valor-p bilateral: área além de |z_obs| nas duas caudas da normal padrão.
let zobs = 2.1, x = range(-4, 4, length = 400)
    pv = 2 * ccdf(Normal(), zobs)
    p = plot(x, pdf.(Normal(), x); color = :black, linewidth = 2, ylims = (0, 0.45), size = (700, 420),
             xlabel = "estatística de teste sob H₀", ylabel = "densidade",
             title = "Valor-p bilateral: P(|Z| ≥ $(br(zobs))) = $(br(round(pv; digits = 3)))")
    for lado in (x[x .>= zobs], x[x .<= -zobs])
        plot!(p, lado, pdf.(Normal(), lado); fillrange = 0, color = LARANJA, fillalpha = 0.6, linewidth = 0)
    end
    vline!(p, [zobs]; color = LARANJA, linestyle = :dash)
    annotate!(p, [(zobs + 0.05, 0.12, text("z observado = $(br(zobs))", 9, :left, LARANJA)),
                  (2.9, 0.035, text("p/2", 9, LARANJA)), (-2.9, 0.035, text("p/2", 9, LARANJA))])
    salva(p, "valor-p.png")
end

# Exercício 5.1: t₃₅ com as regiões críticas de α = 5% e o t observado.
let gl = 35, tc = quantile(TDist(35), 0.975), tobs = 3.0, x = range(-4.5, 4.5, length = 400)
    d = TDist(gl)
    p = plot(x, pdf.(d, x); color = :black, linewidth = 2, ylims = (0, 0.45), size = (700, 420),
             xlabel = "t", ylabel = "densidade", title = "Distribuição t com 35 g.l. sob H₀: μ = 10")
    for lado in (x[x .>= tc], x[x .<= -tc])
        plot!(p, lado, pdf.(d, lado); fillrange = 0, color = VERMELHO, fillalpha = 0.45, linewidth = 0)
    end
    vline!(p, [tobs]; color = AZUL, linewidth = 2)
    annotate!(p, [(tobs - 0.08, 0.3, text("t observado = 3,00", 9, :right, AZUL)),
                  (3.75, 0.06, text("rejeita H₀", 9, VERMELHO)), (-3.3, 0.06, text("rejeita H₀", 9, VERMELHO)),
                  (0, 0.2, text("não rejeita H₀", 9, CINZA)),
                  (tc, 0.43, text("±$(br(round(tc; digits = 4)))", 8, VERMELHO))])
    vline!(p, [-tc, tc]; color = VERMELHO, linestyle = :dot)
    salva(p, "teste-media.png")
end

# ─── pt/analise-de-dados/modelos-preditivos ─────────────────────────────────

# Ilustração: histórico, modelo ajustado e previsão com faixa de incerteza.
let rng = MersenneTwister(7), t = 1:36, tf = 37:48
    y = 50 .+ 1.2 .* t .+ 6 .* sin.(2π .* t ./ 12) .+ randn(rng, 36) .* 2.5
    X = hcat(ones(36), t, sin.(2π .* t ./ 12)); β = X \ y
    s = std(y .- X * β)
    Xf = hcat(ones(12), tf, sin.(2π .* tf ./ 12)); yf = Xf * β
    larg = 1.96 .* s .* sqrt.(1 .+ (tf .- 36) ./ 12)
    p = scatter(t, y; color = CINZA, markersize = 4, markerstrokewidth = 0, size = (800, 400),
                xlabel = "tempo (meses)", ylabel = "valor observado", title = "Do histórico à previsão")
    plot!(p, t, X * β; color = AZUL, linewidth = 2)
    plot!(p, tf, yf; ribbon = larg, color = LARANJA, fillalpha = 0.2, linewidth = 2, linestyle = :dash)
    vline!(p, [36.5]; color = CINZA, linestyle = :dot)
    annotate!(p, [(18, maximum(y) + 6, text("dados históricos + modelo ajustado", 9, AZUL)),
                  (42.5, maximum(yf .+ larg) + 3, text("previsão", 9, LARANJA))])
    salva(p, "predictive.png")
end

# ─── _posts/…-desvio-padrao e …-standard-deviation ──────────────────────────

# Sem palavras na figura: o post em inglês usa a mesma imagem.
# Seis alturas cujos desvios absolutos são os do exercício (18, 8, 15, 8, 9 e
# 6 cm). Os sinais são os únicos que fazem os desvios somarem zero com essas
# distâncias na ordem dada: +18, +8, −15, −8, −9, +6.
let media = 170, desvios = [18, 8, -15, -8, -9, 6]
    alturas = media .+ desvios
    @assert sum(desvios) == 0
    @assert round(sqrt(mean(desvios .^ 2)); digits = 1) == 11.5
    p = bar(1:6, alturas; color = AZUL, fillalpha = 0.3, linecolor = AZUL, bar_width = 0.6,
            ylims = (140, 195), xticks = (1:6, ["P$i" for i in 1:6]), size = (800, 450),
            ylabel = "cm", title = "x̄ = $media cm")
    hline!(p, [media]; color = :black, linewidth = 1.5)
    for (i, d) in enumerate(desvios)
        plot!(p, [i, i], [media, media + d]; color = LARANJA, linewidth = 3)
        annotate!(p, i + 0.33, media + d / 2, text("$(abs(d))", 9, :left, LARANJA))
    end
    png = joinpath(tempdir(), "sd-altura.png")
    savefig(p, png)
    run(`avifenc -q 80 $png $(joinpath(SAIDA, "sd-altura.avif"))`)
    println("ok  sd-altura.avif")
end
