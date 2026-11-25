---
layout: page
title: Análise Multivariada
lang: pt
ref: analise-multivariada
parent: analise-de-dados
permalink: /pt/analise-de-dados/analise-multivariada
order: 3
mathjax: true
description: "Análise multivariada na prática: regressão múltipla com VIF e intervalos, PCA e biplot com os dados íris e k-means, com código em Julia e saídas reais."
---

<img src="{{ site.baseurl }}/assets/images/multivariate.avif" alt="Ilustração de um analista diante do computador, com um quadro na parede mostrando pontos de dois grupos sob o título Multivariate Analysis" style="max-width: 600px; display: block; margin: 1em auto;">

A **análise multivariada** reúne as técnicas estatísticas que olham **várias variáveis ao mesmo tempo**. Em vez de estudar a nota de um aluno só contra as horas de estudo, ela pergunta, por exemplo, quanto as horas de estudo, as horas de sono e a motivação explicam juntas, e quanto cada uma acrescenta quando as outras já estão no modelo.

Esta página apresenta as famílias de técnicas e resolve três delas com dados e código: **regressão linear múltipla**, **análise de componentes principais (PCA)** com biplot e **agrupamento k-means**.

---

## 1. O que é Análise Multivariada?

A análise **univariada** estuda uma variável (a média das notas); a **bivariada**, duas (a correlação entre horas de estudo e nota). A **multivariada** considera três ou mais variáveis simultaneamente. Isso importa porque as variáveis costumam andar juntas: quem dorme mais também pode estar mais motivado, e olhar só o sono contra a nota mistura o efeito das duas coisas.

### 1.1 Principais técnicas

**Técnicas de dependência**: uma ou mais variáveis são tratadas como resposta, explicadas pelas demais.

- **Regressão linear múltipla**: explica uma resposta quantitativa por várias variáveis explicativas.
- **Regressão logística**: a resposta é categórica (por exemplo, aprovado ou reprovado).
- **Análise discriminante**: classifica observações em grupos já conhecidos a partir de várias medidas.

**Técnicas de interdependência**: nenhuma variável é a resposta; o objetivo é descrever a estrutura do conjunto.

- **Análise de componentes principais (PCA)**: resume muitas variáveis correlacionadas em poucas combinações não correlacionadas.
- **Análise fatorial**: procura fatores não observados (latentes) que expliquem as correlações.
- **Análise de agrupamento** (clusterização): forma grupos de observações parecidas.
- **Análise de correspondência** (simples e múltipla): descreve associações entre variáveis categóricas; faz para tabelas de contagem um papel parecido com o do PCA.

**Outras técnicas**, mais avançadas:

- **Séries temporais multivariadas**: várias séries observadas ao longo do tempo (veja [Séries Temporais]({{ '/pt/analise-de-dados/series-temporais' | relative_url }}) para o caso de uma série).
- **Modelos de equações estruturais**: relacionam variáveis latentes e observadas num sistema de equações. As relações causais do modelo são hipóteses de quem o propõe; o ajuste aos dados não as prova.
- **Análise de correlação canônica**: mede a associação entre dois conjuntos de variáveis.

---

## 2. Regressão Linear Múltipla

A regressão linear múltipla estende a [regressão linear simples]({{ '/pt/analise-de-dados/regressao-linear' | relative_url }}) para várias variáveis explicativas.

### 2.1 O modelo

$$
Y = \beta_0 + \beta_1X_1 + \beta_2X_2 + \cdots + \beta_pX_p + \varepsilon
$$

Onde:
- $$Y$$ é a variável resposta;
- $$X_1, X_2, \ldots, X_p$$ são as $$p$$ variáveis explicativas;
- $$\beta_0$$ é o intercepto: o valor esperado de $$Y$$ quando todas as $$X$$ valem zero (muitas vezes uma situação fora dos dados, sem interpretação prática);
- $$\beta_j$$ é a variação esperada de $$Y$$ quando $$X_j$$ aumenta uma unidade **e as outras $$X$$ ficam fixas**;
- $$\varepsilon$$ é o erro aleatório: o que o modelo não explica.

Os coeficientes são estimados por **mínimos quadrados**: os valores $$b_0, b_1, \ldots, b_p$$ que tornam mínima a soma dos quadrados dos resíduos $$e_i = y_i - \hat{y}_i$$, em que $$\hat{y}_i = b_0 + b_1x_{i1} + \cdots + b_px_{ip}$$ é o valor previsto para a observação $$i$$.

### 2.2 Hipóteses do modelo

1. **Linearidade**: o valor esperado de $$Y$$ é uma combinação linear das $$X$$ (o modelo pode incluir termos como $$X^2$$; "linear" se refere aos coeficientes).
2. **Independência**: os erros de observações diferentes são independentes (falha, por exemplo, com medidas repetidas da mesma pessoa ou dados no tempo).
3. **Homocedasticidade**: a variância dos erros é a mesma para todos os valores das $$X$$.
4. **Normalidade dos erros**: necessária para os testes t e F e para os intervalos com amostras pequenas; não é necessária para calcular as estimativas.
5. **Sem colinearidade perfeita**: nenhuma $$X$$ pode ser combinação linear exata das outras. Correlação alta, mas não perfeita, entre as $$X$$ (multicolinearidade) não impede o ajuste, mas torna os coeficientes instáveis e os erros padrão grandes; ela é medida pelo VIF (seção 3.3).

---

## 3. Exemplo Resolvido: Nota, Estudo, Sono e Motivação

