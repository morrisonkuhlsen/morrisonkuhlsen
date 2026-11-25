---
layout: page
title: Statistical Inference
lang: en
ref: inferencia-estatistica
permalink: /en/statistical-inference/
order: 3
mathjax: true
description: "Statistical inference: population and sample, standard error, Central Limit Theorem, confidence intervals, hypothesis tests, p-values and effect size."
---

<style>
  .mk-hero {
    padding: 2rem;
    margin: 1.5rem 0 2rem;
    border-radius: 22px;
    background: linear-gradient(135deg, #fff8e8 0%, #f7e0c6 45%, #fffdf8 100%);
    border: 1px solid rgba(120, 72, 20, 0.12);
    box-shadow: 0 12px 30px rgba(80, 45, 10, 0.08);
  }

  .mk-hero h1 {
    margin-top: 0;
    color: #0b1f35;
    font-size: clamp(2rem, 4vw, 3rem);
    line-height: 1.1;
  }

  .mk-hero p {
    font-size: 1.08rem;
    color: #34495e;
    max-width: 800px;
    line-height: 1.75;
  }

  .mk-tag {
    display: inline-block;
    margin-bottom: 0.8rem;
    padding: 0.35rem 0.75rem;
    border-radius: 999px;
    background: #0b1f35;
    color: #fff8e8;
    font-size: 0.82rem;
    font-weight: 700;
    letter-spacing: 0.03em;
  }

  .mk-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
    gap: 1rem;
    margin: 1.5rem 0;
  }

  .mk-card {
    padding: 1.25rem;
    border-radius: 18px;
    background: var(--mk-surface);
    border: 1px solid var(--mk-border);
    box-shadow: 0 8px 22px rgba(11, 31, 53, 0.06);
    transition: transform 0.25s ease, box-shadow 0.25s ease;
  }

  .mk-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 14px 32px rgba(11, 31, 53, 0.1);
  }

  .mk-card h3 {
    margin-top: 0;
    color: var(--mk-ink);
  }

  .mk-card p {
    color: var(--mk-ink-soft);
    line-height: 1.65;
  }

  .mk-note {
    padding: 1.2rem 1.4rem;
    border-left: 5px solid #c47a2c;
    background: var(--mk-tint-warn);
    border-radius: 12px;
    margin: 1.5rem 0;
    color: var(--mk-ink);
  }

  .mk-formula {
    padding: 1.2rem;
    margin: 1.2rem 0;
    border-radius: 16px;
    background: var(--mk-surface-2);
    border: 1px solid var(--mk-border);
    overflow-x: auto;
  }

  .mk-table {
    width: 100%;
    border-collapse: collapse;
    margin: 1.4rem 0;
    overflow: hidden;
    border-radius: 14px;
    box-shadow: 0 8px 20px rgba(11, 31, 53, 0.06);
  }

  .mk-table th {
    background: #0b1f35;
    color: #fff8e8;
    text-align: left;
    padding: 0.85rem;
  }

  .mk-table td {
    padding: 0.85rem;
    border-bottom: 1px solid var(--mk-border);
    background: var(--mk-surface);
    color: var(--mk-ink);
    vertical-align: top;
  }

  .mk-table tr:last-child td {
    border-bottom: none;
  }

  .mk-example {
    padding: 1.4rem;
    border-radius: 18px;
    background: linear-gradient(135deg, var(--mk-surface) 0%, var(--mk-tint-warn) 100%);
    border: 1px solid rgba(196, 122, 44, 0.18);
    box-shadow: 0 10px 25px rgba(11, 31, 53, 0.06);
    margin: 1.5rem 0;
  }

  .mk-example h3 {
    margin-top: 0;
    color: var(--mk-ink);
  }

  .mk-quote {
    margin: 2rem 0;
    padding: 1.4rem 1.6rem;
    border-radius: 18px;
    background: #0b1f35;
    color: #fff8e8;
    font-size: 1.1rem;
    line-height: 1.7;
  }

  .mk-quote strong {
    color: #f7e0c6;
  }
</style>

<section class="mk-hero">
  <span class="mk-tag">INFERENCE • SAMPLES • STATISTICAL DECISIONS</span>

  <h1>Statistical Inference</h1>

  <p>
    <strong>Statistical inference</strong> is the part of statistics that lets us
    draw conclusions about a population from a sample. We use it when we cannot
    observe every individual of interest but want to estimate quantities, test
    hypotheses and make decisions based on data, while also saying how much
    uncertainty those conclusions carry.
  </p>
