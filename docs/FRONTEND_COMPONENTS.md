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


## CallChip source received (2026-10-30)
- User supplied CallChip.tsx and CallChip.css.
- States: idle, running, done, error; elapsed timer, visual progress wash, done/error styling, optional retry callback.
- Dependencies: @hugeicons/react and @hugeicons/core-free-icons.
- Drive status from the actual upload/request lifecycle. The elapsed timer measures real running time. expectedMs controls the visual fill transition estimate; it is not actual upload percentage. Do not fabricate upload progress.
- Integration is deferred until the app scaffold is ready.


## LatticeLoader source received (2026-10-30)
- User supplied LatticeLoader.tsx and LatticeLoader.css.
- Supports working/done/error statuses, 3×3 or 4×4 animated patterns, optional glow, elapsed timer and accessibility announcements.
- No additional third-party runtime dependency is imported by this component.
- Timing integration: set status from the actual Agent 1 request lifecycle. When `elapsed` is omitted, the component measures elapsed time from its own `performance.now()` clock while status is `working`; alternatively, pass elapsed seconds from the parent request clock. Stop the working state on the actual response/error, not an arbitrary timeout.
- Intended role: visual processing indicator while the image-quality agent is genuinely running. Coordinate with LightTunnel so background shards are disabled during the tunnel state.
- Integration is deferred until the app scaffold is ready.


## LightTunnel source received (2026-10-30)
- User supplied LightTunnel.tsx and LightTunnel.css.
- Implements a WebGL2 animated tunnel with cable/pulse/tunnel color controls, inward/outward flow, pointer interaction, click surge, intro reveal and reduced-motion handling.
- No third-party runtime package is imported by this component.
- Intended role: visual environment while the Image Quality Agent is actively processing. The global falling-shard layer must be disabled for the entire LightTunnel-active state and restored after that state ends.
- The component uses a WebGL2 context; provide a graceful non-WebGL fallback in the application shell when implementing the page, without altering the supplied component source.
- Timing/state must reflect the real quality-agent request lifecycle. Its 1.8-second intro is visual animation, not a simulated processing duration.
- Integration is deferred until the app scaffold is ready.


## FlipCard source received (2026-10-30)
- User supplied FlipCard.tsx and FlipCard.css.
- Supports controlled/uncontrolled flipping, drag gestures, tilt, glare, spring motion, keyboard activation, and reduced-motion behavior.
- Runtime dependency: motion (imports from motion/react).
- Intended role: show the Image Quality Agent's clarity score on the front and its evidence/reasons on the reverse. Populate both sides from the real quality-agent response; do not hard-code a score or fabricate reasons.
- FlipCard's visual width/height and flip behavior will be configured in the page layout; the component source should otherwise be preserved.
- Integration is deferred until the app scaffold is ready.


## PeekRating source received (2026-10-30)
- User supplied PeekRating.tsx and PeekRating.css.
- Supports controlled/uncontrolled ratings, star/heart/bolt shapes, hover preview labels, keyboard interaction, read-only and disabled modes, and reduced-motion behavior.
- Runtime dependencies: @hugeicons/react and @hugeicons/core-free-icons.
- Intended role: collect optional user experience feedback after displaying the analysis result. This is feedback about the app experience, not a verified diagnostic label and must not be used as ground-truth training data.
- Integration is deferred until the app scaffold is ready.


## BranchedMenu (excluded by user, 2026-10-30)
- User explicitly decided BranchedMenu will not be included in DermaGuard.
- Do not request, integrate, render, or install dependencies solely for BranchedMenu unless the user later changes this decision.
