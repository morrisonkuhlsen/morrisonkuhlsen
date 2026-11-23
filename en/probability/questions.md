---
layout: page
title: Practice Questions
lang: en
ref: questions
parent: probabilidade
permalink: /en/probability/questions
order: 7
mathjax: true
description: "Solved probability questions, step by step: binomial, exponential, Poisson, normal, geometric and negative binomial distributions."
---

## Solved Practice Questions

<div style="border-left: 4px solid #f44336; padding: 1em; background-color: #ffebee; margin: 1em 0; border-radius: 4px;">
  <img src="{{ site.baseurl }}/assets/images/lampiao.avif" alt="Kerosene lamp" style="float: right; width: 350px; margin-left: 1em; margin-bottom: 1em;">
  <h4 style="margin-top: 0;">🎲 Probability Question: Lamps in a Village</h4>
  <p><strong>Problem:</strong></p>
  <p>In a village where the power supply is unreliable, every resident has a kerosene lamp. Studies show that, on average, 1 in every 5 lamps fails to light because of impurities in the fuel.</p>
  <p>During a blackout one night, 6 residents try to light their lamps independently.</p>
  <p><strong>Questions:</strong></p>
  <ol>
    <li>What is the probability that <strong>exactly 2</strong> lamps fail to light?</li>
    <li>What is the probability that <strong>at least 1</strong> lamp works properly?</li>
    <li>If a resident replaces the kerosene with a filtered fuel that cuts the chance of failure to 10%, what is the new probability that <strong>no lamp fails</strong> among the 6?</li>
  </ol>
</div>

### Detailed Solution

The problem can be modeled with the **binomial distribution**, since we have a fixed number of independent trials ($n=6$), each with two possible outcomes (failure or success) and a constant probability of failure ($p=1/5=0.2$).

Let $X$ be the number of lamps that fail. Then $X \sim \text{Binomial}(n=6, p=0.2)$.

#### 1. Probability that exactly 2 lamps fail

We use the binomial probability mass function:

$$ P(X = k) = \binom{n}{k} p^k (1-p)^{n-k} $$

For $k=2$, $n=6$ and $p=0.2$:

$$ P(X=2) = \binom{6}{2} (0.2)^2 (0.8)^4 $$

Computing each term separately:

$$ \binom{6}{2} = \frac{6!}{2!(6-2)!} = \frac{6 \cdot 5}{2 \cdot 1} = 15 $$

$$ (0.2)^2 = 0.04 $$

$$ (0.8)^4 = 0.4096 $$

Putting the results together:

$$ P(X=2) = 15 \cdot 0.04 \cdot 0.4096 $$

$$ P(X=2) = 0.24576 $$

The probability that exactly 2 lamps fail is **24.58%**.

#### 2. Probability that at least 1 lamp works properly

"At least 1 works" is the complement of "none works", that is, "all 6 fail".
$$ P(\text{at least 1 works}) = 1 - P(\text{all 6 fail}) $$
The probability that all 6 fail is $P(X=6)$:

$$ P(X=6) = \binom{6}{6} (0.2)^6 (0.8)^0 $$

$$ P(X=6) = 1 \cdot (0.2)^6 \cdot 1 $$

$$ P(X=6) = 0.000064 $$

Now we compute the complementary probability:

$$ P(\text{at least 1 works}) = 1 - 0.000064 $$

$$ P(\text{at least 1 works}) = 0.999936 $$

The probability is **99.99%**: it is almost certain that at least one lamp will light.

#### 3. The new probability with filtered fuel

With the new fuel, the probability of failure is $p' = 0.1$. The probability that a lamp works is $1 - p' = 0.9$.

The question asks for the probability that **no lamp fails**, which is $P(X=0)$ with the new probability $p'=0.1$.

$$ P(X=0) = \binom{6}{0} (0.1)^0 (0.9)^6 $$

$$ P(X=0) = 1 \cdot 1 \cdot (0.9)^6 $$

