---
layout: post
image: /assets/images/capa-lean.avif
title: "Lean: the language in which the computer checks your proof"
categories: [MATHEMATICS, LEAN]
tags: [Mathematics, Lean, Julia, R, Python]
lang: en
ref: lean-provas-formais
author: dante-bertuzzi
description: "What Lean is, why testing a million cases proves nothing, and how to write, read and check your first formal proofs, including the errors Lean reports."
mathjax: true
---

I tested the identity $(a + b)^2 = a^2 + 2ab + b^2$ on one million pairs of integers. It held for every one of them. Does that prove it always holds?

No. And this is not hair-splitting: in a moment we will meet a formula that gets the first 40 cases right and the 41st wrong. What proves a statement "for every number" is a proof. And proofs written by people have a well-known problem: people skip steps, forget hypotheses and make arithmetic mistakes. This site once published the sum 0.01 + 0.009 + 0.008 as 0.029, when the right answer is 0.027, and the error was only caught in a review.

Today the proofs on this site are checked in **Lean**, a language in which you write the proof and the computer checks every step. This post explains what Lean is, shows the first proofs with the messages it gives back (including when the proof is wrong) and says honestly what it does not solve.

## Testing is not proving

The block below does two things. First, it checks the binomial identity on one million pairs of integers drawn between −1,000 and 1,000. Then it looks at the formula $n^2 + n + 41$ and asks, for each $n$ from 0 to 100, whether the result is a prime number (divisible only by 1 and itself).

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
    <pre><code>using Random

# 1) The identity (a + b)² = a² + 2ab + b² on one million pairs of integers
Random.seed!(123)
a = rand(-1000:1000, 1_000_000)
b = rand(-1000:1000, 1_000_000)
println("pairs that satisfy the identity: ", count((a .+ b) .^ 2 .== a .^ 2 .+ 2 .* a .* b .+ b .^ 2))

# 2) Is n² + n + 41 prime? (trial division, so no package is needed)
is_prime(m) = m ≥ 2 &amp;&amp; all(m % d != 0 for d in 2:isqrt(m))
results = [is_prime(n^2 + n + 41) for n in 0:100]
first_failure = findfirst(!, results) - 1      # the vector starts at n = 0
println("prime from n = 0 to n = 39: ", all(results[1:40]))
println("first n that fails: ", first_failure, " (", first_failure^2 + first_failure + 41,
        " = 41 × ", (first_failure^2 + first_failure + 41) ÷ 41, ")")
println("failures between n = 0 and n = 100: ", count(!, results))</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">pairs that satisfy the identity: 1000000
prime from n = 0 to n = 39: true
first n that fails: 40 (1681 = 41 × 41)
failures between n = 0 and n = 100: 14</pre>
</div>
  </div>
  <div class="code-tab" data-lang="r">
<div class="code-container">
  <div class="code-header">
    <div class="code-lang">R</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code># 1) The identity (a + b)² = a² + 2ab + b² on one million pairs of integers
set.seed(123)
a &lt;- sample(-1000:1000, 1e6, replace = TRUE)
b &lt;- sample(-1000:1000, 1e6, replace = TRUE)
cat("pairs that satisfy the identity:", sum((a + b)^2 == a^2 + 2 * a * b + b^2), "\n")

# 2) Is n² + n + 41 prime? (trial division, so no package is needed)
is_prime &lt;- function(m) m &gt;= 2 &amp;&amp; all(m %% seq_len(floor(sqrt(m)))[-1] != 0)
n &lt;- 0:100
results &lt;- sapply(n^2 + n + 41, is_prime)
first_failure &lt;- n[which(!results)[1]]
value &lt;- first_failure^2 + first_failure + 41
cat("prime from n = 0 to n = 39:", all(results[1:40]), "\n")
cat(sprintf("first n that fails: %d (%d = 41 × %d)\n", first_failure, value, value %/% 41))
cat("failures between n = 0 and n = 100:", sum(!results), "\n")</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">pairs that satisfy the identity: 1000000 
prime from n = 0 to n = 39: TRUE 
first n that fails: 40 (1681 = 41 × 41)
failures between n = 0 and n = 100: 14 </pre>
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
    <pre><code>import numpy as np
from math import isqrt

