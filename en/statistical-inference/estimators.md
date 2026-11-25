---
layout: page
title: Estimators
lang: en
ref: estimadores
parent: inferencia-estatistica
permalink: /en/statistical-inference/estimators
order: 4
mathjax: true
description: "Estimators: bias, variance, mean squared error, likelihood, sufficiency, maximum likelihood and Cramér–Rao, in a worked example with Julia code."
---

![Illustration of a quality inspector weighing packages on a filling line]({{ site.baseurl }}/assets/images/estimadores.avif){:style="max-width: 600px; display: block; margin: 0 auto;"}

An **estimator** is a rule that uses the data in a sample to compute an approximate value for an unknown population parameter. This page shows how to judge whether an estimator is good and how to build one, following the whole path:

$$
\text{Data} \;\longrightarrow\; \text{Distribution} \;\longrightarrow\; \text{Likelihood} \;\longrightarrow\; \text{Sufficiency} \;\longrightarrow\; \text{Estimator} \;\longrightarrow\; \text{Inference} \;\longrightarrow\; \text{Decision}
$$

The guiding problem is the **quality control of package weights**, with illustrative numbers.

## 0. Estimator, Estimate, and What Makes an Estimator Good

An **estimator** $\hat{\theta}$ is a function of the sample $X_1, \ldots, X_n$ used to estimate a parameter $\theta$. Before the sample is drawn, it is a random variable; afterwards, the number computed from the data is the **estimate**. Examples:

- the sample mean $\bar{X} = \frac{1}{n}\sum X_i$ estimates the population mean $\mu$;
- the sample proportion $\hat{p}$ estimates the proportion $p$;
- the sample variance $s^2 = \frac{1}{n-1}\sum (X_i - \bar{X})^2$ estimates the variance $\sigma^2$ (the $n - 1$ divisor is what makes it unbiased; see [Measures of Dispersion]({{ '/en/descriptive-statistics/dispersion' | relative_url }})).

Since an estimator varies from sample to sample, it is judged by the distribution of its values:

- **Bias:** $\text{Bias}(\hat{\theta}) = E[\hat{\theta}] - \theta$. The estimator is **unbiased** when it hits the parameter on average.
- **Variance:** $\text{Var}(\hat{\theta})$, how much the estimates spread out from sample to sample.
- **Mean squared error (MSE):** the average squared distance between the estimate and the parameter, which combines the two:

$$
\text{MSE}(\hat{\theta}) = E\big[(\hat{\theta} - \theta)^2\big] = \text{Var}(\hat{\theta}) + \text{Bias}(\hat{\theta})^2
$$

That is why an estimator with a small bias can have a smaller MSE than an unbiased one, if its variance is much smaller. The following sections build an estimator for the mean of a normal distribution and show that it is the best possible among unbiased ones.

---

## 1. Stating the Statistical Problem

### 1.1 The Question

A company makes packages that, according to the specification, should contain **500 g** on average. The quality engineer wants to check whether the filling machine is calibrated.

> **Statistical question:** is the mean weight of the packages made by the machine 500 g?

### 1.2 Population Parameter

The parameter of interest is the **population mean** $\mu$:

$$
\mu = \mathbb{E}[X]
$$

where $X$ is the weight, in grams, of a package picked at random.

### 1.3 Context and Working Assumptions

- The weights vary around a central value.
- Production history gives a **process standard deviation** $\sigma = 5$ g, treated as known.
- A **simple random sample** of $n = 10$ packages was collected.
- Goal: decide whether the machine needs recalibrating.

---

## 2. Choosing the Distribution of the Data

### 2.1 Nature of the Data

The weights are **continuous variables**, the result of a physical process with many small sources of variation: machine vibration, product density, temperature and so on.

### 2.2 Why the Normal Distribution

- When a measurement is the sum of many small, independent effects, the [Central Limit Theorem]({{ '/en/probability/central-limit-theorem' | relative_url }}) suggests that it has an approximately normal distribution.
- Industrial processes under control usually vary symmetrically around the nominal value.
- Normality is a **model assumption**, which can be checked with a QQ plot or the Shapiro–Wilk test (with only 10 values, these diagnostics have little power).

We adopt: $X_i \sim \mathcal{N}(\mu, \sigma^2)$, with $\sigma^2 = 25$.

### 2.3 Reference Models