$$ P(X=0) = 0.531441 $$

With the filtered fuel, the probability that no lamp fails is **53.14%**.

<div style="border-left: 4px solid #4CAF50; padding: 0.5em; background-color: #e8f5e9; margin: 1em 0;">
  <strong>Summary of the Results:</strong>
  <ul>
    <li>Probability of exactly 2 failures: <strong>24.58%</strong></li>
    <li>Probability that at least 1 works: <strong>99.99%</strong></li>
    <li>Probability of no failures (new fuel): <strong>53.14%</strong></li>
  </ul>
</div>

<div style="border-left: 4px solid #2196F3; padding: 1em; background-color: #e3f2fd; margin: 1em 0; border-radius: 4px;">
  <img src="{{ site.baseurl }}/assets/images/lampiao.avif" alt="Kerosene lamp" style="float: right; width: 350px; margin-left: 1em; margin-bottom: 1em;">
  <h4 style="margin-top: 0;">🎲 Question 2: How Long the Lamps Last (Exponential Distribution)</h4>
  <p><strong>Problem:</strong></p>
  <p>The lifetime (in hours) of a citronella lamp is known to follow an <strong>exponential distribution</strong> with a mean of 6 hours (that is, rate parameter $\lambda = 1/6$).</p>
  <p><strong>Questions:</strong></p>
  <ol>
    <li>What is the probability that a lamp lasts <strong>more than 8 hours</strong>?</li>
    <li>If a resident has 4 identical lamps, what is the probability that <strong>at least one</strong> of them lasts more than 8 hours?</li>
    <li>Find the <strong>median</strong> of the distribution (the time by which half of the lamps have gone out).</li>
    <li>If a lamp has already been lit for 6 hours, what is the probability that it stays lit for <strong>at least 4 more hours</strong>? (Hint: use the "memoryless" property.)</li>
  </ol>
</div>

### Detailed Solution

A lamp's lifetime $T$ follows an Exponential distribution with mean $E[T] = 6$ hours. The rate parameter $\lambda$ is the inverse of the mean, so $\lambda = 1/6$.

The survival function of the exponential distribution is 

$$P(T > t) = e^{-\lambda t}$$

#### 1. Probability that a lamp lasts more than 8 hours

We use the survival function with $t=8$:

$$ P(T > 8) = e^{-\lambda \cdot 8} $$

$$ P(T > 8) = e^{-(1/6) \cdot 8} = e^{-8/6} \approx e^{-1.333} $$

$$ P(T > 8) \approx 0.2636 $$

The probability that a lamp lasts more than 8 hours is **26.36%**.

#### 2. Probability that at least 1 of 4 lamps lasts more than 8 hours

This is the complement of "none of the 4 lamps lasts more than 8 hours".
Let $p = P(T > 8) \approx 0.2636$. The probability that a lamp does NOT last more than 8 hours is $1-p$.

$$ P(\text{at least 1 > 8h}) = 1 - P(\text{none > 8h}) $$

$$ P(\text{at least 1 > 8h}) = 1 - (1 - p)^4 $$

$$ P(\text{at least 1 > 8h}) = 1 - (1 - 0.2636)^4 = 1 - (0.7364)^4 $$

$$ P(\text{at least 1 > 8h}) \approx 1 - 0.2941 \approx 0.7059 $$

The probability that at least one of the four lamps lasts more than 8 hours is **70.59%**.

#### 3. The median of the distribution

The median $m$ is the time $t$ for which $P(T > m) = 0.5$.

$$ e^{-\lambda m} = 0.5 $$

Solving for $m$:

$$ -\lambda m = \ln(0.5) = -\ln(2) $$

$$ m = \frac{\ln(2)}{\lambda} = \ln(2) \cdot 6 $$

$$ m \approx 0.6931 \cdot 6 \approx 4.1586 \text{ hours} $$

The median lifetime is about **4.16 hours**. Half of the lamps will have gone out before then.

#### 4. Conditional probability (the Memoryless Property)

