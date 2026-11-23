---
layout: page
title: Probability Distributions
lang: en
ref: distribuicoes
parent: probabilidade
permalink: /en/probability/distributions
order: 1
mathjax: true
description: "Mathematical models that describe how the values of a random variable are distributed."
---

**Probability distributions** are mathematical functions that describe the probability of the different outcomes of a random variable. They are fundamental in statistics and data science, letting us model and understand random phenomena in many fields.

<div style="border-left: 4px solid #4CAF50; padding: 0.5em; background-color: #e8f5e9;">
  <strong>📊 Important:</strong> choosing the right distribution is essential for a <strong>correct statistical analysis</strong>.<br>
  Each distribution has <em>specific assumptions and applications</em> that must be taken into account.
</div>

---

## Symbols and Core Concepts

### Random Variables

- **Discrete Random Variable**: takes values in a finite or countably infinite set.
  - Example: the number of customers in a queue, the number of accidents per day.

- **Continuous Random Variable**: takes values in a continuous interval.
  - Example: weight, height, waiting time.

### Probability Functions

- **Probability Mass Function (Discrete)**: $P(X = x_i) = p_i$
- **Probability Density Function (Continuous)**: $f(x)$ such that $P(a \leq X \leq b) = \int_a^b f(x)dx$
- **Cumulative Distribution Function (CDF)**: $F(x) = P(X \leq x)$

---

## 1. Discrete Distributions

### 1.1 The Bernoulli Distribution

Models experiments with only two possible outcomes (success or failure).

#### Parameters
- $p$: probability of success ($0 \leq p \leq 1$)

#### Probability Mass Function
$$P(X = x) = p^x(1-p)^{1-x}, \text{ where } x \in \{0,1\}$$

#### Mean and Variance
- Mean ($\mu$): $p$
- Variance ($\sigma^2$): $p(1-p)$

#### Applications
- Modeling success/failure
- Binary tests (e.g. a quality check)

<div style="border-left: 4px solid #2196F3; padding: 0.5em; background-color: #e3f2fd; margin: 1em 0;">
  <strong>💡 Worked Example</strong><br>
  Tossing a biased coin where the probability of heads (success) is $p=0.6$.
</div>

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Distributions, Plots

d = Bernoulli(0.6)
data = rand(d, 1000)

histogram(data, bins=2, normalize=:pdf, 
          legend=false,
          title="Bernoulli Distribution (p = 0.6)",
          xlabel="Outcome", 
          ylabel="Probability Density",
          xticks=([0, 1], ["Tails", "Heads"]),
          color=:steelblue,
          alpha=0.6,
          lw=0,
          xlims=(-0.5, 1.5))

# Theoretical values
plot!([0, 1], [1 - 0.6, 0.6], seriestype=:sticks, color=:darkred, lw=2, label="Theoretical")
</code></pre>
  </div>
</div>

![Bernoulli distribution]({{ site.baseurl }}/assets/images/bernoulli_histogram.png)
<div class="image-caption">Figure 1: Bernoulli distribution for p=0.6</div>

### 1.2 The Binomial Distribution

Models the number of successes in $n$ independent Bernoulli trials.

#### Parameters
- $n$: number of trials
- $p$: probability of success in each trial

#### Probability Mass Function
$$P(X = k) = C(n,k) \cdot p^k (1-p)^{n-k}, \text{ for } k = 0,1,2,...,n$$

where $C(n,k) = \frac{n!}{k!(n-k)!}$ is the binomial coefficient.

#### Mean and Variance
- Mean ($\mu$): $np$
- Variance ($\sigma^2$): $np(1-p)$

#### Applications
- Quality control
- Opinion polls
- Multiple-choice tests

<div style="border-left: 4px solid #2196F3; padding: 0.5em; background-color: #e3f2fd; margin: 1em 0;">
  <strong>💡 Worked Example</strong><br>
  The number of heads in 10 tosses of a fair coin.
</div>

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Distributions, Plots

# Binomial distribution parameters
n, p = 10, 0.5
d_bin = Binomial(n, p)

x = 0:n
probs_bin = pdf.(d_bin, x)

# Plotting the binomial distribution (bar chart)
bar(x, probs_bin,
    legend=false,
title="Binomial Distribution\nNormal Approximation (n = 10, p = 0.5)",
    xlabel="Number of successes",
    ylabel="Probability",
    color=:steelblue,
    alpha=0.6,
    lw=0,
    bar_width=0.8,
    ylims=(0, maximum(probs_bin) + 0.05))

# Labels with the probability values
annotate!([(x[i], probs_bin[i] + 0.01, text(string(round(probs_bin[i], digits=3)), :black, 8)) for i in 1:length(x)]...)

