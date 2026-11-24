---
layout: page
title: Probability Distributions
lang: en
ref: distribuicoes
parent: probabilidade
permalink: /en/probability/distributions
order: 1
mathjax: true
description: "Bernoulli, binomial, Poisson, normal, exponential and uniform distributions: formulas, mean, variance, worked examples and Julia code."
---

**Probability distributions** are mathematical functions that describe the probability of the different outcomes of a random variable. They are fundamental in statistics and data science, letting us model and understand random phenomena in many fields.

The examples on this page use **illustrative numbers**, chosen so that the arithmetic is easy to check by hand. The Julia code in each section generates the corresponding figure.

<div style="border-left: 4px solid #4CAF50; padding: 0.5em; background-color: #e8f5e9;">
  <strong>📊 Important:</strong> choosing the right distribution is essential for a <strong>correct statistical analysis</strong>.<br>
  Each distribution has <em>specific assumptions and applications</em> that must be taken into account.
</div>

---

## Symbols and Core Concepts

### Random Variables

- **Discrete random variable**: takes values in a finite or countably infinite set (one that can be listed: 0, 1, 2, …).
  - Example: the number of customers in a queue, the number of accidents per day.

- **Continuous random variable**: takes values in an interval of real numbers.
  - Example: weight, height, waiting time.

### Probability Functions

- **Probability mass function (PMF, discrete)**: $P(X = x_i) = p_i$
- **Probability density function (PDF, continuous)**: $f(x)$ such that $P(a \leq X \leq b) = \int_a^b f(x)\,dx$
- **Cumulative distribution function (CDF)**: $F(x) = P(X \leq x)$

Throughout the page, $\mu$ is the mean (the expected value) and $\sigma^2$ is the variance of the distribution; $\sigma$ is the standard deviation.

---

## 1. Discrete Distributions

### 1.1 Bernoulli Distribution

Models an experiment with only two possible outcomes, called success ($X = 1$) and failure ($X = 0$).

#### Parameters
- $p$: probability of success ($0 \leq p \leq 1$)

#### Probability Mass Function
$$P(X = x) = p^x(1-p)^{1-x}, \quad x \in \{0, 1\}$$

#### Mean and Variance
- Mean: $\mu = p$
- Variance: $\sigma^2 = p(1-p)$

#### Applications
- Modeling success/failure
- Binary tests (e.g., a part passes or fails quality control)

<div style="border-left: 4px solid #2196F3; padding: 0.5em; background-color: #e3f2fd; margin: 1em 0;">
  <strong>💡 Example</strong><br>
  A biased coin lands heads (success, $X = 1$) with probability $p = 0.6$. What are the probabilities of each outcome, the mean and the variance?
</div>

#### Solving it by hand

**Data:** $p = 0.6$ (given) and therefore $1 - p = 1 - 0.6 = 0.4$.

**Formula:** $P(X = x) = p^x(1-p)^{1-x}$, with $x = 0$ or $x = 1$.

**Substitution and arithmetic**, one probability at a time:

$$P(X = 1) = 0.6^{1} \cdot 0.4^{0} = 0.6 \cdot 1 = 0.6$$

$$P(X = 0) = 0.6^{0} \cdot 0.4^{1} = 1 \cdot 0.4 = 0.4$$

$$\mu = p = 0.6$$

$$\sigma^2 = p(1-p) = 0.6 \cdot 0.4 = 0.24$$

**Interpretation:** over many tosses, about 60% will be heads. The mean 0.6 is not a possible outcome of a single toss, which can only be 0 or 1: it is the long-run proportion of heads.

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

# X = 1 for heads (success) and X = 0 for tails; P(heads) = 0.6
p = 0.6
d = Bernoulli(p)

# Exact probability of each outcome
probs = pdf.(d, [0, 1])
println("P(X = 0) = ", probs[1])
println("P(X = 1) = ", probs[2])
println("Mean = ", mean(d), "   Variance = ", round(var(d), digits = 4))

# Round the labels shown on the chart
rounded(x) = string(round(x, digits = 2))

bar([0, 1], probs;
    legend = false,
    title = "Bernoulli distribution (p = 0.6)",
    xlabel = "Outcome of the toss",
    ylabel = "Probability P(X = x)",
    xticks = ([0, 1], ["Tails (X = 0)", "Heads (X = 1)"]),
    ylims = (0, 0.75), yformatter = rounded,
    color = :steelblue, alpha = 0.7, lw = 0, bar_width = 0.5)
