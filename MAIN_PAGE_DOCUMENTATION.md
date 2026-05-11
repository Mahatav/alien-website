# Main Page Documentation - Detailed Breakdown

## Overview
The main_page is a sophisticated, animation-heavy web experience for "Is Skinny Bob Real?" - a narrative-driven website about classified incidents and contact evidence. It uses Webflow, Rive animations, Three.js GL rendering, and custom JavaScript.

---

## 1. HTML STRUCTURE & LAYOUT

### Head Section (Meta & Scripts)
- **Title**: "Is Skinny Bob Real? | The Truth Behind ivan0135"
- **Meta Description**: "Investigating the ivan0135 footage, the Mnemosyne archive, and the existence of Skinny Bob."
- **Random Redirect Script** (Lines 5-14): 10% chance on page load to redirect to `/gate` (terminal experience)
  - Uses `sessionStorage` to prevent re-triggering on return
  - `dwp_visited` flag prevents loops

### CSS & Styling
- **Main Stylesheet**: `css/lando-offbrand.shared.043b62fef.css` (Webflow generated)
- **Theme Colors**: Custom CSS variables for theming
  - `--color--lime`: #72a6ff (primary accent)
  - `--color--lime-off`: #ff5a5a (secondary accent)
  - `--color--dark-green`: #090d14 (dark backgrounds)
  - Various tint variations for layering

- **Inline Styles** (Head): Extensive color overrides that convert the page from green theme to blue/red theme

### JavaScript
- **Main Framework**: Lando OFF+BRAND (custom Webflow extensions)
  - `lando.OFF+BRAND.gold-android-fix-03.js` - Main app logic
  - `lando-offbrand.schunk.*.js` - Code splitting chunk
  - `lando-offbrand.751e0867.*.js` - Additional chunks
  - `jquery-3.5.1.min.js` - jQuery dependency

- **Special Scripts**:
  - Google Analytics tracking
  - Theme color sanitizer (converts green to blue/red)

---

## 2. MAJOR SECTIONS

### Navigation / Header (`nav-w`)
- **Sticky Navigation**: Desktop navigation bar with:
  - Logo and home link (SVG with Rive canvas)
  - Centered alien logo, scaled up and visually enlarged with a transform
  - Hover-only eye tint overlay with a 50/50 red-or-blue random choice per hover
  - Scroll-down shrink state so the logo compresses to a smaller nav-size version
  - Top-right Store button
  - Navigation theme targets for light/dark switching

- **Mobile Landscape Warning** (`mob-landscape-w`)
  - Rive canvas with "Please rotate your device" message
  - Only visible in mobile landscape orientation
  - Encourages portrait mode for optimal experience

### Scroll Indicators
- `.scroll-indicator` - Visual bar showing scroll progress
- `.top-marker` - Reference element for scroll tracking

---

## 3. LOADING/TRANSITION SCREEN
**⚠️ THIS IS THE "LOAD EVIDENCE" LOADING SCREEN**

### HTML Element
```html
<div class="transition-w">
  <div class="transition-rive w-embed">
    <canvas data-rive-primary=""></canvas>
  </div>
  <div class="transition-btn">
    <a href="#" class="btn-w">
      <div class="btn-text">Load Evidence</div>
    </a>
  </div>
  <div class="js__embed w-embed w-script">
    <!-- <script src="./js/transitions-rive-isolate.js"></script> -->
  </div>
</div>
```

### CSS Styling
- **`.transition-w`**: Fixed full-screen overlay (z-index: 9999)
  - Dark background with gradient overlays
  - Uses radial gradients (blue and red tones)
  - Linear gradient base: #05070d → #0b1019 → #070a11

- **`.transition-w::before`**: Animated star field background
  - 8 different radial gradients creating star positions
  - Background size: 420px 420px
  - Animation: `star-drift` (moves -80px, -120px over 36s)
  - Opacity: 0.8

- **`.transition-w::after`**: Pulsing vignette
  - Radial gradient creating circular fade
  - Animation: `star-pulse` (opacity 0.94 → 0.78 → 0.94 over 3.8s)

- **`.transition-rive`**: Rive canvas styling
  - Filter: grayscale(1) contrast(1.15) brightness(0.92)
  - Opacity: 0.84
  - Position: relative z-index 2

