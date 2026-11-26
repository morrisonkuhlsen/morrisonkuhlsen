---
layout: post
image: /assets/images/capa-sobrevivencia.avif
title: "The planes that came back: survivorship bias, from Abraham Wald to funds that beat the market"
categories: [STATISTICS, JULIA, PROBABILITY]
tags: [Statistics, Probability, Julia, R, Python]
lang: en
ref: vies-de-sobrevivencia
author: dante-bertuzzi
description: "Why armoring where returning planes have holes is the mistake: Abraham Wald, the Bayes math of survivorship bias and the same error in funds, with simulations."
mathjax: true
---

I knew the story of the World War II planes the way everyone does: the
bombers came back riddled with holes, the officers wanted to armor where the
holes were, and a statistician said no — the armor went where there were
**no** holes, because the planes hit there had not come back to be counted.

It's a great story. So great that I had never done the math.

This post is the math. It turned out to be one line of Bayes' theorem, an
estimator I didn't expect to work so well, a simulation that showed nothing
on the first try, and a mistake of mine in an investment fund example that,
ironically, was itself a selection bias.

## First, what is true in this story

The statistician existed. Abraham Wald was born in 1902 in Kolozsvár — then
Hungary, now Cluj, in Romania — and arrived in the United States in 1938.
During the war, he worked at the Statistical Research Group at Columbia
University, a group that answered military questions with statistics.[^group]

The documents existed too. During the war, Wald wrote the memoranda *A
Method of Estimating Plane Vulnerability Based on Damage of Survivors*,
reprinted in 1980 by the Center for Naval Analyses. The title gives away the
whole post: estimating the vulnerability of the planes **from the damage on
the survivors**. The work is described in detail in the article by Mangel and
Samaniego (1984).

Now, what I could not confirm. The dialogue with the officers — they
pointing at the holes, Wald pointing at the gaps — is the version that
circulates in popular books and talks, and I found no source showing where
it came from. It may have happened more or less like that; it may be a good
dramatization of a report full of equations.

And the drawing of the plane covered in little red dots that appears in every
presentation on the subject? It's modern. It didn't come from any report.[^drawing]

So the anecdote is, at the very least, embellished. The idea isn't. The idea
is right there in the title of the memoranda: the damage you see on the
planes that came back is information about the ones that didn't.

## The math, with a made-up plane

I took a plane and split it into five regions. I assumed a hit is equally
likely to land at any point of the silhouette, so each region gets hits in
proportion to its area, $a_i$. And I made up the lethality $q_i$: the chance
that one hit in that region brings the plane down.

| Region | Area ($a_i$) | Lethality of one hit ($q_i$) |
|---|---:|---:|
| Engines | 20% | 65% |
| Cockpit | 5% | 70% |
| Fuselage | 30% | 3% |
| Wings | 35% | 4% |
| Tail | 10% | 10% |

Those 65% and 70% came from nowhere but my head. But the order is
reasonable: a hit in the engine or the pilot is much worse than a hole in the
sheet metal. (And, as I'll tell later, the high numbers weren't my first
choice.)

Send out 1,000 planes, each taking **one** hit only. By the areas, 200 are
hit in the engine. Of those, 65% go down: $200 \times 0.65 = 130$. Back come
$200 - 130 = 70$. Repeating for every region:

| Region | Hit | Down | Back | Share of holes in the hangar |
|---|---:|---:|---:|---:|
| Engines | 200 | 130 | 70 | $70/802 = 8.7\%$ |
| Cockpit | 50 | 35 | 15 | $15/802 = 1.9\%$ |
| Fuselage | 300 | 9 | 291 | $291/802 = 36.3\%$ |
| Wings | 350 | 14 | 336 | $336/802 = 41.9\%$ |
| Tail | 100 | 10 | 90 | $90/802 = 11.2\%$ |
| **Total** | **1,000** | **198** | **802** | **100%** |

The engines took 20% of the hits and show up with 8.7% of the holes. The
fuselage took 30% and shows up with 36.3%.

Whoever is in the hangar counting holes sees the fuselage and the wings as the
"most hit" parts. And they are exactly the ones that matter least.

## This has a name, and the name is Bayes

