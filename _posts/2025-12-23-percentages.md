---
layout: post
image: /assets/images/percentage.avif
title: "Percentages — formulas and worked examples."
categories: [MATHEMATICS, GUIDE]
tags: [Mathematics]
lang: en
ref: porcentagens
author: dante-bertuzzi
description: "A practical guide to percentages: the formulas, worked examples, successive percentages, percentage points and a real application in Brazil's real estate transactions declaration (DOI)."
mathjax: true
---

<img src="/assets/images/percentage.avif" alt="Illustration with a board of percentage formulas in Portuguese, a pie chart with slices of 60%, 25% and 15%, a notebook with the examples 20% of 150 and 15% of 80, and a calculator." style="max-width: 800px; width: 100%; height: auto; display: block; margin: 1em auto; border-radius: 8px;">

A percentage is a way of comparing quantities using the idea of "per hundred", written with the symbol %. Instead of saying 0.25, we say 25%, which makes it easier to read discounts, increases, interest, taxes, probabilities, statistics and everyday reports.

Formally, saying that a part is $$p\%$$ of a whole means that the part is $$\frac{p}{100}$$ of the whole. Every formula below follows from that definition.

## 1. Find $$p\%$$ of a value

$$R = V \cdot \frac{p}{100}$$

**Example:** find $$10\%$$ of $$500$$.

$$
\begin{aligned}
R &= 500 \cdot \frac{10}{100} = 500 \cdot 0.10 = \boxed{50}
\end{aligned}
$$

## 2. Find the whole (the base)

If $$T$$ is $$p\%$$ of an unknown value $$V$$:

$$V = \frac{T}{p/100} = \frac{T \cdot 100}{p}$$

**Example:** a fee of $$450$$ is $$5\%$$ of the total.

$$
V = \frac{450}{0.05} = \frac{450 \cdot 100}{5} = \boxed{9{,}000}
$$

## 3. Find the percentage

$$p = \frac{T}{V} \cdot 100$$

**Example:** $$200$$ is what percent of $$800$$?

$$
p = \frac{200}{800} \cdot 100 = 0.25 \cdot 100 = \boxed{25\%}
$$

## 4. Percentage increase

$$V_f = V \cdot \left(1 + \frac{p}{100}\right)$$

**Example:** increase $$1{,}000$$ by $$12\%$$.

$$
V_f = 1{,}000 \cdot (1 + 0.12) = 1{,}000 \cdot 1.12 = \boxed{1{,}120}
$$

The number $$1.12$$ is the **growth factor**: multiplying by it is the same as adding 12%.

## 5. Percentage discount

$$V_f = V \cdot \left(1 - \frac{p}{100}\right)$$

**Example:** apply a $$25\%$$ discount to $$800$$.

$$
V_f = 800 \cdot (1 - 0.25) = 800 \cdot 0.75 = \boxed{600}
$$

## 6. Original value before an increase

$$V = \frac{V_f}{1 + \frac{p}{100}}$$

**Example:** after a $$20\%$$ increase, the value became $$1{,}200$$.

$$
V = \frac{1{,}200}{1.20} = \boxed{1{,}000}
$$

Note that taking 20% off 1,200 would give 960, not 1,000: the 20% was computed on the old value, not the new one.

## 7. Original value before a discount

$$V = \frac{V_f}{1 - \frac{p}{100}}$$

**Example:** after a $$10\%$$ discount, the value was $$900$$.

$$
V = \frac{900}{0.90} = \boxed{1{,}000}
$$

## 8. Percentage change

$$\Delta\% = \frac{V_f - V_i}{V_i} \cdot 100$$

**Example:** from $$500$$ to $$650$$.

$$
\Delta\% = \frac{650 - 500}{500} \cdot 100 = \frac{150}{500} \cdot 100 = \boxed{30\%}
$$

The base is always the **initial** value. From 650 back to 500, the change is $$\frac{-150}{650} \cdot 100 \approx -23.1\%$$, not $$-30\%$$.

### The eight formulas in code

