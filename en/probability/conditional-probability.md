---
layout: page
title: Conditional Probability
lang: en
ref: probabilidade-condicional
parent: probabilidade
permalink: /en/probability/conditional-probability
order: 6
mathjax: true
description: "Conditional probability, the multiplication rule, the law of total probability and Bayes' Theorem, with step-by-step worked examples and Julia code."
---

**Conditional probability** is the probability of an event when we already know that another event has occurred. Knowing something changes the odds: the probability of rain is one thing; the probability of rain given that the sky is overcast is another. This page shows how to compute it, how it leads to the multiplication rule, the law of total probability and Bayes' Theorem, and where it is easy to go wrong.

<div style="border-left: 4px solid #4CAF50; padding: 0.5em; background-color: #e8f5e9;">
  <strong>🎯 Important:</strong><br>
  The conditional probability of $A$ given $B$ is written $P(A \mid B)$ (read "the probability of A given B") and, when $P(B) > 0$, it is:
  $$P(A \mid B) = \frac{P(A \cap B)}{P(B)}$$
</div>

## 1. The Idea

Roll a fair die. The probability of a 6 is $\frac{1}{6}$, because 6 is one of 6 equally likely outcomes.

Now suppose someone looked at the die and only told you that **it came up even**. The possible outcomes are now just 2, 4 and 6, and they are still equally likely among themselves. The 6 is one of those 3, so the probability of a 6, **given that the roll is even**, is $\frac{1}{3}$.

The information "it came up even" did two things:

- it **shrank the sample space**, from $\\{1, 2, 3, 4, 5, 6\\}$ to $\\{2, 4, 6\\}$;
- it **changed the probability** of "a 6", from $\frac{1}{6}$ to $\frac{1}{3}$.

That is exactly what conditional probability is: recomputing the odds inside the part of the sample space that the information left standing.

## 2. Definition

Let $A$ and $B$ be two events, with $P(B) > 0$. The **conditional probability of $A$ given $B$** is:

$$P(A \mid B) = \frac{P(A \cap B)}{P(B)}$$

where:

- $P(A \cap B)$ is the probability that $A$ **and** $B$ occur together;
- $P(B)$ is the probability of the event we know has occurred (the **conditioning event**).

The formula says: out of the times $B$ occurs, in what fraction of them does $A$ occur too?

The condition $P(B) > 0$ is needed for two reasons: we cannot divide by zero, and it makes no sense to "know that" an impossible event has occurred.

In the die example, with $A$ = "a 6" and $B$ = "an even number": $A \cap B = \\{6\\}$, so $P(A \cap B) = \frac{1}{6}$ and $P(B) = \frac{3}{6}$. By the formula, $P(A \mid B) = \frac{1/6}{3/6} = \frac{1}{3}$, the same value we got by counting.

### 2.1 Worked Example: an Ace, Given That the Card Is Red

A card is drawn at random from a standard 52-card deck. We know it is red (hearts or diamonds). What is the probability that it is an ace?

**Data** (from the problem and the makeup of the deck):

- $A$ = "the card is an ace"; there are 4 aces;
- $B$ = "the card is red"; there are 26 red cards, so $P(B) = \frac{26}{52}$;
- $A \cap B$ = "the card is a red ace"; there are 2 (the ace of hearts and the ace of diamonds), so $P(A \cap B) = \frac{2}{52}$.

**Formula:**

$$P(A \mid B) = \frac{P(A \cap B)}{P(B)}$$

**Substitution:**

$$P(A \mid B) = \frac{2/52}{26/52}$$

**Arithmetic:** the two denominators of 52 cancel.

$$P(A \mid B) = \frac{2}{26} = \frac{1}{13} \approx 0.0769$$

**Interpretation:** among the red cards, about 7.69% are aces (2 out of 26). Notice that $P(A) = \frac{4}{52} = \frac{1}{13}$ as well: knowing the card is red **did not change** the chance of an ace. When that happens, the events are independent (section 5).

### 2.2 Geometric Interpretation

In a Venn diagram, conditioning on $B$ means throwing away everything outside $B$. What is left of $A$ is the part $A \cap B$, and the conditional probability is the fraction of $B$ that this part takes up.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Plots

# Points on a circle with center (h, k) and radius r
function circle(h, k, r; n=400)
    θ = range(0, 2π, length=n)
    return h .+ r .* cos.(θ), k .+ r .* sin.(θ)
end

# The intersection (the "lens") is made of the arc of A that lies inside B
# and the arc of B that lies inside A
function lens(cA, cB, r; n=2000)
    xa, ya = circle(cA..., r; n=n)
    xb, yb = circle(cB..., r; n=n)
    insideB = @. (xa - cB[1])^2 + (ya - cB[2])^2 &lt;= r^2
    insideA = @. (xb - cA[1])^2 + (yb - cA[2])^2 &lt;= r^2
    x = [xa[insideB]; xb[insideA]]
    y = [ya[insideB]; yb[insideA]]
    order = sortperm(atan.(y .- 0, x .- 0))   # sort the points around the center of the lens
    return x[order], y[order]
end

cA, cB, r = (-0.45, 0.0), (0.45, 0.0), 0.8
omega = Shape([-1.6, 1.6, 1.6, -1.6], [-1.15, -1.15, 1.15, 1.15])
options = (xlims=(-1.7, 1.7), ylims=(-1.25, 1.25), aspect_ratio=:equal,
          axis=false, grid=false, legend=false)

