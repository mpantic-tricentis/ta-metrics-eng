import { test, expect, Page } from '@playwright/test';

async function interceptData(page: Page) {
  await page.route('**/data/pr-metrics.json', route =>
    route.fulfill({ path: 'tests/fixtures/pr-metrics.json' })
  );
  await page.route('**/data/benchmarks.json', route =>
    route.fulfill({ path: 'tests/fixtures/benchmarks.json' })
  );
}

test.describe('Slice 1 – Skeleton + Pickup Time', () => {
  test('index page loads with sidebar navigation', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.sidebar-header')).toContainText('TA Metrics');
    await expect(page.locator('a.nav-item[href="pr-metrics.html"]')).toBeVisible();
    await expect(page.locator('a.nav-item[title="Coming soon"]')).toBeVisible();
  });

  test('PR metrics page title and active nav', async ({ page }) => {
    await interceptData(page);
    await page.goto('/pr-metrics.html');
    await expect(page).toHaveTitle(/PR Metrics/);
    await expect(page.locator('a.nav-item[href="pr-metrics.html"]')).toHaveClass(/active/);
  });

  test('Pickup Time card renders all three percentile rows', async ({ page }) => {
    await interceptData(page);
    await page.goto('/pr-metrics.html');
    const card = page.getByTestId('card-pickup-time');
    await expect(card).toBeVisible();
    await expect(card.getByTestId('pickup-p50-value')).toContainText('22.60h');
    await expect(card.getByTestId('pickup-p75-value')).toContainText('50.75h');
    await expect(card.getByTestId('pickup-p90-value')).toContainText('136.53h');
  });

  test('Pickup Time chips carry tier-needs-focus class', async ({ page }) => {
    await interceptData(page);
    await page.goto('/pr-metrics.html');
    await expect(page.getByTestId('pickup-p50-chip')).toHaveClass(/tier-needs-focus/);
    await expect(page.getByTestId('pickup-p75-chip')).toHaveClass(/tier-needs-focus/);
    await expect(page.getByTestId('pickup-p90-chip')).toHaveClass(/tier-needs-focus/);
  });

  test('Pickup Time ladder legend renders all four tiers', async ({ page }) => {
    await interceptData(page);
    await page.goto('/pr-metrics.html');
    const legend = page.getByTestId('pickup-ladder');
    await expect(legend).toBeVisible();
    await expect(legend).toContainText('Elite');
    await expect(legend).toContainText('Good');
    await expect(legend).toContainText('Fair');
    await expect(legend).toContainText('Needs Focus');
  });
});