The exponential distribution has the "memoryless" property, which says:

$$ P(T > s+t \mid T > s) = P(T > t) $$

We want the probability that the lamp lasts 4 more hours, given that it has already lasted 6 hours. That is, $s=6$ and $t=4$.

$$ P(T > 6+4 \mid T > 6) = P(T > 4) $$

We compute $P(T > 4)$:

$$ P(T > 4) = e^{-\lambda \cdot 4} = e^{-(1/6) \cdot 4} = e^{-4/6} \approx e^{-0.667} $$

$$ P(T > 4) \approx 0.5134 $$

The probability that the lamp lasts at least 4 more hours is **51.34%**, regardless of the fact that it has already been lit for 6 hours.

<div style="border-left: 4px solid #4CAF50; padding: 0.5em; background-color: #e8f5e9; margin: 1em 0;">
  <strong>Summary of the Results (Question 2):</strong>
  <ul>
    <li>Probability of lasting > 8h: <strong>26.36%</strong></li>
    <li>Probability that at least 1 of 4 lasts > 8h: <strong>70.59%</strong></li>
    <li>Median lifetime: <strong>4.16 hours</strong></li>
    <li>Probability of lasting 4 more hours (given 6h): <strong>51.34%</strong></li>
  </ul>
</div>

<div style="border-left: 4px solid #673AB7; padding: 1em; background-color: #ede7f6; margin: 1em 0; border-radius: 4px;">
  <img src="{{ site.baseurl }}/assets/images/telephone.avif" alt="Old telephone" style="float: right; width: 350px; margin-left: 1em; margin-bottom: 1em;">
  <h4 style="margin-top: 0;">📞 Question 3: Calls to a Call Center (Poisson Distribution)</h4>
  <p><strong>Problem:</strong></p>
  <p>A small call center receives calls at an average rate of 12 calls per hour. The number of calls received follows a <strong>Poisson distribution</strong>.</p>
  <p><strong>Questions:</strong></p>
  <ol>
    <li>What is the probability that the call center receives <strong>exactly 5 calls</strong> in a 30-minute period?</li>
    <li>What is the probability that <strong>no calls</strong> come in during a 10-minute interval?</li>
    <li>What is the probability of receiving <strong>more than 3 calls</strong> in a 20-minute period?</li>
  </ol>
</div>

### Detailed Solution

The number of events (calls) $X$ in a time interval follows a Poisson distribution. The Poisson probability formula is:

$$ P(X=k) = \frac{e^{-\lambda} \lambda^k}{k!} $$

In this formula, the parameter $\lambda$ (lambda) is the average number of occurrences **in the specific time interval** we are analyzing. The base rate in the problem is 12 calls per hour, and we must adjust it for each part.

#### 1. Probability of exactly 5 calls in 30 minutes

First, we adjust the rate to the time interval.
- Interval: $30 \text{ minutes} = 0.5 \text{ hours}$.
- Average number in the interval ($\lambda$): $12 \text{ calls/hour} \times 0.5 \text{ hours} = 6$.

Now we compute $P(X=5)$ for $\lambda=6$:

$$ P(X=5) = \frac{e^{-6} \cdot 6^5}{5!} $$

$$ P(X=5) = \frac{0.002479 \cdot 7776}{120} \approx \frac{19.28}{120} \approx 0.1606 $$

The probability of receiving exactly 5 calls in 30 minutes is **16.06%**.

#### 2. Probability of no calls in 10 minutes

We adjust the rate to the new interval.
- Interval: $10 \text{ minutes} = 1/6 \text{ hours}$.
- Average number in the interval ($\lambda$): $12 \times (1/6) = 2$.

We compute $P(X=0)$ for $\lambda=2$:

$$ P(X=0) = \frac{e^{-2} \cdot 2^0}{0!} = e^{-2} \approx 0.1353 $$

The probability of receiving no calls in 10 minutes is **13.53%**.

#### 3. Probability of more than 3 calls in 20 minutes

