# DermaGuard — Confirmed User Workflow

Last updated: 2026-10-30

This document records the user-approved interaction sequence. Do not change component choices or placements without the user's direction.

## 1. Image upload
- User selects a dermoscopic image using the user's supplied Guide Select / Glide Select React Bits component (exact component name to be confirmed from the component source).
- Use the Call Chip component to show upload progress.
- Security and reliability: do not accept arbitrary files as images. Allow only verified, supported raster image formats (initial candidates: JPEG, PNG, WebP), enforce size/dimension limits, inspect file signatures and successfully decode the image. Reject unsupported formats with a clear message.
- Preserve the original image bytes for diagnostic inference. Do not silently substitute an enhanced image.

## 2. Image Quality Agent
- Assess blur/sharpness, illumination/exposure, glare/reflections, obstruction and overall image usability.
- Use Lattice Loader and Light Tunnel as the user-specified visual treatment while quality analysis runs.
- Agent output: clarity score 0-100, per-dimension measurements/ratings, flags and human-readable reasons.
- Important: quality agent assesses quality; it must not hallucinate missing lesion details by attempting to remove blur, glare or obstruction. Optional display-only corrections must never replace the diagnostic original.

## 3. Quality result
- Use Flip Card: front shows clarity percentage; reverse shows reasons and actionable retake guidance.
- User's initial routing policy:
  - clarity < 40: RE_IMAGE and return to upload.
  - clarity >= 40: proceed to Diagnosis Agent.
- The 40-point threshold is a product proposal, not a clinically validated cutoff. Validate it against representative clear/degraded images and the challenge criteria before finalising. Consider hard-fail flags so one severe defect is not hidden by an average score.

## 4. Diagnosis Agent
- Receive the original image only after quality gate passes.
- Predict the seven HAM10000 classes and return all class scores sorted descending.
- Also return the top predicted class and calibrated confidence.
- Important distinction: a trained classifier learns patterns from the training set; it does not literally compare each upload against every training image. Similar-case retrieval by image embeddings can be explored as a separate, transparent supporting feature later, but must not be represented as the model's classification mechanism.
- Softmax output alone is not automatically a trustworthy clinical probability. Evaluate and calibrate confidence on held-out data.
- Result is screening/decision support, not a definitive diagnosis.

## 5. Feedback
- Use Peek Rating to request user feedback.
- Feedback can measure usability and perceived helpfulness. Do not use unverified user ratings as ground-truth diagnosis labels or automatically retrain the model from them.

## 6. Backend contract needed by frontend
Implement an HTTPS inference API that returns structured fields for:
- upload/request ID;
- accepted/rejected upload and validation details;
- quality score, per-dimension quality results, flags and explanations;
- quality decision (RE_IMAGE or CONTINUE);
- seven diagnosis class scores, sorted descending;
- predicted class and calibrated confidence;
- final decision required by the challenge (AUTO_TRIAGE / REFER / RE_IMAGE);
- model/version metadata and processing timings.

No mock inference responses in production. Process uploaded images in memory and discard them after inference by default; do not persist personal/medical images unless a concrete challenge requirement demands it.

## 7. Training approach
- User will manually run the notebook cells in Google Colab; assistant supplies and explains one cell at a time.
- First inspect the ZIP archive, its directory structure, metadata CSV and labels. Do not assume filenames, class mappings or split structure until inspected.
- Diagnosis model: benchmark pretrained PyTorch image classifiers, validate with leakage-safe splits, compare class-wise metrics, choose the model based on held-out performance and calibration, then export the best checkpoint.
- Quality agent: HAM10000 diagnosis labels do not automatically provide quality labels. Build initial quality assessment with measurable image-processing features and/or train on controlled synthetic degradations (blur, exposure changes, glare-like overlays, occlusion) plus any genuine quality-labelled samples available. Clearly document the limitations of synthetic quality data.
- Keep training and inference reproducible with saved configs, random seeds, checkpoints and evaluation reports.

## 8. Component ownership
Only use components supplied by the user:
- Electric Logo
- Flip Card
- Branched Menu
- Call Chip
- Jelly Radio
- Guide Select (user later said "Glide Select"; confirm exact component source)
- Lattice Loader
- Peek Rating
- Light Tunnel
- Refine Frame

The user decides additional placement/integration details. Do not choose or insert other React Bits components independently.
