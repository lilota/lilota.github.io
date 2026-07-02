import React from 'react'

export default function Features() {
  return (
    <section id="features" className="features">
      <div className="container">
        <h2 className="section-title">Key Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔧</div>
            <h3>TCL-Based Scripting</h3>
            <p>Uses TCL files to interface with connected hardware, making embedded programming accessible and readable</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🪨</div>
            <h3>Set It and Forget It</h3>
            <p>Rock solid firmware that is stable through use</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Simple Yet Powerful IDE</h3>
            <p>Built-in web-based development environment for quick, easy setup, coding, deployment, and updates</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔌</div>
            <h3>Rich Hardware Support</h3>
            <p>Comprehensive GPIO, PWM, ADC, I2C, and sensor modules for various hardware components</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Real-time Control</h3>
            <p>Event-driven programming with callbacks for responsive IoT applications</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌐</div>
            <h3>WiFi & MQTT Ready</h3>
            <p>Built-in WiFi configuration and MQTT support for connected IoT applications</p>
          </div>
        </div>
      </div>
    </section>
  )
}