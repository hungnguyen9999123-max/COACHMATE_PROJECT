# CoachMate redesign implementation plan

## Architecture decision

The workspace does not contain an existing production frontend to extend. The only source is a standalone prototype. Before implementation, create a maintainable application shell rather than promoting that file to production.

Recommended baseline:

- React + TypeScript + Vite for a small, maintainable client application.
- React Router for URL-addressable role areas and details.
- CSS variables plus scoped component styles for the design system; avoid introducing a heavy UI framework.
- Lucide React for consistent icons.
- A typed domain layer with pure selectors/calculators extracted from the prototype.
- A repository interface with a versioned `localStorage` adapter first, designed so a future API adapter can replace it without changing screens.
- Vitest for business-rule regression tests and React Testing Library for critical interactions.
- No real payment SDK until a backend/payment contract is supplied.

If a real frontend or API exists elsewhere, pause scaffolding and import that code first; its stack and contracts take precedence over this recommendation.

## Proposed route map

| Area | Route | Purpose |
|---|---|---|
| Student | `/courses` | Course marketplace |
| Student | `/courses/:courseId` | Course details |
| Student | `/courses/:courseId/checkout` | Simulated enrollment flow |
| Student | `/tournaments` | Tournament marketplace |
| Student | `/tournaments/:tournamentId` | Tournament details and bracket |
| Student | `/me/courses` | Registered courses and progress |
| Student | `/me/tournaments` | Registered tournaments and schedules |
| Student | `/me/payments` | Derived payment history |
| Coach | `/coach` | Coach dashboard |
| Coach | `/coach/courses` | Course management |
| Coach | `/coach/courses/new` | Create course |
| Coach | `/coach/courses/:courseId/edit` | Edit course after business rules are approved |
| Coach | `/coach/pro` | Coach Pro subscription |
| Admin | `/admin` | Revenue dashboard |
| Admin | `/admin/tournaments` | Tournament management |
| Admin | `/admin/tournaments/new` | Create tournament |
| Admin | `/admin/tournaments/:tournamentId` | Registrations, finance, bracket, results |
| Admin | `/admin/assumptions` | Configuration and validation tracking |
| Admin | `/admin/activity` | Activity log |

## Domain and state boundaries

```text
UI screens and components
        ↓ commands / queries
Application services
  enrollment · subscriptions · tournaments · reviews · demo reset
        ↓
Pure domain rules
  course status · totals · break-even · bracket · progression
        ↓
Repository interface
  localStorage adapter now · API adapter later
```

Suggested domain modules:

- `courses`: filters, ordering, capacity status, enrollment and coach earnings.
- `tournaments`: registration, economics, bracket generation, scheduling, results, winner progression.
- `finance`: platform totals, held funds, commission and payment fee policy.
- `subscriptions`: Coach Pro status, subscribe, cancel, historical charges.
- `analytics`: funnel counters and future event timestamps.
- `activity`: capped reverse-chronological log.
- `persistence`: schema versioning, migrations, reset and corruption fallback.

## Design system foundation

### Tokens

- Primary `#168A63`
- Primary dark `#116B4D`
- Mint `#E4F5EC`
- Lime accent `#C6F135`
- Background `#F7F9F8`
- Surface `#FFFFFF`
- Main text `#20332D`
- Secondary text `#74837C`
- Border `#E7EDE9`
- Typography: `Be Vietnam Pro` for Vietnamese-first UI, with a system fallback.
- Radius scale centered on 12–16 px; restrained shadows and motion.

### Reusable components

- App header, student navigation, dashboard sidebar, mobile navigation.
- Page header, breadcrumbs, role/demo switcher.
- Button, icon button, input, select, textarea, filter chip, form field and inline error.
- Card, metric tile, status badge, avatar, rating, progress/capacity indicator.
- Data table, responsive list, pagination-ready toolbar.
- Dialog, drawer, confirmation dialog, toast, empty state, skeleton and error state.
- Course card, coach summary, tournament card, finance breakdown and bracket match card.

## Delivery plan

### Sprint 0 — preservation harness

1. Copy seed data into typed fixtures without changing values.
2. Extract and test course status, filtering/order, rating, tournament economics, platform totals, bracket generation, scheduling, progression, and result rules.
3. Add a persisted-state schema and migration from `coachmate-cp3-mvp-v1` so current browser demo data can be retained where feasible.
4. Record the baseline calculations from the feature audit as regression tests.
5. Keep the original HTML untouched as the comparison reference.

Exit criteria:

- All baseline fixtures and formulas match the prototype.
- A reset produces the same seeded records and totals.
- Ambiguous accounting and edit rules are documented as decisions, not silently normalized.

### Sprint 1 — design system and student experience