"More than 3 calls" is the complement of "3 calls or fewer".

$$ P(X > 3) = 1 - P(X \le 3) = 1 - [P(X=0) + P(X=1) + P(X=2) + P(X=3)] $$

We adjust the rate to the interval.
- Interval: $20 \text{ minutes} = 1/3 \text{ hours}$.
- Average number in the interval ($\lambda$): $12 \times (1/3) = 4$.

We compute the probabilities for $k=0, 1, 2, 3$ with $\lambda=4$:
- $P(X=0) = \frac{e^{-4} 4^0}{0!} \approx 0.0183$
- $P(X=1) = \frac{e^{-4} 4^1}{1!} \approx 0.0733$
- $P(X=2) = \frac{e^{-4} 4^2}{2!} \approx 0.1465$
- $P(X=3) = \frac{e^{-4} 4^3}{3!} \approx 0.1954$

Adding them up:

$$ P(X \le 3) \approx 0.0183 + 0.0733 + 0.1465 + 0.1954 = 0.4335 $$

Finally, we take the complement:

$$ P(X > 3) = 1 - 0.4335 = 0.5665 $$

The probability of receiving more than 3 calls in 20 minutes is **56.65%**.

<div style="border-left: 4px solid #4CAF50; padding: 0.5em; background-color: #e8f5e9; margin: 1em 0;">
  <strong>Summary of the Results (Question 3):</strong>
  <ul>
    <li>Probability of 5 calls in 30 min: <strong>16.06%</strong></li>
    <li>Probability of 0 calls in 10 min: <strong>13.53%</strong></li>
    <li>Probability of >3 calls in 20 min: <strong>56.65%</strong></li>
  </ul>
</div>

<div style="border-left: 4px solid #FF9800; padding: 1em; background-color: #fff3e0; margin: 1em 0; border-radius: 4px;">
  <img src="{{ site.baseurl }}/assets/images/telephone.avif" alt="Old telephone" style="float: right; width: 320px; margin-left: 1em; margin-bottom: 1em;">
  <h4 style="margin-top: 0;">📞 Question 4: How Long Calls Last (Normal Distribution)</h4>
  <p><strong>Problem:</strong></p>
  <p>The length of technical support calls at a call center follows a <strong>Normal distribution</strong> with a mean ($\mu$) of 10 minutes and a standard deviation ($\sigma$) of 2 minutes.</p>
  <p><strong>Questions:</strong></p>
  <ol>
    <li>What is the probability that a call lasts <strong>less than 7 minutes</strong>?</li>
    <li>What is the probability that a call lasts <strong>between 9 and 12 minutes</strong>?</li>
    <li>What is the minimum length of the <strong>longest 5% of calls</strong>?</li>
  </ol>
</div>

### Detailed Solution

The call length $X$ follows a Normal distribution, $X \sim N(\mu=10, \sigma=2)$. To solve it, we standardize the values of $X$ to the Standard Normal distribution ($Z$) using the Z-score formula:

$$ Z = \frac{X - \mu}{\sigma} $$

#### 1. Probability that a call lasts less than 7 minutes

We want $P(X < 7)$. First, we compute the Z-score for $X=7$:

$$ Z = \frac{7 - 10}{2} = \frac{-3}{2} = -1.5 $$

Now we look up $P(Z < -1.5)$ in a Z table or with a calculator.

$$ P(Z < -1.5) \approx 0.0668 $$

The probability that a call lasts less than 7 minutes is **6.68%**.

#### 2. Probability that a call lasts between 9 and 12 minutes

We want $P(9 < X < 12)$. We compute the Z-scores for $X=9$ and $X=12$:
- For $X=9$: $Z_1 = \frac{9 - 10}{2} = -0.5$
- For $X=12$: $Z_2 = \frac{12 - 10}{2} = 1.0$

