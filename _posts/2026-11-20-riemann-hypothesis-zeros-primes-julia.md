---
layout: post
image: /assets/images/capa-riemann.avif
title: "The Riemann hypothesis, told through the primes: zeros, waves and a staircase rebuilt in Julia"
categories: [MATHEMATICS, JULIA]
tags: [Mathematics, Julia, R, Python]
lang: en
ref: hipotese-de-riemann
author: dante-bertuzzi
description: "What the Riemann hypothesis says, why it is about prime numbers, and what a computer shows: zeros, the prime staircase rebuilt and a pattern from physics."
mathjax: true
---

The Riemann hypothesis has an odd reputation. It is one of the most famous
open problems in mathematics, it is worth a million dollars, and its
statement seems to have nothing to do with anything: *all nontrivial zeros of
the zeta function have real part equal to 1/2*.

I spent years being able to recite that sentence without understanding why
anyone would care about it. Zeros of a complex function. Real part 1/2. So
what?

The "so what" is that this sentence is about prime numbers. More precisely,
about **how much** the distribution of the primes can stray from a simple
rule. This post is my attempt to get there with as little complex analysis
and as much computer arithmetic as possible: I took the first 20,000 zeros,
rebuilt the prime count from them and ended up finding, in a number theory
problem, a histogram that looks like it came out of a physics book.

A warning up front: nothing here proves the hypothesis. What can be done is
to see what it says, and what would be at stake if it were false.

<div style="border-left: 4px solid #FF9800; padding: 1em; background-color: var(--mk-tint-warn); margin: 1em 0; border-radius: 4px;">
<strong>Note (November 25, 2026).</strong> In the days this post was revised, the announcement of a formal proof of the Riemann hypothesis, written in the Lean proof assistant, was circulating. As of that date there was no published paper with the proof and no independent verification, and the Clay Institute still listed the problem as open. This post treats the hypothesis as open; if the proof is confirmed, the text will be updated.
</div>

## The idea, before any formula

Imagine an endless road with a sign at every whole number, and you walking
along it with a notebook, writing down the primes you come across.

At first they show up all the time: 2, 3, 5, 7, 11, 13. Then they thin out,
at a pace you can predict. Near sign one thousand, the average distance from
one prime to the next is about 7 signs; near one million, 14; near one
billion, 21. (The rule is that, near $x$, this average distance is $\ln x$:
$\ln 1{,}000 = 6.9$, $\ln 10^6 = 13.8$ and $\ln 10^9 = 20.7$.) That part has
been settled since 1896: in the long run, the average never fails.

But someone walking the road doesn't see the average. They see the road up
close, and up close the primes have no rhythm at all:

- Right after one billion comes a tight pair: 1,000,000,007 and
  1,000,000,009. The next pair only shows up 402 signs later.
- Below one thousand, the longest stretch without primes goes from 887 to
  907: 19 empty signs in a row, almost three times the average distance
  around there.
- Below one million, the record is from 492,113 to 492,227: 113 signs
  without a single prime, where the average would be 13.
- Right after one billion, between 1,002,901,069 and 1,002,901,279, there are
  209 empty signs, ten times the local average.
- Split the 10 million signs after one billion into stretches of a thousand.
  On average, each stretch has 48 primes. But there was a stretch with 29 and
  one with 71.

None of this is random: whether a number is prime or not has been settled
forever. Even so, nobody can say where the next prime will land without
going there to check. And here comes the question that matters: **how far
can reality stray from the average?**

You can imagine roads much worse than ours. One where, around sign
$10^{100}$, the primes simply vanish for a gigantic stretch and then come
back in a crowd, making up for the delay. The long-run average would still be
right, but anyone in the middle of the road would count far fewer primes than
the rule promises, and for a long time.

The Riemann hypothesis says our road is not like that. After walking up to
sign $x$, your notebook will never disagree with the average by more than
something of the order of $\sqrt{x}$ (times a logarithm). It sounds like a
lot, but it's almost nothing. Up to one billion you write down 50,847,534
primes, the average predicted 50,849,235, and the hypothesis would only allow
a difference of about 26 thousand, around 0.05% of the total. The actual
difference is 1,701.

And not just in the total. If the hypothesis is true, no desert can be too
long: after sign $x$, the next prime shows up at most at a distance of the
order of $\sqrt{x}\,\ln x$ (Harald Cramér proved this assuming the
hypothesis). Deserts exist and grow without bound, but they grow slowly
compared with the length of the road. The 209-sign one, right after one
billion, is light-years away from what that bound would allow, which is of
the order of $\sqrt{10^9} \times \ln 10^9 \approx 31{,}623 \times 20.7 \approx 655$
thousand.

Why $\sqrt{x}$, of all things? One intuition is to think about coins. Toss a
billion coins: the number of heads will be close to half a billion, but
almost never exactly; the typical deviation is $\sqrt{x}/2$, about 16
thousand. The hypothesis says that the primes, which are not drawn at random
at all, oscillate around the average at most as much as something drawn at
random would. They look scattered without a rule, but the size of their
oscillations has an owner.

And who that owner is becomes literal further on: the oscillations of the
primes are a sum of waves, one for each zero of the zeta function, and the
real part of the zero dictates how fast its wave grows. Real part 1/2 means
every wave grows like $\sqrt{x}$. A single zero off the line would be a wave
growing faster than the others, and then, somewhere very far down the road,
the primes would get out of control.

That is also why checking on a computer is not enough. The first 12 trillion
zeros have already been verified, all on the line. But there are infinitely
many, and the zero that would ruin everything may be at a height no computer
will ever reach. It's the same problem as the road: you can walk a huge
stretch, but never to the end.

## First, the primes

[Prime numbers](/matematica-basica/primos.html) (page in Portuguese) follow no apparent pattern: 2, 3,
5, 7, 11, 13, 17, 19, 23... Sometimes they come close together (11 and 13),
sometimes they disappear for a while (there are none between 114 and 126).
But, seen from afar, they become surprisingly well behaved.

Let $\pi(x)$ be the number of primes up to $x$ — this $\pi$ has nothing to do
with 3.14; it's just the notation that stuck. The idea that won out is that,
near a number $x$, the chance that an integer is prime is roughly
$1/\ln x$. Adding up this "density" up to $x$ gives the logarithmic integral:

$$
\operatorname{li}(x) = \int_0^x \frac{dt}{\ln t}.
$$

(The integral passes over $t = 1$, where $\ln t = 0$, and is taken in the
principal value sense. Many texts start at 2 and write
$\operatorname{Li}(x)$; the difference between the two is a constant,
$\operatorname{li}(2) = 1.045$, which changes nothing here. I use the one that
starts at 0 because that is the one the bounds further on are stated with.)

I counted the primes up to one billion with a sieve of Eratosthenes and
compared:

| $x$ | $\pi(x)$ | $x / \ln x$ | $\operatorname{li}(x)$ | $\pi(x) - \operatorname{li}(x)$ |
|---|---:|---:|---:|---:|
| $10^3$ | 168 | 145 | 177.6 | −9.6 |
| $10^4$ | 1,229 | 1,086 | 1,246.1 | −17.1 |
| $10^5$ | 9,592 | 8,686 | 9,629.8 | −37.8 |
| $10^6$ | 78,498 | 72,382 | 78,627.5 | −129.5 |
| $10^7$ | 664,579 | 620,421 | 664,918.4 | −339.4 |
| $10^8$ | 5,761,455 | 5,428,681 | 5,762,209.4 | −754.4 |
| $10^9$ | 50,847,534 | 48,254,942 | 50,849,235.0 | −1,701.0 |

Up to one billion, $\operatorname{li}(x)$ is off by 1,701 primes out of 50
million: an error of $1{,}701 / 50{,}847{,}534 = 0.003\%$. The simpler version,
$x/\ln x$, is off by $(50{,}847{,}534 - 48{,}254{,}942)/50{,}847{,}534 = 5.1\%$.

The code below runs the sieve, builds the table and draws Figure 3, further
down. In Julia and in Python it takes about ten seconds; in R, which stores
one number per entry instead of one bit and therefore sieves in blocks, it
takes much longer (half an hour here).

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
    <pre><code>using Arblib, Plots, Printf

# Sieve of Eratosthenes up to 10⁹ (one bit per number: about 125 MB)
function crivo(n)
    is_prime = trues(n); is_prime[1] = false
    for i in 2:isqrt(n)
        is_prime[i] || continue
        for j in i*i:i:n
            is_prime[j] = false
        end
    end
    is_prime
end
N = 10^9
is_prime = crivo(N)

# π(x) = number of primes ≤ x, for an increasing list of x (counting block by block)
function count_up_to(is_prime, xs)
    total, start = 0, 1
    map(xs) do x
        total += count(is_prime[start:x])
        start = x + 1
        total
    end
end

# Logarithmic integral li(x), computed by Arblib with 128 bits
li(x) = Float64(Arblib.hypgeom_li!(Arb(prec = 128), Arb(x; prec = 128), 0))

powers = [10^k for k in 3:9]
π_pow = count_up_to(is_prime, powers)
println("x       π(x)        x/ln x      li(x)           π(x) − li(x)")
for (k, x, p) in zip(3:9, powers, π_pow)
    @printf("10^%d  %-11d %-11d %-15.1f %.1f\n", k, p, round(Int, x / log(x)), li(x), p - li(x))
end
x = 10^9
println("Schoenfeld bound at 10^9: ", round(sqrt(x) * log(x) / (8π), digits = 1))

# Figure 3: the error at 300 log-spaced points, from 3,000 to 10⁹
xs = round.(Int, exp10.(range(log10(3000), 9, length = 300)))
err = count_up_to(is_prime, xs) .- li.(xs)
unit = sqrt.(xs) ./ log.(xs)
ratio = err ./ unit
squares = [-li(sqrt(x)) / 2 for x in xs] ./ unit   # deviation expected from the squares of primes
println("Error / (√x/ln x): minimum ", round(minimum(ratio), digits = 2), ", maximum ", round(maximum(ratio), digits = 2),
        ", at 10^9 ", round(ratio[end], digits = 2))
println("Squares curve: from ", round(squares[1], digits = 2), " to ", round(squares[end], digits = 2))

bound = sqrt.(xs) .* log.(xs) ./ (8π)
p1 = plot(xs, bound, fillrange = -bound, fillalpha = 0.2, color = :royalblue, lw = 0, label = "Bound (if the hypothesis holds)",
          xscale = :log10, xlabel = "x", ylabel = "π(x) − li(x)", title = "Error and Schoenfeld's bound", legend = :bottomleft)
plot!(p1, xs, err, color = :red, lw = 1.5, label = "π(x) − li(x)")
p2 = plot(xs, ratio, color = :red, lw = 1.5, label = "(π(x) − li(x)) / (√x / ln x)", xscale = :log10,
          xlabel = "x", title = "The error in units of √x / ln x", legend = :bottomright)
