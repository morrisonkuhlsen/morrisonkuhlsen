---
layout: page
title: Conditional Probability
lang: en
ref: probabilidade-condicional
parent: probabilidade
permalink: /en/probability/conditional-probability
order: 6
mathjax: true
description: "The probability of an event given that another event has already happened, with Bayes' Theorem."
---

**Conditional Probability** is a fundamental concept that lets us compute the probability of an event given that another event has already happened. It is essential for understanding dependence between events and for making more accurate predictions.

<div style="border-left: 4px solid #4CAF50; padding: 0.5em; background-color: #e8f5e9;">
  <strong>🎯 Important:</strong><br>
  The conditional probability of an event $A$ given that $B$ happened is written $P(A\mid B)$ and is computed as:
  $$P(A\mid B) = \frac{P(A \cap B)}{P(B)}, \text{ where } P(B) > 0$$
</div>

## 1. Definition and Basic Concepts

### 1.1 Formal Definition

The conditional probability $$P(A\mid B)$$ is the probability that event $$A$$ happens, knowing that event $$B$$ has already happened. Formally:

$$P(A\mid B) = \frac{P(A \cap B)}{P(B)}, \text{ where } P(B) > 0$$

### 1.2 Geometric Interpretation

Conditional probability can be pictured as shrinking the original sample space down to the conditioning event:

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

# Function that draws a circle
function circle(h, k, r)
    θ = range(0, 2π, length=100)
    h .+ r*cos.(θ), k .+ r*sin.(θ)
end

# Base plot
plot(size=(800,400), layout=(1,2), legend=:topright)

# Original sample space
p1 = plot!(subplot=1, title="Events A and B")
plot!(p1, circle(0,0,1), seriestype=:shape, alpha=0.3, color=:gray, label="Ω")
plot!(p1, circle(-0.3,0,0.5), seriestype=:shape, alpha=0.3, color=:blue, label="A")
plot!(p1, circle(0.3,0,0.5), seriestype=:shape, alpha=0.3, color=:red, label="B")
plot!(p1, xlims=(-1.5,1.5), ylims=(-1.5,1.5), aspect_ratio=:equal)

# Conditional probability
p2 = plot!(subplot=2, title="P(A|B)")
plot!(p2, circle(0.3,0,0.5), seriestype=:shape, alpha=0.3, color=:red, label="B")
plot!(p2, circle(-0.3,0,0.5), seriestype=:shape, alpha=0.3, color=:blue, label="A∩B")
plot!(p2, xlims=(-1.5,1.5), ylims=(-1.5,1.5), aspect_ratio=:equal)</code></pre>
  </div>
</div>

![Visualizing conditional probability]({{ site.baseurl }}/assets/images/prob_condicional.png)
<div class="image-caption">Figure 1: The geometric interpretation of conditional probability</div>

## 2. Fundamental Properties

### 2.1 Axioms and Basic Properties

1. **Non-negativity**: $0 \leq P(A\mid B) \leq 1$
2. **Normalization**: $P(\Omega\mid B) = 1$
3. **Additivity**: for mutually exclusive events $A_1$ and $A_2$:
   $P(A_1 \cup A_2\mid B) = P(A_1\mid B) + P(A_2\mid B)$