### 3.1 Os dados

Os dados abaixo são **ilustrativos, inventados** para o exemplo: 16 estudantes, com horas de estudo na semana da prova, horas de sono por noite, motivação declarada (escala de 1 a 10) e nota na prova (0 a 10). Os oito primeiros estudantes têm as mesmas horas de estudo e notas do exemplo da página de [Regressão Linear]({{ '/pt/analise-de-dados/regressao-linear' | relative_url }}).

| Estudante | Horas de estudo | Horas de sono | Motivação (1–10) | Nota |
|---|---|---|---|---|
| 1 | 5 | 6 | 7 | 6,0 |
| 2 | 7 | 7 | 8 | 7,0 |
| 3 | 8 | 6 | 6 | 7,5 |
| 4 | 10 | 8 | 9 | 8,0 |
| 5 | 12 | 7 | 8 | 8,5 |
| 6 | 15 | 9 | 9 | 9,0 |
| 7 | 18 | 8 | 9 | 9,5 |
| 8 | 20 | 7 | 10 | 10,0 |
| 9 | 6 | 5 | 5 | 5,5 |
| 10 | 9 | 8 | 7 | 7,8 |
| 11 | 11 | 6 | 8 | 8,2 |
| 12 | 14 | 9 | 9 | 8,8 |
| 13 | 16 | 7 | 8 | 9,2 |
| 14 | 19 | 8 | 9 | 9,6 |
| 15 | 22 | 6 | 7 | 8,5 |
| 16 | 25 | 7 | 8 | 9,1 |

O primeiro bloco resume as variáveis e calcula a matriz de correlação de Pearson. Os blocos de código desta página rodam sozinhos (cada um traz os próprios dados) e as saídas foram copiadas da execução; nelas, o separador decimal é o ponto.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>using DataFrames, Statistics

# Dados ilustrativos (inventados): 16 estudantes
dados = DataFrame(
    HorasEstudo = [5, 7, 8, 10, 12, 15, 18, 20, 6, 9, 11, 14, 16, 19, 22, 25],
    HorasSono   = [6, 7, 6, 8, 7, 9, 8, 7, 5, 8, 6, 9, 7, 8, 6, 7],
    Motivacao   = [7, 8, 6, 9, 8, 9, 9, 10, 5, 7, 8, 9, 8, 9, 7, 8],
    Nota        = [6.0, 7.0, 7.5, 8.0, 8.5, 9.0, 9.5, 10.0, 5.5, 7.8, 8.2, 8.8, 9.2, 9.6, 8.5, 9.1]
)

# Resumo de cada variável
println(describe(dados, :mean, :std, :min, :median, :max))

# Matriz de correlação de Pearson entre as quatro variáveis
R = cor(Matrix(dados))
println(DataFrame(round.(R, digits = 3), names(dados)))</code></pre>
  </div>
</div>

<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">4×6 DataFrame
 Row │ variable     mean     std      min   median   max
     │ Symbol       Float64  Float64  Real  Float64  Real
─────┼────────────────────────────────────────────────────
   1 │ HorasEstudo  13.5625  6.04394   5       13.0  25
   2 │ HorasSono     7.125   1.14746   5        7.0   9
   3 │ Motivacao     7.9375  1.28938   5        8.0  10
   4 │ Nota          8.2625  1.26695   5.5      8.5  10.0
4×4 DataFrame
 Row │ HorasEstudo  HorasSono  Motivacao  Nota
     │ Float64      Float64    Float64    Float64
─────┼────────────────────────────────────────────
   1 │       1.0        0.278      0.51     0.825
   2 │       0.278      1.0        0.727    0.586
   3 │       0.51       0.727      1.0      0.79
   4 │       0.825      0.586      0.79     1.0</pre>
</div>

**Como ler.** As três variáveis explicativas se correlacionam positivamente com a nota (0,825; 0,586; 0,790). Mas elas também se correlacionam entre si: sono e motivação têm $$r = 0{,}727$$. Por isso a correlação de 0,586 entre sono e nota não diz quanto o sono acrescenta **por si**: parte dela pode vir da motivação, que anda junto com o sono. É exatamente essa separação que a regressão múltipla tenta fazer.

### 3.2 Ajuste do modelo

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>using DataFrames, GLM, Statistics, HypothesisTests

# Dados ilustrativos (inventados): 16 estudantes
dados = DataFrame(
    HorasEstudo = [5, 7, 8, 10, 12, 15, 18, 20, 6, 9, 11, 14, 16, 19, 22, 25],
    HorasSono   = [6, 7, 6, 8, 7, 9, 8, 7, 5, 8, 6, 9, 7, 8, 6, 7],
    Motivacao   = [7, 8, 6, 9, 8, 9, 9, 10, 5, 7, 8, 9, 8, 9, 7, 8],
    Nota        = [6.0, 7.0, 7.5, 8.0, 8.5, 9.0, 9.5, 10.0, 5.5, 7.8, 8.2, 8.8, 9.2, 9.6, 8.5, 9.1]
)

# Regressão linear múltipla por mínimos quadrados
modelo = lm(@formula(Nota ~ HorasEstudo + HorasSono + Motivacao), dados)
display(coeftable(modelo))

# Nomes diferentes das funções r2 e adjr2, para não sobrescrevê-las
R2   = r2(modelo)
R2aj = adjr2(modelo)
println("R² = ", round(R2, digits = 4), "   R² ajustado = ", round(R2aj, digits = 4))