plot!(p2, xs, squares, color = :black, ls = :dash, label = "−li(√x)/2, in units of √x / ln x")
hline!(p2, [0], color = :gray, label = "")
savefig(plot(p1, p2, layout = (1, 2), size = (1000, 420), margin = 4Plots.mm), "riemann_erro_jl_en.png")</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">x       π(x)        x/ln x      li(x)           π(x) − li(x)
10^3  168         145         177.6           -9.6
10^4  1229        1086        1246.1          -17.1
10^5  9592        8686        9629.8          -37.8
10^6  78498       72382       78627.5         -129.5
10^7  664579      620421      664918.4        -339.4
10^8  5761455     5428681     5762209.4       -754.4
10^9  50847534    48254942    50849235.0      -1701.0
Schoenfeld bound at 10^9: 26074.6
Error / (√x/ln x): minimum -2.18, maximum -0.74, at 10^9 -1.11
Squares curve: from -1.44 to -1.13</pre>
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
    <pre><code># Segmented sieve of Eratosthenes up to 10⁹: blocks of 10⁷ numbers
# (a logical vector with 10⁹ entries would take 4 GB)
N &lt;- 1e9
root &lt;- floor(sqrt(N))
base &lt;- rep(TRUE, root); base[1] &lt;- FALSE                 # plain sieve up to √N
for (i in 2:floor(sqrt(root))) if (base[i]) base[seq(i * i, root, by = i)] &lt;- FALSE
base_primes &lt;- which(base)

# π(x) = number of primes ≤ x, for an increasing list of x
count_up_to &lt;- function(xs, size = 1e7) {
  out &lt;- numeric(length(xs)); total &lt;- 0; j &lt;- 1
  for (start in seq(1, N, by = size)) {
    end_ &lt;- start + size - 1
    block &lt;- rep(TRUE, size)
    if (start == 1) block[1] &lt;- FALSE
    for (p in base_primes[base_primes * base_primes &lt;= end_]) {
      first &lt;- max(p * p, ceiling(start / p) * p)
      if (first &lt;= end_) block[seq(first - start + 1, size, by = p)] &lt;- FALSE
    }
    cumulative &lt;- cumsum(block)
    while (j &lt;= length(xs) &amp;&amp; xs[j] &lt;= end_) {
      out[j] &lt;- total + cumulative[xs[j] - start + 1]; j &lt;- j + 1
    }
    total &lt;- total + cumulative[size]
  }
  out
}

# Logarithmic integral: li(x) = li(2) + ∫ from ln 2 to ln x of e^u / u du
li2 &lt;- 1.045163780117492784844588889194613136522615578151   # li(2)
li &lt;- function(x) li2 + integrate(function(u) exp(u) / u, log(2), log(x), rel.tol = 1e-13)$value

# A single pass of the sieve: the powers of 10 (table) and the 300 points of Figure 3
powers &lt;- 10^(3:9)
xs &lt;- round(10^seq(log10(3000), 9, length.out = 300))
all_x &lt;- sort(unique(c(powers, xs)))
pi_all &lt;- count_up_to(all_x)
pi_of &lt;- function(x) pi_all[match(x, all_x)]
p_pow &lt;- pi_of(powers)
cat("x       π(x)        x/ln x      li(x)           π(x) − li(x)\n")
for (k in 3:9) {
  x &lt;- 10^k; p &lt;- p_pow[k - 2]
  cat(sprintf("10^%d  %-11d %-11d %-15.1f %.1f\n", k, as.integer(p), as.integer(round(x / log(x))), li(x), p - li(x)))
}
x &lt;- 1e9
cat(sprintf("Schoenfeld bound at 10^9: %.1f\n", sqrt(x) * log(x) / (8 * pi)))

# Figure 3: the error at 300 log-spaced points, from 3,000 to 10⁹
err &lt;- pi_of(xs) - sapply(xs, li)
unit &lt;- sqrt(xs) / log(xs)
ratio &lt;- err / unit
squares &lt;- -sapply(sqrt(xs), li) / 2 / unit     # deviation expected from the squares of primes
cat(sprintf("Error / (√x/ln x): minimum %.2f, maximum %.2f, at 10^9 %.2f\n", min(ratio), max(ratio), ratio[300]))
cat(sprintf("Squares curve: from %.2f to %.2f\n", squares[1], squares[300]))

bound &lt;- sqrt(xs) * log(xs) / (8 * pi)
png("riemann_erro_r_en.png", width = 1000, height = 420)
par(mfrow = c(1, 2))
plot(xs, err, log = "x", type = "n", ylim = range(c(-bound, bound)), xlab = "x", ylab = "π(x) − li(x)",
     main = "Error and Schoenfeld's bound")
polygon(c(xs, rev(xs)), c(bound, rev(-bound)), col = adjustcolor("royalblue", 0.2), border = NA)
lines(xs, err, col = "red", lwd = 1.5)
legend("bottomleft", c("Bound (if the hypothesis holds)", "π(x) − li(x)"), fill = c(adjustcolor("royalblue", 0.2), NA),
       border = NA, col = c(NA, "red"), lwd = c(NA, 1.5))
plot(xs, ratio, log = "x", type = "l", col = "red", lwd = 1.5, ylim = range(c(ratio, squares, 0)),
     xlab = "x", ylab = "", main = "The error in units of √x / ln x")
lines(xs, squares, lty = 2); abline(h = 0, col = "gray")
legend("bottomright", c("(π(x) − li(x)) / (√x / ln x)", "−li(√x)/2, in units of √x / ln x"),
       col = c("red", "black"), lty = c(1, 2))
invisible(dev.off())</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">x       π(x)        x/ln x      li(x)           π(x) − li(x)
10^3  168         145         177.6           -9.6
10^4  1229        1086        1246.1          -17.1
10^5  9592        8686        9629.8          -37.8
10^6  78498       72382       78627.5         -129.5
10^7  664579      620421      664918.4        -339.4
10^8  5761455     5428681     5762209.4       -754.4
10^9  50847534    48254942    50849235.0      -1701.0
Schoenfeld bound at 10^9: 26074.6
Error / (√x/ln x): minimum -2.18, maximum -0.74, at 10^9 -1.11
Squares curve: from -1.44 to -1.13</pre>
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
import matplotlib.pyplot as plt
from mpmath import li as mp_li

# Sieve of Eratosthenes up to 10⁹ (one byte per number: about 1 GB)
N = 10**9
is_prime = np.ones(N + 1, dtype=bool)
is_prime[:2] = False
for i in range(2, int(N**0.5) + 1):
    if is_prime[i]:
        is_prime[i * i::i] = False

# π(x) = number of primes ≤ x, for an increasing list of x (counting block by block)
def count_up_to(xs):
    total, start, out = 0, 0, []
    for x in xs:
        total += np.count_nonzero(is_prime[start:x + 1])
        start = x + 1
        out.append(total)
    return np.array(out)

li = lambda x: float(mp_li(x))        # logarithmic integral (mpmath)

powers = [10**k for k in range(3, 10)]
print("x       π(x)        x/ln x      li(x)           π(x) − li(x)")
for k, x, p in zip(range(3, 10), powers, count_up_to(powers)):
    print(f"10^{k}  {p:&lt;11d} {round(x / np.log(x)):&lt;11d} {li(x):&lt;15.1f} {p - li(x):.1f}")
x = 10**9
print(f"Schoenfeld bound at 10^9: {np.sqrt(x) * np.log(x) / (8 * np.pi):.1f}")

# Figure 3: the error at 300 log-spaced points, from 3,000 to 10⁹
xs = np.round(10 ** np.linspace(np.log10(3000), 9, 300)).astype(np.int64)
err = count_up_to(xs) - np.array([li(int(x)) for x in xs])
unit = np.sqrt(xs) / np.log(xs)
ratio = err / unit
squares = np.array([-li(np.sqrt(x)) / 2 for x in xs]) / unit   # deviation expected from the squares of primes
print(f"Error / (√x/ln x): minimum {ratio.min():.2f}, maximum {ratio.max():.2f}, at 10^9 {ratio[-1]:.2f}")
print(f"Squares curve: from {squares[0]:.2f} to {squares[-1]:.2f}")

bound = np.sqrt(xs) * np.log(xs) / (8 * np.pi)
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4.2))
ax1.fill_between(xs, -bound, bound, color="royalblue", alpha=0.2, label="Bound (if the hypothesis holds)")
ax1.plot(xs, err, color="red", lw=1.5, label="π(x) − li(x)")
ax1.set_xscale("log"); ax1.set_xlabel("x"); ax1.set_ylabel("π(x) − li(x)")
ax1.set_title("Error and Schoenfeld's bound"); ax1.legend(loc="lower left")
ax2.plot(xs, ratio, color="red", lw=1.5, label="(π(x) − li(x)) / (√x / ln x)")
ax2.plot(xs, squares, color="black", ls="--", label="−li(√x)/2, in units of √x / ln x")
ax2.axhline(0, color="gray", lw=0.8)
ax2.set_xscale("log"); ax2.set_xlabel("x"); ax2.set_title("The error in units of √x / ln x")
ax2.legend(loc="lower right")
fig.tight_layout(); fig.savefig("riemann_erro_en.png", dpi=100)</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">x       π(x)        x/ln x      li(x)           π(x) − li(x)
10^3  168         145         177.6           -9.6
10^4  1229        1086        1246.1          -17.1
10^5  9592        8686        9629.8          -37.8
10^6  78498       72382       78627.5         -129.5
10^7  664579      620421      664918.4        -339.4
10^8  5761455     5428681     5762209.4       -754.4
10^9  50847534    48254942    50849235.0      -1701.0
Schoenfeld bound at 10^9: 26074.6
Error / (√x/ln x): minimum -2.18, maximum -0.74, at 10^9 -1.11
Squares curve: from -1.44 to -1.13</pre>
</div>
  </div>
</div>

That $\pi(x)/\operatorname{li}(x)$ tends to 1 is the **prime number theorem**,
proved in 1896, independently, by Hadamard and by de la Vallée Poussin. The
Riemann hypothesis is about the right-hand column: **the size of the error**.

## Euler's bridge

The link between primes and the zeta function is Euler's, from 1737, and it
is the most beautiful thing in this post. For $s > 1$, define

$$
\zeta(s) = \sum_{n=1}^{\infty} \frac{1}{n^s} = 1 + \frac{1}{2^s} + \frac{1}{3^s} + \frac{1}{4^s} + \cdots
$$

Euler noticed that this sum over **all the integers** equals a product over
**the primes**:

$$
\zeta(s) = \prod_{p \text{ prime}} \frac{1}{1 - p^{-s}}
= \frac{1}{1 - 2^{-s}} \cdot \frac{1}{1 - 3^{-s}} \cdot \frac{1}{1 - 5^{-s}} \cdots
$$

The reason is unique factorization. Each factor is a geometric series,
$1 + p^{-s} + p^{-2s} + \cdots$. Multiplying them all, each combination of
prime powers appears exactly once — and each combination of prime powers is
exactly one integer. The product "knows" which numbers are prime; the sum
doesn't seem to, but it's the same thing.

This means that anything discovered about $\zeta$ is, in some way,
information about the primes.

