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

function params(page: any) {
  return new URL(page.url()).searchParams;
}

test.describe('Slice 8 – URL filter sync', () => {
  test('default filters are written to URL on load', async ({ page }) => {
    await interceptData(page);
    await page.goto('/pr-metrics.html');
    await expect(page.getByTestId('cards-grid')).toBeVisible();
    expect(params(page).get('team')).toBe('Our Team');
    expect(params(page).get('component')).toBe('all');
  });

  test('loading with ?team=Builder pre-selects Builder and renders its data', async ({ page }) => {
    await interceptData(page);
    await page.goto('/pr-metrics.html?team=Builder&component=all');
    await expect(page.getByTestId('filter-team')).toHaveValue('Builder');
    await expect(page.getByTestId('pickup-p50-value')).toContainText('6.81h');
    await expect(page.getByTestId('acceptance-value')).toContainText('91%');
  });

  test('loading with ?component=backend pre-selects backend and renders its data', async ({ page }) => {
    await interceptData(page);
    await page.goto('/pr-metrics.html?team=Our+Team&component=backend');
    await expect(page.getByTestId('filter-component')).toHaveValue('backend');
    await expect(page.getByTestId('pickup-p50-value')).toContainText('5.00h');
  });

  test('changing team updates URL param', async ({ page }) => {
    await interceptData(page);
    await page.goto('/pr-metrics.html');
    await page.getByTestId('filter-team').selectOption('Builder');
    expect(params(page).get('team')).toBe('Builder');
  });

  test('changing component updates URL param', async ({ page }) => {
    await interceptData(page);
    await page.goto('/pr-metrics.html');
    await page.getByTestId('filter-component').selectOption('backend');
    expect(params(page).get('component')).toBe('backend');
  });

  test('both params stay in sync when both filters change', async ({ page }) => {
    await interceptData(page);
    await page.goto('/pr-metrics.html');
    await page.getByTestId('filter-team').selectOption('Builder');
    await page.getByTestId('filter-component').selectOption('all');
    expect(params(page).get('team')).toBe('Builder');
    expect(params(page).get('component')).toBe('all');
  });

  test('unknown team in URL falls back to first team', async ({ page }) => {
    await interceptData(page);
    await page.goto('/pr-metrics.html?team=NonExistent&component=all');
    await expect(page.getByTestId('filter-team')).toHaveValue('Our Team');
    await expect(page.getByTestId('cards-grid')).toBeVisible();
    expect(params(page).get('team')).toBe('Our Team');
  });

  test('unknown component in URL falls back to first component', async ({ page }) => {
    await interceptData(page);
    await page.goto('/pr-metrics.html?team=Our+Team&component=bogus');
    await expect(page.getByTestId('filter-component')).toHaveValue('all');
    await expect(page.getByTestId('cards-grid')).toBeVisible();
    expect(params(page).get('component')).toBe('all');
  });
});
