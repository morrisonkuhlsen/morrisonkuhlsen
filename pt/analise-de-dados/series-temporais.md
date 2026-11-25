---
layout: page
title: Séries Temporais
lang: pt
ref: series-temporais
parent: analise-de-dados
permalink: /pt/analise-de-dados/series-temporais
order: 2
mathjax: true
description: "Séries temporais: tendência, sazonalidade e ruído, média móvel, decomposição resolvida à mão, autocorrelação, previsão e validação, com código em Julia."
---

<img src="{{ site.baseurl }}/assets/images/timeseries.avif" alt="Ilustração de uma pessoa no computador olhando um gráfico de linha que sobe e desce, sob o título Time Series" style="max-width: 600px; display: block; margin: 1em auto;">

Uma **série temporal** é uma sequência de observações de uma mesma variável feitas ao longo do tempo, em ordem: a temperatura de cada dia, as vendas de cada mês, o número de acessos a um site em cada hora. Escreve-se $y_1, y_2, \ldots, y_n$, em que $y_t$ é o valor no instante (ou período) $t$.

O que torna as séries temporais diferentes de uma amostra comum é que **a ordem importa**: valores próximos no tempo costumam ser parecidos (as vendas de março se parecem com as de fevereiro), e por isso as observações **não são independentes**. Muitas técnicas que supõem independência, como os intervalos de confiança e testes das páginas de [Inferência Estatística]({{ '/pt/inferencia-estatistica/' | relative_url }}), não podem ser aplicadas diretamente a elas.

Esta página trata de séries observadas a **intervalos regulares** (todo dia, todo mês, todo trimestre) e de uma única variável.

---

## 1. Os Componentes de uma Série

É comum pensar numa série como a soma de partes com papéis diferentes:

| Componente | O que é | Exemplo |
|---|---|---|
| **Tendência** ($T_t$) | Movimento de longo prazo, de subida ou de descida | Crescimento das vendas de uma loja ao longo dos anos |
| **Sazonalidade** ($S_t$) | Padrão que se repete com **período fixo e conhecido** | Vendas maiores todo fim de ano; mais calor todo verão |
| **Ciclo** | Oscilações de longo prazo **sem período fixo** | Fases de expansão e recessão da economia |
| **Ruído** ($R_t$) | Variação irregular que sobra depois de tirar as outras partes | Um dia de chuva forte, um erro de digitação |

Sazonalidade e ciclo se confundem com facilidade. A diferença é o período: a sazonalidade se repete a cada 12 meses, 7 dias, 4 trimestres; o ciclo não tem duração fixa. Na prática, com poucos anos de dados, o ciclo costuma ficar junto com a tendência (a "tendência-ciclo").

**Modelo aditivo:** quando a altura da oscilação sazonal é mais ou menos a mesma ao longo do tempo,

$$
y_t = T_t + S_t + R_t
$$

**Modelo multiplicativo:** quando a oscilação sazonal cresce junto com o nível da série (por exemplo, o pico de dezembro é sempre cerca de 30% acima da média do ano),

$$
y_t = T_t \times S_t \times R_t
$$

Tomando logaritmos (o que exige valores positivos), o multiplicativo vira aditivo: $\ln y_t = \ln T_t + \ln S_t + \ln R_t$.

<div style="border-left: 4px solid orange; padding: 0.5em; background-color: #fff3cd;">
  <strong>Atenção:</strong> para afirmar que há sazonalidade é preciso ver o padrão <strong>se repetir</strong>. Com um único ano de dados mensais, um dezembro alto pode ser sazonalidade ou só um mês atípico: não há como distinguir. São precisos pelo menos dois ou três períodos completos.
</div>

---

## 2. Média Móvel

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

## 3. Autocorrelação

A **autocorrelação de defasagem** (ou *lag*) $k$ mede a correlação entre a série e ela mesma deslocada $k$ períodos:

$$
r_k = \frac{\sum_{t=1}^{n-k} (y_t - \bar{y})(y_{t+k} - \bar{y})}{\sum_{t=1}^{n} (y_t - \bar{y})^2}
$$

em que $\bar{y}$ é a média de todos os $n$ valores. Ela fica entre −1 e 1, como a correlação comum. Um $r_k$ alto e positivo diz que valores separados por $k$ períodos se parecem. Numa série trimestral com sazonalidade, $r_4$ (um ano de distância) costuma ser alto. O gráfico dos $r_k$ contra $k$ se chama **correlograma** ou **ACF**.

---

## 4. Exemplo Resolvido: Decomposição e Previsão

**Situação** (números ilustrativos): as vendas trimestrais de uma loja, em R\\$ mil, ao longo de 3 anos.

