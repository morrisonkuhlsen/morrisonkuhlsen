---
layout: page
title: Random Variables
lang: en
ref: variaveis-aleatorias
parent: probabilidade
permalink: /en/probability/random-variables
order: 2
mathjax: true
description: "Functions that assign numerical values to the outcomes of a random experiment."
---

A **random variable** is a function that assigns a real number to each possible outcome of a random experiment. This concept is fundamental in probability and statistics, because it lets us analyze random phenomena mathematically.

<div style="border-left: 4px solid #4CAF50; padding: 0.5em; background-color: #e8f5e9;">
  <strong>📊 Important:</strong> understanding random variables is essential to the <strong>study of probability</strong>.<br>
  They are the basis for understanding <em>probability distributions</em> and making <em>statistical inferences</em>.
</div>

---

## 1. Types of Random Variables

### 1.1 Discrete Random Variables

These take values in a countable set (finite or countably infinite).

#### Characteristics
- Isolated values
- Can be counted
- Described by a probability mass function

#### Examples
- The face that comes up on a die
- The number of customers in a queue
- The number of defects in a batch

<div style="border-left: 4px solid #2196F3; padding: 0.5em; background-color: #e3f2fd; margin: 1em 0;">
  <strong>💡 Worked Example</strong><br>
  Rolling a die: X = the number on the top face<br>
  Possible values: {1, 2, 3, 4, 5, 6}
</div>

### 1.2 Continuous Random Variables

These take values in an interval of the real numbers.

#### Characteristics
- Values in a continuous interval
- Cannot be counted, only measured
- Described by a probability density function

#### Examples
- A person's height
- The waiting time for a service
- The temperature on a given day

<div style="border-left: 4px solid #2196F3; padding: 0.5em; background-color: #e3f2fd; margin: 1em 0;">
  <strong>💡 Worked Example</strong><br>
  Daily temperature: X = temperature in degrees Celsius<br>
  Possible values: [0°C, 40°C]
</div>

---

## 2. Probability Functions

### 2.1 Probability Mass Function (Discrete Case)

#### Definition
A function $p(x)$ is a probability mass function if:
1. $p(x) \geq 0$ for every $x$
2. $\sum_{x} p(x) = 1$
3. $P(X = x) = p(x)$

#### Example
For a fair die:
$$p(x) = \frac{1}{6}, \text{ for } x \in \{1,2,3,4,5,6\}$$

### 2.2 Probability Density Function (Continuous Case)

#### Definition
A function $f(x)$ is a probability density function if:
1. $f(x) \geq 0$ for every $x$
2. $\int_{-\infty}^{\infty} f(x)dx = 1$
3. $P(a \leq X \leq b) = \int_{a}^{b} f(x)dx$

<div style="border-left: 4px solid #9c27b0; padding: 0.5em; background-color: #f3e5f5; margin: 1em 0;">
  <strong>🔍 An Important Note</strong><br>
  For continuous random variables, the probability of any single value is always zero: $P(X = x) = 0$
</div>

---

## 3. Expectation and Variance

### 3.1 Expectation (Expected Value)

#### Discrete Case
For a fair die (faces 1 to 6), where every probability is the same:

$$E[X] = \sum_{i=1}^{6} x_i \cdot P(x_i) = \frac{1 + 2 + 3 + 4 + 5 + 6}{6} = 3.5$$

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Statistics

# Example: rolling a die
values = 1:6
probabilities = fill(1/6, 6)  # Same probability for every face

# Computing the expectation
expectation = sum(values .* probabilities)
println("Expectation (mean) of a die roll: ", expectation)

# Simulating rolls
n_rolls = 10000
rolls = rand(1:6, n_rolls)
empirical_mean = mean(rolls)

println("\nEmpirical mean after $n_rolls rolls: ", empirical_mean)</code></pre>
  </div>
</div>

#### Continuous Case
For a Normal distribution with mean μ and standard deviation σ:

$$E[X] = \mu = \int_{-\infty}^{\infty} x \cdot \frac{1}{\sqrt{2\pi\sigma^2}} e^{-\frac{(x-\mu)^2}{2\sigma^2}} dx$$

For μ = 10 and σ = 2:

$$E[X] = \int_{-\infty}^{\infty} x \cdot \frac{1}{\sqrt{2\pi(2)^2}} e^{-\frac{(x-10)^2}{2(2)^2}} dx$$

$$E[X] = \int_{-\infty}^{\infty} x \cdot \frac{1}{\sqrt{8\pi}} e^{-\frac{(x-10)^2}{8}} dx$$

$$E[X] = \mu = 10$$

<div style="border-left: 4px solid #2196F3; padding: 0.5em; background-color: #e3f2fd; margin: 1em 0;">
  <strong>💡 Note:</strong><br>
  The integral is solved using:
  - The change of variable y = (x-μ)/σ
  - The symmetry of the normal distribution
  - Properties of even and odd functions
</div>

In the Julia example, we use μ = 10 and σ = 2.

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

# Example: Normal distribution
μ = 10  # mean
σ = 2   # standard deviation
dist = Normal(μ, σ)

# Theoretical expected value
theoretical_expectation = mean(dist)
println("Theoretical expectation: ", theoretical_expectation)

# Simulation
n_samples = 10000
samples = rand(dist, n_samples)
empirical_mean = mean(samples)

println("\nEmpirical mean after $n_samples samples: ", empirical_mean)</code></pre>
  </div>
</div>

### 3.2 Variance

#### Definition
$$Var(X) = E[(X - E(X))^2] = E(X^2) - [E(X)]^2$$

#### Discrete Case (Die)
For a fair die:

$$Var(X) = E[(X - E[X])^2] = \sum_{i=1}^{6} (x_i - 3.5)^2 \cdot \frac{1}{6} = \frac{35}{12} \approx 2.917$$

#### Continuous Case (Normal)
For a Normal distribution:

$$Var(X) = \sigma^2 = \int_{-\infty}^{\infty} (x - \mu)^2 \cdot \frac{1}{\sqrt{2\pi\sigma^2}} e^{-\frac{(x-\mu)^2}{2\sigma^2}} dx$$

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

# Die example (discrete case)
values = 1:6
probabilities = fill(1/6, 6)

# Computing the theoretical variance
avg = sum(values .* probabilities)
theoretical_variance = sum((values .- avg).^2 .* probabilities)
println("Theoretical variance of the die: ", theoretical_variance)

# Simulation
n_rolls = 10000
rolls = rand(1:6, n_rolls)
empirical_variance = var(rolls)

println("\nEmpirical variance after $n_rolls rolls: ", empirical_variance)

# Normal distribution example (continuous case)
dist_normal = Normal(10, 2)
println("\nTheoretical variance of Normal(10,2): ", var(dist_normal))

normal_samples = rand(dist_normal, n_rolls)
println("Empirical variance of the normal samples: ", var(normal_samples))</code></pre>
  </div>
</div>

<div style="border-left: 4px solid #ff9800; padding: 0.5em; background-color: #fff3e0; margin: 1em 0;">
  <strong>⚠️ Tip:</strong><br>
  The variance measures the <em>spread</em> of the values around the mean. The larger the variance, the more spread out the values.
</div>

---

## 4. Functions of Random Variables

### 4.1 Transformations

If Y = g(X), where g is a function and X is a random variable:

#### Discrete Case
$$P(Y = y) = \sum_{x: g(x)=y} P(X = x)$$

#### Continuous Case
$$f_Y(y) = f_X(g^{-1}(y)) \cdot |\frac{d}{dy}g^{-1}(y)|$$

For Y = X², where X ~ N(0,1):

1) Density of the standard Normal (the original variable X):
$$f_X(x) = \frac{1}{\sqrt{2\pi}} e^{-x^2/2}, \quad -\infty < x < \infty$$

2) The transformation:
$$g(x) = x^2$$

3) The inverse function (two branches, because of the square):
$$g^{-1}(y) = \pm\sqrt{y}, \quad y \geq 0$$

4) Derivative of the inverse function:
$$\frac{d}{dy}g^{-1}(y) = \pm\frac{1}{2\sqrt{y}}$$

5) Absolute value of the derivative:
$$|\frac{d}{dy}g^{-1}(y)| = \frac{1}{2\sqrt{y}}$$