4. **Complement**: $P(A\mid B) + P(A'\mid B) = 1$
5. **Asymmetry**: $P(A\mid B) \neq P(B\mid A)$ (in general)

### 2.2 The Multiplication Rule

The multiplication rule states that:

$$P(A \cap B) = P(B) \cdot P(A\mid B) = P(A) \cdot P(B\mid A)$$

This rule is fundamental for:
- Computing probabilities of compound events
- Determining whether events are independent
- Solving sequential probability problems

### 2.3 The Law of Total Probability

For a partition $\{B_1, B_2, ..., B_n\}$ of the sample space:

$$P(A) = \sum_{i=1}^n P(A\mid B_i)P(B_i)$$

This law lets us:
- Break complex probabilities into pieces
- Analyze mutually exclusive scenarios
- Compute marginal probabilities

## 3. Independence of Events

### 3.1 Formal Definition

Two events $A$ and $B$ are independent if:

$$P(A\mid B) = P(A) \text{ or } P(B\mid A) = P(B)$$

Equivalently:

$$P(A \cap B) = P(A) \cdot P(B)$$

### 3.2 Checking Independence

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

function check_independence()
    # Simulating rolls of two dice
    n_simulations = 10000
    Random.seed!(123)
    
    # Generating the rolls
    die1 = rand(1:6, n_simulations)
    die2 = rand(1:6, n_simulations)
    
    # Events
    A = die1 .> 3  # First die greater than 3
    B = die2 .% 2 .== 0  # Second die is even
    
    # Computing probabilities
    PA = mean(A)
    PB = mean(B)
    PAB = mean(A .& B)
    
    println("P(A) = ", round(PA, digits=4))
    println("P(B) = ", round(PB, digits=4))
    println("P(A∩B) = ", round(PAB, digits=4))
    println("P(A)⋅P(B) = ", round(PA*PB, digits=4))
end

check_independence()</code></pre>
  </div>
</div>

## 4. Bayes' Theorem

**Bayes' Theorem** is a fundamental principle of statistics that describes how we update our beliefs about an event **in light of new evidence**. It is widely used in probability and statistics, especially in problems where we need to revise predictions or hypotheses as more information comes in.

### 4.1 Formulation and Intuition

Bayes' Theorem can be written mathematically as:

$$P(A\mid B) = \frac{P(B\mid A)P(A)}{P(B)}$$

Each term has a specific meaning:

- $P(A\mid B)$ is the <span style="color:orange;">**posterior probability**</span>: the probability of $A$ given that $B$ has happened
- $P(B\mid A)$ is the <span style="color:orange;">**likelihood**</span>: the probability of $B$ given that $A$ is true
- $P(A)$ is the <span style="color:orange;">**prior probability**</span>: the probability of $A$ without any additional information
- $P(B)$ is the <span style="color:orange;">**marginal probability**</span>: the probability of $B$, taking every hypothesis into account

<div style="border-left: 4px solid #FFB366; padding: 0.5em; background-color: #FFF3E6;">
  <strong>💡 Tip:</strong><br>
  Whenever you condition on something, the sample space shrinks to the given event. That's why the posterior probability $P(A\mid B)$ only considers the space where $B$ happened.
</div>

### 4.2 Components and Interpretation

1. **Prior Probability**
   - Represents what we know at the start
   - Based on previous information or experience
   - Can be subjective or based on historical data

2. **Likelihood**
   - Represents the observed evidence
   - Measures how likely the data are under different hypotheses
   - Updates our initial belief

3. **Posterior Probability**
   - Combines the prior and the likelihood
   - Represents our updated belief
   - The basis for making decisions

### 4.3 Worked Example: A Diagnostic Test

Consider a diagnostic test for a disease $D$, where:

- $P(D) = 0.01$ (1% of the population has the disease)
- $P(T^+\mid D) = 0.99$ (the test has 99% sensitivity)
- $P(T^+\mid D^c) = 0.05$ (5% false positives)

The total probability of a positive test is:

$$P(T^+) = P(T^+\mid D)P(D) + P(T^+\mid D^c)P(D^c)$$
$$P(T^+) = (0.99 \cdot 0.01) + (0.05 \cdot 0.99) = 0.0594$$

Applying Bayes to find the probability of having the disease given a positive test:

$$P(D\mid T^+) = \frac{P(T^+\mid D)P(D)}{P(T^+)} = \frac{0.99 \cdot 0.01}{0.0594} \approx 0.1667$$

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>function bayes_example()
    # Problem parameters
    P_D = 0.01    # P(D) - prevalence
    P_TD = 0.99   # P(T+|D) - sensitivity
    P_TnD = 0.05  # P(T+|not D) - false positive rate
    
    # Marginal probability P(T+)
    P_T = P_TD * P_D + P_TnD * (1 - P_D)
    
    # Bayes' Theorem
    P_DT = (P_TD * P_D) / P_T
    
    println("Diagnostic Test Analysis:")
    println("-------------------------")
    println("Disease prevalence: ", round(P_D * 100, digits=1), "%")
    println("Test sensitivity: ", round(P_TD * 100, digits=1), "%")
    println("False positive rate: ", round(P_TnD * 100, digits=1), "%")
    println("-------------------------")
    println("Probability of disease given a positive test: ",
            round(P_DT * 100, digits=1), "%")
end

bayes_example()</code></pre>
  </div>
</div>

### 4.4 Applications in Different Fields

1. **Medicine and Diagnosis**
   - Interpreting clinical tests
   - Assessing health risks
   - Epidemiological studies
   - Personalized medicine

2. **Machine Learning and AI**
   - Bayesian classifiers
   - Bayesian networks
   - Recommender systems
   - Natural language processing
   - Spam filters

3. **Finance and Economics**
   - Risk analysis
   - Market forecasting
   - Fraud detection
   - Investment appraisal

4. **Social Sciences**
   - Opinion polls
   - Behavior analysis
   - Demographic studies
   - Election forecasting

### 4.5 Practical Considerations

1. **Choosing the Prior**
   - Use historical data when available
   - Consider expert opinion
   - Use non-informative priors when appropriate

2. **Sequential Updating**
   - The posterior of one analysis can be the prior of the next
   - Allows incremental learning
   - Useful for real-time data analysis

3. **Limitations**
   - Sensitivity to the choice of prior
   - Needs well-defined probabilities
   - Computationally demanding in some cases

### 4.6 Bayes' Theorem with Partitions

A **partition** is a set of mutually exclusive and collectively exhaustive events that cover the whole sample space. In other words, every possible outcome belongs to exactly one of those events.

#### 4.6.1 Formulation with Partitions

For a partition made of the events $A_1, A_2, \dots, A_n$ and an event $B$, Bayes' Theorem reads:

$$P(A_i\mid B) = \frac{P(B\mid A_i)P(A_i)}{\sum_{j=1}^{n} P(B\mid A_j)P(A_j)}$$

Where:
- **Partition**: $A_1, A_2, \dots, A_n$ are events that form a partition of the sample space
  - Mutually exclusive: $A_i \cap A_j = \emptyset$ for $i \neq j$
  - Collectively exhaustive: $\bigcup_{i=1}^{n} A_i = \Omega$
- **Posterior probability**: $P(A_i\mid B)$
- **Likelihood**: $P(B\mid A_i)$
- **Prior probability**: $P(A_i)$
- **Marginal probability**: $\sum_{j=1}^{n} P(B\mid A_j)P(A_j)$

#### 4.6.2 Example: Quality Control

Consider a company with three factories that make the same product:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>function bayes_partitions_example()
    # Probabilities of each factory (prior)
    P_A = [0.5, 0.3, 0.2]  # P(A₁), P(A₂), P(A₃)
    
    # Defect probabilities per factory
    P_BA = [0.02, 0.03, 0.04]  # P(B|A₁), P(B|A₂), P(B|A₃)
    
    # Total probability of a defect (law of total probability)
    P_B = sum(P_BA .* P_A)
    
    # Posterior probabilities (Bayes' Theorem)
    P_AB = P_BA .* P_A ./ P_B
    
    println("Quality Control Analysis")
    println("------------------------")
    println("Total probability of a defect: ", round(P_B * 100, digits=2), "%")
    println("\nProbability of origin given a defect:")
    for (i, p) in enumerate(P_AB)
        println("Factory ", i, ": ", round(p * 100, digits=2), "%")
    end
end

bayes_partitions_example()</code></pre>
  </div>
</div>

Given:
- Production shares (prior):
  - $P(A_1) = 0.5$ (Factory 1)
  - $P(A_2) = 0.3$ (Factory 2)
  - $P(A_3) = 0.2$ (Factory 3)

- Defect probabilities per factory:
  - $P(B\mid A_1) = 0.02$ (2% defects at Factory 1)
  - $P(B\mid A_2) = 0.03$ (3% defects at Factory 2)
  - $P(B\mid A_3) = 0.04$ (4% defects at Factory 3)

1. **Total Probability of a Defect**:
   $$P(B) = \sum_{j=1}^{3} P(B\mid A_j)P(A_j)$$
   $$P(B) = (0.02 \cdot 0.5) + (0.03 \cdot 0.3) + (0.04 \cdot 0.2) = 0.027$$

2. **Probability of Factory 2 Given a Defect**:
   $$P(A_2\mid B) = \frac{P(B\mid A_2)P(A_2)}{P(B)} = \frac{0.03 \cdot 0.3}{0.027} = \frac{1}{3} \approx 0.3333$$

Therefore:
- The total probability that a product is defective is 2.7%
- If a product is defective, there is about a 33.33% chance it came from Factory 2

#### 4.6.3 Why Partitions Matter

Using partitions in Bayes' Theorem is fundamental for:

1. **A Complete Analysis**
   - Considers every mutually exclusive possibility
   - Ensures no case is left out
   - Allows a systematic analysis

2. **Decision Making**
   - Weighs several hypotheses at once
   - Compares probabilities across scenarios
   - Supports evidence-based choices

3. **Practical Applications**
   - Medical diagnosis with several possible causes
   - Classification in machine learning
   - Failure analysis in complex systems
   - Risk assessment in projects

## 5. Applications and Worked Examples

### 5.1 Medicine and Diagnosis
- Diagnostic tests
- Epidemiological studies
- Health risk analysis
- Patient triage

### 5.2 Finance and Economics
- Credit risk analysis
- Market forecasting
- Investment decisions
- Insurance appraisal

### 5.3 Machine Learning and AI
- Bayesian classifiers
- Bayesian networks
- Recommender systems
- Natural language processing

### 5.4 Social Sciences
- Opinion polls
- Behavior analysis
- Demographic studies
- Election forecasting

## 6. Practice Exercises

### 6.1 Solved Exercise: An Epidemiological Study

![Illustration of ticks]({{ site.baseurl }}/assets/images/carrapato.avif){:style="max-width: 400px; display: block; margin: 0 auto;"}
<div class="image-caption" style="text-align: center;">Figure: Different kinds of ticks that can transmit diseases</div>

> **Problem**: Ticks can carry both <span style="color:indigo;">**Lyme**</span> disease and <span style="color:steelblue;">**human granulocytic ehrlichiosis (HGE)**</span>. A study of ticks in the *American Midwest* found that:
> - <span style="color:indigo;">**16%**</span> of the ticks carried Lyme disease
> - <span style="color:steelblue;">**10%**</span> carried HGE
> - <span style="color:red;">**10%**</span> of the ticks that carried Lyme disease or HGE <span style="color:red;">**carried both diseases**</span>

**Questions**:
- a) What is the probability $\Pr[\text{Lyme} \cap \text{HGE}]$ that a tick carries both diseases?
- b) What is the conditional probability that a tick carries HGE, given that it carries Lyme disease?

