---
layout: page
title: Confidence Intervals
lang: en
ref: intervalos-confianca
parent: inferencia-estatistica
permalink: /en/statistical-inference/confidence-intervals
order: 2
mathjax: true
description: "Confidence intervals for a mean and a proportion: what 95% means, a step-by-step worked example, sample size and Julia code."
---

## Introduction

A sample gives a **point estimate** of a population parameter: the mean of 12 tested cans of paint, for example, estimates the mean for all paint of that kind. But another sample would give a different number. A **confidence interval** adds to the estimate a margin that accounts for this sample-to-sample variation, and it says how often the method gets it right.

![A can of paint on a wooden floor, in front of a sunlit wall]({{ site.baseurl }}/assets/images/concept.avif){:style="max-width: 400px; display: block; margin: 0 auto;"}
<div class="image-caption" style="text-align: center;">Figure 1: The worked example on this page estimates the mean time a paint holds up in the sun (illustration).</div>

<div style="border-left: 4px solid #4CAF50; padding: 0.5em; background-color: #e8f5e9;">
  <strong>🎯 The general form:</strong>
  $$\text{estimate} \pm \underbrace{\text{critical value} \times \text{standard error}}_{\text{margin of error}}$$
  The <strong>standard error</strong> measures how much the estimate varies from sample to sample; the <strong>critical value</strong> comes from the distribution of the estimate (normal or t) and from the chosen confidence level.
</div>

## 1. What "95% Confidence" Means

The confidence level is a property of the **method**, not of one particular interval. If the same procedure were repeated with many different samples, about 95% of the intervals computed would contain the true value of the parameter, and about 5% would not.

The figure shows this in a simulation: 50 samples of 12 values, drawn from a population whose true mean is $\mu = 125$ (known here only so that we can check). Each sample gives a 95% interval.

![50 vertical segments, one per sample, around a dashed line at 125; 44 blue segments cross the line and 6 red ones lie entirely above or below it]({{ site.baseurl }}/assets/images/ci_coverage_en.png)
<div class="image-caption">Figure 2: 50 intervals at 95% computed from 50 different samples. The blue ones contain the true mean, 125; the red ones do not. In this simulation, 44 out of 50 got it right.</div>

Over 50 intervals, the number of hits varies: here it was 44 (88%), a little below the 47 or 48 expected, by chance. With many repetitions, the proportion gets close to 95%; the code below repeats the procedure 10,000 times:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Statistics, Distributions, Random

# 10,000 samples of size 12 from a N(125, 3²) population, whose mean μ = 125
# is known here only so that we can check how many intervals get it right.
Random.seed!(123)
μ, σ, n, repetitions = 125, 3, 12, 10_000
t = quantile(TDist(n - 1), 0.975)

function contains_μ(sample)
    me = t * std(sample) / sqrt(n)
    return mean(sample) - me &lt;= μ &lt;= mean(sample) + me
end

hits = count(_ -&gt; contains_μ(rand(Normal(μ, σ), n)), 1:repetitions)
println("Share of intervals that contain μ: ", hits / repetitions)</code></pre>
  </div>
</div>

#### Expected output:
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <div>Share of intervals that contain μ: 0.9468</div>
</div>

What it does **not** mean:

- It is **not** "a 95% chance that $\mu$ is in this interval". Once computed, the interval is fixed, and so is $\mu$: either it contains $\mu$ or it does not. The 95% describes the method before the sample is drawn. (The question "what is the probability that $\mu$ is here?" is answered by a different kind of interval, the credible interval of Bayesian statistics.)
- It is **not** "95% of the data lie in the interval". The interval is for the **mean**, not for individual values; it gets narrower as the sample grows, while the data stay just as spread out (see figure 3).
- It does **not** cover errors that are not due to sampling: a sample that is not random, biased measurements or badly worded questions can leave the whole interval far from the true value.

## 2. Worked Example: How Long a Paint Lasts

> **Problem** (illustrative numbers): a factory tested 12 cans of a paint and measured, in hours, how long each one held up under strong sunlight before fading: 120, 130, 125, 128, 122, 127, 126, 124, 129, 123, 128, 125. Compute a 95% confidence interval for this paint's mean resistance time.

**Formula.** The population standard deviation is not known, so it is estimated by the sample standard deviation $s$, and the critical value comes from Student's t distribution:

$$\text{CI} = \bar{x} \pm t_{\alpha/2;\,n-1} \cdot \frac{s}{\sqrt{n}}$$

