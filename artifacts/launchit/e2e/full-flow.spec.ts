import { test, expect } from "@playwright/test";

// One full user journey: sign up -> chat -> generate a document.
// TODO: the selectors below use visible labels/text. Change them to match
// your pages, or add data-testid attributes and use page.getByTestId(...).

test("sign up, chat, then generate a document", async ({ page }) => {
  const email = `e2e_${Date.now()}@example.com`;

  // 1. Sign up
  await page.goto("/signup");
  await page.getByLabel(/name/i).fill("E2E Baker");
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill("testpass123");
  await page.getByRole("button", { name: /sign up|create account/i }).click();

  // Lands on onboarding or dashboard
  await expect(page).toHaveURL(/onboarding|dashboard|chat/);

  // 2. Chat (backend runs with MOCK_AI=1, so the reply is a fixed string)
  await page.goto("/chat");
  const box = page.getByPlaceholder(/type|message|ask/i);
  await box.fill("I bake cakes from home in Houston, Texas");
  await box.press("Enter");
  await expect(page.getByText(/mock reply/i)).toBeVisible({ timeout: 20_000 });

  // 3. Generate a document
  await page.goto("/documents");
  await page.getByRole("button", { name: /generate|create/i }).first().click();
  await expect(page.getByText(/mock document/i)).toBeVisible({ timeout: 20_000 });

  // Reload to prove it was saved, not just shown
  await page.reload();
  await expect(page.getByText(/mock document/i)).toBeVisible();
});
