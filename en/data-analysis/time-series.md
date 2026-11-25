---
layout: page
title: Time Series
lang: en
ref: series-temporais
parent: analise-de-dados
permalink: /en/data-analysis/time-series
order: 2
mathjax: true
description: "Time series: plots, decomposition, exponential smoothing, Holt-Winters, ARIMA, error measures and forecasting with real data, with Julia, R and Python code."
---

<img src="{{ site.baseurl }}/assets/images/timeseries.avif" alt="Illustration of a person at a computer looking at a line chart that goes up and down, under the title Time Series" style="max-width: 600px; display: block; margin: 1em auto;">

A **time series** is a sequence of observations of the same variable taken over time, in order: the temperature each day, the sales each month, the number of visits to a website each hour. We write $y\_1, y\_2, \ldots, y\_n$, where $y\_t$ is the value at time (or period) $t$.

What sets time series apart from an ordinary sample is that **order matters**: values close in time tend to be similar (March sales look like February sales), so the observations are **not independent**. Many techniques that assume independence, such as the confidence intervals and tests on the [Statistical Inference]({{ '/en/statistical-inference/' | relative_url }}) pages, cannot be applied to them directly.

This page deals with series observed at **regular intervals** (every day, every month, every quarter) and with a single variable. The path is: the components of a series (section 1), plots (2), moving average and autocorrelation (3 and 4), a decomposition worked by hand (5), exponential smoothing and Holt-Winters (6), stationarity and ARIMA models (7), error measures, validation and intervals (8) and, finally, forecasting a real series, vehicle production in Brazil (9).

All code comes in three languages, **Julia, R and Python**: pick yours in the header of any block, and the choice applies to the whole page. The three versions do the same calculation and give the same numbers.

---

## 1. The Components of a Series

It is common to think of a series as the sum of parts with different roles:

| Component | What it is | Example |
|---|---|---|
| **Trend** ($T\_t$) | Long-term upward or downward movement | A store's sales growing over the years |
| **Seasonality** ($S\_t$) | A pattern that repeats with a **fixed, known period** | Higher sales every year-end; more heat every summer |
| **Cycle** | Long-term swings **with no fixed period** | Phases of economic expansion and recession |
| **Noise** ($R\_t$) | Irregular variation left over after removing the other parts | A day of heavy rain, a typing error |

Seasonality and cycles are easily confused. The difference is the period: seasonality repeats every 12 months, 7 days, 4 quarters; a cycle has no fixed length. In practice, with only a few years of data, the cycle usually stays together with the trend (the "trend-cycle").

**Additive model:** when the height of the seasonal swing is roughly the same over time,

$$
y_t = T_t + S_t + R_t
$$