annotate!([(x, pr + 0.03, text(rounded(pr), 10)) for (x, pr) in zip([0, 1], probs)])
savefig("bernoulli_histogram_en.png")</code></pre>
  </div>
</div>

#### Expected output:
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <div>P(X = 0) = 0.4</div>
  <div>P(X = 1) = 0.6</div>
  <div>Mean = 0.6   Variance = 0.24</div>
</div>

![Bar chart of the Bernoulli distribution with p = 0.6: a bar of 0.4 for tails and 0.6 for heads]({{ site.baseurl }}/assets/images/bernoulli_histogram_en.png)
<div class="image-caption">Figure 1: Bernoulli probabilities with p = 0.6: P(X = 0) = 0.4 (tails) and P(X = 1) = 0.6 (heads).</div>

### 1.2 Binomial Distribution

Models the number of successes in $n$ **independent** Bernoulli trials, all with the same probability of success $p$.

#### Parameters
- $n$: number of trials
- $p$: probability of success on each trial ($0 \leq p \leq 1$)

#### Probability Mass Function
$$P(X = k) = C(n,k) \cdot p^k (1-p)^{n-k}, \quad k = 0, 1, 2, \ldots, n$$

where $C(n,k) = \frac{n!}{k!(n-k)!}$ is the binomial coefficient: the number of ways to choose which of the $n$ trials are the $k$ successes.

#### Mean and Variance
- Mean: $\mu = np$
- Variance: $\sigma^2 = np(1-p)$

#### Applications
- Quality control (defective parts in a batch)
- Opinion polls (how many respondents say "yes")
- Multiple-choice tests (correct answers by guessing)

<div style="border-left: 4px solid #2196F3; padding: 0.5em; background-color: #e3f2fd; margin: 1em 0;">
  <strong>💡 Example</strong><br>
  A fair coin is tossed 10 times. What is the probability of getting exactly 5 heads?
</div>

#### Solving it by hand

**Data** (given): $n = 10$ tosses, $p = 0.5$ (fair coin) and $k = 5$ heads. Hence $1 - p = 0.5$ and $n - k = 10 - 5 = 5$.

**Condition:** the tosses are independent and $p$ is the same in all of them, so the binomial model applies.

**Formula:** $P(X = k) = C(n,k) \cdot p^k (1-p)^{n-k}$.

**Substitution:**

$$P(X = 5) = C(10, 5) \cdot 0.5^{5} \cdot 0.5^{5}$$

**Arithmetic**, one step per line. First the binomial coefficient:

$$C(10, 5) = \frac{10!}{5! \cdot 5!} = \frac{3{,}628{,}800}{120 \cdot 120} = \frac{3{,}628{,}800}{14{,}400} = 252$$

Then the powers and the product:

$$0.5^{5} = 0.03125$$

$$0.5^{5} \cdot 0.5^{5} = 0.03125 \cdot 0.03125 = 0.0009765625$$

$$P(X = 5) = 252 \cdot 0.0009765625 = 0.24609375$$

**Result:** $P(X = 5) = 0.24609375 \approx 0.2461$ (four decimal places).

Mean and variance of the number of heads:

$$\mu = np = 10 \cdot 0.5 = 5 \qquad \sigma^2 = np(1-p) = 10 \cdot 0.5 \cdot 0.5 = 2.5 \qquad \sigma = \sqrt{2.5} \approx 1.5811$$

**Interpretation:** even with a fair coin, exactly 5 heads in 10 tosses happens in only about 1 out of every 4 sequences (24.61%). The value 5 is the most likely one and it is the mean, but it is far from guaranteed.

<div style="border-left: 4px solid #ff9800; padding: 0.5em; background-color: #fff3e0; margin: 1em 0;">
  <strong>⚠️ Normal approximation to the binomial</strong><br>
  When $n$ is large, the binomial can be approximated by a normal with the same mean $np$ and the same standard deviation $\sqrt{np(1-p)}$. The usual rule of thumb asks for $np \geq 5$ and $n(1-p) \geq 5$; here $np = 5$ and $n(1-p) = 5$, right at the limit. Since the binomial only takes whole numbers, we use the <strong>continuity correction</strong>: the value 5 becomes the interval from 4.5 to 5.5. The code below does this calculation and gets 0.2482, close to the exact value 0.2461. When $np$ or $n(1-p)$ is below 5, the approximation gets worse; in that case, use the exact binomial.
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

