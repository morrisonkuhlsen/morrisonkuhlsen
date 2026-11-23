---
layout: page
title: Central Limit Theorem
lang: en
ref: teorema-limite-central
parent: probabilidade
permalink: /en/probability/central-limit-theorem
order: 3
mathjax: true
description: "One of the most important theorems in statistics: the distribution of the sample mean converges to the normal."
---

The **Central Limit Theorem (CLT)** is one of the most important results in probability theory. It states that the sum (or mean) of a large number of independent and identically distributed random variables tends to follow a normal distribution.

<div style="border-left: 4px solid #4CAF50; padding: 0.5em; background-color: #e8f5e9;">
  <strong>📊 Important:</strong> the CLT is fundamental to <strong>statistical inference</strong>.<br>
  It justifies using the normal distribution in many practical applications and underpins confidence intervals and hypothesis tests.
</div>

## 1. Historical Context

The Central Limit Theorem has a rich history spanning more than two centuries:

### 1.1 Historical Development

- **Abraham de Moivre (1733)**: the first version of the theorem, applied to the binomial distribution
- **Pierre-Simon Laplace (1812)**: generalization to other distributions
- **Aleksandr Lyapunov (1901)**: a rigorous proof and the conditions required
- **Paul Lévy (1935)**: the modern formulation and extensions

### 1.2 Historical Importance

The CLT revolutionized statistics by:
- Justifying the use of the normal distribution in statistical analyses
- Allowing complex distributions to be approximated
- Providing the foundation for statistical inference methods

## 2. Formal Statement

Let X₁, X₂, ..., Xₙ be independent and identically distributed random variables with:
- Mean: μ
- Variance: σ²

Then, for large enough n:

$$\frac{\sum_{i=1}^n X_i - n\mu}{\sigma\sqrt{n}} \xrightarrow{d} N(0,1)$$

Or, equivalently, for the sample mean:

$$\frac{\bar{X} - \mu}{\sigma/\sqrt{n}} \xrightarrow{d} N(0,1)$$

where $\xrightarrow{d}$ denotes convergence in distribution.

## 3. A Visual Demonstration in Julia

Let's demonstrate the CLT by simulating different distributions:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Distributions, Plots, Random
using StatsPlots
using Measures

Random.seed!(123)

# Parameters
n_samples = 1000
sample_size = 30

# Distributions
dist_unif = Uniform(0, 1)
dist_exp = Exponential(1)
dist_bin = Binomial(1, 0.5)

# Generating the sample means
means_unif = [mean(rand(dist_unif, sample_size)) for _ in 1:n_samples]
means_exp = [mean(rand(dist_exp, sample_size)) for _ in 1:n_samples]
means_bin = [mean(rand(dist_bin, sample_size)) for _ in 1:n_samples]

# Standardization
standardize(x) = (x .- mean(x)) ./ std(x)
means_unif_std = standardize(means_unif)
means_exp_std = standardize(means_exp)
means_bin_std = standardize(means_bin)

# Normal curve
x = range(-4, 4, length=200)
dist_normal = Normal(0, 1)
normal_curve = pdf.(dist_normal, x)

# Distinct colors
colors = [:darkorange, :seagreen, :royalblue]

# Histograms
p1 = histogram(means_unif_std,
    normalize=:pdf, bins=30,
    title="Sample Means\n(Uniform Distribution)",
    xlabel="Standardized Value", ylabel="Density",
    label="Sample Means",
    color=colors[1], alpha=0.6, linealpha=0,
    bottom_margin=5mm, top_margin=10mm)

plot!(p1, x, normal_curve, label="Normal(0,1)", color=:black, lw=2, linestyle=:dash)

p2 = histogram(means_exp_std,
    normalize=:pdf, bins=30,
    title="Sample Means\n(Exponential Distribution)",
    xlabel="Standardized Value", ylabel="Density",
    label="Sample Means",
    color=colors[2], alpha=0.6, linealpha=0,
    bottom_margin=5mm, top_margin=10mm)

plot!(p2, x, normal_curve, label="Normal(0,1)", color=:black, lw=2, linestyle=:dash)

p3 = histogram(means_bin_std,
    normalize=:pdf, bins=30,
    title="Sample Means\n(Binomial Distribution)",
    xlabel="Standardized Value", ylabel="Density",
    label="Sample Means",
    color=colors[3], alpha=0.6, linealpha=0,
    bottom_margin=5mm, top_margin=10mm)

plot!(p3, x, normal_curve, label="Normal(0,1)", color=:black, lw=2, linestyle=:dash)


