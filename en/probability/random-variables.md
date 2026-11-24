---
layout: page
title: Random Variables
lang: en
ref: variaveis-aleatorias
parent: probabilidade
permalink: /en/probability/random-variables
order: 2
mathjax: true
description: "What a random variable is: discrete and continuous cases, expected value and variance with worked examples, transformations and simulation in Julia."
---

A **random variable** is a function that assigns a real number to each possible outcome of a random experiment. This concept is fundamental in probability and statistics, allowing random phenomena to be analyzed mathematically.

<div style="border-left: 4px solid #4CAF50; padding: 0.5em; background-color: #e8f5e9;">
  <strong>📊 Important:</strong> understanding random variables is essential for the <strong>study of probability</strong>.<br>
  They are the foundation for understanding <em>probability distributions</em> and making <em>statistical inferences</em>.
</div>

The Julia code on this page fixes the seed (`Random.seed!(123)`), so the simulations always give the same numbers.

---

## 1. Types of Random Variables

### 1.1 Discrete Random Variables

These take values in a countable set: finite or infinite, but able to be listed (0, 1, 2, …).

#### Characteristics
- Isolated values
- Can be counted
- Described by a probability mass function

#### Examples
- The number rolled on a die
- The number of customers in a queue
- The number of defects in a batch

<div style="border-left: 4px solid #2196F3; padding: 0.5em; background-color: #e3f2fd; margin: 1em 0;">
  <strong>💡 Example</strong><br>
  Rolling a die: $X$ = the number on the top face.<br>
  Possible values: $\{1, 2, 3, 4, 5, 6\}$.
</div>

### 1.2 Continuous Random Variables

These take values in an interval of the real numbers.

#### Characteristics
- Values in a continuous interval
- Cannot be counted, only measured
- Described by a probability density function

#### Examples
- A person's height
- Waiting time for a service
- The temperature on a given day

<div style="border-left: 4px solid #2196F3; padding: 0.5em; background-color: #e3f2fd; margin: 1em 0;">
  <strong>💡 Example</strong><br>
  The day's high temperature in a city: $X$ = temperature in degrees Celsius.<br>
  Possible values: any number in an interval, for example between 0 °C and 40 °C (an illustrative range), including 23.7 °C or 23.71 °C.
</div>

---

## 2. Probability Functions

### 2.1 Probability Mass Function (Discrete Case)

#### Definition
The probability mass function of a discrete variable $X$ is $p(x) = P(X = x)$. It must satisfy two conditions:
1. $p(x) \geq 0$ for every $x$
2. $\sum_{x} p(x) = 1$ (the sum over all possible values is 1)

#### Example
For a fair die:

$$p(x) = \frac{1}{6}, \quad x \in \{1, 2, 3, 4, 5, 6\}$$

Both conditions hold: each $p(x) = \frac{1}{6}$ is positive, and the sum of the six values is $6 \cdot \frac{1}{6} = 1$.

### 2.2 Probability Density Function (Continuous Case)

#### Definition
A function $f(x)$ is a probability density function if:
1. $f(x) \geq 0$ for every $x$
2. $\int_{-\infty}^{\infty} f(x)\,dx = 1$ (the total area under the curve is 1)

and, in that case, probabilities are areas under the curve:

$$P(a \leq X \leq b) = \int_{a}^{b} f(x)\,dx$$

<div style="border-left: 4px solid #9c27b0; padding: 0.5em; background-color: #f3e5f5; margin: 1em 0;">
  <strong>🔍 Important Note</strong><br>
  For a continuous random variable (one with a density), the probability of an exact value is always zero: $P(X = x) = 0$. Only intervals have positive probability. That is why, for a continuous variable, $P(a \leq X \leq b)$ and $P(a < X < b)$ are equal.
</div>

---

## 3. Expected Value and Variance

### 3.1 Expected Value

The **expected value** $E[X]$ is the mean of the values of $X$, each weighted by its probability. It is the long-run average: if the experiment is repeated many times, the mean of the results gets close to $E[X]$.

#### Discrete Case

$$E[X] = \sum_{x} x \cdot p(x)$$

**Example: a fair die.** Data: values $1, 2, \ldots, 6$, each with probability $\frac{1}{6}$ (section 2.1).

**Substitution:**

