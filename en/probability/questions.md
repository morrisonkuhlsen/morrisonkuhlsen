---
layout: page
title: Practice Questions
lang: en
ref: questions
parent: probabilidade
permalink: /en/probability/questions
order: 7
mathjax: true
description: "Probability questions solved step by step: binomial, exponential, Poisson, normal, geometric and negative binomial distributions, with Julia code."
---

## Solved Practice Questions

Six questions, one for each distribution covered in [Probability Distributions]({{ '/en/probability/distributions' | relative_url }}). Each solution says why the distribution fits, does the arithmetic one step at a time, interprets the result and checks everything with Julia code. The problems and numbers are **illustrative**, made up to keep the arithmetic simple; they do not describe any real village, company or person.

<div style="border-left: 4px solid #f44336; padding: 1em; background-color: #ffebee; margin: 1em 0; border-radius: 4px;">
  <img src="{{ site.baseurl }}/assets/images/lampiao.avif" alt="Kerosene lamp" style="float: right; width: 350px; margin-left: 1em; margin-bottom: 1em;">
  <h4 style="margin-top: 0;">🎲 Question 1: Lamps in a Village (Binomial Distribution)</h4>
  <p><strong>Problem:</strong></p>
  <p>In a village where the power often goes out, every resident has a kerosene lamp. Because of impurities in the fuel, 1 in every 5 lamps fails to light.</p>
  <p>During a blackout one night, 6 residents try to light their lamps, each one independently of the others.</p>
  <p><strong>Questions:</strong></p>
  <ol>
    <li>What is the probability that <strong>exactly 2</strong> lamps fail?</li>
    <li>What is the probability that <strong>at least 1</strong> lamp lights?</li>
    <li>If all 6 residents switch from kerosene to a filtered fuel that cuts the chance of failure to 10%, what is the probability that <strong>no lamp fails</strong>?</li>
  </ol>
</div>

### Detailed Solution

**Why binomial.** There is a fixed number of trials ($n = 6$ lamps); each has two outcomes (fails or lights); the trials are independent (the problem says so); and the probability of failure is the same for all of them, $p = \frac{1}{5} = 0.2$. These are exactly the conditions for the binomial distribution.

Let $X$ be the number of lamps that fail out of the 6. Then $X \sim \text{Binomial}(n = 6,\ p = 0.2)$, with probability mass function:

$$P(X = k) = \binom{n}{k} p^k (1-p)^{n-k}, \qquad k = 0, 1, \ldots, n$$

where $\binom{n}{k} = \frac{n!}{k!\,(n-k)!}$ is the number of ways to choose which $k$ of the $n$ trials fail.

#### 1. Exactly 2 lamps fail

**Substitution** ($n = 6$, $k = 2$, $p = 0.2$, $1 - p = 0.8$):

$$P(X = 2) = \binom{6}{2} \cdot (0.2)^2 \cdot (0.8)^4$$

**Arithmetic**, one term at a time:

$$\binom{6}{2} = \frac{6!}{2! \cdot 4!} = \frac{6 \cdot 5}{2 \cdot 1} = \frac{30}{2} = 15$$

$$(0.2)^2 = 0.04$$

$$(0.8)^4 = 0.8 \cdot 0.8 \cdot 0.8 \cdot 0.8 = 0.4096$$

$$P(X = 2) = 15 \cdot 0.04 \cdot 0.4096 = 0.6 \cdot 0.4096 = 0.24576$$

**Result:** $P(X = 2) = 0.24576$, or about **24.58%**.

**Interpretation:** on about 1 in 4 blackout nights with 6 lamps, exactly 2 of them fail. For comparison, the **expected** number of failures is $n \cdot p = 6 \cdot 0.2 = 1.2$ per night.

#### 2. At least 1 lamp lights

"At least 1 lights" is the complement of "none lights", that is, of "all 6 fail" ($X = 6$). By the complement rule:

$$P(\text{at least 1 lights}) = 1 - P(X = 6)$$

$$P(X = 6) = \binom{6}{6} \cdot (0.2)^6 \cdot (0.8)^0 = 1 \cdot 0.000064 \cdot 1 = 0.000064$$

