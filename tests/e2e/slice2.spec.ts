import { test, expect, Page } from '@playwright/test';

const BENCHMARKS = {
  pickup_time_hours: {
    direction: 'lower-is-better',
    tiers: [
      { name: 'Elite',       max: 2  },
      { name: 'Good',        max: 4  },
      { name: 'Fair',        max: 13 },
      { name: 'Needs Focus', max: null }
    ]
  }
};

function makeMetrics(p50: number, p75: number, p90: number) {
  return {
    generated_at: '2026-06-14',
    window: { from: '2026-03-14', to: '2026-06-14' },
    author_teams: ['Our Team'],
    components: ['all'],
    rows: [{
      author_team: 'Our Team',
      component: 'all',
      pickup_time_hours:    { p50, p75, p90 },
      iteration_time_hours: { p50: 1, p75: 5, p90: 10 },
      acceptance_rate_30d:  0.90
    }]
  };
}

async function setup(page: Page, p50: number, p75: number, p90: number, benchmarks = BENCHMARKS) {
  await page.route('**/data/pr-metrics.json', route =>
    route.fulfill({ contentType: 'application/json', body: JSON.stringify(makeMetrics(p50, p75, p90)) })
  );
  await page.route('**/data/benchmarks.json', route =>
    route.fulfill({ contentType: 'application/json', body: JSON.stringify(benchmarks) })
  );
}

test.describe('Slice 2 – JSON data + gradeValue', () => {
  test('Pickup Time values render from JSON', async ({ page }) => {
    await setup(page, 22.60, 50.75, 136.53);
    await page.goto('/pr-metrics.html');
    await expect(page.getByTestId('pickup-p50-value')).toContainText('22.60h');
    await expect(page.getByTestId('pickup-p75-value')).toContainText('50.75h');
    await expect(page.getByTestId('pickup-p90-value')).toContainText('136.53h');
  });

  test('gradeValue: Elite chip for value ≤ 2h', async ({ page }) => {
    await setup(page, 1.5, 3.0, 20.0);
    await page.goto('/pr-metrics.html');
    await expect(page.getByTestId('pickup-p50-chip')).toHaveClass(/tier-elite/);
  });

  test('gradeValue: Good chip for value ≤ 4h', async ({ page }) => {
    await setup(page, 1.5, 3.0, 20.0);
    await page.goto('/pr-metrics.html');
    await expect(page.getByTestId('pickup-p75-chip')).toHaveClass(/tier-good/);
  });

  test('gradeValue: Fair chip for value ≤ 13h', async ({ page }) => {
    await setup(page, 7.0, 3.0, 20.0);
    await page.goto('/pr-metrics.html');
    await expect(page.getByTestId('pickup-p50-chip')).toHaveClass(/tier-fair/);
  });

  test('gradeValue: Needs Focus chip for value > 13h', async ({ page }) => {
    await setup(page, 20.0, 3.0, 1.5);
    await page.goto('/pr-metrics.html');
    await expect(page.getByTestId('pickup-p50-chip')).toHaveClass(/tier-needs-focus/);
  });

  test('missing benchmark degrades gracefully – card still renders', async ({ page }) => {
    await setup(page, 22.60, 50.75, 136.53, {});
    await page.goto('/pr-metrics.html');
    await expect(page.getByTestId('card-pickup-time')).toBeVisible();
    await expect(page.getByTestId('pickup-p50-value')).toContainText('22.60h');
  });

  test('ladder legend is populated from benchmarks JSON', async ({ page }) => {
    await setup(page, 22.60, 50.75, 136.53);
    await page.goto('/pr-metrics.html');
    const legend = page.getByTestId('pickup-ladder');
    await expect(legend).toContainText('≤2h');
    await expect(legend).toContainText('≤4h');
    await expect(legend).toContainText('≤13h');
  });
});
