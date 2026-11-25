---
layout: page
title: Regressão Linear Simples
lang: pt
ref: regressao-linear
parent: analise-de-dados
permalink: /pt/analise-de-dados/regressao-linear
order: 1
mathjax: true
description: "Regressão linear simples por mínimos quadrados: fórmulas, exemplo resolvido à mão, R², resíduos, previsão com intervalo, código em Julia e calculadora."
---

<img src="{{ site.baseurl }}/assets/images/regressao.avif" alt="Ilustração de um analista apontando para um gráfico de dispersão com uma reta, sob o título Linear Regression, na tela do computador" style="max-width: 600px; display: block; margin: 1em auto;">

A **regressão linear simples** descreve como uma variável quantitativa $Y$ (a **resposta**) costuma mudar quando outra variável quantitativa $X$ (a **explicativa**) muda, por meio de uma reta ajustada aos dados. Ela serve para resumir essa relação, medir o quanto a reta explica de $Y$ e fazer previsões de $Y$ a partir de $X$.

"Simples" quer dizer que há uma única variável explicativa. Com várias, o método é a regressão linear múltipla.

---

## 1. O Modelo

A ideia é que, para cada valor de $X$, o valor **médio** de $Y$ fica sobre uma reta, e cada observação se afasta dessa média por um erro aleatório:

$$
Y = \beta_0 + \beta_1 X + \varepsilon
$$

- $Y$: variável resposta (a que queremos explicar ou prever);
- $X$: variável explicativa;
- $\beta_0$: **intercepto**, o valor médio de $Y$ quando $X = 0$;
- $\beta_1$: **inclinação**, quanto o valor médio de $Y$ muda quando $X$ aumenta uma unidade;
- $\varepsilon$: **erro aleatório**, o que separa cada observação da reta (outros fatores, variação natural, erro de medida).

$\beta_0$ e $\beta_1$ são parâmetros da população, desconhecidos. Com uma amostra de $n$ pares $(x_i;\ y_i)$, calculamos as **estimativas** $a$ (de $\beta_0$) e $b$ (de $\beta_1$), e a **reta ajustada**:

$$
\hat{y} = a + b\,x
$$

O chapéu em $\hat{y}$ indica valor **previsto** pela reta, para diferenciar do valor observado $y$. A diferença entre os dois é o **resíduo**: $e_i = y_i - \hat{y}_i$.

---

## 2. Mínimos Quadrados

Existem infinitas retas que passam "perto" dos pontos. O método dos **mínimos quadrados** escolhe a reta que torna mínima a soma dos quadrados dos resíduos:

$$
SQ_{\text{res}} = \sum_{i=1}^{n} (y_i - a - b\,x_i)^2
$$

Os resíduos são elevados ao quadrado para que os positivos (pontos acima da reta) e os negativos (abaixo) não se cancelem, e para que erros grandes pesem mais.

---

## 3. As Fórmulas

Com as médias $\bar{x}$ e $\bar{y}$, definimos três somas de desvios:

$$
S_{xx} = \sum (x_i - \bar{x})^2 \qquad S_{yy} = \sum (y_i - \bar{y})^2 \qquad S_{xy} = \sum (x_i - \bar{x})(y_i - \bar{y})
$$

A reta de mínimos quadrados tem:

$$
b = \frac{S_{xy}}{S_{xx}} \qquad\qquad a = \bar{y} - b\,\bar{x}
$$

Para contas à mão, as somas podem ser calculadas pelas formas equivalentes (valem sempre):

$$
S_{xx} = \sum x_i^2 - n\bar{x}^2 \qquad\qquad S_{xy} = \sum x_i y_i - n\bar{x}\bar{y}
$$

Propriedades que valem para qualquer conjunto de dados:

- a fórmula só existe se **nem todos os $x_i$ forem iguais** (senão $S_{xx} = 0$ e a inclinação seria uma divisão por zero);
- a reta passa pelo ponto $(\bar{x};\ \bar{y})$, porque $a = \bar{y} - b\bar{x}$;
- os resíduos **somam zero**: $\sum e_i = 0$;
- nenhuma outra reta tem soma de quadrados dos resíduos menor.

---

## 4. Exemplo Resolvido Passo a Passo

