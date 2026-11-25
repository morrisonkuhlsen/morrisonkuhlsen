---
layout: page
title: Séries Temporais
lang: pt
ref: series-temporais
parent: analise-de-dados
permalink: /pt/analise-de-dados/series-temporais
order: 2
mathjax: true
description: "Séries temporais: gráficos, decomposição, suavização exponencial, Holt-Winters, ARIMA, medidas de erro e previsão com dados reais, com código em Julia, R e Python."
---

<img src="{{ site.baseurl }}/assets/images/timeseries.avif" alt="Ilustração de uma pessoa no computador olhando um gráfico de linha que sobe e desce, sob o título Time Series" style="max-width: 600px; display: block; margin: 1em auto;">

Uma **série temporal** é uma sequência de observações de uma mesma variável feitas ao longo do tempo, em ordem: a temperatura de cada dia, as vendas de cada mês, o número de acessos a um site em cada hora. Escreve-se $y\_1, y\_2, \ldots, y\_n$, em que $y\_t$ é o valor no instante (ou período) $t$.

O que torna as séries temporais diferentes de uma amostra comum é que **a ordem importa**: valores próximos no tempo costumam ser parecidos (as vendas de março se parecem com as de fevereiro), e por isso as observações **não são independentes**. Muitas técnicas que supõem independência, como os intervalos de confiança e testes das páginas de [Inferência Estatística]({{ '/pt/inferencia-estatistica/' | relative_url }}), não podem ser aplicadas diretamente a elas.

Esta página trata de séries observadas a **intervalos regulares** (todo dia, todo mês, todo trimestre) e de uma única variável. O caminho é: componentes de uma série (seção 1), gráficos (2), média móvel e autocorrelação (3 e 4), uma decomposição resolvida à mão (5), suavização exponencial e Holt-Winters (6), estacionariedade e modelos ARIMA (7), medidas de erro, validação e intervalos (8) e, por fim, a previsão de uma série real, a produção de veículos no Brasil (9).

Todo código aparece em três linguagens, **Julia, R e Python**: escolha a sua no cabeçalho de qualquer bloco, e a escolha vale para a página inteira. As três versões fazem a mesma conta e dão os mesmos números.

---

## 1. Os Componentes de uma Série

É comum pensar numa série como a soma de partes com papéis diferentes:

| Componente | O que é | Exemplo |
|---|---|---|
| **Tendência** ($T\_t$) | Movimento de longo prazo, de subida ou de descida | Crescimento das vendas de uma loja ao longo dos anos |
| **Sazonalidade** ($S\_t$) | Padrão que se repete com **período fixo e conhecido** | Vendas maiores todo fim de ano; mais calor todo verão |
| **Ciclo** | Oscilações de longo prazo **sem período fixo** | Fases de expansão e recessão da economia |
| **Ruído** ($R\_t$) | Variação irregular que sobra depois de tirar as outras partes | Um dia de chuva forte, um erro de digitação |

Sazonalidade e ciclo se confundem com facilidade. A diferença é o período: a sazonalidade se repete a cada 12 meses, 7 dias, 4 trimestres; o ciclo não tem duração fixa. Na prática, com poucos anos de dados, o ciclo costuma ficar junto com a tendência (a "tendência-ciclo").

**Modelo aditivo:** quando a altura da oscilação sazonal é mais ou menos a mesma ao longo do tempo,

$$
y_t = T_t + S_t + R_t
$$

**Modelo multiplicativo:** quando a oscilação sazonal cresce junto com o nível da série (por exemplo, o pico de dezembro é sempre cerca de 30% acima da média do ano),

$$
y_t = T_t \times S_t \times R_t
$$

Tomando logaritmos (o que exige valores positivos), o multiplicativo vira aditivo: $\ln y\_t = \ln T\_t + \ln S\_t + \ln R\_t$.

<div style="border-left: 4px solid orange; padding: 0.5em; background-color: #fff3cd;">
  <strong>Atenção:</strong> para afirmar que há sazonalidade é preciso ver o padrão <strong>se repetir</strong>. Com um único ano de dados mensais, um dezembro alto pode ser sazonalidade ou só um mês atípico: não há como distinguir. São precisos pelo menos dois ou três períodos completos.
</div>

---

## 2. Gráficos para Séries Temporais

Antes de qualquer conta, **desenhe a série**. Cada tipo de gráfico mostra uma coisa diferente. Para ver todos com dados reais, usamos a **produção mensal de veículos no Brasil** de janeiro de 2010 a dezembro de 2018: 108 meses, em milhares de veículos (detalhes da fonte no quadro abaixo e na seção 9).

<div style="border-left: 4px solid #2563eb; padding: 0.5em 0.8em; background-color: #eff6ff;">
  <strong>Fonte dos dados:</strong> Banco Central do Brasil, Sistema Gerenciador de Séries Temporais (SGS), série 1373, "Produção total de autoveículos", mensal, em unidades; fonte primária: Associação Nacional dos Fabricantes de Veículos Automotores (Anfavea). Licença: Open Data Commons Open Database License (ODbL), conforme o Portal de Dados Abertos do Banco Central. Dados obtidos pela API do SGS em 25 de novembro de 2026; o código abaixo baixa os mesmos valores direto da fonte.
</div>

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
    <pre><code>using Downloads, JSON, Dates, Statistics, Plots

# Produção total de autoveículos, Brasil (SGS 1373 do Banco Central; fonte: Anfavea), em unidades
url = "https://api.bcb.gov.br/dados/serie/bcdata.sgs.1373/dados?formato=json&amp;dataInicial=01/01/2010&amp;dataFinal=31/12/2018"
dados = JSON.parse(String(take!(Downloads.download(url, IOBuffer()))))
datas = [Date(d["data"], dateformat"dd/mm/yyyy") for d in dados]
producao = [parse(Float64, d["valor"]) for d in dados] ./ 1000   # em milhares de veículos
n = length(producao)
println(n, " meses, de ", first(datas), " a ", last(datas))

# Média de cada mês do ano (gráfico de subséries)
media_mes = [mean(producao[month.(datas) .== mes]) for mes in 1:12]
println("Média por mês (mil): ", round.(media_mes, digits = 1))

# Autocorrelação e faixa de ±1,96/√n
media = mean(producao)
acf(k) = sum((producao[t] - media) * (producao[t+k] - media) for t in 1:n-k) / sum((producao .- media) .^ 2)
r = [acf(k) for k in 1:24]
println("r1 = ", round(r[1], digits = 3), "   r12 = ", round(r[12], digits = 3), "   faixa = ±", round(1.96 / sqrt(n), digits = 3))

anos = 2010:2018
p1 = plot(datas, producao, label = "", title = "(a) Série", ylabel = "Mil veículos",
          xticks = (Date.(2010:2:2018, 1, 1), string.(2010:2:2018)))
p2 = plot(title = "(b) Gráfico sazonal", xticks = (1:12, ["J","F","M","A","M","J","J","A","S","O","N","D"]))
for (i, ano) in enumerate(anos)
    plot!(p2, 1:12, producao[year.(datas) .== ano], label = i in (1, 5, 9) ? string(ano) : "",
          color = cgrad(:viridis)[i / length(anos)], legend = :bottom, legendcolumns = 3)
end
p3 = bar(1:12, media_mes, label = "", title = "(c) Média de cada mês", xticks = (1:12, ["J","F","M","A","M","J","J","A","S","O","N","D"]))
p4 = bar(1:24, r, label = "", title = "(d) Autocorrelação", xlabel = "Defasagem (meses)")
hline!(p4, [1.96, -1.96] ./ sqrt(n), ls = :dash, color = :black, label = "")
savefig(plot(p1, p2, p3, p4, layout = (2, 2), size = (900, 650), margin = 4Plots.mm), "producao_veiculos_graficos.png")</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">108 meses, de 2010-01-01 a 2018-12-01
Média por mês (mil): [218.7, 226.8, 276.7, 255.9, 263.6, 249.2, 262.1, 281.3, 251.6, 267.5, 260.0, 219.3]
r1 = 0.751   r12 = 0.546   faixa = ±0.189</pre>
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
    <pre><code>library(jsonlite)

# Produção total de autoveículos, Brasil (SGS 1373 do Banco Central; fonte: Anfavea), em unidades
url &lt;- "https://api.bcb.gov.br/dados/serie/bcdata.sgs.1373/dados?formato=json&amp;dataInicial=01/01/2010&amp;dataFinal=31/12/2018"
dados &lt;- fromJSON(url)
datas &lt;- as.Date(dados$data, format = "%d/%m/%Y")
producao &lt;- as.numeric(dados$valor) / 1000          # em milhares de veículos
n &lt;- length(producao)
cat(n, "meses, de", format(datas[1]), "a", format(datas[n]), "\n")

# Média de cada mês do ano (gráfico de subséries)
mes &lt;- as.integer(format(datas, "%m"))
media_mes &lt;- tapply(producao, mes, mean)
cat("Média por mês (mil):", round(media_mes, 1), "\n")

# Autocorrelação e faixa de ±1,96/√n
r &lt;- acf(producao, lag.max = 24, plot = FALSE)$acf[-1]
cat("r1 =", round(r[1], 3), "  r12 =", round(r[12], 3), "  faixa = ±", round(1.96 / sqrt(n), 3), "\n")

png("producao_veiculos_graficos_r.png", width = 900, height = 650)
par(mfrow = c(2, 2))
plot(datas, producao, type = "l", main = "(a) Série", xlab = "", ylab = "Mil veículos")
anos &lt;- 2010:2018
cores &lt;- hcl.colors(length(anos), "viridis")
matplot(1:12, sapply(anos, function(a) producao[format(datas, "%Y") == a]), type = "l", lty = 1,
        col = cores, main = "(b) Gráfico sazonal", xlab = "Mês", ylab = "")
legend("bottom", legend = anos[c(1, 5, 9)], col = cores[c(1, 5, 9)], lty = 1, horiz = TRUE, cex = 0.8)
barplot(media_mes, names.arg = c("J","F","M","A","M","J","J","A","S","O","N","D"), main = "(c) Média de cada mês")
barplot(r, names.arg = 1:24, main = "(d) Autocorrelação", xlab = "Defasagem (meses)")
abline(h = c(1.96, -1.96) / sqrt(n), lty = 2)
invisible(dev.off())</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">108 meses, de 2010-01-01 a 2018-12-01 
Média por mês (mil): 218.7 226.8 276.7 255.9 263.6 249.2 262.1 281.3 251.6 267.5 260 219.3 
r1 = 0.751   r12 = 0.546   faixa = ± 0.189</pre>
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
import pandas as pd
import matplotlib.pyplot as plt

# Produção total de autoveículos, Brasil (SGS 1373 do Banco Central; fonte: Anfavea), em unidades
url = ("https://api.bcb.gov.br/dados/serie/bcdata.sgs.1373/dados?formato=json"
       "&amp;dataInicial=01/01/2010&amp;dataFinal=31/12/2018")
dados = pd.read_json(url, storage_options={"User-Agent": "Mozilla/5.0"})
datas = pd.to_datetime(dados["data"], format="%d/%m/%Y")
producao = dados["valor"].astype(float).to_numpy() / 1000    # em milhares de veículos
n = len(producao)
print(n, "meses, de", datas.iloc[0].date(), "a", datas.iloc[-1].date())

# Média de cada mês do ano (gráfico de subséries)
media_mes = pd.Series(producao).groupby(datas.dt.month.to_numpy()).mean()
print("Média por mês (mil):", np.round(media_mes.to_numpy(), 1))

# Autocorrelação e faixa de ±1,96/√n
d = producao - producao.mean()
r = np.array([np.sum(d[:-k] * d[k:]) / np.sum(d ** 2) for k in range(1, 25)])
print(f"r1 = {r[0]:.3f}   r12 = {r[11]:.3f}   faixa = ±{1.96 / np.sqrt(n):.3f}")

meses = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"]
fig, ax = plt.subplots(2, 2, figsize=(9, 6.5))
ax[0, 0].plot(datas, producao); ax[0, 0].set(title="(a) Série", ylabel="Mil veículos")
cores = plt.cm.viridis(np.linspace(0, 1, 9))
for i, ano in enumerate(range(2010, 2019)):
    ax[0, 1].plot(range(1, 13), producao[datas.dt.year == ano], color=cores[i],
                  label=str(ano) if i in (0, 4, 8) else None)
ax[0, 1].set(title="(b) Gráfico sazonal", xticks=range(1, 13), xticklabels=meses); ax[0, 1].legend(ncol=3)
ax[1, 0].bar(range(1, 13), media_mes); ax[1, 0].set(title="(c) Média de cada mês", xticks=range(1, 13), xticklabels=meses)
ax[1, 1].bar(range(1, 25), r); ax[1, 1].axhline(1.96 / np.sqrt(n), ls="--", color="k"); ax[1, 1].axhline(-1.96 / np.sqrt(n), ls="--", color="k")
ax[1, 1].set(title="(d) Autocorrelação", xlabel="Defasagem (meses)")
fig.tight_layout(); fig.savefig("producao_veiculos_graficos_py.png", dpi=100)</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">108 meses, de 2010-01-01 a 2018-12-01
Média por mês (mil): [218.7 226.8 276.7 255.9 263.6 249.2 262.1 281.3 251.6 267.5 260.  219.3]
r1 = 0.751   r12 = 0.546   faixa = ±0.189</pre>
</div>
  </div>
</div>

![Quatro painéis da produção mensal de veículos de 2010 a 2018: a série no tempo, o gráfico sazonal com uma linha por ano, as barras da média de cada mês e o correlograma com a faixa de significância tracejada]({{ site.baseurl }}/assets/images/producao_veiculos_graficos.png){:style="max-width: 900px; display: block; margin: 1em auto;"}
<div class="image-caption" style="text-align: center;">Figura 1. Produção mensal de veículos no Brasil, 2010–2018 (SGS 1373; Anfavea). (a) Série; (b) gráfico sazonal; (c) média de cada mês; (d) autocorrelação, com a faixa ±1,96/√n tracejada. Gerada pelo código acima, versão em Julia.</div>