where $\bar{x}$ is the sample mean, $s$ the sample standard deviation, $n$ the sample size and $t_{\alpha/2;\,n-1}$ the value with area $\alpha/2$ to its right in the t distribution with $n - 1$ degrees of freedom (for 95%, $\alpha = 0.05$).

**Conditions.** The t interval assumes independent observations from an approximately normal population. The t distribution is used because $\sigma$ is unknown, not because of the sample size: with $\sigma$ unknown, t is the right choice even for large $n$ (the two just become very similar). With $n = 12$, normality matters; these data have no strong skewness or outliers.

**Step 1, mean:**

$$\bar{x} = \frac{120 + 130 + 125 + 128 + 122 + 127 + 126 + 124 + 129 + 123 + 128 + 125}{12} = \frac{1507}{12} \approx 125.5833 \text{ hours}$$

**Step 2, standard deviation.** Each deviation $x_i - \bar{x}$ squared, using the full mean ($\frac{1507}{12}$):

| $x_i$ | $x_i - \bar{x}$ | $(x_i - \bar{x})^2$ |
|---|---|---|
| 120 | −5.5833 | 31.1736 |
| 130 | 4.4167 | 19.5069 |
| 125 | −0.5833 | 0.3403 |
| 128 | 2.4167 | 5.8403 |
| 122 | −3.5833 | 12.8403 |
| 127 | 1.4167 | 2.0069 |
| 126 | 0.4167 | 0.1736 |
| 124 | −1.5833 | 2.5069 |
| 129 | 3.4167 | 11.6736 |
| 123 | −2.5833 | 6.6736 |
| 128 | 2.4167 | 5.8403 |
| 125 | −0.5833 | 0.3403 |
| **Sum** | **0** | **98.9167** |

(As an exact fraction, the sum is $\frac{1187}{12}$.)

$$s^2 = \frac{98.9167}{12 - 1} = \frac{98.9167}{11} \approx 8.9924 \qquad s = \sqrt{8.9924} \approx 2.9987 \text{ hours}$$

**Step 3, critical value.** With $n - 1 = 11$ degrees of freedom and 2.5% in each tail (t table, or `quantile(TDist(11), 0.975)` in Julia): $t_{0.025;\,11} = 2.2010$.

**Step 4, standard error:**

$$\text{SE} = \frac{s}{\sqrt{n}} = \frac{2.9987}{\sqrt{12}} = \frac{2.9987}{3.4641} \approx 0.8657 \text{ hour}$$

**Step 5, margin of error:**

$$\text{ME} = 2.2010 \times 0.8657 \approx 1.9053 \text{ hours}$$

**Step 6, interval:**

$$\text{CI}_{95\%} = 125.5833 \pm 1.9053 = [123.68, 127.49] \text{ hours}$$

**Interpretation:** this paint's mean resistance time is estimated at 125.6 hours, with a margin of error of about 1.9 hours. The interval [123.68, 127.49] was produced by a method that, in 95% of samples, gives an interval containing the true mean. If the quality standard required a mean of at least 123 hours, the whole interval would be above it; if it required 125 hours, the interval would not allow us to say that the paint meets the standard.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Statistics, Distributions

data = [120, 130, 125, 128, 122, 127, 126, 124, 129, 123, 128, 125]   # hours
n = length(data)
x̄ = mean(data)
s = std(data)                          # sample standard deviation (divides by n − 1)
t = quantile(TDist(n - 1), 0.975)      # critical value for 95%
se = s / sqrt(n)                       # standard error of the mean
me = t * se                            # margin of error

println("x̄ = ", round(x̄, digits=4), "   s = ", round(s, digits=4))
println("t = ", round(t, digits=4), "   SE = ", round(se, digits=4), "   ME = ", round(me, digits=4))
println("95% CI = [", round(x̄ - me, digits=2), ", ", round(x̄ + me, digits=2), "]")</code></pre>
  </div>
</div>

#### Expected output:
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <div>x̄ = 125.5833 &nbsp; s = 2.9987</div>
  <div>t = 2.201 &nbsp; SE = 0.8657 &nbsp; ME = 1.9053</div>
  <div>95% CI = [123.68, 127.49]</div>
</div>

![The 12 times as black dots scattered between 120 and 130 hours, a blue line at the mean 125.58 and a light blue band from 123.68 to 127.49, the 95% interval for the mean]({{ site.baseurl }}/assets/images/ci_paint_en.png)
<div class="image-caption">Figure 3: The 12 measured times, the mean (line) and the 95% interval for the mean (band). Seven of the 12 individual times fall outside the band, and that is fine: the interval estimates where the mean is, not where individual cans fall. The figure was made by scripts/figuras-intervalos-confianca.jl.</div>

