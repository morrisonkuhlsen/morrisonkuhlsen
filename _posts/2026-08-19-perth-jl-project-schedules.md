---
layout: post
image: /assets/images/perth-ui-en.jpg
title: "Perth.jl: Project Schedules You Can Compute On"
categories: [JULIA, PROJECT MANAGEMENT]
lang: en
tags: [Julia, Project management]
ref: perth-jl
author: dante-bertuzzi
description: "What Perth.jl is, the concepts behind it (WBS, CPM, slack, critical path, PERT), how to install it, how it works under the hood, and a complete real-world example: the schedule of a service-times study, from the REPL to the browser."
mathjax: true
---

<style>
/* Tabelas deste post: o tema não define espaçamento de célula, e as tabelas
   aqui são numéricas — sem padding as colunas encostam umas nas outras. */
.perth-table { overflow-x: auto; margin: 1.6em 0; }
.perth-table table { border-collapse: collapse; width: 100%; }
.perth-table th,
.perth-table td { padding: 0.45em 0.9em; border-bottom: 1px solid rgba(128,128,128,.22); text-align: left; vertical-align: top; }
.perth-table thead th { border-bottom: 2px solid rgba(128,128,128,.45); }
.perth-table td + td, .perth-table th + th { white-space: nowrap; }
.perth-table td:first-child, .perth-table th:first-child { white-space: normal; }
</style>

Anyone who has ever coordinated a project — a research study, a construction site, a thesis with a defense date — has lived the same moment: someone asks *"if this step slips two days, what else moves?"*, and answering means redrawing the schedule by hand.

The problem is not the question. It is that the schedule has become a **picture**. A spreadsheet with colored bars, or a PNG exported from some tool, is great for presenting and useless for computing. Nobody can ask an image which task is the bottleneck, how much slack is left, or what the probability is of delivering before the 30th.

This post introduces **Perth.jl**, a Julia package I wrote precisely to treat a schedule as what it actually is: a data structure you can compute on. We'll go through the concept, the installation, how it works under the hood, and finally a real example from start to finish.

---

## 1. What Perth.jl is

Perth.jl is a **critical-path (CPM) engine in Julia with a local browser UI attached**. The sentence that sums up the project: the model and the computation live in Julia; the browser is *one view* of the plan, not the source of truth.

In practice that means three things:

1. **You build the plan in code.** Tasks, dependencies, assignees, deadlines — all with ordinary Julia functions, versionable in git like any other script.
2. **You ask the plan questions.** `schedule!`, `critical_path`, `slack`, `workload` and `pert_finish` return [Tables.jl](https://github.com/JuliaData/Tables.jl)-compatible rows — which means they drop straight into a `DataFrame`, a CSV, a plot.
3. **You (and your team) edit in the browser.** `Perth.run()` starts a local server in the spirit of [Pluto.jl](https://plutojl.org/): dragging a bar in the Gantt changes the object in the REPL, and changing the object in the REPL reloads the browser. Same data, live, on both sides.

<figure style="display: flex; flex-direction: column; align-items: center; margin: 2.5em 0 2em 0;">
  <img src="/assets/images/perth-ui-en.jpg" alt="Perth.jl browser interface showing a Gantt chart with a work breakdown structure, task bars, dependency arrows and a side panel" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.07);" />
  <figcaption class="img-caption-contrast">
    <strong>Figure 1:</strong> the Perth.jl interface in the browser. The same screen exists in five languages (English, Portuguese, Spanish, French and Chinese) and edits the very project you have open in the REPL.
  </figcaption>
</figure>

The package is MIT-licensed, requires Julia ≥ 1.10, and has no front-end build step: no `node_modules`, no framework. The browser gets plain HTML, CSS and JavaScript served by Julia itself.

---

## 2. The concepts behind it

The vocabulary is worth a few paragraphs, because it is what gives meaning to every function in the API. If you already know CPM, skip to section 3.

### 2.1 Tasks, WBS and rollup

The unit is the **task**: a name, a start date, a duration, optionally an assignee, a cost, an effort and a percentage complete. Tasks nest through the `parent` field, forming the **WBS** (Work Breakdown Structure).

A task with children becomes a **summary**: its dates and duration stop being typed in and start being computed from the children. That is why, in the example below, the phase "1. Collection and preparation" is created with `duration = 1` and ends up 28 days long — nobody typed 28.

### 2.2 Dependencies: four ways of saying "after"

The default dependency is **finish-to-start**: task B starts once A finishes. Real life needs more nuance, and Perth accepts the classical variants inside the identifier string itself:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copy code">
      Copy
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-variable">dependencies</span> <span class="code-operator">=</span> <span class="code-paren">[</span><span class="code-variable">a</span>.<span class="code-variable">id</span><span class="code-paren">]</span>           <span class="code-comment"># finish-to-start: b starts after a finishes</span>
<span class="code-variable">dependencies</span> <span class="code-operator">=</span> <span class="code-paren">[</span><span class="code-string">"$(a.id)+3"</span><span class="code-paren">]</span>    <span class="code-comment"># finish-to-start with 3 days of lag</span>
<span class="code-variable">dependencies</span> <span class="code-operator">=</span> <span class="code-paren">[</span><span class="code-string">"SS:$(a.id)"</span><span class="code-paren">]</span>   <span class="code-comment"># start-to-start: b starts when a starts</span>
<span class="code-variable">dependencies</span> <span class="code-operator">=</span> <span class="code-paren">[</span><span class="code-string">"SS:$(a.id)+2"</span><span class="code-paren">]</span> <span class="code-comment"># start-to-start with 2 days of lag</span>
<span class="code-variable">dependencies</span> <span class="code-operator">=</span> <span class="code-paren">[</span><span class="code-string">"FF:$(a.id)"</span><span class="code-paren">]</span>   <span class="code-comment"># finish-to-finish: b cannot finish before a does</span></code></pre>
  </div>
</div>

The lag is the number after the `+`. Start-to-start with lag is especially useful for work that *accompanies* other work: fitting a model can start two days after the descriptive analysis started, without waiting for it to end.

### 2.3 CPM: the two passes

`schedule!(p)` runs the **Critical Path Method** — two sweeps over the dependency graph.

The **forward pass** pushes each task to the earliest it can happen:

$$
ES_j = \max_{i \to j} \left( EF_i \right) + 1,
\qquad
EF_j = ES_j + d_j - 1
$$

The **backward pass**, starting from the end of the project, computes the latest each task can happen without delaying the whole:

$$
LF_i = \min_{i \to j} \left( LS_j \right) - 1,
\qquad
LS_i = LF_i - d_i + 1
$$

The difference between the two is the **slack**:

$$
\text{slack}_i = LS_i - ES_i
$$

Tasks with zero slack cannot slip a single day without pushing the delivery: they are the **critical path**. This is exactly the information a picture of a schedule never gives you for free.

One important detail about Perth: `schedule!` only ever pushes tasks forward, never pulls them back. The date you typed acts as a *start-no-earlier-than* constraint. That keeps the engine from inventing a plan that starts earlier than reality allows.

### 2.4 A deadline is not a date

Here is the design decision that changes the experience most. There are two kinds of commitment, and Perth treats each one differently:

- **`deadline`** — a promise made to someone outside (the conference submission, the client delivery). It **never moves a task**. What it does is cap the backward pass: if the plan does not fit, the slack of that task and of everything feeding it goes **negative**. The delay shows up as a number instead of disappearing into a dragged bar.
- **`pinned`** — a contracted date that is no longer negotiable (the meeting already booked, the field-collection day). `schedule!` leaves it alone; if the rest of the plan no longer fits from there, that shows up as an `early_start` later than the task's own start.

### 2.5 Business days

With [BusinessDays.jl](https://github.com/JuliaFinance/BusinessDays.jl) loaded, `set_calendar!(p, "Brazil")` makes the engine count durations in **business days**, national holidays included. A five-day task starting on a Thursday ends the following Wednesday, and November 2nd does not count.

### 2.6 Resources: capacity and effort

Each person can declare a `capacity` — how much work they absorb in one business day — and each task an `effort`, in the same unit. With both numbers, `workload(p)` returns the daily load per person and `overallocations(p)` points at the days where someone was booked beyond what fits. `level!(p)` goes further and reschedules: it pushes whatever has slack until nobody is over capacity, starting with whoever has *the most* slack — so the critical path and anything with a deadline are the last to give way.

### 2.7 PERT: when the duration is a guess

Durations are almost always estimates. PERT formalizes that by asking for three numbers per task — optimistic $o$, most likely $m$, pessimistic $p$ — and summarizing them into an expected duration and a standard deviation:

$$
t_e = \frac{o + 4m + p}{6},
\qquad
\sigma = \frac{p - o}{6}
$$

Variance accumulates along the critical path, and the project finish becomes a distribution rather than a date:

$$
\sigma_{\text{project}} = \sqrt{\sum_{i \,\in\, \text{critical}} \sigma_i^2},
\qquad
P(\text{finish} \le D) = \Phi\!\left( \frac{D - E}{\sigma_{\text{project}}} \right)
$$

Perth implements the classical formula (`pert_finish`, `finish_probability`, `pert_date`) and also a **Monte Carlo simulation** (`pert_simulate`) that samples durations for every estimated task and re-runs the CPM thousands of times. The gap between the two answers is instructive, and we'll watch it appear in the example.

---

## 3. Installation

The package is in the General registry, so:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copy code">
      Copy
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-keyword">using</span> <span class="code-module">Pkg</span>
<span class="code-function">Pkg</span>.<span class="code-function">add</span><span class="code-paren">(</span><span class="code-string">"Perth"</span><span class="code-paren">)</span></code></pre>
  </div>
</div>

Three dependencies are optional and auto-detected — the package works without them and gains features with them:

<div class="perth-table" markdown="1">

| Package | What it enables |
|---|---|
| `BusinessDays` | business-day calendars (`set_calendar!(p, "Brazil")`) |
| `CairoMakie` | static Gantt figures (`ganttplot`, `save_chart`) |
| `QRCoders` | a QR code for the link when you share over the LAN |

</div>

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copy code">
      Copy
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-function">Pkg</span>.<span class="code-function">add</span><span class="code-paren">(</span><span class="code-paren">[</span><span class="code-string">"BusinessDays"</span>, <span class="code-string">"CairoMakie"</span>, <span class="code-string">"QRCoders"</span><span class="code-paren">]</span><span class="code-paren">)</span></code></pre>
  </div>
</div>

To open the interface:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copy code">
      Copy
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-keyword">using</span> <span class="code-module">Perth</span>

<span class="code-function">Perth</span>.<span class="code-function">run</span><span class="code-paren">(</span><span class="code-paren">)</span>          <span class="code-comment"># opens http://localhost:8123 in your browser</span></code></pre>
  </div>
</div>

And a minimal plan, just to get a feel for the API:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copy code">
      Copy
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-keyword">using</span> <span class="code-module">Perth</span>

<span class="code-variable">p</span> <span class="code-operator">=</span> <span class="code-function">create_project</span><span class="code-paren">(</span><span class="code-string">"My first plan"</span><span class="code-paren">)</span>

<span class="code-variable">a</span> <span class="code-operator">=</span> <span class="code-function">add_task!</span><span class="code-paren">(</span><span class="code-variable">p</span>, <span class="code-string">"Write the script"</span>; <span class="code-variable">start</span> <span class="code-operator">=</span> <span class="code-function">Date</span><span class="code-paren">(</span><span class="code-number">2026</span>, <span class="code-number">9</span>, <span class="code-number">1</span><span class="code-paren">)</span>, <span class="code-variable">duration</span> <span class="code-operator">=</span> <span class="code-number">5</span>, <span class="code-variable">assignee</span> <span class="code-operator">=</span> <span class="code-string">"Ana"</span><span class="code-paren">)</span>
<span class="code-variable">b</span> <span class="code-operator">=</span> <span class="code-function">add_task!</span><span class="code-paren">(</span><span class="code-variable">p</span>, <span class="code-string">"Record"</span>;           <span class="code-variable">duration</span> <span class="code-operator">=</span> <span class="code-number">3</span>, <span class="code-variable">dependencies</span> <span class="code-operator">=</span> <span class="code-paren">[</span><span class="code-variable">a</span>.<span class="code-variable">id</span><span class="code-paren">]</span>, <span class="code-variable">assignee</span> <span class="code-operator">=</span> <span class="code-string">"Bruno"</span><span class="code-paren">)</span>
<span class="code-variable">c</span> <span class="code-operator">=</span> <span class="code-function">add_task!</span><span class="code-paren">(</span><span class="code-variable">p</span>, <span class="code-string">"Edit"</span>;             <span class="code-variable">duration</span> <span class="code-operator">=</span> <span class="code-number">4</span>, <span class="code-variable">dependencies</span> <span class="code-operator">=</span> <span class="code-paren">[</span><span class="code-variable">b</span>.<span class="code-variable">id</span><span class="code-paren">]</span>, <span class="code-variable">assignee</span> <span class="code-operator">=</span> <span class="code-string">"Bruno"</span><span class="code-paren">)</span>

<span class="code-function">schedule!</span><span class="code-paren">(</span><span class="code-variable">p</span><span class="code-paren">)</span>
<span class="code-function">project_finish</span><span class="code-paren">(</span><span class="code-variable">p</span><span class="code-paren">)</span></code></pre>
  </div>
</div>

---

## 4. How it works under the hood

The architecture fits in one drawing:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">architecture</div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copy code">
      Copy
    </button>
  </div>

  <div class="code-content">
    <pre><code>REPL  ──►  AppState (in memory + revision counter)  ◄──  HTTP API
             │                                                 ▲
             ▼                                                 │
      JSON in ~/.perth                                Browser (vanilla JS/CSS)
      .perth.jl mirror                                presence over WebSocket</code></pre>
  </div>
</div>

The project state lives in memory, in an `AppState` with a revision counter. The REPL writes to it by calling the API functions; the browser writes to it over HTTP. The revision counter is what lets the browser notice that something changed on the other side and reload — while the WebSocket carries presence (the cursors of everyone else looking at the plan).

On disk, each project is a JSON file in `~/.perth/` (override with the `PERTH_DATA_DIR` variable or with `Perth.run(data_dir = ...)`). Alongside it there is the `.perth.jl` format: the plan written as readable Julia code, designed to live in git and produce diffs a human can actually read:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copy code">
      Copy
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-function">Perth</span>.<span class="code-function">save</span><span class="code-paren">(</span><span class="code-variable">p</span>, <span class="code-string">"plans/study.perth.jl"</span><span class="code-paren">)</span>     <span class="code-comment"># readable text, versionable in git</span>
<span class="code-variable">q</span> <span class="code-operator">=</span> <span class="code-function">Perth</span>.<span class="code-function">load</span><span class="code-paren">(</span><span class="code-string">"plans/study.perth.jl"</span><span class="code-paren">)</span>    <span class="code-comment"># restricted parser, no eval</span>

<span class="code-function">set_file_path!</span><span class="code-paren">(</span><span class="code-variable">p</span>, <span class="code-string">"plans/study.perth.jl"</span><span class="code-paren">)</span> <span class="code-comment"># automatic mirror on every change</span></code></pre>
  </div>
</div>

The `.perth.jl` reader is restricted: it accepts only the package's own constructors (`Project`, `GanttTask`, `Person`, `Date` and a few others) and **does not use `eval`**. Opening a colleague's file does not execute their code.

And since every query function returns Tables.jl rows, the plan talks to the rest of the ecosystem without an adapter:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copy code">
      Copy
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-keyword">using</span> <span class="code-module">CSV</span>, <span class="code-function">DataFrames</span>

<span class="code-function">CSV</span>.<span class="code-function">write</span><span class="code-paren">(</span><span class="code-string">"tasks.csv"</span>, <span class="code-function">DataFrame</span><span class="code-paren">(</span><span class="code-function">tasktable</span><span class="code-paren">(</span><span class="code-variable">p</span><span class="code-paren">)</span><span class="code-paren">)</span><span class="code-paren">)</span>
<span class="code-function">write</span><span class="code-paren">(</span><span class="code-string">"submission.ics"</span>, <span class="code-function">icalendar</span><span class="code-paren">(</span><span class="code-variable">p</span><span class="code-paren">)</span><span class="code-paren">)</span>      <span class="code-comment"># milestones and deadlines in your calendar</span></code></pre>
  </div>
</div>

---

## 5. A real example: a service-times study

Now for the concrete case. An emergency department has approved a study of **service times**: extract the records from the system, describe the times, fit an M/M/c queueing model, simulate staffing scenarios and write the paper. The team has three people. There is one external commitment: the **conference submission on October 30th, 2026**.

The question the schedule has to answer is not "how does this look on a slide". It is: *can we make it?*

### 5.1 The plan

We start with the project, the calendar and the team. Capacities are in hours per business day, and the task efforts will use the same unit:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copy code">
      Copy
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-keyword">using</span> <span class="code-module">BusinessDays</span>, <span class="code-function">Perth</span>

<span class="code-variable">first_day</span> <span class="code-operator">=</span> <span class="code-function">Date</span><span class="code-paren">(</span><span class="code-number">2026</span>, <span class="code-number">9</span>, <span class="code-number">1</span><span class="code-paren">)</span>
<span class="code-variable">p</span> <span class="code-operator">=</span> <span class="code-function">create_project</span><span class="code-paren">(</span><span class="code-string">"Service times study — Emergency department"</span><span class="code-paren">)</span>
<span class="code-function">set_calendar!</span><span class="code-paren">(</span><span class="code-variable">p</span>, <span class="code-string">"Brazil"</span><span class="code-paren">)</span>          <span class="code-comment"># durations are now counted in business days</span>

<span class="code-function">people!</span><span class="code-paren">(</span><span class="code-variable">p</span>, <span class="code-paren">[</span>
    <span class="code-paren">(</span><span class="code-variable">name</span> <span class="code-operator">=</span> <span class="code-string">"Ana"</span>,   <span class="code-variable">role</span> <span class="code-operator">=</span> <span class="code-string">"Coordinator"</span>,  <span class="code-variable">team</span> <span class="code-operator">=</span> <span class="code-string">"Research"</span>, <span class="code-variable">capacity</span> <span class="code-operator">=</span> <span class="code-number">8</span><span class="code-paren">)</span>,
    <span class="code-paren">(</span><span class="code-variable">name</span> <span class="code-operator">=</span> <span class="code-string">"Bruno"</span>, <span class="code-variable">role</span> <span class="code-operator">=</span> <span class="code-string">"Analyst"</span>,      <span class="code-variable">team</span> <span class="code-operator">=</span> <span class="code-string">"Data"</span>,     <span class="code-variable">capacity</span> <span class="code-operator">=</span> <span class="code-number">8</span><span class="code-paren">)</span>,
    <span class="code-paren">(</span><span class="code-variable">name</span> <span class="code-operator">=</span> <span class="code-string">"Clara"</span>, <span class="code-variable">role</span> <span class="code-operator">=</span> <span class="code-string">"Statistician"</span>, <span class="code-variable">team</span> <span class="code-operator">=</span> <span class="code-string">"Research"</span>, <span class="code-variable">capacity</span> <span class="code-operator">=</span> <span class="code-number">8</span><span class="code-paren">)</span>,
<span class="code-paren">]</span><span class="code-paren">)</span></code></pre>
  </div>
</div>

The first phase — collection and preparation. Note that every task is created on `first_day`: it is the `schedule!` at the end that spreads them out along the dependencies.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copy code">
      Copy
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-variable">f1</span> <span class="code-operator">=</span> <span class="code-function">add_task!</span><span class="code-paren">(</span><span class="code-variable">p</span>, <span class="code-string">"1. Collection and preparation"</span>; <span class="code-variable">start</span> <span class="code-operator">=</span> <span class="code-variable">first_day</span><span class="code-paren">)</span>

<span class="code-variable">ethics</span> <span class="code-operator">=</span> <span class="code-function">add_task!</span><span class="code-paren">(</span><span class="code-variable">p</span>, <span class="code-string">"Protocol and ethics committee approval"</span>;
    <span class="code-variable">start</span> <span class="code-operator">=</span> <span class="code-variable">first_day</span>, <span class="code-variable">duration</span> <span class="code-operator">=</span> <span class="code-number">10</span>, <span class="code-variable">assignee</span> <span class="code-operator">=</span> <span class="code-string">"Ana"</span>, <span class="code-variable">parent</span> <span class="code-operator">=</span> <span class="code-variable">f1</span>.<span class="code-variable">id</span>, <span class="code-variable">effort</span> <span class="code-operator">=</span> <span class="code-number">20</span><span class="code-paren">)</span>

<span class="code-variable">extract</span> <span class="code-operator">=</span> <span class="code-function">add_task!</span><span class="code-paren">(</span><span class="code-variable">p</span>, <span class="code-string">"Extract records from the system"</span>;
    <span class="code-variable">start</span> <span class="code-operator">=</span> <span class="code-variable">first_day</span>, <span class="code-variable">duration</span> <span class="code-operator">=</span> <span class="code-number">3</span>, <span class="code-variable">assignee</span> <span class="code-operator">=</span> <span class="code-string">"Bruno"</span>, <span class="code-variable">parent</span> <span class="code-operator">=</span> <span class="code-variable">f1</span>.<span class="code-variable">id</span>,
    <span class="code-variable">dependencies</span> <span class="code-operator">=</span> <span class="code-paren">[</span><span class="code-variable">ethics</span>.<span class="code-variable">id</span><span class="code-paren">]</span>, <span class="code-variable">effort</span> <span class="code-operator">=</span> <span class="code-number">18</span><span class="code-paren">)</span>

<span class="code-variable">clean</span> <span class="code-operator">=</span> <span class="code-function">add_task!</span><span class="code-paren">(</span><span class="code-variable">p</span>, <span class="code-string">"Clean and consistency-check the data"</span>;
    <span class="code-variable">start</span> <span class="code-operator">=</span> <span class="code-variable">first_day</span>, <span class="code-variable">duration</span> <span class="code-operator">=</span> <span class="code-number">5</span>, <span class="code-variable">assignee</span> <span class="code-operator">=</span> <span class="code-string">"Bruno"</span>, <span class="code-variable">parent</span> <span class="code-operator">=</span> <span class="code-variable">f1</span>.<span class="code-variable">id</span>,
    <span class="code-variable">dependencies</span> <span class="code-operator">=</span> <span class="code-paren">[</span><span class="code-variable">extract</span>.<span class="code-variable">id</span><span class="code-paren">]</span>, <span class="code-variable">effort</span> <span class="code-operator">=</span> <span class="code-number">30</span><span class="code-paren">)</span>

<span class="code-variable">dataset</span> <span class="code-operator">=</span> <span class="code-function">add_task!</span><span class="code-paren">(</span><span class="code-variable">p</span>, <span class="code-string">"Dataset ready"</span>;
    <span class="code-variable">start</span> <span class="code-operator">=</span> <span class="code-variable">first_day</span>, <span class="code-variable">milestone</span> <span class="code-operator">=</span> <span class="code-builtin">true</span>, <span class="code-variable">parent</span> <span class="code-operator">=</span> <span class="code-variable">f1</span>.<span class="code-variable">id</span>, <span class="code-variable">dependencies</span> <span class="code-operator">=</span> <span class="code-paren">[</span><span class="code-variable">clean</span>.<span class="code-variable">id</span><span class="code-paren">]</span><span class="code-paren">)</span></code></pre>
  </div>
</div>

The second phase. Here the start-to-start link with lag shows up: fitting the model starts two days after the descriptive analysis started, because the two feed each other. And the literature review is a parallel branch that only has to be ready in time for the writing:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copy code">
      Copy
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-variable">f2</span> <span class="code-operator">=</span> <span class="code-function">add_task!</span><span class="code-paren">(</span><span class="code-variable">p</span>, <span class="code-string">"2. Analysis"</span>; <span class="code-variable">start</span> <span class="code-operator">=</span> <span class="code-variable">first_day</span><span class="code-paren">)</span>

<span class="code-variable">descriptive</span> <span class="code-operator">=</span> <span class="code-function">add_task!</span><span class="code-paren">(</span><span class="code-variable">p</span>, <span class="code-string">"Descriptive analysis of service times"</span>;
    <span class="code-variable">start</span> <span class="code-operator">=</span> <span class="code-variable">first_day</span>, <span class="code-variable">duration</span> <span class="code-operator">=</span> <span class="code-number">4</span>, <span class="code-variable">assignee</span> <span class="code-operator">=</span> <span class="code-string">"Clara"</span>, <span class="code-variable">parent</span> <span class="code-operator">=</span> <span class="code-variable">f2</span>.<span class="code-variable">id</span>,
    <span class="code-variable">dependencies</span> <span class="code-operator">=</span> <span class="code-paren">[</span><span class="code-variable">dataset</span>.<span class="code-variable">id</span><span class="code-paren">]</span>, <span class="code-variable">effort</span> <span class="code-operator">=</span> <span class="code-number">24</span><span class="code-paren">)</span>

<span class="code-variable">model</span> <span class="code-operator">=</span> <span class="code-function">add_task!</span><span class="code-paren">(</span><span class="code-variable">p</span>, <span class="code-string">"Fit the M/M/c queueing model"</span>;
    <span class="code-variable">start</span> <span class="code-operator">=</span> <span class="code-variable">first_day</span>, <span class="code-variable">duration</span> <span class="code-operator">=</span> <span class="code-number">6</span>, <span class="code-variable">assignee</span> <span class="code-operator">=</span> <span class="code-string">"Clara"</span>, <span class="code-variable">parent</span> <span class="code-operator">=</span> <span class="code-variable">f2</span>.<span class="code-variable">id</span>,
    <span class="code-variable">dependencies</span> <span class="code-operator">=</span> <span class="code-paren">[</span><span class="code-string">"SS:$(descriptive.id)+2"</span><span class="code-paren">]</span>, <span class="code-variable">effort</span> <span class="code-operator">=</span> <span class="code-number">42</span><span class="code-paren">)</span>

<span class="code-variable">simulation</span> <span class="code-operator">=</span> <span class="code-function">add_task!</span><span class="code-paren">(</span><span class="code-variable">p</span>, <span class="code-string">"Simulate staffing scenarios"</span>;
    <span class="code-variable">start</span> <span class="code-operator">=</span> <span class="code-variable">first_day</span>, <span class="code-variable">duration</span> <span class="code-operator">=</span> <span class="code-number">5</span>, <span class="code-variable">assignee</span> <span class="code-operator">=</span> <span class="code-string">"Bruno"</span>, <span class="code-variable">parent</span> <span class="code-operator">=</span> <span class="code-variable">f2</span>.<span class="code-variable">id</span>,
    <span class="code-variable">dependencies</span> <span class="code-operator">=</span> <span class="code-paren">[</span><span class="code-variable">model</span>.<span class="code-variable">id</span><span class="code-paren">]</span>, <span class="code-variable">effort</span> <span class="code-operator">=</span> <span class="code-number">30</span><span class="code-paren">)</span>

<span class="code-variable">literature</span> <span class="code-operator">=</span> <span class="code-function">add_task!</span><span class="code-paren">(</span><span class="code-variable">p</span>, <span class="code-string">"Literature review"</span>;
    <span class="code-variable">start</span> <span class="code-operator">=</span> <span class="code-variable">first_day</span>, <span class="code-variable">duration</span> <span class="code-operator">=</span> <span class="code-number">6</span>, <span class="code-variable">assignee</span> <span class="code-operator">=</span> <span class="code-string">"Ana"</span>, <span class="code-variable">parent</span> <span class="code-operator">=</span> <span class="code-variable">f2</span>.<span class="code-variable">id</span>,
    <span class="code-variable">dependencies</span> <span class="code-operator">=</span> <span class="code-paren">[</span><span class="code-variable">dataset</span>.<span class="code-variable">id</span><span class="code-paren">]</span>, <span class="code-variable">effort</span> <span class="code-operator">=</span> <span class="code-number">18</span><span class="code-paren">)</span></code></pre>
  </div>
</div>

The third phase, with the conference deadline attached to the final milestone:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copy code">
      Copy
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-variable">f3</span> <span class="code-operator">=</span> <span class="code-function">add_task!</span><span class="code-paren">(</span><span class="code-variable">p</span>, <span class="code-string">"3. Communication"</span>; <span class="code-variable">start</span> <span class="code-operator">=</span> <span class="code-variable">first_day</span><span class="code-paren">)</span>

<span class="code-variable">writing</span> <span class="code-operator">=</span> <span class="code-function">add_task!</span><span class="code-paren">(</span><span class="code-variable">p</span>, <span class="code-string">"Write the paper"</span>;
    <span class="code-variable">start</span> <span class="code-operator">=</span> <span class="code-variable">first_day</span>, <span class="code-variable">duration</span> <span class="code-operator">=</span> <span class="code-number">8</span>, <span class="code-variable">assignee</span> <span class="code-operator">=</span> <span class="code-string">"Ana"</span>, <span class="code-variable">parent</span> <span class="code-operator">=</span> <span class="code-variable">f3</span>.<span class="code-variable">id</span>,
    <span class="code-variable">dependencies</span> <span class="code-operator">=</span> <span class="code-paren">[</span><span class="code-variable">descriptive</span>.<span class="code-variable">id</span>, <span class="code-variable">simulation</span>.<span class="code-variable">id</span>, <span class="code-variable">literature</span>.<span class="code-variable">id</span><span class="code-paren">]</span>, <span class="code-variable">effort</span> <span class="code-operator">=</span> <span class="code-number">48</span><span class="code-paren">)</span>

<span class="code-variable">review</span> <span class="code-operator">=</span> <span class="code-function">add_task!</span><span class="code-paren">(</span><span class="code-variable">p</span>, <span class="code-string">"Internal review"</span>;
    <span class="code-variable">start</span> <span class="code-operator">=</span> <span class="code-variable">first_day</span>, <span class="code-variable">duration</span> <span class="code-operator">=</span> <span class="code-number">3</span>, <span class="code-variable">assignee</span> <span class="code-operator">=</span> <span class="code-string">"Clara"</span>, <span class="code-variable">parent</span> <span class="code-operator">=</span> <span class="code-variable">f3</span>.<span class="code-variable">id</span>,
    <span class="code-variable">dependencies</span> <span class="code-operator">=</span> <span class="code-paren">[</span><span class="code-variable">writing</span>.<span class="code-variable">id</span><span class="code-paren">]</span>, <span class="code-variable">effort</span> <span class="code-operator">=</span> <span class="code-number">15</span><span class="code-paren">)</span>

<span class="code-variable">submission</span> <span class="code-operator">=</span> <span class="code-function">add_task!</span><span class="code-paren">(</span><span class="code-variable">p</span>, <span class="code-string">"Conference submission"</span>;
    <span class="code-variable">start</span> <span class="code-operator">=</span> <span class="code-variable">first_day</span>, <span class="code-variable">milestone</span> <span class="code-operator">=</span> <span class="code-builtin">true</span>, <span class="code-variable">parent</span> <span class="code-operator">=</span> <span class="code-variable">f3</span>.<span class="code-variable">id</span>,
    <span class="code-variable">dependencies</span> <span class="code-operator">=</span> <span class="code-paren">[</span><span class="code-variable">review</span>.<span class="code-variable">id</span><span class="code-paren">]</span>, <span class="code-variable">deadline</span> <span class="code-operator">=</span> <span class="code-function">Date</span><span class="code-paren">(</span><span class="code-number">2026</span>, <span class="code-number">10</span>, <span class="code-number">30</span><span class="code-paren">)</span><span class="code-paren">)</span>

<span class="code-function">schedule!</span><span class="code-paren">(</span><span class="code-variable">p</span><span class="code-paren">)</span></code></pre>
  </div>
</div>

### 5.2 The first question

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copy code">
      Copy
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-function">project_finish</span><span class="code-paren">(</span><span class="code-variable">p</span><span class="code-paren">)</span></code></pre>
  </div>
</div>

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">output</div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copy code">
      Copy
    </button>
  </div>

  <div class="code-content">
    <pre><code>2026-11-04</code></pre>
  </div>
</div>

The plan finishes on **November 4th**. The conference closes on **October 30th**. We already have a problem — and, more importantly, we have a *measured* problem.

<figure style="display: flex; flex-direction: column; align-items: center; margin: 2.5em 0 2em 0;">
  <img src="/assets/images/perth-gantt-study-en.png" alt="Gantt chart of the service-times study, with the three phases, the task bars, the dependency arrows and the critical tasks outlined in red" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.07);" />
  <figcaption class="img-caption-contrast">
    <strong>Figure 2:</strong> the same plan rendered with <code>save_chart(p, "gantt-study.png")</code>, through CairoMakie. Bars outlined in red are on the critical path; the only one without an outline is the literature review.
  </figcaption>
</figure>

### 5.3 Where the slack is

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copy code">
      Copy
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-keyword">using</span> <span class="code-module">DataFrames</span>

<span class="code-function">DataFrame</span><span class="code-paren">(</span><span class="code-function">slack</span><span class="code-paren">(</span><span class="code-variable">p</span><span class="code-paren">)</span><span class="code-paren">)</span></code></pre>
  </div>
</div>

<div class="perth-table" markdown="1">

| Task | Early start | Early finish | Slack | Critical | Bottleneck |
|---|---|---|---|---|---|
| Protocol and ethics committee approval | 2026-09-01 | 2026-09-15 | −2 | yes | no |
| Extract records from the system | 2026-09-16 | 2026-09-18 | −2 | yes | no |
| Clean and consistency-check the data | 2026-09-21 | 2026-09-25 | −2 | yes | no |
| Dataset ready | 2026-09-28 | 2026-09-28 | −2 | yes | **yes** |
| Descriptive analysis of service times | 2026-09-29 | 2026-10-02 | −2 | yes | **yes** |
| Literature review | 2026-09-29 | 2026-10-06 | **5** | no | no |
| Fit the M/M/c queueing model | 2026-10-01 | 2026-10-08 | −2 | yes | no |
| Simulate staffing scenarios | 2026-10-09 | 2026-10-16 | −2 | yes | no |
| Write the paper | 2026-10-19 | 2026-10-28 | −2 | yes | no |
| Internal review | 2026-10-29 | 2026-11-03 | −2 | yes | no |
| Conference submission | 2026-11-04 | 2026-11-04 | −2 | yes | no |

</div>

Three readings of that table:

**Negative slack is the deadline talking.** No task was moved because of the `deadline` — the plan is exactly the same one. What changed is that the backward pass now has a ceiling: October 30th. The entire chain feeding the submission is **two business days late**, and the number shows up on every row, not just the last one.

**Exactly one task has slack.** The literature review can slip five business days with no consequence at all. It is the only thing in the plan that can be deprioritized for free — and that was not obvious from looking at the Gantt.

**The bottleneck has a name.** The `bottleneck` column flags critical tasks that more than one other task depends on. "Dataset ready" and "Descriptive analysis" are the two points where a delay propagates down two paths instead of one. Those are the places to watch *before* something happens.

And the delay, in calendar days:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copy code">
      Copy
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-function">deadline_slip</span><span class="code-paren">(</span><span class="code-variable">p</span><span class="code-paren">)</span></code></pre>
  </div>
</div>

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">output</div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copy code">
      Copy
    </button>
  </div>

  <div class="code-content">
    <pre><code>1-element Vector{NamedTuple}:
 (id = "93a7d306", name = "Conference submission", deadline = Date("2026-10-30"),
  finish = Date("2026-11-04"), slip_days = 5)</code></pre>
  </div>
</div>

Note the difference between the two numbers: slack is **−2 business days** and the slip is **5 calendar days**. There is no contradiction — between October 30th (a Friday) and November 4th there are five calendar days but only two working ones, because November 2nd is a holiday. CPM slack is measured in the project's calendar; the slip, in the calendar of real life.

### 5.4 Who is overloaded

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copy code">
      Copy
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-function">overallocations</span><span class="code-paren">(</span><span class="code-variable">p</span><span class="code-paren">)</span></code></pre>
  </div>
</div>

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">output</div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copy code">
      Copy
    </button>
  </div>

  <div class="code-content">
    <pre><code>1-element Vector{NamedTuple}:
 (assignee = "Clara",
  task1 = "026b2caf", task1_name = "Descriptive analysis of service times",
  task2 = "4b5172e8", task2_name = "Fit the M/M/c queueing model",
  from = Date("2026-10-01"), to = Date("2026-10-02"))</code></pre>
  </div>
</div>

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copy code">
      Copy
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-function">filter</span><span class="code-paren">(</span><span class="code-variable">r</span> <span class="code-operator">-&gt;</span> <span class="code-variable">r</span>.<span class="code-variable">assignee</span> <span class="code-operator">=</span><span class="code-operator">=</span> <span class="code-string">"Clara"</span>, <span class="code-function">workload</span><span class="code-paren">(</span><span class="code-variable">p</span><span class="code-paren">)</span><span class="code-paren">)</span> <span class="code-operator">|</span><span class="code-operator">&gt;</span> <span class="code-function">DataFrame</span></code></pre>
  </div>
</div>

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">output</div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copy code">
      Copy
    </button>
  </div>

  <div class="code-content">
    <pre><code>  assignee   date        tasks   effort   capacity   over
  Clara      2026-09-29      1      6.0        8.0    false
  Clara      2026-09-30      1      6.0        8.0    false
  Clara      2026-10-01      2     13.0        8.0    true
  Clara      2026-10-02      2     13.0        8.0    true
  Clara      2026-10-05      1      7.0        8.0    false
  ...</code></pre>
  </div>
</div>

Clara's capacity is 8 hours per business day. On October 1st and 2nd, the descriptive analysis (6 h/day) and the model fitting (7 h/day) overlap: **13 hours in an 8-hour day**. We created that overlap ourselves when we wrote `"SS:$(descriptive.id)+2"` — the start-to-start link is convenient for the schedule and uncomfortable for whoever does the work. The plan looked reasonable; the arithmetic does not add up.

### 5.5 What if the duration is a guess?

So far we have treated durations as facts. They are not. "Ethics committee approval in 10 days" is institutionalized optimism, and "extract the records in 3 days" depends on an IT department nobody controls. Let's declare the three points:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copy code">
      Copy
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-function">set_estimate!</span><span class="code-paren">(</span><span class="code-variable">p</span>, <span class="code-variable">ethics</span>.<span class="code-variable">id</span>,   <span class="code-number">8</span>, <span class="code-number">10</span>, <span class="code-number">20</span><span class="code-paren">)</span>   <span class="code-comment"># optimistic, most likely, pessimistic</span>
<span class="code-function">set_estimate!</span><span class="code-paren">(</span><span class="code-variable">p</span>, <span class="code-variable">extract</span>.<span class="code-variable">id</span>,  <span class="code-number">2</span>,  <span class="code-number">3</span>, <span class="code-number">10</span><span class="code-paren">)</span>
<span class="code-function">set_estimate!</span><span class="code-paren">(</span><span class="code-variable">p</span>, <span class="code-variable">model</span>.<span class="code-variable">id</span>,    <span class="code-number">4</span>,  <span class="code-number">6</span>, <span class="code-number">14</span><span class="code-paren">)</span>
<span class="code-function">set_estimate!</span><span class="code-paren">(</span><span class="code-variable">p</span>, <span class="code-variable">writing</span>.<span class="code-variable">id</span>,  <span class="code-number">5</span>,  <span class="code-number">8</span>, <span class="code-number">15</span><span class="code-paren">)</span>

<span class="code-function">schedule!</span><span class="code-paren">(</span><span class="code-variable">p</span><span class="code-paren">)</span>
<span class="code-function">pert</span><span class="code-paren">(</span><span class="code-variable">p</span><span class="code-paren">)</span> <span class="code-operator">|</span><span class="code-operator">&gt;</span> <span class="code-function">DataFrame</span></code></pre>
  </div>
</div>

<div class="perth-table" markdown="1">

| Task | $o$ | $m$ | $p$ | $t_e$ | $\sigma$ | Duration in plan |
|---|---|---|---|---|---|---|
| Protocol and ethics committee approval | 8 | 10 | 20 | 11.33 | 2.00 | 11 |
| Extract records from the system | 2 | 3 | 10 | 4.00 | 1.33 | 4 |
| Fit the M/M/c queueing model | 4 | 6 | 14 | 7.00 | 1.67 | 7 |
| Write the paper | 5 | 8 | 15 | 8.67 | 1.67 | 9 |

</div>

By default `set_estimate!` already applies the expected duration to the plan (pass `apply = false` to record the estimate without touching it). And that alone delivers a message: **the original plan was optimistic on every estimated task**. The pessimistic tails are long enough to pull each $t_e$ above the "most likely" value we had typed.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copy code">
      Copy
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-function">pert_finish</span><span class="code-paren">(</span><span class="code-variable">p</span><span class="code-paren">)</span></code></pre>
  </div>
</div>

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">output</div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copy code">
      Copy
    </button>
  </div>

  <div class="code-content">
    <pre><code>(expected = Date("2026-11-10"), sd_days = 3.3665, variance = 11.333,
 critical = 10, estimated = 4)</code></pre>
  </div>
</div>

The expected finish slid from November 4th to **November 10th**, with a standard deviation of 3.4 days. Now we can ask the question that matters:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copy code">
      Copy
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-function">finish_probability</span><span class="code-paren">(</span><span class="code-variable">p</span>, <span class="code-function">Date</span><span class="code-paren">(</span><span class="code-number">2026</span>, <span class="code-number">10</span>, <span class="code-number">30</span><span class="code-paren">)</span><span class="code-paren">)</span>   <span class="code-comment"># the date we promised</span>
<span class="code-function">finish_probability</span><span class="code-paren">(</span><span class="code-variable">p</span>, <span class="code-function">Date</span><span class="code-paren">(</span><span class="code-number">2026</span>, <span class="code-number">11</span>, <span class="code-number">20</span><span class="code-paren">)</span><span class="code-paren">)</span>
<span class="code-function">pert_date</span><span class="code-paren">(</span><span class="code-variable">p</span>, <span class="code-number">0.8</span><span class="code-paren">)</span>                          <span class="code-comment"># the date we can actually promise</span></code></pre>
  </div>
</div>

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">output</div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copy code">
      Copy
    </button>
  </div>

  <div class="code-content">
    <pre><code>0.0005
0.9985
2026-11-13</code></pre>
  </div>
</div>

The probability of meeting the October 30th deadline is **0.05%**. That is not "hard": that is no. And the date we can promise with 80% confidence is **November 13th** — two weeks past what was agreed. That is the number to bring to the advisor or the client, because it is not an opinion about somebody's optimism.

It is also worth comparing the formula against the simulation:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copy code">
      Copy
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-variable">sim</span> <span class="code-operator">=</span> <span class="code-function">pert_simulate</span><span class="code-paren">(</span><span class="code-variable">p</span>; <span class="code-variable">n</span> <span class="code-operator">=</span> <span class="code-number">10_000</span><span class="code-paren">)</span>

<span class="code-paren">(</span><span class="code-variable">sim</span>.<span class="code-variable">p10</span>, <span class="code-variable">sim</span>.<span class="code-variable">p50</span>, <span class="code-variable">sim</span>.<span class="code-variable">p80</span>, <span class="code-variable">sim</span>.<span class="code-variable">p90</span><span class="code-paren">)</span></code></pre>
  </div>
</div>

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">output</div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copy code">
      Copy
    </button>
  </div>

  <div class="code-content">
    <pre><code>(Date("2026-11-10"), Date("2026-11-11"), Date("2026-11-16"), Date("2026-11-17"))</code></pre>
  </div>
</div>

The classical formula puts P80 on **November 13th**; Monte Carlo puts it on **November 16th**. The difference has a name: **merge bias**. The formula propagates variance only along today's critical path; the simulation samples every path, and a parallel branch with little slack and a wide estimate has a real chance of becoming critical. Whenever there are near-critical paths, the formula is optimistic — and the size of that gap is a direct measure of how much the plan depends on everything going right in parallel.

### 5.6 What changes if that slips?

The question from the top of the post, now answered in two lines:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copy code">
      Copy
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-function">update_task!</span><span class="code-paren">(</span><span class="code-variable">p</span>, <span class="code-variable">extract</span>.<span class="code-variable">id</span>; <span class="code-variable">duration</span> <span class="code-operator">=</span> <span class="code-number">8</span><span class="code-paren">)</span>   <span class="code-comment"># the extraction got stuck in IT</span>
<span class="code-function">schedule!</span><span class="code-paren">(</span><span class="code-variable">p</span><span class="code-paren">)</span>

<span class="code-function">project_finish</span><span class="code-paren">(</span><span class="code-variable">p</span><span class="code-paren">)</span>
<span class="code-function">deadline_slip</span><span class="code-paren">(</span><span class="code-variable">p</span><span class="code-paren">)</span></code></pre>
  </div>
</div>

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">output</div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copy code">
      Copy
    </button>
  </div>

  <div class="code-content">
    <pre><code>2026-11-16

1-element Vector{NamedTuple}:
 (id = "93a7d306", name = "Conference submission", deadline = Date("2026-10-30"),
  finish = Date("2026-11-16"), slip_days = 17)</code></pre>
  </div>
</div>

The extraction going from 3 to 8 days pushes the submission to November 16th: **17 days late** against the deadline. `update_task!` walked the whole chain without anyone redrawing anything.

This is where Perth stops being a Gantt drawer. The schedule answers because it is data, not a picture.

### 5.7 Taking the plan to the team

With the plan settled, `Perth.run()` opens the same thing in the browser — and if the team is on the same network, you can share it:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copy code">
      Copy
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-function">Perth</span>.<span class="code-function">run</span><span class="code-paren">(</span><span class="code-variable">share</span> <span class="code-operator">=</span> <span class="code-builtin">true</span><span class="code-paren">)</span>         <span class="code-comment"># publish the Gantt on the LAN, with a QR code</span>
<span class="code-function">Perth</span>.<span class="code-function">key!</span><span class="code-paren">(</span><span class="code-string">"study-2026"</span><span class="code-paren">)</span>        <span class="code-comment"># require an access key to edit</span>
<span class="code-function">Perth</span>.<span class="code-function">view_key!</span><span class="code-paren">(</span><span class="code-string">"study-2026-v"</span><span class="code-paren">)</span> <span class="code-comment"># read-only link, the one you hand to your advisor</span>
<span class="code-function">Perth</span>.<span class="code-function">share!</span><span class="code-paren">(</span><span class="code-builtin">false</span><span class="code-paren">)</span>             <span class="code-comment"># stop broadcasting without restarting the server</span></code></pre>
  </div>
</div>

Every connected machine appears as a cursor labelled with its name and IP, pair-programming style, and there is a built-in chat. You can also turn the plan into a Kanban board:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copy code">
      Copy
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-function">kanban_from_project!</span><span class="code-paren">(</span><span class="code-variable">p</span><span class="code-paren">)</span>         <span class="code-comment"># every task in the plan becomes a card</span>
<span class="code-function">Perth</span>.<span class="code-function">kanban</span><span class="code-paren">(</span><span class="code-variable">share</span> <span class="code-operator">=</span> <span class="code-builtin">true</span><span class="code-paren">)</span>      <span class="code-comment"># collaborative board on the local network</span></code></pre>
  </div>
</div>

Cards created from the plan stay **linked** to the task they came from: dragging a card to *done* completes the corresponding Gantt task, live.

And the figure from section 5.2 takes two lines:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copy code">
      Copy
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-keyword">using</span> <span class="code-module">CairoMakie</span>

<span class="code-function">save_chart</span><span class="code-paren">(</span><span class="code-variable">p</span>, <span class="code-string">"gantt-study.png"</span><span class="code-paren">)</span></code></pre>
  </div>
</div>

---

## 6. What Perth.jl is not

Being honest about the limits saves frustration:

- **It is not multi-user by identity.** Access control is by network and by key, not by login. Two people editing the same field resolve as *last write wins*.
- **It should not be exposed to the internet.** It is a LAN tool, for a room of people who already trust each other. Do not put port 8123 on a public IP.
- **It does not level resources automatically.** `level!` exists and is a defensible heuristic (least slack first), but levelling is NP-hard: the result is good, not optimal.
- **It does not replace MS Project or Primavera** in organizations that need corporate governance, multiple calendars per resource and a formal audit trail. The target is different: people already working in Julia who want the schedule to be one more object in the workspace.

---

## 7. Where to go next

Perth.jl is in the General registry (`] add Perth`), and the code, the commented examples and the changelog live in the repository:

- **Repository:** [github.com/dantebertuzzi/Perth.jl](https://github.com/dantebertuzzi/Perth.jl)
- **Announcement and discussion:** [the Julia Discourse thread](https://discourse.julialang.org/t/ann-perth-jl-project-schedules-you-can-compute-on-with-a-browser-ui-attached/138797)
- **Package:** [Perth on JuliaHub](https://juliahub.com/ui/Packages/General/Perth)

Suggestions, questions and reports from real use are very welcome — open an issue on the repository or leave a comment below.