**(a) Gráfico de linha.** O tempo no eixo horizontal e o valor no vertical, com os pontos ligados na ordem. Mostra a tendência e as mudanças de nível. Aqui, a produção oscila em torno de 270 a 330 mil veículos por mês até 2013, cai para perto de 150 a 200 mil em 2015 e 2016 e volta a subir a partir de 2017: a "tendência" não é uma reta.

**(b) Gráfico sazonal.** Uma linha por ano, com os meses no eixo horizontal. Se as linhas têm o mesmo formato, há sazonalidade; se elas se deslocam para cima ou para baixo, há tendência. Aqui, quase todos os anos têm o mesmo desenho: começo de ano fraco, março alto, dezembro baixo.

**(c) Subséries por mês.** A média de cada mês do calendário (na versão mais completa, desenha-se a série de cada mês ao longo dos anos). Mostra o padrão sazonal médio. Na produção de veículos, as médias vão de 218,7 mil (janeiro) e 219,3 mil (dezembro) até 276,7 mil (março) e 281,3 mil (agosto).

**(d) Correlograma (ACF).** As autocorrelações $r\_k$ (seção 4) para $k = 1, 2, \ldots, 24$. As linhas tracejadas em $\pm 1{,}96/\sqrt{n}$ marcam, aproximadamente, até onde uma autocorrelação poderia ir só por acaso se a série fosse ruído puro (com $n = 108$, $\pm 0{,}189$). Aqui, $r\_1 = 0{,}751$: um mês se parece muito com o anterior. As barras caem devagar, o que indica tendência, e sobem de novo perto de $k = 12$ ($r\_{12} = 0{,}546$), o que indica sazonalidade anual.

Outros gráficos úteis: o **gráfico de defasagem** ($y\_t$ contra $y\_{t-k}$, um ponto por mês, que mostra a autocorrelação como nuvem de pontos), os **painéis da decomposição** (série, tendência, sazonalidade e resíduo empilhados) e o **gráfico de resíduos** de um modelo ajustado, que não deve ter padrão.

---

## 3. Média Móvel

A **média móvel** suaviza a série, trocando cada valor pela média dele com os vizinhos. Assim as oscilações de curto prazo se cancelam e a tendência aparece.

A **média móvel simples de ordem 3**, centrada em $t$, é

$$
MM_t = \frac{y_{t-1} + y_t + y_{t+1}}{3}
$$

Quando a série tem sazonalidade de período $m$, usa-se uma média móvel de ordem $m$: cada média pega exatamente um período completo e a sazonalidade some dela. Se $m$ é par (4 trimestres, 12 meses), a média de $m$ valores fica "entre" dois instantes; para centrá-la num instante, usa-se a **média móvel 2×$m$**, que dá peso 1/2 às duas pontas. Para dados trimestrais ($m = 4$):

$$
MM_t = \frac{\tfrac{1}{2}y_{t-2} + y_{t-1} + y_t + y_{t+1} + \tfrac{1}{2}y_{t+2}}{4}
$$

São 5 valores com pesos $\tfrac{1}{8}, \tfrac{1}{4}, \tfrac{1}{4}, \tfrac{1}{4}, \tfrac{1}{8}$, que somam 1. Cada trimestre do ano entra com peso total 1/4, por isso o efeito sazonal se cancela.

A média móvel não existe nas pontas da série (faltam vizinhos) e reage com atraso a mudanças bruscas.

---

## 4. Autocorrelação

A **autocorrelação de defasagem** (ou *lag*) $k$ mede a correlação entre a série e ela mesma deslocada $k$ períodos:

$$
r_k = \frac{\sum_{t=1}^{n-k} (y_t - \bar{y})(y_{t+k} - \bar{y})}{\sum_{t=1}^{n} (y_t - \bar{y})^2}
$$

em que $\bar{y}$ é a média de todos os $n$ valores. Ela fica entre −1 e 1, como a correlação comum. Um $r\_k$ alto e positivo diz que valores separados por $k$ períodos se parecem. Numa série trimestral com sazonalidade, $r\_4$ (um ano de distância) costuma ser alto. O gráfico dos $r\_k$ contra $k$ se chama **correlograma** ou **ACF**.

**Faixa de significância.** Se a série fosse ruído puro (valores independentes), cada $r\_k$ ficaria, em cerca de 95% das vezes, entre $-1{,}96/\sqrt{n}$ e $1{,}96/\sqrt{n}$. Barras fora dessa faixa sugerem dependência real. É uma aproximação para $n$ grande, e com muitas defasagens algumas barras saem da faixa só por acaso (uma em cada vinte, em média).

**Autocorrelação parcial (PACF).** A autocorrelação $r\_2$ mistura o efeito direto de $y\_{t-2}$ sobre $y\_t$ com o efeito indireto que passa por $y\_{t-1}$. A **autocorrelação parcial** de defasagem $k$ mede só a parte direta: é o coeficiente de $y\_{t-k}$ numa regressão de $y\_t$ em $y\_{t-1}, \ldots, y\_{t-k}$. Ela ajuda a escolher a ordem de um modelo AR (seção 7): num AR($p$), a PACF é praticamente zero depois da defasagem $p$. As funções prontas (`pacf` no R, `pacf` do statsmodels, `pacf` do StatsBase.jl) usam métodos de estimação diferentes e podem dar valores um pouco diferentes.

---

## 5. Exemplo Resolvido: Decomposição e Previsão

**Situação** (números ilustrativos): as vendas trimestrais de uma loja, em R\\$ mil, ao longo de 3 anos.

| | T1 | T2 | T3 | T4 |
|---|---|---|---|---|
| **Ano 1** ($t$ = 1 a 4) | 40 | 52 | 46 | 70 |
| **Ano 2** ($t$ = 5 a 8) | 44 | 56 | 50 | 76 |
| **Ano 3** ($t$ = 9 a 12) | 48 | 61 | 54 | 81 |

Olhando a tabela: em todo ano o T4 é o maior e o T1 o menor (padrão que **se repete** três vezes: sazonalidade), e cada trimestre vende mais que o mesmo trimestre do ano anterior (tendência de alta). A altura do pico do T4 em relação aos outros trimestres muda pouco de um ano para o outro, então vamos usar o **modelo aditivo**.

**Objetivo:** separar tendência e sazonalidade e prever as vendas do ano 4.

### 5.1 Dados

- $y\_t$: vendas no trimestre $t$, em R\\$ mil, $t = 1, \ldots, 12$ (da tabela);
- período sazonal: $m = 4$ trimestres;
- $n = 12$ observações.

### 5.2 Passo 1: tendência pela média móvel 2×4

Fórmula (seção 3): $MM\_t = \big(\tfrac{1}{2}y\_{t-2} + y\_{t-1} + y\_t + y\_{t+1} + \tfrac{1}{2}y\_{t+2}\big) / 4$. Ela só existe de $t = 3$ a $t = 10$.

Para $t = 3$, substituindo:

$$
MM_3 = \frac{\tfrac{1}{2} \times 40 + 52 + 46 + 70 + \tfrac{1}{2} \times 44}{4} = \frac{20 + 52 + 46 + 70 + 22}{4} = \frac{210}{4} = 52{,}5
$$

Os demais, do mesmo modo:

| $t$ | Conta do numerador | Numerador | $MM\_t$ |
|---|---|---|---|
| 3 | $20 + 52 + 46 + 70 + 22$ | 210 | 52,5 |
| 4 | $26 + 46 + 70 + 44 + 28$ | 214 | 53,5 |
| 5 | $23 + 70 + 44 + 56 + 25$ | 218 | 54,5 |
| 6 | $35 + 44 + 56 + 50 + 38$ | 223 | 55,75 |
| 7 | $22 + 56 + 50 + 76 + 24$ | 228 | 57 |
| 8 | $28 + 50 + 76 + 48 + 30{,}5$ | 232,5 | 58,125 |
| 9 | $25 + 76 + 48 + 61 + 27$ | 237 | 59,25 |
| 10 | $38 + 48 + 61 + 54 + 40{,}5$ | 241,5 | 60,375 |

A média móvel cresce de forma regular: é a tendência, já sem a sazonalidade.

### 5.3 Passo 2: desvios em relação à tendência

Para cada $t$ com média móvel, o desvio $y\_t - MM\_t$ mostra quanto aquele trimestre ficou acima ou abaixo da tendência:

| $t$ | Trimestre | $y\_t$ | $MM\_t$ | $y\_t - MM\_t$ |
|---|---|---|---|---|
| 3 | T3 | 46 | 52,5 | −6,5 |
| 4 | T4 | 70 | 53,5 | 16,5 |
| 5 | T1 | 44 | 54,5 | −10,5 |
| 6 | T2 | 56 | 55,75 | 0,25 |
| 7 | T3 | 50 | 57 | −7 |
| 8 | T4 | 76 | 58,125 | 17,875 |
| 9 | T1 | 48 | 59,25 | −11,25 |
| 10 | T2 | 61 | 60,375 | 0,625 |

### 5.4 Passo 3: efeito sazonal de cada trimestre

O **efeito sazonal bruto** de um trimestre é a média dos seus desvios (cada trimestre aparece duas vezes):

$$
\text{T1}: \frac{-10{,}5 + (-11{,}25)}{2} = \frac{-21{,}75}{2} = -10{,}875 \qquad
\text{T2}: \frac{0{,}25 + 0{,}625}{2} = \frac{0{,}875}{2} = 0{,}4375
$$

$$
\text{T3}: \frac{-6{,}5 + (-7)}{2} = \frac{-13{,}5}{2} = -6{,}75 \qquad
\text{T4}: \frac{16{,}5 + 17{,}875}{2} = \frac{34{,}375}{2} = 17{,}1875
$$

No modelo aditivo, os efeitos sazonais devem **somar zero** num ano (o que um trimestre ganha, outro perde). Se a soma não der zero, subtrai-se a média dos quatro efeitos de cada um. Aqui:

$$
-10{,}875 + 0{,}4375 + (-6{,}75) + 17{,}1875 = 0
$$

A soma já é zero, então os efeitos ajustados são os próprios: $S\_1 = -10{,}875$, $S\_2 = 0{,}4375$, $S\_3 = -6{,}75$, $S\_4 = 17{,}1875$.

**Interpretação:** descontada a tendência, o 4º trimestre vende cerca de R\\$ 17,2 mil acima do nível do ano, e o 1º cerca de R\\$ 10,9 mil abaixo; o 2º fica praticamente no nível.

### 5.5 Passo 4: série dessazonalizada

Tirando de cada valor o efeito do seu trimestre, $d\_t = y\_t - S\_{\text{trimestre}(t)}$, sobra tendência + ruído:

| $t$ | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| $y\_t$ | 40 | 52 | 46 | 70 | 44 | 56 | 50 | 76 | 48 | 61 | 54 | 81 |
| $S$ | −10,875 | 0,4375 | −6,75 | 17,1875 | −10,875 | 0,4375 | −6,75 | 17,1875 | −10,875 | 0,4375 | −6,75 | 17,1875 |
| $d\_t$ | 50,875 | 51,5625 | 52,75 | 52,8125 | 54,875 | 55,5625 | 56,75 | 58,8125 | 58,875 | 60,5625 | 60,75 | 63,8125 |

Por exemplo, $d\_1 = 40 - (-10{,}875) = 40 + 10{,}875 = 50{,}875$.

### 5.6 Passo 5: reta de tendência

Ajustamos uma reta $\hat{d}\_t = a + b\,t$ à série dessazonalizada por [mínimos quadrados]({{ '/pt/analise-de-dados/regressao-linear' | relative_url }}): $b = S\_{td}/S\_{tt}$ e $a = \bar{d} - b\,\bar{t}$.

- $\bar{t} = (1 + 2 + \cdots + 12)/12 = 78/12 = 6{,}5$;
- $\bar{d} = (50{,}875 + 51{,}5625 + \cdots + 63{,}8125)/12 = 678/12 = 56{,}5$.

| $t$ | $t - \bar{t}$ | $d\_t - \bar{d}$ | $(t - \bar{t})(d\_t - \bar{d})$ | $(t - \bar{t})^2$ |
|---|---|---|---|---|
| 1 | −5,5 | −5,625 | 30,9375 | 30,25 |
| 2 | −4,5 | −4,9375 | 22,21875 | 20,25 |
| 3 | −3,5 | −3,75 | 13,125 | 12,25 |
| 4 | −2,5 | −3,6875 | 9,21875 | 6,25 |
| 5 | −1,5 | −1,625 | 2,4375 | 2,25 |
| 6 | −0,5 | −0,9375 | 0,46875 | 0,25 |
| 7 | 0,5 | 0,25 | 0,125 | 0,25 |
| 8 | 1,5 | 2,3125 | 3,46875 | 2,25 |
| 9 | 2,5 | 2,375 | 5,9375 | 6,25 |
| 10 | 3,5 | 4,0625 | 14,21875 | 12,25 |
| 11 | 4,5 | 4,25 | 19,125 | 20,25 |
| 12 | 5,5 | 7,3125 | 40,21875 | 30,25 |
| **Soma** | | | $S\_{td} = 161{,}5$ | $S\_{tt} = 143$ |

$$
b = \frac{S_{td}}{S_{tt}} = \frac{161{,}5}{143} = 1{,}129370\ldots \approx 1{,}1294 \text{ (R\$ mil por trimestre)}
$$

$$
a = \bar{d} - b\,\bar{t} = 56{,}5 - 1{,}129370\ldots \times 6{,}5 = 56{,}5 - 7{,}340909\ldots = 49{,}159090\ldots \approx 49{,}1591
$$

**Interpretação:** descontada a sazonalidade, as vendas crescem em média cerca de R\\$ 1,13 mil por trimestre, isto é, cerca de R\\$ 4,5 mil por ano.

### 5.7 Passo 6: previsão para o ano 4

Previsão = tendência no trimestre + efeito sazonal do trimestre: $\hat{y}\_t = a + b\,t + S\_{\text{trimestre}(t)}$, com $a$ e $b$ completos.

