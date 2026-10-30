'use client';

import dynamic from 'next/dynamic';

const LightTunnel = dynamic(() => import('@/components/react-bits/LightTunnel'), { ssr: false });
const LatticeLoader = dynamic(() => import('@/components/react-bits/LatticeLoader'), { ssr: false });

const AGENT_STAGES = [
  { id: 'quality', label: 'Image Quality Agent', matches: ['quality', 'image-quality', 'a1'] },
  { id: 'diagnosis', label: 'Diagnosis Agent', matches: ['diagnosis', 'classification', 'a2'] },
  { id: 'lesion', label: 'Lesion Analysis Agent', matches: ['lesion', 'morphology', 'a3'] },
  { id: 'context', label: 'Context Agent', matches: ['context', 'patient', 'a4'] },
  { id: 'safety', label: 'Safety Agent', matches: ['safety', 'a5'] },
  { id: 'coordinator', label: 'Coordinator Agent', matches: ['coordinator', 'decision', 'a6'] }
] as const;

export default function ProcessingScreen({ stage }: { stage?: string }) {
  const normalized = (stage ?? '').toLowerCase();
  const isPreparing = !normalized || normalized.includes('prepar') || normalized.includes('upload');
  const activeIndex = isPreparing
    ? -1
    : AGENT_STAGES.findIndex(item => item.matches.some(match => normalized.includes(match)));
  const current = activeIndex >= 0 ? AGENT_STAGES[activeIndex].label : 'Preparing image';

  return (
    <section
      className="processing-screen"
      role="status"
      aria-live="polite"
      aria-label={isPreparing ? 'Preparing the selected image' : 'DermaGuard agent review in progress'}
    >
      <div className="processing-screen__tunnel" aria-hidden="true">
        <LightTunnel
          cableColor="#39bff4"
          pulseColor="#b7e3ff"
          tunnelColor="#07527d"
          tunnelOpacity={0.16}
          speed={0.11}
          pulseSpeed={1.35}
          cableCount={42}
          thickness={0.6}
          glow={0.72}
          brightness={0.95}
          mouseInteraction={false}
          clickSurge={false}
          intro={false}
        />
      </div>
      <div className="processing-screen__content">
        <span className="processing-screen__eyebrow">
          {isPreparing ? 'DERMAGUARD · IMAGE PREPARATION' : 'DERMAGUARD · AGENT HAND-OFF'}
        </span>
        <LatticeLoader
          label={isPreparing ? 'Preparing image for review' : current + ' · thinking'}
          doneLabel="Stage complete"
          status="working"
          pattern="orbit"
          grid={3}
          color="#b7e3ff"
          glow
          glowColor="#39c9df"
          showTimer
          fontSize={13}
          cellSize={11}
          gap={5}
        />
        <h2>{isPreparing ? 'Getting your image ready.' : 'Following the evidence.'}</h2>
        <p>
          {isPreparing
            ? 'Checking the selected file and preparing its local preview. This step does not run the lesion analysis.'
            : 'The active agent is working on its part of the review. The next stage appears when the current agent reports completion.'}
        </p>
        {!isPreparing ? (
          <ol className="processing-screen__steps" aria-label="Agent review stages">
            {AGENT_STAGES.map((agent, index) => (
              <li
                key={agent.id}
                data-state={index < activeIndex ? 'complete' : index === activeIndex ? 'active' : 'waiting'}
              >
                <span>{String(index + 1).padStart(2, '0')}</span>
                <span>{agent.label}</span>
              </li>
            ))}
          </ol>
        ) : null}
        <span className="processing-screen__foot">
          {isPreparing
            ? 'Local preview only · analysis service not connected'
            : 'Stage labels follow actual agent-processing events.'}
        </span>
      </div>
    </section>
  );
}
