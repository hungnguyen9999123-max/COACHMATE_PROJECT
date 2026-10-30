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
| Organizer / Admin | Revenue, Tournaments, Assumptions, Log | Revenue summary, revenue/cost table, registration funnel, tournament operations, create-tournament modal, cost editor, bracket, result entry, business settings, assumption tracker, activity log |

## Feature mapping

Status meanings:

- **Preserve**: implemented in the prototype and must retain its rules.
- **Extend**: implemented in a limited form and expanded by the redesign brief.
- **New**: requested by the redesign brief but not implemented in the prototype.

### Cross-role platform

| Status | Existing feature | Existing screen | Redesigned destination | Required interactions | Logic / constraint to preserve |
|---|---|---|---|---|---|
| Preserve | Role switching | Header segmented control | Student top navigation; coach/admin dashboard sidebars; role preview switcher available in demo mode | Switch role without losing saved data; retain last tab per role | Roles are `player`, `coach`, `admin`; each remembers its active tab during the session |
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
| New | Payment history | Not present as a distinct view | My Activities > Payments | Read-only ledger of course and tournament payments | Derive initially from the user’s enrollments and registrations; no transaction IDs/refunds exist |
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
| New | Course listing actions | Overview is read-only | Course Management | Search, view, edit, archive/status actions | No edit, delete, archive, publish, draft, or cancellation logic exists in MVP; define before persistence changes |
| New | Course edit | Not present | Course Management > Edit | Pre-fill and save changes with confirmation | Must specify treatment of already-paid enrollments; historical payment values should remain unchanged |
| Preserve | Coach Pro status | Coach Pro tab | Coach Pro | Show price, benefits, active status | Active if any subscription for coach has `active !== false` |
| Preserve | Coach Pro subscribe | Coach Pro tab | Upgrade confirmation | Add one simulated one-month subscription at current configured price | Store current price and today’s local ISO date; log action; no real billing |
| Preserve | Coach Pro cancel | Coach Pro tab | Cancel confirmation | Disable all active subscriptions for selected coach | Set `active = false`; historical subscription amount remains revenue |
| New | Advanced analytics / promotion tools | Listed only as Pro benefits | Coach Pro gated areas | Clearly label unavailable/future capabilities until built | Prototype contains benefit copy only, not implementations |

### Tournament Organizer / Admin

| Status | Existing feature | Existing screen | Redesigned destination | Required interactions | Logic / constraint to preserve |
|---|---|---|---|---|---|
| Preserve | Revenue KPIs | Revenue tab | Revenue Dashboard | Display course GMV, platform revenue, costs, estimated profit | Revenue = course commissions + all subscription amounts + fees from closed/finished tournaments |
| Preserve | Open-tournament funds | Revenue tab | Revenue Dashboard held-funds callout | Separate unrecognized tournament fees | Open tournament fees are held and excluded from revenue |
| Preserve | Expense calculation | Revenue tab | Revenue breakdown | Show payment fees and tournament operating costs | Course payment fee uses stored enrollment values; tournament fee uses current global payment rate in `tcalc` |
| Preserve | Registration funnel | Revenue tab | Analytics chart | Show counts and conversion against views | Percent is rounded `stage / views * 100`; zero views yields 0 |
| New | Revenue time-series charts | Not present | Revenue Analytics | Date/range filters and trend charts | Existing financial records mostly lack timestamps, so historical charting requires schema changes or clearly labeled sample series |
| Preserve | Tournament listing/operations | Tournaments tab | Tournament Management | Inspect status, entries, finances, break-even, and actions | Status values are `open`, `closed`, `finished` |
| Preserve | Create tournament | Create tournament modal | Tournament Management > New tournament | Validate core setup and create event | Store format, dates, venue, fee, max/min, courts, prize text, fixed rules, costs; no robust cross-field validation exists yet |
| Preserve | Cost plan editing | Tournament card | Tournament Finance panel | Edit venue/staff/prize/misc/referee costs, fee, minimum registrations | Cost edits update tournament; fee edit also rewrites fee on all existing registrations for that tournament in the MVP |
| Preserve | Break-even calculation | Tournament card | Tournament Finance panel | Recalculate immediately and flag minimum below break-even | Fixed = court + staff + prize + misc; unit = fee × (1 − payFee%) − referee/match; break-even = `ceil(fixed / unit)` or infinity |
| Preserve | Tournament projected profit | Tournament card | Tournament Finance panel | Show revenue, payment fee, referee cost, fixed cost, profit | Referee matches estimated as `max(0, entries − 1)`; profit = fees − payment fee − referee cost − fixed cost |
| Preserve | Simulate registrations | Tournament card | Demo tools | Add up to 8 sample entries without exceeding capacity | Doubles simulation creates two names; uses current event fee and current payment-fee rate |
| Preserve | Close registration/generate bracket | Tournament card | Registration Management | Warn below minimum; allow demo closure from 4+ entries; confirm action | Bracket size is next power of two; source order is used; byes auto-advance; event becomes `closed` |
| Preserve | Match scheduling | Bracket generation | Bracket / Schedule | Assign courts, start times, and referees | Round traversal order; court cycles `1..courts`; times start 08:00 in 40-minute waves; referees cycle through three seeded names |
| Preserve | Visual bracket | Tournament card and student detail | Tournament Bracket | Horizontal responsive bracket, round labels, winner highlighting, participant marker | Round names derive from remaining rounds; byes are shown and auto-propagated |
| Preserve | Result entry | Tournament card | Match Results | Enter two non-equal scores; save winner; reveal next-round participants | Scores must be present and unequal; higher score advances; downstream completed match locks upstream editing |
| Preserve | Champion completion | Result entry | Bracket and tournament summary | Mark champion and event finished when final gets a winner | Set `champion` to final winner ID and status to `finished` |
| Preserve | Business configuration | Assumptions tab | Business Assumptions > Model settings | Edit commission, payment fee, Coach Pro price | Changes apply to new course transactions and live tournament calculations; saved in local storage |
| Preserve | Assumption validation tracker | Assumptions tab | Business Assumptions > Validation board | Change one of four statuses for nine fixed assumptions | Statuses: unverified, validating, confirmed, rejected; save immediately |
| Preserve | Activity log | Log tab | Activity Log | Reverse-chronological action list with time | Prepend events; retain only the latest 80; timestamps are epoch milliseconds |
| New | Registration management actions | Count only | Tournament > Registrations | Search/export/check-in/remove/refund flows | None of these business rules exist in the prototype and must be specified before implementation |

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
2. “Payment history,” course editing/status, registration management, time-series analytics, per-session learning progress, and real refunds are net-new features, not preserved MVP logic.
3. Enrollment and tournament registration records do not store timestamps; trend charts and “recent registration” ordering need a schema addition and migration.
4. Review text is accepted by the form but discarded; only stars and the reviewed flag persist.
5. Tournament registration mutation does not independently re-check open status, capacity, or duplicate registration; the current UI is the only guard.
6. Editing a tournament fee rewrites the fee on all prior registrations. This should be explicitly confirmed or corrected before production use.
7. Tournament payment fees are recalculated using the current global rate, while course enrollment fees are stored at transaction time. This historical-accounting inconsistency must not be silently changed.
8. New tournament creation has only browser-native required/min checks; it lacks deadline/date ordering, `min <= max`, and robust capacity validation.
9. Bracket seeding is deterministic source order, not randomized or ranked.
10. The MVP accepts any unequal 0–30 result; it does not enforce badminton scoring rules or game/set structure despite displaying “21 points, best of 3.”