Each formula becomes a one-line function. The code below recomputes all the examples above and the exercises at the end of the post.

<div class="code-tabs">
  <div class="code-tab" data-lang="julia">
<div class="code-container">
  <div class="code-header">
    <div class="code-lang">Julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Printf

# The formulas in the post, one function each
part(V, p)                = V * p / 100            # 1. p% of V
whole(T, p)               = T * 100 / p            # 2. T is p% of what?
percentage(T, V)          = T / V * 100            # 3. T is what % of V?
increase(V, p)            = V * (1 + p / 100)      # 4. V increased by p%
discount(V, p)            = V * (1 - p / 100)      # 5. V with a p% discount
before_increase(Vf, p)    = Vf / (1 + p / 100)     # 6. value before a p% increase
before_discount(Vf, p)    = Vf / (1 - p / 100)     # 7. value before a p% discount
percent_change(Vi, Vf)    = (Vf - Vi) / Vi * 100   # 8. percentage change from Vi to Vf

examples = [("1. 10% of 500", part(500, 10)),
            ("2. 450 is 5% of", whole(450, 5)),
            ("3. 200 out of 800 (%)", percentage(200, 800)),
            ("4. 1,000 plus 12%", increase(1000, 12)),
            ("5. 800 minus 25%", discount(800, 25)),
            ("6. before +20% (1,200)", before_increase(1200, 20)),
            ("7. before -10% (900)", before_discount(900, 10)),
            ("8. from 500 to 650 (%)", percent_change(500, 650)),
            ("Exercise 1", part(450, 18)),
            ("Exercise 2", whole(36, 12)),
            ("Exercise 3", increase(discount(200, 15), 10))]
for (text, r) in examples
    @printf("%-26s %9.2f\n", text, r)
end</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">1. 10% of 500                  50.00
2. 450 is 5% of              9000.00
3. 200 out of 800 (%)          25.00
4. 1,000 plus 12%            1120.00
5. 800 minus 25%              600.00
6. before +20% (1,200)       1000.00
7. before -10% (900)         1000.00
8. from 500 to 650 (%)         30.00
Exercise 1                     81.00
Exercise 2                    300.00
Exercise 3                    187.00</pre>
</div>
  </div>
  <div class="code-tab" data-lang="python">
<div class="code-container">
  <div class="code-header">
    <div class="code-lang">Python</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code># The formulas in the post, one function each
def part(V, p):             return V * p / 100            # 1. p% of V
def whole(T, p):            return T * 100 / p            # 2. T is p% of what?
def percentage(T, V):       return T / V * 100            # 3. T is what % of V?
def increase(V, p):         return V * (1 + p / 100)      # 4. V increased by p%
def discount(V, p):         return V * (1 - p / 100)      # 5. V with a p% discount
def before_increase(Vf, p): return Vf / (1 + p / 100)     # 6. value before a p% increase
def before_discount(Vf, p): return Vf / (1 - p / 100)     # 7. value before a p% discount
def percent_change(Vi, Vf): return (Vf - Vi) / Vi * 100   # 8. percentage change from Vi to Vf

examples = [("1. 10% of 500", part(500, 10)),
            ("2. 450 is 5% of", whole(450, 5)),
            ("3. 200 out of 800 (%)", percentage(200, 800)),
            ("4. 1,000 plus 12%", increase(1000, 12)),
            ("5. 800 minus 25%", discount(800, 25)),
            ("6. before +20% (1,200)", before_increase(1200, 20)),
            ("7. before -10% (900)", before_discount(900, 10)),
            ("8. from 500 to 650 (%)", percent_change(500, 650)),
            ("Exercise 1", part(450, 18)),
            ("Exercise 2", whole(36, 12)),
            ("Exercise 3", increase(discount(200, 15), 10))]
for text, r in examples:
    print(f"{text:&lt;26s} {r:9.2f}")</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">1. 10% of 500                  50.00
