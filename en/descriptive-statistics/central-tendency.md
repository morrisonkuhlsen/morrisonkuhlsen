---
layout: page
title: Measures of Central Tendency
lang: en
ref: tendencia-central
parent: estatistica-descritiva
permalink: /en/descriptive-statistics/central-tendency
order: 1
mathjax: true
description: "Mean, median and mode: the main measures that describe the typical value of a data set."
---

**Measures of central tendency** are fundamental tools in descriptive statistics. They help us understand *where* the data "point", that is, the value around which the data tend to cluster.

The three most common measures are:

1. **Arithmetic Mean**
2. **Median**
3. **Mode**

Each one is useful in different contexts, depending on the type of data and the shape of the distribution.

---

<div style="border-left: 4px solid orange; padding: 0.5em; background-color: #fff3cd;">
  <strong>⚠️ Caution:</strong> the <strong>arithmetic mean</strong> can be quite <em>sensitive to extreme values</em> (outliers).<br>
  In skewed distributions, such as <strong>income</strong> or <strong>waiting times</strong>, the mean may <em>not represent the central tendency well</em>.<br>
  In those cases, prefer the <strong>median</strong> or the <strong>mode</strong>, depending on the goal of the analysis.
</div>

---

## 1. Arithmetic Mean

The **arithmetic mean** is the value obtained by adding up all the elements of the set and dividing by the total number of elements.

### Formula

$$\bar{x} = \frac{1}{n}\sum_{i=1}^{n}x_i = \frac{x_1 + x_2 + \cdots + x_n}{n}$$

- **Σxᵢ**: the sum of all values
- **n**: the number of observations

### Worked Example

Consider the ages: `20, 22, 24, 26, 28`

That is, the values:  
$x_1 = 20$, 
$x_2 = 22$, 
$x_3 = 24$, 
$x_4 = 26$, 
$x_5 = 28$

The arithmetic mean $\bar{x}$ is given by:

$$\bar{x} = \frac{x_1 + x_2 + x_3 + x_4 + x_5}{n}$$

Substituting the values:

$$\bar{x} = \frac{20 + 22 + 24 + 26 + 28}{5}$$

$$\bar{x} = \frac{120}{5}$$

$$\bar{x} = 24$$

### When to use it with care

- Highly sensitive to **atypical values** (outliers)
- May **not represent** the center well in **skewed** distributions

### 💻 Example in Julia

Let's compute the arithmetic mean in Julia:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code># Loading the Statistics package
using Statistics

# Example data
ages = [20, 22, 24, 26, 28]

# Computing the mean
avg = mean(ages)
println("Ages: ", ages)
println("Mean: ", avg)

# Manual computation
total = sum(ages)
n = length(ages)
avg_manual = total / n
println("Sum: ", total)
println("Count: ", n)
println("Mean (manual): ", avg_manual)</code></pre>
  </div>
</div>

#### Expected output:
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <div>Ages: [20, 22, 24, 26, 28]</div>
  <div>Mean: 24.0</div>
  <div>Sum: 120</div>
  <div>Count: 5</div>
  <div>Mean (manual): 24.0</div>
</div>

### 💡 Did you know?

The mean is widely used in social indicators, such as **GDP per capita**, but it does not always faithfully represent the situation of every individual in a population.

In statistics, different symbols are used for the **mean**, depending on the context (sample, population, etc.). The most common ones are below:

---

### 1. Sample Arithmetic Mean

**Symbol:** $\bar{x}$ (read: "x bar")

**Meaning:** the **mean of a sample**.

**Formula:**
$\bar{x} = \frac{\sum_{i=1}^{n} x_i}{n}$

**Where:**
- $\bar{x}$: sample mean  
- $x_i$: the i-th value in the sample  
- $n$: total number of observations in the sample  
- $\sum$: summation sign (the sum of all values)

---

### 2. Population Arithmetic Mean

**Symbol:** $\mu$ (Greek letter "mu")

**Meaning:** the **mean of an entire population**.

**Formula:**
$\mu = \frac{\sum_{i=1}^{N} x_i}{N}$

**Where:**
- $\mu$: population mean  
- $x_i$: the i-th value in the population  
- $N$: total number of elements in the population  

---

#### 3. Summation

**Symbol:** $\sum$ (Greek letter "capital sigma")

**Meaning:** the **sum** of a sequence of values.

**Example:**
$\sum_{i=1}^{5} x_i = x_1 + x_2 + x_3 + x_4 + x_5$

---