| | T1 | T2 | T3 | T4 |
|---|---|---|---|---|
| **Ano 1** ($t$ = 1 a 4) | 40 | 52 | 46 | 70 |
| **Ano 2** ($t$ = 5 a 8) | 44 | 56 | 50 | 76 |
| **Ano 3** ($t$ = 9 a 12) | 48 | 61 | 54 | 81 |

Olhando a tabela: em todo ano o T4 é o maior e o T1 o menor (padrão que **se repete** três vezes: sazonalidade), e cada trimestre vende mais que o mesmo trimestre do ano anterior (tendência de alta). A altura do pico do T4 em relação aos outros trimestres muda pouco de um ano para o outro, então vamos usar o **modelo aditivo**.

**Objetivo:** separar tendência e sazonalidade e prever as vendas do ano 4.

### 4.1 Dados

- $y_t$: vendas no trimestre $t$, em R\\$ mil, $t = 1, \ldots, 12$ (da tabela);
- período sazonal: $m = 4$ trimestres;
- $n = 12$ observações.

### 4.2 Passo 1: tendência pela média móvel 2×4

Fórmula (seção 2): $MM_t = \big(\tfrac{1}{2}y_{t-2} + y_{t-1} + y_t + y_{t+1} + \tfrac{1}{2}y_{t+2}\big) / 4$. Ela só existe de $t = 3$ a $t = 10$.

Para $t = 3$, substituindo:

$$
MM_3 = \frac{\tfrac{1}{2} \times 40 + 52 + 46 + 70 + \tfrac{1}{2} \times 44}{4} = \frac{20 + 52 + 46 + 70 + 22}{4} = \frac{210}{4} = 52{,}5
$$

Os demais, do mesmo modo:

| $t$ | Conta do numerador | Numerador | $MM_t$ |
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

### 4.3 Passo 2: desvios em relação à tendência

Para cada $t$ com média móvel, o desvio $y_t - MM_t$ mostra quanto aquele trimestre ficou acima ou abaixo da tendência:

| $t$ | Trimestre | $y_t$ | $MM_t$ | $y_t - MM_t$ |
|---|---|---|---|---|
| 3 | T3 | 46 | 52,5 | −6,5 |
| 4 | T4 | 70 | 53,5 | 16,5 |
| 5 | T1 | 44 | 54,5 | −10,5 |
| 6 | T2 | 56 | 55,75 | 0,25 |
| 7 | T3 | 50 | 57 | −7 |
| 8 | T4 | 76 | 58,125 | 17,875 |
| 9 | T1 | 48 | 59,25 | −11,25 |
| 10 | T2 | 61 | 60,375 | 0,625 |

### 4.4 Passo 3: efeito sazonal de cada trimestre

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

A soma já é zero, então os efeitos ajustados são os próprios: $S_1 = -10{,}875$, $S_2 = 0{,}4375$, $S_3 = -6{,}75$, $S_4 = 17{,}1875$.

**Interpretação:** descontada a tendência, o 4º trimestre vende cerca de R\\$ 17,2 mil acima do nível do ano, e o 1º cerca de R\\$ 10,9 mil abaixo; o 2º fica praticamente no nível.

### 4.5 Passo 4: série dessazonalizada

Tirando de cada valor o efeito do seu trimestre, $d_t = y_t - S_{\text{trimestre}(t)}$, sobra tendência + ruído:

| $t$ | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| $y_t$ | 40 | 52 | 46 | 70 | 44 | 56 | 50 | 76 | 48 | 61 | 54 | 81 |
| $S$ | −10,875 | 0,4375 | −6,75 | 17,1875 | −10,875 | 0,4375 | −6,75 | 17,1875 | −10,875 | 0,4375 | −6,75 | 17,1875 |
| $d_t$ | 50,875 | 51,5625 | 52,75 | 52,8125 | 54,875 | 55,5625 | 56,75 | 58,8125 | 58,875 | 60,5625 | 60,75 | 63,8125 |

Por exemplo, $d_1 = 40 - (-10{,}875) = 40 + 10{,}875 = 50{,}875$.

### 4.6 Passo 5: reta de tendência

Ajustamos uma reta $\hat{d}\_t = a + b\,t$ à série dessazonalizada por [mínimos quadrados]({{ '/pt/analise-de-dados/regressao-linear' | relative_url }}): $b = S\_{td}/S\_{tt}$ e $a = \bar{d} - b\,\bar{t}$.

- $\bar{t} = (1 + 2 + \cdots + 12)/12 = 78/12 = 6{,}5$;
- $\bar{d} = (50{,}875 + 51{,}5625 + \cdots + 63{,}8125)/12 = 678/12 = 56{,}5$.

