---
layout: page
title: Central Limit Theorem
lang: en
ref: teorema-limite-central
parent: probabilidade
permalink: /en/probability/central-limit-theorem
order: 3
mathjax: true
description: "The Central Limit Theorem: statement, conditions, a worked example by hand, Julia simulations and how it underpins confidence intervals."
---

The **Central Limit Theorem (CLT)** is one of the most important results in probability theory. It says that the mean (or the sum) of many independent random variables with the same distribution has an approximately normal distribution, **whatever the shape of the original distribution**, as long as the variance is finite.

<div style="border-left: 4px solid #4CAF50; padding: 0.5em; background-color: #e8f5e9;">
  <strong>📊 Important:</strong> the CLT is fundamental to <strong>statistical inference</strong>.<br>
  It justifies using the normal distribution for the sample mean and is the basis of many confidence intervals and hypothesis tests.
</div>

The Julia code on this page fixes the seed (`Random.seed!(123)`).

## 1. Historical Context

### 1.1 Historical Development

- **Abraham de Moivre (1733)**: studying the limit of the binomial distribution, he arrived at the normal curve; this is the first version of the theorem.
- **Pierre-Simon Laplace**: proved de Moivre's result anew and extended it, which is why it is known as the De Moivre–Laplace theorem.
- **Aleksandr Lyapunov (1900, 1901)**: the first major generalization, proved with a new method, that of characteristic functions.
- **Jarl Waldemar Lindeberg (1922)** and **William Feller (1935)**: Lindeberg proved a sufficient condition for the theorem to hold; Feller showed that, under an additional condition, it is also necessary (the Lindeberg–Feller theorem).
- **Paul Lévy**: fundamental results on characteristic functions (1922) and, in 1935, a version of the theorem for sums of dependent variables.
- The name "central limit theorem" (*zentraler Grenzwertsatz*) appears in the title of a 1920 paper by **George Pólya**.

The dates and attributions above follow Ulyanov (2024) and, for the name, Pólya's paper itself (1920). For the full history, see Fischer (2011).

### 1.2 Historical Importance

The CLT revolutionized statistics by:
- Justifying the use of the normal distribution for means and sums
- Allowing complicated distributions to be approximated by a normal
- Underpinning methods of statistical inference

## 2. Formal Statement

Let $X_1, X_2, \ldots, X_n$ be **independent** and **identically distributed** random variables (all with the same distribution), with:
- mean $\mu$;
- variance $\sigma^2$ that is **finite and positive** ($0 < \sigma^2 < \infty$).

Then, as $n \to \infty$:

$$\frac{\sum_{i=1}^n X_i - n\mu}{\sigma\sqrt{n}} \xrightarrow{d} N(0,1)$$

Or, equivalently, for the sample mean $\bar{X} = \frac{1}{n}\sum_{i=1}^n X_i$:

$$\frac{\bar{X} - \mu}{\sigma/\sqrt{n}} \xrightarrow{d} N(0,1)$$

where $\xrightarrow{d}$ denotes **convergence in distribution**: for every number $z$, the probability $P\!\left(\frac{\bar{X} - \mu}{\sigma/\sqrt{n}} \leq z\right)$ gets close to $P(Z \leq z)$, with $Z \sim N(0, 1)$, as $n$ grows.

In practice, this means that, for large $n$,

$$\bar{X} \approx N\!\left(\mu,\ \frac{\sigma^2}{n}\right)$$

The mean of $\bar{X}$ is $\mu$ and its variance is $\sigma^2/n$ (this holds for any $n$, not only for large $n$); the standard deviation of $\bar{X}$, $\sigma/\sqrt{n}$, is called the **standard error**. What the CLT adds is that the **shape** of the distribution of $\bar{X}$ becomes close to the normal.

<div style="border-left: 4px solid #ff9800; padding: 0.5em; background-color: #fff3e0; margin: 1em 0;">
  <strong>⚠️ What the CLT does not say</strong><br>
  The CLT is about the <strong>mean</strong> (or the sum), not about the individual data: it does not say the data become normal as the sample grows. And it is a result about the limit $n \to \infty$: it does not say from which $n$ the approximation is already good. The well-known "$n \geq 30$" rule is a <strong>rule of thumb</strong>, not part of the theorem (see section 5).
