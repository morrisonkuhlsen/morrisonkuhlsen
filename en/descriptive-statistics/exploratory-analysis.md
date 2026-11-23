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

Exploratory Data Analysis, as we know it today, is rooted in the pioneering work of **John Wilder Tukey** (1915-2000), one of the most influential statisticians of the 20th century. Tukey, who was also a chemist and a computer scientist, revolutionized the way data are analyzed and interpreted.

#### Who was John Tukey?

- **Born**: June 16, 1915, in New Bedford, Massachusetts, USA
- **Education**: B.A. in Chemistry from Brown University (1936) and Ph.D. in Mathematics from Princeton University (1939)
- **Career**: Professor at Princeton and senior researcher at Bell Labs
- **Contributions**: besides EDA, Tukey coined terms such as "bit" (binary digit) and "software"

<div style="text-align: center; margin: 20px 0;">
  <img src="{{ site.baseurl }}/assets/images/JohnTukey.jpg" alt="John Wilder Tukey (1915-2000)" style="max-width: 300px; border-radius: 5px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
  <p style="font-style: italic; margin-top: 10px; color: #555;">John Wilder Tukey (1915-2000), the father of Exploratory Data Analysis</p>
</div>

### The Exploratory Revolution

In 1977, Tukey published the seminal book **"Exploratory Data Analysis"**, which laid the foundations of EDA. In it, he argued that statistical analysis should not be limited to testing hypotheses (confirmatory analysis), but should also explore the data to uncover unexpected patterns and generate new hypotheses.

#### Tukey's Core Principles:

1. **Emphasis on Visualization**: Tukey believed that "the simplest possible picture is the best, as long as it does what needs to be done".

2. **Resistance**: he developed robust techniques that are not thrown off by atypical values, such as the median and the quartiles.

3. **Active Exploration**: he encouraged analysts to "play" with the data, asking different questions and trying different views.

4. **Innovative Tools**: he created several visual tools that are standard today, including:
   - **Boxplot** (box-and-whisker plot)
   - **Stem-and-leaf plot**
   - **Five-number summary**

### Impact and Legacy

Tukey's approach had a deep impact on many fields:

- **Modern Data Science**: EDA is considered the essential first step of any data science project.
- **Big Data**: the principles of visualization and exploration are even more critical in the age of large data volumes.
- **Education**: EDA is taught in statistics and data science courses around the world.

### EDA Today

Although the core principles remain the same, EDA has evolved with technology:

- **Modern Tools**: languages such as Python, R and Julia build Tukey's principles into their visualization libraries.
- **Interactive Visualizations**: tools such as Tableau and Power BI allow dynamic exploration of data.
- **Automation**: machine learning techniques are being used to automate parts of the exploratory process.

Tukey's view that "the most important goal of data analysis is to discover what you were not looking for" continues to guide analysts and data scientists around the world.

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
  <div>  Standard Deviation: 2.39</div>
  <div> </div>
  <div>Variable: Grade</div>
  <div>  Mean: 7.0</div>
  <div>  Median: 7.0</div>
  <div>  Minimum: 5</div>
  <div>  Maximum: 9</div>
  <div>  Standard Deviation: 1.41</div>
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
  <div>   1 │ No          3</div>
  <div>   2 │ Yes         5</div>
</div>

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

![Histogram of the grades]({{ site.baseurl }}/assets/images/histograma_notas.png)

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

![Scatter plot]({{ site.baseurl }}/assets/images/grafico_dispersao.png)

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

![Boxplot of study hours by pass status]({{ site.baseurl }}/assets/images/boxplot_horas_estudo.png)

## What the Results Show

Based on the exploratory analysis, we can draw the following conclusions:

1. **Distribution of Grades**: grades range from 5 to 9, with a mean of 7.0.
2. **Relationship Between Variables**: there is a positive correlation between study hours and grades, suggesting that students who study more tend to get better grades.
3. **Passing**: 5 of the 8 students passed (grade ≥ 7).
4. **Students' Ages**: the mean age is about 21, ranging from 18 to 24.

## Next Steps

Based on this exploratory analysis, we could:

1. Run statistical tests to check whether the relationships found are significant
2. Collect more data to make the conclusions more reliable
3. Build a classification model to predict passing from the other variables

## References

1. Tukey, J. W. (1977). *Exploratory Data Analysis*. Addison-Wesley.
2. Behrens, J. T. (1997). *Principles and Procedures of Exploratory Data Analysis*. Psychological Methods.
3. Wickham, H., & Grolemund, G. (2016). *R for Data Science*. O'Reilly Media.