<div style="overflow-x:auto; margin: 1em 0;">
<table style="border-collapse: collapse; margin: 0 auto; min-width: 500px;">
  <thead style="background: #e3f2fd;">
    <tr>
      <th style="border: 1px solid #bbb; padding: 8px;">Type of data</th>
      <th style="border: 1px solid #bbb; padding: 8px;">Usual distribution</th>
      <th style="border: 1px solid #bbb; padding: 8px;">Parameter estimated</th>
    </tr>
  </thead>
  <tbody>
    <tr><td style="border: 1px solid #bbb; padding: 8px;">Binary (success/failure)</td><td style="border: 1px solid #bbb; padding: 8px;">Bernoulli / binomial</td><td style="border: 1px solid #bbb; padding: 8px;">Proportion $p$</td></tr>
    <tr><td style="border: 1px solid #bbb; padding: 8px;">Counts of events</td><td style="border: 1px solid #bbb; padding: 8px;">Poisson</td><td style="border: 1px solid #bbb; padding: 8px;">Rate $\lambda$</td></tr>
    <tr><td style="border: 1px solid #bbb; padding: 8px;">Symmetric continuous measurements</td><td style="border: 1px solid #bbb; padding: 8px;">Normal</td><td style="border: 1px solid #bbb; padding: 8px;">Mean $\mu$</td></tr>
    <tr><td style="border: 1px solid #bbb; padding: 8px;">Time until an event</td><td style="border: 1px solid #bbb; padding: 8px;">Exponential / Weibull</td><td style="border: 1px solid #bbb; padding: 8px;">Rate $\lambda$</td></tr>
  </tbody>
</table>
</div>

> **Model adopted:** $X_1, X_2, \ldots, X_n \overset{\text{iid}}{\sim} \mathcal{N}(\mu, \sigma^2)$, with $\sigma^2 = 25$ known ("iid": independent and identically distributed).

---

## 3. Building the Likelihood Function

### 3.1 Definition

The **likelihood function** $L(\mu \mid \mathbf{x})$ measures how compatible each value of $\mu$ is with the observed data $\mathbf{x} = (x_1, \ldots, x_n)$:

$$
L(\mu \mid \mathbf{x}) = \prod_{i=1}^{n} f(x_i;\, \mu)
$$

The formula is the same as the joint density, but it is read differently: the data stay fixed and $\mu$ varies. The likelihood is not a probability for $\mu$ (it does not sum or integrate to 1 over $\mu$).

### 3.2 Explicit Construction for the Normal

The density of each observation $X_i \sim \mathcal{N}(\mu, \sigma^2)$ is:

$$
f(x_i;\, \mu) = \frac{1}{\sigma\sqrt{2\pi}} \exp\!\left(-\frac{(x_i - \mu)^2}{2\sigma^2}\right)
$$

Since the observations are independent, the likelihood is the **product** of the densities:

$$
L(\mu \mid \mathbf{x})
= \prod_{i=1}^{n} \frac{1}{\sigma\sqrt{2\pi}} \exp\!\left(-\frac{(x_i - \mu)^2}{2\sigma^2}\right)
$$

The factor $\frac{1}{\sigma\sqrt{2\pi}}$ appears $n$ times, and a product of exponentials is the exponential of the sum ($e^a \cdot e^b = e^{a+b}$):

$$
L(\mu \mid \mathbf{x}) = \left(\frac{1}{\sigma\sqrt{2\pi}}\right)^{\!n} \exp\!\left(-\frac{1}{2\sigma^2}\sum_{i=1}^{n}(x_i - \mu)^2\right)
$$

### 3.3 Log-Likelihood

Since $\ln$ is strictly increasing, $L$ and $\ln L$ reach their maximum at the same point. The logarithm turns the product into a sum ($\ln(ab) = \ln a + \ln b$) and undoes the exponential ($\ln e^x = x$):

$$
\ell(\mu \mid \mathbf{x}) = \ln L(\mu \mid \mathbf{x})
= n\ln\!\left(\frac{1}{\sigma\sqrt{2\pi}}\right) - \frac{1}{2\sigma^2}\sum_{i=1}^n(x_i-\mu)^2
= -n\ln(\sigma\sqrt{2\pi}) - \frac{1}{2\sigma^2}\sum_{i=1}^n(x_i-\mu)^2
$$

The first term does not depend on $\mu$. Expanding the square, $(x_i - \mu)^2 = x_i^2 - 2\mu x_i + \mu^2$, and summing over $i$ (the sum of $n$ terms equal to $\mu^2$ is $n\mu^2$):

$$
\sum_{i=1}^n (x_i - \mu)^2 = \sum_{i=1}^n x_i^2 \;-\; 2\mu\sum_{i=1}^n x_i \;+\; n\mu^2
$$

$$
\ell(\mu \mid \mathbf{x}) = -n\ln(\sigma\sqrt{2\pi}) - \frac{1}{2\sigma^2}\left[\sum_{i=1}^{n}x_i^2 - 2\mu\sum_{i=1}^{n}x_i + n\mu^2\right]
$$

> The data enter $\ell$ only through $\sum x_i^2$ and $\sum x_i$, and $\sum x_i^2$ does not interact with $\mu$. All the dependence on $\mu$ goes through $\sum x_i$: that is what section 4 makes precise.

---

## 4. Sufficient Statistic

### 4.1 Definition

A statistic $T(\mathbf{X})$ is **sufficient** for $\mu$ if the conditional distribution of the sample, given $T(\mathbf{X}) = t$, does not depend on $\mu$. In words: once the value of $T$ is known, the individual data bring no further information about $\mu$ (within the model adopted).