# Number of heads in 10 tosses of a fair coin
n, p = 10, 0.5
d_bin = Binomial(n, p)

# Exact probability of exactly 5 heads
println("Exact P(X = 5) = ", round(pdf(d_bin, 5), digits = 4))

# Normal with the same mean (np) and the same standard deviation (√(np(1 − p)))
μ = n * p
σ = sqrt(n * p * (1 - p))
d_normal = Normal(μ, σ)   # Normal(μ, σ) takes the standard deviation, not the variance

# Continuity correction: the whole number 5 becomes the interval from 4.5 to 5.5
p5_approx = cdf(d_normal, 5.5) - cdf(d_normal, 4.5)
println("P(X = 5) from the normal, with continuity correction = ", round(p5_approx, digits = 4))

rounded(x) = string(round(x, digits = 2))

k = 0:n
bar(k, pdf.(d_bin, k);
    label = "Binomial (exact)",
    title = "Binomial (n = 10, p = 0.5) vs. normal",
    xlabel = "Number of heads (k)",
    ylabel = "Probability P(X = k)",
    xticks = k, ylims = (0, 0.3), yformatter = rounded,
    color = :steelblue, alpha = 0.6, lw = 0, bar_width = 0.8)
x_curve = range(0, n, length = 200)
plot!(x_curve, pdf.(d_normal, x_curve);
      lw = 2, color = :darkred, label = "Normal (μ = 5, σ ≈ 1.58)")
savefig("binomial_normal_approximation_en.png")</code></pre>
  </div>
</div>

#### Expected output:
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <div>Exact P(X = 5) = 0.2461</div>
  <div>P(X = 5) from the normal, with continuity correction = 0.2482</div>
</div>

![Bars of the binomial distribution with n = 10 and p = 0.5, with the curve of a normal with mean 5 on top]({{ site.baseurl }}/assets/images/binomial_normal_approximation_en.png)
<div class="image-caption">Figure 2: Binomial with n = 10 and p = 0.5 (bars) and the normal with μ = 5 and σ ≈ 1.58 (curve). The curve follows the tops of the bars closely.</div>

### 1.3 Poisson Distribution

Used to count how many events occur in a fixed interval of time or space, when the events happen independently of one another, at a constant average rate, and no two events occur at exactly the same instant.

#### Parameter
- $\lambda$: average number of occurrences in the interval ($\lambda > 0$)

#### Probability Mass Function
$$P(X = k) = \frac{e^{-\lambda} \lambda^k}{k!}, \quad k = 0, 1, 2, \ldots$$

#### Mean and Variance
- Mean: $\mu = \lambda$
- Variance: $\sigma^2 = \lambda$

#### Applications
- Number of calls to a call center per hour
- Number of accidents on a highway per month
- Number of typos per page

<div style="border-left: 4px solid #2196F3; padding: 0.5em; background-color: #e3f2fd; margin: 1em 0;">
  <strong>💡 Example</strong><br>
  A call center receives 5 calls per hour on average ($\lambda = 5$). What is the probability of exactly 3 calls arriving in one hour?
</div>

#### Solving it by hand

**Data** (given): $\lambda = 5$ calls per hour and $k = 3$ calls.

**Condition:** the calls arrive independently and the average rate is the same throughout the hour.

**Formula:** $P(X = k) = \dfrac{e^{-\lambda} \lambda^k}{k!}$.

**Substitution:**

$$P(X = 3) = \frac{e^{-5} \cdot 5^{3}}{3!}$$

**Arithmetic:**

$$5^{3} = 5 \cdot 5 \cdot 5 = 125$$

$$3! = 3 \cdot 2 \cdot 1 = 6$$

$$e^{-5} \approx 0.006737947 \quad \text{(calculator)}$$

$$e^{-5} \cdot 125 \approx 0.006737947 \cdot 125 = 0.842243$$

$$P(X = 3) \approx \frac{0.842243}{6} = 0.140374$$

**Result:** $P(X = 3) \approx 0.1404$ (four decimal places).

**Interpretation:** in about 14% of hours, exactly 3 calls arrive. In the Poisson distribution the mean and the variance are equal ($\lambda = 5$). If, in real data, the variance of the counts is much larger than the mean, the Poisson model probably does not fit (the events may not be independent, or the rate may vary).

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

# Calls arriving at a call center: 5 per hour on average
λ = 5
d = Poisson(λ)