# Panel 1: the whole sample space, with A and B
p1 = plot(omega; color=:lightgray, alpha=0.4, linecolor=:gray, options...,
          title="Before: the sample space is Ω")
plot!(p1, Shape(circle(cA..., r)...); color=:steelblue, alpha=0.45, linecolor=:steelblue)
plot!(p1, Shape(circle(cB..., r)...); color=:darkorange, alpha=0.45, linecolor=:darkorange)
annotate!(p1, [(-0.85, 0.0, text("A", 14)), (0.85, 0.0, text("B", 14)),
               (-1.4, 0.95, text("Ω", 14))])

# Panel 2: once we know B occurred, only B matters; A ∩ B is the part of A that is left
p2 = plot(omega; color=:white, linecolor=:lightgray, linestyle=:dash, options...,
          title="After learning that B occurred")
plot!(p2, Shape(circle(cA..., r)...); fillalpha=0, linecolor=:gray, linestyle=:dash)
plot!(p2, Shape(circle(cB..., r)...); color=:darkorange, alpha=0.30, linecolor=:darkorange, linewidth=2)
plot!(p2, Shape(lens(cA, cB, r)...); color=:purple, alpha=0.55, linecolor=:purple)
annotate!(p2, [(0.0, 0.0, text("A ∩ B", 11, :white)), (0.85, 0.0, text("B", 14)),
               (0.0, -1.0, text("P(A | B) = area of A ∩ B ÷ area of B", 11))])

fig = plot(p1, p2; layout=(1, 2), size=(900, 360), titlefontsize=12)
savefig(fig, "conditional_probability_en.png")</code></pre>
  </div>
</div>

![On the left, a gray rectangle (the sample space) with two overlapping circles, A in blue and B in orange; on the right, only circle B is colored, with the common part A ∩ B highlighted in purple and the outline of A dashed]({{ site.baseurl }}/assets/images/conditional_probability_en.png)
<div class="image-caption">Figure 1: Before the information, odds are measured over the whole sample space Ω (left). Once we know B occurred, only B matters (right): P(A | B) is the fraction of B taken up by A ∩ B.</div>

## 3. Properties

For a fixed event $B$ with $P(B) > 0$, the conditional probability $P(\cdot \mid B)$ is itself a probability. That is why the usual rules still hold:

1. **It lies between 0 and 1:** $0 \leq P(A \mid B) \leq 1$.
2. **The certain event has probability 1:** $P(\Omega \mid B) = 1$; and also $P(B \mid B) = 1$.
3. **Additivity:** if $A_1$ and $A_2$ are mutually exclusive ($A_1 \cap A_2 = \emptyset$), then $P(A_1 \cup A_2 \mid B) = P(A_1 \mid B) + P(A_2 \mid B)$.
4. **Complement:** $P(A^c \mid B) = 1 - P(A \mid B)$, where $A^c$ is the complement of $A$ ("$A$ does not occur").

**Careful: order matters.** In general $P(A \mid B) \neq P(B \mid A)$. In the deck, with $A$ = "ace" and $B$ = "red":

- $P(A \mid B) = \frac{2}{26} = \frac{1}{13} \approx 0.0769$: among the red cards, few are aces;
- $P(B \mid A) = \frac{2}{4} = \frac{1}{2} = 0.5$: among the aces, half are red.

Both questions have the same numerator, $P(A \cap B) = \frac{2}{52}$, but they divide by different events. Bayes' Theorem (section 7) is the rule that links one to the other.

## 4. The Multiplication Rule

Multiplying both sides of the definition by $P(B)$, the probability that two events occur together is:

$$P(A \cap B) = P(B) \cdot P(A \mid B) = P(A) \cdot P(B \mid A)$$

(the first form uses $P(B) > 0$ and the second uses $P(A) > 0$, so that the conditional probabilities are defined).

The rule is useful when the experiment happens in stages: the probability of the first stage times the probability of the second, **given what happened in the first**.

**Example: two aces without replacement.** Two cards are drawn from a 52-card deck, one after the other, without putting the first one back. What is the probability that both are aces?

**Data:**

- $A_1$ = "the 1st card is an ace": there are 4 aces in 52 cards, so $P(A_1) = \frac{4}{52}$;
- $A_2$ = "the 2nd card is an ace": if the 1st was an ace, 3 aces are left in 51 cards, so $P(A_2 \mid A_1) = \frac{3}{51}$.

**Formula and substitution:**

$$P(A_1 \cap A_2) = P(A_1) \cdot P(A_2 \mid A_1) = \frac{4}{52} \cdot \frac{3}{51}$$

**Arithmetic:**

$$\frac{4}{52} \cdot \frac{3}{51} = \frac{4 \cdot 3}{52 \cdot 51} = \frac{12}{2652} = \frac{1}{221} \approx 0.0045$$

**Interpretation:** on average, the first two cards are both aces in about 1 out of every 221 repetitions of the experiment. This is not the same as $\frac{4}{52} \cdot \frac{4}{52} = \frac{1}{169}$: without replacement, the 1st card changes the makeup of the deck, and the 2nd draw **depends** on the 1st. The [Independent Events]({{ '/en/probability/independent-events' | relative_url }}) page compares the two cases.

## 5. Independence

Two events $A$ and $B$ are **independent** when:

$$P(A \cap B) = P(A) \cdot P(B)$$

If $P(B) > 0$, this is the same as saying $P(A \mid B) = P(A)$: knowing that $B$ occurred does not change the probability of $A$. (Just divide both sides by $P(B)$.) The product definition has the advantage of holding even when $P(B) = 0$ and of being symmetric in $A$ and $B$.