# Teste F global: H₀: β₁ = β₂ = β₃ = 0
println(ftest(modelo.model))

# Normalidade dos resíduos (com n = 16, o teste tem pouco poder)
residuos = residuals(modelo)
println("Shapiro-Wilk: p-valor = ", round(pvalue(ShapiroWilkTest(residuos)), digits = 4))

# VIF: regride cada variável explicativa nas outras duas; VIF = 1 / (1 − R²ⱼ)
explicativas = [:HorasEstudo, :HorasSono, :Motivacao]
for alvo in explicativas
    outras = setdiff(explicativas, [alvo])
    r2j = r2(lm(Term(alvo) ~ Term(outras[1]) + Term(outras[2]), dados))
    println("VIF de ", alvo, " = ", round(1 / (1 - r2j), digits = 3))
end</code></pre>
  </div>
</div>

<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">────────────────────────────────────────────────────────────────────────
                Coef.  Std. Error     t  Pr(&gt;|t|)   Lower 95%  Upper 95%
────────────────────────────────────────────────────────────────────────
(Intercept)  2.45605    0.876519   2.80    0.0160   0.546279    4.36582
HorasEstudo  0.123207   0.0252597  4.88    0.0004   0.0681712   0.178244
HorasSono    0.154719   0.166622   0.93    0.3714  -0.208319    0.517758
Motivacao    0.38212    0.16556    2.31    0.0396   0.0213943   0.742845
────────────────────────────────────────────────────────────────────────
R² = 0.8742   R² ajustado = 0.8427
F-test against the null model:
F-statistic: 27.79 on 16 observations and 3 degrees of freedom, p-value: &lt;1e-04
Shapiro-Wilk: p-valor = 0.7151
VIF de HorasEstudo = 1.385
VIF de HorasSono = 2.172
VIF de Motivacao = 2.707</pre>
</div>

**Os coeficientes.** A reta ajustada é

$$
\widehat{\text{Nota}} = 2{,}456 + 0{,}1232 \cdot \text{Estudo} + 0{,}1547 \cdot \text{Sono} + 0{,}3821 \cdot \text{Motivação}
$$

- **Horas de estudo** ($$b_1 = 0{,}1232$$; p-valor $$= 0{,}0004$$): entre estudantes com o mesmo sono e a mesma motivação, cada hora a mais de estudo está associada a uma nota prevista 0,12 ponto maior. O intervalo de 95% vai de 0,068 a 0,178.
- **Motivação** ($$b_3 = 0{,}3821$$; p-valor $$= 0{,}040$$): com estudo e sono fixos, cada ponto a mais na escala de motivação está associado a 0,38 ponto a mais na nota prevista (intervalo de 95%: 0,021 a 0,743, bem largo).
- **Horas de sono** ($$b_2 = 0{,}1547$$; p-valor $$= 0{,}37$$): o intervalo de 95%, de −0,208 a 0,518, inclui o zero. Com estudo e motivação já no modelo, estes 16 estudantes não permitem dizer se o sono acrescenta algo. Isso **não** prova que o sono não importa: a amostra é pequena e o sono está muito ligado à motivação ($$r = 0{,}727$$), o que dificulta separar os dois efeitos.
- **Intercepto** ($$b_0 = 2{,}456$$): seria a nota prevista com zero hora de estudo, zero hora de sono e motivação zero, uma combinação que não existe nos dados (e motivação zero nem está na escala). Ele serve para posicionar o plano, não para ser interpretado.

Os dados são observacionais: os coeficientes medem **associação**, não efeito causal. Um estudante que passe a estudar uma hora a mais não ganha, necessariamente, 0,12 ponto.

**Não compare os coeficientes para dizer qual variável "importa mais".** Eles estão em unidades diferentes (ponto por hora; ponto por ponto de motivação): medir o estudo em minutos dividiria o coeficiente por 60 sem mudar nada no modelo. Para comparar, use os p-valores e intervalos, coeficientes padronizados ou o quanto o $$R^2$$ cai ao retirar a variável.

**R² e R² ajustado.** Com a soma dos quadrados dos resíduos $$SQ_{res} = 3{,}0298$$ e a soma dos quadrados total $$SQ_{tot} = \sum (y_i - \bar{y})^2 = 24{,}0775$$:

$$
R^2 = 1 - \frac{SQ_{res}}{SQ_{tot}} = 1 - \frac{3{,}0298}{24{,}0775} = 1 - 0{,}1258 = 0{,}8742
$$

O modelo explica 87,4% da variação das notas **nesta amostra**. O $$R^2$$ nunca diminui quando se acrescenta uma variável, mesmo inútil; o **$$R^2$$ ajustado** desconta o número de variáveis ($$p = 3$$) e o tamanho da amostra ($$n = 16$$):

$$
R^2_{aj} = 1 - (1 - R^2)\,\frac{n-1}{n-p-1} = 1 - 0{,}12584 \times \frac{15}{12} = 1 - 0{,}15729 = 0{,}8427
$$

(As contas usam os valores com todas as casas; os números exibidos estão arredondados.)

**Teste F global.** Testa $$H_0: \beta_1 = \beta_2 = \beta_3 = 0$$ (nenhuma das três variáveis está associada à nota) contra a alternativa de que pelo menos um coeficiente é diferente de zero:

$$
F = \frac{R^2 / p}{(1 - R^2)/(n - p - 1)} = \frac{0{,}8742 / 3}{0{,}1258 / 12} = \frac{0{,}29139}{0{,}010486} = 27{,}79
$$

