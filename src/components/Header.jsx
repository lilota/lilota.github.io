export default function Header() {
  return (
    <header>
      <div className="container">
        <div className="header-content">
          <a href="#" className="logo">
            <img alt="Lilota Logo" src="/imgsrc/Lilota_Logo.png" height="40" />
          </a>
          <nav>
            <ul className="nav-links">
              <li><a href="#features">Features</a></li>
              <li><a href="#platforms">Platforms</a></li>
              <li><a href="#documentation">Documentation</a></li>
              <li><a href="/flash">Flash</a></li>
              <li><a href="/ide">IDE</a></li>
              <li><a href="https://github.com/COMPAS-Lab/lilota" target="_blank" rel="noreferrer">GitHub</a></li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  )
}