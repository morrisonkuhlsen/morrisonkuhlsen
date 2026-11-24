---
layout: page
title: Sample Space and Events
lang: en
ref: eventos-espaco-amostral
parent: probabilidade
permalink: /en/probability/sample-space-events
order: 4
mathjax: true
description: "Sample space, events, union, intersection, complement and cardinality, with dice and card examples, solved exercises and Julia code."
---

The concepts of **Events** and **Sample Space** are fundamental to probability theory. They provide the basic structure for understanding and computing probabilities in many settings.

<div style="border-left: 4px solid #4CAF50; padding: 0.5em; background-color: #e8f5e9;">
  <strong>🎲 Important:</strong><br>
  The <strong>sample space</strong> is the set of all possible outcomes of a random experiment.<br>
  An <strong>event</strong> is any subset of the sample space.
</div>

## 1. Sample Space

### 1.1 Formal Definition

The sample space, usually denoted by $\Omega$ (omega) or $S$, is the set that contains all the possible outcomes of a random experiment.

**Examples:**
- Tossing a coin: $\Omega = \\{H, T\\}$ (heads, tails)
- Rolling a die: $\Omega = \\{1, 2, 3, 4, 5, 6\\}$
- Drawing a card from a deck: $\Omega$ = the 52 cards

### 1.2 Types of Sample Space

1. **Discrete**
   - A finite or countably infinite number of elements (they can be listed: 1, 2, 3, …)
   - Example: the outcomes of a die

2. **Continuous**
   - An interval of real numbers, with infinitely many elements that cannot be listed
   - Example: the temperature on a given day

### 1.3 Visual Representation

The chart on the left shows the sample space of a die, with the probability of each outcome; the one on the right shows a continuous sample space (an interval of temperatures), with a density curve that is only illustrative.

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
using Measures

# Discrete sample space: Ω = {1, 2, 3, 4, 5, 6}, each face with probability 1/6
faces = 1:6
p1 = bar(faces, fill(1 / 6, 6);
    title = "Discrete sample space\nΩ = {1, 2, 3, 4, 5, 6}",
    xlabel = "Die outcome", ylabel = "Probability",
    xticks = faces, ylims = (0, 0.25), label = "",
    yformatter = y -&gt; string(round(y, digits = 2)),
    color = :royalblue, alpha = 0.7, lw = 0)

# Continuous sample space: an interval of temperatures.
# The curve (normal with mean 25 °C and standard deviation 5 °C) is only illustrative.
temperature = Normal(25, 5)
x = 5:0.1:45
p2 = plot(x, pdf.(temperature, x);
    title = "Continuous sample space\n(day's temperature, illustrative)",
    xlabel = "Temperature (°C)", ylabel = "Density", label = "",
    yformatter = y -&gt; string(round(y, digits = 3)),
    color = :darkorange, lw = 2, fillrange = 0, fillalpha = 0.3)

plot(p1, p2; layout = (1, 2), size = (1000, 400), margin = 8mm)
savefig("sample_space_en.png")</code></pre>
  </div>
</div>

![On the left, six equal bars of height 1/6 for the faces 1 to 6 of a die; on the right, a bell-shaped density curve over temperatures from 5 to 45 °C]({{ site.baseurl }}/assets/images/sample_space_en.png)
<div class="image-caption">Figure 1: A discrete sample space (the six faces of a die, each with probability 1/6) and a continuous one (an interval of temperatures, with an illustrative density).</div>

## 2. Events

### 2.1 Formal Definition

An event $A$ is any subset of the sample space $\Omega$. In mathematical terms:

$$A \subseteq \Omega$$

We say the event $A$ **occurred** when the outcome of the experiment is an element of $A$.

### 2.2 Types of Events

1. **Simple Event**
   - Contains only one element of the sample space
   - Example: $\\{6\\}$ when rolling a die

2. **Compound Event**
   - Contains more than one element of the sample space
   - Example: $\\{2, 4, 6\\}$ (even numbers on a die)

3. **Impossible Event ($\emptyset$)**
   - Contains no elements
   - Probability = 0

4. **Certain Event ($\Omega$)**
   - Contains every element of the sample space
   - Probability = 1

### 2.3 Operations on Events

Let $A$ and $B$ be events of the same sample space:

1. **Union ($A \cup B$)**
   - Occurs when $A$ **or** $B$ occurs (or both)
   - Example: on a die, "even or greater than 4" $= \\{2, 4, 6\\} \cup \\{5, 6\\} = \\{2, 4, 5, 6\\}$

2. **Intersection ($A \cap B$)**
   - Occurs when $A$ **and** $B$ occur at the same time
   - Example: on a die, "even and greater than 4" $= \\{2, 4, 6\\} \cap \\{5, 6\\} = \\{6\\}$

