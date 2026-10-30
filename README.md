# DermaGuard

A two-stage dermoscopic image screening and triage research project.

## Current status

The repository now contains the initial Next.js frontend foundation and a first responsive landing screen. The supplied React Bits components and the live analysis workflow are being integrated incrementally. No mock diagnosis is presented as a real model result.

## Product flow

1. **Image Quality Agent** — assesses blur, illumination, glare/reflections, obstruction and overall usability.
2. **Decision layer** — routes to re-image, review or diagnosis according to explicit project rules.
3. **Diagnosis Agent** — evaluates accepted original images across the seven HAM10000 lesion classes.

DermaGuard is intended as screening support, not a definitive diagnosis or a replacement for a qualified healthcare professional.

## Frontend

- Next.js 16.4.3, React 19.3, TypeScript
- CSS-based responsive visual system: near-black, electric blue, indigo and violet
- Reduced-motion support and a subtle falling-shard background
- User-supplied React Bits components are tracked in `docs/FRONTEND_COMPONENTS.md`

## Development

Requires Node.js 20.9 or newer.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

Before deployment, run:

```bash
npm run lint
npm run typecheck
npm run build
```

## Project notes

- `docs/PROJECT_CONTEXT.md`
- `docs/USER_WORKFLOW.md`
- `docs/DATASET_AUDIT.md`
- `docs/MODEL_DEVELOPMENT.md`
- `docs/FRONTEND_COMPONENTS.md`