**Example 1 (independent).** In the deck, "ace" and "red": $P(\text{ace} \cap \text{red}) = \frac{2}{52} = \frac{1}{26}$ and $P(\text{ace}) \cdot P(\text{red}) = \frac{1}{13} \cdot \frac{1}{2} = \frac{1}{26}$. Both sides are equal, so the events are independent, as we already saw in section 2.1.

**Example 2 (dependent).** Two dice are rolled. Let $T$ = "the first die shows 3".

- With $S_8$ = "the sum is 8": $P(S_8) = \frac{5}{36}$ (the pairs (2,6), (3,5), (4,4), (5,3), (6,2)). Given that the first die shows 3, the sum is 8 only if the second shows 5: $P(S_8 \mid T) = \frac{1}{6} = \frac{6}{36}$. Since $\frac{6}{36} \neq \frac{5}{36}$, $S_8$ and $T$ are **not** independent.
- With $S_7$ = "the sum is 7": $P(S_7) = \frac{6}{36} = \frac{1}{6}$, and given that the first die shows 3, the sum is 7 only if the second shows 4: $P(S_7 \mid T) = \frac{1}{6}$. Here the two are equal, and $S_7$ and $T$ **are** independent.

Independent is not the same as mutually exclusive. If $A$ and $B$ are mutually exclusive and have positive probability, knowing that $B$ occurred gives $P(A \mid B) = 0$, which changes the chance of $A$ (a lot): they are dependent.

The simulation below rolls two dice 100,000 times and estimates the probabilities by the observed proportions, with $A$ = "the first die is greater than 3" and $B$ = "the second die is even". The exact values are $P(A) = P(A \mid B) = 0.5$ and $P(A \cap B) = 0.25$.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Random, Statistics

Random.seed!(123)
n = 100_000                    # number of simulated rolls
die1 = rand(1:6, n)
die2 = rand(1:6, n)

A = die1 .&gt; 3                  # A: the first die is greater than 3
B = iseven.(die2)              # B: the second die is even

P_A = mean(A)                  # share of rolls in which A occurred
P_B = mean(B)
P_AandB = mean(A .&amp; B)
P_A_given_B = P_AandB / P_B    # P(A | B) = P(A ∩ B) / P(B)

println("P(A)       ≈ ", round(P_A, digits=4), "   (exact: 0.5)")
println("P(A | B)   ≈ ", round(P_A_given_B, digits=4), "   (exact: 0.5)")
println("P(A ∩ B)   ≈ ", round(P_AandB, digits=4), "   (exact: 0.25)")
println("P(A)·P(B)  ≈ ", round(P_A * P_B, digits=4))</code></pre>
  </div>
</div>

#### Expected output:
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <div>P(A) &nbsp; &nbsp; &nbsp; ≈ 0.5012 &nbsp; (exact: 0.5)</div>
  <div>P(A | B) &nbsp; ≈ 0.5011 &nbsp; (exact: 0.5)</div>
  <div>P(A ∩ B) &nbsp; ≈ 0.251 &nbsp; (exact: 0.25)</div>
  <div>P(A)·P(B) &nbsp;≈ 0.2511</div>
</div>

The estimates come close to the exact values, but are not equal to them: they are proportions from a finite sample, and they change a little with the seed. With more rolls, they tend to get closer to 0.5 and 0.25.

## 6. The Law of Total Probability

Sometimes $P(B)$ is not given directly, but we know its value in each of several scenarios. The law of total probability puts the scenarios together.

The scenarios must form a **partition** of the sample space: events $A_1, A_2, \ldots, A_n$ such that

- they are **mutually exclusive**: $A_i \cap A_j = \emptyset$ for $i \neq j$ (no two scenarios happen together);
- they are **exhaustive**: $A_1 \cup A_2 \cup \cdots \cup A_n = \Omega$ (some scenario always happens);
- each one has $P(A_i) > 0$ (so that $P(B \mid A_i)$ is defined).

Then, for any event $B$:

$$P(B) = \sum_{i=1}^{n} P(B \mid A_i) \, P(A_i) = P(B \mid A_1) P(A_1) + \cdots + P(B \mid A_n) P(A_n)$$

By the multiplication rule, each term is $P(B \cap A_i)$: the probability that $B$ occurs **in scenario $i$**. Since the scenarios do not overlap and cover everything, adding the terms gives $P(B)$.

**Example: three factories** (illustrative numbers). A company makes the same part in three factories. The table gives each factory's share of production and its rate of defective parts.

| Factory | Share of production $P(A_i)$ | Defect rate $P(B \mid A_i)$ | Term $P(B \mid A_i)\,P(A_i)$ |
|---|---|---|---|
| 1 | 0.5 | 0.02 | $0.02 \cdot 0.5 = 0.010$ |
| 2 | 0.3 | 0.03 | $0.03 \cdot 0.3 = 0.009$ |
| 3 | 0.2 | 0.04 | $0.04 \cdot 0.2 = 0.008$ |
| **Total** | **1** | | **0.027** |

Here $A_i$ = "the part came from factory $i$" (the three form a partition: every part comes from exactly one factory, and $0.5 + 0.3 + 0.2 = 1$) and $B$ = "the part is defective".

**Formula, substitution and arithmetic:**

$$P(B) = P(B \mid A_1)P(A_1) + P(B \mid A_2)P(A_2) + P(B \mid A_3)P(A_3)$$

$$P(B) = 0.02 \cdot 0.5 + 0.03 \cdot 0.3 + 0.04 \cdot 0.2$$