2. 450 is 5% of              9000.00
3. 200 out of 800 (%)          25.00
4. 1,000 plus 12%            1120.00
5. 800 minus 25%              600.00
6. before +20% (1,200)       1000.00
7. before -10% (900)         1000.00
8. from 500 to 650 (%)         30.00
Exercise 1                     81.00
Exercise 2                    300.00
Exercise 3                    187.00</pre>
</div>
  </div>
</div>

## 9. Successive percentages

Applying two percentages in a row means multiplying the factors, not adding the rates:

$$V_f = V \cdot \left(1 + \frac{a}{100}\right)\left(1 + \frac{b}{100}\right)$$

with $$a$$ or $$b$$ negative for discounts.

**Example:** two $$10\%$$ increases: $$1.10 \cdot 1.10 = 1.21$$, a total increase of $$21\%$$, not $$20\%$$.

**Example:** a $$20\%$$ increase followed by a $$20\%$$ discount:

$$
V_f = V \cdot 1.20 \cdot 0.80 = 0.96\,V \quad\Longrightarrow\quad \boxed{\text{a loss of } 4\%}
$$

An increase and a discount of the **same rate** never cancel out: the factor is $$(1 + r)(1 - r) = 1 - r^2$$, always less than 1 (with $$r = p/100$$). That does not mean an increase and a discount can never cancel out: a 25% increase followed by a 20% discount returns to the starting value, because $$1.25 \cdot 0.80 = 1$$.

The same calculation answers a common question: **after a drop of $$q\%$$, how much must the value rise to get back to where it started?** The rise factor has to undo the drop, $$\frac{1}{1 - q/100}$$, which gives a rise of

$$\frac{q}{100 - q} \cdot 100\%.$$

A 50% drop requires a 100% rise to recover.

<div class="code-tabs">
  <div class="code-tab" data-lang="julia">
<div class="code-container">
  <div class="code-header">
    <div class="code-lang">Julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code># An increase followed by a discount of the same rate: the factor is (1 + p/100)(1 - p/100) = 1 - (p/100)²
println("Rate   Final factor   Total change")
for p in (10, 20, 50)
    f = (1 + p / 100) * (1 - p / 100)
    @printf("%3d%%   %12.4f   %+11.2f%%\n", p, f, (f - 1) * 100)
end

# After a q% drop, how much must the value rise to get back to where it started?
println("\nDrop   Rise needed")
for q in (10, 20, 25, 50, 75)
    @printf("%3d%%   %10.2f%%\n", q, q / (100 - q) * 100)
end

# In logarithms, successive changes add up
r = log(1.20) + log(0.80)
@printf("\nln(1.20) + ln(0.80) = %.4f  -&gt;  exp(%.4f) = %.4f\n", r, r, exp(r))</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">Rate   Final factor   Total change
 10%         0.9900         -1.00%
 20%         0.9600         -4.00%
 50%         0.7500        -25.00%
Drop   Rise needed
 10%        11.11%
 20%        25.00%
 25%        33.33%
 50%       100.00%
 75%       300.00%
ln(1.20) + ln(0.80) = -0.0408  -&gt;  exp(-0.0408) = 0.9600</pre>
</div>
  </div>
  <div class="code-tab" data-lang="python">
<div class="code-container">
  <div class="code-header">
    <div class="code-lang">Python</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>import math

# An increase followed by a discount of the same rate: the factor is (1 + p/100)(1 - p/100) = 1 - (p/100)²
print("Rate   Final factor   Total change")
for p in (10, 20, 50):
    f = (1 + p / 100) * (1 - p / 100)
    print(f"{p:3d}%   {f:12.4f}   {(f - 1) * 100:+11.2f}%")

# After a q% drop, how much must the value rise to get back to where it started?
print("\nDrop   Rise needed")
for q in (10, 20, 25, 50, 75):
    print(f"{q:3d}%   {q / (100 - q) * 100:10.2f}%")

# In logarithms, successive changes add up
r = math.log(1.20) + math.log(0.80)
print(f"\nln(1.20) + ln(0.80) = {r:.4f}  -&gt;  exp({r:.4f}) = {math.exp(r):.4f}")</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">Rate   Final factor   Total change
 10%         0.9900         -1.00%
 20%         0.9600         -4.00%
 50%         0.7500        -25.00%
