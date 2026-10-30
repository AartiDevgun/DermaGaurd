# DermaGuard — Model Development Log

Last updated: 2026-10-30

## Hardware
- Colab Python 3.13.18
- PyTorch 2.11.0+cu130
- Torchvision 0.26.0+cu130
- NumPy 2.1.3
- NVIDIA Tesla T4, reported 14.56 GB VRAM
- CUDA matrix multiplication and FP16 autocast smoke tests passed.

## Dataset state
- Training partition: 7,762 images.
- Frozen internal development split: 6,208 train / 1,554 validation.
- Grouped by lesion_id; zero lesion overlap.
- Official evaluation partition: 1,942 labelled images; zero lesion overlap with training partition. Keep sealed until final frozen-model evaluation.
- All image IDs, metadata IDs and internal split IDs matched exactly.
- 50 randomly sampled source images decoded successfully; full decode audit not yet run.
- Training images extracted to Colab local path `/content/dermaguard_data/training/images`.
- Metadata at `/content/dermaguard_data/training/metadata.csv`.
- Frozen split at `/content/drive/MyDrive/DermaGuard/internal_split.csv`.

## Data pipeline smoke test
- Class mapping: akiec=0, bcc=1, bkl=2, df=3, mel=4, nv=5, vasc=6.
- Dataset sizes reported correctly: 6,208 train and 1,554 validation.
- Batch shape: [32, 3, 224, 224].
- Label batch shape: [32].
- CPU tensors successfully transferred to CUDA.
- The DataLoader returning CPU tensors is expected; transfer to cuda:0 succeeded.
- No model training has started yet.

## Important preprocessing refinement before training
The first pipeline smoke test used `Resize((224, 224))`, which stretches the source images (reported source dimensions 600x450) into a square. Before any model training, replace this with aspect-ratio-preserving resize plus padding/letterboxing to a square input. Ensure the exact same deterministic resize/pad and ImageNet normalisation are used at validation and inference. Training-only augmentation must be mild and must not alter diagnostic colour/structure aggressively.

## Candidate model benchmark (not yet run)
- EfficientNet-B0
- EfficientNet-B2
- ResNet50
- ConvNeXt-Tiny
- DenseNet121

Use ImageNet pretrained weights as initialisation if download/terms permit. Pretrained public weights are model assets, not a paid AI inference API. Test library compatibility, parameter/memory requirements and actual validation performance on the fixed internal split. Start with a short controlled benchmark; then train the strongest candidate(s) more thoroughly. Never choose solely from ImageNet reputation or speed.

## Imbalance and evaluation
- Strong class imbalance: nv is dominant; df and vasc are rare.
- Compare macro F1, balanced accuracy, per-class recall/sensitivity, confusion matrix and calibration. Report support per class.
- Consider class-weighted loss / balanced sampling, but avoid overcorrecting; decide based on validation results.
- Use validation for model selection and calibration, not the official evaluation archive.
- Do not interpret softmax maximum as calibrated confidence without calibration analysis.

## Not yet implemented
- Diagnosis model training / trained weights.
- Image Quality Agent.
- Combined triage decision engine.
- Grad-CAM / model-attention visualisation.
- FastAPI inference service.
- Frontend/API integration.
- Public deployment.

## Next steps
1. Upgrade the input pipeline to aspect-ratio-preserving resize/pad and confirm sample batches.
2. Benchmark and download compatible pretrained architectures.
3. Run controlled short training experiments on train split; monitor validation macro F1 / balanced accuracy and per-class recall.
4. Select candidate, train with best validation checkpoint and calibrate using validation only.
5. Freeze model and decision policy, then run official evaluation once.


## Aspect-ratio-preserving preprocessing smoke test passed (reported by user, 2026-10-30)
- Replaced direct square stretch resize with aspect-ratio-preserving resize and centered padding (letterboxing) to 224x224.
- Training-only augmentations: horizontal/vertical flips, mild rotation and mild brightness/contrast jitter.
- Validation: deterministic resize/pad, tensor conversion and ImageNet normalization only.
- Smoke test passed: image batch [32, 3, 224, 224], label batch [32], CUDA device `cuda:0`.
- Dataset lengths: train=6,208; validation=1,554.
- Class mapping confirmed: akiec=0, bcc=1, bkl=2, df=3, mel=4, nv=5, vasc=6.
- Important: keep the exact same resize/pad and normalization in inference preprocessing. Preserve the original image for all diagnostic inference.
- Next: inspect torchvision pretrained architecture compatibility and benchmark model parameter count, GPU memory and inference latency before selecting training candidates.