The probability is the area between those two Z-scores: $P(-0.5 < Z < 1.0) = P(Z < 1.0) - P(Z < -0.5)$.
- $P(Z < 1.0) \approx 0.8413$
- $P(Z < -0.5) \approx 0.3085$

$$ P(9 < X < 12) \approx 0.8413 - 0.3085 = 0.5328 $$

The probability that a call lasts between 9 and 12 minutes is **53.28%**.

#### 3. Minimum length of the longest 5% of calls

We want the value $x$ such that $P(X > x) = 0.05$. That is the same as finding a Z-score $z$ such that $P(Z > z) = 0.05$, which means $P(Z < z) = 0.95$.
From an inverse Z table, the Z-score with an area of 0.95 to its left is about $z \approx 1.645$.

Now we convert that Z-score back to minutes using the rearranged formula $X = \mu + Z \cdot \sigma$.

$$ x = 10 + (1.645 \cdot 2) $$

$$ x = 10 + 3.29 = 13.29 \text{ minutes} $$

The longest 5% of calls last at least **13.29 minutes**.

<div style="border-left: 4px solid #4CAF50; padding: 0.5em; background-color: #e8f5e9; margin: 1em 0;">
  <strong>Summary of the Results (Question 4):</strong>
  <ul>
    <li>Probability of a call < 7 min: <strong>6.68%</strong></li>
    <li>Probability of a call between 9 and 12 min: <strong>53.28%</strong></li>
    <li>Minimum length of the longest 5% of calls: <strong>13.29 minutes</strong></li>
  </ul>
</div>

<div style="border-left: 4px solid #009688; padding: 1em; background-color: #e0f2f1; margin: 1em 0; border-radius: 4px;">
  <img src="{{ site.baseurl }}/assets/images/boxkite.avif" alt="Box kite" style="float: right; width: 350px; margin-left: 1em; margin-bottom: 1em;">
  <h4 style="margin-top: 0;">🪁 Question 5: Attempts to Fly a Kite (Geometric Distribution)</h4>
  <p><strong>Problem:</strong></p>
  <p>A kite enthusiast knows that, because the wind keeps changing, the probability of getting the kite up on any given attempt is 40% (p=0.4). Each attempt is independent of the previous one.</p>
  <p><strong>Questions:</strong></p>
  <ol>
    <li>What is the probability of getting the kite up on the <strong>first attempt</strong>?</li>
    <li>What is the probability that it takes <strong>exactly 3 attempts</strong> to succeed?</li>
    <li>What is the probability that it takes <strong>more than 4 attempts</strong>?</li>
  </ol>
</div>

### Detailed Solution

This problem describes a series of independent Bernoulli trials, where we care about the number of attempts until the first success. That is modeled by the **Geometric Distribution**.

Let $X$ be the number of attempts until the first success. The probability of success is $p=0.4$. The geometric distribution formula is:

$$ P(X = k) = (1-p)^{k-1} p $$

#### 1. Probability of success on the first attempt

We want $P(X=1)$. Using the formula with $k=1$:

$$ P(X=1) = (1-0.4)^{1-1} \cdot 0.4 $$

$$ P(X=1) = (0.6)^0 \cdot 0.4 = 1 \cdot 0.4 = 0.4 $$

The probability of success on the first attempt is **40%**.

#### 2. Probability of success on the third attempt

We want $P(X=3)$. That means two failures followed by a success.

$$ P(X=3) = (1-0.4)^{3-1} \cdot 0.4 $$

$$ P(X=3) = (0.6)^2 \cdot 0.4 = 0.36 \cdot 0.4 = 0.144 $$

The probability that it takes exactly 3 attempts is **14.4%**.

#### 3. Probability of needing more than 4 attempts

We want $P(X > 4)$. That means the first 4 attempts must all fail. The probability of a single failure is $(1-p) = 0.6$.

$$ P(X > 4) = P(\text{fail on 1st}) \cdot P(\text{fail on 2nd}) \cdot P(\text{fail on 3rd}) \cdot P(\text{fail on 4th}) $$