Drop   Rise needed
 10%        11.11%
 20%        25.00%
 25%        33.33%
 50%       100.00%
 75%       300.00%
ln(1.20) + ln(0.80) = -0.0408  -&gt;  exp(-0.0408) = 0.9600</pre>
</div>
  </div>
</div>

The last line shows another way to look at successive percentages: in **logarithms**, the factors add up. $$\ln(1.20) + \ln(0.80) = -0.0408$$, and $$e^{-0.0408} = 0.96$$. This idea comes back in the application at the end of the post.

## 10. A percentage of another percentage

To find $$p\%$$ of $$q\%$$, multiply the decimal forms:

$$
p\% \text{ of } q\% = \frac{p}{100} \cdot \frac{q}{100} = \frac{p\,q}{10{,}000},
\qquad\text{or, as a percentage,}\qquad \frac{p\,q}{100}\,\%.
$$

**Example:** $$12\%$$ of $$95\%$$.

$$
\frac{12}{100}\cdot\frac{95}{100}=\frac{1{,}140}{10{,}000}=\frac{114}{1{,}000}=0.114=\boxed{11.4\%}
$$

This kind of calculation shows up when one slice is part of another: if 95% of the students took the exam and 12% of those got full marks, then 11.4% of **all** students got full marks.

## Shortcut: multiply, then divide by 100

Since $$p\%$$ of $$V$$ is $$\frac{p \cdot V}{100}$$, you can multiply $$p$$ by $$V$$ and then divide by 100: drop two zeros from the product or, if there are no zeros, move the decimal point two places to the left.

| Calculation | Product $$p \cdot V$$ | Divide by 100 | Result |
|---|---|---|---|
| 5% of 400 | $$5 \cdot 400 = 2{,}000$$ | drop two zeros | **20** |
| 30% of 80 | $$30 \cdot 80 = 2{,}400$$ | drop two zeros | **24** |
| 30% of 500 | $$30 \cdot 500 = 15{,}000$$ | drop two zeros | **150** |
| 6% of 60 | $$6 \cdot 60 = 360$$ | drop one zero, move one place | **3.6** |
| 60% of 683 | $$60 \cdot 683 = 40{,}980$$ | drop one zero, move one place | **409.8** |
| 3% of 240 | $$3 \cdot 240 = 720$$ | drop one zero, move one place | **7.2** |
| 2% of 252 | $$2 \cdot 252 = 504$$ | move two places | **5.04** |
| 5% of 0.43 | $$5 \cdot 0.43 = 2.15$$ | move two places | **0.0215** |

For mental arithmetic, three reference points also help: 10% is dividing by 10; 5% is half of 10%; 1% is dividing by 100. So 15% of 80 is $$8 + 4 = 12$$.

---

## More concepts

### Useful conversions

- Percentage to decimal: $$p\% = \frac{p}{100}$$. Example: $$15\% = 0.15$$.
- Decimal to percentage: multiply by 100. Example: $$0.23 = 23\%$$.
- Percentage to fraction: write $$\frac{p}{100}$$ and simplify. Examples: $$50\% = \frac{1}{2}$$ and $$2.5\% = \frac{25}{1{,}000} = \frac{1}{40}$$.

### How fractions are read

In English, the denominator is read as an ordinal number: $$\frac{1}{3}$$ is "one third", $$\frac{3}{5}$$ "three fifths", $$\frac{7}{12}$$ "seven twelfths". The exceptions are $$\frac{1}{2}$$, "one half", and $$\frac{1}{4}$$, which can be "one quarter" or "one fourth". Denominators 10, 100 and 1,000 give tenths, hundredths and thousandths.

A percentage is, literally, a count in **hundredths**: $$3\% = \frac{3}{100}$$, "three hundredths".

### Percentage points and percentage change

If a rate goes from $$5\%$$ to $$8\%$$:

- the increase is **3 percentage points** (the difference between the rates);
- the percentage change is $$\frac{8 - 5}{5} \cdot 100 = 60\%$$ (how much the rate grew relative to itself).

