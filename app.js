const header = document.querySelector(".site-header");
const currentPage = window.location.pathname.split("/").pop() || "index.html";
const navigationLinks = document.querySelectorAll(".site-nav a");
const navigation = document.querySelector(".site-nav");
const menuToggle = document.querySelector(".menu-toggle");
const heroMetaText = document.querySelector(".hero-meta-text");
const indicatorKey = "daryll-nav-previous-page";
const currentLink = [...navigationLinks].find((link) => link.getAttribute("href") === currentPage);
const svgNamespace = "http://www.w3.org/2000/svg";
const filterSvg = document.createElementNS(svgNamespace, "svg");
filterSvg.setAttribute("aria-hidden", "true");
filterSvg.setAttribute("class", "liquid-filter-definitions");
filterSvg.innerHTML = `
  <defs>
    <filter id="nav-liquid-refraction" x="-10%" y="-40%" width="120%" height="180%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency=".012 .09" numOctaves="1" seed="8" stitchTiles="stitch" result="liquid-noise" />
      <feDisplacementMap in="SourceGraphic" in2="liquid-noise" scale="22" xChannelSelector="R" yChannelSelector="G" />
    </filter>
  </defs>
`;
document.body.prepend(filterSvg);

const starField = document.createElement("div");
starField.className = "star-field";
starField.setAttribute("aria-hidden", "true");

for (let index = 0; index < 100; index += 1) {
  const star = document.createElement("span");
  const size = Math.random() > 0.92 ? 3 : Math.random() > 0.68 ? 2 : 1;
  star.style.setProperty("--star-x", `${Math.random() * 100}%`);
  star.style.setProperty("--star-y", `${Math.random() * 100}%`);
  star.style.setProperty("--star-size", `${size}px`);
  star.style.setProperty("--twinkle-duration", `${2.4 + Math.random() * 4.2}s`);
  star.style.setProperty("--twinkle-delay", `${Math.random() * -6}s`);
  starField.append(star);
}

document.body.prepend(starField);

if (heroMetaText && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const phrases = ["Information Systems", "UI/UX", "Creative Technology"];
  let phraseIndex = 0;
  let characterCount = 0;
  let isDeleting = false;

  const typeNextCharacter = () => {
    const phrase = phrases[phraseIndex];
    heroMetaText.textContent = phrase.slice(0, characterCount);

    let delay = isDeleting ? 38 : 72;
    if (!isDeleting && characterCount === phrase.length) {
      isDeleting = true;
      delay = 1400;
    } else if (isDeleting && characterCount === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      delay = 400;
    }

    characterCount += isDeleting ? -1 : 1;
    window.setTimeout(typeNextCharacter, delay);
  };

  heroMetaText.textContent = "";
  window.setTimeout(typeNextCharacter, 350);
}

if (header) {
  const refraction = document.createElement("span");
  refraction.className = "nav-glass-refraction";
  refraction.setAttribute("aria-hidden", "true");
  header.prepend(refraction);
}

for (const link of navigationLinks) {
  if (link.getAttribute("href") === currentPage) {
    link.setAttribute("aria-current", "page");
  }
}

if (navigation && currentLink) {
  const previousPage = sessionStorage.getItem(indicatorKey);
  const previousLink = [...navigationLinks].find((link) => link.getAttribute("href") === previousPage);
  const supportsPageTransitions = location.protocol !== "file:"
    && CSS.supports("view-transition-name: nav-liquid-indicator");
  const indicator = document.createElement("span");
  indicator.className = "nav-liquid-indicator";
  indicator.setAttribute("aria-hidden", "true");
  indicator.style.viewTransitionName = "nav-liquid-indicator";
  navigation.prepend(indicator);

  const placeIndicator = (link) => {
    const navigationBounds = navigation.getBoundingClientRect();
    const linkBounds = link.getBoundingClientRect();
    const mobileMenu = window.matchMedia("(max-width: 900px)").matches;
    const x = mobileMenu
      ? Math.round(linkBounds.left - navigationBounds.left + 2)
      : Math.round(linkBounds.left + linkBounds.width / 2 - navigationBounds.left - 3);
    const y = mobileMenu
      ? Math.round(linkBounds.top + linkBounds.height / 2 - navigationBounds.top - 3)
      : Math.round(linkBounds.bottom - navigationBounds.top - 1);
    indicator.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };

  if (supportsPageTransitions || !previousLink) {
    placeIndicator(currentLink);
    indicator.classList.add("is-ready");
  } else {
    placeIndicator(previousLink);
    requestAnimationFrame(() => {
      indicator.classList.add("is-ready");
      placeIndicator(currentLink);
    });
  }

  sessionStorage.setItem(indicatorKey, currentLink.getAttribute("href"));
  window.addEventListener("resize", () => {
    placeIndicator(currentLink);
    if (!window.matchMedia("(max-width: 900px)").matches) {
      closeMenu();
    }
  });
  document.fonts.ready.then(() => placeIndicator(currentLink));
}

const closeMenu = () => {
  if (!header || !menuToggle) {
    return;
  }

  header.classList.remove("is-menu-open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation");
};

if (header && menuToggle && navigation) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    header.classList.toggle("is-menu-open", !isOpen);
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
  });

  navigation.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      closeMenu();
    }
  });

  document.addEventListener("click", (event) => {
    if (!header.contains(event.target)) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
      closeMenu();
      menuToggle.focus();
    }
  });
}

if (header && window.matchMedia("(pointer: fine)").matches) {
  header.addEventListener("pointermove", (event) => {
    const bounds = header.getBoundingClientRect();
    const position = ((event.clientX - bounds.left) / bounds.width) * 100;
    header.style.setProperty("--glass-x", `${Math.max(0, Math.min(100, position))}%`);
  });

  header.addEventListener("pointerleave", () => {
    header.style.setProperty("--glass-x", "18%");
  });
}
