---
layout: page
title: Hypothesis Testing
lang: en
ref: testes-hipotese
parent: inferencia-estatistica
permalink: /en/statistical-inference/hypothesis-testing
order: 1
mathjax: true
description: "Hypothesis testing: H₀ and H₁, Type I and II errors, p-values, power, and t, Z, chi-square and proportion tests, with worked examples and Julia code."
---

<img src="{{ site.baseurl }}/assets/images/testedehipotese.avif" alt="Illustration of a person at a computer showing two overlapping normal curves" style="max-width: 600px; display: block; margin: 1em auto;">

A **hypothesis test** is a procedure for deciding, from a sample, whether the data are compatible with a claim about the population. Example: a company says that a service call lasts 10 minutes on average; in a sample of 36 calls, the mean was 11.2 minutes. Could the 1.2-minute difference be just sampling chance, or is it a sign that the true mean is not 10? The test answers this question with an explicit rule and a known error rate.

The logic is similar to a proof by contradiction, but probabilistic: we provisionally assume that the claim (the **null hypothesis**) is true and work out how surprising the data would be in that case. If they are too surprising, the null hypothesis is rejected.

Two traditions coexist in today's practice: Ronald Fisher's, centered on the p-value as a measure of evidence, and Jerzy Neyman and Egon Pearson's, which added the alternative hypothesis and the two kinds of error. Lehmann (1993) discusses how they differ and how they fit together.

<div style="border-left: 4px solid #4CAF50; padding: 0.5em; background-color: #e8f5e9;">
  <strong>🎯 The ingredients of a test:</strong>
  <ul>
    <li>the <strong>null hypothesis</strong> $H_0$: the claim being tested, usually "no effect" or "no difference";</li>
    <li>the <strong>alternative hypothesis</strong> $H_1$: what we want to detect, which contradicts $H_0$;</li>
    <li>a <strong>test statistic</strong> $T$, computed from the data, whose distribution is known when $H_0$ is true;</li>
    <li>a <strong>critical region</strong>: the values of $T$ that lead us to reject $H_0$, chosen so that $P(T \text{ in the critical region} \mid H_0) = \alpha$ (or at most $\alpha$, for discrete distributions).</li>
  </ul>
  <strong>Decision rule:</strong> reject $H_0$ if and only if the observed value of $T$ falls in the critical region.
</div>

## 1. Basic Concepts

### 1.1 The Steps

1. **State the hypotheses** $H_0$ and $H_1$, **before** looking at the data.
2. **Choose the significance level** $\alpha$: the probability of rejecting $H_0$ when it is true (the Type I error). The most common values are 5% and 1%.
3. **Compute the test statistic** from the data.
4. **Compare it with the critical region**, or compute the **p-value**: the probability, assuming $H_0$ is true, of getting a result as extreme as the one observed, or more so.
5. **Decide and interpret**: reject $H_0$ if p-value $\leq \alpha$ (which is the same as the statistic falling in the critical region). **Not rejecting $H_0$ does not prove $H_0$**: it only means the data did not bring enough evidence against it.

### 1.2 Two-Sided or One-Sided

The choice depends on the alternative hypothesis, set **before** collecting the data. In the table, $\theta$ is the parameter being tested, $\theta_0$ the value under $H_0$, $t$ the observed statistic and $t_{\alpha}$ the value with area $\alpha$ to its right.

<div style="overflow-x:auto; margin: 1em 0;">
<table style="border-collapse: collapse; margin: 0 auto; min-width: 580px;">
  <thead style="background: #e3f2fd;">
    <tr>
      <th style="border: 1px solid #bbb; padding: 8px;">Type</th>
      <th style="border: 1px solid #bbb; padding: 8px;">Alternative hypothesis</th>
      <th style="border: 1px solid #bbb; padding: 8px;">Reject $H_0$ if</th>
      <th style="border: 1px solid #bbb; padding: 8px;">p-value</th>
      <th style="border: 1px solid #bbb; padding: 8px;">When to use</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border: 1px solid #bbb; padding: 8px;"><strong>Two-sided</strong></td>
      <td style="border: 1px solid #bbb; padding: 8px;">$H_1: \theta \neq \theta_0$</td>
      <td style="border: 1px solid #bbb; padding: 8px;">$|t| > t_{\alpha/2}$</td>
      <td style="border: 1px solid #bbb; padding: 8px;">$2P(T > |t|)$</td>
      <td style="border: 1px solid #bbb; padding: 8px;">Deviations in both directions matter</td>
    </tr>
    <tr>
      <td style="border: 1px solid #bbb; padding: 8px;"><strong>Right-tailed</strong></td>
      <td style="border: 1px solid #bbb; padding: 8px;">$H_1: \theta > \theta_0$</td>
      <td style="border: 1px solid #bbb; padding: 8px;">$t > t_{\alpha}$</td>
      <td style="border: 1px solid #bbb; padding: 8px;">$P(T > t)$</td>
      <td style="border: 1px solid #bbb; padding: 8px;">Only an upward deviation matters</td>
    </tr>
    <tr>
      <td style="border: 1px solid #bbb; padding: 8px;"><strong>Left-tailed</strong></td>
      <td style="border: 1px solid #bbb; padding: 8px;">$H_1: \theta < \theta_0$</td>
      <td style="border: 1px solid #bbb; padding: 8px;">$t < -t_{\alpha}$</td>
      <td style="border: 1px solid #bbb; padding: 8px;">$P(T < t)$</td>
      <td style="border: 1px solid #bbb; padding: 8px;">Only a downward deviation matters</td>
    </tr>
  </tbody>
</table>
</div>

(The "p-value" entry in the two-sided row holds for statistics with a symmetric distribution, such as Z and t.)

