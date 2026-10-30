# DermaGuard Dataset Audit — 2026-10-30

## Archive inspected by user in Google Colab
- Archive: `Copy of health-training.zip`
- Drive path: `/content/drive/MyDrive/Copy of health-training.zip`
- Reported size: 2.01 GB
- ZIP directory listing: 7,765 files total
- Contents reported: 7,762 JPG files, 1 CSV, 1 Markdown file, 1 JSON manifest
- Training image path prefix: `Health/training/images/`
- Metadata path: `Health/training/metadata.csv`
- Metadata rows: 7,762
- Metadata columns: `image_id, lesion_id, dx, age, sex, localization`
- Missing values: age=43; all other columns=0
- Training class counts:
  - nv: 5,212
  - mel: 856
  - bkl: 848
  - bcc: 400
  - akiec: 249
  - vasc: 109
  - df: 88
- Sex: male=4,157; female=3,562; unknown=43
- No image/metadata ID join verification or image decode/corruption audit has been run yet.

## Manifest information reported by user
- Dataset pack: participant
- Source describes canonical Cyber/Health split, seed 42
- Manifest says training and eval partitions are included.
- Health training: 7,762 images; 2,152,291,942 bytes; metadata SHA256 `5d5bdff86628882203b8e250d9c5e4aa13839456a9da731aaf52724b1cf04355`
- Health eval: 1,942 images; 533,566,045 bytes; per-class counts: nv=1,302; mel=214; bkl=212; bcc=101; akiec=63; vasc=27; df=23.
- Manifest reports total Health images=9,704 and says image files match metadata.
- **Unresolved discrepancy:** the inspected ZIP contains only 7,762 JPGs, apparently all under the training path, and only the training metadata CSV. No eval images/metadata were found in the listed archive entries. The separate evaluation partition may be delivered separately or the ZIP may be an incomplete training-only export. Must inspect the manifest file and archive paths again before training/evaluation decisions. Do not claim access to eval images or evaluate on the manifest counts alone.

## Initial modelling implications
- Class imbalance is material: nv is about 67.15% of training rows; df is about 1.13%.
- Use class-aware evaluation (macro F1, balanced accuracy, per-class recall/sensitivity, confusion matrix) and consider class-weighted loss or balanced sampling based on training-only information.
- Avoid leakage from multiple images of the same lesion: any internal train/validation split must group by `lesion_id`.
- The manifest's canonical split should be respected if the separately packaged evaluation partition is available. Never move eval images into training.
- Age missingness is not relevant if the first image classifier uses images only; don't infer or impute metadata unless a justified tabular/multimodal experiment is approved.

## Next required audit
1. Verify ZIP paths, count images in each partition, join all archive image IDs to metadata IDs, and check duplicates/missing/unmatched IDs.
2. Decode a deterministic sample of images and report dimensions, modes and any corrupt samples.
3. Resolve whether eval data is in a separate organizer archive or release.
4. Only then build the extraction/data-loader pipeline and training split.
