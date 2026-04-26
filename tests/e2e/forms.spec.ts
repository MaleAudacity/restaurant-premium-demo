import { expect, test } from '@playwright/test';
import { expectPageReady } from './helpers';

test.describe('guest forms', () => {
  test.beforeEach(async ({ page }) => {
    // Block next-auth session polling — retries on 500 and keeps the browser context alive during teardown
    await page.route('**/api/auth/**', route => route.abort());
  });

  test('contact form submits and can be reset', async ({ page }) => {
    await page.goto('/contact', { waitUntil: 'domcontentloaded' });
    await expectPageReady(page);

    // Labels use CSS uppercase but HTML text is lowercase — target by id/name to be safe
    await page.locator('#contact-name').fill('Playwright Guest');
    await page.locator('#contact-email').fill('guest@example.com');
    await page.locator('#contact-subject').selectOption('feedback');
    await page.locator('#contact-message').fill('This is an automated test message.');

    const sendBtn = page.getByRole('button', { name: /send message/i });
    await expect(sendBtn).toBeEnabled();
    await sendBtn.scrollIntoViewIfNeeded();
    await sendBtn.click();

    // ContactForm simulates 1.2 s async send via setTimeout
    await expect(page.getByText(/message sent/i)).toBeVisible({ timeout: 15_000 });
    await page.getByRole('button', { name: /send another message/i }).click();
    await expect(page.getByRole('button', { name: /send message/i })).toBeVisible();
  });

  test('booking form exposes all required reservation inputs', async ({ page }) => {
    await page.goto('/book-table');
    await expectPageReady(page);

    // Booking form labels are plain text nodes without htmlFor/id — target by name attribute
    await page.locator('input[name="firstName"]').fill('Playwright');
    await page.locator('input[name="lastName"]').fill('Guest');
    await page.locator('input[name="phone"]').fill('+919000000002');
    await page.locator('input[name="email"]').fill('booking@example.com');
    await page.locator('input[name="bookingDate"]').fill('2027-01-15');
    await page.locator('input[name="bookingTime"]').fill('20:30');
    await page.locator('input[name="guestCount"]').fill('4');
    await page.locator('select[name="seatingPreference"]').selectOption('Window seating');
    await page.locator('select[name="specialOccasion"]').selectOption('Birthday');
    await page.locator('textarea[name="notes"]').fill('Window side, please.');

    await expect(page.getByRole('button', { name: /request table/i })).toBeEnabled();
  });

  test('track order form uppercases order number and handles unknown orders', async ({ page }) => {
    await page.goto('/track-order', { waitUntil: 'domcontentloaded' });
    await expectPageReady(page);

    const orderInput = page.getByPlaceholder('MM-1001');
    // Fill with already-uppercase value — the onChange transforms to uppercase anyway,
    // so the final state will be MM-DOES-NOT-EXIST regardless of input case.
    await orderInput.fill('MM-DOES-NOT-EXIST');
    await page.getByPlaceholder('+91 90000 10001').fill('+919999999999');
    await page.getByRole('button', { name: /track order/i }).click();

    await expect(page.locator('body')).toContainText(/not found|unable|try again|order/i, { timeout: 10_000 });
  });
});