com 3 e 12 graus de liberdade. O p-valor, calculado pela distribuição F(3, 12), é $$1{,}1 \times 10^{-5}$$ (a saída mostra só que é menor que $$10^{-4}$$). Rejeitamos $$H_0$$ ao nível de 5%. O teste não diz **qual** variável importa; para isso servem os testes t de cada coeficiente.

**Resíduos.** O teste de Shapiro-Wilk dá p-valor $$= 0{,}715$$: não há evidência contra a normalidade dos resíduos. Com só 16 observações, porém, o teste tem pouco poder; isso não prova que os erros são normais. Vale olhar também o gráfico dos resíduos contra os valores previstos, como na página de [Regressão Linear]({{ '/pt/analise-de-dados/regressao-linear' | relative_url }}).

### 3.3 Multicolinearidade: o VIF

O **fator de inflação da variância** (VIF) da variável $$X_j$$ é

$$
VIF_j = \frac{1}{1 - R^2_j}
$$

em que $$R^2_j$$ é o $$R^2$$ da regressão de $$X_j$$ nas **outras** variáveis explicativas. Se $$X_j$$ não tem relação linear com as outras, $$R^2_j = 0$$ e $$VIF_j = 1$$; quanto mais ela é prevista pelas outras, maior o VIF, e mais incerto fica o seu coeficiente. No exemplo, a motivação tem $$R^2_3 = 0{,}6306$$, então $$VIF_3 = 1/(1 - 0{,}6306) = 1/0{,}3694 = 2{,}707$$.

Os três VIF (1,385; 2,172; 2,707) estão longe dos limites usados como **regra de bolso** (5 ou 10, conforme o autor). Mesmo assim, a correlação entre sono e motivação ajuda a explicar o intervalo largo dos dois coeficientes.

### 3.4 Previsões e intervalos

Há dois intervalos diferentes para uma previsão:

- o **intervalo de confiança** estima a nota **média** de todos os estudantes com aquele perfil;
- o **intervalo de predição** estima a nota de **um** estudante com aquele perfil. Ele é sempre mais largo, porque soma a incerteza sobre a média à variação de um indivíduo em torno dela.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>using DataFrames, GLM

# Dados ilustrativos (inventados): 16 estudantes
dados = DataFrame(
    HorasEstudo = [5, 7, 8, 10, 12, 15, 18, 20, 6, 9, 11, 14, 16, 19, 22, 25],
    HorasSono   = [6, 7, 6, 8, 7, 9, 8, 7, 5, 8, 6, 9, 7, 8, 6, 7],
    Motivacao   = [7, 8, 6, 9, 8, 9, 9, 10, 5, 7, 8, 9, 8, 9, 7, 8],
    Nota        = [6.0, 7.0, 7.5, 8.0, 8.5, 9.0, 9.5, 10.0, 5.5, 7.8, 8.2, 8.8, 9.2, 9.6, 8.5, 9.1]
)
modelo = lm(@formula(Nota ~ HorasEstudo + HorasSono + Motivacao), dados)

# Três estudantes novos
novos = DataFrame(HorasEstudo = [14, 16, 18], HorasSono = [8, 7, 9], Motivacao = [8, 9, 8])

# Intervalo de confiança para a nota MÉDIA de quem tem esse perfil
media = predict(modelo, novos; interval = :confidence, level = 0.95)
# Intervalo de predição para a nota de UM estudante com esse perfil
individual = predict(modelo, novos; interval = :prediction, level = 0.95)

r(x) = round(x, digits = 2)
for i in 1:nrow(novos)
    println("Cenário $i (estudo = $(novos.HorasEstudo[i]) h, sono = $(novos.HorasSono[i]) h, ",
            "motivação = $(novos.Motivacao[i])): nota prevista = $(r(media.prediction[i]))")
    println("   IC 95% da média:        [$(r(media.lower[i])); $(r(media.upper[i]))]")
    println("   predição 95% individual: [$(r(individual.lower[i])); $(r(individual.upper[i]))]")
end</code></pre>
  </div>
</div>

<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">Cenário 1 (estudo = 14 h, sono = 8 h, motivação = 8): nota prevista = 8.48
   IC 95% da média:        [8.06; 8.89]
   predição 95% individual: [7.31; 9.64]
Cenário 2 (estudo = 16 h, sono = 7 h, motivação = 9): nota prevista = 8.95
   IC 95% da média:        [8.48; 9.41]
   predição 95% individual: [7.76; 10.14]
Cenário 3 (estudo = 18 h, sono = 9 h, motivação = 8): nota prevista = 9.12
   IC 95% da média:        [8.33; 9.91]
   predição 95% individual: [7.77; 10.47]</pre>
</div>

Para o cenário 1, a nota prevista é 8,48. A nota média de estudantes com esse perfil deve estar entre 8,06 e 8,89; a de um estudante, entre 7,31 e 9,64. Os 95% se referem ao **método**: intervalos construídos assim acertam em 95% das amostras, se o modelo estiver correto.

Nos cenários 2 e 3, o limite superior do intervalo de predição passa de 10, a nota máxima da prova. O modelo linear não sabe que a nota tem teto; perto dos limites da escala, as previsões precisam ser lidas com esse cuidado. O mesmo vale para perfis fora da faixa observada (extrapolação).

---

## 4. Análise de Componentes Principais (PCA)

### 4.1 A ideia