</section>

## What Is Statistical Inference?

In [Descriptive Statistics]({{ '/en/descriptive-statistics/' | relative_url }}), we organize and summarize the observed data.  
In [Probability]({{ '/en/probability/' | relative_url }}), we study uncertainty mathematically.  
In Statistical Inference, we combine these two ideas to answer one central question:

> What can we conclude about a population using only a sample?

This kind of reasoning appears in election polls, medical studies, quality control,
market research, scientific experiments, economic models and many other settings.

<div class="mk-note">
  <strong>Central idea:</strong> statistical inference turns sample data into
  conclusions about a population, always accounting for the uncertainty involved.
</div>

### Pages in this section

The topics below go into each part of this page in detail, with worked examples and Julia code:

- [Sampling]({{ '/en/statistical-inference/sampling' | relative_url }}): how to choose the sample (simple random, stratified, cluster, systematic) and how large it should be.
- [Hypothesis Testing]({{ '/en/statistical-inference/hypothesis-testing' | relative_url }}): hypotheses, test statistic, p-value, Type I and Type II errors, and power.
- [Confidence Intervals]({{ '/en/statistical-inference/confidence-intervals' | relative_url }}): how to build and interpret intervals for means and proportions.
- [Estimators]({{ '/en/statistical-inference/estimators' | relative_url }}): bias, variance, mean squared error and maximum likelihood.
- [Analysis of Variance (ANOVA)]({{ '/en/statistical-inference/analysis-of-variance' | relative_url }}): comparing the means of several groups with the F test, and Tukey's test.

---

## Population and Sample

Two concepts are fundamental to inference: the **population** and the **sample**.

<div class="mk-grid">

  <div class="mk-card">
    <h3>Population</h3>
    <p>
      The complete set of elements we want to study. It can be made up of people,
      companies, service calls, measurements, products, municipalities or any unit
      of interest.
    </p>
  </div>

  <div class="mk-card">
    <h3>Sample</h3>
    <p>
      A part of the population selected for analysis. From it, we try to estimate
      characteristics of the whole population.
    </p>
  </div>

  <div class="mk-card">
    <h3>Parameter</h3>
    <p>
      A true measure of the population, usually unknown, such as the population
      mean, the population proportion or the population variance.
    </p>
  </div>

  <div class="mk-card">
    <h3>Statistic</h3>
    <p>
      A measure computed from the sample, such as the sample mean, the sample
      proportion or the sample standard deviation.
    </p>
  </div>

</div>

---

## Parameter versus Statistic

The difference between a parameter and a statistic is one of the most important ideas in statistical inference. Greek letters usually denote parameters; Latin letters, statistics.

<table class="mk-table">
  <thead>
    <tr>
      <th>Concept</th>
      <th>Represents</th>
      <th>Examples</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Parameter</td>
      <td>A characteristic of the population (a fixed number, usually unknown).</td>
      <td>$\mu$ (mean), $\sigma^2$ (variance), $p$ (proportion)</td>
    </tr>
    <tr>
      <td>Statistic</td>
      <td>A characteristic computed from the sample (changes from sample to sample).</td>
      <td>$\bar{x}$ (mean), $s^2$ (variance), $\hat{p}$ (proportion)</td>
    </tr>
  </tbody>
</table>

For example, if we want to know the mean income of all residents of a city, that true mean, $\mu$, is a parameter. If we interview 500 randomly chosen residents and compute the mean of that sample, we get a statistic, $\bar{x}$.

---

## Why Do We Need Inference?

In many real problems, observing the whole population is impossible, expensive or slow.

Imagine, for example:

- interviewing every voter in a country;
- testing the durability of every product made (the test destroys the product);
- measuring every inhabitant of a city;
- following every patient in a population;
- checking every service call in a system over several years.

That is why we use samples.

The big issue is that samples vary.  
If we draw two different samples from the same population, we will hardly ever get exactly the same mean, proportion or standard deviation.

<div class="mk-note">
  Statistical inference exists precisely because samples carry information, but also
  uncertainty. And it only works well if the sample is chosen carefully, ideally at
  random: no formula fixes a biased sample (see
  <a href="{{ '/en/statistical-inference/sampling' | relative_url }}">Sampling</a>).
</div>

---

