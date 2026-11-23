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

---

<div style="border-left: 4px solid #4CAF50; padding: 0.5em; background-color: #e8f5e9;">
  <strong>📊 Principles of Visual Design</strong><br>
  A good chart should be: <em>accurate, clear, efficient and revealing</em>. Remember: "The purpose of visualization is insight, not pictures" - Ben Shneiderman
</div>

---

## 1. Bar Chart

The **bar chart** is ideal for comparing categories or showing the distribution of a categorical variable.

### When to Use It
- Comparing amounts across distinct categories
- Showing how often each category occurs
- Qualitative or discrete quantitative data

### Worked Example

Consider the number of students per program at a college:

```
Program        | Students
-------------------------
Engineering    | 120
Medicine       | 90
Law            | 85
Business Admin.| 110
```

<div style="text-align: center; margin: 1em 0;">
  <img src="{{ site.baseurl }}/assets/images/grafico_barras.png" alt="Bar chart - students per program" style="max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 4px;">
  <p style="font-size: 0.8em; color: #666;">Figure 1: Number of students per program</p>
</div>

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
  Sort the bars by value to make comparison easier. Use consistent colors and avoid very long labels that may overlap.
</div>

---

## 2. Pie Chart

The **pie chart** is a circular chart divided into slices that represent proportions of a whole. Each slice corresponds to a category, and its size is proportional to the amount it represents.

### When to Use It
- Showing proportions of a whole (when the parts add up to 100%)
- Comparing just a few categories (ideally up to 5)
- Quickly communicating simple distributions

### Worked Example

Market share of mobile operating systems in 2023:

```
System     | Market Share
-------------------------
Android    | 70%
iOS        | 28%
Others     | 2%
```

<div style="text-align: center; margin: 1em 0;">
  <img src="{{ site.baseurl }}/assets/images/grafico_pizza.png" alt="Pie chart - market share" style="max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 4px;">
  <p style="font-size: 0.8em; color: #666;">Figure 2: Market share of mobile operating systems</p>
</div>

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
  Known as the "father of exploratory data analysis", Tukey had a pragmatic view of visualization. Although he is best known for developing the boxplot, he believed that "the simplest goal of data analysis is description" and that charts should be tools for discovery. Tukey was skeptical of pie charts, arguing that "there are few situations in which a circular chart conveys information more clearly than the alternatives". He preferred techniques that revealed the underlying distribution of the data.
</div>

<div style="border-left: 4px solid #f44336; padding: 0.5em; background-color: #ffebee; margin: 1em 0;">
  <strong>❌ Edward Tufte</strong><br>
  In the classic "The Visual Display of Quantitative Information", Tufte is blunt: pie charts are "data-poor", using a lot of space to convey little information. He argues that the human eye struggles to compare angles and areas precisely, especially when the slices are of similar size.
</div>

<div style="border-left: 4px solid #2196F3; padding: 0.5em; background-color: #e3f2fd; margin: 1em 0;">
  <strong>📊 Stephen Few</strong><br>
  Few suggests that "there are few situations in which a pie chart is the best choice". In his book "Show Me the Numbers", he shows that bar charts allow more precise comparisons between categories. Still, he acknowledges they can be useful for showing a single dominant proportion (e.g. 80/20).
</div>

<div style="border-left: 4px solid #4CAF50; padding: 0.5em; background-color: #e8f5e9; margin: 1em 0;">
  <strong>📈 Naomi Robbins</strong><br>
  The author of "Creating More Effective Graphs", Robbins argues that pie charts are acceptable only when they show few categories (3-4 at most) and when the main message is "this part is half" or "this part is a quarter". For detailed comparisons, she recommends bar charts.
</div>

### Recommended Alternatives

1. **Bar Chart**: for precise comparisons between categories
2. **Stacked Bar Chart**: for showing parts of a whole with more categories
3. **Area Chart**: for showing changes in proportions over time
4. **Waffle Chart**: a visually appealing alternative for showing proportions

