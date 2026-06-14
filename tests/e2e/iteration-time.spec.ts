import { test, expect, Page } from '@playwright/test';

async function interceptData(page: Page) {
  await page.route('**/data/pr-metrics.json', route =>
    route.fulfill({ path: 'tests/fixtures/pr-metrics.json' })
  );
  await page.route('**/data/benchmarks.json', route =>
    route.fulfill({ path: 'tests/fixtures/benchmarks.json' })
  );
}

test.describe('Iteration Time card', () => {
  test.beforeEach(async ({ page }) => {
    await interceptData(page);
    await page.goto('/pr-metrics.html');
  });

  test('Iteration Time card is visible', async ({ page }) => {
    await expect(page.getByTestId('card-iteration-time')).toBeVisible();
  });

  test('Iteration Time values render from JSON', async ({ page }) => {
    const card = page.getByTestId('card-iteration-time');
    await expect(card.getByTestId('iteration-p50-value')).toContainText('0.00h');
    await expect(card.getByTestId('iteration-p75-value')).toContainText('14.86h');
    await expect(card.getByTestId('iteration-p90-value')).toContainText('35.18h');
  });

  test('Iteration Time P50 grades Elite (≤ 3h)', async ({ page }) => {
    await expect(page.getByTestId('iteration-p50-chip')).toHaveClass(/tier-elite/);
  });

  test('Iteration Time P75 grades Fair (≤ 23h)', async ({ page }) => {
    await expect(page.getByTestId('iteration-p75-chip')).toHaveClass(/tier-fair/);
  });

  test('Iteration Time P90 grades Needs Focus (> 23h)', async ({ page }) => {
    await expect(page.getByTestId('iteration-p90-chip')).toHaveClass(/tier-needs-focus/);
  });

  test('Pickup and Iteration cards render independently', async ({ page }) => {
    await expect(page.getByTestId('card-pickup-time')).toBeVisible();
    await expect(page.getByTestId('card-iteration-time')).toBeVisible();
    await expect(page.getByTestId('pickup-p50-value')).toContainText('22.60h');
    await expect(page.getByTestId('iteration-p50-value')).toContainText('0.00h');
  });
});
