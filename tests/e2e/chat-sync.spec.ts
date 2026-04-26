import { expect, test } from '@playwright/test';
import {
  expectPageReady,
  loginAs,
  waitForChatMessageCount,
  waitForNewChatMessage,
} from './helpers';

test.describe.configure({ mode: 'serial' });

test.describe('chat sync', () => {
  test.beforeEach(async ({ context }) => {
    await loginAs(context, 'OWNER');
  });

  test('chat-to-chat sync: Tab A quick reply appears in Tab B', async ({ context }) => {
    const tabA = await context.newPage();
    const tabB = await context.newPage();

    // Both tabs land on /demo/chat. Tab A resets first so both share the welcome state.
    await tabA.goto('/demo/chat', { waitUntil: 'domcontentloaded' });
    await expectPageReady(tabA);
    await tabA.getByRole('button', { name: /reset conversation/i }).click();
    await tabA.waitForLoadState('domcontentloaded');
    await expect(tabA.getByRole('button', { name: /^order food$/i })).toBeVisible();

    await tabB.goto('/demo/chat', { waitUntil: 'domcontentloaded' });
    await expectPageReady(tabB);
    await expect(tabB.getByRole('button', { name: /^order food$/i })).toBeVisible();

    const beforeCount = await tabB.locator('[data-testid="chat-message"]').count();
    expect(beforeCount).toBeGreaterThan(0);

    // Tab A clicks the "Order Food" quick reply.
    await tabA.getByRole('button', { name: /^order food$/i }).click();

    // Tab B must observe new messages without refresh.
    await waitForNewChatMessage(tabB, beforeCount, 8000);
  });

  test('control-to-chat sync: control panel sample booking appears in chat tab', async ({ context }) => {
    const chatTab = await context.newPage();
    const controlTab = await context.newPage();

    await chatTab.goto('/demo/chat', { waitUntil: 'domcontentloaded' });
    await expectPageReady(chatTab);
    await chatTab.getByRole('button', { name: /reset conversation/i }).click();
    await chatTab.waitForLoadState('domcontentloaded');
    await expect(chatTab.getByRole('button', { name: /^order food$/i })).toBeVisible();

    const beforeCount = await chatTab.locator('[data-testid="chat-message"]').count();

    await controlTab.goto('/demo/control', { waitUntil: 'domcontentloaded' });
    await expectPageReady(controlTab);

    await controlTab.getByRole('button', { name: /create sample booking request/i }).click();

    await waitForNewChatMessage(chatTab, beforeCount, 8000);
    // Verify the booking status card landed in the chat tab.
    await expect(chatTab.getByText(/booking request submitted/i).first()).toBeVisible({
      timeout: 5000,
    });
  });

  test('reset sync: Tab A reset shrinks Tab B message thread', async ({ context }) => {
    const tabA = await context.newPage();
    const tabB = await context.newPage();

    await tabA.goto('/demo/chat', { waitUntil: 'domcontentloaded' });
    await expectPageReady(tabA);
    await tabA.getByRole('button', { name: /reset conversation/i }).click();
    await tabA.waitForLoadState('domcontentloaded');
    await expect(tabA.getByRole('button', { name: /^order food$/i })).toBeVisible();

    await tabB.goto('/demo/chat', { waitUntil: 'domcontentloaded' });
    await expectPageReady(tabB);
    await expect(tabB.getByRole('button', { name: /^order food$/i })).toBeVisible();

    const baselineCount = await tabB.locator('[data-testid="chat-message"]').count();

    // Progress the chat in Tab A so message count grows beyond the welcome baseline.
    await tabA.getByRole('button', { name: /^order food$/i }).click();
    await waitForNewChatMessage(tabB, baselineCount, 8000);

    const afterProgressCount = await tabB.locator('[data-testid="chat-message"]').count();
    expect(afterProgressCount).toBeGreaterThan(baselineCount);

    // Reset from Tab A. Tab B should fall back to the welcome baseline within timeout.
    await tabA.getByRole('button', { name: /reset conversation/i }).click();

    await waitForChatMessageCount(tabB, (count) => count <= baselineCount, 8000);
    await expect(tabB.getByRole('button', { name: /^order food$/i })).toBeVisible();
  });
});