**Situação** (números ilustrativos): um professor anotou as horas de estudo na semana da prova e a nota (de 0 a 10) de 8 alunos. Queremos a reta que relaciona nota e horas, e a previsão para quem estudou 14 horas.

### 4.1 Dados e somas

$n = 8$ pares. Na tabela, cada coluna é calculada linha a linha e somada na última linha:

| Aluno | $x_i$ (horas) | $y_i$ (nota) | $x_i^2$ | $y_i^2$ | $x_i y_i$ |
|---|---|---|---|---|---|
| 1 | 5 | 6 | 25 | 36 | 30 |
| 2 | 7 | 7 | 49 | 49 | 49 |
| 3 | 8 | 7,5 | 64 | 56,25 | 60 |
| 4 | 10 | 8 | 100 | 64 | 80 |
| 5 | 12 | 8,5 | 144 | 72,25 | 102 |
| 6 | 15 | 9 | 225 | 81 | 135 |
| 7 | 18 | 9,5 | 324 | 90,25 | 171 |
| 8 | 20 | 10 | 400 | 100 | 200 |
| **Soma** | **95** | **65,5** | **1331** | **548,75** | **827** |

### 4.2 Médias

$$
\bar{x} = \frac{\sum x_i}{n} = \frac{95}{8} = 11{,}875 \text{ horas}
$$

$$
\bar{y} = \frac{\sum y_i}{n} = \frac{65{,}5}{8} = 8{,}1875 \text{ pontos}
$$

### 4.3 Somas de desvios

Pelas formas de cálculo da seção 3:

$$
n\bar{x}\bar{y} = 8 \times 11{,}875 \times 8{,}1875 = 95 \times 8{,}1875 = 777{,}8125
$$

$$
S_{xy} = \sum x_i y_i - n\bar{x}\bar{y} = 827 - 777{,}8125 = 49{,}1875
$$

$$
n\bar{x}^2 = 8 \times 11{,}875^2 = 8 \times 141{,}015625 = 1128{,}125
$$

$$
S_{xx} = \sum x_i^2 - n\bar{x}^2 = 1331 - 1128{,}125 = 202{,}875
$$

$$
n\bar{y}^2 = 8 \times 8{,}1875^2 = 8 \times 67{,}03515625 = 536{,}28125
$$

$$
S_{yy} = \sum y_i^2 - n\bar{y}^2 = 548{,}75 - 536{,}28125 = 12{,}46875
$$

### 4.4 Inclinação e intercepto

$$
b = \frac{S_{xy}}{S_{xx}} = \frac{49{,}1875}{202{,}875} = 0{,}242452\ldots \approx 0{,}24245 \text{ ponto por hora}
$$

$$
a = \bar{y} - b\,\bar{x} = 8{,}1875 - 0{,}242452\ldots \times 11{,}875 = 8{,}1875 - 2{,}879120\ldots = 5{,}308380\ldots \approx 5{,}30838 \text{ pontos}
$$

(As contas usam $b$ com todas as casas; os valores exatos são $b = 787/3246$ e $a = 17\,231/3246$.)

**Reta ajustada:**

$$
\hat{y} = 5{,}30838 + 0{,}24245\,x
$$

### 4.5 Previsão para 14 horas

Substituindo $x = 14$ na reta, com os coeficientes completos:

$$
\hat{y} = 5{,}308380\ldots + 0{,}242452\ldots \times 14 = 5{,}308380\ldots + 3{,}394331\ldots = 8{,}702711\ldots \approx 8{,}70 \text{ pontos}
$$

Cuidado com o arredondamento: com os coeficientes cortados em duas casas ($5{,}31 + 0{,}24 \times 14$) sairia 8,67, que já difere na segunda casa. Arredonde só o resultado final.

### 4.6 Interpretação dos coeficientes

