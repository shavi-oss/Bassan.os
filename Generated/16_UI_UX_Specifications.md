# Bassan.os UI/UX Specifications – Enterprise Edition

## Document Control

- **Document Title**: Bassan.os UI/UX Specifications
- **Version**: 2.2
- **Status**: Approved for Development
- **Date**: 2026-01-08
- **Context**: Design system and UI specifications for web and mobile applications
- **Source**: Extracted from Arabic UI specs + Material Design principles

---

## Table of Contents

1. [Design System](#1-design-system)
2. [Component Specifications](#2-component-specifications)
3. [Screen Wireframes](#3-screen-wireframes)
4. [Responsive Design](#4-responsive-design)
5. [Accessibility](#5-accessibility)
6. [Localization](#6-localization)

---

## 1. Design System

### 1.1 Color Palette

**Primary Colors** (Vodafone-inspired):

```css
--primary-red: #e60000;
--primary-dark: #b30000;
--primary-light: #ff3333;
--primary-pale: #ffe6e6;
```

**Secondary Colors**:

```css
--secondary-gray: #333333;
--secondary-dark-gray: #1a1a1a;
--secondary-light-gray: #666666;
--secondary-pale-gray: #f5f5f5;
```

**Accent Colors**:

```css
--accent-blue: #0066cc;
--accent-green: #00cc66;
--accent-orange: #ff9900;
--accent-yellow: #ffcc00;
```

**Semantic Colors**:

```css
--success: #00cc66;
--warning: #ff9900;
--error: #e60000;
--info: #0066cc;
```

**Neutral Colors**:

```css
--white: #ffffff;
--black: #000000;
--gray-50: #fafafa;
--gray-100: #f5f5f5;
--gray-200: #eeeeee;
--gray-300: #e0e0e0;
--gray-400: #bdbdbd;
--gray-500: #9e9e9e;
--gray-600: #757575;
--gray-700: #616161;
--gray-800: #424242;
--gray-900: #212121;
```

### 1.2 Typography

**Font Family**:

```css
--font-primary: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
--font-secondary: "Roboto", sans-serif;
--font-arabic: "Cairo", "Tajawal", sans-serif;
--font-mono: "Fira Code", "Courier New", monospace;
```

**Font Sizes**:

```css
--text-xs: 0.75rem; /* 12px */
--text-sm: 0.875rem; /* 14px */
--text-base: 1rem; /* 16px */
--text-lg: 1.125rem; /* 18px */
--text-xl: 1.25rem; /* 20px */
--text-2xl: 1.5rem; /* 24px */
--text-3xl: 1.875rem; /* 30px */
--text-4xl: 2.25rem; /* 36px */
--text-5xl: 3rem; /* 48px */
```

**Font Weights**:

```css
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

**Line Heights**:

```css
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

### 1.3 Spacing

**Spacing Scale** (8px base):

```css
--space-0: 0;
--space-1: 0.25rem; /* 4px */
--space-2: 0.5rem; /* 8px */
--space-3: 0.75rem; /* 12px */
--space-4: 1rem; /* 16px */
--space-5: 1.25rem; /* 20px */
--space-6: 1.5rem; /* 24px */
--space-8: 2rem; /* 32px */
--space-10: 2.5rem; /* 40px */
--space-12: 3rem; /* 48px */
--space-16: 4rem; /* 64px */
--space-20: 5rem; /* 80px */
```

### 1.4 Border Radius

```css
--radius-sm: 0.25rem; /* 4px */
--radius-md: 0.5rem; /* 8px */
--radius-lg: 0.75rem; /* 12px */
--radius-xl: 1rem; /* 16px */
--radius-full: 9999px; /* Fully rounded */
```

### 1.5 Shadows

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
```

### 1.6 Z-Index Scale

```css
--z-dropdown: 1000;
--z-sticky: 1020;
--z-fixed: 1030;
--z-modal-backdrop: 1040;
--z-modal: 1050;
--z-popover: 1060;
--z-tooltip: 1070;
```

---

## 2. Component Specifications

### 2.1 Buttons

**Primary Button**:

- Background: `--primary-red`
- Text: `--white`
- Padding: `12px 24px`
- Border radius: `--radius-md`
- Font weight: `--font-semibold`
- Hover: Darken 10%
- Active: Darken 20%
- Disabled: Opacity 50%

**Secondary Button**:

- Background: `transparent`
- Border: `2px solid --primary-red`
- Text: `--primary-red`
- Padding: `12px 24px`
- Hover: Background `--primary-pale`

**Text Button**:

- Background: `transparent`
- Text: `--primary-red`
- Padding: `8px 16px`
- Hover: Background `--gray-100`

**Icon Button**:

- Size: `40px × 40px`
- Border radius: `--radius-full`
- Hover: Background `--gray-100`

### 2.2 Input Fields

**Text Input**:

- Height: `48px`
- Padding: `12px 16px`
- Border: `1px solid --gray-300`
- Border radius: `--radius-md`
- Focus: Border `--primary-red`, shadow `--shadow-md`
- Error: Border `--error`
- Disabled: Background `--gray-100`, cursor `not-allowed`

**Label**:

- Font size: `--text-sm`
- Font weight: `--font-medium`
- Margin bottom: `--space-2`
- Color: `--gray-700`

**Helper Text**:

- Font size: `--text-xs`
- Color: `--gray-600`
- Margin top: `--space-1`

**Error Text**:

- Font size: `--text-xs`
- Color: `--error`
- Margin top: `--space-1`

### 2.3 Cards

**Standard Card**:

- Background: `--white`
- Border: `1px solid --gray-200`
- Border radius: `--radius-lg`
- Padding: `--space-6`
- Shadow: `--shadow-sm`
- Hover: Shadow `--shadow-md`

**Elevated Card**:

- Background: `--white`
- Border: None
- Shadow: `--shadow-lg`
- Padding: `--space-6`

### 2.4 Tables

**Table Header**:

- Background: `--gray-50`
- Font weight: `--font-semibold`
- Padding: `--space-4`
- Border bottom: `2px solid --gray-300`

**Table Row**:

- Padding: `--space-4`
- Border bottom: `1px solid --gray-200`
- Hover: Background `--gray-50`

**Table Cell**:

- Padding: `--space-4`
- Vertical align: `middle`

### 2.5 Navigation

**Top Navigation Bar**:

- Height: `64px`
- Background: `--white`
- Border bottom: `1px solid --gray-200`
- Shadow: `--shadow-sm`
- Padding: `0 --space-6`

**Sidebar Navigation**:

- Width: `256px`
- Background: `--gray-900`
- Text: `--white`
- Active item: Background `--primary-red`

**Breadcrumbs**:

- Font size: `--text-sm`
- Color: `--gray-600`
- Separator: `/` or `>`
- Active: Color `--gray-900`, font weight `--font-semibold`

### 2.6 Modals

**Modal Backdrop**:

- Background: `rgba(0, 0, 0, 0.5)`
- Z-index: `--z-modal-backdrop`

**Modal Container**:

- Background: `--white`
- Border radius: `--radius-xl`
- Max width: `600px`
- Padding: `--space-8`
- Shadow: `--shadow-xl`
- Z-index: `--z-modal`

**Modal Header**:

- Font size: `--text-2xl`
- Font weight: `--font-bold`
- Margin bottom: `--space-6`

**Modal Footer**:

- Margin top: `--space-8`
- Text align: `right`
- Button spacing: `--space-3`

### 2.7 Alerts

**Alert Container**:

- Padding: `--space-4`
- Border radius: `--radius-md`
- Border left: `4px solid`
- Margin bottom: `--space-4`

**Success Alert**:

- Background: `#E6F7ED`
- Border color: `--success`
- Icon color: `--success`

**Warning Alert**:

- Background: `#FFF4E6`
- Border color: `--warning`
- Icon color: `--warning`

**Error Alert**:

- Background: `#FFE6E6`
- Border color: `--error`
- Icon color: `--error`

**Info Alert**:

- Background: `#E6F2FF`
- Border color: `--info`
- Icon color: `--info`

### 2.8 Badges

**Badge**:

- Padding: `4px 8px`
- Border radius: `--radius-full`
- Font size: `--text-xs`
- Font weight: `--font-semibold`
- Text transform: `uppercase`

**Status Badges**:

- Active: Background `--success`, text `--white`
- Pending: Background `--warning`, text `--white`
- Inactive: Background `--gray-400`, text `--white`
- Error: Background `--error`, text `--white`

---

## 3. Screen Wireframes

### 3.1 Login Screen

**Layout**:

```
┌─────────────────────────────────────┐
│         [Logo]                      │
│                                     │
│    Sign In to Bassan.os            │
│                                     │
│    Email: [___________________]    │
│    Password: [_______________]     │
│                                     │
│    [ ] Remember me                 │
│                                     │
│    [    Sign In Button    ]        │
│                                     │
│    Or sign in with:                │
│    [Google] [Microsoft]            │
│                                     │
│    Forgot password?                │
│                                     │
└─────────────────────────────────────┘
```

**Components**:

- Logo (centered, 120px height)
- Heading (text-3xl, font-bold)
- Email input (full width)
- Password input (full width, with show/hide toggle)
- Remember me checkbox
- Primary button (full width)
- OAuth buttons (50% width each)
- Forgot password link (text-sm, primary-red)

### 3.2 Dashboard Screen

**Layout**:

```
┌─────────────────────────────────────────────────────┐
│ [☰] Bassan.os    [Search]    [🔔] [👤]            │
├─────────────────────────────────────────────────────┤
│ │                                                   │
│ │  Dashboard                                        │
│ │                                                   │
│ │  ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│ │  │ Total    │ │ Active   │ │ Revenue  │         │
│ │  │ Leads    │ │ Tasks    │ │ This Mo. │         │
│ │  │  1,234   │ │   56     │ │ $45,678  │         │
│ │  └──────────┘ └──────────┘ └──────────┘         │
│ │                                                   │
│ │  Recent Activities                               │
│ │  ┌─────────────────────────────────────┐        │
│ │  │ • New lead assigned: ABC Corp       │        │
│ │  │ • Task completed: Follow-up call    │        │
│ │  │ • Invoice sent: INV-001             │        │
│ │  └─────────────────────────────────────┘        │
│ │                                                   │
└─────────────────────────────────────────────────────┘
```

**Components**:

- Top navigation bar (64px height)
- Sidebar navigation (256px width, collapsible)
- KPI cards (3 columns, equal width)
- Activity feed (card with list)
- Charts (to be added in Sprint 2)

### 3.3 Leads List Screen

**Layout**:

```
┌─────────────────────────────────────────────────────┐
│ Leads                                    [+ New]    │
├─────────────────────────────────────────────────────┤
│ [Search] [Filter ▼] [Sort ▼]                       │
├─────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────┐   │
│ │ Name        │ Company  │ Status │ Actions  │   │
│ ├─────────────────────────────────────────────┤   │
│ │ John Doe    │ ABC Corp │ New    │ [View]   │   │
│ │ Jane Smith  │ XYZ Inc  │ Active │ [View]   │   │
│ │ ...         │ ...      │ ...    │ [View]   │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ Showing 1-10 of 234        [< 1 2 3 ... 24 >]     │
└─────────────────────────────────────────────────────┘
```

**Components**:

- Page header with title and action button
- Search bar (full width)
- Filter and sort dropdowns
- Data table with pagination
- Action buttons (icon buttons)

### 3.4 Task Detail Screen

**Layout**:

```
┌─────────────────────────────────────────────────────┐
│ < Back to Tasks                                     │
├─────────────────────────────────────────────────────┤
│ Task: Follow-up call with ABC Corp                 │
│ Status: [In Progress ▼]                            │
│                                                     │
│ Details                                             │
│ ┌─────────────────────────────────────────────┐   │
│ │ Assigned to: John Doe                       │   │
│ │ Due date: 2026-01-15                        │   │
│ │ Priority: High                              │   │
│ │ Description: Call to discuss proposal       │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ Evidence                                            │
│ ┌─────────────────────────────────────────────┐   │
│ │ [Upload File] [Take Photo]                  │   │
│ │ • call_notes.pdf (uploaded 2 hours ago)     │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ [Save] [Complete Task]                             │
└─────────────────────────────────────────────────────┘
```

**Components**:

- Back navigation
- Task title (text-2xl, font-bold)
- Status dropdown
- Details card
- Evidence upload section
- Action buttons (primary and secondary)

### 3.5 Profile Screen

**Layout**:

```
┌─────────────────────────────────────────────────────┐
│ Profile Settings                                    │
├─────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────┐   │
│ │ [Avatar]                                    │   │
│ │ John Doe                                    │   │
│ │ john.doe@example.com                        │   │
│ │ Sales Representative                        │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ Personal Information                                │
│ ┌─────────────────────────────────────────────┐   │
│ │ First Name: [John]                          │   │
│ │ Last Name: [Doe]                            │   │
│ │ Email: [john.doe@example.com]               │   │
│ │ Phone: [+1234567890]                        │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ Preferences                                         │
│ ┌─────────────────────────────────────────────┐   │
│ │ Language: [English ▼]                       │   │
│ │ Theme: [Light ▼]                            │   │
│ │ Notifications: [✓] Email [✓] Push          │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ [Save Changes] [Change Password]                   │
└─────────────────────────────────────────────────────┘
```

---

## 4. Responsive Design

### 4.1 Breakpoints

```css
--breakpoint-sm: 640px; /* Mobile landscape */
--breakpoint-md: 768px; /* Tablet portrait */
--breakpoint-lg: 1024px; /* Tablet landscape */
--breakpoint-xl: 1280px; /* Desktop */
--breakpoint-2xl: 1536px; /* Large desktop */
```

### 4.2 Mobile Adaptations

**Navigation**:

- Sidebar collapses to hamburger menu
- Top navigation shows only logo and menu icon
- Bottom tab navigation for primary actions

**Cards**:

- Stack vertically on mobile
- Full width on mobile
- Reduced padding (--space-4)

**Tables**:

- Convert to card layout on mobile
- Show only essential columns
- Horizontal scroll for full table

**Forms**:

- Full width inputs
- Stack form fields vertically
- Larger touch targets (min 48px)

---

## 5. Accessibility

### 5.1 WCAG 2.1 AA Compliance

**Color Contrast**:

- Text: Minimum 4.5:1 ratio
- Large text (18pt+): Minimum 3:1 ratio
- UI components: Minimum 3:1 ratio

**Keyboard Navigation**:

- All interactive elements focusable
- Focus indicators visible (2px outline, --primary-red)
- Tab order logical
- Skip to main content link

**Screen Readers**:

- Semantic HTML (header, nav, main, footer)
- ARIA labels for icons
- ARIA live regions for dynamic content
- Alt text for images

**Forms**:

- Labels associated with inputs
- Error messages announced
- Required fields indicated
- Validation messages clear

### 5.2 Focus States

```css
:focus-visible {
  outline: 2px solid var(--primary-red);
  outline-offset: 2px;
}
```

---

## 6. Localization

### 6.1 RTL Support (Arabic)

**Layout**:

- Mirror layout for RTL languages
- Text alignment: right
- Icons: Mirror directional icons
- Padding/margin: Swap left/right

**CSS Approach**:

```css
[dir="rtl"] {
  direction: rtl;
  text-align: right;
}

[dir="rtl"] .sidebar {
  left: auto;
  right: 0;
}
```

### 6.2 Text Expansion

**Design for expansion**:

- English → Arabic: +20-30% text length
- Flexible layouts (no fixed widths)
- Test with longest translations

### 6.3 Date/Time Formats

**English**: MM/DD/YYYY, 12-hour (AM/PM)  
**Arabic**: DD/MM/YYYY, 24-hour

---

## Implementation Notes

### Priority Screens (Sprint 1-2):

1. Login
2. Dashboard
3. Leads List
4. Task Detail
5. Profile

### Design Tools:

- Figma for high-fidelity mockups (to be created)
- Material-UI as component library base
- Storybook for component documentation

### Design Handoff:

- Figma files with component specs
- Exported assets (SVG icons, images)
- Design tokens (JSON)
- Component library in Storybook

---

**Document Status**: Approved for Development  
**Next Steps**: Create Figma mockups for 5 priority screens  
**Owner**: UI/UX Designer (to be hired) / Technical Lead (interim)  
**Last Updated**: 2026-01-08
