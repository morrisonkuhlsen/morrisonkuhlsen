---
layout: page
title: Time Series
lang: en
ref: series-temporais
parent: analise-de-dados
permalink: /en/data-analysis/time-series
order: 2
mathjax: true
description: "Time series: trend, seasonality and noise, moving averages, a decomposition worked by hand, autocorrelation, forecasting and validation, with Julia code."
---

<img src="{{ site.baseurl }}/assets/images/timeseries.avif" alt="Illustration of a person at a computer looking at a line chart that goes up and down, under the title Time Series" style="max-width: 600px; display: block; margin: 1em auto;">

A **time series** is a sequence of observations of the same variable taken over time, in order: the temperature each day, the sales each month, the number of visits to a website each hour. We write $y_1, y_2, \ldots, y_n$, where $y_t$ is the value at time (or period) $t$.

What sets time series apart from an ordinary sample is that **order matters**: values close in time tend to be similar (March sales look like February sales), so the observations are **not independent**. Many techniques that assume independence, such as the confidence intervals and tests on the [Statistical Inference]({{ '/en/statistical-inference/' | relative_url }}) pages, cannot be applied to them directly.

This page deals with series observed at **regular intervals** (every day, every month, every quarter) and with a single variable.

---

## 1. The Components of a Series

It is common to think of a series as the sum of parts with different roles:

| Component | What it is | Example |
|---|---|---|
| **Trend** ($T_t$) | Long-term upward or downward movement | A store's sales growing over the years |
| **Seasonality** ($S_t$) | A pattern that repeats with a **fixed, known period** | Higher sales every year-end; more heat every summer |
| **Cycle** | Long-term swings **with no fixed period** | Phases of economic expansion and recession |
| **Noise** ($R_t$) | Irregular variation left over after removing the other parts | A day of heavy rain, a typing error |

Seasonality and cycles are easily confused. The difference is the period: seasonality repeats every 12 months, 7 days, 4 quarters; a cycle has no fixed length. In practice, with only a few years of data, the cycle usually stays together with the trend (the "trend-cycle").

**Additive model:** when the height of the seasonal swing is roughly the same over time,

$$
y_t = T_t + S_t + R_t
$$

