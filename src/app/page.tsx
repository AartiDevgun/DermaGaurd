'use client';

import { useEffect, useRef, useState, type CSSProperties, type ChangeEvent } from 'react';
import ElectricLogo from '@/components/react-bits/ElectricLogo';
import PromptBar from '@/components/react-bits/PromptBar';
import GlideSelect from '@/components/react-bits/GlideSelect';
import CallChip from '@/components/react-bits/CallChip';
import LatticeLoader from '@/components/react-bits/LatticeLoader';
import LightTunnel from '@/components/react-bits/LightTunnel';
import FlipCard from '@/components/react-bits/FlipCard';
import PeekRating from '@/components/react-bits/PeekRating';
import { Attachment01Icon } from '@hugeicons/core-free-icons';

type QualityResult = {
  clarityScore: number;
  reasons: string[];
  status: 'usable' | 'reimage';
};

const logoSrc = '/brand/dg-mark.svg';

function makeShardStyle(index: number): CSSProperties {
  const hue = 210 + ((index * 17) % 76);
  const left = (index * 47 + (index % 7) * 13) % 100;
  const drift = ((index * 19) % 31) - 15;
  const duration = 13 + ((index * 11) % 19);
  const delay = -((index * 7) % 29);
  const size = 3 + ((index * 13) % 9);
  const opacity = 0.24 + ((index * 7) % 42) / 100;
  return {
    '--shard-x': left + '%',
    '--shard-drift': drift + 'vw',
    '--shard-duration': duration + 's',
    '--shard-delay': delay + 's',
    '--shard-size': size + 'px',
    '--shard-hue': hue,
    '--shard-opacity': opacity
  } as CSSProperties;
}

export default function HomePage() {
  const [logoDocked, setLogoDocked] = useState(false);
  const [workspaceVisible, setWorkspaceVisible] = useState(false);
  const [logoReady, setLogoReady] = useState(false);
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
    const revealTimer = window.setTimeout(() => setWorkspaceVisible(true), 2250);
    return () => {
      window.clearTimeout(dockTimer);
      window.clearTimeout(revealTimer);
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
      setNotice('Add an image first to prepare a screening request.');
      return;
    }
    setNotice('Image selected. The screening service is not connected yet.');
  };

  const isQualityRunning = qualityState === 'running';

  return (
    <main className="dermaguard-app">
      <div className={'shard-field' + (isQualityRunning ? ' shard-field--suspended' : '')} aria-hidden="true">
        {Array.from({ length: 84 }, (_, index) => (
          <span className="shard" style={makeShardStyle(index)} key={index} />
        ))}
      </div>

      <div className={'ambient-glow' + (isQualityRunning ? ' ambient-glow--suspended' : '')} aria-hidden="true" />

      <div className={'brand-lockup' + (logoDocked ? ' brand-lockup--docked' : ' brand-lockup--intro')}>
        <div className="brand-emblem">
          {!logoReady ? <img className="brand-fallback" src={logoSrc} alt="" /> : null}
          <ElectricLogo
            src={logoSrc}
            color="#a8b9ff"
            glowColor="#8a5cff"
            scale={0.82}
            intensity={1.2}
            glow={1.1}
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
            onRender={() => setLogoReady(true)}
            className="electric-logo-instance"
          />
        </div>
        <div className="brand-type">
          <span className="brand-wordmark">DermaGuard</span>
          <span className="brand-tagline">EARLY DETECTION. BETTER OUTCOMES.</span>
        </div>
      </div>

      <div className={'workspace' + (workspaceVisible ? ' workspace--visible' : '')}>
        <header className="workspace-header">
          <span className="header-index"><i /> IMAGE REVIEW</span>
          <span className="header-rule" />
          <span className="header-state">PRIVATE SESSION</span>
        </header>

        <section className="entry-stage" aria-labelledby="entry-title">
          <div className="entry-copy">
            <p className="entry-kicker">A MORE CONSIDERED FIRST LOOK</p>
            <h1 id="entry-title">Look closer<span>.</span></h1>
            <p className="entry-subtitle">Start with an image.</p>
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
                    setNotice('');
                  }}
                >
                  Remove <span aria-hidden="true">×</span>
                </button>
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
                  accentColor="#b7a7ff"
                  surfaceColor="#19172c"
                  highlightColor="#35305b"
                  textColor="#eae7ff"
                  ariaLabel="Image preview fit"
                />
              </div>
            </div>
          ) : null}

          <div className="composer-wrap">
            <PromptBar
              placeholder="Add an image or leave a note..."
              sources={[
                {
                  key: 'image',
                  name: 'Image from device',
                  description: 'Choose a dermoscopic image',
                  icon: Attachment01Icon,
                  attach: true
                }
              ]}
              commands={[]}
              models={[]}
              efforts={[]}
              width={760}
              background="rgba(13, 13, 26, 0.92)"
              color="#f0edff"
              menuBackground="#171628"
              sparkColor="#9877ff"
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
              <span>PNG · JPG · WEBP · up to 25 MB</span>
              <span>Images stay in this browser until screening is connected.</span>
            </div>
          </div>

          {selectedFile ? (
            <div className="local-file-state">
              <CallChip
                name="IMAGE"
                argument="ready in browser"
                status="idle"
                size={31}
                radius={9}
                color="#d9d2ff"
                surfaceColor="rgba(24, 22, 43, 0.9)"
                showTimer={false}
                progressColor="#8f74ff"
              />
            </div>
          ) : null}

          {notice ? <p className="workflow-notice" role="status">{notice}</p> : null}
          {savedPrompt ? <p className="saved-prompt">NOTE <span>{savedPrompt}</span></p> : null}
        </section>

        {isQualityRunning ? (
          <section className="quality-processing" aria-label="Image quality assessment in progress">
            <div className="quality-processing__tunnel">
              <LightTunnel
                cableColor="#637dff"
                pulseColor="#b79aff"
                tunnelColor="#4c38a2"
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
                color="#b7a7ff"
                glow
                glowColor="#8c68ff"
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
                background="rgba(17, 16, 36, 0.96)"
                color="#f4f0ff"
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
                  activeColor="#b99aff"
                  idleColor="#48445f"
                  tipColor="#1c1933"
                  tipTextColor="#f3efff"
                />
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
