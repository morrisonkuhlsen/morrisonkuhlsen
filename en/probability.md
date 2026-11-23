---
layout: page
title: Probability
lang: en
ref: probabilidade
permalink: /en/probability/
order: 2
mathjax: true
description: "The foundations of probability theory, from basic events to distributions and random variables."
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
    max-width: 780px;
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
    background: #ffffff;
    border: 1px solid rgba(11, 31, 53, 0.08);
    box-shadow: 0 8px 22px rgba(11, 31, 53, 0.06);
    transition: transform 0.25s ease, box-shadow 0.25s ease;
  }

  .mk-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 14px 32px rgba(11, 31, 53, 0.1);
  }

  .mk-card h3 {
    margin-top: 0;
    color: #0b1f35;
  }

  .mk-card p {
    color: #4a5568;
    line-height: 1.65;
  }

  .mk-note {
    padding: 1.2rem 1.4rem;
    border-left: 5px solid #c47a2c;
    background: #fff7ed;
    border-radius: 12px;
    margin: 1.5rem 0;
    color: #3f2a14;
  }

  .mk-formula {
    padding: 1.2rem;
    margin: 1.2rem 0;
    border-radius: 16px;
    background: #f8fafc;
    border: 1px solid rgba(11, 31, 53, 0.08);
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
    border-bottom: 1px solid #e5e7eb;
    background: #ffffff;
    vertical-align: top;
  }

  .mk-table tr:last-child td {
    border-bottom: none;
  }

  .mk-example {
    padding: 1.4rem;
    border-radius: 18px;
    background: linear-gradient(135deg, #ffffff 0%, #fff8e8 100%);
    border: 1px solid rgba(196, 122, 44, 0.18);
    box-shadow: 0 10px 25px rgba(11, 31, 53, 0.06);
    margin: 1.5rem 0;
  }

  .mk-example h3 {
    margin-top: 0;
    color: #0b1f35;
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
  <span class="mk-tag">PROBABILITY • UNCERTAINTY • DECISION</span>

  <h1>Probability</h1>

  <p>
    <strong>Probability</strong> is the area of Mathematics that studies uncertain
    phenomena. It lets us measure, compare and interpret the chances that something
    happens, helping us understand situations whose outcome cannot be predicted
    with complete certainty.
  </p>
</section>

## What is Probability?

Probability comes in whenever we deal with situations that involve **uncertainty**.

When we toss a coin, we don't know for sure whether it will land heads or tails.  
When we roll a die, we don't know in advance which face will come up.  
When we watch a queue, we don't know exactly how long the next person will wait.

Even so, we can study these situations mathematically.

Probability answers questions such as:

- What is the chance that an event happens?
- Which outcomes are possible?
- Does one event influence another?
- How do we compute the chance that several events happen together?
- How do we make decisions under uncertainty?

<div class="mk-note">
  <strong>Key idea:</strong> Probability turns uncertainty into a
  number, so we can reason better about random phenomena.
</div>

---

## Random experiment, sample space and event

Before computing probabilities, we need three fundamental ideas.

<div class="mk-grid">

  <div class="mk-card">
    <h3>Random experiment</h3>
    <p>
      A situation whose outcome cannot be predicted with certainty before it happens.
      Example: tossing a coin, rolling a die or drawing a card.
    </p>
  </div>

  <div class="mk-card">
    <h3>Sample space</h3>
    <p>
      The set of all possible outcomes of a random experiment.
      It is usually written with the Greek letter Ω.
    </p>
  </div>

  <div class="mk-card">
    <h3>Event</h3>
    <p>
      Any subset of the sample space. In other words, a collection
      of outcomes that we want to analyze.
    </p>
  </div>

</div>

### Example: rolling a die

When we roll an ordinary die, the possible outcomes are:

<div class="mk-formula">

$$
\Omega = \{1,2,3,4,5,6\}
$$

</div>

If we want to study the event “an even number comes up”, we have:

<div class="mk-formula">

$$
A = \{2,4,6\}
$$

</div>

Here the event $$A$$ is a subset of the sample space $$\Omega$$.

---

## The classical definition of probability

When all outcomes are equally likely, we can compute the probability of an event as the ratio:

<div class="mk-formula">

$$
P(A) = \frac{\text{number of favorable outcomes}}{\text{number of possible outcomes}}
$$

</div>

When rolling a die, the probability of getting an even number is:

<div class="mk-formula">

$$
P(A) = \frac{3}{6}
$$

$$
P(A) = \frac{1}{2}
$$

$$
P(A) = 0.5
$$

</div>

So the chance of getting an even number is:

<div class="mk-formula">

$$
50\%
$$

</div>

---

## The possible values of a probability

Every probability lies between 0 and 1.

<div class="mk-formula">

$$
0 \leq P(A) \leq 1
$$

</div>

This means that:

<table class="mk-table">
  <thead>
    <tr>
      <th>Value</th>
      <th>Interpretation</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>$$P(A)=0$$</td>
      <td>The event is impossible.</td>
    </tr>
    <tr>
      <td>$$P(A)=1$$</td>
      <td>The event is certain.</td>
    </tr>
    <tr>
      <td>$$0 < P(A) < 1$$</td>
      <td>The event is possible, but uncertain.</td>
    </tr>
  </tbody>
</table>

---

## The complement of an event

The complement of $$A$$ is everything in the sample space that is not in $$A$$.

It can be written as:

<div class="mk-formula">

$$
A^c
$$

</div>

The probability of the complement is:

<div class="mk-formula">

$$
P(A^c) = 1 - P(A)
$$

</div>

### Example

If the probability that it rains today is:

<div class="mk-formula">

$$
P(A) = 0.30
$$

</div>

Then the probability that it doesn't rain is:

<div class="mk-formula">

$$
P(A^c) = 1 - 0.30
$$

$$
P(A^c) = 0.70
$$

</div>

So the chance that it doesn't rain is:

<div class="mk-formula">

$$
70\%
$$

</div>

---

## Union and intersection of events

In Probability we often study how two or more events relate to each other.

<table class="mk-table">
  <thead>
    <tr>
      <th>Operation</th>
      <th>Notation</th>
      <th>Meaning</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Union</td>
      <td>$$A \cup B$$</td>
      <td>Event A happens, or event B, or both.</td>
    </tr>
    <tr>
      <td>Intersection</td>
      <td>$$A \cap B$$</td>
      <td>A and B happen at the same time.</td>
    </tr>
    <tr>
      <td>Complement</td>
      <td>$$A^c$$</td>
      <td>Event A does not happen.</td>
    </tr>
  </tbody>
</table>

---

## The addition rule

The addition rule gives the probability that $$A$$ or $$B$$ happens.

<div class="mk-formula">

$$
P(A \cup B) = P(A) + P(B) - P(A \cap B)
$$

</div>

The term $$P(A \cap B)$$ is subtracted because, when we add $$P(A)$$ and $$P(B)$$, the part the two events share is counted twice.

<div class="mk-note">
  When two events cannot happen at the same time, we say they are
  <strong>mutually exclusive</strong>. In that case, $$P(A \cap B)=0$$.
</div>

If $$A$$ and $$B$$ are mutually exclusive:

<div class="mk-formula">

$$
P(A \cup B) = P(A) + P(B)
$$

</div>

---

## Conditional probability

Conditional probability measures the chance that an event happens given that another event has already happened.

The notation is:

<div class="mk-formula">

$$
P(A \mid B)
$$

</div>

It reads:

> The probability of A given B.

The formula is:

<div class="mk-formula">

$$
P(A \mid B) = \frac{P(A \cap B)}{P(B)}
$$

</div>

provided that:

<div class="mk-formula">

$$
P(B) > 0
$$

</div>

---

## The multiplication rule

From conditional probability we get the multiplication rule:

<div class="mk-formula">

$$
P(A \cap B) = P(B) \cdot P(A \mid B)
$$

</div>

We can also write:

<div class="mk-formula">

$$
P(A \cap B) = P(A) \cdot P(B \mid A)
$$

</div>

This rule is very useful when we want the probability that two events happen together.

---

## Independent events

Two events are independent when one happening does not change the probability of the other.

If $$A$$ and $$B$$ are independent, then:

<div class="mk-formula">

$$
P(A \mid B) = P(A)
$$

</div>

and also:

<div class="mk-formula">

$$
P(A \cap B) = P(A) \cdot P(B)
$$

</div>

### Example

Tossing a coin twice is a textbook case of independence.

The result of the first toss does not change the result of the second.

If we want the probability of heads on both tosses:

<div class="mk-formula">

$$
P(\text{heads and heads}) = \frac{1}{2} \cdot \frac{1}{2}
$$

$$
P(\text{heads and heads}) = \frac{1}{4}
$$

</div>

So the chance is:

<div class="mk-formula">

$$
25\%
$$

</div>

---

## Bayes' Theorem

Bayes' Theorem is one of the most important ideas in Probability.

It lets us update a probability when we receive new information.

<div class="mk-formula">

$$
P(A \mid B) = \frac{P(B \mid A) \cdot P(A)}{P(B)}
$$

</div>

Where:

- $$P(A)$$ is the initial probability of $$A$$;
- $$P(B \mid A)$$ is the probability of observing $$B$$ given that $$A$$ happened;
- $$P(B)$$ is the total probability of $$B$$;
- $$P(A \mid B)$$ is the updated probability of $$A$$ after observing $$B$$.

<div class="mk-note">
  Bayes' Theorem is widely used in medical diagnosis, spam filters,
  machine learning, risk analysis and statistical inference.
</div>

---

## Random variable

A random variable is a function that assigns numbers to the outcomes of a random experiment.

For example, when tossing two coins, we can define:

> X = the number of heads obtained.

The sample space is:

<div class="mk-formula">

$$
\Omega = \{HH, HT, TH, TT\}
$$

</div>

where:

- $$H$$ stands for heads;
- $$T$$ stands for tails.

The random variable $$X$$ can take the values:

<div class="mk-formula">

$$
X = 0,\ 1,\ 2
$$

</div>

<table class="mk-table">
  <thead>
    <tr>
      <th>Outcome</th>
      <th>Value of X</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>$$TT$$</td>
      <td>0 heads</td>
    </tr>
    <tr>
      <td>$$HT$$ or $$TH$$</td>
      <td>1 head</td>
    </tr>
    <tr>
      <td>$$HH$$</td>
      <td>2 heads</td>
    </tr>
  </tbody>
</table>

---

## Expected value

The expected value is the theoretical mean of a random variable.

For a discrete random variable:

<div class="mk-formula">

$$
E(X) = \sum x_i \cdot P(X=x_i)
$$

</div>

It does not have to be a value that actually shows up in the experiment.  
It represents the average behavior we expect in the long run.

---

## Variance of a random variable

The variance measures how spread out the random variable is around its expected value.

<div class="mk-formula">

$$
Var(X) = E[(X - E(X))^2]
$$

</div>

An equivalent and widely used form is:

<div class="mk-formula">

$$
Var(X) = E(X^2) - [E(X)]^2
$$

</div>

The standard deviation is:

<div class="mk-formula">

$$
\sigma = \sqrt{Var(X)}
$$

</div>

---

## Probability distributions

A probability distribution describes how probability is spread across the possible values of a random variable.

<table class="mk-table">
  <thead>
    <tr>
      <th>Distribution</th>
      <th>Type</th>
      <th>Common use</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Bernoulli</td>
      <td>Discrete</td>
      <td>Experiments with only two outcomes: success or failure.</td>
    </tr>
    <tr>
      <td>Binomial</td>
      <td>Discrete</td>
      <td>Counting successes in a fixed number of trials.</td>
    </tr>
    <tr>
      <td>Poisson</td>
      <td>Discrete</td>
      <td>Counting occurrences in an interval of time or space.</td>
    </tr>
    <tr>
      <td>Normal</td>
      <td>Continuous</td>
      <td>Modeling phenomena that are roughly symmetric around the mean.</td>
    </tr>
    <tr>
      <td>Exponential</td>
      <td>Continuous</td>
      <td>Waiting time until an event occurs.</td>
    </tr>
  </tbody>
</table>

---

## The Bernoulli distribution

The Bernoulli distribution models an experiment with only two possible outcomes:

- success;
- failure.

If $$X$$ follows a Bernoulli distribution with parameter $$p$$, we write:

<div class="mk-formula">

$$
X \sim Bernoulli(p)
$$

</div>

The probability function is:

<div class="mk-formula">

$$
P(X=x) = p^x(1-p)^{1-x}
$$

</div>

for:

<div class="mk-formula">

$$
x \in \{0,1\}
$$

</div>

---

## The Binomial distribution

The binomial distribution is used when we have:

- a fixed number of trials;
- independent trials;
- only two possible outcomes in each trial;
- the same probability of success in every trial.

If $$X$$ follows a binomial distribution, we write:

<div class="mk-formula">

$$
X \sim Binomial(n,p)
$$

</div>

The probability function is:

<div class="mk-formula">

$$
P(X=k) = \binom{n}{k}p^k(1-p)^{n-k}
$$

</div>

where:

- $$n$$ is the number of trials;
- $$k$$ is the number of successes;
- $$p$$ is the probability of success.

---

## The Poisson distribution

The Poisson distribution is used to model counts of events in an interval.

Examples:

- the number of customers who join a queue per hour;
- the number of calls received per minute;
- the number of accidents on a given stretch of road;
- the number of defects in a part.

If $$X$$ follows a Poisson distribution with parameter $$\lambda$$, we write:

<div class="mk-formula">

$$
X \sim Poisson(\lambda)
$$

</div>

Its probability function is:

<div class="mk-formula">

$$
P(X=k) = \frac{e^{-\lambda}\lambda^k}{k!}
$$

</div>

where:

- $$\lambda$$ is the average rate of occurrence;
- $$k$$ is the number of occurrences.

---

## The Normal distribution

The normal distribution is one of the most important distributions in Statistics.

It is bell-shaped, symmetric around the mean, and shows up in many natural, social and economic phenomena.

If $$X$$ follows a normal distribution, we write:

<div class="mk-formula">

$$
X \sim N(\mu,\sigma^2)
$$

</div>

Its density function is:

<div class="mk-formula">

$$
f(x) = \frac{1}{\sigma\sqrt{2\pi}}
e^{-\frac{1}{2}\left(\frac{x-\mu}{\sigma}\right)^2}
$$

</div>

Where:

- $$\mu$$ is the mean;
- $$\sigma$$ is the standard deviation;
- $$\sigma^2$$ is the variance.

---

## A worked example: tossing coins

Consider the experiment of tossing a coin 3 times.

We want the probability of getting exactly 2 heads.

Here:

- number of trials: $$n = 3$$;
- number of successes we want: $$k = 2$$;
- probability of heads: $$p = \frac{1}{2}$$.

We use the binomial distribution:

<div class="mk-formula">

$$
P(X=2) = \binom{3}{2}
\left(\frac{1}{2}\right)^2
\left(1-\frac{1}{2}\right)^{3-2}
$$

</div>

Since:

<div class="mk-formula">

$$
\binom{3}{2} = 3
$$

</div>

we have:

<div class="mk-formula">

$$
P(X=2) = 3 \cdot \left(\frac{1}{2}\right)^2 \cdot \left(\frac{1}{2}\right)^1
$$

$$
P(X=2) = 3 \cdot \frac{1}{4} \cdot \frac{1}{2}
$$

$$
P(X=2) = \frac{3}{8}
$$

</div>

Therefore:

<div class="mk-formula">

$$
P(X=2) = 0.375 = 37.5\%
$$

</div>

---

## A worked example: an ordinary die

Consider rolling a fair die.

We want the probability of getting a number greater than 4.

The sample space is:

<div class="mk-formula">

$$
\Omega = \{1,2,3,4,5,6\}
$$

</div>

The event we want is:

<div class="mk-formula">

$$
A = \{5,6\}
$$

</div>

So:

<div class="mk-formula">

$$
P(A) = \frac{2}{6}
$$

$$
P(A) = \frac{1}{3}
$$

$$
P(A) \approx 0.3333
$$

</div>

So the chance of getting a number greater than 4 is approximately:

<div class="mk-formula">

$$
33.33\%
$$

</div>

---

## How to read probabilities

<table class="mk-table">
  <thead>
    <tr>
      <th>Probability</th>
      <th>Intuitive reading</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>0%</td>
      <td>The event does not happen.</td>
    </tr>
    <tr>
      <td>25%</td>
      <td>The event has a low chance of happening.</td>
    </tr>
    <tr>
      <td>50%</td>
      <td>The event is as likely to happen as not.</td>
    </tr>
    <tr>
      <td>75%</td>
      <td>The event has a high chance of happening.</td>
    </tr>
    <tr>
      <td>100%</td>
      <td>The event happens for certain.</td>
    </tr>
  </tbody>
</table>

---

## Probability in practice

Probability shows up in many fields:

<div class="mk-grid">

  <div class="mk-card">
    <h3>Statistics</h3>
    <p>
      It is the foundation of statistical inference, hypothesis tests,
      confidence intervals and probabilistic models.
    </p>
  </div>

  <div class="mk-card">
    <h3>Data science</h3>
    <p>
      It is used in predictive models, classification, machine learning
      and uncertainty analysis.
    </p>
  </div>

  <div class="mk-card">
    <h3>Queues and service</h3>
    <p>
      It helps study customer arrivals, waiting times, service
      capacity and the risk of congestion.
    </p>
  </div>

  <div class="mk-card">
    <h3>Games and draws</h3>
    <p>
      It lets us compute the odds in dice, cards, lotteries, coins and other
      random experiments.
    </p>
  </div>

</div>

---

## Overview

<table class="mk-table">
  <thead>
    <tr>
      <th>Concept</th>
      <th>Main idea</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Random experiment</td>
      <td>A situation whose outcome is not known in advance.</td>
    </tr>
    <tr>
      <td>Sample space</td>
      <td>The set of all possible outcomes.</td>
    </tr>
    <tr>
      <td>Event</td>
      <td>A subset of the sample space.</td>
    </tr>
    <tr>
      <td>Probability</td>
      <td>A numerical measure of the chance that an event happens.</td>
    </tr>
    <tr>
      <td>Conditional probability</td>
      <td>The chance that an event happens given that another one has.</td>
    </tr>
    <tr>
      <td>Independence</td>
      <td>When one event does not change the probability of the other.</td>
    </tr>
    <tr>
      <td>Random variable</td>
      <td>A function that assigns numbers to the outcomes of a random experiment.</td>
    </tr>
    <tr>
      <td>Probability distribution</td>
      <td>How probability is spread across the possible values.</td>
    </tr>
  </tbody>
</table>

---

<div class="mk-quote">
  <strong>Conclusion:</strong><br>
  Probability is the mathematical language of uncertainty. It lets us study
  random phenomena rigorously, compute chances, update what we know and make
  better-informed decisions when the outcome is not guaranteed.
</div>

> “Probability theory is nothing but common sense reduced to calculation.”  
> — Pierre-Simon Laplace