### Notation and problem data

Let:

- $L$: "the tick carries Lyme disease"
- $H$: "the tick carries HGE"

The data in the problem are:

$$P(L) = 0.16, \quad P(H) = 0.10$$

and also:

$$P(L \cap H \mid L \cup H) = 0.10$$

since "10% of the ticks that carried Lyme or HGE carried both".

### Part (a): The probability $P(L \cap H)$

Let $x = P(L \cap H)$.

By the definition of conditional probability:

$$P(L \cap H \mid L \cup H) = \frac{P(L \cap H)}{P(L \cup H)}$$

So:

$$0.10 = \frac{x}{P(L \cup H)}$$

But, by the formula for the union of two events:

$$P(L \cup H) = P(L) + P(H) - P(L \cap H) = 0.16 + 0.10 - x = 0.26 - x$$

Substituting:

$$0.10 = \frac{x}{0.26 - x}$$

Solving algebraically:

$$x = 0.10\,(0.26 - x)$$

$$x = 0.026 - 0.10x$$

$$x + 0.10x = 0.026$$

$$1.10x = 0.026$$

$$x = \frac{0.026}{1.10} = 0.02\overline{36}$$

> ##### So $P(L \cap H) \approx 0.02364$, that is, about **2.36%**.

### Part (b): The conditional probability $P(H \mid L)$