$$E[X] = 1 \cdot \tfrac{1}{6} + 2 \cdot \tfrac{1}{6} + 3 \cdot \tfrac{1}{6} + 4 \cdot \tfrac{1}{6} + 5 \cdot \tfrac{1}{6} + 6 \cdot \tfrac{1}{6}$$

**Arithmetic:** since every term has the factor $\frac{1}{6}$, it comes out of the sum:

$$E[X] = \frac{1 + 2 + 3 + 4 + 5 + 6}{6} = \frac{21}{6} = 3.5$$

**Interpretation:** 3.5 is not a face of the die; it is the long-run average. Over many rolls, the mean of the numbers rolled stays close to 3.5, as the simulation below shows.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Statistics, Random

Random.seed!(123)

# Fair die: faces 1 to 6, each with probability 1/6
values = 1:6
probabilities = fill(1 // 6, 6)   # exact fractions

# Expected value: sum of each value times its probability
expected = sum(values .* probabilities)
println("Exact expected value: ", expected, " = ", float(expected))

# Simulation: the mean of many rolls gets close to the expected value
n_rolls = 10_000
rolls = rand(1:6, n_rolls)
println("Mean of $n_rolls rolls: ", round(mean(rolls), digits = 4))</code></pre>
  </div>
</div>

#### Expected output:
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <div>Exact expected value: 7//2 = 3.5</div>
  <div>Mean of 10000 rolls: 3.5342</div>
</div>

#### Continuous Case

$$E[X] = \int_{-\infty}^{\infty} x \cdot f(x)\,dx$$

**Example: the normal distribution.** For a normal with mean $\mu$ and standard deviation $\sigma$:

$$E[X] = \int_{-\infty}^{\infty} x \cdot \frac{1}{\sqrt{2\pi\sigma^2}} e^{-\frac{(x-\mu)^2}{2\sigma^2}}\,dx$$

The integral comes out with the change of variable $z = \frac{x - \mu}{\sigma}$, that is, $x = \mu + \sigma z$ and $dx = \sigma\,dz$. Writing $\varphi(z) = \frac{1}{\sqrt{2\pi}} e^{-z^2/2}$ for the standard normal density:

$$E[X] = \int_{-\infty}^{\infty} (\mu + \sigma z)\,\varphi(z)\,dz = \mu \int_{-\infty}^{\infty} \varphi(z)\,dz + \sigma \int_{-\infty}^{\infty} z\,\varphi(z)\,dz$$

- The first integral is 1, because $\varphi$ is a density (total area 1).
- The second integral is 0, because $z\,\varphi(z)$ is an odd function: the area to the left of zero is negative and exactly cancels the area to the right.

$$E[X] = \mu \cdot 1 + \sigma \cdot 0 = \mu$$

So, for $\mu = 10$ and $\sigma = 2$, $E[X] = 10$.

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

μ = 10   # mean
σ = 2    # standard deviation
dist = Normal(μ, σ)   # Normal(μ, σ) takes the standard deviation, not the variance

println("Theoretical expected value: ", mean(dist))

# Simulation: the mean of many samples gets close to μ
n_samples = 10_000
samples = rand(dist, n_samples)
println("Mean of $n_samples samples: ", round(mean(samples), digits = 4))</code></pre>
  </div>
</div>

#### Expected output:
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <div>Theoretical expected value: 10.0</div>
  <div>Mean of 10000 samples: 9.9859</div>
</div>

### 3.2 Variance

The **variance** measures how much the values of $X$ spread around the expected value: it is the expected value of the squared distance to the mean.

#### Definition and shortcut

$$Var(X) = E\big[(X - E[X])^2\big] = E[X^2] - (E[X])^2$$

The second form (the "shortcut") holds whenever $E[X^2]$ is finite, and usually takes less arithmetic.

#### Discrete Case (Die)

**Data:** values $1, \ldots, 6$ with probability $\frac{1}{6}$ each, and $E[X] = 3.5$ (section 3.1).

**Route 1, by the definition.** Each deviation $x - 3.5$ and its square:

| $x$ | $x - 3.5$ | $(x - 3.5)^2$ |
|---|---|---|
| 1 | −2.5 | 6.25 |
| 2 | −1.5 | 2.25 |
| 3 | −0.5 | 0.25 |
| 4 | 0.5 | 0.25 |
| 5 | 1.5 | 2.25 |
| 6 | 2.5 | 6.25 |
| **Sum** | **0** | **17.5** |

Since each square has weight $\frac{1}{6}$:

$$Var(X) = \frac{17.5}{6} = \frac{35}{12} \approx 2.9167$$

**Route 2, by the shortcut.** First $E[X^2]$:

$$E[X^2] = \frac{1 + 4 + 9 + 16 + 25 + 36}{6} = \frac{91}{6}$$

$$Var(X) = \frac{91}{6} - 3.5^2 = \frac{91}{6} - \frac{49}{4} = \frac{182}{12} - \frac{147}{12} = \frac{35}{12}$$

Both routes give the same value: $Var(X) = \frac{35}{12} \approx 2.9167$, and the standard deviation is $\sqrt{35/12} \approx 1.7078$.

**Interpretation:** the outcomes of a die typically lie about 1.7 points above or below the mean of 3.5.

#### Continuous Case (Normal)

$$Var(X) = \int_{-\infty}^{\infty} (x - \mu)^2 \cdot \frac{1}{\sqrt{2\pi\sigma^2}} e^{-\frac{(x-\mu)^2}{2\sigma^2}}\,dx = \sigma^2$$

For $\mu = 10$ and $\sigma = 2$, the variance is $\sigma^2 = 2^2 = 4$.

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

# Fair die, with exact fractions
values = 1:6
probabilities = fill(1 // 6, 6)
mean_value = sum(values .* probabilities)

# Route 1: by the definition, E[(X − E[X])²]
var_definition = sum((values .- mean_value) .^ 2 .* probabilities)
# Route 2: by the shortcut, E[X²] − (E[X])²
var_shortcut = sum(values .^ 2 .* probabilities) - mean_value^2
println("Variance by the definition: ", var_definition, " ≈ ", round(float(var_definition), digits = 4))
println("Variance by the shortcut:   ", var_shortcut)

# Simulation (var uses n − 1 in the denominator: it is the sample variance)
rolls = rand(1:6, 10_000)
println("Sample variance of 10000 rolls: ", round(var(rolls), digits = 4))

# Normal with μ = 10 and σ = 2: the variance is σ² = 4
dist_normal = Normal(10, 2)
println("Theoretical variance of Normal(10, 2): ", var(dist_normal))
println("Sample variance of 10000 values: ", round(var(rand(dist_normal, 10_000)), digits = 4))</code></pre>
  </div>
</div>

#### Expected output:
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <div>Variance by the definition: 35//12 ≈ 2.9167</div>
  <div>Variance by the shortcut:   35//12</div>
  <div>Sample variance of 10000 rolls: 2.9285</div>
  <div>Theoretical variance of Normal(10, 2): 4.0</div>
  <div>Sample variance of 10000 values: 4.0288</div>
</div>

<div style="border-left: 4px solid #ff9800; padding: 0.5em; background-color: #fff3e0; margin: 1em 0;">
  <strong>⚠️ Variance of the distribution vs. variance of the sample</strong><br>
  $Var(X)$ is a property of the distribution (a calculation with the probabilities). Julia's <code>var</code> function, applied to simulated data, computes the <strong>sample variance</strong>, with $n - 1$ in the denominator: it is an estimate of $Var(X)$ that gets close to it with lots of data, but it is not equal to it.
</div>

---

## 4. Functions of Random Variables

### 4.1 Transformations

If $Y = g(X)$, where $g$ is a function and $X$ is a random variable, then $Y$ is also a random variable.

#### For Discrete Variables
Add up the probabilities of all the values of $X$ that lead to the same $y$:

$$P(Y = y) = \sum_{x:\, g(x) = y} P(X = x)$$

#### For Continuous Variables
When $g$ is **strictly monotonic** (always increasing or always decreasing) and its inverse $g^{-1}$ is differentiable, the density of $Y$ is:

$$f_Y(y) = f_X\big(g^{-1}(y)\big) \cdot \left|\frac{d}{dy}g^{-1}(y)\right|$$

If $g$ is not monotonic, split the domain into pieces where it is monotonic (the "branches") and add up the contribution of each branch, as in the example below.

**Example: $Y = X^2$, with $X \sim N(0, 1)$.** Here $g(x) = x^2$ is not monotonic (it goes down to 0 and then up), so we use two branches.

1) Standard normal density (the original variable $X$):

$$f_X(x) = \frac{1}{\sqrt{2\pi}} e^{-x^2/2}, \quad -\infty < x < \infty$$

2) Transformation:

$$g(x) = x^2$$

3) Inverse on each branch (for $y > 0$): on the branch $x > 0$, $x = \sqrt{y}$; on the branch $x < 0$, $x = -\sqrt{y}$.

4) Derivative of the inverse on each branch:

$$\frac{d}{dy}\sqrt{y} = \frac{1}{2\sqrt{y}} \qquad \frac{d}{dy}\big(-\sqrt{y}\big) = -\frac{1}{2\sqrt{y}}$$

5) Absolute value of the derivative (the same on both branches):

$$\left|\pm\frac{1}{2\sqrt{y}}\right| = \frac{1}{2\sqrt{y}}$$

6) Adding the contributions of the two branches:

$$f_Y(y) = f_X(\sqrt{y}) \cdot \frac{1}{2\sqrt{y}} + f_X(-\sqrt{y}) \cdot \frac{1}{2\sqrt{y}}$$

7) Substituting the normal density:

$$f_Y(y) = \frac{1}{\sqrt{2\pi}} e^{-(\sqrt{y})^2/2} \cdot \frac{1}{2\sqrt{y}} + \frac{1}{\sqrt{2\pi}} e^{-(-\sqrt{y})^2/2} \cdot \frac{1}{2\sqrt{y}}$$

8) Since $(\sqrt{y})^2 = (-\sqrt{y})^2 = y$, the two exponentials are equal:

$$f_Y(y) = \frac{1}{\sqrt{2\pi}} e^{-y/2} \cdot \frac{1}{2\sqrt{y}} + \frac{1}{\sqrt{2\pi}} e^{-y/2} \cdot \frac{1}{2\sqrt{y}}$$

9) The two terms are equal; added together, the $\frac{1}{2}$ disappears:

$$f_Y(y) = \frac{1}{\sqrt{2\pi}} e^{-y/2} \cdot \frac{1}{\sqrt{y}} = \frac{1}{\sqrt{2\pi y}} e^{-y/2}, \quad y > 0$$

10) Expected value of $Y$, using the variance shortcut backwards ($E[X^2] = Var(X) + (E[X])^2$) and the standard normal values $E[X] = 0$ and $Var(X) = 1$:

$$E[Y] = E[X^2] = Var(X) + (E[X])^2 = 1 + 0^2 = 1$$

11) Variance of $Y$. First $E[Y^2] = E[X^4]$. Since the derivative of $\varphi(x) = \frac{1}{\sqrt{2\pi}}e^{-x^2/2}$ is $\varphi'(x) = -x\,\varphi(x)$, integration by parts gives:

$$E[X^4] = \int_{-\infty}^{\infty} x^3 \cdot x\,\varphi(x)\,dx = \Big[-x^3 \varphi(x)\Big]_{-\infty}^{\infty} + 3\int_{-\infty}^{\infty} x^2\,\varphi(x)\,dx = 0 + 3 \cdot E[X^2] = 3 \cdot 1 = 3$$

(the bracketed term is zero because $x^3\varphi(x) \to 0$ as $x \to \pm\infty$). So:

$$Var(Y) = E[Y^2] - (E[Y])^2 = 3 - 1^2 = 2$$

<div style="border-left: 4px solid #2196F3; padding: 0.5em; background-color: #e3f2fd; margin: 1em 0;">
  <strong>💡 Note:</strong><br>
  The density obtained in step 9 is that of the <strong>chi-square distribution with 1 degree of freedom</strong>, $\chi^2(1)$, which has mean 1 and variance 2, as in steps 10 and 11. The chi-square shows up, for example, in the chi-square test and in the confidence interval for a variance.
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
    <pre><code>using Distributions, Statistics, Plots, Random

Random.seed!(123)

X = Normal(0, 1)   # standard normal
n_samples = 10_000
samples_x = rand(X, n_samples)

# Transformation Y = X²
samples_y = samples_x .^ 2

# Theory says E[Y] = 1 and Var(Y) = 2
println("Mean of Y in the samples:     ", round(mean(samples_y), digits = 4))
println("Variance of Y in the samples: ", round(var(samples_y), digits = 4))

rounded(x) = string(round(x, digits = 2))

x_vals = -4:0.01:4
p1 = histogram(samples_x; bins = 50, normalize = :pdf,
    title = "X ~ N(0, 1)", label = "Samples",
    color = :steelblue, lw = 0, alpha = 0.6, formatter = rounded)