### 4.2 The Neyman–Fisher Factorization Theorem

$T(\mathbf{X})$ is sufficient for $\mu$ if and only if the joint density can be written as

$$
f(\mathbf{x};\, \mu) = g\!\left(T(\mathbf{x}),\, \mu\right) \cdot h(\mathbf{x})
$$

where $g$ depends on the data only through $T(\mathbf{x})$, and $h$ does not depend on $\mu$.

### 4.3 Applying It to the Normal

Starting from $L(\mu \mid \mathbf{x})$ in section 3.2 and the expansion in section 3.3, the exponent splits into three terms (the second one has a positive sign: $-\frac{1}{2\sigma^2} \cdot (-2\mu\sum x_i) = +\frac{\mu\sum x_i}{\sigma^2}$):

$$
-\frac{1}{2\sigma^2}\sum_{i=1}^n(x_i-\mu)^2
= \underbrace{-\frac{\sum_{i=1}^n x_i^2}{2\sigma^2}}_{\text{data only}} + \underbrace{\frac{\mu}{\sigma^2}\sum_{i=1}^n x_i - \frac{n\mu^2}{2\sigma^2}}_{\text{data and } \mu}
$$

Using $e^{a+b} = e^a \cdot e^b$:

$$
L(\mu \mid \mathbf{x})
= \underbrace{\left(\frac{1}{\sigma\sqrt{2\pi}}\right)^n \exp\!\left(-\frac{\sum x_i^2}{2\sigma^2}\right)}_{h(\mathbf{x})\text{: does not depend on }\mu}
\cdot
\underbrace{\exp\!\left(\frac{\mu}{\sigma^2}\sum_{i=1}^n x_i - \frac{n\mu^2}{2\sigma^2}\right)}_{g(T(\mathbf{x}),\,\mu)\text{: depends on the data only through } T = \sum x_i}
$$

The factorization holds with $T(\mathbf{X}) = \sum_{i=1}^n X_i$. Since $\bar{X} = T/n$ is an invertible function of $T$, the **sample mean $\bar{X}$** is sufficient for $\mu$ as well.

### 4.4 What It Means in Practice

Once $\bar{x}$ is computed, the 10 individual values add nothing to inference about $\mu$ **within the normal model with known $\sigma$**. They remain useful for something else: checking the model itself (normality, outliers, the value of $\sigma$). Section 10.3 shows a case where this matters.

---

## 5. The Maximum Likelihood Estimator

### 5.1 The Principle

The **maximum likelihood estimator (MLE)** is the value of $\mu$ that makes the observed data most likely:

$$
\hat{\mu} = \arg\max_{\mu \in \mathbb{R}} \; \ell(\mu \mid \mathbf{x})
$$

### 5.2 Derivation

**Step 1, derivative.** The first term of $\ell$ does not depend on $\mu$. By the chain rule, $\frac{\partial}{\partial\mu}(x_i - \mu)^2 = 2(x_i - \mu)\cdot(-1) = -2(x_i - \mu)$. So:

$$
\frac{\partial \ell}{\partial \mu}
= -\frac{1}{2\sigma^2} \cdot \left[-2\sum_{i=1}^{n}(x_i - \mu)\right]
= \frac{1}{\sigma^2}\sum_{i=1}^{n}(x_i - \mu)
$$

**Step 2, set it to zero** (the score equation). Since $\sigma^2 > 0$, we can multiply by $\sigma^2$:

$$
\sum_{i=1}^{n}(x_i - \mu) = 0
\quad\Longrightarrow\quad
\sum_{i=1}^{n} x_i - n\mu = 0
\quad\Longrightarrow\quad
\hat{\mu} = \frac{1}{n}\sum_{i=1}^{n} x_i = \bar{x}
$$

**Step 3, check that it is a maximum.** The second derivative is

$$
\frac{\partial^2 \ell}{\partial \mu^2} = \frac{1}{\sigma^2}\sum_{i=1}^n (-1) = -\frac{n}{\sigma^2} < 0
$$

for every $\mu$: the log-likelihood is concave over the whole line, and $\bar{x}$ is the **unique global maximum**. (The same follows without derivatives: $\sum (x_i - \mu)^2 = \sum (x_i - \bar{x})^2 + n(\bar{x} - \mu)^2$, which is smallest only at $\mu = \bar{x}$.)

### 5.3 The Final Estimator

$$
\boxed{\hat{\mu}_{\,\text{MLE}} = \bar{X} = \frac{1}{n}\sum_{i=1}^{n} X_i}
$$

---

## 6. Properties of the Estimator $\bar{X}$

### 6.1 Unbiased

$$
\mathbb{E}[\bar{X}]
= \mathbb{E}\!\left[\frac{1}{n}\sum_{i=1}^n X_i\right]
= \frac{1}{n}\sum_{i=1}^n \mathbb{E}[X_i]
= \frac{1}{n}\cdot n\mu = \mu
$$

The second step uses the linearity of expectation, which does **not** require independence; the third uses $\mathbb{E}[X_i] = \mu$.