#### 4. Subscript $i$

**Symbol:** $x_i$

**Meaning:** the **i-th element** of the sample or population.  
It signals that we are working with a sequence of data, such as $x_1, x_2, ..., x_n$.

---

#### Summary

| Symbol      | Name                     | Represents                             |
|-------------|--------------------------|----------------------------------------|
| $\bar{x}$   | x bar                    | Sample mean                            |
| $\mu$       | mu                       | Population mean                        |
| $\sum$      | capital sigma            | Summation (sum of the values)          |
| $x_i$       | x sub i                  | i-th element of the sample/population  |

---

#### Did you know? 📚

- The sample mean ($\bar{x}$) is a **point estimate** of the population mean ($\mu$).
- In inferential statistics, we use $\bar{x}$ to infer or estimate $\mu$.

---

## 2. Median

The **median** is the central value of a sorted set. It splits the set into two parts with the same number of observations.

#### Definition

Let $\\{x_1, x_2, ..., x_n\\}$ be a sorted data set:

- If $n$ (the number of observations) is **odd**, the median is the middle value:
  $\text{Median} = x_{\frac{n+1}{2}}$

- If $n$ is **even**, the median is the **mean of the two middle values**:
  $\text{Median} = \frac{x_{\frac{n}{2}} + x_{\frac{n}{2} + 1}}{2}$

---

#### Examples

##### 🔹 Example 1: odd number of elements

Data set:  
$\\{1,\, 3,\, 3,\, 6,\, 7,\, 8,\, 9\\}$

Number of elements: $n = 7$ (odd)  
Middle value: 4th position → **6**

**Median = 6**

---

##### 🔹 Example 2: even number of elements

Data set:  
$\\{3,\, 5,\, 7,\, 9\\}$

Number of elements: $n = 4$ (even)  
Middle values: 2nd and 3rd positions → 5 and 7  
$\text{Median} = \frac{5 + 7}{2} = 6$

---

#### Why the Median Matters

The **median** is a **robust** measure of central tendency. That is, it is less sensitive to extreme values (**outliers**) than the mean.

### 💻 Example in Julia

Let's compute the median in Julia:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code># Loading the Statistics package
using Statistics

# Data from the examples
data_odd = [1, 3, 3, 6, 7, 8, 9]
data_even = [3, 5, 7, 9]

# Computing the median
median_odd = median(data_odd)
median_even = median(data_even)


println("Data (odd): ", data_odd)
println("Median: ", median_odd)
println("\nData (even): ", data_even)
println("Median: ", median_even)

# Manual computation for the even case
function median_manual(v)
    sorted = sort(v)
    n = length(sorted)
    if n % 2 == 1  # Odd
        return sorted[(n + 1) ÷ 2]
    else  # Even
        return (sorted[n ÷ 2] + sorted[n ÷ 2 + 1]) / 2
    end
end

println("\nManual computation (even): ", median_manual(data_even))</code></pre>
  </div>
</div>

#### Expected output:
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <div>Data (odd): [1, 3, 3, 6, 7, 8, 9]</div>
  <div>Median: 6.0</div>
  <div> </div>
  <div>Data (even): [3, 5, 7, 9]</div>
  <div>Median: 6.0</div>
  <div> </div>
  <div>Manual computation (even): 6.0</div>
</div>

<div style="border-left: 4px solid #007BFF; padding: 0.5em; background-color: #e7f1ff;">
  <strong>🔎 Definition – Robustness:</strong> in statistics, <strong>robustness</strong> is <em>the ability of an estimator or measure to resist the influence of atypical data (outliers)</em>.<br>
  A robust method keeps giving reliable results even when the data contain <strong>extreme values</strong> or <strong>small violations of the assumptions</strong>. The <strong>median</strong>, for example, is considered a robust measure because it is barely affected by very high or very low values.
</div>
<br>

With **distorted or skewed values**, the median is **more representative** than the mean.

---

#### The Median in Robust Statistics

The median has a **50% breakdown point**: **less than half of the data** can be contaminated (with errors or extreme values, however large) without the median being dragged far away. The mean has a breakdown point of zero — **a single** absurd value can take it anywhere.

An example: in $\\{2, 3, 4, 5, 6\\}$, the mean is $\frac{2 + 3 + 4 + 5 + 6}{5} = \frac{20}{5} = 4$ and the median is 4. Replacing the 6 with 600 (a typo), the mean becomes $\frac{2 + 3 + 4 + 5 + 600}{5} = \frac{614}{5} = 122.8$, while the median stays at 4.