## What Riemann did in a short paper

In 1859, Bernhard Riemann published the only paper he wrote on number theory,
*On the Number of Primes Less Than a Given Magnitude*. It is short, and it did
two things.

The first was to extend $\zeta(s)$ to complex $s$. The sum only converges
when the real part of $s$ exceeds 1, but there is a single "smooth"
(analytic) way to define the function on the whole plane, except at $s = 1$.
This extension has zeros:

- the **trivial** ones, at $-2, -4, -6, \ldots$, which are easy and don't
  matter here;
- and the **nontrivial** ones, which all fall in the strip
  $0 < \operatorname{Re}(s) < 1$ — the *critical strip*. They come in pairs
  symmetric about the line $\operatorname{Re}(s) = 1/2$, the *critical line*,
  and about the real axis.

The second was an exact formula for counting primes from those zeros. I'll
get to it shortly.

And, in the middle of the paper, almost in passing, Riemann wrote that it is
"very probable" that all the nontrivial zeros lie on the critical line. And
he added (in my own translation): "A rigorous proof of this would of course
be desirable; I have, however, set aside the search for it for the time
being, after a few quick and futile attempts".[^riemann]

That was 167 years ago. The published and accepted attempts are still
futile (see the note at the top of the post).

## Seeing the zeros

At $s = \tfrac12 + it$, the function $\zeta$ returns a complex number. As $t$
goes from 0 to 34, that number traces a curve in the plane — and the curve
passes through the origin exactly at the zeros. I computed it with
[Arblib](https://github.com/kalmarek/Arblib.jl), in Julia, which uses
interval arithmetic, and with [mpmath](https://mpmath.org/), in Python; both
versions are in the code below the figure.

<figure>
  <a href="/assets/images/riemann-zeros-en.png" title="Open full size">
  <img src="/assets/images/riemann-zeros-en.avif" alt="On the left, the curve of zeta of one half plus i t in the complex plane for t from 0 to 34: a series of blue loops that pass repeatedly through the origin, marked in red; a gray curve, of zeta of 0.75 plus i t, makes similar loops but doesn't touch the origin in that range. On the right, the function Z of t, real, oscillating between −3.7 and 2.9 for t from 0 to 60 and crossing zero 13 times; the first three crossings are marked at 14.13, 21.02 and 25.01" />
  </a>
  <figcaption>
    <strong>Figure 1:</strong> on the left, the path of $\zeta(\tfrac12 + it)$ in the complex plane; each pass through the origin is a zero. In gray, the same path a little to the right of the critical line, at $\operatorname{Re}(s) = 0.75$, which doesn't touch the origin in that range (the smallest $\lvert \zeta \rvert$ there is 0.179). On the right, the function $Z(t)$, which has the same modulus as $\zeta(\tfrac12 + it)$ but is real, and therefore changes sign at each zero (at least at the simple ones, which are all the known ones). Generated by the Python code below. Click the image to see it full size.
  </figcaption>
</figure>

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
    <pre><code>using Arblib, Plots

# ζ(s) and Hardy's Z(t) function, computed by Arblib (interval arithmetic, result as Float64)
ζ(σ, t) = Arblib.fpwrap_zeta(ComplexF64(σ, t))
Z(t) = real(Arblib.fpwrap_hardy_z(ComplexF64(t)))   # real, with |Z(t)| = |ζ(1/2 + it)|

ts = range(0, 34, length = 4000)
on_line = ζ.(0.5, ts)
off_line = ζ.(0.75, ts)
println("Smallest |ζ(0.75 + it)| for t from 0 to 34: ", round(minimum(abs, off_line), digits = 3))

# Zeros of Z(t) in (0, 60]: sign changes on a fine grid, refined by bisection
function bisection(f, a, b; iter = 60)
    for _ in 1:iter
        m = (a + b) / 2
        sign(f(m)) == sign(f(a)) ? (a = m) : (b = m)
    end
    (a + b) / 2
end
grid = range(0.01, 60, length = 6000)
values = Z.(grid)
changes = findall(sign.(values[1:end-1]) .!= sign.(values[2:end]))
zeros_Z = [bisection(Z, grid[i], grid[i+1]) for i in changes]
println("Sign changes of Z(t) up to t = 60: ", length(zeros_Z), "; first ones: ", round.(zeros_Z[1:4], digits = 4))
println("Z(t) between t = 0 and 60: minimum ", round(minimum(values), digits = 2), ", maximum ", round(maximum(values), digits = 2))

# Figure 1
p1 = plot(real.(off_line), imag.(off_line), color = :gray, label = "ζ(0.75 + it)", aspect_ratio = :equal,
          xlabel = "real part", ylabel = "imaginary part", title = "ζ(s) for t from 0 to 34")
plot!(p1, real.(on_line), imag.(on_line), color = :royalblue, label = "ζ(1/2 + it)")
scatter!(p1, [0], [0], color = :red, label = "origin")
p2 = plot(grid, values, color = :royalblue, label = "Z(t)", xlabel = "t", title = "Z(t): a sign change at each zero")
hline!(p2, [0], color = :gray, label = "")
scatter!(p2, zeros_Z[1:3], zeros(3), color = :red, label = "14.13, 21.02, 25.01")
savefig(plot(p1, p2, layout = (1, 2), size = (1000, 430), margin = 4Plots.mm), "riemann_zeros_jl_en.png")</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">Smallest |ζ(0.75 + it)| for t from 0 to 34: 0.179
Sign changes of Z(t) up to t = 60: 13; first ones: [14.1347, 21.022, 25.0109, 30.4249]
Z(t) between t = 0 and 60: minimum -3.66, maximum 2.94</pre>
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
import matplotlib.pyplot as plt
from mpmath import zeta, siegelz

# ζ(s) and Hardy's Z(t) function, computed by mpmath
zeta_c = lambda s, t: complex(zeta(complex(s, t)))
Z = lambda t: float(siegelz(t))          # real, with |Z(t)| = |ζ(1/2 + it)|

ts = np.linspace(0, 34, 4000)
on_line = np.array([zeta_c(0.5, t) for t in ts])
off_line = np.array([zeta_c(0.75, t) for t in ts])
print(f"Smallest |ζ(0.75 + it)| for t from 0 to 34: {np.abs(off_line).min():.3f}")

# Zeros of Z(t) in (0, 60]: sign changes on a fine grid, refined by bisection
def bisection(f, a, b, iterations=60):
    fa = f(a)
    for _ in range(iterations):
        m = (a + b) / 2
        if np.sign(f(m)) == np.sign(fa):
            a = m
        else:
            b = m
    return (a + b) / 2

grid = np.linspace(0.01, 60, 6000)
values = np.array([Z(t) for t in grid])
changes = np.flatnonzero(np.sign(values[:-1]) != np.sign(values[1:]))
zeros_Z = [bisection(Z, grid[i], grid[i + 1]) for i in changes]
print(f"Sign changes of Z(t) up to t = 60: {len(zeros_Z)}; first ones: {np.round(zeros_Z[:4], 4)}")
print(f"Z(t) between t = 0 and 60: minimum {values.min():.2f}, maximum {values.max():.2f}")

# Figure 1
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4.3))
ax1.plot(off_line.real, off_line.imag, color="0.6", label="ζ(0.75 + it)")
ax1.plot(on_line.real, on_line.imag, color="royalblue", label="ζ(1/2 + it)")
ax1.plot(0, 0, "o", color="red", label="origin")
ax1.set_aspect("equal"); ax1.set_xlabel("real part"); ax1.set_ylabel("imaginary part")
ax1.set_title("ζ(s) for t from 0 to 34"); ax1.legend(loc="upper left")
ax2.plot(grid, values, color="royalblue", label="Z(t)")
ax2.axhline(0, color="0.6", lw=0.8)
ax2.plot(zeros_Z[:3], [0, 0, 0], "o", color="red", label="14.13, 21.02, 25.01")
ax2.set_xlabel("t"); ax2.set_title("Z(t): a sign change at each zero"); ax2.legend(loc="lower left")
fig.tight_layout(); fig.savefig("riemann_zeros_en.png", dpi=100)</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">Smallest |ζ(0.75 + it)| for t from 0 to 34: 0.179
Sign changes of Z(t) up to t = 60: 13; first ones: [14.1347 21.022  25.0109 30.4249]
Z(t) between t = 0 and 60: minimum -3.66, maximum 2.94</pre>
</div>
  </div>
</div>

(This block and the one for Volchkov's integral, further down, have no R
version: among the packages I use, R has no zeta function for complex
numbers.)

The first zero is at $t = 14.1347\ldots$; then come 21.0220, 25.0109,
30.4249... Up to $t = 60$ there are 13. They get closer and closer together:
the number of zeros up to height $T$ grows like
$\tfrac{T}{2\pi}\ln\tfrac{T}{2\pi e}$, so near $T$ the average distance
between two neighbors is $2\pi / \ln(T/2\pi)$. The 20,000th zero, the last one
I use, is at $t = 18{,}046.46$.

The right-hand panel is the trick used in practice. There is a real function,
$Z(t)$, with $\lvert Z(t)\rvert = \lvert \zeta(\tfrac12 + it)\rvert$. Finding zeros on the critical
line becomes finding sign changes of a real function — something that can be
certified with interval arithmetic. The formula for computing $Z(t)$ quickly
is the Riemann–Siegel formula, and it has a good story: Carl Siegel found it
in 1932 in unpublished manuscripts of Riemann's, from the 1850s.

The 20,000 zeros I use from here on come from Andrew Odlyzko's public table,
with the first 100,000 zeros accurate to $3 \times 10^{-9}$; the first ones
agree with Arblib's up to the last digit of the table. A caveat on method:
the table only gives the imaginary part of each zero, because the zeros are
searched for precisely on the critical line, as sign changes of $Z(t)$. The
real part 1/2 is by construction, not a measurement. What guarantees that no
zero escaped off the line up to that height is a different calculation:
comparing how many sign changes were found with how many zeros exist in total
below that height, which can be computed without knowing where they are
(that's Alan Turing's method, from 1953). For the first 20,000 this was done
long ago, and far beyond them, as I tell at the end. And, in any case, none of
this proves the hypothesis.

## The staircase rebuilt from waves

Now the part that turned the hypothesis, for me, from a curiosity into
something that makes sense.

Instead of $\pi(x)$, it's cleaner to work with Chebyshev's function,
$\psi(x)$: a staircase that goes up by $\ln p$ at each prime $p$ and at each
of its powers ($p^2, p^3, \ldots$). It carries the same information as
$\pi(x)$, and the prime number theorem simply becomes $\psi(x) \approx x$.

The explicit formula, which von Mangoldt proved in 1895 following Riemann's
path, says the staircase is **exactly** equal to

$$
\psi(x) = x \;-\; \sum_{\rho} \frac{x^{\rho}}{\rho} \;-\; \ln(2\pi) \;-\; \tfrac12 \ln\!\left(1 - x^{-2}\right),
$$

