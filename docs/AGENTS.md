# AI & Coding Agent Guidelines for CoachMate Project

> **IMPORTANT**: Every AI assistant, LLM agent, and automated coding tool working on the **CoachMate** codebase MUST read, understand, and strictly follow the guidelines in this document.

---

## 1. Mandatory Context Acquisition

Before executing any prompt, task, bug fix, feature implementation, or refactoring on this project:

- **READ ALL MARKDOWN DOCUMENTS IN `/docs`**: You must read all documentation files located in `docs/` (e.g., `coachmate-feature-map.md`, `coachmate-implementation-plan.md`, `COACHMATE_SPRINT_FLOW_TESTING_GUIDE.md`, `DESIGN.md`, etc.).
- Understand the 4 key roles (Student/Player, Coach, Admin, Organizer), domain business rules, baseline financial formulas, tournament economics, and sprint goals. Admin manages platform accounts, courses/content, transactions, reports, and settings; Organizer manages tournament operations.
- Ensure your changes align with the overall project architecture and do not violate previously established constraints.

---

## 2. Standards for Code Quality & Thoroughness

- **Be Thorough & Comprehensive**: Do not leave TODOs, incomplete implementations, or placeholder stubs unless explicitly asked. Always deliver production-ready, fully typed code.
- **Strict Testing Requirements**:
  - Run type checking (`npm run typecheck` / `tsc`).
  - Run unit and integration tests (`npm run test` / `vitest`).
  - Ensure production build passes without errors (`npm run build`).
  - Cover edge cases (e.g., empty lists, maximum capacities, missing reviews, zero entries).
- **Clean Architecture & Separation of Concerns**:
  - Domain rules and formulas belong in the domain layer (`src/domain/`).
  - Data fetching and persistence belong in repository adapters (`src/data/`).
  - UI components must focus on display and user interactions, invoking domain/repository services rather than implementing inline business logic.

---

## 3. Strict No-Hardcoding Rule (Seed Data Enforcement)

- **ABSOLUTELY NO HARDCODED DEMO DATA IN UI COMPONENTS**:
  - Never hardcode mock items, student names, course titles, prices, ratings, or tournament lists inside React components or layout files.
- **Centralized Seed Fixtures**:
  - ALL mock data, initial entities, seed records, and baseline demo figures MUST reside exclusively inside dedicated seed files (e.g., `src/data/seed.ts` or domain fixtures).
  - UI components must render data dynamically from props, hooks, or repository state.
- **Simulated Action Disclosure**:
  - All payment, enrollment, subscription, and admin operations are simulated in demo mode. Explicitly disclose simulation status in UI copy as required by the design spec.

---

## 4. UI Consistency & Design Rules

- **Adhere to `docs/DESIGN.md`**: All visual components, colors, typography, spacing, and layout structures MUST follow the design tokens and component rules defined in `docs/DESIGN.md`.
- **Responsive & Accessible**:
  - Mobile-first or fully responsive layouts (Desktop, Tablet, Mobile).
  - Proper ARIA attributes, semantic HTML elements, keyboard navigation, and focus management.

---

## 5. Persistence & Schema Integrity

- **Versioned Local Storage**: Preserve the `coachmate-cp3-mvp-v1` LocalStorage versioning key and schema contracts.
- **Data Retention**: Ensure mutations update state reliably and persist after browser refresh.
- **Non-Destructive Refactoring**: Never erase or corrupt existing stored state without a safe schema migration strategy.

---

## 6. Execution Checklist for Agents

1. [ ] Read all files in `/docs`.
2. [ ] Check existing design tokens in `docs/DESIGN.md` before adding styles.
3. [ ] Verify no hardcoded mock data exists outside `seed.ts`.
4. [ ] Run tests and type checks before presenting the solution.
