# Adding tests to LaunchIt — what to do, in order

Copy each file into the same path in your repo. Then make the small code changes below.
Search for `TODO` in the test files: those are names/routes I couldn't see.

## 1. Install the tools

```powershell
pnpm --filter ./artifacts/api-server add -D jest ts-jest @types/jest supertest @types/supertest
pnpm --filter ./artifacts/launchit add -D @playwright/test
pnpm --filter ./artifacts/launchit exec playwright install chromium
```

Add to `artifacts/api-server/package.json` → `"scripts"`:

```json
"test": "node --experimental-vm-modules node_modules/jest/bin/jest.js"
```

## 2. Small code changes so the code is testable

**a. Export the classifier and state detection.**
In `services/permitData.ts`, put `export` in front of the business-type classifier.
If state detection is written inline in `routes/chat.ts`, move it into its own
function and export it. Update the imports in `classifier.test.ts` and
`stateDetection.test.ts` to the real names, and the expected values to the real labels.

**b. Use the JSON helper.** Replace the inline "find the `{...}` and parse it" code in
`services/claudeService.ts` with `parseClaudeJson(reply, defaults)` from
`src/lib/parseClaudeJson.ts`.

**c. Split app from listen.** Supertest needs the Express app without the server running.
- `src/app.ts`: builds the app and `export default app`
- `src/index.ts`: `import app from "./app"; app.listen(PORT)`

**d. Add a mock mode for Claude** (so CI doesn't spend money or flake). At the top of the
function in `claudeService.ts` that calls Claude:

```ts
if (process.env.MOCK_AI === "1") {
  return isDocumentRequest
    ? JSON.stringify({ title: "Mock document", content: "Mock document body" })
    : "Mock reply: thanks, let's get your bakery set up.";
}
```
(Match the return shape your function already uses.)

**e. Stop hardcoding the backend URL.** In the 9 pages that have
`const BASE = "https://launch-it-cnhy.onrender.com/api";` change it to:

```ts
const BASE = import.meta.env.VITE_API_URL ?? "https://launch-it-cnhy.onrender.com/api";
```
Without this, the Playwright test would sign up fake users on your **live** site.
(Better still: put it in one `src/lib/api.ts` and import it everywhere.)

**f. CORS:** allow `http://localhost:5173` with `credentials: true` so the session cookie works locally.

## 3. Run locally

```powershell
pnpm --filter ./artifacts/api-server test                 # Jest + Supertest (needs DATABASE_URL to a test DB)
pnpm --filter ./artifacts/launchit exec playwright test   # full flow
```
Use a separate test database for `DATABASE_URL`, never the production one — the API tests create users.

## 4. Make deploys wait for tests (Render)

1. On Render, open each service → **Settings** → set **Auto-Deploy** to **Off**.
2. In the same Settings page, copy the **Deploy Hook** URL for each service.
3. On GitHub: repo → **Settings → Secrets and variables → Actions** → add
   `RENDER_DEPLOY_HOOK_API` and `RENDER_DEPLOY_HOOK_WEB`.
4. Push. The `deploy` job in `ci.yml` only runs after `test` passes on `main`.

## 5. Update your notes

Replace "no automated tests" with something like:
"Jest unit tests for the classifier, state detection and AI-reply parsing; Supertest API tests for auth,
transactions and per-user data isolation; a Playwright end-to-end test; all run in GitHub Actions, and
deploys only happen when they pass."
