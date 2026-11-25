# Figuras de pt/inferencia-estatistica/intervalos-confianca e da versão em inglês.
#
#     julia scripts/figuras-intervalos-confianca.jl
#
# Gera em assets/images/:
#   intervalo_confianca_resistencia_tinta.png e ci_paint_en.png (exemplo da tinta);
#   cobertura_intervalos.png e ci_coverage_en.png (50 intervalos simulados).

using Plots, Distributions, Statistics, Random

const SAIDA = joinpath(@__DIR__, "..", "assets", "images")
const AZUL = colorant"#2540d8"
const VERMELHO = colorant"#c62828"
const CINZA = colorant"#8b91a0"

gr()
default(fontfamily = "sans-serif", framestyle = :axes, grid = :y, gridalpha = 0.15,
        legend = false, titlefontsize = 12, guidefontsize = 10, tickfontsize = 9,
        dpi = 200, left_margin = 4Plots.mm, bottom_margin = 4Plots.mm)

salva(p, nome) = (savefig(p, joinpath(SAIDA, nome)); println("ok  ", nome))
num(x, lang) = lang == :pt ? replace(string(x), "." => ",") : string(x)

# Exemplo da tinta: os 12 tempos, a média e o IC de 95% para a MÉDIA.
function tinta(lang)
    dados = [120, 130, 125, 128, 122, 127, 126, 124, 129, 123, 128, 125]
    n = length(dados); x̄ = mean(dados); s = std(dados)
    me = quantile(TDist(n - 1), 0.975) * s / sqrt(n)
    t = lang == :pt ?
        (tit = "Tempos de resistência e IC de 95% para a média", x = "amostra", y = "resistência (horas)",
         m = "média = ", ic = "IC 95% da média: [", arq = "intervalo_confianca_resistencia_tinta.png") :
        (tit = "Resistance times and 95% CI for the mean", x = "sample", y = "resistance (hours)",
         m = "mean = ", ic = "95% CI for the mean: [", arq = "ci_paint_en.png")
    sep = lang == :pt ? "; " : ", "
    p = plot(size = (760, 430), xlabel = t.x, ylabel = t.y, title = t.tit, ylims = (118, 132), xlims = (0, 13))
    plot!(p, [0, 13], [x̄ - me, x̄ - me]; fillrange = x̄ + me, color = AZUL, fillalpha = 0.15, linewidth = 0)
    hline!(p, [x̄]; color = AZUL, linewidth = 2)
    scatter!(p, 1:n, dados; color = :black, markersize = 5)
    annotate!(p, [(2.6, 131.3, text(t.ic * num(round(x̄ - me; digits = 2), lang) * sep *
                                            num(round(x̄ + me; digits = 2), lang) * "]", 9, :left, AZUL)),
                  (12.8, 119, text(t.m * num(round(x̄; digits = 2), lang), 9, :right, AZUL))])
    salva(p, t.arq)
end

# Cobertura: 50 amostras de tamanho 12 de uma N(125, 3²); cada uma dá um IC t de 95%.
function cobertura(lang)
    Random.seed!(123)
    μ, σ, n, k = 125, 3, 12, 50
    tc = quantile(TDist(n - 1), 0.975)
    ics = map(1:k) do _
        a = rand(Normal(μ, σ), n); x̄ = mean(a); me = tc * std(a) / sqrt(n)
        (x̄ - me, x̄ + me)
    end
    acerta = [lo <= μ <= hi for (lo, hi) in ics]
    t = lang == :pt ?
        (tit = "50 intervalos de 95%: $(count(acerta)) contêm μ = 125", x = "amostra", y = "intervalo",
         arq = "cobertura_intervalos.png") :
        (tit = "50 intervals at 95%: $(count(acerta)) contain μ = 125", x = "sample", y = "interval",
         arq = "ci_coverage_en.png")
    p = plot(size = (760, 430), xlabel = t.x, ylabel = t.y, title = t.tit)
    for (i, (lo, hi)) in enumerate(ics)
        plot!(p, [i, i], [lo, hi]; color = acerta[i] ? AZUL : VERMELHO, linewidth = acerta[i] ? 1.5 : 3)
    end
    hline!(p, [μ]; color = :black, linestyle = :dash)
    salva(p, t.arq)
    return count(acerta)
end

tinta(:pt); tinta(:en)
println("cobrem: ", cobertura(:pt)); cobertura(:en)
