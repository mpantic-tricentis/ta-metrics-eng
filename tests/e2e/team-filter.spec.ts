import { test, expect } from '@playwright/test';

async function interceptData(page: any) {
  await Promise.all([
    page.route('**/data/pr-metrics.json', (route: any) =>
      route.fulfill({ path: 'tests/fixtures/pr-metrics.json' })
    ),
    page.route('**/data/benchmarks.json', (route: any) =>
      route.fulfill({ path: 'tests/fixtures/benchmarks.json' })
    )
  ]);
}

test.describe('Team filter', () => {
  test('team dropdown renders with correct options', async ({ page }) => {
    await interceptData(page);
    await page.goto('/pr-metrics.html');
    const select = page.getByTestId('filter-team');
    await expect(select).toBeVisible();
    await expect(select.locator('option')).toHaveCount(3);
    await expect(select.locator('option').nth(0)).toHaveText('Our Team');
    await expect(select.locator('option').nth(1)).toHaveText('Builder');
    await expect(select.locator('option').nth(2)).toHaveText('Henbosis');
  });

  test('default team is Our Team and renders correct values', async ({ page }) => {
    await interceptData(page);
    await page.goto('/pr-metrics.html');
    await expect(page.getByTestId('filter-team')).toHaveValue('Our Team');
    await expect(page.getByTestId('pickup-p50-value')).toContainText('22.60h');
    await expect(page.getByTestId('acceptance-value')).toContainText('82%');
  });

  test('switching to Builder updates all cards', async ({ page }) => {
    await interceptData(page);
    await page.goto('/pr-metrics.html');
    await page.getByTestId('filter-team').selectOption('Builder');
    await expect(page.getByTestId('pickup-p50-value')).toContainText('6.81h');
    await expect(page.getByTestId('acceptance-value')).toContainText('91%');
    await expect(page.getByTestId('iteration-p50-value')).toContainText('0.90h');
  });

  test('grade chips update when team changes', async ({ page }) => {
    await interceptData(page);
    await page.goto('/pr-metrics.html');
    // Our Team pickup p50=22.60h → Needs Focus
    await expect(page.getByTestId('pickup-p50-chip')).toHaveClass(/tier-needs-focus/);
    await page.getByTestId('filter-team').selectOption('Builder');
    // Builder pickup p50=6.81h → Fair (5–13h)
    await expect(page.getByTestId('pickup-p50-chip')).toHaveClass(/tier-fair/);
  });

  test('switching back to Our Team restores original values', async ({ page }) => {
    await interceptData(page);
    await page.goto('/pr-metrics.html');
    await page.getByTestId('filter-team').selectOption('Builder');
    await page.getByTestId('filter-team').selectOption('Our Team');
    await expect(page.getByTestId('pickup-p50-value')).toContainText('22.60h');
    await expect(page.getByTestId('acceptance-value')).toContainText('82%');
  });

  test('empty state shows when team has no data', async ({ page }) => {
    await interceptData(page);
    await page.goto('/pr-metrics.html');
    await page.getByTestId('filter-team').selectOption('Henbosis');
    await expect(page.getByTestId('empty-state')).toBeVisible();
    await expect(page.getByTestId('cards-grid')).toBeHidden();
  });
});
