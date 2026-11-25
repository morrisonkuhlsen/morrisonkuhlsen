---
layout: page
title: Sampling
lang: en
ref: amostragem
parent: inferencia-estatistica
permalink: /en/statistical-inference/sampling
order: 3
mathjax: true
description: "Simple random, systematic, stratified and cluster sampling, bias, sample size and allocation, with simulations and Julia code."
---

**Sampling** is choosing part of a population (the **sample**) in order to draw conclusions about the whole population from it. A well-chosen sample makes it possible to estimate means, proportions and other quantities with known precision, at a fraction of the cost of a census. A badly chosen sample gives wrong answers, and making it bigger does not fix that.

For inference from a sample to be valid, three things matter:

1. **Representativeness:** the sample must reflect the population in the characteristics that matter for the study. A biased sample distorts the estimates, whatever its size (section 4).
2. **A draw with known probabilities** (in probability methods): each element of the population has a known, nonzero probability of entering the sample. That is what allows margins of error to be computed.
3. **An adequate size:** the standard error of the mean is $\sigma/\sqrt{n}$, so precision grows with the square root of $n$. With $n = 100$, the standard error is $\sigma/10$; with $n = 400$, it is $\sigma/20$. Quadrupling the sample halves the standard error.

![Illustration with the word "Sampling": twelve figures in a rectangle labeled "Population", an arrow, and five figures in a circle labeled "Sample"]({{ site.baseurl }}/assets/images/amostragem.avif){:style="max-width: 400px; display: block; margin: 0 auto;"}
<div class="image-caption" style="text-align: center;">Figure 1: From the population to the sample.</div>

## 1. Why Sample?

- **Cost and time:** a census is usually too expensive and too slow.
- **Destructive testing:** when measuring destroys the item (material strength, product lifetime), you cannot test everything.
- **Large populations:** with millions of elements, a sample is the only feasible route.
- **Quality control:** instead of inspecting all production, standardized sampling plans are used (in Brazil, the ABNT NBR 5426 standard, from 1985, sets out plans for inspection by attributes).
- **Data quality:** with fewer elements, you can measure more things, more carefully, for each one.

## 2. Basic Concepts

- **Population** (size $N$): the complete set of elements of interest.
- **Sample** (size $n$): the part of the population that is actually observed.
- **Parameter:** a number describing the population, such as the mean $\mu$, the standard deviation $\sigma$ or the proportion $p$. It is usually unknown.
- **Statistic:** a number computed from the sample, such as the sample mean $\bar{x}$, the sample standard deviation $s$ or the sample proportion $\hat{p}$. It is used to estimate the parameter.
- **Sampling frame:** the list of elements from which the sample is drawn. If the frame leaves out part of the population, the sample inherits that **coverage bias**, even with a perfect random draw.
- **Sampling error:** the difference between the statistic and the parameter that arises only because part of the population was observed. For the mean of a simple random sample, $\bar{X}$ is right on average ($E[\bar{X}] = \mu$): sampling error has no direction, and it shrinks as $n$ grows.
- **Sampling fraction:** $f = n/N$, the share of the population that enters the sample. When $f$ is small (the usual rule of thumb is $f < 0.05$), the population can be treated as infinite in the formulas.
- **Bias:** a systematic error that always pushes the estimates the same way. Unlike sampling error, it does **not** shrink as $n$ grows: it can only be fixed in the design of the study.

## 3. Sampling Methods

**Probability** methods (3.1 to 3.4) draw the elements with known probabilities and allow margins of error to be computed. **Non-probability** methods (3.5 to 3.8) do not: they are useful for exploratory studies, but they give no basis for a margin of error.

### 3.1 Simple Random Sampling (SRS)

**How it works:** every subset of $n$ elements of the population has the same chance of being the sample; in particular, each element has the same probability $n/N$ of being chosen. The draw uses a complete list and random numbers.

**Pros:** simple to understand and to analyze; it is the reference for the margin-of-error formulas. **Cons:** it needs the complete list of the population, and it can be costly if the elements are spread out.

