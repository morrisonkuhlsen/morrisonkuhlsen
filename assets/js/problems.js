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
    }
    /* add future weekly problems here */
  ];

  window.WEEKLY_PROBLEMS = WEEKLY_PROBLEMS;
})();
