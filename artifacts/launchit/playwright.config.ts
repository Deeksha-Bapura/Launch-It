import { defineConfig, devices } from "@playwright/test";

// Starts the API and the frontend locally, then runs the browser test.
// TODO: change ports / start commands to match your package.json scripts.
const API_PORT = 8080;
const WEB_PORT = 5173;

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: `http://localhost:${WEB_PORT}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: "pnpm --filter ./artifacts/api-server run dev",
      cwd: "../..",
      url: `http://localhost:${API_PORT}/api/healthz`, // TODO: any GET route that returns 200
      reuseExistingServer: !process.env.CI,
      env: { PORT: String(API_PORT), MOCK_AI: "1" },
      timeout: 120_000,
    },
    {
      command: `pnpm --filter ./artifacts/launchit run dev -- --port ${WEB_PORT}`,
      cwd: "../..",
      url: `http://localhost:${WEB_PORT}`,
      reuseExistingServer: !process.env.CI,
      env: { PORT: String(WEB_PORT), VITE_API_URL: `http://localhost:${API_PORT}/api` },
      timeout: 120_000,
    },
  ],
});