6) Applying the transformation formula to both branches:
$$f_Y(y) = f_X(\sqrt{y}) \cdot \frac{1}{2\sqrt{y}} + f_X(-\sqrt{y}) \cdot \frac{1}{2\sqrt{y}}$$

7) Substituting the normal density:
$$f_Y(y) = \frac{1}{\sqrt{2\pi}} e^{-(\sqrt{y})^2/2} \cdot \frac{1}{2\sqrt{y}} + \frac{1}{\sqrt{2\pi}} e^{-(-\sqrt{y})^2/2} \cdot \frac{1}{2\sqrt{y}}$$

8) Simplifying the exponential:
$$f_Y(y) = \frac{1}{\sqrt{2\pi}} e^{-y/2} \cdot \frac{1}{2\sqrt{y}} + \frac{1}{\sqrt{2\pi}} e^{-y/2} \cdot \frac{1}{2\sqrt{y}}$$

9) Combining the terms:
$$f_Y(y) = \frac{1}{\sqrt{2\pi}} e^{-y/2} \cdot \frac{1}{\sqrt{y}} = \frac{1}{\sqrt{2\pi y}} e^{-y/2}, \quad y > 0$$

10) Computing the Expectation:
$$E[Y] = E[X^2] = Var(X) + [E(X)]^2 = 1 + 0^2 = 1$$

11) Computing the Variance:
$$E[Y^2] = E[X^4] = 3$$
$$Var(Y) = E[Y^2] - (E[Y])^2 = 3 - 1^2 = 2$$

<div style="border-left: 4px solid #2196F3; padding: 0.5em; background-color: #e3f2fd; margin: 1em 0;">
  <strong>💡 Note:</strong><br>
  The resulting distribution of Y is known as the chi-square with 1 degree of freedom (χ²(1)).
  This transformation is fundamental in hypothesis tests and confidence intervals.
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

# Example: transforming a normal random variable
X = Normal(0, 1)  # Standard normal distribution
n_samples = 10000

# Generating samples of X
samples_x = rand(X, n_samples)

# Transformation Y = X² (chi-square with 1 degree of freedom)
samples_y = samples_x.^2

# Plotting the histograms
x_vals = -4:0.01:4  # Range for the theoretical PDF
p1 = histogram(samples_x, 
    bins=50, 
    normalize=:pdf,
    title="X ~ Normal(0,1)",
    label="Samples",
    color=:steelblue,
    lw=0,
    alpha=0.6)
plot!(p1, x_vals, pdf.(X, x_vals), lw=2, color=:darkred, label="Theoretical PDF")

p2 = histogram(samples_y, 
    bins=50, 
    normalize=:pdf,
    title="Y = X² ~ χ²(1)",
    label="Samples",
    color=:steelblue,
    lw=0,
    alpha=0.6)

# Plotting the two charts side by side
plot(p1, p2, layout=(1,2), size=(800,400))</code></pre>
  </div>
</div>

![Transforming a random variable]({{ site.baseurl }}/assets/images/distribuicoes.png)
<div class="image-caption">Figure 1: Transforming a normal random variable (left) into a chi-square (right)</div>

### 4.2 Simulating Random Variables

#### Binomial(n,p)
Probability mass function:

$$P(X = k) = \binom{n}{k}p^k(1-p)^{n-k}, \quad k = 0,1,...,n$$

For n = 10 and p = 0.3:

$$P(X = k) = \binom{10}{k}(0.3)^k(0.7)^{10-k}$$

$$E[X] = np = 10 \cdot 0.3 = 3$$

$$Var(X) = np(1-p) = 10 \cdot 0.3 \cdot 0.7 = 2.1$$

#### Normal(μ,σ)
Probability density function:

$$f(x) = \frac{1}{\sqrt{2\pi\sigma^2}} e^{-\frac{(x-\mu)^2}{2\sigma^2}}$$

For μ = 0 and σ = 1:

$$f(x) = \frac{1}{\sqrt{2\pi}} e^{-\frac{x^2}{2}}$$

$$E[X] = \mu = 0$$

$$Var(X) = \sigma^2 = 1$$

#### Exponential(λ)
Probability density function:

$$f(x) = \lambda e^{-\lambda x}, \quad x \geq 0$$

