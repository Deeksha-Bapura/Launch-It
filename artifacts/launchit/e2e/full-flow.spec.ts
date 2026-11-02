import { test, expect } from "@playwright/test";

test("sign up, chat, then generate an invoice", async ({ page }) => {
  const email = `e2e_${Date.now()}@example.com`;

  // 1. Sign up
  await page.goto("/signup");
  await page.getByPlaceholder("Maria Garcia").fill("E2E Baker");
  await page.getByPlaceholder("you@example.com").fill(email);
  await page.getByPlaceholder("Min. 8 characters").fill("testpass123");
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/onboarding/);

  // 2. Chat until the document buttons appear
  await page.goto("/chat");
  const box = page.getByPlaceholder(/Type your message/);
  const invoiceButton = page.getByRole("button", { name: /Invoice Template/ });
  const messages = [
    "I bake cakes from home in Houston, Texas",
    "I sell about 10 cakes a week to neighbors",
    "I want to make my bakery official",
    "What documents do I need?",
  ];

  for (let i = 0; i < messages.length; i++) {
    await expect(box).toBeEnabled();
    await box.fill(messages[i]);
    await box.press("Enter");
    // Wait for the (fake) assistant reply
    await expect(page.getByText(/Mock reply/)).toHaveCount(i + 1);
    if (await invoiceButton.isVisible()) break;
  }

  // 3. Generate an invoice
  await expect(invoiceButton).toBeVisible();
  await invoiceButton.click();
  await expect(page).toHaveURL(/\/documents/);

  // 4. The invoice is listed, and still there after a reload (so it was saved)
  const emptyState = page.getByText(/Once we figure out what you need/);
  for (const reload of [false, true]) {
    if (reload) await page.reload();
    await expect(emptyState).toHaveCount(0);
    await expect(page.getByText(/invoice/i).first()).toBeVisible();
  }
});