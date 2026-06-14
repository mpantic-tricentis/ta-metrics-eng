function gradeValue(metricKey, value, benchmarks) {
  var config = benchmarks[metricKey];
  if (!config) return { tier: null, cssClass: '' };
  for (var i = 0; i < config.tiers.length; i++) {
    var tier = config.tiers[i];
    var match = config.direction === 'lower-is-better'
      ? (tier.max === null || value <= tier.max)
      : (tier.min === null || value >= tier.min);
    if (match) {
      return {
        tier: tier.name,
        cssClass: 'tier-' + tier.name.toLowerCase().replace(/\s+/g, '-')
      };
    }
  }
  return { tier: null, cssClass: '' };
}

(function () {
  var page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-item').forEach(function (el) {
    if (el.getAttribute('href') === page) {
      el.classList.add('active');
    }
  });
})();