| $t$ | Trimestre | Tendência $a + b\,t$ | Efeito $S$ | Previsão $\hat{y}\_t$ (R\\$ mil) |
|---|---|---|---|---|
| 13 | T1 | $49{,}159091 + 1{,}129371 \times 13 = 63{,}840909$ | −10,875 | 52,97 |
| 14 | T2 | $49{,}159091 + 1{,}129371 \times 14 = 64{,}970280$ | 0,4375 | 65,41 |
| 15 | T3 | $49{,}159091 + 1{,}129371 \times 15 = 66{,}099650$ | −6,75 | 59,35 |
| 16 | T4 | $49{,}159091 + 1{,}129371 \times 16 = 67{,}229021$ | 17,1875 | 84,42 |

**Interpretação e limites.** Se a tendência e o padrão sazonal dos últimos 3 anos continuarem, o ano 4 deve ter vendas de cerca de R\\$ 53 mil, 65 mil, 59 mil e 84 mil nos quatro trimestres. Isso é uma **extrapolação**: supõe que nada muda (economia, concorrência, a própria loja). Quanto mais longe no futuro, menos confiável. E essas previsões vêm sem margem de erro; os métodos das seções 6 e 7 dão intervalos de previsão (seção 8.3).

### 5.8 Conferência pela autocorrelação

Com $\bar{y} = 678/12 = 56{,}5$ e $\sum (y\_t - \bar{y})^2 = 1863$, as autocorrelações (calculadas pelo código abaixo) são:

| Defasagem $k$ | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| $r\_k$ | −0,313 | 0,313 | −0,416 | **0,611** | −0,266 | 0,101 |

A maior é $r\_4 = 0{,}611$: valores separados por **um ano** se parecem, o que confirma a sazonalidade de período 4 vista na tabela. Com só 12 observações, esses valores são imprecisos; servem como indicação, não como prova.

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
    <pre><code>using Statistics, Plots

# Vendas trimestrais (R$ mil) de uma loja em 3 anos (números ilustrativos)
vendas = [40, 52, 46, 70, 44, 56, 50, 76, 48, 61, 54, 81]
n = length(vendas)
trimestre(t) = mod1(t, 4)   # 1, 2, 3, 4, 1, 2, ...

# 1. Tendência: média móvel centrada 2×4 (só existe de t = 3 a t = n − 2)
mm = [(vendas[t-2]/2 + vendas[t-1] + vendas[t] + vendas[t+1] + vendas[t+2]/2) / 4 for t in 3:n-2]

# 2. Efeito sazonal: média de (valor − média móvel) em cada trimestre, ajustada para somar zero
desvios = vendas[3:n-2] .- mm
bruto = [mean(desvios[i] for (i, t) in enumerate(3:n-2) if trimestre(t) == q) for q in 1:4]
efeito = bruto .- mean(bruto)

# 3. Série dessazonalizada e tendência linear (mínimos quadrados) sobre ela
dessaz = [vendas[t] - efeito[trimestre(t)] for t in 1:n]
tempo = 1:n
b = sum((tempo .- mean(tempo)) .* (dessaz .- mean(dessaz))) / sum((tempo .- mean(tempo)) .^ 2)
a = mean(dessaz) - b * mean(tempo)

# 4. Previsão para o ano 4: tendência + efeito sazonal
futuro = 13:16
previsao = [a + b * t + efeito[trimestre(t)] for t in futuro]

println("Médias móveis (t = 3 a 10): ", mm)
println("Efeitos sazonais (T1 a T4): ", efeito)
println("Tendência: a = ", round(a, digits = 4), "   b = ", round(b, digits = 4), " por trimestre")
println("Previsão do ano 4: ", round.(previsao, digits = 2))

# Autocorrelação amostral nos lags 1 a 6
media = mean(vendas)
acf(k) = sum((vendas[t] - media) * (vendas[t+k] - media) for t in 1:n-k) / sum((vendas .- media) .^ 2)
println("Autocorrelação r1 a r6: ", round.([acf(k) for k in 1:6], digits = 3))

p = plot(1:n, vendas, marker = :circle, label = "Vendas", xlabel = "Trimestre (t)",
         ylabel = "Vendas (R\$ mil)", title = "Decomposição e previsão", legend = :topleft,
         xticks = 1:16, size = (800, 420), left_margin = 5Plots.mm, bottom_margin = 3Plots.mm)
plot!(p, 3:n-2, mm, lw = 2, label = "Média móvel 2×4 (tendência)")
plot!(p, 1:16, a .+ b .* (1:16), ls = :dash, color = :gray, label = "Tendência linear")
plot!(p, futuro, previsao, marker = :diamond, ls = :dot, color = :crimson, label = "Previsão (ano 4)")
savefig(p, "series_temporais_decomposicao.png")</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">Médias móveis (t = 3 a 10): [52.5, 53.5, 54.5, 55.75, 57.0, 58.125, 59.25, 60.375]
Efeitos sazonais (T1 a T4): [-10.875, 0.4375, -6.75, 17.1875]
Tendência: a = 49.1591   b = 1.1294 por trimestre
Previsão do ano 4: [52.97, 65.41, 59.35, 84.42]
Autocorrelação r1 a r6: [-0.313, 0.313, -0.416, 0.611, -0.266, 0.101]</pre>
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
    <pre><code># Vendas trimestrais (R$ mil) de uma loja em 3 anos (números ilustrativos)
vendas &lt;- c(40, 52, 46, 70, 44, 56, 50, 76, 48, 61, 54, 81)
n &lt;- length(vendas)
trimestre &lt;- function(t) (t - 1) %% 4 + 1   # 1, 2, 3, 4, 1, 2, ...

# 1. Tendência: média móvel centrada 2×4 (só existe de t = 3 a t = n − 2)
mm &lt;- sapply(3:(n - 2), function(t)
  (vendas[t - 2] / 2 + vendas[t - 1] + vendas[t] + vendas[t + 1] + vendas[t + 2] / 2) / 4)

# 2. Efeito sazonal: média de (valor − média móvel) em cada trimestre, ajustada para somar zero
desvios &lt;- vendas[3:(n - 2)] - mm
bruto &lt;- tapply(desvios, trimestre(3:(n - 2)), mean)
efeito &lt;- bruto - mean(bruto)

# 3. Série dessazonalizada e tendência linear (mínimos quadrados) sobre ela
dessaz &lt;- vendas - efeito[trimestre(1:n)]
tempo &lt;- 1:n
ajuste &lt;- lm(dessaz ~ tempo)
a &lt;- coef(ajuste)[[1]]; b &lt;- coef(ajuste)[[2]]

# 4. Previsão para o ano 4: tendência + efeito sazonal
futuro &lt;- 13:16
previsao &lt;- a + b * futuro + efeito[trimestre(futuro)]

cat("Médias móveis (t = 3 a 10):", mm, "\n")
cat("Efeitos sazonais (T1 a T4):", efeito, "\n")
cat("Tendência: a =", round(a, 4), "  b =", round(b, 4), "por trimestre\n")
cat("Previsão do ano 4:", round(previsao, 2), "\n")

# Autocorrelação amostral nos lags 1 a 6 (acf usa a mesma fórmula da página)
r &lt;- acf(vendas, lag.max = 6, plot = FALSE)$acf[-1]
cat("Autocorrelação r1 a r6:", round(r, 3), "\n")

png("series_temporais_decomposicao_r.png", width = 800, height = 420)
plot(1:n, vendas, type = "o", pch = 19, xlim = c(1, 16), ylim = c(38, 86), xaxt = "n",
     xlab = "Trimestre (t)", ylab = "Vendas (R$ mil)", main = "Decomposição e previsão")
axis(1, at = 1:16)
lines(3:(n - 2), mm, lwd = 2, col = "darkorange")
abline(a = a, b = b, lty = 2, col = "gray40")
lines(futuro, previsao, type = "o", pch = 18, lty = 3, col = "#DC143C")
legend("topleft", c("Vendas", "Média móvel 2×4 (tendência)", "Tendência linear", "Previsão (ano 4)"),
       col = c("black", "darkorange", "gray40", "#DC143C"), lty = c(1, 1, 2, 3), pch = c(19, NA, NA, 18))
invisible(dev.off())</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">Médias móveis (t = 3 a 10): 52.5 53.5 54.5 55.75 57 58.125 59.25 60.375 
Efeitos sazonais (T1 a T4): -10.875 0.4375 -6.75 17.1875 
Tendência: a = 49.1591   b = 1.1294 por trimestre
Previsão do ano 4: 52.97 65.41 59.35 84.42 
Autocorrelação r1 a r6: -0.313 0.313 -0.416 0.611 -0.266 0.101</pre>
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

# Vendas trimestrais (R$ mil) de uma loja em 3 anos (números ilustrativos)
vendas = np.array([40, 52, 46, 70, 44, 56, 50, 76, 48, 61, 54, 81], dtype=float)
n = len(vendas)
trimestre = lambda t: (t - 1) % 4 + 1        # 1, 2, 3, 4, 1, 2, ... (t começa em 1)

# 1. Tendência: média móvel centrada 2×4 (só existe de t = 3 a t = n − 2)
pesos = np.array([1/8, 1/4, 1/4, 1/4, 1/8])
mm = np.convolve(vendas, pesos, mode="valid")   # posições t = 3, ..., n − 2

# 2. Efeito sazonal: média de (valor − média móvel) em cada trimestre, ajustada para somar zero
t_mm = np.arange(3, n - 1)
desvios = vendas[2:n - 2] - mm
bruto = np.array([desvios[trimestre(t_mm) == q].mean() for q in range(1, 5)])
efeito = bruto - bruto.mean()

# 3. Série dessazonalizada e tendência linear (mínimos quadrados) sobre ela
tempo = np.arange(1, n + 1)
dessaz = vendas - efeito[trimestre(tempo) - 1]
b, a = np.polyfit(tempo, dessaz, 1)

# 4. Previsão para o ano 4: tendência + efeito sazonal
futuro = np.arange(13, 17)
previsao = a + b * futuro + efeito[trimestre(futuro) - 1]

print("Médias móveis (t = 3 a 10):", mm)
print("Efeitos sazonais (T1 a T4):", efeito)
print(f"Tendência: a = {a:.4f}   b = {b:.4f} por trimestre")
print("Previsão do ano 4:", np.round(previsao, 2))

# Autocorrelação amostral nos lags 1 a 6
d = vendas - vendas.mean()
r = [np.sum(d[:-k] * d[k:]) / np.sum(d ** 2) for k in range(1, 7)]
print("Autocorrelação r1 a r6:", np.round(r, 3))

fig, ax = plt.subplots(figsize=(8, 4.2))
ax.plot(tempo, vendas, "o-", label="Vendas")
ax.plot(t_mm, mm, lw=2, label="Média móvel 2×4 (tendência)")
ax.plot(np.arange(1, 17), a + b * np.arange(1, 17), "--", color="gray", label="Tendência linear")
ax.plot(futuro, previsao, "D:", color="crimson", label="Previsão (ano 4)")
ax.set(xlabel="Trimestre (t)", ylabel="Vendas (R$ mil)", title="Decomposição e previsão", xticks=range(1, 17))
ax.legend(loc="upper left")
fig.savefig("series_temporais_decomposicao_py.png", dpi=100, bbox_inches="tight")</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">Médias móveis (t = 3 a 10): [52.5   53.5   54.5   55.75  57.    58.125 59.25  60.375]
Efeitos sazonais (T1 a T4): [-10.875    0.4375  -6.75    17.1875]
Tendência: a = 49.1591   b = 1.1294 por trimestre
Previsão do ano 4: [52.97 65.41 59.35 84.42]
Autocorrelação r1 a r6: [-0.313  0.313 -0.416  0.611 -0.266  0.101]</pre>
</div>
  </div>
</div>

![Gráfico das vendas trimestrais de t = 1 a 12, com a média móvel 2×4 subindo de forma regular, a reta de tendência tracejada e as quatro previsões do ano 4 em vermelho]({{ site.baseurl }}/assets/images/series_temporais_decomposicao.png){:style="max-width: 800px; display: block; margin: 1em auto;"}
<div class="image-caption" style="text-align: center;">Figura 2. Vendas trimestrais, média móvel 2×4 (tendência), reta de tendência e previsão do ano 4. Gerada pelo código acima, versão em Julia.</div>

---

## 6. Suavização Exponencial

A média móvel dá o mesmo peso a todos os valores da janela. A **suavização exponencial** usa **todo** o passado, com pesos que diminuem para os valores mais antigos.

### 6.1 Suavização exponencial simples

Para séries sem tendência nem sazonalidade, a previsão é um **nível** $\ell\_t$ atualizado a cada novo valor:

$$
\ell_t = \alpha\,y_t + (1 - \alpha)\,\ell_{t-1} \qquad\qquad \hat{y}_{t+h} = \ell_t \text{ para todo } h
$$

- $\alpha$, entre 0 e 1, é a **constante de suavização**: perto de 1, o nível segue o último valor; perto de 0, muda devagar;
- substituindo a fórmula nela mesma, $\ell\_t = \alpha y\_t + \alpha(1-\alpha) y\_{t-1} + \alpha(1-\alpha)^2 y\_{t-2} + \cdots$: os pesos caem em progressão geométrica, daí o nome "exponencial";
- é preciso um valor inicial $\ell\_1$; aqui usamos o primeiro valor da série.

**Exemplo** (números ilustrativos): chamados atendidos por semana numa central, $y = 30, 34, 31, 35, 33, 38, 36, 37$, com $\alpha = 0{,}3$ e $\ell\_1 = 30$. A cada semana, a previsão é o nível anterior, o erro é o valor real menos a previsão, e o nível é atualizado:

| Semana $t$ | $y\_t$ | Previsão $\ell\_{t-1}$ | Erro $y\_t - \ell\_{t-1}$ | Novo nível $\ell\_t = 0{,}3\,y\_t + 0{,}7\,\ell\_{t-1}$ |
|---|---|---|---|---|
| 2 | 34 | 30 | 4 | $10{,}2 + 21 = 31{,}2$ |
| 3 | 31 | 31,2 | −0,2 | $9{,}3 + 21{,}84 = 31{,}14$ |
| 4 | 35 | 31,14 | 3,86 | $10{,}5 + 21{,}798 = 32{,}298$ |
| 5 | 33 | 32,298 | 0,702 | $9{,}9 + 22{,}6086 = 32{,}5086$ |
| 6 | 38 | 32,5086 | 5,4914 | $11{,}4 + 22{,}75602 = 34{,}15602$ |
| 7 | 36 | 34,15602 | 1,84398 | $10{,}8 + 23{,}909214 = 34{,}709214$ |
| 8 | 37 | 34,709214 | 2,290786 | $11{,}1 + 24{,}2964498 = 35{,}3964498$ |

A previsão para a semana 9 (e para as seguintes) é $\ell\_8 \approx 35{,}40$ chamados. Repare que todos os erros, menos um, são positivos: a série tem uma leve tendência de alta que a suavização simples não acompanha. Para isso existe o método de Holt.

### 6.2 Holt-Winters: nível, tendência e sazonalidade

O método de **Holt** acrescenta uma tendência $b\_t$; o de **Holt-Winters** acrescenta também os efeitos sazonais $s\_t$, com período $m$. Na versão **aditiva** (Hyndman e Athanasopoulos, 2021, seção 8.3):

$$
\ell_t = \alpha\,(y_t - s_{t-m}) + (1 - \alpha)(\ell_{t-1} + b_{t-1})
$$

$$
b_t = \beta\,(\ell_t - \ell_{t-1}) + (1 - \beta)\,b_{t-1}
$$

$$
s_t = \gamma\,(y_t - \ell_{t-1} - b_{t-1}) + (1 - \gamma)\,s_{t-m}
$$

$$
\hat{y}_{t+h} = \ell_t + h\,b_t + s_{t+h-m} \quad (h \leq m)
$$

Cada equação é uma média ponderada entre "o que o dado novo diz" e "o que se sabia antes". As três constantes $\alpha$, $\beta$, $\gamma$ ficam entre 0 e 1 e costumam ser escolhidas para minimizar a soma dos quadrados dos erros de previsão um passo à frente.

**Valores iniciais** (há várias escolhas; esta é a clássica): o nível é a média do primeiro ano, a tendência é a diferença entre as médias do segundo e do primeiro ano dividida por $m$, e os efeitos sazonais são os valores do primeiro ano menos o nível.

**Exemplo: um passo à mão**, nas vendas trimestrais da seção 5, com $m = 4$, $\alpha = 0{,}5$, $\beta = 0{,}3$, $\gamma = 0{,}3$ (valores fixados para a conta ficar simples).

Início:

$$
\ell_4 = \frac{40 + 52 + 46 + 70}{4} = \frac{208}{4} = 52 \qquad b_4 = \frac{56{,}5 - 52}{4} = \frac{4{,}5}{4} = 1{,}125
$$

$$
s_1 = 40 - 52 = -12 \qquad s_2 = 52 - 52 = 0 \qquad s_3 = 46 - 52 = -6 \qquad s_4 = 70 - 52 = 18
$$

(56,5 é a média do ano 2: $(44 + 56 + 50 + 76)/4 = 226/4$.)

Trimestre $t = 5$ (T1 do ano 2, $y\_5 = 44$). A previsão feita antes de ver o dado era $\ell\_4 + b\_4 + s\_1 = 52 + 1{,}125 - 12 = 41{,}125$. Atualização:

$$
\ell_5 = 0{,}5 \times (44 - (-12)) + 0{,}5 \times (52 + 1{,}125) = 0{,}5 \times 56 + 0{,}5 \times 53{,}125 = 28 + 26{,}5625 = 54{,}5625
$$

$$
b_5 = 0{,}3 \times (54{,}5625 - 52) + 0{,}7 \times 1{,}125 = 0{,}3 \times 2{,}5625 + 0{,}7875 = 0{,}76875 + 0{,}7875 = 1{,}55625
$$

$$
s_5 = 0{,}3 \times (44 - 52 - 1{,}125) + 0{,}7 \times (-12) = 0{,}3 \times (-9{,}125) - 8{,}4 = -2{,}7375 - 8{,}4 = -11{,}1375
$$

O dado veio 2,875 acima da previsão; por isso o nível subiu, a tendência aumentou e o efeito do T1 ficou um pouco menos negativo. O código repete esse passo até $t = 12$ e prevê o ano 4: 52,70; 65,22; 59,31 e 85,63 (R\\$ mil), perto das previsões da decomposição (52,97; 65,41; 59,35; 84,42).

**Intervalo de previsão na suavização simples.** Supondo erros independentes e normais com desvio padrão $\sigma$, o intervalo de 95% para $h$ passos à frente é (Hyndman e Athanasopoulos, 2021, seção 8.7):

$$
\hat{y}_{t+h} \pm 1{,}96\,\sigma\sqrt{1 + (h - 1)\,\alpha^2}
$$

No exemplo dos chamados, estimando $\sigma$ pela raiz da média dos 7 erros ao quadrado, $\sigma = \sqrt{70{,}2358/7} = \sqrt{10{,}0337} \approx 3{,}168$. Para a semana 9 ($h = 1$): $35{,}40 \pm 1{,}96 \times 3{,}168 = 35{,}40 \pm 6{,}21$, ou seja, de 29,19 a 41,60 chamados. Para a semana 10 ($h = 2$): $35{,}40 \pm 1{,}96 \times 3{,}168 \times \sqrt{1{,}09} = 35{,}40 \pm 6{,}48$. Conferimos essa fórmula por simulação (200 mil séries geradas pelo modelo).

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
    <pre><code>using Statistics

# 1. Suavização exponencial simples: chamados por semana (números ilustrativos)
chamados = [30, 34, 31, 35, 33, 38, 36, 37]
α = 0.3
nivel = Float64(chamados[1])                 # início: o primeiro valor
erros = Float64[]                            # erros de previsão um passo à frente
for t in 2:length(chamados)
    push!(erros, chamados[t] - nivel)
    global nivel = α * chamados[t] + (1 - α) * nivel
end
σ = sqrt(mean(erros .^ 2))
println("SES: previsão para a semana 9 = ", round(nivel, digits = 4), "   σ = ", round(σ, digits = 4))
println("Intervalo de 95% (h = 1): [", round(nivel - 1.96σ, digits = 2), "; ", round(nivel + 1.96σ, digits = 2), "]")

# 2. Holt-Winters aditivo (m = 4) nas vendas trimestrais, com α, β, γ fixos
vendas = [40, 52, 46, 70, 44, 56, 50, 76, 48, 61, 54, 81]
m = 4
α, β, γ = 0.5, 0.3, 0.3
# Início clássico: nível = média do ano 1; tendência = (média do ano 2 − média do ano 1)/m;
# sazonalidade = valores do ano 1 menos o nível
nivel = mean(vendas[1:m])
tendencia = (mean(vendas[m+1:2m]) - mean(vendas[1:m])) / m
sazonal = vendas[1:m] .- nivel
for t in m+1:length(vendas)
    s = sazonal[t-m]
    novo_nivel = α * (vendas[t] - s) + (1 - α) * (nivel + tendencia)
    nova_tendencia = β * (novo_nivel - nivel) + (1 - β) * tendencia
    push!(sazonal, γ * (vendas[t] - nivel - tendencia) + (1 - γ) * s)
    global nivel, tendencia = novo_nivel, nova_tendencia
    t == m + 1 &amp;&amp; println("Depois de t = 5: nível = ", nivel, "  tendência = ", tendencia, "  sazonal T1 = ", sazonal[end])
end
previsao = [nivel + h * tendencia + sazonal[end-m+mod1(h, m)] for h in 1:4]
println("Holt-Winters: previsão do ano 4 = ", round.(previsao, digits = 2))</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">SES: previsão para a semana 9 = 35.3964   σ = 3.1676
Intervalo de 95% (h = 1): [29.19; 41.6]
Depois de t = 5: nível = 54.5625  tendência = 1.55625  sazonal T1 = -11.1375
Holt-Winters: previsão do ano 4 = [52.7, 65.22, 59.31, 85.63]</pre>
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
    <pre><code># 1. Suavização exponencial simples: chamados por semana (números ilustrativos)
chamados &lt;- c(30, 34, 31, 35, 33, 38, 36, 37)
alfa &lt;- 0.3
nivel &lt;- chamados[1]                          # início: o primeiro valor
erros &lt;- numeric(0)                           # erros de previsão um passo à frente
for (t in 2:length(chamados)) {
  erros &lt;- c(erros, chamados[t] - nivel)
  nivel &lt;- alfa * chamados[t] + (1 - alfa) * nivel
}
sigma &lt;- sqrt(mean(erros^2))
cat("SES: previsão para a semana 9 =", round(nivel, 4), "  σ =", round(sigma, 4), "\n")
cat(sprintf("Intervalo de 95%% (h = 1): [%.2f; %.2f]\n", nivel - 1.96 * sigma, nivel + 1.96 * sigma))

# 2. Holt-Winters aditivo (m = 4) nas vendas trimestrais, com α, β, γ fixos
vendas &lt;- c(40, 52, 46, 70, 44, 56, 50, 76, 48, 61, 54, 81)
m &lt;- 4
alfa &lt;- 0.5; beta &lt;- 0.3; gama &lt;- 0.3
# Início clássico: nível = média do ano 1; tendência = (média do ano 2 − média do ano 1)/m;
# sazonalidade = valores do ano 1 menos o nível
nivel &lt;- mean(vendas[1:m])
tendencia &lt;- (mean(vendas[(m + 1):(2 * m)]) - mean(vendas[1:m])) / m
sazonal &lt;- vendas[1:m] - nivel
for (t in (m + 1):length(vendas)) {
  s &lt;- sazonal[t - m]
  novo_nivel &lt;- alfa * (vendas[t] - s) + (1 - alfa) * (nivel + tendencia)
  nova_tendencia &lt;- beta * (novo_nivel - nivel) + (1 - beta) * tendencia
  sazonal[t] &lt;- gama * (vendas[t] - nivel - tendencia) + (1 - gama) * s
  nivel &lt;- novo_nivel; tendencia &lt;- nova_tendencia
  if (t == m + 1) cat("Depois de t = 5: nível =", nivel, " tendência =", tendencia, " sazonal T1 =", sazonal[t], "\n")
}
h &lt;- 1:4
previsao &lt;- nivel + h * tendencia + sazonal[length(sazonal) - m + ((h - 1) %% m) + 1]
cat("Holt-Winters: previsão do ano 4 =", round(previsao, 2), "\n")</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">SES: previsão para a semana 9 = 35.3964   σ = 3.1676 
Intervalo de 95% (h = 1): [29.19; 41.60]
Depois de t = 5: nível = 54.5625  tendência = 1.55625  sazonal T1 = -11.1375 
Holt-Winters: previsão do ano 4 = 52.7 65.22 59.31 85.63</pre>
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

# 1. Suavização exponencial simples: chamados por semana (números ilustrativos)
chamados = [30, 34, 31, 35, 33, 38, 36, 37]
alfa = 0.3
nivel = chamados[0]                           # início: o primeiro valor
erros = []                                    # erros de previsão um passo à frente
for y in chamados[1:]:
    erros.append(y - nivel)
    nivel = alfa * y + (1 - alfa) * nivel
sigma = np.sqrt(np.mean(np.square(erros)))
print(f"SES: previsão para a semana 9 = {nivel:.4f}   σ = {sigma:.4f}")
print(f"Intervalo de 95% (h = 1): [{nivel - 1.96 * sigma:.2f}; {nivel + 1.96 * sigma:.2f}]")

# 2. Holt-Winters aditivo (m = 4) nas vendas trimestrais, com α, β, γ fixos
vendas = np.array([40, 52, 46, 70, 44, 56, 50, 76, 48, 61, 54, 81], dtype=float)
m = 4
alfa, beta, gama = 0.5, 0.3, 0.3
# Início clássico: nível = média do ano 1; tendência = (média do ano 2 − média do ano 1)/m;
# sazonalidade = valores do ano 1 menos o nível
nivel = vendas[:m].mean()
tendencia = (vendas[m:2 * m].mean() - vendas[:m].mean()) / m
sazonal = list(vendas[:m] - nivel)
for t in range(m, len(vendas)):              # índice 0: t = 1
    s = sazonal[t - m]
    novo_nivel = alfa * (vendas[t] - s) + (1 - alfa) * (nivel + tendencia)
    nova_tendencia = beta * (novo_nivel - nivel) + (1 - beta) * tendencia
    sazonal.append(gama * (vendas[t] - nivel - tendencia) + (1 - gama) * s)
    nivel, tendencia = novo_nivel, nova_tendencia
    if t == m:
        print(f"Depois de t = 5: nível = {nivel}  tendência = {tendencia}  sazonal T1 = {sazonal[-1]}")
previsao = [nivel + h * tendencia + sazonal[len(sazonal) - m + (h - 1) % m] for h in range(1, 5)]
print("Holt-Winters: previsão do ano 4 =", np.round(previsao, 2))</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">SES: previsão para a semana 9 = 35.3964   σ = 3.1676
Intervalo de 95% (h = 1): [29.19; 41.60]
Depois de t = 5: nível = 54.5625  tendência = 1.55625  sazonal T1 = -11.1375
Holt-Winters: previsão do ano 4 = [52.7  65.22 59.31 85.63]</pre>
</div>
  </div>
</div>

As funções prontas fazem o mesmo com outros detalhes: `HoltWinters()` no R (pacote `stats`) e `ExponentialSmoothing` no statsmodels do Python. Elas usam outras inicializações e outros otimizadores para escolher $\alpha$, $\beta$, $\gamma$, então os números saem um pouco diferentes dos desta página; por isso o código acima escreve as equações à mão, iguais nas três linguagens.

---

## 7. Estacionariedade, Diferenças e Modelos ARIMA

### 7.1 Estacionariedade