| $t$ | $t - \bar{t}$ | $d_t - \bar{d}$ | $(t - \bar{t})(d_t - \bar{d})$ | $(t - \bar{t})^2$ |
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
| **Soma** | | | $S_{td} = 161{,}5$ | $S_{tt} = 143$ |

$$
b = \frac{S_{td}}{S_{tt}} = \frac{161{,}5}{143} = 1{,}129370\ldots \approx 1{,}1294 \text{ (R\$ mil por trimestre)}
$$

$$
a = \bar{d} - b\,\bar{t} = 56{,}5 - 1{,}129370\ldots \times 6{,}5 = 56{,}5 - 7{,}340909\ldots = 49{,}159090\ldots \approx 49{,}1591
$$

**Interpretação:** descontada a sazonalidade, as vendas crescem em média cerca de R\\$ 1,13 mil por trimestre, isto é, cerca de R\\$ 4,5 mil por ano.

### 4.7 Passo 6: previsão para o ano 4

Previsão = tendência no trimestre + efeito sazonal do trimestre: $\hat{y}\_t = a + b\,t + S\_{\text{trimestre}(t)}$, com $a$ e $b$ completos.

| $t$ | Trimestre | Tendência $a + b\,t$ | Efeito $S$ | Previsão $\hat{y}_t$ (R\\$ mil) |
|---|---|---|---|---|
| 13 | T1 | $49{,}159091 + 1{,}129371 \times 13 = 63{,}840909$ | −10,875 | 52,97 |
| 14 | T2 | $49{,}159091 + 1{,}129371 \times 14 = 64{,}970280$ | 0,4375 | 65,41 |
| 15 | T3 | $49{,}159091 + 1{,}129371 \times 15 = 66{,}099650$ | −6,75 | 59,35 |
| 16 | T4 | $49{,}159091 + 1{,}129371 \times 16 = 67{,}229021$ | 17,1875 | 84,42 |

**Interpretação e limites.** Se a tendência e o padrão sazonal dos últimos 3 anos continuarem, o ano 4 deve ter vendas de cerca de R\\$ 53 mil, 65 mil, 59 mil e 84 mil nos quatro trimestres. Isso é uma **extrapolação**: supõe que nada muda (economia, concorrência, a própria loja). Quanto mais longe no futuro, menos confiável. E essas previsões vêm sem margem de erro; métodos como os da seção 6 dão intervalos de previsão.

### 4.8 Conferência pela autocorrelação

Com $\bar{y} = 678/12 = 56{,}5$ e $\sum (y_t - \bar{y})^2 = 1863$, as autocorrelações (calculadas pelo código da seção 5) são:

| Defasagem $k$ | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| $r_k$ | −0,313 | 0,313 | −0,416 | **0,611** | −0,266 | 0,101 |

A maior é $r_4 = 0{,}611$: valores separados por **um ano** se parecem, o que confirma a sazonalidade de período 4 vista na tabela. Com só 12 observações, esses valores são imprecisos; servem como indicação, não como prova.

---

## 5. Código em Julia

Cada bloco roda sozinho. O primeiro refaz todo o exemplo e gera a figura.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
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

![Gráfico das vendas trimestrais de t = 1 a 12, com a média móvel 2×4 subindo de forma regular, a reta de tendência tracejada e as quatro previsões do ano 4 em vermelho]({{ site.baseurl }}/assets/images/series_temporais_decomposicao.png){:style="max-width: 800px; display: block; margin: 1em auto;"}
<div class="image-caption" style="text-align: center;">Figura 1. Vendas trimestrais, média móvel 2×4 (tendência), reta de tendência e previsão do ano 4, geradas pelo código acima.</div>

### 5.1 Validação: o método prevê bem?

Um modelo sempre parece bom nos dados que usou para ser ajustado. Para saber se ele **prevê**, separe o final da série, ajuste com o começo e compare a previsão com o que de fato aconteceu. Em séries temporais, a separação respeita a ordem do tempo: o teste é sempre **depois** do treino (sortear observações ao acaso, como se faz em outros problemas, deixaria o modelo "ver o futuro").

Abaixo, o método é ajustado com os anos 1 e 2 e prevê o ano 3. Como comparação, usamos o **método ingênuo sazonal**, que prevê cada trimestre repetindo o valor do mesmo trimestre do ano anterior. A medida é o **erro absoluto médio** (EAM), a média das distâncias entre previsão e valor real.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Statistics

vendas = [40, 52, 46, 70, 44, 56, 50, 76, 48, 61, 54, 81]
trimestre(t) = mod1(t, 4)

# Mesmo método da seção anterior, usando só os dados passados em `serie`
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
previsao = prever(treino, 4)
ingenuo = treino[5:8]                      # método ingênuo sazonal: repete o ano anterior