## 3. Other Intervals

### 3.1 Mean with $\sigma$ Known

When the population standard deviation is known (a rare situation, for example a measuring instrument with a well-established precision), the critical value comes from the standard normal:

$$\text{CI} = \bar{x} \pm z_{\alpha/2} \cdot \frac{\sigma}{\sqrt{n}}$$

For 95%, $z_{0.025} = 1.96$. The interval is exact if the population is normal, and approximate (by the [Central Limit Theorem]({{ '/en/probability/central-limit-theorem' | relative_url }})) if it is not.

**Example** (illustrative numbers): in a sample of $n = 100$ height measurements, $\bar{x} = 170$ cm, with $\sigma = 5$ cm known. Then $\text{ME} = 1.96 \cdot \frac{5}{\sqrt{100}} = 1.96 \cdot 0.5 = 0.98$ cm, and the 95% interval is $[169.02, 170.98]$ cm.

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

x̄ = 170      # sample mean (cm)
σ = 5        # population standard deviation, assumed known (cm)
n = 100
z = quantile(Normal(), 0.975)    # 1.96 for 95%

me = z * σ / sqrt(n)
println("z = ", round(z, digits=4), "   ME = ", round(me, digits=4))
println("95% CI = [", round(x̄ - me, digits=2), ", ", round(x̄ + me, digits=2), "]")</code></pre>
  </div>
</div>

#### Expected output:
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <div>z = 1.96 &nbsp; ME = 0.98</div>
  <div>95% CI = [169.02, 170.98]</div>
</div>

### 3.2 Proportion

For a proportion, the estimate is the sample proportion $\hat{p} = \frac{x}{n}$ (successes divided by the sample size), and the approximate interval is:

$$\text{CI} = \hat{p} \pm z_{\alpha/2} \sqrt{\frac{\hat{p}(1-\hat{p})}{n}}$$

It uses the normal approximation to the binomial, which is only good with a large sample and $\hat{p}$ away from 0 and 1; the rule of thumb is $n\hat{p} \geq 5$ and $n(1 - \hat{p}) \geq 5$ (some textbooks ask for 10). Outside that range, there are better intervals for a proportion.

**Example** (illustrative numbers): 45 out of 100 people interviewed approve of a proposal. Then $\hat{p} = 0.45$, $n\hat{p} = 45$ and $n(1 - \hat{p}) = 55$ (the condition holds), and:

$$\text{SE} = \sqrt{\frac{0.45 \cdot 0.55}{100}} = \sqrt{0.002475} \approx 0.0497 \qquad \text{ME} = 1.96 \cdot 0.0497 \approx 0.0975$$

$$\text{CI}_{95\%} = 0.45 \pm 0.0975 = [0.3525, 0.5475]$$

**Interpretation:** approval is estimated at 45%, with a margin of error of about 10 percentage points. The interval runs from 35% to 55%: with this sample, we cannot say whether a majority approves or disapproves.

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

successes, n = 45, 100
p̂ = successes / n
z = quantile(Normal(), 0.975)
se = sqrt(p̂ * (1 - p̂) / n)

println("n·p̂ = ", n * p̂, "   n·(1 − p̂) = ", round(n * (1 - p̂), digits=2))
println("SE = ", round(se, digits=4), "   ME = ", round(z * se, digits=4))
println("95% CI = [", round(p̂ - z * se, digits=4), ", ", round(p̂ + z * se, digits=4), "]")</code></pre>
  </div>
</div>

#### Expected output:
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <div>n·p̂ = 45.0 &nbsp; n·(1 − p̂) = 55.0</div>
  <div>SE = 0.0497 &nbsp; ME = 0.0975</div>
  <div>95% CI = [0.3525, 0.5475]</div>
</div>

## 4. Sample Size

For the margin of error to be at most $E$, we just solve the margin formula for $n$.

**Mean** ($\sigma$ known, or estimated from a previous study):

$$z_{\alpha/2}\frac{\sigma}{\sqrt{n}} \leq E \quad\Longleftrightarrow\quad n \geq \left(\frac{z_{\alpha/2}\,\sigma}{E}\right)^2$$

**Proportion**, with $p^{\ast}$ a prior estimate of the proportion:

$$n \geq \frac{z_{\alpha/2}^2\, p^{\ast}(1-p^{\ast})}{E^2}$$

