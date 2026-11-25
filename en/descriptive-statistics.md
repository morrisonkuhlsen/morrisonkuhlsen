---
layout: page
title: Descriptive Statistics
lang: en
ref: estatistica-descritiva
permalink: /en/descriptive-statistics/
order: 1
mathjax: true
description: "What Descriptive Statistics is: mean, median, mode, range, variance, standard deviation and quartiles, with a step-by-step worked example."
---

<style>
  .mk-hero {
    padding: 2rem;
    margin: 1.5rem 0 2rem;
    border-radius: 22px;
    background: linear-gradient(135deg, #fff8e8 0%, #f7e0c6 45%, #fffdf8 100%);
    border: 1px solid rgba(120, 72, 20, 0.12);
    box-shadow: 0 12px 30px rgba(80, 45, 10, 0.08);
  }

  .mk-hero h1 {
    margin-top: 0;
    color: #0b1f35;
    font-size: clamp(2rem, 4vw, 3rem);
    line-height: 1.1;
  }

  .mk-hero p {
    font-size: 1.08rem;
    color: #34495e;
    max-width: 760px;
    line-height: 1.75;
  }

  .mk-tag {
    display: inline-block;
    margin-bottom: 0.8rem;
    padding: 0.35rem 0.75rem;
    border-radius: 999px;
    background: #0b1f35;
    color: #fff8e8;
    font-size: 0.82rem;
    font-weight: 700;
    letter-spacing: 0.03em;
  }

  .mk-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
    gap: 1rem;
    margin: 1.5rem 0;
  }

  .mk-card {
    padding: 1.25rem;
    border-radius: 18px;
    background: var(--mk-surface);
    border: 1px solid var(--mk-border);
    box-shadow: 0 8px 22px rgba(11, 31, 53, 0.06);
    transition: transform 0.25s ease, box-shadow 0.25s ease;
  }

  .mk-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 14px 32px rgba(11, 31, 53, 0.1);
  }

  .mk-card h3 {
    margin-top: 0;
    color: var(--mk-ink);
  }

  .mk-card p {
    color: var(--mk-ink-soft);
    line-height: 1.65;
  }

  .mk-note {
    padding: 1.2rem 1.4rem;
    border-left: 5px solid #c47a2c;
    background: var(--mk-tint-warn);
    border-radius: 12px;
    margin: 1.5rem 0;
    color: var(--mk-ink);
  }

  .mk-formula {
    padding: 1.2rem;
    margin: 1.2rem 0;
    border-radius: 16px;
    background: var(--mk-surface-2);
    border: 1px solid var(--mk-border);
    overflow-x: auto;
  }

  .mk-table {
    width: 100%;
    border-collapse: collapse;
    margin: 1.4rem 0;
    overflow: hidden;
    border-radius: 14px;
    box-shadow: 0 8px 20px rgba(11, 31, 53, 0.06);
  }

  .mk-table th {
    background: #0b1f35;
    color: #fff8e8;
    text-align: left;
    padding: 0.85rem;
  }

  .mk-table td {
    padding: 0.85rem;
    border-bottom: 1px solid var(--mk-border);
    background: var(--mk-surface);
    color: var(--mk-ink);
  }

  .mk-table tr:last-child td {
    border-bottom: none;
  }

  .mk-quote {
    margin: 2rem 0;
    padding: 1.4rem 1.6rem;
    border-radius: 18px;
    background: #0b1f35;
    color: #fff8e8;
    font-size: 1.1rem;
    line-height: 1.7;
  }

  .mk-quote strong {
    color: #f7e0c6;
  }
</style>

<section class="mk-hero">
  <span class="mk-tag">STATISTICS • DATA • INTERPRETATION</span>

  <h1>Descriptive Statistics</h1>

  <p>
    <strong>Descriptive Statistics</strong> is the branch of Statistics concerned with
    organizing, summarizing, visualizing and interpreting data. Before building models,
    making predictions or testing hypotheses, we need to understand what the data are
    showing, in a way that is clear, objective and easy to see.
  </p>
</section>

## What is Descriptive Statistics?