# 1) The identity (a + b)² = a² + 2ab + b² on one million pairs of integers
rng = np.random.default_rng(123)
a = rng.integers(-1000, 1001, 1_000_000)
b = rng.integers(-1000, 1001, 1_000_000)
print("pairs that satisfy the identity:", np.sum((a + b) ** 2 == a**2 + 2 * a * b + b**2))

# 2) Is n² + n + 41 prime? (trial division, so no package is needed)
def is_prime(m):
    return m &gt;= 2 and all(m % d != 0 for d in range(2, isqrt(m) + 1))

results = [is_prime(n**2 + n + 41) for n in range(101)]
first_failure = results.index(False)
value = first_failure**2 + first_failure + 41
print("prime from n = 0 to n = 39:", all(results[:40]))
print(f"first n that fails: {first_failure} ({value} = 41 × {value // 41})")
print("failures between n = 0 and n = 100:", results.count(False))</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">pairs that satisfy the identity: 1000000
prime from n = 0 to n = 39: True
first n that fails: 40 (1681 = 41 × 41)
failures between n = 0 and n = 100: 14</pre>
</div>
  </div>
</div>

The three languages draw different pairs, but the result is the same: the identity held for every pair. And $n^2 + n + 41$ is prime for every $n$ from 0 to 39, forty cases in a row. Anyone who stopped testing there would conclude that the formula always produces primes. At $n = 40$ it fails:

$$
40^2 + 40 + 41 = 1600 + 40 + 41 = 1681 = 41 \times 41
$$

From 0 to 100 there are 14 failures. I checked the count another way, with the sieve of Eratosthenes (crossing out the multiples of each number), and it matches: the failures are at $n$ = 40, 41, 44, 49, 56, 65, 76, 81, 82, 84, 87, 89, 91 and 96.

The lesson applies to both cases. A million successes of the identity do not prove that it holds for the million-and-first pair. Forty successes of the prime formula did not prove anything either, and it does fail. Testing shows that something *seems* to hold, or finds a counterexample. Only a proof guarantees the "for every".

## What Lean is

The official website describes Lean as an open-source programming language and a **proof assistant**: a program that checks mathematical proofs. You write the statement and the proof in a form the computer understands, and it accepts the proof only if every step follows from the rules. There is no "it is easy to see that": any step you skip, it asks for.

Lean was created by Leonardo de Moura in 2013, and the first commit in the repository dates from July of that year. Version 4, the one in use today, began development in 2018, and Lean 4.0 was officially released in September 2023. Since July 2023 the project has been run by the **Lean FRO**, a non-profit organization founded by de Moura and Sebastian Ullrich. The dates are on the Lean FRO's "About" page.

The part that checks proofs, the *kernel*, is deliberately small: the less code you have to trust, the smaller the chance that it has a bug itself. On top of it there are tools that help *find* proofs, the **tactics**, but everything they produce goes through the kernel again.

Almost all the mathematics used in Lean comes from **Mathlib**, a library maintained by the community. On 26 November 2026, the Mathlib statistics page counted 296,731 theorems and 142,208 definitions, written by 772 people.

## The first proof: the square of a sum

This is a complete Lean file. The first line loads Mathlib, and the rest states and proves the binomial identity:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang code-lang--lean">Lean</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>import Mathlib

theorem binomial (a b : ℝ) : (a + b) ^ 2 = a ^ 2 + 2 * a * b + b ^ 2 := by
  ring</code></pre>
  </div>
</div>

Reading it piece by piece:

- `theorem binomial` gives the result a name, so it can be used later.
- `(a b : ℝ)` declares the variables: `a` and `b` are arbitrary real numbers. This is the "for all $a$ and $b$" of the statement.
- After the colon comes the claim: $(a + b)^2 = a^2 + 2ab + b^2$. In Lean, `^` is a power and `*` is multiplication.
- `:= by` opens the proof, and `ring` is the tactic that settles it. It knows the algebra that holds in any commutative ring (distributivity, commutativity, associativity) and closes the equation on its own.

No message appears, and that is what we want: Lean accepted the proof. The same identity, with a geometric proof, is in the post [Binomial squared](/binomio-quadrado/) (in Portuguese).

## When the statement is false

Now the classic mistake: thinking that $(a + b)^2 = a^2 + b^2$.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang code-lang--lean">Lean</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>import Mathlib