- **Inclinação ($b \approx 0{,}24$):** entre esses alunos, cada hora a mais de estudo está associada a uma nota, em média, cerca de 0,24 ponto maior. Isso é uma **associação**, não prova de que estudar mais **causa** a nota maior: alunos que estudam mais podem diferir em outras coisas (interesse, tempo livre, base anterior). Para afirmar causa seria preciso um experimento.
- **Intercepto ($a \approx 5{,}31$):** é a nota que a reta dá para $x = 0$. Como nenhum aluno estudou menos de 5 horas, esse valor é uma **extrapolação** e não deve ser lido como "a nota de quem não estuda". Aqui ele só serve para posicionar a reta.
- **Previsão ($\approx 8{,}70$):** é uma estimativa da nota **média** de alunos que estudam 14 horas. Um aluno específico pode ficar acima ou abaixo (seção 7).

---

## 5. Quanto a Reta Explica: R²

O **coeficiente de determinação** $R^2$ é a fração da variação de $Y$ em torno da sua média que a reta reproduz:

$$
R^2 = 1 - \frac{SQ_{\text{res}}}{S_{yy}} = \frac{S_{xy}^2}{S_{xx}\,S_{yy}}
$$

Ele fica entre 0 (a reta não ajuda nada além da média $\bar{y}$) e 1 (todos os pontos sobre a reta). Na regressão linear simples, $R^2$ é o quadrado da [correlação de Pearson]({{ '/pt/estatistica-descritiva/analise-exploratoria' | relative_url }}) $r$.

**Conta no exemplo.** A soma dos quadrados dos resíduos pode ser obtida por $SQ_{\text{res}} = S_{yy} - b\,S_{xy}$:

$$
SQ_{\text{res}} = 12{,}46875 - 0{,}242452\ldots \times 49{,}1875 = 12{,}46875 - 11{,}925619\ldots = 0{,}543130\ldots
$$

$$
R^2 = 1 - \frac{0{,}543130\ldots}{12{,}46875} = 1 - 0{,}043559\ldots = 0{,}956441\ldots \approx 0{,}9564
$$

Conferência pela outra fórmula: $\frac{49{,}1875^2}{202{,}875 \times 12{,}46875} = \frac{2419{,}41016}{2529{,}59766} \approx 0{,}9564$. A correlação é $r = \sqrt{0{,}9564} \approx 0{,}978$ (positiva, como $b$).

**Interpretação:** cerca de 96% da variação das notas desses 8 alunos em torno da média acompanha a reta das horas de estudo. **R² alto não garante que o modelo esteja certo**: a seção 6 mostra que, neste exemplo, a relação não é exatamente uma reta. E $R^2$ não diz nada sobre causa.

---

## 6. Olhe os Resíduos

O gráfico abaixo mostra os dados com a reta (à esquerda) e os resíduos $e_i = y_i - \hat{y}_i$ (à direita):

![À esquerda, os oito pontos de horas de estudo e nota com a reta ajustada; à direita, os resíduos, negativos nas pontas e positivos no meio, formando um arco]({{ site.baseurl }}/assets/images/regressao_linear.png){:style="max-width: 900px; display: block; margin: 1em auto;"}
<div class="image-caption" style="text-align: center;">Figura 1. Reta de mínimos quadrados e resíduos do exemplo. Os resíduos formam um arco: a reta fica acima dos dados nas pontas e abaixo no meio.</div>

| $x_i$ | 5 | 7 | 8 | 10 | 12 | 15 | 18 | 20 |
|---|---|---|---|---|---|---|---|---|
| $\hat{y}_i$ | 6,521 | 7,006 | 7,248 | 7,733 | 8,218 | 8,945 | 9,673 | 10,157 |
| $e_i$ | −0,521 | −0,006 | 0,252 | 0,267 | 0,282 | 0,055 | −0,173 | −0,157 |

Os resíduos somam zero (como dito na seção 3), mas **não estão espalhados ao acaso**: são negativos nas pontas e positivos no meio. Esse arco indica que a nota cresce cada vez mais devagar com as horas, ou seja, a relação é **curva**. Faz sentido: a nota tem teto (10), e uma reta vai passar dele. A reta continua sendo um resumo útil dentro do intervalo observado, mas um modelo curvo descreveria melhor os dados.

Por isso a regra: **sempre olhe o gráfico de resíduos**, não só o $R^2$.

---

## 7. Inferência: o Quanto Confiar na Reta

