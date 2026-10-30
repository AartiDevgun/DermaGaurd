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


## Pretrained architecture compatibility smoke test (reported by user, 2026-10-30)
All five torchvision pretrained architectures downloaded, constructed with a 7-class head and completed two FP16-autocast forward/backward optimizer steps on random tensors using batch size 8.
- EfficientNet-B0: 4.02M parameters; peak allocated GPU memory 0.42 GB; reported 2-step average 3.107 s.
- EfficientNet-B2: 7.71M; 0.62 GB; 0.514 s.
- ResNet50: 23.52M; 0.73 GB; 0.201 s.
- DenseNet121: 6.96M; 0.78 GB; 0.376 s.
- ConvNeXt-Tiny: 27.83M; 0.93 GB; 2.949 s.
- All five returned output shape [8,7] and passed.
- Interpretation: all architectures are technically compatible with this T4 and fit at batch size 8. The observed two-step timing is not a valid comparative benchmark (too few iterations, first-use/CUDA/cuDNN warmup effects and random inputs), so do not rank or select models from those timings.
- The official pretrained weights were obtained from PyTorch's public model-weight distribution; model downloads are cached in the Colab runtime and may need to be re-downloaded after a reset.
- Next: benchmark with real HAM10000 batches, intended batch size, warm-up iterations and sufficient timed iterations; then compare actual validation metrics during controlled fine-tuning.


## Real-image T4 architecture benchmark (reported by user, 2026-10-30)
Benchmark used an actual HAM10000 batch, batch size 32, FP16 autocast, warm-up and timed forward/backward/inference iterations.
- EfficientNet-B0: 4.02M parameters; training throughput 410.81 images/s; model-only inference throughput 1,578.36 images/s; peak allocated GPU memory 1.47 GB.
- EfficientNet-B2: 7.71M; 276.91 training images/s; 1,044.74 inference images/s; 2.13 GB.
- ResNet50: 23.52M; 262.46 training images/s; 826.72 inference images/s; 1.73 GB.
- DenseNet121: 6.96M; 217.11 training images/s; 679.89 inference images/s; 2.16 GB.
- ConvNeXt-Tiny: 27.83M; 217.68 training images/s; 682.15 inference images/s; 2.29 GB.
- All five completed the benchmark without OOM/errors.
- Interpret throughput as model-only performance on a resident batch, not end-to-end upload/API/browser latency. The run is useful for initial hardware feasibility, not an accuracy ranking.
- First-round training shortlist: EfficientNet-B0 (efficiency baseline), EfficientNet-B2 (capacity challenger), ResNet50 (different architecture challenger). DenseNet121 and ConvNeXt-Tiny deferred unless validation results justify reconsideration.
- No diagnosis model has been trained yet. Choose the final architecture based on validation macro F1, balanced accuracy, per-class sensitivity, calibration, model size and inference performance together.