**Example:** a class has 10 students (A to J) and we want to draw 3. We number the students 1 to 10 and draw 3 different numbers; if they come out as 2, 7 and 9, the sample is B, G and I. On the computer, with the fixed seed below, the draw gives F, G and J:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Random, StatsBase

students = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]
Random.seed!(123)                                 # fixed seed: the draw can be repeated
sample_ = sample(students, 3; replace=false)      # 3 students, without replacement
println("Selected sample: ", sample_)</code></pre>
  </div>
</div>

#### Expected output:
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <div>Selected sample: ["F", "G", "J"]</div>
</div>

### 3.2 Systematic Sampling

**How it works:** with the population in a list, compute the interval $k = N/n$, draw a starting point between 1 and $k$, and pick one element every $k$.

**Pros:** easier to carry out than SRS, especially for long lists or on a production line. **Cons:** if the list has a pattern that repeats with a period close to $k$ (a shift rota, for example), the sample may always land on the same kind of element.

**Example:** 20 employees, a sample of 5. The interval is $k = 20/5 = 4$; drawing the start 3, the positions picked are 3, 7, 11, 15 and 19.

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

N, n = 20, 5
k = N ÷ n                     # sampling interval: 20 ÷ 5 = 4
Random.seed!(42)
start = rand(1:k)             # random starting point between 1 and k
positions = start .+ k .* (0:n-1)
println("Start = ", start, "   positions: ", collect(positions))</code></pre>
  </div>
</div>

#### Expected output:
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <div>Start = 3 &nbsp; positions: [3, 7, 11, 15, 19]</div>
</div>

### 3.3 Stratified Sampling

**How it works:** the population is divided into **strata**, non-overlapping groups that are, ideally, homogeneous inside (course, region, income bracket). A random sample is drawn within each stratum. The number of elements per stratum may be proportional to the stratum's size or follow another rule (section 6).

**Pros:** it guarantees that every stratum shows up in the sample and, when the strata differ from one another, it gives more precise estimates than SRS with the same $n$. **Cons:** you need to know, beforehand, which stratum each element belongs to.

**Example:** 100 students, 60 in course A and 40 in course B; a sample of 10. With proportional allocation: $10 \cdot \frac{60}{100} = 6$ students from course A and $10 \cdot \frac{40}{100} = 4$ from course B, drawn within each course.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Random, StatsBase

course_A = ["A$i" for i in 1:60]
course_B = ["B$i" for i in 1:40]
Random.seed!(7)
sample_ = vcat(sample(course_A, 6; replace=false),    # 60% of 10
               sample(course_B, 4; replace=false))    # 40% of 10
println("Stratified sample: ", sample_)</code></pre>
  </div>
</div>

#### Expected output:
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <div>Stratified sample: ["A15", "A44", "A50", "A30", "A57", "A9", "B36", "B34", "B16", "B11"]</div>
</div>

### 3.4 Cluster Sampling

**How it works:** the population is already divided into natural groups, the **clusters** (neighborhoods, schools, batches). Some clusters are drawn and every element in them is observed (or a sample within them, in two-stage sampling).

**Pros:** cheap when the population is spread out, and it does not need a list of all the elements, only of the clusters. **Cons:** elements in the same cluster tend to be alike, so, for the same $n$, precision is usually lower than with SRS. Ideally, each cluster is varied inside, like a miniature of the population.

**Example:** 5 neighborhoods with 100 households each; 2 neighborhoods are drawn and all 100 households in each are interviewed.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Random, StatsBase

districts = ["B1", "B2", "B3", "B4", "B5"]
Random.seed!(21)
drawn = sample(districts, 2; replace=false)
println("Districts drawn: ", drawn, " → interview all 100 households in each")</code></pre>
  </div>
</div>

#### Expected output:
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <div>Districts drawn: ["B1", "B3"] → interview all 100 households in each</div>
</div>

### 3.5 Convenience Sampling

Made up of whoever is easiest to reach: the first 10 people walking by in a mall, the students in the researcher's own class. It is fast and cheap, useful for trying out a questionnaire, but the people who are easy to reach usually differ from the rest of the population, and there is no way to measure that bias.