The last column of the table isn't "where the hits land". It's "where the
hits land, **given that the plane came back**". By
[Bayes' theorem](/en/formulas/bayes-theorem.html), with
$P(\text{back}) = 802/1{,}000 = 0.802$:

$$
P(\text{engine} \mid \text{back})
= \frac{P(\text{back} \mid \text{engine})\, P(\text{engine})}{P(\text{back})}
= \frac{0.35 \times 0.20}{0.802} = \frac{0.07}{0.802} = 0.087.
$$

Three different numbers walk together here: where the hits land,
$P(\text{region})$; how much each region can take, $P(\text{back} \mid
\text{region})$; and what the hangar measures, $P(\text{region} \mid
\text{back})$. The formula says exactly how the third distorts the first:
each region is multiplied by $1 - q_i$ (and everything is divided by the
same $P(\text{back})$). The more lethal, the more it disappears.

It's the classic [conditional probability](/en/formulas/conditional-probability.html)
mistake — taking $P(A \mid B)$ for $P(A)$ — with a twist. Usually you can
tell that there is a $B$. Here, the $B$ is "made it this far", and
**everyone you can observe** satisfies it. The condition becomes invisible.

## It can be undone (I didn't expect that)

I thought Wald's lesson ended at "careful, the data are biased". It doesn't.
Since the bias has a known shape, it can be undone.

In the one-hit-per-plane version, if you know how many planes went out
($N = 1{,}000$) and the area of each region, the math is almost insultingly
simple:

$$
\hat{q}_i = 1 - \frac{s_i}{N\, a_i},
\qquad\text{for example}\qquad
\hat{q}_{\text{engine}} = 1 - \frac{70}{1{,}000 \times 0.20} = 1 - \frac{70}{200} = 1 - 0.35 = 0.65.
$$

Here $s_i$ is how many planes came back with holes in region $i$. If no plane
went down, that region should show up on $N a_i$ planes. What's missing is the
lethality.

Real planes take more than one hit. What I do below is a simplified version
of my own, not Wald's formulation.[^formula] Suppose the number of hits per
mission follows a [Poisson distribution](/en/formulas/poisson-distribution.html)
with mean $\lambda$, and that each hit lands and acts independently. A
property of the Poisson, splitting (or "thinning"), does the heavy lifting:
the lethal and non-lethal hits in each region become Poisson counts that are
independent of each other. Hence:

- a plane comes back if it takes no lethal hit:
  $P(\text{back}) = e^{-\lambda Q}$, with $Q = \sum_i a_i q_i$;
- and, among the planes that come back, the holes in region $i$ are still
  Poisson, with mean $\lambda a_i (1 - q_i)$ per plane.

With $N$ missions, $S$ planes back and $H$ holes in them, the two equations
even give $\lambda$, which nobody observes directly. Since
$S/N \approx e^{-\lambda Q}$, we get $\ln(N/S) \approx \lambda Q$; and since
$H/S \approx \lambda(1 - Q)$, adding them:

$$
\hat{\lambda} = \frac{H}{S} + \ln\frac{N}{S},
\qquad
\hat{q}_i = 1 - \frac{h_i}{S\,\hat{\lambda}\,a_i},
$$

with $h_i$ the number of holes in region $i$ among the planes that came back.
Everything on the right-hand side can be counted in the hangar or in the
paperwork: how many went out, how many came back, where the holes are and the
size of each region. (If the counts were exactly equal to their means, the
formulas would return $\lambda$ and $q_i$ exactly; with random counts, they
return approximations.)

When I got to this formula, I didn't trust it. So I simulated.

## The simulation that showed nothing

I drew a four-engine bomber seen from above, made of rectangles, drew hits
uniformly over the silhouette and sent out 10,000 missions, with 2 hits per
mission on average. In the first version, I gave the engines 30% lethality
and the cockpit 35%. They seemed like respectable numbers.

The hole pattern came out as... a plane full of holes. Evenly. The engines
had slightly fewer holes than the rest, but nothing anyone would notice by
looking.

It took me a while to understand that the simulation wasn't wrong. It was
teaching me something: the hangar only hides a lot when the region is
**very** lethal. The density of holes in each region among the survivors is
proportional to $1 - q_i$. With 30% lethality, the engines show up with 70%
of the density of a harmless region — a real difference, but a subtle one.
For the famous "gap" to appear, a hit there has to be almost always fatal.

I raised them to 65% and 70%. It's still not the gap of the famous drawing —
that would take something close to 100% — but the difference shows. The full
code, in three languages:

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
    <pre><code>using Random, Distributions, StatsPlots

# Silhouette of a four-engine bomber seen from above, made of rectangles
# (x1, x2, y1, y2). A point belongs to the first region in the list that contains it.
regions = ["Engines", "Cockpit", "Fuselage", "Wings", "Tail"]
rectangles = [
    [(-7.7, -6.3, -1.5, 3.5), (-4.2, -2.8, -1.5, 3.5), (2.8, 4.2, -1.5, 3.5), (6.3, 7.7, -1.5, 3.5)],  # engines
    [(-0.8, 0.8, 7.0, 9.5)],    # cockpit
    [(-0.8, 0.8, -9.0, 7.0)],   # fuselage
    [(-11.0, 11.0, 0.0, 3.0)],  # wings
    [(-4.0, 4.0, -9.0, -7.0)],  # tail (horizontal stabilizer)
]
inside(x, y, (x1, x2, y1, y2)) = x1 &lt;= x &lt;= x2 &amp;&amp; y1 &lt;= y &lt;= y2
region(x, y) = findfirst(rs -&gt; any(r -&gt; inside(x, y, r), rs), rectangles)   # nothing = outside the plane

# Exact area of each region (not counting the part covered by earlier regions in the list)
area = [4 * 1.4 * 5.0,                          # engines
        1.6 * 2.5,                              # cockpit
        1.6 * 16.0,                             # fuselage
        22.0 * 3.0 - 1.6 * 3.0 - 4 * 1.4 * 3.0, # wings, minus fuselage and engines
        8.0 * 2.0 - 1.6 * 2.0]                  # tail, minus fuselage
a = area ./ sum(area)                           # fraction of the silhouette in each region

q = [0.65, 0.70, 0.03, 0.04, 0.10]   # chance that one hit downs the plane (made up)
λ, N = 2.0, 10_000                   # hits per mission (Poisson with mean λ) and number of missions

rng = Xoshiro(1943)
function hit(rng)                    # a uniform point on the silhouette (by rejection)
    while true
        x, y = rand(rng) * 22 - 11, rand(rng) * 18.5 - 9
        r = region(x, y)
        r === nothing || return x, y, r
    end
end

h = zeros(Int, 5)        # holes per region in the planes that came back
S = 0                    # planes that came back
holes = Tuple{Float64, Float64}[]
for _ in 1:N
    hits = [hit(rng) for _ in 1:rand(rng, Poisson(λ))]
    any(rand(rng) &lt; q[t[3]] for t in hits) &amp;&amp; continue      # shot down: never reaches the hangar
    global S += 1
    for (x, y, r) in hits
        h[r] += 1
        push!(holes, (x, y))
    end
end
H = sum(h)

# Estimator: only what is seen in the hangar, plus N and the areas
λ̂ = H / S + log(N / S)
q̂ = 1 .- h ./ (S * λ̂ .* a)

println("Relative areas: ", round.(a, digits = 4))
println("Came back S = $S of N = $N; holes H = $H")
println("Holes per plane, per unit of relative area: ", round.(h ./ (S .* a), digits = 2),
        "   (expected λ(1 − q): ", round.(λ .* (1 .- q), digits = 2), ")")
println("λ̂ = ", round(λ̂, digits = 3))
for i in 1:5
    println(rpad(regions[i], 9), " true ", round(100q[i], digits = 1), "%   estimated ", round(100q̂[i], digits = 1), "%")
end

# Figure: the first 1,100 holes recorded in the hangar and true vs estimated lethality
p1 = plot(aspect_ratio = :equal, legend = false, axis = false, ticks = false, title = "Holes in the planes that came back")
for i in [4, 3, 5, 2, 1], (x1, x2, y1, y2) in rectangles[i]   # wings below, engines on top
    plot!(p1, Shape([x1, x2, x2, x1], [y1, y1, y2, y2]), color = :lightgray, linecolor = :gray)
end
pts = holes[1:min(end, 1100)]
scatter!(p1, first.(pts), last.(pts), markersize = 1.5, color = :red, markerstrokewidth = 0)
p2 = groupedbar(regions, 100 .* [q q̂], label = ["True" "Estimated"], color = [:gray :royalblue],
                ylabel = "Lethality of one hit (%)", title = "Lethality by region", legend = :topright)
savefig(plot(p1, p2, layout = (1, 2), size = (1000, 460)), "survivorship_planes_jl.png")</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">Relative areas: [0.2439, 0.0348, 0.223, 0.3868, 0.1115]
Came back S = 6445 of N = 10000; holes H = 9994
Holes per plane, per unit of relative area: [0.68, 0.5, 1.99, 1.9, 1.7]   (expected λ(1 − q): [0.7, 0.6, 1.94, 1.92, 1.8])
λ̂ = 1.99
Engines   true 65.0%   estimated 65.8%
Cockpit   true 70.0%   estimated 74.7%
Fuselage  true 3.0%   estimated 0.0%
Wings     true 4.0%   estimated 4.6%
Tail      true 10.0%   estimated 14.8%</pre>
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
    <pre><code># Silhouette of a four-engine bomber seen from above, made of rectangles
# (x1, x2, y1, y2). A point belongs to the first region in the list that contains it.
regions &lt;- c("Engines", "Cockpit", "Fuselage", "Wings", "Tail")
rectangles &lt;- list(
  rbind(c(-7.7, -6.3, -1.5, 3.5), c(-4.2, -2.8, -1.5, 3.5), c(2.8, 4.2, -1.5, 3.5), c(6.3, 7.7, -1.5, 3.5)),  # engines
  rbind(c(-0.8, 0.8, 7.0, 9.5)),    # cockpit
  rbind(c(-0.8, 0.8, -9.0, 7.0)),   # fuselage
  rbind(c(-11.0, 11.0, 0.0, 3.0)),  # wings
  rbind(c(-4.0, 4.0, -9.0, -7.0))   # tail (horizontal stabilizer)
)
region &lt;- function(x, y) {
  for (i in seq_along(rectangles)) {
    r &lt;- rectangles[[i]]
    if (any(r[, 1] &lt;= x &amp; x &lt;= r[, 2] &amp; r[, 3] &lt;= y &amp; y &lt;= r[, 4])) return(i)
  }
  NA   # outside the plane
}

# Exact area of each region (not counting the part covered by earlier regions in the list)
area &lt;- c(4 * 1.4 * 5.0,                          # engines
          1.6 * 2.5,                              # cockpit
          1.6 * 16.0,                             # fuselage
          22.0 * 3.0 - 1.6 * 3.0 - 4 * 1.4 * 3.0, # wings, minus fuselage and engines
          8.0 * 2.0 - 1.6 * 2.0)                  # tail, minus fuselage
a &lt;- area / sum(area)                             # fraction of the silhouette in each region

q &lt;- c(0.65, 0.70, 0.03, 0.04, 0.10)   # chance that one hit downs the plane (made up)
lambda &lt;- 2; N &lt;- 10000                # hits per mission (Poisson with mean λ) and number of missions

set.seed(1943)
hit &lt;- function() {                    # a uniform point on the silhouette (by rejection)
  repeat {
    x &lt;- runif(1, -11, 11); y &lt;- runif(1, -9, 9.5)
    r &lt;- region(x, y)
    if (!is.na(r)) return(c(x, y, r))
  }
}

h &lt;- integer(5)          # holes per region in the planes that came back
S &lt;- 0                   # planes that came back
holes &lt;- matrix(numeric(0), ncol = 2)
for (m in 1:N) {
  k &lt;- rpois(1, lambda)
  hits &lt;- if (k &gt; 0) t(replicate(k, hit())) else matrix(numeric(0), ncol = 3)
  if (any(runif(k) &lt; q[hits[, 3]])) next      # shot down: never reaches the hangar
  S &lt;- S + 1
  for (j in seq_len(k)) h[hits[j, 3]] &lt;- h[hits[j, 3]] + 1
  holes &lt;- rbind(holes, hits[, 1:2, drop = FALSE])
}
H &lt;- sum(h)

# Estimator: only what is seen in the hangar, plus N and the areas
lambda_hat &lt;- H / S + log(N / S)
q_hat &lt;- 1 - h / (S * lambda_hat * a)

cat("Relative areas:", round(a, 4), "\n")
cat("Came back S =", S, "of N =", N, "; holes H =", H, "\n")
cat("Holes per plane, per unit of relative area:", round(h / (S * a), 2),
    "  (expected λ(1 − q):", round(lambda * (1 - q), 2), ")\n")
cat("λ̂ =", round(lambda_hat, 3), "\n")
for (i in 1:5) cat(sprintf("%-9s true %.1f%%   estimated %.1f%%\n", regions[i], 100 * q[i], 100 * q_hat[i]))

# Figure: the first 1,100 holes recorded in the hangar and true vs estimated lethality
png("survivorship_planes_r.png", width = 1000, height = 460)
par(mfrow = c(1, 2))
plot(NA, xlim = c(-11, 11), ylim = c(-9, 9.5), asp = 1, axes = FALSE, xlab = "", ylab = "",
     main = "Holes in the planes that came back")
for (i in c(4, 3, 5, 2, 1)) {          # wings below, engines on top
  r &lt;- rectangles[[i]]
  rect(r[, 1], r[, 3], r[, 2], r[, 4], col = "gray85", border = "gray50")
}
pts &lt;- holes[seq_len(min(nrow(holes), 1100)), , drop = FALSE]
points(pts[, 1], pts[, 2], pch = 16, cex = 0.4, col = "red")
barplot(100 * rbind(q, q_hat), beside = TRUE, names.arg = regions, col = c("gray50", "royalblue"),
        ylab = "Lethality of one hit (%)", main = "Lethality by region",
        legend.text = c("True", "Estimated"))
invisible(dev.off())</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">Relative areas: 0.2439 0.0348 0.223 0.3868 0.1115 
Came back S = 6488 of N = 10000 ; holes H = 10225 
Holes per plane, per unit of relative area: 0.71 0.57 1.93 1.95 1.8   (expected λ(1 − q): 0.7 0.6 1.94 1.92 1.8 )
λ̂ = 2.009 
Engines   true 65.0%   estimated 64.7%
Cockpit   true 70.0%   estimated 71.8%
Fuselage  true 3.0%   estimated 3.9%
Wings     true 4.0%   estimated 3.2%
Tail      true 10.0%   estimated 10.3%</pre>
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
from matplotlib.patches import Rectangle

# Silhouette of a four-engine bomber seen from above, made of rectangles
# (x1, x2, y1, y2). A point belongs to the first region in the list that contains it.
regions = ["Engines", "Cockpit", "Fuselage", "Wings", "Tail"]
rectangles = [
    [(-7.7, -6.3, -1.5, 3.5), (-4.2, -2.8, -1.5, 3.5), (2.8, 4.2, -1.5, 3.5), (6.3, 7.7, -1.5, 3.5)],  # engines
    [(-0.8, 0.8, 7.0, 9.5)],    # cockpit
    [(-0.8, 0.8, -9.0, 7.0)],   # fuselage
    [(-11.0, 11.0, 0.0, 3.0)],  # wings
    [(-4.0, 4.0, -9.0, -7.0)],  # tail (horizontal stabilizer)
]

def region(x, y):
    for i, rs in enumerate(rectangles):
        if any(x1 &lt;= x &lt;= x2 and y1 &lt;= y &lt;= y2 for (x1, x2, y1, y2) in rs):
            return i
    return None   # outside the plane

# Exact area of each region (not counting the part covered by earlier regions in the list)
area = np.array([4 * 1.4 * 5.0,                          # engines
                 1.6 * 2.5,                              # cockpit
                 1.6 * 16.0,                             # fuselage
                 22.0 * 3.0 - 1.6 * 3.0 - 4 * 1.4 * 3.0, # wings, minus fuselage and engines
                 8.0 * 2.0 - 1.6 * 2.0])                 # tail, minus fuselage
a = area / area.sum()                                    # fraction of the silhouette in each region

q = np.array([0.65, 0.70, 0.03, 0.04, 0.10])   # chance that one hit downs the plane (made up)
lam, N = 2.0, 10_000                           # hits per mission (Poisson with mean λ) and number of missions

rng = np.random.default_rng(1943)
def hit():                                     # a uniform point on the silhouette (by rejection)
    while True:
        x, y = rng.uniform(-11, 11), rng.uniform(-9, 9.5)
        r = region(x, y)
        if r is not None:
            return x, y, r

h = np.zeros(5, dtype=int)   # holes per region in the planes that came back
S = 0                        # planes that came back
holes = []
for _ in range(N):
    hits = [hit() for _ in range(rng.poisson(lam))]
    if any(rng.random() &lt; q[r] for (_, _, r) in hits):   # shot down: never reaches the hangar
        continue
    S += 1
    for (x, y, r) in hits:
        h[r] += 1
        holes.append((x, y))
H = h.sum()

# Estimator: only what is seen in the hangar, plus N and the areas
lam_hat = H / S + np.log(N / S)
q_hat = 1 - h / (S * lam_hat * a)

print("Relative areas:", a.round(4))
print(f"Came back S = {S} of N = {N}; holes H = {H}")
print("Holes per plane, per unit of relative area:", (h / (S * a)).round(2),
      "  (expected λ(1 − q):", (lam * (1 - q)).round(2), ")")
print(f"λ̂ = {lam_hat:.3f}")
for i in range(5):
    print(f"{regions[i]:&lt;9} true {100 * q[i]:.1f}%   estimated {100 * q_hat[i]:.1f}%")

# Figure: the first 1,100 holes recorded in the hangar and true vs estimated lethality
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4.6))
for i in [3, 2, 4, 1, 0]:          # wings below, engines on top
    for (x1, x2, y1, y2) in rectangles[i]:
        ax1.add_patch(Rectangle((x1, y1), x2 - x1, y2 - y1, facecolor="0.85", edgecolor="0.5"))
