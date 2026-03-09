(function () {
  function normalizePath(value) {
    return value.replace(/index\.html$/, "").replace(/\/+$/, "") || "/";
  }

  var currentPath = normalizePath(window.location.pathname);
  document.querySelectorAll("[data-nav-link]").forEach(function (link) {
    var href = link.getAttribute("href");
    if (!href) {
      return;
    }

    if (normalizePath(new URL(href, window.location.origin).pathname) === currentPath) {
      link.setAttribute("aria-current", "page");
    }
  });
})();
