'use client';

import { useEffect, useRef, useState, type CSSProperties, type ChangeEvent } from 'react';
import ElectricLogo from '@/components/react-bits/ElectricLogo';
import GlideSelect from '@/components/react-bits/GlideSelect';
import CallChip, { type CallChipStatus } from '@/components/react-bits/CallChip';
import FlipCard from '@/components/react-bits/FlipCard';
import PeekRating from '@/components/react-bits/PeekRating';
import JellyRadio from '@/components/react-bits/JellyRadio';
import ProcessingScreen from '@/components/ProcessingScreen';

type StoryStepId = 'quality' | 'diagnosis' | 'decision';
type LesionCode = 'NV' | 'MEL' | 'BKL' | 'BCC' | 'AKIEC' | 'VASC' | 'DF';
type QualityResult = {
  clarityScore: number;
  reasons: string[];
  retakeGuidance?: string;
};
type DiagnosisResult = {
  predictedClass: LesionCode;
  calibratedConfidence: number;
  classProbabilities: { code: LesionCode; probability: number }[];
  decision?: 'AUTO_TRIAGE' | 'REFER' | 'RE_IMAGE';
};

const LESION_CLASSES: { code: LesionCode; name: string }[] = [
  { code: 'NV', name: 'Melanocytic nevi' },
  { code: 'MEL', name: 'Melanoma' },
  { code: 'BKL', name: 'Benign keratosis-like lesions' },
  { code: 'BCC', name: 'Basal cell carcinoma' },
  { code: 'AKIEC', name: 'Actinic keratoses / intraepithelial carcinoma' },
  { code: 'VASC', name: 'Vascular lesions' },
  { code: 'DF', name: 'Dermatofibroma' }
];

const asUnitPercentage = (value: number) => Math.max(0, Math.min(100, value * 100));
const validUnitScore = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1;
const validClarityScore = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 100;

const STORY_STEPS: {
  id: StoryStepId;
  number: string;
  label: string;
  title: string;
  copy: string;
  detail: string;
  callout: string;
  visualLabel: string;
}[] = [
  {
    id: 'quality',
    number: '01',
    label: 'Image quality',
    title: 'Check the capture first.',
    copy: 'Blur, poor lighting, glare and obstruction can undermine what a classifier sees. The Image Quality Agent checks whether the original capture is suitable before classification begins.',
    detail: 'FOCUS · LIGHT · GLARE · OBSTRUCTION',
    callout: 'The original image is not enhanced or altered for classification.',
    visualLabel: 'QUALITY GATE'
  },
  {
    id: 'diagnosis',
    number: '02',
    label: 'Classification',
    title: 'Read across seven classes.',
    copy: 'Once the image passes the quality check, the Diagnosis Agent evaluates it across the seven HAM10000 lesion classes and returns the full class-score distribution—not only the top label.',
    detail: 'NV · MEL · BKL · BCC · AKIEC · VASC · DF',
    callout: 'One predicted class, alongside all seven class scores.',
    visualLabel: '7 LESION CLASSES'
  },
  {
    id: 'decision',
    number: '03',
    label: 'Next step',
    title: 'Keep the decision separate.',
    copy: 'A transparent decision layer combines the quality and classification outputs to determine the next action. A class prediction alone does not decide the route.',
    detail: 'AUTO-TRIAGE · REFER · RE-IMAGE',
    callout: 'The next step has its own rationale.',
    visualLabel: 'DECISION LAYER'
  }
];

const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const IMAGE_ACCEPT = SUPPORTED_IMAGE_TYPES.join(',');

const logoSrc = '/brand/dermaguard-shield.webp';

function makePetalStyle(index: number): CSSProperties {
  const left = (index * 43 + (index % 5) * 11) % 100;
  const drift = ((index * 17) % 22) - 11;
  const duration = 22 + ((index * 13) % 27);
  const delay = -((index * 7) % 46);
  const size = 4 + ((index * 5) % 7);
  const opacity = 0.22 + ((index * 7) % 18) / 100;
  return {
    '--petal-x': left + '%',
    '--petal-drift': drift + 'vw',
    '--petal-duration': duration + 's',
    '--petal-delay': delay + 's',
    '--petal-size': size + 'px',
    '--petal-alpha': opacity,
    '--petal-hue': 198 + ((index * 13) % 39)
  } as CSSProperties;
}

