# The Enchanted Invitation
### Evelyn Ashcroft × Adrian Blackwood — 31 October 2026

> An interactive digital wedding invitation and cinematic story experience.

---

## ✦ Master Experience Flow

| Scene | Experience |
|-------|------------|
| **Scene 1** | Sealed envelope & wax crack — 14-step physical animation with calligraphy reveal |
| **Scene 2** | The Love Constellation — two celestial orbits converging across 4 milestones |
| **Scene 3** | Magical Parchment Map — hand-drawn cartography with progressive footsteps |
| **Scene 4** | Liquid Memory Gallery — tactile fluid displacement with velocity tracking |
| **Scene 5** | The TimeKeeper — interactive antique clock transforming atmospheric lighting |
| **Scene 6** | Astronomical Orrery Countdown — concentric counter-rotating gears & live telemetry |
| **Scene 7** | Tactile RSVP — physical wax seal stamping ceremony & reserved confirmation |
| **Scene 8** | Cinematic Final Reveal — particle vortex converging into the save-the-date frame |

---

## 🛠 Tech Stack

- **React 19** + **Vite 8**
- **GSAP 3** (ScrollTrigger, Keyframes, Scrub)
- **Web Audio API** (Procedural zero-dependency tactile audio synthesizer)
- **Canvas 2D API** (Particle systems, celestial orrery, fluid cosmos)
- **SVG Displacement & Cartography** (Hand-drawn map, antique clock, filigrees)
- **Vanilla CSS** (Design tokens, safe areas, 100dvh, film grain noise)
- **Typography**: Cinzel Decorative, Cormorant Garamond, IM Fell English

---

## 🚀 Running Locally

### Prerequisites
- Node.js 18+ 
- npm 9+

### ⚡ 1-Click Launch (Windows)
Simply double-click:
- **`Launch Website.bat`** to automatically verify Node.js, install packages (if missing), start the local server, and open the website in your browser.

---

### Manual Terminal Run

```bash
# Install dependencies
npm install

# Start local server (automatically opens browser)
npm run dev -- --open
```

For the primary mobile target, set the viewport to **390×844** (iPhone 14 Pro).

### Build for Production

```bash
npm run build
npm run preview
```

---

## 🌐 Deploy to Vercel

This repository is pre-configured and optimized for **Vercel** with:
- Zero-config build pipeline (`framework: vite`)
- Automated single-page application (SPA) routing rewrites
- Immutable 1-year asset caching (`Cache-Control: public, max-age=31536000, immutable`)
- Modern edge security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`)
- Production bundle chunk splitting (`vendor-react`, `vendor-gsap`)

### 1-Click Deploy via Vercel Dashboard
1. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
2. Import the `Wedding_UI-UX` GitHub repository.
3. Vercel will automatically detect Vite and settings from `vercel.json`.
4. Click **Deploy**.

### Deploy via Vercel CLI
```bash
npx vercel
# For production deployment:
npx vercel --prod
```

---

## 📁 Project Structure

```
src/
  components/
    EnvelopeIntro.jsx      Scene 1: Interactive envelope, wax fracture & letter
    LoveConstellation.jsx  Scene 2: Celestial orbits & story milestones
    MagicalMap.jsx         Scene 3: Hand-drawn fantasy map with footsteps
    MemoryGallery.jsx      Scene 4: Liquid displacement photo chronicle
    TimeKeeper.jsx         Scene 5: Draggable antique clock & lighting engine
    Countdown.jsx          Scene 6: Astronomical orrery countdown
    RSVP.jsx               Scene 7: Tactile parchment RSVP & wax stamp
    FinalReveal.jsx        Scene 8: Cinematic finale & date reveal
    WorldCanvas.jsx        Persistent ambient cosmos backdrop
    NoiseOverlay.jsx       Film grain overlay
  utils/
    audioSystem.js         Procedural Web Audio API sound synthesizer
  data/
    weddingData.js         Centralized wedding content
  styles/
    index.css              Design tokens, typography, safe areas, global styles
```

---

## ♿ Accessibility & Performance

- All interactive elements have comprehensive ARIA attributes (`aria-label`, `aria-live`, `aria-valuenow`).
- Full keyboard navigation support (Clock, Gallery, Sound toggle with 'M' key).
- `prefers-reduced-motion` compliance across all scenes.
- 100dvh dynamic viewport sizing with safe-area insets (`env(safe-area-inset-top/bottom)`).
- Offscreen cleanup and requestAnimationFrame management.