### 3.6 Quota Sampling

The researcher is given quotas to fill (for example, so many women and so many men, in given age brackets) and interviews whoever they find until the quotas are met. The quotas make the sample's makeup resemble the population's on the chosen variables, but the choice within each quota is not random, and there may be bias in everything that was not controlled.

### 3.7 Judgment (Purposive) Sampling

An expert picks the elements they consider most suitable, such as the 5 leading companies in a sector for a case study. It is useful when those very cases are of interest, but the results do not generalize to the population.

### 3.8 Snowball Sampling

The first participants refer others, who refer others, and so on. It helps to reach populations that are hard to list (small or hidden groups), but the sample tends to concentrate in the contact networks of the first participants.

### 3.9 Comparison

<div style="overflow-x:auto; margin: 1em 0;">
<table style="border-collapse: collapse; margin: 0 auto; min-width: 700px;">
  <thead style="background: #e3f2fd;">
    <tr>
      <th style="border: 1px solid #bbb; padding: 8px; text-align:left;">Method</th>
      <th style="border: 1px solid #bbb; padding: 8px;">Type</th>
      <th style="border: 1px solid #bbb; padding: 8px;">Needs a list of everyone?</th>
      <th style="border: 1px solid #bbb; padding: 8px; text-align:left;">Best use</th>
    </tr>
  </thead>
  <tbody>
    <tr><td style="border: 1px solid #bbb; padding: 8px;"><strong>Simple random</strong></td><td style="border: 1px solid #bbb; padding: 8px; text-align:center;">Probability</td><td style="border: 1px solid #bbb; padding: 8px; text-align:center;">Yes</td><td style="border: 1px solid #bbb; padding: 8px;">The reference; accessible populations with a list</td></tr>
    <tr><td style="border: 1px solid #bbb; padding: 8px;"><strong>Systematic</strong></td><td style="border: 1px solid #bbb; padding: 8px; text-align:center;">Probability</td><td style="border: 1px solid #bbb; padding: 8px; text-align:center;">Yes (ordered)</td><td style="border: 1px solid #bbb; padding: 8px;">Long lists with no periodic patterns</td></tr>
    <tr><td style="border: 1px solid #bbb; padding: 8px;"><strong>Stratified</strong></td><td style="border: 1px solid #bbb; padding: 8px; text-align:center;">Probability</td><td style="border: 1px solid #bbb; padding: 8px; text-align:center;">Yes, with each one's stratum</td><td style="border: 1px solid #bbb; padding: 8px;">Populations with groups that differ</td></tr>
    <tr><td style="border: 1px solid #bbb; padding: 8px;"><strong>Cluster</strong></td><td style="border: 1px solid #bbb; padding: 8px; text-align:center;">Probability</td><td style="border: 1px solid #bbb; padding: 8px; text-align:center;">Only of the clusters</td><td style="border: 1px solid #bbb; padding: 8px;">Geographically spread populations</td></tr>
    <tr><td style="border: 1px solid #bbb; padding: 8px;"><strong>Convenience</strong></td><td style="border: 1px solid #bbb; padding: 8px; text-align:center;">Non-probability</td><td style="border: 1px solid #bbb; padding: 8px; text-align:center;">No</td><td style="border: 1px solid #bbb; padding: 8px;">Questionnaire tests, pilot studies</td></tr>
    <tr><td style="border: 1px solid #bbb; padding: 8px;"><strong>Quota</strong></td><td style="border: 1px solid #bbb; padding: 8px; text-align:center;">Non-probability</td><td style="border: 1px solid #bbb; padding: 8px; text-align:center;">No</td><td style="border: 1px solid #bbb; padding: 8px;">Quick market and opinion surveys</td></tr>
    <tr><td style="border: 1px solid #bbb; padding: 8px;"><strong>Judgment</strong></td><td style="border: 1px solid #bbb; padding: 8px; text-align:center;">Non-probability</td><td style="border: 1px solid #bbb; padding: 8px; text-align:center;">No</td><td style="border: 1px solid #bbb; padding: 8px;">Case studies</td></tr>
    <tr><td style="border: 1px solid #bbb; padding: 8px;"><strong>Snowball</strong></td><td style="border: 1px solid #bbb; padding: 8px; text-align:center;">Non-probability</td><td style="border: 1px solid #bbb; padding: 8px; text-align:center;">No</td><td style="border: 1px solid #bbb; padding: 8px;">Hard-to-reach populations</td></tr>
  </tbody>