By definition:

$$P(H \mid L) = \frac{P(H \cap L)}{P(L)} = \frac{P(L \cap H)}{P(L)}$$

Substituting the values:

$$P(H \mid L) = \frac{0.02364}{0.16} = 0.14772\ldots$$

> ##### So $P(H \mid L) \approx 0.1477$, that is, about **14.77%**.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>function solve_tick_problem()
    # Problem data
    Pr_Lyme = 0.16  # Pr[Lyme]
    Pr_HGE = 0.10   # Pr[HGE]
    share_both = 0.10
    
    # Iterative computation
    Pr_both = 0.0
    tolerance = 1e-6
    
    for _ in 1:1000
        # Pr[Lyme ∪ HGE] using the current intersection
        Pr_union = Pr_Lyme + Pr_HGE - Pr_both
        
        # New Pr[Lyme ∩ HGE]
        Pr_both_new = share_both * Pr_union
        
        # Check for convergence
        if abs(Pr_both_new - Pr_both) < tolerance
            break
        end
        
        Pr_both = Pr_both_new
    end
    
    # Conditional probability
    Pr_HGE_given_Lyme = Pr_both / Pr_Lyme
    
    println("Epidemiological Analysis - Ticks")
    println("--------------------------------")
    println("Pr[Lyme ∩ HGE] = ", round(Pr_both, digits=4))
    println("Pr[HGE|Lyme] = ", round(Pr_HGE_given_Lyme, digits=4))
end

solve_tick_problem()</code></pre>
  </div>
</div>

### 6.2 Solved Exercise: An HIV Test

> **Problem**: Suppose that in the general population **1** in every **5000** people carries HIV, and that there is a test for HIV whose possible results are `positive (+)` and `negative (−)`. **Suppose the test gets the answer right 99% of the time**, that is, whether or not a person has HIV, the test gives the correct result 99% of the time.