</div>

## 3. Worked Example

<div style="border-left: 4px solid #2196F3; padding: 0.5em; background-color: #e3f2fd; margin: 1em 0;">
  <strong>💡 Example</strong><br>
  The length of each service at a counter follows an exponential distribution with a mean of 1 minute (illustrative numbers). On a given day, 36 services are carried out, independently of one another. What is the probability that the mean length of these 36 services exceeds 1.2 minutes?
</div>

**Data** (given): $\mu = 1$ min; in the exponential, the standard deviation equals the mean, so $\sigma = 1$ min; $n = 36$; we want $P(\bar{X} > 1.2)$.

**Conditions:** the services are independent and have the same distribution, with finite variance. The exponential is quite skewed, but with $n = 36$ the CLT should give a reasonable approximation (the code below checks this).

**Formula:** by the CLT, $\bar{X} \approx N(\mu, \sigma^2/n)$, and we standardize with

$$Z = \frac{\bar{X} - \mu}{\sigma/\sqrt{n}}$$

**Substitution and arithmetic**, one step per line:

$$\frac{\sigma}{\sqrt{n}} = \frac{1}{\sqrt{36}} = \frac{1}{6} \approx 0.1667 \text{ min}$$

$$z = \frac{1.2 - 1}{1/6} = 0.2 \cdot 6 = 1.2$$

$$P(Z \leq 1.2) = 0.8849 \quad \text{(Z table)}$$

$$P(\bar{X} > 1.2) \approx 1 - 0.8849 = 0.1151$$

**Result:** $P(\bar{X} > 1.2) \approx 0.1151$, that is, about 11.5%.

**Interpretation:** on about 1 day in 9, the mean service time would exceed 1.2 minutes. A single service exceeds 1.2 minutes much more often (with probability $e^{-1.2} \approx 0.3012$, that is, about 30% of the time, by the exponential CDF); the mean of 36 services varies much less, because the standard error (1/6 of a minute) is six times smaller than the standard deviation of a single service.

**How good is the approximation?** Here the exact value can be computed: the sum of 36 independent exponentials with mean 1 has a gamma distribution, and the code below gets $P(\bar{X} > 1.2) = 0.1184$. The CLT gives 0.1151: it is off in the third decimal place, because the exponential is skewed and $n = 36$ is still not "infinity". For decisions where that difference matters, use the exact distribution or a simulation.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Distributions, Statistics, Random

Random.seed!(123)

# Length of each service: exponential with mean 1 minute (so σ = 1)
μ, σ, n = 1.0, 1.0, 36
service = Exponential(μ)   # in Julia, Exponential(θ) takes the mean θ = 1/λ

# 1) CLT approximation: X̄ ≈ Normal(μ, σ/√n)
standard_error = σ / sqrt(n)
z = (1.2 - μ) / standard_error
println("Standard error = ", round(standard_error, digits = 4), "   z = ", round(z, digits = 4))
println("P(X̄ &gt; 1.2) from the CLT:    ", round(1 - cdf(Normal(), z), digits = 4))

# 2) Exact value: the sum of 36 exponentials with mean 1 is Gamma(36, 1),
#    so the mean X̄ = sum/36 is Gamma(36, 1/36)
println("P(X̄ &gt; 1.2) exact (gamma):   ", round(ccdf(Gamma(36, 1 / 36), 1.2), digits = 4))

# 3) Simulation: 100,000 groups of 36 services
means = [mean(rand(service, n)) for _ in 1:100_000]
println("P(X̄ &gt; 1.2) in simulation:   ", round(mean(means .&gt; 1.2), digits = 4))</code></pre>
  </div>
</div>

#### Expected output:
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <div>Standard error = 0.1667   z = 1.2</div>
  <div>P(X̄ &gt; 1.2) from the CLT:    0.1151</div>
  <div>P(X̄ &gt; 1.2) exact (gamma):   0.1184</div>
  <div>P(X̄ &gt; 1.2) in simulation:   0.1172</div>
</div>

## 4. A Visual Demonstration in Julia