Both statements are true, but they say different things. "Inflation rose 3%" is ambiguous; "it rose 3 percentage points" is not.

### Weighted percentages

When groups of different sizes have different percentages, the percentage for the whole is the mean weighted by the sizes:

$$\bar{p} = \frac{\sum_i w_i\, p_i}{\sum_i w_i}$$

**Example:** class A, with 30 students, had an 80% pass rate, and class B, with 20 students, 70%:

$$\bar{p}=\frac{30\cdot80 + 20\cdot70}{30+20} = \frac{2{,}400+1{,}400}{50}=76\%$$

The simple mean, $$\frac{80 + 70}{2} = 75\%$$, would be wrong: it would treat both classes as if they had the same size.

### Common mistakes

- Confusing percentage points with percentage change.
- Adding successive rates instead of multiplying the factors.
- Thinking that an increase and a discount of the same rate cancel out.
- Computing a change on the wrong base (the final value instead of the initial one).
- Taking the simple mean of percentages from groups of different sizes.

### Practice exercises (with answers)

1. What is $$18\%$$ of $$450$$? Answer: $$81$$.
2. If $$x$$ is $$12\%$$ of $$V$$ and $$x=36$$, what is $$V$$? Answer: $$300$$.
3. An item costs $$200$$; a $$15\%$$ discount is applied, then a $$10\%$$ surcharge. What is the final price? Answer: $$200\cdot0.85\cdot1.10=187$$.

---

## Application: selling part of a property and Brazil's DOI

Whenever a property is bought or sold in Brazil, the notary or registry office reports the transaction to the Federal Revenue in the **DOI** (*Declaração sobre Operações Imobiliárias*, the real estate transactions declaration). Under Federal Revenue Normative Instruction 2,186/2024 (art. 4), the duty falls on the notary's office when it draws up the deed, and on the real estate registry office in some cases, such as when the title is a private instrument. For each seller and each buyer, the DOI asks for a **percentage of participation in the transaction**. When only part of the property is sold, that percentage is not the same as each person's share of the property, and this is where percentages come in.

### The problem

Five people co-own an urban property of $$2{,}000\ \text{m}^2$$, registered under a single property record. Each one holds an **undivided share** (*fração ideal*) of the property. Four of them will sell their shares; the fifth, who holds $$35\%$$, will not.

| Co-owner | Share of the property | Status |
|---|---|---|
| Marcos | 40% | sells |
| Leandro | 15% | sells |
| João | 8% | sells |
| Pedro | 2% | sells |
| Fifth person | 35% | does not sell |
| **Total** | **100%** | |

The portion sold is

$$40\% + 15\% + 8\% + 2\% = 65\%$$

of the property, or $$0.65 \cdot 2{,}000 = 1{,}300\ \text{m}^2$$. In the DOI, this is the **value of the portion transacted**, which the Federal Revenue's manual says to report "in relation to the property", as a percentage or as an area.

### What the DOI asks for

The Federal Revenue's filling manual (version 1.1, April 2025, in Portuguese) says, in our translation:

- "The percentage of ownership of the property is different from the percentage of participation in the transaction."
- "The percentage of participation must be reported according to each seller's participation in the transaction brought to the notary."
- "The sum of the participations may not be lower than 99.00% or higher than 100.00%."

In other words, the portion sold becomes the new 100% base, and the fifth person is left out, because that person is not a seller. The manual itself has an example like this: the widow, with 50% of the property, and six siblings, with 7.14% each, sell 92.84% of the property to a seventh sibling; in the DOI, the widow appears with 53.86% and each sibling with 7.69%.

### The calculation

Each seller's participation is their share divided by the total sold, formula 3 from the start of the post:

$$x_i = \frac{p_i}{65} \cdot 100$$

In vector form, this means multiplying the vector of the sellers' shares by a single number:

$$
\mathbf{x} = \lambda\,\mathbf{p}, \qquad
\mathbf{p} = \begin{pmatrix} 40 \\ 15 \\ 8 \\ 2 \end{pmatrix}, \qquad
\lambda = \frac{100}{65} = \frac{20}{13}.
$$

