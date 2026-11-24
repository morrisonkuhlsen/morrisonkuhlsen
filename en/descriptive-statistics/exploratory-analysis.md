---
layout: page
title: Exploratory Data Analysis
lang: en
ref: analise-exploratoria
parent: estatistica-descritiva
permalink: /en/descriptive-statistics/exploratory-analysis
order: 4
mathjax: true
description: "A first exploration of the data to uncover patterns, detect anomalies and form hypotheses."
---

**Exploratory Data Analysis (EDA)** is an approach to analyzing data sets with the goal of summarizing their main characteristics, often with visual methods. It helps us understand the data, identify patterns, detect anomalies and form hypotheses.

### John Tukey and the Birth of EDA

Exploratory Data Analysis, as we know it today, is rooted in the work of **John Wilder Tukey** (1915–2000), one of the most influential statisticians of the 20th century.

#### Who was John Tukey?

- **Born**: June 16, 1915, in New Bedford, Massachusetts, USA
- **Education**: bachelor's (1936) and master's (1937) degrees in Chemistry from Brown University, and a Ph.D. in Mathematics from Princeton University (1939)
- **Career**: professor at Princeton and researcher at Bell Labs
- **Words he gave to computing**: the term **"bit"** (short for *binary digit*) is credited to Tukey — it first appears in print in Claude Shannon's 1948 paper, which gives him the credit. He is also remembered for using the word **"software"** in 1958 to mean computer programs — its first known use in print (Leonhardt, 2000).

### The Exploratory Revolution

In 1977, Tukey published the book **"Exploratory Data Analysis"**, which laid the foundations of EDA. The central idea is that statistical analysis should not be limited to testing hypotheses that were already formulated (*confirmatory* analysis): before that, we need to explore the data to uncover unexpected patterns and generate new hypotheses.

#### Tukey's Core Principles:

1. **Emphasis on Visualization**: in the 1977 book, Tukey writes that “the greatest value of a picture is when it forces us to notice what we never expected to see.”

2. **Resistance**: Tukey valued *resistant* measures, which are not dragged around by a few atypical values, such as the median and the quartiles — rather than relying only on the mean and the standard deviation.

3. **Active Exploration**: looking at the same data in several ways, with different questions and charts, before choosing a model.

4. **New Tools**: he created visual tools that are standard today, including:
   - **Boxplot** (box-and-whisker plot)
   - **Stem-and-leaf plot**
   - **Five-number summary**: minimum, $Q_1$, median, $Q_3$ and maximum

### Impact and Legacy

Tukey's approach had a deep impact on many fields:

- **Modern Data Science**: EDA is treated as the first step of any data analysis project.
- **Big Data**: with large volumes of data, looking before modeling has become even more important.
- **Education**: EDA is taught in statistics and data science courses around the world.

### EDA Today

Although the principles remain the same, EDA has evolved with technology:

- **Modern Tools**: languages such as Python, R and Julia ship Tukey's charts in their visualization libraries.
- **Interactive Visualizations**: tools such as Tableau and Power BI allow dynamic exploration of data.
- **Automation**: machine learning techniques are being used to automate parts of the exploratory process.

As Behrens (1997) sums it up, the goal of EDA is to discover patterns in the data and generate hypotheses, not to reach verdicts — verdicts are left to confirmatory analysis.

## Goals of Exploratory Analysis

1. **Understand** the structure and distribution of the data
2. **Identify** atypical values and anomalies
3. **Discover** patterns and relationships between variables
4. **Validate** initial assumptions
5. **Prepare** the data for more advanced analyses

## Basic EDA Techniques

### 1. Descriptive Statistics

Measures of central tendency and dispersion give a numerical summary of the data:

- **Mean, median and mode**
- **Range, variance and standard deviation**
- **Skewness and kurtosis**

### 2. Basic Visualizations

- **Histograms**: show the distribution of a continuous variable
- **Box plots (boxplots)**: show the distribution and flag outliers
- **Scatter plots**: show the relationship between two variables
- **Bar charts**: useful for categorical variables

## A Worked Example in Julia

Let's run an exploratory analysis on a sample data set using Julia. We'll use the `DataFrames` package for data handling and `Plots` for visualization.

### Loading the Packages

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code># Loading the packages we need
using DataFrames
using Statistics
using Plots