where the sum runs over all nontrivial zeros $\rho$, in conjugate pairs and in
increasing order of height, and $x$ is not a prime power (on top of a step,
the formula gives the midpoint of the jump). The $x$ term is the smooth
trend. Each zero adds a correction. Writing $\rho = \beta + i\gamma$, a zero
and its conjugate together contribute

$$
\frac{x^{\rho}}{\rho} + \frac{x^{\bar\rho}}{\bar\rho}
= \frac{2\, x^{\beta}}{|\rho|} \cos\!\left(\gamma \ln x - \arg \rho\right),
$$

a wave in $\ln x$ with frequency $\gamma$ and amplitude $x^{\beta}/\lvert \rho\rvert$.
The zeros are the frequencies of the music of the primes — the metaphor is
old, but here it is literal.

I did the calculation with the first 10 and the first 1,000 zeros:

<figure>
  <a href="/assets/images/riemann-primos-en.png" title="Open full size">
  <img src="/assets/images/riemann-primos-en.avif" alt="On the left, the staircase psi of x from 1.5 to 32, which steps up at each prime and each prime power; a gray curve made with 10 zeros follows the staircase in a wavy way, and a blue curve made with 1,000 zeros lies practically on top of it, with sharp steps. On the right, the sum of 1,000 cosines with the frequencies of the zeros: an almost flat line with sharp peaks exactly at 2, 3, 5, 7, 11, 13, 17, 19, 23, 29 and 31, and smaller peaks at 4, 8, 9, 16, 25 and 27" />
  </a>
  <figcaption>
    <strong>Figure 2:</strong> on the left, the staircase $\psi(x)$ counted directly (black), and rebuilt by the explicit formula with the first 10 (gray) and 1,000 (blue) zeros. On the right, only the waves: the sum of $-\cos(\gamma \ln x)$ over the first 1,000 zeros, divided by $\sqrt{x}$. The peaks fall on the primes (red) and, smaller, on the prime powers (gray). Generated by the Python code below. Click the image to see it full size.
  </figcaption>
</figure>

With ten zeros, the gray curve already knows roughly where the steps are.
With a thousand, the blue one sits on top of the staircase. And the
right-hand panel impressed me more than any explanation: add a thousand
cosines whose frequencies are the imaginary parts of the zeros, and peaks
appear at 2, 3, 5, 7, 11, 13... Nobody told the sum which numbers are prime.
The peaks at the powers are smaller than those at the neighboring primes
because the step at $p^k$ is $\ln p$, not $\ln p^k$: at 8 the staircase goes
up by $\ln 2$, just as at 2.

The code that reads the zeros and rebuilds $\psi(x)$:

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
    <pre><code>using Downloads, Plots

# Imaginary parts of the first 100,000 nontrivial zeros, from A. Odlyzko's table
# (University of Minnesota; accurate to 3 × 10⁻⁹). Downloads the file only once.
file = "zeros1"
isfile(file) || Downloads.download("https://www-users.cse.umn.edu/~odlyzko/zeta_tables/zeros1", file)
γ = parse.(Float64, readlines(file))
println("Zeros read: ", length(γ), "; first ones: ", γ[1:4], "; up to t = 60: ", count(&lt;=(60), γ),
        "; 20,000th: ", γ[20000])

# Explicit formula: ψ(x) from the zeros ρ = 1/2 + iγ (real part 1/2: see the text)
ψ_zeros(x, γ) = x - sum(2real(x^(0.5 + im * g) / (0.5 + im * g)) for g in γ) - log(2π) - log(1 - x^-2) / 2

# ψ(x) counted directly: adds ln p for each prime power pᵏ ≤ x
is_prime(n) = n ≥ 2 &amp;&amp; all(n % d != 0 for d in 2:isqrt(n))
function ψ_direct(x)
    total = 0.0
    for p in 2:floor(Int, x)
        is_prime(p) || continue
        q = p
        while q ≤ x
            total += log(p)
            q *= p
        end
    end
    total
end

println("ψ(30.5): direct = ", round(ψ_direct(30.5), digits = 3), ";  with 10 zeros = ",
        round(ψ_zeros(30.5, γ[1:10]), digits = 3), ";  with 1,000 zeros = ", round(ψ_zeros(30.5, γ[1:1000]), digits = 3))

# Figure 2: the staircase and the waves
xs = range(1.5, 32, length = 8000)
p1 = plot(xs, ψ_direct.(xs), color = :black, lw = 1.5, label = "ψ(x) counted", xlabel = "x", ylabel = "ψ(x)",
          title = "The staircase rebuilt from the zeros", legend = :topleft)
plot!(p1, xs, ψ_zeros.(xs, Ref(γ[1:10])), color = :gray, label = "10 zeros")
plot!(p1, xs, ψ_zeros.(xs, Ref(γ[1:1000])), color = :royalblue, label = "1,000 zeros")
waves = [-sum(cos(g * log(x)) for g in γ[1:1000]) / sqrt(x) for x in xs]
p2 = plot(xs, waves, color = :black, lw = 0.8, label = "", xlabel = "x", title = "Only the waves (1,000 zeros)")
vline!(p2, filter(is_prime, 2:31), color = :red, alpha = 0.4, label = "primes")
vline!(p2, [4, 8, 9, 16, 25, 27], color = :gray, alpha = 0.4, ls = :dash, label = "prime powers")
savefig(plot(p1, p2, layout = (1, 2), size = (1000, 420), margin = 4Plots.mm), "riemann_primos_jl_en.png")</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">Zeros read: 100000; first ones: [14.134725142, 21.022039639, 25.01085758, 30.424876126]; up to t = 60: 13; 20,000th: 18046.464296238
ψ(30.5): direct = 28.476;  with 10 zeros = 29.248;  with 1,000 zeros = 28.463</pre>
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
    <pre><code># Imaginary parts of the first 100,000 nontrivial zeros, from A. Odlyzko's table
# (University of Minnesota; accurate to 3 × 10⁻⁹). Downloads the file only once.
file &lt;- "zeros1"
if (!file.exists(file)) download.file("https://www-users.cse.umn.edu/~odlyzko/zeta_tables/zeros1", file)
gamma &lt;- scan(file, quiet = TRUE)
cat("Zeros read:", length(gamma), "; first ones:", gamma[1:4], "; up to t = 60:", sum(gamma &lt;= 60),
    "; 20,000th:", format(gamma[20000], nsmall = 9), "\n")

# Explicit formula: ψ(x) from the zeros ρ = 1/2 + iγ (real part 1/2: see the text)
psi_zeros &lt;- function(x, g) {
  rho &lt;- complex(real = 0.5, imaginary = g)
  x - sum(2 * Re(x^rho / rho)) - log(2 * pi) - log(1 - x^-2) / 2
}

# ψ(x) counted directly: adds ln p for each prime power pᵏ ≤ x
is_prime &lt;- function(n) n &gt;= 2 &amp;&amp; (n &lt; 4 || all(n %% 2:floor(sqrt(n)) != 0))
psi_direct &lt;- function(x) {
  total &lt;- 0
  for (p in 2:floor(x)) {
    if (!is_prime(p)) next
    q &lt;- p
    while (q &lt;= x) { total &lt;- total + log(p); q &lt;- q * p }
  }
  total
}

cat(sprintf("ψ(30.5): direct = %.3f;  with 10 zeros = %.3f;  with 1,000 zeros = %.3f\n",
            psi_direct(30.5), psi_zeros(30.5, gamma[1:10]), psi_zeros(30.5, gamma[1:1000])))

# Figure 2: the staircase and the waves
xs &lt;- seq(1.5, 32, length.out = 8000)
png("riemann_primos_r_en.png", width = 1000, height = 420)
par(mfrow = c(1, 2))
plot(xs, sapply(xs, psi_direct), type = "l", lwd = 1.5, xlab = "x", ylab = "ψ(x)", main = "The staircase rebuilt from the zeros")
lines(xs, sapply(xs, psi_zeros, g = gamma[1:10]), col = "gray")
lines(xs, sapply(xs, psi_zeros, g = gamma[1:1000]), col = "royalblue")
legend("topleft", c("ψ(x) counted", "10 zeros", "1,000 zeros"), col = c("black", "gray", "royalblue"), lwd = c(1.5, 1, 1))
waves &lt;- sapply(xs, function(x) -sum(cos(gamma[1:1000] * log(x))) / sqrt(x))
plot(xs, waves, type = "n", xlab = "x", ylab = "", main = "Only the waves (1,000 zeros)")
abline(v = Filter(is_prime, 2:31), col = adjustcolor("red", 0.4))
abline(v = c(4, 8, 9, 16, 25, 27), col = adjustcolor("gray40", 0.4), lty = 2)
lines(xs, waves, lwd = 0.8)
legend("topright", c("primes", "prime powers"), col = c("red", "gray40"), lty = c(1, 2))
invisible(dev.off())</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">Zeros read: 100000 ; first ones: 14.13473 21.02204 25.01086 30.42488 ; up to t = 60: 13 ; 20,000th: 18046.464296238 
ψ(30.5): direct = 28.476;  with 10 zeros = 29.248;  with 1,000 zeros = 28.463</pre>
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
    <pre><code>import os
import urllib.request
import numpy as np
import matplotlib.pyplot as plt

# Imaginary parts of the first 100,000 nontrivial zeros, from A. Odlyzko's table
# (University of Minnesota; accurate to 3 × 10⁻⁹). Downloads the file only once.
file = "zeros1"
if not os.path.exists(file):
    urllib.request.urlretrieve("https://www-users.cse.umn.edu/~odlyzko/zeta_tables/zeros1", file)
gamma = np.loadtxt(file)
print(f"Zeros read: {len(gamma)}; first ones: {gamma[:4]}; up to t = 60: {np.sum(gamma &lt;= 60)}; "
      f"20,000th: {gamma[19999]}")

# Explicit formula: ψ(x) from the zeros ρ = 1/2 + iγ (real part 1/2: see the text)
def psi_zeros(x, g):
    rho = 0.5 + 1j * g
    return x - np.sum(2 * (x**rho / rho).real) - np.log(2 * np.pi) - np.log(1 - x**-2.0) / 2

# ψ(x) counted directly: adds ln p for each prime power pᵏ ≤ x
def is_prime(n):
    return n &gt;= 2 and all(n % d for d in range(2, int(n**0.5) + 1))

def psi_direct(x):
    total = 0.0
    for p in range(2, int(x) + 1):
        if is_prime(p):
            q = p
            while q &lt;= x:
                total += np.log(p)
                q *= p
    return total

print(f"ψ(30.5): direct = {psi_direct(30.5):.3f};  with 10 zeros = {psi_zeros(30.5, gamma[:10]):.3f};  "
      f"with 1,000 zeros = {psi_zeros(30.5, gamma[:1000]):.3f}")

