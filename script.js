const API = "https://api.github.com";

const form = document.getElementById("searchForm");
const input = document.getElementById("username");
const statusEl = document.getElementById("status");
const result = document.getElementById("result");

const LANG_COLORS = {
  JavaScript: "#f1e05a", TypeScript: "#3178c6", Python: "#4b8bbe", HTML: "#e34c26",
  CSS: "#7b5cd6", Java: "#e76f51", C: "#8d99ae", "C++": "#f34b7d", "C#": "#2fa14a",
  Go: "#00add8", Rust: "#dea584", PHP: "#8892bf", Ruby: "#cc342d", Shell: "#89e051",
  Kotlin: "#a97bff", Swift: "#f05138", Dart: "#00b4ab", Jupyter: "#da5b0b"
};
const FALLBACK = ["#5eead4", "#fda4af", "#a5b4fc", "#fcd34d", "#86efac", "#f9a8d4"];

function setStatus(msg, isError = false) {
  statusEl.textContent = msg;
  statusEl.classList.toggle("error", isError);
}

async function getJSON(url) {
  const res = await fetch(url, { headers: { Accept: "application/vnd.github+json" } });
  if (res.status === 404) throw new Error("User not found. Check the spelling and try again.");
  if (res.status === 403) throw new Error("GitHub rate limit reached. Wait a few minutes and try again.");
  if (!res.ok) throw new Error("Something went wrong. Please try again.");
  return res.json();
}

function fmt(n) {
  return n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1) + "k" : String(n);
}

async function analyze(username) {
  result.hidden = true;
  setStatus("Loading profile...");
  try {
    const user = await getJSON(`${API}/users/${encodeURIComponent(username)}`);
    const repos = await getJSON(`${API}/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`);
    showProfile(user, repos);
    setStatus("");
  } catch (err) {
    setStatus(err.message || "Could not load this profile.", true);
  }
}

function showProfile(user, repos) {
  document.getElementById("avatar").src = user.avatar_url;
  document.getElementById("name").textContent = user.name || user.login;
  const handle = document.getElementById("handle");
  handle.textContent = "@" + user.login;
  handle.href = user.html_url;
  document.getElementById("bio").textContent = user.bio || "No bio added.";

  const joined = new Date(user.created_at).getFullYear();
  const parts = [`Joined ${joined}`];
  if (user.location) parts.push(user.location);
  if (user.company) parts.push(user.company);
  document.getElementById("meta").textContent = parts.join(", ");

  const own = repos.filter(r => !r.fork);
  const stars = repos.reduce((a, r) => a + r.stargazers_count, 0);
  const forks = repos.reduce((a, r) => a + r.forks_count, 0);
  document.getElementById("sRepos").textContent = fmt(user.public_repos);
  document.getElementById("sStars").textContent = fmt(stars);
  document.getElementById("sForks").textContent = fmt(forks);
  document.getElementById("sFollowers").textContent = fmt(user.followers);

  showLanguages(own);
  showRepos(own);
  result.hidden = false;
  result.scrollIntoView({ behavior: "smooth", block: "start" });
}

function showLanguages(repos) {
  const counts = {};
  repos.forEach(r => { if (r.language) counts[r.language] = (counts[r.language] || 0) + 1; });
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const total = entries.reduce((a, e) => a + e[1], 0);

  const bar = document.getElementById("langBar");
  const legend = document.getElementById("langLegend");
  bar.innerHTML = "";
  legend.innerHTML = "";

  if (!total) {
    legend.textContent = "No language data available for this user.";
    return;
  }

  entries.forEach(([lang, n], i) => {
    const pct = (n / total) * 100;
    const color = LANG_COLORS[lang] || FALLBACK[i % FALLBACK.length];

    const seg = document.createElement("i");
    seg.style.background = color;
    seg.title = `${lang}: ${pct.toFixed(1)}%`;
    bar.appendChild(seg);
    requestAnimationFrame(() => requestAnimationFrame(() => { seg.style.width = pct + "%"; }));

    const li = document.createElement("li");
    const dot = document.createElement("span");
    dot.className = "dot";
    dot.style.background = color;
    const label = document.createElement("span");
    label.textContent = lang;
    const small = document.createElement("small");
    small.textContent = pct.toFixed(1) + "%";
    li.append(dot, label, small);
    legend.appendChild(li);
  });
}

function showRepos(repos) {
  const grid = document.getElementById("repoGrid");
  grid.innerHTML = "";
  const top = [...repos].sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 6);

  if (!top.length) {
    grid.textContent = "No public repositories to show.";
    return;
  }

  top.forEach(r => {
    const a = document.createElement("a");
    a.className = "repo";
    a.href = r.html_url;
    a.target = "_blank";
    a.rel = "noopener";

    const h = document.createElement("h4");
    h.textContent = r.name;
    const p = document.createElement("p");
    p.textContent = r.description || "No description provided.";
    const foot = document.createElement("div");
    foot.className = "foot";
    foot.textContent = `\u2605 ${fmt(r.stargazers_count)}   forks ${fmt(r.forks_count)}   ${r.language || "n/a"}`;

    a.append(h, p, foot);
    grid.appendChild(a);
  });
}

form.addEventListener("submit", e => {
  e.preventDefault();
  const name = input.value.trim();
  if (name) analyze(name);
});

document.querySelectorAll(".chip").forEach(chip => {
  chip.addEventListener("click", () => {
    input.value = chip.textContent;
    analyze(chip.textContent);
  });
});