As estimativas $a$ e $b$ mudariam com outra amostra de alunos. Para medir essa incerteza, o modelo supõe que os erros $\varepsilon$ são **independentes**, têm **média zero e variância constante** $\sigma^2$ ao longo de $X$ e, para os intervalos e testes com poucas observações, **distribuição normal**. Neste exemplo, a seção 6 já mostrou que a forma linear não é perfeita; os números abaixo valem como ilustração do método.

**Desvio padrão dos resíduos** (estimativa de $\sigma$), com $n - 2$ graus de liberdade, porque dois parâmetros foram estimados:

$$
s = \sqrt{\frac{SQ_{\text{res}}}{n - 2}} = \sqrt{\frac{0{,}543130\ldots}{6}} = \sqrt{0{,}090522\ldots} \approx 0{,}3009 \text{ ponto}
$$

**Erro padrão da inclinação:**

$$
EP(b) = \frac{s}{\sqrt{S_{xx}}} = \frac{0{,}300868\ldots}{\sqrt{202{,}875}} = \frac{0{,}300868\ldots}{14{,}243419\ldots} \approx 0{,}02112
$$

**Teste de $H_0: \beta_1 = 0$** (nenhuma relação linear) contra $H_1: \beta_1 \neq 0$:

$$
t = \frac{b}{EP(b)} = \frac{0{,}242452\ldots}{0{,}021123\ldots} \approx 11{,}48 \quad \text{com } 6 \text{ graus de liberdade}
$$

O p-valor é cerca de 0,000026 (calculado pelo GLM.jl, seção 8), muito abaixo de 0,05: há forte evidência de relação **linear crescente** entre horas e nota nesta população de alunos (se os pressupostos valerem).

**Intervalo de confiança de 95% para a inclinação**, com $t_{0{,}025;\,6} = 2{,}447$ (tabela t):

$$
b \pm t \times EP(b) = 0{,}24245 \pm 2{,}447 \times 0{,}02112 = 0{,}24245 \pm 0{,}05169 = [0{,}1908;\ 0{,}2941]
$$

**Duas previsões diferentes para 14 horas** (calculadas pelo GLM.jl, seção 8):

- **intervalo de confiança para a nota média** de alunos que estudam 14 horas: [8,42; 8,99];
- **intervalo de previsão para a nota de um aluno** que estuda 14 horas: [7,91; 9,49].

O segundo é bem mais largo porque soma a incerteza sobre a reta com a variação de cada aluno em torno dela. Confundir os dois é um erro comum: a reta prevê bem a **média**, não cada indivíduo.

---

## 8. Código em Julia

Cada bloco roda sozinho. O primeiro refaz as contas da página e confere com o pacote GLM.jl.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Statistics, DataFrames, GLM

# Horas de estudo (X) e nota na prova (Y) de 8 alunos (números ilustrativos)
horas = [5, 7, 8, 10, 12, 15, 18, 20]
notas = [6, 7, 7.5, 8, 8.5, 9, 9.5, 10]
n = length(horas)

# Mínimos quadrados "à mão", com as somas centradas
media_x, media_y = mean(horas), mean(notas)
Sxx = sum((horas .- media_x) .^ 2)
Sxy = sum((horas .- media_x) .* (notas .- media_y))
Syy = sum((notas .- media_y) .^ 2)
b = Sxy / Sxx                  # inclinação
a = media_y - b * media_x      # intercepto

previstas = a .+ b .* horas
residuos = notas .- previstas
SQres = sum(residuos .^ 2)
R2 = 1 - SQres / Syy

println("x̄ = ", media_x, "   ȳ = ", media_y)
println("Sxx = ", Sxx, "   Sxy = ", Sxy, "   Syy = ", Syy)
println("b = ", round(b, digits = 5), "   a = ", round(a, digits = 5))
println("R² = ", round(R2, digits = 4), "   r = ", round(cor(horas, notas), digits = 4))
println("Previsão para 14 h: ", round(a + b * 14, digits = 4))