3. **Complement ($A^c$)**
   - Occurs when $A$ does **not** occur
   - $A^c = \Omega \setminus A$ (the elements of $\Omega$ that are not in $A$)
   - Example: on a die, the complement of "even" is $\\{1, 3, 5\\}$

Two events are **mutually exclusive** when they cannot occur together, that is, when $A \cap B = \emptyset$.

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
    θ = range(0, 2π, length = 100)
    Shape(h .+ r .* cos.(θ), k .+ r .* sin.(θ))
end

# A ∩ B: the arc of A that lies inside B, followed by the arc of B inside A
θa = range(-π/3, π/3, length = 50)
θb = range(2π/3, 4π/3, length = 50)
lens = Shape(vcat(cos.(θa), 1 .+ cos.(θb)), vcat(sin.(θa), sin.(θb)))

omega = Shape([-1.5, 2.5, 2.5, -1.5], [-1.5, -1.5, 1.5, 1.5])
axes_style = (xlims = (-1.5, 2.5), ylims = (-1.5, 1.5), aspect_ratio = :equal,
              framestyle = :box, ticks = false, grid = false, legend = false)

# Union: everything in A or in B
p1 = plot(omega; color = :white, linecolor = :gray, title = "Union (A ∪ B)", axes_style...)
plot!(p1, circle(0, 0, 1); color = :royalblue, alpha = 0.5, linecolor = :black)
plot!(p1, circle(1, 0, 1); color = :royalblue, alpha = 0.5, linecolor = :black)

# Intersection: only the common part
p2 = plot(omega; color = :white, linecolor = :gray, title = "Intersection (A ∩ B)", axes_style...)
plot!(p2, lens; color = :royalblue, alpha = 0.7, linewidth = 0)
plot!(p2, circle(0, 0, 1); fillalpha = 0, linecolor = :black)
plot!(p2, circle(1, 0, 1); fillalpha = 0, linecolor = :black)

# Complement: everything in Ω that is not in A
p3 = plot(omega; color = :royalblue, alpha = 0.5, linecolor = :gray, title = "Complement (Aᶜ)", axes_style...)
plot!(p3, circle(0, 0, 1); color = :white, linecolor = :black)

# Set labels (the complement panel only shows A)
for p in (p1, p2)
    annotate!(p, [(-0.4, 0.0, text("A", 12)), (1.4, 0.0, text("B", 12)), (-1.25, 1.25, text("Ω", 12))])
end
annotate!(p3, [(-0.4, 0.0, text("A", 12)), (-1.25, 1.25, text("Ω", 12))])

plot(p1, p2, p3; layout = (1, 3), size = (900, 320))
savefig("event_operations_en.png")</code></pre>
  </div>
</div>

![Three Venn diagrams: the union of A and B with both circles shaded, the intersection with only the common part shaded, and the complement of A with everything shaded except circle A]({{ site.baseurl }}/assets/images/event_operations_en.png)
<div class="image-caption">Figure 2: Venn diagrams of the operations on events. The shaded area is the resulting event: A ∪ B, A ∩ B and Aᶜ.</div>

## 3. Cardinality

The cardinality of a finite set, written $\text{card}(A)$ or $n(A)$, is the number of elements in that set. This concept is fundamental for computing probabilities in finite sample spaces.

### 3.1 Definition and Notation

Let $A$ be a finite set:
- Cardinality of $A$: $\text{card}(A)$ or $n(A)$
- Cardinality of the sample space: $\text{card}(\Omega)$
- Cardinality of the empty set: $\text{card}(\emptyset) = 0$

For finite sets, the cardinality is a natural number:

$$\text{card}(A) \in \{0, 1, 2, \ldots\}$$

### 3.2 Properties

In the properties below, $A$, $B$ and $C$ are finite events.

1. **Cardinality of a Union**

   For two events:

   $$\text{card}(A \cup B) = \text{card}(A) + \text{card}(B) - \text{card}(A \cap B)$$

   We subtract $\text{card}(A \cap B)$ because the elements that are in both events were counted twice.

   For three events:

   $$\begin{align*}
   \text{card}(A \cup B \cup C) &= \text{card}(A) + \text{card}(B) + \text{card}(C) \\
   &- \text{card}(A \cap B) - \text{card}(B \cap C) - \text{card}(A \cap C) \\
   &+ \text{card}(A \cap B \cap C)
   \end{align*}$$

2. **Cardinality of the Complement**

   For an event $A \subseteq \Omega$, with $\Omega$ finite:

   $$\text{card}(A^c) = \text{card}(\Omega) - \text{card}(A)$$

3. **Basic Properties**
   - If $A \subseteq B$, then $\text{card}(A) \leq \text{card}(B)$
   - $\text{card}(A \cap B) \leq \min(\text{card}(A), \text{card}(B))$
   - $\text{card}(A \cup B) \leq \text{card}(A) + \text{card}(B)$

