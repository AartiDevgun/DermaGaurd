'use client';

import { useEffect, useRef, useState, type CSSProperties, type ChangeEvent, type FormEvent } from 'react';
import ElectricLogo from '@/components/react-bits/ElectricLogo';
import PromptBar from '@/components/react-bits/PromptBar';
import GlideSelect from '@/components/react-bits/GlideSelect';
import CallChip from '@/components/react-bits/CallChip';
import LatticeLoader from '@/components/react-bits/LatticeLoader';
import LightTunnel from '@/components/react-bits/LightTunnel';
import FlipCard from '@/components/react-bits/FlipCard';
import PeekRating from '@/components/react-bits/PeekRating';
import JellyRadio from '@/components/react-bits/JellyRadio';
import { Attachment01Icon } from '@hugeicons/core-free-icons';

type QualityResult = {
  clarityScore: number;
  reasons: string[];
  status: 'usable' | 'reimage';
};

type ChatMessage = { role: 'user' | 'assistant'; text: string };
type ReviewStage = 'quality' | 'classification' | 'triage';

const STAGE_DETAILS: Record<ReviewStage, { number: string; title: string; description: string; note: string; tag: string }> = {
  quality: {
    number: '01 / 03',
    title: 'Image quality, first.',
    description: 'The first agent checks focus, illumination, glare and obstruction. An image that does not meet the quality threshold should be captured again rather than pushed forward.',
    note: 'The original image remains unchanged for the classifier.',
    tag: 'IMAGE QUALITY AGENT'
  },
  classification: {
    number: '02 / 03',
    title: 'Evidence in the full distribution.',
    description: 'The diagnosis research agent evaluates the accepted image across all seven HAM10000 lesion classes. The interface is designed to show the complete score distribution, not only one label.',
    note: 'Model scores are research outputs, not a confirmed medical diagnosis.',
    tag: 'DIAGNOSIS AGENT'
  },
  triage: {
    number: '03 / 03',
    title: 'A cautious next step.',
    description: 'The decision layer combines image usability and classification evidence into one explainable route: AUTO_TRIAGE, REFER or RE_IMAGE.',
    note: 'This prototype is not a validated clinical pathway.',
    tag: 'DECISION LAYER'
  }
};

const logoSrc = '/brand/dg-mark.svg';

function makePetalStyle(index: number): CSSProperties {
  const left = (index * 43 + (index % 5) * 11) % 100;
  const drift = ((index * 17) % 22) - 11;
  const duration = 30 + ((index * 13) % 27);
  const delay = -((index * 7) % 46);
  const size = 4 + ((index * 3) % 5);
  const opacity = 0.11 + ((index * 3) % 10) / 100;
  return {
    '--petal-x': left + '%',
    '--petal-drift': drift + 'vw',
    '--petal-duration': duration + 's',
    '--petal-delay': delay + 's',
    '--petal-size': size + 'px',
    '--petal-alpha': opacity
  } as CSSProperties;
}