# Parameters of the approximating normal
μ = n * p
σ = sqrt(n * p * (1 - p))
d_normal = Normal(μ, σ)

# Normal curve over the bars
x_dense = range(0, n, length=200)
pdf_normal = pdf.(d_normal, x_dense)

# Overlaying the normal curve
plot!(x_dense, pdf_normal, 
      lw=2, color=:darkred, 
      label="Normal Approximation")</code></pre>
  </div>
</div>

![Normal approximation to the binomial]({{ site.baseurl }}/assets/images/binomial_normal_approximation.png)
<div class="image-caption">Figure 2: Binomial distribution with its normal approximation</div>

### 1.3 The Poisson Distribution

Used to model the number of events that occur in a fixed interval of time or space.

#### Parameter
- $\lambda$: the average number of occurrences in the interval

#### Probability Mass Function
$$P(X = k) = \frac{e^{-\lambda} \lambda^k}{k!}, \text{ for } k = 0,1,2,...$$

#### Mean and Variance
- Mean ($\mu$): $\lambda$
- Variance ($\sigma^2$): $\lambda$

#### Applications
- Number of calls to a phone exchange per hour
- Number of accidents on a highway per month
- Number of typos per page

<div style="border-left: 4px solid #2196F3; padding: 0.5em; background-color: #e3f2fd; margin: 1em 0;">
  <strong>💡 Worked Example</strong><br>
  The number of calls a call center receives in one hour (λ = 5).
</div>

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Distributions, Plots

# Parameter λ (mean rate of occurrences)
λ = 5

# Create Poisson distribution
d = Poisson(λ)

# Values to plot (extending slightly beyond likely range)
x = 0:14
probs = pdf.(d, x)

# Create bar plot
bar(x, probs,
    legend=:topright,
    title="Poisson Distribution (λ = $λ)",
    xlabel="Number of Events (k)",
    ylabel="Probability P(X = k)",
    color=:steelblue,
    alpha=0.6,
    bar_width=0.8,
    lw=0,
    xticks=x,
    grid=false,
    framestyle=:box)

# Add vertical lines for mean and standard deviation
μ = mean(d)  # For Poisson, μ = λ
σ = std(d)   # For Poisson, σ = √λ
vline!([μ], linestyle=:dash, color=:darkred, linewidth=2, label="Mean (μ = $μ)")
vline!([μ - σ, μ + σ], linestyle=:dot, color=:slateblue, linewidth=2, label="±1σ (σ = $(round(σ, digits=2)))")

# Annotate probabilities for significant bars
for (xi, prob) in zip(x, probs)
    if prob > 0.01  # Only label probabilities > 1%
        annotate!(xi, prob + 0.005, text("$(round(prob, digits=3))", 8, :black, :center))
    end
end

# Adjust plot limits
ylims!(0, maximum(probs) + 0.03)
xlims!(-0.5, 14.5)

# Add Poisson PMF formula to plot
annotate!(10, maximum(probs)*0.9, text("Formula:\nP(X=k) = e^{-λ}λ^k/k!", 10, :black, :right))</code></pre>
  </div>
</div>

![Poisson distribution]({{ site.baseurl }}/assets/images/poisson_distribution.png)
<div class="image-caption">Figure 3: Poisson distribution with λ=5</div>

<div style="border-left: 4px solid #9c27b0; padding: 0.5em; background-color: #f3e5f5; margin: 1em 0;">
  <strong>🔍 A bit of history</strong><br>
  The Poisson distribution was introduced by Siméon Denis Poisson in 1837, in his work on the probability of convictions in criminal trials.
</div>

---

## 2. Continuous Distributions

### 2.1 The Normal (Gaussian) Distribution

The most important distribution in statistics, shaped like a symmetric bell.

#### Parameters
- $\mu$: mean (where the peak is)
- $\sigma$: standard deviation (how wide the curve is)

#### Probability Density Function
$$f(x) = \frac{1}{\sqrt{2\pi\sigma^2}} e^{-\frac{(x-\mu)^2}{2\sigma^2}}$$

#### Properties
- Symmetric around the mean
- Mean = Median = Mode
- About 68% of the data lie within $\mu \pm \sigma$
- About 95% of the data lie within $\mu \pm 2\sigma$
- About 99.7% of the data lie within $\mu \pm 3\sigma$

#### Applications
- Height, weight, IQ
- Measurement errors
- Biological traits

<div style="border-left: 4px solid #2196F3; padding: 0.5em; background-color: #e3f2fd; margin: 1em 0;">
  <strong>💡 Worked Example</strong><br>
  The distribution of heights in a population (μ = 170cm, σ = 10cm).
