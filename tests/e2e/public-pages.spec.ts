import { expect, test } from '@playwright/test';
import { expectPageReady } from './helpers';

const publicRoutes = [
  { path: '/', text: /mirch masala|premium indian/i },
  { path: '/menu', text: /a menu built|our menu/i },
  { path: '/about', text: /about|our story|visit us/i },
  { path: '/contact', text: /contact|send us a message/i },
  { path: '/book-table', text: /reserve|request table|service hours/i },
  { path: '/whatsapp-order', text: /whatsapp ordering|guided ordering/i },
  { path: '/track-order', text: /track order|order number/i },
  { path: '/cart', text: /your cart|order summary/i },
  { path: '/checkout', text: /checkout|cart is empty|order summary/i },
];

test.describe('public website', () => {
  test.beforeEach(async ({ page }) => {
    // Block next-auth session polling — it retries on 500 and keeps the browser alive during teardown
    await page.route('**/api/auth/**', route => route.abort());
  });

  for (const route of publicRoutes) {
    test(`${route.path} renders without errors`, async ({ page }) => {
      await page.goto(route.path);
      await expectPageReady(page);
      await expect(page.locator('body')).toContainText(route.text);
    });
  }

  test('desktop header navigates between core public pages', async ({ page }) => {
    await page.goto('/menu');
    await expectPageReady(page);

    await page.getByRole('link', { name: /^About$/ }).first().click();
    await expect(page).toHaveURL(/\/about$/);
    await expect(page.locator('body')).toContainText(/about|our story|visit us/i);

    await page.getByRole('link', { name: /^Contact$/ }).first().click();
    await expect(page).toHaveURL(/\/contact$/);
    await expect(page.locator('body')).toContainText(/send us a message/i);

    await page.getByRole('link', { name: /^Menu$/ }).first().click();
    await expect(page).toHaveURL(/\/menu$/);
    await expect(page.locator('body')).toContainText(/a menu built/i);
  });

  test('menu shows categories and opens a dish detail page', async ({ page }) => {
    await page.goto('/menu');
    await expectPageReady(page);

    await expect(page.getByRole('heading', { name: 'Signature Starters' })).toBeVisible();
    await expect(page.getByText('Truffle Dahi Puri').first()).toBeVisible();

    // Dish cards render an "Order" link (not the dish name) — navigate directly
    await page.goto('/menu/truffle-dahi-puri');
    await expect(page).toHaveURL(/\/menu\/truffle-dahi-puri$/);
    await expect(page.getByRole('heading', { name: /truffle dahi puri/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /add to cart/i })).toBeVisible();
  });
});