For λ = 2:

$$f(x) = 2e^{-2x}, \quad x \geq 0$$

$$E[X] = \frac{1}{\lambda} = \frac{1}{2}$$

$$Var(X) = \frac{1}{\lambda^2} = \frac{1}{4}$$

<div style="border-left: 4px solid #ff9800; padding: 0.5em; background-color: #fff3e0; margin: 1em 0;">
  <strong>⚠️ Watch the parameter:</strong><br>
  In Julia, <code>Exponential(θ)</code> takes the <em>scale</em> θ = 1/λ, not the rate λ. The <code>Exponential(2)</code> in the code below (and in Figure 2) therefore has λ = 1/2 and mean 2. For the λ = 2 above, use <code>Exponential(0.5)</code>.
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
    <pre><code>using Distributions, Plots, Random
using Measures

# Fixing the seed for reproducibility
Random.seed!(123)

# Simulating different kinds of random variables
n_samples = 1000

# 1. Discrete: Binomial
X_bin = Binomial(10, 0.3)
samples_bin = rand(X_bin, n_samples)

# 2. Continuous: Normal
X_norm = Normal(0, 1)
samples_norm = rand(X_norm, n_samples)

# 3. Continuous: Exponential (scale θ = 2, that is, λ = 1/2)
X_exp = Exponential(2)
samples_exp = rand(X_exp, n_samples)

# Building the subplots
p1 = histogram(samples_bin, 
    bins=11,
    normalize=:probability,
    color=:steelblue,
    alpha=0.6,
    lw=0,
    title="Binomial(10, 0.3)",
    label="Samples")

x_vals_norm = -4:0.01:4
p2 = histogram(samples_norm,
    bins=30,
    normalize=:pdf,
    color=:steelblue,
    alpha=0.6,
    lw=0,
    title="Normal(0, 1)",
    label="Samples")
plot!(p2, x_vals_norm, pdf.(X_norm, x_vals_norm), lw=2, color=:darkred, label="Theoretical PDF")

x_vals_exp = 0:0.01:4
p3 = histogram(samples_exp,
    bins=30,
    normalize=:pdf,
    color=:steelblue,
    alpha=0.6,
    lw=0,
    title="Exponential(2)",
    label="Samples")
plot!(p3, x_vals_exp, pdf.(X_exp, x_vals_exp), lw=2, color=:darkgreen, label="Theoretical PDF")

# Combining the plots
plot(p1, p2, p3, 
    layout=(1,3), 
    size=(1200,400),
    title="Simulating\nDifferent Random Variables",
    titlefontsize=11,
    top_margin=10mm
)</code></pre>
  </div>
</div>

![Simulating random variables]({{ site.baseurl }}/assets/images/variaveis_aleatorias.png)
<div class="image-caption">Figure 2: Simulating different kinds of random variables - Binomial (left), Normal (center) and Exponential (right)</div>

---

## 5. Practical Applications

### Engineering
- Quality control
- Reliability analysis
- Signal processing

### Finance
- Risk analysis
- Asset pricing
- Portfolio management

### Natural Sciences
- Quantum mechanics
- Genetics
- Population ecology

### Computing
- Machine Learning
- Simulations
- Algorithm analysis

<div style="border-left: 4px solid #2196F3; padding: 0.5em; background-color: #e3f2fd; margin: 1em 0;">
  <strong>💡 An Application</strong><br>
  In machine learning, random variables are used to model uncertainty and make probabilistic predictions.
</div>

---

## References

1. Ross, S. M. **Introduction to Probability Models**. 12th ed. Academic Press, 2019.
2. Papoulis, A.; Pillai, S. U. **Probability, Random Variables and Stochastic Processes**. 4th ed. McGraw-Hill, 2002.
3. Feller, W. **An Introduction to Probability Theory and Its Applications**. Vol. 1, 3rd ed. Wiley, 1968.
4. DeGroot, M. H.; Schervish, M. J. **Probability and Statistics**. 4th ed. Pearson, 2012.
5. Mood, A. M.; Graybill, F. A.; Boes, D. C. **Introduction to the Theory of Statistics**. 3rd ed. McGraw-Hill, 1974.