pts = np.array(holes[:1100])
ax1.scatter(pts[:, 0], pts[:, 1], s=3, color="red")
ax1.set_xlim(-11.5, 11.5); ax1.set_ylim(-9.5, 10); ax1.set_aspect("equal"); ax1.axis("off")
ax1.set_title("Holes in the planes that came back")
x = np.arange(5)
ax2.bar(x - 0.2, 100 * q, 0.4, color="0.5", label="True")
ax2.bar(x + 0.2, 100 * q_hat, 0.4, color="royalblue", label="Estimated")
ax2.set_xticks(x, regions); ax2.set_ylabel("Lethality of one hit (%)")
ax2.set_title("Lethality by region"); ax2.legend()
fig.tight_layout(); fig.savefig("survivorship_planes_en.png", dpi=100)</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">Relative areas: [0.2439 0.0348 0.223  0.3868 0.1115]
Came back S = 6456 of N = 10000; holes H = 10102
Holes per plane, per unit of relative area: [0.67 0.6  1.97 1.94 1.71]   (expected λ(1 − q): [0.7  0.6  1.94 1.92 1.8 ] )
λ̂ = 2.002
Engines   true 65.0%   estimated 66.3%
Cockpit   true 70.0%   estimated 70.2%
Fuselage  true 3.0%   estimated 1.7%
Wings     true 4.0%   estimated 3.1%
Tail      true 10.0%   estimated 14.6%</pre>
</div>
  </div>