# Creating a sample data set with fixed values
function create_student_data()
    # Fixed data, for reproducibility
    names = ["Ana", "Carlos", "Maria", "João", "Julia", "Pedro", "Luiza", "Rafael"]
    ages = [18, 24, 20, 22, 19, 21, 23, 18]  # Fixed ages
    grades = [7, 6, 9, 8, 7, 5, 8, 6]  # Fixed grades
    study_hours = [17, 18, 15, 12, 19, 10, 14, 16]  # Fixed study hours
    passed = [g >= 7 ? "Yes" : "No" for g in grades]  # Derived from the fixed grades
    
    return DataFrame(
        Name = names,
        Age = ages,
        Grade = grades,
        StudyHours = study_hours,
        Passed = passed
    )
end

# Creating the DataFrame
df = create_student_data()

# Showing the first rows
println("First rows of the data set:")
df</code></pre>
  </div>
</div>

#### Expected output:
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <div>8×5 DataFrame</div>
  <div> Row │ Name    Age    Grade  StudyHours  Passed </div>
  <div>     │ String  Int64  Int64  Int64       String </div>
  <div>─────┼──────────────────────────────────────────</div>
  <div>   1 │ Ana        18      7          17  Yes</div>
  <div>   2 │ Carlos     24      6          18  No</div>
  <div>   3 │ Maria      20      9          15  Yes</div>
  <div>   4 │ João       22      8          12  Yes</div>
  <div>   5 │ Julia      19      7          19  Yes</div>
  <div>   6 │ Pedro      21      5          10  No</div>
  <div>   7 │ Luiza      23      8          14  Yes</div>
  <div>   8 │ Rafael     18      6          16  No</div>
</div>

### Descriptive Statistics

Let's compute some basic descriptive statistics:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code># Descriptive statistics for the numeric columns
function statistical_summary(df)
    println("Descriptive Statistics:")
    println("-----------------------")
    
    for col in names(df)
        if eltype(df[!, col]) <: Number
            println("\nVariable: ", col)
            println("  Mean: ", round(mean(skipmissing(df[!, col])), digits=2))
            println("  Median: ", median(skipmissing(df[!, col])))
            println("  Minimum: ", minimum(skipmissing(df[!, col])))
            println("  Maximum: ", maximum(skipmissing(df[!, col])))
            println("  Standard Deviation: ", round(std(skipmissing(df[!, col])), digits=2))
        end
    end
    
    # Counts for categorical variables
    println("\nCount per category (Passed):")
    println(combine(groupby(df, :Passed), nrow => :Count))
end

statistical_summary(df)</code></pre>
  </div>
</div>

#### Expected output:
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <div>Descriptive Statistics:</div>
  <div>-----------------------</div>
  <div> </div>
  <div>Variable: Age</div>
  <div>  Mean: 20.62</div>
  <div>  Median: 20.5</div>
  <div>  Minimum: 18</div>
  <div>  Maximum: 24</div>
  <div>  Standard Deviation: 2.26</div>
  <div> </div>
  <div>Variable: Grade</div>
  <div>  Mean: 7.0</div>
  <div>  Median: 7.0</div>
  <div>  Minimum: 5</div>
  <div>  Maximum: 9</div>
  <div>  Standard Deviation: 1.31</div>
  <div> </div>
  <div>Variable: StudyHours</div>
  <div>  Mean: 15.12</div>
  <div>  Median: 15.5</div>
  <div>  Minimum: 10</div>
  <div>  Maximum: 19</div>
  <div>  Standard Deviation: 3.04</div>
  <div> </div>
  <div>Count per category (Passed):</div>
  <div>2×2 DataFrame</div>
  <div> Row │ Passed  Count </div>
  <div>     │ String  Int64 </div>
  <div>─────┼───────────────</div>
  <div>   1 │ Yes         5</div>
  <div>   2 │ No          3</div>
</div>

#### Checking it by hand: the standard deviation of the grades

Julia's `std` function computes the **sample** standard deviation, which divides by $n - 1$. Let's redo the calculation for the grades to see where the 1.31 comes from.

**Data:** the 8 grades are 7, 6, 9, 8, 7, 5, 8, 6, so $n = 8$.

**Step 1 — mean:**

$$\bar{x} = \frac{7 + 6 + 9 + 8 + 7 + 5 + 8 + 6}{8} = \frac{56}{8} = 7$$

**Step 2 — each grade's deviation from the mean, and the squared deviation:**

| Student | Grade $x_i$ | $x_i - \bar{x}$ | $(x_i - \bar{x})^2$ |
|---|---:|---:|---:|
| Ana | 7 | $7 - 7 = 0$ | 0 |
| Carlos | 6 | $6 - 7 = -1$ | 1 |
| Maria | 9 | $9 - 7 = 2$ | 4 |
| João | 8 | $8 - 7 = 1$ | 1 |
| Julia | 7 | $7 - 7 = 0$ | 0 |
| Pedro | 5 | $5 - 7 = -2$ | 4 |
| Luiza | 8 | $8 - 7 = 1$ | 1 |
| Rafael | 6 | $6 - 7 = -1$ | 1 |
| **Sum** | | $0$ | $12$ |

