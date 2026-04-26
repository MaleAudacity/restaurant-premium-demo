import { expect, test } from '@playwright/test';
import { addFirstMenuItemToCart, expectPageReady } from './helpers';

test.describe('cart and checkout', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.removeItem('mm_cart'));
    await page.route('**/api/auth/**', route => route.abort());
  });

  test('adds a dish, changes quantity, removes it, and shows empty state', async ({ page }) => {
    await addFirstMenuItemToCart(page);

    await page.goto('/cart');
    await expectPageReady(page);
    await expect(page.getByText('Truffle Dahi Puri')).toBeVisible();
    await expect(page.getByText(/subtotal/i)).toBeVisible();

    await page.getByRole('button', { name: '+' }).click();
    // Quantity stepper span is scoped to main to avoid matching the CartBadge count span
    await expect(page.getByRole('main').locator('.flex.items-center.gap-2 span').filter({ hasText: /^2$/ })).toBeVisible();

    await page.getByRole('button', { name: '−' }).click();
    await expect(page.getByRole('main').locator('.flex.items-center.gap-2 span').filter({ hasText: /^1$/ })).toBeVisible();

    // Remove button renders as ✕ (not "remove")
    await page.getByRole('button', { name: '✕' }).click();
    await expect(page.getByText(/your cart is empty/i)).toBeVisible();
  });

  test('checkout validates delivery details and switches pickup/dine-in modes', async ({ page }) => {
    await addFirstMenuItemToCart(page);
    await page.goto('/checkout');
    await expectPageReady(page);

    await expect(page.getByPlaceholder('Delivery address')).toBeVisible();
    await page.getByRole('button', { name: /^Pickup$/ }).click();
    await expect(page.getByPlaceholder('Delivery address')).toHaveCount(0);

    await page.getByRole('button', { name: /^Dine In$/ }).click();
    await expect(page.getByPlaceholder('Delivery address')).toHaveCount(0);

    await page.getByRole('button', { name: /^Delivery$/ }).click();
    await page.getByPlaceholder('Your name').fill('Playwright Guest');
    await page.getByPlaceholder('Phone number').fill('+919000000001');
    await page.getByPlaceholder('Delivery address').fill('12 Test Street, Bengaluru');
    await expect(page.getByRole('button', { name: /place order/i })).toBeEnabled();
  });

  test('cart survives page reload through localStorage', async ({ page }) => {
    await addFirstMenuItemToCart(page);
    await page.reload();
    await expect(page.getByRole('button', { name: /in cart \(1\)/i })).toBeVisible();

    await page.goto('/cart');
    await expect(page.getByText('Truffle Dahi Puri')).toBeVisible();
  });
});
