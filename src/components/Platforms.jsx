import React from 'react'

export default function Platforms() {
  const platforms = [
    {
      name: 'ESP32',
      image: '/imgsrc/esp32chipimage.webp',
      alt: 'ESP32 chip',
      summary: 'Full support for ESP32 series with WiFi and Bluetooth capabilities',
      details: 'The ESP32 is a powerful, feature-rich microcontroller with integrated WiFi and Bluetooth. Ideal for IoT, automation, and sensor projects. Supports dual-core processing, low-power modes, and a wide range of peripherals.',
    },
    {
      name: 'ESP8266',
      image: '/imgsrc/esp8266chipimage.jpg',
      alt: 'ESP8266 chip',
      summary: 'Compatible with ESP8266 for cost-effective WiFi-enabled projects',
      details: 'The ESP8266 is a low-cost WiFi microchip with full TCP/IP stack and microcontroller capability. Perfect for simple IoT devices, smart sensors, and home automation on a budget.',
    },
    {
      name: 'Raspberry Pi Pico',
      image: '/imgsrc/rp2040chipimage.jpg',
      alt: 'RP2040 chip',
      summary: 'Native support for RP2040-based boards with dual-core processing',
      details: 'The Raspberry Pi Pico (RP2040) features a dual-core ARM Cortex-M0+ processor, flexible I/O, and robust performance for advanced embedded applications. Great for education, prototyping, and real-time control.',
    },
  ];

  return (
    <section id="platforms" className="bg-[#f8f9fa] py-16">
      <div className="mx-auto max-w-[1200px] px-5">
        <h2 className="mb-12 text-center text-3xl font-bold text-[#333]">Supported Microcontrollers</h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-8">
          {platforms.map((platform) => (
            <div key={platform.name} tabIndex="0" className="group relative max-h-[220px] overflow-hidden rounded-[15px] bg-white p-8 text-center shadow-[0_5px_15px_rgba(0,0,0,0.1)] transition-[transform,max-height,box-shadow] duration-300 focus:z-10 focus:max-h-[500px] focus:scale-105 focus:-translate-y-[5px] focus:shadow-[0_12px_32px_rgba(0,0,0,0.15)] focus:outline-none hover:z-10 hover:max-h-[500px] hover:scale-105 hover:-translate-y-[5px] hover:shadow-[0_12px_32px_rgba(0,0,0,0.15)]">
              <img className="mx-auto mb-4 block h-20 w-20 object-contain" src={platform.image} alt={platform.alt} />
              <h3 className="mb-4 text-xl font-bold text-[#333]">{platform.name}</h3>
              <p className="text-[#333] transition-opacity duration-300 group-focus:opacity-20 group-hover:opacity-20">{platform.summary}</p>
              <div className="max-h-0 overflow-hidden opacity-0 transition-[opacity,max-height,margin] duration-500 group-focus:mt-4 group-focus:max-h-[300px] group-focus:opacity-100 group-hover:mt-4 group-hover:max-h-[300px] group-hover:opacity-100">
                <p>{platform.details}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
