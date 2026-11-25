---
layout: page
title: Independent Events and the Product Rule
lang: en
ref: eventos-independentes
parent: probabilidade
permalink: /en/probability/independent-events
order: 5
mathjax: true
description: "When you can multiply probabilities, what \"1 in N\" means, why rounding first changes the result and when the product rule fails, with Julia code."
---

A lot of everyday probability is a multiplication: the chance of getting
heads five times in a row, of winning the lottery, of guessing every
question on a test and getting them all right. This page explains when that
multiplication is allowed, how to turn the result into "1 in N", and one
pitfall that changes the answer more than you'd think: rounding along the
way.

## Independence

Two events are **independent** when knowing that one happened doesn't change
the chance of the other. Toss a coin and roll a die: the coin landing heads
says nothing about the number on the die. Formally, $A$ and $B$ are
independent when

$$
P(A \mid B) = P(A),
$$

that is, the [conditional probability](/en/probability/conditional-probability)
of $A$ given $B$ equals the probability of $A$ with no information at all.

This form only makes sense when $P(B) > 0$, because conditional probability
divides by $P(B)$. That's why textbooks use the definition in the next
section, $P(A \cap B) = P(A) \cdot P(B)$, which always holds and makes it
clear that the relationship is symmetric: if $A$ doesn't change the chance
of $B$, $B$ doesn't change the chance of $A$ either.

**Independent is not the same as mutually exclusive.** Mutually exclusive
events cannot happen together, like a die showing 1 and showing 2 on the
same roll. If both have some chance of happening, they are never
independent: knowing it came up 1 drops the chance that it came up 2 to
zero. The product rule in the next section fails for them:
$P(A \cap B) = 0$, but $P(A) \cdot P(B) = \tfrac{1}{36}$.

## The product rule

If $A$ and $B$ are independent, the chance that both happen is the product
of their chances:

$$
P(A \cap B) = P(A) \cdot P(B).
$$

The coin lands heads **and** the die shows 6: $\tfrac12 \cdot \tfrac16 = \tfrac{1}{12}$.

The rule works for as many events as you like, as long as they are
**mutually independent**:

$$
P(A_1 \cap A_2 \cap \cdots \cap A_n) = P(A_1) \cdot P(A_2) \cdots P(A_n).
$$

"Mutually" asks for more than it seems: it isn't enough for each pair to be
independent. Toss two coins and consider $A$ = "the first lands heads",
$B$ = "the second lands heads" and $C$ = "both land the same way". Each has
chance $\tfrac12$, and every pair of them is independent: each intersection
of two has chance $\tfrac14 = \tfrac12 \cdot \tfrac12$. But if $A$ and $B$
happen, $C$ happens for sure, so $P(A \cap B \cap C) = \tfrac14$, not
$\tfrac18$. For three or more events, independence has to hold for every
subgroup at once.

## Example: guessing a whole test

A test has 8 multiple-choice questions, with different numbers of options.
You didn't study at all and guess every one. What is the chance of getting
all 8 right?

| Question | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Options | 3 | 3 | 4 | 4 | 5 | 5 | 6 | 7 |
| Chance of a right guess | 1/3 | 1/3 | 1/4 | 1/4 | 1/5 | 1/5 | 1/6 | 1/7 |

If each guess is a random pick among the options, guesses on different
questions are independent (getting the first one right neither helps nor
hurts the second), so the product rule applies:

$$
P(\text{all 8 right}) = \frac13 \cdot \frac13 \cdot \frac14 \cdot \frac14 \cdot \frac15 \cdot \frac15 \cdot \frac16 \cdot \frac17
= \frac{1}{151{,}200}.
$$

As a decimal, that's $0.0000066$, or $6.61 \times 10^{-6}$ in
[scientific notation](/matematica-basica/potencias.html) (page in Portuguese).

## What "1 in N" means

A small probability is easier to picture upside down. "1 in N" means the
probability is $p = 1/N$; so, to find N, just invert it:

$$
N = \frac{1}{p} = \frac{1}{1/151{,}200} = 151{,}200.
$$

The chance of guessing the whole test right is **1 in 151,200**. What that
means in practice is an average: over many attempts, you get one success
every 151,200 tries, on average.