$$P(B) = 0.010 + 0.009 + 0.008 = 0.027$$

**Interpretation:** 2.7% of all the company's parts are defective, or 27 out of every 1,000. The value lies between the lowest rate (2%) and the highest (4%), closer to factory 1, which makes half of the parts: it is an average of the rates, weighted by production.

## 7. Bayes' Theorem

### 7.1 Formula

Bayes' Theorem answers the question "the other way round": if we know $P(B \mid A)$, what is $P(A \mid B)$?

By the multiplication rule, $P(A \cap B)$ can be written in two ways:

$$P(A \mid B) \, P(B) = P(A \cap B) = P(B \mid A) \, P(A)$$

Dividing both sides by $P(B)$, which must be greater than zero:

$$P(A \mid B) = \frac{P(B \mid A) \, P(A)}{P(B)}$$

Each term has a name:

- $P(A)$ is the **prior probability** of $A$: what we knew **before** observing $B$;
- $P(B \mid A)$ is the **likelihood**: how probable it is to observe $B$ if $A$ is the case;
- $P(B)$ is the **total probability** of observing $B$, across all scenarios;
- $P(A \mid B)$ is the **posterior probability** of $A$: what we know **after** observing $B$.

When the scenarios form a partition $A_1, \ldots, A_n$ (section 6), the denominator comes from the law of total probability:

$$P(A_i \mid B) = \frac{P(B \mid A_i) \, P(A_i)}{\sum_{j=1}^{n} P(B \mid A_j) \, P(A_j)}$$

The numerator is the term for scenario $i$; the denominator is the sum of all the terms. So each scenario's posterior is **the share of the total that its term represents**, and the posteriors add up to 1.

### 7.2 Example: Which Factory Did the Defective Part Come From?

Continuing the example from section 6: a part is picked at random and it is defective. What is the probability that it came from factory 2?

**Data** (from section 6): $P(B \mid A_2) = 0.03$, $P(A_2) = 0.3$ and $P(B) = 0.027$.

**Formula:**

$$P(A_2 \mid B) = \frac{P(B \mid A_2) \, P(A_2)}{P(B)}$$

**Substitution and arithmetic:**

$$P(A_2 \mid B) = \frac{0.03 \cdot 0.3}{0.027} = \frac{0.009}{0.027} = \frac{1}{3} \approx 0.3333$$

The same way, with the terms from the table:

| Factory | Prior $P(A_i)$ | Term | Posterior $P(A_i \mid B)$ |
|---|---|---|---|
| 1 | 0.5 | 0.010 | $\frac{0.010}{0.027} = \frac{10}{27} \approx 0.3704$ |
| 2 | 0.3 | 0.009 | $\frac{0.009}{0.027} = \frac{9}{27} = \frac{1}{3} \approx 0.3333$ |
| 3 | 0.2 | 0.008 | $\frac{0.008}{0.027} = \frac{8}{27} \approx 0.2963$ |
| **Total** | **1** | **0.027** | **1** |