</div>

The numbers in the text and the figure come from the Python version. The
Julia and R versions draw other numbers (each language has its own random
number generator) and give slightly different results, with the same
conclusions.

<figure>
  <a href="/assets/images/survivorship-planes-en.png" title="Open full size">
  <img src="/assets/images/survivorship-planes-en.avif" alt="On the left, the silhouette of a four-engine bomber seen from above, made of gray rectangles, with 1,100 red dots marking holes in the planes that came back: fuselage, wings and tail full of holes, engines and cockpit with few. On the right, bars comparing the true lethality of one hit in each region with the one estimated only from the planes that came back: engines 65% and 66.3%, cockpit 70% and 70.2%, fuselage 3% and 1.7%, wings 4% and 3.1%, tail 10% and 14.6%" />
  </a>
  <figcaption>
    <strong>Figure 1:</strong> on the left, the first 1,100 holes recorded in the hangar; engines and cockpit show about a third of the hole density of the other regions, because most planes hit there didn't come back. On the right, the lethality of each region: in gray, the true one; in blue, the one estimated by the formulas above using only the survivors. Generated by the Python code above. Click the image to see it full size.
  </figcaption>
</figure>

6,456 of the 10,000 planes came back, with 10,102 holes. Measuring holes per
plane and per fraction of the area, the fuselage has 1.97; the engines, 0.67.
Almost three times less — and the math predicts $\lambda(1 - q_i)$:
$2 \times 0.97 = 1.94$ on the fuselage and $2 \times 0.35 = 0.70$ on the
engines.