It does **not** mean that guessing 151,200 tests guarantees you'll ace one.
The chance of at least one success in $N$ attempts is $1$ minus the chance
of failing them all, and failing them all is, once again, a product of
independent events (the attempts don't influence each other):

$$
P(\text{at least one}) = 1 - (1 - p)^N = 1 - \left(1 - \frac{1}{151{,}200}\right)^{151{,}200} \approx 63.2\%.
$$

That 63.2% is no coincidence: for any small probability, trying
$N = 1/p$ times gives a chance of about $1 - 1/e \approx 63.2\%$. With twice
as many attempts, 86.5%. The
[post on the Mega-Sena lottery](/mega-sena-frequencias/) (in Portuguese)
does the same calculation with lottery tickets.

The same complement trick answers a more encouraging question: the chance
of getting **at least one** of the 8 questions right is $1$ minus the chance
of missing them all, $1 - \tfrac23 \cdot \tfrac23 \cdot \tfrac34 \cdot \tfrac34 \cdot
\tfrac45 \cdot \tfrac45 \cdot \tfrac56 \cdot \tfrac67 = 88.6\%$.

## Watch out: rounding before multiplying

Probabilities rarely arrive as fractions. They usually arrive as decimals,
already rounded. See what happens with the same example:

| How the factors were written | Product | N = 1/p | Error in N |
|---|---:|---:|---:|
| Exact fractions | $6.6138 \times 10^{-6}$ | 151,200 | — |
| Each factor to 3 places (0.333; 0.250; ... 0.143) | $6.6204 \times 10^{-6}$ | 151,049 | −0.1% |
| Each factor to 2 places (0.33; 0.25; ... 0.14) | $6.4796 \times 10^{-6}$ | 154,332 | +2.1% |
| Exact product rounded to $7 \times 10^{-6}$ | $7 \times 10^{-6}$ | 142,857 | −5.5% |

None of these roundings looks serious on its own. The problem is that, in a
multiplication, **relative errors add up** (approximately, when they are
small). To two places, 0.33 is 1% below 1/3 (and shows up twice), 0.17 is
2% above 1/6, and 0.14 is 2% below 1/7: $-1\% - 1\% + 2\% - 2\% = -2\%$. The
product comes out 2.0% too low, and N, 2.1% too high. With eight factors,
eight small errors have plenty of chances to pile up.

To three places, the error nearly vanished for two reasons. The factors'
errors became ten to twenty times smaller (0.333 is 0.1% below 1/3, and
0.167 and 0.143 are 0.2% and 0.1% above 1/6 and 1/7), and, on top of that,
they had different signs and partly cancelled out. The first part you can
control by keeping more decimal places; the second is luck.

So when two calculations that should agree land on slightly different
numbers, such as 1 in 8,895 and 1 in 8,929, this is the first suspect: one
used the full values, the other rounded along the way. The rule is the same
as for [rounding and significant figures](/matematica-basica/arredondamento.html)
(page in Portuguese): carry every digit you have through the calculation and
round **only the final result**.

## When you can't multiply

The product rule only holds for independent events. When one event changes
the chance of the other, you need conditional probability:

$$
P(A \cap B) = P(A) \cdot P(B \mid A).
$$

Drawing two aces in a row from a 52-card deck, **without putting** the
first one back: the chance of the first ace is $\tfrac{4}{52}$, but, once
it's out, 3 aces remain among 51 cards, so

$$
P(\text{two aces}) = \frac{4}{52} \cdot \frac{3}{51} = \frac{1}{221}.
$$

Multiplying as if they were independent, $\tfrac{4}{52} \cdot \tfrac{4}{52}$,
would give $\tfrac{1}{169}$: a chance 31% higher than the true one.

In the real world, independence is an assumption, and often a false one.
Rain today raises the chance of rain tomorrow; a delayed flight delays the
next connection. Multiplying the probabilities of events that move together
usually underestimates the chance that they all happen at once.

## In Julia

To avoid rounding anything along the way, you can use exact fractions, with
the `//` operator:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>options = [3, 3, 4, 4, 5, 5, 6, 7]

# Exact fractions: nothing gets rounded along the way
p = prod(1 .// options)
N = 1 / p
println("p = ", p, "   N = ", N)

# The same product with each factor rounded to 2 places
p2 = prod(round.(1 ./ options, digits = 2))
N2 = 1 / p2
println("With 2 places: N ≈ ", round(N2, digits = 1),
        "   error in N: ", round(100 * (N2 / N - 1), digits = 1), "%")

# Chance of at least one success in N independent attempts
at_least_one = 1 - (1 - Float64(p))^Float64(N)
println("P(at least one in N attempts) = ", round(at_least_one, digits = 4))</code></pre>
  </div>
</div>

#### Expected output:
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <div>p = 1//151200   N = 151200//1</div>
  <div>With 2 places: N ≈ 154331.7   error in N: 2.1%</div>
  <div>P(at least one in N attempts) = 0.6321</div>
</div>

When the values come as decimals and there are no fractions behind them,
the advice is the same: keep the numbers with every decimal place you have
and only round what you display.

## Summary

- Events are independent when one doesn't change the chance of the other.
  That is different from being mutually exclusive.
- For mutually independent events, the chance that they all happen is the
  product of their chances. Independence of each pair is not enough.
- "1 in N" is the inverse of the probability: $N = 1/p$, one success every N
  attempts, on average. It doesn't guarantee success in N attempts: for
  small $p$, the chance is about 63%.
- Rounding the factors before multiplying piles up relative errors. Round
  only at the end.
- If the events are not independent, use $P(A) \cdot P(B \mid A)$.

## References

1. Bussab, W. O.; Morettin, P. A. (2023). *Estatística Básica*. 10th ed. Saraiva Uni. (in Portuguese)
2. Ross, S. M. (2012). *A First Course in Probability*. 9th ed. Pearson.
