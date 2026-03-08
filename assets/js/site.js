(function () {
  var html = document.documentElement;
  var toggle = document.getElementById('theme-toggle');
  var storedTheme = localStorage.getItem('theme');
  var prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  var theme = storedTheme || (prefersLight ? 'light' : 'dark');
  html.setAttribute('data-theme', theme);

  if (toggle) {
    toggle.addEventListener('click', function () {
      var current = html.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      var next = current === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
    });
  }

  var progress = document.querySelector('.scroll-progress');
  var updateProgress = function () {
    if (!progress) return;
    var scrollable = document.documentElement.scrollHeight - window.innerHeight;
    var ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
    progress.style.setProperty('--scroll-progress', String(Math.max(0, Math.min(1, ratio))));
  };
  updateProgress();
  window.addEventListener('scroll', updateProgress, { passive: true });

  var revealNodes = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && revealNodes.length) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealNodes.forEach(function (node, index) {
      node.style.setProperty('--reveal-delay', String(index * 80) + 'ms');
      observer.observe(node);
    });
  } else {
    revealNodes.forEach(function (node) {
      node.classList.add('is-visible');
    });
  }

  document.querySelectorAll('[data-count-to]').forEach(function (node) {
    var target = Number(node.getAttribute('data-count-to'));
    if (!Number.isFinite(target)) return;
    var prefix = node.getAttribute('data-prefix') || '';
    var suffix = node.getAttribute('data-suffix') || '';
    var duration = 1100;
    var start = performance.now();

    var step = function (now) {
      var progress = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var value = Math.round(target * eased);
      node.textContent = prefix + value + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  });
})();
