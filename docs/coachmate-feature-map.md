# CoachMate MVP feature audit and redesign map

## Audit scope

- Reference: `CoachMate MVP.html`
- Audit date: 2026-10-30
- Source shape: one 59 KB HTML file containing all markup, CSS, JavaScript, sample data, calculations, and UI state.
- Existing framework: none.
- Existing routes: none. Role and tab state are held in memory and the whole main region is re-rendered with string templates.
- Existing API integrations: none. There are no `fetch`, XHR, WebSocket, form-action, or SDK calls.
- Persistence: a single `localStorage` item named `coachmate-cp3-mvp-v1`, guarded by schema version `v: 1`.
- External dependency: Google Fonts (`Oswald` and `Public Sans`) only.
- Payment: explicitly simulated; no money is collected.

## Current information architecture

| Role | Existing navigation | Existing screens / overlays |
|---|---|---|
| Student / Player | Courses, Tournaments, Mine | Course marketplace, course detail modal, course checkout modal, tournament marketplace, tournament detail modal, tournament checkout modal, success modal, my courses, my tournaments, coach review modal |
| Coach | Overview, Create course, Coach Pro | Coach switcher, KPI overview, course performance table, create-course form, Coach Pro subscription card |
| Admin | System dashboard, accounts, content, transactions, reports, settings | Account and role controls, Coach/Student management, course moderation, simulated transactions, platform reports, system settings, activity log |
| Organizer | Tournaments, operations, schedule, results | Tournament operations, create-tournament flow, cost editor, registration review, courts/referees, bracket, result entry, standings |

## Feature mapping

Status meanings:

- **Preserve**: implemented in the prototype and must retain its rules.
- **Extend**: implemented in a limited form and expanded by the redesign brief.
- **New**: requested by the redesign brief but not implemented in the prototype.

### Cross-role platform

| Status | Existing feature | Existing screen | Redesigned destination | Required interactions | Logic / constraint to preserve |
|---|---|---|---|---|---|
| Preserve | Role switching | Header profile menu | Student, Coach, Admin, and Organizer navigation; role preview switcher available in demo mode | Switch role without losing saved data | Roles are `student`, `coach`, `admin`, and `organizer`; this demo switcher is not authentication |
| Preserve | Sample-data notice | Global notice bar | Compact demo-mode banner | Clearly state that data and payments are simulated | Never imply real payments or production data |
| Preserve | Reset sample data | Global notice bar | Settings / demo tools confirmation dialog | Confirm reset, restore seed, show success toast | Replace the entire stored state with `seed()` and persist it |
| Preserve | Local persistence | Invisible data layer | Versioned client repository / store | Load on startup; save after mutations; recover safely from invalid storage | Key `coachmate-cp3-mvp-v1`; accept only data with `v === 1`; fall back to seed on errors |
| Extend | Toast feedback | Global toast | Accessible toast system | Success, warning, and error feedback; keyboard/screen-reader announcements | Existing success/error copy and mutation timing should remain equivalent |
| Extend | Modal sheets | Course, checkout, review, tournament, create tournament | Responsive dialogs / drawers | Escape and scrim close, focus trap, restore focus, prevent accidental loss for dirty forms | Existing overlay closes only from the scrim; Escape closes any open modal |
| New | Loading and error states | Not present | All async-ready screens | Skeletons, retry states, disabled pending actions | UI-only readiness for future APIs; do not fabricate network behavior |
| New | Route-level navigation | Not present | URL-addressable pages | Deep links, back/forward support, not-found page | No legacy route contract exists |

### Student / Player

