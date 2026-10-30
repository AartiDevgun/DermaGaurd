# DermaGuard — Project Context

Last updated: 2026-10-30

## Project goal
Build a polished, public, browser-accessible hackathon website backed by a genuinely working two-agent skin-lesion image screening system. Visual quality and backend/model quality are both priorities. Do not substitute mock predictions for real inference.

## Product requirements
- Exactly two task agents, as specified by the challenge:
  1. Image Quality Agent: assess blur/sharpness, illumination/exposure, glare/reflections, obstruction and overall usability; return a score, per-check findings and reasons.
  2. Diagnosis Agent: classify an accepted dermoscopic image into the seven HAM10000 lesion classes and return per-class probabilities and a predicted class.
- A transparent decision layer combines both agents and returns the challenge's required outcomes: AUTO_TRIAGE, REFER or RE_IMAGE.
- The system is screening/decision support, not a replacement for a clinician.
- Frontend and backend must communicate over a real HTTPS API.
- The deployed website should be publicly accessible without visitors needing a Google login.
- Do not store patient images by default; process in memory and discard after inference unless the challenge contract requires otherwise.
- Evaluate beyond raw accuracy: macro F1, balanced accuracy, per-class precision/recall/sensitivity, confusion matrix, calibration and inference latency.
- Avoid data leakage. Keep the held-out validation split separate from training and tuning.

## User's development preferences
- Work one step at a time and tell the user exactly what is needed next.
- Build and test the backend/model before frontend integration.
- User supplies the React Bits components and decides where they are integrated. Do not choose additional React Bits components.
- Exact supplied React Bits list:
  - electric logo
  - flip card
  - branched menu
  - call chip
  - jelly radio
  - guide select
  - lattice loader
  - peek rating
  - light tunnel
  - refine frame
- Desired visual direction: aesthetic, ethereal, mesmerizing, human-designed, interactive, smooth scrolling; avoid generic blue buttons/panels and generic AI-sounding copy.
- User wants ongoing repository updates at meaningful milestones.
- Prefer free/open-source APIs and services; do not use paid AI inference APIs. Be transparent that free hosting and GPU compute are not unlimited or guaranteed.
- No frontend component integration until the user gives placement instructions.

## Frontend scaffold update (2026-10-30)
- Initial deployable Next.js App Router scaffold has been committed under `src/app`.
- Stack: Next.js 16.4.3, React 19.3.0, TypeScript 5.9+.
- First landing page is informational and does not yet contain a functioning upload or analysis request.
- Vercel project creation is the next deployment step after verifying the scaffold's build; do not present the landing page as the finished screening system.

## Repository and connected services
- GitHub repository: AartiDevgun/DermaGaurd
- Default branch: main
- Repository was initially almost empty (README only) when inspected on 2026-10-30.
- GitHub connection is available.
- Vercel connection is available. At last inspection, no Vercel project was linked to DermaGaurd; existing Vercel projects were linked to the separate sakura repository.
- Do not expose or commit credentials, API tokens, service account keys, .env files or private patient data.

## Proposed technical direction (not yet final)
- Model development: Python + PyTorch, with Google Colab and/or Kaggle notebooks for training/experiments.
- Image processing / quality checks: OpenCV plus validated quality metrics/rules.
- Explainability: Grad-CAM only as a model-attention visualisation, not proof of causal reasoning.
- API: FastAPI, with explicit request/response schemas and input validation.
- Website: Next.js/React, deployed on Vercel.
- Inference hosting: evaluate Google Cloud Run after benchmarking CPU inference and model memory. Cloud Run is pay-per-use with a free tier, not unlimited; billing setup may be required. Do not create services or enable billing without informing the user.
- No third-party generative AI or vision API is required for the core two-agent pipeline.
- Avoid adding a database until a concrete requirement exists.

## Data and API status
- User supplied a Google Drive link to a ZIP containing the training dataset. It has not yet been downloaded or inspected by the assistant.
- The Drive file must be accessible to anyone with the link (Viewer) or provided through another usable transfer method.
- Dataset archive contents, exact train/validation split, metadata and class mapping must be inspected before writing data loaders.
- Organisers' API documentation, endpoint, authentication method and exact request/response contract are still required.
- Any stated image counts/class assumptions must be verified against the challenge materials and archive.

## Current stage
Preparation only. No model has been trained, no inference API has been implemented, and no Vercel project has been created for this repository.

## Immediate next steps
1. Confirm access to the dataset ZIP and inspect its contents / labels / split.
2. Obtain the organisers' API documentation and submission contract.
3. Set up a reproducible training notebook and baseline data audit.
4. Train and compare baseline classifiers; choose using held-out metrics, not a promised accuracy target.
5. Implement and test the two agents and decision engine behind FastAPI.
6. Benchmark inference on CPU and determine deployment needs.
7. Connect the frontend to the real API, then integrate the user's supplied React Bits components at locations the user specifies.
8. Deploy and test the public site and inference service; document limits and operational behaviour.

## Working rule
After each meaningful milestone, update this file and the README with what changed, how to run/test it, and what remains. Never mark a feature complete unless it has been implemented and tested.


## Initial Vercel production deployment (2026-10-30)
- Vercel project: `dermaguard` (`prj_lXp4Rl34iZlVDUUhlVMCjMw1kAUZ`) under the user's Hobby team.
- Git source: `AartiDevgun/DermaGaurd`, branch `main`.
- Deployed commit: `0ebb825a186fe1a90477f20db3d38ecb045de980` (`feat(frontend): add initial Next.js landing scaffold`).
- Production deployment: `dpl_EnWzKYpCJsoU6JX7pQzsRkNM3TPT`; Vercel reports state `READY`.
- Public production domain: `https://dermaguard.vercel.app`.
- Protection: Vercel SSO is configured for Preview deployments only; password protection and Trusted IP restrictions are disabled. This keeps production accessible without a Vercel login while previews remain protected.
- Build: Next.js 16.4.3 optimized build, TypeScript validation and static prerender completed. npm audit reported 0 vulnerabilities.
- Build warnings recorded: Vercel/npm emitted a non-blocking unknown `cache-dir` environment-config warning, an npm install-scripts allowlist warning for `unrs-resolver`, and the broad Node engine range warning. The build nevertheless completed successfully.
- Scope: this is the informational landing screen only. Image selection, Agent 1, the diagnosis model/API and result rendering are not connected yet.