Descriptive Statistics is the researcher's first contact with the data.  
It does not necessarily try to make predictions or generalize to an entire population.  
Its main goal is to **describe the observed data set**.

In other words, it answers questions such as:

- What is a typical value in the data?
- Are the data widely spread out?
- Are there extreme values?
- Is the distribution symmetric or skewed?
- What patterns appear when we organize the data into tables or charts?

<div class="mk-note">
  <strong>Key idea:</strong> before interpreting any phenomenon, we need to
  turn raw data into understandable information.
</div>

---

## Why does Descriptive Statistics matter?

Picture a table with thousands of rows of student grades, service times,
sales figures or biological measurements. Looking at all those numbers directly
is confusing and not very productive.

Descriptive Statistics solves this by producing **numerical and visual summaries**.

<div class="mk-grid">

  <div class="mk-card">
    <h3>Organization</h3>
    <p>
      Data can be classified, sorted and grouped into tables,
      which makes a first reading of the phenomenon easier.
    </p>
  </div>

  <div class="mk-card">
    <h3>Summary</h3>
    <p>
      Measures such as the mean, median, mode, variance and standard deviation
      represent large data sets with just a few numbers.
    </p>
  </div>

  <div class="mk-card">
    <h3>Visualization</h3>
    <p>
      Charts make patterns, trends, spread and skewness much
      easier to see.
    </p>
  </div>

  <div class="mk-card">
    <h3>Interpretation</h3>
    <p>
      Descriptive analysis turns numbers into practical conclusions,
      supporting decisions in many different fields.
    </p>
  </div>

</div>

---

## The main measures of Descriptive Statistics

Descriptive Statistics is usually split into three large groups of measures:

1. **Measures of central tendency**
2. **Measures of dispersion**
3. **Measures of position**

Each group reveals a different aspect of how the data behave.

---

## 1. Measures of central tendency

Measures of central tendency show where the data seem to concentrate.  
They try to answer the question:

> Which value represents this data set well?

### Arithmetic mean

The arithmetic mean is one of the best-known measures.  
It is found by adding up all the values and dividing by the number of observations.

<div class="mk-formula">

$$
\bar{x} = \frac{x_1 + x_2 + x_3 + \cdots + x_n}{n}
$$

</div>

We can also write:

<div class="mk-formula">

$$
\bar{x} = \frac{\sum_{i=1}^{n} x_i}{n}
$$

</div>

Where:

- $$\bar{x}$$ is the sample mean;
- $$x_i$$ is each observed value;
- $$n$$ is the total number of observations.

### Example

Consider the grades:

$$
6,\ 7,\ 8,\ 9,\ 10
$$

The mean is:

<div class="mk-formula">

$$
\bar{x} = \frac{6 + 7 + 8 + 9 + 10}{5}
$$

$$
\bar{x} = \frac{40}{5}
$$

$$
\bar{x} = 8
$$

</div>

So the mean grade is **8**.

---

### Median

The median is the value in the middle position once the data are sorted.

If the number of observations is odd, the median is the middle value.  
If it is even, the median is the mean of the two middle values.

#### Example with an odd count

Data:

$$
3,\ 5,\ 7,\ 9,\ 11
$$

The median is:

$$
7
$$

#### Example with an even count

Data:

$$
4,\ 6,\ 8,\ 10
$$

The two middle values are $$6$$ and $$8$$. So:

<div class="mk-formula">

$$
Md = \frac{6 + 8}{2}
$$

$$
Md = 7
$$

</div>

---

### Mode

The mode is the value that appears most often in a data set.

Example:

$$
2,\ 3,\ 3,\ 4,\ 5,\ 5,\ 5,\ 6
$$

Here the mode is:

$$
5
$$

because the number 5 appears 3 times, more than any other value.

<div class="mk-note">
  A data set can have one mode, more than one mode, or no mode at all.
</div>

---

## 2. Measures of dispersion

While measures of central tendency show the “center” of the data, measures of dispersion show how spread out the data are.

Two classes can have the same mean and behave very differently.

For example:

- Class A: $$7,\ 7,\ 7,\ 7,\ 7$$
- Class B: $$2,\ 5,\ 7,\ 9,\ 12$$