$$ P(X > 4) = (1-p)^4 = (0.6)^4 $$

$$ P(X > 4) = 0.1296 $$

The probability of needing more than 4 attempts to get the kite up is **12.96%**.

<div style="border-left: 4px solid #4CAF50; padding: 0.5em; background-color: #e8f5e9; margin: 1em 0;">
  <strong>Summary of the Results (Question 5):</strong>
  <ul>
    <li>Probability of success on the 1st attempt: <strong>40%</strong></li>
    <li>Probability of success on the 3rd attempt: <strong>14.4%</strong></li>
    <li>Probability of needing > 4 attempts: <strong>12.96%</strong></li>
  </ul>
</div>

<div style="border-left: 4px solid #009688; padding: 1em; background-color: #e0f2f1; margin: 1em 0; border-radius: 4px;">
  <img src="{{ site.baseurl }}/assets/images/boxkite.avif" alt="Box kite" style="float: right; width: 350px; margin-left: 1em; margin-bottom: 1em;">
  <h4 style="margin-top: 0;">🪁 Question 6: Several Successes with the Kite (Negative Binomial)</h4>
  <p><strong>Problem:</strong></p>
  <p>The same kite enthusiast, with a 40% chance of success on each attempt, now wants to get the kite up 3 times in total to practice a maneuver. The attempts are independent.</p>
  <p><strong>Questions:</strong></p>
  <ol>
    <li>What is the probability that the <strong>third success</strong> comes exactly on the <strong>fifth attempt</strong>?</li>
    <li>What is the <strong>expected number of attempts</strong> needed to reach 3 successes?</li>
  </ol>
</div>

### Detailed Solution

This problem asks for the number of attempts needed to reach a fixed number of successes ($r$). That is modeled by the **Negative Binomial Distribution**.

Let $X$ be the attempt on which the $r$-th success happens. The formula is:

$$ P(X = k) = \binom{k-1}{r-1} p^r (1-p)^{k-r} $$

Where $r=3$ (successes), $p=0.4$ (probability of success), and $k$ is the total number of attempts.

#### 1. Probability of the 3rd success on the 5th attempt

Here, $r=3$ and $k=5$. For the 3rd success to come on the 5th attempt, we need exactly $r-1=2$ successes in the $k-1=4$ previous attempts, and the 5th attempt must be a success.

$$ P(X=5) = \binom{5-1}{3-1} (0.4)^3 (1-0.4)^{5-3} $$

$$ P(X=5) = \binom{4}{2} (0.4)^3 (0.6)^2 $$

Computing the terms:
- $\binom{4}{2} = \frac{4!}{2!2!} = 6$
- $(0.4)^3 = 0.064$
- $(0.6)^2 = 0.36$

Putting the results together:

$$ P(X=5) = 6 \cdot 0.064 \cdot 0.36 = 0.13824 $$

The probability that the third success comes on the fifth attempt is **13.82%**.

#### 2. Expected number of attempts

For the negative binomial distribution, the expected value (mean) of the number of attempts ($X$) needed to reach $r$ successes is:

$$ E[X] = \frac{r}{p} $$

With $r=3$ and $p=0.4$:

$$ E[X] = \frac{3}{0.4} = 7.5 $$

The expected number of attempts to get the kite up 3 times is **7.5**.

---

## References

1. Ross, S. M. **Introduction to Probability Models**. 12th ed. Academic Press, 2019.
2. Papoulis, A.; Pillai, S. U. **Probability, Random Variables and Stochastic Processes**. 4th ed. McGraw-Hill, 2002.
3. Feller, W. **An Introduction to Probability Theory and Its Applications**. Vol. 1, 3rd ed. Wiley, 1968.
4. DeGroot, M. H.; Schervish, M. J. **Probability and Statistics**. 4th ed. Pearson, 2012.
5. Mood, A. M.; Graybill, F. A.; Boes, D. C. **Introduction to the Theory of Statistics**. 3rd ed. McGraw-Hill, 1974.