The value of $$\lambda$$ comes from the condition that the participations add up to 100: $$40\lambda + 15\lambda + 8\lambda + 2\lambda = 65\lambda = 100$$. Since everyone is multiplied by the same $$\lambda$$, the proportions between the sellers ($$40 : 15 : 8 : 2$$) do not change.

$$
\mathbf{x} = \frac{20}{13}\begin{pmatrix} 40 \\ 15 \\ 8 \\ 2 \end{pmatrix}
= \begin{pmatrix} 800/13 \\ 300/13 \\ 160/13 \\ 40/13 \end{pmatrix}
\approx \begin{pmatrix} 61.54 \\ 23.08 \\ 12.31 \\ 3.08 \end{pmatrix},
\qquad
\frac{800 + 300 + 160 + 40}{13} = \frac{1{,}300}{13} = 100.
$$

### Watch out for rounding

The exact fractions add up to 100%, but the values rounded to two decimals add up to $$61.54 + 23.08 + 12.31 + 3.08 = 100.01\%$$, above the manual's 100.00% limit. The code below does the calculation with exact fractions and shows two ways to land inside the accepted range: truncate all four participations (sum 99.97%) or round and take the extra hundredth off the largest share (sum 100.00%). It also redoes the manual's example.

<div class="code-tabs">
  <div class="code-tab" data-lang="julia">
<div class="code-container">
  <div class="code-header">
    <div class="code-lang">Julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code># Undivided shares of the four sellers, in % of the property
sellers  = ["Marcos", "Leandro", "João", "Pedro"]
shares = [40, 15, 8, 2]
S = sum(shares)                                   # portion transacted
@printf("Portion transacted: %d%% of the property (%d m² of 2,000 m²)\n\n", S, 2000 * S ÷ 100)

fr(x) = denominator(x) == 1 ? string(numerator(x)) : string(numerator(x), "/", denominator(x))
exact = shares .* 100 .// S                       # share of the transaction, in %, unrounded
rounded   = round.(Int, exact .* 100)             # in hundredths of a percentage point
truncated = floor.(Int, exact .* 100)

println("Seller     % of property   Exact share         Rounded   Truncated")
for i in eachindex(sellers)
    @printf("%-8s %15d   %6s = %8.4f %9.2f %11.2f\n", sellers[i], shares[i], fr(exact[i]),
            float(exact[i]), rounded[i] / 100, truncated[i] / 100)
end
@printf("%-8s %15d   %6s = %8.4f %9.2f %11.2f\n", "Sum", S, fr(sum(exact)),
        float(sum(exact)), sum(rounded) / 100, sum(truncated) / 100)

adjusted = copy(rounded)
adjusted[argmax(adjusted)] -= sum(rounded) - 10_000   # take the extra hundredth off the largest share
@printf("\nAdjusting the largest share: %s = %.2f\n",
        join([@sprintf("%.2f", a / 100) for a in adjusted], " + "), sum(adjusted) / 100)

# Example 3 in the Federal Revenue manual: the widow (50%) and six siblings (7.14% each) sell 92.84%
manual = [5000; fill(714, 6)] .// 9284 .* 100
@printf("Manual: widow %.2f%%, each sibling %.2f%%, rounded sum %.2f%%\n",
        manual[1], manual[2], sum(round.(Int, manual .* 100)) / 100)</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">Portion transacted: 65% of the property (1300 m² of 2,000 m²)
Seller     % of property   Exact share         Rounded   Truncated
Marcos                40   800/13 =  61.5385     61.54       61.53
Leandro               15   300/13 =  23.0769     23.08       23.07
João                   8   160/13 =  12.3077     12.31       12.30
Pedro                  2    40/13 =   3.0769      3.08        3.07
Sum                   65      100 = 100.0000    100.01       99.97
Adjusting the largest share: 61.53 + 23.08 + 12.31 + 3.08 = 100.00
Manual: widow 53.86%, each sibling 7.69%, rounded sum 100.00%</pre>
</div>
  </div>
  <div class="code-tab" data-lang="python">