- **`.transition-btn`**: "Load Evidence" button wrapper
  - Position: relative z-index 3
  - Border: 1px solid rgba(102, 163, 255, 0.72)
  - Box shadow: Blue glow 0 0 20px + Red glow 0 0 42px
  - Background: rgba(8, 14, 24, 0.7)

### Animations
1. **`@keyframes star-drift`** (36s linear infinite)
   - From: translate3d(0, 0, 0) scale(1)
   - To: translate3d(-80px, -120px, 0) scale(1.04)

2. **`@keyframes star-pulse`** (3.8s ease-in-out infinite)
   - 0%: opacity 0.94
   - 50%: opacity 0.78
   - 100%: opacity 0.94

---

## 4. MAIN CONTENT AREA

### Page Wrapper (`page-w`)
- **Attribute**: `data-start="hidden"` - Initially hidden, animated in
- **Framework**: Taxi.js (page transition framework)
- **Main element**: Contains `data-taxi=""` and `data-taxi-view=""`

### Hero Section - Full-Screen Video Player
- **Video Container**: `<section class="video-hero-section">`
  - Full viewport height (100vh)
  - Black background (#000)
  - `object-fit: cover` for responsive scaling

- **Video Element**:
  - Source: `YTDown_YouTube_Skinny-Bob-Brightened-up-at-maximum-Eyes_Media_B1KT4SKCniI_001_480p.mp4`
  - Autoplay enabled
  - Muted by default (no audio)
  - Loop enabled (continuous background playback)
  - **No controls** - Video plays automatically in background, users cannot pause, stop, or skip
  - Responsive sizing: width/height 100%

- **Browser Compatibility**:
  - `playsinline` attribute for iOS Safari
  - HTML5 video fallback message for unsupported browsers
  - Works on desktop, tablet, and mobile devices

### Content Sections

#### 1. Impact Section
- Icon: Base helmet with Rive animation (reef artboard)
- Headline with animation:
  - Eyebrow: "classified since 1947"
  - Main text: "Something is out there..." with bold keywords

#### 2. Horizontal Scroll Section (`is-horizontal-track`)
- **Data Attributes**:
  - `data-horizontal-section=""`
  - `data-gl-change-to="white, dark-green-tint-1-low"` - Color change on scroll
  - `data-h-color-from="dark-green"` / `data-h-color-to="white"` - Transition colors

- **Grid Structure**: Multiple incident cards:
  - Card 1: Tunguska, 2011
  - Card 2: Roswell, 1947
  - Callout: Quote with classified stamp
  - Card 3: Kyshtym, 1979
  - Card 4: Rendlesham, 1980
  - Card 5: Socorro, 1964
  - Card 6: Levelland, 1957
  - Card 7: Tehran, 1976
  - Card 8: Voronezh, 1989
  - Callout 2: Quote with signature
  - Card 9: Hudson Valley, 1983
  - Card 10: Phoenix, 1997

- **Card Structure**:
  - Eyebrow with date (class: `c-green-off-white-2` or `c-dark-green-tint-2`)
  - Image with responsive srcsets
  - Lazy loading enabled

#### 3. "The Signal / The Contact" Section (`is-otot-home`)
- **Two Column Layout**:
  - **Left (The Signal)**:
    - Headline: "THE / SIGNAL"
    - Body: "Most recent sightings, decoded transmissions..."
    - Arrow button with Rive animation
  - **Right (The Contact)**:
    - Headline: "THE / CONTACT"
    - Body: "Evidence logs, decoded messages..."
    - Arrow button with Rive animation

- **Background Images**:
  - Helmet image (left)
  - Head image (right)
  - Large focal image (bottom)

#### 4. Helmets Grid Section (`home-helmets`)
- **Title**: "Known / Incidents"
- **Description**: "Roswell 1947. Ariel School 1994..."
- **Dynamic Grid**: Renders helmet items from data
  - Each item has:
    - SVG frame border (customizable)
    - Base and hover images
    - Title and date
    - Animated extender with gradient masks

---

## 5. RIVE ANIMATIONS

### Canvas Elements & Their Files
1. **Logo Animation** (`data-rive-ln4=""`)
   - File: Internal (logo rendering)

2. **Primary Transition Canvas** (`data-rive-primary=""`)
   - Part of loading screen

3. **Mob Landscape Warning** (`data-rive-mob-landscape=""`)
   - Device rotation warning

4. **Reef Helmet** (`data-rive-object=""`)
   - File: `reef.riv`
   - Artboard: `helmet-reef`
   - State Machine: `helmet-reef_play`
   - Input: `color_green-off-white-2`

5. **Phrases/On** (`data-rive-object=""`)
   - File: `phrases.riv`
   - Artboard: `phrase_on`
   - State Machine: `phrase_on`

6. **Button Arrows** (`data-rive-object=""`)
   - File: `btn-ui.riv`
   - Artboard: `arrow`
   - State Machine: `arrow`

### Rive Configuration Attributes
- `data-rive-file`: Rive file name
- `data-rive-artboard`: Artboard within file
- `data-rive-state-machine`: State machine name
- `data-rive-input`: Input parameter (e.g., color)
- `data-rive-fit`: Fit mode (contain/cover)
- `data-rive-hover`: Hover animation trigger
- `data-rive-scrolltrigger`: Trigger on scroll
- `data-rive-scrolltrigger-start/end`: Scroll boundaries

---

## 6. THREE.JS GL RENDERING

### Canvas Elements
- Main canvas: `<div data-gl="head" class="gl-canvas"></div>`

### Related Files
```
gl/
├── models/
│   ├── helmet-21.glb
│   ├── disco-02.glb
│   └── tracks-05.glb
├── textures/
│   ├── head/webp/ (diffuse, depth, alpha, normal, shadow)
│   ├── helmet/webp/ (gold, disco, normal, roughness, metallic)
│   ├── glass/webp/
│   ├── tracks/
│   ├── noise/
│   └── plastic/
├── hdri/
│   ├── studio_small_08_1k--light.hdr
│   └── studio_small_08_1k--faded.hdr
├── fonts/
│   ├── Brier-Bold-msdf.json
│   └── MonaSans-Bold-msdf.json
├── draco/
│   ├── draco_wasm_wrapper.js
│   └── draco_decoder.wasm
```

### Styling
- `mix-blend-mode: screen` - Light blending
- `opacity: 0.9` - Slightly transparent
- Filter: `grayscale(1) contrast(1.12) brightness(0.96)` - Applied to images

---

## 7. DATA ATTRIBUTES FOR ANIMATION & STATE

### Animation Triggers
- `data-anim-high="direction, color, delay"` - High impact animations
  - Directions: "left", "right", "up", "down"
  - Colors: "lime", "lime-off", "dark-green", etc.
  - Delay: milliseconds

### Text Animation
- `split-text="lines"` - Animate by lines
- `split-text="lines,chars"` - Animate by lines then characters

### Scroll Triggers
- `data-hero-animation-container=""` - Hero section scroll zone
- `data-sticky-hero="track"` - Sticky tracking
- `data-gl-track="head"` - GL canvas tracking
- `data-rive-scrolltrigger="true"` - Rive animation on scroll
- `data-rive-scrolltrigger-start="top center"` - Scroll start point

### Theme & Color Changes
- `data-theme="lime"` - Apply lime color theme
- `data-gl-change-from="dark-green"` - Initial GL color
- `data-gl-change-to="white"` - Final GL color
- `data-nav-theme-target="dark/light"` - Navigation theme

---

## 8. RESPONSIVE DESIGN

### Breakpoints
- **Desktop**: Full experience
- **Tablet**: 768px - 991px
  - Some layout adjustments
- **Mobile Landscape**: 480px - 767px
  - Mob landscape warning shown
  - Touch controls enabled
- **Mobile Portrait**: < 480px
  - Simplified layout
  - Touch-optimized

### Mobile Features
- `data-hide="m"` - Hide on mobile
- `data-home-swipe-wrap=""` - Mobile swipe controls
- `.mob-landscape-block` - Landscape warning

---

## 9. PERFORMANCE OPTIMIZATIONS

### Image Optimization
- WebP format exclusively
- Multiple srcsets for responsive loading
- `loading="lazy"` for below-fold images
- Sizes attribute for viewport-aware loading

### Code Splitting
- Multiple JS chunks: `schunk.*.js`, `751e0867.*.js`
- Deferred script loading: `<script defer>`

### Asset Preloading
- Font preload: `MonaSans-VariableFont_wdth%2Cwght.woff2`
- DNS prefetch: CDN domains

---

## 10. INTERACTIVE ELEMENTS

### Navigation Buttons
- **Archive Button**: `.btn-w` with Rive hover effect
- **Arrow Buttons**: Rotate on hover (`data-btn-rive-rotate="true"`)
- **Link Targets**: Hash routing with Taxi.js

### Touch/Swipe Controls
- `data-home-swipe-toggle=""` - Lock/unlock swipe
- SVG icons for UI states
- Descriptions update based on state

### Hover States
- `data-btn-rive-hover=""` - Rive animation on hover
- Color transitions on theme change
- Scale/transform effects

---

## 11. ANALYTICS & TRACKING

### Google Analytics
- Tag ID: G-P8L2KTXDN0
- Developer IDs: dZGVlNj, dYWYxNW
- Events tracked:
  - Page views
  - User engagement
  - Scroll depth
  - Button clicks

### Server-Side Tracking
- POST requests to Google Analytics endpoint
- Pixel tracking embedded in HTML

---

## 12. ACCESSIBILITY

### Screen Reader Support
- `<h1 class="screen-reader">Skinny Bob</h1>`
- `<h2 class="screen-reader">The Visitor Who Never Went Home</h2>`
- `aria-current="page"` on active nav link
- `title=""` attributes on links

### Semantic HTML
- Proper heading hierarchy
- Section elements for content grouping
- Figure/figcaption for images

---

## 13. KEY TECHNICAL NOTES

### Important Class Names (DO NOT REMOVE)
- `.transition-w` - Loading screen container
- `.transition-rive` - Loading animation
- `.transition-btn` - Load Evidence button
- `.home-hero` - Main hero section
- `.page-w` - Main page wrapper
- `.gl-canvas` - 3D canvas container
- `.sticky-track` - Sticky positioning container

### CSS Custom Properties Used
- `--color--lime`, `--color--lime-off`
- `--color--dark-green`, `--color--dark-green-tint-1`, `--color--dark-green-tint-2`
- `--animation-default` - Animation timing
- `--cubic-default` - Easing function

### Webflow-Specific
- `w-embed` - Webflow embed containers
- `w-dyn-list`, `w-dyn-items` - Dynamic content containers
- `w-inline-block`, `w-block` - Display helpers
- `wf-design-mode` - Design mode styles

---

## 14. FILE LOCATIONS REFERENCE

```
main_page/
├── index.html (THIS FILE)
├── server.py (Development server)
├── css/
│   └── lando-offbrand.shared.043b62fef.css
├── js/
│   ├── lando.OFF+BRAND.gold-android-fix-03.js (MAIN APP)
│   ├── lando-offbrand.schunk.*.js
│   ├── lando-offbrand.751e0867.*.js
│   ├── jquery-3.5.1.min.js
│   └── transitions-rive-isolate.js (LOADING ANIMATION)
├── fonts/
│   ├── *.svg (Icon/mask assets)
│   ├── *.json (Rive font files)
│   └── *.woff2 (Web fonts)
├── images/ (All webp images)
├── rive/ (Rive animation files)
│   ├── btn-ui.riv
│   ├── circuits.riv
│   ├── ln4.riv
│   ├── mob-landscape.riv
│   ├── phrases.riv
│   ├── reef.riv
│   └── signature.riv
├── gl/ (Three.js WebGL assets)
│   ├── models/
│   ├── textures/
│   ├── hdri/
│   ├── fonts/
│   └── draco/
└── page-transition.riv
```

---

## SUMMARY

The main_page is a complex, multi-layered experience with:
1. **Full-Screen Video Hero** with native HTML5 player controls
2. **Horizontal Scroll** timeline of incidents
3. **"The Signal / The Contact"** two-column layout section
4. **Helmet Gallery** with dynamic grid rendering
5. **Responsive** touch-friendly design
6. **Heavy Animation** using Rive, CSS, and JS
7. **Analytics** embedded throughout
8. **Optimized** images and code splitting

**To modify safely**:
- Adjust video source in the `<video>` tag `src` attribute
- Keep video controls enabled for user accessibility
- Test responsive behavior on mobile devices
- The video path is relative to the main_page folder
