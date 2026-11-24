---
layout: page
title: Statistical Charts
lang: en
ref: graficos
parent: estatistica-descritiva
permalink: /en/descriptive-statistics/charts
order: 3
mathjax: true
description: "Visual representations for communicating and interpreting statistical data clearly."
---

**Statistical charts** are essential visual tools for exploratory data analysis. They let us see patterns, trends, relationships and anomalies that may not be obvious in tables of raw data. A good chart can communicate complex information clearly and efficiently.

## Types of Charts and When to Use Them

1. **Charts for Qualitative Variables**
   - Bar Chart
   - Pie Chart
   - Donut Chart

2. **Charts for Quantitative Variables**
   - Histogram
   - Boxplot (Box-and-Whisker Plot)
   - Density Plot

3. **Charts for Relationships Between Variables**
   - Scatter Plot
   - Line Chart
   - Heatmap

4. **Charts for Time Series**
   - Time-Series Line Chart
   - Area Chart

This page covers six of them in detail: bar, pie, histogram, boxplot, scatter and time-series line charts.

---

<div style="border-left: 4px solid #4CAF50; padding: 0.5em; background-color: #e8f5e9;">
  <strong>📊 Principles of Visual Design</strong><br>
  A good chart should be: <em>accurate, clear, efficient and revealing</em>. As Ben Shneiderman, one of the pioneers of information visualization, puts it: “The purpose of visualization is insight, not pictures” (see the <a href="https://medium.com/multiple-views-visualization-research-explained/the-purpose-of-visualization-is-insight-not-pictures-an-interview-with-visualization-pioneer-ben-beb15b2d8e9b">interview with Shneiderman</a> on the <em>Multiple Views</em> blog).
</div>

---

## 1. Bar Chart

The **bar chart** is ideal for comparing categories or showing the distribution of a categorical variable.

### When to Use It
- Comparing amounts across distinct categories
- Showing how often each category occurs
- Qualitative or discrete quantitative data

### Worked Example

Consider the number of students per program at a college (illustrative numbers):

| Program | Students |
|---|---:|
| Engineering | 120 |
| Medicine | 90 |
| Law | 85 |
| Business Administration | 110 |
| **Total** | **405** |

<div style="text-align: center; margin: 1em 0;">
  <img src="{{ site.baseurl }}/assets/images/grafico-barras-cursos-en.png" alt="Bar chart of students per program: Engineering 120, Medicine 90, Law 85 and Business Administration 110" style="max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 4px;">
  <p style="font-size: 0.8em; color: #666;">Figure 1: Number of students per program. Each bar's height is the number of students; compare the heights against the vertical axis.</p>
</div>

**Reading it:** Engineering has the most students (120) and Law the fewest (85). The difference between them is $120 - 85 = 35$ students. Since every bar starts at zero, height is proportional to the number of students: the Engineering bar is $120 / 85 \approx 1.41$ times the Law bar.

### Advantages and Limitations

**Advantages:**
- Easy to interpret
- Good for comparing categories
- Works well with few categories

**Limitations:**
- Can get cluttered with many categories
- Does not show the distribution within each category

<div style="border-left: 4px solid #2196F3; padding: 0.5em; background-color: #e3f2fd; margin: 1em 0;">
  <strong>💡 Visualization tip</strong><br>
  Sort the bars by value to make comparison easier. Use consistent colors and avoid very long labels that may overlap. A bar chart's axis should start at zero: cutting the axis makes small differences look huge.
</div>

---

## 2. Pie Chart

The **pie chart** is a circular chart divided into slices that represent proportions of a whole. Each slice corresponds to a category, and its angle (and area) is proportional to the amount it represents.

### When to Use It
- Showing proportions of a whole (when the parts add up to 100%)
- Comparing just a few categories
- Quickly communicating simple distributions

### Worked Example

Share of each operating system in web traffic from mobile phones worldwide, averaged over 2023, according to StatCounter:

| System | Share |
|---|---:|
| Android | 70.37% |
| iOS | 29.06% |
| Others (Samsung, KaiOS, Windows, Linux and the rest) | 0.57% |
| **Total** | **100.00%** |

