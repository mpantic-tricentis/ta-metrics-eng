(function () {
  var TIERS = [
    { name: 'Elite',       max: 2,    cssClass: 'tier-elite' },
    { name: 'Good',        max: 4,    cssClass: 'tier-good' },
    { name: 'Fair',        max: 13,   cssClass: 'tier-fair' },
    { name: 'Needs Focus', max: null, cssClass: 'tier-needs-focus' }
  ];

  function gradePickup(value) {
    for (var i = 0; i < TIERS.length; i++) {
      if (TIERS[i].max === null || value <= TIERS[i].max) return TIERS[i];
    }
    return TIERS[TIERS.length - 1];
  }

  var data = { p50: 22.60, p75: 50.75, p90: 136.53 };
  var tbody = document.getElementById('pickup-time-rows');
  var html = '';
  ['p50', 'p75', 'p90'].forEach(function (p) {
    var value = data[p];
    var grade = gradePickup(value);
    html += '<tr>' +
      '<td>' + p.toUpperCase() + '</td>' +
      '<td data-testid="pickup-' + p + '-value">' + value.toFixed(2) + 'h</td>' +
      '<td><span class="tier-chip ' + grade.cssClass + '" data-testid="pickup-' + p + '-chip">' + grade.name + '</span></td>' +
      '</tr>';
  });
  tbody.innerHTML = html;

  var legend = document.querySelector('[data-testid="pickup-ladder"]');
  if (legend) {
    legend.textContent = 'Elite ≤2h \xb7 Good ≤4h \xb7 Fair ≤13h \xb7 Needs Focus >13h';
  }
})();
