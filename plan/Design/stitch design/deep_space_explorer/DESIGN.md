```markdown
# Design System Document: Tactical Astral Interface

## 1. Overview & Creative North Star
**Creative North Star: The Astral Tactical Interface**
This design system moves beyond the cliché of "cyberpunk" by merging the brutal, atmospheric melancholy of *Blade Runner 2049* with the rigid, high-stakes precision of NASA Mission Control. We are not building a website; we are designing a pressurized, high-fidelity Heads-Up Display (HUD) for deep-space navigation.

To achieve a high-end editorial feel, we reject standard "web" layouts. We embrace **Data Density vs. The Void**. This means using large areas of pure black (`#000000`) contrasted against hyper-detailed clusters of technical information. Layouts should feel intentional and asymmetric—place critical data in "quadrants" and use thin grid lines to anchor elements rather than box them in.

---

## 2. Colors & Surface Architecture
The palette is rooted in the "Void," utilizing varying levels of darkness to imply depth without ever breaking the immersion of deep space.

### The Color Logic
*   **Primary (NASA Blue):** Use `primary_container` (#0B3D91) for structural elements, borders, and active glow states. It represents the "safety" of the vessel.
*   **Secondary (Electric Cyan):** Use `secondary_container` (#00F4FE) for interactive elements, data visualizations, and "live" signals.
*   **Tertiary (Hot Magenta):** Use `tertiary_container` (#860040) sparingly for critical hazards, engine heat, or life-support warnings.

### The "No-Line" Rule (Sectioning)
Prohibit the use of 1px solid borders to section off large areas of the screen. Instead:
1.  **Tonal Transitions:** Define sections by moving from `surface` (#131313) to `surface_container_low` (#1B1B1B).
2.  **Implicit Boundaries:** Use the 1px grid overlay or "HUD Brackets" in corners to define a space without closing it off.
3.  **The Void:** Let the background flow. Boundaries should feel like light hitting a surface in a dark room, not a drawn box.

### Surface Hierarchy & Glassmorphism
We treat the UI as a series of floating glass panes. 
*   **Base Layer:** Pure Black (#000000) with a faint `surface_variant` (#353535) scanline overlay.
*   **The Glass Rule:** All cards and panels must use `surface_container` with a backdrop-blur (12px–20px) and a 1px border using `secondary_fixed_dim` (#00DCE5) at 20% opacity.
*   **Inner Glow:** Apply a subtle `0px 0px 10px` inner shadow using `primary_container` to give the glass a "charged" feel.

---

## 3. Typography
The typography is a dialogue between human-readable clarity and machine-processed data.

*   **Display & Headlines (`Space Grotesk`):** High-contrast, wide-set, and authoritative. Use `display-lg` for mission titles. This is your "Editorial" voice.
*   **Data & Labels (`Space Mono`):** All labels (`label-md`, `label-sm`) and data points must use a monospace font. 
*   **The "Protocol" Style:** All labels and badges must be **UPPERCASE** with a letter-spacing of `0.1em` to mimic technical readouts.
*   **Body (`Inter`):** Used for long-form mission briefings. It provides a clean, neutral balance to the aggressive technicality of the headlines.

---

## 4. Elevation & Depth
In this system, elevation is not achieved through light and shadow, but through **Luminance and Layering.**

*   **The Layering Principle:** Stack `surface-container-lowest` on `surface` to create a "recessed" look for input areas. Use `surface-container-highest` for "active" modules that are popping out toward the pilot.
*   **Ambient Glow:** Instead of drop shadows, use "Glow Elevation." A floating modal should have a soft, diffused outer glow of `secondary` (#00F4FE) at 5% opacity with a 40px blur. This mimics the light of a screen reflecting off the pilot's helmet.
*   **HUD Brackets:** For floating cards, use 1px L-shaped brackets in the corners using the `secondary` token. This anchors the element in 3D space without needing a heavy background.

---

## 5. Components

### Buttons
*   **Primary:** `surface_container` fill, 1px border of `secondary`, `Space Mono` uppercase text. On hover, increase border opacity and add a `secondary` outer glow.
*   **Action State:** When clicked, the button should "flicker" (opacity shift 100% -> 70% -> 100%) to mimic hardware feedback.

### Chips & Badges
*   **Pill Shape:** Use a strict 0px radius (Rectangular) for a more brutalist, technical look, or a full pill for status indicators.
*   **Visuals:** Mono font, uppercase, `surface_container_highest` background.

### Input Fields
*   **Style:** No bottom line or full box. Use "Corner Brackets" only. 
*   **Active State:** The cursor should be a solid `secondary` block. The background shifts to `surface_container_low`.

### Cards & Lists
*   **No Dividers:** Never use a horizontal line to separate list items. Use a `4px` vertical gap and a slight background shift (`surface_container` to `surface_container_high`) on hover.
*   **Hex Accents:** Use a faint hexagonal pattern mask on the right 20% of cards to add texture to data-heavy areas.

---

## 6. Do's and Don'ts

### Do:
*   **Embrace Asymmetry:** Align some text to the far left and small data points to the far right.
*   **Use "Ghost" Text:** Use `on_surface_variant` at 40% opacity for non-critical metadata to create visual hierarchy.
*   **Intentional Friction:** Use scanlines and "noise" textures to make the UI feel like physical hardware.

### Don't:
*   **No Rounded Corners:** Everything is `0px` radius. Roundness suggests consumer comfort; we want tactical precision.
*   **No Solid White:** Avoid pure `#FFFFFF`. Use `on_surface` (#E2E2E2) or `secondary` (#E6FEFF) to prevent eye strain in the "Void."
*   **No Standard Grids:** Avoid simple 3-column layouts. Use overlapping containers and offset margins to create a "custom-built" feel.

---

## 7. Signature Interaction: The "Boot Sequence"
Every view transition should feel like a system initialization. Elements shouldn't just "appear"—they should stagger-fade in, with borders drawing themselves first, followed by the text data, then the glass background. This reinforces the narrative that the user is operating a complex deep-space machine.```