function makeCrystalStyle(index: number): CSSProperties {
  const left = (index * 37 + (index % 4) * 19) % 100;
  const drift = ((index * 23) % 27) - 13;
  const duration = 25 + ((index * 11) % 25);
  const delay = -((index * 9) % 43);
  const size = 3 + ((index * 3) % 4);
  const hue = 190 + ((index * 17) % 38);
  const opacity = 0.12 + ((index * 3) % 11) / 100;
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

function MoonAssistant() {
  const [open, setOpen] = useState(false);
  const [winking, setWinking] = useState(false);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      text: 'Hello. I’m Moon, your little guide to this research preview. Ask me how the image workspace is intended to work.'
    }
  ]);

  const sendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = draft.trim();
    if (!message) return;
    setMessages(current => [
      ...current,
      { role: 'user', text: message },
      {
        role: 'assistant',
        text: 'I’m a visual preview right now, not connected to an AI service. No message is sent to a model yet.'
      }
    ]);
    setDraft('');
    setWinking(true);
  };

  return (
    <aside className="moon-assistant" aria-label="DermaGuard assistant">
      {open ? (
        <div className="moon-panel">
          <div className="moon-panel__header">
            <div className="moon-panel__identity">
              <span className="moon-mini" aria-hidden="true">☾</span>
              <span><strong>Moon</strong><small>DermaGuard guide · preview</small></span>
            </div>
            <button type="button" className="moon-close" onClick={() => setOpen(false)} aria-label="Close assistant">×</button>
          </div>
          <div className="moon-messages" aria-live="polite">
            {messages.map((message, index) => (
              <div className={'moon-message moon-message--' + message.role} key={index}>{message.text}</div>
            ))}
          </div>
          <form className="moon-compose" onSubmit={sendMessage}>
            <input
              value={draft}
              onChange={event => setDraft(event.target.value)}
              placeholder="Ask about the preview..."
              aria-label="Message Moon"
            />
            <button type="submit" disabled={!draft.trim()} aria-label="Send message">↗</button>
          </form>
          <p className="moon-disclaimer">AI chat is not connected in this build.</p>
        </div>
      ) : null}
      <button
        className={'moon-launcher' + (winking ? ' moon-launcher--wink' : '')}
        type="button"
        onClick={() => {
          setOpen(value => !value);
          setWinking(value => !value);
        }}
        onMouseEnter={() => setWinking(true)}
        onMouseLeave={() => setWinking(false)}
        aria-label={open ? 'Close Moon assistant' : 'Open Moon assistant'}
        aria-expanded={open}
      >
        <span className="moon-halo" />
        <svg viewBox="0 0 88 88" role="img" aria-label="Smiling crescent moon">
          <defs>
            <linearGradient id="moon-gradient" x1="14%" y1="10%" x2="88%" y2="92%">
              <stop offset="0%" stopColor="#f0f8ff" />
              <stop offset="46%" stopColor="#b8d9ff" />
              <stop offset="100%" stopColor="#729bdf" />
            </linearGradient>
            <linearGradient id="moon-shadow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#d7eaff" stopOpacity=".1" />
              <stop offset="100%" stopColor="#547fbd" stopOpacity=".48" />
            </linearGradient>
          </defs>
          <path d="M60.8 10.8c-1.5 15.2 8.4 30 23 34.3-3.4 20.2-21.8 34.8-42.5 32.2C20.1 74.7 5.1 55 8.1 34 10.8 15.7 27.4 2.4 45.9 3.9c5.4.4 10.5 2.7 14.9 6.9Z" fill="url(#moon-gradient)" />
          <path d="M60.8 10.8c-1.5 15.2 8.4 30 23 34.3-3.4 20.2-21.8 34.8-42.5 32.2C20.1 74.7 5.1 55 8.1 34 10.8 15.7 27.4 2.4 45.9 3.9c5.4.4 10.5 2.7 14.9 6.9Z" fill="url(#moon-shadow)" />
          <path d="M24 36c2.4-3 5.1-3 7.6 0" fill="none" stroke="#25466f" strokeWidth="2.8" strokeLinecap="round" />
          <path d={winking ? 'M47 37c3.2 2.2 6 2.2 9.2 0' : 'M47 36c2.4-3 5.1-3 7.6 0'} fill="none" stroke="#25466f" strokeWidth="2.8" strokeLinecap="round" />
          <path d="M31 49c5.3 8.1 14.7 8.1 20 0" fill="none" stroke="#31547b" strokeWidth="2.7" strokeLinecap="round" />
          <circle cx="22" cy="47" r="3.5" fill="#f6a9c8" opacity=".58" />
          <circle cx="60" cy="47" r="3.5" fill="#f6a9c8" opacity=".58" />
          <path d="m70 15 2.2 4.6 4.8 2.1-4.8 2.2-2.2 4.7-2.1-4.7-4.8-2.2 4.8-2.1Z" fill="#e4f1ff" />
        </svg>
        <span className="moon-launcher__label">Need a little guidance?</span>
      </button>
    </aside>
  );
}

