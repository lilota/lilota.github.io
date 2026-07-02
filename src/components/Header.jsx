import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Header() {
  const location = useLocation();
  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Flash', path: '/flash' },
    { name: 'IDE', path: '/ide' },
  ];

  return (
    <header className="sticky top-0 z-[1000] border-b border-[#ddd] bg-white">
      <div className="mx-auto max-w-[1200px] px-5">
        <div className="flex h-20 items-center justify-between">
          <Link to="/" className="flex items-center">
            <img alt="Lilota Logo" src="/imgsrc/Lilota_Logo.png" className="block h-[50px] w-auto" />
          </Link>

          <nav>
            <ul className="hidden items-center gap-2.5 md:flex">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`rounded-md px-4 py-2 text-[22px] font-black no-underline transition-colors duration-200 ${
                      location.pathname === item.path ? 'bg-[#f0f0f0] text-black' : 'text-[#333] hover:bg-[#f0f0f0] hover:text-black'
                    }`}
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
                  className="rounded-md px-4 py-2 text-[22px] font-black text-[#333] no-underline transition-colors duration-200 hover:bg-[#333] hover:text-white"
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
