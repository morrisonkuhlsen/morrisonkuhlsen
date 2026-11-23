---
layout: page
title: Events and Sample Space
lang: en
ref: eventos-espaco-amostral
parent: probabilidade
permalink: /en/probability/sample-space-events
order: 4
mathjax: true
description: "The fundamental definitions of random experiments, sample space and events."
---

The concepts of **Events** and **Sample Space** are fundamental to probability theory. They provide the basic structure for understanding and computing probabilities in many contexts.

<div style="border-left: 4px solid #4CAF50; padding: 0.5em; background-color: #e8f5e9;">
  <strong>🎲 Important:</strong><br>
  The <strong>sample space</strong> is the set of all possible outcomes of a random experiment.<br>
  An <strong>event</strong> is any subset of the sample space.
</div>

## 1. Sample Space

### 1.1 Formal Definition

The sample space, usually written Ω (omega) or S, is the set that contains every possible outcome of a random experiment.

**Examples:**
- Tossing a coin: Ω = {heads, tails}
- Rolling a die: Ω = {1, 2, 3, 4, 5, 6}
- Drawing a card from a deck: Ω = {all 52 cards}

### 1.2 Types of Sample Space

1. **Discrete**
   - A finite or countable number of elements
   - Example: the outcomes of a die

2. **Continuous**
   - An uncountable number of elements
   - Example: the temperature on a given day

### 1.3 Visual Representation

Let's visualize different sample spaces using Julia:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Plots, Random
using StatsPlots

# Seed for reproducibility
Random.seed!(123)

# Simulating die rolls
rolls = rand(1:6, 1000)

# Histogram of the outcomes
p1 = histogram(rolls,
    bins=6,
    title="Discrete Sample Space\n(Die Roll)",
    xlabel="Outcome",
    ylabel="Frequency",
    label="",
    color=:royalblue,
    alpha=0.7)

# Simulating daily temperatures
temperatures = rand(Normal(25, 5), 1000)

# Histogram of the temperatures
p2 = histogram(temperatures,
    bins=30,
    title="Continuous Sample Space\n(Daily Temperature)",
    xlabel="Temperature (°C)",
    ylabel="Frequency",
    label="",
    color=:darkorange,
    alpha=0.7)

# Combining the plots
plot(p1, p2,
    layout=(1,2),
    size=(1000,400),
    margin=10mm)</code></pre>
  </div>
</div>

![Types of sample space]({{ site.baseurl }}/assets/images/espaco_amostral.png)
<div class="image-caption">Figure 1: Discrete and continuous sample spaces</div>

## 2. Events

### 2.1 Formal Definition

An event (A) is any subset of the sample space (Ω). In mathematical terms:
$$A \subseteq \Omega$$

### 2.2 Types of Events

1. **Simple Event**
   - Contains just one element of the sample space
   - Example: {6} when rolling a die

2. **Compound Event**
   - Contains more than one element of the sample space
   - Example: {2, 4, 6} (even numbers on a die)

3. **Impossible Event (∅)**
   - Contains no elements
   - Probability = 0

4. **Certain Event (Ω)**
   - Contains every element of the sample space
   - Probability = 1

### 2.3 Operations on Events

Let A and B be events in the same sample space:

1. **Union (A ∪ B)**
   - A OR B happens
   - Example: even numbers OR numbers greater than 4 on a die

2. **Intersection (A ∩ B)**
   - A AND B happen
   - Example: even numbers AND numbers greater than 4 on a die