Let's watch the CLT at work with three starting distributions that are very different from the normal: the uniform, the exponential (skewed) and the Bernoulli (which only takes the values 0 and 1). For each one, we draw 1,000 samples of size $n = 30$, compute the mean of each sample and standardize it with the $\mu$ and $\sigma$ of the starting distribution, as in the statement.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Distributions, Statistics, Plots, Random
using Measures

Random.seed!(123)

n_samples = 1_000    # how many sample means to generate
sample_size = 30     # n: how many values go into each mean

# Three starting distributions, very different from the normal.
# For the Bernoulli, the mean of 30 values can only be k/30 (k = 0, 1, …, 30); the
# histogram bins are centered on those values so that no bin is left empty.
bernoulli_edges = ((-0.5:1:sample_size + 0.5) ./ sample_size .- 0.5) ./
                  (0.5 / sqrt(sample_size))
distributions = [("Uniform(0, 1)", Uniform(0, 1), 30),
                 ("Exponential (mean 1)", Exponential(1), 30),
                 ("Bernoulli(0.5)", Bernoulli(0.5), bernoulli_edges)]

rounded(x) = string(round(x, digits = 2))
x = range(-4, 4, length = 200)
plots = []

for (name, dist, bins) in distributions
    μ, σ = mean(dist), std(dist)
    means = [mean(rand(dist, sample_size)) for _ in 1:n_samples]
    # Standardize using the theory: (X̄ − μ) / (σ/√n), as in the statement of the CLT
    z = (means .- μ) ./ (σ / sqrt(sample_size))
    p = histogram(z; normalize = :pdf, bins = bins,
        title = "Means of n = 30\n($name)", xlabel = "Standardized mean",
        ylabel = "Density", label = "Sample means",
        color = :steelblue, alpha = 0.6, linealpha = 0, formatter = rounded,
        xlims = (-4, 4))
    plot!(p, x, pdf.(Normal(), x); label = "N(0, 1)", color = :black, lw = 2, ls = :dash)
    push!(plots, p)
end

plot(plots...; layout = (1, 3), size = (1350, 450),
     left_margin = 8mm, bottom_margin = 8mm, top_margin = 5mm)
savefig("clt_demonstration_en.png")</code></pre>
  </div>
</div>

![Three histograms of standardized means of 30 values, from the uniform, the exponential and the Bernoulli, each with the dashed standard normal curve on top]({{ site.baseurl }}/assets/images/clt_demonstration_en.png)
<div class="image-caption">Figure 1: Standardized means of samples of size 30 from three different distributions. In all three cases, the histogram is close to the N(0, 1) curve.</div>

## 5. Conditions and Considerations

### 5.1 Core Requirements
- Independent random variables
- Identically distributed (more general versions of the theorem, such as Lindeberg–Feller, drop this condition)
- Finite, positive variance
- $n$ "large enough": the most quoted rule of thumb is $n \geq 30$, but it is not part of the theorem; for nearly symmetric distributions far less is enough, and for very skewed or heavy-tailed distributions far more may be needed

### 5.2 Speed of Convergence

How fast the mean approaches the normal depends on:
- the skewness of the original distribution (the more skewed, the slower);
- how heavy the tails are;
- the sample size.

The Q-Q plots below show this for the exponential, which is skewed. In a Q-Q plot, each point compares a quantile of the simulated means with the corresponding quantile of the standard normal: if the points follow the line, the distribution is close to normal.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Distributions, Statistics, StatsPlots, Random

Random.seed!(123)

n_samples = 1_000
sizes = [2, 5, 10, 30]
dist = Exponential(1)   # skewed, with mean 1 and standard deviation 1
μ, σ = mean(dist), std(dist)

rounded(x) = string(round(x, digits = 1))
plots = []
for n in sizes
    means = [mean(rand(dist, n)) for _ in 1:n_samples]
    z = (means .- μ) ./ (σ / sqrt(n))   # standardize using the theory
    # Q-Q plot: if the points follow the line, the distribution is close to normal
    p = qqplot(Normal(0, 1), z; title = "n = $n",
        xlabel = "Quantiles of N(0, 1)", ylabel = "Quantiles of the means",
        markercolor = :steelblue, markeralpha = 0.6, markerstrokewidth = 0,
        linecolor = :red, formatter = rounded)
    push!(plots, p)
