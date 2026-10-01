---
name: ResumeIQ
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#45464d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#515f74'
  on-secondary: '#ffffff'
  secondary-container: '#d5e3fd'
  on-secondary-container: '#57657b'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#271901'
  on-tertiary-container: '#98805d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#d5e3fd'
  secondary-fixed-dim: '#b9c7e0'
  on-secondary-fixed: '#0d1c2f'
  on-secondary-fixed-variant: '#3a485c'
  tertiary-fixed: '#fcdeb5'
  tertiary-fixed-dim: '#dec29a'
  on-tertiary-fixed: '#271901'
  on-tertiary-fixed-variant: '#574425'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: -0.01em
  body-default:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: -0.006em
  body-medium:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: -0.006em
  label-default:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: -0.005em
  meta-default:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: '0'
  meta-medium:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: '0'
  table-header:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.04em
  code-mono:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: '0'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style
The design system embodies ultra-restrained, utilitarian software craftsmanship inspired by modern desktop-grade tools like Linear, Attio, and Stripe Dashboard. It is engineered for talent acquisition leaders, executive recruiters, and hiring managers who live inside dense operational workflows for hours daily. 

The emotional signature is quiet authority, high density, and absolute clarity. The interface removes visual noise: no illustrative flourishes, no synthetic AI metaphors (no sparkles, gradients, or chatbots), and no decorative depth. Trust is built through surgical alignment, razor-thin structural borders, precise typographic scale, and deterministic state feedback. The visual atmosphere reads as an understated, high-efficiency instrument.

## Colors
The palette is built strictly around cool grays, deep slate slates, and surgical monochrome neutrals:

- **Canvas & Surface Tiering**:
  - Global app canvas / viewport background: `#f8fafc`
  - Secondary/Sidebar canvas: `#f1f5f9`
  - Active workspace cards & content panels: `#ffffff`
  - Hover states: `#f8fafc` on white panels; `#e2e8f0` on subtle controls
- **Borders & Dividers**:
  - Global standard border: `1px solid #e2e8f0`
  - Subtle divider / sub-row separator: `1px solid #f1f5f9`
  - Strong structural border (focus/selection outlines): `#0f172a`
- **Text & Foreground Hierarchy**:
  - High-emphasis titles & labels: `#0f172a`
  - Standard body & core tabular data: `#1e293b`
  - Secondary metadata & column headers: `#64748b`
  - Muted placeholders, keyboard shortcuts, disabled: `#94a3b8`
- **Status Indicators (Strictly muted, desaturated tones)**:
  - Success / Qualified / Active: `#15803d` (badge bg: `#f0fdf4`, border: `#dcfce7`, dot: `#22c55e`)
  - Warning / In-Review / Sourcing: `#b45309` (badge bg: `#fffbeb`, border: `#fef3c7`, dot: `#f59e0b`)
  - Error / Rejected / Flagged: `#b91c1c` (badge bg: `#fef2f2`, border: `#fee2e2`, dot: `#ef4444`)
  - Neutral / Draft / Archived: `#475569` (badge bg: `#f8fafc`, border: `#e2e8f0`, dot: `#64748b`)

## Typography
Typography is deliberately compact, technical, and hyper-legible. We employ Inter across all UI layers with strict tabular lining figures (`font-feature-settings: "cv02", "cv03", "cv04", "cv11", "tnum"`) to maintain tabular alignment inside candidate grids and metrics panels.

Titles are capped at a maximum of 26px to prevent unnecessary vertical consumption, keeping primary screening actions well above the fold. Monospace typography via JetBrains Mono is utilized sparingly for IDs, timestamps, parsing latency, and match scoring keys.

## Layout & Spacing
The layout adheres strictly to an 8px base rhythm (with 4px sub-increments for compact inline items). 

### Layout Model
- **Workbench Architecture**: A fixed two-tier navigation structure: an icon/compact sidebar (240px wide collapsible to 56px), an optional secondary contextual drill-down drawer/list (320px wide), and an infinite-scroll fluid candidate canvas.
- **Data Tables**: Table rows feature a compact vertical height of 40px (cozy) or 32px (compact). Column widths use explicit tokenized clamps with horizontal truncation.
- **Dividers & Gaps**: Horizontal dividers (`1px solid #e2e8f0`) separate semantic entities rather than arbitrary open whitespace gaps.

