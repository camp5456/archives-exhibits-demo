document.addEventListener("DOMContentLoaded", function () {
  const activeLink = document.querySelector(".nav-link.active, .dropdown-item.active");
  const label = activeLink?.getAttribute("data-label");

  // Banner location
  const bannerTarget = document.getElementById("active-menu-label");

  // Page header location
  const pageHeaderTarget = document.getElementById("page-menu-label");

  if (label && bannerTarget) {
    bannerTarget.textContent = label;
  }

  if (label && pageHeaderTarget) {
    pageHeaderTarget.textContent = label;
  }
});