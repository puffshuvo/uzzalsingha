/* ================================================
 CONTENT HERE
   ================================================ */
const sections = {
  "Education": {
    type: "list",
    items: [
      { line1: "B.Arch", line2: "Bangladesh University of Engineering Technology", line3: "2000-2004" },
      { line1: "M.Arch", line2: "Your University Name", line3: "2005-2007" }
    ]
  },
  "Professional Qualification": {
    type: "table",
    columns: ["Qualification", "Awarded by", "Country", "Year"],
    rows: [
      ["PMP® (Project Management Professional)", "Project Management Institute (PMI)", "USA", "2022"],
      ["Registered Architect", "Institute of Architects Bangladesh (IAB)", "Bangladesh", "2008"]
    ]
  },
  "Training": {
    type: "table",
    columns: ["Training Title", "Topic", "Institute", "Country", "Location", "Year", "Duration"],
    rows: [
      ["CPD Course on Project Management", "PROJECT MANAGEMENT", "Institute of Architects Bangladesh (IAB)", "Bangladesh", "AGARGAON, iAB", "2025", "01 Day"],
      ["Short Course on Inventory and Warehouse Management", "Inventory and Warehouse Management", "Directorate of Continuing Education, BUET", "Bangladesh", "Palashi, BUET", "2024", "01 Day"],
      ["Short Course on Advanced Project Management: Modern Trends & Practices (27 PDU/ Contact Hours)", "Advanced Project Management", "Directorate of Continuing Education, BUET", "Bangladesh", "Palashi, BUET", "2023", "04 Days"],
      ["Public Procurement Management: PPA 2006 and PPR 2008, e-GP Tender Document Preparation (PE Part)", "PPA, PPR EGP", "Flash IT Ltd.", "Bangladesh", "Online", "2022", "03 day"],
      ["Self-Development Course: “Happiness in Hard Times 01”", "Happiness", "Coach Kanchon Academy", "Bangladesh", "Online", "2022", "01 Day"],
      ["PMP® Exam Preparation Training—48 Hours", "PMP® Exam", "Rosetta Technologies", "Bangladesh", "Panthapath", "2022", "04 months"],
      ["Online Training Programme on Practical Accounting with Personal Tax Return—15 Hours", "Practical Accounting", "Self Development Technical Training Academy", "Bangladesh", "Online", "2021", "05 Day"]
    ]
  },
  "Voluntary work": {
    type: "card",
    image: "im.jpg",
    text: "Write about your voluntary work here.",
    links: [{ label: "Flickr", url: "#" }, { label: "archdocu.com", url: "#" }]
  },
  "Photography": {
    type: "card",
    image: "images/photo.jpg",
    text: "Write about your photography here.",
    links: [{ label: "Flickr", url: "#" }, { label: "archdocu.com", url: "#" }]
  }
};

const defaultView = { image: "uzzal.png" };

/* ================= Code below: no need to edit ================= */
const menu = document.getElementById("sideMenu");
const box  = document.getElementById("centerBox");

function showDefault() {
  box.innerHTML = `<div class="view-default"><img src="${defaultView.image}" alt="Uzzal Singha"></div>`;
  document.querySelectorAll(".side-menu li").forEach(li => li.classList.remove("active"));
}

function showList(data) {
  box.innerHTML = `<div class="view-list">` + data.items.map(i =>
    `<div class="list-item">${i.line1}<br>${i.line2}<br>${i.line3}</div>`).join("") + `</div>`;
}

function showTable(data) {
  const head = data.columns.map(c => `<th>${c}</th>`).join("");
  const body = data.rows.map(r =>
    "<tr>" + r.map(cell => `<td>${cell}</td>`).join("") + "</tr>").join("");
  box.innerHTML = `<div class="view-table"><table>
    <thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
}

function showCard(data) {
  const links = data.links.map(l => `<a href="${l.url}" target="_blank" rel="noopener">${l.label}</a>`).join("");
  box.innerHTML = `
    <div class="view-card">
      <img src="${data.image}" alt="">
      <div>
        <p class="card-text">${data.text}</p>
        <div class="card-links">${links}</div>
      </div>
    </div>`;
}

function showSection(name, li) {
  document.querySelectorAll(".side-menu li").forEach(x => x.classList.remove("active"));
  li.classList.add("active");
  box.scrollTop = 0;                       // start each section at the top
  const data = sections[name];
  if (data.type === "list") showList(data);
  else if (data.type === "table") showTable(data);
  else if (data.type === "card") showCard(data);
  // the fade-in animation runs automatically (see CSS .center-box > *)
}

// build the left menu
Object.keys(sections).forEach(name => {
  const li = document.createElement("li");
  li.textContent = name;
  li.addEventListener("click", () => showSection(name, li));
  menu.appendChild(li);
});

showDefault();   // first screen

/* ---------- Theme toggle (light / dark) ---------- */
const toggle = document.getElementById("themeToggle");
const root = document.documentElement;

function applyTheme(theme) {
  root.setAttribute("data-theme", theme);
  toggle.setAttribute("aria-checked", theme === "dark");
  try { localStorage.setItem("theme", theme); } catch (e) {}
}

toggle.setAttribute("aria-checked", root.getAttribute("data-theme") === "dark");
toggle.addEventListener("click", () => {
  applyTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
});