<div style="border-left: 4px solid #9c27b0; padding: 0.5em; background-color: #f3e5f5; margin: 1em 0;">
  <strong>💡 So when should you use a pie chart?</strong><br>
  Despite the criticism, a pie chart can work well when:
  - You have only 2-3 categories
  - The message is simple (e.g. "more than half")
  - The audience is non-specialist and familiar with the format
  - The context is informal or high-level
</div>

---

## 3. Histogram

The **histogram** shows the distribution of a continuous quantitative variable by grouping the data into intervals (bins).

### When to Use It
- Seeing the distribution of continuous data
- Identifying central tendency and spread
- Detecting skewness and outliers

### Worked Example

Consider the grades of 100 students on an exam (scale from 0 to 10):

```
Interval | Frequency
--------------------
0-2      | 5
2-4      | 15
4-6      | 30
6-8      | 35
8-10     | 15
```

<div style="text-align: center; margin: 1em 0;">
  <img src="{{ site.baseurl }}/assets/images/histograma.png" alt="Histogram - grade distribution" style="max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 4px;">
  <p style="font-size: 0.8em; color: #666;">Figure 3: Distribution of student grades</p>
</div>

### Advantages and Limitations

**Advantages:**
- Shows the shape of the distribution
- Reveals modes and skewness
- Good for large data sets

**Limitations:**
- The choice of the number of bins affects the interpretation
- Can hide important details

<div style="border-left: 4px solid #9c27b0; padding: 0.5em; background-color: #f3e5f5; margin: 1em 0;">
  <strong>🔍 Sturges' Rule</strong><br>
  To choose the number of bins: $k = 1 + 3.322 \log_{10}(n)$, where $n$ is the number of observations. Round to the nearest integer.
</div>

---

## 4. Boxplot (Box-and-Whisker Plot)

The **boxplot** summarizes the distribution of a quantitative variable through its quartiles, highlighting the median and possible outliers.

### When to Use It
- Comparing distributions across groups
- Identifying atypical values
- Seeing skewness and spread

### Elements of the Boxplot

```
     +-----+----+
     |     |  o | ← Outliers
+----+-----+    
|         |    
|    +-+  |    
|    | |  |    ← Third Quartile (Q3)
|    +-+  |    
|    | |  |    ← Median (Q2)
|    +-+  |    
|    | |  |    ← First Quartile (Q1)
+----+-----+
     |     |
     +-----+
     |     |
     +-----+
     |     |
     +-----+----+
```

### Worked Example

Consider the ages of the participants at an event:
- Smallest value (excluding outliers): 18
- Q1: 22
- Median: 25
- Q3: 30
- Largest value (excluding outliers): 41
- Outliers: 45 and 50

With $IQR = 30 - 22 = 8$, the fences sit at $22 - 12 = 10$ and $30 + 12 = 42$: only 45 and 50 fall outside them.

<div style="text-align: center; margin: 1em 0;">
  <img src="{{ site.baseurl }}/assets/images/boxplot.png" alt="Boxplot - age distribution" style="max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 4px;">
  <p style="font-size: 0.8em; color: #666;">Figure 4: Distribution of participants' ages</p>
</div>

### Advantages and Limitations

**Advantages:**
- Shows several statistics in a single view
- Efficient for comparing groups
- Good at showing outliers

**Limitations:**
- Can hide the shape of the distribution
- Less intuitive for a general audience

<div style="border-left: 4px solid #ff9800; padding: 0.5em; background-color: #fff3e0; margin: 1em 0;">
  <strong>⚠️ Watch out for outliers</strong><br>
  Values are considered outliers if they lie below $Q1 - 1.5 \times IQR$ or above $Q3 + 1.5 \times IQR$, where $IQR = Q3 - Q1$.
</div>

---

## 5. Scatter Plot

