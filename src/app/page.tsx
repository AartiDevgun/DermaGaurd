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
import ProcessingScreen from '@/components/ProcessingScreen';

type ChatMessage = { role: 'user' | 'assistant'; text: string };
type AgentId = 'quality' | 'diagnosis' | 'lesion' | 'context' | 'safety' | 'coordinator';

type AgentSpec = {
  id: AgentId;
  code: string;
  short: string;
  name: string;
  description: string;
  outputs: string[];
  guardrail: string;
};

const AGENTS: AgentSpec[] = [
  {
    id: 'quality',
    code: 'A1',
    short: 'Quality',
    name: 'Image Quality Agent',
    description: 'Assesses blur, focus, illumination, glare, reflections and obstruction before the rest of the evidence is interpreted.',
    outputs: ['quality_status: PASS / FAIL', 'quality_score: 0–100', 'reasons[]', 'reliability_flags[]'],
    guardrail: 'The original image is never enhanced or altered for classifier input.'
  },
  {
    id: 'diagnosis',
    code: 'A2',
    short: 'Diagnosis',
    name: 'Diagnosis Agent',
    description: 'Classifies the original image into the seven HAM10000 lesion classes and returns the full class-score distribution.',
    outputs: ['prediction: NV / MEL / BKL / BCC / AKIEC / VASC / DF', 'class_probabilities: all 7 classes', 'top_class_score', 'model_reliability_flags[]'],
    guardrail: 'Every image receives a predicted class, including images whose final triage action is RE_IMAGE or REFER.'
  },
  {
    id: 'lesion',
    code: 'A3',
    short: 'Lesion',
    name: 'Lesion Analysis Agent',
    description: 'Examines visible morphology for asymmetry, border irregularity and color variation, then records the visual evidence supporting its assessment.',
    outputs: ['feature_evidence[]', 'suspicion_score', 'reliability_flags[]', 'observed / not-observed / unclear per cue'],
    guardrail: 'It must mark a cue unclear when image quality does not support a reliable visual judgement.'
  },
  {
    id: 'context',
    code: 'A4',
    short: 'Context',
    name: 'Reasoning / Context Agent',
    description: 'Uses supplied age, gender and lesion location only when available and relevant; missing fields remain explicitly missing.',
    outputs: ['context_evidence[]', 'risk_indicator', 'missing_field_flags[]', 'context_reliability'],
    guardrail: 'No demographic or location value is inferred, defaulted or fabricated.'
  },
  {
    id: 'safety',
    code: 'A5',
    short: 'Safety',
    name: 'Safety Agent',
    description: 'Checks image quality, diagnosis, lesion evidence and context for contradictions, weak evidence and unsafe automatic decisions.',
    outputs: ['safety_flag', 'veto: true / false', 'trigger[]', 'justification'],
    guardrail: 'A safety veto prevents AUTO_TRIAGE and must carry a traceable reason.'
  },
  {
    id: 'coordinator',
    code: 'A6',
    short: 'Coordinator',
    name: 'Coordinator Agent',
    description: 'Receives the five upstream outputs and applies the documented decision policy to create one final, auditable response.',
    outputs: ['prediction: one of 7 class codes', 'decision: AUTO_TRIAGE / REFER / RE_IMAGE', 'traceable_rationale', 'agent_agreement / disagreement'],
    guardrail: 'The final response always contains both a class prediction and a triage decision.'
  }
];

const logoSrc = '/brand/dg-mark.svg';