### 3.3 Practical Examples

1. **Rolling a Die**
   - $\text{card}(\Omega) = 6$ (faces of the die)
   - Let $E = \\{x \in \Omega : x \text{ is even}\\}$; then $\text{card}(E) = 3$ (faces 2, 4, 6)
   - Let $M = \\{x \in \Omega : x > 4\\}$; then $\text{card}(M) = 2$ (faces 5, 6)
   - $\text{card}(E \cap M) = 1$ (face 6)
   - $\text{card}(E \cup M) = \text{card}(E) + \text{card}(M) - \text{card}(E \cap M) = 3 + 2 - 1 = 4$ (faces 2, 4, 5, 6)

2. **A 52-Card Deck**
   - $\text{card}(\Omega) = 52$ (total cards)
   - Let $C$ = hearts; then $\text{card}(C) = 13$
   - Let $R$ = red cards (hearts and diamonds); then $\text{card}(R) = 26$
   - Let $F$ = face cards (jack, queen and king of each suit); then $\text{card}(F) = 12$
   - $\text{card}(C \cap F) = 3$ (jack, queen and king of hearts)

### 3.4 Application to Probability

In a **finite, equally likely** sample space (every outcome with the same probability), the probability of an event $A$ is:

$$P(A) = \frac{\text{card}(A)}{\text{card}(\Omega)}$$

For events $A$ and $B$, using the cardinality of a union:

$$P(A \cup B) = \frac{\text{card}(A \cup B)}{\text{card}(\Omega)} = \frac{\text{card}(A) + \text{card}(B) - \text{card}(A \cap B)}{\text{card}(\Omega)}$$

**Example: two dice.** Two fair dice are rolled. Let $A$ = "the sum is 7" and $B$ = "the first die is greater than 4".

**Data:** each outcome is a pair (first die, second die), and the $6 \cdot 6 = 36$ pairs are equally likely.

**Counting**, one event at a time:
- $A = \\{(1,6), (2,5), (3,4), (4,3), (5,2), (6,1)\\}$, so $\text{card}(A) = 6$
- $B$: the first die is 5 or 6 (2 options) and the second is anything (6 options), so $\text{card}(B) = 2 \cdot 6 = 12$
- $A \cap B = \\{(5,2), (6,1)\\}$, so $\text{card}(A \cap B) = 2$

**Substitution and arithmetic:**

$$\text{card}(A \cup B) = 6 + 12 - 2 = 16$$

$$P(A \cup B) = \frac{16}{36} = \frac{4}{9} \approx 0.4444$$

**Interpretation:** in about 44% of rolls of two dice, the sum is 7 or the first die shows 5 or 6 (or both).

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code># Rolling two dice: each outcome is a pair (first die, second die)
Ω = [(i, j) for i in 1:6 for j in 1:6]

A = filter(x -&gt; sum(x) == 7, Ω)    # event A: the sum is 7
B = filter(x -&gt; x[1] &gt; 4, Ω)       # event B: the first die is greater than 4

println("card(Ω) = ", length(Ω))
println("card(A) = ", length(A), "   A = ", A)
println("card(B) = ", length(B))
println("card(A ∩ B) = ", length(intersect(A, B)), "   A ∩ B = ", intersect(A, B))
println("card(A ∪ B) = ", length(union(A, B)))

# Equally likely space: P(E) = card(E) / card(Ω), as exact fractions
P(E) = length(E) // length(Ω)
println("P(A) = ", P(A), "   P(B) = ", P(B), "   P(A ∪ B) = ", P(union(A, B)))</code></pre>
  </div>
</div>

#### Expected output:
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <div>card(Ω) = 36</div>
  <div>card(A) = 6   A = [(1, 6), (2, 5), (3, 4), (4, 3), (5, 2), (6, 1)]</div>
  <div>card(B) = 12</div>
  <div>card(A ∩ B) = 2   A ∩ B = [(5, 2), (6, 1)]</div>
  <div>card(A ∪ B) = 16</div>
  <div>P(A) = 1//6   P(B) = 1//3   P(A ∪ B) = 4//9</div>
</div>

## 4. Properties and Relations

### 4.1 Properties of Union and Intersection

For any events $A$, $B$ and $C$:

1. **Commutative**

   $$A \cup B = B \cup A \qquad A \cap B = B \cap A$$

2. **Associative**

   $$(A \cup B) \cup C = A \cup (B \cup C) \qquad (A \cap B) \cap C = A \cap (B \cap C)$$

3. **Distributive**

   $$A \cup (B \cap C) = (A \cup B) \cap (A \cup C) \qquad A \cap (B \cup C) = (A \cap B) \cup (A \cap C)$$