</table>
</div>

## 4. Errors in Sample Surveys

Every result from a sample survey is subject to two kinds of error, of very different natures.

**Sampling error:** the variation that exists because each sample is a different part of the population. In probability samples, it is **measured** by the margin of error and it **shrinks** as $n$ grows.

**Non-sampling errors:** they do not shrink as $n$ grows, which makes them the most dangerous:

<div style="overflow-x:auto; margin: 1em 0;">
<table style="border-collapse: collapse; margin: 0 auto; min-width: 620px;">
  <thead style="background: #ffebee;">
    <tr>
      <th style="border: 1px solid #bbb; padding: 8px;">Type</th>
      <th style="border: 1px solid #bbb; padding: 8px;">What it is</th>
      <th style="border: 1px solid #bbb; padding: 8px;">How to reduce it</th>
    </tr>
  </thead>
  <tbody>
    <tr><td style="border: 1px solid #bbb; padding: 8px;"><strong>Coverage</strong></td><td style="border: 1px solid #bbb; padding: 8px;">The frame leaves out part of the population</td><td style="border: 1px solid #bbb; padding: 8px;">Update the frame; combine sources</td></tr>
    <tr><td style="border: 1px solid #bbb; padding: 8px;"><strong>Nonresponse</strong></td><td style="border: 1px solid #bbb; padding: 8px;">Some of those drawn do not respond, and non-respondents differ from respondents</td><td style="border: 1px solid #bbb; padding: 8px;">Repeated contact attempts; compare the respondents' profile with the population's</td></tr>
    <tr><td style="border: 1px solid #bbb; padding: 8px;"><strong>Measurement</strong></td><td style="border: 1px solid #bbb; padding: 8px;">A badly worded question, an uncalibrated instrument, an interviewer who leads the answer</td><td style="border: 1px solid #bbb; padding: 8px;">Pretest the questionnaire; train interviewers</td></tr>
    <tr><td style="border: 1px solid #bbb; padding: 8px;"><strong>Processing</strong></td><td style="border: 1px solid #bbb; padding: 8px;">Data entry, coding or analysis mistakes</td><td style="border: 1px solid #bbb; padding: 8px;">Automatic validation; double checking</td></tr>
  </tbody>
</table>
</div>

**Simulation: bias does not shrink with $n$.** In an illustrative population of 100,000 people, the proportion who support a proposal is about 0.46. A draw from the whole population lands close to that with any $n$. A draw from a frame that holds all of the group more favorable to the proposal, but only 20% of the other group, is always wrong in the same direction, around 0.61, with $n$ = 100, 1,000 or 10,000:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Random, Statistics, StatsBase

# Illustrative population of 100,000 people: group 1 (40%) with 70% support for a
# proposal, group 2 (60%) with 30% support. True proportion: 0.4·0.7 + 0.6·0.3 = 0.46.
Random.seed!(123)
group = vcat(fill(1, 40_000), fill(2, 60_000))
supports = [g == 1 ? rand() &lt; 0.7 : rand() &lt; 0.3 for g in group]
println("True proportion: ", round(mean(supports), digits=4))

# Biased frame: it holds all of group 1 and only 20% of group 2
in_frame = [g == 1 || rand() &lt; 0.2 for g in group]
frame = findall(in_frame)

for n in (100, 1_000, 10_000)
    good = mean(supports[sample(1:length(supports), n; replace=false)])   # draw from the whole population
    bad = mean(supports[sample(frame, n; replace=false)])                 # draw from the biased frame
    println("n = ", rpad(n, 6), "  SRS of the population: ", round(good, digits=3),
            "   SRS of the biased frame: ", round(bad, digits=3))