## Point Estimation

Point estimation means using a single value computed from the sample to estimate a population parameter.

For example, we use the sample mean to estimate the population mean, and the sample proportion to estimate the population proportion:

<div class="mk-formula">

$$
\bar{x} \approx \mu \qquad\qquad \hat{p} \approx p
$$

</div>

<table class="mk-table">
  <thead>
    <tr>
      <th>Population parameter</th>
      <th>Sample estimator</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Population mean: $\mu$</td>
      <td>Sample mean: $\bar{x}$</td>
    </tr>
    <tr>
      <td>Population proportion: $p$</td>
      <td>Sample proportion: $\hat{p}$</td>
    </tr>
    <tr>
      <td>Population variance: $\sigma^2$</td>
      <td>Sample variance: $s^2$ (with divisor $n - 1$)</td>
    </tr>
  </tbody>
</table>

How to judge whether an estimator is good (bias, variance, mean squared error) is covered in [Estimators]({{ '/en/statistical-inference/estimators' | relative_url }}).

---

## Sampling Error

Since the sample is only part of the population, there is a natural difference between the sample value and the population value.

That difference is called **sampling error**. For the mean:

<div class="mk-formula">

$$
\text{Sampling error} = \bar{x} - \mu
$$

</div>

In practice, we do not know $\mu$, so we cannot know the sampling error of a specific sample. What we can do is measure **how large it tends to be** from sample to sample. This idea leads to the concept of **standard error**.

Sampling error is different from errors that do not come from the random draw (badly worded questions, people who do not respond, a miscalibrated instrument). Those do not shrink with a larger sample.

---

## Standard Error of the Mean

The **standard error** of a statistic is the standard deviation of its sampling distribution: it measures how much the statistic varies from one sample to another.

If the $n$ observations are independent and come from a population with standard deviation $\sigma$, the standard error of the mean is:

<div class="mk-formula">

$$
SE(\bar{x}) = \frac{\sigma}{\sqrt{n}}
$$

</div>

When $\sigma$ is unknown (the most common case), it is **estimated** by replacing $\sigma$ with the sample standard deviation $s$:

<div class="mk-formula">

$$
\widehat{SE}(\bar{x}) = \frac{s}{\sqrt{n}}
$$

</div>

Where:

- $SE(\bar{x})$ is the standard error of the mean;
- $\sigma$ is the population standard deviation, and $s$, the sample one;
- $n$ is the sample size.

<div class="mk-note">
  The larger the sample, the smaller the standard error, but slowly: since $n$ sits
  inside the square root, cutting the standard error in half requires
  <strong>quadrupling</strong> the sample.
</div>

---

## Sampling Distribution

The sampling distribution is the distribution of a statistic computed over all possible samples of the same size.

For example, if we drew many samples of size $n$ from the same population and computed the mean of each one, we would have many sample means:

<div class="mk-formula">

$$
\bar{x}_1,\ \bar{x}_2,\ \bar{x}_3,\ \ldots
$$

</div>

The distribution of these values is called the **sampling distribution of the mean**. In practice we have only one sample; the sampling distribution is what theory tells us about all the samples we **could** have drawn.

This idea is the basis of confidence intervals and hypothesis tests.

---

## Central Limit Theorem

The [Central Limit Theorem]({{ '/en/probability/central-limit-theorem' | relative_url }}) (CLT) is one of the most important results in statistics.

For independent observations from the same distribution, with mean $\mu$ and finite variance $\sigma^2$, the following always hold, for any $n$:

- the mean of the sampling distribution of $\bar{X}$ is exactly $\mu$: $E[\bar{X}] = \mu$;
- the variance of $\bar{X}$ is $\sigma^2 / n$, which decreases as $n$ grows.

The CLT adds the **shape**: as $n$ grows, the distribution of $\bar{X}$ approaches a normal distribution, **even if the population is not normal**:

<div class="mk-formula">

$$
\bar{X} \approx N\left(\mu,\ \frac{\sigma^2}{n}\right) \quad \text{for large } n
$$

</div>

How large $n$ needs to be depends on the population: for symmetric populations, the approximation is already good with small samples; for very skewed populations, it may take many more. The well-known "$n \geq 30$" is a rule of thumb, not a theorem.

<div class="mk-note">
  The Central Limit Theorem explains why the normal distribution shows up so often in
  statistical inference, even when the data themselves are not normal.
</div>