### 4.2 De Morgan's Laws

$$(A \cup B)^c = A^c \cap B^c \qquad (A \cap B)^c = A^c \cup B^c$$

In words: "not (A or B)" is the same as "not A and not B"; "not (A and B)" is the same as "not A or not B".

**Example on a die**, with $E = \\{2, 4, 6\\}$ and $M = \\{5, 6\\}$: $(E \cup M)^c = \\{2, 4, 5, 6\\}^c = \\{1, 3\\}$, and $E^c \cap M^c = \\{1, 3, 5\\} \cap \\{1, 2, 3, 4\\} = \\{1, 3\\}$. Both sides give the same set.

## 5. Practical Applications

### 5.1 Data Analysis

With data in a table, the probability of an event is estimated by the share of rows in which it occurs. In the example below, with illustrative numbers, 100 students answered whether they get high grades (event $A$) and whether they study a lot (event $B$): 30 said yes to both questions, 10 only to the first, 20 only to the second and 40 to neither.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>using DataFrames, Statistics

# Survey of 100 students (illustrative numbers):
# 30 get high grades and study a lot, 10 only get high grades,
# 20 only study a lot and 40 do neither.
high_grade  = vcat(fill(true, 30), fill(true, 10), fill(false, 20), fill(false, 40))
studies_lot = vcat(fill(true, 30), fill(false, 10), fill(true, 20), fill(false, 40))
df = DataFrame(high_grade = high_grade, studies_lot = studies_lot)

# Share of rows in which the event happens
p_A  = mean(df.high_grade)
p_B  = mean(df.studies_lot)
p_AB = mean(df.high_grade .&amp; df.studies_lot)      # intersection: both
p_AuB = mean(df.high_grade .| df.studies_lot)     # union: at least one
p_neither = mean(.!df.high_grade .&amp; .!df.studies_lot)

rnd(x) = round(x, digits = 2)   # avoids floating-point leftovers in the output
println("P(A) = ", rnd(p_A), "   P(B) = ", rnd(p_B), "   P(A ∩ B) = ", rnd(p_AB))
println("P(A ∪ B) = ", rnd(p_AuB), "   by the formula: ", rnd(p_A + p_B - p_AB))
println("P(Aᶜ ∩ Bᶜ) = ", rnd(p_neither), "   = 1 − P(A ∪ B) = ", rnd(1 - p_AuB))</code></pre>
  </div>
</div>

#### Expected output:
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <div>P(A) = 0.4   P(B) = 0.5   P(A ∩ B) = 0.3</div>
  <div>P(A ∪ B) = 0.6   by the formula: 0.6</div>
  <div>P(Aᶜ ∩ Bᶜ) = 0.4   = 1 − P(A ∪ B) = 0.4</div>
</div>

**Interpretation:** 60% of the students get high grades or study a lot, and the other 40% do neither, as De Morgan's law predicts ($A^c \cap B^c = (A \cup B)^c$). These numbers describe the group surveyed; they do not say that studying **causes** high grades.

### 5.2 Real-World Examples

1. **Quality Control**
   - $\Omega$ = products made in a day
   - $A$ = defective products; $A^c$ = products without defects

2. **Medicine**
   - $\Omega$ = patients seen at a hospital
   - $A$ = patients with a symptom; $B$ = patients with a condition
   - $A \cap B$ = patients with the symptom and the condition

3. **Finance**
   - $\Omega$ = possible returns on an investment
   - $A$ = positive returns; $B$ = returns above a benchmark index

## 6. Practice Exercises

1. **Rolling Two Dice.** Describe the sample space, identify the event "the sum is 7" and compute its probability.

   *Answer:* $\Omega$ has the 36 pairs $(i, j)$, with $i, j \in \\{1, \ldots, 6\\}$; the event is $\\{(1,6), (2,5), (3,4), (4,3), (5,2), (6,1)\\}$, with 6 elements; the probability is $\frac{6}{36} = \frac{1}{6} \approx 0.1667$.

2. **Playing Cards.** How many cards does the event "draw a face card" have? What is the probability of drawing an ace or a heart?

   *Answer:* the face cards are the jack, queen and king of each of the 4 suits: $3 \cdot 4 = 12$ cards. Let $S$ = aces (4 cards) and $C$ = hearts (13 cards); $S \cap C$ = the ace of hearts (1 card). Then $\text{card}(S \cup C) = 4 + 13 - 1 = 16$ and

   $$P(S \cup C) = \frac{16}{52} = \frac{4}{13} \approx 0.3077$$

## References

1. Bussab, W. O.; Morettin, P. A. (2023). *Estatística Básica*. 10th ed. Saraiva Uni. (in Portuguese)
2. Ross, S. M. (2012). *A First Course in Probability*. 9th ed. Pearson.
