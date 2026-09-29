# Handover notes

Written for whoever picks this project up next. The main `README.md` covers
setup and features. This file covers the things that are not obvious from the
code, the decisions behind them, and the work that is still open.

---

## 1. How it actually deploys

**The live site is https://yourminervavibe.com, served by Firebase App Hosting**
(Cloud Run + Cloud Build), project `legacyquestionnaire-minerva`, backend
`legacyquestionnaire`, region `us-central1`. It builds from the GitHub repo
`pekkimori/legacyquestionnaire`, branch `main`, using `apphosting.yaml` for
environment configuration.

**Auto-rollout on merge is unreliable.** It worked in June 2026, then silently
stopped firing for several merges in a row. The backend settings look correct
(`traffic.rolloutPolicy.codebaseBranch` is `main`), so it is most likely the
GitHub connection needing to be reconnected in the Firebase console under
App Hosting → Settings, which requires an Owner on the project. Until someone
does that, deploy manually after every merge:

```bash
firebase login   # once
firebase apphosting:rollouts:create legacyquestionnaire \
  --git-commit <merge-sha> --project legacyquestionnaire-minerva --force
```

That command builds and rolls out, and only reports success if the build
reached READY. Give it five to ten minutes.

**Verifying a deploy without admin credentials:** fetch the public bundle and
grep for text you just changed.

```bash
curl -s https://yourminervavibe.com/super-secret | grep -oE "super-secret-[a-f0-9]+\.js"
curl -s "https://yourminervavibe.com/_next/static/chunks/pages/<that-file>" | grep "your new string"
```

**`gcloud` auth on a Minerva account dies every few days** with
"Reauthentication failed. cannot prompt during non-interactive execution",
because of a Workspace session policy. The Firebase CLI does not have this
problem, so prefer it. If a `gcloud` command hangs, kill the stuck `python`
process by PID.

**`firebase deploy` is not the deploy path.** `firebase.json` deliberately sets
`alwaysDeployFromSource: false` for the App Hosting backend so that
`firebase deploy` skips it. Setting it to `true` makes `firebase deploy` push
your **local working copy** live, bypassing git entirely. Do not change it.

---

## 2. How the sorting works

Two separate instruments are collected from every student:

1. **Multiple-choice questions.** Each answer adds one point to one legacy.
   Twenty-five questions, so twenty-five points spread over twenty-five
   legacies. Stored as `results.affinityVector`.
2. **Credo sorting screens.** Five screens rank five legacies each (all 25, in
   alphabetical blocks), and a sixth ranks Minerva's core competencies. Stored
   as `sorting_group_0` through `sorting_group_5`.

**Ranking** (`src/utils/allocate.ts`, `rankLegacies`) orders legacies by:

1. question score, highest first
2. credo position, where they ranked that legacy on its screen
3. alphabetical order, as a last resort

**Vibe.** On first completion, `src/pages/Final.tsx` takes the top of that
ranking and draws a word from that legacy's three-word pool. It is written once
and never recomputed. **Do not remove the write-once guard.** An earlier version
recalculated on every page load and picked the word at random, so people's
vibes changed when they revisited. That caused real distress and prompted much
of this work.

**Allocation** (`src/pages/api/allocate-cohort.ts`) is admin-triggered, not
automatic. It balances the cohort across all 25 legacies so group sizes differ
by at most one, assigns people with the strongest single-legacy preference
first, and gives each person the highest-ranked legacy with room left.

**Re-running allocation reshuffles everyone.** It re-allocates from scratch, so
assignments change as new responses arrive. Treat it as final only once
responses have closed.

---

## 3. Admin tools

Everything lives at `/super-secret`. The heart-clicks easter egg and the
`tenofheartsintheTL` prompt are how you find the page; they are **not** the
security boundary. Access is a Firebase ID token verified server-side against
the `ADMIN_EMAILS` allowlist in `apphosting.yaml` (`src/utils/verifyAdmin.ts`).
To change who is an admin, edit that list and roll out.

| Endpoint | Purpose |
| --- | --- |
| `GET /api/cohort-overview?cohort=X` | Dashboard data: counts, per-person table, run history |
| `GET /api/export-cohort-roster?cohort=X` | Per-cohort CSV with demographics and choices |
| `GET /api/export-responses` | Every response, all cohorts, full detail |
| `POST /api/allocate-cohort` | Runs allocation for one cohort |