**Multiplicative model:** when the seasonal swing grows along with the level of the series (for example, the December peak is always about 30% above the year's average),

$$
y_t = T_t \times S_t \times R_t
$$

Taking logarithms (which requires positive values), the multiplicative model becomes additive: $\ln y\_t = \ln T\_t + \ln S\_t + \ln R\_t$.

<div style="border-left: 4px solid orange; padding: 0.5em; background-color: #fff3cd;">
  <strong>Note:</strong> to claim there is seasonality, you need to see the pattern <strong>repeat</strong>. With a single year of monthly data, a high December may be seasonality or just an unusual month: there is no way to tell. You need at least two or three complete periods.
</div>

---

## 2. Plots for Time Series

Before any calculation, **plot the series**. Each type of plot shows something different. To see them all with real data, we use **monthly vehicle production in Brazil** from January 2010 to December 2018: 108 months, in thousands of vehicles (source details in the box below and in section 9).

<div style="border-left: 4px solid #2563eb; padding: 0.5em 0.8em; background-color: #eff6ff;">
  <strong>Data source:</strong> Central Bank of Brazil, Time Series Management System (SGS), series 1373, "Produção total de autoveículos" (total vehicle production), monthly, in units; primary source: Associação Nacional dos Fabricantes de Veículos Automotores (Anfavea, the Brazilian vehicle manufacturers' association). License: Open Data Commons Open Database License (ODbL), according to the Central Bank's Open Data Portal. Data obtained from the SGS API on November 25, 2026; the code below downloads the same values straight from the source.
</div>

<div class="code-tabs">
  <div class="code-tab" data-lang="julia">
<div class="code-container">
  <div class="code-header">
    <div class="code-lang">Julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Downloads, JSON, Dates, Statistics, Plots

# Total vehicle production, Brazil (Central Bank SGS series 1373; source: Anfavea), in units
url = "https://api.bcb.gov.br/dados/serie/bcdata.sgs.1373/dados?formato=json&amp;dataInicial=01/01/2010&amp;dataFinal=31/12/2018"
data = JSON.parse(String(take!(Downloads.download(url, IOBuffer()))))
dates = [Date(d["data"], dateformat"dd/mm/yyyy") for d in data]
production = [parse(Float64, d["valor"]) for d in data] ./ 1000   # in thousands of vehicles
n = length(production)
println(n, " months, from ", first(dates), " to ", last(dates))

# Mean of each calendar month (subseries plot)
month_mean = [mean(production[month.(dates) .== m]) for m in 1:12]
println("Mean by month (thousand): ", round.(month_mean, digits = 1))

# Autocorrelation and the ±1.96/√n band
avg = mean(production)
acf(k) = sum((production[t] - avg) * (production[t+k] - avg) for t in 1:n-k) / sum((production .- avg) .^ 2)
r = [acf(k) for k in 1:24]
println("r1 = ", round(r[1], digits = 3), "   r12 = ", round(r[12], digits = 3), "   band = ±", round(1.96 / sqrt(n), digits = 3))

years = 2010:2018
p1 = plot(dates, production, label = "", title = "(a) Series", ylabel = "Thousand vehicles",
          xticks = (Date.(2010:2:2018, 1, 1), string.(2010:2:2018)))
p2 = plot(title = "(b) Seasonal plot", xticks = (1:12, ["J","F","M","A","M","J","J","A","S","O","N","D"]))
for (i, yr) in enumerate(years)
    plot!(p2, 1:12, production[year.(dates) .== yr], label = i in (1, 5, 9) ? string(yr) : "",
          color = cgrad(:viridis)[i / length(years)], legend = :bottom, legendcolumns = 3)
end
p3 = bar(1:12, month_mean, label = "", title = "(c) Mean of each month", xticks = (1:12, ["J","F","M","A","M","J","J","A","S","O","N","D"]))
p4 = bar(1:24, r, label = "", title = "(d) Autocorrelation", xlabel = "Lag (months)")
hline!(p4, [1.96, -1.96] ./ sqrt(n), ls = :dash, color = :black, label = "")
savefig(plot(p1, p2, p3, p4, layout = (2, 2), size = (900, 650), margin = 4Plots.mm), "vehicle_production_charts.png")</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">108 months, from 2010-01-01 to 2018-12-01
Mean by month (thousand): [218.7, 226.8, 276.7, 255.9, 263.6, 249.2, 262.1, 281.3, 251.6, 267.5, 260.0, 219.3]
r1 = 0.751   r12 = 0.546   band = ±0.189</pre>
</div>
  </div>
  <div class="code-tab" data-lang="r">
<div class="code-container">
  <div class="code-header">
    <div class="code-lang">R</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>library(jsonlite)

# Total vehicle production, Brazil (Central Bank SGS series 1373; source: Anfavea), in units
url &lt;- "https://api.bcb.gov.br/dados/serie/bcdata.sgs.1373/dados?formato=json&amp;dataInicial=01/01/2010&amp;dataFinal=31/12/2018"
data &lt;- fromJSON(url)
dates &lt;- as.Date(data$data, format = "%d/%m/%Y")
production &lt;- as.numeric(data$valor) / 1000          # in thousands of vehicles
n &lt;- length(production)
cat(n, "months, from", format(dates[1]), "to", format(dates[n]), "\n")

# Mean of each calendar month (subseries plot)
month &lt;- as.integer(format(dates, "%m"))
month_mean &lt;- tapply(production, month, mean)
cat("Mean by month (thousand):", round(month_mean, 1), "\n")

# Autocorrelation and the ±1.96/√n band
r &lt;- acf(production, lag.max = 24, plot = FALSE)$acf[-1]
cat("r1 =", round(r[1], 3), "  r12 =", round(r[12], 3), "  band = ±", round(1.96 / sqrt(n), 3), "\n")

png("vehicle_production_charts_r.png", width = 900, height = 650)
par(mfrow = c(2, 2))
plot(dates, production, type = "l", main = "(a) Series", xlab = "", ylab = "Thousand vehicles")
years &lt;- 2010:2018
colors &lt;- hcl.colors(length(years), "viridis")
matplot(1:12, sapply(years, function(a) production[format(dates, "%Y") == a]), type = "l", lty = 1,
        col = colors, main = "(b) Seasonal plot", xlab = "Month", ylab = "")
legend("bottom", legend = years[c(1, 5, 9)], col = colors[c(1, 5, 9)], lty = 1, horiz = TRUE, cex = 0.8)
barplot(month_mean, names.arg = c("J","F","M","A","M","J","J","A","S","O","N","D"), main = "(c) Mean of each month")
barplot(r, names.arg = 1:24, main = "(d) Autocorrelation", xlab = "Lag (months)")
abline(h = c(1.96, -1.96) / sqrt(n), lty = 2)
invisible(dev.off())</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">108 months, from 2010-01-01 to 2018-12-01 
Mean by month (thousand): 218.7 226.8 276.7 255.9 263.6 249.2 262.1 281.3 251.6 267.5 260 219.3 
r1 = 0.751   r12 = 0.546   band = ± 0.189</pre>
</div>
  </div>
  <div class="code-tab" data-lang="python">
<div class="code-container">
  <div class="code-header">
    <div class="code-lang">Python</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

# Total vehicle production, Brazil (Central Bank SGS series 1373; source: Anfavea), in units
url = ("https://api.bcb.gov.br/dados/serie/bcdata.sgs.1373/dados?formato=json"
       "&amp;dataInicial=01/01/2010&amp;dataFinal=31/12/2018")
data = pd.read_json(url, storage_options={"User-Agent": "Mozilla/5.0"})
dates = pd.to_datetime(data["data"], format="%d/%m/%Y")
production = data["valor"].astype(float).to_numpy() / 1000    # in thousands of vehicles
n = len(production)
print(n, "months, from", dates.iloc[0].date(), "to", dates.iloc[-1].date())

# Mean of each calendar month (subseries plot)
month_mean = pd.Series(production).groupby(dates.dt.month.to_numpy()).mean()
print("Mean by month (thousand):", np.round(month_mean.to_numpy(), 1))

# Autocorrelation and the ±1.96/√n band
d = production - production.mean()
r = np.array([np.sum(d[:-k] * d[k:]) / np.sum(d ** 2) for k in range(1, 25)])
print(f"r1 = {r[0]:.3f}   r12 = {r[11]:.3f}   band = ±{1.96 / np.sqrt(n):.3f}")

months = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"]
fig, ax = plt.subplots(2, 2, figsize=(9, 6.5))
ax[0, 0].plot(dates, production); ax[0, 0].set(title="(a) Series", ylabel="Thousand vehicles")
colors = plt.cm.viridis(np.linspace(0, 1, 9))
for i, year in enumerate(range(2010, 2019)):
    ax[0, 1].plot(range(1, 13), production[dates.dt.year == year], color=colors[i],
                  label=str(year) if i in (0, 4, 8) else None)
ax[0, 1].set(title="(b) Seasonal plot", xticks=range(1, 13), xticklabels=months); ax[0, 1].legend(ncol=3)
ax[1, 0].bar(range(1, 13), month_mean); ax[1, 0].set(title="(c) Mean of each month", xticks=range(1, 13), xticklabels=months)
ax[1, 1].bar(range(1, 25), r); ax[1, 1].axhline(1.96 / np.sqrt(n), ls="--", color="k"); ax[1, 1].axhline(-1.96 / np.sqrt(n), ls="--", color="k")
ax[1, 1].set(title="(d) Autocorrelation", xlabel="Lag (months)")
fig.tight_layout(); fig.savefig("vehicle_production_charts_py.png", dpi=100)</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">108 months, from 2010-01-01 to 2018-12-01
Mean by month (thousand): [218.7 226.8 276.7 255.9 263.6 249.2 262.1 281.3 251.6 267.5 260.  219.3]
r1 = 0.751   r12 = 0.546   band = ±0.189</pre>
</div>
  </div>
</div>

![Four panels of monthly vehicle production from 2010 to 2018: the series over time, the seasonal plot with one line per year, bars with the mean of each month and the correlogram with the dashed significance band]({{ site.baseurl }}/assets/images/vehicle_production_charts.png){:style="max-width: 900px; display: block; margin: 1em auto;"}
<div class="image-caption" style="text-align: center;">Figure 1. Monthly vehicle production in Brazil, 2010–2018 (SGS 1373; Anfavea). (a) Series; (b) seasonal plot; (c) mean of each month; (d) autocorrelation, with the dashed ±1.96/√n band. Produced by the code above, Julia version.</div>

**(a) Line plot.** Time on the horizontal axis and the value on the vertical one, with the points joined in order. It shows the trend and changes in level. Here, production swings around 270 to 330 thousand vehicles a month until 2013, falls to about 150 to 200 thousand in 2015 and 2016 and rises again from 2017: the "trend" is not a straight line.

**(b) Seasonal plot.** One line per year, with the months on the horizontal axis. If the lines have the same shape, there is seasonality; if they shift up or down, there is a trend. Here, almost every year has the same shape: a weak start of the year, a high March, a low December.

**(c) Subseries by month.** The mean of each calendar month (in the fuller version, you draw each month's series across the years). It shows the average seasonal pattern. In vehicle production, the means go from 218.7 thousand (January) and 219.3 thousand (December) up to 276.7 thousand (March) and 281.3 thousand (August).

**(d) Correlogram (ACF).** The autocorrelations $r\_k$ (section 4) for $k = 1, 2, \ldots, 24$. The dashed lines at $\pm 1.96/\sqrt{n}$ mark, approximately, how far an autocorrelation could go by chance alone if the series were pure noise (with $n = 108$, $\pm 0.189$). Here, $r\_1 = 0.751$: one month is very similar to the previous one. The bars decay slowly, which points to a trend, and rise again near $k = 12$ ($r\_{12} = 0.546$), which points to yearly seasonality.

Other useful plots: the **lag plot** ($y\_t$ against $y\_{t-k}$, one point per month, which shows autocorrelation as a cloud of points), the **decomposition panels** (series, trend, seasonality and remainder stacked) and the **residual plot** of a fitted model, which should show no pattern.

---

## 3. Moving Average

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

## 4. Autocorrelation

The **autocorrelation at lag** $k$ measures the correlation between the series and itself shifted by $k$ periods:

$$
r_k = \frac{\sum_{t=1}^{n-k} (y_t - \bar{y})(y_{t+k} - \bar{y})}{\sum_{t=1}^{n} (y_t - \bar{y})^2}
$$

where $\bar{y}$ is the mean of all $n$ values. It lies between −1 and 1, like an ordinary correlation. A high positive $r\_k$ says that values $k$ periods apart are similar. In a quarterly series with seasonality, $r\_4$ (one year apart) is usually high. The plot of $r\_k$ against $k$ is called a **correlogram** or **ACF**.

**Significance band.** If the series were pure noise (independent values), each $r\_k$ would fall between $-1.96/\sqrt{n}$ and $1.96/\sqrt{n}$ about 95% of the time. Bars outside that band suggest real dependence. It is an approximation for large $n$, and with many lags some bars fall outside the band by chance alone (one in twenty, on average).

**Partial autocorrelation (PACF).** The autocorrelation $r\_2$ mixes the direct effect of $y\_{t-2}$ on $y\_t$ with the indirect effect that goes through $y\_{t-1}$. The **partial autocorrelation** at lag $k$ measures only the direct part: it is the coefficient of $y\_{t-k}$ in a regression of $y\_t$ on $y\_{t-1}, \ldots, y\_{t-k}$. It helps choose the order of an AR model (section 7): in an AR($p$), the PACF is practically zero after lag $p$. The ready-made functions (`pacf` in R, `pacf` in statsmodels, `pacf` in StatsBase.jl) use different estimation methods and may give slightly different values.

---

## 5. Worked Example: Decomposition and Forecast

**Situation** (illustrative numbers): a store's quarterly sales, in R\\$ thousand, over 3 years.

| | Q1 | Q2 | Q3 | Q4 |
|---|---|---|---|---|
| **Year 1** ($t$ = 1 to 4) | 40 | 52 | 46 | 70 |
| **Year 2** ($t$ = 5 to 8) | 44 | 56 | 50 | 76 |
| **Year 3** ($t$ = 9 to 12) | 48 | 61 | 54 | 81 |

Looking at the table: every year Q4 is the highest and Q1 the lowest (a pattern that **repeats** three times: seasonality), and each quarter sells more than the same quarter the year before (an upward trend). The height of the Q4 peak relative to the other quarters changes little from year to year, so we will use the **additive model**.

**Goal:** separate trend and seasonality and forecast sales for year 4.

### 5.1 Data

- $y\_t$: sales in quarter $t$, in R\\$ thousand, $t = 1, \ldots, 12$ (from the table);
- seasonal period: $m = 4$ quarters;
- $n = 12$ observations.

### 5.2 Step 1: trend from the 2×4 moving average

Formula (section 3): $MA\_t = \big(\tfrac{1}{2}y\_{t-2} + y\_{t-1} + y\_t + y\_{t+1} + \tfrac{1}{2}y\_{t+2}\big) / 4$. It only exists from $t = 3$ to $t = 10$.

For $t = 3$, substituting:

$$
MA_3 = \frac{\tfrac{1}{2} \times 40 + 52 + 46 + 70 + \tfrac{1}{2} \times 44}{4} = \frac{20 + 52 + 46 + 70 + 22}{4} = \frac{210}{4} = 52.5
$$

The others, in the same way:

| $t$ | Numerator arithmetic | Numerator | $MA\_t$ |
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

### 5.3 Step 2: deviations from the trend

For each $t$ with a moving average, the deviation $y\_t - MA\_t$ shows how far that quarter was above or below the trend:

| $t$ | Quarter | $y\_t$ | $MA\_t$ | $y\_t - MA\_t$ |
|---|---|---|---|---|
| 3 | Q3 | 46 | 52.5 | −6.5 |
| 4 | Q4 | 70 | 53.5 | 16.5 |
| 5 | Q1 | 44 | 54.5 | −10.5 |
| 6 | Q2 | 56 | 55.75 | 0.25 |
| 7 | Q3 | 50 | 57 | −7 |
| 8 | Q4 | 76 | 58.125 | 17.875 |
| 9 | Q1 | 48 | 59.25 | −11.25 |
| 10 | Q2 | 61 | 60.375 | 0.625 |

### 5.4 Step 3: seasonal effect of each quarter

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

The sum is already zero, so the adjusted effects are the same: $S\_1 = -10.875$, $S\_2 = 0.4375$, $S\_3 = -6.75$, $S\_4 = 17.1875$.

**Interpretation:** once the trend is removed, the 4th quarter sells about R\\$ 17.2 thousand above the year's level, and the 1st about R\\$ 10.9 thousand below; the 2nd is practically at the level.

### 5.5 Step 4: seasonally adjusted series

Removing from each value the effect of its quarter, $d\_t = y\_t - S\_{\text{quarter}(t)}$, leaves trend + noise:

| $t$ | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| $y\_t$ | 40 | 52 | 46 | 70 | 44 | 56 | 50 | 76 | 48 | 61 | 54 | 81 |
| $S$ | −10.875 | 0.4375 | −6.75 | 17.1875 | −10.875 | 0.4375 | −6.75 | 17.1875 | −10.875 | 0.4375 | −6.75 | 17.1875 |
| $d\_t$ | 50.875 | 51.5625 | 52.75 | 52.8125 | 54.875 | 55.5625 | 56.75 | 58.8125 | 58.875 | 60.5625 | 60.75 | 63.8125 |

For example, $d\_1 = 40 - (-10.875) = 40 + 10.875 = 50.875$.

### 5.6 Step 5: trend line

We fit a line $\hat{d}\_t = a + b\,t$ to the seasonally adjusted series by [least squares]({{ '/en/data-analysis/linear-regression' | relative_url }}): $b = S\_{td}/S\_{tt}$ and $a = \bar{d} - b\,\bar{t}$.

- $\bar{t} = (1 + 2 + \cdots + 12)/12 = 78/12 = 6.5$;
- $\bar{d} = (50.875 + 51.5625 + \cdots + 63.8125)/12 = 678/12 = 56.5$.

| $t$ | $t - \bar{t}$ | $d\_t - \bar{d}$ | $(t - \bar{t})(d\_t - \bar{d})$ | $(t - \bar{t})^2$ |
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
| **Sum** | | | $S\_{td} = 161.5$ | $S\_{tt} = 143$ |

$$
b = \frac{S_{td}}{S_{tt}} = \frac{161.5}{143} = 1.129370\ldots \approx 1.1294 \text{ (R\$ thousand per quarter)}
$$

$$
a = \bar{d} - b\,\bar{t} = 56.5 - 1.129370\ldots \times 6.5 = 56.5 - 7.340909\ldots = 49.159090\ldots \approx 49.1591
$$

**Interpretation:** once seasonality is removed, sales grow on average by about R\\$ 1.13 thousand per quarter, that is, about R\\$ 4.5 thousand per year.

### 5.7 Step 6: forecast for year 4

Forecast = trend in the quarter + seasonal effect of the quarter: $\hat{y}\_t = a + b\,t + S\_{\text{quarter}(t)}$, with the full $a$ and $b$.

| $t$ | Quarter | Trend $a + b\,t$ | Effect $S$ | Forecast $\hat{y}\_t$ (R\\$ thousand) |
|---|---|---|---|---|
| 13 | Q1 | $49.159091 + 1.129371 \times 13 = 63.840909$ | −10.875 | 52.97 |
| 14 | Q2 | $49.159091 + 1.129371 \times 14 = 64.970280$ | 0.4375 | 65.41 |
| 15 | Q3 | $49.159091 + 1.129371 \times 15 = 66.099650$ | −6.75 | 59.35 |
| 16 | Q4 | $49.159091 + 1.129371 \times 16 = 67.229021$ | 17.1875 | 84.42 |

**Interpretation and limits.** If the trend and seasonal pattern of the last 3 years continue, year 4 should have sales of about R\\$ 53, 65, 59 and 84 thousand in the four quarters. This is an **extrapolation**: it assumes nothing changes (the economy, competitors, the store itself). The further into the future, the less reliable it is. And these forecasts come without a margin of error; the methods in sections 6 and 7 give prediction intervals (section 8.3).

### 5.8 Check with autocorrelation

With $\bar{y} = 678/12 = 56.5$ and $\sum (y\_t - \bar{y})^2 = 1863$, the autocorrelations (computed by the code below) are:

| Lag $k$ | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| $r\_k$ | −0.313 | 0.313 | −0.416 | **0.611** | −0.266 | 0.101 |

The largest is $r\_4 = 0.611$: values **one year** apart are similar, which confirms the period-4 seasonality seen in the table. With only 12 observations, these values are imprecise; they are an indication, not proof.

<div class="code-tabs">
  <div class="code-tab" data-lang="julia">
<div class="code-container">
  <div class="code-header">
    <div class="code-lang">Julia</div>
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
avg = mean(sales)
acf(k) = sum((sales[t] - avg) * (sales[t+k] - avg) for t in 1:n-k) / sum((sales .- avg) .^ 2)
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
  </div>
  <div class="code-tab" data-lang="r">
<div class="code-container">
  <div class="code-header">
    <div class="code-lang">R</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code># Quarterly sales (R$ thousand) of a store over 3 years (illustrative numbers)
sales &lt;- c(40, 52, 46, 70, 44, 56, 50, 76, 48, 61, 54, 81)
n &lt;- length(sales)
quarter &lt;- function(t) (t - 1) %% 4 + 1   # 1, 2, 3, 4, 1, 2, ...

# 1. Trend: centered 2×4 moving average (only exists from t = 3 to t = n − 2)
ma &lt;- sapply(3:(n - 2), function(t)
  (sales[t - 2] / 2 + sales[t - 1] + sales[t] + sales[t + 1] + sales[t + 2] / 2) / 4)

# 2. Seasonal effect: mean of (value − moving average) in each quarter, adjusted to sum to zero
deviations &lt;- sales[3:(n - 2)] - ma
raw &lt;- tapply(deviations, quarter(3:(n - 2)), mean)
effect &lt;- raw - mean(raw)

# 3. Seasonally adjusted series and a linear trend (least squares) fitted to it
adjusted &lt;- sales - effect[quarter(1:n)]
time &lt;- 1:n
fit &lt;- lm(adjusted ~ time)
a &lt;- coef(fit)[[1]]; b &lt;- coef(fit)[[2]]

# 4. Forecast for year 4: trend + seasonal effect
future &lt;- 13:16
forecast &lt;- a + b * future + effect[quarter(future)]

cat("Moving averages (t = 3 to 10):", ma, "\n")
cat("Seasonal effects (Q1 to Q4):", effect, "\n")
cat("Trend: a =", round(a, 4), "  b =", round(b, 4), "per quarter\n")
cat("Year 4 forecast:", round(forecast, 2), "\n")

# Sample autocorrelation at lags 1 to 6 (acf uses the same formula as the page)
r &lt;- acf(sales, lag.max = 6, plot = FALSE)$acf[-1]
cat("Autocorrelation r1 to r6:", round(r, 3), "\n")

png("time_series_decomposition_r.png", width = 800, height = 420)
plot(1:n, sales, type = "o", pch = 19, xlim = c(1, 16), ylim = c(38, 86), xaxt = "n",
     xlab = "Quarter (t)", ylab = "Sales (R$ thousand)", main = "Decomposition and forecast")
axis(1, at = 1:16)
lines(3:(n - 2), ma, lwd = 2, col = "darkorange")
abline(a = a, b = b, lty = 2, col = "gray40")
lines(future, forecast, type = "o", pch = 18, lty = 3, col = "#DC143C")
legend("topleft", c("Sales", "2×4 moving average (trend)", "Linear trend", "Forecast (year 4)"),
       col = c("black", "darkorange", "gray40", "#DC143C"), lty = c(1, 1, 2, 3), pch = c(19, NA, NA, 18))
invisible(dev.off())</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">Moving averages (t = 3 to 10): 52.5 53.5 54.5 55.75 57 58.125 59.25 60.375 
Seasonal effects (Q1 to Q4): -10.875 0.4375 -6.75 17.1875 
Trend: a = 49.1591   b = 1.1294 per quarter
Year 4 forecast: 52.97 65.41 59.35 84.42 
Autocorrelation r1 to r6: -0.313 0.313 -0.416 0.611 -0.266 0.101</pre>
</div>
  </div>
  <div class="code-tab" data-lang="python">
<div class="code-container">
  <div class="code-header">
    <div class="code-lang">Python</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>import numpy as np
import matplotlib.pyplot as plt

# Quarterly sales (R$ thousand) of a store over 3 years (illustrative numbers)
sales = np.array([40, 52, 46, 70, 44, 56, 50, 76, 48, 61, 54, 81], dtype=float)
n = len(sales)
quarter = lambda t: (t - 1) % 4 + 1        # 1, 2, 3, 4, 1, 2, ... (t starts at 1)

# 1. Trend: centered 2×4 moving average (only exists from t = 3 to t = n − 2)
weights = np.array([1/8, 1/4, 1/4, 1/4, 1/8])
ma = np.convolve(sales, weights, mode="valid")   # positions t = 3, ..., n − 2

# 2. Seasonal effect: mean of (value − moving average) in each quarter, adjusted to sum to zero
t_ma = np.arange(3, n - 1)
deviations = sales[2:n - 2] - ma
raw = np.array([deviations[quarter(t_ma) == q].mean() for q in range(1, 5)])
effect = raw - raw.mean()

# 3. Seasonally adjusted series and a linear trend (least squares) fitted to it
time = np.arange(1, n + 1)
adjusted = sales - effect[quarter(time) - 1]
b, a = np.polyfit(time, adjusted, 1)

# 4. Forecast for year 4: trend + seasonal effect
future = np.arange(13, 17)
forecast = a + b * future + effect[quarter(future) - 1]

print("Moving averages (t = 3 to 10):", ma)
print("Seasonal effects (Q1 to Q4):", effect)
print(f"Trend: a = {a:.4f}   b = {b:.4f} per quarter")
print("Year 4 forecast:", np.round(forecast, 2))

# Sample autocorrelation at lags 1 to 6
d = sales - sales.mean()
r = [np.sum(d[:-k] * d[k:]) / np.sum(d ** 2) for k in range(1, 7)]
print("Autocorrelation r1 to r6:", np.round(r, 3))

fig, ax = plt.subplots(figsize=(8, 4.2))
ax.plot(time, sales, "o-", label="Sales")
ax.plot(t_ma, ma, lw=2, label="2×4 moving average (trend)")
ax.plot(np.arange(1, 17), a + b * np.arange(1, 17), "--", color="gray", label="Linear trend")
ax.plot(future, forecast, "D:", color="crimson", label="Forecast (year 4)")
ax.set(xlabel="Quarter (t)", ylabel="Sales (R$ thousand)", title="Decomposition and forecast", xticks=range(1, 17))
ax.legend(loc="upper left")
fig.savefig("time_series_decomposition_py.png", dpi=100, bbox_inches="tight")</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">Moving averages (t = 3 to 10): [52.5   53.5   54.5   55.75  57.    58.125 59.25  60.375]
Seasonal effects (Q1 to Q4): [-10.875    0.4375  -6.75    17.1875]
Trend: a = 49.1591   b = 1.1294 per quarter
Year 4 forecast: [52.97 65.41 59.35 84.42]
Autocorrelation r1 to r6: [-0.313  0.313 -0.416  0.611 -0.266  0.101]</pre>
</div>
  </div>
</div>

![Chart of quarterly sales from t = 1 to 12, with the 2×4 moving average rising steadily, the dashed trend line and the four year-4 forecasts in red]({{ site.baseurl }}/assets/images/time_series_decomposition_en.png){:style="max-width: 800px; display: block; margin: 1em auto;"}
<div class="image-caption" style="text-align: center;">Figure 2. Quarterly sales, 2×4 moving average (trend), trend line and year-4 forecast. Produced by the code above, Julia version.</div>

---

## 6. Exponential Smoothing

The moving average gives the same weight to every value in the window. **Exponential smoothing** uses **all** of the past, with weights that shrink for older values.

### 6.1 Simple exponential smoothing

For series with no trend and no seasonality, the forecast is a **level** $\ell\_t$ updated with each new value:

$$
\ell_t = \alpha\,y_t + (1 - \alpha)\,\ell_{t-1} \qquad\qquad \hat{y}_{t+h} = \ell_t \text{ for every } h
$$

- $\alpha$, between 0 and 1, is the **smoothing constant**: close to 1, the level follows the latest value; close to 0, it changes slowly;
- substituting the formula into itself, $\ell\_t = \alpha y\_t + \alpha(1-\alpha) y\_{t-1} + \alpha(1-\alpha)^2 y\_{t-2} + \cdots$: the weights decay geometrically, hence the name "exponential";
- a starting value $\ell\_1$ is needed; here we use the first value of the series.

**Example** (illustrative numbers): calls handled per week at a call center, $y = 30, 34, 31, 35, 33, 38, 36, 37$, with $\alpha = 0.3$ and $\ell\_1 = 30$. Each week, the forecast is the previous level, the error is the actual value minus the forecast, and the level is updated:

| Week $t$ | $y\_t$ | Forecast $\ell\_{t-1}$ | Error $y\_t - \ell\_{t-1}$ | New level $\ell\_t = 0.3\,y\_t + 0.7\,\ell\_{t-1}$ |
|---|---|---|---|---|
| 2 | 34 | 30 | 4 | $10.2 + 21 = 31.2$ |
| 3 | 31 | 31.2 | −0.2 | $9.3 + 21.84 = 31.14$ |
| 4 | 35 | 31.14 | 3.86 | $10.5 + 21.798 = 32.298$ |
| 5 | 33 | 32.298 | 0.702 | $9.9 + 22.6086 = 32.5086$ |
| 6 | 38 | 32.5086 | 5.4914 | $11.4 + 22.75602 = 34.15602$ |
| 7 | 36 | 34.15602 | 1.84398 | $10.8 + 23.909214 = 34.709214$ |
| 8 | 37 | 34.709214 | 2.290786 | $11.1 + 24.2964498 = 35.3964498$ |

The forecast for week 9 (and the following ones) is $\ell\_8 \approx 35.40$ calls. Notice that all errors but one are positive: the series has a slight upward trend that simple smoothing does not follow. That is what Holt's method is for.

### 6.2 Holt-Winters: level, trend and seasonality

**Holt's** method adds a trend $b\_t$; **Holt-Winters** also adds the seasonal effects $s\_t$, with period $m$. In the **additive** version (Hyndman and Athanasopoulos, 2021, section 8.3):

$$
\ell_t = \alpha\,(y_t - s_{t-m}) + (1 - \alpha)(\ell_{t-1} + b_{t-1})
$$

$$
b_t = \beta\,(\ell_t - \ell_{t-1}) + (1 - \beta)\,b_{t-1}
$$

$$
s_t = \gamma\,(y_t - \ell_{t-1} - b_{t-1}) + (1 - \gamma)\,s_{t-m}
$$

$$
\hat{y}_{t+h} = \ell_t + h\,b_t + s_{t+h-m} \quad (h \leq m)
$$

Each equation is a weighted average between "what the new data say" and "what was known before". The three constants $\alpha$, $\beta$, $\gamma$ lie between 0 and 1 and are usually chosen to minimize the sum of squared one-step-ahead forecast errors.

**Starting values** (there are several choices; this is the classical one): the level is the mean of the first year, the trend is the difference between the means of the second and first years divided by $m$, and the seasonal effects are the first-year values minus the level.

**Example: one step by hand**, on the quarterly sales from section 5, with $m = 4$, $\alpha = 0.5$, $\beta = 0.3$, $\gamma = 0.3$ (values fixed to keep the arithmetic simple).

Start:

$$
\ell_4 = \frac{40 + 52 + 46 + 70}{4} = \frac{208}{4} = 52 \qquad b_4 = \frac{56.5 - 52}{4} = \frac{4.5}{4} = 1.125
$$

$$
s_1 = 40 - 52 = -12 \qquad s_2 = 52 - 52 = 0 \qquad s_3 = 46 - 52 = -6 \qquad s_4 = 70 - 52 = 18
$$

(56.5 is the mean of year 2: $(44 + 56 + 50 + 76)/4 = 226/4$.)

Quarter $t = 5$ (Q1 of year 2, $y\_5 = 44$). The forecast made before seeing the data was $\ell\_4 + b\_4 + s\_1 = 52 + 1.125 - 12 = 41.125$. Update:

$$
\ell_5 = 0.5 \times (44 - (-12)) + 0.5 \times (52 + 1.125) = 0.5 \times 56 + 0.5 \times 53.125 = 28 + 26.5625 = 54.5625
$$

$$
b_5 = 0.3 \times (54.5625 - 52) + 0.7 \times 1.125 = 0.3 \times 2.5625 + 0.7875 = 0.76875 + 0.7875 = 1.55625
$$

$$
s_5 = 0.3 \times (44 - 52 - 1.125) + 0.7 \times (-12) = 0.3 \times (-9.125) - 8.4 = -2.7375 - 8.4 = -11.1375
$$

The data came in 2.875 above the forecast; so the level went up, the trend increased and the Q1 effect became slightly less negative. The code repeats this step up to $t = 12$ and forecasts year 4: 52.70, 65.22, 59.31 and 85.63 (R\\$ thousand), close to the decomposition forecasts (52.97, 65.41, 59.35, 84.42).

**Prediction interval for simple smoothing.** Assuming independent normal errors with standard deviation $\sigma$, the 95% interval $h$ steps ahead is (Hyndman and Athanasopoulos, 2021, section 8.7):

$$
\hat{y}_{t+h} \pm 1.96\,\sigma\sqrt{1 + (h - 1)\,\alpha^2}
$$

In the calls example, estimating $\sigma$ by the square root of the mean of the 7 squared errors, $\sigma = \sqrt{70.2358/7} = \sqrt{10.0337} \approx 3.168$. For week 9 ($h = 1$): $35.40 \pm 1.96 \times 3.168 = 35.40 \pm 6.21$, that is, from 29.19 to 41.60 calls. For week 10 ($h = 2$): $35.40 \pm 1.96 \times 3.168 \times \sqrt{1.09} = 35.40 \pm 6.48$. We checked this formula by simulation (200,000 series generated by the model).

<div class="code-tabs">
  <div class="code-tab" data-lang="julia">
<div class="code-container">
  <div class="code-header">
    <div class="code-lang">Julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Statistics

# 1. Simple exponential smoothing: calls per week (illustrative numbers)
calls = [30, 34, 31, 35, 33, 38, 36, 37]
α = 0.3
level = Float64(calls[1])                 # start: the first value
errors = Float64[]                            # one-step-ahead forecast errors
for t in 2:length(calls)
    push!(errors, calls[t] - level)
    global level = α * calls[t] + (1 - α) * level
end
σ = sqrt(mean(errors .^ 2))
println("SES: forecast for week 9 = ", round(level, digits = 4), "   σ = ", round(σ, digits = 4))
println("95% interval (h = 1): [", round(level - 1.96σ, digits = 2), "; ", round(level + 1.96σ, digits = 2), "]")

# 2. Additive Holt-Winters (m = 4) on the quarterly sales, with fixed α, β, γ
sales = [40, 52, 46, 70, 44, 56, 50, 76, 48, 61, 54, 81]
m = 4
α, β, γ = 0.5, 0.3, 0.3
# Classical start: level = mean of year 1; trend = (mean of year 2 − mean of year 1)/m;
# seasonality = year-1 values minus the level
level = mean(sales[1:m])
trend = (mean(sales[m+1:2m]) - mean(sales[1:m])) / m
seasonal = sales[1:m] .- level
for t in m+1:length(sales)
    s = seasonal[t-m]
    new_level = α * (sales[t] - s) + (1 - α) * (level + trend)
    new_trend = β * (new_level - level) + (1 - β) * trend
    push!(seasonal, γ * (sales[t] - level - trend) + (1 - γ) * s)
    global level, trend = new_level, new_trend
    t == m + 1 &amp;&amp; println("After t = 5: level = ", level, "  trend = ", trend, "  seasonal Q1 = ", seasonal[end])
end
forecast = [level + h * trend + seasonal[end-m+mod1(h, m)] for h in 1:4]
println("Holt-Winters: year 4 forecast = ", round.(forecast, digits = 2))</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">SES: forecast for week 9 = 35.3964   σ = 3.1676
95% interval (h = 1): [29.19; 41.6]
After t = 5: level = 54.5625  trend = 1.55625  seasonal Q1 = -11.1375
Holt-Winters: year 4 forecast = [52.7, 65.22, 59.31, 85.63]</pre>
</div>
  </div>
  <div class="code-tab" data-lang="r">
<div class="code-container">
  <div class="code-header">
    <div class="code-lang">R</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code># 1. Simple exponential smoothing: calls per week (illustrative numbers)
calls &lt;- c(30, 34, 31, 35, 33, 38, 36, 37)
alfa &lt;- 0.3
level &lt;- calls[1]                          # start: the first value
errors &lt;- numeric(0)                           # one-step-ahead forecast errors
for (t in 2:length(calls)) {
  errors &lt;- c(errors, calls[t] - level)
  level &lt;- alfa * calls[t] + (1 - alfa) * level
}
sigma &lt;- sqrt(mean(errors^2))
cat("SES: forecast for week 9 =", round(level, 4), "  σ =", round(sigma, 4), "\n")
cat(sprintf("95%% interval (h = 1): [%.2f; %.2f]\n", level - 1.96 * sigma, level + 1.96 * sigma))

# 2. Additive Holt-Winters (m = 4) on the quarterly sales, with fixed α, β, γ
sales &lt;- c(40, 52, 46, 70, 44, 56, 50, 76, 48, 61, 54, 81)
m &lt;- 4
alfa &lt;- 0.5; beta &lt;- 0.3; gama &lt;- 0.3
# Classical start: level = mean of year 1; trend = (mean of year 2 − mean of year 1)/m;
# seasonality = year-1 values minus the level
level &lt;- mean(sales[1:m])
trend &lt;- (mean(sales[(m + 1):(2 * m)]) - mean(sales[1:m])) / m
seasonal &lt;- sales[1:m] - level
for (t in (m + 1):length(sales)) {
  s &lt;- seasonal[t - m]
  new_level &lt;- alfa * (sales[t] - s) + (1 - alfa) * (level + trend)
  new_trend &lt;- beta * (new_level - level) + (1 - beta) * trend
  seasonal[t] &lt;- gama * (sales[t] - level - trend) + (1 - gama) * s
  level &lt;- new_level; trend &lt;- new_trend
  if (t == m + 1) cat("After t = 5: level =", level, " trend =", trend, " seasonal Q1 =", seasonal[t], "\n")
}
h &lt;- 1:4
forecast &lt;- level + h * trend + seasonal[length(seasonal) - m + ((h - 1) %% m) + 1]
cat("Holt-Winters: year 4 forecast =", round(forecast, 2), "\n")</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">SES: forecast for week 9 = 35.3964   σ = 3.1676 
95% interval (h = 1): [29.19; 41.60]
After t = 5: level = 54.5625  trend = 1.55625  seasonal Q1 = -11.1375 
Holt-Winters: year 4 forecast = 52.7 65.22 59.31 85.63</pre>
</div>
  </div>
  <div class="code-tab" data-lang="python">
<div class="code-container">
  <div class="code-header">
    <div class="code-lang">Python</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>import numpy as np

# 1. Simple exponential smoothing: calls per week (illustrative numbers)
calls = [30, 34, 31, 35, 33, 38, 36, 37]
alfa = 0.3
level = calls[0]                           # start: the first value
errors = []                                    # one-step-ahead forecast errors
for y in calls[1:]:
    errors.append(y - level)
    level = alfa * y + (1 - alfa) * level
sigma = np.sqrt(np.mean(np.square(errors)))
print(f"SES: forecast for week 9 = {level:.4f}   σ = {sigma:.4f}")
print(f"95% interval (h = 1): [{level - 1.96 * sigma:.2f}; {level + 1.96 * sigma:.2f}]")

# 2. Additive Holt-Winters (m = 4) on the quarterly sales, with fixed α, β, γ
sales = np.array([40, 52, 46, 70, 44, 56, 50, 76, 48, 61, 54, 81], dtype=float)
m = 4
alfa, beta, gama = 0.5, 0.3, 0.3
# Classical start: level = mean of year 1; trend = (mean of year 2 − mean of year 1)/m;
# seasonality = year-1 values minus the level
level = sales[:m].mean()
trend = (sales[m:2 * m].mean() - sales[:m].mean()) / m
seasonal = list(sales[:m] - level)
for t in range(m, len(sales)):              # index 0: t = 1
    s = seasonal[t - m]
    new_level = alfa * (sales[t] - s) + (1 - alfa) * (level + trend)
    new_trend = beta * (new_level - level) + (1 - beta) * trend
    seasonal.append(gama * (sales[t] - level - trend) + (1 - gama) * s)
    level, trend = new_level, new_trend
    if t == m:
        print(f"After t = 5: level = {level}  trend = {trend}  seasonal Q1 = {seasonal[-1]}")
forecast = [level + h * trend + seasonal[len(seasonal) - m + (h - 1) % m] for h in range(1, 5)]
print("Holt-Winters: year 4 forecast =", np.round(forecast, 2))</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">SES: forecast for week 9 = 35.3964   σ = 3.1676
95% interval (h = 1): [29.19; 41.60]
After t = 5: level = 54.5625  trend = 1.55625  seasonal Q1 = -11.1375
Holt-Winters: year 4 forecast = [52.7  65.22 59.31 85.63]</pre>
</div>
  </div>
</div>

Ready-made functions do the same with other details: `HoltWinters()` in R (`stats` package) and `ExponentialSmoothing` in Python's statsmodels. They use other starting values and other optimizers to choose $\alpha$, $\beta$, $\gamma$, so their numbers come out slightly different from those on this page; that is why the code above writes the equations by hand, the same in all three languages.

---

## 7. Stationarity, Differencing and ARIMA Models

### 7.1 Stationarity

A series is (weakly) **stationary** when its mean and variance do not change over time and the correlation between $y\_t$ and $y\_{t+k}$ depends only on the distance $k$. Series with trend or seasonality are **not** stationary. ARIMA models describe stationary series; so the first step is to make the series stationary.

### 7.2 Differencing

The **first difference** $\Delta y\_t = y\_t - y\_{t-1}$ removes a trend; the **seasonal difference** $y\_t - y\_{t-m}$ removes seasonality with period $m$. For the quarterly sales from section 5:

| $t$ | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| $y\_t$ | 40 | 52 | 46 | 70 | 44 | 56 | 50 | 76 | 48 | 61 | 54 | 81 |
| $y\_t - y\_{t-1}$ | | 12 | −6 | 24 | −26 | 12 | −6 | 26 | −28 | 13 | −7 | 27 |
| $z\_t = y\_t - y\_{t-4}$ | | | | | 4 | 4 | 4 | 6 | 4 | 5 | 4 | 5 |

The first difference still swings a lot (the seasonality is still there); the seasonal difference $z\_t$ is stable, between 4 and 6: it is the growth of each quarter over the same quarter of the previous year. For example, $z\_5 = 44 - 40 = 4$ and $z\_8 = 76 - 70 = 6$.

### 7.3 Unit root test (ADF)

The **augmented Dickey-Fuller test** (ADF) helps decide whether the series needs differencing. It fits, by least squares, the regression

$$
\Delta y_t = a + \rho\,y_{t-1} + \delta_1 \Delta y_{t-1} + \cdots + \delta_k \Delta y_{t-k} + \varepsilon_t
$$

and tests $H\_0: \rho = 0$ (the series has a "unit root", that is, it needs differencing) against $H\_1: \rho < 0$ (it is stationary). The statistic is $\hat{\rho}/SE(\hat{\rho})$, but under $H\_0$ it does **not** follow Student's t distribution: the critical values are specific to the test (for $n \approx 100$, with a constant, about −3.50 at 1%, −2.89 at 5% and −2.58 at 10%). $H\_0$ is rejected when the statistic falls **below** the critical value. The $k$ lags of $\Delta y$ absorb the autocorrelation in the errors.

For vehicle production (2010–2018):

<div class="code-tabs">
  <div class="code-tab" data-lang="julia">
<div class="code-container">
  <div class="code-header">
    <div class="code-lang">Julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Downloads, JSON, HypothesisTests

url = "https://api.bcb.gov.br/dados/serie/bcdata.sgs.1373/dados?formato=json&amp;dataInicial=01/01/2010&amp;dataFinal=31/12/2018"
data = JSON.parse(String(take!(Downloads.download(url, IOBuffer()))))
production = [parse(Float64, d["valor"]) for d in data] ./ 1000   # thousand vehicles, 2010–2018
z = production[13:end] .- production[1:end-12]                       # seasonal difference

# ADF test by hand: Δy_t = a + ρ y_{t−1} + Σ δ_i Δy_{t−i} + error; the statistic is ρ̂ / SE(ρ̂)
function adf(y, k)
    dy = diff(y)
    rows = k+1:length(dy)
    X = hcat(ones(length(rows)), y[rows], [dy[t-i] for t in rows, i in 1:k])
    coef = X \ dy[rows]
    res = dy[rows] .- X * coef
    s2 = sum(res .^ 2) / (length(rows) - size(X, 2))
    return coef[2] / sqrt(s2 * inv(X' * X)[2, 2])
end

for (name, series) in [("level", production), ("seasonal difference", z)], k in (0, 12)
    test = ADFTest(series, :constant, k)          # check against HypothesisTests.jl
    println(rpad("ADF ($name, k = $k):", 36), round(adf(series, k), digits = 3),
            "   HypothesisTests: ", round(test.stat, digits = 3), "   p-value = ", round(pvalue(test), digits = 4))
end</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">ADF (level, k = 0):                 -3.623   HypothesisTests: -3.623   p-value = 0.0053
ADF (level, k = 12):                -1.129   HypothesisTests: -1.129   p-value = 0.7034
ADF (seasonal difference, k = 0):   -4.338   HypothesisTests: -4.338   p-value = 0.0004
ADF (seasonal difference, k = 12):  -2.264   HypothesisTests: -2.264   p-value = 0.1839</pre>
</div>
  </div>
  <div class="code-tab" data-lang="r">
<div class="code-container">
  <div class="code-header">
    <div class="code-lang">R</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>library(jsonlite)

url &lt;- "https://api.bcb.gov.br/dados/serie/bcdata.sgs.1373/dados?formato=json&amp;dataInicial=01/01/2010&amp;dataFinal=31/12/2018"
production &lt;- as.numeric(fromJSON(url)$valor) / 1000   # thousand vehicles, 2010–2018
z &lt;- diff(production, lag = 12)                         # seasonal difference

# ADF test by hand: Δy_t = a + ρ y_{t−1} + Σ δ_i Δy_{t−i} + error; the statistic is ρ̂ / SE(ρ̂).
# (tseries::adf.test adds a linear trend to the regression and picks k by itself,
# so it gives a different number; here the regression is the same as in the Julia and Python versions.)
adf &lt;- function(y, k) {
  dy &lt;- diff(y)
  rows &lt;- (k + 1):length(dy)
  if (k &gt; 0) {
    lags &lt;- sapply(seq_len(k), function(i) dy[rows - i])
    fit &lt;- lm(dy[rows] ~ y[rows] + lags)
  } else {
    fit &lt;- lm(dy[rows] ~ y[rows])
  }
  summary(fit)$coefficients[2, "t value"]
}

for (series in list(list("level", production), list("seasonal difference", z))) {
  for (k in c(0, 12)) {
    cat(format(sprintf("ADF (%s, k = %d):", series[[1]], k), width = 36), round(adf(series[[2]], k), 3), "\n")
  }
}</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">ADF (level, k = 0):                  -3.623 
ADF (level, k = 12):                 -1.129 
ADF (seasonal difference, k = 0):    -4.338 
ADF (seasonal difference, k = 12):   -2.264</pre>
</div>
  </div>
  <div class="code-tab" data-lang="python">
<div class="code-container">
  <div class="code-header">
    <div class="code-lang">Python</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>import numpy as np
import pandas as pd
from statsmodels.tsa.stattools import adfuller

url = ("https://api.bcb.gov.br/dados/serie/bcdata.sgs.1373/dados?formato=json"
       "&amp;dataInicial=01/01/2010&amp;dataFinal=31/12/2018")
data = pd.read_json(url, storage_options={"User-Agent": "Mozilla/5.0"})
production = data["valor"].astype(float).to_numpy() / 1000    # thousand vehicles, 2010–2018
z = production[12:] - production[:-12]                            # seasonal difference

def adf(y, k):
    """ADF test by hand: Δy_t = a + ρ y_{t−1} + Σ δ_i Δy_{t−i} + error; the statistic is ρ̂ / SE(ρ̂)."""
    dy = np.diff(y)
    rows = np.arange(k, len(dy))
    X = np.column_stack([np.ones(len(rows)), y[rows]] + [dy[rows - i] for i in range(1, k + 1)])
    coef, *_ = np.linalg.lstsq(X, dy[rows], rcond=None)
    res = dy[rows] - X @ coef
    s2 = res @ res / (len(rows) - X.shape[1])
    return coef[1] / np.sqrt(s2 * np.linalg.inv(X.T @ X)[1, 1])

for name, series in [("level", production), ("seasonal difference", z)]:
    for k in (0, 12):
        test = adfuller(series, maxlag=k, regression="c", autolag=None, result_object=True)  # check
        print(f"{'ADF (' + name + ', k = ' + str(k) + '):':36s}{adf(series, k):.3f}"
              f"   statsmodels: {test.statistic:.3f}   p-value = {test.pvalue:.4f}")</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">ADF (level, k = 0):                 -3.623   statsmodels: -3.623   p-value = 0.0053
ADF (level, k = 12):                -1.129   statsmodels: -1.129   p-value = 0.7034
ADF (seasonal difference, k = 0):   -4.338   statsmodels: -4.338   p-value = 0.0004
ADF (seasonal difference, k = 12):  -2.264   statsmodels: -2.264   p-value = 0.1839</pre>
</div>
  </div>
</div>

| Series | $k = 0$ | $k = 12$ |
|---|---|---|
| Level | −3.623 (p-value 0.0053) | −1.129 (p-value 0.7034) |
| Seasonal difference | −4.338 (p-value 0.0004) | −2.264 (p-value 0.1839) |

**Interpretation.** The conclusion **depends on the number of lags**: with no lags, the test rejects the unit root in both series; with 12 (one year of lags), it rejects in neither. With about 100 months and a sharp drop in the middle (2015–2016), the test has little power, and "not rejecting" does not prove the series needs differencing. Use the test together with the plots: the level of production clearly changes over the years, and the seasonality is strong, so the seasonal difference is a reasonable choice.

### 7.4 The AR(1) autoregressive model

In a **first-order autoregressive model**, each value depends on the previous one:

$$
z_t = c + \phi\,z_{t-1} + \varepsilon_t
$$

with $\varepsilon\_t$ independent, with mean zero and variance $\sigma^2$. If $\lvert\phi\rvert < 1$, the series is stationary and swings around the long-run mean $c/(1 - \phi)$. The parameters can be estimated by [least squares]({{ '/en/data-analysis/linear-regression' | relative_url }}), regressing $z\_t$ on $z\_{t-1}$.

**Example by hand:** AR(1) on the seasonal difference $z = 4, 4, 4, 6, 4, 5, 4, 5$ of the sales. There are 7 pairs (previous $x = z\_{t-1}$, current $w = z\_t$): $\bar{x} = 31/7 \approx 4.4286$ and $\bar{w} = 32/7 \approx 4.5714$.

| $x = z\_{t-1}$ | $w = z\_t$ | $x - \bar{x}$ | $w - \bar{w}$ | $(x - \bar{x})(w - \bar{w})$ | $(x - \bar{x})^2$ |
|---|---|---|---|---|---|
| 4 | 4 | −0.4286 | −0.5714 | 0.2449 | 0.1837 |
| 4 | 4 | −0.4286 | −0.5714 | 0.2449 | 0.1837 |
| 4 | 6 | −0.4286 | 1.4286 | −0.6122 | 0.1837 |
| 6 | 4 | 1.5714 | −0.5714 | −0.8980 | 2.4694 |
| 4 | 5 | −0.4286 | 0.4286 | −0.1837 | 0.1837 |
| 5 | 4 | 0.5714 | −0.5714 | −0.3265 | 0.3265 |
| 4 | 5 | −0.4286 | 0.4286 | −0.1837 | 0.1837 |
| **Sum** | | | | $-12/7 \approx -1.7143$ | $26/7 \approx 3.7143$ |

$$
\hat{\phi} = \frac{-12/7}{26/7} = -\frac{12}{26} = -\frac{6}{13} \approx -0.4615 \qquad
\hat{c} = \bar{w} - \hat{\phi}\,\bar{x} = \frac{32}{7} + \frac{6}{13} \times \frac{31}{7} = \frac{416 + 186}{91} = \frac{602}{91} = \frac{86}{13} \approx 6.6154
$$

The long-run mean is $\hat{c}/(1 - \hat{\phi}) = (86/13)/(19/13) = 86/19 \approx 4.53$: each quarter's yearly growth swings around R\\$ 4.5 thousand, and the negative $\phi$ says that above-average growth tends to be followed by below-average growth.

**Forecast.** The last $z$ is $z\_{12} = 5$. So $\hat{z}\_{13} = 86/13 - (6/13) \times 5 = 56/13 \approx 4.3077$, and each further step uses the previous forecast: 4.6272, 4.4797, 4.5478. Since $z\_t = y\_t - y\_{t-4}$, the sales forecast is the same quarter of year 3 plus the predicted difference: $48 + 4.3077 = 52.31$; $61 + 4.6272 = 65.63$; $54 + 4.4797 = 58.48$; $81 + 4.5478 = 85.55$ (R\\$ thousand). Three different methods (decomposition, Holt-Winters and this one) give similar forecasts for year 4.

**Prediction interval in the AR(1).** With normal errors, the variance of the $h$-step forecast error is $\sigma^2(1 + \phi^2 + \phi^4 + \cdots + \phi^{2(h-1)})$, which grows with $h$ and levels off at $\sigma^2/(1 - \phi^2)$. The 95% interval is the forecast $\pm 1.96$ times the square root of that variance. Section 9 applies it to the real data.

<div class="code-tabs">
  <div class="code-tab" data-lang="julia">
<div class="code-container">
  <div class="code-header">
    <div class="code-lang">Julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Statistics

sales = [40, 52, 46, 70, 44, 56, 50, 76, 48, 61, 54, 81]

# Differences: first (t − 1) and seasonal (t − 4)
println("First difference:    ", diff(sales))
z = sales[5:end] .- sales[1:end-4]
println("Seasonal difference: ", z)

# AR(1) on the seasonal difference: z_t = c + φ z_{t−1} + error, by least squares
x, w = z[1:end-1], z[2:end]
φ = sum((x .- mean(x)) .* (w .- mean(w))) / sum((x .- mean(x)) .^ 2)
c = mean(w) - φ * mean(x)
println("φ = ", round(φ, digits = 4), "   c = ", round(c, digits = 4), "   long-run mean = ", round(c / (1 - φ), digits = 4))

# Forecast: predict the differences and add them to the same quarter of the previous year
zpred = Float64[]
previous = z[end]
for h in 1:4
    global previous = c + φ * previous
    push!(zpred, previous)
end
println("Predicted differences: ", round.(zpred, digits = 4))
println("Year 4 forecast:    ", round.(sales[9:12] .+ zpred, digits = 2))</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">First difference:    [12, -6, 24, -26, 12, -6, 26, -28, 13, -7, 27]
Seasonal difference: [4, 4, 4, 6, 4, 5, 4, 5]
φ = -0.4615   c = 6.6154   long-run mean = 4.5263
Predicted differences: [4.3077, 4.6272, 4.4797, 4.5478]
Year 4 forecast:    [52.31, 65.63, 58.48, 85.55]</pre>
</div>
  </div>
  <div class="code-tab" data-lang="r">
<div class="code-container">
  <div class="code-header">
    <div class="code-lang">R</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>sales &lt;- c(40, 52, 46, 70, 44, 56, 50, 76, 48, 61, 54, 81)

# Differences: first (t − 1) and seasonal (t − 4)
cat("First difference:   ", diff(sales), "\n")
z &lt;- diff(sales, lag = 4)
cat("Seasonal difference:", z, "\n")

# AR(1) on the seasonal difference: z_t = c + φ z_{t−1} + error, by least squares
x &lt;- z[-length(z)]; w &lt;- z[-1]
fit &lt;- lm(w ~ x)
const &lt;- coef(fit)[[1]]; fi &lt;- coef(fit)[[2]]
cat("φ =", round(fi, 4), "  c =", round(const, 4), "  long-run mean =", round(const / (1 - fi), 4), "\n")

# Forecast: predict the differences and add them to the same quarter of the previous year
zpred &lt;- numeric(4)
previous &lt;- z[length(z)]
for (h in 1:4) { previous &lt;- const + fi * previous; zpred[h] &lt;- previous }
cat("Predicted differences:", round(zpred, 4), "\n")
cat("Year 4 forecast:   ", round(sales[9:12] + zpred, 2), "\n")</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">First difference:    12 -6 24 -26 12 -6 26 -28 13 -7 27 
Seasonal difference: 4 4 4 6 4 5 4 5 
φ = -0.4615   c = 6.6154   long-run mean = 4.5263 
Predicted differences: 4.3077 4.6272 4.4797 4.5478 
Year 4 forecast:    52.31 65.63 58.48 85.55</pre>
</div>
  </div>
  <div class="code-tab" data-lang="python">
<div class="code-container">
  <div class="code-header">
    <div class="code-lang">Python</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>import numpy as np

sales = np.array([40, 52, 46, 70, 44, 56, 50, 76, 48, 61, 54, 81])

# Differences: first (t − 1) and seasonal (t − 4)
print("First difference:   ", np.diff(sales))
z = sales[4:] - sales[:-4]
print("Seasonal difference:", z)

# AR(1) on the seasonal difference: z_t = c + φ z_{t−1} + error, by least squares
x, w = z[:-1], z[1:]
fi, c = np.polyfit(x, w, 1)
print(f"φ = {fi:.4f}   c = {c:.4f}   long-run mean = {c / (1 - fi):.4f}")

# Forecast: predict the differences and add them to the same quarter of the previous year
zpred, previous = [], z[-1]
for h in range(4):
    previous = c + fi * previous
    zpred.append(previous)
print("Predicted differences:", np.round(zpred, 4))
print("Year 4 forecast:   ", np.round(sales[8:] + np.array(zpred), 2))</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">First difference:    [ 12  -6  24 -26  12  -6  26 -28  13  -7  27]
Seasonal difference: [4 4 4 6 4 5 4 5]
φ = -0.4615   c = 6.6154   long-run mean = 4.5263
Predicted differences: [4.3077 4.6272 4.4797 4.5478]
Year 4 forecast:    [52.31 65.63 58.48 85.55]</pre>
</div>
  </div>
</div>

### 7.5 The ARIMA family

The AR(1) is the simplest case of a family:

- **AR($p$)**: $z\_t$ depends on $z\_{t-1}, \ldots, z\_{t-p}$;
- **MA($q$)**: $z\_t$ depends on the past **errors** $\varepsilon\_{t-1}, \ldots, \varepsilon\_{t-q}$ ("moving averages" of the errors, a different meaning of the term from section 3);
- **ARIMA($p$, $d$, $q$)**: AR($p$) and MA($q$) applied to the series after $d$ first differences;
- **SARIMA($p$, $d$, $q$)($P$, $D$, $Q$)$\_m$**: adds seasonal terms and $D$ seasonal differences with period $m$. The model in the example above, an AR(1) on the seasonal difference, is a SARIMA(1, 0, 0)(0, 1, 0)$\_4$.

With MA terms, the past errors are not observed, and estimation requires maximum likelihood, done by functions such as `arima()` in R (`stats` package) and `SARIMAX` in statsmodels. Choosing $p$ and $q$ usually relies on the correlogram and the PACF (section 4) and on criteria such as the AIC, always checking that the model's residuals have no autocorrelation left.

---

## 8. Measuring Error, Validating and Building Intervals

### 8.1 Error measures

With actual values $y\_t$ and forecasts $\hat{y}\_t$ for $n$ periods, the error is $e\_t = y\_t - \hat{y}\_t$. The most common measures:

$$
\text{MAE} = \frac{1}{n}\sum \lvert e_t \rvert \qquad
\text{RMSE} = \sqrt{\frac{1}{n}\sum e_t^2} \qquad
\text{MAPE} = \frac{100\%}{n}\sum \left\lvert \frac{e_t}{y_t} \right\rvert
$$

- **MAE** (mean absolute error): the typical error, in the units of the series;
- **RMSE** (root mean squared error): also in the units of the series, but weighs large errors more; it is always greater than or equal to the MAE;
- **MAPE** (mean absolute percentage error): the error as a percentage of the actual value; it allows comparing series on different scales, but does not work with values equal or close to zero.

**Example by hand.** In the validation of the decomposition (fitted on years 1 and 2, forecasting year 3; exact forecasts $1373/28$, $3413/56$, $775/14$ and $4453/56$):

| Quarter | Actual $y\_t$ | Forecast $\hat{y}\_t$ | $e\_t$ | $\lvert e\_t \rvert$ | $e\_t^2$ | $\lvert e\_t \rvert / y\_t$ |
|---|---|---|---|---|---|---|
| Q1 | 48 | 49.0357 | −1.0357 | 1.0357 | 1.0727 | 0.02158 |
| Q2 | 61 | 60.9464 | 0.0536 | 0.0536 | 0.0029 | 0.00088 |
| Q3 | 54 | 55.3571 | −1.3571 | 1.3571 | 1.8418 | 0.02513 |
| Q4 | 81 | 79.5179 | 1.4821 | 1.4821 | 2.1967 | 0.01830 |
| **Sum** | | | | **3.9286** | **5.1142** | **0.06589** |

$$
\text{MAE} = \frac{3.9286}{4} = 0.98 \qquad
\text{RMSE} = \sqrt{\frac{5.1142}{4}} = \sqrt{1.2785} = 1.13 \qquad
\text{MAPE} = \frac{100\% \times 0.06589}{4} = 1.65\%
$$

On average, the decomposition was off by about R\\$ 1 thousand per quarter, or 1.65% of sales. The seasonal naive method (repeating year 2) had MAE 4.50, RMSE 4.53 and MAPE 7.53%.

<div class="code-tabs">
  <div class="code-tab" data-lang="julia">
<div class="code-container">
  <div class="code-header">
    <div class="code-lang">Julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Statistics

sales = [40, 52, 46, 70, 44, 56, 50, 76, 48, 61, 54, 81]
quarter(t) = mod1(t, 4)

# Same method as the decomposition, using only the past data in `series`
function predict(series, horizon)
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
decomposition = predict(train, 4)
naive = train[5:8]                      # seasonal naive method: repeat the previous year

mae(p)  = mean(abs.(test .- p))                   # mean absolute error
rmse(p) = sqrt(mean((test .- p) .^ 2))            # root mean squared error
mape(p) = 100 * mean(abs.((test .- p) ./ test))  # mean absolute percentage error (%)

println("Actual (year 3):    ", test)
for (name, p) in [("Decomposition", decomposition), ("Seasonal naive", naive)]
    println(rpad(name, 17), round.(p, digits = 2), "   MAE = ", round(mae(p), digits = 2),
            "   RMSE = ", round(rmse(p), digits = 2), "   MAPE = ", round(mape(p), digits = 2), "%")
end</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">Actual (year 3):    [48, 61, 54, 81]
Decomposition    [49.04, 60.95, 55.36, 79.52]   MAE = 0.98   RMSE = 1.13   MAPE = 1.65%
Seasonal naive   [44.0, 56.0, 50.0, 76.0]   MAE = 4.5   RMSE = 4.53   MAPE = 7.53%</pre>
</div>
  </div>
  <div class="code-tab" data-lang="r">
<div class="code-container">
  <div class="code-header">
    <div class="code-lang">R</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>sales &lt;- c(40, 52, 46, 70, 44, 56, 50, 76, 48, 61, 54, 81)
quarter &lt;- function(t) (t - 1) %% 4 + 1

# Same method as the decomposition, using only the past data in `series`
predict &lt;- function(series, horizon) {
  n &lt;- length(series)
  ma &lt;- sapply(3:(n - 2), function(t)
    (series[t - 2] / 2 + series[t - 1] + series[t] + series[t + 1] + series[t + 2] / 2) / 4)
  raw &lt;- tapply(series[3:(n - 2)] - ma, quarter(3:(n - 2)), mean)
  effect &lt;- raw - mean(raw)
  adjusted &lt;- series - effect[quarter(1:n)]
  time &lt;- 1:n
  b &lt;- coef(lm(adjusted ~ time))
  future &lt;- (n + 1):(n + horizon)
  b[[1]] + b[[2]] * future + effect[quarter(future)]
}

# Time-based validation: fit on years 1 and 2 and forecast year 3, which is already known
train &lt;- sales[1:8]; test &lt;- sales[9:12]
decomposition &lt;- predict(train, 4)
naive &lt;- train[5:8]                       # seasonal naive method: repeat the previous year

mae  &lt;- function(p) mean(abs(test - p))                 # mean absolute error
rmse &lt;- function(p) sqrt(mean((test - p)^2))            # root mean squared error
mape &lt;- function(p) 100 * mean(abs((test - p) / test)) # mean absolute percentage error (%)

cat("Actual (year 3):   ", test, "\n")
for (method in list(list("Decomposition", decomposition), list("Seasonal naive", naive))) {
  p &lt;- method[[2]]
  cat(format(method[[1]], width = 16), round(p, 2), "  MAE =", round(mae(p), 2),
      "  RMSE =", round(rmse(p), 2), "  MAPE =", paste0(round(mape(p), 2), "%"), "\n")
}</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">Actual (year 3):    48 61 54 81 
Decomposition    49.04 60.95 55.36 79.52   MAE = 0.98   RMSE = 1.13   MAPE = 1.65% 
Seasonal naive   44 56 50 76   MAE = 4.5   RMSE = 4.53   MAPE = 7.53%</pre>
</div>
  </div>
  <div class="code-tab" data-lang="python">
<div class="code-container">
  <div class="code-header">
    <div class="code-lang">Python</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>import numpy as np

sales = np.array([40, 52, 46, 70, 44, 56, 50, 76, 48, 61, 54, 81], dtype=float)
quarter = lambda t: (t - 1) % 4 + 1

def predict(series, horizon):
    """Same method as the decomposition, using only the past data in `series`."""
    n = len(series)
    ma = np.convolve(series, [1/8, 1/4, 1/4, 1/4, 1/8], mode="valid")
    t_ma = np.arange(3, n - 1)
    deviations = series[2:n - 2] - ma
    raw = np.array([deviations[quarter(t_ma) == q].mean() for q in range(1, 5)])
    effect = raw - raw.mean()
    time = np.arange(1, n + 1)
    b, a = np.polyfit(time, series - effect[quarter(time) - 1], 1)
    future = np.arange(n + 1, n + horizon + 1)
    return a + b * future + effect[quarter(future) - 1]

# Time-based validation: fit on years 1 and 2 and forecast year 3, which is already known
train, test = sales[:8], sales[8:]
decomposition = predict(train, 4)
naive = train[4:8]                          # seasonal naive method: repeat the previous year

mae  = lambda p: np.mean(np.abs(test - p))                 # mean absolute error
rmse = lambda p: np.sqrt(np.mean((test - p) ** 2))         # root mean squared error
mape = lambda p: 100 * np.mean(np.abs((test - p) / test)) # mean absolute percentage error (%)

print("Actual (year 3):    ", test)
for name, p in [("Decomposition", decomposition), ("Seasonal naive", naive)]:
    print(f"{name:16s}", np.round(p, 2), f"  MAE = {mae(p):.2f}   RMSE = {rmse(p):.2f}   MAPE = {mape(p):.2f}%")</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">Actual (year 3):     [48. 61. 54. 81.]
Decomposition    [49.04 60.95 55.36 79.52]   MAE = 0.98   RMSE = 1.13   MAPE = 1.65%
Seasonal naive   [44. 56. 50. 76.]   MAE = 4.50   RMSE = 4.53   MAPE = 7.53%</pre>
</div>
  </div>
</div>

### 8.2 Validation over time

A model always looks good on the data used to fit it. To find out whether it **forecasts**, set aside the end of the series, fit on the beginning and compare the forecast with what happened. In time series, the test always comes **after** the training data: drawing observations at random, as in other problems, would let the model "see the future".

With a single split, the result depends heavily on the period chosen. **Rolling-origin validation** (or a sliding window) repeats the calculation several times: fit with the data up to month $t$, forecast month $t + 1$ (or the next $h$), move forward one month and repeat; the final error is the average of all those forecasts. It is more work, but gives a more stable idea of the error.

And always compare with a **naive method** (repeating the last value, or the same period of the previous year): a method is only worth it if it beats that.

### 8.3 Prediction intervals

A forecast with no margin of error hides the uncertainty. A 95% **prediction interval** is a range that, if the model is right, contains the future value in 95% of cases. It:

- grows with the horizon $h$ (forecasting far ahead is more uncertain);
- depends on the model's assumptions (independent errors, often normal) and does not include the uncertainty about the model itself or the estimated parameters, so it tends to be **too narrow** in practice;
- is different from a confidence interval for the mean: it is about the **value** that will occur.

Sections 6.2 and 7.4 gave the formulas for simple smoothing and for the AR(1).

---

## 9. Example with Real Data: Forecasting Vehicle Production

**Question.** Using monthly vehicle production from January 2010 to December 2018 (training data, 108 months), which method would have best forecast the 12 months of 2019 (test data)?

**Data.** Series 1373 of the Central Bank's SGS (primary source: Anfavea), in thousands of vehicles; license and access date in the box in section 2. The 2019 and 2020 data are left out of the fit and are used only for checking.

**Methods**, all fitted on the training data only:

1. **Seasonal naive**: each month of 2019 repeats the same month of 2018.
2. **Additive Holt-Winters** (section 6.2), with $\alpha$, $\beta$ and $\gamma$ chosen on a grid from 0 to 1, in steps of 0.05, by the smallest sum of squared one-step-ahead errors. The grid chose $\alpha = 0.4$, $\beta = 0$ and $\gamma = 0.1$; $\beta = 0$ means the trend stayed fixed at its starting value.
3. **AR(1) on the seasonal difference** (section 7.4): $z\_t = y\_t - y\_{t-12}$, $z\_t = c + \phi z\_{t-1} + \varepsilon\_t$. The estimates were $\hat{c} = -2.147$, $\hat{\phi} = 0.6604$ and $\hat{\sigma} = 35.47$ thousand vehicles.

<div class="code-tabs">
  <div class="code-tab" data-lang="julia">
<div class="code-container">
  <div class="code-header">
    <div class="code-lang">Julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Downloads, JSON, Dates, Statistics, Plots

url = "https://api.bcb.gov.br/dados/serie/bcdata.sgs.1373/dados?formato=json&amp;dataInicial=01/01/2010&amp;dataFinal=31/12/2020"
data = JSON.parse(String(take!(Downloads.download(url, IOBuffer()))))
dates = [Date(d["data"], dateformat"dd/mm/yyyy") for d in data]
production = [parse(Float64, d["valor"]) for d in data] ./ 1000   # thousand vehicles
train, test = production[1:108], production[109:120]               # 2010–2018 and 2019
m = 12

# Method 1: seasonal naive (repeat 2018)
naive = train[end-m+1:end]

# Method 2: additive Holt-Winters, α, β, γ chosen by grid search
function holt_winters(y, α, β, γ, m)
    level = mean(y[1:m]); trend = (mean(y[m+1:2m]) - mean(y[1:m])) / m
    seasonal = y[1:m] .- level; sse = 0.0
    for t in m+1:length(y)
        s = seasonal[t-m]
        sse += (y[t] - (level + trend + s))^2          # one-step-ahead forecast error
        new_level = α * (y[t] - s) + (1 - α) * (level + trend)
        new_trend = β * (new_level - level) + (1 - β) * trend
        push!(seasonal, γ * (y[t] - level - trend) + (1 - γ) * s)
        level, trend = new_level, new_trend
    end
    forecast = [level + h * trend + seasonal[end-m+mod1(h, m)] for h in 1:m]
    return sse, forecast
end
grid = 0:0.05:1
_, i = findmin([holt_winters(train, α, β, γ, m)[1] for α in grid, β in grid, γ in grid])
α, β, γ = grid[i[1]], grid[i[2]], grid[i[3]]
hw = holt_winters(train, α, β, γ, m)[2]
println("Holt-Winters: α = ", α, "   β = ", β, "   γ = ", γ)

# Method 3: AR(1) on the seasonal difference z_t = y_t − y_{t−12}
z = train[m+1:end] .- train[1:end-m]
x, w = z[1:end-1], z[2:end]
φ = sum((x .- mean(x)) .* (w .- mean(w))) / sum((x .- mean(x)) .^ 2)
c = mean(w) - φ * mean(x)
σ = sqrt(sum((w .- c .- φ .* x) .^ 2) / (length(w) - 2))
zpred = accumulate((previous, _) -&gt; c + φ * previous, 1:m; init = z[end])
ar = train[end-m+1:end] .+ zpred
# 95% interval: variance of the h-step error in the AR(1) = σ²(1 + φ² + … + φ^(2(h−1)))
ep = [σ * sqrt(sum(φ^(2j) for j in 0:h-1)) for h in 1:m]
lower, upper = ar .- 1.96 .* ep, ar .+ 1.96 .* ep
println("AR(1): c = ", round(c, digits = 3), "   φ = ", round(φ, digits = 4), "   σ = ", round(σ, digits = 2))

mae(p)  = mean(abs.(test .- p))
rmse(p) = sqrt(mean((test .- p) .^ 2))
mape(p) = 100 * mean(abs.((test .- p) ./ test))
for (name, p) in [("Seasonal naive", naive), ("Holt-Winters", hw), ("Seasonal AR(1)", ar)]
    println(rpad(name, 16), " MAE = ", round(mae(p), digits = 1), "   RMSE = ", round(rmse(p), digits = 1),
            "   MAPE = ", round(mape(p), digits = 1), "%")
end
println("2019 inside the AR 95% interval: ", sum(lower .&lt;= test .&lt;= upper), " of 12 months")
println("2020, actual (thousand): ", round.(production[121:132], digits = 1))

p = plot(dates[85:132], production[85:132], label = "Actual", marker = :circle, markersize = 3,
         ylabel = "Thousand vehicles", title = "Forecast for 2019 and what came in 2020", legend = :bottomleft, size = (900, 420),
         xticks = (Date.(2017:2021, 1, 1), string.(2017:2021)), left_margin = 6Plots.mm, right_margin = 6Plots.mm)
plot!(p, dates[109:120], ar, ribbon = (ar .- lower, upper .- ar), fillalpha = 0.2, lw = 2, label = "Seasonal AR(1) and 95% interval")
plot!(p, dates[109:120], naive, ls = :dash, lw = 2, label = "Seasonal naive")
plot!(p, dates[109:120], hw, ls = :dot, lw = 2, label = "Holt-Winters")
savefig(p, "vehicle_production_forecast.png")</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">Holt-Winters: α = 0.4   β = 0.0   γ = 0.1
AR(1): c = -2.147   φ = 0.6604   σ = 35.47
Seasonal naive   MAE = 24.6   RMSE = 29.1   MAPE = 9.8%
Holt-Winters     MAE = 29.0   RMSE = 34.5   MAPE = 11.6%
Seasonal AR(1)   MAE = 25.6   RMSE = 33.8   MAPE = 9.8%
2019 inside the AR 95% interval: 12 of 12 months
2020, actual (thousand): [191.7, 204.2, 190.0, 1.8, 43.1, 98.4, 170.7, 210.0, 220.2, 236.5, 238.2, 209.3]</pre>
</div>
  </div>
  <div class="code-tab" data-lang="r">
<div class="code-container">
  <div class="code-header">
    <div class="code-lang">R</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>library(jsonlite)

url &lt;- "https://api.bcb.gov.br/dados/serie/bcdata.sgs.1373/dados?formato=json&amp;dataInicial=01/01/2010&amp;dataFinal=31/12/2020"
data &lt;- fromJSON(url)
dates &lt;- as.Date(data$data, format = "%d/%m/%Y")
production &lt;- as.numeric(data$valor) / 1000          # thousand vehicles
train &lt;- production[1:108]; test &lt;- production[109:120] # 2010–2018 and 2019
m &lt;- 12

# Method 1: seasonal naive (repeat 2018)
naive &lt;- tail(train, m)

# Method 2: additive Holt-Winters, α, β, γ chosen by grid search
holt_winters &lt;- function(y, alfa, beta, gama, m) {
  level &lt;- mean(y[1:m]); trend &lt;- (mean(y[(m + 1):(2 * m)]) - mean(y[1:m])) / m
  seasonal &lt;- y[1:m] - level; sse &lt;- 0
  for (t in (m + 1):length(y)) {
    s &lt;- seasonal[t - m]
    sse &lt;- sse + (y[t] - (level + trend + s))^2   # one-step-ahead forecast error
    new_level &lt;- alfa * (y[t] - s) + (1 - alfa) * (level + trend)
    new_trend &lt;- beta * (new_level - level) + (1 - beta) * trend
    seasonal[t] &lt;- gama * (y[t] - level - trend) + (1 - gama) * s
    level &lt;- new_level; trend &lt;- new_trend
  }
  h &lt;- 1:m
  list(sse = sse, forecast = level + h * trend + seasonal[length(seasonal) - m + h])
}
grid &lt;- expand.grid(alfa = seq(0, 1, 0.05), beta = seq(0, 1, 0.05), gama = seq(0, 1, 0.05))
sse &lt;- mapply(function(a, b, g) holt_winters(train, a, b, g, m)$sse, grid$alfa, grid$beta, grid$gama)
best &lt;- grid[which.min(sse), ]
hw &lt;- holt_winters(train, best$alfa, best$beta, best$gama, m)$forecast
cat("Holt-Winters: α =", best$alfa, "  β =", best$beta, "  γ =", best$gama, "\n")

# Method 3: AR(1) on the seasonal difference z_t = y_t − y_{t−12}
z &lt;- diff(train, lag = m)
x &lt;- head(z, -1); w &lt;- z[-1]
fit &lt;- lm(w ~ x)
const &lt;- coef(fit)[[1]]; fi &lt;- coef(fit)[[2]]; sigma &lt;- summary(fit)$sigma
zpred &lt;- Reduce(function(previous, h) const + fi * previous, 1:m, accumulate = TRUE, z[length(z)])[-1]
ar &lt;- tail(train, m) + zpred
# 95% interval: variance of the h-step error in the AR(1) = σ²(1 + φ² + … + φ^(2(h−1)))
ep &lt;- sigma * sqrt(cumsum(fi^(2 * (0:(m - 1)))))
lower &lt;- ar - 1.96 * ep; upper &lt;- ar + 1.96 * ep
cat("AR(1): c =", round(const, 3), "  φ =", round(fi, 4), "  σ =", round(sigma, 2), "\n")

mae  &lt;- function(p) mean(abs(test - p))
rmse &lt;- function(p) sqrt(mean((test - p)^2))
mape &lt;- function(p) 100 * mean(abs((test - p) / test))
for (method in list(list("Seasonal naive", naive), list("Holt-Winters", hw), list("Seasonal AR(1)", ar))) {
  p &lt;- method[[2]]
  cat(format(method[[1]], width = 16), "MAE =", round(mae(p), 1), "  RMSE =", round(rmse(p), 1),
      "  MAPE =", paste0(round(mape(p), 1), "%"), "\n")
}
cat("2019 inside the AR 95% interval:", sum(lower &lt;= test &amp; test &lt;= upper), "of 12 months\n")
cat("2020, actual (thousand):", round(production[121:132], 1), "\n")

png("vehicle_production_forecast_r.png", width = 900, height = 420)
plot(dates[85:132], production[85:132], type = "o", pch = 19, cex = 0.6, ylim = c(0, 380),
     xlab = "", ylab = "Thousand vehicles", main = "Forecast for 2019 and what came in 2020")
polygon(c(dates[109:120], rev(dates[109:120])), c(lower, rev(upper)), col = adjustcolor("#DC143C", 0.2), border = NA)
lines(dates[109:120], ar, lwd = 2, col = "#DC143C")
lines(dates[109:120], naive, lwd = 2, lty = 2, col = "darkgreen")
lines(dates[109:120], hw, lwd = 2, lty = 3, col = "purple")
legend("bottomleft", c("Actual", "Seasonal AR(1) and 95% interval", "Seasonal naive", "Holt-Winters"),
       col = c("black", "#DC143C", "darkgreen", "purple"), lty = c(1, 1, 2, 3), pch = c(19, NA, NA, NA))
invisible(dev.off())</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">Holt-Winters: α = 0.4   β = 0   γ = 0.1 
AR(1): c = -2.147   φ = 0.6604   σ = 35.47 
Seasonal naive   MAE = 24.6   RMSE = 29.1   MAPE = 9.8% 
Holt-Winters     MAE = 29   RMSE = 34.5   MAPE = 11.6% 
Seasonal AR(1)   MAE = 25.6   RMSE = 33.8   MAPE = 9.8% 
2019 inside the AR 95% interval: 12 of 12 months
2020, actual (thousand): 191.7 204.2 190 1.8 43.1 98.4 170.7 210 220.2 236.5 238.2 209.3</pre>
</div>
  </div>
  <div class="code-tab" data-lang="python">
<div class="code-container">
  <div class="code-header">
    <div class="code-lang">Python</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copy
    </button>
  </div>
  <div class="code-content">
    <pre><code>import itertools
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

url = ("https://api.bcb.gov.br/dados/serie/bcdata.sgs.1373/dados?formato=json"
       "&amp;dataInicial=01/01/2010&amp;dataFinal=31/12/2020")
data = pd.read_json(url, storage_options={"User-Agent": "Mozilla/5.0"})
dates = pd.to_datetime(data["data"], format="%d/%m/%Y")
production = data["valor"].astype(float).to_numpy() / 1000    # thousand vehicles
train, test = production[:108], production[108:120]             # 2010–2018 and 2019
m = 12

# Method 1: seasonal naive (repeat 2018)
naive = train[-m:]

# Method 2: additive Holt-Winters, α, β, γ chosen by grid search
def holt_winters(y, alfa, beta, gama, m):
    level = y[:m].mean(); trend = (y[m:2 * m].mean() - y[:m].mean()) / m
    seasonal = list(y[:m] - level); sse = 0.0
    for t in range(m, len(y)):
        s = seasonal[t - m]
        sse += (y[t] - (level + trend + s)) ** 2        # one-step-ahead forecast error
        new_level = alfa * (y[t] - s) + (1 - alfa) * (level + trend)
        new_trend = beta * (new_level - level) + (1 - beta) * trend
        seasonal.append(gama * (y[t] - level - trend) + (1 - gama) * s)
        level, trend = new_level, new_trend
    forecast = np.array([level + h * trend + seasonal[len(seasonal) - m + h - 1] for h in range(1, m + 1)])
    return sse, forecast

grid = np.round(np.arange(0, 1.0001, 0.05), 2)
alfa, beta, gama = min(itertools.product(grid, grid, grid), key=lambda p: holt_winters(train, *p, m)[0])
hw = holt_winters(train, alfa, beta, gama, m)[1]
print(f"Holt-Winters: α = {alfa}   β = {beta}   γ = {gama}")

# Method 3: AR(1) on the seasonal difference z_t = y_t − y_{t−12}
z = train[m:] - train[:-m]
x, w = z[:-1], z[1:]
fi, c = np.polyfit(x, w, 1)
sigma = np.sqrt(np.sum((w - c - fi * x) ** 2) / (len(w) - 2))
zpred, previous = [], z[-1]
for h in range(m):
    previous = c + fi * previous
    zpred.append(previous)
ar = train[-m:] + np.array(zpred)
# 95% interval: variance of the h-step error in the AR(1) = σ²(1 + φ² + … + φ^(2(h−1)))
ep = sigma * np.sqrt(np.cumsum(fi ** (2 * np.arange(m))))
lower, upper = ar - 1.96 * ep, ar + 1.96 * ep
print(f"AR(1): c = {c:.3f}   φ = {fi:.4f}   σ = {sigma:.2f}")

mae  = lambda p: np.mean(np.abs(test - p))
rmse = lambda p: np.sqrt(np.mean((test - p) ** 2))
mape = lambda p: 100 * np.mean(np.abs((test - p) / test))
for name, p in [("Seasonal naive", naive), ("Holt-Winters", hw), ("Seasonal AR(1)", ar)]:
    print(f"{name:16s} MAE = {mae(p):.1f}   RMSE = {rmse(p):.1f}   MAPE = {mape(p):.1f}%")
print("2019 inside the AR 95% interval:", np.sum((lower &lt;= test) &amp; (test &lt;= upper)), "of 12 months")
print("2020, actual (thousand):", np.round(production[120:132], 1))

fig, ax = plt.subplots(figsize=(9, 4.2))
ax.plot(dates[84:132], production[84:132], "o-", ms=3, label="Actual")
ax.fill_between(dates[108:120], lower, upper, color="crimson", alpha=0.2)
ax.plot(dates[108:120], ar, color="crimson", lw=2, label="Seasonal AR(1) and 95% interval")
ax.plot(dates[108:120], naive, "--", lw=2, label="Seasonal naive")
ax.plot(dates[108:120], hw, ":", lw=2, label="Holt-Winters")
ax.set(ylabel="Thousand vehicles", title="Forecast for 2019 and what came in 2020"); ax.legend(loc="lower left")
fig.tight_layout(); fig.savefig("vehicle_production_forecast_py.png", dpi=100)</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Output</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">Holt-Winters: α = 0.4   β = 0.0   γ = 0.1
AR(1): c = -2.147   φ = 0.6604   σ = 35.47
Seasonal naive   MAE = 24.6   RMSE = 29.1   MAPE = 9.8%
Holt-Winters     MAE = 29.0   RMSE = 34.5   MAPE = 11.6%
Seasonal AR(1)   MAE = 25.6   RMSE = 33.8   MAPE = 9.8%
2019 inside the AR 95% interval: 12 of 12 months
2020, actual (thousand): [191.7 204.2 190.    1.8  43.1  98.4 170.7 210.  220.2 236.5 238.2 209.3]</pre>
</div>
  </div>
</div>

![Monthly vehicle production from 2017 to 2020 with the 2019 forecasts of the three methods and the band of the AR(1) 95% interval; in 2020 production drops to almost zero in April and recovers by the end of the year]({{ site.baseurl }}/assets/images/vehicle_production_forecast.png){:style="max-width: 900px; display: block; margin: 1em auto;"}
<div class="image-caption" style="text-align: center;">Figure 3. Monthly vehicle production (SGS 1373; Anfavea), 2019 forecasts of the three methods, 95% interval of the seasonal AR(1) and the actual 2020 values. Produced by the code above, Julia version.</div>

**Results for 2019** (thousand vehicles):

| Method | MAE | RMSE | MAPE |
|---|---|---|---|
| Seasonal naive | 24.6 | 29.1 | 9.8% |
| Holt-Winters | 29.0 | 34.5 | 11.6% |
| Seasonal AR(1) | 25.6 | 33.8 | 9.8% |

**Interpretation.**

- The three methods were off, on average, by 25 to 29 thousand vehicles a month, about 10% of production. In a real series, subject to holidays that move between months, production stoppages and demand shocks, an error of this size is not surprising.
- **The simplest method won** on MAE and RMSE. The other two could not extract more information from the past than "next year looks like this one". That is why every method should be compared with a naive one.
- The difference between the three is small compared with the error itself, and with only 12 test months it may be chance. Rolling-origin validation (section 8.2), over several years, would say more reliably which is better.
- All 12 actual values for 2019 fell inside the AR(1) 95% interval. But the interval is wide: from about ±70 thousand vehicles in the first month to ±93 thousand in the twelfth. The model is honest about its own uncertainty, and that uncertainty is large.

**And 2020?** In April 2020, production was **1.8 thousand vehicles**, against 267.6 thousand in April 2019; in May, 43.1 thousand; the recovery came in the second half of the year. These months coincide with the start of the COVID-19 pandemic in Brazil. None of the methods above, nor any other based only on the series' past, could have forecast this drop: it was not in the data. It is a **structural break**, and a reminder that prediction intervals hold only "if nothing changes".

---

## 10. Other Methods

- **Ready-made functions**: in R, `decompose()`, `stl()`, `HoltWinters()` and `arima()` (`stats` package); in Python, `seasonal_decompose`, `STL`, `ExponentialSmoothing` and `SARIMAX` (statsmodels). They choose parameters and starting values on their own; it is worth understanding the equations (as on this page) before using them.
- **ETS models**: the statistical version of exponential smoothing, with prediction intervals and automatic choice of form (additive or multiplicative) by information criteria.
- **Prophet**: a decomposition model with trend, seasonalities and holidays, published by researchers at Facebook (Taylor and Letham, 2018).
- **Neural networks** (for example, LSTM): can capture complex patterns, but need a lot of data and are hard to interpret; on short series, they often do not beat the methods above.

Hyndman and Athanasopoulos's book (reference 1), free online, explains all of them with examples.

---

## 11. Good Practices and Pitfalls

- **Plot the series** before any calculation: trend, seasonality, sudden changes and outliers usually show up in the chart.
- **A unit root test is not a verdict**: the ADF result changes with the number of lags (section 7.3); decide by also looking at the plots.
- **Spurious correlation**: two series that grow over time (for example, ice cream sales and the number of mobile phone users) will have a high correlation with no real relationship between them. Compare the changes, not the levels.
- **Validate over time**: split training and test data respecting chronological order, preferably with a rolling origin, and compare with a naive method; in section 9, the naive method won.
- **Show the uncertainty**: give the forecast with an interval, and remember the interval assumes the model is right.
- **Do not trust long-range forecasts**: uncertainty grows with the horizon.
- **Structural breaks** (a pandemic, a rule change, a new store) break the pattern of the past; the model does not foresee them.

---

## 12. Glossary

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
| Exponential smoothing | Forecasting by a weighted average of the past, with weights that shrink for older values |
| Seasonal difference | $y\_t - y\_{t-m}$: change from the same period of the previous year |
| Unit root | The situation in which the series needs differencing to become stationary (tested by the ADF) |
| AR($p$), MA($q$), ARIMA | Models in which the value depends on past values (AR) or past errors (MA), after $d$ differences (I) |
| Seasonal naive method | Forecasting each period by repeating the same period of the previous year |
| Prediction interval | A range that contains the future value with the stated probability, if the model is right |

---

## 13. Summary

- Time series: observations in time order, usually **dependent** on each other.
- Components: trend, seasonality (fixed period), cycle (no fixed period) and noise; additive or multiplicative model.
- Plots: line, seasonal, subseries and correlogram; plot before you calculate.
- In the quarterly example: seasonal effects of −10.875 (Q1), 0.4375 (Q2), −6.75 (Q3) and 17.1875 (Q4), a trend of R\\$ 1.13 thousand per quarter; decomposition, Holt-Winters and an AR(1) on the seasonal difference forecast year 4 similarly (about 53, 65, 59 and 85 thousand).
- Exponential smoothing: level (and trend and seasonality, in Holt-Winters) updated by weighted averages.
- ARIMA: differences to make the series stationary, then a model for past values (AR) and past errors (MA); the ADF helps, but depends on the lags.
- Measure the error (MAE, RMSE, MAPE) on data the model has not seen, always after the training data, and compare with a naive method.
- In vehicle production, the seasonal naive method forecast 2019 better than Holt-Winters and the AR(1); no method foresaw April 2020.

---

## References

1. Hyndman, R. J.; Athanasopoulos, G. (2021). *Forecasting: Principles and Practice*. 3rd ed. OTexts. Available at [otexts.com/fpp3](https://otexts.com/fpp3/).
2. Morettin, P. A.; Toloi, C. M. C. (2018). *Análise de Séries Temporais*, v. 1: Modelos Lineares Univariados. 3rd ed. Blucher. (in Portuguese)
3. Taylor, S. J.; Letham, B. (2018). Forecasting at Scale. *The American Statistician*, 72(1), 37–45. DOI: [10.1080/00031305.2017.1380080](https://doi.org/10.1080/00031305.2017.1380080).

## Data

- Banco Central do Brasil (Central Bank of Brazil). Time Series Management System (SGS), series 1373: Produção total de autoveículos (total vehicle production; units, monthly). Primary source: Anfavea. License: Open Data Commons Open Database License (ODbL). API: `https://api.bcb.gov.br/dados/serie/bcdata.sgs.1373/dados?formato=json`. Accessed November 25, 2026.