| Status | Existing feature | Existing screen | Redesigned destination | Required interactions | Logic / constraint to preserve |
|---|---|---|---|---|---|
| Preserve | Course search | Courses marketplace | Course Marketplace | Live search by course title, coach name, or venue | Case-insensitive substring match across exactly those three fields |
| Preserve | Course filters | Courses marketplace | Filter bar / mobile filter drawer | Level, area, schedule, maximum fee; reset filters; empty state | Filters combine with AND; price passes when `course.price <= max` |
| Preserve | Course ordering | Courses marketplace | Results grid | Featured Coach Pro courses first, then earliest start date | Active Coach Pro status controls featured priority |
| Extend | Course cards | Courses marketplace | Image-led course cards | Open detail by click or keyboard; show coach, rating, schedule, price, capacity, status | Enrollment count is derived from enrollments, never stored separately |
| Preserve | Capacity progress | Course card/detail | Course card and booking panel | Show occupied/max seats and class-opening threshold | Full when `count >= max`; needs more students when `count < min`; otherwise confirmed to open |
| Preserve | Course detail | Course modal | `/courses/:courseId` detail page | Review objectives, curriculum, requirements, schedule, venue, coach, price, and class status | Price-per-session derives from `price / sessions`; no new source-of-truth fields |
| Extend | Coach profile summary | Course modal | Coach profile section / linked coach page | Show bio, area, rating, review count, Pro badge | Rating is `rSum / rCnt`, one decimal; em dash if no reviews |
| Preserve | Course enrollment | Course checkout modal | Enrollment checkout flow | Name, optional phone, payment-method selection, validation, success summary | Reject when course is full; create one enrollment using current price and current settings |
| Preserve | Simulated course payment | Course checkout modal | Checkout confirmation | Explicit simulation disclosure; no external payment call | Store `price`; commission is rounded `price * commission%`; payment fee is rounded `price * payFee%` |
| Preserve | Funnel tracking | Course detail and checkout actions | Analytics event layer | Increment detail views on detail open, checkout starts on checkout open, paid on successful enrollment | Seed starts at 58 views, 24 checkouts, 16 paid; user actions increment these values |
| Preserve | Tournament marketplace | Tournaments tab | Tournament Marketplace | Browse cards and open details | Show format, level, date, venue, deadline, prize, capacity, fee, and status |
| Preserve | Tournament details | Tournament modal | `/tournaments/:tournamentId` | Read rules, registration threshold, refund promise, current count, and bracket after close | Before minimum: state 100% refund if event does not proceed; no actual refund engine exists |
| Preserve | Singles registration | Tournament checkout | Tournament registration flow | Participant name, optional phone, payment method | One participant name; store current fee and rounded payment fee |
| Preserve | Doubles registration | Tournament checkout | Tournament registration flow | Two required participant names, optional phone, payment method | `partner` marks a doubles entry; fee is per pair |
| Preserve | Simulated tournament payment | Tournament checkout | Registration confirmation | Explicit simulated-payment disclosure and success summary | No real transaction or payment status exists |
| Extend | My courses | Mine tab | My Activities > Courses | View upcoming class information, payment amount, class status; mark complete in demo | Completion toggles `done`; it is a simulation action, not attendance tracking |
| Preserve | Course review | Mine tab / review modal | My Activities > Completed / Review dialog | Available after completion; select 1–5 stars and optional text | Mark enrollment reviewed; add stars to coach `rSum` and increment `rCnt`; review text is not stored today |
| Extend | My tournaments | Mine tab | My Activities > Tournaments | Show entry, fee, event date, next match, court, time, referee, or outcome | Next unplayed non-bye match determines schedule; champion gets “Vô địch!” |
| New | Payment history | Not present as a distinct view | My Activities > Payments | Read-only ledger of course and tournament payments, including demo refund state | Derive from enrollments and registrations; all payment operations are simulated |
| New | Learning progress | Only binary `done` | My Activities > Progress | Progress presentation and future session tracking | MVP supports only not-complete/complete; do not invent per-session completion as persisted truth |
| New | Upcoming schedule view | Data shown inside cards | My Activities > Schedule | Chronological course and tournament schedule | Derive from course start/schedule and generated matches; no calendar API exists |

### Coach

| Status | Existing feature | Existing screen | Redesigned destination | Required interactions | Logic / constraint to preserve |
|---|---|---|---|---|---|
| Preserve | Coach preview switcher | Coach header | Demo role toolbar | Select any of three seeded coaches | Selected coach ID is UI state only and defaults to `c1` |
| Extend | Coach KPI dashboard | Overview | Coach Dashboard | Show course count, enrollment count, GMV, platform commission, net payout | Sum only courses belonging to selected coach; payout is GMV minus stored enrollment commissions |
| Extend | Course performance | Overview table | Course Management / performance table | View course students, capacity, opening status, GMV, commission, payout | Enrollment financial values come from enrollment records, preserving historical rates |
| New | Recent registrations | Not present as a dedicated list | Coach Dashboard | Sort recent student registrations | Enrollment records currently have no timestamp; schema extension/migration is required |
| Preserve | Create course | Create tab | Course Management > New course | Validate and submit all existing fields; preview commission and net payout | Title/venue required; price nonnegative; `1 <= min <= max`; content is newline-split and blanks removed |
| Preserve | Live price split preview | Create tab | Pricing section | Update while price changes | Commission = current course price × current global commission; coach receives the remainder |
| Extend | Course listing actions | Overview is read-only | Course Management | View and open the content editor for owned courses | Course archival, publish/draft lifecycle, and cancellation are not implemented |
| New | Course content edit | Not present | Course Management > Edit | Update title, type, level, goal, curriculum, requirements, and cover image | Price, schedule, venue, dates, and capacity remain unchanged to protect current enrollments and their historical amounts |
| Preserve | Coach Pro status | Coach Pro tab | Coach Pro | Show price, benefits, active status | Active if any subscription for coach has `active !== false` |
| Preserve | Coach Pro subscribe | Coach Pro tab | Upgrade confirmation | Add one simulated one-month subscription at current configured price | Store current price and today’s local ISO date; log action; no real billing |
| Preserve | Coach Pro cancel | Coach Pro tab | Cancel confirmation | Disable all active subscriptions for selected coach | Set `active = false`; historical subscription amount remains revenue |
| New | Advanced analytics / promotion tools | Listed only as Pro benefits | Coach Pro gated areas | Clearly label unavailable/future capabilities until built | Prototype contains benefit copy only, not implementations |

