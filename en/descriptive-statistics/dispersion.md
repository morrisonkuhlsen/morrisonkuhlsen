---
layout: page
title: Measures of Dispersion
lang: en
ref: dispersao
parent: estatistica-descritiva
permalink: /en/descriptive-statistics/dispersion
order: 2
mathjax: true
description: "Measures that describe how variable the data are: variance, standard deviation and range."
---

**Measures of dispersion** are essential tools in descriptive statistics that help us understand how spread out or concentrated the data are around a measure of central tendency, usually the mean. While measures of central tendency show the typical value, measures of dispersion show how variable the data are.

The main measures of dispersion are:

1. **Range**
2. **Variance**
3. **Standard Deviation**
4. **Coefficient of Variation**
5. **Interquartile Range (IQR)**

---

## Symbols and Where They Come From

In statistics, different symbols are used for the measures of dispersion:

### 1. Variance
- **Population symbol**: $\sigma^2$ (lowercase sigma squared)
  - **Meaning**: it is the square of the population standard deviation $\sigma$. The square reflects the calculation: the deviations from the mean are squared, which removes the negative signs and gives more weight to large deviations.
  - **Origin of the name**: the word *variance* was introduced by Ronald Fisher in 1918, in a paper on genetics, for the square of the standard deviation (Fisher, 1918).

- **Sample symbol**: $s^2$
  - **Meaning**: the variance computed from a sample. It follows the convention of using Latin letters for sample statistics.

### 2. Standard Deviation
- **Population symbol**: $\sigma$ (lowercase sigma)
  - **Origin**: Karl Pearson used the term *standard deviation* and the symbol $\sigma$ in an 1894 paper (Pearson, 1894).
  - **Meaning**: the typical deviation of the values from the population mean.

- **Sample symbol**: $s$
  - **Meaning**: the standard deviation computed from a sample. The $s$ is the Latin letter that corresponds to the Greek sigma.

### 3. Coefficient of Variation
- **Symbol**: $CV$
  - **Meaning**: the ratio between the standard deviation and the mean, as a percentage. Being a relative measure, it has no unit.

### 4. Interquartile Range
- **Symbol**: $IQR$
  - **Meaning**: the distance between the first ($Q_1$) and third ($Q_3$) quartiles, covering the middle 50% of the data.

### 5. Range
- **Symbol**: $R$
  - **Meaning**: the difference between the largest and smallest values of a data set.

> **Notation convention**: 
> - Greek letters ($\sigma$, $\mu$) are used for population parameters (fixed but usually unknown values).
> - Latin letters ($s$, $\bar{x}$) are used for sample statistics (values computed from sample data).
> - The distinction between parameters and statistics is fundamental in statistical inference.

---

<div style="border-left: 4px solid #4CAF50; padding: 0.5em; background-color: #e8f5e9;">
  <strong>📊 Important:</strong> analyzing dispersion is crucial to understanding how <strong>reliable</strong> the measures of central tendency are.<br>
  Data sets with the same mean can have <em>completely different distributions</em> in terms of variability.
</div>

---

## 1. Range

The **range** is the simplest measure of dispersion: the difference between the largest and the smallest value in the data set.

### Formula

$$R = x_{\text{max}} - x_{\text{min}}$$

### Worked Example

Consider this sorted set of ages:

$$\{x_1, x_2, x_3, x_4, x_5, x_6, x_7\} = \{18, 20, 22, 25, 30, 35, 40\}$$

- Maximum value: $x_{\text{max}} = x_7 = 40$
- Minimum value: $x_{\text{min}} = x_1 = 18$
- Range: $R = x_{\text{max}} - x_{\text{min}} = 40 - 18 = 22$ years

**Interpretation:** there are 22 years between the youngest and the oldest person in the group.

### Advantages and Limitations

**Advantages:**
- Easy to compute
- Easy to interpret

**Limitations:**
- Depends only on the two extreme values, so it is sensitive to outliers
- Says nothing about how the data are distributed between the extremes