println("P(X = 3) = ", round(pdf(d, 3), digits = 4))
println("Mean = ", mean(d), "   Variance = ", var(d))

rounded(x) = string(round(x, digits = 2))

k = 0:15
bar(k, pdf.(d, k);
    label = "P(X = k)",
    title = "Poisson distribution (λ = 5)",
    xlabel = "Number of calls in one hour (k)",
    ylabel = "Probability P(X = k)",
    xticks = k, ylims = (0, 0.2), yformatter = rounded,
    color = :steelblue, alpha = 0.6, lw = 0, bar_width = 0.8)
vline!([λ]; ls = :dash, lw = 2, color = :darkred, label = "Mean λ = 5")
savefig("poisson_distribution_en.png")</code></pre>
  </div>
</div>

#### Expected output:
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <div>P(X = 3) = 0.1404</div>
  <div>Mean = 5.0   Variance = 5.0</div>
</div>

![Bar chart of the Poisson distribution with λ = 5, peaking at 4 and 5 calls, with a dashed line at the mean]({{ site.baseurl }}/assets/images/poisson_distribution_en.png)
<div class="image-caption">Figure 3: Poisson probabilities with λ = 5. The dashed line marks the mean; 4 and 5 calls are the most likely values.</div>

<div style="border-left: 4px solid #9c27b0; padding: 0.5em; background-color: #f3e5f5; margin: 1em 0;">
  <strong>🔍 Historical Note</strong><br>
  The distribution is named after Siméon Denis Poisson, who discussed it in 1837 in his book <em>Recherches sur la probabilité des jugements en matière criminelle et en matière civile</em>. Stigler (1982) translates Poisson's whole discussion of the distribution into English and points out its relation to earlier work by Abraham de Moivre.
</div>

---

## 2. Continuous Distributions

### 2.1 Normal (Gaussian) Distribution

The most widely used distribution in statistics, with a symmetric bell shape.

#### Parameters
- $\mu$: mean (location of the peak)
- $\sigma$: standard deviation (width of the curve, $\sigma > 0$)

The notation $N(\mu, \sigma^2)$ uses the **variance** $\sigma^2$, while Julia's `Normal(μ, σ)` takes the **standard deviation** $\sigma$.

#### Probability Density Function
$$f(x) = \frac{1}{\sqrt{2\pi\sigma^2}} e^{-\frac{(x-\mu)^2}{2\sigma^2}}$$

#### Properties
- Symmetric about the mean: $f(\mu + t) = f(\mu - t)$ for every $t$
- Mean = median = mode = $\mu$
- About 68% of the probability lies between $\mu - \sigma$ and $\mu + \sigma$ (to more places, 68.27%)
- About 95% lies between $\mu - 2\sigma$ and $\mu + 2\sigma$ (95.45%)
- About 99.7% lies between $\mu - 3\sigma$ and $\mu + 3\sigma$ (99.73%)

#### Applications
- Adult height and weight (approximately)
- Measurement errors
- Means of large samples (by the [Central Limit Theorem]({{ '/en/probability/central-limit-theorem' | relative_url }}))

<div style="border-left: 4px solid #2196F3; padding: 0.5em; background-color: #e3f2fd; margin: 1em 0;">
  <strong>💡 Example</strong><br>
  The heights in a population roughly follow a normal with $\mu = 170$ cm and $\sigma = 10$ cm. What proportion of people are taller than 185 cm?
</div>

#### Solving it by hand

**Data** (given): $\mu = 170$ cm, $\sigma = 10$ cm and the cutoff $x = 185$ cm.

**Formula:** the Z-score says how many standard deviations a value lies above the mean:

$$Z = \frac{X - \mu}{\sigma}$$

and, by the complement rule, $P(X > x) = 1 - P(X \leq x) = 1 - P(Z \leq z)$.

**Substitution:**

$$z = \frac{185 - 170}{10}$$

**Arithmetic:**

$$185 - 170 = 15$$

$$z = \frac{15}{10} = 1.5$$

$$P(Z \leq 1.5) = 0.9332 \quad \text{(Z table)}$$

$$P(X > 185) = 1 - 0.9332 = 0.0668$$

**Result:** $P(X > 185) \approx 0.0668$, that is, 6.68%.

**Interpretation:** about 6.7% of the people in this population are taller than 185 cm, roughly 1 in 15. This holds only as long as the normal model describes heights well: real data often depart from the normal in the tails, where the very tall and very short values are.

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