function makeCrystalStyle(index: number): CSSProperties {
  const left = (index * 37 + (index % 4) * 19) % 100;
  const drift = ((index * 23) % 27) - 13;
  const duration = 19 + ((index * 11) % 25);
  const delay = -((index * 9) % 43);
  const size = 3 + ((index * 5) % 7);
  const hue = 198 + ((index * 17) % 46);
  const opacity = 0.23 + ((index * 5) % 18) / 100;
  return {
    '--crystal-x': left + '%',
    '--crystal-drift': drift + 'vw',
    '--crystal-duration': duration + 's',
    '--crystal-delay': delay + 's',
    '--crystal-size': size + 'px',
    '--crystal-hue': hue,
    '--crystal-alpha': opacity
  } as CSSProperties;
}

function makeSparkStyle(index: number): CSSProperties {
  const left = (index * 31 + (index % 7) * 13) % 100;
  const top = (index * 19 + (index % 5) * 17) % 100;
  const size = 2 + ((index * 3) % 4);
  const duration = 3.8 + ((index * 7) % 52) / 10;
  const delay = -((index * 11) % 48) / 10;
  const sparkleBlues = [196, 204, 212, 220, 228, 236];
  const hue = sparkleBlues[index % sparkleBlues.length];
  return {
    '--spark-x': left + '%',
    '--spark-y': top + '%',
    '--spark-size': size + 'px',
    '--spark-duration': duration + 's',
    '--spark-delay': delay + 's',
    '--spark-hue': hue
  } as CSSProperties;
}