end</code></pre>
  </div>
</div>

#### Expected output:
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <div>True proportion: 0.4597</div>
  <div>n = 100 &nbsp; &nbsp; SRS of the population: 0.46 &nbsp; SRS of the biased frame: 0.61</div>
  <div>n = 1000 &nbsp; &nbsp;SRS of the population: 0.462 &nbsp; SRS of the biased frame: 0.617</div>
  <div>n = 10000 &nbsp; SRS of the population: 0.458 &nbsp; SRS of the biased frame: 0.61</div>
</div>

<div style="border-left: 4px solid #e53935; padding: 0.5em 1em; background-color: #ffebee; margin: 0.75em 0;">
<strong>A historical case, the Literary Digest (1936):</strong> the magazine mailed ballots to millions of people, got millions of replies back, and predicted the defeat of Franklin Roosevelt in the US presidential election, which he won comfortably. The size of the sample did not save the forecast. The classic explanation is coverage bias (the lists it used favored wealthier voters); Squire (1988), using data from a 1937 survey, concluded that nonresponse also played a part: those who returned the ballot differed from those who did not.
</div>

## 5. Sample Size

The formulas in this section assume **simple random sampling**; they are derived in [Confidence Intervals]({{ '/en/statistical-inference/confidence-intervals' | relative_url }}). In all of them, $z_{\alpha/2}$ is the standard normal critical value (1.96 for 95% confidence) and $E$ is the largest margin of error wanted. The result is always rounded **up**.

### 5.1 Proportion

$$n = \frac{z_{\alpha/2}^2\; p^{\ast}(1-p^{\ast})}{E^2}$$

where $p^{\ast}$ is a prior estimate of the proportion (from an earlier survey, for example). With no estimate, use $p^{\ast} = 0.5$, which gives the largest possible $n$.

**Example 1** (illustrative numbers): a factory wants to estimate the proportion of defective parts with a margin of 3 percentage points and 95% confidence; from earlier batches, it expects about 10% defects.

$$n = \frac{1.96^2 \cdot 0.10 \cdot 0.90}{0.03^2} = \frac{3.8416 \cdot 0.09}{0.0009} = \frac{0.345744}{0.0009} \approx 384.16$$

Rounding up: **385 parts**. (With the unrounded critical value, 1.959964, it comes to 384.15, and the answer is the same.)

**Example 2** (illustrative numbers): an election poll wants a margin of 2 percentage points and 95% confidence; earlier polls put the candidate's voting intention near 40%.

$$n = \frac{1.96^2 \cdot 0.40 \cdot 0.60}{0.02^2} = \frac{3.8416 \cdot 0.24}{0.0004} = \frac{0.921984}{0.0004} = 2304.96$$

Rounding up: **2,305 voters**. Note the price of precision: going from a 3-point to a 2-point margin multiplies $n$ by $(3/2)^2 = 2.25$ (for the same $p^{\ast}$).

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Distributions

z = quantile(Normal(), 0.975)            # 95% confidence

sample_size(p, E) = z^2 * p * (1 - p) / E^2

for (name, p, E) in (("Defective parts", 0.10, 0.03), ("Voting intention", 0.40, 0.02))
    n = sample_size(p, E)
    println(rpad(name, 18), " n = ", round(n, digits=2), " → ", ceil(Int, n))
end</code></pre>
  </div>
</div>

#### Expected output:
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <div>Defective parts &nbsp; &nbsp;n = 384.15 → 385</div>
  <div>Voting intention &nbsp; n = 2304.88 → 2305</div>
</div>

### 5.2 Mean

With $\sigma$ known (or reliably estimated from an earlier study):

$$n = \left(\frac{z_{\alpha/2}\;\sigma}{E}\right)^2$$

When $\sigma$ is only known through an estimate $s$ from a pilot study, the critical value becomes Student's t, $t_{\alpha/2;\,n-1}$, which depends on $n$ itself. We then look for the **smallest $n$** that satisfies

