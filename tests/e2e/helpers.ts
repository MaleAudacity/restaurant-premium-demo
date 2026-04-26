import { expect, type BrowserContext, type Page } from '@playwright/test';

export async function expectPageReady(page: Page) {
  await expect(page.locator('body')).toBeVisible();
  await expect(page.locator('body')).not.toContainText(/application error|internal server error|Unhandled Runtime Error/i);
}

export async function waitForNewChatMessage(
  page: Page,
  previousCount: number,
  timeoutMs = 5000,
) {
  await expect(async () => {
    const count = await page.locator('[data-testid="chat-message"]').count();
    expect(count).toBeGreaterThan(previousCount);
  }).toPass({ timeout: timeoutMs });
}

export async function waitForChatMessageCount(
  page: Page,
  predicate: (count: number) => boolean,
  timeoutMs = 5000,
) {
  await expect(async () => {
    const count = await page.locator('[data-testid="chat-message"]').count();
    expect(predicate(count)).toBe(true);
  }).toPass({ timeout: timeoutMs });
}

export async function loginAs(context: BrowserContext, role: 'OWNER' | 'MANAGER' | 'KITCHEN' | 'DELIVERY' = 'OWNER') {
  const port = process.env.PORT ?? '3000';
  const domain = '127.0.0.1';
  // Playwright requires either url OR (domain + path), not both
  await context.addCookies([
    {
      name: 'mirch-masala-demo-role',
      value: role,
      domain,
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
    },
  ]);
}

export async function addFirstMenuItemToCart(page: Page) {
  // Register seed AFTER the clear registered in beforeEach — init scripts run in registration order,
  // so clear runs first then seed wins. CartProvider's useEffect reads localStorage on mount.
  await page.addInitScript(() => {
    localStorage.setItem('mm_cart', JSON.stringify([{
      slug: 'truffle-dahi-puri',
      name: 'Truffle Dahi Puri',
      priceInPaise: 64900,
      quantity: 1,
    }]));
  });
  // Use domcontentloaded — webpack dev compile can take 15-20s and networkidle never resolves
  await page.goto('/menu/truffle-dahi-puri', { waitUntil: 'domcontentloaded' });
  await expectPageReady(page);
  // Wait for React hydration: AddToCartButton shows "In cart (1)" once CartProvider reads localStorage
  await expect(page.getByRole('button', { name: /in cart/i })).toBeVisible({ timeout: 15_000 });
}
