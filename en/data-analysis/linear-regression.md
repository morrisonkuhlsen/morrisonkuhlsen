---
layout: page
title: Simple Linear Regression
lang: en
ref: regressao-linear
parent: analise-de-dados
permalink: /en/data-analysis/linear-regression
order: 1
mathjax: true
description: "Simple linear regression by least squares: formulas, a worked example by hand, R², residuals, prediction intervals, Julia code and a calculator."
---

<img src="{{ site.baseurl }}/assets/images/regressao.avif" alt="Illustration of an analyst pointing at a scatter plot with a line, under the title Linear Regression, on a computer screen" style="max-width: 600px; display: block; margin: 1em auto;">

**Simple linear regression** describes how a quantitative variable $Y$ (the **response**) tends to change when another quantitative variable $X$ (the **explanatory** variable) changes, using a line fitted to the data. It is used to summarize that relationship, to measure how much of $Y$ the line explains, and to predict $Y$ from $X$.

"Simple" means there is a single explanatory variable. With several, the method is multiple linear regression.

---

## 1. The Model

The idea is that, for each value of $X$, the **mean** value of $Y$ lies on a line, and each observation departs from that mean by a random error:

$$
Y = \beta_0 + \beta_1 X + \varepsilon
$$

- $Y$: response variable (the one we want to explain or predict);
- $X$: explanatory variable;
- $\beta_0$: **intercept**, the mean value of $Y$ when $X = 0$;
- $\beta_1$: **slope**, how much the mean value of $Y$ changes when $X$ increases by one unit;
- $\varepsilon$: **random error**, what separates each observation from the line (other factors, natural variation, measurement error).

$\beta_0$ and $\beta_1$ are unknown population parameters. With a sample of $n$ pairs $(x_i, y_i)$, we compute the **estimates** $a$ (of $\beta_0$) and $b$ (of $\beta_1$), and the **fitted line**:

$$
\hat{y} = a + b\,x
$$

The hat on $\hat{y}$ marks a value **predicted** by the line, to tell it apart from the observed value $y$. The difference between the two is the **residual**: $e_i = y_i - \hat{y}_i$.

---

## 2. Least Squares

There are infinitely many lines that pass "close" to the points. The **least squares** method picks the line that minimizes the sum of the squared residuals:

$$
SS_{\text{res}} = \sum_{i=1}^{n} (y_i - a - b\,x_i)^2
$$

The residuals are squared so that positive ones (points above the line) and negative ones (below) do not cancel out, and so that large errors weigh more.

---

## 3. The Formulas

With the means $\bar{x}$ and $\bar{y}$, we define three sums of deviations:

$$
S_{xx} = \sum (x_i - \bar{x})^2 \qquad S_{yy} = \sum (y_i - \bar{y})^2 \qquad S_{xy} = \sum (x_i - \bar{x})(y_i - \bar{y})
$$

The least squares line has:

$$
b = \frac{S_{xy}}{S_{xx}} \qquad\qquad a = \bar{y} - b\,\bar{x}
$$

For hand calculation, the sums can be computed with the equivalent forms (which always hold):

$$
S_{xx} = \sum x_i^2 - n\bar{x}^2 \qquad\qquad S_{xy} = \sum x_i y_i - n\bar{x}\bar{y}
$$

Properties that hold for any data set:

- the formula only exists if **not all $x_i$ are equal** (otherwise $S_{xx} = 0$ and the slope would be a division by zero);
- the line passes through the point $(\bar{x}, \bar{y})$, because $a = \bar{y} - b\bar{x}$;
- the residuals **add up to zero**: $\sum e_i = 0$;
- no other line has a smaller sum of squared residuals.

---

## 4. Worked Example, Step by Step

**Situation** (illustrative numbers): a teacher recorded the study hours in the week before the exam and the grade (from 0 to 10) of 8 students. We want the line relating grade and hours, and the prediction for a student who studied 14 hours.

### 4.1 Data and sums

$n = 8$ pairs. In the table, each column is computed row by row and added up in the last row:

| Student | $x_i$ (hours) | $y_i$ (grade) | $x_i^2$ | $y_i^2$ | $x_i y_i$ |
|---|---|---|---|---|---|
| 1 | 5 | 6 | 25 | 36 | 30 |
| 2 | 7 | 7 | 49 | 49 | 49 |
| 3 | 8 | 7.5 | 64 | 56.25 | 60 |
| 4 | 10 | 8 | 100 | 64 | 80 |
| 5 | 12 | 8.5 | 144 | 72.25 | 102 |
| 6 | 15 | 9 | 225 | 81 | 135 |
| 7 | 18 | 9.5 | 324 | 90.25 | 171 |
| 8 | 20 | 10 | 400 | 100 | 200 |
| **Sum** | **95** | **65.5** | **1331** | **548.75** | **827** |