# Final plot with margins adjusted so nothing gets cut off
plot(p1, p2, p3,
    layout=(1,3),
    size=(1350, 450),
    titlefontsize=14,
    layout_margin=10mm,
    left_margin=10mm,
    right_margin=10mm,
    top_margin=15mm,
    bottom_margin=10mm,
    legend=:topright,
    grid=true)</code></pre>
  </div>
</div>

![CLT demonstration]({{ site.baseurl }}/assets/images/media_amostral.png)
<div class="image-caption">Figure 1: The Central Limit Theorem at work for different distributions (Uniform, Exponential and Binomial)</div>

## 4. Conditions and Considerations

### 4.1 Core Requirements
- Independent random variables
- Identically distributed
- Finite variance
- n "large enough" (usually n ≥ 30)

### 4.2 Speed of Convergence

How fast the sample mean approaches normality depends on several factors:
- The skewness of the original distribution
- The kurtosis (how heavy the tails are)
- The sample size

Let's see how the sample size affects convergence:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Distributions, Plots, Random, StatsPlots

# Settings
Random.seed!(123)
n_samples = 1000
sizes = [2, 5, 10, 30]

# Exponential distribution (skewed)
dist = Exponential(1)

# Function that generates sample means
function sample_means(dist, n, size)
    return [mean(rand(dist, size)) for _ in 1:n]
end

# Standardization
standardize(x) = (x .- mean(x)) ./ std(x)

# Generating means for different sample sizes
means = [sample_means(dist, n_samples, s) for s in sizes]
means_std = [standardize(m) for m in means]

# Building the Q-Q plots
plots = []
for (i, s) in enumerate(sizes)
    p = qqplot(Normal(0,1), means_std[i],
        qqline=:R,
        title="n = $s",
        label="",
        markercolor=:steelblue,
        markeralpha=0.6,
        linecolor=:red)
    push!(plots, p)
end

# Combining the plots
plot(plots..., 
    layout=(2,2), 
    size=(800,800),
    title="CLT Convergence",
    titlefontsize=12)</code></pre>
  </div>
</div>

![CLT convergence]({{ site.baseurl }}/assets/images/qq_plot.png)
<div class="image-caption">Figure 2: How the CLT converges for different sample sizes</div>

## 5. Practical Applications

### 5.1 Confidence Intervals
For a large sample (n ≥ 30), the 95% confidence interval for the mean is:

$$\bar{X} \pm 1.96 \frac{\sigma}{\sqrt{n}}$$

### 5.2 Hypothesis Tests
The Z statistic for hypothesis tests:

$$Z = \frac{\bar{X} - \mu_0}{\sigma/\sqrt{n}}$$

### 5.3 Worked Example: Quality Control

Consider a factory that makes bolts. The bolts should be 10mm ± 0.1mm long.

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

# Simulating bolt measurements
n = 100  # sample size
μ = 10.0  # target mean
σ = 0.02  # process standard deviation

# Generating the measurements
measurements = rand(Normal(μ, σ), n)

# Computing the statistics
x̄ = mean(measurements)
standard_error = std(measurements)/√n

# 95% confidence interval
z = 1.96
ci_lower = x̄ - z * standard_error
ci_upper = x̄ + z * standard_error

println("Mean of the measurements: ", round(x̄, digits=4), " mm")
println("95% confidence interval: [", 
    round(ci_lower, digits=4), ", ",
    round(ci_upper, digits=4), "] mm")</code></pre>
  </div>
</div>

#### Solving It by Hand, Step by Step

Let's work through the example above by hand to understand the process better.

**Problem data**:
- Sample size: $$n = 100$$ bolts
- Target mean: $$\mu = 10.0$$ mm
- Process standard deviation: $$\sigma = 0.02$$ mm
- Confidence level: 95% $$\rightarrow z_{\alpha/2} = 1.96$$

**Step 1: Compute the Standard Error**

The standard error (SE) is given by:

$$SE = \frac{\sigma}{\sqrt{n}}$$

Substituting the values:

$$SE = \frac{0.02}{\sqrt{100}} = \frac{0.02}{10} = 0.002 \text{ mm}$$

**Step 2: Compute the Confidence Interval**

For a 95% confidence interval, we use:

$$CI_{95\%} = \bar{x} \pm z_{\alpha/2} \cdot SE$$

Where:
- $$\bar{x}$$ is the sample mean (suppose $$\bar{x} = 10.002$$ mm)
- $$z_{\alpha/2} = 1.96$$ for 95% confidence

Substituting the values:

$$CI_{95\%} = 10.002 \pm 1.96 \cdot 0.002$$

**Lower bound**:
$$CI_{lower} = 10.002 - (1.96 \cdot 0.002) = 10.002 - 0.00392 = 9.99808 \text{ mm}$$

**Upper bound**:
$$CI_{upper} = 10.002 + (1.96 \cdot 0.002) = 10.002 + 0.00392 = 10.00592 \text{ mm}$$

So:

$$CI_{95\%} = [9.99808, 10.00592] \text{ mm}$$

**Interpreting the Results**:
1. The sample mean is $$\bar{x} = 10.002 \text{ mm}$$
2. With 95% confidence, the interval $$[9.99808, 10.00592]$$ contains the true population mean $$\mu$$
3. Since the specified tolerance is $$10 \pm 0.1 \text{ mm}$$ (that is, $$[9.9, 10.1] \text{ mm}$$), and $$CI_{95\%} \subset [9.9, 10.1]$$, we can conclude that the process is in statistical control

**Conclusion**: the manufacturing process is producing bolts within the required specification $$(10 \pm 0.1 \text{ mm})$$ with 95% confidence. The process variability is small, as the narrow confidence interval shows (about $$\pm 0.004 \text{ mm}$$ around the mean).

### 5.4 Applications in Different Fields

1. **Finance**
   - Analysis of investment returns
   - Computing Value at Risk (VaR)
   - Option pricing

2. **Medicine**
   - Analysis of clinical trials
   - Epidemiological studies
   - Drug efficacy testing

3. **Engineering**
   - Quality control
   - Reliability analysis
   - Manufacturing tolerances

4. **Social Sciences**
   - Opinion polls
   - Demographic studies
   - Behavior analysis

## 6. Extensions and Variations

### 6.1 The Multivariate Central Limit Theorem
For random vectors, where the convergence is to a multivariate normal distribution:

$$\sqrt{n}(\bar{X}_n - \mu) \xrightarrow{d} N_p(0, \Sigma)$$

### 6.2 The Berry-Esseen Theorem
Gives a rate of convergence for the CLT:

$$\sup_{x} |F_n(x) - \Phi(x)| \leq \frac{C\rho}{\sigma^3\sqrt{n}}$$

where:
- $F_n$ is the cumulative distribution function of the normalized sum
- $\Phi$ is the standard normal distribution function
- $\rho$ is the third absolute moment
- $C$ is a universal constant

## 7. Limitations and Caveats

<div style="border-left: 4px solid #ff9800; padding: 0.5em; background-color: #fff3e0; margin: 1em 0;">
  <strong>⚠️ Caution:</strong><br>
  The CLT may not work well when:
  <ul>
    <li>The sample is small (n < 30)</li>
    <li>The original distribution is very skewed</li>
    <li>The variables are not independent</li>
    <li>The variance is infinite or does not exist</li>
    <li>There are significant outliers</li>
    <li>The distribution has heavy tails</li>
  </ul>
</div>

### 7.1 Special Cases
- **Stable Distributions**: some non-normal distributions are stable under summation
- **Heavy-Tailed Distributions**: may require very large sample sizes
- **Dependence**: correlation between variables can affect convergence

## 8. Tips for Applying It in Practice

1. **Checking Normality**
   - Use Q-Q plots
   - The Shapiro-Wilk test
   - Look at skewness and kurtosis

2. **Sample Size**
   - n ≥ 30 is a rule of thumb
   - Larger samples for more complex distributions
   - Take the desired power of the test into account

3. **Diagnostics**
   - Examine outliers
   - Check independence
   - Assess homogeneity

## References

1. Rice, J. A. **Mathematical Statistics and Data Analysis**. 3rd ed. Duxbury Press, 2006.
2. Wasserman, L. **All of Statistics: A Concise Course in Statistical Inference**. Springer, 2004.
3. DeGroot, M. H.; Schervish, M. J. **Probability and Statistics**. 4th ed. Pearson, 2011.
4. Casella, G.; Berger, R. L. **Statistical Inference**. 2nd ed. Duxbury, 2001.
5. Morettin, P. A.; Bussab, W. O. **Estatística Básica**. 9th ed. Saraiva, 2017. (in Portuguese)
6. Fischer, H. **A History of the Central Limit Theorem: From Classical to Modern Probability Theory**. Springer, 2011.
7. Billingsley, P. **Probability and Measure**. 3rd ed. Wiley, 1995.
8. Feller, W. **An Introduction to Probability Theory and Its Applications**. Vol. 2, 2nd ed. Wiley, 1971.