$$\left(\frac{t_{\alpha/2;\,n-1}\cdot s}{E}\right)^2 \leq n$$

Simply repeating the calculation "until it converges" does not work: in the example below ($s = 2.4$, $E = 0.8$, 95%), the repetition keeps alternating between 37 and 38 forever. Testing both values: with $n = 37$, $t_{0.025;\,36} = 2.0281$ and $(2.0281 \cdot 2.4/0.8)^2 \approx 37.02$, which exceeds 37, so 37 is not enough; with $n = 38$, $t_{0.025;\,37} = 2.0262$ and $(2.0262 \cdot 3)^2 \approx 36.95 \leq 38$. The answer is **$n = 38$**.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Distributions

# n for the mean with σ unknown: the t critical value depends on n itself.
# Find the smallest n such that t(n−1) · s / √n ≤ E, that is, (t · s / E)² ≤ n.
function n_mean_t(s, E; α=0.05)
    n = 2
    while (quantile(TDist(n - 1), 1 - α/2) * s / E)^2 &gt; n
        n += 1
    end
    return n
end

s, E = 2.4, 0.8
n = n_mean_t(s, E)
for m in (n - 1, n)
    t = quantile(TDist(m - 1), 0.975)
    println("n = ", m, ": t = ", round(t, digits=4), "   (t·s/E)² = ", round((t * s / E)^2, digits=2))
end
println("n required = ", n)</code></pre>
  </div>
</div>

#### Expected output:
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <div>n = 37: t = 2.0281 &nbsp; (t·s/E)² = 37.02</div>
  <div>n = 38: t = 2.0262 &nbsp; (t·s/E)² = 36.95</div>
  <div>n required = 38</div>
</div>

### 5.3 Finite Population

When the sample is a sizable fraction of the population, the finite population correction lowers the $n$ needed:

$$n = \frac{n_0}{1 + \dfrac{n_0 - 1}{N}}, \qquad n_0 = \frac{z_{\alpha/2}^2\, p^{\ast}(1-p^{\ast})}{E^2}$$

Multiplying the top and bottom by $N E^2$, the same formula becomes:

$$n = \frac{N\, z_{\alpha/2}^2\, p^{\ast}(1-p^{\ast})}{E^2 (N-1) + z_{\alpha/2}^2\, p^{\ast}(1-p^{\ast})}$$

**Example:** $N = 5{,}000$, 95% confidence, $E = 0.05$, $p^{\ast} = 0.5$.

1. Numerator: $5000 \cdot 1.96^2 \cdot 0.5 \cdot 0.5 = 5000 \cdot 3.8416 \cdot 0.25 = 4802$.
2. Denominator: $0.05^2 \cdot 4999 + 3.8416 \cdot 0.25 = 0.0025 \cdot 4999 + 0.9604 = 12.4975 + 0.9604 = 13.4579$.
3. Division: $n = \frac{4802}{13.4579} \approx 356.82$.

Rounding up: **357**, against 385 without the correction.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Distributions

N = 5000                         # population size
z = quantile(Normal(), 0.975)
p, E = 0.5, 0.05

n0 = z^2 * p * (1 - p) / E^2     # infinite population
n = n0 / (1 + (n0 - 1) / N)      # finite population correction

println("n0 = ", round(n0, digits=2), "   corrected n = ", round(n, digits=2), " → ", ceil(Int, n))</code></pre>
  </div>
</div>

#### Expected output:
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <div>n0 = 384.15 &nbsp; corrected n = 356.8 → 357</div>
</div>

## 6. Allocation in a Stratified Sample

Once the total size $n$ is decided, it has to be split among the strata. Let $N_h$ be the size of stratum $h$ in the population and $n_h$ the number of elements drawn from it.

**Proportional allocation:** each stratum gets a share of $n$ proportional to its size,

$$n_h = n \cdot \frac{N_h}{N}$$

**Neyman (optimal) allocation:** it also takes into account the standard deviation $\sigma_h$ of each stratum, and gives more sample to the more variable strata,

