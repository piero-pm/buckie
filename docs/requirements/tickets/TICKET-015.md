# TICKET-015: Dashboard savings projection

Status: recommendation; human approval pending

| Field | Value |
| --- | --- |
| Behavior | Dashboard (REQ-14) |
| Spec | [../delivery-spec-dashboard.md](../delivery-spec-dashboard.md) |
| Outcome | Roadmap outcome 4 — spending-visibility dashboard |
| Sequence | 15 of 15 |
| Depends on | TICKET-013 |

## Intent

As the owner, I see a forward savings projection, so my monthly review points
toward a saving decision.

## Behavior

The dashboard presents a forward savings estimate derived from the user's spending
trend, with the basis of the estimate stated. When there is too little history,
it clearly indicates insufficient data instead of showing a misleading figure.

## Acceptance

- Given at least the minimum history the projection needs, when viewed, then a
  forward savings estimate is shown with its basis stated (EX-DASH-4).
- Given a user with no captured spend, when viewed, then totals show zero and the
  projection indicates insufficient data (EX-DASH-5).
- Given the projection, when displayed, then it is clearly labelled as an estimate.

## Out of scope / notes

Open human decision: the projection method and whether it needs an income or
savings-target input, and the minimum history required. Epic B guidance advice is
excluded. No code or schema here. Recommendation awaiting human approval.