theorem binomial_wrong (a b : ℝ) : (a + b) ^ 2 = a ^ 2 + b ^ 2 := by
  ring</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">Try this:
  [apply] ring_nf
  
  The `ring` tactic failed to close the goal. Use `ring_nf` to obtain a normal form.
    
  Note that `ring` works primarily in *commutative* rings. If you have a noncommutative ring, abelian group or module, consider using `noncomm_ring`, `abel` or `module` instead.
binomial_wrong.lean:3:66: error: unsolved goals
a b : ℝ
⊢ a * b * 2 + a ^ 2 + b ^ 2 = a ^ 2 + b ^ 2</pre>
</div>

Lean refuses. The message opens by suggesting another tactic (`ring_nf`), but the useful part is at the end. The `ring` tactic brought both sides to their simplest form and shows what is left: the left side has a term `a * b * 2` that the right side lacks. The symbol `⊢` marks the **goal**, what is still to be proved. It is exactly the forgotten $2ab$. The computer does not know that the statement is "a common mistake"; it only knows that the equation does not close.

## The hypothesis nobody writes down

This is the most instructive example. In Lean, dividing by zero is not an error:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang code-lang--lean">Lean</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>import Mathlib

example : (1 : ℝ) / 0 = 0 := by
  simp

theorem div_by_itself (x : ℝ) : x / x = 1 := by
  field_simp</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">division.lean:6:45: error: unsolved goals
x : ℝ
⊢ x / x = 1</pre>
</div>

The first statement, $1/0 = 0$, goes through. It is a Lean convention: this way division has a result for any pair of numbers, without a special case. The price shows up in the second statement. "Any number divided by itself is 1" does not close, because with $x = 0$ the calculation gives $0/0 = 0$, not 1. The `field_simp` tactic, which simplifies fractions, could do nothing without knowing that $x$ is not zero, and the goal stayed as it was.

With the hypothesis written down, the proof takes one line, using a Mathlib theorem called `div_self`:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang code-lang--lean">Lean</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>import Mathlib

theorem div_by_itself (x : ℝ) (hx : x ≠ 0) : x / x = 1 := by
  exact div_self hx</code></pre>
  </div>
</div>

`(hx : x ≠ 0)` is the hypothesis, with a name (`hx`) so that it can be used. In a book, the sentence "any number divided by itself is 1" often appears without the "nonzero", and the reader fills it in. Lean does not. That is why the rule on this site is: **if the Lean proof needs a hypothesis that the page does not state, the page is incomplete**, and the hypothesis goes into the text.

## Proving what the test only suggested

Lean can also check cases, as long as there are finitely many. The statement "$n^2 + n + 41$ is prime for every $n < 40$" has 40 cases, and Lean checks them one by one. The statement that 1681 is not prime is also a finite calculation:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang code-lang--lean">Lean</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>import Mathlib

theorem primes_up_to_39 : ∀ n &lt; 40, Nat.Prime (n ^ 2 + n + 41) := by
  intro n hn
  interval_cases n &lt;;&gt; norm_num

theorem fails_at_40 : ¬ Nat.Prime (40 ^ 2 + 40 + 41) := by
  norm_num</code></pre>
  </div>
</div>

`interval_cases n` opens the 40 cases ($n = 0, 1, \dots, 39$), and `norm_num` checks each one. No message: both statements are proved. Notice that this does not contradict the earlier section. Here the statement is about 40 cases, and all 40 were checked. Testing is not enough when the statement is about *infinitely many* cases.

## A proof by induction

The sum of the first $n$ odd numbers is $n^2$:

$$
1 + 3 + 5 + \dots + (2n - 1) = n^2
$$

With $n = 5$: $1 + 3 + 5 + 7 + 9 = 25 = 5^2$. Testing confirms it up to $n = 10{,}000$:

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
    <pre><code># 1 + 3 + 5 + … + (2n − 1) = n², checked from n = 1 to n = 10,000
check(n) = sum(2i + 1 for i in 0:n-1) == n^2
println("holds for every n from 1 to 10,000: ", all(check, 1:10_000))
println("example, n = 5: ", join(2 .* (0:4) .+ 1, " + "), " = ", sum(2 .* (0:4) .+ 1))</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">holds for every n from 1 to 10,000: true
example, n = 5: 1 + 3 + 5 + 7 + 9 = 25</pre>
</div>
  </div>
  <div class="code-tab" data-lang="r">
<div class="code-container">
  <div class="code-header">
    <div class="code-lang">R</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code># 1 + 3 + 5 + … + (2n − 1) = n², checked from n = 1 to n = 10,000
