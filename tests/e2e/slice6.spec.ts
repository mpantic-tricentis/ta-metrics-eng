import { test, expect, Page } from '@playwright/test';

async function interceptData(page: Page, overrideMetrics?: object) {
  await page.route('**/data/pr-metrics.json', route =>
    overrideMetrics
      ? route.fulfill({ contentType: 'application/json', body: JSON.stringify(overrideMetrics) })
      : route.fulfill({ path: 'tests/fixtures/pr-metrics.json' })
  );
  await page.route('**/data/benchmarks.json', route =>
    route.fulfill({ path: 'tests/fixtures/benchmarks.json' })
  );
}

test.describe('Slice 6 – Component filter', () => {
  test('component dropdown renders with correct options', async ({ page }) => {
    await interceptData(page);
    await page.goto('/pr-metrics.html');
    const select = page.getByTestId('filter-component');
    await expect(select).toBeVisible();
    await expect(select.locator('option')).toHaveCount(3);
    await expect(select.locator('option[value="all"]')).toContainText('All');
    await expect(select.locator('option[value="backend"]')).toContainText('Backend');
    await expect(select.locator('option[value="frontend"]')).toContainText('Frontend');
  });

  test('default selection is All and renders correct values', async ({ page }) => {
    await interceptData(page);
    await page.goto('/pr-metrics.html');
    await expect(page.getByTestId('filter-component')).toHaveValue('all');
    await expect(page.getByTestId('pickup-p50-value')).toContainText('22.60h');
  });

  test('switching to Backend updates all cards', async ({ page }) => {
    await interceptData(page);
    await page.goto('/pr-metrics.html');
    await page.getByTestId('filter-component').selectOption('backend');
    await expect(page.getByTestId('pickup-p50-value')).toContainText('5.00h');
    await expect(page.getByTestId('iteration-p50-value')).toContainText('1.50h');
    await expect(page.getByTestId('acceptance-value')).toContainText('93%');
  });

  test('switching back to All restores original values', async ({ page }) => {
    await interceptData(page);
    await page.goto('/pr-metrics.html');
    await page.getByTestId('filter-component').selectOption('backend');
    await page.getByTestId('filter-component').selectOption('all');
    await expect(page.getByTestId('pickup-p50-value')).toContainText('22.60h');
  });

  test('grade chips update when component changes', async ({ page }) => {
    await interceptData(page);
    await page.goto('/pr-metrics.html');
    await expect(page.getByTestId('pickup-p50-chip')).toHaveClass(/tier-needs-focus/);
    await page.getByTestId('filter-component').selectOption('backend');
    // backend p50 = 5.00h → Fair (≤13h)
    await expect(page.getByTestId('pickup-p50-chip')).toHaveClass(/tier-fair/);
  });

  test('empty state shows when component has no data', async ({ page }) => {
    const metrics = {
      generated_at: '2026-06-14',
      window: { from: '2026-03-14', to: '2026-06-14' },
      author_teams: ['Our Team'],
      components: ['all', 'mobile'],
      rows: [{
        author_team: 'Our Team', component: 'all',
        pickup_time_hours: { p50: 22.60, p75: 50.75, p90: 136.53 },
        iteration_time_hours: { p50: 0.00, p75: 14.86, p90: 35.18 },
        acceptance_rate_30d: 0.82
      }]
    };
    await interceptData(page, metrics);
    await page.goto('/pr-metrics.html');
    await page.getByTestId('filter-component').selectOption('mobile');
    await expect(page.getByTestId('empty-state')).toBeVisible();
    await expect(page.getByTestId('cards-grid')).toBeHidden();
  });
});