<div style="border-left: 4px solid #e53935; padding: 0.5em 1em; background-color: #ffebee; margin: 1em 0;">
<strong>Careful:</strong> a one-sided test is better at detecting a deviation in the chosen direction, but it does not detect deviations in the opposite one. Choosing the direction <em>after</em> seeing which way the data went effectively doubles the chance of a false positive. The direction has to come from the problem, before the data.
</div>

### 1.3 The Two Kinds of Error

Any decision can go wrong in two ways:

<div style="overflow-x:auto; margin: 1em 0;">
  <table style="min-width: 380px; border-collapse: collapse; margin: 0 auto;">
    <thead style="background: #e3f2fd;">
      <tr>
        <th style="border: 1px solid #bbb; padding: 8px;">Decision \ Reality</th>
        <th style="border: 1px solid #bbb; padding: 8px;">H<sub>0</sub> true</th>
        <th style="border: 1px solid #bbb; padding: 8px;">H<sub>0</sub> false</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="border: 1px solid #bbb; padding: 8px;">Reject H<sub>0</sub></td>
        <td style="border: 1px solid #bbb; padding: 8px;">🔴 Type I error (probability &alpha;)</td>
        <td style="border: 1px solid #bbb; padding: 8px;">✅ Correct decision (probability 1 − &beta;, the <strong>power</strong>)</td>
      </tr>
      <tr>
        <td style="border: 1px solid #bbb; padding: 8px;">Do not reject H<sub>0</sub></td>
        <td style="border: 1px solid #bbb; padding: 8px;">✅ Correct decision (probability 1 − &alpha;)</td>
        <td style="border: 1px solid #bbb; padding: 8px;">🔵 Type II error (probability &beta;)</td>
      </tr>
    </tbody>
  </table>
</div>

- **Type I error (false positive):** rejecting $H_0$ when it is true. Example: a new drug is no better than the old one, but the test concludes that it is. The probability of this error is the level $\alpha$, set by whoever runs the test.
- **Type II error (false negative):** not rejecting $H_0$ when it is false. Example: the new drug is better, but the test does not detect the difference. Its probability is $\beta$, and $1 - \beta$ is the **power of the test**: the chance of detecting an effect that exists.

$\beta$ is not set directly: it depends on how large the true effect is, on the sample size and on the variability of the data. With the same data, lowering $\alpha$ raises $\beta$; to lower both at once, you need a larger sample.

The figure shows a right-tailed Z test with $\alpha = 0.05$. Under $H_0$, the statistic has a $N(0, 1)$ distribution; we assume that, under $H_1$, it has a $N(1.5, 1)$ distribution. The code below computes the three numbers in the figure. (The figure was made by `scripts/figuras-testes-hipotese.jl`, with the same numbers.)

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Distributions

# One-sided (right-tailed) Z test: under H₀ the statistic is N(0, 1); under H₁, N(1.5, 1)
α = 0.05
H0 = Normal(0, 1)
H1 = Normal(1.5, 1)

z_crit = quantile(H0, 1 - α)   # reject H₀ if z &gt; z_crit
β = cdf(H1, z_crit)            # P(do not reject H₀ | H₁ true)
power = 1 - β

println("Critical value  = ", round(z_crit, digits=4))
println("Type II error β = ", round(β, digits=4))
println("Power 1 − β     = ", round(power, digits=4))</code></pre>
  </div>
</div>

#### Expected output:
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <div>Critical value &nbsp;= 1.6449</div>
  <div>Type II error β = 0.5576</div>
  <div>Power 1 − β &nbsp; &nbsp; = 0.4424</div>
</div>

![Two normal curves: H₀ centered at 0, in blue, and H₁ centered at 1.5, in red; a dashed line at 1.6449 separates the blue area on the right (Type I error, 0.05) from the red area on the left (Type II error, 0.5576)]({{ site.baseurl }}/assets/images/type_I_II_errors_en.png)
<div class="image-caption">Figure 1: The blue area, to the right of the critical value under H₀, is the probability of a Type I error (α = 0.05). The red area, to the left of the critical value under H₁, is the probability of a Type II error (β ≈ 0.5576).</div>

**Interpretation:**

- **Critical value 1.6449:** the value with 5% of the $H_0$ curve to its right. If the observed statistic goes past 1.6449, $H_0$ is rejected.
- **β ≈ 0.5576:** if $H_1$ is true, in about 56% of samples the statistic stays below 1.6449 and the effect goes unnoticed.
- **Power ≈ 0.4424:** the chance of detecting the effect is only 44%. A common target when planning studies is a power of at least 80%; this test falls well short of that.

To raise the power: increase the sample size (the usual route), reduce the variability of the measurements, or accept a larger $\alpha$ (which raises false positives). A larger true effect is also easier to detect, but that is not up to whoever runs the test.

<img src="{{ site.baseurl }}/assets/images/teste_erros.avif" alt="Four cartoon panels with a doctor and a patient, labeled in Portuguese: true positive (a pregnant woman told 'You are pregnant'), true negative (an elderly man told 'You are not pregnant'), false positive (an elderly man told 'You are pregnant') and false negative (a pregnant woman told 'You are not pregnant')" style="max-width: 600px; display: block; margin: 1em auto;">
<div class="image-caption">Figure 2: The four outcomes of a test, in a deliberately exaggerated example (labels in Portuguese). With H₀ = "the person is not pregnant", telling an elderly man "you are pregnant" is a Type I error (false positive), and telling a pregnant woman "you are not pregnant" is a Type II error (false negative).</div>

## 2. Significance Level and Test Statistic

### 2.1 Choosing the Significance Level

The **significance level** $\alpha$ is the probability of a Type I error that we are willing to accept:

$$\alpha = P(\text{reject } H_0 \mid H_0 \text{ true})$$

The value 0.05 is a **convention**, not a law. The choice should weigh the cost of each error in the problem: when a false positive is costly (approving a treatment that does not work), a smaller $\alpha$ is used, such as 0.01; in exploratory studies, where missing a real effect is the costlier mistake, 0.10 is sometimes used.