### Admin system administration

| Status | Feature | Destination | Required interactions | Constraint |
|---|---|---|---|---|
| New | Account directory and role controls | `/admin/accounts` | Search accounts, view role, update demo role/access status | Local demo metadata only; does not authorize requests |
| New | Coach and Student management | `/admin/coaches`, `/admin/students` | Browse profile records and account state | Preserve course, enrollment, and payment history |
| New | Course/content moderation | `/admin/courses` | Review courses and update published/draft/archived state | Never rewrite historical enrollment amounts |
| New | Transaction ledger | `/admin/transactions` | Search/filter payments and inspect simulated status | Read-only; Organizer rejection is the only supported flow that marks a simulated tournament payment refunded |
| New | Platform reporting | `/admin/reports` | Review financial totals and registration funnel | Use existing domain calculations and source records |
| New | Revenue trend reporting | `/admin/reports` | Review period-based charts | Requires timestamped financial data; do not fabricate historical series |
| New | System configuration | `/admin/settings` | Update global settings and validation statuses | Settings apply according to current domain rules |
| Preserve | Business assumptions | `/admin/settings` | Update financial parameters and validation status | Settings are saved in local demo storage |
| Preserve | Activity log | `/admin/activity` | Review chronological platform actions | Uses existing capped activity log |

### Organizer / Tournament Operations

| Status | Existing feature | Existing screen | Redesigned destination | Required interactions | Logic / constraint to preserve |
|---|---|---|---|---|---|
| Preserve | Tournament listing/operations | Tournaments tab | Tournament Management | Inspect status, entries, finances, break-even, and actions | Status values are `open`, `closed`, `finished` |
| Preserve | Create tournament | Create tournament modal | Tournament Management > New tournament | Validate core setup and create event | Store format, dates, venue, fee, max/min, courts, prize text, fixed rules, costs; no robust cross-field validation exists yet |
| Preserve | Cost plan editing | Tournament card | Tournament Finance panel | Edit venue/staff/prize/misc/referee costs, fee, minimum registrations | Cost edits update tournament; fee edit also rewrites fee on all existing registrations for that tournament in the MVP |
| Preserve | Break-even calculation | Tournament card | Tournament Finance panel | Recalculate immediately and flag minimum below break-even | Fixed = court + staff + prize + misc; unit = fee × (1 − payFee%) − referee/match; break-even = `ceil(fixed / unit)` or infinity |
| Preserve | Tournament projected profit | Tournament card | Tournament Finance panel | Show revenue, payment fee, referee cost, fixed cost, profit | Referee matches estimated as `max(0, entries − 1)`; profit = fees − payment fee − referee cost − fixed cost |
| Preserve | Simulate registrations | Tournament card | Demo tools | Add up to 8 sample entries without exceeding capacity | Doubles simulation creates two names; uses current event fee and current payment-fee rate |
| New | Review athlete registration | Registration table | Tournament > Registrations | Approve or reject pending entries; show review state to the Student; block bracket generation while entries are pending | Legacy/seed entries without a review status are treated as approved; new entries start pending; rejection marks the demo payment refunded and releases capacity |
| Preserve | Close registration/generate bracket | Tournament card | Registration Management | Require at least 2 approved entries and no pending registrations before bracket generation | Rejected entries are excluded; bracket size is next power of two; source order is used; byes auto-advance; event becomes `closed` |
| Preserve | Match scheduling | Bracket generation | Bracket / Schedule | Assign courts, start times, and referees | Round traversal order; court cycles `1..courts`; times start 08:00 in 40-minute waves; referees cycle through three seeded names |
| Preserve | Visual bracket | Tournament card and student detail | Tournament Bracket | Horizontal responsive bracket, round labels, winner highlighting, participant marker | Round names derive from remaining rounds; byes are shown and auto-propagated |
| Preserve | Result entry | Tournament card | Match Results | Enter two non-equal scores; save winner; reveal next-round participants | Scores must be present and unequal; higher score advances; downstream completed match locks upstream editing |
| Preserve | Champion completion | Result entry | Bracket and tournament summary | Mark champion and event finished when final gets a winner | Set `champion` to final winner ID and status to `finished` |
| New | Standings summary | Match Results | Organizer > Results | Show champion, final runner-up, and tied placement ranges by elimination round | Do not invent exact placements for participants eliminated in the same round |
| New | Registration management actions | Count only | Tournament > Registrations | Search/export/check-in flows | Rules for these actions remain unspecified; rejection with simulated refund is implemented separately |
| New | Court/referee maintenance | Add and view lists | Organizer > Operations | Edit resources and delete resources not referenced by a match | Prevent deletion when a scheduled match references the court or referee |