**Questions**:
- a) What is the probability $\Pr[-\mid\text{HIV}]$ that the test comes back negative given that the person has HIV?
- b) What is the probability $\Pr[\text{HIV}\mid +]$ that a randomly chosen person has HIV given that the test came back positive?

### Problem data:
- HIV prevalence: $\Pr[\text{HIV}] = \frac{1}{5000} = 0.0002$ (0.02% of the population has HIV)
- Probability of testing positive if the person has HIV (true positive): $\Pr[+\mid\text{HIV}] = 0.99$
- Probability of testing negative if the person doesn't have HIV (true negative): $\Pr[-\mid\neg\text{HIV}] = 0.99$

### Part (a): Probability of testing negative given that the person has HIV

The probability that the test comes back negative given that the person has HIV is the complement of the probability that it comes back positive for someone with HIV:

$$
\Pr[-\mid\text{HIV}] = 1 - \Pr[+\mid\text{HIV}] = 1 - 0.99 = 0.01
$$

> ##### So the probability that the test comes back negative given that the person has HIV is $\Pr[-\mid\text{HIV}] = 0.01$, or 1%.

### Part (b): Probability of having HIV given a positive test

To compute this probability, we use Bayes' Theorem:

$$
\Pr[\text{HIV}\mid +] = \frac{\Pr[+\mid\text{HIV}] \cdot \Pr[\text{HIV}]}{\Pr[+]}
$$

Where $\Pr[+]$ (the total probability of testing positive) comes from two cases:
1. The person has HIV and the test is right (positive)
2. The person doesn't have HIV and the test is wrong (false positive)

**Computing $\Pr[+]$:**

$$
\Pr[+] = \Pr[+\mid\text{HIV}] \cdot \Pr[\text{HIV}] + \Pr[+\mid\neg\text{HIV}] \cdot \Pr[\neg\text{HIV}]
$$

We know that:
- $\Pr[\neg\text{HIV}] = 1 - \Pr[\text{HIV}] = 1 - 0.0002 = 0.9998$
- The probability of testing positive for someone without HIV (false positive) is

$$\Pr[+\mid\neg\text{HIV}] = 1 - \Pr[-\mid\neg\text{HIV}] = 1 - 0.99 = 0.01$$

Substituting the values:

$$
\Pr[+] = (0.99 \cdot 0.0002) + (0.01 \cdot 0.9998) = 0.000198 + 0.009998 = 0.010196
$$

Now we can apply Bayes' Theorem:

$$
\Pr[\text{HIV}\mid +] = \frac{\Pr[+\mid\text{HIV}] \cdot \Pr[\text{HIV}]}{\Pr[+]} = \frac{0.99 \cdot 0.0002}{0.010196} \approx 0.0194
$$

> ##### So the probability that a randomly chosen person has HIV given a positive test is about $\Pr[\text{HIV}\mid +] \approx 0.0194$, or 1.94%.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>function solve_hiv_problem()
    # Problem data
    Pr_HIV = 1/5000  # HIV prevalence
    Pr_pos_given_HIV = 0.99  # Sensitivity
    Pr_neg_given_noHIV = 0.99  # Specificity
    
    # Part (a)
    Pr_neg_given_HIV = 1 - Pr_pos_given_HIV
    
    # Part (b)
    Pr_noHIV = 1 - Pr_HIV
    Pr_pos_given_noHIV = 1 - Pr_neg_given_noHIV
    
    # Total probability of a positive test
    Pr_pos = (Pr_pos_given_HIV * Pr_HIV) + (Pr_pos_given_noHIV * Pr_noHIV)
    
    # Bayes' Theorem
    Pr_HIV_given_pos = (Pr_pos_given_HIV * Pr_HIV) / Pr_pos
    
    println("HIV Test Analysis")
    println("-----------------")
    println("Pr[-|HIV] = ", round(Pr_neg_given_HIV, digits=4))
    println("Pr[HIV|+] = ", round(Pr_HIV_given_pos, digits=4))
end

solve_hiv_problem()</code></pre>
  </div>
</div>

### Part (c): The Reverse Scenario - Probability of not having HIV given a negative test

This complementary scenario matters for understanding how reliable the test is when the result is negative. Again we use Bayes' Theorem:

$$
\Pr[\neg\text{HIV}\mid -] = \frac{\Pr[-\mid\neg\text{HIV}] \cdot \Pr[\neg\text{HIV}]}{\Pr[-]}
$$

