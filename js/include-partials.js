(async function () {
  // 1) Load all partials
  const nodes = document.querySelectorAll("[data-include]");
  for (const el of nodes) {
    const src = el.getAttribute("data-include");
    try {
      const res = await fetch(src, { cache: "no-store" });
      el.innerHTML = await res.text();
    } catch (e) {
      console.error("Include failed:", src, e);
    }
  }

  // 2) Auto-hide navbar when link clicked (for mobile)
  document.querySelectorAll(".navbar-nav .nav-link").forEach((a) => {
    a.addEventListener("click", () => {
      const collapse = document.querySelector(".navbar-collapse");
      if (collapse && collapse.classList.contains("show")) {
        new bootstrap.Collapse(collapse).hide();
      }
    });
  });

  // 3) Mark active link
  const path =
    location.pathname.replace(/index\.html$/, "").replace(/\/+$/, "/") || "/";

  document.querySelectorAll(".navbar .nav-link").forEach((link) => {
    const href = link.getAttribute("href") || "";
    const hrefPath = href.replace(/#.*$/, ""); // remove hash

    const isHomeHero = href === "/index.html#hero" && path === "/";
    const isSamePage = hrefPath && hrefPath === path;
    const isHomeSection = href.endsWith("#portfolio") && path === "/";

    if (isHomeHero || isSamePage || isHomeSection) {
      link.classList.add("active");
    }
  });
})();
