---
layout: page
title: Multivariate Analysis
lang: en
ref: analise-multivariada
parent: analise-de-dados
permalink: /en/data-analysis/multivariate-analysis
order: 3
mathjax: true
description: "Multivariate analysis in practice: multiple regression with VIF and intervals, PCA and a biplot of the iris data, and k-means, with Julia code and real output."
---

<img src="{{ site.baseurl }}/assets/images/multivariate.avif" alt="Illustration of an analyst at a computer, with a board on the wall showing points from two groups under the title Multivariate Analysis" style="max-width: 600px; display: block; margin: 1em auto;">

**Multivariate analysis** is the set of statistical techniques that look at **several variables at once**. Instead of studying a student's grade only against study hours, it asks, for example, how much study hours, sleep hours and motivation explain together, and how much each one adds when the others are already in the model.

This page presents the families of techniques and works through three of them with data and code: **multiple linear regression**, **principal component analysis (PCA)** with a biplot, and **k-means clustering**.

---

## 1. What is Multivariate Analysis?

**Univariate** analysis studies one variable (the mean grade); **bivariate** analysis, two (the correlation between study hours and grade). **Multivariate** analysis considers three or more variables simultaneously. This matters because variables tend to move together: students who sleep more may also be more motivated, and looking only at sleep against grade mixes up the effect of both.

### 1.1 Main techniques

**Dependence techniques**: one or more variables are treated as the response, explained by the others.

- **Multiple linear regression**: explains a quantitative response with several explanatory variables.
- **Logistic regression**: the response is categorical (for example, pass or fail).
- **Discriminant analysis**: assigns observations to known groups based on several measurements.

**Interdependence techniques**: no variable is the response; the goal is to describe the structure of the whole set.

- **Principal component analysis (PCA)**: summarizes many correlated variables in a few uncorrelated combinations.
- **Factor analysis**: looks for unobserved (latent) factors that explain the correlations.
- **Cluster analysis**: forms groups of similar observations.
- **Correspondence analysis** (simple and multiple): describes associations between categorical variables; it plays a role for tables of counts similar to that of PCA.

**Other techniques**, more advanced:

- **Multivariate time series**: several series observed over time (see [Time Series]({{ '/en/data-analysis/time-series' | relative_url }}) for the single-series case).
- **Structural equation models**: relate latent and observed variables in a system of equations. The causal relationships in the model are hypotheses of whoever proposes it; fitting it to data does not prove them.
- **Canonical correlation analysis**: measures the association between two sets of variables.

---

## 2. Multiple Linear Regression

Multiple linear regression extends [simple linear regression]({{ '/en/data-analysis/linear-regression' | relative_url }}) to several explanatory variables.

### 2.1 The model

$$
Y = \beta_0 + \beta_1X_1 + \beta_2X_2 + \cdots + \beta_pX_p + \varepsilon
$$

Where:
- $$Y$$ is the response variable;
- $$X_1, X_2, \ldots, X_p$$ are the $$p$$ explanatory variables;
- $$\beta_0$$ is the intercept: the expected value of $$Y$$ when all the $$X$$ are zero (often a situation outside the data, with no practical meaning);
- $$\beta_j$$ is the expected change in $$Y$$ when $$X_j$$ increases by one unit **and the other $$X$$ are held fixed**;
- $$\varepsilon$$ is the random error: what the model does not explain.

The coefficients are estimated by **least squares**: the values $$b_0, b_1, \ldots, b_p$$ that minimize the sum of squared residuals $$e_i = y_i - \hat{y}_i$$, where $$\hat{y}_i = b_0 + b_1x_{i1} + \cdots + b_px_{ip}$$ is the predicted value for observation $$i$$.

### 2.2 Model assumptions

1. **Linearity**: the expected value of $$Y$$ is a linear combination of the $$X$$ (the model may include terms such as $$X^2$$; "linear" refers to the coefficients).
2. **Independence**: the errors of different observations are independent (this fails, for example, with repeated measurements of the same person or data over time).
3. **Homoscedasticity**: the error variance is the same for all values of the $$X$$.
4. **Normality of the errors**: needed for the t- and F-tests and for the intervals with small samples; not needed to compute the estimates.
5. **No perfect collinearity**: no $$X$$ can be an exact linear combination of the others. High but not perfect correlation among the $$X$$ (multicollinearity) does not prevent the fit, but it makes the coefficients unstable and their standard errors large; it is measured by the VIF (section 3.3).

---

## 3. Worked Example: Grade, Study, Sleep and Motivation

### 3.1 The data

The data below are **illustrative, made up** for this example: 16 students, with study hours in the week before the exam, hours of sleep per night, self-reported motivation (scale from 1 to 10) and exam grade (0 to 10). The first eight students have the same study hours and grades as the example on the [Linear Regression]({{ '/en/data-analysis/linear-regression' | relative_url }}) page.

