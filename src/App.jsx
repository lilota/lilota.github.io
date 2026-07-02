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

function LandingPage() {
  return (
    <>
      <Hero />
      <Features />
      <Platforms />
      <Documentation />
      <Footer />
    </>
  )
}

function App() {
  return (
    <Router>
      <Header />
      {/* The main tag ensures the content always sits properly below the header */}
      <main style={{ minHeight: 'calc(100vh - 70px)' }}> 
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/flash" element={<Flash />} />
          <Route path="/ide" element={<Ide />} />
        </Routes>
      </main>
    </Router>
  )
}

export default App