end

plot(plots...; layout = (2, 2), size = (800, 800))
savefig("clt_qqplot_en.png")</code></pre>
  </div>
</div>

![Four Q-Q plots of standardized means of the exponential, for n equal to 2, 5, 10 and 30; the points curve away from the line for small n and nearly follow the line for n = 30]({{ site.baseurl }}/assets/images/clt_qqplot_en.png)
<div class="image-caption">Figure 2: Q-Q plots of the standardized means of the exponential for n = 2, 5, 10 and 30. With n = 2 the points curve (skewness); with n = 30 they nearly follow the line, but still drift a little at the ends.</div>

## 6. Practical Applications

### 6.1 Confidence Intervals
When the population standard deviation $\sigma$ is known, the CLT lets us build a 95% confidence interval for the mean $\mu$:

$$\bar{x} \pm 1.96 \cdot \frac{\sigma}{\sqrt{n}}$$

The value 1.96 is the $z$ that leaves 2.5% in each tail of the standard normal. If $\sigma$ is unknown and replaced by the sample standard deviation $s$, the usual practice is to swap 1.96 for the value from Student's t distribution; for large $n$, the two are close. The details are in [Confidence Intervals]({{ '/pt/inferencia-estatistica/intervalos-confianca' | relative_url }}) (in Portuguese).

### 6.2 Hypothesis Tests
The Z statistic for testing whether the mean equals a value $\mu_0$ (with $\sigma$ known):

$$Z = \frac{\bar{X} - \mu_0}{\sigma/\sqrt{n}}$$

By the CLT, if the mean really is $\mu_0$, $Z$ has an approximately $N(0, 1)$ distribution. See [Hypothesis Tests]({{ '/pt/inferencia-estatistica/testes-hipotese' | relative_url }}) (in Portuguese).

### 6.3 Worked Example: Quality Control

<div style="border-left: 4px solid #2196F3; padding: 0.5em; background-color: #e3f2fd; margin: 1em 0;">
  <strong>💡 Example</strong><br>
  A factory makes screws whose specified length is 10 mm, with a tolerance of ±0.1 mm. From past records, the process standard deviation is $\sigma = 0.02$ mm. A sample of 100 screws had a mean length of $\bar{x} = 10.002$ mm (illustrative numbers). Build the 95% confidence interval for the mean length $\mu$ of the production.
</div>

**Data** (given): $n = 100$ screws; $\sigma = 0.02$ mm (known); $\bar{x} = 10.002$ mm; 95% confidence, that is, $z = 1.96$.

**Condition:** the screws in the sample are independent of one another. With $n = 100$, by the CLT, $\bar{X}$ is approximately normal even if the individual lengths are not.

**Step 1, standard error:**

$$SE = \frac{\sigma}{\sqrt{n}} = \frac{0.02}{\sqrt{100}} = \frac{0.02}{10} = 0.002 \text{ mm}$$

**Step 2, margin of error:**

$$1.96 \cdot SE = 1.96 \cdot 0.002 = 0.00392 \text{ mm}$$

**Step 3, interval limits:**

$$\text{lower limit} = 10.002 - 0.00392 = 9.99808 \text{ mm}$$

$$\text{upper limit} = 10.002 + 0.00392 = 10.00592 \text{ mm}$$

**Result:** $CI_{95\%} = [9.99808,\ 10.00592]$ mm.

**Interpretation:**
1. The interval estimates the **mean length** of the production. The "95%" is about the method: if we repeated the sampling many times, about 95% of the intervals built this way would contain the true mean $\mu$. It is not "a 95% chance that $\mu$ lies in this interval".
2. The interval contains the specified value, 10 mm: the data do not indicate that the production mean has shifted.
3. The interval does **not** say whether each screw is within tolerance. That depends on the spread of the parts ($\sigma = 0.02$ mm), not on the width of the interval, which shrinks with $n$ (the standard error is $\sigma/\sqrt{n}$). If, in addition, the individual lengths follow a normal (an extra assumption, which the CLT does **not** guarantee), almost all parts lie within $10.002 \pm 3 \cdot 0.02$, that is, between 9.942 and 10.062 mm, inside $[9.9,\ 10.1]$; the code below computes the share outside the tolerance under this model: about $6.5 \times 10^{-7}$, close to 1 part in 1.5 million.
4. Whether the process is "in statistical control" (stable over time) is a different question, answered with control charts, not with a single confidence interval.

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

