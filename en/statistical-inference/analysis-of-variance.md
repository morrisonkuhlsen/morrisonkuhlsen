---
layout: page
title: Analysis of Variance (ANOVA)
lang: en
ref: analise-variancia
parent: inferencia-estatistica
permalink: /en/statistical-inference/analysis-of-variance
order: 5
mathjax: true
description: "One-way ANOVA: compare the means of several groups with the F test, step by step, with assumptions, effect size, Tukey's test and Julia code."
---

![Illustration of an analyst pointing at a chart titled ANOVA on a computer screen]({{ site.baseurl }}/assets/images/statistics.avif){:style="max-width: 600px; display: block; margin: 0 auto;"}

**Analysis of variance (ANOVA)** is a hypothesis test that compares the means of two or more groups at once. It answers the question: *are the differences between the group means too large to be just chance?* In practice it is used mostly with three or more groups; with two, it gives exactly the same result as [Student's t-test]({{ '/en/statistical-inference/hypothesis-testing' | relative_url }}) with equal variances (section 10).

Despite the name, ANOVA compares **means**. The name comes from the method: it splits the total variation in the data into two parts, the variation **between** groups and the variation **within** each group, and compares them.

This page covers **one-way ANOVA**: the groups are defined by a single categorical variable, such as the type of fertilizer.

---

## 1. The Idea: Variation Between × Variation Within Groups

Picture three groups of measurements. Two kinds of variation appear:

- **variation between groups**: how far the group means are from the grand mean;
- **variation within groups**: how far each value is from the mean of its own group.

If the population means are all equal, the sample means will still differ a little, just by chance, and that difference will be about the size expected from the variation within the groups. If the variation between groups is **much larger** than the variation within them, chance alone explains the data poorly, and it is reasonable to conclude that at least one mean is different.

The ANOVA statistic, called **F**, is exactly this comparison:

$$
F = \frac{\text{variation between groups (per degree of freedom)}}{\text{variation within groups (per degree of freedom)}}
$$

An F near 1 is what we expect when the means are equal; an F much larger than 1 is evidence that they are not. Section 4 defines each part precisely.

The code below simulates three situations, with 30 values per group, and computes F and the p-value for each one.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Plots, Random, Statistics, HypothesisTests

Random.seed!(123)

# The test object stores the sums of squares; F = (SS between / df) / (SS within / df).
f_statistic(t) = (sum(t.SStᵢ) / t.DFt) / (sum(t.SSeᵢ) / t.DFe)

# Generates three groups of 30 values: the means are `distance` apart
# and each group has standard deviation `spread`.
function group_plot(plot_title, distance, spread)
    groups = ["A", "B", "C"]
    values = [randn(30) .* spread .+ distance * (i - 1) for i in 1:3]
    grand_mean = mean(vcat(values...))

    p = plot(title = plot_title, titlefontsize = 10, xlabel = "Group", ylabel = "Value",
             xticks = (1:3, groups), xlims = (0.5, 3.5), legend = :outerbottom, legendcolumns = 2,
             size = (420, 420))
    for i in 1:3
        x = i .+ 0.08 .* randn(30)          # small horizontal jitter so points do not overlap
        scatter!(p, x, values[i], alpha = 0.6, markersize = 5, label = "")
        plot!(p, [i - 0.3, i + 0.3], fill(mean(values[i]), 2), lw = 3, color = :crimson,
              label = i == 1 ? "Group mean" : "")
    end
    hline!(p, [grand_mean], lw = 2, ls = :dash, color = :black, label = "Grand mean")
    test = OneWayANOVATest(values...)
    println(plot_title, ": F = ", round(f_statistic(test), digits = 2), ", p-value = ", round(pvalue(test), sigdigits = 3))
    return p
end

p1 = group_plot("Equal means, large spread within", 0.0, 1.0)
p2 = group_plot("Distant means, small spread within", 3.0, 0.5)
p3 = group_plot("Slightly different means, moderate spread", 0.5, 1.0)

savefig(p1, "group_variability_en.png")
savefig(p2, "group_variability2_en.png")
savefig(p3, "group_variability3_en.png")</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <div>Equal means, large spread within: F = 0.61, p-value = 0.547</div>
  <div>Distant means, small spread within: F = 1076.59, p-value = 4.28e-62</div>
  <div>Slightly different means, moderate spread: F = 13.36, p-value = 8.71e-6</div>
</div>

<div style="display: flex; flex-wrap: wrap; gap: 20px; justify-content: center;">
  <div style="text-align: center; max-width: 320px;">
    <img src="{{ site.baseurl }}/assets/images/group_variability_en.png" alt="Three groups of points with means at almost the same height and points widely spread within each group" style="max-width: 320px;">
    <div style="font-size: 0.95em; margin-top: 0.5em;">Figure 1. Equal true means and large spread within groups: F = 0.61 (p-value = 0.547). No evidence of a difference.</div>
  </div>
  <div style="text-align: center; max-width: 320px;">
    <img src="{{ site.baseurl }}/assets/images/group_variability2_en.png" alt="Three well-separated groups of points, at heights 0, 3 and 6, with little spread in each group" style="max-width: 320px;">
    <div style="font-size: 0.95em; margin-top: 0.5em;">Figure 2. Distant true means (0, 3 and 6) and small spread within: F = 1,076.59. The difference is obvious.</div>
  </div>
  <div style="text-align: center; max-width: 320px;">
    <img src="{{ site.baseurl }}/assets/images/group_variability3_en.png" alt="Three groups of points that overlap a lot, with slightly different means" style="max-width: 320px;">
    <div style="font-size: 0.95em; margin-top: 0.5em;">Figure 3. Slightly different true means (0, 0.5 and 1) and moderate spread: the points overlap, but with 30 values per group F = 13.36 (p-value ≈ 0.0000087).</div>
  </div>
</div>

Figure 3 shows something important: the groups overlap a lot and yet the test detects a difference. With large samples, small differences become detectable. **Statistical significance is not the same as practical importance**; for that, look at the size of the difference (sections 6 and 8).

---

## 2. Why Not Run Several t-Tests?

With three groups, we could compare A with B, A with C and B with C, each with a t-test at 5%. The problem is that each test has a 5% chance of a **false positive** (Type I error) when the means are equal, and the chances add up:

- by the union bound, the chance of at least one false positive in the three tests is **at most** $3 \times 0.05 = 0.15$;
- if the three tests were independent, it would be $1 - 0.95^3 = 1 - 0.857375 = 0.142625$, about 14%. (The three tests are not independent, because they use the same data; the exact value is different, but still well above 5%.)

ANOVA runs **a single test** for the question "are all the means equal?", with a 5% Type I error. Only after it signals a difference do we compare pairs, using a method that controls the error of the whole set (section 8).

---

## 3. Hypotheses and Assumptions

With $k$ groups and population means $\mu_1, \mu_2, \ldots, \mu_k$:

$$
H_0: \mu_1 = \mu_2 = \cdots = \mu_k
$$

$$
H_1: \text{at least one mean differs from the others}
$$

Note: $H_1$ does **not** say that all the means are different. One different mean is enough for $H_0$ to be false.

The F test requires three assumptions:

1. **Independence**: the observations are independent, within and between groups. This comes from the study design (random assignment, no unit measured twice), not from a test.
2. **Normality**: in each group, the values come from a normal distribution. In practice this is checked on the **residuals** (each value minus the mean of its group).
3. **Equal variances** (homoscedasticity): all groups have the same population variance $\sigma^2$.

Section 7 shows how to check the assumptions in the example, and section 11 what to do when they fail.

---

## 4. The Formulas

**Notation.** There are $k$ groups; group $i$ has $n_i$ observations $x_{i1}, x_{i2}, \ldots, x_{in_i}$ and mean $\bar{x}_i$. The total number of observations is $N = n_1 + n_2 + \cdots + n_k$, and the grand mean (of all $N$ observations together) is $\bar{x}$.

**Sums of squares.** Each one measures one part of the variation:

$$
SS_{\text{total}} = \sum_{i=1}^{k} \sum_{j=1}^{n_i} (x_{ij} - \bar{x})^2 \qquad \text{(each value relative to the grand mean)}
$$

$$
SS_{\text{between}} = \sum_{i=1}^{k} n_i \,(\bar{x}_i - \bar{x})^2 \qquad \text{(each group mean relative to the grand mean)}
$$

$$
SS_{\text{within}} = \sum_{i=1}^{k} \sum_{j=1}^{n_i} (x_{ij} - \bar{x}_i)^2 \qquad \text{(each value relative to its group mean)}
$$

The three are linked by an identity that **always** holds, for any data:

$$
SS_{\text{total}} = SS_{\text{between}} + SS_{\text{within}}
$$

This "analysis" (decomposition) of the variation is what gives the method its name.

**Degrees of freedom (df).** $df_{\text{between}} = k - 1$ and $df_{\text{within}} = N - k$. Together they add up to $N - 1$, the degrees of freedom of $SS_{\text{total}}$.

**Mean squares (MS)** are the sums of squares divided by their degrees of freedom:

$$
MS_{\text{between}} = \frac{SS_{\text{between}}}{k - 1} \qquad\qquad MS_{\text{within}} = \frac{SS_{\text{within}}}{N - k}
$$

$MS_{\text{within}}$ is the pooled estimate of the variance $\sigma^2$ shared by the groups; with groups of equal size, it is the mean of the groups' sample variances $s^2$.

**F statistic:**

$$
F = \frac{MS_{\text{between}}}{MS_{\text{within}}}
$$

Under $H_0$ and the assumptions of section 3, F follows **Snedecor's F distribution** with $(k - 1)$ and $(N - k)$ degrees of freedom. The p-value is $P(F_{k-1,\,N-k} \geq F_{\text{observed}})$: the test is always right-tailed, because only large values of F are evidence against $H_0$.

Results are usually shown in an **ANOVA table**:

| Source of variation | SS | df | MS | F |
|---|---|---|---|---|
| Between groups | $SS_{\text{between}}$ | $k - 1$ | $SS_{\text{between}} / (k - 1)$ | $MS_{\text{between}} / MS_{\text{within}}$ |
| Within groups | $SS_{\text{within}}$ | $N - k$ | $SS_{\text{within}} / (N - k)$ | |
| Total | $SS_{\text{total}}$ | $N - 1$ | | |

---

## 5. Worked Example, Step by Step

**Situation** (illustrative numbers, chosen to keep the arithmetic simple): an agronomist tests three fertilizers, A, B and C, on 15 plants, randomly assigning 5 plants to each fertilizer. At the end, she measures the yield of each plant, in kg.

| Fertilizer | Yields (kg) |
|---|---|
| A | 20, 21, 19, 22, 20 |
| B | 18, 17, 20, 16, 19 |
| C | 23, 22, 21, 24, 25 |

**Question:** at significance level $\alpha = 0.05$, is there evidence that the mean yield differs between fertilizers?

### 5.1 Data and hypotheses

- Number of groups: $k = 3$ (from the problem).
- Size of each group: $n_A = n_B = n_C = 5$ (from the problem).
- Total number of observations: $N = 5 + 5 + 5 = 15$.
- Significance level: $\alpha = 0.05$ (from the problem).

$$
H_0: \mu_A = \mu_B = \mu_C \qquad\qquad H_1: \text{at least one mean is different}
$$

### 5.2 Group means

Mean of each group: sum of the values divided by 5.

$$
\bar{x}_A = \frac{20 + 21 + 19 + 22 + 20}{5} = \frac{102}{5} = 20.4 \text{ kg}
$$

$$
\bar{x}_B = \frac{18 + 17 + 20 + 16 + 19}{5} = \frac{90}{5} = 18.0 \text{ kg}
$$

$$
\bar{x}_C = \frac{23 + 22 + 21 + 24 + 25}{5} = \frac{115}{5} = 23.0 \text{ kg}
$$

### 5.3 Grand mean

Sum of all 15 values, divided by 15. The sum of all values is the sum of the three partial sums:

$$
\bar{x} = \frac{102 + 90 + 115}{15} = \frac{307}{15} = 20.4\overline{6} \approx 20.4667 \text{ kg}
$$

This is a repeating decimal (20.4666…). The following steps use the exact fraction $307/15$; the decimals shown are rounded only for reading.

### 5.4 Sum of squares between groups

Formula: $SS_{\text{between}} = \sum n_i (\bar{x}_i - \bar{x})^2$. For each group, the deviation of the group mean from the grand mean, its square and the product with $n_i = 5$:

| Group | $\bar{x}_i - \bar{x}$ | $(\bar{x}_i - \bar{x})^2$ | $n_i(\bar{x}_i - \bar{x})^2$ |
|---|---|---|---|
| A | $\frac{102}{5} - \frac{307}{15} = \frac{306 - 307}{15} = -\frac{1}{15} \approx -0.0667$ | $\frac{1}{225} \approx 0.0044$ | $\frac{5}{225} = \frac{1}{45} \approx 0.0222$ |
| B | $18 - \frac{307}{15} = \frac{270 - 307}{15} = -\frac{37}{15} \approx -2.4667$ | $\frac{1369}{225} \approx 6.0844$ | $\frac{1369}{45} \approx 30.4222$ |
| C | $23 - \frac{307}{15} = \frac{345 - 307}{15} = \frac{38}{15} \approx 2.5333$ | $\frac{1444}{225} \approx 6.4178$ | $\frac{1444}{45} \approx 32.0889$ |

Adding the last column:

$$
SS_{\text{between}} = \frac{1 + 1369 + 1444}{45} = \frac{2814}{45} = \frac{938}{15} \approx 62.5333
$$

### 5.5 Sum of squares within groups

Formula: $SS_{\text{within}} = \sum_i \sum_j (x_{ij} - \bar{x}_i)^2$. Each value minus the mean **of its own group**, squared:

| Group A ($\bar{x}_A = 20.4$) | | Group B ($\bar{x}_B = 18$) | | Group C ($\bar{x}_C = 23$) | |
|---|---|---|---|---|---|
| $x - \bar{x}_A$ | $(x - \bar{x}_A)^2$ | $x - \bar{x}_B$ | $(x - \bar{x}_B)^2$ | $x - \bar{x}_C$ | $(x - \bar{x}_C)^2$ |
| $20 - 20.4 = -0.4$ | $0.16$ | $18 - 18 = 0$ | $0$ | $23 - 23 = 0$ | $0$ |
| $21 - 20.4 = 0.6$ | $0.36$ | $17 - 18 = -1$ | $1$ | $22 - 23 = -1$ | $1$ |
| $19 - 20.4 = -1.4$ | $1.96$ | $20 - 18 = 2$ | $4$ | $21 - 23 = -2$ | $4$ |
| $22 - 20.4 = 1.6$ | $2.56$ | $16 - 18 = -2$ | $4$ | $24 - 23 = 1$ | $1$ |
| $20 - 20.4 = -0.4$ | $0.16$ | $19 - 18 = 1$ | $1$ | $25 - 23 = 2$ | $4$ |
| **Sum** | $\mathbf{5.2}$ | **Sum** | $\mathbf{10}$ | **Sum** | $\mathbf{10}$ |

$$
SS_{\text{within}} = 5.2 + 10 + 10 = 25.2
$$

### 5.6 Total sum of squares (check)

By the identity in section 4, $SS_{\text{total}} = SS_{\text{between}} + SS_{\text{within}}$:

$$
SS_{\text{total}} = \frac{938}{15} + 25.2 = \frac{938}{15} + \frac{378}{15} = \frac{1316}{15} \approx 87.7333
$$

To check it another way, compute $SS_{\text{total}}$ directly with the equivalent form $\sum x^2 - \frac{(\sum x)^2}{N}$ (the sum of the squares of the 15 values minus the square of the sum divided by $N$):

- sum of the squares of the 15 values: $20^2 + 21^2 + \cdots + 25^2 = 6371$;
- square of the sum: $307^2 = 94{,}249$; divided by 15: $94{,}249 / 15 = 6283.2\overline{6}$;

$$
SS_{\text{total}} = 6371 - \frac{94{,}249}{15} = \frac{95{,}565 - 94{,}249}{15} = \frac{1316}{15} \approx 87.7333
$$

Both routes give the same value.

### 5.7 Degrees of freedom

$$
df_{\text{between}} = k - 1 = 3 - 1 = 2 \qquad\qquad df_{\text{within}} = N - k = 15 - 3 = 12
$$

Check: $2 + 12 = 14 = N - 1$.

### 5.8 Mean squares

$$
MS_{\text{between}} = \frac{SS_{\text{between}}}{df_{\text{between}}} = \frac{938/15}{2} = \frac{469}{15} \approx 31.2667
$$

$$
MS_{\text{within}} = \frac{SS_{\text{within}}}{df_{\text{within}}} = \frac{25.2}{12} = 2.1
$$

Check on $MS_{\text{within}}$: the groups' sample variances are $s_A^2 = 5.2/4 = 1.3$, $s_B^2 = 10/4 = 2.5$ and $s_C^2 = 10/4 = 2.5$; since the groups have the same size, $MS_{\text{within}}$ is their mean: $(1.3 + 2.5 + 2.5)/3 = 6.3/3 = 2.1$.

### 5.9 F statistic

$$
F = \frac{MS_{\text{between}}}{MS_{\text{within}}} = \frac{469/15}{2.1} = \frac{469/15}{21/10} = \frac{469 \times 10}{15 \times 21} = \frac{4690}{315} = \frac{134}{9} \approx 14.8889
$$

### 5.10 ANOVA table for the example

| Source of variation | SS | df | MS | F |
|---|---|---|---|---|
| Between fertilizers | 62.5333 | 2 | 31.2667 | 14.8889 |
| Within fertilizers | 25.2000 | 12 | 2.1000 | |
| Total | 87.7333 | 14 | | |

### 5.11 Decision

**Using the critical value.** The critical value is the 95% quantile of the F distribution with 2 and 12 degrees of freedom. In the F table for $\alpha = 0.05$ (column 2, row 12), $F_{\text{critical}} = 3.89$; in Julia, `quantile(FDist(2, 12), 0.95)` gives 3.8853. Since $F = 14.89 > 3.89$, we reject $H_0$.

**Using the p-value.** $P(F_{2,12} \geq 14.8889) = 0.00056$, computed with `ccdf(FDist(2, 12), 134/9)` in Julia. Since $0.00056 < 0.05$, the decision is the same: reject $H_0$.

### 5.12 Interpretation

**What the result says:** if the three fertilizers had the same mean yield, differences between the sample means as large as those observed (or larger) would happen in about 0.056% of experiments, that is, about 1 in 1,800. So we conclude that **at least one fertilizer has a different mean yield** from the others.

**What the result does not say:**

- it does **not say which** fertilizer differs, or whether they all differ from each other; that is the job of Tukey's test (section 8);
- the p-value is **not** the probability that $H_0$ is true;
- the p-value does not measure the **size** of the difference; for that, use the differences between means (in kg) and $\eta^2$ (section 6);
- because the fertilizers were **randomly assigned** to the plants, it is reasonable to attribute the difference to the fertilizer; in a purely observational study (no random assignment), ANOVA would show association, not cause;
- with 5 plants per group, the conclusion depends on the assumptions, which need to be checked (section 7).

---

## 6. Effect Size: η²

**Eta squared** gives the fraction of the total variation that is associated with the difference between groups:

$$
\eta^2 = \frac{SS_{\text{between}}}{SS_{\text{total}}}
$$

Since $SS_{\text{total}} = SS_{\text{between}} + SS_{\text{within}}$ and both parts are greater than or equal to zero, $\eta^2$ is always between 0 and 1 (as long as the data are not all equal, which would make $SS_{\text{total}} = 0$).

In the example:

$$
\eta^2 = \frac{938/15}{1316/15} = \frac{938}{1316} = \frac{67}{94} \approx 0.7128
$$

**Interpretation:** about 71% of the variation in the yield of the 15 plants is associated with the fertilizer used; the other 29% is variation between plants that received the same fertilizer. That is a large effect. Caution: $\eta^2$ computed from a sample tends to overestimate the effect in the population, especially with small samples like this one.

---

## 7. Checking the Assumptions in the Example

1. **Independence.** Each plant received a single, randomly assigned fertilizer and was measured once. Assuming the plants do not affect each other (for example, separate pots), independence comes from the design of the experiment.
2. **Equal variances.** The sample variances are 1.3, 2.5 and 2.5. The largest is $2.5 / 1.3 \approx 1.92$ times the smallest. Levene's test (in the mean-based version, used by `LeveneTest` in HypothesisTests.jl) gives p-value = 0.7493: no evidence of different variances.
3. **Normality.** The residuals are the values in the $x - \bar{x}_i$ columns of the table in section 5.5. The Shapiro-Wilk test on the 15 residuals gives p-value = 0.465: no evidence against normality.

**An important limit:** with only 5 observations per group, these tests have little power; "not rejecting" normality or equal variances does **not prove** that they hold. They just did not find a large problem. With small samples, it also pays to look at the data (as in the chart in section 9) and to use subject-matter knowledge.

---

## 8. Which Group Differs? Tukey's Test

ANOVA rejected $H_0$, but did not say where the difference is. A **post-hoc test** compares the groups in pairs, controlling the chance of at least one false positive across the whole set of comparisons (at 5%). The most common when all pairs are of interest is **Tukey's test** (HSD, *honestly significant difference*).

**Formula.** For groups of equal size $n$, two means differ at 5% when the distance between them exceeds the **honestly significant difference** (HSD):

$$
\text{HSD} = q_{0.05;\,k,\,N-k} \times \sqrt{\frac{MS_{\text{within}}}{n}}
$$

where $q_{0.05;\,k,\,N-k}$ is the 95% quantile of the **studentized range distribution** with $k$ groups and $N - k$ degrees of freedom (Tukey's table).

**Substitution and arithmetic.**

- $q_{0.05;\,3,\,12} = 3.77$ (Tukey's table, $k = 3$, 12 degrees of freedom); in Julia, `quantile(StudentizedRange(12, 3), 0.95)` gives 3.7729.
- Standard error: $\sqrt{MS_{\text{within}} / n} = \sqrt{2.1 / 5} = \sqrt{0.42} \approx 0.6481$ kg.
- $\text{HSD} = 3.7729 \times 0.6481 \approx 2.4451$ kg.

| Comparison | Difference in means (kg) | Exceeds HSD (2.4451)? | Adjusted p-value | 95% CI for the difference (kg) |
|---|---|---|---|---|
| B − A | $18.0 - 20.4 = -2.4$ | no ($2.4 < 2.4451$) | 0.0545 | [−4.85, 0.05] |
| C − A | $23.0 - 20.4 = 2.6$ | yes | 0.0371 | [0.15, 5.05] |
| C − B | $23.0 - 18.0 = 5.0$ | yes | 0.0004 | [2.55, 7.45] |

The intervals are difference ± HSD; the adjusted p-values come from the same distribution, with $q = \lvert\text{difference}\rvert / 0.6481$ (code in section 9).

**Interpretation:**

- Fertilizer **C** yields more than A (about 2.6 kg more per plant) and more than B (about 5.0 kg more).
- The difference between **A and B** (2.4 kg) is **not** significant at 5% after the adjustment. This does **not** mean A and B yield the same: the interval [−4.85, 0.05] runs from "B yields almost 5 kg less" to "practically equal". With 5 plants per group, the experiment is not precise enough to tell them apart.
- Notice the effect of the adjustment: a single t-test between A and B would give p-value = 0.025 (section 10). Tukey's test is stricter because it makes three comparisons at once, and that is what keeps the chance of any false positive at 5%.

---

## 9. Julia Code

Each block runs on its own. The packages used are Statistics (standard library), Distributions, HypothesisTests and StatsPlots.

### 9.1 ANOVA table, by hand and with the ready-made function

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Statistics, Distributions, HypothesisTests

# Yield (kg) of 5 plants per fertilizer
groups = Dict("A" =&gt; [20, 21, 19, 22, 20],
              "B" =&gt; [18, 17, 20, 16, 19],
              "C" =&gt; [23, 22, 21, 24, 25])
names = ["A", "B", "C"]
all_values = vcat((groups[g] for g in names)...)

k = length(names)          # number of groups
N = length(all_values)     # total number of observations
grand_mean = mean(all_values)

# Sums of squares, as in the hand calculation
SS_between = sum(length(groups[g]) * (mean(groups[g]) - grand_mean)^2 for g in names)
SS_within = sum(sum((groups[g] .- mean(groups[g])).^2) for g in names)
SS_total = sum((all_values .- grand_mean).^2)

df_between, df_within = k - 1, N - k
MS_between = SS_between / df_between
MS_within = SS_within / df_within
F = MS_between / MS_within
p_value = ccdf(FDist(df_between, df_within), F)       # P(F(2, 12) &gt; observed F)
F_critical = quantile(FDist(df_between, df_within), 0.95)

println("SS_between = ", round(SS_between, digits = 4), "   SS_within = ", round(SS_within, digits = 4),
        "   SS_total = ", round(SS_total, digits = 4), "   SS_between + SS_within = ", round(SS_between + SS_within, digits = 4))
println("MS_between = ", round(MS_between, digits = 4), "   MS_within = ", round(MS_within, digits = 4))
println("F = ", round(F, digits = 4), "   critical F (5%) = ", round(F_critical, digits = 4))
println("p-value = ", round(p_value, digits = 6))
println("η² = SS_between/SS_total = ", round(SS_between / SS_total, digits = 4))

# Check against the ready-made function in HypothesisTests
test = OneWayANOVATest((groups[g] for g in names)...)
println("p-value (HypothesisTests) = ", round(pvalue(test), digits = 6))</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <div>SS_between = 62.5333   SS_within = 25.2   SS_total = 87.7333   SS_between + SS_within = 87.7333</div>
  <div>MS_between = 31.2667   MS_within = 2.1</div>
  <div>F = 14.8889   critical F (5%) = 3.8853</div>
  <div>p-value = 0.000562</div>
  <div>η² = SS_between/SS_total = 0.7128</div>
  <div>p-value (HypothesisTests) = 0.000562</div>
</div>

### 9.2 Assumptions

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Statistics, HypothesisTests

a = [20, 21, 19, 22, 20]
b = [18, 17, 20, 16, 19]
c = [23, 22, 21, 24, 25]

# Residuals: each value minus the mean of its group
residuals = vcat(a .- mean(a), b .- mean(b), c .- mean(c))

println("Group variances (s²): ", var(a), ", ", var(b), ", ", var(c))
println("Shapiro-Wilk on the residuals: p-value = ", round(pvalue(ShapiroWilkTest(residuals)), digits = 4))
println("Levene (equal variances): p-value = ", round(pvalue(LeveneTest(a, b, c)), digits = 4))</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <div>Group variances (s²): 1.3, 2.5, 2.5</div>
  <div>Shapiro-Wilk on the residuals: p-value = 0.465</div>
  <div>Levene (equal variances): p-value = 0.7493</div>
</div>

### 9.3 Tukey's test

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Statistics, Distributions

means = Dict("A" =&gt; mean([20, 21, 19, 22, 20]),
             "B" =&gt; mean([18, 17, 20, 16, 19]),
             "C" =&gt; mean([23, 22, 21, 24, 25]))
k, n, N = 3, 5, 15
MS_within = 2.1                 # mean square within, from the ANOVA table
standard_error = sqrt(MS_within / n)

# Studentized range distribution. Watch the parameter order in
# Distributions.jl: StudentizedRange(ν, k), degrees of freedom first.
q_dist = StudentizedRange(N - k, k)
q_critical = quantile(q_dist, 0.95)
HSD = q_critical * standard_error   # Tukey's honestly significant difference

println("critical q = ", round(q_critical, digits = 4), "   HSD = ", round(HSD, digits = 4))
for (g1, g2) in [("A", "B"), ("A", "C"), ("B", "C")]
    difference = means[g2] - means[g1]
    q = abs(difference) / standard_error
    p = ccdf(q_dist, q)
    println(g2, " − ", g1, ": difference = ", round(difference, digits = 2),
            "   q = ", round(q, digits = 4), "   p-value = ", round(p, digits = 4),
            "   95% CI = [", round(difference - HSD, digits = 2), ", ", round(difference + HSD, digits = 2), "]")
end</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <div>critical q = 3.7729   HSD = 2.4451</div>
  <div>B − A: difference = -2.4   q = 3.7033   p-value = 0.0545   95% CI = [-4.85, 0.05]</div>
  <div>C − A: difference = 2.6   q = 4.0119   p-value = 0.0371   95% CI = [0.15, 5.05]</div>
  <div>C − B: difference = 5.0   q = 7.7152   p-value = 0.0004   95% CI = [2.55, 7.45]</div>
</div>

### 9.4 Chart

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>using StatsPlots, Statistics

a = [20, 21, 19, 22, 20]
b = [18, 17, 20, 16, 19]
c = [23, 22, 21, 24, 25]
names = ["A", "B", "C"]
means = mean.([a, b, c])

p = boxplot(fill("A", 5), a, label = "", fillalpha = 0.5,
            title = "Yield by fertilizer", xlabel = "Fertilizer",
            ylabel = "Yield (kg)", size = (650, 420))
boxplot!(p, fill("B", 5), b, label = "", fillalpha = 0.5)
boxplot!(p, fill("C", 5), c, label = "", fillalpha = 0.5)
dotplot!(p, repeat(names, inner = 5), vcat(a, b, c), color = :black, markersize = 4, label = "Observations")
scatter!(p, names, means, color = :crimson, markersize = 7, marker = :diamond, label = "Group mean")
hline!(p, [mean(vcat(a, b, c))], ls = :dash, color = :gray, label = "Grand mean")

savefig(p, "anova_boxplot_en.png")</code></pre>
  </div>
</div>

![Box plots of the yield of fertilizers A, B and C, with each plant's point, each group's mean marked by a red diamond and the grand mean by a dashed line]({{ site.baseurl }}/assets/images/anova_boxplot_en.png){:style="max-width: 650px; display: block; margin: 1em auto;"}
<div class="image-caption" style="text-align: center;">Figure 4. Yield by fertilizer, produced by the code above. C sits above the other two; A and B partly overlap, which matches the result of Tukey's test.</div>

---

## 10. ANOVA with Two Groups Is the t-Test

With only two groups, ANOVA and the two-sample t-test with equal variances are the same test: $F = t^2$ always holds, and the p-values are identical. The reason is that, with two groups, the sum of squares between groups reduces to

$$
SS_{\text{between}} = \frac{n_1 n_2}{n_1 + n_2}(\bar{x}_1 - \bar{x}_2)^2
$$

and the mean square within groups is the pooled variance $s_p^2$ of the t-test.

Check with groups A and B from the example:

- pooled variance: $s_p^2 = \frac{(5 - 1) \times 1.3 + (5 - 1) \times 2.5}{5 + 5 - 2} = \frac{5.2 + 10}{8} = \frac{15.2}{8} = 1.9$;
- $t = \frac{20.4 - 18.0}{\sqrt{1.9 \times (1/5 + 1/5)}} = \frac{2.4}{\sqrt{0.76}} \approx \frac{2.4}{0.8718} \approx 2.7530$;
- $t^2 = \frac{2.4^2}{0.76} = \frac{5.76}{0.76} = \frac{144}{19} \approx 7.5789$, which is the F of an ANOVA with A and B only;
- p-value of both tests: 0.0249.

ANOVA's advantage shows up with three or more groups.

---

## 11. When Not to Use It, and Alternatives

- **Very different variances**, especially with groups of different sizes: the F test can be badly off. Use **Welch's ANOVA**, which does not assume equal variances (in R, `oneway.test(..., var.equal = FALSE)`).
- **Clearly non-normal data with small samples** (strong skewness, outliers): use the **Kruskal-Wallis** test, which compares ranks instead of values. In the example, `KruskalWallisTest(a, b, c)` gives H = 10.49 and p-value = 0.0053, the same conclusion. (HypothesisTests warns that, with groups this small, the p-value of this test is approximate.) With large samples, ANOVA is robust to moderate departures from normality.
- **The same units measured several times** (the same students before, during and after): the observations are not independent. Use **repeated-measures ANOVA** or mixed models.
- **Two factors at once** (fertilizer and soil type): use **two-way ANOVA**, which also measures the **interaction** (when the effect of one factor depends on the level of the other).
- **Categorical response** (yes/no, categories): ANOVA compares means of a numerical variable; for proportions and tables, use the chi-square test.

### Fixed, random and mixed effects

- **Fixed effects**: the levels of the factor are exactly the ones of interest (the three fertilizers A, B and C). The conclusions apply to those levels. This is the case on this page.
- **Random effects**: the levels are a sample from a larger set (batches drawn from production). The interest is in the variance between levels in general, not in each level.
- **Mixed models**: have both kinds of factor (fixed treatments applied in randomly chosen blocks or sites).

The arithmetic of the one-way ANOVA table is the same in the fixed and random cases; what changes is the hypothesis being tested and the interpretation.

---

## 12. A Little History

The word *variance*, as the square of the standard deviation, appears in Ronald A. Fisher's 1918 paper on the correlation between relatives under Mendelian inheritance, which splits the variance of inherited traits into parts attributed to different causes. In 1925, in the book *Statistical Methods for Research Workers*, Fisher presented the analysis of variance to researchers in other fields, in chapters VII and VIII, with applications to agricultural experiments.

---

## 13. Summary

- One-way ANOVA tests $H_0$: all means are equal, against $H_1$: at least one is different.
- It decomposes the variation, $SS_{\text{total}} = SS_{\text{between}} + SS_{\text{within}}$, and compares the parts with $F = MS_{\text{between}} / MS_{\text{within}}$, which under $H_0$ follows an F distribution with $(k - 1, N - k)$ degrees of freedom.
- Assumptions: independence, normal residuals and equal variances.
- In the example: F = 14.89, p-value = 0.00056, $\eta^2 = 0.71$; by Tukey's test, C differs from A and from B, and A × B is not significant at 5%.
- Rejecting $H_0$ does not say which group differs (use Tukey) or how large the difference is (use the differences in units and $\eta^2$).
- With two groups, ANOVA and the t-test are the same test ($F = t^2$).

---

## References

1. Fisher, R. A. (1918). The Correlation between Relatives on the Supposition of Mendelian Inheritance. *Transactions of the Royal Society of Edinburgh*, 52(2), 399–433. DOI: [10.1017/S0080456800012163](https://doi.org/10.1017/S0080456800012163).
2. Fisher, R. A. (1925). *Statistical Methods for Research Workers*. Oliver and Boyd.
3. Triola, M. F. (2024). *Introdução à Estatística*. 14th ed. LTC. (in Portuguese; translation of *Elementary Statistics*)
4. Zar, J. H. (2010). *Biostatistical Analysis*. 5th ed. Pearson Prentice Hall. Chapters 10 (analysis of variance) and 11 (multiple comparisons).