plot!(p1, x_vals, pdf.(X, x_vals); lw = 2, color = :darkred, label = "Theoretical density")

# The chi-square density goes to infinity at 0; the curve starts at 0.05
y_vals = 0.05:0.01:8
p2 = histogram(samples_y; bins = 0:0.2:8, normalize = :pdf,
    title = "Y = X² ~ χ²(1)", label = "Samples",
    color = :steelblue, lw = 0, alpha = 0.6, xlims = (0, 8), ylims = (0, 1.5),
    formatter = rounded)
plot!(p2, y_vals, pdf.(Chisq(1), y_vals); lw = 2, color = :darkred, label = "Theoretical density")

plot(p1, p2; layout = (1, 2), size = (800, 400))
savefig("transformation_chi_square_en.png")</code></pre>
  </div>
</div>

#### Expected output:
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <div>Mean of Y in the samples:     0.9894</div>
  <div>Variance of Y in the samples: 2.0167</div>
</div>

![Two histograms: on the left, samples from the standard normal with the theoretical curve; on the right, the squares of those samples with the chi-square curve with 1 degree of freedom]({{ site.baseurl }}/assets/images/transformation_chi_square_en.png)
<div class="image-caption">Figure 1: Samples of X ~ N(0, 1) (left) and of Y = X² (right), with the theoretical densities of the standard normal and of χ²(1). The histograms follow the curves.</div>

### 4.2 Simulating Random Variables

Simulating means drawing many values from a distribution and comparing what comes out with the theory. Below are three examples.

#### Binomial(n, p)
Probability mass function:

$$P(X = k) = \binom{n}{k}p^k(1-p)^{n-k}, \quad k = 0, 1, \ldots, n$$

For $n = 10$ and $p = 0.3$:

$$P(X = k) = \binom{10}{k}(0.3)^k(0.7)^{10-k}$$

$$E[X] = np = 10 \cdot 0.3 = 3$$

$$Var(X) = np(1-p) = 10 \cdot 0.3 \cdot 0.7 = 2.1$$

#### Normal(μ, σ)
Probability density function:

$$f(x) = \frac{1}{\sqrt{2\pi\sigma^2}} e^{-\frac{(x-\mu)^2}{2\sigma^2}}$$

For $\mu = 0$ and $\sigma = 1$:

$$f(x) = \frac{1}{\sqrt{2\pi}} e^{-\frac{x^2}{2}}$$

$$E[X] = \mu = 0$$

$$Var(X) = \sigma^2 = 1$$

#### Exponential(λ)
Probability density function, with rate $\lambda > 0$:

$$f(x) = \lambda e^{-\lambda x}, \quad x \geq 0$$

For $\lambda = 2$:

$$f(x) = 2e^{-2x}, \quad x \geq 0$$

$$E[X] = \frac{1}{\lambda} = \frac{1}{2} = 0.5$$

$$Var(X) = \frac{1}{\lambda^2} = \frac{1}{4} = 0.25$$

<div style="border-left: 4px solid #ff9800; padding: 0.5em; background-color: #fff3e0; margin: 1em 0;">
  <strong>⚠️ Watch the exponential's parameterization</strong><br>
  In Julia, <code>Exponential(θ)</code> takes the <strong>scale</strong> $\theta = 1/\lambda$, which is the mean, not the rate $\lambda$. For $\lambda = 2$, the right call is <code>Exponential(1/2)</code>; <code>Exponential(2)</code> would have mean 2, that is, $\lambda = 0.5$. (An earlier version of this page had this mistake in its code.)
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
    <pre><code>using Distributions, Statistics, Plots, Random
using Measures

Random.seed!(123)
n_samples = 1_000

# 1. Discrete: binomial with n = 10 and p = 0.3
X_bin = Binomial(10, 0.3)
samples_bin = rand(X_bin, n_samples)

# 2. Continuous: standard normal
X_norm = Normal(0, 1)
samples_norm = rand(X_norm, n_samples)

# 3. Continuous: exponential with rate λ = 2
λ = 2
# Watch out: in Julia, Exponential(θ) takes the SCALE θ = 1/λ (the mean), not the rate λ
X_exp = Exponential(1 / λ)
samples_exp = rand(X_exp, n_samples)