### 4.2 Means

$$
\bar{x} = \frac{\sum x_i}{n} = \frac{95}{8} = 11.875 \text{ hours}
$$

$$
\bar{y} = \frac{\sum y_i}{n} = \frac{65.5}{8} = 8.1875 \text{ points}
$$

### 4.3 Sums of deviations

Using the computational forms from section 3:

$$
n\bar{x}\bar{y} = 8 \times 11.875 \times 8.1875 = 95 \times 8.1875 = 777.8125
$$

$$
S_{xy} = \sum x_i y_i - n\bar{x}\bar{y} = 827 - 777.8125 = 49.1875
$$

$$
n\bar{x}^2 = 8 \times 11.875^2 = 8 \times 141.015625 = 1128.125
$$

$$
S_{xx} = \sum x_i^2 - n\bar{x}^2 = 1331 - 1128.125 = 202.875
$$

$$
n\bar{y}^2 = 8 \times 8.1875^2 = 8 \times 67.03515625 = 536.28125
$$

$$
S_{yy} = \sum y_i^2 - n\bar{y}^2 = 548.75 - 536.28125 = 12.46875
$$

### 4.4 Slope and intercept

$$
b = \frac{S_{xy}}{S_{xx}} = \frac{49.1875}{202.875} = 0.242452\ldots \approx 0.24245 \text{ point per hour}
$$

$$
a = \bar{y} - b\,\bar{x} = 8.1875 - 0.242452\ldots \times 11.875 = 8.1875 - 2.879120\ldots = 5.308380\ldots \approx 5.30838 \text{ points}
$$

(The arithmetic uses $b$ with all its digits; the exact values are $b = 787/3246$ and $a = 17{,}231/3246$.)

**Fitted line:**

$$
\hat{y} = 5.30838 + 0.24245\,x
$$

### 4.5 Prediction for 14 hours

Plugging $x = 14$ into the line, with the full coefficients:

$$
\hat{y} = 5.308380\ldots + 0.242452\ldots \times 14 = 5.308380\ldots + 3.394331\ldots = 8.702711\ldots \approx 8.70 \text{ points}
$$

Watch the rounding: with the coefficients cut to two decimals ($5.31 + 0.24 \times 14$) the result would be 8.67, which already differs in the second decimal place. Round only the final result.

### 4.6 Interpreting the coefficients

- **Slope ($b \approx 0.24$):** among these students, each extra hour of study is associated with a grade about 0.24 point higher on average. This is an **association**, not proof that studying more **causes** a higher grade: students who study more may differ in other ways (interest, free time, prior knowledge). Claiming cause would require an experiment.
- **Intercept ($a \approx 5.31$):** this is the grade the line gives for $x = 0$. Since no student studied less than 5 hours, this value is an **extrapolation** and should not be read as "the grade of someone who doesn't study". Here it only serves to position the line.
- **Prediction ($\approx 8.70$):** this estimates the **mean** grade of students who study 14 hours. A specific student may land above or below it (section 7).

---

## 5. How Much the Line Explains: R²

The **coefficient of determination** $R^2$ is the fraction of the variation of $Y$ around its mean that the line reproduces:

$$
R^2 = 1 - \frac{SS_{\text{res}}}{S_{yy}} = \frac{S_{xy}^2}{S_{xx}\,S_{yy}}
$$

It lies between 0 (the line adds nothing beyond the mean $\bar{y}$) and 1 (all points on the line). In simple linear regression, $R^2$ is the square of the [Pearson correlation]({{ '/en/descriptive-statistics/exploratory-analysis' | relative_url }}) $r$.

**Arithmetic for the example.** The sum of squared residuals can be obtained as $SS_{\text{res}} = S_{yy} - b\,S_{xy}$:

$$
SS_{\text{res}} = 12.46875 - 0.242452\ldots \times 49.1875 = 12.46875 - 11.925619\ldots = 0.543130\ldots
$$

$$
R^2 = 1 - \frac{0.543130\ldots}{12.46875} = 1 - 0.043559\ldots = 0.956441\ldots \approx 0.9564
$$

