(function () {
  var state = { component: 'all', team: 'Our Team' };

  var CARDS = [
    {
      metricKey: 'pickup_time_hours',
      tbodyId: 'pickup-time-rows',
      testIdPrefix: 'pickup',
      ladderTestId: 'pickup-ladder',
      percentiles: ['p50', 'p75', 'p90'],
      fmt: function (v) { return v.toFixed(2) + 'h'; }
    },
    {
      metricKey: 'iteration_time_hours',
      tbodyId: 'iteration-time-rows',
      testIdPrefix: 'iteration',
      ladderTestId: 'iteration-ladder',
      percentiles: ['p50', 'p75', 'p90'],
      fmt: function (v) { return v.toFixed(2) + 'h'; }
    },
    {
      metricKey: 'acceptance_rate_30d',
      containerId: 'acceptance-rate-value',
      testIdPrefix: 'acceptance',
      ladderTestId: 'acceptance-ladder',
      percentiles: null,
      fmt: function (v) { return Math.round(v * 100) + '%'; }
    }
  ];

  function buildLadderText(config) {
    return config.tiers.map(function (tier, i) {
      if (config.direction === 'lower-is-better') {
        return tier.max !== null
          ? tier.name + ' ≤' + tier.max + 'h'
          : tier.name + ' >' + config.tiers[i - 1].max + 'h';
      } else {
        return tier.min !== null
          ? tier.name + ' ≥' + Math.round(tier.min * 100) + '%'
          : tier.name + ' <' + Math.round(config.tiers[i - 1].min * 100) + '%';
      }
    }).join(' \xb7 ');
  }

  function renderPercentileCard(card, row, benchmarks) {
    var tbody = document.getElementById(card.tbodyId);
    if (!tbody) return;
    var config = benchmarks[card.metricKey] || null;
    var metricRow = row[card.metricKey] || {};
    var html = '';
    card.percentiles.forEach(function (p) {
      var value = metricRow[p];
      var hasValue = value !== undefined && value !== null;
      var grade = (hasValue && config) ? gradeValue(card.metricKey, value, benchmarks) : { tier: null, cssClass: '' };
      html += '<tr>' +
        '<td>' + p.toUpperCase() + '</td>' +
        '<td data-testid="' + card.testIdPrefix + '-' + p + '-value">' + (hasValue ? card.fmt(value) : '—') + '</td>' +
        '<td>' + (grade.tier
          ? '<span class="tier-chip ' + grade.cssClass + '" data-testid="' + card.testIdPrefix + '-' + p + '-chip">' + grade.tier + '</span>'
          : '<span>—</span>') + '</td>' +
        '</tr>';
    });
    tbody.innerHTML = html;
  }

  function renderSingleCard(card, row, benchmarks) {
    var container = document.getElementById(card.containerId);
    if (!container) return;
    var config = benchmarks[card.metricKey] || null;
    var value = row[card.metricKey];
    var hasValue = value !== undefined && value !== null;
    var grade = (hasValue && config) ? gradeValue(card.metricKey, value, benchmarks) : { tier: null, cssClass: '' };
    container.innerHTML = hasValue
      ? '<span class="single-metric-number" data-testid="' + card.testIdPrefix + '-value">' + card.fmt(value) + '</span>' +
        (grade.tier ? '<span class="tier-chip ' + grade.cssClass + '" data-testid="' + card.testIdPrefix + '-chip">' + grade.tier + '</span>' : '')
      : '<span>—</span>';
  }

  function renderCard(card, row, benchmarks) {
    if (card.percentiles) {
      renderPercentileCard(card, row, benchmarks);
    } else {
      renderSingleCard(card, row, benchmarks);
    }
    var config = benchmarks[card.metricKey] || null;
    var legend = document.querySelector('[data-testid="' + card.ladderTestId + '"]');
    if (legend && config) {
      legend.textContent = buildLadderText(config);
    }
  }

  function render(metricsData, benchmarks) {
    var row = metricsData.rows.find(function (r) {
      return r.author_team === state.team && r.component === state.component;
    });
    if (!row) return;
    CARDS.forEach(function (card) {
      renderCard(card, row, benchmarks);
    });
  }

  Promise.all([
    fetch('data/pr-metrics.json').then(function (r) { return r.json(); }),
    fetch('data/benchmarks.json').then(function (r) { return r.json(); })
  ]).then(function (results) {
    render(results[0], results[1]);
  }).catch(function (err) {
    console.error('Failed to load metrics data:', err);
  });
})();
