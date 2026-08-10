# Analysis Brief: Epic A — Private Spending-Visibility Loop

Status: recommendation; human approval pending

| Field | Value |
| --- | --- |
| ID | BA-AN-001 |
| Owner | Human |
| Version | 0.1 |
| Date | 2026-08-10 |
| Source scope | [../product/epic-scope.md](../product/epic-scope.md) |

## 1. Purpose and Boundary

Elaborate approved Epic A into cohesive business behaviors a delivery role can
build and a human can verify. Consumer: Lead Developer and the verifying human.
Analysis question: what must the app do so the owner logs in privately, captures
spend with almost no friction, records fixed costs, and sees monthly visibility.

Excluded here (per epic scope): Epic B periodic guidance; Phase 2 bank/Excel
import and portfolio tracking; native app; multi-user friend onboarding. This
brief describes behavior in domain language only — no architecture, data model,
encryption mechanism, or UX/component design.

## 2. Actors and Evidence

| Actor/source | Need or evidence | Confidence | Link |
| --- | --- | --- | --- |
| Salaried spender/saver (owner) | Fast capture + monthly visibility | Medium (1 user) | [../product/strategy.md](../product/strategy.md) |
| Self-hoster/operator (owner) | Cheap run + provable privacy | Medium | [../product/strategy.md](../product/strategy.md) |
| Roadmap outcomes 1–4 | Approved outcome order | Recommendation | [../product/outcome-roadmap.md](../product/outcome-roadmap.md) |

## 3. Current and Target Process

As-is: the owner relies on memory, a bank app, or nothing; money movement stays
invisible and savings do not accumulate. To-be business flow:

1. Owner requests a sign-in code by email and enters it to start a private session.
2. During the day/week, owner records each spend (amount + category) in seconds.
3. Owner registers recurring monthly fixed costs once; they recur automatically.
4. At review, owner opens a dashboard: month-on-month totals, spend by category,
   and a savings projection, then names one saving decision.

Behaviors are delivered login → capture → recurring → dashboard, matching the
approved dependency order. Interfaces are responsive for iPhone and desktop browsers.

## 4. Business Rules and Exceptions

| Rule ID | Rule or exception | Source | Decision owner | Status |
| --- | --- | --- | --- | --- |
| BR-CAT-1 | Category chosen from an approved fixed taxonomy (see §5) | BA proposal | Human | Proposed |
| BR-DQ-1 | Amount required, greater than 0, at most 2 decimal places | BA proposal | Human | Proposed |
| BR-DQ-2 | Single display currency in Phase 1; value is a human decision | BA proposal | Human | Proposed |
| BR-DQ-3 | Date required, not in the future; today is allowed | BA proposal | Human | Proposed |
| BR-DQ-4 | Category required; empty category is rejected | BA proposal | Human | Proposed |
| BR-DQ-5 | Likely duplicate (same amount+category+date) warns but does not block | BA proposal | Human | Proposed |
| BR-CONF-1 | A user accesses only their own financial data; a multi-user host cannot read another user's money data | Epic scope | Human | Proposed |
| BR-PASS-1 | A >= 12-character alphanumeric encryption passphrase is required before any financial data is stored; it derives the client-side data key and the server never receives it (mechanism per ADR-002/003) | ADR-002/003 | Human | Proposed |
| BR-PASS-2 | No server-side passphrase recovery; a lost passphrase makes stored data permanently unreadable | ADR-002/003 | Human | Proposed |
| BR-REC-1 | A recurring monthly expense appears once in every month until ended | BA proposal | Human | Proposed |

BR-PASS-1/2 state the business behavior of the host-blind ADR-002/003 mechanism (a Lead Developer concern), not crypto detail.

## 5. Recommended Category Taxonomy (pending human approval)

Starting set from the human (bills, food, various/misc, gift, flight, rent), recommended as a fixed dropdown list:

Rent · Bills · Food · Transport & Travel · Gift · Health · Shopping · Miscellaneous

- "Flight" is folded into "Transport & Travel"; keeping a separate Flight entry is
  a human decision.
- Health and Shopping are BA additions to reduce Miscellaneous overload; the human
  must confirm, drop, or extend the list before build.
- Taxonomy is fixed for Phase 1; user-defined categories are out of scope here.

## 6. Impacts, Dependencies, and Risk

Trace: Goal → owner → (logs in privately | records spend fast | registers fixed
costs | reviews monthly) → login | capture | recurring | dashboard behaviors.
Dependencies: capture depends on login; recurring depends on capture; dashboard
depends on capture + recurring. Risks: capture friction breaks the habit;
privacy failure breaks trust; wrong taxonomy reduces data quality.

## 7. Decisions and Questions

Open decisions for the human: (1) category taxonomy final list; (2) Phase 1
display currency; (3) session lifetime and code expiry window; (4) sane maximum
amount and oldest allowed expense date; (5) savings-projection method and inputs.
Every rule above is a recommendation awaiting explicit human approval; no rule was
invented to close a gap without being flagged.
