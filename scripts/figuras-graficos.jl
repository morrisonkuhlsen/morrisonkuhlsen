# Gera as figuras da página Gráficos Estatísticos, em português e em inglês:
#
#     julia scripts/figuras-graficos.jl
#
# Páginas: pt/estatistica-descritiva/graficos.md e
# en/descriptive-statistics/charts.md. Cada figura sai dos números do texto da
# página; os dois idiomas usam exatamente os mesmos dados e só mudam os
# rótulos. Os arquivos em português mantêm os nomes antigos; os em inglês
# ganham o sufixo -en. Escreve em assets/images/.
using Plots, Distributions, Random, Statistics

const SAIDA = joinpath(@__DIR__, "..", "assets", "images")
const AZUL = colorant"#2540d8"
const LARANJA = colorant"#d9631e"
const CINZA = colorant"#8b91a0"

gr()
default(fontfamily = "sans-serif", framestyle = :axes, grid = :y, gridalpha = 0.15,
        legend = false, titlefontsize = 12, guidefontsize = 10, tickfontsize = 9,
        dpi = 200, size = (800, 450), left_margin = 4Plots.mm, bottom_margin = 4Plots.mm)

salva(p, nome) = (savefig(p, joinpath(SAIDA, nome)); println("ok  ", nome))

# Número no padrão de cada língua: vírgula decimal em português, ponto em inglês.
num(x, lang) = lang == :pt ? replace(string(x), "." => ",") : string(x)
arquivo(base, lang) = lang == :pt ? "$base.png" : "$base-en.png"

const T = Dict(
    :pt => (
        cursos = ["Engenharia", "Medicina", "Direito", "Administração"],
        barras_x = "Curso", barras_y = "Alunos", barras_t = "Alunos por curso",
        so_outros = "Outros",
        pizza_t = "Sistemas operacionais móveis no mundo (média de 2023)",
        hist_x = "Nota", hist_y = "Frequência (alunos)", hist_t = "Distribuição das notas de 100 alunos",
        box_x = "Idade (anos)", box_t = "Idades dos participantes do evento",
        box_rot = ("fim do bigode", "Q1", "mediana", "Q3", "fim do bigode"), box_out = "outliers",
        disp_x = "Horas de estudo", disp_y = "Nota na prova", disp_t = "Horas de estudo × nota",
        meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
        lin_x = "Mês", lin_y = "Vendas (R\$ mil)", lin_t = "Vendas mensais ao longo do ano",
    ),
    :en => (
        cursos = ["Engineering", "Medicine", "Law", "Business Admin."],
        barras_x = "Program", barras_y = "Students", barras_t = "Students per program",
        so_outros = "Others",
        pizza_t = "Mobile operating systems worldwide (2023 average)",
        hist_x = "Grade", hist_y = "Frequency (students)", hist_t = "Distribution of 100 students' grades",
        box_x = "Age (years)", box_t = "Ages of the event participants",
        box_rot = ("whisker end", "Q1", "median", "Q3", "whisker end"), box_out = "outliers",
        disp_x = "Study hours", disp_y = "Exam grade", disp_t = "Study hours × grade",
        meses = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        lin_x = "Month", lin_y = "Sales (R\$ thousand)", lin_t = "Monthly sales over the year",
    ),
)

# Dados da dispersão: A, B e C são os da tabela da página; os outros 27 pontos
# são ilustrativos, gerados com semente fixa (os mesmos nas duas línguas).
const HORAS, NOTAS = let rng = MersenneTwister(2025)
    h = vcat([2, 5, 8], round.(rand(rng, Uniform(0.5, 10), 27); digits = 1))
    n = vcat([4.5, 6.8, 7.2], clamp.(round.(3.2 .+ 0.55 .* h[4:end] .+ randn(rng, 27) .* 0.8; digits = 1), 0, 10))
    h, n
end