And the formula I didn't trust gave $\hat{\lambda} = 2.002$, against the true 2:

| Region | True lethality | Estimated only from the planes that came back |
|---|---:|---:|
| Engines | 65% | 66.3% |
| Cockpit | 70% | 70.2% |
| Fuselage | 3% | 1.7% |
| Wings | 4% | 3.1% |
| Tail | 10% | 14.6% |

The regions that matter come out close to the right value. The low-lethality
ones miss by more, for a somewhat counterintuitive reason: low lethality is
estimated as "the little bit missing" from a large count, so a small
fluctuation becomes a huge relative error (in the Julia version, the fuselage
comes out at 0.03%, against a true 3%). With more missions, it gets better.

## Funds that beat the market (and my mistake)

Swap planes for investment funds. A fund that does badly loses investors,
shrinks and one day is closed or swallowed by another. Whoever opens a fund
database today and computes the average performance over the last fifteen
years is in the hangar, counting holes on the ones that came back.

To measure how big this is, I simulated 500 funds with **no skill at all**.
Each one's return above the market, every year, comes from a normal
distribution with mean zero and a standard deviation of 6 percentage points.
No manager is better than another; it's all luck. And, every year, the 8%
(rounded) with the worst cumulative return among those still open are closed.

Fifteen years later, 143 are left. Their yearly mean is **1.74 points above
the market**. All 143, without exception, have a positive mean.