A **análise de componentes principais** troca as $$p$$ variáveis originais, que podem ser correlacionadas, por $$p$$ novas variáveis, as **componentes principais**, que são combinações lineares das originais, não correlacionadas entre si e ordenadas pela variância: a primeira (PC1) captura a maior variância possível, a segunda (PC2) a maior variância restante, e assim por diante. Se as primeiras componentes concentram quase toda a variância, elas resumem os dados com poucas dimensões.

### 4.2 Como se calcula

Seja $$\mathbf{X}$$ a matriz de dados $$n \times p$$ ($$n$$ observações nas linhas, $$p$$ variáveis nas colunas).

**Passo 1: padronização.** Cada variável $$j$$ é centrada na média e dividida pelo desvio padrão amostral:

$$
z_{ij} = \frac{x_{ij} - \bar{x}_j}{s_j}
$$

Sem padronizar, variáveis com números grandes (horas, de 5 a 25) dominariam as de números pequenos (sono, de 5 a 9) só por causa da unidade.

**Passo 2: matriz de correlação.** Com os dados padronizados na matriz $$\mathbf{Z}$$,

$$
\mathbf{R} = \frac{1}{n-1}\mathbf{Z}^T\mathbf{Z}
$$

é a matriz de correlação das variáveis originais.

**Passo 3: autovalores e autovetores.** A decomposição espectral

$$
\mathbf{R} = \mathbf{V}\mathbf{\Lambda}\mathbf{V}^T
$$

dá a matriz diagonal $$\mathbf{\Lambda}$$ dos autovalores $$\lambda_1 \geq \lambda_2 \geq \cdots \geq \lambda_p$$ e a matriz $$\mathbf{V}$$ cujas colunas são os autovetores, os **loadings** (pesos de cada variável em cada componente). O autovalor $$\lambda_j$$ é a variância da componente $$j$$; como cada variável padronizada tem variância 1, os autovalores somam $$p$$, e a componente $$j$$ explica a fração $$\lambda_j / p$$ da variância total.

**Passo 4: scores.** As coordenadas das observações nas componentes (os **scores**) são

$$
\mathbf{Y} = \mathbf{Z}\mathbf{V}
$$

O sinal de cada autovetor é arbitrário: programas diferentes podem trocar o sinal de uma componente inteira (loadings e scores juntos) sem mudar nada na análise.

### 4.3 PCA das variáveis do exemplo

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>using DataFrames, Statistics, MultivariateStats

# Dados ilustrativos (inventados): 16 estudantes
dados = DataFrame(
    HorasEstudo = [5, 7, 8, 10, 12, 15, 18, 20, 6, 9, 11, 14, 16, 19, 22, 25],
    HorasSono   = [6, 7, 6, 8, 7, 9, 8, 7, 5, 8, 6, 9, 7, 8, 6, 7],
    Motivacao   = [7, 8, 6, 9, 8, 9, 9, 10, 5, 7, 8, 9, 8, 9, 7, 8],
    Nota        = [6.0, 7.0, 7.5, 8.0, 8.5, 9.0, 9.5, 10.0, 5.5, 7.8, 8.2, 8.8, 9.2, 9.6, 8.5, 9.1]
)

# PCA só das variáveis explicativas, padronizadas (média 0, desvio padrão 1)
X = Matrix(select(dados, Not(:Nota)))
Z = (X .- mean(X, dims = 1)) ./ std(X, dims = 1)