<div class="code-container">
  <div class="code-header">
    <div class="code-lang">Python</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>from fractions import Fraction

# Undivided shares of the four sellers, in % of the property
sellers  = ["Marcos", "Leandro", "João", "Pedro"]
shares = [40, 15, 8, 2]
S = sum(shares)                                   # portion transacted
print(f"Portion transacted: {S}% of the property ({2000 * S // 100} m² of 2,000 m²)\n")

exact = [Fraction(s * 100, S) for s in shares]    # share of the transaction, in %, unrounded
rounded   = [round(x * 100) for x in exact]       # in hundredths of a percentage point
truncated = [math.floor(x * 100) for x in exact]

print("Seller     % of property   Exact share         Rounded   Truncated")
for name, s, x, r, t in zip(sellers, shares, exact, rounded, truncated):
    print(f"{name:&lt;8s} {s:15d}   {str(x):&gt;6s} = {float(x):8.4f} {r / 100:9.2f} {t / 100:11.2f}")
print(f"{'Sum':&lt;8s} {S:15d}   {str(sum(exact)):&gt;6s} = {float(sum(exact)):8.4f} "
      f"{sum(rounded) / 100:9.2f} {sum(truncated) / 100:11.2f}")

adjusted = rounded.copy()
adjusted[adjusted.index(max(adjusted))] -= sum(rounded) - 10_000   # take the extra hundredth off the largest share
print(f"\nAdjusting the largest share: {' + '.join(f'{a / 100:.2f}' for a in adjusted)} = {sum(adjusted) / 100:.2f}")

# Example 3 in the Federal Revenue manual: the widow (50%) and six siblings (7.14% each) sell 92.84%
manual = [Fraction(v, 9284) * 100 for v in [5000] + [714] * 6]
print(f"Manual: widow {float(manual[0]):.2f}%, each sibling {float(manual[1]):.2f}%, "
      f"rounded sum {sum(round(m * 100) for m in manual) / 100:.2f}%")</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">Portion transacted: 65% of the property (1300 m² of 2,000 m²)
Seller     % of property   Exact share         Rounded   Truncated
Marcos                40   800/13 =  61.5385     61.54       61.53
Leandro               15   300/13 =  23.0769     23.08       23.07
João                   8   160/13 =  12.3077     12.31       12.30
Pedro                  2    40/13 =   3.0769      3.08        3.07
Sum                   65      100 = 100.0000    100.01       99.97
Adjusting the largest share: 61.53 + 23.08 + 12.31 + 3.08 = 100.00
Manual: widow 53.86%, each sibling 7.69%, rounded sum 100.00%</pre>
</div>
  </div>
</div>

The manual only sets the range (from 99.00% to 100.00%), not the method. The choice between truncating and adjusting the largest share is up to whoever fills in the form.

### The same calculation with exponentials and logarithms

The division $$\frac{p_i}{65}$$ can also be written with exponentials and logarithms only, because $$\frac{a}{b} = e^{\ln a - \ln b}$$:

$$x_i = 100 \cdot e^{\ln p_i - \ln 65}$$

For Marcos: $$\ln 40 - \ln 65 = \ln\frac{40}{65}$$, and $$e^{\ln(40/65)} = \frac{40}{65} = \frac{8}{13}$$, so $$x_M = \frac{800}{13} \approx 61.54\%$$, the same result.

This form is reminiscent of the **EML operator** (*exp-minus-log*), introduced by Andrzej Odrzywołek in 2026 and explained in detail in the post [The EML operator](/operador-eml-funcoes-elementares/) (in Portuguese):

$$\operatorname{eml}(x, y) = e^x - \ln y.$$

The paper shows that this single operator, together with the constant 1, generates every function on a scientific calculator. Two of the identities:

$$e^x = \operatorname{eml}(x, 1), \qquad \ln z = \operatorname{eml}\big(1, \operatorname{eml}(\operatorname{eml}(1, z), 1)\big).$$

