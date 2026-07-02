export default function Hero() {
  return (
    <section className="hero">
      <div className="container">
        <h1><img alt="Lilota Logo" src="/imgsrc/Lilota_Logo-Alt.png" height="100" /></h1>
        <p>Open source embedded systems firmware for microcontrollers using TCL for IoT home automation</p>
        <a href="#documentation" className="cta-button">Get Started</a>
        <a href="/flash" className="cta-button">Flash Lilota</a>
        <a href="/ide" className="cta-button">Try IDE</a>
        <a href="https://github.com/COMPAS-Lab/lilota" className="cta-button" target="_blank" rel="noreferrer">View on GitHub</a>
      </div>
    </section>
  )
}