for (name, dist, samples) in (("Binomial(10, 0.3)", X_bin, samples_bin),
                              ("Normal(0, 1)", X_norm, samples_norm),
                              ("Exponential(λ = 2)", X_exp, samples_exp))
    println(name, ": theoretical mean = ", round(mean(dist), digits = 4),
            "; sample mean = ", round(mean(samples), digits = 4),
            "; theoretical variance = ", round(var(dist), digits = 4),
            "; sample variance = ", round(var(samples), digits = 4))
end

rounded(x) = string(round(x, digits = 2))

# Binomial: observed proportion of each value vs. exact probability
k = 0:10
proportions = [count(==(i), samples_bin) / n_samples for i in k]
p1 = bar(k, proportions; label = "Samples", color = :steelblue, alpha = 0.6, lw = 0,
    title = "Binomial(10, 0.3)", xticks = k, ylims = (0, 0.32), yformatter = rounded)
scatter!(p1, k, pdf.(X_bin, k); color = :darkred, label = "Theoretical P(X = k)")

x_norm = -4:0.01:4
p2 = histogram(samples_norm; bins = 30, normalize = :pdf, color = :steelblue, alpha = 0.6,
    lw = 0, title = "Normal(0, 1)", label = "Samples", ylims = (0, 0.5), formatter = rounded)
plot!(p2, x_norm, pdf.(X_norm, x_norm); lw = 2, color = :darkred, label = "Theoretical density")

x_exp = 0:0.01:3
p3 = histogram(samples_exp; bins = 30, normalize = :pdf, color = :steelblue, alpha = 0.6,
    lw = 0, title = "Exponential(λ = 2)", label = "Samples",
    formatter = rounded)
plot!(p3, x_exp, pdf.(X_exp, x_exp); lw = 2, color = :darkred, label = "Theoretical density")

plot(p1, p2, p3; layout = (1, 3), size = (1200, 400), bottom_margin = 5mm, left_margin = 5mm)
savefig("simulating_random_variables_en.png")</code></pre>
  </div>
</div>

#### Expected output:
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <div>Binomial(10, 0.3): theoretical mean = 3.0; sample mean = 2.99; theoretical variance = 2.1; sample variance = 2.104</div>
  <div>Normal(0, 1): theoretical mean = 0.0; sample mean = -0.0316; theoretical variance = 1.0; sample variance = 0.9492</div>
  <div>Exponential(λ = 2): theoretical mean = 0.5; sample mean = 0.4834; theoretical variance = 0.25; sample variance = 0.2521</div>
</div>

![Three panels: simulated proportions of the binomial with n = 10 and p = 0.3 with the theoretical probabilities, a histogram of the standard normal and a histogram of the exponential with rate 2, both with the theoretical density]({{ site.baseurl }}/assets/images/simulating_random_variables_en.png)
<div class="image-caption">Figure 2: Simulating 1,000 values from each distribution: Binomial (left, simulated bars and theoretical points), Normal (center) and Exponential with λ = 2 (right), with the theoretical densities.</div>

**Interpretation:** with 1,000 draws, the sample means and variances are close to the theoretical ones but not equal (for example, 0.9492 versus 1 for the normal). The difference is the natural variation from sample to sample, and it shrinks as the number of draws grows.

---

## 5. Practical Applications

### Engineering
- Quality control
- Reliability analysis
- Signal processing

### Finance
- Risk analysis
- Asset pricing

### Natural Sciences
- Genetics
- Population ecology

### Computing
- Machine learning
- Simulations
- Analysis of algorithms

<div style="border-left: 4px solid #2196F3; padding: 0.5em; background-color: #e3f2fd; margin: 1em 0;">
  <strong>💡 Application Example</strong><br>
  In machine learning, random variables are used to model uncertainty and make probabilistic predictions.
</div>

For the most widely used distributions, with formulas and worked examples, see [Probability Distributions]({{ '/en/probability/distributions' | relative_url }}).

---

## References

1. Bussab, W. O.; Morettin, P. A. (2023). *Estatística Básica*. 10th ed. Saraiva Uni. (in Portuguese)
2. Papoulis, A.; Pillai, S. U. (2002). *Probability, Random Variables and Stochastic Processes*. 4th ed. McGraw-Hill.
3. Ross, S. M. (2019). *Introduction to Probability Models*. 12th ed. Academic Press.