1. Set up the application shell, routing, tokens, responsive top navigation, accessible overlays, and feedback states.
2. Build the course marketplace with live search, filters, featured sorting, image-led cards, capacity states, and empty states.
3. Build course detail and simulated checkout with validation and success handoff.
4. Build tournament marketplace/detail and singles/doubles registration.
5. Build My Activities tabs for courses, tournaments, schedule, derived payments, binary completion, and reviews.
6. Add tablet/mobile behavior and keyboard coverage as components land.

Exit criteria:

- Every existing student flow works from a URL and survives reload.
- Payment is consistently labeled simulated.
- Search/filter/order and all enrollment calculations pass regression tests.

### Sprint 2 — coach experience

1. Build coach sidebar/dashboard, KPI cards, recent activity surface, and course performance views.
2. Build course management and reusable create/edit form sections.
3. Preserve live commission preview and historical enrollment values.
4. Build Coach Pro plan/status/benefits and simulated upgrade/cancel confirmations.
5. Gate any unimplemented Pro benefit with honest “coming soon” treatment rather than fake controls.

Exit criteria:

- Dashboard totals equal the prototype for every seeded coach.
- Course creation produces an immediately discoverable marketplace course.
- Edit/status behavior ships only after the business decisions below are approved.

### Sprint 3 — organizer/admin experience

1. Build revenue dashboard, breakdown, held-funds callout, funnel visualization, and profit semantics.
2. Build tournament list, creation flow, finance editor, minimum/break-even warning, and demo registration tool.
3. Build registration view, bracket, match schedule, court/referee assignment, result entry, progression, and champion state.
4. Build business settings, assumption tracker, and activity log.
5. Add confirmation dialogs for bracket generation, cost changes, and other consequential actions.

Exit criteria:

- Seeded finance totals and tournament break-even figures match the audit.
- Bracket generation and every result progression path are deterministic and tested.
- A student sees updated bracket/schedule state after admin operations.

### Sprint 4 — quality and readiness

1. Test desktop and tablet layouts, then key mobile breakpoints.
2. Complete focus management, labels, contrast, reduced-motion, keyboard navigation, and screen-reader announcements.
3. Add malformed-storage recovery and error boundaries.
4. Run interaction, regression, route, and console-error checks.
5. Perform visual QA against the design tokens and shared component inventory.
6. Document the future API boundary and replace demo-only actions with clear labels.

Exit criteria:

- No broken routes or console errors in supported flows.
- Critical interactions are keyboard accessible.
- Business-rule tests, component tests, and production build pass.
- The original prototype remains available only as an audit/reference artifact, not the production entry point.

## Decisions required before net-new behavior

These do not block the preservation-first shell, but they do block a correct production implementation of the related features:

1. **Course lifecycle:** draft/published/full/completed/cancelled states, and whether coaches can edit price/capacity/schedule after enrollment.
2. **Historical pricing:** confirm that paid registrations retain their original fee when organizers edit an event. The prototype currently rewrites them.
3. **Payment accounting:** decide whether tournament payment fees are snapshotted per registration, matching course enrollments, or recomputed from current settings.
4. **Refunds/cancellations:** define who may cancel, refund amount/timing, and the accounting/activity-log effects.
5. **Tournament scoring:** retain the MVP’s one-number-per-side result or implement real best-of-three game scores and badminton validation.
6. **Registration controls:** duplicate prevention, waitlists, check-in, removal, partner replacement, and capacity enforcement at the service layer.
7. **Identity:** authentication provider, role authorization, current-user profile, and organizer/coach ownership rules.
8. **API/backend:** endpoint contracts, persistence model, money representation, concurrency/versioning, and audit requirements.
9. **Media:** image source/licensing and upload/storage policy for course and tournament covers.
10. **Locale/time:** timezone, currency storage, localization strategy, and whether the product remains Vietnamese-only.

## Verification matrix

| Risk | Required verification |
|---|---|
| Formula drift | Unit tests with seeded baseline totals and edge cases (zero entries, full class, infinite break-even) |
| Bracket regressions | Tests for 4, 5, 8, 9, 16, and 32 entries, byes, every round progression, and champion state |
| Persistence loss | Migration/corruption/reset tests using the existing storage key fixture |
| Role leakage | Route and action authorization tests once identity exists |
| False payment claims | Copy review and tests asserting simulation disclosure in every checkout/success state |
| Responsive bracket/table failures | Visual checks at desktop, tablet, and compact widths |
| Accessibility regressions | Keyboard flows, dialog focus tests, semantic labels, contrast, reduced-motion checks |

## Immediate next implementation step

Proceed with Sprint 0 and the Sprint 1 application shell only after confirming whether another repository or backend should be imported. If this workspace is the complete source, scaffold the recommended React/TypeScript application alongside the untouched reference HTML and begin from the preservation tests.