An extreme case is the "5 sigma" criterion of particle physics: the result must lie 5 standard deviations from what $H_0$ predicts, which corresponds to a probability of about $2.9 \times 10^{-7}$ (one chance in 3.5 million) in one tail of the normal.

### 2.2 The Most Common Test Statistics

The test statistic is a function of the data that, under $H_0$, has a known distribution. Each one holds under conditions that must be checked.

**1. Z test for the mean** (population variance $\sigma^2$ known):

$$Z = \frac{\bar{X} - \mu_0}{\sigma/\sqrt{n}}$$

If the population is normal, $Z$ has exactly a $N(0, 1)$ distribution when $H_0: \mu = \mu_0$ is true. If it is not normal, the distribution is only approximately $N(0, 1)$, by the [Central Limit Theorem]({{ '/en/probability/central-limit-theorem' | relative_url }}), and the approximation improves as $n$ grows. The "n ≥ 30" found in many textbooks is a rule of thumb, not a theorem: with very skewed data, it may not be enough.

**2. Student's t-test for the mean** ($\sigma$ unknown, estimated by the sample standard deviation $s$):

$$t = \frac{\bar{X} - \mu_0}{s/\sqrt{n}}$$

If the population is normal, $t$ has a Student's t distribution with $n - 1$ degrees of freedom under $H_0$. Its tails are heavier than the normal's because $s$ also varies from sample to sample (for normal data, $(n-1)s^2/\sigma^2$ has a chi-square distribution with $n - 1$ degrees of freedom). With large $n$, the t distribution looks very much like the standard normal.

**3. Chi-square test** for observed ($O_i$) and expected ($E_i$) frequencies in $k$ categories:

$$\chi^2 = \sum_{i=1}^{k} \frac{(O_i - E_i)^2}{E_i}$$

Under $H_0$, and with a large sample, $\chi^2$ has **approximately** a chi-square distribution. The degrees of freedom are $k - 1$ in a goodness-of-fit test with fully specified proportions, and $(r-1)(c-1)$ in a test of independence for a table with $r$ rows and $c$ columns. The usual rule of thumb for the approximation to hold is that all expected frequencies be at least 5.

**4. F test** for comparing two variances:

$$F = \frac{s_1^2}{s_2^2}$$

If the two populations are normal and independent, under $H_0: \sigma_1^2 = \sigma_2^2$ the ratio has an F distribution with $n_1 - 1$ and $n_2 - 1$ degrees of freedom. This test is very sensitive to departures from normality. The same F distribution appears in [Analysis of Variance]({{ '/pt/inferencia-estatistica/analise-variancia' | relative_url }}) (in Portuguese).

The code below applies a t-test to 100 simulated values from a normal with mean 0.5, testing $H_0: \mu = 0$ against $H_1: \mu \neq 0$:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>using HypothesisTests, Random, Statistics

Random.seed!(123)
data = randn(100) .+ 0.5      # 100 simulated values from a normal with mean 0.5

# H₀: μ = 0  versus  H₁: μ ≠ 0
test = OneSampleTTest(data, 0)

println("Sample mean = ", round(mean(data), digits=4))
println("t statistic = ", round(test.t, digits=4))
println("p-value     = ", round(pvalue(test), sigdigits=3))</code></pre>
  </div>
</div>

#### Expected output:
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <div>Sample mean = 0.4517</div>
  <div>t statistic = 4.8554</div>
  <div>p-value &nbsp; &nbsp; = 4.49e-6</div>
</div>

Since the data were generated with mean 0.5, $H_0$ is false, and the test rejects it comfortably: the p-value is very small.

## 3. The p-value

### 3.1 Definition and Interpretation

![Standard normal curve with both tails beyond −2.1 and 2.1 shaded orange, each marked p/2; title "Two-sided p-value: P(|Z| ≥ 2.1) = 0.036"]({{ site.baseurl }}/assets/images/p_value_en.png){:style="max-width: 500px; display: block; margin: 0 auto;"}
<div class="image-caption">Figure 3: In a two-sided test with observed z = 2.1, the p-value is the area of both tails beyond ±2.1 (about 0.036).</div>

The **p-value** is the probability, computed assuming $H_0$ is true, of getting a test statistic as extreme as the one observed, or more so:

$$\text{p-value} = P(T \geq t_{\text{obs}} \mid H_0) \quad \text{(right-tailed)}$$

$$\text{p-value} = 2 \cdot P(T \geq |t_{\text{obs}}| \mid H_0) \quad \text{(two-sided, symmetric distribution)}$$

**Decision rule:** if p-value $\leq \alpha$, reject $H_0$; if p-value $> \alpha$, do not reject it.

<div style="border-left: 4px solid #e53935; padding: 0.5em 1em; background-color: #ffebee; margin: 1em 0;">
<strong>What the p-value is not.</strong> The American Statistical Association's statement on p-values (Wasserstein and Lazar, 2016) lists six principles; several of them clear up the most common mistakes:
<ol>
  <li><strong>It is not the probability that H₀ is true.</strong> The p-value is computed <em>assuming</em> H₀ is true; it measures how incompatible the data are with H₀, not the chance that H₀ is right.</li>
  <li><strong>It does not measure the size or the importance of an effect.</strong> With very large samples, differences too small to matter give tiny p-values. Always report the estimated effect, with its confidence interval.</li>
  <li><strong>A decision should not hinge only on whether the p-value crosses a threshold.</strong> p = 0.049 and p = 0.051 carry practically the same evidence.</li>
  <li><strong>On its own, it is not a good measure of evidence</strong> about a model or hypothesis; it depends on the study design, the quality of the measurements and whatever else is known.</li>
</ol>
And, as already said: <strong>not rejecting H₀ is not the same as accepting H₀</strong>. Absence of evidence is not evidence of absence.
</div>

### 3.2 Statistical Power

The **power** is the probability of rejecting $H_0$ when it is false: $1 - \beta$. It depends on the true effect, so it can only be computed by assuming a value for it.

