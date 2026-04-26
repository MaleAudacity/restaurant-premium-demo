import { expect, test } from '@playwright/test';
import { expectPageReady, loginAs } from './helpers';

test.describe('demo simulation', () => {
  test.beforeEach(async ({ context, page }) => {
    await loginAs(context, 'OWNER');
    await page.route('**/api/auth/**', route => route.abort());
  });

  test('demo landing links to chat and control panel', async ({ page }) => {
    await page.goto('/demo');
    await expectPageReady(page);
    await expect(page.getByRole('link', { name: /open chat demo|start chat demo/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /open control panel/i }).first()).toBeVisible();
  });

  test('chat demo renders customer quick replies or chat input', async ({ page }) => {
    await page.goto('/demo/chat');
    await expectPageReady(page);
    await expect(page.locator('body')).toContainText(/mirch masala|reply in chat|chat/i);
  });

  test('control panel renders simulation sections even when database is unavailable', async ({ page }) => {
    await page.goto('/demo/control');
    await expectPageReady(page);
    await expect(page.locator('body')).toContainText(/chat simulation|database unavailable|order simulation|booking simulation/i);
  });
});
