function gradeValue(metricKey, value, benchmarks) {
  var config = benchmarks[metricKey];
  if (!config) return { tier: null, cssClass: '' };
  for (var i = 0; i < config.tiers.length; i++) {
    var tier = config.tiers[i];
    var match = config.direction === 'lower-is-better'
      ? (tier.max === null || value <= tier.max)
      : (tier.min === null || value >= tier.min);
    if (match) {
      var nextTip = null;
      if (i > 0) {
        var next = config.tiers[i - 1];
        nextTip = config.direction === 'lower-is-better'
          ? 'To reach ' + next.name + ': reduce to ≤' + next.max + 'h'
          : 'To reach ' + next.name + ': increase to ≥' + Math.round(next.min * 100) + '%';
      }
      return {
        tier: tier.name,
        cssClass: 'tier-' + tier.name.toLowerCase().replace(/\s+/g, '-'),
        nextTip: nextTip
      };
    }
  }
  return { tier: null, cssClass: '', nextTip: null };
}

(function () {
  var page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-item').forEach(function (el) {
    if (el.getAttribute('href') === page) {
      el.classList.add('active');
    }
  });
})();

(function () {
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('star-theme', theme);
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;
    btn.querySelector('.theme-icon').textContent = theme === 'dark' ? '☀' : '☾';
    btn.querySelector('.theme-label').textContent = theme === 'dark' ? 'Light mode' : 'Dark mode';
  }

  var saved = localStorage.getItem('star-theme') || 'dark';
  document.addEventListener('DOMContentLoaded', function () {
    applyTheme(saved);
    var btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.addEventListener('click', function () {
        var current = document.documentElement.getAttribute('data-theme');
        applyTheme(current === 'dark' ? 'light' : 'dark');
      });
    }
  });
})();