That makes the median essential in areas such as:
- Income analysis (e.g. avoiding distortion by billionaires)
- Price assessment
- Biostatistics

---

#### Comparison: Median vs. Mean

| Feature               | Median                      | Mean                       |
|-----------------------|-----------------------------|----------------------------|
| Sensitive to outliers | ❌ No                       | ✅ Yes                     |
| Easy to compute       | ✅ Yes (sorted data)        | ✅ Yes                     |
| Robustness            | ✅ High                     | ❌ Low                     |
| Applications          | Skewed data, incomes        | Symmetric, normal data     |

---

### 📜 History of the Median

The idea of a "middle value" is old, but the median took a long time to get a name and a place in statistics.

#### 🔹 17th Century: mean or median lifetime?

In 1669, the brothers **Christiaan** and **Lodewijk Huygens** exchanged letters about the London mortality table published by John Graunt in 1662. Trying to work out how much longer a person of a given age lives, the two reached different answers: one computed the **mean** remaining lifetime, and the other the age by which **half** of the people have died — that is, the **median**. Both measures are still used in life tables today, and the gap between them is exactly the gap between mean and median in a skewed distribution.

#### 🔹 A property that explains the robustness

The median has a property that helps explain why it resists extreme values: it is the value $m$ that **minimizes the sum of the absolute distances** to the data,

$$
\text{Median} = \underset{m}{\arg\min} \sum_{i=1}^{n} \left| x_i - m \right|
$$

- $x_i$ are the data values,
- $m$ is the candidate value,
- $\arg\min$ indicates the value of $m$ that makes the sum as small as possible,
- $\sum \left\lvert x_i - m \right\rvert$ is the sum of the absolute distances between the data and $m$.

The mean, by contrast, is the value that minimizes the sum of the **squared** distances, $\sum (x_i - m)^2$. Squaring gives huge weight to a large distance; the absolute value does not — which is why an extreme value pulls the mean much more than the median.

**Example with the data $\\{1, 2, 10\\}$**, whose median is 2 and whose mean is $\frac{1 + 2 + 10}{3} = \frac{13}{3} \approx 4.33$:

| Candidate $m$ | $\lvert 1 - m \rvert + \lvert 2 - m \rvert + \lvert 10 - m \rvert$ | Sum |
|---|---|---:|
| 1 | $0 + 1 + 9$ | 10 |
| 2 (median) | $1 + 0 + 8$ | **9** |
| 3 | $2 + 1 + 7$ | 10 |
| 4.33 (mean) | $3.33 + 2.33 + 5.67$ | 11.33 |

The smallest sum, 9, occurs at $m = 2$, the median.

#### 🔹 19th Century: the name

The name **median** is usually credited to the British scientist **Francis Galton** (1822–1911), Charles Darwin's half-cousin, who used the median and quartiles instead of the mean in his studies of human traits, such as height. He is also credited with the term **percentile** — the median is the 50th percentile.

#### 🔹 20th Century Onward: robust statistics

With the rise of **robust statistics** from the 1960s on, the median gained prominence as an alternative that is **resistant to extreme values**. An influential work in this line is **John Tukey**'s survey of sampling from "contaminated" distributions (Tukey, 1960).

## 3. Mode

The **mode** is the value that occurs most frequently in a data set. Unlike the mean and the median, the mode can be used for both numerical and categorical data.

### Mathematical Definition

For a data set $X = \\{x_1, x_2, ..., x_n\\}$, the mode is the value $x_i$ that maximizes the frequency function:

$$
\text{Mode} = \arg\max_{x} \, f(x)
$$

where $f(x)$ is the number of times the value $x$ appears in the data set.

### Properties of the Mode

- **Not affected by extreme values**
- **There can be more than one mode** (bimodal, trimodal, etc.)
- **Useful for qualitative** (categorical) **data**
- **May not exist** if all values have the same frequency

### Worked Examples

#### Example 1: Single-mode numerical data

Data set: $\\{1, 2, 2, 3, 4, 4, 4, 5\\}$  
**Mode = 4** (occurs 3 times)

#### Example 2: Categorical data

Car colors in a parking lot:  
Red, Blue, Blue, Green, Red, Black, Black, Black  
**Mode = Black** (occurs 3 times)

#### Example 3: Bimodal data

Ages in a class:  
$\\{18, 19, 19, 19, 20, 21, 22, 22, 22, 23\\}$  
**Modes = 19 and 22** (both occur 3 times)

