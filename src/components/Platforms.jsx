export default function Platforms() {
  return (
    <section id="platforms" className="platforms">
      <div className="container">
        <h2>Supported Microcontrollers</h2>
        <div className="platform-grid">
          <div className="platform-card" tabIndex="0">
            <img className="platform-image" src="/imgsrc/esp32chipimage.webp" alt="ESP32 chip" />
            <h3>ESP32</h3>
            <p className="platform-summary">Full support for ESP32 series with WiFi and Bluetooth capabilities</p>
            <div className="platform-details">
              <p>The ESP32 is a powerful, feature-rich microcontroller with integrated WiFi and Bluetooth. Ideal for IoT, automation, and sensor projects. Supports dual-core processing, low-power modes, and a wide range of peripherals.</p>
            </div>
          </div>
          <div className="platform-card" tabIndex="0">
            <img className="platform-image" src="/imgsrc/esp8266chipimage.jpg" alt="ESP8266 chip" />
            <h3>ESP8266</h3>
            <p className="platform-summary">Compatible with ESP8266 for cost-effective WiFi-enabled projects</p>
            <div className="platform-details">
              <p>The ESP8266 is a low-cost WiFi microchip with full TCP/IP stack and microcontroller capability. Perfect for simple IoT devices, smart sensors, and home automation on a budget.</p>
            </div>
          </div>
          <div className="platform-card" tabIndex="0">
            <img className="platform-image" src="/imgsrc/rp2040chipimage.jpg" alt="RP2040 chip" />
            <h3>Raspberry Pi Pico</h3>
            <p className="platform-summary">Native support for RP2040-based boards with dual-core processing</p>
            <div className="platform-details">
              <p>The Raspberry Pi Pico (RP2040) features a dual-core ARM Cortex-M0+ processor, flexible I/O, and robust performance for advanced embedded applications. Great for education, prototyping, and real-time control.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}