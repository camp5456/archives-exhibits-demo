document.addEventListener("DOMContentLoaded", function () {
  const activeLink = document.querySelector(".nav-link.active, .dropdown-item.active");
  const label = activeLink?.getAttribute("data-label");

  // Poll for the targets every 100ms, up to 2 seconds
  const maxAttempts = 20;
  let attempt = 0;

  const waitForTargets = setInterval(() => {
    const bannerTarget = document.getElementById("active-menu-label");
    const pageHeaderTarget = document.getElementById("page-menu-label");

    if (label && (bannerTarget || pageHeaderTarget)) {
      if (bannerTarget) bannerTarget.textContent = label;
      if (pageHeaderTarget) pageHeaderTarget.textContent = label;

      clearInterval(waitForTargets);
    }

    attempt++;
    if (attempt >= maxAttempts) {
      clearInterval(waitForTargets);
      console.warn("active-label.js: Failed to find target elements after 2 seconds.");
    }
  }, 100);
});