To show the contrast, I computed the mean "of all funds, including the ones
that closed". It came out at −2.05.

I stared at that number for a while. The funds have no skill at all — neither
good nor bad. The true mean is zero by construction. Where did that −2 come
from?

It came from me. I had taken the mean of each fund and then the mean of the
means. But a fund that closed in its second year has in its mean exactly the
two bad years that made it close — and nothing else. The closing rule
chooses **when** each fund stops being counted, and stopping right after a
fall pulls the mean down. I was "correcting" survivorship bias with another
selection bias.

The right calculation looks at every year of every fund while it existed —
4,459 fund-years — and gives **−0.03 points**. Practically zero, as it should
be: each year's return is drawn before anyone knows whether the fund will
close at the end of it, so no year is picked for having been bad.

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
    <pre><code>using Random, Statistics, Plots

# 500 funds with NO skill: yearly return above the market ~ Normal(0, 6) percentage points.
# Every year, the 8% (rounded) with the worst cumulative return among the open funds close.
n_funds, years, σ, rate = 500, 15, 6.0, 0.08
rng = Xoshiro(2026)
ret = σ .* randn(rng, n_funds, years)    # ret[i, t]
last_year = fill(years, n_funds)         # last year in which the fund existed
open_ = trues(n_funds)
for t in 1:years
    alive = findall(open_)
    cumulative = [sum(ret[i, 1:t]) for i in alive]
    closing = alive[sortperm(cumulative)[1:round(Int, rate * length(alive))]]
    open_[closing] .= false
    last_year[closing] .= t
end

survivors = findall(open_)
fund_mean = [mean(ret[i, 1:last_year[i]]) for i in 1:n_funds]
fund_years = vcat([ret[i, 1:last_year[i]] for i in 1:n_funds]...)

println("Survivors: ", length(survivors), " of ", n_funds)
println("Yearly mean of the survivors: ", round(mean(fund_mean[survivors]), digits = 2), " point(s)")
println("Survivors with a positive mean: ", count(&gt;(0), fund_mean[survivors]))
println("Mean of the means of all funds: ", round(mean(fund_mean), digits = 2), " point(s)")
println("All fund-years (", length(fund_years), "): ", round(mean(fund_years), digits = 2), " point(s)")

# Figure: cumulative return paths and the three means
p1 = plot(legend = false, xlabel = "Year", ylabel = "Cumulative return above the market (points)",
          title = "500 funds with no skill")
for i in sortperm(open_)   # closed funds first, survivors on top
    path = cumsum(ret[i, 1:last_year[i]])
    col = open_[i] ? :royalblue : :gray70
    plot!(p1, 1:last_year[i], path, color = col, alpha = open_[i] ? 0.6 : 0.3, lw = 0.7)
end
means = [mean(fund_mean[survivors]), mean(fund_mean), mean(fund_years)]
p2 = bar(["Survivors\nonly", "Mean of\nthe means", "All\nfund-years"], means,
         color = [:royalblue, :darkorange, :gray50], legend = false,
         ylabel = "Mean yearly return above the market (points)", title = "What each calculation shows")
hline!(p2, [0], color = :black)
savefig(plot(p1, p2, layout = (1, 2), size = (1000, 460), left_margin = 5Plots.mm), "survivorship_funds_jl.png")</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">Survivors: 143 of 500
Yearly mean of the survivors: 1.7 point(s)
Survivors with a positive mean: 143
Mean of the means of all funds: -1.91 point(s)
All fund-years (4459): 0.0 point(s)</pre>
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
    <pre><code># 500 funds with NO skill: yearly return above the market ~ Normal(0, 6) percentage points.
# Every year, the 8% (rounded) with the worst cumulative return among the open funds close.
n_funds &lt;- 500; years &lt;- 15; sigma &lt;- 6; rate &lt;- 0.08
set.seed(2026)
ret &lt;- matrix(rnorm(n_funds * years, 0, sigma), nrow = n_funds)   # ret[i, t]
last_year &lt;- rep(years, n_funds)        # last year in which the fund existed
is_open &lt;- rep(TRUE, n_funds)
for (t in 1:years) {
  alive &lt;- which(is_open)
  cumulative &lt;- rowSums(ret[alive, 1:t, drop = FALSE])
  closing &lt;- alive[order(cumulative)[seq_len(round(rate * length(alive)))]]
  is_open[closing] &lt;- FALSE
  last_year[closing] &lt;- t
}

survivors &lt;- which(is_open)
fund_mean &lt;- sapply(1:n_funds, function(i) mean(ret[i, 1:last_year[i]]))
fund_years &lt;- unlist(lapply(1:n_funds, function(i) ret[i, 1:last_year[i]]))