check &lt;- function(n) sum(2 * (0:(n - 1)) + 1) == n^2
cat("holds for every n from 1 to 10,000:", all(sapply(1:10000, check)), "\n")
odds &lt;- 2 * (0:4) + 1
cat("example, n = 5:", paste(odds, collapse = " + "), "=", sum(odds), "\n")</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">holds for every n from 1 to 10,000: TRUE 
example, n = 5: 1 + 3 + 5 + 7 + 9 = 25 </pre>
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
    <pre><code># 1 + 3 + 5 + … + (2n − 1) = n², checked from n = 1 to n = 10,000
def check(n):
    return sum(2 * i + 1 for i in range(n)) == n**2

print("holds for every n from 1 to 10,000:", all(check(n) for n in range(1, 10_001)))
odds = [2 * i + 1 for i in range(5)]
print("example, n = 5:", " + ".join(map(str, odds)), "=", sum(odds))</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">holds for every n from 1 to 10,000: True
example, n = 5: 1 + 3 + 5 + 7 + 9 = 25</pre>
</div>
  </div>
</div>

But there are infinitely many values of $n$, and for those a proof is needed. The tool is **induction**:

1. **Base case**: it holds for $n = 0$ (the empty sum is 0, and $0^2 = 0$).
2. **Step**: *if* it holds for some $k$, then it holds for $k + 1$.

Together, the two steps cover every natural number: it holds for 0, hence for 1, hence for 2, and so on.

In Lean, the sum $1 + 3 + \dots + (2n-1)$ is written `∑ i ∈ range n, (2 * i + 1)`: the sum of $2i + 1$ for $i$ from 0 to $n - 1$. A first attempt, still incomplete:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang code-lang--lean">Lean</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>import Mathlib

open Finset

theorem sum_odds (n : ℕ) : ∑ i ∈ range n, (2 * i + 1) = n ^ 2 := by
  induction n with
  | zero =&gt; simp
  | succ k ih =&gt;
    rw [sum_range_succ, ih]</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">odds_incomplete.lean:8:14: error: unsolved goals
case succ
k : ℕ
ih : ∑ i ∈ range k, (2 * i + 1) = k ^ 2
⊢ k ^ 2 + (2 * k + 1) = (k + 1) ^ 2</pre>
</div>

`induction n with` splits the two cases. The `zero` case is done by `simp`. In the `succ` case (for *successor*, $k + 1$), the induction hypothesis is called `ih` and says the formula holds for $k$. The step `rw [sum_range_succ, ih]` makes two rewrites: it splits off the last term of the sum (`sum_range_succ`) and replaces the sum up to $k$ with $k^2$, using `ih`.

The message shows what is still missing, with everything known at that point: the hypotheses above and the goal after `⊢`. It remains to prove that

$$
k^2 + (2k + 1) = (k + 1)^2,
$$

which is the binomial again. Adding `ring` is enough:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang code-lang--lean">Lean</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>import Mathlib

open Finset

theorem sum_odds (n : ℕ) : ∑ i ∈ range n, (2 * i + 1) = n ^ 2 := by
  induction n with
  | zero =&gt; simp
  | succ k ih =&gt;
    rw [sum_range_succ, ih]
    ring

#print axioms sum_odds</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">'sum_odds' depends on axioms: [propext, Classical.choice, Quot.sound]</pre>
</div>

The proof went through. The last line, `#print axioms`, asks Lean for the list of axioms the proof relies on: `propext` (two equivalent propositions are equal), `Classical.choice` (the axiom of choice) and `Quot.sound` (a rule about quotients). All three are explained in chapter 12 of *Theorem Proving in Lean 4*. If `sorryAx` appeared in the list, the proof would have a hole: `sorry` is the word that tells Lean to accept a step without proof, and it is forbidden in this site's proofs.

## How this site uses Lean

The site's proofs live in the [`provas/`](https://github.com/morrisonkuhlsen/morrisonkuhlsen/tree/master/provas) folder of the repository: one file per subject, with the address of the page that states each result. On 26 November 2026 there were 176 theorems in 24 files, from special products to Bayes' theorem and the fences of the [boxplot](/boxplot-anatomy-elements-calculation-reading/). The command `lake build` checks them all at once. The examples in this post ran on Lean 4.37.0-rc1, with the Mathlib version pinned in the repository.

