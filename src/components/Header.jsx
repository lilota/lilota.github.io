import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Header() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  // Shared button style for nav links
  const linkStyle = {
    padding: '8px 16px',
    textDecoration: 'none',
    color: '#333',
    fontWeight: '900',
    borderRadius: '6px',
    transition: 'all 0.2s ease-in-out',
    fontSize: '22px',
  };

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 1000, background: 'white', borderBottom: '1px solid #ddd' }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '80px' }}>
          
          <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
            {/* Increased logo size to 50px */}
            <img alt="Lilota Logo" src="/imgsrc/Lilota_Logo.png" height="50" style={{ display: 'block' }} />
          </Link>

          <nav>
            <ul style={{ display: 'flex', gap: '10px', listStyle: 'none', margin: 0, padding: 0 }}>
              {[
                { name: 'Home', path: '/' },
                { name: 'Flash', path: '/flash' },
                { name: 'IDE', path: '/ide' }
              ].map((item) => (
                <li key={item.path}>
                  <Link 
                    to={item.path} 
                    style={linkStyle}
                    onMouseOver={(e) => {
                      e.target.style.background = '#f0f0f0';
                      e.target.style.color = '#000';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.background = 'transparent';
                      e.target.style.color = '#333';
                    }}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
              <li>
                <a 
                  href="https://github.com/COMPAS-Lab/lilota" 
                  target="_blank" 
                  rel="noreferrer"
                  style={linkStyle}
                  onMouseOver={(e) => { e.target.style.background = '#333'; e.target.style.color = '#fff'; }}
                  onMouseOut={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#333'; }}
                >
                  GitHub
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}