## EfficientNet-B0 baseline training completed (reported by user, 2026-10-30)
- Trained for all 12 configured epochs on the fixed training subset (6,208 images) with the internal validation subset (1,554 images).
- GPU: Tesla T4; batch size 32; FP16 autocast; AdamW; square-root inverse-frequency class weights; label smoothing 0.03; cosine LR schedule.
- Best checkpoint was saved at epoch 12 by validation macro F1.
- Epoch metrics:
  - E1: train loss 1.3487; train acc 0.7088; val loss 1.0253; val acc 0.7773; macro F1 0.5713; balanced acc 0.5545.
  - E2: train loss 0.9853; train acc 0.7949; val loss 0.9714; val acc 0.7986; macro F1 0.6211; balanced acc 0.6104.
  - E3: train loss 0.8558; train acc 0.8328; val loss 0.9562; val acc 0.8102; macro F1 0.6613; balanced acc 0.6582.
  - E4: train loss 0.7744; train acc 0.8607; val loss 0.9314; val acc 0.8192; macro F1 0.6466; balanced acc 0.6179.
  - E5: train loss 0.7113; train acc 0.8821; val loss 0.9461; val acc 0.8192; macro F1 0.6632; balanced acc 0.6580.
  - E6: train loss 0.6569; train acc 0.8979; val loss 0.9580; val acc 0.8166; macro F1 0.6726; balanced acc 0.6815.
  - E7: train loss 0.6264; train acc 0.9117; val loss 0.9650; val acc 0.8172; macro F1 0.6618; balanced acc 0.6460.
  - E8: train loss 0.5875; train acc 0.9277; val loss 0.9453; val acc 0.8224; macro F1 0.6795; balanced acc 0.6603.
  - E9: train loss 0.5640; train acc 0.9352; val loss 0.9567; val acc 0.8166; macro F1 0.6782; balanced acc 0.6618.
  - E10: train loss 0.5456; train acc 0.9394; val loss 0.9551; val acc 0.8230; macro F1 0.6720; balanced acc 0.6535.
  - E11: train loss 0.5381; train acc 0.9449; val loss 0.9633; val acc 0.8192; macro F1 0.6744; balanced acc 0.6657.
  - E12: train loss 0.5263; train acc 0.9493; val loss 0.9525; val acc 0.8250; macro F1 0.6800; balanced acc 0.6559.
- Best internal validation macro F1: 0.6800 at epoch 12; validation accuracy 0.8250; balanced accuracy 0.6559.
- Interpretation: training accuracy rose to 0.9493 while validation macro F1 and validation loss plateaued/fluctuated. This suggests overfitting / a generalisation gap. Do not claim 82.5% accuracy alone is strong performance for an imbalanced seven-class task. Inspect per-class metrics and confusion matrix before deciding the next experiment.
- DataLoader worker cleanup warnings appeared with `num_workers=2` under Colab/Python 3.13. They were reported as ignored exceptions during worker shutdown; epochs continued and checkpoints were saved. Rebuild DataLoaders with `num_workers=0` for subsequent notebook runs.
- Final report generation failed after training because `torch.load(..., weights_only=True)` rejected a NumPy scalar embedded in the training-history object. This is a serialization safety/default behavior issue, not evidence that the training process failed. Best checkpoint file was written; its presence/size and loadability still need explicit verification.
- Safe recovery plan: only because this checkpoint was generated by the user's own notebook, load that known trusted checkpoint with `weights_only=False`, immediately extract and re-save only the model state_dict tensors (and history separately as CSV/JSON), verify the state-only file loads with `weights_only=True`, and generate the internal validation classification report. Never use `weights_only=False` for an untrusted checkpoint.
- No official evaluation images or labels have been used.


## EfficientNet-B0 baseline checkpoint recovered and per-class validation report generated (reported by user, 2026-10-30)
- Trusted checkpoint size: 46.44 MB; best epoch=12; best validation macro F1=0.6800235.
- Model-only tensor state extracted and re-saved to `/content/drive/MyDrive/DermaGuard/checkpoints/efficientnet_b0_model_state.pth`; reloaded successfully with `weights_only=True`.
- Fresh inference over all 1,554 internal validation images completed with `num_workers=0`.
- Metrics: accuracy=0.8250; macro F1=0.6800; balanced accuracy=0.6559; weighted F1=0.8196.
- Per-class precision / recall / F1 / support:
  - akiec: 0.6667 / 0.5000 / 0.5714 / 44
  - bcc: 0.6806 / 0.6533 / 0.6667 / 75
  - bkl: 0.6450 / 0.6973 / 0.6701 / 185
  - df: 0.7000 / 0.6364 / 0.6667 / 22
  - mel: 0.6333 / 0.4750 / 0.5429 / 160
  - nv: 0.8971 / 0.9340 / 0.9151 / 1,045
  - vasc: 0.7619 / 0.6957 / 0.7273 / 23