# Example data (illustrative)
n = 100        # screws measured
σ = 0.02       # process standard deviation, known (mm)
x̄ = 10.002     # mean of the 100 measurements (mm)

# z value for 95%: leaves 2.5% in each tail of the standard normal
z = quantile(Normal(), 0.975)
standard_error = σ / sqrt(n)
margin = 1.96 * standard_error
println("z (95%) = ", round(z, digits = 4))
println("Standard error = ", standard_error, " mm   Margin = ", round(margin, digits = 5), " mm")
println("95% confidence interval for the mean: [", round(x̄ - margin, digits = 5), ", ",
        round(x̄ + margin, digits = 5), "] mm")

# Individual screws: assuming lengths ~ Normal(x̄, σ), share outside [9.9, 10.1]
screw = Normal(x̄, σ)
outside = cdf(screw, 9.9) + ccdf(screw, 10.1)
println("Share of screws outside the tolerance (assuming normality): ", round(outside, sigdigits = 2))</code></pre>
  </div>
</div>

#### Expected output:
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <div>z (95%) = 1.96</div>
  <div>Standard error = 0.002 mm   Margin = 0.00392 mm</div>
  <div>95% confidence interval for the mean: [9.99808, 10.00592] mm</div>
  <div>Share of screws outside the tolerance (assuming normality): 6.5e-7</div>
</div>

### 6.4 Applications in Different Fields

1. **Engineering**: quality control, manufacturing tolerances
2. **Medicine**: comparing means in clinical trials
3. **Social Sciences**: opinion polls (a sample proportion is a mean of zeros and ones)
4. **Finance**: returns accumulated over many periods, with care, because returns often have heavy tails and dependence

## 7. Limitations and Caveats

<div style="border-left: 4px solid #ff9800; padding: 0.5em; background-color: #fff3e0; margin: 1em 0;">
  <strong>⚠️ Caution:</strong><br>
  The normal approximation may be poor, or the CLT may not hold at all, when:
  <ul>
    <li>the sample is small and the original distribution is very skewed;</li>
    <li>the variables are not independent (for example, consecutive measurements over time that depend on one another);</li>
    <li>the variance is infinite or does not exist: then the CLT does not apply (this is what happens with the Cauchy distribution);</li>
    <li>the distribution has heavy tails: rare but huge extreme values make convergence require very large samples.</li>
  </ul>
</div>

## 8. Tips for Applying It in Practice

1. **Check independence** in how the data were collected: the CLT depends on it, and no sample size fixes its absence.
2. **Look at the data** (histogram, boxplot): strong skewness and outliers mean $n$ needs to be larger.
3. **When in doubt, simulate**: as in sections 3 and 5, a simulation shows whether the normal approximation is good for your distribution and your $n$.
4. **Remember that $n \geq 30$ is a rule of thumb**, not a guarantee.

## References

1. Billingsley, P. (1995). *Probability and Measure*. 3rd ed. Wiley.
2. Bussab, W. O.; Morettin, P. A. (2023). *Estatística Básica*. 10th ed. Saraiva Uni. (in Portuguese)
3. Fischer, H. (2011). *A History of the Central Limit Theorem: From Classical to Modern Probability Theory*. Springer.
4. Pólya, G. (1920). Über den zentralen Grenzwertsatz der Wahrscheinlichkeitsrechnung und das Momentenproblem. *Mathematische Zeitschrift*, 8(3–4), 171–181. DOI: [10.1007/BF01206525](https://doi.org/10.1007/BF01206525).
5. Ulyanov, V. V. (2024). From classical to modern central limit theorems. arXiv:2405.19828. DOI: [10.48550/arXiv.2405.19828](https://doi.org/10.48550/arXiv.2405.19828).
