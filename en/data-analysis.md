---
layout: page
title: Data Analysis
lang: en
ref: analise-de-dados
permalink: /en/data-analysis/
order: 4
mathjax: true
description: "Data analysis step by step: question, collection, cleaning, exploration, outliers, charts, correlation, regression and metrics to evaluate models."
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
    max-width: 800px;
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
    vertical-align: top;
    color: var(--mk-ink);
  }

  .mk-table tr:last-child td {
    border-bottom: none;
  }

  .mk-example {
    padding: 1.4rem;
    border-radius: 18px;
    background: linear-gradient(135deg, var(--mk-surface) 0%, var(--mk-tint-warn) 100%);
    border: 1px solid rgba(196, 122, 44, 0.18);
    box-shadow: 0 10px 25px rgba(11, 31, 53, 0.06);
    margin: 1.5rem 0;
  }

  .mk-example h3 {
    margin-top: 0;
    color: var(--mk-ink);
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
  <span class="mk-tag">DATA • PATTERNS • DECISIONS</span>

  <h1>Data Analysis</h1>

  <p>
    <strong>Data Analysis</strong> is the process of collecting, organizing, cleaning,
    transforming, visualizing and interpreting data in order to produce useful information.
    It combines Statistics, Probability, Computing and critical thinking to
    understand real phenomena and support decisions.
  </p>
</section>

## What is Data Analysis?

Analyzing data is not just about making charts or computing averages.  
Data Analysis is a complete process that starts with a question and ends with an interpretation.

In general, it tries to answer questions such as:

- What do the data show?
- Is there an important pattern?
- Are there strange or inconsistent values?
- Which variables seem to be related?
- Can some behavior be predicted or explained?
- What decision can be made from the evidence?

<div class="mk-note">
  <strong>Key idea:</strong> raw data do not speak for themselves. Analysis turns
  scattered records into organized, interpretable and useful information.
</div>

---

## The Data Analysis cycle

A good analysis usually follows a logical sequence.  
This cycle helps avoid hasty conclusions and improves the quality of the results.

<div class="mk-grid">

  <div class="mk-card">
    <h3>1. Question</h3>
    <p>
      Every analysis starts with a well-defined question. Without a clear question,
      it is easy to produce charts that look nice but are of little use.
    </p>
  </div>

  <div class="mk-card">
    <h3>2. Collection</h3>
    <p>
      Data can come from spreadsheets, databases, forms, information systems,
      APIs, surveys, sensors or administrative records.
    </p>
  </div>

  <div class="mk-card">
    <h3>3. Cleaning</h3>
    <p>
      Before analyzing, you need to fix errors, handle missing values,
      standardize names, remove duplicates and check for inconsistencies.
    </p>
  </div>

  <div class="mk-card">
    <h3>4. Exploration</h3>
    <p>
      Exploratory analysis looks for patterns, distributions, relationships between variables
      and possible outliers.
    </p>
  </div>

  <div class="mk-card">
    <h3>5. Modeling</h3>
    <p>
      When needed, statistical models or algorithms are used to explain,
      predict or classify phenomena.
    </p>
  </div>

  <div class="mk-card">
    <h3>6. Communication</h3>
    <p>
      Results must be presented clearly, visually and honestly,
      with conclusions that the data can support.
    </p>
  </div>

</div>

---

## Data, information and decision

A table full of numbers is not necessarily information yet.

We can think in three levels:

<table class="mk-table">
  <thead>
    <tr>
      <th>Level</th>
      <th>Description</th>
      <th>Example</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Data</td>
      <td>Raw record, not yet interpreted.</td>
      <td>Service time: 12 minutes.</td>
    </tr>
    <tr>
      <td>Information</td>
      <td>Data organized and put in context.</td>
      <td>The mean service time was 12 minutes.</td>
    </tr>
    <tr>
      <td>Decision</td>
      <td>Action taken based on the interpretation of the information.</td>
      <td>Add staff during the busiest hours.</td>
    </tr>
  </tbody>
</table>

<div class="mk-note">
  The quality of the decision depends on the quality of the data, of the analysis and of the interpretation.
</div>

---

## Types of data

Before choosing a statistical technique or a chart, you need to understand the type of variable being analyzed.

<table class="mk-table">
  <thead>
    <tr>
      <th>Variable type</th>
      <th>Description</th>
      <th>Examples</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Nominal qualitative</td>
      <td>Categories with no natural order.</td>
      <td>Sex, color, city, product type.</td>
    </tr>
    <tr>
      <td>Ordinal qualitative</td>
      <td>Categories with a natural order.</td>
      <td>Low, medium or high satisfaction.</td>
    </tr>
    <tr>
      <td>Discrete quantitative</td>
      <td>Countable numeric values.</td>
      <td>Number of children, number of service requests.</td>
    </tr>
    <tr>
      <td>Continuous quantitative</td>
      <td>Numeric values measured on a continuous scale.</td>
      <td>Time, weight, height, income, temperature.</td>
    </tr>
  </tbody>
</table>

---

## Data cleaning

Data cleaning is one of the most important stages of the analysis.  
It often takes more time than the modeling itself.

Some common problems are:

- missing values;
- names written in different ways;
- dates in inconsistent formats;
- numbers stored as text;
- duplicate records;
- typos;
- impossible values;
- mixed units of measurement.

<div class="mk-example">
  <h3>Simple example</h3>

  Imagine a column called <strong>city</strong> with the following values
  (Petrolina is a city in the Brazilian state of Pernambuco, abbreviated PE):

  <div class="mk-formula">

  $$
  \text{Petrolina},\ \text{petrolina},\ \text{PETROLINA},\ \text{Petrolina-PE}
  $$

  </div>

  Although they all refer to the same city, the computer may treat these values
  as different categories. That is why the records need to be standardized before the analysis.
</div>

---

## Missing values

Missing values appear when some piece of information was not recorded.

They can come from a system failure, human error, a refusal to answer, a lost file,
a collection problem, or simply because the information does not apply to the case.

<table class="mk-table">
  <thead>
    <tr>
      <th>Situation</th>
      <th>Possible treatment</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Few missing values</td>
      <td>Consider removing the rows, if this does not harm the analysis.</td>
    </tr>
    <tr>
      <td>Many missing values</td>
      <td>Investigate the cause and assess whether the variable is still reliable.</td>
    </tr>
    <tr>
      <td>Informative missingness</td>
      <td>Create a specific category or indicator for missing values.</td>
    </tr>
    <tr>
      <td>Incomplete numeric data</td>
      <td>Use imputation with the mean, the median or more advanced methods, when it makes sense.</td>
    </tr>
  </tbody>
</table>

<div class="mk-note">
  Not every missing value should simply be deleted. Sometimes the absence itself carries information.
</div>

---

## Outliers

Outliers are observations that lie very far from the general pattern of the data.

They can represent:

- a typo;
- a measurement failure;
- a rare but genuine case;
- a real change in the process;
- an extreme event.

A common rule for flagging possible outliers uses the interquartile range:

<div class="mk-formula">

$$
IQR = Q_3 - Q_1
$$

</div>

Here, $$Q_1$$ and $$Q_3$$ are the first and third quartiles: 25% of the data lie below $$Q_1$$ and 75% below $$Q_3$$.
There are several methods for computing quartiles, and different software may give slightly different values for the same data.

The lower and upper fences are:

<div class="mk-formula">

$$
LF = Q_1 - 1.5 \cdot IQR
$$

$$
UF = Q_3 + 1.5 \cdot IQR
$$

</div>

Values below $$LF$$ or above $$UF$$ can be investigated as possible outliers.

<div class="mk-note">
  An outlier should not be removed automatically. First you need to understand
  whether it is an error or whether it represents an important real phenomenon.
</div>

---

## Exploratory Data Analysis

Exploratory Data Analysis, also known as EDA, is the stage in which we investigate the data before applying more complex models.

At this stage, we use statistics, tables and charts to understand:

- the distribution of the variables;
- means, medians and spread;
- patterns by group;
- relationships between variables;
- the presence of outliers;
- seasonality or trends;
- inconsistencies in the data.

<div class="mk-note">
  A good exploratory analysis prevents misapplied models and helps formulate better hypotheses.
</div>

---

## Useful descriptive measures

Some measures come up often in Data Analysis.

<table class="mk-table">
  <thead>
    <tr>
      <th>Measure</th>
      <th>Formula or idea</th>
      <th>Interpretation</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Mean</td>
      <td>$$\bar{x} = \frac{1}{n}\sum_{i=1}^{n}x_i$$</td>
      <td>Average value of the data set.</td>
    </tr>
    <tr>
      <td>Median</td>
      <td>Middle value of the sorted data.</td>
      <td>A center that resists extreme values.</td>
    </tr>
    <tr>
      <td>Standard deviation</td>
      <td>$$s = \sqrt{\frac{\sum_{i=1}^{n}(x_i-\bar{x})^2}{n-1}}$$</td>
      <td>Degree of spread of the data.</td>
    </tr>
    <tr>
      <td>Coefficient of variation</td>
      <td>$$CV = \frac{s}{\bar{x}}$$</td>
      <td>Spread relative to the mean. It only makes sense for positive data (mean greater than zero).</td>
    </tr>
    <tr>
      <td>Correlation</td>
      <td>Ranges from −1 to 1.</td>
      <td>Strength and direction of the linear relationship between two variables.</td>
    </tr>
  </tbody>
</table>

---

## Data visualization

Charts are essential tools for seeing patterns that a table can hide.

<table class="mk-table">
  <thead>
    <tr>
      <th>Chart</th>
      <th>When to use it?</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Bar chart</td>
      <td>Compare categories.</td>
    </tr>
    <tr>
      <td>Histogram</td>
      <td>See the distribution of a quantitative variable.</td>
    </tr>
    <tr>
      <td>Boxplot</td>
      <td>Compare distributions and spot possible outliers.</td>
    </tr>
    <tr>
      <td>Line chart</td>
      <td>Follow changes over time.</td>
    </tr>
    <tr>
      <td>Scatter plot</td>
      <td>Look at the relationship between two quantitative variables.</td>
    </tr>
    <tr>
      <td>Heat map</td>
      <td>Show intensity, correlations or patterns in a matrix.</td>
    </tr>
  </tbody>
</table>

<div class="mk-note">
  The best chart is the one that conveys the idea clearly, without distorting the interpretation.
</div>

---

## Relationships between variables

Many analyses try to find out whether two or more variables are related.

For example:

- income and years of schooling;
- study time and grade;
- waiting time and satisfaction;
- price and quantity sold;
- age and blood pressure.

For two quantitative variables, a common measure is the Pearson correlation:

<div class="mk-formula">

$$
r = \frac{\sum_{i=1}^{n}(x_i-\bar{x})(y_i-\bar{y})}
{\sqrt{\sum_{i=1}^{n}(x_i-\bar{x})^2}\sqrt{\sum_{i=1}^{n}(y_i-\bar{y})^2}}
$$

</div>

The general interpretation is:

<table class="mk-table">
  <thead>
    <tr>
      <th>Value of r</th>
      <th>Interpretation</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Close to 1</td>
      <td>Strong positive linear relationship.</td>
    </tr>
    <tr>
      <td>Close to −1</td>
      <td>Strong negative linear relationship.</td>
    </tr>
    <tr>
      <td>Close to 0</td>
      <td>No strong linear relationship.</td>
    </tr>
  </tbody>
</table>

<div class="mk-note">
  Correlation does not imply causation. Two variables can move together without one causing the other.
  Also, $r$ measures only the <strong>linear</strong> relationship: an $r$ close to 0 does not mean there is no
  relationship, because there may be a curved relationship that the Pearson correlation does not capture.
</div>

---

## Data modeling

Once we understand the data, we can use models to explain or predict phenomena.

A model is a simplified representation of reality.

For example, in a simple linear regression we can write:

<div class="mk-formula">

$$
Y = \beta_0 + \beta_1X + \varepsilon
$$

</div>

Where:

- $$Y$$ is the response variable;
- $$X$$ is the explanatory variable;
- $$\beta_0$$ is the intercept;
- $$\beta_1$$ is the slope;
- $$\varepsilon$$ is the random error.

The idea is to study how $$Y$$ changes when $$X$$ varies.

---

## Linear regression

Linear regression is one of the best-known techniques in Data Analysis.

It can be used to answer questions such as:

- Does study time help explain the grade?
- Does income vary with years of schooling?
- Does waiting time affect satisfaction?
- Does price affect the quantity sold?

In a simple linear regression:

<div class="mk-formula">

$$
\hat{Y} = b_0 + b_1X
$$

</div>

Here, $$b_0$$ and $$b_1$$ are the estimates of $$\beta_0$$ and $$\beta_1$$ computed from the data,
and $$\hat{Y}$$ is the value predicted by the line.

The difference between the observed value and the predicted value is called the residual:

<div class="mk-formula">

$$
e_i = y_i - \hat{y}_i
$$

</div>

<div class="mk-note">
  Good models are not the ones that merely “fit” the data, but the ones that help
  explain or predict in a coherent way.
</div>

The [Linear Regression]({{ '/en/data-analysis/linear-regression' | relative_url }}) page shows how to compute
$$b_0$$ and $$b_1$$ by least squares, with an example worked out by hand.

---

## Evaluation metrics

When we use predictive models, we need to evaluate how well they perform.

<table class="mk-table">
  <thead>
    <tr>
      <th>Metric</th>
      <th>Used for</th>
      <th>Idea</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>MAE</td>
      <td>Regression</td>
      <td>Mean absolute error.</td>
    </tr>
    <tr>
      <td>RMSE</td>
      <td>Regression</td>
      <td>Root mean squared error.</td>
    </tr>
    <tr>
      <td>R²</td>
      <td>Regression</td>
      <td>Proportion of the variability explained by the model.</td>
    </tr>
    <tr>
      <td>Accuracy</td>
      <td>Classification</td>
      <td>Proportion of correct classifications.</td>
    </tr>
    <tr>
      <td>Precision</td>
      <td>Classification</td>
      <td>Among the predicted positives, how many were actually positive.</td>
    </tr>
    <tr>
      <td>Recall</td>
      <td>Classification</td>
      <td>Among the actual positives, how many were identified.</td>
    </tr>
  </tbody>
</table>

### Mean absolute error

<div class="mk-formula">

$$
MAE = \frac{1}{n}\sum_{i=1}^{n}|y_i-\hat{y}_i|
$$

</div>

### Root mean squared error

<div class="mk-formula">

$$
RMSE = \sqrt{\frac{1}{n}\sum_{i=1}^{n}(y_i-\hat{y}_i)^2}
$$

</div>

### Coefficient of determination

<div class="mk-formula">

$$
R^2 = 1 - \frac{SS_{res}}{SS_{tot}}
$$

</div>

In all these formulas, $$y_i$$ is the observed value, $$\hat{y}_i$$ is the value predicted by the model and $$n$$ is the number of observations.
In $$R^2$$, $$SS_{res} = \sum_{i=1}^{n}(y_i-\hat{y}_i)^2$$ is the residual sum of squares and
$$SS_{tot} = \sum_{i=1}^{n}(y_i-\bar{y})^2$$ is the sum of squared deviations around the mean $$\bar{y}$$.

---

## Training and testing

In predictive modeling, the data are commonly split into two parts:

<table class="mk-table">
  <thead>
    <tr>
      <th>Set</th>
      <th>Role</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Training</td>
      <td>Used to fit the model.</td>
    </tr>
    <tr>
      <td>Test</td>
      <td>Used to evaluate the model's performance on unseen data.</td>
    </tr>
  </tbody>
</table>

This split helps check whether the model learned general patterns or just memorized the data.

<div class="mk-note">
  A model that does very well on the training set but poorly on the test set may be overfitting.
</div>

---

## Overfitting and underfitting

<table class="mk-table">
  <thead>
    <tr>
      <th>Problem</th>
      <th>What does it mean?</th>
      <th>Common symptom</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Underfitting</td>
      <td>The model is too simple to capture the pattern in the data.</td>
      <td>High error on both training and test sets.</td>
    </tr>
    <tr>
      <td>Overfitting</td>
      <td>The model fits the training data too closely.</td>
      <td>Low error on the training set and high error on the test set.</td>
    </tr>
    <tr>
      <td>Good fit</td>
      <td>The model captures general patterns without memorizing noise.</td>
      <td>Reasonable performance on both training and test sets.</td>
    </tr>
  </tbody>
</table>

---

## Practical example: analyzing a front desk

Imagine a data set with service times at a front desk.

Some of the variables could be:

<table class="mk-table">
  <thead>
    <tr>
      <th>Variable</th>
      <th>Type</th>
      <th>Possible analysis</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Date</td>
      <td>Temporal</td>
      <td>Analyze volume by day, month or hour.</td>
    </tr>
    <tr>
      <td>Staff member</td>
      <td>Categorical</td>
      <td>Compare the number of customers served by each person.</td>
    </tr>
    <tr>
      <td>Waiting time</td>
      <td>Continuous quantitative</td>
      <td>Compute the mean, median, quartiles and outliers.</td>
    </tr>
    <tr>
      <td>Service time</td>
      <td>Continuous quantitative</td>
      <td>Study spread, distribution and bottlenecks.</td>
    </tr>
    <tr>
      <td>Type of service</td>
      <td>Categorical</td>
      <td>Compare demand by the nature of the service.</td>
    </tr>
  </tbody>
</table>

A first question could be:

> At what times of day does the waiting time go up?

To answer it, we could compute the mean waiting time for each hour:

<div class="mk-formula">

$$
\bar{x}_{hour} = \frac{x_1+x_2+\cdots+x_n}{n}
$$

</div>

Here, $$x_1, x_2, \ldots, x_n$$ are the waiting times recorded in that hour and $$n$$ is how many customers were served in it.

Then we could compare the hours in a table or a line chart.

---

## An example of analytical reasoning

Suppose the following waiting times, in minutes:

<div class="mk-formula">

$$
5,\ 8,\ 10,\ 12,\ 15,\ 30
$$

</div>

The mean is:

<div class="mk-formula">

$$
\bar{x} = \frac{5+8+10+12+15+30}{6}
$$

$$
\bar{x} = \frac{80}{6}
$$

$$
\bar{x} \approx 13.33
$$

</div>

On average, each person waited about 13.33 minutes (the exact value is 80/6 = 40/3 minutes).

The six values are already in ascending order. Since the number of values is even, the median is the mean of the 3rd and 4th values:

<div class="mk-formula">

$$
Md = \frac{10+12}{2}
$$

$$
Md = 11
$$

</div>

Half of the waits lasted up to 11 minutes and the other half, 11 minutes or more.

In this case, the mean came out larger than the median because of the value 30. Without it, the mean of the five remaining values
would be $$\frac{5+8+10+12+15}{5} = \frac{50}{5} = 10$$ minutes: a single extreme value pulled the mean up by more than 3 minutes,
while the median changed less (from 11 to 10).

<div class="mk-note">
  This example shows why the mean must be interpreted with care when there are extreme values.
</div>

---

## Tools for Data Analysis

Data Analysis can be done with different tools.

<table class="mk-table">
  <thead>
    <tr>
      <th>Tool</th>
      <th>Common use</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Excel or Google Sheets</td>
      <td>Quick analyses, tables, filters and simple charts.</td>
    </tr>
    <tr>
      <td>SQL</td>
      <td>Querying, organizing and extracting data from relational databases.</td>
    </tr>
    <tr>
      <td>Python</td>
      <td>Automation, cleaning, modeling, data science and machine learning.</td>
    </tr>
    <tr>
      <td>R</td>
      <td>Statistical analysis, charts and modeling.</td>
    </tr>
    <tr>
      <td>Julia</td>
      <td>Scientific computing, Statistics, simulations and high-performance visualizations.</td>
    </tr>
    <tr>
      <td>Power BI</td>
      <td>Dashboards, reports and visual analysis of indicators.</td>
    </tr>
  </tbody>
</table>

---

## Good practices

A reliable analysis requires technical care and intellectual honesty.

Some good practices are:

- document the steps of the analysis;
- keep the original data;
- explain the cleaning criteria;
- check units of measurement;
- analyze missing data;
- avoid conclusions beyond what the data allow;
- use clear charts;
- compare the mean and the median;
- validate models on separate data;
- communicate uncertainty when it exists.

<div class="mk-note">
  A well-done data analysis is not just one that finds answers,
  but one that makes clear how the answers were obtained.
</div>

---

## Care in interpretation

Data Analysis can lead to wrong conclusions when it is done without context.

Some important precautions:

<table class="mk-table">
  <thead>
    <tr>
      <th>Common mistake</th>
      <th>Why is it dangerous?</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Confusing correlation with causation</td>
      <td>Two variables can be associated without one causing the other.</td>
    </tr>
    <tr>
      <td>Ignoring missing values</td>
      <td>Missingness can distort results or reveal collection problems.</td>
    </tr>
    <tr>
      <td>Removing outliers without justification</td>
      <td>Extreme values can represent important real phenomena.</td>
    </tr>
    <tr>
      <td>Choosing only favorable charts</td>
      <td>This can create a biased narrative.</td>
    </tr>
    <tr>
      <td>Using the mean for everything</td>
      <td>In skewed data, the median may represent the center better.</td>
    </tr>
    <tr>
      <td>Ignoring context</td>
      <td>Numbers without context can lead to wrong interpretations.</td>
    </tr>
  </tbody>
</table>

---

## Overall summary

<table class="mk-table">
  <thead>
    <tr>
      <th>Stage</th>
      <th>Goal</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Define the question</td>
      <td>Establish the problem to be investigated.</td>
    </tr>
    <tr>
      <td>Collect data</td>
      <td>Obtain the information needed for the analysis.</td>
    </tr>
    <tr>
      <td>Clean data</td>
      <td>Fix errors, handle missing values and standardize records.</td>
    </tr>
    <tr>
      <td>Explore data</td>
      <td>Understand distributions, patterns and relationships.</td>
    </tr>
    <tr>
      <td>Visualize data</td>
      <td>Communicate information with charts and tables.</td>
    </tr>
    <tr>
      <td>Model data</td>
      <td>Explain, predict or classify phenomena.</td>
    </tr>
    <tr>
      <td>Evaluate results</td>
      <td>Check quality, uncertainty and limitations.</td>
    </tr>
    <tr>
      <td>Communicate conclusions</td>
      <td>Turn the analysis into understanding and decisions.</td>
    </tr>
  </tbody>
</table>

---

<div class="mk-quote">
  <strong>Conclusion:</strong><br>
  Data Analysis is a bridge between numbers and decisions. It requires technique,
  organization, interpretation and critical thinking. More than applying formulas or producing
  charts, analyzing data means understanding a problem, investigating evidence and communicating
  conclusions in a clear, honest and useful way.
</div>