# Heights: mean 170 cm and standard deviation 10 cm (illustrative numbers)
μ, σ = 170, 10
d = Normal(μ, σ)   # Normal(μ, σ) takes the standard deviation σ, not the variance σ²

# P(X &gt; 185) = 1 − P(X ≤ 185)
println("P(X &gt; 185) = ", round(1 - cdf(d, 185), digits = 4))

# Probability within 1, 2 and 3 standard deviations of the mean
for k in 1:3
    prob = cdf(d, μ + k * σ) - cdf(d, μ - k * σ)
    println("P(μ − $(k)σ ≤ X ≤ μ + $(k)σ) = ", round(prob, digits = 4))
end

rounded(x) = string(round(x, digits = 3))

x = 130:0.1:210
plot(x, pdf.(d, x);
     lw = 2, color = :steelblue, label = "Density f(x)",
     title = "Normal distribution (μ = 170 cm, σ = 10 cm)",
     xlabel = "Height (cm)",
     ylabel = "Probability density",
     yformatter = rounded)
x_tail = 185:0.1:210
plot!(x_tail, pdf.(d, x_tail);
      fillrange = 0, fillalpha = 0.4, color = :darkred, lw = 0, label = "P(X &gt; 185)")
vline!([μ]; ls = :dash, color = :black, label = "μ = 170")
savefig("normal_distribution_en.png")</code></pre>
  </div>
</div>

#### Expected output:
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <div>P(X &gt; 185) = 0.0668</div>
  <div>P(μ − 1σ ≤ X ≤ μ + 1σ) = 0.6827</div>
  <div>P(μ − 2σ ≤ X ≤ μ + 2σ) = 0.9545</div>
  <div>P(μ − 3σ ≤ X ≤ μ + 3σ) = 0.9973</div>
</div>

![Normal curve with mean 170 cm and standard deviation 10 cm, with the tail above 185 cm shaded]({{ site.baseurl }}/assets/images/normal_distribution_en.png)
<div class="image-caption">Figure 4: Normal with μ = 170 cm and σ = 10 cm. The shaded area is P(X > 185) ≈ 0.0668.</div>

### 2.2 Exponential Distribution

Models the time until the next event when events follow a Poisson process (independent, at a constant rate $\lambda$).

#### Parameter
- $\lambda$: rate of occurrence, in events per unit of time ($\lambda > 0$)

#### Density and Cumulative Distribution Function
$$f(x) = \lambda e^{-\lambda x}, \quad x \geq 0$$

$$F(x) = P(X \leq x) = 1 - e^{-\lambda x}, \quad x \geq 0$$

#### Mean and Variance
- Mean: $\mu = 1/\lambda$
- Variance: $\sigma^2 = 1/\lambda^2$

#### Applications
- Time between phone calls
- Lifetime of electronic components that do not wear out with use
- Waiting time in queues

<div style="border-left: 4px solid #ff9800; padding: 0.5em; background-color: #fff3e0; margin: 1em 0;">
  <strong>⚠️ Watch the parameterization</strong><br>
  Some books and software describe the exponential by its <strong>rate</strong> $\lambda$; others by its <strong>scale</strong> $\theta = 1/\lambda$, which is the mean itself. In Julia, <code>Exponential(θ)</code> takes the scale: <code>Exponential(2)</code> has mean 2, that is, $\lambda = 0.5$. In R, <code>rexp(n, rate)</code> takes the rate; in SciPy, the argument is <code>scale</code>.
</div>

<div style="border-left: 4px solid #2196F3; padding: 0.5em; background-color: #e3f2fd; margin: 1em 0;">
  <strong>💡 Example</strong><br>
  Customers arrive at a bank at a rate of $\lambda = 0.5$ customer per minute. What is the probability that the next customer arrives within 2 minutes?
</div>

#### Solving it by hand

**Data** (given): $\lambda = 0.5$ per minute and $x = 2$ minutes.

**Formula:** $P(X \leq x) = F(x) = 1 - e^{-\lambda x}$.

**Substitution:**

$$P(X \leq 2) = 1 - e^{-0.5 \cdot 2}$$

**Arithmetic:**

$$0.5 \cdot 2 = 1$$

$$e^{-1} \approx 0.367879 \quad \text{(calculator)}$$

$$P(X \leq 2) \approx 1 - 0.367879 = 0.632121$$

