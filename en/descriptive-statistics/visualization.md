---
layout: page
title: Data Visualization
lang: en
ref: visualizacao
parent: estatistica-descritiva
permalink: /en/descriptive-statistics/visualization
order: 5
mathjax: true
description: "Techniques and tools for building effective visualizations of statistical data."
---

**Data Visualization** is a powerful tool for exploring, analyzing and communicating information effectively. It turns raw data into visual representations that make it easier to spot patterns, trends and anomalies that could go unnoticed in tables or text.

## Why Data Visualization Matters

Data visualization is not just about making pretty charts; it is about telling stories with data clearly and objectively. A good visualization can:

- Reveal patterns and trends hidden in the data
- Make complex concepts easier to understand
- Support informed decisions
- Communicate findings effectively to different audiences
- Quickly expose problems or anomalies in the data

## Edward Tufte and the Principles of Effective Visualization

Edward Tufte, one of the leading experts in data visualization, set out fundamental principles for building effective visualizations:

<div style="text-align: center; margin: 20px 0;">
  <img src="{{ site.baseurl }}/assets/images/EdwardTufte.avif" alt="Edward Tufte, data visualization expert" style="max-width: 300px; border-radius: 5px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
  <p style="font-style: italic; margin-top: 10px; color: #555;">Edward Tufte, data visualization expert</p>
</div>

### Tufte's Core Principles:

1. **Show the Data**: the visualization should put the data ahead of decorative elements.
2. **Signal-to-Noise Ratio**: maximize the share of relevant information relative to unnecessary visual elements.
3. **Causal Comparisons**: show cause-and-effect relationships when appropriate.
4. **Multidimensionality**: represent several variables in a single visualization when possible.
5. **Integrity**: stay accurate and don't distort the data.

## Types of Charts and When to Use Them

### 1. Bar Charts

**When to use:** to compare categories or show the distribution of a categorical variable.

**Example in Julia:**

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Plots

# Sample data
categories = ["A", "B", "C", "D"]
values = [25, 40, 15, 30]

# Creating the bar chart
bar(categories, values,
    xlabel = "Categories",
    ylabel = "Values",
    title = "Bar Chart Example",
    color = :steelblue,
    lw = 0,
    legend = false,
    ylims = (0, 50))</code></pre>
  </div>
</div>

#### Bar chart output:

![Bar chart]({{ site.baseurl }}/assets/images/grafico_barras.png)

### 2. Line Charts

**When to use:** to show trends over time or along a continuous variable.

**Example in Julia:**

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code># Sample data
years = 2010:2020
sales = [120, 145, 132, 178, 190, 210, 225, 240, 250, 265, 280]

chart = plot(years, sales,
           xlabel = "Year",
           ylabel = "Sales (thousands)",
           title = "Sales Growth (2010-2020)",
           label = "Annual Sales",
           lw = 2,
           color = :darkgreen,
           marker = :circle,
           legend = :topleft)

# Adding a trend line
using Statistics
coef = cov(1:length(years), sales) / var(1:length(years))
intercept = mean(sales) - coef * mean(1:length(years))
plot!(chart, years, x -> intercept + coef * (x - first(years) + 1),
      label = "Trend",
      linestyle = :dash,
      color = :red,
      lw = 2)</code></pre>
  </div>
</div>

#### Line chart with trend output:

![Line chart with trend]({{ site.baseurl }}/assets/images/grafico_linha_tendencia.png)

### 3. Scatter Plots

**When to use:** to show the relationship between two continuous variables.

**Example in Julia:**

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Plots, Random, GLM, DataFrames

# Generating the data
Random.seed!(123)
x = 1:100
y = 2 .* x .+ 10 .+ randn(100) .* 10
data = DataFrame(X=x, Y=y)

# Creating the scatter plot
scatter(x, y,
    xlabel = "Study Hours",
    ylabel = "Exam Grade",
    title = "Study Hours vs. Grades",
    color = :purple,
    alpha = 0.6,
    legend = :topright,
    markerstrokewidth = 0.5,
    markerstrokecolor = :white,
    markersize = 5,
    framestyle = :box)