Uma série é (fracamente) **estacionária** quando a média e a variância não mudam com o tempo e a correlação entre $y\_t$ e $y\_{t+k}$ depende só da distância $k$. Séries com tendência ou sazonalidade **não** são estacionárias. Os modelos ARIMA descrevem séries estacionárias; por isso o primeiro passo é torná-la estacionária.

### 7.2 Diferenças

A **diferença simples** $\Delta y\_t = y\_t - y\_{t-1}$ tira uma tendência; a **diferença sazonal** $y\_t - y\_{t-m}$ tira a sazonalidade de período $m$. Nas vendas trimestrais da seção 5:

| $t$ | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| $y\_t$ | 40 | 52 | 46 | 70 | 44 | 56 | 50 | 76 | 48 | 61 | 54 | 81 |
| $y\_t - y\_{t-1}$ | | 12 | −6 | 24 | −26 | 12 | −6 | 26 | −28 | 13 | −7 | 27 |
| $z\_t = y\_t - y\_{t-4}$ | | | | | 4 | 4 | 4 | 6 | 4 | 5 | 4 | 5 |

A diferença simples ainda oscila muito (a sazonalidade continua lá); a diferença sazonal $z\_t$ fica estável, entre 4 e 6: é o crescimento de cada trimestre em relação ao mesmo trimestre do ano anterior. Por exemplo, $z\_5 = 44 - 40 = 4$ e $z\_8 = 76 - 70 = 6$.

### 7.3 Teste de raiz unitária (ADF)

O **teste de Dickey-Fuller aumentado** (ADF) ajuda a decidir se a série precisa de diferença. Ele ajusta, por mínimos quadrados, a regressão

$$
\Delta y_t = a + \rho\,y_{t-1} + \delta_1 \Delta y_{t-1} + \cdots + \delta_k \Delta y_{t-k} + \varepsilon_t
$$

e testa $H\_0: \rho = 0$ (a série tem "raiz unitária", isto é, precisa de diferença) contra $H\_1: \rho < 0$ (é estacionária). A estatística é $\hat{\rho}/EP(\hat{\rho})$, mas sob $H\_0$ ela **não** segue a distribuição t de Student: os valores críticos são próprios do teste (para $n \approx 100$, com constante, cerca de −3,50 a 1%, −2,89 a 5% e −2,58 a 10%). Rejeita-se $H\_0$ quando a estatística fica **abaixo** do valor crítico. As $k$ defasagens de $\Delta y$ absorvem a autocorrelação dos erros.

Na produção de veículos (2010–2018):

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
    <pre><code>using Downloads, JSON, HypothesisTests

url = "https://api.bcb.gov.br/dados/serie/bcdata.sgs.1373/dados?formato=json&amp;dataInicial=01/01/2010&amp;dataFinal=31/12/2018"
dados = JSON.parse(String(take!(Downloads.download(url, IOBuffer()))))
producao = [parse(Float64, d["valor"]) for d in dados] ./ 1000   # mil veículos, 2010–2018
z = producao[13:end] .- producao[1:end-12]                       # diferença sazonal