$$P(\text{at least 1 lights}) = 1 - 0.000064 = 0.999936$$

**Result:** $0.999936$, or **99.9936%**.

**Interpretation:** all 6 failing at once happens, on average, on 64 out of every 1,000,000 nights (1 in 15,625). It is almost certain that someone in the village will have light. This number relies on independence: if the failures come from the same batch of bad kerosene, they are no longer independent, and "all fail" becomes much more likely.

#### 3. No lamp fails with the filtered fuel

With the new fuel, the probability of failure becomes $p' = 0.1$, and the probability of lighting, $1 - p' = 0.9$. Let $X'$ be the new number of failures, $X' \sim \text{Binomial}(6,\ 0.1)$:

$$P(X' = 0) = \binom{6}{0} \cdot (0.1)^0 \cdot (0.9)^6 = 1 \cdot 1 \cdot (0.9)^6$$

$$(0.9)^6 = 0.81 \cdot 0.81 \cdot 0.81 = 0.531441$$

**Result:** $P(X' = 0) = 0.531441$, or about **53.14%**.

**Interpretation:** with the old fuel, the chance that none fails was $(0.8)^6 = 0.262144$, about 26.21%. The filtered fuel roughly doubles that chance, but even so, on almost half of the nights at least one lamp fails.

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

X = Binomial(6, 0.2)          # X = number of lamps that fail, out of 6
println("P(X = 2)             = ", round(pdf(X, 2), digits=5))
println("P(at least 1 lights) = 1 − P(X = 6) = ", round(1 - pdf(X, 6), digits=6))

X_filtered = Binomial(6, 0.1) # 10% failure with the filtered fuel
println("P(no failure), p = 0.1: ", round(pdf(X_filtered, 0), digits=6))
println("P(no failure), p = 0.2: ", round(pdf(X, 0), digits=6))</code></pre>
  </div>
</div>

#### Expected output:
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <div>P(X = 2) &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; = 0.24576</div>
  <div>P(at least 1 lights) = 1 − P(X = 6) = 0.999936</div>
  <div>P(no failure), p = 0.1: 0.531441</div>
  <div>P(no failure), p = 0.2: 0.262144</div>
</div>

<div style="border-left: 4px solid #4CAF50; padding: 0.5em; background-color: #e8f5e9; margin: 1em 0;">
  <strong>Summary of Results (Question 1):</strong>
  <ul>
    <li>Exactly 2 failures: <strong>24.58%</strong></li>
    <li>At least 1 lights: <strong>99.9936%</strong></li>
    <li>No failure with the filtered fuel: <strong>53.14%</strong></li>
  </ul>
</div>

<div style="border-left: 4px solid #2196F3; padding: 1em; background-color: #e3f2fd; margin: 1em 0; border-radius: 4px;">
  <img src="{{ site.baseurl }}/assets/images/lampiao.avif" alt="Kerosene lamp" style="float: right; width: 350px; margin-left: 1em; margin-bottom: 1em;">
  <h4 style="margin-top: 0;">🎲 Question 2: How Long the Lamp Stays Lit (Exponential Distribution)</h4>
  <p><strong>Problem:</strong></p>
  <p>Suppose that the time, in hours, a lamp stays lit until it goes out follows an <strong>exponential distribution</strong> with a mean of 6 hours.</p>
  <p><strong>Questions:</strong></p>
  <ol>
    <li>What is the probability that a lamp stays lit for <strong>more than 8 hours</strong>?</li>
    <li>A resident lights 4 identical lamps, which work independently. What is the probability that <strong>at least one</strong> of them stays lit for more than 8 hours?</li>
    <li>What is the <strong>median</strong> time lit (the time by which half of the lamps have gone out)?</li>
    <li>A lamp has already been lit for 6 hours. What is the probability that it stays lit for <strong>at least 4 more hours</strong>?</li>
  </ol>
</div>

### Detailed Solution

The exponential is a **model** chosen for the exercise: it assumes that the lamp does not "age", that is, that the chance of going out in the next hour is the same at the start and at the end of the night. In practice, the kerosene runs out, and a real lamp does not behave quite like that. Item 4 shows the consequence of this assumption.

Let $T$ be the time lit, in hours. The exponential has one parameter, the **rate** $\lambda$, and its mean is $E[T] = \frac{1}{\lambda}$. With a mean of 6 hours:

$$\lambda = \frac{1}{E[T]} = \frac{1}{6} \text{ per hour}$$

The probability that the lamp lasts more than $t$ hours (the **survival function**) is:

$$P(T > t) = e^{-\lambda t}, \qquad t \geq 0$$

#### 1. Staying lit for more than 8 hours

$$P(T > 8) = e^{-\lambda \cdot 8} = e^{-\frac{1}{6} \cdot 8} = e^{-\frac{4}{3}}$$

$$-\frac{4}{3} \approx -1.3333 \qquad e^{-1.3333} \approx 0.2636$$

**Result:** $P(T > 8) \approx 0.2636$, or about **26.36%**.

**Interpretation:** a little over 1 in 4 lamps stays lit for more than 8 hours, even though the mean is 6 hours.

#### 2. At least 1 of 4 stays lit for more than 8 hours

Let $p = P(T > 8) \approx 0.2636$. "At least 1 goes past 8 hours" is the complement of "none goes past". Since the 4 lamps are independent, the probability that none goes past is the product of 4 probabilities, each equal to $1 - p$:

$$P(\text{at least 1} > 8\text{ h}) = 1 - (1 - p)^4$$

$$1 - p \approx 1 - 0.2636 = 0.7364$$

$$(0.7364)^4 \approx 0.2941$$

$$P(\text{at least 1} > 8\text{ h}) \approx 1 - 0.2941 = 0.7059$$

**Result:** about **70.59%**. (With $p$ unrounded, the value is 0.705922…, which also rounds to 70.59%.)

#### 3. Median

The median $m$ is the time at which half of the lamps are still lit: $P(T > m) = 0.5$.

$$e^{-\lambda m} = 0.5$$

Taking the natural logarithm of both sides:

$$-\lambda m = \ln(0.5) = -\ln 2$$

$$m = \frac{\ln 2}{\lambda} = 6 \cdot \ln 2 \approx 6 \cdot 0.693147 \approx 4.1589 \text{ hours}$$

**Result:** $m \approx 4.16$ hours (about 4 h 10 min).

**Interpretation:** half of the lamps go out before 4.16 hours, even though the mean is 6 hours. In the exponential, the mean lies above the median because a few lamps last much longer than is typical and pull the mean up.

#### 4. Staying lit 4 more hours, given that it has been lit for 6

By the definition of conditional probability, since "lasting more than 10 hours" is contained in "lasting more than 6 hours":

$$P(T > 10 \mid T > 6) = \frac{P(T > 10)}{P(T > 6)} = \frac{e^{-\lambda \cdot 10}}{e^{-\lambda \cdot 6}} = e^{-\lambda \cdot 4} = P(T > 4)$$

This is a case of the exponential's **memoryless property**: for any $s, t \geq 0$, $P(T > s + t \mid T > s) = P(T > t)$. Now the arithmetic:

$$P(T > 4) = e^{-\frac{1}{6} \cdot 4} = e^{-\frac{2}{3}} \approx e^{-0.6667} \approx 0.5134$$

**Result:** about **51.34%**.

**Interpretation:** under the exponential model, a lamp that has already been lit for 6 hours has the same chance of lasting 4 more hours as a freshly lit lamp. That is what "memoryless" means, and it is also the model's weak point for real lamps, whose fuel keeps running down.

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

# Careful: Julia's Exponential(θ) takes the SCALE θ = mean = 1/λ
T = Exponential(6)            # mean of 6 hours, rate λ = 1/6 per hour

p = ccdf(T, 8)                # ccdf(T, t) = P(T &gt; t)
println("P(T &gt; 8)                = ", round(p, digits=4))
println("P(at least 1 of 4 &gt; 8)  = ", round(1 - (1 - p)^4, digits=4))
println("Median                  = ", round(median(T), digits=4), " hours")
println("P(T &gt; 10 | T &gt; 6)       = ", round(ccdf(T, 10) / ccdf(T, 6), digits=4))
println("P(T &gt; 4)                = ", round(ccdf(T, 4), digits=4))</code></pre>
  </div>
</div>

#### Expected output:
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <div>P(T &gt; 8) &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;= 0.2636</div>
  <div>P(at least 1 of 4 &gt; 8) &nbsp;= 0.7059</div>
  <div>Median &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;= 4.1589 hours</div>
  <div>P(T &gt; 10 | T &gt; 6) &nbsp; &nbsp; &nbsp; = 0.5134</div>
  <div>P(T &gt; 4) &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;= 0.5134</div>
</div>

<div style="border-left: 4px solid #4CAF50; padding: 0.5em; background-color: #e8f5e9; margin: 1em 0;">
  <strong>Summary of Results (Question 2):</strong>
  <ul>
    <li>Lit for more than 8 h: <strong>26.36%</strong></li>
    <li>At least 1 of 4 past 8 h: <strong>70.59%</strong></li>
    <li>Median time lit: <strong>4.16 hours</strong></li>
    <li>4 more hours, given 6 hours lit: <strong>51.34%</strong></li>
  </ul>
</div>

<div style="border-left: 4px solid #673AB7; padding: 1em; background-color: #ede7f6; margin: 1em 0; border-radius: 4px;">
  <img src="{{ site.baseurl }}/assets/images/telephone.avif" alt="Old telephone" style="float: right; width: 350px; margin-left: 1em; margin-bottom: 1em;">
  <h4 style="margin-top: 0;">📞 Question 3: Calls to a Call Center (Poisson Distribution)</h4>
  <p><strong>Problem:</strong></p>
  <p>A small call center receives, on average, 12 calls per hour. Suppose the calls arrive one at a time, independently, and at the same rate over time, so that the number of calls in an interval follows a <strong>Poisson distribution</strong>.</p>
  <p><strong>Questions:</strong></p>
  <ol>
    <li>What is the probability of <strong>exactly 5 calls</strong> in 30 minutes?</li>
    <li>What is the probability of <strong>no calls</strong> in 10 minutes?</li>
    <li>What is the probability of <strong>more than 3 calls</strong> in 20 minutes?</li>
  </ol>
</div>

### Detailed Solution

Let $X$ be the number of calls in an interval. The Poisson probability mass function is:

$$P(X = k) = \frac{e^{-\lambda} \lambda^k}{k!}, \qquad k = 0, 1, 2, \ldots$$

where $\lambda$ is the **mean number of calls in the interval being considered**. With a constant rate, that number is proportional to the length of the interval:

$$\lambda = 12 \text{ calls/hour} \times \text{length of the interval in hours}$$

#### 1. Exactly 5 calls in 30 minutes

**Data:** 30 minutes $= 0.5$ hour, so $\lambda = 12 \cdot 0.5 = 6$ calls; $k = 5$.

$$P(X = 5) = \frac{e^{-6} \cdot 6^5}{5!}$$

$$e^{-6} \approx 0.0024788 \qquad 6^5 = 7{,}776 \qquad 5! = 120$$

$$P(X = 5) \approx \frac{0.0024788 \cdot 7{,}776}{120} \approx \frac{19.2748}{120} \approx 0.1606$$

**Result:** about **16.06%**.

**Interpretation:** the mean over 30 minutes is 6 calls, but getting exactly 5 happens in only about 1 out of every 6 half hours: the number of calls varies quite a lot around the mean.

#### 2. No calls in 10 minutes

**Data:** 10 minutes $= \frac{1}{6}$ hour, so $\lambda = 12 \cdot \frac{1}{6} = 2$ calls; $k = 0$. Since $2^0 = 1$ and $0! = 1$:

$$P(X = 0) = \frac{e^{-2} \cdot 2^0}{0!} = e^{-2} \approx 0.1353$$

**Result:** about **13.53%**.

**Interpretation:** in about 1 out of every 7 ten-minute intervals, nobody calls.

#### 3. More than 3 calls in 20 minutes

**Data:** 20 minutes $= \frac{1}{3}$ hour, so $\lambda = 12 \cdot \frac{1}{3} = 4$ calls.

"More than 3" is the complement of "3 or fewer". By the complement rule:

$$P(X > 3) = 1 - P(X \leq 3) = 1 - [P(X = 0) + P(X = 1) + P(X = 2) + P(X = 3)]$$

With $e^{-4} \approx 0.018316$, each term is:

| $k$ | $\frac{e^{-4}\,4^k}{k!}$ | $P(X = k)$ |
|---|---|---|
| 0 | $e^{-4} \cdot \frac{1}{1}$ | 0.0183 |
| 1 | $e^{-4} \cdot \frac{4}{1}$ | 0.0733 |
| 2 | $e^{-4} \cdot \frac{16}{2}$ | 0.1465 |
| 3 | $e^{-4} \cdot \frac{64}{6}$ | 0.1954 |
| **Sum** | | **0.4335** |

$$P(X > 3) = 1 - 0.4335 = 0.5665$$

**Result:** about **56.65%**. (The terms in the table are rounded; adding the full values, $P(X \leq 3) = 0.433470\ldots$, and the rounded result is the same.)

**Interpretation:** in a little over half of the 20-minute intervals, 4 or more calls come in. If the center can only handle 3 calls every 20 minutes, a queue will often build up.

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

rate = 12                     # calls per hour
for (minutes, k) in ((30, 5), (10, 0))
    λ = rate * minutes / 60   # mean number of calls in the interval
    println("λ = ", λ, " in ", minutes, " min:  P(X = ", k, ") = ", round(pdf(Poisson(λ), k), digits=4))
end

X = Poisson(rate * 20 / 60)   # λ = 4 in 20 minutes
println("P(X ≤ 3) = ", round(cdf(X, 3), digits=4), "   P(X &gt; 3) = ", round(ccdf(X, 3), digits=4))</code></pre>
  </div>
</div>

#### Expected output:
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <div>λ = 6.0 in 30 min: &nbsp;P(X = 5) = 0.1606</div>
  <div>λ = 2.0 in 10 min: &nbsp;P(X = 0) = 0.1353</div>
  <div>P(X ≤ 3) = 0.4335 &nbsp; P(X &gt; 3) = 0.5665</div>
</div>

<div style="border-left: 4px solid #4CAF50; padding: 0.5em; background-color: #e8f5e9; margin: 1em 0;">
  <strong>Summary of Results (Question 3):</strong>
  <ul>
    <li>Exactly 5 calls in 30 min: <strong>16.06%</strong></li>
    <li>No calls in 10 min: <strong>13.53%</strong></li>
    <li>More than 3 calls in 20 min: <strong>56.65%</strong></li>
  </ul>
</div>

<div style="border-left: 4px solid #FF9800; padding: 1em; background-color: #fff3e0; margin: 1em 0; border-radius: 4px;">
  <img src="{{ site.baseurl }}/assets/images/telephone.avif" alt="Old telephone" style="float: right; width: 320px; margin-left: 1em; margin-bottom: 1em;">
  <h4 style="margin-top: 0;">📞 Question 4: Call Duration (Normal Distribution)</h4>
  <p><strong>Problem:</strong></p>
  <p>The duration of technical support calls at a call center follows a <strong>normal distribution</strong> with mean $\mu = 10$ minutes and standard deviation $\sigma = 2$ minutes.</p>
  <p><strong>Questions:</strong></p>
  <ol>
    <li>What is the probability that a call lasts <strong>less than 7 minutes</strong>?</li>
    <li>What is the probability that a call lasts <strong>between 9 and 12 minutes</strong>?</li>
    <li>From how many minutes on are the <strong>5% longest calls</strong>?</li>
  </ol>
</div>

### Detailed Solution

Let $X$ be the duration of a call, in minutes: $X \sim N(\mu = 10,\ \sigma^2 = 2^2)$. (In the notation $N(\mu, \sigma^2)$, the second parameter is the **variance**, $\sigma^2 = 4$; the standard deviation is $\sigma = 2$.)

A duration cannot be negative, and the normal allows any real value. Here that does no harm: $P(X < 0)$ is about 0.0000003, because 0 is 5 standard deviations below the mean.

To use the standard normal table, we turn each value into a **Z-score**, which says how many standard deviations the value lies from the mean:

$$Z = \frac{X - \mu}{\sigma}$$

If $X$ is normal, $Z$ has the standard normal distribution, $N(0,\ 1)$.

#### 1. Less than 7 minutes

$$Z = \frac{7 - 10}{2} = \frac{-3}{2} = -1.5$$

From the Z table: $P(Z < -1.5) = 0.0668$.

**Result:** $P(X < 7) \approx 0.0668$, or about **6.68%**.

**Interpretation:** about 7 out of every 100 calls end in less than 7 minutes.

#### 2. Between 9 and 12 minutes

$$Z_1 = \frac{9 - 10}{2} = -0.5 \qquad Z_2 = \frac{12 - 10}{2} = 1$$

The probability is the area between the two scores:

$$P(9 < X < 12) = P(-0.5 < Z < 1) = P(Z < 1) - P(Z < -0.5)$$

From the Z table: $P(Z < 1) = 0.8413$ and $P(Z < -0.5) = 0.3085$.

$$P(9 < X < 12) = 0.8413 - 0.3085 = 0.5328$$

**Result:** about **53.28%**.

**Interpretation:** a little over half of the calls last between 9 and 12 minutes. The interval is not symmetric around the mean (it goes from 1 minute below to 2 above), so the answer is not the one for "mean ± 1 standard deviation".

#### 3. The 5% longest

We want the value $x$ with $P(X > x) = 0.05$, which is the same as $P(X < x) = 0.95$: $x$ is the **95th percentile** of the duration.

From the Z table, the score with an area of 0.95 to its left is $z \approx 1.645$ (to more places, 1.6449). Back in minutes, with $X = \mu + Z \cdot \sigma$:

$$x = 10 + 1.645 \cdot 2 = 10 + 3.29 = 13.29 \text{ minutes}$$

**Result:** the 5% longest calls last **13.29 minutes or more**.

**Interpretation:** only 1 in every 20 calls goes past about 13 minutes and 17 seconds. A value like this can be used, for example, to decide when a call counts as "long".

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

# Careful: Julia's Normal(μ, σ) takes the STANDARD DEVIATION σ, not the variance
X = Normal(10, 2)

println("P(X &lt; 7)        = ", round(cdf(X, 7), digits=4))
println("P(9 &lt; X &lt; 12)   = ", round(cdf(X, 12) - cdf(X, 9), digits=4))
println("95% quantile    = ", round(quantile(X, 0.95), digits=2), " minutes")
println("P(X &lt; 0)        = ", round(cdf(X, 0), sigdigits=2), "  (negative duration: negligible)")</code></pre>
  </div>
</div>

#### Expected output:
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <div>P(X &lt; 7) &nbsp; &nbsp; &nbsp; &nbsp;= 0.0668</div>
  <div>P(9 &lt; X &lt; 12) &nbsp; = 0.5328</div>
  <div>95% quantile &nbsp; &nbsp;= 13.29 minutes</div>
  <div>P(X &lt; 0) &nbsp; &nbsp; &nbsp; &nbsp;= 2.9e-7 &nbsp;(negative duration: negligible)</div>
</div>

<div style="border-left: 4px solid #4CAF50; padding: 0.5em; background-color: #e8f5e9; margin: 1em 0;">
  <strong>Summary of Results (Question 4):</strong>
  <ul>
    <li>Less than 7 min: <strong>6.68%</strong></li>
    <li>Between 9 and 12 min: <strong>53.28%</strong></li>
    <li>The 5% longest: <strong>13.29 minutes or more</strong></li>
  </ul>
</div>

<div style="border-left: 4px solid #009688; padding: 1em; background-color: #e0f2f1; margin: 1em 0; border-radius: 4px;">
  <img src="{{ site.baseurl }}/assets/images/boxkite.avif" alt="Box kite" style="float: right; width: 350px; margin-left: 1em; margin-bottom: 1em;">
  <h4 style="margin-top: 0;">🪁 Question 5: Attempts to Fly a Kite (Geometric Distribution)</h4>
  <p><strong>Problem:</strong></p>
  <p>Because of the wind, a person manages to get their kite airborne on 40% of their attempts ($p = 0.4$). The attempts are independent of one another.</p>
  <p><strong>Questions:</strong></p>
  <ol>
    <li>What is the probability of succeeding on the <strong>first attempt</strong>?</li>
    <li>What is the probability of needing <strong>exactly 3 attempts</strong>?</li>
    <li>What is the probability of needing <strong>more than 4 attempts</strong>?</li>
  </ol>
</div>

### Detailed Solution

**Why geometric.** The attempts are independent, each one is a success or a failure, and the probability of success is always $p = 0.4$. The question is **when** the first success comes.

Let $X$ be the **number of the attempt** on which the first success comes ($X = 1, 2, 3, \ldots$). For $X = k$, the first $k - 1$ attempts fail and the $k$-th succeeds; by independence, the probabilities multiply:

$$P(X = k) = (1 - p)^{k-1} \, p, \qquad k = 1, 2, 3, \ldots$$

(There is another convention, which counts the number of **failures** before the first success, starting at 0. It gives the same probabilities with the index shifted by 1; it is the one Julia uses, as the code below shows.)

#### 1. Success on the first attempt

$$P(X = 1) = (0.6)^{0} \cdot 0.4 = 1 \cdot 0.4 = 0.4$$

**Result:** **40%**.

#### 2. Exactly 3 attempts

Two failures and then a success:

$$P(X = 3) = (0.6)^{2} \cdot 0.4 = 0.36 \cdot 0.4 = 0.144$$

**Result:** **14.4%**.

#### 3. More than 4 attempts

Needing more than 4 attempts is the same as the first 4 failing. By independence:

$$P(X > 4) = (1 - p)^4 = (0.6)^4 = 0.36 \cdot 0.36 = 0.1296$$

**Result:** about **12.96%**.

**Interpretation:** on average, the person needs $E[X] = \frac{1}{p} = \frac{1}{0.4} = 2.5$ attempts, but about 13% of the time they need 5 or more. Earlier failures do not "raise the chance" of the next attempt: each one still has 40%, no matter how many attempts have already failed.

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

# Careful: Julia's Geometric(p) counts the FAILURES before the 1st success (0, 1, 2, …).
# Here X = the number of the trial with the 1st success, so X = failures + 1.
F = Geometric(0.4)

println("P(X = 1) = ", round(pdf(F, 0), digits=4))
println("P(X = 3) = ", round(pdf(F, 2), digits=4))
println("P(X &gt; 4) = ", round(ccdf(F, 3), digits=4))   # more than 3 failures
println("E[X]     = ", round(mean(F) + 1, digits=4))</code></pre>
  </div>
</div>

#### Expected output:
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <div>P(X = 1) = 0.4</div>
  <div>P(X = 3) = 0.144</div>
  <div>P(X &gt; 4) = 0.1296</div>
  <div>E[X] &nbsp; &nbsp; = 2.5</div>
</div>

<div style="border-left: 4px solid #4CAF50; padding: 0.5em; background-color: #e8f5e9; margin: 1em 0;">
  <strong>Summary of Results (Question 5):</strong>
  <ul>
    <li>Success on the 1st attempt: <strong>40%</strong></li>
    <li>Exactly 3 attempts: <strong>14.4%</strong></li>
    <li>More than 4 attempts: <strong>12.96%</strong></li>
  </ul>
</div>

<div style="border-left: 4px solid #009688; padding: 1em; background-color: #e0f2f1; margin: 1em 0; border-radius: 4px;">
  <img src="{{ site.baseurl }}/assets/images/boxkite.avif" alt="Box kite" style="float: right; width: 350px; margin-left: 1em; margin-bottom: 1em;">
  <h4 style="margin-top: 0;">🪁 Question 6: Three Successes with the Kite (Negative Binomial)</h4>
  <p><strong>Problem:</strong></p>
  <p>The same person, still with a 40% chance of success on each independent attempt, wants to get the kite airborne 3 times to practice a maneuver.</p>
  <p><strong>Questions:</strong></p>
  <ol>
    <li>What is the probability that the <strong>third success</strong> comes exactly on the <strong>fifth attempt</strong>?</li>
    <li>What is the <strong>expected number of attempts</strong> to reach the 3 successes?</li>
  </ol>
</div>

### Detailed Solution

**Why negative binomial.** Now the question is when the $r$-th success comes, with $r = 3$. Let $X$ be the **number of the attempt** on which the 3rd success comes ($X = 3, 4, 5, \ldots$). (The negative binomial has several definitions; this one counts attempts. Julia counts the failures before the $r$-th success, as the code shows.)

For the $r$-th success to come on attempt $k$, attempt $k$ must be a success, and the $k - 1$ attempts before it must contain exactly $r - 1$ successes, in any order:

$$P(X = k) = \binom{k-1}{r-1} p^r (1-p)^{k-r}, \qquad k = r, r+1, \ldots$$

#### 1. Third success on the fifth attempt

**Substitution** ($r = 3$, $k = 5$, $p = 0.4$, $1 - p = 0.6$):

$$P(X = 5) = \binom{4}{2} \cdot (0.4)^3 \cdot (0.6)^2$$

**Arithmetic:**

$$\binom{4}{2} = \frac{4!}{2! \cdot 2!} = \frac{24}{4} = 6 \qquad (0.4)^3 = 0.064 \qquad (0.6)^2 = 0.36$$

$$P(X = 5) = 6 \cdot 0.064 \cdot 0.36 = 0.384 \cdot 0.36 = 0.13824$$

**Result:** about **13.82%**.

**Interpretation:** the $\binom{4}{2} = 6$ counts the possible orders of the 2 successes in the first 4 attempts (for example, SSFF, SFSF, …); each order, followed by the success on the 5th, has probability $(0.4)^3 \cdot (0.6)^2 = 0.02304$.

#### 2. Expected number of attempts

Waiting for 3 successes means waiting for the 1st success, then waiting for the 2nd from there, then the 3rd. Each wait is a geometric with mean $\frac{1}{p}$ (Question 5), and the expected value of a sum is the sum of the expected values. That is why:

$$E[X] = \frac{r}{p} = \frac{3}{0.4} = 7.5 \text{ attempts}$$

**Result:** **7.5 attempts**, on average.

**Interpretation:** 7.5 is a long-run average: if the person repeats the practice many times, the average number of attempts will be close to 7.5. On any particular occasion, the number is always a whole number and can be much smaller (3, if the first 3 attempts succeed) or much larger.

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

# Careful: Julia's NegativeBinomial(r, p) counts the FAILURES before the r-th success.
# Here X = the number of the trial with the 3rd success, so X = failures + 3.
r, p = 3, 0.4
F = NegativeBinomial(r, p)

println("P(X = 5) = ", round(pdf(F, 5 - r), digits=5))
println("E[X]     = ", round(mean(F) + r, digits=4))</code></pre>
  </div>
</div>

#### Expected output:
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <div>P(X = 5) = 0.13824</div>
  <div>E[X] &nbsp; &nbsp; = 7.5</div>
</div>

<div style="border-left: 4px solid #4CAF50; padding: 0.5em; background-color: #e8f5e9; margin: 1em 0;">
  <strong>Summary of Results (Question 6):</strong>
  <ul>
    <li>3rd success on the 5th attempt: <strong>13.82%</strong></li>
    <li>Expected number of attempts: <strong>7.5</strong></li>
  </ul>
</div>

---

## References

1. Bussab, W. O.; Morettin, P. A. (2023). *Estatística Básica*. 10th ed. Saraiva Uni. (in Portuguese)
2. Ross, S. M. (2012). *A First Course in Probability*. 9th ed. Pearson.
