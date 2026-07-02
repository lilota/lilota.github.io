import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Hero from './components/Hero'
import Features from './components/Features'
import Platforms from './components/Platforms'
import Documentation from './components/Documentation'
import Footer from './components/Footer'
import Flash from './components/Flash'
import Ide from './components/Ide'

// We extract the landing page into its own component for clean routing
function LandingPage() {
  return (
    <React.Fragment>
      <Hero />
      <Features />
      <Platforms />
      <Documentation />
    </React.Fragment>
  )
}

function App() {
  return (
    <Router>
      {/* Header and Footer stay outside Routes so they appear on every page */}
      <Header />
      
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/flash" element={<Flash />} />
        <Route path="/ide" element={<Ide />} />
      </Routes>

      <Footer />
    </Router>
  )
}

export default App