| Student | Study hours | Sleep hours | Motivation (1–10) | Grade |
|---|---|---|---|---|
| 1 | 5 | 6 | 7 | 6.0 |
| 2 | 7 | 7 | 8 | 7.0 |
| 3 | 8 | 6 | 6 | 7.5 |
| 4 | 10 | 8 | 9 | 8.0 |
| 5 | 12 | 7 | 8 | 8.5 |
| 6 | 15 | 9 | 9 | 9.0 |
| 7 | 18 | 8 | 9 | 9.5 |
| 8 | 20 | 7 | 10 | 10.0 |
| 9 | 6 | 5 | 5 | 5.5 |
| 10 | 9 | 8 | 7 | 7.8 |
| 11 | 11 | 6 | 8 | 8.2 |
| 12 | 14 | 9 | 9 | 8.8 |
| 13 | 16 | 7 | 8 | 9.2 |
| 14 | 19 | 8 | 9 | 9.6 |
| 15 | 22 | 6 | 7 | 8.5 |
| 16 | 25 | 7 | 8 | 9.1 |

The first block summarizes the variables and computes the Pearson correlation matrix. Every code block on this page runs on its own (each one carries its own data), and the outputs were copied from the actual run.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>using DataFrames, Statistics

# Illustrative (made-up) data: 16 students
data = DataFrame(
    StudyHours = [5, 7, 8, 10, 12, 15, 18, 20, 6, 9, 11, 14, 16, 19, 22, 25],
    SleepHours = [6, 7, 6, 8, 7, 9, 8, 7, 5, 8, 6, 9, 7, 8, 6, 7],
    Motivation = [7, 8, 6, 9, 8, 9, 9, 10, 5, 7, 8, 9, 8, 9, 7, 8],
    Grade      = [6.0, 7.0, 7.5, 8.0, 8.5, 9.0, 9.5, 10.0, 5.5, 7.8, 8.2, 8.8, 9.2, 9.6, 8.5, 9.1]
)

# Summary of each variable
println(describe(data, :mean, :std, :min, :median, :max))

# Pearson correlation matrix of the four variables
R = cor(Matrix(data))
println(DataFrame(round.(R, digits = 3), names(data)))</code></pre>
  </div>
</div>

<div class="code-output">
  <div class="code-output-header"># Output</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">4×6 DataFrame
 Row │ variable    mean     std      min   median   max
     │ Symbol      Float64  Float64  Real  Float64  Real
─────┼───────────────────────────────────────────────────
   1 │ StudyHours  13.5625  6.04394   5       13.0  25
   2 │ SleepHours   7.125   1.14746   5        7.0   9
   3 │ Motivation   7.9375  1.28938   5        8.0  10
   4 │ Grade        8.2625  1.26695   5.5      8.5  10.0
4×4 DataFrame
 Row │ StudyHours  SleepHours  Motivation  Grade
     │ Float64     Float64     Float64     Float64
─────┼─────────────────────────────────────────────
   1 │      1.0         0.278       0.51     0.825
   2 │      0.278       1.0         0.727    0.586
   3 │      0.51        0.727       1.0      0.79
   4 │      0.825       0.586       0.79     1.0</pre>
</div>

**How to read it.** All three explanatory variables are positively correlated with the grade (0.825, 0.586, 0.790). But they are also correlated with each other: sleep and motivation have $$r = 0.727$$. That is why the 0.586 correlation between sleep and grade does not tell how much sleep adds **on its own**: part of it may come from motivation, which goes along with sleep. Separating these contributions is exactly what multiple regression tries to do.

### 3.2 Fitting the model

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>using DataFrames, GLM, Statistics, HypothesisTests

# Illustrative (made-up) data: 16 students
data = DataFrame(
    StudyHours = [5, 7, 8, 10, 12, 15, 18, 20, 6, 9, 11, 14, 16, 19, 22, 25],
    SleepHours = [6, 7, 6, 8, 7, 9, 8, 7, 5, 8, 6, 9, 7, 8, 6, 7],
    Motivation = [7, 8, 6, 9, 8, 9, 9, 10, 5, 7, 8, 9, 8, 9, 7, 8],
    Grade      = [6.0, 7.0, 7.5, 8.0, 8.5, 9.0, 9.5, 10.0, 5.5, 7.8, 8.2, 8.8, 9.2, 9.6, 8.5, 9.1]
)

# Multiple linear regression by least squares
model = lm(@formula(Grade ~ StudyHours + SleepHours + Motivation), data)
display(coeftable(model))

# Names different from the functions r2 and adjr2, so they are not overwritten
R2    = r2(model)
R2adj = adjr2(model)
println("R² = ", round(R2, digits = 4), "   adjusted R² = ", round(R2adj, digits = 4))

# Overall F-test: H₀: β₁ = β₂ = β₃ = 0
println(ftest(model.model))

# Normality of the residuals (with n = 16, the test has little power)
res = residuals(model)
println("Shapiro-Wilk: p-value = ", round(pvalue(ShapiroWilkTest(res)), digits = 4))