**Interpretation:** before we knew about the defect, the part had a 50% chance of coming from factory 1. Knowing that it is defective, that chance drops to about 37%, and factory 3's rises from 20% to about 30%, because factory 3 has the highest defect rate. Even so, factory 1 is still the most likely source: it makes fewer mistakes, but it makes many more parts.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code># Exact fractions (//) to check the arithmetic; float() shows the decimal
P_factory = [5//10, 3//10, 2//10]              # P(A₁), P(A₂), P(A₃): share of production
P_def_given_factory = [2//100, 3//100, 4//100] # P(B | Aᵢ): defect rate of each factory

# Law of total probability: P(B) = Σ P(B | Aᵢ) P(Aᵢ)
P_def = sum(P_def_given_factory .* P_factory)

# Bayes' Theorem: P(Aᵢ | B) = P(B | Aᵢ) P(Aᵢ) / P(B)
P_factory_given_def = P_def_given_factory .* P_factory ./ P_def

println("P(B) = ", P_def, " = ", float(P_def))
for i in 1:3
    println("P(A", i, " | B) = ", P_factory_given_def[i], " ≈ ",
            round(float(P_factory_given_def[i]), digits=4))
end
println("Sum of the posteriors = ", sum(P_factory_given_def))</code></pre>
  </div>
</div>

#### Expected output:
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <div>P(B) = 27//1000 = 0.027</div>
  <div>P(A1 | B) = 10//27 ≈ 0.3704</div>
  <div>P(A2 | B) = 1//3 ≈ 0.3333</div>
  <div>P(A3 | B) = 8//27 ≈ 0.2963</div>
  <div>Sum of the posteriors = 1//1</div>
</div>

### 7.3 Example: a Diagnostic Test

The numbers in this example are **illustrative**, chosen to keep the arithmetic simple; they do not describe any real disease or test.

A disease affects 1% of a population. A test comes back positive in 99% of the people who have the disease (the **sensitivity**) and in 5% of those who do not (the **false positives**). A person picked at random tests positive. What is the probability that they have the disease?

**Data:**

- $D$ = "the person has the disease"; $P(D) = 0.01$, so $P(D^c) = 1 - 0.01 = 0.99$;
- $T^+$ = "the test comes back positive";
- $P(T^+ \mid D) = 0.99$ (sensitivity);
- $P(T^+ \mid D^c) = 0.05$ (false positive rate).

**Step 1: the total probability of a positive.** $D$ and $D^c$ form a partition (every person either has the disease or does not):

$$P(T^+) = P(T^+ \mid D) \, P(D) + P(T^+ \mid D^c) \, P(D^c)$$

$$P(T^+) = 0.99 \cdot 0.01 + 0.05 \cdot 0.99$$

$$P(T^+) = 0.0099 + 0.0495 = 0.0594$$

**Step 2: Bayes.**

$$P(D \mid T^+) = \frac{P(T^+ \mid D) \, P(D)}{P(T^+)} = \frac{0.0099}{0.0594} = \frac{1}{6} \approx 0.1667$$

**Interpretation:** even with a test that catches 99% of those who are ill, only about 1 in 6 people with a positive result has the disease. Counting people makes this easier to see. Out of 10,000 people:

- 1% have the disease: 100 people, of whom 99% (99 people) test positive;
- 99% do not: 9,900 people, of whom 5% (495 people) test positive by mistake.

That makes $99 + 495 = 594$ positives, and only 99 of them have the disease: $\frac{99}{594} = \frac{1}{6}$. False positives are a small fraction of the healthy people, but there are so many healthy people that the false positives outnumber the true ones.

What the result does **not** say: that the test is bad, or that a positive should be ignored. A positive raised the chance from 1% to about 17%; the number depends heavily on the prevalence in the population being tested. This page explains the mathematics and does not give medical advice: the result of a real test should be interpreted by a health professional.

The code below redoes the calculation for three prevalences, with the same test:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code># P(D | T+) for a test with 99% sensitivity and 5% false positives,
# at three different prevalences (illustrative numbers)
sensitivity = 0.99        # P(T+ | D)
false_positive = 0.05     # P(T+ | Dᶜ)

for prevalence in (0.001, 0.01, 0.10)                   # P(D)
    P_pos = sensitivity * prevalence + false_positive * (1 - prevalence)  # P(T+)
    P_D_given_pos = sensitivity * prevalence / P_pos                        # Bayes
    println("P(D) = ", rpad(prevalence, 5), "   P(T+) = ", rpad(round(P_pos, digits=5), 7),
            "   P(D | T+) = ", round(P_D_given_pos, digits=4))
end</code></pre>
  </div>
</div>

#### Expected output:
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <div>P(D) = 0.001 &nbsp; P(T+) = 0.05094 &nbsp; P(D | T+) = 0.0194</div>
  <div>P(D) = 0.01 &nbsp; &nbsp;P(T+) = 0.0594 &nbsp; &nbsp;P(D | T+) = 0.1667</div>
  <div>P(D) = 0.1 &nbsp; &nbsp; P(T+) = 0.144 &nbsp; &nbsp; P(D | T+) = 0.6875</div>
</div>

With a rare disease (0.1%), a positive indicates the disease in less than 2% of cases; with a 10% prevalence, in almost 69%. The same test gives very different answers depending on the prior probability.

## 8. Solved Exercises

### 8.1 Ticks Carrying Two Diseases

![Illustration of four ticks seen from above, in shades of brown]({{ site.baseurl }}/assets/images/carrapato.avif){:style="max-width: 400px; display: block; margin: 0 auto;"}
<div class="image-caption" style="text-align: center;">Figure 2: An illustration of ticks.</div>

> **Problem** (illustrative numbers): ticks can transmit Lyme disease and human granulocytic ehrlichiosis (HGE). Suppose that, in a population of ticks, 16% carry the Lyme disease agent, 10% carry the HGE agent and, among those that carry at least one of the two, 10% carry both.
>
> a) What is the probability that a tick carries both?
>
> b) What is the probability that a tick carries the HGE agent, given that it carries the Lyme agent?

**Data.** Let $L$ = "carries the Lyme agent" and $H$ = "carries the HGE agent". From the problem:

$$P(L) = 0.16 \qquad P(H) = 0.10 \qquad P(L \cap H \mid L \cup H) = 0.10$$

The third statement is a conditional probability: "among those that carry at least one" is the event $L \cup H$, and "carry both" is $L \cap H$.

**(a)** Call $x = P(L \cap H)$, the value we want. Since $L \cap H$ is contained in $L \cup H$, their intersection is $L \cap H$ itself, and the definition of conditional probability gives:

$$P(L \cap H \mid L \cup H) = \frac{P(L \cap H)}{P(L \cup H)} = \frac{x}{P(L \cup H)}$$

By the addition rule, $P(L \cup H) = P(L) + P(H) - P(L \cap H) = 0.16 + 0.10 - x = 0.26 - x$. Substituting:

$$0.10 = \frac{x}{0.26 - x}$$

Multiplying both sides by $0.26 - x$:

$$0.10 \cdot (0.26 - x) = x$$

$$0.026 - 0.10\,x = x$$

Adding $0.10\,x$ to both sides:

$$0.026 = 1.10\,x$$

$$x = \frac{0.026}{1.10} = \frac{13}{550} \approx 0.02364$$

**Check:** $P(L \cup H) = 0.26 - 0.02364 = 0.23636$, and $\frac{0.02364}{0.23636} \approx 0.10$, as the problem requires.

**Answer (a):** $P(L \cap H) \approx 0.0236$, or about 2.36% of the ticks (around 24 out of every 1,000) carry both agents.

**(b)** By the definition:

$$P(H \mid L) = \frac{P(H \cap L)}{P(L)} = \frac{13/550}{0.16} = \frac{13}{88} \approx 0.1477$$

**Answer (b):** about 14.77% of the ticks that carry the Lyme agent also carry the HGE agent.

