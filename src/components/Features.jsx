import React from 'react'

export default function Features() {
  const features = [
    ['🔧', 'TCL-Based Scripting', 'Uses TCL files to interface with connected hardware, making embedded programming accessible and readable'],
    ['🪨', 'Set It and Forget It', 'Rock solid firmware that is stable through use'],
    ['📱', 'Simple Yet Powerful IDE', 'Built-in web-based development environment for quick, easy setup, coding, deployment, and updates'],
    ['🔌', 'Rich Hardware Support', 'Comprehensive GPIO, PWM, ADC, I2C, and sensor modules for various hardware components'],
    ['⚡', 'Real-time Control', 'Event-driven programming with callbacks for responsive IoT applications'],
    ['🌐', 'WiFi & MQTT Ready', 'Built-in WiFi configuration and MQTT support for connected IoT applications'],
  ];

  return (
    <section id="features" className="bg-white py-16">
      <div className="mx-auto max-w-[1200px] px-5">
        <h2 className="mb-12 text-center text-3xl font-bold text-[#333]">Key Features</h2>
        <div className="mt-12 grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-8">
          {features.map(([icon, title, description]) => (
            <div key={title} className="rounded-[15px] border border-[#e9ecef] bg-[#f8f9fa] p-8 text-center transition duration-300 hover:-translate-y-[5px] hover:shadow-[0_10px_30px_rgba(0,0,0,0.1)]">
              <div className="mb-4 text-5xl text-[#667eea]">{icon}</div>
              <h3 className="mb-4 text-xl font-bold text-[#333]">{title}</h3>
              <p className="leading-relaxed text-[#666]">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