# Conferência com o GLM.jl
dados = DataFrame(horas = horas, nota = notas)
modelo = lm(@formula(nota ~ horas), dados)
show(stdout, MIME("text/plain"), coeftable(modelo))
println()
println(predict(modelo, DataFrame(horas = [14]); interval = :confidence, level = 0.95))
println(predict(modelo, DataFrame(horas = [14]); interval = :prediction, level = 0.95))</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">x̄ = 11.875   ȳ = 8.1875
Sxx = 202.875   Sxy = 49.1875   Syy = 12.46875
b = 0.24245   a = 5.30838
R² = 0.9564   r = 0.978
Previsão para 14 h: 8.7027
────────────────────────────────────────────────────────────────────────
                Coef.  Std. Error      t  Pr(&gt;|t|)  Lower 95%  Upper 95%
────────────────────────────────────────────────────────────────────────
(Intercept)  5.30838    0.272462   19.48    &lt;1e-05   4.64169    5.97507
horas        0.242452   0.0211233  11.48    &lt;1e-04   0.190765   0.294139
────────────────────────────────────────────────────────────────────────
1×3 DataFrame
 Row │ prediction  lower     upper
     │ Float64?    Float64?  Float64?
─────┼────────────────────────────────
   1 │    8.70271    8.4202   8.98522
1×3 DataFrame
 Row │ prediction  lower     upper
     │ Float64?    Float64?  Float64?
─────┼────────────────────────────────
   1 │    8.70271   7.91417   9.49125</pre>
</div>

Na tabela do GLM.jl, `Std. Error` é o erro padrão, `t` a estatística do teste de coeficiente igual a zero, `Pr(>|t|)` o p-valor (`<1e-04` quer dizer menor que 0,0001) e `Lower 95%`/`Upper 95%` os limites do intervalo de confiança. As duas últimas tabelas são o intervalo de confiança da média (`:confidence`) e o de previsão (`:prediction`) para 14 horas.

O segundo bloco gera a figura 1:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Plots, Statistics

horas = [5, 7, 8, 10, 12, 15, 18, 20]
notas = [6, 7, 7.5, 8, 8.5, 9, 9.5, 10]
b = sum((horas .- mean(horas)) .* (notas .- mean(notas))) / sum((horas .- mean(horas)) .^ 2)
a = mean(notas) - b * mean(horas)
residuos = notas .- (a .+ b .* horas)

p1 = scatter(horas, notas, label = "Dados", xlabel = "Horas de estudo", ylabel = "Nota",
             title = "Reta de mínimos quadrados", markersize = 6, legend = :bottomright)
plot!(p1, [5, 20], a .+ b .* [5, 20], lw = 2, color = :crimson, label = "Reta ajustada")

p2 = scatter(horas, residuos, label = "", xlabel = "Horas de estudo", ylabel = "Resíduo (nota − prevista)",
             title = "Resíduos", markersize = 6)
hline!(p2, [0], ls = :dash, color = :black, label = "")

savefig(plot(p1, p2, layout = (1, 2), size = (900, 380), margin = 5Plots.mm), "regressao_linear.png")</code></pre>
  </div>
</div>

---

## 9. Calculadora

Os dados iniciais são os do exemplo. Adicione ou remova pares para ver a reta, o $R^2$ e o passo a passo mudarem.

<style>
  #regressao-linear-calc button { padding: 0.35em 1em; border: 1px solid var(--mk-border-strong); border-radius: 6px; background: var(--mk-surface); color: var(--mk-ink); cursor: pointer; }
  #regressao-linear-calc button:focus-visible, #regressao-linear-calc input:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  #regressao-linear-calc .rl-remover { padding: 0.15em 0.6em; font-size: 0.9em; }
  #regressao-linear-calc td { padding: 3px 8px; }
</style>

