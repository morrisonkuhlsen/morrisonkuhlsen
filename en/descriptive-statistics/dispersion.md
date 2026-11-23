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

In statistics, different symbols are used for the measures of dispersion, each with its own origin and meaning:

### 1. Variance
- **Population symbol**: $\sigma^2$ (lowercase sigma squared)
  - **Origin**: the Greek letter sigma ($\sigma$) was chosen by Karl Pearson in the early 20th century to denote the population standard deviation. The square of the standard deviation ($\sigma^2$) came to denote the variance.
  - **Meaning**: the square reflects the quadratic function used in the calculation, which removes negative values and gives more weight to larger deviations.

- **Sample symbol**: $s^2$
  - **Origin**: it follows the convention of using Latin letters for sample statistics. The "s" comes from "standard deviation".
  - **Meaning**: the exponent 2 indicates a squared measure of dispersion, following the same logic as the population notation.

### 2. Standard Deviation
- **Population symbol**: $\sigma$ (lowercase sigma)
  - **Origin**: introduced by Karl Pearson in 1894, based on the Greek letter sigma, the Greek "s" (for "standard").
  - **Meaning**: the typical deviation of the values from the population mean.

- **Sample symbol**: $s$
  - **Origin**: the Latin-letter version of the Greek sigma, following statistical convention.
  - **Meaning**: the standard deviation computed from a sample of the population.

### 3. Coefficient of Variation
- **Symbol**: $CV$
  - **Origin**: the initials of "Coefficient of Variation".
  - **Meaning**: the ratio between the standard deviation and the mean, expressed as a percentage. It has no separate notation for population and sample, since it is already a relative measure.

### 4. Interquartile Range
- **Symbol**: $IQR$ ("Interquartile Range")
  - **Origin**: the initials of the term, which became the standard in international usage.
  - **Meaning**: the distance between the first ($Q_1$) and third ($Q_3$) quartiles, covering the middle 50% of the data.

### 5. Range
- **Symbol**: $R$ (for "range")
  - **Origin**: the "R" comes from the word "range" itself.
  - **Meaning**: the difference between the maximum and minimum values of a data set.

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

$$\text{Range} = x_{\text{max}} - x_{\text{min}}$$

### Worked Example

Consider this sorted set of ages:

$$\{x_1, x_2, x_3, x_4, x_5, x_6, x_7\} = \{18, 20, 22, 25, 30, 35, 40\}$$

- Maximum value: $x_{\text{max}} = x_7 = 40$
- Minimum value: $x_{\text{min}} = x_1 = 18$
- Range: $R = x_{\text{max}} - x_{\text{min}} = 40 - 18 = 22$ years

### Advantages and Limitations

**Advantages:**
- Easy to compute
- Easy to interpret

**Limitations:**
- Sensitive to extreme values (outliers)
- Ignores how the data are distributed between the extremes

<div style="border-left: 4px solid #ff9800; padding: 0.5em; background-color: #fff3e0; margin: 1em 0;">
  <strong>⚠️ Watch out for outliers!</strong><br>
  The range can be <em>misleadingly large</em> even when most of the data are concentrated. For example, in a set like {1, 2, 2, 2, 2, 2, 100}, the range is 99, yet 6 of the 7 values are 1 or 2!
</div>

<div style="border-left: 4px solid #2196F3; padding: 0.5em; background-color: #e3f2fd; margin: 1em 0;">
  <strong>💡 Practical tip</strong><br>
  Use the range for a <em>first impression</em> of the dispersion, but always complement it with other measures, such as the standard deviation or the IQR, for a fuller picture.
</div>

---

## 2. Variance

The **variance** measures how far the values in a data set lie from the mean. It is computed as the mean of the squared deviations from the mean.

### Formula (Population)

$$\sigma^2 = \frac{1}{N}\sum_{i=1}^{N}(x_i - \mu)^2$$

### Formula (Sample)

$$s^2 = \frac{1}{n-1}\sum_{i=1}^{n}(x_i - \bar{x})^2$$

### Worked Example

Consider this sample of grades:

$$\{x_1, x_2, x_3, x_4, x_5\} = \{7, 8, 8, 9, 10\}$$


1. Compute the sample mean ($\bar{x}$):
   $$\bar{x} = \frac{\sum_{i=1}^{5}x_i}{n} = \frac{7 + 8 + 8 + 9 + 10}{5} = \frac{42}{5} = 8.4$$

2. Compute the deviations from the mean and square them:
   $$(x_1 - \bar{x})^2 = (7 - 8.4)^2 = (-1.4)^2 = 1.96$$
   $$(x_2 - \bar{x})^2 = (8 - 8.4)^2 = (-0.4)^2 = 0.16$$
   $$(x_3 - \bar{x})^2 = (8 - 8.4)^2 = (-0.4)^2 = 0.16$$
   $$(x_4 - \bar{x})^2 = (9 - 8.4)^2 = (0.6)^2 = 0.36$$
   $$(x_5 - \bar{x})^2 = (10 - 8.4)^2 = (1.6)^2 = 2.56$$

3. Add up the squared deviations:
   $$\sum_{i=1}^{5}(x_i - \bar{x})^2 = 1.96 + 0.16 + 0.16 + 0.36 + 2.56 = 5.2$$

4. Divide by $n-1$ (for the sample variance):
   $$s^2 = \frac{\sum_{i=1}^{n}(x_i - \bar{x})^2}{n-1} = \frac{5.2}{4} = 1.3$$