</div>

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Distributions, Plots

μ, σ = 170, 10
d = Normal(μ, σ)

x = 130:0.1:210
pdf_values = pdf.(d, x)

plot(x, pdf_values, 
     lw=2, 
     legend=true,
     title="Normal Distribution\n(μ = $μ, σ = $σ)",
     titlefontsize=11,
     xlabel="Height (cm)",
     ylabel="Probability Density",
     grid=true,
     color=:steelblue,
     fillrange=0, 
     fillalpha=0.2,
     fillcolor=:cornflowerblue)

vline!([μ], lw=2, linestyle=:dash, color=:black, label="μ = $μ")
vline!([μ - σ, μ + σ], lw=1, linestyle=:dot, color=:red, label="±1σ")
vline!([μ - 2σ, μ + 2σ], lw=1, linestyle=:dot, color=:orange, label="±2σ")
vline!([μ - 3σ, μ + 3σ], lw=1, linestyle=:dot, color=:green, label="±3σ")</code></pre>
  </div>
</div>

![Normal distribution]({{ site.baseurl }}/assets/images/normal_distribution.png)
<div class="image-caption">Figure 4: Normal distribution with μ=170 and σ=10</div>

### 2.2 The Exponential Distribution

Models the time between events in a Poisson process.

#### Parameter
- $\lambda$: rate of occurrence

#### Probability Density Function
$$f(x) = \lambda e^{-\lambda x}, \text{ for } x \geq 0$$

#### Mean and Variance
- Mean ($\mu$): $1/\lambda$
- Variance ($\sigma^2$): $1/\lambda^2$

#### Applications
- Time between phone calls
- Lifetime of electronic components
- Waiting time in queues

<div style="border-left: 4px solid #2196F3; padding: 0.5em; background-color: #e3f2fd; margin: 1em 0;">
  <strong>💡 Worked Example</strong><br>
  The time between customer arrivals at a bank (λ = 0.5 customers/minute).
</div>

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Distributions, Plots

# Parameter
λ = 0.5  
d = Exponential(1/λ)

# Values
x = 0:0.1:10
pdf_values = pdf.(d, x)

# Statistics
μ = mean(d)
med = quantile(d, 0.5)
σ² = var(d)  # Variance
σ = std(d)   # Standard deviation

# Create plot
plot(x, pdf_values, 
     linewidth=2, 
     legend=:topright,
     title="Exponential Distribution (λ = $λ)",
     xlabel="Time between arrivals (min)",
     ylabel="Probability Density",
     grid=true,
     color=:steelblue,
     fillrange=0, 
     fillalpha=0.2,
     fillcolor=:lightblue,
     framestyle=:zerolines)

# Vertical lines for statistics
vline!([μ], linestyle=:dash, linewidth=2, color=:black, label="Mean = $(round(μ, digits=2))")
vline!([med], linestyle=:dot, linewidth=2, color=:red, label="Median = $(round(med, digits=2))")
vline!([μ + σ], linestyle=:dashdot, linewidth=1.5, color=:green, label="μ + σ = $(round(μ+σ, digits=2))")

# Annotations
annotate!(μ, pdf(d, μ)+0.005, text("μ", :black, 10))
annotate!(med, pdf(d, med)+0.005, text("med", :red, 10))
annotate!(μ+σ, pdf(d, μ+σ)+0.005, text("μ+σ", :green, 10))

# Add variance information
annotate!(5, 0.25, 
          text("Statistics:\nMean (μ) = 1/λ = $(round(μ, digits=2))\n" *
               "Variance (σ²) = 1/λ² = $(round(σ², digits=2))\n" *
               "Standard Deviation (σ) = 1/λ = $(round(σ, digits=2))", 
               10, :left))

# Highlight important region
plot!(x, pdf_values, fillrange=0, fillalpha=0.3, fillcolor=:steelblue, 
      label="P(X ≤ $(round(μ, digits=2))) = $(round(cdf(d, μ), digits=2))")

# Add exponential formula
annotate!(7, 0.35, text("f(x) = λe^{-λx}", 12, :left))</code></pre>
  </div>
</div>

![Exponential distribution]({{ site.baseurl }}/assets/images/exponential_distribution.png)
<div class="image-caption">Figure 5: Exponential distribution with λ=0.5</div>

### 2.3 The Continuous Uniform Distribution

Every value in an interval is equally likely.

#### Parameters
- $a$: lower bound
- $b$: upper bound

#### Probability Density Function
$$f(x) = \frac{1}{b-a}, \text{ for } a \leq x \leq b$$

#### Mean and Variance
- Mean ($\mu$): $\frac{a+b}{2}$
- Variance ($\sigma^2$): $\frac{(b-a)^2}{12}$