With no prior estimate, use $p^{\ast} = 0.5$, which gives the largest possible value of $p^{\ast}(1 - p^{\ast})$ (0.25) and, therefore, an $n$ that works for any true proportion. The result is always rounded **up**.

**Examples:**

- A proportion with a margin of 5 percentage points and 95% confidence: $n \geq \frac{1.96^2 \cdot 0.25}{0.05^2} = \frac{3.8415 \cdot 0.25}{0.0025} \approx 384.15$, that is, **385** people.
- A mean with $\sigma = 5$ cm and a margin of 1 cm: $n \geq \left(\frac{1.96 \cdot 5}{1}\right)^2 = 9.8^2 \approx 96.04$, that is, **97** measurements.

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

z = quantile(Normal(), 0.975)

# Proportion: margin E = 0.05 (5 percentage points), no prior estimate of p (use 0.5)
E = 0.05
n_prop = z^2 * 0.5 * 0.5 / E^2
println("Proportion: n = ", round(n_prop, digits=2), " → ", ceil(Int, n_prop))

# Mean: σ = 5 cm, margin E = 1 cm
σ, E = 5, 1
n_mean = (z * σ / E)^2
println("Mean: n = ", round(n_mean, digits=2), " → ", ceil(Int, n_mean))</code></pre>
  </div>
</div>

#### Expected output:
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <div>Proportion: n = 384.15 → 385</div>
  <div>Mean: n = 96.04 → 97</div>
</div>

These formulas assume simple random sampling from a large population; planning more complex samples is covered in [Sampling]({{ '/pt/inferencia-estatistica/amostragem' | relative_url }}) (in Portuguese).

## 5. What Changes the Width of the Interval

The margin of error is $\text{critical value} \times \frac{s}{\sqrt{n}}$, so:

- **Higher confidence level → wider interval.** In the paint example: 90% gives $[124.03, 127.14]$ (margin 1.55); 95% gives $[123.68, 127.49]$ (margin 1.91); 99% gives $[122.89, 128.27]$ (margin 2.69). More confidence costs precision.
- **Larger sample → narrower interval**, but slowly: the margin shrinks with $\sqrt{n}$. To halve the margin, you need to **quadruple** the sample.
- **More variability in the data → wider interval.**

## 6. The Link with Hypothesis Tests

A $(1 - \alpha)$ confidence interval for the mean contains exactly the values $\mu_0$ that would **not** be rejected by a two-sided t-test at level $\alpha$. In the paint example, a test of $H_0: \mu = 125$ at the 5% level would not reject (125 is inside $[123.68, 127.49]$), and a test of $H_0: \mu = 128$ would. The interval tells you more than the test: it shows all the values compatible with the data at once. More in [Hypothesis Testing]({{ '/en/statistical-inference/hypothesis-testing' | relative_url }}).

## 7. A Little History

The confidence interval was proposed by Jerzy Neyman, first in an appendix to a paper on sampling presented to the Royal Statistical Society in 1934, and then developed in a 1937 paper on the theory of estimation. The interpretation through the frequency of hits over repetitions of the procedure, described in section 1, follows Neyman's formulation.

## 8. Cautions

- The interval only accounts for **sampling error**. Non-random samples, non-response and biased measurements do not enter the margin of error.
- The formulas assume **independent observations**. Clustered data (students in the same class, repeated measurements on the same person) call for other methods.
- With **small samples** and skewed data or outliers, the t interval can have a coverage quite different from 95%.
- With **proportions close to 0 or 1**, or small samples, the interval in section 3.2 performs poorly.
- Computing many intervals and highlighting only the "interesting" ones lowers the real coverage, for the same reason that [multiple tests]({{ '/en/statistical-inference/hypothesis-testing' | relative_url }}) increase false positives.

## References

1. Bussab, W. O.; Morettin, P. A. (2023). *Estatística Básica*. 10th ed. Saraiva Uni. (in Portuguese)
2. Neyman, J. (1934). On the Two Different Aspects of the Representative Method: The Method of Stratified Sampling and the Method of Purposive Selection. *Journal of the Royal Statistical Society*, 97(4), 558–625.
3. Neyman, J. (1937). Outline of a Theory of Statistical Estimation Based on the Classical Theory of Probability. *Philosophical Transactions of the Royal Society of London. Series A*, 236(767), 333–380. DOI: [10.1098/rsta.1937.0005](https://doi.org/10.1098/rsta.1937.0005).
4. Triola, M. F. (2024). *Introdução à Estatística*. 14th ed. LTC. (in Portuguese; translation of *Elementary Statistics*)