<div id="regressao-linear-calc" data-lang="pt" style="max-width: 640px; margin: 2em auto; padding: 1.5em 2em; background: var(--mk-surface-2); color: var(--mk-ink); border: 1px solid var(--mk-border); border-radius: 10px;">
  <h3 style="text-align: center; margin-top: 0;">Calculadora de regressão linear simples</h3>
  <form id="rl-form-adicionar" style="display: flex; gap: 0.6em; flex-wrap: wrap; justify-content: center; align-items: end; margin-bottom: 0.5em;">
    <label>X<br><input id="rl-x" type="number" step="any" inputmode="decimal" style="width: 7em; padding: 0.3em;"></label>
    <label>Y<br><input id="rl-y" type="number" step="any" inputmode="decimal" style="width: 7em; padding: 0.3em;"></label>
    <button type="submit" style="padding: 0.35em 1em;">Adicionar par</button>
    <button type="button" id="rl-restaurar" style="padding: 0.35em 1em;">Restaurar exemplo</button>
  </form>
  <p id="rl-aviso" role="alert" style="text-align: center; min-height: 1.2em; margin: 0.3em 0;"></p>
  <table style="width: 100%; margin-bottom: 1em; border-collapse: collapse;">
    <caption style="caption-side: top; text-align: left; font-size: 0.9em;">Pares (X; Y)</caption>
    <thead>
      <tr><th scope="col" style="padding: 4px 8px; text-align: left;">X</th><th scope="col" style="padding: 4px 8px; text-align: left;">Y</th><th scope="col"><span style="position: absolute; left: -9999px;">Ação</span></th></tr>
    </thead>
    <tbody id="rl-tabela-corpo"></tbody>
  </table>
  <label for="rl-prev-x"><strong>Prever Y para X =</strong></label>
  <input id="rl-prev-x" type="number" step="any" inputmode="decimal" style="width: 7em; padding: 0.3em;">
  <div id="rl-resultado" aria-live="polite" style="margin-top: 1em; padding: 0.8em 1em; background: var(--mk-surface); border: 1px solid var(--mk-border); border-radius: 6px;"></div>
</div>

<script src="{{ site.baseurl }}/assets/js/regressao-linear-calc.js"></script>

A calculadora usa as fórmulas da seção 3, com as somas de desvios calculadas diretamente (mais precisas no computador que as formas $\sum x_i^2 - n\bar{x}^2$ quando os números são grandes). Ela recusa conjuntos em que todos os X são iguais e avisa quando a previsão é uma extrapolação.

---

## 10. Quando Usar e Quando Não Usar

**Use** quando:

- as duas variáveis são quantitativas;
- o gráfico de dispersão mostra uma tendência aproximadamente reta;
- o objetivo é descrever a relação, ou prever $Y$ **dentro** do intervalo de $X$ observado.

**Não use, ou use com cuidado,** quando:

- **a relação é curva** (como no exemplo, em parte): a reta resume mal e os resíduos mostram padrão. Transformar as variáveis ou usar um modelo curvo pode ser melhor;
- **para extrapolar**: no exemplo, a reta prevê para 25 horas $\hat{y} = 5{,}30838 + 0{,}24245 \times 25 \approx 11{,}37$, uma nota impossível numa prova de 0 a 10;
- **há valores atípicos ou pontos influentes**: um único ponto longe dos outros pode mudar muito a reta. Ajuste com e sem ele e compare;
- **a variação dos resíduos muda com $X$** (forma de funil): os erros padrão e os intervalos ficam errados;
- **as observações não são independentes** (medidas repetidas da mesma pessoa, dados no tempo): veja [Séries Temporais]({{ '/pt/analise-de-dados/series-temporais' | relative_url }});
- **o objetivo é provar causa** com dados observacionais: a regressão mostra associação, como a correlação.

---

## 11. Resumo

- O modelo é $Y = \beta_0 + \beta_1 X + \varepsilon$; a reta de mínimos quadrados é $\hat{y} = a + bx$, com $b = S_{xy}/S_{xx}$ e $a = \bar{y} - b\bar{x}$.
- No exemplo: $\hat{y} = 5{,}30838 + 0{,}24245\,x$, $R^2 \approx 0{,}9564$, previsão de 8,70 pontos para 14 horas.
- A inclinação mede associação, não causa; o intercepto pode não ter sentido fora dos dados.
- $R^2$ alto não basta: os resíduos do exemplo mostram curvatura.
- Previsão para a média e previsão para um indivíduo têm intervalos diferentes.
- Não extrapole para fora do intervalo de $X$ observado.

---

## Referências

1. Draper, N. R.; Smith, H. (1998). *Applied Regression Analysis*. 3rd ed. Wiley.
2. Montgomery, D. C.; Peck, E. A.; Vining, G. G. (2012). *Introduction to Linear Regression Analysis*. 5th ed. Wiley.
3. Triola, M. F. (2024). *Introdução à Estatística*. 14. ed. LTC.