#### Applications
- Random number generation
- Modeling equally likely situations
- Computer simulations

<div style="border-left: 4px solid #2196F3; padding: 0.5em; background-color: #e3f2fd; margin: 1em 0;">
  <strong>💡 Worked Example</strong><br>
  Generating random numbers between 0 and 1.
</div>

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Distributions, Plots

# Uniform distribution parameters
a, b = 0, 1

# Creating the distribution
d = Uniform(a, b)

# Computing the mean and variance
μ = mean(d)
σ² = var(d)

# Values for the x axis
x = -0.5:0.01:1.5

# Computing the PDF
pdf_values = pdf.(d, x)

# Plotting the PDF
plot(x, pdf_values, 
     lw=2, 
     legend=true,
     title="Uniform Distribution (a=$a, b=$b)",
     xlabel="Value",
     ylabel="Probability Density",
     ylim=(0, 1.2),
     grid=true,
     color=:steelblue,
     fillrange=0, 
     fillalpha=0.2,
     fillcolor=:lightblue)

# Vertical lines for the bounds and the mean
vline!([a], linestyle=:dash, color=:red, alpha=0.7, label="Bound a = $a")
vline!([b], linestyle=:dash, color=:orange, alpha=0.7, label="Bound b = $b")
vline!([μ], linestyle=:dashdot, color=:purple, alpha=0.8, lw=2, label="Mean μ = $(round(μ, digits=2))")

# Horizontal line for the constant density
hline!([pdf(d, 0.5)], linestyle=:dot, color=:green, label="Constant Density = $(round(pdf(d, 0.5), digits=2))")

# Points marking the bounds and the mean
scatter!([a, b, μ], [pdf(d, a), pdf(d, b), pdf(d, μ)], 
         markersize=7, 
         markercolor=:white, 
         markerstrokecolor=[:red, :orange, :purple], 
         markerstrokewidth=2, 
         label="")

# Labels for a, b and the mean
annotate!([(a, -0.1, text("a = $a", :red, 10, :center)), 
           (b, -0.1, text("b = $b", :orange, 10, :center)),
           (μ, 0.05, text("μ = $(round(μ, digits=2))", :purple, 10, :center))])

# Variance text on the plot
annotate!(0.5, 0.5, text("Variance σ² = $(round(σ², digits=3))", :black, 11))

plot!(legend=:topright)</code></pre>
  </div>
</div>

![Uniform distribution]({{ site.baseurl }}/assets/images/uniform_distribution.png)
<div class="image-caption">Figure 6: Continuous uniform distribution</div>

---

## 3. How Do You Choose the Right Distribution?

1. **Identify the type of variable**: discrete or continuous?
2. **Look at the domain of the data**: which values are possible?
3. **Check the shape of the data**: symmetric, skewed, heavy-tailed?
4. **Consider the underlying phenomenon**: which theoretical model fits it best?
5. **Use goodness-of-fit tests**:
   - Chi-square test
   - Kolmogorov-Smirnov test
   - Anderson-Darling test
   - Q-Q plots

<div style="border-left: 4px solid #ff9800; padding: 0.5em; background-color: #fff3e0; margin: 1em 0;">
  <strong>⚠️ Mind the assumptions!</strong><br>
  Choosing the wrong distribution can lead to <em>misleading conclusions</em>. Always check the assumptions before drawing inferences.
</div>

---

## 4. Practical Applications

### Engineering
- Quality control (Normal distribution)
- System reliability (Exponential, Weibull distributions)
- Stochastic processes (Poisson distribution)

### Finance
- Risk modeling (Normal, Student's t distributions)
- Option pricing (Log-Normal distribution)
- Analysis of financial returns (Normal, Cauchy distributions)

### Natural Sciences
- Physics: Brownian motion (Normal distribution)
- Chemistry: radioactive decay (Exponential distribution)
- Biology: population growth (Poisson distribution)

### Social Sciences
- Opinion polls (Binomial distribution)
- Demographic studies (Poisson, Normal distributions)
- Psychometrics (Normal distribution)

---

## References

1. Bussab, W. O.; Morettin, P. A. **Estatística Básica**. 9th ed. Saraiva, 2017. (in Portuguese)
2. Montgomery, D. C.; Runger, G. C. **Applied Statistics and Probability for Engineers**. Wiley.
3. Magalhães, M. N.; Lima, A. C. P. **Noções de Probabilidade e Estatística**. 7th ed. Edusp, 2013. (in Portuguese)
4. Triola, M. F. **Elementary Statistics**. Pearson.
5. Devore, J. L. **Probability and Statistics for Engineering and the Sciences**. Cengage Learning.