### 💻 Example in Julia

Let's compute the mode in Julia:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code># Loading the StatsBase package for the mode function
using StatsBase

# Example 1: single-mode numerical data
data1 = [1, 2, 2, 3, 4, 4, 4, 5]
mode1 = mode(data1)
println("Data 1: ", data1)
println("Mode: ", mode1)

# Example 2: categorical data
colors = ["Red", "Blue", "Blue", "Green", "Red", "Black", "Black", "Black"]
mode_colors = mode(colors)
println("\nColors: ", colors)
println("Mode: ", mode_colors)

# Example 3: bimodal data
function find_modes(v)
    counts = countmap(v)  # Counts how often each value appears
    max_count = maximum(values(counts))
    modes = sort([k for (k, v) in counts if v == max_count])  # ascending order
    return length(modes) > 1 ? modes : modes[1]
end

ages = [18, 19, 19, 19, 20, 21, 22, 22, 22, 23]
modes_ages = find_modes(ages)
println("\nAges: ", ages)
println("Mode(s): ", modes_ages)

# Example 4: no mode (all values are unique)
no_mode = [1, 2, 3, 4, 5]
println("\nData with no mode: ", no_mode)
println("mode returns (first element): ", mode(no_mode))</code></pre>
  </div>
</div>

#### Expected output:
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <div>Data 1: [1, 2, 2, 3, 4, 4, 4, 5]</div>
  <div>Mode: 4</div>
  <div> </div>
  <div>Colors: ["Red", "Blue", "Blue", "Green", "Red", "Black", "Black", "Black"]</div>
  <div>Mode: Black</div>
  <div> </div>
  <div>Ages: [18, 19, 19, 19, 20, 21, 22, 22, 22, 23]</div>
  <div>Mode(s): [19, 22]</div>
  <div> </div>
  <div>Data with no mode: [1, 2, 3, 4, 5]</div>
  <div>mode returns (first element): 1</div>
</div>

#### Notes:
- The `mode` function from the `StatsBase` package returns the first mode it finds
- For multimodal sets, we wrote a `find_modes` function that returns every mode, in ascending order (`countmap` keeps no order; without the `sort`, the output could come out as `[22, 19]`)
- For sets with no mode (all values unique), `mode` **gives no warning**: it returns the first value in the list. It's up to the analyst to check the frequencies before calling that a mode
- For categorical data, the function works the same way as for numerical data

### Historical Context

The idea of the "most frequent value" is old, but the **name** *mode* was introduced by **Karl Pearson** in 1895, in a paper on skewed distributions, for the value at which the frequency curve reaches its maximum (Pearson, 1895).

### Advantages and Disadvantages

| Advantages | Disadvantages |
|-----------|--------------|
| Easy to understand | May not be unique |
| Useful for categorical data | May not exist |
| Not affected by extreme values | May not represent the center of the data well |
| Can be used on any measurement scale | May not reflect changes in the data |

### When to Use the Mode

- Categorical data (colors, types, categories)
- Finding the most common value in a distribution
- When the data have several peaks (multimodal distributions)
- A quick first look at the data

### Practical Applications

1. **Retail**: finding the best-selling products
2. **Opinion polls**: finding the most frequent answer
3. **Quality control**: finding the most common defects
4. **Demography**: finding the most common age groups
5. **Meteorology**: finding the most frequent temperature over a period

---

## References

1. Encyclopedia of Mathematics. *Galton, Francis*. Available at <https://encyclopediaofmath.org/wiki/Galton,_Francis>. Accessed November 23, 2026.
2. Huygens, C.; Huygens, L. (1669). Correspondence on Graunt's mortality table (letters from August to December 1669). English translation by R. J. Pulskamp: <https://gtfp.cs.rhul.ac.uk/pulskamp/Huygens/sources/cor_mort.pdf>.
3. Pearson, K. (1895). Contributions to the mathematical theory of evolution. II. Skew variation in homogeneous material. *Philosophical Transactions of the Royal Society of London. A*, 186, 343–414.
4. Tukey, J. W. (1960). A survey of sampling from contaminated distributions. In: Olkin, I. et al. (Eds.), *Contributions to Probability and Statistics*. Stanford University Press.

### Further reading on the history

- Hald, A. (1998). *A History of Mathematical Statistics from 1750 to 1930*. Wiley.
- Stigler, S. M. (1986). *The History of Statistics: The Measurement of Uncertainty before 1900*. Harvard University Press.
