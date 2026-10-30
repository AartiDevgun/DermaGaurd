# DermaGuard — Frontend Component Intake

Last updated: 2026-10-30

## Visual direction
- Background: near-black / black.
- Accent palette: electric blue, indigo, violet and purple.
- Background decoration: small falling crystalline shards in varied blue/purple tones.
- Shards must be disabled while the Light Tunnel is active; do not layer the effects simultaneously.
- Overall tone: bespoke, editorial, ethereal and carefully composed; avoid generic AI-dashboard patterns, generic blue buttons and generic panel layouts.
- Smooth scrolling and accessible reduced-motion behaviour are required.
- Component timing must follow real interaction/backend states wherever possible; do not fake backend progress with arbitrary timers.

## User-supplied React Bits components
The user decides the exact component placements. Do not substitute or introduce additional React Bits components.

| Component | Intended role / placement | Source intake |
|---|---|---|
| ElectricLogo | Brand mark / landing identity | TSX and CSS received |
| FlipCard | Image clarity score front; quality reasons on reverse | Awaiting source |
| BranchedMenu | Awaiting user placement instructions | Awaiting source |
| CallChip | Upload progress / call status | Awaiting source |
| GlideSelect | Image/file selection control (user called it “glide select”) | Awaiting source |
| JellyRadio | Awaiting user placement instructions | Awaiting source |
| LatticeLoader | Image Quality Agent processing state | Awaiting source |
| PeekRating | Post-result user feedback | Awaiting source |
| LightTunnel | Quality analysis background; falling shards must be hidden while active | Awaiting source |
| RefineFrame | Awaiting user placement instructions | Awaiting source |

## ElectricLogo details received
- Component: `ElectricLogo.tsx`
- Stylesheet: `ElectricLogo.css`
- TypeScript + CSS variant from React Bits.
- Required runtime dependency: `ogl@^1.0.11`.
- Component uses WebGL2 and displays a traced image outline with animated electrical arcs.
- It supports custom `src`, `color`, `glowColor`, scale, intensity, glow, strand count, interaction, theme and render callback props.
- Supplied CSS:
  - `.electric-logo { position: relative; width: 100%; height: 100%; overflow: hidden; }`
- The chosen DG brand mark is an intertwined “DG” monogram in a translucent blue-violet gradient, with the DermaGuard wordmark and the tagline “EARLY DETECTION. BETTER OUTCOMES.”
- The generated logo image has not yet been added as a repository asset. The original ElectricLogo effect source must be preserved and configured to use the approved DG mark as its source image when the app is assembled.

## Vercel state
- GitHub repository: `AartiDevgun/DermaGaurd`.
- Vercel account/team connection exists.
- As of 2026-10-30, Vercel project search filtered to `DermaGaurd` returned no projects.
- A DermaGuard Vercel project has not yet been created.
- Repository currently contains project documentation and README, not a deployable Next.js application.
- Create the Next.js app scaffold and integrate the first approved component before creating/linking the Vercel Git project, to avoid an initial deployment that cannot build.


## GlideSelect source received (user, 2026-10-30)
- `GlideSelect.tsx`: received as user attachment (React Bits TypeScript + CSS variant).
- `GlideSelect.css`: received in chat.
- Source component API includes options/value/defaultValue/onChange, placeholder, tags, accent/surface/highlight/text colours, sizes, menu placement/alignment, animation durations, disabled and accessibility label.
- Runtime dependencies: `@hugeicons/react` and `@hugeicons/core-free-icons`.
- Its implementation is an accessible animated combobox/listbox for selecting among predefined options. It does not itself open the operating-system file picker or upload a file. The actual image selection must use an HTML file input; GlideSelect can be used for an adjacent choice only if the product flow needs one. Do not claim GlideSelect itself handles file upload.
- Source has been received; integration is deferred until the app scaffold and user-authorised placements are ready.
