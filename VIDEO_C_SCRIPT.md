# Video C — Real PR Walkthrough (3–5 min)

App: **Wayfarer**, a trip planner (hotels, flights, cars, tours, tickets, dining, transfers). English UI, prices in USD.
Local repo with 3 states, all ready to show:

| Branch | What it is |
|---|---|
| `main` | Full prototype app, 6 Playwright tests passing |
| `feat/quick-add-button` | **The PR**: "Add to trip" button → "+ Add" (changes visible text and aria-label) |
| `proposal/fix-quick-add-locators` | **The proposed repair** (for review only, never auto-merged) |

## Script (≈4:15)

**0:00–0:25 · Context**
Show the app (`npm run dev`): add a hotel, a flight and a tour; confirm the trip.
"This is Wayfarer. The critical flow: build a trip across several categories and confirm it. It has 6 Playwright E2E tests, all green on `main`."

**0:25–1:05 · The change (the PR)**
`git diff main..feat/quick-add-button -- src/App.jsx`
"This PR makes the button more compact: from 'Add to trip' to '+ Add'. It changes the visible text and the aria-label. It looks like a copy tweak, but it touches the contract the tests use to find the button."

**1:05–1:50 · Which flow to test**
Explain the reasoning: the diff touches `ItemCard`, used in EVERY category and step 1 of any booking. So the first pick is `plan a full trip` (3 categories + total + payment + confirmation). The rest of the suite also runs; the search/sort test doesn't use the button and should stay green, which helps bound the damage.

**1:50–2:40 · Playwright run**
`npx playwright test` → 5 of 6 tests time out (~30 s each); only "search and sort" passes because it never touches the button.
Show the call log: `waiting for getByRole('button', { name: 'Add to trip' })`.
Open the trace: `npx playwright show-trace test-results/*/trace.zip` and the failure screenshot.

**2:40–3:25 · Diagnosis**
Questions answered with evidence:
- Is the app broken? No: the screenshot shows the catalog and the "+ Add" button works.
- Product bug or test bug? **Test** (stale locator): the copy change was intentional.
- Classification: *test drift*, low risk, root cause = text-based locator.
- Honesty note: if the button had vanished or stopped responding, it would be a real bug and the test would NOT be patched.

**3:25–4:10 · Proposed repair (for review)**
`git diff feat/quick-add-button..proposal/fix-quick-add-locators`
One-line change (the `addItem` helper is used by every test): `{ name: 'Add to trip' }` → `{ name: /^Add / }`. Run on the proposal branch: 6/6 green.
"This does not merge itself: it stays a proposal for a person to review. They decide whether to accept the new locator or prefer a more stable `data-testid`."

**4:10–4:30 · Wrap-up**
Handoff recap: change → chosen flow → run → diagnosis → reviewable proposal.

## Recording-day commands

```bash
cd ~/Documents/travelsBooking
git checkout main && npx playwright test                    # green
git checkout feat/quick-add-button && npx playwright test   # red
npx playwright show-trace test-results/*/trace.zip
git diff feat/quick-add-button..proposal/fix-quick-add-locators
git checkout proposal/fix-quick-add-locators && npx playwright test   # green
```

Tip: lower `timeout` to 8 s in `playwright.config.js` while recording so the failure doesn't take 30 s.