**Example.** A two-sided Z test for the mean, with $\alpha = 0.05$, $n = 30$, $\sigma = 1$, $H_0: \mu = 0$. What is the power if the true mean is $\mu_1 = 0.5$?

**Step 1, the effect in standard errors.** The standard error of the mean is $\sigma/\sqrt{n} = 1/\sqrt{30} \approx 0.1826$, and the true mean lies

$$\delta = \frac{\mu_1 - \mu_0}{\sigma/\sqrt{n}} = \frac{0.5}{0.1826} \approx 2.7386$$

standard errors from $\mu_0$. Under $H_1$, the statistic $Z$ has a $N(\delta, 1)$ distribution.

**Step 2, β.** The test does not reject when $-1.96 < Z < 1.96$ (the two-sided 5% critical value, 1.9600 to four places). So:

$$\beta = \Phi(1.96 - \delta) - \Phi(-1.96 - \delta) = \Phi(-0.7786) - \Phi(-4.6986) \approx 0.2181 - 0.0000 = 0.2181$$

where $\Phi$ is the cumulative distribution function of the standard normal.

**Result:** power $= 1 - 0.2181 = 0.7819$, about 78%.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Distributions

# Power of a two-sided Z test for the mean
n = 30          # sample size
α = 0.05        # significance level
μ₀ = 0          # mean under H₀
μ₁ = 0.5        # assumed true mean (under H₁)
σ = 1           # standard deviation (known)

z_crit = quantile(Normal(), 1 - α/2)
δ = (μ₁ - μ₀) / (σ / √n)      # how many standard errors separate μ₁ from μ₀

# Under H₁, Z ~ N(δ, 1); β = P(−z_crit &lt; Z &lt; z_crit)
β = cdf(Normal(), z_crit - δ) - cdf(Normal(), -z_crit - δ)

println("δ     = ", round(δ, digits=4))
println("β     = ", round(β, digits=4))
println("Power = ", round(1 - β, digits=4))</code></pre>
  </div>
</div>

#### Expected output:
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <div>δ &nbsp; &nbsp; = 2.7386</div>
  <div>β &nbsp; &nbsp; = 0.2181</div>
  <div>Power = 0.7819</div>
</div>

**Interpretation:** if the true mean is 0.5, a study with 30 observations detects the difference about 78% of the time. Reaching 80% would take a slightly larger $n$.

## 4. Solved Exercises

### 4.1 t-Test for the Mean

![t curve with 35 degrees of freedom, rejection regions shaded beyond ±2.0301 and a blue line at t = 3.00, inside the right rejection region]({{ site.baseurl }}/assets/images/t_test_mean_en.png){:style="max-width: 500px; display: block; margin: 0 auto;"}
<div class="image-caption">Figure 4: The t distribution with 35 degrees of freedom under H₀. The observed t, 3.00, falls in the right rejection region.</div>

> **Problem** (illustrative numbers): a company claims that the mean service time is 10 minutes. In a random sample of 36 calls, the mean was 11.2 minutes, with a standard deviation of 2.4 minutes. At the 5% level, do the data contradict the claim?

**Data:**

- $H_0: \mu = 10$ minutes and $H_1: \mu \neq 10$ minutes (two-sided: deviations in both directions matter);
- $\bar{x} = 11.2$ minutes, $s = 2.4$ minutes, $n = 36$, $\alpha = 0.05$.

**Conditions.** The population standard deviation is not known, so the test is the t-test. It assumes independent calls and an approximately normal population; with $n = 36$ and no strong skewness, the CLT makes the test reasonable even without exact normality.

**Step 1, standard error:**

$$\text{SE} = \frac{s}{\sqrt{n}} = \frac{2.4}{\sqrt{36}} = \frac{2.4}{6} = 0.4 \text{ minute}$$

**Step 2, test statistic:**

$$t_{\text{obs}} = \frac{\bar{x} - \mu_0}{\text{SE}} = \frac{11.2 - 10}{0.4} = \frac{1.2}{0.4} = 3.00$$

The sample mean is 3 standard errors above 10.