<div style="border-left: 4px solid #ff9800; padding: 0.5em; background-color: #fff3e0; margin: 1em 0;">
  <strong>⚠️ Watch out for outliers!</strong><br>
  The range can be <em>misleadingly large</em> even when most of the data are concentrated. For example, in {1, 2, 2, 2, 2, 2, 100}, the range is $100 - 1 = 99$, yet 6 of the 7 values are 1 or 2!
</div>

<div style="border-left: 4px solid #2196F3; padding: 0.5em; background-color: #e3f2fd; margin: 1em 0;">
  <strong>💡 Practical tip</strong><br>
  Use the range for a <em>first impression</em> of the dispersion, but complement it with other measures, such as the standard deviation or the IQR.
</div>

---

## 2. Variance

The **variance** measures how far the values in a data set lie from the mean. It is computed from the squared deviations from the mean.

### Formula (Population)

$$\sigma^2 = \frac{1}{N}\sum_{i=1}^{N}(x_i - \mu)^2$$

### Formula (Sample)

$$s^2 = \frac{1}{n-1}\sum_{i=1}^{n}(x_i - \bar{x})^2$$

The sample version divides by $n - 1$, not $n$. With sample data, the deviations are measured from $\bar{x}$, which is computed from the data themselves and always sits "in the middle" of them; so the sum of squares tends to come out smaller than it would around the true mean $\mu$. Dividing by $n - 1$ makes up for that.

### Worked Example

Consider this sample of grades:

$$\{x_1, x_2, x_3, x_4, x_5\} = \{7, 8, 8, 9, 10\}$$

**Step 1 — sample mean ($\bar{x}$):**

$$\bar{x} = \frac{\sum_{i=1}^{5}x_i}{n} = \frac{7 + 8 + 8 + 9 + 10}{5} = \frac{42}{5} = 8.4$$

**Step 2 — each grade's deviation from the mean, and the squared deviation:**

| Grade $x_i$ | $x_i - \bar{x}$ | $(x_i - \bar{x})^2$ |
|---:|---:|---:|
| 7 | $7 - 8.4 = -1.4$ | $(-1.4)^2 = 1.96$ |
| 8 | $8 - 8.4 = -0.4$ | $(-0.4)^2 = 0.16$ |
| 8 | $8 - 8.4 = -0.4$ | $(-0.4)^2 = 0.16$ |
| 9 | $9 - 8.4 = 0.6$ | $(0.6)^2 = 0.36$ |
| 10 | $10 - 8.4 = 1.6$ | $(1.6)^2 = 2.56$ |
| **Sum** | $0$ | $5.2$ |

**Step 3 — sum of the squared deviations:**

$$\sum_{i=1}^{5}(x_i - \bar{x})^2 = 1.96 + 0.16 + 0.16 + 0.36 + 2.56 = 5.2$$

**Step 4 — divide by $n - 1 = 5 - 1 = 4$ (sample variance):**

$$s^2 = \frac{\sum_{i=1}^{n}(x_i - \bar{x})^2}{n-1} = \frac{5.2}{4} = 1.3$$

So the sample variance is $s^2 = 1.3$ **points squared**. The squared unit is why, in practice, the standard deviation is used more.

<div style="border-left: 4px solid #9c27b0; padding: 0.5em; background-color: #f3e5f5; margin: 1em 0;">
  <strong>🔍 A bit of history</strong><br>
  The name <em>variance</em> appeared in a 1918 paper by Ronald Fisher on the correlation between relatives under Mendelian inheritance — the same work in which he began splitting total variability into parts attributed to different causes, the idea that later became the analysis of variance (ANOVA).
</div>

---

## 3. Standard Deviation

The **standard deviation** is the square root of the variance, and it has the advantage of being in the same unit as the original data.

### Formula (Population)

$$\sigma = \sqrt{\sigma^2}$$

### Formula (Sample)

$$s = \sqrt{s^2}$$

### Worked Example

Continuing the previous example, where we found the sample variance $s^2 = 1.3$:

$$s = \sqrt{s^2} = \sqrt{1.3} \approx 1.1402 \approx 1.14$$