**Cohorts are not only graduation years.** Staff and faculty take the same quiz
and pick `Staff` or `Faculty` on the demographics popup. Every admin tool is
scoped to a single cohort, so `COHORT_OPTIONS` in `src/pages/super-secret.tsx`
**must** list every value the demographics popup offers. When those two drifted
apart, staff responses were collected but completely unreachable from the admin
page.

Allocation works fine for a handful of people: with fewer people than legacies,
every legacy has capacity one and everyone simply gets their top choice.

---

## 4. Reading the exports

Two columns look similar and are not:

- **Vibe Legacy** is the legacy their vibe word came from, saved when they
  finished the quiz.
- **1st Choice** is the top of their current ranking.

These match for anyone who finished after September 2026. For people who
finished before that they can differ, because their vibe was saved before the
credo tie-break existed, and vibes are never recomputed.

**A "tied" label means the ordinal is arbitrary**, that is, the same question
score *and* nothing in the credo ranking to separate them. Scores are small
integers, so ties are common, and this matters when reviewing allocations by
hand.

---

## 5. Local development

```bash
npm install
npm run dev          # needs NEXT_PUBLIC_FIREBASE_* env vars, see apphosting.yaml
npm test             # unit tests
npm run test:integration
```

**Integration tests need Java 21 or newer.** With an older JRE,
`firebase emulators:exec` can exit 0 **without running the tests**, which looks
exactly like a pass. If the integration run finishes suspiciously fast, check
`java -version` first.

Emulator gotchas: start them with the real project id if you are exercising
anything that verifies ID tokens, since the token audience must match the
server's project. The app's Content Security Policy only allows
`connect-src 'self'`, so a browser cannot call the emulator directly; proxy it
through a Next.js rewrite if you want to click around locally.

---

## 6. Open work, roughly in priority order

1. **Replace the greedy allocator.** It processes people one at a time and
   gives each the best legacy still open, so whoever is handled last gets the
   leftovers. On the 2030 cohort that put someone in their 23rd choice.
   Considering the whole cohort at once and minimising total preference rank
   (a min-cost matching, the classic assignment problem) gets about 99% of
   people into their top five **with group sizes unchanged**. That figure is
   measured on real data, not theoretical. It is the single highest-value
   change available.
2. **Weight the credo rankings into the score**, rather than using them only to
   break ties. Branden's suggestion: award points by rank position, so first
   place is worth three, second two, and so on. This directly attacks the
   flat-scoring problem below.
3. **The scoring is too flat.** Twenty-five points over twenty-five legacies
   gives top scores of two to five points, so half of students tie for their
   top legacy. The credo tie-break settles roughly two thirds of those but
   cannot settle all: each screen only ranks five legacies against each other,
   so two tied legacies from different screens were never compared.
4. **Country diversity.** Branden would like to avoid putting two people from
   the same country in one group. Feasible in principle, since the largest
   country in 2030 was 14 people against 25 groups, but it competes with the
   top-five goal and realistically needs the matching approach in item 1. It
   also needs a questionnaire change: only one country is stored per person, so
   dual citizenship cannot currently be expressed.
5. **Fix auto-rollout** (see section 1).

---

## 7. Things that will bite you

- **Never recompute a stored vibe.** See section 2.
- **`ADMIN_API_SECRET` is gone.** Admin access is the email allowlist now. Any
  reference to a shared admin password is stale.
- **Firestore has no point-in-time recovery and no delete protection.** As of
  September 2026 both are disabled and the history window is about an hour. The
  2030 cohort's responses were cleared from the database at some point after the
  August sort. Enabling both costs little and would prevent an unrecoverable
  mistake.
- **`firebase firestore:delete` is the only destructive CLI command in reach.**
  Treat it with suspicion.
- **The credo screens were collected for a long time without being used.** They
  were written to Firestore from the start but never read by the scoring until
  September 2026. If you add another input, wire it into `rankLegacies` or it
  will quietly do nothing.
- **Keep ranking logic in one place.** The exports, the dashboard, the allocator
  and the vibe all call `rankLegacies`. When two of them resolved ties
  differently, the roster contradicted itself and it took a while to work out
  why.

---

## 8. Contacts

- **Branden Alexander** (`branden@minerva.edu`), project owner. Runs the sorting
  and knows what the output is used for.
- Production repo: `pekkimori/legacyquestionnaire`.