eam(prev) = mean(abs.(teste .- prev))      # erro absoluto médio
println("Real (ano 3):         ", teste)
println("Decomposição:         ", round.(previsao, digits = 2), "   EAM = ", round(eam(previsao), digits = 2))
println("Ingênuo sazonal:      ", ingenuo, "   EAM = ", round(eam(ingenuo), digits = 2))</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">Real (ano 3):         [48, 61, 54, 81]
Decomposição:         [49.04, 60.95, 55.36, 79.52]   EAM = 0.98
Ingênuo sazonal:      [44, 56, 50, 76]   EAM = 4.5</pre>
</div>

A decomposição errou, em média, cerca de R\\$ 1 mil por trimestre; o método ingênuo, R\\$ 4,5 mil, porque ele não acompanha a tendência de alta. Um método só vale a pena se bater um concorrente simples como esse. Com só 4 trimestres de teste, a comparação é uma indicação, não uma conclusão firme.

---

## 6. Outros Métodos

A decomposição clássica é simples e fácil de explicar, mas supõe que o padrão sazonal é sempre o mesmo e não dá margem de erro. Outros métodos comuns:

- **Suavização exponencial** (incluindo o método de Holt-Winters): a previsão é uma média ponderada do passado, com pesos que caem exponencialmente para os valores mais antigos; tem versões com tendência e sazonalidade.
- **Modelos ARIMA e SARIMA**: descrevem cada valor como combinação dos valores e erros anteriores. Pedem uma série **estacionária** (seção 7), o que em geral se obtém tomando diferenças ($y_t - y_{t-1}$, ou $y_t - y_{t-4}$ para tirar a sazonalidade trimestral).
- **Prophet**: modelo de decomposição em tendência, sazonalidades e feriados, publicado por pesquisadores do Facebook (Taylor e Letham, 2018).
- **Redes neurais** (por exemplo, LSTM): podem captar padrões complexos, mas pedem muitos dados e são difíceis de interpretar; em séries curtas, costumam não superar os métodos acima.

O livro de Hyndman e Athanasopoulos (referência 1), gratuito na internet, explica todos eles com exemplos.

---

## 7. Boas Práticas e Armadilhas

- **Desenhe a série** antes de qualquer conta: tendência, sazonalidade, mudanças bruscas e valores atípicos costumam aparecer no gráfico.
- **Estacionariedade**: uma série é (fracamente) estacionária quando a média e a variância não mudam com o tempo e a correlação entre $y_t$ e $y_{t+k}$ depende só da distância $k$. Séries com tendência ou sazonalidade **não** são estacionárias. Muitos modelos (como o ARIMA) exigem estacionariedade.
- **Correlação espúria**: duas séries que crescem com o tempo (por exemplo, vendas de sorvete e número de usuários de celular) terão correlação alta sem nenhuma relação entre si. Compare as variações, não os níveis.
- **Valide no tempo**: separe treino e teste respeitando a ordem cronológica e compare com um método ingênuo.
- **Não confie em previsões longas**: a incerteza cresce com o horizonte.
- **Mudanças estruturais** (uma pandemia, uma mudança de regra, uma loja nova) quebram o padrão do passado; o modelo não as prevê.

---

## 8. Glossário

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

---

## 9. Resumo

- Série temporal: observações em ordem no tempo, em geral **dependentes** entre si.
- Componentes: tendência, sazonalidade (período fixo), ciclo (sem período fixo) e ruído; modelo aditivo ou multiplicativo.
- No exemplo: média móvel 2×4, efeitos sazonais de −10,875 (T1), 0,4375 (T2), −6,75 (T3) e 17,1875 (T4), tendência de cerca de R\\$ 1,13 mil por trimestre e previsão de R\\$ 52,97 mil, 65,41 mil, 59,35 mil e 84,42 mil para o ano 4.
- Sazonalidade só se afirma vendo o padrão se repetir; $r_4 = 0{,}611$ confirma a do exemplo.
- Valide prevendo um período já conhecido, sempre depois do treino, e compare com um método ingênuo.

---

## Referências

1. Hyndman, R. J.; Athanasopoulos, G. (2021). *Forecasting: Principles and Practice*. 3rd ed. OTexts. Disponível em [otexts.com/fpp3](https://otexts.com/fpp3/).
2. Morettin, P. A.; Toloi, C. M. C. (2018). *Análise de Séries Temporais*, v. 1: Modelos Lineares Univariados. 3. ed. Blucher.
3. Taylor, S. J.; Letham, B. (2018). Forecasting at Scale. *The American Statistician*, 72(1), 37–45. DOI: [10.1080/00031305.2017.1380080](https://doi.org/10.1080/00031305.2017.1380080).