Check with the other formula: $\frac{49.1875^2}{202.875 \times 12.46875} = \frac{2419.41016}{2529.59766} \approx 0.9564$. The correlation is $r = \sqrt{0.9564} \approx 0.978$ (positive, like $b$).

**Interpretation:** about 96% of the variation in these 8 students' grades around the mean follows the study-hours line. **A high R² does not guarantee that the model is right**: section 6 shows that, in this example, the relationship is not exactly a straight line. And $R^2$ says nothing about cause.

---

## 6. Look at the Residuals

The chart below shows the data with the line (left) and the residuals $e_i = y_i - \hat{y}_i$ (right):

![On the left, the eight points of study hours and grade with the fitted line; on the right, the residuals, negative at the ends and positive in the middle, forming an arch]({{ site.baseurl }}/assets/images/linear_regression_en.png){:style="max-width: 900px; display: block; margin: 1em auto;"}
<div class="image-caption" style="text-align: center;">Figure 1. Least squares line and residuals for the example. The residuals form an arch: the line sits above the data at the ends and below it in the middle.</div>

| $x_i$ | 5 | 7 | 8 | 10 | 12 | 15 | 18 | 20 |
|---|---|---|---|---|---|---|---|---|
| $\hat{y}_i$ | 6.521 | 7.006 | 7.248 | 7.733 | 8.218 | 8.945 | 9.673 | 10.157 |
| $e_i$ | −0.521 | −0.006 | 0.252 | 0.267 | 0.282 | 0.055 | −0.173 | −0.157 |

The residuals add up to zero (as stated in section 3), but they are **not scattered at random**: they are negative at the ends and positive in the middle. This arch indicates that the grade grows more and more slowly with the hours, that is, the relationship is **curved**. That makes sense: the grade has a ceiling (10), and a straight line will go past it. The line is still a useful summary within the observed range, but a curved model would describe the data better.

Hence the rule: **always look at the residual plot**, not just at $R^2$.

---

## 7. Inference: How Far to Trust the Line

The estimates $a$ and $b$ would change with another sample of students. To measure that uncertainty, the model assumes the errors $\varepsilon$ are **independent**, have **mean zero and constant variance** $\sigma^2$ across $X$ and, for intervals and tests with few observations, a **normal distribution**. In this example, section 6 has already shown that the linear form is not perfect; the numbers below illustrate the method.

**Residual standard deviation** (estimate of $\sigma$), with $n - 2$ degrees of freedom, because two parameters were estimated:

$$
s = \sqrt{\frac{SS_{\text{res}}}{n - 2}} = \sqrt{\frac{0.543130\ldots}{6}} = \sqrt{0.090522\ldots} \approx 0.3009 \text{ point}
$$

**Standard error of the slope:**

$$
SE(b) = \frac{s}{\sqrt{S_{xx}}} = \frac{0.300868\ldots}{\sqrt{202.875}} = \frac{0.300868\ldots}{14.243419\ldots} \approx 0.02112
$$

**Test of $H_0: \beta_1 = 0$** (no linear relationship) against $H_1: \beta_1 \neq 0$:

$$
t = \frac{b}{SE(b)} = \frac{0.242452\ldots}{0.021123\ldots} \approx 11.48 \quad \text{with } 6 \text{ degrees of freedom}
$$

The p-value is about 0.000026 (computed by GLM.jl, section 8), far below 0.05: there is strong evidence of an **increasing linear** relationship between hours and grade in this population of students (if the assumptions hold).

**95% confidence interval for the slope**, with $t_{0.025;\,6} = 2.447$ (t table):

$$
b \pm t \times SE(b) = 0.24245 \pm 2.447 \times 0.02112 = 0.24245 \pm 0.05169 = [0.1908,\ 0.2941]
$$

**Two different predictions for 14 hours** (computed by GLM.jl, section 8):

- **confidence interval for the mean grade** of students who study 14 hours: [8.42, 8.99];
- **prediction interval for the grade of one student** who studies 14 hours: [7.91, 9.49].

The second is much wider because it adds the uncertainty about the line to each student's variation around it. Mixing the two up is a common mistake: the line predicts the **mean** well, not each individual.

---

## 8. Julia Code

Each block runs on its own. The first one redoes the arithmetic on this page and checks it against the GLM.jl package.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Statistics, DataFrames, GLM