# Adding the regression line
model = lm(@formula(Y ~ X), data)
pred_y = predict(model, DataFrame(X=x))
plot!(x, pred_y, lw=3, color=:red, label="Regression Line")</code></pre>
  </div>
</div>

#### Scatter plot with regression output:

![Scatter plot with regression]({{ site.baseurl }}/assets/images/grafico_dispersao_regressao.png)

### 4. Histograms

**When to use:** to show the distribution of a continuous variable.

**Example in Julia:**

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code># Sample data (normal distribution)
using Distributions
dist = Normal(100, 15)  # Mean = 100, standard deviation = 15
data = rand(dist, 1000)

# Creating the histogram
histogram(data,
          bins = 30,
          xlabel = "IQ Score",
          ylabel = "Frequency",
          title = "Distribution of IQ Scores",
          color = :lightblue,
          legend = false,
          normalize = :pdf,
          alpha = 0.7)

# Adding the density curve
x_range = minimum(data):0.1:maximum(data)
plot!(x_range, pdf.(dist, x_range), 
       lw=2, 
       color=:darkblue, 
       label="Normal Distribution")</code></pre>
  </div>
</div>

#### Histogram with density curve output:

![Histogram with density curve]({{ site.baseurl }}/assets/images/grafico_histograma.png)

### 5. Boxplots

**When to use:** to compare distributions across groups or identify outliers.

**Example in Julia:**

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
using Statistics

# Sample data (three different groups)
groups = ["Group A", "Group B", "Group C"]
values = [
    randn(100) .* 10 .+ 50,  # Mean 50, SD 10
    randn(100) .* 15 .+ 60,  # Mean 60, SD 15
    randn(100) .* 12 .+ 40   # Mean 40, SD 12
]

# Creating the boxplot
boxplot(groups, values,
        xlabel = "Groups",
        ylabel = "Values",
        title = "Comparing Distributions Across Groups",
        color = [:lightblue :lightgreen :lightpink],
        legend = false)


# Adding the mean to each boxplot
for (i, group) in enumerate(groups)
    scatter!([i], [mean(values[i])], 
             markershape=:diamond, 
             markersize=8, 
             markercolor=:red, 
             label=i==1 ? "Mean" : "")
end

current()  # Refreshes the plot with the means</code></pre>
  </div>
</div>

#### Boxplot with means output:

![Boxplot with means]({{ site.baseurl }}/assets/images/grafico_boxplot.png)

## Good Practices in Data Visualization

1. **Know your audience**: match the level of detail and complexity to who will read it.
2. **Keep it simple**: remove visual elements that add no information.
3. **Use color sparingly**: colors should have a clear purpose (highlighting, categorizing, etc.).
4. **Give context**: include clear titles, labels and legends.
5. **Be honest**: don't distort the data with misleading scales or important omissions.
6. **Test your visualizations**: check that other people read your charts correctly.

## Visualization Tools in Julia

Julia offers several powerful libraries for data visualization:

1. **Plots.jl**: a unified interface to several plotting backends
2. **Gadfly.jl**: inspired by R's ggplot2, focused on the grammar of graphics
3. **Makie.jl**: a high-performance, high-quality visualization library
4. **VegaLite.jl**: for declarative visualizations based on the Vega-Lite grammar of graphics
5. **PlotlyJS.jl**: for interactive JavaScript-based charts

## Conclusion

Data visualization is an essential skill for anyone who works with data analysis. Mastering different chart types and knowing when to use each can turn raw data into actionable insights. Always remember that the main goal is to communicate information clearly and effectively.

## References

1. Tufte, E. R. (2001). *The Visual Display of Quantitative Information*. Graphics Press.
2. Cairo, A. (2016). *The Truthful Art: Data, Charts, and Maps for Communication*. New Riders.
3. Healy, K. (2018). *Data Visualization: A Practical Introduction*. Princeton University Press.
4. Wilke, C. O. (2019). *Fundamentals of Data Visualization*. O'Reilly Media.
5. Official [Plots.jl](https://docs.juliaplots.org/latest/) documentation