export default function HomePage() {
  const [logoDocked, setLogoDocked] = useState(false);
  const [workspaceVisible, setWorkspaceVisible] = useState(false);
  const [activeStoryStep, setActiveStoryStep] = useState<StoryStepId>('quality');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageStatus, setImageStatus] = useState<CallChipStatus>('idle');
  const [qualityResult, setQualityResult] = useState<QualityResult | null>(null);
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageFit, setImageFit] = useState('contain');
  const [notice, setNotice] = useState('');
  const [experienceRating, setExperienceRating] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const dockTimer = window.setTimeout(() => setLogoDocked(true), 1850);
    const revealTimer = window.setTimeout(() => setWorkspaceVisible(true), 2380);
    return () => {
      window.clearTimeout(dockTimer);
      window.clearTimeout(revealTimer);
    };
  }, []);

  useEffect(() => {
    const handleProcessingEvent = (event: Event) => {
      const detail = (event as CustomEvent<{ active?: boolean; stage?: string }>).detail;
      setIsProcessing(detail?.active === true);
      setProcessingStage(detail?.stage ?? '');
    };
    window.addEventListener('dermaguard:processing', handleProcessingEvent);
    return () => window.removeEventListener('dermaguard:processing', handleProcessingEvent);
  }, []);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      setIsProcessing(false);
      setProcessingStage('');
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  const openImagePicker = () => {
    const input = fileInputRef.current;
    if (!input) {
      setNotice('Image selection is unavailable. Refresh the page and try again.');
      return false;
    }
    input.value = '';
    input.click();
    return true;
  };

  useEffect(() => {
    // The inference client will dispatch these only after receiving real API responses.
    const handleQualityResult = (event: Event) => {
      const detail = (event as CustomEvent<unknown>).detail;
      if (!detail || typeof detail !== 'object') return;
      const data = detail as Record<string, unknown>;
      if (!validClarityScore(data.clarityScore)) return;
      const reasons = Array.isArray(data.reasons)
        ? data.reasons.filter((item): item is string => typeof item === 'string').slice(0, 8)
        : [];
      setQualityResult({
        clarityScore: data.clarityScore,
        reasons,
        retakeGuidance: typeof data.retakeGuidance === 'string' ? data.retakeGuidance : undefined
      });
    };

    const handleDiagnosisResult = (event: Event) => {
      const detail = (event as CustomEvent<unknown>).detail;
      if (!detail || typeof detail !== 'object') return;
      const data = detail as Record<string, unknown>;
      const validCodes = new Set(LESION_CLASSES.map(item => item.code));
      if (typeof data.predictedClass !== 'string' || !validCodes.has(data.predictedClass as LesionCode)) return;
      if (!validUnitScore(data.calibratedConfidence) || !Array.isArray(data.classProbabilities)) return;
      const classProbabilities = data.classProbabilities
        .filter((item): item is { code: LesionCode; probability: number } => {
          if (!item || typeof item !== 'object') return false;
          const entry = item as Record<string, unknown>;
          return typeof entry.code === 'string'
            && validCodes.has(entry.code as LesionCode)
            && validUnitScore(entry.probability);
        })
        .map(item => ({ code: item.code, probability: item.probability }))
        .sort((a, b) => b.probability - a.probability);
      if (classProbabilities.length !== 7) return;
      const decision = data.decision === 'AUTO_TRIAGE' || data.decision === 'REFER' || data.decision === 'RE_IMAGE'
        ? data.decision
        : undefined;
      setDiagnosisResult({
        predictedClass: data.predictedClass as LesionCode,
        calibratedConfidence: data.calibratedConfidence,
        classProbabilities,
        decision
      });
    };

    window.addEventListener('dermaguard:quality-result', handleQualityResult);
    window.addEventListener('dermaguard:diagnosis-result', handleDiagnosisResult);
    return () => {
      window.removeEventListener('dermaguard:quality-result', handleQualityResult);
      window.removeEventListener('dermaguard:diagnosis-result', handleDiagnosisResult);
    };
  }, []);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;

    if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
      setImageStatus('error');
      setNotice('Choose a JPEG, PNG, WebP or AVIF image.');
      input.value = '';
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setImageStatus('error');
      setNotice('This image is larger than 25 MB. Choose a smaller image.');
      input.value = '';
      return;
    }

    setQualityResult(null);
    setDiagnosisResult(null);
    setExperienceRating(0);
    setSelectedFile(file);
    setImageStatus('idle');
    setIsProcessing(false);
    setProcessingStage('');
    setNotice('');
    input.value = '';
  };

  const activeStoryDetails = STORY_STEPS.find(step => step.id === activeStoryStep) ?? STORY_STEPS[0];


  return (
    <main className={'dermaguard-app' + (workspaceVisible ? ' dermaguard-app--revealed' : '')}>
      <div className="petal-field" aria-hidden="true">
        {Array.from({ length: 28 }, (_, index) => <span className="blue-petal" style={makePetalStyle(index)} key={index} />)}
      </div>
      <div className="crystal-field" aria-hidden="true">
        {Array.from({ length: 96 }, (_, index) => <span className="blue-crystal" style={makeCrystalStyle(index)} key={index} />)}
      </div>
      <div className="sparkle-field" aria-hidden="true">
        {Array.from({ length: 32 }, (_, index) => <span className="ambient-sparkle" style={makeSparkStyle(index)} key={index} />)}
      </div>
      <div className="ambient-glow" aria-hidden="true" />

      <div className={'brand-lockup' + (logoDocked ? ' brand-lockup--docked' : ' brand-lockup--intro')}>
        <div className="brand-emblem">
          <img className="brand-base-mark" src={logoSrc} alt="" />
          {!logoDocked ? (
            <ElectricLogo
              src={logoSrc}
              color="#70D6B9"
              glowColor="#D7AD67"
              scale={0.82}
              intensity={1.18}
              glow={1.05}
              thickness={1.65}
              strands={5}
              bend={0.55}
              crackle={1.2}
              arcs={2}
              flicker={0.48}
              speed={1.8}
              interactive
              cursorIntensity={0.55}
              cursorRadius={90}
              className="electric-logo-instance"
            />
          ) : null}
        </div>
        <div className="brand-type">
          <span className="brand-wordmark">DermaGuard</span>
          <span className="brand-tagline">QUALITY BEFORE CLASSIFICATION</span>
        </div>
      </div>

      <div className={'workspace' + (workspaceVisible ? ' workspace--visible' : '')}>
        <header className="site-header">
          <div className="header-context">
            <span className="header-accent" aria-hidden="true" />
            <span>DERMATOLOGY · IMAGE REVIEW</span>
            <span className="header-divider" />
            <span className="header-muted">EVIDENCE-LED SCREENING</span>
          </div>
          <button type="button" className="header-link" onClick={openImagePicker}>Upload an image <span aria-hidden="true">↗</span></button>
        </header>

        <section className="quote-section" aria-label="Prevention quote">
          <blockquote>“An ounce of prevention is greater than a <span>pound of cure.</span>”</blockquote>
          <p className="quote-caption">— <strong>Benjamin Franklin</strong></p>
        </section>

        <section className="hero-section" aria-labelledby="entry-title">
          <div className="hero-copy">
            <p className="eyebrow"><span /> DERMAGUARD · SKIN IMAGE REVIEW</p>
            <h1 id="entry-title">
              Before a result,
              <span className="headline-blue"> check the image.</span>
            </h1>
            <p className="hero-description">
              A class label is only part of a useful first review. DermaGuard checks image quality first, evaluates accepted captures across seven lesion classes, then keeps the next-step decision separate.
            </p>
            <div className="hero-actions">
              <button type="button" className="primary-link" onClick={openImagePicker}>Add an image <span aria-hidden="true">↓</span></button>
              <span className="hero-note">QUALITY FIRST <i /> 7 LESION CLASSES <i /> 3 NEXT STEPS</span>
            </div>
          </div>
          <div className="hero-visual" aria-label="DermaGuard protective botanical shield emblem">
            <div className="hero-visual__artwork">
              <img src={logoSrc} alt="DermaGuard botanical shield emblem" />
            </div>
            <div className="hero-visual__caption">
              <span>QUALITY BEFORE CLASSIFICATION</span>
              <i />
              <span>ONE CLEAR NEXT STEP</span>
            </div>
          </div>
        </section>

        <section className="difference-section" id="difference" aria-labelledby="difference-title">
          <div className="difference-section__heading">
            <div>
              <p className="eyebrow"><span /> THE DERMAGUARD APPROACH</p>
              <h2 id="difference-title">A class label<br /><em>isn’t the whole picture.</em></h2>
            </div>
            <p>
              Blur, glare and uneven lighting can undermine what a model sees. DermaGuard separates image quality, lesion classification and the next-step decision instead of treating them as one score.
            </p>
          </div>
          <div className="difference-explorer">
            <div className="difference-explorer__story">
              <span className="method-label">EXPLORE THE THREE STEPS</span>
              <JellyRadio
                items={STORY_STEPS.map(step => ({ value: step.id, label: step.number + '  ' + step.label }))}
                value={activeStoryStep}
                onChange={value => setActiveStoryStep(value as StoryStepId)}
                chipColor="rgba(17, 31, 39, .92)"
                activeColor="#9ED8C1"
                textColor="#c1d6d1"
                activeTextColor="#10261f"
                size="md"
                gap={9}
                radius={999}
                swell={0.08}
                barge={4}
                ariaLabel="Explore the DermaGuard workflow"
              />
              <div className="difference-detail" aria-live="polite">
                <div className="difference-detail__meta">
                  <span>{activeStoryDetails.number} / 03</span>
                  <span>{activeStoryDetails.visualLabel}</span>
                </div>
                <h3>{activeStoryDetails.title}</h3>
                <p>{activeStoryDetails.copy}</p>
                <div className="difference-detail__terms">{activeStoryDetails.detail}</div>
                <p className="difference-detail__callout">{activeStoryDetails.callout}</p>
              </div>
            </div>
            <div className="difference-art" data-stage={activeStoryStep} aria-label={activeStoryDetails.visualLabel}>
              <div className="difference-art__orbit difference-art__orbit--outer"><span /></div>
              <div className="difference-art__orbit difference-art__orbit--middle"><span /></div>
              <div className="difference-art__orbit difference-art__orbit--inner"><span /></div>
              <div className="difference-art__core">
                <strong>{activeStoryDetails.number}</strong>
                <span>{activeStoryDetails.visualLabel}</span>
              </div>
              <div className="difference-art__axis difference-art__axis--top">INPUT</div>
              <div className="difference-art__axis difference-art__axis--bottom">EVIDENCE → ACTION</div>
            </div>
          </div>
        </section>

        <section className="review-section" id="image-review" aria-labelledby="review-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow"><span /> IMAGE REVIEW</p>
              <h2 id="review-title">Start with<br /><em>the original image.</em></h2>
            </div>
            <p className="section-intro">
              Add a dermoscopic image to see it in the review workspace.
            </p>
          </div>

          <div className="review-workspace">
            <div className="review-workspace__top">
              <div className="workspace-title">
                <span className="workspace-mark">DG</span>
                <div><strong>Image workspace</strong><span>Original capture</span></div>
              </div>
            </div>

            {selectedFile && previewUrl ? (
              <div className="selected-image">
                <div className="selected-image__top">
                  <div>
                    <span className="micro-label">SELECTED IMAGE</span>
                    <span className="selected-image__name">{selectedFile.name}</span>
                  </div>
                  <button
                    type="button"
                    className="clear-image"
                    onClick={() => {
                      setSelectedFile(null);
                      setQualityResult(null);
                      setDiagnosisResult(null);
                      setImageStatus('idle');
                      setIsProcessing(false);
                      setProcessingStage('');
                      setNotice('');
                    }}
                  >Remove <span aria-hidden="true">×</span></button>
                </div>
                <div className="selected-image__preview">
                  <img
                    src={previewUrl}
                    alt="Selected dermoscopic image preview"
                    style={{ objectFit: imageFit as 'contain' | 'cover' }}
                    onLoad={() => {
                      setImageStatus('done');
                    }}
                    onError={() => {
                      setImageStatus('error');
                      setNotice('This image could not be previewed. Choose another file.');
                    }}
                  />
                </div>
                <div className="selected-image__bottom">
                  <span>{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                  <GlideSelect
                    options={[
                      { value: 'contain', label: 'Fit image', tag: 'NO CROP' },
                      { value: 'cover', label: 'Fill frame', tag: 'CROP' }
                    ]}
                    value={imageFit}
                    onChange={setImageFit}
                    size="sm"
                    radius={9}
                    menuWidth={164}
                    accentColor="#a8c7ff"
                    surfaceColor="#101b32"
                    highlightColor="#20395e"
                    textColor="#eaf2ff"
                    ariaLabel="Image preview fit"
                  />
                </div>
              </div>
            ) : null}

            <div className="composer-wrap">
              <div className="upload-surface">
                <button type="button" className="upload-plus" onClick={openImagePicker} aria-label="Add a dermoscopic image">
                  <span aria-hidden="true">+</span>
                </button>
                <div className="upload-surface__copy">
                  <strong>{selectedFile ? 'Choose a different image' : 'Add a dermoscopic image'}</strong>
                  <span>JPEG · PNG · WebP · AVIF</span>
                </div>
                <span className="upload-surface__limit">MAX 25 MB</span>
              </div>
              <input ref={fileInputRef} className="visually-hidden-file-input" type="file" accept={IMAGE_ACCEPT}
                onChange={handleImageChange} tabIndex={-1} aria-hidden="true" aria-label="Choose a dermoscopic image" />
              {selectedFile && (imageStatus === 'done' || imageStatus === 'error') ? (
                <div className="local-file-state local-file-state--visible">
                  <CallChip
                    icon="file"
                    name="IMAGE"
                    argument={imageStatus === 'error' ? 'preview unavailable' : 'preview ready'}
                    status={imageStatus}
                    size={37}
                    radius={10}
                    color="#d8eee7"
                    surfaceColor="rgba(13, 31, 34, 0.9)"
                    progressColor="#70D6B9"
                    doneColor="#70D6B9"
                    errorColor="#E59B84"
                    onRetry={() => { void openImagePicker(); }}
                  />
                </div>
              ) : null}
              {notice ? <p className="workflow-notice" role="status">{notice}</p> : null}
            </div>

            {(qualityResult || diagnosisResult) ? (
            <div className="result-preview">
              <div className="result-preview__heading">
                <span className="micro-label">SCREENING RESULT</span>
                <span>DERMAGUARD</span>
              </div>

              <div className="result-preview__flip-grid">
                {qualityResult ? (
                <FlipCard
                  className="review-flip review-flip--quality"
                  width={390}
                  height={292}
                  radius={18}
                  background="linear-gradient(145deg, #08243a, #061522)"
                  color="#e1f4ff"
                  glare={false}
                  tilt={false}
                  draggable={false}
                  ariaLabel="Flip to view image clarity score and quality findings"
                  front={
                    <div className="review-flip__content">
                      <span className="review-flip__eyebrow">01 · IMAGE QUALITY</span>
                      <strong className="review-flip__percentage">
                        {qualityResult ? qualityResult.clarityScore.toFixed(1) + '%' : '—'}
                      </strong>
                      <span className="review-flip__title">Image clarity</span>
                      <small>FLIP TO SEE THE FINDINGS <span aria-hidden="true">↗</span></small>
                    </div>
                  }
                  back={
                    <div className="review-flip__content review-flip__content--back">
                      <span className="review-flip__eyebrow">IMAGE QUALITY · DETAILS</span>
                      <h3>What affected clarity?</h3>
                      {qualityResult?.reasons.length ? (
                        <ul className="review-flip__reasons">
                          {qualityResult.reasons.map((reason, index) => <li key={index}>{reason}</li>)}
                        </ul>
                      ) : (
                        <p>No quality notes were returned.</p>
                      )}
                      {qualityResult?.retakeGuidance ? <p className="review-flip__guidance">{qualityResult.retakeGuidance}</p> : null}
                      <small>IMAGE QUALITY SCORE · 0–100</small>
                    </div>
                  }
                />
                ) : null}

                {diagnosisResult ? (
                <FlipCard
                  className="review-flip review-flip--diagnosis"
                  width={390}
                  height={292}
                  radius={18}
                  background="linear-gradient(145deg, #07324a, #061522)"
                  color="#e1f4ff"
                  glare={false}
                  tilt={false}
                  draggable={false}
                  ariaLabel="Flip to view the seven lesion class probabilities"
                  front={
                    <div className="review-flip__content">
                      <span className="review-flip__eyebrow">02 · DIAGNOSIS MODEL</span>
                      <strong className="review-flip__prediction">
                        {diagnosisResult ? diagnosisResult.predictedClass : '—'}
                      </strong>
                      <span className="review-flip__title">
                        {diagnosisResult
                          ? LESION_CLASSES.find(item => item.code === diagnosisResult.predictedClass)?.name ?? 'Predicted class'
                          : 'Predicted lesion class'}
                      </span>
                      <div className="review-flip__confidence">
                        <span>CALIBRATED CONFIDENCE</span>
                        <strong>{diagnosisResult ? asUnitPercentage(diagnosisResult.calibratedConfidence).toFixed(1) + '%' : '—'}</strong>
                      </div>
                      <small>FLIP TO SEE ALL SEVEN CLASS SCORES <span aria-hidden="true">↗</span></small>
                    </div>
                  }
                  back={
                    <div className="review-flip__content review-flip__content--back">
                      <span className="review-flip__eyebrow">DIAGNOSIS · CLASS DISTRIBUTION</span>
                      <h3>Model class scores</h3>
                      <div className="review-flip__class-list">
                        {(diagnosisResult?.classProbabilities ?? LESION_CLASSES.map(lesion => ({ code: lesion.code, probability: null }))).map(item => {
                          const lesion = LESION_CLASSES.find(entry => entry.code === item.code);
                          const score = item.probability;
                          if (!lesion) return null;
                          return (
                            <div className="review-flip__class-row" key={lesion.code}>
                              <span><b>{lesion.code}</b> {lesion.name}</span>
                              <strong>{score === null ? '—' : asUnitPercentage(score).toFixed(1) + '%'}</strong>
                            </div>
                          );
                        })}
                      </div>
                      <small>SOFTMAX OUTPUT · NOT A STANDALONE DIAGNOSIS</small>
                    </div>
                  }
                />
                ) : null}
              </div>

              {diagnosisResult ? (
              <div className="result-preview__decision">
                <div>
                  <span className="review-flip__eyebrow">DECISION LAYER</span>
                  <strong>{diagnosisResult?.decision?.replace('_', '-') ?? '—'}</strong>
                </div>
                <p>The class prediction and next-step decision are separate outputs.</p>
              </div>
              ) : null}
              <div className="result-feedback">
                <span>WAS THIS REVIEW CLEAR?</span>
                <PeekRating
                  value={experienceRating}
                  onChange={setExperienceRating}
                  shape="star"
                  size={19}
                  count={5}
                  activeColor="#9ED8C1"
                  idleColor="#49635c"
                  tipColor="#15332b"
                  tipTextColor="#effaf4"
                  labels={['Not clear', 'Somewhat', 'Clear', 'Very clear', 'Excellent']}
                  ariaLabel="Rate the clarity of this review"
                />
              </div>
            </div>
            ) : null}

            
            <div className="review-footnote">
              <span className="footnote-star" aria-hidden="true">✳</span>
              <span>For research and educational use. This experience is not a medical diagnosis or a substitute for professional care.</span>
            </div>
          </div>
        </section>



        <footer className="site-footer">
          <span className="footer-brand">DermaGuard<span>®</span></span>
          <span>Quality first. Evidence before action.</span>
        </footer>


      </div>
      {isProcessing ? <ProcessingScreen stage={processingStage} /> : null}
    </main>
  );
}