The **scatter plot** shows the relationship between two quantitative variables, where each point is one observation.

### When to Use It
- Checking for correlation between variables
- Identifying patterns and trends
- Detecting atypical values

### Worked Example

The relationship between hours of study and exam grades:

```
Student | Hours | Grade
--------|-------|------
A       | 2     | 4.5
B       | 5     | 6.8
C       | 8     | 7.2
...     | ...   | ...
```

<div style="text-align: center; margin: 1em 0;">
  <img src="{{ site.baseurl }}/assets/images/scatter_plot.png" alt="Scatter plot - hours of study vs. grade" style="max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 4px;">
  <p style="font-size: 0.8em; color: #666;">Figure 5: Relationship between hours of study and grades</p>
</div>

### Advantages and Limitations

**Advantages:**
- Shows the relationship between two variables
- Reveals patterns and trends
- Useful for large data sets

**Limitations:**
- Points overlap when there is a lot of data
- Hard to interpret with many variables

<div style="border-left: 4px solid #2196F3; padding: 0.5em; background-color: #e3f2fd; margin: 1em 0;">
  <strong>💡 Analysis tip</strong><br>
  Add a trend line to highlight the relationship between the variables. Pearson's correlation coefficient ($r$) can quantify the strength and direction of the linear relationship.
</div>

---

## 6. Time-Series Line Chart

The **time-series line chart** shows how a quantitative variable changes over time.

### When to Use It
- Seeing trends over time
- Comparing series over time
- Identifying seasonal patterns

### Worked Example

Monthly sales over one year:

```
Month  | Sales (R$)
-------|------------
Jan    | 12,500
Feb    | 14,200
Mar    | 15,800
...    | ...
Dec    | 28,300
```

<div style="text-align: center; margin: 1em 0;">
  <img src="{{ site.baseurl }}/assets/images/linha_temporal.png" alt="Line chart - monthly sales" style="max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 4px;">
  <p style="font-size: 0.8em; color: #666;">Figure 6: Monthly sales over the year</p>
</div>

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
| Categorical  | Proportions | Pie or Donut |
| Quantitative | Distribution | Histogram or Boxplot |
| Two Quantitative Variables | Relationship | Scatter |
| Time         | Trend | Line |
| Multiple Variables | Comparison | Multiple Lines or Grouped Bars |

---

## Good Practices in Data Visualization

1. **Simplicity**: less is more. Avoid unnecessary elements.
2. **Accuracy**: scales should be proportional and start at zero when appropriate.
3. **Consistency**: use the same colors and styles for the same elements.
4. **Readability**: fonts should be clear and appropriately sized.
5. **Context**: include titles, labels and sources when needed.

<div style="border-left: 4px solid #f44336; padding: 0.5em; background-color: #ffebee; margin: 1em 0;">
  <strong>❌ Common Mistakes to Avoid</strong><br>
  - Unnecessary 3D charts that distort perception
  - Misleading scales (axes that don't start at zero without a reason)
  - Too many colors or elements competing for attention
  - Missing labels or unclear legends
</div>

---

## Recommended Tools

- **Python**: Matplotlib, Seaborn, Plotly
- **R**: ggplot2, plotly, lattice
- **Visual tools**: Tableau, Power BI, Looker Studio (formerly Google Data Studio)
- **Online**: Datawrapper, Flourish, RAWGraphs

---

## References

1. Tufte, E. R. (2001). *The Visual Display of Quantitative Information*. Graphics Press.
2. Cairo, A. (2016). *The Truthful Art: Data, Charts, and Maps for Communication*. New Riders.
3. Few, S. (2012). *Show Me the Numbers: Designing Tables and Graphs to Enlighten*. Analytics Press.
4. Healy, K. (2018). *Data Visualization: A Practical Introduction*. Princeton University Press.
5. Nussbaumer Knaflic, C. (2015). *Storytelling with Data: A Data Visualization Guide for Business Professionals*. Wiley.
