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