# Study hours (X) and exam grade (Y) for 8 students (illustrative numbers)
hours = [5, 7, 8, 10, 12, 15, 18, 20]
grades = [6, 7, 7.5, 8, 8.5, 9, 9.5, 10]
n = length(hours)

# Least squares "by hand", with centered sums
mean_x, mean_y = mean(hours), mean(grades)
Sxx = sum((hours .- mean_x) .^ 2)
Sxy = sum((hours .- mean_x) .* (grades .- mean_y))
Syy = sum((grades .- mean_y) .^ 2)
b = Sxy / Sxx                  # slope
a = mean_y - b * mean_x        # intercept

fitted = a .+ b .* hours
residuals = grades .- fitted
SS_res = sum(residuals .^ 2)
R2 = 1 - SS_res / Syy

println("x̄ = ", mean_x, "   ȳ = ", mean_y)
println("Sxx = ", Sxx, "   Sxy = ", Sxy, "   Syy = ", Syy)
println("b = ", round(b, digits = 5), "   a = ", round(a, digits = 5))
println("R² = ", round(R2, digits = 4), "   r = ", round(cor(hours, grades), digits = 4))
println("Prediction for 14 h: ", round(a + b * 14, digits = 4))

# Check with GLM.jl
data = DataFrame(hours = hours, grade = grades)
model = lm(@formula(grade ~ hours), data)
show(stdout, MIME("text/plain"), coeftable(model))
println()
println(predict(model, DataFrame(hours = [14]); interval = :confidence, level = 0.95))
println(predict(model, DataFrame(hours = [14]); interval = :prediction, level = 0.95))</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">x̄ = 11.875   ȳ = 8.1875
Sxx = 202.875   Sxy = 49.1875   Syy = 12.46875
b = 0.24245   a = 5.30838
R² = 0.9564   r = 0.978
Prediction for 14 h: 8.7027
────────────────────────────────────────────────────────────────────────
                Coef.  Std. Error      t  Pr(&gt;|t|)  Lower 95%  Upper 95%
────────────────────────────────────────────────────────────────────────
(Intercept)  5.30838    0.272462   19.48    &lt;1e-05   4.64169    5.97507
hours        0.242452   0.0211233  11.48    &lt;1e-04   0.190765   0.294139
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

In the GLM.jl table, `Std. Error` is the standard error, `t` the statistic for testing whether the coefficient is zero, `Pr(>|t|)` the p-value (`<1e-04` means less than 0.0001) and `Lower 95%`/`Upper 95%` the confidence interval limits. The last two tables are the confidence interval for the mean (`:confidence`) and the prediction interval (`:prediction`) for 14 hours.

The second block produces figure 1:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Plots, Statistics

hours = [5, 7, 8, 10, 12, 15, 18, 20]
grades = [6, 7, 7.5, 8, 8.5, 9, 9.5, 10]
b = sum((hours .- mean(hours)) .* (grades .- mean(grades))) / sum((hours .- mean(hours)) .^ 2)
a = mean(grades) - b * mean(hours)
residuals = grades .- (a .+ b .* hours)

p1 = scatter(hours, grades, label = "Data", xlabel = "Study hours", ylabel = "Grade",
             title = "Least squares line", markersize = 6, legend = :bottomright)
plot!(p1, [5, 20], a .+ b .* [5, 20], lw = 2, color = :crimson, label = "Fitted line")

p2 = scatter(hours, residuals, label = "", xlabel = "Study hours", ylabel = "Residual (grade − fitted)",
             title = "Residuals", markersize = 6)
hline!(p2, [0], ls = :dash, color = :black, label = "")

savefig(plot(p1, p2, layout = (1, 2), size = (900, 380), margin = 5Plots.mm), "linear_regression_en.png")</code></pre>
  </div>
</div>

---

## 9. Calculator

The initial data are those of the example. Add or remove pairs to see the line, $R^2$ and the step-by-step change.

<style>
  #regressao-linear-calc button { padding: 0.35em 1em; border: 1px solid var(--mk-border-strong); border-radius: 6px; background: var(--mk-surface); color: var(--mk-ink); cursor: pointer; }
  #regressao-linear-calc button:focus-visible, #regressao-linear-calc input:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  #regressao-linear-calc .rl-remover { padding: 0.15em 0.6em; font-size: 0.9em; }
  #regressao-linear-calc td { padding: 3px 8px; }
</style>