**Interpretation:** if sampling were repeated many times, the average of the estimates $\bar{x}$ would be close to $\mu$: the estimator does not err systematically in either direction.

### 6.2 Variance and Standard Error

$$
\text{Var}(\bar{X})
= \frac{1}{n^2}\,\text{Var}\!\left(\sum_{i=1}^n X_i\right)
= \frac{1}{n^2}\sum_{i=1}^n \text{Var}(X_i)
= \frac{1}{n^2}\cdot n\sigma^2
= \frac{\sigma^2}{n}
$$

The first step uses $\text{Var}(cZ) = c^2\,\text{Var}(Z)$ (the constant comes out **squared**); the second uses the **independence** of the observations (without it, covariances would appear).

$$
\text{SE}(\bar{X}) = \sqrt{\text{Var}(\bar{X})} = \frac{\sigma}{\sqrt{n}}
$$

Quadrupling the sample size halves the standard error.

### 6.3 Efficiency and the Cramér–Rao Bound

**Fisher information.** It measures the expected curvature of the log-likelihood: the "pointier" it is, the more the sample tells us about $\mu$.

$$
\mathcal{I}(\mu) = \mathbb{E}\!\left[-\frac{\partial^2}{\partial \mu^2}\ln f(X;\,\mu)\right]
$$

For one observation $X \sim \mathcal{N}(\mu, \sigma^2)$:

$$
\ln f(x;\,\mu) = -\ln(\sigma\sqrt{2\pi}) - \frac{(x-\mu)^2}{2\sigma^2}
\qquad
\frac{\partial}{\partial\mu}\ln f(x;\,\mu) = \frac{x - \mu}{\sigma^2}
\qquad
\frac{\partial^2}{\partial\mu^2}\ln f(x;\,\mu) = -\frac{1}{\sigma^2}
$$

The second derivative is constant, so $\mathcal{I}(\mu) = \frac{1}{\sigma^2}$. For $n$ independent observations, information adds up: $\mathcal{I}_n(\mu) = \frac{n}{\sigma^2}$.

**The Cramér–Rao bound.** Under regularity conditions (which hold for the normal), every unbiased estimator $\hat{\mu}$ of $\mu$ satisfies

$$
\text{Var}(\hat{\mu}) \geq \frac{1}{\mathcal{I}_n(\mu)} = \frac{\sigma^2}{n}
$$

Since $\text{Var}(\bar{X}) = \frac{\sigma^2}{n}$, the sample mean **reaches** the bound: it is **efficient**, and no unbiased estimator of $\mu$ has a smaller variance.

### 6.4 Consistency

By the Law of Large Numbers, $\bar{X}$ converges in probability to $\mu$: for every $\varepsilon > 0$,

$$
\lim_{n \to \infty} P\!\left(|\bar{X} - \mu| > \varepsilon\right) = 0
$$

With larger and larger samples, the estimate gets closer and closer to the true value.

### 6.5 Completeness and the Lehmann–Scheffé Theorem

The family $\\{\mathcal{N}(\mu, \sigma^2) : \mu \in \mathbb{R}\\}$, with $\sigma^2$ known, is an exponential family, and in it the sufficient statistic $T = \sum X_i$ is also **complete**: the only function of $T$ with expectation zero for every $\mu$ is the zero function (almost surely),

$$
\mathbb{E}_\mu\!\left[g(T)\right] = 0 \;\;\text{for every}\; \mu
\quad\Longrightarrow\quad
g(T) = 0 \;\;\text{almost surely}
$$

**The Lehmann–Scheffé theorem.** If $T$ is sufficient and complete for $\theta$, and $\varphi(T)$ is an unbiased estimator of $\theta$ with finite variance, then $\varphi(T)$ is the **uniformly minimum variance unbiased estimator** (UMVUE).

| Condition | Holds? |
|---|:---:|
| $T = \sum X_i$ is sufficient for $\mu$ | ✓ |
| $T = \sum X_i$ is complete | ✓ |
| $\bar{X} = T/n$ is a function of $T$ | ✓ |
| $\mathbb{E}[\bar{X}] = \mu$ | ✓ |

$$
\boxed{\bar{X} \;\text{is the UMVUE of } \mu \text{ in the normal model with known } \sigma.}
$$

---

## 7. Confidence Interval

Since $\sigma$ is known, the quantity

$$
Z = \frac{\bar{X} - \mu}{\sigma/\sqrt{n}} \sim \mathcal{N}(0,1)
$$

has a distribution that does not depend on $\mu$ (a **pivotal quantity**). So $P(-z_{\alpha/2} \leq Z \leq z_{\alpha/2}) = 1 - \alpha$, and solving for $\mu$:

$$
\boxed{CI_{1-\alpha}(\mu) = \bar{x} \pm z_{\alpha/2} \cdot \frac{\sigma}{\sqrt{n}}}
$$

For $\alpha = 0.05$: $z_{0.025} = 1.96$.

