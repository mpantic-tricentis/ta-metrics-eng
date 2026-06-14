import { test, expect, Page } from '@playwright/test';

const BENCHMARKS = {
  pickup_time_hours: {
    direction: 'lower-is-better',
    tiers: [
      { name: 'Elite', max: 2 }, { name: 'Good', max: 4 },
      { name: 'Fair', max: 13 }, { name: 'Needs Focus', max: null }
    ]
  },
  iteration_time_hours: {
    direction: 'lower-is-better',
    tiers: [
      { name: 'Elite', max: 3 }, { name: 'Good', max: 13 },
      { name: 'Fair', max: 23 }, { name: 'Needs Focus', max: null }
    ]
  },
  acceptance_rate_30d: {
    direction: 'higher-is-better',
    tiers: [
      { name: 'Elite', min: 0.95 }, { name: 'Good', min: 0.92 },
      { name: 'Fair', min: 0.87 }, { name: 'Needs Focus', min: null }
    ]
  }
};

function makeMetrics(acceptanceRate: number) {
  return {
    generated_at: '2026-06-14',
    window: { from: '2026-03-14', to: '2026-06-14' },
    author_teams: ['Our Team'],
    components: ['all'],
    rows: [{
      author_team: 'Our Team',
      component: 'all',
      pickup_time_hours:    { p50: 22.60, p75: 50.75, p90: 136.53 },
      iteration_time_hours: { p50: 0.00,  p75: 14.86, p90: 35.18  },
      acceptance_rate_30d:  acceptanceRate
    }]
  };
}

async function setup(page: Page, acceptanceRate: number) {
  await page.route('**/data/pr-metrics.json', route =>
    route.fulfill({ contentType: 'application/json', body: JSON.stringify(makeMetrics(acceptanceRate)) })
  );
  await page.route('**/data/benchmarks.json', route =>
    route.fulfill({ contentType: 'application/json', body: JSON.stringify(BENCHMARKS) })
  );
}

test.describe('Acceptance Rate card', () => {
  test('Acceptance Rate card is visible', async ({ page }) => {
    await setup(page, 0.82);
    await page.goto('/pr-metrics.html');
    await expect(page.getByTestId('card-acceptance-rate')).toBeVisible();
  });

  test('Acceptance Rate value renders as percentage', async ({ page }) => {
    await setup(page, 0.82);
    await page.goto('/pr-metrics.html');
    await expect(page.getByTestId('acceptance-value')).toContainText('82%');
  });

  test('gradeValue: Needs Focus for rate < 87%', async ({ page }) => {
    await setup(page, 0.82);
    await page.goto('/pr-metrics.html');
    await expect(page.getByTestId('acceptance-chip')).toHaveClass(/tier-needs-focus/);
  });

  test('gradeValue: Fair for rate ≥ 87%', async ({ page }) => {
    await setup(page, 0.88);
    await page.goto('/pr-metrics.html');
    await expect(page.getByTestId('acceptance-chip')).toHaveClass(/tier-fair/);
  });

  test('gradeValue: Good for rate ≥ 92%', async ({ page }) => {
    await setup(page, 0.93);
    await page.goto('/pr-metrics.html');
    await expect(page.getByTestId('acceptance-chip')).toHaveClass(/tier-good/);
  });

  test('gradeValue: Elite for rate ≥ 95%', async ({ page }) => {
    await setup(page, 0.96);
    await page.goto('/pr-metrics.html');
    await expect(page.getByTestId('acceptance-chip')).toHaveClass(/tier-elite/);
  });

  test('Acceptance Rate ladder legend shows percentage format', async ({ page }) => {
    await setup(page, 0.82);
    await page.goto('/pr-metrics.html');
    const legend = page.getByTestId('acceptance-ladder');
    await expect(legend).toContainText('≥95%');
    await expect(legend).toContainText('≥92%');
    await expect(legend).toContainText('≥87%');
  });

  test('higher-is-better grading does not break lower-is-better cards', async ({ page }) => {
    await setup(page, 0.96);
    await page.goto('/pr-metrics.html');
    await expect(page.getByTestId('pickup-p50-chip')).toHaveClass(/tier-needs-focus/);
    await expect(page.getByTestId('iteration-p50-chip')).toHaveClass(/tier-elite/);
    await expect(page.getByTestId('acceptance-chip')).toHaveClass(/tier-elite/);
  });
});