Where $\Pr[-]$ (the total probability of testing negative) comes from two cases:
1. The person doesn't have HIV and the test is right (true negative)
2. The person has HIV and the test is wrong (false negative)

**Computing $\Pr[-]$:**

$$
\Pr[-] = \Pr[-\mid\neg\text{HIV}] \cdot \Pr[\neg\text{HIV}] + \Pr[-\mid\text{HIV}] \cdot \Pr[\text{HIV}]
$$

Substituting the values:
- $\Pr[-\mid\neg\text{HIV}] = 0.99$ (true negative)
- $\Pr[\neg\text{HIV}] = 0.9998$
- $\Pr[-\mid\text{HIV}] = 0.01$ (false negative)
- $\Pr[\text{HIV}] = 0.0002$

$$
\Pr[-] = (0.99 \cdot 0.9998) + (0.01 \cdot 0.0002) = 0.989802 + 0.000002 = 0.989804
$$

Now we can apply Bayes' Theorem:

$$
\Pr[\neg\text{HIV}\mid -] = \frac{0.99 \cdot 0.9998}{0.989804} \approx 0.99999798
$$

> ##### So the probability that a person does not have HIV given a negative test is about $\Pr[\neg\text{HIV}\mid -] \approx 0.99999798$, or 99.999798%.

This shows the test is extremely reliable when it comes back negative: the probability that the person really doesn't have HIV is very close to 100%.

### Summary of the Results:
1. Probability of a false negative: 

$$\Pr[-\mid\text{HIV}] = 0.01$$

2. Probability of having HIV given a positive test: 

$$\Pr[\text{HIV}\mid +] \approx 0.0194$$

3. Probability of not having HIV given a negative test: 

$$\Pr[\neg\text{HIV}\mid -] \approx 0.99999798$$

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>function full_hiv_analysis()
    # Problem data
    Pr_HIV = 1/5000  # HIV prevalence
    Pr_pos_given_HIV = 0.99  # Sensitivity
    Pr_neg_given_noHIV = 0.99  # Specificity
    
    # Helper computations
    Pr_noHIV = 1 - Pr_HIV
    Pr_neg_given_HIV = 1 - Pr_pos_given_HIV
    Pr_pos_given_noHIV = 1 - Pr_neg_given_noHIV
    
    # Total probability of a positive test
    Pr_pos = (Pr_pos_given_HIV * Pr_HIV) + (Pr_pos_given_noHIV * Pr_noHIV)
    
    # Total probability of a negative test
    Pr_neg = (Pr_neg_given_noHIV * Pr_noHIV) + (Pr_neg_given_HIV * Pr_HIV)
    
    # Bayes' Theorem - scenarios
    Pr_HIV_given_pos = (Pr_pos_given_HIV * Pr_HIV) / Pr_pos
    Pr_noHIV_given_neg = (Pr_neg_given_noHIV * Pr_noHIV) / Pr_neg
    
    println("Full HIV Test Analysis")
    println("----------------------")
    println("False negative Pr[-|HIV] = ", round(Pr_neg_given_HIV, digits=4))
    println("HIV given positive Pr[HIV|+] = ", round(Pr_HIV_given_pos, digits=8))
    println("No HIV given negative Pr[¬HIV|-] = ", round(Pr_noHIV_given_neg, digits=8))
end

full_hiv_analysis()</code></pre>
  </div>
</div>

### 6.3 Solved Exercise: Quality Control

![Illustration of quality control]({{ site.baseurl }}/assets/images/qualidade.avif){:style="max-width: 400px; display: block; margin: 0 auto;"}
<div class="image-caption" style="text-align: center;">Figure: Quality control on a production line</div>

> **Problem**: Suppose that at a factory **2** in every **1000** products `are defective`. The factory runs a quality test whose result is either `defective (D)` or `in perfect condition (G)`. Suppose the test gets the answer right in **95% of cases**, that is, whether or not a product is defective, the test gives the correct result 95% of the time.

**Questions**:
- a) What is the probability $\Pr[T_d\mid G]$ that the test says `defective` given that the product is `in perfect condition`?
- b) What is the probability $\Pr[D\mid T_d]$ that a randomly chosen product is `defective` given that the test said `defective`?

### Problem data:
- Probability that a product is defective: 

$$\Pr[D] = \frac{2}{1000} = 0.002$$ (0.2%)

- Probability that a product is in perfect condition:

$$\Pr[G] = 1 - \Pr[D] = 0.998$$ (99.8%)