<div style="border-left: 4px solid #e53935; padding: 0.5em 1em; background-color: #ffebee; margin: 1em 0;">
<strong>Correct interpretation:</strong> the interval does <em>not</em> say "there is a 95% probability that μ is in this interval". The parameter μ is fixed; what varies from sample to sample is the interval. The 95% describes the <em>procedure</em>: in 95% of possible samples, an interval built this way contains μ. More in <a href="{{ '/en/statistical-inference/confidence-intervals' | relative_url }}">Confidence Intervals</a>.
</div>

---

## 8. Hypothesis Test

$$
H_0:\, \mu = 500 \quad \text{versus} \quad H_1:\, \mu \neq 500
$$

- $H_0$: the machine is calibrated.
- $H_1$: the mean weight differs from 500 g.

The test is **two-sided**, because both too much and too little product are problems. Under $H_0$:

$$
Z = \frac{\bar{X} - 500}{\sigma/\sqrt{n}} \overset{H_0}{\sim} \mathcal{N}(0,1)
$$

With $\alpha = 0.05$, $H_0$ is rejected if $\lvert z_{\text{obs}}\rvert  > 1.96$. The p-value is $2\,[1 - \Phi(\lvert z_{\text{obs}}\rvert )]$, where $\Phi$ is the cumulative distribution function of the standard normal. More in [Hypothesis Testing]({{ '/en/statistical-inference/hypothesis-testing' | relative_url }}).

**The risks of each error, in this problem:**

- **Type I error** ($\alpha = 5\%$): recalibrating a machine that was fine, with an unnecessary production stop.
- **Type II error** ($\beta$): not recalibrating a miscalibrated machine, shipping out-of-spec product.

The level $\alpha$ should be chosen by weighing these two costs; 5% is just a convention.

---

## 9. Complete Example with Data

### 9.1 Observed Data

A sample of $n = 10$ packages gave the weights below, in grams (illustrative numbers). The mean, computed in step 1, is 505 g.

<div style="overflow-x:auto; margin: 1em 0;">
<table style="border-collapse: collapse; margin: 0 auto; text-align: center;">
  <thead style="background: #e3f2fd;">
    <tr>
      <th style="border: 1px solid #bbb; padding: 8px;">Package</th>
      <th style="border: 1px solid #bbb; padding: 8px;">$x_i$</th>
      <th style="border: 1px solid #bbb; padding: 8px;">$x_i - \bar{x}$</th>
      <th style="border: 1px solid #bbb; padding: 8px;">$(x_i - \bar{x})^2$</th>
    </tr>
  </thead>
  <tbody>
    <tr><td style="border: 1px solid #bbb; padding: 8px;">1</td><td style="border: 1px solid #bbb; padding: 8px;">504</td><td style="border: 1px solid #bbb; padding: 8px;">−1</td><td style="border: 1px solid #bbb; padding: 8px;">1</td></tr>
    <tr><td style="border: 1px solid #bbb; padding: 8px;">2</td><td style="border: 1px solid #bbb; padding: 8px;">507</td><td style="border: 1px solid #bbb; padding: 8px;">+2</td><td style="border: 1px solid #bbb; padding: 8px;">4</td></tr>
    <tr><td style="border: 1px solid #bbb; padding: 8px;">3</td><td style="border: 1px solid #bbb; padding: 8px;">503</td><td style="border: 1px solid #bbb; padding: 8px;">−2</td><td style="border: 1px solid #bbb; padding: 8px;">4</td></tr>
    <tr><td style="border: 1px solid #bbb; padding: 8px;">4</td><td style="border: 1px solid #bbb; padding: 8px;">506</td><td style="border: 1px solid #bbb; padding: 8px;">+1</td><td style="border: 1px solid #bbb; padding: 8px;">1</td></tr>
    <tr><td style="border: 1px solid #bbb; padding: 8px;">5</td><td style="border: 1px solid #bbb; padding: 8px;">505</td><td style="border: 1px solid #bbb; padding: 8px;">0</td><td style="border: 1px solid #bbb; padding: 8px;">0</td></tr>
    <tr><td style="border: 1px solid #bbb; padding: 8px;">6</td><td style="border: 1px solid #bbb; padding: 8px;">502</td><td style="border: 1px solid #bbb; padding: 8px;">−3</td><td style="border: 1px solid #bbb; padding: 8px;">9</td></tr>
    <tr><td style="border: 1px solid #bbb; padding: 8px;">7</td><td style="border: 1px solid #bbb; padding: 8px;">508</td><td style="border: 1px solid #bbb; padding: 8px;">+3</td><td style="border: 1px solid #bbb; padding: 8px;">9</td></tr>
    <tr><td style="border: 1px solid #bbb; padding: 8px;">8</td><td style="border: 1px solid #bbb; padding: 8px;">506</td><td style="border: 1px solid #bbb; padding: 8px;">+1</td><td style="border: 1px solid #bbb; padding: 8px;">1</td></tr>
    <tr><td style="border: 1px solid #bbb; padding: 8px;">9</td><td style="border: 1px solid #bbb; padding: 8px;">503</td><td style="border: 1px solid #bbb; padding: 8px;">−2</td><td style="border: 1px solid #bbb; padding: 8px;">4</td></tr>
    <tr><td style="border: 1px solid #bbb; padding: 8px;">10</td><td style="border: 1px solid #bbb; padding: 8px;">506</td><td style="border: 1px solid #bbb; padding: 8px;">+1</td><td style="border: 1px solid #bbb; padding: 8px;">1</td></tr>
    <tr style="background:#f5f5f5; font-weight: bold;"><td style="border: 1px solid #bbb; padding: 8px;">Sum</td><td style="border: 1px solid #bbb; padding: 8px;">5050</td><td style="border: 1px solid #bbb; padding: 8px;">0</td><td style="border: 1px solid #bbb; padding: 8px;">34</td></tr>
  </tbody>
