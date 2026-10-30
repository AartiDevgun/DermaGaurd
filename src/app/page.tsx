const stages = [
  {
    number: "01",
    title: "Image quality",
    detail:
      "The first stage checks focus, illumination, glare and obstruction before any lesion-pattern analysis begins."
  },
  {
    number: "02",
    title: "Decision gate",
    detail:
      "Image usability findings determine whether the image can continue or should be captured again."
  },
  {
    number: "03",
    title: "Pattern assessment",
    detail:
      "Accepted images are evaluated across seven lesion categories, with the result presented as screening support."
  }
];

export default function HomePage() {
  return (
    <main className="site-shell">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="DermaGuard home">
          <span className="brand-mark" aria-hidden="true">
            <span>D</span>
            <span>G</span>
            <i />
          </span>
          <span className="brand-copy">
            <strong>DermaGuard</strong>
            <small>EARLY DETECTION. BETTER OUTCOMES.</small>
          </span>
        </a>

        <nav className="main-nav" aria-label="Main navigation">
          <a href="#workflow">THE METHOD</a>
          <a href="#principles">OUR PRINCIPLES</a>
        </nav>

        <a className="header-link" href="#workflow">
          Explore the method <span aria-hidden="true">↗</span>
        </a>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="eyebrow-light" />
            DERMOSCOPIC IMAGE SCREENING <span className="eyebrow-divider">/</span> RESEARCH PROJECT
          </p>

          <h1>
            A closer look.
            <br />
            <span>A clearer next step.</span>
          </h1>

          <p className="hero-description">
            DermaGuard is being developed as a two-stage image screening system:
            first assessing image quality, then evaluating lesion patterns across
            seven categories.
          </p>

          <div className="hero-actions">
            <a className="text-action" href="#workflow">
              <span>Discover the method</span>
              <span className="action-arrow" aria-hidden="true">↗</span>
            </a>
            <span className="build-status">
              <i aria-hidden="true" />
              MODEL UNDER EVALUATION
            </span>
          </div>

          <div className="hero-footnote">
            <span>01 / 02</span>
            <span>QUALITY BEFORE CLASSIFICATION</span>
          </div>
        </div>

        <div className="hero-art" aria-label="Abstract illustration of a layered optical field">
          <div className="art-caption art-caption--top">
            <span>FIG. 01</span>
            <span>OPTICAL FIELD STUDY</span>
          </div>
          <div className="optical-field" aria-hidden="true">
            <div className="optical-halo optical-halo--outer" />
            <div className="optical-halo optical-halo--middle" />
            <div className="optical-halo optical-halo--inner" />
            <div className="optical-axis optical-axis--horizontal" />
            <div className="optical-axis optical-axis--vertical" />
            <div className="optical-core">
              <span className="core-letter core-letter--d">D</span>
              <span className="core-letter core-letter--g">G</span>
              <i className="core-spark" />
            </div>
            <span className="orbit-point orbit-point--one" />
            <span className="orbit-point orbit-point--two" />
            <span className="orbit-point orbit-point--three" />
          </div>
          <div className="art-caption art-caption--bottom">
            <span>IMAGE-LED</span>
            <span>HUMAN-CENTRED</span>
            <span>RESEARCH</span>
          </div>
        </div>
      </section>

      <section className="signal-strip" aria-label="Project structure">
        <div>
          <span className="signal-value">02</span>
          <span className="signal-label">TASK AGENTS</span>
        </div>
        <div>
          <span className="signal-value">07</span>
          <span className="signal-label">LESION CLASSES</span>
        </div>
        <div>
          <span className="signal-value">01</span>
          <span className="signal-label">TRANSPARENT DECISION LAYER</span>
        </div>
        <p>Designed to assess the image before interpreting the pattern.</p>
      </section>

      <section className="workflow-section" id="workflow">
        <div className="section-heading">
          <p className="eyebrow">THE APPROACH <span className="eyebrow-divider">/</span> TWO AGENTS, ONE REVIEW</p>
          <h2>
            Every result begins
            <br />
            <span>with image quality.</span>
          </h2>
          <p className="section-intro">
            A structured sequence keeps image usability, model output and the
            final screening decision distinct and reviewable.
          </p>
        </div>

        <div className="stage-list">
          {stages.map((stage) => (
            <article className="stage-row" key={stage.number}>
              <span className="stage-number">{stage.number}</span>
              <h3>{stage.title}</h3>
              <p>{stage.detail}</p>
              <span className="stage-mark" aria-hidden="true">↗</span>
            </article>
          ))}
        </div>
      </section>

      <section className="principles-section" id="principles">
        <div>
          <p className="eyebrow">A NOTE ON USE <span className="eyebrow-divider">/</span> RESPONSIBLE SCREENING</p>
          <h2>Support for a decision.<br /><span>Never a substitute for care.</span></h2>
        </div>
        <p>
          DermaGuard is a research prototype for image screening and triage
          support. It does not provide a definitive diagnosis, rule out disease,
          or replace assessment by a qualified healthcare professional.
        </p>
      </section>

      <footer className="site-footer">
        <a className="footer-brand" href="#top">DG <span>DERMAGUARD</span></a>
        <span>BUILT AROUND IMAGE QUALITY, TRANSPARENCY AND CARE.</span>
        <a href="#top">BACK TO TOP ↑</a>
      </footer>
    </main>
  );
}