**Result:** $P(X \leq 2) \approx 0.6321$ (four decimal places).

Mean and variance of the waiting time:

$$\mu = \frac{1}{\lambda} = \frac{1}{0.5} = 2 \text{ min} \qquad \sigma^2 = \frac{1}{\lambda^2} = \frac{1}{0.25} = 4 \text{ min}^2 \qquad \sigma = 2 \text{ min}$$

**Interpretation:** about 63% of the time the next customer arrives within 2 minutes, even though 2 minutes is the mean waiting time. That happens because the distribution is skewed: there are many short waits and a few long ones, which pull the mean up. The median, computed by the code below, is about 1.39 minutes. The model does not fit when the rate changes over time (for example, at rush hour).

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

# Customers arrive at a rate of λ = 0.5 per minute
λ = 0.5
# Watch out: in Julia, Exponential(θ) takes the SCALE θ = 1/λ (which is the mean), not the rate λ
d = Exponential(1 / λ)

println("Mean = ", mean(d), " min   Variance = ", var(d), " min²")
println("Median = ", round(median(d), digits = 4), " min")
println("P(X ≤ 2) = ", round(cdf(d, 2), digits = 4))

rounded(x) = string(round(x, digits = 2))

x = 0:0.01:10
plot(x, pdf.(d, x);
     lw = 2, color = :steelblue, label = "Density f(x)",
     title = "Exponential distribution (λ = 0.5 per minute)",
     xlabel = "Time until the next arrival (min)",
     ylabel = "Probability density",
     xformatter = rounded, yformatter = rounded)
x_upto2 = 0:0.01:2
plot!(x_upto2, pdf.(d, x_upto2);
      fillrange = 0, fillalpha = 0.4, color = :darkred, lw = 0, label = "P(X ≤ 2) ≈ 0.63")
vline!([mean(d)]; ls = :dash, color = :black, label = "Mean = 2 min")
savefig("exponential_distribution_en.png")</code></pre>
  </div>
</div>

#### Expected output:
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <div>Mean = 2.0 min   Variance = 4.0 min²</div>
  <div>Median = 1.3863 min</div>
  <div>P(X ≤ 2) = 0.6321</div>
</div>

![Decreasing curve of the exponential density with λ = 0.5, with the area from 0 to 2 minutes shaded and a dashed line at the 2-minute mean]({{ site.baseurl }}/assets/images/exponential_distribution_en.png)
<div class="image-caption">Figure 5: Exponential with λ = 0.5 per minute. The shaded area is P(X ≤ 2) ≈ 0.6321; the dashed line marks the mean, 2 minutes.</div>

### 2.3 Continuous Uniform Distribution

All intervals of the same length inside $[a, b]$ have the same probability.

#### Parameters
- $a$: lower bound
- $b$: upper bound ($a < b$)

#### Probability Density Function
$$f(x) = \frac{1}{b-a}, \quad a \leq x \leq b \qquad (\text{and } f(x) = 0 \text{ outside } [a, b])$$

For $a \leq c \leq d \leq b$:

$$P(c \leq X \leq d) = \frac{d - c}{b - a}$$

#### Mean and Variance
- Mean: $\mu = \frac{a+b}{2}$
- Variance: $\sigma^2 = \frac{(b-a)^2}{12}$

#### Applications
- Random number generation
- Modeling situations in which no value of the interval is more likely than another
- Computer simulations

<div style="border-left: 4px solid #2196F3; padding: 0.5em; background-color: #e3f2fd; margin: 1em 0;">
  <strong>💡 Example</strong><br>
  A number is drawn at random between 0 and 1. What is the probability that it falls between 0.2 and 0.5?
</div>

#### Solving it by hand

**Data** (given): $a = 0$, $b = 1$, $c = 0.2$ and $d = 0.5$.

**Formula:** $P(c \leq X \leq d) = \dfrac{d - c}{b - a}$.

**Substitution:**

$$P(0.2 \leq X \leq 0.5) = \frac{0.5 - 0.2}{1 - 0}$$

**Arithmetic:**

$$0.5 - 0.2 = 0.3$$

$$1 - 0 = 1$$

$$P(0.2 \leq X \leq 0.5) = \frac{0.3}{1} = 0.3$$

Mean and variance:

$$\mu = \frac{0 + 1}{2} = 0.5 \qquad \sigma^2 = \frac{(1 - 0)^2}{12} = \frac{1}{12} \approx 0.0833$$