# Figure 2: the staircase and the waves
xs = np.linspace(1.5, 32, 8000)
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4.2))
ax1.plot(xs, [psi_direct(x) for x in xs], color="black", lw=1.5, label="ψ(x) counted")
ax1.plot(xs, [psi_zeros(x, gamma[:10]) for x in xs], color="gray", label="10 zeros")
ax1.plot(xs, [psi_zeros(x, gamma[:1000]) for x in xs], color="royalblue", label="1,000 zeros")
ax1.set_xlabel("x"); ax1.set_ylabel("ψ(x)"); ax1.set_title("The staircase rebuilt from the zeros"); ax1.legend(loc="upper left")
waves = [-np.sum(np.cos(gamma[:1000] * np.log(x))) / np.sqrt(x) for x in xs]
for p in [n for n in range(2, 32) if is_prime(n)]:
    ax2.axvline(p, color="red", alpha=0.4, lw=1)
for q in [4, 8, 9, 16, 25, 27]:
    ax2.axvline(q, color="gray", alpha=0.4, lw=1, ls="--")
ax2.plot(xs, waves, color="black", lw=0.8)
ax2.set_xlabel("x"); ax2.set_title("Only the waves (1,000 zeros)")
ax2.plot([], [], color="red", alpha=0.4, label="primes"); ax2.plot([], [], color="gray", ls="--", label="prime powers")
ax2.legend(loc="upper right")
fig.tight_layout(); fig.savefig("riemann_primos_en.png", dpi=100)</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">Zeros read: 100000; first ones: [14.13472514 21.02203964 25.01085758 30.42487613]; up to t = 60: 13; 20,000th: 18046.464296238
ψ(30.5): direct = 28.476;  with 10 zeros = 29.248;  with 1,000 zeros = 28.463</pre>
</div>
  </div>
</div>

At $x = 30.5$, the staircase is 28.476; with 10 zeros, the formula gives
29.248, and with 1,000, 28.463.

The `0.5` inside the formula is the Riemann hypothesis used as a shortcut: I
wrote the real part of every zero as 1/2. For these thousand, it is known to
hold (by the verification I mentioned above). But it's good to know the
hypothesis is in there, hidden in a literal.[^half]

## Why 1/2 matters

Now the "so what" from the beginning can be answered.

The amplitude of each zero's wave is $x^{\beta}/\lvert \rho\rvert$, and $\beta$ is the real
part of the zero. If all zeros have $\beta = 1/2$, every wave grows like
$\sqrt{x}$. The error in approximating the primes by the smooth curve is then
of the size of $\sqrt{x}$ — a bit more, because of the logarithm and the
number of waves.

If there were a single zero with $\beta = 0.8$, its wave would grow like
$x^{0.8}$ and, for large enough $x$, would swallow all the others. The primes
would stray from the smooth curve much more than we see. And you can't have a
single zero with $\beta < 1/2$ to "compensate": by symmetry, a zero at $\beta$
comes with one at $1 - \beta$, and one of the two is to the right of the line.

This was made precise by Helge von Koch in 1901: the Riemann hypothesis is
**equivalent** to

$$
\pi(x) = \operatorname{li}(x) + O\!\left(\sqrt{x}\,\ln x\right).
$$

Equivalent, in both directions. In 1976, Lowell Schoenfeld even gave the
constant: **if** the hypothesis is true, then for every $x \geq 2{,}657$,

$$
\left|\pi(x) - \operatorname{li}(x)\right| < \frac{\sqrt{x}\,\ln x}{8\pi}.
$$

At $x = 10^9$, this gives $31{,}623 \times 20.72 / 25.13 = 26{,}075$.

So the Riemann hypothesis is, at heart, the claim that the primes are as well
distributed as they could possibly be. The "1/2" is the exponent of the error.

I compared the actual count with this bound (the code is the sieve code, up
above):

<figure>
  <a href="/assets/images/riemann-erro-en.png" title="Open full size">
  <img src="/assets/images/riemann-erro-en.avif" alt="On the left, on a logarithmic scale from 3 thousand to 1 billion, a blue band that widens to about 26 thousand, Schoenfeld's bound, and inside it the difference between pi of x and li of x, a red line that slowly descends to about −1,700, almost glued to zero. On the right, the same difference divided by the square root of x over ln x: a red line oscillating between −2.2 and −0.7, slowly rising and ending near −1.1, always below zero, closely following a dashed curve that rises from −1.4 to −1.13" />
  </a>
  <figcaption>
    <strong>Figure 3:</strong> on the left, $\pi(x) - \operatorname{li}(x)$ counted up to $10^9$ (red) and the band in which the Riemann hypothesis forces this difference to stay (blue). On the right, the same difference measured in units of $\sqrt{x}/\ln x$, and, dashed, the deviation expected from the squares of primes alone, $-\tfrac12 \operatorname{li}(\sqrt{x})$. Both curves use 300 values of $x$ spaced on a logarithmic scale. Generated by the Python sieve code. Click the image to see it full size.
  </figcaption>
</figure>

On the left, huge slack: at one billion, the error is 1,701 and the bound
allows 26,075. The right-hand panel shows that the error really is of the size
of $\sqrt{x}/\ln x$ — it neither vanishes nor blows up — and that it stays
stubbornly **negative**, fluctuating between −2.18 and −0.74 and ending at
−1.11.

That −1 has an explanation, and it made me like the explicit formula even
more. $\operatorname{li}(x)$ is, in fact, the natural approximation for a count
that includes prime powers with weights: squares of primes count with weight
1/2, cubes with 1/3... Since $\pi(x)$ counts only primes, it sits below
$\operatorname{li}(x)$ by about $\tfrac12 \operatorname{li}(\sqrt{x})$, the
dashed line. For very large $x$, this is $\approx \sqrt{x}/\ln x$, the −1; but
the approximation $\operatorname{li}(y) \approx y / \ln y$ converges slowly,
which is why the line starts at −1.44 at $x = 3{,}000$ and only reaches −1.13
at $10^9$. The red curve sits a little below the dashed one (the cubes of
primes and the following terms pull it down a bit more), and the oscillations
around it are the waves of the zeros.

## Data lie (sometimes for a long time)

Looking at the table and at Figure 3, any reasonable person would bet that
$\pi(x) < \operatorname{li}(x)$ always. The inequality has been verified for
every $x$ up to $10^{19}$.

And it is false. In 1914, John Littlewood proved that
$\pi(x) - \operatorname{li}(x)$ changes sign **infinitely many times**. The
bias seen in Figure 3 is real, but every now and then the waves of the zeros
line up and beat the bias. Nobody has found the first sign change: it is
known that there is none before $10^{19}$ and that there is one before
$1.4 \times 10^{316}$. The first upper bound, by Stanley Skewes in 1933 —
and assuming the Riemann hypothesis itself — was
$e^{e^{e^{79}}} < 10^{10^{10^{34}}}$: a number whose number of digits itself
has more than $10^{34}$ digits.

For a statistics blog, this is perhaps the most useful lesson in the post. A
billion cases in favor, a regularity that lasts as far as the eye can see,
and the claim is false. The primes have scales at which things happen that are
simply too large to sample.

That is why mathematicians are not satisfied with the fact that the Riemann
hypothesis was verified, rigorously, by David Platt and Tim Trudgian in 2021,
for all zeros up to height $3 \times 10^{12}$: by the counting formula above,
about 12 trillion zeros. It is evidence. It is not proof.

## A histogram that came from physics

The last thing I did was the one I least expected to lead anywhere.

If the primes behave "as if they were random", maybe the zeros do too. I took
the 20,000 zeros, corrected for the fact that they get closer together (using
the counting formula above, so that the average distance becomes 1) and made
the histogram of the distances between neighbors. I did the same with the
1,080,193 primes between $10^8$ and $1.2 \times 10^8$:

<figure>
  <a href="/assets/images/riemann-espacamentos-en.png" title="Open full size">
  <img src="/assets/images/riemann-espacamentos-en.avif" alt="On the left, the histogram of gaps between consecutive primes, in units of the mean: the bars decrease from near zero and follow the exponential curve e to the minus s. On the right, the histogram of gaps between consecutive zeros: almost nothing near zero, a peak near 0.9 and almost nothing after 2.5, closely following a red curve shaped like a lopsided bell, Wigner's approximation for GUE random matrices; the dashed exponential doesn't resemble the histogram" />
  </a>
  <figcaption>
    <strong>Figure 4:</strong> on the left, gaps between consecutive primes, in units of the mean gap, compared with $e^{-s}$, the distribution for points scattered at random and independently. On the right, gaps between consecutive zeros, compared with the same $e^{-s}$ (dashed) and with the prediction of random matrix theory (red). The prime bars group three even gaps each, because the distance between two odd primes is always even. Generated by the Python code below. Click the image to see it full size.
  </figcaption>
</figure>

The primes, on the left, look like points thrown at random: small gaps are
the most common, and the bars follow the exponential.[^cramer] But grouping
three by three hides a fine structure. Looking gap by gap, 2 and 4 each
appear in 7.1% of the pairs, and 6 in 12.6%, almost double. The culprit is 3:
for $p$ and $p + 2$ to be prime (with $p > 3$), $p$ must leave remainder 2 when
divided by 3 (otherwise $p$ or $p + 2$ is a multiple of 3), and for $p + 4$,
remainder 1; whereas $p + 6$ leaves the same remainder as $p$, so it is never
ruled out by this. For that reason, counting only gaps below a quarter of the
mean (2 and 4, since the mean is 18.5), the primes get 14.3% of the pairs,
against $1 - e^{-1/4} = 22.1\%$ for random points.

The zeros, on the right, are something else. They **repel each other**: they
almost never get very close. Only 1.07% of neighboring pairs are less than a
quarter of the average distance apart. The red curve, Wigner's approximation
for the GUE, $p(s) = \tfrac{32}{\pi^2} s^2 e^{-4s^2/\pi}$, predicts 1.61%; the
difference shrinks with height (in the first 5,000 zeros, 0.94%; in the last
5,000, 1.22%).

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
    <pre><code>using Statistics, Plots, Downloads

# Gaps between consecutive primes from 10⁸ to 1.2 × 10⁸ (sieve of Eratosthenes)
function crivo(n)
    is_prime = trues(n); is_prime[1] = false
    for i in 2:isqrt(n)
        is_prime[i] || continue
        for j in i*i:i:n
            is_prime[j] = false
        end
    end
    is_prime
end
is_prime = crivo(12 * 10^7)
primes = findall(is_prime[10^8:12*10^7]) .+ (10^8 - 1)
d = diff(primes)
mean_gap = mean(d)
println("Primes: ", length(primes), "; mean gap ", round(mean_gap, digits = 2))
println("Fraction with gap 2: ", round(100mean(d .== 2), digits = 1), "%;  4: ", round(100mean(d .== 4), digits = 1),
        "%;  6: ", round(100mean(d .== 6), digits = 1), "%")
println("Primes below 1/4 of the mean: ", round(100mean(d ./ mean_gap .&lt; 0.25), digits = 1),
        "%   (random points: ", round(100(1 - exp(-0.25)), digits = 1), "%)")