function makePetalStyle(index: number): CSSProperties {
  const left = (index * 43 + (index % 5) * 11) % 100;
  const drift = ((index * 17) % 22) - 11;
  const duration = 30 + ((index * 13) % 27);
  const delay = -((index * 7) % 46);
  const size = 4 + ((index * 5) % 5);
  const opacity = 0.12 + ((index * 7) % 13) / 100;
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
  const size = 3 + ((index * 5) % 5);
  const hue = 190 + ((index * 17) % 48);
  const opacity = 0.13 + ((index * 5) % 15) / 100;
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
  const hue = index % 4 === 0 ? 43 : index % 3 === 0 ? 160 : 205;
  return {
    '--spark-x': left + '%',
    '--spark-y': top + '%',
    '--spark-size': size + 'px',
    '--spark-duration': duration + 's',
    '--spark-delay': delay + 's',
    '--spark-hue': hue
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
  const [activeAgent, setActiveAgent] = useState<AgentId>('quality');
  const [previewRating, setPreviewRating] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageFit, setImageFit] = useState('contain');
  const [notice, setNotice] = useState('');
  const [savedPrompt, setSavedPrompt] = useState('');
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
    setNotice('Your image is ready in this browser. The six-agent API is not connected yet, so no analysis has run and no result has been fabricated.');
  };

  const activeAgentDetails = AGENTS.find(agent => agent.id === activeAgent) ?? AGENTS[0];

  const downloadCsvHeaderTemplate = () => {
    const blob = new Blob(['image_id,prediction,decision' + String.fromCharCode(10)], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dermaguard-submission-header.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <main className={'dermaguard-app' + (workspaceVisible ? ' dermaguard-app--revealed' : '')}>
      <div className="petal-field" aria-hidden="true">
        {Array.from({ length: 42 }, (_, index) => <span className="blue-petal" style={makePetalStyle(index)} key={index} />)}
      </div>
      <div className="crystal-field" aria-hidden="true">
        {Array.from({ length: 22 }, (_, index) => <span className="blue-crystal" style={makeCrystalStyle(index)} key={index} />)}
      </div>
      <div className="sparkle-field" aria-hidden="true">
        {Array.from({ length: 32 }, (_, index) => <span className="ambient-sparkle" style={makeSparkStyle(index)} key={index} />)}
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
            <span className="header-accent" aria-hidden="true" />
            <span>TRACK 2 · HEALTHCARE</span>
            <span className="header-divider" />
            <span className="header-muted">SIX-AGENT SCREENING</span>
          </div>
          <a className="header-link" href="#agent-system">Six-agent system <span aria-hidden="true">↗</span></a>
        </header>

        <section className="hero-section" aria-labelledby="entry-title">
          <div className="hero-copy">
            <p className="eyebrow"><span /> AGENTIC DERMA GUARD · LEVEL 2</p>
            <h1 id="entry-title">
              One image.
              <span>Six agents.</span>
              <span className="headline-blue">One reasoned decision.</span>
            </h1>
            <p className="hero-description">
              DermaGuard brings image quality, classification, lesion features, patient context and safety checks into one traceable screening decision.
            </p>
            <div className="hero-actions">
              <a className="primary-link" href="#agent-system">Explore the six agents <span aria-hidden="true">↓</span></a>
              <span className="hero-note">7 LESION CLASSES <i /> 3 TRIAGE ACTIONS</span>
            </div>
          </div>

          <div className="hero-visual" aria-label="DermaGuard protective botanical shield emblem">
            <div className="hero-visual__artwork">
              <img src={logoSrc} alt="DermaGuard emblem showing a face protected by a botanical shield" />
            </div>
            <div className="hero-visual__caption">
              <span>IMAGE-LED RESEARCH</span>
              <i />
              <span>EXPLAINABLE TRIAGE</span>
            </div>
            <p className="hero-visual__note">A coordinated review, from image quality to final disposition.</p>
          </div>
        </section>

        <section className="quote-section" aria-label="DermaGuard philosophy">
          <p className="quote-overline">THE DECISION PRINCIPLE</p>
          <blockquote>“A predicted class is only one part of <span>a safe next step.</span>”</blockquote>
          <p className="quote-caption">Every image must leave the system with both a seven-class prediction and a documented triage action.</p>
        </section>

        <section className="agent-system" id="agent-system" aria-labelledby="agent-system-title">
          <div className="agent-system__heading">
            <div>
              <p className="eyebrow"><span /> TRACK 2 · SIX-AGENT ARCHITECTURE</p>
              <h2 id="agent-system-title">Six specialised roles.<br /><em>One traceable outcome.</em></h2>
            </div>
            <p>Agents contribute distinct evidence. The coordinator does not simply repeat six independent labels — it checks how their outputs agree, conflict and affect the final action.</p>
          </div>

          <div className="agent-system__explorer">
            <div className="agent-system__selector">
              <span className="method-label">SELECT AN AGENT</span>
              <JellyRadio
                items={AGENTS.map(agent => ({ value: agent.id, label: agent.code + ' ' + agent.short }))}
                value={activeAgent}
                onChange={value => setActiveAgent(value as AgentId)}
                chipColor="rgba(37, 53, 62, .88)"
                activeColor="#d8e6cf"
                textColor="#b7c7c0"
                activeTextColor="#172721"
                size="sm"
                gap={5}
                radius={9}
                swell={0.1}
                barge={3}
                ariaLabel="Choose one of the six DermaGuard agents"
              />
            </div>

            <div className="agent-detail" aria-live="polite">
              <div className="agent-detail__meta">
                <span>{activeAgentDetails.code} / 06</span>
                <span>AGENT OUTPUT CONTRACT</span>
              </div>
              <h3>{activeAgentDetails.name}</h3>
              <p>{activeAgentDetails.description}</p>
              <div className="agent-detail__outputs">
                <span className="method-label">REQUIRED DEMONSTRABLE OUTPUT</span>
                <ul>
                  {activeAgentDetails.outputs.map(output => <li key={output}><code>{output}</code></li>)}
                </ul>
              </div>
              <p className="agent-detail__guardrail">{activeAgentDetails.guardrail}</p>
            </div>
          </div>

          <div className="trace-example">
            <div className="trace-example__heading">
              <div>
                <p className="eyebrow"><span /> EXAMPLE FROM THE DAY 2 BRIEF</p>
                <h3>How evidence changes the decision.</h3>
              </div>
              <span className="trace-example__badge">ILLUSTRATIVE · NOT LIVE OUTPUT</span>
            </div>
            <div className="trace-table" role="table" aria-label="Illustrative six-agent decision trace">
              <div className="trace-row trace-row--header" role="row">
                <span role="columnheader">AGENT</span>
                <span role="columnheader">OUTPUT</span>
                <span role="columnheader">WHAT IT CONTRIBUTES</span>
              </div>
              <div className="trace-row" role="row">
                <strong>A1 · Quality</strong><b className="trace-status trace-status--pass">PASS</b><span>Image is usable.</span>
              </div>
              <div className="trace-row" role="row">
                <strong>A2 · Diagnosis</strong><b className="trace-status">NV · 0.73</b><span>Predicted class is melanocytic nevus.</span>
              </div>
              <div className="trace-row" role="row">
                <strong>A3 + A4 · Evidence</strong><b className="trace-status trace-status--caution">SUSPICIOUS</b><span>Lesion and context evidence raise concern.</span>
              </div>
              <div className="trace-row" role="row">
                <strong>A5 · Safety</strong><b className="trace-status trace-status--flag">SAFETY FLAG</b><span>Conflict detected; automatic triage is vetoed.</span>
              </div>
              <div className="trace-row trace-row--decision" role="row">
                <strong>A6 · Coordinator</strong><b className="trace-status trace-status--refer">REFER</b><span>Final disposition with traceable rationale.</span>
              </div>
            </div>
            <p className="trace-example__foot">The example demonstrates how a low-risk-looking class prediction can still lead to REFER when other agents identify concern.</p>
          </div>
        </section>

        <section className="triage-policy" aria-labelledby="triage-policy-title">
          <div className="triage-policy__heading">
            <p className="eyebrow"><span /> DOCUMENTED DECISION POLICY</p>
            <h2 id="triage-policy-title">Every image leaves with<br /><em>two outputs.</em></h2>
            <p>One predicted lesion class. One triage action. The action is determined from the combined agent evidence, not the diagnosis label alone.</p>
          </div>
          <div className="triage-policy__rules">
            <article className="triage-rule triage-rule--reimage">
              <span className="triage-rule__number">01</span>
              <h3>RE-IMAGE</h3>
              <p>Use when focus, illumination, glare, obstruction or other quality checks make the capture unreliable. Request a new image.</p>
            </article>
            <article className="triage-rule triage-rule--refer">
              <span className="triage-rule__number">02</span>
              <h3>REFER</h3>
              <p>Use when suspicion, uncertainty, disagreement or a Safety Agent veto makes automatic disposition unsafe.</p>
            </article>
            <article className="triage-rule triage-rule--auto">
              <span className="triage-rule__number">03</span>
              <h3>AUTO-TRIAGE</h3>
              <p>Use only when image quality and evidence are sufficiently reliable, the agent outputs are consistent, and no safety veto is raised.</p>
            </article>
          </div>
          <p className="triage-policy__note">A2 must still return a seven-class prediction for every image, including RE-IMAGE and REFER cases. These are prototype decision rules, not clinically validated thresholds.</p>
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

        <section className="submission-section" id="hidden-test" aria-labelledby="submission-title">
          <div className="submission-section__intro">
            <p className="eyebrow"><span /> HIDDEN-TEST RUN · 31 OCTOBER</p>
            <span className="submission-time">10:00 AM · 200 UNLABELLED IMAGES</span>
            <h2 id="submission-title">Finalise the model.<br /><em>Then run the hidden set.</em></h2>
            <p>Run the frozen six-agent system on every organiser-supplied image. Do not use hidden images for supervised retraining. Use the official image IDs and retain exactly one result row per image.</p>
          </div>
          <div className="submission-section__details">
            <div className="csv-schema">
              <div className="csv-schema__heading">
                <span className="method-label">FINAL CSV · EXACT COLUMN ORDER</span>
                <button type="button" className="csv-download" onClick={downloadCsvHeaderTemplate}>Download CSV header <span aria-hidden="true">↓</span></button>
              </div>
              <div className="csv-columns">
                <div><code>image_id</code><span>Official hidden-test image ID</span></div>
                <div><code>prediction</code><span>One of NV, MEL, BKL, BCC, AKIEC, VASC, DF</span></div>
                <div><code>decision</code><span>AUTO_TRIAGE, REFER or RE_IMAGE</span></div>
              </div>
              <p className="csv-schema__note">The download contains the header only. Add all 200 official image IDs and actual model outputs before submission. No true labels belong in the CSV.</p>
            </div>

            <div className="evaluation-report">
              <div className="evaluation-report__heading">
                <span className="method-label">DEMONSTRATION REPORT</span>
                <span className="evaluation-report__pending">Populate after hidden-test run</span>
              </div>
              <div className="evaluation-metrics">
                <span>Correct / incorrect AUTO-TRIAGE</span>
                <span>Number of REFER cases</span>
                <span>Number of RE-IMAGE cases</span>
                <span>Accuracy · Macro F1</span>
                <span>Confusion matrix</span>
                <span>Class-wise errors</span>
              </div>
            </div>
          </div>
          <p className="submission-section__foot">API endpoint and final deadline are organiser-supplied. Hidden-test images are for final evaluation only; keep the validation set for tuning before the model freeze.</p>
        </section>

        <footer className="site-footer">
          <span className="footer-brand">DermaGuard<span>®</span></span>
          <span>Research-led image review. Designed around clarity.</span>
          <span className="footer-disclaimer">NOT FOR CLINICAL DECISION-MAKING</span>
        </footer>


      </div>
      {isProcessing ? <ProcessingScreen stage={processingStage} /> : null}
      {workspaceVisible ? <MoonAssistant /> : null}
    </main>
  );
}