cat("Survivors:", length(survivors), "of", n_funds, "\n")
cat("Yearly mean of the survivors:", round(mean(fund_mean[survivors]), 2), "point(s)\n")
cat("Survivors with a positive mean:", sum(fund_mean[survivors] &gt; 0), "\n")
cat("Mean of the means of all funds:", round(mean(fund_mean), 2), "point(s)\n")
cat("All fund-years (", length(fund_years), "): ", round(mean(fund_years), 2), " point(s)\n", sep = "")

# Figure: cumulative return paths and the three means
png("survivorship_funds_r.png", width = 1000, height = 460)
par(mfrow = c(1, 2))
plot(NA, xlim = c(1, years), ylim = range(apply(ret, 1, cumsum)), xlab = "Year",
     ylab = "Cumulative return above the market (points)", main = "500 funds with no skill")
for (i in order(is_open)) {   # closed funds first, survivors on top
  lines(1:last_year[i], cumsum(ret[i, 1:last_year[i]]),
        col = if (is_open[i]) adjustcolor("royalblue", 0.6) else adjustcolor("gray60", 0.3))
}
means &lt;- c(mean(fund_mean[survivors]), mean(fund_mean), mean(fund_years))
barplot(means, names.arg = c("Survivors\nonly", "Mean of\nthe means", "All\nfund-years"),
        col = c("royalblue", "darkorange", "gray50"),
        ylab = "Mean yearly return above the market (points)", main = "What each calculation shows")
abline(h = 0)
invisible(dev.off())</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">Survivors: 143 of 500 
Yearly mean of the survivors: 1.45 point(s)
Survivors with a positive mean: 143 
Mean of the means of all funds: -1.94 point(s)
All fund-years (4459): -0.12 point(s)</pre>
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

# 500 funds with NO skill: yearly return above the market ~ Normal(0, 6) percentage points.
# Every year, the 8% (rounded) with the worst cumulative return among the open funds close.
n_funds, years, sigma, rate = 500, 15, 6.0, 0.08
rng = np.random.default_rng(2026)
ret = rng.normal(0, sigma, size=(n_funds, years))   # ret[i, t]
last_year = np.full(n_funds, years)                 # last year in which the fund existed
is_open = np.ones(n_funds, dtype=bool)
for t in range(1, years + 1):
    alive = np.flatnonzero(is_open)
    cumulative = ret[alive, :t].sum(axis=1)
    closing = alive[np.argsort(cumulative, kind="stable")[:round(rate * len(alive))]]
    is_open[closing] = False
    last_year[closing] = t

survivors = np.flatnonzero(is_open)
fund_mean = np.array([ret[i, :last_year[i]].mean() for i in range(n_funds)])
fund_years = np.concatenate([ret[i, :last_year[i]] for i in range(n_funds)])

print(f"Survivors: {len(survivors)} of {n_funds}")
print(f"Yearly mean of the survivors: {fund_mean[survivors].mean():.2f} point(s)")
print(f"Survivors with a positive mean: {(fund_mean[survivors] &gt; 0).sum()}")
print(f"Mean of the means of all funds: {fund_mean.mean():.2f} point(s)")
print(f"All fund-years ({len(fund_years)}): {fund_years.mean():.2f} point(s)")

# Figure: cumulative return paths and the three means
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4.6))
for i in np.argsort(is_open, kind="stable"):   # closed funds first, survivors on top
    path = np.cumsum(ret[i, :last_year[i]])
    if is_open[i]:
        ax1.plot(range(1, last_year[i] + 1), path, color="royalblue", alpha=0.6, lw=0.7)
    else:
        ax1.plot(range(1, last_year[i] + 1), path, color="0.6", alpha=0.3, lw=0.7)
        ax1.plot(last_year[i], path[-1], ".", color="0.5", ms=2)
ax1.set_xlabel("Year"); ax1.set_ylabel("Cumulative return above the market (points)")
ax1.set_title("500 funds with no skill")
means = [fund_mean[survivors].mean(), fund_mean.mean(), fund_years.mean()]
ax2.bar(["Survivors\nonly", "Mean of\nthe means", "All\nfund-years"], means,
        color=["royalblue", "darkorange", "0.5"])
ax2.axhline(0, color="black", lw=0.8)
ax2.set_ylabel("Mean yearly return above the market (points)"); ax2.set_title("What each calculation shows")
fig.tight_layout(); fig.savefig("survivorship_funds_en.png", dpi=100)</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">Survivors: 143 of 500
Yearly mean of the survivors: 1.74 point(s)
Survivors with a positive mean: 143
Mean of the means of all funds: -2.05 point(s)
All fund-years (4459): -0.03 point(s)</pre>
</div>
  </div>
</div>

The number of survivors (143) and of fund-years (4,459) is the same in all
three languages, because it depends only on the closing rule. The means change
with the random draws: in Julia, 1.70, −1.91 and 0.00; in R, 1.45, −1.94 and
−0.12. The story is the same.