# Gaps between consecutive zeros (first 20,000), on the scale where the mean is 1:
# N(t) ≈ (t/2π) ln(t/2πe) counts the zeros up to height t
file = "zeros1"
isfile(file) || Downloads.download("https://www-users.cse.umn.edu/~odlyzko/zeta_tables/zeros1", file)
γ = parse.(Float64, readlines(file))[1:20000]
u = γ ./ (2π) .* log.(γ ./ (2π * ℯ))
s = diff(u)
println("Zeros below 1/4 of the mean: ", round(100mean(s .&lt; 0.25), digits = 2), "%  (first 5,000: ",
        round(100mean(s[1:4999] .&lt; 0.25), digits = 2), "%; last 5,000: ", round(100mean(s[end-4999:end] .&lt; 0.25), digits = 2), "%)")
wigner(x) = 32 / π^2 * x^2 * exp(-4x^2 / π)     # Wigner's approximation for the GUE
# P(s &lt; 1/4) under Wigner's approximation (numerical integral by the midpoint rule)
h = 0.25 / 10_000
println("Wigner's approximation, P(s &lt; 1/4) = ", round(100sum(wigner((k - 0.5) * h) for k in 1:10_000) * h, digits = 2), "%")

# Figure 4
width = 6 / mean_gap                          # each bar groups three even gaps (2, 4, 6; 8, 10, 12; ...)
p1 = histogram(d ./ mean_gap, bins = 0:width:4, normalize = :pdf, color = :gray70, label = "primes",
               xlabel = "gap / mean", title = "Consecutive primes (10⁸ to 1.2 × 10⁸)")
plot!(p1, x -&gt; exp(-x), 0, 4, color = :black, lw = 2, label = "e^(−s)")
p2 = histogram(s, bins = 0:0.1:4, normalize = :pdf, color = :lightblue, label = "zeros",
               xlabel = "gap / mean", title = "Consecutive zeros (first 20,000)")
plot!(p2, x -&gt; exp(-x), 0, 4, color = :black, ls = :dash, label = "e^(−s)")
plot!(p2, wigner, 0, 4, color = :red, lw = 2, label = "Wigner (GUE)")
savefig(plot(p1, p2, layout = (1, 2), size = (1000, 420), margin = 4Plots.mm), "riemann_espacamentos_jl_en.png")</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">Primes: 1080193; mean gap 18.52
Fraction with gap 2: 7.1%;  4: 7.1%;  6: 12.6%
Primes below 1/4 of the mean: 14.3%   (random points: 22.1%)
Zeros below 1/4 of the mean: 1.07%  (first 5,000: 0.94%; last 5,000: 1.22%)
Wigner's approximation, P(s &lt; 1/4) = 1.61%</pre>
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
    <pre><code># Gaps between consecutive primes from 10⁸ to 1.2 × 10⁸ (sieve of Eratosthenes)
N &lt;- 12e7
is_prime &lt;- rep(TRUE, N); is_prime[1] &lt;- FALSE
for (i in 2:floor(sqrt(N))) if (is_prime[i]) is_prime[seq(i * i, N, by = i)] &lt;- FALSE
primes &lt;- which(is_prime[1e8:N]) + 1e8 - 1
rm(is_prime)
d &lt;- diff(primes)
mean_gap &lt;- mean(d)
cat(sprintf("Primes: %d; mean gap %.2f\n", length(primes), mean_gap))
cat(sprintf("Fraction with gap 2: %.1f%%;  4: %.1f%%;  6: %.1f%%\n", 100 * mean(d == 2), 100 * mean(d == 4), 100 * mean(d == 6)))
cat(sprintf("Primes below 1/4 of the mean: %.1f%%   (random points: %.1f%%)\n",
            100 * mean(d / mean_gap &lt; 0.25), 100 * (1 - exp(-0.25))))

# Gaps between consecutive zeros (first 20,000), on the scale where the mean is 1:
# N(t) ≈ (t/2π) ln(t/2πe) counts the zeros up to height t
file &lt;- "zeros1"
if (!file.exists(file)) download.file("https://www-users.cse.umn.edu/~odlyzko/zeta_tables/zeros1", file)
gamma &lt;- scan(file, quiet = TRUE)[1:20000]
u &lt;- gamma / (2 * pi) * log(gamma / (2 * pi * exp(1)))
s &lt;- diff(u)
cat(sprintf("Zeros below 1/4 of the mean: %.2f%%  (first 5,000: %.2f%%; last 5,000: %.2f%%)\n",
            100 * mean(s &lt; 0.25), 100 * mean(s[1:4999] &lt; 0.25), 100 * mean(tail(s, 5000) &lt; 0.25)))
wigner &lt;- function(x) 32 / pi^2 * x^2 * exp(-4 * x^2 / pi)   # Wigner's approximation for the GUE
cat(sprintf("Wigner's approximation, P(s &lt; 1/4) = %.2f%%\n", 100 * integrate(wigner, 0, 0.25)$value))

# Figure 4
width &lt;- 6 / mean_gap                       # each bar groups three even gaps (2, 4, 6; 8, 10, 12; ...)
png("riemann_espacamentos_r_en.png", width = 1000, height = 420)
par(mfrow = c(1, 2))
hist(d[d / mean_gap &lt; 4] / mean_gap, breaks = seq(0, 4 + width, by = width), freq = FALSE, col = "gray80",
     border = "white", xlim = c(0, 4), xlab = "gap / mean", main = "Consecutive primes (10⁸ to 1.2 × 10⁸)")
curve(exp(-x), 0, 4, add = TRUE, lwd = 2)
legend("topright", c("primes", "e^(−s)"), fill = c("gray80", NA), border = NA, lwd = c(NA, 2))
hist(s[s &lt; 4], breaks = seq(0, 4, by = 0.1), freq = FALSE, col = "lightblue", border = "white",
     xlab = "gap / mean", main = "Consecutive zeros (first 20,000)", ylim = c(0, 1.05))
curve(exp(-x), 0, 4, add = TRUE, lty = 2)
curve(wigner(x), 0, 4, add = TRUE, col = "red", lwd = 2)
legend("topright", c("zeros", "e^(−s)", "Wigner (GUE)"), fill = c("lightblue", NA, NA), border = NA,
       col = c(NA, "black", "red"), lty = c(NA, 2, 1), lwd = c(NA, 1, 2))
invisible(dev.off())</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">Primes: 1080193; mean gap 18.52
Fraction with gap 2: 7.1%;  4: 7.1%;  6: 12.6%
Primes below 1/4 of the mean: 14.3%   (random points: 22.1%)
Zeros below 1/4 of the mean: 1.07%  (first 5,000: 0.94%; last 5,000: 1.22%)
Wigner's approximation, P(s &lt; 1/4) = 1.61%</pre>
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
    <pre><code>import os
import urllib.request
import numpy as np
import matplotlib.pyplot as plt

# Gaps between consecutive primes from 10⁸ to 1.2 × 10⁸ (sieve of Eratosthenes)
N = 12 * 10**7
is_prime = np.ones(N + 1, dtype=bool)
is_prime[:2] = False
for i in range(2, int(N**0.5) + 1):
    if is_prime[i]:
        is_prime[i * i::i] = False
primes = np.flatnonzero(is_prime[10**8:]) + 10**8
d = np.diff(primes)
mean_gap = d.mean()
print(f"Primes: {len(primes)}; mean gap {mean_gap:.2f}")
print(f"Fraction with gap 2: {100 * np.mean(d == 2):.1f}%;  4: {100 * np.mean(d == 4):.1f}%;  6: {100 * np.mean(d == 6):.1f}%")
print(f"Primes below 1/4 of the mean: {100 * np.mean(d / mean_gap &lt; 0.25):.1f}%   "
      f"(random points: {100 * (1 - np.exp(-0.25)):.1f}%)")

# Gaps between consecutive zeros (first 20,000), on the scale where the mean is 1:
# N(t) ≈ (t/2π) ln(t/2πe) counts the zeros up to height t
file = "zeros1"
if not os.path.exists(file):
    urllib.request.urlretrieve("https://www-users.cse.umn.edu/~odlyzko/zeta_tables/zeros1", file)
gamma = np.loadtxt(file)[:20000]
u = gamma / (2 * np.pi) * np.log(gamma / (2 * np.pi * np.e))
s = np.diff(u)
print(f"Zeros below 1/4 of the mean: {100 * np.mean(s &lt; 0.25):.2f}%  (first 5,000: "
      f"{100 * np.mean(s[:4999] &lt; 0.25):.2f}%; last 5,000: {100 * np.mean(s[-5000:] &lt; 0.25):.2f}%)")
wigner = lambda x: 32 / np.pi**2 * x**2 * np.exp(-4 * x**2 / np.pi)   # Wigner's approximation for the GUE
# P(s &lt; 1/4) under Wigner's approximation (numerical integral by the midpoint rule)
h = 0.25 / 10_000
print(f"Wigner's approximation, P(s &lt; 1/4) = {100 * np.sum(wigner((np.arange(1, 10_001) - 0.5) * h)) * h:.2f}%")

# Figure 4
width = 6 / mean_gap                          # each bar groups three even gaps (2, 4, 6; 8, 10, 12; ...)
x = np.linspace(0, 4, 400)
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4.2))
ax1.hist(d / mean_gap, bins=np.arange(0, 4 + width, width), density=True, color="0.75", label="primes")
ax1.plot(x, np.exp(-x), color="black", lw=2, label="e^(−s)")
ax1.set_xlim(0, 4); ax1.set_xlabel("gap / mean"); ax1.set_title("Consecutive primes (10⁸ to 1.2 × 10⁸)"); ax1.legend()
ax2.hist(s, bins=np.arange(0, 4.05, 0.1), density=True, color="lightblue", label="zeros")
ax2.plot(x, np.exp(-x), color="black", ls="--", label="e^(−s)")
ax2.plot(x, wigner(x), color="red", lw=2, label="Wigner (GUE)")
ax2.set_xlim(0, 4); ax2.set_xlabel("gap / mean"); ax2.set_title("Consecutive zeros (first 20,000)"); ax2.legend()
fig.tight_layout(); fig.savefig("riemann_espacamentos_en.png", dpi=100)</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">Primes: 1080193; mean gap 18.52
Fraction with gap 2: 7.1%;  4: 7.1%;  6: 12.6%
Primes below 1/4 of the mean: 14.3%   (random points: 22.1%)
Zeros below 1/4 of the mean: 1.07%  (first 5,000: 0.94%; last 5,000: 1.22%)
Wigner's approximation, P(s &lt; 1/4) = 1.61%</pre>
</div>
  </div>
</div>

The red curve that fits the zeros so well didn't come from number theory. It
comes from random matrix theory, used in physics: it describes the distance
between eigenvalues of large random Hermitian matrices — the *Gaussian
unitary ensemble*, or GUE.

The connection was discovered almost by chance. In 1972, visiting the
Institute for Advanced Study in Princeton, Hugh Montgomery showed the
physicist Freeman Dyson a result on the correlation between pairs of zeros.
Dyson recognized the formula: it was the same as for the eigenvalues of
random Hermitian matrices. In the 1980s, Andrew Odlyzko computed millions of
zeros at enormous heights and the fit was confirmed.

