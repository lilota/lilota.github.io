import React from 'react';

export default function Flash() {
  return (
    <section className="px-5 py-10 text-white md:py-14">
      <div className="mx-auto grid max-w-[960px] items-center gap-8 md:grid-cols-[1fr_360px]">
        <div>
          <p className="mb-3 text-sm font-bold uppercase tracking-wide text-white/75">Web flasher</p>
          <h1 className="text-4xl font-bold leading-tight md:text-5xl">Flash Lilota Firmware</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/90">
            Connect your ESP32 with a USB data cable, then launch the installer to write the Lilota firmware directly from your browser.
          </p>

          <div className="mt-6 grid gap-3 text-sm text-white/85 sm:grid-cols-3">
            <div className="border-l-2 border-white/35 pl-3">Use Chrome or Edge</div>
            <div className="border-l-2 border-white/35 pl-3">Select the USB serial port</div>
            <div className="border-l-2 border-white/35 pl-3">Keep the device connected</div>
          </div>
        </div>

        <div className="installer-panel rounded-lg border border-white/20 bg-white/95 p-6 text-left text-[#333] shadow-[0_18px_45px_rgba(22,34,78,0.25)] backdrop-blur">
          <h2 className="text-xl font-bold text-[#26345f]">Ready to install</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#56627a]">
            The installer will guide you through choosing the port and flashing the firmware image.
          </p>
          <div className="mt-5 text-center">
            <esp-web-install-button manifest="/flash/manifest.json"></esp-web-install-button>
          </div>
        </div>
      </div>
    </section>
  );
}