**Interpretation:** $P(H \mid L) \approx 0.148$ is greater than $P(H) = 0.10$. With these numbers, knowing that a tick carries the Lyme agent raises the chance that it carries the HGE agent: the two events are **not** independent. (If they were, $P(L \cap H)$ would be $0.16 \cdot 0.10 = 0.016$, not 0.0236.)

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>P_L = 0.16      # P(L): carries Lyme disease
P_H = 0.10      # P(H): carries HGE
r = 0.10        # P(L ∩ H | L ∪ H)

# From x = r·(P(L) + P(H) − x) we get x = r·(P(L) + P(H)) / (1 + r)
P_LandH = r * (P_L + P_H) / (1 + r)
P_LorH = P_L + P_H - P_LandH
P_H_given_L = P_LandH / P_L

println("P(L ∩ H)     = ", round(P_LandH, digits=5))
println("P(L ∪ H)     = ", round(P_LorH, digits=5))
println("Check: P(L ∩ H) / P(L ∪ H) = ", round(P_LandH / P_LorH, digits=5))
println("P(H | L)     = ", round(P_H_given_L, digits=4))</code></pre>
  </div>
</div>

#### Expected output:
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <div>P(L ∩ H) &nbsp; &nbsp; = 0.02364</div>
  <div>P(L ∪ H) &nbsp; &nbsp; = 0.23636</div>
  <div>Check: P(L ∩ H) / P(L ∪ H) = 0.1</div>
  <div>P(H | L) &nbsp; &nbsp; = 0.1477</div>
</div>

The code uses the closed-form solution $x = \frac{r\,(P(L) + P(H))}{1 + r}$, with $r = 0.10$, obtained by solving for $x$ as above.

### 8.2 An HIV Test

> **Problem** (illustrative numbers): suppose that 1 in every 5,000 people in a population is living with HIV, and that a test gives the right result in 99% of cases, both for people living with HIV and for people who are not.
>
> a) What is the probability that the test comes back negative for a person living with HIV?
>
> b) A person picked at random tests positive. What is the probability that they are living with HIV?
>
> c) A person picked at random tests negative. What is the probability that they are not living with HIV?

**Data.** Let $H$ = "the person is living with HIV", $+$ = "the test comes back positive" and $-$ = "the test comes back negative". From the problem:

- $P(H) = \frac{1}{5000} = 0.0002$, so $P(H^c) = 1 - 0.0002 = 0.9998$;
- the test is right for 99% of the people living with HIV: $P(+ \mid H) = 0.99$;
- and for 99% of those who are not: $P(- \mid H^c) = 0.99$.

**(a)** For a person living with HIV, the test is either positive or negative. By the complement rule (section 3):

$$P(- \mid H) = 1 - P(+ \mid H) = 1 - 0.99 = 0.01$$

**Answer (a):** 0.01, or 1% (a **false negative**).

**(b)** First, the total probability of a positive. Also by the complement, $P(+ \mid H^c) = 1 - P(- \mid H^c) = 1 - 0.99 = 0.01$ (a **false positive**). Then:

$$P(+) = P(+ \mid H) \, P(H) + P(+ \mid H^c) \, P(H^c)$$

$$P(+) = 0.99 \cdot 0.0002 + 0.01 \cdot 0.9998$$

$$P(+) = 0.000198 + 0.009998 = 0.010196$$

Now, Bayes' Theorem:

$$P(H \mid +) = \frac{P(+ \mid H) \, P(H)}{P(+)} = \frac{0.000198}{0.010196} \approx 0.0194$$

**Answer (b):** about 1.94%.

**(c)** The total probability of a negative:

$$P(-) = P(- \mid H^c) \, P(H^c) + P(- \mid H) \, P(H)$$

$$P(-) = 0.99 \cdot 0.9998 + 0.01 \cdot 0.0002$$

$$P(-) = 0.989802 + 0.000002 = 0.989804$$

And Bayes:

$$P(H^c \mid -) = \frac{P(- \mid H^c) \, P(H^c)}{P(-)} = \frac{0.989802}{0.989804} \approx 0.99999798$$

**Answer (c):** about 0.99999798, or 99.999798%.

**Interpretation**, counting people. Out of 500,000 people:

- 1 in 5,000 is living with HIV: 100 people; the test is positive for 99 of them and negative for 1;
- 499,900 are not living with HIV; the test is negative for 99% of them (494,901) and positive for 1% (4,999).

Of the $99 + 4{,}999 = 5{,}098$ positives, only 99 are living with HIV: $\frac{99}{5098} \approx 1.94\%$. Of the $494{,}901 + 1 = 494{,}902$ negatives, only 1 is living with HIV. With such a rare condition, a single positive says little (most positives are false positives), while a negative is very reliable. With these illustrative numbers, a positive on its own is not enough to conclude that the person is living with HIV; interpreting a real test is a job for a health professional.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>P_HIV = 1 / 5000              # prevalence (illustrative)
P_pos_given_HIV = 0.99        # sensitivity: P(+ | HIV)
P_neg_given_noHIV = 0.99      # specificity: P(− | HIVᶜ)

P_noHIV = 1 - P_HIV
P_neg_given_HIV = 1 - P_pos_given_HIV        # (a) false negative
P_pos_given_noHIV = 1 - P_neg_given_noHIV    # false positive

# Law of total probability
P_pos = P_pos_given_HIV * P_HIV + P_pos_given_noHIV * P_noHIV
P_neg = P_neg_given_noHIV * P_noHIV + P_neg_given_HIV * P_HIV

# Bayes' Theorem
P_HIV_given_pos = P_pos_given_HIV * P_HIV / P_pos            # (b)
P_noHIV_given_neg = P_neg_given_noHIV * P_noHIV / P_neg      # (c)