# Teste ADF à mão: Δy_t = a + ρ y_{t−1} + Σ δ_i Δy_{t−i} + erro; a estatística é ρ̂ / EP(ρ̂)
function adf(y, k)
    dy = diff(y)
    linhas = k+1:length(dy)
    X = hcat(ones(length(linhas)), y[linhas], [dy[t-i] for t in linhas, i in 1:k])
    coef = X \ dy[linhas]
    res = dy[linhas] .- X * coef
    s2 = sum(res .^ 2) / (length(linhas) - size(X, 2))
    return coef[2] / sqrt(s2 * inv(X' * X)[2, 2])
end

for (nome, serie) in [("nível", producao), ("diferença sazonal", z)], k in (0, 12)
    teste = ADFTest(serie, :constant, k)          # conferência com o HypothesisTests.jl
    println(rpad("ADF ($nome, k = $k):", 34), round(adf(serie, k), digits = 3),
            "   HypothesisTests: ", round(teste.stat, digits = 3), "   p-valor = ", round(pvalue(teste), digits = 4))
end</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">ADF (nível, k = 0):               -3.623   HypothesisTests: -3.623   p-valor = 0.0053
ADF (nível, k = 12):              -1.129   HypothesisTests: -1.129   p-valor = 0.7034
ADF (diferença sazonal, k = 0):   -4.338   HypothesisTests: -4.338   p-valor = 0.0004
ADF (diferença sazonal, k = 12):  -2.264   HypothesisTests: -2.264   p-valor = 0.1839</pre>
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
    <pre><code>library(jsonlite)

url &lt;- "https://api.bcb.gov.br/dados/serie/bcdata.sgs.1373/dados?formato=json&amp;dataInicial=01/01/2010&amp;dataFinal=31/12/2018"
producao &lt;- as.numeric(fromJSON(url)$valor) / 1000   # mil veículos, 2010–2018
z &lt;- diff(producao, lag = 12)                         # diferença sazonal

# Teste ADF à mão: Δy_t = a + ρ y_{t−1} + Σ δ_i Δy_{t−i} + erro; a estatística é ρ̂ / EP(ρ̂).
# (tseries::adf.test inclui uma tendência linear na regressão e escolhe k sozinho,
# por isso dá outro número; aqui a regressão é a mesma das versões em Julia e Python.)
adf &lt;- function(y, k) {
  dy &lt;- diff(y)
  linhas &lt;- (k + 1):length(dy)
  if (k &gt; 0) {
    defasagens &lt;- sapply(seq_len(k), function(i) dy[linhas - i])
    ajuste &lt;- lm(dy[linhas] ~ y[linhas] + defasagens)
  } else {
    ajuste &lt;- lm(dy[linhas] ~ y[linhas])
  }
  summary(ajuste)$coefficients[2, "t value"]
}

for (serie in list(list("nível", producao), list("diferença sazonal", z))) {
  for (k in c(0, 12)) {
    cat(format(sprintf("ADF (%s, k = %d):", serie[[1]], k), width = 34), round(adf(serie[[2]], k), 3), "\n")
  }
}</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">ADF (nível, k = 0):                -3.623 
ADF (nível, k = 12):               -1.129 
ADF (diferença sazonal, k = 0):    -4.338 
ADF (diferença sazonal, k = 12):   -2.264</pre>
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
import pandas as pd
from statsmodels.tsa.stattools import adfuller

url = ("https://api.bcb.gov.br/dados/serie/bcdata.sgs.1373/dados?formato=json"
       "&amp;dataInicial=01/01/2010&amp;dataFinal=31/12/2018")
dados = pd.read_json(url, storage_options={"User-Agent": "Mozilla/5.0"})
producao = dados["valor"].astype(float).to_numpy() / 1000    # mil veículos, 2010–2018
z = producao[12:] - producao[:-12]                            # diferença sazonal

def adf(y, k):
    """Teste ADF à mão: Δy_t = a + ρ y_{t−1} + Σ δ_i Δy_{t−i} + erro; a estatística é ρ̂ / EP(ρ̂)."""
    dy = np.diff(y)
    linhas = np.arange(k, len(dy))
    X = np.column_stack([np.ones(len(linhas)), y[linhas]] + [dy[linhas - i] for i in range(1, k + 1)])
    coef, *_ = np.linalg.lstsq(X, dy[linhas], rcond=None)
    res = dy[linhas] - X @ coef
    s2 = res @ res / (len(linhas) - X.shape[1])
    return coef[1] / np.sqrt(s2 * np.linalg.inv(X.T @ X)[1, 1])

for nome, serie in [("nível", producao), ("diferença sazonal", z)]:
    for k in (0, 12):
        teste = adfuller(serie, maxlag=k, regression="c", autolag=None, result_object=True)  # conferência
        print(f"{'ADF (' + nome + ', k = ' + str(k) + '):':34s}{adf(serie, k):.3f}"
              f"   statsmodels: {teste.statistic:.3f}   p-valor = {teste.pvalue:.4f}")</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">ADF (nível, k = 0):               -3.623   statsmodels: -3.623   p-valor = 0.0053
ADF (nível, k = 12):              -1.129   statsmodels: -1.129   p-valor = 0.7034
ADF (diferença sazonal, k = 0):   -4.338   statsmodels: -4.338   p-valor = 0.0004
ADF (diferença sazonal, k = 12):  -2.264   statsmodels: -2.264   p-valor = 0.1839</pre>
</div>
  </div>
</div>

| Série | $k = 0$ | $k = 12$ |
|---|---|---|
| Nível | −3,623 (p-valor 0,0053) | −1,129 (p-valor 0,7034) |
| Diferença sazonal | −4,338 (p-valor 0,0004) | −2,264 (p-valor 0,1839) |

**Interpretação.** A conclusão **depende do número de defasagens**: sem defasagens, o teste rejeita a raiz unitária nas duas séries; com 12 (um ano de defasagens), não rejeita em nenhuma. Com cerca de 100 meses e uma queda forte no meio (2015–2016), o teste tem pouco poder, e "não rejeitar" não prova que a série precise de diferença. Use o teste junto com os gráficos: o nível da produção claramente muda ao longo dos anos, e a sazonalidade é forte, então a diferença sazonal é uma escolha razoável.

### 7.4 Modelo autorregressivo AR(1)

Num **modelo autorregressivo de ordem 1**, cada valor depende do anterior:

$$
z_t = c + \phi\,z_{t-1} + \varepsilon_t
$$

com $\varepsilon\_t$ independentes, de média zero e variância $\sigma^2$. Se $\lvert\phi\rvert < 1$, a série é estacionária e oscila em torno da média de longo prazo $c/(1 - \phi)$. Os parâmetros podem ser estimados por [mínimos quadrados]({{ '/pt/analise-de-dados/regressao-linear' | relative_url }}), regredindo $z\_t$ em $z\_{t-1}$.

**Exemplo à mão:** AR(1) na diferença sazonal $z = 4, 4, 4, 6, 4, 5, 4, 5$ das vendas. Os pares (anterior $x = z\_{t-1}$; atual $w = z\_t$) são 7: $\bar{x} = 31/7 \approx 4{,}4286$ e $\bar{w} = 32/7 \approx 4{,}5714$.

| $x = z\_{t-1}$ | $w = z\_t$ | $x - \bar{x}$ | $w - \bar{w}$ | $(x - \bar{x})(w - \bar{w})$ | $(x - \bar{x})^2$ |
|---|---|---|---|---|---|
| 4 | 4 | −0,4286 | −0,5714 | 0,2449 | 0,1837 |
| 4 | 4 | −0,4286 | −0,5714 | 0,2449 | 0,1837 |
| 4 | 6 | −0,4286 | 1,4286 | −0,6122 | 0,1837 |
| 6 | 4 | 1,5714 | −0,5714 | −0,8980 | 2,4694 |
| 4 | 5 | −0,4286 | 0,4286 | −0,1837 | 0,1837 |
| 5 | 4 | 0,5714 | −0,5714 | −0,3265 | 0,3265 |
| 4 | 5 | −0,4286 | 0,4286 | −0,1837 | 0,1837 |
| **Soma** | | | | $-12/7 \approx -1{,}7143$ | $26/7 \approx 3{,}7143$ |

$$
\hat{\phi} = \frac{-12/7}{26/7} = -\frac{12}{26} = -\frac{6}{13} \approx -0{,}4615 \qquad
\hat{c} = \bar{w} - \hat{\phi}\,\bar{x} = \frac{32}{7} + \frac{6}{13} \times \frac{31}{7} = \frac{416 + 186}{91} = \frac{602}{91} = \frac{86}{13} \approx 6{,}6154
$$

A média de longo prazo é $\hat{c}/(1 - \hat{\phi}) = (86/13)/(19/13) = 86/19 \approx 4{,}53$: o crescimento anual de cada trimestre oscila em torno de R\\$ 4,5 mil, e o $\phi$ negativo diz que um crescimento acima da média tende a ser seguido de um abaixo.

**Previsão.** O último $z$ é $z\_{12} = 5$. Então $\hat{z}\_{13} = 86/13 - (6/13) \times 5 = 56/13 \approx 4{,}3077$, e cada passo seguinte usa a previsão anterior: 4,6272; 4,4797; 4,5478. Como $z\_t = y\_t - y\_{t-4}$, a previsão das vendas é o mesmo trimestre do ano 3 mais a diferença prevista: $48 + 4{,}3077 = 52{,}31$; $61 + 4{,}6272 = 65{,}63$; $54 + 4{,}4797 = 58{,}48$; $81 + 4{,}5478 = 85{,}55$ (R\\$ mil). Três métodos diferentes (decomposição, Holt-Winters e este) dão previsões parecidas para o ano 4.

**Intervalo de previsão no AR(1).** Com erros normais, a variância do erro de previsão a $h$ passos é $\sigma^2(1 + \phi^2 + \phi^4 + \cdots + \phi^{2(h-1)})$, que cresce com $h$ e se estabiliza em $\sigma^2/(1 - \phi^2)$. O intervalo de 95% é a previsão $\pm 1{,}96$ vezes a raiz dessa variância. A seção 9 aplica isso aos dados reais.

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
    <pre><code>using Statistics

vendas = [40, 52, 46, 70, 44, 56, 50, 76, 48, 61, 54, 81]

# Diferenças: simples (t − 1) e sazonal (t − 4)
println("Diferença simples:  ", diff(vendas))
z = vendas[5:end] .- vendas[1:end-4]
println("Diferença sazonal:  ", z)

# AR(1) na diferença sazonal: z_t = c + φ z_{t−1} + erro, por mínimos quadrados
x, w = z[1:end-1], z[2:end]
φ = sum((x .- mean(x)) .* (w .- mean(w))) / sum((x .- mean(x)) .^ 2)
c = mean(w) - φ * mean(x)
println("φ = ", round(φ, digits = 4), "   c = ", round(c, digits = 4), "   média de longo prazo = ", round(c / (1 - φ), digits = 4))

# Previsão: prevê as diferenças e soma ao mesmo trimestre do ano anterior
zprev = Float64[]
anterior = z[end]
for h in 1:4
    global anterior = c + φ * anterior
    push!(zprev, anterior)
end
println("Diferenças previstas: ", round.(zprev, digits = 4))
println("Previsão do ano 4:    ", round.(vendas[9:12] .+ zprev, digits = 2))</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">Diferença simples:  [12, -6, 24, -26, 12, -6, 26, -28, 13, -7, 27]
Diferença sazonal:  [4, 4, 4, 6, 4, 5, 4, 5]
φ = -0.4615   c = 6.6154   média de longo prazo = 4.5263
Diferenças previstas: [4.3077, 4.6272, 4.4797, 4.5478]
Previsão do ano 4:    [52.31, 65.63, 58.48, 85.55]</pre>
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
    <pre><code>vendas &lt;- c(40, 52, 46, 70, 44, 56, 50, 76, 48, 61, 54, 81)

# Diferenças: simples (t − 1) e sazonal (t − 4)
cat("Diferença simples: ", diff(vendas), "\n")
z &lt;- diff(vendas, lag = 4)
cat("Diferença sazonal: ", z, "\n")

# AR(1) na diferença sazonal: z_t = c + φ z_{t−1} + erro, por mínimos quadrados
x &lt;- z[-length(z)]; w &lt;- z[-1]
ajuste &lt;- lm(w ~ x)
const &lt;- coef(ajuste)[[1]]; fi &lt;- coef(ajuste)[[2]]
cat("φ =", round(fi, 4), "  c =", round(const, 4), "  média de longo prazo =", round(const / (1 - fi), 4), "\n")

# Previsão: prevê as diferenças e soma ao mesmo trimestre do ano anterior
zprev &lt;- numeric(4)
anterior &lt;- z[length(z)]
for (h in 1:4) { anterior &lt;- const + fi * anterior; zprev[h] &lt;- anterior }
cat("Diferenças previstas:", round(zprev, 4), "\n")
cat("Previsão do ano 4:   ", round(vendas[9:12] + zprev, 2), "\n")</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">Diferença simples:  12 -6 24 -26 12 -6 26 -28 13 -7 27 
Diferença sazonal:  4 4 4 6 4 5 4 5 
φ = -0.4615   c = 6.6154   média de longo prazo = 4.5263 
Diferenças previstas: 4.3077 4.6272 4.4797 4.5478 
Previsão do ano 4:    52.31 65.63 58.48 85.55</pre>
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

vendas = np.array([40, 52, 46, 70, 44, 56, 50, 76, 48, 61, 54, 81])

# Diferenças: simples (t − 1) e sazonal (t − 4)
print("Diferença simples: ", np.diff(vendas))
z = vendas[4:] - vendas[:-4]
print("Diferença sazonal: ", z)

# AR(1) na diferença sazonal: z_t = c + φ z_{t−1} + erro, por mínimos quadrados
x, w = z[:-1], z[1:]
fi, c = np.polyfit(x, w, 1)
print(f"φ = {fi:.4f}   c = {c:.4f}   média de longo prazo = {c / (1 - fi):.4f}")

# Previsão: prevê as diferenças e soma ao mesmo trimestre do ano anterior
zprev, anterior = [], z[-1]
for h in range(4):
    anterior = c + fi * anterior
    zprev.append(anterior)
print("Diferenças previstas:", np.round(zprev, 4))
print("Previsão do ano 4:   ", np.round(vendas[8:] + np.array(zprev), 2))</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">Diferença simples:  [ 12  -6  24 -26  12  -6  26 -28  13  -7  27]
Diferença sazonal:  [4 4 4 6 4 5 4 5]
φ = -0.4615   c = 6.6154   média de longo prazo = 4.5263
Diferenças previstas: [4.3077 4.6272 4.4797 4.5478]
Previsão do ano 4:    [52.31 65.63 58.48 85.55]</pre>
</div>
  </div>
</div>

### 7.5 A família ARIMA

O AR(1) é o caso mais simples de uma família:

- **AR($p$)**: $z\_t$ depende de $z\_{t-1}, \ldots, z\_{t-p}$;
- **MA($q$)**: $z\_t$ depende dos **erros** passados $\varepsilon\_{t-1}, \ldots, \varepsilon\_{t-q}$ ("médias móveis" dos erros, outro sentido da expressão da seção 3);
- **ARIMA($p$, $d$, $q$)**: AR($p$) e MA($q$) aplicados à série depois de $d$ diferenças simples;
- **SARIMA($p$, $d$, $q$)($P$, $D$, $Q$)$\_m$**: acrescenta termos sazonais e $D$ diferenças sazonais de período $m$. O modelo do exemplo acima, um AR(1) na diferença sazonal, é um SARIMA(1, 0, 0)(0, 1, 0)$\_4$.

Com termos MA, os erros passados não são observados, e a estimação exige máxima verossimilhança, feita por funções como `arima()` no R (pacote `stats`) e `SARIMAX` no statsmodels. A escolha de $p$ e $q$ costuma usar o correlograma e a PACF (seção 4) e critérios como o AIC, sempre conferindo se os resíduos do modelo ficaram sem autocorrelação.

---

## 8. Medindo o Erro, Validando e Construindo Intervalos

### 8.1 Medidas de erro

Com os valores reais $y\_t$ e as previsões $\hat{y}\_t$ de $n$ períodos, o erro é $e\_t = y\_t - \hat{y}\_t$. As medidas mais usadas:

$$
\text{EAM} = \frac{1}{n}\sum \lvert e_t \rvert \qquad
\text{REQM} = \sqrt{\frac{1}{n}\sum e_t^2} \qquad
\text{EPAM} = \frac{100\%}{n}\sum \left\lvert \frac{e_t}{y_t} \right\rvert
$$

- **EAM** (erro absoluto médio): o erro típico, na unidade da série;
- **REQM** (raiz do erro quadrático médio): também na unidade da série, mas pesa mais os erros grandes; é sempre maior ou igual ao EAM;
- **EPAM** (erro percentual absoluto médio): o erro em porcentagem do valor real; permite comparar séries de escalas diferentes, mas não funciona com valores iguais ou próximos de zero.

**Exemplo à mão.** Na validação da decomposição (ajustada com os anos 1 e 2, prevendo o ano 3; previsões exatas $1373/28$, $3413/56$, $775/14$ e $4453/56$):

| Trimestre | Real $y\_t$ | Previsão $\hat{y}\_t$ | $e\_t$ | $\lvert e\_t \rvert$ | $e\_t^2$ | $\lvert e\_t \rvert / y\_t$ |
|---|---|---|---|---|---|---|
| T1 | 48 | 49,0357 | −1,0357 | 1,0357 | 1,0727 | 0,02158 |
| T2 | 61 | 60,9464 | 0,0536 | 0,0536 | 0,0029 | 0,00088 |
| T3 | 54 | 55,3571 | −1,3571 | 1,3571 | 1,8418 | 0,02513 |
| T4 | 81 | 79,5179 | 1,4821 | 1,4821 | 2,1967 | 0,01830 |
| **Soma** | | | | **3,9286** | **5,1142** | **0,06589** |

$$
\text{EAM} = \frac{3{,}9286}{4} = 0{,}98 \qquad
\text{REQM} = \sqrt{\frac{5{,}1142}{4}} = \sqrt{1{,}2785} = 1{,}13 \qquad
\text{EPAM} = \frac{100\% \times 0{,}06589}{4} = 1{,}65\%
$$

Em média, a decomposição errou cerca de R\\$ 1 mil por trimestre, ou 1,65% das vendas. O método ingênuo sazonal (repetir o ano 2) teve EAM 4,50, REQM 4,53 e EPAM 7,53%.

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
    <pre><code>using Statistics

vendas = [40, 52, 46, 70, 44, 56, 50, 76, 48, 61, 54, 81]
trimestre(t) = mod1(t, 4)

# Mesmo método da decomposição, usando só os dados passados em `serie`
function prever(serie, horizonte)
    n = length(serie)
    mm = [(serie[t-2]/2 + serie[t-1] + serie[t] + serie[t+1] + serie[t+2]/2) / 4 for t in 3:n-2]
    desvios = serie[3:n-2] .- mm
    bruto = [mean(desvios[i] for (i, t) in enumerate(3:n-2) if trimestre(t) == q) for q in 1:4]
    efeito = bruto .- mean(bruto)
    dessaz = [serie[t] - efeito[trimestre(t)] for t in 1:n]
    tempo = 1:n
    b = sum((tempo .- mean(tempo)) .* (dessaz .- mean(dessaz))) / sum((tempo .- mean(tempo)) .^ 2)
    a = mean(dessaz) - b * mean(tempo)
    return [a + b * t + efeito[trimestre(t)] for t in n+1:n+horizonte]
end

# Validação temporal: ajusta com os anos 1 e 2 e prevê o ano 3, que já é conhecido
treino, teste = vendas[1:8], vendas[9:12]
decomposicao = prever(treino, 4)
ingenuo = treino[5:8]                      # método ingênuo sazonal: repete o ano anterior

eam(p)  = mean(abs.(teste .- p))                   # erro absoluto médio
reqm(p) = sqrt(mean((teste .- p) .^ 2))            # raiz do erro quadrático médio
epam(p) = 100 * mean(abs.((teste .- p) ./ teste))  # erro percentual absoluto médio (%)

println("Real (ano 3):    ", teste)
for (nome, p) in [("Decomposição", decomposicao), ("Ingênuo sazonal", ingenuo)]
    println(rpad(nome, 17), round.(p, digits = 2), "   EAM = ", round(eam(p), digits = 2),
            "   REQM = ", round(reqm(p), digits = 2), "   EPAM = ", round(epam(p), digits = 2), "%")
end</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">Real (ano 3):    [48, 61, 54, 81]
Decomposição     [49.04, 60.95, 55.36, 79.52]   EAM = 0.98   REQM = 1.13   EPAM = 1.65%
Ingênuo sazonal  [44.0, 56.0, 50.0, 76.0]   EAM = 4.5   REQM = 4.53   EPAM = 7.53%</pre>
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
    <pre><code>vendas &lt;- c(40, 52, 46, 70, 44, 56, 50, 76, 48, 61, 54, 81)
trimestre &lt;- function(t) (t - 1) %% 4 + 1

# Mesmo método da decomposição, usando só os dados passados em `serie`
prever &lt;- function(serie, horizonte) {
  n &lt;- length(serie)
  mm &lt;- sapply(3:(n - 2), function(t)
    (serie[t - 2] / 2 + serie[t - 1] + serie[t] + serie[t + 1] + serie[t + 2] / 2) / 4)
  bruto &lt;- tapply(serie[3:(n - 2)] - mm, trimestre(3:(n - 2)), mean)
  efeito &lt;- bruto - mean(bruto)
  dessaz &lt;- serie - efeito[trimestre(1:n)]
  tempo &lt;- 1:n
  b &lt;- coef(lm(dessaz ~ tempo))
  futuro &lt;- (n + 1):(n + horizonte)
  b[[1]] + b[[2]] * futuro + efeito[trimestre(futuro)]
}

# Validação temporal: ajusta com os anos 1 e 2 e prevê o ano 3, que já é conhecido
treino &lt;- vendas[1:8]; teste &lt;- vendas[9:12]
decomposicao &lt;- prever(treino, 4)
ingenuo &lt;- treino[5:8]                       # método ingênuo sazonal: repete o ano anterior

eam  &lt;- function(p) mean(abs(teste - p))                 # erro absoluto médio
reqm &lt;- function(p) sqrt(mean((teste - p)^2))            # raiz do erro quadrático médio
epam &lt;- function(p) 100 * mean(abs((teste - p) / teste)) # erro percentual absoluto médio (%)

cat("Real (ano 3):   ", teste, "\n")
for (metodo in list(list("Decomposição", decomposicao), list("Ingênuo sazonal", ingenuo))) {
  p &lt;- metodo[[2]]
  cat(format(metodo[[1]], width = 16), round(p, 2), "  EAM =", round(eam(p), 2),
      "  REQM =", round(reqm(p), 2), "  EPAM =", paste0(round(epam(p), 2), "%"), "\n")
}</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">Real (ano 3):    48 61 54 81 
Decomposição     49.04 60.95 55.36 79.52   EAM = 0.98   REQM = 1.13   EPAM = 1.65% 
Ingênuo sazonal  44 56 50 76   EAM = 4.5   REQM = 4.53   EPAM = 7.53%</pre>
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

vendas = np.array([40, 52, 46, 70, 44, 56, 50, 76, 48, 61, 54, 81], dtype=float)
trimestre = lambda t: (t - 1) % 4 + 1

def prever(serie, horizonte):
    """Mesmo método da decomposição, usando só os dados passados em `serie`."""
    n = len(serie)
    mm = np.convolve(serie, [1/8, 1/4, 1/4, 1/4, 1/8], mode="valid")
    t_mm = np.arange(3, n - 1)
    desvios = serie[2:n - 2] - mm
    bruto = np.array([desvios[trimestre(t_mm) == q].mean() for q in range(1, 5)])
    efeito = bruto - bruto.mean()
    tempo = np.arange(1, n + 1)
    b, a = np.polyfit(tempo, serie - efeito[trimestre(tempo) - 1], 1)
    futuro = np.arange(n + 1, n + horizonte + 1)
    return a + b * futuro + efeito[trimestre(futuro) - 1]

# Validação temporal: ajusta com os anos 1 e 2 e prevê o ano 3, que já é conhecido
treino, teste = vendas[:8], vendas[8:]
decomposicao = prever(treino, 4)
ingenuo = treino[4:8]                          # método ingênuo sazonal: repete o ano anterior

eam  = lambda p: np.mean(np.abs(teste - p))                 # erro absoluto médio
reqm = lambda p: np.sqrt(np.mean((teste - p) ** 2))         # raiz do erro quadrático médio
epam = lambda p: 100 * np.mean(np.abs((teste - p) / teste)) # erro percentual absoluto médio (%)

print("Real (ano 3):    ", teste)
for nome, p in [("Decomposição", decomposicao), ("Ingênuo sazonal", ingenuo)]:
    print(f"{nome:16s}", np.round(p, 2), f"  EAM = {eam(p):.2f}   REQM = {reqm(p):.2f}   EPAM = {epam(p):.2f}%")</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">Real (ano 3):     [48. 61. 54. 81.]
Decomposição     [49.04 60.95 55.36 79.52]   EAM = 0.98   REQM = 1.13   EPAM = 1.65%
Ingênuo sazonal  [44. 56. 50. 76.]   EAM = 4.50   REQM = 4.53   EPAM = 7.53%</pre>
</div>
  </div>
</div>

### 8.2 Validação no tempo

Um modelo sempre parece bom nos dados usados para ajustá-lo. Para saber se ele **prevê**, separe o final da série, ajuste com o começo e compare a previsão com o que aconteceu. Em séries temporais, o teste vem sempre **depois** do treino: sortear observações ao acaso, como se faz em outros problemas, deixaria o modelo "ver o futuro".

Com uma única divisão, o resultado depende muito do período escolhido. A **validação com origem móvel** (ou janela deslizante) repete a conta várias vezes: ajusta com os dados até o mês $t$, prevê o mês $t + 1$ (ou os $h$ seguintes), avança um mês e repete; o erro final é a média de todas essas previsões. É mais trabalhosa, mas dá uma ideia mais estável do erro.

E compare sempre com um **método ingênuo** (repetir o último valor, ou o mesmo período do ano anterior): um método só vale a pena se for melhor que ele.

### 8.3 Intervalos de previsão

Uma previsão sem margem de erro esconde a incerteza. Um **intervalo de previsão** de 95% é uma faixa que, se o modelo estiver certo, contém o valor futuro em 95% dos casos. Ele:

- cresce com o horizonte $h$ (prever longe é mais incerto);
- depende das hipóteses do modelo (erros independentes, muitas vezes normais) e não inclui a incerteza sobre o próprio modelo ou sobre os parâmetros estimados, por isso tende a ser **estreito demais** na prática;
- é diferente de um intervalo de confiança para a média: ele é sobre o **valor** que vai acontecer.

As seções 6.2 e 7.4 deram as fórmulas para a suavização simples e para o AR(1).

---

## 9. Exemplo com Dados Reais: Previsão da Produção de Veículos

**Pergunta.** Com a produção mensal de veículos de janeiro de 2010 a dezembro de 2018 (treino, 108 meses), qual método teria previsto melhor os 12 meses de 2019 (teste)?

**Dados.** Série 1373 do SGS do Banco Central (fonte primária: Anfavea), em milhares de veículos; licença e data de acesso no quadro da seção 2. Os dados de 2019 e 2020 ficam de fora do ajuste e servem só para conferir.

**Métodos**, todos ajustados só com o treino:

1. **Ingênuo sazonal**: cada mês de 2019 repete o mesmo mês de 2018.
2. **Holt-Winters aditivo** (seção 6.2), com $\alpha$, $\beta$ e $\gamma$ escolhidos numa grade de 0 a 1, de 0,05 em 0,05, pela menor soma dos quadrados dos erros um passo à frente. A grade escolheu $\alpha = 0{,}4$, $\beta = 0$ e $\gamma = 0{,}1$; $\beta = 0$ quer dizer que a tendência ficou fixa no valor inicial.
3. **AR(1) na diferença sazonal** (seção 7.4): $z\_t = y\_t - y\_{t-12}$, $z\_t = c + \phi z\_{t-1} + \varepsilon\_t$. As estimativas foram $\hat{c} = -2{,}147$, $\hat{\phi} = 0{,}6604$ e $\hat{\sigma} = 35{,}47$ mil veículos.

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
    <pre><code>using Downloads, JSON, Dates, Statistics, Plots

url = "https://api.bcb.gov.br/dados/serie/bcdata.sgs.1373/dados?formato=json&amp;dataInicial=01/01/2010&amp;dataFinal=31/12/2020"
dados = JSON.parse(String(take!(Downloads.download(url, IOBuffer()))))
datas = [Date(d["data"], dateformat"dd/mm/yyyy") for d in dados]
producao = [parse(Float64, d["valor"]) for d in dados] ./ 1000   # mil veículos
treino, teste = producao[1:108], producao[109:120]               # 2010–2018 e 2019
m = 12

# Método 1: ingênuo sazonal (repete 2018)
ingenuo = treino[end-m+1:end]

# Método 2: Holt-Winters aditivo, α, β, γ escolhidos por busca em grade
function holt_winters(y, α, β, γ, m)
    nivel = mean(y[1:m]); tendencia = (mean(y[m+1:2m]) - mean(y[1:m])) / m
    sazonal = y[1:m] .- nivel; sqe = 0.0
    for t in m+1:length(y)
        s = sazonal[t-m]
        sqe += (y[t] - (nivel + tendencia + s))^2          # erro de previsão um passo à frente
        novo_nivel = α * (y[t] - s) + (1 - α) * (nivel + tendencia)
        nova_tendencia = β * (novo_nivel - nivel) + (1 - β) * tendencia
        push!(sazonal, γ * (y[t] - nivel - tendencia) + (1 - γ) * s)
        nivel, tendencia = novo_nivel, nova_tendencia
    end
    previsao = [nivel + h * tendencia + sazonal[end-m+mod1(h, m)] for h in 1:m]
    return sqe, previsao
end
grade = 0:0.05:1
_, i = findmin([holt_winters(treino, α, β, γ, m)[1] for α in grade, β in grade, γ in grade])
α, β, γ = grade[i[1]], grade[i[2]], grade[i[3]]
hw = holt_winters(treino, α, β, γ, m)[2]
println("Holt-Winters: α = ", α, "   β = ", β, "   γ = ", γ)

# Método 3: AR(1) na diferença sazonal z_t = y_t − y_{t−12}
z = treino[m+1:end] .- treino[1:end-m]
x, w = z[1:end-1], z[2:end]
φ = sum((x .- mean(x)) .* (w .- mean(w))) / sum((x .- mean(x)) .^ 2)
c = mean(w) - φ * mean(x)
σ = sqrt(sum((w .- c .- φ .* x) .^ 2) / (length(w) - 2))
zprev = accumulate((anterior, _) -&gt; c + φ * anterior, 1:m; init = z[end])
ar = treino[end-m+1:end] .+ zprev
# Intervalo de 95%: variância do erro a h passos no AR(1) = σ²(1 + φ² + … + φ^(2(h−1)))
ep = [σ * sqrt(sum(φ^(2j) for j in 0:h-1)) for h in 1:m]
inferior, superior = ar .- 1.96 .* ep, ar .+ 1.96 .* ep
println("AR(1): c = ", round(c, digits = 3), "   φ = ", round(φ, digits = 4), "   σ = ", round(σ, digits = 2))

eam(p)  = mean(abs.(teste .- p))
reqm(p) = sqrt(mean((teste .- p) .^ 2))
epam(p) = 100 * mean(abs.((teste .- p) ./ teste))
for (nome, p) in [("Ingênuo sazonal", ingenuo), ("Holt-Winters", hw), ("AR(1) sazonal", ar)]
    println(rpad(nome, 16), " EAM = ", round(eam(p), digits = 1), "   REQM = ", round(reqm(p), digits = 1),
            "   EPAM = ", round(epam(p), digits = 1), "%")
end
println("2019 dentro do intervalo de 95% do AR: ", sum(inferior .&lt;= teste .&lt;= superior), " de 12 meses")
println("2020, real (mil): ", round.(producao[121:132], digits = 1))

p = plot(datas[85:132], producao[85:132], label = "Real", marker = :circle, markersize = 3,
         ylabel = "Mil veículos", title = "Previsão para 2019 e o que veio em 2020", legend = :bottomleft, size = (900, 420),
         xticks = (Date.(2017:2021, 1, 1), string.(2017:2021)), left_margin = 6Plots.mm, right_margin = 6Plots.mm)
plot!(p, datas[109:120], ar, ribbon = (ar .- inferior, superior .- ar), fillalpha = 0.2, lw = 2, label = "AR(1) sazonal e intervalo de 95%")
plot!(p, datas[109:120], ingenuo, ls = :dash, lw = 2, label = "Ingênuo sazonal")
plot!(p, datas[109:120], hw, ls = :dot, lw = 2, label = "Holt-Winters")
savefig(p, "producao_veiculos_previsao.png")</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">Holt-Winters: α = 0.4   β = 0.0   γ = 0.1
AR(1): c = -2.147   φ = 0.6604   σ = 35.47
Ingênuo sazonal  EAM = 24.6   REQM = 29.1   EPAM = 9.8%
Holt-Winters     EAM = 29.0   REQM = 34.5   EPAM = 11.6%
AR(1) sazonal    EAM = 25.6   REQM = 33.8   EPAM = 9.8%
2019 dentro do intervalo de 95% do AR: 12 de 12 meses
2020, real (mil): [191.7, 204.2, 190.0, 1.8, 43.1, 98.4, 170.7, 210.0, 220.2, 236.5, 238.2, 209.3]</pre>
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
    <pre><code>library(jsonlite)

url &lt;- "https://api.bcb.gov.br/dados/serie/bcdata.sgs.1373/dados?formato=json&amp;dataInicial=01/01/2010&amp;dataFinal=31/12/2020"
dados &lt;- fromJSON(url)
datas &lt;- as.Date(dados$data, format = "%d/%m/%Y")
producao &lt;- as.numeric(dados$valor) / 1000          # mil veículos
treino &lt;- producao[1:108]; teste &lt;- producao[109:120] # 2010–2018 e 2019
m &lt;- 12

# Método 1: ingênuo sazonal (repete 2018)
ingenuo &lt;- tail(treino, m)

# Método 2: Holt-Winters aditivo, α, β, γ escolhidos por busca em grade
holt_winters &lt;- function(y, alfa, beta, gama, m) {
  nivel &lt;- mean(y[1:m]); tendencia &lt;- (mean(y[(m + 1):(2 * m)]) - mean(y[1:m])) / m
  sazonal &lt;- y[1:m] - nivel; sqe &lt;- 0
  for (t in (m + 1):length(y)) {
    s &lt;- sazonal[t - m]
    sqe &lt;- sqe + (y[t] - (nivel + tendencia + s))^2   # erro de previsão um passo à frente
    novo_nivel &lt;- alfa * (y[t] - s) + (1 - alfa) * (nivel + tendencia)
    nova_tendencia &lt;- beta * (novo_nivel - nivel) + (1 - beta) * tendencia
    sazonal[t] &lt;- gama * (y[t] - nivel - tendencia) + (1 - gama) * s
    nivel &lt;- novo_nivel; tendencia &lt;- nova_tendencia
  }
  h &lt;- 1:m
  list(sqe = sqe, previsao = nivel + h * tendencia + sazonal[length(sazonal) - m + h])
}
grade &lt;- expand.grid(alfa = seq(0, 1, 0.05), beta = seq(0, 1, 0.05), gama = seq(0, 1, 0.05))
sqe &lt;- mapply(function(a, b, g) holt_winters(treino, a, b, g, m)$sqe, grade$alfa, grade$beta, grade$gama)
melhor &lt;- grade[which.min(sqe), ]
hw &lt;- holt_winters(treino, melhor$alfa, melhor$beta, melhor$gama, m)$previsao
cat("Holt-Winters: α =", melhor$alfa, "  β =", melhor$beta, "  γ =", melhor$gama, "\n")

# Método 3: AR(1) na diferença sazonal z_t = y_t − y_{t−12}
z &lt;- diff(treino, lag = m)
x &lt;- head(z, -1); w &lt;- z[-1]
ajuste &lt;- lm(w ~ x)
const &lt;- coef(ajuste)[[1]]; fi &lt;- coef(ajuste)[[2]]; sigma &lt;- summary(ajuste)$sigma
zprev &lt;- Reduce(function(anterior, h) const + fi * anterior, 1:m, accumulate = TRUE, z[length(z)])[-1]
ar &lt;- tail(treino, m) + zprev
# Intervalo de 95%: variância do erro a h passos no AR(1) = σ²(1 + φ² + … + φ^(2(h−1)))
ep &lt;- sigma * sqrt(cumsum(fi^(2 * (0:(m - 1)))))
inferior &lt;- ar - 1.96 * ep; superior &lt;- ar + 1.96 * ep
cat("AR(1): c =", round(const, 3), "  φ =", round(fi, 4), "  σ =", round(sigma, 2), "\n")

eam  &lt;- function(p) mean(abs(teste - p))
reqm &lt;- function(p) sqrt(mean((teste - p)^2))
epam &lt;- function(p) 100 * mean(abs((teste - p) / teste))
for (metodo in list(list("Ingênuo sazonal", ingenuo), list("Holt-Winters", hw), list("AR(1) sazonal", ar))) {
  p &lt;- metodo[[2]]
  cat(format(metodo[[1]], width = 16), "EAM =", round(eam(p), 1), "  REQM =", round(reqm(p), 1),
      "  EPAM =", paste0(round(epam(p), 1), "%"), "\n")
}
cat("2019 dentro do intervalo de 95% do AR:", sum(inferior &lt;= teste &amp; teste &lt;= superior), "de 12 meses\n")
cat("2020, real (mil):", round(producao[121:132], 1), "\n")

png("producao_veiculos_previsao_r.png", width = 900, height = 420)
plot(datas[85:132], producao[85:132], type = "o", pch = 19, cex = 0.6, ylim = c(0, 380),
     xlab = "", ylab = "Mil veículos", main = "Previsão para 2019 e o que veio em 2020")
polygon(c(datas[109:120], rev(datas[109:120])), c(inferior, rev(superior)), col = adjustcolor("#DC143C", 0.2), border = NA)
lines(datas[109:120], ar, lwd = 2, col = "#DC143C")
lines(datas[109:120], ingenuo, lwd = 2, lty = 2, col = "darkgreen")
lines(datas[109:120], hw, lwd = 2, lty = 3, col = "purple")
legend("bottomleft", c("Real", "AR(1) sazonal e intervalo de 95%", "Ingênuo sazonal", "Holt-Winters"),
       col = c("black", "#DC143C", "darkgreen", "purple"), lty = c(1, 1, 2, 3), pch = c(19, NA, NA, NA))
invisible(dev.off())</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">Holt-Winters: α = 0.4   β = 0   γ = 0.1 
AR(1): c = -2.147   φ = 0.6604   σ = 35.47 
Ingênuo sazonal  EAM = 24.6   REQM = 29.1   EPAM = 9.8% 
Holt-Winters     EAM = 29   REQM = 34.5   EPAM = 11.6% 
AR(1) sazonal    EAM = 25.6   REQM = 33.8   EPAM = 9.8% 
2019 dentro do intervalo de 95% do AR: 12 de 12 meses
2020, real (mil): 191.7 204.2 190 1.8 43.1 98.4 170.7 210 220.2 236.5 238.2 209.3</pre>
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
    <pre><code>import itertools
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

url = ("https://api.bcb.gov.br/dados/serie/bcdata.sgs.1373/dados?formato=json"
       "&amp;dataInicial=01/01/2010&amp;dataFinal=31/12/2020")
dados = pd.read_json(url, storage_options={"User-Agent": "Mozilla/5.0"})
datas = pd.to_datetime(dados["data"], format="%d/%m/%Y")
producao = dados["valor"].astype(float).to_numpy() / 1000    # mil veículos
treino, teste = producao[:108], producao[108:120]             # 2010–2018 e 2019
m = 12

# Método 1: ingênuo sazonal (repete 2018)
ingenuo = treino[-m:]

# Método 2: Holt-Winters aditivo, α, β, γ escolhidos por busca em grade
def holt_winters(y, alfa, beta, gama, m):
    nivel = y[:m].mean(); tendencia = (y[m:2 * m].mean() - y[:m].mean()) / m
    sazonal = list(y[:m] - nivel); sqe = 0.0
    for t in range(m, len(y)):
        s = sazonal[t - m]
        sqe += (y[t] - (nivel + tendencia + s)) ** 2        # erro de previsão um passo à frente
        novo_nivel = alfa * (y[t] - s) + (1 - alfa) * (nivel + tendencia)
        nova_tendencia = beta * (novo_nivel - nivel) + (1 - beta) * tendencia
        sazonal.append(gama * (y[t] - nivel - tendencia) + (1 - gama) * s)
        nivel, tendencia = novo_nivel, nova_tendencia
    previsao = np.array([nivel + h * tendencia + sazonal[len(sazonal) - m + h - 1] for h in range(1, m + 1)])
    return sqe, previsao

grade = np.round(np.arange(0, 1.0001, 0.05), 2)
alfa, beta, gama = min(itertools.product(grade, grade, grade), key=lambda p: holt_winters(treino, *p, m)[0])
hw = holt_winters(treino, alfa, beta, gama, m)[1]
print(f"Holt-Winters: α = {alfa}   β = {beta}   γ = {gama}")

# Método 3: AR(1) na diferença sazonal z_t = y_t − y_{t−12}
z = treino[m:] - treino[:-m]
x, w = z[:-1], z[1:]
fi, c = np.polyfit(x, w, 1)
sigma = np.sqrt(np.sum((w - c - fi * x) ** 2) / (len(w) - 2))
zprev, anterior = [], z[-1]
for h in range(m):
    anterior = c + fi * anterior
    zprev.append(anterior)
ar = treino[-m:] + np.array(zprev)
# Intervalo de 95%: variância do erro a h passos no AR(1) = σ²(1 + φ² + … + φ^(2(h−1)))
ep = sigma * np.sqrt(np.cumsum(fi ** (2 * np.arange(m))))
inferior, superior = ar - 1.96 * ep, ar + 1.96 * ep
print(f"AR(1): c = {c:.3f}   φ = {fi:.4f}   σ = {sigma:.2f}")

eam  = lambda p: np.mean(np.abs(teste - p))
reqm = lambda p: np.sqrt(np.mean((teste - p) ** 2))
epam = lambda p: 100 * np.mean(np.abs((teste - p) / teste))
for nome, p in [("Ingênuo sazonal", ingenuo), ("Holt-Winters", hw), ("AR(1) sazonal", ar)]:
    print(f"{nome:16s} EAM = {eam(p):.1f}   REQM = {reqm(p):.1f}   EPAM = {epam(p):.1f}%")
print("2019 dentro do intervalo de 95% do AR:", np.sum((inferior &lt;= teste) &amp; (teste &lt;= superior)), "de 12 meses")
print("2020, real (mil):", np.round(producao[120:132], 1))

fig, ax = plt.subplots(figsize=(9, 4.2))
ax.plot(datas[84:132], producao[84:132], "o-", ms=3, label="Real")
ax.fill_between(datas[108:120], inferior, superior, color="crimson", alpha=0.2)
ax.plot(datas[108:120], ar, color="crimson", lw=2, label="AR(1) sazonal e intervalo de 95%")
ax.plot(datas[108:120], ingenuo, "--", lw=2, label="Ingênuo sazonal")
ax.plot(datas[108:120], hw, ":", lw=2, label="Holt-Winters")
ax.set(ylabel="Mil veículos", title="Previsão para 2019 e o que veio em 2020"); ax.legend(loc="lower left")
fig.tight_layout(); fig.savefig("producao_veiculos_previsao_py.png", dpi=100)</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">Holt-Winters: α = 0.4   β = 0.0   γ = 0.1
AR(1): c = -2.147   φ = 0.6604   σ = 35.47
Ingênuo sazonal  EAM = 24.6   REQM = 29.1   EPAM = 9.8%
Holt-Winters     EAM = 29.0   REQM = 34.5   EPAM = 11.6%
AR(1) sazonal    EAM = 25.6   REQM = 33.8   EPAM = 9.8%
2019 dentro do intervalo de 95% do AR: 12 de 12 meses
2020, real (mil): [191.7 204.2 190.    1.8  43.1  98.4 170.7 210.  220.2 236.5 238.2 209.3]</pre>
</div>
  </div>
</div>

![Produção mensal de veículos de 2017 a 2020 com as previsões de 2019 dos três métodos e a faixa do intervalo de 95% do AR(1); em 2020 a produção cai a quase zero em abril e se recupera até o fim do ano]({{ site.baseurl }}/assets/images/producao_veiculos_previsao.png){:style="max-width: 900px; display: block; margin: 1em auto;"}
<div class="image-caption" style="text-align: center;">Figura 3. Produção mensal de veículos (SGS 1373; Anfavea), previsões para 2019 dos três métodos, intervalo de 95% do AR(1) sazonal e os valores reais de 2020. Gerada pelo código acima, versão em Julia.</div>

**Resultados para 2019** (mil veículos):

| Método | EAM | REQM | EPAM |
|---|---|---|---|
| Ingênuo sazonal | 24,6 | 29,1 | 9,8% |
| Holt-Winters | 29,0 | 34,5 | 11,6% |
| AR(1) sazonal | 25,6 | 33,8 | 9,8% |

**Interpretação.**

- Os três métodos erraram, em média, de 25 a 29 mil veículos por mês, cerca de 10% da produção. Numa série real, sujeita a feriados que mudam de mês, paradas de produção e choques de demanda, um erro desse tamanho não surpreende.
- **O método mais simples ganhou** no EAM e no REQM. Os outros dois não conseguiram extrair do passado mais informação que "o ano que vem se parece com este". É por isso que todo método deve ser comparado com um ingênuo.
- A diferença entre os três é pequena perto do próprio erro, e com só 12 meses de teste ela pode ser acaso. Uma validação com origem móvel (seção 8.2), em vários anos, diria com mais segurança qual é melhor.
- Os 12 valores reais de 2019 caíram dentro do intervalo de 95% do AR(1). Mas o intervalo é largo: de cerca de ±70 mil veículos no primeiro mês a ±93 mil no décimo segundo. O modelo é honesto sobre a própria incerteza, e ela é grande.

**E 2020?** Em abril de 2020 a produção foi de **1,8 mil veículos**, contra 267,6 mil em abril de 2019; em maio, 43,1 mil; a recuperação veio no segundo semestre. Esses meses coincidem com o início da pandemia de covid-19 no Brasil. Nenhum dos métodos acima, nem qualquer outro baseado só no passado da série, poderia prever essa queda: ela não estava nos dados. É uma **quebra estrutural**, e um lembrete de que intervalos de previsão valem só "se nada mudar".

---

## 10. Outros Métodos

- **Funções prontas**: no R, `decompose()`, `stl()`, `HoltWinters()` e `arima()` (pacote `stats`); no Python, `seasonal_decompose`, `STL`, `ExponentialSmoothing` e `SARIMAX` (statsmodels). Elas escolhem parâmetros e valores iniciais por conta própria; vale entender as equações (como nesta página) antes de usá-las.
- **Modelos ETS**: a versão estatística da suavização exponencial, com intervalos de previsão e escolha automática da forma (aditiva ou multiplicativa) por critérios de informação.
- **Prophet**: modelo de decomposição em tendência, sazonalidades e feriados, publicado por pesquisadores do Facebook (Taylor e Letham, 2018).
- **Redes neurais** (por exemplo, LSTM): podem captar padrões complexos, mas pedem muitos dados e são difíceis de interpretar; em séries curtas, costumam não superar os métodos acima.

O livro de Hyndman e Athanasopoulos (referência 1), gratuito na internet, explica todos eles com exemplos.

---

## 11. Boas Práticas e Armadilhas

- **Desenhe a série** antes de qualquer conta: tendência, sazonalidade, mudanças bruscas e valores atípicos costumam aparecer no gráfico.
- **Teste de raiz unitária não é veredito**: o resultado do ADF muda com o número de defasagens (seção 7.3); decida olhando também os gráficos.
- **Correlação espúria**: duas séries que crescem com o tempo (por exemplo, vendas de sorvete e número de usuários de celular) terão correlação alta sem nenhuma relação entre si. Compare as variações, não os níveis.
- **Valide no tempo**: separe treino e teste respeitando a ordem cronológica, de preferência com origem móvel, e compare com um método ingênuo; na seção 9, o ingênuo venceu.
- **Mostre a incerteza**: dê a previsão com intervalo, e lembre que o intervalo supõe que o modelo está certo.
- **Não confie em previsões longas**: a incerteza cresce com o horizonte.
- **Mudanças estruturais** (uma pandemia, uma mudança de regra, uma loja nova) quebram o padrão do passado; o modelo não as prevê.

---

## 12. Glossário

| Termo | Significado |
|---|---|
| Série temporal | Observações de uma variável em ordem no tempo |
| Tendência | Movimento de longo prazo, de subida ou descida |
| Sazonalidade | Padrão que se repete com período fixo |
| Ciclo | Oscilação de longo prazo sem período fixo |
| Ruído | Variação irregular que sobra depois da tendência e da sazonalidade |
| Média móvel | Média de cada valor com seus vizinhos, que suaviza a série |
| Autocorrelação | Correlação da série com ela mesma deslocada no tempo |
| Estacionariedade | Média, variância e autocorrelação que não mudam com o tempo |
| Dessazonalizar | Tirar da série o efeito sazonal |
| Suavização exponencial | Previsão por média ponderada do passado, com pesos que caem para os valores antigos |
| Diferença sazonal | $y\_t - y\_{t-m}$: variação em relação ao mesmo período do ano anterior |
| Raiz unitária | Situação em que a série precisa de diferença para ficar estacionária (testada pelo ADF) |
| AR($p$), MA($q$), ARIMA | Modelos em que o valor depende dos valores (AR) ou dos erros (MA) passados, depois de $d$ diferenças (I) |
| Método ingênuo sazonal | Prever cada período repetindo o mesmo período do ano anterior |
| Intervalo de previsão | Faixa que contém o valor futuro com a probabilidade declarada, se o modelo estiver certo |

---

## 13. Resumo

- Série temporal: observações em ordem no tempo, em geral **dependentes** entre si.
- Componentes: tendência, sazonalidade (período fixo), ciclo (sem período fixo) e ruído; modelo aditivo ou multiplicativo.
- Gráficos: de linha, sazonal, de subséries e correlograma; desenhe antes de calcular.
- No exemplo trimestral: efeitos sazonais de −10,875 (T1), 0,4375 (T2), −6,75 (T3) e 17,1875 (T4), tendência de R\\$ 1,13 mil por trimestre; decomposição, Holt-Winters e AR(1) na diferença sazonal preveem o ano 4 de forma parecida (cerca de 53, 65, 59 e 85 mil).
- Suavização exponencial: nível (e tendência e sazonalidade, no Holt-Winters) atualizados por médias ponderadas.
- ARIMA: diferenças para tornar a série estacionária, depois um modelo para os valores (AR) e os erros (MA) passados; o ADF ajuda, mas depende das defasagens.
- Meça o erro (EAM, REQM, EPAM) em dados que o modelo não viu, sempre depois do treino, e compare com um método ingênuo.
- Na produção de veículos, o ingênuo sazonal previu 2019 melhor que Holt-Winters e AR(1); nenhum método previu abril de 2020.

---

## Referências

1. Hyndman, R. J.; Athanasopoulos, G. (2021). *Forecasting: Principles and Practice*. 3rd ed. OTexts. Disponível em [otexts.com/fpp3](https://otexts.com/fpp3/).
2. Morettin, P. A.; Toloi, C. M. C. (2018). *Análise de Séries Temporais*, v. 1: Modelos Lineares Univariados. 3. ed. Blucher.
3. Taylor, S. J.; Letham, B. (2018). Forecasting at Scale. *The American Statistician*, 72(1), 37–45. DOI: [10.1080/00031305.2017.1380080](https://doi.org/10.1080/00031305.2017.1380080).

## Dados

- Banco Central do Brasil. Sistema Gerenciador de Séries Temporais (SGS), série 1373: Produção total de autoveículos (unidades, mensal). Fonte primária: Anfavea. Licença: Open Data Commons Open Database License (ODbL). API: `https://api.bcb.gov.br/dados/serie/bcdata.sgs.1373/dados?formato=json`. Acesso em 25 nov. 2026.