**Interpretation:** 30% of the draws fall between 0.2 and 0.5, exactly the fraction of the interval [0, 1] that this stretch covers. In a continuous distribution, the probability of an exact value (such as $X = 0.3$) is zero: only intervals have positive probability.

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

# A number drawn at random between 0 and 1
a, b = 0, 1
d = Uniform(a, b)

println("Mean = ", mean(d), "   Variance = ", round(var(d), digits = 4))
println("P(0.2 ≤ X ≤ 0.5) = ", round(cdf(d, 0.5) - cdf(d, 0.2), digits = 4))

rounded(x) = string(round(x, digits = 2))

x = -0.5:0.001:1.5
plot(x, pdf.(d, x);
     lw = 2, color = :steelblue, label = "Density f(x)",
     title = "Continuous uniform distribution on [0, 1]",
     xlabel = "Value of x",
     ylabel = "Probability density",
     ylims = (0, 1.3), xformatter = rounded, yformatter = rounded)
x_band = 0.2:0.001:0.5
plot!(x_band, pdf.(d, x_band);
      fillrange = 0, fillalpha = 0.4, color = :darkred, lw = 0, label = "P(0.2 ≤ X ≤ 0.5) = 0.3")
savefig("uniform_distribution_en.png")</code></pre>
  </div>
</div>

#### Expected output:
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <div>Mean = 0.5   Variance = 0.0833</div>
  <div>P(0.2 ≤ X ≤ 0.5) = 0.3</div>
</div>

![Uniform density constant at 1 between 0 and 1, with the band from 0.2 to 0.5 shaded]({{ site.baseurl }}/assets/images/uniform_distribution_en.png)
<div class="image-caption">Figure 6: Continuous uniform on [0, 1]. The density is 1 on the interval and 0 outside it; the shaded area is P(0.2 ≤ X ≤ 0.5) = 0.3.</div>

---

## 3. How Do You Choose the Right Distribution?

1. **Identify the type of variable**: discrete or continuous?
2. **Look at the domain of the data**: which values are possible? (Whole numbers only? Positive only? Bounded to an interval?)
3. **Check the shape of the data**: symmetric, skewed, heavy-tailed?
4. **Consider the phenomenon**: does the process that generates the data match the conditions of the model (independence, constant rate, fixed number of trials)?
5. **Use goodness-of-fit tests and plots**:
   - Chi-square goodness-of-fit test
   - Kolmogorov-Smirnov test
   - Anderson-Darling test
   - Q-Q plots

<div style="border-left: 4px solid #ff9800; padding: 0.5em; background-color: #fff3e0; margin: 1em 0;">
  <strong>⚠️ Mind the assumptions!</strong><br>
  Choosing the wrong distribution can lead to <em>misleading conclusions</em>. Always check the assumptions before drawing inferences. And remember that a goodness-of-fit test that does not reject the model does not prove the model is right: it only says the data do not contradict it.
</div>

---

## 4. Practical Applications

### Engineering
- Quality control (normal distribution)
- System reliability (exponential and Weibull distributions)
- Counting failures or arrivals (Poisson distribution)

### Finance
- Risk modeling (normal and Student's t distributions, the latter with heavier tails)
- Option pricing (log-normal distribution, in the Black-Scholes model)

### Natural Sciences
- Physics: Brownian motion (normal distribution)
- Physics: time until a radioactive atom decays (exponential distribution)
- Biology: number of mutations or of bacterial colonies on a plate (Poisson distribution)

### Social Sciences
- Opinion polls (binomial distribution)
- Psychometrics (normal distribution)

---

## References

1. Bussab, W. O.; Morettin, P. A. (2023). *Estatística Básica*. 10th ed. Saraiva Uni. (in Portuguese)
2. Montgomery, D. C.; Runger, G. C. (2021). *Estatística Aplicada e Probabilidade para Engenheiros*. 7th ed. LTC. (in Portuguese; translation of *Applied Statistics and Probability for Engineers*)
3. Stigler, S. M. (1982). Poisson on the Poisson distribution. *Statistics & Probability Letters*, 1(1), 33–35. DOI: [10.1016/0167-7152(82)90010-4](https://doi.org/10.1016/0167-7152%2882%2990010-4).
4. Triola, M. F. (2024). *Introdução à Estatística*. 14th ed. LTC. (in Portuguese; translation of *Elementary Statistics*)