# MultivariateStats espera uma variável por linha: por isso Z'
pca = fit(PCA, Z'; pratio = 1.0)          # pratio = 1.0 guarda todas as componentes
proporcao = principalvars(pca) ./ var(pca) # var(pca) = variância total

println("Autovalores: ", round.(principalvars(pca), digits = 4))
for (j, p) in enumerate(proporcao)
    println("PC$j explica ", round(100p, digits = 1), "% da variância")
end
println("Loadings (colunas = PC1, PC2, PC3):")
cargas = DataFrame(round.(projection(pca), digits = 3), ["PC1", "PC2", "PC3"])
insertcols!(cargas, 1, :Variavel =&gt; names(dados)[1:3])
println(cargas)</code></pre>
  </div>
</div>

<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">Autovalores: [2.0314, 0.7426, 0.226]
PC1 explica 67.7% da variância
PC2 explica 24.8% da variância
PC3 explica 7.5% da variância
Loadings (colunas = PC1, PC2, PC3):
3×4 DataFrame
 Row │ Variavel     PC1      PC2      PC3
     │ String       Float64  Float64  Float64
─────┼────────────────────────────────────────
   1 │ HorasEstudo   -0.48     0.833   -0.276
   2 │ HorasSono     -0.588   -0.539   -0.603
   3 │ Motivacao     -0.651   -0.127    0.748</pre>
</div>

Os três autovalores somam $$2{,}0314 + 0{,}7426 + 0{,}2260 = 3$$, o número de variáveis. A PC1 explica $$2{,}0314/3 = 67{,}7\%$$ da variância; com a PC2, chega a 92,5%.

Na PC1, as três variáveis têm loadings do mesmo sinal (−0,480; −0,588; −0,651): ela mede um "nível geral" de estudo, sono e motivação ao mesmo tempo (o sinal negativo é só convenção do programa). A PC2 opõe o estudo (+0,833) ao sono (−0,539): separa quem estuda muito e dorme pouco de quem faz o contrário. Com só três variáveis o ganho é pequeno, mas a mesma ideia resume dezenas de variáveis em duas ou três componentes.

---

## 5. Biplot: Os Dados Íris

### 5.1 O que é um biplot

Um **biplot** mostra, no mesmo gráfico:

1. as **observações**, como pontos nas coordenadas (scores) de PC1 e PC2;
2. as **variáveis originais**, como setas que saem da origem até os seus loadings em PC1 e PC2, $$(v_{k1}, v_{k2})$$ para a variável $$k$$.

Leitura das setas (aproximada, e tanto melhor quanto mais variância as duas componentes capturam):

- setas que apontam para o **mesmo lado** indicam variáveis positivamente correlacionadas; para **lados opostos**, negativamente; **perpendiculares**, pouco correlacionadas;
- a seta quase paralela a um eixo indica a variável que mais pesa naquela componente;
- uma seta curta indica uma variável mal representada pelas duas primeiras componentes.

### 5.2 Os dados

O conjunto **íris** tem quatro medidas, em centímetros (comprimento e largura da sépala e da pétala), de 150 flores: 50 de cada espécie, *Iris setosa*, *I. versicolor* e *I. virginica*. As medidas foram coletadas pelo botânico Edgar Anderson e usadas por Fisher (1936) para apresentar a análise discriminante linear. O código usa a cópia que acompanha o R, carregada pelo pacote RDatasets.jl.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>using RDatasets, DataFrames, MultivariateStats, Statistics, LinearAlgebra, Distributions, Plots

# Medidas (em cm) de 150 flores de íris, 50 de cada espécie
iris = dataset("datasets", "iris")
X = Matrix(iris[:, 1:4])
especie = String.(iris.Species)

# Padroniza e ajusta o PCA com TODAS as componentes
Z = (X .- mean(X, dims = 1)) ./ std(X, dims = 1)
pca = fit(PCA, Z'; pratio = 1.0)
proporcao = principalvars(pca) ./ var(pca)   # fração da variância TOTAL

scores   = predict(pca, Z')'          # coordenadas das flores (150 × 4)
loadings = projection(pca)[:, 1:2]    # pesos das 4 variáveis em PC1 e PC2

pct(j) = round(100 * proporcao[j], digits = 1)
p = plot(xlabel = "PC1 ($(pct(1))% da variância)", ylabel = "PC2 ($(pct(2))% da variância)",
         legend = :topright, size = (720, 540), framestyle = :box)
hline!(p, [0], color = :gray, linestyle = :dash, label = "")
vline!(p, [0], color = :gray, linestyle = :dash, label = "")

# Elipse com 68% de probabilidade se os scores do grupo forem normais bivariados.
# Em 2D, isso dá raio √χ²₂(0,68) ≈ 1,51 desvio padrão (não 1 desvio padrão).
function elipse(x, y, prob)
    autoval, autovet = eigen(cov([x y]))
    raio = sqrt(quantile(Chisq(2), prob))
    t = range(0, 2π, length = 200)
    pontos = autovet * (raio .* sqrt.(autoval) .* [cos.(t) sin.(t)]')
    return mean(x) .+ pontos[1, :], mean(y) .+ pontos[2, :]
end

cores = Dict("setosa" =&gt; :royalblue, "versicolor" =&gt; :darkorange, "virginica" =&gt; :forestgreen)
for sp in ["setosa", "versicolor", "virginica"]
    g = especie .== sp
    scatter!(p, scores[g, 1], scores[g, 2], color = cores[sp], label = sp,
             markersize = 4, markerstrokewidth = 0, alpha = 0.75)
    ex, ey = elipse(scores[g, 1], scores[g, 2], 0.68)
    plot!(p, ex, ey, color = cores[sp], linewidth = 2, label = "")
end

# Setas dos loadings, multiplicadas por 3 só para ficarem visíveis
nomes = ["Comp. sépala", "Larg. sépala", "Comp. pétala", "Larg. pétala"]
desloc = [(0.0, 0.22), (0.0, 0.22), (-0.15, 0.30), (-0.15, -0.25)]   # posição dos rótulos
for k in 1:4
    x, y = 3loadings[k, 1], 3loadings[k, 2]
    plot!(p, [0, x], [0, y], arrow = true, color = :black, linewidth = 1.5, label = "")
    annotate!(p, x + desloc[k][1], y + desloc[k][2], text(nomes[k], 9, :black, :right))
end
plot!(p, ylims = (-2.9, 3.4))
savefig(p, "pca_biplot_iris.png")

println("PC1: ", round(100proporcao[1], digits = 2), "%   PC2: ", round(100proporcao[2], digits = 2),
        "%   PC1 + PC2: ", round(100(proporcao[1] + proporcao[2]), digits = 2), "%")
println("Loadings em PC1 e PC2:")
println(DataFrame(Variavel = names(iris)[1:4], PC1 = round.(loadings[:, 1], digits = 3),
                  PC2 = round.(loadings[:, 2], digits = 3)))</code></pre>
  </div>
</div>

<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">PC1: 72.96%   PC2: 22.85%   PC1 + PC2: 95.81%
Loadings em PC1 e PC2:
4×3 DataFrame
 Row │ Variavel     PC1      PC2
     │ String       Float64  Float64
─────┼───────────────────────────────
   1 │ SepalLength   -0.521    0.377
   2 │ SepalWidth     0.269    0.923
   3 │ PetalLength   -0.58     0.024
   4 │ PetalWidth    -0.565    0.067</pre>
</div>

<img src="{{ site.baseurl }}/assets/images/pca_biplot_iris.png" alt="Biplot da PCA dos dados íris: pontos das três espécies em PC1 e PC2, com setosa à direita e versicolor e virginica à esquerda, elipses de 68% por espécie e setas das quatro medidas" style="max-width: 720px; width: 100%; display: block; margin: 1em auto;">
<div class="image-caption" style="text-align: center;">Figura 1. Biplot da PCA dos dados íris padronizados. Pontos: flores, coloridas pela espécie (azul: setosa; laranja: versicolor; verde: virginica). Elipses: regiões de 68% de cada espécie, supondo normalidade bivariada. Setas: loadings das quatro medidas, multiplicados por 3. Gerada pelo código acima.</div>

### 5.3 Interpretação

**Variância.** A PC1 explica 72,96% da variância e a PC2, 22,85%: juntas, $$72{,}96\% + 22{,}85\% = 95{,}81\%$$. O gráfico em duas dimensões preserva quase toda a informação das quatro medidas, e a leitura das setas é confiável.

**Setas.**
- Comprimento da pétala, largura da pétala e comprimento da sépala têm loadings grandes e do mesmo sinal na PC1 (−0,580; −0,565; −0,521): a PC1 funciona como um eixo de **tamanho da flor**. Como os loadings são negativos, flores maiores ficam à **esquerda**.
- As setas de comprimento e largura da pétala quase se sobrepõem: as duas medidas têm correlação de 0,963.
- A largura da sépala tem loading 0,923 na PC2 e só 0,269 na PC1: a PC2 é praticamente a largura da sépala.

**Pontos.**
- A *setosa* fica isolada à direita: pétalas bem menores (comprimento médio de 1,46 cm, contra 4,26 cm da versicolor e 5,55 cm da virginica) e sépalas mais largas (3,43 cm, contra 2,77 cm e 2,97 cm).
- *Versicolor* e *virginica* se sobrepõem em parte: são mais parecidas entre si, embora a virginica tenda a ficar mais à esquerda (flores maiores).

**Elipses.** Cada elipse é a região que conteria 68% das flores da espécie se os scores do grupo seguissem uma distribuição normal bivariada:

$$
\left\{ \mathbf{x} : (\mathbf{x} - \bar{\mathbf{x}})^T\mathbf{S}^{-1}(\mathbf{x} - \bar{\mathbf{x}}) \leq \chi^2_{2;\,0{,}68} \right\}
$$

em que $$\bar{\mathbf{x}}$$ é o centro (as médias dos scores) do grupo, $$\mathbf{S}$$ a matriz de covariância dos scores do grupo e $$\chi^2_{2;\,0{,}68} = 2{,}2789$$ o quantil 0,68 da distribuição qui-quadrado com 2 graus de liberdade. Ela descreve a **dispersão das flores**, não é um intervalo de confiança para a média. E 68% em duas dimensões não corresponde a "1 desvio padrão": o raio é $$\sqrt{2{,}2789} = 1{,}51$$ desvio padrão em cada direção; uma elipse de 1 desvio padrão conteria só 39,3% dos pontos.

---

## 6. Agrupamento: K-means

O **k-means** divide as observações em $$k$$ grupos escolhidos pelo analista. Ele começa com $$k$$ centros sorteados, atribui cada ponto ao centro mais próximo, recalcula cada centro como a média dos seus pontos e repete até nada mudar. O resultado minimiza (localmente) a soma das distâncias quadradas de cada ponto ao centro do seu grupo.

No exemplo dos estudantes, agrupamos pelas três variáveis explicativas padronizadas; a nota fica de fora, para ver depois se os grupos diferem nela.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>using DataFrames, Statistics, Clustering, Random

# Dados ilustrativos (inventados): 16 estudantes
dados = DataFrame(
    HorasEstudo = [5, 7, 8, 10, 12, 15, 18, 20, 6, 9, 11, 14, 16, 19, 22, 25],
    HorasSono   = [6, 7, 6, 8, 7, 9, 8, 7, 5, 8, 6, 9, 7, 8, 6, 7],
    Motivacao   = [7, 8, 6, 9, 8, 9, 9, 10, 5, 7, 8, 9, 8, 9, 7, 8],
    Nota        = [6.0, 7.0, 7.5, 8.0, 8.5, 9.0, 9.5, 10.0, 5.5, 7.8, 8.2, 8.8, 9.2, 9.6, 8.5, 9.1]
)

# Agrupamento só pelas variáveis explicativas, padronizadas
X = Matrix(select(dados, Not(:Nota)))
Z = (X .- mean(X, dims = 1)) ./ std(X, dims = 1)

Random.seed!(123)                 # o k-means começa de centros sorteados
resultado = kmeans(Z', 3)         # k = 3 grupos, escolhido por nós
dados.Grupo = assignments(resultado)

println("Tamanho de cada grupo: ", counts(resultado))
println(combine(groupby(dados, :Grupo), nrow =&gt; :n,
        [:HorasEstudo, :HorasSono, :Motivacao, :Nota] .=&gt; (x -&gt; round(mean(x), digits = 2)),
        renamecols = false))</code></pre>
  </div>
</div>

<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">Tamanho de cada grupo: [3, 5, 8]
3×6 DataFrame
 Row │ Grupo  n      HorasEstudo  HorasSono  Motivacao  Nota
     │ Int64  Int64  Float64      Float64    Float64    Float64
─────┼──────────────────────────────────────────────────────────
   1 │     1      3         6.33       5.67       6.0      6.33
   2 │     2      5         9.8        7.2        8.0      7.9
   3 │     3      8        18.62       7.62       8.62     9.21</pre>
</div>

Os grupos ficaram ordenados pelo estudo: 3 estudantes com pouco estudo, pouco sono e motivação baixa (média de 6,3 h de estudo); 5 intermediários (9,8 h); e 8 que estudam muito (18,6 h). Mesmo sem usar a nota, os grupos têm notas médias bem diferentes (6,33; 7,90; 9,21). A numeração dos grupos é arbitrária.

Cuidados:
- **$$k$$ é escolha sua.** Aqui $$k = 3$$ foi fixado; critérios como o "cotovelo" da soma de distâncias ou a silhueta ajudam a escolher.
- **O resultado depende do sorteio inicial.** Fixamos a semente (`Random.seed!(123)`); outra semente, ou outra versão do Julia, pode dar outros grupos. Rodar várias vezes e ficar com a melhor solução é a prática comum.
- **A escala importa.** Sem padronizar, as horas de estudo (de 5 a 25) dominariam a distância.
- Com 16 observações, os grupos são só uma ilustração.

---

## 7. Problemas Comuns e Soluções

| Problema | O que é | Como detectar | O que fazer |
|---|---|---|---|
| Multicolinearidade | Variáveis explicativas muito correlacionadas entre si | VIF alto (regra de bolso: acima de 5 ou de 10) | Retirar variáveis redundantes; regularização (ridge, lasso); usar componentes principais como explicativas |
| Heterocedasticidade | Variância dos resíduos muda com os valores previstos | Gráfico de resíduos contra previstos em forma de funil | Transformar a resposta (log, raiz); erros padrão robustos; mínimos quadrados ponderados |
| Não linearidade | A relação não segue uma reta (ou plano) | Padrão curvo no gráfico de resíduos | Incluir termos como $$X^2$$; transformar variáveis; modelos não lineares |
| Valores atípicos e pontos influentes | Observações que mudam muito o ajuste | Resíduos padronizados grandes; distância de Cook | Investigar a origem do ponto; ajustar com e sem ele e comparar; métodos robustos |

---

## 8. Onde se Usa

- **Saúde**: estudar fatores de risco ajustando por idade e outras variáveis; construir escores de prognóstico.
- **Marketing**: segmentar clientes por agrupamento; resumir questionários longos com PCA ou análise fatorial.
- **Finanças**: modelos de risco de crédito com várias características do cliente.
- **Engenharia e qualidade**: controle estatístico de processos com várias medidas ao mesmo tempo.
- **Ciências sociais**: relacionar renda, escolaridade, região e outras variáveis socioeconômicas.

---

## 9. Quando Usar e Quando Não Usar

**Use** quando:

- o fenômeno depende de vários fatores ao mesmo tempo e você quer o papel de cada um **com os outros fixos**;
- é preciso **ajustar por variáveis de confusão** (comparar grupos que diferem em idade, por exemplo);
- há muitas variáveis correlacionadas e você quer **resumi-las** (PCA) ou **encontrar grupos** (agrupamento).

**Não use, ou use com cuidado,** quando:

- **a amostra é pequena para o número de variáveis**: cada variável a mais consome informação, e os coeficientes ficam instáveis (no exemplo, 16 estudantes para 3 variáveis já deixam intervalos largos);
- **o objetivo é provar causa** com dados observacionais: ajustar por variáveis medidas não elimina as que não foram medidas;
- **as hipóteses não se sustentam** (resíduos com padrão, observações dependentes): os p-valores e intervalos deixam de valer;
- **acrescentar variáveis só para subir o $$R^2$$**: o $$R^2$$ sempre sobe; o modelo pode piorar em dados novos (sobreajuste);
- **os grupos do k-means ou as componentes do PCA são lidos como "reais"**: são resumos dos dados, que dependem das variáveis escolhidas, da padronização e, no k-means, de $$k$$ e do sorteio inicial.

---

## 10. Resumo

- A análise multivariada estuda várias variáveis juntas; as técnicas se dividem em dependência (há resposta) e interdependência (estrutura do conjunto).
- Na regressão múltipla, cada coeficiente é o efeito associado a uma variável **com as outras fixas**. No exemplo: $$\widehat{\text{Nota}} = 2{,}456 + 0{,}1232\,\text{Estudo} + 0{,}1547\,\text{Sono} + 0{,}3821\,\text{Motivação}$$, com $$R^2 = 0{,}8742$$ e $$R^2_{aj} = 0{,}8427$$; o sono não se mostrou associado à nota depois de considerar estudo e motivação (p-valor $$= 0{,}37$$).
- O VIF mede a multicolinearidade; no exemplo, todos ficaram abaixo de 3.
- O intervalo de predição (um indivíduo) é mais largo que o de confiança (a média).
- O PCA resume variáveis correlacionadas; nos dados íris, PC1 e PC2 guardam 95,81% da variância.
- O k-means depende de $$k$$, da escala e do sorteio inicial.

---

## Referências

1. Fisher, R. A. (1936). The use of multiple measurements in taxonomic problems. *Annals of Eugenics*, 7(2), 179–188. DOI: [10.1111/j.1469-1809.1936.tb02137.x](https://doi.org/10.1111/j.1469-1809.1936.tb02137.x).
2. Johnson, R. A.; Wichern, D. W. (2007). *Applied Multivariate Statistical Analysis*. 6th ed. Pearson Prentice Hall.
3. Montgomery, D. C.; Peck, E. A.; Vining, G. G. (2012). *Introduction to Linear Regression Analysis*. 5th ed. Wiley.