</table>
</div>

Process data: $\sigma = 5$ g (assumed known), $\mu_0 = 500$ g, $\alpha = 0.05$.

### 9.2 Step 1: Sufficient Statistic and Estimate

$$
T = \sum x_i = 5050 \qquad \hat{\mu} = \bar{x} = \frac{T}{n} = \frac{5050}{10} = 505 \text{ g}
$$

The estimate points to packages with a mean weight **5 g above** the specification.

### 9.3 Step 2: Sample Variance and Standard Error

$$
s^2 = \frac{1}{n-1}\sum_{i=1}^n (x_i - \bar{x})^2 = \frac{34}{9} \approx 3.778 \text{ g}^2
\qquad s \approx 1.944 \text{ g}
$$

$$
\text{SE}(\bar{X}) = \frac{\sigma}{\sqrt{n}} = \frac{5}{\sqrt{10}} = \frac{5}{3.1623} \approx 1.5811 \text{ g}
$$

### 9.4 Step 3: Fisher Information and Cramér–Rao

$$
\mathcal{I}_{10}(\mu) = \frac{n}{\sigma^2} = \frac{10}{25} = 0.4
\qquad
\text{CRB} = \frac{1}{0.4} = 2.5 \text{ g}^2 = \frac{\sigma^2}{n} = \text{Var}(\bar{X})
$$

The sample mean reaches the bound: 100% efficiency.

### 9.5 Step 4: 95% Interval

$$
CI_{95\%}(\mu) = 505 \pm 1.96 \times 1.5811 = 505 \pm 3.099
\qquad
\boxed{CI_{95\%}(\mu) = [501.90, 508.10] \text{ g}}
$$

The interval does **not** contain 500 g.

### 9.6 Step 5: Two-Sided Test

$$
z_{\text{obs}} = \frac{505 - 500}{5/\sqrt{10}} = \frac{5}{1.5811} = \sqrt{10} \approx 3.162
$$

Since $\lvert z_{\text{obs}}\rvert  = 3.162 > 1.96$, **$H_0$ is rejected**. The p-value is $2\,[1 - \Phi(3.162)] \approx 2 \times 0.000783 = 0.00157$.

### 9.7 Summary

<div style="border-left: 4px solid #4CAF50; padding: 0.5em 1em; background-color: #e8f5e9; margin: 1em 0;">
<strong>Statistical conclusion:</strong> with 10 packages, there is evidence that the mean weight is above 500 g (<em>z</em> = 3.162, p = 0.0016, 95% CI = [501.90, 508.10] g).<br><br>
<strong>Practical decision:</strong> recalibrate the machine. The estimated excess, 5 g per package, is 1% extra product given away in every unit (5/500 = 0.01).
</div>

---

## 10. Implementation in Julia

### 10.1 All the Calculations

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
using Distributions

# ── Data ───────────────────────────────────────────────────────────────────
data = [504, 507, 503, 506, 505, 502, 508, 506, 503, 506]
n    = length(data)
σ    = 5.0          # process standard deviation (known)
μ₀   = 500.0        # nominal value (null hypothesis)
α    = 0.05         # significance level

# ── 1. Sufficient statistic and point estimate (MLE) ───────────────────────
T  = sum(data)          # sufficient statistic
x̄  = T / n              # MLE = sample mean
println("Sufficient statistic T = Σxᵢ: $T")
println("Point estimate (MLE): x̄ = $x̄ g")

# ── 2. Sample variance and standard error ──────────────────────────────────
s²  = var(data; corrected=true)     # unbiased sample variance
SE  = σ / sqrt(n)                   # standard error with σ known
println("\nSample variance (s²): $(round(s²; digits=3)) g²")
println("Standard error of the estimator (SE): $(round(SE; digits=4)) g")

# ── 3. Log-likelihood ──────────────────────────────────────────────────────
loglik(μ) = -n * log(σ * sqrt(2π)) - sum((data .- μ).^2) / (2σ^2)
println("\nLog-likelihood at x̄ = $x̄:  $(round(loglik(x̄);  digits=4))")
println("Log-likelihood at μ₀ = $μ₀: $(round(loglik(μ₀); digits=4))")