<figure>
  <a href="/assets/images/survivorship-funds-en.png" title="Open full size">
  <img src="/assets/images/survivorship-funds-en.avif" alt="On the left, 500 paths of cumulative return above the market over 15 years: the gray lines end in a dot when the fund closes, almost always below the blue ones, and the blue ones, of the 143 survivors, end above zero. On the right, three bars: the survivors earn on average 1.74 points a year above the market; the mean of the means of all funds gives −2.05; all years of all funds, −0.03" />
  </a>
  <figcaption>
    <strong>Figure 2:</strong> on the left, the 500 funds; the gray ones close at the point where they end, the blue ones make it to 15 years. On the right, the mean return the database shows (survivors only), my wrong correction (mean of the means) and the right value (all years of all funds). Generated by the Python code above. Click the image to see it full size.
  </figcaption>
</figure>

In finance, the problem has a name and a literature of its own; two
articles on it are those by Brown, Goetzmann, Ibbotson and Ross (1992) and by
Elton, Gruber and Blake (1996), in the references. My stumble with the mean of
the means shows that it's not enough to include the dead: you have to include
them the right way.

## Other hangars

**The geniuses who dropped out of college.** The famous cases of people who
dropped out of college and became billionaires became examples because they
worked out; those who dropped out and didn't make it aren't invited to give
talks. The comparison that matters is between everyone who dropped out and
everyone who graduated — and that comparison doesn't show up in the talks.

**"They don't build them like they used to."** The old buildings still
standing are the ones that were well built. The bad ones have already fallen
down or turned into parking lots. Same for "music was better back then": we
hear what survived decades of sifting, not the average of what was on the
radio in 1978.

**The studies that make it into journals.** If only significant results get
published, the scientific literature becomes a hangar: effects look larger
and more consistent than they are, because the studies that found nothing
stayed in the drawer.

## How not to fall for it

Survivorship bias is a kind of selection [bias](/en/glossary#bias), and it has
the most annoying property of all: a bigger sample doesn't help. A thousand
more planes in the hangar give the same wrong answer, only with more
confidence.

What helps is changing the question:

- **Who didn't make it here?** Before any average, ask what process decided
  who gets into the data, and whether that process depends on exactly what you
  want to measure.
- **What is the denominator?** How many planes went out, how many funds were
  opened, how many people dropped out of college. Without the starting
  population, there's no way to know what was lost along the way.
- **Can the loss be modeled?** That's what the formula above did. In clinical
  trials, intention-to-treat analysis keeps in the group those who abandoned
  the treatment. In survival analysis, methods like
  [Kaplan-Meier](/en/glossary#kaplan-meier) exist to use the information from
  those who left the study before the end — as in the
  [post about the orcas](/southern-resident-killer-whales-demography-julia-kaplan-meier/).
- **And does my correction have a bias too?** That one I learned from the funds.

---

The part of Wald's story I like best isn't the cleverness of the answer. It's
that it changes the question. The naive question is where the planes get hit.
The useful question is where a plane can get hit and still come back.

The distance between the two is a conditional probability. And almost every
survivorship error — including mine, with the funds — is someone reading
$P(A \mid \text{survived})$ as if it were $P(A)$.

## References

- Wald, A. (1980). *A Reprint of "A Method of Estimating Plane Vulnerability
  Based on Damage of Survivors"*. Center for Naval Analyses, CRC 432.
- Mangel, M.; Samaniego, F. J. (1984). Abraham Wald's Work on Aircraft
  Survivability. *Journal of the American Statistical Association*, 79(386),
  259–267. DOI: [10.1080/01621459.1984.10478038](https://doi.org/10.1080/01621459.1984.10478038).
- Wallis, W. A. (1980). The Statistical Research Group, 1942–1945. *Journal of
  the American Statistical Association*, 75(370), 320–330. DOI:
  [10.1080/01621459.1980.10477469](https://doi.org/10.1080/01621459.1980.10477469).
- Brown, S. J.; Goetzmann, W.; Ibbotson, R. G.; Ross, S. A. (1992).
  Survivorship Bias in Performance Studies. *The Review of Financial Studies*,
  5(4), 553–580. DOI: [10.1093/rfs/5.4.553](https://doi.org/10.1093/rfs/5.4.553).
- Elton, E. J.; Gruber, M. J.; Blake, C. R. (1996). Survivor Bias and Mutual
  Fund Performance. *The Review of Financial Studies*, 9(4), 1097–1120. DOI:
  [10.1093/rfs/9.4.1097](https://doi.org/10.1093/rfs/9.4.1097).
- Abraham Wald. *MacTutor History of Mathematics Archive*, University of St
  Andrews. [mathshistory.st-andrews.ac.uk/Biographies/Wald](https://mathshistory.st-andrews.ac.uk/Biographies/Wald/).

[^group]: The dates of birth and of arrival in the United States and the work at the Columbia group are in the MacTutor biography (in the references). The history of the group is told in W. Allen Wallis's article (1980).

[^drawing]: It circulates online as if it were a period diagram. It isn't: the best-known version is on Wikimedia Commons, as [Survivorship-bias.png](https://commons.wikimedia.org/wiki/File:Survivorship-bias.png) (2016) and [Survivorship-bias.svg](https://commons.wikimedia.org/wiki/File:Survivorship-bias.svg) (2021), and the file page itself says it is only loosely based on a report by Wald that had no illustration. Figure 1 in this post is also modern, but it has the advantage of coming from a simulation you can check.

[^formula]: For what Wald actually did, the place to go is the article by Mangel and Samaniego (1984). My Poisson version is the shortest one I could write that still works, which is not the same as being his.
