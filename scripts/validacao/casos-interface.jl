# Valores de referência para as onze leituras das calculadoras, exatamente
# como aparecem na tela. Enquanto gera-referencia.jl confere as distribuições,
# este confere a composição: qual área cada leitura usa, e as fórmulas do
# teste t e do teste F.
#
#   julia scripts/validacao/casos-interface.jl
#
# Depois é só abrir as três páginas, preencher os mesmos valores e comparar.
using Distributions, Printf
N = Normal()

fmt(p) = p == 0 ? "0.00000" : (p < 1e-5 ? replace(@sprintf("%.3e", p), "e-0" => "e-") : @sprintf("%.5f", p))

println("== ztable, card p-valor (z = 1.53) ==")
z = 1.53
println("P(Z<z)      ", fmt(cdf(N, z)))
println("P(Z>z)      ", fmt(ccdf(N, z)))
println("P(0<Z<z)    ", fmt(abs(cdf(N, z) - 0.5)))
println("P(-|z|<Z<|z|) ", fmt(cdf(N, abs(z)) - cdf(N, -abs(z))))
println("P(|Z|>|z|)  ", fmt(2 * ccdf(N, abs(z))))

println("\n== ztable, entre dois z (-0.75 e 2.10) ==")
a, b = -0.75, 2.10
println("P(a<Z<b)    ", fmt(cdf(N, b) - cdf(N, a)))
println("fora        ", fmt(1 - (cdf(N, b) - cdf(N, a))))
println("P(Z<a)      ", fmt(cdf(N, a)))
println("P(Z>b)      ", fmt(ccdf(N, b)))

println("\n== ztable, z-score (x=87, mu=100, sd=12) ==")
zz = (87 - 100) / 12
@printf("z = %.5f\n", zz)
println("P(X<x)      ", fmt(cdf(N, zz)))
println("P(X>x)      ", fmt(ccdf(N, zz)))

println("\n== ztable, inversa ==")
@printf("esquerda p=0.9  -> %.5f\n", quantile(N, 0.9))
@printf("direita  p=0.9  -> %.5f\n", quantile(N, 0.1))
@printf("central  p=0.9  -> %.5f\n", quantile(N, 0.95))

println("\n== ttable, p-valor (t = -2.35, nu = 17) ==")
T = TDist(17); t = -2.35
println("P(T<t)      ", fmt(cdf(T, t)))
println("P(T>t)      ", fmt(ccdf(T, t)))
println("P(|T|>|t|)  ", fmt(2 * ccdf(T, abs(t))))
println("P(-|t|<T<|t|) ", fmt(cdf(T, abs(t)) - cdf(T, -abs(t))))

println("\n== ttable, critico (alpha=0.025, nu=17) ==")
@printf("uma cauda   %.5f\n", quantile(T, 1 - 0.025))
@printf("duas caudas %.5f\n", quantile(T, 1 - 0.025/2))

println("\n== ttable, teste t (xbar=52.3, mu=50, s=4.7, n=31) ==")
tt = (52.3 - 50) / (4.7 / sqrt(31)); T2 = TDist(30)
@printf("t = %.5f  nu = 30\n", tt)
println("p uma cauda  ", fmt(ccdf(T2, abs(tt))))
println("p duas caudas ", fmt(2 * ccdf(T2, abs(tt))))

println("\n== ftable, p-valor (F = 2.85, v1 = 4, v2 = 18) ==")
Fd = FDist(4, 18); f = 2.85
println("P(F>f)      ", fmt(ccdf(Fd, f)))
println("P(F<f)      ", fmt(cdf(Fd, f)))

println("\n== ftable, critico (alpha=0.01, v1=4, v2=18) ==")
@printf("%.4f\n", quantile(FDist(4, 18), 0.99))

println("\n== ftable, teste F (s1=9.3 n1=13, s2=5.1 n2=19) ==")
ff = 9.3^2 / 5.1^2; Fd2 = FDist(12, 18)
@printf("F = %.5f  nu = 12, 18\n", ff)
println("p uma cauda  ", fmt(ccdf(Fd2, ff)))
println("p duas caudas ", fmt(min(1, 2 * ccdf(Fd2, ff))))