Both have exactly the same mean:

<div class="mk-formula">

$$
\bar{x}_A = \frac{7 + 7 + 7 + 7 + 7}{5} = \frac{35}{5} = 7
\qquad
\bar{x}_B = \frac{2 + 5 + 7 + 9 + 12}{5} = \frac{35}{5} = 7
$$

</div>

But in Class A everyone scored 7, while in Class B the grades go from 2 to 12. The mean
alone does not show this difference; measures of dispersion do. The range, for example,
is $$7 - 7 = 0$$ in Class A and $$12 - 2 = 10$$ in Class B.

---

### Range

The range is the difference between the largest and the smallest observed value.

<div class="mk-formula">

$$
R = x_{\max} - x_{\min}
$$

</div>

Example:

$$
4,\ 6,\ 8,\ 10,\ 15
$$

We have:

$$
x_{\max} = 15
$$

$$
x_{\min} = 4
$$

Therefore:

<div class="mk-formula">

$$
R = 15 - 4 = 11
$$

</div>

---

### Variance

The variance measures how far the data lie from the mean. To compute it, we subtract the
mean from each value (this is the **deviation** of each value), square each deviation
and take a kind of average of those squares. The deviations are squared because,
otherwise, the positive and negative ones would cancel out: the sum of the deviations
from the mean is always zero.  
The larger the variance, the more spread out the values.

For a population:

<div class="mk-formula">

$$
\sigma^2 = \frac{\sum_{i=1}^{N}(x_i - \mu)^2}{N}
$$

</div>

For a sample:

<div class="mk-formula">

$$
s^2 = \frac{\sum_{i=1}^{n}(x_i - \bar{x})^2}{n - 1}
$$

</div>

Where:

- $$\sigma^2$$ is the population variance;
- $$s^2$$ is the sample variance;
- $$\mu$$ is the population mean;
- $$\bar{x}$$ is the sample mean;
- $$N$$ is the population size and $$n$$ is the sample size.

For a sample, we divide by $$n - 1$$ rather than $$n$$. This corrects the tendency of the
variance computed with $$n$$ to underestimate, on average, the population variance.
The full explanation is in [Measures of Dispersion]({{ '/en/descriptive-statistics/dispersion' | relative_url }}).

---

### Standard deviation

The standard deviation is the square root of the variance.  
It is widely used because it is back in the same unit as the original data.

<div class="mk-formula">

$$
s = \sqrt{s^2} \qquad \text{(sample)} \qquad\qquad \sigma = \sqrt{\sigma^2} \qquad \text{(population)}
$$

</div>

If the variance is in “points squared”, the standard deviation is measured in “points” again.

<div class="mk-note">
  The standard deviation is one of the most important measures in Descriptive Statistics,
  because it shows how stable or unstable a data set is.
</div>

---

## 3. Measures of position

Measures of position show where a value sits relative to the rest of the data set.

The main ones are:

- **quartiles** ($$Q_1$$, $$Q_2$$, $$Q_3$$) split the sorted data into four parts;
- **deciles** ($$D_1$$ to $$D_9$$) split it into ten parts;
- **percentiles** ($$P_1$$ to $$P_{99}$$) split it into a hundred parts. The 90th percentile,
  for example, is the value with about 90% of the data below it.

So $$Q_1 = P_{25}$$, $$Q_2 = D_5 = P_{50}$$ and $$Q_3 = P_{75}$$.

### Quartiles

Quartiles split the sorted data into four parts, each holding about 25% of the data.

<table class="mk-table">
  <thead>
    <tr>
      <th>Quartile</th>
      <th>Interpretation</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Q1</td>
      <td>About 25% of the data lie below this value.</td>
    </tr>
    <tr>
      <td>Q2</td>
      <td>About 50% of the data lie below this value. It is the median.</td>
    </tr>
    <tr>
      <td>Q3</td>
      <td>About 75% of the data lie below this value.</td>
    </tr>
  </tbody>
</table>