The second one can be checked by hand: $$\operatorname{eml}(1, z) = e - \ln z$$; then $$\operatorname{eml}(e - \ln z, 1) = e^{e - \ln z} = \frac{e^e}{z}$$; finally, $$\operatorname{eml}\!\left(1, \frac{e^e}{z}\right) = e - (e - \ln z) = \ln z$$.

The DOI formula above uses exponentials and logarithms, but not the EML operator. It is a curiosity, not a better method: to fill in the DOI, plain division is enough. The code checks both identities and recomputes the participations using the exponential form.

<div class="code-tabs">
  <div class="code-tab" data-lang="julia">
<div class="code-container">
  <div class="code-header">
    <div class="code-lang">Julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>eml(x, y) = exp(x) - log(y)                       # Odrzywołek's operator (2026)

@printf("eml(0.5, 1)                = %.10f   e^0.5 = %.10f\n", eml(0.5, 1), exp(0.5))
@printf("eml(1, eml(eml(1, 65), 1)) = %.10f   ln 65 = %.10f\n", eml(1, eml(eml(1, 65), 1)), log(65))

# Each seller's share written with exp and ln only
println()
for (name, s) in zip(sellers, shares)
    @printf("%-8s 100 exp(ln %2d - ln %d) = %8.4f\n", name, s, S, 100 * exp(log(s) - log(S)))
end</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">eml(0.5, 1)                = 1.6487212707   e^0.5 = 1.6487212707
eml(1, eml(eml(1, 65), 1)) = 4.1743872699   ln 65 = 4.1743872699
Marcos   100 exp(ln 40 - ln 65) =  61.5385
Leandro  100 exp(ln 15 - ln 65) =  23.0769
João     100 exp(ln  8 - ln 65) =  12.3077
Pedro    100 exp(ln  2 - ln 65) =   3.0769</pre>
</div>
  </div>
  <div class="code-tab" data-lang="python">
<div class="code-container">
  <div class="code-header">
    <div class="code-lang">Python</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>def eml(x, y): return math.exp(x) - math.log(y)   # Odrzywołek's operator (2026)

print(f"eml(0.5, 1)                = {eml(0.5, 1):.10f}   e^0.5 = {math.exp(0.5):.10f}")
print(f"eml(1, eml(eml(1, 65), 1)) = {eml(1, eml(eml(1, 65), 1)):.10f}   ln 65 = {math.log(65):.10f}")

# Each seller's share written with exp and ln only
print()
for name, s in zip(sellers, shares):
    print(f"{name:&lt;8s} 100 exp(ln {s:2d} - ln {S}) = {100 * math.exp(math.log(s) - math.log(S)):8.4f}")</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">eml(0.5, 1)                = 1.6487212707   e^0.5 = 1.6487212707
eml(1, eml(eml(1, 65), 1)) = 4.1743872699   ln 65 = 4.1743872699
Marcos   100 exp(ln 40 - ln 65) =  61.5385
Leandro  100 exp(ln 15 - ln 65) =  23.0769
João     100 exp(ln  8 - ln 65) =  12.3077
Pedro    100 exp(ln  2 - ln 65) =   3.0769</pre>
</div>
  </div>
</div>

## References

1. RECEITA FEDERAL. *Declaração sobre Operações Imobiliárias (DOI): orientações para o preenchimento manual*. Version 1.1, April 2025. Available at <https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/manuais/doi/doi-preenchimento.pdf>. Accessed November 25, 2026. (in Portuguese)
2. BRAZIL. Receita Federal. *Instrução Normativa RFB nº 2.186, de 12 de abril de 2024*, on the Declaração sobre Operações Imobiliárias (DOI). Available at <https://www.normasbrasil.com.br/norma/instrucao-normativa-2186-2024_457803.html>. Accessed November 25, 2026. (in Portuguese)
3. ODRZYWOŁEK, A. *All elementary functions from a single binary operator*. arXiv:2603.21852, 2026. Available at <https://arxiv.org/abs/2603.21852>. Accessed November 25, 2026.