The deviations add up to zero (they always do, around the mean) — that's why the deviations are squared.

**Step 3 — sample variance:**

$$s^2 = \frac{\sum (x_i - \bar{x})^2}{n - 1} = \frac{12}{8 - 1} = \frac{12}{7} \approx 1.7143$$

**Step 4 — standard deviation:**

$$s = \sqrt{s^2} = \sqrt{\frac{12}{7}} \approx 1.3093 \approx 1.31$$

**Interpretation:** on average, the grades lie about 1.31 points from the mean grade of 7. It's the same value Julia printed.

### Visualizing the Data

#### 1. Histogram of the Grades

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code># Creating a histogram of the grades
histogram(df.Grade, 
          bins=5, 
          xlabel="Grades", 
          ylabel="Frequency", 
          title="Distribution of Grades",
          color=:steelblue,
          alpha=0.6,
          lw=0,
          legend=false,
          xlims=(4, 10),
          xticks=4:10)</code></pre>
  </div>
</div>

#### Histogram output:

![Histogram of the 8 students' grades: one 5, two 6s, two 7s, two 8s and one 9]({{ site.baseurl }}/assets/images/histograma_notas-en.png)

**Reading it:** the grades range from 5 to 9. One 5, two 6s, two 7s, two 8s and one 9: the distribution is symmetric around 7, which is both the mean and the median.

#### 2. Scatter Plot: Study Hours vs. Grades

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code># Creating a scatter plot
scatter(df.StudyHours, df.Grade,
        xlabel="Study Hours",
        ylabel="Grade",
        title="Study Hours vs. Grades",
        color=:blue,
        legend=false,
        markersize=8,
        markercolor=:white,
        markerstrokecolor=:steelblue,
        markerstrokewidth=2,
        xlims=(8, 20),
        ylims=(4, 10),
        xticks=8:20,
        yticks=4:10)

# Adding a trend line
x_range = minimum(df.StudyHours):0.1:maximum(df.StudyHours)
coef = cov(df.StudyHours, df.Grade) / var(df.StudyHours)
intercept = mean(df.Grade) - coef * mean(df.StudyHours)
plot!(x_range, x -> intercept + coef * x, 
      linewidth=2, 
      linestyle=:dash, 
      color=:darkred,
      label="Trend Line")</code></pre>
  </div>
</div>

#### Scatter plot output:

![Scatter plot of the 8 students' study hours against grade, with an almost flat trend line]({{ site.baseurl }}/assets/images/grafico_dispersao-en.png)

The trend line is almost flat: it rises only 0.03 points per hour of study. To measure the strength of the linear relationship, we compute Pearson's correlation coefficient:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Statistics

hours = [17, 18, 15, 12, 19, 10, 14, 16]
grades = [7, 6, 9, 8, 7, 5, 8, 6]

println("Correlation between hours and grade: ", round(cor(hours, grades), digits=2))</code></pre>
  </div>
</div>

#### Expected output:
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <div>Correlation between hours and grade: 0.07</div>
</div>

#### Checking it by hand: the correlation

Pearson's formula is

$$r = \frac{\sum (x_i - \bar{x})(y_i - \bar{y})}{\sqrt{\sum (x_i - \bar{x})^2 \cdot \sum (y_i - \bar{y})^2}}$$

where $x$ is study hours and $y$ is the grade.

**Step 1 — means:**

$$\bar{x} = \frac{17 + 18 + 15 + 12 + 19 + 10 + 14 + 16}{8} = \frac{121}{8} = 15.125 \qquad \bar{y} = 7 \text{ (computed above)}$$

**Step 2 — deviations, products and squares:**

| Student | $x_i$ | $y_i$ | $x_i - \bar{x}$ | $y_i - \bar{y}$ | $(x_i - \bar{x})(y_i - \bar{y})$ | $(x_i - \bar{x})^2$ | $(y_i - \bar{y})^2$ |
|---|---:|---:|---:|---:|---:|---:|---:|
| Ana | 17 | 7 | 1.875 | 0 | 0 | 3.515625 | 0 |
| Carlos | 18 | 6 | 2.875 | −1 | −2.875 | 8.265625 | 1 |
| Maria | 15 | 9 | −0.125 | 2 | −0.25 | 0.015625 | 4 |
| João | 12 | 8 | −3.125 | 1 | −3.125 | 9.765625 | 1 |
| Julia | 19 | 7 | 3.875 | 0 | 0 | 15.015625 | 0 |
| Pedro | 10 | 5 | −5.125 | −2 | 10.25 | 26.265625 | 4 |
| Luiza | 14 | 8 | −1.125 | 1 | −1.125 | 1.265625 | 1 |
| Rafael | 16 | 6 | 0.875 | −1 | −0.875 | 0.765625 | 1 |
| **Sum** | | | $0$ | $0$ | $2$ | $64.875$ | $12$ |

**Step 3 — substituting into the formula:**

$$r = \frac{2}{\sqrt{64.875 \times 12}} = \frac{2}{\sqrt{778.5}} = \frac{2}{27.9016\ldots} \approx 0.0717 \approx 0.07$$

**Interpretation:** $r \approx 0.07$ is very close to zero. For these 8 students, **there is no linear relationship** between study hours and grade: knowing how many hours a student studied barely helps predict their grade.

Look at the products column: nearly all of the positive part comes from a single student, Pedro (10 hours, grade 5), with $+10.25$; the other seven add up to $2 - 10.25 = -8.25$. Without Pedro, the correlation for the other seven students is $r \approx -0.60$ — negative. With so little data, a single student decides the sign of the result.

#### 3. Boxplot of Study Hours by Pass Status

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>using StatsPlots
# Creating a boxplot grouped by pass status
boxplot(df.Passed, df.StudyHours;
        xlabel="Passed",
        ylabel="Study Hours",
        title="Study Hours by Pass Status",
        color=:steelblue,
        legend=false)</code></pre>
  </div>
</div>

#### Boxplot output:

![Boxplots of study hours for students who failed and passed, with medians of 16 and 15 hours]({{ site.baseurl }}/assets/images/boxplot_horas_estudo-en.png)

**Reading it:** the 3 students who failed (Carlos, Pedro and Rafael) studied 18, 10 and 16 hours, with a median of 16; the 5 who passed (Ana, Maria, João, Julia and Luiza) studied 17, 15, 12, 19 and 14 hours, with a median of 15. Those who passed did not study more than those who failed — consistent with the near-zero correlation. With 3 and 5 students, each box is drawn from very few points, and the picture changes a lot if one student changes.

## What the Results Show

Based on the exploratory analysis, we can draw the following conclusions:

1. **Distribution of Grades**: grades range from 5 to 9, with a mean of 7.0, a median of 7.0 and a standard deviation of 1.31 points; the distribution is symmetric.
2. **Relationship Between Variables**: in these data, **there is no linear relationship** between study hours and grade ($r \approx 0.07$). The little positive correlation there is comes from a single student; without him, the correlation turns negative.
3. **Passing**: 5 of the 8 students passed (grade ≥ 7), that is, $\frac{5}{8} = 62.5\%$. Those who passed did not study more hours than those who failed (medians of 15 and 16 hours).
4. **Students' Ages**: the mean age is $\frac{165}{8} = 20.625 \approx 20.6$ years, ranging from 18 to 24, with a standard deviation of 2.26 years.

<div style="border-left: 4px solid #ff9800; padding: 0.5em; background-color: #fff3e0; margin: 1em 0;">
  <strong>⚠️ What this example teaches</strong><br>
  You would expect students who study more to get higher grades — and these data do <em>not</em> show that. That is exactly the value of exploratory analysis: it shows what the data say, even when they contradict expectations. With 8 students (made-up data for the example), none of these conclusions applies to other students; they only describe this group.
</div>

## Next Steps

Based on this exploratory analysis, we could:

1. Collect data on many more students: with 8, a single student flips the sign of the correlation
2. Look into Pedro's case (few hours and the lowest grade) and into students who studied a lot and failed, such as Carlos
3. With more data, test whether the relationship between hours and grade is statistically significant, and consider other variables (such as how students study)

## References

1. Behrens, J. T. (1997). Principles and procedures of exploratory data analysis. *Psychological Methods*, 2(2), 131–160. DOI: [10.1037/1082-989X.2.2.131](https://doi.org/10.1037/1082-989X.2.2.131).
2. Shannon, C. E. (1948). A mathematical theory of communication. *The Bell System Technical Journal*, 27(3), 379–423. DOI: [10.1002/j.1538-7305.1948.tb01338.x](https://doi.org/10.1002/j.1538-7305.1948.tb01338.x).
3. Leonhardt, D. (2000, July 28). John Tukey, 85, statistician; coined the word "software". *The New York Times*.
4. Tukey, J. W. (1977). *Exploratory Data Analysis*. Addison-Wesley.
5. Wickham, H.; Grolemund, G. (2016). *R for Data Science*. O'Reilly Media.