<div class="mk-note">
  <strong>Why "about"?</strong> With few data points, there is not always a value with
  exactly 25% of the data below it. That is why there are several methods for computing
  quartiles (Hyndman and Fan, 1996, describe nine), and different software can give slightly
  different values for the same data. When you report a quartile, say which method you used.
</div>

---

## Tables and charts in Descriptive Statistics

Besides numerical measures, Descriptive Statistics uses charts to make interpretation easier.

<table class="mk-table">
  <thead>
    <tr>
      <th>Chart type</th>
      <th>Main use</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Bar chart</td>
      <td>Comparing categories.</td>
    </tr>
    <tr>
      <td>Histogram</td>
      <td>Seeing the distribution of quantitative data.</td>
    </tr>
    <tr>
      <td>Boxplot</td>
      <td>Spotting the median, the quartiles and possible extreme values.</td>
    </tr>
    <tr>
      <td>Line chart</td>
      <td>Following change over time.</td>
    </tr>
    <tr>
      <td>Scatter plot</td>
      <td>Looking at the relationship between two quantitative variables.</td>
    </tr>
  </tbody>
</table>

---

## A worked example

Consider the service time, in minutes, of 8 people (illustrative numbers, chosen to keep
the arithmetic simple). We treat these 8 people as a **sample** of the customers served:

$$
5,\ 7,\ 8,\ 8,\ 10,\ 12,\ 15,\ 18
$$

### Mean

<div class="mk-formula">

$$
\bar{x} = \frac{5 + 7 + 8 + 8 + 10 + 12 + 15 + 18}{8}
$$

$$
\bar{x} = \frac{83}{8}
$$

$$
\bar{x} = 10.375
$$

</div>

The mean service time is $$10.375$$ minutes (exact value), or $$10.38$$ minutes
rounded to two decimal places.

### Median

Since there are 8 values, the median is the mean of the 4th and 5th values:

$$
8 \quad \text{and} \quad 10
$$

<div class="mk-formula">

$$
Md = \frac{8 + 10}{2}
$$

$$
Md = 9
$$

</div>

The median is:

$$
9 \text{ minutes}
$$

### Mode

The value that repeats most often is:

$$
8
$$

So the mode is:

$$
Mo = 8
$$

The value 8 appears 2 times; every other value appears once.

### Range

The longest time is $$x_{\max} = 18$$ and the shortest is $$x_{\min} = 5$$:

<div class="mk-formula">

$$
R = 18 - 5 = 13
$$

</div>

### Variance and standard deviation

Since the data are a sample, we use the formula with $$n - 1 = 8 - 1 = 7$$ in the denominator.
The mean, computed above, is $$\bar{x} = 10.375$$. Each row of the table shows the deviation
$$x_i - \bar{x}$$ and its square:

<table class="mk-table">
  <thead>
    <tr>
      <th>x<sub>i</sub></th>
      <th>x<sub>i</sub> − x̄</th>
      <th>(x<sub>i</sub> − x̄)²</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>5</td><td>5 − 10.375 = −5.375</td><td>28.890625</td></tr>
    <tr><td>7</td><td>7 − 10.375 = −3.375</td><td>11.390625</td></tr>
    <tr><td>8</td><td>8 − 10.375 = −2.375</td><td>5.640625</td></tr>
    <tr><td>8</td><td>8 − 10.375 = −2.375</td><td>5.640625</td></tr>
    <tr><td>10</td><td>10 − 10.375 = −0.375</td><td>0.140625</td></tr>
    <tr><td>12</td><td>12 − 10.375 = 1.625</td><td>2.640625</td></tr>
    <tr><td>15</td><td>15 − 10.375 = 4.625</td><td>21.390625</td></tr>
    <tr><td>18</td><td>18 − 10.375 = 7.625</td><td>58.140625</td></tr>
    <tr><td><strong>Sum</strong></td><td><strong>0</strong></td><td><strong>133.875</strong></td></tr>
  </tbody>
</table>

The deviations add up to zero, as expected. Now we divide the sum of squares by 7:

<div class="mk-formula">

$$
s^2 = \frac{133.875}{7}
$$

$$
s^2 = 19.125 \text{ minutes}^2
$$

</div>

And take the square root:

<div class="mk-formula">