- Confusion matrix (rows=true, columns=predicted; class order akiec,bcc,bkl,df,mel,nv,vasc):
  - akiec: [22,4,5,1,8,4,0]
  - bcc: [2,49,6,3,2,12,1]
  - bkl: [8,6,129,0,11,31,0]
  - df: [1,1,2,14,0,4,0]
  - mel: [0,2,25,0,76,56,1]
  - nv: [0,10,33,1,22,976,3]
  - vasc: [0,0,0,1,1,5,16]
- Key error pattern: melanoma recall is 47.5% (76/160 correctly identified); 56 melanomas were predicted as nv and 25 as bkl. akiec recall is 50% (22/44). Class imbalance is reflected in the gap between accuracy (82.5%) and balanced accuracy (65.59%) / macro F1 (68.00%). The headline accuracy should not be presented without class-wise metrics.
- Rare-class supports are limited (df=22, vasc=23, akiec=44 in this validation split); those estimates have substantial sampling uncertainty.
- Training acc reached 94.93% while validation acc was 82.50%; validation loss plateaued/fluctuated. This supports concern about overfitting/generalisation gap.
- DataLoader multiprocessing cleanup warnings during initial 12-epoch run did not prevent completion. Use `num_workers=0` in future notebook loaders.
- Final validation report and predictions were saved to Google Drive by the user's notebook. Official evaluation set remains untouched.
- Next experiment: controlled comparison of EfficientNet-B2 and ResNet50 against the B0 baseline using the exact same split, 224x224 letterbox preprocessing and validation-only model selection. Simplify checkpoint format to model state dict + JSON/CSV metadata, keep checkpoint writes robust, and use num_workers=0. Do not tune against or run inference on the official eval set yet.


## EfficientNet-B2 baseline completed (2026-10-30)
- Training completed on Tesla T4 for 12 epochs with the same internal validation split; no official evaluation-set data was used.
- Best checkpoint: `/content/drive/MyDrive/DermaGuard/checkpoints/efficientnet_b2_best.pth`.
- Best validation macro F1: 0.7040 (epoch 12); validation accuracy 0.8224; balanced accuracy 0.6872.
- Final training accuracy: 0.9652; validation accuracy: 0.8224, a 14.28 percentage-point gap consistent with substantial overfitting.
- B2 classification report (class order akiec, bcc, bkl, df, mel, nv, vasc):
  * akiec: precision 0.7576, recall 0.5682, F1 0.6494, support 44
  * bcc: precision 0.7324, recall 0.6933, F1 0.7123, support 75
  * bkl: precision 0.6667, recall 0.7027, F1 0.6842, support 185
  * df: precision 0.6111, recall 0.5000, F1 0.5500, support 22
  * mel: precision 0.5417, recall 0.5687, F1 0.5549, support 160
  * nv: precision 0.9073, recall 0.9081, F1 0.9077, support 1045
  * vasc: precision 0.8696, recall 0.8696, F1 0.8696, support 23
- Comparison with the earlier EfficientNet-B0 internal-validation baseline:
  * Accuracy: B0 0.8250; B2 0.8224.
  * Macro F1: B0 0.6800; B2 0.7040.
  * Balanced accuracy: B0 0.6559; B2 0.6872.
  * Melanoma recall: B0 0.4750; B2 0.5687.
  * Melanoma F1: B0 0.5429; B2 0.5549.
- B2 is the stronger candidate on macro F1 and balanced accuracy, despite slightly lower overall accuracy. Melanoma recall improves by 9.37 percentage points, but remains only 56.87% (roughly 69 of 160 validation melanomas are still missed); this is not suitable for standalone diagnosis or ruling out melanoma.
- Other concerns: DF recall is 0.5000 on only 22 validation examples; VASC support is only 23. Small class supports make per-class estimates uncertain. B2's melanoma precision (0.5417) is also modest.
- Decision: retain B2 as the current leading candidate for further validation, not as a final clinical-ready model. Next work should investigate generalisation and calibration on internal data, error analysis and confidence thresholds; preserve the separate official evaluation set until model selection and tuning are frozen.