- Test accuracy: 95%
  - If the product is defective, the probability the test says defective: $\Pr[T_d\mid D] = 0.95$
  - If the product is good, the probability the test says good: $\Pr[T_g\mid G] = 0.95$

Therefore:
- Probability of a false positive (the test says defective for a good product): $\Pr[T_d\mid G] = 1 - \Pr[T_g\mid G] = 0.05$
- Probability of a false negative (the test says good for a defective product): $\Pr[T_g\mid D] = 1 - \Pr[T_d\mid D] = 0.05$

### Part (a): Probability of a false positive

The probability that the test says defective given that the product is in perfect condition is exactly the false positive rate:

$$
\Pr[T_d\mid G] = 1 - \Pr[T_g\mid G] = 1 - 0.95 = 0.05
$$

> ##### So the probability that the test flags a product in perfect condition as defective is $\Pr[T_d\mid G] = 0.05$, or 5%.

### Part (b): Probability of a defect given a positive test

To compute the probability that a product really is defective given that the test flagged it, we use Bayes' Theorem:

$$
\Pr[D\mid T_d] = \frac{\Pr[T_d\mid D] \cdot \Pr[D]}{\Pr[T_d]}
$$

Where $\Pr[T_d]$ (the total probability that the test flags a defect) comes from two cases:
1. The product is defective and the test is right (true positive)
2. The product is good and the test is wrong (false positive)

**Computing $\Pr[T_d]$:**

$$
\Pr[T_d] = \Pr[T_d\mid D] \cdot \Pr[D] + \Pr[T_d\mid G] \cdot \Pr[G]
$$

Substituting the values:

$$
\Pr[T_d] = (0.95 \cdot 0.002) + (0.05 \cdot 0.998) = 0.0019 + 0.0499 = 0.0518
$$

Now we can apply Bayes' Theorem:

$$
\Pr[D\mid T_d] = \frac{0.95 \cdot 0.002}{0.0518}
$$

$$
\Pr[D\mid T_d] = \frac{0.0019}{0.0518} \approx 0.0367
$$

> ##### So the probability that a product really is defective given that the test flagged it is about $\Pr[D\mid T_d] \approx 0.0367$, or 3.67%.

### Interpreting the Results

1. The false positive probability (5%) is relatively high, meaning the test often flags good products as defective.
2. When the test flags a defect, there is only a 3.67% chance that the product really is defective.
3. This low positive predictive value happens because:
   - Defects are very rare (0.2%)
   - The false positive rate (5%) is high compared with how rare defects are

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>function quality_control_analysis()
    # Problem data
    Pr_D = 2/1000  # Probability of a defect
    Pr_G = 1 - Pr_D  # Probability of a good product
    
    # Test characteristics
    Pr_Td_D = 0.95  # Sensitivity
    Pr_Tg_G = 0.95  # Specificity
    
    # Complementary probabilities
    Pr_Td_G = 1 - Pr_Tg_G  # False positive
    
    # Total probability that the test flags a defect
    Pr_Td = (Pr_Td_D * Pr_D) + (Pr_Td_G * Pr_G)
    
    # Bayes' Theorem
    Pr_D_Td = (Pr_Td_D * Pr_D) / Pr_Td
    
    println("Quality Control Analysis")
    println("------------------------")
    println("False positive Pr[Td|G] = ", round(Pr_Td_G, digits=4))
    println("Defect given positive test Pr[D|Td] = ", round(Pr_D_Td, digits=4))
end

quality_control_analysis()</code></pre>
  </div>
</div>

### 6.4 Solved Exercise: Weather Forecasting

![Illustration of a weather forecast]({{ site.baseurl }}/assets/images/chuva.avif){:style="max-width: 400px; display: block; margin: 0 auto;"}
<div class="image-caption" style="text-align: center;">Figure: Weather forecasting and the chance of rain</div>

> **Problem**: Suppose that, in a certain city, 1 in every 10 summer days is rainy. A meteorologist uses a forecasting model that, on average, gets rain forecasts right 80% of the time. That means that if it is going to rain, the model has an 80% chance of forecasting "rain", and if it is not going to rain, it has an 80% chance of forecasting "no rain".

**Questions**:
- a) What is the probability $P(N\mid R)$ that the model forecasts "no rain" given that it really is going to rain?
- b) What is the probability $P(R\mid N)$ that it really is going to rain given that the model forecast "no rain"?

### Problem data:
- The probability of rain on a summer day is: 

$$P(R) = \frac{1}{10} = 0.1$$

- The probability of no rain on a summer day is: 

$$P(NR) = 1 - P(R) = 0.9$$