$$
s = \sqrt{19.125}
$$

$$
s \approx 4.37 \text{ minutes}
$$

</div>

### Interpretation

- A typical service takes around 9 to 10 minutes: the median is 9 minutes and the mean is
  10.375 minutes.
- The mean is above the median because the two longest times (15 and 18 minutes) pull the
  mean up. The median does not react to them: if the last time were 40 minutes instead of 18,
  the median would still be 9 minutes.
- The standard deviation of about 4.37 minutes says that the times typically lie around
  4 minutes above or below the mean.
- What these numbers do **not** say: with only 8 services, they describe this sample. Claiming
  that the mean time of **all** services is 10.375 minutes is already inference, and it calls
  for the tools of Statistical Inference (such as a confidence interval).

---

## Mean, median and mode: when to use each

<table class="mk-table">
  <thead>
    <tr>
      <th>Measure</th>
      <th>When is it most useful?</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Mean</td>
      <td>When the data have no very strong extreme values.</td>
    </tr>
    <tr>
      <td>Median</td>
      <td>When very high or very low values are distorting the mean.</td>
    </tr>
    <tr>
      <td>Mode</td>
      <td>When we want to find the most frequent value.</td>
    </tr>
  </tbody>
</table>

---

## Descriptive Statistics and exploratory analysis

Descriptive Statistics is closely tied to **Exploratory Data Analysis**, known as EDA.

The idea of exploratory analysis is to investigate the data before applying more advanced models.  
Along the way, we look for:

- patterns;
- trends;
- outliers;
- typing errors;
- relationships between variables;
- possible hypotheses for future studies.

<div class="mk-note">
  A good statistical analysis starts with a good description of the data.
  Without it, any model can become just a formula applied without context.
</div>

---

## Overview

<table class="mk-table">
  <thead>
    <tr>
      <th>Category</th>
      <th>Main tools</th>
      <th>What does it reveal?</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Central tendency</td>
      <td>Mean, median and mode</td>
      <td>The center of the data.</td>
    </tr>
    <tr>
      <td>Dispersion</td>
      <td>Range, variance and standard deviation</td>
      <td>How spread out the data are.</td>
    </tr>
    <tr>
      <td>Position</td>
      <td>Quartiles, deciles and percentiles</td>
      <td>Where values sit relative to each other.</td>
    </tr>
    <tr>
      <td>Visualization</td>
      <td>Tables, charts, histograms and boxplots</td>
      <td>The shape and patterns of the data.</td>
    </tr>
  </tbody>
</table>

---

<div class="mk-quote">
  <strong>Conclusion:</strong><br>
  Descriptive Statistics is the foundation of all data analysis. It turns
  isolated observations into organized information, revealing patterns, trends,
  variation and behavior that would go unnoticed just by looking at the raw data.
</div>

## Further reading on this site

- [Measures of Central Tendency]({{ '/en/descriptive-statistics/central-tendency' | relative_url }}): mean, median, mode and when each one misleads.
- [Measures of Dispersion]({{ '/en/descriptive-statistics/dispersion' | relative_url }}): range, variance, standard deviation, coefficient of variation and interquartile range.
- [Statistical Charts]({{ '/en/descriptive-statistics/charts' | relative_url }}): which chart to use for each kind of data.
- [Exploratory Data Analysis]({{ '/en/descriptive-statistics/exploratory-analysis' | relative_url }}): how to investigate a data set before modeling it.
- [Data Visualization]({{ '/en/descriptive-statistics/visualization' | relative_url }}): principles for clear and honest charts.

---

## References

1. Hyndman, R. J.; Fan, Y. (1996). Sample quantiles in statistical packages. *The American Statistician*, 50(4), 361–365. DOI: [10.1080/00031305.1996.10473566](https://doi.org/10.1080/00031305.1996.10473566).

### Further reading

- Bussab, W. O.; Morettin, P. A. (2023). *Estatística Básica*. 10th ed. Saraiva Uni. (in Portuguese)
- Triola, M. F. (2024). *Introdução à Estatística*. 14th ed. LTC. (in Portuguese; translation of *Elementary Statistics*)