export default function HomePage() {
  const [logoDocked, setLogoDocked] = useState(false);
  const [logoSettled, setLogoSettled] = useState(false);
  const [workspaceVisible, setWorkspaceVisible] = useState(false);
  const [activeStage, setActiveStage] = useState<ReviewStage>('quality');
  const [previewRating, setPreviewRating] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageFit, setImageFit] = useState('contain');
  const [notice, setNotice] = useState('');
  const [savedPrompt, setSavedPrompt] = useState('');
  const [qualityResult] = useState<QualityResult | null>(null);
  const [qualityState] = useState<'idle' | 'running' | 'done' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachResolver = useRef<((value?: string) => void) | null>(null);

  useEffect(() => {
    const dockTimer = window.setTimeout(() => setLogoDocked(true), 1850);
    const revealTimer = window.setTimeout(() => setWorkspaceVisible(true), 2380);
    const settleFallbackTimer = window.setTimeout(() => setLogoSettled(true), 3300);
    return () => {
      window.clearTimeout(dockTimer);
      window.clearTimeout(revealTimer);
      window.clearTimeout(settleFallbackTimer);
    };
  }, []);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  const attachImage = () =>
    new Promise<string | void>((resolve) => {
      attachResolver.current = resolve;
      if (!fileInputRef.current) {
        attachResolver.current = null;
        resolve();
        return;
      }
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    });

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (!file) {
      attachResolver.current?.();
      attachResolver.current = null;
      return;
    }
    if (!file.type.startsWith('image/')) {
      setNotice('Please choose an image file.');
      attachResolver.current?.();
      attachResolver.current = null;
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setNotice('This image is larger than 25 MB. Choose a smaller image.');
      attachResolver.current?.();
      attachResolver.current = null;
      return;
    }
    setSelectedFile(file);
    setNotice('');
    attachResolver.current?.(file.name);
    attachResolver.current = null;
  };

  const handleSend = (text: string) => {
    setSavedPrompt(text);
    if (!selectedFile) {
      setNotice('Choose a dermoscopic image first. Nothing has been uploaded.');
      return;
    }
    setNotice('Your image is ready in this browser. The screening service is not connected yet, so no analysis has run.');
  };

  const isQualityRunning = qualityState === 'running';
  const activeStageDetails = STAGE_DETAILS[activeStage];

  return (
    <main className={'dermaguard-app' + (workspaceVisible ? ' dermaguard-app--revealed' : '')}>
      <div className="petal-field" aria-hidden="true">
        {Array.from({ length: 14 }, (_, index) => <span className="blue-petal" style={makePetalStyle(index)} key={index} />)}
      </div>
      <div className="crystal-field" aria-hidden="true">
        {Array.from({ length: 18 }, (_, index) => <span className="blue-crystal" style={makeCrystalStyle(index)} key={index} />)}
      </div>
      <div className="ambient-glow" aria-hidden="true" />

      <div className={'brand-lockup' + (logoDocked ? ' brand-lockup--docked' : ' brand-lockup--intro')}>
        <div
          className="brand-emblem"
          onTransitionEnd={event => {
            if (event.propertyName === 'width' && logoDocked) setLogoSettled(true);
          }}
        >
          {logoSettled ? (
            <img className="brand-static-mark" src={logoSrc} alt="" />
          ) : (
            <ElectricLogo
              src={logoSrc}
              color="#b9d6ff"
              glowColor="#668cff"
              scale={0.82}
              intensity={1.25}
              glow={1.2}
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
          )}
        </div>
        <div className="brand-type">
          <span className="brand-wordmark">DermaGuard</span>
          <span className="brand-tagline">A MORE THOUGHTFUL FIRST LOOK</span>
        </div>
      </div>

      <div className={'workspace' + (workspaceVisible ? ' workspace--visible' : '')}>
        <header className="site-header">
          <div className="header-context">
            <span className="header-orbit" aria-hidden="true"><i /></span>
            <span>DERMATOLOGY RESEARCH</span>
            <span className="header-divider" />
            <span className="header-muted">IMAGE REVIEW WORKSPACE</span>
          </div>
          <a className="header-link" href="#approach">Our approach <span aria-hidden="true">↗</span></a>
        </header>

        <section className="hero-section" aria-labelledby="entry-title">
          <div className="hero-copy">
            <p className="eyebrow"><span /> A MORE CONSIDERED FIRST LOOK</p>
            <h1 id="entry-title">
              See the image.
              <span>Understand</span>
              <span className="headline-blue">the next step.</span>
            </h1>
            <p className="hero-description">
              A thoughtful image-review experience, designed to put clarity first — before a result is ever considered.
            </p>
            <div className="hero-actions">
              <a className="primary-link" href="#image-review">Explore image review <span aria-hidden="true">↓</span></a>
              <span className="hero-note">RESEARCH PREVIEW <i /> NOT A DIAGNOSIS</span>
            </div>
          </div>

          <div className="hero-art" aria-label="Abstract illustration of an image viewed through a focused lens">
            <div className="art-orbit art-orbit--outer" />
            <div className="art-orbit art-orbit--middle" />
            <div className="art-orbit art-orbit--inner" />
            <div className="art-glow" />
            <div className="art-lens">
              <div className="lens-core">
                <span className="lens-cross lens-cross--horizontal" />
                <span className="lens-cross lens-cross--vertical" />
                <span className="lens-point lens-point--one" />
                <span className="lens-point lens-point--two" />
                <span className="lens-point lens-point--three" />
                <div className="lens-ring" />
              </div>
            </div>
            <div className="art-label art-label--top"><i /> FOCUS FIRST</div>
            <div className="art-label art-label--bottom">A CLEARER VIEW, BY DESIGN</div>
            <div className="art-index">01 <span>/ 03</span></div>
          </div>
        </section>

        <section className="quote-section" aria-label="DermaGuard philosophy">
          <p className="quote-overline">THE PRINCIPLE</p>
          <blockquote>“Good decisions begin with <span>good information.</span>”</blockquote>
          <p className="quote-caption">Clarity is not the conclusion. It is where a more careful process begins.</p>
        </section>

        <section className="method-section" aria-labelledby="method-title">
          <div className="method-heading">
            <div>
              <p className="eyebrow"><span /> THE REVIEW FRAMEWORK</p>
              <h2 id="method-title">Three layers.<br /><em>One careful view.</em></h2>
            </div>
            <p>Explore how each part of the planned multi-agent workflow contributes to a more explainable image review.</p>
          </div>

          <div className="method-shell">
            <div className="method-main">
              <div className="method-selector">
                <span className="method-label">EXPLORE A STAGE</span>
                <JellyRadio
                  items={[
                    { value: 'quality', label: 'Image quality' },
                    { value: 'classification', label: 'Classification' },
                    { value: 'triage', label: 'Next step' }
                  ]}
                  value={activeStage}
                  onChange={value => setActiveStage(value as ReviewStage)}
                  chipColor="rgba(28, 48, 76, .8)"
                  activeColor="#d6e8ff"
                  textColor="#b9cce5"
                  activeTextColor="#10213a"
                  size="sm"
                  gap={6}
                  radius={9}
                  swell={0.12}
                  barge={4}
                  ariaLabel="Review stage"
                />
              </div>

              <div className="method-copy" aria-live="polite">
                <span className="method-step-index">{activeStageDetails.number}</span>
                <h3>{activeStageDetails.title}</h3>
                <p>{activeStageDetails.description}</p>
                <p className="method-note">{activeStageDetails.note}</p>
                <span className="method-tag">{activeStageDetails.tag}</span>
              </div>

              <div className="method-visual">
                <div className="method-visual__tunnel">
                  <LightTunnel
                    cableColor="#9fc8ff"
                    pulseColor="#d6e8ff"
                    tunnelColor="#37669f"
                    tunnelOpacity={0.09}
                    speed={0.08}
                    pulseSpeed={1.2}
                    cableCount={34}
                    thickness={0.55}
                    glow={0.45}
                    brightness={0.7}
                    mouseInteraction={false}
                    clickSurge={false}
                    intro={false}
                    aria-hidden="true"
                  />
                </div>
                <div className="method-visual__content">
                  <span className="method-visual__eyebrow">AGENT SEQUENCE · VISUAL PREVIEW</span>
                  <LatticeLoader
                    label="Workflow architecture"
                    status="working"
                    pattern="orbit"
                    grid={3}
                    color="#c4ddff"
                    glow={false}
                    showTimer={false}
                    fontSize={10}
                    cellSize={8}
                  />
                  <span className="method-visual__foot">Illustrative animation only. No image analysis is running.</span>
                </div>
              </div>
            </div>

            <aside className="method-side">
              <div className="method-side__card">
                <span className="method-label">THE MODEL'S LABEL SET</span>
                <FlipCard
                  width={300}
                  height={208}
                  radius={18}
                  background="linear-gradient(145deg, rgba(20, 40, 68, .98), rgba(6, 17, 32, .98))"
                  color="#eef6ff"
                  front={
                    <div className="class-flip-front">
                      <span className="micro-label">HAM10000 RESEARCH CLASSES</span>
                      <strong>07</strong>
                      <span>lesion categories</span>
                      <small>Flip to explore the labels</small>
                    </div>
                  }
                  back={
                    <div className="class-flip-back">
                      <span className="micro-label">SEVEN CLASS LABELS</span>
                      <p><b>NV</b> · Melanocytic nevi</p>
                      <p><b>MEL</b> · Melanoma</p>
                      <p><b>BKL</b> · Benign keratosis-like</p>
                      <p><b>BCC</b> · Basal cell carcinoma</p>
                      <p><b>AKIEC</b> · Actinic keratoses</p>
                      <p><b>VASC</b> · Vascular lesions</p>
                      <p><b>DF</b> · Dermatofibroma</p>
                    </div>
                  }
                  ariaLabel="Flip to inspect the seven HAM10000 research classes"
                />
              </div>

              <div className="method-feedback">
                <span className="method-label">RATE THE INTERFACE</span>
                <PeekRating
                  shape="star"
                  size={22}
                  count={5}
                  activeColor="#b7d6ff"
                  idleColor="#526987"
                  tipColor="#142b48"
                  tipTextColor="#eef6ff"
                  labels={['Needs work', 'Fair', 'Good', 'Very good', 'Excellent']}
                  onChange={setPreviewRating}
                  ariaLabel="Rate the DermaGuard interface"
                />
                <span className="method-feedback__caption">
                  {previewRating ? 'Thanks — your interface rating is noted in this session.' : 'Product feedback only; not a clinical outcome.'}
                </span>
              </div>
            </aside>
          </div>
        </section>

        <section className="review-section" id="image-review" aria-labelledby="review-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow"><span /> THE IMAGE REVIEW</p>
              <h2 id="review-title">Start with what<br /><em>you can see.</em></h2>
            </div>
            <p className="section-intro">
              Add a dermoscopic image to prepare a local preview. The current research build does not send images to a server or run model inference.
            </p>
          </div>

          <div className="review-workspace">
            <div className="review-workspace__top">
              <div className="workspace-title">
                <span className="workspace-mark">DG</span>
                <div><strong>Image workspace</strong><span>Prepare an image for review</span></div>
              </div>
              <span className="local-badge"><i /> LOCAL PREVIEW</span>
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
                    onClick={() => { setSelectedFile(null); setNotice(''); }}
                  >Remove <span aria-hidden="true">×</span></button>
                </div>
                <div className="selected-image__preview">
                  <img src={previewUrl} alt="Selected dermoscopic image preview" style={{ objectFit: imageFit as 'contain' | 'cover' }} />
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
              <PromptBar
                placeholder="Add a dermoscopic image or leave a note..."
                sources={[{
                  key: 'image',
                  name: 'Image from device',
                  description: 'Choose a dermoscopic image',
                  icon: Attachment01Icon,
                  attach: true
                }]}
                commands={[]}
                models={[]}
                efforts={[]}
                width={760}
                background="rgba(8, 17, 34, 0.94)"
                color="#eef5ff"
                menuBackground="#111f39"
                sparkColor="#8db7ff"
                sparkBoost={1.05}
                radius={19}
                onAttach={attachImage}
                onSend={handleSend}
              />
              <input
                ref={fileInputRef}
                className="visually-hidden-file-input"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/avif"
                onChange={handleImageChange}
                tabIndex={-1}
                aria-hidden="true"
              />
              <div className="composer-meta">
                <span>PNG · JPG · WEBP · UP TO 25 MB</span>
                <span>Nothing is uploaded in this preview.</span>
              </div>
            </div>

            <div className="local-file-state">
              <CallChip
                name="IMAGE"
                argument={selectedFile ? 'ready in browser' : 'awaiting image'}
                status="idle"
                size={31}
                radius={9}
                color="#dceaff"
                surfaceColor="rgba(12, 27, 49, 0.9)"
                showTimer={false}
                progressColor="#83b5ff"
              />
            </div>

            {notice ? <p className="workflow-notice" role="status">{notice}</p> : null}
            {savedPrompt ? <p className="saved-prompt">NOTE <span>{savedPrompt}</span></p> : null}
            <div className="review-footnote">
              <span className="footnote-star" aria-hidden="true">✳</span>
              <span>For research and educational use. This experience is not a medical diagnosis or a substitute for professional care.</span>
            </div>
          </div>
        </section>

        <section className="approach-section" id="approach" aria-labelledby="approach-title">
          <div className="approach-heading">
            <p className="eyebrow"><span /> BUILT AROUND CLARITY</p>
            <h2 id="approach-title">A careful process.<br /><em>One step at a time.</em></h2>
          </div>
          <div className="approach-grid">
            <article className="approach-card">
              <span className="approach-number">01</span>
              <div className="approach-symbol approach-symbol--focus"><i /><i /><i /></div>
              <h3>Image quality</h3>
              <p>First, assess focus, lighting, glare and obstruction. An unclear image should not be treated as reliable input.</p>
              <span className="approach-tag">QUALITY REVIEW AGENT</span>
            </article>
            <article className="approach-card">
              <span className="approach-number">02</span>
              <div className="approach-symbol approach-symbol--signal"><i /><i /><i /><i /></div>
              <h3>Model research</h3>
              <p>Then, examine the image against the research model’s seven lesion categories, with the full score distribution visible.</p>
              <span className="approach-tag">CLASSIFICATION RESEARCH</span>
            </article>
            <article className="approach-card">
              <span className="approach-number">03</span>
              <div className="approach-symbol approach-symbol--path"><i /><i /><i /></div>
              <h3>Next-step guidance</h3>
              <p>Present a cautious outcome: review the image again, seek professional review, or inspect the research output.</p>
              <span className="approach-tag">DECISION SUPPORT</span>
            </article>
          </div>
          <p className="approach-note">Planned research workflow · Not a validated clinical pathway</p>
        </section>

        <footer className="site-footer">
          <span className="footer-brand">DermaGuard<span>®</span></span>
          <span>Research-led image review. Designed around clarity.</span>
          <span className="footer-disclaimer">NOT FOR CLINICAL DECISION-MAKING</span>
        </footer>

        {isQualityRunning ? (
          <section className="quality-processing" aria-label="Image quality assessment in progress">
            <div className="quality-processing__tunnel">
              <LightTunnel
                cableColor="#719cff"
                pulseColor="#bdd5ff"
                tunnelColor="#315ea8"
                tunnelOpacity={0.12}
                speed={0.16}
                pulseSpeed={1.6}
                cableCount={64}
                glow={1.1}
                brightness={1.05}
                intro
                mouseInteraction
                clickSurge={false}
              />
            </div>
            <div className="quality-processing__status">
              <LatticeLoader
                label="Assessing image quality"
                status="working"
                pattern="orbit"
                grid={3}
                color="#b7d3ff"
                glow
                glowColor="#8cafff"
                showTimer
              />
              <span className="processing-caption">Focus · illumination · glare · obstruction</span>
            </div>
          </section>
        ) : null}

        {qualityResult ? (
          <section className="quality-result">
            <div className="quality-result__card">
              <FlipCard
                width={320}
                height={230}
                radius={22}
                background="rgba(9, 19, 37, 0.96)"
                color="#f4f8ff"
                front={
                  <div className="clarity-front">
                    <span className="micro-label">IMAGE CLARITY</span>
                    <strong>{qualityResult.clarityScore}<small>%</small></strong>
                    <span>Tap to inspect the findings</span>
                  </div>
                }
                back={
                  <div className="clarity-back">
                    <span className="micro-label">QUALITY FINDINGS</span>
                    {qualityResult.reasons.map(reason => <p key={reason}>{reason}</p>)}
                  </div>
                }
                ariaLabel="Image clarity score and quality findings"
              />
              <div className="quality-result__feedback">
                <span className="micro-label">WAS THIS REVIEW CLEAR?</span>
                <PeekRating
                  shape="star"
                  size={24}
                  activeColor="#a9caff"
                  idleColor="#43546f"
                  tipColor="#152943"
                  tipTextColor="#f3f8ff"
                />
              </div>
            </div>
          </section>
        ) : null}
      </div>
      {workspaceVisible ? <MoonAssistant /> : null}
    </main>
  );
}
