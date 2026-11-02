import { defineConfig, devices } from "@playwright/test";

// Safety check: the test creates users, so it must use the TEST database.
// Without this, the backend would fall back to the database in your .env file.
if (!process.env.DATABASE_URL) {
  throw new Error("Set DATABASE_URL to your TEST database before running Playwright.");
}

const API_PORT = "3001";
const WEB_PORT = "3000";

export default defineConfig({
  testDir: "./e2e",
  timeout: 90_000,
  expect: { timeout: 15_000 },
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: `http://localhost:${WEB_PORT}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      // Backend, with fake AI replies
      command: "pnpm --filter ./artifacts/api-server run build && pnpm --filter ./artifacts/api-server run start",
      cwd: "../..",
      // /api/auth/me answers 401 when logged out, which Playwright treats as "server is up"
      url: `http://localhost:${API_PORT}/api/auth/me`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: { PORT: API_PORT, NODE_ENV: "test", MOCK_AI: "1" },
    },
    {
      // Frontend; Vite forwards /api calls to the backend above
      command: "pnpm --filter ./artifacts/launchit run dev",
      cwd: "../..",
      url: `http://localhost:${WEB_PORT}`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        PORT: WEB_PORT,
        API_PORT,
        VITE_API_URL: `http://localhost:${WEB_PORT}`,
      },
    },
  ],
});