---

## Confidence Interval

A point estimate gives a single value, which is almost never exactly equal to the parameter.  
So it is usually better to give a range of plausible values for the parameter, built with a margin of error.

That range is called a **confidence interval**.

When $\sigma$ is known, a confidence interval for the mean is:

<div class="mk-formula">

$$
CI = \bar{x} \pm z_{\alpha/2}\cdot \frac{\sigma}{\sqrt{n}}
$$

</div>

When $\sigma$ is unknown and we use $s$, the critical value comes from Student's t distribution with $n - 1$ degrees of freedom:

<div class="mk-formula">

$$
CI = \bar{x} \pm t_{\alpha/2,\ n-1}\cdot \frac{s}{\sqrt{n}}
$$

</div>

Where:

- $\bar{x}$ is the sample mean;
- $1 - \alpha$ is the confidence level (for example, $\alpha = 0.05$ for 95%);
- $z_{\alpha/2}$ is the critical value of the standard normal distribution (1.96 for 95%);
- $t_{\alpha/2,\ n-1}$ is the critical value of the t distribution;
- $s$ is the sample standard deviation;
- $n$ is the sample size.

Both formulas assume independent observations and either a normal population or $n$ large enough for the CLT to apply. Details and examples in [Confidence Intervals]({{ '/en/statistical-inference/confidence-intervals' | relative_url }}).

---

## How to Interpret a Confidence Interval

A 95% confidence interval does **not** mean there is a 95% chance that the parameter lies in that specific interval, once it has been computed. The parameter is a fixed number: either it is inside or it is not.

The correct (frequentist) interpretation is about the **method**:

> If we repeated the sampling process many times and built a confidence interval from each sample, about 95% of those intervals would contain the true population parameter.

<div class="mk-example">
  <h3>Example</h3>

  <p>Suppose (illustrative numbers) that a survey estimates the mean service time
  with the 95% interval $CI_{95\%} = [8.4,\ 10.2]$ minutes.</p>

  <p>This means the interval was built by a method that captures the true mean in 95% of
  samples, and that the values from 8.4 to 10.2 minutes are the ones compatible with the data
  by that criterion. It does not mean that 95% of service calls last between 8.4 and 10.2
  minutes: the interval is about the <strong>mean</strong>, not about each call.</p>
</div>

---

## Hypothesis Tests

Hypothesis tests are used to assess claims about population parameters.

They help answer questions such as:

- Is the mean of a population different from a certain value?
- Are two means statistically different?
- Has a proportion changed over time?
- Is there an association between two categorical variables?
- Did a treatment have a measurable effect?

Every hypothesis test starts with two hypotheses:

<table class="mk-table">
  <thead>
    <tr>
      <th>Hypothesis</th>
      <th>Meaning</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>$H_0$</td>
      <td>Null hypothesis. Usually represents no effect, no difference or a reference value.</td>
    </tr>
    <tr>
      <td>$H_1$ or $H_a$</td>
      <td>Alternative hypothesis. Represents what we want to look for evidence of.</td>
    </tr>
  </tbody>
</table>

The test starts from $H_0$ and asks whether the data are too unusual for it. Details in [Hypothesis Testing]({{ '/en/statistical-inference/hypothesis-testing' | relative_url }}).

---

## Example of Hypotheses

Suppose a company claims that the mean service time is 10 minutes.

We want to check whether the data indicate that the mean time is different from 10 minutes.

The hypotheses would be:

<div class="mk-formula">

$$
H_0: \mu = 10
$$

$$
H_1: \mu \neq 10
$$

</div>

This is a **two-sided test**, because we are interested in differences both upward and downward.

---

## Test Statistic

The test statistic turns the sample data into a standardized value that can be compared with a known distribution.

To test a mean with a known population standard deviation, we use the Z statistic, which under $H_0$ follows the standard normal distribution:

<div class="mk-formula">

$$
Z = \frac{\bar{x} - \mu_0}{\sigma/\sqrt{n}}
$$

</div>

When the population standard deviation is unknown, we use the t statistic, which under $H_0$ follows Student's t distribution with $n - 1$ degrees of freedom (assuming a normal population or large $n$):

<div class="mk-formula">

$$
t = \frac{\bar{x} - \mu_0}{s/\sqrt{n}}
$$

</div>

Where:

- $\bar{x}$ is the sample mean;
- $\mu_0$ is the value of the mean under the null hypothesis;
- $\sigma$ is the population standard deviation, and $s$, the sample one;
- $n$ is the sample size.

---

## p-Value

The **p-value** is the probability of getting a result **as extreme as or more extreme than** the one observed, **assuming the null hypothesis is true**.

If the p-value is very small, the data would be rare if $H_0$ were true, and that is evidence against $H_0$.

A common reading, which is only a **convention** (not a rule of mathematics), is:

<table class="mk-table">
  <thead>
    <tr>
      <th>p-value</th>
      <th>Common reading</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>$p \leq 0.01$</td>
      <td>Strong evidence against $H_0$.</td>
    </tr>
    <tr>
      <td>$0.01 &lt; p \leq 0.05$</td>
      <td>Moderate evidence against $H_0$.</td>
    </tr>
    <tr>
      <td>$p &gt; 0.05$</td>
      <td>Not enough evidence to reject $H_0$ at the 5% level.</td>
    </tr>
  </tbody>
</table>

<div class="mk-note">
  <strong>What the p-value is not:</strong> it is not the probability that $H_0$ is true,
  nor the probability that the result is "just chance", nor a measure of effect size.
  And a high p-value does not prove that $H_0$ is true: it only indicates that the data
  did not provide enough evidence against it.
</div>

---

## Significance Level

The significance level is denoted by $\alpha$. It is chosen **before** looking at the data and sets the threshold used to decide whether or not to reject the null hypothesis.

The most common value is $\alpha = 0.05$, but it is a convention; different fields use different values.

The decision rule is:

<table class="mk-table">
  <thead>
    <tr>
      <th>Condition</th>
      <th>Decision</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>$p \leq \alpha$</td>
      <td>We reject $H_0$.</td>
    </tr>
    <tr>
      <td>$p &gt; \alpha$</td>
      <td>We do not reject $H_0$.</td>
    </tr>
  </tbody>
</table>

---

## Type I and Type II Errors

Since tests are based on samples, statistical decisions can be wrong.

<table class="mk-table">
  <thead>
    <tr>
      <th>Type of error</th>
      <th>What happens?</th>
      <th>Probability</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Type I error</td>
      <td>Rejecting $H_0$ when $H_0$ is true (false positive).</td>
      <td>$\alpha$</td>
    </tr>
    <tr>
      <td>Type II error</td>
      <td>Not rejecting $H_0$ when $H_0$ is false (false negative).</td>
      <td>$\beta$ (depends on how far the true value is from $H_0$)</td>
    </tr>
  </tbody>
</table>

The **statistical power** of a test is the probability of correctly rejecting $H_0$ when it is false:

<div class="mk-formula">

$$
\text{Power} = 1 - \beta
$$

</div>

For the same $\alpha$, power increases with the sample size and with the effect size.

---

## One-Sided and Two-Sided Tests

The alternative hypothesis can take different forms. The choice is made before seeing the data, based on the question.

<table class="mk-table">
  <thead>
    <tr>
      <th>Type of test</th>
      <th>Alternative hypothesis</th>
      <th>When to use it?</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Two-sided</td>
      <td>$H_1: \mu \neq \mu_0$</td>
      <td>When we want to know whether there is a difference in either direction.</td>
    </tr>
    <tr>
      <td>Right-tailed</td>
      <td>$H_1: \mu &gt; \mu_0$</td>
      <td>When we only care whether the mean is greater than the reference value.</td>
    </tr>
    <tr>
      <td>Left-tailed</td>
      <td>$H_1: \mu &lt; \mu_0$</td>
      <td>When we only care whether the mean is less than the reference value.</td>
    </tr>
  </tbody>
</table>

---

## Main Statistical Tests

<table class="mk-table">
  <thead>
    <tr>
      <th>Test</th>
      <th>Main use</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Z-test</td>
      <td>Testing a mean when the population standard deviation is known, or a proportion with a large sample.</td>
    </tr>
    <tr>
      <td>Student's t-test</td>
      <td>Testing means (one sample, two samples or paired data) when the population standard deviation is unknown.</td>
    </tr>
    <tr>
      <td>Chi-square test</td>
      <td>Testing association between categorical variables or goodness of fit to a distribution.</td>
    </tr>
    <tr>
      <td>ANOVA</td>
      <td>Comparing the means of two or more groups (used mostly with three or more). See <a href="{{ '/en/statistical-inference/analysis-of-variance' | relative_url }}">Analysis of Variance</a>.</td>
    </tr>
    <tr>
      <td>Pearson correlation</td>
      <td>Assessing the linear association between two quantitative variables.</td>
    </tr>
    <tr>
      <td>Linear regression</td>
      <td>Modeling the relationship between a response variable and one or more explanatory variables.</td>
    </tr>
  </tbody>
