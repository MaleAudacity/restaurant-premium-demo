import { expect, test } from '@playwright/test';
import { expectPageReady, loginAs } from './helpers';

test.describe('role-protected operations area', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/auth/**', route => route.abort());
  });

  test('protected dashboard redirects unauthenticated users to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: /demo access/i })).toBeVisible();
  });

  test('login page shows all demo roles', async ({ page }) => {
    await page.goto('/login');
    await expectPageReady(page);
    await expect(page.locator('body')).toContainText(/owner|manager|kitchen|delivery/i);
    await expect(page.getByRole('button', { name: /continue/i })).toHaveCount(4);
  });

  test('owner can open main dashboard sections', async ({ page, context }) => {
    await loginAs(context, 'OWNER');

    for (const path of ['/dashboard', '/orders', '/bookings', '/events', '/kitchen', '/delivery', '/analytics', '/menu-management', '/settings']) {
      await page.goto(path);
      await expectPageReady(page);
      await expect(page).toHaveURL(new RegExp(`${path}$`));
    }
  });

  test('kitchen role is redirected away from owner-only orders', async ({ page, context }) => {
    await loginAs(context, 'KITCHEN');
    await page.goto('/orders');
    await expect(page).toHaveURL(/\/kitchen$/);
    await expectPageReady(page);
  });

  test('delivery role is redirected away from kitchen board', async ({ page, context }) => {
    await loginAs(context, 'DELIVERY');
    await page.goto('/kitchen');
    await expect(page).toHaveURL(/\/delivery$/);
    await expectPageReady(page);
  });
});
