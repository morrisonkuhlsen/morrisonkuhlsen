/* dailystats – weekly problems – CLEAN */

(function () {
  "use strict";

  const WEEKLY_PROBLEMS = [
    {
      id: "W01",
      title: "Probabilidade Condicional: Lyme e HGE",
      statement: `<p><strong>Problema</strong>: Carrapatos podem transportar tanto a doença de <strong>Lyme</strong> quanto a <strong>erliquiose granulocítica humana (HGE)</strong>. Em um estudo com carrapatos no <em>mid-west americano</em> foi descoberto que:</p>
<ul>
  <li><strong>16%</strong> dos carrapatos eram portadores da doença de Lyme</li>
  <li><strong>10%</strong> eram portadores do HGE</li>
  <li><strong>10%</strong> dos carrapatos que eram portadores da doença de Lyme ou HGE eram <strong>portadores de ambas as doenças</strong></li>
</ul>
<p><strong>Questões</strong>:</p>
<ul>
  <li>a) Qual a probabilidade \\(\\Pr[\\text{Lyme} \\cap \\text{HGE}]\\) de que um carrapato seja portador de ambas as doenças?</li>
  <li>b) Qual a probabilidade condicional de que um carrapato seja portador do HGE, dado que ele é portador da doença de Lyme?</li>
</ul>`,
      hint: `Seja \\(p = P(L \\cap H)\\). Use \\(P(L \\cup H) = P(L) + P(H) - p\\) e o fato de que \\(P(L \\cap H \\mid L \\cup H) = 0{,}10\\) para encontrar \\(p\\). Para b, aplique a definição de probabilidade condicional: \\(P(B \\mid A) = P(A \\cap B)/P(A)\\).`,
      solution: `<p style="color:var(--muted)">Vamos denotar:</p>
<ul style="color:var(--muted)">
  <li>\\(L\\): "o carrapato é portador da doença de Lyme"</li>
  <li>\\(H\\): "o carrapato é portador de HGE"</li>
</ul>
<p style="color:var(--muted)">Os dados do enunciado são:</p>
<p>\\[P(L) = 0{,}16, \\quad P(H) = 0{,}10\\]</p>
<p style="color:var(--muted)">e também:</p>
<p>\\[P(L \\cap H \\mid L \\cup H) = 0{,}10\\]</p>
<p style="color:var(--muted)">pois "10% dos carrapatos que eram portadores de Lyme ou HGE eram portadores de ambas".</p>
<h3><strong>Parte (a): Probabilidade \\(P(L \\cap H)\\)</strong></h3>
<p>Seja \\(x = P(L \\cap H)\\).</p>
<p style="color:var(--muted)">Pela definição de probabilidade condicional:</p>
<p>\\[P(L \\cap H \\mid L \\cup H) = \\frac{P(L \\cap H)}{P(L \\cup H)}\\]</p>
<p style="color:var(--muted)">Logo:</p>
<p>\\[0{,}10 = \\frac{x}{P(L \\cup H)}\\]</p>
<p style="color:var(--muted)">Mas, pela fórmula da união de dois eventos:</p>
<p>\\[P(L \\cup H) = P(L) + P(H) - P(L \\cap H) = 0{,}16 + 0{,}10 - x = 0{,}26 - x\\]</p>
<p style="color:var(--muted)">Substituindo:</p>
<p>\\[0{,}10 = \\frac{x}{0{,}26 - x}\\]</p><p>\\[0{,}10 \\cdot (0{,}26 - x) = \\frac{x}{\\cancel{(0{,}26 - x)}} \\cdot \\cancel{(0{,}26 - x)}\\]</p><p style="color:var(--muted)">Resolvendo algebricamente:</p>
<p>\\[\\begin{aligned} x &= 0{,}10\\,(0{,}26 - x) \\\\ x &= 0{,}026 - 0{,}10x \\\\ x + 0{,}10x &= 0{,}026 \\\\ 1{,}10x &= 0{,}026 \\\\ x &= \\frac{0{,}026}{1{,}10} = 0{,}0236 \\end{aligned}\\]</p>
<p style="color:var(--link)">Portanto, \\(P(L \\cap H) \\approx 0{,}02364\\), ou seja, aproximadamente <strong>2,36%</strong>.</p>
<h3><strong>Parte (b): Probabilidade condicional \\(P(H \\mid L)\\)</strong></h3>
<p style="color:var(--muted)">Pela definição:</p>
<p>\\[P(H \\mid L) = \\frac{P(H \\cap L)}{P(L)} = \\frac{P(L \\cap H)}{P(L)}\\]</p>
<p style="color:var(--muted)">Substituindo os valores:</p>
<p>\\[P(H \\mid L) = \\frac{0{,}02364}{0{,}16} = 0{,}14772\\ldots\\]</p>
<p style="color:var(--link)">Portanto, \\(P(H \\mid L) \\approx 0{,}1477\\), ou seja, aproximadamente <strong>14,77%</strong>.</p>`
    },
    {
      id: "W02",
      title: "Teorema de Bayes: Teste Diagnóstico",
      statement: `<p><strong>Problema</strong>: Um exame de sangue é usado para detectar uma doença rara. Sabe-se que:</p>
<ul>
  <li><strong>2%</strong> da população tem a doença (prevalência)</li>
  <li>Se a pessoa tem a doença, o exame dá positivo em <strong>95%</strong> dos casos (sensibilidade)</li>
  <li>Se a pessoa não tem a doença, o exame dá negativo em <strong>90%</strong> dos casos (especificidade)</li>
</ul>
<p><strong>Questões</strong>:</p>
<ul>
  <li>a) Qual a probabilidade de uma pessoa escolhida ao acaso ter resultado <strong>positivo</strong>?</li>
  <li>b) Dado que o resultado foi positivo, qual a probabilidade de a pessoa realmente ter a doença?</li>
</ul>`,
      hint: `Seja \\(D\\) = "tem a doença" e \\(+\\) = "exame positivo". Para a, use a lei da probabilidade total: \\(P(+)\\) é a soma de \\(P(+ \\mid D)P(D)\\) com \\(P(+ \\mid D^c)P(D^c)\\). Para b, aplique o teorema de Bayes. Atenção: \\(P(+ \\mid D^c) = 1 - \\text{especificidade}\\).`,
      solution: `<p style="color:var(--muted)">Vamos denotar:</p>
<ul style="color:var(--muted)">
  <li>\\(D\\): "a pessoa tem a doença"</li>
  <li>\\(+\\): "o exame deu positivo"</li>
</ul>
<p style="color:var(--muted)">Os dados do enunciado são:</p>
<p>\\[\\begin{aligned} P(D) &= 0{,}02 \\\\ P(+ \\mid D) &= 0{,}95 \\\\ P(- \\mid D^c) &= 0{,}90 \\end{aligned}\\]</p>
<p style="color:var(--muted)">Logo, \\(P(D^c) = 0{,}98\\) e a taxa de falso positivo é:</p>
<p>\\[P(+ \\mid D^c) = 1 - 0{,}90 = 0{,}10\\]</p>
<h3><strong>Parte (a): Probabilidade \\(P(+)\\)</strong></h3>
<p style="color:var(--muted)">Pela lei da probabilidade total, particionando a população entre doentes e não doentes:</p>
<p>\\[\\begin{aligned} P(+) = {} & P(+ \\mid D)\\,P(D) \\\\ & + P(+ \\mid D^c)\\,P(D^c) \\end{aligned}\\]</p>
<p style="color:var(--muted)">Substituindo:</p>
<p>\\[\\begin{aligned} P(+) &= 0{,}95 \\cdot 0{,}02 + 0{,}10 \\cdot 0{,}98 \\\\ &= 0{,}019 + 0{,}098 \\\\ &= 0{,}117 \\end{aligned}\\]</p>
<p style="color:var(--link)">Portanto, \\(P(+) = 0{,}117\\), ou seja, <strong>11,7%</strong> das pessoas testam positivo.</p>
<h3><strong>Parte (b): Probabilidade \\(P(D \\mid +)\\)</strong></h3>
<p style="color:var(--muted)">Pelo teorema de Bayes:</p>
<p>\\[P(D \\mid +) = \\frac{P(+ \\mid D)\\,P(D)}{P(+)}\\]</p>
<p style="color:var(--muted)">O numerador já foi calculado na parte (a):</p>
<p>\\[P(D \\mid +) = \\frac{0{,}019}{0{,}117} = 0{,}16239\\ldots\\]</p>
<p style="color:var(--link)">Portanto, \\(P(D \\mid +) \\approx 0{,}1624\\), ou seja, aproximadamente <strong>16,24%</strong>.</p>
<p style="color:var(--muted)">Mesmo com um exame "95% sensível", a maioria dos positivos é falso positivo: como a doença é rara, os 10% de erro sobre os 98% saudáveis (0,098) superam os acertos sobre os 2% doentes (0,019).</p>`
    },
    {
      id: "W03",
      title: "Distribuição Binomial: Controle de Qualidade",
      statement: `<p><strong>Problema</strong>: Uma máquina produz peças das quais <strong>5%</strong> são defeituosas, de forma independente entre as peças. Um inspetor retira uma amostra aleatória de <strong>20 peças</strong> da produção.</p>
<p><strong>Questões</strong>:</p>
<ul>
  <li>a) Qual a probabilidade de que <strong>nenhuma</strong> peça da amostra seja defeituosa?</li>
  <li>b) Qual a probabilidade de que a amostra contenha <strong>pelo menos 2</strong> peças defeituosas?</li>
</ul>`,
      hint: `O número \\(X\\) de peças defeituosas segue \\(X \\sim \\text{Bin}(n = 20,\\ p = 0{,}05)\\), com \\(P(X = k) = \\binom{n}{k} p^k (1-p)^{n-k}\\). Para b, é mais fácil usar o complementar: \\(P(X \\geq 2)\\) é 1 menos a soma de \\(P(X = 0)\\) e \\(P(X = 1)\\).`,
      solution: `<p style="color:var(--muted)">Seja \\(X\\) o número de peças defeituosas na amostra. Como cada peça é defeituosa com probabilidade 0,05, independentemente das demais:</p>
<p>\\[X \\sim \\text{Bin}(20,\\ 0{,}05)\\]</p>
<p>\\[P(X = k) = \\binom{20}{k}\\,(0{,}05)^k\\,(0{,}95)^{20-k}\\]</p>
<h3><strong>Parte (a): Probabilidade \\(P(X = 0)\\)</strong></h3>
<p style="color:var(--muted)">Com \\(k = 0\\), temos \\(\\binom{20}{0} = 1\\) e \\((0{,}05)^0 = 1\\):</p>
<p>\\[P(X = 0) = (0{,}95)^{20} = 0{,}35849\\ldots\\]</p>
<p style="color:var(--link)">Portanto, \\(P(X = 0) \\approx 0{,}3585\\), ou seja, aproximadamente <strong>35,85%</strong>.</p>
<h3><strong>Parte (b): Probabilidade \\(P(X \\geq 2)\\)</strong></h3>
<p style="color:var(--muted)">Somar \\(P(X = 2)\\), \\(P(X = 3)\\), …, \\(P(X = 20)\\) seria trabalhoso. Usamos o evento complementar:</p>
<p>\\[P(X \\geq 2) = 1 - P(X = 0) - P(X = 1)\\]</p>
<p style="color:var(--muted)">Calculando \\(P(X = 1)\\):</p>
<p>\\[\\begin{aligned} P(X = 1) &= \\binom{20}{1}\\,(0{,}05)\\,(0{,}95)^{19} \\\\ &= 20 \\cdot 0{,}05 \\cdot 0{,}37735 \\\\ &= 0{,}37735 \\end{aligned}\\]</p>
<p style="color:var(--muted)">Substituindo:</p>
<p>\\[\\begin{aligned} P(X \\geq 2) &= 1 - 0{,}35849 - 0{,}37735 \\\\ &= 0{,}26416 \\end{aligned}\\]</p>
<p style="color:var(--link)">Portanto, \\(P(X \\geq 2) \\approx 0{,}2642\\), ou seja, aproximadamente <strong>26,42%</strong>.</p>`
    },
    {
      id: "W04",
      title: "Distribuição de Poisson: Chamadas em uma Central",
      statement: `<p><strong>Problema</strong>: Uma central de atendimento recebe, em média, <strong>4 chamadas por hora</strong>. Suponha que as chamadas chegam segundo um processo de Poisson, isto é, o número de chamadas em qualquer intervalo segue uma distribuição de Poisson com média proporcional ao tamanho do intervalo.</p>
<p><strong>Questões</strong>:</p>
<ul>
  <li>a) Qual a probabilidade de a central receber <strong>exatamente 2</strong> chamadas em uma hora?</li>
  <li>b) Qual a probabilidade de a central receber <strong>pelo menos 3</strong> chamadas em um intervalo de <strong>30 minutos</strong>?</li>
</ul>`,
      hint: `Se \\(X \\sim \\text{Poisson}(\\lambda)\\), então \\(P(X = k) = \\dfrac{e^{-\\lambda}\\lambda^k}{k!}\\). Em b, ajuste a taxa ao intervalo: 4 chamadas por hora equivalem a \\(\\lambda = 2\\) em 30 minutos. Depois use o complementar.`,
      solution: `<p style="color:var(--muted)">Se \\(X \\sim \\text{Poisson}(\\lambda)\\), a função de probabilidade é:</p>
<p>\\[P(X = k) = \\frac{e^{-\\lambda}\\,\\lambda^k}{k!}, \\qquad k = 0, 1, 2, \\ldots\\]</p>
<h3><strong>Parte (a): Exatamente 2 chamadas em uma hora</strong></h3>
<p style="color:var(--muted)">Em uma hora, \\(X \\sim \\text{Poisson}(4)\\). Logo:</p>
<p>\\[\\begin{aligned} P(X = 2) &= \\frac{e^{-4}\\cdot 4^2}{2!} = 8\\,e^{-4} \\\\ &= 8 \\cdot 0{,}018316 = 0{,}14653 \\end{aligned}\\]</p>
<p style="color:var(--link)">Portanto, \\(P(X = 2) \\approx 0{,}1465\\), ou seja, aproximadamente <strong>14,65%</strong>.</p>
<h3><strong>Parte (b): Pelo menos 3 chamadas em 30 minutos</strong></h3>
<p style="color:var(--muted)">Meia hora é metade do intervalo original, então a média também cai pela metade. Seja \\(Y\\) o número de chamadas em 30 minutos:</p>
<p>\\[Y \\sim \\text{Poisson}(\\lambda = 4 \\cdot 0{,}5 = 2)\\]</p>
<p style="color:var(--muted)">Pelo complementar:</p>
<p>\\[P(Y \\geq 3) = 1 - P(Y \\leq 2)\\]</p>
<p>\\[\\begin{aligned} P(Y \\geq 3) &= 1 - e^{-2}\\left(\\frac{2^0}{0!} + \\frac{2^1}{1!} + \\frac{2^2}{2!}\\right) \\\\ &= 1 - e^{-2}\\,(1 + 2 + 2) \\\\ &= 1 - 5\\,e^{-2} \\\\ &= 1 - 0{,}67668 = 0{,}32332 \\end{aligned}\\]</p>
<p style="color:var(--link)">Portanto, \\(P(Y \\geq 3) \\approx 0{,}3233\\), ou seja, aproximadamente <strong>32,33%</strong>.</p>`
    },
    {
      id: "W05",
      title: "Esperança e Variância: Um Jogo com Dois Dados",
      statement: `<p><strong>Problema</strong>: Em um jogo, você lança <strong>dois dados honestos</strong> e observa a soma das faces:</p>
<ul>
  <li>Se a soma for <strong>7</strong>, você ganha <strong>R$ 10</strong></li>
  <li>Se a soma for <strong>2 ou 12</strong>, você ganha <strong>R$ 30</strong></li>
  <li>Em qualquer outro caso, você <strong>perde R$ 3</strong></li>
</ul>
<p>Seja \\(X\\) o seu ganho (em reais) em uma rodada.</p>
<p><strong>Questões</strong>:</p>
<ul>
  <li>a) Calcule o ganho esperado \\(E[X]\\). O jogo é favorável ao jogador?</li>
  <li>b) Calcule a variância \\(\\text{Var}(X)\\) e o desvio padrão de \\(X\\).</li>
</ul>`,
      hint: `Há 36 resultados igualmente prováveis. Conte quantos dão soma 7 e quantos dão soma 2 ou 12. Depois use \\(E[X] = \\sum x\\,P(X = x)\\) e \\(\\text{Var}(X) = E[X^2] - (E[X])^2\\).`,
      solution: `<p style="color:var(--muted)">Os 36 pares \\((d_1, d_2)\\) são igualmente prováveis. Contando:</p>
<ul style="color:var(--muted)">
  <li>Soma 7: \\((1,6)\\), \\((2,5)\\), \\((3,4)\\), \\((4,3)\\), \\((5,2)\\), \\((6,1)\\) \\(\\Rightarrow\\) 6 casos</li>
  <li>Soma 2 ou 12: \\((1,1)\\), \\((6,6)\\) \\(\\Rightarrow\\) 2 casos</li>
  <li>Demais somas: \\(36 - 6 - 2 = 28\\) casos</li>
</ul>
<p style="color:var(--muted)">A distribuição de \\(X\\) é, portanto:</p>
<p>\\[\\begin{aligned} P(X = 10) &= \\tfrac{6}{36} \\\\ P(X = 30) &= \\tfrac{2}{36} \\\\ P(X = -3) &= \\tfrac{28}{36} \\end{aligned}\\]</p>
<h3><strong>Parte (a): Ganho esperado \\(E[X]\\)</strong></h3>
<p style="color:var(--muted)">Pela definição de esperança:</p>
<p>\\[\\begin{aligned} E[X] &= 10 \\cdot \\frac{6}{36} + 30 \\cdot \\frac{2}{36} + (-3) \\cdot \\frac{28}{36} \\\\ &= \\frac{60 + 60 - 84}{36} \\\\ &= \\frac{36}{36} = 1 \\end{aligned}\\]</p>
<p style="color:var(--link)">Portanto, \\(E[X] = 1\\): em média o jogador ganha <strong>R$ 1 por rodada</strong>, então o jogo é favorável a ele.</p>
<h3><strong>Parte (b): Variância e desvio padrão</strong></h3>
<p style="color:var(--muted)">Primeiro calculamos o segundo momento:</p>
<p>\\[\\begin{aligned} E[X^2] &= 10^2 \\cdot \\tfrac{6}{36} + 30^2 \\cdot \\tfrac{2}{36} + (-3)^2 \\cdot \\tfrac{28}{36} \\\\ &= \\frac{600 + 1800 + 252}{36} \\\\ &= \\frac{2652}{36} = 73{,}667 \\end{aligned}\\]</p>
<p style="color:var(--muted)">Então:</p>
<p>\\[\\begin{aligned} \\text{Var}(X) &= E[X^2] - (E[X])^2 \\\\ &= 73{,}667 - 1^2 = 72{,}667 \\end{aligned}\\]</p>
<p>\\[\\sigma_X = \\sqrt{72{,}667} \\approx 8{,}52\\]</p>
<p style="color:var(--link)">Portanto, \\(\\text{Var}(X) \\approx 72{,}67\\) e o desvio padrão é aproximadamente <strong>R$ 8,52</strong>.</p>
<p style="color:var(--muted)">O desvio padrão é bem maior que a média: o jogo é favorável no longo prazo, mas cada rodada individual é muito arriscada.</p>`
    },
    {
      id: "W06",
      title: "Distribuição Normal: Tempo de Montagem",
      statement: `<p><strong>Problema</strong>: O tempo que um operário leva para montar um equipamento segue uma distribuição <strong>normal</strong> com média de <strong>50 minutos</strong> e desvio padrão de <strong>8 minutos</strong>.</p>
<p><strong>Questões</strong>:</p>
<ul>
  <li>a) Qual a probabilidade de uma montagem levar <strong>entre 40 e 62 minutos</strong>?</li>
  <li>b) A empresa quer definir um tempo limite \\(t\\) que seja ultrapassado por apenas <strong>5%</strong> das montagens. Qual deve ser o valor de \\(t\\)?</li>
</ul>`,
      hint: `Padronize com \\(Z = (X - \\mu)/\\sigma\\), que tem distribuição \\(N(0, 1)\\), e consulte a tabela da normal padrão. Para b, procure o valor \\(z\\) tal que \\(P(Z > z) = 0{,}05\\) e depois volte à escala original: \\(t = \\mu + z\\,\\sigma\\).`,
      solution: `<p style="color:var(--muted)">Seja \\(X\\) o tempo de montagem, com:</p>
<p>\\[X \\sim N(\\mu = 50,\\ \\sigma^2 = 8^2)\\]</p>
<p style="color:var(--muted)">Padronizando, \\(Z = \\dfrac{X - 50}{8} \\sim N(0, 1)\\).</p>
<h3><strong>Parte (a): Probabilidade \\(P(40 < X < 62)\\)</strong></h3>
<p style="color:var(--muted)">Convertendo os limites para a escala \\(Z\\):</p>
<p>\\[z_1 = \\frac{40 - 50}{8} = -1{,}25\\]</p>
<p>\\[z_2 = \\frac{62 - 50}{8} = 1{,}50\\]</p>
<p style="color:var(--muted)">Logo:</p>
<p>\\[\\begin{aligned} P(40 < X < 62) &= P(-1{,}25 < Z < 1{,}50) \\\\ &= \\Phi(1{,}50) - \\Phi(-1{,}25) \\\\ &= 0{,}93319 - 0{,}10565 \\\\ &= 0{,}82754 \\end{aligned}\\]</p>
<p style="color:var(--link)">Portanto, \\(P(40 < X < 62) \\approx 0{,}8275\\), ou seja, aproximadamente <strong>82,75%</strong>.</p>
<h3><strong>Parte (b): Tempo limite \\(t\\)</strong></h3>
<p style="color:var(--muted)">Queremos \\(t\\) tal que:</p>
<p>\\[P(X > t) = 0{,}05\\]</p>
<p style="color:var(--muted)">o que equivale a:</p>
<p>\\[P\\left(Z > \\frac{t - 50}{8}\\right) = 0{,}05\\]</p>
<p style="color:var(--muted)">Pela tabela, \\(P(Z > 1{,}645) \\approx 0{,}05\\). Então:</p>
<p>\\[\\begin{aligned} \\frac{t - 50}{8} &= 1{,}645 \\\\ t &= 50 + 1{,}645 \\cdot 8 \\\\ t &= 63{,}16 \\end{aligned}\\]</p>
<p style="color:var(--link)">Portanto, o tempo limite deve ser de aproximadamente <strong>63,16 minutos</strong>.</p>`
    },
    {
      id: "W07",
      title: "Intervalo de Confiança: Vida Útil de Lâmpadas",
      statement: `<p><strong>Problema</strong>: Um fabricante quer estimar a vida útil média de suas lâmpadas. De experiências anteriores, sabe-se que o desvio padrão populacional da vida útil é <strong>\\(\\sigma = 120\\) horas</strong>. Uma amostra aleatória de <strong>36 lâmpadas</strong> apresentou vida útil média de <strong>\\(\\bar{x} = 1180\\) horas</strong>.</p>
<p><strong>Questões</strong>:</p>
<ul>
  <li>a) Construa um intervalo de <strong>95% de confiança</strong> para a vida útil média \\(\\mu\\).</li>
  <li>b) Qual o <strong>tamanho mínimo da amostra</strong> para que a margem de erro, com 95% de confiança, seja de no máximo <strong>20 horas</strong>?</li>
</ul>`,
      hint: `Com \\(\\sigma\\) conhecido, o intervalo é \\(\\bar{x} \\pm z_{\\alpha/2}\\,\\dfrac{\\sigma}{\\sqrt{n}}\\), com \\(z_{0{,}025} = 1{,}96\\). Para b, isole \\(n\\) na desigualdade \\(1{,}96\\,\\sigma/\\sqrt{n} \\leq 20\\) e arredonde para cima.`,
      solution: `<p style="color:var(--muted)">Os dados do enunciado são:</p>
<p>\\[\\sigma = 120, \\quad n = 36, \\quad \\bar{x} = 1180\\]</p>
<p>\\[1 - \\alpha = 0{,}95 \\Rightarrow z_{\\alpha/2} = 1{,}96\\]</p>
<h3><strong>Parte (a): Intervalo de 95% de confiança</strong></h3>
<p style="color:var(--muted)">Como \\(\\sigma\\) é conhecido, o intervalo de confiança para \\(\\mu\\) é:</p>
<p>\\[\\bar{x} \\pm z_{\\alpha/2}\\,\\frac{\\sigma}{\\sqrt{n}}\\]</p>
<p style="color:var(--muted)">Calculando a margem de erro:</p>
<p>\\[\\begin{aligned} E &= 1{,}96 \\cdot \\frac{120}{\\sqrt{36}} = 1{,}96 \\cdot \\frac{120}{6} \\\\ &= 1{,}96 \\cdot 20 = 39{,}2 \\end{aligned}\\]</p>
<p style="color:var(--muted)">Logo:</p>
<p>\\[1180 \\pm 39{,}2 \\quad \\Rightarrow \\quad [\\,1140{,}8\\ ;\\ 1219{,}2\\,]\\]</p>
<p style="color:var(--link)">Portanto, com 95% de confiança, a vida útil média está entre <strong>1140,8 e 1219,2 horas</strong>.</p>
<h3><strong>Parte (b): Tamanho mínimo da amostra</strong></h3>
<p style="color:var(--muted)">Queremos que a margem de erro seja no máximo 20:</p>
<p>\\[1{,}96 \\cdot \\frac{120}{\\sqrt{n}} \\leq 20\\]</p>
<p style="color:var(--muted)">Isolando \\(n\\):</p>
<p>\\[\\begin{aligned} \\sqrt{n} &\\geq \\frac{1{,}96 \\cdot 120}{20} = 11{,}76 \\\\ n &\\geq (11{,}76)^2 = 138{,}30 \\end{aligned}\\]</p>
<p style="color:var(--muted)">Como \\(n\\) é inteiro e precisa satisfazer a desigualdade, arredondamos para cima.</p>
<p style="color:var(--link)">Portanto, são necessárias pelo menos <strong>139 lâmpadas</strong>.</p>`
    },
    {
      id: "W08",
      title: "Teste de Hipóteses: Proporção de Clientes Satisfeitos",
      statement: `<p><strong>Problema</strong>: Uma empresa afirma que <strong>60%</strong> de seus clientes estão satisfeitos com o atendimento. Um órgão de defesa do consumidor desconfia que a proporção real é <strong>menor</strong> e entrevista uma amostra aleatória de <strong>200 clientes</strong>, dos quais <strong>105</strong> se declaram satisfeitos.</p>
<p><strong>Questões</strong>:</p>
<ul>
  <li>a) Formule as hipóteses, calcule a estatística de teste e decida, ao nível de significância de <strong>5%</strong>, se há evidência contra a afirmação da empresa.</li>
  <li>b) Calcule o <strong>valor-p</strong> do teste. A conclusão muda ao nível de <strong>1%</strong>?</li>
</ul>`,
      hint: `Teste \\(H_0: p = 0{,}60\\) contra \\(H_1: p < 0{,}60\\) (unilateral à esquerda). Sob \\(H_0\\), use \\(Z = \\dfrac{\\hat{p} - p_0}{\\sqrt{p_0(1-p_0)/n}}\\), que é aproximadamente \\(N(0,1)\\). O valor-p é \\(P(Z \\leq z_{\\text{obs}})\\).`,
      solution: `<p style="color:var(--muted)">A proporção amostral de satisfeitos é:</p>
<p>\\[\\hat{p} = \\frac{105}{200} = 0{,}525\\]</p>
<h3><strong>Parte (a): Hipóteses, estatística e decisão a 5%</strong></h3>
<p style="color:var(--muted)">Como o órgão suspeita que a proporção é menor, o teste é unilateral à esquerda:</p>
<p>\\[H_0: p = 0{,}60 \\qquad \\text{vs.} \\qquad H_1: p < 0{,}60\\]</p>
<p style="color:var(--muted)">Sob \\(H_0\\), o erro padrão de \\(\\hat{p}\\) é:</p>
<p>\\[\\begin{aligned} \\text{EP} &= \\sqrt{\\frac{p_0(1 - p_0)}{n}} = \\sqrt{\\frac{0{,}60 \\cdot 0{,}40}{200}} \\\\ &= \\sqrt{0{,}0012} = 0{,}03464 \\end{aligned}\\]</p>
<p style="color:var(--muted)">A estatística de teste é:</p>
<p>\\[z_{\\text{obs}} = \\frac{\\hat{p} - p_0}{\\text{EP}} = \\frac{0{,}525 - 0{,}60}{0{,}03464} = -2{,}165\\]</p>
<p style="color:var(--muted)">Ao nível de 5%, o valor crítico unilateral à esquerda é \\(-1{,}645\\). Rejeitamos \\(H_0\\) se \\(z_{\\text{obs}} < -1{,}645\\):</p>
<p>\\[-2{,}165 < -1{,}645 \\quad \\Rightarrow \\quad \\text{rejeita-se } H_0\\]</p>
<p style="color:var(--link)">Portanto, ao nível de 5%, <strong>há evidência</strong> de que a proporção de clientes satisfeitos é menor que 60%.</p>
<h3><strong>Parte (b): Valor-p e decisão a 1%</strong></h3>
<p style="color:var(--muted)">O valor-p é a probabilidade, sob \\(H_0\\), de observar um valor tão ou mais extremo que o obtido:</p>
<p>\\[\\text{valor-p} = P(Z \\leq -2{,}165) \\approx 0{,}0152\\]</p>
<p style="color:var(--muted)">Comparando com os níveis de significância:</p>
<p>\\[0{,}01 < 0{,}0152 < 0{,}05\\]</p>
<p style="color:var(--link)">Portanto, o valor-p é aproximadamente <strong>1,52%</strong>: rejeitamos \\(H_0\\) a 5%, mas <strong>não</strong> rejeitamos a 1%. A conclusão muda.</p>`
    },
    {
      id: "W09",
      title: "Distribuição Geométrica: Lances Livres",
      statement: `<p><strong>Problema</strong>: Um jogador de basquete acerta cada lance livre com probabilidade <strong>0,7</strong>, de forma independente entre os arremessos. Ele arremessa repetidamente até <strong>errar pela primeira vez</strong>. Seja \\(N\\) o número total de arremessos realizados (incluindo o erro).</p>
<p><strong>Questões</strong>:</p>
<ul>
  <li>a) Qual a probabilidade de o primeiro erro ocorrer <strong>exatamente no 4º arremesso</strong>?</li>
  <li>b) Qual a probabilidade de ele precisar de <strong>mais de 5 arremessos</strong> para errar pela primeira vez?</li>
  <li>c) Qual o número <strong>esperado</strong> de arremessos até o primeiro erro?</li>
</ul>`,
      hint: `Aqui o "sucesso" que encerra o experimento é o erro, com probabilidade \\(p = 0{,}3\\). Então \\(N \\sim \\text{Geom}(p)\\), com \\(P(N = k) = (1-p)^{k-1}p\\). Para b, note que \\(N > 5\\) equivale a acertar os 5 primeiros arremessos. Para c, \\(E[N] = 1/p\\).`,
      solution: `<p style="color:var(--muted)">O experimento termina no primeiro erro, que ocorre com probabilidade \\(p = 1 - 0{,}7 = 0{,}3\\) em cada arremesso. Logo:</p>
<p>\\[N \\sim \\text{Geom}(0{,}3)\\]</p>
<p>\\[P(N = k) = (0{,}7)^{k-1}\\,(0{,}3), \\quad k = 1, 2, \\ldots\\]</p>
<h3><strong>Parte (a): Probabilidade \\(P(N = 4)\\)</strong></h3>
<p style="color:var(--muted)">O primeiro erro no 4º arremesso significa acertar os 3 primeiros e errar o 4º:</p>
<p>\\[\\begin{aligned} P(N = 4) &= (0{,}7)^3 \\cdot 0{,}3 \\\\ &= 0{,}343 \\cdot 0{,}3 = 0{,}1029 \\end{aligned}\\]</p>
<p style="color:var(--link)">Portanto, \\(P(N = 4) = 0{,}1029\\), ou seja, aproximadamente <strong>10,29%</strong>.</p>
<h3><strong>Parte (b): Probabilidade \\(P(N > 5)\\)</strong></h3>
<p style="color:var(--muted)">Precisar de mais de 5 arremessos significa que não houve erro em nenhum dos 5 primeiros, isto é, 5 acertos seguidos:</p>
<p>\\[P(N > 5) = (0{,}7)^5 = 0{,}16807\\]</p>
<p style="color:var(--muted)">O mesmo resultado sai pelo complementar, somando a série geométrica:</p>
<p>\\[\\begin{aligned} 1 - \\sum_{k=1}^{5} (0{,}7)^{k-1}(0{,}3) &= 1 - 0{,}3 \\cdot \\frac{1 - 0{,}7^5}{1 - 0{,}7} \\\\ &= 0{,}7^5 \\end{aligned}\\]</p>
<p style="color:var(--link)">Portanto, \\(P(N > 5) \\approx 0{,}1681\\), ou seja, aproximadamente <strong>16,81%</strong>.</p>
<h3><strong>Parte (c): Esperança \\(E[N]\\)</strong></h3>
<p style="color:var(--muted)">Para a distribuição geométrica (contando a tentativa do sucesso):</p>
<p>\\[E[N] = \\frac{1}{p} = \\frac{1}{0{,}3} = 3{,}33\\ldots\\]</p>
<p style="color:var(--link)">Portanto, em média são necessários aproximadamente <strong>3,33 arremessos</strong> até o primeiro erro.</p>`
    },
    {
      id: "W10",
      title: "Distribuição Hipergeométrica: Inspeção de Lotes",
      statement: `<p><strong>Problema</strong>: Um lote contém <strong>50 componentes</strong>, dos quais <strong>6 são defeituosos</strong>. Um inspetor escolhe <strong>5 componentes ao acaso, sem reposição</strong>. O lote é rejeitado se pelo menos um dos componentes escolhidos for defeituoso.</p>
<p><strong>Questões</strong>:</p>
<ul>
  <li>a) Qual a probabilidade de o lote ser <strong>aceito</strong>?</li>
  <li>b) Qual a probabilidade de a amostra conter <strong>exatamente 2</strong> componentes defeituosos?</li>
</ul>`,
      hint: `Como a amostragem é sem reposição, o número \\(X\\) de defeituosos na amostra é hipergeométrico: \\(P(X = k) = \\dfrac{\\binom{6}{k}\\binom{44}{5-k}}{\\binom{50}{5}}\\). O lote é aceito quando \\(X = 0\\).`,
      solution: `<p style="color:var(--muted)">Seja \\(X\\) o número de defeituosos entre os 5 escolhidos. Todas as \\(\\binom{50}{5}\\) amostras são igualmente prováveis, e as amostras com exatamente \\(k\\) defeituosos são formadas escolhendo \\(k\\) entre os 6 defeituosos e \\(5 - k\\) entre os 44 bons:</p>
<p>\\[P(X = k) = \\frac{\\binom{6}{k}\\binom{44}{5-k}}{\\binom{50}{5}}\\]</p>
<p style="color:var(--muted)">O denominador é:</p>
<p>\\[\\binom{50}{5} = \\frac{50 \\cdot 49 \\cdot 48 \\cdot 47 \\cdot 46}{5!} = 2\\,118\\,760\\]</p>
<h3><strong>Parte (a): Probabilidade de aceitar o lote</strong></h3>
<p style="color:var(--muted)">O lote é aceito se \\(X = 0\\), isto é, todos os 5 escolhidos vêm dos 44 bons:</p>
<p>\\[\\binom{44}{5} = \\frac{44 \\cdot 43 \\cdot 42 \\cdot 41 \\cdot 40}{5!} = 1\\,086\\,008\\]</p>
<p>\\[P(X = 0) = \\frac{1\\,086\\,008}{2\\,118\\,760} = 0{,}51257\\]</p>
<p style="color:var(--muted)">Equivalentemente, escolhendo os componentes um a um:</p>
<p>\\[\\begin{aligned} P(X = 0) &= \\frac{44}{50} \\cdot \\frac{43}{49} \\cdot \\frac{42}{48} \\cdot \\frac{41}{47} \\cdot \\frac{40}{46} \\\\ &= 0{,}51257 \\end{aligned}\\]</p>
<p style="color:var(--link)">Portanto, a probabilidade de aceitar o lote é aproximadamente <strong>51,26%</strong>, mesmo com 12% de componentes defeituosos.</p>
<h3><strong>Parte (b): Probabilidade \\(P(X = 2)\\)</strong></h3>
<p style="color:var(--muted)">Escolhemos 2 dos 6 defeituosos e 3 dos 44 bons:</p>
<p>\\[\\binom{6}{2} = 15\\]</p>
<p>\\[\\binom{44}{3} = \\frac{44 \\cdot 43 \\cdot 42}{3!} = 13\\,244\\]</p>
<p>\\[\\begin{aligned} P(X = 2) &= \\frac{15 \\cdot 13\\,244}{2\\,118\\,760} = \\frac{198\\,660}{2\\,118\\,760} \\\\ &= 0{,}09376 \\end{aligned}\\]</p>
<p style="color:var(--link)">Portanto, \\(P(X = 2) \\approx 0{,}0938\\), ou seja, aproximadamente <strong>9,38%</strong>.</p>`
    },
    {
      id: "W11",
      title: "Regressão Linear Simples: Horas de Estudo e Nota",
      statement: `<p><strong>Problema</strong>: Um professor registrou, para 5 alunos, o número de horas de estudo \\(x\\) na semana anterior à prova e a nota \\(y\\) obtida (de 0 a 100):</p>
<div class="table-wrap">
  <table>
    <tr><th>\\(x\\) (horas)</th><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td></tr>
    <tr><th>\\(y\\) (nota)</th><td>52</td><td>55</td><td>61</td><td>64</td><td>68</td></tr>
  </table>
</div>
<p><strong>Questões</strong>:</p>
<ul>
  <li>a) Ajuste a reta de mínimos quadrados \\(\\hat{y} = b_0 + b_1 x\\).</li>
  <li>b) Calcule o coeficiente de determinação \\(R^2\\) e use a reta para prever a nota de um aluno que estudou <strong>6 horas</strong>.</li>
</ul>`,
      hint: `Calcule \\(\\bar{x}\\), \\(\\bar{y}\\), \\(S_{xx} = \\sum (x_i - \\bar{x})^2\\), \\(S_{yy} = \\sum (y_i - \\bar{y})^2\\) e \\(S_{xy} = \\sum (x_i - \\bar{x})(y_i - \\bar{y})\\). Então \\(b_1 = S_{xy}/S_{xx}\\), \\(b_0 = \\bar{y} - b_1\\bar{x}\\) e \\(R^2 = S_{xy}^2/(S_{xx}S_{yy})\\).`,
      solution: `<p style="color:var(--muted)">As médias são:</p>
<p>\\[\\bar{x} = \\frac{1 + 2 + 3 + 4 + 5}{5} = 3\\]</p>
<p>\\[\\bar{y} = \\frac{52 + 55 + 61 + 64 + 68}{5} = 60\\]</p>
<p style="color:var(--muted)">Os desvios em relação às médias são:</p>
<p>\\[\\begin{aligned} x_i - \\bar{x} &= (-2, -1, 0, 1, 2) \\\\ y_i - \\bar{y} &= (-8, -5, 1, 4, 8) \\end{aligned}\\]</p>
<p style="color:var(--muted)">Logo:</p>
<p>\\[\\begin{aligned} S_{xx} &= 4 + 1 + 0 + 1 + 4 = 10 \\\\ S_{yy} &= 64 + 25 + 1 + 16 + 64 = 170 \\\\ S_{xy} &= 16 + 5 + 0 + 4 + 16 = 41 \\end{aligned}\\]</p>
<h3><strong>Parte (a): Reta de mínimos quadrados</strong></h3>
<p style="color:var(--muted)">Os estimadores de mínimos quadrados são:</p>
<p>\\[b_1 = \\frac{S_{xy}}{S_{xx}} = \\frac{41}{10} = 4{,}1\\]</p>
<p>\\[b_0 = \\bar{y} - b_1\\,\\bar{x} = 60 - 4{,}1 \\cdot 3 = 47{,}7\\]</p>
<p style="color:var(--link)">Portanto, a reta ajustada é <strong>\\(\\hat{y} = 47{,}7 + 4{,}1\\,x\\)</strong>: cada hora adicional de estudo está associada a um aumento médio de 4,1 pontos na nota.</p>
<h3><strong>Parte (b): Coeficiente \\(R^2\\) e previsão</strong></h3>
<p style="color:var(--muted)">Na regressão linear simples, \\(R^2\\) é o quadrado da correlação amostral:</p>
<p>\\[\\begin{aligned} R^2 &= \\frac{S_{xy}^2}{S_{xx}\\,S_{yy}} = \\frac{41^2}{10 \\cdot 170} \\\\ &= \\frac{1681}{1700} = 0{,}9888 \\end{aligned}\\]</p>
<p style="color:var(--muted)">Para \\(x = 6\\):</p>
<p>\\[\\hat{y} = 47{,}7 + 4{,}1 \\cdot 6 = 72{,}3\\]</p>
<p style="color:var(--link)">Portanto, \\(R^2 \\approx 0{,}989\\) (a reta explica cerca de <strong>98,9%</strong> da variação das notas) e a nota prevista para 6 horas é <strong>72,3</strong>.</p>
<p style="color:var(--muted)">Cuidado: \\(x = 6\\) está fora do intervalo observado (1 a 5 horas), então essa previsão é uma extrapolação e deve ser vista com cautela.</p>`
    }
    /* add future weekly problems here */
  ];

  window.WEEKLY_PROBLEMS = WEEKLY_PROBLEMS;
})();
