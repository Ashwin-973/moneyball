# Design System Document

## 1. Overview & Creative North Star: "The Hyperlocal Pulse"

This design system is engineered to bridge the gap between high-science precision and the frantic energy of a flash-sale marketplace. Our Creative North Star is **"The Hyperlocal Pulse"**—a philosophy that treats every "deal" not as a generic discount, but as a curated event with biological urgency.

We break away from the "template" look of traditional e-commerce by embracing **Editorial High-Contrast.** The layout relies on intentional asymmetry, where large-scale high-fidelity imagery of products overlaps with dark-mode utility panels. By mixing "Lab-Grade" technical elements (monospaced labels, crisp grids) with consumer-friendly warmth, we create an experience that feels both authoritative and accessible.

---

## 2. Colors

The palette is rooted in a sophisticated interplay between deep, tech-heavy charcoals and clean, breathable surfaces. 

### The Palette
- **Primary (`#0d1a1b` / `primary`):** A deep charcoal "Off-Black" used for high-impact dark mode sections and retailer sidebars.
- **Secondary (`#3a6a00` / `secondary`):** An energetic Lime Green derived from technical accents. This is our primary driver for conversion.
- **Surface (`#eefcfd` / `surface`):** A crisp, high-end off-white that prevents the interface from feeling "stale" or "clinical."
- **Urgency Tokens:** `error` (#ba1a1a) for expiring timers and `on_secondary_container` (#3f7102) for high-value badges.

### The "No-Line" Rule
To achieve a premium editorial feel, **1px solid borders are strictly prohibited for sectioning.** Boundaries must be defined through background color shifts. For example, a `surface-container-low` section should sit adjacent to a `surface` background to create a clean, modern break without the clutter of lines.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. Use the `surface-container` tiers (Lowest to Highest) to create "nested" depth.
- **Level 1:** `surface` (The base canvas)
- **Level 2:** `surface-container-low` (Secondary content blocks)
- **Level 3:** `surface-container-highest` (Prominent cards or floating modals)

### The "Glass & Gradient" Rule
For hero sections and "Deal of the Day" CTAs, use **Glassmorphism.** Floating elements should utilize semi-transparent versions of `primary_container` with a `backdrop-blur` (12px-20px). Main CTAs should feature a subtle linear gradient from `primary` to `primary_container` to provide a "tactile" soul that flat colors cannot achieve.

---

## 3. Typography

Our typography system is a study in contrast: the humanist warmth of **Inter/Plus Jakarta Sans** paired with the technical precision of **Space Grotesk.**

- **Display Scale (`display-lg` to `display-sm`):** Set in **Plus Jakarta Sans.** Used for massive discount percentages and hero headlines. These should feel "heavy" and unavoidable.
- **Technical Labels (`label-md` to `label-sm`):** Set in **Space Grotesk.** Use these for countdown timers, stock counts ("ONLY 3 LEFT"), and distance markers ("0.4 miles away"). This monospaced feel mimics technical readouts.
- **UI & Body (`title-md` to `body-sm`):** Set in **Inter.** This provides maximum legibility for product descriptions and merchant details.

**Signature Styling:** Prices should always use **High-Contrast Bold Numerals.** If a deal is active, the price should be 2x the size of the surrounding text to ensure it is the first thing the eye hits.

---

## 4. Elevation & Depth

We eschew traditional shadows in favor of **Tonal Layering.**

- **The Layering Principle:** Place a `surface-container-lowest` card on a `surface-container-low` section. The slight shift in brightness creates a natural "lift" that feels integrated into the environment.
- **Ambient Shadows:** For floating action buttons or "Flash Deal" pop-ups, use an extra-diffused shadow: `box-shadow: 0 20px 40px rgba(17, 30, 31, 0.06);`. The shadow color must be a tinted version of `on-surface` rather than neutral grey.
- **The "Ghost Border" Fallback:** If a container requires a boundary (e.g., in a high-density list), use a **Ghost Border**: `outline-variant` (#c2c7c7) at **15% opacity**.
- **Frosted Glass:** Navigation bars and sticky headers must use `surface_container_low` at 80% opacity with a heavy blur. This allows product imagery to bleed through as the user scrolls, maintaining a sense of place.

---

## 5. Components

### Buttons
- **Primary:** `secondary` background, `on_secondary` text. **8px corner radius.** No border. High-contrast.
- **Secondary (Dark Mode Utility):** `primary_container` background with `on_primary` text. Use for "Save for Later" or "View Merchant."
- **Tertiary:** Text-only with an underline on hover, using the `secondary` color for the line.

### Cards & Lists
- **The Card Rule:** **12px corner radius.** Never use dividers between list items. Use vertical white space (`spacing-8`) or a subtle alternating background shift between `surface` and `surface-container-lowest`.
- **Imagery:** Cards must feature high-bleed imagery that touches the top and sides of the container, creating an editorial, magazine-like feel.

### Pulse Badges (Specialized)
- **Discount Badges:** Pill-shaped (`full` roundedness), `secondary_container` background with `on_secondary_container` text.
- **Urgency Tags:** Pill-shaped, `error` text on a `error_container` background. Positioned overlapping the top-right corner of product images.

### Input Fields
- **Search:** `surface_container_highest` background, no border, 8px radius. Use the `Space Grotesk` font for placeholder text to maintain the "Tech-Forward" aesthetic.

---

## 6. Do's and Don'ts

### Do
- **DO** use asymmetry. Place a large product image on the left and a technical "Spec Sheet" style price readout on the right.
- **DO** lean into high-quality photography. The system relies on the "Premium" look of the imagery to balance the minimalist UI.
- **DO** use the `secondary` (Lime Green) sparingly. It should be a beacon for action, not a decorative element.

### Don't
- **DON'T** use 100% black. Always use the `primary` (#0d1a1b) to maintain tonal depth.
- **DON'T** use standard drop shadows. If it doesn't look like ambient light, it's too heavy.
- **DON'T** use dividers. If content needs to be separated, increase the `spacing-10` or shift the surface tier.
- **DON'T** use rounded corners larger than 12px for cards. We want "Sophisticated Sharpness," not "Playful Bubbles."

---