# VIF: regress each explanatory variable on the other two; VIF = 1 / (1 − R²ⱼ)
predictors = [:StudyHours, :SleepHours, :Motivation]
for target in predictors
    others = setdiff(predictors, [target])
    r2j = r2(lm(Term(target) ~ Term(others[1]) + Term(others[2]), data))
    println("VIF of ", target, " = ", round(1 / (1 - r2j), digits = 3))
end</code></pre>
  </div>
</div>

<div class="code-output">
  <div class="code-output-header"># Output</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">────────────────────────────────────────────────────────────────────────
                Coef.  Std. Error     t  Pr(&gt;|t|)   Lower 95%  Upper 95%
────────────────────────────────────────────────────────────────────────
(Intercept)  2.45605    0.876519   2.80    0.0160   0.546279    4.36582
StudyHours   0.123207   0.0252597  4.88    0.0004   0.0681712   0.178244
SleepHours   0.154719   0.166622   0.93    0.3714  -0.208319    0.517758
Motivation   0.38212    0.16556    2.31    0.0396   0.0213943   0.742845
────────────────────────────────────────────────────────────────────────
R² = 0.8742   adjusted R² = 0.8427
F-test against the null model:
F-statistic: 27.79 on 16 observations and 3 degrees of freedom, p-value: &lt;1e-04
Shapiro-Wilk: p-value = 0.7151
VIF of StudyHours = 1.385
VIF of SleepHours = 2.172
VIF of Motivation = 2.707</pre>
</div>

**The coefficients.** The fitted equation is

$$
\widehat{\text{Grade}} = 2.456 + 0.1232 \cdot \text{Study} + 0.1547 \cdot \text{Sleep} + 0.3821 \cdot \text{Motivation}
$$

- **Study hours** ($$b_1 = 0.1232$$; p-value $$= 0.0004$$): among students with the same sleep and the same motivation, each extra hour of study is associated with a predicted grade 0.12 point higher. The 95% interval goes from 0.068 to 0.178.
- **Motivation** ($$b_3 = 0.3821$$; p-value $$= 0.040$$): with study and sleep fixed, each extra point on the motivation scale is associated with 0.38 point more in the predicted grade (95% interval: 0.021 to 0.743, quite wide).
- **Sleep hours** ($$b_2 = 0.1547$$; p-value $$= 0.37$$): the 95% interval, from −0.208 to 0.518, includes zero. With study and motivation already in the model, these 16 students do not allow us to say whether sleep adds anything. This does **not** prove that sleep does not matter: the sample is small and sleep is strongly tied to motivation ($$r = 0.727$$), which makes it hard to separate the two effects.
- **Intercept** ($$b_0 = 2.456$$): it would be the predicted grade with zero hours of study, zero hours of sleep and zero motivation, a combination that does not occur in the data (and zero motivation is not even on the scale). It positions the plane; it is not meant to be interpreted.

The data are observational: the coefficients measure **association**, not causal effect. A student who starts studying one more hour does not necessarily gain 0.12 point.

**Do not compare the coefficients to say which variable "matters more".** They are in different units (points per hour; points per motivation point): measuring study time in minutes would divide its coefficient by 60 without changing anything in the model. To compare, use the p-values and intervals, standardized coefficients, or how much $$R^2$$ drops when the variable is removed.

**R² and adjusted R².** With the residual sum of squares $$SS_{res} = 3.0298$$ and the total sum of squares $$SS_{tot} = \sum (y_i - \bar{y})^2 = 24.0775$$:

$$
R^2 = 1 - \frac{SS_{res}}{SS_{tot}} = 1 - \frac{3.0298}{24.0775} = 1 - 0.1258 = 0.8742
$$

The model explains 87.4% of the variation in the grades **in this sample**. $$R^2$$ never decreases when a variable is added, even a useless one; the **adjusted $$R^2$$** accounts for the number of variables ($$p = 3$$) and the sample size ($$n = 16$$):

$$
R^2_{adj} = 1 - (1 - R^2)\,\frac{n-1}{n-p-1} = 1 - 0.12584 \times \frac{15}{12} = 1 - 0.15729 = 0.8427
$$

(The calculations use the values with all their digits; the numbers shown are rounded.)

**Overall F-test.** It tests $$H_0: \beta_1 = \beta_2 = \beta_3 = 0$$ (none of the three variables is associated with the grade) against the alternative that at least one coefficient is different from zero:

$$
F = \frac{R^2 / p}{(1 - R^2)/(n - p - 1)} = \frac{0.8742 / 3}{0.1258 / 12} = \frac{0.29139}{0.010486} = 27.79
$$

with 3 and 12 degrees of freedom. The p-value, computed from the F(3, 12) distribution, is $$1.1 \times 10^{-5}$$ (the output only shows that it is below $$10^{-4}$$). We reject $$H_0$$ at the 5% level. The test does not say **which** variable matters; that is what the t-tests of each coefficient are for.