The sample standard deviation is $s \approx 1.14$ **points**, back in the unit of the grades. It is the usual measure of how far the grades tend to lie from the mean $\bar{x} = 8.4$.

Be careful with the reading "on average, the grades lie 1.14 points from the mean": that's not quite true. The average of the absolute deviations is

$$\frac{|7 - 8.4| + |8 - 8.4| + |8 - 8.4| + |9 - 8.4| + |10 - 8.4|}{5} = \frac{1.4 + 0.4 + 0.4 + 0.6 + 1.6}{5} = \frac{4.4}{5} = 0.88$$

The standard deviation (1.14) comes out larger because it squares the deviations before averaging, which gives more weight to large deviations, and because it divides by $n - 1$ instead of $n$.

<div style="border-left: 4px solid #4caf50; padding: 0.5em; background-color: #e8f5e9; margin: 1em 0;">
  <strong>📊 Empirical Rule (68–95–99.7)</strong><br>
  For <strong>normally</strong> distributed data, approximately:
  <ul>
    <li>68% of the data lie within 1 standard deviation of the mean ($\mu \pm \sigma$) — more precisely, 68.27%</li>
    <li>95% lie within 2 standard deviations ($\mu \pm 2\sigma$) — 95.45%</li>
    <li>99.7% lie within 3 standard deviations ($\mu \pm 3\sigma$) — 99.73%</li>
  </ul>
  The rule holds for the normal distribution. For skewed or heavy-tailed data, the percentages can be quite different.
</div>

---

## 4. Coefficient of Variation (CV)

The **coefficient of variation** is a relative measure of dispersion, expressed as a percentage, that relates the standard deviation to the mean.

### Formula

$$CV = \frac{\text{standard deviation}}{\text{mean}} \times 100\%$$

With sample data, $CV = \dfrac{s}{\bar{x}} \times 100\%$; with the whole population, $CV = \dfrac{\sigma}{\mu} \times 100\%$.

### Worked Example

Consider two data sets with the following statistics:

- **Set A**: mean 50 and standard deviation 5.
  $$CV_A = \frac{5}{50} \times 100\% = 0.1 \times 100\% = 10\%$$

- **Set B**: mean 500 and standard deviation 20.
  $$CV_B = \frac{20}{500} \times 100\% = 0.04 \times 100\% = 4\%$$

B's standard deviation (20) is four times A's (5), but **relative to the mean**, A varies more: $CV_A = 10\% > CV_B = 4\%$. That is the kind of comparison the CV is for.

<div style="border-left: 4px solid #ff5722; padding: 0.5em; background-color: #fbe9e7; margin: 1em 0;">
  <strong>⚠️ Important limitations</strong>
  <ul>
    <li><strong>Mean near zero:</strong> since we divide by the mean, a value close to zero makes the CV blow up and lose its meaning.</li>
    <li><strong>Ratio scales only</strong> (with an absolute zero, such as weight, height or income). On scales with an arbitrary zero, the CV depends on the unit chosen. Example: the temperatures 10, 20 and 30 °C have a mean of 20 °C and a standard deviation of 10 °C, so $CV = \frac{10}{20} = 50\%$. The same temperatures in Fahrenheit are 50, 68 and 86 °F, with a mean of 68 °F and a standard deviation of 18 °F, and $CV = \frac{18}{68} \approx 26.5\%$. Same days, same heat — different CVs.</li>
  </ul>
</div>

---

## 5. Interquartile Range (IQR)

The **interquartile range** is the difference between the third quartile ($Q_3$, the 75th percentile) and the first quartile ($Q_1$, the 25th percentile), that is, the band that holds the middle 50% of the data.

### Formula

$$IQR = Q_3 - Q_1$$

### Worked Example

Consider this sorted set of ages ($n = 7$):

$$\{x_{(1)}, x_{(2)}, x_{(3)}, x_{(4)}, x_{(5)}, x_{(6)}, x_{(7)}\} = \{18, 20, 22, 25, 30, 35, 40\}$$

Here we use the positions $\frac{n+1}{4}$ and $\frac{3(n+1)}{4}$:

1. **First Quartile ($Q_1$)**:
   - Position: $\dfrac{n+1}{4} = \dfrac{7+1}{4} = \dfrac{8}{4} = 2$
   - $Q_1 = x_{(2)} = 20$

2. **Third Quartile ($Q_3$)**:
   - Position: $\dfrac{3(n+1)}{4} = \dfrac{3 \times 8}{4} = \dfrac{24}{4} = 6$
   - $Q_3 = x_{(6)} = 35$

3. **Interquartile Range**:
   $$IQR = Q_3 - Q_1 = 35 - 20 = 15 \text{ years}$$

**Interpretation:** the middle 50% of the ages lie between 20 and 35 years, a band of 15 years.

<div style="border-left: 4px solid #2196F3; padding: 0.5em; background-color: #e3f2fd; margin: 1em 0;">
  <strong>💡 Quartiles depend on the method</strong><br>
  There is no single quartile formula: Hyndman and Fan (1996) compared nine definitions used by statistical software. With the same data, the default method in Julia and R (called "type 7") gives $Q_1 = 21$, $Q_3 = 32.5$ and $IQR = 11.5$, not 20, 35 and 15. Neither is wrong; when comparing results, check which method was used. The difference shrinks when there is a lot of data.
</div>

<div style="border-left: 4px solid #673ab7; padding: 0.5em; background-color: #ede7f6; margin: 1em 0;">
  <strong>🔍 Spotting outliers</strong><br>
  The IQR is used to identify atypical values: by the boxplot criterion, values below $Q_1 - 1.5 \times IQR$ or above $Q_3 + 1.5 \times IQR$ are outliers. In our example (with $Q_1 = 20$, $Q_3 = 35$ and $IQR = 15$):
  <ul>
    <li>Margin: $1.5 \times 15 = 22.5$</li>
    <li>Lower limit: $20 - 22.5 = -2.5$</li>
    <li>Upper limit: $35 + 22.5 = 57.5$</li>
  </ul>
  Every age (from 18 to 40) lies between $-2.5$ and $57.5$, so there are no outliers in this set.
</div>

---

## Comparing the Measures

| Measure | Advantages | Limitations |
|--------|-----------|------------|
| **Range** | Easy to compute | Depends only on the extremes; sensitive to outliers |
| **Variance** | Uses all the data | Squared unit |
| **Standard Deviation** | Same unit as the data | Sensitive to outliers |
| **Coefficient of Variation** | Compares sets on different scales | Useless with a mean near zero or outside ratio scales |
| **IQR** | Resistant to outliers | Ignores the 25% at each end; depends on the quartile method |

---

## Practical Applications

1. **Quality control**: the standard deviation is used in control charts to monitor processes.
2. **Finance**: the standard deviation of returns is used as a measure of an investment's risk.
3. **Research**: the IQR is used in boxplots to spot atypical values.
4. **Meteorology**: the daily temperature range (high minus low) is a measure of dispersion used in weather forecasts.

---

## References

1. Fisher, R. A. (1918). The correlation between relatives on the supposition of Mendelian inheritance. *Transactions of the Royal Society of Edinburgh*, 52(2), 399–433.
2. Hyndman, R. J.; Fan, Y. (1996). Sample quantiles in statistical packages. *The American Statistician*, 50(4), 361–365. DOI: [10.1080/00031305.1996.10473566](https://doi.org/10.1080/00031305.1996.10473566).
3. NIST/SEMATECH. *e-Handbook of Statistical Methods*, section 1.3.5.6, "Measures of Scale". Available at <https://www.itl.nist.gov/div898/handbook/eda/section3/eda356.htm>. Accessed November 23, 2026.
4. Pearson, K. (1894). Contributions to the mathematical theory of evolution. I. On the dissection of asymmetrical frequency curves. *Philosophical Transactions of the Royal Society of London. A*, 185, 71–110.

### Further reading

- Bussab, W. O.; Morettin, P. A. (2023). *Estatística Básica*. 10th ed. Saraiva Uni. (in Portuguese)
- Triola, M. F. (2024). *Introdução à Estatística*. 14th ed. LTC. (in Portuguese; translation of *Elementary Statistics*)