3. **Complement (A')**
   - A does not happen
   - A' = Ω - A

### 2.4 Visualizing the Operations

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

# Circle of radius r centered at (h, k)
function circle(h, k, r)
    θ = range(0, 2π, length=100)
    Shape(h .+ r .* cos.(θ), k .+ r .* sin.(θ))
end

# A ∩ B: the arc of A inside B, followed by the arc of B inside A
θa = range(-π/3, π/3, length=50)
θb = range(2π/3, 4π/3, length=50)
lens = Shape(vcat(cos.(θa), 1 .+ cos.(θb)), vcat(sin.(θa), sin.(θb)))

omega = Shape([-1.5, 2.5, 2.5, -1.5], [-1.5, -1.5, 1.5, 1.5])
axes_opts = (xlims=(-1.5, 2.5), ylims=(-1.5, 1.5), aspect_ratio=:equal,
             framestyle=:box, ticks=false, grid=false, legend=false)

# Union: everything in A or in B
p1 = plot(omega; color=:white, linecolor=:gray, title="Union (A ∪ B)", axes_opts...)
plot!(p1, circle(0, 0, 1); color=:royalblue, alpha=0.5, linecolor=:black)
plot!(p1, circle(1, 0, 1); color=:royalblue, alpha=0.5, linecolor=:black)

# Intersection: only the shared part
p2 = plot(omega; color=:white, linecolor=:gray, title="Intersection (A ∩ B)", axes_opts...)
plot!(p2, lens; color=:royalblue, alpha=0.7, linewidth=0)
plot!(p2, circle(0, 0, 1); fillalpha=0, linecolor=:black)
plot!(p2, circle(1, 0, 1); fillalpha=0, linecolor=:black)

# Complement: everything in Ω that is not in A
p3 = plot(omega; color=:royalblue, alpha=0.5, linecolor=:gray, title="Complement (A′)", axes_opts...)
plot!(p3, circle(0, 0, 1); color=:white, linecolor=:black)

plot(p1, p2, p3, layout=(1, 3), size=(900, 320))</code></pre>
  </div>
</div>

![Operations on events]({{ site.baseurl }}/assets/images/operacoes_eventos.png)
<div class="image-caption">Figure 2: The operations on events drawn as Venn diagrams</div>

## 3. Cardinality

The cardinality of a set, written $$\text{card}(A)$$ or $$n(A)$$, is the number of elements in that set. This concept is fundamental for computing probabilities in finite sample spaces.

### 3.1 Definition and Notation

Let $$A$$ be any set:
- Cardinality of $$A$$: $$\text{card}(A)$$ or $$n(A)$$
- Cardinality of the sample space: $$\text{card}(\Omega)$$
- Cardinality of the empty set: $$\text{card}(\emptyset) = 0$$

For finite sets, the cardinality is a natural number:
$$\text{card}(A) \in \mathbb{N}_0 = \{0, 1, 2, ...\}$$

### 3.2 Properties

1. **Cardinality of a Union**
   
   For any events $$A, B \subseteq \Omega$$:
   $$\text{card}(A \cup B) = \text{card}(A) + \text{card}(B) - \text{card}(A \cap B)$$


   For three events $$A, B, C \subseteq \Omega$$:

   $$\begin{align*}
   \text{card}(A \cup B \cup C) &= \text{card}(A) + \text{card}(B) + \text{card}(C) \\
   &- \text{card}(A \cap B) - \text{card}(B \cap C) - \text{card}(A \cap C) \\
   &+ \text{card}(A \cap B \cap C)
   \end{align*}$$

2. **Cardinality of the Complement**
   
   For an event $$A \subseteq \Omega$$:
   $$\text{card}(A^c) = \text{card}(\Omega) - \text{card}(A)$$

3. **Basic Properties**
   - If $$A \subseteq B$$, then $$\text{card}(A) \leq \text{card}(B)$$
   - $$\text{card}(A \cap B) \leq \min(\text{card}(A), \text{card}(B))$$
   - $$\text{card}(A \cup B) \leq \text{card}(A) + \text{card}(B)$$

### 3.3 Worked Examples

1. **Rolling a Die**
   - $$\text{card}(\Omega) = 6$$ (the faces of the die)
   - Let $$E = \{x \in \Omega : x \text{ is even}\}$$; then $$\text{card}(E) = 3$$ (faces 2, 4, 6)
   - Let $$M = \{x \in \Omega : x > 4\}$$; then $$\text{card}(M) = 2$$ (faces 5, 6)
   - $$\text{card}(E \cap M) = 1$$ (face 6)
   - $$\text{card}(E \cup M) = \text{card}(E) + \text{card}(M) - \text{card}(E \cap M) = 3 + 2 - 1 = 4$$

2. **A 52-Card Deck**
   - $$\text{card}(\Omega) = 52$$ (total cards)
   - Let $$H = \{\text{hearts}\}$$; then $$\text{card}(H) = 13$$
   - Let $$R = \{\text{red cards}\}$$; then $$\text{card}(R) = 26$$
   - Let $$F = \{\text{face cards}\}$$; then $$\text{card}(F) = 12$$
   - $$\text{card}(H \cap F) = 3$$ (J, Q, K of hearts)

### 3.4 Application to Probability

In a finite sample space where every outcome is equally likely, the probability of an event $$A$$ is:

$$P(A) = \frac{\text{card}(A)}{\text{card}(\Omega)}$$

For events $$A$$ and $$B$$:
$$P(A \cup B) = \frac{\text{card}(A \cup B)}{\text{card}(\Omega)} = \frac{\text{card}(A) + \text{card}(B) - \text{card}(A \cap B)}{\text{card}(\Omega)}$$

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Random

# Example: rolling two dice
function two_dice_cardinality()
    # Sample space
    Ω = [(i,j) for i in 1:6 for j in 1:6]
    
    # Event A: the sum is 7
    A = filter(x -> sum(x) == 7, Ω)
    
    # Event B: the first die is greater than 4
    B = filter(x -> x[1] > 4, Ω)
    
    # Cardinalities
    println("Cardinality of the sample space: ", length(Ω))
    println("Cardinality of event A (sum = 7): ", length(A))
    println("Cardinality of event B (first > 4): ", length(B))
    println("Cardinality of the intersection A ∩ B: ", length(intersect(A, B)))
    println("Cardinality of the union A ∪ B: ", length(union(A, B)))
end

two_dice_cardinality()</code></pre>
  </div>
</div>

## 4. Properties and Relationships

### 4.1 Properties of Union and Intersection

1. **Commutative**
   $$A \cup B = B \cup A$$
   $$A \cap B = B \cap A$$

2. **Associative**
   $$(A \cup B) \cup C = A \cup (B \cup C)$$
   $$(A \cap B) \cap C = A \cap (B \cap C)$$

3. **Distributive**
   $$A \cup (B \cap C) = (A \cup B) \cap (A \cup C)$$
   $$A \cap (B \cup C) = (A \cap B) \cup (A \cap C)$$

### 4.2 De Morgan's Laws

$$(A \cup B)' = A' \cap B'$$
$$(A \cap B)' = A' \cup B'$$

## 5. Practical Applications

### 5.1 Data Analysis

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>using DataFrames, Random, Statistics

# Simulating student data
Random.seed!(123)
n = 100

# Creating the events
high_grade = rand(Bool, n)   # Event A: got a high grade
studies_hard = rand(Bool, n) # Event B: studies hard

# Creating the DataFrame
df = DataFrame(
    high_grade = high_grade,
    studies_hard = studies_hard
)

# Computing probabilities
p_high = mean(high_grade)
p_studies = mean(studies_hard)
p_both = mean(high_grade .& studies_hard)

println("P(High Grade) = ", round(p_high, digits=3))
println("P(Studies Hard) = ", round(p_studies, digits=3))
println("P(High Grade ∩ Studies Hard) = ", round(p_both, digits=3))</code></pre>
  </div>
</div>

### 5.2 Real-World Examples

1. **Quality Control**
   - Ω = {products manufactured}
   - A = {defective products}
   - B = {products within specification}

2. **Medicine**
   - Ω = {patient population}
   - A = {patients with symptom X}
   - B = {patients with condition Y}

3. **Finance**
   - Ω = {possible investment returns}
   - A = {positive returns}
   - B = {returns above the benchmark}

## 6. Practice Exercises

1. **Rolling Two Dice**
   - Describe the sample space
   - Identify the event "the sum is 7"
   - Compute the probability of the event

2. **Playing Cards**
   - List the elements of the event "draw a face card"
   - Find the probability of drawing an ace or a heart

3. **Daily Temperature**
   - Define the sample space
   - Identify the event "temperature above 25°C"
   - Compute probabilities using historical data

## References

1. Ross, S. M. **A First Course in Probability**. 9th ed. Pearson, 2012.
2. Feller, W. **An Introduction to Probability Theory and Its Applications**. Vol. 1, 3rd ed. Wiley, 1968.
3. DeGroot, M. H.; Schervish, M. J. **Probability and Statistics**. 4th ed. Pearson, 2011.
4. Morettin, P. A.; Bussab, W. O. **Estatística Básica**. 9th ed. Saraiva, 2017. (in Portuguese)
5. Magalhães, M. N. **Probabilidade e Variáveis Aleatórias**. 3rd ed. EDUSP, 2015. (in Portuguese)
6. James, B. R. **Probabilidade: Um Curso em Nível Intermediário**. 3rd ed. IMPA, 2004. (in Portuguese)
