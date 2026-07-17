export function HeroOverlay() {
  return (
    <div className="hero-overlay">
      <div className="hero-scrim" aria-hidden="true" />
      <div className="hero-copy">
        <p className="hero-eyebrow">Weather Capital</p>
        <h1 className="hero-wordmark">
          Weather
          <br />
          Capital
        </h1>
        <p className="hero-tagline">Something is forming on the horizon.</p>
        <p className="hero-coming-soon">Coming soon</p>
      </div>
      <div className="hero-scroll-hint" aria-hidden="true">
        <span />
        Scroll
      </div>
      <footer className="hero-footer">
        <span>&copy; {new Date().getFullYear()} Weather Capital</span>
        <a href="mailto:hello@weathercapital.com">hello@weathercapital.com</a>
      </footer>
    </div>
  );
}