Nobody knows exactly why. An old idea, due to Hilbert and Pólya, is that the
zeros are the eigenvalues of some still unknown operator; if that operator is
of the right kind (self-adjoint), the eigenvalues would be real, and that is
precisely the Riemann hypothesis. The statistics of Figure 4 are a hint that
this idea may be more than just beautiful. But it's a hint.

## So, what is known

To separate what is proved from what is merely very likely:

- **Proved:** there are infinitely many zeros on the critical line (Hardy,
  1914), and a positive proportion of them are there — today, more than
  5/12, or 41.6% (the improvements come from the work of Selberg, Levinson and
  Conrey, and the 5/12 is due to Pratt, Robles, Zaharescu and Zeindler).
- **Proved:** there are no zeros on the line $\operatorname{Re}(s) = 1$. This
  is essentially the prime number theorem.
- **Verified numerically, rigorously:** all zeros up to height
  $3 \times 10^{12}$ are on the line.
- **Open** (according to the Clay Institute, at the date of this revision):
  everything else.

The hypothesis is part of the eighth of the 23 problems David Hilbert proposed
in 1900, and it is one of the Clay Institute's Millennium Problems, announced
in 2000, with a prize of one million dollars. Every now and then a proof is
announced; as of the date of this revision, none had been published and
accepted (see the note at the top of the post).

## The hypothesis in a single integral

The hypothesis also shows up in disguise, in formulations that resemble
neither primes nor zeros. My favorite is V. V. Volchkov's, from 1995: it is
equivalent to a single equality between numbers.

$$
\int_0^{\infty} \frac{1 - 12t^2}{(1 + 4t^2)^3} \int_{1/2}^{\infty} \ln\left|\zeta(\sigma + it)\right| \, d\sigma \, dt = \frac{\pi\,(3 - \gamma)}{32}
$$

If this computation gives exactly the number on the right, all nontrivial
zeros are on the critical line; if not, some zero is off it. It looks
arbitrary, but every piece has a role.

<figure>
  <a href="/assets/images/riemann-volchkov-en.png" title="Open full size">
  <img src="/assets/images/riemann-volchkov-en.avif" alt="On the left, a color map of ln of the modulus of zeta on the rectangle sigma 0 to 3 and t 0 to 40: dark blue bands, like wells, come out of each zero on the line sigma equal to one half, marked in black at t equal to 14.13, 21.02, 25.01, 30.42, 32.94 and 37.59; a red peak sits at s equal to 1, next to the axis; to the right of sigma equal to 2 everything is almost white, near zero. Top right, the inner integral I of t, which starts at 2.57, oscillates between −2 and 1.4 and has downward spikes at each zero, and the weight, multiplied by 5, which starts at 5, turns negative right after t equal to 0.29 and is practically zero by t equal to 3. Bottom right, the modulus of their product on a logarithmic scale: about 2.6 at t equal to 0, dropping below one hundred thousandth after the first zero" />
  </a>
  <figcaption>
    <strong>Figure 5:</strong> the pieces of Volchkov's integral. On the left, $\ln\lvert \zeta(\sigma + it)\rvert$: blue where $\lvert \zeta\rvert < 1$, red where $\lvert \zeta\rvert > 1$; the zeros (black dots, on the line $\sigma = \tfrac12$) are wells, and the pole at $s = 1$ is a peak. Top right, the inner integral, $I(t)$, and the weight. Bottom, the modulus of their product, on a logarithmic scale: that is what the outer integral adds up. Generated by the Python code below. Click the image to see it full size.
  </figcaption>
</figure>

**The logarithm, $\ln\lvert \zeta(\sigma + it)\rvert$.** At a zero, $\lvert \zeta\rvert = 0$ and
the logarithm goes to $-\infty$: each zero becomes a well. At the pole $s = 1$,
$\lvert \zeta\rvert$ goes to infinity and the logarithm becomes a peak. Away from both,
$\ln\lvert \zeta\rvert$ is the real part of $\ln \zeta$, an analytic function, and so it
behaves like an electric potential in the plane, in which the zeros and the
pole play the role of charges. That is the reason for using the logarithm:
integrals of a potential "feel" the charges inside the region, and complex
analysis has exact tools for counting those charges from the integrals.

**The inner integral, from $\sigma = \tfrac12$ to $\infty$.** For each height
$t$, it moves horizontally, from the critical line to the right. That is
exactly the half of the critical strip where a zero off the line would have to
appear: since zeros come in symmetric pairs, $\beta$ and $1 - \beta$, if there
is one off the line, one of the two is to its right. To the right of
$\sigma = 1$ there are no zeros (the Euler product guarantees it), and further
still $\zeta(s) \to 1$, the logarithm goes to zero and the integral converges
without trouble: at $\sigma = 45$, $\ln\lvert \zeta\rvert$ is already
$3 \times 10^{-14}$. In the top plot, the blue curve is the result, $I(t)$: it
has a downward spike at each zero, the trace of the well sitting at the left
edge.

**The weight, $\dfrac{1 - 12t^2}{(1 + 4t^2)^3}$.** This is the piece that looks
most arbitrary and is the cleverest. It is exactly the real part of
$1/(1 + 2it)^3$, and, on the critical line, $1 + 2it = 2s$. In other words:
the weight is the real part of $1/(8s^3)$, an analytic function whose only pole
is at $s = 0$, to the left of the whole region the integral covers. That is why
it creates no new singularities on the right side, and the double integral can
be computed exactly with the tools of complex analysis: the only singularities
that count are those of $\zeta$ itself. The cube makes the weight decay like
$t^{-4}$, fast enough for everything to converge. The weight is 1 at $t = 0$,
changes sign at $t = 1/\sqrt{12} \approx 0.29$ and, by $t = 3$, is
practically zero on the scale of the plot.

**The outer integral, from $t = 0$ to $\infty$.** Only the top half, because
the bottom half is the same: $\lvert \zeta(\sigma - it)\rvert = \lvert \zeta(\sigma + it)\rvert$, and
the weight is even. With this symmetry, the two integrals together cover the
whole half-plane to the right of the critical line.

**The right-hand side, $\pi(3 - \gamma)/32$.** It is what the integral equals
if the only singularity of $\zeta$ on the right side is the pole at $s = 1$.
The $\gamma$ here is the Euler–Mascheroni constant, 0.5772..., not the height
of a zero: it appears because it is the constant term of $\zeta$ near the
pole, $\zeta(s) = \frac{1}{s - 1} + \gamma + \cdots$. The rest of the number
comes from doing that computation with the chosen weight.

**And the equivalence.** Each zero off the line, if it existed, would add its
own term to the computation, and the point of Volchkov's theorem is that those
terms cannot cancel out. If the equality holds, there is none. If it doesn't,
there is at least one. The underlying idea is that of Jensen's formula, which
counts the zeros of a function inside a circle by integrating
$\ln\lvert f\rvert$, and of Littlewood's lemma, which does the same in a rectangle;
here it is applied to an infinite region, with a weight chosen so that the
computation closes. In 2012, Sekatskii, Beltraminelli and Merlini studied a
whole family of equalities of this kind, all equivalent to the hypothesis.

I computed the integral cut off at $t = 300$: it came out at 0.237856295867,
against 0.237856295887 on the right-hand side, a difference in the 11th
decimal place.[^volchkov] It looks like a confirmation, but the bottom panel of
Figure 5 shows where the value comes from. The product of the weight and the
inner integral is 2.57 at $t = 0$ and drops below $10^{-5}$ after the first
zero. Added up, everything beyond $t = 14.13$ contributes 0.00000095, about
four millionths of the total. The integral is decided almost entirely near
$t = 0$, where there is no zero at all. A zero off the line at a height of
$10^{20}$ (below $3 \times 10^{12}$ it is already known there are none) would
change a decimal place no computer can reach. The equality is exact, and it
is useless as a test: once again, computation is no substitute for proof.

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
    <pre><code>using Arblib, QuadGK, Downloads, Plots

# ln|ζ(σ + it)|, with ζ computed by Arblib
ln_abs_ζ(σ, t) = log(abs(Arblib.fpwrap_zeta(ComplexF64(σ, t))))

# Inner integral: I(t) = ∫ from 1/2 to ∞ of ln|ζ(σ + it)| dσ, cut at σ = 45
# (there, ln|ζ| is already of order 10⁻¹⁴); σ = 1 is a break point because of the pole
I(t) = quadgk(σ -&gt; ln_abs_ζ(σ, t), 0.5, 1.0, 45.0; rtol = 1e-12)[1]
weight(t) = (1 - 12t^2) / (1 + 4t^2)^3

# Outer integral, from 0 to 300, split at the heights of the zeros (where ln|ζ| is singular at the edge σ = 1/2)
file = "zeros1"
isfile(file) || Downloads.download("https://www-users.cse.umn.edu/~odlyzko/zeta_tables/zeros1", file)
γ = parse.(Float64, readlines(file))
cuts = vcat(0.0, 1 / sqrt(12), 3.0, filter(&lt;(300), γ), 300.0)
parts = [quadgk(t -&gt; weight(t) * I(t), cuts[k], cuts[k+1]; rtol = 1e-12)[1] for k in 1:length(cuts)-1]
total = sum(parts)
right_side = π * (3 - Base.MathConstants.eulergamma) / 32
println("Integral (t up to 300) = ", round(total, digits = 12))
println("π(3 − γ)/32          = ", round(right_side, digits = 12), "   difference: ", total - right_side)
println("I(0) = ", round(I(0.0), digits = 4), ";  contribution of t &gt; 14.13: ", sum(parts[findfirst(==(γ[1]), cuts):end]))
println("weight(300) = ", weight(300.0))

# Figure 5
σs, ts = range(0, 3, length = 200), range(0, 40, length = 300)
colormap = [clamp(ln_abs_ζ(σ, t), -4, 4) for t in ts, σ in σs]
p1 = heatmap(σs, ts, colormap, color = cgrad(:RdBu, rev = true), clims = (-4, 4), xlabel = "σ", ylabel = "t", title = "ln|ζ(σ + it)|")
scatter!(p1, fill(0.5, 6), γ[1:6], color = :black, markersize = 3, label = "zeros")
tt = range(0, 40, length = 800)
It = I.(tt)
p2 = plot(tt, It, color = :royalblue, label = "I(t)", title = "Inner integral and weight", xlabel = "t")
plot!(p2, tt, 5 .* weight.(tt), color = :darkorange, label = "5 × weight")
p3 = plot(tt, abs.(weight.(tt) .* It) .+ 1e-16, yscale = :log10, color = :black, label = "|weight × I(t)|",
          xlabel = "t", title = "What the outer integral adds up")
savefig(plot(p1, p2, p3, layout = @layout([a [b; c]]), size = (1000, 600), margin = 4Plots.mm), "riemann_volchkov_jl_en.png")</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">Integral (t up to 300) = 0.237856295867
π(3 − γ)/32          = 0.237856295887   difference: -1.9520135507988812e-11
I(0) = 2.5678;  contribution of t &gt; 14.13: 9.527790594390683e-7
weight(300) = -2.3147933814693353e-11</pre>
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
    <pre><code>import os
