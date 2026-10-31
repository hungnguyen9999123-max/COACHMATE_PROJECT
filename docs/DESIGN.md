# CoachMate Design System & UI/UX Guidelines

> **Purpose:** This document defines the visual architecture, design tokens, typography, component guidelines, and layout rules for the **CoachMate** platform. All frontend code created by AI agents or developers must strictly adhere to these design rules to maintain UI consistency across all roles and screens.

---

## 1. Design Philosophy

- **Athletic, Modern & Trustworthy**: CoachMate is a sports management and booking platform for badminton players, coaches, system administrators, and tournament organizers. The interface must feel clean, modern, active, and professional.
- **Content & Clarity First**: Visual hierarchy should guide the user effortlessly—whether searching for a coaching session, reviewing a tournament bracket, or managing platform revenue.
- **Role-Aware Consistency**: Student, Coach, Admin, and Organizer roles have different user goals but share the same design language, UI tokens, component hierarchy, and feedback mechanisms. Admin manages platform accounts, content, reporting, and configuration; Organizer operates tournaments.

---

## 2. Design Tokens & Color Palette

All colors are defined as CSS variables inside `src/design-system/tokens.css` (or `frontend/src/design-system/tokens.css`). Do not hardcode custom hex codes directly in inline styles or random CSS files.

### Primary Brand Colors
- **Primary Emerald (`--color-primary`)**: `#168A63` — Main action color, primary buttons, active nav states.
- **Primary Dark (`--color-primary-dark`)**: `#116B4D` — Hover and pressed states for primary elements.
- **Mint Surface (`--color-mint`)**: `#E4F5EC` — Light background tint for active cards, subtle badges, and highlights.
- **Lime Accent (`--color-lime`)**: `#C6F135` — High-energy callout accent for special badges (e.g., Coach Pro, featured tags, key actions).

### Neutral & Surface Palette
- **App Background (`--color-bg`)**: `#F7F9F8` — Soft neutral green-gray background for pages.
- **Surface / Card (`--color-surface`)**: `#FFFFFF` — White container background for cards, modals, and tables.
- **Border (`--color-border`)**: `#E7EDE9` — Subtle container borders and dividers.
- **Text Primary (`--color-text-primary`)**: `#20332D` — High contrast body and heading text.
- **Text Secondary (`--color-text-secondary`)**: `#74837C` — Subtitles, captions, metadata, and placeholder text.

### Semantic Status Palette
- **Success / Confirmed**: Background `#E4F5EC`, Text `#168A63` (Class confirmed to open, payment success).
- **Warning / Needs Students**: Background `#FEF3C7`, Text `#D97706` (Needs more registrations before opening).
- **Error / Full / Closed**: Background `#FEE2E2`, Text `#DC2626` (Course full, registration closed, validation error).
- **Info / Draft**: Background `#DBEAFE`, Text `#2563EB` (Upcoming sessions, draft state).

---

## 3. Typography & Hierarchy

### Font Family
- **Primary Font**: `Be Vietnam Pro`, sans-serif.
  - Chosen for excellent Vietnamese diacritics rendering and modern legibility across mobile and desktop devices.
- **Fallback Stack**: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`.

### Type Scale
| Level | Font Size | Line Height | Weight | Usage |
|---|---|---|---|---|
| **Display / H1** | 28px - 32px | 1.2 | 700 (Bold) | Main page title, Hero banners |
| **H2** | 22px - 24px | 1.3 | 600 (SemiBold) | Section headers, Modal titles |
| **H3** | 18px - 20px | 1.4 | 600 (SemiBold) | Card titles, Subsection headers |
| **Body Regular** | 14px - 16px | 1.5 | 400 (Regular) | Primary content, form input values |
| **Body Medium** | 14px - 16px | 1.5 | 500 (Medium) | Table headers, button text, labels |
| **Caption / Small**| 12px - 13px | 1.4 | 400 / 500 | Metadata, helper text, badge text |

---

## 4. Spacing, Radius & Elevation

### Spacing Grid (4px scale)
- `xs`: 4px
- `sm`: 8px
- `md`: 12px
- `lg`: 16px
- `xl`: 24px
- `2xl`: 32px
- `3xl`: 48px

### Border Radius Scale
- `sm` (`8px`): Buttons, input fields, filter tags.
- `md` (`12px`): Cards, dropdowns, table containers.
- `lg` (`16px`): Modals, drawers, top hero panels.
- `full` (`9999px`): Status badges, avatars, pill buttons.

### Elevation & Shadows
- **Card Shadow**: `0 1px 3px rgba(32, 51, 45, 0.06), 0 1px 2px rgba(32, 51, 45, 0.04)`
- **Hover Elevation**: `0 4px 12px rgba(32, 51, 45, 0.08)`
- **Modal / Overlay Shadow**: `0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)`

---

## 5. Component Guidelines

### Buttons
- **Primary Button**: Solid Emerald (`#168A63`), White text, rounded 8px. Hover: `#116B4D`.
- **Accent Button**: Solid Lime Accent (`#C6F135`), Dark text (`#20332D`). Use for prominent upgrade or checkout CTAs.
- **Secondary Button**: White surface with `#E7EDE9` border, dark text. Hover: light gray tint.
- **Danger Button**: Soft red surface or red text for destructive/cancellation actions.
- **Disabled State**: Opacity 0.5, cursor not-allowed, no hover effect.

### Cards (Course, Tournament, Dashboard Tiles)
- White background with subtle border (`#E7EDE9`) and 12px border radius.
- Padding: 16px to 24px depending on view density.
- Image aspect ratio: 16:9 or 3:2 with object-fit cover and fallback image state.

### Form Inputs & Controls
- Height: 40px - 44px for easy touch target on mobile.
- Focus State: Primary emerald outline ring (`ring-2 ring-primary`).
- Validation: Inline error message displayed directly below input in `#DC2626`.

### Badges & Tags
- Compact pill-shaped elements (`rounded-full`), padded with `4px 10px`.
- Bold, legible text at 12px size.

### Modals & Drawers
- Must include backdrop scrim overlay (`rgba(0,0,0,0.4)`).
- Close button (`X`) at top-right corner.
- Support close on `Esc` key and scrim click.

---

## 6. Responsiveness & Adaptive Behavior

- **Desktop (1200px+)**: Sidebar navigation (Admin/Organizer/Coach) or multi-column marketplace grids.
- **Tablet (768px - 1199px)**: 2-column grids, collapsible sidebar.
- **Mobile (< 768px)**: 1-column layout, mobile bottom/top drawer navigation, full-width buttons.

---

## 7. Rules for AI Agents

1. **Reuse Existing Tokens**: Always map CSS attributes to `--color-primary`, `--color-surface`, `--color-border`, etc.
2. **Never Invent Custom Colors**: Do not add random inline RGB or Hex values like `#fe4a23` or `#3b82f6` unless mapped to semantic constants.
3. **Keep Components Modular**: Store reusable UI components inside `src/design-system/components.tsx` or designated design system subfolders.
4. **Accessible Contrast**: Ensure all text has sufficient contrast against its background.
