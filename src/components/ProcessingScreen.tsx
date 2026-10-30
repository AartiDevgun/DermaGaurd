'use client';

import dynamic from 'next/dynamic';

const LightTunnel = dynamic(() => import('@/components/react-bits/LightTunnel'), { ssr: false });
const LatticeLoader = dynamic(() => import('@/components/react-bits/LatticeLoader'), { ssr: false });

export default function ProcessingScreen({ stage }: { stage?: string }) {
  return (
    <section className="processing-screen" role="status" aria-live="polite" aria-label="DermaGuard analysis in progress">
      <div className="processing-screen__tunnel" aria-hidden="true">
        <LightTunnel
          cableColor="#7fc8ad"
          pulseColor="#f0d89a"
          tunnelColor="#235b56"
          tunnelOpacity={0.12}
          speed={0.11}
          pulseSpeed={1.35}
          cableCount={42}
          thickness={0.6}
          glow={0.55}
          brightness={0.82}
          mouseInteraction={false}
          clickSurge={false}
          intro={false}
        />
      </div>
      <div className="processing-screen__content">
        <span className="processing-screen__eyebrow">DERMAGUARD · SIX-AGENT REVIEW</span>
        <LatticeLoader
          label={stage || 'Coordinating agent outputs'}
          doneLabel="Review complete"
          status="working"
          pattern="orbit"
          grid={3}
          color="#d8e8ce"
          glow
          glowColor="#75b99b"
          showTimer
          fontSize={11}
          cellSize={10}
          gap={4}
        />
        <h2>Following the evidence.</h2>
        <p>Image quality, classification, lesion features, context and safety are being brought together into one traceable decision.</p>
        <span className="processing-screen__foot">Keep this window open while the analysis runs.</span>
      </div>
    </section>
  );
}