**Residuals.** The Shapiro-Wilk test gives p-value $$= 0.715$$: there is no evidence against normality of the residuals. With only 16 observations, however, the test has little power; this does not prove that the errors are normal. It is also worth looking at the plot of residuals against predicted values, as on the [Linear Regression]({{ '/en/data-analysis/linear-regression' | relative_url }}) page.

### 3.3 Multicollinearity: the VIF

The **variance inflation factor** (VIF) of variable $$X_j$$ is

$$
VIF_j = \frac{1}{1 - R^2_j}
$$

where $$R^2_j$$ is the $$R^2$$ of the regression of $$X_j$$ on the **other** explanatory variables. If $$X_j$$ has no linear relationship with the others, $$R^2_j = 0$$ and $$VIF_j = 1$$; the better it is predicted by the others, the larger the VIF, and the more uncertain its coefficient. In the example, motivation has $$R^2_3 = 0.6306$$, so $$VIF_3 = 1/(1 - 0.6306) = 1/0.3694 = 2.707$$.

The three VIFs (1.385, 2.172, 2.707) are far from the limits used as a **rule of thumb** (5 or 10, depending on the author). Even so, the correlation between sleep and motivation helps explain why both coefficients have wide intervals.

### 3.4 Predictions and intervals

There are two different intervals for a prediction:

- the **confidence interval** estimates the **mean** grade of all students with that profile;
- the **prediction interval** estimates the grade of **one** student with that profile. It is always wider, because it adds the variation of an individual around the mean to the uncertainty about the mean.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>using DataFrames, GLM

# Illustrative (made-up) data: 16 students
data = DataFrame(
    StudyHours = [5, 7, 8, 10, 12, 15, 18, 20, 6, 9, 11, 14, 16, 19, 22, 25],
    SleepHours = [6, 7, 6, 8, 7, 9, 8, 7, 5, 8, 6, 9, 7, 8, 6, 7],
    Motivation = [7, 8, 6, 9, 8, 9, 9, 10, 5, 7, 8, 9, 8, 9, 7, 8],
    Grade      = [6.0, 7.0, 7.5, 8.0, 8.5, 9.0, 9.5, 10.0, 5.5, 7.8, 8.2, 8.8, 9.2, 9.6, 8.5, 9.1]
)
model = lm(@formula(Grade ~ StudyHours + SleepHours + Motivation), data)

# Three new students
new = DataFrame(StudyHours = [14, 16, 18], SleepHours = [8, 7, 9], Motivation = [8, 9, 8])

# Confidence interval for the MEAN grade of students with this profile
mean_ci = predict(model, new; interval = :confidence, level = 0.95)
# Prediction interval for the grade of ONE student with this profile
single = predict(model, new; interval = :prediction, level = 0.95)

r(x) = round(x, digits = 2)
for i in 1:nrow(new)
    println("Scenario $i (study = $(new.StudyHours[i]) h, sleep = $(new.SleepHours[i]) h, ",
            "motivation = $(new.Motivation[i])): predicted grade = $(r(mean_ci.prediction[i]))")
    println("   95% CI for the mean:          [$(r(mean_ci.lower[i])), $(r(mean_ci.upper[i]))]")
    println("   95% prediction for a student: [$(r(single.lower[i])), $(r(single.upper[i]))]")
end</code></pre>
  </div>
</div>

<div class="code-output">
  <div class="code-output-header"># Output</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">Scenario 1 (study = 14 h, sleep = 8 h, motivation = 8): predicted grade = 8.48
   95% CI for the mean:          [8.06, 8.89]
   95% prediction for a student: [7.31, 9.64]
Scenario 2 (study = 16 h, sleep = 7 h, motivation = 9): predicted grade = 8.95
   95% CI for the mean:          [8.48, 9.41]
   95% prediction for a student: [7.76, 10.14]
Scenario 3 (study = 18 h, sleep = 9 h, motivation = 8): predicted grade = 9.12
   95% CI for the mean:          [8.33, 9.91]
   95% prediction for a student: [7.77, 10.47]</pre>
</div>

For scenario 1, the predicted grade is 8.48. The mean grade of students with this profile should be between 8.06 and 8.89; the grade of one student, between 7.31 and 9.64. The 95% refers to the **method**: intervals built this way are right in 95% of samples, if the model is correct.

In scenarios 2 and 3, the upper limit of the prediction interval goes above 10, the maximum exam grade. The linear model does not know that the grade has a ceiling; near the limits of the scale, predictions must be read with this in mind. The same applies to profiles outside the observed range (extrapolation).

---

## 4. Principal Component Analysis (PCA)

### 4.1 The idea

**Principal component analysis** replaces the $$p$$ original variables, which may be correlated, with $$p$$ new variables, the **principal components**, which are linear combinations of the originals, uncorrelated with each other and ordered by variance: the first (PC1) captures as much variance as possible, the second (PC2) as much of the remaining variance as possible, and so on. If the first few components hold almost all of the variance, they summarize the data in few dimensions.