## Seed data and baseline calculations

The redesigned app should reproduce these values immediately after reset. They are useful regression fixtures.

### Course baseline

| Course | Enrollments | Min / max | Status | GMV |
|---|---:|---:|---|---:|
| Cầu lông cho người mới: 8 buổi nền tảng | 5 | 4 / 8 | Confirmed to open | 6,000,000đ |
| Smash Clinic: 4 buổi | 6 | 3 / 6 | Full | 4,800,000đ |
| Footwork và phòng thủ nhóm nhỏ | 2 | 4 / 8 | Needs 2 | 3,000,000đ |
| Kèm 1-1 chiến thuật đánh đôi | 0 | 1 / 1 | Needs 1 | 0đ |
| Luyện thi đấu nâng cao | 3 | 5 / 8 | Needs 2 | 7,200,000đ |

At default settings (10% commission, 2% payment fee):

- Course GMV: 21,000,000đ
- Course commission revenue: 2,100,000đ
- Course payment fees: 420,000đ
- Coach Pro revenue: 99,000đ
- Open-tournament fees held: 3,450,000đ
- Recognized platform revenue: 2,199,000đ
- Recognized costs: 420,000đ
- Estimated profit: 1,779,000đ

### Tournament baseline

| Tournament | Entries | Revenue held | Break-even | Projected profit while open |
|---|---:|---:|---:|---:|
| CoachMate Mini Cup #1 | 9 | 2,250,000đ | 24 entries | −2,675,000đ |
| Đôi Nam Nữ Cuối Năm | 3 | 1,200,000đ | 14 entries | −3,544,000đ |

## Prototype-only implementation details

These behaviors are not backend contracts and should be moved behind explicit application services/repositories rather than copied into UI components:

- String-template rendering and document-level event delegation.
- In-memory navigation and modal state.
- Hard-coded current-user identity and coach preview selector.
- Generated IDs based on `Date.now()` plus an incrementing counter.
- Seed participants, referees, dates, venues, and simulation actions.
- Browser-local payment confirmation and completion actions.
- Hard-coded Vietnamese copy and locale formatting.
- Hard-coded tournament rules for newly created events.

## Important gaps and ambiguities to resolve before production integration

1. No backend, authentication, authorization, API schema, environment configuration, or real payment integration exists in this workspace.
2. Payment history, content-only course editing, registration review, time-series analytics, per-session learning progress, and refund status are new demo features, not preserved MVP logic. Real payments and refunds are not implemented.
3. Enrollment and tournament registration records do not store timestamps; trend charts and “recent registration” ordering need a schema addition and migration.
4. Review text is accepted by the form but discarded; only stars and the reviewed flag persist.
5. Tournament registration mutation does not independently re-check open status, capacity, or duplicate registration; the current UI is the only guard.
6. Editing a tournament fee rewrites the fee on all prior registrations. This should be explicitly confirmed or corrected before production use.
7. Tournament payment fees are recalculated using the current global rate, while course enrollment fees are stored at transaction time. This historical-accounting inconsistency must not be silently changed.
8. New tournament creation has only browser-native required/min checks; it lacks deadline/date ordering, `min <= max`, and robust capacity validation.
9. Bracket seeding is deterministic source order, not randomized or ranked.
10. The MVP accepts any unequal 0–30 result; it does not enforce badminton scoring rules or game/set structure despite displaying “21 points, best of 3.”
11. Admin account/role controls in the frontend are demo-only LocalStorage settings and do not replace backend authentication, authorization, or audit controls.