println("(a) P(− | HIV)   = ", round(P_neg_given_HIV, digits=4))
println("    P(+)         = ", round(P_pos, digits=6))
println("(b) P(HIV | +)   = ", round(P_HIV_given_pos, digits=4))
println("    P(−)         = ", round(P_neg, digits=6))
println("(c) P(HIVᶜ | −)  = ", round(P_noHIV_given_neg, digits=8))</code></pre>
  </div>
</div>

#### Expected output:
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <div>(a) P(− | HIV) &nbsp; = 0.01</div>
  <div> &nbsp; &nbsp;P(+) &nbsp; &nbsp; &nbsp; &nbsp; = 0.010196</div>
  <div>(b) P(HIV | +) &nbsp; = 0.0194</div>
  <div> &nbsp; &nbsp;P(−) &nbsp; &nbsp; &nbsp; &nbsp; = 0.989804</div>
  <div>(c) P(HIVᶜ | −) &nbsp;= 0.99999798</div>
</div>

### 8.3 Quality Control

![Illustrative photograph of an inspector in a hard hat and gloves examining a metal part in a factory]({{ site.baseurl }}/assets/images/qualidade.avif){:style="max-width: 400px; display: block; margin: 0 auto;"}
<div class="image-caption" style="text-align: center;">Figure 3: Quality inspection on a production line (illustration).</div>

> **Problem** (illustrative numbers): in a factory, 2 out of every 1,000 products are defective. A quality test classifies each product as "defective" or "good" and is right 95% of the time, both for defective and for good products.
>
> a) What is the probability that the test says "defective" for a good product?
>
> b) The test said "defective". What is the probability that the product really is defective?

**Data.** Let $D$ = "the product is defective", $G$ = "the product is good" ($G = D^c$), $T_d$ = "the test says defective" and $T_g$ = "the test says good". From the problem:

- $P(D) = \frac{2}{1000} = 0.002$, so $P(G) = 1 - 0.002 = 0.998$;
- $P(T_d \mid D) = 0.95$ and $P(T_g \mid G) = 0.95$.

**(a)** By the complement rule:

$$P(T_d \mid G) = 1 - P(T_g \mid G) = 1 - 0.95 = 0.05$$

**Answer (a):** 0.05, or 5% (the false positive rate).

**(b)** The total probability that the test says defective:

$$P(T_d) = P(T_d \mid D) \, P(D) + P(T_d \mid G) \, P(G)$$

$$P(T_d) = 0.95 \cdot 0.002 + 0.05 \cdot 0.998$$

$$P(T_d) = 0.0019 + 0.0499 = 0.0518$$

And Bayes:

$$P(D \mid T_d) = \frac{P(T_d \mid D) \, P(D)}{P(T_d)} = \frac{0.0019}{0.0518} = \frac{19}{518} \approx 0.0367$$

**Answer (b):** about 3.67%.

**Interpretation:** out of 10,000 products, 20 are defective and the test flags 19 of them; of the 9,980 good ones, it flags 5% by mistake, or 499. Of the $19 + 499 = 518$ flagged, only 19 are defective. This happens because defects are rare (0.2%) and the false positive rate (5%) is much larger than that prevalence. In practice, an alarm from the test should lead to a second inspection, not straight to the scrap bin.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>P_D = 2 / 1000          # P(D): defective product
P_G = 1 - P_D           # P(G): product in good condition

P_Td_given_D = 0.95     # the test gets 95% of the defective ones right
P_Tg_given_G = 0.95     # and 95% of the good ones
P_Td_given_G = 1 - P_Tg_given_G         # (a) false positive

P_Td = P_Td_given_D * P_D + P_Td_given_G * P_G   # total probability
P_D_given_Td = P_Td_given_D * P_D / P_Td         # (b) Bayes

println("(a) P(Td | G) = ", round(P_Td_given_G, digits=4))
println("    P(Td)     = ", round(P_Td, digits=4))
println("(b) P(D | Td) = ", round(P_D_given_Td, digits=4))</code></pre>
  </div>
</div>

#### Expected output:
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <div>(a) P(Td | G) = 0.05</div>
  <div> &nbsp; &nbsp;P(Td) &nbsp; &nbsp; = 0.0518</div>
  <div>(b) P(D | Td) = 0.0367</div>
</div>

### 8.4 Weather Forecasting

![Photograph of a black umbrella in heavy rain, with a blurred green background]({{ site.baseurl }}/assets/images/chuva.avif){:style="max-width: 400px; display: block; margin: 0 auto;"}
<div class="image-caption" style="text-align: center;">Figure 4: A rainy day (illustration).</div>

> **Problem** (illustrative numbers): in a city, it rains on 1 out of every 10 summer days. A forecasting model is right 80% of the time: when it is going to rain, it forecasts "rain" with probability 0.8; when it is not going to rain, it forecasts "no rain" with probability 0.8.
>
> a) What is the probability that the model forecasts "no rain" on a day when it rains?
>
> b) The model forecast "no rain". What is the probability that it rains anyway?

**Data.** Let $R$ = "it rains that day" and $N$ = "the model forecasts no rain". From the problem:

- $P(R) = \frac{1}{10} = 0.1$, so $P(R^c) = 1 - 0.1 = 0.9$;
- $P(N^c \mid R) = 0.8$ (it forecasts "rain" when it rains) and $P(N \mid R^c) = 0.8$ (it forecasts "no rain" when it does not rain).

**(a)** By the complement rule:

$$P(N \mid R) = 1 - P(N^c \mid R) = 1 - 0.8 = 0.2$$

**Answer (a):** 0.2, or 20% of the rainy days.

**(b)** The total probability that the model forecasts "no rain":

$$P(N) = P(N \mid R) \, P(R) + P(N \mid R^c) \, P(R^c)$$

$$P(N) = 0.2 \cdot 0.1 + 0.8 \cdot 0.9$$

$$P(N) = 0.02 + 0.72 = 0.74$$

And Bayes:

$$P(R \mid N) = \frac{P(N \mid R) \, P(R)}{P(N)} = \frac{0.02}{0.74} = \frac{1}{37} \approx 0.0270$$

**Answer (b):** about 2.70%.

**Interpretation:** when the model forecasts "no rain", it rains on about 1 out of every 37 of those days. The "no rain" forecast is reliable because most days are dry anyway. The "rain" forecast is much less so: doing the same calculation, $P(R \mid N^c) = \frac{0.8 \cdot 0.1}{0.8 \cdot 0.1 + 0.2 \cdot 0.9} = \frac{0.08}{0.26} = \frac{4}{13} \approx 0.3077$, so only about 31% of the days with a rain forecast actually get rain.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>P_R = 1 / 10            # P(R): a summer day with rain
P_Rc = 1 - P_R          # P(Rᶜ): a dry day

P_N_given_R = 1 - 0.8   # (a) the model misses 20% of the rainy days
P_N_given_Rc = 0.8      # and gets 80% of the dry days right

P_N = P_N_given_R * P_R + P_N_given_Rc * P_Rc  # total probability
P_R_given_N = P_N_given_R * P_R / P_N          # (b) Bayes

println("(a) P(N | R) = ", round(P_N_given_R, digits=4))
println("    P(N)     = ", round(P_N, digits=4))
println("(b) P(R | N) = ", round(P_R_given_N, digits=4))</code></pre>
  </div>
</div>

#### Expected output:
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <div>(a) P(N | R) = 0.2</div>
  <div> &nbsp; &nbsp;P(N) &nbsp; &nbsp; = 0.74</div>
  <div>(b) P(R | N) = 0.027</div>
</div>

## 9. Practice Exercises

1. **Two dice.** Two fair dice are rolled. What is the probability that the sum is 8, given that the first die shows 3? Compare it with the probability that the sum is 8 with no information. Are the events independent?

   *Answer:* given that the first die shows 3, the sum is 8 only if the second shows 5: $\frac{1}{6} \approx 0.1667$. With no information, $P(\text{sum } 8) = \frac{5}{36} \approx 0.1389$. Since the values differ, the events are not independent (section 5).

2. **An urn without replacement.** An urn holds 3 red balls and 2 blue ones. Two are drawn, without replacement. (a) What is the probability that both are red? (b) What is the probability that the second is red? (c) Given that the second is red, what is the probability that the first is red too?

   *Answer:* let $R_1$ and $R_2$ = "the 1st / the 2nd ball is red".
   (a) By the multiplication rule, $P(R_1 \cap R_2) = \frac{3}{5} \cdot \frac{2}{4} = \frac{6}{20} = \frac{3}{10} = 0.3$.
   (b) By total probability, with the partition $R_1$, $R_1^c$: $P(R_2) = \frac{3}{5} \cdot \frac{2}{4} + \frac{2}{5} \cdot \frac{3}{4} = \frac{6}{20} + \frac{6}{20} = \frac{12}{20} = \frac{3}{5} = 0.6$ (the same chance as the 1st draw).
   (c) By Bayes, $P(R_1 \mid R_2) = \frac{P(R_1 \cap R_2)}{P(R_2)} = \frac{3/10}{3/5} = \frac{1}{2} = 0.5$.

3. **Prevalence.** Redo the example from section 7.3 with a 10% prevalence (same test). What is $P(D \mid T^+)$?

   *Answer:* $P(T^+) = 0.99 \cdot 0.1 + 0.05 \cdot 0.9 = 0.099 + 0.045 = 0.144$ and $P(D \mid T^+) = \frac{0.099}{0.144} = 0.6875$, or 68.75%.

## 10. Common Mistakes and When to Be Careful

- **Swapping $P(A \mid B)$ for $P(B \mid A)$.** "99% of the people who are ill test positive" does not mean "99% of the positives are ill". In the example from section 7.3, the second number is about 17%.
- **Forgetting the prior probability.** The result of Bayes depends heavily on $P(A)$. The same test gives 1.94%, 16.67% or 68.75% depending on the prevalence (section 7.3). Using the prevalence of another population (for example, the general population's, for people who already have symptoms) changes the answer.
- **Conditioning on an event with probability zero.** The formula only defines $P(A \mid B)$ when $P(B) > 0$.
- **Assuming independence without a reason.** Multiplying $P(A) \cdot P(B)$ only works for independent events; for draws without replacement, for example, it does not (section 4).
- **Reading a conditional probability as a cause.** A high $P(A \mid B)$ says that $A$ is common **when** $B$ occurs, not that $B$ **causes** $A$. In the ticks example, $P(H \mid L) > P(H)$ does not say that one agent brings on the other.
- **Confusing independent with mutually exclusive.** Mutually exclusive events with positive probability are always dependent (section 5).

## References

1. Bussab, W. O.; Morettin, P. A. (2023). *Estatística Básica*. 10th ed. Saraiva Uni. (in Portuguese)
2. Ross, S. M. (2012). *A First Course in Probability*. 9th ed. Pearson.