### 4.2 How it is computed

Let $$\mathbf{X}$$ be the $$n \times p$$ data matrix ($$n$$ observations in the rows, $$p$$ variables in the columns).

**Step 1: standardization.** Each variable $$j$$ is centered at its mean and divided by its sample standard deviation:

$$
z_{ij} = \frac{x_{ij} - \bar{x}_j}{s_j}
$$

Without standardizing, variables with large numbers (study hours, from 5 to 25) would dominate those with small numbers (sleep, from 5 to 9) just because of their units.

**Step 2: correlation matrix.** With the standardized data in the matrix $$\mathbf{Z}$$,

$$
\mathbf{R} = \frac{1}{n-1}\mathbf{Z}^T\mathbf{Z}
$$

is the correlation matrix of the original variables.

**Step 3: eigenvalues and eigenvectors.** The spectral decomposition

$$
\mathbf{R} = \mathbf{V}\mathbf{\Lambda}\mathbf{V}^T
$$

gives the diagonal matrix $$\mathbf{\Lambda}$$ of eigenvalues $$\lambda_1 \geq \lambda_2 \geq \cdots \geq \lambda_p$$ and the matrix $$\mathbf{V}$$ whose columns are the eigenvectors, the **loadings** (the weight of each variable in each component). The eigenvalue $$\lambda_j$$ is the variance of component $$j$$; since each standardized variable has variance 1, the eigenvalues add up to $$p$$, and component $$j$$ explains the fraction $$\lambda_j / p$$ of the total variance.

**Step 4: scores.** The coordinates of the observations on the components (the **scores**) are

$$
\mathbf{Y} = \mathbf{Z}\mathbf{V}
$$

The sign of each eigenvector is arbitrary: different software may flip the sign of a whole component (loadings and scores together) without changing anything in the analysis.

### 4.3 PCA of the example variables

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>using DataFrames, Statistics, MultivariateStats

# Illustrative (made-up) data: 16 students
data = DataFrame(
    StudyHours = [5, 7, 8, 10, 12, 15, 18, 20, 6, 9, 11, 14, 16, 19, 22, 25],
    SleepHours = [6, 7, 6, 8, 7, 9, 8, 7, 5, 8, 6, 9, 7, 8, 6, 7],
    Motivation = [7, 8, 6, 9, 8, 9, 9, 10, 5, 7, 8, 9, 8, 9, 7, 8],
    Grade      = [6.0, 7.0, 7.5, 8.0, 8.5, 9.0, 9.5, 10.0, 5.5, 7.8, 8.2, 8.8, 9.2, 9.6, 8.5, 9.1]
)

# PCA of the explanatory variables only, standardized (mean 0, standard deviation 1)
X = Matrix(select(data, Not(:Grade)))
Z = (X .- mean(X, dims = 1)) ./ std(X, dims = 1)

