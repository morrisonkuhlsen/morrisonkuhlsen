# Gera os valores de referência das três distribuições com Distributions.jl,
# para conferir a implementação em JavaScript que roda nas tabelas.
#
#   julia scripts/validacao/gera-referencia.jl
#   node  scripts/validacao/compara.js
#
# Escreve scripts/validacao/referencia.csv, que não vai para o repositório.
using Distributions, Printf

saida = joinpath(@__DIR__, "referencia.csv")

open(saida, "w") do io
    println(io, "familia,funcao,a,b,x,valor")

    for z in -8.0:0.05:8.0
        @printf(io, "normal,cdf,0,0,%.10f,%.17g\n", z, cdf(Normal(), z))
    end
    for p in vcat([1e-12, 1e-10, 1e-8, 1e-6, 1e-4, 1e-3],
                  0.005:0.005:0.995,
                  [0.999, 0.9999, 0.999999, 1 - 1e-8, 1 - 1e-10])
        @printf(io, "normal,quantil,0,0,%.17g,%.17g\n", p, quantile(Normal(), p))
    end

    for v in [1, 2, 3, 4, 5, 7, 10, 15, 20, 30, 50, 100, 500, 1000]
        for t in -10.0:0.1:10.0
            @printf(io, "t,cdf,%d,0,%.10f,%.17g\n", v, t, cdf(TDist(v), t))
        end
        for p in [1e-6, 1e-4, 0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.2, 0.3, 0.5,
                  0.7, 0.8, 0.9, 0.95, 0.975, 0.99, 0.995, 0.999, 0.9999, 1 - 1e-6]
            @printf(io, "t,quantil,%d,0,%.17g,%.17g\n", v, p, quantile(TDist(v), p))
        end
    end

    for v1 in [1, 2, 3, 5, 8, 10, 15, 20, 30, 60, 120]
        for v2 in [1, 2, 3, 5, 8, 10, 15, 20, 30, 60, 120]
            for x in [0.05, 0.2, 0.5, 1.0, 1.5, 2.0, 3.0, 5.0, 10.0, 25.0, 100.0]
                @printf(io, "f,cdf,%d,%d,%.10f,%.17g\n", v1, v2, x, cdf(FDist(v1, v2), x))
            end
            for p in [0.001, 0.01, 0.025, 0.05, 0.1, 0.5, 0.9, 0.95, 0.975, 0.99, 0.999]
                @printf(io, "f,quantil,%d,%d,%.17g,%.17g\n", v1, v2, p, quantile(FDist(v1, v2), p))
            end
        end
    end
end

println("casos gerados: ", countlines(saida) - 1, " → ", saida)
