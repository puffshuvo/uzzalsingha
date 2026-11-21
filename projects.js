/* ================================================
   EDIT YOUR PROJECTS HERE
   title : name shown on hover
   cat   : must match one of the filters below
   img   : picture path (inside the images folder)
   link  : page opened on click ("#" = nothing yet)
   (4 pictures per row on desktop, 3 on tablet, 2 on phone;
    each keeps its own shape, nothing is cropped)
   ================================================ */
const filters = ["Architecture", "Interior"];

const projects = [
  // ----- Architecture -----
  { title: "Brick House", cat: "Architecture", img: "images/babu.png",          pos: "center", link: "gal.html" },
  { title: "Home",        cat: "Architecture", img: "images/IMG_0734@2x.jpg",   pos: "center", link: "#" },
  { title: "Home",        cat: "Architecture", img: "images/IMG_0734@2x.jpg",   pos: "center", link: "#" },
  { title: "Home",        cat: "Architecture", img: "images/IMG_0734@2x.jpg",   pos: "center", link: "#" },
  { title: "Home",        cat: "Architecture", img: "images/IMG_0734@2x.jpg",   pos: "center", link: "#" },
  { title: "Home",        cat: "Architecture", img: "images/IMG_0734@2x.jpg",   pos: "center", link: "#" },
  { title: "Home",        cat: "Architecture", img: "images/IMG_0734@2x.jpg",   pos: "center", link: "#" },
  { title: "Home",        cat: "Architecture", img: "images/IMG_0734@2x.jpg",   pos: "center", link: "#" },
  { title: "Home",        cat: "Architecture", img: "images/IMG_0734@2x.jpg",   pos: "center", link: "#" },

  // ----- Interior -----
  { title: "Living Room", cat: "Interior",     img: "images/pan.jpg",           pos: "center", link: "#" },
  { title: "Living Room", cat: "Interior",     img: "images/pan.jpg",           pos: "center", link: "#" },
  { title: "Study",       cat: "Interior",     img: "images/sumon.png",         pos: "center", link: "#" }
];

/* ================= Code below: no need to edit ================= */
const gallery   = document.getElementById("gallery");
const filterBox = document.getElementById("filter");
const album     = document.querySelector(".album");

if (!gallery || !filterBox) {
  console.error("projects.js: #gallery or #filter not found in the HTML.");
} else {
  init();
}

function init() {
  // ---------- helpers ----------

  // pictures per row depends on screen width (desktop 4, tablet 3, phone 2)
// pictures per row depends on screen width
// desktop 4, tablet 3, phone 1
function perRow() {
  const w = window.innerWidth;
  if (w <= 500) return 1;   // small screen: one by one
  if (w <= 800) return 3;   // tablet
  return 4;                 // desktop and laptop
}

  // stops quotes or < > in a title from breaking the page
  function esc(text) {
    return String(text).replace(/[&<>"']/g, c =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  // finds the real shape (width ÷ height) of a photo. 0 = not found / too slow.
  // Results are remembered, so filtering again is instant.
  const ratioCache = new Map();
  function getRatio(src) {
    if (ratioCache.has(src)) return ratioCache.get(src);
    const promise = new Promise(done => {
      const im = new Image();
      const timer = setTimeout(() => done(0), 10000);   // give up after 10 seconds
      im.onload = () => {
        clearTimeout(timer);
        done(im.naturalWidth && im.naturalHeight ? im.naturalWidth / im.naturalHeight : 0);
      };
      im.onerror = () => { clearTimeout(timer); done(0); };
      im.src = encodeURI(src);
    });
    ratioCache.set(src, promise);
    return promise;
  }

  // ---------- show projects ----------
  let lastClick = 0;          // stops old results from overwriting new ones
  let currentCategory = null; // which filter is active (null = all)
  let currentPerRow = perRow();

  async function showProjects(category) {
    currentCategory = category;
    const myClick = ++lastClick;
    const PER_ROW = currentPerRow = perRow();

    const list = projects.filter(p => !category || p.cat === category);

    gallery.setAttribute("aria-busy", "true");
    gallery.classList.add("loading");

    if (!list.length) {
      gallery.innerHTML = `<p class="empty">No projects here yet.</p>`;
      gallery.classList.remove("loading");
      gallery.setAttribute("aria-busy", "false");
      return;
    }

    const ratios = await Promise.all(list.map(p => getRatio(p.img)));
    if (myClick !== lastClick) return;   // a newer click happened, ignore this one

    let html = "";
    for (let i = 0; i < list.length; i += PER_ROW) {
      const rowProjects = list.slice(i, i + PER_ROW);
      const rowRatios   = ratios.slice(i, i + PER_ROW);
      const found = rowRatios.filter(r => r > 0);
      const avg = found.length ? found.reduce((a, b) => a + b) / found.length : 1.5;

      let cells = rowProjects.map((p, k) => {
        const ok     = rowRatios[k] > 0;
        const r      = rowRatios[k] || avg;
        const title  = esc(p.title);
        const hasUrl = p.link && p.link !== "#";
        const inside = ok
          ? `<img src="${esc(encodeURI(p.img))}" alt="${title}" loading="lazy" decoding="async"
                  style="object-position:${esc(p.pos || "center")}">`
          : "";
        const cls  = `item${ok ? "" : " broken"}${hasUrl ? "" : " no-link"}`;
        const href = hasUrl ? `href="${esc(p.link)}"` : `role="presentation"`;
        return `<a class="${cls}" ${href} data-file="${esc(p.img)}" aria-label="${title}"
                   style="flex:${r} 1 0; aspect-ratio:${r}">${inside}<span>${title}</span></a>`;
      }).join("");

      // empty spaces keep the last row at the same size as the other rows
      for (let k = rowProjects.length; k < PER_ROW; k++) {
        cells += `<div class="spacer" style="flex:${avg} 1 0" aria-hidden="true"></div>`;
      }
      html += `<div class="row">${cells}</div>`;
    }

    gallery.innerHTML = html;
    gallery.classList.remove("loading");
    gallery.setAttribute("aria-busy", "false");
    if (album) album.scrollTo({ top: 0 });   // new filter = start from the top
  }

  // ---------- filter buttons ----------
  function toggleFilter(li, name) {
    const wasActive = li.classList.contains("active");
    filterBox.querySelectorAll("li").forEach(x => {
      x.classList.remove("active");
      x.setAttribute("aria-pressed", "false");
    });
    if (wasActive) {
      showProjects(null);              // click the active filter again = show all
    } else {
      li.classList.add("active");
      li.setAttribute("aria-pressed", "true");
      showProjects(name);              // show only this category
    }
  }

  filters.forEach(name => {
    const li = document.createElement("li");
    li.textContent = name;
    li.tabIndex = 0;                                  // reachable with the keyboard
    li.setAttribute("role", "button");
    li.setAttribute("aria-pressed", "false");
    li.addEventListener("click", () => toggleFilter(li, name));
    li.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleFilter(li, name);
      }
    });
    filterBox.appendChild(li);
  });

  // ---------- re-arrange rows when the screen size changes ----------
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (perRow() !== currentPerRow) showProjects(currentCategory);
    }, 200);
  });

  showProjects(null);   // first screen = ALL projects
}