- The forecasting model is right 80% of the time:
  - If it is going to rain, the probability that the model forecasts "rain" is: 
  
  $$P(F_R \mid R) = 0.8$$

  - If it is not going to rain, the probability that the model forecasts "no rain" is: 
  
  $$P(F_{NR} \mid NR) = 0.8$$

Therefore:
- The probability that the model forecasts "no rain" when it really is going to rain is: $P(F_{NR} \mid R) = 1 - P(F_R \mid R) = 0.2$
- The probability that the model forecasts "rain" when it really is not going to rain is: $P(F_R \mid NR) = 1 - P(F_{NR} \mid NR) = 0.2$

### Part (a): Probability of a "no rain" forecast given that it will rain

We already know this probability:
$$
P(N \mid R) = P(F_{NR} \mid R) = 0.2
$$

> ##### So the probability that the model forecasts "no rain" given that it really is going to rain is $P(N \mid R) = 0.2$, or 20%.

### Part (b): Probability of rain given a "no rain" forecast

To compute the probability that it really is going to rain given that the model forecast "no rain", we use Bayes' Theorem:

$$
P(R \mid N) = \frac{P(N \mid R) \cdot P(R)}{P(N)}
$$

Where $P(N)$ (the total probability of a "no rain" forecast) comes from two cases:
1. It is going to rain and the model gets it wrong (false negative)
2. It is not going to rain and the model gets it right (true negative)

**Computing $P(N)$:**

$$
P(N) = P(N \mid R) \cdot P(R) + P(N \mid NR) \cdot P(NR)
$$

Substituting the values:

$$
P(N) = (0.2 \cdot 0.1) + (0.8 \cdot 0.9) = 0.02 + 0.72 = 0.74
$$

Now we can apply Bayes' Theorem:

$$
P(R \mid N) = \frac{0.2 \cdot 0.1}{0.74} = \frac{0.02}{0.74} \approx 0.027
$$

> ##### So the probability that it really is going to rain given that the model forecast "no rain" is about $P(R \mid N) \approx 0.027$, or 2.7%.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>function weather_forecast_analysis()
    # Problem data
    P_R = 1/10  # Probability of rain
    P_NR = 1 - P_R  # Probability of no rain
    
    # Model characteristics
    P_FR_R = 0.8  # Sensitivity (right when it rains)
    P_FNR_NR = 0.8  # Specificity (right when it doesn't rain)
    
    # Complementary probabilities
    P_FNR_R = 1 - P_FR_R  # False negative
    
    # Total probability of a "no rain" forecast
    P_N = (P_FNR_R * P_R) + (P_FNR_NR * P_NR)
    
    # Bayes' Theorem
    P_R_N = (P_FNR_R * P_R) / P_N
    
    println("Weather Forecast Analysis")
    println("-------------------------")
    println("P(N|R) = ", round(P_FNR_R, digits=4))
    println("P(R|N) = ", round(P_R_N, digits=4))
end

weather_forecast_analysis()</code></pre>
  </div>
</div>

### 6.5 Diagnostic Tests

1. **Compute the probability that a patient has a disease given a positive test**
   - Try different values of sensitivity and specificity
   - See how the prevalence changes the result

2. **Compute the probability of drawing an ace given that the card is red**
   - Compare it with the probability of drawing a red card given that it is an ace
   - Check whether suit and rank are independent

3. **Check independence between different events**
   - Compute conditional probabilities for sums and products
   - Analyze sequences of rolls

## 7. Practical Considerations

### 7.1 Limitations and Caveats
- Enough data is needed
- Independence of the observations
- Selection bias
- Causation vs. correlation

### 7.2 Good Practices
- Check the assumptions
- Sensitivity analysis
- Clear documentation
- Careful interpretation

## References

1. Ross, S. M. **A First Course in Probability**. 9th ed. Pearson, 2012.
2. Feller, W. **An Introduction to Probability Theory and Its Applications**. Vol. 1, 3rd ed. Wiley, 1968.
3. DeGroot, M. H.; Schervish, M. J. **Probability and Statistics**. 4th ed. Pearson, 2011.
4. Morettin, P. A.; Bussab, W. O. **Estatística Básica**. 9th ed. Saraiva, 2017. (in Portuguese)
5. Magalhães, M. N. **Probabilidade e Variáveis Aleatórias**. 3rd ed. EDUSP, 2015. (in Portuguese)
6. James, B. R. **Probabilidade: Um Curso em Nível Intermediário**. 3rd ed. IMPA, 2004. (in Portuguese)
