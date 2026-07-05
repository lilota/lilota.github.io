import React from 'react'

export default function Hero() {
  const buttonClass = 'mx-2 my-2 inline-block rounded-full bg-white px-8 py-4 text-[1.1rem] font-semibold text-[#667eea] no-underline shadow-[0_4px_15px_rgba(0,0,0,0.2)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.3)]';

  return (
    <section className="py-16 text-center text-white">
      <div className="mx-auto max-w-[1200px] px-5">
        <h1 className="mb-4 text-4xl font-bold md:text-[3.5rem]">
          <img alt="Lilota Logo" src="/imgsrc/Lilota_Logo-Alt.png" className="mx-auto h-[100px] w-auto" />
        </h1>
        <p className="mx-auto mb-8 max-w-4xl text-xl opacity-90 md:text-[1.3rem]">Open source embedded systems firmware for microcontrollers using TCL for IoT home automation</p>
        <div className="flex flex-wrap justify-center">
          <a href="#documentation" className={buttonClass}>Get Started</a>
          <a href="/flash" className={buttonClass}>Flash Lilota</a>
          <a href="/ide" className={buttonClass}>Try IDE</a>
          <a href="https://github.com/COMPAS-Lab/lilota" className={buttonClass} target="_blank" rel="noreferrer">View on GitHub</a>
        </div>
      </div>
    </section>
  )
}