$$n_h = n \cdot \frac{N_h\, \sigma_h}{\sum_i N_i\, \sigma_i}$$

For a fixed $n$ and equal cost per element, it is the allocation that minimizes the variance of the stratified mean.

**Example** (illustrative numbers): a university with 10,000 students, 6,000 in the sciences and 4,000 in the humanities; a sample of $n = 400$. A pilot study found grade standard deviations of 10 in the sciences and 20 in the humanities.

- **Proportional:** $n_A = 400 \cdot \frac{6000}{10000} = 240$ and $n_B = 400 \cdot \frac{4000}{10000} = 160$.
- **Neyman:** the denominator is $6000 \cdot 10 + 4000 \cdot 20 = 60{,}000 + 80{,}000 = 140{,}000$; so $n_A = 400 \cdot \frac{60{,}000}{140{,}000} \approx 171.43$ and $n_B = 400 \cdot \frac{80{,}000}{140{,}000} \approx 228.57$, rounded to **171 and 229** (adding up to 400). The humanities, more variable, get more sample even though they are the smaller stratum.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>n = 400
N = [6000, 4000]                 # stratum sizes (Sciences, Humanities)
σ = [10, 20]                     # standard deviations from a pilot study

proportional = n .* N ./ sum(N)
neyman = n .* (N .* σ) ./ sum(N .* σ)

println("Proportional: ", proportional)
println("Neyman:       ", round.(neyman, digits=2), " → ", round.(Int, neyman))</code></pre>
  </div>
</div>

#### Expected output:
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <div>Proportional: [240.0, 160.0]</div>
  <div>Neyman: &nbsp; &nbsp; &nbsp; [171.43, 228.57] → [171, 229]</div>
</div>

**Simulation: how much stratification gains.** In an illustrative population with these two strata (means 50 and 80, standard deviations 10 and 20), we draw 5,000 samples of 400 with each method and measure the standard deviation of the 5,000 estimates of the mean:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Random, Statistics, StatsBase

# Illustrative population: stratum A with 6,000 grades (mean 50, standard deviation 10)
# and stratum B with 4,000 grades (mean 80, standard deviation 20)
Random.seed!(123)
A = 50 .+ 10 .* randn(6000)
B = 80 .+ 20 .* randn(4000)
pop = vcat(A, B)
μ = mean(pop)

# Stratified estimator: the mean of each stratum, weighted by the stratum size
strat(nA, nB) = (6000 * mean(sample(A, nA; replace=false)) +
                 4000 * mean(sample(B, nB; replace=false))) / 10_000

repetitions = 5_000
srs = [mean(sample(pop, 400; replace=false)) for _ in 1:repetitions]
prop = [strat(240, 160) for _ in 1:repetitions]       # proportional allocation
neyman = [strat(171, 229) for _ in 1:repetitions]     # Neyman allocation

println("Population mean = ", round(μ, digits=3))
println("Standard deviation of the estimate, n = 400:")
println("  simple random          ", round(std(srs), digits=3))
println("  stratified (prop.)     ", round(std(prop), digits=3))
println("  stratified (Neyman)    ", round(std(neyman), digits=3))</code></pre>
  </div>
</div>

#### Expected output:
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <div>Population mean = 61.955</div>
  <div>Standard deviation of the estimate, n = 400:</div>
  <div> &nbsp;simple random &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;1.02</div>
  <div> &nbsp;stratified (prop.) &nbsp; &nbsp; 0.722</div>
  <div> &nbsp;stratified (Neyman) &nbsp; &nbsp;0.684</div>
</div>

Proportional stratified sampling errs about 30% less than SRS (0.722 against 1.020), and Neyman a little less still (0.684). The gain comes from the strata having very different means (50 and 80): SRS still varies in the share of each course it happens to draw, and stratified sampling does not.

## 7. How to Choose the Method