for lang in (:pt, :en)
    t = T[lang]

    # 1. Barras: alunos por curso (dados ilustrativos da página).
    let alunos = [120, 90, 85, 110]
        p = bar(t.cursos, alunos; color = AZUL, linecolor = :white, ylims = (0, 140),
                xlabel = t.barras_x, ylabel = t.barras_y, title = t.barras_t)
        annotate!(p, [(i - 0.5, a + 5, text(string(a), 9, :center)) for (i, a) in enumerate(alunos)])
        salva(p, arquivo("grafico-barras-cursos", lang))
    end

    # 2. Pizza: StatCounter Global Stats, Mobile Operating System Market Share
    # Worldwide, granularidade anual, 2023 (CSV baixado em 23/11/2026):
    # Android 70,37; iOS 29,06; Samsung 0,38; KaiOS 0,13; Windows 0,02;
    # Linux 0,01; Other 0,03. "Outros" = 0,57.
    let partes = [70.37, 29.06, 0.57], nomes = ["Android", "iOS", t.so_outros]
        rot = [nomes[i] * " (" * num(round(partes[i]; digits = 1), lang) * "%)" for i in 1:3]
        p = pie(rot, partes; color = [AZUL, LARANJA, CINZA], linecolor = :white, linewidth = 2,
                legend = :outerright, legendfontsize = 10, framestyle = :none, grid = false,
                title = t.pizza_t, size = (700, 450))
        salva(p, arquivo("grafico_pizza", lang))
    end

    # 3. Histograma: notas de 100 alunos, já agrupadas em classes de 2 pontos.
    let bordas = 0:2:10, freq = [5, 15, 30, 35, 15]
        p = bar(1:2:9, freq; bar_width = 2, color = AZUL, linecolor = :white, linewidth = 1.5,
                xticks = bordas, xlims = (0, 10), ylims = (0, 40),
                xlabel = t.hist_x, ylabel = t.hist_y, title = t.hist_t)
        annotate!(p, [(x, f + 1.6, text(string(f), 9, :center)) for (x, f) in zip(1:2:9, freq)])
        salva(p, arquivo("histograma", lang))
    end

    # 4. Boxplot: desenhado direto dos números do texto (Q1 = 22, mediana = 25,
    # Q3 = 30, bigodes em 18 e 41, outliers 45 e 50; cercas em 10 e 42).
    let q1 = 22, med = 25, q3 = 30, lo = 18, hi = 41, outl = [45, 50]
        p = plot(; xlims = (10, 55), ylims = (0, 2), yticks = false, grid = :x,
                 xlabel = t.box_x, title = t.box_t, size = (800, 320))
        plot!(p, Shape([q1, q3, q3, q1], [0.6, 0.6, 1.4, 1.4]); color = AZUL, fillalpha = 0.25,
              linecolor = AZUL, linewidth = 2)
        plot!(p, [med, med], [0.6, 1.4]; color = AZUL, linewidth = 3)
        plot!(p, [lo, q1], [1, 1]; color = AZUL, linewidth = 2)
        plot!(p, [q3, hi], [1, 1]; color = AZUL, linewidth = 2)
        plot!(p, [lo, lo], [0.8, 1.2]; color = AZUL, linewidth = 2)
        plot!(p, [hi, hi], [0.8, 1.2]; color = AZUL, linewidth = 2)
        scatter!(p, outl, fill(1, length(outl)); color = LARANJA, markersize = 7, markerstrokewidth = 0)
        for (x, r) in zip((lo, q1, med, q3, hi), t.box_rot)
            annotate!(p, x, 0.3, text("$r\n$x", 8, :center, CINZA))
        end
        annotate!(p, 47.5, 1.45, text(t.box_out, 8, :center, LARANJA))
        salva(p, arquivo("boxplot", lang))
    end

    # 5. Dispersão: horas de estudo × nota, com a reta de mínimos quadrados.
    let b = cov(HORAS, NOTAS) / var(HORAS), a = mean(NOTAS) - b * mean(HORAS)
        r = round(cor(HORAS, NOTAS); digits = 2)
        p = scatter(HORAS, NOTAS; color = AZUL, markersize = 6, markerstrokewidth = 0, alpha = 0.8,
                    xlabel = t.disp_x, ylabel = t.disp_y, xlims = (0, 10.5), ylims = (0, 10), xticks = 0:2:10,
                    title = "$(t.disp_t) (r = $(num(r, lang)))")
        plot!(p, [0, 10.5], a .+ b .* [0, 10.5]; color = LARANJA, linewidth = 2, linestyle = :dash)
        salva(p, arquivo("scatter_plot", lang))
        lang == :pt && println("    r = ", cor(HORAS, NOTAS))
    end

    # 6. Linha temporal: vendas mensais. Jan, Fev, Mar e Dez são os da página;
    # os meses do meio são ilustrativos, com a mesma tendência.
    let vendas = [12_500, 14_200, 15_800, 16_900, 18_400, 21_000, 20_300, 21_600, 22_900, 24_200, 26_100, 28_300]
        p = plot(1:12, vendas ./ 1000; color = AZUL, linewidth = 2.5, marker = :circle, markersize = 5,
                 markerstrokewidth = 0, xticks = (1:12, t.meses), ylims = (0, 30),
                 xlabel = t.lin_x, ylabel = t.lin_y, title = t.lin_t)
        salva(p, arquivo("linha_temporal", lang))
    end
end