import urllib.request
import numpy as np
import matplotlib.pyplot as plt
from mpmath import zeta
from scipy.integrate import quad

# ln|ζ(σ + it)|, with ζ computed by mpmath
ln_abs_zeta = lambda s, t: float(np.log(abs(complex(zeta(complex(s, t))))))

# Inner integral: I(t) = ∫ from 1/2 to ∞ of ln|ζ(σ + it)| dσ, cut at σ = 45
# (there, ln|ζ| is already of order 10⁻¹⁴); σ = 1 is a break point because of the pole
def I(t):
    return sum(quad(lambda s: ln_abs_zeta(s, t), a, b, epsabs=1e-13, epsrel=1e-11, limit=200)[0]
               for a, b in [(0.5, 1.0), (1.0, 45.0)])
weight = lambda t: (1 - 12 * t**2) / (1 + 4 * t**2) ** 3

# Outer integral, split at the heights of the zeros (where ln|ζ| is singular at the edge σ = 1/2).

file = "zeros1"
if not os.path.exists(file):
    urllib.request.urlretrieve("https://www-users.cse.umn.edu/~odlyzko/zeta_tables/zeros1", file)
gamma = np.loadtxt(file)
T = 300.0
cuts = [0.0, 1 / np.sqrt(12), 3.0] + [g for g in gamma if g &lt; T] + [T]
parts = [quad(lambda t: weight(t) * I(t), a, b, epsabs=1e-14, epsrel=1e-11, limit=200)[0]
          for a, b in zip(cuts[:-1], cuts[1:])]
total = sum(parts)
right_side = np.pi * (3 - np.euler_gamma) / 32
print(f"Integral (t up to {T:.0f}) = {total:.12f}")
print(f"π(3 − γ)/32          = {right_side:.12f}   difference: {total - right_side:.3e}")
print(f"I(0) = {I(0.0):.4f};  contribution of t &gt; 14.13: {sum(parts[3:]):.4e}")

# Figure 5
sigmas, ts = np.linspace(0, 3, 120), np.linspace(0, 40, 200)
colormap = np.array([[np.clip(ln_abs_zeta(s, t), -4, 4) for s in sigmas] for t in ts])
tt = np.linspace(0, 40, 400)
It = np.array([I(t) for t in tt])
fig = plt.figure(figsize=(10, 6))
ax1 = fig.add_subplot(1, 2, 1)
im = ax1.pcolormesh(sigmas, ts, colormap, cmap="RdBu_r", vmin=-4, vmax=4, shading="auto")
fig.colorbar(im, ax=ax1)
ax1.plot([0.5] * 6, gamma[:6], "o", color="black", ms=3, label="zeros")
ax1.set_xlabel("σ"); ax1.set_ylabel("t"); ax1.set_title("ln|ζ(σ + it)|"); ax1.legend(loc="upper right")
ax2 = fig.add_subplot(2, 2, 2)
ax2.plot(tt, It, color="royalblue", label="I(t)")
ax2.plot(tt, 5 * weight(tt), color="darkorange", label="5 × weight")
ax2.set_xlabel("t"); ax2.set_title("Inner integral and weight"); ax2.legend()
ax3 = fig.add_subplot(2, 2, 4)
ax3.semilogy(tt, np.abs(weight(tt) * It) + 1e-16, color="black", label="|weight × I(t)|")
ax3.set_xlabel("t"); ax3.set_title("What the outer integral adds up"); ax3.legend()
fig.tight_layout(); fig.savefig("riemann_volchkov_en.png", dpi=100)</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">Integral (t up to 300) = 0.237856295867
π(3 − γ)/32          = 0.237856295887   difference: -1.952e-11
I(0) = 2.5678;  contribution of t &gt; 14.13: 9.5278e-07</pre>
</div>
  </div>
</div>

---

What I take from this post is not the prize. It's the explicit formula: the
primes, which seem to have no rule, are a smooth trend plus a sum of waves,
and the frequencies of the waves are the zeros of a single function. The
Riemann hypothesis says all these waves grow at the same pace, $\sqrt{x}$.
None shouts louder than the others.

Riemann found this "very probable" after checking a few zeros. I used 20,000
with a computer and I think the same. We could both be wrong — the primes have
fooled better people —, but, if so, it will be from a height neither of us
will ever see.

## References

- Riemann, B. (1859). Ueber die Anzahl der Primzahlen unter einer gegebenen
  Grösse. *Monatsberichte der Berliner Akademie*, November 1859.
  Transcription of the original and English translation by D. R. Wilkins:
  [maths.tcd.ie/pub/HistMath/People/Riemann/Zeta](https://www.maths.tcd.ie/pub/HistMath/People/Riemann/Zeta/).
- von Koch, H. (1901). Sur la distribution des nombres premiers. *Acta
  Mathematica*, 24, 159–182. DOI: [10.1007/BF02403071](https://doi.org/10.1007/BF02403071).
- Littlewood, J. E. (1914). Sur la distribution des nombres premiers.
  *Comptes Rendus de l'Académie des Sciences*, 158, 1869–1872.
- Skewes, S. (1933). On the difference π(x) − li(x) (I). *Journal of the
  London Mathematical Society*, s1-8(4), 277–283. DOI: [10.1112/jlms/s1-8.4.277](https://doi.org/10.1112/jlms/s1-8.4.277).
- Cramér, H. (1936). On the order of magnitude of the difference between
  consecutive prime numbers. *Acta Arithmetica*, 2(1), 23–46. DOI:
  [10.4064/aa-2-1-23-46](https://doi.org/10.4064/aa-2-1-23-46).
- Turing, A. M. (1953). Some calculations of the Riemann zeta-function.
  *Proceedings of the London Mathematical Society*, s3-3(1), 99–117. DOI:
  [10.1112/plms/s3-3.1.99](https://doi.org/10.1112/plms/s3-3.1.99).
- Montgomery, H. L. (1973). The pair correlation of zeros of the zeta
  function. *Proceedings of Symposia in Pure Mathematics*, 24, 181–193. DOI:
  [10.1090/pspum/024/9944](https://doi.org/10.1090/pspum/024/9944).
- Schoenfeld, L. (1976). Sharper bounds for the Chebyshev functions θ(x) and
  ψ(x). II. *Mathematics of Computation*, 30(134), 337–360. DOI:
  [10.1090/S0025-5718-1976-0457374-X](https://doi.org/10.1090/S0025-5718-1976-0457374-X).
- Odlyzko, A. M. (1987). On the distribution of spacings between zeros of the
  zeta function. *Mathematics of Computation*, 48(177), 273–308. DOI:
  [10.1090/S0025-5718-1987-0866115-0](https://doi.org/10.1090/S0025-5718-1987-0866115-0).
- Volchkov, V. V. (1995). On an equality equivalent to the Riemann
  hypothesis. *Ukrainian Mathematical Journal*, 47(3), 491–493. DOI:
  [10.1007/BF01056314](https://doi.org/10.1007/BF01056314).
- Bays, C.; Hudson, R. H. (2000). A new bound for the smallest $x$ with
  $\pi(x) > \operatorname{li}(x)$. *Mathematics of Computation*, 69(231),
  1285–1296. DOI: [10.1090/S0025-5718-99-01104-7](https://doi.org/10.1090/S0025-5718-99-01104-7).
- Sekatskii, S. K.; Beltraminelli, S.; Merlini, D. (2012). On equalities
  involving integrals of the logarithm of the Riemann ζ-function and
  equivalent to the Riemann hypothesis. *Ukrainian Mathematical Journal*,
  64(2), 247–261. DOI: [10.1007/s11253-012-0642-0](https://doi.org/10.1007/s11253-012-0642-0).
- Büthe, J. (2018). An analytic method for bounding $\psi(x)$. *Mathematics
  of Computation*, 87(312), 1991–2009. DOI: [10.1090/mcom/3264](https://doi.org/10.1090/mcom/3264).
- Pratt, K.; Robles, N.; Zaharescu, A.; Zeindler, D. (2020). More than
  five-twelfths of the zeros of ζ are on the critical line. *Research in the
  Mathematical Sciences*, 7(1). DOI: [10.1007/s40687-019-0199-8](https://doi.org/10.1007/s40687-019-0199-8).
- Platt, D.; Trudgian, T. (2021). The Riemann hypothesis is true up to
  $3 \cdot 10^{12}$. *Bulletin of the London Mathematical Society*, 53(3),
  792–797. DOI: [10.1112/blms.12460](https://doi.org/10.1112/blms.12460).
- Odlyzko, A. M. Tables of zeros of the Riemann zeta function (the first
  100,000 zeros, accurate to $3 \times 10^{-9}$).
  [www-users.cse.umn.edu/~odlyzko/zeta_tables](https://www-users.cse.umn.edu/~odlyzko/zeta_tables/index.html).
  Accessed Nov. 25, 2026.

[^riemann]: In the original: "Es ist sehr wahrscheinlich, dass alle Wurzeln reell sind. Hiervon wäre allerdings ein strenger Beweis zu wünschen; ich habe indess die Aufsuchung desselben nach einigen flüchtigen vergeblichen Versuchen vorläufig bei Seite gelassen, da er für den nächsten Zweck meiner Untersuchung entbehrlich schien" (the end of the sentence says the proof seemed unnecessary for the immediate purpose of the paper). The text was checked against D. R. Wilkins's transcription (in the references), which also includes his own English translation. Riemann speaks of *real* roots because he writes the function in a shifted and rotated variable, in which the critical line becomes the real axis. It is the same statement.

[^half]: Odlyzko's table only gives the imaginary part of each zero, precisely because the zeros were searched for on the critical line. Using real part 1/2 doesn't remove the assumption from the code, it just makes it explicit. What guarantees it is truly 1/2, for these zeros, is the numerical verification, not my code.

[^volchkov]: I integrated in Julia with the QuadGK package, evaluating $\zeta$ with Arblib's `fpwrap_zeta`, and in Python with SciPy's `quad` and mpmath's $\zeta$. The inner integral goes from $\sigma = 1/2$ to 45 (beyond that, $\ln\lvert \zeta\rvert$ is smaller than $10^{-13}$), and the outer one was split at the heights of the zeros, where $\ln\lvert \zeta\rvert$ has singularities at the edge $\sigma = 1/2$. There is another singularity at the pole, at $s = 1$, and both are integrable. Beyond $t = 300$ the weight is already $2 \times 10^{-11}$, and a rough bound for what the cutoff leaves out is of the order of $10^{-8}$; the observed difference, $2 \times 10^{-11}$, shows that in practice it is much less. In Julia the computation takes about a minute.

[^cramer]: This is the intuition behind Harald Cramér's model, from 1936: treat each integer $n$ as prime with probability $1/\ln n$, independently. The model gets details wrong — for example, two odd primes are never at an odd distance, and distances that are multiples of 6 are more common than the others —, but it gets the general shape right, which is what appears in the figure.
