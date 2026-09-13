/* dσilystats – application logic */

(function () {
  "use strict";

  const ROLLOVER_HOUR = 6; // Monday 6 AM

  function getYYYYMMDD(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function getMondayOf(date) {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    return d;
  }

  function getProblemWeekStart(now) {
    const monday = getMondayOf(now);
    if (now.getDay() === 1 && now.getHours() < ROLLOVER_HOUR) {
      monday.setDate(monday.getDate() - 7);
    }
    return monday;
  }

  function getNextRollover(now) {
    const monday = getMondayOf(now);
    monday.setHours(ROLLOVER_HOUR, 0, 0, 0);
    if (now >= monday) monday.setDate(monday.getDate() + 7);
    return monday;
  }

  // Monday of the week that shows W01; each following week shows the next problem
  const FIRST_PROBLEM_WEEK = { year: 2026, month: 9, day: 7 };

  function weeksSinceFirstProblem(date) {
    const start = Date.UTC(FIRST_PROBLEM_WEEK.year, FIRST_PROBLEM_WEEK.month - 1, FIRST_PROBLEM_WEEK.day);
    const monday = getMondayOf(date);
    const current = Date.UTC(monday.getFullYear(), monday.getMonth(), monday.getDate());
    return Math.round((current - start) / (7 * 86400000));
  }

  function pickProblemForDate(date) {
    const problems = window.WEEKLY_PROBLEMS || [];
    const n = problems.length;
    const idx = ((weeksSinceFirstProblem(date) % n) + n) % n;
    return problems[idx];
  }

  function formatTimeLeft(ms) {
    if (ms <= 0) return "New problem soon";
    const s = Math.floor(ms / 1000) % 60;
    const m = Math.floor(ms / 60000) % 60;
    const h = Math.floor(ms / 3600000) % 24;
    const d = Math.floor(ms / 86400000);
    if (d > 0) return `Next in ${d}d ${h}h ${m}m ${s}s`;
    if (h > 0) return `Next in ${h}h ${m}m ${s}s`;
    if (m > 0) return `Next in ${m}m ${s}s`;
    return `Next in ${s}s`;
  }

  function renderProblem(problem, dateStr) {
    document.getElementById("todayLabel").textContent = dateStr;
    document.getElementById("problemId").textContent = `problem ${problem.id}`;
    document.getElementById("problemTitle").textContent = problem.title;
    document.getElementById("problemStatement").innerHTML = problem.statement.trim();
    document.getElementById("problemHint").innerHTML = (problem.hint || "").trim();
    document.getElementById("problemSolution").innerHTML = (problem.solution || "").trim();

    document.getElementById("hintBox").style.display = problem.hint ? "block" : "none";
    document.getElementById("solutionBox").style.display = problem.solution ? "block" : "none";

    if (window.MathJax && window.MathJax.typesetPromise) {
      MathJax.typesetPromise();
    }
  }

  function updateTimeLeft() {
    const now = new Date();
    const next = getNextRollover(now);
    const ms = next - now;
    document.getElementById("timeLeft").textContent = formatTimeLeft(ms);
  }

  const THEME_KEY = "dailystats.theme";
  let themeToggle;
  let sunIcon;
  let moonIcon;
  let footerLogo;

  function updateThemeIcons(mode) {
    const isDark = mode === "dark";
    sunIcon.style.display = isDark ? "none" : "block";
    moonIcon.style.display = isDark ? "block" : "none";
    themeToggle.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
    themeToggle.title = isDark ? "theme: dark" : "theme: light";
    if (footerLogo) footerLogo.src = isDark ? "../images/mklogo.png" : "../images/mklogo-black.png";
  }

  function setTheme(mode) {
    document.documentElement.setAttribute("data-theme", mode);
    updateThemeIcons(mode);
  }

  function getInitialTheme() {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "light" || stored === "dark") return stored;
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "dark" : "light";
  }

  function toggleTheme() {
    const cur = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    const next = cur === "dark" ? "light" : "dark";
    localStorage.setItem(THEME_KEY, next);
    setTheme(next);
  }

  function init() {
    themeToggle = document.getElementById("themeToggle");
    sunIcon = document.getElementById("sunIcon");
    moonIcon = document.getElementById("moonIcon");
    footerLogo = document.getElementById("footerLogo");

    const now = new Date();
    const maxAllowed = getProblemWeekStart(now);

    const params = new URLSearchParams(location.search);
    const dateParam = params.get("date");
    let problemDate;
    if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      const [y, m, d] = dateParam.split("-").map(Number);
      const requestedMonday = getMondayOf(new Date(y, m - 1, d));
      problemDate = requestedMonday > maxAllowed ? maxAllowed : requestedMonday;
    } else {
      problemDate = getProblemWeekStart(now);
    }
    const dateStr = getYYYYMMDD(problemDate);

    setTheme(getInitialTheme());

    const problem = pickProblemForDate(problemDate);
    renderProblem(problem, dateStr);

    updateTimeLeft();
    setInterval(updateTimeLeft, 1000);

    themeToggle.addEventListener("click", toggleTheme);

    document.getElementById("copyLink").addEventListener("click", async function (e) {
      e.preventDefault();
      const url = new URL(location.href);
      url.searchParams.set("date", dateStr);
      try {
        await navigator.clipboard.writeText(url.toString());
        const label = document.getElementById("copyLinkLabel");
        label.textContent = "link copied ✓";
        setTimeout(function () {
          label.textContent = "copy problem link";
        }, 1500);
      } catch (err) {
        prompt("Copy the link:", url.toString());
      }
    });

    const url = new URL(location.href);
    if (url.searchParams.get("date") !== dateStr) {
      url.searchParams.set("date", dateStr);
      history.replaceState(null, "", url.toString());
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