# MultivariateStats expects one variable per row: hence Z'
pca = fit(PCA, Z'; pratio = 1.0)           # pratio = 1.0 keeps all components
proportion = principalvars(pca) ./ var(pca) # var(pca) = total variance

println("Eigenvalues: ", round.(principalvars(pca), digits = 4))
for (j, p) in enumerate(proportion)
    println("PC$j explains ", round(100p, digits = 1), "% of the variance")
end
println("Loadings (columns = PC1, PC2, PC3):")
loads = DataFrame(round.(projection(pca), digits = 3), ["PC1", "PC2", "PC3"])
insertcols!(loads, 1, :Variable =&gt; names(data)[1:3])
println(loads)</code></pre>
  </div>
</div>

<div class="code-output">
  <div class="code-output-header"># Output</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">Eigenvalues: [2.0314, 0.7426, 0.226]
PC1 explains 67.7% of the variance
PC2 explains 24.8% of the variance
PC3 explains 7.5% of the variance
Loadings (columns = PC1, PC2, PC3):
3×4 DataFrame
 Row │ Variable    PC1      PC2      PC3
     │ String      Float64  Float64  Float64
─────┼───────────────────────────────────────
   1 │ StudyHours   -0.48     0.833   -0.276
   2 │ SleepHours   -0.588   -0.539   -0.603
   3 │ Motivation   -0.651   -0.127    0.748</pre>
</div>

The three eigenvalues add up to $$2.0314 + 0.7426 + 0.2260 = 3$$, the number of variables. PC1 explains $$2.0314/3 = 67.7\%$$ of the variance; together with PC2, it reaches 92.5%.

On PC1, the three variables have loadings of the same sign (−0.480, −0.588, −0.651): it measures an "overall level" of study, sleep and motivation at the same time (the negative sign is just the software's convention). PC2 contrasts study (+0.833) with sleep (−0.539): it separates those who study a lot and sleep little from those who do the opposite. With only three variables the gain is small, but the same idea summarizes dozens of variables in two or three components.

---

## 5. Biplot: The Iris Data

### 5.1 What is a biplot

A **biplot** shows, in the same chart:

1. the **observations**, as points at their PC1 and PC2 coordinates (scores);
2. the **original variables**, as arrows from the origin to their loadings on PC1 and PC2, $$(v_{k1}, v_{k2})$$ for variable $$k$$.

Reading the arrows (approximately, and the better the more variance the two components capture):

- arrows pointing the **same way** indicate positively correlated variables; **opposite ways**, negatively correlated; **perpendicular**, weakly correlated;
- an arrow almost parallel to an axis points to the variable that weighs most on that component;
- a short arrow indicates a variable poorly represented by the first two components.

### 5.2 The data

The **iris** data set has four measurements, in centimeters (sepal length and width, petal length and width), of 150 flowers: 50 of each species, *Iris setosa*, *I. versicolor* and *I. virginica*. The measurements were collected by the botanist Edgar Anderson and used by Fisher (1936) to present linear discriminant analysis. The code uses the copy that ships with R, loaded by the RDatasets.jl package.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>using RDatasets, DataFrames, MultivariateStats, Statistics, LinearAlgebra, Distributions, Plots

# Measurements (in cm) of 150 iris flowers, 50 of each species
iris = dataset("datasets", "iris")
X = Matrix(iris[:, 1:4])
species = String.(iris.Species)

# Standardize and fit the PCA with ALL components
Z = (X .- mean(X, dims = 1)) ./ std(X, dims = 1)
pca = fit(PCA, Z'; pratio = 1.0)
proportion = principalvars(pca) ./ var(pca)   # share of the TOTAL variance

scores   = predict(pca, Z')'          # coordinates of the flowers (150 × 4)
loadings = projection(pca)[:, 1:2]    # weights of the 4 variables on PC1 and PC2

pct(j) = round(100 * proportion[j], digits = 1)
p = plot(xlabel = "PC1 ($(pct(1))% of variance)", ylabel = "PC2 ($(pct(2))% of variance)",
         legend = :topright, size = (720, 540), framestyle = :box)
hline!(p, [0], color = :gray, linestyle = :dash, label = "")
vline!(p, [0], color = :gray, linestyle = :dash, label = "")

# Ellipse with 68% probability if the group scores are bivariate normal.
# In 2D this gives radius √χ²₂(0.68) ≈ 1.51 standard deviations (not 1 standard deviation).
function ellipse(x, y, prob)
    eigvals_, eigvecs_ = eigen(cov([x y]))
    radius = sqrt(quantile(Chisq(2), prob))
    t = range(0, 2π, length = 200)
    points = eigvecs_ * (radius .* sqrt.(eigvals_) .* [cos.(t) sin.(t)]')
    return mean(x) .+ points[1, :], mean(y) .+ points[2, :]
end

colors = Dict("setosa" =&gt; :royalblue, "versicolor" =&gt; :darkorange, "virginica" =&gt; :forestgreen)
for sp in ["setosa", "versicolor", "virginica"]
    g = species .== sp
    scatter!(p, scores[g, 1], scores[g, 2], color = colors[sp], label = sp,
             markersize = 4, markerstrokewidth = 0, alpha = 0.75)
    ex, ey = ellipse(scores[g, 1], scores[g, 2], 0.68)
    plot!(p, ex, ey, color = colors[sp], linewidth = 2, label = "")
end

# Loading arrows, multiplied by 3 only to make them visible
labels = ["Sepal length", "Sepal width", "Petal length", "Petal width"]
offset = [(0.0, 0.22), (0.0, 0.22), (-0.15, 0.30), (-0.15, -0.25)]   # label positions
for k in 1:4
    x, y = 3loadings[k, 1], 3loadings[k, 2]
    plot!(p, [0, x], [0, y], arrow = true, color = :black, linewidth = 1.5, label = "")
    annotate!(p, x + offset[k][1], y + offset[k][2], text(labels[k], 9, :black, :right))
end
plot!(p, ylims = (-2.9, 3.4))
savefig(p, "pca_biplot_iris-en.png")

println("PC1: ", round(100proportion[1], digits = 2), "%   PC2: ", round(100proportion[2], digits = 2),
        "%   PC1 + PC2: ", round(100(proportion[1] + proportion[2]), digits = 2), "%")
println("Loadings on PC1 and PC2:")
println(DataFrame(Variable = names(iris)[1:4], PC1 = round.(loadings[:, 1], digits = 3),
                  PC2 = round.(loadings[:, 2], digits = 3)))</code></pre>
  </div>
</div>

<div class="code-output">
  <div class="code-output-header"># Output</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">PC1: 72.96%   PC2: 22.85%   PC1 + PC2: 95.81%
Loadings on PC1 and PC2:
4×3 DataFrame
 Row │ Variable     PC1      PC2
     │ String       Float64  Float64
─────┼───────────────────────────────
   1 │ SepalLength   -0.521    0.377
   2 │ SepalWidth     0.269    0.923
   3 │ PetalLength   -0.58     0.024
   4 │ PetalWidth    -0.565    0.067</pre>
</div>

<img src="{{ site.baseurl }}/assets/images/pca_biplot_iris-en.png" alt="PCA biplot of the iris data: points of the three species on PC1 and PC2, with setosa on the right and versicolor and virginica on the left, 68% ellipses for each species and arrows for the four measurements" style="max-width: 720px; width: 100%; display: block; margin: 1em auto;">
<div class="image-caption" style="text-align: center;">Figure 1. PCA biplot of the standardized iris data. Points: flowers, colored by species (blue: setosa; orange: versicolor; green: virginica). Ellipses: 68% regions for each species, assuming bivariate normality. Arrows: loadings of the four measurements, multiplied by 3. Generated by the code above.</div>

### 5.3 Interpretation

**Variance.** PC1 explains 72.96% of the variance and PC2, 22.85%: together, $$72.96\% + 22.85\% = 95.81\%$$. The two-dimensional chart keeps almost all the information in the four measurements, and the arrows can be read with confidence.

**Arrows.**
- Petal length, petal width and sepal length have large loadings of the same sign on PC1 (−0.580, −0.565, −0.521): PC1 works as a **flower size** axis. Since the loadings are negative, larger flowers lie to the **left**.
- The petal length and petal width arrows almost overlap: the two measurements have a correlation of 0.963.
- Sepal width has a loading of 0.923 on PC2 and only 0.269 on PC1: PC2 is essentially sepal width.

**Points.**
- *Setosa* sits apart on the right: much smaller petals (mean length 1.46 cm, against 4.26 cm for versicolor and 5.55 cm for virginica) and wider sepals (3.43 cm, against 2.77 cm and 2.97 cm).
- *Versicolor* and *virginica* partly overlap: they are more alike, although virginica tends to lie further left (larger flowers).

**Ellipses.** Each ellipse is the region that would contain 68% of the flowers of the species if the group's scores followed a bivariate normal distribution:

$$
\left\{ \mathbf{x} : (\mathbf{x} - \bar{\mathbf{x}})^T\mathbf{S}^{-1}(\mathbf{x} - \bar{\mathbf{x}}) \leq \chi^2_{2,\,0.68} \right\}
$$

where $$\bar{\mathbf{x}}$$ is the center (the mean scores) of the group, $$\mathbf{S}$$ is the covariance matrix of the group's scores and $$\chi^2_{2,\,0.68} = 2.2789$$ is the 0.68 quantile of the chi-square distribution with 2 degrees of freedom. It describes the **spread of the flowers**; it is not a confidence interval for the mean. And 68% in two dimensions does not correspond to "1 standard deviation": the radius is $$\sqrt{2.2789} = 1.51$$ standard deviations in each direction; a 1-standard-deviation ellipse would contain only 39.3% of the points.

---

## 6. Clustering: K-means

**K-means** splits the observations into $$k$$ groups chosen by the analyst. It starts with $$k$$ randomly chosen centers, assigns each point to the nearest center, recomputes each center as the mean of its points, and repeats until nothing changes. The result (locally) minimizes the sum of squared distances from each point to the center of its group.

In the student example, we cluster on the three standardized explanatory variables; the grade is left out, so we can check afterwards whether the groups differ in it.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>using DataFrames, Statistics, Clustering, Random

# Illustrative (made-up) data: 16 students
data = DataFrame(
    StudyHours = [5, 7, 8, 10, 12, 15, 18, 20, 6, 9, 11, 14, 16, 19, 22, 25],
    SleepHours = [6, 7, 6, 8, 7, 9, 8, 7, 5, 8, 6, 9, 7, 8, 6, 7],
    Motivation = [7, 8, 6, 9, 8, 9, 9, 10, 5, 7, 8, 9, 8, 9, 7, 8],
    Grade      = [6.0, 7.0, 7.5, 8.0, 8.5, 9.0, 9.5, 10.0, 5.5, 7.8, 8.2, 8.8, 9.2, 9.6, 8.5, 9.1]
)

# Clustering on the explanatory variables only, standardized
X = Matrix(select(data, Not(:Grade)))
Z = (X .- mean(X, dims = 1)) ./ std(X, dims = 1)

Random.seed!(123)                 # k-means starts from randomly chosen centers
result = kmeans(Z', 3)            # k = 3 groups, chosen by us
data.Cluster = assignments(result)

println("Size of each cluster: ", counts(result))
println(combine(groupby(data, :Cluster), nrow =&gt; :n,
        [:StudyHours, :SleepHours, :Motivation, :Grade] .=&gt; (x -&gt; round(mean(x), digits = 2)),
        renamecols = false))</code></pre>
  </div>
</div>

<div class="code-output">
  <div class="code-output-header"># Output</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">Size of each cluster: [3, 5, 8]
3×6 DataFrame
 Row │ Cluster  n      StudyHours  SleepHours  Motivation  Grade
     │ Int64    Int64  Float64     Float64     Float64     Float64
─────┼─────────────────────────────────────────────────────────────
   1 │       1      3        6.33        5.67        6.0      6.33
   2 │       2      5        9.8         7.2         8.0      7.9
   3 │       3      8       18.62        7.62        8.62     9.21</pre>
</div>

The clusters came out ordered by study time: 3 students with little study, little sleep and low motivation (6.3 study hours on average); 5 in between (9.8 h); and 8 who study a lot (18.6 h). Even without using the grade, the clusters have very different mean grades (6.33, 7.90, 9.21). The numbering of the clusters is arbitrary.

Cautions:
- **$$k$$ is your choice.** Here $$k = 3$$ was fixed; criteria such as the "elbow" of the sum of distances or the silhouette help choose it.
- **The result depends on the random start.** We fixed the seed (`Random.seed!(123)`); another seed, or another Julia version, may give other clusters. Running it several times and keeping the best solution is common practice.
- **Scale matters.** Without standardizing, study hours (from 5 to 25) would dominate the distance.
- With 16 observations, the clusters are only an illustration.

---

## 7. Common Problems and Solutions

| Problem | What it is | How to detect it | What to do |
|---|---|---|---|
| Multicollinearity | Explanatory variables strongly correlated with each other | High VIF (rule of thumb: above 5 or 10) | Remove redundant variables; regularization (ridge, lasso); use principal components as predictors |
| Heteroscedasticity | Residual variance changes with the predicted values | Funnel-shaped plot of residuals against predicted values | Transform the response (log, square root); robust standard errors; weighted least squares |
| Nonlinearity | The relationship does not follow a line (or plane) | Curved pattern in the residual plot | Include terms such as $$X^2$$; transform variables; nonlinear models |
| Outliers and influential points | Observations that change the fit a lot | Large standardized residuals; Cook's distance | Investigate where the point comes from; fit with and without it and compare; robust methods |

---

## 8. Where It Is Used

- **Health**: studying risk factors while adjusting for age and other variables; building prognostic scores.
- **Marketing**: segmenting customers by clustering; summarizing long questionnaires with PCA or factor analysis.
- **Finance**: credit risk models with several customer characteristics.
- **Engineering and quality**: statistical process control with several measurements at once.
- **Social sciences**: relating income, schooling, region and other socioeconomic variables.

---

## 9. When to Use It and When Not To

**Use it** when:

- the phenomenon depends on several factors at once and you want the role of each one **with the others held fixed**;
- you need to **adjust for confounding variables** (comparing groups that differ in age, for example);
- there are many correlated variables and you want to **summarize them** (PCA) or **find groups** (clustering).

**Do not use it, or use it with care,** when:

- **the sample is small for the number of variables**: each extra variable uses up information, and the coefficients become unstable (in the example, 16 students for 3 variables already give wide intervals);
- **the goal is to prove causation** with observational data: adjusting for measured variables does not remove the ones that were not measured;
- **the assumptions do not hold** (patterned residuals, dependent observations): the p-values and intervals are no longer valid;
- **variables are added just to raise $$R^2$$**: $$R^2$$ always goes up; the model may get worse on new data (overfitting);
- **k-means clusters or PCA components are read as "real" things**: they are summaries of the data, which depend on the variables chosen, on standardization and, for k-means, on $$k$$ and on the random start.

---

## 10. Summary

- Multivariate analysis studies several variables together; the techniques split into dependence (there is a response) and interdependence (structure of the whole set).
- In multiple regression, each coefficient is the effect associated with one variable **with the others held fixed**. In the example: $$\widehat{\text{Grade}} = 2.456 + 0.1232\,\text{Study} + 0.1547\,\text{Sleep} + 0.3821\,\text{Motivation}$$, with $$R^2 = 0.8742$$ and $$R^2_{adj} = 0.8427$$; sleep was not associated with the grade once study and motivation were taken into account (p-value $$= 0.37$$).
- The VIF measures multicollinearity; in the example, all VIFs were below 3.
- The prediction interval (one individual) is wider than the confidence interval (the mean).
- PCA summarizes correlated variables; in the iris data, PC1 and PC2 keep 95.81% of the variance.
- K-means depends on $$k$$, on the scale and on the random start.

---

## References

1. Fisher, R. A. (1936). The use of multiple measurements in taxonomic problems. *Annals of Eugenics*, 7(2), 179–188. DOI: [10.1111/j.1469-1809.1936.tb02137.x](https://doi.org/10.1111/j.1469-1809.1936.tb02137.x).
2. Johnson, R. A.; Wichern, D. W. (2007). *Applied Multivariate Statistical Analysis*. 6th ed. Pearson Prentice Hall.
3. Montgomery, D. C.; Peck, E. A.; Vining, G. G. (2012). *Introduction to Linear Regression Analysis*. 5th ed. Wiley.