So the sample variance is $s^2 = 1.3$.

<div style="border-left: 4px solid #9c27b0; padding: 0.5em; background-color: #f3e5f5; margin: 1em 0;">
  <strong>🔍 A bit of history</strong><br>
  The concept of variance was formalized by Ronald Fisher in 1918, but its origins go back to earlier work by Gauss and Laplace on the method of least squares. Fisher initially called it "dispersion", but the term "variance" prevailed for its conceptual clarity.
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

$$s = \sqrt{s^2} = \sqrt{1.3} \approx 1.14$$


This means the sample standard deviation is $s \approx 1.14$ points. In other words, on average the grades deviate about $1.14$ points from the sample mean $\bar{x} = 8.4$.

<div style="border-left: 4px solid #4caf50; padding: 0.5em; background-color: #e8f5e9; margin: 1em 0;">
  <strong>📊 Empirical Rule (68-95-99.7)</strong><br>
  For normal distributions, approximately:
  - 68% of the data lie within 1 standard deviation of the mean ($\bar{x} \pm s$)
  - 95% within 2 standard deviations
  - 99.7% within 3 standard deviations
</div>

---

## 4. Coefficient of Variation (CV)

The **coefficient of variation** is a relative measure of dispersion, expressed as a percentage, that relates the standard deviation to the mean.

### Formula

$$CV = \left(\frac{s}{\bar{x}}\right) \times 100\%$$

### Worked Example

Consider two data sets with the following statistics:

- **Set A**: 
  - Mean: $\mu_A = 50$
  - Standard deviation: $\sigma_A = 5$
  - CV: $CV_A = \left(\frac{\sigma_A}{\mu_A}\right) \times 100\% = \left(\frac{5}{50}\right) \times 100\% = 10\%$

- **Set B**:
  - Mean: $\mu_B = 500$
  - Standard deviation: $\sigma_B = 20$
  - CV: $CV_B = \left(\frac{\sigma_B}{\mu_B}\right) \times 100\% = \left(\frac{20}{500}\right) \times 100\% = 4\%$

Since $CV_A > CV_B$ (10% > 4%), Set A shows greater dispersion relative to its mean.

<div style="border-left: 4px solid #ff5722; padding: 0.5em; background-color: #fbe9e7; margin: 1em 0;">
  <strong>⚠️ An important limitation</strong><br>
  The Coefficient of Variation <em>should not be used</em> when the mean is close to zero, since it can produce extremely high and misleading values. It also only makes sense for ratio-scale data (with a well-defined absolute zero).
</div>

---

## 5. Interquartile Range (IQR)

The **interquartile range** is the difference between the third quartile (Q3) and the first quartile (Q1): the band that holds the middle 50% of the data.

### Formula

$$IQR = Q3 - Q1$$

### Worked Example

Consider this sorted set of ages:

$$\{x_{(1)}, x_{(2)}, x_{(3)}, x_{(4)}, x_{(5)}, x_{(6)}, x_{(7)}\} = \{18, 20, 22, 25, 30, 35, 40\}$$


1. **First Quartile (Q₁)**:
   - Position: $Q_1$ = 25th percentile
   - Formula: $Q_1 = x_{(\frac{n+1}{4})} = x_{(2)} = 20$

2. **Third Quartile (Q₃)**:
   - Position: $Q_3$ = 75th percentile
   - Formula: $Q_3 = x_{(\frac{3(n+1)}{4})} = x_{(6)} = 35$

3. **Interquartile Range (IQR)**:
   $$IQR = Q_3 - Q_1 = 35 - 20 = 15 \text{ years}$$

So the middle 50% of the ages lie between 20 and 35 years, a spread of 15 years.

<div style="border-left: 4px solid #673ab7; padding: 0.5em; background-color: #ede7f6; margin: 1em 0;">
  <strong>🔍 Spotting outliers</strong><br>
  The IQR is key to identifying atypical values. Values below $Q_1 - 1.5 \times IQR$ or above $Q_3 + 1.5 \times IQR$ are usually treated as outliers. In our example, any value below $20 - 1.5 \times 15 = -2.5$ or above $35 + 1.5 \times 15 = 57.5$ would be considered an outlier.
</div>

---

## Comparing the Measures

| Measure | Advantages | Limitations |
|--------|-----------|------------|
| **Range** | Easy to compute | Sensitive to outliers |
| **Variance** | Uses all the data | Squared unit |
| **Standard Deviation** | Same unit as the data | Sensitive to outliers |
| **Coefficient of Variation** | Compares different sets | Does not work with a zero mean |
| **IQR** | Robust to outliers | Ignores 50% of the data |

---

## Practical Applications

1. **Quality control**: the standard deviation is widely used in control charts to monitor processes.
2. **Finance**: the standard deviation is used as a measure of investment risk.
3. **Research**: the IQR is often used in boxplots to spot atypical values.
4. **Meteorology**: the daily temperature range is a measure of dispersion used in weather forecasts.

---

## References

1. Bussab, W. O.; Morettin, P. A. (2017). *Estatística Básica*. Saraiva. (in Portuguese)
2. Triola, M. F. (2017). *Elementary Statistics*. Pearson.
3. Moore, D. S.; Notz, W. I.; Fligner, M. A. (2014). *The Basic Practice of Statistics*. W. H. Freeman.
