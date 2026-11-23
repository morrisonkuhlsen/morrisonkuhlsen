---
layout: page
title: Descriptive Statistics
lang: en
ref: estatistica-descritiva
permalink: /en/descriptive-statistics/
order: 1
mathjax: true
description: "Concepts and tools for describing and summarizing data clearly and objectively."
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
    background: #ffffff;
    border: 1px solid rgba(11, 31, 53, 0.08);
    box-shadow: 0 8px 22px rgba(11, 31, 53, 0.06);
    transition: transform 0.25s ease, box-shadow 0.25s ease;
  }

  .mk-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 14px 32px rgba(11, 31, 53, 0.1);
  }

  .mk-card h3 {
    margin-top: 0;
    color: #0b1f35;
  }

  .mk-card p {
    color: #4a5568;
    line-height: 1.65;
  }

  .mk-note {
    padding: 1.2rem 1.4rem;
    border-left: 5px solid #c47a2c;
    background: #fff7ed;
    border-radius: 12px;
    margin: 1.5rem 0;
    color: #3f2a14;
  }

  .mk-formula {
    padding: 1.2rem;
    margin: 1.2rem 0;
    border-radius: 16px;
    background: #f8fafc;
    border: 1px solid rgba(11, 31, 53, 0.08);
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
    border-bottom: 1px solid #e5e7eb;
    background: #ffffff;
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

- $$\bar{x}$$ is the mean;
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

because the number 5 appears more times than any other.

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

Both can have a similar mean, but Class B varies much more.

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

The variance measures how far, on average, the data lie from the mean.  
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
- $$\bar{x}$$ is the sample mean.

---

### Standard deviation

The standard deviation is the square root of the variance.  
It is widely used because it is back in the same unit as the original data.

<div class="mk-formula">

$$
s = \sqrt{s^2}
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

- quartiles;
- deciles;
- percentiles.

### Quartiles

Quartiles split the sorted data into four parts.

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
      <td>25% of the data lie below this value.</td>
    </tr>
    <tr>
      <td>Q2</td>
      <td>50% of the data lie below this value. It is the same as the median.</td>
    </tr>
    <tr>
      <td>Q3</td>
      <td>75% of the data lie below this value.</td>
    </tr>
  </tbody>
</table>

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

Consider the service time, in minutes, of 8 people:

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

The mean service time is approximately:

$$
10.38 \text{ minutes}
$$

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

> “Statistics is the grammar of science.”  
> — Karl Pearson