<div style="overflow-x:auto; margin: 1em 0;">
<table style="border-collapse: collapse; margin: 0 auto; min-width: 680px;">
  <thead style="background: #e8f5e9;">
    <tr>
      <th style="border: 1px solid #bbb; padding: 8px;">#</th>
      <th style="border: 1px solid #bbb; padding: 8px;">Question</th>
      <th style="border: 1px solid #bbb; padding: 8px;">If yes</th>
      <th style="border: 1px solid #bbb; padding: 8px;">If no</th>
    </tr>
  </thead>
  <tbody>
    <tr><td style="border: 1px solid #bbb; padding: 8px; text-align:center;">1</td><td style="border: 1px solid #bbb; padding: 8px;">Is the goal only to explore or to test a questionnaire?</td><td style="border: 1px solid #bbb; padding: 8px;">Convenience may be enough (no margin of error)</td><td style="border: 1px solid #bbb; padding: 8px;">Use a probability method: go to 2</td></tr>
    <tr><td style="border: 1px solid #bbb; padding: 8px; text-align:center;">2</td><td style="border: 1px solid #bbb; padding: 8px;">Is there a complete, up-to-date list of the population?</td><td style="border: 1px solid #bbb; padding: 8px;">Go to 3</td><td style="border: 1px solid #bbb; padding: 8px;"><strong>Cluster</strong> (a list of the groups is enough)</td></tr>
    <tr><td style="border: 1px solid #bbb; padding: 8px; text-align:center;">3</td><td style="border: 1px solid #bbb; padding: 8px;">Is the population spread out, making each visit costly?</td><td style="border: 1px solid #bbb; padding: 8px;"><strong>Cluster</strong> (or two-stage)</td><td style="border: 1px solid #bbb; padding: 8px;">Go to 4</td></tr>
    <tr><td style="border: 1px solid #bbb; padding: 8px; text-align:center;">4</td><td style="border: 1px solid #bbb; padding: 8px;">Are there known groups, different from one another, that matter for the study?</td><td style="border: 1px solid #bbb; padding: 8px;"><strong>Stratified</strong></td><td style="border: 1px solid #bbb; padding: 8px;">Go to 5</td></tr>
    <tr><td style="border: 1px solid #bbb; padding: 8px; text-align:center;">5</td><td style="border: 1px solid #bbb; padding: 8px;">Is the list long and free of periodic patterns?</td><td style="border: 1px solid #bbb; padding: 8px;"><strong>Systematic</strong></td><td style="border: 1px solid #bbb; padding: 8px;"><strong>Simple random</strong></td></tr>
  </tbody>
</table>
</div>

<div style="border-left: 4px solid #4CAF50; padding: 0.5em 1em; background-color: #e8f5e9; margin: 0.75em 0;">
<strong>In short:</strong> whenever possible, use a probability method; only that allows margins of error and confidence intervals to be computed. A small, well-drawn sample is worth more than a huge, biased one. And the margin-of-error formulas on this page and in <a href="{{ '/en/statistical-inference/confidence-intervals' | relative_url }}">Confidence Intervals</a> hold for simple random sampling; stratified and cluster designs have their own formulas.
</div>

## 🎧 Podcast: Sampling

An audio episode, from this site, on the sampling methods covered on this page (in Portuguese):

<div style="margin-top: 1em;">
  <iframe title="Podcast on sampling (in Portuguese)" width="100%" height="166" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/2192924015&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true"></iframe>
</div>

## References

1. Bolfarine, H.; Bussab, W. O. (2005). *Elementos de Amostragem*. Blucher. (in Portuguese)
2. Bussab, W. O.; Morettin, P. A. (2023). *Estatística Básica*. 10th ed. Saraiva Uni. (in Portuguese)
3. Cochran, W. G. (1977). *Sampling Techniques*. 3rd ed. Wiley.
4. Lohr, S. L. (2009). *Sampling: Design and Analysis*. 2nd ed. Brooks/Cole.
5. Squire, P. (1988). Why the 1936 Literary Digest Poll Failed. *Public Opinion Quarterly*, 52(1), 125–133. DOI: [10.1086/269085](https://doi.org/10.1086/269085).
6. Triola, M. F. (2024). *Introdução à Estatística*. 14th ed. LTC. (in Portuguese; translation of *Elementary Statistics*)