# ── 4. Fisher information and Cramér–Rao bound ─────────────────────────────
I_n  = n / σ^2
CRB  = 1 / I_n
eff  = CRB / (σ^2/n) * 100
println("\nFisher information (n obs): Iₙ(μ) = $I_n")
println("Cramér–Rao bound: CRB = $CRB g²")
println("Efficiency of x̄: $(round(eff; digits=1))%")

# ── 5. Confidence interval (95%) ───────────────────────────────────────────
z_crit = quantile(Normal(0, 1), 1 - α/2)
margin = z_crit * SE
CI_low = x̄ - margin
CI_up  = x̄ + margin
println("\n$(Int((1-α)*100))% confidence interval: [$(round(CI_low; digits=2)), $(round(CI_up; digits=2))] g")
println("Contains μ₀ = $μ₀? $(CI_low ≤ μ₀ ≤ CI_up)")

# ── 6. Two-sided hypothesis test (z-test) ──────────────────────────────────
z_obs    = (x̄ - μ₀) / SE
p_value  = 2 * (1 - cdf(Normal(0, 1), abs(z_obs)))
decision = abs(z_obs) &gt; z_crit ? "REJECT H₀" : "Do not reject H₀"
println("\n── Hypothesis test ────────────────────────────────────────────────")
println("H₀: μ = $μ₀  vs  H₁: μ ≠ $μ₀")
println("Observed z statistic:   $(round(z_obs;   digits=4))")
println("Critical value (α = $α): ±$(round(z_crit; digits=4))")
println("p-value:                $(round(p_value; digits=6))")
println("Decision:               $decision")</code></pre>
  </div>
</div>

#### Expected output:
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <div>Sufficient statistic T = Σxᵢ: 5050</div>
  <div>Point estimate (MLE): x̄ = 505.0 g</div>
  <div></div>
  <div>Sample variance (s²): 3.778 g²</div>
  <div>Standard error of the estimator (SE): 1.5811 g</div>
  <div></div>
  <div>Log-likelihood at x̄ = 505.0: &nbsp;-25.9638</div>
  <div>Log-likelihood at μ₀ = 500.0: -30.9638</div>
  <div></div>
  <div>Fisher information (n obs): Iₙ(μ) = 0.4</div>
  <div>Cramér–Rao bound: CRB = 2.5 g²</div>
  <div>Efficiency of x̄: 100.0%</div>
  <div></div>
  <div>95% confidence interval: [501.9, 508.1] g</div>
  <div>Contains μ₀ = 500.0? false</div>
  <div></div>
  <div>── Hypothesis test ────────────────────────────────────────────────</div>
  <div>H₀: μ = 500.0 &nbsp;vs &nbsp;H₁: μ ≠ 500.0</div>
  <div>Observed z statistic: &nbsp; 3.1623</div>
  <div>Critical value (α = 0.05): ±1.96</div>
  <div>p-value: &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;0.001565</div>
  <div>Decision: &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; REJECT H₀</div>
</div>

### 10.2 The Log-Likelihood Curve

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

data = [504, 507, 503, 506, 505, 502, 508, 506, 503, 506]
n, σ = length(data), 5.0
loglik(μ) = -n * log(σ * sqrt(2π)) - sum((data .- μ).^2) / (2σ^2)

μs = range(493, 517; length=300)
plot(μs, loglik.(μs); xlabel="μ (g)", ylabel="ℓ(μ | x)", lw=2, color=:steelblue,
     label="log-likelihood", title="Log-likelihood of the normal with σ = 5 g")
vline!([mean(data)]; label="MLE = 505 g", color=:red, lw=2, linestyle=:dash)
vline!([500.0]; label="μ₀ = 500 g", color=:orange, lw=2, linestyle=:dot)
savefig("log_likelihood_en.png")</code></pre>
  </div>
</div>

![An upside-down parabola-shaped curve, with its maximum at μ = 505 g marked by a red dashed line and an orange dotted line at μ = 500 g, where the curve is lower]({{ site.baseurl }}/assets/images/log_likelihood_en.png)
<div class="image-caption">Figure 1: The log-likelihood of the 10 weights peaks at μ = 505 g, the MLE. At μ = 500 g it is about 5 units lower (−30.96 against −25.96).</div>

### 10.3 A Warning about the Assumed σ

The model assumed $\sigma = 5$ g, but the standard deviation of the 10 weights is only $s \approx 1.94$ g. For normal data with $\sigma = 5$, a value this small would be rare: $(n-1)s^2/\sigma^2 = 9 \cdot 3.778/25 = 1.36$, and the probability that a chi-square with 9 degrees of freedom falls below that is about 0.0019. In other words, the data suggest that the process varies **less** today than in its history.

That does not change the conclusion of this example: the t-test, which uses $s$ in place of $\sigma$, gives $t \approx 8.13$ with a p-value of about 0.00002, rejecting $H_0$ even more strongly. But it shows why the individual data still matter (section 4.4): the "known" $\sigma$ is an assumption, and it is worth checking.

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