The rules are simple:

- The Lean statement is **the same** as what the page claims, with the same hypotheses.
- If the proof needs a hypothesis the page does not state, it is the page that changes.
- `sorry` is forbidden. A proof that does not go through stays out, and the page's claim is marked as pending.

## What Lean does not solve

Lean guarantees that the proof proves *the statement written in Lean*. That leaves important things out:

- **The translation.** If I write in Lean a statement different from the one on the page (an extra hypothesis, a flipped sign or a wrong index), Lean proves the wrong statement without complaint. Checking that the formal statement says the same as the text is human work.
- **Calculations with real-world numbers.** A p-value, a normal quantile or the result of a simulation is computed in Julia, R or Python, and there what counts is redoing the calculation another way.
- **Code and references.** Lean does not run the posts' code, nor does it know whether a cited book exists and says what is claimed.
- **The axioms and the kernel itself.** The proof holds *given* that the three axioms above are accepted and that Lean's kernel has no bugs. It is a small and much-examined foundation, but it is a foundation.

In short: Lean does not replace the other checks; it covers a part that used to depend on attention alone, namely that each step of the proof follows from the previous one.

## How to start

- **Without installing anything**: the [Natural Number Game](https://adam.math.hhu.de/#/g/leanprover-community/nng4) is a game for learning Lean in the browser.
- **To install**: the page [lean-lang.org/install](https://lean-lang.org/install/) recommends VS Code with the Lean 4 extension.
- **To study**: [*Theorem Proving in Lean 4*](https://lean-lang.org/theorem_proving_in_lean4/) explains the language and the logic; [*Mathematics in Lean*](https://leanprover-community.github.io/mathematics_in_lean/) teaches how to use Mathlib.
- **To find a Mathlib theorem** (like this post's `div_self`): [Loogle](https://loogle.lean-lang.org/) searches Lean and Mathlib definitions and theorems.

## Summary

- Testing many cases shows that something *seems* to hold; $n^2 + n + 41$ is right 40 times in a row and fails at $n = 40$. Only a proof guarantees the "for every".
- Lean is a language and a proof assistant: you write the proof, and a small kernel checks every step.
- When a proof fails, Lean shows the goal that is left (`⊢`), and that usually points to the error: the forgotten $2ab$, the missing hypothesis $x \neq 0$.
- Lean checks the proof of the formal statement. Whether that statement matches the text, whether the numerical calculations are right and whether the sources exist still depends on human checking.

## References

- de Moura, L.; Ullrich, S. (2021). The Lean 4 theorem prover and programming language. In: *Automated Deduction – CADE 28*. Lecture Notes in Computer Science, pp. 625–635. Springer. DOI: [10.1007/978-3-030-79876-5_37](https://doi.org/10.1007/978-3-030-79876-5_37).
- de Moura, L.; Kong, S.; Avigad, J.; van Doorn, F.; von Raumer, J. (2015). The Lean theorem prover (system description). In: *Automated Deduction – CADE-25*. Lecture Notes in Computer Science, pp. 378–388. Springer. DOI: [10.1007/978-3-319-21401-6_26](https://doi.org/10.1007/978-3-319-21401-6_26).
- The mathlib Community (2020). The Lean mathematical library. In: *Proceedings of the 9th ACM SIGPLAN International Conference on Certified Programs and Proofs (CPP 2020)*, pp. 367–381. ACM. DOI: [10.1145/3372885.3373824](https://doi.org/10.1145/3372885.3373824).
- Avigad, J.; de Moura, L.; Kong, S.; Ullrich, S. *Theorem Proving in Lean 4*, ch. 12 ("Axioms and Computation"). [lean-lang.org/theorem_proving_in_lean4](https://lean-lang.org/theorem_proving_in_lean4/). Accessed 26 Nov. 2026.
- Avigad, J.; Massot, P. *Mathematics in Lean*. [leanprover-community.github.io/mathematics_in_lean](https://leanprover-community.github.io/mathematics_in_lean/). Accessed 26 Nov. 2026.
- Lean FRO. About (history of Lean and the Lean FRO). [lean-lang.org/fro/about](https://lean-lang.org/fro/about/). Accessed 26 Nov. 2026.
- Mathlib. Mathlib statistics. [mathlib.org/mathlib_stats.html](https://mathlib.org/mathlib_stats.html). Accessed 26 Nov. 2026.
