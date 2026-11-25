# Figuras de pt/inferencia-estatistica/testes-hipotese e da versão em inglês.
#
#     julia scripts/figuras-testes-hipotese.jl
#
# Gera em assets/images/: erro_tipo_I_II.png e type_I_II_errors_en.png (erros
# tipo I e II), p_value_en.png e t_test_mean_en.png (versões em inglês de
# valor-p.png e teste-media.png, que saem de scripts/gera-figuras-pendentes.jl).

using Plots, Distributions

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
num(x, lang) = lang == :pt ? replace(string(x), "." => ",") : string(x)

# Erros tipo I e II: teste Z unilateral à direita, α = 0,05; sob H₁ a estatística
# tem média 1,5 (o mesmo exemplo do código mostrado na página).
function erros(lang)
    t = lang == :pt ?
        (titulo = "Erros tipo I e II num teste unilateral (α = 0,05)", x = "estatística de teste",
         y = "densidade", a = "erro tipo I (α = 0,05)", b = "erro tipo II (β = ", c = "valor crítico = ",
         arq = "erro_tipo_I_II.png") :
        (titulo = "Type I and II errors in a one-sided test (α = 0.05)", x = "test statistic",
         y = "density", a = "Type I error (α = 0.05)", b = "Type II error (β = ", c = "critical value = ",
         arq = "type_I_II_errors_en.png")
    H0, H1 = Normal(0, 1), Normal(1.5, 1)
    zc = quantile(H0, 0.95)
    β = cdf(H1, zc)
    x = range(-3.5, 5, length = 500)
    p = plot(x, pdf.(H0, x); color = AZUL, linewidth = 2, ylims = (0, 0.5), size = (760, 430),
             xlabel = t.x, ylabel = t.y, title = t.titulo)
    plot!(p, x, pdf.(H1, x); color = VERMELHO, linewidth = 2)
    xa = x[x .>= zc]; plot!(p, xa, pdf.(H0, xa); fillrange = 0, color = AZUL, fillalpha = 0.35, linewidth = 0)
    xb = x[x .<= zc]; plot!(p, xb, pdf.(H1, xb); fillrange = 0, color = VERMELHO, fillalpha = 0.25, linewidth = 0)
    vline!(p, [zc]; color = :black, linestyle = :dash)
    annotate!(p, [(0, 0.43, text("H₀: N(0, 1)", 10, AZUL)), (2.45, 0.43, text("H₁: N(1" * (lang == :pt ? "," : ".") * "5, 1)", 10, VERMELHO)),
                  (zc + 0.15, 0.47, text(t.c * num(round(zc; digits = 4), lang), 9, :left)),
                  (2.4, 0.30, text(t.a, 9, :left, AZUL)),
                  (-1.3, 0.30, text(t.b * num(round(β; digits = 4), lang) * ")", 9, :right, VERMELHO))])
    salva(p, t.arq)
end

# Versões em inglês das duas figuras da página.
function valor_p_en()
    zobs = 2.1; x = range(-4, 4, length = 400); pv = 2 * ccdf(Normal(), zobs)
    p = plot(x, pdf.(Normal(), x); color = :black, linewidth = 2, ylims = (0, 0.45), size = (700, 420),
             xlabel = "test statistic under H₀", ylabel = "density",
             title = "Two-sided p-value: P(|Z| ≥ $zobs) = $(round(pv; digits = 3))")
    for lado in (x[x .>= zobs], x[x .<= -zobs])
        plot!(p, lado, pdf.(Normal(), lado); fillrange = 0, color = LARANJA, fillalpha = 0.6, linewidth = 0)
    end
    vline!(p, [zobs]; color = LARANJA, linestyle = :dash)
    annotate!(p, [(zobs + 0.05, 0.12, text("observed z = $zobs", 9, :left, LARANJA)),
                  (2.9, 0.035, text("p/2", 9, LARANJA)), (-2.9, 0.035, text("p/2", 9, LARANJA))])
    salva(p, "p_value_en.png")
end

function teste_media_en()
    d = TDist(35); tc = quantile(d, 0.975); tobs = 3.0; x = range(-4.5, 4.5, length = 400)
    p = plot(x, pdf.(d, x); color = :black, linewidth = 2, ylims = (0, 0.45), size = (700, 420),
             xlabel = "t", ylabel = "density", title = "t distribution with 35 d.f. under H₀: μ = 10")
    for lado in (x[x .>= tc], x[x .<= -tc])
        plot!(p, lado, pdf.(d, lado); fillrange = 0, color = VERMELHO, fillalpha = 0.45, linewidth = 0)
    end
    vline!(p, [tobs]; color = AZUL, linewidth = 2)
    annotate!(p, [(tobs - 0.08, 0.3, text("observed t = 3.00", 9, :right, AZUL)),
                  (3.75, 0.06, text("reject H₀", 9, VERMELHO)), (-3.3, 0.06, text("reject H₀", 9, VERMELHO)),
                  (0, 0.2, text("do not reject H₀", 9, CINZA)),
                  (tc, 0.43, text("±$(round(tc; digits = 4))", 8, VERMELHO))])
    vline!(p, [-tc, tc]; color = VERMELHO, linestyle = :dot)
    salva(p, "t_test_mean_en.png")
end

erros(:pt); erros(:en); valor_p_en(); teste_media_en()