data = [504, 507, 503, 506, 505, 502, 508, 506, 503, 506]
n, σ = length(data), 5.0
s = std(data)

# Are the data compatible with σ = 5? For normal data, (n − 1)s²/σ² ~ χ²(n − 1).
q = (n - 1) * s^2 / σ^2
println("s = ", round(s, digits=4), " g   (n − 1)s²/σ² = ", round(q, digits=4))
println("P(χ²₉ ≤ ", round(q, digits=2), ") = ", round(cdf(Chisq(n - 1), q), digits=4))

# t-test, which uses s in place of σ
t = (mean(data) - 500) / (s / sqrt(n))
println("t = ", round(t, digits=4), "   p-value = ", round(2 * ccdf(TDist(n - 1), abs(t)), sigdigits=3))</code></pre>
  </div>
</div>

#### Expected output:
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <div>s = 1.9437 g &nbsp; (n − 1)s²/σ² = 1.36</div>
  <div>P(χ²₉ ≤ 1.36) = 0.0019</div>
  <div>t = 8.1349 &nbsp; p-value = 1.94e-5</div>
</div>

---

## 11. Conclusion

$$
\underbrace{\mathcal{N}(\mu, \sigma^2)}_{\text{Distribution}}
\;\longrightarrow\;
\underbrace{L(\mu\mid\mathbf{x})}_{\text{Likelihood}}
\;\longrightarrow\;
\underbrace{T = \sum X_i}_{\text{Sufficient}}
\;\longrightarrow\;
\underbrace{\bar{X}}_{\text{MLE and UMVUE}}
\;\longrightarrow\;
\underbrace{CI \;\text{and test}}_{\text{Inference}}
\;\longrightarrow\;
\underbrace{\text{Recalibrate}}_{\text{Decision}}
$$

<div style="overflow-x:auto; margin: 1em 0;">
<table style="border-collapse: collapse; margin: 0 auto; min-width: 500px;">
  <thead style="background: #e3f2fd;">
    <tr>
      <th style="border: 1px solid #bbb; padding: 8px;">Property of $\bar{X}$</th>
      <th style="border: 1px solid #bbb; padding: 8px;">Meaning</th>
      <th style="border: 1px solid #bbb; padding: 8px;">Where</th>
    </tr>
  </thead>
  <tbody>
    <tr><td style="border: 1px solid #bbb; padding: 8px;">Unbiased</td><td style="border: 1px solid #bbb; padding: 8px;">$\mathbb{E}[\bar{X}] = \mu$</td><td style="border: 1px solid #bbb; padding: 8px;">6.1</td></tr>
    <tr><td style="border: 1px solid #bbb; padding: 8px;">Consistent</td><td style="border: 1px solid #bbb; padding: 8px;">$\bar{X}$ converges to $\mu$ as $n$ grows</td><td style="border: 1px solid #bbb; padding: 8px;">6.4</td></tr>
    <tr><td style="border: 1px solid #bbb; padding: 8px;">Efficient</td><td style="border: 1px solid #bbb; padding: 8px;">$\text{Var}(\bar{X})$ equals the Cramér–Rao bound</td><td style="border: 1px solid #bbb; padding: 8px;">6.3</td></tr>
    <tr><td style="border: 1px solid #bbb; padding: 8px;">Sufficient</td><td style="border: 1px solid #bbb; padding: 8px;">Summarizes all the information in the data about $\mu$ (within the model)</td><td style="border: 1px solid #bbb; padding: 8px;">4</td></tr>
    <tr><td style="border: 1px solid #bbb; padding: 8px;">UMVUE</td><td style="border: 1px solid #bbb; padding: 8px;">Smallest variance among unbiased estimators</td><td style="border: 1px solid #bbb; padding: 8px;">6.5</td></tr>
  </tbody>
</table>
</div>

**Lessons:**

1. **The model comes first.** The chosen distribution defines the likelihood and the optimal estimator. With the wrong model, the guarantees on this page no longer hold.
2. **"Optimal" is relative to the model.** $\bar{X}$ is the best unbiased estimator of $\mu$ **for the normal**. With heavy-tailed data, for example, the median can be a better estimator of the center.
3. **Unbiased is not everything.** The MSE combines bias and variance; sometimes a little bias pays for a much smaller variance.
4. **Statistics and decisions go together.** The p-value and the interval measure uncertainty; the decision also involves costs and context.

---

## References

1. Bussab, W. O.; Morettin, P. A. (2023). *Estatística Básica*. 10th ed. Saraiva Uni. (in Portuguese)
2. Casella, G.; Berger, R. L. (2002). *Statistical Inference*. 2nd ed. Duxbury.
3. Lehmann, E. L.; Casella, G. (1998). *Theory of Point Estimation*. 2nd ed. Springer.
4. Wasserman, L. (2004). *All of Statistics: A Concise Course in Statistical Inference*. Springer.