### Breakpoints & Adaptability
- **Desktop (>= 1280px)**: Multi-pane triage view active: Candidate Pipeline List + Interactive Resume Viewer + Action Column simultaneously visible.
- **Tablet (768px - 1279px)**: Secondary inspection panel collapses into an overlay slide-over panel (480px width) anchored to the right border.
- **Mobile (< 768px)**: Single column stream with sticky top action toolbar; inspection panes convert to full-screen modular sheets.

## Elevation & Depth
This design system avoids all drop shadows, diffuse glows, and simulated light reflections. Visual depth is established purely through surface tonality, 1px perimeter containment, and strict hierarchy:

- **Base Layer (Level 0)**: Background canvas (`#f8fafc`).
- **Surface Layer (Level 1)**: Content panels, cards, candidate list rows (`#ffffff`) surrounded by a hairline `1px solid #e2e8f0` border.
- **Floating Overlays & Popovers (Level 2)**: Dropdowns, comboboxes, and filter popovers sit on `#ffffff`, bounded by `1px solid #cbd5e1`, with an imperceptible micro-shadow: `0 1px 3px 0 rgba(15, 23, 42, 0.05)`.
- **Modals & Slide-overs (Level 3)**: Full resume inspect panels and configuration dialogs use `#ffffff` borders flanked by a flat translucent veil (`rgba(15, 23, 42, 0.3)` backdrop, no blur).

## Shapes
Geometry is disciplined and sharp. All core interactive and surface elements feature a 6px to 8px radius (`roundedness: 1`):

- **6px (`border-radius: 6px`)**: Form inputs, action buttons, dropdown items, filter chips, table badges, and segmented toggles.
- **8px (`border-radius: 8px`)**: Primary panels, cards, slide-over sheets, and candidate detail containers.
- **Circular (`border-radius: 9999px`)**: Reserved strictly for the 6px status indicator dots, compact user avatars, and count pills.

## Components

### Buttons
- **Primary**: Solid near-black background (`#0f172a`), crisp white text (`#ffffff`), `height: 32px`, `padding: 0 12px`, `border-radius: 6px`. Hover: `#1e293b`. Focus: dual-ring outline (`2px solid #ffffff`, `2px solid #0f172a`).
- **Secondary / Outline**: `#ffffff` background, `1px solid #e2e8f0`, text `#1e293b`, `height: 32px`, `padding: 0 12px`. Hover: background `#f8fafc`, border `#cbd5e1`.
- **Ghost / Action Table Icon Button**: Transparent background, text `#64748b`, `height: 28px`, `width: 28px`. Hover: background `#f1f5f9`, text `#0f172a`.

### Tags & Filter Chips
- **Status Badges**: Ultra-compact (`height: 20px`), `padding: 0 6px`, `border-radius: 4px`, `1px solid` matching border token. Contains a 6px centered status dot on the left followed by 11px uppercase or 12px title-case metadata.
- **Attribute Tags (Skills, Source, Experience)**: Background `#ffffff`, `1px solid #e2e8f0`, text `#334155`, `font-size: 12px`, `height: 22px`. Never pill-shaped; strict 4px-6px corner radius.

### Form Inputs & Comboboxes
- **Text & Search Fields**: Background `#ffffff`, `border: 1px solid #e2e8f0`, `border-radius: 6px`, `height: 32px`, `padding: 0 10px`, typography: 13px Inter. Placeholder text: `#94a3b8`. Focus: `border-color: #0f172a`, ring outline: `1px solid #0f172a`.
- **Inline Table Filters**: Ghost-bordered triggers displaying label + active condition with subtle count indicator (`#f1f5f9` badge).

### Checkboxes & Selection Controls
- **Table Row Checkbox**: `14px x 14px`, `border-radius: 3px`, `border: 1px solid #cbd5e1`, background `#ffffff`. Checked state: background `#0f172a`, border `#0f172a`, with a crisp 1px white check icon.

### Tabular Lists & Data Grid
- **Header**: `height: 32px`, background `#f8fafc`, `border-bottom: 1px solid #e2e8f0`, text `#64748b`, uppercase 11px with `letter-spacing: 0.04em`.
- **Rows**: Alternating hover highlights (`#f8fafc`), clean `1px solid #f1f5f9` separators between records, dense vertical padding (`padding: 8px 12px`).

### Cards & Content Panels
- Structural `#ffffff` containers with `border: 1px solid #e2e8f0` and `border-radius: 8px`. Header sections are separated from card bodies by explicit hairline borders (`#e2e8f0`) with zero inner shadow.