<div id="regressao-linear-calc" data-lang="en" style="max-width: 640px; margin: 2em auto; padding: 1.5em 2em; background: var(--mk-surface-2); color: var(--mk-ink); border: 1px solid var(--mk-border); border-radius: 10px;">
  <h3 style="text-align: center; margin-top: 0;">Simple linear regression calculator</h3>
  <form id="rl-form-adicionar" style="display: flex; gap: 0.6em; flex-wrap: wrap; justify-content: center; align-items: end; margin-bottom: 0.5em;">
    <label>X<br><input id="rl-x" type="number" step="any" inputmode="decimal" style="width: 7em; padding: 0.3em;"></label>
    <label>Y<br><input id="rl-y" type="number" step="any" inputmode="decimal" style="width: 7em; padding: 0.3em;"></label>
    <button type="submit" style="padding: 0.35em 1em;">Add pair</button>
    <button type="button" id="rl-restaurar" style="padding: 0.35em 1em;">Restore example</button>
  </form>
  <p id="rl-aviso" role="alert" style="text-align: center; min-height: 1.2em; margin: 0.3em 0;"></p>
  <table style="width: 100%; margin-bottom: 1em; border-collapse: collapse;">
    <caption style="caption-side: top; text-align: left; font-size: 0.9em;">Pairs (X, Y)</caption>
    <thead>
      <tr><th scope="col" style="padding: 4px 8px; text-align: left;">X</th><th scope="col" style="padding: 4px 8px; text-align: left;">Y</th><th scope="col"><span style="position: absolute; left: -9999px;">Action</span></th></tr>
    </thead>
    <tbody id="rl-tabela-corpo"></tbody>
  </table>
  <label for="rl-prev-x"><strong>Predict Y for X =</strong></label>
  <input id="rl-prev-x" type="number" step="any" inputmode="decimal" style="width: 7em; padding: 0.3em;">
  <div id="rl-resultado" aria-live="polite" style="margin-top: 1em; padding: 0.8em 1em; background: var(--mk-surface); border: 1px solid var(--mk-border); border-radius: 6px;"></div>
</div>

<script src="{{ site.baseurl }}/assets/js/regressao-linear-calc.js"></script>

The calculator uses the formulas from section 3, with the sums of deviations computed directly (more accurate on a computer than the forms $\sum x_i^2 - n\bar{x}^2$ when the numbers are large). It rejects data sets in which all X values are equal and warns when a prediction is an extrapolation.

---

## 10. When to Use It and When Not To

**Use it** when:

- both variables are quantitative;
- the scatter plot shows a roughly straight trend;
- the goal is to describe the relationship, or to predict $Y$ **within** the observed range of $X$.

**Do not use it, or use it with care,** when:

- **the relationship is curved** (as in the example, in part): the line summarizes poorly and the residuals show a pattern. Transforming the variables or using a curved model may be better;
- **extrapolating**: in the example, the line predicts for 25 hours $\hat{y} = 5.30838 + 0.24245 \times 25 \approx 11.37$, an impossible grade on a 0-to-10 exam;
- **there are outliers or influential points**: a single point far from the others can change the line a lot. Fit with and without it and compare;
- **the spread of the residuals changes with $X$** (funnel shape): the standard errors and intervals become wrong;
- **the observations are not independent** (repeated measurements of the same person, data over time): see [Time Series]({{ '/pt/analise-de-dados/series-temporais' | relative_url }}) (in Portuguese);
- **the goal is to prove cause** with observational data: regression shows association, as correlation does.

---

## 11. Summary

- The model is $Y = \beta_0 + \beta_1 X + \varepsilon$; the least squares line is $\hat{y} = a + bx$, with $b = S_{xy}/S_{xx}$ and $a = \bar{y} - b\bar{x}$.
- In the example: $\hat{y} = 5.30838 + 0.24245\,x$, $R^2 \approx 0.9564$, a prediction of 8.70 points for 14 hours.
- The slope measures association, not cause; the intercept may be meaningless outside the data.
- A high $R^2$ is not enough: the residuals in the example show curvature.
- Predicting a mean and predicting an individual have different intervals.
- Do not extrapolate beyond the observed range of $X$.

---

## References

1. Draper, N. R.; Smith, H. (1998). *Applied Regression Analysis*. 3rd ed. Wiley.
2. Montgomery, D. C.; Peck, E. A.; Vining, G. G. (2012). *Introduction to Linear Regression Analysis*. 5th ed. Wiley.
3. Triola, M. F. (2024). *Introdução à Estatística*. 14th ed. LTC. (in Portuguese; translation of *Elementary Statistics*)