</table>

---

## Worked Example: Test for a Mean

Suppose (illustrative numbers) that a random sample of 36 service calls gave:

- sample size: $n = 36$;
- sample mean: $\bar{x} = 12$ minutes;
- sample standard deviation: $s = 6$ minutes;
- reference value (the company's claim): $\mu_0 = 10$ minutes;
- significance level: $\alpha = 0.05$.

**Hypotheses:**

<div class="mk-formula">

$$
H_0: \mu = 10 \qquad\qquad H_1: \mu \neq 10
$$

</div>

**Conditions.** The calls were randomly selected (independence). The population standard deviation is unknown, so we use the t statistic. With $n = 36$, the t distribution works even if the times are not exactly normal, as long as they are not very skewed.

**Formula and substitution:**

<div class="mk-formula">

$$
t = \frac{\bar{x} - \mu_0}{s/\sqrt{n}} = \frac{12 - 10}{6/\sqrt{36}}
$$

</div>

**Arithmetic, one step per line:**

<div class="mk-formula">

$$
\sqrt{36} = 6
$$

$$
\frac{s}{\sqrt{n}} = \frac{6}{6} = 1 \text{ minute} \quad \text{(estimated standard error)}
$$

$$
\bar{x} - \mu_0 = 12 - 10 = 2 \text{ minutes}
$$

$$
t = \frac{2}{1} = 2
$$

</div>

**Degrees of freedom:**

<div class="mk-formula">

$$
df = n - 1 = 36 - 1 = 35
$$

</div>

**Decision using the critical value.** For a two-sided test at 5%, the critical value is the 97.5% quantile of the t distribution with 35 degrees of freedom: $t_{0.025;\,35} = 2.030$ (t table; in Julia, `quantile(TDist(35), 0.975)` gives 2.0301). Since $\lvert t \rvert = 2 &lt; 2.030$, we **do not reject** $H_0$.

**Decision using the p-value.** $p = 2 \times P(T_{35} \geq 2) = 0.0533$ (in Julia, `2 * ccdf(TDist(35), 2)`). Since $0.0533 &gt; 0.05$, the decision is the same: do not reject $H_0$.

**Check with the interval.** The 95% interval is $12 \pm 2.0301 \times 1 = [9.97,\ 14.03]$ minutes. It contains 10, which agrees with not rejecting $H_0$.

**Interpretation.** The sample mean is 2 minutes above the advertised value, but with this sample size and this much variation, such a difference is not rare enough to rule out a true mean of 10 minutes. This does **not prove** that the mean is 10: the interval shows that values from about 10 up to 14 minutes are compatible with the data.

<div class="mk-note">
  <strong>A borderline result.</strong> The p-value of 0.0533 is very close to 0.05. If
  someone mistakenly used the normal distribution instead of the t, they would get
  $p = 2 \times P(Z \geq 2) = 0.0455$ and the decision would flip. That is why it matters to use
  the right distribution and to report the p-value with enough decimal places, instead of
  just saying "significant" or "not significant".
</div>

---

## Effect Size

Not every statistically significant result matters in practice, and a non-significant result can hide a relevant effect measured with little precision.

So, besides the p-value, it is important to look at the **effect size**.

For a mean, a common measure is **Cohen's d**, the difference measured in standard deviations:

<div class="mk-formula">

$$
d = \frac{\bar{x} - \mu_0}{s}
$$

</div>

In the previous example:

<div class="mk-formula">

$$
d = \frac{12 - 10}{6} = \frac{2}{6} = \frac{1}{3} \approx 0.33
$$

</div>

**Interpretation:** the sample mean is one third of a standard deviation above the advertised value. By the benchmarks Cohen (1988) proposed for the behavioral sciences (0.2 small, 0.5 medium, 0.8 large), this is an effect between small and medium. Cohen himself warned that these benchmarks are relative to the field; for service times, what matters is whether 2 extra minutes make a difference to the service.

<div class="mk-note">
  Statistical significance and practical relevance are not the same thing.
</div>

---

## Frequentist and Bayesian Inference

There are different ways of thinking about inference.

<table class="mk-table">
  <thead>
    <tr>
      <th>Approach</th>
      <th>Main idea</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Frequentist</td>
      <td>Treats parameters as fixed, unknown numbers; probability describes what would happen over many repetitions of the sampling. Uses p-values, confidence intervals and hypothesis tests.</td>
    </tr>
    <tr>
      <td>Bayesian</td>
      <td>Represents uncertainty about the parameters with probability distributions and updates them with data, through <a href="{{ '/en/probability/conditional-probability' | relative_url }}">Bayes' Theorem</a>.</td>
    </tr>
  </tbody>
</table>

In Bayesian inference, the update can be summarized as follows (the symbol $\propto$ means "proportional to"):

<div class="mk-formula">

$$
\text{posterior distribution} \propto \text{likelihood} \times \text{prior distribution}
$$

</div>

In other words, we combine initial information (the prior) with the evidence brought by the data (the likelihood). This section of the site uses the frequentist approach.

---

## Pitfalls in Statistical Inference

Statistical inference is powerful, but it must be used with care.

Some common mistakes are:

- concluding causation from correlation alone;
- treating a sample that was not randomly drawn (volunteers, whoever answered) as if it were random;
- ignoring the sample size;
- reading the p-value as the probability that the null hypothesis is true;
- choosing the test, or the hypotheses, after looking at the results;
- running many tests and reporting only the significant ones;
- ignoring the model's assumptions;
- removing data without justification;
- confusing statistical significance with practical importance.

<div class="mk-note">
  Good inference depends not only on the formulas but also on the study design,
  the quality of the data and the correct interpretation of the results.
</div>

---

## Overall Summary

<table class="mk-table">
  <thead>
    <tr>
      <th>Concept</th>
      <th>Main idea</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Population</td>
      <td>The complete set we want to study.</td>
    </tr>
    <tr>
      <td>Sample</td>
      <td>The part of the population used for analysis, ideally drawn at random.</td>
    </tr>
    <tr>
      <td>Parameter</td>
      <td>A fixed and usually unknown measure of the population.</td>
    </tr>
    <tr>
      <td>Statistic</td>
      <td>A measure computed from the sample; it varies from sample to sample.</td>
    </tr>
    <tr>
      <td>Standard error</td>
      <td>The standard deviation of the sampling distribution of a statistic.</td>
    </tr>
    <tr>
      <td>Confidence interval</td>
      <td>A range of plausible values for a parameter, produced by a method that succeeds in a known proportion of samples.</td>
    </tr>
    <tr>
      <td>Hypothesis test</td>
      <td>A procedure for assessing the evidence against a null hypothesis.</td>
    </tr>
    <tr>
      <td>p-value</td>
      <td>The probability of a result as extreme as or more extreme than the one observed, if $H_0$ is true.</td>
    </tr>
    <tr>
      <td>Statistical power</td>
      <td>The probability of detecting an effect when it really exists.</td>
    </tr>
  </tbody>
</table>

---

<div class="mk-quote">
  <strong>Conclusion:</strong><br>
  Statistical inference is the bridge between the sample and the population. It lets us
  estimate parameters, test hypotheses and make decisions under uncertainty. More than
  applying formulas, doing inference requires interpreting results carefully,
  understanding the assumptions and recognizing the limits of the available data.
</div>

> “All models are wrong but some are useful.”  
> — George E. P. Box, title of a section of “Robustness in the Strategy of Scientific Model Building” (1979), p. 202

## References

1. Box, G. E. P. (1979). Robustness in the Strategy of Scientific Model Building. In: Launer, R. L.; Wilkinson, G. N. (Eds.). *Robustness in Statistics*. Academic Press, pp. 201–236.
2. Bussab, W. O.; Morettin, P. A. (2023). *Estatística Básica*. 10th ed. Saraiva Uni. (in Portuguese)
3. Cohen, J. (1988). *Statistical Power Analysis for the Behavioral Sciences*. 2nd ed. Lawrence Erlbaum Associates.
4. Wasserstein, R. L.; Lazar, N. A. (2016). The ASA's Statement on p-Values: Context, Process, and Purpose. *The American Statistician*, 70(2), 129–133. DOI: [10.1080/00031305.2016.1154108](https://doi.org/10.1080/00031305.2016.1154108).