**Step 3, critical value.** With $n - 1 = 35$ degrees of freedom and $\alpha/2 = 0.025$ in each tail (Julia's `quantile(TDist(35), 0.975)`, or a t table): $t_{0.025;\,35} = 2.0301$.

**Step 4, p-value.** $P(t_{35} > 3.00) = 0.002474$, and for a two-sided test we multiply by 2:

$$\text{p-value} = 2 \times 0.002474 = 0.004949 \approx 0.0049$$

**Step 5, decision.** $\lvert t_{\text{obs}}\rvert = 3.00 > 2.0301$, or, equivalently, p-value $= 0.0049 < 0.05$: **reject $H_0$**.

**Interpretation:** if the true mean were 10 minutes, a sample mean as far from 10 as 11.2 (above or below) would happen in only about 0.5% of samples of 36 calls. The data are evidence that the mean time is not 10 minutes; the estimate, 11.2 minutes, suggests that service is slower than advertised. The test does not say whether 1.2 extra minutes matters to the company: that is a practical question, not a statistical one.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Distributions

x̄ = 11.2      # sample mean (minutes)
μ₀ = 10.0     # mean under H₀
s = 2.4       # sample standard deviation
n = 36
α = 0.05

se = s / √n                          # standard error
t_obs = (x̄ - μ₀) / se
t_crit = quantile(TDist(n - 1), 1 - α/2)
p_value = 2 * ccdf(TDist(n - 1), abs(t_obs))

println("Standard error = ", round(se, digits=4))
println("Observed t     = ", round(t_obs, digits=4))
println("Critical value = ±", round(t_crit, digits=4))
println("p-value        = ", round(p_value, digits=4))</code></pre>
  </div>
</div>

#### Expected output:
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <div>Standard error = 0.4</div>
  <div>Observed t &nbsp; &nbsp; = 3.0</div>
  <div>Critical value = ±2.0301</div>
  <div>p-value &nbsp; &nbsp; &nbsp; &nbsp;= 0.0049</div>
</div>

### 4.2 Chi-Square Test of Independence

> **Problem** (illustrative numbers): in a survey of 110 people, each was asked their favorite physical activity. The table cross-tabulates the answer with the person's group (group 1 or group 2). At the 5% level, is the preference independent of the group?

<div style="overflow-x:auto; margin: 0.5em 0;">
<table style="border-collapse: collapse; margin: 0 auto; text-align: center;">
  <thead style="background: #e8f5e9;">
    <tr><th style="border:1px solid #bbb;padding:6px;"></th><th style="border:1px solid #bbb;padding:6px;">Weights</th><th style="border:1px solid #bbb;padding:6px;">Running</th><th style="border:1px solid #bbb;padding:6px;">Yoga</th><th style="border:1px solid #bbb;padding:6px;">Total</th></tr>
  </thead>
  <tbody>
    <tr><td style="border:1px solid #bbb;padding:6px;"><strong>Group 1</strong></td><td style="border:1px solid #bbb;padding:6px;">30</td><td style="border:1px solid #bbb;padding:6px;">15</td><td style="border:1px solid #bbb;padding:6px;">5</td><td style="border:1px solid #bbb;padding:6px;">50</td></tr>
    <tr><td style="border:1px solid #bbb;padding:6px;"><strong>Group 2</strong></td><td style="border:1px solid #bbb;padding:6px;">20</td><td style="border:1px solid #bbb;padding:6px;">25</td><td style="border:1px solid #bbb;padding:6px;">15</td><td style="border:1px solid #bbb;padding:6px;">60</td></tr>
    <tr><td style="border:1px solid #bbb;padding:6px;"><strong>Total</strong></td><td style="border:1px solid #bbb;padding:6px;">50</td><td style="border:1px solid #bbb;padding:6px;">40</td><td style="border:1px solid #bbb;padding:6px;">20</td><td style="border:1px solid #bbb;padding:6px;">110</td></tr>
  </tbody>
</table>
</div>

**Hypotheses:** $H_0$: preference and group are independent; $H_1$: they are associated.

**Step 1, expected frequencies.** If they were independent, each cell would have $E = \frac{\text{row total} \times \text{column total}}{\text{grand total}}$:

<div style="overflow-x:auto; margin: 0.5em 0;">
<table style="border-collapse: collapse; margin: 0 auto; text-align: center;">
  <thead style="background: #e8f5e9;">
    <tr><th style="border:1px solid #bbb;padding:6px;">Expected</th><th style="border:1px solid #bbb;padding:6px;">Weights</th><th style="border:1px solid #bbb;padding:6px;">Running</th><th style="border:1px solid #bbb;padding:6px;">Yoga</th></tr>
  </thead>
  <tbody>
    <tr><td style="border:1px solid #bbb;padding:6px;"><strong>Group 1</strong></td><td style="border:1px solid #bbb;padding:6px;">$\frac{50 \cdot 50}{110} \approx 22.73$</td><td style="border:1px solid #bbb;padding:6px;">$\frac{50 \cdot 40}{110} \approx 18.18$</td><td style="border:1px solid #bbb;padding:6px;">$\frac{50 \cdot 20}{110} \approx 9.09$</td></tr>
    <tr><td style="border:1px solid #bbb;padding:6px;"><strong>Group 2</strong></td><td style="border:1px solid #bbb;padding:6px;">$\frac{60 \cdot 50}{110} \approx 27.27$</td><td style="border:1px solid #bbb;padding:6px;">$\frac{60 \cdot 40}{110} \approx 21.82$</td><td style="border:1px solid #bbb;padding:6px;">$\frac{60 \cdot 20}{110} \approx 10.91$</td></tr>
  </tbody>
</table>
</div>

All expected counts are above 5, so the chi-square approximation is reasonable.

**Step 2, the terms** $\frac{(O - E)^2}{E}$, with unrounded expected counts:

| Cell | $O$ | $E$ | $\frac{(O-E)^2}{E}$ |
|---|---|---|---|
| Group 1, weights | 30 | 22.7273 | 2.3273 |
| Group 1, running | 15 | 18.1818 | 0.5568 |
| Group 1, yoga | 5 | 9.0909 | 1.8409 |
| Group 2, weights | 20 | 27.2727 | 1.9394 |
| Group 2, running | 25 | 21.8182 | 0.4640 |
| Group 2, yoga | 15 | 10.9091 | 1.5341 |
| **Sum** | | | **8.6625** |

(In exact fractions, $\chi^2 = \frac{693}{80} = 8.6625$. Rounding the expected counts to two places before computing gives 8.6566, slightly different; that is why the calculation uses the full values.)

**Step 3, degrees of freedom:** $(r - 1)(c - 1) = (2 - 1)(3 - 1) = 2$.

**Step 4, critical value and p-value.** From the chi-square table with 2 degrees of freedom, $\chi^2_{0.05;\,2} = 5.9915$; the p-value is $P(\chi^2_2 > 8.6625) \approx 0.0132$.

**Step 5, decision:** $8.6625 > 5.9915$ (p-value $0.0132 < 0.05$): **reject $H_0$**.

**Interpretation:** in these data, preference does not look independent of group: group 1 prefers weights more than independence would predict (30 against 22.7), and group 2 prefers running and yoga. The test says there is an association, not what causes it, nor that everyone in a group prefers the same thing.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Distributions, HypothesisTests

O = [30 15 5;     # row 1
     20 25 15]    # row 2

n = sum(O)
E = sum(O, dims=2) * sum(O, dims=1) / n     # expected: row total × column total / n
χ² = sum((O .- E).^2 ./ E)
df = (size(O, 1) - 1) * (size(O, 2) - 1)

println("Expected  = ", round.(E, digits=2))
println("χ²        = ", round(χ², digits=4))
println("Critical  = ", round(quantile(Chisq(df), 0.95), digits=4))
println("p-value   = ", round(ccdf(Chisq(df), χ²), digits=4))
println("Check (ChisqTest): p = ", round(pvalue(ChisqTest(O)), digits=4))</code></pre>
  </div>
</div>

#### Expected output:
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <div>Expected &nbsp;= [22.73 18.18 9.09; 27.27 21.82 10.91]</div>
  <div>χ² &nbsp; &nbsp; &nbsp; &nbsp;= 8.6625</div>
  <div>Critical &nbsp;= 5.9915</div>
  <div>p-value &nbsp; = 0.0132</div>
  <div>Check (ChisqTest): p = 0.0132</div>
</div>

### 4.3 Test for a Proportion

> **Problem** (illustrative numbers): a company claims that its emails have a 15% conversion rate. In a sample of 200 emails, 40 led to a conversion. At the 5% level, do the data contradict the claim?

**Data:** $H_0: p = 0.15$, $H_1: p \neq 0.15$; $n = 200$, $x = 40$, so $\hat{p} = \frac{40}{200} = 0.20$.

**Conditions.** The Z test for a proportion uses the normal approximation to the binomial. The rule of thumb is $n p_0 \geq 5$ and $n(1 - p_0) \geq 5$: here, $200 \cdot 0.15 = 30$ and $200 \cdot 0.85 = 170$. No continuity correction.

**Step 1, standard error under $H_0$:**

$$\text{SE} = \sqrt{\frac{p_0(1-p_0)}{n}} = \sqrt{\frac{0.15 \cdot 0.85}{200}} = \sqrt{\frac{0.1275}{200}} = \sqrt{0.0006375} \approx 0.02525$$

**Step 2, statistic:**

$$Z = \frac{\hat{p} - p_0}{\text{SE}} = \frac{0.20 - 0.15}{0.02525} = \frac{0.05}{0.02525} \approx 1.9803$$

**Step 3, p-value:** $2 \cdot P(Z > 1.9803) \approx 2 \times 0.02384 = 0.0477$.

**Step 4, decision:** $0.0477 < 0.05$, and $\lvert Z\rvert = 1.9803 > 1.96$: **reject $H_0$**, but only just.

**Interpretation:** the observed rate, 20%, is (weak) evidence that the conversion rate is not 15%. The p-value is very close to 0.05: with one conversion fewer (39 out of 200), the conclusion would already change. A result like this calls for caution, and ideally more data, before any decision.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Distributions

n = 200; x = 40; p₀ = 0.15
p̂ = x / n
se = sqrt(p₀ * (1 - p₀) / n)      # standard error under H₀
z = (p̂ - p₀) / se
p_value = 2 * ccdf(Normal(), abs(z))

println("n·p₀ = ", n * p₀, "   n·(1 − p₀) = ", n * (1 - p₀))
println("p̂ = ", p̂, "   standard error = ", round(se, digits=5))
println("z = ", round(z, digits=4), "   p-value = ", round(p_value, digits=4))</code></pre>
  </div>
</div>

#### Expected output:
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <div>n·p₀ = 30.0 &nbsp; n·(1 − p₀) = 170.0</div>
  <div>p̂ = 0.2 &nbsp; standard error = 0.02525</div>
  <div>z = 1.9803 &nbsp; p-value = 0.0477</div>
</div>

### 4.4 Test for a Correlation

> **Problem** (illustrative numbers): for 10 students, the hours of study and the exam grade were recorded. Is there a linear correlation between the two, at the 5% level?

| Hours | 2 | 3 | 4 | 3 | 5 | 6 | 4 | 5 | 6 | 7 |
|---|---|---|---|---|---|---|---|---|---|---|
| **Grade** | 65 | 70 | 75 | 68 | 80 | 85 | 72 | 78 | 88 | 90 |

**Hypotheses:** $H_0: \rho = 0$ (no linear correlation in the population) and $H_1: \rho \neq 0$. The test assumes independent pairs and, for the result to be exact, bivariate normality.

**Step 1, sample correlation:** $r \approx 0.9837$ (computed by the code; the hand calculation is explained in [Pearson Correlation]({{ '/en/formulas/pearson-correlation.html' | relative_url }})).

**Step 2, statistic:**

$$t = r\sqrt{\frac{n - 2}{1 - r^2}} = 0.9837 \cdot \sqrt{\frac{8}{1 - 0.9677}} \approx 15.48$$

with $n - 2 = 8$ degrees of freedom.

**Step 3, decision:** the critical value is $t_{0.025;\,8} = 2.3060$; since $15.48 > 2.3060$ (p-value $\approx 3 \times 10^{-7}$), **reject $H_0$**.

**Interpretation:** in these data there is a strong positive linear association between hours of study and grade. This does not show that studying more **causes** higher grades (other variables may affect both), and 10 students in an example do not allow generalization.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Distributions, Statistics

hours = [2, 3, 4, 3, 5, 6, 4, 5, 6, 7]
grades = [65, 70, 75, 68, 80, 85, 72, 78, 88, 90]

n = length(hours)
r = cor(hours, grades)
t = r * sqrt((n - 2) / (1 - r^2))
p_value = 2 * ccdf(TDist(n - 2), abs(t))

println("r = ", round(r, digits=4))
println("t = ", round(t, digits=4), "   (", n - 2, " degrees of freedom)")
println("p-value = ", round(p_value, sigdigits=3))</code></pre>
  </div>
</div>

#### Expected output:
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <div>r = 0.9837</div>
  <div>t = 15.4761 &nbsp; (8 degrees of freedom)</div>
  <div>p-value = 3.02e-7</div>
</div>

## 5. The Link with Confidence Intervals

In a two-sided test for the mean, rejecting $H_0: \mu = \mu_0$ at level $\alpha$ is the same as $\mu_0$ falling **outside** the confidence interval at level $1 - \alpha$:

$$\text{CI}_{1-\alpha} = \bar{x} \pm t_{\alpha/2;\,n-1} \cdot \frac{s}{\sqrt{n}}$$

That is because $\lvert t_{\text{obs}} \rvert \leq t_{\alpha/2;\,n-1}$ is equivalent to $\bar{x} - t_{\alpha/2;\,n-1}\frac{s}{\sqrt{n}} \leq \mu_0 \leq \bar{x} + t_{\alpha/2;\,n-1}\frac{s}{\sqrt{n}}$.

In exercise 4.1: $11.2 \pm 2.0301 \times 0.4 = 11.2 \pm 0.8120$, that is, $[10.388, 12.012]$ minutes. The value 10 lies outside the interval, and the test rejected $H_0: \mu = 10$, as expected. The interval says more than the test: it shows the range of means compatible with the data.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Distributions

# 95% interval for the mean, with the data from exercise 4.1
x̄, s, n = 11.2, 2.4, 36
t_crit = quantile(TDist(n - 1), 0.975)
margin = t_crit * s / √n

println("95% CI = [", round(x̄ - margin, digits=4), ", ", round(x̄ + margin, digits=4), "]")
println("Is 10 in the interval? ", x̄ - margin &lt;= 10 &lt;= x̄ + margin)</code></pre>
  </div>
</div>

#### Expected output:
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <div>95% CI = [10.388, 12.012]</div>
  <div>Is 10 in the interval? false</div>
</div>

More on intervals in [Confidence Intervals]({{ '/pt/inferencia-estatistica/intervalos-confianca' | relative_url }}) (in Portuguese).

## 6. Many Tests at Once

If each test has probability $\alpha$ of giving a false positive, running many tests raises the chance of at least one. With $m$ **independent** tests, all with $H_0$ true:

$$P(\text{at least 1 false positive}) = 1 - (1 - \alpha)^m$$

With $m = 20$ and $\alpha = 0.05$: $1 - 0.95^{20} \approx 1 - 0.3585 = 0.6415$. In 20 tests with no real effect at all, the chance of at least one "finding" is about 64%.

Two common corrections:

- **Bonferroni:** use $\alpha/m$ in each test (with $m = 20$, $0.05/20 = 0.0025$). By the union bound, the probability of at least one false positive is then at most $\alpha$, even without independence. It is simple, but it loses a lot of power when $m$ is large.
- **Benjamini–Hochberg (1995):** controls the **false discovery rate** (the expected proportion of false positives among the rejections), instead of the chance of any false positive at all. Sort the p-values, $p_{(1)} \leq \cdots \leq p_{(m)}$, find the largest $k$ with $p_{(k)} \leq \frac{k}{m}\,\alpha$, and reject the hypotheses with the $k$ smallest p-values. The guarantee in the original paper holds for independent tests.

**Example** with 10 illustrative p-values (0.001, 0.008, 0.012, 0.024, 0.039, 0.041, 0.21, 0.35, 0.62, 0.90) and $\alpha = 0.05$: Bonferroni requires $p \leq 0.005$ and rejects only 1 hypothesis. In BH, the thresholds are $\frac{k}{10} \cdot 0.05$ = 0.005, 0.010, 0.015, 0.020, …; the first three p-values are below their thresholds (0.001 ≤ 0.005; 0.008 ≤ 0.010; 0.012 ≤ 0.015) and the fourth is not (0.024 > 0.020), nor is any after it; so $k^* = 3$, and BH rejects 3.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code># Benjamini–Hochberg by hand, with 10 illustrative p-values
p = [0.001, 0.008, 0.012, 0.024, 0.039, 0.041, 0.21, 0.35, 0.62, 0.90]
m, α = length(p), 0.05

order = sortperm(p)
limits = (1:m) ./ m .* α                  # k/m · α
below = p[order] .&lt;= limits
k = findlast(below)                        # largest k with p₍ₖ₎ ≤ k/m · α
k = k === nothing ? 0 : k

println("P(at least 1 false positive in 20 tests) = ", round(1 - 0.95^20, digits=4))
println("Bonferroni: α/m = ", α / m, " → hypotheses rejected: ", count(p .&lt;= α / m))
println("BH: k* = ", k, " → hypotheses rejected: ", k)</code></pre>
  </div>
</div>

#### Expected output:
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <div>P(at least 1 false positive in 20 tests) = 0.6415</div>
  <div>Bonferroni: α/m = 0.005 → hypotheses rejected: 1</div>
  <div>BH: k* = 3 → hypotheses rejected: 3</div>
</div>

## 7. How to Choose the Test

The [interactive decision tree]({{ site.baseurl }}/en/statistical-tests/decision-tree/) leads, in a few questions (the goal, the type of data and the design), to one of the tests in the [catalog]({{ site.baseurl }}/en/statistical-tests/). The table sums up the most common cases:

<div style="overflow-x:auto; margin: 1em 0;">
<table style="border-collapse: collapse; margin: 0 auto; min-width: 580px;">
<thead style="background: #e3f2fd;">
<tr><th style="border:1px solid #bbb;padding:8px;">Goal</th><th style="border:1px solid #bbb;padding:8px;">Parametric (assumes normality)</th><th style="border:1px solid #bbb;padding:8px;">Nonparametric</th></tr>
</thead>
<tbody>
<tr><td style="border:1px solid #bbb;padding:8px;">Mean of one group against a value</td><td style="border:1px solid #bbb;padding:8px;">One-sample t-test</td><td style="border:1px solid #bbb;padding:8px;">Wilcoxon signed-rank</td></tr>
<tr><td style="border:1px solid #bbb;padding:8px;">Two independent groups</td><td style="border:1px solid #bbb;padding:8px;">Welch's t-test (or t-test with equal variances)</td><td style="border:1px solid #bbb;padding:8px;">Mann-Whitney</td></tr>
<tr><td style="border:1px solid #bbb;padding:8px;">Two paired groups (before and after)</td><td style="border:1px solid #bbb;padding:8px;">Paired t-test</td><td style="border:1px solid #bbb;padding:8px;">Wilcoxon signed-rank</td></tr>
<tr><td style="border:1px solid #bbb;padding:8px;">Three or more independent groups</td><td style="border:1px solid #bbb;padding:8px;">ANOVA</td><td style="border:1px solid #bbb;padding:8px;">Kruskal-Wallis</td></tr>
<tr><td style="border:1px solid #bbb;padding:8px;">Three or more measurements on the same group</td><td style="border:1px solid #bbb;padding:8px;">Repeated-measures ANOVA</td><td style="border:1px solid #bbb;padding:8px;">Friedman</td></tr>
<tr><td style="border:1px solid #bbb;padding:8px;">Association between two categorical variables</td><td colspan="2" style="border:1px solid #bbb;padding:8px;">Chi-square test of independence; Fisher's exact test when some expected counts are small</td></tr>
<tr><td style="border:1px solid #bbb;padding:8px;">Relationship between two numerical variables</td><td style="border:1px solid #bbb;padding:8px;">Pearson correlation (linear relationship)</td><td style="border:1px solid #bbb;padding:8px;">Spearman correlation (monotonic relationship)</td></tr>
<tr><td style="border:1px solid #bbb;padding:8px;">One proportion against a value</td><td style="border:1px solid #bbb;padding:8px;">Z test for a proportion (large n)</td><td style="border:1px solid #bbb;padding:8px;">Exact binomial test</td></tr>
</tbody>
</table>
</div>

**Parametric or nonparametric?** Parametric tests assume a shape for the distribution (usually normal); when it holds, they have more power. Nonparametric tests assume less about the shape, cope better with outliers and work for ordinal data, but they test slightly different hypotheses (Mann-Whitney, for example, does not compare means; it tests whether the values in one group tend to be larger than those in the other). With small samples and very skewed data, the nonparametric test is usually the safer choice.

The code compares the two in an example with skewed data (exponentials with means 1.0 and 1.5, 20 values in each group):

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Distributions, HypothesisTests, Random

Random.seed!(123)
group1 = rand(Exponential(1.0), 20)    # skewed data: means 1.0 and 1.5
group2 = rand(Exponential(1.5), 20)

t_test = UnequalVarianceTTest(group1, group2)    # Welch's t-test
mw_test = MannWhitneyUTest(group1, group2)

println("Welch:        p = ", round(pvalue(t_test), digits=4))
println("Mann-Whitney: p = ", round(pvalue(mw_test), digits=4))</code></pre>
  </div>
</div>

#### Expected output:
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <div>Welch: &nbsp; &nbsp; &nbsp; &nbsp;p = 0.0412</div>
  <div>Mann-Whitney: p = 0.1344</div>
</div>

In this sample, Welch's test rejects equality at the 5% level and Mann-Whitney does not. That does not mean one always has more power than the other: with another seed, the result could flip. The example shows that different tests, which test different hypotheses, can disagree near the threshold, and that the test must be chosen **before** seeing the result.

## 8. Common Mistakes and Good Practice

- **Setting the hypotheses, the test and α after seeing the data.** All of these come first; choosing them afterwards is a form of "p-hacking".
- **Reading "not rejected" as "$H_0$ proved".** Without enough power, not rejecting is the expected outcome even when there is an effect.
- **Confusing statistical significance with practical importance.** Report the effect size and the confidence interval, not just the p-value.
- **Running many tests without correction** (section 6).
- **Ignoring the test's conditions:** independent observations, normality when the test assumes it (checkable with a QQ plot or the Shapiro-Wilk test), similar variances when the test assumes equal variances.
- **Planning without computing power:** decide on the sample size beforehand, for the effect that matters.

## Interactive Quiz

<div style="border: 2px solid #4CAF50; border-radius: 8px; padding: 16px; background: #f9f9f9; margin-top: 32px; margin-bottom: 32px;">
  <strong>🎮 Test what you know about hypothesis tests (quiz in Portuguese):</strong>
  <br><br>
  <iframe src="{{ site.baseurl }}/quiz/" title="Statistical tests quiz (in Portuguese)" width="100%" height="700" style="border:none; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.1);"></iframe>
  <br>
  <span style="font-size: 0.95em; color: #555;">If the quiz does not load, <a href="{{ site.baseurl }}/quiz/" target="_blank">open it in a new tab</a>.</span>
</div>

## References

1. Benjamini, Y.; Hochberg, Y. (1995). Controlling the False Discovery Rate: A Practical and Powerful Approach to Multiple Testing. *Journal of the Royal Statistical Society: Series B (Methodological)*, 57(1), 289–300. DOI: [10.1111/j.2517-6161.1995.tb02031.x](https://doi.org/10.1111/j.2517-6161.1995.tb02031.x).
2. Bussab, W. O.; Morettin, P. A. (2023). *Estatística Básica*. 10th ed. Saraiva Uni. (in Portuguese)
3. Lehmann, E. L. (1993). The Fisher, Neyman-Pearson Theories of Testing Hypotheses: One Theory or Two? *Journal of the American Statistical Association*, 88(424), 1242–1249. DOI: [10.1080/01621459.1993.10476404](https://doi.org/10.1080/01621459.1993.10476404).
4. Lehmann, E. L.; Romano, J. P. (2005). *Testing Statistical Hypotheses*. 3rd ed. Springer.
5. Wasserman, L. (2004). *All of Statistics: A Concise Course in Statistical Inference*. Springer.
6. Wasserstein, R. L.; Lazar, N. A. (2016). The ASA's Statement on p-Values: Context, Process, and Purpose. *The American Statistician*, 70(2), 129–133. DOI: [10.1080/00031305.2016.1154108](https://doi.org/10.1080/00031305.2016.1154108).