Source: StatCounter Global Stats, *Mobile Operating System Market Share Worldwide*, yearly granularity, 2023 ([gs.statcounter.com](https://gs.statcounter.com/os-market-share/mobile/worldwide)), accessed November 23, 2026. StatCounter measures the share of **page views** on sites that use its counter, not device sales.

To draw the pie, each percentage becomes an angle. A circle has 360°, so:

$$\text{angle} = \frac{\text{percentage}}{100} \times 360°$$

- Android: $\dfrac{70.37}{100} \times 360° = 0.7037 \times 360° = 253.332° \approx 253.3°$
- iOS: $\dfrac{29.06}{100} \times 360° = 0.2906 \times 360° = 104.616° \approx 104.6°$
- Others: $\dfrac{0.57}{100} \times 360° = 0.0057 \times 360° = 2.052° \approx 2.1°$

Check: $253.332° + 104.616° + 2.052° = 360.000°$.

<div style="text-align: center; margin: 1em 0;">
  <img src="{{ site.baseurl }}/assets/images/grafico_pizza-en.png" alt="Pie chart: Android 70.4%, iOS 29.1% and others 0.6% of mobile web traffic worldwide in 2023" style="max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 4px;">
  <p style="font-size: 0.8em; color: #666;">Figure 2: Mobile operating systems worldwide, 2023 average (StatCounter). The legend rounds each value to one decimal place, so it adds up to 100.1%.</p>
</div>

**Reading it:** the one message the pie conveys well is that Android accounts for more than two thirds of the total ($70.37\% > 66.67\%$). The "Others" slice, at 0.57%, is barely visible — and comparing small slices by eye is exactly where pie charts fail.

### Advantages and Limitations

**Advantages:**
- Easy for a general audience to understand
- Clearly shows the part-to-whole relationship
- Visually appealing in presentations

**Limitations:**
- Hard to compare slices of similar size
- Inefficient with many categories
- Makes precise comparisons difficult

### What Statisticians Think

<div style="border-left: 4px solid #FF9800; padding: 0.5em; background-color: #FFF3E0; margin: 1em 0;">
  <strong>🔍 John Tukey</strong><br>
  Known as the "father of exploratory data analysis", Tukey created charts designed to show the <em>distribution</em> of the data, such as the boxplot and the stem-and-leaf plot, presented in his book <em>Exploratory Data Analysis</em> (1977). A pie only shows the share of each category and says nothing about how the values are spread out — so Tukey's charts solve a different problem.
</div>

<div style="border-left: 4px solid #f44336; padding: 0.5em; background-color: #ffebee; margin: 1em 0;">
  <strong>❌ Edward Tufte</strong><br>
  In the classic <em>The Visual Display of Quantitative Information</em>, Tufte writes: “A table is nearly always better than a dumb pie chart; the only worse design than a pie chart is several of them, for then the viewer is asked to compare quantities located in spatial disarray.”
</div>

<div style="border-left: 4px solid #2196F3; padding: 0.5em; background-color: #e3f2fd; margin: 1em 0;">
  <strong>📊 Stephen Few</strong><br>
  In the article <em>Save the Pies for Dessert</em> (2007), Few argues that a bar graph compares the same information far more precisely than a pie. He grants the pie a single strength: showing how each part relates to the whole.
</div>

<div style="border-left: 4px solid #4CAF50; padding: 0.5em; background-color: #e8f5e9; margin: 1em 0;">
  <strong>📈 Naomi Robbins</strong><br>
  In <em>Creating More Effective Graphs</em> (2005), Robbins places the pie chart among the common charts that have limitations and recommends alternatives where values are read against a common scale, such as bar charts and dot plots.
</div>

### Recommended Alternatives

1. **Bar Chart**: for precise comparisons between categories
2. **Stacked Bar Chart**: for showing parts of a whole with more categories
3. **Area Chart**: for showing changes in proportions over time
4. **Waffle Chart**: a visually appealing alternative for showing proportions

<div style="border-left: 4px solid #9c27b0; padding: 0.5em; background-color: #f3e5f5; margin: 1em 0;">
  <strong>💡 So when should you use a pie chart?</strong><br>
  Despite the criticism, a pie chart can work well when:
  <ul>
    <li>You have only 2 or 3 categories</li>
    <li>The message is simple (e.g. "more than half", "two thirds")</li>
    <li>The audience is non-specialist and familiar with the format</li>
    <li>What matters is how each part relates to the whole, not a precise comparison between parts</li>
  </ul>
</div>

---

## 3. Histogram

The **histogram** shows the distribution of a continuous quantitative variable by grouping the data into intervals (classes, or bins).

### When to Use It
- Seeing the distribution of continuous data
- Identifying central tendency and spread
- Detecting skewness and outliers

### Worked Example

Consider the grades of 100 students on an exam, from 0 to 10, grouped into classes 2 points wide (illustrative numbers):

| Grade class | Frequency (students) |
|---|---:|
| [0, 2) | 5 |
| [2, 4) | 15 |
| [4, 6) | 30 |
| [6, 8) | 35 |
| [8, 10] | 15 |
| **Total** | **100** |

The notation [4, 6) means "from 4 up to 6, including 4 and excluding 6": a student with a grade of 6 falls in the [6, 8) class. The last class, [8, 10], includes 10.

Checking the total: $5 + 15 + 30 + 35 + 15 = 100$ students.

<div style="text-align: center; margin: 1em 0;">
  <img src="{{ site.baseurl }}/assets/images/histograma-en.png" alt="Histogram of 100 students' grades in classes 2 points wide: 5, 15, 30, 35 and 15 students" style="max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 4px;">
  <p style="font-size: 0.8em; color: #666;">Figure 3: Distribution of the 100 students' grades. The bars touch because the classes are continuous.</p>
</div>

**Reading it:** the most frequent class is [6, 8), with 35 students. Adding the two middle classes, $30 + 35 = 65$ students — 65% of the class — scored between 4 and 8. The left tail (low grades) is longer than the right one, a sign of slight left skew.

### Advantages and Limitations

**Advantages:**
- Shows the shape of the distribution
- Reveals modes and skewness
- Good for large data sets

**Limitations:**
- The choice of the number of classes affects the interpretation
- Can hide important details

<div style="border-left: 4px solid #9c27b0; padding: 0.5em; background-color: #f3e5f5; margin: 1em 0;">
  <strong>🔍 Sturges' Rule</strong><br>
  A rule of thumb for the number of classes $k$, proposed by Herbert Sturges (1926), is $k = 1 + \log_2(n)$, often written with base-10 logarithms as $k \approx 1 + 3.322 \log_{10}(n)$, where $n$ is the number of observations. The result is rounded to a whole number of classes.
</div>

**Example with the 100 students.** Here, $n = 100$.

1. Base-10 logarithm: $\log_{10}(100) = 2$, because $10^2 = 100$.
2. Multiplication: $3.322 \times 2 = 6.644$.
3. Addition: $k = 1 + 6.644 = 7.644$.
4. Rounding: $k \approx 8$ classes.

With 8 classes over the range 0 to 10, each class would be $\dfrac{10 - 0}{8} = 1.25$ points wide. Figure 3 uses 5 classes 2 points wide because round numbers are easier to read — a legitimate choice, but one that changes the picture. It illustrates the limitation above: the same data can look different with a different number of classes. Sturges' rule is only a starting point, not a requirement.

---

## 4. Boxplot (Box-and-Whisker Plot)

The **boxplot** summarizes the distribution of a quantitative variable through its quartiles, highlighting the median and possible outliers.

### When to Use It
- Comparing distributions across groups
- Identifying atypical values
- Seeing skewness and spread

### Elements of the Boxplot

In its most common version, proposed by Tukey, the boxplot has five elements (see Figure 4):

1. **The box**, which runs from the first quartile ($Q_1$) to the third quartile ($Q_3$) and holds the middle 50% of the data.
2. **The line inside the box**, which marks the median ($Q_2$).
3. **The fences**, which are not drawn: they sit $1.5 \times IQR$ below $Q_1$ and above $Q_3$, where $IQR = Q_3 - Q_1$.
4. **The whiskers**, which run from the box to the smallest and largest values that are still **inside** the fences.
5. **The isolated points**, which are the values **outside** the fences: the outliers.

There are other conventions (whiskers to the minimum and maximum, or to certain percentiles); when you read a boxplot, check which one was used.

### Worked Example

Consider the ages of the participants at an event (illustrative numbers), summarized as:
- Smallest value inside the fences: 18
- $Q_1$: 22
- Median: 25
- $Q_3$: 30
- Largest value inside the fences: 41
- Values above 41: 45 and 50

To find out whether 45 and 50 are outliers, we compute the fences step by step:

1. Interquartile range: $IQR = Q_3 - Q_1 = 30 - 22 = 8$.
2. Margin: $1.5 \times IQR = 1.5 \times 8 = 12$.
3. Lower fence: $Q_1 - 12 = 22 - 12 = 10$.
4. Upper fence: $Q_3 + 12 = 30 + 12 = 42$.

Now we compare each value with the fences: $45 > 42$ and $50 > 42$, so both are outliers. And $41 \le 42$ and $18 \ge 10$, so 41 and 18 are inside the fences and are where the whiskers end.

<div style="text-align: center; margin: 1em 0;">
  <img src="{{ site.baseurl }}/assets/images/boxplot-en.png" alt="Boxplot of ages: whisker from 18 to 22, box from 22 to 30 with the median at 25, whisker from 30 to 41 and two outliers at 45 and 50" style="max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 4px;">
  <p style="font-size: 0.8em; color: #666;">Figure 4: Distribution of participants' ages. The orange points (45 and 50) lie beyond the upper fence, at 42.</p>
</div>

**Reading it:** half of the participants are between 22 and 30 years old (the box). The median, 25, is closer to $Q_1$ than to $Q_3$ ($25 - 22 = 3$ versus $30 - 25 = 5$), and the right whisker is much longer than the left one ($41 - 30 = 11$ versus $22 - 18 = 4$): the distribution is right-skewed, pulled by a few older people.

### Advantages and Limitations

**Advantages:**
- Shows several statistics in a single view
- Efficient for comparing groups
- Good at showing outliers

**Limitations:**
- Can hide the shape of the distribution (two modes, for example, don't show up)
- Less intuitive for a general audience

<div style="border-left: 4px solid #ff9800; padding: 0.5em; background-color: #fff3e0; margin: 1em 0;">
  <strong>⚠️ Watch out for outliers</strong><br>
  A value outside the fences $Q_1 - 1.5 \times IQR$ and $Q_3 + 1.5 \times IQR$ is an outlier <em>by the boxplot criterion</em>. That doesn't mean it's an error: it may be a legitimate and important data point. Investigate before removing it.
</div>

---

## 5. Scatter Plot

The **scatter plot** shows the relationship between two quantitative variables: each point is one observation.

### When to Use It
- Checking for correlation between variables
- Identifying patterns and trends
- Detecting atypical values

### Worked Example

The relationship between hours of study and exam grade (illustrative numbers):

| Student | Hours | Grade |
|---|---:|---:|
| A | 2 | 4.5 |
| B | 5 | 6.8 |
| C | 8 | 7.2 |
| … | … | … |

<div style="text-align: center; margin: 1em 0;">
  <img src="{{ site.baseurl }}/assets/images/scatter_plot-en.png" alt="Scatter plot of study hours against grade for 30 students, with a rising trend line and r equal to 0.91" style="max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 4px;">
  <p style="font-size: 0.8em; color: #666;">Figure 5: Study hours × grade, for 30 students: the three in the table plus 27 illustrative ones. The dashed line is the least-squares line.</p>
</div>

**Reading it:** the points rise from left to right — students who studied more hours tend to have higher grades. With the 30 students in the figure, Pearson's correlation coefficient is $r \approx 0.91$, a strong positive linear relationship. That does **not** prove that studying more causes the higher grade: the chart shows association, not causation.

### Advantages and Limitations

**Advantages:**
- Shows the relationship between two variables
- Reveals patterns and trends
- Useful for large data sets

**Limitations:**
- With a lot of data, points overlap and hide where most observations are
- Hard to interpret with many variables

<div style="border-left: 4px solid #2196F3; padding: 0.5em; background-color: #e3f2fd; margin: 1em 0;">
  <strong>💡 Analysis tip</strong><br>
  Add a trend line to highlight the relationship between the variables. Pearson's correlation coefficient ($r$) quantifies the strength and direction of the <em>linear</em> relationship: it can be close to zero even when there is a strong but curved relationship.
</div>

---

## 6. Time-Series Line Chart

The **time-series line chart** shows how a quantitative variable changes over time.

### When to Use It
- Seeing trends over time
- Comparing series over time
- Identifying seasonal patterns

### Worked Example

A store's monthly sales over one year (illustrative numbers):

| Month | Sales (R$) |
|---|---:|
| Jan | 12,500 |
| Feb | 14,200 |
| Mar | 15,800 |
| … | … |
| Dec | 28,300 |

<div style="text-align: center; margin: 1em 0;">
  <img src="{{ site.baseurl }}/assets/images/linha_temporal-en.png" alt="Line chart of monthly sales rising from 12.5 thousand reais in January to 28.3 thousand reais in December" style="max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 4px;">
  <p style="font-size: 0.8em; color: #666;">Figure 6: Monthly sales over the year, in thousands of reais (R$, the Brazilian currency).</p>
</div>

**Reading it:** sales more than doubled over the year. From January to December, they rose by $28{,}300 - 12{,}500 = 15{,}800$ reais, that is, $\dfrac{15{,}800}{12{,}500} = 1.264 = 126.4\%$. The only drop is from June to July.

### Advantages and Limitations

**Advantages:**
- Clearly shows trends over time
- Good for long time series
- Easy to interpret

**Limitations:**
- Can get cluttered with many series
- Sensitive to the choice of Y-axis scale

<div style="border-left: 4px solid #4caf50; padding: 0.5em; background-color: #e8f5e9; margin: 1em 0;">
  <strong>📈 Visualization tip</strong><br>
  Use clear markers on the data points and smooth lines to highlight the overall trend. Consider shaded bands to show confidence intervals when relevant.
</div>

---

## Choosing the Right Chart

| Type of Data | Goal | Recommended Chart |
|---------------|----------|---------------------|
| Categorical  | Compare categories | Bars or Columns |
| Categorical  | Proportions | Pie or Donut (few categories) |
| Quantitative | Distribution | Histogram or Boxplot |
| Two Quantitative Variables | Relationship | Scatter |
| Time         | Trend | Line |
| Multiple Variables | Comparison | Multiple Lines or Grouped Bars |

---

## Good Practices in Data Visualization

1. **Simplicity**: less is more. Avoid unnecessary elements.
2. **Accuracy**: scales should be proportional; in bar charts, the axis starts at zero.
3. **Consistency**: use the same colors and styles for the same elements.
4. **Readability**: fonts should be clear and appropriately sized.
5. **Context**: include titles, labels and the data source.

<div style="border-left: 4px solid #f44336; padding: 0.5em; background-color: #ffebee; margin: 1em 0;">
  <strong>❌ Common Mistakes to Avoid</strong>
  <ul>
    <li>Unnecessary 3D charts that distort perception</li>
    <li>Misleading scales (axes that don't start at zero without a reason)</li>
    <li>Too many colors or elements competing for attention</li>
    <li>Missing labels, legends or data source</li>
  </ul>
</div>

---

## Recommended Tools

- **Julia**: Plots.jl, Makie.jl, StatsPlots.jl
- **Python**: Matplotlib, Seaborn, Plotly
- **R**: ggplot2, plotly, lattice
- **Visual tools**: Tableau, Power BI, Looker Studio (formerly Google Data Studio)
- **Online**: Datawrapper, Flourish, RAWGraphs

The figures on this page were made in Julia, with Plots.jl, by the script `scripts/figuras-graficos.jl` in the site's repository.

---

## References

1. Cairo, A. (2016). *The Truthful Art: Data, Charts, and Maps for Communication*. New Riders.
2. Few, S. (2007). Save the Pies for Dessert. *Visual Business Intelligence Newsletter*, Perceptual Edge, August 2007.
3. Few, S. (2012). *Show Me the Numbers: Designing Tables and Graphs to Enlighten*. 2nd ed. Analytics Press.
4. Healy, K. (2018). *Data Visualization: A Practical Introduction*. Princeton University Press.
5. Nussbaumer Knaflic, C. (2015). *Storytelling with Data: A Data Visualization Guide for Business Professionals*. Wiley.
6. Robbins, N. B. (2005). *Creating More Effective Graphs*. Wiley-Interscience.
7. StatCounter Global Stats. *Mobile Operating System Market Share Worldwide*, 2023 (yearly data). Available at <https://gs.statcounter.com/os-market-share/mobile/worldwide>. Accessed November 23, 2026.
8. Sturges, H. A. (1926). The choice of a class interval. *Journal of the American Statistical Association*, 21(153), 65–66. DOI: [10.1080/01621459.1926.10502161](https://doi.org/10.1080/01621459.1926.10502161).
9. Tufte, E. R. (2001). *The Visual Display of Quantitative Information*. 2nd ed. Graphics Press.
10. Tukey, J. W. (1977). *Exploratory Data Analysis*. Addison-Wesley.