**Multiplicative model:** when the seasonal swing grows along with the level of the series (for example, the December peak is always about 30% above the year's average),

$$
y_t = T_t \times S_t \times R_t
$$

Taking logarithms (which requires positive values), the multiplicative model becomes additive: $\ln y_t = \ln T_t + \ln S_t + \ln R_t$.

<div style="border-left: 4px solid orange; padding: 0.5em; background-color: #fff3cd;">
  <strong>Note:</strong> to claim there is seasonality, you need to see the pattern <strong>repeat</strong>. With a single year of monthly data, a high December may be seasonality or just an unusual month: there is no way to tell. You need at least two or three complete periods.
</div>

---

## 2. Moving Average

A **moving average** smooths the series by replacing each value with the average of that value and its neighbors. Short-term swings cancel out and the trend shows up.

The **simple moving average of order 3**, centered at $t$, is

$$
MA_t = \frac{y_{t-1} + y_t + y_{t+1}}{3}
$$

When the series has seasonality with period $m$, we use a moving average of order $m$: each average covers exactly one complete period and the seasonality disappears from it. If $m$ is even (4 quarters, 12 months), the average of $m$ values falls "between" two time points; to center it on one time point, we use the **2×$m$ moving average**, which gives weight 1/2 to the two ends. For quarterly data ($m = 4$):

$$
MA_t = \frac{\tfrac{1}{2}y_{t-2} + y_{t-1} + y_t + y_{t+1} + \tfrac{1}{2}y_{t+2}}{4}
$$

These are 5 values with weights $\tfrac{1}{8}, \tfrac{1}{4}, \tfrac{1}{4}, \tfrac{1}{4}, \tfrac{1}{8}$, which add up to 1. Each quarter of the year enters with total weight 1/4, which is why the seasonal effect cancels out.

The moving average does not exist at the ends of the series (neighbors are missing), and it reacts with a lag to sudden changes.

---

## 3. Autocorrelation

The **autocorrelation at lag** $k$ measures the correlation between the series and itself shifted by $k$ periods:

$$
r_k = \frac{\sum_{t=1}^{n-k} (y_t - \bar{y})(y_{t+k} - \bar{y})}{\sum_{t=1}^{n} (y_t - \bar{y})^2}
$$

where $\bar{y}$ is the mean of all $n$ values. It lies between −1 and 1, like an ordinary correlation. A high positive $r_k$ says that values $k$ periods apart are similar. In a quarterly series with seasonality, $r_4$ (one year apart) is usually high. The plot of $r_k$ against $k$ is called a **correlogram** or **ACF**.

---

## 4. Worked Example: Decomposition and Forecast

**Situation** (illustrative numbers): a store's quarterly sales, in R\\$ thousand, over 3 years.

| | Q1 | Q2 | Q3 | Q4 |
|---|---|---|---|---|
| **Year 1** ($t$ = 1 to 4) | 40 | 52 | 46 | 70 |
| **Year 2** ($t$ = 5 to 8) | 44 | 56 | 50 | 76 |
| **Year 3** ($t$ = 9 to 12) | 48 | 61 | 54 | 81 |

Looking at the table: every year Q4 is the highest and Q1 the lowest (a pattern that **repeats** three times: seasonality), and each quarter sells more than the same quarter the year before (an upward trend). The height of the Q4 peak relative to the other quarters changes little from year to year, so we will use the **additive model**.

**Goal:** separate trend and seasonality and forecast sales for year 4.

### 4.1 Data

- $y_t$: sales in quarter $t$, in R\\$ thousand, $t = 1, \ldots, 12$ (from the table);
- seasonal period: $m = 4$ quarters;
- $n = 12$ observations.

### 4.2 Step 1: trend from the 2×4 moving average

Formula (section 2): $MA_t = \big(\tfrac{1}{2}y_{t-2} + y_{t-1} + y_t + y_{t+1} + \tfrac{1}{2}y_{t+2}\big) / 4$. It only exists from $t = 3$ to $t = 10$.

For $t = 3$, substituting:

$$
MA_3 = \frac{\tfrac{1}{2} \times 40 + 52 + 46 + 70 + \tfrac{1}{2} \times 44}{4} = \frac{20 + 52 + 46 + 70 + 22}{4} = \frac{210}{4} = 52.5
$$

The others, in the same way:

| $t$ | Numerator arithmetic | Numerator | $MA_t$ |
|---|---|---|---|
| 3 | $20 + 52 + 46 + 70 + 22$ | 210 | 52.5 |
| 4 | $26 + 46 + 70 + 44 + 28$ | 214 | 53.5 |
| 5 | $23 + 70 + 44 + 56 + 25$ | 218 | 54.5 |
| 6 | $35 + 44 + 56 + 50 + 38$ | 223 | 55.75 |
| 7 | $22 + 56 + 50 + 76 + 24$ | 228 | 57 |
| 8 | $28 + 50 + 76 + 48 + 30.5$ | 232.5 | 58.125 |
| 9 | $25 + 76 + 48 + 61 + 27$ | 237 | 59.25 |
| 10 | $38 + 48 + 61 + 54 + 40.5$ | 241.5 | 60.375 |

The moving average grows steadily: it is the trend, now free of seasonality.

### 4.3 Step 2: deviations from the trend

For each $t$ with a moving average, the deviation $y_t - MA_t$ shows how far that quarter was above or below the trend:

| $t$ | Quarter | $y_t$ | $MA_t$ | $y_t - MA_t$ |
|---|---|---|---|---|
| 3 | Q3 | 46 | 52.5 | −6.5 |
| 4 | Q4 | 70 | 53.5 | 16.5 |
| 5 | Q1 | 44 | 54.5 | −10.5 |
| 6 | Q2 | 56 | 55.75 | 0.25 |
| 7 | Q3 | 50 | 57 | −7 |
| 8 | Q4 | 76 | 58.125 | 17.875 |
| 9 | Q1 | 48 | 59.25 | −11.25 |
| 10 | Q2 | 61 | 60.375 | 0.625 |

### 4.4 Step 3: seasonal effect of each quarter

The **raw seasonal effect** of a quarter is the mean of its deviations (each quarter appears twice):

$$
\text{Q1}: \frac{-10.5 + (-11.25)}{2} = \frac{-21.75}{2} = -10.875 \qquad
\text{Q2}: \frac{0.25 + 0.625}{2} = \frac{0.875}{2} = 0.4375
$$

$$
\text{Q3}: \frac{-6.5 + (-7)}{2} = \frac{-13.5}{2} = -6.75 \qquad
\text{Q4}: \frac{16.5 + 17.875}{2} = \frac{34.375}{2} = 17.1875
$$

In the additive model, the seasonal effects should **add up to zero** over a year (what one quarter gains, another loses). If the sum is not zero, the mean of the four effects is subtracted from each. Here:

$$
-10.875 + 0.4375 + (-6.75) + 17.1875 = 0
$$

The sum is already zero, so the adjusted effects are the same: $S_1 = -10.875$, $S_2 = 0.4375$, $S_3 = -6.75$, $S_4 = 17.1875$.

**Interpretation:** once the trend is removed, the 4th quarter sells about R\\$ 17.2 thousand above the year's level, and the 1st about R\\$ 10.9 thousand below; the 2nd is practically at the level.

### 4.5 Step 4: seasonally adjusted series

Removing from each value the effect of its quarter, $d_t = y_t - S_{\text{quarter}(t)}$, leaves trend + noise:

| $t$ | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| $y_t$ | 40 | 52 | 46 | 70 | 44 | 56 | 50 | 76 | 48 | 61 | 54 | 81 |
| $S$ | −10.875 | 0.4375 | −6.75 | 17.1875 | −10.875 | 0.4375 | −6.75 | 17.1875 | −10.875 | 0.4375 | −6.75 | 17.1875 |
| $d_t$ | 50.875 | 51.5625 | 52.75 | 52.8125 | 54.875 | 55.5625 | 56.75 | 58.8125 | 58.875 | 60.5625 | 60.75 | 63.8125 |

For example, $d_1 = 40 - (-10.875) = 40 + 10.875 = 50.875$.

### 4.6 Step 5: trend line

We fit a line $\hat{d}\_t = a + b\,t$ to the seasonally adjusted series by [least squares]({{ '/en/data-analysis/linear-regression' | relative_url }}): $b = S\_{td}/S\_{tt}$ and $a = \bar{d} - b\,\bar{t}$.

- $\bar{t} = (1 + 2 + \cdots + 12)/12 = 78/12 = 6.5$;
- $\bar{d} = (50.875 + 51.5625 + \cdots + 63.8125)/12 = 678/12 = 56.5$.

| $t$ | $t - \bar{t}$ | $d_t - \bar{d}$ | $(t - \bar{t})(d_t - \bar{d})$ | $(t - \bar{t})^2$ |
|---|---|---|---|---|
| 1 | −5.5 | −5.625 | 30.9375 | 30.25 |
| 2 | −4.5 | −4.9375 | 22.21875 | 20.25 |
| 3 | −3.5 | −3.75 | 13.125 | 12.25 |
| 4 | −2.5 | −3.6875 | 9.21875 | 6.25 |
| 5 | −1.5 | −1.625 | 2.4375 | 2.25 |
| 6 | −0.5 | −0.9375 | 0.46875 | 0.25 |
| 7 | 0.5 | 0.25 | 0.125 | 0.25 |
| 8 | 1.5 | 2.3125 | 3.46875 | 2.25 |
| 9 | 2.5 | 2.375 | 5.9375 | 6.25 |
| 10 | 3.5 | 4.0625 | 14.21875 | 12.25 |
| 11 | 4.5 | 4.25 | 19.125 | 20.25 |
| 12 | 5.5 | 7.3125 | 40.21875 | 30.25 |
| **Sum** | | | $S_{td} = 161.5$ | $S_{tt} = 143$ |

$$
b = \frac{S_{td}}{S_{tt}} = \frac{161.5}{143} = 1.129370\ldots \approx 1.1294 \text{ (R\$ thousand per quarter)}
$$

$$
a = \bar{d} - b\,\bar{t} = 56.5 - 1.129370\ldots \times 6.5 = 56.5 - 7.340909\ldots = 49.159090\ldots \approx 49.1591
$$

**Interpretation:** once seasonality is removed, sales grow on average by about R\\$ 1.13 thousand per quarter, that is, about R\\$ 4.5 thousand per year.

### 4.7 Step 6: forecast for year 4

Forecast = trend in the quarter + seasonal effect of the quarter: $\hat{y}\_t = a + b\,t + S\_{\text{quarter}(t)}$, with the full $a$ and $b$.

| $t$ | Quarter | Trend $a + b\,t$ | Effect $S$ | Forecast $\hat{y}_t$ (R\\$ thousand) |
|---|---|---|---|---|
| 13 | Q1 | $49.159091 + 1.129371 \times 13 = 63.840909$ | −10.875 | 52.97 |
| 14 | Q2 | $49.159091 + 1.129371 \times 14 = 64.970280$ | 0.4375 | 65.41 |
| 15 | Q3 | $49.159091 + 1.129371 \times 15 = 66.099650$ | −6.75 | 59.35 |
| 16 | Q4 | $49.159091 + 1.129371 \times 16 = 67.229021$ | 17.1875 | 84.42 |

**Interpretation and limits.** If the trend and seasonal pattern of the last 3 years continue, year 4 should have sales of about R\\$ 53, 65, 59 and 84 thousand in the four quarters. This is an **extrapolation**: it assumes nothing changes (the economy, competitors, the store itself). The further into the future, the less reliable it is. And these forecasts come without a margin of error; methods like those in section 6 give prediction intervals.

### 4.8 Check with autocorrelation

With $\bar{y} = 678/12 = 56.5$ and $\sum (y_t - \bar{y})^2 = 1863$, the autocorrelations (computed by the code in section 5) are:

| Lag $k$ | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| $r_k$ | −0.313 | 0.313 | −0.416 | **0.611** | −0.266 | 0.101 |

The largest is $r_4 = 0.611$: values **one year** apart are similar, which confirms the period-4 seasonality seen in the table. With only 12 observations, these values are imprecise; they are an indication, not proof.

---

## 5. Julia Code

Each block runs on its own. The first one redoes the whole example and produces the figure.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Statistics, Plots

# Quarterly sales (R$ thousand) of a store over 3 years (illustrative numbers)
sales = [40, 52, 46, 70, 44, 56, 50, 76, 48, 61, 54, 81]
n = length(sales)
quarter(t) = mod1(t, 4)   # 1, 2, 3, 4, 1, 2, ...

# 1. Trend: centered 2×4 moving average (only exists from t = 3 to t = n − 2)
ma = [(sales[t-2]/2 + sales[t-1] + sales[t] + sales[t+1] + sales[t+2]/2) / 4 for t in 3:n-2]

# 2. Seasonal effect: mean of (value − moving average) in each quarter, adjusted to sum to zero
deviations = sales[3:n-2] .- ma
raw = [mean(deviations[i] for (i, t) in enumerate(3:n-2) if quarter(t) == q) for q in 1:4]
effect = raw .- mean(raw)

# 3. Seasonally adjusted series and a linear trend (least squares) fitted to it
adjusted = [sales[t] - effect[quarter(t)] for t in 1:n]
time = 1:n
b = sum((time .- mean(time)) .* (adjusted .- mean(adjusted))) / sum((time .- mean(time)) .^ 2)
a = mean(adjusted) - b * mean(time)

# 4. Forecast for year 4: trend + seasonal effect
future = 13:16
forecast = [a + b * t + effect[quarter(t)] for t in future]

println("Moving averages (t = 3 to 10): ", ma)
println("Seasonal effects (Q1 to Q4): ", effect)
println("Trend: a = ", round(a, digits = 4), "   b = ", round(b, digits = 4), " per quarter")
println("Year 4 forecast: ", round.(forecast, digits = 2))

# Sample autocorrelation at lags 1 to 6
m = mean(sales)
acf(k) = sum((sales[t] - m) * (sales[t+k] - m) for t in 1:n-k) / sum((sales .- m) .^ 2)
println("Autocorrelation r1 to r6: ", round.([acf(k) for k in 1:6], digits = 3))

p = plot(1:n, sales, marker = :circle, label = "Sales", xlabel = "Quarter (t)",
         ylabel = "Sales (R\$ thousand)", title = "Decomposition and forecast", legend = :topleft,
         xticks = 1:16, size = (800, 420), left_margin = 5Plots.mm, bottom_margin = 3Plots.mm)
plot!(p, 3:n-2, ma, lw = 2, label = "2×4 moving average (trend)")
plot!(p, 1:16, a .+ b .* (1:16), ls = :dash, color = :gray, label = "Linear trend")
plot!(p, future, forecast, marker = :diamond, ls = :dot, color = :crimson, label = "Forecast (year 4)")
savefig(p, "time_series_decomposition_en.png")</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">Moving averages (t = 3 to 10): [52.5, 53.5, 54.5, 55.75, 57.0, 58.125, 59.25, 60.375]
Seasonal effects (Q1 to Q4): [-10.875, 0.4375, -6.75, 17.1875]
Trend: a = 49.1591   b = 1.1294 per quarter
Year 4 forecast: [52.97, 65.41, 59.35, 84.42]
Autocorrelation r1 to r6: [-0.313, 0.313, -0.416, 0.611, -0.266, 0.101]</pre>
</div>

![Chart of quarterly sales from t = 1 to 12, with the 2×4 moving average rising steadily, the dashed trend line and the four year-4 forecasts in red]({{ site.baseurl }}/assets/images/time_series_decomposition_en.png){:style="max-width: 800px; display: block; margin: 1em auto;"}
<div class="image-caption" style="text-align: center;">Figure 1. Quarterly sales, 2×4 moving average (trend), trend line and year-4 forecast, produced by the code above.</div>

### 5.1 Validation: does the method forecast well?

A model always looks good on the data used to fit it. To find out whether it **forecasts**, set aside the end of the series, fit on the beginning and compare the forecast with what actually happened. In time series, the split respects the order of time: the test always comes **after** the training data (drawing observations at random, as in other problems, would let the model "see the future").

Below, the method is fitted on years 1 and 2 and forecasts year 3. As a benchmark, we use the **seasonal naive method**, which forecasts each quarter by repeating the value of the same quarter in the previous year. The measure is the **mean absolute error** (MAE), the average distance between forecast and actual value.

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

sales = [40, 52, 46, 70, 44, 56, 50, 76, 48, 61, 54, 81]
quarter(t) = mod1(t, 4)

# Same method as in the previous section, using only the past data in `series`
function forecast(series, horizon)
    n = length(series)
    ma = [(series[t-2]/2 + series[t-1] + series[t] + series[t+1] + series[t+2]/2) / 4 for t in 3:n-2]
    deviations = series[3:n-2] .- ma
    raw = [mean(deviations[i] for (i, t) in enumerate(3:n-2) if quarter(t) == q) for q in 1:4]
    effect = raw .- mean(raw)
    adjusted = [series[t] - effect[quarter(t)] for t in 1:n]
    time = 1:n
    b = sum((time .- mean(time)) .* (adjusted .- mean(adjusted))) / sum((time .- mean(time)) .^ 2)
    a = mean(adjusted) - b * mean(time)
    return [a + b * t + effect[quarter(t)] for t in n+1:n+horizon]
end

# Time-based validation: fit on years 1 and 2 and forecast year 3, which is already known
train, test = sales[1:8], sales[9:12]
predicted = forecast(train, 4)
naive = train[5:8]                         # seasonal naive method: repeat the previous year

mae(pred) = mean(abs.(test .- pred))       # mean absolute error
println("Actual (year 3):      ", test)
println("Decomposition:        ", round.(predicted, digits = 2), "   MAE = ", round(mae(predicted), digits = 2))
println("Seasonal naive:       ", naive, "   MAE = ", round(mae(naive), digits = 2))</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">Actual (year 3):      [48, 61, 54, 81]
Decomposition:        [49.04, 60.95, 55.36, 79.52]   MAE = 0.98
Seasonal naive:       [44, 56, 50, 76]   MAE = 4.5</pre>
</div>

The decomposition was off by about R\\$ 1 thousand per quarter on average; the naive method by R\\$ 4.5 thousand, because it does not follow the upward trend. A method is only worth it if it beats a simple competitor like this one. With only 4 test quarters, the comparison is an indication, not a firm conclusion.

---

## 6. Other Methods

Classical decomposition is simple and easy to explain, but it assumes the seasonal pattern is always the same and gives no margin of error. Other common methods:

- **Exponential smoothing** (including the Holt-Winters method): the forecast is a weighted average of the past, with weights that decay exponentially for older values; there are versions with trend and seasonality.
- **ARIMA and SARIMA models**: describe each value as a combination of previous values and errors. They require a **stationary** series (section 7), usually obtained by taking differences ($y_t - y_{t-1}$, or $y_t - y_{t-4}$ to remove quarterly seasonality).
- **Prophet**: a decomposition model with trend, seasonalities and holidays, published by researchers at Facebook (Taylor and Letham, 2018).
- **Neural networks** (for example, LSTM): can capture complex patterns, but need a lot of data and are hard to interpret; on short series, they often do not beat the methods above.

Hyndman and Athanasopoulos's book (reference 1), free online, explains all of them with examples.

---

## 7. Good Practices and Pitfalls

- **Plot the series** before any calculation: trend, seasonality, sudden changes and outliers usually show up in the chart.
- **Stationarity**: a series is (weakly) stationary when its mean and variance do not change over time and the correlation between $y_t$ and $y_{t+k}$ depends only on the distance $k$. Series with trend or seasonality are **not** stationary. Many models (such as ARIMA) require stationarity.
- **Spurious correlation**: two series that grow over time (for example, ice cream sales and the number of mobile phone users) will have a high correlation with no real relationship between them. Compare the changes, not the levels.
- **Validate over time**: split training and test data respecting chronological order and compare with a naive method.
- **Do not trust long-range forecasts**: uncertainty grows with the horizon.
- **Structural breaks** (a pandemic, a rule change, a new store) break the pattern of the past; the model does not foresee them.

---

## 8. Glossary

| Term | Meaning |
|---|---|
| Time series | Observations of a variable in time order |
| Trend | Long-term upward or downward movement |
| Seasonality | A pattern that repeats with a fixed period |
| Cycle | Long-term swing with no fixed period |
| Noise | Irregular variation left after trend and seasonality |
| Moving average | Average of each value with its neighbors, which smooths the series |
| Autocorrelation | Correlation of the series with itself shifted in time |
| Stationarity | Mean, variance and autocorrelation that do not change over time |
| Seasonal adjustment | Removing the seasonal effect from the series |

---

## 9. Summary

- Time series: observations in time order, usually **dependent** on each other.
- Components: trend, seasonality (fixed period), cycle (no fixed period) and noise; additive or multiplicative model.
- In the example: 2×4 moving average, seasonal effects of −10.875 (Q1), 0.4375 (Q2), −6.75 (Q3) and 17.1875 (Q4), a trend of about R\\$ 1.13 thousand per quarter and a forecast of R\\$ 52.97, 65.41, 59.35 and 84.42 thousand for year 4.
- Seasonality can only be claimed by seeing the pattern repeat; $r_4 = 0.611$ confirms it in the example.
- Validate by forecasting a period that is already known, always after the training data, and compare with a naive method.

---

## References

1. Hyndman, R. J.; Athanasopoulos, G. (2021). *Forecasting: Principles and Practice*. 3rd ed. OTexts. Available at [otexts.com/fpp3](https://otexts.com/fpp3/).
2. Morettin, P. A.; Toloi, C. M. C. (2018). *Análise de Séries Temporais*, v. 1: Modelos Lineares Univariados. 3rd ed. Blucher. (in Portuguese)
3. Taylor, S. J.; Letham, B. (2018). Forecasting at Scale. *The American Statistician*, 72(1), 37–45. DOI: [10.1080/00031305.2017.1380080](https://doi.org/10.1080/00031305.2017.1380080).
